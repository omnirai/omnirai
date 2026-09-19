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
import NotFoundPage from './components/NotFoundPage';
import { 
  queryQuickAi, 
  getBackendImageQuota, 
  isImagePrompt, 
  getDailyChatUsage, 
  incrementDailyChatUsage 
} from './engine/quickAiEngine';

const VALID_MODES = ['chat', 'code', 'images', 'projects', 'doc', 'math', 'svg'];

const getModeFromPath = (pathname) => {
  if (!pathname) return 'chat';
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean || clean === 'chat') return 'chat';
  if (VALID_MODES.includes(clean)) return clean;
  return '404';
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
  };
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
    return saved !== null ? saved === 'true' : true; // Always allow direct access
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
      apiKey: '',
      enableDictation: true,
      temperature: 0.7
    };
  });

  // Chat History Sessions State
  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem('chatgpt_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [{ id: 'default-session-1', title: 'New chat', messages: [] }];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('chatgpt_current_id');
    return saved || 'default-session-1';
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

  // Handle Google Redirect Result and Firebase Auth state changes
  useEffect(() => {
    import('./firebase').then(({ auth, getRedirectResult, onAuthStateChanged }) => {
      if (getRedirectResult) {
        getRedirectResult(auth).then((result) => {
          if (result && result.user) {
            const u = result.user;
            const loggedInUser = {
              name: u.displayName || u.email?.split('@')[0] || 'Google User',
              email: u.email,
              username: `@${(u.email || 'user').split('@')[0]}`,
              avatar: u.photoURL || (u.displayName || 'G').charAt(0),
              picture: u.photoURL,
              provider: 'google',
              uid: u.uid,
              plan: 'Pro'
            };
            setCurrentUser(loggedInUser);
            setIsAuthenticated(true);
            setIsAuthModalOpen(false);
          }
        }).catch((err) => {
          console.warn('Redirect sign-in notice:', err);
        });
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const loggedInUser = {
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            username: `@${(user.email || 'user').split('@')[0]}`,
            avatar: user.photoURL || (user.displayName || 'U').charAt(0),
            picture: user.photoURL,
            provider: user.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email',
            uid: user.uid,
            plan: 'Pro'
          };
          setCurrentUser(loggedInUser);
          setIsAuthenticated(true);
        }
      });

      return () => unsubscribe();
    });
  }, []);

  // Save Model Selection
  useEffect(() => {
    localStorage.setItem('chatgpt_selected_model', selectedModel);
  }, [selectedModel]);

  // Save Settings & Dark Mode
  useEffect(() => {
    localStorage.setItem('chatgpt_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('chatgpt_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save Chat Sessions to localStorage
  useEffect(() => {
    localStorage.setItem('chatgpt_sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem('chatgpt_current_id', currentChatId);
  }, [currentChatId]);

  // Fetch Backend Image Quota & Chat Quota on user change / mount
  useEffect(() => {
    const userId = currentUser?.uid || currentUser?.email || 'guest_user';
    getBackendImageQuota(userId, currentUser?.plan).then((quota) => {
      if (quota) setUserQuota(quota);
    });
    setChatQuota(getDailyChatUsage(userId, currentUser?.plan));
  }, [currentUser]);

  // Firebase Auth state change listener
  useEffect(() => {
    import('./firebase').then(({ auth, onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const customAvatar = localStorage.getItem('omnira_user_avatar');
          setCurrentUser({
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            username: `@${(firebaseUser.email || 'user').split('@')[0]}`,
            avatar: customAvatar || firebaseUser.photoURL || firebaseUser.displayName?.charAt(0) || 'U',
            picture: customAvatar || firebaseUser.photoURL,
            photoURL: customAvatar || firebaseUser.photoURL,
            provider: 'firebase',
            uid: firebaseUser.uid,
            plan: 'Pro'
          });
          setIsAuthenticated(true);
        }
      });
      return () => unsubscribe();
    }).catch(err => console.error('Firebase listener error', err));
  }, []);

  // Handlers for Auth
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    import('./firebase').then(({ auth, signOut }) => {
      signOut(auth).catch(() => {});
    });
    // Switch to Guest Mode without blocking site access!
    setCurrentUser({
      name: 'Guest User',
      email: 'guest@omnira.ai',
      username: '@guest_user',
      avatar: 'GU',
      provider: 'guest',
      plan: 'Free'
    });
    setIsAuthenticated(true);
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
                setChatSessions((prev) =>
                  prev.map((s) => (s.id === currentChatId ? { ...s, messages: newMsgs } : s))
                );
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
