import React, { Component } from 'react';
import { Button, Row } from 'react-bootstrap';

class GameList extends Component {
  render() {
    const { games } = this.props;
    const players = ['Max','Bender','Frey','Nooby'];
    return (
        <div className='gameListPanel'>
          {games && games.map((game, index)=>{
            return (
              <div className='game' key={game.id}>
                <div className='gameHeader'>{game.name}</div>
                <Row>
                  {players.map((player)=>{
                    return (
                      <div
                        className='playerName col-sm-6'
                        key={player}>{player}</div>
                    )
                  })}
                </Row>
                <div className="gameButton">
                  <Button variant="secondary" size="sm">Join</Button>
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

export default GameList;
