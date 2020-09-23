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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Rpc from './rpc'
import Utils from './utils'

interface Wallet {
  address: string;
  free: string | undefined;
  capacity: string | undefined;
}

export default defineComponent({
  data () {
    return {
      wallet: {
        address: '',
        free: '0',
        capacity: '0'
      } as Wallet,
      loading: false
    }
  },
  methods: {
    // annotation
    reload: async function (): Promise<any> {
      const authToken = window.localStorage.getItem('authToken')
      if (!authToken) {
        console.error('No auth token')
        return
      }
      this.loading = true
      try {
        const addresses = (await Rpc.queryAddresses(authToken)).addresses
        if (addresses && addresses.length > 0) {
          this.wallet.address = addresses[0].address
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
        const token = await Rpc.requestAuth('Simplest DApp')
        window.localStorage.setItem('authToken', token)
        await this.reload()
      } catch (error) {
        console.error(error)
      }
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
