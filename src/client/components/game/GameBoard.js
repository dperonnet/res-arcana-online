import React, { Component } from 'react';
import { Client } from "boardgame.io/react";
import { ResArcana } from './Game';
import { ResArcanaBoard } from './Board';

const ResArcanaClient = Client({
  game: ResArcana,
  board: ResArcanaBoard,
  debug: true,
  multiplayer: { server: "localhost:8000" },
  numPlayers: 3
});

export class GameBoard extends Component {
  state = { playerID: null };

  render() {
    if (this.state.playerID === null) {
      return (
        <div>
          <p>Play as</p>
          <button onClick={() => this.setState({ playerID: "0" })}>
            Player 0
          </button>
          <button onClick={() => this.setState({ playerID: "1" })}>
            Player 1
          </button>
          <button onClick={() => this.setState({ playerID: "2" })}>
            Player 2
          </button>
        </div>
      );
    }
    return (
      <div>
        <ResArcanaClient playerID={this.state.playerID} />
      </div>
    );
  }
}
