/* eslint-disable */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { RedeemConfirmDialog } from 'components';

const RedeemTxConfirmDialog = inject('store')(injectIntl(observer(({ store: { wallet },  intl, id, onRedeem}) => {
  return (    
    <RedeemConfirmDialog
      onClose={() => wallet.redeemConfirmDialogOpen = false}
      onConfirm={wallet.confirmRedeemExchange.bind(this, onRedeem)}
      txFees={wallet.txFees}
      open={wallet.redeemConfirmDialogOpen}
      txToken={wallet.selectedToken}
      txAmount={wallet.depositAmount}
      txDesc={intl.formatMessage({ id }, { address: wallet.toAddress })}
    />
  );
})));
export default RedeemTxConfirmDialog;