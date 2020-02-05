/* eslint-disable */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { ExecuteOrderConfirmDialog } from 'components';

const ExecuteOrderTxConfirmDialog = inject('store')(injectIntl(observer(({ store: { wallet },  intl, id, onExecuteOrder}) => {
  return (    
    <ExecuteOrderConfirmDialog
      onClose={() => wallet.executeOrderConfirmDialogOpen = false}
      onConfirm={wallet.confirmExecuteOrderExchange.bind(this, onExecuteOrder)}
      txFees={wallet.txFees}
      txToken={wallet.selectedToken}
      txAmount={wallet.depositAmount}
      open={wallet.executeOrderConfirmDialogOpen}
      txDesc={intl.formatMessage({ id }, { address: wallet.toAddress })}
    />
  );
})));
export default ExecuteOrderTxConfirmDialog;