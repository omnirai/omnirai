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
  Code,
  Pencil
} from 'lucide-react';
import { marked } from 'marked';
import ImageGenerationMessage from './ImageGenerationMessage';
import { isImagePrompt } from '../engine/quickAiEngine';
import { OmniraIcon } from './OmniraLogo';
import MeetVoiceModal from './MeetVoiceModal';
import VoiceChatModal from './VoiceChatModal';

export default function ChatStudio({ 
  messages, 
  setMessages, 
  onSendMessage, 
  isGenerating, 
  settings,
  userQuota = { used: 0, limit: 25, remaining: 25 },
  currentUser,
  selectedModel = 'gpt-4o',
  onSelectModel
}) {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(true);
  const [isImageMode, setIsImageMode] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState('');

  // Voice Mode & Meet Voice Modal States
  const [isMeetVoiceOpen, setIsMeetVoiceOpen] = useState(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);

  const handleVoiceChatClick = () => {
    const hasSeen = typeof window !== 'undefined' && localStorage.getItem('omnira_has_seen_voice_intro') === 'true';
    if (!hasSeen) {
      setIsMeetVoiceOpen(true);
    } else {
      setIsVoiceChatOpen(true);
    }
  };

  const handleMeetVoiceContinue = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('omnira_has_seen_voice_intro', 'true');
    }
    setIsMeetVoiceOpen(false);
    setIsVoiceChatOpen(true);
  };

  // Auto-detect image prompts as user types and automatically switch active model to FLUX image model
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length >= 3) {
      if (isImagePrompt(trimmed, 'chat', selectedModel)) {
        if (selectedModel !== 'cloudflare-image') {
          onSelectModel?.('cloudflare-image');
        }
      }
    }
  }, [input, selectedModel, onSelectModel]);

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

  // Multilingual Text-to-Speech using configured Voice persona (Ember, Breeze, Cove, etc.)
  const speakText = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const cleanText = text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/[#*`_~[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Detect language script (Nepali, Hindi, Spanish, etc.)
    let detectedLang = 'en-US';
    if (/[\u0900-\u097F]/.test(cleanText)) {
      detectedLang = /(छ|छन्|भयो|गर्छ|तपाईं|के|हो|छैन|नमस्ते|गर्नुहोस्|हामी|मलाई|नेपाली)/.test(cleanText) ? 'ne-NP' : 'hi-IN';
    } else if (/[\u0600-\u06FF]/.test(cleanText)) {
      detectedLang = 'ar-SA';
    } else if (/[\u4E00-\u9FFF]/.test(cleanText)) {
      detectedLang = 'zh-CN';
    } else if (/[\u3040-\u30FF]/.test(cleanText)) {
      detectedLang = 'ja-JP';
    } else if (/[\uAC00-\uD7AF]/.test(cleanText)) {
      detectedLang = 'ko-KR';
    } else if (/[\u0400-\u04FF]/.test(cleanText)) {
      detectedLang = 'ru-RU';
    } else if (/(hola|gracias|buenos|días|español)/i.test(cleanText)) {
      detectedLang = 'es-ES';
    } else if (/(bonjour|merci|français)/i.test(cleanText)) {
      detectedLang = 'fr-FR';
    } else if (/(hallo|danke|deutsch)/i.test(cleanText)) {
      detectedLang = 'de-DE';
    }

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = detectedLang.split('-')[0].toLowerCase();
    let matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === detectedLang.toLowerCase()) ||
      voices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) ||
      voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.lang.startsWith('en')) && !v.name.includes('whisper')) ||
      voices[0];

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = 1.0;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = detectedLang;
    if (matchedVoice) utterance.voice = matchedVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedFile) || isGenerating) return;

    const finalPrompt = input.trim();
    const isImg = isImageMode || isImagePrompt(finalPrompt, 'chat', selectedModel);
    if (isImg && selectedModel !== 'cloudflare-image') {
      onSelectModel?.('cloudflare-image');
    }

    setLastUserPrompt(finalPrompt);
    onSendMessage(finalPrompt, attachedFile, { isImage: isImg });
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
      label: 'Create an image or sticker',
      prompt: 'Create an image of a vibrant modern illustration sticker',
      isImage: true
    },
    {
      icon: Pencil,
      label: 'Write or edit',
      prompt: 'Help me draft a clear, engaging article'
    },
    {
      icon: Globe,
      label: 'Search the web',
      prompt: 'Search the web for recent advancements in AI'
    }
  ];

  const isCurrentGeneratingImage = isGenerating && isImagePrompt(lastUserPrompt || input || '');

  return (
    <div className="flex flex-col h-full w-full overflow-hidden min-w-0 relative">
      
      {/* Thread Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full min-w-0">
        
        {messages.length === 0 ? (
          /* Empty Chat View matching reference */
          <div className="h-full flex flex-col items-center justify-center text-center px-2 sm:px-6 w-full max-w-full sm:max-w-4xl mx-auto">
            
            {/* Minimalist Title */}
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-normal tracking-tight mb-8 sm:mb-10 text-[var(--text-primary)] select-none">
              Where should we begin?
            </h1>

            {/* Main Floating Input Composer Box - Full Width Fresh Pill */}
            <div className="w-full mb-8">
              {attachedFile && (
                <div className="mb-2.5 p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-xs flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2 truncate">
                    {attachedFile.type?.startsWith('image/') || attachedFile.content?.startsWith('data:image/') ? (
                      <img src={attachedFile.content} alt={attachedFile.name} className="w-8 h-8 object-cover rounded-lg shrink-0 border border-[var(--border-color)]" />
                    ) : attachedFile.type?.startsWith('video/') || attachedFile.content?.startsWith('data:video/') ? (
                      <Video className="w-4 h-4 text-purple-500 shrink-0" />
                    ) : attachedFile.type?.startsWith('audio/') || attachedFile.content?.startsWith('data:audio/') ? (
                      <Music className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-neutral-800 dark:text-neutral-200 shrink-0" />
                    )}
                    <span className="font-mono text-[var(--text-primary)] truncate max-w-[200px]">{attachedFile.name}</span>
                    <span className="text-[var(--text-muted)]">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setAttachedFile(null)} 
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-hover)] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form 
                onSubmit={handleSubmit}
                className="w-full rounded-full border border-neutral-200/90 dark:border-neutral-700/80 bg-[var(--bg-card)] shadow-[0_2px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_22px_rgba(0,0,0,0.09)] focus-within:shadow-[0_4px_26px_rgba(0,0,0,0.12)] focus-within:border-neutral-400 dark:focus-within:border-neutral-500 transition-all px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center gap-2.5 sm:gap-3.5"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="*/*"
                />

                {/* Left: Plus Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white transition-colors shrink-0 cursor-pointer"
                  title="Add file or photo"
                >
                  <Plus className="w-5 h-5 stroke-[2.2]" />
                </button>

                {/* Center: Input */}
                <input
                  type="text"
                  ref={emptyTextareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything"
                  className="flex-1 bg-transparent border-none outline-none text-base sm:text-[17px] text-[var(--text-primary)] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-normal min-w-0"
                />

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                  {/* Think Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsThinkingMode(!isThinkingMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      isThinkingMode 
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-2xs' 
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title="Deep Reasoning Mode"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline">Think</span>
                  </button>

                  {/* Mic Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title="Voice input"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>

                  {/* Circular Blue Action / Send Button matching Screenshot 1 */}
                  {input.trim() || attachedFile ? (
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-10 h-10 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0 cursor-pointer disabled:opacity-40"
                      title="Send message"
                    >
                      <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVoiceChatClick}
                      className="w-10 h-10 rounded-full bg-[#8ab4f8] hover:bg-[#7baaf7] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
                      title="Start Voice Chat"
                      aria-label="Start Voice Chat"
                    >
                      {/* Exact 3 vertical soundwave bars from Screenshot 1 */}
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <rect x="5" y="8" width="2.5" height="8" rx="1.25" />
                        <rect x="10.75" y="4" width="2.5" height="16" rx="1.25" />
                        <rect x="16.5" y="7" width="2.5" height="10" rx="1.25" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Quick Suggestions (3 clean left-aligned options matching Screenshot 1) */}
            <div className="flex flex-col items-start gap-4 w-full max-w-4xl pl-4 sm:pl-6">
              {quickOptionItems.map((opt, idx) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (opt.isImage && selectedModel !== 'cloudflare-image') {
                        onSelectModel?.('cloudflare-image');
                      }
                      setLastUserPrompt(opt.prompt);
                      onSendMessage(opt.prompt, null, { isImage: !!opt.isImage });
                    }}
                    className="flex items-center gap-3.5 text-sm sm:text-[15px] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer group"
                  >
                    <Icon className="w-4.5 h-4.5 text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        ) : (
          /* Active Messages Thread */
          <div className="w-full max-w-full sm:max-w-3xl mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-4 sm:space-y-6">
            {messages.map((m, index) => {
              const isUser = m.role === 'user';
              const isImageMsg = !isUser && (m.type === 'image_generation' || m.imageUrl || m.isLoading || m.error?.includes('image') || m.error?.includes('limit'));

              return (
                <div 
                  key={index} 
                  className={`flex gap-2.5 sm:gap-4 w-full min-w-0 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <OmniraIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain" />
                    </div>
                  )}

                  {/* Message Bubble Content */}
                  <div className={`flex flex-col gap-1.5 min-w-0 ${isUser ? 'max-w-[90%] sm:max-w-[75%] items-end' : 'w-full max-w-full flex-1'}`}>
                    
                    {/* User Text Bubble */}
                    {isUser ? (
                      <div className="bg-[var(--bg-hover)] text-[var(--text-primary)] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-[20px] text-base leading-relaxed break-words shadow-2xs text-justify [text-align-last:left] [text-justify:inter-word]">
                        {m.file && (
                          <div className="mb-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-xl flex items-center gap-2 text-xs">
                            {m.file.type?.startsWith('image/') || m.file.content?.startsWith('data:image/') ? (
                              <img src={m.file.content} alt={m.file.name} className="w-7 h-7 object-cover rounded-md" />
                            ) : (
                              <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                            )}
                            <span className="font-mono truncate max-w-[160px]">{m.file.name}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-justify [text-align-last:left] [text-justify:inter-word]">{m.content}</p>
                      </div>
                    ) : isImageMsg ? (
                      /* FLUX Image Generation Component */
                      <ImageGenerationMessage 
                        message={m} 
                        index={index} 
                        onRetry={(p) => onSendMessage(p, null, { isImage: true })}
                      />
                    ) : (
                      /* Standard Assistant Response Stream */
                      <div className="flex flex-col gap-2 w-full min-w-0">
                        <div 
                          className="prose dark:prose-invert max-w-none w-full text-base leading-relaxed text-[var(--text-primary)] break-words text-justify [text-align-last:left] [text-justify:inter-word] hyphens-auto"
                          dangerouslySetInnerHTML={{ __html: marked.parse(m.content || '') }}
                        />

                        {/* Message Action Controls (Copy / TTS) */}
                        <div className="flex items-center gap-1 mt-1 text-[var(--text-muted)]">
                          <button
                            onClick={() => handleCopy(m.content, index)}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === index ? <Check className="w-4 h-4 text-black dark:text-white" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => speakText(m.content)}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Read aloud"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Typing & Generation Indicator */}
            {isGenerating && (
              <div className="flex items-center gap-3 w-full animate-in fade-in duration-200">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center shrink-0 shadow-2xs">
                  <OmniraIcon className="w-4 h-4 object-contain" />
                </div>
                {isCurrentGeneratingImage ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-[var(--text-primary)] font-semibold">Creating images...</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Synthesizing FLUX neural vectors</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
                    <span>OMNIRA is typing</span>
                    <span className="inline-flex gap-1 items-center ml-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} className="h-2 shrink-0" />
          </div>
        )}
      </div>

      {/* Docked Bottom Composer Bar (In normal flex flow - CANNOT overlap messages) */}
      {messages.length > 0 && (
        <div className="shrink-0 w-full px-2 sm:px-6 pt-2 pb-3 sm:pb-5 z-20">
          <div className="w-full max-w-full sm:max-w-4xl mx-auto">
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
                    <FileText className="w-4 h-4 text-neutral-800 dark:text-neutral-200 shrink-0" />
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
              className="w-full rounded-full border border-neutral-200/90 dark:border-neutral-700/80 bg-[var(--bg-card)] shadow-[0_2px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_22px_rgba(0,0,0,0.09)] focus-within:shadow-[0_4px_26px_rgba(0,0,0,0.12)] focus-within:border-neutral-400 dark:focus-within:border-neutral-500 transition-all px-4 sm:px-6 py-2 sm:py-2.5 flex items-center gap-2.5 sm:gap-3.5"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="*/*"
              />

              {/* Left: Plus Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white transition-colors shrink-0 cursor-pointer"
                title="Add file or photo"
              >
                <Plus className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Center: Input Textarea */}
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
                placeholder="Ask anything"
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-base text-[var(--text-primary)] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 py-1.5 min-h-[36px] max-h-[140px] overflow-y-auto leading-relaxed font-normal min-w-0"
              />

              {/* Right Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Think Toggle */}
                <button
                  type="button"
                  onClick={() => setIsThinkingMode(!isThinkingMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    isThinkingMode 
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-2xs' 
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Deep Reasoning Mode"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Think</span>
                </button>

                {/* Mic Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4.5 h-4.5" />}
                </button>

                {/* Circular Action / Send Button matching Screenshot 1 */}
                {input.trim() || attachedFile ? (
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-10 h-10 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0 cursor-pointer disabled:opacity-40"
                    title="Send message"
                  >
                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleVoiceChatClick}
                    className="w-10 h-10 rounded-full bg-[#8ab4f8] hover:bg-[#7baaf7] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
                    title="Start Voice Chat"
                    aria-label="Start Voice Chat"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <rect x="5" y="8" width="2.5" height="8" rx="1.25" />
                      <rect x="10.75" y="4" width="2.5" height="16" rx="1.25" />
                      <rect x="16.5" y="7" width="2.5" height="10" rx="1.25" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* First-Time "Meet Voice" Onboarding Modal (Screenshot 2) */}
      <MeetVoiceModal
        isOpen={isMeetVoiceOpen}
        onClose={() => setIsMeetVoiceOpen(false)}
        onContinue={handleMeetVoiceContinue}
      />

      {/* Full-Screen Interactive Voice Chat Modal (Screenshot 3) */}
      <VoiceChatModal
        isOpen={isVoiceChatOpen}
        onClose={() => setIsVoiceChatOpen(false)}
        onOpenTypeChat={() => {
          setIsVoiceChatOpen(false);
          emptyTextareaRef.current?.focus();
          activeTextareaRef.current?.focus();
        }}
        selectedModel={selectedModel}
        currentUser={currentUser}
        onVoiceMessageComplete={(userSpoken, botSpoken) => {
          onSendMessage(userSpoken, null, { voiceResponse: botSpoken });
        }}
      />

    </div>
  );
}
