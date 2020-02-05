/* eslint-disable import/no-useless-path-segments */
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { IntlProvider } from 'react-intl';
import { MuiThemeProvider } from '@material-ui/core';
import { Route, Router } from 'react-router-dom';
import { Provider as MobxProvider, observer } from 'mobx-react';
import { ThemeProvider } from 'styled-components';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { createBrowserHistory } from 'history';
import { syncHistoryWithStore } from 'mobx-react-router';

import App from './scenes/App';
import runebaseexchangeTheme, { theme as styledTheme } from './config/theme';
import store from './stores/AppStore';
import graphqlClient from './network/graphql';
import '../src/style/styles.less';

const browserHistory = createBrowserHistory();
const history = syncHistoryWithStore(browserHistory, store.router);

export const AppProvider = observer(() => (
  <ThemeProvider theme={styledTheme}>
    <MobxProvider store={store}>
      <MuiThemeProvider theme={runebaseexchangeTheme}>
        <IntlProvider locale={store.ui.locale} messages={store.ui.localeMessages}>
          <ApolloProvider client={graphqlClient}>
            <Router history={history}>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <Route
                  path="/"
                  render={(props) => <App match={props.match} />}
                />
              </MuiPickersUtilsProvider>
            </Router>
          </ApolloProvider>
        </IntlProvider>
      </MuiThemeProvider>
    </MobxProvider>
  </ThemeProvider>
));
