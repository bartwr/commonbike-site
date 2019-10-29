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
import UserWallet from '/imports/client/containers/UserWallet.jsx'
import SystemWallet from '/imports/client/containers/SystemWallet.jsx'
import OverviewPage from '/imports/client/containers/OverviewPage.jsx'
import AdminUsersList from '/imports/client/containers/AdminUsersList.jsx'
import ObjectDetails from '/imports/client/containers/ObjectDetails.jsx'
import LogList from '/imports/client/containers/LogList.jsx'
import SystemSettings from '/imports/client/containers/SystemSettings.jsx'
import NoMatch from '/imports/client/components/NoMatch.jsx'

const UserAppLogin = ({match}) => {
  // TEMPORARY because I can't find the way to get query params via react-router:
  var redirectTo = window.location.search.split('=')[1];
  return (<UserApp content={<Login redirectTo={redirectTo} />} />)
}
const UserAppUserWallet = () => (<UserApp content={<div><UserWallet /></div>} />)

const UserAppOverviewPage = () => (<UserApp content={<OverviewPage showMap={true} showList={true} />} />)

const UserAppOverviewPageNoMap = () => (<UserApp content={<OverviewPage showMap={false} showList={true} />} />)

const UserAppLogList = () => (<UserApp content={<LogList admin="true" />} />)

const UserAppObjectDetails = ({match}) => {
  return (
    <UserApp content={<ObjectDetails objectId={match.params.objectId}/>} />
  )
}

const UserAppAdminAdminUsersList = () => (<UserApp content={<AdminUsersList />} />)

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
  onRedirectToEventHandler(event) {
    this.props.history.push(event.detail.path)
  }

  componentDidMount() {
    window.addEventListener(EVENT_REDIRECTTO, this.onRedirectToEventHandler.bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener(EVENT_REDIRECTTO, this.onRedirectToEventHandler.bind(this))
  }

  //
  render() {
    return (
     <Switch>
      <Route exact path='/' component={UserAppOverviewPage}/>

      <Route path='/login' component={UserAppLogin}/>
      <Route path='/objects' component={UserAppOverviewPageNoMap}/>
      <Route path='/userwallet' component={UserAppUserWallet}/>
      <Route path='/bike/:objectId' component={UserAppObjectDetails}/>

      <RouteWhenLoggedIn path='/systemwallet' component={UserAppSystemWallet}/>

      <RouteWhenLoggedIn path='/admin/users' component={UserAppAdminAdminUsersList}/>
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
