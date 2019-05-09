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
    }).then(() => {
      dispatch({ type: 'CREATE_GAME', game});
    }).catch((err) => {
      dispatch({type: 'CREATE_GAME_ERROR', err});
    })
  }
};

export const joinGame = (gameId) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    // make asynch call to database
    const fireStore = getFirestore();
    const creatorId = getState().firebase.auth.uid;
    const data = {
      gameId: gameId,
      createdAt: new Date()
    };
    fireStore.collection('currentGames').doc(creatorId).set(
      data
    ).then(() => {
      dispatch({ type: 'JOIN_GAME', gameId});
    }).catch((err) => {
      dispatch({type: 'JOIN_GAME_ERROR', err});
    })
  }
};

export const createAndJoinGame = (game) => {
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
    }).then((docRef) => {
      docRef.get().then(doc => {
        dispatch({ type: 'CREATE_GAME', doc});
      })
      dispatch(joinGame(docRef.id));
    }).catch((err) => {
      dispatch({type: 'CREATE_GAME_ERROR', err});
    })
  }
}

export const getCurrentGameId = () => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const playerId = getState().firebase.auth.uid;
    const fireStore = getFirestore();
    fireStore.collection('currentGames').doc(playerId).get().then((docRef) => {
      const gameId = docRef ? docRef.id : null;
      console.log('current game id : ', gameId);
      dispatch({type: 'GET_CURRENT_GAME', gameId})
    }).catch((err) => {
      dispatch({type: 'GET_CURRENT_GAME_ERROR', err});
    })
  }
}

export const leaveGame = () => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const playerId = getState().firebase.auth.uid;
    const fireStore = getFirestore();
    fireStore.collection('currentGames').doc(playerId).update({
      gameId: null
    }).then((docRef) => {
      dispatch({type: 'LEAVE_CURRENT_GAME'})
    }).catch((err) => {
      dispatch({type: 'LEAVE_CURRENT_GAME_ERROR', err});
    })
  }
}
