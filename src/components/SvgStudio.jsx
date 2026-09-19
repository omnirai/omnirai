import React, { useState } from 'react';
import { Image as ImageIcon, Copy, Check, Download, RefreshCw, Eye } from 'lucide-react';
import { queryQuickAi } from '../engine/quickAiEngine';

export default function SvgStudio({ settings }) {
  const [prompt, setPrompt] = useState('Neural AI Processor Architecture');
  const [svgOutput, setSvgOutput] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="100%" height="280" style="background: #09090b; border-radius: 8px; border: 1px solid #27272a;">
  <!-- Neural AI Processor Architecture - Created by bishalcodes.com -->
  <rect x="100" y="60" width="200" height="160" rx="12" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
  <rect x="130" y="90" width="140" height="100" rx="8" fill="#09090b" stroke="#52525b" stroke-width="1"/>
  <text x="200" y="145" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-size="14" font-weight="600">QUICK AI ENGINE</text>
  <text x="200" y="165" text-anchor="middle" fill="#71717a" font-family="Inter, sans-serif" font-size="10">bishalcodes.com</text>
  <line x1="140" y1="30" x2="140" y2="60" stroke="#ffffff" stroke-width="2"/>
  <line x1="170" y1="30" x2="170" y2="60" stroke="#ffffff" stroke-width="2"/>
  <line x1="200" y1="30" x2="200" y2="60" stroke="#ffffff" stroke-width="2"/>
  <line x1="230" y1="30" x2="230" y2="60" stroke="#ffffff" stroke-width="2"/>
  <line x1="260" y1="30" x2="260" y2="60" stroke="#ffffff" stroke-width="2"/>
  <text x="20" y="260" fill="#71717a" font-family="Inter, sans-serif" font-size="11">Quick AI Vector Studio • bishalcodes.com</text>
</svg>`);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const presets = [
    'Neural AI Processor Chip',
    'Monochrome Analytics Chart',
    'Stark Geometric Emblem'
  ];

  const handleGenerateSvg = async (query = prompt) => {
    if (!query.trim()) return;
    setIsGenerating(true);
    try {
      const res = await queryQuickAi({
        prompt: query,
        mode: 'svg',
        settings
      });

      const xmlMatch = res.match(/```xml\n([\s\S]*?)```/i) || res.match(/(<svg[\s\S]*?<\/svg>)/i);
      if (xmlMatch && xmlMatch[1]) {
        setSvgOutput(xmlMatch[1].trim());
      } else {
        setSvgOutput(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(svgOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quick-ai-vector.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto w-full px-2 sm:px-4 py-2">
      
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-color text-xs text-muted mb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-primary">SVG Vector Art Studio</span>
          <span>•</span>
          <span>Zero API Key Visual Generator</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="btn btn-sm text-xs">
            {copied ? <Check className="w-3 h-3 text-black dark:text-white" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy SVG Code'}</span>
          </button>
          <button onClick={handleDownload} className="btn btn-sm text-xs">
            <Download className="w-3 h-3" /> Download SVG
          </button>
        </div>
      </div>

      {/* Prompt Form */}
      <div className="mb-4 border border-strong rounded-lg bg-card p-3 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateSvg()}
            placeholder="Describe vector graphic or diagram (e.g. 'Analytics Bar Chart', 'Processor Chip')..."
            className="input text-sm flex-1"
          />
          <button
            onClick={() => handleGenerateSvg()}
            disabled={isGenerating || !prompt.trim()}
            className="btn btn-primary btn-sm"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            <span>Draw SVG</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-color text-xs">
          <span className="text-muted">Presets:</span>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setPrompt(p);
                handleGenerateSvg(p);
              }}
              className="btn btn-sm text-xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Display Grid: Left Visual Canvas | Right Raw SVG Code */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden">
        
        {/* Visual Render Canvas */}
        <div className="flex flex-col border border-strong rounded-lg bg-card overflow-hidden">
          <div className="bg-secondary px-3 py-2 border-b border-color text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> VISUAL VECTOR CANVAS
            </span>
            <span className="text-muted">Scale 100%</span>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center bg-[#000000] overflow-auto">
            <div 
              className="w-full max-w-md"
              dangerouslySetInnerHTML={{ __html: svgOutput }} 
            />
          </div>
        </div>

        {/* Raw Code Editor */}
        <div className="flex flex-col border border-color rounded-lg bg-card overflow-hidden">
          <div className="bg-secondary px-3 py-2 border-b border-color text-xs font-mono font-semibold flex items-center justify-between">
            <span>SVG XML SOURCE</span>
            <span className="text-muted font-mono">{svgOutput.length} bytes</span>
          </div>
          <textarea
            value={svgOutput}
            onChange={(e) => setSvgOutput(e.target.value)}
            spellCheck={false}
            className="flex-1 p-3 font-mono text-xs bg-card text-primary border-none outline-none resize-none leading-relaxed"
          />
        </div>

      </div>

    </div>
  );
}
