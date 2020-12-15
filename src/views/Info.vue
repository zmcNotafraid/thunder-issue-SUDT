<template>
  <div>
    <a-row>
      <a-col :span="8">
        <a-button type="primary" @click="showModal"> Update Token Info </a-button>
      </a-col>
      <a-col :span="3" :offset="13">
        <a href="javascript:void(0);" @click="submitInfo">
          Submit to ckb Explorer
        </a>
      </a-col>
    </a-row>
    <a-modal
      title="Update SUDT Info"
      :visible="visible"
      @cancel="handleCancel"
      :confirm-loading="confirmLoading"
    >
      <component-sudt-form ref="sudtInfoForm" :issue-sudt=false></component-sudt-form>
      <template v-slot:footer>
        <a-button key="back" @click="handleCancel"> Cancel </a-button>
        <a-button key="submit" type="primary" @click="handleSubmit">
          Submit
        </a-button>
      </template>
    </a-modal>
  </div>
  <br />
  <a-descriptions title="Token Info" bordered>
    <a-descriptions-item label="Name">
      {{ name }}
    </a-descriptions-item>
    <a-descriptions-item label="Symbol">
      {{ symbol }}
    </a-descriptions-item>
    <a-descriptions-item label="Decimal">
      {{ decimal }}
    </a-descriptions-item>
    <a-descriptions-item label="Issuer">
      {{ address }}
    </a-descriptions-item>
  </a-descriptions>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { message } from 'ant-design-vue'
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { scriptToHash } from '@nervosnetwork/ckb-sdk-utils'
import {
  getCells,
  parseSudtInfoData,
  SUDT_TYPE_SCRIPT,
  camelCaseScriptKey
} from '@/utils'
import { UnderscoreScript, UnderscoreCell } from '../interface/index'
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
      decimal: 0,
      address: ''
    }
  },
  async mounted() {
    const authToken: string | null = window.localStorage.getItem('authToken')
    if (!authToken) {
      message.error('No auth token')
      return
    }

    const sudtInfoTypeScript: UnderscoreScript = {
      code_hash: process.env.VUE_APP_SUDT_INFO_CODE_HASH || '',
      hash_type: process.env
        .VUE_APP_SUDT_INFO_HASH_TYPE as CKBComponents.ScriptHashType,
      args: scriptToHash(
        camelCaseScriptKey(
          JSON.parse(window.localStorage.getItem('lockScript') as string)
        )
      )
    }
    const cells = await getCells('type', sudtInfoTypeScript)
    if (cells.length === 0) {
      return
    }
    const newewstCell = cells.sort(
      (cell1: UnderscoreCell, cell2: UnderscoreCell) => {
        return Number(BigInt(cell2.block_number) - BigInt(cell1.block_number))
      }
    )[0]
    const sudtInfo = parseSudtInfoData(newewstCell.output_data)
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
      const TOKEN_EMAIL_BODY = `
                        Title: Submit Token Information%0a%0d
                        Type Script:%0a%0d
                            Code Hash: ${SUDT_TYPE_SCRIPT.codeHash}%0a%0d
                            Hash Type: ${SUDT_TYPE_SCRIPT.hashType}%0a%0d
                            Args: ${SUDT_TYPE_SCRIPT.args}%0a%0d
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
