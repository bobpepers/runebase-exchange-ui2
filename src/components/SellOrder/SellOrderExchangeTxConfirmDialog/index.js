/* eslint-disable */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { SellOrderConfirmDialog } from 'components';

const SellOrderTxConfirmDialog = inject('store')(injectIntl(observer(({ store: { wallet },  intl, id, onOrder}) => {
  return (
    <SellOrderConfirmDialog
      onClose={() => wallet.sellOrderConfirmDialogOpen = false}
      onConfirm={wallet.confirmOrderExchange.bind(this, onOrder)}
      txFees={wallet.txFees}
      open={wallet.sellOrderConfirmDialogOpen}
      txToken={wallet.selectedToken}
      txAmount={wallet.depositAmount}
      txPrice={wallet.price}
      txTotal={wallet.orderTotal}
      txDesc={intl.formatMessage({ id }, { address: wallet.toAddress })}
    />
  );
})));
export default SellOrderTxConfirmDialog;