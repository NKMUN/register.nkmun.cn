<template>
  <div class="banner">
    <img src="../assets/images/hilogo.png" class="logo" alt="hilogo" v-link="{ path: '/' }" />
    <img src="../assets/images/nklogo.png" class="logo" alt="nklogo" href="https://nkmun.cn/" style="cursor: pointer;"/>
  </div>
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
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .banner
    display: block
    text-align: center
    vertical-align: middle
    width: 100vw
    height: 80px
    background-color: #52abf3
    .logo
      margin: 4px auto
    .logo:nth-child(1)
      padding-right: 20px
    .logo:nth-child(2)
      padding-left: 20px
      border-left: 1px solid #fff
  .home
    width: 80%
    margin: auto
    padding-top: 75px
    .left
      display: block
      width: 50%
      height: 410px
      padding: 0 5%
      margin-top: 40px
      .homepic
        width: 100%
    .right
      display: block
      width: 50%
      height: 410px
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
        background-color: #5cb85c
        border: 1px solid #4cae4c
        color: #fff
        font-size: 14px
        text-align: center
        vertical-align: middle
        letter-spacing: 15px
        padding-left: 5px
        &[disabled], &[disabled]:hover
          border: 1px solid #e2e2e2
          background-color: #a2a2a2
      .btn-group a:hover, .btn:hover
        background-color: #449d44
        border-color: #398439
      .btn-group a:active, .btn:active
        outline: 0
        box-shadow: inset 0 3px 5px rgba(0,0,0,.125);
        background-color: #449d44
        border-color: #398439
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
        'leader': '/team'
      }
    },
    data() {
      return {
        busy: false
      }
    }
  }
</script>