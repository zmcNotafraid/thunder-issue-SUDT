export interface Wallet {
  lockScript: {};
  address: string;
  free: string;
  capacity: string;
  lockHash: string;
}

export interface Transaction {
  version: string;
  cellDeps: Array<object>;
  headerDeps: Array<object>;
  inputs: Array<object>;
  outputs: Array<object>;
  witnesses: Array<string | object>;
  outputsData: Array<string>;
}

interface CellOutput {
  capacity: string;
  lockScript: object;
  typeScript: object;
}

export interface Cell {
  output: CellOutput;
  output_data: string;
  out_point: {
    tx_hash: string;
    index: string;
  };
}

export type ScriptHashType = 'data' | 'type'
export interface RpcScript {
  code_hash: string;
  hash_type: 'data' | 'type';
  args: string;
}
