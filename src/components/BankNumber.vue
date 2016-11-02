<template>
  <span class="bank-number">
    <span v-for="seg in segments" class="segment">{{ seg }}</span>
  </span>
</template>

<style lang="stylus">
  .bank-number
    .segment
      margin-right: .75ch
      &:last-child
        margin-right: 0ch
</style>

<script>
  export default {
    name: 'bank-number',
    props: ['cardNumber'],
    computed: {
      segments() {
        return String(this.cardNumber).match(/.{1,4}/g)
      }
    }
  }
</script>