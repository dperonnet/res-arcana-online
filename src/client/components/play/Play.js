import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import GameLobby from "./lobby/GameLobby";
import Lobby from "./lobby/Lobby";
import './play.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';

class Play extends Component {
  render() {
    const { auth, currentGame } = this.props;
    if(!auth.uid) return <Redirect to='/signIn'/>

    return (
      <Container className="playContainer">
        {(currentGame && currentGame.gameId) ?
          <GameLobby /> : <Lobby />}
      </Container>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame
  }
}

export default
compose(
  connect(mapStateToProps),
  firestoreConnect((props) => [
    { collection: 'currentGames',
      doc: props.auth.uid,
      storeAs: 'currentGame'
    }
  ]
))(Play)
