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
    <div>
      <label>
        <input type="checkbox" v-model="agreed"></input>我同意以上条款
      </label>
    </div>
    <button
      class="next"
      :disabled="!agreed"
      @click.prevent="(agreed && !busy) ? next() : nop()"
    >下一步</button>
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
    text-align: center
    padding-bottom: 50px
    div
      text-align: justify
    div:last-of-type
      text-align: center
      margin-bottom: 20px
    .next
      display: block
      cursor: pointer
      width: 260px
      height: 35px
      margin: auto
      line-height: 35px
      border-radius: 8px
      background-color: #5cb85c
      border: 1px solid #4cae4c
      color: #fff
      font-size: 14px
      text-align: center
      vertical-align: middle
      &:disabled, &:disabled:hover
        border: 1px solid #e2e2e2
        background-color: #a2a2a2
    .next:hover
      background-color: #449d44
      border-color: #398439
    .next:active
      outline: 0
      box-shadow: inset 0 3px 5px rgba(0,0,0,.125);
      background-color: #449d44
      border-color: #398439
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
      .then( (res) => {
        this.disclaimer = res.text()
        this.busy = false
      })
      .catch( (res) => {
        this.busy = false
        let msg = getResponseMessage(res)
        // TODO: complain about error
      })
    }
  }
</script>