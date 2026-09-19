import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff, AlertCircle, Globe, Volume2 } from 'lucide-react';
import { queryQuickAi } from '../engine/quickAiEngine';

// Helper to detect language script and ISO code
function detectScriptLanguage(text) {
  if (!text) return { langCode: 'en-US', shortCode: 'en' };
  // Devanagari (Nepali / Hindi)
  if (/[\u0900-\u097F]/.test(text)) {
    if (/(छ|छन्|भयो|गर्छ|तपाईं|के|हो|छैन|नमस्ते|गर्नुहोस्|हामी|मलाई|नेपाली|धन्यवाद|कस्तो|हुन्छ|भन्नुहोस्|गर्न|राम्रो)/.test(text)) {
      return { langCode: 'ne-NP', shortCode: 'ne' };
    }
    return { langCode: 'hi-IN', shortCode: 'hi' };
  }
  // Arabic
  if (/[\u0600-\u06FF]/.test(text)) return { langCode: 'ar-SA', shortCode: 'ar' };
  // Chinese
  if (/[\u4E00-\u9FFF]/.test(text)) return { langCode: 'zh-CN', shortCode: 'zh' };
  // Japanese
  if (/[\u3040-\u30FF]/.test(text)) return { langCode: 'ja-JP', shortCode: 'ja' };
  // Korean
  if (/[\uAC00-\uD7AF]/.test(text)) return { langCode: 'ko-KR', shortCode: 'ko' };
  // Cyrillic (Russian)
  if (/[\u0400-\u04FF]/.test(text)) return { langCode: 'ru-RU', shortCode: 'ru' };
  // Spanish
  if (/(hola|gracias|buenos|días|cómo|estás|por favor|español|amigo)/i.test(text)) return { langCode: 'es-ES', shortCode: 'es' };
  // French
  if (/(bonjour|merci|salut|français|s'il vous plaît|oui)/i.test(text)) return { langCode: 'fr-FR', shortCode: 'fr' };
  // German
  if (/(hallo|danke|bitte|deutsch|guten tag|ja)/i.test(text)) return { langCode: 'de-DE', shortCode: 'de' };

  const savedLang = localStorage.getItem('omnira_language');
  if (savedLang && savedLang !== 'Auto-detect') {
    const map = {
      'Spanish (ES)': { langCode: 'es-ES', shortCode: 'es' },
      'French (FR)': { langCode: 'fr-FR', shortCode: 'fr' },
      'German (DE)': { langCode: 'de-DE', shortCode: 'de' },
      'Italian (IT)': { langCode: 'it-IT', shortCode: 'it' },
      'Portuguese (PT)': { langCode: 'pt-BR', shortCode: 'pt' },
      'Chinese (Simplified)': { langCode: 'zh-CN', shortCode: 'zh' },
      'Japanese': { langCode: 'ja-JP', shortCode: 'ja' },
      'Hindi': { langCode: 'hi-IN', shortCode: 'hi' },
      'Nepali': { langCode: 'ne-NP', shortCode: 'ne' },
      'Arabic': { langCode: 'ar-SA', shortCode: 'ar' },
      'Russian': { langCode: 'ru-RU', shortCode: 'ru' }
    };
    if (map[savedLang]) return map[savedLang];
  }

  return { langCode: navigator.language || 'en-US', shortCode: (navigator.language || 'en').split('-')[0] };
}

function getBestVoiceForLanguage(langCode, voices) {
  if (!voices || voices.length === 0) return null;
  const langPrefix = langCode.split('-')[0].toLowerCase();
  
  // 1. Exact match (e.g. 'ne-NP', 'hi-IN', 'es-ES')
  let match = voices.find(v => v.lang.toLowerCase().replace('_', '-') === langCode.toLowerCase());
  if (match) return match;
  
  // 2. Prefix match (e.g. 'ne', 'hi', 'es', 'fr', 'de', 'ja', 'zh')
  match = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
  if (match) return match;

  // 3. Fallback for Nepali (use Hindi voice if dedicated Nepali voice not installed on OS)
  if (langPrefix === 'ne') {
    match = voices.find(v => v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().includes('in'));
    if (match) return match;
  }
  
  // 4. Natural / high-clarity voice
  return voices.find(v => 
    (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.lang.startsWith('en')) &&
    !v.name.includes('whisper')
  ) || voices[0];
}

function splitIntoSpokenSentences(text) {
  if (!text) return [];
  const raw = text.split(/(?<=[.!?।\n])\s+/);
  const chunks = [];
  for (const part of raw) {
    const trimmed = part.trim();
    if (trimmed) chunks.push(trimmed);
  }
  return chunks.length > 0 ? chunks : [text.trim()];
}

export default function VoiceChatModal({
  isOpen,
  onClose,
  onOpenTypeChat,
  onVoiceMessageComplete,
  selectedModel = 'gpt-4o',
  currentUser = { name: 'Guest User' }
}) {
  const [voiceState, setVoiceState] = useState('listening'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'muted'
  const [userTranscript, setUserTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [botResponseText, setBotResponseText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [voiceLang, setVoiceLang] = useState(() => {
    return localStorage.getItem('omnira_voice_lang') || navigator.language || 'en-US';
  });

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const speakingIntervalRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isSpeakingUtteranceRef = useRef(false);
  const voicesListRef = useRef([]);
  const callHistoryRef = useRef([]);
  const isProcessingRef = useRef(false);
  const pendingSpeechRef = useRef('');
  const currentAudioRef = useRef(null);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          voicesListRef.current = available;
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const stopAllAudio = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (speakingIntervalRef.current) {
      clearInterval(speakingIntervalRef.current);
      speakingIntervalRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    isSpeakingUtteranceRef.current = false;
    isProcessingRef.current = false;
  }, []);

  // Safe restart of speech recognition
  const restartRecognitionSafe = useCallback(() => {
    if (!isOpen || isMuted || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already running or starting
    }
  }, [isOpen, isMuted]);

  // Dual-Engine Spoken Voice Function (Google Neural TTS Stream with Web Speech fallback)
  const speakText = useCallback((textToSpeak, onComplete) => {
    stopAllAudioAudioOnly();

    const cleanText = textToSpeak
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/[*#_`~[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      setVoiceState('listening');
      if (onComplete) onComplete();
      return;
    }

    const { langCode, shortCode } = detectScriptLanguage(cleanText);
    const sentenceChunks = splitIntoSpokenSentences(cleanText);

    isSpeakingUtteranceRef.current = true;
    setVoiceState('speaking');

    // Animate audio orb wave pulsation during speech
    if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
    speakingIntervalRef.current = setInterval(() => {
      setAudioVolume(0.45 + Math.random() * 0.45);
    }, 100);

    let currentChunkIdx = 0;

    const playNextChunk = () => {
      if (currentChunkIdx >= sentenceChunks.length || !isSpeakingUtteranceRef.current) {
        // Finished speaking
        isSpeakingUtteranceRef.current = false;
        if (speakingIntervalRef.current) {
          clearInterval(speakingIntervalRef.current);
          speakingIntervalRef.current = null;
        }
        setAudioVolume(0);
        setVoiceState('listening');

        if (isOpen && !isMuted) {
          setTimeout(() => {
            restartRecognitionSafe();
          }, 350);
        }

        if (onComplete) onComplete();
        return;
      }

      const chunkText = sentenceChunks[currentChunkIdx];
      currentChunkIdx++;

      // 1. Try Google High-Fidelity Neural Audio Stream (100% native pronunciation)
      const encoded = encodeURIComponent(chunkText.slice(0, 190));
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${shortCode}&q=${encoded}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        playNextChunk();
      };

      audio.onerror = () => {
        // 2. Fallback to Web Speech Synthesis API
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();

            const utterance = new SpeechSynthesisUtterance(chunkText);
            utterance.volume = 1.0;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.lang = langCode;

            const voices = voicesListRef.current.length > 0 ? voicesListRef.current : window.speechSynthesis.getVoices();
            const matchedVoice = getBestVoiceForLanguage(langCode, voices);
            if (matchedVoice) utterance.voice = matchedVoice;

            utterance.onend = () => {
              playNextChunk();
            };

            utterance.onerror = () => {
              playNextChunk();
            };

            window.speechSynthesis.speak(utterance);
          } catch (e) {
            playNextChunk();
          }
        } else {
          playNextChunk();
        }
      };

      audio.play().catch(() => {
        // Autoplay blocked fallback to speechSynthesis
        audio.onerror(new Event('error'));
      });
    };

    playNextChunk();
  }, [isOpen, isMuted, restartRecognitionSafe]);

  const stopAllAudioAudioOnly = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (speakingIntervalRef.current) {
      clearInterval(speakingIntervalRef.current);
      speakingIntervalRef.current = null;
    }
  };

  // Process user speech via live AI call engine in ALL languages
  const processUserSpeech = useCallback(async (spokenText) => {
    const query = spokenText.trim();
    if (!query || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setVoiceState('thinking');
    setUserTranscript(query);
    setInterimTranscript('');

    stopAllAudioAudioOnly();

    let reply = "";

    try {
      const prompt = `You are OMNIRA AI in a real-time natural two-way voice phone call with the user.
User just said in audio: "${query}".

CRITICAL VOICE INSTRUCTIONS:
1. LANGUAGE MATCHING: If the user speaks in Nepali, reply in natural, fluent Nepali. If in Hindi, reply in Hindi. If in Spanish, in Spanish. If in English, in English. Always match whatever language the user is speaking in, or whichever language they ask you to speak in!
2. PHONE CALL STYLE: Keep your response concise (1 to 3 sentences), highly articulate, warm, friendly, intelligent, and natural for human speech.
3. NO MARKDOWN: Never use markdown symbols (no asterisks, bolding, hashtags, bullet points, or code blocks) because your response is being read aloud directly to the user's ears.
4. COMPLETE ANSWER: Always directly answer what the user asked with 100% accuracy and clarity.`;

      const response = await queryQuickAi({
        prompt,
        history: callHistoryRef.current,
        selectedModel: selectedModel || 'gpt-4o',
        mode: 'chat',
        currentUser
      });

      reply = response?.content || response?.text || (typeof response === 'string' ? response : "");
      reply = reply
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/[*#_`~[\]]/g, '')
        .trim();
    } catch (err) {
      console.warn("Voice AI query error:", err);
    }

    if (!reply) {
      reply = `I heard you clearly. Let me answer that right away. What else would you like to explore?`;
    }

    // Save into conversational history for continuous memory
    callHistoryRef.current.push({ role: 'user', content: query });
    callHistoryRef.current.push({ role: 'assistant', content: reply });
    if (callHistoryRef.current.length > 12) {
      callHistoryRef.current = callHistoryRef.current.slice(-12);
    }

    setBotResponseText(reply);
    isProcessingRef.current = false;

    if (onVoiceMessageComplete) {
      onVoiceMessageComplete(query, reply);
    }

    speakText(reply);
  }, [currentUser, onVoiceMessageComplete, selectedModel, speakText]);

  const startAudioAnalyser = useCallback(async (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        if (!isSpeakingUtteranceRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(1, avg / 45);
          setAudioVolume(normalized);
        }

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn("Could not start audio analyser:", e);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMessage("Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (!micStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        startAudioAnalyser(stream);
      }
    } catch (err) {
      setErrorMessage("Microphone access was denied. Please allow microphone permissions in your browser.");
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceLang || 'en-US';

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      const activeSpeech = (finalStr || interimStr).trim();

      // Barge-in: If user starts speaking while AI is talking, interrupt AI immediately
      if (activeSpeech.length > 2 && isSpeakingUtteranceRef.current) {
        stopAllAudioAudioOnly();
        isSpeakingUtteranceRef.current = false;
        setVoiceState('listening');
      }

      if (interimStr) {
        setInterimTranscript(interimStr);
        pendingSpeechRef.current = interimStr;
        setVoiceState('listening');

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (pendingSpeechRef.current.trim().length > 1 && !isProcessingRef.current) {
            const speechToProcess = pendingSpeechRef.current.trim();
            pendingSpeechRef.current = '';
            processUserSpeech(speechToProcess);
          }
        }, 900);
      }

      if (finalStr.trim()) {
        const currentSentence = finalStr.trim();
        setUserTranscript(currentSentence);
        setInterimTranscript('');
        pendingSpeechRef.current = '';

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        processUserSpeech(currentSentence);
      }
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition notice:", e.error);
      if (e.error === 'not-allowed') {
        setErrorMessage("Microphone permission blocked. Please enable microphone access in browser settings.");
      }
    };

    recognition.onend = () => {
      if (isOpen && !isMuted && !isSpeakingUtteranceRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setVoiceState('listening');
    } catch (e) {
      console.warn("Recognition start notice:", e);
    }
  }, [isOpen, isMuted, processUserSpeech, startAudioAnalyser, voiceLang]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setBotResponseText('');
      setUserTranscript('');
      setInterimTranscript('');
      setIsMuted(false);
      startListening();
    } else {
      stopAllAudio();
    }

    return () => {
      stopAllAudio();
    };
  }, [isOpen, startListening, stopAllAudio]);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      stopAllAudioAudioOnly();
      setVoiceState('muted');
      setAudioVolume(0);
    }
  };

  const handleLanguageChange = (newLang) => {
    setVoiceLang(newLang);
    try {
      localStorage.setItem('omnira_voice_lang', newLang);
    } catch (e) {}

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setTimeout(() => {
      if (isOpen && !isMuted) {
        startListening();
      }
    }, 200);
  };

  if (!isOpen) return null;

  // Dynamic Orb Scale & Morphing based on Real Audio Amplitude
  const orbScale = 1 + audioVolume * 0.45;
  const outerGlowScale = 1 + audioVolume * 0.75;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-8 bg-white dark:bg-[#0d0d0d] text-neutral-900 dark:text-white select-none animate-in fade-in duration-300 font-sans overflow-hidden"
    >
      {/* Wave keyframe styles */}
      <style>{`
        @keyframes liquidWaveA {
          0% { transform: translate(-8%, 10%) rotate(0deg) scale(1.05); }
          50% { transform: translate(6%, -6%) rotate(180deg) scale(1.25); }
          100% { transform: translate(-8%, 10%) rotate(360deg) scale(1.05); }
        }
        @keyframes liquidWaveB {
          0% { transform: translate(10%, -8%) rotate(360deg) scale(1.2); }
          50% { transform: translate(-6%, 8%) rotate(180deg) scale(1.05); }
          100% { transform: translate(10%, -8%) rotate(0deg) scale(1.2); }
        }
        @keyframes liquidWaveC {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .liquid-wave-a {
          animation: liquidWaveA 7s ease-in-out infinite;
        }
        .liquid-wave-b {
          animation: liquidWaveB 10s ease-in-out infinite;
        }
        .liquid-wave-c {
          animation: liquidWaveC 6s ease-in-out infinite;
        }
      `}</style>

      {/* Background Soft Aura */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400/10 dark:from-sky-500/10 via-transparent to-transparent pointer-events-none transition-all duration-700"
        style={{
          opacity: voiceState === 'listening' ? 0.9 : voiceState === 'speaking' ? 1 : 0.4
        }}
      />

      {/* Top Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10 px-1 sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-base sm:text-lg tracking-tight text-neutral-800 dark:text-neutral-100">
            OMNIRA Voice
          </span>
          <span className="text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2.5 py-0.5 rounded-full font-medium capitalize">
            {voiceState}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multilingual Speech Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700/80 text-xs shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <select
              value={voiceLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer pr-1 max-w-[120px] sm:max-w-none truncate"
              title="Select speech language"
            >
              <option value="en-US" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">English (US)</option>
              <option value="ne-NP" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">नेपाली (Nepali)</option>
              <option value="hi-IN" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">हिन्दी (Hindi)</option>
              <option value="es-ES" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Español (Spanish)</option>
              <option value="fr-FR" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Français (French)</option>
              <option value="de-DE" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Deutsch (German)</option>
              <option value="zh-CN" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">中文 (Chinese)</option>
              <option value="ja-JP" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">日本語 (Japanese)</option>
              <option value="ar-SA" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">العربية (Arabic)</option>
              <option value="pt-BR" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Português (Portuguese)</option>
              <option value="ru-RU" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Русский (Russian)</option>
            </select>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close voice chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Area: Living Water Orb + Live Multilingual Subtitles */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-xl z-10 my-auto px-4 text-center">
        
        {/* Soft Background Radial Light */}
        <div 
          className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-sky-400/30 via-blue-500/20 to-transparent blur-3xl pointer-events-none transition-transform duration-200"
          style={{ transform: `scale(${outerGlowScale})` }}
        />

        {/* Realistic Flowing Liquid Water Sphere */}
        <div 
          className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full shadow-[0_20px_50px_rgba(14,165,233,0.3)] dark:shadow-[0_20px_60px_rgba(2,132,199,0.25)] overflow-hidden border border-white/80 dark:border-white/20 flex items-center justify-center transition-transform duration-100 bg-[#cbe9fe]"
          style={{ transform: `scale(${orbScale})` }}
        >
          {/* Base Ambient Water Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#38bdf8] opacity-90" />
          
          {/* Flowing Organic Liquid Blobs */}
          <div className="absolute -inset-4 rounded-[42%] bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-transparent opacity-85 liquid-wave-a blur-xs" />
          <div className="absolute -inset-4 rounded-[38%] bg-gradient-to-bl from-[#0369a1] via-[#0ea5e9] to-[#7dd3fc] opacity-80 liquid-wave-b blur-xs" />
          <div className="absolute -inset-2 rounded-[46%] bg-gradient-to-r from-[#38bdf8]/60 via-[#bae6fd]/40 to-transparent opacity-75 liquid-wave-c" />

          {/* Top Glass Caustic Reflections */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
          <div className="absolute top-3 left-6 w-16 h-8 rounded-full bg-white/75 blur-xs rotate-[-25deg] pointer-events-none" />
          <div className="absolute bottom-4 right-6 w-12 h-6 rounded-full bg-sky-200/50 blur-xs rotate-[15deg] pointer-events-none" />
        </div>

        {/* Live Conversation Subtitles */}
        <div className="mt-8 min-h-[70px] w-full flex flex-col items-center justify-center px-4">
          {voiceState === 'listening' && (
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-medium animate-in fade-in max-w-md">
              {interimTranscript ? (
                <span>&ldquo;{interimTranscript}&rdquo;</span>
              ) : userTranscript ? (
                <span>&ldquo;{userTranscript}&rdquo;</span>
              ) : (
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">Listening... speak in any language</span>
              )}
            </p>
          )}

          {voiceState === 'thinking' && (
            <div className="flex items-center gap-2 text-sm sm:text-base text-sky-600 dark:text-sky-400 font-semibold animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-current" />
              <span>Thinking & processing answer...</span>
            </div>
          )}

          {voiceState === 'speaking' && botResponseText && (
            <div className="space-y-1 animate-in fade-in">
              <div className="flex items-center justify-center gap-1.5 text-xs text-sky-500 font-semibold">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Speaking</span>
              </div>
              <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-100 font-medium max-w-lg leading-relaxed">
                &ldquo;{botResponseText}&rdquo;
              </p>
            </div>
          )}

          {voiceState === 'muted' && (
            <p className="text-sm text-amber-500 font-medium">Microphone is muted</p>
          )}

          {errorMessage && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full max-w-sm flex items-center justify-center gap-6 z-10 pb-4">
        {/* Switch to Type / Text Chat */}
        <button
          onClick={onOpenTypeChat}
          className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
          title="Switch to keyboard typing"
          aria-label="Switch to keyboard typing"
        >
          <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
          </svg>
        </button>

        {/* Central Mute / Unmute Microphone Button */}
        <button
          onClick={toggleMute}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black'
          }`}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        {/* Close Voice Call */}
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
          title="End voice session"
          aria-label="End voice session"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
