<template>
  <div class="container team-home mgmt-ui">
    <div class="menu lr">
      <h4>领队后台</h4>
      <nav>
        <a :active="active === 'overview'" @click="go('overview')">概览</a>
        <a :active="active === 'exchange'" @click="go('exchange')">名额交换</a>
        <a :active="active === 'confirm'" @click="go('confirm')">名额确认</a>
        <a :active="active === 'payment'" @click="go('payment')">支付</a>
        <logout-btn></logout-btn>
      </nav>
    </div>
    <router-view></router-view>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/flex-lr";
  @import "../../styles/mgmt-ui";
</style>

<script>
  import Logout from '../Logout'
  export default {
    components: {
      'logout-btn': Logout
    },
    data() {
      return {
        test:   false,
      }
    },
    computed: {
      active() {
        if (this.$route.matched[1])
          return this.$route.matched[1].handler.path.match(/[^/]+/)[0]
      }
    },
    methods: {
      go(route, args = {}) {
        this.$router.go( Object.assign({path: '/team/'+route}, args) )
      }
    },
    ready() {
      this.go('overview')
    }
  }
</script>