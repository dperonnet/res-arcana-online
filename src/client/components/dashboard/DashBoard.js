import React, { Component } from 'react';
import LoginPanel from './LoginPanel'
import './dashboard.css';

export default class DashBoard extends Component {
  render() {
    const { options } = this.props;
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
