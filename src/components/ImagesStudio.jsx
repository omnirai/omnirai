import React, { useState, useEffect } from 'react';
import { 
  ImageIcon, 
  Download, 
  Trash2, 
  Search, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Filter, 
  RefreshCw,
  X,
  Layers,
  Wand2
} from 'lucide-react';
import { queryQuickAi, getBackendImageQuota } from '../engine/quickAiEngine';

export default function ImagesStudio({ onSendMessage, isGenerating, currentUser }) {
  const [images, setImages] = useState(() => {
    const saved = localStorage.getItem('omnira_saved_images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'logos' | 'photos' | 'art'
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [quota, setQuota] = useState({ used: 0, limit: 5, remaining: 5 });

  useEffect(() => {
    localStorage.setItem('omnira_saved_images', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    getBackendImageQuota(currentUser?.email || 'guest_user', currentUser?.plan || 'Free').then(setQuota);
  }, [currentUser, images]);

  const handleCreateImage = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const res = await queryQuickAi(
        prompt.trim(),
        [],
        'cloudflare-image',
        { engineMode: 'quick-local-neural' },
        null,
        'image'
      );

      if (res && res.imageUrl) {
        const newImg = {
          id: `img_${Date.now()}`,
          imageUrl: res.imageUrl,
          prompt: prompt.trim(),
          model: 'FLUX 1 Schnell',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setImages((prev) => [newImg, ...prev]);
        setPrompt('');
      }
    } catch (err) {
      console.error('Image creation failed:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteImage = (id, e) => {
    e?.stopPropagation();
    if (confirm('Delete this generated image from gallery?')) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    }
  };

  const handleDownload = (imageUrl, promptText, e) => {
    e?.stopPropagation();
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `omnira-${promptText.slice(0, 24).replace(/[^a-z0-9]/gi, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPrompt = (promptText, id, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter((img) => {
    if (!img) return false;
    const matchSearch = (img.prompt || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'logos') return matchSearch && (img.prompt || '').toLowerCase().includes('logo');
    if (activeFilter === 'photos') return matchSearch && ((img.prompt || '').toLowerCase().includes('photo') || (img.prompt || '').toLowerCase().includes('realistic'));
    return matchSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-7xl mx-auto w-full px-2 sm:px-4 py-2">
      
      {/* Top Header Controls (Monochrome Black & White - Zero Green) */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-color)] gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-[var(--border-color)]">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>Images Gallery & Studio</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                {images.length} saved
              </span>
            </h1>
            <p className="text-[11px] text-[var(--text-muted)]">
              All your generated FLUX AI images stay permanently saved here.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Daily Quota: {quota.used}/{quota.limit} ({quota.remaining} left)
          </span>
        </div>
      </div>

      {/* Quick Prompt Creation Input Bar */}
      <form onSubmit={handleCreateImage} className="my-3 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe an image to generate with FLUX (e.g. 'minimalist logo for hd electronics', 'A futuristic cyber city')..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] outline-none focus:border-black dark:focus:border-white shadow-2xs"
        />
        <button
          type="submit"
          disabled={isCreating || !prompt.trim()}
          className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-semibold text-xs flex items-center gap-2 transition-all disabled:opacity-40 shadow-xs cursor-pointer"
        >
          {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>Generate</span>
        </button>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] p-1 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Images ({images.length})
          </button>
          <button
            onClick={() => setActiveFilter('logos')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === 'logos'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Logos ({images.filter(i => (i.prompt || '').toLowerCase().includes('logo')).length})
          </button>
          <button
            onClick={() => setActiveFilter('photos')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === 'photos'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Art & Photos ({images.filter(i => (i.prompt || '').toLowerCase().includes('photo') || (i.prompt || '').toLowerCase().includes('realistic')).length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved images..."
            className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] outline-none focus:border-black dark:focus:border-white w-48 sm:w-60 shadow-2xs"
          />
        </div>
      </div>

      {/* Main Gallery Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredImages.length === 0 ? (
          /* Empty State */
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[var(--border-color)] rounded-2xl">
            <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 mb-3 border border-[var(--border-color)]">
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
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  "modern vector logo of hd electronics"
                </button>
                <button
                  onClick={() => setPrompt('A red Ferrari in front of Everest')}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-primary)] transition-colors cursor-pointer"
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

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between" />

                <div className="relative z-10 p-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCopyPrompt(img.prompt, img.id, e)}
                    className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                    title="Copy Prompt"
                  >
                    {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
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
            
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="font-semibold text-[var(--text-primary)] truncate">
                  {selectedImage.prompt}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-neutral-950 flex items-center justify-center p-4">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.prompt}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-[var(--text-muted)] text-[11px]">
                <span>Model: {selectedImage.model || 'FLUX 1 Schnell'}</span>
                {selectedImage.timestamp && <span> • {selectedImage.timestamp}</span>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPrompt(selectedImage.prompt, 'modal')}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                >
                  {copiedId === 'modal' ? <Check className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'modal' ? 'Copied' : 'Copy Prompt'}</span>
                </button>

                <button
                  onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.prompt)}
                  className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black flex items-center gap-1.5 font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => handleDeleteImage(selectedImage.id)}
                  className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
