import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Pencil,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { marked } from 'marked';
import ImageGenerationMessage from './ImageGenerationMessage';
import { isImagePrompt } from '../engine/quickAiEngine';
import { OmniraIcon } from './OmniraLogo';
import FeedbackModal from './FeedbackModal';
import WeatherCard from './WeatherCard';
import SourcesPills from './SourcesPills';
import ClockCard from './ClockCard';

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
  const [feedback, setFeedback] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(true);
  const [isImageMode, setIsImageMode] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackContext, setFeedbackContext] = useState({});

  // ChatGPT-style In-Chat Voice Mode States (Image 1)
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceInterim, setVoiceInterim] = useState('');
  const [voiceAudioLevel, setVoiceAudioLevel] = useState(0);
  const [voiceError, setVoiceError] = useState(null);
  const [voiceLang, setVoiceLang] = useState(() => {
    return localStorage.getItem('omnira_voice_lang') || navigator.language || 'en-US';
  });

  const voiceRecognitionRef = useRef(null);
  const isAiSpeakingRef = useRef(false);
  const isVoiceChatOpenRef = useRef(false);
  const isVoiceMutedRef = useRef(false);
  const lastSpokenAiMsgIdRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const pendingVoiceSpeechRef = useRef('');
  const voicePulsingIntervalRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const audioAnimFrameRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const synthKeepAliveRef = useRef(null);
  const activeAudioRef = useRef(null);
  const onSendMessageRef = useRef(onSendMessage);
  const isGeneratingRef = useRef(isGenerating);
  const startVoiceRecognitionRef = useRef(null);

  useEffect(() => {
    onSendMessageRef.current = onSendMessage;
  }, [onSendMessage]);

  useEffect(() => {
    isGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    isVoiceChatOpenRef.current = isVoiceChatOpen;
  }, [isVoiceChatOpen]);

  useEffect(() => {
    isVoiceMutedRef.current = isVoiceMuted;
  }, [isVoiceMuted]);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const stopVoiceRecognition = useCallback(() => {
    if (voiceRecognitionRef.current) {
      try {
        const inst = voiceRecognitionRef.current;
        voiceRecognitionRef.current = null;
        inst.onend = null;
        inst.onerror = null;
        inst.onresult = null;
        inst.abort();
      } catch (e) {}
    }
  }, []);

  const startVoiceRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceError("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    stopVoiceRecognition();

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = voiceLang || 'en-US';

    rec.onstart = () => {
      setVoiceError(null);
    };

    rec.onresult = (event) => {
      if (isAiSpeakingRef.current || isGeneratingRef.current) return;

      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      if (interimStr) {
        setVoiceInterim(interimStr);
        pendingVoiceSpeechRef.current = interimStr;

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const speech = (pendingVoiceSpeechRef.current || '').trim();
          if (speech && !isAiSpeakingRef.current && !isGeneratingRef.current && isVoiceChatOpenRef.current) {
            pendingVoiceSpeechRef.current = '';
            setVoiceInterim('');
            stopVoiceRecognition();
            onSendMessageRef.current?.(speech);
          }
        }, 1000);
      }

      if (finalStr.trim()) {
        const speech = finalStr.trim();
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        pendingVoiceSpeechRef.current = '';
        setVoiceInterim('');
        if (!isAiSpeakingRef.current && !isGeneratingRef.current && isVoiceChatOpenRef.current) {
          stopVoiceRecognition();
          onSendMessageRef.current?.(speech);
        }
      }
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.warn("Speech recognition event error:", event.error);
      if (event.error === 'not-allowed') {
        setVoiceError("Microphone access is blocked. Please click the lock or camera icon in your browser address bar to allow microphone.");
      }
    };

    rec.onend = () => {
      voiceRecognitionRef.current = null;
      // If user had pending interim speech before onend, dispatch it
      if (pendingVoiceSpeechRef.current.trim() && !isAiSpeakingRef.current && !isGeneratingRef.current && isVoiceChatOpenRef.current) {
        const speech = pendingVoiceSpeechRef.current.trim();
        pendingVoiceSpeechRef.current = '';
        setVoiceInterim('');
        onSendMessageRef.current?.(speech);
        return;
      }

      // Immediately restart for next turn so it listens endlessly without stopping!
      if (isVoiceChatOpenRef.current && !isVoiceMutedRef.current && !isAiSpeakingRef.current && !isGeneratingRef.current) {
        setTimeout(() => {
          if (isVoiceChatOpenRef.current && !isVoiceMutedRef.current && !isAiSpeakingRef.current && !isGeneratingRef.current) {
            startVoiceRecognitionRef.current?.();
          }
        }, 100);
      }
    };

    try {
      rec.start();
      voiceRecognitionRef.current = rec;
    } catch (err) {
      setTimeout(() => {
        if (isVoiceChatOpenRef.current && !isVoiceMutedRef.current && !isAiSpeakingRef.current && !isGeneratingRef.current) {
          startVoiceRecognitionRef.current?.();
        }
      }, 250);
    }
  }, [voiceLang, stopVoiceRecognition]);

  useEffect(() => {
    startVoiceRecognitionRef.current = startVoiceRecognition;
  }, [startVoiceRecognition]);

  // Keep recognition listening whenever generation finishes
  useEffect(() => {
    if (!isGenerating && isVoiceChatOpenRef.current && !isVoiceMutedRef.current && !isAiSpeakingRef.current) {
      const timer = setTimeout(() => {
        if (isVoiceChatOpenRef.current && !isVoiceMutedRef.current && !isAiSpeakingRef.current && !voiceRecognitionRef.current) {
          startVoiceRecognitionRef.current?.();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  // Real-time microphone audio visualizer
  const startAudioAnalyser = useCallback((stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!isVoiceChatOpenRef.current) return;
        if (!isAiSpeakingRef.current) {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(1, avg / 35);
          setVoiceAudioLevel(normalized);
        }
        audioAnimFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.warn("Audio analyser notice:", e);
    }
  }, []);

  const speakAiResponse = useCallback((text) => {
    if (typeof window === 'undefined') return;

    const clean = text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/[*#_`~[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return;

    // 1. Immediately cancel any prior speech or audio so sounds NEVER overlap
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current.onended = null;
        activeAudioRef.current.onerror = null;
      } catch (e) {}
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    isAiSpeakingRef.current = true;
    setIsAiSpeaking(true);

    // Stop recognition while AI is speaking so it doesn't hear itself
    stopVoiceRecognition();

    if (voicePulsingIntervalRef.current) clearInterval(voicePulsingIntervalRef.current);
    voicePulsingIntervalRef.current = setInterval(() => {
      setVoiceAudioLevel(0.3 + Math.random() * 0.55);
    }, 120);

    let hasStartedSpeaking = false;
    let fallbackTimeout = null;
    let speechWatchdog = null;

    const finishSpeaking = () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (speechWatchdog) clearTimeout(speechWatchdog);
      if (synthKeepAliveRef.current) {
        clearInterval(synthKeepAliveRef.current);
        synthKeepAliveRef.current = null;
      }
      activeUtteranceRef.current = null;
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
      setVoiceAudioLevel(0);
      if (voicePulsingIntervalRef.current) {
        clearInterval(voicePulsingIntervalRef.current);
        voicePulsingIntervalRef.current = null;
      }
      setTimeout(() => {
        if (isVoiceChatOpenRef.current && !isVoiceMutedRef.current && !isAiSpeakingRef.current && !isGeneratingRef.current) {
          startVoiceRecognitionRef.current?.();
        }
      }, 250);
    };

    const playFallbackAudio = () => {
      // Never double play if synthesis is speaking
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        return;
      }
      try {
        if (activeAudioRef.current) {
          try {
            activeAudioRef.current.pause();
            activeAudioRef.current.currentTime = 0;
            activeAudioRef.current.onended = null;
            activeAudioRef.current.onerror = null;
          } catch (e) {}
          activeAudioRef.current = null;
        }
        const shortCode = (voiceLang || 'en').split('-')[0];
        const audio = new Audio(`/api/tts?text=${encodeURIComponent(clean.slice(0, 180))}&lang=${shortCode}`);
        activeAudioRef.current = audio;
        audio.onended = () => {
          activeAudioRef.current = null;
          finishSpeaking();
        };
        audio.onerror = () => {
          activeAudioRef.current = null;
          finishSpeaking();
        };
        audio.play().catch(() => {
          activeAudioRef.current = null;
          finishSpeaking();
        });
      } catch (e) {
        finishSpeaking();
      }
    };

    // 1. Try SpeechSynthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(clean);
        activeUtteranceRef.current = utterance;
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.lang = voiceLang || 'en-US';

        const voices = window.speechSynthesis.getVoices();
        const langPrefix = (voiceLang || 'en').split('-')[0].toLowerCase();
        const matchedVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith(langPrefix) && 
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Online'))
        ) || voices.find(v => v.lang.toLowerCase().startsWith(langPrefix)) || voices[0];
        if (matchedVoice) utterance.voice = matchedVoice;

        utterance.onstart = () => {
          hasStartedSpeaking = true;
          if (fallbackTimeout) {
            clearTimeout(fallbackTimeout);
            fallbackTimeout = null;
          }
        };

        const wordsCount = clean.split(/\s+/).length;
        const estimatedDurationMs = Math.max(2500, (wordsCount / 2.2) * 1000) + 1200;
        speechWatchdog = setTimeout(() => {
          if (isAiSpeakingRef.current) {
            finishSpeaking();
          }
        }, estimatedDurationMs);

        utterance.onend = () => {
          if (speechWatchdog) clearTimeout(speechWatchdog);
          finishSpeaking();
        };
        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis utterance error:", e);
          if (speechWatchdog) clearTimeout(speechWatchdog);
          if (!hasStartedSpeaking) {
            playFallbackAudio();
          } else {
            finishSpeaking();
          }
        };

        if (synthKeepAliveRef.current) clearInterval(synthKeepAliveRef.current);
        synthKeepAliveRef.current = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.resume();
          }
        }, 2500);

        window.speechSynthesis.speak(utterance);

        // Fallback watchdog: Only trigger if not speaking after 3500ms
        fallbackTimeout = setTimeout(() => {
          if (!hasStartedSpeaking && !window.speechSynthesis.speaking) {
            console.warn("SpeechSynthesis did not start within 3.5s, playing audio fallback");
            window.speechSynthesis.cancel();
            playFallbackAudio();
          }
        }, 3500);

        return;
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }

    // 2. Direct Fallback if SpeechSynthesis not available
    playFallbackAudio();
  }, [voiceLang, startVoiceRecognition, stopVoiceRecognition]);

  // Watch for new AI responses in voice chat and speak them aloud
  useEffect(() => {
    if (!isGenerating && isVoiceChatOpenRef.current && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.content && !lastMsg.isLoading) {
        const msgKey = lastMsg.id || `${messages.length}-${lastMsg.content.slice(0, 30)}`;
        if (msgKey !== lastSpokenAiMsgIdRef.current) {
          lastSpokenAiMsgIdRef.current = msgKey;
          speakAiResponse(lastMsg.content);
        }
      }
    }
  }, [isGenerating, messages, speakAiResponse]);

  const handleOpenVoiceChat = () => {
    setIsVoiceChatOpen(true);
    isVoiceChatOpenRef.current = true;
    setIsVoiceMuted(false);
    isVoiceMutedRef.current = false;
    setVoiceError(null);

    // 1. Resume AudioContext and SpeechSynthesis immediately on user gesture!
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }

    // 2. Request microphone hardware permissions in background without blocking speech
    if (navigator?.mediaDevices?.getUserMedia) {
      if (!micStreamRef.current) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            micStreamRef.current = stream;
            startAudioAnalyser(stream);
          })
          .catch((err) => {
            console.warn("Microphone permission notice:", err);
            setVoiceError("Microphone permission required. Please click the lock or camera icon in your address bar to allow microphone.");
          });
      }
    }

    // 3. Immediately talk to user with a natural greeting!
    if (messages.length === 0) {
      const greetingId = `greeting-${Date.now()}`;
      const greeting = voiceLang?.startsWith('ne')
        ? "नमस्ते! म तपाईंलाई कसरी सहयोग गर्न सक्छु?"
        : voiceLang?.startsWith('hi')
        ? "नमस्ते! मैं आपकी क्या मदद कर सकता हूँ?"
        : "Hey! What's on your mind today?";

      const greetingMsg = {
        id: greetingId,
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toLocaleTimeString()
      };

      lastSpokenAiMsgIdRef.current = greetingId;
      setMessages([greetingMsg]);
      speakAiResponse(greeting);
    } else {
      // Existing messages in chat: start listening directly
      startVoiceRecognition();
    }
  };

  const handleCloseVoiceMode = () => {
    setIsVoiceChatOpen(false);
    isVoiceChatOpenRef.current = false;
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    setVoiceInterim('');
    setVoiceError(null);

    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current.onended = null;
        activeAudioRef.current.onerror = null;
      } catch (e) {}
      activeAudioRef.current = null;
    }

    if (synthKeepAliveRef.current) {
      clearInterval(synthKeepAliveRef.current);
      synthKeepAliveRef.current = null;
    }
    activeUtteranceRef.current = null;

    if (voicePulsingIntervalRef.current) {
      clearInterval(voicePulsingIntervalRef.current);
      voicePulsingIntervalRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (audioAnimFrameRef.current) {
      cancelAnimationFrame(audioAnimFrameRef.current);
      audioAnimFrameRef.current = null;
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      micStreamRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    stopVoiceRecognition();
  };

  const toggleVoiceMute = () => {
    const nextMuted = !isVoiceMuted;
    setIsVoiceMuted(nextMuted);
    isVoiceMutedRef.current = nextMuted;
    if (nextMuted) {
      stopVoiceRecognition();
    } else {
      if (!isAiSpeakingRef.current) {
        startVoiceRecognition();
      }
    }
  };

  const handleVoiceLangChange = (newLang) => {
    setVoiceLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omnira_voice_lang', newLang);
    }
    if (isVoiceChatOpenRef.current && !isVoiceMutedRef.current && !isAiSpeakingRef.current) {
      setTimeout(() => {
        startVoiceRecognition();
      }, 100);
    }
  };

  const handleFeedback = (index, type, msgContent = '') => {
    if (type === 'dislike') {
      if (feedback[index] === 'dislike') {
        setFeedback(prev => ({ ...prev, [index]: null }));
        return;
      }

      let query = '';
      for (let i = index - 1; i >= 0; i--) {
        if (messages[i]?.role === 'user') {
          query = messages[i].content;
          break;
        }
      }

      setFeedbackContext({
        index,
        userEmail: currentUser?.email || '',
        userName: currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Guest User'),
        userQuery: query || lastUserPrompt,
        aiResponse: msgContent || messages[index]?.content || '',
        model: selectedModel || 'OMNIRA (GPT-4o)',
        conversationId: null
      });
      setIsFeedbackModalOpen(true);
      return;
    }

    setFeedback(prev => ({
      ...prev,
      [index]: prev[index] === type ? null : type
    }));
  };

  const handleRegenerate = (index) => {
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i]?.role === 'user') {
        onSendMessage(messages[i].content);
        break;
      }
    }
  };

  const handleVoiceChatClick = () => {
    handleOpenVoiceChat();
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
        if (input) {
          el.style.height = `${Math.min(Math.max(el.scrollHeight, 40), 220)}px`;
        }
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

    // Detect short ISO language code
    let shortCode = 'en';
    if (/[\u0900-\u097F]/.test(cleanText)) {
      shortCode = /(छ|छन्|भयो|गर्छ|तपाईं|के|हो|छैन|नमस्ते|गर्नुहोस्|हामी|मलाई|नेपाली)/.test(cleanText) ? 'ne' : 'hi';
    } else if (/[\u0600-\u06FF]/.test(cleanText)) {
      shortCode = 'ar';
    } else if (/[\u4E00-\u9FFF]/.test(cleanText)) {
      shortCode = 'zh';
    } else if (/[\u3040-\u30FF]/.test(cleanText)) {
      shortCode = 'ja';
    } else if (/[\uAC00-\uD7AF]/.test(cleanText)) {
      shortCode = 'ko';
    } else if (/[\u0400-\u04FF]/.test(cleanText)) {
      shortCode = 'ru';
    } else if (/(hola|gracias|buenos|días|español)/i.test(cleanText)) {
      shortCode = 'es';
    } else if (/(bonjour|merci|français)/i.test(cleanText)) {
      shortCode = 'fr';
    } else if (/(hallo|danke|deutsch)/i.test(cleanText)) {
      shortCode = 'de';
    }

    const encoded = encodeURIComponent(cleanText.slice(0, 190));
    const audio = new Audio(`/api/tts?text=${encoded}&lang=${shortCode}`);
    audio.volume = 1.0;

    audio.onerror = () => {
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

    audio.play().catch(() => {
      audio.onerror(new Event('error'));
    });
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

  // Shared helper: read any File object and store as attachedFile
  const readAndAttachFile = (file) => {
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

  const handleFileUpload = (e) => {
    readAndAttachFile(e.target.files?.[0]);
    // Reset the input value so the same file can be re-attached
    if (e.target) e.target.value = '';
  };

  // ChatGPT-like paste handler: paste a screenshot or file directly from clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === 'file') {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) readAndAttachFile(file);
        return;
      }
    }
    // Plain text paste falls through to default textarea behaviour
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
      
      {/* Liquid Wave Animations for the Dynamic Fluid Orb */}
      <style>{`
        @keyframes liquidWaveA {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes liquidWaveB {
          0% { transform: rotate(360deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(0.95); }
          100% { transform: rotate(0deg) scale(1.1); }
        }
        @keyframes liquidWaveC {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.08); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .liquid-wave-a { animation: liquidWaveA 7s ease-in-out infinite; }
        .liquid-wave-b { animation: liquidWaveB 10s ease-in-out infinite; }
        .liquid-wave-c { animation: liquidWaveC 6s ease-in-out infinite; }
      `}</style>

      {/* ChatGPT Voice Header (Image 1) */}
      {isVoiceChatOpen && (
        <div className="w-full py-2.5 px-4 sm:px-6 flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-[#212121]/90 backdrop-blur-md sticky top-0 z-30 transition-all shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-sm sm:text-base text-neutral-800 dark:text-neutral-100">
              OMNIRA Voice
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
              {isGenerating ? '• Thinking' : isAiSpeaking ? '• Speaking' : isVoiceMuted ? '• Muted' : '• Listening'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 text-xs shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <select
                value={voiceLang}
                onChange={(e) => handleVoiceLangChange(e.target.value)}
                className="bg-transparent text-[11px] font-medium text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer"
                title="Voice language"
              >
                <option value="en-US">English (US)</option>
                <option value="ne-NP">नेपाली (Nepali)</option>
                <option value="hi-IN">हिन्दी (Hindi)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
                <option value="zh-CN">中文</option>
                <option value="ja-JP">日本語</option>
                <option value="ar-SA">العربية</option>
              </select>
            </div>

            <button
              onClick={handleCloseVoiceMode}
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close voice chat"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Voice Error Notification Banner */}
      {isVoiceChatOpen && voiceError && (
        <div className="w-full px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-center gap-2 z-20 shrink-0 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Thread Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full min-w-0">
        
        {messages.length === 0 && !isVoiceChatOpen ? (
          /* Empty Chat View matching ChatGPT Screenshot 1:1 */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 w-full max-w-2xl mx-auto -mt-10 sm:-mt-14">
            
            {/* Minimalist Title */}
            <h1 className="text-[28px] sm:text-[32px] font-medium tracking-tight mb-6 text-neutral-800 dark:text-neutral-100 select-none">
              What's on your mind today?
            </h1>

            {/* Main Floating Input Composer Box - Matches ChatGPT width and proportion */}
            <div className="w-full mb-5">
              {attachedFile && (
                <div className="mb-2.5 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
                  {/* Image preview — full width thumbnail like ChatGPT */}
                  {(attachedFile.type?.startsWith('image/') || attachedFile.content?.startsWith('data:image/')) ? (
                    <div className="relative group">
                      <img
                        src={attachedFile.content}
                        alt={attachedFile.name}
                        className="w-full max-h-52 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                        <p className="text-white text-xs font-medium truncate">{attachedFile.name}</p>
                        <p className="text-white/70 text-[10px]">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    /* Non-image file chip */
                    <div className="p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        {attachedFile.type?.startsWith('video/') ? (
                          <Video className="w-5 h-5 text-purple-500 shrink-0" />
                        ) : attachedFile.type?.startsWith('audio/') ? (
                          <Music className="w-5 h-5 text-amber-500 shrink-0" />
                        ) : attachedFile.type?.includes('pdf') ? (
                          <FileText className="w-5 h-5 text-red-500 shrink-0" />
                        ) : attachedFile.type?.includes('code') || /\.(js|ts|py|java|c|cpp|html|css|json|xml)$/i.test(attachedFile.name) ? (
                          <Code className="w-5 h-5 text-blue-500 shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-neutral-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-[var(--text-primary)] truncate max-w-[180px]">{attachedFile.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        {/* Text file preview */}
                        {typeof attachedFile.content === 'string' && !attachedFile.content.startsWith('data:') && (
                          <p className="text-[10px] text-[var(--text-muted)] italic truncate max-w-[120px] ml-1">
                            "{attachedFile.content.slice(0, 60)}..."
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-hover)] cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form 
                onSubmit={handleSubmit}
                className="w-full border border-neutral-200/90 dark:border-neutral-700/80 bg-white dark:bg-[#212121] shadow-[0_2px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.08)] focus-within:shadow-[0_4px_22px_rgba(0,0,0,0.1)] focus-within:border-neutral-400 dark:focus-within:border-neutral-500 rounded-[26px] p-3 sm:p-3.5 flex flex-col justify-between transition-all"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="*/*"
                />

                {/* Textarea spans full width across top - wraps naturally exactly like ChatGPT */}
                <div className="w-full px-1.5 pt-0.5">
                  <textarea
                    ref={emptyTextareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    onPaste={handlePaste}
                    placeholder="Ask anything, or paste a screenshot…"
                    rows={1}
                    className="w-full bg-transparent border-none outline-none resize-none text-[15px] sm:text-[16px] text-[var(--text-primary)] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-normal leading-relaxed min-h-[36px] sm:min-h-[44px] max-h-[220px] overflow-y-auto"
                  />
                </div>

                {/* Bottom Toolbar row: + on bottom-left, Action buttons on bottom-right */}
                <div className="flex items-center justify-between w-full pt-1.5 px-0.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                    title="Add file or photo"
                  >
                    <Plus className="w-5 h-5 stroke-[2]" />
                  </button>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsThinkingMode(!isThinkingMode)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                        isThinkingMode 
                          ? 'border-neutral-800 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 font-medium' 
                          : 'border-neutral-200 dark:border-neutral-700/80 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      title="Deep Reasoning Mode"
                    >
                      <Brain className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span className="hidden sm:inline font-normal">Think</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      title="Voice input"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 stroke-[1.8]" />}
                    </button>

                    {input.trim() || attachedFile ? (
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs shrink-0 cursor-pointer disabled:opacity-40"
                        title="Send message"
                      >
                        <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleVoiceChatClick}
                        className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs shrink-0 cursor-pointer"
                        title="Start Voice Chat"
                        aria-label="Start Voice Chat"
                      >
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <rect x="5" y="8" width="2.5" height="8" rx="1.25" />
                          <rect x="10.75" y="4" width="2.5" height="16" rx="1.25" />
                          <rect x="16.5" y="7" width="2.5" height="10" rx="1.25" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Suggestions (3 clean left-aligned options matching ChatGPT) */}
            <div className="flex flex-col items-start gap-2.5 w-full pl-3 sm:pl-4">
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
                    className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer group py-0.5"
                  >
                    <Icon className="w-4 h-4 stroke-[1.6] text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        ) : (
          /* Active Messages Thread - Centered with equal left/right space matching ChatGPT */
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
            {messages.map((m, index) => {
              const isUser = m.role === 'user';
              const isImageMsg = !isUser && (m.type === 'image_generation' || m.imageUrl || m.isLoading || m.error?.includes('image') || m.error?.includes('limit'));

              return (
                <div 
                  key={index} 
                  className={`flex w-full min-w-0 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Message Bubble Content */}
                  <div className={`flex flex-col gap-1.5 min-w-0 ${isUser ? 'max-w-[85%] sm:max-w-[75%] items-end' : 'w-full max-w-full'}`}>
                    
                    {/* User Text Bubble (In Voice Mode: light blue pill matching Image 1) */}
                    {isUser ? (
                      <div className={`${
                        isVoiceChatOpen
                          ? 'bg-[#eef7ff] dark:bg-[#1a2e4c] text-[#0f52ba] dark:text-[#90caf9] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[15px] font-normal shadow-2xs'
                          : 'bg-[#f4f4f4] dark:bg-[#2f2f2f] text-[var(--text-primary)] px-4 sm:px-5 py-2.5 sm:py-3 rounded-[24px] text-[15px] sm:text-base leading-relaxed break-words shadow-2xs'
                      }`}>
                        {m.file && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                            {m.file.type?.startsWith('image/') || m.file.content?.startsWith('data:image/') ? (
                              // Full-size image preview in message bubble like ChatGPT
                              <img
                                src={m.file.content}
                                alt={m.file.name}
                                className="w-full max-h-64 object-cover rounded-xl"
                              />
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2 bg-black/5 dark:bg-white/5">
                                <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-mono text-xs truncate max-w-[160px]">{m.file.name}</p>
                                  {typeof m.file.content === 'string' && !m.file.content.startsWith('data:') && (
                                    <p className="text-[10px] text-[var(--text-muted)] italic truncate max-w-[160px]">
                                      "{m.file.content.slice(0, 80)}..."
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    ) : isImageMsg ? (
                      /* FLUX Image Generation Component */
                      <ImageGenerationMessage 
                        message={m} 
                        index={index} 
                        onRetry={(p) => onSendMessage(p, null, { isImage: true })}
                      />
                    ) : (
                      /* Standard Assistant Response Stream - Clean ChatGPT Minimalist Look (No Avatar Logo) */
                      <div className="flex flex-col gap-2 w-full min-w-0">
                        {/* Intro text (e.g. location acknowledgment) */}
                        {m.introText && (
                          <div 
                            className="prose dark:prose-invert max-w-none w-full text-[15.5px] sm:text-base leading-[1.75] text-[var(--text-primary)] break-words mb-1"
                            dangerouslySetInnerHTML={{ __html: marked.parse(m.introText) }}
                          />
                        )}

                        {/* Live Clock Widget if timeData exists */}
                        {m.timeData && (
                          <ClockCard timeData={m.timeData} />
                        )}

                        {/* Interactive Weather Card Widget if weather data exists */}
                        {m.weather && (
                          <WeatherCard 
                            weather={m.weather} 
                            onSelectPrompt={(p) => onSendMessage(p)} 
                          />
                        )}

                        {/* Main Markdown Content */}
                        {m.content && (
                          <div 
                            className="prose dark:prose-invert max-w-none w-full text-[15.5px] sm:text-base leading-[1.75] text-[var(--text-primary)] break-words"
                            dangerouslySetInnerHTML={{ __html: marked.parse(m.content || '') }}
                          />
                        )}

                        {/* Sources Pills & Suggestion Action Chips */}
                        {((m.sources && m.sources.length > 0) || (m.suggestions && m.suggestions.length > 0)) && (
                          <SourcesPills 
                            sources={m.sources || []} 
                            suggestions={m.suggestions || []} 
                            onSelectSuggestion={(sug) => onSendMessage(sug)} 
                          />
                        )}

                        {/* Message Action Controls (Copy / TTS / Like / Dislike / Regenerate) */}
                        <div className="flex items-center gap-0.5 mt-1 -ml-1 text-[var(--text-muted)]">
                          <button
                            onClick={() => handleCopy(m.content, index)}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === index ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 stroke-[1.6]" />}
                          </button>
                          <button
                            onClick={() => speakText(m.content)}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Read aloud"
                          >
                            <Volume2 className="w-4 h-4 stroke-[1.6]" />
                          </button>
                          <button
                            onClick={() => handleFeedback(index, 'like')}
                            className={`p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer ${
                              feedback[index] === 'like' ? 'text-blue-500' : 'hover:text-[var(--text-primary)]'
                            }`}
                            title="Good response"
                          >
                            <ThumbsUp className="w-4 h-4 stroke-[1.6]" />
                          </button>
                          <button
                            onClick={() => handleFeedback(index, 'dislike', m.content)}
                            className={`p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer ${
                              feedback[index] === 'dislike' ? 'text-red-500' : 'hover:text-[var(--text-primary)]'
                            }`}
                            title="Bad response"
                          >
                            <ThumbsDown className="w-4 h-4 stroke-[1.6]" />
                          </button>
                          <button
                            onClick={() => handleRegenerate(index)}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            title="Regenerate"
                          >
                            <RefreshCw className="w-3.5 h-3.5 stroke-[1.6]" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Typing & Generation Indicator */}
            {isGenerating && !isVoiceChatOpen && (
              <div className="flex items-center gap-2 w-full py-1 text-sm text-[var(--text-muted)] animate-in fade-in duration-200">
                {isCurrentGeneratingImage ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-[var(--text-primary)] font-semibold">Creating images...</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Synthesizing FLUX neural vectors</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 py-1 px-1">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" />
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Live Interim User Speech Bubble in Voice Chat */}
            {isVoiceChatOpen && voiceInterim && (
              <div className="flex w-full justify-end animate-in fade-in">
                <div className="bg-[#eef7ff]/90 dark:bg-[#1a2e4c]/90 text-[#0f52ba] dark:text-[#90caf9] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[15px] font-normal border border-blue-200/60 dark:border-blue-700/60 flex items-center gap-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>{voiceInterim}</span>
                </div>
              </div>
            )}

            {/* Floating Fluid Dynamic Orb (Image 1) */}
            {isVoiceChatOpen && (
              <div className="flex flex-col items-center justify-center my-6 sm:my-8 py-2 shrink-0 animate-in fade-in duration-300">
                <div 
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-[0_10px_35px_rgba(14,165,233,0.4)] dark:shadow-[0_10px_45px_rgba(2,132,199,0.35)] overflow-hidden border border-white/90 dark:border-white/25 flex items-center justify-center transition-transform duration-200 bg-[#cbe9fe]"
                  style={{
                    transform: `scale(${isAiSpeaking ? 1.08 + voiceAudioLevel * 0.15 : voiceInterim ? 1.05 + voiceAudioLevel * 0.12 : isGenerating ? 1.04 : 1})`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#38bdf8] opacity-90" />
                  <div className="absolute -inset-3 rounded-[42%] bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-transparent opacity-85 liquid-wave-a blur-xs" />
                  <div className="absolute -inset-3 rounded-[38%] bg-gradient-to-bl from-[#0369a1] via-[#0ea5e9] to-[#7dd3fc] opacity-80 liquid-wave-b blur-xs" />
                  <div className="absolute -inset-2 rounded-[46%] bg-gradient-to-r from-[#38bdf8]/60 via-[#bae6fd]/40 to-transparent opacity-75 liquid-wave-c" />
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
                  <div className="absolute top-1.5 left-2.5 w-6 h-3 rounded-full bg-white/80 blur-xs rotate-[-25deg] pointer-events-none" />
                </div>

                <div className="mt-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 select-none">
                  {isGenerating ? (
                    <span className="text-sky-600 dark:text-sky-400 font-semibold animate-pulse">Thinking...</span>
                  ) : isAiSpeaking ? (
                    <span className="text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      <span>Speaking...</span>
                    </span>
                  ) : isVoiceMuted ? (
                    <span className="text-red-500 font-medium">Microphone muted</span>
                  ) : voiceInterim ? (
                    <span className="text-neutral-700 dark:text-neutral-200">Listening to you...</span>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">Listening...</span>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2 shrink-0" />
          </div>
        )}
      </div>

      {/* Docked Bottom Bar (In normal flex flow - CANNOT overlap messages) */}
      {(messages.length > 0 || isVoiceChatOpen) && (
        <div className="shrink-0 w-full px-4 sm:px-6 pt-2 pb-3 sm:pb-5 z-20">
          {isVoiceChatOpen ? (
            /* ChatGPT Floating Voice Bar (Image 1) */
            <div className="w-full max-w-xl mx-auto px-4 py-2.5 bg-neutral-100/95 dark:bg-[#212121]/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-700/80 rounded-full shadow-lg flex items-center justify-between transition-all animate-in slide-in-from-bottom-2 duration-200">
              <button
                type="button"
                onClick={() => {
                  handleCloseVoiceMode();
                  setTimeout(() => {
                    emptyTextareaRef.current?.focus();
                    activeTextareaRef.current?.focus();
                  }, 60);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white px-3.5 py-1.5 rounded-full hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Type</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVoiceMute}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isVoiceMuted 
                      ? 'bg-red-500 text-white' 
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                  }`}
                  title={isVoiceMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {isVoiceMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5 stroke-[2]" />}
                </button>

                <button
                  type="button"
                  onClick={handleCloseVoiceMode}
                  className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center hover:opacity-90 transition-transform active:scale-95 shadow-xs cursor-pointer"
                  title="End voice session"
                >
                  <X className="w-4.5 h-4.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ) : (
            /* Standard Text Composer */
            <div className="w-full max-w-3xl mx-auto">
              {attachedFile && (
                <div className="mb-2 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
                  {(attachedFile.type?.startsWith('image/') || attachedFile.content?.startsWith('data:image/')) ? (
                    <div className="relative group">
                      <img
                        src={attachedFile.content}
                        alt={attachedFile.name}
                        className="w-full max-h-52 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                        <p className="text-white text-xs font-medium truncate">{attachedFile.name}</p>
                        <p className="text-white/70 text-[10px]">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        {attachedFile.type?.startsWith('video/') ? (
                          <Video className="w-5 h-5 text-purple-500 shrink-0" />
                        ) : attachedFile.type?.startsWith('audio/') ? (
                          <Music className="w-5 h-5 text-amber-500 shrink-0" />
                        ) : attachedFile.type?.includes('pdf') ? (
                          <FileText className="w-5 h-5 text-red-500 shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-neutral-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-[var(--text-primary)] truncate max-w-[180px]">{attachedFile.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-full hover:bg-[var(--bg-hover)] cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form 
                onSubmit={handleSubmit}
                className="w-full border border-neutral-200/90 dark:border-neutral-700/80 bg-white dark:bg-[#212121] shadow-[0_2px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.08)] focus-within:shadow-[0_4px_22px_rgba(0,0,0,0.1)] focus-within:border-neutral-400 dark:focus-within:border-neutral-500 rounded-[26px] p-3 sm:p-3.5 flex flex-col justify-between transition-all"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="*/*"
                />

                {/* Textarea spans full width across top - wraps naturally exactly like ChatGPT */}
                <div className="w-full px-1.5 pt-0.5">
                  <textarea
                    ref={activeTextareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    onPaste={handlePaste}
                    placeholder="Ask anything, or paste a screenshot…"
                    rows={1}
                    className="w-full bg-transparent border-none outline-none resize-none text-[15px] sm:text-[16px] text-[var(--text-primary)] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-normal leading-relaxed min-h-[36px] sm:min-h-[44px] max-h-[220px] overflow-y-auto"
                  />
                </div>

                {/* Bottom Toolbar row: + on bottom-left, Action buttons on bottom-right */}
                <div className="flex items-center justify-between w-full pt-1.5 px-0.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                    title="Add file or photo"
                  >
                    <Plus className="w-5 h-5 stroke-[2]" />
                  </button>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsThinkingMode(!isThinkingMode)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                        isThinkingMode 
                          ? 'border-neutral-800 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 font-medium' 
                          : 'border-neutral-200 dark:border-neutral-700/80 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      title="Deep Reasoning Mode"
                    >
                      <Brain className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span className="hidden sm:inline font-normal">Think</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      title="Voice input"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 stroke-[1.8]" />}
                    </button>

                    {input.trim() || attachedFile ? (
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs shrink-0 cursor-pointer disabled:opacity-40"
                        title="Send message"
                      >
                        <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleVoiceChatClick}
                        className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs shrink-0 cursor-pointer"
                        title="Start Voice Chat"
                        aria-label="Start Voice Chat"
                      >
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <rect x="5" y="8" width="2.5" height="8" rx="1.25" />
                          <rect x="10.75" y="4" width="2.5" height="16" rx="1.25" />
                          <rect x="16.5" y="7" width="2.5" height="10" rx="1.25" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ChatGPT-Style "Share Feedback" Dislike Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmitSuccess={() => {
          if (feedbackContext?.index !== undefined) {
            setFeedback(prev => ({ ...prev, [feedbackContext.index]: 'dislike' }));
          }
        }}
        feedbackContext={feedbackContext}
      />

    </div>
  );
}
