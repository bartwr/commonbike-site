objectimport React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RedirectTo } from '/client/main'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import DeleteIcon from '@material-ui/icons/Delete';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';// Import components

import { determineStatusBools, determineCardClassName, determineStatusImageSrc } from '/imports/api/velocomforts.js';

const styles = theme => ({
  card: {
   display: 'flex',
   flexDirection: 'column',
   justifyContent: 'space-between',
   width: '200px',
   height: '200px',
   margin: theme.spacing(1)
  },
  title: {
   textAlign: 'center',
   fontSize: 'large',
   fontWeight: 'bold',
   height: '30px',
   paddingTop: theme.spacing(0.5)
  },
  dataline: {
   textAlign: 'center',
   fontSize: 'small',
   fontWeight: 'normal',
   height: '30px',
   paddingTop: theme.spacing(0.5),
  },
  cardvelocomforts: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: 'auto',
    justifyContent: 'space-around',
    alignItems: 'flex-start'
  },
  cardmedia: {
    width: '50px',
    height: '50px',
    backgroundSize: 'contain',
    margin: '2px',
    border: '1px solid black'
  },
  cardcontent: {
    padding: 0
  },
  cardactions: {
   display: 'flex',
   flexDirection: 'row',
   justifyContent: 'space-around',
  },
});

class ObjectCompactComponent extends Component {

  constructor(props) {
    super(props);
  }
  
  redirectToDetailsView = (id) => (e) => {
    RedirectTo('/objects/'+id);
  }
  
  deleteObject() {
    if( ! confirm('Are you sure that you want to remove object '+this.props.object.title+'?'))
      return;

    confirm('Sure?') && Meteor.call('objects.remove', this.props.object._id);
  }
  
  render() {
    if(!this.props.object) {
      console.log('blank object details (no item record)');
      return null;
    }

    const { classes, theme, object, velocomforts, isAdmin } = this.props;
    
    const precise = (x, decimals) => Number.parseFloat(x).toPrecision(decimals);
    
    const lat = object.lat_lng && object.lat_lng[0] ? object.lat_lng[0] : '-';
    const lng = object.lat_lng && object.lat_lng[1] ? object.lat_lng[1] : '-';
    
    return (
        <Card className={classes.card}>
          <CardContent className={classes.cardcontent} onClick={this.redirectToDetailsView(object._id)}>
            <Typography className={classes.title}>{object.title}</Typography>
            <Typography className={classes.dataline}>lat: {lat}</Typography>
            <Typography className={classes.dataline}>lng: {lng}</Typography>
            <Typography className={classes.dataline}>{new Date(object.lat_lng_timestamp).toLocaleString()}</Typography>
            <Typography className={classes.dataline}>from: {object.lastipaddress}</Typography>
          </CardContent>
          <CardActions className={classes.cardactions}>
            { isAdmin ?
              <IconButton aria-label="Edit" className={classes.iconbutton} onClick={this.redirectToDetailsView(object._id, 'status')}>
                <SettingsIcon />
              </IconButton>
              :
              null }
            { isAdmin ?
              <IconButton aria-label="Delete" className={classes.iconbutton} onClick={this.deleteObject.bind(this)}>
                <DeleteIcon />
              </IconButton>
              :
              null
            }
          </CardActions>
        </Card>
    );
  }
}

ObjectCompactComponent.propTypes = {
  isAdmin: PropTypes.any,
  object: PropTypes.object
};

ObjectCompactComponent.defaultProps = {
  isAdmin: false,
  object: {},
}

export default withStyles(styles)(ObjectCompactComponent);
