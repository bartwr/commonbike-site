/**
 *  App Routing
 */
import React from 'react'
import {render} from 'react-dom'
import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom'
import Redirect from 'react-router/Redirect'

import Settings from '/imports/api/settings.js';

import UserApp from '/imports/client/components/UserApp.jsx'
import Login from '/imports/client/containers/Login.jsx'
import Info from '/imports/client/containers/Info.jsx'
import Dashboard from '/imports/client/containers/Dashboard.jsx'
import UserWallet from '/imports/client/containers/UserWallet.jsx'
import SystemWallet from '/imports/client/containers/SystemWallet.jsx'
import OverviewPageClient from '/imports/client/containers/OverviewPageClient.jsx'
import OverviewPageAdmin from '/imports/client/containers/OverviewPageAdmin.jsx'
import AdminUsersList from '/imports/client/containers/AdminUsersList.jsx'
import ObjectDetails from '/imports/client/containers/ObjectDetails.jsx'
import LogList from '/imports/client/containers/LogList.jsx'
import SystemSettings from '/imports/client/containers/SystemSettings.jsx'
import NoMatch from '/imports/client/components/NoMatch.jsx'
import EditObject from '/imports/client/containers/EditObject.jsx'

import { ClientStorage } from 'ClientStorage';

const UserAppLogin = ({match}) => {
  // TEMPORARY because I can't find the way to get query params via react-router:
  var redirectTo = window.location.search.split('=')[1];
  return (<UserApp content={<Login redirectTo={redirectTo} />} />)
}

const UserAppInfo = () => (<UserApp content={<Info />} />)

const UserAppUserWallet = () => (<UserApp content={<div><UserWallet /></div>} />)

const UserAppOverviewPage = () => (<UserApp content={<OverviewPageClient showMap={true} showList={true} />} />)

//const UserAppOverviewPageNoMap = () => (<UserApp content={<OverviewPageAdmin showMap={false} showList={true} />} />)

const UserAppLogList = () => (<UserApp content={<LogList admin="true" />} />)

const UserAppObjectDetails = ({match}) => (<UserApp content={<ObjectDetails objectId={match.params.objectId}/>} />)

const UserAppAdminAdminUsersList = () => (<UserApp content={<AdminUsersList />} />)

const UserAppAdminOverviewPage = () => (<UserApp content={<OverviewPageAdmin showMap={true} showList={true} adminmode={true} />} />)

const UserAppAdminEditObject = ({match}) => (<UserApp content={<EditObject  objectId={match.params.objectId}/>} />)

const UserAppSystemSettings = () => (<UserApp content={<SystemSettings />} />)

const UserAppSystemWallet = () => (<UserApp content={<div><SystemWallet /></div>} />)

const RouteWhenLoggedIn = ({ component: Component, ...rest }) => {

  if(Meteor.userId()) {
    return (
      <Route {...rest} render={props => (<Component {...props}/> )}/>
    )
  } else {
    return (
      <Route {...rest} render={props => ( <Redirect to={{ pathname: '/login', state: { from: props.location }}}/> )}/>
    )
  }
}

const UserAppDashboard = () => (<UserApp content={<div><Dashboard /></div>} />)

const EVENT_REDIRECTTO = 'EVENT_REDIRECTTO'

export const RedirectTo = (path) => {
  const event = new CustomEvent(EVENT_REDIRECTTO, {
    detail: {
      path: path
    }
  })
  window.dispatchEvent(event)
}

//
class AppRoutes extends React.Component {
  constructor(props) {
    super(props);
  }
  
  onRedirectToEventHandler(event) {
    this.props.history.push(event.detail.path)
  }

  componentDidMount() {
    window.addEventListener(EVENT_REDIRECTTO, this.onRedirectToEventHandler.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener(EVENT_REDIRECTTO, this.onRedirectToEventHandler.bind(this))
  }

  // <Route path='/objects' component={UserAppOverviewPageNoMap}/>
  render() {
    return (
     <Switch>
      <Route exact path='/' component={UserAppOverviewPage }/>

      <Route exact path='/info' component={UserAppInfo}/>

      <Route path='/login' component={UserAppLogin}/>
      <Route path='/userwallet' component={UserAppUserWallet}/>
      <Route path='/object/:objectId' component={UserAppObjectDetails}/>
      <Route path='/dashboard' component={Dashboard}/>

      <RouteWhenLoggedIn path='/systemwallet' component={UserAppSystemWallet}/>

      <RouteWhenLoggedIn path='/admin/users' component={UserAppAdminAdminUsersList}/>
      <RouteWhenLoggedIn path='/admin/objects' component={UserAppAdminOverviewPage}/>
      <RouteWhenLoggedIn path='/admin/object/:objectId' component={UserAppAdminEditObject}/>
      
      <RouteWhenLoggedIn path='/systemsettings' component={UserAppSystemSettings}/>
      <RouteWhenLoggedIn path='/admin/log' component={UserAppLogList}/>

      <Route component={NoMatch}/>
     </Switch>
  )}

//  <RouteWhenLoggedIn path='/admin/rentals' component={UserAppRentalList}/>
}

const AppRoutesWithRouterContext = withRouter(AppRoutes)

//
class App extends React.Component {

  render() {
    return (
      <Router>
        <AppRoutesWithRouterContext/>
      </Router>
    )
  }
}

//
Meteor.startup(() => {
  Meteor.subscribe('settings');

  // run once to get rid of the annoying service worker errors in the console
  // navigator.serviceWorker.getRegistrations().then(function(registrations) {
	//  for(let registration of registrations) {
	//    registration.unregister()
	// } })

  render(<App/>, document.getElementById('root'))
})
