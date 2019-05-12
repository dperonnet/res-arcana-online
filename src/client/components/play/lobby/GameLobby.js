import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase';

class GameLobby extends Component {
  render() {
    const { game } = this.props;
    console.log('game',game)
    if (!isLoaded(game)) {
      return <div className="loading">Loading...</div> 
    }
    if (isEmpty(game)) {
      return <div>Game is empty</div>
    }
    
    const players = Object.entries(game.players).map((player) => {
      console.log('player',player)
      return (
        <div className="player" key={player[0]}>{player[1]}</div>
      )
    });
    console.log('this.props',this.props)
    
    return (
      <div className="gameLobbyContainer">
        <div className="gameLobbyPanel">
          <div className='game'>
            <div className="gameHeader">
              <h5>You are in game {game.name}</h5>
              {players}
            </div>
          </div>
        </div>
      </div>
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
  firestoreConnect(props => { console.log('props', props); return [
    { collection: 'games',
      doc: props.currentGame.gameId,
      storeAs: 'game'
    },
  ]})
)(GameLobby)
