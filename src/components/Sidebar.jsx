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
  ChevronRight,
  Plus,
  Check,
  X,
  Zap,
  Sparkles,
  User,
  Settings,
  HelpCircle,
  FileText,
  Download,
  Keyboard,
  ShieldCheck,
  ShieldAlert,
  Bug
} from 'lucide-react';
import { GoogleLogo } from './AuthScreen';
import { OmniraLogo } from './OmniraLogo';
import LegalAndHelpModal from './LegalAndHelpModal';

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
  onLogout,
  projects = [],
  onAssignChatToProject,
  onCreateProject,
  userQuota = { used: 0, limit: 5, remaining: 5 },
  chatQuota = { used: 0, limit: 30, remaining: 30 }
}) {
  const userName = currentUser?.name || "Guest User";
  const isGuest = !currentUser || currentUser.provider === 'guest' || userName === "Guest User" || currentUser.email === 'guest@omnira.ai';

  // Context Menu State (Pin, Rename, Archive, Delete)
  const [contextMenu, setContextMenu] = useState(null); // { chat, x, y }
  const [renameModal, setRenameModal] = useState(null); // { chat, title }
  const [showArchived, setShowArchived] = useState(false);
  
  // User Profile Popup & Help Flyout State (Matches Screenshot 1 & 2)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpFlyoutOpen, setIsHelpFlyoutOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState(null); // 'terms' | 'privacy' | 'help' | 'releasenotes' | 'downloadapps' | 'reportbug'

  const asideRef = useRef(null);
  const touchTimerRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const helpTimerRef = useRef(null);

  const closeSidebarOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleOpenSettingsTab = (tab) => {
    setIsUserMenuOpen(false);
    setIsHelpFlyoutOpen(false);
    closeSidebarOnMobile();
    if (openSettings) {
      openSettings(tab);
    }
  };

  const handleOpenLegal = (tab) => {
    setIsUserMenuOpen(false);
    setIsHelpFlyoutOpen(false);
    closeSidebarOnMobile();
    setLegalModalTab(tab);
  };

  const handleHelpMouseEnter = () => {
    if (helpTimerRef.current) {
      clearTimeout(helpTimerRef.current);
      helpTimerRef.current = null;
    }
    setIsHelpFlyoutOpen(true);
  };

  const handleHelpMouseLeave = () => {
    if (helpTimerRef.current) clearTimeout(helpTimerRef.current);
    helpTimerRef.current = setTimeout(() => {
      setIsHelpFlyoutOpen(false);
    }, 300);
  };

  // Close menus & mobile drawer on outside click or escape
  useEffect(() => {
    const handleGlobalClick = (e) => {
      setContextMenu(null);
      setIsUserMenuOpen(false);
      setIsHelpFlyoutOpen(false);

      // Close mobile drawer if clicking outside the sidebar
      if (isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
        if (e.target.closest && e.target.closest('button[title*="sidebar"], button[title*="Sidebar"]')) {
          return;
        }
        if (asideRef.current && !asideRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setRenameModal(null);
        setIsUserMenuOpen(false);
        setIsHelpFlyoutOpen(false);
        if (isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
      if (helpTimerRef.current) clearTimeout(helpTimerRef.current);
    };
  }, [isOpen, setIsOpen]);


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
    { id: 'new-chat', label: 'New chat', icon: SquarePen, action: 'new-chat' },
    { id: 'images', label: 'Images', icon: ImageIcon, modeTarget: 'images' },
    { id: 'library', label: 'Library', icon: BookOpen, modeTarget: 'doc' },
    { id: 'scheduled', label: 'Scheduled', icon: Clock, modeTarget: 'math' },
    { id: 'projects', label: 'Projects', icon: Folder, modeTarget: 'projects', canCreate: true },
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
  const chatList = Array.isArray(chatHistory) ? chatHistory : [];
  const pinnedChats = chatList.filter((c) => c && c.pinned && !c.archived);
  const recentChats = chatList.filter((c) => c && !c.pinned && !c.archived);
  const archivedChats = chatList.filter((c) => c && c.archived);

  // Render individual chat item (Matches ChatGPT pure text styling)
  const renderChatItem = (chat) => {
    if (!chat || !chat.id) return null;
    const isSelected = chat.id === currentChatId && activeMode === 'chat';
    const isPinned = !!chat.pinned;

    return (
      <div
        key={chat.id}
        onClick={() => {
          onSelectChat(chat.id);
          closeSidebarOnMobile();
        }}
        onContextMenu={(e) => handleContextMenu(chat, e)}
        onTouchStart={(e) => handleTouchStart(chat, e)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13.5px] cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium' 
            : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-normal'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
          {isPinned && (
            <Pin className="w-3 h-3 text-neutral-500 fill-neutral-500 dark:text-neutral-400 dark:fill-neutral-400 shrink-0" />
          )}
          <span className="truncate flex-1 text-left text-[13.5px] leading-relaxed">
            {chat.title || "Untitled chat"}
          </span>
        </div>

        {/* 3 Dots Context Menu Trigger */}
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
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer shrink-0"
          title="Chat options"
        >
          <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.6]" />
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Sidebar Root Panel */}
      <aside 
        ref={asideRef}
        className={`fixed inset-y-0 left-0 z-[60] w-64 max-w-[85vw] bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]/50 flex flex-col transition-all duration-200 ease-in-out lg:relative lg:inset-auto lg:h-full lg:shrink-0 lg:z-50 ${
          isOpen ? 'translate-x-0 block' : '-translate-x-full hidden lg:hidden'
        }`}
      >
        {/* Top Header: Brand Logo, Search & Panel Toggle */}
        <div className="h-12 px-3 flex items-center justify-between shrink-0">
          <div 
            onClick={() => {
              setActiveMode('chat');
              onNewChat();
              closeSidebarOnMobile();
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <OmniraLogo 
              className="h-7" 
              iconSize="w-7 h-7"
              textClassName="text-[16px] font-bold tracking-tight"
            />
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder*="Search"]');
                if (searchInput) searchInput.focus();
              }}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[1.6]" />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4 stroke-[1.6]" />
            </button>
          </div>
        </div>

        {/* Navigation Categories Section (Matches ChatGPT) */}
        <div className="px-2 pt-1 pb-1 space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.action === 'new-chat' 
              ? false 
              : (activeMode === item.modeTarget && item.modeTarget !== undefined);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.action === 'new-chat') {
                    setActiveMode('chat');
                    onNewChat();
                  } else if (item.action === 'settings') {
                    handleOpenSettingsTab('general');
                  } else if (item.modeTarget) {
                    setActiveMode(item.modeTarget);
                  }
                  closeSidebarOnMobile();
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13.5px] cursor-pointer transition-colors ${
                  isItemActive 
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium' 
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 text-[var(--text-muted)] shrink-0 stroke-[1.6]" />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {item.canCreate && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMode('projects');
                        onCreateProject?.();
                        closeSidebarOnMobile();
                      }}
                      className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                      title="Create project"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[1.6]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat History Threads Area */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          
          {/* Pinned Chats Section */}
          {pinnedChats.length > 0 && (
            <div className="space-y-0.5">
              <div className="px-2.5 pt-2 pb-1 text-xs font-normal text-[var(--text-muted)] flex items-center gap-1.5">
                <Pin className="w-3 h-3 text-[var(--text-muted)] fill-[var(--text-muted)]" />
                <span>Pinned</span>
              </div>
              {pinnedChats.map(renderChatItem)}
            </div>
          )}

          {/* Recent Chats Section */}
          <div className="space-y-0.5">
            <div className="px-2.5 pt-2 pb-1 text-xs font-normal text-[var(--text-muted)]">
              Recents
            </div>

            {recentChats.length === 0 && pinnedChats.length === 0 ? (
              <div className="px-2.5 py-2 text-[13px] text-[var(--text-muted)] font-normal">
                No recent conversations
              </div>
            ) : (
              recentChats.map(renderChatItem)
            )}
          </div>

          {/* Guest Mode History Notice (Subtle, minimalist, non-intrusive) */}
          {isGuest && (
            <div className="mt-3 mx-1 p-2 rounded-lg border border-[var(--border-color)]/70 bg-[var(--bg-hover)]/30 text-xs">
              <div className="text-[11.5px] leading-snug text-[var(--text-muted)] mb-2 px-0.5 font-normal">
                Chats aren't saved in guest mode. Sign in to keep your history.
              </div>
              <button
                type="button"
                onClick={() => {
                  openAuth && openAuth();
                  closeSidebarOnMobile();
                }}
                className="w-full py-1 px-2.5 border border-[var(--border-color)] rounded-md text-xs font-normal text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3 h-3 stroke-[1.6]" />
                <span>Sign in</span>
              </button>
            </div>
          )}

          {/* Archived Chats Section */}
          {archivedChats.length > 0 && (
            <div className="pt-2 border-t border-[var(--border-color)]/40 space-y-1">
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className="w-full flex items-center justify-between px-2.5 py-1 text-xs font-normal text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5 stroke-[1.6]" />
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

        {/* Bottom User Profile Section (Matching ChatGPT) */}
        <div className="p-2 shrink-0 relative">
          
          {/* Main User Pill */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsHelpFlyoutOpen(false);
            }}
            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#10a37f] text-white font-medium text-xs flex items-center justify-center shrink-0 overflow-hidden">
                {currentUser?.picture || currentUser?.photoURL || (currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http'))) ? (
                  <img 
                    src={currentUser.picture || currentUser.photoURL || currentUser.avatar} 
                    alt={userName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'BD'
                )}
              </div>
              
              <div className="truncate text-left">
                <div className="font-normal text-[13px] text-[var(--text-primary)] truncate leading-tight">
                  {userName}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-normal leading-tight mt-0.5">
                  {currentUser?.plan || 'Free'}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openSettings && openSettings('billing');
              }}
              className="px-2.5 py-0.5 rounded-full text-xs font-normal text-[var(--text-primary)] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              Upgrade
            </button>
          </div>

          {/* User Account Popover Menu */}
          {isUserMenuOpen && (
            <div 
              className="absolute bottom-14 left-2 right-2 z-[75] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl py-1.5 backdrop-blur-md animate-fade-in text-sm font-normal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Item */}
              <div 
                onMouseEnter={() => setIsHelpFlyoutOpen(false)}
                onClick={() => {
                  handleOpenSettingsTab('account');
                }}
                className="flex items-center justify-between px-3.5 py-2 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#10a37f] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    {currentUser?.picture || currentUser?.photoURL || (currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http'))) ? (
                      <img 
                        src={currentUser.picture || currentUser.photoURL || currentUser.avatar} 
                        alt={userName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'BD'
                    )}
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
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </div>

              <div className="h-px bg-[var(--border-color)]/70 my-1" />

              {/* Upgrade plan */}
              <button
                onMouseEnter={() => setIsHelpFlyoutOpen(false)}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSettingsTab('billing');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left text-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span>Upgrade plan</span>
              </button>

              {/* Personalization */}
              <button
                onMouseEnter={() => setIsHelpFlyoutOpen(false)}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSettingsTab('personalization');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left text-xs cursor-pointer"
              >
                <Clock className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span>Personalization</span>
              </button>

              {/* Profile */}
              <button
                onMouseEnter={() => setIsHelpFlyoutOpen(false)}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSettingsTab('account');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left text-xs cursor-pointer"
              >
                <User className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span>Profile</span>
              </button>

              {/* Settings */}
              <button
                onMouseEnter={() => setIsHelpFlyoutOpen(false)}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSettingsTab('general');
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left text-xs cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <span>Settings</span>
              </button>

              <div className="h-px bg-[var(--border-color)]/70 my-1" />

              {/* Help with Submenu (Screenshot 1 & 2) */}
              <div 
                className="relative"
                onMouseEnter={() => setIsHelpFlyoutOpen(true)}
              >
                <button
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLegal('help');
                  }}
                  onMouseEnter={() => setIsHelpFlyoutOpen(true)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left text-xs cursor-pointer ${
                    isHelpFlyoutOpen ? 'bg-[var(--bg-hover)] font-semibold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    <span>Help</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </button>

                {/* Connected Help Flyout Submenu (Seamlessly Attached with invisible hover bridge) */}
                {isHelpFlyoutOpen && (
                  <div 
                    onMouseEnter={() => setIsHelpFlyoutOpen(true)}
                    className="absolute left-[calc(100%-2px)] bottom-0 w-60 z-[100] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 backdrop-blur-md animate-fade-in text-xs font-medium before:content-[''] before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLegal('help');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span>Help center</span>
                    </button>

                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLegal('releasenotes');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span>Release notes</span>
                    </button>

                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLegal('downloadapps');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span>Download apps</span>
                    </button>

                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSettingsTab('keyboard');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                    >
                      <Keyboard className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span>Keyboard shortcuts</span>
                    </button>

                    <div className="h-px bg-[var(--border-color)]/70 my-1" />

                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLegal('terms');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span>Terms of Service</span>
                    </button>

                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLegal('privacy');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span>Privacy Policy</span>
                    </button>

                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLegal('reportbug');
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                    >
                      <Bug className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span>Report a bug</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Log out / Sign in */}
              <button
                onMouseEnter={() => setIsHelpFlyoutOpen(false)}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(false);
                  setIsHelpFlyoutOpen(false);
                  closeSidebarOnMobile();
                  if (isGuest) {
                    openAuth && openAuth();
                  } else {
                    handleLogout();
                  }
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-red-500/10 text-red-500 transition-colors text-left text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                <span>{isGuest ? 'Sign in with Google' : 'Log out'}</span>
              </button>
            </div>
          )}
        </div>

      </aside>

      {/* Dedicated Legal & Help Center Modal (Terms, Privacy, Help, Release Notes, Apps, Bug Report) */}
      <LegalAndHelpModal
        isOpen={!!legalModalTab}
        initialTab={legalModalTab || 'terms'}
        onClose={() => setLegalModalTab(null)}
        currentUser={currentUser}
        onOpenSettings={openSettings}
      />

      {/* Context Menu Popup (Matches User Screenshot: Pin, Rename, Archive, Delete) */}
      {contextMenu && contextMenu.chat && (
        <div 
          className="fixed z-[70] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 w-48 backdrop-blur-md animate-fade-in text-sm font-medium"
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
            <Pin className={`w-4 h-4 shrink-0 ${contextMenu.chat.pinned ? 'fill-black text-black dark:fill-white dark:text-white' : 'text-[var(--text-primary)]'}`} />
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

          {/* Project Assignment Dropdown */}
          {Array.isArray(projects) && projects.length > 0 && contextMenu?.chat && (
            <div className="border-t border-[var(--border-color)]/60 my-1 pt-1 px-1">
              <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Project
              </div>
              {contextMenu.chat.projectId && (
                <button
                  onClick={() => {
                    onAssignChatToProject?.(contextMenu.chat.id, null);
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs rounded-lg transition-colors text-left cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Remove from project</span>
                </button>
              )}
              {projects.map(p => {
                if (!p || !p.id) return null;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAssignChatToProject?.(contextMenu.chat.id, p.id);
                      setContextMenu(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-[var(--bg-hover)] text-xs rounded-lg transition-colors text-left cursor-pointer ${
                      contextMenu.chat.projectId === p.id ? 'font-semibold text-violet-600 dark:text-violet-400' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="truncate">{p.icon || '📁'} {p.name}</span>
                    {contextMenu.chat.projectId === p.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

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
          className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setRenameModal(null)}
        >
          <div 
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-black dark:text-white" />
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
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] outline-none focus:border-black dark:focus:border-white"
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
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors shadow-xs cursor-pointer"
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
