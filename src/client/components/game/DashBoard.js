import React, { Component } from 'react';
import GameBoard from './GameBoard';
import LoginPanel from './components/LoginPanel'
import '../../assets/style/dashboard.css';

export default class DashBoard extends Component {
  render() {
    const { history, options } = this.props;
    return (
      <div className="container">
        <LoginPanel
          onClick={i => this.handlePlayerSetup(i)}
          options={options}
        />
      </div>
    );
  }
}
