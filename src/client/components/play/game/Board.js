import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types'
import './board.css'
import './essence.scss'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { resetCollect, selectCard, setCollectAction, tapComponent } from '../../../../store/actions/gameActions'
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

class ResArcanaBoard extends Component {

  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
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
   * Render the chat.
   */
  renderChat = () => {
    const { chat, game } = this.props
    return <>
      <Chat chat={chat} chatId={game.id} chatName={game.name + ' Chat'}/>
        <div className="close close-chat" onClick={this.toggleChat}>
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </div>
    </>
  }

  /**
   * Render the component to Zoom.
   */
  renderCardZoom = () => {
    const { G, cardToZoom, profile } = this.props
    const src = require('../../../assets/image/components/' + cardToZoom.type + '/' + cardToZoom.class + '.png')
    const playerOwningCard = Object.values(G.publicData.players).filter((player) => {
      return Object.keys(player.essencesOnComponent).includes(cardToZoom.id)
    })[0]
    const essencesOnComponent = playerOwningCard ? playerOwningCard.essencesOnComponent[cardToZoom.id] : null
    return <div className="card-zoom-frame normal">
      <CardZoom src={src} show={true} alt={cardToZoom.name} essencesOnComponent={essencesOnComponent} />
    </div>
  }

  renderFirstPlayerToken = (playerId, flip) => {
    const { G } = this.props
    let passe = flip ? '_passe': ''
    const src = require('../../../assets/image/components/premier_joueur' + passe + '.png')
    return G.publicData.firstPlayer === playerId && <img src={src} alt={'First Player'}  />
  }

  renderPlayerPool = (id) => {
    const { G } = this.props
    const essences = ['elan', 'life', 'calm', 'death', 'gold']
    return essences.map((essence, index) => {
      return <div className={'essence ' + essence} key={index}>
        <div className="essence-count">{G.publicData.players[id].essencesPool[essence]}</div>
      </div>
    })
  }

  tapComponent = (card) => {
    this.props.tapComponent(card)
  }

  toggleChat = () => {
    this.props.toggleChat()
  }
  
  /**
   * This action is used to select cards during draft phase.
   */
  pickArtefact = (cardId) => {
    const { isActive, playerID } = this.props
    if (isActive) {
      this.props.moves.pickArtefact(playerID, cardId)
    }
    this.props.selectCard(undefined)
  }

  /**
   * This action is used to select mage after draft phase.
   */
  pickMage = (cardId) => {
    const { isActive, playerID } = this.props
    if (isActive) {
      this.props.moves.pickMage(playerID, cardId)
    }
    this.props.selectCard(undefined)
  }
  
  /**
   * This action is used to select mage after draft phase.
   */
  pickMagicItem = (cardId) => {
    const { isActive, playerID } = this.props
    if (isActive) {
      this.props.moves.pickMagicItem(playerID, cardId)
    }
    this.props.selectCard(undefined)
  }
  
  collectEssences = () => {
    const { playerID, collectActions, collectOnComponentActions } = this.props
    console.log('collectEssences',playerID, collectActions, collectOnComponentActions)
    this.props.moves.collectEssences(playerID, collectActions, collectOnComponentActions)
    this.props.events.endTurn()
  }

  handleClick = (card) => {
    this.props.selectCard(card)
  }

  handleResetCollect = () => {
    this.props.resetCollect()
  }

