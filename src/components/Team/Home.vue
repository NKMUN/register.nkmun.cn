<template>
  <div class="container team-home mgmt-ui">
    <div class="menu lr">
      <h4>领队后台</h4>
      <nav>
        <a :active="!active" @click="go('')">概览</a>
        <a v-if="show_exchange" :active="active === 'exchange'" @click="go('exchange')">
          名额交换
          <span v-if="exchanges" class="badge">{{exchanges}}</span>
        </a>
        <a v-if="show_hotel"    :active="active === 'hotel'"    @click="go('hotel')">住宿信息</a>
        <a v-if="show_payment"  :active="active === 'payment'"  @click="go('payment')">支付</a>
        <logout-btn></logout-btn>
      </nav>
    </div>
    
    <div v-if="!data">
      <h4>正在载入信息，请稍等...</h4>
    </div>

    <div v-if="error">
      <h4>Oops. 出错了</h4>
      <pre>{{this.error}}</pre>
    </div>

    <team-overview v-if="data && !active" :data.sync="data"></team-overview>
    <router-view v-if="data && active" :data.sync="data"></router-view>

  </div>
</template>

<style lang="stylus">
  @import "../../styles/flex-lr";
  @import "../../styles/mgmt-ui";
  .badge
    display: inline-block
    background-color: #d9534f
    border: 1px solid #d9534f
    border-radius: 1em
    line-height: initial
    text-align: center
    min-width: 1em
    font-size: 80%
    padding: 0 0.4em 0.1em 0.4em
</style>

<script>
  import Logout from '../Logout'
  import Overview from './Overview'
  export default {
    components: {
      'logout-btn': Logout,
      'team-overview': Overview
    },
    data() {
      return {
        test: false,
        data: null
      }
    },
    computed: {
      active() {
        if (this.$route.matched[1])
          return this.$route.matched[1].handler.path.match(/[^/]+/)[0]
      },
      state() { return this.data ? this.data.state || 'registered' : null },
      exchanges() { return this.data ? this.data.exchanges || 0 : 0 },
      show_exchange() { return this.state === 'registered' },
      show_hotel()    { return this.state === 'quote_confirmed' },
      show_payment()  { return this.state === 'hotel_confirmed' }
    },
    methods: {
      go(route, args = {}) {
        this.$router.go( Object.assign({path: '/team/'+route}, args) )
      }
    },
    ready() {
      this.busy = true
      this.$http.get('leader')
      .then( res => {
        this.busy = false
        this.data = res.json()
      })
      .catch( res => {
        this.error = getResponseMessage(res)
        this.busy = false
      })
    }
  }
</script>
