<template>
  <div class="container quota-exchange" :busy="busy">
    <div class="section own-quota">
      <h3>已分配名额</h3>
      <quota-detail :c1="data.committee" :c2="data.committee2"></quota-detail>
    </div>

    <div class="section requests" v-if="timeout">
      <h3>待处理交换申请 <button :disabled="disabled" @click="!disabled ? fetchPendingRequests() : nop()">刷新</button> </h3>
      <div class="alert alert-danger" role="alert">
        <span class="danger">警告：请谨慎处理来自双代会场的名额。名额确认时，双代会场名额必须为偶数。</span>
      </div>
      <table v-if="requests.length" class="waiting-apply">
        <tr>
          <th>来源学校</th>
          <th>会场</th>
          <th>数量</th>
          <th>需求会场</th>
          <th>操作</th>
          <th>备注</th>
        </tr>
        <tr v-for="$ in requests" class="request-entry">
          <td><span class="from-school">{{ $.from }}</span></td>
          <td><span class="offer">{{ getCommitteeName($.offer) }}</span></td>
          <td><span class="amount">{{ $.amount }}</span></td>
          <td><span class="wanted">{{ getCommitteeName($.wanted) }}</span></td>
          <td>
            <button class="accept next" :disabled="disabled" @click="!busy ? acceptExchange($.id) : nop()">接受</button>
            <button class="accept warn" :disabled="disabled" @click="!busy ? refuseExchange($.id) : nop()">拒绝</button>
          </td>
          <td><span class="note">{{ $.note ? $.note : '' }}</span></td>
        </tr>
      </table>
      <div v-else>
        <p>暂无</p>
      </div>
    </div>

    <div class="section others-quota" v-if="timeout">
      <h3>名额交换 <button :disabled="disabled" @click="!disabled ? fetchSchoolQuotas() : nop()">刷新</button></h3>
      <div class="alert alert-danger" role="alert">
        <span class="danger">警告：请慎重选择对方学校及名额，建议提前完成沟通，一旦交换成功，不可撤销。</span>
      </div>
      <div v-if="schools" class="tab-view">
        <ul class="tab-list">
          <li
            v-for="group in xchgGroups"
            class="tab-name"
            @click.prevent="tab = group.id"
            :active="group.id === tab"
          >{{group.name}}</li>
        </ul>
        <div v-for="group in xchgGroups" v-show="tab === group.id">
          <table :data-tab="group.id" class="horz-stripe hover-effect exchange-list" v-if="exchangableSchools.length > 0">
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
                  <div v-if="$.committee[_.dbId] > 0" class="quota">
                    <span class="number"> {{$.committee[_.dbId]}} </span>
                    <button class="next" :disabled="disabled" @click="!disabled ? showExchangeModal($.id, _.dbId) : nop()">交换</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else><p>暂无可交换学校</p></div>
        </div>
      </div>
    </div>

    <div class="section others-quota" v-if="!timeout">
      <h3>名额交换已经结束</h3>
    </div>

    <div class="section giveup">
      <h3>放弃名额</h3>
      <div class="alert alert-danger" role="alert">
        <span class="danger">警告：放弃的名额将进入二轮分配！放弃后不可恢复！名额确认时，双代会场名额必须为偶数。</span>
      </div>
      <table class="quota-detail">
        <tr>
          <th>名额归属</th>
          <th>数量</th>
          <th>操作</th>
        </tr>
        <tr v-for="$ in committees | filterBy hasQuota">
          <td><span class="name">{{ getCommitteeName($.dbId) }}</span></td>
          <td><span class="quota">{{ data.committee[$.dbId] }}</span></td>
          <td><button class="warn" :disabled="disabled" @click="showGiveupModal($.dbId)">放弃</button></td>
        </tr>
      </table>
    </div>

    <div class="section confirmation">
      <h3>名额确认</h3>
      <div class="alert alert-danger" role="alert">
        <span class="danger">警告：请确认以上名额信息，确认后不能再进行交换或放弃。双代会场名额必须为偶数。</span>
      </div>
      <div class="confirm-checkbox center">
        <!-- intentionally unlabeled, reduces clickable area, to prevent accident click -->
        <div class="field">
          <label>领队是否参会：
            <select v-model="optLeaderAttend">
              <option selected disabled hidden :value="null">[请选择]</option>
              <option :value="true">参会</option>
              <option :value="false">不参会</option>
            </select>
          </label>
        </div>
        <div class="field">
          <input type="checkbox" v-model="confirmQuota"></input><span>我已确认所有名额正确无误并知晓确认后不可修改</span>
        </div>
      </div>
      <button class="xlarge next" :disabled="disabled || !confirmQuota || optLeaderAttend===null" @click="!disabled && confirmQuota && optLeaderAttend!==null ? confirm() : nop()">确认名额</button>
    </div>

    <overlay-modal v-if="giveup.committee" class="giveup">
      <h3 slot="caption">放弃名额：{{ getCommitteeName(giveup.committee) }}</h3>
      <div slot="content">
        <form novalidate noautocomplete>
          <div class="field">
            <label>
              <span class="field-name">数量：</span>
              <input-integer
                class="field-value"
                v-model="giveup.amount"
                min="0"
                :max="maxGiveupAmount"
                step="1"
                :disabled="disabled"
                placeholder="请输入放弃数量"
              ></input-integer>
            </label>
          </div>
        </form>
        <div class="alert alert-danger" role="alert" v-if="timeout">
          <span class="danger huge">警告：交换名额请不要点击下面的确定！交换名额请不要点击下面的确定！交换名额请不要点击下面的确定！</span>
        </div>
      </div>
      <div slot="button">
        <div class="confirm-checkbox">
          <!-- intentionally unlabeled, reduces clickable area, to prevent accident click -->
          <input type="checkbox" v-model="giveup.confirm"></input><span>我已确认放弃名额并知晓该操作不可撤销</span>
        </div>
        <button class="next"
          @click="!disabled && validGiveup && giveup.confirm ? giveupQuota(giveup.committee, giveup.amount) : nop()"
          :disabled="disabled || !validGiveup || !giveup.confirm"
        >确认</button>
        <button class="warn" :disabled="disabled" @click="clearGiveupModal()">取消</button>
      </div>
    </overlay-modal>

    <overlay-modal v-if="exchange.target" class="exchange" v-if="timeout">
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
                  v-for="$ in xchgCommittees | filterBy isExchangableCommittee"
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
                class="field-value"
                v-model="exchange.amount"
                min="0"
                :max="maxExchangeAmount"
                step="1"
                :disabled="disabled || !exchange.selfCommittee"
                :placeholder="exchange.selfCommittee ? '请输入交换数量' : '请选择己方会场'"
              ></input-integer>
            </label>
          </div>
          <div class="field">
            <label>
              <span class="field-name">备注：</span>
              <input
                class="field-value"
                v-model="exchange.note"
                maxlength="2048"
                type="text"
                placeholder="备注"
                :disabled="disabled"
              ></input>
            </label>
          </div>
        </form>
      </div>
      <div slot="button">
        <div class="confirm-checkbox">
          <!-- intentionally unlabeled, reduces clickable area, to prevent accident click -->
          <input type="checkbox" v-model="exchange.confirm"></input><span>我已确认进行交换并知晓该操作不可撤销</span>
        </div>
        <button class="next"
          @click="!disabled && validExchange && exchange.confirm ? exchangeQuota(exchange.selfCommittee, exchange.target, exchange.targetCommittee, exchange.amount, exchange.note) : nop()"
          :disabled="disabled || !validExchange || !exchange.confirm"
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
  @import "../../styles/alert";
  .quota-exchange
    width: 80%
    margin: 15px auto
    .section
      margin-top: 100px
    .section:first-child
      margin-top: 0
    .waiting-apply
      text-align: center
      width: 100%
      th, td
        width: auto
    .exchange-list
      tr
        height: 35px
      .quota
        display: flex
        flex-direction: row
        justify-content: center
        align-items: stretch
        .number, button
          margin: 0
          display: inline-block
          border-radius: 4px
          border-collapse: saperate
          font: inherit
          font-size: 80%
        .number
          background-color: #5cb85c
          color: #fff
          border: 1px solid #4cae4c
          padding: 0 .5ch 0 1ch
          border-top-right-radius: 0
          border-bottom-right-radius: 0
        button
          padding: 0 1ch 0 .5ch
          border-top-left-radius: 0
          border-bottom-left-radius: 0
    .confirmation
      text-align: center
      h3
        text-align: left
  .confirm-checkbox
    margin: 1em 0
    &.center
      text-align: center
    div.field
      margin: .5em 0
    input[type=checkbox]
      height: 14px
      width: 14px
  .overlay.exchange
    form
      .field
        .field-name
          width: 80px
  .huge
    font-size: 30px
