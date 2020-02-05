/* eslint-disable import/no-useless-path-segments */
import gql from 'graphql-tag';
import _ from 'lodash';

import client from './';
import { TYPE, getMutation, isValidEnum } from './schema';

if (process.env.REACT_APP_ENV === 'dev') {
  window.mutations = '';
}

class GraphMutation {
  constructor(mutationName, args) {
    this.mutationName = mutationName;
    this.schema = getMutation(mutationName);
    this.args = args;
  }

  constructMapping() {
    let mappingStr = '';
    _.each(this.schema.mapping, (key) => {
      const value = this.args[key];
      if (isValidEnum(key, value) || _.isFinite(value)) {
        // Enums require values without quotes
        mappingStr = mappingStr.concat(`${key}: ${value}\n`);
      } else {
        mappingStr = mappingStr.concat(`${key}: ${JSON.stringify(value)}\n`);
      }
    });

    return mappingStr;
  }

  build() {
    const mutation = `
      mutation {
        ${this.mutationName}(
          ${this.constructMapping()}
        ) {
          ${this.schema.return}
        }
      }
    `;

    return mutation;
  }

  async execute() {
    const mutation = this.build();
    if (process.env.REACT_APP_ENV === 'dev') {
      window.mutations += `\n${mutation}`;
    }

    const res = await client.mutate({
      mutation: gql`${mutation}`,
      fetchPolicy: 'no-cache',
    });
    return res;
  }
}

export function createTransferTx(senderAddress, receiverAddress, token, amount) {
  const args = {
    senderAddress,
    receiverAddress,
    token,
    amount,
  };

  return new GraphMutation('transfer', args, TYPE.transaction).execute();
}

export function createTransferExchange(senderAddress, receiverAddress, token, amount) {
  const args = {
    senderAddress,
    receiverAddress,
    token,
    amount,
  };

  return new GraphMutation('transferExchange', args, TYPE.transaction).execute();
}

export function createRedeemExchange(senderAddress, receiverAddress, token, amount) {
  const args = {
    senderAddress,
    receiverAddress,
    token,
    amount,
  };

  return new GraphMutation('redeemExchange', args, TYPE.transaction).execute();
}

export function createOrderExchange(senderAddress, receiverAddress, token, amount, price, orderType) {
  const args = {
    senderAddress,
    receiverAddress,
    token,
    amount,
    price,
    orderType,
  };

  return new GraphMutation('orderExchange', args, TYPE.transaction).execute();
}

export function createCancelOrderExchange(senderAddress, orderId) {
  const args = {
    senderAddress,
    orderId,
  };
  return new GraphMutation('cancelOrderExchange', args, TYPE.transaction).execute();
}

export function createExecuteOrderExchange(senderAddress, orderId, exchangeAmount) {
  const args = {
    senderAddress,
    orderId,
    exchangeAmount,
  };
  return new GraphMutation('executeOrderExchange', args, TYPE.transaction).execute();
}
