export const controlStyles = theme => ({
  base: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: '16px',
    width: '90vw',
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
    width: '90vw',
    justifySelf: 'space-around'
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(0.5),
  },
  imageline: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  explainer: {
    width: '100%',
    marginBottom: theme.spacing(2),
    fontSize: 'small',
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
