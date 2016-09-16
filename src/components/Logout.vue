<template>
  <button @click.prevent="logout">退出</button>
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