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
  AlertCircle,
  Video,
  Music,
  Code
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
  userQuota = { used: 0, limit: 25, remaining: 25 },
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
  const emptyTextareaRef = useRef(null);
  const activeTextareaRef = useRef(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Dynamic auto-resize textareas as content expands
  useEffect(() => {
    [emptyTextareaRef.current, activeTextareaRef.current].forEach((el) => {
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${Math.min(Math.max(el.scrollHeight, 36), 180)}px`;
      }
    });
  }, [input]);

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

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
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

    const finalPrompt = input.trim();
    setLastUserPrompt(finalPrompt);
    onSendMessage(finalPrompt, attachedFile, { isImage: isImageMode });
    setInput('');
    setAttachedFile(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || '';
    const isBinary = 
      mime.startsWith('image/') || 
      mime.startsWith('video/') || 
      mime.startsWith('audio/') || 
      mime.includes('pdf') || 
      mime.includes('zip') || 
      mime.includes('word') || 
      mime.includes('excel') || 
      mime.includes('powerpoint') || 
      mime.includes('octet-stream');

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        content: event.target.result
      });
    };

    if (isBinary) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickOptionItems = [
    {
      icon: ImageIcon,
      label: 'Create an image',
      prompt: 'Create an image of a serene mountain landscape at sunrise'
    },
    {
      icon: Code,
      label: 'Write code',
      prompt: 'Write a clean, responsive React Tailwind component with animations'
    },
    {
      icon: Sparkles,
      label: 'Brainstorm ideas',
      prompt: 'Give me 5 unique product ideas combining AI with productivity tools'
    },
    {
      icon: Globe,
      label: 'Search the web',
      prompt: 'Summarize recent technological breakthroughs in artificial intelligence'
    }
  ];

  const isCurrentGeneratingImage = isGenerating && isImagePrompt(lastUserPrompt || input || '');

  return (
    <div className="flex flex-col h-full w-full overflow-hidden min-w-0">
      
      {/* Thread Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full min-w-0">
        
        {messages.length === 0 ? (
          /* Empty Chat View */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-xl mx-auto">
            
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
                    {attachedFile.type?.startsWith('image/') || attachedFile.content?.startsWith('data:image/') ? (
                      <img src={attachedFile.content} alt={attachedFile.name} className="w-8 h-8 object-cover rounded-lg shrink-0 border border-[var(--border-color)]" />
                    ) : attachedFile.type?.startsWith('video/') || attachedFile.content?.startsWith('data:video/') ? (
                      <Video className="w-4 h-4 text-purple-500 shrink-0" />
                    ) : attachedFile.type?.startsWith('audio/') || attachedFile.content?.startsWith('data:audio/') ? (
                      <Music className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <span className="font-mono text-[var(--text-primary)] truncate max-w-[200px]">{attachedFile.name}</span>
                    <span className="text-[var(--text-muted)]">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setAttachedFile(null)} 
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-hover)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form 
                onSubmit={handleSubmit}
                className="rounded-[26px] border border-[var(--border-color)] bg-[var(--bg-input)] shadow-lg p-2.5 sm:p-3 transition-all focus-within:border-[var(--border-strong)] flex flex-col gap-2"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="*/*"
                />

                {/* Top: Full-Width Expanding Textarea */}
                <textarea
                  ref={emptyTextareaRef}
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
                  className="w-full bg-transparent border-none outline-none resize-none text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-1.5 px-1 font-normal min-h-[36px] max-h-[180px] overflow-y-auto leading-relaxed"
                />

                {/* Bottom: Dedicated Action Controls Row */}
                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]/40">
                  
                  {/* Left: Attachment + Mode Toggles */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
                      title="Add attachment"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsImageMode(!isImageMode)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isImageMode 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs' 
                          : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                      }`}
                      title="Toggle Image Mode"
                    >
                      <ImageSvg className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsThinkingMode(!isThinkingMode)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isThinkingMode 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs' 
                          : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                      }`}
                      title="Toggle Reasoning Depth"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Think</span>
                    </button>
                  </div>

                  {/* Right: Mic Dictation + Send Button */}
                  <div className="flex items-center gap-2 shrink-0">
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        input.trim() || attachedFile
                          ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm hover:opacity-90'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-[var(--text-muted)] cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
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
          <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-6">
            {messages.map((m, index) => {
              const isUser = m.role === 'user';
              const isImageMsg = !isUser && (m.type === 'image_generation' || m.imageUrl || m.isLoading || m.error?.includes('image') || m.error?.includes('limit'));

              return (
                <div 
                  key={index} 
                  className={`flex gap-3 sm:gap-4 w-full min-w-0 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-2xs">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.15L19.5 7.9V10.5L12 6.75L4.5 10.5V7.9L12 4.15ZM4.5 12.5L12 8.75L19.5 12.5V16.1L12 19.85L4.5 16.1V12.5Z"/>
                      </svg>
                    </div>
                  )}

                  <div className={`space-y-1.5 max-w-[90%] sm:max-w-[80%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {isImageMsg ? (
                      <ImageGenerationMessage 
                        message={m} 
                        onRegenerate={(promptToRegen) => {
                          setLastUserPrompt(promptToRegen);
                          onSendMessage(promptToRegen, null, { isImage: true });
                        }} 
                        onImageLoaded={() => {
                          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      />
                    ) : (
                      <div 
                        className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed overflow-hidden min-w-0 max-w-full ${
                          isUser 
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-[var(--text-primary)] rounded-tr-xs' 
                            : 'bg-transparent text-[var(--text-primary)]'
                        }`}
                      >
                        {m.attachedFile && (
                          <div className="mb-3 p-2 bg-[var(--bg-hover)] border border-[var(--border-color)] rounded-xl text-xs flex flex-col gap-2 text-[var(--text-muted)]">
                            {m.attachedFile.type?.startsWith('image/') || m.attachedFile.content?.startsWith('data:image/') ? (
                              <img src={m.attachedFile.content} alt={m.attachedFile.name} className="max-w-full max-h-64 rounded-xl object-contain shadow-md border border-[var(--border-color)]" />
                            ) : m.attachedFile.type?.startsWith('video/') || m.attachedFile.content?.startsWith('data:video/') ? (
                              <video src={m.attachedFile.content} controls className="max-w-full max-h-64 rounded-xl shadow-md" />
                            ) : m.attachedFile.type?.startsWith('audio/') || m.attachedFile.content?.startsWith('data:audio/') ? (
                              <audio src={m.attachedFile.content} controls className="w-full max-w-md" />
                            ) : (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[var(--text-primary)] shrink-0" />
                                <span className="font-mono font-medium truncate">{m.attachedFile.name}</span>
                                <span className="text-[10px] text-[var(--text-muted)]">({(m.attachedFile.size / 1024).toFixed(1)} KB)</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div 
                          className="markdown-body min-w-0 max-w-full overflow-hidden"
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
            })}

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

            <div ref={messagesEndRef} className="h-2 shrink-0" />
          </div>
        )}
      </div>

      {/* Docked Bottom Composer Bar (In normal flex flow - CANNOT overlap messages) */}
      {messages.length > 0 && (
        <div className="shrink-0 w-full px-3 sm:px-4 pt-2 pb-3 sm:pb-4 z-20">
          <div className="w-full max-w-3xl mx-auto">
            {attachedFile && (
              <div className="mb-2 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 truncate">
                  {attachedFile.type?.startsWith('image/') || attachedFile.content?.startsWith('data:image/') ? (
                    <img src={attachedFile.content} alt={attachedFile.name} className="w-8 h-8 object-cover rounded-lg shrink-0 border border-[var(--border-color)]" />
                  ) : attachedFile.type?.startsWith('video/') || attachedFile.content?.startsWith('data:video/') ? (
                    <Video className="w-4 h-4 text-purple-500 shrink-0" />
                  ) : attachedFile.type?.startsWith('audio/') || attachedFile.content?.startsWith('data:audio/') ? (
                    <Music className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  <span className="font-mono text-[var(--text-primary)] truncate max-w-[200px]">{attachedFile.name}</span>
                  <span className="text-[var(--text-muted)]">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setAttachedFile(null)} 
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-hover)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form 
              onSubmit={handleSubmit}
              className="rounded-[26px] border border-[var(--border-color)] bg-[var(--bg-input)] shadow-lg p-2.5 sm:p-3 transition-all focus-within:border-[var(--border-strong)] flex flex-col gap-2"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="*/*"
              />

              {/* Top: Full-Width Expanding Textarea */}
              <textarea
                ref={activeTextareaRef}
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
                className="w-full bg-transparent border-none outline-none resize-none text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] py-1.5 px-1 min-h-[36px] max-h-[180px] overflow-y-auto leading-relaxed font-normal"
              />

              {/* Bottom: Dedicated Action Controls Row */}
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]/40">
                
                {/* Left: Attachment + Mode Toggles */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
                    title="Add attachment"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsImageMode(!isImageMode)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isImageMode 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs' 
                        : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Toggle Image Mode"
                  >
                    <ImageSvg className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Image</span>
                  </button>
                </div>

                {/* Right: Mic Dictation + Send Button */}
                <div className="flex items-center gap-2 shrink-0">
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      input.trim() || attachedFile
                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm hover:opacity-90'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-[var(--text-muted)] cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
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
                    Daily image limit reached ({userQuota.limit}/{userQuota.limit}). You can generate more images tomorrow.
                  </span>
                ) : (
                  <span>Images today: {userQuota.used}/{userQuota.limit} ({userQuota.remaining} remaining)</span>
                )}
              </div>
              <div>OMNIRA AI Engine</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
