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
import ContentPage from '/imports/client/components/ContentPage.jsx'
import Login from '/imports/client/components/Login.jsx'
import CustomPage from '/imports/client/components/CustomPage.jsx'
import Profile from '/imports/client/components/Profile.jsx'
import UserWallet from '/imports/client/containers/UserWallet.jsx'
// import LocationsMap from '/imports/client/components/LocationsMap.jsx'
import LocationsOverview from '/imports/client/containers/LocationsOverview.jsx'
import AdminUsersList from '/imports/client/containers/AdminUsersList.jsx'
import ObjectList from '/imports/client/containers/ObjectList.jsx'
import ObjectDetails from '/imports/client/containers/ObjectDetails.jsx'
import AdminTools from '/imports/client/components/AdminTools.jsx'
import LogList from '/imports/client/containers/LogList.jsx'
import PaymentOrder from '/imports/client/components/PaymentOrder.jsx'
import NoMatch from '/imports/client/components/NoMatch.jsx'

const UserAppLogin = ({match}) => {
  // TEMPORARY because I can't find the way to get query params via react-router:
  var redirectTo = window.location.search.split('=')[1];
  return (<UserApp content={<CustomPage><Login redirectTo={redirectTo} /></CustomPage>} />)
}
const UserAppProfile = () => (<UserApp content={<div><Profile isEditable="true" /></div>} />)
const UserAppUserWallet = () => (<UserApp content={<div><UserWallet /></div>} />)

// const UserAppLocationsMap = () => (<UserApp content={<LocationsMap />} />)
const UserAppLocationsOverview = () => (<UserApp content={<LocationsOverview />} />)

const UserAppObjectList = () => (<UserApp content={<ObjectList showPrice={true} showState={true} />} />)

const AdminAppLogList = () => (<UserApp content={<LogList admin="true" />} />)

const UserAppRentalList = () => (<UserApp content={<ObjectList rentalsMode={true} showState={true} showRentalDetails={true} />} />)

const UserAppCustomPageObjectDetails = ({match}) => {
  return (
    <UserApp content={<CustomPage backgroundColor="#fff"><ObjectDetails objectId={match.params.objectId}/></CustomPage>} />
  )
}
const UserAppCustomAdminPageObjectDetails = ({match}) => {
  return (
    <UserApp content={<CustomPage backgroundColor="#f9f9f9"><ObjectDetails isEditable="true" objectId={match.params.objectId}/></CustomPage>} />
  )
}

const UserAppCustomPageObjectDetailsCheckin = ({match}) => {
  return (
    <UserApp content={<CustomPage backgroundColor="#f9f9f9"><ObjectDetails objectId={match.params.objectId} checkedIn={true}/></CustomPage>} />
  )
}

const UserAppAdminAdminUsersList = () => (<UserApp content={<AdminUsersList />} />)
const UserAppAdminAdminTools = () => (<UserApp content={<AdminTools />} />)

// see: https://react-router.now.sh/auth-workflow
const RouteWhenLoggedIn = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    Meteor.userId() ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
    )
  )}/>
)

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
      <Route exact path='/' component={UserAppLocationsOverview}/>

      <Route path='/login' component={UserAppLogin}/>
      <Route path='/objects' component={UserAppObjectList}/>
      <Route path='/wallet' component={UserAppUserWallet}/>
      <Route path='/bike/details/:objectId' component={UserAppCustomPageObjectDetails}/>

      <RouteWhenLoggedIn path='/profile' component={UserAppProfile}/>
      <RouteWhenLoggedIn path='/bike/checkin/:objectId' component={UserAppCustomPageObjectDetailsCheckin}/>

      <RouteWhenLoggedIn path='/payment/:internalPaymentId' component={PaymentOrder}/>

      <RouteWhenLoggedIn path='/admin/rentals' component={UserAppRentalList}/>
      <RouteWhenLoggedIn path='/admin/bike/details/:objectId' component={UserAppCustomAdminPageObjectDetails}/>

      <RouteWhenAdmin path='/admin/users' component={UserAppAdminAdminUsersList}/>
      <RouteWhenAdmin path='/admin/admintools' component={UserAppAdminAdminTools}/>
      <RouteWhenLoggedIn path='/admin/log' component={AdminAppLogList}/>

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
