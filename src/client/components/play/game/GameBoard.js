import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { Client } from 'boardgame.io/react'
import { ResArcanaGame } from './Game'
import ResArcanaBoard from './Board'

class GameBoard extends Component {
  renderLoading() {
    let icon = React.createElement('img', { className: 'loader', alt: 'Loading...' })
    let loadingPanel = React.createElement(
      'div',
      { className: 'loading-panel align-center centered mt-4' },
      icon,
      'Loading...'
    )
    let gameBoard = React.createElement('div', { className: 'game-board' }, loadingPanel)
    return gameBoard
  }

  getRunningGame = () => {
    const { currentLobby, game } = this.props
    const gameInfo = currentLobby.gameCredentials[game.boardGameId]
    const gameServerUrl = `http://${process.env.REACT_APP_GAME_SERVER_URL}`

    const loading = this.renderLoading

    const app = Client({
      game: ResArcanaGame,
      board: ResArcanaBoard,
      debug: false,
      loading,
      numPlayers: game.numberOfPlayers,
      multiplayer: { server: gameServerUrl },
    })

    const runningGame = {
      app: app,
      gameID: game.boardGameId,
      playerID: gameInfo && gameInfo.id >= 0 ? gameInfo.id.toString() : 'Spectator',
      credentials: gameInfo && gameInfo.playerCredentials ? gameInfo.playerCredentials : null,
    }
    console.log('runningGame', runningGame)
    return runningGame
  }

  render() {
    const { currentLobby, game } = this.props

    if (!isLoaded(game) || !isLoaded(currentLobby)) {
      return <div className="loading">Loading...</div>
    }

    let runningGame = this.getRunningGame()

    return (
      <div className="game-board">
        {game.status === 'STARTED' && runningGame && (
          <runningGame.app
            gameID={game.boardGameId}
            playerID={runningGame.playerID}
            credentials={runningGame.credentials}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    currentLobby: state.firestore.data.currentLobby,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0],
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect(props => [
    { collection: 'currentLobbys', doc: props.auth.uid, storeAs: 'currentLobby' },
    { collection: 'gameLobbys', doc: props.currentLobby.lobbyId, storeAs: 'game' },
  ])
)(GameBoard)
