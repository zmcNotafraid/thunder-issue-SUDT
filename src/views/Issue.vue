<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="UDT Count">
      <a-input v-model:value="form.count" type="number" />
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
import { Cell } from '../interface/index'

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
    onSubmit: async function(): Promise<any> {
      const rawTx: CKBComponents.RawTransactionToSign = Utils.getRawTxTemplate()
      const outputCapacity = BigInt(142 * 10 ** 8)
      const fee = BigInt(1000)
      const freeOutputCapacity = BigInt(window.localStorage.getItem("free"))

      const cells: Cell[] = JSON.parse(window.localStorage.getItem("emptyCells") as string)
      for (const cell of cells) {
        rawTx.inputs.push({
          previousOutput: {
            txHash: cell.out_point.tx_hash,
            index: cell.out_point.index
          },
          since: "0x0"
        })
        rawTx.witnesses.push("0x")
      }

      rawTx.outputs.push({
        capacity: `0x${outputCapacity.toString(16)}`,
        lock: JSON.parse(window.localStorage.getItem("lockScript") as string),
        type: {
          codeHash: SUDT_CODE_HASH,
          hashType: SUDT_HASH_TYPE,
          args: window.localStorage.getItem("lockHash") || ''
        }
      })
      // eslint-disable-next-line no-undef
      rawTx.outputsData.push('0x' + Utils.toUint128Le(BigInt(this.form.count) * BigInt(10 ** 8)))

      rawTx.outputs.push({
        capacity: `0x${(freeOutputCapacity - outputCapacity - fee).toString(16)}`,
        lock: JSON.parse(window.localStorage.getItem("lockScript") as string),
        type: null
      })
      rawTx.outputsData.push("0x")

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
