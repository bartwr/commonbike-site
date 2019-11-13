export const controlStyles = theme => ({
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: theme.spacing.unit,
  },
  paper: {
    margin: 0.5 * theme.spacing.unit,
    padding: 3* theme.spacing.unit,
    borderRadius: '16px',
    maxWidth: '500px',
  },
  header: {
    textAlign: 'center',
    marginBottom: 0.5 * theme.spacing.unit,
  },
  explainer: {
    marginBottom: 0.5 * theme.spacing.unit,
    fontSize: 'small',
  },
  explainercentered: {
    textAlign: 'center',
    marginBottom: 0.5 * theme.spacing.unit,
    fontSize: 'small',
  },
  textfield: {
    fontSize: 'small',
    width: '100%',
    margin: 0.5 * theme.spacing.unit,
  },
  button: {
    marginTop: '5px',
    marginBottom: '5px',
    width: '100%'
  },
});

export const snackbarOptions = {
  success: {
    variant: 'success',
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    autoHideDuration: 2000,
  },
  successlong: {
    variant: 'success',
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    autoHideDuration: 5000,
  },
  error: {
    variant: 'error',
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    autoHideDuration: 2000,
  }
}