  /**
   * Render the common components for the game:
   * Places of Power, Magic Items and Monuments.
   */
  renderCommonBoard = () => {
    const { G } = this.props
    const placesOfPower = G.publicData.placesOfPowerInGame.map((pop)=>{
      return <GameComponent key={pop.id} component={pop} onClick={() => this.tapComponent(pop)} />
    })
    const magicItems = G.publicData.magicItems.map((magicItem)=>{
      return <GameComponent key={magicItem.id} component={magicItem} onClick={() => this.tapComponent(magicItem)} />
    })
    const monuments = G.publicData.monumentsRevealed.map((monument)=>{
      return <GameComponent key={monument.id} component={monument} onClick={() => this.tapComponent(monument)} />
    })
    const monumentsStack = <GameComponent component={copy(CARD_BACK_MONUMENT)}/>
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
   * This is the main rendering board function called by every phases.
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

  renderPlayerDrawPileAndDiscard = (playerId) => {
    const { G } = this.props
    
    const drawPile = copy(CARD_BACK_ARTEFACT)
    drawPile.playerId = playerId + '_back_artefact'
    const countDeck = G.publicData.players[playerId].deckSize
    const countDiscard = G.publicData.players[playerId].discard.length
    return <div className="draw-pile">
      <div className="card-container discard">
        <span className="component-legend">Discard ({countDiscard})</span>
        <GameComponent component={{...drawPile, class: countDiscard > 0 ? drawPile.class : null}} discard={true}/>
      </div>
      <div className="card-container">
        <span className="component-legend">Draw pile ({countDeck})</span>
        <GameComponent component={{...drawPile, class: countDeck > 0 ? drawPile.class : null}}/>
      </div>
    </div>
  }

  renderPlayerHand = () => {
    const { G, playerID, profile } = this.props
    const hand = G.players[playerID].hand.map((card)=>{
      return <GameComponent key={card.id} component={card} />
    })
    return <div className={'draft-card card-row ' + profile.cardSize}>
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
    switch (G.publicData.players[playerID].status) {
      case 'DRAFTING_ARTEFACTS':
        const mages = G.players[playerID].mages.map((card)=>{
          return <GameComponent key={card.id} component={card} />
        })
        essencesOnComponent = G.publicData.players[id].essencesOnComponent
        const deck = G.players[playerID].hand.map((card)=>{
          return <GameComponent key={card.id} component={card} essencesOnComponent={essencesOnComponent[card.id]} />
        })
        cards = <>{mages}{deck}</>
        break
      case 'SELECTING_MAGE':
        break
      case 'READY':
      default:
        essencesOnComponent = G.publicData.players[id].essencesOnComponent
        cards = G.publicData.players[id].inPlay.map((card)=>{
          return <GameComponent key={card.id} component={card} essencesOnComponent={essencesOnComponent[card.id]} />
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
        boards = othersId.map((id) =>{
          const playerRuban = this.renderPlayerRuban(id)
          let cards = []
          let cardMage = copy(CARD_BACK_MAGE)
          cards.push(<GameComponent key={id+'_back_mage_1'} component={{...cardMage, id: 'back_mage_1'}}/>)
          if (G.publicData.players[id].status !== 'READY') {
            cards.push(<GameComponent key={id+'_back_mage_2'} component={{...cardMage, id: 'back_mage_2'}}/>)
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
      case 'SELECTING_MAGE':
        boards = othersId.map((id) =>{
          const playerRuban = this.renderPlayerRuban(id)
          return (
            <div key={id}>
              {playerRuban}
              <div className={'card-row ' + profile.cardSize}>
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
          const cards = this.renderPlayerBoard(id)
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

  renderOponentDraftBoard = (id) => {
    const { G, profile } = this.props
    const deckSize = G.publicData.players[id].deckSize
          
    let cards = []
    let cardMage = copy(CARD_BACK_MAGE)
    cards.push(<GameComponent key={id+'_back_mage_1'} component={{...cardMage, id: 'back_mage_1'}}/>)
    if (G.publicData.players[id].status !== 'READY') {
      cards.push(<GameComponent key={id+'_back_mage_2'} component={{...cardMage, id: 'back_mage_2'}}/>)
    }
    for (let i = 0; i< deckSize; i++) {
      let cardArtefact = copy(CARD_BACK_ARTEFACT)
      cardArtefact.id = id + '_' + i + '_back_artefact'
      cards.push(<GameComponent key={id+'_back_artefact'} component={cardArtefact}/>)
    }

    const playerRuban = this.renderPlayerRuban(id)
    return (
      <div key={id}>
        {playerRuban}
        <div className={'card-row ' + profile.cardSize}>
          {cards}
        </div>
      </div>
    )
  }

  /**
   * Render the board during Draft Phase.
   * This board is player specific and will not be available for spectators.
   * The board show draft cards when player have to pick a card.
   */
  renderDraftDialog = () => {
    const { G, playerID, profile, selectedCard } = this.props
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
          return <GameComponent key={card.id} component={card} onClick={() => this.handleClick(card)} onDoubleClick={() => this.pickArtefact(card.id)}/>
        })
      
        directive = selectedCard ?
          <div className="info">Keep {selectedCard.name} {!lastDraftCard && 'and pass the rest to '  + nextPlayer + ' ?'}</div>
        :
          <div className="info">Select an artefact to add into your deck.</div>
        
        G.publicData.waitingFor.forEach((id, index) => {
          let isLastPlayer = index === G.publicData.waitingFor.length - 1
          let waitingAtLeastTwoPlayers = G.publicData.waitingFor.length > 1
          let beforeLastPlayer = index === G.publicData.waitingFor.length - 2
          waitingFor += playersName[parseInt(id)]
          waitingFor += isLastPlayer ? '.' :  waitingAtLeastTwoPlayers && beforeLastPlayer ? ' and ' : ', '
        })
        handleConfirm = () => this.pickArtefact(selectedCard.id)
        break
      case 'SELECTING_MAGE':
        title += ` - Mage selection`
        
        draftCards = G.players[playerID].mages.length > 0 && G.players[playerID].mages.map((card) => {
          return <GameComponent key={card.id} component={card} onClick={() => this.handleClick(card)} onDoubleClick={() => this.pickMage(card.id)}/>
        })
        directive = selectedCard ?
          <div className="info">Keep {selectedCard.name} ?</div>
        :
          <div className="info">Select your mage.</div>
        handleConfirm = () => this.pickMage(selectedCard.id)
        
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

    const confirmButton = <Button variant="primary" size="sm" onClick={handleConfirm} disabled={!selectedCard}>Confirm</Button>
    const cancelButton = !lastDraftCard && <Button variant={!selectedCard ? 'primary' : 'secondary'} size="sm" onClick={() => this.handleClick(undefined)} disabled={!selectedCard}>Cancel</Button>
    
    return <>
      <div className='draft-card-panel'>
        <h5>{title}</h5>
        {showCards && <div className={'draft-card card-row ' + profile.cardSize}>
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
    const { G, ctx, playerID, profile, selectedCard } = this.props
    if (!Number.isInteger(parseInt(playerID))) return null
    const playersName = this.getPlayersName()

    let title = 'Magic Item Selection Phase'
    let waiting = playerID !== ctx.currentPlayer
    let waitingFor = 'Waiting for ' + playersName[parseInt(ctx.currentPlayer)] + ' to pick a Magic Item.'
    let hand = this.renderPlayerHand()
    let showButtons = !waiting
    let magicItems = G.publicData.magicItems.map((magicItem) => {
      return waiting ?
        <GameComponent key={magicItem.id} component={magicItem}/>
      :
        <GameComponent key={magicItem.id} component={magicItem} onClick={() => this.handleClick(magicItem)} onDoubleClick={() => this.pickMagicItem(magicItem.id)}/>
    })
  
    let directive = null
    let handleConfirm = null;

    switch (G.publicData.players[playerID].status) {
      case 'SELECTING_MAGIC_ITEM':
        directive = <div className="info">Select a Magic Item.</div>
        handleConfirm = () => this.pickMagicItem(selectedCard.id)
        break
      case 'READY':
      default:
        title = `Get Ready for the battle`
    }

    const confirmButton = <Button variant="primary" size="sm" onClick={handleConfirm} disabled={!selectedCard}>Confirm</Button>
    const cancelButton = <Button variant={!selectedCard ? 'primary' : 'secondary'} size="sm" onClick={() => this.handleClick(undefined)} disabled={!selectedCard}>Cancel</Button>
    
    return <>
      <div className='draft-card-panel'>
        <h5>{title}</h5>
        <div className={'draft-card card-row ' + profile.cardSize}>
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
    const essencesOnComponent = G.players[playerID].uiTemp.essencesOnComponent
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
      return Object.keys(essencesOnComponent).includes(component.id) ||
        component.hasStandardCollectAbility || component.hasSpecificCollectAbility
    })
    // Render those components with essence picker to collect essence.
    let collectComponents = components.map((component, index) => {
      let essences = Object.keys(collectOnComponentActions).includes(component.id) ? null : essencesOnComponent[component.id]
      return <CollectComponent key={component.id + '_' + index} component={component} essencesOnComponent={essences} status={G.publicData.players[playerID].status}/>
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
              collectValid = collectValid && (Object.keys(collectActions).includes(component.id) && collectActions[component.id].valid)
            }
            break
          case 'forgeMaudite':
          default:
            collectValid = collectValid && (Object.keys(collectActions).includes(component.id) && collectActions[component.id].valid)
              || (Object.keys(collectOnComponentActions).includes(component.id) && collectOnComponentActions[component.id].valid)
        }
      } else if (component.hasStandardCollectAbility && component.standardCollectAbility.multipleCollectOptions) {
        collectValid = collectValid && Object.keys(collectActions).includes(component.id) && collectActions[component.id].valid
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
              return <div className="collect-options collect-info">
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
      <div className='draft-card-panel'>
        <h5><div className="collect-icon"></div>{title}{waitingFor}</h5>
        <div className={'draft-card card-row ' + profile.cardSize}>
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

  renderActionBoard = () => {
    const { playerID, selectedCard } = this.props
    if (!Number.isInteger(parseInt(playerID))) return null

    let title = 'Play Phase'
    let waiting = false
    let waitingFor = 'Waiting for '
    let hand = this.renderPlayerHand()
    let showButtons = false
    let directive = null

    const confirmButton = <Button variant="primary" size="sm" onClick={() => this.pickArtefact(selectedCard.id)} disabled={!selectedCard}>Confirm</Button>
    const cancelButton = <Button variant={!selectedCard ? 'primary' : 'secondary'} size="sm" onClick={() => this.handleClick(undefined)} disabled={!selectedCard}>Cancel</Button>

    return <>
      <div className='draft-card-panel'>
        <h5>{title}</h5>
        {waiting ? <h5>{waitingFor}</h5> : <>{directive}</>}
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
    const dialogBoard = this.renderActionBoard()
    return this.renderBoard(dialogBoard)
  }

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
    return <div className={'board-'+layoutSetting}>
      <div className={'common-board ' + sizeSetting}>
        {this.renderCommonBoard()}
      </div>
      <div className="board">
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
    game: state.firestore.ordered.game && state.firestore.ordered.game[0],
    profile: state.firebase.profile,
    selectedCard: state.game.selectedCard,
    tappedComponents: state.game.tappedComponents,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    resetCollect: () => dispatch(resetCollect()),
    selectCard: (card) => dispatch(selectCard(card)),
    setCollectAction: (action) => dispatch(setCollectAction(action)),
    tapComponent: (card) => dispatch(tapComponent(card)),
    toggleChat: () => dispatch(toggleChat())
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
