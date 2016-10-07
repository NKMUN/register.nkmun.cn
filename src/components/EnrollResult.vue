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
  @import "../styles/table";
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
    .tab-list
      text-align: left
      border-bottom: 1px solid #ddd
      .tab-name
        margin-bottom: -1px
        text-align: center
        width: 120px
        height: 30px
        color: #428bca
        margin-right: 2px
        line-height: 30px
        border: 1px solid transparent
        border-radius: 4px 4px 0 0
      .tab-name:active
        background-color: transparent
      .tab-name[active]
        vertical-align: middle
        color: #555
        cursor: default
        background-color: #fff
        border: 1px solid #ddd
        border-bottom-color: transparent
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