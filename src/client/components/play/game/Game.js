import { Game, PlayerView, TurnOrder   } from 'boardgame.io/core';
import { GameComponents } from '../../../../database'
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';

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
// PHASES:

// DRAFT PHASE
const initDraftPhase = (G, ctx, source) => {
  console.log('source',source)
  G.phase = 'DRAFT_PHASE'
  if (G.players['0'].deniedCards.length === 0) {
    console.log('initDraftPhase with deniedCards === 0')
    G.draftWay = G.draftWay && G.draftWay === 'toLeftPlayer' ? 'toRightPlayer' : 'toLeftPlayer'
    dealDraftCards(G, ctx);
  } else {
    console.log('initDraftPhase else')
    getNextCards(G, ctx);
  }
  return G
}
const dealDraftCards = (G, ctx) => {
  for (let i= 0; i < ctx.numPlayers; i++) {
    G.players[i].draftCards = G.secret.artefactsInGameStack.slice(0, 4) // deal 4 cards to player
    G.secret.artefactsInGameStack.splice(0, 4) // remove 4 cards from pile
    G.publicData.waitingFor.push(i);
  }
  return G
}
const getNextCards = (G, ctx) => {
  for (let i= 0; i < ctx.numPlayers; i++) {
    const nextPlayerID = ((G.draftWay === 'toLeftPlayer' ? 1 : ctx.numPlayers - 1) + parseInt(i)) % ctx.numPlayers
    G.players[nextPlayerID].draftCards = copy(G.players[i].deniedCards)
    G.players[i].deniedCards = []
    G.publicData.waitingFor.push(i);
  }
  return G
}
const allCardsDealt = (G, ctx) => {
  let decksReady = true;
  let assert = true;
  for (let i= 0; i < ctx.numPlayers; i++) {
    assert = assert && G.players[i].draftCards.length === 0
    decksReady = decksReady && G.players[i].deck.length === 8
  }
  if (decksReady) return { next: 'playPhase' }
  if (assert) return { next: 'draftPhase' }
}
const initPlayPhase = (G, ctx) => {
  G.phase = 'PLAY_PHASE'
  return G
}

// MOVES
const pickArtefact = (G, ctx, playerID, cardId) => {
  const selectedCard = copy(G.players[playerID].draftCards.filter((card) => {
    return card.id === cardId
  })[0])
  G.players[playerID].deck.push(selectedCard);
  const deniedCards = copy(G.players[playerID].draftCards.filter((card) => {
    return card.id !== cardId
  }));
  G.players[playerID].deniedCards = deniedCards
  G.players[playerID].draftCards = []
  G.publicData.players[playerID].deckSize += 1
  G.publicData.waitingFor.splice(G.publicData.waitingFor.indexOf(parseInt(playerID)), 1);
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

const pickMagicItem = (G, ctx, magicItemId) => {
  
}

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

// GAME
export const ResArcanaGame = Game({
  name: 'res-arcana',

  setup: getInitialState,

  moves: {
    pickArtefact: pickArtefact,
    playArtefact: playArtefact,
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
        onPhaseBegin: (G, ctx) => initDraftPhase(G, ctx,'1st'),
        allowedMoves: ['pickArtefact'],
        turnOrder: TurnOrder.ANY_ONCE,
        endPhaseIf: allCardsDealt
      },
      pickMagicItem: {
        allowedMoves: ['pickMagicItem'],
        turnOrder: {
          playOrder: (G, ctx) => getTurnOrder(G, ctx),
          first: (G, ctx) => G.publicData.firstPlayer,
          next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        },
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

function copy(value){
  return JSON.parse(JSON.stringify(value));
}
