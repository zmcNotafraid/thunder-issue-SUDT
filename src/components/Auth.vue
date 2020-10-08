<template>
  <div class="Auth">
    <button @click.prevent="getAuth()">Request Auth</button>
    <button @click.prevent="reload()">
      Reload{{ (loading && "ing..") || "" }}
    </button>
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
    <a-button type="primary" @click.prevent="issue()">Issue</a-button>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import Rpc from "../utils/rpc"
import Utils from "../utils/utils"
import Const from "../utils/const"
import BN from "bn.js"

interface Wallet {
  lockScript: {};
  address: string;
  free: string;
  capacity: string;
  lockHash: string;
}
interface Summary {
  free: number;
  capacity: number;
}
interface Transaction {
  version: string;
  cellDeps: Array<object>;
  headerDeps: Array<object>;
  inputs: Array<object>;
  outputs: Array<object>;
  witnesses: Array<string | object>;
  outputsData: Array<string>;
}
interface Cell {
  output_data: string;
  out_point: {
    tx_hash: string;
    index: string;
  };
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
      summary: {
        free: 0,
        capacity: 0
      },
      loading: false,
      count: "0",
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
          this.wallet.address = addresses[1].address
          this.wallet.lockHash = addresses[1].lockHash
          this.wallet.lockScript = addresses[1].lockScript
          const lockArgs = addresses[1].lockScript.args
          const cells = await Rpc.getCells(lockArgs)
          this.loading = false
          if (cells && cells.length > 0) {
            this.summary = Utils.getSummary(cells)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { emptyCells } = Utils.groupCells(cells)
            this.emptyCells = emptyCells as []
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
    },
    issue: async function (): Promise<any> {
      const rawTx: Transaction = Utils.getRawTxTemplate()
      const outputCapacity = new BN(142 * 100000000)
      const fee = new BN(0.1 * 100000000)
      const freeOutputCapacity = new BN(this.summary.free)

      const cells: Cell[] = this.emptyCells
      for (const cell of cells) {
        rawTx.inputs.push({
          previousOutput: {
            txHash: cell.out_point.tx_hash,
            index: cell.out_point.index
          },
          since: "0x0"
        })
        rawTx.witnesses.push("0x")
      }

      rawTx.outputs.push({
        capacity: `0x${outputCapacity.toString(16)}`,
        lock: this.wallet.lockScript,
        type: {
          // eslint-disable-next-line @typescript-eslint/camelcase
          codeHash: Const.SUDT_CODE_HASH,
          // eslint-disable-next-line @typescript-eslint/camelcase
          hashType: Const.SUDT_HASH_TYPE,
          args: this.wallet.lockHash
        }
      })
      // eslint-disable-next-line no-undef
      rawTx.outputsData.push(Utils.toUint128Le(BigInt(this.count)))

      rawTx.outputs.push({
        capacity: `0x${freeOutputCapacity.sub(outputCapacity).sub(fee).toString(16)}`,
        lock: this.wallet.lockScript,
        type: null
      })
      rawTx.outputsData.push("0x")

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
