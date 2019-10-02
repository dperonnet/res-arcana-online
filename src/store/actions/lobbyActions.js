import { createChat, deleteChat } from './chatActions'
import axios from 'axios'
require('firebase/functions')

const cloudFunctionsUrl = `https://${process.env.REACT_APP_CLOUD_FUNCTION}`

export const createGameLobby = gameOptions => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const fireStore = getFirestore()
    const profile = getState().firebase.profile
    const creatorId = getState().firebase.auth.uid

    let newGameLobby = {
      ...gameOptions,
      gameCreator: profile.login,
      creatorId: creatorId,
      createdAt: new Date(),
      seats: [creatorId],
      players: {},
      spectators: {},
      status: 'PENDING',
    }
    for (let i = 1; i < gameOptions.numberOfPlayers; i++) {
      newGameLobby.seats[i] = -1
    }

    fireStore
      .collection('gameLobbys')
      .add(newGameLobby)
      .then(gameLobby => {
        dispatch({ type: 'CREATE_GAME_LOBBY', gameLobby })
        dispatch(createChat(gameLobby.id, newGameLobby.name + ' Chat'))
        dispatch(takeSeat(gameLobby.id))
      })
      .catch(err => {
        dispatch({ type: 'CREATE_GAME_LOBBY_ERROR', err })
      })
  }
}

export const addSeat = lobbyId => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const fireStore = getFirestore()
    const lobbyRef = fireStore.collection('gameLobbys').doc(lobbyId)

    fireStore
      .runTransaction(transaction => {
        return transaction.get(lobbyRef).then(lobbyDoc => {
          if (!lobbyDoc.exists) {
            throw new Error('Document does not exist!')
          }

          let lobby = lobbyDoc.data()
          let seats = lobby.seats
          seats[seats.length] = -1
          transaction.update(lobbyRef, { seats })
        })
      })
      .then(() => {
        dispatch({ type: 'ADD_SEAT_IN_LOBBY', lobbyId })
      })
      .catch(err => {
        dispatch({ type: 'ADD_SEAT_IN_LOBBY_ERROR', err })
      })
  }
}

export const removeSeat = lobbyId => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const fireStore = getFirestore()
    const lobbyRef = fireStore.collection('gameLobbys').doc(lobbyId)

    fireStore
      .runTransaction(transaction => {
        return transaction.get(lobbyRef).then(lobbyDoc => {
          if (!lobbyDoc.exists) {
            throw new Error('Document does not exist!')
          }

          let lobby = lobbyDoc.data()
          let seats = lobby.seats
          for (let i = seats.length; i > 0; i--) {
            seats[seats.length] = -1
          }
          var indices = []
          var idx = seats.indexOf(-1)
          while (idx !== -1) {
            indices.push(idx)
            idx = seats.indexOf(-1, idx + 1)
          }

          // remove the last free seat if possible, else kick the last player
          if (indices.length > 0) {
            seats.splice(indices[indices.length], 1)
          } else {
            seats.splice(seats[seats.length], 1)
          }

          transaction.update(lobbyRef, { seats })
        })
      })
      .then(() => {
        dispatch({ type: 'REMOVE_SEAT_IN_LOBBY', lobbyId })
      })
      .catch(err => {
        dispatch({ type: 'REMOVE_SEAT_IN_LOBBY_ERROR', err })
      })
  }
}

export const takeSeat = (lobbyId, seatIndex) => {
  return dispatch => {
    dispatch(joinLobby(lobbyId, true, seatIndex))
  }
}

export const watchGame = lobbyId => {
  return dispatch => {
    dispatch(joinLobby(lobbyId, false))
  }
}

/**
 * Add the currrent player to the lobby players/spectators list.
 *
 * @param {*} lobbyId
 * @param {*} takeSeat
 * @param {*} seatIndex
 */
