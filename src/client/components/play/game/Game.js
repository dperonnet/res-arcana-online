import { Game, Pass, PlayerView, TurnOrder   } from 'boardgame.io/core'
import { GameComponents } from '../../../../database'
import logger from 'redux-logger'
import { applyMiddleware } from 'redux'

/**
 * Role: setup
 * This function initialize the game components and board areas.
 */
const getInitialState = (ctx, setupData) => {
  const G = {
    secret: {
      artefactsInGameStack: [],
    },
    players: {},
    publicData: {
      placesOfPowerInGame: [],
      monumentsStack: [],
      monumentsRevealed: [],
      players: {},
      tappedComponents: {},
      waitingFor: []
    },
  }
  for (let i=0; i < ctx.numPlayers; i++) {
    G.players[i]= {
      deck: [],
      draftCards: [],
      deniedCards: [],
      hand: [],
      mages: [],
      reminder: [],
      uiTemp: {
        essencesOnComponent: {}
      }
    }
    G.publicData.players[i] = {
      essencesOnComponent: {},
      essencesPool: {
        elan: 1, life: 1, calm: 1, death: 1, gold: 1
      },
      deckSize: 0,
      discard: [],
      handSize: 0,
      inPlay: [],
      mage: null,
      magicItem: null,
      requiredAction: [],
      status: 'DRAFTING_ARTEFACTS'
    }
  }

  const components = getComponentsByType(GameComponents)

  // Randomly get artefacts from components.
  const nbArtefacts = ctx.numPlayers * 8
  const artefactsInGameStack = ctx.random.Shuffle(components.artefact)
  G.secret.artefactsInGameStack = artefactsInGameStack.slice(0, nbArtefacts)

  // Get places of power excluding those on back side
  let placesOfPower = ctx.random.Shuffle(components.placeOfPower)
  let placesOfPowerExcluded = []
  placesOfPower.forEach((pop)=> {
    if (!placesOfPowerExcluded.includes(pop.id)) {
      G.publicData.placesOfPowerInGame.push(pop)
      placesOfPowerExcluded.push(pop.excludedComponentId)
    }
  })
  G.publicData.magicItems = components.magicItem
  
  // Reveal 2 monuments
  let monumentsInGameStack = ctx.random.Shuffle(components.monument)
  G.publicData.monumentsRevealed = monumentsInGameStack.slice(0, 2)
  G.publicData.monumentsStack = monumentsInGameStack.splice(0, 2)
  
  // Deal 2 mages to players
  let mages = ctx.random.Shuffle(components.mage)
  for (let i=0; i < ctx.numPlayers; i++) {
    G.players[i].mages = mages.slice(0, 2)
    mages.splice(0, 2)
  }

  // Define the first player
  G.publicData.firstPlayer = (ctx.random.Die(ctx.numPlayers) -1).toString()
  
  const skip = true
  
  if (skip) {
    console.log('[setupGameComponents] skipDraftPhase')
    for (let i=0; i<ctx.numPlayers; i++) {
      console.log('[setupGameComponents] creating player\'s setup')
      G.players[i].reminder = G.secret.artefactsInGameStack.slice(0, 8)
      G.secret.artefactsInGameStack.splice(0, 8)
      G.players[i].deck = ctx.random.Shuffle(G.players[i].reminder)
      G.players[i].hand = G.players[i].deck.slice(0, 3)
      G.players[i].deck.splice(0, 3)
      G.publicData.players[i].mage = G.players[i].mages[0]
      G.publicData.players[i].inPlay.push(G.players[i].mages[0])
      G.publicData.players[i].status = 'READY'
      G.publicData.players[i].deckSize = G.players[i].deck.length
      G.publicData.players[i].handSize = G.players[i].hand.length
      G.publicData.players[i].inPlay.push(G.players[i].deck[0])
      G.publicData.players[i].inPlay.push(G.players[i].deck[1])
      G.publicData.players[i].inPlay.push(G.players[i].deck[2])
      G.publicData.players[i].inPlay.push(G.players[i].deck[3])
      G.publicData.players[i].inPlay.push(G.players[i].deck[4])
      G.publicData.players[i].inPlay.push(G.publicData.placesOfPowerInGame[i])
      G.publicData.players[i].inPlay.push(G.publicData.magicItems[ctx.random.Die(Object.keys(G.publicData.magicItems).length)-1])
      
      const essencesTypes = ['elan', 'life', 'calm', 'death', 'gold']
      const essencesTypeNumber = 5
      for (let j = 0; j < essencesTypeNumber; j++){
        for (let k = 0; k < ctx.random.Die(5); k++){
          addEssenceOnComponent(G, i, G.players[i].deck[j].id, essencesTypes[ctx.random.Die(5)-1], ctx.random.Die(5))
        }
      }
    }
  }
  G.skipDraftPhase = skip
  G.startingPhase = skip ? { next: 'collectPhase' } : { next: 'draftPhase' }

  return G
}

