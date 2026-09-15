import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatStudio from './components/ChatStudio';
import CodeStudio from './components/CodeStudio';
import DocStudio from './components/DocStudio';
import MathStudio from './components/MathStudio';
import SvgStudio from './components/SvgStudio';
import SettingsModal from './components/SettingsModal';
import { queryQuickAi } from './engine/quickAiEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [activeMode, setActiveMode] = useState('chat'); // 'chat' | 'code' | 'doc' | 'math' | 'svg'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Selected Active AI Model
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('chatgpt_selected_model');
    return saved || 'gpt-4o';
  });

  // Dark Mode State with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('chatgpt_theme');
    return saved ? saved === 'dark' : true;
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

  // Get Active Chat Messages
  const currentSession = chatSessions.find(s => s.id === currentChatId) || chatSessions[0];
  const messages = currentSession ? currentSession.messages : [];

  // Send Message Handler
  const handleSendMessage = async (userText, attachedFile = null) => {
    const userMsg = {
      role: 'user',
      content: userText,
      attachedFile,
      timestamp: new Date().toLocaleTimeString()
    };

    // Update Session with User Message
    const updatedMessages = [...messages, userMsg];
    
    // Generate Title if first message
    let sessionTitle = currentSession?.title || 'New chat';
    if (messages.length === 0 && userText) {
      sessionTitle = userText.slice(0, 30) + (userText.length > 30 ? '...' : '');
    }

    setChatSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === (currentSession?.id || currentChatId)
          ? { ...s, title: sessionTitle, messages: updatedMessages }
          : s
      )
    );

    setIsGenerating(true);

    try {
      const response = await queryQuickAi({
        prompt: userText,
        selectedModel,
        mode: activeMode,
        history: updatedMessages,
        fileData: attachedFile,
        settings
      });

      const assistantMsg = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === (currentSession?.id || currentChatId)
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );
    } catch (err) {
      console.error('Inference error:', err);
      const errorMsg = {
        role: 'assistant',
        content: `⚠️ **AI Engine Error:** ${err.message || 'Failed to generate response.'}`,
        timestamp: new Date().toLocaleTimeString()
      };

      setChatSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === (currentSession?.id || currentChatId)
            ? { ...s, messages: [...s.messages, errorMsg] }
            : s
        )
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
        openSettings={() => setIsSettingsOpen(true)}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        userName="Lama Bikal"
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
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          userName="Lama Bikal"
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
      />

    </div>
  );
}
