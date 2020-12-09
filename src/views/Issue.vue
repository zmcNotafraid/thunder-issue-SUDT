<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="Token Total Supply Count">
      <a-input v-model:value="form.count" type="number" min="1" step="1" />
    </a-form-item>
    <a-form-item label="Token Name">
      <a-input v-model:value="form.name" placeholder="nervos token" />
    </a-form-item>
    <a-form-item label="Token Symbol">
      <a-input v-model:value="form.symbol" placeholder="CKB" />
    </a-form-item>
    <a-form-item label="Token Decimal">
      <a-input
        v-model:value="form.decimal"
        type="number"
        min="0"
        step="1"
        placeholder="default is 8"
      />
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="checkIssued"> Submit </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import { message } from 'ant-design-vue'
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { getTransactionSize, scriptToHash } from '@nervosnetwork/ckb-sdk-utils'
import {
  getRawTxTemplate,
  signAndSendTransaction,
  toUint128Le,
  getBiggestCapacityCell,
  FEE_RATIO,
  camelCaseScriptKey,
  stringToHex,
  sudtTypeScript,
  getCells,
  underscoreScriptKey,
  parseSudtInfoData,
  SUDT_SMALLEST_CAPACITY
} from '@/utils'
import { UnderscoreCell } from '../interface/index'

export default defineComponent({
  data() {
    return {
      form: {
        count: '0',
        name: '',
        symbol: '',
        decimal: 8
      },
      issued: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    }
  },
  async mounted() {
    const cells = await getCells('type', underscoreScriptKey(sudtTypeScript))
    if (cells.length > 0) {
      this.issued = true
    }
  },
  methods: {
    checkIssued: function () {
      if (this.issued) {
        if (confirm('Are you sure you want additional issue')) {
          return this.onSubmit()
        }
      } else {
        return this.onSubmit()
      }
    },
    onSubmit: async function (): Promise<Record<string, unknown> | undefined> {
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
      const sudtInfoCapacity = BigInt(170 * 10 ** 8)
      let restCapacity =
          BigInt(cell.output.capacity) - SUDT_SMALLEST_CAPACITY - sudtInfoCapacity
      let totalSupply = BigInt(this.form.count)

      rawTx.cellDeps.push({
        outPoint: {
          txHash: process.env.VUE_APP_SUDT_INFO_TX_HASH as string,
          index: process.env.VUE_APP_SUDT_INFO_INDEX as string
        },
        depType: 'code'
      })

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
        restCapacity = restCapacity - BigInt(sudtInfoCells[0].output.capacity)
        const oldTotalSupply = parseSudtInfoData(
          sudtInfoCells[0].output_data
        ).restInfos.filter((obj) => obj.TotalSupply !== undefined)

        totalSupply = totalSupply + BigInt(oldTotalSupply[0].TotalSupply)
      }

      rawTx.outputs.push({
        capacity: `0x${SUDT_SMALLEST_CAPACITY.toString(16)}`,
        lock: camelCaseScriptKey(
          JSON.parse(window.localStorage.getItem('lockScript') as string)
        ),
        type: sudtTypeScript
      })
      rawTx.outputsData.push(
        '0x' +
            toUint128Le(BigInt(this.form.count) * BigInt(10 ** this.form.decimal))
      )

      rawTx.outputs.push({
        capacity: `0x${sudtInfoCapacity.toString(16)}`,
        lock: camelCaseScriptKey(
          JSON.parse(window.localStorage.getItem('lockScript') as string)
        ),
        type: sudtInfoTypeScript
      })

      rawTx.outputsData.push(
          `0x${this.form.decimal.toString(16).padStart(2, '0')}0a${stringToHex(
            this.form.name
          )}0a${stringToHex(this.form.symbol)}0a${stringToHex(
            'TotalSupply:' + totalSupply.toString()
          )}`
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
      rawTx.outputs[2].capacity =
          '0x' + (BigInt(rawTx.outputs[2].capacity) - minerFee).toString(16)

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
</script>
