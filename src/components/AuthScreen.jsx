import React, { useState } from 'react';
import { Sparkles, Lock, Mail, User, ArrowRight, Eye, EyeOff, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../firebase';
import { triggerAutoEmail } from '../engine/quickAiEngine';
import { OmniraLogo, OmniraIcon } from './OmniraLogo';

export function GoogleLogo({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.37 7.36 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.63 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function AuthScreen({ onLogin, isModal = false, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real Google Sign-In with Firebase Auth (Supports direct popup + seamless redirect fallback)
  const handleGoogleLogin = async (preferRedirect = false) => {
    setIsLoading(true);
    setError(null);
    try {
      if (preferRedirect) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupErr) {
        // If popup was blocked or closed, seamlessly proceed via direct redirect
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request' || popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/internal-error') {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupErr;
      }
      const user = result.user;
      const loggedInUser = {
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        email: user.email,
        username: `@${(user.email || 'user').split('@')[0]}`,
        avatar: user.photoURL || user.displayName?.charAt(0) || 'G',
        picture: user.photoURL,
        provider: 'google',
        uid: user.uid,
        plan: 'Pro'
      };
      setIsLoading(false);
      onLogin(loggedInUser);

      // Trigger automatic notification email
      if (user.email) {
        triggerAutoEmail({
          type: 'signin',
          email: user.email,
          name: loggedInUser.name
        });
      }

      if (onClose) onClose();
    } catch (err) {
      console.error('Firebase Google Auth error:', err);
      setIsLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed.');
      } else {
        setError(`Google Auth: ${err.message || err.code}`);
      }
    }
  };

  // Real Email & Password Sign In / Sign Up with Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      }
      const u = userCredential.user;
      const loggedInUser = {
        name: formData.name.trim() || u.displayName || u.email?.split('@')[0] || 'User',
        email: u.email,
        username: `@${(u.email || 'user').split('@')[0]}`,
        avatar: u.photoURL || (formData.name || 'U').charAt(0),
        provider: 'email',
        uid: u.uid,
        plan: 'Pro'
      };
      setIsLoading(false);
      onLogin(loggedInUser);

      // Trigger automatic welcome or signin email
      if (u.email) {
        triggerAutoEmail({
          type: isSignUp ? 'welcome' : 'signin',
          email: u.email,
          name: loggedInUser.name
        });
      }

      if (onClose) onClose();
    } catch (err) {
      console.error('Firebase Email Auth error:', err);
      setIsLoading(false);
      setError(`Auth Error: ${err.message || err.code}`);
    }
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        name: 'Guest User',
        email: 'guest@omnira.ai',
        username: '@guest_user',
        avatar: 'GU',
        provider: 'guest',
        plan: 'Free'
      });
      setIsLoading(false);
      if (onClose) onClose();
    }, 300);
  };

  const containerContent = (
    <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-7 shadow-2xl relative z-10 backdrop-blur-xl text-[var(--text-primary)] select-none animate-fade-in">
      
      {/* Modal Close Button if opened as modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Brand Header */}
      <div className="text-center space-y-2 mb-6 flex flex-col items-center">
        <OmniraIcon className="w-16 h-16 mb-1 drop-shadow-md" filterId="auth-modal-logo" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold">
          <span>OMNIRA AI Platform</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {isSignUp ? 'Create your account' : 'Welcome to OMNIRA'}
        </h1>
        <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
          {isSignUp 
            ? 'Get instant access to advanced AI models, document studio, & code assistant.' 
            : 'Sign in with Google or Email to access your chat history and models.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Social Login Buttons (REAL FIREBASE GOOGLE AUTH) */}
      <div className="space-y-2.5 mb-5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <GoogleLogo className="w-4 h-4 shrink-0" />
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-color)]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-[var(--bg-card)] px-3 text-[var(--text-muted)]">Or email sign in</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {isSignUp && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-light)] outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-light)] outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              className="w-full pl-10 pr-10 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-light)] outline-none focus:border-violet-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 font-semibold text-xs transition-all shadow-md disabled:opacity-50 mt-1 cursor-pointer"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Direct Entry / Skip Login Button */}
      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="text-xs text-[var(--text-primary)] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Direct Access (Use without login)</span>
        </button>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline font-medium cursor-pointer"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        {containerContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      {containerContent}
    </div>
  );
}
