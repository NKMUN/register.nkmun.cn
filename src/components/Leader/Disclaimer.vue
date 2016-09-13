<template>
  <div>
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
</style>

<script>
  import Vue from "vue"
  import getResponseMessage from "../../lib/guess-response-message" 
  export default {
    props: ['busy'],
    data() {
      return {
        disclaimer: null,
        agreed: false
      }
    },
    methods: {
      nop() {},
      next() {
        this.$router.replace('registration')
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