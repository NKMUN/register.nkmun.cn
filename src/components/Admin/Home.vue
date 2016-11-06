<template>
  <div class="container admin-home mgmt-ui">
    <div class="menu lr">
      <h4>组委后台</h4>
      <nav>
        <a :active="active === 'enroll'" @click="go('enroll')">预报名审核</a>
        <a :active="active === 'payment'" @click="go('payment')">缴费审核</a>
        <a :active="active === 'status'" @click="go('status')">状态</a>
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
        this.$router.go( Object.assign({path: '/admin/'+route}, args) )
      }
    }
  }
</script>