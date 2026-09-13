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
  const [activeMode, setActiveMode] = useState('chat');
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('quick_ai_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      engineMode: 'quick-local-neural',
      modelName: 'Xenova/Qwen1.5-0.5B-Chat',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3',
      temperature: 0.7,
      systemInstruction: 'You are Quick AI, created by bishalcodes.com.'
    };
  });

  // Messages History State
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('quick_ai_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Save Settings
  useEffect(() => {
    localStorage.setItem('quick_ai_settings', JSON.stringify(settings));
  }, [settings]);

  // Save Messages
  useEffect(() => {
    localStorage.setItem('quick_ai_messages', JSON.stringify(messages));
  }, [messages]);

  // Handle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Send Message
  const handleSendMessage = async (userText, attachedFile = null) => {
    const userMsg = {
      role: 'user',
      content: userText,
      attachedFile,
      timestamp: new Date().toLocaleTimeString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      const response = await queryQuickAi({
        prompt: userText,
        mode: activeMode,
        history: newMessages,
        fileData: attachedFile,
        settings
      });

      const assistantMsg = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Inference error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Quick AI Error:** ${err.message || 'Failed to generate local response.'}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveMode('chat');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      
      {/* ChatGPT & Gemini Style Left Navigation Sidebar */}
      <Sidebar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        openSettings={() => setIsSettingsOpen(true)}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onNewChat={handleNewChat}
        chatHistory={messages}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Navigation Bar */}
        <TopBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          settings={settings}
          openSettings={() => setIsSettingsOpen(true)}
        />

        {/* View Switcher */}
        <div className="flex-1 overflow-hidden relative">
          {activeMode === 'chat' && (
            <ChatStudio
              messages={messages}
              setMessages={setMessages}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              settings={settings}
            />
          )}

          {activeMode === 'code' && (
            <div className="p-4 h-full">
              <CodeStudio settings={settings} />
            </div>
          )}

          {activeMode === 'doc' && (
            <div className="p-4 h-full">
              <DocStudio settings={settings} />
            </div>
          )}

          {activeMode === 'math' && (
            <div className="p-4 h-full">
              <MathStudio settings={settings} />
            </div>
          )}

          {activeMode === 'svg' && (
            <div className="p-4 h-full">
              <SvgStudio settings={settings} />
            </div>
          )}
        </div>

      </div>

      {/* Settings Modal */}
      <SettingsModal
        settings={settings}
        setSettings={setSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
