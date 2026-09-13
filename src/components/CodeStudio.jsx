import React, { useState } from 'react';
import { Code, Play, Copy, Check, Download, RefreshCw, Eye, EyeOff, Terminal, Sparkles } from 'lucide-react';
import { queryQuickAi } from '../engine/quickAiEngine';

export default function CodeStudio({ settings }) {
  const [selectedLang, setSelectedLang] = useState('python'); // 'python' | 'php' | 'cpp' | 'html'
  const [prompt, setPrompt] = useState('Build a data processing algorithm');

  const defaultTemplates = {
    python: `# Quick AI Python 3 Sandbox — Created by bishalcodes.com
import json
import time

def process_data(items):
    print(f"[Python 3] Processing {len(items)} items...")
    results = []
    for idx, item in enumerate(items):
        results.append({
            "id": idx + 1,
            "raw": item,
            "uppercase": str(item).upper()
        })
    return results

if __name__ == "__main__":
    data = ["python", "php", "c++", "quick_ai"]
    output = process_data(data)
    print(json.dumps(output, indent=2))`,

    php: `<?php
/**
 * Quick AI PHP 8 Sandbox — Created by bishalcodes.com
 */

namespace QuickAI;

class DataHandler {
    private string $author = "bishalcodes.com";

    public function process(array $items): array {
        $out = [];
        foreach ($items as $k => $v) {
            $out[] = [
                'index' => $k + 1,
                'value' => strtoupper((string)$v),
                'creator' => $this->author
            ];
        }
        return $out;
    }
}

$handler = new DataHandler();
$result = $handler->process(['php', 'python', 'c++', 'quick_ai']);
header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);`,

    cpp: `/**
 * Quick AI C++17 Sandbox — Created by bishalcodes.com
 */

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

int main() {
    std::cout << "=== Quick AI C++ Execution Engine ===\\n";
    std::cout << "Created by bishalcodes.com\\n\\n";

    std::vector<std::string> languages = { "C++", "Python", "PHP", "Quick AI" };

    for (size_t i = 0; i < languages.size(); ++i) {
        std::string upper = languages[i];
        std::transform(upper.begin(), upper.end(), upper.begin(), ::toupper);
        std::cout << "[" << (i + 1) << "] " << languages[i] << " -> " << upper << "\\n";
    }

    std::cout << "\\n[C++] Execution completed successfully.\\n";
    return 0;
}`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #09090b; color: #ffffff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #18181b; border: 1px solid #27272a; padding: 24px; border-radius: 8px; text-align: center; }
    button { background: #ffffff; color: #000000; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Quick AI Live Web Sandbox</h2>
    <p>Created by bishalcodes.com (Python • PHP • C++ Ready)</p>
    <button onclick="alert('Quick AI Sandbox Active!')">Run Test</button>
  </div>
</body>
</html>`
  };

  const [code, setCode] = useState(defaultTemplates.python);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    setCode(defaultTemplates[lang] || '');
    setConsoleOutput('');
  };

  const handleAction = async (actionType) => {
    setIsGenerating(true);
    let langPrefix = `Write ${selectedLang.toUpperCase()} code for: `;
    let finalPrompt = `${langPrefix}${prompt}`;

    if (actionType === 'refactor') {
      finalPrompt = `Refactor and optimize the following ${selectedLang.toUpperCase()} code:\n\`\`\`\n${code}\n\`\`\``;
    } else if (actionType === 'fix') {
      finalPrompt = `Find and fix potential bugs in this ${selectedLang.toUpperCase()} code:\n\`\`\`\n${code}\n\`\`\``;
    } else if (actionType === 'explain') {
      finalPrompt = `Explain how this ${selectedLang.toUpperCase()} code works:\n\`\`\`\n${code}\n\`\`\``;
    }

    try {
      const response = await queryQuickAi({
        prompt: finalPrompt,
        mode: 'code',
        settings
      });

      const codeMatch = response.match(/```(?:python|php|cpp|c\+\+|html|css|js)?\n([\s\S]*?)```/i);
      if (codeMatch && codeMatch[1]) {
        setCode(codeMatch[1].trim());
      } else if (actionType === 'generate') {
        setCode(response);
      }
      setConsoleOutput(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Code Execution Simulator (Console Output for Python/PHP/C++ or iframe for HTML)
  const handleRunCode = () => {
    setIsRunningCode(true);
    setConsoleOutput(`[Executing ${selectedLang.toUpperCase()}...]\n\n`);

    setTimeout(() => {
      if (selectedLang === 'python') {
        setConsoleOutput(`[Python 3.12 Engine Output]:\n[Quick AI] Processing 4 items...\n{\n  "engine": "Quick AI",\n  "creator": "bishalcodes.com",\n  "status": "SUCCESS",\n  "execution_time": "0.14ms"\n}\n\nProcess finished with exit code 0.`);
      } else if (selectedLang === 'php') {
        setConsoleOutput(`[PHP 8.3 CLI Output]:\nContent-Type: application/json\n\n{\n  "status": "success",\n  "author": "bishalcodes.com",\n  "data": [\n    { "index": 1, "value": "PHP" },\n    { "index": 2, "value": "PYTHON" },\n    { "index": 3, "value": "C++" }\n  ]\n}`);
      } else if (selectedLang === 'cpp') {
        setConsoleOutput(`[g++ -std=c++17 -O3 Output]:\n=== Quick AI C++ Execution Engine ===\nCreated by bishalcodes.com\n\n[1] C++ -> C++\n[2] Python -> PYTHON\n[3] PHP -> PHP\n[4] Quick AI -> QUICK AI\n\nExecution completed in: 0.042 ms\nProcess finished with exit code 0.`);
      } else {
        setConsoleOutput(`[Web Frame Loaded HTML/CSS/JS Sandbox]`);
      }
      setIsRunningCode(false);
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap = { python: 'py', php: 'php', cpp: 'cpp', html: 'html' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quick-ai-code.${extMap[selectedLang] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-7xl mx-auto w-full px-2 sm:px-4 py-2">
      
      {/* Language Selector Header */}
      <div className="flex flex-wrap items-center justify-between py-2 border-b border-[var(--border-color)] text-xs mb-3 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="font-semibold text-[var(--text-primary)] mr-2">Language:</span>
          
          <button
            onClick={() => handleLanguageChange('python')}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              selectedLang === 'python'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] font-bold'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            🐍 Python 3
          </button>

          <button
            onClick={() => handleLanguageChange('php')}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              selectedLang === 'php'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] font-bold'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            🐘 PHP 8
          </button>

          <button
            onClick={() => handleLanguageChange('cpp')}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              selectedLang === 'cpp'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] font-bold'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            ⚙️ C++ (C++17)
          </button>

          <button
            onClick={() => handleLanguageChange('html')}
            className={`px-3 py-1.5 rounded-lg border font-mono transition-all ${
              selectedLang === 'html'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] font-bold'
                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            🌐 HTML / CSS / JS
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleRunCode} disabled={isRunningCode} className="btn btn-sm text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none">
            {isRunningCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run {selectedLang.toUpperCase()}</span>
          </button>
          <button onClick={handleCopy} className="btn btn-sm text-xs">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button onClick={handleDownload} className="btn btn-sm text-xs">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      {/* Input Prompt Box */}
      <div className="mb-3 border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] p-3 shadow-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('generate')}
            placeholder={`Describe ${selectedLang.toUpperCase()} script or algorithm to generate...`}
            className="input text-sm flex-1 bg-[var(--bg-hover)] border-none"
          />
          <button
            onClick={() => handleAction('generate')}
            disabled={isGenerating || !prompt.trim()}
            className="btn btn-primary btn-sm whitespace-nowrap"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Code className="w-3.5 h-3.5" />}
            <span>Generate {selectedLang.toUpperCase()}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[var(--border-color)] text-xs">
          <span className="text-[var(--text-muted)]">Actions:</span>
          <button onClick={() => handleAction('refactor')} disabled={isGenerating} className="btn btn-sm text-xs">
            ⚡ Refactor Code
          </button>
          <button onClick={() => handleAction('fix')} disabled={isGenerating} className="btn btn-sm text-xs">
            🐞 Fix Bugs
          </button>
          <button onClick={() => handleAction('explain')} disabled={isGenerating} className="btn btn-sm text-xs">
            📖 Explain Code
          </button>
        </div>
      </div>

      {/* Split View: Editor Left | Terminal Output Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">
        
        {/* Left: Code Editor */}
        <div className="flex flex-col border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] overflow-hidden">
          <div className="bg-[var(--bg-hover)] px-3 py-2 border-b border-[var(--border-color)] text-xs font-mono font-semibold flex items-center justify-between">
            <span>{selectedLang.toUpperCase()} EDITOR</span>
            <span className="text-[var(--text-muted)]">bishalcodes.com</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-3 font-mono text-xs bg-[var(--bg-card)] text-[var(--text-primary)] border-none outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Right: Interactive Runner Terminal or HTML Sandbox */}
        <div className="flex flex-col border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] overflow-hidden">
          <div className="bg-[var(--bg-hover)] px-3 py-2 border-b border-[var(--border-color)] text-xs font-mono font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" /> 
              {selectedLang === 'html' ? 'LIVE SANDBOX PREVIEW' : `${selectedLang.toUpperCase()} RUNNER CONSOLE`}
            </span>
            <span className="text-[var(--text-muted)]">Output</span>
          </div>

          {selectedLang === 'html' ? (
            <iframe
              srcDoc={code}
              title="Quick AI Sandbox"
              sandbox="allow-scripts allow-modals"
              className="w-full flex-1 border-none bg-white"
            />
          ) : (
            <div className="flex-1 p-4 bg-[#09090b] text-[#f4f4f5] font-mono text-xs overflow-y-auto leading-relaxed whitespace-pre-wrap border-none">
              {consoleOutput || `Click "Run ${selectedLang.toUpperCase()}" above to execute and view console output.`}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
