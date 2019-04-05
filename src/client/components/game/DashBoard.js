import React, { Component } from 'react';
import PlayerSetup from './settings/PlayerSetup';
import GameBoard from './GameBoard';
import './Game.css';

export default class Game extends Component {
  render() {
    const { history, options } = this.props;
    return (
      <div className="container">
        <div className="topPanel">
          <PlayerSetup
            onClick={i => this.handlePlayerSetup(i)}
            options={options}
          />
        </div>
        <div className="centerPanel">
          <GameBoard
            options={options}
            history={history}
          />
        </div>
      </div>
    );
  }
}
