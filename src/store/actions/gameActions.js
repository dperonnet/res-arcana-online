import firebase from 'firebase/app'
import { deleteChat } from './chatActions'

export const createAndJoinGame = game => {
  return (dispatch, getState) => {
    // make asynch call to database
    const firestore = firebase.firestore()
    const profile = getState().firebase.profile
    const creatorId = getState().firebase.auth.uid
    firestore
      .collection('games')
      .add({
        ...game,
        gameCreator: profile.login,
        creatorId: creatorId,
        createdAt: new Date(),
        status: 'PENDING',
      })
      .then(docRef => {
        firestore
          .collection('games')
          .doc(docRef.uid)
          .get()
          .then(doc => {
            dispatch({ type: 'CREATE_GAME', doc })
            //dispatch(joinGame(doc.id, joinServerGame, gameServerUrl));
          })
      })
      .catch(err => {
        dispatch({ type: 'CREATE_GAME_ERROR', err })
      })
  }
}

export const leaveGame = (gameId, gameServerUrl) => {
  return (dispatch, getState) => {
    const firestore = firebase.firestore()
    const playerId = getState().firebase.auth.uid
    const gameRef = firestore.collection('games').doc(gameId)

    gameRef.get().then(document => {
      let status = document.exists ? document.data().status : null
      switch (status) {
        // leave before game Start
        case 'PENDING':
          dispatch(leaveWhilePending(gameId, playerId, document, gameServerUrl))
          break
        // leave while game is still running
        case 'STARTED':
          dispatch(leaveWhileStarted(gameId, playerId, document, gameServerUrl))
          break
        // leave when game is over
        case 'OVER':
          dispatch(leaveWhileOver(gameId, playerId, document, gameServerUrl))
          break
        default:
      }
      dispatch(disjoinCurrentGame())
    })
  }
}

export const getCurrentGameId = () => {
  return (dispatch, getState) => {
    const playerId = getState().firebase.auth.uid
    const firestore = firebase.firestore()
    firestore
      .collection('currentGames')
      .doc(playerId)
      .get()
      .then(docRef => {
        const gameId = docRef ? docRef.id : null
        dispatch({ type: 'GET_CURRENT_GAME', gameId })
      })
      .catch(err => {
        dispatch({ type: 'GET_CURRENT_GAME_ERROR', err })
      })
  }
}

const leaveWhilePending = (gameId, playerId, document, gameServerUrl) => {
  return dispatch => {
    const firestore = firebase.firestore()
    const gameRef = firestore.collection('games').doc(gameId)
    const game = document.data()
    let players = game.players

    firestore
      .collection('currentGames')
      .doc(playerId)
      .get()
      .then(cgDoc => {
        const currentGameDatas = cgDoc.data()
        leaveServerInstance(gameServerUrl, 'res-arcana', currentGameDatas.gameCredentials).then(() => {
          // if game creator or the only left player in game, kick all players and delete game.
          const isGameCreator = playerId === game.creatorId
          const isTheOnlyPlayer = Object.keys(players).length === 1 && Object.keys(players)[0] === playerId
          if (isGameCreator || isTheOnlyPlayer) {
            let kicks = Object.keys(players).map(key => {
              const playerCurrentGameRef = firestore.collection('currentGames').doc(key)
              // check if player is synch with the game before kick
              return playerCurrentGameRef.get().then(currentGame => {
                const cgDatas = currentGame.data()
                if (cgDatas.gameId === gameId) {
                  let datas = {
                    gameId: null,
                  }
                  if (key === game.creatorId) {
                    datas.gameCredentials = {}
                  }
                  playerCurrentGameRef.update(datas)
                }
              })
            })
            Promise.all(kicks).then(() => {
              dispatch(deleteGame(gameId))
            })
            // else just leave game
          } else {
            delete players[playerId]
            firestore
              .collection('currentGames')
              .doc(playerId)
              .update({
                gameId: null,
                gameCredentials: {},
              })
            gameRef.update({ players })
          }
        })
      })
  }
}

const leaveWhileStarted = (gameId, playerId, document, gameServerUrl) => {
  return dispatch => {
    // Todo
    dispatch(leaveWhilePending(gameId, playerId, document, gameServerUrl))
  }
}

const leaveWhileOver = (gameId, playerId, document, gameServerUrl) => {
  return dispatch => {
    // Todo
    dispatch(leaveWhilePending(gameId, playerId, document, gameServerUrl))
  }
}

const deleteGame = gameId => {
  return dispatch => {
    const firestore = firebase.firestore()
    const gameRef = firestore.collection('games').doc(gameId)
    gameRef
      .delete()
      .then(dispatch(deleteChat(gameId)))
      .catch(function(error) {
        console.error('Error deleting game: ', gameId, error)
      })
  }
}

export const deleteGameById = gameId => {
  return dispatch => {
    const firestore = firebase.firestore()
    const gameRef = firestore.collection('games').doc(gameId)
    gameRef.get().then(document => {
      let players = document.data().players
      let kicks = Object.keys(players).map(key => {
        const playerCurrentGameRef = firestore.collection('currentGames').doc(key)
        // check if player is synch with the game before kick
        return playerCurrentGameRef.get().then(currentGame => {
          if (currentGame.data().gameId === gameId) {
            playerCurrentGameRef.update({
              gameId: null,
            })
          }
        })
      })
      Promise.all(kicks).then(dispatch(deleteGame(gameId)))
    })
  }
}

