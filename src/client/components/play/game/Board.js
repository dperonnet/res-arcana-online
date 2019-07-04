import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types'
import './board.scss'
import './essence.scss'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { resetCollect, clearZoom, selectComponent, setFocusZoom, zoomCard, setCollectAction } from '../../../../store/actions/gameActions'
import { toggleChat } from '../../../../store/actions/chatActions'
import CardZoom from '../../common/card/CardZoom.js'
import Chat from '../../common/chat/Chat'
import GameComponent from './GameComponent'
import CollectComponent from './CollectComponent'


const CARD_BACK_ARTEFACT = {
  class: 'back_artefact',
  id: 'back_artefact',
  name: 'Artefact',
  type: 'back',
}

const CARD_BACK_MAGE = {
  class: 'back_mage',
  id: 'back_mage',
  name: 'Mage',
  type: 'back',
}

const CARD_BACK_MONUMENT = {
  class: 'back_monument',
  id: 'back_monument',
  name: 'Monument',
  type: 'back',
}

let interval

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
   * Select the clicked component.
   */
  handleClick = (e, component) => {
    const { board } = this.refs
    e.stopPropagation();
    board.scrollTop = 0
    this.props.selectComponent(component)
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
    clearInterval(interval)
    if (component.type !== 'back')
    this.props.zoomCard(component)
  }

  /**
   * Hide the card to zoom on mouse out.
   */
  handleMouseOut = () => {
    const { profile } = this.props
    interval = setInterval(() => this.props.clearZoom(), profile.zoomFadeTime ? profile.zoomFadeTime : 3000)
    return () => clearInterval(interval)
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
    const { isActive, playerID } = this.props
    if (isActive) {
      this.props.moves.pickMagicItem(playerID, cardId)
    }
    this.props.selectComponent(undefined)
    this.handleBoardClick()
  }
  
  /**
   * Trigger the collect essence move.
   */
  collectEssences = () => {
    const { playerID, collectActions, collectOnComponentActions } = this.props
    this.props.moves.collectEssences(playerID, collectActions, collectOnComponentActions)
    this.props.events.endTurn()
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
    return <div className={'card-zoom-frame normal' + focus} 
      onClick={(event) => this.handleMouseClickZoom(event)} 
      onMouseOver={() => this.handleMouseOver(component)} 
      onMouseOut={() => this.handleMouseOut()}>
      <CardZoom src={src} alt={component.name} essencesOnComponent={essencesOnComponent}/>
    </div>
  }

  /**
   * Render the first player token.
   */
  renderFirstPlayerToken = (playerId, flip) => {
    const { G } = this.props
    let passe = flip ? '_passe': ''
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
        <div className="essence-count">{G.publicData.players[id].essencesPool[essence]}</div>
      </div>
    })
  }

  /**
   * Render the game component: cards, magic items and places of power.
   */
  renderGameComponent = (component, args) => {
    return <GameComponent
      component={component} 
      onMouseOver={() => this.handleMouseOver(component)} 
      onMouseOut={() => this.handleMouseOut()}
      key={component.id}
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
    const { G } = this.props
    const handleClick = (component) => {
      return G.phase === 'PLAY_PHASE' ? {onClick: (event) => this.handleClick(event, component)} : null
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
    const cardsInHand = <div>{handSize}</div>
    const activePlayer = G.phase !== 'DRAFT_PHASE' && playerId === ctx.currentPlayer ? ' active-player': ''
    const passed = G.passOrder && G.passOrder.includes(playerId) ? ' passed': ''
    return <div className={'ruban ' + activePlayer + passed}>
      <div className="leftCell">
        <div className="first-player">{firstPlayer}</div>
        <div className="player-name">{playerName}</div>
      </div>
      <div className="rightCell">
        <div className="player-pool">{playerPool}</div>
        <div className="cards-in-hand">{cardsInHand}</div>
      </div>
    </div>
  }

  /**
   * This function render the draw pile and the discard pile of a player.
   */
  renderPlayerDrawPileAndDiscard = (playerId) => {
    const { G } = this.props
    
    const drawPile = copy(CARD_BACK_ARTEFACT)
    drawPile.playerId = playerId + '_back_artefact'
    const countDeck = G.publicData.players[playerId].deckSize
    const countDiscard = G.publicData.players[playerId].discard.length
    return <div className="draw-pile">
      <div className="card-container discard">
        <span className="component-legend">Discard ({countDiscard})</span>
        {this.renderGameComponent({...drawPile, class: countDiscard > 0 ? drawPile.class : null}, {discard: true})}
      </div>
      <div className="card-container">
        <span className="component-legend">Draw pile ({countDeck})</span>
        {this.renderGameComponent({...drawPile, class: countDeck > 0 ? drawPile.class : null})}
      </div>
    </div>
  }

  /**
   * Render the cards in the hand of the player.
   */
  renderPlayerHand = () => {
    const { G, playerID, profile } = this.props
    let hand
    switch (G.phase) {
      case 'PLAY_PHASE':
        hand = G.players[playerID].hand.map((card) => {
          return this.renderGameComponent(card, {onClick: (event) => this.handleClick(event, card)})
        })
        break
      default:
        hand = G.players[playerID].hand.map((card) => {
          return this.renderGameComponent(card)
        })
    }
    return <div className={'card-row ' + profile.cardSize}>
      <div className="separator"></div>
      <h5>Cards in hand</h5>
      {hand}
    </div>;
  }

  /**
   * This board render the cards in play of the player.
   * This board is player specific and will not be available for spectators.
   */
  renderPlayerBoard = (id) => {
    const { G, playerID, profile } = this.props
    if (!Number.isInteger(parseInt(id))) return null

    let cards = null
    let drawPileAndDiscard = this.renderPlayerDrawPileAndDiscard(id)
    let essencesOnComponent = null
    let tappedComponents = G.publicData.tappedComponents
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
        cards = G.publicData.players[id].inPlay.map((card) => {
          return this.renderGameComponent(card, {essencesOnComponent: essencesOnComponent[card.id], tappedComponents})
        })
    }

    return <>
      <div className={'in-play card-row ' + profile.cardSize}>
        {drawPileAndDiscard}
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
          <div className="info">Keep {selectedComponent.name} {!lastDraftCard && 'and pass the rest to '  + nextPlayer + ' ?'}</div>
        :
          <div className="info">Select an artefact to add into your deck.</div>
        
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
          <div className="info">Keep {selectedComponent.name} ?</div>
        :
          <div className="info">Select your mage.</div>
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

    const confirmButton = <Button variant="primary" size="sm" onClick={handleConfirm} disabled={!selectedComponent}>Confirm</Button>
    const cancelButton = !lastDraftCard && <Button variant={!selectedComponent ? 'primary' : 'secondary'} size="sm" onClick={(event) => this.handleClick(event)} disabled={!selectedComponent}>Cancel</Button>
    
    return <>
      <div className='dialog-panel'>
        <h5>{title}</h5>
        {showCards && <div className={'card-row ' + profile.cardSize}>
          {draftCards}
        </div>}
        {waiting ? <h5>{waitingFor}</h5> : <>{directive}</>}
        {showButtons && <div className={waiting ? 'game-button hidden': 'game-button'}>
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
    let showButtons = !waiting
    let magicItems = G.publicData.magicItems.map((magicItem) => {
      return waiting ?
        this.renderGameComponent(magicItem)
      :
      this.renderGameComponent(magicItem, {onClick: (event) => this.handleClick(event, magicItem), onDoubleClick: () => this.pickMagicItem(magicItem.id)})
    })
  
    let directive = null
    let handleConfirm = null;

    switch (G.publicData.players[playerID].status) {
      case 'SELECTING_MAGIC_ITEM':
        directive = <div className="info">Select a Magic Item.</div>
        handleConfirm = () => this.pickMagicItem(selectedComponent.id)
        break
      case 'READY':
      default:
        title = `Get Ready for the battle`
    }

    const confirmButton = <Button variant="primary" size="sm" onClick={handleConfirm} disabled={!selectedComponent}>Confirm</Button>
    const cancelButton = <Button variant={!selectedComponent ? 'primary' : 'secondary'} size="sm" onClick={(event) => this.handleClick(event)} disabled={!selectedComponent}>Cancel</Button>
    
    return <>
      <div className='dialog-panel'>
        <h5>{title}</h5>
        <div className={'card-row ' + profile.cardSize}>
          {magicItems}
        </div>
        {waiting ? <h5>{waitingFor}</h5> : <>{directive}</>}
        {showButtons && <div className={waiting ? 'game-button hidden': 'game-button'}>
          {confirmButton} {cancelButton}
        </div>}
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
    const componentsWithSpecificAction = ['coffreFort','forgeMaudite']
    let title = 'Collect Phase'
    let waiting = playerID !== ctx.currentPlayer
    let waitingFor = ' - ' + playersName[parseInt(ctx.currentPlayer)] + '\'s turn.'
    let hand = this.renderPlayerHand()
    let showButtons = !waiting
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
      Object.entries(action.essences).forEach((essence) => {
        if (!sumCollects[essence[0]]) sumCollects[essence[0]] = 0
        sumCollects[essence[0]] = sumCollects[essence[0]] + (action.type === 'COST' ?  - essence[1] : essence[1])
      })
    })
    Object.values(collectOnComponentActions).forEach((action) => {
      Object.entries(action.essences).forEach((essence) => {
        if (!sumCollects[essence[0]]) sumCollects[essence[0]] = 0
        sumCollects[essence[0]] = sumCollects[essence[0]] + (action.type === 'COST' ?  - essence[1] : essence[1])
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
      if (component.hasSpecificCollectAbility && componentsWithSpecificAction.includes(component.id)) {
        switch (component.id) {
          case 'coffreFort':
            const hasEssence = essencesOnComponent[component.id]
            if (hasEssence && hasEssence['gold']) {
              collectValid = collectValid && ((collectActions[component.id] && collectActions[component.id].valid)
              || (collectOnComponentActions[component.id] && collectOnComponentActions[component.id].valid))
            }
            break
          case 'forgeMaudite':
          default:
            collectValid = collectValid && (collectActions[component.id] && collectActions[component.id].valid)
        }
      } else if (component.hasStandardCollectAbility && component.standardCollectAbility.multipleCollectOptions) {
        collectValid = collectValid && collectActions[component.id] && collectActions[component.id].valid
      }
    })

    switch (G.publicData.players[playerID].status) {
      case 'COLLECT_ACTION_AVAILABLE':
        directive = <div className="info">You may collect essence.</div>
        handleConfirm = () => this.collectEssences()
        break
      case 'COLLECT_ACTION_REQUIRED':
        directive = collectValid && costValid ?
            <div className="info">Confirm your collect option(s).</div>
          : costValid ?
            <div className="info">You have to select collect option(s).</div>
          :
            <div className="info">You need {Object.entries(missingEssences).map((essence) => {
              return <div key={essence[0]}className="collect-options collect-info">
              <div className={'type essence '+essence[0]}>{essence[1]}</div>
            </div>})} more essence(s) for your collect to be valid.</div>
        handleConfirm = () => this.collectEssences()
        break
      case 'READY':
      default:
    }

    const confirmButton = <Button variant="primary" size="sm" onClick={handleConfirm} disabled={!(collectValid && costValid)}>Confirm</Button>
    const resetButton = <Button variant="secondary" size="sm" onClick={() => this.handleResetCollect()}>Reset</Button>

    return <>
      <div className='dialog-panel'>
        <h5><div className="collect-icon"></div>{title}{waitingFor}</h5>
        <div className={'card-row ' + profile.cardSize}>
          {collectComponents}
        </div>
        {directive}
        {showButtons && <div className={waiting ? 'game-button hidden': 'game-button'}>
          {confirmButton} {resetButton}
        </div>}
        {hand}
      </div>
    </>
  }

  renderCurrentAction = () => {
    const { profile, selectedComponent } = this.props
    let availableActions
    return <div className={'card-row action' + profile.cardSize}>
      {selectedComponent && this.renderGameComponent(selectedComponent)}
      {availableActions}
    </div>
  }
  /**
   * Render the board during Action Phase.
   * This board is player specific and will not be available for spectators.
   * The board show the actions available for the player.
   * When a component is selected the board show the selected component and the actions available for this component.
   */
  renderActionDialog = () => {
    const { G, ctx, playerID, profile, selectedComponent } = this.props
    if (!Number.isInteger(parseInt(playerID))) return null

    const playersName = this.getPlayersName()

    let title = 'Play Phase'
    let waiting = false
    let waitingFor = ' - ' + playersName[parseInt(ctx.currentPlayer)] + '\'s turn.'
    let hand = this.renderPlayerHand()
    let currentAction = this.renderCurrentAction()
    let showButtons = true
    let directive = null

    const confirmButton = <Button variant="primary" size="sm" onClick={() => this.pickArtefact(selectedComponent.id)} disabled={!selectedComponent}>Confirm</Button>
    const cancelButton = <Button variant={!selectedComponent ? 'primary' : 'secondary'} size="sm" onClick={(event) => this.handleClick(event, undefined)} disabled={!selectedComponent}>Cancel</Button>

    return <>
      <div className='dialog-panel'>
        <h5><div className="collect-icon"></div>{title}{waitingFor}</h5>
        {waiting ? <h5>{waitingFor}</h5> : <>{directive}</>}
        {currentAction}
        {showButtons && <div className={waiting ? 'game-button hidden': 'game-button'}>
          {confirmButton} {cancelButton}
        </div>}
        {hand}
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
    //console.log('G',G, ctx)
    
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
      <div className={'common-board ' + sizeSetting}>
        {this.renderCommonBoard()}
      </div>
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
    chat : state.firestore.ordered.chat && state.firestore.ordered.chat[0],
    chatDisplay: state.chat.chatDisplay,
    cardToZoom: state.game.zoomCard,
    collectActions: state.game.collectActions,
    collectOnComponentActions: state.game.collectOnComponentActions,
    currentGame: state.firestore.data.currentGame,
    focusZoom: state.game.focusZoom,
    game: state.firestore.ordered.game && state.firestore.ordered.game[0],
    profile: state.firebase.profile,
    selectedComponent: state.game.selectedComponent,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearZoom: () => dispatch(clearZoom()),
    resetCollect: () => dispatch(resetCollect()),
    setCollectAction: (action) => dispatch(setCollectAction(action)),
    setFocusZoom: (flag) => dispatch(setFocusZoom(flag)),
    selectComponent: (card) => dispatch(selectComponent(card)),
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
