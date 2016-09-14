<template>
  <div class="container admin_home">
    <div class="menu lr">
      <div class="banner">组委后台</div>
      <nav>
        <a :active="active === 'enroll'" @click="go('enroll')">预报名审核</a>
      </nav>
    </div>
    <router-view></router-view>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/flex-lr";
  .admin_home
    .menu
      position: relative
      background: #52abf3
      color: #fff
      width: 100%
      height: 60px
      line-height: 60px
      .banner
        font-weight: bold
        width: 100px
        text-align: center
      nav
        a
          display: inline-block
          font-size: 18px
          margin: 0 15px
        &[active]
          /* TODO: active background color */
</style>

<script>
  export default {
    data() {
      return {
        test:   false,
        active: '' 
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