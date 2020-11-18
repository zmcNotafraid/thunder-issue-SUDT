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
import { message } from 'ant-design-vue'
import {
  getCells,
  queryAddresses,
  requestAuth,
  SECP256K1_BLAKE160_CODE_HASH,
  calCapacityAmount,
  formatCkb
} from "@/utils"
import { UnderscoreScript, Account, AccountList } from "../interface/index"

export default defineComponent({
  data() {
    return {
      wallet: {
        address: "",
        free: "0",
        capacity: "0"
      },
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      loading: false
    }
  },
  methods: {
    reload: async function (): Promise<undefined> {
      this.loading = true

      const authToken = window.localStorage.getItem("authToken")
      if (!authToken) {
        message.error("No auth token")
        this.loading = false
        return
      }

      try {
        const results: AccountList = await queryAddresses(authToken)
        const addresses: Array<Account> = results.addresses
        const address = addresses.filter(
          (address: Account) =>
            address.lockScriptMeta.name === "Secp256k1"
        )
        if (address.length === 0) {
          this.loading = false
          message.error("No Secp256k1 address")
          return
        }

        const defaultAddress = address[0]
        this.wallet.address = defaultAddress.address
        window.localStorage.setItem("lockHash", defaultAddress.lockHash)

        const lockScript: UnderscoreScript = {
          code_hash: SECP256K1_BLAKE160_CODE_HASH,
          hash_type: 'type',
          args: defaultAddress.lockScript.args
        }
        window.localStorage.setItem(
          "lockScript",
          JSON.stringify(lockScript || {})
        )

        const cells = await getCells('lock', lockScript)
        if (cells.length === 0) {
          this.loading = false
          message.error("No avaiable cells")
          return
        }
        const summary = calCapacityAmount(cells)
        this.wallet.free = formatCkb(summary.free) || "0"
        this.wallet.capacity = formatCkb(summary.capacity) || "0"
        message.success("Auth Success!")
      } catch (error) {
        message.error(error)
      }
      this.loading = false
    },
    getAuth: async function (): Promise<void> {
      try {
        const token = await requestAuth("Simplest DApp")
        window.localStorage.setItem("authToken", token)
        await this.reload()
      } catch (error) {
        message.error(error)
      }
    }
  }
})
</script>
