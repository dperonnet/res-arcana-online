import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { deleteLobby, leaveLobby, startGame, takeSeat, watchGame } from '../../../../store/actions/lobbyActions'
import Chat from '../../common/chat/Chat'
import GameBoard from '../game/GameBoard'

class GameLobby extends Component {
  handleTakeSeat = (event, seatId) => {
    const { currentLobby, takeSeat } = this.props
    event.preventDefault()
    takeSeat(currentLobby.lobbyId, seatId)
  }

  handleStartGame = () => {
    const { currentLobby, startGame } = this.props
    startGame(currentLobby.lobbyId)
  }

  handleDeleteLobby = () => {
    const { currentLobby, deleteLobby } = this.props
    deleteLobby(currentLobby.lobbyId)
  }

  handleLeaveLobby = () => {
    const { currentLobby, leaveLobby } = this.props
    leaveLobby(currentLobby.lobbyId)
  }

  renderChat = () => {
    const { chat, game } = this.props
    return <Chat chat={chat} chatId={game.id} chatName={game.name + ' Chat'} />
  }

  renderPendingLobby = () => {
    const { auth, game } = this.props

    const seats =
      game.seats &&
      game.seats.map((playerId, index) => {
        return playerId === -1 ? (
          <div key={index} onClick={event => this.handleTakeSeat(event, index)}>
            Take seat
          </div>
        ) : playerId === 0 ? (
          <div key={index}>Lock({index})</div>
        ) : (
          <div className="seat" key={index}>
            {game.players[playerId].name}
          </div>
        )
      })
    const spectators = Object.entries(game.players).filter(player => !game.seats.includes(player[0]))
    const spectatorList = spectators.map((player, index) => {
      return (
        <div className="player" key={index}>
          {player[1].name}
        </div>
      )
    })

    const missingPlayer = game.seats.includes(-1)
    const numberOfSpectators = Object.keys(spectators).length

    return (
      <div className="game-lobby-container">
        <div className="game-lobby-panel">
          <div className="game">
            <div className="game-header">
              <h5>You are in game {game.name}</h5>
              {seats}
              <div className="separator" />
              <h5>
                Spectators ({numberOfSpectators}) {numberOfSpectators > 0 && <>: {spectatorList}</>}
              </h5>
              <div className="game-button">
                {auth && auth.uid === game.creatorId ? (
                  <>
                    <Button variant="primary" size="sm" onClick={this.handleStartGame} disabled={missingPlayer}>
                      Start
                    </Button>
                    <Button variant="secondary" size="sm" onClick={this.handleDeleteLobby}>
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" size="sm" onClick={this.handleLeaveLobby}>
                    Leave
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {this.renderChat()}
      </div>
    )
  }

  render() {
    const { chat, game, runningGame } = this.props

    if (!isLoaded(game) && !isLoaded(chat)) {
      return <div className="loading">Loading...</div>
    }
    if (isEmpty(game)) {
      return <div>Game is empty</div>
    }

    return game.status === 'PENDING' ? (
      this.renderPendingLobby()
    ) : game.status === 'CONNECTING_TO_GAME_SERVER' ? (
      this.renderLoadingLobby()
    ) : game.status === 'STARTED' ? (
      <GameBoard runningGame={runningGame} />
    ) : game.status === 'OVER' ? (
      <h5>Game Over</h5>
    ) : null
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    chat: state.firestore.ordered.chat && state.firestore.ordered.chat[0],
    currentLobby: state.firestore.data.currentLobby,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0],
  }
}

const mapDispatchToProps = dispatch => {
  return {
    deleteLobby: lobbyId => dispatch(deleteLobby(lobbyId)),
    leaveLobby: lobbyId => dispatch(leaveLobby(lobbyId)),
    startGame: gameId => dispatch(startGame(gameId)),
    takeSeat: (gameId, seatId) => dispatch(takeSeat(gameId, seatId)),
    watchGame: gameId => dispatch(watchGame(gameId)),
    setLoading: value => dispatch({ type: 'LOADING', loading: value }),
  }
}

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  firestoreConnect(props => {
    return [
      { collection: 'gameLobbys', doc: props.currentLobby.lobbyId, storeAs: 'game' },
      { collection: 'currentLobbys', doc: props.auth.uid, storeAs: 'currentLobby' },
      { collection: 'chats', doc: props.currentLobby.lobbyId, storeAs: 'chat' },
    ]
  })
)(GameLobby)
