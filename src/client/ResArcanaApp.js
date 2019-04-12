import React, { Component } from 'react';
import DatabaseEditor from './components/editor/DatabaseEditor';
import DashBoard from './components/dashboard/DashBoard';
import GameBoard from './components/game/GameBoard';
import Navigation from './components/navigation/Navigation';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './assets/style/index.css';

export default class ResArcanaApp extends Component {
  render() {
    return (
      <Router>
        <div className="bg">
          <Navigation />
          <div className="wrapper">
            <Route exact path="/" component={DashBoard} />
            <Route path="/editor" component={DatabaseEditor} />
            <Route path="/game" component={GameBoard} />
          </div>
        </div>
      </Router>
    );
  }
}
