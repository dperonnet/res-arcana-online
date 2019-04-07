import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import TextCard from './components/TextCard';
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:8000');

export default class PlayersBoard extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: {}
    };
  }

  playAction = (event) => {
    console.log(event);
    socket.emit('chat message', 'YEAH');
  }

  passAction = (event) => {
    console.log('passAction');
    console.log(event);
  }

  render() {
    const { options } = this.props;
    const players = Array.from(new Array(options.playerNumber));
    return players ? (
      <div className="playersBoardPannel">
        <div className="App">
          <p className="App-intro">
          This is the timer value: {this.state.timestamp}
          </p>
        </div>
        <span>
          {' '}
userNumber =
          {options.playerNumber}
          {' '}
!
        </span>
        {players.map(player => (
          <PlayerBoard
            key={player}
            player={player}
            playAction={this.playAction}
            passAction={this.passAction}
          />
        ))}
      </div>
    ) : (
      <div className="playersBoardPannel">
        <TextCard options={options} />
      </div>
    );
  }
}

function PlayerBoard(props) {
  const { player } = props;
  return (
    <div>
      <div className="mb-3">
        <Button
          className="mr-3"
          variant="secondary"
          id={`${player}Play`}
          onClick={e => props.playAction(e)}
        >
          <span>Do</span>
        </Button>
        <Button
          className="mr-3"
          variant="secondary"
          id={`${player}Pass`}
          onClick={e => props.passAction(e)}
        >
          <span>Pass</span>
        </Button>
      </div>
    </div>
  );
}
