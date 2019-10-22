import firebase from 'firebase/app'
import { createChat, deleteChat } from './chatActions'

const gameServerUrl = `http://${process.env.REACT_APP_GAME_SERVER_URL}`

export const createGameLobby = gameOptions => {
  return (dispatch, getState) => {
    const firestore = firebase.firestore()
    const profile = getState().firebase.profile
    const creatorId = getState().firebase.auth.uid

    let newGameLobby = {
      ...gameOptions,
      creatorName: profile.login,
      creatorId: creatorId,
      createdAt: new Date(),
      seats: [creatorId],
      players: {},
      spectators: {},
      status: 'PENDING',
    }
    newGameLobby.players[creatorId] = {
      inLobby: true,
      name: profile.login,
      ready: false,
    }
    for (let i = 1; i < gameOptions.numberOfPlayers; i++) {
      newGameLobby.seats[i] = -1
    }

    firestore
      .collection('gameLobbys')
      .add(newGameLobby)
      .then(gameLobby => {
        gameLobby.get().then(doc => {
          let setupData = doc.data().setupData
          setupData.chatId = gameLobby.id
          gameLobby.update({ setupData })
        })
        dispatch({ type: 'CREATE_GAME_LOBBY', gameLobby })
        dispatch(createChat(gameLobby.id, newGameLobby.gameDisplayName + ' Chat'))
        dispatch(takeSeat(gameLobby.id))
      })
      .catch(err => {
        dispatch({ type: 'CREATE_GAME_LOBBY_ERROR', err })
      })
  }
}

