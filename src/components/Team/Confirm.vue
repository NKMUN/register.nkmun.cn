<template>
  <div class="container team-representative-info-confirm" :busy="busy">

    <div v-if="!loaded || loaded < total">
      <h4>正在载入，请稍等…… <span v-if="total">({{loaded}} / {{total}})</span></h4>
    </div>

    <div v-if="loaded && loaded >= total" class="representative-info">
      <h4>代表信息</h4>
      <div class="tab-view">
        <ul class="tab-list">
          <li
            v-for="$ in tabs"
            class="tab-name"
            @click.prevent="tab = $key"
            :active="tab === $key"
          >{{$.name}}</li>
        </ul>
        <table v-for="$ in tabs" :data-tab="$key" v-show="tab === $key" class="horz-stripe hover-effect">
          <thead>
            <tr> <th v-for="name in $.fields">{{name}}</th> </tr>
          </thead>
          <tbody>
            <tr v-for="repr in validateResult">
              <td v-for="_ in $.fields" :invalid="!repr[$key].valid">{{ repr[$key].value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="loaded && loaded >= total" class="reservation-info">
      <h4>住宿信息</h4>
      <table class="horz-stripe hover-effect">
        <thead>
          <tr><th>酒店</th><th>房型</th><th>入住时间</th><th>退房时间</th></tr>
        </thead>
        <tbody>
          <tr v-for="$ in reservations">
            <td>{{ $.name }}</td>
            <td>{{ $.type }}</td>
            <td>{{ $.checkIn }}</td>
            <td>{{ $.checkOut }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="loaded && loaded >= total" class="operation">
      <alert-div>
        <div v-if="valid">
          <h5 style="margin-top: 0;">请确认以上信息。<span style="text-decoration: underline;">如有填写错误导致信息无效，后果自负。</span></h5>
          <p>代表信息将用于身份牌印刷、保险购买等事项。</p>
          <p>如果对住宿信息有疑问，请联系组委。</p>
        </div>
        <span v-else>请返回上一个页面，修正不正确的信息（已用红色标出）。</span>
      </alert-div>

      <button class="next xlarge"
        @click="!disabled && valid ? confirmRepresentative() : nop()"
        :disabled="disabled || !valid || loaded < total"
      >确认
      </button>
    </div>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/button";
  @import "../../styles/tab-view";
  .team-representative-info-confirm
    width: 80%
    margin: 0 auto
    td, th
      padding-left: 1ch
      padding-right: 1ch
      &[invalid]
        background-color: #ffd7d7 !important
        color: darkred !important
    .reservation-info
      td, th
        padding-left: 2ch
        padding-right: 2ch
</style>

<script>
  import {idMapping as COMMITTEE_NAME, canBeLeader} from '../../def/committee'
  import getResponseMessage from '../../lib/guess-response-message'
  import AlertDiv from '../AlertDiv.vue'
  import * as re from '../../lib/regexp'
  import V from '../../lib/validators'

  function complainError(res, vm) {
    vm.busy = false
    console.log(res)
    // TODO: complain about error
    getResponseMessage(res).then( msg => alert('Error: '+msg) )
  }

  function byCommitteeId(a, b) {
    return String(a.committee).localeCompare(b.committee)
  }

  const Validate = {
    name:     (s) => s,
    committee: () => true,
    is_leader: () => true,
    gender:   (s) => /^(m|f)$/.test(s),
    exp_grad: (s) => 2017<=s && s<=2020 || s==='superv',
    phone:    (s) => re.phone.test(s),
    email:    (s) => re.email.test(s) && /\.(com|cn|net|org|edu)$/i.test(s),  // limit to common TLD
    note:     (s) => true,
    residence_id:   (s) => V.residenceId(s),
    guardian_name:  (s) => s,
    guardian_type:  (s) => /^(father|mother|other|superv)$/.test(s),
    guardian_phone: (s) => re.phone.test(s),
    guardian_residence_id: (s) => V.residenceId(s),
  }

  const ValueMap = {
    committee: (s) => COMMITTEE_NAME[s] || '***',
    gender: (s) => ({m: '男', f: '女'})[s],
    guardian_type: (s) => ({father: '父', mother: '母', other: '其他', superv: '指导老师'})[s],
    is_leader: (b) => b ? '领队' : '',
    exp_grad: (n) => n === 'superv' ? '指导教师' : n
  }

  export default {
    components: { AlertDiv },
    props: ['data'],
    created() {
      this.tabs = {
        representative: {
          name: '代表信息',
          fields: {
            committee:    '会场',
            is_leader:    '领队标识',
            name:         '姓名',
            gender:       '性别',
            exp_grad:     '预期毕业时间',
            phone:        '手机',
            email:        '邮箱',
            residence_id: '身份证号',
            note:         '备注'
          }
        },
        guardian: {
          name: '监护人',
          fields: {
            committee:    '会场',
            is_leader:    '领队标识',
            name:         '姓名',
            guardian_name: '监护人姓名',
            guardian_type: '监护人关系',
            guardian_residence_id: '监护人身份证号',
            guardian_phone: '监护人手机'
          }
        }
      }
    },
    data() {
      return {
        busy: true,
        representatives: [],
        total: 0,
        loaded: 0,
        valid: null,
        tab: 'representative'
      }
    },
    computed: {
      validateResult() {
        let result = this.representatives.sort(byCommitteeId).map( $ => {
          let ret = {
            id: $.id,
            committee: $.committee
          }
          for (let k in Validate)
            ret[k] = {
              value: ValueMap[k] ? ValueMap[k]($[k]) : $[k],
              valid: Validate[k] ? Validate[k]($[k]) : true
            }
          return ret
        })

        // special check: leader is assigned
        let leaderAssigned = this.representatives.filter( $ => $.is_leader ).length === 1
        result.forEach( $ => $.is_leader.valid = leaderAssigned )

        // special check: guardian of supervisor don't have to be filled
        result.filter( $ => $.committee === 'loc_superv' )
        .forEach( $ => {
          $.guardian_name.valid = true
          $.guardian_residence_id.valid = true
          $.guardian_phone.valid = true
        })

        // special check: observer, supervisor can't be leader
        result.filter( $ => ! canBeLeader($.committee) )
        .forEach( $ => $.is_leader.valid = !$.is_leader.value )

        return result
      },
      reservations() {
        return [ ... this.reservation1, ... this.reservation2 ].sort( (a,b) => (a.name+a.type).localeCompare(b.name+b.type) )
      },
      valid() {
        if (!this.validateResult)
          return false
        for (let i=0; i!==this.validateResult.length; ++i)
          for (let k in Validate)
            if ( ! this.validateResult[i][k] || ! this.validateResult[i][k].valid )
              return false
        return true
      }
    },
    methods: {
      nop() {},
      confirmRepresentative() {
          if ( window.confirm('请检查以上信息是否正确，如因信息错误导致问题，后果自负。确认要提交吗？') ) {
              this.busy = true
              this.$http.post('confirm')
              .then( (res) => res.json() )
              .then( () => {
                  window.alert('信息已确认。感谢您的配合。')
                  this.data.state = 'confirmed'
                  this.$router.replace('')
              })
              .catch( (res) => complainError(res, this) )
              .then( () => this.busy = false )
          }
      }
    },
    ready() {
      this.loaded = 0
      this.total = 3    // total requests that need to complete
      this.busy = true
      Promise.all( [
        // representative info
        this.$http.get('representative')
        .then( (res) => res.json() )
        .then( (json) => {
          this.total += json.length
          this.loaded += 1
          this.representative = []
          return Promise.all(
            json.map( $ => {
              this.$http.get('representative/'+$.id)
              .then( res => res.json() )
              .then( json => this.representatives.push(json) )
              .then( () => this.loaded++)
            })
          )
        }),
        // reservation
        this.$http.get('reservation')
        .then( (res) => res.json() )
        .then( (json) => {
          this.loaded += 1
          this.reservation1 = json
        }),
        this.$http.get('reservation2')
        .then( (res) => res.json() )
        .then( (json) => {
          this.loaded += 1
          this.reservation2 = json
        })
      ])
      .catch( (res) => complainError(res, this) )
      .then( () => this.busy = false )
    }
  }
</script>
