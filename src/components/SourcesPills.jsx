import React from 'react';
import { Globe, ArrowRight, ExternalLink } from 'lucide-react';

export default function SourcesPills({ sources = [], suggestions = [], onSelectSuggestion }) {
  if ((!sources || sources.length === 0) && (!suggestions || suggestions.length === 0)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2.5 mt-2.5 mb-1 w-full select-none">
      {/* Real Website Sources row */}
      {sources && sources.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 pt-1">
          {sources.map((src, i) => {
            const domain = src.domain || (src.url ? new URL(src.url).hostname.replace('www.', '') : 'source');
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

            return (
              <a
                key={i}
                href={src.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700/80 text-xs text-neutral-700 dark:text-neutral-300 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                title={src.title || domain}
              >
                <img 
                  src={faviconUrl} 
                  alt="" 
                  className="w-3.5 h-3.5 rounded-full shrink-0 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="font-medium text-[11px] truncate max-w-[140px] sm:max-w-[180px]">
                  {domain}
                </span>
                {i === 0 && sources.length > 1 && (
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium ml-0.5">
                    +{sources.length - 1}
                  </span>
                )}
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
              </a>
            );
          })}
        </div>
      )}

      {/* Action Chips: ↳ the weather right now, ↳ tonight, etc. */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-700 dark:text-neutral-300">
          <span className="text-neutral-500 dark:text-neutral-400">If you want, I can also check</span>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion?.(sug)}
              className="inline-flex items-center gap-1 text-neutral-900 dark:text-neutral-100 font-medium underline underline-offset-3 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
            >
              <span>↳</span>
              <span>{sug}</span>
              {idx < suggestions.length - 1 && <span className="text-neutral-400 no-underline mr-1">,</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
