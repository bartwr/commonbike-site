export const controlStyles = theme => ({
  base: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: '16px',
    padding: '40px 0',
    width: '860px',
    maxWidth: '100%',
    marginRight: 'auto',
    marginLeft: 'auto'
  },
  paper: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: theme.spacing(1),
    margin: theme.spacing(0.5),
    padding: theme.spacing(3),
    borderRadius: '16px',
    width: '90%',
    justifySelf: 'space-around'
  },
  header: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  imageline: {
    margin: '16px 0',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  explainer: {
    width: '100%',
    marginBottom: theme.spacing(2),
    // fontSize: 'small',
  },
  explainerimage: {
    width: '20vmin',
    height: '20vmin',
    flex: '1 1 auto',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    border: '1px solid black',
    borderRadius: '1vmin',
    margin: '1vmin'
  },
  spotlight: {
    marginBottom: theme.spacing(0.5),
    // fontSize: 'small',
    padding: '20px',
    backgroundColor: 'lightblue',
  },
  explainercentered: {
    textAlign: 'center',
    padding: '20px',
    marginBottom: theme.spacing(0.5),
    // fontSize: 'small',
  },
  spotlightcentered: {
    textAlign: 'center',
    marginBottom: theme.spacing(0.5),
    // fontSize: 'small',
    backgroundColor: 'lightblue',
  },
  textfield: {
    // fontSize: 'small',
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
