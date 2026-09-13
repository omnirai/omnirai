import React, { useState } from 'react';
import { Calculator, RefreshCw, Check, Copy } from 'lucide-react';
import { queryQuickAi } from '../engine/quickAiEngine';

export default function MathStudio({ settings }) {
  const [problem, setProblem] = useState('2x^2 + 5x - 3 = 0');
  const [solution, setSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [copied, setCopied] = useState(false);

  const presets = [
    '2x^2 + 5x - 3 = 0',
    '(150 * 0.15) + (240 / 4)',
    'Area of triangle with base 12cm and height 8cm',
    'Compound interest on $5000 at 5% for 3 years',
    'Derivative of f(x) = 3x^3 + 2x^2 - 5x + 7'
  ];

  const handleSolve = async (query = problem) => {
    if (!query.trim()) return;
    setIsSolving(true);
    try {
      const res = await queryQuickAi({
        prompt: query,
        mode: 'math',
        settings
      });
      setSolution(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSolving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto w-full px-2 sm:px-4 py-2">
      
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-color text-xs text-muted mb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="font-semibold text-primary">Math & Logic Solver</span>
          <span>•</span>
          <span>Step-by-step Analytics</span>
        </div>
      </div>

      {/* Input Box */}
      <div className="mb-4 border border-strong rounded-lg bg-card p-3 shadow-sm">
        <label className="block text-xs font-semibold text-muted mb-1">Enter Mathematical Equation or Logic Problem:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
            placeholder="e.g. 2x^2 + 5x - 3 = 0, or (45 * 12) / 3"
            className="input text-sm flex-1 font-mono"
          />
          <button
            onClick={() => handleSolve()}
            disabled={isSolving || !problem.trim()}
            className="btn btn-primary btn-sm"
          >
            {isSolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Calculator className="w-3.5 h-3.5" />}
            <span>Solve</span>
          </button>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-color text-xs">
          <span className="text-muted">Presets:</span>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setProblem(p);
                handleSolve(p);
              }}
              className="btn btn-sm text-[11px] font-mono"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Solution Display Area */}
      <div className="flex-1 border border-color rounded-lg bg-card p-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-color text-xs text-muted mb-3">
          <span className="font-semibold text-primary">STEP-BY-STEP SOLUTION</span>
          {solution && (
            <button onClick={handleCopy} className="btn btn-sm text-xs">
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Solution'}</span>
            </button>
          )}
        </div>

        {solution ? (
          <pre className="whitespace-pre-wrap font-mono text-xs text-primary leading-relaxed">
            {solution}
          </pre>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted text-xs">
            <Calculator className="w-8 h-8 mb-2 stroke-1" />
            <p>Enter an equation or click a preset above to calculate solutions with step-by-step breakdown.</p>
          </div>
        )}
      </div>

    </div>
  );
}
