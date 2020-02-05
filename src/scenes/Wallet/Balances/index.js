/* eslint-disable react/static-property-placement, react/destructuring-assignment, react/jsx-wrap-multilines, react/jsx-curly-newline */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Button,
  Snackbar,
  withStyles,
  Grid,
  Paper,
  Typography,
  IconButton,
} from '@material-ui/core';
import { SortBy } from 'constants';
import { Close as CloseIcon } from '@material-ui/icons';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import _ from 'lodash';

import styles from './styles';
import DepositDialog from './DepositDialog';
import WithdrawDialog from './WithdrawDialog';
import WithdrawTxConfirmDialog from './WithdrawTxConfirmDialog';
import Config from '../../../config/app';
import Tracking from '../../../helpers/mixpanelUtil';

const messages = defineMessages({
  txConfirmMsgSendMsg: {
    id: 'txConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class MyBalances extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      order: SortBy.ASCENDING.toLowerCase(),
      orderBy: 'address',
      addrCopiedSnackbarVisible: false,
      selectedAddress: undefined,
      depositDialogVisible: false,
      withdrawDialogVisible: false,
    };

    this.getTotalsGrid = this.getTotalsGrid.bind(this);
    this.getTableHeader = this.getTableHeader.bind(this);
    this.getSortableCell = this.getSortableCell.bind(this);
    this.getNonSortableCell = this.getNonSortableCell.bind(this);
    this.getTableBody = this.getTableBody.bind(this);
    this.getAddrCopiedSnackBar = this.getAddrCopiedSnackBar.bind(this);
    this.onCopyClicked = this.onCopyClicked.bind(this);
    this.onDepositClicked = this.onDepositClicked.bind(this);
    this.handleDepositDialogClose = this.handleDepositDialogClose.bind(this);
    this.onWithdrawClicked = this.onWithdrawClicked.bind(this);
    this.onWithdraw = this.onWithdraw.bind(this);
    this.onAddrCopiedSnackbarClosed = this.onAddrCopiedSnackbarClosed.bind(this);
  }

  render() {
    const { classes } = this.props;
    const {
      selectedAddress,
      depositDialogVisible,
      withdrawDialogVisible,
    } = this.state;

    return (
      <Paper className={classes.myBalancePaper}>
        <Grid container spacing={0} className={classes.myBalanceGridContainer}>
          <Typography variant="h6" className={classes.myBalanceTitle}>
            <FormattedMessage id="myBalances.myBalance" defaultMessage="My Balance" />
          </Typography>
          {this.getTotalsGrid()}
          <Table>
            {this.getTableHeader()}
            {this.getTableBody()}
          </Table>
          {this.getAddrCopiedSnackBar()}
          <DepositDialog
            dialogVisible={depositDialogVisible}
            onClose={this.handleDepositDialogClose}
            onCopyClicked={this.onCopyClicked}
            walletAddress={selectedAddress}
          />
          <WithdrawDialog
            dialogVisible={withdrawDialogVisible}
            onClose={this.handleWithdrawDialogClose}
            onWithdraw={this.onWithdraw}
            walletAddress={selectedAddress}
          />
          <WithdrawTxConfirmDialog onWithdraw={this.onWithdraw} id={messages.txConfirmMsgSendMsg.id} />
        </Grid>
      </Paper>
    );
  }

  getTotalsGrid() {
    const { classes, store: { wallet } } = this.props;
    const walletAddresses = wallet.addresses;
    const sums = {};
    const items = [];

    _.each(walletAddresses, (item) => {
      _.each(item.Wallet, (item1, data) => {
        sums[data] = (parseFloat(sums[data], 10) || 0) + parseFloat(item.Wallet[data], 10);
      });
    });

    Object.keys(sums).forEach((key) => {
      items.push({
        id: key,
        name: key,
        nameDefault: key,
        total: sums[key],
      });
    });

    return (
      <Grid container className={classes.totalsContainerGrid}>
        {items.map((item) => (
          <Grid item key={item.id} className={classes.totalsItemGrid}>
            <Typography className={classes.totalsItemAmount}>{item.total.toFixed(2)}</Typography>
            <Typography variant="body1">
              <FormattedMessage id={item.name} default={item.nameDefault} />
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  }

  getTableHeader() {
    const { store: { baseCurrencyStore, marketStore } } = this.props;

    const colsFront = [
      {
        id: 'address',
        name: 'str.address',
        nameDefault: 'Address',
        numeric: false,
        sortable: true,
      },
      {
        id: 'copyButton',
        name: 'str.copy',
        nameDefault: 'Copy',
        numeric: false,
        sortable: false,
      },
    ];
    const colsMid = [];
    colsMid.push({
      id: baseCurrencyStore.baseCurrency.pair,
      name: baseCurrencyStore.baseCurrency.pair,
      nameDefault: baseCurrencyStore.baseCurrency.pair,
      numeric: true,
      sortable: true,
    });
    Object.keys(marketStore.marketInfo).forEach((key) => {
      colsMid.push({
        id: marketStore.marketInfo[key].market,
        name: marketStore.marketInfo[key].market,
        nameDefault: marketStore.marketInfo[key].market,
        numeric: true,
        sortable: true,
      });
    });

    const colsEnd = [
      {
        id: 'actions',
        name: 'str.actions',
        nameDefault: 'Actions',
        numeric: false,
        sortable: false,
      },
    ];

    return (
      <TableHead>
        <TableRow>
          {colsFront.map((column) => column.sortable ? this.getSortableCell(column) : this.getNonSortableCell(column))}
          {colsMid.map((column) => column.sortable ? this.getSortableCell(column) : this.getNonSortableCell(column))}
          {colsEnd.map((column) => column.sortable ? this.getSortableCell(column) : this.getNonSortableCell(column))}
        </TableRow>
      </TableHead>
    );
  }

  getSortableCell(column) {
    const { classes } = this.props;
    const { order, orderBy } = this.state;

    return (
      <TableCell
        key={column.id}
        numeric={column.numeric}
        sortDirection={orderBy === column.id ? order : false}
      >
        <Tooltip
          key={column.id}
          title={<FormattedMessage id="str.sort" defaultMessage="Sort" />}
          enterDelay={Config.intervals.tooltipDelay}
          placement={column.numeric ? 'bottom-end' : 'bottom-start'}
        >
          <TableSortLabel
            key={column.id}
            active={orderBy === column.id}
            direction={order}
            onClick={this.handleSorting(column.id)}
          >
            <Typography variant="body1" className={classes.tableHeaderItemText} key={column.id}>
              {column.name}
            </Typography>
          </TableSortLabel>
        </Tooltip>
      </TableCell>
    );
  }

  getNonSortableCell(column) {
    const { classes } = this.props;

    return (
      <TableCell
        key={column.id}
        numeric={column.numeric}
      >
        <Typography variant="body1" className={classes.tableHeaderItemText}>
          {column.name}
        </Typography>
      </TableCell>
    );
  }

  handleSorting = (property) => (event) => { // eslint-disable-line
    const orderBy = property;
    let order = SortBy.DESCENDING.toLowerCase();
    const { store: { wallet } } = this.props;

    if (this.state.orderBy === property && this.state.order === SortBy.DESCENDING.toLowerCase()) {
      order = SortBy.ASCENDING.toLowerCase();
    }

    if (order === SortBy.DESCENDING.toLowerCase()) {
      wallet.addresses.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1));
    } else {
      wallet.addresses.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1));
    }

    this.setState({
      order,
      orderBy,
    });
  }

  getTableBody() {
    const { classes, store: { wallet } } = this.props;
    return (
      <TableBody>
        {wallet.addresses.map((item, index) => {
          const rows = [];
          Object.keys(item.Wallet).forEach((key) => {
            rows.push(<TableCell numeric key={key}><Typography variant="body1">{item.Wallet[key]}</Typography></TableCell>);
          });

          return (<TableRow key={item.address} selected={index % 2 !== 0}>
            <TableCell>
              <Typography variant="body1">{item.address}</Typography>
            </TableCell>
            <TableCell>
              <CopyToClipboard text={item.address} onCopy={this.onCopyClicked}>
                <Button size="small" className={classes.tableRowCopyButton}>
                  <FileCopyIcon />
                  <Typography variant="body1" className={classes.tableRowCopyButtonText}>
                    <FormattedMessage id="str.copy" defaultMessage="Copy" />
                  </Typography>
                </Button>
              </CopyToClipboard>
            </TableCell>
            {rows}
            <TableCell>
              <Button
                variant="contained"
                color="primary"
                size="small"
                className={classes.tableRowActionButton}
                onClick={this.onDepositClicked}
                data-address={item.address}
              >
                <FormattedMessage id="myBalances.deposit" defaultMessage="Deposit" />
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                className={classes.tableRowActionButton}
                onClick={this.onWithdrawClicked}
                data-address={item.address}
              >
                <FormattedMessage id="str.withdraw" defaultMessage="Withdraw" />
              </Button>
            </TableCell>
          </TableRow>);
        })
        }
      </TableBody>
    );
  }

  getAddrCopiedSnackBar() {
    const { addrCopiedSnackbarVisible } = this.state;

    return (
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={addrCopiedSnackbarVisible}
        autoHideDuration={Config.intervals.snackbarLong}
        onClose={this.onAddrCopiedSnackbarClosed}
        message={<FormattedMessage id="myBalances.addressCopied" defaultMessage="Address copied" />}
        action={[
          <IconButton
            key="close"
            color="inherit"
            onClick={this.onAddrCopiedSnackbarClosed}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    );
  }

  onCopyClicked() {
    this.setState({
      addrCopiedSnackbarVisible: true,
    });
  }

  onDepositClicked(event) {
    this.setState({
      selectedAddress: event.currentTarget.getAttribute('data-address'),
      depositDialogVisible: true,
    });

    Tracking.track('myWallet-depositDialogOpen');
  }

  handleDepositDialogClose = () => {
    this.setState({
      selectedAddress: undefined,
      depositDialogVisible: false,
    });
  };

  onWithdrawClicked(event) {
    const { wallet } = this.props.store;

    this.setState({
      selectedAddress: event.currentTarget.getAttribute('data-address'),
      withdrawDialogVisible: true,
    });
    wallet.lastUsedAddress = event.currentTarget.getAttribute('data-address');

    Tracking.track('myWallet-withdrawDialogOpen');
  }

  handleWithdrawDialogClose = () => {
    this.setState({
      selectedAddress: undefined,
      withdrawDialogVisible: false,
    });
  };

  onWithdraw() {
    this.setState({
      withdrawDialogVisible: false,
    });
  }

  onAddrCopiedSnackbarClosed() {
    this.setState({
      addrCopiedSnackbarVisible: false,
    });
  }
}
