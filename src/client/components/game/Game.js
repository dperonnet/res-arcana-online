import { Game, TurnOrder  } from 'boardgame.io/core';

export const ResArcana = Game({
  name: "res-arcana",

  ctx: {
    currentPlayer: '2',
    actionPlayers: ['0'],
    playOrder: ['2', '1', '0'],
    playOrderPos: 0
  },

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
      ]
    }),

    moves: {
      pickArtefact: (G, artefactName) => {
        console.log(artefactName);
        let artefactIndex = G.artefacts.findIndex(
          artefact => artefact.name === artefactName
        );
        let artefact = copy(G.artefacts[artefactIndex]);
        G.artefacts.splice(artefactIndex, 1);
        G.artefactInPLay.push(artefact);
        return { ...G};
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
          allowedMoves: ['pickItem'],
          endPhaseIf: G => G.passed,
          next: 'pickArtefact',
        }
      },
    },
});

function initGameComponents() {
  const magicItems = ["A","B","C","D","E","F","G","H"];
  const gameComponents = {
    magicItems
  };
  return gameComponents;
}

function copy(value){
  return JSON.parse(JSON.stringify(value));
}
