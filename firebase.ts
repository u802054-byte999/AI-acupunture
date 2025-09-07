
// FIX: The error indicates a mismatch between Firebase SDK version and import syntax.
// Switched to Firebase v8 namespaced syntax for compatibility.
import firebase from 'firebase/app';
import 'firebase/firestore';

// IMPORTANT: Replace this with your own Firebase configuration
// Go to your Firebase project console -> Project Settings -> General -> Your apps -> Web app -> Config
const firebaseConfig = {
  apiKey: "AIzaSyCBZsEqTmv37Z9pFSryY2vvFKailzyvORA",
  authDomain: "ai-puncture.firebaseapp.com",
  projectId: "ai-puncture",
  storageBucket: "ai-puncture.firebasestorage.app",
  messagingSenderId: "972407949684",
  appId: "1:972407949684:web:55135d13cba8548b904421",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Cloud Firestore and get a reference to the service
export const db = firebase.firestore();
