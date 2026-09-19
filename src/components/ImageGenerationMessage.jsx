import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function ImageGenerationMessage({ message, onRegenerate, onImageLoaded }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(12);

  const { prompt = '', imageUrl = '', error = null, isLoading = false, timestamp } = message;

  // Live Fluid Progress Counter - continuously active, never freezes on 94%
  useEffect(() => {
    if (isLoading) {
      setProgressPercent(12);
      const interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 50) {
            // Initial fast start
            return prev + Math.floor(Math.random() * 4) + 3;
          } else if (prev < 80) {
            // Steady neural synthesis
            return prev + Math.floor(Math.random() * 3) + 2;
          } else if (prev < 93) {
            // Detailed refinement
            return prev + 1;
          } else if (prev < 98) {
            // High-resolution polishing (continues ticking, never stuck!)
            return prev + 1;
          } else if (prev === 98) {
            return 99;
          }
          return 99;
        });
      }, 320);
      return () => clearInterval(interval);
    } else if (imageUrl) {
      setProgressPercent(100);
    }
  }, [isLoading, imageUrl]);

  const getStageText = () => {
    if (progressPercent < 30) return 'Analyzing prompt composition & contours...';
    if (progressPercent < 60) return 'Computing high-precision neural vectors...';
    if (progressPercent < 85) return 'Rendering sharp typography & textures...';
    if (progressPercent < 96) return 'Polishing master resolution...';
    return 'Finalizing image synthesis...';
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

  if (isLoading) {
    return (
      <div className="w-full max-w-xl my-2">
        {/* Live Preview Card while creating image */}
        <div className="relative w-full aspect-square max-h-[420px] rounded-2xl bg-neutral-100 dark:bg-[#0b0d13] p-5 sm:p-6 flex flex-col justify-between border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
          
          {/* Header Row: Status + Percentage Badge (No Gemini sparkles) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm sm:text-base tracking-tight">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Creating image...</span>
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

          {/* Dynamic detailed generation text */}
          <div className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 text-center font-medium space-y-0.5">
            <div>{getStageText()}</div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500">FLUX.1 Schnell Neural Latent Diffusion</div>
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-xl my-2">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">Generation Failed</p>
            <p className="opacity-90">{error}</p>
            {onRegenerate && (
              <button
                type="button"
                onClick={() => onRegenerate(prompt)}
                className="mt-2 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-300 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl my-2 space-y-2.5">
      {/* Clean Frameless Image directly in chat flow - without card wrapper, header bar, or spark icons */}
      <div className="relative group overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-neutral-100 dark:bg-neutral-900 border border-[var(--border-color)]/60">
        <img
          src={imageUrl}
          alt={prompt || 'OMNIRA Generated Image'}
          className="w-full h-auto max-h-[620px] object-contain rounded-2xl block select-none"
          loading="eager"
          onLoad={() => {
            setTimeout(() => {
              onImageLoaded?.();
            }, 50);
          }}
        />
      </div>

      {/* Clean Minimalist Actions below the image */}
      <div className="flex items-center justify-between px-1 text-xs text-[var(--text-muted)]">
        
        <div className="flex items-center gap-2">
          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors shadow-2xs font-medium cursor-pointer"
            title="Download high-resolution image"
          >
            <Download className="w-3.5 h-3.5 text-black dark:text-white" />
            <span>{isDownloading ? 'Saving...' : 'Download'}</span>
          </button>

          {/* Regenerate Button */}
          {onRegenerate && (
            <button
              type="button"
              onClick={() => onRegenerate(prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors shadow-2xs font-medium cursor-pointer"
              title="Regenerate image"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>Regenerate</span>
            </button>
          )}
        </div>

        {/* Copy Prompt Button */}
        <button
          type="button"
          onClick={handleCopyPrompt}
          className="flex items-center gap-1 px-2.5 py-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title="Copy image prompt"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-black dark:text-white" />
              <span className="text-black dark:text-white font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy prompt</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
