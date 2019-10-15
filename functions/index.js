const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore()

// Create a new function which is triggered on changes to /status/{uid}
// Note: This is a Realtime Database trigger, *not* Cloud Firestore.
exports.onUserStatusChanged = functions
  .region('europe-west1')
  .database.ref('/status/{uid}')
  .onUpdate((change, context) => {
    // Get the data written to Realtime Database
    const eventStatus = change.after.val()

    // Then use other event data to create a reference to the
    // corresponding Firestore document.
    const userStatusFirestoreRef = firestore.doc(`users/${context.params.uid}`)

    // It is likely that the Realtime Database change that triggered
    // this event has already been overwritten by a fast change in
    // online / offline status, so we'll re-read the current data
    // and compare the timestamps.
    return change.after.ref.once('value').then(statusSnapshot => {
      const status = statusSnapshot.val()
      console.log(status, eventStatus)
      // If the current timestamp for this data is newer than
      // the data that triggered this event, we exit this function.
      if (status.last_changed > eventStatus.last_changed) {
        return null
      }

      // Otherwise, we convert the last_changed field to a Date
      eventStatus.last_changed = new Date(eventStatus.last_changed)

      // ... and write it to Firestore.
      return userStatusFirestoreRef.update(eventStatus)
    })
  })

exports.deleteLobby = functions.region('europe-west1').https.onCall((data, context) => {
  console.log('1) call to deleteLobby cloud function', data)
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }

  const lobbyId = data.lobbyId
  const userId = context.auth.uid

  firestore.runTransaction(transaction => {
    let lobbyRef = firestore.doc(`gameLobbys/${lobbyId}`)
    return transaction
      .get(lobbyRef)
      .then(lobbyDoc => {
        let lobby = lobbyDoc.data()
        console.log('lobby.creatorId', lobby.creatorId, 'userId', userId)
        if (lobby.creatorId !== userId) {
          throw new functions.https.HttpsError(
            'invalid-argument',
            'Only the lobby s creator or an admin can delete this lobby.'
          )
        }
        console.log('2) players', lobby.players, lobby)
        return lobby.players
      })
      .then(players => {
        let reads = Object.keys(players).map(playerId => {
          let ref = firestore.collection('currentLobbys').doc(playerId)
          return transaction.get(ref).then(doc => {
            let currentLobbyId = doc.data().lobbyId
            if (doc.data().lobbyId === currentLobbyId) {
              console.log('3) kick player', doc)
              currentLobbyId = null
            }
            return transaction.update(ref, { lobbyId: currentLobbyId })
          })
        })
        return Promise.all(reads).then(() => {
          console.log('4) delete lobby', lobbyRef)
          return transaction.delete(lobbyRef)
        })
      })
      .then(() => {
        console.log('Transaction successfully committed!')
      })
      .catch(error => {
        console.log('Transaction failed: ', error)
      })
  })
})

exports.startGame = functions.https.onCall((data, context) => {
  console.log('1) call to startGame cloud function', data)
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }

  const lobbyId = data.lobbyId
  const userId = context.auth.uid

  firestore
    .runTransaction(transaction => {
      ;async () => {
        try {
          let lobbyRef = firestore.doc(`gameLobbys/${lobbyId}`)
          let lobbyDoc = await transaction.get(lobbyRef)
          let lobby = lobbyDoc.data()
          if (lobby.creatorId !== userId) {
            throw new functions.https.HttpsError(
              'invalid-argument',
              'Only the lobby s creator or an admin can start this game.'
            )
          }

          // check game metadata
          let metadataRef = firestore.doc(`games_metadata/${lobby.gameName}`)
          let metadata = await transaction.get(metadataRef).then(doc => {
            return doc.data()
          })

          if (!metadata) throw new Error('game not found')

          if (lobby.numberOfPlayers < metadata.minPlayers || lobby.numberOfPlayers > metadata.maxPlayers)
            throw new Error('invalid number of players ' + lobby.numberOfPlayers)

          let createResp = await fetch(this._baseUrl() + '/' + lobby.gameName + '/create', {
            method: 'POST',
            body: JSON.stringify({
              numPlayers: lobby.numberOfPlayers,
              setupData: lobby.setupData,
            }),
            headers: { 'Content-Type': 'application/json' },
          })
          if (createResp.status !== 200) throw new Error('HTTP status ' + createResp.status)

          let gameData = await createResp.json()
          let boardGameId = gameData.gameID
          await transaction.update(lobbyRef, { boardGameId })

          let players = lobby.players
          let seats = lobby.seats

          seats.forEach(async (playerId, seatId) => {
            players[playerId].name

            let joinResp = await fetch(this._baseUrl() + '/' + lobby.gameName + '/' + boardGameId + '/join', {
              method: 'POST',
              body: JSON.stringify({
                playerID: seatId,
                playerName: players[playerId].name,
              }),
              headers: { 'Content-Type': 'application/json' },
            })
            if (joinResp.status !== 200) throw new Error('HTTP status ' + joinResp.status)
            let joinJson = await joinResp.json()
            let currentLobbyRef = firestore.collection('currentLobbys').doc(playerId)
            await transaction.get(currentLobbyRef).then(doc => {
              let player = doc.data()
              player.gameCredentials[lobbyId] = joinJson
              return transaction.update(currentLobbyRef, player)
            })
          })
        } catch (error) {
          throw new Error('failed to start game ' + data.gameName + ' (' + error + ')')
        }
      }
    })
    .catch(err => {
      throw new functions.https.HttpsError('unknown', err.message, err)
    })
})
