<template>
  <div :busy="busy">
    <h3>登录</h3>
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
</template>

<style lang="stylus">
  *[busy]
    cursor: progress !important
</style>

<script>
  import Vue from 'vue'
  import getResponseMessage from '../lib/guess-response-message'
  export default {
    data() {
      return {
        busy: false,
        remember: false,
        wrongCred: false
      }
    },
    methods: {
      login() {
        this.busy = true
        this.$http.post('login', new FormData(this.$els.form))
        .then( (res) => {
          this.busy = false
          this.wrongCred = false
          //this.$els.form.reset()
          this.$router.replace(this.$route.query.next || '/')
          // remember token
          let token = res.json().token
          Vue.http.headers.common['Authorization'] = 'Bearer '+token
          if (this.remember)
            window.localStorage.setItem('_token', res.json().token)
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