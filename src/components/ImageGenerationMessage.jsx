import React, { useState } from 'react';
import { Download, RefreshCw, Copy, Check, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function ImageGenerationMessage({ message, onRegenerate }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { prompt = '', imageUrl = '', error = null, isLoading = false, timestamp } = message;

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

      // Handle Data URI or Remote HTTP URL download
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
            /* Live ChatGPT / Gemini In-Thread Image Preview Loading Skeleton */
            <div className="space-y-3">
              <div className="relative w-full aspect-square max-h-[400px] rounded-xl overflow-hidden border border-[var(--border-color)]/60 bg-gradient-to-br from-emerald-500/10 via-sky-500/15 to-emerald-500/10 animate-pulse flex flex-col items-center justify-center p-6 text-center shadow-inner">
                
                {/* Center Loading Spinner & Icon */}
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 animate-ping absolute inset-0"></div>
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center relative shadow-md">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                </div>

                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  Creating your image...
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-xs">
                  Rendering high-resolution artwork via Cloudflare Workers AI
                </p>
              </div>

              {prompt && (
                <div className="text-xs text-[var(--text-primary)] font-normal italic bg-[var(--bg-hover)]/30 p-2.5 rounded-xl border border-[var(--border-color)]/40">
                  “{prompt}”
                </div>
              )}
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
                  loading="lazy"
                />
              </div>

              {/* Prompt Caption */}
              {prompt && (
                <div className="text-xs text-[var(--text-primary)] font-normal italic bg-[var(--bg-hover)]/30 p-2.5 rounded-xl border border-[var(--border-color)]/40">
                  “{prompt}”
                </div>
              )}

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
