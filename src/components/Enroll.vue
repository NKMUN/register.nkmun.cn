<template>
  <div :busy="busy" class="container enroll">
    <div class="form-area">
      <h2>2017汇文国际中学生模拟联合国大会预报名</h2>

      <div class="disclaimer">
        <h4 class="heading illustration">特别说明</h4>
        <p>
          1、本报名表适用对象为全国各高中学校模联社团学生负责人；<br>
          2、报名表提交截止日期为北京时间2016年10月17日（含）；<br>
          3、本报名表所有填写框内除注明英文的选项外，请使用中文填写；<br>
          4、如在填写报名表中出现任何问题或疑问，请发送邮件至2017@nkmun.cn咨询；<br>
          5、本报名表最终解释权归本次大会组委会所有。<br>
        </p>
      </div>

      <validator name='prereg'>
        <form id="enroll" v-el:form novalidate autocomplete="on">

          <div class="section {{$.class}}" v-for="$ in form">

            <h4 class="heading {{$.class}}">{{$.section}}</h4>

            <div :class="{ field: _.dbId }" v-for="_ in $.fields">
              <label v-if="_.tag === 'input'" :for="_.dbId">
                <span class="field-name">{{_.name}}</span>
                <input
                  :type="_.type || 'text'"
                  :name="_.dbId"
                  :field="_.dbId"
                  :placeholder="_.placeholder"
                  v-validate="_.validate"
                  :disabled="busy"
                ></input>
              </label>

              <label v-if="_.tag === 'radio'">
                <span class="field-name">{{_.name}}</span>
                <div class="radio-group">
                  <label class="radio-options" v-for="r in _.opts">
                    <input
                      type="radio"
                      :name="_.dbId"
                      :field="_.dbId"
                      :value="r.val"
                      v-validate="_.validate"
                      :disabled="busy"
                    ></input>
                    {{r.text}}
                  </label>
                </div>
              </label>

              <template v-if="_.tag === 'textarea'">
                <textarea
                  :name="_.dbId"
                  :field="_.dbId"
                  :placeholder="_.placeholder"
                  v-validate="_.validate"
                  :disabled="busy"
                  cols="100"
                  rows="8"
                ></textarea>
              </template>

              <p v-if="_.tag === 'p'" :class="_.className">{{_.text}}</p>

              {{{ _.html }}}
            </div>
          </div>

          <button
            class="submit-btn"
            :disabled="!test && ($prereg.invalid || busy)"
            :busy="busy"
            @click.prevent="!busy ? submit() : nop()"
          >提交
          </button>
        </form>
      </validator>
    </div>
  </div>
</template>

<script>
  import getResponseMessage from '../lib/guess-response-message'
  import FORM from '../def/enroll-form'
  import validators from '../lib/validators'
  import TEST_FLAG from '../directives/test-flag'
  import { forgetForm, storeForm, restoreForm, resetForm } from '../lib/vue-persistent-form'

  export default {
    validators,
    created() {    // bind private, non-reactive data
      this.test = TEST_FLAG // debug flag
      this.form = FORM      // form generation data
      this.SIG = 'enroll_'  // form signature
      this.clear = false    // clear store flag
    },
    data() {
      return {
        busy: false
      }
    },
    methods: {
      nop() {},
      forgetForm, storeForm, restoreForm, resetForm,
      submit() {
        this.busy = true
        this.$http.post('enroll', new FormData(this.$els.form))
        .then( (res) => {
          this.busy = false
          this.resetForm()
          this.forgetForm()
          this.$router.replace('/enroll/success')
        })
        .catch( (res) => {
          this.busy = false
          switch (res.status) {
            case 409:
              this.$router.go({ path: '/generic-failure', query: {status: res.status, message: '不能重复预注册'} })
            break
            default:
              this.$router.go({ path: '/generic-failure', query: {status: res.status, message: getResponseMessage(res)} })
            break
          }
        })
      },
    },
    ready() {
      this.restoreForm()
    },
    beforeDestroy() {
      this.storeForm()
    }
  }
</script>

<style lang="stylus">
  @import "../styles/form";
  @import "../styles/busy";

  .container.enroll
    font-size: 14px
    position: relative
    height: 100%
    width: 100%
    padding: 100px 0
    background: url("../assets/form_background.jpg") no-repeat fixed top
    background-size: 100% 100%
    .form-area
      width: 1200px;
      margin: auto
      text-align: center
      border: 1px solid #fff
      background-color: rgba(255,255,255,0.8)
      box-shadow: 5px -5px 5px #00000075
      .illustration
        text-align: left
        padding-left: 100px
      .disclaimer
        p
          text-align: left
          padding-left: 100px
    form
      .section.ac-test
        .topic
          opacity: .5
        .topic, .question
          text-align: left
          padding: 0 100px
</style>
