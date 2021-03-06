import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { KEYPERING_URL, getNetworkConst } from '../utils'
import { UnderscoreScript, AccountList, UnderscoreCell } from '../interface'
import { message } from 'ant-design-vue'

export const requestAuth = async (description: string): Promise<{token: string, networkId: string}> => {
  const response = await fetch(KEYPERING_URL, {
    method: 'POST',
    body: JSON.stringify({
      id: 2,
      jsonrpc: '2.0',
      method: 'auth',
      params: {
        description
      }
    })
  })
  const data = await response.json()
  return data.result
}

export const queryAddresses = async (token: string): Promise<AccountList | undefined> => {
  const response = await fetch(KEYPERING_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id: 3,
      jsonrpc: '2.0',
      method: 'query_addresses'
    })
  })
  const data = await response.json()
  return data.result
}

export const getCells = async (scriptType: 'lock' | 'type', script: UnderscoreScript): Promise<Array<UnderscoreCell> | []> => {
  const payload = {
    id: 1,
    jsonrpc: '2.0',
    method: 'get_cells',
    params: [
      {
        script: script,
        script_type: scriptType
      },
      'desc',
      '0x3e8'
    ]
  }
  const body = JSON.stringify(payload, null, '  ')
  const response = await fetch(getNetworkConst("RICH_NODE_INDEXER_URL") as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
  const data = await response.json()
  return data.result.objects
}

export const getTransaction = async (tx: string): Promise<Record<string, Record<string, unknown>> | undefined> => {
  if (tx === "") {
    return undefined
  }
  const payload = {
    id: 42,
    jsonrpc: '2.0',
    method: 'get_transaction',
    params: [
      tx
    ]
  }
  const body = JSON.stringify(payload, null, '  ')
  const indexerUrl = getNetworkConst("RICH_NODE_RPC_URL") as string
  const response = await fetch(indexerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
  const data = await response.json()
  return data.result
}

export const signAndSendTransaction = async (rawTransaction: CKBComponents.RawTransactionToSign, token: string, lockHash: string, inputSignConfig = { index: 0, length: -1 }): Promise<Record<string, unknown>> => {
  rawTransaction.witnesses[0] = {
    lock: '',
    inputType: '',
    outputType: ''
  }
  const res = await fetch(KEYPERING_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'sign_and_send_transaction',
      params: {
        tx: rawTransaction,
        description: "Transaction",
        lockHash: lockHash,
        inputSignConfig: inputSignConfig
      }
    })
  })
  const response = await res.json()
  if (response.message) {
    message.error(response.message, 10)
  }
  return response.result
}
