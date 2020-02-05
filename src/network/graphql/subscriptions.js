import gql from 'graphql-tag';
import { getTypeDef } from './schema';

export function getonMarketInfoSubscription() {
  return gql`
    subscription OnMarketInfo {
      onMarketInfo {
        ${getTypeDef('MarketInfo')}
      }
    }
  `;
}

export function getonSyncInfoSubscription() {
  return gql`
    subscription OnSyncInfo {
      onSyncInfo {
        ${getTypeDef('SyncInfo')}
      }
    }
  `;
}

export function getonActiveOrderInfoSubscription() {
  return gql`
    subscription OnActiveOrderInfo {
      onActiveOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `;
}


export function getOnChartInfoSubscription(timeTable, tokenAddress) {
  return gql`
    subscription OnChartInfo {
      onChartInfo (timeTable: "${timeTable}", tokenAddress: "${tokenAddress}"){
        ${getTypeDef('Chart')}
      }
    }
  `;
}


export function getonFulfilledOrderInfoSubscription(Status) {
  return gql`
    subscription OnFulfilledOrderInfo {
      onFulfilledOrderInfo (status: "${Status}"){
        ${getTypeDef('NewOrder')}
      }
    }
  `;
}

export function getonCanceledOrderInfoSubscription(Status) {
  return gql`
    subscription OnCanceledOrderInfo {
      onCanceledOrderInfo (status: "${Status}"){
        ${getTypeDef('NewOrder')}
      }
    }
  `;
}

export function getonSelectedOrderInfoSubscription() {
  return gql`
    subscription OnSelectedOrderInfo {
      onSelectedOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `;
}

export function getonSellOrderInfoSubscription(token, orderType, status) {
  return gql`
    subscription OnSellOrderInfo {
      onSellOrderInfo (orderType: "${orderType}", token: "${token}", status: "${status}"){
        ${getTypeDef('NewOrder')}
      }
    }
  `;
}

export function getonBuyOrderInfoSubscription(orderType, token, status) {
  return gql`
    subscription OnBuyOrderInfo {
      onBuyOrderInfo (orderType: "${orderType}", token: "${token}", status: "${status}"){
        ${getTypeDef('NewOrder')}
      }
    }
  `;
}

export function getOnBuyHistoryInfoSubscription(token, orderType) {
  return gql`
    subscription OnBuyHistoryInfo {
      onBuyHistoryInfo (token: "${token}", orderType: "${orderType}"){
        ${getTypeDef('Trade')}
      }
    }
  `;
}

export function getOnSellHistoryInfoSubscription(token, orderType) {
  return gql`
    subscription OnSellHistoryInfo {
      onSellHistoryInfo (token: "${token}", orderType: "${orderType}"){
        ${getTypeDef('Trade')}
      }
    }
  `;
}

export function getOnMyTradeInfoSubscription(Address) {
  return gql`
    subscription OnMyTradeInfo {
      onMyTradeInfo (from: "${Address}", to: "${Address}"){
        ${getTypeDef('Trade')}
      }
    }
  `;
}

export function getOnFundRedeemInfoSubscription(Address) {
  return gql`
    subscription OnFundRedeemInfo {
      onFundRedeemInfo (owner: "${Address}"){
        ${getTypeDef('FundRedeem')}
      }
    }
  `;
}
