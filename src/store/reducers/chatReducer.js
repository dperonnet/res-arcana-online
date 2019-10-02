const initState = {
  chat: null,
  chatDisplay: true,
}

const chatReducer = (state = initState, action) => {
  switch (action.type) {
  case 'CREATE_CHAT':
    return {
      ...state,
      chat: action.chat,
    }
  case 'TOGGLE_CHAT':
    return {
      ...state,
      chatDisplay: !state.chatDisplay,
    }
  default:
    return state
  }
}

export default chatReducer
