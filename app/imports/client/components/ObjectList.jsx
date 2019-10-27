import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import ObjectBlock from '/imports/client/containers/ObjectBlock';

// Import models
import { Objects } from '/imports/api/objects.js';

class ObjectList extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    if(!this.props.objects ) return (null);
    
    console.log("*** objects %o", this.props.objects)

    return (
      <div style={s.base}>

        <p style={s.intro}>
          {this.props.title}<br/>
        </p>

        { this.props.objects.length != 0 ?
           this.props.objects.map((object) =>  <ObjectBlock
                              key={object._id}
                              item={object}
                              isEditable={this.props.isEditable}
                              showPrice={this.props.showPrice}
                              showState={this.props.showState}
                              showRentalDetails={this.props.showRentalDetails}
                              showLockDetails={this.props.showLockDetails}
                              onClick={this.props.clickItemHandler} />)
          :
          <p style={s.intro}><i><b>{this.props.emptyListMessage}</b></i></p>
        }

      </div>
    );
  }
}

var s = {
  base: {
    fontSize: 'default',
    lineHeight: 'default',
    padding: '20px 20px 0 20px',
    textAlign: 'center',
    minHeight: 'calc(100vh - 74px)',
  },
  intro: {
    color: 'white',
    padding: '0 70px',
    margin: '0 auto',
    maxWidth: '400px',
    textAlign: 'center',
    minHeight: '40px',
    fontSize: '1.2em',
    fontWeight: '500',
    // background: 'url("/files/ObjectList/marker.svg") 0 0 / auto 60px no-repeat',
  },

}

ObjectList.propTypes = {
  title: PropTypes.string,
  emptyListMessage: PropTypes.string,
  objects: PropTypes.array,
  clickItemHandler: PropTypes.any,

  showPrice : PropTypes.any,
  showState : PropTypes.any,
  showRentalDetails: PropTypes.any,
  showLockDetails: PropTypes.any,
  isEditable: PropTypes.any
};

ObjectList.defaultProps = {
  title: "SELECT A BIKE",
  emptyListMessage: "",
  objects: [],
  clickItemHandler: '',

  methodsBaseName: "",
  showPrice : false,
  showState : true,
  showRentalDetails: false,
  showLockDetails: false,
  isEditable: false
}

export default ObjectList;
