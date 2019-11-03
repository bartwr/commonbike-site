import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTracker } from 'meteor/react-meteor-data';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Divider from '@material-ui/core/Divider';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import Button from '@material-ui/core/Button';
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteIcon from '@material-ui/icons/Delete';

const styles = theme => ({
  container: {
    boxSizing: 'border-box',
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    width: '100%',
    margin: '4vmin'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  title: {
    boxSizing: 'border-box',
    marginTop: '2vmin',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%'
  },
  formheader: {
    padding: theme.spacing(1),
  },
  headerfield: {
    margin: theme.spacing(1),
  },
  messagefield: {
    paddingBottom: theme.spacing(2),
  },
  textfield: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  apikeyFormcontrol: {
  },
  apikeyButtonRefresh: {
    position: 'absolute',
    right: '40px',
    bottom: '10px',
    width: '35px',
    height: '35px'
  },
  apikeyButtonDelete: {
    position: 'absolute',
    right: '5px',
    bottom: '10px',
    width: '35px',
    height: '35px'
  },
  combo: {
    margin: 0,
    marginTop: theme.spacing(1)
  },
  yesnoswitch: {
    margin: theme.spacing(1)
  },
  imagepreview: {
    width: '100%',
    height: '20vh',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  actionButton: {
    margin: theme.spacing(1),
    align: 'center center',
  },
  expandIcon: {
    position: 'absolute',
    right: '0px',
    top: '0px',
    width: '40px',
    height: '40px'
  }
});

class EditFields extends Component {

  constructor(props) {
    super(props);


    this.state = {
      changes: {},
      expand: false
      
    }

    if(this.props.externalPanelId) {
      this.state.expand = this.props.externalPanelId==this.props.panelId;
    } else {
      this.state.expand = this.props.startOpen;
    }
  }

  apply = () => e => {
    if(this.props.apply&&(Object.keys(this.state.changes).length > 0)) {
      // for some types (boolean, ...) the control value needs to be converted
      // to pass the schema check
      var changes = this.state.changes;
      Object.keys(changes).forEach((fieldname) => {
        var itemidx = this.props.fields.findIndex((element)=>{return (element.fieldname==fieldname)});
        if(itemidx!=-1) {
          if(this.props.fields[itemidx].controltype=='yesno') {
            // yesno field: convert back to boolean
            // changes[fieldname] = (changes[fieldname]=='true');
          } else if(this.props.fields[itemidx].controltype=='number') {
            // number field: convert back to number
            changes[fieldname] = Number(changes[fieldname]);
          } else if(this.props.fields[itemidx].controltype=='date') {
            // date field: convert back to ISO dt string
            var d = new Date(changes[fieldname]);
            // var offset = (new Date().getTimezoneOffset() / 60) * -1;
            // var dateISO = new Date(d.getTime() + offset);
            changes[fieldname] = d.toISOString();
          } else {
            // leave as is
          }
        } else {
          console.error('field not found! [ ' + fieldname+ '] ');  // should not happen!
//          console.log(JSON.stringify(this.props.fields));
        }
      });

      if(this.props.apply(changes)) {
         this.setState( {changes: { }});
      }
    }
  }

  reset = () => e => {
    if(this.props.reset&&(Object.keys(this.state.changes).length > 0)) {
      this.props.reset(changes);
    }

    this.setState( { changes: { } } );
  }

  delete = () => e => {
    if(this.props.delete) {
      this.props.delete();
    }
  }

  onFieldChange = index => e => {
    let field = this.props.fields[index];

    let newChanges = this.state.changes;
    let value;
    switch(field.controltype) {
      case 'yesno':
        value =  e.target.checked
        break;
      case 'text-array':
      case 'text-array-readonly':
        value =  e.target.value.split(';');
        break;
      default:
        value = e.target.value;
        break;
    }
    if(value!=field.fieldvalue) {
      newChanges[field.fieldname] = value;
    } else {
      delete newChanges[field.fieldname]; // original value is back :-)
    }
    this.setState( { changes: newChanges } );

    // console.log('state after onfieldchange:', JSON.stringify(this.state), JSON.stringify(e.target.value));
  }

  createNewAPIKey(index) {
    let value = Random.hexString( 32 );
    this.setField(index, value);
  }

  setField(index, newvalue) {
    let field = this.props.fields[index];

    let newChanges = this.state.changes;
    if(newvalue!=field.fieldvalue) {
      newChanges[field.fieldname] = newvalue;
    } else {
      delete newChanges[field.fieldname]; // original value is back :-)
    }
    this.setState( { changes: newChanges } );
  }

  getField(classes, fieldindex, field, key, actionhandler) {
    switch (field.controltype) {
      case 'header':
        return (
            <div key={key} className={classes.headerfield}>
              <Typography key={"typo-"+key} variant="h6" color="inherit">{field.label}</Typography>
              <Divider />
            </div>
        );

        break;
      case 'message':
        return (
          <Typography key={"message-"+key} className={classes.message}>{field.label}</Typography>
        );

        break;
      case 'text':
      case 'text-readonly':
      case 'number':
      case 'number-readonly':
        var tmpvalue = this.state.changes[field.fieldname]!=undefined?this.state.changes[field.fieldname]:field.fieldvalue;

        return (
          <TextField
            id={key}
            key={key}
            label={field.label}
            className={classes.textfield}
            value ={tmpvalue}
            onChange={this.onFieldChange(fieldindex)}
            margin="normal"
            disabled={ field.controltype=='text-readonly' || field.controltype=='number-readonly' }/>
        );

        break;
      case 'text-array':
      case 'text-array-readonly':
        return (
          <TextField
            id={key}
            key={key}
            label={field.label}
            className={classes.textfield}
            value={this.state.changes[field.fieldname]!=undefined?this.state.changes[field.fieldname]:field.fieldvalue.join(';')}
            onChange={this.onFieldChange(fieldindex)}
            margin="normal"
            disabled={ field.controltype=='text-array-readonly' }/>
        );

        break;
      case 'date':
        let value;
        if(this.state.changes[field.fieldname]!=undefined) {
          value=this.state.changes[field.fieldname]
        } else {
          value = new Date(field.fieldvalue).toISOString().substr(0, 10);
        }

        return (
          <TextField
            id={key}
            key={key}
            label={field.label}
            type="date"
            className={classes.textfield}
            value={value}
            onChange={this.onFieldChange(fieldindex)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }} />
        );
        break;
      case 'combo':
        return (
          <FormControl className={classes.combo} key={key}>
          <InputLabel shrink htmlFor={key}>{field.label}</InputLabel>
          <Select
            value={this.state.changes[field.fieldname]||field.fieldvalue}
            onChange={this.onFieldChange(fieldindex)}
            inputProps={{
              name: key,
              id: key,
            }}
          >
          { field.options.map((option) => (<MenuItem key={'option-' + option._id} value={option._id}>{option.title}</MenuItem>)) }
          </Select>
         </FormControl>
        )
        break;
      case 'apikey':
        return (
          <FormControl className={classes.apikeyFormcontrol} key={key}>
            <TextField
              id={key}
              key={key}
              label={field.label}
              className={classes.textfield}
              value={this.state.changes[field.fieldname]!=undefined?this.state.changes[field.fieldname]:field.fieldvalue}
              onChange={this.onFieldChange(fieldindex)}
              margin="normal"
              disabled={ field.controltype=='text-readonly' }/>
            <RefreshIcon className={classes.apikeyButtonRefresh} key={'new_apikey_'+field.fieldname} onClick={()=>this.createNewAPIKey(fieldindex)} />
            <DeleteIcon  className={classes.apikeyButtonDelete} key={'clear+apikey_'+field.fieldname} onClick={()=>this.setField(fieldindex, '')} />
          </FormControl>
        );
        break;
      case 'yesno':
        return (
          <FormControlLabel
            key={key}
            value={field.label}
            control={
              <Switch className={classes.yesnoswitch} name={key}
                onChange={this.onFieldChange(fieldindex)}
                checked={this.state.changes[field.fieldname]!=undefined?this.state.changes[field.fieldname]:field.fieldvalue}
                color="primary" />
            }
            label={field.label}
            labelPlacement="end" />
       )
       break;
       return (
         <FormControlLabel
           key={key}
           value={field.label}
           control={
             <Switch className={classes.yesnoswitch} name={key}
               onChange={this.onFieldChange(fieldindex)}
               checked={this.state.changes[field.fieldname]!=undefined?this.state.changes[field.fieldname]:field.fieldvalue}
               color="primary" />
           }
           label={field.label}
           labelPlacement="end" />
      )
      break;
   case 'image-preview':
     if(field.fieldvalue && field.fieldvalue!='') {
       return (
         <div
           className={classes.imagepreview}
           style={{backgroundImage: 'url(' + field.fieldvalue + ')'}}
           key={key} />);
     } else {
        return null;
     }
     break;
   case 'clientside-action':
       let idx = this.props.handlers.findIndex((handler) => handler.name==field.fieldname);
       // console.log(field.fieldname + ' is using handler ' + idx);

       return (
         <Button
         className={classes.actionButton}
         key={'csa_'+field.fieldname}
         onClick={idx!=undefined?this.props.handlers[idx].action.bind(this):null}
         variant='contained'
         >{field.label}</Button>
       );

       break;
      case 'serverside-action':
        return (
          <Button
          className={classes.actionButton}
          key={'ssa_'+field.fieldname}
          onClick={()=>{actionhandler(field.fieldname)}}
          variant='contained'
          >{field.label}</Button>
        );

        break;
      default:
        return (<div key={"unknown-"+key} />);
        break;
    }
  }

  actionhandler(name) {
    // console.log('calling ' + name);
    Meteor.call(name);
  }

  toggleExpansion = () => {
    // always open? Ignore state
    if(this.props.enableCollapse==false) return {};

    // determine new state
    let newexpand = false;
    if(this.props.externalPanelId) {
      newexpand = (this.props.externalPanelId!=this.props.panelId); // use external state
    } else {
      newexpand = !this.state.expand; // use internal state
    }
    this.setState({ expand: newexpand });

    // signal parent that state has changed
    if(this.props.handleExpansion) {
      this.props.handleExpansion(this.props.panelId, newexpand);
    }
  };

  render() {
    const { classes } = this.props;

    let enablebuttons = Object.keys(this.state.changes).length>0;

    let open = false;
    if(this.props.externalPanelId) {
      open=this.props.externalPanelId==this.props.panelId;
    } else {
      open=this.state.expand==true;
    }

    return (
      <div className={classes.container}>
        <Typography variant="h5" className={classes.title}>{ this.props.title }</Typography>
        <div className={classes.details}>
          {
            this.props.fields.map((field,index) => this.getField(classes, index, field, field.controltype+'-'+index, this.actionhandler.bind(this))) // || 'control' -> because lab4
          }
          <div style={{textAlign:'center'}}>
            <Button className={classes.actionButton} disabled={!enablebuttons} variant='contained' onClick={this.apply()}>APPLY</Button>
            <Button className={classes.actionButton} disabled={!enablebuttons} variant='outlined' onClick={this.reset()}>RESET</Button>
            { this.props.delete !== false ?
                <Button className={classes.actionButton} disabled={false} variant='outlined' onClick={this.delete()}>DELETE</Button>
              :
                null
            }
          </div>
        </div>
      </div>
    );
  }
}

EditFields.propTypes = {
  title: PropTypes.string,
  fields: PropTypes.arrayOf(
            PropTypes.shape({
              fieldname: PropTypes.string,
              fieldvalue: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
                PropTypes.bool]),
              controltype: PropTypes.string,
              label: PropTypes.string
            })
          ),
  handlers: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string,
              functionname:PropTypes.func
            })
          ),
  apply: PropTypes.func,
  reset: PropTypes.func,
  delete: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.bool]),
  handleExpansion: PropTypes.func,
  panelId: PropTypes.string,
  enableCollapse: PropTypes.bool,
  startOpen: PropTypes.bool,
  externalPanelId: PropTypes.string
};

EditFields.defaultProps = {
  title: '',
  fields: [],
  handlers: [],
  panelId: 'editfields-panel',
  enableCollapse: true,
  startOpen: false,
  delete: false
}

export default withStyles(styles)(EditFields);
