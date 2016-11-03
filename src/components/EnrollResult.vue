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
            <tr v-for="$ in schools">
              <th>{{$.school}}</th>
              <td v-for="_ in group.keys">{{$.committee ? $.committee[_.dbId] : 0}}</td>
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