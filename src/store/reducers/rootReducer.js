import authReducer from './authReducer'
import chatReducer from './chatReducer'
import editorReducer from './editorReducer'
import gameReducer from './gameReducer'
import lobbyReducer from './lobbyReducer'
import uiReducer from './uiReducer'
import { combineReducers } from 'redux'
import { firestoreReducer } from 'redux-firestore'
import { firebaseReducer } from 'react-redux-firebase'

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  editor: editorReducer,
  game: gameReducer,
  firestore: firestoreReducer,
  firebase: firebaseReducer,
  lobby: lobbyReducer,
  ui: uiReducer,
})

export default rootReducer

// the key name will be the data property on the state object
