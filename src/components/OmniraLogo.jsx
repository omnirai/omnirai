import React from 'react';

/**
 * Official OMNIRA AI Icon Emblem
 * Crisp 3D vector emblem with glowing gradient core, orbital ring & specular highlight.
 * Always vibrant, high-contrast and crystal-clear in both Light and Dark themes.
 */
export function OmniraIcon({ className = "w-8 h-8", filterId = "omnira-icon-grad" }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg 
        viewBox="0 0 36 36" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`${filterId}-core`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="45%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id={`${filterId}-ring`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <radialGradient id={`${filterId}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow Aura */}
        <circle cx="18" cy="18" r="17" fill={`url(#${filterId}-glow)`} />

        {/* Back Half of Orbital Ring */}
        <path 
          d="M 6 15 C 6 10, 30 10, 30 15" 
          transform="rotate(-26 18 18)" 
          stroke={`url(#${filterId}-ring)`} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeDasharray="1 2.5"
          className="opacity-70"
        />

        {/* Outer Orbit Path */}
        <ellipse 
          cx="18" 
          cy="18" 
          rx="15" 
          ry="6.8" 
          transform="rotate(-26 18 18)" 
          stroke={`url(#${filterId}-ring)`} 
          strokeWidth="2.4" 
          strokeLinecap="round" 
        />

        {/* Planetary Core Sphere */}
        <circle 
          cx="18" 
          cy="18" 
          r="9.5" 
          fill={`url(#${filterId}-core)`} 
          className="drop-shadow-md"
        />

        {/* Front Half of Orbital Ring (overlapping core for 3D realism) */}
        <path 
          d="M 4.5 21 C 7 26.5, 29 26.5, 31.5 21" 
          transform="rotate(-26 18 18)" 
          stroke="#ffffff" 
          strokeWidth="1.6" 
          strokeLinecap="round" 
          strokeOpacity="0.85"
        />

        {/* Specular Light Glow Highlight */}
        <circle 
          cx="15" 
          cy="14.5" 
          r="3" 
          fill="#ffffff" 
          fillOpacity="0.8" 
        />
        <circle 
          cx="16.5" 
          cy="16" 
          r="1" 
          fill="#ffffff" 
          fillOpacity="0.95" 
        />
      </svg>
    </div>
  );
}

/**
 * Official OMNIRA AI Full Logo (Icon + Text)
 * High-contrast monochrome & gradient branding visible in both light & dark mode
 */
export function OmniraLogo({ 
  className = "h-8", 
  iconSize = "w-7 h-7", 
  showText = true, 
  textClassName = "text-lg font-black tracking-tight"
}) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <OmniraIcon className={iconSize} filterId="omnira-logo-head" />
      {showText && (
        <div className={`font-sans tracking-tight font-black flex items-center ${textClassName}`}>
          <span className="text-black dark:text-white font-extrabold tracking-tight">OMNIRA</span>
          <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-[10px] tracking-wider uppercase border border-violet-500/20">
            AI
          </span>
        </div>
      )}
    </div>
  );
}

export default OmniraLogo;
