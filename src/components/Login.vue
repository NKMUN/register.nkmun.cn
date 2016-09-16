<template>
  <div class="container login" :busy="busy">
    <h3>登录</h3>

    <div v-if="tryStored">
      <h4>正在登录</h4>
    </div>

    <div v-if="!tryStored">
      <form novalidate v-el:form enctype="application/x-www-form-urlencoded">

        <div class="field">
          <label>
            <span>用户</span>
            <input name="user" type="text" :disabled="busy"></input>
          </label>
        </div>

        <div class="field">
          <label>
            <span>密码</span>
            <input name="password" type="password" :disabled="busy"></input>
          </label>
        </div>

        <div class="field ctrl">
          <label>
            <span>记住我</span>
            <input id="remember-credential" type="checkbox" v-model="remember" :disabled="busy"></input>
          </label>
        </div>

      </form>

      <div v-if="wrongCred">
        <h4>用户名或密码不正确</h4>
      </div>

      <button
        :disabled="!test && (busy)"
        :busy="busy"
        @click.prevent="login"
      >登录</button>
    </div>

  </div>
</template>

<style lang="stylus">
  @import "../styles/busy";
</style>

<script>
  import Vue from 'vue'
  import getResponseMessage from '../lib/guess-response-message'
  import { isTokenStored, getToken, setToken, clearToken, decodeToken } from '../lib/token-store'
  import TEST_FLAG from '../directives/test-flag'

  export default {
    props: ['busy', 'nextRoute'],
    created() {
      this.test = TEST_FLAG
    },
    data() {
      return {
        tryStored: false,
        remember: false,
        wrongCred: false
      }
    },
    ready() {
      if (this.test)
        return
      // detect stored token
      let token = getToken()
      if (token) {
        // try to refresh token
        this.remember = isTokenStored()
        this.tryStored = true
        this.busy = true
        setToken(token)
        this.$http.get('login')
        .then( (res) => {
          this.busy = false
          this.loginSuccess( res.json().token )
          this.remember = false
          this.tryStored = false
        })
        .catch( (res) => {
          this.busy = false
          this.remember = false
          this.tryStored = false
          clearToken()
          let msg = getResponseMessage(res)
          // TODO: complain about error
        })
      }
    },
    methods: {
      loginSuccess(token) {
        setToken(token, this.remember)
        let {access} = decodeToken(token)
        this.$router.replace(this.nextRoute[access] || '/')
      },
      login() {
        this.busy = true
        this.$http.post('login', new FormData(this.$els.form))
        .then( (res) => {
          this.busy = false
          this.wrongCred = false
          this.loginSuccess( res.json().token )
        })
        .catch( (res) => {
          this.busy = false
          switch (res.status) {
            case 403:
              this.wrongCred = true
            break
            default:
              this.$router.go({ path: '/generic-failure', query: {status: res.status, message: getResponseMessage(res)} })
            break
          }
        })
      }
    }
  }
</script>