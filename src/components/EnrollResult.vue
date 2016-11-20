<template>
  <div class="banner">
    <img src="../assets/images/hilogo.png" class="logo" alt="hilogo" v-link="{ path: '/' }" />
    <img src="../assets/images/nklogo.png" class="logo" alt="nklogo" href="https://nkmun.cn/" style="cursor: pointer;"/>
  </div>
  <div class="container enroll-result" :busy="busy">
    <h3>名额分配结果</h3>
    <div v-if="busy">
      正在载入...
    </div>
    <div v-if="error">
      <h4>Oops. 出错了</h4>
      <p>Please try again later.</p>
      <p>请稍后重试</p>
      <pre>{{error}}</pre>
    </div>
    <div class="tab-view-control" v-if="loaded">
      <label class="selector stage1"><input type="checkbox" v-model="stage1"></input>一轮名额</label>
      <label class="selector stage2"><input type="checkbox" v-model="stage2"></input>二轮名额</label>
      <label class="selector sum"><input type="checkbox" v-model="sum"></input>名额总数</label>
    </div>
    <div class="tab-view" v-if="loaded">
      <ul class="tab-list">
        <li
          v-for="group in groups"
          class="tab-name"
          @click.prevent="tab = group.id"
          :active="group.id === tab"
        >{{group.name}}</li>
      </ul>
      <div v-for="group in groups">
        <table :data-tab="group.id" v-show="tab === group.id" class="horz-stripe hover-effect">
          <thead>
            <tr>
              <th> 学校/会场 </th>
              <th v-for="$ in group.keys">{{$.name}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="$ in displaySchools">
              <th>{{$.name}}</th>
              <td v-for="_ in group.keys">
                <div class="quota-wrap lr" v-show="$.committee[_.dbId] && $.committee[_.dbId][0] > 0">
                  <span class="quota stage1" v-if="stage1">{{ $.committee[_.dbId][1] ? $.committee[_.dbId][1] : '-'}}</span>
                  <span class="quota stage2" v-if="stage2">{{ $.committee[_.dbId][2] ? $.committee[_.dbId][2] : '-'}}</span>
                  <span class="quota sum"    v-if="sum">   {{ $.committee[_.dbId][0] }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<style lang="stylus">
  @import "../styles/busy";
  @import "../styles/table";
  @import "../styles/tab-view";
  @import "../styles/flex-lr";
  .tab-name
    cursor: pointer
  .banner
    display: block
    text-align: center
    vertical-align: middle
    width: 100vw
    height: 80px
    background-color: #52abf3
    .logo
      margin: 4px auto
    .logo:nth-child(1)
      padding-right: 20px
    .logo:nth-child(2)
      padding-left: 20px
      border-left: 1px solid #fff
  .enroll-result
    width: 80%
    margin: auto
    text-align: center
    font-size: 18px
    h3
      font-size: 24px
    .quota-wrap
      min-width: 14ch
      align-items: center
      justify-content: center
      .quota
        line-height: initial
        width: 2ch
        padding: 0 .5ch
        text-align: center
      .quota:not(:last-child)
        border-right: 1px solid #bbb
    .stage1
      color: green
    .stage2
      color: blue
    .sum
      color: black
</style>

<script>
  import Vue from 'vue'
  import {groups as COMMITTEE_GROUPS} from '../def/committee'
  import getResponseMessage from '../lib/guess-response-message'
  import {merge} from '../lib/committee-util'

  function byId(a, b) {
    return String(a.id).localeCompare(b.id)
  }

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
        stage1: false,
        stage2: false,
        sum: true
      }
    },
    computed: {
      displaySchools() {
        return this.schools.sort( byId ).map( $ => ({
          name: $.school,
          committee: merge($.committee, $.committee2)
        }) )
      }
    },
    ready() {
      Vue.http.get('enroll?committee=1')
      .then( (res) => res.json() )
      .then( (json) => {
        this.schools = json
        this.loaded = true
      })
      .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
      .then( () => this.busy = false )
    }
  }
</script>
