const styles = (theme) => ({
  root: {
    background: theme.palette.background.default,
  },
  container: {
    padding: `${theme.sizes.navHeight} 0 ${theme.padding.md.px} 0`,

    [theme.breakpoints.up('xs')]: {
      margin: theme.padding.sm.px,
    },

    [theme.breakpoints.up('sm')]: {
      margin: theme.padding.md.px,
    },

    [theme.breakpoints.up('xl')]: {
      margin: '0 auto',
      marginTop: theme.padding.md.px,
      marginBottom: theme.padding.md.px,
    },
  },
});

export default styles;
