import { Game  } from 'boardgame.io/core';
import { GameComponents } from '../../../../database'

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

export function getInitialState(ctx) {
  const G = {};
  const components = getComponentsByType(GameComponents);
  const nbArtefacts = ctx.numPlayers * 8;
  const artefacts = ctx.random.Shuffle(components.artefact);
  G.artefacts = artefacts.slice(0, nbArtefacts);

  const artefactInPlay = {};
  for (var i=0; i < ctx.numPlayers; i++) {
    artefactInPlay[i]= [];
  }
  G.artefactsInPlay = artefactInPlay;
  G.passed = false;
  console.log('G',G)

  return G;
}

export const ResArcanaGame = Game({
  name: "res-arcana",

  setup: getInitialState,

    moves: {
      pickArtefact: (G, ctx, artefactName) => {
        console.log('context',G,ctx,artefactName)
        let artefactIndex = G.artefacts.findIndex(
          artefact => artefact.name === artefactName
        );
        let artefact = copy(G.artefacts[artefactIndex]);
        G.artefacts.splice(artefactIndex, 1);
        if (!G.artefactInPlay) G.artefactInPlay= {};
        console.log('G.artefactsInPlay', G.artefactsInPlay[ctx.currentPlayer])
        G.artefactsInPlay[ctx.currentPlayer].push(artefact);
      },
      pass: G => {
        G.passed = true;
      },
    },

    flow: {
      movesPerTurn: 1,
      startingPhase: 'pickArtefact',

      phases: {
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
    }
});

function copy(value){
  return JSON.parse(JSON.stringify(value));
}
