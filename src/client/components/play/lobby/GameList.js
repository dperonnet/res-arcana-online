import React, { Component } from 'react';
import { Button, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { joinGame } from '../../../../store/actions/gameActions';

class GameList extends Component {

  handleJoin = (gameId) => {
    this.props.joinGame(gameId);
  }

  render() {
    const { games } = this.props;
    return (
        <div className='gameListPanel'>
          {games && games.map((game, index)=>{
            return (
              <div className='game' key={game.id}>
                <div className='gameHeader'>{game.name}</div>
                <Row>
                  {Object.entries(game.players).map((player)=>{
                    return (
                      <div
                        className='playerName col-sm-6'
                        key={player[0]}>{player[1]}</div>
                    )
                  })}
                </Row>
                <div className="gameButton">
                  <Button variant="secondary" size="sm" onClick={() => {this.handleJoin(game.id)}}>Join</Button>
                  {/*<Button variant="secondary" size="sm">Watch</Button>*/}
                </div>
                {index !== games.length - 1 && <div className='separator'/>}
              </div>
            );
          })
          }
        </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    joinGame: (gameId) => dispatch(joinGame(gameId))
  }
}

export default connect(null, mapDispatchToProps)(GameList)
