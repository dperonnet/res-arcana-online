import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Lobby from "./lobby/Lobby";
import './play.css';
import { connect } from 'react-redux';
import { ResArcanaGame } from './game/Game';
import ResArcanaBoard from './game/Board';

ResArcanaGame.minPlayers = 1;
ResArcanaGame.maxPlayers = 4;

const importedGames = [
  { game: ResArcanaGame, board: ResArcanaBoard }
];
  
class Play extends Component {
  render() {
    const { auth, gameServerUrl } = this.props;

    if(!auth.uid) return <Redirect to='/signIn'/>

    return (
      <Container className="play-container">
        <Lobby 
          gameServer={gameServerUrl}
          lobbyServer={gameServerUrl}
          gameComponents={importedGames}
          debug={false}/>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
  }
}

export default connect(mapStateToProps)(Play)