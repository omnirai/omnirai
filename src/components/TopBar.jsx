import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  Plus,
  ChevronDown,
  Check,
  ArrowLeft,
  Folder
} from 'lucide-react';
import { GoogleLogo } from './AuthScreen';
import { OmniraIcon } from './OmniraLogo';

export const AI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'OMNIRA (GPT-4o)',
    shortName: 'GPT-4o',
    badge: 'OMNIRA Pro',
    color: '#10a37f',
    iconType: 'omnira',
    description: 'Most intelligent model for text, reasoning & code.'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    shortName: 'Gemini 1.5',
    badge: 'Google',
    color: '#4285F4',
    iconType: 'gemini',
    description: 'Fast, multimodal reasoning & document processing.'
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1',
    shortName: 'DeepSeek R1',
    badge: 'DeepSeek',
    color: '#4d6bfe',
    iconType: 'deepseek',
    description: 'Chain-of-thought deep mathematical reasoning.'
  },
  {
    id: 'cloudflare-image',
    name: 'Cloudflare Workers AI (FLUX)',
    shortName: 'FLUX Image',
    badge: 'Cloudflare AI',
    color: '#f38020',
    iconType: 'cloudflare',
    description: 'Generates high-definition AI images and logos via FLUX 1 Schnell.'
  },
  {
    id: 'native',
    name: 'OMNIRA Native Neural',
    shortName: 'Native AI',
    badge: 'Zero API Key',
    color: '#000000',
    iconType: 'omnira',
    description: '100% client-side instant AI processing.'
  }
];

export function ModelIcon({ type, className = "w-4 h-4" }) {
  if (type === 'cloudflare' || type === 'flux') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#f38020" />
      </svg>
    );
  }
  if (type === 'omnira' || type === 'openai') {
    return <OmniraIcon className={className} filterId="topbar-omnira" />;
  }
  if (type === 'gemini') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#geminiGrad)" />
        <defs>
          <linearGradient id="geminiGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="50%" stopColor="#9B51E0" />
            <stop offset="100%" stopColor="#EA4335" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (type === 'claude') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M13.5 2H10.5L9 8.5L2.5 7V10L8.5 12L2.5 14V17L9 15.5L10.5 22H13.5L15 15.5L21.5 17V14L15.5 12L21.5 10V7L15 8.5L13.5 2Z" fill="#d97757" />
      </svg>
    );
  }
  if (type === 'deepseek') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#4d6bfe" />
        <path d="M7 13C7 13 9 17 12 17C15 17 17 13 17 13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1.5" fill="#ffffff" />
        <circle cx="15" cy="9" r="1.5" fill="#ffffff" />
      </svg>
    );
  }
  if (type === 'grok') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'perplexity') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.15L19.5 7.9V10.5L12 6.75L4.5 10.5V7.9L12 4.15ZM4.5 12.5L12 8.75L19.5 12.5V16.1L12 19.85L4.5 16.1V12.5Z" fill="#20b2aa" />
        <path d="M12 2V22M2 7L22 17M2 17L22 7" stroke="#20b2aa" strokeWidth="1.5" />
      </svg>
    );
  }
  if (type === 'flux') {
    return <Sparkles className={className} />;
  }
  return (
    <OmniraIcon className={className} />
  );
}

export default function TopBar({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedModel,
  setSelectedModel,
  activeTab,
  setActiveTab,
  openSettings,
  openAuth,
  darkMode,
  setDarkMode,
  userName = "Guest User",
  currentUser,
  onNewChat,
  hasMessages = false,
  activeProject = null
}) {
  const displayUserName = currentUser?.name || userName;
  const isGuest = !currentUser || currentUser.provider === 'guest' || displayUserName === "Guest User";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentModelObj = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 left-0 right-0 z-40 w-full py-2.5 sm:py-3 px-2.5 sm:px-4 flex items-center justify-between bg-[var(--bg-primary)] border-b border-[var(--border-color)] transition-colors shrink-0 gap-1.5 sm:gap-4 overflow-visible shadow-2xs">

      {/* Left: Back Arrow + Sidebar Toggle + Model Selector Pill Dropdown */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial">

        {/* Back Arrow Button to reset to New Chat */}
        {hasMessages && onNewChat && (
          <button
            onClick={onNewChat}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0 flex items-center justify-center cursor-pointer"
            title="Go Back / New Chat"
          >
            <ArrowLeft className="w-4.5 h-4.5 stroke-[2.25]" />
          </button>
        )}

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0 cursor-pointer"
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Interactive Model Switcher Dropdown */}
        <div className="relative min-w-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] shadow-2xs transition-all min-w-0 max-w-[125px] xs:max-w-[170px] sm:max-w-none cursor-pointer"
          >
            <ModelIcon type={currentModelObj.iconType} className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-xs tracking-tight truncate">
              <span className="sm:hidden">{currentModelObj.shortName || currentModelObj.name}</span>
              <span className="hidden sm:inline">{currentModelObj.name}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 ml-0.5" />
          </button>

          {/* Model Selector Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 max-w-[85vw] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-1.5 shadow-2xl z-[100] animate-fade-in space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Select Active AI Model
              </div>

              {AI_MODELS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-colors ${isSelected
                        ? 'bg-[var(--bg-hover)] font-semibold text-[var(--text-primary)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <ModelIcon type={m.iconType} className="w-4 h-4 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold truncate">{m.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">{m.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {m.badge}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-black dark:text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {activeProject && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-600 dark:text-violet-400 text-xs font-semibold shrink-0" title={`Active Project: ${activeProject.name}`}>
            <span>{activeProject.icon || '📁'}</span>
            <span className="truncate max-w-[120px]">{activeProject.name}</span>
          </div>
        )}
      </div>

      {/* Center: Chat / Work Pill Switcher */}
      <div className="hidden sm:flex items-center p-1 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-full text-xs font-medium shadow-2xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-1 rounded-full transition-all ${activeTab === 'chat'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
        >
          Chat
        </button>

        <button
          onClick={() => setActiveTab('work')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${activeTab === 'work'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold'
              : 'text-[var(--accent-blue)] hover:bg-[var(--bg-hover)]'
            }`}
        >
          <Plus className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
          <span>Work</span>
        </button>
      </div>

      {/* Right: Upgrade Sparkles Button + User Profile Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Only show top Sign In button if user is NOT logged in (Guest Mode) */}
        {isGuest && openAuth && (
          <button
            onClick={openAuth}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] shadow-2xs transition-colors cursor-pointer"
            title="Sign In"
          >
            <GoogleLogo className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Sign In</span>
          </button>
        )}

        <button
          onClick={() => openSettings && openSettings('billing')}
          className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
        >
          <span>Upgrade</span>
        </button>

        <button
          onClick={() => openSettings && openSettings('account')}
          className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs flex items-center justify-center hover:opacity-90 transition-opacity shadow-2xs cursor-pointer overflow-hidden shrink-0"
          title={displayUserName}
        >
          {currentUser?.picture || currentUser?.photoURL || (currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http'))) ? (
            <img 
              src={currentUser.picture || currentUser.photoURL || currentUser.avatar} 
              alt={displayUserName} 
              className="w-full h-full object-cover" 
            />
          ) : (
            displayUserName.charAt(0).toUpperCase()
          )}
        </button>
      </div>

    </header>
  );
}

