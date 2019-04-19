const initState = {
  games: [
    {id: '1', title: 'Max\'s game', content: 'blah blah blah'},
    {id: '2', title: 'Noobs only', content: 'blah blah blah'},
    {id: '3', title: 'Experts only', content: 'blah blah blah'}
  ]
}

const gameReducer = (state = initState, action) => {
  switch (action.type) {
    case 'CREATE_GAME':
      console.log('create game', action.game);
      return state;
    case 'CREATE_GAME_ERROR':
      console.log('create game error', action.err);
        return state;
    default:
      return state;
  }
};

export default gameReducer;
