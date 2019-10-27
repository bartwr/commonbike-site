/**
 *  App Routing
 */
import React from 'react'
import {render} from 'react-dom'
import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom'
import Redirect from 'react-router/Redirect'

import Settings from '/imports/api/settings.js';
import BikeCoin from '/imports/api/bikecoin.js'

import UserApp from '/imports/client/components/UserApp.jsx'
import Login from '/imports/client/containers/Login.jsx'
import UserWallet from '/imports/client/containers/UserWallet.jsx'
// import LocationsMap from '/imports/client/components/LocationsMap.jsx'
import OverviewPage from '/imports/client/containers/OverviewPage.jsx'
import AdminUsersList from '/imports/client/containers/AdminUsersList.jsx'
import ObjectList from '/imports/client/containers/ObjectList.jsx'
import ObjectDetailsOld from '/imports/client/containers/ObjectDetailsOld.jsx'
import LogList from '/imports/client/containers/LogList.jsx'
import PaymentOrder from '/imports/client/components/PaymentOrder.jsx'
import SystemSettings from '/imports/client/containers/SystemSettings.jsx'
import NoMatch from '/imports/client/components/NoMatch.jsx'

const UserAppLogin = ({match}) => {
  // TEMPORARY because I can't find the way to get query params via react-router:
  var redirectTo = window.location.search.split('=')[1];
  return (<UserApp content={<Login redirectTo={redirectTo} />} />)
}
const UserAppUserWallet = () => (<UserApp content={<div><UserWallet /></div>} />)

// const UserAppLocationsMap = () => (<UserApp content={<LocationsMap />} />)
const UserAppOverviewPage = () => (<UserApp content={<OverviewPage showMap={true} showList={true} />} />)

const UserAppObjectList = () => (<UserApp content={<OverviewPage showMap={false} showList={true} />} />)

const UserAppLogList = () => (<UserApp content={<LogList admin="true" />} />)

const UserAppRentalList = () => (<UserApp content={<ObjectList rentalsMode={true} showState={true} showRentalDetails={true} />} />)

const UserAppObjectDetails = ({match}) => {
  return (
    <UserApp content={<ObjectDetailsOld objectId={match.params.objectId}/>} />
  )
}
const UserAppAdminPageObjectDetails = ({match}) => {
  return (
    <UserApp content={<ObjectDetailsOld isEditable="true" objectId={match.params.objectId}/>} />
  )
}

const UserAppObjectDetailsCheckin = ({match}) => {
  return (
    <UserApp content={<ObjectDetailsOld objectId={match.params.objectId} checkedIn={true}/>} />
  )
}

const UserAppAdminAdminUsersList = () => (<UserApp content={<AdminUsersList />} />)

const UserAppSystemSettings = () => (<UserApp content={<SystemSettings />} />)


const RouteWhenLoggedIn = ({ component: Component, ...rest }) => {

  if(Meteor.userId()) {
//    console.log('route when logged in - render normal ', Meteor.userId());
    return (
      <Route {...rest} render={props => (<Component {...props}/> )}/>
    )
  } else {
//    console.log('route when logged in - render redirect ', Meteor.userId());
    return (
      <Route {...rest} render={props => ( <Redirect to={{ pathname: '/login', state: { from: props.location }}}/> )}/>
    )
  }
}

// see: https://react-router.now.sh/auth-workflow
const RouteWhenAdmin = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    Roles.userIsInRole(Meteor.userId(), 'admin') ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
)

//
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
      <Route path='/objects' component={UserAppObjectList}/>
      <Route path='/wallet' component={UserAppUserWallet}/>
      <Route path='/bike/details/:objectId' component={UserAppObjectDetails}/>

      <RouteWhenLoggedIn path='/bike/checkin/:objectId' component={UserAppObjectDetailsCheckin}/>

      <RouteWhenLoggedIn path='/payment/:internalPaymentId' component={PaymentOrder}/>

      <RouteWhenLoggedIn path='/admin/rentals' component={UserAppRentalList}/>
      <RouteWhenLoggedIn path='/admin/bike/details/:objectId' component={UserAppAdminPageObjectDetails}/>

      <RouteWhenLoggedIn path='/admin/users' component={UserAppAdminAdminUsersList}/>
      <RouteWhenLoggedIn path='/systemsettings' component={UserAppSystemSettings}/>
      <RouteWhenLoggedIn path='/admin/log' component={UserAppLogList}/>

      <Route component={NoMatch}/>
     </Switch>
  )}
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
