import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './board.css';

export class ResArcanaBoard extends Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
  };

  pickArtefact = id => {
    if (this.isActive(id)) {
      console.log("pickArtefact ",id);
      this.props.moves.pickArtefact(id);
      console.log("call endTurn ");
      this.props.events.endTurn();
    }
  };

  isActive(id) {
    if (!this.props.isActive) return false;
    return true;
  }

  render() {
    const { artefacts } = this.props.G;
    const components = artefacts.map(artefact => {
      return (
        <div
          className="card smallCard"
          key={artefact.name}
          onClick={() => { this.pickArtefact(artefact.name)}}
        >
          {artefact.name}
        </div>);
    });

    return (
      <div className="board">
        <div className="flex-column">
          <h1>You are Player {this.props.playerID}</h1>
          <div className="artefacts">{components}</div>
          <h1>Active player is {this.props.ctx.currentPlayer}</h1>
        </div>
      </div>
    );
  }
}
