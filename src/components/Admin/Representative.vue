<template>
  <div class="container admin-representative-info">
    <div v-if="!schoolStateList || ! representativeList">
      <h4>正在载入...</h4>
    </div>
    <div v-else>
      <button class="xlarge next" @click="!busy && exportRepresentatives()">导出代表信息 (CSV)</button>
      <button class="xlarge next" @click="!busy && exportReservations()">导出住宿信息 (CSV)</button>
    </div>
  </div>
</template>

<script>
  function complainError(res) {
    // TODO: complain about error
    getResponseMessage(res).then( msg => alert('Error: '+msg) )
  }

  import {idMapping as COMMITTEE_NAME, canBeLeader} from '../../def/committee'
  import csvStringify from 'csv-stringify'
  import saveAsFile from '../../lib/save-as-file'

  const RepresentativeTableHeader = [
    '学校',
    '会场',
    '领队标识',
    '姓名',
    '性别',
    '预期毕业时间',
    '手机',
    '邮箱',
    '身份证',
    '监护人关系',
    '监护人姓名',
    '监护人身份证',
    '监护人手机',
    '备注'
  ]

  // TableMapper Utilities
  const AsIs = (field) => ($) => $[field]

  // macth TableHeader in order
  const RepresentativeTableMappers = [
    AsIs('school'),
        ({committee}) => COMMITTEE_NAME[committee] || '***',
        ({is_leader}) => is_leader ? '领队' : '',
    AsIs('name'),
        ({gender}) => ({m: '男', f: '女'})[gender],
        ({exp_grad}) => exp_grad==='superv' ? '指导老师' : exp_grad,
    AsIs('phone'),
    AsIs('email'),
    AsIs('residence_id'),
        ({guardian_type}) => ({father: '父', mother: '母', other: '其他', superv: '指导老师'})[guardian_type],
    AsIs('guardian_name'),
    AsIs('guardian_residence_id'),
    AsIs('guardian_phone'),
    AsIs('note')
  ]

  // reduce json -> csv-compatible Array
  const RepresentativeTableMapper = ($) => RepresentativeTableMappers.reduce(
    (row, mapper) => [ ...row, mapper($) || '' ]
    , []
  )

  const ReservationTableHeaders = [
    '学校',
    '酒店',
    '房型',
    '入住日期',
    '退房日期'
  ]

  const ReservationTableMappers = [
    AsIs('school'),
    AsIs('name'),
    AsIs('type'),
    AsIs('checkIn'),
    AsIs('checkOut')
  ]

  const ReservationTableMapper = ($) => ReservationTableMappers.reduce(
    (row, mapper) => [ ...row, mapper($) || '' ]
    , []
  )

  const byColumn = (n) => (a, b) => String(a[n]).localeCompare( String(b[n]) )

  export default {
    data() {
      return {
        busy: false,
        representativeList: null,
        schoolStateList: null,
        reservationList: null,
      }
    },
    computed: {
      schoolConfirmed() {
        if ( ! this.schoolStateList )
          return null
        let ret = {}
        this.schoolStateList.forEach( ({school, state}) =>  ret[school] = state === 'confirmed' )
        return ret
      },
      representativeTable() {
        if ( ! this.representativeList )
          return null
        return this.representativeList.map( RepresentativeTableMapper )
      },
      reservationTable() {
        if ( ! this.reservationList )
          return null
        return this.reservationList.map( ReservationTableMapper )
      }
    },
    methods: {
      exportRepresentatives() {
        let header = [ '确认标识', ...RepresentativeTableHeader ]
        // copy, sort, insert confirmation flag
        let rows = [ ...this.representativeTable ]
                   .sort( byColumn(0) )
                   .map( $ => [ this.schoolConfirmed[$[0]] ? '已确认' : '', ...$ ])

        csvStringify( [header, ...rows], (err, csv) => {
          if (err)
            return alert('导出失败：' + err.message)
          // download blob to local disk
          let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;', endings: 'transparent' })
          let filename = '参会代表信息.csv'
          saveAsFile(blob, filename)
        })
      },
      exportReservations() {
        csvStringify( [
          ReservationTableHeaders,
          ... [...this.reservationTable].sort( byColumn(0) )
        ], (err, csv) => {
          if (err)
            return alert('导出失败：' + err.message)
          let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;', endings: 'transparent' })
          let filename = '住宿信息.csv'
          saveAsFile(blob, filename)
        })
      }
    },
    ready() {
      this.busy = true
      Promise.all([
        this.$http.get('enroll/status'),
        this.$http.get('representative-list'),
        this.$http.get('reservation-list'),
        this.$http.get('reservation2-list')
      ])
      .then( (resps) => Promise.all( resps.map( resp => resp.json() ) ) )
      .then( ([ states, representatives, reservation, reservation2 ]) => {
        this.schoolStateList = states
        this.representativeList = representatives
        this.reservationList = [ ...reservation, ...reservation2 ]
        this.busy = false
      })
      .catch( () => alert('Error when fetching data') )
    }
  }
</script>

<style lang="stylus">
  @import '../../styles/button'
  .admin-representative-info
    margin: 15px 0 0 30px
    button
      display: block
      margin-bottom: 20px
</style>
