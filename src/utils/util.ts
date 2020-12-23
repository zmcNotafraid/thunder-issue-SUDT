import { getCells, compareScript, underscoreScriptKey, getTransaction, getNetworkConst, queryAddresses } from "./index"
import { UnderscoreScript, UnderscoreCell } from '../interface'
import { message, Modal, Spin } from 'ant-design-vue'
import { ModalFuncProps } from "ant-design-vue/lib/modal/Modal"
import { h, VNode, ComponentPublicInstance } from "vue"

export const combineInputCells = async (): Promise<Array<UnderscoreCell>> => {
  const lockScript: UnderscoreScript = JSON.parse(window.localStorage.getItem("lockScript") as string)
  const cells = await getCells('lock', lockScript)
  if (cells.length === 0) {
    return []
  }
  const biggestCapacityCell = cells.filter((cell: UnderscoreCell) => cell.output.type === null).sort((cell1: UnderscoreCell, cell2: UnderscoreCell) => Number(BigInt(cell2.output.capacity) - BigInt(cell1.output.capacity)))[0]

  const sudtTypeScript = getNetworkConst("SUDT_TYPE_SCRIPT") as CKBComponents.Script
  sudtTypeScript.args = window.localStorage.getItem('lockHash') || ''
  const sudtCells = cells.filter((cell: UnderscoreCell) => { return compareScript(cell.output.type, underscoreScriptKey(sudtTypeScript)) })
  if (sudtCells.length > 0) {
    return [biggestCapacityCell].concat(sudtCells)
  } else {
    return []
  }
}

export const getBiggestCapacityCell = async (lockScript: UnderscoreScript): Promise<UnderscoreCell> => {
  const cells: Array<UnderscoreCell> = await getCells('lock', lockScript)
  return cells.filter((cell: UnderscoreCell) => cell.output.type === null).sort((cell1: UnderscoreCell, cell2: UnderscoreCell) => Number(BigInt(cell2.output.capacity) - BigInt(cell1.output.capacity)))[0]
}

export const showTransactionModal = async (tx: string, componentInstance: ComponentPublicInstance): Promise<void> => {
  const pendingVnode: VNode =
    h(
      'div',
      [
        componentInstance.$t('modal.blockchainConfirmation'),
        h('a', {
          href: getNetworkConst("EXPLORER_URL") + tx,
          target: "_blank"
        },
        tx
        )
      ]
    )
  const infoModal = Modal.info({
    title: h('span', [componentInstance.$t('modal.pending'), h(Spin)]),
    content: pendingVnode,
    centered: true,
    okText: componentInstance.$t('modal.close'),
    okButtonProps: { disabled: true }
  })

  const updateModal = async (modal: { destroy: () => void; update?: (newConfig: ModalFuncProps) => void }, tx: string) => {
    const response = await getTransaction(tx)
    if (response !== undefined && response?.tx_status?.status === "committed") {
      modal.destroy()
      const completeVnode: VNode =
        h(
          'div',
          [
            "",
            h('a', {
              href: getNetworkConst("EXPLORER_URL") + tx,
              target: "_blank"
            },
            tx
            )
          ]
        )

      Modal.success({
        title: componentInstance.$t('modal.complete'),
        content: completeVnode,
        maskClosable: true,
        centered: true,
        onOk: () => { setTimeout(componentInstance.$router.go, 1000) },
        okText: componentInstance.$t('modal.close')
      })
    } else {
      setTimeout(() => { updateModal(infoModal, tx) }, 5000)
    }
  }
  setTimeout(() => { updateModal(infoModal, tx) }, 5000)
}

export const isKeyperingConnected = async (componentInstance: ComponentPublicInstance): Promise<boolean> => {
  try {
    const address = await queryAddresses(window.localStorage.getItem("authToken") || "")
    if (address === undefined) {
      message.error(componentInstance.$t("errors.noAddress"))
      return false
    } else {
      return true
    }
  } catch (error) {
    if (error.message === "Failed to fetch") {
      const vnode: VNode =
        h(
          'span',
          [
            componentInstance.$t("errors.keypering"),
            h('a', {
              href: 'https://github.com/nervosnetwork/keypering/releases',
              target: "_blank"
            },
            'https://github.com/nervosnetwork/keypering/releases'
            )
          ]
        )
      message.error(vnode)
      return false
    } else {
      return true
    }
  }
}
