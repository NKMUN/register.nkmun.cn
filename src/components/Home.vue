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
        <button class="large" @click.prevent="!busy && $router.go('/enroll')">报名</a>
        <!--<button class="large" @click.prevent="!busy && $router.go('/enroll/result')">报名结果</a>-->
        <!--<button class="large" @click.prevent="!busy && $router.go('/invitation')">领队注册</a>-->
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
      .btn-group
        button
          margin: 1em 0
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