</style>

<script>
  import OverlayModal from '../OverlayModal'
  import QuotaDetail from '../QuotaDetail'
  import getResponseMessage from '../../lib/guess-response-message'
  import {
    groups as COMMITTEE_GROUPS,
    ungrouped as committees,
    exchangableGroups as XCHG_COMMITTEE_GROUPS,
    exchangableUngrouped as XCHG_COMMITTEES,
    idMapping as committee_name
  } from '../../def/committee'
  import InputInteger from '../FormInput/Integer'

  function getCommitteeName(dbId) { return committee_name[dbId] }
  function find( pred ) { return (res, $) => res || (pred($) ? $ : null) }
  function handleExchangeError(res) {
    if (!res) {
      getResponseMessage(res).then( msg => this.error = msg )
    } else {
      switch (res.status) {
        case 410:
          this.error = '名额不足，请重试'
          return this.fetchSelfQuota().then( this.fetchSchoolQuotas() )
        break
        default:
          getResponseMessage(res).then( msg => this.error = msg )
        break
      }
    }
  }

  export default {
    components: { OverlayModal, InputInteger, QuotaDetail },
    props: ['data'],
    created() {
      this.groups = COMMITTEE_GROUPS
      this.committees = committees
      this.xchgGroups = XCHG_COMMITTEE_GROUPS,
      this.xchgCommittees = XCHG_COMMITTEES
    },
    ready() {
      this.fetchPendingRequests()
      .then( this.fetchSchoolQuotas() )
    },
    data() {
      return {
        timeout: false,
        busy: false,
        error: null,
        schools: null,
        requests: [],
        tab: COMMITTEE_GROUPS[0].id,
        confirmQuota: false,
        optLeaderAttend: null,
        giveup: {
          committee: null,
          amount: 0,
          confirm: false
        },
        exchange: {
          target: null,
          targetCommittee: null,
          selfCommittee: null,
          amount: null,
          confirm: false,
          note: null
        }
      }
    },
    computed: {
      disabled() { return this.busy || this.modal },
      modal() { this.giveup.committee || this.exchange.target },
      exchangableSchools() {
        return this.schools.filter( ({ id, state, committee={} }) => {
          let quotas = 0
          for (let k in committee)
            quotas += committee[k]
          let isSelf = id === this.data.id
          let stateIsValid = 'inviting, invited, registered'.indexOf(state)>=0    // avoid ES6/7 Array.include
          return !isSelf && stateIsValid && quotas > 0
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
      fetchSchoolQuotas() {
        this.busy = true
        return this.$http.get('enroll?committee=1')
        .then( res => res.json() )
        .then( json => this.schools = json )
        .catch( res => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      fetchSelfQuota() {
        this.busy = true
        return this.$http.get('leader')
        .then( res => res.json() )
        .then( json => this.data = json )
        .catch( res => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      fetchPendingRequests() {
        this.busy = true
        return this.$http.get('leader/exchange-request')
        .then( res => res.json() )
        .then( json => this.requests = json )
        .catch( res => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false)
      },
      acceptExchange(id) {
        this.busy = true
        return this.$http.post(`leader/exchange-request/${id}`)
        .then( (res) => {
          alert('名额交换已接受')
          return this.fetchPendingRequests().then( this.fetchSelfQuota() ).then( this.fetchSchoolQuotas() )
        })
        .catch( handleExchangeError.bind(this) )
        .then( () => this.busy = false )
      },
      refuseExchange(id) {
        this.busy = true
        return this.$http.delete(`leader/exchange-request/${id}`)
        .then( res => {
          alert('名额交换已拒绝')
          return this.fetchPendingRequests()
        })
        .catch( res => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      giveupQuota(committee, amount) {
        this.busy = true
        return this.$http.post(`leader/giveup/${committee}`, {amount: amount})
        .then( (res) => res.json() )
        .then( (json) => {
          this.data.committee = json
          alert('名额已放弃')
          this.clearGiveupModal()
        })
        .catch( handleExchangeError.bind(this) )
        .then( () => this.busy = false )
      },
      exchangeQuota(selfCommittee, target, targetCommittee, amount, note) {
        return this.$http.post('leader/exchange-request', {
          from:   this.data.id,
          to:     target,
          offer:  selfCommittee,
          wanted: targetCommittee,
          amount: amount,
          note:   note
        })
        .then( (res) => {
          alert('交换申请已发送')
          this.clearExchangeModal()
        })
        .catch( handleExchangeError.bind(this) )
        .then( () => this.busy = false)
      },
      getCommitteeName,
      hasQuota({dbId}) {
        return this.data.committee && this.data.committee[dbId] > 0
      },
      isExchangableCommittee({dbId}) {
        return this.hasQuota({dbId}) && dbId!=='loc_observer' && dbId!=='loc_superv'
      },
      showGiveupModal(committee) {
        this.giveup.committee = committee
        this.giveup.amount = null
        this.giveup.confirm = false
      },
      clearGiveupModal() {
        this.giveup.committee = null
      },
      showExchangeModal(target, committee) {
        this.exchange.target = target
        this.exchange.targetCommittee = committee
        this.exchange.selfCommittee = null
        this.exchange.amount = null
        this.exchange.confirm = false
        this.exchange.note = null
      },
      clearExchangeModal(target, committee) {
        this.exchange.target = null
      },
      confirm() {
        if ( this.data.committee.loc_cn_3 % 2
          || this.data.committee.loc_en_1 % 2
          || this.data.committee.loc_en_2 % 2
          || this.data.committee.loc_en_3 % 2
          || this.data.committee.loc_en_4 % 2
          || this.data.committee.loc_en_5 % 2
        ) {    // Condemn Improper Requirement Document!
          return window.alert('请检查双代会场名额数量是否为偶数！')
        }
        if ( window.confirm('确认名额后不能再进行修改') ) {
          this.busy = true
          return this.$http.post('leader/confirm-quota', {
            optLeaderAttend: this.optLeaderAttend
          })
          .then( res => {
            this.data.state = 'quota-confirmed'
            alert('名额已确认，请填写住宿信息并付款')
            this.$router.replace('accommodation')
          })
          .catch( res => getResponseMessage(res).then( msg => this.error = msg ) )
          .then( () => this.busy = false )
        }
      }
    }
  }
</script>
