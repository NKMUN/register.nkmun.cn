<template>
  <div class="container quote-exchange">
    <div class="section own-quote">
      <h3>已分配名额</h3>
      <div class="alert alert-danger" role="alert">
        <span class="danger">警告：请在确认名额不进行交换且不进行报名后，再点击放弃按钮。一旦放弃，不可撤销。</span>
      </div>
      <table class="quote-detail">
        <tr>
          <th>名额归属</th>
          <th>数量</th>
          <th>操作</th>
        </tr>
        <tr v-for="$ in committees | filterBy hasQuote">
          <td><span class="name">{{ getCommitteeName($.dbId) }}</span></td>
          <td><span class="quote">{{ data.committee[$.dbId] }}</span></td>
          <td><button @click="showGiveupModal($.dbId)" class="no">放弃</button></td>
        </tr>
      </table>
    </div>

    <div class="section requests">
      <h3>待处理申请 <button @click="!disabled ? fetchPendingRequests() : nop()">刷新</button> </h3>
      <table v-if="requests.length" class="waiting-apply">
        <tr>
          <th>来源学校</th>
          <th>会场</th>
          <th>数量</th>
          <th>需求会场</th>
          <th>操作</th>
        </tr>
        <tr v-for="$ in requests" class="request-entry">
          <td><span class="from-school">{{ $.from }}</span></td>
          <td><span class="offer">{{ getCommitteeName($.offer) }}</span></td>
          <td><td><span class="amount">{{ $.amount }}</span></td>
          <td><span class="wanted">{{ getCommitteeName($.wanted) }}</span></td>
          <td><button class="accept yes" @click="!busy ? acceptExchange($.id) : nop()">接受</button>
          <button class="accept no" @click="!busy ? refuseExchange($.id) : nop()">拒绝</button></td>
        </tr>
      </table>
      <div v-else>
        <p>暂无</p>
      </div>
    </div>

    <div class="section others-quote">
      <h3>选择交换学校、会场 <button @click="!disabled ? fetchSchoolQuotes() : nop()">刷新</button></h3>
      <div class="alert alert-danger" role="alert">
        <span class="danger">警告：请慎重选择对方学校及名额，建议提前完成沟通，一旦交换成功，不可撤销。</span>
      </div>
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
          <table :data-tab="group.id" v-show="tab === group.id" class="horz-stripe hover-effect exchange-list" v-if="exchangableSchools.length > 0">
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
                  <div v-if="$.committee[_.dbId] > 0" class="btn-group">
                    <button class="exchange-num"> {{$.committee[_.dbId]}} </button>
                    <button @click="!disabled ? showExchangeModal($.id, _.dbId) : nop()" class="exchange-btn">交换</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else><p>暂无可交换学校</p></div>
        </div>
      </div>
    </div>

    <div class="section confirmation">
      <h3>名额确认</h3>
      <div class="alert alert-danger" role="alert">
        <span class="danger">警告：请于名额交换完成后确认最上方“已分配名额”栏目中的名额信息，确认后不能再放弃或交换</span>
      </div>
      <button @click="!disabled ? confirm() : nop()">确认名额</button>
    </div>

    <overlay-modal v-if="giveup.committee" class="giveup">
      <h3 slot="caption">放弃名额：{{ getCommitteeName(giveup.committee) }}</h3>
      <div slot="content">
        <form novalidate noautocomplete>
          <div class="field">
            <label>
              <span class="field-name">数量：</span>
              <input-integer
                class="field-value small"
                v-model="giveup.amount"
                min="0"
                :max="maxGiveupAmount"
                step="1"
                :disabled="disabled"
              ></input-integer>
            </label>
          </div>
        </form>
      </div>
      <div slot="button">
        <div class="alert alert-danger" role="alert">
          <span class="danger">警告：名额放弃后不可撤销！</span>
        </div>
        <button class="yes"
          @click="!disabled && validGiveup ? giveupQuote(giveup.committee, giveup.amount) : nop()"
          :disabled="disabled || !validGiveup"
        >确认</button>
        <button class="no" @click="clearGiveupModal()">取消</button>
      </div>
    </overlay-modal>

    <overlay-modal v-if="exchange.target" class="exchange">
      <h3 slot="caption">交换名额</h3>
      <div slot="content">
        <form novalidate noautocomplete>
          <div class="field">
            <label>
              <span class="field-name">对方学校：</span>
              <span class="field-value">{{ exchangeTargetSchool.school }}</span>
            </label>
          </div>
          <div class="field">
            <label>
              <span class="field-name">对方会场：</span>
              <span class="field-value">{{ getCommitteeName(exchange.targetCommittee) }}</span>
            </label>
          </div>
          <div class="field">
            <label>
              <span class="field-name">己方会场：</span>
              <select v-model="exchange.selfCommittee">
                <option value="" disabled hidden selected>[请选择会场]</option>
                <option v-for="$ in committees | filterBy hasQuote" :value="$.dbId">{{ getCommitteeName($.dbId) }}</option>
              </select>
            </label>
          </div>
          <div class="field">
            <label>
              <span class="field-name">数量：</span>
              <input-integer
                class="field-value small"
                v-model="exchange.amount"
                min="0"
                :max="maxExchangeAmount"
                step="1"
                :disabled="disabled || !exchange.selfCommittee"
                :placeholder="exchange.selfCommittee ? '请输入交换数量' : '请选择己方会场'"
              ></input-integer>
            </label>
          </div>
        </form>
      </div>
      <div slot="button">
        <div class="alert alert-danger" role="alert">
          <span class="danger">警告：名额交换确认后不可撤销！</span>
        </div>
        <button class="yes"
          @click="!disabled && validExchange ? exchangeQuote(exchange.selfCommittee, exchange.target, exchange.targetCommittee, exchange.amount) : nop()"
          :disabled="disabled || !validExchange"
        >确认
        </button>
        <button class="no" @click="clearExchangeModal()">取消</button>
      </div>
    </overlay-modal>

    <overlay-modal v-if="error" class="error">
      <p slot="content">Oops. 服务器故障，请稍后再试</p>
      <pre>{{ error }}</pre>
      <button slot="button" @click="error = null">关闭</button>
    </overlay-modal>
  </div>
