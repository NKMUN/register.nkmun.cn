<template>
  <div class="overlay">
    <div class="modal">
      <slot name="caption"></slot>
      <slot name="content"></slot>
      <slot name="button"></slot>
    </div>
  </div>
</template>


<script>
  export default {
    methods: {
      nop() {}
    }
  }
</script>

<style lang="stylus">
  .overlay
    position: fixed
    width: 100%
    height: 100%
    z-index: 99
    top: 0
    left: 0
    background-color: rgba(255,255,255,0.7)
    display: flex
    flex-direction: row
    align-items: center
    justify-content: center
    .modal
      padding: 15px
      background-color: #fff
      border: 1px solid #232323
      min-width: 30%
</style>