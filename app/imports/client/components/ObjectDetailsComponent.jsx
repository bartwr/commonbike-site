import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { RedirectTo } from '/client/main'
import { StyleProvider } from '/imports/client/StyleProvider.js'

// Import components
import EditObject from '/imports/client/containers/EditObject';
import RaisedButton from '/imports/client/components/RaisedButton.jsx'
import ObjectBlock from '/imports/client/containers/ObjectBlock';
import Button from '/imports/client/components/Button.jsx';
import CheckInOutProcessBase from '/imports/client/components/CheckInCode';
import MapSummary from '/imports/client/MapSummary';
import CheckInOutProcessPlainKey from '/imports/client/components/CheckInOutProcess/CheckInOutProcessPlainKey';
import CheckInOutProcessOpenELock from '/imports/client/components/CheckInOutProcess/CheckInOutProcessOpenELock';
import ManageApiKeys from '/imports/client/components/ManageApiKeys';
import Balance from '/imports/client/components/Balance.jsx';

class ObjectDetailsComponent extends Component {

  constructor(props) {
    super(props);
  }

  getBalance(item) {
    if(item&&item.wallet) {
       return (<Balance label="SALDO" address={item.wallet.address} providerurl="https://ropsten.infura.io/sCQUO1V3FOo" />);
    } else {
       console.log('no wallet!', item)
       return (<div />);
     }
  }

  renderCheckInOutProcess() {
    if( ! this.props.object.lock ) return <div />;

    var validUser = (Meteor.userId()==this.props.object.state.userId)||this.props.isEditable;

    if(this.props.object.state.state=="inuse"&&!validUser) {
      return (
        <div style={s.base}>
          <ul style={s.list}>
            <li style={s.listitem,s.mediumFont}>IN GEBRUIK</li>
          </ul>
        </div>
      );
    } else if(this.props.object.state.state!="available"&&!validUser) {
      return (
        <div style={s.base}>
          <ul style={s.list}>
            <li style={s.listitem,s.mediumFont}>NOT AVAILABLE</li>
          </ul>
        </div>
      );
    }

    var lockType = this.props.object.lock.type;

    // If not logged in: refer to login page
    if( ! this.props.currentUser)
      return <Button onClick={RedirectTo.bind(this, '/login?redirectTo=/bike/details/'+this.props.object._id)}>Login to reserve</Button>

    else if(lockType=='open-elock')
      return <CheckInOutProcessOpenELock
          object={this.props.object} isProvider={this.props.isEditable} locationId={this.props.location._id} />

  else if(lockType=='concox-bl10')
    return <CheckInOutProcessConcoxBL10
        object={this.props.object} isProvider={this.props.isEditable} locationId={this.props.location._id} />

    else
      return <CheckInOutProcessPlainKey
          object={this.props.object} isProvider={this.props.isEditable} locationId={this.props.location._id} />
  }

  render() {
    return (
      <div style={s.base}>

        <p style={s.intro}>
          Reserveer bij:<br /><span dangerouslySetInnerHTML={{__html: this.props.location.title}} />
        </p>

        <center>
          <MapSummary item={this.props.location} width={400} height={120}/>
        </center>

        <ObjectBlock
          item={this.props.object} />

        { this.props.isEditable?
          <EditObject objectId={this.props.object._id} />
          :null }

        { this.props.isEditable?
          <ManageApiKeys keyOwnerId={this.props.object._id} keyType="object" />
          :null }

{/*}        <div>{ this.getBalance( this.props.object ) }</div> */}

        { this.renderCheckInOutProcess() }

      </div>
    );
  }
}

var s = StyleProvider.getInstance().checkInOutProcess;

ObjectDetailsComponent.propTypes = {
  currentUser: PropTypes.object,
  isEditable: PropTypes.any,
  location: PropTypes.object,
  object: PropTypes.object,
};

ObjectDetailsComponent.defaultProps = {
  isEditable: false,
  location: {},
  object: {},
}

export default ObjectDetailsComponent
