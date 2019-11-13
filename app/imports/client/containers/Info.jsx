import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data';
import { withStyles } from '@material-ui/core/styles';

import Redirect from 'react-router/Redirect'

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';

import { ClientStorage } from 'ClientStorage';

import { getDefaultProfile } from '/imports/api/users.js';

import { controlStyles } from '/imports/client/components/SharedStyles.jsx'

class Info extends Component {
  constructor(props) {
    super(props);
    
    let dontshow = ClientStorage.has("dontshow-info") && ClientStorage.get("dontshow-info");
    console.log("init dontshow %s", dontshow)

    this.state = {
      dontshow,
      redirect: false
    }
  }

  doRedirect = (location) => () => {
    this.setState({redirect: location});
  }

  handleChangeCheckbox = () => event => {
    let dontshow = !(ClientStorage.has("dontshow-info") && ClientStorage.get("dontshow-info"));
    ClientStorage.set("dontshow-info", dontshow)
    this.setState({'dontshow': dontshow});
  };

  render() {
    const { classes } = this.props;
    const { read } = this.state;
    const error = [read].filter(v => v).length !== 1;

    if(false!==this.state.redirect) {
      return (<Redirect to={this.state.redirect} />)
    }

    return (
      <Paper className={classes.paper}>
        <FormGroup>
          <Typography className={classes.header} variant="h6">
            WELCOME!
          </Typography>
          <Typography className={classes.explainer}>
            Some info about lisk.bike
          </Typography>
          <Typography className={classes.explainer}>
            More info about lisk.bike
          </Typography>
          <Button className={classes.button} variant="outlined" onClick={ this.doRedirect('/').bind(this) } className={classes.button}>Rent a bike</Button>
          <Button className={classes.button} variant="outlined" onClick={ this.doRedirect('/login').bind(this) } className={classes.button}>Manage your locks</Button>
          <Typography className={classes.explainer}>&nbsp;</Typography>
          <FormControlLabel control={ <Checkbox checked={this.state.dontshow===true} onChange={this.handleChangeCheckbox()}/> }
            label={<Link component="button" variant="body1" onClick={this.handleClickOpen}>{'Dont\' show this message in the future'}</Link>} />
        </FormGroup>
      </Paper>
    )
  }
}

Info.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(controlStyles)(Info);
