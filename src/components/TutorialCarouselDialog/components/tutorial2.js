import React from 'react';
import PropTypes from 'prop-types';
import { Typography, withStyles } from '@material-ui/core';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';

import styles from '../styles';
import { ContentItem } from './contentItem';

const messages = defineMessages({
  tutorial2Content0Msg: {
    id: 'tutorial2.content0',
    defaultMessage: 'Assuming you have not used the Runebase Wallet client before, now that you have a brand new Runebase wallet, it is advised to take the proper steps to encrypt and back it up first.',
  },
  tutorial2Content1Msg: {
    id: 'tutorial2.content1',
    defaultMessage: 'To encrypt your wallet, select “Launch Runebase Wallet” in the application menu and follow the instructions here.',
  },
  tutorial2Content2Msg: {
    id: 'tutorial2.content2',
    defaultMessage: 'Bitcoin wallets already contain roughly 100 different addresses assigned to one wallet. This is why you might see new addresses appearing in your wallet.',
  },
  tutorial2Content3Msg: {
    id: 'tutorial2.content3',
    defaultMessage: 'The Runebase Wallet is responsible for holding your passphrase and private keys. RunebaseExchange Dapp does not store or handle this for you.',
  },
});

const Tutorial2 = ({ classes }) => (
  <div>
    <Typography variant="h4">
      <FormattedMessage id="tutorial2.title" defaultMessage="Securing Your New Wallet" />
    </Typography>
    <ul className={classes.contentList}>
      <ContentItem id={messages.tutorial2Content0Msg.id} defaultMessage={messages.tutorial2Content0Msg.defaultMessage} />
      <li>
        <Typography variant="body2">
          <a className={classes.link} href="https://github.com/runebase/runebase/wiki/Runebase-Wallet-Tutorial#wallet-encryption" target="_blank">
            https://github.com/runebase/runebase/wiki/Runebase-Wallet-Tutorial#wallet-encryption
          </a>
        </Typography>
      </li>
      <li>
        <Typography variant="body2">
          <a className={classes.link} href="https://github.com/runebase/runebase/wiki/Runebase-Wallet-Tutorial#wallet-backup" target="_blank">
            https://github.com/runebase/runebase/wiki/Runebase-Wallet-Tutorial#wallet-backup
          </a>
        </Typography>
      </li>
      <li>
        <Typography variant="body2">
          <a className={classes.link} href="https://github.com/runebase/runebase/wiki/Runebase-Wallet-Tutorial#restore-wallet-backup" target="_blank">
            https://github.com/runebase/runebase/wiki/Runebase-Wallet-Tutorial#restore-wallet-backup
          </a>
        </Typography>
      </li>
      <ContentItem id={messages.tutorial2Content1Msg.id} defaultMessage={messages.tutorial2Content1Msg.defaultMessage} />
      <ContentItem id={messages.tutorial2Content2Msg.id} defaultMessage={messages.tutorial2Content2Msg.defaultMessage} />
      <ContentItem id={messages.tutorial2Content3Msg.id} defaultMessage={messages.tutorial2Content3Msg.defaultMessage} />
    </ul>
  </div>
);

Tutorial2.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default injectIntl(withStyles(styles, { withTheme: true })(Tutorial2));
