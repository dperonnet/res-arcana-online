export const createGame = (game) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    // make asynch call to database
    const fireStore = getFirestore();
    const profile = getState().firebase.profile;
    const creatorId = getState().firebase.auth.uid;
    fireStore.collection('games').add({
      ...game,
      gameCreator: profile.login,
      creatorId: creatorId,
      createdAt: new Date()
    }).then(()=>{
      dispatch({ type: 'CREATE_GAME', game});
    }).catch((err)=>{
      dispatch({type: 'CREATE_GAME_ERROR', err});
    })
  }
};
