import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { startGame } from '../../../../store/actions/gameActions';
import GameBoard from '../game/GameBoard'

class GameLobby extends Component {

  startGame = () => {
    const { currentGame, startGame } = this.props
    startGame(currentGame.gameId);
  }

  render() {
    const { game } = this.props;
    if (!isLoaded(game)) {
      return <div className="loading">Loading...</div> 
    }
    if (isEmpty(game)) {
      return <div>Game is empty</div>
    }
    
    const players = game.players && Object.values(game.players).map((player) => {
      return (
        <div className="player" key={player.id}>{player.name}</div>
      )
    });
    
    return (
      <>
        { game.status === 'PENDING' ? 
          <div className="gameLobbyContainer">
            <div className="gameLobbyPanel">
              <div className='game'>
                <div className="gameHeader">
                  <h5>You are in game {game.name}</h5>
                  {players}
                  <div className="gameButton">
                    <Button variant="secondary" size="sm" onClick={this.startGame}>Start</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        : game.status === 'STARTED' ? 
          <>
            <h5>Game Started</h5>
            <GameBoard />
          </>
        : game.status === 'OVER' ? 
          <h5>Game Over</h5>
        : null
        }
      </>
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

const mapDispatchToProps = (dispatch) => {
  return {
    startGame: (gameId) => dispatch(startGame(gameId))
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect(props =>  [
    { collection: 'games',
      doc: props.currentGame.gameId,
      storeAs: 'game'
    },
  ])
)(GameLobby)
