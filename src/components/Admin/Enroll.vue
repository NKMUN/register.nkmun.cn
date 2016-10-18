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
          @click.prevent="!busy ? edit( nextToReview( getListIdx(active) ) ) : nop()"
        >下一个待审核学校</button>
      </div>

    </div>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/tab-view";
  @import "../../styles/flex-lr";
  .admin-enroll
    overflow-y: hidden
    align-items: stretch
    .details, .selection
      overflow-x: initial
      overflow-y: scroll
      align-self: stretch
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
          text-align: right
          display: inline-block
          width: 180px
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
        border: 1px solid #46b8da
        background-color: #5bc0de
        color: #fff
        font-size: 14px
        &[disabled], &[disabled]:hover
          border: 1px solid #e2e2e2
          background-color: #a2a2a2
      button:hover
        background-color: #31b0d5
        border-color: #269abc
      button:active
        outline: 0
        box-shadow: inset 0 3px 5px rgba(0,0,0,.125)
        background-color: #31b0d5
        border-color: #269abc
      .pending
        background-color: #d9534f
        border: 1px solid #ac2925
      .pending:hover
        background-color: #c9302c
        border-color: #ac2925
      .pending: active
        outline: 0
        box-shadow: inset 0 3px 5px rgba(0,0,0,.125);
        background-color: #c9302c
        border-color: #ac2925
      .invite
        background-color: #5cb85c
        border: 1px solid #4cae4c
      .invite:hover
        background-color: #449d44
        border-color: #398439
      .invite:active
        outline: 0
        box-shadow: inset 0 3px 5px rgba(0,0,0,.125);
        background-color: #449d44
        border-color: #398439
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
    alert('Error: '+msg)
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
            return this.list[next].id
        for (let next=0; next < idx; ++next)
          if ( ! this.list[next].state )
            return this.list[next].id
        return null
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
                 alert('已发送邀请')
                 // TOOD: hint invitation success
                 this.busy = false
                 this.dirty = false
                 this.list[idx].state = 'inviting'
                 this.list.$set(idx, this.list[idx])    // force view update
                 this.edit( this.nextToReview(idx) )
               })
               .catch( (res) => complainError(res, this) )
      },
      setToPending(id) {
        const idx = this.getListIdx(id)
        return this.update()
               .then( () => this.$http.post('pending/', {id}) )
               .then( (res) => {
                 alert('保留在待审核列表')
                 // TOOD: hint pending set
                 this.busy = false
                 this.dirty = false
                 this.list[idx].state = 'pending'
                 this.list.$set(idx, this.list[idx])    // forve cire update
                 this.edit( this.nextToReview(idx) )
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