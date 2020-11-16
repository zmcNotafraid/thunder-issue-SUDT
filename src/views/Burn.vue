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
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { defineComponent } from "vue"
import Rpc from "../utils/rpc"
import Utils from "../utils/utils"
import { SUDT_CODE_HASH, SUDT_HASH_TYPE } from "../utils/const"

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
    onSubmit: async function(): Promise<any> {
      const fromLockScript = JSON.parse(window.localStorage.getItem("lockScript") as string)
      const sudtTypeScript: CKBComponents.Script = {
        codeHash: SUDT_CODE_HASH,
        hashType: SUDT_HASH_TYPE,
        args: window.localStorage.getItem("lockHash")!
      }
      const rawTx: CKBComponents.RawTransactionToSign = Utils.getRawTxTemplate()
      const fromLockLiveCells = await Rpc.getCells('lock', Utils.lowerScriptKey(fromLockScript))
      const sudtLiveCells = await Rpc.getCells('type', Utils.lowerScriptKey(sudtTypeScript))
      if (sudtLiveCells.length === 0 || fromLockLiveCells.length === 0) {
        return
      }

      const biggestFromLockCell = fromLockLiveCells.sort((cell1: any, cell2: any) => Number(BigInt(cell2.output.capacity) - BigInt(cell1.output.capacity)))[0]
      const fromSudtLiveCells = sudtLiveCells.filter((sudt: any) => { return Utils.compareLockScript(sudt.output.lock, biggestFromLockCell.output.lock) })
      if (fromLockLiveCells.length === 0) {
        return
      }
      const fromSudtCell = fromSudtLiveCells[0]

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
        lock: Utils.camelCaseScriptKey(fromSudtCell.output.lock),
        type: sudtTypeScript
      })
      const originalSudtCount = BigInt('0x' + Utils.readBigUInt128LE(fromSudtCell.output_data.slice(2, 34)))
      const restSudtCount = originalSudtCount - (BigInt(this.form.burnCount) * BigInt(10 ** 8))
      rawTx.outputsData.push('0x' + Utils.toUint128Le(restSudtCount))

      rawTx.outputs.push({
        capacity: `0x${(BigInt(biggestFromLockCell.output.capacity) - BigInt(10000) - BigInt(142 * 10 ** 8)).toString(16)}`,
        lock: Utils.camelCaseScriptKey(fromSudtCell.output.lock),
        type: biggestFromLockCell.output.type
      })
      rawTx.outputsData.push(biggestFromLockCell.output_data)

      const authToken: string | null = window.localStorage.getItem("authToken")

      if (!authToken) {
        console.error("No auth token")
        return
      }
      await Rpc.signAndSendTransaction(
        rawTx,
        authToken,
        window.localStorage.getItem("lockHash") as string
      )
    }
  }
})
</script>
