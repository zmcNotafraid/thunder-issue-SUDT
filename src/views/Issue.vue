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
import { defineComponent } from "vue"
import Rpc from "../utils/rpc"
import Utils from "../utils/utils"
import Const from "../utils/const"
import BN from "bn.js"
import { Transaction, Cell } from '../interface/index'

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
      const rawTx: Transaction = Utils.getRawTxTemplate()
      const outputCapacity = new BN(142 * 100000000)
      const fee = new BN(0.1 * 100000000)
      const freeOutputCapacity = new BN(Number(window.localStorage.getItem("free")))

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
          // eslint-disable-next-line @typescript-eslint/camelcase
          codeHash: Const.SUDT_CODE_HASH,
          // eslint-disable-next-line @typescript-eslint/camelcase
          hashType: Const.SUDT_HASH_TYPE,
          args: window.localStorage.getItem("lockHash")
        }
      })
      // eslint-disable-next-line no-undef
      rawTx.outputsData.push(Utils.toUint128Le(BigInt(this.form.count)))

      rawTx.outputs.push({
        capacity: `0x${freeOutputCapacity.sub(outputCapacity).sub(fee).toString(16)}`,
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
