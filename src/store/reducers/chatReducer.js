const initState = {
  chat: null
}

const chatReducer = (state = initState, action) => {
  switch(action.type) {
    case 'CREATE_CHAT':
      return {
        ...state,
        chat: action.chat,
      }
    default:
      return state;
  }
};

export default chatReducer;
