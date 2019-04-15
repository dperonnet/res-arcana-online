import { Game, TurnOrder  } from 'boardgame.io/core';

export const ResArcana = Game({
  name: "res-arcana",

  setup: (G, ctx) => ({
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
      artefactInPLay:[],
      passed:false,
    }),

    moves: {
      pickArtefact: (G, ctx, artefactName) => {
        let artefactIndex = G.artefacts.findIndex(
          artefact => artefact.name === artefactName
        );
        let artefact = copy(G.artefacts[artefactIndex]);
        G.artefacts.splice(artefactIndex, 1);
        G.artefactInPLay.push(artefact);
      },
      pass: G => {
        G.passed = true;
      },
    },

    flow: {
      startingPhase: 'pickArtefact',
      turnOrder: TurnOrder.DEFAULT,

      phases: {
        pickArtefact: {
          allowedMoves: ['pickArtefact'],
          endPhaseIf: G => G.passed,
          next: 'pickArtefact',
        }
      },
    },
});

function initGameComponents(playerNumber) {
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
}

function copy(value){
  console.log(value);
  return JSON.parse(JSON.stringify(value));
}