/**
 * This function return the game components gathered by their type.
 * @param {*} components array of game components to parse.
 */
const getComponentsByType = (components) => {
  const res = {}
  if (components) {
    Object.values(components).forEach((component) => {
      if(!res[component.type]) res[component.type] = []
      res[component.type].push(component)
    })
  }
  return res
}

// ########## DRAFT PHASE ##########

/**
 * Role: onPhaseBegin
 * This function deal, pass or draw cards depending on what should be done.
 * If a player have 8 cards, then it draw 3 cards for this player.
 * If a player have cards aside then it pass them to the next player.
 * If none of the players have draft cards left, then it deals 4 cards to each players.
 */
const initDraftPhase = (G, ctx) => {
  G.phase = 'DRAFT_PHASE'
  console.log('[initDraftPhase] Call to initDraftPhase()')
  let dealNewCards = true
  for (let i= 0; i < ctx.numPlayers; i++) {
    dealNewCards = dealNewCards && G.players[i].deniedCards.length === 0 && G.players[i].draftCards.length === 0
  }
  let getStartingCards = false
  for (let i= 0; i < ctx.numPlayers; i++) {
    getStartingCards = getStartingCards || (G.players[i].hand.length === 8 && G.publicData.players[i].status === 'DRAFTING_ARTEFACTS')
  }
  if (getStartingCards) {
    drawStartingCards(G, ctx)
  } else if (dealNewCards) {
    G.draftWay = G.draftWay && G.draftWay === 'toLeftPlayer' ? 'toRightPlayer' : 'toLeftPlayer'
    dealDraftCards(G, ctx)
  } else {
    getNextCards(G, ctx)
  }
  return G
}

/**
 * This function deal 4 cards to each player.
 */
const dealDraftCards = (G, ctx) => {
  console.log('[dealDraftCards] Call to dealDraftCards()')
  for (let i= 0; i < ctx.numPlayers; i++) {
    G.players[i].draftCards.push(G.secret.artefactsInGameStack.slice(0, 4)) // deal 4 cards to player
    G.secret.artefactsInGameStack.splice(0, 4) // remove 4 cards from pile
    G.publicData.waitingFor.push(i)
  }
  return G
}

/**
 * This function pass cards to the next player.
 */
const getNextCards = (G, ctx) => {
    console.log('[getNextCards] Call to getNextCards()')
  for (let i= 0; i < ctx.numPlayers; i++) {
    if(G.players[i].deniedCards.length > 0) {
      const nextPlayerID = ((G.draftWay === 'toLeftPlayer' ? 1 : ctx.numPlayers - 1) + parseInt(i)) % ctx.numPlayers
      G.players[nextPlayerID].draftCards.push(copy(G.players[i].deniedCards))
      G.players[i].deniedCards = []
    }
  }
  for (let i= 0; i < ctx.numPlayers; i++) {
    if (G.players[i].draftCards.length > 0 && G.publicData.waitingFor.indexOf(parseInt(i)) < 0) {
      G.publicData.waitingFor.push(i)
    }
  }
  return G
}

/**
 * Shuffle player's decks then draw 3 cards and place them in players hand.
 */
const drawStartingCards = (G, ctx) => {
  console.log('[drawStartingCards] Call to drawStartingCards()')
  for (let i= 0; i < ctx.numPlayers; i++) {
    if( G.players[i].hand.length === 8) {
      G.players[i].reminder = copy(G.players[i].hand)
      G.players[i].deck = ctx.random.Shuffle(G.players[i].hand)
      G.players[i].hand = G.players[i].deck.slice(0, 3)
      G.players[i].deck.splice(0, 3)
      G.publicData.players[i].status = 'SELECTING_MAGE'
      G.publicData.players[i].deckSize = G.players[i].deck.length
      G.publicData.players[i].handSize = G.players[i].hand.length
    }
  }
  return G
}

