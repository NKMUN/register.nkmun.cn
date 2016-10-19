<template>
  <div class="container quote-exchange" :busy="busy">
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
          <td><button class="warn" :disabled="disabled" @click="showGiveupModal($.dbId)">放弃</button></td>
        </tr>
      </table>
    </div>

    <div class="section requests">
      <h3>待处理申请 <button :disabled="disabled" @click="!disabled ? fetchPendingRequests() : nop()">刷新</button> </h3>
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
          <td>
            <button class="accept next" :disabled="disabled" @click="!busy ? acceptExchange($.id) : nop()">接受</button>
            <button class="accept warn" :disabled="disabled" @click="!busy ? refuseExchange($.id) : nop()">拒绝</button>
          </td>
        </tr>
      </table>
      <div v-else>
        <p>暂无</p>
      </div>
    </div>

    <div class="section others-quote">
      <h3>选择交换学校、会场 <button :disabled="disabled" @click="!disabled ? fetchSchoolQuotes() : nop()">刷新</button></h3>
      <div class="alert alert-danger" role="alert">
        <span class="danger">警告：请慎重选择对方学校及名额，建议提前完成沟通，一旦交换成功，不可撤销。</span>
      </div>
      <div v-if="schools" class="tab-view">
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
                    <button class="exchange-num" :disabled="disabled" > {{$.committee[_.dbId]}} </button>
                    <button class="exchange-btn" :disabled="disabled" @click="!disabled ? showExchangeModal($.id, _.dbId) : nop()">交换</button>
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
      <button class="xlarge next" :disabled="disabled" @click="!disabled ? confirm() : nop()">确认名额</button>
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
        <button class="next"
          @click="!disabled && validGiveup ? giveupQuote(giveup.committee, giveup.amount) : nop()"
          :disabled="disabled || !validGiveup"
        >确认</button>
        <button class="warn" :disabled="disabled" @click="clearGiveupModal()">取消</button>
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
                <option
                  v-for="$ in committees | filterBy hasQuote"
                  :disabled="$.dbId===exchange.targetCommittee"
                  :value="$.dbId"
                >{{ getCommitteeName($.dbId) }}</option>
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
        <button class="next"
          @click="!disabled && validExchange ? exchangeQuote(exchange.selfCommittee, exchange.target, exchange.targetCommittee, exchange.amount) : nop()"
          :disabled="disabled || !validExchange"
        >确认
        </button>
        <button class="warn" :disabled="disabled" @click="clearExchangeModal()">取消</button>
      </div>
    </overlay-modal>

    <overlay-modal v-if="error" class="error">
      <p slot="content">{{ error }}</p>
      <button slot="button" :disabled="disabled" @click="error = null">关闭</button>
    </overlay-modal>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/form";
  @import "../../styles/button";
  .quote-exchange
    width: 80%
    margin: 15px auto
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
    .confirmation
      text-align: center
      h3, div
        text-align: left
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
  function handleExchangeError(res) {
    if (!res) {
      this.error = getResponseMessage(res)
    } else {
      switch (res.status) {
        case 410:
          this.error = '名额不足，请重试'
          return this.fetchSelfQuote().then( this.fetchSchoolQuotes() )
        break
        default:
          this.error = getResponseMessage(res)
        break
      }
    }
  }

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
        error: null,
        schools: null,
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
        if (!this.exchangeTargetSchool)
          return undefined
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
        .then( res => this.schools = res.json() )
        .catch( res => this.error = getResponseMessage(res) )
        .then( () => this.busy = false )
      },
      fetchSelfQuote() {
        this.busy = true
        return this.$http.get('leader')
        .then( res => this.data = res.json() )
        .catch( res => this.error = getResponseMessage(res) )
        .then( () => this.busy = false )
      },
      fetchPendingRequests() {
        this.busy = true
        return this.$http.get('leader/exchange-request')
        .then( res => this.requests = res.json() )
        .catch( res => this.error = getResponseMessage(res) )
        .then( () => this.busy = false)
      },
      acceptExchange(id) {
        this.busy = true
        return this.$http.post(`leader/exchange-request/${id}`)
        .then( (res) => {
          alert('名额交换已接受')
          return this.fetchPendingRequests().then( this.fetchSelfQuote() ).then( this.fetchSchoolQuotes() ) 
        })
        .catch( handleExchangeError.bind(this) )
        .then( () => this.busy = false)
      },
      refuseExchange(id) {
        this.busy = true
        return this.$http.delete(`leader/exchange-request/${id}`)
        .then( (res) => {
          alert('名额交换已拒绝')
          return this.fetchPendingRequests()
        })
        .catch( (res) => this.error = getResponseMessage(res) )
        .then( () => this.busy = false)
      },
      giveupQuote(committee, amount) {
        this.busy = true
        return this.$http.post(`leader/giveup/${committee}`, {amount: amount})
        .then( (res) => {
          this.data.committee = res.json()
          alert('名额已放弃')
          this.clearGiveupModal()
        })
        .catch( handleExchangeError.bind(this) )
        .then( () => this.busy = false )
      },
      exchangeQuote(selfCommittee, target, targetCommittee, amount) {
        return this.$http.post('leader/exchange-request', {
          from:   this.data.id,
          to:     target,
          offer:  selfCommittee,
          wanted: targetCommittee,
          amount: amount
        })
        .then( (res) => {
          alert('交换申请已发送')
          this.clearExchangeModal()
        })
        .catch( handleExchangeError.bind(this) )
        .then( () => this.busy = false)
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
        this.busy = true
        let answer = window.confirm('确认名额后不能再进行修改')
        if (answer) {
          return this.$http.post('leader/confirm-quote', {})
          .then( res => {
            this.data.state = 'quote_confirmed'
            alert('名额已确认，请填写住宿信息并付款')
            this.$router.replace('hotel')
          })
          .catch( res => this.error = getResponseMessage(res) )
          .then( () => this.busy = false )
        }
      }
    }
  }
</script>
