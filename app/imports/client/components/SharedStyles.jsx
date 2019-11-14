export const controlStyles = theme => ({
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: theme.spacing(1),
  },
  paper: {
    margin: theme.spacing(0.5),
    padding: theme.spacing(3),
    borderRadius: '16px',
    width: '90vw',
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(0.5),
  },
  explainer: {
    marginBottom: theme.spacing(0.5),
    fontSize: 'small',
  },
  spotlight: {
    marginBottom: theme.spacing(0.5),
    fontSize: 'small',
    backgroundColor: 'lightblue',
  },
  explainercentered: {
    textAlign: 'center',
    marginBottom: theme.spacing(0.5),
    fontSize: 'small',
  },
  spotlightcentered: {
    textAlign: 'center',
    marginBottom: theme.spacing(0.5),
    fontSize: 'small',
    backgroundColor: 'lightblue',
  },
  textfield: {
    fontSize: 'small',
    width: '100%',
    margin: theme.spacing(0.5),
  },
  button: {
    marginTop: '5px',
    marginBottom: '5px',
    width: '100%'
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
  },
  column: {
    float: 'left',
    width: '25%',
    padding: '5px',
  },
  row: {
    content: '',
    clear: 'both',
    display: 'table',
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
