export default {
  buttons: {
    connect: 'Connect Wallet',
    connectedTestnet: 'Connected(Testnet)',
    connectedMainnet: 'Connected(Mainnet)',
    submit: 'Submit',
    cancel: "Cancel",
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
    tokenCount: 'Issue amount',
    receiverAddress: 'Receiver Address',
    transferCount: 'Transfer Token Count',
    provideCKB: 'I will provide some extra CKB capacity for the receiver'
  },
  title: {
    walletInfo: "Wallet Info",
    tokenInfo: "Token Info",
    root: "Thunder Issue SUDT",
    updateSudtInfo: "Update SUDT Info"
  },
  placeholder: {
    maxLength: "Max length is {length}"
  },
  errors: {
    noAuth: "No Auth Token",
    noAddress: "Can't find your address.Please re-check and auth again.",
    no256k1Address: "No Secp256k1 Address",
    noCells: "No avaiable cells",
    keypering: "Please make sure Keypering is running, and you could download it here: ",
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