export const addSeat = lobbyId => {
  return dispatch => {
    const firestore = firebase.firestore()
    const lobbyRef = firestore.collection('gameLobbys').doc(lobbyId)

    firestore
      .runTransaction(transaction => {
        return transaction.get(lobbyRef).then(lobbyDoc => {
          if (!lobbyDoc.exists) {
            throw new Error('Document does not exist!')
          }

          let lobby = lobbyDoc.data()
          let seats = lobby.seats
          seats[seats.length] = -1
          let numberOfPlayers = seats.length
          return transaction.update(lobbyRef, { seats, numberOfPlayers })
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
  return dispatch => {
    const firestore = firebase.firestore()
    const lobbyRef = firestore.collection('gameLobbys').doc(lobbyId)

    firestore
      .runTransaction(transaction => {
        return transaction.get(lobbyRef).then(lobbyDoc => {
          if (!lobbyDoc.exists) {
            throw new Error('Document does not exist!')
          }

          let lobby = lobbyDoc.data()
          let seats = lobby.seats

          var indices = []
          var idx = seats.indexOf(-1)
          while (idx !== -1) {
            indices.push(idx)
            idx = seats.indexOf(-1, idx + 1)
          }

          // remove the last free seat if possible, else kick the last player
          if (indices.length > 0) {
            seats.splice(indices[indices.length - 1], 1)
          } else {
            for (let i = seats.length - 1; i >= 0; i--) {
              if (seats[i] !== lobby.creatorId) {
                seats.splice(i, 1)
                break
              }
            }
          }

          let numberOfPlayers = seats.length
          return transaction.update(lobbyRef, { seats, numberOfPlayers })
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
  return (dispatch, getState) => {
    const firestore = firebase.firestore()
    const profile = getState().firebase.profile
    const playerId = getState().firebase.auth.uid
    let canTakeSeat = false

    const lobbyRef = firestore.collection('gameLobbys').doc(lobbyId)

    firestore
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
            inLobby: true,
            name: profile.login,
            ready: false,
          }

          canTakeSeat = gameNotStarted && gameIsNotFull && takeSeat

          if (canTakeSeat) {
            // remove the player from seats
            for (let i = 0; i < seats.length; i++) {
              if (seats[i] === playerId) {
                seats[i] = -1
              }
            }

            // if player want an available seat
            if (seatIndex && seats[seatIndex] === -1) {
              seats[seatIndex] = playerId
              // else pick the first available seat
            } else {
              var availableSeat = seats.indexOf(-1)
              seats[availableSeat] = playerId
            }
          }

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
        firestore
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

export const deleteLobbyCloudFunction = lobbyId => {
  return dispatch => {
    dispatch(deleteLobbyCloudFunction(lobbyId))
    //dispatch(deleteLobbyFront(lobbyId))
  }
}

export const deleteLobby = lobbyId => {
  return dispatch => {
    const db = firebase.firestore()

    const lobbyRef = db.collection('gameLobbys').doc(lobbyId)
    db.runTransaction(async transaction => {
      let lobbyDoc = await transaction.get(lobbyRef)
      let lobby = lobbyDoc.data()
      // update the currentLobby of all players
      let reads = Object.keys(lobby.players).map(playerId => {
        let ref = db.collection('currentLobbys').doc(playerId)
        let data = {}
        return transaction.get(ref).then(doc => {
          if (doc.data().lobbyId === lobbyId) {
            data = { lobbyId: null }
          }
          return transaction.update(ref, data)
        })
      })
      await Promise.all(reads)
      await transaction.delete(lobbyRef)
      dispatch(deleteChat(lobbyId))
    })
      .then(() => {
        console.log('Transaction successfully committed!')
      })
      .catch(error => {
        console.log('Transaction failed: ', error)
      })
  }
}

export const leaveLobby = lobbyId => {
  return (dispatch, getState) => {
    const db = firebase.firestore()
    const playerId = getState().firebase.auth.uid

    const lobbyRef = db.collection('gameLobbys').doc(lobbyId)

    db.runTransaction(async transaction => {
      let lobbyDoc = await transaction.get(lobbyRef)
      let currentLobbyRef = db.collection('currentLobbys').doc(playerId)

      if (!lobbyDoc.exists) {
        transaction.delete(lobbyRef)
        return transaction.update(currentLobbyRef, { lobbyId: null })
      }
      let lobby = lobbyDoc.data()

      // remove the player from players
      let players = lobby.players
      players[playerId].inLobby = false

      // Update the current lobby and the credentials of the player
      let doc = await transaction.get(currentLobbyRef)
      let currentLobby = doc.data()
      let gameCredentials = currentLobby.gameCredentials
      let seats = lobby.seats

      // If the game has not started yet,
      if (lobby.status !== 'PENDING') {
        if (seats.includes(playerId) && gameCredentials[lobby.boardGameId]) {
          let leaveResp = await fetch(gameServerUrl + '/games/' + lobby.gameName + '/' + lobby.boardGameId + '/leave', {
            method: 'POST',
            body: JSON.stringify({
              playerID: gameCredentials[lobby.boardGameId].id,
              credentials: gameCredentials[lobby.boardGameId].playerCredentials,
            }),
            headers: { 'Content-Type': 'application/json' },
          })
          if (leaveResp.status !== 200 && leaveResp.status !== 404) {
            throw new Error('HTTP status ' + leaveResp.status)
          }
        }
      } else {
        // remove the player from seats
        for (let i = 0; i < seats.length; i++) {
          if (seats[i] === playerId) {
            seats[i] = -1
          }
        }
      }

      delete gameCredentials[lobby.boardGameId]
      let lobbyId = null
      transaction.update(currentLobbyRef, { gameCredentials, lobbyId })

      if (Object.values(players).filter(player => player.inLobby).length === 0) {
        console.log('players in game:', players)
        transaction.delete(lobbyRef)
      } else {
        console.log('players list is empty')
        transaction.update(lobbyRef, { players, seats })
      }
      return lobby
    })
      .then(() => {
        dispatch({ type: 'LEAVE_GAME_LOBBY', lobbyId })
      })
      .catch(err => {
        dispatch({ type: 'LEAVE_GAME_LOBBY_ERROR', err })
      })
  }
}

export const setReady = lobbyId => {
  return (dispatch, getState) => {
    const firestore = firebase.firestore()
    const playerId = getState().firebase.auth.uid

    const lobbyRef = firestore.collection('gameLobbys').doc(lobbyId)

    firestore
      .runTransaction(async transaction => {
        return transaction.get(lobbyRef).then(lobbyDoc => {
          if (!lobbyDoc.exists) {
            throw new Error('Document does not exist!')
          }
          let lobby = lobbyDoc.data()

          let gameNotStarted = lobby.status === 'PENDING'
          let players = lobby.players
          if (gameNotStarted) {
            players[playerId].ready = !players[playerId].ready
          }
          transaction.update(lobbyRef, { players })
        })
      })
      .then(() => {
        dispatch({ type: 'SET_READY', lobbyId })
      })
      .catch(err => {
        dispatch({ type: 'SET_READY_ERROR', err })
      })
  }
}

export const startGame = lobbyId => {
  return (dispatch, getState) => {
    const db = firebase.firestore()
    const userId = getState().firebase.auth.uid

    return db.runTransaction(async transaction => {
      let lobbyRef = db.doc(`gameLobbys/${lobbyId}`)
      let lobbyDoc = await transaction.get(lobbyRef)
      let lobby = lobbyDoc.data()

      if (lobby.creatorId !== userId) {
        throw new Error('invalid-argument', 'Only the creator of the lobbt or an admin can start this game.')
      }
      if (lobby.status !== 'PENDING')
        throw new Error('This game cannot be started because game status is', lobby.status)

      let players = lobby.players
      let seats = lobby.seats.filter(playerId => playerId !== -1)
      let numberOfPlayers = seats.length

      // check game metadata
      let metadata = await db.doc(`games_metadata/${lobby.gameName}`).get()

      if (!metadata) throw new Error('This game was not found.')

      if (numberOfPlayers < metadata.minPlayers || numberOfPlayers > metadata.maxPlayers)
        throw new Error('Invalid number of players ' + numberOfPlayers)

      let createResp = await fetch(gameServerUrl + '/games/' + lobby.gameName + '/create', {
        method: 'POST',
        body: JSON.stringify({
          numPlayers: numberOfPlayers,
          setupData: lobby.setupData,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (createResp.status !== 200) {
        throw new Error('HTTP status ' + createResp.status)
      }

      let gameData = await createResp.json()
      let boardGameId = gameData.gameID

      const credentials = seats.map(async (playerId, seatId) => {
        console.log('playerId', playerId, 'seatId', seatId)
        let joinResp = await fetch(gameServerUrl + '/games/' + lobby.gameName + '/' + boardGameId + '/join', {
          method: 'POST',
          body: JSON.stringify({
            playerID: seatId,
            playerName: players[playerId].name,
          }),
          headers: { 'Content-Type': 'application/json' },
        })
        if (joinResp.status !== 200) {
          throw new Error('HTTP status ' + joinResp.status)
        }
        let joinJson = await joinResp.json()
        let currentLobbyRef = db.collection('currentLobbys').doc(playerId)
        return transaction.get(currentLobbyRef).then(doc => {
          let gameCredentials = doc.data().gameCredentials
          gameCredentials[boardGameId] = joinJson
          gameCredentials[boardGameId].gameName = lobby.gameName
          gameCredentials[boardGameId].gameDisplayName = lobby.gameDisplayName
          gameCredentials[boardGameId].id = seatId
          gameCredentials[boardGameId].name = players[playerId].name
          return transaction.update(currentLobbyRef, { gameCredentials })
        })
      })

      await Promise.all(credentials)

      let status = 'STARTED'
      return transaction.update(lobbyRef, { boardGameId, numberOfPlayers, seats, status })
    })
  }
}
