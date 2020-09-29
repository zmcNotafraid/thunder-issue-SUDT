<template>
  <div class="Auth">
    <button @click.prevent="getAuth()">Request Auth</button>
    <button @click.prevent="reload()">Reload{{ (loading && 'ing..') || '' }}</button>
  </div>
  <form>
    <div class="panel">
      <div class="row">
        <label for="address">Wallet Address:</label>
        <input id="address" disabled :value="wallet.address" />
      </div>
      <div class="row">
        <label>Balance without data(CKB):</label>
        <input :value="wallet.free" disabled />
      </div>
      <div class="row">
        <label>Balance (CKB):</label>
        <input :value="wallet.capacity" disabled />
      </div>
    </div>
  </form>
  <form>
    <label>UDT Count</label>
    <input type="number" v-model="count" />
    <button @click.prevent="issue()">Issue</button>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import Rpc from "../utils/rpc"
import Utils from "../utils/utils"
import Const from "../utils/const"
import { v4 as uuidv4 } from "uuid"
import BN from "bn.js"

interface Wallet {
  lockScript: {};
  address: string;
  free: string | undefined;
  capacity: string | undefined;
  lockHash: string;
}
interface Transaction {
  version: string;
  cellDeps: Array<object>;
  headerDeps: Array<object>;
  inputs: Array<object>;
  outputs: Array<object>;
  witnesses: Array<object>;
  outputsData: Array<string>;
}

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
      loading: false,
      count: "0"
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
          this.wallet.address = addresses[0].address
          this.wallet.lockHash = addresses[0].lockHash
          this.wallet.lockScript = addresses[0].lockScript
          const lockArgs = addresses[0].lockScript.args
          const cells = await Rpc.getCells(lockArgs)
          this.loading = false
          if (cells && cells.length > 0) {
            const summary = Utils.getSummary(cells)
            this.wallet.free = Utils.formatCkb(summary.free)
            this.wallet.capacity = Utils.formatCkb(summary.capacity)
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
    },
    issue: async function (): Promise<any> {
      const rawTx: Transaction = Utils.getRawTxTemplate()
      const outputCapacity = new BN(555)
      rawTx.inputs.push({
        // eslint-disable-next-line @typescript-eslint/camelcase
        previousOutput: {
          // eslint-disable-next-line @typescript-eslint/camelcase
          txHash: Const.SUDT_TX_HASH,
          index: "0x0"
        },
        since: "0x0"
      })

      rawTx.outputs.push({
        capacity: `0x${outputCapacity.toString(16)}`,
        lock: this.wallet.lockScript,
        type: {
          // eslint-disable-next-line @typescript-eslint/camelcase
          codeHash: Const.SUDT_CODE_HASH,
          // eslint-disable-next-line @typescript-eslint/camelcase
          hashType: Const.SUDT_HASH_TYPE,
          args: Utils.textToHex(uuidv4())
        }
      })
      rawTx.outputsData.push(Utils.textToHex(this.count))

      const authToken: string | null = window.localStorage.getItem("authToken")

      if (!authToken) {
        console.error("No auth token")
        return
      }
      await Rpc.sign_and_send_transaction(
        rawTx,
        authToken,
        this.wallet.lockHash
      )
    }
  }
})
</script>