/**
 * Role: Move
 * Keep an artefact from the draft cards.
 * Place the others cards aside to the next player. 
 * 
 * @param {*} playerID player selecting the artefact.
 * @param {*} cardId id of the selected artefact.
 */
const pickArtefact = (G, ctx, playerID, cardId) => {
  console.log('[pickArtefact] The player', playerID, 'picked artefact', cardId)
  const selectedCard = copy(G.players[playerID].draftCards[0].filter((card) => {
    return card.id === cardId
  })[0])
  G.players[playerID].hand.push(selectedCard)
  const deniedCards = copy(G.players[playerID].draftCards[0].filter((card) => {
    return card.id !== cardId
  }))
  G.players[playerID].deniedCards = deniedCards
  G.players[playerID].draftCards.splice(0,1)
  G.publicData.players[playerID].deckSize = G.players[playerID].hand.length
  G.publicData.players[playerID].handSize = G.players[playerID].hand.length
  if (G.players[playerID].draftCards.length === 0) {
    G.publicData.waitingFor.splice(G.publicData.waitingFor.indexOf(parseInt(playerID)), 1)
  }
  const essencesTypes = ['elan', 'life', 'calm', 'death', 'gold']
  const essencesTypeNumber = 5
  for (let i = 0; i < essencesTypeNumber; i++){
    addEssenceOnComponent(G, playerID, cardId, essencesTypes[i], ctx.random.Die(5))
  }
  return G
}

/**
 * This function place essences on a game component.
 * 
 * @param {*} playerID player's id owning the component.
 * @param {*} componentId id of the component.
 * @param {*} essenceType type of essence to place on component.
 * @param {*} essenceNumber number of essence to place on component.
 */
const addEssenceOnComponent = (G, playerID, componentId, essenceType, essenceNumber) => {
  let component = G.publicData.players[playerID].essencesOnComponent[componentId]
  if (!component) {
    G.publicData.players[playerID].essencesOnComponent[componentId] = {}
    component = G.publicData.players[playerID].essencesOnComponent[componentId]
  }
  if (component[essenceType]) {
    component[essenceType] += essenceNumber
  } else {
    component[essenceType] = essenceNumber
  }
}

const removeFromComponent = (G, playerID, componentId, essenceList ) => {

}

const removeAllFromComponent = (G, playerID, componentId) => {
  delete G.publicData.players[playerID].essencesOnComponent[componentId]
}

/**
 * Role: Move
 * This function define which mage the player will embody for the game and place it into play.
 * @param {*} playerID player selecting the mage.
 * @param {*} mageId id of the selected mage card.
 */
const pickMage = (G, ctx, playerID, mageId) => {
  console.log('[pickMage] The player', playerID, 'picked mage', mageId)
  const selectedCard = copy(G.players[playerID].mages.filter((mage) => {
    return mage.id === mageId
  })[0])
  G.publicData.players[playerID].mage = selectedCard
  if (G.players[playerID].draftCards.length === 0) {
    G.publicData.waitingFor.splice(G.publicData.waitingFor.indexOf(parseInt(playerID)), 1)
  }
  G.publicData.players[playerID].inPlay.push(selectedCard)
  G.publicData.players[playerID].status = 'READY'
  return G
}

/**
 * Role: endPhaseIf
 * This function define what should be the next phase depending on the current game context.
 */
const checkIfAllCardsDrafted = (G, ctx) => {
  console.log('[checkIfAllCardsDrafted] Call to checkIfAllCardsDrafted()')
  let hasCardsToPass = false
  let needDealCards = true
  let playersReady = true
  let needStartingCards = false
  for (let i= 0; i < ctx.numPlayers; i++) {
    hasCardsToPass = hasCardsToPass || G.players[i].deniedCards.length > 0
    needDealCards = needDealCards && G.players[i].hand.length === 4 && G.players[i].draftCards.length === 0
    playersReady = playersReady && G.publicData.players[i].status === 'READY'
    needStartingCards = needStartingCards || (G.players[i].hand.length === 8 && G.publicData.players[i].status === 'DRAFTING_ARTEFACTS')
  }
  if (playersReady) {
    console.log('[checkIfAllCardsDrafted] All players are ready, return "pickMagicItemPhase"')
    return { next: 'pickMagicItemPhase' }
  }
  if (hasCardsToPass) {
    console.log('[checkIfAllCardsDrafted] One Player at least has cards to pass, return "drafPhase"')
    return { next: 'draftPhase' }
  }
  if (needDealCards) {
    console.log('[checkIfAllCardsDrafted] Players need new cards, return "drafPhase"')
    return { next: 'draftPhase' }
  }
  if (needStartingCards) {
    console.log('[checkIfAllCardsDrafted]] One Player at least need his starting hand, return "drafPhase"')
    return { next: 'draftPhase' }
  }
  console.log('[checkIfAllCardsDrafted] There is no need to return a specific Phase')
}




