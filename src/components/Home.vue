<template>
  <div class="container home lr">
    <div class="section left">
      <nav>
        <a @click.prevent="!busy && $router.go('/enroll')">报名</a>
        <a @click.prevent="!busy && $router.go('/enroll/result')">报名结果</a>
        <a @click.prevent="!busy && $router.go('/invitation')">领队注册</a>
        <a ></a>
      </nav>
    </div>
    <login-ctrl :busy.sync="busy" :next-route="ACCESS_TO_NEXT_ROUTE" class="right"></login-ctrl>
  </div>
</template>

<style lang="stylus">
  nav a, .btn
    display: block
    cursor: pointer
</style>

<script>
  import Vue from 'vue'
  import Login from './Login'
  export default {
    components: {
      'login-ctrl': Login
    },
    created() {
      // access -> next route mapping
      this.ACCESS_TO_NEXT_ROUTE = {
        'admin':  '/admin',
        'leader': '/leader'
      }
    },
    data() {
      return {
        busy: false
      }
    }
  }
</script>