import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { triggerAutoEmail } from '../engine/quickAiEngine';

export function GoogleGLogo({ className = "w-5 h-5" }) {
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

export default function GoogleOneTapPrompt({ onLogin, currentUser }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [domain, setDomain] = useState('omnira-chat.vercel.app');

  // Retrieve previous user details if any or display sleek Google One Tap prompt
  const [suggestedUser, setSuggestedUser] = useState(() => {
    try {
      const saved = localStorage.getItem('omnira_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.email && u.email !== 'guest@omnira.ai') {
          return {
            name: u.name || 'Google User',
            email: u.email,
            avatar: u.avatar || u.picture || null,
            firstName: (u.name || 'User').split(' ')[0]
          };
        }
      }
    } catch (e) {}
    return {
      name: 'Google Account',
      email: 'Sign in to access Pro Mode',
      avatar: null,
      firstName: 'Google'
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setDomain(hostname === 'localhost' ? 'localhost:5173' : hostname);
    }

    // Check if user is already logged in or dismissed in this session
    const isDismissed = sessionStorage.getItem('omnira_onetap_dismissed') === 'true';
    const hasLoggedIn = localStorage.getItem('omnira_logged_in') === 'true';
    const isGuest = !currentUser || currentUser.provider === 'guest' || currentUser.email === 'guest@omnira.ai';

    if (!hasLoggedIn && !isDismissed && isGuest) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('omnira_onetap_dismissed', 'true');
    } catch (e) {}
  };

  const handleOneTapSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const loggedInUser = {
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        email: user.email,
        username: `@${(user.email || 'user').split('@')[0]}`,
        avatar: user.photoURL || user.displayName?.charAt(0) || 'G',
        picture: user.photoURL,
        photoURL: user.photoURL,
        provider: 'google',
        uid: user.uid,
        plan: 'Pro'
      };

      setIsSuccess(true);
      setIsLoading(false);

      if (user.email) {
        triggerAutoEmail({
          type: 'signin',
          email: user.email,
          name: loggedInUser.name
        });
      }

      setTimeout(() => {
        onLogin(loggedInUser);
        handleDismiss();
      }, 600);

    } catch (err) {
      console.error('One Tap Google Sign-in error:', err);
      setIsLoading(false);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in cancelled. Tap button to retry.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain ${window.location.hostname} not authorized in Firebase Console.`);
      } else {
        setError(err.message || 'Unable to complete Google sign-in.');
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-3 right-3 sm:top-4 sm:right-6 z-[9999] w-[340px] sm:w-[370px] bg-white text-neutral-900 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-neutral-200/80 p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4 select-none font-sans"
      style={{
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <GoogleGLogo className="w-4 h-4 shrink-0" />
          <span className="text-xs font-medium text-neutral-700 truncate">
            Sign in to <span className="font-semibold text-neutral-900">{domain}</span> with google.com
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
          title="Close"
          aria-label="Close Google One Tap"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Account Info / Pro Badge */}
      <div className="py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden">
          {suggestedUser.avatar ? (
            <img src={suggestedUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-semibold">
              {suggestedUser.firstName ? suggestedUser.firstName.charAt(0).toUpperCase() : 'G'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-neutral-900 truncate">
              {suggestedUser.name}
            </h4>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wide">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 truncate">
            {suggestedUser.email}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-2 p-2 rounded-lg bg-red-50 text-red-600 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleOneTapSignIn}
          disabled={isLoading || isSuccess}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#104896] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-75"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Connecting to Google...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Signed In! Upgrading to Pro...</span>
            </>
          ) : (
            <>
              <span>
                {suggestedUser.firstName && suggestedUser.firstName !== 'Google' 
                  ? `Continue as ${suggestedUser.firstName}` 
                  : 'Continue with Google'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Footer reassurance */}
      <div className="mt-2 text-center">
        <p className="text-[10px] text-neutral-400">
          Instant Pro privileges • No credit card required
        </p>
      </div>
    </div>
  );
}
