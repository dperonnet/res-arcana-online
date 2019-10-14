import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { Client } from 'boardgame.io/react'
import { ResArcanaGame } from './Game'
import ResArcanaBoard from './Board'

class GameBoard extends Component {
  getRunningGame = () => {
    const { auth, currentLobby, game } = this.props

    const app = Client({
      game: ResArcanaGame,
      board: ResArcanaBoard,
      debug: this.props.debug,
      numPlayers: game.numberOfPlayers,
      multiplayer: true,
    })

    const runningGame = {
      app: app,
      gameID: currentLobby.lobbyId,
      playerID: game.seats.indexOf(auth.uid) > -1 ? game.seats.indexOf(auth.uid).toString() : 'Spectator',
      credentials: null,
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
