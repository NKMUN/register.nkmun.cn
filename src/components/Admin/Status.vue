<template>
  <div class="container admin-enroll-status" :busy="busy">
    <table class="horz-stripe hover-effect" v-if="list">
      <thead>
        <tr>
          <th>学校</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="$ in list">
          <td>{{ $.school }}</td>
          <td>{{ $.state }}</td>
          <td>
            <button v-if="$.canResendInvitation" @click="!busy ? sendInvitation($.id) : nop()">重发邀请</button>
          </td>
      </tbody>
    </table>
  </div>
</template>

<style lang="stylus">
  .admin-enroll-status
    overflow-y: scroll
</style>

<script>
  import getResponseMessage from '../../lib/guess-response-message'

  const STATE_NAME = {
    '*': '',
    'inviting':   '已邀请',
    'invited':    '已邀请',
    'registered': '已注册',
    'quota-confirmed': '名额已确认',
    'accommodation-confirmed': '住宿信息已确认',
    'paid': '已付款，待审核',
    'payment-confirmed': '已付款，已通过',
    'payment-rejected': '已付款，未通过'
  }

  function complainError(res) {
    // TODO: complain about error
    getResponseMessage(res).then( msg => alert('Error: '+msg) )
  }

  function bySchoolName(a, b) {
    return String(a.school).localeCompare(b.school)
  }

  function valueInSet(val, ...vals) {
    for (let v of vals)
      if (val === v)
        return true
    return false
  }

  export default {
    data() {
      return {
        busy: false,
        error: null,
        rawList: null
      }
    },
    computed: {
      list() {
        if (!this.rawList)
          return null
        else
          return this.rawList.map( $ => ({
            id:     $.id,
            school: $.school,
            state:  STATE_NAME[$.state] || STATE_NAME['*'],
            canResendInvitation: valueInSet($.state, 'inviting', 'invited')
          }))
          .sort( bySchoolName )
      }
    },
    ready() {
      this.$http.get('enroll/status')
      .then( (res) => res.json() )
      .then( (json) => this.rawList = json )
      .catch( complainError.bind(this) )
      .then( () => this.busy = false )
    },
    methods: {
      nop() {},
      sendInvitation(id) {
        this.busy = true
        return this.$http.post('invitation/', {id})
               .then( (res) => alert('已发送邀请') )
               .catch( complainError.bind(this) )
               .then( () => this.busy = false )
      },
    }
  }
</script>