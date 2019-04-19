export const createGame = (game) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    // make asynch call to database
    const fireStore = getFirestore();
    fireStore.collection('games').add({
      ...game,
      gameCreator: 'Boby',
      createdAt: new Date()
    }).then(()=>{
      dispatch({ type: 'CREATE_GAME', game});
    }).catch((err)=>{
      dispatch({type: 'CREATE_GAME_ERROR', err});
    })
  }
};
