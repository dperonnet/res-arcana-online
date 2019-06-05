import { Game, TurnOrder   } from 'boardgame.io/core';
import { GameComponents } from '../../../../database'
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';

const initGameComponents = (componentsList) => {
  const components = copy(componentsList);
  const components2 = getComponentsByType(components);
  const magicItems = Array(8).fill(null);
  const monuments = Array(8).fill(null);
  const placesOfPower = Array(5).fill(null);
  const commonBoard = {
    monuments,
    placesOfPower,
    magicItems
  };
  const playerBoards = Array(4).fill(null);
  const gameComponents = {
    commonBoard,
    playerBoards
  };
  return gameComponents;
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
// PHASES:

// DRAFT PHASE
const initDraftPhase = (G, ctx) => {
  G.phase = 'DRAFT_PHASE'
  if (G.players['0'].incomingDraftCards.length === 0) {
    console.log('initDraftPhase with incomingDraftCards === 0')
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
  }
  return G
}
const getNextCards = (G, ctx) => {
  for (let i= 0; i < ctx.numPlayers; i++) {
    G.players[i].draftCards = copy(G.players[i].incomingDraftCards)
    G.players[i].incomingDraftCards = []
  }
  return G
}
const allCardsDealt = (G, ctx) => {
  let assert = true;
  for (let i= 0; i < ctx.numPlayers; i++) {
    assert &= G.players[i].draftCards.length === 0
  }
  return assert
}
const initPlayPhase = (G, ctx) => {
  G.phase = 'PLAY_PHASE'
  return G
}

// MOVES
const draftCards = (G, ctx, playerID, cardId) => {
  console.log('draftCards',G, ctx, playerID, cardId)
  const selectedCard = copy(G.players[playerID].draftCards.filter((card) => {
    return card.id === cardId
  })[0])
  G.players[playerID.toString()].deck.push(selectedCard);
  const deniedCards = copy(G.players[playerID].draftCards.filter((card) => {
    return card.id !== cardId
  }));
  const nextPlayerID = ((G.draftWay === 'toLeftPlayer' ? 1 : -1) + parseInt(playerID)) % ctx.numPlayers
  console.log('nextPlayerID',nextPlayerID)
  G.players[nextPlayerID.toString()].incomingDraftCards = deniedCards
  G.players[playerID].draftCards = []
  return G
}

const pickArtefact = (G, ctx, artefactId) => {
  let artefactIndex = G.artefacts.findIndex(
    artefact => artefact.id === artefactId
  );
  let artefact = copy(G.artefacts[artefactIndex]);
  G.artefacts.splice(artefactIndex, 1);
  if (!G.artefactsInPlay) G.artefactsInPlay= {};
  G.artefactsInPlay[ctx.currentPlayer].push(artefact);
}

// SETUP
const getInitialState = (ctx)  => {
  const G = {
    secret: {
      artefactsInGameStack: []
    },
    players: {}
  };
  for (let i=0; i<ctx.numPlayers; i++) {
    G.players[i.toString()]= {
      deck: [],
      draftCards: [],
      incomingDraftCards: []
    }
  }

  const components = getComponentsByType(GameComponents);

  // Randomly get artefacts from components.
  const nbArtefacts = ctx.numPlayers * 8;
  const artefactsInGameStack = ctx.random.Shuffle(components.artefact);
  G.secret.artefactsInGameStack = artefactsInGameStack.slice(0, nbArtefacts);

  /*const artefactInPlay = {};
  for (var i=0; i < ctx.numPlayers; i++) {
    artefactInPlay[i]= [];
  }

  G.artefactsInPlay = artefactInPlay;*/
  
  console.log('G',G)

  return G;
}

// GAME
export const ResArcanaGame = Game({
  name: "res-arcana",

  setup: getInitialState,

  moves: {
    draftCards: draftCards,
    pickArtefact: pickArtefact,
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
        onPhaseBegin: initDraftPhase,
        allowedMoves: ['draftCards'],
        turnOrder: TurnOrder.ANY_ONCE,
        endPhaseIf: allCardsDealt,
        next: 'secondDraftPhase'
      },
      secondDraftPhase: {
        onPhaseBegin: initDraftPhase,
        allowedMoves: ['draftCards'],
        turnOrder: TurnOrder.ANY_ONCE,
        endPhaseIf: allCardsDealt,
        next: 'pickArtefact'
      },
      playPhase: {
        onPhaseBegin: initPlayPhase,
        allowedMoves: ['pickArtefact'],
        endPhaseIf: G => G.passed,
        next: 'pickArtefact',
      }
    },
  },
  enhancer: applyMiddleware(logger),
});

function copy(value){
  return JSON.parse(JSON.stringify(value));
}
