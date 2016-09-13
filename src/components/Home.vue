<template>
  <div class="container home">
    <div class="section">
      <nav>
        <a @click="$router.go('/enroll')">报名</a>
        <a @click="$router.go('/enroll/result')">报名结果</a>
        <a @click="$router.go('/invitation')">领队注册</a>
        <a ></a>
      </nav>
    </div>
    <div class="section">
      <h3></h3>
      <a class="btn" @click="$router.go({ path: '/login', query: {next: '/admin'} })">组委后台</a>
    </div>
  </div>
</template>

<style lang="stylus">
  nav a, .btn
    display: block
    cursor: pointer
</style>

<script>
  import Vue from 'vue'
  export default {
  }
</script>