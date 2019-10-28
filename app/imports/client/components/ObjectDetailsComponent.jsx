import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { RedirectTo } from '/client/main'
import { StyleProvider } from '/imports/client/StyleProvider.js'
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

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

  renderCheckInOutProcess(state) {
    const {object} = this.props;
    
    if(this.props.object.state.state=="inuse") {
      return (
        <div style={s.base}>
          <ul style={s.list}>
            <li style={s.listitem,s.mediumFont}>IN GEBRUIK</li>
          </ul>
        </div>
      );
    } else if(this.props.object.state.state!="available") {
      return (
        <div style={s.base}>
          <ul style={s.list}>
            <li style={s.listitem,s.mediumFont}>NOT AVAILABLE</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div style={s.base}>
          <ul style={s.list}>
            <li style={s.listitem,s.mediumFont}>UNKNOWN</li>
          </ul>
        </div>
      );
    }

  //   var lockType = this.props.object.lock.type;
  //
  //   // If not logged in: refer to login page
  //   if( ! this.props.currentUser)
  //     return <Button onClick={RedirectTo.bind(this, '/login?redirectTo=/bike/details/'+this.props.object._id)}>Login to reserve</Button>
  //
  //   else if(lockType=='open-elock')
  //     return <CheckInOutProcessOpenELock
  //         object={this.props.object} isProvider={this.props.isEditable} locationId={this.props.location._id} />
  //
  // else if(lockType=='concox-bl10')
  //   return <CheckInOutProcessConcoxBL10
  //       object={this.props.object} isProvider={this.props.isEditable} locationId={this.props.location._id} />
  //
  //   else
  //     return <CheckInOutProcessPlainKey
  //         object={this.props.object} isProvider={this.props.isEditable} locationId={this.props.location._id} />
  }
  
  rentBike() {
    
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
          <Button variant="contained" className={classes.actionbutton} onClick={this.rentBike(object)}>CREATE BIKE</Button>
          <Button variant="contained" className={classes.actionbutton} onClick={this.rentBike(object)}>RENT BIKE</Button>
          <Button variant="contained" className={classes.actionbutton} onClick={this.rentBike(object)}>END RENT BIKE</Button>
          <Button variant="contained" className={classes.actionbutton} onClick={this.rentBike(object)}>UPDATE GPS LOCATION</Button>
        </div>
      </div>
    );
    
    {/*
// Define what propTypes are allowed
<center>
  <MapSummary item={location} width={'60vmin'} height={'40vmin'} style={{border: '2px solid red'}}/>
</center>

            <ObjectBlock
              item={this.props.object} />

            { this.props.isEditable?
              <EditObject objectId={this.props.object._id} />
              :null }

            { this.props.isEditable?
              <ManageApiKeys keyOwnerId={this.props.object._id} keyType="object" />
              :null }

            <div>{ this.getBalance( this.props.object ) }</div>

    */}

  }


}

var s = StyleProvider.getInstance().checkInOutProcess;

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
