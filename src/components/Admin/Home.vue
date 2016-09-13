<template>
  <div class="container admin_home">
    <nav class="menu">
      <a>组委后台</a>
      <a :active="active === 'enroll'" @click="go('enroll')">预报名审核</a>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style lang="stylus">
  .admin_home
    .menu
      position: relative
      list-style: none
      background: #52abf3
      color: #fff
      width: 100%
      height: 60px
      a:nth-child(1)
        font-weight: bold
        width: 100px
        text-align: center
      a
        display: inline-block
        height: 60px
        line-height: 60px
        font-size: 18px
        margin: 0 15px
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