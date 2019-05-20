import React, { Component } from 'react';
import { Button, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { deleteGameById, joinGame } from '../../../../store/actions/gameActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

class GameList extends Component {

  handleJoin = (gameId) => {
    this.props.joinGame(gameId);
  }

  handleDeleteById = (event, gameId) => {
    event.preventDefault();
    this.props.deleteGameById(gameId)
  }

  renderPlayers = (game) => {
    return game.players && Object.values(game.players).map((player) => {
      return <div className='playerName col-sm-6' key={player.id}>{player.name}</div>
    })
  }

  render() {
    const { games } = this.props;
    return (
      <div className='gameListPanel'>
        {
          games && games.map((game, index) => 
            <div className='game' key={game.id}>
              <div className='gameHeader'>{game.name}
                <div className="pull-right close" onClick={(event) => this.handleDeleteById(event, game.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </div>
              </div>
              <Row>
                {this.renderPlayers(game)}
              </Row>
              <div className="gameButton">
                <Button variant="secondary" size="sm" onClick={() => {this.handleJoin(game.id)}}>Join</Button>
              </div>
              {index !== games.length - 1 && <div className='separator'/>}
            </div>
          )
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    games: state.firestore.ordered.games
  }
}

const mapDispatchToProps = dispatch => {
  return {
    joinGame: (gameId) => dispatch(joinGame(gameId)),
    deleteGameById: (gameId) => dispatch(deleteGameById(gameId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameList)
