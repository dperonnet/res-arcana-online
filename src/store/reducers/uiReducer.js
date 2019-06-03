const initState = {
  loading: false
}

const uiReducer = (state = initState, action) => {
  const debug = false;
  switch (action.type) {
    case 'LOADING':
      debug && console.log('loading', action.loading);
      state.loading = action.loading;
      return state;
    default:
      return state;
  }
};

export default uiReducer;
