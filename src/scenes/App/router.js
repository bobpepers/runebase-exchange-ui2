import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { Routes } from 'constants';

import asyncComponent from '../../helpers/AsyncFunc';


const AppRouter = ({ url }) => {
  // Remove trailing '/' from url so that we can use `${url}/topic` below
  if (url[url.length - 1] === '/') {
    url = url.slice(0, url.length - 1); // eslint-disable-line
  }

  return (
    <Switch>
      <Route
        exact
        path={`${url}${Routes.EXCHANGE}`}
        component={asyncComponent(() => import('../Exchange'))}
      />
      <Route
        exact
        path={`${url}${Routes.WALLET}`}
        component={asyncComponent(() => import('../Wallet'))}
      />
      <Route
        exact
        path={`${url}${Routes.ACTIVITY_HISTORY}`}
        component={asyncComponent(() => import('../Activities'))}
      />
    </Switch>
  );
};

AppRouter.propTypes = {
  url: PropTypes.string.isRequired,
};

export default AppRouter;