export const startGame = gameId => {
  return dispatch => {
    const firestore = firebase.firestore()
    firestore
      .collection('games')
      .doc(gameId)
      .update({ status: 'STARTED' })
      .then(() => {
        dispatch({ type: 'GAME_STARTED', gameId })
      })
  }
}

export const endGame = gameId => {
  return dispatch => {
    const firestore = firebase.firestore()
    firestore
      .collection('games')
      .doc(gameId)
      .update({ status: 'OVER' })
      .then(() => {
        dispatch({ type: 'GAME_OVER', gameId })
      })
  }
}

export const disjoinCurrentGame = () => {
  return (dispatch, getState) => {
    const firestore = firebase.firestore()
    const creatorId = getState().firebase.auth.uid
    // Set the current game for player
    const currentGameRef = firestore.collection('currentGames').doc(creatorId)
    currentGameRef
      .get()
      .then(document => {
        const datas = document.data()
        datas.gameId = null
        currentGameRef.set(datas)
        dispatch({ type: 'LEAVE_CURRENT_GAME' })
      })
      .catch(err => {
        dispatch({ type: 'LEAVE_CURRENT_GAME_ERROR', err })
      })
  }
}

export const leaveServerInstance = async (gameServerUrl, gameName, gameCredentials) => {
  if (gameCredentials) {
    const promises = []
    Object.keys(gameCredentials).forEach(gameID => {
      const resp = fetch(`${gameServerUrl || ''}/games/${gameName}/${gameID}/leave`, {
        method: 'POST',
        body: JSON.stringify({
          playerID: gameCredentials[gameID].playerId,
          credentials: gameCredentials[gameID].credentials,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      promises.push(resp)
    })
    const ready = Promise.all(promises)
    ready.then(() => {
      return
    })
  }
}

export const saveCredentials = (gameID, playerID, credentials) => {
  return (dispatch, getState) => {
    const firestore = firebase.firestore()
    const playerId = getState().firebase.auth.uid

    const currentGameRef = firestore.collection('currentGames').doc(playerId)
    currentGameRef.get().then(document => {
      const datas = document.data()
      let gameCredentials = datas.gameCredentials || {}
      gameCredentials[gameID] = {
        playerId: playerID,
        credentials: credentials,
      }
      datas.gameCredentials = gameCredentials
      currentGameRef.set(datas)
    })
  }
}

export const getComponents = () => {
  return () => {
    const firestore = firebase.firestore()
    const components = {}

    firestore
      .collection('components')
      .get()
      .then(snapshot => {
        snapshot.forEach(function(doc) {
          components[doc.id] = doc.data()
        })
      })
    return components
  }
}

export function selectComponent(component) {
  return {
    type: 'SELECT_COMPONENT',
    component,
  }
}

export function targetComponent(component) {
  return {
    type: 'TARGET_COMPONENT',
    component,
  }
}

export function zoomCard(card) {
  return {
    type: 'ZOOM_CARD',
    card,
  }
}

export function clearZoom() {
  return {
    type: 'CLEAR_ZOOM',
  }
}

export function tapComponent(card) {
  return {
    type: 'TAP_COMPONENT',
    card,
  }
}

export function resetCollect() {
  return {
    type: 'RESET_COLLECT',
  }
}

export function resetCollectAction(id) {
  console.log('reset', id)
  return {
    type: 'RESET_COLLECT_ACTION',
    id,
  }
}

export function setCollectAction(action) {
  return {
    type: 'SET_COLLECT_ACTION',
    action,
  }
}

export function resetCollectOnComponentAction(id) {
  return {
    type: 'RESET_COLLECT_ON_COMPONENT_ACTION',
    id,
  }
}
export function setCollectOnComponentAction(action) {
  return {
    type: 'SET_COLLECT_ON_COMPONENT_ACTION',
    action,
  }
}

export function setFocusZoom(flag) {
  return {
    type: 'SET_FOCUS_ZOOM',
    flag,
  }
}

export function selectAction(action) {
  return {
    type: 'SET_ACTION',
    action,
  }
}

export function selectActionPower(index) {
  return {
    type: 'SET_ACTION_POWER',
    actionPowerIndex: index,
  }
}

export function resetEssencePickerSelection(selectionType) {
  return {
    type: 'RESET_ESSENCE_PICKER',
    selectionType,
  }
}

export function addToEssencePickerSelection(selectionType, essenceType) {
  return {
    type: 'ADD_ESSENCE_TO_SELECTION',
    selectionType,
    essenceType,
  }
}

export function setEssencePickerSelection(selectionType, essenceSelection) {
  return {
    type: 'SET_ESSENCE_SELECTION',
    selectionType,
    essenceSelection,
  }
}

export function canPayCost(info) {
  return {
    type: 'CAN_PAY_COST',
    info,
  }
}

export function toggleCommonBoard() {
  return {
    type: 'TOGGLE_COMMON_BOARD',
  }
}

export function delayAction(fn) {
  return {
    type: 'DELAY_ACTION',
    fn,
  }
}
