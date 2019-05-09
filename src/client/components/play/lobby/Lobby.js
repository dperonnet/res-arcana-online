import React, { Component } from 'react';
import CreateGame from './CreateGame';
import GameList from './GameList';
import GameLobby from './GameLobby';
import './lobby.css';
import { connect } from 'react-redux';
import { getCurrentGameId } from '../../../../store/actions/gameActions';

class Lobby extends Component {

  handleJoin = (gameId) => {
    this.setState({gameId})
  }

  render() {
    const { games, userGame } = this.props;
    return (
      <div className="joinGameContainer">
        <CreateGame
          onJoin={this.handleJoin}/>
        <GameList
          games={games}
          onJoin={this.handleJoin}/>
        {userGame && userGame.gameId && <GameLobby gameId={userGame.gameId}/>}
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


const mapDispatchToProps = dispatch => {
  return {
    getCurrentGameId: (playerId) => dispatch(getCurrentGameId(playerId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)