// ########## PICK MAGIC ITEM PHASE ##########

/**
 * Role: onPhaseBegin
 * This function update players's status so they could pick a magic item.
 */
const initPickMagicItemPhase = (G, ctx) => {
  console.log('[initPickMagicItemPhase] Call to initPickMagicItemPhase()')
  G.phase = 'PICK_MAGIC_ITEM_PHASE'
  Object.entries(G.publicData.players).forEach((player) => {
    if (!player[1].magicItem) {
      player[1].status = 'SELECTING_MAGIC_ITEM'
    }
  })
  return G
}

/**
 * Role: Move
 * Pick a magic item from the the magic item pool.
 * 
 * @param {*} playerID player selecting the magic item.
 * @param {*} magicItemId id of the selected magic item.
 */
const pickMagicItem = (G, ctx, playerID, magicItemId) => {
  console.log('[pickMagicItem] The player', playerID, 'picked magic item', magicItemId)
  let selectedItemIndex = 0
  if (G.publicData.players[playerID].magicItem){
    G.publicData.magicItems.push(G.publicData.players[playerID].magicItem)
    G.publicData.players[playerID].magicItem = null
  }
  const selectedItem = copy(G.publicData.magicItems.filter((magicItem, index) => {
    const isSelectedItem = magicItem.id === magicItemId
    if (isSelectedItem) {
      selectedItemIndex = index
    }
    return isSelectedItem
  })[0])
  G.publicData.players[playerID].magicItem = selectedItem
  G.publicData.players[playerID].inPlay.push(selectedItem);
  G.publicData.magicItems.splice(selectedItemIndex, 1)
  G.publicData.players[ctx.currentPlayer].status = 'READY'
  return G
}

/**
 * Role: endPhaseIf
 * This function check if all players have picked their magic item
 * and define the next phase.
 */
const allMagicItemsReady = (G, ctx) => {
  console.log('[allMagicItemsReady] Call to allMagicItemsReady()')
  let magicItemsReady = true  
  let playersReady = true  
  for (let i= 0; i < ctx.numPlayers; i++) {
    magicItemsReady = magicItemsReady && G.publicData.players[i].magicItem
    playersReady = playersReady && G.publicData.players[i].status === 'READY'
  }
  if (magicItemsReady && playersReady) return {next: 'collectPhase' }
}

/**
 * Role: turnOrder
 * Define the turn order counter-clockwise starting from the last player.
 */
const getTurnOrderFromLastPlayer = (G, ctx) => {
  const order = getTurnOrder(G, ctx).reverse()
  console.log('order',order)
  return order
}

// ########## COLLECT PHASE ##########

/**
 * Role: onPhaseBegin
 * This function update players's status according their collect ability in play.
 * If player doesn't have collect ability in play, set status to ready.
 * If player has standard collect ability in play without choice, set status to ready.
 * If player has standard collect ability in play with choice, set status to collect action required.
 * If player has specific collect ability in play, may set status to collect action required.
 * If player has essence on components in play, set status to collect action available.
 */
const initCollectPhase = (G, ctx) => {
  console.log('[initCollectPhase] Call to initCollectPhase()')
  if (G.phase !== "COLLECT_PHASE") {
    G.phase = "COLLECT_PHASE"
    
    for (let i= 0; i < ctx.numPlayers; i++) {
      const collectActions = []
      
      if (Object.keys(G.publicData.players[i].essencesOnComponent).length > 0) {
        G.publicData.players[i].status ='COLLECT_ACTION_AVAILABLE'
        G.players[i].uiTemp.essencesOnComponent = copy(G.publicData.players[i].essencesOnComponent)
      } else {
        G.publicData.players[i].status = 'READY'
      }

      G.publicData.players[i].inPlay.forEach((component) => {
        if (component.hasStandardCollectAbility) {
          if(component.standardCollectAbility.multipleCollectOptions) {
            G.publicData.players[i].status = 'COLLECT_ACTION_REQUIRED'
          } else {
            const collectAction = {
              id: component.id,
              name: component.name,
              essences: component.standardCollectAbility.essenceList,
              from: 'COLLECT_ABILITY',
              type: 'GAIN'
            }
            collectActions.push(collectAction)
          }
        }

        if (component.hasSpecificCollectAbility) {
          let essences
          switch (component.id) {
            case 'automate':
              essences = G.publicData.players[i].essencesOnComponent[component.id]
              if (essences && essences.length > 0) {
                G.publicData.players[i].status = 'COLLECT_ACTION_REQUIRED'
              }
              break
            case 'coffreFort':
              essences = G.publicData.players[i].essencesOnComponent[component.id]
              if (essences && essences['gold'] > 0) {
                G.publicData.players[i].status = 'COLLECT_ACTION_REQUIRED'
                G.publicData.players[i].requiredAction.push('coffreFort')
              }
              break
            case 'forgeMaudite':
            default:
              G.publicData.players[i].status = 'COLLECT_ACTION_REQUIRED'
          }
        }
      })
      G.publicData.players[i].collectActions = collectActions
    }
  }
  return G
}

