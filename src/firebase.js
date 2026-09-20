import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';

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
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// =======================================================
// Cross-Device Chat Synchronization via Cloud Firestore
// =======================================================

/**
 * Save / update a single session to Firestore for cross-device access
 */
export const syncSessionToCloud = async (userId, session) => {
  if (!userId || !session || !session.id) return;
  try {
    const sessionRef = doc(db, 'users', userId, 'sessions', session.id);
    const cleanData = {
      id: session.id,
      title: session.title || 'New chat',
      messages: Array.isArray(session.messages) ? session.messages : [],
      pinned: Boolean(session.pinned),
      archived: Boolean(session.archived),
      projectId: session.projectId || null,
      updatedAt: session.updatedAt || Date.now()
    };
    await setDoc(sessionRef, cleanData, { merge: true });
  } catch (err) {
    console.warn('Firestore syncSessionToCloud warning:', err);
  }
};

/**
 * Save all sessions to Firestore (called when user sends messages or modifies chats)
 */
export const syncAllSessionsToCloud = async (userId, sessions) => {
  if (!userId || !Array.isArray(sessions)) return;
  try {
    const promises = sessions.map((s) => syncSessionToCloud(userId, s));
    await Promise.all(promises);
  } catch (err) {
    console.warn('Firestore syncAllSessionsToCloud warning:', err);
  }
};

/**
 * Load all user sessions from Firestore (called on new device sign-in)
 */
export const loadSessionsFromCloud = async (userId) => {
  if (!userId) return [];
  try {
    const sessionsCol = collection(db, 'users', userId, 'sessions');
    const snapshot = await getDocs(sessionsCol);
    if (snapshot.empty) return [];

    const cloudSessions = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.id) {
        cloudSessions.push(data);
      }
    });

    // Sort by updatedAt descending
    cloudSessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return cloudSessions;
  } catch (err) {
    console.warn('Firestore loadSessionsFromCloud warning:', err);
    return [];
  }
};

/**
 * Delete a single session from Firestore
 */
export const deleteSessionFromCloud = async (userId, sessionId) => {
  if (!userId || !sessionId) return;
  try {
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
    await deleteDoc(sessionRef);
  } catch (err) {
    console.warn('Firestore deleteSessionFromCloud warning:', err);
  }
};

/**
 * Delete all sessions for a user from Firestore
 */
export const deleteAllSessionsFromCloud = async (userId) => {
  if (!userId) return;
  try {
    const sessionsCol = collection(db, 'users', userId, 'sessions');
    const snapshot = await getDocs(sessionsCol);
    const deletePromises = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
    });
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Firestore deleteAllSessionsFromCloud warning:', err);
  }
};

export { 
  GoogleAuthProvider,
  signInWithPopup, 
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
};
