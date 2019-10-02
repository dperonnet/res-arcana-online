export const DELIMITER = '|'

export const LOCALSTORAGE_KEY = 'RADatabase.json'

export const COMPONENTS_TYPE = [
  { id: 'artefact', name: 'Artefact' },
  { id: 'mage', name: 'Mage' },
  { id: 'magicItem', name: 'Magic Item' },
  { id: 'monument', name: 'Monument' },
  { id: 'placeOfPower', name: 'Place of Power' },
]

export const STANDARD_COLLECT_ABILITY = {}

export const SPECIFIC_COLLECT_ABILITY = {
  multipleCollectOptions: false,
}

export const DEFAULT_COMPONENT = {
  id: '',
  class: '',
  name: '',
  type: 'artefact',
  hasActionPower: false,
  hasCost: false,
  hasDiscountAbility: false,
  hasReactPower: false,
  hasStandardCollectAbility: false,
  hasSpecificCollectAbility: false,
  hasVictoryPoint: false,
  isDragon: false,
  isCreature: false,
}

export const DISCOUNT = {
  type: ['artefact'],
}

export const REACT_POWER = {
  type: [],
  cost: {},
  gain: {},
}

export const ACTION_POWER = {
  cost: {},
  gain: {},
}
