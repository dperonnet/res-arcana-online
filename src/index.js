import React from 'react';
import ReactDOM from 'react-dom';
import ResArcanaApp from './client/ResArcanaApp';
import registerServiceWorker from './registerServiceWorker';
import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from './store/reducers/rootReducer'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { reduxFirestore, getFirestore } from 'redux-firestore';
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase';
import fbConfig from './config/fbConfig'

const rrfConfig = {
  attachAuthIsReady: true,
  userProfile :'users', // where profiles are stored in database
  useFirestoreForProfile: true,
  presence: 'presence', // where list of online users is stored in database
  sessions: 'sessions' // where list of user sessions is stored in database (presence must be enabled)
}

const store = createStore(rootReducer,
  compose(
    applyMiddleware(thunk.withExtraArgument({getFirebase, getFirestore})),
    reduxFirestore(fbConfig),
    reactReduxFirebase(fbConfig, rrfConfig)
  )
);

store.firebaseAuthIsReady.then(()=>{
  ReactDOM.render(
    <Provider store={store}><ResArcanaApp /></Provider>,
    document.getElementById('root'));
  registerServiceWorker();
})
