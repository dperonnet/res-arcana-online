import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types'
import './board.scss'
import './essence.scss'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { addToEssencePickerSelection, canPayCost, clearZoom, resetCollect, resetEssencePickerSelection, selectAction, 
  selectComponent, setFocusZoom, zoomCard, setCollectAction, setEssencePickerSelection } from '../../../../store/actions/gameActions'
import { toggleChat } from '../../../../store/actions/chatActions'
import CardZoom from '../../common/card/CardZoom.js'
import Chat from '../../common/chat/Chat'
import GameComponent from './GameComponent'
import CollectComponent from './CollectComponent'
import EssencePicker from './EssencePicker'

const CARD_BACK_ARTEFACT = {
  class: 'back_artefact',
  id: 'back_artefact',
  name: 'Artefact',
  type: 'backArtefact',
}

const CARD_BACK_MAGE = {
  class: 'back_mage',
  id: 'back_mage',
  name: 'Mage',
  type: 'backMage',
}

const CARD_BACK_MONUMENT = {
  class: 'back_monument',
  id: 'back_monument',
  name: 'Monument',
  type: 'backMonument',
  costEssenceList : [{type: 'gold', quantity: 4}],
  hasCost: true
}

let interval

/**
 * The ResArcanaBoard is divide in 3 parts :
 * -The common board: containing the components available for all the players.
 * -The board: containing the dialog panel for interaction during the differents phases of the game
 * and the players's public board, i.e all the visible informations of all the players.
 * -The chat: containing players's messages and all the events occuring during the game.
 */
