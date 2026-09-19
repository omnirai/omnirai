import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Real OMNIRA AI Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAB8J4pangEoEHDntnOPSBdwe40wm4SuvY",
  authDomain: "omnira-ai-39c47.firebaseapp.com",
  projectId: "omnira-ai-39c47",
  storageBucket: "omnira-ai-39c47.firebasestorage.app",
  messagingSenderId: "776634005021",
  appId: "1:776634005021:web:913b9c73caac131e72b8f4",
  measurementId: "G-WM1M95R0NN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};
