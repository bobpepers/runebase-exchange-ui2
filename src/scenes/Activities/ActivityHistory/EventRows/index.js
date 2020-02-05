/* eslint-disable react/static-property-placement, react/state-in-constructor, react/destructuring-assignment, react/no-access-state-in-setstate, react/jsx-fragments, react/jsx-one-expression-per-line, react/jsx-props-no-spreading */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { TableBody, TableCell, TableRow, withStyles } from '@material-ui/core';
import { TransactionHistoryID, TransactionHistoryAddress } from 'components';

import styles from './styles';
import { getShortLocalDateTimeString } from '../../../../helpers/utility';
import { i18nToUpperCase } from '../../../../helpers/i18nUtil';
import { getTxTypeString } from '../../../../helpers/stringUtil';

@injectIntl
@withStyles(styles, { withTheme: true })
@withRouter
@inject('store')
@observer
class EventRow extends Component {
    static propTypes = {
      intl: intlShape.isRequired, // eslint-disable-line react/no-typos
      classes: PropTypes.object.isRequired,
      transaction: PropTypes.object.isRequired,
    };

    state = {
      expanded: false,
    }

    onArrowIconClick = () => {
      this.setState({ expanded: !this.state.expanded });
    }


    render() {
      const { transaction, intl, classes } = this.props;
      const { type, txid, amount, token, fee, status, createdTime } = transaction;
      const { locale, messages: localeMessages } = intl;
      const { expanded } = this.state;

      return (
        <Fragment>
          <TableRow selected={expanded}>
            <TableCell className={classes.summaryRowCell}>{getShortLocalDateTimeString(createdTime)}</TableCell>
            <TableCell>{getTxTypeString(type, locale, localeMessages)}</TableCell>
            <TableCell numeric>{`${amount || ''}  ${amount ? token : ''}`}</TableCell>
            <TableCell numeric>{fee}</TableCell>
            <TableCell>
              <FormattedMessage id={`str.${status}`.toLowerCase()}>
                {(txt) => i18nToUpperCase(txt)}
              </FormattedMessage>
            </TableCell>
            <TableCell>
              <i
                className={cx(expanded ? 'icon-ic_down' : 'icon-ic_up', 'icon iconfont', classes.arrowIcon)}
                onClick={this.onArrowIconClick}
              />
            </TableCell>
          </TableRow>
          <CollapsableItem expanded={expanded}>
            <TableRow key={`txaddr-${txid}`} selected className={expanded ? classes.show : classes.hide}>
              <TransactionHistoryAddress transaction={transaction} className={classes.detailRow} />
              <TableCell /><TransactionHistoryID transaction={transaction} />
              <TableCell />
              <TableCell /><TableCell /><TableCell />
            </TableRow>
          </CollapsableItem>
        </Fragment>
      );
    }
}

const EventRows = observer(({ displayedTxs }) => (
  <TableBody>
    {displayedTxs.map((transaction) => (<EventRow key={transaction.txid} transaction={transaction} />))}
  </TableBody>
));

const NameLinkCell = withStyles(styles)(({ classes, clickable, ...props }) => (
  <TableCell>
    <span className={clickable && classes.eventNameText} {...props} />
  </TableCell>
));

const CollapsableItem = withStyles(styles)(({ expanded, children }) => (
  <Fragment>
    { expanded && children }
  </Fragment>
));

export default EventRows;
