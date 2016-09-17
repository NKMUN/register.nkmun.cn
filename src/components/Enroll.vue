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
                  :disabled="disabled"
                ></input>
                <span class="hint"></span>
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
                      :disabled="disabled"
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
                  :disabled="disabled"
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
            :disabled="!test && ($prereg.invalid || disabled)"
            @click.prevent="!disabled ? submit() : nop()"
          >提交
          </button>
        </form>
      </validator>
    </div>

    <overlay-modal v-if="success" class="modal-success">
      <h3 slot="caption">预报名成功</h3>
      <p slot="content">
        组委已收到您提交的报名表，将于审核后通过邮件向您通知学测结果以及后续事项，请静候佳音。
      </p>
      <div slot="button">
        <button @click.prevent="$router.replace('/')">返回主页</button>
      </div>
    </overlay-modal>

    <overlay-modal v-if="error" class="modal-error">
      <h3 slot="caption">看上去有哪里出错了</h3>
      <div slot="content">
        <p>{{error}}</p>
      </div>
      <div slot="button">
        <button @click.prevent="error = null">关闭</button>
      </button>
    </overlay-modal>
  </div>
</template>

<script>
  import getResponseMessage from '../lib/guess-response-message'
  import FORM from '../def/enroll-form'
  import validators from '../lib/validators'
  import TEST_FLAG from '../directives/test-flag'
  import { forgetForm, storeForm, restoreForm, resetForm } from '../lib/vue-persistent-form'
  import OverlayModal from './OverlayModal'

  export default {
    components: {
      'overlay-modal': OverlayModal
    },
    validators,
    created() {    // bind private, non-reactive data
      this.test = TEST_FLAG // debug flag
      this.form = FORM      // form generation data
      this.SIG = 'enroll_'  // form signature
      this.clear = false    // clear store flag
    },
    data() {
      return {
        busy: false,
        success: false,
        error: null
      }
    },
    computed: {
      disabled() {
        return this.busy || this.success || this.error
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
          this.success = true
        })
        .catch( (res) => {
          this.busy = false
          switch (res.status) {
            case 409:
              this.error = '409 / 不能重复预注册'
            break
            default:
              this.error = `${res.status} / ${getResponseMessage(res)}`
            break
          }
        })
      },
    },
    ready() {
      this.restoreForm()
    },
    beforeDestroy() {
      if (this.success) {
        this.resetForm()
        this.forgetForm()
      }else{
        this.storeForm()
      }
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
    background: url("../assets/images/form_background.jpg") no-repeat fixed top
    background-size: 100% 100%
    .form-area
      width: 80%
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
    .modal-success
      text-align: center
      p
        text-indent: 2em
        text-align: justify
        margin-bottom: 35px
      button
        cursor: pointer
        width: 120px
        height: 35px
        border-radius: 10px
        border: 1px solid #52abf3
        background-color: #52abf3
        color: #fff
        font-size: 14px
    .modal-error
      text-align: center
      p
        text-align: center
        margin-bottom: 35px
      button
        cursor: pointer
        width: 120px
        height: 35px
        border-radius: 10px
        border: 1px solid #52abf3
        background-color: #52abf3
        color: #fff
        font-size: 14px
</style>
