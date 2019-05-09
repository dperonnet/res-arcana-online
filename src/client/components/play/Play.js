import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import GameLobby from "./lobby/GameLobby";
import Lobby from "./lobby/Lobby";
import './play.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import moment from 'moment';

class Play extends Component {
  render() {
    const { auth, currentGame } = this.props;
    if(!auth.uid) return <Redirect to='/signIn'/>
    console.log('currentGame && currentGame.gameId', currentGame);
    if(currentGame) console.log('currentGame.gameId', currentGame.gameId)
    return (
      <Container className="playContainer">
        {
          currentGame ? (
            currentGame.gameId != null ?
            <GameLobby /> : <><Lobby /><div>currentGame.gameId : {currentGame.gameId}</div></>
          ) : <div className="loading">Loading...</div>
        }
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
  firestoreConnect((props) => {
    console.log('props',props)
    return [
    { collection: 'currentGames',
      doc: props.auth.uid,
      storeAs: 'currentGame'
    }
  ]}
))(Play)
