import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { leaveGame, startGame } from '../../../../store/actions/gameActions';
import Chat from '../../common/chat/Chat';
import GameBoard from '../game/GameBoard'

class GameLobby extends Component {

  handleLeave = () => {
    const { currentGame, leaveGame, gameServer, setLoading } = this.props;
    setLoading(false);
    leaveGame(currentGame.gameId, gameServer);
  }

  handleStart = () => {
    const { currentGame, startGame } = this.props
    startGame(currentGame.gameId);
  }

  renderChat = () => {
    const { game } = this.props
    return <Chat chatId={game.id} chatName={game.name + ' Chat'}/>
  }

  render() {
    const { auth, game, runningGame } = this.props;
    
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
    const missingPlayer = Object.keys(game.players).length < game.numberOfPlayers;
    
    return (
      <>
        { game.status === 'PENDING' ? 
          <div className="game-lobby-container">
            <div className="game-lobby-panel">
              <div className='game'>
                <div className="game-header">
                  <h5>You are in game {game.name}</h5>
                  {players}
                  <div className="game-button">
                    {auth && auth.uid === game.creatorId &&
                      <Button variant="primary" size="sm" onClick={this.handleStart} disabled={missingPlayer}>Start</Button>}
                    <Button variant="secondary" size="sm" onClick={this.handleLeave}>Leave</Button>
                  </div>
                </div>
              </div>
            </div>
            {this.renderChat()}
          </div>
        : game.status === 'STARTED' ? 
          <GameBoard 
            runningGame={runningGame}
          />
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
    currentGame: state.firestore.data.currentGames,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    leaveGame: (gameId, gameServer) => dispatch(leaveGame(gameId, gameServer)),
    startGame: (gameId) => dispatch(startGame(gameId)),
    setLoading: (value) => dispatch({type: 'LOADING', loading: value})
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect(props => 
    [
      { collection: 'games',
        doc: props.currentGame.gameId,
        storeAs: 'game'
      },
      { collection: 'currentGames',
        doc: props.auth.uid,
        storeAs: 'currentGames'
      }
    ]
  )
)(GameLobby)
