import React, { Component } from 'react';
import CreateGame from './CreateGame';
import GameList from './GameList';
import './loby.css';

class Loby extends Component {

  render() {
    const { games } = this.props;
    return (
      <div className="joinGameContainer">
        <CreateGame />
        <GameList games={games}/>
      </div>
    );
  }

}

export default Loby;
