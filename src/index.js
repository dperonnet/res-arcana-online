import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import card from './image/card01.png';
import * as serviceWorker from './serviceWorker';
import CardGenerator from './databaseForm.js'; 

class Card extends React.Component {
  render() {
    const classes = `card ${this.props.options.cardSize}`;
    return (
      <div className={classes}>
        <img src={card} />
      </div>
    );
  }
}

class TextCard extends React.Component {
  render() {
    const classes = `card ${this.props.options.cardSize}`;
    const essencesCollectables = ['Vie','Mort'];
    const collectibles = essencesCollectables.map((value, index) => {
      return (
        <li key={index}>
          <span>
            {value}
          </span>
      </li>
    );
    });

    const actionsList = ['action1', 'action2'];
    const actions = actionsList.map((value, index) => {
      return (
        <li key={index}>
          <span>{value}</span>
        </li>
      );
    });

    return (
      <div>
        <div className={classes}>
          <span className={"cardName"}>Guérisseur</span>
          <div>
            <ol>
              {collectibles}
            </ol>
          </div>
          <div>
            <ol>
              {actions}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

function PlayerButton(props) {
  return (
    <button onClick={props.onClick}>{props.playerNumber} players</button>
  );
}

class PlayerSetup extends React.Component {
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
        <h3>Player Number selected : {this.props.options.playerNumber}</h3>
        {selectPlayers}
      </div>
    );
  }
}

class PlayersBoard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="playersBoardPannel">
        <TextCard options={this.props.options} />
      </div>
    );
  }
}

class CommonBoard extends React.Component {
    render() {
      return (
        <div className="commonBoardPannel">
          <div>Objets Magiques</div>
          <div>Lieu de puissance</div>
          <div>Monuments</div>
        </div>
      );
    }
}

class Game extends React.Component {
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

ReactDOM.render(<CardGenerator />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
