import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './board.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';
import { clearZoom, endGame, zoomCard } from '../../../../store/actions/gameActions';
import Card from '../../common/card/Card'
import CardZoom from '../../common/card/CardZoom.js';

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
    const { isActive, playerID } = this.props;
    if (isActive) {
      this.props.moves.draftCards(playerID, cardId);
    }
  };

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

  getPlayersName = () => {
    const { ctx, game } = this.props;
    let playersName = [ctx.numPlayers];
    Object.values(game.players).map((player) => {
      playersName[player.id] = player.name;
    })
    return playersName;
  }

  renderComponent = (card, cardType, onClick, onMouseOver, onMouseOut) => {
    const { profile } = this.props;
    const src = require('../../../assets/image/components/' + card.type + '/' + card.class + '.png');
    return (
      <div
        key={card.id}
        className={(profile.cardSize ? profile.cardSize : 'normal') + ' vertical '+ cardType }
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        <Card
          classes={(profile.cardSize ? profile.cardSize : 'normal') +' vertical '+ cardType}
          src={ src }
          show={ true } 
          alt={ card.name ? card.name : null } 
        />
      </div>
    );
  }

  renderCardZoom = () => {
    const { cardToZoom } = this.props
    const src = require('../../../assets/image/components/' + cardToZoom.type + '/' + cardToZoom.class + '.png');
    return <div className="card-zoom-frame">
      <CardZoom src={src} show={true} alt={cardToZoom.name}  />
    </div>
  }

  onMouseOver = (card) => {
    if (card.type !== 'back')
    this.props.zoomCard(card);
  }

  onMouseOut = () => {
    this.props.clearZoom();
  }

  renderPickBoard = () => {
    const { G, playerID, profile } = this.props;
    if (!Number.isInteger(parseInt(playerID))) return null;
    
    const draftCards = G.players[playerID] && G.players[playerID].draftCards.map((card) => {
      return this.renderComponent(card, 'card', () => this.pickArtefact(card.id), () => this.onMouseOver(card), () => this.onMouseOut(card))
    });
    
    return <>
      {G.players[playerID].draftCards.length > 0 && 
        <div className='draft-card-panel'>
          <h5>Pick a card {G.players[playerID].deck.length +1}/8</h5>
          <div className={'draft-card card-row ' + profile.cardSize}>
            {draftCards}
          </div>
        </div>
      }
    </>
  }

  renderPlayerDraftBoard = () => {
    const { auth, game, G, playerID, profile } = this.props;
    if (!Number.isInteger(parseInt(playerID))) return null;

    const playerName = game.players[auth.uid] ? game.players[auth.uid].name : 'spectator';

    const deck = G.players[playerID].deck.map((card)=>{
      return this.renderComponent(card, 'card', null, () => this.onMouseOver(card), () => this.onMouseOut(card));
    })

    return <div>
      <div>{playerName}</div>
      <div className={'artefacts card-row ' + profile.cardSize}>
        {deck}
      </div>
    </div>
  }

  renderOthersDraftBoard = () => {
    const { ctx, G, game, playerID, profile } = this.props;
    const othersNextId = Object.keys(G.publicData).filter((id) => {
      return id !== playerID && id > playerID
    });
    const othersPrevId = Object.keys(G.publicData).filter((id) => {
      return id !== playerID && id < playerID
    });
    const othersId = othersNextId.concat(othersPrevId);
    const playersName = this.getPlayersName()
    const boards = othersId.map((id) =>{
      const playerName = playersName[parseInt(id)];
      const deckSize = G.publicData[id].deckSize
      let deck = []
      for(let i = 0; i< deckSize; i++) {
        const card = {
          class: 'back_artefact',
          id: id+'_'+i+'back_artefact',
          name: 'Artefact',
          type: 'back',
        }
        deck.push(this.renderComponent(card, 'card'));
      }
      return (
        <div key={id}>
          <div>{playerName}</div>
          <div className={'card-row ' + profile.cardSize}>
            {deck}
          </div>
        </div>
      );
    });
    return <>
      {boards}
    </>
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

    let artefactsAvailable =
      <div className="flex-column">
        <div className="artefacts">{globalArtifacts}</div>
      </div>

    let playerArtefacts =
      <div className="flex-column">
        <div className="artefacts">{playerArtifacts}</div>
      </div>

    const playerName = game.players[auth.uid] ? game.players[auth.uid].name : 'spectator';

    return <>
      <div>{playerName}</div>
      {artefactsAvailable}
      {playerArtefacts}
    </>
  }

  renderDraftBoard = () => {
    let playerPickBoard = this.renderPickBoard();
    let playerBoard = this.renderPlayerDraftBoard();
    let othersBoard = this.renderOthersDraftBoard();
    return <>
      <div className='draft-card-container'>
        {playerPickBoard}
      </div>
      <div>
        {playerBoard}
        {othersBoard}
      </div>
    </>
  }
  
  renderCommonBoard = () => {
    const { G } = this.props;
    const placesOfPower = G.publicData.placesOfPowerInGame.map((pop)=>{
      return this.renderComponent(pop, 'place-of-power', null, () => this.onMouseOver(pop), () => this.onMouseOut(pop))
    })
    const magicItems = G.publicData.magicItems.map((magicItem)=>{
      return this.renderComponent(magicItem, 'magic-item', null, () => this.onMouseOver(magicItem), () => this.onMouseOut(magicItem))
    })
    const monuments = G.publicData.monumentsRevealed.map((monument)=>{
      return this.renderComponent(monument, 'card', null, () => this.onMouseOver(monument), () => this.onMouseOut(monument))
    })
    const monumentBack = {
      class: 'back_monument',
      id: 'back_monument',
      name: 'Monument',
      type: 'back',
    }
    const monumentsStack = this.renderComponent(monumentBack, 'card');
    return <>
      <div>
        <h5>Places of power ({G.publicData.placesOfPowerInGame.length} left)</h5>
        {placesOfPower}
      </div>
      <div>
        <h5>Magic Items</h5>
        {magicItems}
      </div>
      <div className="monuments">
        <h5>Monuments</h5>
        <div>{monumentsStack}</div>
        <div>{monuments}</div>
      </div>
    </>
  }

  renderPlayBoard = () => {
    let playerBoard = this.renderPlayerPlayBoard();
    let othersBoard = this.renderOthersPlayBoard();
    return null
  }

  render() {
    const { G, ctx, playerID, game, cardToZoom, profile } = this.props;
    console.log('G',G);
    
    if (!isLoaded(game)) {
      return <div className="loadingPanel alignCenter"><img className="loader" alt="Loading..."/>Loading...</div>
    }

    let winner = this.getWinner();
    
    let board = null;

    switch(G.phase) {
      case 'DRAFT_PHASE':
        board = this.renderDraftBoard();
        break;
      case 'PLAY_PHASE':
      default:
        board = this.renderPlayBoard();
    }
    const sizeSetting = profile && profile.cardSize || 'normal';
    return (<>
      <div className={'common-board ' + sizeSetting}>
        {this.renderCommonBoard()}
      </div>
      <div className="board">
        <h5>{G.phase}</h5>
        {board}
        {winner}
        {/*<Button variant="secondary" size="sm" onClick={(event) => this.handleEndGame(event)}>Game Over</Button>*/}
      </div>
      <div className="chat-container">
        <h5>Je suis le chat</h5>
        {cardToZoom && this.renderCardZoom()}
      </div>
      </>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    cardToZoom: state.game.zoomCard,
    currentGame: state.firestore.data.currentGame,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0],
    profile: state.firebase.profile,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearZoom: () => dispatch(clearZoom()),
    endGame: (gameId) => dispatch(endGame(gameId)),
    zoomCard: (card) => dispatch(zoomCard(card)),
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