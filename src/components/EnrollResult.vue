<template>
  <div class="container enroll_result" :busy="busy">
    <h3>预报名结果</h3>
    <div v-if="busy">
      正在载入...
    </div>
    <div v-if="error">
      <h4>Oops. 出错了</h4>
      <p>Please try again later.</p>
      <pre>{{error}}</pre>
    </div>
    <div v-if="loaded">
      <ul class="tab-list">
        <li 
          v-for="group in groups" 
          class="tab-name"
          @click.prevent="tab = group.id"
          :active="group.id === tab"
        >{{group.name}}</li>
      </ul>
      <div v-for="group in groups">
        <table :data-tab="group.id" v-show="tab === group.id">
          <thead>
            <th> <!-- placeholder --> </th>
            <th v-for="$ in group.keys">{{$.name}}</th>
          </thead>
          <tbody>
            <tr v-for="$ in schools">
              <th>{{$.school}}</th>
              <td v-for="_ in group.keys">{{$.committee[_.dbId]}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  </div>
</template>

<style lang="stylus">
  @import "../styles/busy";
  .tab-name
    cursor: pointer
</style>

<script>
  import Vue from 'vue'
  import {groups as COMMITTEE_GROUPS} from '../def/committee'
  import getResponseMessage from '../lib/guess-response-message'

  export default {
    created() {    // bind private, non-reactive data
      this.groups = COMMITTEE_GROUPS
    },
    data() {
      return {
        busy:    true,
        loaded:  false,
        error:   null,
        schools: [],
        tab:     COMMITTEE_GROUPS[0].id,
      }
    },
    ready() {
      Vue.http.get('enroll?committee=1')
      .then( (res) => {
        this.busy = false
        this.schools = res.json()
        this.loaded = true
      })
      .catch( (res) => {
        this.error = getResponseMessage(res)
      })
    }
  }
</script>