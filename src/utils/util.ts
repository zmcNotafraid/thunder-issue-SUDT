import { getCells, compareScript, underscoreScriptKey, getTransaction, getNetworkConst } from "./index"
import { UnderscoreScript, UnderscoreCell } from '../interface'
import { Modal } from 'ant-design-vue'
import { ModalFuncProps } from "ant-design-vue/lib/modal/Modal"

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

export const showTransactionModal = async (tx: string): Promise<void> => {
  const infoModal = Modal.info({
    title: 'Submitted',
    content: `Waitting for blockchain confirmation ${tx}`,
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
    } else {
      setTimeout(() => { updateModal(infoModal, tx) }, 5000)
    }
  }
  setTimeout(() => { updateModal(infoModal, tx) }, 5000)
}
