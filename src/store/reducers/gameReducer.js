const initState = {
  games: []
}

const gameReducer = (state = initState, action) => {
  switch (action.type) {
    case 'CREATE_GAME':
      state.game = action.doc;
      console.log('state', state);
      console.log('create game', action.doc.data());
      return state;
    case 'CREATE_GAME_ERROR':
      console.log('create game error', action.err);
        return state;
    case 'JOIN_GAME':
      console.log('join game', action.gameId);
      state.gameId = action.gameId;
      return state;
    case 'JOIN_GAME_ERROR':
      console.log('join game error', action.err);
      return state;
    case 'LEAVE_CURRENT_GAME':
      console.log('left game');
      state.gameId = '';
      return state;
    case 'LEAVE_CURRENT_GAME_ERROR':
      console.log('left game error', action.err);
      return state;

    default:
      return state;
  }
};

export default gameReducer;
