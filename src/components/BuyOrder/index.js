import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import {
  Typography,
  Grid,
  FormLabel,
  InputLabel,
  Card,
  withStyles,
} from '@material-ui/core';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import styles from './styles';
import OrderExchange from './OrderExchange';

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class BuyOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      price: 0,
      total: 0,
      orderType: 'buy',
      hasError: false,
    };
  }

  changeAmount = (event, tokenAmount) => {
    const {
      store: {
        wallet: {
          currentAddressSelected,
        },
      },
    } = this.props;
    const {
      price,
    } = this.state;
    const validateTotal = event.target.value * price;

    if (event.target.value === '' || /^\d+(\.\d{1,8})?$/.test(event.target.value)) {
      this.setState({
        amount: event.target.value,
        total: (event.target.value * price).toFixed(8),
        hasError: false,
      });
    }

    if (tokenAmount < validateTotal) {
      const newAmount = tokenAmount / price;
      this.setState({
        amount: newAmount,
        total: (newAmount * price).toFixed(8),
        hasError: false,
      });
    }

    if (currentAddressSelected === '') {
      this.setState({
        hasError: true,
      });
    }
  }

  changePrice = (event, tokenAmount) => {
    const {
      store: {
        wallet: {
          currentAddressSelected,
        },
      },
    } = this.props;
    const {
      amount,
    } = this.state;
    const validateTotal = event.target.value * amount;
    if (event.target.value === '' || /^\d+(\.\d{1,8})?$/.test(event.target.value)) {
      this.setState({
        price: event.target.value,
        total: (event.target.value * amount).toFixed(8),
        hasError: false,
      });
    }
    if (tokenAmount < validateTotal) {
      const newPrice = tokenAmount / amount;
      this.setState({
        price: newPrice,
        total: (newPrice * amount).toFixed(8),
        hasError: false,
      });
    }
    if (currentAddressSelected === '') {
      this.setState({
        hasError: true,
      });
    }
  }

  total = () => this.amount * this.price;


  render() {
    const {
      classes,
      store: {
        wallet,
        baseCurrencyStore,
        marketStore,
      },
    } = this.props;
    const {
      amount,
      price,
      total,
      orderType,
      hasError,
    } = this.state;
    const market = wallet.currentMarket;
    const isEnabled = wallet.currentAddressSelected !== '';
    let tokenAmount;

    if (isEnabled) {
      Object.keys(marketStore.marketInfo).forEach((key) => {
        if (market === marketStore.marketInfo[key].market) {
          tokenAmount = wallet.addresses[wallet.currentAddressKey].Exchange[baseCurrencyStore.baseCurrency.pair];
        }
      });
    }

    return (
      <div>
        <Card className={classes.dashboardOrderBookTitle}>
          <p>
            Create
            &nbsp;
            Buy
            &nbsp;
            Order
            &nbsp;
            (
            {wallet.currentMarket}
            )
          </p>
        </Card>
        <Card className={classes.dashboardOrderBook}>
          <Grid container className={classes.dashboardOrderBookWrapper}>
            <Grid item xs={12}>
              <Form className={classes.tokenSelect} onSubmit={this.handleSubmit}>
                <h3>
                  {wallet.currentMarket}
                  /
                  {baseCurrencyStore.baseCurrency.pair}
                </h3>
                {(() => {
                  if (wallet.currentAddressKey !== '') {
                    return (
                      <Typography variant="body2" className='fat'>
                        {tokenAmount}
                        &nbsp;
                        {baseCurrencyStore.baseCurrency.pair}
                      </Typography>
                    );
                  }
                  return (
                    <p>...</p>
                  );
                })()}
                <Grid container>
                  <Grid item xs={2}>
                    <InputLabel className='inputLabels'>
                      Amount:
                    </InputLabel>
                  </Grid>
                  <Grid item xs={8}>
                    <Input
                      className='inputWidth'
                      disabled={!isEnabled}
                      type="number"
                      step="0.00000001"
                      min="0"
                      value={amount}
                      onChange={(event) => { this.changeAmount(event, tokenAmount); }}
                      name="amount"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <InputLabel className='inputLabels'>
                      {wallet.market}
                    </InputLabel>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={2}>
                    <FormLabel className='inputLabels'>
                      Price:
                    </FormLabel>
                  </Grid>
                  <Grid item xs={8}>
                    <Input
                      className='inputWidth'
                      disabled={!isEnabled}
                      type="number"
                      step="0.00000001"
                      min="0"
                      value={price}
                      onChange={(event) => { this.changePrice(event, tokenAmount); }}
                      name="price"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <InputLabel className='inputLabels'>
                      {baseCurrencyStore.baseCurrency.pair}
                    </InputLabel>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={2}>
                    <FormLabel className='inputLabels'>
                      Total:
                    </FormLabel>
                  </Grid>
                  <Grid item xs={8}>
                    <Input disabled className='inputWidth' value={total} name="total" />
                  </Grid>
                  <Grid item xs={2}>
                    <FormLabel className={`inputLabels ${classes.orderLabel}`}>
                      {baseCurrencyStore.baseCurrency.pair}
                    </FormLabel>
                  </Grid>
                </Grid>
                <OrderExchange
                  tokenAmount={tokenAmount}
                  amount={amount}
                  price={price}
                  totel={total}
                  orderType={orderType}
                  hasError={hasError}
                />
              </Form>
            </Grid>
          </Grid>
        </Card>
      </div>
    );
  }
}
