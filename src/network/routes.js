const AUTHORITY = '127.0.0.1:8989';
const HTTP_ROUTE = `http://${AUTHORITY}`;
const WS_ROUTE = `ws://${AUTHORITY}`;

const RUNES_EXPLORER = {
  dev: 'https://testnet.runebase.io',
  prod: 'https://explorer.runebase.io',
}[process.env.REACT_APP_ENV];
const BASE_INSIGHT = `${RUNES_EXPLORER}/runebase-insight-api`;

export default {
  graphql: {
    http: `${HTTP_ROUTE}/graphql`,
    subs: `${WS_ROUTE}/subscriptions`,
  },
  api: {
    getWalletInfo: `${HTTP_ROUTE}/get-wallet-info`,
    unlockWallet: `${HTTP_ROUTE}/wallet-passphrase`,
    validateAddress: `${HTTP_ROUTE}/validate-address`,
    encryptWallet: `${HTTP_ROUTE}/encrypt-wallet`,
    backupWallet: `${HTTP_ROUTE}/backup-wallet`,
    importWallet: `${HTTP_ROUTE}/import-wallet`,
    transactionCost: `${HTTP_ROUTE}/transaction-cost`,
    walletPassphraseChange: `${HTTP_ROUTE}/wallet-passphrase-change`,
  },
  insight: {
    totals: `${BASE_INSIGHT}/statistics/total`,
  },
  explorer: {
    tx: 'https://explorer.runebase.io/tx',
  },
};
