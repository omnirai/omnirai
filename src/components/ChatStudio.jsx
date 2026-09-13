import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  FileText, 
  X,
  Code,
  Image as ImageIcon,
  PenTool,
  Globe,
  Brain,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { marked } from 'marked';

export default function ChatStudio({ 
  messages, 
  setMessages, 
  onSendMessage, 
  isGenerating, 
  settings 
}) {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Web Speech Dictation
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Text-to-Speech
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedFile) || isGenerating) return;

    onSendMessage(input.trim(), attachedFile);
    setInput('');
    setAttachedFile(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        content: event.target.result
      });
    };
    reader.readAsText(file);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Action Cards (matching ChatGPT screenshot)
  const quickActions = [
    {
      icon: ImageIcon,
      label: 'Create an image or SVG',
      prompt: 'Draw a neural AI processor architecture SVG graphic'
    },
    {
      icon: PenTool,
      label: 'Write or edit text',
      prompt: 'Write a clean executive summary about privacy-first local AI'
    },
    {
      icon: Code,
      label: 'Write code or scripts',
      prompt: 'Build a responsive HTML/CSS pricing card widget'
    },
    {
      icon: Globe,
      label: 'Solve math or logic',
      prompt: 'Solve equation: 2x^2 + 5x - 3 = 0 with step-by-step resolution'
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-4xl mx-auto w-full px-4 relative">
      
      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto pt-6 pb-36 space-y-6">
        
        {messages.length === 0 ? (
          /* Empty Chat Hero (ChatGPT & Gemini Style) */
          <div className="h-full flex flex-col items-center justify-center text-center my-auto px-4 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight mb-8 text-[var(--text-primary)]">
              What's on the agenda today?
            </h1>

            {/* Quick Action Suggestion Cards (ChatGPT style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {quickActions.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(act.prompt, null)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-left transition-all text-xs font-medium text-[var(--text-primary)] shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[var(--text-primary)]" />
                    </div>
                    <span className="truncate">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Thread Messages Stream */
          messages.map((m, index) => {
            const isUser = m.role === 'user';
            return (
              <div 
                key={index} 
                className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-sm">
                    Q
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Message Bubble */}
                  <div 
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isUser 
                        ? 'bg-[var(--bg-input)] text-[var(--text-primary)] rounded-tr-sm' 
                        : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm rounded-tl-sm'
                    }`}
                  >
                    {/* Attached file preview */}
                    {m.attachedFile && (
                      <div className="mb-3 p-2 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl text-xs flex items-center gap-2 text-[var(--text-muted)]">
                        <FileText className="w-4 h-4 text-[var(--text-primary)]" />
                        <span className="font-mono font-medium truncate">{m.attachedFile.name}</span>
                      </div>
                    )}

                    <div 
                      className="markdown-body"
                      dangerouslySetInnerHTML={{ 
                        __html: marked.parse(m.content || '') 
                      }} 
                    />
                  </div>

                  {/* Actions under message */}
                  {!isUser && (
                    <div className="flex items-center gap-3 px-1 text-xs text-[var(--text-muted)]">
                      <button
                        onClick={() => handleCopy(m.content, index)}
                        className="hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                      >
                        {copiedId === index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === index ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => speakText(m.content)}
                        className="hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                  )}

                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center justify-center font-semibold text-xs shrink-0 mt-1 border border-[var(--border-color)]">
                    U
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Inference Progress Spinner */}
        {isGenerating && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] max-w-[78%]">
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--text-primary)]" />
            <span className="text-xs text-[var(--text-muted)] font-medium">Quick AI inferring locally...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Bar (ChatGPT & Gemini Style) */}
      <div className="absolute bottom-4 left-4 right-4 max-w-3xl mx-auto z-20">
        
        {/* Attached File Pill Badge */}
        {attachedFile && (
          <div className="mb-2 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-[var(--text-primary)]" />
              <span className="font-mono text-[var(--text-primary)] truncate">{attachedFile.name}</span>
              <span className="text-[var(--text-muted)]">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button 
              type="button" 
              onClick={() => setAttachedFile(null)} 
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form 
          onSubmit={handleSubmit}
          className="rounded-[26px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg p-2 sm:p-3 transition-all focus-within:border-[var(--text-primary)]"
        >
          <div className="flex items-center gap-2">
            
            {/* Left + Attach Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".txt,.md,.csv,.json,.js,.py,.html,.css"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
              title="Attach File"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Input Field */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask anything..."
              rows={1}
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-1.5"
            />

            {/* Right Buttons Inside Input Bar */}
            <div className="flex items-center gap-1 shrink-0">
              
              {/* Think Mode Pill (ChatGPT style) */}
              <button
                type="button"
                onClick={() => setIsThinkingMode(!isThinkingMode)}
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isThinkingMode 
                    ? 'border-[var(--border-color)] bg-[var(--bg-hover)] text-[var(--text-primary)]' 
                    : 'border-transparent text-[var(--text-muted)]'
                }`}
                title="Deep Local Reasoning Engine"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Think</span>
              </button>

              {/* Mic Voice Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
                title="Voice Dictation"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!input.trim() && !attachedFile) || isGenerating}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  input.trim() || attachedFile
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>

            </div>

          </div>
        </form>

        {/* Footer Subtext */}
        <div className="text-[11px] text-center text-[var(--text-muted)] mt-2">
          Quick AI can make mistakes. Created by <a href="https://bishalcodes.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--text-primary)]">bishalcodes.com</a>.
        </div>

      </div>

    </div>
  );
}
