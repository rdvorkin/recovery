/**
 * Map of native asset IDs to explorer base URLs
 */
export const explorers = {
  ADA: "cardanoscan.io",
  ADA_TEST: "preprod.cardanoscan.io",
  ALGO: "algoexplorer.io",
  ALGO_TEST: "testnet.algoexplorer.io",
  ATOM_COS: "bigdipper.live/cosmos",
  ATOM_COS_TEST: "explorer.theta-testnet.polypore.xyz",
  AURORA_DEV: "explorer.testnet.aurora.dev",
  AVAX: "cchain.explorer.avax.network",
  AVAXTEST: "subnets-test.avax.network",
  BCH: "blockexplorer.one/bitcoin-cash/mainnet",
  BCH_TEST: "blockexplorer.one/bitcoin-cash/testnet",
  BNB_BSC: "bscscan.com",
  BNB_TEST: "testnet.bscscan.com",
  BSV: "whatsonchain.com",
  BSV_TEST: "test.whatsonchain.com",
  BTC: "blockstream.info",
  BTC_TEST: "blockstream.info/testnet",
  CELO: "explorer.celo.org",
  CELO_ALF: "explorer.celo.org/alfajores",
  CELO_BAK: "explorer.celo.org/baklava",
  CHZ_$CHZ: "explorer.chiliz.com",
  DASH: "blockexplorer.one/dash/mainnet",
  DASH_TEST: "blockexplorer.one/dash/testnet",
  DOGE: "dexplorer.dogechain.dog",
  DOGE_TEST: "explorer-testnet.dogechain.dog",
  DOT: "explorer.polkascan.io/polkadot",
  EOS: "bloks.io",
  EOS_TEST: "jungle3.bloks.io",
  ETC: "blockscout.com/etc/mainnet",
  ETC_TEST: "blockscout.com/etc/kotti",
  ETH: "etherscan.io",
  ETH_TEST3: "goerli.etherscan.io",
  ETH_TEST5: "sepolia.etherscan.io",
  "ETH-AETH": "arbiscan.io",
  "ETH-AETH_RIN": "testnet.arbiscan.io",
  "ETH-OPT": "optimistic.etherscan.io",
  // "ETH-OPT_KOV": "",
  ETHW: "www.oklink.com/ethw",
  EVMOS: "bigdipper.live/evmos",
  // 'FB_ATHENA_TEST': '',
  FTM_FANTOM: "ftmscan.com",
  GLMR_GLMR: "moonscan.io",
  HBAR: "explorer.arkhia.io/#/mainnet",
  HBAR_TEST: "explorer.arkhia.io/#/testnet",
  // HT_CHAIN: ""
  // HT_CHAIN_TEST: "",
  KSM: "explorer.polkascan.io/kusama",
  LTC: "blockexplorer.one/litecoin/mainnet",
  LTC_TEST: "blockexplorer.one/litecoin/testnet",
  LUNA: "finder.terra.money/classic",
  LUNA2: "finder.terra.money",
  LUNA2_TEST: "finder.terra.money/testnet",
  MATIC_POLYGON: "polygonscan.com",
  MATIC_POLYGON_MUMBAI: "mumbai.polygonscan.com",
  MOVR_MOVR: "moonriver.moonscan.io",
  NEAR: "explorer.near.org",
  NEAR_TEST: "explorer.testnet.near.org",
  RBTC: "explorer.rsk.co",
  RBTC_TEST: "explorer.testnet.rsk.co",
  RON: "explorer.roninchain.com",
  SGB: "songbird-explorer.flare.network",
  SGB_LEGACY: "songbird-explorer.flare.network",
  SMARTBCH: "sonar.cash",
  SOL: "explorer.solana.com",
  SOL_TEST: "explorer.solana.com", // TODO: Handle query string params for testnet (e.g. "?cluster=devnet")
  // TERRA_KRW: "",
  // TERRA_KRW_TEST: "",
  // TERRA_MNT: "",
  // TERRA_MNT_TEST: "",
  // TERRA_SDR: "",
  // TERRA_SDR_TEST: "",
  // TERRA_USD: "",
  TKX: "scan.tokenx.finance",
  TRX: "tronscan.org",
  TRX_TEST: "shasta.tronscan.org",
  VLX_TEST: "native.velas.com",
  VLX_VLX: "native.velas.com",
  WND: "westend.subscan.io",
  XDB: "xdbexplorer.com",
  XDB_TEST: "xdbexplorer.com",
  XDC: "observer.xdc.org",
  XEC: "explorer.bitcoinabc.org",
  XEC_TEST: "texplorer.bitcoinabc.org",
  XEM: "explorer.nemtool.com",
  XEM_TEST: "testnet-explorer.nemtool.com",
  XLM: "stellarchain.io",
  XLM_TEST: "testnet.stellarchain.io",
  XRP: "livenet.xrpl.org",
  XRP_TEST: "testnet.xrpl.org",
  XTZ: "tzkt.io",
  XTZ_TEST: "ghostnet.tzkt.io",
  ZEC: "explorer.zcha.in",
  ZEC_TEST: "explorer.testnet.z.cash",
} as const;
