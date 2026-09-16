import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function ImageGenerationMessage({ message, onRegenerate, onImageLoaded }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(14);

  const { prompt = '', imageUrl = '', error = null, isLoading = false, timestamp } = message;

  // Live Percentage Progress Counter during Image Creation - smooth and deliberate
  useEffect(() => {
    if (isLoading) {
      setProgressPercent(8);
      const interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 94) return 94;
          const inc = Math.floor(Math.random() * 4) + 2;
          return Math.min(94, prev + inc);
        });
      }, 240);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const getStageText = () => {
    if (progressPercent < 28) return 'Analyzing composition & structure...';
    if (progressPercent < 58) return 'Computing high-precision vector contours...';
    if (progressPercent < 82) return 'Rendering sharp typography & micro-details...';
    return 'Polishing master resolution...';
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      setIsDownloading(true);
      const filename = `omnira-image-${Date.now()}.png`;

      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-xl my-2">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm transition-all hover:shadow-md">
        
        {/* Header Badge */}
        <div className="px-4 py-2.5 border-b border-[var(--border-color)] bg-[var(--bg-hover)]/40 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>OMNIRA AI Image Generator</span>
          </div>
          {timestamp && <span className="text-[10px] opacity-70">{timestamp}</span>}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          
          {isLoading ? (
            /* Live Dotted Matrix Wave Loading Container - adapts cleanly to Light & Dark themes */
            <div className="relative w-full aspect-square max-h-[420px] rounded-2xl bg-neutral-100 dark:bg-[#090b10] p-5 sm:p-6 flex flex-col justify-between border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
              
              {/* Header Row: Status + Percentage Badge (never clipped or cut off) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm sm:text-base tracking-tight">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  <span>Creating image</span>
                </div>

                {/* Progress Percentage Badge */}
                <div className="px-3 py-1 rounded-full bg-neutral-200/90 dark:bg-white/10 border border-neutral-300/80 dark:border-white/20 text-neutral-800 dark:text-white font-bold text-xs tracking-wide shadow-2xs">
                  {progressPercent}%
                </div>
              </div>

              {/* Dotted Wave Matrix Grid */}
              <div className="my-auto grid grid-cols-[repeat(16,minmax(0,1fr))] gap-2 sm:gap-2.5 justify-center items-center opacity-85 px-2">
                {Array.from({ length: 256 }).map((_, i) => {
                  const row = Math.floor(i / 16);
                  const col = i % 16;
                  const delay = ((row + col) % 8) * 120;
                  return (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse transition-opacity"
                      style={{
                        animationDelay: `${delay}ms`,
                        animationDuration: '1.4s',
                        opacity: (i * 7) % 100 > 30 ? 0.85 : 0.35
                      }}
                    />
                  );
                })}
              </div>

              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 text-center font-medium">
                {getStageText()}
              </div>

            </div>
          ) : error ? (
            /* Error State */
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Generation Failed</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          ) : (
            /* Completed Image Display */
            <>
              {/* Image Preview Container */}
              <div className="relative group overflow-hidden rounded-xl bg-neutral-900/5 dark:bg-neutral-950/40 border border-[var(--border-color)]/60">
                <img
                  src={imageUrl}
                  alt={prompt || 'OMNIRA Generated Image'}
                  className="w-full h-auto max-h-[500px] object-contain block transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="eager"
                  onLoad={() => {
                    setTimeout(() => {
                      onImageLoaded?.();
                    }, 50);
                  }}
                />
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                
                <div className="flex items-center gap-2">
                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shadow-2xs font-medium"
                    title="Download high-resolution image"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isDownloading ? 'Saving...' : 'Download'}</span>
                  </button>

                  {/* Regenerate Button */}
                  {onRegenerate && (
                    <button
                      type="button"
                      onClick={() => onRegenerate(prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shadow-2xs font-medium"
                      title="Regenerate image (uses 1 daily quota)"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>

                {/* Copy Prompt Button */}
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  title="Copy image prompt"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy prompt</span>
                    </>
                  )}
                </button>

              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
