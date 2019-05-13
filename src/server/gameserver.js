const { Server, Firebase } = require('boardgame.io/server');
const admin = require('firebase-admin');
const ResArcana = require('../client/components/play/game/Game').ResArcana;
const serviceAccount = require('./serviceAccountKey.json');

const server = Server({
  games: [ResArcana],

  db: new Firebase({
    config: {
      credential: admin.credential.cert(serviceAccount),
      apiKey: "AIzaSyCfanQhV4nXpnoei8RY8tsF3c58OpYczU0",
      authDomain: "res-arcana-project.firebaseapp.com",
      databaseURL: "https://res-arcana-project.firebaseio.com",
      projectId: "res-arcana-project",
      storageBucket: "res-arcana-project.appspot.com",
      messagingSenderId: "495059282761"
    },
    engine: 'Firestore',
    adminClient: false,
  }),
});

server.run(8000);
