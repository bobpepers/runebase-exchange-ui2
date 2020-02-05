module.exports = {
  Routes: {
    EXCHANGE: '/',
    SETTINGS: '/settings',
    WALLET: '/wallet',
    ACTIVITY_HISTORY: '/activities/history',
  },

  EventWarningType: {
    INFO: 'INFO',
    ERROR: 'ERROR',
    HIGHLIGHT: 'HIGHLIGHT',
  },

  /* GraphQL Constants */

  TransactionType: {
    TRANSFER: 'TRANSFER',
    DEPOSITEXCHANGE: 'DEPOSITEXCHANGE',
    WITHDRAWEXCHANGE: 'WITHDRAWEXCHANGE',
    BUYORDER: 'BUYORDER',
    SELLORDER: 'SELLORDER',
    CANCELORDER: 'CANCELORDER',
    EXECUTEORDER: 'EXECUTEORDER',
  },

  TransactionStatus: {
    PENDING: 'PENDING',
    SUCCESS: 'CONFIRMED',
    FAIL: 'FAIL', // not used
  },

  SortBy: {
    DEFAULT: 'DESC',
    ASCENDING: 'ASC',
    DESCENDING: 'DESC',
  },
};
