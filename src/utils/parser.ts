import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { UnderscoreCell, UnderscoreScript } from '../interface/index'

export const calCapacityAmount = function (cells: Array<UnderscoreCell>): {free: number, capacity: number} {
  const capacity = cells
    .map(cell => parseInt(cell.output.capacity))
    .reduce((acc, curr) => acc + curr, 0)

  const freeCells = cells.filter(cell => cell.output_data === '0x')
  let free = 0
  if (freeCells !== undefined) {
    free = freeCells
      .map(cell => parseInt(cell.output.capacity))
      .reduce((acc, curr) => acc + curr, 0)
  }

  return {
    free,
    capacity
  }
}

export const formatCkb = function (value: number): string | undefined {
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

export const getRawTxTemplate = (): CKBComponents.RawTransactionToSign => {
  return {
    version: '0x0',
    cellDeps: [
      {
        outPoint: {
          txHash: process.env.VUE_APP_SUDT_TX_HASH || '',
          index: process.env.VUE_APP_SUDT_INDEX || '0x0'
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

export const toUint128Le = (uint128: bigint): string => {
  const buf = Buffer.from(uint128.toString(16).padStart(32, '0'), 'hex')
  return Buffer.concat([buf.slice(16).reverse(), buf.slice(0, 16).reverse()]).toString('hex')
}

export const readBigUInt128LE = (rawHexString: string): string => {
  const buf = Buffer.from(rawHexString, 'hex')
  return buf.reverse().toString('hex')
}

export const underscoreScriptKey = (ckbScript: CKBComponents.Script): UnderscoreScript => {
  return { code_hash: ckbScript.codeHash, hash_type: ckbScript.hashType, args: ckbScript.args }
}

export const camelCaseScriptKey = (ckbScript: UnderscoreScript): CKBComponents.Script => {
  return { codeHash: ckbScript.code_hash, hashType: ckbScript.hash_type, args: ckbScript.args }
}

export const compareLockScript = (lockScript1: UnderscoreScript, lockScript2: UnderscoreScript): boolean => {
  return lockScript1.args === lockScript2.args &&
    lockScript1.code_hash === lockScript2.code_hash &&
    lockScript1.hash_type === lockScript2.hash_type
}

export const toHex = (string: string): string => {
  return Buffer.from(string).toString('hex')
}
