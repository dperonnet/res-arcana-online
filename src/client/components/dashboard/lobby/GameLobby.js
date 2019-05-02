import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';

class GameLobby extends Component {
  render() {
    return (
      <div className="gameLoby">
        <div className='game'>
          <div className="gameHeader">
            <h5>Create new game</h5>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    games: state.firestore.ordered.games,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect(props => [
    {
      collection: 'games',
      doc: props.auth.uid
    }
  ])
)(GameLobby)
