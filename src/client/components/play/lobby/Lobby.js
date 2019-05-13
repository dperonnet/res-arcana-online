import React, { Component } from 'react';
import CreateGame from './CreateGame';
import GameList from './GameList';
import './lobby.css';

class Lobby extends Component {
  render() {
    return (
      <div className="lobbyContainer">
        <CreateGame/>
        <GameList/>
      </div>
    );
  }
}

export default Lobby
