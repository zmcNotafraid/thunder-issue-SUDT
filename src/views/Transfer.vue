<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="To Address">
      <a-input v-model:value="form.toAddress" />
    </a-form-item>
    <a-form-item label="Transfer Count">
      <a-input v-model:value="form.transferCount" type="number" />
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
import { addressToScript } from '@nervosnetwork/ckb-sdk-utils/lib/'
import { defineComponent } from "vue"
import Rpc from "../utils/rpc"
import Utils from "../utils/utils"
import { SUDT_CODE_HASH, SUDT_HASH_TYPE } from "../utils/const"

export default defineComponent({
  data() {
    return {
      form: {
        toAddress: '',
        transferCount: "0"
      },
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    }
  },
  methods: {
    onSubmit: async function(): Promise<any> {
      const toLockScript = addressToScript(this.form.toAddress)
      const fromLockScript = JSON.parse(window.localStorage.getItem("lockScript") as string)
      const sudtTypeScript: CKBComponents.Script = {
        codeHash: SUDT_CODE_HASH,
        hashType: SUDT_HASH_TYPE,
        args: window.localStorage.getItem("lockHash")!
      }
      const rawTx: CKBComponents.RawTransactionToSign = Utils.getRawTxTemplate()
      // const toLiveCells = await Rpc.getCells('lock', Utils.lowerScriptKey(toLockScript))
      const fromLockLiveCells = await Rpc.getCells('lock', Utils.lowerScriptKey(fromLockScript))
      const fromTypeLiveCells = await Rpc.getCells('type', Utils.lowerScriptKey(sudtTypeScript))
      if (fromTypeLiveCells.length === 0 || fromLockLiveCells.length === 0) {
        return
      }

      const lastTypeCell = fromTypeLiveCells.sort((cell1: any, cell2: any) => Number(parseInt(cell2.block_number) - parseInt(cell1.block_number)))[0]
      const biggestFromLockCell = fromLockLiveCells.sort((cell1: any, cell2: any) => Number(BigInt(cell2.output.capacity) - BigInt(cell1.output.capacity)))[0]

      console.info(Utils.camelCaseScriptKey(lastTypeCell.output.lock))
      rawTx.inputs.push({
        previousOutput: {
          txHash: lastTypeCell.out_point.tx_hash,
          index: lastTypeCell.out_point.index
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
        capacity: '0x' + (BigInt(142 * 10 ** 8)).toString(16),
        lock: toLockScript,
        type: sudtTypeScript
      })
      rawTx.outputsData.push('0x' + Utils.toUint128Le(BigInt(this.form.transferCount)))

      rawTx.outputs.push({
        capacity: `0x${(BigInt(lastTypeCell.output.capacity)).toString(16)}`,
        lock: Utils.camelCaseScriptKey(lastTypeCell.output.lock),
        type: sudtTypeScript
      })
      const originalSudtCount = BigInt('0x' + Utils.readBigUInt128LE(lastTypeCell.output_data.slice(2, 34)))
      const restSudtCount = originalSudtCount - (BigInt(this.form.transferCount) * BigInt(10 ** 8))
      rawTx.outputsData.push('0x' + Utils.toUint128Le(restSudtCount))

      rawTx.outputs.push({
        capacity: `0x${(BigInt(biggestFromLockCell.output.capacity) - BigInt(10000) - BigInt(142 * 10 ** 8)).toString(16)}`,
        lock: Utils.camelCaseScriptKey(lastTypeCell.output.lock),
        type: sudtTypeScript
      })
      rawTx.outputsData.push(biggestFromLockCell.output_data)

      const authToken: string | null = window.localStorage.getItem("authToken")

      if (!authToken) {
        console.error("No auth token")
        return
      }
      debugger
      await Rpc.signAndSendTransaction(
        rawTx,
        authToken,
        window.localStorage.getItem("lockHash") as string
      )
    }
  }
})
</script>
