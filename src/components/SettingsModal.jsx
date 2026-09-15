import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Settings, 
  Bell, 
  User, 
  Puzzle, 
  Mic, 
  CreditCard, 
  BarChart3, 
  TrendingUp, 
  Lock, 
  HardDrive, 
  Shield, 
  Key, 
  Users, 
  UserCheck, 
  Keyboard,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronDown,
  Info,
  Globe,
  Mail,
  Box,
  Plus
} from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  setSettings, 
  darkMode, 
  setDarkMode,
  userName = "Lama Bikal",
  userEmail = "bikallama73@gmail.com",
  userUsername = "@bikallama73"
}) {
  const [activeTab, setActiveTab] = useState('account');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMfaCard, setShowMfaCard] = useState(true);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);

  if (!isOpen) return null;

  const menuItems = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'personalization', label: 'Personalization', icon: User },
    { id: 'plugins', label: 'Plugins', icon: Puzzle },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'datacontrols', label: 'Data controls', icon: Lock },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'security', label: 'Security and login', icon: Key },
    { id: 'parental', label: 'Parental controls', icon: Users },
    { id: 'trusted', label: 'Trusted contact', icon: UserCheck },
    { id: 'account', label: 'Account', icon: User },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none">
      
      {/* Main Settings Dialog Container (Matches Screenshots 1, 2, 3) */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-3xl h-[90vh] max-h-[660px] shadow-2xl flex overflow-hidden text-[var(--text-primary)] relative">
        
        {/* Modal Left Navigation Sidebar */}
        <div className="w-56 sm:w-64 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] flex flex-col shrink-0">
          
          <div className="p-3.5 space-y-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings"
                className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--border-strong)] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isSelected 
                      ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold' 
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Modal Right Content Pane */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {menuItems.find(m => m.id === activeTab)?.label || 'Account'}
          </h2>

          {/* Account Tab (Exact Match to Screenshots #1, #2, #3) */}
          {activeTab === 'account' && (
            <div className="space-y-6 text-xs sm:text-sm">
              
              {/* Account General Fields */}
              <div className="space-y-4 divide-y divide-[var(--border-color)]">
                
                {/* Name */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-[var(--text-primary)]">Name</span>
                  <span className="text-[var(--text-muted)] font-normal">{userName}</span>
                </div>

                {/* Username */}
                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-[var(--text-primary)]">Username</span>
                  <button className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    <span>{userUsername}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-[var(--text-primary)]">Email</span>
                  <button className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    <span>{userEmail}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Age Verification */}
                <div className="flex items-center justify-between pt-3">
                  <div className="max-w-xs pr-4">
                    <div className="font-medium text-[var(--text-primary)]">Age verification</div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                      To help keep OMNIRA appropriate for everyone, some settings require age verification. <a href="#" className="underline">Learn more</a>.
                    </div>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity shrink-0">
                    Verify age
                  </button>
                </div>

                {/* Delete Account */}
                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-[var(--text-primary)]">Delete account</span>
                  <button className="px-4 py-1 rounded-full border border-red-500 text-red-500 font-semibold text-xs hover:bg-red-500/10 transition-colors shrink-0">
                    Delete
                  </button>
                </div>

              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border-color)] pt-4 space-y-4">
                
                {/* GPT Builder Profile Header */}
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                    GPT builder profile
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    Personalize your builder profile to connect with users of your GPTs. These settings apply to publicly shared GPTs.
                  </p>
                </div>

                {/* Preview Box (Matches Screenshot #2) */}
                <div className="p-4 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center relative space-y-2 py-6">
                  <span className="absolute right-4 top-3 text-[11px] text-[var(--text-muted)] font-medium">
                    Preview
                  </span>

                  <div className="w-12 h-12 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-muted)] shadow-2xs">
                    <Box className="w-6 h-6 stroke-[1.5]" />
                  </div>

                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    PlaceholderGPT
                  </div>

                  <div className="text-xs text-[var(--text-muted)]">
                    By community builder
                  </div>
                </div>

                {/* Info Alert Box (Matches Screenshot #2 & #3) */}
                <div className="p-3.5 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex items-start gap-3 text-xs text-[var(--text-muted)] leading-relaxed">
                  <Info className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                  <div>
                    Complete verification to publish GPTs to everyone. Verify your identity by adding billing details or verifying ownership of a public domain name.
                  </div>
                </div>

                {/* Links Section */}
                <div className="space-y-3 pt-2">
                  <div className="font-semibold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                    Links
                  </div>

                  {/* Globe Domain Link Dropdown */}
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)]">
                      <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <span>Select a domain</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      </button>

                      {/* Dropdown item (+ Verify new domain) */}
                      {isDomainDropdownOpen && (
                        <div className="absolute right-0 mt-1.5 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 shadow-xl z-30 animate-fade-in">
                          <button
                            onClick={() => {
                              setIsDomainDropdownOpen(false);
                              alert('Add a TXT record to your DNS provider to verify custom domain ownership.');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                          >
                            <Plus className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <span>Verify new domain</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GitHub Link */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-medium">
                      <svg className="w-4 h-4 fill-current text-[var(--text-muted)]" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      <span>GitHub</span>
                    </div>

                    <button className="px-3.5 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                      Add
                    </button>
                  </div>
                </div>

                {/* Email Section */}
                <div className="space-y-2 pt-2">
                  <div className="font-semibold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                    Email
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)]">
                    <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>{userEmail}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="receiveFeedback"
                      checked={receiveEmails}
                      onChange={(e) => setReceiveEmails(e.target.checked)}
                      className="rounded border-[var(--border-color)] accent-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="receiveFeedback" className="text-xs text-[var(--text-muted)] cursor-pointer">
                      Receive feedback emails
                    </label>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 text-xs sm:text-sm">
              {showMfaCard && (
                <div className="p-4 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] relative space-y-2">
                  <button 
                    onClick={() => setShowMfaCard(false)}
                    className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text-primary)]">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Secure your account</span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-md">
                    Add multi-factor authentication (MFA), like a text message or authenticator app, to help protect your account when logging in.
                  </p>

                  <div className="pt-1">
                    <button 
                      onClick={() => alert('Multi-factor authentication (MFA) is active.')}
                      className="px-3.5 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] font-semibold text-xs hover:bg-[var(--bg-hover)] transition-colors shadow-2xs"
                    >
                      Set up MFA
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 divide-y divide-[var(--border-color)]">
                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-[var(--text-primary)]">Appearance</span>
                  <select
                    value={darkMode ? 'dark' : 'light'}
                    onChange={(e) => setDarkMode(e.target.value === 'dark')}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)]"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-[var(--text-primary)]">Contrast</span>
                  <select className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)]">
                    <option value="system">System</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-[var(--text-primary)]">Accent color</span>
                  <select className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)]">
                    <option value="default">Default</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="font-medium text-[var(--text-primary)]">Language</span>
                  <select className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)]">
                    <option value="auto">Auto-detect</option>
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">Enable Dictation</div>
                    <div className="text-xs text-[var(--text-muted)]">Use dictation in the chat composer.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.enableDictation !== false} 
                      onChange={(e) => setSettings({ ...settings, enableDictation: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    OMNIRA Inference Engine Settings
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { id: 'quick-local-neural', name: 'OMNIRA Cloud & LPU Neural Engine (Default)', desc: '100% Real AI generation via Groq & OMNIRA neural processors.' },
                      { id: 'transformers-wasm', name: 'Browser WebAssembly (WASM) / WebGPU LLM', desc: 'Downloads and runs open-source LLMs inside browser WebAssembly memory.' },
                      { id: 'ollama-local', name: 'Local Ollama REST API (localhost:11434)', desc: 'Connects to your local Ollama server running Llama 3 or Qwen 2.' },
                      { id: 'gemini-api', name: 'Google Gemini REST API (Custom API Key)', desc: 'Uses your Gemini API key for real cloud LLM inference.' }
                    ].map((eng) => (
                      <div
                        key={eng.id}
                        onClick={() => setSettings({ ...settings, engineMode: eng.id })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          settings.engineMode === eng.id 
                            ? 'border-emerald-500 bg-emerald-500/10' 
                            : 'border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-xs text-[var(--text-primary)]">
                          <span>{eng.name}</span>
                          {settings.engineMode === eng.id && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">{eng.desc}</p>
                      </div>
                    ))}
                  </div>

                  {settings.engineMode === 'gemini-api' && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                        Enter Gemini API Key:
                      </label>
                      <input
                        type="password"
                        value={settings.apiKey || ''}
                        onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] outline-none font-mono"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Other Settings Tabs */}
          {activeTab !== 'general' && activeTab !== 'account' && (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-2">
              <Settings className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
              <div className="font-semibold text-sm text-[var(--text-primary)]">
                {menuItems.find(m => m.id === activeTab)?.label} Settings
              </div>
              <p>Active and configured for user account <strong>{userName}</strong> ({userEmail}).</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