</template>

<style lang="stylus">
  .quote-exchange
    width: 80%
    margin: 15px auto
    button
      width: 45px
      height: 28px
      background-color: #5bc0de
      color: #fff
      border: 1px solid #46b8da
      border-radius: 4px
      &:hover
        background-color: #31b0d5
        border-color: #269abc
      &:active
        outline: 0
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125)
        background-color: #31b0d5
        border-color: #269abc
      &[disabled]
        border: 1px solid #e2e2e2 !important
        background-color: #a2a2a2 !important
        &:hover
          cursor: not-allowed !important
      &.yes
        background-color: #5cb85c
        border: 1px solid #4cae4c
        &:hover
          background-color: #449d44
          border-color: #398439
        &:active
          outline: 0
          box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125)
          background-color: #449d44
          border-color: #398439
      &.no
        background-color: #d9534f
        border: 1px solid #ac2925
        &:hover
          background-color: #c9302c
          border-color: #ac2925
        &:active
          outline: 0
          box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125)
          background-color: #c9302c
          border-color: #ac2925
    .quote-detail
      text-align: center
      td
        width: 15%
    .waiting-apply
      text-align: center
      td
        width: 15%
    .exchange-list
      tr
        height: 35px
    .btn-group
      height: 25px
      vertical-align: middle
      margin: auto
      .exchange-num
        display: inline-block
        margin: 0
        background-color: #5cb85c
        color: #fff
        width: auto
        height: 25px
        border: 1px solid #4cae4c
        border-top-right-radius: 0
        border-bottom-right-radius: 0
      .exchange-num:hover
        cursor: default !important
      .exchange-btn
        background-color: #5cb85c
        padding-left: 0
        width: auto
        height: 25px
        border: 1px solid #4cae4c
        border-top-left-radius: 0
        border-bottom-left-radius: 0
        margin-left: -5px
        padding-left: 2px
        &:hover
          background-color: #449d44
          border-color: #398439
        &:active
          outline: 0
          box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125)
          background-color: #449d44
          border-color: #398439
    .confirmation
      text-align: center
      h3, div
        text-align: left
      button
        width: 200px
        height: 45px
        margin=top: 15px
        border-radius: 10px
        border: 1px solid #46b8da
        background-color: #5bc0de
        color: #fff
        font-size: 14px
        &:hover
          background-color: #31b0d5
          border-color: #269abc
        &:active
          outline: 0
          box-shadow: inset 0 3px 5px rgba(0,0,0,.125)
          background-color: #31b0d5
          border-color: #269abc
  .alert
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid transparent;
    border-radius: 4px;
  .alert-danger
    color: #a94442;
    background-color: #f2dede;
    border-color: #ebccd1;
  .danger
    color: #d9534f
  .overlay.exchange
    form
      .field
        .field-name
          width: 80px
