<template>
  <div>
    <h4>支付</h4>

    <ol>
      <li>
        <h4>用以下一种方式完成支付：</h4>
        <ul>
          <li>
            <h5>银行转账</h5>
            <p>
              卡号：6217856100007698647<br>
              卡主：王亚炜<br>
              开户行：中国银行 南京梅花山庄支行
            </p>
          </li>
          <li>
            <h5>支付宝</h5>
            <p>请扫描二维码转账</p>
            <!--<img src="../../assets/images/payment_qr_code.jpg"></img>-->
          </li>
        </ul>
      </li>

      <li>
        <h4>上传支付凭证</h4>
        <p>截图中请包含 转账人、金额、时间、手续费</p>
        <form novalidate enctype="multipart/form-data">
          <p>仅接受jpg和png格式，文件需小于1MB</p>
          <label>
            支付凭证：
            <input v-el:file type="file" accept="image/jpeg, image/png, .jpg, .jpeg, .png" required></input>
          </label>
        </form>
      </li>

      <li>
        <h4>等待审核</h4>
      </li>
    </ol>

  </div>
</template>

<script>
  export default {
  }
</script>