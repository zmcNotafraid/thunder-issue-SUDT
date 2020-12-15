export default {
  buttons: {
    connect: 'Connect Wallet',
    connectedTestnet: 'Connect Wallet(Testnet)',
    connectedMainnet: 'Connect Wallet(Mainnet)',
    submit: 'Submit',
    updateTokenInfo: "Update Token Info",
    submitExplorer: "Submit to ckb Explorer"
  },
  labels: {
    address: "Address",
    capacity: "CKB",
    free: "Free CKB",
    availableSudt: 'Available Token',
    burnCount: 'Burn Count',
    tokenName: 'Token Name',
    tokenSymbol: 'Token Symbol',
    tokenDecimal: 'Token Decimal',
    tokenIssuer: 'Token Issuer',
    tokenCount: 'Token Initial Supply Count',
    receiverAddress: 'Receiver Address',
    transferCount: 'Transfer Token Count',
    provideCKB: 'I will provide some extra CKB capacity for the receiver'
  },
  title: {
    walletInfo: "Wallet Info",
    tokenInfo: "Token Info",
    root: "Thunder Issue SUDT"
  },
  placeholder: {
    maxLength: "Max length is {length}"
  },
  errors: {
    noAuth: "No Auth Token",
    noAddress: "Can't find your address.Please re-check and auth again.",
    no256k1Address: "No Secp256k1 Address",
    noCells: "No avaiable cells",
    keypering: "Please make sure Keypering is running, and you could download it here: https://github.com/nervosnetwork/keypering/releases",
    provideCkbNeeded: "You cannot send token to this kind of address if you don't provide the necessary CKB capacity.",
    noAcpCell: "Receiver has no available asset account, please ask him create one first."
  },
  success: {
    auth: "Auth Success"
  },
  validations: {
    required: "{ field } is required!",
    decimalLength: "The decimal should be 0 to 38"
  },
  menu: {
    auth: "Wallet Auth",
    issue: "Issue Token",
    transfer: "Transfer Token",
    burn: "Burn Token",
    info: "Token Info"
  }
}
