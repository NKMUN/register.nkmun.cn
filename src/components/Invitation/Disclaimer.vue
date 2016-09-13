<template>
  <div :busy="busy">
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