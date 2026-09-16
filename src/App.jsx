import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatStudio from './components/ChatStudio';
import CodeStudio from './components/CodeStudio';
import DocStudio from './components/DocStudio';
import MathStudio from './components/MathStudio';
import SvgStudio from './components/SvgStudio';
import PluginsStudio from './components/PluginsStudio';
import SettingsModal from './components/SettingsModal';
import AuthScreen from './components/AuthScreen';
import { queryQuickAi, getBackendImageQuota, isImagePrompt } from './engine/quickAiEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'code' | 'doc' | 'math' | 'svg'
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userQuota, setUserQuota] = useState({ used: 0, limit: 25, remaining: 25 });

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

  // Persist Auth State & Current User
  useEffect(() => {
    localStorage.setItem('omnira_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('omnira_user', JSON.stringify(currentUser));
  }, [currentUser]);

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

  // Fetch Backend Image Quota on user change / mount
  useEffect(() => {
    const userId = currentUser?.uid || currentUser?.email || 'guest_user';
    getBackendImageQuota(userId).then((quota) => {
      if (quota) setUserQuota(quota);
    });
  }, [currentUser]);

  // Firebase Auth state change listener
  useEffect(() => {
    import('./firebase').then(({ auth, onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setCurrentUser({
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            username: `@${(firebaseUser.email || 'user').split('@')[0]}`,
            avatar: firebaseUser.photoURL || firebaseUser.displayName?.charAt(0) || 'U',
            picture: firebaseUser.photoURL,
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

  // Get Active Chat Messages
  const currentSession = chatSessions.find(s => s.id === currentChatId) || chatSessions[0];
  const messages = currentSession ? currentSession.messages : [];

  // Send Message Handler
  const handleSendMessage = async (userText, attachedFile = null, options = {}) => {
    const userMsg = {
      role: 'user',
      content: userText,
      attachedFile,
      timestamp: new Date().toLocaleTimeString()
    };

    const isImageReq = options.isImage || isImagePrompt(userText, activeMode, selectedModel);
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
      const response = await queryQuickAi({
        prompt: userText,
        selectedModel,
        mode: options.isImage ? 'image' : activeMode,
        history: messages,
        fileData: attachedFile,
        currentUser,
        settings
      });

      let finalAssistantMsg;
      if (typeof response === 'object' && response !== null && (response.image || response.error || response.success !== undefined)) {
        if (response.quota) {
          setUserQuota(response.quota);
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

  // Create New Chat
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession = { id: newId, title: 'New chat', messages: [] };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentChatId(newId);
    setActiveMode('chat');
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
        onSelectChat={(id) => setCurrentChatId(id)}
        onDeleteChat={handleDeleteChat}
        onPinChat={handlePinChat}
        onRenameChat={handleRenameChat}
        onArchiveChat={handleArchiveChat}
        openSettings={() => setIsSettingsOpen(true)}
        openAuth={() => setIsAuthModalOpen(true)}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        currentUser={currentUser}
        onLogout={handleLogout}
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
          openSettings={() => setIsSettingsOpen(true)}
          openAuth={() => setIsAuthModalOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          onNewChat={handleNewChat}
          hasMessages={messages.length > 0}
        />

        {/* View Switcher: Main ChatGPT View or Studio Views */}
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
            />
          )}

          {activeMode === 'code' && (
            <div className="h-full overflow-hidden">
              <CodeStudio settings={settings} />
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

          {activeMode === 'plugins' && (
            <div className="h-full overflow-hidden">
              <PluginsStudio onSelectChat={(id) => setCurrentChatId(id)} />
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
