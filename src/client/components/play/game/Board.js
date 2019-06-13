import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
import PropTypes from 'prop-types';
import './board.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect, isLoaded } from 'react-redux-firebase';
import { clearZoom, selectCard, tapComponent, zoomCard } from '../../../../store/actions/gameActions';
import Card from '../../common/card/Card'
import CardZoom from '../../common/card/CardZoom.js';
import Chat from '../../common/chat/Chat';

class ResArcanaBoard extends Component {

  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
  };

  /**
   * Return an array of players name with players id as index.
   */
  getPlayersName = () => {
    const { ctx, game } = this.props;
    let playersName = [ctx.numPlayers];
    Object.values(game.players).map((player) => {
      playersName[player.id] = player.name;
    })
    return playersName;
  }

  /**
   * Get the name of the next player.
   */
  getNextPlayer = () => {
    const { G, ctx, playerID } = this.props;    
    const nextPlayerID = ((G.draftWay === 'toLeftPlayer' ? 1 : ctx.numPlayers - 1) + parseInt(playerID)) % ctx.numPlayers
    return this.getPlayersName()[nextPlayerID]
  }

  /**
   * Function used to render components:
   * Artefacts, Mages, Magic Items, Monuments and Places of Power.
   */
  renderComponent = (card, cardType, handleClick, handleDoubleClick, handleMouseOver, handleMouseOut) => {
    const { profile, selectedCard, tappedComponents } = this.props;
    const src = require('../../../assets/image/components/' + card.type + '/' + card.class + '.png');
    const cardSize = (profile.cardSize ? profile.cardSize : ' normal ');
    const active = selectedCard && selectedCard.id === card.id ? ' active ' : '';
    console.log('tappedComponents',tappedComponents)
    const tapped = tappedComponents.indexOf(card.id) >= 0 ? ' tapped ' : '';
    return (
      <div
        key={card.id}
        className={ cardSize + ' vertical ' + cardType + active + tapped }
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <Card
          classes={cardSize +' vertical '+ cardType}
          src={ src }
          show={ true } 
          alt={ card.name ? card.name : null } 
        />
      </div>
    );
  }

  /**
   * Render the component to Zoom.
   */
  renderCardZoom = () => {
    const { cardToZoom, profile } = this.props
    const src = require('../../../assets/image/components/' + cardToZoom.type + '/' + cardToZoom.class + '.png');
    return <div className={'card-zoom-frame ' + (profile.cardSize ? profile.cardSize : 'normal')}>
      <CardZoom src={src} show={true} alt={cardToZoom.name}  />
    </div>
  }

  renderFirstPlayerToken = (flip) => {
    const { profile } = this.props;
    let passe = flip ? '_passe': '';
    const src = require('../../../assets/image/components/premier_joueur' + passe + '.png');
    return <div className={'first-player ' + (profile.cardSize ? profile.cardSize : 'normal')}>
      <img src={src} alt={'First Player'}  />
    </div>
  }

  tapComponent = (card) => {
    this.props.tapComponent(card);
  }

  handleClick = (card) => {
    this.props.selectCard(card);
  }

  /**
   * Define the card to zoom on mouse over.
   */
  handleMouseOver = (card) => {
    if (card.type !== 'back')
    this.props.zoomCard(card);
  }

  /**
   * Hide the card to zoom on mouse out.
   */
  handleMouseOut = () => {
    this.props.clearZoom();
  }

  /**
   * Render the chat.
   */
  renderChat = () => {
    const { chat, game } = this.props
    return <Chat chat={chat} chatId={game.id} chatName={game.name + ' Chat'}/>
  }

  /**
   * Render the common components for the game:
   * Places of Power, Magic Items and Monuments.
   */
  renderCommonBoard = () => {
    const { G } = this.props;
    const placesOfPower = G.publicData.placesOfPowerInGame.map((pop)=>{
      return this.renderComponent(pop, 'place-of-power', () => this.tapComponent(pop), null,() => this.handleMouseOver(pop), () => this.handleMouseOut(pop))
    })
    const magicItems = G.publicData.magicItems.map((magicItem)=>{
      return this.renderComponent(magicItem, 'magic-item', () => this.tapComponent(magicItem), null, () => this.handleMouseOver(magicItem), () => this.handleMouseOut(magicItem))
    })
    const monuments = G.publicData.monumentsRevealed.map((monument)=>{
      return this.renderComponent(monument, 'card', () => this.tapComponent(monument), null, () => this.handleMouseOver(monument), () => this.handleMouseOut(monument))
    })
    const monumentBack = {
      class: 'back_monument',
      id: 'back_monument',
      name: 'Monument',
      type: 'back',
    }
    const monumentsStack = this.renderComponent(monumentBack, 'card');
    return <>
      <div className="components">
        <h5>Places of power ({G.publicData.placesOfPowerInGame.length} left)</h5>
        <div className="place-of-power-container">
          {placesOfPower}
        </div>
      </div>
      <div className="components">
        <h5>Magic Items</h5>
        <div className="magic-item-container">
          {magicItems}
        </div>
      </div>
      <div className="components">
        <h5>Monuments</h5>
        <div className="monument-container">
          {monumentsStack}
          <div className="monument">{monuments}</div>
        </div>
      </div>
    </>
  }

  /**
   * This function render the board during Draft Phase.
   */
  renderDraftBoard = () => {
    let playerPickBoard = this.renderPickBoard();
    let playerBoard = this.renderPlayerDraftBoard();
    let othersBoard = this.renderOthersDraftBoard();
    return <>
      <div className="draft-card-container">
        {playerPickBoard}
        {playerBoard}
        {othersBoard}
      </div>
    </>
  }
  
  /**
   * Render the board during Draft Phase.
   * This board is player specific and will not be available for spectators.
   * The board show draft cards when player have to pick a card.
   */
  renderPickBoard = () => {
    const { auth, game, G, playerID, profile, selectedCard } = this.props;
    if (!Number.isInteger(parseInt(playerID))) return null;
    
    const playerName = game.players[auth.uid] ? game.players[auth.uid].name : 'spectator';
    const firstPlayer = G.publicData.firstPlayer === playerID ? this.renderFirstPlayerToken() : null;

    const draftCards = G.players[playerID] && G.players[playerID].draftCards.map((card) => {
      return this.renderComponent(card, 'card', () => this.handleClick(card), () => this.pickArtefact(card.id), () => this.handleMouseOver(card), () => this.handleMouseOut(card))
    });
    
    const emptyHand = G.players[playerID].draftCards.length === 0;
    const waitingWithoutCard = G.publicData.waitingFor.length > 0 && emptyHand
    const deckFull = G.players[playerID].deck.length === 8
    const deniedCards = G.players[playerID] && G.players[playerID].deniedCards.map((card) => {
      const cardBack = {
        class: 'back_artefact',
        id: card.id+'_back_artefact',
        name: 'Artefact',
        type: 'back',
      }
      return this.renderComponent(cardBack, 'card',)
    });

    const playersName = this.getPlayersName()
    let waitingFor = 'Waiting for ';
    G.publicData.waitingFor.forEach((id, index) => {
      let isLastPlayer = index === G.publicData.waitingFor.length - 1
      let waitingAtLeastTwoPlayers = G.publicData.waitingFor.length > 1;
      let beforeLastPlayer = index === G.publicData.waitingFor.length - 2
      waitingFor += playersName[parseInt(id)]

      waitingFor += isLastPlayer ? '.' :  waitingAtLeastTwoPlayers && beforeLastPlayer ? ' and ' : ', '
    })
    const lastDraftCard = G.players[playerID].draftCards.length === 1
    const confirmButton = <Button variant="primary" size="sm" onClick={() => this.pickArtefact(selectedCard.id)} disabled={!selectedCard}>Confirm</Button>
    const cancelButton = !lastDraftCard && <Button variant={!selectedCard ? 'primary' : 'secondary'} size="sm" onClick={() => this.handleClick(undefined)} disabled={!selectedCard}>Cancel</Button>
    const nextPlayer = this.getNextPlayer();
    return <>
      <div className="ruban">
        <div className="player-name">{playerName}</div><div>{firstPlayer}</div>
      </div>
      <div className='draft-card-panel'>
        <h5>Draft Phase - Artefact selection {G.players[playerID].deck.length}/8</h5>
        <div className={'draft-card card-row ' + profile.cardSize}>
          {draftCards}
          {deniedCards}
        </div>
        {waitingWithoutCard ? 
            <h5>{waitingFor}</h5> 
          : 
            selectedCard ?
            <div class="info">Keep {selectedCard.name} {!lastDraftCard && 'and pass the rest to '  + nextPlayer + ' ?'}</div>
          :
            <div class="info">Select an artefact to add into your deck.</div>
        }
        {!deckFull && <div className={waitingWithoutCard ? 'game-button hidden': 'game-button'}>
          {confirmButton} {cancelButton}
        </div>}
      </div>
    </>
  }

  /**
   * This action is used to select cards during draft phase.
   */
  pickArtefact = (cardId) => {
    const { isActive, playerID } = this.props;
    if (isActive) {
      this.props.moves.pickArtefact(playerID, cardId);
    }
    this.props.selectCard(undefined);
  };

  /**
   * This board render the cards selected by the player during Draft Phase.
   * This board is player specific and will not be available for spectators.
   */
  renderPlayerDraftBoard = () => {
    const { G, playerID, profile } = this.props;
    if (!Number.isInteger(parseInt(playerID))) return null;

    const deck = G.players[playerID].deck.map((card)=>{
      return this.renderComponent(card, 'card', null, null, () => this.handleMouseOver(card), () => this.handleMouseOut(card));
    })

    const mages = G.players[playerID].mages.map((card)=>{
      return this.renderComponent(card, 'card', null, null, () => this.handleMouseOver(card), () => this.handleMouseOut(card));
    })

    return <>
      <div className={'artefacts card-row ' + profile.cardSize}>
        {mages}
        {deck}
      </div>
    </>
  }

  /**
   * This board render the back of the cards selected by others player during Draft Phase.
   */
  renderOthersDraftBoard = () => {
    const { ctx, G, game, playerID, profile } = this.props;
    const othersNextId = Object.keys(G.publicData.players).filter((id) => {
      return id !== playerID && id > playerID
    });
    const othersPrevId = Object.keys(G.publicData.players).filter((id) => {
      return id !== playerID && id < playerID
    });
    const othersId = othersNextId.concat(othersPrevId);
    const playersName = this.getPlayersName()
    const boards = othersId.map((id) =>{
      const playerName = playersName[parseInt(id)];
      const deckSize = G.publicData.players[id].deckSize
      
      const cardmage = {
        class: 'back_mage',
        id: 'back_mage',
        name: 'Mage',
        type: 'back',
      }
      let mages = []
      mages.push(this.renderComponent({...cardmage, id: 'back_mage_1'}, 'card'));
      mages.push(this.renderComponent({...cardmage, id: 'back_mage_2'}, 'card'));

      const cardArtefact = {
        class: 'back_artefact',
        id: 'back_artefact',
        name: 'Artefact',
        type: 'back',
      }
      let deck = []
      for(let i = 0; i< deckSize; i++) {
        cardArtefact.id = id + '_' + i + '_back_artefact'
        deck.push(this.renderComponent(cardArtefact, 'card'));
      }

      const firstPlayer = G.publicData.firstPlayer === id ? this.renderFirstPlayerToken() : null;

      return (
        <div key={id}>
          <div className="ruban">
            <div className="player-name">{playerName}</div><div>{firstPlayer}</div>
          </div>
          <div className={'card-row ' + profile.cardSize}>
            {mages}{deck}
          </div>
        </div>
      );
    });
    return <>
      {boards}
    </>
  }

  renderPlayerPlayBoard = () => {
    return null
  }

  renderOthersPlayBoard = () => {
    return null
  }

  renderPlayBoard = () => {
    return <>
      <div className='draft-card-container'>
        <h5>Play Phase</h5>
      </div>
    </>
  }

  render() {
    const { G, ctx, playerID, game, cardToZoom, profile } = this.props;
    console.log('G',G);
    
    if (!isLoaded(game)) {
      return <div className="loading-panel align-center"><img className="loader" alt="Loading..."/>Loading...</div>
    }

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
    const layoutSetting = profile && profile.layout || 'vertical';
    return <div className={'board-'+layoutSetting}>
      <div className={'common-board ' + sizeSetting}>
        {this.renderCommonBoard()}
      </div>
      <div className="board">
        {board}
      </div>
      <div className="right-panel">
        {cardToZoom && this.renderCardZoom()}
        {this.renderChat()}
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    chat : state.firestore.ordered.chat && state.firestore.ordered.chat[0],
    cardToZoom: state.game.zoomCard,
    currentGame: state.firestore.data.currentGame,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0],
    profile: state.firebase.profile,
    selectedCard: state.game.selectedCard,
    tappedComponents: state.game.tappedComponents,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearZoom: () => dispatch(clearZoom()),
    selectCard: (card) => dispatch(selectCard(card)),
    tapComponent: (card) => dispatch(tapComponent(card)),
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
    { collection: 'chats',
      doc: props.currentGame.gameId,
      storeAs: 'chat'
    }
  ])
)(ResArcanaBoard)