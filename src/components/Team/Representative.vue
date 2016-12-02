<template>
  <div class="container team-representative-info lr" :busy="busy">
    <div class="left selection">
      <h4>参会人员席位/身份</h4>
      <ul class="list">
        <li
          v-for="entry in list"
          :active="active === entry.id"
          :disabled="busy"
          :busy="busy"
          @click.prevent="!busy ? edit(entry.id) : nop()"
        >
          {{ getCommitteeName(entry.committee) }}
        </li>
      </ul>
    </div>

    <div class="details right" v-show="active" v-el:detail>
      <div class="representative-info">

        <h5>参会人员信息</h5>

        <div class="field">
          <label>
            <span class="field-name">会场/身份</span>
            <input type="text" readonly :value="getCommitteeName(activeEntry.committee)"></input>
          </label>
        </div>

        <div class="field" v-if="canBeLeader">
          <label>
            <span class="field-name">该代表为领队：</span>
            <input
              type="checkbox"
              v-model="activeEntry.is_leader"
              @change="this.dirty = true"
              :disabled="disabled || leaderAssigned"
            ></input>
          </label>
        </div>

        <div class="field">
          <label>
            <span class="field-name">姓名</span>
            <input
              type="text"
              v-model="activeEntry.name"
              @change="this.dirty = true"
              :disabled="disabled"
            ></input>
          </label>
        </div>

        <div class="field">
          <label>
            <span class="field-name">性别</span>
          </label>
          <div class="radio-group">
            <label class="radio-options">
              <input
                type="radio"
                v-model="activeEntry.gender"
                value="m"
                @change="this.dirty = true"
                :disabled="disabled"
              ></input>
              男
            </label>
            <label class="radio-options">
              <input
                type="radio"
                v-model="activeEntry.gender"
                value="f"
                @change="this.dirty = true"
                :disabled="disabled"
              ></input>
              女
            </label>
          </div>
        </div>

        <div class="field" v-if="!isSupervisor">
          <label>
            <span class="field-name">预期毕业年份</span>
            <select v-model="activeEntry.exp_grad" @change="this.dirty = true" :disabled="disabled">
              <option disabled hidden selected value="">[请选择]</option>
              <option v-for="year in GRADUATE_YEARS" :value="year">{{year}}年</option>
            </select>
          </label>
        </div>

        <div class="field">
          <label>
            <span class="field-name">手机</span>
            <input
              type="text"
              v-model="activeEntry.phone"
              @change="this.dirty = true"
            ></input>
          </label>
        </div>

        <div class="field">
          <label>
            <span class="field-name">邮箱</span>
            <input
              type="text"
              v-model="activeEntry.email"
              @change="this.dirty = true"
            ></input>
          </label>
        </div>

        <div class="field">
          <label>
            <span class="field-name">身份证</span>
            <input
              type="text"
              v-model="activeEntry.residence_id"
              @change="this.dirty = true"
            ></input>
          </label>
        </div>

        <h5 v-if="!isSupervisor">保险信息</h5>
        <div class="field" v-if="!isSupervisor">
          <label>
            <span class="field-name">监护人姓名</span>
            <input
              type="text"
              v-model="activeEntry.guardian_name"
              @change="this.dirty = true"
            ></input>
          </label>
        </div>

        <div class="field" v-if="!isSupervisor">
          <label>
            <span class="field-name">监护人关系</span>
            <select v-model="activeEntry.guardian_type" @change="this.dirty = true">
              <option disabled hidden selected value="">[请选择]</option>
              <option value="father">父</option>
              <option value="mother">母</option>
              <option value="other">其他</option>
            </select>
          </label>
        </div>

        <div class="field" v-if="!isSupervisor">
          <label>
            <span class="field-name">监护人身份证号</span>
            <input
              type="text"
              v-model="activeEntry.guardian_residence_id"
              @change="this.dirty = true"
            ></input>
          </label>
        </div>

        <div class="field" v-if="!isSupervisor">
          <label>
            <span class="field-name">监护人手机</span>
            <input
              type="text"
              v-model="activeEntry.guardian_phone"
              @change="this.dirty = true"
            ></input>
          </label>
        </div>

        <h5>备注</h5>

        <div class="field">
          <label>
            <span class="field-name">备注</span>
            <input
              type="text"
              v-model="activeEntry.note"
              @change="this.dirty = true"
            ></input>
          </label>
        </div>
      </div>

      <div class="operation">
        <button
          class="xlarge next"
          @click="!disabled ? update() : nop()"
        >保存</button>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/flex-lr";
  @import "../../styles/button";
  @import "../../styles/list-selection";
  @import "../../styles/form";
  .team-representative-info
    overflow-y: hidden
    align-items: stretch
    .details, .selection
      overflow-x: initial
      overflow-y: scroll
      align-self: stretch
    .selection
      min-width: 22ch
    .details
      flex-grow: 1
    .representative-info
      margin-bottom: 20px
      h5
        padding-left: 140px
        text-align: left
      .radio-group
        display: inline-block
      .field
        span.field-name
          text-align: right
          display: inline-block
          width: 140px
        .quota
          width: 30px
          text-align: right
    .operation
      margin-bottom: 40px
      button.xlarge
        margin-left: 40px
        width: 200px
