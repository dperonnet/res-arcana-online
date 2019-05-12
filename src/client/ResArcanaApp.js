import React, { Component } from 'react';
import DatabaseEditor from './components/editor/DatabaseEditor';
import DashBoard from './components/dashboard/DashBoard';
import SignIn from './components/common/auth/SignIn';
import Register from './components/common/auth/Register';
import Play from './components/play/Play';
import Navigation from './components/navigation/Navigation';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './assets/style/index.css';

class ResArcanaApp extends Component {

  render() {
    return (
      <Router>
        <div className="bg">
          <Navigation />
          <div className="wrapper">
            <Route exact path="/" component={DashBoard} />
            <Route path="/editor" component={DatabaseEditor} />
            <Route path='/play' component={Play} />
            <Route path="/signIn" component={SignIn} />
            <Route path="/register" component={Register} />
          </div>
        </div>
      </Router>
    );
  }
}

export default ResArcanaApp;
