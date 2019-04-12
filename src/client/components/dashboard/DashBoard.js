import React, { Component } from 'react';
import SideBar from './sidebar/SideBar';
import './dashboard.css';

export default class DashBoard extends Component {
  render() {
    return (
      <>
        <SideBar />
        <div className="container">
        </div>
      </>
    );
  }
}
