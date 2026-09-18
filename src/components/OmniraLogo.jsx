import React from 'react';

/**
 * Official OMNIRA AI Icon Emblem
 * Uses the exact SVG logo created in /public/omnira_ai.svg
 */
export function OmniraIcon({ className = "w-8 h-8" }) {
  return (
    <img 
      src="/omnira_ai.svg" 
      alt="OMNIRA AI Logo" 
      className={`object-contain shrink-0 ${className}`} 
    />
  );
}

/**
 * Official OMNIRA AI Full Logo (Icon + Text)
 */
export function OmniraLogo({ 
  className = "h-8", 
  iconSize = "w-8 h-8", 
  showText = true, 
  textClassName = "text-xl font-extrabold tracking-tight"
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <OmniraIcon className={iconSize} />
      {showText && (
        <span className={`font-sans tracking-tight font-black ${textClassName}`}>
          <span className="text-slate-900 dark:text-white">OMNIRA </span>
          <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            AI
          </span>
        </span>
      )}
    </div>
  );
}

export default OmniraLogo;
