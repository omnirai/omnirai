import React from 'react';

/**
 * Official OMNIRA AI Planetary Ring Emblem
 * Uses the authentic cropped OMNIRA AI brand emblem directly from the official artwork.
 * High-definition, tightly cropped to zero margins.
 * Light mode: Official dark emblem (/omnira_emblem.png)
 * Dark mode: Crisp bright white emblem (/omnira_emblem_white.png)
 */
export function OmniraIcon({ className = "w-7 h-7", alt = "OMNIRA AI" }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      {/* Light mode: Official dark/black OMNIRA planetary emblem */}
      <img
        src="/omnira_emblem.png"
        alt={alt}
        className="w-full h-full object-contain block dark:hidden select-none"
        draggable={false}
      />
      {/* Dark mode: Crisp bright white OMNIRA planetary emblem */}
      <img
        src="/omnira_emblem_white.png"
        alt={alt}
        className="w-full h-full object-contain hidden dark:block select-none"
        draggable={false}
      />
    </div>
  );
}

/**
 * Official OMNIRA AI Full Logo (Icon + Text)
 * Uses high-contrast typography and authentic brand emblem.
 */
export function OmniraLogo({ 
  className = "h-7", 
  iconSize = "w-7 h-7", 
  showText = true, 
  textClassName = "text-[16px] font-bold tracking-tight"
}) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <OmniraIcon className={iconSize} />
      {showText && (
        <div className={`font-sans tracking-tight flex items-center ${textClassName}`}>
          <span className="text-black dark:text-white font-bold tracking-tight">OMNIRA</span>
          <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-neutral-150 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-[10px] tracking-wider uppercase border border-neutral-200 dark:border-neutral-700">
            AI
          </span>
        </div>
      )}
    </div>
  );
}

export default OmniraLogo;
