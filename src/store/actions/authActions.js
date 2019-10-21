import firebase from 'firebase/app'

export const signIn = credentials => {
  return dispatch => {
    const firestore = firebase.firestore()

    if (credentials.name) {
      firestore
        .collection('users')
        .where('login', '==', credentials.name)
        .get()
        .then(users => {
          let newCredentials = { ...credentials }
          users.forEach(function(doc) {
            newCredentials.email = doc.data().email
          })
          dispatch(signInWithEmailAndPassword(newCredentials))
        })
        .catch(err => {
          console.log('err', err)
          dispatch({ type: 'GET_USER_FAIL', err })
        })
    } else {
      dispatch(signInWithEmailAndPassword(credentials))
    }
  }
}

export const signInWithEmailAndPassword = credentials => {
  return dispatch => {
    firebase
      .auth()
      .signInWithEmailAndPassword(credentials.email, credentials.password)
      .then(() => {
        dispatch(setUserStatus())
      })
      .then(() => {
        dispatch({ type: 'LOGIN_SUCCESS' })
      })
      .catch(err => {
        console.log('error', err)
        dispatch({ type: 'LOGIN_ERROR', err })
      })
  }
}

export const signOut = () => {
  return dispatch => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch({ type: 'SIGNOUT_SUCCESS' })
      })
  }
}

export const validateAndRegister = newUser => {
  return dispatch => {
    const firestore = firebase.firestore()

    firestore
      .collection('users')
      .where('login', '==', newUser.login)
      .get()
      .then(res => {
        if (!res || res.size === 0) {
          dispatch(register(newUser))
        } else {
          dispatch({ type: 'GET_USER_SUCCESS', user: res })
        }
      })
      .catch(err => {
        dispatch({ type: 'GET_USER_FAIL', err })
      })
  }
}

export const register = newUser => {
  return dispatch => {
    const firestore = firebase.firestore()

    firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
      .then(resp => {
        var user = firebase.auth().currentUser
        user.updateProfile({
          displayName: newUser.login,
        })
        firestore
          .collection('users')
          .doc(resp.user.uid)
          .set({
            email: newUser.email,
            login: newUser.login,
            layout: 'vertical',
            cardSize: 'normal',
            createdAt: new Date(),
          })
        const initGame = {
          gameId: null,
          createdAt: new Date(),
        }
        firestore
          .collection('currentGames')
          .doc(resp.user.uid)
          .set(initGame)
      })
      .then(() => {
        dispatch({ type: 'REGISTER_SUCCESS' })
      })
      .catch(err => {
        dispatch({ type: 'REGISTER_FAIL', err })
      })
  }
}

export const verifyAuth = () => {
  return dispatch => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        dispatch(setUserStatus())
      } else {
        dispatch(signOut())
      }
    })
  }
}

// Google presence
export const setUserStatus = () => {
  return () => {
    var uid = firebase.auth().currentUser.uid

    var userStatusDatabaseRef = firebase.database().ref('/status/' + uid)
    var isOfflineForDatabase = {
      state: 'offline',
      last_changed: firebase.database.ServerValue.TIMESTAMP,
    }
    var isOnlineForDatabase = {
      state: 'online',
      last_changed: firebase.database.ServerValue.TIMESTAMP,
    }

    firebase
      .database()
      .ref('.info/connected')
      .on('value', function(snapshot) {
        // If we're not currently connected, don't do anything.
        if (snapshot.val() === false) {
          return
        }
        userStatusDatabaseRef
          .onDisconnect()
          .set(isOfflineForDatabase)
          .then(function() {
            userStatusDatabaseRef.set(isOnlineForDatabase)
          })
      })

    var userStatusFirestoreRef = firebase.firestore().doc('/status/' + uid)
    var isOfflineForFirestore = {
      state: 'offline',
      last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    }
    var isOnlineForFirestore = {
      state: 'online',
      last_changed: firebase.firestore.FieldValue.serverTimestamp(),
    }

    firebase
      .database()
      .ref('.info/connected')
      .on('value', function(snapshot) {
        if (snapshot.val() === false) {
          userStatusFirestoreRef.set(isOfflineForFirestore)
          return
        }
        userStatusDatabaseRef
          .onDisconnect()
          .set(isOfflineForDatabase)
          .then(function() {
            userStatusDatabaseRef.set(isOnlineForDatabase)
            userStatusFirestoreRef.set(isOnlineForFirestore)
          })
      })
  }
}

export const saveProfile = profile => {
  return dispatch => {
    var user = firebase.currentUser

    if (profile.email) {
      user
        .updateEmail(profile.email)
        .then(() => {
          firebase.firestore
            .collection('users')
            .doc(user.uid)
            .update({
              email: profile.email,
            })
            .then(() => {
              dispatch({ type: 'SAVE_PROFILE_SUCCESS' })
            })
        })
        .catch(err => {
          dispatch({ type: 'SAVE_PROFILE_FAIL', err })
        })
    }

    if (profile.password) {
      user
        .updatePassword(profile.password)
        .then(() => {
          dispatch({ type: 'SAVE_PROFILE_SUCCESS' })
        })
        .catch(err => {
          dispatch({ type: 'SAVE_PROFILE_FAIL', err })
        })
    }

    if (profile.photoURL) {
      user
        .updateProfile(profile)
        .then(() => {
          dispatch({ type: 'SAVE_PROFILE_SUCCESS' })
        })
        .catch(err => {
          dispatch({ type: 'SAVE_PROFILE_FAIL', err })
        })
    }
  }
}

export const saveOptions = profile => {
  return (dispatch, getState) => {
    const firestore = firebase.firestore()
    const userId = getState().firebase.auth.uid

    let options = {}
    if (profile.cardSize) {
      options.cardSize = profile.cardSize
    }
    if (profile.layout) {
      options.layout = profile.layout
    }

    if (Object.keys(options).length > 0) {
      firestore
        .collection('users')
        .doc(userId)
        .update(options)
        .then(() => {
          dispatch({ type: 'SAVE_PROFILE_SUCCESS' })
        })
        .catch(err => {
          dispatch({ type: 'SAVE_PROFILE_FAIL', err })
        })
    }
  }
}

export const getUserByName = name => {
  return dispatch => {
    const firestore = firebase.firestore()

    firestore
      .collection('users')
      .where('login', '==', name)
      .get()
      .then(res => {
        dispatch({ type: 'GET_USER_SUCCESS', user: res })
      })
      .catch(err => {
        dispatch({ type: 'GET_USER_FAIL', err })
      })
  }
}

export const purgeDB = () => {
  return async () => {
    const db = firebase.firestore()
    db.collection('bgio')
      .get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          db.collection('bgio')
            .doc(doc.id)
            .delete()
        })
      })
      .then(() => {
        db.collection('bgio')
          .doc('avoid_loading')
          .set({ value: false })
      })
      .then(() => {
        db.collection('chats')
          .get()
          .then(snapshot => {
            snapshot.docs.forEach(doc => {
              if (doc.id !== 'mainChat' && doc.id !== 'default')
                db.collection('chats')
                  .doc(doc.id)
                  .delete()
            })
          })
      })
  }
}
