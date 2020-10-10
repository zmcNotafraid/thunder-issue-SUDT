import Const from "./const"
import CkbSdkUtils from '@nervosnetwork/ckb-sdk-utils/lib/convertors'
import { Cell } from '../interface/index'

const getSummary = function (cells: Array<Cell>) {
  const inuse = cells
    .filter(cell => cell.output_data !== '0x')
    .map(cell => parseInt(cell.output.capacity))
    .reduce((acc, curr) => acc + curr, 0)

  const free = cells
    .filter(cell => cell.output_data === '0x')
    .map(cell => parseInt(cell.output.capacity))
    .reduce((acc, curr) => acc + curr, 0)

  const capacity = inuse + free
  return {
    inuse,
    free,
    capacity
  }
}

const formatCkb = function (value: number): string | undefined {
  if (typeof value === 'undefined') {
    return undefined
  }
  const fraction: number = value % 100000000
  const fractionStr: string = fraction.toString().padStart(8, '0')
  const integer: number = Math.floor(value / 100000000)
  const integerStr: string = new Intl.NumberFormat(undefined, {
    useGrouping: true
  }).format(integer)
  return integerStr + '.' + fractionStr
}

const getRawTxTemplate = function () {
  return {
    version: '0x0',
    cellDeps: [
      {
        outPoint: {
          txHash: Const.SUDT_TX_HASH,
          index: '0x0'
        },
        depType: 'code'
      }
    ],
    headerDeps: [],
    inputs: [],
    outputs: [],
    witnesses: [],
    outputsData: []
  }
}

const toUint128Le = (uint128: string | bigint) => {
  const val = (typeof uint128 === 'bigint' ? uint128.toString(16) : uint128.slice(2)).padStart(32, '0')
  const viewRight = CkbSdkUtils.toUint64Le(`0x${val.slice(0, 16)}`).slice(2)
  const viewLeft = CkbSdkUtils.toUint64Le(`0x${val.slice(16)}`).slice(2)
  return `0x${viewLeft}${viewRight}`
}

const filterEmptyCells = function(cells: Cell[]) {
  return {
    emptyCells: cells.filter(cell => !cell.output_data || cell.output_data === '0x')
  }
}

export default {
  getSummary,
  formatCkb,
  getRawTxTemplate,
  filterEmptyCells,
  toUint128Le
}
