import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { MAINNET_SCRIPT_INFO, TESTNET_SCRIPT_INFO } from './index'
import { UnderscoreCell, UnderscoreScript } from '../interface/index'

export const calCapacityAmount = function (cells: Array<UnderscoreCell>): {free: bigint, capacity: bigint} {
  const capacity = cells
    .map(cell => BigInt(cell.output.capacity))
    .reduce((acc, curr) => acc + curr, BigInt(0))

  const freeCells = cells.filter(cell => cell.output_data === '0x')
  let free = 0n
  if (freeCells !== undefined) {
    free = freeCells
      .map(cell => BigInt(cell.output.capacity))
      .reduce((acc, curr) => acc + curr, BigInt(0))
  }

  return {
    free,
    capacity
  }
}

export const parseBigIntStringNumber = function (number: bigint, decimal = 8): string {
  const stringBigInt = number.toString()
  const length = stringBigInt.length
  if (length <= decimal) {
    return `0.${stringBigInt.padStart(decimal - length, "0")}`
  } else {
    return `${stringBigInt.slice(0, length - decimal)}.${stringBigInt.slice(length - decimal)}`
  }
}

export const getRawTxTemplate = (): CKBComponents.RawTransactionToSign => {
  return {
    version: '0x0',
    cellDeps: [
      getNetworkConst("SUDT_CELL_DEP") as CKBComponents.CellDep
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

export const compareScript = (script1: UnderscoreScript | null, script2: UnderscoreScript | null): boolean => {
  if (script1 === null || script2 === null) {
    return false
  }
  return script1.args === script2.args &&
    script1.code_hash === script2.code_hash &&
    script1.hash_type === script2.hash_type
}

export const stringToHex = (string: string): string => {
  return Buffer.from(string).toString('hex')
}

export const hexToString = (hex: string): string => {
  return Buffer.from(hex, 'hex').toString('utf-8')
}

export const parseSudtInfoData = (hexData: string): {decimal: number, name: string, symbol: string, restInfos: Array<Record<string, unknown>> } => {
  try {
    let data = hexData
    if (hexData.slice(0, 6) === "0x0a0a") {
      data = data.replace("0x0a", "0xa")
    }
    const [decimal, name, symbol, ...other] = data.split("0a")
    let restInfos: Array<Record<string, unknown>> = []
    if (other !== [""]) {
      restInfos = other.map(field => {
        const key: string = field.split("3a")[0]
        const value: string = field.split("3a")[1]
        const _obj: Record<string, unknown> = {}
        _obj[hexToString(key)] = hexToString(value)
        return _obj
      })
    }
    return {
      decimal: parseInt(decimal),
      name: hexToString(name),
      symbol: hexToString(symbol),
      restInfos: restInfos
    }
  } catch (error) {
    return {
      decimal: -1,
      name: "",
      symbol: "",
      restInfos: [{}]
    }
  }
}

export const calSudtAmount = function(cells: Array<UnderscoreCell>): bigint {
  const amount = cells
    .map(cell => BigInt('0x' + readBigUInt128LE(cell.output_data.slice(2, 34))))
    .reduce((acc, curr) => acc + curr, BigInt(0))
  return amount
}

export const getNetworkConst = (key: string): string | CKBComponents.CellDep | CKBComponents.Script => {
  return window.localStorage.getItem("networkId") === 'ckb' ? MAINNET_SCRIPT_INFO[key] : TESTNET_SCRIPT_INFO[key]
}
