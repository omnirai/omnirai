import React, { useState } from 'react';
import { 
  X, 
  Search, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  Download, 
  Bug, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Copy, 
  ChevronRight, 
  ChevronDown, 
  AlertCircle, 
  Laptop, 
  Smartphone, 
  Apple, 
  Monitor, 
  Shield, 
  Lock, 
  Cpu, 
  Send,
  MessageSquare,
  BookOpen,
  Zap,
  Terminal,
  RefreshCw,
  Info
} from 'lucide-react';
import { OmniraIcon } from './OmniraLogo';

export default function LegalAndHelpModal({
  isOpen,
  onClose,
  initialTab = 'terms', // 'terms' | 'privacy' | 'help' | 'releasenotes' | 'downloadapps' | 'reportbug'
  currentUser,
  onOpenSettings
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState({ 0: true });

  // Bug Report Form State
  const [bugForm, setBugForm] = useState({
    category: 'ui',
    severity: 'medium',
    title: '',
    description: '',
    steps: '',
    email: currentUser?.email || ''
  });
  const [bugSubmitted, setBugSubmitted] = useState(false);

  // Sync initialTab when modal opens
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setBugSubmitted(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBugSubmit = (e) => {
    e.preventDefault();
    if (!bugForm.title.trim() || !bugForm.description.trim()) return;
    setBugSubmitted(true);
    setTimeout(() => {
      // Auto close or reset
    }, 3000);
  };

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: FileText, badge: 'Legal' },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, badge: 'GDPR' },
    { id: 'help', label: 'Help Center', icon: HelpCircle, badge: 'Guide' },
    { id: 'releasenotes', label: 'Release Notes', icon: Sparkles, badge: 'v3.4' },
    { id: 'downloadapps', label: 'Download Apps', icon: Download, badge: 'Desktop' },
    { id: 'reportbug', label: 'Report a Bug', icon: Bug, badge: 'Feedback' }
  ];

  const faqs = [
    {
      q: 'What AI models power OMNIRA AI?',
      a: 'OMNIRA AI incorporates multi-engine intelligence including GPT-4o, Claude 3.5 Sonnet, DeepSeek R1 deep reasoning, FLUX 1 Schnell ultra-HD image synthesis, and our native zero-latency client-side neural runtime.'
    },
    {
      q: 'Is my chat data used to train public AI models?',
      a: 'No. We enforce strict data privacy standards. Your private conversations, uploaded files, and custom project memory are never sold, shared, or used to train public foundation models.'
    },
    {
      q: 'How do daily image and chat quotas work on the Free plan?',
      a: 'Free accounts include 30 high-speed chat messages and 5 FLUX ultra-HD image generations per day. Quotas automatically reset daily at 00:00 UTC. Pro tier accounts receive high-capacity limits.'
    },
    {
      q: 'How do I run and test code in Codex Studio?',
      a: 'Switch to Codex in the sidebar to access the live compiler and interactive code execution sandbox. You can preview HTML, CSS, JavaScript, and run algorithms directly in real time.'
    },
    {
      q: 'Can I install OMNIRA AI as a Desktop or Mobile App?',
      a: 'Yes! OMNIRA AI supports Progressive Web App (PWA) installation for Windows, macOS, iOS, and Android. Click "Download Apps" in the menu for instant setup.'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-4xl h-[92vh] sm:h-[85vh] max-h-[720px] shadow-2xl flex flex-col md:flex-row overflow-hidden text-[var(--text-primary)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] flex flex-col shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <OmniraIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-tight">OMNIRA Legal & Support</span>
                <span className="text-[10px] text-[var(--text-muted)]">Terms, Privacy & Guides</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-neutral-900' : 'text-[var(--text-muted)]'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-900' 
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer inside Left Sidebar */}
          <div className="p-3 border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>OMNIRA v3.4.2</span>
            <span className="text-emerald-500 font-medium">● Systems Active</span>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[var(--bg-primary)]">
          
          {/* Top Title Bar */}
          <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-card)]/50 backdrop-blur-xs">
            <div>
              <h2 className="font-bold text-base text-[var(--text-primary)] capitalize">
                {tabs.find(t => t.id === activeTab)?.label || 'Information'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {activeTab === 'terms' && 'Official Terms & Conditions governing use of OMNIRA AI.'}
                {activeTab === 'privacy' && 'How we protect, encrypt, and handle your data and conversations.'}
                {activeTab === 'help' && 'Frequently asked questions, tutorials, and support assistance.'}
                {activeTab === 'releasenotes' && 'What is new in the latest versions and model updates.'}
                {activeTab === 'downloadapps' && 'Install OMNIRA on Windows, Mac, Linux, and Mobile.'}
                {activeTab === 'reportbug' && 'Submit issue reports and feature requests directly to our team.'}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy current URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-xs cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Document Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm leading-relaxed text-[var(--text-primary)]">
            
            {/* 1. TERMS OF SERVICE */}
            {activeTab === 'terms' && (
              <div className="space-y-6 max-w-2xl mx-auto text-justify [text-align-last:left] [text-justify:inter-word]">
                <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-xs flex items-start gap-3">
                  <Info className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-violet-700 dark:text-violet-300">Effective Date: September 2026</span>
                    <p className="text-[var(--text-muted)] mt-0.5">By accessing or using OMNIRA AI, you agree to be bound by these Terms of Service. Please read them thoroughly.</p>
                  </div>
                </div>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">1. Acceptance of Terms</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    By registering, logging into, or interacting with OMNIRA AI (accessible at omnira.ai and related services), you represent that you are at least 13 years old (or the applicable age of digital consent in your jurisdiction) and agree to comply with all terms and conditions set forth herein.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">2. AI Intelligence & Output Reliability</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    OMNIRA AI utilizes complex deep learning language and image generation models (including GPT-4o, Claude 3.5 Sonnet, DeepSeek R1, and FLUX 1 Schnell). While we strive for high precision, AI outputs are generated probabilistically and may contain factual inaccuracies or hallucinations. You are responsible for evaluating and verifying any code, medical, financial, or critical information produced by the service.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">3. User Ownership & Intellectual Property</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    <strong>Your Content:</strong> You retain full ownership and intellectual property rights to the prompts, code, documents, and assets you input into OMNIRA AI.<br />
                    <strong>Generated Artifacts:</strong> Subject to your compliance with these Terms, OMNIRA assigns to you all its right, title, and interest in and to the output generated by the AI for your prompts. You may use generated outputs for commercial and non-commercial purposes.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">4. Acceptable Use Policy</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    You agree not to use OMNIRA AI to generate, transmit, or assist in:
                  </p>
                  <ul className="list-disc pl-5 text-xs sm:text-sm text-[var(--text-muted)] space-y-1">
                    <li>Malicious software, exploits, automated vulnerability scans, or cyberattacks.</li>
                    <li>Unlawful, harassing, sexually explicit, defamatory, or harmful content.</li>
                    <li>Circumventing rate limits, quotas, or security safeguards.</li>
                    <li>Reverse-engineering the underlying platform binaries or infringing third-party rights.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">5. Subscriptions, Limits & Fair Use</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    Free accounts are allocated daily chat and image synthesis quotas. Pro tiers provide expanded limits and dedicated model routing. We reserve the right to throttle abusive automated traffic to maintain service stability for all users.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">6. Limitation of Liability</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, OMNIRA AI IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND. IN NO EVENT SHALL OMNIRA BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES RESULTING FROM YOUR USE OF THE SERVICE.
                  </p>
                </section>
              </div>
            )}

            {/* 2. PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 max-w-2xl mx-auto text-justify [text-align-last:left] [text-justify:inter-word]">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">Privacy First Commitment</span>
                    <p className="text-[var(--text-muted)] mt-0.5">We adhere to global privacy standards (GDPR, CCPA). Your privacy and data confidentiality are fundamental to our architecture.</p>
                  </div>
                </div>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">1. Information We Collect</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    <strong>Account Information:</strong> When signing in with Google or Email, we receive your name, email address, and profile picture.<br />
                    <strong>Chat & Studio Data:</strong> Prompts, conversations, and code files are processed to return answers and stored securely in your private browser storage / Firebase instance.<br />
                    <strong>Device Telemetry:</strong> Anonymized usage data (response times, error rates) to improve platform stability.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">2. Zero Training Policy on Private Chats</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    We do not use your private user prompts, conversation history, or uploaded documents to train public foundation models without your explicit opt-in consent.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">3. Data Storage & Encryption</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    All network traffic between your client and our inference gateway is encrypted using industry-standard TLS 1.3 encryption. Stored project data and uploaded images are protected using encrypted storage solutions.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">4. Your Data Rights & Account Deletion</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                    You have complete control over your data. At any time, you may:
                  </p>
                  <ul className="list-disc pl-5 text-xs sm:text-sm text-[var(--text-muted)] space-y-1">
                    <li>Export your complete chat history and saved projects in JSON format.</li>
                    <li>Clear your browser storage and chat cache directly from Settings.</li>
                    <li>Request permanent deletion of your account and associated records.</li>
                  </ul>
                </section>
              </div>
            )}

            {/* 3. HELP CENTER & FAQS */}
            {activeTab === 'help' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Search / Filter FAQ */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search help topics, models, or issues..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Frequently Asked Questions
                  </h3>

                  {faqs
                    .filter(f => !searchQuery || f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((faq, idx) => {
                      const isOpen = faqExpanded[idx];
                      return (
                        <div 
                          key={idx}
                          className="border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)] overflow-hidden transition-colors"
                        >
                          <button
                            onClick={() => setFaqExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="w-full px-4 py-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-color)]/60 text-justify [text-align-last:left] [text-justify:inter-word]">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Support Contact Banner */}
                <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-xs text-[var(--text-primary)]">Need personalized help?</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Our support engineers are available to resolve account and quota queries.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('reportbug')}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs cursor-pointer shrink-0 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}

            {/* 4. RELEASE NOTES */}
            {activeTab === 'releasenotes' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="space-y-4">
                  
                  {/* v3.4.2 */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono text-xs font-bold">
                          v3.4.2
                        </span>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">Custom 404, Justified Text & Legal Center</h3>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)]">September 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-xs text-[var(--text-muted)] space-y-1.5">
                      <li><strong>Custom 404 Error Experience:</strong> Beautiful cyberpunk route fallback with interactive AI prompt search and direct studio shortcuts.</li>
                      <li><strong>Justified Typography:</strong> All AI messages, markdown body, and answers formatted with justified alignment for optimal reading on desktop and mobile.</li>
                      <li><strong>Full-Screen Mobile Width:</strong> Maximized edge-to-edge responsiveness on mobile phone viewports.</li>
                      <li><strong>Dedicated Legal Center:</strong> Integrated Terms of Service, Privacy Policy, Release Notes, and Bug Reporting in the bottom user menu.</li>
                    </ul>
                  </div>

                  {/* v3.4.0 */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-[var(--text-muted)] font-mono text-xs font-bold">
                          v3.4.0
                        </span>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">FLUX 1 Schnell & SDXL Synthesis</h3>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)]">August 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-xs text-[var(--text-muted)] space-y-1.5">
                      <li>Automated prompt detection to instantly route graphic requests to Cloudflare FLUX AI.</li>
                      <li>Real-time image synthesis cards with HD download and prompt inspector.</li>
                      <li>Daily image quota sync and free tier allocation.</li>
                    </ul>
                  </div>

                  {/* v3.3.0 */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-[var(--text-muted)] font-mono text-xs font-bold">
                          v3.3.0
                        </span>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">Meet Voice Personas & Real-Time Audio</h3>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)]">July 2026</span>
                    </div>
                    <ul className="list-disc pl-5 text-xs text-[var(--text-muted)] space-y-1.5">
                      <li>10 lifelike voice personas (Ember, Breeze, Cove, Juniper, Sky, Sol, etc.).</li>
                      <li>Interactive audio visualizer orb with live speech recognition.</li>
                    </ul>
                  </div>

                </div>
              </div>
            )}

            {/* 5. DOWNLOAD APPS */}
            {activeTab === 'downloadapps' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Windows Card */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[var(--text-primary)]">Windows Desktop</h4>
                        <span className="text-[10px] text-[var(--text-muted)]">Windows 10 / 11 (64-bit)</span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Native desktop experience with global keyboard shortcuts and offline local neural engine support.</p>
                    <button
                      onClick={() => alert('OMNIRA Windows installer will download or install via PWA prompt.')}
                      className="w-full py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .EXE</span>
                    </button>
                  </div>

                  {/* macOS Card */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Apple className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[var(--text-primary)]">macOS Application</h4>
                        <span className="text-[10px] text-[var(--text-muted)]">Apple Silicon (M1/M2/M3) & Intel</span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Optimized Metal acceleration for ultra-fast local inference and Spotlight-style quick bar.</p>
                    <button
                      onClick={() => alert('OMNIRA macOS DMG is ready for download.')}
                      className="w-full py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .DMG</span>
                    </button>
                  </div>

                  {/* Mobile PWA Card */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between space-y-3 sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[var(--text-primary)]">iOS & Android Mobile Web App (PWA)</h4>
                        <span className="text-[10px] text-[var(--text-muted)]">No App Store download required • Zero Storage footprint</span>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] space-y-1">
                      <div>📱 <strong>iPhone / iPad:</strong> Open Safari, tap the <strong>Share</strong> button (box with up arrow), and select <strong>"Add to Home Screen"</strong>.</div>
                      <div>🤖 <strong>Android:</strong> Open Chrome, tap the <strong>⋮ (three dots)</strong> menu, and select <strong>"Install App"</strong>.</div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 6. REPORT A BUG */}
            {activeTab === 'reportbug' && (
              <div className="space-y-5 max-w-2xl mx-auto">
                {bugSubmitted ? (
                  <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">Bug Report Submitted!</h3>
                    <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                      Thank you for helping us improve OMNIRA AI. Our engineering team has received your ticket and diagnostic telemetry.
                    </p>
                    <button
                      onClick={() => {
                        setBugSubmitted(false);
                        setBugForm({ category: 'ui', severity: 'medium', title: '', description: '', steps: '', email: currentUser?.email || '' });
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold cursor-pointer"
                    >
                      Submit Another Report
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBugSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Issue Category</label>
                        <select
                          value={bugForm.category}
                          onChange={(e) => setBugForm({ ...bugForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none text-[var(--text-primary)]"
                        >
                          <option value="ui">UI & Layout</option>
                          <option value="model">AI Model Response</option>
                          <option value="image">Image Generation (FLUX)</option>
                          <option value="voice">Voice Mode & Audio</option>
                          <option value="performance">Performance & Latency</option>
                          <option value="other">Other Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Severity</label>
                        <select
                          value={bugForm.severity}
                          onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value })}
                          className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none text-[var(--text-primary)]"
                        >
                          <option value="low">Low (Cosmetic glitch)</option>
                          <option value="medium">Medium (Feature behavior)</option>
                          <option value="high">High (Broken feature)</option>
                          <option value="critical">Critical (Blocking usage)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Issue Title</label>
                      <input
                        type="text"
                        required
                        value={bugForm.title}
                        onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                        placeholder="Brief summary of what happened..."
                        className="w-full px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-violet-500 text-[var(--text-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Detailed Description</label>
                      <textarea
                        required
                        rows={4}
                        value={bugForm.description}
                        onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                        placeholder="Explain what occurred, what you expected, and any error message shown..."
                        className="w-full px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-violet-500 text-[var(--text-primary)] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Your Email (for resolution updates)</label>
                      <input
                        type="email"
                        value={bugForm.email}
                        onChange={(e) => setBugForm({ ...bugForm, email: e.target.value })}
                        placeholder="your-email@example.com"
                        className="w-full px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-violet-500 text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-500/25 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Bug Report</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}