const collectEssences = (G, ctx, playerID, collectActions, collectOnComponentActions) => {
  console.log('[collectEssences] Call to collectEssences()',collectActions, collectOnComponentActions)
  collectActions && Object.values(collectActions).forEach((action) => {
    if (action.type === 'GAIN') {
      Object.entries(action.essences).forEach((essence) => {
        console.log('add',essence[0],essence[1])
        G.publicData.players[playerID].essencesPool[essence[0]] = G.publicData.players[playerID].essencesPool[essence[0]] + essence[1]
      })
    } else if (action.type === 'COST') {
      Object.entries(action.essences).forEach((essence) => {
        console.log('remove',essence[0],essence[1])
        G.publicData.players[playerID].essencesPool[essence[0]] = G.publicData.players[playerID].essencesPool[essence[0]]- essence[1]
      })
    } else if (action.type === 'TAP') {
      G.publicData.tappedComponents[action.id] = true
    }
  })
  collectOnComponentActions && Object.entries(collectOnComponentActions).forEach((action) => {
    Object.entries(action[1].essences).forEach((essence) => {
      console.log('add',essence[0],essence[1])
      G.publicData.players[playerID].essencesPool[essence[0]] = G.publicData.players[playerID].essencesPool[essence[0]] + essence[1]
    })
    removeAllFromComponent(G, playerID, action[0])
  })
  G.publicData.players[playerID].collectActions && Object.values(G.publicData.players[playerID].collectActions).forEach((action) => {
    Object.entries(action.essences).forEach((essence) => {
      console.log('add',essence[0],essence[1])
      G.publicData.players[playerID].essencesPool[essence[0]] = G.publicData.players[playerID].essencesPool[essence[0]] + essence[1]
    })
  })
  let automate = G.publicData.players[playerID].inPlay.filter((component) => {
    return component.id === 'automate'
  })
  if (automate && automate[0]) {
    console.log('automate in play')
    if (!Object.keys(collectOnComponentActions).includes('automate')) {
      if (G.publicData.players[playerID].essencesOnComponent['automate']) {
        Object.keys(G.publicData.players[playerID].essencesOnComponent['automate']).forEach((essence) => {
          addEssenceOnComponent(G, playerID, 'automate', essence, 2)
        })
      }
    }
  }

  G.publicData.players[playerID].status = 'READY'
  G.players[playerID].uiTemp.collectActions = collectActions
  G.players[playerID].uiTemp.collectOnComponentActions = collectOnComponentActions
  return G
}

const allCollectsReady = (G, ctx) => {
  console.log('[allCollectsReady] Call to allCollectsReady()')
  let playersReady = true
  for (let i= 0; i < ctx.numPlayers; i++) {
    playersReady = playersReady && G.publicData.players[i].status === 'READY'
  }
  if (playersReady) {
    console.log('[allCollectsReady] All players are ready, return "playPhase"')
    return {next: 'playPhase' }
  }
  console.log('[allCollectsReady] One player at least is not ready, return "collectPhase"')
}

const getCollectTurnOrder = (G, ctx) => {
  let firstPlayer = G.publicData.firstPlayer
  let order = []
  for (let i = 0; i < ctx.numPlayers; i++ ) {
    let nextPlayerId = (parseInt(firstPlayer) + i) % ctx.numPlayers
    order.push((nextPlayerId).toString())
  }
  return order
}

