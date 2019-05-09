import React from 'react';
import ReactDOM from 'react-dom';
import ResArcanaApp from './client/ResArcanaApp';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { fbConfig } from './config/fbConfig'
import { ReactReduxFirebaseProvider, getFirebase } from 'react-redux-firebase'
import { createFirestoreInstance, reduxFirestore, getFirestore } from 'redux-firestore';
import { verifyAuth } from './store/actions/authActions';
import rootReducer from './store/reducers/rootReducer'

firebase.initializeApp(fbConfig)
firebase.firestore().settings({ });

const middleware = [
  thunk.withExtraArgument({ getFirestore }),
];

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(...middleware,thunk.withExtraArgument(getFirebase)),
    reduxFirestore(fbConfig),
  )
);

const rrfConfig = {
  attachAuthIsReady: true,
  userProfile :'users', // where profiles are stored in database
  useFirestoreForProfile: true
}

const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance
}

store.dispatch(verifyAuth());

store.firebaseAuthIsReady.then(()=>{
  ReactDOM.render(
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <ResArcanaApp />
      </ReactReduxFirebaseProvider>
    </Provider>,
    document.getElementById('root'));
  registerServiceWorker();
})
