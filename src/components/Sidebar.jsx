import React from 'react';
import { 
  SquarePen, 
  Search, 
  PanelLeftClose, 
  ImageIcon, 
  BookOpen, 
  Clock, 
  Plug, 
  Folder, 
  Terminal, 
  MoreHorizontal,
  Trash2,
  MessageSquare,
  LogOut,
  LogIn
} from 'lucide-react';
import { GoogleLogo } from './AuthScreen';

export default function Sidebar({ 
  isOpen, 
  setIsOpen, 
  onNewChat, 
  chatHistory = [], 
  currentChatId,
  onSelectChat,
  onDeleteChat,
  openSettings,
  openAuth,
  activeMode,
  setActiveMode,
  currentUser,
  onLogout
}) {
  const userName = currentUser?.name || "Guest User";
  const isGuest = !currentUser || currentUser.provider === 'guest' || userName === "Guest User";

  const mainNavItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, modeTarget: 'chat' },
    { id: 'images', label: 'Images', icon: ImageIcon, badge: 'UPDATED', modeTarget: 'svg' },
    { id: 'library', label: 'Library', icon: BookOpen, modeTarget: 'doc' },
    { id: 'scheduled', label: 'Scheduled', icon: Clock, modeTarget: 'math' },
    { id: 'plugins', label: 'Plugins', icon: Plug, action: 'settings' },
    { id: 'projects', label: 'Projects', icon: Folder, action: 'settings' },
    { id: 'codex', label: 'Codex', icon: Terminal, modeTarget: 'code' },
    { id: 'more', label: 'More', icon: MoreHorizontal, action: 'settings' }
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of OMNIRA?')) {
      if (onLogout) {
        onLogout();
      } else {
        localStorage.removeItem('omnira_authenticated');
        localStorage.removeItem('omnira_user');
        window.location.reload();
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-2xs"
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] transition-all duration-200 select-none ${
          isOpen ? 'w-64' : 'w-0 lg:w-0 overflow-hidden border-none'
        }`}
      >
        {/* Top Sidebar Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-transparent">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
              OMNIRA
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={openSettings}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-3 py-1">
          <button
            onClick={() => {
              onNewChat();
              setActiveMode('chat');
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all text-sm font-medium shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <SquarePen className="w-4 h-4 text-[var(--text-primary)]" />
              <span>New chat</span>
            </div>
          </button>
        </div>

        {/* Primary Features Navigation */}
        <div className="px-2 py-2 space-y-0.5 border-b border-[var(--border-color)]">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMode === (item.modeTarget || item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action === 'settings') {
                    openSettings();
                  } else if (item.modeTarget) {
                    setActiveMode(item.modeTarget);
                  }
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive 
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold' 
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recent Chat Threads History */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="px-2.5 text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">
            Recents
          </div>

          {chatHistory.length === 0 ? (
            <div className="px-2.5 py-2 text-xs text-[var(--text-muted)] italic">
              No recent conversations
            </div>
          ) : (
            chatHistory.map((chat) => {
              const isSelected = currentChatId === chat.id && activeMode === 'chat';
              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    setActiveMode('chat');
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold' 
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <span className="truncate pr-6">
                    {chat.title || 'New Chat'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition-all absolute right-2"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom User Profile Section with Sign In / Log Out */}
        <div className="p-3 border-t border-[var(--border-color)] mt-auto space-y-1.5">
          <div 
            onClick={openSettings}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'GU'}
              </div>
              
              <div className="truncate text-xs">
                <div className="font-semibold text-[var(--text-primary)] truncate leading-tight">
                  {userName}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight">
                  {currentUser?.plan || 'Free'}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openSettings();
              }}
              className="px-2.5 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] shadow-2xs shrink-0"
            >
              Upgrade
            </button>
          </div>

          {/* Sign In with Google / Account button if in Guest mode */}
          {isGuest && openAuth ? (
            <button
              onClick={openAuth}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-sm"
            >
              <GoogleLogo className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              <span>Log out</span>
            </button>
          )}
        </div>

      </aside>
    </>
  );
}
