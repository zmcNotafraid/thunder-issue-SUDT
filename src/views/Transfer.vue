<template>
  <a-space direction="vertical">
    <a-row type="flex" justify="end" style="color: red">
        <a-col :span="22"> <li>If you don't check the ACP, you will create a SECP256K1/blake160 SUDT cell for receiver.</li></a-col>
        <a-col :span="22"> <li>When you check the ACP, if receiver already has an ACP cell, you will transfer to this cell.Otherwise, you will create a new ACP cell.</li></a-col>
    </a-row>
    <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="To Address">
        <a-input v-model:value="form.toAddress" />
      </a-form-item>
      <a-form-item label="Transfer Count">
        <a-input v-model:value="form.transferCount" type="number"/>
        <span>Avaiable SUDT: {{ currentSudtCount }}</span>
      </a-form-item>
      <a-form-item label="ACP">
        <a-checkbox v-model:checked="form.acp"  />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </a-space>
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
  sudtTypeScript,
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
        acp: false
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

      const toLockScript = addressToScript(this.form.toAddress)
      const toAcpScript: UnderscoreScript = {
        code_hash: process.env.VUE_APP_ACP_CODE_HASH || '',
        hash_type: process.env.VUE_APP_ACP_HASH_TYPE as CKBComponents.ScriptHashType,
        args: toLockScript.args
      }
      const toAcpCells = await getCells('lock', toAcpScript)
      const toSudtAcpLiveCells = toAcpCells.filter((acp: UnderscoreCell) => { return compareScript(acp.output.type, underscoreScriptKey(sudtTypeScript)) })
      if (this.form.acp === true) {
        rawTx.cellDeps.push(
          {
            outPoint: {
              txHash: process.env.VUE_APP_ACP_TX_HASH || '',
              index: process.env.VUE_APP_ACP_INDEX || '0x0'
            },
            depType: 'depGroup'
          }
        )

        if (toSudtAcpLiveCells.length > 0) {
          inputSignConfig = {
            index: 0,
            length: this.inputCells.length
          }

          rawTx.inputs.push({
            previousOutput: {
              txHash: toSudtAcpLiveCells[0].out_point.tx_hash,
              index: toSudtAcpLiveCells[0].out_point.index
            },
            since: "0x0"
          })
          rawTx.witnesses.push("0x")
          rawTx.outputs.push({
            capacity: toSudtAcpLiveCells[0].output.capacity,
            lock: camelCaseScriptKey(toAcpScript),
            type: sudtTypeScript
          })
          const originalToSudtCount = readBigUInt128LE(toSudtAcpLiveCells[0].output_data.slice(2))
          rawTx.outputsData.push('0x' + toUint128Le(BigInt('0x' + originalToSudtCount) + BigInt(this.form.transferCount)))
        } else {
          rawTx.outputs.push({
            capacity: '0x' + SUDT_SMALLEST_CAPACITY.toString(16),
            lock: camelCaseScriptKey(toAcpScript),
            type: sudtTypeScript
          })
          rawTx.outputsData.push('0x' + toUint128Le(BigInt(this.form.transferCount)))
        }
      } else {
        rawTx.outputs.push({
          capacity: '0x' + SUDT_SMALLEST_CAPACITY.toString(16),
          lock: toLockScript,
          type: sudtTypeScript
        })
        rawTx.outputsData.push('0x' + toUint128Le(BigInt(this.form.transferCount)))
      }

      const originalSudtCount = calSudtAmount(this.fromSudtCells)
      const originalCapacity = calCapacityAmount(this.fromSudtCells).capacity
      const decimal: number = parseInt(window.localStorage.getItem("decimal") || "8")
      const restSudtCount = originalSudtCount - (BigInt(this.form.transferCount) * BigInt(10 ** decimal))
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
