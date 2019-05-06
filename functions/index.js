const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore();

// Create a new function which is triggered on changes to /status/{uid}
// Note: This is a Realtime Database trigger, *not* Cloud Firestore.
exports.onUserStatusChanged = functions.database.ref('/status/{uid}')
  .onUpdate((change, context) => {
    // Get the data written to Realtime Database
    const eventStatus = change.after.val();

    // Then use other event data to create a reference to the
    // corresponding Firestore document.
    const userStatusFirestoreRef = firestore.doc(`users/${context.params.uid}`);

    // It is likely that the Realtime Database change that triggered
    // this event has already been overwritten by a fast change in
    // online / offline status, so we'll re-read the current data
    // and compare the timestamps.
    return change.after.ref.once('value').then((statusSnapshot) => {
      const status = statusSnapshot.val();
      console.log(status, eventStatus);
      // If the current timestamp for this data is newer than
      // the data that triggered this event, we exit this function.
      if (status.last_changed > eventStatus.last_changed) {
        return null;
      }

      // Otherwise, we convert the last_changed field to a Date
      eventStatus.last_changed = new Date(eventStatus.last_changed);

      // ... and write it to Firestore.
      return userStatusFirestoreRef.update(eventStatus);
    })
  });


/*
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const chatRef = functions.firestore.document('chats/{chatId}');

exports.incomingMessage = chatRef.onUpdate((change, context) => {
  const before = change.before.data()
  const after = change.after.data()

  if (before.messages.length === after.messages.length)  {
    console.log(`data messages did not change`);
    return null;
  }

  let count = after.messageCount;
  let newMessages = after.messages;
  let newCount = count + 1
  if (!count) {
    newCount = 0;
  } else if (count > 100) {
    console.log(`Purging chat ${context.params.chatId} messages.`);
    newMessages = newMessages.splice(0, 20);
    newCount = after.messages.length - 20;
  } else {
    newCount = count + 1;
  }

  return change.after.ref.set({
    messageCount: newCount,
    messages: newMessages}, {merge: true});
})

/*
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello Batman!");
});

const createNotification = (notification => {
  return admin.firestore().collection('notifications')
    .add(notification)
    .then(doc => console.log('notification added', doc))
})

exports.gameCreated = functions.firestore
  .document('games/{gameId}')
  .onCreate(doc => {
    const game = doc.data();
    const notification = {
      content: 'Added a new game',
      user: `${game.gameCreator}`,
      time: admin.firestore.FieldValue.serverTimestamp()
    }

    return createNotification(notification)
});

exports.userJoined = functions.auth.user()
  .onCreate(user => {

    return admin.firestore().collection('users')
      .doc(user.uid).get().then(doc => {

        const newUser = doc.data();
        const notification = {
          content: 'joined the Res Arcana Online community,
          user: `${newUser.login}`,
          time: admin.firestore.FieldValue.serverTimestamp()
        }

        return createNotification(notification)
      })
})
*/
