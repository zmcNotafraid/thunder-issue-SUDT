<template>
  <a-row>
    <a-col :span="6" :offset="8">
      <div class="Auth">
        <a-button type="primary" @click="getAuth">
          Request Auth
        </a-button>
        <a-button @click="reload" style="margin-left: 10px;">
          Reload{{ (loading && "ing..") || "" }}
        </a-button>
      </div>
    </a-col>
  </a-row>
  <a-form
    :layout="inline"
    :model="wallet"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <a-form-item label="Wallet Addresss">
      <a-input disabled v-model:value="wallet.address" />
    </a-form-item>
    <a-form-item label="Balance without data(CKB)">
      <a-input disabled v-model:value="wallet.free" />
    </a-form-item>
    <a-form-item label="Balance (CKB)">
      <a-input disabled v-model:value="wallet.capacity" />
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import Rpc from "../utils/rpc"
import Utils from "../utils/utils"
import { Wallet } from "../interface/index"

export default defineComponent({
  data() {
    return {
      wallet: {
        address: "",
        free: "0",
        capacity: "0",
        lockHash: "",
        lockScript: {}
      } as Wallet,
      summary: {
        free: 0,
        capacity: 0
      },
      form: {
        count: "0"
      },
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      loading: false,
      emptyCells: []
    }
  },
  methods: {
    // annotation
    reload: async function (): Promise<any> {
      const authToken = window.localStorage.getItem("authToken")
      if (!authToken) {
        console.error("No auth token")
        return
      }
      this.loading = true
      try {
        const addresses = (await Rpc.queryAddresses(authToken)).addresses
        if (addresses && addresses.length > 0) {
          const defaultAddress = addresses.filter(
            (address: { lockScriptMeta: { name: string } }) =>
              address.lockScriptMeta.name === "Secp256k1"
          )[0]
          this.wallet.address = defaultAddress.address
          this.wallet.lockHash = defaultAddress.lockHash
          this.wallet.lockScript = defaultAddress.lockScript
          window.localStorage.setItem("lockHash", this.wallet.lockHash)
          window.localStorage.setItem(
            "lockScript",
            JSON.stringify(this.wallet.lockScript || {})
          )
          const lockArgs = defaultAddress.lockScript.args
          const cells = await Rpc.getCells(lockArgs)
          this.loading = false
          if (cells && cells.length > 0) {
            this.summary = Utils.getSummary(cells)
            window.localStorage.setItem("free", this.summary.free.toString())
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { emptyCells } = Utils.filterEmptyCells(cells)
            this.emptyCells = emptyCells as []
            window.localStorage.setItem(
              "emptyCells",
              JSON.stringify(this.emptyCells)
            )
            this.wallet.free = Utils.formatCkb(this.summary.free) as string
            this.wallet.capacity = Utils.formatCkb(
              this.summary.capacity
            ) as string
          }
        }
      } catch (error) {
        console.error(error)
        this.loading = false
      }
    },
    getAuth: async function (): Promise<any> {
      try {
        const token = await Rpc.requestAuth("Simplest DApp")
        window.localStorage.setItem("authToken", token)
        await this.reload()
      } catch (error) {
        console.error(error)
      }
    }
  }
})
</script>
