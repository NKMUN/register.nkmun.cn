<template>
  <div class="container home lr">
    <div class="section left">
      <img src="../assets/images/homepic.jpg" class="homepic" alt="首页图片"/>
    </div>
    <div class="right">
      <login-ctrl :busy.sync="busy" :next-route="ACCESS_TO_NEXT_ROUTE"></login-ctrl>
      <div class="btn-group">
        <a @click.prevent="!busy && $router.go('/enroll')">报名</a>
        <a @click.prevent="!busy && $router.go('/enroll/result')" class="hide">报名结果</a>
        <a @click.prevent="!busy && $router.go('/invitation')" class="hide">领队注册</a>
      </nav>
  </div>
</template>

<style lang="stylus">
  .home
    width: 80%
    margin: auto
    padding-top: 150px
    .left
      width: 50%
      height: 350px
      padding-left: 5%
      margin-top: 20px
    .right
      width: 50%
      height: 350px
      padding-left: 10%
      border-left: 1px solid #e3e3e3
      .hide
        display: none !important
      .btn-group a, .btn
        display: block
        cursor: pointer
        width: 260px
        height: 35px
        line-height: 35px
        border-radius: 8px
        border: 1px solid #9cc974
        background-color: #9cc974
        color: #fff
        font-size: 14px
        text-align: center
        vertical-align: middle
        letter-spacing: 15px
        padding-left: 5px
        &:disabled
          border: 1px solid #e2e2e2
          background-color: #a2a2a2
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