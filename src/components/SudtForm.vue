<template>
  <a-form
    :model="form"
    ref="ruleForm"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-form-item label="Token Name" name="name">
      <a-input v-model:value="form.name" placeholder="Max length 32"/>
    </a-form-item>
    <a-form-item label="Token Symbol" name="symbol">
      <a-input v-model:value="form.symbol" placeholder="Max length 8" />
    </a-form-item>
    <a-form-item label="Token Decimal" name="decimal">
      <a-input-number
        v-model:value="form.decimal"
        :min=0
        :max=38
        placeholder="0 ~ 38"
      />
    </a-form-item>
    <a-form-item v-if="issueSudt === true" label="Token Initial Supply Count" name="count">
      <a-input-number v-model:value="form.count" :min=1 style="width: 150px" />
    </a-form-item>
    <a-form-item v-if="issueSudt === true" :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="checkFormValidate"> Submit </a-button>
    </a-form-item>
  </a-form>
</template>
<script lang="ts">
import { message } from 'ant-design-vue'
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { getTransactionSize, scriptToHash } from '@nervosnetwork/ckb-sdk-utils'
import {
  getCells,
  underscoreScriptKey,
  camelCaseScriptKey,
  getRawTxTemplate,
  getBiggestCapacityCell,
  stringToHex,
  FEE_RATIO,
  signAndSendTransaction,
  SUDT_INFO_CELL_DEP,
  SUDT_INFO_SMALLEST_CAPACITY,
  SUDT_SMALLEST_CAPACITY,
  SUDT_TYPE_SCRIPT,
  toUint128Le
} from '@/utils'
import { UnderscoreCell } from '../interface/index'
import { defineComponent } from 'vue'

const Component = defineComponent({
  data: function () {
    return {
      form: {
        name: '',
        symbol: '',
        decimal: 8,
        count: 0
      },
      rules: {
        count: [
          { type: 'integer', required: true, message: 'Please input supply count', trigger: 'blur' }
        ],
        name: [
          { required: true, message: 'Please input token name', trigger: 'blur' },
          { max: 32, message: 'The max length is 32', trigger: 'blur' }
        ],
        symbol: [
          { required: true, message: 'Please input symbol', trigger: 'blur' },
          { max: 8, message: 'The max length is 8', trigger: 'blur' }
        ],
        decimal: [
          { type: 'integer', required: true, message: 'Please input decimal', trigger: 'blur' },
          { type: 'integer', min: 0, max: 38, message: 'The decimal should be 0 to 38', trigger: 'blur' }
        ]
      },
      labelCol: { span: this.labelColumn },
      wrapperCol: { span: this.wrapperColumn }
    }
  },
  props: {
    issueSudt: Boolean,
    labelColumn: Number,
    wrapperColumn: Number
  },
  methods: {
    checkFormValidate: async function () {
      (this.$refs.ruleForm as HTMLFormElement)
        .validate()
        .then(() => {
          this.submit()
        })
    },
    submit: async function(): Promise<Record<string, unknown> | undefined> {
      const authToken: string | null = window.localStorage.getItem('authToken')
      if (!authToken) {
        message.error('No auth token')
        return
      }

      window.localStorage.setItem('decimal', this.form.decimal.toString())
      const rawTx: CKBComponents.RawTransactionToSign = getRawTxTemplate()
      const cell: UnderscoreCell = await getBiggestCapacityCell(
        JSON.parse(window.localStorage.getItem('lockScript') as string)
      )
      let restCapacity = BigInt(cell.output.capacity) - SUDT_INFO_SMALLEST_CAPACITY
      if (this.issueSudt) {
        restCapacity = restCapacity - SUDT_SMALLEST_CAPACITY
        rawTx.outputs.push({
          capacity: `0x${SUDT_SMALLEST_CAPACITY.toString(16)}`,
          lock: camelCaseScriptKey(
            JSON.parse(window.localStorage.getItem('lockScript') as string)
          ),
          type: SUDT_TYPE_SCRIPT
        })
        rawTx.outputsData.push(
          '0x' +
            toUint128Le(BigInt(this.form.count) * BigInt(10 ** this.form.decimal))
        )
      } else {
        rawTx.cellDeps.shift()
      }

      rawTx.cellDeps.push(SUDT_INFO_CELL_DEP)

      rawTx.inputs.push({
        previousOutput: {
          txHash: cell.out_point.tx_hash,
          index: cell.out_point.index
        },
        since: '0x0'
      })
      rawTx.witnesses.push('0x')

      const sudtInfoTypeScript = {
        codeHash: process.env.VUE_APP_SUDT_INFO_CODE_HASH || '',
        hashType: process.env
          .VUE_APP_SUDT_INFO_HASH_TYPE as CKBComponents.ScriptHashType,
        args: scriptToHash(
          camelCaseScriptKey(
            JSON.parse(window.localStorage.getItem('lockScript') as string)
          )
        )
      }
      const sudtInfoCells = await getCells(
        'type',
        underscoreScriptKey(sudtInfoTypeScript)
      )
      if (sudtInfoCells.length > 0) {
        rawTx.inputs.push({
          previousOutput: {
            txHash: sudtInfoCells[0].out_point.tx_hash,
            index: sudtInfoCells[0].out_point.index
          },
          since: '0x0'
        })
        rawTx.witnesses.push('0x')
        restCapacity = restCapacity + BigInt(sudtInfoCells[0].output.capacity)
      }

      rawTx.outputs.push({
        capacity: `0x${SUDT_INFO_SMALLEST_CAPACITY.toString(16)}`,
        lock: camelCaseScriptKey(
          JSON.parse(window.localStorage.getItem('lockScript') as string)
        ),
        type: sudtInfoTypeScript
      })

      rawTx.outputsData.push(
          `0x${this.form.decimal.toString(16).padStart(2, '0')}0a${stringToHex(
            this.form.name
          )}0a${stringToHex(this.form.symbol)}`
      )

      rawTx.outputs.push({
        capacity: `0x${restCapacity.toString(16)}`,
        lock: camelCaseScriptKey(
          JSON.parse(window.localStorage.getItem('lockScript') as string)
        ),
        type: null
      })
      rawTx.outputsData.push('0x')

      const minerFee = BigInt(getTransactionSize(rawTx)) * FEE_RATIO
      const outputsLength = rawTx.outputs.length
      rawTx.outputs[outputsLength - 1].capacity =
          '0x' + (BigInt(rawTx.outputs[outputsLength - 1].capacity) - minerFee).toString(16)

      try {
        const response = await signAndSendTransaction(
          rawTx,
          authToken,
            window.localStorage.getItem('lockHash') as string
        )
        message.success(`TX: ${response.txHash}`, 10)
      } catch (error) {
        message.error(error.message)
      }
    }
  }
})
export default Component
</script>
