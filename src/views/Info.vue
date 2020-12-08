<template>
  <div>
    <a-button type="primary" @click="showModal">
      Generate SUDT Info
    </a-button>
    <a-modal
      title="Title"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <template v-slot:footer>
        <a-button key="back" @click="handleCancel"> Return </a-button>
        <a-button
          key="submit"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          Submit
        </a-button>
      </template>
      <a-form :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="Token Total Supply Count">
          <a-input v-model:value="form.count" type="number" min="1" step="1" />
        </a-form-item>
        <a-form-item label="Token Name">
          <a-input v-model:value="form.name" placeholder="nervos token" />
        </a-form-item>
        <a-form-item label="Token Symbol">
          <a-input v-model:value="form.symbol" placeholder="CKB" />
        </a-form-item>
        <a-form-item label="Token Decimal">
          <a-input
            v-model:value="form.decimal"
            type="number"
            min="0"
            step="1"
            placeholder="default is 8"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
  <a-descriptions title="Token Info" bordered>
    <a-descriptions-item label="Name">
      {{ name }}
    </a-descriptions-item>
    <a-descriptions-item label="Symbol">
      {{ symbol }}
    </a-descriptions-item>
    <a-descriptions-item label="Decimal">
      {{ decimal }}
    </a-descriptions-item>
    <a-descriptions-item
      v-for="info in restInfos"
      :label="Object.keys(info)[0]"
      :key="Object.values(info)[0]"
    >
      {{ Object.values(info)[0] }}
    </a-descriptions-item>
  </a-descriptions>
  <a-row type="flex" justify="center" style="margin-top: 10px">
    <a-col>
      <a-button type="primary" @click="submitInfo">
        Submit Token Info
      </a-button>
    </a-col>
  </a-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { message } from 'ant-design-vue'
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { getTransactionSize, scriptToHash } from '@nervosnetwork/ckb-sdk-utils'
import {
  getCells,
  parseSudtInfoData,
  underscoreScriptKey,
  readBigUInt128LE,
  sudtTypeScript,
  camelCaseScriptKey,
  getRawTxTemplate,
  getBiggestCapacityCell,
  stringToHex,
  FEE_RATIO,
  signAndSendTransaction
} from '@/utils'
import { UnderscoreScript, UnderscoreCell } from '../interface/index'

