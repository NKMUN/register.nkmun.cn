<template>
  <div class="bank-transfer-credential">
    <div>
      <span class="hint-text">卡号：</span> <bank-number name="bank-number" class="value" :card-number="card"> </bank-number>
    </div>
    <div v-if="name">
      <span class="hint-text">收款人：</span> <span class="value">{{ name }}</span>
    </div>
    <div v-if="branch">
      <span class="hint-text">开户行：</span> <span class="value">{{ branch }}</span>
    </div>
  </div>
</template>

<style lang="stylus">
  .bank-transfer-credential
    margin-top: 2em
    margin-bottom: 2em

</style>

<script>
  import BankNumber from './BankNumber'
  
  export default {
    components: { BankNumber },
    props: ['name', 'card', 'branch']
  }
</script>