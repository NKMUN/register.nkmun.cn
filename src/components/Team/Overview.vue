<template>
  <div class="container team-overview">

    <div class="section own-quota">
      <h4>已分配名额</h4>
      <table class="quota-detail">
        <tr>
          <th>名额归属</th>
          <th>数量</th>
        </tr>
        <tr v-for="$ in committees | filterBy hasQuota">
          <td><span class="name">{{ committee_name[$.dbId] }}</span></td>
          <td><span class="quota">{{ data.committee[$.dbId] }}</span></td>
        </tr>
      </table>
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
        <li v-if="todo_attend">  等待二轮分配</li>
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
    .quota-detail
      text-align: center
      td
        width: 25%
</style>

<script>
  import getResponseMessage from '../../lib/guess-response-message'
  import {groups as COMMITTEE_GROUPS, ungrouped as committees, idMapping as committee_name} from '../../def/committee'

  export default {
    props: ['data'],
    created() {
      this.groups = COMMITTEE_GROUPS
      this.committees = committees
      this.committee_name = committee_name
    },
    computed: {
      state() { return this.data && this.data.state ? this.data.state : 'registered' },
      todo_exchange() { return this.state==='registered' },
      todo_hotel()    { return this.state==='registered' || this.state==='quota-confirmed' },
      todo_payment()  { return this.state==='registered' || this.state==='quota-confirmed' || this.state==='accommodation-confirmed' },
      todo_wait()     { return this.state==='paid' },
      todo_attend()   { return this.state==='payment-confirmed' },
      todo_repay()    { return this.state==='payment-rejected' }
    },
    methods: {
      hasQuota({dbId}) {
        return this.data.committee && this.data.committee[dbId] > 0
      }
    }
  }
</script>
