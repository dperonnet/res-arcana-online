import React from 'react';
import ReactDOM from 'react-dom';
import DatabaseEditor from './components/DatabaseEditor';
import Game from './components/GameBoard';
import './assets/style/index.css';

class ResArcanaApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: false ? 'editor' : 'game'
    };
  }

  render() {
     return this.state.mode === 'editor' ? <DatabaseEditor /> : <Game />;
  }
}

ReactDOM.render(
  <ResArcanaApp />,
document.getElementById('root')
);
