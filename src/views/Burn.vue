<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="Burn Count">
      <a-input v-model:value="form.burnCount" type="number" />
      <span>Avaiable SUDT: {{ currentSudtCount }}</span>
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
  signAndSendTransaction,
  camelCaseScriptKey,
  toUint128Le,
  combineInputCells,
  FEE_RATIO,
  sudtTypeScript,
  SUDT_SMALLEST_CAPACITY,
  calSudtAmount,
  calCapacityAmount,
  parseBigIntStringNumber
} from "@/utils"
import { UnderscoreCell } from '@/interface'

export default defineComponent({
  data() {
    return {
      form: {
        burnCount: 0 as number
      },
      inputCells: [] as Array<UnderscoreCell>,
      fromSudtCells: [] as Array<UnderscoreCell>,
      biggestCapacityCell: {} as UnderscoreCell,
      originalSudtCount: 0n,
      currentSudtCount: "0",
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    }
  },
  async mounted() {
    const inputCells = await combineInputCells()
    this.inputCells = [...inputCells]
    if (inputCells.length === 0) {
      message.error("No Available Cells!")
    } else {
      this.biggestCapacityCell = inputCells.shift()!
      this.fromSudtCells = inputCells || []
      this.originalSudtCount = calSudtAmount(inputCells)
      this.currentSudtCount = parseBigIntStringNumber(this.originalSudtCount)
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
      const fromLockScript = JSON.parse(window.localStorage.getItem("lockScript") as string)
      if (this.inputCells.length === 0) {
        message.error("No Available Cells!")
        return
      }

      this.inputCells.forEach(cell => {
        rawTx.inputs.push({
          previousOutput: {
            txHash: cell.out_point.tx_hash,
            index: cell.out_point.index
          },
          since: "0x0"
        })
        rawTx.witnesses.push("0x")
      })

      const originalSudtCount = calSudtAmount(this.fromSudtCells)
      const originalCapacity = calCapacityAmount(this.fromSudtCells).capacity
      const decimal: number = parseInt(window.localStorage.getItem("decimal") || "8")
      const restSudtCount = originalSudtCount - (BigInt(this.form.burnCount * 10 ** decimal))
      debugger
      rawTx.outputs.push({
        capacity: `0x${originalCapacity.toString(16)}`,
        lock: camelCaseScriptKey(fromLockScript),
        type: sudtTypeScript
      })
      rawTx.outputsData.push('0x' + toUint128Le(restSudtCount))

      rawTx.outputs.push({
        capacity: `0x${(BigInt(this.biggestCapacityCell.output.capacity) - SUDT_SMALLEST_CAPACITY).toString(16)}`,
        lock: camelCaseScriptKey(fromLockScript),
        type: null
      })
      rawTx.outputsData.push(this.biggestCapacityCell.output_data)

      const minerFee = BigInt(getTransactionSize(rawTx)) * FEE_RATIO
      rawTx.outputs[1].capacity = '0x' + (BigInt(rawTx.outputs[1].capacity) - minerFee).toString(16)

      try {
        const response = await signAndSendTransaction(
          rawTx,
          authToken,
          window.localStorage.getItem("lockHash") as string
        )
        message.success(`TX: ${response.txHash}`, 10)
        setTimeout(this.$router.go, 5000)
      } catch (error) {
        message.error(error.message)
      }
    }
  }
})
</script>
