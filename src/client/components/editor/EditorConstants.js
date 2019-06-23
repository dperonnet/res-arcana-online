export const DELIMITER = '|';

export const LOCALSTORAGE_KEY = 'RADatabase.json';

export const COMPONENTS_TYPE = [
  { id: 'artefact', name: 'Artefact' },
  { id: 'mage', name: 'Mage' },
  { id: 'magicItem', name: 'Magic Item' },
  { id: 'monument', name: 'Monument' },
  { id: 'placeOfPower', name: 'Place of Power' }
];

export const DEFAULT_STANDARD_COLLECT_ABILITY = {
  multipleCollectOptions: false,
  essenceList: {}
};

export const DEFAULT_COMPONENT = {
  id: '',
  class: '',
  name: '',
  type: 'artefact',
  hasStandardCollectAbility: false,
  hasSpecificCollectAbility: false,
  isDragon: false,
  isCreature: false
};
