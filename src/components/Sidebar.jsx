import React, { useState, useRef, useEffect } from 'react';
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
  LogIn,
  Pin,
  Pencil,
  Archive,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { GoogleLogo } from './AuthScreen';
import { OmniraLogo } from './OmniraLogo';

export default function Sidebar({ 
  isOpen, 
  setIsOpen, 
  onNewChat, 
  chatHistory = [], 
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onPinChat,
  onRenameChat,
  onArchiveChat,
  openSettings,
  openAuth,
  activeMode,
  setActiveMode,
  currentUser,
  onLogout
}) {
  const userName = currentUser?.name || "Guest User";
  const isGuest = !currentUser || currentUser.provider === 'guest' || userName === "Guest User";

  // Context Menu State (Pin, Rename, Archive, Delete)
  const [contextMenu, setContextMenu] = useState(null); // { chat, x, y }
  const [renameModal, setRenameModal] = useState(null); // { chat, title }
  const [showArchived, setShowArchived] = useState(false);
  const touchTimerRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setRenameModal(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Long-press Touch Handlers for Mobile
  const handleTouchStart = (chat, e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) {
        try { navigator.vibrate(40); } catch (_) {}
      }
      setContextMenu({
        chat,
        x: touch.clientX,
        y: touch.clientY
      });
    }, 500);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    // If scrolled more than 10px, cancel long-press
    if (dx > 10 || dy > 10) {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  // Right-click context menu handler for desktop
  const handleContextMenu = (chat, e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      chat,
      x: e.clientX,
      y: e.clientY
    });
  };

  const mainNavItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, modeTarget: 'chat' },
    { id: 'images', label: 'Images', icon: ImageIcon, badge: 'GALLERY', modeTarget: 'images' },
    { id: 'library', label: 'Library', icon: BookOpen, modeTarget: 'doc' },
    { id: 'scheduled', label: 'Scheduled', icon: Clock, modeTarget: 'math' },
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

  // Separate pinned, active recents, and archived chats
  const pinnedChats = chatHistory.filter((c) => c.pinned && !c.archived);
  const recentChats = chatHistory.filter((c) => !c.pinned && !c.archived);
  const archivedChats = chatHistory.filter((c) => c.archived);

  // Render individual chat item
  const renderChatItem = (chat) => {
    const isSelected = currentChatId === chat.id && activeMode === 'chat';
    return (
      <div
        key={chat.id}
        onClick={() => {
          onSelectChat(chat.id);
          setActiveMode('chat');
        }}
        onTouchStart={(e) => handleTouchStart(chat, e)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => handleContextMenu(chat, e)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all select-none ${
          isSelected 
            ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold shadow-2xs' 
            : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-6">
          {chat.pinned && (
            <Pin className="w-3 h-3 text-emerald-500 fill-emerald-500 shrink-0" />
          )}
          <span className="truncate">
            {chat.title || 'New Chat'}
          </span>
        </div>

        {/* Action Button: triggers context popup */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setContextMenu({
              chat,
              x: rect.left,
              y: rect.bottom + 4
            });
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all absolute right-1.5 shrink-0"
          title="Chat options"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    );
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
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] transition-all duration-200 select-none pt-[env(safe-area-inset-top,0px)] ${
          isOpen ? 'w-64' : 'w-0 lg:w-0 overflow-hidden border-none'
        }`}
      >
        {/* Top Sidebar Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-transparent">
          <OmniraLogo iconSize="w-6 h-6" textClassName="text-base font-bold tracking-tight" />

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
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all text-sm font-medium shadow-2xs group cursor-pointer"
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
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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

        {/* Chat History Threads Area */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
          
          {/* Pinned Chats Section */}
          {pinnedChats.length > 0 && (
            <div className="space-y-0.5">
              <div className="px-2.5 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase flex items-center gap-1.5 mb-1">
                <Pin className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                <span>Pinned</span>
              </div>
              {pinnedChats.map(renderChatItem)}
            </div>
          )}

          {/* Recent Chats Section */}
          <div className="space-y-0.5">
            <div className="px-2.5 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase mb-1">
              Recents
            </div>

            {recentChats.length === 0 && pinnedChats.length === 0 ? (
              <div className="px-2.5 py-2 text-xs text-[var(--text-muted)] italic">
                No recent conversations
              </div>
            ) : (
              recentChats.map(renderChatItem)
            )}
          </div>

          {/* Archived Chats Section */}
          {archivedChats.length > 0 && (
            <div className="pt-2 border-t border-[var(--border-color)]/60 space-y-1">
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Archive className="w-3 h-3" />
                  <span>Archived ({archivedChats.length})</span>
                </div>
                {showArchived ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>

              {showArchived && (
                <div className="space-y-0.5 pl-1">
                  {archivedChats.map(renderChatItem)}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom User Profile Section with Sign In / Log Out */}
        <div className="p-3 border-t border-[var(--border-color)] mt-auto space-y-1.5">
          <div 
            onClick={() => openSettings && openSettings('account')}
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
                if (openSettings) openSettings('billing');
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

      {/* Context Menu Popup (Matches User Screenshot: Pin, Rename, Archive, Delete) */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 w-48 backdrop-blur-md animate-fade-in text-sm font-medium"
          style={{
            top: Math.max(16, Math.min(contextMenu.y, window.innerHeight - 230)),
            left: Math.max(16, Math.min(contextMenu.x, window.innerWidth - 210))
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Pin */}
          <button
            onClick={() => {
              onPinChat?.(contextMenu.chat.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
          >
            <Pin className={`w-4 h-4 shrink-0 ${contextMenu.chat.pinned ? 'fill-emerald-500 text-emerald-500' : 'text-[var(--text-primary)]'}`} />
            <span>{contextMenu.chat.pinned ? 'Unpin' : 'Pin'}</span>
          </button>

          {/* 2. Rename */}
          <button
            onClick={() => {
              const chatToRename = contextMenu.chat;
              setContextMenu(null);
              setRenameModal({ chat: chatToRename, title: chatToRename.title || '' });
            }}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
          >
            <Pencil className="w-4 h-4 shrink-0 text-[var(--text-primary)]" />
            <span>Rename</span>
          </button>

          {/* 3. Archive */}
          <button
            onClick={() => {
              onArchiveChat?.(contextMenu.chat.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
          >
            <Archive className="w-4 h-4 shrink-0 text-[var(--text-primary)]" />
            <span>{contextMenu.chat.archived ? 'Unarchive' : 'Archive'}</span>
          </button>

          {/* 4. Delete */}
          <button
            onClick={() => {
              const chatId = contextMenu.chat.id;
              setContextMenu(null);
              onDeleteChat(chatId);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 hover:bg-red-500/10 text-red-500 transition-colors text-left border-t border-[var(--border-color)]/60 mt-1 pt-2.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0 text-red-500" />
            <span className="font-semibold text-red-500">Delete</span>
          </button>
        </div>
      )}

      {/* Real Rename Modal */}
      {renameModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setRenameModal(null)}
        >
          <div 
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">Rename Chat</h3>
            </div>
            
            <input
              type="text"
              value={renameModal.title}
              onChange={(e) => setRenameModal({ ...renameModal, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRenameChat?.(renameModal.chat.id, renameModal.title);
                  setRenameModal(null);
                } else if (e.key === 'Escape') {
                  setRenameModal(null);
                }
              }}
              autoFocus
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] outline-none focus:border-emerald-500"
              placeholder="Enter new chat title..."
            />
            
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRenameModal(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRenameChat?.(renameModal.chat.id, renameModal.title);
                  setRenameModal(null);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