// ########## PLAY PHASE ##########
const initPlayPhase = (G, ctx) => {
  console.log('[initPlayPhase] Call to initPlayPhase()')
  G.phase = 'PLAY_PHASE'
  return G
}

const playArtefact = (G, ctx, artefactId) => {
  let artefactIndex = G.artefacts.findIndex(
    artefact => artefact.id === artefactId
  )
  let artefact = copy(G.artefacts[artefactIndex])
  G.artefacts.splice(artefactIndex, 1)
  if (!G.artefactsInPlay) G.artefactsInPlay= {}
  G.artefactsInPlay[ctx.currentPlayer].push(artefact)
}

const getTurnOrder = (G, ctx) => {
  let firstPlayer = G.publicData.firstPlayer
  let order = []
  for (let i = 0; i < ctx.numPlayers; i++ ) {
    let nextPlayerId = (parseInt(firstPlayer) + i) % ctx.numPlayers
    order.push((nextPlayerId).toString())
  }
  return order
}

function copy(value) {
  return JSON.parse(JSON.stringify(value))
}
const setupGameComponents = (G, ctx) => {
  console.log('[setupGameComponents] Call to setupGameComponents')
  if (G && G.skipDraftPhase) {
    console.log('[setupGameComponents] skipDraftPhase')
    for (let i=0; i<ctx.numPlayers; i++) {
      console.log('[setupGameComponents] creating player\'s setup')
      G.players[i].reminder = G.secret.artefactsInGameStack.slice(0, 8)
      G.secret.artefactsInGameStack.splice(0, 8)
      G.players[i].deck = ctx.random.Shuffle(G.players[i].reminder)
      G.players[i].hand = G.players[i].deck.slice(0, 3)
      G.players[i].deck.splice(0, 3)
      G.publicData.players[i].mage = G.players[i].mages[0]
      G.publicData.players[i].inPlay.push(G.players[i].mages[0])
      G.publicData.players[i].status = 'READY'
      G.publicData.players[i].deckSize = G.players[i].deck.length
      G.publicData.players[i].handSize = G.players[i].hand.length
    }
  }
  return G
}

const getStartingPhase = (G) => {
  console.log('[getStartingPhase] Call to getStartingPhase, G.startingPhase', G.startingPhase)
  return G.startingPhase;
}

// ########## GAME ##########
export const ResArcanaGame = Game({
  name: 'res-arcana',

  setup: (G,ctx) => getInitialState(G, ctx),

  moves: {
    collectEssences: collectEssences,
    pickArtefact: pickArtefact,
    playArtefact: playArtefact,
    pickMage: pickMage,
    pickMagicItem: pickMagicItem,
    pass: Pass,
  },

  flow: {
    onMove: (G, ctx) => G,
    movesPerTurn: 1,
    startingPhase: 'collectPhase',

    phases: {
      setupPhase: {
        onPhaseBegin: (G, ctx) => setupGameComponents(G, ctx),
        endPhaseIf: (G, ctx) => getStartingPhase(G, ctx)
      },
      draftPhase: {
        onPhaseBegin: (G, ctx) => initDraftPhase(G, ctx),
        allowedMoves: ['pickArtefact','pickMage'],
        turnOrder: TurnOrder.ANY,
        endPhaseIf: (G, ctx) => checkIfAllCardsDrafted(G, ctx)
      },
      pickMagicItemPhase: {
        onPhaseBegin: (G, ctx) => initPickMagicItemPhase(G, ctx),
        allowedMoves: ['pickMagicItem'],
        turnOrder: {
          playOrder: (G, ctx) => getTurnOrderFromLastPlayer(G, ctx),
          first: (G, ctx) => 0,
          next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
        endPhaseIf: allMagicItemsReady
      },
      collectPhase: {
        onPhaseBegin: (G, ctx) => initCollectPhase(G, ctx),
        allowedMoves: ['collectEssences'],
        turnOrder: {
          playOrder: (G, ctx) => getCollectTurnOrder(G, ctx),
          first: (G, ctx) => 0,
          next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
        endPhaseIf: allCollectsReady
      },
      playPhase: {
        onPhaseBegin: initPlayPhase,
        allowedMoves: ['pass','playArtefact'],
        endPhaseIf: G => G.passed,
        turnOrder: {
          playOrder: (G, ctx) => getTurnOrder(G, ctx),
          first: (G, ctx) => G.publicData.firstPlayer,
          next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
      }
    },
  },
  enhancer: applyMiddleware(logger),
  playerView: PlayerView.STRIP_SECRETS
})
