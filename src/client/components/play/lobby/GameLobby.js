import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';

class GameLobby extends Component {
  render() {
    const { currentGame, games } = this.props;
    console.log('games',games);
    console.log('this.props',this.props)
    return (
      <div className="gameLoby">
        <div className='game'>
          <div className="gameHeader">
            <h5>You are in game {currentGame.gameId}</h5>
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
  firestoreConnect(props => { console.log('props',props); return [
    { collection: 'games',
      doc: props.currentGame.gameId,
      storeAs: 'game'
    },
  ]})
)(GameLobby)
