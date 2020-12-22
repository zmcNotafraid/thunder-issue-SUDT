<template>
  <a-form
    :model="form"
    ref="ruleForm"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-form-item :label="$t('labels.tokenName')" name="name" >
      <a-input
        v-model:value="form.name"
        :disabled="issueSudt && infoExist"
        :placeholder="$t('placeholder.maxLength', { length: 32 })"
      />
    </a-form-item>
    <a-form-item :label="$t('labels.tokenSymbol')" name="symbol">
      <a-input
        v-model:value="form.symbol"
        :disabled="issueSudt && infoExist"
        :placeholder="$t('placeholder.maxLength', { length: 8 })"
      />
    </a-form-item>
    <a-form-item :label="$t('labels.tokenDecimal')" name="decimal">
      <a-input-number
        v-model:value="form.decimal"
        :disabled="issueSudt && infoExist"
        :min="0"
        :max="38"
        placeholder="0 ~ 38"
      />
    </a-form-item>
    <a-form-item
      v-if="issueSudt === true"
      :label="$t('labels.tokenCount')"
      name="count"
    >
      <a-input-number
        v-model:value="form.count"
        :min="0"
        style="width: 150px"
      />
    </a-form-item>
    <a-form-item
      v-if="issueSudt === true"
      :wrapper-col="{ span: 14, offset: 4 }"
    >
      <a-button type="primary" @click="checkFormValidate">
        {{ $t('buttons.submit') }}
      </a-button>
    </a-form-item>
  </a-form>
</template>
<script lang="ts">
import { message } from 'ant-design-vue'
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { getTransactionSize } from '@nervosnetwork/ckb-sdk-utils'
import {
  getCells,
  underscoreScriptKey,
  camelCaseScriptKey,
  getRawTxTemplate,
  getBiggestCapacityCell,
  stringToHex,
  FEE_RATIO,
  signAndSendTransaction,
  SUDT_INFO_SMALLEST_CAPACITY,
  SUDT_SMALLEST_CAPACITY,
  toUint128Le,
  showTransactionModal,
  parseSudtInfoData,
  getNetworkConst
} from '@/utils'
import { UnderscoreCell } from '../interface/index'
import { defineComponent } from 'vue'

const Component = defineComponent({
  data: function () {
    return {
      infoExist: false,
      infoParseError: false,
      form: {
        name: '',
        symbol: '',
        decimal: 8,
        count: 0
      },
      rules: {
        count: [
          {
            type: 'integer',
            required: true,
            message: this.$t('validations.required', {
              field: this.$t('labels.tokenCount')
            }),
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: this.$t('validations.required', {
              field: this.$t('labels.tokenName')
            }),
            trigger: 'blur'
          },
          {
            max: 32,
            message: this.$t('placeholder.maxLength', { length: 32 }),
            trigger: 'blur'
          }
        ],
        symbol: [
          {
            required: true,
            message: this.$t('validations.required', {
              field: this.$t('labels.tokenSymbol')
            }),
            trigger: 'blur'
          },
          {
            max: 8,
            message: this.$t('placeholder.maxLength', { length: 8 }),
            trigger: 'blur'
          }
        ],
        decimal: [
          {
            type: 'integer',
            required: true,
            message: this.$t('validations.required', {
              field: this.$t('labels.tokenDecimal')
            }),
            trigger: 'blur'
          },
          {
            type: 'integer',
            min: 0,
            max: 38,
            message: this.$t('validations.decimalLength'),
            trigger: 'blur'
          }
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
  async mounted() {
    const sudtInfoTypeScript = getNetworkConst("SUDT_INFO_TYPE_SCRIPT") as CKBComponents.Script
    sudtInfoTypeScript.args = window.localStorage.getItem("lockHash") || ""

    const sudtInfoCells = await getCells('type', underscoreScriptKey(sudtInfoTypeScript))
    if (sudtInfoCells.length > 0) {
      const data = parseSudtInfoData(sudtInfoCells[0].output_data)
      if (data.name === "" || data.symbol === "" || data.decimal === -1) {
        this.infoParseError = true
        return
      }
      this.form.name = data.name
      this.form.symbol = data.symbol
      this.form.decimal = data.decimal
      this.infoExist = true
    }
  },
  methods: {
    checkFormValidate: async function () {
      (this.$refs.ruleForm as HTMLFormElement).validate().then(() => {
        this.submit()
      })
    },
    submit: async function (): Promise<Record<string, unknown> | undefined> {
      const authToken: string | null = window.localStorage.getItem('authToken')
      if (!authToken) {
        message.error(this.$t('errors.noAuth'))
        return
      }

      window.localStorage.setItem('decimal', this.form.decimal.toString())
      const rawTx: CKBComponents.RawTransactionToSign = getRawTxTemplate()
      const cell: UnderscoreCell = await getBiggestCapacityCell(
        JSON.parse(window.localStorage.getItem('lockScript') as string)
      )
      let restCapacity = BigInt(cell.output.capacity)

      if (this.issueSudt && this.form.count !== 0) {
        const sudtTypeScript = getNetworkConst("SUDT_TYPE_SCRIPT") as CKBComponents.Script
        sudtTypeScript.args = window.localStorage.getItem('lockHash') || ''
        restCapacity = restCapacity - SUDT_SMALLEST_CAPACITY
        rawTx.outputs.push({
          capacity: `0x${SUDT_SMALLEST_CAPACITY.toString(16)}`,
          lock: camelCaseScriptKey(
            JSON.parse(window.localStorage.getItem('lockScript') as string)
          ),
          type: sudtTypeScript
        })
        rawTx.outputsData.push(
          '0x' +
              toUint128Le(
                BigInt(this.form.count) * BigInt(10 ** this.form.decimal)
              )
        )
      } else {
        rawTx.cellDeps.shift()
      }

      rawTx.inputs.push({
        previousOutput: {
          txHash: cell.out_point.tx_hash,
          index: cell.out_point.index
        },
        since: '0x0'
      })
      rawTx.witnesses.push('0x')

      if ((!this.infoExist && this.issueSudt) || !this.issueSudt) {
        rawTx.cellDeps.push(getNetworkConst("SUDT_INFO_CELL_DEP") as CKBComponents.CellDep)

        restCapacity = restCapacity - SUDT_INFO_SMALLEST_CAPACITY

        const sudtInfoTypeScript = getNetworkConst("SUDT_INFO_TYPE_SCRIPT") as CKBComponents.Script
        sudtInfoTypeScript.args = window.localStorage.getItem('lockHash') || ''

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
      }

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
          '0x' +
          (BigInt(rawTx.outputs[outputsLength - 1].capacity) - minerFee).toString(
            16
          )

      try {
        const response = await signAndSendTransaction(
          rawTx,
          authToken,
            window.localStorage.getItem('lockHash') as string
        )
        showTransactionModal(response.txHash as "string")
      } catch (error) {
        message.error(error.message)
      }
    }
  }
})
export default Component
</script>
