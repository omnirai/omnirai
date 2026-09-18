import React from 'react';
import { OmniraLogo } from './OmniraLogo';
import { 
  MessageSquare, 
  Code, 
  FileText, 
  Calculator, 
  Image as ImageIcon, 
  Settings, 
  Sun, 
  Moon, 
  ShieldCheck, 
  ExternalLink,
  Zap
} from 'lucide-react';

export default function Header({ 
  activeMode, 
  setActiveMode, 
  darkMode, 
  setDarkMode, 
  openSettings,
  engineMode 
}) {
  const modes = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'code', label: 'Code Studio', icon: Code },
    { id: 'doc', label: 'Doc Writer', icon: FileText },
    { id: 'math', label: 'Math & Logic', icon: Calculator },
    { id: 'svg', label: 'SVG Studio', icon: ImageIcon },
  ];

  const getEngineBadgeLabel = () => {
    if (engineMode === 'transformers-wasm') return 'Local WASM LLM';
    if (engineMode === 'ollama-local') return 'Ollama Local';
    return '100% Local Neural Engine';
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-color px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <OmniraLogo iconSize="w-7 h-7" textClassName="text-lg font-extrabold tracking-tight" />
            <span className="text-xs px-2 py-0.5 rounded border border-color font-medium text-muted flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {getEngineBadgeLabel()}
            </span>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1 md:hidden">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="btn btn-icon btn-sm"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={openSettings}
              className="btn btn-icon btn-sm"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Studio Modes Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto py-1 md:py-0 no-scrollbar">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className={`btn btn-sm whitespace-nowrap ${
                  isActive ? 'btn-primary' : 'bg-transparent border-transparent text-secondary hover:text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="btn btn-sm"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>

          <button 
            onClick={openSettings}
            className="btn btn-sm"
            title="Engine Settings"
          >
            <Settings className="w-4 h-4" />
            <span>Config</span>
          </button>
        </div>

      </div>
    </header>
  );
}
