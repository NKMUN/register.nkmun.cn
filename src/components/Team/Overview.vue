<template>
  <div class="container team-overview">

    <div class="section own-quota">
      <h4>已分配名额</h4>
      <quota-detail :c1="data.committee" :c2="data.committee2"></quota-detail>
    </div>

    <div class="section school">
      <h4>学校信息</h4>
      <div class="field">
          <span class="name">学校名称</span>
          <span class="value">{{data.school}}</span>
      </div>
    </div>

    <div class="section state">
      <h4>待办事项：</h4>
      <ol>
        <li v-if="todo_exchange">申请、审核名额交换</li>
        <li v-if="todo_exchange">确认名额和参会信息</li>
        <li v-if="todo_hotel">   确认住宿信息</li>
        <li v-if="todo_payment"> 支付费用</li>
        <li v-if="todo_wait">    等待组委审核缴费凭证</li>
        <li v-if="todo_repay">   缴费凭证未通过审核，请重新上传缴费凭证</li>
        <li v-if="todo_stage2">  缴费成功，等待二轮分配</li>
        <li v-if="todo_hotel2">  确认二轮住宿信息</li>
        <li v-if="todo_payment2">支付二轮费用</li>
        <li v-if="todo_repay2">  二轮缴费凭证未通过审核，请重新上传缴费凭证</li>
        <li v-if="todo_info">    等待填写代表信息</li>
      </ol>
    </div>
  </div>

  </div>
</template>

<style lang="stylus">
  @import "../../styles/table";
  .team-overview
    width: 80%
    margin: 20px auto
</style>

<script>
  import getResponseMessage from '../../lib/guess-response-message'
  import QuotaDetail from '../QuotaDetail'

  export default {
    components: { QuotaDetail },
    props: ['data'],
    computed: {
      state() { return this.data && this.data.state ? this.data.state : 'registered' },
      todo_exchange() { return this.state==='registered' },
      todo_hotel()    { return this.state==='registered' || this.state==='quota-confirmed' },
      todo_payment()  { return this.state==='registered' || this.state==='quota-confirmed' || this.state==='accommodation-confirmed' },
      todo_wait()     { return this.state==='paid' },
      todo_stage2()   { return this.state==='payment-confirmed' },
      todo_repay()    { return this.state==='payment-rejected' },
      todo_hotel2()   { return this.state==='stage-2' },
      todo_payment2() { return this.state==='accommodation-confirmed-2' },
      todo_repay2()   { return this.state==='payment-rejected-2' },
      todo_info()     { return this.state==='payment-confirmed-2' }
    }
  }
</script>
