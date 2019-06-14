import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';

class GameBoard extends Component {
    render() {
    const { game, runningGame } = this.props;
    
    if (!isLoaded(game)) {
      return <div className="loading">Loading...</div> 
    }

    return (
      <div className="game-board">
        {game.status === 'STARTED' && runningGame && (
          <runningGame.app
            gameID={runningGame.gameID}
            playerID={runningGame.playerID}
            credentials={runningGame.credentials}
          />
        )}
      </div>
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