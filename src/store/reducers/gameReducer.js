const initState = {
  games: []
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
    default:
      return state;
  }
};

export default gameReducer;
