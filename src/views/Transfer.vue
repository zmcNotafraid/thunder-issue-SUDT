<template>
  <a-space direction="vertical">
    <a-row type="flex" justify="end" style="color: red">
        <a-col :span="22"> <li>If you don't checked the ACP, you will create a SECP256K1/blake160 SUDT cell.</li></a-col>
        <a-col :span="22"> <li>When you check the ACP, if receiver already has ACP cell, you will directly transfer to this cell.Otherwise, you will create a new ACP cell.</li></a-col>
    </a-row>
    <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="To Address">
        <a-input v-model:value="form.toAddress" />
      </a-form-item>
      <a-form-item label="Transfer Count">
        <a-input v-model:value="form.transferCount" type="number" />
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
  underscoreScriptKey,
  getCells,
  compareLockScript,
  signAndSendTransaction,
  camelCaseScriptKey,
  readBigUInt128LE,
  toUint128Le,
  getBiggestCapacityCell,
  FEE_RATIO,
  sudtTypeScript
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
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    }
  },
  methods: {
    onSubmit: async function(): Promise<Record<string, unknown> | undefined> {
      const authToken: string | null = window.localStorage.getItem("authToken")
      if (!authToken) {
        console.error("No auth token")
        return
      }

      const rawTx: CKBComponents.RawTransactionToSign = getRawTxTemplate()
      let inputSignConfig = { index: 0, length: -1 }

      const biggestFromLockCell = await await getBiggestCapacityCell(JSON.parse(window.localStorage.getItem("lockScript") as string))
      if (biggestFromLockCell === undefined) {
        message.error("No Live Cells!")
        return
      }
      const sudtLiveCells = await getCells('type', underscoreScriptKey(sudtTypeScript))
      const fromSudtLiveCells = sudtLiveCells.filter((sudt: UnderscoreCell) => { return compareLockScript(sudt.output.lock, biggestFromLockCell.output.lock) })
      const fromSudtCell = fromSudtLiveCells.sort((cell1: UnderscoreCell, cell2: UnderscoreCell) => { return (Number(BigInt(cell2.block_number) - BigInt(cell1.block_number))) })[0]

      rawTx.inputs.push({
        previousOutput: {
          txHash: biggestFromLockCell.out_point.tx_hash,
          index: biggestFromLockCell.out_point.index
        },
        since: "0x0"
      })
      rawTx.witnesses.push("0x")

      rawTx.inputs.push({
        previousOutput: {
          txHash: fromSudtCell.out_point.tx_hash,
          index: fromSudtCell.out_point.index
        },
        since: "0x0"
      })
      rawTx.witnesses.push("0x")

      const toLockScript = addressToScript(this.form.toAddress)
      const toAcpScript: UnderscoreScript = {
        code_hash: process.env.VUE_APP_ACP_CODE_HASH || '',
        hash_type: process.env.VUE_APP_ACP_HASH_TYPE as CKBComponents.ScriptHashType,
        args: toLockScript.args
      }

      const toSudtAcpLiveCells = sudtLiveCells.filter((sudt: UnderscoreCell) => { return compareLockScript(sudt.output.lock, toAcpScript) })
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
            length: 2
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
            capacity: '0x' + (BigInt(142 * 10 ** 8)).toString(16),
            lock: camelCaseScriptKey(toAcpScript),
            type: sudtTypeScript
          })
          rawTx.outputsData.push('0x' + toUint128Le(BigInt(this.form.transferCount)))
        }
      } else {
        rawTx.outputs.push({
          capacity: '0x' + (BigInt(142 * 10 ** 8)).toString(16),
          lock: toLockScript,
          type: sudtTypeScript
        })
        rawTx.outputsData.push('0x' + toUint128Le(BigInt(this.form.transferCount)))
      }

      rawTx.outputs.push({
        capacity: `0x${(BigInt(fromSudtCell.output.capacity)).toString(16)}`,
        lock: camelCaseScriptKey(fromSudtCell.output.lock),
        type: sudtTypeScript
      })
      const originalSudtCount = BigInt('0x' + readBigUInt128LE(fromSudtCell.output_data.slice(2, 34)))
      const decimal: number = parseInt(window.localStorage.getItem("decimal") || "8")
      const restSudtCount = originalSudtCount - (BigInt(this.form.transferCount) * BigInt(10 ** decimal))
      rawTx.outputsData.push('0x' + toUint128Le(restSudtCount))

      rawTx.outputs.push({
        capacity: `0x${(BigInt(biggestFromLockCell.output.capacity) - BigInt(142 * 10 ** 8)).toString(16)}`,
        lock: camelCaseScriptKey(fromSudtCell.output.lock),
        type: biggestFromLockCell.output.type === null ? biggestFromLockCell.output.type : camelCaseScriptKey(biggestFromLockCell.output.type)
      })
      rawTx.outputsData.push(biggestFromLockCell.output_data)

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
      } catch (error) {
        message.error(error)
      }
    }
  }
})
</script>