export const joinLobby = (lobbyId, takeSeat, seatIndex) => {
  return (dispatch, getState, { getFirestore }) => {
    const fireStore = getFirestore()
    const profile = getState().firebase.profile
    const playerId = getState().firebase.auth.uid
    let canTakeSeat = false

    const lobbyRef = fireStore.collection('gameLobbys').doc(lobbyId)

    fireStore
      .runTransaction(transaction => {
        return transaction.get(lobbyRef).then(lobbyDoc => {
          if (!lobbyDoc.exists) {
            throw new Error('Document does not exist!')
          }
          let lobby = lobbyDoc.data()

          let players = lobby.players
          let seats = lobby.seats
          let gameNotStarted = lobby.status === 'PENDING'
          let gameIsNotFull = seats.includes(-1)
          // Add the player to the players list
          players[playerId] = {
            name: profile.login,
          }

          console.log('Can Player take seat ?', gameNotStarted, gameIsNotFull, takeSeat)
          canTakeSeat = gameNotStarted && gameIsNotFull && takeSeat

          // remove the player from seats
          for (let i = 0; i < seats.length; i++) {
            if (seats[i] === playerId) {
              seats[i] = -1
            }
          }

          if (canTakeSeat) {
            // if player want an available seat
            if (seatIndex && seats[seatIndex] === -1) {
              seats[seatIndex] = playerId
              // else pick the first available seat
            } else {
              var availableSeat = seats.indexOf(-1)
              seats[availableSeat] = playerId
            }
          }

          console.log('transaction', lobbyRef, { players, seats })
          transaction.update(lobbyRef, { players, seats })
        })
      })
      .then(() => {
        // Set the current lobby for player
        const datas = {
          lobbyId: lobbyId,
          createdAt: new Date(),
          gameCredentials: {},
        }
        fireStore
          .collection('currentLobbys')
          .doc(playerId)
          .set(datas)
        dispatch({ type: 'JOIN_GAME_LOBBY', lobbyId })
      })
      .catch(err => {
        dispatch({ type: 'JOIN_GAME_LOBBY_ERROR', err })
      })
  }
}

export const deleteLobby = lobbyId => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const deleteUrl = cloudFunctionsUrl + '/deleteLobby'
    console.log('call to deleteLobby', lobbyId, deleteUrl)

    let deleteLobby = getFirebase()
      .functions()
      .httpsCallable('deleteLobby')

    deleteLobby({ lobbyId })
      .then(function(result) {
        console.log('result', result)
        //dispatch(deleteChat(lobbyId))
      })
      .catch(function(error) {
        console.log('Error when calling deleteLobby', error)
      })

    /*
    getFirebase().auth().currentUser.getIdToken().then(function(token) {
      axios({
        method: 'post',
        url: deleteUrl,
        headers: {
          'content-type': 'application/json',
          'Authorization': "bearer " + token
        },
        data: {
          data: {
            lobbyId
          }
        }
      }).then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    })
    */
  }
}

export const leaveLobby = lobbyId => {
  return (dispatch, getState, { getFirestore }) => {
    const fireStore = getFirestore()
    const playerId = getState().firebase.auth.uid

    const lobbyRef = fireStore.collection('gameLobbys').doc(lobbyId)

    fireStore
      .runTransaction(transaction => {
        return transaction.get(lobbyRef).then(lobbyDoc => {
          if (!lobbyDoc.exists) {
            throw new Error('Document does not exist!')
          }
          let lobby = lobbyDoc.data()

          // remove the player from players
          let players = lobby.players
          delete players[playerId]

          // remove the player from seats
          let seats = lobby.seats
          for (let i = 0; i < seats.length; i++) {
            if (seats[i] === playerId) {
              seats[i] = -1
            }
          }
          console.log('transaction', lobbyRef, { players, seats })
          transaction.update(lobbyRef, { players, seats })
        })
      })
      .then(() => {
        // Set the current lobby for player
        const datas = {
          lobbyId: null,
          createdAt: new Date(),
          gameCredentials: {},
        }
        fireStore
          .collection('currentLobbys')
          .doc(playerId)
          .set(datas)
        dispatch({ type: 'JOIN_GAME_LOBBY', lobbyId })
      })
      .catch(err => {
        dispatch({ type: 'JOIN_GAME_LOBBY_ERROR', err })
      })

    /*
    lobbyRef.get().then((document) => {
      let status = document.exists ? document.data().status : null;
      //dispatch(leaveCurrentLobby());
      switch (status) {
        // leave before game Start
        case 'PENDING':
          //dispatch(leaveWhilePending(lobbyId, playerId, document, fireStore, gameServerUrl));
          break;
        // leave while game is still running
        case 'STARTED':
          break;
        // leave when game is over
        case 'OVER':
          //dispatch(leaveWhileOver(lobbyId, playerId, document, fireStore, gameServerUrl));
          break;
        default:
      }
    });*/
  }
}

export const startGame = lobbyId => {
  return dispatch => {
    console.log('Call to cloud function start game', lobbyId)
  }
}
