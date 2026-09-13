import React from 'react';
import { 
  SquarePen, 
  MessageSquare, 
  Code, 
  FileText, 
  Calculator, 
  Image as ImageIcon, 
  Settings, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeft, 
  ExternalLink,
  Plus,
  Compass
} from 'lucide-react';

export default function Sidebar({ 
  activeMode, 
  setActiveMode, 
  darkMode, 
  setDarkMode, 
  openSettings, 
  isOpen, 
  setIsOpen,
  onNewChat,
  chatHistory = []
}) {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'code', label: 'Code Studio', icon: Code },
    { id: 'doc', label: 'Doc Writer', icon: FileText },
    { id: 'math', label: 'Math & Logic', icon: Calculator },
    { id: 'svg', label: 'SVG Studio', icon: ImageIcon },
  ];

  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] transition-all duration-200 ${
        isOpen ? 'w-64' : 'w-0 lg:w-16 overflow-hidden'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-[var(--border-color)]">
        <div className={`flex items-center gap-2.5 ${!isOpen && 'lg:hidden'}`}>
          <div className="w-7 h-7 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-bold text-xs shadow-sm">
            Q
          </div>
          <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">
            Quick AI
          </span>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          title="Toggle Sidebar"
        >
          {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all text-xs font-medium shadow-sm ${
            !isOpen && 'lg:justify-center lg:px-0'
          }`}
        >
          <SquarePen className="w-4 h-4 text-[var(--text-primary)]" />
          {isOpen && <span>New chat</span>}
        </button>
      </div>

      {/* Studio Modes Navigation */}
      <div className="px-3 py-1 space-y-1">
        <div className={`text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 ${!isOpen && 'lg:hidden'}`}>
          Studios
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMode(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive 
                  ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              } ${!isOpen && 'lg:justify-center lg:px-0'}`}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Recent Chats Section */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto px-3 py-2 mt-2 border-t border-[var(--border-color)]">
          <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 mb-1">
            Recents
          </div>
          {chatHistory.length === 0 ? (
            <div className="px-2 text-xs text-[var(--text-muted)] italic">No recent chats</div>
          ) : (
            <div className="space-y-0.5">
              {chatHistory.slice(-5).map((chat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMode('chat')}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] truncate block transition-colors"
                >
                  {chat.title || chat.content || `Session ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sidebar Footer / User Profile */}
      <div className="p-3 border-t border-[var(--border-color)] mt-auto">
        <div className={`flex items-center justify-between ${!isOpen && 'lg:flex-col lg:gap-2'}`}>
          
          <a
            href="https://bishalcodes.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity truncate"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-semibold text-[10px]">
              B
            </div>
            {isOpen && (
              <div className="truncate text-xs">
                <div className="font-semibold text-[var(--text-primary)] truncate">bishalcodes.com</div>
                <div className="text-[10px] text-[var(--text-muted)]">Free • Zero API Key</div>
              </div>
            )}
          </a>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={openSettings}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </aside>
  );
}
