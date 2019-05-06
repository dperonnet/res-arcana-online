import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/database';

// Initialize Firebase
var fbConfig = {
  apiKey: "AIzaSyCfanQhV4nXpnoei8RY8tsF3c58OpYczU0",
  authDomain: "res-arcana-project.firebaseapp.com",
  databaseURL: "https://res-arcana-project.firebaseio.com",
  projectId: "res-arcana-project",
  storageBucket: "res-arcana-project.appspot.com",
  messagingSenderId: "495059282761"
};

!firebase.apps.length ? firebase.initializeApp(fbConfig) : firebase.app()
firebase.firestore().settings({ });

export { fbConfig, firebase }
