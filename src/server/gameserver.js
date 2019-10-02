const { Server, Firebase } = require('boardgame.io/server');
const admin = require('firebase-admin');
const ResArcanaGame = require('../client/components/play/game/Game').ResArcanaGame;
const serviceAccount = require('./serviceAccountKey.json')

const server = Server({
  games: [ResArcanaGame],

  db: new Firebase({
    config: {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://res-arcana-project.firebaseio.com",
    },
    engine: 'Firestore',
    adminClient: true,
  }),
});

server.run(process.env.PORT || 8000);
