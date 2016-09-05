<template>
  <div>
    <h3>组委后台</h3>
    <nav>
      <a :active="active === 'enroll'" @click="go('enroll')">预报名审核</a>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style lang="stylus">
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