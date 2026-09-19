import React from 'react';

/**
 * Official OMNIRA AI Icon Emblem
 * Directly loads the official brand logo asset from the /public folder (/omnira_ai.png / /omnira_ai.svg).
 */
export function OmniraIcon({ className = "w-8 h-8", alt = "OMNIRA AI" }) {
  return (
    <img 
      src="/omnira_ai.png" 
      alt={alt} 
      className={`object-contain shrink-0 select-none ${className}`} 
      onError={(e) => {
        // Fallback to SVG asset in /public folder
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/omnira_ai.svg";
      }}
    />
  );
}

/**
 * Official OMNIRA AI Full Logo (Icon + Text)
 * Uses the official public folder logo asset along with high-contrast text.
 */
export function OmniraLogo({ 
  className = "h-8", 
  iconSize = "w-7 h-7", 
  showText = true, 
  textClassName = "text-lg font-black tracking-tight"
}) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <OmniraIcon className={iconSize} />
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
