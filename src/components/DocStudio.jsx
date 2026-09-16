import React, { useState } from 'react';
import { FileText, Download, Copy, Check, RefreshCw, Upload } from 'lucide-react';
import { queryQuickAi } from '../engine/quickAiEngine';

export default function DocStudio({ settings }) {
  const [inputDoc, setInputDoc] = useState('');
  const [outputDoc, setOutputDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTransform = async (modeType) => {
    if (!inputDoc.trim()) return;
    setIsGenerating(true);

    let prompt = inputDoc;
    if (modeType === 'summarize') {
      prompt = `Summarize the following document into key actionable points and an executive summary:\n\n${inputDoc}`;
    } else if (modeType === 'tone-pro') {
      prompt = `Rewrite the following text in a clear, professional, executive tone:\n\n${inputDoc}`;
    } else if (modeType === 'tone-concise') {
      prompt = `Shorten and rewrite the following document to be as concise and punchy as possible:\n\n${inputDoc}`;
    } else if (modeType === 'grammar') {
      prompt = `Proofread, fix all grammar, punctuation, and style issues in the following text:\n\n${inputDoc}`;
    } else if (modeType === 'table') {
      prompt = `Format the data and main topics from the following text into a clean Markdown table:\n\n${inputDoc}`;
    }

    try {
      const res = await queryQuickAi({
        prompt,
        mode: 'doc',
        settings
      });
      setOutputDoc(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setInputDoc(event.target.result || '');
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quick-ai-document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-7xl mx-auto w-full px-2 sm:px-4 py-2">
      
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between py-2 border-b border-color text-xs text-muted mb-3 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold text-primary">Doc Writer & Text Lab</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <label className="btn btn-sm text-xs cursor-pointer">
            <Upload className="w-3 h-3" /> Upload File
            <input type="file" onChange={handleFileUpload} accept="*/*" className="hidden" />
          </label>
          <button onClick={() => handleTransform('summarize')} disabled={isGenerating || !inputDoc.trim()} className="btn btn-sm text-xs">
            ⚡ Summarize
          </button>
          <button onClick={() => handleTransform('tone-pro')} disabled={isGenerating || !inputDoc.trim()} className="btn btn-sm text-xs">
            👔 Professional Tone
          </button>
          <button onClick={() => handleTransform('grammar')} disabled={isGenerating || !inputDoc.trim()} className="btn btn-sm text-xs">
            ✨ Fix Grammar
          </button>
          <button onClick={() => handleTransform('table')} disabled={isGenerating || !inputDoc.trim()} className="btn btn-sm text-xs">
            📊 Extract Table
          </button>
        </div>
      </div>

      {/* Grid: Source Document Left | Processed Document Right */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden">
        
        {/* Source Text Area */}
        <div className="flex flex-col border border-color rounded-lg bg-card overflow-hidden">
          <div className="bg-secondary px-3 py-2 border-b border-color text-xs font-semibold flex items-center justify-between">
            <span>SOURCE DOCUMENT</span>
            <span className="text-muted">{inputDoc.length.toLocaleString()} characters</span>
          </div>
          <textarea
            value={inputDoc}
            onChange={(e) => setInputDoc(e.target.value)}
            placeholder="Paste your raw text, article draft, essay, notes, or uploaded file contents here..."
            className="flex-1 p-3 text-xs bg-card text-primary border-none outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Output Text Area */}
        <div className="flex flex-col border border-strong rounded-lg bg-card overflow-hidden">
          <div className="bg-secondary px-3 py-2 border-b border-color text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin text-primary" /> : null}
              QUICK AI TRANSFORMED OUTPUT
            </span>
            <div className="flex items-center gap-1">
              <button onClick={handleCopy} disabled={!outputDoc} className="btn btn-icon btn-sm" title="Copy">
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
              <button onClick={handleDownload} disabled={!outputDoc} className="btn btn-icon btn-sm" title="Download MD">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-primary leading-relaxed whitespace-pre-wrap">
            {outputDoc || (
              <span className="text-muted italic">
                Select an AI action above (Summarize, Professional Tone, Fix Grammar, or Extract Table) to generate output.
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
