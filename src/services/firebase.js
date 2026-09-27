import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Firebase configuration using your project credentials with fallback values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAwF6_C2_FRtLdEDfkj-n8JqvNgRktxP_w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thesis-colab.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thesis-colab",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thesis-colab.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "184771956819",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:184771956819:web:44b5da720666c3ef11f6a6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-81GNFPF681"
};

let app = null;
let db = null;
let auth = null;
let googleProvider = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.warn('Firebase initialization error:', e);
}

export { app, db, auth, googleProvider };
