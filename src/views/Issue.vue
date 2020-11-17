<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="UDT Count">
      <a-input v-model:value="form.count" type="number" min="1" step="1" />
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="onSubmit">
        Submit
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang='ts'>
import { defineComponent } from "vue"
import { message } from 'ant-design-vue'
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { getTransactionSize } from '@nervosnetwork/ckb-sdk-utils'
import {
  getRawTxTemplate,
  signAndSendTransaction,
  toUint128Le,
  getBiggestCapacityCell,
  FEE_RATIO,
  camelCaseScriptKey
} from "@/utils"
import { UnderscoreCell } from '../interface/index'

export default defineComponent({
  data() {
    return {
      form: {
        count: "0"
      },
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    }
  },
  methods: {
    onSubmit: async function(): Promise<Record<string, unknown> | undefined> {
      const authToken: string | null = window.localStorage.getItem("authToken")

      if (!authToken) {
        message.error("No auth token")
        return
      }
      const rawTx: CKBComponents.RawTransactionToSign = getRawTxTemplate()
      const cell: UnderscoreCell = await getBiggestCapacityCell(JSON.parse(window.localStorage.getItem("lockScript") as string))
      const sudtCapacity = BigInt(142 * 10 ** 8)
      const restCapacity = BigInt(cell.output.capacity) - sudtCapacity

      rawTx.inputs.push({
        previousOutput: {
          txHash: cell.out_point.tx_hash,
          index: cell.out_point.index
        },
        since: "0x0"
      })
      rawTx.witnesses.push("0x")

      rawTx.outputs.push({
        capacity: `0x${(restCapacity).toString(16)}`,
        lock: camelCaseScriptKey(JSON.parse(window.localStorage.getItem("lockScript") as string)),
        type: null
      })
      rawTx.outputsData.push('0x')

      rawTx.outputs.push({
        capacity: `0x${sudtCapacity.toString(16)}`,
        lock: camelCaseScriptKey(JSON.parse(window.localStorage.getItem("lockScript") as string)),
        type: {
          codeHash: process.env.VUE_APP_SUDT_CODE_HASH || '',
          hashType: process.env.VUE_APP_SUDT_HASH_TYPE as CKBComponents.ScriptHashType,
          args: window.localStorage.getItem("lockHash") || ''
        }
      })
      // eslint-disable-next-line no-undef
      rawTx.outputsData.push('0x' + toUint128Le(BigInt(this.form.count) * BigInt(10 ** 8)))

      const minerFee = BigInt(getTransactionSize(rawTx)) * FEE_RATIO
      rawTx.outputs[0].capacity = '0x' + (BigInt(rawTx.outputs[0].capacity) - minerFee).toString(16)

      try {
        const response = await signAndSendTransaction(
          rawTx,
          authToken,
          window.localStorage.getItem("lockHash") as string
        )
        message.success(`TX: ${response.txHash}`, 10)
      } catch (error) {
        message.error(error)
      }
    }
  }
})
</script>
