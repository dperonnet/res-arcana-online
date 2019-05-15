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
  essenceList: {
    elan: 0, life: 0, calm: 0, death: 0, gold: 0, any: 0, anyButGold: 0, anyButDeathGold: 0,
  }
};

export const DEFAULT_COMPONENT = {
  componentName: '',
  componentType: 'artefact',
  hasStandardCollectAbility: false,
  hasSpecificCollectAbility: false,
  isDragon: false,
  isCreature: false
};
