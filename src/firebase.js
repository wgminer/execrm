import firebase from 'firebase';
import secret from './secret';

// Initialize Firebase
firebase.initializeApp(secret);

export default firebase.firestore();
