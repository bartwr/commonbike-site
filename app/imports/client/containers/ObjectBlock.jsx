import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import ContentEditable from 'react-contenteditable';
import ReactDOM from 'react-dom';
import { RedirectTo } from '/client/main'

// Import models
import { Objects } from '/imports/api/objects.js';

// Import components
// import CheckInOutProperties from '/imports/client/components/CheckInOutProperties/CheckInOutProperties';

class ObjectBlock extends Component {

  constructor(props) {
    super(props);
    
    this.state = props.item
  }
    
  //+handleChange :: Event -> StateChange
  handleChange(e) {
    this.state.title = e.target.value;
    
    Meteor.call('objects.update', this.props.item._id, this.state);
  }

  state2Text(state) {
    let text = "";
    if (state=='r_available'||state=='available') {
      text = 'AVAILABLE';
    } else if (state=='r_rentstart'||state=='inuse') {
      text = 'IN USE';
    } else if (state=='r_outoforder'||state=='outoforder') {
      text = 'OUT OF ORDER';
    } else if (state=='reserved') {
      text = 'RESERVED';
    } else {
      text = 'UNKNOWN';
    }

    return text;
  }
  

  // RedirectTo('/bike/details/' + this.props.item._id) }
  viewItem() { RedirectTo((this.props.isEditable ? '/admin/bike/details/' : '/bike/details/') + this.props.item._id) }

  deleteItem() {
    if( ! confirm('Weet je zeker dat je de fiets "'+this.props.item.title+'" wilt verwijderen?') || ! confirm('Sure? If not sure: don\'t') )
      return;

    Meteor.call('objects.remove', this.props.item._id);
  }

  render() {
    return (
      <article style={Object.assign({}, s.base, ! this.props.isEditable && {cursor: 'pointer'})} onClick={this.props.onClick} ref="base">
        <div style={s.textWrapper} ref="textWrapper">

          { this.props.isEditable
            ? <ContentEditable style={s.title} html={this.props.item.title} disabled={false} onChange={this.props.handleChange} />
            : <div style={s.title} dangerouslySetInnerHTML={{__html: this.props.item.title}}></div> }

          <div style={Object.assign({display: 'none'}, s.objectdetailsold, (this.props.showPrice || this.props.showState || this.props.showRentalDetails || this.props.showLockDetails) && {display: 'block'})}>
             <div>{ this.props.showState && this.props.item.state ? this.state2Text(this.props.item.state.state) : null }</div>
             <div>{ this.props.showPrice ? <div dangerouslySetInnerHTML={{__html:this.getPriceDescription(this.props.item)}} /> : null }</div>
             <div>{ this.props.showRentalDetails && this.props.item ? this.rentalDetails2Text(this.props.item) : null }</div>
             <div>{ this.props.showLockDetails && this.props.item ? this.lockDetails2Text(this.props.item) : null }</div>
          </div>
        </div>

        <button style={Object.assign({display: 'none'}, s.deleteButton, this.props.isEditable && {display: 'block'})} onClick={this.props.deleteItem}>delete</button>
        <button style={Object.assign({display: 'none'}, s.infoButton, this.props.isEditable && {display: 'block'})} onClick={this.props.viewItem}>info</button>
      </article>
      
    );
  }
}

var s = {
  base: {
    background: '#fff',
    display: 'flex',
    fontWeight: 'normal',
    lineHeight: 'normal',
    padding: '10px',
    maxWidth: '100%',
    width: '400px',
    margin: '20px auto',
    borderBottom: 'solid 5px #bc8311',
    textAlign: 'left',
  },
  title: {
    flex: 2,
    fontSize: '1.2em',
    margin: '0 10px',
    fontWeight: 500
  },
  deleteButton: {
    cursor: 'cross',
    ':hover': {
      color: '#f00',
    }
  },
  infoButton: {
    marginLeft: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
}

ObjectBlock.propTypes = {
  item: PropTypes.object.isRequired,
  isEditable: PropTypes.any,
  showPrice: PropTypes.any,
  showState: PropTypes.any,
  showRentalDetails: PropTypes.any,
  showLockDetails: PropTypes.any,
  onClick: PropTypes.any,
  handleChange: PropTypes.any,
  viewItem: PropTypes.any,
  deleteItem: PropTypes.any,
};

ObjectBlock.defaultProps = {
  item: {},
  showPrice: false,
  showState: false,
  showRentalDetails: false,
  showLockDetails: false,
  isEditable: false
}

export default ObjectBlock;
