<template>
  <div class="quote-exchange">
    <div class="section own-quote">
      <h4>已分配名额</h4>
      <ul>
        <li v-for="$ in committees | filterBy hasQuote">
          <span class="name">{{ getCommitteeName($.dbId) }}</span>
          <span class="quote">{{ data.committee[$.dbId] }}</span>
          <button @click="giveup.committee = $.dbId">放弃...</button>
        </li>
      </ul>
    </div>

    <div class="section requests">
      <h4>待处理申请 <button @click="!disabled ? fetchPendingRequests() : nop()">刷新</button> </h4>
      <ul v-if="requests.length">
        <li v-for="$ in requests" class="request-entry">
          <span class="from-school">{{ $.from }}</span>
          <span class="offer">{{ getCommitteeName($.offer) }}</span>
          <span class="amount">{{ $.amount }}</span>
          <span class="wanted">{{ getCommitteeName($.wanted) }}</span>
          <button class="accept" @click="!busy ? acceptExchange($.id) : nop()">接受</button>
          <button class="accept" @click="!busy ? refuseExchange($.id) : nop()">拒绝</button>
        </li>
      </ul>
      <div v-else>
        <p>暂无</p>
      </div>
    </div>

    <div class="section others-quote">
      <h4>选择交换学校、会场 <button @click="!disabled ? fetchSchoolQuotes() : nop()">刷新</button></h4>
      <div v-if="loaded" class="tab-view">
        <ul class="tab-list">
          <li
            v-for="group in groups"
            class="tab-name"
            @click.prevent="tab = group.id"
            :active="group.id === tab"
          >{{group.name}}</li>
        </ul>
        <div v-for="group in groups">
          <table :data-tab="group.id" v-show="tab === group.id" class="horz-stripe hover-effect">
            <thead>
              <tr>
                <th> 学校/会场 </th>
                <th v-for="$ in group.keys">{{$.name}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="$ in exchangableSchools">
                <th>{{$.school}}</th>
                <td v-for="_ in group.keys">
                  <div v-if="$.committee[_.dbId] > 0">
                    <span> {{$.committee[_.dbId]}} </span>
                    <button @click="!disabled ? showExchangeModal($.id, _.dbId) : nop()">交换</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section confirmation">
      <h4>名额确认</h4>
      <p>请确认以上名额信息，确认后不能再修改</p>
      <button @click="!disabled ? confirm() : nop()">确认名额</button>
    </div>

    <overlay-modal v-if="giveup.committee">
      <h4 slot="caption">放弃名额：{{ getCommitteeName(giveup.committee) }}</h4>
      <div slot="content">
        <form novalidate noautocomplete>
          <div class="field">
            <label>
              <span class="field-name">数量：</span>
              <input-integer
                class="field-value"
                v-model="giveup.amount"
                min="0"
                :max="data.committee[giveup.committee]"
                step="1"
                :disabled="disabled"
              ></input-integer>
            </label>
          </div>
        </form>
      </div>
      <div slot="button">
        <p>确认后不能撤销！</p>
        <button @click="giveupQuote(giveup.committee, giveup.amount)" :disabled="disabled || giveup.amount < 1 || giveup.amount > data.committee[giveup.committee]">确认</button>
        <button @click="giveup.committee = null">取消</button>
      </div>
    </overlay-modal>

    <overlay-modal v-if="exchange.target"></overlay-modal>

    <overlay-modal v-if="error">
      <p slot="content">Oops. 服务器故障，请稍后再试</p>
      <pre>{{ error }}</pre>
      <button slot="button" @click="error = null">关闭</button>
    </overlay-modal>
  </div>
</template>

<script>
  import OverlayModal from '../OverlayModal'
  import getResponseMessage from '../../lib/guess-response-message'
  import {groups as COMMITTEE_GROUPS, ungrouped as committees, idMapping as committee_name} from '../../def/committee'
  import InputInteger from '../FormInput/Integer'

  function getCommitteeName(dbId) { return committee_name[dbId] }

  export default {
    components: { OverlayModal, InputInteger },
    props: ['data'],
    created() {
      this.groups = COMMITTEE_GROUPS
      this.committees = committees
    },
    ready() {
      this.fetchPendingRequests()
      .then( this.fetchSchoolQuotes() )
    },
    data() {
      return {
        busy: false,
        loaded: false,
        error: null,
        schools: [],
        requests: [],
        tab: COMMITTEE_GROUPS[0].id,
        giveup: {
          committee: null,
          amount: 0
        },
        exchange: {
          target: null,
          committee: null
        }
      }
    },
    computed: {
      disabled() { return this.busy || this.modal },
      modal() { this.giveup.committee || this.exchange.target },
      exchangableSchools() {
        return this.schools.filter( ({ id, committee={} }) => {
          if (id === this.data.id)
            return false
          let sum = 0
          for (let k in committee)
            sum += committee[k]
          return sum > 0
        } )
      }
    },
    methods: {
      nop() {},
      fetchSchoolQuotes() {
        this.busy = true
        return this.$http.get('enroll?committee=1')
        .then( (res) => {
          this.busy = false
          this.schools = res.json()
          this.loaded = true
        })
        .catch( (res) => this.error = getResponseMessage(res) )
      },
      fetchPendingRequests() {
        this.busy = true
        return this.$http.get('leader/exchange-request')
        .then( (res)=>{
          this.busy = false
          this.requests = res.json()
        })
      },
      acceptExchange(id) {
        this.busy = true
        return this.$http.post(`leader/exchange-request/${id}`)
        .then( (res) => {
          this.busy = false
          this.data.committee = res.json()
          this.requests.filter( $=>$.id === id)[0].state = 'accepted'
          this.fetchPendingRequests()
          alert('名额交换已接受')
        })
        .catch( (res) => this.error = getResponseMessage(res) )
      },
      refuseExchange(id) {
        this.busy = true
        return this.$http.delete(`leader/exchange-request/${id}`)
        .then( (res) => {
          this.busy = false
          this.requests.filter( $=>$.id === id)[0].state = 'refused'
          this.fetchPendingRequests()
          alert('名额交换已拒绝')
        })
        .catch( (res) => this.error = getResponseMessage(res) )
      },
      giveupQuote(committee, amount) {
        this.busy = true
        return this.$http.post(`leader/giveup/${committee}`, {amount: amount})
        .then( (res) => {
          this.busy = false
          this.data.committee = res.json()
          alert('名额已放弃')
          this.giveup.committee = null
        })
        .catch( (res) => this.error = getResponseMessage(res) )
      },
      getCommitteeName,
      hasQuote({dbId}) {
        return this.data.committee && this.data.committee[dbId] > 0
      },
      showGiveupModal(committee) {
        this.giveup.committee = committee
      },
      showExchangeModal(target, committee) {
        this.exchange.target = target
        this.exchange.committee = committee
      },
      confirm() {

      }
    }
  }
</script>