/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React, { Component } from 'react';
import Cookies from 'react-cookies';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { saveCredentials } from '../../../../store/actions/gameActions';
import { Client } from "boardgame.io/react";
import { LobbyConnection } from './connection';
import CreateGame from './CreateGame';
import GameList from './GameList';
import GameLobby from './GameLobby';
import './lobby.css';

/**
 * Lobby
 *
 * React lobby component.
 *
 * @param {Array}  gameComponents - An array of Board and Game objects for the supported games.
 * @param {string} lobbyServer - Address of the lobby server (for example 'localhost:8000').
 *                               If not set, defaults to the server that served the page.
 * @param {string} gameServer - Address of the game server (for example 'localhost:8001').
 *                              If not set, defaults to the server that served the page.
 * @param {function} clientFactory - Function that is used to create the game clients.
 * @param {bool}   debug - Enable debug information (default: false).
 *
 * Returns:
 *   A React component that provides a UI to create, list, join, leave, play or spectate game instances.
 */
class Lobby extends Component {
  static propTypes = {
    gameComponents: PropTypes.array.isRequired,
    lobbyServer: PropTypes.string,
    gameServer: PropTypes.string,
    debug: PropTypes.bool,
    clientFactory: PropTypes.func,
  };

  static defaultProps = {
    debug: false,
    clientFactory: Client,
  };

  state = {
    runningGame: null,
    errorMsg: '',
    credentialStore: {},
  };

  constructor(props) {
    super(props);
    this._createConnection(this.props);
    this._updateConnection();
  }

  componentDidMount() {
    let cookie = Cookies.load('lobbyState') || {};
    this.setState({
      credentialStore: cookie.credentialStore || {},
    });
  }

  componentDidUpdate(prevProps, prevState) {
    let name = this.props.playerName;
    let creds = this.state.credentialStore[name];
    if (prevProps.playerName !== name ||
      prevState.credentialStore[name] !== creds
    ) {
      this._createConnection(this.props);
      this._updateConnection();
      let cookie = {
        credentialStore: this.state.credentialStore,
      };
      Cookies.save('lobbyState', cookie, { path: '/' });
    }
    const { game } = this.props;
    if (game && prevProps.status !== game.status) {
      if(game.status === 'STARTED' && !this.state.runningGame) {
        const res = this.connection.getGameInstance('res-arcana', game.boardGameId);
        res.then((inst)=> {
          if(inst) {
            const playerSeat = inst.players.find(
              player => player.name === this.props.playerName
              ) || 'Visitor';
            const gameOptions = {
              gameID: inst.roomID,
              playerID: '' + playerSeat.id,
              numPlayers: inst.players.length,
            }
            this._startGame('res-arcana', gameOptions);
          } else {
            this.setState({runningGame: null });
          }
        })
      } else if (game.status !== 'STARTED' && this.state.runningGame) {
        this.setState({runningGame: null });
      }
    }
  }

  _createConnection = props => {
    const name = this.props.playerName;
    this.connection = LobbyConnection({
      server: props.lobbyServer,
      gameComponents: props.gameComponents,
      playerName: name,
      playerCredentials: this.state.credentialStore[name],
    });
  };

  _updateCredentials = (playerName, gameID, playerID, credentials) => {
    console.log('_updateCredentials',playerName, gameID, playerID, credentials)
    this.props.saveCredentials(gameID, playerID, credentials)
    this.setState(prevState => {
      // clone store or componentDidUpdate will not be triggered
      const store = Object.assign({}, prevState.credentialStore);
      store[[playerName]] = credentials;
      return { credentialStore: store };
    });
  };

  _updateConnection = async () => {
    await this.connection.refresh();
    this.forceUpdate();
  };

  _exitLobby = async () => {
    await this.connection.disconnect();
    this.setState({ errorMsg: '' });
  };

  _createRoom = async (gameName, numPlayers) => {
    const { setLoading } = this.props;
    try {
      setLoading(true);
      const resp = await this.connection.create(gameName, numPlayers);
      await this.connection.refresh();
      // rerender
      this.setState({ errorMsg: '' });
      return resp;
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _joinRoom = async (gameName, gameID, playerID) => {
    try {
      await this.connection.join(gameName, gameID, playerID);
      await this.connection.refresh();
      console.log('this.connection.playerCredentials',this.connection.playerCredentials)
      this._updateCredentials(
        this.connection.playerName,
        gameID, 
        playerID,
        this.connection.playerCredentials
      );
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _startGame = (gameName, gameOpts) => {
    const gameCode = this.connection._getGameComponents(gameName);
    if (!gameCode) {
      this.setState({
        errorMsg: 'game ' + gameName + ' not supported',
      });
      return;
    }

    let multiplayer = undefined;
    if (gameOpts.numPlayers > 1) {
      console.log('gameOpts.numPlayers',gameOpts.numPlayers)
      if (this.props.gameServer) {
        multiplayer = { server: this.props.gameServer };
      } else {
        multiplayer = true;
      }
    }

    const app = this.props.clientFactory({
      game: gameCode.game,
      board: gameCode.board,
      debug: this.props.debug,
      multiplayer,
    });

    const game = {
      app: app,
      gameID: gameOpts.gameID,
      playerID: gameOpts.numPlayers > 1 ? gameOpts.playerID : null,
      credentials: this.connection.playerCredentials,
    };
    this.setState({runningGame: game });
  };

  render() {
    const { currentGame, gameComponents, gameServer, loading, playerName, renderer } = this.props;
    const { errorMsg, runningGame } = this.state;

    if (!isLoaded(currentGame)) {
      return <div className="lobbyContainer">
        <div className="loadingPanel alignCenter"><img className="loader" />Loading...</div>
      </div>
    }
    
    if (renderer) {
      return renderer({
        errorMsg,
        gameComponents,
        gameInstances: this.connection.gameInstances,
        playerName,
        handleEnterLobby: this._enterLobby,
        handleExitLobby: this._exitLobby,
        handleCreateRoom: this._createRoom,
        handleJoinRoom: this._joinRoom,
        handleLeaveRoom: this._leaveRoom,
        handleExitRoom: this._exitRoom,
        handleRefreshRooms: this._updateConnection,
        handleStartGame: this._startGame,
      });
    }

    return (
      <>
        {!currentGame.gameId ? (
          <div className="lobbyContainer">
            {loading ?
              <div className="loadingPanel alignCenter"><img className="loader" />Loading...</div>
            :
              <>
                <CreateGame
                  createGame={this._createRoom}
                  joinGame={this._joinRoom}
                  gameServer={gameServer} />
                <GameList
                  gameServer={gameServer}
                  onClickJoin={this._joinRoom}/>
                <span className="error-msg">
                  {errorMsg}
                </span>
              </>
            }
          </div>
        ) : (
          <>
            <GameLobby
              gameServer={gameServer}
              runningGame={runningGame}
            />
          </>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame,
    playerName: state.firebase.profile.login,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0],
    loading: state.ui.loading
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveCredentials: (gameID, playerID, credentials) => dispatch(saveCredentials(gameID, playerID, credentials)),
    setLoading: (value) => dispatch({type: 'LOADING', loading: value})
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect(props => [
    { collection: 'currentGames',
      doc: props.auth.uid,
      storeAs: 'currentGame'
    },
    { collection: 'games',
      doc: props.currentGame && props.currentGame.gameId,
      storeAs: 'game'
    }
  ])
)(Lobby)