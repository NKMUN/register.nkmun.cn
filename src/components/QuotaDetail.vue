<template>
  <table class="quota-detail">
    <tr>
      <th>名额归属</th>
      <th>一轮</th>
      <th>二轮</th>
      <th>合计</th>
    </tr>
    <tr v-for="$ in displayCommittee">
      <th><span class="name">{{ $.name }}</span></th>
      <td><span class="quota">{{ $.quota[1] > 0 ? $.quota[1] : ' ' }}</span></td>
      <td><span class="quota">{{ $.quota[2] > 0 ? $.quota[2] : ' ' }}</span></td>
      <td><span class="quota"><b>{{ $.quota[0] }}</b></span></td>
    </tr>
  </table>
</template>

<script>
  import { toArray, merge } from '../lib/committee-util'
  export default {
    props: ['c1', 'c2'],
    computed: {
      displayCommittee() { return toArray( merge(this.c1, this.c2) ) }
    }
  }
</script>

<style lang="stylus">
  table.quota-detail
    thead, tbody
      tr td
        padding: 0 4ch
        text-align: center
      th
        padding: 0 2ch
        text-align: center
</style>
