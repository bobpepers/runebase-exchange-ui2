import { defineMessages } from 'react-intl';
import { TransactionType } from 'constants';

import { getIntlProvider } from './i18nUtil';

const strings = defineMessages({
  transfer: {
    id: 'str.transfer',
    defaultMessage: 'Transfer',
  },
});

export function getTxTypeString(txType, locale, localeMessages) {
  const { formatMessage } = getIntlProvider(locale, localeMessages);

  switch (txType) {
    case TransactionType.TRANSFER: {
      return formatMessage(strings.transfer);
    }
    default: {
      console.error(`Invalid txType: ${txType}`); // eslint-disable-line
      return '';
    }
  }
}
