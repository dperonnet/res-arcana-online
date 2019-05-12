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
      createdAt: new Date(),
      status: 'PENDING'
    }).then((docRef) => {
      docRef.get().then(doc => {
        dispatch({ type: 'CREATE_GAME', doc});
      })
    }).catch((err) => {
      dispatch({type: 'CREATE_GAME_ERROR', err});
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
      createdAt: new Date(),
      status: 'PENDING'
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

export const joinGame = (gameId) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const fireStore = getFirestore();
    const profile = getState().firebase.profile;
    const creatorId = getState().firebase.auth.uid;

    const gameRef = fireStore.collection('games').doc(gameId);
    
    gameRef.get().then((doc) => {
      
      // Add player to game players list
      let players = doc.data().players
      players[creatorId] = profile.login;

      gameRef.update({players}).then((game) => {
        console.log('game',game)
        // Set the current game for player
        const data = {
          gameId: gameId,
          createdAt: new Date()
        };
        fireStore.collection('currentGames').doc(creatorId).set(data).then(() => {
          dispatch({ type: 'JOIN_GAME', gameId});
        })

      });
    }).catch((err) => {
      dispatch({type: 'JOIN_GAME_ERROR', err});
    })
  }
};

export const leaveGame = (gameId) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const fireStore = getFirestore();
    const playerId = getState().firebase.auth.uid;
    const gameRef = fireStore.collection('games').doc(gameId);

    gameRef.get().then((document) => {
      let status = document.data().status

      switch (status) {
        // leave before game Start
        case 'PENDING':
          leaveWhilePending(gameId, playerId, document, fireStore);
          break;
        // leave while game is still running
        case 'STARTED':
          break;
        // leave when game is over
        case 'OVER':
          break;
        default:
      }
    }).then(() => {

    });
    fireStore.collection('currentGames').doc(playerId).update({
      gameId: null
    }).then((docRef) => {
      dispatch({type: 'LEAVE_CURRENT_GAME'})
    }).catch((err) => {
      dispatch({type: 'LEAVE_CURRENT_GAME_ERROR', err});
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

const leaveWhilePending = (gameId, playerId, document, fireStore) => {
console.log('game is pending')
  const gameRef = fireStore.collection('games').doc(gameId);
  let players = document.data().players

  // if game creator or the only left player in game, kick all players and delete game.
  const isGameCreator = (playerId === document.data().creatorId);
  const isTheOnlyPlayer = (Object.keys(players).length === 1 && Object.keys(players)[0] === playerId);
  if (isGameCreator || isTheOnlyPlayer) {
    let kicks = Object.keys(players).map((key) => {
      console.log('key', key)
      const playerCurrentGameRef = fireStore.collection('currentGames').doc(key);
      console.log('playerCurrentGameRef',playerCurrentGameRef)
      // check if player is synch with the game before kick
      return playerCurrentGameRef.get().then((currentGame) => {
        if(currentGame.data().gameId === gameId) {
          playerCurrentGameRef.update({
            gameId: null
          })
        }
      })
    })
    delete players[playerId];
    Promise.all(kicks).then(deleteGame(gameRef));
  // else just leave game
  } else {
    delete players[playerId];
    fireStore.collection('currentGames').doc(playerId).update({
      gameId: null
    })
    gameRef.update({players});
  }
}

const deleteGame = (gameRef) => {
  const gameId = gameRef.id;
  gameRef.delete().then(function() {
    console.log('Game',gameId,'was successfuly delete');
  }).catch(function(error) {
    console.error("Error deleting game: ", gameId, error);
  });
}
