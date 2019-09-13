import React, { Component } from 'react';
import DatabaseEditor from './components/editor/DatabaseEditor';
import DashBoard from './components/dashboard/DashBoard';
import Profile from './components/common/auth/Profile';
import SignIn from './components/common/auth/SignIn';
import Register from './components/common/auth/Register';
import Play from './components/play/Play';
import Navigation from './components/navigation/Navigation';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './assets/style/index.scss';


class ResArcanaApp extends Component {
  render() {
    const gameServerUrl = `http://${process.env.REACT_APP_GAME_SERVER_URL}`

    return (
      <Router>
        <div className="bg">
          <Navigation gameServerUrl={gameServerUrl}/>
          <div className="wrapper">
            <Route exact path="/" component={DashBoard} />
            <Route path="/editor" component={DatabaseEditor} />
            <Route path='/play' render={(props) => <Play {...props} gameServerUrl={gameServerUrl} />}/>
            <Route path="/signIn" component={SignIn} />
            <Route path="/register" component={Register} />
            <Route path="/profile" component={Profile} />
          </div>
        </div>
      </Router>
    );
  }
}

export default ResArcanaApp;
