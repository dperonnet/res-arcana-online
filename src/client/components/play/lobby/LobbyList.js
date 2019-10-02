import React, { Component } from 'react'
import { Button, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { deleteLobby, takeSeat, watchGame } from '../../../../store/actions/lobbyActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import './lobby.css';

class LobbyList extends Component {

  handleJoin = (event, gameId) => {
    const { takeSeat} = this.props
    event.preventDefault()
    takeSeat(gameId)
  }

  handleWatch = (event, gameId) => {
    const { watchGame } = this.props
    event.preventDefault()
    watchGame(gameId)
  }

  handleDeleteLobby = (event, gameId) => {
    const { deleteLobby } = this.props
    event.preventDefault()
    deleteLobby(gameId)
  }

  renderPlayers = (game) => {
    return game.players && Object.values(game.players).map((player, index) => {
      return <div className='player-name col-sm-6' key={index}>{player.name}</div>
    })
  }

  render() {
    const { gameLobbys, profile  } = this.props
    console.log('gameLobbys', gameLobbys);
    return (
      <div className='game-list-panel align-center'>
        {
          gameLobbys && gameLobbys.map((game, index) => 
            <div className='game' key={game.id}>
              <div className='game-header'>{game.name} ({game.seats.filter(id => id !== -1).length}/{game.seats.length})
                {profile.role === 'admin' && <div className="pull-right close" onClick={(event) => this.handleDeleteLobby(event, game.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </div>}
              </div>
              <Row>
                {this.renderPlayers(game)}
              </Row>
              <div className="game-button">
                <Button variant="secondary" size="sm" onClick={(event) => this.handleJoin(event, game.id)}>Join</Button>
                <Button variant="secondary" size="sm" onClick={(event) => this.handleWatch(event, game.id)}>Watch</Button>
              </div>
              {index !== gameLobbys.length - 1 && <div className='separator'/>}
            </div>
          )
        }
        {(!gameLobbys || gameLobbys.length === 0) && <span>There is currently no game running.</span>}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    gameLobbys: state.firestore.ordered.gameLobbys,
    profile: state.firebase.profile
  }
}

const mapDispatchToProps = dispatch => {
  return {
    takeSeat: (gameId) => dispatch(takeSeat(gameId)),
    watchGame: (gameId) => dispatch(watchGame(gameId)),
    deleteLobby: (gameId) => dispatch(deleteLobby(gameId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LobbyList)
