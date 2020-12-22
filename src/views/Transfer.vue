<template>
  <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item :label="$t('labels.receiverAddress')">
      <a-input v-model:value="form.toAddress" />
    </a-form-item>
    <a-form-item :label="$t('labels.transferCount')">
      <a-input v-model:value="form.transferCount" type="number"/>
      <span>{{ $t('labels.availableSudt') }}: {{ currentSudtCount }}</span>
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 14, offset: 6 }">
      <a-checkbox v-model:checked="form.selfProvide">
        {{ $t("labels.provideCKB") }}
      </a-checkbox>
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 14, offset: 6 }">
      <a-button type="primary" @click="onSubmit">
        {{ $t("buttons.submit") }}
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
  SUDT_SMALLEST_CAPACITY,
  calSudtAmount,
  calCapacityAmount,
  parseBigIntStringNumber,
  getCells,
  underscoreScriptKey,
  showTransactionModal,
  getNetworkConst
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
      message.error(this.$t("errors.noCells"))
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
        message.error(this.$t("errors.noAuth"))
        return
      }

      const rawTx: CKBComponents.RawTransactionToSign = getRawTxTemplate()
      const fromLockScript: UnderscoreScript = JSON.parse(window.localStorage.getItem("lockScript") as string)
      let inputSignConfig = { index: 0, length: -1 }
      let restCapacity = BigInt(this.biggestCapacityCell.output.capacity)

      if (this.inputCells.length === 0) {
        message.error(this.$t("errors.noCells"))
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
      const sudtTypeScript = getNetworkConst("SUDT_TYPE_SCRIPT") as CKBComponents.Script
      sudtTypeScript.args = window.localStorage.getItem('lockHash') || ''
      const receiverSudtAcpLiveCells = receiverLockCells.filter((cell: UnderscoreCell) => { return compareScript(cell.output.type, underscoreScriptKey(sudtTypeScript)) })
      if (!this.form.selfProvide) {
        if (![getNetworkConst("ACP_CODE_HASH"), getNetworkConst("PW_CODE_HASH")].includes(receiverLockScript.codeHash)) {
          message.error(this.$t("errors.provideCkbNeeded"))
          return
        }

        if (receiverSudtAcpLiveCells.length === 0) {
          message.error(this.$t("errors.noAcpCell"))
          return
        }
      }

      if ([getNetworkConst("ACP_CODE_HASH"), getNetworkConst("PW_CODE_HASH")].includes(receiverLockScript.codeHash)) {
        const cellDep = receiverLockScript.codeHash === getNetworkConst("ACP_CODE_HASH") ? getNetworkConst("ACP_CELL_DEP") : getNetworkConst("PW_CELL_DEP")
        rawTx.cellDeps.push(cellDep as CKBComponents.CellDep)

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
            type: sudtTypeScript
          })
          const originalToSudtCount = readBigUInt128LE(receiverSudtAcpLiveCells[0].output_data.slice(2))
          rawTx.outputsData.push('0x' + toUint128Le(BigInt('0x' + originalToSudtCount) + BigInt(this.form.transferCount)))
        } else {
          rawTx.outputs.push({
            capacity: '0x' + SUDT_SMALLEST_CAPACITY.toString(16),
            lock: receiverLockScript,
            type: sudtTypeScript
          })
          rawTx.outputsData.push('0x' + toUint128Le(BigInt(this.form.transferCount)))
          restCapacity = restCapacity - SUDT_SMALLEST_CAPACITY
        }
      } else {
        rawTx.outputs.push({
          capacity: '0x' + SUDT_SMALLEST_CAPACITY.toString(16),
          lock: receiverLockScript,
          type: sudtTypeScript
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
        type: sudtTypeScript
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
        showTransactionModal(response.txHash as string)
      } catch (error) {
        message.error(error.message)
      }
    }
  }
})
</script>
