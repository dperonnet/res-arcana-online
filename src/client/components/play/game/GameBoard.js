import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { Client } from "boardgame.io/react";
import { ResArcana } from './Game';
import { ResArcanaBoard } from './Board';
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';

class GameBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      debug: false,
      clientFactory: Client,
    }
  };
  
  buildGame = (gameId, playerId, numPlayers) => {
    console.log('######### buildGame with', numPlayers)
    let multiplayer = undefined;
    if (numPlayers > 1) {
      multiplayer = { server: "localhost:8000" };
    }

    const app = this.state.clientFactory({
      game: ResArcana,
      board: ResArcanaBoard,
      numPlayers: numPlayers,
      multiplayer,
      debug: true,
      enhancer: applyMiddleware(logger),
    });

    const game = {
      app: app,
      gameID: gameId,
      playerID: playerId ? playerId : null
    };

    return <game.app gameID={gameId} playerID={playerId} numPlayers={numPlayers} />
  }

  render() {
    const { auth, currentGame, game } = this.props;
    
    if (!isLoaded(game)) {
      return <div className="loading">Loading...</div> 
    }
    console.log('GameBoard rendered with game',game)

    const gameId = currentGame.gameId;
    const playerId = game.players[auth.uid] ? game.players[auth.uid].id.toString() : 'spectator';
    const numPlayers = Object.keys(game.players).length;
    const client = game.status === 'STARTED' ? this.buildGame(gameId, playerId, numPlayers) : null

    return (
      <Container className="gameBoard">
        <div>game : {currentGame.gameId} / player {playerId}</div>
        {client}
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0]
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect(props => [
    { collection: 'games',
      doc: props.currentGame.gameId,
      storeAs: 'game'
    },
  ])
)(GameBoard)