import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCfanQhV4nXpnoei8RY8tsF3c58OpYczU0",
  authDomain: "res-arcana-project.firebaseapp.com",
  databaseURL: "https://res-arcana-project.firebaseio.com",
  projectId: "res-arcana-project",
  storageBucket: "res-arcana-project.appspot.com",
  messagingSenderId: "495059282761"
};

firebase.initializeApp(config);
firebase.firestore().settings({ });

export default firebase;
