<template>
  <div class="team-overview">

    <div class="section own-quote">
      <h4>已分配名额</h4>
      <ul>
        <li v-for="$ in committees | filterBy hasQuote">
          <span class="name">{{ committee_name[$.dbId] }}</span>
          <span class="quote">{{ data.committee[$.dbId] }}</span>
          <button @click="giveup.committee = $.dbId">放弃...</button>
        </li>
      </ul>
    </div>

    <div class="section school">
      <h4>学校信息</h4>
      <div class="field">
          <span class="name">学校</span>
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
        <li v-if="todo_finished">参会……</li>
      </ol>
    </div>
  </div>

  </div>
</template>

<style lang="stylus">
  @import "../../styles/table";
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
      todo_hotel()    { return this.state==='registered' || this.state==='quote_confirmed' },
      todo_payment()  { return this.state==='registered' || this.state==='quote_confirmed' || this.state==='hotel_confirmed' },
      todo_attend()   { return this.state==='finished' }
    },
    methods: {
      hasQuote({dbId}) {
        return this.data.committee && this.data.committee[dbId] > 0
      }
    }
  }
</script>
