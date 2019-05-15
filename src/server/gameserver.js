const { Server, Firebase } = require('boardgame.io/server');
const admin = require('firebase-admin');
const ResArcana = require('../client/components/play/game/Game').ResArcana;
const serviceAccount = require('./serviceAccountKey.json');

const server = Server({
  games: [ResArcana],

  db: new Firebase({
    config: {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://res-arcana-project.firebaseio.com",
    },
    engine: 'RTDB',
    adminClient: false,
  }),
});

server.run(8000);
