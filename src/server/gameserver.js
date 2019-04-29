const { Server, Firebase } = require('boardgame.io/server');
const admin = require('firebase-admin');
const ResArcana = require('../client/components/game/Game').ResArcana;
const serviceAccount = require('./serviceAccountKey.json');

const server = Server({
  games: [ResArcana],

  db: new Firebase({
    config: {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: '...',
    },
    engine: 'Firestore',
    adminClient: true,
  }),
});

server.run(8000);
