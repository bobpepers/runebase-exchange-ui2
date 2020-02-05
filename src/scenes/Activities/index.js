/* eslint-disable react/static-property-placement, react/destructuring-assignment */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Tabs, Tab, withStyles } from '@material-ui/core';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Routes, EventStatus } from 'constants';

import ActivityHistory from './ActivityHistory';
import styles from './styles';
const { ACTIVITY_HISTORY } = Routes;

const TAB_HISTORY = 0;

const messages = defineMessages({
  set: {
    id: 'activitiesTab.Set',
    defaultMessage: 'Result Setting',
  },
  finalize: {
    id: 'str.finalize',
    defaultMessage: 'Finalize',
  },
  withdraw: {
    id: 'str.withdraw',
    defaultMessage: 'Withdraw',
  },
  history: {
    id: 'activitiesTab.History',
    defaultMessage: 'Activities History',
  },
});

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class Activities extends Component {
  static propTypes = {
    intl: intlShape.isRequired, // eslint-disable-line react/no-typos
    match: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
  }

  tabIdx = { // Determine tab index based on path
    [ACTIVITY_HISTORY]: TAB_HISTORY,
  }[this.props.match.path]

  getTabLabel = (eventStatusIndex) => {
    const { store: { global }, intl } = this.props;

    let label;
    let count;
    switch (eventStatusIndex) {
      case EventStatus.SET: {
        label = intl.formatMessage(messages.set);
        count = global.userData.resultSettingCount;
        break;
      }
      default: {
        break;
      }
    }

    let countText = '';
    if (count > 0) {
      countText = ` (${count})`;
    }
    return `${label}${countText}`;
  }

  handleTabChange = (event, value) => {
    switch (value) {
      case TAB_HISTORY: {
        this.props.history.push(Routes.ACTIVITY_HISTORY);
        break;
      }
      default: {
        throw new Error(`Invalid tab index: ${value}`);
      }
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Tabs indicatorColor="primary" value={this.tabIdx} onChange={this.handleTabChange} className={classes.activitiesTabWrapper}>
          <Tab label={this.props.intl.formatMessage(messages.history)} className={classes.activitiesTabButton} />
        </Tabs>
        <div className={classes.activitiesTabContainer}>
          {this.tabIdx === TAB_HISTORY && <ActivityHistory />}
        </div>
      </div>
    );
  }
}
