export const KEYPERING_URL = 'http://localhost:3102'
export const SECP256K1_BLAKE160_CODE_HASH = '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8'
export const FEE_RATIO = BigInt(1_000)
export const SUDT_SMALLEST_CAPACITY = BigInt(142 * 10 ** 8)
export const SUDT_INFO_SMALLEST_CAPACITY = BigInt(169 * 10 ** 8)
export const DEVNET_SCRIPT_INFO: { [key: string]: string | CKBComponents.CellDep | CKBComponents.Script } = {
  RICH_NODE_INDEXER_URL: 'http://localhost:8114/indexer',
  RICH_NODE_RPC_URL: 'http://localhost:8114/rpc',
  EXPLORER_URL: "https://explorer.nervos.org/aggron/transaction/",

  SUDT_TYPE_SCRIPT: {
    codeHash: "0x0d4b69d980ce5b9601a2c068e99e4e089c3236e83928d7dae418a83c07c40365",
    hashType: 'data',
    args: ""
  } as CKBComponents.Script,
  SUDT_CELL_DEP: {
    outPoint: {
      txHash: "0x9a83ced6df1a0392028002e98883bea7d08e8000955b7e9cbf5626f733d4c786",
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,

  SUDT_INFO_TYPE_SCRIPT: {
    codeHash: "0xad13aff9cb9a46a0cf39581089414a7666eaba003418fc51f34434178940c53c",
    hashType: 'type',
    args: ""
  } as CKBComponents.Script,
  SUDT_INFO_CELL_DEP: {
    outPoint: {
      txHash: "0xa82a6c6f8ab7ebf8b527c1ee2c72a25e34d110d3bbf5ef21712be3e2d09dae11",
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,

  ACP_CELL_DEP: {
    outPoint: {
      txHash: "0x0f70b1d248dc24e2e25a7f9d52aadbac0ac045397e58d943a4a4ab05d146388a",
      index: "0x0"
    },
    depType: "depGroup"
  } as CKBComponents.CellDep,
  ACP_CODE_HASH: "0x7c174c7bb1aa0fe7943d6ac98b7e82163282f973b00c414754f5838942b8162b",
  PW_CELL_DEP: {
    outPoint: {
      txHash: "0x57a62003daeab9d54aa29b944fc3b451213a5ebdf2e232216a3cfed0dde61b38",
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,
  PW_CODE_HASH: "0x58c5f491aba6d61678b7cf7edf4910b1f5e00ec0cde2f42e0abb4fd9aff25a63"
}
export const TESTNET_SCRIPT_INFO: { [key: string]: string | CKBComponents.CellDep | CKBComponents.Script } = {
  RICH_NODE_INDEXER_URL: 'https://testnet.ckbapp.dev/indexer',
  RICH_NODE_RPC_URL: 'https://testnet.ckbapp.dev/rpc',
  EXPLORER_URL: "https://explorer.nervos.org/aggron/transaction/",

  SUDT_TYPE_SCRIPT: {
    codeHash: "0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4",
    hashType: 'type',
    args: ""
  } as CKBComponents.Script,
  SUDT_CELL_DEP: {
    outPoint: {
      txHash: "0xe12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769",
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,

  SUDT_INFO_TYPE_SCRIPT: {
    codeHash: "0x72f3d72944f29511eedf806d4b12d77ca0a5cfbb2000d059d8898d283971b579",
    hashType: 'type',
    args: ""
  } as CKBComponents.Script,
  SUDT_INFO_CELL_DEP: {
    outPoint: {
      txHash: "0x81eeaaedc2909faf471cc17f8aeb66dd5e78d50ad1b7eb56e41ab821ee356330",
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,

  ACP_CELL_DEP: {
    outPoint: {
      txHash: "0xec26b0f85ed839ece5f11c4c4e837ec359f5adc4420410f6453b1f6b60fb96a6",
      index: "0x0"
    },
    depType: "depGroup"
  } as CKBComponents.CellDep,
  ACP_CODE_HASH: "0x3419a1c09eb2567f6552ee7a8ecffd64155cffe0f1796e6e61ec088d740c1356",
  PW_CELL_DEP: {
    outPoint: {
      txHash: "0x57a62003daeab9d54aa29b944fc3b451213a5ebdf2e232216a3cfed0dde61b38",
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,
  PW_CODE_HASH: "0x58c5f491aba6d61678b7cf7edf4910b1f5e00ec0cde2f42e0abb4fd9aff25a63"
}

export const MAINNET_SCRIPT_INFO: { [key: string]: string | CKBComponents.CellDep | CKBComponents.Script } = {
  RICH_NODE_INDEXER_URL: 'https://mainnet.ckbapp.dev/indexer',
  RICH_NODE_RPC_URL: 'https://mainnet.ckbapp.dev/rpc',
  EXPLORER_URL: "https://explorer.nervos.org/transaction/",

  SUDT_TYPE_SCRIPT: {
    codeHash: "0x5e7a36a77e68eecc013dfa2fe6a23f3b6c344b04005808694ae6dd45eea4cfd5",
    hashType: 'type',
    args: ""
  } as CKBComponents.Script,
  SUDT_CELL_DEP: {
    outPoint: {
      txHash: "0xc7813f6a415144643970c2e88e0bb6ca6a8edc5dd7c1022746f628284a9936d5",
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,
  SUDT_INFO_TYPE_SCRIPT: {
    codeHash: "0x72f3d72944f29511eedf806d4b12d77ca0a5cfbb2000d059d8898d283971b579",
    hashType: 'type',
    args: ""
  } as CKBComponents.Script,
  SUDT_INFO_CELL_DEP: {
    outPoint: {
      txHash: "0x81eeaaedc2909faf471cc17f8aeb66dd5e78d50ad1b7eb56e41ab821ee356330",
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,
  ACP_CODE_HASH: "0xd369597ff47f29fbc0d47d2e3775370d1250b85140c670e4718af712983a2354",
  ACP_CELL_DEP: {
    outPoint: {
      txHash: '0x4153a2014952d7cac45f285ce9a7c5c0c0e1b21f2d378b82ac1433cb11c25c4d',
      index: "0x0"
    },
    depType: "depGroup"
  } as CKBComponents.CellDep,
  PW_CELL_DEP: {
    outPoint: {
      txHash: '0x1d60cb8f4666e039f418ea94730b1a8c5aa0bf2f7781474406387462924d15d4',
      index: "0x0"
    },
    depType: "code"
  } as CKBComponents.CellDep,
  PW_CODE_HASH: "0xbf43c3602455798c1a61a596e0d95278864c552fafe231c063b3fabf97a8febc"
}
