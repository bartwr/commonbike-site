import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { RedirectTo } from '/client/main'

// Import components
import RaisedButton from '/imports/client/components/RaisedButton';
import { getUserDescription } from '/imports/api/users.js';

// import { Backuplist } from '/imports/api/databasetools.js';

class AdminTools extends Component {
  constructor(props) {
    super(props);
  }

  showAllTransactions() {
    RedirectTo('/admin/transactions');
  }

  clearTransactions() {
    if( !confirm('Are you sure you want to erase the complete transaction history? This can not be undone.')) {
      return;
    }

    Meteor.call('transactions.clearAll');
  }

  cleanTestUsers() {
    if( !confirm('Are you sure you want to remove all testusers? This can not be undone.')) {
      return;
    }

    Meteor.call('testdata.cleanupTestUsers');

    alert('All testusers are removed!');
  }

  cleanTestData() {
    if( !confirm('Are you sure you want to remove all testdata? This can not be undone.')) {
      return;
    }

    Meteor.call('testdata.cleanupTestData');

    alert('All testdata is removed!');
  }

  insertTestUsers() {
    if( !confirm('Are you sure you waqnt to add testusers? Never do this on a productionserver.')) {
      return;
    }

    Meteor.call('testdata.checkTestUsers');

    alert('The testusers have been added!');
  }

  insertTestData() {
    if( !confirm('Are you sure you want to add testdata? Never do this on a productionserver.')) {
      return;
    }

    Meteor.call('testdata.checkTestLocations');

    alert('The testdata has been added!');
  }

  showLog() {
    RedirectTo('/admin/log');
  }

  databaseCheckup() {

  }

  databaseBackup() {
    Meteor.call('databasetools.backup');
  }

  databaseRestore(path) {
    Meteor.call('databasetools.restore', path);
  }

  render() {
    return (
      <div style={s.base}>
        <div style={s.centerbox}>
          <RaisedButton onClick={this.showAllTransactions.bind(this)}>SHOW ALL TRANSACTIONS</RaisedButton>

          <RaisedButton onClick={this.clearTransactions.bind(this)}>CLEANUP ALL TRANSACTIONS</RaisedButton>
        </div>

        <div style={s.centerbox}>

          <RaisedButton onClick={this.cleanTestUsers.bind(this)}>REMOVE TESTUSERS</RaisedButton>

          <RaisedButton onClick={this.cleanTestData.bind(this)}>REMOVE TESTDATA</RaisedButton>

          <RaisedButton onClick={this.insertTestUsers.bind(this)}>ADD TESTUSERS</RaisedButton>

          <RaisedButton onClick={this.insertTestData.bind(this)}>ADD TESTDATA</RaisedButton>

        </div>
        <div style={s.centerbox}>
          <RaisedButton onClick={this.showLog.bind(this)}>SHOW LOG</RaisedButton>
        </div>
      </div>
    );
  }
}

// <div style={s.centerbox}>
//   <RaisedButton hidden onClick={this.databaseCheckup.bind(this)}>DATABASE CHECKUP</RaisedButton>
//
//   <RaisedButton onClick={this.databaseBackup.bind(this)}>DATABASE BACKUP</RaisedButton>
//
//              { this.props.backuplist.map(item =>  <RaisedButton key={item.name} onClick={this.databaseRestore.bind(this, item.name)}>RESTORE BACKUP {item.name.toUpperCase()}</RaisedButton>) }
// </div>

var s = {
  base: {
    padding: '10px 20px',
    textAlign: 'center'
  },
  personalia: {
    padding: '0 20px',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  avatar: {
    display: 'inline-block',
    width: '200px',
    height: '200px'
  },
  centerbox: {
    background: 'white',
    margin: '10px 0 10px 0',
    border: '1px solid black'
  }
}

AdminTools.propTypes = {
//  backuplist: PropTypes.array,
};

AdminTools.defaultProps = {
//  backuplist: []
}

export default createContainer((props) => {
  Meteor.subscribe('users');
//  Meteor.subscribe('backuplist');

  return {
//    backuplist : Backuplist.find().fetch()
  };
}, AdminTools);

//
