import React, { useState, useEffect, useMemo } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Search, 
  Maximize2, 
  X, 
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers
} from 'lucide-react';
import { queryQuickAi } from '../engine/quickAiEngine';

export default function ImagesStudio({ chatSessions = [], userQuota = { used: 0, limit: 25, remaining: 25 }, onUpdateQuota }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'logos' | 'photos'

  // Persistent user images stored in localStorage
  const [savedImages, setSavedImages] = useState(() => {
    try {
      const saved = localStorage.getItem('omnira_saved_images');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Extract all generated images from chat history sessions and merge with savedImages
  useEffect(() => {
    const chatImages = [];
    if (Array.isArray(chatSessions)) {
      chatSessions.forEach((session) => {
        if (Array.isArray(session.messages)) {
          session.messages.forEach((msg) => {
            if (msg && msg.type === 'image_generation' && msg.imageUrl) {
              chatImages.push({
                id: msg.id || `chat-img-${msg.timestamp || Date.now()}-${Math.random()}`,
                imageUrl: msg.imageUrl,
                prompt: msg.userPrompt || msg.prompt || 'Generated Image',
                timestamp: msg.timestamp || 'Recent',
                createdAt: Date.now(),
                model: msg.model || 'FLUX 1 Schnell'
              });
            }
          });
        }
      });
    }

    if (chatImages.length > 0) {
      setSavedImages((prev) => {
        const existingUrls = new Set(prev.map((i) => i.imageUrl));
        const newOnes = chatImages.filter((ci) => !existingUrls.has(ci.imageUrl));
        if (newOnes.length > 0) {
          const merged = [...newOnes, ...prev];
          localStorage.setItem('omnira_saved_images', JSON.stringify(merged));
          return merged;
        }
        return prev;
      });
    }
  }, [chatSessions]);

  // Save to localStorage whenever savedImages updates
  const updateSavedImages = (newList) => {
    setSavedImages(newList);
    try {
      localStorage.setItem('omnira_saved_images', JSON.stringify(newList));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  };

  // Generate new image directly from Images Studio
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    const query = prompt.trim();
    if (!query || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await queryQuickAi({
        prompt: query,
        mode: 'image',
        selectedModel: 'flux-image'
      });

      if (response && response.image) {
        const newImg = {
          id: `img-${Date.now()}`,
          imageUrl: response.image,
          prompt: response.userPrompt || response.prompt || query,
          timestamp: new Date().toLocaleTimeString(),
          createdAt: Date.now(),
          model: response.model || 'FLUX 1 Schnell'
        };

        const updated = [newImg, ...savedImages];
        updateSavedImages(updated);
        setPrompt('');
        if (response.quota && onUpdateQuota) {
          onUpdateQuota(response.quota);
        }
      } else if (response && response.error) {
        alert(response.error);
      }
    } catch (err) {
      console.error('ImagesStudio generation error:', err);
      alert('Failed to generate image: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteImage = (id, e) => {
    if (e) e.stopPropagation();
    if (confirm('Delete this image from your gallery?')) {
      const updated = savedImages.filter((img) => img.id !== id);
      updateSavedImages(updated);
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    }
  };

  const handleCopyPrompt = (text, id, e) => {
    if (e) e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (imageUrl, promptText, e) => {
    if (e) e.stopPropagation();
    if (!imageUrl) return;
    try {
      const filename = `omnira-${(promptText || 'image').slice(0, 20).replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.png`;
      if (imageUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Filter and search
  const filteredImages = useMemo(() => {
    return savedImages.filter((img) => {
      const matchesSearch = !searchQuery.trim() || 
        img.prompt?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (activeFilter === 'logos') {
        return img.prompt?.toLowerCase().includes('logo');
      }
      if (activeFilter === 'photos') {
        return !img.prompt?.toLowerCase().includes('logo');
      }
      return true;
    });
  }, [savedImages, searchQuery, activeFilter]);

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 overflow-hidden select-none">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
              Images Gallery & Studio
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
              {savedImages.length} saved
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            All your generated FLUX AI images stay permanently saved here.
          </p>
        </div>

        {/* Quota Indicator */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
            <span>Daily Quota: </span>
            <strong className="text-[var(--text-primary)]">{userQuota.used}/{userQuota.limit}</strong>
            <span className="opacity-75"> ({userQuota.remaining} left)</span>
          </div>
        </div>
      </div>

      {/* Generation Bar */}
      <div className="pt-3 pb-2 shrink-0">
        <form onSubmit={handleGenerate} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Describe an image to generate with FLUX (e.g., 'minimalist logo for hd electronics', 'A futuristic cyber city')..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-emerald-500 transition-colors shadow-2xs"
            />
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="absolute right-3 top-2.5 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 shrink-0">
        {/* Categories */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              activeFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold border-transparent'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Images ({savedImages.length})
          </button>
          <button
            onClick={() => setActiveFilter('logos')}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              activeFilter === 'logos'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold border-transparent'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Logos ({savedImages.filter(i => i.prompt?.toLowerCase().includes('logo')).length})
          </button>
          <button
            onClick={() => setActiveFilter('photos')}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              activeFilter === 'photos'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold border-transparent'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Art & Photos ({savedImages.filter(i => !i.prompt?.toLowerCase().includes('logo')).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved images..."
            className="w-full pl-8 pr-3 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Gallery Grid Container */}
      <div className="flex-1 overflow-y-auto pt-2 pb-6 min-h-0">
        {filteredImages.length === 0 ? (
          /* Empty State */
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-3">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              {searchQuery ? 'No matching images found' : 'No generated images saved yet'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
              {searchQuery
                ? 'Try a different search keyword or clear the search filter.'
                : 'Type a prompt above or ask OMNIRA in Chat to create logos, photos, and artwork. Everything will stay saved here.'}
            </p>

            {!searchQuery && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md">
                <button
                  onClick={() => setPrompt('modern vector logo of hd electronics')}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-primary)] transition-colors"
                >
                  "modern vector logo of hd electronics"
                </button>
                <button
                  onClick={() => setPrompt('A red Ferrari in front of Everest')}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-primary)] transition-colors"
                >
                  "A red Ferrari in front of Everest"
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Grid of saved images */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-end"
              >
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Dark Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between" />

                {/* Top Action Icons on Hover */}
                <div className="relative z-10 p-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCopyPrompt(img.prompt, img.id, e)}
                    className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                    title="Copy Prompt"
                  >
                    {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => handleDownload(img.imageUrl, img.prompt, e)}
                    className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                    title="Download Image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteImage(img.id, e)}
                    className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-red-400 hover:bg-red-500/80 hover:text-white transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Prompt Title on Hover */}
                <div className="relative z-10 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                  <p className="text-[11px] font-medium text-white line-clamp-2 leading-snug drop-shadow-sm">
                    {img.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="font-semibold text-[var(--text-primary)] truncate">
                  {selectedImage.prompt}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="flex-1 overflow-auto bg-neutral-950 flex items-center justify-center p-4">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-[var(--text-muted)] text-[11px]">
                <span>Model: {selectedImage.model || 'FLUX 1 Schnell'}</span>
                {selectedImage.timestamp && <span> • {selectedImage.timestamp}</span>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPrompt(selectedImage.prompt, 'modal')}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center gap-1.5 font-medium transition-colors"
                >
                  {copiedId === 'modal' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'modal' ? 'Copied' : 'Copy Prompt'}</span>
                </button>

                <button
                  onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.prompt)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => handleDeleteImage(selectedImage.id)}
                  className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete from Gallery"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
