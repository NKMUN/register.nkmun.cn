<template>
  <div class="container admin-payment-review lr" :busy="busy">
    <div class="left selection">
      <h4>待审核学校列表</h4>
      <ul class="list">
        <li
          v-for="entry in displayList"
          :active="active === entry.id"
          :disabled="busy"
          :busy="busy"
          @click.prevent="!busy ? load(entry.id, entry.state) : nop()"
        >
          {{entry.id}}
        </li>
        <li class="hint">--- 以下学校已审核 ---</li>
        <li
          v-for="entry in reviewedList"
          :active="active === entry.id"
          :disabled="busy"
          :busy="busy"
          @click.prevent="!busy ? load(entry.id, entry.state) : nop()"
        >
          {{entry.id}}
        </li>
      </ul>
    </div>
    <div class="details right" v-show="!active">
      <h4 v-if="untouchedEntries === 0">没有更多待审核学校</h4>
      <h4 v-else>请选择待审核学校</h4>
    </div>
    <div class="details right" v-show="active" v-el:detail>
      <div class="billing-detail">
        <h4>{{active}} 应付款项：¥ {{ billing ? billing.total : '正在载入...'}}</h4>
        <table>
          <thead>
            <tr><th>项目</th><th>细则</th></tr>
          </thead>
          <tr v-for="$ in displayCommittee">
            <td>{{$.name}}</td> <td>{{$.amount}}人</td>
          </tr>
          <tr v-for="$ in displayReservation">
            <td>{{$.name}} {{$.type}} 1间</td> <td>{{$.checkIn}} 至 {{$.checkOut}}</td>
          </tr>
        </table>
      </div>

      <div class="credential">
        <p v-if="!imageLoaded">正在载入...</p>
        <img class="credential-img" v-show="imageLoaded" :src="imageURL"></img>
      </div>

      <div class="operation ok" v-if="!activeEntryState">
        <button
          class="xlarge next"
          :disabled="busy"
          @click.prevent="!busy ? accept(active) : nop()"
        >审核通过</button>
        <button
          class="xlarge"
          :disabled="busy"
          @click.prevent="!busy ? load( nextToReview( getDisplayListIdx(active) ) ) : nop()"
        >下一个待审核学校</button>
      </div>

      <div class="operation fail" v-if="!activeEntryState">
        <label class="reason">不通过理由：<input type="text" v-model="rejectReason"></input></label>
        <button
          class="xlarge warn"
          :disabled="busy || !rejectReason"
          @click.prevent="!busy && rejectReason ? reject(active) : nop()"
        >审核不通过{{ !rejectReason ? '（先填写理由）' : ''}}</button>
      </div>

      <div class="operation reviewed" v-if="activeEntryState">
        <h4>已审核</h4>
      </div>

    </div>
  </div>
</template>

