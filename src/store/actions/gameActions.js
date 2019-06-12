import { createChat, deleteChat } from './chatActions';

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

export const createAndJoinGame = (game, callBack, gameServerUrl) => {
  return (dispatch, getState, {getFirestore}) => {
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
        dispatch(createChat(doc.id, doc.data().name + ' Chat'));
      })
      dispatch(joinGame(docRef.id, callBack, gameServerUrl));
    }).catch((err) => {
      dispatch({type: 'CREATE_GAME_ERROR', err});
    })
  }
}

export const joinGame = (gameId, callBack, gameServerUrl) => {
  return (dispatch, getState, { getFirestore}) => {
    const fireStore = getFirestore();
    const profile = getState().firebase.profile;
    const playerId = getState().firebase.auth.uid;
    const gameRef = fireStore.collection('games').doc(gameId);
    const currentGameRef = fireStore.collection('currentGames').doc(playerId);
    currentGameRef.get().then((cgDoc) => {
      const currentGameDatas = cgDoc.data();
      leaveServerInstance(gameServerUrl, 'res-arcana', currentGameDatas.gameCredentials).then(() => {      
        fireStore.runTransaction(function(transaction) {
          return transaction.get(gameRef).then(function(gameDoc) {
            if (!gameDoc.exists) {
                throw new Error("Document does not exist!");;
            }
            if (gameDoc.data().status === 'PENDING') {
              // Add player to game players list
              let players = gameDoc.data().players ? gameDoc.data().players : {}
              let playersInGame = Object.keys(players).length;
              if (players[playerId]) {
                transaction.update(gameRef, {players});
                return gameId;
              } else if (playersInGame < 4) {
                players[playerId] = {
                  id: playersInGame,
                  name: profile.login
                };
                transaction.update(gameRef, {players});
                return gameId;
              } else {
                return Promise.reject("Sorry! Game is full.");
              }
            } else {
              transaction.update(gameRef, gameDoc.data());
            }
          });
        }).then(() => {
          gameRef.get().then((gameDoc) => {
            currentGameRef.get().then((cGame) => {
              // Set the current game for player
              const datas = {
                gameId: gameId,
                createdAt: new Date(),
                gameCredentials: {}
              }
              currentGameRef.set(datas).then(() => {
                // If player in game players, process join server game with callback
                if (Object.keys(gameDoc.data().players).includes(playerId)) {
                  const boardGameId = gameDoc.data().boardGameId
                  const playerIdInGame = gameDoc.data().players[playerId].id;
                  callBack('res-arcana', boardGameId, playerIdInGame);
                }
              });
            });
            dispatch({ type: 'JOIN_GAME', gameId});
          })
        }).catch((err) => {
          dispatch({type: 'JOIN_GAME_ERROR', err});
        });
      });
    });
  }
};

export const leaveGame = (gameId, gameServerUrl) => {
  return (dispatch, getState, {getFirestore}) => {
    const fireStore = getFirestore();
    const playerId = getState().firebase.auth.uid;
    const gameRef = fireStore.collection('games').doc(gameId);

    gameRef.get().then((document) => {
      let status = document.exists ? document.data().status : null;
      switch (status) {
        // leave before game Start
        case 'PENDING':
          dispatch(leaveWhilePending(gameId, playerId, document, fireStore, gameServerUrl));
          break;
        // leave while game is still running
        case 'STARTED':
          dispatch(leaveWhileStarted(gameId, playerId, document, fireStore, gameServerUrl));
          break;
        // leave when game is over
        case 'OVER':
          dispatch(leaveWhileOver(gameId, playerId, document, fireStore, gameServerUrl));
          break;
        default:
      }
      dispatch(disjoinCurrentGame());
    });
  }
}

export const getCurrentGameId = () => {
  return (dispatch, getState, {getFirestore}) => {
    const playerId = getState().firebase.auth.uid;
    const fireStore = getFirestore();
    fireStore.collection('currentGames').doc(playerId).get().then((docRef) => {
      const gameId = docRef ? docRef.id : null;
      dispatch({type: 'GET_CURRENT_GAME', gameId})
    }).catch((err) => {
      dispatch({type: 'GET_CURRENT_GAME_ERROR', err});
    })
  }
}

const leaveWhilePending = (gameId, playerId, document, fireStore, gameServerUrl) => {
  return (dispatch, getState, {getFirestore}) => {
    const gameRef = fireStore.collection('games').doc(gameId);
    const game = document.data();
    let players = game.players

    fireStore.collection('currentGames').doc(playerId).get().then((cgDoc) => {
      const currentGameDatas = cgDoc.data()
      leaveServerInstance(gameServerUrl, 'res-arcana', currentGameDatas.gameCredentials).then(() => {
        
        // if game creator or the only left player in game, kick all players and delete game.
        const isGameCreator = (playerId === game.creatorId);
        const isTheOnlyPlayer = (Object.keys(players).length === 1 && Object.keys(players)[0] === playerId);
        if (isGameCreator || isTheOnlyPlayer) {
          let kicks = Object.keys(players).map((key) => {
            const playerCurrentGameRef = fireStore.collection('currentGames').doc(key);
            // check if player is synch with the game before kick
            return playerCurrentGameRef.get().then((currentGame) => {
              const cgDatas = currentGame.data()
              if(cgDatas.gameId === gameId) {
                let datas = {
                  gameId: null
                }
                if (key === game.creatorId) {
                  datas.gameCredentials = {}
                }
                playerCurrentGameRef.update(datas)
              }
            })
          })
          Promise.all(kicks).then(() => {
            dispatch(deleteGame(gameId));
          });
        // else just leave game
        } else {
          delete players[playerId];
          fireStore.collection('currentGames').doc(playerId).update({
            gameId: null,
            gameCredentials: {}
          })
          gameRef.update({players});
        }
      })
    })
  }
}

