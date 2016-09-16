<template>
  <button @click.prevent="logout" class="logout">退出</button>
</template>

<script>
  import { clearToken } from '../lib/token-store'
  export default {
    methods: {
      logout() {
        clearToken()
        this.$router.replace('/')
      }
    }
  }
</script>

<style lang="stylus">
  .logout
    display: inline-block
    height: 60px
    font-size: 18px
    margin: 0 15px
    background: #52abf3
    border: 1px solid #52abf3
    color: #fff
    cursor: pointer
    outline: none
    position: absolute
    top: 0
    right: 0
</style>