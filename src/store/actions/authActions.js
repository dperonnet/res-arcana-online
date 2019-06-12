import { disjoinCurrentGame } from './gameActions';

export const signIn = (credentials) => {
  return (dispatch, getState, {getFirebase}) =>{
    const firebase = getFirebase();
    firebase.auth().signInWithEmailAndPassword(
      credentials.email,
      credentials.password
    ).then(()=>{
      dispatch(setUserStatus());
      dispatch(disjoinCurrentGame())
    }).then(()=>{
      dispatch({ type: 'LOGIN_SUCCESS' });
    }).catch((err)=>{
      dispatch({ type: 'LOGIN_ERROR', err});
    })
  }
}

export const signOut = () => {
  return ((dispatch, getState, {getFirebase}) =>{
    const firebase = getFirebase();

    firebase.auth().signOut().then(()=>{
      dispatch({ type: 'SIGNOUT_SUCCESS' });
    });
  })
}

export const register = (newUser) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase();
    const firestore = getFirestore();

    firebase.auth().createUserWithEmailAndPassword(
      newUser.email,
      newUser.password
    ).then((resp)=>{
      firestore.collection('users').doc(resp.user.uid).set({
        login: newUser.login,
        layout: 'vertical',
        cardSize: 'normal'
      });
      const initGame = {
        gameId: null,
        createdAt: new Date()
      };
      firestore.collection('currentGames').doc(resp.user.uid).set(initGame);
    }).then(()=>{
      dispatch({ type: 'REGISTER_SUCCESS' })
    }).catch((err)=>{
      dispatch({ type: 'REGISTER_FAIL', err})
    })
  }
}

export const verifyAuth = () => {
  return (dispatch, getState, {getFirebase}) => {
    getFirebase().auth().onAuthStateChanged(user => {
      if (user) {
        dispatch(setUserStatus());
      } else {
        dispatch(signOut());
      }
    })
  }
}

// Google presence
export const setUserStatus = () => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase();

    var uid = firebase.auth().currentUser.uid;

    var userStatusDatabaseRef = firebase.database().ref('/status/' + uid);
    var isOfflineForDatabase = {
        state: 'offline',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
    };
    var isOnlineForDatabase = {
        state: 'online',
        last_changed: firebase.database.ServerValue.TIMESTAMP,
    };

    firebase.database().ref('.info/connected').on('value', function(snapshot) {
      // If we're not currently connected, don't do anything.
      if (snapshot.val() === false) {
          return;
      };
      userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
          userStatusDatabaseRef.set(isOnlineForDatabase);
      });
    });

    var userStatusFirestoreRef = firebase.firestore().doc('/status/' + uid);
    var isOfflineForFirestore = {
        state: 'offline',
        last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    };
    var isOnlineForFirestore = {
        state: 'online',
        last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    };

    firebase.database().ref('.info/connected').on('value', function(snapshot) {
      if (snapshot.val() === false) {
          userStatusFirestoreRef.set(isOfflineForFirestore);
          return;
      };
      userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
          userStatusDatabaseRef.set(isOnlineForDatabase);
          userStatusFirestoreRef.set(isOnlineForFirestore);
      });
    });
  }
}

export const saveProfile = (profile) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firestore = getFirestore();
    const userId = getState().firebase.auth.uid;

    firestore.collection('users').doc(userId).update({
      cardSize: profile.cardSize || 'normal',
      layout: profile.layout || 'vertical'
    }).then(()=>{
      dispatch({ type: 'SAVE_PROFILE_SUCCESS' })
    }).catch((err)=>{
      dispatch({ type: 'SAVE_PROFIE_FAIL', err})
    })
  }
}
