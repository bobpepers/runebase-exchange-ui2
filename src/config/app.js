module.exports = {
  intervals: { // in MS
    syncInfo: 5000,
    marketInfo: 30000,
    tooltipDelay: 300,
    snackbarLong: 5000,
    snackbarShort: 2000,
  },
  defaults: {
    averageBlockTime: 142.01324503311258,
    unlockWalletMins: 1440,
  },
  server: 'http://127.0.0.1:8989',
  explorer: {
    main: 'https://explorer.runebase.io',
    test: 'https://testnet.runebase.io',
  },
  maxTransactionFee: 0.1,
  faqUrls: {
    'en-US': 'https://www.runebase.io/exchange/faq',
  },
  debug: {
    // Set to false if in test environment and Insight API is down
    // and loading screen is blocking the view.
    showAppLoad: true,
  },
};
