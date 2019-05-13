import { Game  } from 'boardgame.io/core';

export const ResArcana = Game({
  name: "res-arcana",

  setup: (G, ctx) => {
    const artefactInPlay = {};
    for (var i=0;i<G.numPlayers;i++) artefactInPlay[i]= [];
    return (
      {
        artefacts:[
          {name:"A", value:1},
          {name:"B", value:0},
          {name:"C", value:2},
          {name:"D", value:3},
          {name:"E", value:0},
          {name:"F", value:1},
          {name:"G", value:1},
          {name:"H", value:1}
        ],
        artefactsInPlay: artefactInPlay,
        passed:false,
      })
    },

    moves: {
      pickArtefact: (G, ctx, artefactName) => {
        let artefactIndex = G.artefacts.findIndex(
          artefact => artefact.name === artefactName
        );
        let artefact = copy(G.artefacts[artefactIndex]);
        G.artefacts.splice(artefactIndex, 1);
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
    },
});

/*function initGameComponents(playerNumber) {
  //const magicItems = Array(8).fill(null);
  const magicItems = ["A","B","C","D","E","F","G","H"];
  const monuments = Array(8).fill(null);
  const placesOfPower = Array(5).fill(null);
  const commonBoard = {
    monuments,
    placesOfPower,
    magicItems
  };
  const playerBoards = Array(playerNumber).fill(null);
  const gameComponents = {
    commonBoard,
    playerBoards
  };
  return gameComponents;
}*/

function copy(value){
  return JSON.parse(JSON.stringify(value));
}
