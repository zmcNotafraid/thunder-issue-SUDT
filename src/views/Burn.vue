<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="Burn Count">
      <a-input v-model:value="form.burnCount" type="number" />
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
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { getTransactionSize } from '@nervosnetwork/ckb-sdk-utils'
import { message } from 'ant-design-vue'
import {
  getRawTxTemplate,
  underscoreScriptKey,
  getCells,
  compareLockScript,
  signAndSendTransaction,
  camelCaseScriptKey,
  readBigUInt128LE,
  toUint128Le,
  FEE_RATIO,
  getBiggestCapacityCell
} from "@/utils"
import { UnderscoreCell } from '@/interface'

export default defineComponent({
  data() {
    return {
      form: {
        burnCount: "0"
      },
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    }
  },
  methods: {
    onSubmit: async function(): Promise<Record<string, unknown> | undefined> {
      const rawTx: CKBComponents.RawTransactionToSign = getRawTxTemplate()

      const biggestFromLockCell = await await getBiggestCapacityCell(JSON.parse(window.localStorage.getItem("lockScript") as string))
      if (biggestFromLockCell === undefined) {
        message.error("No Live Cells!")
        return
      }
      const sudtTypeScript: CKBComponents.Script = {
        codeHash: process.env.VUE_APP_SUDT_CODE_HASH || '',
        hashType: process.env.VUE_APP_SUDT_HASH_TYPE as CKBComponents.ScriptHashType,
        args: window.localStorage.getItem("lockHash") || ''
      }
      const sudtLiveCells = await getCells('type', underscoreScriptKey(sudtTypeScript))
      const fromSudtLiveCells = sudtLiveCells.filter((sudt: UnderscoreCell) => { return compareLockScript(sudt.output.lock, biggestFromLockCell.output.lock) })
      const fromSudtCell = fromSudtLiveCells.sort((cell1: UnderscoreCell, cell2: UnderscoreCell) => { return (Number(BigInt(cell2.block_number) - BigInt(cell1.block_number))) })[0]

      rawTx.inputs.push({
        previousOutput: {
          txHash: fromSudtCell.out_point.tx_hash,
          index: fromSudtCell.out_point.index
        },
        since: "0x0"
      })
      rawTx.witnesses.push("0x")
      rawTx.inputs.push({
        previousOutput: {
          txHash: biggestFromLockCell.out_point.tx_hash,
          index: biggestFromLockCell.out_point.index
        },
        since: "0x0"
      })
      rawTx.witnesses.push("0x")

      rawTx.outputs.push({
        capacity: `0x${(BigInt(fromSudtCell.output.capacity)).toString(16)}`,
        lock: camelCaseScriptKey(fromSudtCell.output.lock),
        type: sudtTypeScript
      })
      const originalSudtCount = BigInt('0x' + readBigUInt128LE(fromSudtCell.output_data.slice(2, 34)))
      const restSudtCount = originalSudtCount - (BigInt(this.form.burnCount) * BigInt(10 ** 8))
      rawTx.outputsData.push('0x' + toUint128Le(restSudtCount))

      rawTx.outputs.push({
        capacity: `0x${(BigInt(biggestFromLockCell.output.capacity) - BigInt(142 * 10 ** 8)).toString(16)}`,
        lock: camelCaseScriptKey(fromSudtCell.output.lock),
        type: biggestFromLockCell.output.type === null ? biggestFromLockCell.output.type : camelCaseScriptKey(biggestFromLockCell.output.type)
      })
      rawTx.outputsData.push(biggestFromLockCell.output_data)

      const minerFee = BigInt(getTransactionSize(rawTx)) * FEE_RATIO
      rawTx.outputs[1].capacity = '0x' + (BigInt(rawTx.outputs[1].capacity) - minerFee).toString(16)

      const authToken: string | null = window.localStorage.getItem("authToken")

      if (!authToken) {
        console.error("No auth token")
        return
      }
      try {
        const response = await signAndSendTransaction(
          rawTx,
          authToken,
          window.localStorage.getItem("lockHash") as string
        )
        console.info(response)
        message.success(`TX: ${response.txHash}`, 10)
      } catch (error) {
        message.error(error)
      }
    }
  }
})
</script>
