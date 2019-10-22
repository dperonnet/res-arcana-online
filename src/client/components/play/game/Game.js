import { PlayerView, Stage, TurnOrder } from 'boardgame.io/core'
import { GameComponents } from '../../../../database'
import logger from 'redux-logger'
import { applyMiddleware } from 'redux'
import { sendMessage } from '../../../../store/actions/chatActions'

/**
 * Role: setup
 * This function initialize the game components and board areas.
 */
const getInitialState = (ctx, setupData) => {
  const G = {
    secret: {
      artefactsInGameStack: [],
      victoryPoints: [],
    },
    allPassed: false,
    passOrder: [],
    players: {},
    publicData: {
      placesOfPowerInGame: [],
      monumentsStack: [],
      monumentsRevealed: [],
      players: {},
      turnedComponents: {},
      waitingFor: [],
    },
    chatId: +setupData.chatId,
  }
  for (let i = 0; i < ctx.numPlayers; i++) {
    G.players[i] = {
      deck: [],
      draftCards: [],
      deniedCards: {},
      hand: [],
      mages: [],
      reminder: [],
      uiTemp: {
        essencesOnComponent: {},
      },
    }
    G.publicData.players[i] = {
      essencesOnComponent: {},
      essencesPool: {
        elan: 1,
        life: 1,
        calm: 1,
        death: 1,
        gold: 1,
      },
      deckSize: 0,
      discard: [],
      handSize: 0,
      inPlay: [],
      mage: null,
      magicItem: null,
      status: 'DRAFTING_ARTEFACTS',
    }
    G.secret.victoryPoints.push(0)
  }
  console.log('setupData.chatId', setupData.chatId)
  const components = getComponentsByType(GameComponents)

  // Randomly get artefacts from components.
  const artefactsInGameStack = ctx.random.Shuffle(components.artefact)
  G.secret.artefactsInGameStack = artefactsInGameStack

  // Get places of power excluding those on back side
  let placesOfPower = ctx.random.Shuffle(components.placeOfPower)
  let placesOfPowerExcluded = []
  placesOfPower.forEach(pop => {
    if (!placesOfPowerExcluded.includes(pop.id)) {
      G.publicData.placesOfPowerInGame.push(pop)
      placesOfPowerExcluded.push(pop.excludedComponentId)
    }
  })
  G.publicData.magicItems = components.magicItem

  // Reveal 2 monuments
  let monumentsInGameStack = ctx.random.Shuffle(components.monument)
  G.publicData.monumentsRevealed = monumentsInGameStack.splice(0, 2)
  G.publicData.monumentsStack = monumentsInGameStack

  // Deal 2 mages to players
  // const artificier = copy(components.mage.filter((mage) => mage.id === 'artificier')[0])
  let mages = ctx.random.Shuffle(components.mage)
  for (let i = 0; i < ctx.numPlayers; i++) {
    G.players[i].mages = mages.slice(0, 2)
    mages.splice(0, 2)
  }

  // Define the first player
  G.publicData.firstPlayer = (ctx.random.Die(ctx.numPlayers) - 1).toString()

  const skip = false

  if (skip) {
    console.log('[setupGameComponents] skipDraftPhase')
    for (let i = 0; i < ctx.numPlayers; i++) {
      console.log('[setupGameComponents] creating player s setup')
      G.players[i].reminder = G.secret.artefactsInGameStack.slice(0, 8)
      G.secret.artefactsInGameStack.splice(0, 8)
      G.players[i].deck = ctx.random.Shuffle(G.players[i].reminder)
      G.players[i].hand = G.players[i].deck.splice(0, 3)
      G.publicData.players[i].mage = G.players[i].mages[0]
      G.publicData.players[i].inPlay.push(G.players[i].mages[0])
      G.publicData.players[i].status = 'READY'
      G.publicData.players[i].inPlay.push(G.players[i].deck[0])
      G.publicData.players[i].inPlay.push(G.players[i].deck[1])
      G.publicData.players[i].inPlay.push(G.players[i].deck[2])
      G.players[i].deck.splice(0, 3)
      G.publicData.players[i].inPlay.push(G.publicData.placesOfPowerInGame[0])
      G.publicData.placesOfPowerInGame.splice(0, 1)
      G.publicData.magicItems = ctx.random.Shuffle(G.publicData.magicItems)
      G.publicData.players[i].inPlay.push(G.publicData.magicItems[0])
      G.publicData.players[i].magicItem = copy(G.publicData.magicItems[0])
      G.publicData.magicItems.splice(0, 1)
      G.publicData.players[i].deckSize = G.players[i].deck.length
      G.publicData.players[i].handSize = G.players[i].hand.length

      const essencesTypes = ['elan', 'life', 'calm', 'death', 'gold']
      const essencesTypeNumber = 5

      for (let j = 0; j < G.publicData.players[i].inPlay.length; j++) {
        if (G.publicData.players[i].inPlay[j].type === 'artefact') {
          for (let k = 0; k < ctx.random.Die(essencesTypeNumber); k++) {
            updateEssenceOnComponent(
              G,
              i,
              G.publicData.players[i].inPlay[j].id,
              essencesTypes[ctx.random.Die(essencesTypeNumber) - 1],
              ctx.random.Die(5)
            )
          }
        }
      }
    }
  }
  G.skipDraftPhase = skip
  G.startingPhase = skip ? { next: 'actionPhase' } : { next: 'draftPhase' }

  return G
}

/**
 * This function return the game components gathered by their type.
 *
 * @param {*} components array of game components to parse.
 */
