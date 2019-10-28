import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { RedirectTo } from '/client/main'
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import RentBikeButton from './RentBikeButton';
import ReturnBikeButton from './ReturnBikeButton';

//
//
//
const styles = theme => ({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    background: 'transparent'
  },
  dialog: {
    width: '60vw',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    backgroundColor: 'white',
    color: 'black',
    borderRadius: '5vmin'
  },
  actionbutton: {
    width: '50vw',
    height: '30px',
    margin: '1vmin'
  },
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    padding: '20px 20px 0 20px',
    textAlign: 'center',
    minHeight: 'calc(100vh - 74px)',
    display: 'flex',
    justifyContent: 'space-below',
    flexDirection: 'column'
  },
  list: {
    margin: '0 auto',
    padding: 0,
    textAlign: 'center',
    listStyle: 'none',
  },
  listitem: {
    padding: '0 10px 0 0',
    margin: '0 auto',
    textAlign: 'center',
    minHeight: '40px',
    fontSize: '1.2em',
    fontWeight: '500',
    listStyle: 'none',
  },
  mediumFont: {
    fontSize: '2em',
    fontWeight: '1000',
  }
});

class ObjectDetailsComponent extends Component {

  constructor(props) {
    super(props);
  }

  // getBalance(item) {
  //   if(item&&item.wallet) {
  //      return (<Balance label="SALDO" address={item.wallet.address} providerurl="https://ropsten.infura.io/sCQUO1V3FOo" />);
  //   } else {
  //      console.log('no wallet!', item)
  //      return (<div />);
  //    }
  // }

  renderObjectState(state) {
    const {object, classes} = this.props;
    
    if(this.props.object.state.state=="inuse") {
      return (
        <div className={classes.base}>
          <ul className={classes.list}>
            <li className={classes.listitem,s.mediumFont}>IN GEBRUIK</li>
          </ul>
        </div>
      );
    } else if(this.props.object.state.state!="available") {
      return (
        <div className={classes.base}>
          <ul className={classes.list}>
            <li className={classes.listitem,s.mediumFont}>NOT AVAILABLE</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className={classes.base}>
          <ul className={classes.list}>
            <li className={classes.listitem,s.mediumFont}>UNKNOWN</li>
          </ul>
        </div>
      );
    }
  }
  
  clickCreateBike(object) {
    console.log("clickCreateBike", object);
  }

  clickReturnBike(object) {
    console.log("clickReturnBike", object);
  }

  clickUpdateGPS(object) {
    console.log("clickUpdateGPS", object);
  }

  render() {
    if(this.props.object==undefined) {
      return (null);
    }
    
    const { object, classes } = this.props;

    let location = object.state && object.state.lat_lng || [0,0];
    
    console.log("object %o / location: %o", object, location);
    
    return (
      <div className={classes.root}>
        <div className={classes.dialog}>
          <Typography variant="h4" style={{backgroundColor: 'white', color: 'black'}}>{object.title}</Typography>
          <Button variant="contained" className={classes.actionbutton} onClick={this.clickCreateBike.bind(this, object)} disabled>CREATE BIKE</Button>
          <RentBikeButton bike={this.props.object} classes={classes} />
          <ReturnBikeButton bike={this.props.object} classes={classes} />
          <Button variant="contained" className={classes.actionbutton} onClick={this.clickUpdateGPS.bind(this, object)} disabled>UPDATE GPS LOCATION</Button>
        </div>
      </div>
    );
  }


}

ObjectDetailsComponent.propTypes = {
  currentUser: PropTypes.object,
  object: PropTypes.object,
  isEditable: PropTypes.any,
};

ObjectDetailsComponent.defaultProps = {
  isEditable: false,
  object: undefined,
}

export default withStyles(styles)(ObjectDetailsComponent);
