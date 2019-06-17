import { Game, PlayerView, TurnOrder   } from 'boardgame.io/core';
import { GameComponents } from '../../../../database'
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';

// SETUP
const getInitialState = (ctx) => {
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
      waitingFor: []
    },
    metadata: {
      players: []
    }
  };
  for (let i=0; i<ctx.numPlayers; i++) {
    G.players[i]= {
      deck: [],
      draftCards: [],
      deniedCards: [],
    }
    G.publicData.players[i] = {
      deckSize: 0,
      essencePool: {
        elan: 1, life: 1, calm: 1, death: 1, gold: 1
      }
    }
    G.metadata.players.push(i.toString())
  }

  const components = getComponentsByType(GameComponents);

  // Randomly get artefacts from components.
  const nbArtefacts = ctx.numPlayers * 8;
  const artefactsInGameStack = ctx.random.Shuffle(components.artefact);
  G.secret.artefactsInGameStack = artefactsInGameStack.slice(0, nbArtefacts);

  // Get places of power excluding those on back side
  let placesOfPower = ctx.random.Shuffle(components.placeOfPower);
  let placesOfPowerExcluded = [];
  placesOfPower.forEach((pop)=> {
    if (!placesOfPowerExcluded.includes(pop.id)) {
      G.publicData.placesOfPowerInGame.push(pop);
      placesOfPowerExcluded.push(pop.excludedComponentId)
    }
  })
  G.publicData.magicItems = components.magicItem;
  
  // Reveal 2 monuments
  let monumentsInGameStack = ctx.random.Shuffle(components.monument);
  G.publicData.monumentsRevealed = monumentsInGameStack.slice(0, 2)
  G.publicData.monumentsStack = monumentsInGameStack.splice(0, 2);
  
  // Deal 2 mages to players
  let mages = ctx.random.Shuffle(components.mage);
  for (let i=0; i<ctx.numPlayers; i++) {
    G.players[i].mages = mages.slice(0, 2)
    mages.splice(0, 2);
  }

  // Define the first player
  G.publicData.firstPlayer = (ctx.random.Die(ctx.numPlayers) -1).toString();

  return G;
}

const getComponentsByType = (components) => {
  const res = {}
  if (components) {
    Object.values(components).forEach((component) => {
      if(!res[component.type]) res[component.type] = [];
      res[component.type].push(component)
    });
  }
  return res;
}

// DRAFT PHASE
const initDraftPhase = (G, ctx) => {
  console.log('initDraftPhase')
  G.phase = 'DRAFT_PHASE'
  let dealNewCards = true;
  for (let i= 0; i < ctx.numPlayers; i++) {
    console.log('dealNewCards', G.players[i].deniedCards.length, G.players[i].draftCards.length)
    dealNewCards = dealNewCards && G.players[i].deniedCards.length === 0 && G.players[i].draftCards.length === 0 ;
  }
  if (dealNewCards) {
    G.draftWay = G.draftWay && G.draftWay === 'toLeftPlayer' ? 'toRightPlayer' : 'toLeftPlayer'
    dealDraftCards(G, ctx);
  } else {
    getNextCards(G, ctx);
  }
  return G
}
const dealDraftCards = (G, ctx) => {
  console.log('dealDraftCards')
  for (let i= 0; i < ctx.numPlayers; i++) {
    G.players[i].draftCards.push(G.secret.artefactsInGameStack.slice(0, 4)) // deal 4 cards to player
    G.secret.artefactsInGameStack.splice(0, 4) // remove 4 cards from pile
    G.publicData.waitingFor.push(i);
  }
  return G
}
const getNextCards = (G, ctx) => {
    console.log('getNextCards')
  for (let i= 0; i < ctx.numPlayers; i++) {
    if(G.players[i].deniedCards.length > 0) {
      const nextPlayerID = ((G.draftWay === 'toLeftPlayer' ? 1 : ctx.numPlayers - 1) + parseInt(i)) % ctx.numPlayers
      G.players[nextPlayerID].draftCards.push(copy(G.players[i].deniedCards))
      G.players[i].deniedCards = []
    }
  }
  for (let i= 0; i < ctx.numPlayers; i++) {
    if (G.players[i].draftCards.length > 0 && G.publicData.waitingFor.indexOf(parseInt(i)) < 0) {
      G.publicData.waitingFor.push(i);
    }
  }
  return G
}
const pickArtefact = (G, ctx, playerID, cardId) => {
  console.log('Player pick artefact',playerID, cardId)
  const selectedCard = copy(G.players[playerID].draftCards[0].filter((card) => {
    return card.id === cardId
  })[0])
  G.players[playerID].deck.push(selectedCard);
  const deniedCards = copy(G.players[playerID].draftCards[0].filter((card) => {
    return card.id !== cardId
  }));
  console.log('deniedCards.length',deniedCards.length)
  G.players[playerID].deniedCards = deniedCards
  G.players[playerID].draftCards.splice(0,1);
  G.publicData.players[playerID].deckSize += 1
  if (G.players[playerID].draftCards.length === 0) {
    G.publicData.waitingFor.splice(G.publicData.waitingFor.indexOf(parseInt(playerID)), 1);
  }
  return G
}
const allCardsDrafted = (G, ctx) => {
  let decksReady = true;
  let needDealCards = true;
  let hasCardsToPass = false;
  for (let i= 0; i < ctx.numPlayers; i++) {
    hasCardsToPass = hasCardsToPass || G.players[i].deniedCards.length > 0
    decksReady = decksReady && G.players[i].deck.length === 8
    needDealCards = needDealCards && G.players[i].deck.length === 4
  }
  if (decksReady) return { next: 'playPhase' }
  if (hasCardsToPass) return { next: 'draftPhase' }
  if (needDealCards) return { next: 'draftPhase' }
}
const endDraftPhase = (G, ctx) => {
  for (let i= 0; i < ctx.numPlayers; i++) {
    if( G.players[i].deck.length === 8) {
      G.players[i].reminder = copy(G.players[i].deck)
      G.players[i].deck = ctx.random.Shuffle(G.players[i].deck)
      G.players[i].hand = G.players[i].deck.slice(0, 3)
      G.players[i].deck.splice(0, 3);
    }
  }
  return G
}

