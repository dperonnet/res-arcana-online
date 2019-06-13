const initState = {
  cardToZoom: undefined,
  games: [],
  selectedCard: undefined,
  tappedComponents: []
}

const gameReducer = (state = initState, action) => {
  const debug = false;
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
    case 'SELECT_CARD':
      return Object.assign({}, state, {
        selectedCard: action.card
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
    default:
      return state;
  }
};

export default gameReducer;
