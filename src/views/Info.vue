<template>
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
    <a-descriptions-item v-for="info in restInfos" :label="info[0]" :key="info[0]">
      {{ info[1] }}
    </a-descriptions-item>
  </a-descriptions>
  <a-row type="flex" justify="center" style='margin-top: 10px'>
    <a-col>
      <a-button type="primary" @click="submitInfo">
        Submit Token Info
      </a-button>
    </a-col>
  </a-row>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { scriptToHash } from '@nervosnetwork/ckb-sdk-utils'
import {
  getCells,
  parseSudtInfoData,
  underscoreScriptKey,
  readBigUInt128LE,
  sudtTypeScript
} from "@/utils"
import { UnderscoreScript, UnderscoreCell } from "../interface/index"

export default defineComponent({
  data() {
    return {
      name: "",
      symbol: "",
      decimal: 0,
      totalSupply: 0,
      restInfos: [] as Array<Array<string>>
    }
  },
  async mounted() {
    const authToken: string | null = window.localStorage.getItem("authToken")
    if (!authToken) {
      console.error("No auth token")
      return
    }

    const sudtInfoTypeScript: UnderscoreScript = {
      code_hash: process.env.VUE_APP_SUDT_INFO_CODE_HASH || '',
      hash_type: process.env.VUE_APP_SUDT_INFO_HASH_TYPE as CKBComponents.ScriptHashType,
      args: scriptToHash(sudtTypeScript)
    }
    const cells = await getCells('type', sudtInfoTypeScript)
    const newewstCell = cells.sort((cell1: UnderscoreCell, cell2: UnderscoreCell) => { return (Number(BigInt(cell2.block_number) - BigInt(cell1.block_number))) })[0]
    const sudtInfo = parseSudtInfoData(newewstCell.output_data)
    this.name = sudtInfo.name
    this.symbol = sudtInfo.symbol
    this.decimal = sudtInfo.decimal
    this.restInfos = sudtInfo.restInfos

    const sudtCells = await getCells('type', underscoreScriptKey(sudtTypeScript))
    const totalSupply: string = sudtCells
      .map(cell => BigInt('0x' + readBigUInt128LE(cell.output_data.slice(2, 34))))
      .reduce((acc, val) => acc + val, BigInt(0))
      .toString()
    this.totalSupply = Number(`${totalSupply.slice(0, -(sudtInfo.decimal))}.${totalSupply.slice(-(sudtInfo.decimal), totalSupply.length)}`)
  },
  methods: {
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
      open(`mailto:asset-info-submit@nervos.org?subject=Submit Token Info&body=${TOKEN_EMAIL_BODY}`)
    }
  }
})
</script>
