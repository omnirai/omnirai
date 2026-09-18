import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Runtime Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#0d0f12] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <img src="/omnira_ai.svg" alt="OMNIRA" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-xs text-neutral-400 max-w-md mb-4 leading-relaxed">
            An unexpected error occurred. Click below to reload OMNIRA AI smoothly.
          </p>

          {this.state.error && (
            <div className="max-w-xl w-full text-left bg-red-950/40 border border-red-800/50 rounded-xl p-3.5 mb-6 text-xs text-red-300 font-mono overflow-auto max-h-48">
              <div className="font-bold text-red-200 mb-1">{this.state.error.toString()}</div>
              {this.state.error.stack && (
                <div className="text-[10px] text-red-400/80 whitespace-pre-wrap">{this.state.error.stack}</div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2 rounded-full bg-white text-neutral-900 hover:bg-neutral-100 text-xs font-semibold transition-colors cursor-pointer shadow-md"
            >
              Clear Storage & Reset
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
