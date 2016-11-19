<template>
  <div class="container admin-stage2 lr" :busy="busy">
    <div class="left selection">
      <h4>待分配学校列表</h4>
      <ul class="list">
        <li
          v-for="entry in displayList"
          :active="active === entry.id"
          :disabled="busy"
          :busy="busy"
          @click.prevent="!busy ? edit(entry.id) : nop()"
        >
          {{entry.school}}
        </li>
      </ul>
    </div>
    <div class="details right" v-show="!active">
      <h4 v-if="untouchedEntries === 0">没有更多待分配学校</h4>
      <h4 v-else>请选择待分配学校</h4>
    </div>
    <div class="details right" v-show="active" v-el:detail>
      <div class="committee">
        <h4>分配二轮名额：{{active}}</h4>
        <validator name="committee">
          <form>
            <table>
              <thead>
                <tr>
                  <th class="committee-name">会场</th>
                  <th class="stage1">一轮</th>
                  <th class="stage2">二轮</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="$ in committeeMapping">
                  <td class="committee-name">{{$.name}}</td>
                  <td class="stage1">{{ committee[$.dbId] > 0 ? committee[$.dbId] : ' ' }}</td>
                  <td class="stage2">
                    <input-integer
                      min="0"
                      max="10"
                      step="1"
                      :name="$.dbId"
                      :field="$.dbId"
                      :placeholder="$.placeholder"
                      :disabled="disabled"
                      :lighter="!committee2[$.dbId]"
                      :darker="committee2[$.dbId] > 0"
                      v-validate="$.validate"
                      v-model="committee2[$.dbId]"
                      @change.prevent="this.dirty = true"
                    ></input-integer>
                  </td>
                <tr>
              </tbody>
            </table>
          </form>
        </validator>
      </div>

      <div class="operation">
        <button
          class="xlarge next"
          :disabled="busy"
          @click.prevent="!busy ? confirmStage2(active) : nop()"
        >确认并分配二轮名额</button>
        <button
          class="xlarge"
          :disabled="busy"
          @click.prevent="!busy ? edit( nextToReview( getDisplayListIdx(active) ) ) : nop()"
        >下一个待分配学校</button>
      </div>

    </div>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/tab-view";
  @import "../../styles/flex-lr";
  @import "../../styles/button";
  @import "../../styles/list-selection";
  .admin-stage2
    overflow-y: hidden
    align-items: stretch
    .selection, .details
      overflow-x: initial
      overflow-y: scroll
      align-self: stretch
    .details
      flex-grow: 1
    .committee
      text-align: left
      td, th
        padding: 0 3ch
      .committee-name, .stage1
        text-align: right
      .stage2
        input
          width: 5ch
    .operation
      margin-bottom: 40px
      button.xlarge
        width: 200px
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
    getResponseMessage(res).then( msg => alert('Error: '+msg) )
  }

  function defaultCommittee() {
    let obj = {}
    COMMITTEE.forEach( ({dbId}) => obj[dbId] = 0 )
    return obj
  }

  function bySchoolName(a, b) {
    return String(a.school).localeCompare(b.school)
  }

  export default {
    components: {
      'input-integer': InputInteger
    },
    created() {    // bind private, non-reactive data
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
        committee2: {},
      }
    },
    computed: {
      untouchedEntries() {
        return this.list.length
      },
      displayList() {
        return this.list.filter( this.needsReview ).sort( bySchoolName )
      }
    },
    methods: {
      nop() {},
      needsReview(entry) {
        return entry.state === 'payment-confirmed'
      },
      getListIdx(id) {
        for (let idx=0; idx!==this.list.length;++idx)
          if (this.list[idx].id === id)
            return idx
      },
      getDisplayListIdx(id) {
        for (let idx=0; idx!==this.displayList.length; ++idx)
          if (this.displayList[idx].id === id)
            return idx
      },
      nextToReview(idx) {
        return this.displayList[(idx+1) % this.displayList.length].id
      },
      update() {
        this.busy = true
        let payload = {
          committee2: this.committee2
        }
        return this.$http.post('enroll/'+this.active+'?update=1', payload)
                .then( (res) => {
                  this.busy = false
                  this.dirty = false
                })
                .catch( (res) => complainError(res, this) )
      },
      confirmStage2(id) {
        const idx = this.getListIdx(id)
        return this.update()
               .then( () => this.$http.post('stage2/', {id}) )
               .then( (res) => {
                 alert('已分配二轮名额')
                 // TOOD: hint invitation success
                 this.busy = false
                 this.dirty = false
                 this.edit( this.nextToReview(this.getDisplayListIdx(id)) )
                 this.list[idx].state = 'stage-2'
                 this.list.$set(idx, this.list[idx])    // force view update
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
        return this.$http.get('enroll/committee/'+id)
                   .then( (res) => res.json() )
                   .then( (json) => {
                     this.busy = false
                     this.active = id
                     this.committee = json.committee
                     this.committee2 = json.committee2 || defaultCommittee()
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
      .then( (res) => res.json() )
      .then( (json) => {
        this.list = json
        this.busy = false
      })
      .catch( (res) => complainError(res, this) )
    }
  }
</script>