// PICK MAGE PHASE
const initPickMagePhase = (G, ctx) => {
  G.phase = 'PICK_MAGE_PHASE'
  return G
}
const pickMage = (G, ctx, playerID, mageId) => {
  const selectedCard = copy(G.players[playerID].mages.filter((mage) => {
    return mage.id === mageId
  })[0])
  G.publicData.players[playerID].mage = selectedCard;
  G.publicData.waitingFor.splice(G.publicData.waitingFor.indexOf(parseInt(playerID)), 1);
  return G
}
const allMagesReady = (G, ctx) => {
  let magesReady = true;  
  for (let i= 0; i < ctx.numPlayers; i++) {
    magesReady = magesReady && G.players[i].mage
  }
  if (magesReady) return {next: 'pickMagicItemPhase' }
}
const endPickMagePhase = (G, ctx) => {
  // TODO, reveal mages
  return G
}

// PICK MAGIC ITEM PHASE
const initPickMagicItemPhase = (G, ctx) => {
  G.phase = 'PICK_MAGIC_ITEM_PHASE'
  return G
}
const pickMagicItem = (G, ctx, playerID, magicItemId) => {
  let selectedItemIndex = 0;
  const selectedItem = copy(G.publicData.magicItem.filter((magicItem, index) => {
    const isSelectedItem = magicItem.id === magicItemId;
    if (isSelectedItem) {
      selectedItemIndex = index
    }
    return isSelectedItem
  })[0])
  G.publicData.players[playerID].magicItem = selectedItem;
  G.publicData.magicItem.splice(selectedItemIndex, 1);
  return G
}
const allMagicItemsReady = (G, ctx) => {
  let magicItemsReady = true;  
  for (let i= 0; i < ctx.numPlayers; i++) {
    magicItemsReady = magicItemsReady && G.players[i].magicItem
  }
  if (magicItemsReady) return {next: 'playPhase' }
}

// PLAY PHASE
const initPlayPhase = (G, ctx) => {
  G.phase = 'PLAY_PHASE'
  return G
}
const playArtefact = (G, ctx, artefactId) => {
  let artefactIndex = G.artefacts.findIndex(
    artefact => artefact.id === artefactId
  );
  let artefact = copy(G.artefacts[artefactIndex]);
  G.artefacts.splice(artefactIndex, 1);
  if (!G.artefactsInPlay) G.artefactsInPlay= {};
  G.artefactsInPlay[ctx.currentPlayer].push(artefact);
}

const getTurnOrder = (G, ctx) => {
  let firstPlayer = G.publicData.firstPlayer;
  let order = [];
  for (let i = 0; i < ctx.numPlayers; i++ ) {
    let nextPlayerId = (parseInt(firstPlayer) + i) % ctx.numPlayers;
    order.push((nextPlayerId).toString())
  }
  console.log('order',order);
  return order
}

const getPlayers = (G, ctx) => {
  console.log('players : ',G.metadata.players)
  return G.metadata.players
}

function copy(value){
  return JSON.parse(JSON.stringify(value));
}

// GAME
export const ResArcanaGame = Game({
  name: 'res-arcana',

  setup: getInitialState,

  moves: {
    pickArtefact: pickArtefact,
    playArtefact: playArtefact,
    pickMage: pickMage,
    pickMagicItem: pickMagicItem,
    pass: G => {
      G.passed = true;
    },
  },

  flow: {
    onMove: (G, ctx) => G,
    movesPerTurn: 1,
    startingPhase: 'draftPhase',

    phases: {
      draftPhase: {
        onPhaseBegin: (G, ctx) => initDraftPhase(G, ctx),
        allowedMoves: ['pickArtefact'],
        turnOrder: TurnOrder.ANY,
        endPhaseIf: allCardsDrafted,
        onPhaseEnd: (G, ctx) => endDraftPhase(G, ctx),
      },
      pickMagePhase: {
        onPhaseBegin: (G, ctx) => initPickMagePhase(G, ctx),
        allowedMoves: ['pickMage'],
        turnOrder: TurnOrder.ANY_ONCE,
        endPhaseIf: allMagesReady,
        onPhaseEnd: (G, ctx) => endPickMagePhase(G, ctx),
      },
      pickMagicItemPhase: {
        onPhaseBegin: (G, ctx) => initPickMagicItemPhase(G, ctx),
        allowedMoves: ['pickMagicItem'],
        turnOrder: {
          playOrder: (G, ctx) => getTurnOrder(G, ctx),
          first: (G, ctx) => G.publicData.firstPlayer,
          next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
        endPhaseIf: allMagicItemsReady
      },
      playPhase: {
        onPhaseBegin: initPlayPhase,
        allowedMoves: ['playArtefact'],
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
});
