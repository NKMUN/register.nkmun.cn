<template>
  <div class="container admin-enroll lr" :busy="busy">
    <div class="left selection">
      <h4>待审核学校列表</h4>
      <ul class="list">
        <li
          v-for="entry in displayList"
          :active="active === entry.id"
          :disabled="busy"
          :busy="busy"
          @click.prevent="!busy ? load(entry.id) : nop()"
        >
          {{entry.id}}
        </li>
      </ul>
    </div>
    <div class="details right" v-show="!active">
      <h4 v-if="untouchedEntries === 0">没有更多待审核学校</h4>
      <h4 v-else>请选择待审核学校</h4>
    </div>
    <div class="details right" v-show="active" v-el:detail>
      <div class="credential">
        <img class="credential-img" :src="imageURL"></img>
      </div>

      <div class="billing-detail">
        <h4>应付款项： ¥ {{ billing ? billing.total : 'Error'}}</h4>
      </div>

      <div class="operation ok">
        <button
          class="xlarge next"
          :disabled="busy"
          @click.prevent="!busy ? accept(active) : nop()"
        >审核通过</button>
        <button
          class="xlarge"
          :disabled="busy"
          @click.prevent="!busy ? load( nextToReview( getDisplayListIdx(active) ) ) : nop()"
        >下一个待审核学校</button>
      </div>

      <div class="operation fail">
        <label class="reason">不通过理由：<input type="text" v-model="rejectReason"></input></label>
        <button
          class="xlarge warn"
          :disabled="busy || !rejectReason"
          @click.prevent="!busy && rejectReason ? reject(active) : nop()"
        >审核不通过{{ !rejectReason ? '（先填写理由）' : ''}}</button>
      </div>

    </div>
  </div>
</template>

<script>
  import getResponseMessage from '../../lib/guess-response-message'
  
  function complainError(res, vm) {
    vm.busy = false
    console.log(res)
    // TODO: complain about error
    getResponseMessage(res).then( msg => alert('Error: '+msg) )
  }

  function byId(a, b) {
    return String(a.id).localeCompare(b.id)
  }

  export default {
    data() {
      return {
        busy: true,
        list: [],
        dirty: false,
        active: null,
        billing: null,
        imageURL: null,
        rejectReason: null
      }
    },
    computed: {
      untouchedEntries() {
        return this.list.filter( $ => ! $.state ).length
      },
      displayList() {
        return this.list.filter( this.needsReview ).sort( byId )
      }
    },
    methods: {
      nop() {},
      needsReview(entry) {
        return !entry.state || entry.state === 'paid'
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
        for (let next=idx+1; next < this.displayList.length; ++next)
          if ( ! this.displayList[next].state )
            return this.displayList[next].id
        for (let next=0; next < idx; ++next)
          if ( ! this.displayList[next].state )
            return this.displayList[next].id
        return null
      },
      loadCredential(id) {
        this.busy = true
        return this.$http.get(`payment/${id}`)
        .then( (res) => res.blob() )
        .then( (blob) => {
          this.clearImageURL()
          this.imageURL = window.URL.createObjectURL(blob) 
        })
        .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      loadBilling(id) {
        this.busy = true
        return this.$http.get(`billing/${id}`)
        .then( (res) => res.json() )
        .then( (json) => this.billing = json )
        .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      load(id) {
        if (id === null) {
          this.active = null
          this.billing = null
          this.rejectReason = null
          return
        }
        this.active = id
        return this.loadBilling(id).then( this.loadCredential(id) )
      },
      clearImageURL() {
        if (this.imageURL) {
          window.URL.revokeObjectURL(this.imageURL)
          this.imageURL = null
        }
      },
      accept(id) {
        const idx = this.getListIdx(id)
        this.busy = true
        return this.$http.post(`payment/${id}`, { accept: this.billing.total })
        .then( (res) => res.json() )
        .then( () => {
          this.load( this.nextToReview(this.getDisplayListIdx(id)) )
          this.list[idx].state = 'payment-confirmed'
          this.list.$set(idx, this.list[idx])    // force view update
        })
        .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      reject(id) {
        const idx = this.getListIdx(id)
        this.busy = true
        return this.$http.post(`payment/${id}`, { reject: this.rejectReason })
        .then( (res) => res.json() )
        .then( () => {
          this.load( this.nextToReview(this.getDisplayListIdx(id)) )
          this.list[idx].state = 'accommodation-confirmed'
          this.list.$set(idx, this.list[idx])    // force view update
        })
        .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      }
    },
    ready() {
      this.busy = true
      this.$http.get('payment')
      .then( (res) => res.json() )
      .then( (json) => this.list = json )
      .catch( (res) => complainError(res, this) )
      .then( () => this.busy = false )
    }
  }
</script>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/tab-view";
  @import "../../styles/flex-lr";
  @import "../../styles/button";
  .credential
    margin-top: 30px
  .credential-img
    width: 500px
  .billing-detail
    font-size: 24px
  .operation.fail
    input[type="text"]
      display: inline-block
      height: 20px
      width: 220px
      padding: 5px 8px
      margin: 5px
      line-height: normal
      border: 1px solid #aaa
      border-radius: 8px
      &:focus
        border: 1px solid #52abf3
        outline: 0
      &[readonly]
        border: none
        vertical-align: middle
    .reason
      display: block
      margin-bottom: 20px
</style>