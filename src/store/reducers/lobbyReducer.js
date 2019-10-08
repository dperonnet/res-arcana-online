const initState = {
  lobbys: [],
}

const lobbyReducer = (state = initState, action) => {
  const debug = true
  switch (action.type) {
    case 'CREATE_GAME_LOBBY':
      debug && console.log('create game lobby', action.gameLobby.id)
      return state
    case 'CREATE_GAME_LOBBY_ERROR':
      debug && console.log('create game lobby error', action.err)
      return state
    case 'ADD_SEAT_IN_LOBBY':
      debug && console.log('add seat in lobby', action.lobbyId)
      return state
    case 'ADD_SEAT_IN_LOBBY_ERROR':
      debug && console.log('add seat in lobby error', action.err)
      return state
    case 'REMOVE_SEAT_IN_LOBBY':
      debug && console.log('remove seat in lobby', action.lobbyId)
      return state
    case 'REMOVE_SEAT_IN_LOBBY_ERROR':
      debug && console.log('remove seat in lobby error', action.err)
      return state
    case 'JOIN_GAME_LOBBY':
      debug && console.log('join game lobby', action.lobbyId)
      return state
    case 'JOIN_GAME_LOBBY_ERROR':
      debug && console.log('join game lobby error', action.err)
      return state
    case 'DELETE_GAME_LOBBY':
      debug && console.log('delete game lobby', action.lobbyId)
      return state
    case 'DELETE_GAME_LOBBY_ERROR':
      debug && console.log('delete game lobby error', action.err)
      return state
    case 'LEAVE_GAME_LOBBY':
      debug && console.log('leave game lobby', action.lobbyId)
      return state
    case 'LEAVE_GAME_LOBBY_ERROR':
      debug && console.log('leave game lobby error', action.err)
      return state
    default:
      return state
  }
}

export default lobbyReducer
