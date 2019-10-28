import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    '-moz-user-select': 'none',
    '-khtml-user-select': 'none',
    '-webkit-user-select': 'none',
    '-ms-user-select': 'none',
    'user-select': 'none',
    background: 'transparent',
    zIndex: 1,
  },
  menuitem: {
    height: '100%',
    width: '100%',
    flex: '0 1 auto',
    boxSizing: 'border-box',
    color: 'black',
    border: '3px solid black',
    borderRadius: '1vmin',
    flex: '1 1 auto',
    backgroundSize:'contain',
    backgroundRepeat:'no-repeat',
    backgroundPosition:'bottom center',
    backgroundColor: 'rgba(255,255,255,1)',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  submenuitem: {
    height: '45%',
    width: '45%',
    flex: '0 1 auto',
    boxSizing: 'border-box',
    color: 'black',
    border: '3px solid black',
    borderRadius: '10%',
    backgroundSize:'contain',
    backgroundRepeat:'no-repeat',
    backgroundPosition:'bottom center',
    backgroundColor: 'rgba(255,255,255,1)',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  menuitemicon: {
    flex: '1 1 auto',
    boxSizing: 'border-box',
    height: '90%',
    width: '90%',
    border: '1px solid green'
  },
  menuitemlabel: {
    // flex: '0 1 auto',
    // width: '100%',
    // textAlign: 'center',
    // height: '20%',
    // whiteSpace: 'nowrap',
    // overflow: 'hidden',
    // textOverflow: 'ellipsis',
    // fontSize: '1.7vmin',
    // fontFamily: 'Fredoka One',
    // marginTop: '0.2vmin'
    // border: '1px solid red',
  }
});

class AddObjectComponent extends Component {
  constructor(props) {
    super(props);
    
    this.state = { expanded: true }
    
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }
  
  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener('touchstart', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('touchstart', this.handleClickOutside);
  }
  
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState((prevstate)=>{return { expanded: false }});
//      alert('You clicked outside of me!');
    }
  }

  doAddItem = (itemtype) => (e) => {
    e.preventDefault();
    this.setState((prevstate)=>{return { expanded: false }});
    
    alert('add item of type ' + itemtype +' to menu ');
  }
  
  doSelectType = () => (e) => {
    e.stopPropagation();
    
    this.setState((prevstate)=>{return { expanded: true }});
  }

  cancelInput = () => (e) => {
    e.stopPropagation();
    
    console.log('cancel input')
    this.setState((prevstate)=>{return { expanded: false }});
  }

  render() {
    const { classes, type, zoom } = this.props
    const { expanded } = this.state
    
    if(expanded) {
      console.log('render AddObjectComponent of type %s %o', type, classes)
    
      const imagelinkFood = 'url(/images/generic-food.png)';
      const imagelinkDrink = 'url(/images/generic-drink.png)';
      const imagelinkMenu = 'url(/images/generic-menu.png)';

  /*    <div className={classes.poster} style={{backgroundImage: imagelink, zoom: zoom}} />
  */

      return (
        <div ref={this.setWrapperRef} className={classes.root} style={{zoom: zoom}} onClick={console.log('mis')}>
            <IconButton className={classes.submenuitem} title='Add Food'
              style={{zoom: zoom, backgroundImage: imagelinkFood }}
              onClick={this.doAddItem('Food')} >
            </IconButton>
            <IconButton className={classes.submenuitem} title='Add Drink'
              style={{zoom: zoom, backgroundImage: imagelinkDrink }}
              onClick={this.doAddItem('Drink')} >
            </IconButton>
            <IconButton className={classes.submenuitem} title='Add Menu'
              style={{zoom: zoom, backgroundImage: imagelinkMenu }}
              onClick={this.doAddItem('Menu')} >
            </IconButton>
            <IconButton className={classes.submenuitem} title='Cancel Selection' onClick={this.cancelInput().bind(this)} style={{zoom: zoom}}>
              <CloseIcon className={classes.menuitemicon} />
            </IconButton>
        </div>
      )
    } else {
      return (
        <div className={classes.root} style={{zoom: zoom}}>
           <IconButton className={classes.menuitem} title='Add Item' onClick={this.doSelectType()} style={{zoom: zoom}}>
             <AddIcon className={classes.menuitemicon}/>
           </IconButton>
        </div>
      )
    }
  }
}

AddObjectComponent.propTypes = {
  type: PropTypes.string,
  parentuuid: PropTypes.string,
  zoom: PropTypes.number
};

AddObjectComponent.defaultProps = {
  type: 'Menu',
  parentuuid: undefined,
  zoom: 1
}

export default withStyles(styles)(AddObjectComponent);
