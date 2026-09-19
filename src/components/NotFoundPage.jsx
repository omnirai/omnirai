import React, { useState } from 'react';
import { 
  Home, 
  MessageSquarePlus, 
  Code, 
  Image as ImageIcon, 
  Folder, 
  FileText, 
  Calculator, 
  Compass, 
  ArrowLeft, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { OmniraLogo, OmniraIcon } from './OmniraLogo';
import LegalAndHelpModal from './LegalAndHelpModal';

export default function NotFoundPage({
  currentPath = window.location.pathname,
  onNavigateHome,
  onNavigateMode,
  onStartNewChat,
  darkMode = false,
  setDarkMode,
  currentUser
}) {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState(null);


  const displayPath = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/404');

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const promptText = query.trim();
    if (promptText && onStartNewChat) {
      onStartNewChat(promptText);
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const quickSuggestions = [
    { label: '✨ Ask AI a question', prompt: 'Hello! I need help with an idea.' },
    { label: '🎨 Generate AI Artwork', mode: 'images', prompt: 'Generate a futuristic cyberpunk city with neon lighting' },
    { label: '💻 Write code in Code Studio', mode: 'code', prompt: 'Create a responsive React navigation navbar component' },
    { label: '📁 View My Projects', mode: 'projects' }
  ];

  const studios = [
    {
      id: 'chat',
      title: 'Chat Studio',
      description: 'Conversational AI powered by GPT-4o, Claude 3.5 & DeepSeek R1',
      icon: MessageSquarePlus,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      badge: 'Main AI'
    },
    {
      id: 'code',
      title: 'Code Studio',
      description: 'Live code editor, real-time compiler & instant preview sandbox',
      icon: Code,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
      badge: 'IDE Sandbox'
    },
    {
      id: 'images',
      title: 'Image Studio',
      description: 'Ultra HD image synthesis with FLUX 1 Schnell & SDXL Lightning',
      icon: ImageIcon,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
      badge: 'FLUX AI'
    },
    {
      id: 'projects',
      title: 'Projects Hub',
      description: 'Persistent workspaces, file memory & dedicated custom contexts',
      icon: Folder,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
      badge: 'Workspace'
    }
  ];

  return (
    <div className="relative min-h-full w-full flex flex-col justify-between overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* Ambient Neural Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Radial Neon Glow Center */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-violet-600/15 via-blue-500/15 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 right-10 w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/10 via-purple-600/10 to-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Geometric Matrix Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top Navigation Bar on 404 */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigateHome?.()}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20 text-white">
            <OmniraIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">OMNIRA AI</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 rounded-md">
                404
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Next-Gen Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-xs flex items-center gap-1.5 border border-[var(--border-color)]"
              title="Toggle Theme"
            >
              <span>{darkMode ? '🌙 Dark' : '☀️ Light'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else if (onNavigateHome) {
                onNavigateHome();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => onNavigateHome?.()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all cursor-pointer shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </button>
        </div>
      </header>

      {/* Main 404 Hero Content */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center text-center">
        
        {/* Animated Neon 404 Emblem */}
        <div className="relative mb-6 group">
          {/* Pulsing ring aura */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-emerald-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
          
          <div className="relative flex flex-col items-center">
            {/* Big Gradient Number */}
            <div className="relative select-none font-black text-7xl sm:text-9xl tracking-tighter leading-none bg-gradient-to-b from-neutral-900 via-neutral-700 to-neutral-400 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent drop-shadow-sm">
              4<span className="text-violet-500 dark:text-violet-400">0</span>4
            </div>

            {/* Futuristic Status Pill */}
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Neural Route Not Found</span>
            </div>
          </div>
        </div>

        {/* Headline & Explanation */}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 text-[var(--text-primary)]">
          Lost in the Latent Space?
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg mb-6 leading-relaxed">
          The page or studio you are looking for <code className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-red-600 dark:text-red-400 font-mono text-xs border border-neutral-200 dark:border-neutral-700 break-all">{displayPath}</code> does not exist or has been shifted.
        </p>

        {/* Interactive "Ask AI to redirect you" Prompt Bar */}
        <div className="w-full max-w-xl mb-8">
          <form 
            onSubmit={handleSearchSubmit}
            className="relative flex items-center w-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-violet-500/50 focus-within:border-violet-500 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all p-1.5"
          >
            <div className="pl-3 pr-2 text-[var(--text-muted)] flex items-center">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask OMNIRA AI anything or start a prompt..."
              className="flex-1 bg-transparent py-2 px-1 text-sm outline-none text-[var(--text-primary)] placeholder-[var(--text-light)]"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-medium text-xs shadow-md shadow-violet-500/25 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Ask AI</span>
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {quickSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.mode && onNavigateMode) {
                    onNavigateMode(item.mode);
                  } else if (item.prompt && onStartNewChat) {
                    onStartNewChat(item.prompt);
                  } else if (onNavigateHome) {
                    onNavigateHome();
                  }
                }}
                className="text-xs px-3 py-1 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer active:scale-95"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => onNavigateHome?.()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-semibold text-sm shadow-lg shadow-black/10 dark:shadow-white/5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Go to AI Dashboard</span>
          </button>

          <button
            onClick={() => onStartNewChat ? onStartNewChat() : onNavigateHome?.()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-600 text-white hover:bg-violet-700 font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Start New Chat</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium text-sm transition-all cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
            <span>{copied ? 'Copied URL!' : 'Copy Path'}</span>
          </button>
        </div>

        {/* Explore Studios Navigation Grid */}
        <div className="w-full max-w-4xl text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Available Studios & Features</span>
            </h2>
            <span className="text-[11px] text-[var(--text-light)]">100% Operational</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {studios.map((studio) => {
              const IconComp = studio.icon;
              return (
                <div
                  key={studio.id}
                  onClick={() => onNavigateMode ? onNavigateMode(studio.id) : onNavigateHome?.()}
                  className="group relative p-4 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] hover:border-neutral-400/40 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-br ${studio.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[var(--text-muted)] border border-[var(--border-color)]">
                        {studio.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {studio.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                      {studio.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] font-medium text-violet-600 dark:text-violet-400 opacity-80 group-hover:opacity-100">
                    <span>Open Studio</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Diagnostics Accordion */}
        <div className="w-full max-w-xl mt-8">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-light)] hover:text-[var(--text-muted)] transition-colors cursor-pointer py-1"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showDiagnostics ? 'Hide System Diagnostics' : 'View Error Diagnostics'}</span>
          </button>

          {showDiagnostics && (
            <div className="mt-3 p-4 rounded-2xl bg-neutral-900 text-neutral-200 text-left font-mono text-xs border border-neutral-800 shadow-inner overflow-x-auto animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-neutral-400 text-[11px]">
                <span className="font-semibold text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>HTTP 404 (NOT_FOUND)</span>
                </span>
                <span>OMNIRA Kernel v3.4.1</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div><span className="text-neutral-500">Requested URI:</span> <span className="text-amber-300">{displayPath}</span></div>
                <div><span className="text-neutral-500">Timestamp:</span> <span className="text-neutral-300">{new Date().toISOString()}</span></div>
                <div><span className="text-neutral-500">Client Engine:</span> <span className="text-neutral-300">Quick AI Neural Runtime / Vite React</span></div>
                <div><span className="text-neutral-500">User Plan:</span> <span className="text-emerald-400">{currentUser?.plan || 'Free Active Tier'}</span></div>
                <div><span className="text-neutral-500">Status:</span> <span className="text-emerald-400">All Model APIs Online (GPT-4o, Claude 3.5, FLUX)</span></div>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/80 text-center text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>OMNIRA AI © {new Date().getFullYear()}</span>
          <span>•</span>
          <button 
            onClick={() => setLegalModalTab('terms')}
            className="hover:underline hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Terms
          </button>
          <span>•</span>
          <button 
            onClick={() => setLegalModalTab('privacy')}
            className="hover:underline hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Privacy
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => onNavigateMode ? onNavigateMode('chat') : onNavigateHome?.()}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Chat
          </button>
          <button 
            onClick={() => onNavigateMode ? onNavigateMode('code') : onNavigateHome?.()}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Code IDE
          </button>
          <button 
            onClick={() => onNavigateMode ? onNavigateMode('images') : onNavigateHome?.()}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Image Generator
          </button>
          <button 
            onClick={() => setLegalModalTab('help')}
            className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Help Center
          </button>
        </div>
      </footer>

      {/* Legal & Help Modal */}
      <LegalAndHelpModal
        isOpen={!!legalModalTab}
        initialTab={legalModalTab || 'terms'}
        onClose={() => setLegalModalTab(null)}
        currentUser={currentUser}
        onOpenSettings={onNavigateHome}
      />

    </div>
  );
}
