import React from 'react';

/**
 * Official OMNIRA AI Icon Emblem
 * Uses the exact recolored SVG logo created in /public/omnira_ai.svg
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
 * High-contrast monochrome black & white branding visible in both light & dark mode
 */
export function OmniraLogo({ 
  className = "h-8", 
  iconSize = "w-8 h-8", 
  showText = true, 
  textClassName = "text-xl font-black tracking-tight"
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <OmniraIcon className={iconSize} />
      {showText && (
        <span className={`font-sans tracking-tight font-black ${textClassName}`}>
          <span className="text-black dark:text-white">OMNIRA</span>
          <span className="ml-1 text-neutral-500 dark:text-neutral-400 font-bold text-sm tracking-wider">AI</span>
        </span>
      )}
    </div>
  );
}

export default OmniraLogo;
