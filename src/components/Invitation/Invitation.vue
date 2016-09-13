<template>
  <div class="container invitation" :busy="busy">
    <h3>Hi汇文</h3>
    <form novalidate>
      <div class="field invitation">
        <div class="section invitation">
          <label>
            <span class="field-name">激活码</span>
            <input
              type="text"  
              placeholder="请输入激活码"
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