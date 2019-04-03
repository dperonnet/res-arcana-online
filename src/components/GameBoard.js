import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import TextCard from './Cards';
import '../assets/style/game.css';

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        cardSize: "smallCard",
        playerNumber : 0,
      },
      history: [],
    };
  }

  handlePlayerSetup(i) {
    const options = {...this.state.options};
    options.playerNumber = i;
    const firstTurn = initGameComponents(i);
    const history = this.state.history.slice(this.state.history.length-1, 0, firstTurn);
    console.log(this.state);
    this.setState({options: options, history: history});
  }

  render() {
    const history = this.state.history;
    const currentTurn = history.length > 0 ? history[history.length - 1] : null;

    return (
      <div className="container">
        <div className="topPanel">
          <PlayerSetup
            onClick={(i) => this.handlePlayerSetup(i)}
            options={this.state.options}
          />
        </div>
        <div className="centerPanel">
          <CommonBoard />
          <PlayersBoard
            options={this.state.options}
            turn={currentTurn}
          />
        </div>
      </div>
    );
  }
}

class PlayerSetup extends Component {
  render() {
    const playerNumbers = [2,3,4];
    const selectPlayers = playerNumbers.map((key, index) => {
      return (
        <PlayerButton
          key={index}
          playerNumber={key}
          onClick={() => this.props.onClick(key)}
        />
      );
    });
    return (
      <div>
        <h3>
          Player Number selected : {this.props.options.playerNumber}
        </h3>
        {selectPlayers}
      </div>
    );
  }
}

function CommonBoard() {
  return (
    <div className="commonBoardPannel">
      <div>Objets Magiques</div>
      <div>Lieu de puissance</div>
      <div>Monuments</div>
    </div>
  );
}

function PlayerButton(props) {
  return (
    <Button className="ml-3" variant="secondary" onClick={props.onClick}>
      {props.playerNumber} players
    </Button>
  );
}

function initGameComponents(playerNumber) {
  let monuments = Array(8).fill(null);
  let placesOfPower = Array(5).fill(null);
  let magicItems = Array(8).fill(null);
  let commonBoard = {
    monuments: monuments,
    placesOfPower: placesOfPower,
    magicItems: magicItems
  };
  let playerBoards = Array(playerNumber).fill(null);
  let gameComponents = {
    commonBoard: commonBoard,
    playerBoards: playerBoards
  }
  return gameComponents;
}

class PlayersBoard extends Component {
  constructor(props) {
    super(props);
    this.playAction = this.playAction.bind(this);
    this.passAction = this.passAction.bind(this);
  }

  playAction(event) {}

  passAction(event) {}

  render() {
    const playerNumber = this.props.options.playerNumber;
    const players = Array.from(new Array(playerNumber));
    console.log(players);
    return true ? (
      <div className="playersBoardPannel">
        <span> playerNumber = {playerNumber} !</span>
        {players.map((player, index) => (
          <PlayerBoard
            key={index}
            player={player}
            playAction={this.playAction}
            passAction={this.passAction} />
        ))}
      </div>
    ):(
      <div className="playersBoardPannel">
        <TextCard options={this.props.options} />
      </div>
    );
  }
}

function PlayerBoard(props) {
  return (
    <div>
      <div className="mb-3">
        <Button className="mr-3" variant="secondary" id={props.playerId+'Play'}
          onClick={(e) => props.playAction()}><span>Play</span></Button>
        <Button className="mr-3" variant="secondary" id={props.playerId+'Pass'}
          onClick={(e) => props.passAction()}><span>Pass</span></Button>
      </div>
    </div>
  );
}