const getComponentsByType = components => {
  const res = {}
  if (components) {
    Object.values(components).forEach(component => {
      if (!res[component.type]) res[component.type] = []
      res[component.type].push(component)
    })
  }
  return res
}

// ########## DRAFT PHASE ##########

/**
 * Role: onBegin
 * This function deal, pass or draw cards depending on what should be done.
 * If a player have 8 cards, then it draw 3 cards for this player.
 * If a player have cards aside then it pass them to the next player.
 * If none of the players have draft cards left, then it deals 4 cards to each players.
 */
const initDraftPhase = (G, ctx) => {
  G.phase = 'DRAFT_PHASE'
  console.log('[initDraftPhase] Call to initDraftPhase()')
  let dealNewCards = true
  for (let i = 0; i < ctx.numPlayers; i++) {
    dealNewCards =
      dealNewCards && Object.keys(G.players[i].deniedCards).length === 0 && G.players[i].draftCards.length === 0
  }
  let getStartingCards = false
  for (let i = 0; i < ctx.numPlayers; i++) {
    getStartingCards =
      getStartingCards || (G.players[i].hand.length === 8 && G.publicData.players[i].status === 'DRAFTING_ARTEFACTS')
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
  for (let i = 0; i < ctx.numPlayers; i++) {
    let newDraftHand = {}
    G.secret.artefactsInGameStack.slice(0, 4).forEach(artefact => (newDraftHand[artefact.id] = artefact))

    G.secret.artefactsInGameStack.splice(0, 4) // remove 4 cards from pile
    G.players[i].draftCards.push(newDraftHand) // deal 4 cards to player
    G.publicData.waitingFor.push(i)
  }
  return G
}

/**
 * This function pass cards to the next player.
 */
const getNextCards = (G, ctx) => {
  console.log('[getNextCards] Call to getNextCards()')
  for (let i = 0; i < ctx.numPlayers; i++) {
    if (Object.keys(G.players[i].deniedCards).length > 0) {
      const nextPlayerID = ((G.draftWay === 'toLeftPlayer' ? 1 : ctx.numPlayers - 1) + parseInt(i)) % ctx.numPlayers
      G.players[nextPlayerID].draftCards.push(copy(G.players[i].deniedCards))
      G.players[i].deniedCards = {}
    }
  }
  for (let i = 0; i < ctx.numPlayers; i++) {
    if (Object.keys(G.players[i].deniedCards).length > 0 && G.publicData.waitingFor.indexOf(parseInt(i)) < 0) {
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
  for (let i = 0; i < ctx.numPlayers; i++) {
    if (G.players[i].hand.length === 8) {
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
  sendMessage('player', playerID, ' picked', cardId)
  console.log('[pickArtefact] The player', playerID, 'picked artefact', cardId)
  let selectedCards = Object.entries(G.players[playerID].draftCards[0]).filter(card => {
    return card[0] === cardId
  })
  let selectedCard = copy(selectedCards[0][1])
  G.players[playerID].hand.push(selectedCard)
  let newDeniedCard = {}
  Object.entries(G.players[playerID].draftCards[0]).forEach(card => {
    if (card[0] !== cardId) {
      newDeniedCard[card[0]] = card[1]
    }
  })
  let deniedCards = copy(newDeniedCard)
  G.players[playerID].deniedCards = deniedCards
  G.players[playerID].draftCards.splice(0, 1)
  G.publicData.players[playerID].deckSize = G.players[playerID].hand.length
  G.publicData.players[playerID].handSize = G.players[playerID].hand.length
  if (G.players[playerID].draftCards.length === 0) {
    G.publicData.waitingFor.splice(G.publicData.waitingFor.indexOf(parseInt(playerID)), 1)
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
const updateEssenceOnComponent = (G, playerID, componentId, essenceType, essenceNumber, factor = 1) => {
  let componentPool = G.publicData.players[playerID].essencesOnComponent[componentId]
  if (!componentPool) {
    G.publicData.players[playerID].essencesOnComponent[componentId] = []
    componentPool = G.publicData.players[playerID].essencesOnComponent[componentId]
  }
  let index = componentPool.findIndex(essence => essence.type === essenceType)
  if (index > -1) {
    componentPool[index].quantity += factor * essenceNumber
  } else {
    componentPool.push({ type: essenceType, quantity: factor * essenceNumber })
  }
}

const removeAllFromComponent = (G, playerID, componentId) => {
  delete G.publicData.players[playerID].essencesOnComponent[componentId]
}

/**
 * Role: Move
 * This function define which mage the player will embody for the game and place it into play.
 *
 * @param {*} playerID player selecting the mage.
 * @param {*} mageId id of the selected mage card.
 */
const pickMage = (G, ctx, playerID, mageId) => {
  console.log('[pickMage] The player', playerID, 'picked mage', mageId)
  const selectedCard = copy(
    G.players[playerID].mages.filter(mage => {
      return mage.id === mageId
    })[0]
  )
  G.publicData.players[playerID].mage = selectedCard
  if (G.players[playerID].draftCards.length === 0) {
    G.publicData.waitingFor.splice(G.publicData.waitingFor.indexOf(parseInt(playerID)), 1)
  }
  G.publicData.players[playerID].inPlay.push(selectedCard)
  G.publicData.players[playerID].status = 'READY'
  return G
}

/**
 * Role: endIf
 * This function define what should be the next phase depending on the current game context.
 */
const checkAllCardsDrafted = (G, ctx) => {
  console.log('[checkAllCardsDrafted] Call to checkAllCardsDrafted()')
  let phase = 'draftPhase'
  let hasCardsToPass = false
  let needDealCards = true
  let playersReady = true
  let needStartingCards = false
  for (let i = 0; i < ctx.numPlayers; i++) {
    hasCardsToPass = hasCardsToPass || Object.keys(G.players[i].deniedCards).length > 0
    needDealCards = needDealCards && G.players[i].hand.length === 4 && G.players[i].draftCards.length === 0
    playersReady = playersReady && G.publicData.players[i].status === 'READY'
    needStartingCards =
      needStartingCards || (G.players[i].hand.length === 8 && G.publicData.players[i].status === 'DRAFTING_ARTEFACTS')
  }
  if (playersReady) {
    console.log('[checkAllCardsDrafted] All players are ready, set phase to "pickMagicItemPhase"')
    phase = 'pickMagicItemPhase'
  } else if (hasCardsToPass) {
    console.log('[checkAllCardsDrafted] One Player at least has cards to pass, set phase to "drafPhase"')
  } else if (needDealCards) {
    console.log('[checkAllCardsDrafted] Players need new cards, set phase to "drafPhase"')
  } else if (needStartingCards) {
    console.log('[checkAllCardsDrafted]] One Player at least need his starting hand, set phase to "drafPhase"')
  } else {
    console.log('[checkAllCardsDrafted] One player at least has to pick cards, set phase to "drafPhase"')
  }
  ctx.events.setPhase(phase)
}

// ########## PICK MAGIC ITEM PHASE ##########

/**
 * Role: onBegin
 * This function update players's status so they could pick a magic item.
 */
const initPickMagicItemPhase = G => {
  console.log('[initPickMagicItemPhase] Call to initPickMagicItemPhase()')
  G.phase = 'PICK_MAGIC_ITEM_PHASE'
  Object.entries(G.publicData.players).forEach(player => {
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
 * @param {*} magicItemId id of the selected magic item.
 */
const pickMagicItem = (G, ctx, magicItemId) => {
  const playerID = ctx.currentPlayer
  console.log('[pickMagicItem] The player', playerID, 'picked magic item', magicItemId)
  let selectedItemIndex = 0
  let releasedItemIndex
  if (G.publicData.players[playerID].magicItem) {
    G.publicData.players[playerID].inPlay.forEach((component, index) => {
      const isReleasedItem = component.type === 'magicItem'
      if (isReleasedItem) {
        releasedItemIndex = index
      }
    })
    G.publicData.magicItems.push(G.publicData.players[playerID].magicItem)
    G.publicData.players[playerID].magicItem = null
    G.publicData.players[playerID].inPlay.splice(releasedItemIndex, 1)
    G.publicData.players[playerID].inPlay = G.publicData.players[playerID].inPlay.filter(component => {
      return component.id !== magicItemId
    })
  }
  const selectedItem = copy(
    G.publicData.magicItems.filter((magicItem, index) => {
      const isSelectedItem = magicItem.id === magicItemId
      if (isSelectedItem) {
        selectedItemIndex = index
      }
      return isSelectedItem
    })[0]
  )
  G.publicData.players[playerID].magicItem = selectedItem
  G.publicData.players[playerID].inPlay.push(selectedItem)
  G.publicData.magicItems.splice(selectedItemIndex, 1)
  G.publicData.players[playerID].status = 'READY'
  return G
}

/**
 * Role: endIf
 * This function check if all players have picked their magic item
 * and define the next phase.
 */
const checkAllMagicItemsReady = (G, ctx) => {
  console.log('[checkAllMagicItemsReady] Call to checkAllMagicItemsReady()')
  let magicItemsReady = true
  let playersReady = true
  for (let i = 0; i < ctx.numPlayers; i++) {
    magicItemsReady = magicItemsReady && G.publicData.players[i].magicItem
    playersReady = playersReady && G.publicData.players[i].status === 'READY'
  }
  if (magicItemsReady && playersReady) {
    console.log('[checkAllMagicItemsReady] All players are ready, return "collectPhase"')
    return { next: 'collectPhase' }
  }
  console.log('[checkAllMagicItemsReady] One player at least is not ready, return undefined')
}

/**
 * Role: turnOrder
 * Define the turn order counter-clockwise starting from the last player.
 */
const getPickMagicItemPhaseTurnOrder = (G, ctx) => {
  let order = getTurnOrder(G, ctx).reverse()
  console.log('[getPickMagicItemPhaseTurnOrder] Pick Magic Item phase order :', order)
  return order
}

/**
 * Role: TurnOrder.next
 * During pick magic item phase, return the next player's id.
 */
const getNextPlayerPickMagicItemPhase = (G, ctx) => {
  let nextPlayerPos = (ctx.playOrderPos + 1) % ctx.numPlayers
  console.log('[Call to getNextPlayerPickMagicItemPhase] next player pos :', nextPlayerPos)
  return nextPlayerPos
}

// ########## COLLECT PHASE ##########

/**
 * Role: onBegin
 * This function update players's status according their collect ability in play.
 * If player doesn't have collect ability in play, set status to ready.
 * If player has standard collect ability in play without choice, set status to ready.
 * If player has standard collect ability in play with choice, set status to collect action required.
 * If player has specific collect ability in play, may set status to collect action required.
 * If player has essence on components in play, set status to collect action available.
 */
const initCollectPhase = (G, ctx) => {
  console.log('[initCollectPhase] Call to initCollectPhase()')
  if (G.phase !== 'COLLECT_PHASE') {
    G.passOrder = []
    G.allPassed = false
    computeVictoryPoints(G, ctx)
    G.publicData.turnedComponents = {}

    G.phase = 'COLLECT_PHASE'

    for (let i = 0; i < ctx.numPlayers; i++) {
      const collectActions = []
      G.players[i].uiTemp = {
        essencesOnComponent: {},
      }
      let status = 'NOTHING_TO_COLLECT'
      let hasFixedCollectAction = false
      if (Object.keys(G.publicData.players[i].essencesOnComponent).length > 0) {
        status = 'COLLECT_ACTION_REQUIRED'
        G.players[i].uiTemp.essencesOnComponent = copy(G.publicData.players[i].essencesOnComponent)
      }

      G.publicData.players[i].inPlay.forEach(component => {
        if (component.hasStandardCollectAbility) {
          const collectAction = {
            id: component.id,
            name: component.name,
            essences: component.standardCollectAbility.essenceList,
            from: 'COLLECT_ABILITY',
            type: 'GAIN',
          }
          collectActions.push(collectAction)
          hasFixedCollectAction = true
        }

        if (component.hasSpecificCollectAbility) {
          let essences
          switch (component.id) {
            case 'coffreFort':
              essences = G.publicData.players[i].essencesOnComponent[component.id]
              if (essences && essences.filter(essence => essence.type === 'gold').length > 0) {
                status = 'COLLECT_ACTION_REQUIRED'
              }
              break
            case 'forgeMaudite':
            default:
              status = 'COLLECT_ACTION_REQUIRED'
          }
        }
      })

      if (status === 'NOTHING_TO_COLLECT' && hasFixedCollectAction) {
        status = 'COLLECT_ACTION_FIXED'
      }

      G.publicData.players[i].status = status
      G.publicData.players[i].collectActions = collectActions
    }
  }
  return G
}

/**
 * Role: Move
 * This function execute all collect moves made by a player.
 *
 * @param {*} collectActions contains all the collect ability choices made by the player.
 * @param {*} collectOnComponentActions contains all the collect on component choices made by the player.
 */
const collectEssences = (G, ctx, collectActions, collectOnComponentActions) => {
  const playerID = ctx.currentPlayer
  console.log('[collectEssences] Call to collectEssences()', collectActions, collectOnComponentActions)

  // Collect actions requiring player's decision
  collectActions &&
    Object.values(collectActions).forEach(action => {
      if (action.type === 'GAIN') {
        action.essences.forEach(essence => {
          console.log('add', essence.type, essence.quantity)
          G.publicData.players[playerID].essencesPool[essence.type] =
            G.publicData.players[playerID].essencesPool[essence.type] + essence.quantity
        })
      } else if (action.type === 'COST') {
        action.essences.forEach(essence => {
          console.log('remove', essence.type, essence.quantity)
          G.publicData.players[playerID].essencesPool[essence.type] =
            G.publicData.players[playerID].essencesPool[essence.type] - essence.quantity
        })
      } else if (action.type === 'TAP') {
        G.publicData.turnedComponents[action.id] = true
      }
    })
  // Collect of essences on components
  collectOnComponentActions &&
    Object.entries(collectOnComponentActions).forEach(action => {
      action[1].essences.forEach(essence => {
        console.log('add', essence.type, essence.quantity)
        G.publicData.players[playerID].essencesPool[essence.type] =
          G.publicData.players[playerID].essencesPool[essence.type] + essence.quantity
      })
      removeAllFromComponent(G, playerID, action[0])
    })
  // Collect actions by default
  G.publicData.players[playerID].collectActions &&
    Object.values(G.publicData.players[playerID].collectActions).forEach(action => {
      action.essences.forEach(essence => {
        console.log('add', essence.type, essence.quantity)
        G.publicData.players[playerID].essencesPool[essence.type] =
          G.publicData.players[playerID].essencesPool[essence.type] + essence.quantity
      })
    })
  // Specific collect action for automate
  let automate = G.publicData.players[playerID].inPlay.filter(component => {
    return component.id === 'automate'
  })
  if (automate && automate[0]) {
    console.log('automate in play')
    if (!Object.keys(collectOnComponentActions).includes('automate')) {
      if (G.publicData.players[playerID].essencesOnComponent['automate']) {
        G.publicData.players[playerID].essencesOnComponent['automate'].forEach(essence => {
          updateEssenceOnComponent(G, playerID, 'automate', essence.type, 2)
        })
      }
    }
  }

  G.publicData.players[playerID].status = 'READY'
  G.players[playerID].uiTemp.collectActions = collectActions
  G.players[playerID].uiTemp.collectOnComponentActions = collectOnComponentActions
  return G
}

/**
 * Role: TurnOrder.next
 * During collect phase, return the next player's id.
 */
const getNextPlayerCollectPhase = (G, ctx) => {
  let nextPlayerPos = (ctx.playOrderPos + 1) % ctx.playOrder.length
  console.log('[Call to getNextPlayerCollectPhase] next player pos :', nextPlayerPos)
  return nextPlayerPos
}

/**
 * Role: endIf
 * This function check if all players have collect their essences
 * and define the next phase.
 */
const checkAllCollectsReady = (G, ctx) => {
  console.log('[checkAllCollectsReady] Call to checkAllCollectsReady()')
  let playersReady = true
  for (let i = 0; i < ctx.numPlayers; i++) {
    console.log('G.publicData.players[i].status', i, G.publicData.players[i].status)
    playersReady =
      playersReady &&
      (G.publicData.players[i].status === 'READY' || G.publicData.players[i].status === 'NOTHING_TO_COLLECT')
  }
  if (playersReady) {
    console.log('[checkAllCollectsReady] All players are ready, return "actionPhase"')
    return { next: 'actionPhase' }
  }
  console.log('[checkAllCollectsReady] One player at least is not ready, return undefined')
}

/**
 * Role: turnOrder
 * Define the turn order for the collect phase.
 */
const getCollectPhaseTurnOrder = (G, ctx) => {
  let firstPlayer = G.publicData.firstPlayer
  let order = []

  for (let i = 0; i < ctx.numPlayers; i++) {
    let nextPlayerId = (parseInt(firstPlayer) + i) % ctx.numPlayers
    let playerCanCollect = false
    if (Object.keys(G.publicData.players[i].essencesOnComponent).length > 0) {
      playerCanCollect = true
    }

    G.publicData.players[nextPlayerId].inPlay.forEach(component => {
      if (component.hasStandardCollectAbility) {
        playerCanCollect = true
      }

      if (component.hasSpecificCollectAbility) {
        let essences
        switch (component.id) {
          case 'coffreFort':
            essences = G.publicData.players[nextPlayerId].essencesOnComponent[component.id]
            if (essences && essences.filter(essence => essence.type === 'gold').length > 0) {
              playerCanCollect = true
            }
            break
          case 'forgeMaudite':
          default:
            playerCanCollect = true
        }
      }
    })

    if (playerCanCollect) {
      order.push(nextPlayerId.toString())
    }
  }
  console.log('[getCollectPhaseTurnOrder] Collect phase order :', order)
  return order
}

// ########## ACTION PHASE ##########
const initActionPhase = (G, ctx, source) => {
  console.log('[initActionPhase] Call to initActionPhase() by', source)
  G.phase = 'PLAY_PHASE'
  return G
}

const initActionTurn = (G, ctx) => {
  console.log('[initActionTurn] Call to initActionTurn()')
  const playerID = ctx.currentPlayer
  G.publicData.players[playerID].status = 'TAKING_ACTION'
  return G
}

/**
 * Role: Move
 * Discard a card to gain essences.
 *
 * @param {*} cardId id of the discarded card.
 * @param {*} essenceList essences to add in player's pool.
 */
const discardArtefact = (G, ctx, cardId, essenceList) => {
  const playerID = ctx.currentPlayer
  console.log('[MOVE discardArtefact] The player', playerID, 'discard', cardId)
  const selectedCard = copy(
    G.players[playerID].hand.filter(card => {
      return card.id === cardId
    })[0]
  )
  G.publicData.players[playerID].discard.push(selectedCard)
  G.players[playerID].hand = copy(
    G.players[playerID].hand.filter(card => {
      return card.id !== cardId
    })
  )
  Object.entries(essenceList).forEach(essence => {
    console.log('add', essence[0], essence[1])
    G.publicData.players[playerID].essencesPool[essence[0]] =
      G.publicData.players[playerID].essencesPool[essence[0]] + essence[1]
  })
  G.publicData.players[playerID].deckSize = G.players[playerID].deck.length
  G.publicData.players[playerID].handSize = G.players[playerID].hand.length
  return G
}

/**
 * Role: Move
 * The first player to pass in a round take the first player token.
 * Then the player swap his magic item for a new one.
 * Finaly the player draw a card if possible.
 *
 * @param {*} magicItemId magic item id to swap for.
 */
const pass = (G, ctx, magicItemId) => {
  const playerID = ctx.currentPlayer
  console.log('[MOVE pass] The player', playerID, 'pass')

  G.passOrder.push(playerID)
  G.allPassed = G.passOrder.length >= ctx.numPlayers
  G.publicData.players[playerID].status = 'PASSED'

  getFirstPlayerToken(G, ctx)
  pickMagicItem(G, ctx, magicItemId)
  drawCard(G, ctx)

  return G
}

/**
 * If the player is the first player to pass then he gain the first player token.
 */
const getFirstPlayerToken = (G, ctx) => {
  const playerID = ctx.currentPlayer
  if (G.passOrder && G.passOrder[0] === playerID) {
    G.publicData.firstPlayer = playerID
  }
}

const drawCard = (G, ctx) => {
  const playerID = ctx.currentPlayer
  if (G.players[playerID].deck.length === 0 && G.publicData.players[playerID].discard.length > 0) {
    G.players[playerID].deck = ctx.random.Shuffle(G.publicData.players[playerID].discard)
    G.publicData.players[playerID].discard = []
  }
  if (G.players[playerID].deck.length > 0) {
    G.players[playerID].hand.push(G.players[playerID].deck[0])
    G.players[playerID].deck.splice(0, 1)
  }
  G.publicData.players[playerID].deckSize = G.players[playerID].deck.length
  G.publicData.players[playerID].handSize = G.players[playerID].hand.length
}

/**
 * Role: Move
 * Activate the power of a component.
 */
const activatePower = (G, ctx, component, actionId, selection, target) => {
  const playerID = ctx.currentPlayer
  const action = component.actionPowerList[actionId]
  console.log('[MOVE activatePower] The player', playerID, 'play action', actionId, 'of component', component.id)

  if (action.cost.turn) {
    G.publicData.turnedComponents[component.id] = true
  }
  if (action.cost.turnDragon) {
    G.publicData.turnedComponents[target.id] = true
  }
  if (action.cost.turnCreature) {
    G.publicData.turnedComponents[target.id] = true
  }

  if (action.cost.essenceList) {
    action.cost.essenceList
      .filter(essence => !essence.type.startsWith('any'))
      .forEach(essence => {
        if (action.cost.onComponent) {
          console.log('remove from', essence.type, essence.quantity)
          updateEssenceOnComponent(G, playerID, component.id, essence.type, essence.quantity, -1)
        } else {
          console.log('remove', essence.type, essence.quantity)
          G.publicData.players[playerID].essencesPool[essence.type] =
            G.publicData.players[playerID].essencesPool[essence.type] - essence.quantity
        }
      })
    selection &&
      selection.actionCost &&
      Object.entries(selection.actionCost).forEach(essence => {
        if (action.cost.onComponent) {
          console.log('remove from', component.id, essence[0], essence[1])
          updateEssenceOnComponent(G, playerID, component.id, essence[0], essence[1], -1)
        } else {
          console.log('remove', essence[0], essence[1])
          G.publicData.players[playerID].essencesPool[essence[0]] =
            G.publicData.players[playerID].essencesPool[essence[0]] - essence[1]
        }
      })
  }

  if (action.gain.essenceList) {
    action.gain.essenceList
      .filter(essence => !essence.type.startsWith('any'))
      .forEach(essence => {
        if (action.gain.onComponent) {
          console.log('add to', essence.type, essence.quantity)
          updateEssenceOnComponent(G, playerID, component.id, essence.type, essence.quantity)
        } else {
          console.log('add', essence.type, essence.quantity)
          G.publicData.players[playerID].essencesPool[essence.type] =
            G.publicData.players[playerID].essencesPool[essence.type] + essence.quantity
        }
      })
    selection &&
      selection.actionGain &&
      Object.entries(selection.actionGain).forEach(essence => {
        if (action.gain.onComponent) {
          console.log('add to', component.id, essence[0], essence[1])
          updateEssenceOnComponent(G, playerID, component.id, essence[0], essence[1])
        } else {
          console.log('add', essence[0], essence[1])
          G.publicData.players[playerID].essencesPool[essence[0]] =
            G.publicData.players[playerID].essencesPool[essence[0]] + essence[1]
        }
      })
  }

  // put essence from cost on component
  if (action.gain.putItOnComponent) {
    action.cost.essenceList
      .filter(essence => !essence.type.startsWith('any'))
      .forEach(essence => {
        console.log('add to', essence.type, essence.quantity)
        updateEssenceOnComponent(G, playerID, component.id, essence.type, essence.quantity)
      })
    selection &&
      selection.actionCost &&
      Object.entries(selection.actionCost).forEach(essence => {
        console.log('add to', component.id, essence[0], essence[1])
        updateEssenceOnComponent(G, playerID, component.id, essence[0], essence[1])
      })
  }

  if (action.gain.drawOne) {
    drawCard(G, ctx)
  }

  if (action.gain.rivalsGain) {
    action.gain.rivalsGainEssenceList
      .filter(essence => !essence.type.startsWith('any'))
      .forEach(essence => {
        Object.keys(G.publicData.players)
          .filter(id => id !== playerID)
          .forEach(id => {
            console.log('player', id, 'gain', essence.type, essence.quantity)
            G.publicData.players[id].essencesPool[essence.type] =
              G.publicData.players[id].essencesPool[essence.type] + essence.quantity
          })
      })
  }

  return G
}

/**
 * Role: Move
 * Place a component in play.
 */
const placeComponent = (G, ctx, type, id, essenceList) => {
  const playerID = ctx.currentPlayer
  console.log('[MOVE placeComponent] The player', playerID, 'place', id)
  let selectedComponent
  let newStatus

  if (type === 'artefact') {
    selectedComponent = copy(
      G.players[playerID].hand.filter(component => {
        return component.id === id
      })[0]
    )

    G.players[playerID].hand = copy(
      G.players[playerID].hand.filter(component => {
        return component.id !== id
      })
    )
    G.publicData.players[playerID].handSize = G.players[playerID].hand.length
  } else if (type === 'monument' || type === 'backMonument') {
    if (id === 'back_monument') {
      selectedComponent = copy(G.publicData.monumentsStack[0])
      // remove top monument card
      if (G.publicData.monumentsStack.length > 0) {
        G.publicData.monumentsStack.splice(0, 1)
      }
    } else {
      selectedComponent = copy(
        G.publicData.monumentsRevealed.filter(component => {
          return component.id === id
        })[0]
      )
      // remove the monument from the revealed monument
      G.publicData.monumentsRevealed = copy(
        G.publicData.monumentsRevealed.filter(component => {
          return component.id !== id
        })
      )

      // reveal the top monument card
      if (G.publicData.monumentsStack.length > 0) {
        G.publicData.monumentsRevealed.push(copy(G.publicData.monumentsStack[0]))
        G.publicData.monumentsStack.splice(0, 1)
      }
    }
  } else if (type === 'placeOfPower') {
    selectedComponent = copy(
      G.publicData.placesOfPowerInGame.filter(placeOfPower => {
        return placeOfPower.id === id
      })[0]
    )

    G.publicData.placesOfPowerInGame = copy(
      G.publicData.placesOfPowerInGame.filter(component => {
        return component.id !== id
      })
    )
  }

  G.publicData.players[playerID].inPlay.push(selectedComponent)

  Object.entries(essenceList).forEach(essence => {
    console.log('add', essence[0], essence[1])
    G.publicData.players[playerID].essencesPool[essence[0]] =
      G.publicData.players[playerID].essencesPool[essence[0]] - essence[1]
  })

  if (type === 'monument' || selectedComponent.hasPlacementPower) {
    newStatus = 'ACTION_PLACEMENT_POWER'
  } else {
    newStatus = 'ACTION_COMPLETED'
  }

  G.publicData.players[playerID].status = newStatus
  console.log('status : ', newStatus)
  return G
}

/**
 * Role: turnOrder
 * Define the turn order for the action phase.
 */
const getActionPhaseTurnOrder = (G, ctx) => {
  const order = getTurnOrder(G, ctx)
  console.log('[getActionPhaseTurnOrder] Action phase order :', order)
  return order
}

const getTurnOrder = (G, ctx) => {
  let firstPlayer = G.publicData.firstPlayer
  let order = []
  for (let i = 0; i < ctx.numPlayers; i++) {
    let nextPlayerId = (parseInt(firstPlayer) + i) % ctx.numPlayers
    order.push(nextPlayerId.toString())
  }
  return order
}

/**
 * Role: endTurnIf
 * Check if the player's move is completed.
 * Some moves require 2 steps (draw then discard/reorder, claim monument face down then draw essences, ...)
 */
const checkMoveCompleted = (G, ctx) => {
  const playerID = ctx.currentPlayer
  if (G.publicData.players[playerID].status === 'ACTION_COMPLETED') {
    console.log('[Call to checkMoveCompleted] return true')
    return true
  } else {
    console.log('[Call to checkMoveCompleted] no returned value')
  }
}

/**
 * Role: TurnOrder.next
 * During action phase, return the next player's id
 * or undefined if all players have passed.
 */
const getNextPlayerActionPhase = (G, ctx) => {
  console.log('[Call to getNextPlayerActionPhase]')
  let nextPlayerId = undefined
  for (let i = 1; i <= ctx.numPlayers; i++) {
    // compute the next position
    let nextPlayerPos = (ctx.playOrderPos + i) % ctx.numPlayers
    // get the corresponding player id in playOrder list
    let nextPlayerIdInPlayOrder = ctx.playOrder[parseInt(nextPlayerPos)]
    // check that this player is not in passOrder list
    if (!G.passOrder.includes(nextPlayerIdInPlayOrder)) {
      nextPlayerId = nextPlayerPos
      break
    }
  }
  return nextPlayerId
}

/**
 * Role: endIf
 * This function check if all players have passed
 * and define the next phase.
 */
const checkAllPlayersPassed = G => {
  if (G.allPassed) {
    console.log('[checkAllPlayersPassed] All players passed')
    return { next: 'checkVictoryPhase' }
  }
  console.log('[checkAllPlayersPassed] One player at least is still playing, return undefined')
}

function copy(value) {
  return JSON.parse(JSON.stringify(value))
}

// ########## VICTORY CHECK PHASE ##########
const initVictoryCheckPhase = (G, ctx) => {
  console.log('[initVictoryCheckPhase] Call to initVictoryCheckPhase()')
  if (G.phase !== 'VICTORY_CHECK_PHASE') {
    G.phase = 'VICTORY_CHECK_PHASE'
    G.passOrder = []
    let turnOrder = getCheckVictoryPhaseTurnOrder(G, ctx, 'by initVictoryCheckPhase')
    if (turnOrder.length === 0) {
      console.log('[initVictoryCheckPhase] No one have react power, compute victory points and endPhase.')
      G.allPassed = true
    }
  }
  return G
}

const activateVictoryCheckReactPower = (G, ctx, action) => {
  console.log('[MOVE activateVictoryCheckReactPower]', action)
  const playerID = ctx.currentPlayer

  G.passOrder.push(playerID)
  G.allPassed = G.passOrder.length >= ctx.numPlayers
  G.publicData.players[playerID].status = 'PASSED'
}

/**
 * Role: endIf
 * This function check if all players have done their check victory phase
 * and define the next phase.
 */
const checkAllPlayerReacted = G => {
  console.log('[endVictoryCheckPhase] Call to endVictoryCheckPhase()')
  if (G.allPassed) {
    console.log('[endVictoryCheckPhase] All players passed, end VictoryCheck Phase')
    return { next: 'collectPhase' }
  }
  return G
}

const getCheckVictoryPhaseTurnOrder = (G, ctx, source) => {
  console.log('[getCheckVictoryPhaseTurnOrder] Call to getCheckVictoryPhaseTurnOrder() by', source)
  let firstPlayer = G.publicData.firstPlayer
  let order = []
  for (let i = 0; i < ctx.numPlayers; i++) {
    let nextPlayerId = (parseInt(firstPlayer) + i) % ctx.numPlayers
    let componentWithReactPower = G.publicData.players[nextPlayerId].inPlay.filter(component => {
      if (component.hasReactPower) {
        // TODO
      }
      return false
    })
    if (componentWithReactPower.length > 0) {
      order.push(nextPlayerId.toString())
    }
  }
  return order
}

/**
 * Role : endGameIf
 * If at least one player has 10 victory points, the game ends.
 */
const endGameIf = (G, ctx) => {
  console.log('[endGameIf] Call to endGameIf()')
  let winner = undefined
  let scores = G.secret.victoryPoints

  for (let i = 0; i < ctx.numPlayers; i++) {
    if (Math.max(...scores) >= 10) {
      winner = []
      var max = Math.max(...scores)
      var idx = scores.indexOf(max)
      while (idx !== -1) {
        winner.push(idx)
        idx = scores.indexOf(max, idx + 1)
      }
      // TODO tie breaker rule
      console.log('[endGameIf] Winner is ', winner)
      return winner
    }
  }
}

const computeVictoryPoints = (G, ctx) => {
  let scores = []
  for (let i = 0; i < ctx.numPlayers; i++) {
    scores[i] = 0
    G.publicData.players[i].inPlay.forEach(component => {
      if (component.hasVictoryPoint) {
        scores[i] = scores[i] + component.victoryPoint
      }
      if (component.hasConditionalVictoryPoint) {
        scores[i] = scores[i] + getConditionalVictoryPoints(ctx, component)
      }
    })
  }
}

const getConditionalVictoryPoints = () => {
  return 0
}

/*
const checkWinner = (G, ctx) => {
  console.log('[checkWinner] No one reached 10 victory points, untap components and go to collectPhase')
  if (G.allPassed) {
    console.log('[checkAllPlayersPassed] All players passed')
    return {next: 'collectPhase' }
  }
  console.log('[checkAllPlayersPassed] One player at least is still playing, return "actionPhase"')
}
*/

// ########## game options setup (KO) ##########
const setupGameComponents = (G, ctx) => {
  console.log('[setupGameComponents] Call to setupGameComponents')
  if (G && G.skipDraftPhase) {
    console.log('[setupGameComponents] skipDraftPhase')
    for (let i = 0; i < ctx.numPlayers; i++) {
      console.log('[setupGameComponents] creating player s setup')
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
const getStartingPhase = G => {
  console.log('[getStartingPhase] Call to getStartingPhase, G.startingPhase', G.startingPhase)
  return G.startingPhase
}
const getFirstPlayer = (G, ctx, source) => {
  console.log('[getFirstPlayer - ', source, ']')
  return 0
}

// ########## GAME ##########
export const ResArcanaGame = {
  name: 'res-arcana',

  setup: (G, ctx) => getInitialState(G, ctx),

  moves: {
    activatePower: activatePower,
    activateVictoryCheckReactPower: activateVictoryCheckReactPower,
    collectEssences: collectEssences,
    discardArtefact: discardArtefact,
    pass: pass,
    pickArtefact: pickArtefact,
    pickMage: pickMage,
    pickMagicItem: pickMagicItem,
    placeComponent: placeComponent,
  },

  endIf: (G, ctx) => endGameIf(G, ctx),

  phases: {
    setupPhase: {
      onBegin: (G, ctx) => setupGameComponents(G, ctx),
      endIf: (G, ctx) => getStartingPhase(G, ctx),
    },
    draftPhase: {
      start: true,
      moves: { pickArtefact, pickMage },
      onBegin: (G, ctx) => initDraftPhase(G, ctx),
      endIf: (G, ctx) => checkAllCardsDrafted(G, ctx),
      turn: {
        activePlayers: { all: Stage.NULL },
        order: TurnOrder.ANY,
      },
    },
    pickMagicItemPhase: {
      onBegin: (G, ctx) => initPickMagicItemPhase(G, ctx),
      moves: { pickMagicItem },
      turn: {
        order: {
          first: (G, ctx) => getFirstPlayer(G, ctx, 'pickMagicItemPhase'),
          next: (G, ctx) => getNextPlayerPickMagicItemPhase(G, ctx),
          playOrder: (G, ctx) => getPickMagicItemPhaseTurnOrder(G, ctx),
        },
      },
      endIf: (G, ctx) => checkAllMagicItemsReady(G, ctx),
    },
    collectPhase: {
      onBegin: (G, ctx) => initCollectPhase(G, ctx),
      moves: { collectEssences },
      turn: {
        order: {
          first: (G, ctx) => getFirstPlayer(G, ctx, 'collectPhase'),
          next: (G, ctx) => getNextPlayerCollectPhase(G, ctx),
          playOrder: (G, ctx) => getCollectPhaseTurnOrder(G, ctx),
        },
      },
      endIf: (G, ctx) => checkAllCollectsReady(G, ctx),
    },
    actionPhase: {
      onBegin: (G, ctx) => initActionPhase(G, ctx, 'flow.phases.actionPhase.onBegin'),
      moves: { placeComponent, discardArtefact, activatePower, pass },
      turn: {
        order: {
          onBegin: (G, ctx) => initActionTurn(G, ctx),
          first: (G, ctx) => getFirstPlayer(G, ctx, 'actionPhase'),
          next: (G, ctx) => getNextPlayerActionPhase(G, ctx),
          playOrder: (G, ctx) => getActionPhaseTurnOrder(G, ctx),
          endIf: (G, ctx) => checkMoveCompleted(G, ctx),
        },
      },
      endIf: (G, ctx) => checkAllPlayersPassed(G, ctx),
    },
    checkVictoryPhase: {
      onBegin: (G, ctx) => initVictoryCheckPhase(G, ctx),
      moves: { activateVictoryCheckReactPower },
      turn: {
        order: {
          playOrder: (G, ctx) => getCheckVictoryPhaseTurnOrder(G, ctx, 'flow.phases.checkVictoryPhase.turnOrder'),
          first: () => 0,
          next: (G, ctx) => {
            if (ctx.playOrderPos < ctx.playOrder.length - 1) {
              return (ctx.playOrderPos + 1) % ctx.playOrder.length
            }
          },
        },
      },
      endIf: (G, ctx) => checkAllPlayerReacted(G, ctx),
    },
  },

  enhancer: applyMiddleware(logger),
  playerView: PlayerView.STRIP_SECRETS,
}
