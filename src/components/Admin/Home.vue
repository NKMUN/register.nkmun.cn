<template>
  <div class="container admin-home">
    <div class="menu lr">
      <div class="banner">组委后台</div>
      <nav>
        <a :active="active === 'enroll'" @click="go('enroll')">预报名审核</a>
        <logout-btn></logout-btn>
      </nav>
    </div>
    <router-view></router-view>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/flex-lr";
  .admin-home
    display: flex
    flex-direction: column
    align-items: flex-start
    justify-content: flex-start
    height: 100vh
    .container
      flex-grow: 1
      width: 100%
    .menu
      flex-grow: 0
      flex-shrink: 0
      background: #52abf3
      color: #fff
      width: 100%
      height: 60px
      line-height: 60px
      border-bottom: 1px solid #52abf3
      .banner
        font-weight: bold
        width: 100px
        text-align: center
        font-size: 20px
        margin: 0 15px
      nav
        a
          display: inline-block
          height: 55px
          font-size: 18px
          margin: 0 15px
          &[active]
            border-bottom: 5px solid #fff
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
      go(route, args) {
        this.active = route
        this.$router.go( Object.assign({path: '/admin/'+route}, args) )
      }
    }
  }
</script>