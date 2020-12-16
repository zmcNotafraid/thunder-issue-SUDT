import { getCells, compareScript, SUDT_TYPE_SCRIPT, underscoreScriptKey } from "./index"
import { UnderscoreScript, UnderscoreCell } from '../interface'

export const combineInputCells = async (): Promise<Array<UnderscoreCell>> => {
  const lockScript: UnderscoreScript = JSON.parse(window.localStorage.getItem("lockScript") as string)
  const cells = await getCells('lock', lockScript)
  if (cells.length === 0) {
    return []
  }
  const biggestCapacityCell = cells.filter((cell: UnderscoreCell) => cell.output.type === null).sort((cell1: UnderscoreCell, cell2: UnderscoreCell) => Number(BigInt(cell2.output.capacity) - BigInt(cell1.output.capacity)))[0]

  SUDT_TYPE_SCRIPT.args = window.localStorage.getItem("lockHash") || ""
  const sudtCells = cells.filter((cell: UnderscoreCell) => { return compareScript(cell.output.type, underscoreScriptKey(SUDT_TYPE_SCRIPT)) })
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