class ResArcanaBoard extends Component {

  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
  }

  componentDidMount = () => {
    this.props.resetCollect()
  }

  /**
   * Return an array of players name with players id as index.
   */
  getPlayersName = () => {
    const { ctx, game } = this.props
    let playersName = [ctx.numPlayers]
    Object.values(game.players).forEach((player) => {
      playersName[player.id] = player.name
    })
    return playersName
  }

  /**
   * Get the name of the next player.
   */
  getNextPlayer = () => {
    const { G, ctx, playerID } = this.props    
    const nextPlayerID = ((G.draftWay === 'toLeftPlayer' ? 1 : ctx.numPlayers - 1) + parseInt(playerID)) % ctx.numPlayers
    return this.getPlayersName()[nextPlayerID]
  }

  /**
   * Get the location of the selected component on the board.
   * Only artefacts can be in play, in hand or in the discard pile.
   * Others components are either in play or available in common board.
   */
  getComponentLocation = () => {
    const { G, ctx, playerID, selectedComponent } = this.props

    switch (selectedComponent.type) {
      case 'artefact':
        if (G.players[playerID].hand.filter((component) => {return component.id === selectedComponent.id}).length > 0) {
          return { location: 'HAND', playerId: playerID }
        } else {
          for (let id=0; id < ctx.numPlayers; id++) {
            if (G.publicData.players[id].discard.filter((component) => {return component.id === selectedComponent.id}).length > 0) {
              return { location: 'DISCARD', playerId: id }
            } else if (G.publicData.players[id].inPlay.filter((component) => {return component.id === selectedComponent.id}).length > 0) {
              return { location: 'PLAY', playerId: id }
            }
          }
          return { location: 'COMMON_BOARD' }
        }
      case 'mage':
      case 'placeOfPower':
      case 'monument':
      case 'magicItem':
        for (let id=0; id < ctx.numPlayers; id++) {
          if (G.publicData.players[playerID].inPlay.filter((component) => {return component.id === selectedComponent.id}).length > 0) {
            return { location: 'PLAY', playerId: id }
          }
        }
        return { location: 'COMMON_BOARD' }
      default:
        return { location: 'COMMON_BOARD' }
    }
  }

  /**
   * Select the clicked component.
   */
  handleClick = (e, component) => {
    const { board } = this.refs
    e.stopPropagation();
    board.scrollTop = 0
    this.props.selectComponent(component)

    if (component) {
      let canPayCost
      if (component.hasCost) {
        canPayCost = this.canPayCost(component)
        const preSelection = !!canPayCost.fixedCost ? canPayCost.fixedCost: canPayCost.minEssencePayList
        this.props.setEssencePickerSelection(preSelection)
      }
      this.props.setCanPayCost(component.hasCost ? canPayCost : {valid: true})
    }
  }

  /**
   * Hide the zoomed card on board click.
   */
  handleBoardClick = () => {
    this.props.zoomCard()
    clearInterval(interval)
  }

  /**
   * Toggle focus on zoom frame in order to deal with card superposition on small screen.
   */
  handleMouseClickZoom = (event) => {
    event.stopPropagation()
    const { focusZoom } = this.props
    this.props.setFocusZoom(!focusZoom)
  }

  /**
   * Define the component to zoom on mouse over.
   */
  handleMouseOver = (component) => {
    const { profile } = this.props
    clearInterval(interval)
    if (component && !component.type.startsWith('back')) {
      interval = setInterval(() => this.props.zoomCard(component), profile.zoomFadeTime ? profile.zoomFadeTime : 600)
    }
  }

  /**
   * Hide the card to zoom on mouse out.
   */
  handleMouseOut = () => {
    const { profile } = this.props
    clearInterval(interval)
    interval = setInterval(() => this.props.clearZoom(), profile.zoomFadeTime ? profile.zoomFadeTime : 3000)
  }

  /**
   * Reset the player's collect actions.
   */
  handleResetCollect = () => {
    this.props.resetCollect()
  }

  /**
   * Show / hide the chat.
   */
  handleToggleChat = () => {
    this.props.toggleChat()
  }
  
  /**
   * Trigger the pick artefact move.
   * Used during the draft phase.
   */
  pickArtefact = (cardId) => {
    const { isActive, playerID } = this.props
    if (isActive) {
      this.props.moves.pickArtefact(playerID, cardId)
    }
    this.props.selectComponent(undefined)
    this.handleBoardClick()
  }

  /**
   * Trigger the select mage move.
   * Used at the end of the draft phase.
   */
  pickMage = (cardId) => {
    const { isActive, playerID } = this.props
    if (isActive) {
      this.props.moves.pickMage(playerID, cardId)
    }
    this.props.selectComponent(undefined)
    this.handleBoardClick()
  }
  
  /**
   * Trigger the pick magic item move.
   */
  pickMagicItem = (cardId) => {
    const { isActive } = this.props
    if (isActive) {
      this.props.moves.pickMagicItem(cardId)
    }
    this.props.selectComponent(undefined)
    this.props.setCanPayCost({})
    this.handleBoardClick()
  }
  
  /**
   * Trigger the collect essence move.
   */
  collectEssences = () => {
    const { collectActions, collectOnComponentActions } = this.props
    this.props.moves.collectEssences(collectActions, collectOnComponentActions)
    this.props.events.endTurn()
  }

  /**
   * Trigger the discard artefact move.
   */
  discardArtefact = (cardId, essenceList) => {
    const { isActive, selectAction } = this.props
    if (isActive) {
      this.props.moves.discardArtefact(cardId, essenceList)
    }
    this.props.selectComponent(undefined)
    this.props.setCanPayCost({})
    this.handleBoardClick()
    selectAction(undefined)
  }

  /**
   * Trigger the place component move.
   */
  placeComponent = (type, id,essenceList) => {
    const { isActive, selectAction } = this.props
    if (isActive) {
      this.props.moves.placeComponent(type, id, essenceList)
    }
    this.props.selectComponent(undefined)
    this.props.setCanPayCost({})
    this.handleBoardClick()
    selectAction(undefined)
  }

  /**
   * Trigger the pass move.
   */
  pass = (magicItemId) => {
    const { isActive, selectAction } = this.props
    if (isActive) {
      this.props.moves.pass(magicItemId)
    }
    this.props.selectComponent(undefined)
    this.props.setCanPayCost({})
    this.handleBoardClick()
    selectAction(undefined)
  }

  /**
   * Render the component to Zoom.
   */
  renderCardZoom = () => {
    const { G, cardToZoom, focusZoom } = this.props
    const component = cardToZoom
    const src = require('../../../assets/image/components/' + component.type + '/' + component.class + '.jpg')
    const playerOwningCard = Object.values(G.publicData.players).filter((player) => {
      return Object.keys(player.essencesOnComponent).includes(component.id)
    })[0]
    const focus = focusZoom ? ' focus ': ''
    const essencesOnComponent = playerOwningCard ? playerOwningCard.essencesOnComponent[component.id] : null
    return <div className={'card-zoom-frame large' + focus} 
      onClick={(event) => this.handleMouseClickZoom(event)} 
      onMouseOver={() => this.handleMouseOver(component)} 
      onMouseOut={() => this.handleMouseOut()}>
      <CardZoom src={src} alt={component.name} essencesOnComponent={essencesOnComponent}/>
    </div>
  }

  /**
   * Render the first player token.
   */
  renderFirstPlayerToken = (playerId) => {
    const { G } = this.props
    let passe = G.passOrder.includes(playerId) ? '_passe': ''
    const src = require('../../../assets/image/components/premier_joueur' + passe + '.png')
    return G.publicData.firstPlayer === playerId && <img src={src} alt={'First Player'}  />
  }

  /**
   * Render the player essence pool
   */
  renderPlayerPool = (id) => {
    const { G } = this.props
    const essences = ['elan', 'life', 'calm', 'death', 'gold']
    return essences.map((essence, index) => {
      return <div className={'essence ' + essence} key={index}>
        {G.publicData.players[id].essencesPool[essence]}
      </div>
    })
  }

  /**
   * Render the game component: cards, magic items and places of power.
   */
  renderGameComponent = (component, args) => {
    return <GameComponent
      key={component.id}
      component={component} 
      onMouseOver={() => this.handleMouseOver(component)}
      onMouseOut={() => this.handleMouseOut()}
      onClick={args && args.onClick ? args.onClick : (event) => event.stopPropagation()}
      {...args}
    />
  }

  /**
   * Render the chat.
   */
  renderChat = () => {
    const { chat, game } = this.props
    return <>
      <Chat chat={chat} chatId={game.id} chatName={game.name + ' Chat'}/>
        <div className="close close-chat" onClick={this.handleToggleChat}>
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </div>
    </>
  }

  /**
   * Render the common components for the game:
   * Places of Power, Magic Items and Monuments.
   */
  renderCommonBoard = () => {
    const { G, canPayCost, selectAction} = this.props
    const handleClick = (component) => {
      return G.phase === 'PLAY_PHASE' ? {
        onClick: (event) => {
          this.handleClick(event, component)
          switch (component.type) {
            case 'magicItem':
              selectAction('PASS')
              break
            case 'monument':
            case 'backMonument':
            case 'placeOfPower':
              selectAction('CLAIM')
              break
            default:
          }
        }
      } : null
    }
    const renderGameComponents = (components) => {
      return components && components.map((component) => {
        return this.renderGameComponent(component, handleClick(component))
      })
    }

    const placesOfPower = renderGameComponents(G.publicData.placesOfPowerInGame)
    const magicItems = renderGameComponents(G.publicData.magicItems)
    const monumentsStack = renderGameComponents([copy(CARD_BACK_MONUMENT)])
    const monuments = renderGameComponents(G.publicData.monumentsRevealed)
    return <>
      <div className={'components' + (canPayCost.valid ? '' : ' invalid')}>
        <h5>Places of power ({G.publicData.placesOfPowerInGame.length} left)</h5>
        <div className="place-of-power-container">
          {placesOfPower}
        </div>
      </div>
      <div className={'components' + (canPayCost.valid ? '' : ' invalid')}>
        <h5>Monuments ({G.publicData.monumentsStack.length + G.publicData.monumentsRevealed.length} left)</h5>
        <div className="monument-container">
          {G.publicData.monumentsStack.length > 0 && monumentsStack}
          <div className="monuments-revealed">{monuments}</div>
        </div>
      </div>
      <div className="components">
        <h5>Magic Items</h5>
        <div className="magic-item-container">
          {magicItems}
        </div>
      </div>
    </>
  }

  /**
   * This is the main rendering board function called on every phases.
   * The only param is the players's dialog board to render.
   */
  renderBoard = (dialogBoard) => {
    const { playerID } = this.props
    const playerRuban = this.renderPlayerRuban(playerID)
    const playerBoard = this.renderPlayerBoard(playerID)
    const othersBoard = this.renderOthersBoard()
    return <>
      <div className="board-container">
        {dialogBoard}
        {playerRuban}
        {playerBoard}
        {othersBoard}
      </div>
    </>
  }

  /**
   * This function render the Ruban for a specific player.
   * The ruban contains : player name, first player token, essence pool and hand size.
   */
  renderPlayerRuban = (playerId) => {
    const { G, ctx } = this.props
    const playerName = this.getPlayersName()[parseInt(playerId)]
    const firstPlayer = this.renderFirstPlayerToken(playerId)
    const playerPool = this.renderPlayerPool(playerId)
    const handSize = G.publicData.players[playerId].handSize
    const activePlayer = G.phase !== 'DRAFT_PHASE' && playerId === ctx.currentPlayer ? ' active-player': ''
    const passed = G.passOrder.includes(playerId) ? ' passed': ''
    
    return <div className={'ruban ' + activePlayer + passed}>
      <div className="leftCell">
        <div className="first-player">{firstPlayer}</div>
        <div className="player-name">{playerName}</div>
      </div>
      <div className="rightCell">
        <div className="player-pool">{playerPool}</div>
        <div className="cards-in-hand-icon">{handSize}</div>
      </div>
    </div>
  }

  /**
   * This function render the draw pile and the discard pile of a player.
   */
  renderPlayerDrawPileAndDiscard = (playerId) => {
    const { G } = this.props
    
    const countDeck = G.publicData.players[playerId].deckSize
    const countDiscard = G.publicData.players[playerId].discard.length
    const drawPile = copy(CARD_BACK_ARTEFACT)
    drawPile.playerId = playerId + '_back_artefact'
    const discardPile = countDiscard > 0 ? G.publicData.players[playerId].discard[countDiscard - 1] : drawPile
    return <div className="draw-pile">
      <div className="card-container discard">
        <span className="component-legend">Discard ({countDiscard})</span>
        {this.renderGameComponent(discardPile, {classes: countDiscard > 0 ? '' : ' empty', discard: true})}
      </div>
      <div className="card-container">
        <span className="component-legend">Draw pile ({countDeck})</span>
        {this.renderGameComponent(drawPile, {classes: countDeck > 0 ? '' : ' empty'})}
      </div>
    </div>
  }

  /**
   * Render the cards in the hand of the player.
   */
  renderPlayerHand = (separator = true) => {
    const { G, playerID, profile, selectAction } = this.props
    let hand
    let fixedHeight
    switch (G.phase) {
      case 'PLAY_PHASE':
        hand = G.players[playerID].hand.map((card) => {
          return this.renderGameComponent(card, {
            onClick: (event) => {
              this.handleClick(event, card) 
              clearInterval(interval)
              selectAction('HAND')
            }
          })
        })
        fixedHeight = !separator ? ' action-row' : ''
        break
      default:
        hand = G.players[playerID].hand.map((card) => {
          return this.renderGameComponent(card)
        })
    }
    return <div className={'card-row flex-col ' + profile.cardSize + fixedHeight}>
      {separator && <div className="separator"></div>}
      <div className="action-container">
        <div className="action-component">
          {hand}
        </div>
      </div>
      <h5 className="directive">Cards in hand ({G.publicData.players[playerID].handSize})</h5>
    </div>;
  }

  /**
   * This board render the in play components of a player.
   * This board is player specific and is not available for spectators during draft phase.
   */
  renderPlayerBoard = (id) => {
    const { G, playerID, profile } = this.props
    if (!Number.isInteger(parseInt(id))) return null

    let cards = null
    let magicItem = null
    let drawPileAndDiscard = this.renderPlayerDrawPileAndDiscard(id)
    let essencesOnComponent = null
    let turnedComponents = G.publicData.turnedComponents
    switch (G.publicData.players[playerID].status) {
      case 'DRAFTING_ARTEFACTS':
        const mages = G.players[playerID].mages.map((card) => {
          return this.renderGameComponent(card)
        })
        const deck = G.players[playerID].hand.map((card) => {
          return this.renderGameComponent(card)
        })
        cards = <>{mages}{deck}</>
        break
      case 'SELECTING_MAGE':
        break
      case 'READY':
      default:
        essencesOnComponent = G.publicData.players[id].essencesOnComponent
        magicItem = G.publicData.players[id].inPlay.filter((component) => component.type === 'magicItem').map((card) => {
          let args = {essencesOnComponent: essencesOnComponent[card.id], turnedComponents}
          if (card.type === 'magicItem' && G.passOrder.includes(id)) {
            args.specificName = 'passe'
          }
          return this.renderGameComponent(card, args)
        })
        cards = G.publicData.players[id].inPlay.filter((component) => component.type !== 'magicItem').map((card) => {
          let args = {essencesOnComponent: essencesOnComponent[card.id], turnedComponents}
          return this.renderGameComponent(card, args)
        })
    }

    return <>
      <div className={'in-play card-row ' + profile.cardSize}>
        {drawPileAndDiscard}
        {magicItem}
        {cards}
      </div>
    </>
  }

  /**
   * This board render the back of the cards selected by others player during Draft Phase.
   */
  renderOthersBoard = () => {
    const { G, playerID, profile } = this.props
    const othersNextId = Object.keys(G.publicData.players).filter((id) => {
      return id !== playerID && id > playerID
    })
    const othersPrevId = Object.keys(G.publicData.players).filter((id) => {
      return id !== playerID && id < playerID
    })
    const othersId = othersNextId.concat(othersPrevId)
    
    let boards = null;
    let drawPileAndDiscard = (id) => this.renderPlayerDrawPileAndDiscard(id)
    switch (G.publicData.players[playerID].status) {
      case 'DRAFTING_ARTEFACTS':
      case 'SELECTING_MAGE':
        boards = othersId.map((id) => {
          const playerRuban = this.renderPlayerRuban(id)
          let cards = []
          let cardMage = copy(CARD_BACK_MAGE)
          cards.push(this.renderGameComponent({...cardMage, id: 'back_mage_1'}))
          if (G.publicData.players[id].status !== 'READY') {
            cards.push(this.renderGameComponent({...cardMage, id: '_back_mage_2'}))
          }
          return (
            <div key={id}>
              {playerRuban}
              <div className={'card-row ' + profile.cardSize}>
                {cards}
                {drawPileAndDiscard(id)}
              </div>
            </div>
          )
        })
        break
      case 'READY':
      default:
        boards = othersId.map((id) =>{
          const playerRuban = this.renderPlayerRuban(id)
          let cards = []
          if (G.publicData.players[id].status === 'SELECTING_MAGE' || G.publicData.players[id].status === 'DRAFTING_ARTEFACTS') {
            let cardMage = copy(CARD_BACK_MAGE)
            cards.push(this.renderGameComponent({...cardMage, id: 'back_mage_1'}))
            cards.push(this.renderGameComponent({...cardMage, id: '_back_mage_2'}))
          } else {
            cards = this.renderPlayerBoard(id)
          }
          return (
            <div key={id}>
              {playerRuban}
              {cards}
            </div>
          )
        })
    }
    return boards
  }

  /**
   * Render the board during Draft Phase.
   * This board is player specific and will not be available for spectators.
   * The board show draft cards when player have to pick a card.
   */
  renderDraftDialog = () => {
    const { G, playerID, profile, selectedComponent } = this.props
    if (!Number.isInteger(parseInt(playerID))) return null

    let title = 'Draft Phase'
    let waiting = false
    let waitingFor = 'Waiting for '
    let showCards = true
    let showButtons = true
    let draftCards = null
    let hand = null
    let directive = null
    let handleConfirm = null;
    const lastDraftCard = G.players[playerID].draftCards.length && G.players[playerID].draftCards[0].length === 1
    const nextPlayer = this.getNextPlayer()
    const playersName = this.getPlayersName()

    switch (G.publicData.players[playerID].status) {
      case 'DRAFTING_ARTEFACTS':
        title += ` - Artefact selection ${G.publicData.players[playerID].handSize + 1}/8`
        
        const emptyHand = G.players[playerID].draftCards.length === 0
        waiting = emptyHand
        
        draftCards = G.players[playerID].draftCards.length > 0 && G.players[playerID].draftCards[0].map((card) => {
          return this.renderGameComponent(card, {onClick: (event) => this.handleClick(event, card), onDoubleClick: () => this.pickArtefact(card.id)})
        })
      
        directive = selectedComponent ?
          <h5 className="directive">Keep {selectedComponent.name} {!lastDraftCard && 'and pass the rest to '  + nextPlayer + ' ?'}</h5>
        :
          <h5 className="directive">Select an artefact to add into your deck.</h5>
        
        G.publicData.waitingFor.forEach((id, index) => {
          let isLastPlayer = index === G.publicData.waitingFor.length - 1
          let waitingAtLeastTwoPlayers = G.publicData.waitingFor.length > 1
          let beforeLastPlayer = index === G.publicData.waitingFor.length - 2
          waitingFor += playersName[parseInt(id)]
          waitingFor += isLastPlayer ? '.' :  waitingAtLeastTwoPlayers && beforeLastPlayer ? ' and ' : ', '
        })
        handleConfirm = () => this.pickArtefact(selectedComponent.id)
        break
      case 'SELECTING_MAGE':
        title += ` - Mage selection`
        
        draftCards = G.players[playerID].mages.length > 0 && G.players[playerID].mages.map((card) => {
          return this.renderGameComponent(card, {onClick: (event) => this.handleClick(event, card), onDoubleClick: () => this.pickMage(card.id)})
        })
        directive = selectedComponent ?
          <h5 className="directive">Keep {selectedComponent.name} ?</h5>
        :
          <h5 className="directive">Select your mage.</h5>
        handleConfirm = () => this.pickMage(selectedComponent.id)
        
        hand = this.renderPlayerHand()
        
        break
      case 'READY':
        title = `Get Ready to pick your magic item`
        showCards = false
        
        const playersNotReady = Object.entries(G.publicData.players).filter((player) => {
          return player[1].status !== 'READY'
        })
        playersNotReady.forEach((player, index) => {
          let isLastPlayer = index === playersNotReady.length - 1
          let waitingAtLeastTwoPlayers = playersNotReady.length > 1
          let beforeLastPlayer = index === playersNotReady.length - 2
          waitingFor += playersName[parseInt(player[0])]
          waitingFor += isLastPlayer ? '.' :  waitingAtLeastTwoPlayers && beforeLastPlayer ? ' and ' : ', '
        })
        waiting = true
        showButtons = false
        hand = this.renderPlayerHand()
        break
      default:
    }

    const confirmButton = <div className={'action-button' + (selectedComponent ? ' valid' : ' disabled')}
      onClick={selectedComponent && handleConfirm}>Confirm</div>
    const cancelButton = !lastDraftCard && <div className="action-button" onClick={selectedComponent && ((event) => this.handleClick(event))}>Cancel</div>
    
    return <>
      <div className='dialog-panel'>
        <h5>{title}</h5>
        {showCards && <div className={'card-row ' + profile.cardSize}>
          {draftCards}
        </div>}
        {waiting ? <h5 className="directive">{waitingFor}</h5> : <>{directive}</>}
        {showButtons && <div className={waiting ? 'button-list hidden': 'button-list'}>
          {confirmButton} {cancelButton}
        </div>}
        {hand}
      </div>
    </>
  }

  /**
   * Render the board Magic Item selection Phase.
   * This board is player specific and will not be available for spectators.
   * The board show magic items available and allow the player to swap his magic item on his turn.
   */
  renderMagicItemDialog = () => {
    const { G, ctx, playerID, profile, selectedComponent } = this.props
    if (!Number.isInteger(parseInt(playerID))) return null
    const playersName = this.getPlayersName()

    let title = 'Magic Item Selection Phase'
    let waiting = playerID !== ctx.currentPlayer
    let waitingFor = 'Waiting for ' + playersName[parseInt(ctx.currentPlayer)] + ' to pick a Magic Item.'
    let hand = this.renderPlayerHand()
    let magicItems = G.publicData.magicItems.map((magicItem) => {
      return waiting ?
        this.renderGameComponent(magicItem)
      :
      this.renderGameComponent(magicItem, {onClick: (event) => this.handleClick(event, magicItem), onDoubleClick: () => this.pickMagicItem(magicItem.id)})
    })
  
    let directive = null
    let handleConfirm = null
    let showButtons = true

    switch (G.publicData.players[playerID].status) {
      case 'SELECTING_MAGIC_ITEM':
        directive = <h5 className="directive">Select a Magic Item.</h5>
        handleConfirm = () => this.pickMagicItem(selectedComponent.id)
        break
      case 'READY':
      default:
        title = `Get Ready for the battle`
        showButtons = false
    }

    const confirmButton = <div className={'action-button' + (selectedComponent ? ' valid' : ' disabled')} onClick={selectedComponent && handleConfirm}>Confirm</div>
    const cancelButton = <div className="action-button" onClick={selectedComponent && ((event) => this.handleClick(event))}>Cancel</div>
    
    return <>
      <div className='dialog-panel'>
        <h5>{title}</h5>
        <div className={'card-row ' + profile.cardSize}>
          {magicItems}
        </div>
        {waiting ? <h5 className="directive">{waitingFor}</h5> : <>{directive}</>}
        <div className={!showButtons ? 'button-list hidden': 'button-list'}>
          {confirmButton} {cancelButton}
        </div>
        {hand}
      </div>
    </>
  }

  /**
   * Render the board during Collect Phase.
   * This board is player specific and will not be available for spectators.
   * The board show all the components that can or must be activated on collect Phase.
   */
  renderCollectDialog = () => {
    const { G, ctx, playerID, profile, collectActions, collectOnComponentActions } = this.props
    if (!Number.isInteger(parseInt(playerID))) return null

    const playersName = this.getPlayersName()
    const essencesOnComponent = G.publicData.players[playerID].essencesOnComponent
    // essencesOnComponentRef is used to maintain the display of the component once his essences have been removed by collect.
    const essencesOnComponentRef = G.players[playerID].uiTemp.essencesOnComponent
    let title = 'Collect Phase'
    let waiting = playerID !== ctx.currentPlayer
    let waitingFor = ' - ' + playersName[parseInt(ctx.currentPlayer)] + '\'s turn.'
    let hand = this.renderPlayerHand()
    let showButtons = true
    let directive = null
    let handleConfirm = null
    let collectValid = true
    let costValid = true
    let sumCollects = {}
    let missingEssences = {}

    // Only components containing essences or collect ability are concerned.
    let components = G.publicData.players[playerID].inPlay.filter((component) => {
      return Object.keys(essencesOnComponentRef).includes(component.id) ||
        component.hasStandardCollectAbility || component.hasSpecificCollectAbility
    })
    // Render those components with CollectComponent to collect essence.
    let collectComponents = components.map((component, index) => {
      let essences = collectOnComponentActions[component.id] ? null : essencesOnComponent[component.id]
      return <CollectComponent 
        component={component} 
        essencesOnComponent={essences} 
        key={component.id + '_' + index} 
        onMouseOut={() => this.handleMouseOut()}
        onMouseOver={() => this.handleMouseOver(component)} 
        status={G.publicData.players[playerID].status}
        ui={G.players[playerID].uiTemp}
      />
    })

    // Check if player can pay all collect costs.
    Object.values(collectActions).forEach((action) => {
      action.essences.forEach((essence) => {
        if (!sumCollects[essence.type]) sumCollects[essence.type] = 0
        sumCollects[essence.type] = sumCollects[essence.type] + (action.type === 'COST' ?  - essence.quantity : essence.quantity)
      })
    })
    Object.values(collectOnComponentActions).forEach((action) => {
      action.essences.forEach((essence) => {
        if (!sumCollects[essence.type]) sumCollects[essence.type] = 0
        sumCollects[essence.type] = sumCollects[essence.type] + (action.type === 'COST' ?  - essence.quantity : essence.quantity)
      })
    })
    Object.entries(sumCollects).forEach((essence) => {
      if (essence[1] + G.publicData.players[playerID].essencesPool[essence[0]] < 0) {
        costValid = false
        missingEssences[essence[0]] = Math.abs(essence[1] + G.publicData.players[playerID].essencesPool[essence[0]])
      }
    })

    // Check if all the actions required are done.
    components.forEach((component) => {
      if (component.hasSpecificCollectAbility) {
        switch (component.id) {
          case 'coffreFort':
            const hasEssence = essencesOnComponent[component.id]
            if (hasEssence && hasEssence.filter((essence) => essence.type === 'gold').length > 0) {
              collectValid = ((collectActions[component.id] && collectActions[component.id].valid)
              || (collectOnComponentActions[component.id] && collectOnComponentActions[component.id].valid))
            }
            break
          case 'automate':
            collectValid = true
            break
          case 'forgeMaudite':
          default:
            collectValid = collectValid && collectActions[component.id] && collectActions[component.id].valid
        }
      }
    })

    switch (G.publicData.players[playerID].status) {
      case 'COLLECT_ACTION_AVAILABLE':
        directive = <h5 className="directive">You may collect essence.</h5>
        handleConfirm = () => this.collectEssences()
        break
      case 'COLLECT_ACTION_REQUIRED':
        directive = collectValid && costValid ?
            <h5 className="directive">Confirm your collect option(s).</h5>
          : costValid ?
            <h5 className="directive">You have to select collect option(s).</h5>
          :
            <h5 className="directive">You need {Object.entries(missingEssences).map((essence) => {
              return <div key={essence[0]}className="collect-options collect-info">
              <div className={'type essence '+essence[0]}>{essence[1]}</div>
            </div>})} more essence(s) for your collect to be valid.</h5>
        handleConfirm = () => this.collectEssences()
        break
      case 'READY':
      default:
          showButtons = false
    }

    const confirmButton = <div className={'action-button' + ((collectValid && costValid) ? ' valid' : ' disabled')}
      onClick={collectValid && costValid ? handleConfirm : null}>Confirm</div>
    const resetButton = <div className="action-button" onClick={() => this.handleResetCollect()}>Reset</div>

    return <>
      <div className='dialog-panel'>
        <h5><div className="collect-icon"></div>{title}{waitingFor}</h5>
        <div className={'card-row ' + profile.cardSize}>
          {collectComponents}
        </div>
        {directive}
        {showButtons && <div className={waiting ? 'button-list hidden': 'button-list'}>
          {confirmButton} {resetButton}
        </div>}
        {hand}
      </div>
    </>
  }

  renderInPlayActions = () => {
    const { selectedComponent } = this.props
    return <>
      <div className="action-container">
        {this.renderGameComponent(selectedComponent)}
      </div>
      {selectedComponent &&<h5 className="directive">Choose an action for {selectedComponent.name}</h5>}
    </>
  }
  
  renderClaimAction = () => {
    const { canPayCost, selectedComponent } = this.props

    let costEssenceList = selectedComponent.costEssenceList ? selectedComponent.costEssenceList : [{type: 'gold', quantity: 4}]

    let costFrameEssenceList = costEssenceList.map((essence) => {
      let singleEssence = costEssenceList.length === 1 ? ' single-essence' : ''
      return <div key={essence.type} className={'essence ' + (essence.type) + singleEssence}>{essence.quantity}</div>
    });
    let componentCost = <div className="cost-frame">
      <div className="cost-frame-content">
        {costFrameEssenceList}
      </div>
    </div>

    let directiveEssenceList = costEssenceList.map((essence, index) => {
      let isLast = index === costEssenceList.length -1
      return <div key={essence.type} className={'icon '}>
        <div className={'type essence ' + essence.type}>{essence.quantity}</div>
        {!isLast && <div className="operator">
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </div>}
      </div>
    })
    let componentName = (selectedComponent.name === 'Monument' ? 'a random ' : '') + selectedComponent.name
    let directive = canPayCost.valid ? 
      <h5 className="directive">
        <div className="inline-text">Claim {componentName} for </div>
        <div className="inline-icons">{directiveEssenceList}</div>
        <div className="inline-text">?</div>
      </h5>
      :
      <h5 className="directive">
        <div className="inline-text">You don't have enough essences to claim {componentName}.</div>
      </h5>

    return <>
      <div className="action-container">
        <div className="action-component">
          {this.renderGameComponent(selectedComponent)}
          <div className="component-cost">
            {componentCost}
          </div>
        </div>
      </div>
      {selectedComponent && directive}
    </>
  }

  renderPassAction = () => {
    const { G, selectedComponent } = this.props
    let directive = selectedComponent ? <h5 className="directive">Pass and Swap your magic item for {selectedComponent.name} ?</h5>: <h5 className="directive">Select a magic item to swap for</h5>
    let magicItems = G.publicData.magicItems.map((magicItem) => {
      return this.renderGameComponent(magicItem, {onClick: (event) => this.handleClick(event, magicItem), onDoubleClick: () => this.pass(magicItem.id)})
    })
    return <>
      <div className="action-container">
        <div className="action-component">
          {magicItems}
        </div>
      </div>
      {directive}
    </>
  }
  
  renderInHandActions = (costValid) => {
    const { addToEssencePickerSelection, canPayCost, essencePickerSelection, resetEssencePickerSelection,
      selectAction, selectedAction, selectedComponent, setEssencePickerSelection } = this.props

    let actionPanel = null
    let directive = selectedComponent &&<h5 className="directive">Choose an action for {selectedComponent.name}</h5>

    let essenceList = Object.entries(essencePickerSelection).map((essence, index) => {
      let isLast = index === Object.entries(essencePickerSelection).length -1
      return <div key={essence[0]} className={'icons '}>
        <div className={'type essence ' + essence[0]}>{essence[1] || 0}</div>
        {!isLast && <div className="operator">
          <FontAwesomeIcon icon={faPlus} size="sm" />
        </div>}
      </div>
    })

    switch (selectedAction) {
      case 'DISCARD_FOR_2E':
        let count = 0
        Object.values(essencePickerSelection).forEach((value) => count = count + value)
        let isValid = count === 2
        directive =  isValid ?
          <h5 className="directive">
            <div className="inline-text">Discard {selectedComponent.name} for </div>
            <div className="inline-icons">{essenceList}</div>
            <div className="inline-text">?</div>
          </h5>
          :
          <h5 className="directive">
            <div className="inline-text">Select </div>
            <div className="inline-icons">
              <div className="icons">
                <div className="essence any-but-gold">2</div>
              </div>
            </div>
          </h5>
        actionPanel = <div>
          <h5>Discard for:</h5>
          <EssencePicker essenceListType={'anyButGold'} essenceNumber={2} />
        </div>
        break
      case 'DISCARD_FOR_1G':
        directive =
          <h5 className="directive">
            <div className="inline-text">Discard {selectedComponent.name} for </div>
            <div className="inline-icons">{essenceList}</div>
            <div className="inline-text">?</div>
          </h5>
        break
      case 'PLACE_ARTEFACT':
        actionPanel = this.renderCostHandler()
        const selection = Object.entries(essencePickerSelection).filter((item) =>  item[1] > 0)
        essenceList = selection.length > 0 ? selection.map((essence, index) => {
          let isLast = index === Object.entries(essencePickerSelection).length -1
          return <div key={essence[0]} className={'icons '}>
            <div className={'type essence ' + essence[0]}>{essence[1] || 0}</div>
            {!isLast && <div className="operator">
              <FontAwesomeIcon icon={faPlus} size="sm" />
            </div>}
          </div>
        }) 
        : 
        <div className="collect-option">
          <div className="essence any">0</div>
        </div>
        directive =  costValid.isValid ?
          <h5 className="directive">
            <div className="inline-text">Place {selectedComponent.name} for </div>
            <div className="inline-icons">{essenceList}</div>
            <div className="inline-text">?</div>
          </h5>
          :
          <h5 className="directive">
            <div className="inline-text">Select essences to pay {selectedComponent.name}'s placement cost.</div>
          </h5>
        break

      // render the selected card from hand and display the differents actions available for this card.
      case 'HAND':
        const handlePlaceAction = () => {
          const preSelection = !!canPayCost.fixedCost ? canPayCost.fixedCost: canPayCost.minEssencePayList
          setEssencePickerSelection(preSelection)
          selectAction('PLACE_ARTEFACT')
        }
        
        actionPanel = <>
          <div className={'action-button' + (canPayCost.valid ? '':' invalid disabled')} size="sm" onClick={canPayCost.valid ? handlePlaceAction : null}>
            <div className="inline-text">Place Artefact</div>
          </div>
          <div className="action-button" size="sm" onClick={() => selectAction('DISCARD_FOR_2E')}>
            <div className="inline-text">Discard for </div>
            <div className="inline-icons">
              <div className="icons">
                <div className="essence any-but-gold">2</div>
              </div>
            </div>
          </div>
          <div className="action-button" size="sm" onClick={() => {resetEssencePickerSelection(); addToEssencePickerSelection('gold'); selectAction('DISCARD_FOR_1G')}}>
            <div className="inline-text">Discard for </div>
            <div className="inline-icons">
              <div className="icons">
                <div className="essence gold">1</div>
              </div>
            </div>
          </div>          
        </>
        break
      default:
    }

    return <>
      <div className="action-container">
        <div className="action-component">
          {this.renderGameComponent(selectedComponent)}
          {actionPanel && 
            <div className="action-list">
              {actionPanel}
            </div>
          }
        </div>
      </div>
      {directive}
    </>
  }
  
  renderCostHandler = () => {
    const { G, playerID, canPayCost, selectedComponent } = this.props

    // Sum discount abilities
    let sumDiscount = 0
    let discounts = G.publicData.players[playerID].inPlay.filter((component) => component.hasDiscountAbility).map((component) => {
      return this.getValidDiscounts(component, selectedComponent).map((ability, index) => 
        <h5 className="cost-source" key={index}>
          {ability.discountList.map((discount) => {
            sumDiscount = sumDiscount + discount.quantity
            return <div key={discount.type} className="inline-text">
              <div className="collect-option">
                <div className={'essence ' + discount.type}>{discount.quantity}</div>
              </div>
            </div>
          })}
          <div className="inline-text"> from {component.name} </div>
        </h5>
      )
    })
    let sumSelection = Object.values(selectedComponent.costEssenceList).reduce((a,b) => {return a.quantity + b.quantity}, 0)

    const costValid = this.costSelectionValidator(sumDiscount)
    let essences = selectedComponent.costEssenceList.map((essence, index) => {
      let singleEssence = selectedComponent.costEssenceList.length === 1 ? ' single-essence' : ''
      let payOk = costValid[essence.type] || costValid.isValid ? <div className="pay-ok"></div> : null
      return <div key={index} className={'essence ' + (essence.type) + singleEssence}>
        {payOk}{essence.quantity}
      </div>
    });
    
    const essencesPool = G.publicData.players[playerID].essencesPool
    return <div className="component-cost flex-row">
      <div className="cost-container">
        <h5 className="pb-2">Pay with:</h5>
        {discounts}
        <div className="">
          <EssencePicker enabledEssencesList={canPayCost.enabledEssencesList} defaultSelection={canPayCost.minEssencePayList} essencesPool={essencesPool}
            essenceNumber={sumSelection} discount={sumDiscount} asCost={true} validCost={costValid.isValid} lock={!!canPayCost.fixedCost}/>
        </div>
      </div>
      <div className="cost-frame">
        <div className="cost-frame-content">
          {essences}
        </div>
      </div>
    </div>
  }

  /**
   * Check if the player can pay the component placement cost.
   * 
   * @returns {valid, minEssencePayList, enabledEssencesList, fixedCost}
   * -valid : boolean checking if the player have enough essences to pay the component placement cost.
   * -minEssencePayList : object containing the minimum of each essence type to pay the component placement cost.
   * -enabledEssencesList : array containing the list of essences types allowed to pay the component placement cost.
   * -fixedCost : object containing the list of essences to pay if there is only one way to pay the component placement cost
   */
  canPayCost = (selectedComponent) => {
    const { G, playerID } = this.props
    let sumDiscount = 0
    let anyEssencePool
    let valid = true
    let fixedCost
    if (!selectedComponent || !selectedComponent.costEssenceList) {
      return {valid}
    }
    const costEssenceList = copy(selectedComponent.costEssenceList)
    const availableEssencePool = copy(G.publicData.players[playerID].essencesPool)

    // Object containing the minimum numbers for each essence the player have to pay to place the component.
    let minEssencePayList = {elan:0, life:0, calm:0, death:0, gold:0} 

    // List of essence types the player can use to pay the cost.
    let enabledEssencesList = []
    
    // Sum discount abilities
    G.publicData.players[playerID].inPlay.filter((component) => component.hasDiscountAbility).forEach((component) => {
      return this.getValidDiscounts(component, selectedComponent).forEach(discount => {
        discount.discountList.forEach((essence) => {
          sumDiscount = sumDiscount + essence.quantity
        })
      })
    })
    
    // essences of type elan/life/calm/death
    const essencesRequired = costEssenceList.filter((essence) => essence.type !== 'gold' && essence.type !== 'any')
    // essences of type any
    const anyEssencesRequired = costEssenceList.filter((essence) => essence.type === 'any')
    const anyEssenceRequired = anyEssencesRequired.length > 0 ? anyEssencesRequired[0] : {quantity:0}
    // essences of type gold
    const goldEssence = costEssenceList.filter((essence) => essence.type === 'gold')
    const goldRequired = goldEssence.length > 0 ? goldEssence[0] : {quantity:0}

    // Check if there is enough gold to pay
    if (goldRequired.quantity > availableEssencePool['gold']) {
      valid = false
    } else {
      let excessGold = availableEssencePool['gold'] - (goldRequired.quantity ? goldRequired.quantity : 0)
      anyEssencePool = excessGold > 0 ? excessGold : 0
      minEssencePayList['gold'] = goldRequired.quantity ? goldRequired.quantity : 0
      if (goldRequired.quantity > 0 && availableEssencePool['gold'] > 0) enabledEssencesList.push('gold')
    }

    const maxDiscount = sumDiscount

    // total of essences, except gold, required to pay the placement cost.
    let nbEssenceRequired = 0
    // total of essences, except gold, available to pay the placement cost.
    let essenceCountInPool = 0
    // list of the essences types available to pay the any part the placement cost.
    let couldPayAnyWith = []
    // list of the max amount of essence possible to pay the placement cost.
    let payAsMuchAsPossible = []

    let requireDiscount = []
    
    const essences = ['elan', 'life', 'calm', 'death']
    essences.forEach((essence) => {
      let essenceRequired = essencesRequired.filter((item) => item.type === essence)[0]
      let qttAvailable = availableEssencePool[essence]
      let qttRequired = essenceRequired ? essenceRequired.quantity : 0

      if (qttRequired > 0 && qttRequired > qttAvailable + sumDiscount) {
        valid = false
      } else {
        // if there is enough essences of this type, the excess part is available in the anyEssencePool
        if (qttAvailable > qttRequired) {
          anyEssencePool = anyEssencePool + qttAvailable - qttRequired
          couldPayAnyWith.push({type: essence, quantity: qttAvailable - qttRequired})
        // else it reduce the discount count
        } else {
          sumDiscount = (sumDiscount + (qttAvailable - qttRequired)) > 0 ? (sumDiscount + (qttAvailable - qttRequired)) : 0
        }
        // if the discount can't provide enough reduction for a type, the difference is the minimum
        // number of this type the player have to pay.
        if (qttRequired > maxDiscount) {
          minEssencePayList[essence] = qttRequired - maxDiscount
          requireDiscount.push(essence)
        }
        nbEssenceRequired = nbEssenceRequired + qttRequired
        essenceCountInPool = essenceCountInPool + qttAvailable
        if (qttRequired > 0) {
          payAsMuchAsPossible.push({type: essence, quantity: qttRequired > 0 && qttRequired <= qttAvailable ? qttRequired : qttAvailable})
        }
      }
    })

    // finally check if there is enough essence in the anyEssencePool to pay the any type essences left
    if (anyEssenceRequired && anyEssenceRequired.quantity > anyEssencePool + sumDiscount) {
      valid = false
    }

    // get the list of essence type available to pay the placement cost.
    if (anyEssenceRequired.quantity > 0) {
      const types = ['elan', 'life', 'calm', 'death', 'gold']
      types.forEach((type) => {
        if (availableEssencePool[type] > 0) {
          enabledEssencesList.push(type)
        }
      })
    } else {
      essencesRequired.forEach((essence) => {
        if (availableEssencePool[essence.type] > 0) {
          enabledEssencesList.push(essence.type)
        }
      })
    }


    // Determines the fixedCost if possible
    const noAnyNoDiscount = anyEssenceRequired.quantity === 0 && maxDiscount === 0
    const discountGTCost = maxDiscount >= (nbEssenceRequired + anyEssenceRequired.quantity)
    const costEQAvailable = (nbEssenceRequired + anyEssenceRequired.quantity) === (maxDiscount + essenceCountInPool + availableEssencePool['gold'])
    const onlyOneCostTypeRequired = anyEssencesRequired.length === 0 && costEssenceList.filter((essence) => essence.type !== 'any').length === 1
    const zeroDiscountLeft = anyEssencesRequired.length === 0 && sumDiscount === 0
    
    // Different ways to determine if the cost is fixed if the componant can be paid.
    if (valid) {
      let preSelection = []
      fixedCost = {}

      // if there is no discount and no type 'any' in cost list.
      if (noAnyNoDiscount) {
        console.log('1) noAnyNoDiscount');
        preSelection = costEssenceList
      }

      // if the discount is greater than the cost.
      // The player only have to pay gold if there is any gold to pay.
      else if (discountGTCost) {
        console.log('2) discountGTCost');
        preSelection = costEssenceList.filter((essence) => essence.type === 'gold')
      }
      
      // if the number of essence required to pay is equal to the available essence,
      // the player have to pay with every essences available.
      else if (costEQAvailable) {
        preSelection = []
        console.log('3) costEQAvailable');
        Object.keys(availableEssencePool).forEach((type) => {
          preSelection.push({type, quantity: availableEssencePool[type]})
        })
      }
      
      // if there is only one type of essence required to pay the placement cost.
      else if (onlyOneCostTypeRequired) {
        console.log('4) onlyOneCostTypeRequired');
        let essenceRequired = essencesRequired[0]
        essenceRequired.quantity = essenceRequired.quantity - maxDiscount
        preSelection = [essenceRequired]
      }

      // if there is only one available type of essence to pay the any part of the placement cost.
      else if (anyEssenceRequired.quantity > 0 && couldPayAnyWith.length === 1) {
        console.log('5) anyEssenceRequired.quantity > 0 && couldPayAnyWith.length === 1');
        preSelection = payAsMuchAsPossible
        couldPayAnyWith.forEach((essence) => {
          let asAnyEssence = preSelection.filter((item) => item.type === essence.type)
          if (asAnyEssence.length > 0) {
            asAnyEssence[0].quantity = asAnyEssence[0].quantity + essence.quantity
          } else {
            preSelection.push(essence)
          }
        })
      }
      
      // if the number of essences that are available to pay the any part of the placement cost equals the amount of this any part.
      else if (anyEssenceRequired.quantity > 0 && (anyEssenceRequired.quantity - sumDiscount) === anyEssencePool) {
        console.log('6) anyEssenceRequired.quantity > 0 && anyEssenceRequired.quantity === anyEssencePool');
        preSelection = payAsMuchAsPossible
        console.log('couldPayAnyWith',couldPayAnyWith,preSelection);
        couldPayAnyWith.forEach((essence) => {
          let asAnyEssence = preSelection.filter((item) => item.type === essence.type)
          if (asAnyEssence.length > 0) {
            asAnyEssence[0].quantity = asAnyEssence[0].quantity + essence.quantity
          } else {
            preSelection.push(essence)
          }
        })
      }

      // if the discount left equals 0 after paying as much essence as possible
      else if (zeroDiscountLeft) {
        console.log('7) zeroDiscountLeft');
        preSelection = payAsMuchAsPossible
        let goldCost = costEssenceList.filter((essence) => essence.type === 'gold')
        if (goldCost.length > 0) {
          preSelection.push(goldCost[0])
        }
      }

      else {
        console.log('99) Can\'t fix the cost')
        fixedCost = false
      }
      
      preSelection.forEach((essence) => fixedCost[essence.type] = essence.quantity)
    }

    console.log('res',{valid, minEssencePayList, enabledEssencesList, fixedCost});
    return {valid, minEssencePayList, enabledEssencesList, fixedCost}
  }

  /**
   * Return all the valid discounts available from a component for a selected component.
   * 
   * @param {*} discountComponent component with discount abilities.
   * @param {*} component selected component.
   */
  getValidDiscounts = (discountComponent, component) => {
    const validate = (type) => {
      switch(type) {
        case 'artefact':
          return component.type === 'artefact'
        case 'monument':
          return component.type === 'monument'
        case 'placeOfPower':
          return component.type === 'placeOfPower'
        case 'creature':
          return component.isCreature
        case 'dragon':
          return component.isDragon
        default:
          return false
      }
    }
    return discountComponent.discountAbilityList.filter((discount) => {
      let valid = false
      discount.type.forEach((type) => valid |= validate(type))
      return valid
    })
  }

  /**
   * Validate the placement cost of a component. According to the current discounts available,
   * determines, for each essence type of the cost, if it is valid or not .
   */
  costSelectionValidator = () => {
    const { G, playerID, essencePickerSelection, selectedComponent } = this.props
    const costList = copy(selectedComponent.costEssenceList)
    let selectionList = copy(essencePickerSelection)
        
    let maxDiscount = 0
    // compute the sum of valid discounts
    const componentsWithDiscount = G.publicData.players[playerID].inPlay.filter((component) => component.hasDiscountAbility)
    componentsWithDiscount.forEach((component) => {
      this.getValidDiscounts(component, selectedComponent).forEach((ability, index) => 
        ability.discountList.forEach((discount) => {
          maxDiscount = maxDiscount + discount.quantity
        })
      )
    })

    let sumDiscount = maxDiscount

    let essencesAsAny = 0
    let isValid = true
    
    const essences = ['elan', 'life', 'calm', 'death', 'gold']
    // Step 1) Process for global validation, for each essence type:
    // -check if qtty + discount (except for gold) is enough to fulfil the requiredCost
    // -add excess qtty to the essencesAsAny pool
    // -or consume discount to fulfil the requiredCost
    essences.forEach((essence) => {
      let essenceRequired = costList.filter((item) => item.type === essence)
      let qttRequired = essenceRequired.length > 0 ? essenceRequired[0].quantity : 0
      let qttSelected = selectionList[essence] ? selectionList[essence] : 0

      
      if (qttRequired > 0 && qttRequired > qttSelected + (essence === 'gold' ? 0 : sumDiscount)) {
        isValid = false

      } else {
        // if there is enough essences of this type, the excessing part is available in the anyEssencePool
        if (qttSelected > qttRequired) {
          essencesAsAny = essencesAsAny + qttSelected - qttRequired
        // else it reduce the discount count
        } else if (qttSelected < qttRequired) {
          if (essence === 'gold') {
            isValid = false
          } else {
            const diff = qttRequired - qttSelected
            if (diff > sumDiscount) {
              isValid = false
            } else {
              // considere essence quantity equal to the required quantity
              selectionList[essence] = qttRequired 
              sumDiscount = sumDiscount - diff > 0 ? sumDiscount - diff : 0
            }
          }
        } else if (qttSelected === qttRequired) {
          // force update in case selectionList is empty
          selectionList[essence] = qttRequired
        }
      }
    })
    
    // Step 2) For each type of essence, determine if the type can be set to valid or not
    let typeValidators = {}

    // if the cost is 0 (i.e costlist contains only {type: 'any, quantity: 0}), set validators to true
    if (costList.length === 1 && costList[0].type === 'any' && sumDiscount >= costList[0].quantity) {
      typeValidators['any'] = isValid

    } else if (maxDiscount > 0) {
      // In step 1, the discount is consumed for types elan, calm, life and death.
      // if there is some discount left, it is supposed to be for the 'any' cost part.
      // So if there is no type any in cost essence list, check if the discount is consumed
      let discountIsConsumed = costList.filter((essence) => essence.type === 'any').length === 0 ? sumDiscount === 0 : true
      
      costList.forEach((costEssence) => {
        if (costEssence.type === 'any') {
          // when there is more essence then required of a type, the excess part state for the 'any' part of the cost.
          typeValidators[costEssence.type] = discountIsConsumed && costEssence.quantity === essencesAsAny + sumDiscount
        } else if (Object.keys(selectionList).length > 0) {
          typeValidators[costEssence.type] = discountIsConsumed && costEssence.quantity <= selectionList[costEssence.type]
        } else if (Object.keys(selectionList).length === 0) {
          typeValidators[costEssence.type] = sumDiscount >= costEssence.quantity
        }
      })

      isValid = isValid && discountIsConsumed
      
      // when there is a discount, if global validation is KO, then 
      Object.entries(typeValidators).forEach((item) => {
        isValid = isValid && item[1]
      })
      // When there is a discount and not all the types are valid, only types with enough count paid are valid
      if (!isValid) {
        Object.entries(typeValidators).filter((item) => item[0] !== 'gold').forEach((item) => {
          let costEssence = costList.filter(essence => essence.type === item[0])[0]
          typeValidators[item[0]] = costEssence.quantity <= essencePickerSelection[item[0]]
        })
      }

    } else {
      costList.forEach((costEssence) => {
        if (costEssence.type === 'any') {
          typeValidators[costEssence.type] = costEssence.quantity === essencesAsAny
        } else if (Object.keys(selectionList).length > 0) {
          typeValidators[costEssence.type] = costEssence.quantity === selectionList[costEssence.type]
        } else {
          isValid = false
        }
      })
      
      Object.entries(typeValidators).forEach((item) => {
        isValid = isValid && item[1]
      })
    }

    typeValidators.isValid = isValid
    return typeValidators
  }

  renderCurrentAction = () => {
    const { essencePickerSelection, profile, selectAction, selectedAction, selectedComponent } = this.props

    let availableActions
    let costValid
    let showConfirmButton = true
    let handleConfirm
    let handleCancel = (event) => {
      selectAction(undefined)
      this.handleClick(event, undefined)
    }

    switch (selectedAction) {
      case 'PASS':
        availableActions = this.renderPassAction()
        handleConfirm = selectedComponent && (() => this.pass(selectedComponent.id))
        break
      case 'HAND':
        availableActions = this.renderInHandActions()
        showConfirmButton = false
        break
      case 'PLACE_ARTEFACT':
        costValid = this.costSelectionValidator()
        availableActions = this.renderInHandActions(costValid)
        handleConfirm = costValid.isValid ? () => this.placeComponent(selectedComponent.type, selectedComponent.id, essencePickerSelection) : null
        handleCancel = () => selectAction('HAND')
        break
      case 'DISCARD_FOR_2E':
        availableActions = this.renderInHandActions()
        handleConfirm = Object.values(essencePickerSelection).reduce((a,b) => {return a + b}, 0) === 2 ? 
          () => this.discardArtefact(selectedComponent.id, essencePickerSelection) : null
        handleCancel = () => selectAction('HAND')
        break
      case 'DISCARD_FOR_1G':
        availableActions = this.renderInHandActions()
        handleConfirm = () => this.discardArtefact(selectedComponent.id, essencePickerSelection)
        handleCancel = () => selectAction('HAND')
        break
      case 'PLAY':
        availableActions = this.renderInPlayActions()
        break
      case 'CLAIM':
        availableActions = this.renderClaimAction()
        costValid = this.costSelectionValidator()
        handleConfirm = costValid.isValid ?() => this.placeComponent(selectedComponent.type, selectedComponent.id, essencePickerSelection) : null
        break
      default:
    }

    const confirmButton = showConfirmButton && <div className={'action-button' + (handleConfirm  ? ' valid' : ' disabled')} onClick={handleConfirm} disabled={!handleConfirm}>Confirm</div>
    const cancelButton = <div className="action-button" onClick={handleCancel}>Cancel</div>

    return <>
      <div className={'card-row flex-col ' + profile.cardSize + ' action-row'}>
        {availableActions}
      </div>
      <div className="button-list">
        {confirmButton} {cancelButton}
      </div>
    </>
  }

  /**
   * Render the board during Action Phase.
   * This board is player specific and will not be available for spectators.
   * The board show the actions available for the player.
   * When a component is selected the board show the selected component and the actions available for this component.
   */
  renderActionDialog = () => {
    const { ctx, playerID, selectedComponent, selectAction, selectedAction } = this.props
    if (!Number.isInteger(parseInt(playerID))) return null

    const playersName = this.getPlayersName()

    let title = 'Play Phase'
    let waiting = false
    let waitingFor = ' - ' + playersName[parseInt(ctx.currentPlayer)] + '\'s turn.'
    let hand = this.renderPlayerHand(false)
    let currentAction = (selectedComponent || selectedAction) && this.renderCurrentAction()
    let directive = null

    const passButton = <div className="action-button" onClick={() => selectAction('PASS')}>
      Pass
    </div>

    return <>
      <div className='dialog-panel'>
        <h5><div className="dragon-icon"></div>{title}{waitingFor}</h5>
        {waiting ? <h5 className="directive">{waitingFor}</h5> : <>{directive}</>}
        {(selectedComponent || selectedAction) ? currentAction : hand}
        {!(selectedComponent || selectedAction) && <div className="button-list">
          {passButton}
        </div>}
      </div>
    </>
  }

  /**
   * This function render the board during Draft Phase.
   */
  renderDraftPhaseBoard = () => {
    const dialogBoard = this.renderDraftDialog()
    return this.renderBoard(dialogBoard)
  }

  /**
   * This function render the board during Magic Item Phase.
   */
  renderMagicItemPhaseBoard = () => {
    const dialogBoard = this.renderMagicItemDialog()
    return this.renderBoard(dialogBoard)
  }

  /**
   * This functio render the board during Collect Phase.
   */
  renderCollectPhaseBoard = () => {
    const dialogBoard = this.renderCollectDialog()
    return this.renderBoard(dialogBoard)
  }

  /**
   * This function render the board during Action Phase.
   */
  renderActionPhaseBoard = () => {
    const dialogBoard = this.renderActionDialog()
    return this.renderBoard(dialogBoard)
  }

  /**
   * Main render method for the board.
   */
  render() {
    const { G, chatDisplay, game, cardToZoom, profile } = this.props
    
    if (!isLoaded(game)) {
      return <div className="loading-panel align-center"><img className="loader" alt="Loading..."/>Loading...</div>
    }

    let board = null

    switch(G.phase) {
      case 'DRAFT_PHASE':
        board = this.renderDraftPhaseBoard()
        break
      case 'PICK_MAGIC_ITEM_PHASE':
        board = this.renderMagicItemPhaseBoard()
        break
      case 'COLLECT_PHASE':
        board = this.renderCollectPhaseBoard()
        break
      case 'PLAY_PHASE':
        board = this.renderActionPhaseBoard()
        break
      default:
    }
    const sizeSetting = profile && profile.cardSize ? profile.cardSize : 'normal'
    const layoutSetting = profile && profile.layout ? profile.layout : 'vertical'
    return <div className={'board-'+layoutSetting} onClick={() => this.handleBoardClick()}>
      {false && <div className={'common-board ' + sizeSetting}>
        {this.renderCommonBoard()}
      </div>}
      <div className="board" ref='board'>
        {board}
      </div>
      <div className="right-panel">
        {cardToZoom && this.renderCardZoom()}
        {chatDisplay && this.renderChat()}
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth,
    canPayCost: state.game.canPayCost,
    chat : state.firestore.ordered.chat && state.firestore.ordered.chat[0],
    chatDisplay: state.chat.chatDisplay,
    cardToZoom: state.game.zoomCard,
    collectActions: state.game.collectActions,
    collectOnComponentActions: state.game.collectOnComponentActions,
    currentGame: state.firestore.data.currentGame,
    essencePickerSelection: state.game.essencePickerSelection,
    focusZoom: state.game.focusZoom,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0],
    profile: state.firebase.profile,
    selectedComponent: state.game.selectedComponent,
    selectedAction: state.game.selectedAction
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToEssencePickerSelection: (essenceType) => dispatch(addToEssencePickerSelection(essenceType)),
    setCanPayCost: (info) => dispatch(canPayCost(info)),
    clearZoom: () => dispatch(clearZoom()),
    resetCollect: () => dispatch(resetCollect()),
    resetEssencePickerSelection: () => dispatch(resetEssencePickerSelection()),
    setCollectAction: (action) => dispatch(setCollectAction(action)),
    setFocusZoom: (flag) => dispatch(setFocusZoom(flag)),
    selectAction: (action) => dispatch(selectAction(action)),
    selectComponent: (card) => dispatch(selectComponent(card)),
    setEssencePickerSelection: (essenceSelection) => dispatch(setEssencePickerSelection(essenceSelection)),
    toggleChat: () => dispatch(toggleChat()),
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

function copy(value){
  return JSON.parse(JSON.stringify(value))
}
