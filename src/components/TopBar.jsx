import React from 'react';
import { PanelLeft, ChevronDown, ShieldCheck, Settings } from 'lucide-react';

export default function TopBar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  settings, 
  openSettings 
}) {
  const getEngineLabel = () => {
    if (settings.engineMode === 'transformers-wasm') return 'Local WASM LLM';
    if (settings.engineMode === 'ollama-local') return 'Ollama Local';
    return 'Quick AI Local Engine';
  };

  return (
    <header className="h-14 border-b border-[var(--border-color)] px-4 flex items-center justify-between bg-[var(--bg-primary)] sticky top-0 z-30 transition-colors">
      
      {/* Left Sidebar Toggle (if hidden/collapsed) */}
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            title="Open Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)] lg:hidden">
          Quick AI
        </span>
      </div>

      {/* Center Model Selector Pill (ChatGPT / Gemini style) */}
      <button
        onClick={openSettings}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-all text-xs font-semibold text-[var(--text-primary)] shadow-sm"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-primary)]" />
        <span>{getEngineLabel()}</span>
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
      </button>

      {/* Right Action Badge */}
      <div className="flex items-center gap-2">
        <a 
          href="https://bishalcodes.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hidden sm:block transition-colors"
        >
          created by bishalcodes.com
        </a>
        <button
          onClick={openSettings}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
}
