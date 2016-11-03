<template>
  <div class="banner">
    <img src="../../assets/images/hilogo.png" class="logo" alt="hilogo" v-link="{ path: '/' }" />
    <img src="../../assets/images/nklogo.png" class="logo" alt="nklogo" href="https://nkmun.cn/" style="cursor: pointer;"/>
  </div>
  <div class="container disclaimer" :busy="busy">
    <h3>责任条款</h3>
    <div v-if="!disclaimer">
      正在载入责任条款
    </div>
    <div v-if="disclaimer">
      <p>请阅读以下责任条款：</p>
      {{{disclaimer}}}
    </div>
    <div class="agreement-input">
      <label>
        <input type="checkbox" v-model="agreed"></input>我同意以上条款
      </label>
    </div>
    <div class="buttons">
      <button
        class="next xlarge"
        :disabled="!agreed"
        @click.prevent="(agreed && !busy) ? next() : nop()"
      >下一步</button>
    </div>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy"
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
  .disclaimer
    width: 80%
    margin: auto
    padding-bottom: 50px
    h3
      text-align: center
    .agreement-input
      text-align: center
      margin-top: 40px
      margin-bottom: 20px
    .buttons
      text-align: center
</style>

<script>
  import Vue from "vue"
  import getResponseMessage from "../../lib/guess-response-message" 
  export default {
    data() {
      return {
        busy: true,
        disclaimer: null,
        agreed: false
      }
    },
    methods: {
      nop() {},
      next() {
        this.$router.replace({
          path:  'registration',
          query: this.$route.query
        })
      }
    },
    ready() {
      this.busy = true
      Vue.http.get('disclaimer')
      .then( (res) => res.text() )
      .then( (text) => this.disclaimer = text )
      .catch( (res) => getResponseMessage(res) )
      .then( (msg) => this.error = msg )
      .then( () => this.busy = false )
    }
  }
</script>