<template>
  <div class="container registration" :busy="busy">
    <div class="form-area">
      <h2>领队注册</h2>

      <form novalidate>
        <div class="section info">
          <h4 class="heading">学校信息</h4>
          <div class="field" v-for="$ in ro_fields">
            <label>
              <span class="field-name">{{$.name}}</span>
              <input type="text" readonly :value="$route.query[$.dbId]"></input>
            </label>
          </div>
        </div>
      </form>

      <validator name='leader-reg'>
        <form id="leader-reg" v-el:form novalidate autocomplete="on">

          <div class="section {{$.class}}" v-for="$ in form">

            <h4 class="heading {{$.class}}">{{$.section}}</h4>

            <div :class="{ field: _.dbId }" v-for="_ in $.fields">
              <label v-if="_.tag === 'input'" :for="_.dbId">
                <span class="field-name">{{_.name}}</span>
                <input
                  type="text"
                  :name="_.dbId"
                  :field="_.dbId"
                  :placeholder="_.placeholder"
                  v-validate="_.validate"
                  :disabled="busy"
                ></input>
              </label>

              <label v-if="_.tag === 'number'" :for="_.dbId">
                <span class="field-name">{{_.name}}</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  :name="_.dbId"
                  :field="_.dbId"
                  :placeholder="_.placeholder"
                  v-validate="_.validate"
                  :disabled="busy"
                ></input>
              </label>

              <label v-if="_.tag === 'password'" :for="_.dbId">
                <span class="field-name">{{_.name}}</span>
                <input
                  type="password"
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

            </div>
          </div>

          <button
            class="submit-btn"
            :disabled=" !test && ($leaderReg.invalid || busy)"
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
  import Vue from "vue"
  import TEST_FLAG from '../../directives/test-flag'
  import getResponseMessage from '../../lib/guess-response-message'
  import FORM from '../../def/leader-reg-form'
  import validators from '../../lib/validators'
  import { forgetForm, storeForm, restoreForm, resetForm } from '../../lib/vue-persistent-form'

  import { FT } from '../../def/_utilities'

  export default {
    validators,
    created() {    // bind private, non-reactive data
      this.test = TEST_FLAG    // debug flag
      this.form = FORM         // form generation data
      this.SIG = 'leaderReg_'  // form signature
      this.clear = false       // clear store flag
      this.ro_fields = [       // readonly fields shown before input form, passed by $route.query
        FT('学校', 'school')
      ]
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
        Vue.http.post(
          'leader', 
          new FormData(this.$els.form),
          { params: { invitation: this.$route.query.invitation } }
        )
        .then( (res) => {
          this.busy = false
          this.resetForm()
          this.forgetForm()
          this.$router.replace('success')
        })
        .catch( (res) => {
          console.log(res)
          this.busy = false
          let msg = getResponseMessage(res)
          switch (res.status) {
            case 409:
              this.$router.go({
                path: '/generic-failure',
                query: {status: res.status, message: `不能重复注册 / ${msg}`}
              })
            break
            case 410:
              this.$router.go({
                path: '/generic-failure',
                query: {status: res.status, message: `激活码无效或已使用 / ${msg}`}
              })
            break
            default:
              this.$router.go({
                path: '/generic-failure',
                query: {status: res.status, message: msg}
              })
            break
          }
        })
      },
    },
    ready() {
      setTimeout( ()=>{
        if (!this.$route.query.invitation)
          return this.$router.replace('/invitation')
        window.scrollTo(0, 0)
        this.restoreForm()
      }, 0)
    },
    beforeDestroy() {
      this.storeForm()
    }
  }
</script>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/form";

  .password-hint
    opacity: .5
    font-size: 80%
  .registration
    font-size: 14px
    position: relative
    height: calc(100vh - 100px)
    width: 100%
    padding-top: 100px
    background: url("../../assets/images/form_background.jpg") no-repeat fixed top
    background-size: 100% 100%
    .form-area
      width: 80%
      margin: autocomplete
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
