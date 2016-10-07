<template>
  <div class="container admin-enroll lr" :busy="busy">
    <div class="left selection">
      <h4>待审核学校列表</h4>
      <ul class="list">
        <li
          v-for="entry in list | filterBy needsReview"
          :active="active === entry.id"
          :disabled="busy"
          :busy="busy"
          @click.prevent="!busy ? edit(entry.id) : nop()"
        >
          {{entry.school}}
        </li>
      </ul>
    </div>
    <div class="details right" v-show="active === ''">
      <h4 v-if="untouchedEntries === 0">没有更多待审核学校</h4>
      <h4 v-else>请选择待审核学校</h4>
    </div>
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
                  max="10"
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

      <div class="operation">
        <button
          class="invite"
          :disabled="busy"
          @click.prevent="!busy ? sendInvitation(active) : nop()"
        >确认并发送邀请信</button> <span class="hint">
        <button
          class="pending"
          :disabled="busy"
          @click.prevent="!busy ? setToPending(active) : nop()"
        >待定</button> <span class="hint">
        <button
          :disabled="busy"
          @click.prevent="!busy ? nextToReview(getListIdx(active)) : nop()"
        >下一个待审核学校</button>
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
      flex-shrink: 0
      align-self: stretch
      h4
        display: block
        font-size: 18px
        text-align: center
        margin: 0 0 5px 0
      .list
        padding: 0
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
    .details
      h4
        text-align: left
      .field
        .value
          max-width: 80ch
        pre.value
          word-break: break-word
          word-wrap:  break-word
          white-space: pre-wrap
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
    .operation
      margin-bottom: 40px
      button
        cursor: pointer
        width: 200px
        height: 45px
        border-radius: 10px
        border: 1px solid #52abf3
        background-color: #52abf3
        color: #fff
        font-size: 14px
        &:disabled
          border: 1px solid #e2e2e2
          background-color: #a2a2a2
      .pending
        background-color: #cc3333
        border: 1px solid #cc3333
      .invite
        background-color: #00cc33
        border: 1px solid #00cc33
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
        committee: {},
      }
    },
    computed: {
      untouchedEntries() {
        return this.list.filter( $ => ! $.state ).length
      }
    },
    methods: {
      nop() {},
      needsReview(entry) {
        return !entry.state || entry.state === 'pending'
      },
      getListIdx(id) {
        for (let idx=0; idx!==this.list.length;++idx)
          if (this.list[idx].id === id)
            return idx
      },
      nextToReview(idx) {
        for (let next=idx+1; next < this.list.length; ++next)
          if ( ! this.list[next].state )
            return this.edit(this.list[next].id)
        this.active = ''
      },
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
      sendInvitation(id) {
        const idx = this.getListIdx(id)
        return this.update()
               .then( () => this.$http.post('invitation/', {id}) )
               .then( (res) => {
                 alert('Invited')
                 // TOOD: hint invitation success
                 this.busy = false
                 this.dirty = false
               })
               .catch( (res) => complainError(res, this) )
               .then( () => this.list[idx].state = 'inviting' )
               .then( () => this.list.$set(idx, this.list[idx]) )    // force view update
               .then( () => this.nextToReview(idx) )
      },
      setToPending(id) {
        const idx = this.getListIdx(id)
        return this.update()
               .then( () => this.$http.post('pending/', {id}) )
               .then( (res) => {
                 alert('Pending set')
                 // TOOD: hint pending set
                 this.busy = false
                 this.dirty = false
               })
               .catch( (res) => complainError(res, this) )
               .then( () => this.list[idx].state = 'pending' )
               .then( () => this.list.$set(idx, this.list[idx]) )    // force view update
               .then( () => this.nextToReview(idx) )
      },
      load(id) {
        this.busy = true
        this.endOfList = false
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
      },
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