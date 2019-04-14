import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';

export default class PlayerSetup extends PureComponent {
  render() {
    const { onClick, options } = this.props;
    const playerNumbers = [2, 3, 4];
    const selectPlayers = playerNumbers.map(key => (
      <PlayerButton
        playerNumber={key}
        onClick={() => onClick(key)}
      />
    ));
    return (
      <div>
        <h3>
          Player Number selected :
          {' '}
          {options.playerNumber}
        </h3>
        {selectPlayers}
      </div>
    );
  }
}

function PlayerButton(props) {
  const { onClick, playerNumber } = props;
  return (
    <Button className="ml-3" variant="secondary" onClick={onClick}>
      {playerNumber}
      {' '}
      {' '}
users
    </Button>
  );
}
