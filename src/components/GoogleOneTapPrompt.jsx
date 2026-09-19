import React, { useEffect } from 'react';
import { auth, GoogleAuthProvider, signInWithCredential } from '../firebase';
import { triggerAutoEmail } from '../engine/quickAiEngine';

const GOOGLE_CLIENT_ID = "776634005021-37q8aupje5g0cq1a5aankblp9v9569oo.apps.googleusercontent.com";

export default function GoogleOneTapPrompt({ onLogin, currentUser }) {
  useEffect(() => {
    // Only prompt if user is in guest mode and not authenticated
    const hasLoggedIn = localStorage.getItem('omnira_logged_in') === 'true';
    const isGuest = !currentUser || currentUser.provider === 'guest' || currentUser.email === 'guest@omnira.ai';

    if (hasLoggedIn || !isGuest) {
      return;
    }

    const initGoogleOneTap = () => {
      if (typeof window === 'undefined' || !window.google?.accounts?.id) {
        return false;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response || !response.credential) return;

            try {
              // Decode base64 URL JWT payload from Google Identity Services
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);

              // Authenticate with Firebase using Google Credential
              const credential = GoogleAuthProvider.credential(response.credential);
              const userCredential = await signInWithCredential(auth, credential);
              const firebaseUser = userCredential.user;

              const loggedInUser = {
                name: payload.name || firebaseUser.displayName || 'Google User',
                email: payload.email || firebaseUser.email,
                username: `@${((payload.email || firebaseUser.email || 'user').split('@')[0])}`,
                avatar: payload.picture || firebaseUser.photoURL || 'G',
                picture: payload.picture || firebaseUser.photoURL,
                photoURL: payload.picture || firebaseUser.photoURL,
                provider: 'google',
                uid: firebaseUser.uid || payload.sub,
                plan: 'Pro'
              };

              localStorage.setItem('omnira_logged_in', 'true');
              onLogin(loggedInUser);

              if (loggedInUser.email) {
                triggerAutoEmail({
                  type: 'signin',
                  email: loggedInUser.email,
                  name: loggedInUser.name
                });
              }
            } catch (authErr) {
              console.error('Google One Tap authentication error:', authErr);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
          use_fedcm_for_prompt: true
        });

        // Trigger Google's official native One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.debug('Google One Tap not displayed:', notification.getNotDisplayedReason());
          } else if (notification.isSkippedMoment()) {
            console.debug('Google One Tap skipped:', notification.getSkippedReason());
          } else if (notification.isDismissedMoment()) {
            console.debug('Google One Tap dismissed:', notification.getDismissedReason());
          }
        });

        return true;
      } catch (err) {
        console.warn('Google One Tap initialization notice:', err);
        return false;
      }
    };

    // Try immediately, or poll briefly until the official Google script loads
    if (!initGoogleOneTap()) {
      const interval = setInterval(() => {
        if (initGoogleOneTap()) {
          clearInterval(interval);
        }
      }, 300);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentUser, onLogin]);

  // Google's official GSI script renders the prompt iframe directly from Google servers
  return null;
}
