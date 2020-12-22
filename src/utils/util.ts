import { getCells, compareScript, underscoreScriptKey, getTransaction, getNetworkConst } from "./index"
import { UnderscoreScript, UnderscoreCell } from '../interface'
import { Modal } from 'ant-design-vue'
import { ModalFuncProps } from "ant-design-vue/lib/modal/Modal"
import { h, VNode } from "vue"

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

export const showTransactionModal = async (tx: string, callback: () => void): Promise<void> => {
  const vnode: VNode =
    h(
      'div',
      [
        `Waitting for blockchain confirmation `,
        h('a', {
          href: getNetworkConst("EXPLORER_URL") + tx,
          target: "_blank"
        },
        tx
        )
      ]
    )

  const infoModal = Modal.info({
    title: 'Submitted',
    content: vnode,
    centered: true,
    okText: "",
    okButtonProps: { disabled: true }
  })

  const updateModal = async (modal: { destroy: () => void; update?: (newConfig: ModalFuncProps) => void }, tx: string) => {
    const response = await getTransaction(tx)
    if (response !== undefined && response?.tx_status?.status === "committed") {
      modal.destroy()
      Modal.success({
        title: 'Complete',
        content: tx,
        maskClosable: true,
        centered: true,
        okText: "关闭"
      })
      callback()
    } else {
      setTimeout(() => { updateModal(infoModal, tx) }, 5000)
    }
  }
  setTimeout(() => { updateModal(infoModal, tx) }, 5000)
}
