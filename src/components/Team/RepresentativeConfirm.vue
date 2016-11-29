<template>
  <div class="container team-representative-info-confirm" :busy="busy">

    <div v-if="!loaded || loaded < total">
      <h4>正在载入，请稍等…… <span v-if="total">({{loaded}} / {{total}})</span></h4>
    </div>

    <div v-if="loaded && loaded >= total" class="representative-info">
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
            <tr>
              <th>会场</th>
              <th v-for="name in $.fields">{{name}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="repr in displayTable">
              <th>{{ getCommitteeName(repr.committee) }}</th>
              <td v-for="_ in $.fields" :invalid="!repr[$key].valid">{{ repr[$key].value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="loaded && loaded >= total" class="operation">
      <alert-div>
        <span>{{ valid ? '请核对代表信息，确认后不能修改。' : '请返回上一个页面，修正不正确的信息（已用红色标出）。' }}</span>
      </alert-div>

      <button class="next xlarge"
        @click="!disabled && valid ? confirmRepresentative() : nop()"
        :disabled="disabled || !valid"
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
      &[invalid]
        background-color: #ffd7d7 !important
        color: darkred !important
</style>

<script>
  import {idMapping} from '../../def/committee'
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
    gender:   (s) => /^(m|f)$/.test(s),
    exp_grad: (s) => 2017<=s && s<=2020,
    phone:    (s) => re.phone.test(s),
    email:    (s) => re.email.test(s) && /\.(com|cn|net|org|edu)$/i.test(s),  // limit to common TLD
    note:     (s) => true,
    residence_id:   (s) => V.residenceId(s),
    guardian_name:  (s) => s,
    guardian_type:  (s) => /^father|mother|other$/.test(s),
    guardian_phone: (s) => re.phone.test(s),
    guardian_residence_id: (s) => V.residenceId(s),
  }

  const ValueMap = {
    gender: (s) => ({m: '男', f: '女'})[s],
    guardian_type: (s) => ({father: '父', mother: '母', other: '其他'})[s]
  }

  export default {
    components: { AlertDiv },
    props: ['data'],
    created() {
      this.tabs = {
        representative: {
          name: '代表信息',
          fields: {
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
        tab: 'representative'
      }
    },
    computed: {
      validateResult() {
        return this.representatives.map( $ => {
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
      },
      displayTable() {
        return this.validateResult.sort( byCommitteeId )
      }
    },
    methods: {
      nop() {},
      getCommitteeName(id) {
        return idMapping[id]
      },
      confirmRepresentative() {
        
      }
    },
    ready() {
      this.loaded = 0
      this.total = null
      this.busy = true
      this.$http.get('representative')
      .then( (res) => res.json() )
      .then( (json) => {
        this.total = json.length
        this.representative = []
        return Promise.all(
          json.map( $ => {
            this.$http.get('representative/'+$.id)
            .then( res => res.json() )
            .then( json => this.representatives.push(json) )
            .then( () => this.loaded++)
          })
        )
      })
      .catch( (res) => complainError(res, this) )
      .then( () => this.busy = false )
    }
  }
</script>
