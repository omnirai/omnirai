import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Upload, 
  Sparkles, 
  Briefcase, 
  Wand2, 
  Table, 
  FileUp, 
  RefreshCw 
} from 'lucide-react';
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
      const res = await queryQuickAi(
        prompt,
        [],
        'gpt-4o',
        settings,
        null,
        'doc'
      );
      setOutputDoc(res?.content || res?.text || res || '');
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
    a.download = 'omnira-document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-7xl mx-auto w-full px-2 sm:px-4 py-2">
      
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between py-2 border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] mb-3 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-black dark:text-white" />
          <span className="font-semibold text-[var(--text-primary)]">Doc Writer & Text Lab</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-primary)] cursor-pointer transition-colors shadow-2xs">
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload File</span>
            <input type="file" onChange={handleFileUpload} accept="*/*" className="hidden" />
          </label>

          <button 
            onClick={() => handleTransform('summarize')} 
            disabled={isGenerating || !inputDoc.trim()} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-primary)] disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            <span>Summarize</span>
          </button>

          <button 
            onClick={() => handleTransform('tone-pro')} 
            disabled={isGenerating || !inputDoc.trim()} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-primary)] disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            <span>Professional Tone</span>
          </button>

          <button 
            onClick={() => handleTransform('grammar')} 
            disabled={isGenerating || !inputDoc.trim()} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-primary)] disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            <span>Fix Grammar</span>
          </button>

          <button 
            onClick={() => handleTransform('table')} 
            disabled={isGenerating || !inputDoc.trim()} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-[var(--text-primary)] disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
            <span>Extract Table</span>
          </button>
        </div>
      </div>

      {/* Grid: Source Document Left | Processed Document Right */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden">
        
        {/* Source Textarea Panel */}
        <div className="flex flex-col border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)] overflow-hidden shadow-2xs">
          <div className="px-4 py-2.5 bg-[var(--bg-hover)] border-b border-[var(--border-color)] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Source Document</span>
            <span className="font-mono">{inputDoc.length} characters</span>
          </div>
          <textarea
            value={inputDoc}
            onChange={(e) => setInputDoc(e.target.value)}
            placeholder="Paste your raw text, article draft, essay, notes, or uploaded file contents here..."
            className="flex-1 p-4 bg-transparent border-none outline-none resize-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] leading-relaxed font-mono"
          />
        </div>

        {/* Processed Output Panel */}
        <div className="flex flex-col border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)] overflow-hidden shadow-2xs">
          <div className="px-4 py-2 bg-[var(--bg-hover)] border-b border-[var(--border-color)] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span>Quick AI Transformed Output</span>
              {isGenerating && <RefreshCw className="w-3 h-3 animate-spin text-black dark:text-white" />}
            </div>

            {outputDoc && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleCopy} 
                  className="p-1.5 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" 
                  title="Copy output"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-black dark:text-white" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={handleDownload} 
                  className="p-1.5 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" 
                  title="Download Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto text-sm text-[var(--text-primary)] leading-relaxed font-sans whitespace-pre-wrap">
            {outputDoc ? (
              outputDoc
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)] text-center italic p-6">
                Select an AI action above (Summarize, Professional Tone, Fix Grammar, or Extract Table) to generate output.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
