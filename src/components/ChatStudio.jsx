import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  Check, 
  FileText, 
  X,
  ImageIcon,
  PenTool,
  Globe,
  Brain,
  RefreshCw,
  Sparkles,
  ArrowUp,
  Image as ImageSvg,
  AlertCircle
} from 'lucide-react';
import { marked } from 'marked';
import ImageGenerationMessage from './ImageGenerationMessage';
import { isImagePrompt } from '../engine/quickAiEngine';

export default function ChatStudio({ 
  messages, 
  setMessages, 
  onSendMessage, 
  isGenerating, 
  settings,
  userQuota = { used: 0, limit: 2, remaining: 2 },
  currentUser
}) {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(true);
  const [isImageMode, setIsImageMode] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Speech Recognition (Voice Dictation)
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

    let finalPrompt = input.trim();
    if (isImageMode && !isImagePrompt(finalPrompt)) {
      finalPrompt = `Create an image of ${finalPrompt}`;
    }

    setLastUserPrompt(finalPrompt);
    onSendMessage(finalPrompt, attachedFile);
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

  const quickOptionItems = [
    {
      icon: ImageIcon,
      label: 'Create an image or sticker',
      prompt: 'Create a realistic photo of Mount Everest at sunrise'
    },
    {
      icon: PenTool,
      label: 'Write or edit',
      prompt: 'Write a persuasive elevator pitch for an AI productivity tool'
    },
    {
      icon: Globe,
      label: 'Search the web',
      prompt: 'Summarize recent technological breakthroughs in artificial intelligence'
    }
  ];

  const isCurrentGeneratingImage = isGenerating && isImagePrompt(lastUserPrompt || input || '');

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto px-4 relative select-none">
      
      {/* Thread Messages Stream */}
      <div className="flex-1 overflow-y-auto pt-4 pb-44 space-y-6">
        
        {messages.length === 0 ? (
          /* Empty Chat View */
          <div className="h-full flex flex-col items-center justify-center text-center my-auto px-4 max-w-xl mx-auto">
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight mb-2 text-[var(--text-primary)]">
              Ready when you are.
            </h1>

            {/* Quota Counter Badge */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                userQuota.used >= userQuota.limit 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Images today: {userQuota.used}/{userQuota.limit}</span>
              </span>
            </div>

            {/* Main Floating Input Composer Box */}
            <div className="w-full mb-6">
              
              {attachedFile && (
                <div className="mb-2 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-xs flex items-center justify-between shadow-2xs">
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
                className="rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-input)] shadow-lg p-2 sm:p-3 transition-all focus-within:border-[var(--border-strong)]"
              >
                <div className="flex items-center gap-2">
                  
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
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
                    title="Add attachment"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder={isImageMode ? "Describe the image you want..." : "Ask anything or type 'Create an image of...'"}
                    rows={1}
                    className="w-full bg-transparent border-none outline-none resize-none text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-1.5 font-normal"
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    
                    {/* Explicit Image Mode Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsImageMode(!isImageMode)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isImageMode 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold' 
                          : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                      }`}
                      title="Toggle Explicit Image Mode"
                    >
                      <ImageSvg className="w-3.5 h-3.5" />
                      <span>Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsThinkingMode(!isThinkingMode)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isThinkingMode 
                          ? 'border-[var(--border-color)] bg-[var(--bg-hover)] text-[var(--text-primary)] shadow-2xs' 
                          : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                      }`}
                      title="Deep Thinking Model"
                    >
                      <Brain className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>Think</span>
                    </button>

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

                    <button
                      type="submit"
                      disabled={(!input.trim() && !attachedFile) || isGenerating}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        input.trim() || attachedFile
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                      }`}
                    >
                      {input.trim() || attachedFile ? (
                        <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <span className="w-1 h-3 bg-white rounded-full animate-pulse"></span>
                          <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-75"></span>
                          <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150"></span>
                        </div>
                      )}
                    </button>

                  </div>

                </div>
              </form>
            </div>

            <div className="flex flex-col items-start gap-2.5 w-full max-w-sm pl-2">
              {quickOptionItems.map((opt, idx) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setLastUserPrompt(opt.prompt);
                      onSendMessage(opt.prompt, null);
                    }}
                    className="flex items-center gap-3 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1 group"
                  >
                    <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        ) : (
          /* Active Messages Thread */
          messages.map((m, index) => {
            const isUser = m.role === 'user';
            const isImageMsg = !isUser && (m.type === 'image_generation' || m.imageUrl || m.error?.includes('image') || m.error?.includes('limit'));

            return (
              <div 
                key={index} 
                className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-2xs">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.15L19.5 7.9V10.5L12 6.75L4.5 10.5V7.9L12 4.15ZM4.5 12.5L12 8.75L19.5 12.5V16.1L12 19.85L4.5 16.1V12.5Z"/>
                    </svg>
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {isImageMsg ? (
                    <ImageGenerationMessage 
                      message={m} 
                      onRegenerate={(promptToRegen) => {
                        setLastUserPrompt(promptToRegen);
                        onSendMessage(promptToRegen, null);
                      }} 
                    />
                  ) : (
                    <div 
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-neutral-200 dark:bg-neutral-800 text-[var(--text-primary)] rounded-tr-xs' 
                          : 'bg-transparent text-[var(--text-primary)]'
                      }`}
                    >
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
                  )}

                  {!isUser && !isImageMsg && (
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
                        <span>Read aloud</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}

        {/* Loading Generation State */}
        {isGenerating && (
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] max-w-sm shadow-2xs animate-pulse">
            {isCurrentGeneratingImage ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-emerald-500" />
                <span className="text-xs text-[var(--text-primary)] font-medium">OMNIRA is creating your image...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                <span className="text-xs text-[var(--text-muted)] font-medium">OMNIRA is thinking...</span>
              </>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Composer Bar */}
      {messages.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 max-w-3xl mx-auto z-20 select-none">
          
          {attachedFile && (
            <div className="mb-2 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-xs flex items-center justify-between shadow-2xs">
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
            className="rounded-[28px] border border-[var(--border-color)] bg-[var(--bg-input)] shadow-lg p-2 sm:p-3 transition-all focus-within:border-[var(--border-strong)]"
          >
            <div className="flex items-center gap-2">
              
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
                className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
                title="Add attachment"
              >
                <Plus className="w-5 h-5" />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={isImageMode ? "Describe the image you want..." : "Ask anything"}
                rows={1}
                className="w-full bg-transparent border-none outline-none resize-none text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-1.5"
              />

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Image Mode Button */}
                <button
                  type="button"
                  onClick={() => setIsImageMode(!isImageMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isImageMode 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                      : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Toggle Image Mode"
                >
                  <ImageSvg className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Image</span>
                </button>

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

                <button
                  type="submit"
                  disabled={(!input.trim() && !attachedFile) || isGenerating}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    input.trim() || attachedFile
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-2xs'
                      : 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

            </div>
          </form>

          {/* Daily Quota Counter Bar */}
          <div className="flex items-center justify-between px-2 mt-2 text-[11px] text-[var(--text-muted)]">
            <div>
              {userQuota.used >= userQuota.limit ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Daily image limit reached (2/2). You can generate more images tomorrow.
                </span>
              ) : (
                <span>Images today: {userQuota.used}/{userQuota.limit} ({userQuota.remaining} remaining)</span>
              )}
            </div>
            <div>OMNIRA AI Engine</div>
          </div>

        </div>
      )}

    </div>
  );
}
