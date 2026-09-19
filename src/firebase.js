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

const firebaseConfig = {
  apiKey: "AIzaSyA8g1tx_I4un9LNjg6-G4EAlCXy3dFu2VI",
  authDomain: "quick-ai-b8d3a.firebaseapp.com",
  projectId: "quick-ai-b8d3a",
  storageBucket: "quick-ai-b8d3a.firebasestorage.app",
  messagingSenderId: "818640898000",
  appId: "1:818640898000:web:2f160df182c8836ed51bd5",
  measurementId: "G-MYN1L8NY48"
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