</style>

<script>
  import OverlayModal from '../OverlayModal'
  import getResponseMessage from '../../lib/guess-response-message'
  import {groups as COMMITTEE_GROUPS, ungrouped as committees, idMapping as committee_name} from '../../def/committee'
  import InputInteger from '../FormInput/Integer'

  function getCommitteeName(dbId) { return committee_name[dbId] }
  function find( pred ) { return (res, $) => res || (pred($) ? $ : null) }

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
          targetCommittee: null,
          selfCommittee: null,
          amount: null
        }
      }
    },
    computed: {
      disabled() { return this.busy || this.modal },
      modal() { this.giveup.committee || this.exchange.target },
      exchangableSchools() {
        return this.schools.filter( ({ id, state, committee={} }) => {
          let quotes = 0
          for (let k in committee)
            quotes += committee[k]
          let isSelf = id === this.data.id
          let stateIsValid = 'inviting, invited, registered'.indexOf(state)>=0    // avoid ES6/7 Array.include
          return !isSelf && stateIsValid && quotes > 0
        } )
      },
      exchangeTargetSchool() {
        return this.schools.reduce( find( $ => $.id === this.exchange.target ), null )
      },
      maxExchangeAmount() {
        const {targetCommittee, selfCommittee} = this.exchange
        const amountSelfCommittee = this.data.committee[selfCommittee]
        const amountTargCommittee = this.exchangeTargetSchool.committee[targetCommittee]
        return Math.min( amountSelfCommittee, amountTargCommittee )
      },
      maxGiveupAmount() {
        return this.data.committee[this.giveup.committee]
      },
      validExchange() {
        const {target, targetCommittee, selfCommittee, amount} = this.exchange
        return target && targetCommittee && selfCommittee && amount > 0 && amount <= this.maxExchangeAmount
      },
      validGiveup() {
        const {committee, amount} = this.giveup
        return committee && amount > 0 && amount <= this.maxGiveupAmount
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
          this.clearGiveupModal()
        })
        .catch( (res) => this.error = getResponseMessage(res) )
      },
      exchangeQuote(selfCommittee, target, targetCommittee, amount) {
        return this.$http.post('leader/exchange', { target, targetCommittee, selfCommittee, amount })
        .then( (res) => {
          this.busy = false
          alert('交换申请已发送')
          this.clearExchangeModal()
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
      clearGiveupModal() {
        this.giveup.committee = null
      },
      showExchangeModal(target, committee) {
        this.exchange.target = target
        this.exchange.targetCommittee = committee
        this.exchange.selfCommittee = null
      },
      clearExchangeModal(target, committee) {
        this.exchange.target = null
        this.exchange.targetCommittee = null
        this.exchange.selfCommittee = null
      },
      confirm() {

      }
    }
  }
</script>
