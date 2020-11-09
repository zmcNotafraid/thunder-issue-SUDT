import CKBComponents from '@nervosnetwork/ckb-sdk-core'
import { KEYPERING_URL, RICH_NODE_INDEXER_URL } from './const'
import { RpcScript } from '../interface'

const requestAuth = async (description: string): Promise<any> => {
  try {
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
    return data.result.token
  } catch (error) {
    console.error('error', error)
  }
}

const queryAddresses = async (token: string): Promise<any> => {
  try {
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
  } catch (error) {
    console.error('error', error)
  }
}

const getCells = async (scriptType: 'lock' | 'type', script: RpcScript): Promise<any> => {
  const payload = {
    id: 1,
    jsonrpc: '2.0',
    method: 'get_cells',
    params: [
      {
        script: script,
        script_type: scriptType
      },
      'asc',
      '0x3e8'
    ]
  }
  const body = JSON.stringify(payload, null, '  ')
  try {
    const response = await fetch(RICH_NODE_INDEXER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })
    const data = await response.json()
    return data.result.objects
  } catch (error) {
    console.error('error', error)
  }
}

const signAndSendTransaction = async (rawTx: CKBComponents.RawTransactionToSign, token: string, lockHash: string) => {
  const rawTransaction: CKBComponents.RawTransactionToSign = rawTx
  rawTransaction.witnesses[0] = {
    lock: '',
    inputType: '',
    outputType: ''
  }
  try {
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
          lockHash: lockHash
        }
      })
    })
    const response = await res.json()
    console.info(response)
    return response.result
  } catch (error) {
    console.error('error', error)
  }
}
export default {
  requestAuth,
  queryAddresses,
  getCells,
  signAndSendTransaction
}
