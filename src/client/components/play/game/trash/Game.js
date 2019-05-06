import React, { Component } from 'react';
import PlayerSetup from './settings/PlayerSetup';
import GameBoard from './GameBoard';
import './Game.css';

export default class Game extends Component {
  static initGameComponents(playerNumber) {
    const monuments = Array(8).fill(null);
    const placesOfPower = Array(5).fill(null);
    const magicItems = Array(8).fill(null);
    const commonBoard = {
      monuments,
      placesOfPower,
      magicItems
    };
    const playerBoards = Array(playerNumber).fill(null);
    const gameComponents = {
      commonBoard,
      playerBoards
    };
    return gameComponents;
  }

  constructor(props) {
    super(props);
    this.state = {
      options: {
        cardSize: 'smallCard',
        playerNumber: 0,
      },
      history: [],
    };
  }

  handlePlayerSetup(i) {
    const firstTurn = Game.initGameComponents(i);
    const { options, history } = this.state;
    options.playerNumber = i;
    const newHistory = history.slice(history.length - 1, 0, firstTurn);
    this.setState({ options, history: newHistory });
  }

  render() {
    const { history, options } = this.state;
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
