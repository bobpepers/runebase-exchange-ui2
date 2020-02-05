/* eslint-disable react/destructuring-assignment, react/no-access-state-in-setstate, react/jsx-one-expression-per-line, operator-linebreak */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Divider } from 'semantic-ui-react';
import _ from 'lodash';
import {
  Grid,
} from '@material-ui/core';

export default @inject('store') @observer class DropDownAddresses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  handleSelectChange = (key, event) => {
    this.props.store.wallet.changeAddress(key, event);
    this.setState({ show: false });
  }

  handleToggle = (e) => {
    e.target.focus();
    this.setState({ show: !this.state.show });
  }

  handleBlur = (e) => {
    if (e.nativeEvent.explicitOriginalTarget &&
        e.nativeEvent.explicitOriginalTarget === e.nativeEvent.originalTarget) {
      return;
    }

    if (this.state.show) {
      setTimeout(() => {
        this.setState({ show: false });
      }, 200);
    }
  }

  render() {
    const { store: { wallet, baseCurrencyStore } } = this.props;
    const addressSelectBoolean = wallet.currentAddressSelected === '';
    return (
      <div className='dropdown-container'>
        <div className={`arrow ${addressSelectBoolean ? 'pulsate' : 'notPulsate'}`} htmlFor='selectAddress'>
          <div
            id='selectAddress'
            type='button'
            value={wallet.currentAddressSelected !== '' ? wallet.currentAddressSelected : 'Please Select An Address'}
            className='dropdown-btn'
            onClick={this.handleToggle}
            onBlur={this.handleBlur}
          >
            {wallet.currentAddressSelected !== '' ? wallet.currentAddressSelected : 'Please Select An Address'}
          </div>

        </div>
        <ul className="dropdown-list" hidden={!this.state.show}>
          {wallet.addresses.map((addressData, key) => {
            const walletRows = [];
            const exchangeRows = [];

            Object.keys(addressData.Wallet).forEach((walletData) => {
              if (walletData === baseCurrencyStore.baseCurrency.pair) {
                walletRows.push(<Grid item xs={3} key={walletData}>
                  <div className='fullWidth'>{walletData}(GAS)</div>
                  <div className='fullWidth fat'>{addressData.Wallet[walletData]}</div>
                </Grid>);
              } else {
                walletRows.push(<Grid item xs={3} key={walletData}>
                  <div className='fullWidth'>{walletData}</div>
                  <div className='fullWidth fat'>{addressData.Wallet[walletData]}</div>
                </Grid>);
              }
            });

            Object.keys(addressData.Exchange).forEach((exchangeData) => {
              exchangeRows.push(<Grid item xs={3} key={exchangeData}>
                <div className='fullWidth'>{exchangeData}</div>
                <div className='fullWidth fat'>{addressData.Exchange[exchangeData]}</div>
              </Grid>);
            });

            if (_.findKey(addressData.Wallet, (v) => v !== '0') !== undefined || _.findKey(addressData.Exchange, (x) => x !== '0') !== undefined) {
              return (
                <li
                  className="option"
                  onClick={this.handleSelectChange.bind(this, key) /* eslint-disable-line */ }
                  key={key}
                  address={addressData.address}
                  role='presentation'
                >
                  <Grid container className='centerText'>
                    <Grid item xs={12}>
                      {addressData.address}
                    </Grid>
                  </Grid>
                  <Divider horizontal>Wallet</Divider>
                  <Grid container className='centerText'>
                    {walletRows}
                  </Grid>
                  <Divider horizontal>Exchange</Divider>
                  <Grid container className='centerText'>
                    {exchangeRows}
                  </Grid>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </div>
    );
  }
}
