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
        class="submit-btn xlarge next"
        @click.prevent="verifyInvitation()"
        :disabled="!invitation || busy"
      >下一步</button>

    </form>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/form";
  @import "../../styles/button";
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
        .then( (res) => res.json() )
        .then( (json) => { 
          this.$router.replace({
            path:  '/invitation/disclaimer',
            query: json
          })
        })
        .catch( (res) => {
          switch(res.status) {
            case 404:
              this.error = '邀请码不存在'
            break
            default:
              getResponseMessage(res).then( msg => this.error = msg )
            break
          }
        })
        .then( () => this.busy = false )
      }
    }
  }
</script>