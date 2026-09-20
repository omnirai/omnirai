import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatStudio from './components/ChatStudio';
import CodeStudio from './components/CodeStudio';
import DocStudio from './components/DocStudio';
import MathStudio from './components/MathStudio';
import SvgStudio from './components/SvgStudio';
import ImagesStudio from './components/ImagesStudio';
import ProjectsStudio from './components/ProjectsStudio';
import SettingsModal from './components/SettingsModal';
import AuthScreen from './components/AuthScreen';
import GoogleOneTapPrompt from './components/GoogleOneTapPrompt';
import NotFoundPage from './components/NotFoundPage';
import LegalAndHelpModal from './components/LegalAndHelpModal';
import { 
  queryQuickAi, 
  getBackendImageQuota, 
  isImagePrompt, 
  getDailyChatUsage, 
  incrementDailyChatUsage 
} from './engine/quickAiEngine';
import { 
  syncAllSessionsToCloud, 
  loadSessionsFromCloud, 
  deleteSessionFromCloud 
} from './firebase';

const VALID_MODES = [
  'chat', 
  'code', 
  'images', 
  'projects', 
  'doc', 
  'math', 
  'svg',
  'terms',
  'privacy',
  'help',
  'legal',
  'docs',
  'releasenotes',
  'downloadapps',
  'reportbug',
  'keyboard'
];

const getModeFromPath = (pathname) => {
  if (!pathname) return 'chat';
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean || clean === 'chat') return 'chat';
  if (VALID_MODES.includes(clean)) return clean;
  return '404';
};

// Helper to determine if the active user is truly signed in (not guest)
export const isUserSignedIn = (user) => {
  if (!user) return false;
  if (user.provider === 'guest') return false;
  if (!user.email || user.email === 'guest@omnira.ai') return false;
  if (user.name === 'Guest User') return false;
  return true;
};

