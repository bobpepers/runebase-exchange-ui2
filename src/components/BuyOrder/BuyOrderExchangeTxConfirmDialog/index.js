/* eslint-disable */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { BuyOrderConfirmDialog } from 'components';

const BuyOrderTxConfirmDialog = inject('store')(injectIntl(observer(({ store: { wallet },  intl, id, onOrder}) => {
  return (
    <BuyOrderConfirmDialog
      onClose={() => wallet.buyOrderConfirmDialogOpen = false}
      onConfirm={wallet.confirmOrderExchange.bind(this, onOrder)}
      txFees={wallet.txFees}
      open={wallet.buyOrderConfirmDialogOpen}
      txToken={wallet.selectedToken}
      txAmount={wallet.depositAmount}
      txPrice={wallet.price}
      txTotal={wallet.orderTotal}
      txDesc={intl.formatMessage({ id }, { address: wallet.toAddress })}
    />
  );
})));
export default BuyOrderTxConfirmDialog;