</style>

<script>
  import {idMapping, canBeLeader} from '../../def/committee'
  import getResponseMessage from '../../lib/guess-response-message'
  import AlertDiv from '../AlertDiv.vue'

  function complainError(res, vm) {
    vm.busy = false
    console.log(res)
    // TODO: complain about error
    getResponseMessage(res).then( msg => alert('Error: '+msg) )
  }

  function byCommitteeId(a, b) {
    return String(a.committee).localeCompare(b.committee)
  }

  const DEFAULT_REPRESENTATIVE = {
    name: null,
    gender: null,
    exp_grad: '',
    phone: null,
    email: null,
    residence_id: null,
    guardian_name: null,
    guardian_type: '',
    guardian_residence_id: null,
    guardian_phone: null,
    note: null
  }

  const SUPERVISOR = {
    guardian_type: 'superv',
    exp_grad: 'superv'
  }

  function createRepresentativeModel(serverData) {
    if (serverData.committee === 'loc_absent_leader')
      return Object.assign( {is_leader: true}, DEFAULT_REPRESENTATIVE, serverData )
    if (serverData.committee === 'loc_superv')
      return Object.assign( {is_leader: false}, DEFAULT_REPRESENTATIVE, SUPERVISOR, serverData )
    // normal representative
    return Object.assign( {is_leader: false}, DEFAULT_REPRESENTATIVE, serverData )
  }

  function createValidatorComputedResult(v) {
    let V = {}
    for (let k in v)
      V[k] = function(s) {
        if (s===null || s==='')
          return null
        else
          return v[k](s)
      }
    return V
  }

  export default {
    components: { AlertDiv },
    created() {
      this.GRADUATE_YEARS = [2017, 2018, 2019, 2020]
    },
    data() {
      return {
        busy: true,
        list: [],
        dirty: false,
        active: '',
        activeEntry: {}
      }
    },
    computed: {
      leaderAssigned() {    // whether leader is inferred from absent leader
        return this.list.filter( $ => $.committee === 'loc_absent_leader' ).length > 0
      },
      canBeLeader() {
        return canBeLeader(this.activeEntry ? this.activeEntry.committee : '')
      },
      isSupervisor() {
        return this.activeEntry && this.activeEntry.committee === 'loc_superv'
      }
    },
    methods: {
      nop() {},
      getCommitteeName(id) {
        return idMapping[id]
      },
      update() {
        this.busy = true
        return this.$http.post('representative/'+this.active, this.activeEntry)
                .then( (res) => {
                  this.busy = false
                  this.dirty = false
                })
                .catch( (res) => complainError(res, this) )
      },
      load(id) {
        if (id === null) {
          this.busy = false
          this.active = null
          return
        }
        this.busy = true
        return this.$http.get('representative/'+id)
                   .then( (res) => res.json() )
                   .then( (json) => {
                     this.busy = false
                     this.activeEntry = createRepresentativeModel(json)
                     this.active = id
                     this.dirty = false
                     this.$els.detail.scrollTop = 0
                   })
                   .catch( (res) => complainError(res, this) )
      },
      edit(id) {
        this.busy = true
        if (this.dirty) {
          this.update().then( this.load(id) )
        }else{
          this.load(id)
        }
      },
    },
    ready() {
      this.busy = true
      this.$http.get('representative')
      .then( (res) => res.json() )
      .then( (json) => {
        this.list = json.sort( byCommitteeId )
        this.busy = false
      })
      .catch( (res) => complainError(res, this) )
    },
    detached() {
      return this.edit(null)
    }
  }
</script>
