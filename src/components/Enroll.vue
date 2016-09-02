<template>
  <div :class="{ busy: busy }">
    <h3>预注册</h3>

    <div class="disclaimer">
      <h4 class="heading">特别说明</h4>
      <p>
        1、本报名表适用对象为全国各高中学校模联社团指导教师或学生负责人；<br>
        2、报名表提交截止日期：北京时间2016年10月7日23时59分；<br>
        3、本报名表所有填写框内除注明英文的选项外，请使用中文填写；<br>
        5、如在填写报名表中出现任何问题或疑问，请发送邮件至2017@nkmun.org咨询；<br>
        6、对于在截至日期之前提交多份报名表的学校，组委会将以最后一份报名表为准；<br>
        7、本报名表最终解释权归本次大会组委会所有。<br>
      </p>
    </div>

    <validator name='prereg'>
      <form id="enroll" v-el:form novalidate autocomplete="on">

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
                cols="100"
                rows="15"
              ></textarea>
            </template>

            {{{ _.html }}}
          </div>
        </div>

        <button
          :disabled=" !test && ($prereg.invalid || busy)"
          @click.prevent="submit"
        >提交
        </button>
      </form>
    </validator>
  </div>
</template>

<script>
  import EmailRegex from 'email-regex'
  const re_email = EmailRegex({exact: 'true'})
  const re_en_name = /[a-zA-Z0-9_\- .,]/

  const FT = (name, dbId, placeholder='', validate=[]) => ({tag: 'input', name, dbId, validate, placeholder})
  const FN = (name, dbId, placeholder='', validate=[]) => ({tag: 'input', type: 'number', name, dbId, validate, placeholder})
  const FR = (name, dbId, opts, validate=[]) => ({tag: 'radio', name, dbId, validate, opts})
  const O  = (text, val) => ({text, val})
  const TA = (dbId, placeholder='', validate=[]) => ({tag: 'textarea', dbId, validate, placeholder})
  const H  = (html) => ({tag: 'html', html})
  
  const GENDER_OPTS = [O('男', 'm'), O('女', 'f'), O('未知', 'u')]
  const FORM = [
    {
      section: '学校',
      class:   'school',
      fields:  [
        FT('中文名称', 'school',    '澄空学园',   ['required']),
        FT('英文名称', 'school_en', 'Sumi Sora', ['required', 'enName'])
      ]
    }, 
    {
      section: '联系人',
      class:   'contact',
      fields:  [
        FT('姓名',    'name',   '黑黑黑',              ['required']),
        FR('性别',    'gender', GENDER_OPTS,          ['required']),
        FT('手机号码', 'phone', '13800000000',         ['required', 'phone']),
        FT('邮件地址', 'email', 'someone@example.com', ['required', 'email']),
      ]
    },
    {
      section: '名额',
      class:   'quote',
      fields:  [
        FN('申请名额', 'quote', 0, ['required'])
      ]
    },
    {
      section: '学术水平测试',
      class:   'ac-test',
      fields:  [
         H(`<p class="topic">背景信息</p>`),
        TA('ac_paper', '', ['required'])
      ]
    }
  ]

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
              this.$router.go({ path: '/enroll/failure', query: {status: res.status, message: '不能重复预注册'} })
            break
            default:
              this.$router.go({ path: '/enroll/failure', query: {status: res.status, message: '未知错误'} })
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
  .busy
    cursor: progress
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
</style>