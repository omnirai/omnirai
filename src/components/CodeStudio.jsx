import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Play, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Terminal, 
  FileCode, 
  Sparkles,
  Clock,
  Save,
  Search
} from 'lucide-react';
import { queryQuickAi } from '../engine/quickAiEngine';

const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'html', label: 'HTML / Web', ext: 'html' },
  { id: 'css', label: 'CSS', ext: 'css' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
  { id: 'php', label: 'PHP', ext: 'php' },
  { id: 'sql', label: 'SQL', ext: 'sql' },
  { id: 'bash', label: 'Bash / Shell', ext: 'sh' }
];

export default function CodeStudio({ settings, chatSessions = [] }) {
  const [selectedLang, setSelectedLang] = useState('python');
  const [code, setCode] = useState('');
  const [snippetTitle, setSnippetTitle] = useState('Untitled Snippet');
  const [activeSnippetId, setActiveSnippetId] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Persistent user coding history stored in localStorage
  const [codeHistory, setCodeHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('omnira_code_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Automatically extract code blocks from chat sessions and merge into codeHistory
  useEffect(() => {
    const extractedSnippets = [];
    if (Array.isArray(chatSessions)) {
      chatSessions.forEach((session) => {
        if (Array.isArray(session.messages)) {
          session.messages.forEach((msg) => {
            if (msg && msg.content && typeof msg.content === 'string') {
              // Match code blocks ```lang ... ```
              const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
              let match;
              while ((match = codeBlockRegex.exec(msg.content)) !== null) {
                const langRaw = (match[1] || 'python').toLowerCase();
                const matchedCode = match[2].trim();
                if (matchedCode.length > 10) {
                  const lang = SUPPORTED_LANGUAGES.find(l => l.id === langRaw || l.ext === langRaw)?.id || 'python';
                  extractedSnippets.push({
                    id: `chat-code-${msg.id || Date.now()}-${Math.random()}`,
                    title: session.title ? `${session.title} snippet` : 'Chat code snippet',
                    language: lang,
                    code: matchedCode,
                    timestamp: msg.timestamp || new Date().toLocaleDateString(),
                    createdAt: Date.now()
                  });
                }
              }
            }
          });
        }
      });
    }

    if (extractedSnippets.length > 0) {
      setCodeHistory((prev) => {
        const existingCodes = new Set(prev.map(item => item.code.trim()));
        const newSnippets = extractedSnippets.filter(s => !existingCodes.has(s.code.trim()));
        if (newSnippets.length > 0) {
          const merged = [...newSnippets, ...prev];
          localStorage.setItem('omnira_code_history', JSON.stringify(merged));
          return merged;
        }
        return prev;
      });
    }
  }, [chatSessions]);

  // Save history to localStorage
  const updateHistory = (newList) => {
    setCodeHistory(newList);
    try {
      localStorage.setItem('omnira_code_history', JSON.stringify(newList));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  };

  // Load snippet from history
  const handleSelectSnippet = (item) => {
    setActiveSnippetId(item.id);
    setCode(item.code);
    setSelectedLang(item.language || 'python');
    setSnippetTitle(item.title || 'Untitled Snippet');
    setConsoleOutput('');
  };

  // Start a fresh, clean snippet
  const handleNewSnippet = () => {
    setActiveSnippetId(null);
    setCode('');
    setSnippetTitle('New Snippet');
    setConsoleOutput('');
  };

  // Save current code to history
  const handleSaveToHistory = () => {
    if (!code.trim()) return;
    const title = snippetTitle.trim() || 'Untitled Snippet';

    if (activeSnippetId) {
      // Update existing
      const updated = codeHistory.map((item) => 
        item.id === activeSnippetId 
          ? { ...item, title, code, language: selectedLang, timestamp: new Date().toLocaleTimeString() }
          : item
      );
      updateHistory(updated);
    } else {
      // Create new history entry
      const newItem = {
        id: `code-${Date.now()}`,
        title,
        language: selectedLang,
        code,
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        createdAt: Date.now()
      };
      setActiveSnippetId(newItem.id);
      updateHistory([newItem, ...codeHistory]);
    }
  };

  // Delete from history
  const handleDeleteSnippet = (id, e) => {
    if (e) e.stopPropagation();
    if (confirm('Delete this snippet from your coding history?')) {
      const updated = codeHistory.filter((item) => item.id !== id);
      updateHistory(updated);
      if (activeSnippetId === id) {
        handleNewSnippet();
      }
    }
  };

  // AI Code Operations (Generate, Refactor, Fix, Explain)
  const handleAiAction = async (actionType) => {
    setIsAiLoading(true);
    let promptToSend = '';

    if (actionType === 'generate') {
      if (!aiPrompt.trim()) {
        setIsAiLoading(false);
        return;
      }
      promptToSend = `Write clean, efficient ${selectedLang.toUpperCase()} code for:\n${aiPrompt}`;
    } else if (actionType === 'refactor') {
      if (!code.trim()) {
        setIsAiLoading(false);
        return;
      }
      promptToSend = `Refactor and optimize this ${selectedLang.toUpperCase()} code for clarity, performance, and best practices:\n\`\`\`${selectedLang}\n${code}\n\`\`\``;
    } else if (actionType === 'fix') {
      if (!code.trim()) {
        setIsAiLoading(false);
        return;
      }
      promptToSend = `Debug and fix any errors, bugs, or edge cases in this ${selectedLang.toUpperCase()} code:\n\`\`\`${selectedLang}\n${code}\n\`\`\``;
    } else if (actionType === 'explain') {
      if (!code.trim()) {
        setIsAiLoading(false);
        return;
      }
      promptToSend = `Explain in plain English how this ${selectedLang.toUpperCase()} code works, outlining its key logic and functions:\n\`\`\`${selectedLang}\n${code}\n\`\`\``;
    }

    try {
      const response = await queryQuickAi({
        prompt: promptToSend,
        mode: 'code',
        settings
      });

      // Extract code block if AI response includes code
      const codeMatch = response.match(/```(?:[a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1] && actionType !== 'explain') {
        const extracted = codeMatch[1].trim();
        setCode(extracted);
        setConsoleOutput(`[AI Response]:\n${response}`);
      } else {
        setConsoleOutput(response);
      }
    } catch (err) {
      setConsoleOutput(`⚠️ Error: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run or Evaluate Code
  const handleRunCode = () => {
    if (!code.trim()) return;

    if (selectedLang === 'javascript') {
      try {
        let logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
        };
        // Run safely in client JS sandbox
        const evalResult = new Function(code)();
        console.log = originalLog;
        if (logs.length > 0) {
          setConsoleOutput(logs.join('\n'));
        } else if (evalResult !== undefined) {
          setConsoleOutput(typeof evalResult === 'object' ? JSON.stringify(evalResult, null, 2) : String(evalResult));
        } else {
          setConsoleOutput('Execution finished with no output.');
        }
      } catch (err) {
        setConsoleOutput(`Runtime Error: ${err.message}`);
      }
    } else if (selectedLang === 'html') {
      setConsoleOutput('[HTML Web Preview rendered in preview panel]');
    } else {
      // For backend languages (Python, C++, PHP, etc.), ask AI to analyze/evaluate code output
      handleAiAction('explain');
    }
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!code) return;
    const currentExt = SUPPORTED_LANGUAGES.find(l => l.id === selectedLang)?.ext || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(snippetTitle || 'script').replace(/[^a-z0-9]/gi, '_')}.${currentExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter history
  const filteredHistory = codeHistory.filter((item) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return item.title?.toLowerCase().includes(q) || 
      item.language?.toLowerCase().includes(q) || 
      item.code?.toLowerCase().includes(q);
  });

  return (
    <div className="flex h-full w-full max-w-7xl mx-auto p-2 sm:p-4 overflow-hidden select-none">
      
      {/* Main Grid: Left Sidebar Coding History | Right Code Workspace */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 h-full overflow-hidden">
        
        {/* Left Column: User's Coding History */}
        <div className="w-full md:w-72 lg:w-80 flex flex-col border border-[var(--border-color)] bg-[var(--bg-card)] rounded-2xl overflow-hidden shrink-0 shadow-sm">
          
          {/* History Header */}
          <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-hover)]/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-xs text-[var(--text-primary)]">
                Coding History ({codeHistory.length})
              </span>
            </div>
            <button
              onClick={handleNewSnippet}
              className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs flex items-center gap-1 font-medium transition-colors"
              title="New Clean Snippet"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>New</span>
            </button>
          </div>

          {/* History Search */}
          <div className="p-2 border-b border-[var(--border-color)] shrink-0">
            <div className="relative">
              <Search className="w-3 h-3 text-[var(--text-muted)] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-hover)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* History Snippets List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)] space-y-1">
                <FileCode className="w-6 h-6 mx-auto opacity-40 text-neutral-500" />
                <p className="font-medium text-[var(--text-primary)]">No coding history yet</p>
                <p className="text-[11px] leading-relaxed">
                  Write code in the editor and click "Save", or ask OMNIRA in Chat. Your code will stay saved here.
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isSelected = activeSnippetId === item.id;
                const lineCount = (item.code || '').split('\n').length;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSnippet(item)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-[var(--text-primary)]'
                        : 'border-[var(--border-color)]/60 bg-[var(--bg-hover)]/20 hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs truncate flex-1">
                        {item.title || 'Untitled Snippet'}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSnippet(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity"
                        title="Delete snippet"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                      <span className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] uppercase font-mono font-bold border border-[var(--border-color)]">
                        {item.language || 'code'}
                      </span>
                      <span>{lineCount} lines • {item.timestamp || 'Saved'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Code Editor & AI Tools */}
        <div className="flex-1 flex flex-col border border-[var(--border-color)] bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-sm">
          
          {/* Editor Header: Title, Language, and Controls */}
          <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-hover)]/30 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[180px]">
              <input
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="Snippet title..."
                className="font-bold text-xs bg-transparent border-none outline-none text-[var(--text-primary)] flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] outline-none font-mono cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>

              {/* Save Button */}
              <button
                onClick={handleSaveToHistory}
                disabled={!code.trim()}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                title="Save code to your history"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              {/* Run Button for JS or Preview for HTML */}
              {selectedLang === 'javascript' && (
                <button
                  onClick={handleRunCode}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Run</span>
                </button>
              )}

              {/* Copy */}
              <button
                onClick={handleCopy}
                disabled={!code}
                className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={!code}
                className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Download script"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Code Textarea / HTML Live View */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            {selectedLang === 'html' && code ? (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-color)] min-h-0">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste or write HTML / CSS / JS code here..."
                  spellCheck={false}
                  className="w-full h-full p-3 font-mono text-xs bg-[var(--bg-card)] text-[var(--text-primary)] border-none outline-none resize-none leading-relaxed"
                />
                <div className="w-full h-full bg-white overflow-hidden flex flex-col">
                  <div className="bg-neutral-100 text-neutral-600 px-3 py-1 text-[10px] font-mono border-b border-neutral-200">
                    Live HTML Preview
                  </div>
                  <iframe
                    srcDoc={code}
                    title="Live Preview"
                    sandbox="allow-scripts allow-modals"
                    className="w-full flex-1 border-none bg-white"
                  />
                </div>
              </div>
            ) : (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`Write, paste, or ask OMNIRA to generate ${selectedLang.toUpperCase()} code...`}
                spellCheck={false}
                className="w-full h-full p-4 font-mono text-xs bg-[var(--bg-card)] text-[var(--text-primary)] border-none outline-none resize-none leading-relaxed"
              />
            )}
          </div>

          {/* AI Helper Bar & Output */}
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-hover)]/20 p-2.5 space-y-2 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAction('generate')}
                placeholder={`Ask OMNIRA to write ${selectedLang.toUpperCase()} code...`}
                className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleAiAction('generate')}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate</span>
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[var(--text-muted)] font-medium">Quick Actions:</span>
                <button
                  onClick={() => handleAiAction('refactor')}
                  disabled={isAiLoading || !code.trim()}
                  className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[11px] text-[var(--text-primary)] disabled:opacity-40"
                >
                  ⚡ Refactor
                </button>
                <button
                  onClick={() => handleAiAction('fix')}
                  disabled={isAiLoading || !code.trim()}
                  className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[11px] text-[var(--text-primary)] disabled:opacity-40"
                >
                  🐞 Fix Bugs
                </button>
                <button
                  onClick={() => handleAiAction('explain')}
                  disabled={isAiLoading || !code.trim()}
                  className="px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[11px] text-[var(--text-primary)] disabled:opacity-40"
                >
                  📖 Explain
                </button>
              </div>

              {consoleOutput && (
                <button
                  onClick={() => setConsoleOutput('')}
                  className="text-[11px] text-[var(--text-muted)] hover:text-red-400"
                >
                  Clear output
                </button>
              )}
            </div>

            {/* Console / AI Output Display */}
            {consoleOutput && (
              <div className="p-2.5 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap border border-neutral-800 select-text leading-relaxed">
                {consoleOutput}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
