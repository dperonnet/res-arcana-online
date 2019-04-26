import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { Client } from "boardgame.io/react";
import { ResArcana } from './Game';
import { ResArcanaBoard } from './Board';

const ResArcanaClient = Client({
  game: ResArcana,
  board: ResArcanaBoard,
  debug: true,
  multiplayer: { server: "localhost:8000" },
  //multiplayer: { local: true },
  numPlayers: 3
});

export class GameBoard extends Component {
  state = { playerID: null };

  render() {
    if (this.state.playerID === null) {
      return (
        <Container className="gameBoard">
          <div className="board">
            <p>Play as</p>
            <button onClick={() => this.setState({ playerID: "0" })}>
              Player 1
            </button>
            <button onClick={() => this.setState({ playerID: "1" })}>
              Player 2
            </button>
            <button onClick={() => this.setState({ playerID: "2" })}>
              Player 3
            </button>
            <button onClick={() => this.setState({ playerID: "3" })}>
              Player 4
            </button>
          </div>
        </Container>
      );
    }
    return (
      <Container className="gameBoard">
        <ResArcanaClient playerID="0" />
        <ResArcanaClient playerID="1" />
        <ResArcanaClient playerID="2" />
        <ResArcanaClient playerID="3" />
      </Container>
    );
  }
}
