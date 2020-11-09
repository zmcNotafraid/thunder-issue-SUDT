import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { SUDT_TX_HASH } from "./const"
import { Cell, RpcScript } from '../interface/index'

const getSummary = function (cells: Array<Cell>) {
  const inuseCells = cells.filter(cell => cell.output_data !== '0x')
  let inuse = 0
  if (inuseCells !== undefined) {
    inuse = inuseCells
      .map(cell => parseInt(cell.output.capacity))
      .reduce((acc, curr) => acc + curr, 0)
  }

  const freeCells = cells.filter(cell => cell.output_data === '0x')
  let free = 0
  if (freeCells !== undefined) {
    free = freeCells
      .map(cell => parseInt(cell.output.capacity))
      .reduce((acc, curr) => acc + curr, 0)
  }

  const capacity = inuse + free
  return {
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
          txHash: SUDT_TX_HASH,
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

const toUint128Le = (uint128: bigint) => {
  const buf = Buffer.from(uint128.toString(16).padStart(32, '0'), 'hex')
  return Buffer.concat([buf.slice(16).reverse(), buf.slice(0, 16).reverse()]).toString('hex')
}

const filterEmptyCells = function(cells: Cell[]) {
  return {
    emptyCells: cells.filter(cell => !cell.output_data || cell.output_data === '0x')
  }
}

export const readBigUInt128LE = (rawHexString: string) => {
  const buf = Buffer.from(rawHexString, 'hex')
  return buf.reverse().toString('hex')
}

export const lowerScriptKey = (ckbScript: CKBComponents.Script) => {
  // eslint-disable-next-line @typescript-eslint/camelcase
  return { code_hash: ckbScript.codeHash, hash_type: ckbScript.hashType, args: ckbScript.args }
}

export const camelCaseScriptKey = (ckbScript: RpcScript): CKBComponents.Script => {
  return { codeHash: ckbScript.code_hash, hashType: ckbScript.hash_type, args: ckbScript.args }
}

export default {
  getSummary,
  formatCkb,
  getRawTxTemplate,
  filterEmptyCells,
  toUint128Le,
  readBigUInt128LE,
  lowerScriptKey,
  camelCaseScriptKey
}
