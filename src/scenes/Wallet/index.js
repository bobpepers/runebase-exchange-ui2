/* eslint-disable react/destructuring-assignment, camelcase */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Routes } from 'constants';
import ActionButtonHeader from './ActionButtonHeader';
import Balances from './Balances';
import History from './History';

export default @inject('store') @observer class MyWallet extends Component {
  UNSAFE_componentWillMount() {
    this.props.store.ui.location = Routes.WALLET;
  }

  render() {
    return (
      <div>
        <ActionButtonHeader />
        <Balances />
        <History />
      </div>
    );
  }
}
