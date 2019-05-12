import React, { Component } from 'react';
import CreateGame from './CreateGame';
import GameList from './GameList';
import './lobby.css';
import { connect } from 'react-redux';
import { getCurrentGameId } from '../../../../store/actions/gameActions';

class Lobby extends Component {
  render() {
    const { games } = this.props;
    return (
      <div className="lobbyContainer">
        <CreateGame/>
        <GameList
          games={games}/>
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
