<template>
  <div>
    <a-row>
      <a-col :span="8">
        <a-button type="primary" @click="showModal">
          {{ $t('buttons.updateTokenInfo') }}
        </a-button>
      </a-col>
      <a-col :span="3" :offset="13">
        <a href="javascript:void(0);" @click="submitInfo">
          {{ $t('buttons.submitExplorer') }}
        </a>
      </a-col>
    </a-row>
  </div>
  <br/>
  <a-card :title="$t('title.notice')" size="large" style="color: #faad14">
    <ol type="1">
      <li>{{ $t('warning.infoFirst') }}</li>
      <li>{{ $t('warning.infoSecond') }}</li>
      <li>{{ $t('warning.infoThird') }}</li>
      <li>{{ $t('warning.infoFourth') }}</li>
    </ol>
  </a-card>
  <div>
    <a-modal
      :title="$t('title.updateSudtInfo')"
      :visible="visible"
      @cancel="handleCancel"
      :confirm-loading="confirmLoading"
      :footer="true"
    >
      <component-sudt-form
        ref="sudtInfoForm"
        :issue-sudt="false"
        :label-column="6"
        :wrapper-column="10"
      ></component-sudt-form>
      <a-row>
        <a-col :span="4" :offset="6">
          <a-button key="submit" type="primary" @click="handleSubmit">
            {{ $t('buttons.submit') }}
          </a-button>
        </a-col>
      </a-row>
    </a-modal>
  </div>
  <br />
  <a-descriptions :title="$t('title.tokenInfo')" bordered>
    <a-descriptions-item :label="$t('labels.tokenName')">
      {{ name }}
    </a-descriptions-item>
    <a-descriptions-item :label="$t('labels.tokenSymbol')">
      {{ symbol }}
    </a-descriptions-item>
    <a-descriptions-item :label="$t('labels.tokenDecimal')">
      {{ decimal === -1 ? '' : decimal }}
    </a-descriptions-item>
    <a-descriptions-item :label="$t('labels.tokenIssuer')">
      {{ address }}
    </a-descriptions-item>
  </a-descriptions>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { message } from 'ant-design-vue'
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import {
  getCells,
  parseSudtInfoData,
  getNetworkConst,
  underscoreScriptKey,
  isKeyperingConnected
} from '@/utils'
import SudtFormComponent from '../components/SudtForm.vue'

export default defineComponent({
  components: {
    'component-sudt-form': SudtFormComponent
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      name: '',
      symbol: '',
      decimal: -1,
      address: ''
    }
  },
  async mounted() {
    const authToken: string | null = window.localStorage.getItem('authToken')
    if (!authToken) {
      message.error(this.$t('errors.noAuth'))
      return
    }
    if (!(await isKeyperingConnected(this))) {
      this.name = ''
      this.symbol = ''
      this.decimal = -1
      this.address = ''
      return
    }

    const sudtInfoTypeScript = getNetworkConst(
      'SUDT_INFO_TYPE_SCRIPT'
    ) as CKBComponents.Script
    sudtInfoTypeScript.args = window.localStorage.getItem('lockHash') || ''

    const cells = await getCells(
      'type',
      underscoreScriptKey(sudtInfoTypeScript)
    )
    if (cells.length === 0) {
      return
    }
    const sudtInfo = parseSudtInfoData(cells[0].output_data, this)

    this.name = sudtInfo.name
    this.symbol = sudtInfo.symbol
    this.decimal = sudtInfo.decimal
    this.address = window.localStorage.getItem('address') || ''
  },
  methods: {
    showModal() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
    handleSubmit: async function (): Promise<
        Record<string, unknown> | undefined | void
        > {
      this.confirmLoading = true
      setTimeout(() => {
        this.visible = false
        this.confirmLoading = false
      }, 2000)
      return (this.$refs.sudtInfoForm as HTMLFormElement).checkFormValidate()
    },
    submitInfo() {
      const sudtTypeScript = getNetworkConst(
        'SUDT_TYPE_SCRIPT'
      ) as CKBComponents.Script
      const sudtTypeArgs = window.localStorage.getItem('lockHash') || ''
      const TOKEN_EMAIL_BODY = `
                          Title: Submit Token Information%0a%0d
                          Type Script:%0a%0d
                              Code Hash: ${sudtTypeScript.codeHash}%0a%0d
                              Hash Type: ${sudtTypeScript.hashType}%0a%0d
                              Args: ${sudtTypeArgs}%0a%0d
                          Information:%0a%0d
                            Full Name: ${this.name}%0a%0d
                            Symbol: ${this.symbol}%0a%0d
                            Decimal: ${this.decimal}%0a%0d
                            Description:%0a%0d
                            Website:%0a%0d
                            Icon File: attachment (40 x 40)%0a%0d
                            Other Info:%0a%0d
                          Note: Only accept sUDT information submission now.
                          `
      open(
          `mailto:asset-info-submit@nervos.org?subject=Submit Token Info&body=${TOKEN_EMAIL_BODY}`
      )
    }
  }
})
</script>
