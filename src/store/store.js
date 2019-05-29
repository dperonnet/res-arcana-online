
import { createStore, applyMiddleware, compose } from 'redux'
import { reduxFirestore, getFirestore } from 'redux-firestore';
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase';
import thunk from 'redux-thunk'
import { firebase } from '../config/fbConfig';
import rootReducer from './reducers/rootReducer';

const rrfConfig = {
  attachAuthIsReady: true,
  userProfile :'users', // where profiles are stored in database
  useFirestoreForProfile: true,
  presence: 'presence', // where list of online users is stored in database
  sessions: 'sessions' // where list of user sessions is stored in database (presence must be enabled)
}

export const store = createStore(rootReducer,
  compose(
    applyMiddleware(thunk.withExtraArgument({getFirebase, getFirestore})),
    reduxFirestore(firebase),
    reactReduxFirebase(firebase, rrfConfig)
  )
);