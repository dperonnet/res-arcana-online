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
  G.draftWay = G.draftWay && G.draftWay === 'toLeftPlayer' ? 'toRightPlayer' : 'toLeftPlayer'
    G = dealDraftCards(G, ctx);
  return G
}
const dealDraftCards = (G, ctx) => {
  for (let i= 0; i < ctx.numPlayers; i++) {
    G.players[i].draftCards = G.secret.artefactsInGameStack.slice(0, 4) // deal 4 cards to player
    G.secret.artefactsInGameStack.splice(0, 4) // remove 4 cards from pile
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

// MOVES
const draftCards = (G, ctx, playerID, cardId) => {
  if (!G.players[playerID].deck) {
    G.players[playerID].deck = []
  }
  const selectedCard = copy(G.players[playerID].draftCards.filter((card) => {
    return card === cardId
  }))
  G.players[playerID].deck.push(selectedCard);
  delete G.players[playerID].draftCards[selectedCard.id]
  const otherCard = G.players[playerID].draftCards;
  const nextPlayer = (G.draftWay === 'toLeftPlayer' ? 1 : -1)
  return G
}

const pickArtefact = (G, ctx, artefactName) => {
  let artefactIndex = G.artefacts.findIndex(
    artefact => artefact.name === artefactName
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
    players: {
      '0': {
        draftCards: []
      }
    }
  };
  for(let i=0; i<ctx.numPlayers; i++) G.players[i.toString()]= {}

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
      pickArtefact: {
        allowedMoves: ['pickArtefact'],
        endPhaseIf: G => G.passed,
        next: 'pickArtefact',
      }
    },

    endGameIf: (G, ctx) => {
      if (G.artefacts.length === 0) {
        // sum players scores
        let scores = Object.entries(G.artefactsInPlay).map(player => {
            let values = player[1].map(component => {
              return component.value;
            });
            const reducer = (res, value) => res + value;
            const playerId = player[0];
            const result = {
              playerId: null,
              score: 0
            };
            result.playerId = playerId
            result.score = values.reduce(reducer);
            return result;
        });
        // retrieve scores value and get scoreMax
        let scoreValues = scores.map(score => score.score);
        let scoreMax = Math.max(...scoreValues);
        // then get the players having scoreMax as winners
        let winners = scores.filter(player => {
          return player.score === scoreMax;
        });
        return { winner: winners };
      }
    },
  },
  enhancer: applyMiddleware(logger),
});

function copy(value){
  return JSON.parse(JSON.stringify(value));
}
