/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const KEYPERING_URL = 'http://localhost:3102'
export const SECP256K1_BLAKE160_CODE_HASH = '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8'
export const FEE_RATIO = BigInt(1_000)
export const SUDT_SMALLEST_CAPACITY = BigInt(142 * 10 ** 8)
export const SUDT_INFO_SMALLEST_CAPACITY = BigInt(169 * 10 ** 8)
export const SUDT_TYPE_SCRIPT: CKBComponents.Script = {
  codeHash: process.env.VUE_APP_SUDT_CODE_HASH!,
  hashType: process.env.VUE_APP_SUDT_HASH_TYPE as CKBComponents.ScriptHashType,
  args: window.localStorage.getItem("lockHash") || ''
}
export const SUDT_CELL_DEP: CKBComponents.CellDep = {
  outPoint: {
    txHash: process.env.VUE_APP_SUDT_TX_HASH!,
    index: process.env.VUE_APP_SUDT_INDEX!
  },
  depType: process.env.VUE_APP_SUDT_DEP_TYPE as CKBComponents.DepType
}
export const SUDT_INFO_CELL_DEP: CKBComponents.CellDep = {
  outPoint: {
    txHash: process.env.VUE_APP_SUDT_INFO_TX_HASH!,
    index: process.env.VUE_APP_SUDT_INFO_INDEX!
  },
  depType: process.env.VUE_APP_SUDT_INFO_DEP_TYPE as CKBComponents.DepType
}
export const ACP_CELL_DEP: CKBComponents.CellDep = {
  outPoint: {
    txHash: process.env.VUE_APP_ACP_TX_HASH!,
    index: process.env.VUE_APP_ACP_INDEX!
  },
  depType: process.env.VUE_APP_ACP_DEP_TYPE as CKBComponents.DepType
}
export const PW_CELL_DEP: CKBComponents.CellDep = {
  outPoint: {
    txHash: process.env.VUE_APP_PW_TX_HASH!,
    index: process.env.VUE_APP_PW_INDEX!
  },
  depType: process.env.VUE_APP_PW_DEP_TYPE as CKBComponents.DepType
}
