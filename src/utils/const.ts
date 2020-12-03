export const KEYPERING_URL = 'http://localhost:3102'
export const SECP256K1_BLAKE160_CODE_HASH = '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8'
export const FEE_RATIO = BigInt(1_000)
export const SUDT_SMALLEST_CAPACITY = BigInt(142 * 10 ** 8)
export const sudtTypeScript: CKBComponents.Script = {
  codeHash: process.env.VUE_APP_SUDT_CODE_HASH || '',
  hashType: process.env.VUE_APP_SUDT_HASH_TYPE as CKBComponents.ScriptHashType,
  args: window.localStorage.getItem("lockHash") || ''
}