<script>
  import getResponseMessage from '../../lib/guess-response-message'
  import {groups as COMMITTEE_GROUPS, ungrouped as committees, idMapping as committee_name} from '../../def/committee'
  
  function complainError(res, vm) {
    vm.busy = false
    console.log(res)
    // TODO: complain about error
    getResponseMessage(res).then( msg => alert('Error: '+msg) )
  }

  function byId(a, b) {
    return String(a.id).localeCompare(b.id)
  }

  export default {
    data() {
      return {
        busy: true,
        list: [],
        dirty: false,
        active: null,
        activeEntryState: null,
        imageLoaded: false,
        billing: null,
        imageURL: null,
        rejectReason: null,
        committee: null,
        reservation: null
      }
    },
    computed: {
      untouchedEntries() {
        return this.list.filter( $ => ! $.state ).length
      },
      displayList() {
        return this.list ? this.list.filter( this.needsReview ).sort( byId ) : null
      },
      reviewedList() {
        return this.list ? this.list.filter( (...arg) => !this.needsReview(...arg) ).sort( byId ) : null
      },
      displayCommittee() {
        if (!this.committee)
          return []
        let arr = []
        for (let k in this.committee)
          if (this.committee[k] > 0)
            if (k==='loc_absent_leader')
              arr.push({ name: '不参会领队', amount: 1 })
            else
              arr.push({ name: committee_name[k], amount: this.committee[k] })
        return arr.sort( (a, b) => a.name.localeCompare(b.name) )
      },
      displayReservation() {
        if (!this.reservation)
          return []
        return this.reservation.sort( (a,b) => a.name.localeCompare(b.name) )
      }
    },
    methods: {
      nop() {},
      needsReview(entry) {
        return !entry.state
      },
      getListIdx(id) {
        for (let idx=0; idx!==this.list.length;++idx)
          if (this.list[idx].id === id)
            return idx
      },
      getDisplayListIdx(id) {
        for (let idx=0; idx!==this.displayList.length; ++idx)
          if (this.displayList[idx].id === id)
            return idx
      },
      nextToReview(idx) {
        for (let next=idx+1; next < this.displayList.length; ++next)
          if ( ! this.displayList[next].state )
            return this.displayList[next].id
        for (let next=0; next < idx; ++next)
          if ( ! this.displayList[next].state )
            return this.displayList[next].id
        return null
      },
      loadCredential(id) {
        this.busy = true
        this.imageLoaded = false
        return this.$http.get(`payment/${id}`)
        .then( (res) => res.blob() )
        .then( (blob) => {
          this.clearImageURL()
          this.imageURL = window.URL.createObjectURL(blob) 
          this.imageLoaded = true
        })
        .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      loadBilling(id) {
        this.busy = true
        this.billing = null
        return this.$http.get(`billing/${id}`)
        .then( (res) => res.json() )
        .then( (json) => this.billing = json )
        .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      loadCommittee(id) {
        this.busy = true
        this.committee = null
        return this.$http.get('enroll/committee/'+id)
        .then( (res) => res.json() )
        .then( (json) => this.committee = json )
        .catch( (res) => complainError(res, this) )
        .then( this.busy = false )
      },
      loadReservation(id) {
        this.busy = true
        this.reservation = null
        return this.$http.get('accommodation/'+id)
        .then( (res) => res.json() )
        .then( (json) => this.reservation = json )
        .catch( (res) => complainError(res, this) )
        .then( this.busy = false )
      },
      load(id, state) {
        if (id === null) {
          this.active = null
          this.billing = null
          this.committee = null
          this.reservation = null
          this.rejectReason = null
          return
        }
        this.active = id
        this.activeEntryState = state
        return this.loadBilling(id)
        .then( this.loadCredential(id) )
        .then( this.loadCommittee(id) )
        .then( this.loadReservation(id) )
      },
      clearImageURL() {
        if (this.imageURL) {
          window.URL.revokeObjectURL(this.imageURL)
          this.imageURL = null
        }
      },
      accept(id) {
        const idx = this.getListIdx(id)
        this.busy = true
        return this.$http.post(`payment/${id}`, { accept: this.billing.total })
        .then( (res) => res.json() )
        .then( () => {
          alert('审核成功，已发送邮件')
          this.load( this.nextToReview(this.getDisplayListIdx(id)) )
          this.list[idx].state = 'payment-confirmed'
          this.list.$set(idx, this.list[idx])    // force view update
        })
        .catch( (res) => complainError(res, this) )
        .then( () => this.busy = false )
      },
      reject(id) {
        const idx = this.getListIdx(id)
        this.busy = true
        return this.$http.post(`payment/${id}`, { reject: this.rejectReason })
        .then( (res) => res.json() )
        .then( () => {
          alert('审核成功，已发送邮件')
          this.load( this.nextToReview(this.getDisplayListIdx(id)) )
          this.list[idx].state = 'payment-rejected'
          this.list.$set(idx, this.list[idx])    // force view update
        })
        .catch( (res) => complainError(res, this) )
        .then( () => this.busy = false )
      }
    },
    ready() {
      this.busy = true
      this.$http.get('payment')
      .then( (res) => res.json() )
      .then( (json) => this.list = json )
      .catch( (res) => complainError(res, this) )
      .then( () => this.busy = false )
    }
  }
</script>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/tab-view";
  @import "../../styles/flex-lr";
  @import "../../styles/button";
  @import "../../styles/list-selection";
  .admin-payment-review
    overflow-y: hidden
    align-items: stretch
    .details, .selection
      overflow-x: initial
      overflow-y: scroll
      align-self: stretch
    .details
      flex-grow: 1
      .credential
        margin-top: 30px
      .credential-img
        width: 500px
      .billing-detail
        font-size: 18px
        margin-top: 35px
        text-align: center
        td
          padding: 0 10px
    .operation
      margin: 2em 0
      &.fail
        input[type="text"]
          display: inline-block
          height: 20px
          width: 220px
          padding: 5px 8px
          margin: 5px
          line-height: normal
          border: 1px solid #aaa
          border-radius: 8px
          &:focus
            border: 1px solid #52abf3
            outline: 0
          &[readonly]
            border: none
            vertical-align: middle
        .reason
          display: block
          margin-bottom: .5em
      &.reviewed
        color: green
        font-size: 1.5em
        width: 500px
        text-align: center
</style>
