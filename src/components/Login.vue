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
      >提交
      </button>
    </div>

  </div>
</template>

<style lang="stylus">
  @import "../styles/busy";
</style>

<script>
  import Vue from 'vue'
  import getResponseMessage from '../lib/guess-response-message'
  const TOKEN_KEY = '_token'

  function getStoredToken() {
    if (Vue.http.headers.common['Authorization'])
      return Vue.http.headers.common['Authorization'].substr('Bearer '.length)
    if (window.localStorage)
      return window.localStorage.getItem(TOKEN_KEY)
  }

  function isTokenStored() {
    // check if user want to store token
    return window.localStorage && window.localStorage.getItem(TOKEN_KEY)
  }

  function setToken(token, remember = false) {
    if (!token)
      return clearToken()
    Vue.http.headers.common['Authorization'] = 'Bearer '+token
    if (remember && window.localStorage)
      window.localStorage.setItem(TOKEN_KEY, token)
  }

  function clearToken() {
    delete Vue.http.headers.common['Authorization']
    if (window.localStorage)
      window.localStorage.removeItem(TOKEN_KEY)
  }

  export default {
    data() {
      return {
        busy: false,
        tryStored: false,
        remember: false,
        wrongCred: false
      }
    },
    ready() {
      // detect stored token
      let token = getStoredToken()
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
        //this.$els.form.reset()
        this.$router.replace(this.$route.query.next || '/')
        setToken(token, this.remember)
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