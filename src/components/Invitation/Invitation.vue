<template>
  <div class="banner">
    <img src="../../assets/images/hilogo.png" class="logo" alt="hilogo" v-link="{ path: '/' }" />
    <img src="../../assets/images/nklogo.png" class="logo" alt="nklogo" href="https://nkmun.cn/" style="cursor: pointer;"/>
  </div>
  <div class="container invitation" :busy="busy">
    <form novalidate>
      <div class="field invitation-code">
        <div class="section invitation-input">
          <label>
            <span class="field-name">邀请码</span>
            <input
              type="text"  
              placeholder="请输入邀请码"
              :disabled="busy"
              v-model="invitation"
            ></input>
          </label>
          <div class="error popup" v-if="error">
            {{error}}
          </div>
        </div>
      </div>

      <button
        class="submit-btn"
        @click.prevent="verifyInvitation()"
        :disabled="!invitation || busy"
      >下一步</button>

    </form>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/form";
  .error
    color: red
  .banner
    display: block
    text-align: center
    vertical-align: middle
    width: 100vw
    height: 80px
    background-color: #52abf3
    .logo
      margin: 4px auto
    .logo:nth-child(1)
      padding-right: 20px
    .logo:nth-child(2)
      padding-left: 20px
      border-left: 1px solid #fff
  .invitation
    width: 80%
    margin: auto
    padding-top: 100px
    text-align: center
    .submit-btn
      width: 260px
      height: 35px
      margin-top: 10px
</style>

<script>
  import Vue from "vue"
  import getResponseMessage from "../../lib/guess-response-message"
  export default {
    data() {
      return {
        busy: false,
        invitation: null,
        error: null
      }
    },
    ready() {
      let argInvitation = this.$route.params.invitation || this.$route.query.invitation
      if (argInvitation) {
        this.invitation = argInvitation
        this.verifyInvitation()
      }
    },
    methods: {
      verifyInvitation() {
        this.busy = true
        this.error = false
        Vue.http.get('invitation/'+encodeURI(this.invitation))
        .then( (res) => {
          this.busy = false
          this.$router.replace({
            path:  '/invitation/disclaimer',
            query: res.json()
          })
        })
        .catch( (res) => {
          this.busy = false
          let msg
          switch(res.status) {
            case 404:
              msg = '邀请码不存在'
            break
            default:
              msg = getResponseMessage(res)
            break
          }
          this.error = msg
        })
      }
    }
  }
</script>