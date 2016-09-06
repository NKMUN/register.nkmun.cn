<template>
  <div :busy="busy" class="container">
    <h3>报名</h3>

    <div class="disclaimer">
      <h4 class="heading">特别说明</h4>
      <p>
        1、本报名表适用对象为全国各高中学校模联社团学生负责人；<br>
        2、报名表提交截止日期为北京时间2016年10月17日（含）；<br>
        3、本报名表所有填写框内除注明英文的选项外，请使用中文填写；<br>
        4、如在填写报名表中出现任何问题或疑问，请发送邮件至2017@nkmun.cn咨询；<br>
        5、本报名表最终解释权归本次大会组委会所有。<br>
      </p>
    </div>

    <validator name='prereg'>
      <form id="enroll" v-el:form novalidate autocomplete="on" enctype="application/x-www-form-urlencoded">

        <div class="section {{$.class}}" v-for="$ in form">

          <h4 class="heading {{$.class}}">{{$.section}}</h4>

          <div class="field {{_.dbId}}" v-for="_ in $.fields">
            <label v-if="_.tag === 'input'" :for="_.dbId">
              <span class="field-name">{{_.name}}</span>
              <input
                :type="_.type"
                :name="_.dbId"
                :field="_.dbId"
                :placeholder="_.placeholder"
                v-validate="_.validate"
                :disabled="busy"
                class="text-input"
              ></input>
            </label>

            <label v-if="_.tag === 'radio'">
              <span class="field-name">{{_.name}}</span>
              <label v-for="r in _.opts">
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
            </label>

            <template v-if="_.tag === 'textarea'">
              <textarea
                :name="_.dbId"
                :field="_.dbId"
                :placeholder="_.placeholder"
                v-validate="_.validate"
                :disabled="busy"
                cols="100"
                rows="15"
              ></textarea>
            </template>

            <p v-if="_.tag === 'p'">{{_.text}}</p>

            {{{ _.html }}}
          </div>
        </div>

        <button
          :disabled=" !test && ($prereg.invalid || busy)"
          :busy="busy"
          @click.prevent="!busy ? submit() : nop()"
        >提交
        </button>
      </form>
    </validator>
  </div>
</template>

<script>
  import getResponseMessage from '../lib/guess-response-message'
  import EmailRegex from 'email-regex'
  import FORM from '../def/enroll-form'
  const re_email = EmailRegex({exact: 'true'})
  const re_en_name = /[a-zA-Z0-9_\- .,]/

  export default {
    validators: {
      phone(str) {
        return /1[34578]\d{9}/.test(str)
      },
      email(str) {
        return re_email.test(str)
      },
      enName(str) {
        return re_en_name.test(str)
      }
    },
    data() {
      return {
        SIG: 'enroll_',   // form signature
        // test: true,    // debug flag
        busy: false,
        form: FORM,
        clear: false      // clear store flag
      }
    },
    methods: {
      nop() {},
      submit() {
        this.busy = true
        this.$http.post('enroll', new FormData(this.$els.form))
        .then( (res) => {
          this.busy = false
          this.$els.form.reset()
          this.clearStore()
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
      getStore() {
        let store = window.localStorage
        if (store)
          return store
        else
          return {    // no-op store
            getItem() { return null },
            setItem() {},
            removeItem() {}
          }
      },
      getFields() {
        return Array.prototype.slice.call( this.$els.form.querySelectorAll('input, textarea') )
               .map( $ => $.id || $.name || $.field )
      },
      clearStore() {
        this.clear = true
        let store = this.getStore()
        this.getFields()
        .forEach( key => store.removeItem(this.SIG + key) )
      },
      storeForm() {
        if (this.clear)
          return false
        let form = this.$els.form
        let store = this.getStore()
        this.getFields()
        .forEach( key => store.setItem(this.SIG + key, form[key].value) )
      },
      restoreForm() {
        this.clear = false
        let form = this.$els.form
        let store = this.getStore()
        form.reset()
        this.getFields()
        .forEach( key => {
          let val = store.getItem(this.SIG + key)
          if (val) {
            form[key].value = val
            this.$validate(key, true)
          }
        })
      }
    },
    ready() {
      // LT-TODO: pull ac-test data from server
      this.restoreForm()
    },
    beforeDestroy() {
      this.storeForm()
    }
  }
</script>

<style lang="stylus">
  *[busy]
    cursor: progress !important
  form
    .field-name
      &::after
        content: "："
    input, textarea
      &.touched.invalid
        background-color: pink
      &.touched.valid
        background-color: lightgreen
    .section 
      border-top: 1px solid black
      margin: 2em 0
      &:first-child
        border-top: none
    .ac-test
      .topic
        opacity: .5
    .container
      font-size: 14px
    .text-input
      height: 20px
      width: 220px
      padding: 5px 8px
      margin: 5px
      border: 1px solid #aaa
      border-radius: 8px
      padding-right: 30px
    input[type="radio"]
      width: 15px
      height: 15px
      padding: 0
      vertical-align: middle
      margin: -2px 0 1px 0
    textarea
      resize: none
    .field
      height: 50px
      line-height: 50px
</style>