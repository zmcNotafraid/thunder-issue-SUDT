<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="To Address">
      <a-input v-model:value="form.toAddress" />
    </a-form-item>
    <a-form-item label="Transfer Count">
      <a-input v-model:value="form.transferCount" type="number"/>
      <span>Avaiable SUDT: {{ currentSudtCount }}</span>
    </a-form-item>
    <a-form-item label="I will provide some extral CKB capacity for the receiver">
      <a-checkbox v-model:checked="form.selfProvide"  />
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
import { getTransactionSize, addressToScript } from '@nervosnetwork/ckb-sdk-utils'
import {
  getRawTxTemplate,
  compareScript,
  signAndSendTransaction,
  camelCaseScriptKey,
  readBigUInt128LE,
  toUint128Le,
  combineInputCells,
  FEE_RATIO,
  SUDT_TYPE_SCRIPT,
  SUDT_SMALLEST_CAPACITY,
  calSudtAmount,
  calCapacityAmount,
  parseBigIntStringNumber,
  getCells,
  underscoreScriptKey
} from "@/utils"
import { UnderscoreScript, UnderscoreCell } from '@/interface'

export default defineComponent({
  data() {
    return {
      form: {
        toAddress: '',
        transferCount: "0",
        selfProvide: false
      },
      inputCells: [] as Array<UnderscoreCell>,
      fromSudtCells: [] as Array<UnderscoreCell>,
      biggestCapacityCell: {} as UnderscoreCell,
      originalSudtCount: 0n,
      currentSudtCount: "0",
      labelCol: { span: 6 },
      wrapperCol: { span: 10 }
    }
  },
  async mounted() {
    const inputCells = await combineInputCells()
    this.inputCells = [...inputCells]
    if (inputCells.length === 0) {
      message.error("No Available Cells!")
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      const fromLockScript: UnderscoreScript = JSON.parse(window.localStorage.getItem("lockScript") as string)
      let inputSignConfig = { index: 0, length: -1 }
      let restCapacity = BigInt(this.biggestCapacityCell.output.capacity)

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

      const receiverLockScript = addressToScript(this.form.toAddress)
      const receiverLockCells = await getCells('lock', underscoreScriptKey(receiverLockScript))
      const receiverSudtAcpLiveCells = receiverLockCells.filter((cell: UnderscoreCell) => { return compareScript(cell.output.type, underscoreScriptKey(SUDT_TYPE_SCRIPT)) })
      if (!this.form.selfProvide) {
        if (![process.env.VUE_APP_ACP_CODE_HASH, process.env.VUE_APP_PW_CODE_HASH].includes(receiverLockScript.codeHash)) {
          message.error("You cannot send token to this kind of address if you don't provide the necessary CKB capacity.")
          return
        }

        if (receiverSudtAcpLiveCells.length === 0) {
          message.error("Receiver has no available asset account, please ask him create one first.")
          return
        }
      }

      if ([process.env.VUE_APP_ACP_CODE_HASH, process.env.VUE_APP_PW_CODE_HASH].includes(receiverLockScript.codeHash)) {
        const type = receiverLockScript.codeHash === process.env.VUE_APP_ACP_CODE_HASH ? "ACP" : "PW"
        rawTx.cellDeps.push({
          outPoint: {
            txHash: process.env[`VUE_APP_${type}_TX_HASH`] || '',
            index: process.env[`VUE_APP_${type}_INDEX`] || '0x0'
          },
          depType: 'depGroup'
        })

        if (receiverSudtAcpLiveCells.length > 0) {
          inputSignConfig = {
            index: 0,
            length: this.inputCells.length
          }

          rawTx.inputs.push({
            previousOutput: {
              txHash: receiverSudtAcpLiveCells[0].out_point.tx_hash,
              index: receiverSudtAcpLiveCells[0].out_point.index
            },
            since: "0x0"
          })
          rawTx.witnesses.push("0x")
          rawTx.outputs.push({
            capacity: receiverSudtAcpLiveCells[0].output.capacity,
            lock: receiverLockScript,
            type: SUDT_TYPE_SCRIPT
          })
          const originalToSudtCount = readBigUInt128LE(receiverSudtAcpLiveCells[0].output_data.slice(2))
          rawTx.outputsData.push('0x' + toUint128Le(BigInt('0x' + originalToSudtCount) + BigInt(this.form.transferCount)))
        } else {
          rawTx.outputs.push({
            capacity: '0x' + SUDT_SMALLEST_CAPACITY.toString(16),
            lock: receiverLockScript,
            type: SUDT_TYPE_SCRIPT
          })
          rawTx.outputsData.push('0x' + toUint128Le(BigInt(this.form.transferCount)))
          restCapacity = restCapacity - SUDT_SMALLEST_CAPACITY
        }
      } else {
        rawTx.outputs.push({
          capacity: '0x' + SUDT_SMALLEST_CAPACITY.toString(16),
          lock: receiverLockScript,
          type: SUDT_TYPE_SCRIPT
        })
        rawTx.outputsData.push('0x' + toUint128Le(BigInt(this.form.transferCount)))
        restCapacity = restCapacity - SUDT_SMALLEST_CAPACITY
      }

      const originalSudtCount = calSudtAmount(this.fromSudtCells)
      const originalCapacity = calCapacityAmount(this.fromSudtCells).capacity
      const decimal: number = parseInt(window.localStorage.getItem("decimal") || "8")
      const restSudtCount = originalSudtCount - (BigInt(this.form.transferCount) * BigInt(10 ** decimal))
      rawTx.outputs.push({
        capacity: `0x${originalCapacity.toString(16)}`,
        lock: camelCaseScriptKey(fromLockScript),
        type: SUDT_TYPE_SCRIPT
      })
      rawTx.outputsData.push('0x' + toUint128Le(restSudtCount))

      rawTx.outputs.push({
        capacity: `0x${restCapacity.toString(16)}`,
        lock: camelCaseScriptKey(fromLockScript),
        type: null
      })
      rawTx.outputsData.push(this.biggestCapacityCell.output_data)

      const minerFee = BigInt(getTransactionSize(rawTx)) * FEE_RATIO
      rawTx.outputs[2].capacity = '0x' + (BigInt(rawTx.outputs[2].capacity) - minerFee).toString(16)

      try {
        const response = await signAndSendTransaction(
          rawTx,
          authToken,
          window.localStorage.getItem("lockHash") as string,
          inputSignConfig
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
