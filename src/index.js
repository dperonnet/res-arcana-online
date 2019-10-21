
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import React from 'react'
import { render } from 'react-dom'
import { applyMiddleware, compose, createStore } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { createFirestoreInstance } from 'redux-firestore'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import registerServiceWorker from './registerServiceWorker'
import ResArcanaApp from './client/ResArcanaApp'
import { fbConfig } from './config/fbConfig'
import { rrfConfig } from './config/rrfConfig'
import { verifyAuth } from './store/actions/authActions'
import rootReducer from './store/reducers/rootReducer'

!firebase.apps.length ? firebase.initializeApp(fbConfig) : firebase.app()
firebase.firestore().settings({})

const store = createStore(rootReducer, compose(applyMiddleware(thunk)))

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance,
}

store.dispatch(verifyAuth())

function App() {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <ResArcanaApp />
      </ReactReduxFirebaseProvider>
    </Provider>
  )
}

render(<App />, document.getElementById('root'))
registerServiceWorker()
