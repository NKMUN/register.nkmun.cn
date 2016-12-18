<template>
  <div class="container admin-representative-info">
    <div v-if="!schoolStateList || ! representativeList">
      <h4>正在载入...</h4>
    </div>
    <div v-else>
      <button class="xlarge next" @click="!busy && exportCSV()">导出代表信息 (CSV)</button>
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

  const TableHeader = [
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
  const TableMappers = [
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
  const TableMapper = ($) => TableMappers.reduce(
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
      }
    },
    computed: {
      schoolConfirmed() {
        if ( ! this.schoolStateList )
          return null
        let ret = {}
        this.schoolStateList.forEach( ({school, state}) => {
          ret[school] = state === 'confirmed'
        })
        return ret
      },
      readableTable() {
        if ( ! this.representativeList )
          return null
        return this.representativeList.map( $ => TableMapper($) )
      },
    },
    methods: {
      exportCSV() {
        let header = [ '确认标识', ...TableHeader ]
        // copy, sort, insert confirmation flag
        let rows = [ ...this.readableTable ]
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
      }
    },
    ready() {
      this.busy = true
      this.$http.get('enroll/status')    // request school's state
      .then( (res) => res.json() )
      .then( (json) => this.schoolStateList = json )
      .then( () => this.$http.get('representative-list') )    // request all representatives
      .then( (res) => res.json() )
      .then( (json) => this.representativeList = json )
      .then( () => this.busy = false )
      .catch( (res) => complainError.bind(this) )
    }
  }
</script>

<style lang="stylus">
  @import '../../styles/button'
</style>
