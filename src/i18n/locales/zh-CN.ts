export default {
  buttons: {
    connect: '连接钱包',
    connectedTestnet: '已连接(测试网)',
    connectedMainnet: '已连接(主网)',
    submit: '提交',
    updateTokenInfo: "更新代币信息",
    submitExplorer: "提交代币信息"
  },
  labels: {
    address: "地址",
    capacity: "CKB 数量",
    free: "可使用 CKB 数量",
    availableSudt: "可用的 Token 数量",
    burnCount: "销毁 Token 数量",
    tokenName: '代币名字',
    tokenSymbol: '代币符号',
    tokenDecimal: '代币小数位',
    tokenIssuer: '发行者地址',
    tokenCount: '代币发行总量',
    receiverAddress: '接收者地址',
    transferCount: '转账代币数量',
    provideCKB: '我为接收者提供需要的CKB'
  },
  title: {
    walletInfo: "钱包信息",
    tokenInfo: "代币信息",
    root: "一键发币"
  },
  placeholder: {
    maxLength: "最大支持 {length} 位"
  },
  errors: {
    noAuth: "Keypering 认证失败",
    noAddress: "找不到你的地址。请检查后重新认证",
    no256k1Address: "不存在 Secp256k1 地址",
    noCells: "没有可用的 Cell!",
    keypering: "请确保 Keypering 正在运行，或者可以在此下载: ",
    provideCkbNeeded: "如果你不提供 Cell 必要的 CKB, 你就不能进行代币转账",
    noAcpCell: "接收者没有可用的代币 ACP Cell, 请联系他创建一个."
  },
  success: {
    auth: "认证成功"
  },
  validations: {
    required: "{ field } 是必填项!",
    decimalLength: "小数位应该在 0 到 38 之间"
  },
  menu: {
    auth: "钱包认证",
    issue: "代币发行",
    transfer: "代币转账",
    burn: "代币销毁",
    info: "代币信息"
  }
}
