import Const from "./const"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { bytesToHex } = require('@nervosnetwork/ckb-sdk-utils')

const getSummary = function (cells: Array<any>) {
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

const textToHex = function(text: string) {
  let result = text.trim()
  if (result.startsWith('0x')) {
    return result
  }
  result = bytesToHex(new TextEncoder().encode(result))
  return result
}

interface Cell {
  output_data: string;
}

const groupCells = function(cells: Cell[]) {
  return {
    emptyCells: cells.filter(cell => !cell.output_data || cell.output_data === '0x')
  }
}

export default {
  getSummary: getSummary,
  formatCkb: formatCkb,
  getRawTxTemplate: getRawTxTemplate,
  textToHex: textToHex,
  groupCells: groupCells
}
