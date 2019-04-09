import React, { Component } from 'react';
import DatabaseEditor from './components/editor/DatabaseEditor';
import DashBoard from './components/dashboard/DashBoard';
import './assets/style/index.css';

export default class ResArcanaApp extends Component {
  constructor(props) {
    super(props);
    const modeEdition = false;
    this.state = {
      mode: modeEdition ? 'editor' : 'game'
    };
  }

  render() {
    const { mode } = this.state;
    return mode === 'editor' ? <DatabaseEditor /> : <DashBoard />;
  }
}
