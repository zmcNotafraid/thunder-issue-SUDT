import { UnderscoreCell } from '@/interface'
import { TESTNET_SCRIPT_INFO, underscoreScriptKey } from '@/utils'

export const hybridCells: Array<UnderscoreCell> = [
  {
    output: {
      capacity: '0x3e8',
      lock: {
        code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        hash_type: "type",
        args: "0x512000882efceaa8bda5abbef14dc5ea188997c2"
      },
      type: null
    },
    output_data: "0x",
    out_point: {
      tx_hash: "",
      index: ''
    },
    block_number: "",
    tx_index: ""
  },
  {
    output: {
      capacity: '0x2710',
      lock: {
        code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        hash_type: "type",
        args: "0x512000882efceaa8bda5abbef14dc5ea188997c2"
      },
      type: underscoreScriptKey(TESTNET_SCRIPT_INFO["SUDT_TYPE_SCRIPT"] as CKBComponents.Script)
    },
    output_data: "0xe8030000000000000000000000000000",
    out_point: {
      tx_hash: "",
      index: ''
    },
    block_number: "",
    tx_index: ""
  }
]

export const sudtCells: Array<UnderscoreCell> = [
  {
    output: {
      capacity: '0x3e8',
      lock: {
        code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        hash_type: "type",
        args: "0x512000882efceaa8bda5abbef14dc5ea188997c2"
      },
      type: underscoreScriptKey(TESTNET_SCRIPT_INFO["SUDT_TYPE_SCRIPT"] as CKBComponents.Script)
    },
    output_data: "0xe8030000000000000000000000000000",
    out_point: {
      tx_hash: "",
      index: ''
    },
    block_number: "",
    tx_index: ""
  },
  {
    output: {
      capacity: '0x3e8',
      lock: {
        code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        hash_type: "type",
        args: "0x512000882efceaa8bda5abbef14dc5ea188997c2"
      },
      type: underscoreScriptKey(TESTNET_SCRIPT_INFO["SUDT_TYPE_SCRIPT"] as CKBComponents.Script)
    },
    output_data: "0xe8030000000000000000000000000000",
    out_point: {
      tx_hash: "",
      index: ''
    },
    block_number: "",
    tx_index: ""
  }
]

export const capacityCells: Array<UnderscoreCell> = [
  {
    output: {
      capacity: '0x3e8',
      lock: {
        code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        hash_type: "type",
        args: "0x512000882efceaa8bda5abbef14dc5ea188997c2"
      },
      type: null
    },
    output_data: "0x",
    out_point: {
      tx_hash: "",
      index: ''
    },
    block_number: "",
    tx_index: ""
  },
  {
    output: {
      capacity: '0x2710',
      lock: {
        code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        hash_type: "type",
        args: "0x512000882efceaa8bda5abbef14dc5ea188997c2"
      },
      type: null
    },
    output_data: "0x",
    out_point: {
      tx_hash: "",
      index: ''
    },
    block_number: "",
    tx_index: ""
  }
]