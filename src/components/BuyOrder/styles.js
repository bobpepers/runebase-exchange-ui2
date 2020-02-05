const styles = (theme) => ({
  dashboardOrderBookWrapper: {
    marginBottom: theme.padding.sm.px,
  },
  dashboardActionsSort: {
    padding: `${theme.padding.unit.px} ${theme.padding.sm.px}`,
    verticalAlign: 'middle',
  },
  dashboardOrderBookTitle: {
    padding: `12px ${theme.padding.sm.px}`,
    border: '1px solid #000',
    background: '#585AFA',
    textAlign: 'center',
    width: '300',
  },
  dashboardOrderBook: {
    border: '1px solid #000',
    background: '#F9F9F9',
    textAlign: 'center',
  },
  orderInput: {
    border: '1px solid #000',
    background: '#F9F9F9',
    textAlign: 'center',
    width: '70%',
  },
  orderLabel: {
    background: '#F9F9F9',
    textAlign: 'center',
    width: '70%',
  },
  tokenSelect: {
    background: '#F9F9F9',
    textAlign: 'center',
    width: '100%',
  },
  tokenOption: {
    background: '#F9F9F9',
    textAlign: 'center',
    width: '100%',
  },
});

export default styles;
