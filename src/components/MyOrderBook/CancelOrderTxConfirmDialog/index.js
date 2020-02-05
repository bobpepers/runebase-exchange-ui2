/* eslint-disable */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { CancelOrderConfirmDialog } from 'components';

const CancelOrderTxConfirmDialog = inject('store')(injectIntl(observer(({ store: { wallet },  intl, id, onCancelOrder}) => {
  return (    
    <CancelOrderConfirmDialog
      onClose={() => wallet.cancelOrderConfirmDialogOpen = false}
      onConfirm={wallet.confirmCancelOrderExchange.bind(this, onCancelOrder)}
      txFees={wallet.txFees}
      txToken={wallet.selectedToken}
      txAmount={wallet.depositAmount}
      open={wallet.cancelOrderConfirmDialogOpen}
      txDesc={intl.formatMessage({ id }, { address: wallet.toAddress })}
    />
  );
})));
export default CancelOrderTxConfirmDialog;