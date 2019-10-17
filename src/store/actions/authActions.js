export const signIn = credentials => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()

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
  return (dispatch, getState, { getFirebase }) => {
    const firebase = getFirebase()
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
  return (dispatch, getState, { getFirebase }) => {
    const firebase = getFirebase()

    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch({ type: 'SIGNOUT_SUCCESS' })
      })
  }
}

export const validateAndRegister = newUser => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()

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
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const firebase = getFirebase()
    const firestore = getFirestore()

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
  return (dispatch, getState, { getFirebase }) => {
    getFirebase()
      .auth()
      .onAuthStateChanged(user => {
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
  return (dispatch, getState, { getFirebase }) => {
    const firebase = getFirebase()

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
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    var user = getFirebase().auth().currentUser

    if (profile.email) {
      user
        .updateEmail(profile.email)
        .then(() => {
          getFirestore()
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
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()
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
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore()

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
  return async (dispatch, getState, { getFirestore }) => {
    const db = getFirestore()
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
  }
}
