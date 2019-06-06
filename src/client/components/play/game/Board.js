import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './board.css';
import { Button } from 'react-bootstrap';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';
import { endGame } from '../../../../store/actions/gameActions';
import Card from '../../common/card/Card'

class ResArcanaBoard extends Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
  };

  pickArtefact = (cardId) => {
    const { playerID } = this.props;
    if (this.isActive(cardId)) {
      this.props.moves.draftCards(playerID, cardId);
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

  renderCard = (card, onClick) => {
    const src = require('../../../assets/image/components/' + card.type + '/' + card.class + '.png');
    return (
      <div
        key={card.name}
        className={(this.isActive ? "active": "") + " card vertical"}
        onClick={onClick}
      >
        <Card
          cardClass={' vertical'}
          src={ src }
          show={ true } 
          alt={ card.name ? card.name : null } 
        />
      </div>
    );
  }

  renderPlayerDraftBoard = () => {
    const { auth, game, G, ctx, playerID, gameId } = this.props;
    
    const playerName = game.players[auth.uid] ? game.players[auth.uid].name : 'spectator';

    const draftCards = G.players[playerID] && G.players[playerID].draftCards.map((card) => {
      return this.renderCard(card, () => { this.pickArtefact(card.id)})
    });

    const deck = G.players[playerID].deck.map((card)=>{
      console.log('card',card)
      return this.renderCard(card)
    })

    return <>
        <div>{playerName}</div>
        <div className="artefacts">
          {draftCards}
        </div>
        <div className="artefacts">
          {deck}
        </div>
      </>
  }

  renderOthersDraftBoard = () => {
    const { G } = this.props;
    return
  }

  renderPlayerPlayBoard = () => {
    return
  }

  renderOthersPlayBoard = () => {
    const { auth, G, ctx, playerID, game, gameId } = this.props;

    const globalArtifacts = G.artefacts && G.artefacts.map(artefact => {
      return this.renderCard(artefact, () => { this.pickArtefact(artefact.name)})
    });
    const playerArtifacts = G.artefactsInPlay && G.artefactsInPlay[playerID] && G.artefactsInPlay[playerID].map(artefact => {
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

    const playerName = game.players[auth.uid] ? game.players[auth.uid].name : 'spectator';

    return (
      <>
        <div>{playerName}</div>
        {artefactsAvailable}
        {playerArtefacts}
      </>
    )
  }

  renderCommunBoard = () => {

  }

  render() {
    const { G, ctx, playerID, game, gameId } = this.props;
    
    if (!isLoaded(game)) {
      return <div className="loadingPanel alignCenter"><img className="loader" alt="Loading..."/>Loading...</div>
    }

    let winner = this.getWinner();
    
    let renderPlayerBoard = null;
    let renderOthersBoard = null;

    switch(G.phase) {
      case 'DRAFT_PHASE':
        renderPlayerBoard = this.renderPlayerDraftBoard();
        renderOthersBoard = this.renderOthersDraftBoard();
        break;
      case 'PLAY_PHASE':
      default:
        renderPlayerBoard = this.renderPlayerPlayBoard();
        renderOthersBoard = this.renderOthersPlayBoard();
    }

    return (
      <div className="board">
        <h5>{G.phase}</h5>
        {renderPlayerBoard}
        {renderOthersBoard}
        {winner}
        {/*<Button variant="secondary" size="sm" onClick={(event) => this.handleEndGame(event)}>Game Over</Button>*/}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    currentGame: state.firestore.data.currentGame,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    endGame: (gameId) => dispatch(endGame(gameId))
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect(props => [
    { collection: 'games',
      doc: props.currentGame.gameId,
      storeAs: 'game'
    },
  ])
)(ResArcanaBoard)