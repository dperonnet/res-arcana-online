export const GameComponents = [
  {
    id: 'alchimie',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 4,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'gold',
            },
          ],
        },
      },
    ],
    class: 'alchimie',
    hasActionPower: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    name: 'Alchimie',
    type: 'magicItem',
  },
  {
    id: 'alchimiste',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 4,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'gold',
            },
          ],
        },
      },
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'any-but-gold',
            },
          ],
        },
      },
    ],
    class: 'alchimiste',
    hasActionPower: true,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    isAlternative: false,
    name: 'Alchimiste',
    type: 'mage',
  },
  {
    id: 'anneauDeMidas',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'life',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'anneau_de_midas',
    costEssenceList: [
      {
        quantity: 1,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: false,
    name: 'Anneau de Midas',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'arbreDeVie',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'life',
            },
          ],
          rivalsGain: true,
          rivalsGainEssenceList: [
            {
              quantity: 1,
              type: 'life',
            },
          ],
        },
      },
    ],
    class: 'arbre_de_vie',
    costEssenceList: [
      {
        quantity: 2,
        type: 'any',
      },
      {
        quantity: 1,
        type: 'life',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Arbre de vie',
    reactPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'life',
            },
          ],
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    type: 'artefact',
  },
  {
    id: 'arcElfique',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          rivalsLoseLife: 1,
        },
      },
      {
        cost: {
          turn: true,
        },
        gain: {
          drawOne: true,
        },
      },
    ],
    class: 'arc_elfique',
    costEssenceList: [
      {
        quantity: 2,
        type: 'elan',
      },
      {
        quantity: 1,
        type: 'life',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Arc Elfique',
    type: 'artefact',
  },
  {
    id: 'artificier',
    class: 'artificier',
    discountAbilityList: [
      {
        discountList: [
          {
            quantity: 1,
            type: 'any-but-gold',
          },
        ],
        type: ['artefact'],
      },
    ],
    hasActionPower: false,
    hasAlternative: true,
    hasDiscountAbility: true,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    isAlternative: false,
    name: 'Artificier',
    type: 'mage',
  },
  {
    id: 'athanor',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'elan',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'elan',
            },
          ],
          onComponent: true,
        },
      },
      {
        cost: {
          essenceList: [
            {
              quantity: 6,
              type: 'elan',
            },
          ],
          onComponent: true,
          sameType: true,
          turn: true,
        },
        gain: {
          powerCostAsGold: true,
        },
      },
    ],
    class: 'athanor',
    costEssenceList: [
      {
        quantity: 1,
        type: 'gold',
      },
      {
        quantity: 1,
        type: 'elan',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Athanor',
    type: 'artefact',
  },
  {
    id: 'autelCorrompu',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'life',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'elan',
            },
          ],
          onComponent: true,
        },
      },
      {
        cost: {
          destroyOneArtefact: true,
          turn: true,
        },
        gain: {
          modifierList: [
            {
              quantity: 2,
              type: 'any-but-gold',
            },
          ],
          placementCostAsAnyButGold: true,
        },
      },
    ],
    class: 'autel_corrompu',
    costEssenceList: [
      {
        quantity: 3,
        type: 'any',
      },
      {
        quantity: 2,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Autel Corrompu',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'life',
        },
        {
          quantity: 1,
          type: 'death',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'automate',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'any',
            },
          ],
          multipleCostOptions: true,
          turn: true,
        },
        gain: {
          putItOnComponent: true,
        },
      },
    ],
    class: 'automate',
    costEssenceList: [
      {
        quantity: 1,
        type: 'elan',
      },
      {
        quantity: 1,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'calm',
      },
      {
        quantity: 1,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Automate',
    specificCollectAbility: {
      essenceList: [],
      multipleCollectOptions: false,
    },
    type: 'artefact',
  },
  {
    id: 'bestiaireDuSorcier',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          checkVictoryNow: true,
        },
      },
      {
        cost: {
          essenceList: [
            {
              quantity: 4,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          placeDragonFromAnyDiscardPile: true,
        },
      },
    ],
    class: 'bestiaire_du_sorcier',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 4,
        type: 'life',
      },
      {
        quantity: 2,
        type: 'elan',
      },
      {
        quantity: 2,
        type: 'calm',
      },
      {
        quantity: 2,
        type: 'death',
      },
    ],
    excludedComponentId: 'repaireDesDragons',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    name: 'Bestiaire du Sorcier',
    type: 'placeOfPower',
  },
  {
    id: 'bibliotheque',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          drawOne: true,
        },
      },
    ],
    class: 'bibliotheque',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Bibliothèque',
    type: 'monument',
    victoryPoint: 1,
  },
  {
    id: 'bosquetSacre',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'calm',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 5,
              type: 'life',
            },
          ],
        },
      },
      {
        cost: {
          turn: true,
          turnCreature: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'life',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'bosquet_sacre',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 8,
        type: 'life',
      },
      {
        quantity: 4,
        type: 'calm',
      },
    ],
    excludedComponentId: 'tourDeLAlchimiste',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Bosquet Sacré',
    type: 'placeOfPower',
    victoryPoint: 2,
  },
  {
    id: 'caliceDeVie',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'calm',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'calm',
            },
            {
              quantity: 1,
              type: 'life',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'calice_de_vie',
    costEssenceList: [
      {
        quantity: 1,
        type: 'gold',
      },
      {
        quantity: 1,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'calm',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Calice de Vie',
    reactPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'calm',
        },
        {
          quantity: 1,
          type: 'life',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'catacombesDeLaMort',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 5,
              type: 'death',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          onComponent: true,
        },
      },
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'catacombes_de_la_mort',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 9,
        type: 'death',
      },
    ],
    excludedComponentId: 'puitsSacrificiel',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    name: 'Catacombes de la Mort',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'death',
        },
      ],
    },
    type: 'placeOfPower',
  },
  {
    id: 'coffreFort',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'coffre_fort',
    costEssenceList: [
      {
        quantity: 1,
        type: 'gold',
      },
      {
        quantity: 1,
        type: 'any',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Coffre Fort',
    specificCollectAbility: {
      essenceList: [
        {
          quantity: 2,
          type: 'any-but-gold',
        },
      ],
      multipleCollectOptions: true,
    },
    type: 'artefact',
  },
  {
    id: 'colosse',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'colosse',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Colosse',
    type: 'monument',
    victoryPoint: 2,
  },
  {
    id: 'corneDAbondance',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'any-but-gold',
            },
          ],
        },
      },
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
        },
      },
    ],
    class: 'corne_d_abondance',
    costEssenceList: [
      {
        quantity: 2,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Corne d\'Abondance',
    type: 'artefact',
  },
  {
    id: 'coupeDeFeu',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'elan',
            },
          ],
          turn: true,
        },
        gain: {
          straightenComponent: true,
        },
      },
    ],
    class: 'coupe_de_feu',
    costEssenceList: [
      {
        quantity: 1,
        type: 'gold',
      },
      {
        quantity: 1,
        type: 'elan',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Coupe de Feu',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 2,
          type: 'elan',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'craneMaudit',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'life',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'any-but-life-gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'crane_maudit',
    costEssenceList: [
      {
        quantity: 2,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Crâne Maudit',
    type: 'artefact',
  },
  {
    id: 'crypte',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'death',
            },
          ],
        },
      },
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          turn: true,
        },
        gain: {
          modifierList: [
            {
              quantity: -2,
              type: 'any-but-gold',
            },
          ],
          placeArtefactFromDiscard: true,
        },
      },
    ],
    class: 'crypte',
    costEssenceList: [
      {
        quantity: 3,
        type: 'any',
      },
      {
        quantity: 2,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Crypte',
    type: 'artefact',
  },
  {
    id: 'dagueSacrificielle',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'life',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'death',
            },
          ],
          onComponent: true,
        },
      },
      {
        cost: {
          destroySelf: true,
          discardArtefact: true,
        },
        gain: {
          modifierList: [
            {
              quantity: 0,
              type: 'any-but-gold',
            },
          ],
          placementCostAsAnyButGold: true,
        },
      },
    ],
    class: 'dague_sacrificielle',
    costEssenceList: [
      {
        quantity: 1,
        type: 'death',
      },
      {
        quantity: 1,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Dague Sacrificielle',
    type: 'artefact',
  },
  {
    id: 'dentDeDragon',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'elan',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'elan',
            },
          ],
          onComponent: true,
        },
      },
      {
        cost: {
          essenceList: [
            {
              quantity: 3,
              type: 'elan',
            },
          ],
          turn: true,
        },
        gain: {
          placeDragonForFree: true,
        },
      },
    ],
    class: 'dent_de_dragon',
    costEssenceList: [
      {
        quantity: 1,
        type: 'elan',
      },
      {
        quantity: 1,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Dent de dragon',
    type: 'artefact',
  },
  {
    id: 'divination',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          drawThreeDiscardThree: true,
        },
      },
    ],
    class: 'divination',
    hasActionPower: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    name: 'Divination',
    type: 'magicItem',
  },
  {
    id: 'dragonDOs',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          canIgnoreWithEssenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          rivalsLoseLife: 2,
        },
      },
    ],
    class: 'dragon_d_os',
    costEssenceList: [
      {
        quantity: 4,
        type: 'death',
      },
      {
        quantity: 1,
        type: 'life',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: true,
    name: 'Dragon d\'Os',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'dragonDeFeu',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          canIgnoreWithEssenceList: [
            {
              quantity: 1,
              type: 'calm',
            },
          ],
          rivalsLoseLife: 2,
        },
      },
    ],
    class: 'dragon_de_feu',
    costEssenceList: [
      {
        quantity: 6,
        type: 'elan',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: true,
    name: 'Dragon de Feu',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'dragonDeTerre',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          canIgnoreWithEssenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          rivalsLoseLife: 2,
        },
      },
    ],
    class: 'dragon_de_terre',
    costEssenceList: [
      {
        quantity: 4,
        type: 'elan',
      },
      {
        quantity: 3,
        type: 'life',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: true,
    name: 'Dragon de Terre',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'dragonDesEaux',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          canIgnoreWithEssenceList: [
            {
              quantity: 1,
              type: 'elan',
            },
          ],
          rivalsLoseLife: 2,
        },
      },
    ],
    class: 'dragon_des_eaux',
    costEssenceList: [
      {
        quantity: 6,
        type: 'calm',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: true,
    name: 'Dragon des Eaux',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'dragonDesVents',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          canIgnoreWithDiscardArtefact: true,
          rivalsLoseLife: 2,
        },
      },
    ],
    class: 'dragon_des_vents',
    costEssenceList: [
      {
        quantity: 4,
        type: 'calm',
      },
      {
        quantity: 4,
        type: 'any',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: true,
    name: 'Dragon des Vents',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'druidesse',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          straightenCreature: true,
        },
      },
    ],
    class: 'druidesse',
    hasActionPower: true,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    isAlternative: false,
    name: 'Druidesse',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'life',
        },
      ],
    },
    type: 'mage',
  },
  {
    id: 'duelliste',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'duelliste',
    hasActionPower: true,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    isAlternative: false,
    name: 'Duelliste',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'elan',
        },
      ],
    },
    type: 'mage',
  },
  {
    id: 'eclatElementaire',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'any-but-gold',
            },
          ],
        },
      },
    ],
    class: 'eclat_elementaire',
    costEssenceList: [],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Éclat Élémentaire',
    type: 'artefact',
  },
  {
    id: 'epeeVive',
    class: 'epee_vive',
    costEssenceList: [
      {
        quantity: 1,
        type: 'gold',
      },
      {
        quantity: 1,
        type: 'elan',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Épée Vive',
    reactPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'elan',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          ignore: true,
          onComponent: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'death',
        },
        {
          quantity: 1,
          type: 'elan',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'erudit',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          drawOne: true,
        },
      },
    ],
    class: 'erudit',
    hasActionPower: true,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    isAlternative: false,
    name: 'Érudit',
    type: 'mage',
  },
  {
    id: 'etangDeSerenite',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          asManyCalmThanRivalsElan: true,
        },
      },
    ],
    class: 'etang_de_serenite',
    costEssenceList: [
      {
        quantity: 2,
        type: 'calm',
      },
      {
        quantity: 1,
        type: 'elan',
      },
      {
        quantity: 1,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Étang de Sérénité',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 2,
          type: 'calm',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'faucon',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          reorderThree: true,
        },
      },
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'calm',
            },
          ],
          turn: true,
        },
        gain: {
          drawOne: true,
        },
      },
    ],
    class: 'faucon',
    costEssenceList: [
      {
        quantity: 1,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'calm',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: true,
    isDragon: false,
    name: 'Faucon',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'calm',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'fontaineDeJouvence',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'death',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'life',
            },
            {
              quantity: 1,
              type: 'calm',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'fontaine_de_jouvence',
    costEssenceList: [
      {
        quantity: 1,
        type: 'calm',
      },
      {
        quantity: 1,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Fontaine de Jouvence',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'life',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'forgeMaudite',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'elan',
            },
            {
              quantity: 1,
              type: 'gold',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'forge_maudite',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 6,
        type: 'elan',
      },
      {
        quantity: 3,
        type: 'death',
      },
    ],
    excludedComponentId: 'mineDesNains',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Forge Maudite',
    specificCollectAbility: {
      essenceList: [],
      multipleCollectOptions: false,
    },
    type: 'placeOfPower',
    victoryPoint: 1,
  },
  {
    id: 'fouetArdent',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'elan',
            },
          ],
          rivalsGain: true,
          rivalsGainEssenceList: [
            {
              quantity: 1,
              type: 'elan',
            },
          ],
        },
      },
      {
        cost: {
          destroyAnotherArtefact: true,
          turn: true,
        },
        gain: {
          modifierList: [
            {
              quantity: 2,
              type: 'any-but-gold',
            },
          ],
          placementCostAsAnyButGold: true,
        },
      },
    ],
    class: 'fouet_ardent',
    costEssenceList: [
      {
        quantity: 2,
        type: 'elan',
      },
      {
        quantity: 2,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Fouet Ardent',
    type: 'artefact',
  },
  {
    id: 'grandePyramide',
    class: 'grande_pyramide',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Grande Pyramide',
    type: 'monument',
    victoryPoint: 3,
  },
  {
    id: 'guerisseur',
    class: 'guerisseur',
    hasActionPower: false,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    isAlternative: false,
    name: 'Guérisseur',
    reactPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    specificCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'calm',
        },
        {
          quantity: 1,
          type: 'life',
        },
      ],
      multipleCollectOptions: true,
    },
    type: 'mage',
  },
  {
    id: 'harnaisDuDragon',
    class: 'harnais_du_dragon',
    costEssenceList: [
      {
        quantity: 1,
        type: 'elan',
      },
      {
        quantity: 1,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'calm',
      },
      {
        quantity: 1,
        type: 'death',
      },
    ],
    discountAbilityList: [
      {
        discountList: [
          {
            quantity: 3,
            type: 'any',
          },
        ],
        type: ['dragon'],
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: true,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: false,
    name: 'Harnais du Dragon',
    reactPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          ignore: true,
        },
        type: ['DRAGON'],
      },
    ],
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'jardinsSuspendus',
    class: 'jardins_suspendus',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: false,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Jardins Suspendus',
    specificCollectAbility: {
      essenceList: [
        {
          quantity: 3,
          type: 'any-but-gold',
        },
      ],
      multipleCollectOptions: true,
    },
    type: 'monument',
    victoryPoint: 1,
  },
  {
    id: 'mainDeGloire',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'death',
            },
          ],
          rivalsGain: true,
          rivalsGainEssenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
        },
      },
    ],
    class: 'main_de_gloire',
    costEssenceList: [
      {
        quantity: 1,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Main de Gloire',
    type: 'artefact',
  },
  {
    id: 'manoirDeCorail',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          checkVictoryNow: true,
        },
      },
    ],
    class: 'manoir_de_corail',
    costEssenceList: [
      {
        quantity: 5,
        type: 'elan',
      },
      {
        quantity: 5,
        type: 'life',
      },
      {
        quantity: 5,
        type: 'calm',
      },
    ],
    excludedComponentId: 'recifDesNaufrageurs',
    hasActionPower: true,
    hasConditionalVictoryPoint: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Manoir de Corail',
    reactPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    type: 'placeOfPower',
    victoryPoint: 3,
  },
  {
    id: 'mausolee',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'any',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'mausolee',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Mausolée',
    type: 'monument',
    victoryPoint: 2,
  },
  {
    id: 'mineDeSalomon',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
        },
      },
    ],
    class: 'mine_de_salomon',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Mine de Salomon',
    type: 'monument',
    victoryPoint: 1,
  },
  {
    id: 'mineDesNains',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 5,
              type: 'elan',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'gold',
            },
          ],
        },
      },
      {
        cost: {
          essenceList: [
            {
              quantity: 3,
              type: 'death',
            },
            {
              quantity: 3,
              type: 'elan',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'mine_des_nains',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 4,
        type: 'elan',
      },
      {
        quantity: 2,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'gold',
      },
    ],
    excludedComponentId: 'forgeMaudite',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    name: 'Mine des Nains',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'gold',
        },
      ],
    },
    type: 'placeOfPower',
  },
  {
    id: 'molosse',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'elan',
            },
          ],
          onlyWhenTurned: true,
        },
        gain: {
          straightenSelf: true,
        },
      },
    ],
    class: 'molosse',
    costEssenceList: [
      {
        quantity: 1,
        type: 'elan',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: true,
    isDragon: false,
    name: 'Molosse',
    reactPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    type: 'artefact',
  },
  {
    id: 'montureCeleste',
    class: 'monture_celeste',
    costEssenceList: [
      {
        quantity: 2,
        type: 'calm',
      },
      {
        quantity: 1,
        type: 'elan',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: true,
    isDragon: false,
    name: 'Monture Céleste',
    specificCollectAbility: {
      essenceList: [
        {
          quantity: 2,
          type: 'any-but-death-gold',
        },
      ],
      multipleCollectOptions: true,
    },
    type: 'artefact',
  },
  {
    id: 'mortVie',
    class: 'mort_vie',
    hasActionPower: false,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    name: 'Mort Vie',
    specificCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'death',
        },
        {
          quantity: 1,
          type: 'life',
        },
      ],
      multipleCollectOptions: true,
    },
    type: 'magicItem',
  },
  {
    id: 'necromancienne',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'life',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'death',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'necromancienne',
    hasActionPower: true,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    isAlternative: false,
    name: 'Nécromancienne',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'death',
        },
      ],
    },
    type: 'mage',
  },
  {
    id: 'obelisque',
    class: 'obelisque',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: true,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Obélisque',
    placementPowerList: [],
    type: 'monument',
    victoryPoint: 1,
  },
  {
    id: 'oeufDeDragon',
    actionPowerList: [
      {
        cost: {
          destroySelf: true,
        },
        gain: {
          modifierList: [
            {
              quantity: -4,
              type: 'any-but-gold',
            },
          ],
          placeDragon: true,
        },
      },
    ],
    class: 'oeuf_de_dragon',
    costEssenceList: [
      {
        quantity: 1,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: false,
    name: 'Oeuf de Dragon',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'oracle',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          reorderThree: true,
        },
      },
    ],
    class: 'oracle',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Oracle',
    type: 'monument',
    victoryPoint: 2,
  },
  {
    id: 'pierrePhilosophale',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'any',
            },
          ],
          sameType: true,
          turn: true,
        },
        gain: {
          powerCostAsGold: true,
        },
      },
    ],
    class: 'pierre_philosophale',
    costEssenceList: [
      {
        quantity: 2,
        type: 'elan',
      },
      {
        quantity: 2,
        type: 'life',
      },
      {
        quantity: 2,
        type: 'calm',
      },
      {
        quantity: 2,
        type: 'death',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: false,
    name: 'Pierre Philosophale',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'piocheDesNains',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'elan',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
        },
      },
    ],
    class: 'pioche_des_nains',
    costEssenceList: [
      {
        quantity: 1,
        type: 'elan',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Pioche des Nains',
    type: 'artefact',
  },
  {
    id: 'prisme',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'any-but-gold',
            },
          ],
        },
      },
      {
        cost: {
          sameType: true,
          turn: true,
        },
        gain: {
          powerCostAsAnySameTypeButGold: true,
        },
      },
    ],
    class: 'prisme',
    costEssenceList: [],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Prisme',
    type: 'artefact',
  },
  {
    id: 'protection',
    class: 'protection',
    hasActionPower: false,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    name: 'Protection',
    reactPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    type: 'magicItem',
  },
  {
    id: 'puitsCalcifere',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'life',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'elan',
            },
            {
              quantity: 1,
              type: 'death',
            },
          ],
        },
      },
    ],
    class: 'puits_calcifere',
    costEssenceList: [
      {
        quantity: 2,
        type: 'elan',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Puits Calcifère',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'elan',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'puitsSacrificiel',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 3,
              type: 'life',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          onComponent: true,
        },
      },
      {
        cost: {
          destroyOneDragonOrCreature: true,
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
          turn: true,
        },
        gain: {
          placementCostAsGold: true,
        },
      },
    ],
    class: 'puits_sacrificiel',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 8,
        type: 'elan',
      },
      {
        quantity: 4,
        type: 'death',
      },
    ],
    excludedComponentId: 'catacombesDeLaMort',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Puits Sacrificiel',
    type: 'placeOfPower',
    victoryPoint: 2,
  },
  {
    id: 'reanimation',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          straightenComponent: true,
        },
      },
    ],
    class: 'reanimation',
    hasActionPower: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    name: 'Réanimation',
    type: 'magicItem',
  },
  {
    id: 'recherches',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          drawOne: true,
        },
      },
    ],
    class: 'recherches',
    hasActionPower: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    name: 'Recherches',
    type: 'magicItem',
  },
  {
    id: 'recifDesNaufrageurs',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'calm',
            },
            {
              quantity: 1,
              type: 'life',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'calm',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'recif_des_naufrageurs',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 5,
        type: 'calm',
      },
      {
        quantity: 2,
        type: 'elan',
      },
      {
        quantity: 2,
        type: 'life',
      },
    ],
    excludedComponentId: 'manoirDeCorail',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    name: 'Récif des Naufrageurs',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'gold',
        },
      ],
    },
    type: 'placeOfPower',
  },
  {
    id: 'repaireDesDragons',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'gold',
            },
          ],
        },
      },
      {
        cost: {
          turn: true,
          turnDragon: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'repaire_des_dragons',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 3,
        type: 'elan',
      },
      {
        quantity: 3,
        type: 'life',
      },
      {
        quantity: 3,
        type: 'calm',
      },
      {
        quantity: 3,
        type: 'death',
      },
    ],
    discountAbilityList: [
      {
        discountList: [
          {
            quantity: 3,
            type: 'any',
          },
        ],
        type: ['dragon'],
      },
    ],
    excludedComponentId: 'bestiaireDuSorcier',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: true,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    name: 'Repaire des dragons',
    type: 'placeOfPower',
  },
  {
    id: 'rossignol',
    class: 'rossignol',
    costEssenceList: [
      {
        quantity: 1,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'calm',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: true,
    isDragon: false,
    name: 'Rossignol',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'sereniteVigueur',
    class: 'serenite_vigueur',
    hasActionPower: false,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    name: 'Sérénité Vigueur',
    specificCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'calm',
        },
        {
          quantity: 1,
          type: 'elan',
        },
      ],
      multipleCollectOptions: true,
    },
    type: 'magicItem',
  },
  {
    id: 'serpentDeMer',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          canIgnoreWithDestroyArtefact: true,
          rivalsLoseLife: 2,
        },
      },
    ],
    class: 'serpent_de_mer',
    costEssenceList: [
      {
        quantity: 6,
        type: 'calm',
      },
      {
        quantity: 3,
        type: 'life',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: true,
    isDragon: true,
    name: 'Serpent de Mer',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'sirene',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'calm',
            },
            {
              quantity: 1,
              type: 'life',
            },
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          multipleCostOptions: true,
          turn: true,
        },
        gain: {
          putItOnAnyComponent: true,
        },
      },
    ],
    class: 'sirene',
    costEssenceList: [
      {
        quantity: 2,
        type: 'life',
      },
      {
        quantity: 2,
        type: 'calm',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: true,
    isDragon: false,
    name: 'Sirène',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'calm',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'sorciere',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          straightenComponent: true,
        },
      },
    ],
    class: 'sorciere',
    hasActionPower: true,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    isAlternative: false,
    name: 'Sorcière',
    specificCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'life',
        },
        {
          quantity: 1,
          type: 'death',
        },
      ],
      multipleCollectOptions: true,
    },
    type: 'mage',
  },
  {
    id: 'sourceElementaire',
    class: 'source_elementaire',
    costEssenceList: [
      {
        quantity: 2,
        type: 'elan',
      },
      {
        quantity: 1,
        type: 'life',
      },
      {
        quantity: 1,
        type: 'calm',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: false,
    isDragon: false,
    name: 'Source Élémentaire',
    reactPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'calm',
            },
          ],
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'calm',
        },
        {
          quantity: 1,
          type: 'life',
        },
        {
          quantity: 1,
          type: 'elan',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'statueSacree',
    class: 'statue_sacree',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    name: 'Statue Sacrée',
    reactPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 3,
              type: 'gold',
            },
          ],
          turn: true,
        },
        gain: {
          temporaryVictoryPoints: 3,
        },
        type: ['VICTORY_CHECK'],
      },
    ],
    type: 'monument',
    victoryPoint: 1,
  },
  {
    id: 'statuetteOrnee',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'death',
            },
          ],
          rivalsGain: true,
          rivalsGainEssenceList: [
            {
              quantity: 1,
              type: 'death',
            },
          ],
        },
      },
      {
        cost: {
          destroySelf: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 2,
              type: 'gold',
            },
            {
              quantity: 1,
              type: 'elan',
            },
          ],
        },
      },
    ],
    class: 'statuette_ornee',
    costEssenceList: [
      {
        quantity: 2,
        type: 'death',
      },
      {
        quantity: 1,
        type: 'gold',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    hasVictoryPoint: true,
    isCreature: false,
    isDragon: false,
    name: 'Statuette Ornée',
    type: 'artefact',
    victoryPoint: 1,
  },
  {
    id: 'temple',
    class: 'temple',
    costEssenceList: [
      {
        quantity: 4,
        type: 'gold',
      },
    ],
    hasActionPower: false,
    hasCost: true,
    hasDiscountAbility: false,
    hasPlacementPower: false,
    hasReactPower: true,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: true,
    name: 'Temple',
    reactPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'life',
        },
      ],
    },
    type: 'monument',
    victoryPoint: 2,
  },
  {
    id: 'tourDeLAlchimiste',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 1,
              type: 'death',
            },
            {
              quantity: 1,
              type: 'elan',
            },
            {
              quantity: 1,
              type: 'calm',
            },
            {
              quantity: 1,
              type: 'life',
            },
          ],
        },
        gain: {
          essenceList: [
            {
              quantity: 1,
              type: 'gold',
            },
          ],
          onComponent: true,
        },
      },
    ],
    class: 'tour_de_l_alchimiste',
    conditionalVictoryPointList: [],
    costEssenceList: [
      {
        quantity: 3,
        type: 'gold',
      },
    ],
    excludedComponentId: 'bosquetSacre',
    hasActionPower: true,
    hasConditionalVictoryPoint: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: true,
    hasSpecificCollectAbility: true,
    hasStandardCollectAbility: false,
    hasVictoryPoint: false,
    name: 'Tour de l\'Alchimiste',
    reactPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          ignore: true,
        },
        type: ['LIFE_LOSS'],
      },
    ],
    specificCollectAbility: {
      essenceList: [
        {
          quantity: 3,
          type: 'any-but-gold',
        },
      ],
      multipleCollectOptions: true,
    },
    type: 'placeOfPower',
  },
  {
    id: 'transmutation',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 3,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'any-but-gold',
            },
          ],
        },
      },
    ],
    class: 'transmutation',
    hasActionPower: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    name: 'Transmutation',
    type: 'magicItem',
  },
  {
    id: 'transmutatrice',
    actionPowerList: [
      {
        cost: {
          essenceList: [
            {
              quantity: 2,
              type: 'any',
            },
          ],
          turn: true,
        },
        gain: {
          essenceList: [
            {
              quantity: 3,
              type: 'any-but-gold',
            },
          ],
        },
      },
    ],
    class: 'transmutatrice',
    hasActionPower: true,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: false,
    isAlternative: false,
    name: 'Transmutatrice',
    type: 'mage',
  },
  {
    id: 'treant',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          asManyElanThanRivalsDeath: true,
        },
      },
    ],
    class: 'treant',
    costEssenceList: [
      {
        quantity: 3,
        type: 'life',
      },
      {
        quantity: 2,
        type: 'elan',
      },
    ],
    hasActionPower: true,
    hasCost: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    hasVictoryPoint: false,
    isCreature: true,
    isDragon: false,
    name: 'Tréant',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 2,
          type: 'life',
        },
      ],
    },
    type: 'artefact',
  },
  {
    id: 'voyante',
    actionPowerList: [
      {
        cost: {
          turn: true,
        },
        gain: {
          reorderThree: true,
        },
      },
    ],
    class: 'voyante',
    hasActionPower: true,
    hasAlternative: true,
    hasDiscountAbility: false,
    hasReactPower: false,
    hasSpecificCollectAbility: false,
    hasStandardCollectAbility: true,
    isAlternative: false,
    name: 'Voyante',
    standardCollectAbility: {
      essenceList: [
        {
          quantity: 1,
          type: 'calm',
        },
      ],
    },
    type: 'mage',
  },
]
