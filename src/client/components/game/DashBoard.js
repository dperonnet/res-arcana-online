import React, { Component } from 'react';
import GameBoard from './GameBoard';
import LoginPanel from './components/LoginPanel'
import './Game.css';

export default class DashBoard extends Component {
  render() {
    const { history, options } = this.props;
    return (
      <div className="container">
        <div className="topPanel">
          <LoginPanel
            onClick={i => this.handlePlayerSetup(i)}
            options={options}
          />
        </div>
        <div className="centerPanel">
          
        </div>
      </div>
    );
  }
}
