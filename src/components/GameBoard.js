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
      }
    };
  }

  handlePlayerSetup(i) {
    const options = {...this.state.options};
    options.playerNumber = i;
    this.setState({options});
  }

  render() {
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
          />
        </div>
      </div>
    );
  }
}

class PlayerSetup extends Component {
  constructor(props) {
    super(props);
  }

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

class PlayersBoard extends Component {
  constructor(props) {
    super(props);
    this.playAction = this.playAction.bind(this);
    this.passAction = this.passAction.bind(this);
  }

  playAction(event) {

  }

  passAction(event) {

  }

  render() {
    const playerNumber = this.props.options.playerNumber;
    const players = Array.from(new Array(playerNumber));
    console.log(players);
    return true ? (
      <div className="playersBoardPannel">
        <span> playerNumber = {playerNumber} !</span>
        {players.map((player, index) => (
          <PlayerBoard
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
