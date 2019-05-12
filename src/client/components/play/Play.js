import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import GameLobby from "./lobby/GameLobby";
import Lobby from "./lobby/Lobby";
import './play.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase';

class Play extends Component {
  render() {
    const { auth, currentGame } = this.props;
    console.log('this.props', this.props)

    if(!auth.uid) return <Redirect to='/signIn'/>

    if (!isLoaded(currentGame)) {
      return <div className="loading">Loading...</div> 
    }
    if (isEmpty(currentGame)) {
      return <div>Not in game</div>
    }    
    return (
      <Container className="playContainer">
        {currentGame.gameId ? <GameLobby /> : <Lobby />}
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect(props => [
    { collection: 'currentGames',
      doc: props.auth.uid,
      storeAs: 'currentGame'
    }
  ])
)(Play)