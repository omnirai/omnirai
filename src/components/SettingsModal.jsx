import React from 'react';
import { X, ShieldCheck, Cpu, Server, Zap, Check } from 'lucide-react';

export default function SettingsModal({ settings, setSettings, isOpen, onClose }) {
  if (!isOpen) return null;

  const engines = [
    {
      id: 'quick-local-neural',
      name: 'Quick AI Local Neural Engine',
      badge: 'Recommended • Instant',
      description: '100% Client-side instant reasoning, code generator, math solver, document processor & SVG drawer. Requires ZERO model downloads or API keys.',
      icon: Zap
    },
    {
      id: 'transformers-wasm',
      name: 'Local HuggingFace WASM / WebGPU',
      badge: 'Browser WebAssembly LLM',
      description: 'Downloads small open-source LLMs (Qwen 0.5B / Flan-T5) to run directly inside browser WASM/WebGPU memory.',
      icon: Cpu
    },
    {
      id: 'ollama-local',
      name: 'Local Ollama Connection',
      badge: 'Self-Hosted REST Server',
      description: 'Connects to your local Ollama server running on http://localhost:11434 (e.g. Llama 3, Qwen 2, Mistral).',
      icon: Server
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-strong rounded-lg max-w-xl w-full p-5 shadow-lg flex flex-col gap-4 text-primary">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-color pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-sm font-bold">Quick AI Engine Settings</h2>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted">SELECT LOCAL INFERENCE ENGINE:</label>
          <div className="space-y-2">
            {engines.map((eng) => {
              const Icon = eng.icon;
              const isSelected = settings.engineMode === eng.id;
              return (
                <div
                  key={eng.id}
                  onClick={() => setSettings({ ...settings, engineMode: eng.id })}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? 'border-strong bg-secondary shadow-sm' : 'border-color hover:border-strong'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Icon className="w-4 h-4" />
                      <span>{eng.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      isSelected ? 'bg-primary text-secondary border-strong font-bold' : 'border-color text-muted'
                    }`}>
                      {eng.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed pl-6">{eng.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* WASM Model options if selected */}
        {settings.engineMode === 'transformers-wasm' && (
          <div className="p-3 border border-color rounded-lg bg-secondary text-xs space-y-2">
            <label className="block font-semibold">Select Browser WASM Model:</label>
            <select
              value={settings.modelName}
              onChange={(e) => setSettings({ ...settings, modelName: e.target.value })}
              className="input text-xs"
            >
              <option value="Xenova/Qwen1.5-0.5B-Chat">Xenova/Qwen1.5-0.5B-Chat (Lightweight & Fast)</option>
              <option value="Xenova/LaMini-Flan-T5-778M">Xenova/LaMini-Flan-T5-778M (Instruction Follower)</option>
              <option value="Xenova/distilgpt2">Xenova/distilgpt2 (Ultra Small 300MB)</option>
            </select>
          </div>
        )}

        {/* Ollama options if selected */}
        {settings.engineMode === 'ollama-local' && (
          <div className="p-3 border border-color rounded-lg bg-secondary text-xs space-y-2">
            <div>
              <label className="block font-semibold mb-1">Ollama Server Endpoint:</label>
              <input
                type="text"
                value={settings.ollamaUrl}
                onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="input text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Local Model Tag:</label>
              <input
                type="text"
                value={settings.ollamaModel}
                onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                placeholder="llama3"
                className="input text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Temperature slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <label>Temperature (Creativity):</label>
            <span className="font-mono">{settings.temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.temperature}
            onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-color flex items-center justify-between text-xs">
          <span className="text-muted">Zero API Key Privacy Assurance • bishalcodes.com</span>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            <Check className="w-3.5 h-3.5" /> Save & Close
          </button>
        </div>

      </div>
    </div>
  );
}
