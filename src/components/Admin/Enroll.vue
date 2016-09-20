<template>
  <div class="container admin-enroll lr" :busy="busy">
    <ul class="list selection left">
      <span>学校列表</span>
      <li 
        v-for="entry in list" 
        :active="active === entry.id" 
        :disabled="busy"
        :busy="busy"
        @click.prevent="!busy ? edit(entry.id) : nop()"
      >
        {{entry.school}}
      </li>
    </ul>
    <div class="details right" v-show="active !== ''" v-el:detail>
      <div v-for="$ in form" class="section {{$.class}}">
        <h4 class="heading {{$.class}}">{{$.section}}</h4>
        <div class="field" v-for="_ in $.fields">
          <span class="field-name">{{_.name}}</span>
          <span class="value" v-if="_.tag === 'input'">{{ activeEntry[_.dbId] }}</span>
          <span class="value" v-if="_.tag === 'radio'">
            <template v-for="opt in _.opts" v-if="activeEntry[_.dbId] === opt.val">{{ opt.text }}</template>
          </span>
          <span class="value" v-if="_.tag === 'integer'">{{ activeEntry[_.dbId] }}</span>
          <pre class="value" v-if="_.tag === 'textarea'">{{ activeEntry[_.dbId] }}</pre>
        </div>
      </div>

      <div class="committee">
        <h4>分配名额</h4>
        <validator name="committee">
          <form>
            <div class="field" v-for="$ in committeeMapping">
              <label>
                <span>{{$.name}}</span>
                <input-integer
                  min="0"
                  step="1"
                  :name="$.dbId"
                  :field="$.dbId"
                  :placeholder="$.placeholder"
                  :disabled="disabled"
                  v-validate="$.validate"
                  v-model="committee[$.dbId]"
                  @change.prevent="this.dirty = true"
                ></input-integer>
              </label>
            </div>
          </form>
        </validator>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/tab-list";
  @import "../../styles/flex-lr";
  .admin-enroll
    align-items: stretch
    .details, .selection
      overflow-x: initial
      overflow-y: scroll
    .details
      flex-grow: 1
    .selection
      margin: 0 4ch 0 0
      padding: 16px 14px 16px 10px
      font-size: 14px
      line-height: 24px
      background: #293038
      color: #fff
      list-style: none
      overflow-y: scroll
      overflow-x: hidden
      span
        display: block
        font-size: 18px
        text-align: center
        margin-bottom: 5px
      li
        cursor: pointer
        margin-bottom: 5px
        padding: 0 10px
        max-width: 30ch
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap
      &[active]
        font-weight: bolder
    table tbody
      h4
        text-align: left
      td
        text-align: left
        &:first-child
          width: 20%
          vertical-align: top
        pre
          margin: 0
          width: 80%
          word-break: break-word
          word-wrap: break-word
          white-space: pre-line
    .committee
      text-align: left
      .field
        span
          text-align: center
          display: inline-block
          width: 80px
        .quota
          width: 30px
          text-align: right
</style>

<script>
  import {review as FORM} from '../../def/enroll-form'
  import COMMITTEE from '../../def/committee'
  import getResponseMessage from '../../lib/guess-response-message'
  import TEST_FLAG from '../../directives/test-flag'
  import InputInteger from '../FormInput/Integer'

  function complainError(res, vm) {
    vm.busy = false
    console.log(res)
    // TODO: complain about error
    let msg = getResponseMessage(res)
  }

  function defaultCommittee() {
    let obj = {}
    COMMITTEE.forEach( ({dbId}) => obj[dbId] = 0 )
    return obj
  }

  export default {
    components: {
      'input-integer': InputInteger
    },
    created() {    // bind private, non-reactive data
      this.test = TEST_FLAG    // debug flag
      this.form = FORM     // form generation data
      this.committeeMapping = COMMITTEE    // committee allocation
    },
    data() {
      return {
        busy: true,
        list: [],
        dirty: false,
        active: '',
        activeEntry: {},
        committee: {}
      }
    },
    computed: {
      committeeValidate() {
        return {
          min: 0,
          max: this.activeEntry.quote
        }
      }
    },
    methods: {
      nop() {},
      update() {
        this.busy = true
        let payload = {
          committee: this.committee
        }
        return this.$http.post('enroll/'+this.active+'?update=1', payload)
                .then( (res) => {
                  this.busy = false
                  this.dirty = false
                })
                .catch( (res) => complainError(res, this) )
      },
      load(id) {
        this.busy = true
        return this.$http.get('enroll/'+id)
                   .then( (res) => {
                     console.log(res)
                     this.busy = false
                     this.activeEntry = res.json()
                     this.active = id
                     this.committee = this.activeEntry.committee || defaultCommittee()
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
      }
    },
    ready() {
      this.busy = true
      this.$http.get('enroll')
      .then( (res) => {
        this.list = res.json()
        this.busy = false
      })
      .catch( (res) => complainError(res, this) )
    }
  }
</script>