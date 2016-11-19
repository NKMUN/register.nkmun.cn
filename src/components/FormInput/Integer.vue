<template>
  <input
    v-el:input
    type="number"
    :disabled="disabled || false"
    @change.prevent="checkChange()"
    @focus.prevent="blur ? select() : nop()"
    @blur.prevent="this.blur = true"
    number
  >
  </input>
</template>

<script>
  export default {
    props: ['max', 'min', 'disabled'],
    created() {
      this.blur = true
    },
    methods: {
      nop() {},
      checkChange() {
        let value = Number(this.$els.input.value)
        if (!value)
          return
        if (this.min)
          value = Math.max( Number(this.min), value )
        if (this.max)
          value = Math.min( Number(this.max), value )
        this.$els.input.value = Math.floor(value)
      },
      select() {
        this.$els.input.select()
      }
    }
  }
</script>
