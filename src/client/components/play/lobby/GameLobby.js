import React, { Component } from 'react'
import { Button, Form, Row } from 'react-bootstrap'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import {
  addSeat,
  removeSeat,
  deleteLobby,
  leaveLobby,
  setReady,
  startGame,
  takeSeat,
  watchGame,
} from '../../../../store/actions/lobbyActions'
import Chat from '../../common/chat/Chat'
import GameBoard from '../game/GameBoard'

class GameLobby extends Component {
  handleTakeSeat = (event, seatId) => {
    const { currentLobby, takeSeat } = this.props
    event.preventDefault()
    takeSeat(currentLobby.lobbyId, seatId)
  }

  handleWatchGame = () => {
    const { currentLobby, watchGame } = this.props
    watchGame(currentLobby.lobbyId)
  }

  handleSetReady = () => {
    const { currentLobby, setReady } = this.props
    setReady(currentLobby.lobbyId)
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

  handleAddSeat = () => {
    const { currentLobby, addSeat } = this.props
    addSeat(currentLobby.lobbyId)
  }

  handleRemoveSeat = () => {
    const { currentLobby, removeSeat } = this.props
    removeSeat(currentLobby.lobbyId)
  }

  renderChat = () => {
    const { chat, game } = this.props
    return <Chat chat={chat} chatId={game.id} chatName={game.name + ' Chat'} />
  }

  renderPendingLobby = () => {
    const { auth, game } = this.props

    const options = (
      <div>
        <div></div>
        <Form.Group as={Row}>
          <Form.Label column xs="6">
            Number of mages :
          </Form.Label>
          <Form.Label column xs="6" className="align-left">
            {game.creatorId === auth.uid && (
              <div className="d-inline-block square-button" onClick={this.handleRemoveSeat}>
                -
              </div>
            )}
            <div className="d-inline-block">{game.numberOfPlayers}</div>
            {game.creatorId === auth.uid && (
              <div className="d-inline-block square-button" onClick={this.handleAddSeat}>
                +
              </div>
            )}
          </Form.Label>
        </Form.Group>
      </div>
    )
    const seats =
      game.seats &&
      game.seats.map((playerId, index) => {
        let ready = playerId !== -1 && game.players[playerId].ready ? ' ready' : ''
        return playerId === -1 ? (
          <div className="seat empty" key={index} onClick={event => this.handleTakeSeat(event, index)}>
            Take seat
          </div>
        ) : playerId === 0 ? (
          <div key={index}>Lock({index})</div>
        ) : (
          <div className={'seat' + ready} key={index}>
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

    let allplayersReady = true
    game.seats
      .filter(seatId => seatId !== -1)
      .forEach(playerId => {
        allplayersReady &= game.players[playerId].ready
      })
    const ready = game.seats.includes(auth.uid) && allplayersReady
    const numberOfSpectators = Object.keys(spectators).length
    const isSpectator = !game.seats.includes(auth.uid)

    return (
      <div className="game-lobby-container">
        <div className="game-lobby-panel">
          <div className="game">
            <div className="game-header">
              <h5>You are in game {game.name}</h5>
              {auth && auth.uid === game.creatorId && options}
              {seats}
              {game.players[auth.uid] && (
                <div className="game-button">
                  <Button variant="secondary" size="sm" onClick={this.handleSetReady} disabled={isSpectator}>
                    {game.players[auth.uid].ready ? 'Cancel' : 'Ready'}
                  </Button>
                </div>
              )}
              <div className="separator" />
              <h5>
                Spectators ({numberOfSpectators}) {numberOfSpectators > 0 && <>: {spectatorList}</>}
              </h5>
              <div className="separator" />
              <div className="game-button">
                {auth && auth.uid === game.creatorId ? (
                  <>
                    <Button variant="primary" size="sm" onClick={this.handleStartGame} disabled={!ready}>
                      Start
                    </Button>
                    <Button variant="secondary" size="sm" onClick={this.handleDeleteLobby}>
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" onClick={this.handleWatchGame}>
                      Watch
                    </Button>
                    <Button variant="secondary" size="sm" onClick={this.handleLeaveLobby}>
                      Leave
                    </Button>
                  </>
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
    addSeat: lobbyId => dispatch(addSeat(lobbyId)),
    removeSeat: lobbyId => dispatch(removeSeat(lobbyId)),
    deleteLobby: lobbyId => dispatch(deleteLobby(lobbyId)),
    leaveLobby: lobbyId => dispatch(leaveLobby(lobbyId)),
    setReady: lobbyId => dispatch(setReady(lobbyId)),
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
