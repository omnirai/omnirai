import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  PanelLeft, 
  PanelLeftClose, 
  Sparkles, 
  Plus, 
  ChevronDown,
  Check,
  Sun,
  Moon
} from 'lucide-react';

export const AI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'OMNIRA (GPT-4o)',
    badge: 'OMNIRA Pro',
    color: '#10a37f',
    iconType: 'omnira',
    description: 'Most intelligent model for text, reasoning & code.'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'Google',
    color: '#4285F4',
    iconType: 'gemini',
    description: 'Fast, multimodal reasoning & document processing.'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    badge: 'Anthropic',
    color: '#d97757',
    iconType: 'claude',
    description: 'Exceptional coding, writing & complex analysis.'
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1',
    badge: 'DeepSeek',
    color: '#4d6bfe',
    iconType: 'deepseek',
    description: 'Chain-of-thought deep mathematical reasoning.'
  },
  {
    id: 'grok-2',
    name: 'Grok 2 (xAI)',
    badge: 'xAI',
    color: '#ffffff',
    iconType: 'grok',
    description: 'Real-time knowledge & witty answers.'
  },
  {
    id: 'perplexity',
    name: 'Perplexity Sonar',
    badge: 'Sonar',
    color: '#20b2aa',
    iconType: 'perplexity',
    description: 'Live web search with real-time web citations.'
  },
  {
    id: 'flux-image',
    name: 'FLUX AI Image Generator',
    badge: 'Image Studio',
    color: '#10b981',
    iconType: 'flux',
    description: 'Generates photorealistic AI images & art.'
  },
  {
    id: 'native',
    name: 'OMNIRA Native Neural',
    badge: 'Zero API Key',
    color: '#10b981',
    iconType: 'omnira',
    description: '100% client-side instant AI processing.'
  }
];

export function ModelIcon({ type, className = "w-4 h-4" }) {
  if (type === 'omnira' || type === 'openai') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.15L19.5 7.9V10.5L12 6.75L4.5 10.5V7.9L12 4.15ZM4.5 12.5L12 8.75L19.5 12.5V16.1L12 19.85L4.5 16.1V12.5Z" fill="#10b981"/>
        <path d="M12 2V22M2 7L22 17M2 17L22 7" stroke="#10b981" strokeWidth="1.5"/>
      </svg>
    );
  }
  if (type === 'gemini') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#geminiGrad)"/>
        <defs>
          <linearGradient id="geminiGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4285F4"/>
            <stop offset="50%" stopColor="#9B51E0"/>
            <stop offset="100%" stopColor="#EA4335"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  if (type === 'claude') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M13.5 2H10.5L9 8.5L2.5 7V10L8.5 12L2.5 14V17L9 15.5L10.5 22H13.5L15 15.5L21.5 17V14L15.5 12L21.5 10V7L15 8.5L13.5 2Z" fill="#d97757"/>
      </svg>
    );
  }
  if (type === 'deepseek') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#4d6bfe"/>
        <path d="M7 13C7 13 9 17 12 17C15 17 17 13 17 13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="9" r="1.5" fill="#ffffff"/>
        <circle cx="15" cy="9" r="1.5" fill="#ffffff"/>
      </svg>
    );
  }
  if (type === 'grok') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
      </svg>
    );
  }
  if (type === 'perplexity') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.15L19.5 7.9V10.5L12 6.75L4.5 10.5V7.9L12 4.15ZM4.5 12.5L12 8.75L19.5 12.5V16.1L12 19.85L4.5 16.1V12.5Z" fill="#20b2aa"/>
        <path d="M12 2V22M2 7L22 17M2 17L22 7" stroke="#20b2aa" strokeWidth="1.5"/>
      </svg>
    );
  }
  if (type === 'flux') {
    return <span className="text-sm">🎨</span>;
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.15L19.5 7.9V10.5L12 6.75L4.5 10.5V7.9L12 4.15ZM4.5 12.5L12 8.75L19.5 12.5V16.1L12 19.85L4.5 16.1V12.5Z" fill="#10b981"/>
    </svg>
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
  darkMode,
  setDarkMode,
  userName = "Lama Bikal"
}) {
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
    <header className="h-14 px-3 flex items-center justify-between bg-[var(--bg-primary)] border-b border-transparent transition-colors z-20 shrink-0 select-none">
      
      {/* Left: Sidebar Toggle + Model Selector Pill Dropdown */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Interactive Model Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] shadow-2xs transition-all"
          >
            <ModelIcon type={currentModelObj.iconType} className="w-4 h-4 shrink-0" />
            <span className="font-semibold text-xs tracking-tight">
              {currentModelObj.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] ml-0.5" />
          </button>

          {/* Model Selector Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-1.5 shadow-2xl z-50 animate-fade-in space-y-0.5">
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
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-colors ${
                      isSelected 
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
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Center: Chat / Work Pill Switcher */}
      <div className="hidden sm:flex items-center p-1 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-full text-xs font-medium shadow-2xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-1 rounded-full transition-all ${
            activeTab === 'chat'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Chat
        </button>
        
        <button
          onClick={() => setActiveTab('work')}
          className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
            activeTab === 'work'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold'
              : 'text-[var(--accent-blue)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
          <span>Work</span>
        </button>
      </div>

      {/* Right: Upgrade Sparkles Button + Theme Toggle + User Profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={openSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          <span>Upgrade</span>
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={openSettings}
          className="w-7 h-7 rounded-full bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center hover:opacity-90 transition-opacity shadow-2xs"
          title={userName}
        >
          {userName.charAt(0).toUpperCase()}
        </button>
      </div>

    </header>
  );
}
