<template>
  <div>
    <div>
      <h4>名额交换</h4>
    </div>
    <div>
      <p>确认后不能再修改</p>
      <button @click="!disabled ? confirm() : nop()">确认名额</button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        busy: false
      }
    },
    computed: {
      disabled() { return !busy }
    },
    methods: {
      nop() {},
      confirm() {

      }
    }
  }
</script>