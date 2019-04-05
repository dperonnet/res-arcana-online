import React, { Component } from 'react';
import PlayersBoard from './PlayersBoard';

export default class GameBoard extends Component {
  render() {
    const { history, options } = this.props;
    const currentTurn = history && history.length > 0 ? history[history.length - 1] : null;
    return (
      <>
        <CommonBoard />
        <PlayersBoard
          options={options}
          turn={currentTurn}
        />
      </>
    );
  }
}

function CommonBoard() {
  return (
    <div className="commonBoardPannel">
      <div>Santé</div>
      <div>Habitation</div>
      <div>Auto</div>
    </div>
  );
}
