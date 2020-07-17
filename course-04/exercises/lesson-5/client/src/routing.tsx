import React from 'react'
import Auth from './auth/Auth'
import { Router, Route } from 'react-router-dom'
import Callback from './components/Callback'
import createHistory from 'history/createBrowserHistory'
import App from './App';
const history = createHistory()

const auth = new Auth(history)

const handleAuthentication = (props: any) => {
  const location = props.location
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication()
  }
}

export const makeAuthRouting = () => {
  return (
    <Router history={history}>
      <div>
        {/* Process redirect from Auth0 */}
        <Route
          path="/callback"
          render={props => {
            handleAuthentication(props)
            return <Callback />
          }}
        />
        {/* Route to process any other URL */}
        <Route
          render={props => {
            return <App auth={auth} {...props} />
          }}
        />
        {/* <Route path="/" render={(props) => <App auth={auth} {...props} />} />
          <Route path="/home" render={(props) => <Home auth={auth} {...props} />} /> */}
      </div>
    </Router>
  )
}
