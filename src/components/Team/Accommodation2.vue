<template>
  <div class="container accommodation2" :busy="busy">

    <div class="section own-quota">
      <h4>已分配名额</h4>
      <quota-detail :c1="data.committee" :c2="data.committee2"></quota-detail>
    </div>

    <div class="section accommodation-list">
      <h4>余量 <button @click="!disabled ? fetchAccommodationStock() : nop()" :disabled="disabled">刷新</button></h4>
      <table>
        <thead> <tr> <th>酒店</th> <th>房型</th> <th>余量</th> </tr> </thead>
        <tbody> <tr v-for="_ in accommodationList"> <td>{{_.name}}</td> <td>{{_.type}}</td> <td>{{_.stock}}</td> </tr> <tbody>
      </table>
    </div>

    <div class="section accommodation-selection" v-if="accommodationList">
      <h4>住宿信息</h4>
      <p>
        入住时间最早为：{{date_checkInMin}}，最迟为：{{date_checkInMax}}<br>
        退房时间最早为：{{date_checkOutMin}}，最迟为：{{date_checkOutMax}}<br>
        为方便代表，入住退房时间按间计算，请在每间房间后选择时间
      </p>
      <table class="list">
        <thead>
        <tr>
          <th>酒店</th>
          <th>房型</th>
          <th>入住时间</th>
          <th>退房时间</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
          <tr v-for="(idx, $) in reservations">
            <td>
              <select v-model="$.hotel" @change="$.id=''">
                <option disabled hidden selected value="">[请选择酒店]</option>
                <option v-for="_ in hotels" :value="_.name" :disabled="_.available < 1 && _.name !== $.hotel">{{ _.name }}</option>
              </select>
            </td>
            <td>
              <select v-model="$.id" :disabled="!$.hotel">
                <option disabled hidden selected value="">{{ $.hotel ? "[请选择房型]" : "[请先选择酒店]" }}</option>
                <option v-for="_ in hotelRoomTypes[$.hotel]" :value="_.id" :disabled="_.available < 1 && _.id !== $.id">{{_.type}}</option>
              </select>
            </td>
            <td>
              <input v-model="$.checkIn" type="date" :min="date_checkInMin" :max="date_checkInMax"></input>
            </td>
            <td>
              <input v-model="$.checkOut" type="date" :min="getCheckOutDateMin($.checkIn)" :max="date_checkOutMax" :disabled="!$.checkIn"></input>
            </td>
            <td>
              <button class="warn" @click="reservations.splice(idx, 1)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        @click='!maxReservationReached ? reservations.push({ hotel: null, id: null, checkIn: null, checkOut: null }) : nop()'
        :disabled="maxReservationReached"
        :class="[ maxReservationReached ? 'warn' : 'next']"
      >{{ !maxReservationReached ? "增加房间" : "已达到预定上限" }}</button>
    </div>

    <div class="section accommodation" v-else>
      正在载入...
    </div>

    <div class="section confirm">
      <alert-div>
        <p>
          警告：住宿确认后将进入缴费环节，房间数量不能修改！<br>
          如有额外需求，请与组委联系。
        </p>
      </alert-div>
      <button class="xlarge next" @click="(!busy && validate) ? confirm() : nop()" :disabled="disabled || !validate">确认住宿信息</button>
    </div>

    <overlay-modal v-if="error" class="error">
      <p slot="content">{{ error }}</p>
      <button slot="button" :disabled="disabled" @click="error = null">关闭</button>
    </overlay-modal>
  </div>
</template>

<style lang="stylus">
  @import "../../styles/busy";
  @import "../../styles/form";
  .accommodation2
    width: 80%
    margin: auto
    .accommodation-list
      table
        text-align: center
        border-collapse: collapse
        td,th
          border: 1px solid #ddd
          padding: .5ex 2ch
    table.list
      td select
        min-width: 24ch
</style>

<script>
  import getResponseMessage from '../../lib/guess-response-message'
  import OverlayModal from '../OverlayModal'
  import QuotaDetail from '../QuotaDetail'
  import unique from 'array-unique'
  import dateFormat from 'dateformat'
  import AlertDiv from '../AlertDiv.vue'

  const CHECKIN_DATE_MIN = '2017-01-18'
  const CHECKIN_DATE_MAX = '2017-01-21'
  const CHECKOUT_DATE_MIN = '2017-01-25'
  const CHECKOUT_DATE_MAX = '2017-01-28'

  export default {
    components: { OverlayModal, QuotaDetail, AlertDiv },
    props: ['data'],
    data() {
      return {
        busy: true,
        reservations: [],
        accommodationList: null
      }
    },
    computed: {
      date_checkInMin() { return CHECKIN_DATE_MIN },
      date_checkInMax() { return CHECKIN_DATE_MAX },
      date_checkOutMin() { return CHECKOUT_DATE_MIN },
      date_checkOutMax() { return CHECKOUT_DATE_MAX },
      disabled() { return this.busy },
      numOfRepresentatives() {
        let s = 0
        for (let k in this.data.committee2)
          s += this.data.committee2[k]
        return s
      },
      maxReservationReached() {
        const MAX_NUM_OF_RESERVATION = Math.ceil(this.numOfRepresentatives / 2) + 3
        return this.reservations.length >= MAX_NUM_OF_RESERVATION
      },
      validate() {
        let fails = this.reservations.filter( $ => !$.id || !$.checkIn || !$.checkOut )
        return fails.length === 0
      },
      hotels() {
        return unique( this.accommodationList.map( $ => $.name ) )
               .map( name => ({
                 name,
                 available: this.hotelRoomTypes[name].map( $ => $.available ).reduce( (l,r) => l+r )
               }) )
      },
      hotelRoomTypes() {
        if (!this.accommodationList)
          return {}
        let hotelRoom = {}
        let hotels = unique( this.accommodationList.map( $ => $.name ) )
        hotels.forEach( hotel => {
          hotelRoom[hotel] = this.accommodationList.filter( $ => $.name === hotel )
                             .map( ({id, type, stock}) => ({
                               id,
                               type,
                               available: stock - this.reservations.filter( $ => $.id === id ).length
                              }) )
        })
        return hotelRoom
      }
    },
    methods: {
      nop() {},
      getCheckOutDateMin(checkIn) {
        let checkoutMin = new Date(CHECKOUT_DATE_MIN).valueOf()
        let checkoutMin_1day = new Date(checkIn).valueOf() + 24*60*60*1000    // stay for at least 1 day
        return dateFormat( Math.max(checkoutMin, checkoutMin_1day), 'yyyy-mm-dd')
      },
      fetchAccommodationStock() {
        this.busy = true
        return this.$http.get('accommodation')
        .then( res => res.json() )
        .then( json => this.accommodationList = json )
        .catch( res => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      confirm() {
        let reservations = this.reservations.map( ({id, checkIn, checkOut}) => ({ id, checkIn, checkOut }) )
        return this.$http.post('accommodation2', { reservations })
        .then( res => {
          alert('酒店预订成功')
          this.data.state = 'accommodation-confirmed-2'
          this.$router.replace('payment2')
        })
        .catch( res => {
          if (res && res.status === 410) {
            this.error = '酒店已被他人抢订，请修改预订信息'
            return this.fetchAccommodationStock()
          } else {
            return getResponseMessage(res).then( msg => this.error = msg )
          }
        })
        .then( () => this.busy = false )
      }
    },
    ready() {
      this.fetchAccommodationStock()
    }
  }
</script>
