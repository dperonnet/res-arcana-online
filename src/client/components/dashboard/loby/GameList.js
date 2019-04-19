import React, { Component } from 'react';
import './loby.css';
import { Button, Row } from 'react-bootstrap';
import CreateGame from './CreateGame';

class GameList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [
        {id:1, content:'Max\'s game'},
        {id:2, content:'Dams\'s game'},
        {id:3, content:'Jacky\'s game'},
        {id:4, content:'Eliot\'s game'}
      ]
    }
  }

  render() {
    const { games } = this.props;
    const players = ['Max','Bender','Frey','Nooby'];
    return (
      <>
        <div className='joinGamePanel'>
          <CreateGame />
        </div>
        <div className='gameList'>
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
                <div className='gameButton'>
                  <Button variant="secondary" size="sm">Join</Button>
                  <Button variant="secondary" size="sm">Watch</Button>
                </div>
                 {index !== games.length - 1 && <div className='separator'/>}
              </div>
            );
          })
        }
        </div>
      </>
    );
  }

}

export default GameList;
