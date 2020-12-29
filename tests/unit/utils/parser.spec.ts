import { UnderscoreScript } from '@/interface'
import { MAINNET_SCRIPT_INFO, TESTNET_SCRIPT_INFO } from '@/utils'
import {
  calCapacityAmount,
  calSudtAmount,
  camelCaseScriptKey,
  compareScript,
  getNetworkConst,
  getRawTxTemplate,
  hexToString,
  parseBigIntStringNumber,
  parseSudtInfoData,
  readBigUInt128LE,
  stringToHex,
  toUint128Le,
  underscoreScriptKey
} from '@/utils/parser'
import { hybridCells, sudtCells } from '../mock/cells'

describe("calCapacityAmount", () => {
  it("returns correct data", () => {
    expect(calCapacityAmount(hybridCells)).toEqual({ free: BigInt(1000), capacity: BigInt(11000) })
  })

  it("returns 0 free capacity", () => {
    expect(calCapacityAmount(sudtCells)).toEqual({ free: BigInt(0), capacity: BigInt(2000) })
  })
})

describe('parseBigIntStringNumber', () => {
  it('returns correct result', () => {
    expect(parseBigIntStringNumber(BigInt(1314156254), 8)).toEqual("13.14156254")
  })

  it('returns correct result', () => {
    expect(parseBigIntStringNumber(BigInt(13141562), 8)).toEqual("0.13141562")
  })
})

describe('getRawTxTemplate', () => {
  it('returns correct strut', () => {
    expect(getRawTxTemplate()).toEqual(
      {
        version: '0x0',
        cellDeps: [
          TESTNET_SCRIPT_INFO.SUDT_CELL_DEP
        ],
        headerDeps: [],
        inputs: [],
        outputs: [],
        witnesses: [],
        outputsData: []
      }
    )
  })
})

describe('toUnit128Le', () => {
  it('equals litter endian string', () => {
    expect(toUint128Le(BigInt(1000))).toEqual("e8030000000000000000000000000000")
  })
})

describe('readBigUInt128Le', () => {
  it('returns correct hex', () => {
    const hexString = readBigUInt128LE("e8030000000000000000000000000000")
    expect(BigInt(`0x${hexString}`)).toEqual(BigInt(1000))
  })
})

describe('underscoreScriptKey', () => {
  it('returns underscore keys', () => {
    expect(underscoreScriptKey({ codeHash: "", hashType: "type", args: "" })).toEqual({ code_hash: "", hash_type: "type", args: "" })
  })
})

describe('camelCaseScriptKey', () => {
  it('returns camelCase keys', () => {
    expect(camelCaseScriptKey({ code_hash: "", hash_type: "type", args: "" })).toEqual({ codeHash: "", hashType: "type", args: "" })
  })
})

describe('compareScript', () => {
  const script1: UnderscoreScript = { code_hash: "0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4", hash_type: "type", args: "0x0123" }
  const script2: UnderscoreScript = { code_hash: "0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4", hash_type: "type", args: "0x0123" }
  const script3: UnderscoreScript = { code_hash: "0xe5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4", hash_type: "type", args: "0x0123" }
  const script4: UnderscoreScript = { code_hash: "0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4", hash_type: "data", args: "0x0123" }
  const script5: UnderscoreScript = { code_hash: "0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4", hash_type: "data", args: "0x0123456" }

  it('returns false when script is null', () => {
    expect(compareScript(script1, null)).toBe(false)
  })

  it('returns false when script code_hash different', () => {
    expect(compareScript(script1, script3)).toBe(false)
  })
  it('returns false when script hash_type different', () => {
    expect(compareScript(script1, script4)).toBe(false)
  })
  it('returns false when script args different', () => {
    expect(compareScript(script1, script5)).toBe(false)
  })

  it('returns true when all same', () => {
    expect(compareScript(script1, script2)).toBe(true)
  })
})

describe('stringToHex', () => {
  it('returns correct hex', () => {
    expect(stringToHex("USDC")).toEqual("55534443")
  })
})

describe("hexToString", () => {
  it("equals 'USD Coin'", () => {
    expect(hexToString("55534420436f696e")).toEqual("USD Coin")
  })

  it("equals 'USDC'", () => {
    expect(hexToString("55534443")).toEqual("USDC")
  })
})

describe('parseSudtInfoData', () => {
  it('returns correct info', () => {
    const data = "0x060a55534420436f696e0a555344430a546f74616c737570706c793a31303030303030302e303030303030"
    expect(parseSudtInfoData(data)).toEqual(
      {
        decimal: 6,
        name: 'USD Coin',
        symbol: "USDC",
        restInfos: [{ Totalsupply: "10000000.000000" }]
      }
    )
  })

  it('returns correct info when decimal is 10', () => {
    const data = "0x0a0a55534420436f696e0a555344430a546f74616c737570706c793a31303030303030302e303030303030"
    expect(parseSudtInfoData(data)).toEqual(
      {
        decimal: 10,
        name: 'USD Coin',
        symbol: "USDC",
        restInfos: [{ Totalsupply: "10000000.000000" }]
      }
    )
  })

  it('returns info when cause error', () => {
    const data = "0x06"
    expect(parseSudtInfoData(data)).toEqual(
      {
        decimal: -1,
        name: '',
        symbol: "",
        restInfos: [{}]
      }
    )
  })
})

describe('calSudtAmount', () => {
  it('returns sudt amount', () => {
    expect(calSudtAmount(sudtCells)).toEqual(BigInt(2000))
  })
})

describe('getNetworkConst', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns testnet sudt script', () => {
    expect(getNetworkConst("SUDT_TYPE_SCRIPT")).toEqual(TESTNET_SCRIPT_INFO.SUDT_TYPE_SCRIPT)
  })

  it('returns mainnet sudt script', () => {
    localStorage.setItem("networkId", "ckb")
    expect(getNetworkConst("SUDT_TYPE_SCRIPT")).toEqual(MAINNET_SCRIPT_INFO.SUDT_TYPE_SCRIPT)
  })
})
