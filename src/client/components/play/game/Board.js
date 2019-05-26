import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './board.css';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { endGame } from '../../../../store/actions/gameActions';

class ResArcanaBoard extends Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
  };

  pickArtefact = id => {
    console.log('pick Artefact')
    if (this.isActive(id)) {
      this.props.moves.pickArtefact(id);
      this.props.events.endTurn();
    }
  };

  isActive(id) {
    if (!this.props.isActive) return false;
    return true;
  }

  getWinner = () => {
    const { gameover } = this.props.ctx;
    if (gameover) {
      console.log("gameover.winner : ", gameover.winner);
      return (
        gameover.winner !== undefined ? (
          gameover.winner.map(winner => {
            return (
              <div
                key={winner.playerId}
                id="winner">Winner is player {winner.playerId} with a score of {winner.score}
              </div>
            )
          })
        ) : (
          <div id="winner">Draw!</div>
        )
      )
    } else return null
  }

  handleEndGame = (e) => {
    e.preventDefault();
    const { endGame, currentGame } = this.props;
    endGame(currentGame.gameId)
  }

  renderCard = (artefact, onClick) => {
    return (
      <div
        className={(this.isActive ? "active ": "") + "card xSmallCard"}
        key={artefact.name}
        onClick={onClick}
      >
        {artefact.name} : {artefact.value}
      </div>
    );
  }

  render() {
    const { G, ctx, playerID, gameId } = this.props;
    
    let winner = this.getWinner();

    const globalArtifacts = G.artefacts && G.artefacts.map(artefact => {
      return this.renderCard(artefact, () => { this.pickArtefact(artefact.name)})
    });
    const playerArtifacts = G.artefactsInPlay[playerID] && G.artefactsInPlay[playerID].map(artefact => {
      return this.renderCard(artefact)
    });

    let artefactsAvailable = null;
    if ( this.isActive ) {
      artefactsAvailable =
        <div className="flex-column">
          <div className="artefacts">{globalArtifacts}</div>
        </div>
    }

    let playerArtefacts =
      <div className="flex-column">
        <div className="artefacts">{playerArtifacts}</div>
      </div>

    return (
      <div className="board">
        <h6>You are Player {playerID} in game {gameId}</h6>
        <h6>Active player is {ctx.currentPlayer}</h6>
        {artefactsAvailable}
        {playerArtefacts}
        {winner}
        <Button variant="secondary" size="sm" onClick={(event) => this.handleEndGame(event)}>Game Over</Button>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    endGame: (gameId) => dispatch(endGame(gameId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResArcanaBoard)