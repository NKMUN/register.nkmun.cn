<template>
  <div class="lr" :busy="busy">
    <ul class="list selection left">
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
    <div class="details right" v-show="active !== ''">
      <table>
        <thead></thead>
        <tbody v-for="$ in form">
          <tr>
            <th><h4>{{$.section}}</h4></th>
          </tr>
          <tr v-for="_ in $.fields">
            <td class="field-name">{{_.name}}</td>
            <td v-if="_.tag === 'input'">
              <span>{{ activeEntry[_.dbId] }}</span>
            </td>
            <td v-if="_.tag === 'radio'">
              <span v-for="opt in _.opts" v-if="activeEntry[_.dbId] === opt.val">{{ opt.text }}</span>
            </td>
            <td v-if="_.tag === 'textarea'">
              <pre>{{ activeEntry[_.dbId] }}</pre>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="committee">
        <h4>分配名额</h4>
        <validator name="committee">
          <form>
            <div class="field" v-for="$ in committeeMapping">
              <label>
                <span>{{$.name}}</span>
                <input 
                  type="number"
                  :name="$.dbId"
                  :field="$.dbId"
                  v-model="committee[$.dbId]"
                  @change="dirty = true"
                  number
                  :disabled="busy"
                  min=0
                ></input>
              </label>
            </div>
          </form>
        </validator>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  *[busy]
    cursor: progress !important
  .lr
    display: flex
    flex-direction: row
    flex-wrap: nowrap
    align-items: flex-start
    justify-content: flex-start
  .list.selection
    li
      cursor: pointer
    &[active]
      font-weight: bolder
  table tbody
    td
      &:first-child 
        text-align: left
        vertical-align: top
      pre
        margin: 0
</style>

<script>
  import FORM from '../../def/enroll-form'
  import COMMITTEE from '../../def/committee'

  function complainError(res, vm) {
    console.log(res)
    if (res instanceof Error) {
      // TODO: something wrong during process
    }else{
      // complain about connection error
    }
  }

  function extractCollectedField(section) {
    section.fields = section.fields.filter( ({tag}) => tag!=='p' && tag!=='html')
    return section
  }

  function defaultCommittee() {
    let obj = {}
    COMMITTEE.forEach( ({dbId}) => obj[dbId] = 0 )
    return obj
  }

  export default {
    data() {
      return {
        test: false,
        busy: true,
        list: [],
        dirty: false,
        form: FORM.map( extractCollectedField ),
        committeeMapping: COMMITTEE,
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
                .catch( (res) => complainError(res, this) )
                .then( (res) => {
                  this.busy = false
                  this.dirty = false
                })
      },
      load(id) {
        this.busy = true
        return this.$http.get('enroll/'+id)
                   .catch( (res) => complainError(res, this) )
                   .then( (res) => {
                     console.log(res)
                     this.busy = false
                     this.activeEntry = res.json()
                     this.active = id
                     this.committee = this.activeEntry.committee || defaultCommittee()
                     this.dirty = false
                   })
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
      .catch( (res) => complainError(res, this) )
      .then( (res) => {
        this.list = res.json()
        this.busy = false
      })
    }
  }
</script>