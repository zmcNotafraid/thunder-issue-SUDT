export interface Wallet {
  lockScript: CKBComponents.Script;
  address: string;
  free: string;
  capacity: string;
  lockHash: string;
}

export interface Cell {
  output: CKBComponents.CellOutput;
  // eslint-disable-next-line camelcase
  output_data: string;
  // eslint-disable-next-line camelcase
  out_point: {
  // eslint-disable-next-line camelcase
    tx_hash: string;
    index: string;
  };
}

export type ScriptHashType = 'data' | 'type'
export interface RpcScript {
  // eslint-disable-next-line camelcase
  code_hash: string;
  // eslint-disable-next-line camelcase
  hash_type: 'data' | 'type';
  args: string;
}
