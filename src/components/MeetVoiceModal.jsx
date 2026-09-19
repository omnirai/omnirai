import React from 'react';
import { X, Info } from 'lucide-react';

export default function MeetVoiceModal({ isOpen, onClose, onContinue }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Wave keyframe styles */}
      <style>{`
        @keyframes waterFlow1 {
          0% { transform: translate(-10%, 15%) rotate(0deg) scale(1.1); }
          50% { transform: translate(5%, -5%) rotate(180deg) scale(1.3); }
          100% { transform: translate(-10%, 15%) rotate(360deg) scale(1.1); }
        }
        @keyframes waterFlow2 {
          0% { transform: translate(15%, -10%) rotate(360deg) scale(1.2); }
          50% { transform: translate(-5%, 10%) rotate(180deg) scale(1.05); }
          100% { transform: translate(15%, -10%) rotate(0deg) scale(1.2); }
        }
        .water-wave-1 {
          animation: waterFlow1 8s ease-in-out infinite;
        }
        .water-wave-2 {
          animation: waterFlow2 11s ease-in-out infinite;
        }
      `}</style>

      <div 
        className="relative w-full max-w-[370px] bg-white dark:bg-neutral-900 rounded-[28px] shadow-2xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 text-neutral-900 dark:text-white flex flex-col items-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Soft Glowing Animated Liquid Water Orb Header */}
        <div className="relative mt-2 mb-4 w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400/40 via-blue-500/25 to-transparent blur-xl animate-pulse" />
          
          <div className="relative w-20 h-20 rounded-full shadow-lg overflow-hidden border border-white/80 dark:border-white/20 flex items-center justify-center bg-[#cbe9fe]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#38bdf8] opacity-90" />
            <div className="absolute -inset-2 rounded-[42%] bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-transparent opacity-75 water-wave-1 blur-xs" />
            <div className="absolute -inset-2 rounded-[38%] bg-gradient-to-bl from-[#0369a1] via-[#0ea5e9] to-[#7dd3fc] opacity-80 water-wave-2 blur-xs" />
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
            <div className="absolute top-2 left-4 w-8 h-4 rounded-full bg-white/75 blur-xs rotate-[-22deg] pointer-events-none" />
          </div>
        </div>

        {/* Modal Title */}
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mb-5">
          Meet Voice
        </h2>

        {/* Explanatory Bullet Points */}
        <div className="w-full space-y-4 text-left text-xs text-neutral-600 dark:text-neutral-300 font-medium px-1">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <rect x="5" y="8" width="2.5" height="8" rx="1.25" />
                <rect x="10.75" y="4" width="2.5" height="16" rx="1.25" />
                <rect x="16.5" y="7" width="2.5" height="10" rx="1.25" />
              </svg>
            </div>
            <p className="leading-relaxed">
              Say what&apos;s on your mind. AI listens, responds, and keeps the conversation flowing naturally.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <p className="leading-relaxed">
              Audio recordings are saved, and you can delete them at any time.{' '}
              <a 
                href="#privacy" 
                onClick={(e) => { e.preventDefault(); alert("Voice sessions are processed securely using private speech recognition and neural synthesis."); }} 
                className="underline hover:text-neutral-900 dark:hover:text-white font-semibold"
              >
                Learn more.
              </a>
            </p>
          </div>
        </div>

        {/* Continue Action Button */}
        <button
          onClick={onContinue}
          className="w-full mt-6 py-3 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-semibold text-xs rounded-full transition-all shadow-md active:scale-98 flex items-center justify-center cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
