<template>
  <div class="container payment" :busy="busy">
    <h4>支付</h4>

    <ol>
      <li>
        <h4 v-if="billing">应付款项：<span class="currency">CNY ¥ {{billing.total}}</span></h4>
        <h4 v-else="!billing">正在计算应付款...</h4>
      </li>
      <li>
        <h4>请选择以下一种手段完成支付：</h4>
        <div class="tab-view">
          <ul class="tab-list">
            <li class="tab-name" @click.prevent="tab = 'bank'" :active="tab === 'bank'">银行转账</li>
            <li class="tab-name" @click.prevent="tab = 'alipay'" :active="tab === 'alipay'">支付宝</li>
          </ul>
          <div v-if="tab === 'bank'">
            <p>请选择一个银行账号进行转账：</p>
            <bank-transfer-cred
              card="6212264301018811073"
              name="王亚炜"
              branch="工商银行南京月牙湖支行"
            ></bank-transfer-cred>
            <bank-transfer-cred
              card="6236691370000065362"
              name="王亚炜"
              branch="建设银行南京中山门支行"
            ></bank-transfer-cred>
            <bank-transfer-cred
              card="6217856100007698647"
              name="王亚炜"
              branch="中国银行南京梅花山庄支行"
            ></bank-transfer-cred>
          </div>
          <div v-if="tab === 'alipay'">
            <p>请用支付宝扫描以下二维码转账：</p>
            <img id="alipay" alt="支付宝二维码" src="../../assets/images/nkmun-alipay-qr.jpg"><img>
          </div>
        </div>
      </li>

      <li v-if="data.state === 'payment-rejected'">
        <h4>请重新上传缴费凭证，如银行交易明细单。</h4>
        <p v-if="data.paymentStatus
              && data.paymentStatus.state === 'rejected'
              && data.paymentStatus.reason"
        >审核未通过原因：{{data.paymentStatus.reason}}</p>
        <span style="color: red">请在一张图片内包含所有缴费记录，且总额等于应缴费额</span>
      </li>

      <li>
        <h4>上传支付凭证</h4>
        <p>请上传 银行转账凭证 或 支付宝转账截图，包含 转账人、金额、时间</p>
        <form novalidate enctype="multipart/form-data">
          <p>仅接受jpg和png格式，文件需小于1MB</p>
          <label>
            支付凭证：
            <input :disabled="disabled" v-el:file @change="changeFile()" type="file" accept="image/jpeg, image/png, .jpg, .jpeg, .png" required></input>
          </label>
          <span class="hint"> {{ validError }} </span>
        </form>
        <button class="next xlarge" :disabled="disabled || !valid" @click.prevent="!disabled && valid ? sumbitPaymentCred() : nop()">提交</button>
      </li>

      <li>
        <h4>等待审核</h4>
      </li>

    </ol>

    <overlay-modal v-if="error" class="error">
      <h4>出错了。</h4>
      <div slot="content">
        <p>{{ error }}</p>
        <p>请稍后再试</p>
      </div>
      <button slot="button" :disabled="disabled" @click="error = null">关闭</button>
    </overlay-modal>

  </div>
</template>

<script>
  import BankTransferCred from '../BankTransferCred'
  import OverlayModal from '../OverlayModal'
  import getResponseMessage from '../../lib/guess-response-message'

  function guessMime(name) {
    if (name.match(/\.(jpg|jpeg)$/i))
      return 'image/jpeg'
    if (name.match(/\.png$/i))
      return 'image/png'
    return 'application/octet-stream'
  }

  export default {
    props: ['data'],
    components: { BankTransferCred, OverlayModal },
    data() {
      return {
        tab: 'bank',
        busy: false,
        error: null,
        billing: null,
        credFile: null,
        validError: null
      }
    },
    computed: {
      billingEntries() {
        if (!this.billing || !this.billing.detail)
          return []
        let {committee, accommodation} = this.billing.detail
        return [
          ... committee,
          ... accommodation.sort( (a,b) => a.name.localeCompare(b.name) )
        ]
      },
      disabled() {
        return this.busy
      },
      valid() {
        return this.credFile
      }
    },
    methods: {
      nop() {},
      sumbitPaymentCred() {
        this.busy = true
        let mime = guessMime(this.credFile.name)
        let form = new FormData()
        form.append('cred', this.credFile)
        form.append('mime', mime)
        this.$http.post('payment2', form)
        .then( (res) => {
          alert('支付凭据上传成功，请等待组委审核。')
          this.data.state = 'paid'
          this.$router.replace('overview')
        })
        .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
        .then( () => this.busy = false )
      },
      changeFile() {
        let files = this.$els.file.files
        let file = files[0]
        this.credFile = null
        this.validError = null
        if (files.length !== 1)
          return this.validError = '请浏览并选择支付凭证'
        if ( ! file.name.match(/\.(jpg|jpeg|png)$/i) )
          return this.validError = '文件必须是jpg或png图像'
        if ( file.size > 1024*1024 )
          return this.validError = '文件必须小于1MB'
        this.credFile = file
      }
    },
    ready() {
      this.busy = true
      return this.$http.get('leader/billing2')
      .then( (res) => res.json() )
      .then( (json) => this.billing = json )
      .catch( (res) => getResponseMessage(res).then( msg => this.error = msg ) )
      .then( () => this.busy = false )
    }
  }
</script>

<style lang="stylus">
  @import "../../styles/button";
  @import "../../styles/busy";
  .container.payment
    width: 80%
    margin: auto
    .currency
      font-weight: bolder
      color: red
    .hint
      color: red
    .danger
      color: red
      font-size: 30px
  #alipay
    width: 300px
    height: auto
</style>