const leaveWhileStarted = (gameId, playerId, document, fireStore, gameServerUrl) => {
  return (dispatch, getState, {getFirestore}) => {
    // Todo
    dispatch(leaveWhilePending(gameId, playerId, document, fireStore, gameServerUrl));
  }
}

const leaveWhileOver = (gameId, playerId, document, fireStore, gameServerUrl) => {
  return (dispatch, getState, {getFirestore}) => {
    // Todo
    dispatch(leaveWhilePending(gameId, playerId, document, fireStore, gameServerUrl));
  }
}

const deleteGame = (gameId) => {
  return (dispatch, getState, {getFirestore}) => {
    const fireStore = getFirestore();
    const gameRef = fireStore.collection('games').doc(gameId);
    gameRef.delete().then(
      dispatch(deleteChat(gameId))
    ).catch(function(error) {
      console.error("Error deleting game: ", gameId, error);
    });
  }
}

export const deleteGameById = (gameId) => {
  return (dispatch, getState, {getFirestore}) => {
    const fireStore = getFirestore();
    const gameRef = fireStore.collection('games').doc(gameId);
    gameRef.get().then((document) => {
      let players = document.data().players
      let kicks = Object.keys(players).map((key) => {
        const playerCurrentGameRef = fireStore.collection('currentGames').doc(key);
        // check if player is synch with the game before kick
        return playerCurrentGameRef.get().then((currentGame) => {
          if(currentGame.data().gameId === gameId) {
            playerCurrentGameRef.update({
              gameId: null
            })
          }
        })
      })
      Promise.all(kicks).then(dispatch(deleteGame(gameId)));
    });
  }
}

export const startGame = (gameId)  => {
  return (dispatch, getState, {getFirestore}) => {
    const fireStore = getFirestore();
    fireStore.collection('games').doc(gameId).update({status: 'STARTED'})
      .then(()=>{
        dispatch({type: 'GAME_STARTED', gameId})
      })
  }
}

export const endGame = (gameId) => {
  return (dispatch, getState, { getFirestore}) => {
    const fireStore = getFirestore();
    fireStore.collection('games').doc(gameId).update({status: 'OVER'})
      .then(()=>{
        dispatch({type: 'GAME_OVER', gameId})
      })
  }
}

export const disjoinCurrentGame = () => {
  return (dispatch, getState, {getFirestore}) => {
    const fireStore = getFirestore();
    const creatorId = getState().firebase.auth.uid;
    // Set the current game for player
    const currentGameRef = fireStore.collection('currentGames').doc(creatorId)
    currentGameRef.get().then((document) => {
      const datas = document.data();
      datas.gameId = null;
      currentGameRef.set(datas);
      dispatch({type: 'LEAVE_CURRENT_GAME'})
    }).catch((err) => {
      dispatch({type: 'LEAVE_CURRENT_GAME_ERROR', err});
    })
  }
}

export const leaveServerInstance = async (gameServerUrl, gameName, gameCredentials) => {
  if(gameCredentials) {
    const promises = [];
    Object.keys(gameCredentials).forEach( (gameID) => {
      const resp = fetch(
        `${gameServerUrl || ''}/games/${gameName}/${gameID}/leave`,
        {
          method: 'POST',
          body: JSON.stringify({
            playerID: gameCredentials[gameID].playerId,
            playerCredentials: gameCredentials[gameID].credentials,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );
      promises.push(resp);
    });
    const ready = Promise.all(promises);
    ready.then(() => {
      return;
    })
  }
}


export const saveCredentials = (gameID, playerID, credentials) => {
  return (dispatch, getState, { getFirestore}) => {
    const fireStore = getFirestore();
    const playerId = getState().firebase.auth.uid;
    
    const currentGameRef = fireStore.collection('currentGames').doc(playerId)
    currentGameRef.get().then((document) => {
      const datas = document.data();
      let gameCredentials = datas.gameCredentials || {};
      gameCredentials[gameID] = {
        playerId: playerID,
        credentials: credentials
      };
      datas.gameCredentials = gameCredentials;
      currentGameRef.set(datas);
    });
  }
};

export const getComponents = () => {
  return (dispatch, getState, { getFirestore}) => {
    const fireStore = getFirestore();
    const components = {};
    
    fireStore.collection('components').get().then((snapshot) => {  
      snapshot.forEach(function(doc) {
        components[doc.id] = doc.data();
      })
    });
    return components;
  }
}

export function selectCard(card) {
  return {
      type: 'SELECT_CARD',
      card: card
  };
}

export function zoomCard(card) {
  return {
      type: 'ZOOM_CARD',
      card: card
  };
}

export function clearZoom() {
  return {
      type: 'CLEAR_ZOOM'
  };
}