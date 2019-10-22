import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import DatabaseEditor from './components/editor/DatabaseEditor'
import DashBoard from './components/dashboard/DashBoard'
import Profile from './components/common/auth/Profile'
import SignIn from './components/common/auth/SignIn'
import Register from './components/common/auth/Register'
import Play from './components/play/Play'
import Navigation from './components/navigation/Navigation'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import './assets/style/index.scss'

class ResArcanaApp extends Component {
  render() {
    const { auth } = this.props
    const gameServerUrl = `https://${process.env.REACT_APP_GAME_SERVER_URL}`

    let routes

    if (!isLoaded(auth)) {
      routes = null
    } else {
      routes = (
        <div className="wrapper">
          <Route exact path="/" component={DashBoard} />
          <Route path="/editor" component={DatabaseEditor} />
          <Route path="/play" render={props => <Play {...props} gameServerUrl={gameServerUrl} />} />
          <Route path="/signIn" component={SignIn} />
          <Route path="/register" component={Register} />
          <Route path="/profile" component={Profile} />
        </div>
      )
    }

    return (
      <Router>
        <div className="bg">
          <Navigation gameServerUrl={gameServerUrl} />
          {routes}
        </div>
      </Router>
    )
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
  }
}

export default compose(connect(mapStateToProps))(ResArcanaApp)
