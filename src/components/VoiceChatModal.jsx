import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff, Plus, AlertCircle } from 'lucide-react';
import { queryQuickAi } from '../engine/quickAiEngine';

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

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const speakingIntervalRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isSpeakingUtteranceRef = useRef(false);
  const voicesListRef = useRef([]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        voicesListRef.current = window.speechSynthesis.getVoices();
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
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
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
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    isSpeakingUtteranceRef.current = false;
  }, []);

  // Text-to-Speech Speak function (speaks out loud with realistic tone)
  const speakText = useCallback((textToSpeak, onComplete) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceState('listening');
      if (onComplete) onComplete();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const cleanText = textToSpeak
        .replace(/[*#_`~[\]()]/g, ' ')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        setVoiceState('listening');
        if (onComplete) onComplete();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select natural English voice
      const voices = voicesListRef.current.length > 0 ? voicesListRef.current : window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen') || v.lang.startsWith('en')) &&
        !v.name.includes('whisper')
      ) || voices[0];
      
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.rate = 1.05;
      utterance.pitch = 1.02;

      // Stop recognition while AI is speaking
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      // Animate orb pulsation during speech
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
      speakingIntervalRef.current = setInterval(() => {
        setAudioVolume(0.35 + Math.random() * 0.45);
      }, 120);

      utterance.onstart = () => {
        isSpeakingUtteranceRef.current = true;
        setVoiceState('speaking');
      };

      const handleSpeechDone = () => {
        isSpeakingUtteranceRef.current = false;
        if (speakingIntervalRef.current) {
          clearInterval(speakingIntervalRef.current);
          speakingIntervalRef.current = null;
        }
        setAudioVolume(0);
        setVoiceState('listening');

        // Restart recognition for user reply
        if (isOpen && !isMuted) {
          setTimeout(() => {
            if (recognitionRef.current) {
              try { recognitionRef.current.start(); } catch (e) {}
            }
          }, 300);
        }

        if (onComplete) onComplete();
      };

      utterance.onend = handleSpeechDone;
      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        handleSpeechDone();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      setVoiceState('listening');
      if (onComplete) onComplete();
    }
  }, [isMuted, isOpen]);

  // Process user speech via AI
  const processUserSpeech = useCallback(async (spokenText) => {
    if (!spokenText.trim()) {
      setVoiceState('listening');
      return;
    }

    setVoiceState('thinking');
    setUserTranscript(spokenText);
    setInterimTranscript('');

    let reply = "";

    try {
      const response = await queryQuickAi(
        `User is in real-time voice mode. User said: "${spokenText}".
Respond warmly, conversationally, and concisely in 1 to 3 natural sentences. Do NOT use markdown, code blocks, or bullet points.`,
        [],
        selectedModel,
        {
          engineMode: 'quick-local-neural',
          modelName: 'Xenova/Qwen1.5-0.5B-Chat',
          temperature: 0.7
        },
        null,
        'chat'
      );
      reply = response?.content || response?.text || "";
    } catch (err) {
      console.warn("Voice AI query error, using fallback voice:", err);
    }

    if (!reply) {
      reply = `I heard you say "${spokenText}". How can I help you with that?`;
    }

    setBotResponseText(reply);
    if (onVoiceMessageComplete) {
      onVoiceMessageComplete(spokenText, reply);
    }

    speakText(reply);
  }, [onVoiceMessageComplete, selectedModel, speakText]);

  const startAudioAnalyser = useCallback(async (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        if (isSpeakingUtteranceRef.current) return; // Speech synthesis takes over visual volume

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 70);
        setAudioVolume(normalized);

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
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      if (isSpeakingUtteranceRef.current) return;

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
        setInterimTranscript(interimStr);
        setVoiceState('listening');
      }

      if (finalStr.trim()) {
        const currentSentence = finalStr.trim();
        setUserTranscript(currentSentence);
        setInterimTranscript('');

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          processUserSpeech(currentSentence);
        }, 700);
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

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setVoiceState('listening');
    } catch (e) {}
  }, [isOpen, isMuted, processUserSpeech, startAudioAnalyser]);

  // Initial greeting and lifecycle
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setUserTranscript('');
      setInterimTranscript('');
      setBotResponseText('Hi! How can I help you today?');

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }

      startListening();

      const greetTimer = setTimeout(() => {
        speakText("Hi! What would you like to explore today?");
      }, 400);

      return () => {
        clearTimeout(greetTimer);
        stopAllAudio();
      };
    } else {
      stopAllAudio();
    }
  }, [isOpen, speakText, startListening, stopAllAudio]);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVoiceState('listening');
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    } else {
      setIsMuted(true);
      setVoiceState('muted');
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-300 select-none overflow-hidden">
      
      {/* Liquid Water Shader Animations */}
      <style>{`
        @keyframes liquidWaveA {
          0% { transform: translateY(0%) scaleY(1) rotate(0deg); }
          50% { transform: translateY(-12%) scaleY(1.18) rotate(180deg); }
          100% { transform: translateY(0%) scaleY(1) rotate(360deg); }
        }
        @keyframes liquidWaveB {
          0% { transform: translateY(-8%) scaleX(1.1) rotate(360deg); }
          50% { transform: translateY(6%) scaleX(0.95) rotate(180deg); }
          100% { transform: translateY(-8%) scaleX(1.1) rotate(0deg); }
        }
        @keyframes liquidWaveC {
          0% { transform: translate(-8%, -8%) rotate(0deg); }
          50% { transform: translate(8%, 8%) rotate(180deg); }
          100% { transform: translate(-8%, -8%) rotate(360deg); }
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
      <div className="w-full max-w-5xl flex items-center justify-between z-10 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base sm:text-lg tracking-tight text-neutral-800 dark:text-neutral-100">
            ChatGPT Voice
          </span>
          <span className="text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2.5 py-0.5 rounded-full font-medium">
            {voiceState}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Close voice mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="z-10 max-w-md bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:text-black dark:hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Center Stage: Mathematically Concentric Wave SVG & Liquid Watercolor Orb */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10 w-full max-w-xl">
        
        {/* Fixed 420x420 Concentric Container (Grid Centered - Zero Transform Drift) */}
        <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] grid place-items-center">

          {/* SVG Vector Concentric Wave Rings (Mathematically Anchored at cx=210, cy=210) */}
          <svg 
            viewBox="0 0 420 420" 
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          >
            {/* Outer Ring 3 */}
            <circle
              cx="210"
              cy="210"
              r={150 + audioVolume * 40}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeOpacity={voiceState === 'listening' || voiceState === 'speaking' ? "0.2" : "0.04"}
              className="transition-all duration-300"
            />

            {/* Middle Ring 2 */}
            <circle
              cx="210"
              cy="210"
              r={125 + audioVolume * 30}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              strokeOpacity={voiceState === 'listening' || voiceState === 'speaking' ? "0.35" : "0.08"}
              className="transition-all duration-200"
            />

            {/* Inner Ring 1 */}
            <circle
              cx="210"
              cy="210"
              r={105 + audioVolume * 20}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeOpacity={voiceState === 'listening' || voiceState === 'speaking' ? "0.6" : "0.15"}
              className="transition-all duration-150"
            />

            {/* Soft Ambient Radial Blur behind Orb */}
            <circle
              cx="210"
              cy="210"
              r={95 + audioVolume * 15}
              fill="url(#ambientGlow)"
              opacity={voiceState === 'speaking' ? "0.7" : "0.5"}
            />

            <defs>
              <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          {/* The Liquid Water Watercolor Orb (matching User Reference 2) */}
          <div 
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full shadow-2xl overflow-hidden border border-white/90 dark:border-white/20 transition-transform duration-300 flex items-center justify-center z-10"
            style={{
              transform: `scale(${1 + (voiceState === 'listening' || voiceState === 'speaking' ? audioVolume * 0.15 : 0)})`,
              boxShadow: '0 16px 45px -10px rgba(14, 165, 233, 0.45), 0 0 25px 2px rgba(255, 255, 255, 0.7) inset',
              background: '#e0f2fe'
            }}
          >
            {/* Base Sky Water Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#f0f9ff] via-[#bae6fd] to-[#0284c7]" />

            {/* Wave 1: Deep Aqua Liquid Flow */}
            <div 
              className="absolute -inset-10 rounded-[44%] bg-gradient-to-tr from-[#0284c7] via-[#0ea5e9] to-transparent opacity-85 liquid-wave-a blur-xs"
            />

            {/* Wave 2: Vibrant Cyan Water Cloud */}
            <div 
              className="absolute -inset-10 rounded-[40%] bg-gradient-to-bl from-[#0369a1] via-[#38bdf8] to-[#e0f2fe] opacity-80 liquid-wave-b blur-xs"
            />

            {/* Wave 3: Soft White Vapor Foam */}
            <div 
              className="absolute -inset-10 rounded-[46%] bg-gradient-to-r from-white via-[#e0f2fe] to-transparent opacity-90 liquid-wave-c blur-xs"
            />

            {/* Frosted Water Glass Refraction & Gloss */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-8 w-16 h-8 rounded-full bg-white/80 blur-xs rotate-[-24deg] pointer-events-none" />

            {/* Center Dynamic Audio Visualizer Dots */}
            <div className="relative z-20 flex items-center gap-1.5 opacity-95">
              {[0.4, 0.8, 1, 0.8, 0.4].map((mult, idx) => (
                <span
                  key={idx}
                  className="w-1.5 bg-white rounded-full transition-all duration-75 shadow-xs"
                  style={{
                    height: voiceState === 'speaking' || voiceState === 'listening'
                      ? `${Math.max(6, (audioVolume * 36 + 10) * mult)}px`
                      : '6px',
                    opacity: voiceState === 'muted' ? 0.3 : 0.95
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Live Subtitle / State Caption */}
        <div className="mt-6 text-center max-w-md px-4 min-h-[48px] flex flex-col items-center justify-center">
          {interimTranscript ? (
            <p className="text-sm sm:text-base font-medium text-sky-600 dark:text-sky-300 animate-pulse italic">
              &ldquo;{interimTranscript}&rdquo;
            </p>
          ) : userTranscript && voiceState === 'thinking' ? (
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              &ldquo;{userTranscript}&rdquo;
            </p>
          ) : voiceState === 'speaking' ? (
            <p className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 line-clamp-3 leading-relaxed">
              {botResponseText}
            </p>
          ) : voiceState === 'muted' ? (
            <p className="text-xs font-medium text-red-500">
              Microphone is paused. Click mic to unmute.
            </p>
          ) : (
            <p className="text-xs sm:text-sm font-medium text-neutral-400 dark:text-neutral-500">
              Say what&apos;s on your mind...
            </p>
          )}
        </div>
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="z-10 w-full flex justify-center pb-3 sm:pb-6">
        <div className="bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-full px-5 py-2.5 flex items-center gap-5 shadow-xl">
          {/* Type / Text Mode Button */}
          <button
            onClick={() => {
              onClose();
              onOpenTypeChat?.();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="Switch to typing"
          >
            <Plus className="w-4 h-4" />
            <span>Type</span>
          </button>

          {/* Microphone Mute / Unmute Button */}
          <button
            onClick={toggleMute}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer ${
              isMuted
                ? 'bg-red-500/20 border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-500/30'
                : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white'
            }`}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            title={isMuted ? "Unmute mic" : "Mute mic"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End / Close Voice Session Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="End voice session"
            title="End session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
