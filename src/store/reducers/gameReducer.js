const initState = {
  cardToZoom: undefined,
  games: [],
  selectedComponent: undefined,
  selectedAction: undefined,
  tappedComponents: [],
  collectActions: {},
  collectOnComponentActions: {},
  essencePickerSelection: {},
  focusZoom: true
}

const gameReducer = (state = initState, action) => {
  const debug = false
  let collectActions
  let collectOnComponentActions
  let essencePickerSelection
  switch (action.type) {
    case 'CREATE_GAME':
      debug && console.log('create game', action.doc.id);
      return state;
    case 'CREATE_GAME_ERROR':
      debug && console.log('create game error', action.err);
      return state;
    case 'JOIN_GAME':
      debug && console.log('join game', action.gameId);
      return state;
    case 'JOIN_GAME_ERROR':
      debug && console.log('join game error', action.err);
      return state;
    case 'LEAVE_CURRENT_GAME':
      debug && console.log('left game');
      state.gameId = null;
      return state;
    case 'LEAVE_CURRENT_GAME_ERROR':
      debug && console.log('left game error', action.err);
      return state;
    case 'GAME_STARTED':
      debug && console.log('start game ', action.gameId);
      return state;
    case 'GAME_OVER':
      debug && console.log('end game ', action.gameId);
      return state;
    case 'SELECT_COMPONENT':
      return Object.assign({}, state, {
        selectedComponent: action.component
      });
    case 'ZOOM_CARD':
      return Object.assign({}, state, {
        zoomCard: action.card
      });
    case 'CLEAR_ZOOM':
      return Object.assign({}, state, {
        zoomCard: undefined
      });
    case 'TAP_COMPONENT':
      const { tappedComponents } = state;
      console.log('card.id', action.card.id)
      let index = tappedComponents.indexOf(action.card.id)
      if (index >= 0) {
        tappedComponents.splice(index, 1);
      } else {
        tappedComponents.push(action.card.id)
      }
      return Object.assign({}, state, {
        tappedComponents
      });
    case 'RESET_COLLECT':
      return Object.assign({}, state, {
        collectActions: {},
        collectOnComponentActions: {}
      });
    case 'RESET_COLLECT_ACTION':
      collectActions = JSON.parse(JSON.stringify(state.collectActions))
      delete collectActions[action.id]
      return Object.assign({}, state, {
        collectActions
      });
    case 'SET_COLLECT_ACTION':
      collectActions = JSON.parse(JSON.stringify(state.collectActions))
      collectActions[action.action.id] = action.action
      return Object.assign({}, state, {
        collectActions
      });
    case 'RESET_COLLECT_ON_COMPONENT_ACTION':
      collectOnComponentActions = JSON.parse(JSON.stringify(state.collectOnComponentActions))
      delete collectOnComponentActions[action.id]
      return Object.assign({}, state, {
        collectOnComponentActions
      });
    case 'SET_COLLECT_ON_COMPONENT_ACTION':
      collectOnComponentActions = JSON.parse(JSON.stringify(state.collectOnComponentActions))
      collectOnComponentActions[action.action.id] = action.action
      return Object.assign({}, state, {
        collectOnComponentActions
      });
    case 'SET_FOCUS_ZOOM':
      return Object.assign({}, state, {
        focusZoom: action.flag
      });
    case 'SET_ACTION':
      return Object.assign({}, state, {
        selectedAction: action.action
      })
    case 'RESET_ESSENCE_PICKER':
      return Object.assign({}, state, {
        essencePickerSelection: {}
      });
    case 'ADD_ESSENCE_TO_SELECTION':
      essencePickerSelection = JSON.parse(JSON.stringify(state.essencePickerSelection))
      essencePickerSelection[action.essenceType] = essencePickerSelection[action.essenceType] ? essencePickerSelection[action.essenceType] + 1 : 1
      return Object.assign({}, state, {
        essencePickerSelection
      });
    default:
      return state;
  }
};

export default gameReducer;
