const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

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
          content: 'Joined the RAO community',
          user: `${newUser.login}`,
          time: admin.firestore.FieldValue.serverTimestamp()
        }

        return createNotification(notification)
      })
})