export default defineComponent({
  data() {
    return {
      form: {
        count: '0',
        name: '',
        symbol: '',
        decimal: 8
      },
      visible: false,
      confirmLoading: false,
      name: '',
      symbol: '',
      decimal: 0,
      totalSupply: 0,
      restInfos: [] as Array<Record<string, unknown>>
    }
  },
  async mounted() {
    const authToken: string | null = window.localStorage.getItem('authToken')
    if (!authToken) {
      console.error('No auth token')
      return
    }

    const sudtInfoTypeScript: UnderscoreScript = {
      code_hash: process.env.VUE_APP_SUDT_INFO_CODE_HASH || '',
      hash_type: process.env
        .VUE_APP_SUDT_INFO_HASH_TYPE as CKBComponents.ScriptHashType,
      args: scriptToHash(
        camelCaseScriptKey(
          JSON.parse(window.localStorage.getItem('lockScript') as string)
        )
      )
    }
    const cells = await getCells('type', sudtInfoTypeScript)
    const newewstCell = cells.sort(
      (cell1: UnderscoreCell, cell2: UnderscoreCell) => {
        return Number(BigInt(cell2.block_number) - BigInt(cell1.block_number))
      }
    )[0]
    const sudtInfo = parseSudtInfoData(newewstCell.output_data)
    this.name = sudtInfo.name
    this.symbol = sudtInfo.symbol
    this.decimal = sudtInfo.decimal
    this.restInfos = sudtInfo.restInfos

    const sudtCells = await getCells(
      'type',
      underscoreScriptKey(sudtTypeScript)
    )
    const totalSupply: string = sudtCells
      .map((cell) =>
        BigInt('0x' + readBigUInt128LE(cell.output_data.slice(2, 34)))
      )
      .reduce((acc, val) => acc + val, BigInt(0))
      .toString()
    this.totalSupply = Number(
        `${totalSupply.slice(0, -sudtInfo.decimal)}.${totalSupply.slice(
          -sudtInfo.decimal,
          totalSupply.length
        )}`
    )
  },
  methods: {
    showModal() {
      this.visible = true
    },
    handleCancel() {
      console.log('Clicked cancel button')
      this.visible = false
    },
    handleSubmit: async function (): Promise<Record<string, unknown> | undefined> {
      this.confirmLoading = true
      setTimeout(() => {
        this.visible = false
        this.confirmLoading = false
      }, 2000)
      const authToken: string | null = window.localStorage.getItem('authToken')

      if (!authToken) {
        message.error('No auth token')
        return
      }
      window.localStorage.setItem('decimal', this.form.decimal.toString())
      const rawTx: CKBComponents.RawTransactionToSign = getRawTxTemplate()
      const cell: UnderscoreCell = await getBiggestCapacityCell(
        JSON.parse(window.localStorage.getItem('lockScript') as string)
      )
      const sudtInfoCapacity = BigInt(170 * 10 ** 8)
      let restCapacity = BigInt(cell.output.capacity) - sudtInfoCapacity
      let totalSupply = BigInt(this.form.count)

      rawTx.cellDeps.push({
        outPoint: {
          txHash: process.env.VUE_APP_SUDT_INFO_TX_HASH as string,
          index: process.env.VUE_APP_SUDT_INFO_INDEX as string
        },
        depType: 'code'
      })

      rawTx.inputs.push({
        previousOutput: {
          txHash: cell.out_point.tx_hash,
          index: cell.out_point.index
        },
        since: '0x0'
      })
      rawTx.witnesses.push('0x')

      const sudtInfoTypeScript = {
        codeHash: process.env.VUE_APP_SUDT_INFO_CODE_HASH || '',
        hashType: process.env
          .VUE_APP_SUDT_INFO_HASH_TYPE as CKBComponents.ScriptHashType,
        args: scriptToHash(
          camelCaseScriptKey(
            JSON.parse(window.localStorage.getItem('lockScript') as string)
          )
        )
      }
      const sudtInfoCells = await getCells(
        'type',
        underscoreScriptKey(sudtInfoTypeScript)
      )
      if (sudtInfoCells.length > 0) {
        rawTx.inputs.push({
          previousOutput: {
            txHash: sudtInfoCells[0].out_point.tx_hash,
            index: sudtInfoCells[0].out_point.index
          },
          since: '0x0'
        })
        rawTx.witnesses.push('0x')
        restCapacity = restCapacity - BigInt(sudtInfoCells[0].output.capacity)
        const oldTotalSupply = parseSudtInfoData(
          sudtInfoCells[0].output_data
        ).restInfos.filter((obj) => obj.TotalSupply !== undefined)

        totalSupply = totalSupply + BigInt(oldTotalSupply[0].TotalSupply)
      }

      rawTx.outputs.push({
        capacity: `0x${sudtInfoCapacity.toString(16)}`,
        lock: camelCaseScriptKey(
          JSON.parse(window.localStorage.getItem('lockScript') as string)
        ),
        type: sudtInfoTypeScript
      })

      rawTx.outputsData.push(
          `0x${this.form.decimal.toString(16).padStart(2, '0')}0a${stringToHex(
            this.form.name
          )}0a${stringToHex(this.form.symbol)}0a${stringToHex(
            'TotalSupply:' + totalSupply.toString()
          )}`
      )

      rawTx.outputs.push({
        capacity: `0x${restCapacity.toString(16)}`,
        lock: camelCaseScriptKey(
          JSON.parse(window.localStorage.getItem('lockScript') as string)
        ),
        type: null
      })
      rawTx.outputsData.push('0x')

      const minerFee = BigInt(getTransactionSize(rawTx)) * FEE_RATIO
      rawTx.outputs[1].capacity =
          '0x' + (BigInt(rawTx.outputs[1].capacity) - minerFee).toString(16)

      try {
        const response = await signAndSendTransaction(
          rawTx,
          authToken,
            window.localStorage.getItem('lockHash') as string
        )
        message.success(`TX: ${response.txHash}`, 10)
      } catch (error) {
        message.error(error.message)
      }
    },
    submitInfo() {
      const TOKEN_EMAIL_BODY = `
                      Title: Submit Token Information%0a%0d
                      Type Script:%0a%0d
                          Code Hash: ${sudtTypeScript.codeHash}%0a%0d
                          Hash Type: ${sudtTypeScript.hashType}%0a%0d
                          Args: ${sudtTypeScript.args}%0a%0d
                      Information:%0a%0d
                        Full Name: ${this.name}%0a%0d
                        Symbol: ${this.symbol}%0a%0d
                        Decimal: ${this.decimal}%0%0a%0d
                        Description:%0a%0d
                        Website:%0a%0d
                        Icon File: attachment (40 x 40)%0a%0d
                        Other Info:%0a%0d
                      Note: Only accept sUDT information submission now.
                      `
      open(
          `mailto:asset-info-submit@nervos.org?subject=Submit Token Info&body=${TOKEN_EMAIL_BODY}`
      )
    }
  }
})
</script>