// Storage key helper for user chat history
export const getUserChatStorageKey = (user) => {
  if (!isUserSignedIn(user)) return null;
  const id = user.uid || user.email || 'user';
  return `omnira_chats_${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [activeMode, setActiveMode] = useState(() => {
    return typeof window !== 'undefined' ? getModeFromPath(window.location.pathname) : 'chat';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('account');
  const handleOpenSettings = (tab = 'account') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Ensure mobile drawer closes if settings or auth modal is active
  useEffect(() => {
    if (isSettingsOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [isSettingsOpen]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userQuota, setUserQuota] = useState({ used: 0, limit: 5, remaining: 5 });
  const [chatQuota, setChatQuota] = useState({ used: 0, limit: 30, remaining: 30 });

  // Authentication State - Default to ACTIVE (Guest User) so anyone enters app directly!
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('omnira_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Guest User',
      email: 'guest@omnira.ai',
      username: '@guest_user',
      avatar: 'GU',
      provider: 'guest',
      plan: 'Free'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('omnira_authenticated');
    const userRaw = localStorage.getItem('omnira_user');
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        return isUserSignedIn(u);
      } catch (e) {}
    }
    return saved === 'true';
  });

  // Selected Active AI Model
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('chatgpt_selected_model');
    return saved || 'gpt-4o';
  });

  // Light Mode by default
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('chatgpt_theme');
    return saved ? saved === 'dark' : false;
  });

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('chatgpt_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      engineMode: 'quick-local-neural',
      modelName: 'Xenova/Qwen1.5-0.5B-Chat',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3',
      apiKey: '',           // Groq API key (legacy)
      openrouterKey: '',    // OpenRouter key → unlocks Claude, DeepSeek, Gemini paid
      geminiKey: '',        // Direct Google Gemini API key (from aistudio.google.com)
      enableDictation: true,
      temperature: 0.7
    };
  });

  // Chat History Sessions State
  // ONLY loaded if the user is authenticated & signed in! Guests start with a fresh session
  const [chatSessions, setChatSessions] = useState(() => {
    let savedUser = null;
    try {
      const rawUser = localStorage.getItem('omnira_user');
      if (rawUser) savedUser = JSON.parse(rawUser);
    } catch (e) {}

    if (isUserSignedIn(savedUser)) {
      const userKey = getUserChatStorageKey(savedUser);
      const saved = (userKey && localStorage.getItem(userKey)) || localStorage.getItem('chatgpt_sessions') || localStorage.getItem('OMNIRA_sessions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }

    // Guest users start with a fresh temporary session
    return [{ id: 'default-session-1', title: 'New chat', messages: [] }];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    let savedUser = null;
    try {
      const rawUser = localStorage.getItem('omnira_user');
      if (rawUser) savedUser = JSON.parse(rawUser);
    } catch (e) {}

    if (isUserSignedIn(savedUser)) {
      const saved = localStorage.getItem('chatgpt_current_id');
      if (saved) return saved;
    }
    return 'default-session-1';
  });

  // Projects State with LocalStorage Persistence
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('omnira_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'proj-bishal-codes',
        name: 'bishal codes',
        icon: '📁',
        instructions: 'Focus on production-ready modern JavaScript, React, and Python. Keep explanations clear, clean, and concise.',
        memory: 'default',
        libraryAccess: 'enabled',
        isPinned: false,
        createdBy: 'you',
        createdAt: Date.now() - 86400000 * 2,
        modifiedAt: Date.now() - 86400000 * 2,
        modifiedDisplay: 'Wednesday',
        files: []
      }
    ];
  });

  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('omnira_projects', JSON.stringify(projects));
  }, [projects]);

  // Persist Auth State & Current User
  useEffect(() => {
    localStorage.setItem('omnira_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('omnira_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Restore user cloud sessions across devices (Firestore Cloud Sync)
  const restoreUserCloudSessions = async (userId, userStorageKey) => {
    if (!userId) return;
    try {
      const cloudSessions = await loadSessionsFromCloud(userId);
      if (cloudSessions && cloudSessions.length > 0) {
        setChatSessions((prev) => {
          const map = new Map();
          // 1. Populate with cloud sessions
          cloudSessions.forEach((s) => {
            if (s && s.id) map.set(s.id, s);
          });
          // 2. Preserve active local/guest messages if newer
          const activeLocal = prev.filter((s) => s && Array.isArray(s.messages) && s.messages.length > 0);
          activeLocal.forEach((s) => {
            const existing = map.get(s.id);
            if (!existing || ((s.messages?.length || 0) > (existing.messages?.length || 0))) {
              map.set(s.id, s);
            }
          });
          const merged = Array.from(map.values());
          if (userStorageKey) {
            try {
              const str = JSON.stringify(merged);
              localStorage.setItem(userStorageKey, str);
              localStorage.setItem('chatgpt_sessions', str);
            } catch (_) {}
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to restore cloud sessions:', err);
    }
  };

  // Persist Chat History ONLY IF User is Signed In
  useEffect(() => {
    if (isUserSignedIn(currentUser)) {
      const userKey = getUserChatStorageKey(currentUser);
      if (userKey) {
        try {
          const serialized = JSON.stringify(chatSessions);
          localStorage.setItem(userKey, serialized);
          localStorage.setItem('chatgpt_sessions', serialized);
          localStorage.setItem('OMNIRA_sessions', serialized);
          localStorage.setItem('chatgpt_current_id', currentChatId);
        } catch (err) {
          console.warn('Failed to save chat sessions to localStorage:', err);
        }
      }

      // Automatically sync to Cloud Firestore for cross-device access
      if (currentUser?.uid) {
        const timer = setTimeout(() => {
          syncAllSessionsToCloud(currentUser.uid, chatSessions).catch((err) => {
            console.warn('Firestore cloud sync notice:', err);
          });
        }, 1200);
        return () => clearTimeout(timer);
      }
    } else {
      // Guest users: chats are strictly ephemeral in-memory, NOT persisted!
      localStorage.removeItem('chatgpt_sessions');
      localStorage.removeItem('OMNIRA_sessions');
      localStorage.removeItem('chatgpt_current_id');
    }
  }, [chatSessions, currentChatId, currentUser]);

  // Sync state if chats are cleared or archived from SettingsModal
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'chatgpt_sessions' || e.type === 'omnira_chat_update') {
        const raw = localStorage.getItem('chatgpt_sessions');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setChatSessions(parsed.length > 0 ? parsed : [{ id: `session-${Date.now()}`, title: 'New chat', messages: [] }]);
            }
          } catch (_) {}
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('omnira_chat_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('omnira_chat_update', handleStorageChange);
    };
  }, []);

  // Handle Google Redirect Result and Firebase Auth state changes
  useEffect(() => {
    let unsubscribe = () => {};
    import('./firebase').then(({ auth, getRedirectResult, onAuthStateChanged }) => {
      if (getRedirectResult) {
        getRedirectResult(auth).then((result) => {
          if (result && result.user) {
            const u = result.user;
            const customAvatar = localStorage.getItem('omnira_user_avatar');
            const loggedInUser = {
              name: u.displayName || u.email?.split('@')[0] || 'Google User',
              email: u.email,
              username: `@${(u.email || 'user').split('@')[0]}`,
              avatar: customAvatar || u.photoURL || (u.displayName || 'G').charAt(0),
              picture: customAvatar || u.photoURL,
              photoURL: customAvatar || u.photoURL,
              provider: 'google',
              uid: u.uid,
              plan: 'Pro'
            };
            setCurrentUser(loggedInUser);
            setIsAuthenticated(true);
            localStorage.setItem('omnira_logged_in', 'true');
            setIsAuthModalOpen(false);

            // 1. Quick restore from local cache
            const userKey = getUserChatStorageKey(loggedInUser);
            const savedChats = userKey ? localStorage.getItem(userKey) : null;
            if (savedChats) {
              try {
                const parsed = JSON.parse(savedChats);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setChatSessions((prev) => {
                    const activeGuestChats = prev.filter(s => s && Array.isArray(s.messages) && s.messages.length > 0);
                    if (activeGuestChats.length > 0) {
                      return [...activeGuestChats, ...parsed.filter(p => !activeGuestChats.some(g => g.id === p.id))];
                    }
                    return parsed;
                  });
                }
              } catch (e) {}
            }

            // 2. Fetch cross-device chat history from Cloud Firestore
            restoreUserCloudSessions(u.uid, userKey);
          }
        }).catch((err) => {
          console.warn('Redirect sign-in notice:', err);
        });
      }

      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const customAvatar = localStorage.getItem('omnira_user_avatar');
          const isGoogle = user.providerData?.some(p => p.providerId === 'google.com') || user.providerId === 'google.com';
          const loggedInUser = {
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            username: `@${(user.email || 'user').split('@')[0]}`,
            avatar: customAvatar || user.photoURL || (user.displayName || 'U').charAt(0),
            picture: customAvatar || user.photoURL,
            photoURL: customAvatar || user.photoURL,
            provider: isGoogle ? 'google' : 'email',
            uid: user.uid,
            plan: 'Pro'
          };
          setCurrentUser(loggedInUser);
          setIsAuthenticated(true);
          localStorage.setItem('omnira_logged_in', 'true');

          // 1. Quick restore from local cache
          const userKey = getUserChatStorageKey(loggedInUser);
          const savedChats = userKey ? localStorage.getItem(userKey) : null;
          if (savedChats) {
            try {
              const parsed = JSON.parse(savedChats);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setChatSessions((prev) => {
                  const activeGuestChats = prev.filter(s => s && Array.isArray(s.messages) && s.messages.length > 0);
                  if (activeGuestChats.length > 0) {
                    return [...activeGuestChats, ...parsed.filter(p => !activeGuestChats.some(g => g.id === p.id))];
                  }
                  return parsed;
                });
              }
            } catch (e) {}
          }

          // 2. Fetch cross-device chat history from Cloud Firestore
          restoreUserCloudSessions(user.uid, userKey);
        }
      });
    }).catch(err => console.error('Firebase initialization error', err));

    return () => unsubscribe();
  }, []);

  // Handlers for Auth
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    // If switching to signed-in user, restore their chat history
    if (isUserSignedIn(user)) {
      const userKey = getUserChatStorageKey(user);
      const savedUserChats = userKey ? localStorage.getItem(userKey) : null;
      if (savedUserChats) {
        try {
          const parsed = JSON.parse(savedUserChats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatSessions((prev) => {
              const activeGuestChats = prev.filter(s => s && Array.isArray(s.messages) && s.messages.length > 0);
              if (activeGuestChats.length > 0) {
                return [...activeGuestChats, ...parsed.filter(p => !activeGuestChats.some(g => g.id === p.id))];
              }
              return parsed;
            });
            setCurrentChatId(parsed[0].id);
          }
        } catch (e) {}
      }

      // Fetch latest cross-device chat history from Cloud Firestore
      if (user.uid) {
        restoreUserCloudSessions(user.uid, userKey);
      }
    }
  };

  const handleLogout = () => {
    import('./firebase').then(({ auth, signOut }) => {
      signOut(auth).catch(() => {});
    });
    // Clear persisted sessions in general storage so guest cannot view previous user's history
    localStorage.removeItem('chatgpt_sessions');
    localStorage.removeItem('OMNIRA_sessions');
    localStorage.removeItem('chatgpt_current_id');
    localStorage.removeItem('omnira_authenticated');
    localStorage.removeItem('omnira_logged_in');

    const freshGuestId = `session-${Date.now()}`;
    setChatSessions([{ id: freshGuestId, title: 'New chat', messages: [] }]);
    setCurrentChatId(freshGuestId);

    // Switch to Guest Mode without blocking site access!
    setCurrentUser({
      name: 'Guest User',
      email: 'guest@omnira.ai',
      username: '@guest_user',
      avatar: 'GU',
      provider: 'guest',
      plan: 'Free'
    });
    setIsAuthenticated(false);
    setIsSettingsOpen(false);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Get Active Chat Messages (with complete null safety)
  const sessionList = Array.isArray(chatSessions) && chatSessions.length > 0 ? chatSessions : [{ id: 'default-session-1', title: 'New chat', messages: [] }];
  const currentSession = sessionList.find(s => s && s.id === currentChatId) || sessionList[0];
  const messages = (currentSession && Array.isArray(currentSession.messages)) ? currentSession.messages : [];

  // Send Message Handler
  const handleSendMessage = async (userText, attachedFile = null, options = {}) => {
    const userMsg = {
      role: 'user',
      content: userText,
      attachedFile,
      timestamp: new Date().toLocaleTimeString()
    };

    const isImageReq = options.isImage || isImagePrompt(userText, activeMode, selectedModel);
    if (isImageReq && selectedModel !== 'cloudflare-image') {
      setSelectedModel('cloudflare-image');
    }
    const userId = currentUser?.uid || currentUser?.email || 'guest_user';

    // 1. Strict Daily Image Limit Check (5 images/day on Free tier)
    if (isImageReq && currentUser?.plan !== 'Pro' && (userQuota.used >= (userQuota.limit || 5))) {
      const limitImgMsg = {
        id: `img-limit-${Date.now()}`,
        role: 'assistant',
        type: 'image_generation',
        error: `Daily limit reached (${userQuota.limit || 5}/${userQuota.limit || 5} images today). Quota resets at 00:00 UTC. Upgrade to Pro for high-capacity generation.`,
        prompt: userText,
        isLoading: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === (currentSession?.id || currentChatId)
            ? { ...s, messages: [...messages, userMsg, limitImgMsg] }
            : s
        )
      );
      return;
    }

    // 2. Strict Daily Chat Limit Check (30 chats/day on Free tier)
    if (!isImageReq) {
      const currentUsage = getDailyChatUsage(userId, currentUser?.plan);
      if (currentUser?.plan !== 'Pro' && currentUsage.used >= currentUsage.limit) {
        const limitChatMsg = {
          role: 'assistant',
          content: `⚠️ **Daily Chat Limit Reached**: You have used all **${currentUsage.limit} free chat messages** for today. Your daily limit resets at 00:00 UTC.\n\n[Open Settings to Upgrade to Pro Plan] for unlimited chats.`,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === (currentSession?.id || currentChatId)
              ? { ...s, messages: [...messages, userMsg, limitChatMsg] }
              : s
          )
        );
        return;
      }
      incrementDailyChatUsage(userId);
      setChatQuota(getDailyChatUsage(userId, currentUser?.plan));
    }

    const loadingId = `img-loading-${Date.now()}`;

    const placeholderImageMsg = isImageReq ? {
      id: loadingId,
      role: 'assistant',
      type: 'image_generation',
      prompt: userText,
      userPrompt: userText,
      modelPrompt: userText,
      isLoading: true,
      timestamp: new Date().toLocaleTimeString()
    } : null;

    // Update Session with User Message & Placeholder loading card
    const updatedMessages = isImageReq ? [...messages, userMsg, placeholderImageMsg] : [...messages, userMsg];
    
    // Generate Title if first message
    let sessionTitle = currentSession?.title || 'New chat';
    if (messages.length === 0 && userText) {
      sessionTitle = userText.slice(0, 30) + (userText.length > 30 ? '...' : '');
    }

    const targetSessionId = currentSession?.id || currentChatId;

    setChatSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === targetSessionId
          ? { ...s, title: sessionTitle, messages: updatedMessages }
          : s
      )
    );

    setIsGenerating(true);

    try {
      const activeProject = currentSession?.projectId 
        ? projects.find(p => p.id === currentSession.projectId) 
        : null;

      const response = await queryQuickAi({
        prompt: userText,
        selectedModel,
        mode: options.isImage ? 'image' : activeMode,
        history: messages,
        fileData: attachedFile,
        currentUser,
        projectContext: activeProject,
        settings
      });

      if (activeProject) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === activeProject.id
              ? { ...p, modifiedAt: Date.now(), modifiedDisplay: 'Just now' }
              : p
          )
        );
      }

      let finalAssistantMsg;
      if (typeof response === 'object' && response !== null && (response.image || response.error || response.success !== undefined)) {
        if (response.quota) {
          setUserQuota(response.quota);
        } else if (response.image) {
          // Local fallback sync
          const dateStr = new Date().toISOString().slice(0, 10);
          const localImgKey = `omnira_img_count_${dateStr}_${userId}`;
          const currentCount = parseInt(localStorage.getItem(localImgKey) || '0', 10) + 1;
          localStorage.setItem(localImgKey, String(currentCount));
          const limit = currentUser?.plan === 'Pro' ? 50 : 5;
          setUserQuota({ used: currentCount, limit, remaining: Math.max(0, limit - currentCount), date: dateStr });
        }
        if (response.image) {
          try {
            const currentSaved = JSON.parse(localStorage.getItem('omnira_saved_images') || '[]');
            const newImg = {
              id: `img-${Date.now()}`,
              imageUrl: response.image,
              prompt: response.userPrompt || response.prompt || userText,
              timestamp: new Date().toLocaleTimeString(),
              createdAt: Date.now(),
              model: response.model || 'FLUX 1 Schnell'
            };
            const existingUrls = new Set(currentSaved.map(i => i.imageUrl));
            if (!existingUrls.has(response.image)) {
              localStorage.setItem('omnira_saved_images', JSON.stringify([newImg, ...currentSaved]));
            }
          } catch (e) {}
        }
        finalAssistantMsg = {
          role: 'assistant',
          type: 'image_generation',
          prompt: response.prompt || userText,
          userPrompt: response.userPrompt || response.prompt || userText,
          modelPrompt: response.modelPrompt || response.prompt || userText,
          model: response.model || '@cf/bytedance/stable-diffusion-xl-lightning',
          imageUrl: response.image || '',
          isLoading: false,
          error: response.success === false ? (response.error || 'Image generation failed.') : null,
          timestamp: new Date().toLocaleTimeString()
        };
      } else if (response?.type === 'clock') {
        finalAssistantMsg = {
          role: 'assistant',
          type: 'clock',
          timeData: response.timeData,
          content: response.text || '',
          timestamp: new Date().toLocaleTimeString()
        };
      } else if (response?.type === 'weather') {
        finalAssistantMsg = {
          role: 'assistant',
          type: 'weather',
          introText: response.introText || '',
          content: response.text || '',
          weather: response.weather,
          sources: response.sources || [],
          suggestions: response.suggestions || [],
          timestamp: new Date().toLocaleTimeString()
        };
      } else if (response && typeof response === 'object' && (response.sources || response.text)) {
        finalAssistantMsg = {
          role: 'assistant',
          content: response.text || '',
          sources: response.sources || [],
          timestamp: new Date().toLocaleTimeString()
        };
      } else {
        finalAssistantMsg = {
          role: 'assistant',
          content: typeof response === 'string' ? response : JSON.stringify(response),
          timestamp: new Date().toLocaleTimeString()
        };
      }

      setChatSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id !== targetSessionId) return s;
          
          if (isImageReq) {
            // Replace loading placeholder card with final result
            const filtered = s.messages.filter(m => m.id !== loadingId);
            return { ...s, messages: [...filtered, finalAssistantMsg] };
          } else {
            return { ...s, messages: [...s.messages, finalAssistantMsg] };
          }
        })
      );
    } catch (err) {
      console.error('Inference error:', err);
      const errorMsg = {
        role: 'assistant',
        content: `⚠️ **AI Engine Error:** ${err.message || 'Failed to generate response.'}`,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id !== targetSessionId) return s;
          if (isImageReq) {
            const filtered = s.messages.filter(m => m.id !== loadingId);
            return { ...s, messages: [...filtered, errorMsg] };
          }
          return { ...s, messages: [...s.messages, errorMsg] };
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // URL Route Synchronization and Browser Popstate listener
  useEffect(() => {
    const handlePopState = () => {
      setActiveMode(getModeFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSwitchMode = (newMode, pushHistory = true) => {
    setActiveMode(newMode);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    if (pushHistory && typeof window !== 'undefined') {
      const targetPath = newMode === 'chat' ? '/' : `/${newMode}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  // Create New Chat
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession = { id: newId, title: 'New chat', messages: [] };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentChatId(newId);
    handleSwitchMode('chat');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Create New Chat inside a Specific Project
  const handleNewChatInProject = (projId) => {
    const proj = projects.find(p => p.id === projId);
    const newId = `session-${Date.now()}`;
    const newSession = { 
      id: newId, 
      title: proj ? `${proj.name} chat` : 'New chat', 
      messages: [],
      projectId: projId 
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentChatId(newId);
    handleSwitchMode('chat');
  };

  // Assign / Move a Chat to a Project
  const handleAssignChatToProject = (chatId, projId) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === chatId ? { ...s, projectId: projId } : s))
    );
  };

  // Pin / Unpin Chat
  const handlePinChat = (idToPin) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === idToPin ? { ...s, pinned: !s.pinned } : s))
    );
  };

  // Rename Chat
  const handleRenameChat = (idToRename, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    setChatSessions((prev) =>
      prev.map((s) => (s.id === idToRename ? { ...s, title: newTitle.trim() } : s))
    );
  };

  // Archive / Unarchive Chat
  const handleArchiveChat = (idToArchive) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === idToArchive ? { ...s, archived: !s.archived } : s))
    );
  };

  // Delete Chat
  const handleDeleteChat = (idToDelete) => {
    if (currentUser?.uid) {
      deleteSessionFromCloud(currentUser.uid, idToDelete).catch((err) => {
        console.warn('Delete cloud session notice:', err);
      });
    }
    const filtered = chatSessions.filter(s => s.id !== idToDelete);
    if (filtered.length === 0) {
      const freshId = `session-${Date.now()}`;
      setChatSessions([{ id: freshId, title: 'New chat', messages: [] }]);
      setCurrentChatId(freshId);
    } else {
      setChatSessions(filtered);
      if (currentChatId === idToDelete) {
        setCurrentChatId(filtered[0].id);
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      
      {/* ChatGPT Drawer Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onNewChat={handleNewChat}
        chatHistory={chatSessions}
        currentChatId={currentChatId}
        onSelectChat={(id) => {
          setCurrentChatId(id);
          handleSwitchMode('chat');
        }}
        onDeleteChat={handleDeleteChat}
        onPinChat={handlePinChat}
        onRenameChat={handleRenameChat}
        onArchiveChat={handleArchiveChat}
        openSettings={handleOpenSettings}
        openAuth={() => setIsAuthModalOpen(true)}
        activeMode={activeMode}
        setActiveMode={handleSwitchMode}
        currentUser={currentUser}
        onLogout={handleLogout}
        projects={projects}
        onAssignChatToProject={handleAssignChatToProject}
        onCreateProject={() => {
          handleSwitchMode('projects');
          setIsCreateProjectModalOpen(true);
        }}
        userQuota={userQuota}
        chatQuota={chatQuota}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Header Bar with Model Selector Dropdown */}
        <TopBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openSettings={handleOpenSettings}
          openAuth={() => setIsAuthModalOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          onNewChat={handleNewChat}
          hasMessages={messages.length > 0}
          activeProject={(currentSession?.projectId && Array.isArray(projects)) ? projects.find(p => p && p.id === currentSession.projectId) : null}
        />

        {/* View Switcher: Main ChatGPT View, Studio Views, or Custom 404 Not Found Page */}
        <div className="flex-1 overflow-hidden relative">
          {activeMode === 'chat' && (
            <ChatStudio
              messages={messages}
              setMessages={(newMsgs) => {
                const targetId = currentSession?.id || currentChatId;
                setChatSessions((prev) => {
                  const safeList = Array.isArray(prev) && prev.length > 0 ? prev : [{ id: targetId, title: 'New chat', messages: [] }];
                  const exists = safeList.some((s) => s && s.id === targetId);
                  const nextVal = typeof newMsgs === 'function' ? newMsgs(messages) : newMsgs;
                  if (!exists) {
                    return [{ id: targetId, title: 'New chat', messages: nextVal }, ...safeList];
                  }
                  return safeList.map((s) => (s.id === targetId ? { ...s, messages: nextVal } : s));
                });
              }}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              settings={settings}
              userQuota={userQuota}
              currentUser={currentUser}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          )}

          {activeMode === 'code' && (
            <div className="h-full overflow-hidden">
              <CodeStudio settings={settings} chatSessions={chatSessions} />
            </div>
          )}

          {activeMode === 'images' && (
            <div className="h-full overflow-hidden">
              <ImagesStudio 
                chatSessions={chatSessions} 
                userQuota={userQuota} 
                onUpdateQuota={(q) => setUserQuota(q)} 
              />
            </div>
          )}

          {activeMode === 'projects' && (
            <div className="h-full overflow-hidden">
              <ProjectsStudio
                projects={projects}
                setProjects={setProjects}
                chatSessions={chatSessions}
                onSelectChat={(id) => {
                  setCurrentChatId(id);
                  handleSwitchMode('chat');
                }}
                onNewChatInProject={handleNewChatInProject}
                activeProjectId={activeProjectId}
                setActiveProjectId={setActiveProjectId}
                isCreateModalOpen={isCreateProjectModalOpen}
                setIsCreateModalOpen={setIsCreateProjectModalOpen}
              />
            </div>
          )}

          {activeMode === 'doc' && (
            <div className="h-full overflow-hidden">
              <DocStudio settings={settings} />
            </div>
          )}

          {activeMode === 'math' && (
            <div className="h-full overflow-hidden">
              <MathStudio settings={settings} />
            </div>
          )}

          {activeMode === 'svg' && (
            <div className="h-full overflow-hidden">
              <SvgStudio settings={settings} />
            </div>
          )}

          {['terms', 'privacy', 'help', 'legal', 'docs', 'releasenotes', 'downloadapps', 'reportbug', 'keyboard'].includes(activeMode) && (
            <div className="h-full overflow-hidden">
              <LegalAndHelpModal
                isOpen={true}
                initialTab={activeMode === 'privacy' ? 'privacy' : activeMode === 'help' ? 'help' : activeMode === 'releasenotes' ? 'releasenotes' : activeMode === 'downloadapps' ? 'downloadapps' : activeMode === 'reportbug' ? 'reportbug' : activeMode === 'keyboard' ? 'keyboard' : 'terms'}
                currentUser={currentUser}
                onClose={() => handleSwitchMode('chat')}
                onOpenSettings={handleOpenSettings}
              />
            </div>
          )}

          {(!VALID_MODES.includes(activeMode) || activeMode === '404') && (
            <div className="h-full overflow-hidden">
              <NotFoundPage
                currentPath={typeof window !== 'undefined' ? window.location.pathname : '/404'}
                onNavigateHome={() => handleSwitchMode('chat')}
                onNavigateMode={(mode) => handleSwitchMode(mode)}
                onStartNewChat={(promptText) => {
                  handleNewChat();
                  handleSwitchMode('chat');
                  if (promptText) {
                    setTimeout(() => handleSendMessage(promptText), 60);
                  }
                }}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                currentUser={currentUser}
              />
            </div>
          )}
        </div>

      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        onLogin={handleLogin}
        initialTab={settingsInitialTab}
      />

      {/* Google One Tap Top-Right Prompt (Like Google / big sites) */}
      <GoogleOneTapPrompt 
        onLogin={handleLogin} 
        currentUser={currentUser} 
      />

      {/* Auth Modal (Google & Email Login) */}
      {isAuthModalOpen && (
        <AuthScreen
          isModal={true}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      )}

    </div>
  );
}
