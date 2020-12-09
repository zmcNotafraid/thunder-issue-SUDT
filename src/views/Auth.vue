<template>
  <a-space direction="vertical">
  <a-row>
    <a-col :span="6">
      <div class="Auth">
        <a-button type="primary" @click="getAuth">
          Request Auth
        </a-button>
      </div>
    </a-col>
  </a-row>
  <a-spin tip="Loading..." :spinning="loading">
    <a-descriptions title="Wallet Info" bordered>
      <a-descriptions-item label="Address" :span="3">
        {{ address }}
      </a-descriptions-item>
      <a-descriptions-item label="Capacity (CKB)">
        {{ capacity }}
      </a-descriptions-item>
      <a-descriptions-item label="Free Capacity (CKB)">
        {{ free }}
      </a-descriptions-item>
    </a-descriptions>
    <br>
    <a-descriptions title="Issued SUDT" bordered>
      <a-descriptions-item label="Amount">
        {{ tokenAmount }}
      </a-descriptions-item>
    </a-descriptions>
  </a-spin>
  </a-space>
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
  parseBigIntStringNumber,
  sudtTypeScript,
  compareScript,
  underscoreScriptKey,
  calSudtAmount
} from "@/utils"
import { UnderscoreScript, UnderscoreCell, Account, AccountList } from "../interface/index"

export default defineComponent({
  data() {
    return {
      address: "",
      free: "0",
      capacity: "0",
      loading: false,
      tokenAmount: "0"
    }
  },
  mounted() {
    if (window.localStorage.getItem("authToken")) {
      this.reload()
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
        if (results === undefined) {
          message.error("Can't find your address.Please auth again.")
          return
        }

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
        this.address = defaultAddress.address
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

        const sudtCells = cells.filter((cell: UnderscoreCell) => { return compareScript(cell.output.type, underscoreScriptKey(sudtTypeScript)) })
        if (sudtCells.length > 0) {
          this.tokenAmount = parseBigIntStringNumber(calSudtAmount(sudtCells))
        }
        const summary = calCapacityAmount(cells)
        this.free = parseBigIntStringNumber(summary.free) || "0"
        this.capacity = parseBigIntStringNumber(summary.capacity) || "0"
        message.success("Auth Success!")
      } catch (error) {
        message.error(error.message)
      }
      this.loading = false
    },
    getAuth: async function (): Promise<void> {
      try {
        const token = await requestAuth("Simplest DApp")
        window.localStorage.setItem("authToken", token)
        await this.reload()
      } catch (error) {
        message.error(error.message)
      }
    }
  }
})
</script>

<style scoped>
.spin-content {
  border: 1px solid #91d5ff;
  background-color: #e6f7ff;
  padding: 30px;
}
</style>
