const initState = {
  games: []
}

const gameReducer = (state = initState, action) => {
  switch (action.type) {
    case 'CREATE_GAME':
      console.log('create game', action.game);
      state.game = action.game;
      console.log('create game state', state);
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
    default:
      return state;
  }
};

export default gameReducer;
