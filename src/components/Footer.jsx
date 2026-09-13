import React from 'react';
import { ShieldCheck, Terminal, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-color py-4 px-4 bg-card text-xs text-muted transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" />
          <span className="font-semibold text-primary">Quick AI</span>
          <span>•</span>
          <span>100% Free & Local AI System</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Zero 3rd-Party API Keys
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-secondary">Worldwide Offline-Ready Execution</span>
          <a
            href="https://bishalcodes.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline flex items-center gap-1"
          >
            Created by bishalcodes.com <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
