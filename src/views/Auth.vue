<template>
  <a-space direction="vertical">
  <a-row>
    <a-col :span="6">
      <div class="Auth">
        <a-button type="primary" @click="getAuth">
          {{ connectButton }}
        </a-button>
      </div>
    </a-col>
  </a-row>
  <a-spin tip="Loading..." :spinning="loading">
    <a-descriptions :title="$t('title.walletInfo')" bordered>
      <a-descriptions-item :label="$t('labels.address')" :span="3">
        {{ address }}
      </a-descriptions-item>
      <a-descriptions-item :label="$t('labels.capacity')">
        {{ capacity }}
      </a-descriptions-item>
      <a-descriptions-item :label="$t('labels.free')">
        {{ free }}
      </a-descriptions-item>
    </a-descriptions>
  </a-spin>
  </a-space>
</template>

<script lang="ts">
import { defineComponent, h, VNode } from "vue"
import { message } from 'ant-design-vue'
import {
  getCells,
  queryAddresses,
  requestAuth,
  SECP256K1_BLAKE160_CODE_HASH,
  calCapacityAmount,
  parseBigIntStringNumber
} from "@/utils"
import { UnderscoreScript, Account, AccountList } from "../interface/index"

export default defineComponent({
  data() {
    return {
      address: "",
      free: "0",
      capacity: "0",
      loading: false,
      tokenAmount: "0",
      connectButton: ''
    }
  },
  mounted() {
    this.switchConnectButtonContent()
    if (window.localStorage.getItem("authToken")) {
      this.reload()
    }
  },
  watch: {
    address: function () {
      this.switchConnectButtonContent()
    }
  },
  methods: {
    switchConnectButtonContent: function () {
      if (this.address === "") {
        this.connectButton = this.$t('buttons.connect')
      } else {
        if (window.localStorage.getItem("networkId") === "ckb") {
          this.connectButton = this.$t("buttons.connectedMainnet")
        } else {
          this.connectButton = this.$t('buttons.connectedTestnet')
        }
      }
    },
    reload: async function (): Promise<undefined> {
      this.loading = true

      const authToken = window.localStorage.getItem("authToken")
      if (!authToken) {
        message.error(this.$t("errors.noAuth"))
        this.loading = false
        return
      }

      try {
        const results: AccountList | undefined = await queryAddresses(authToken)
        if (results === undefined) {
          message.error(this.$t("errors.noAddress"))
          this.loading = false
          return
        }

        const addresses: Array<Account> = results.addresses
        const address = addresses.filter(
          (address: Account) =>
            address.lockScriptMeta.name === "Secp256k1"
        )
        if (address.length === 0) {
          this.loading = false
          message.error(this.$t("errors.no256k1Address"))
          return
        }

        const defaultAddress = address[0]
        this.address = defaultAddress.address
        window.localStorage.setItem("address", defaultAddress.address)
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
          return
        }

        const summary = calCapacityAmount(cells)
        this.free = parseBigIntStringNumber(summary.free) || "0"
        this.capacity = parseBigIntStringNumber(summary.capacity) || "0"
        message.success(this.$t("success.auth"))
      } catch (error) {
        this.loading = false
        if (error.message === "Failed to fetch") {
          const vnode: VNode =
            h(
              'span',
              [
                this.$t("errors.keypering"),
                h('a', {
                  href: 'https://github.com/nervosnetwork/keypering/releases',
                  target: "_blank"
                },
                'https://github.com/nervosnetwork/keypering/releases'
                )
              ]
            )
          message.error(vnode)
        } else {
          message.error(error.message)
        }
      }
      this.loading = false
    },
    getAuth: async function (): Promise<void> {
      try {
        const response = await requestAuth("Simplest DApp")
        window.localStorage.setItem("authToken", response.token)
        window.localStorage.setItem("networkId", response.networkId)
        await this.reload()
      } catch (error) {
        if (error.message === "Failed to fetch") {
          const vnode: VNode =
            h(
              'span',
              [
                this.$t("errors.keypering"),
                h('a', {
                  href: 'https://github.com/nervosnetwork/keypering/releases',
                  target: "_blank"
                },
                'https://github.com/nervosnetwork/keypering/releases'
                )
              ]
            )
          message.error(vnode)
        } else {
          message.error(error.message)
        }
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
