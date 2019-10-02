const initState = {
  lobbys: []
}

const lobbyReducer = (state = initState, action) => {
  const debug = true
  switch (action.type) {
    case 'CREATE_GAME_LOBBY':
      debug && console.log('create game lobby', action.gameLobby.id);
      return state;
    case 'CREATE_GAME_LOBBY_ERROR':
      debug && console.log('create game lobby error', action.err);
      return state;
    default:
      return state;
  }
};

export default lobbyReducer;
