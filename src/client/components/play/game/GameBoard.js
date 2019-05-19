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
  
  render() {
    const { auth, currentGame, game } = this.props;
    console.log('currentGame.gameId', currentGame.gameId)
    if (!isLoaded(game)) {
      return <div className="loading">Loading...</div> 
    }
    const playerId = game.players[auth.uid] ? game.players[auth.uid].id.toString() : 'spectator';
    const num = Object.keys(game.players).length
    console.log('num',num)
    
    const ResArcanaClient = Client({
      game: ResArcana,
      board: ResArcanaBoard,
      debug: true,
      multiplayer: { server: "localhost:8000" },
      //multiplayer: { local: true },
      numPlayers: num,
      enhancer: applyMiddleware(logger)
    });

    return (
      <Container className="gameBoard">
        <div>game : {currentGame.gameId} / player {playerId}</div>
          <ResArcanaClient gameID={currentGame.gameId} playerID={playerId} />
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame,
    game: state.firestore.data.game
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect(props =>  [
    { collection: 'games',
      doc: props.currentGame.gameId,
      storeAs: 'game'
    },
  ])
)(GameBoard)