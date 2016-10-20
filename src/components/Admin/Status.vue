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
    'quota-confirmed': '名额已确认'
  }

  function complainError(res) {
    // TODO: complain about error
    let msg = getResponseMessage(res)
    alert('Error: '+msg)
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
      }
    },
    ready() {
      this.$http.get('enroll/status')
      .then( (res) => this.rawList = res.json() )
      .catch( complainError.bind(this) )
      .then( () => this.busy = false )
    },
    method: {
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