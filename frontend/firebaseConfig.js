import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
const firebaseConfig = {
  apiKey: "AIzaSyBwJvUBkwFBoMGTZD945B9rqwdWZ9z3C9g",
  authDomain: "hacktx25.firebaseapp.com",
  projectId: "hacktx25",
  storageBucket: "hacktx25.firebasestorage.app",
  messagingSenderId: "634221122385",
  appId: "1:634221122385:web:e264f9fcd469f4a4c3f970",
  measurementId: "G-2JJ0503N1V"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);
export const db = getFirestore(app);
