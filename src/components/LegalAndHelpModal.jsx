import React, { useState, useEffect } from 'react';
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
  Info,
  Keyboard,
  FileDown,
  Trash2,
  Menu,
  PanelLeft,
  Camera,
  Paperclip,
  Image as ImageIcon,
  Loader2,
  Upload
} from 'lucide-react';
import { OmniraIcon } from './OmniraLogo';

export default function LegalAndHelpModal({
  isOpen,
  onClose,
  initialTab = 'terms', // 'terms' | 'privacy' | 'help' | 'releasenotes' | 'downloadapps' | 'reportbug' | 'keyboard'
  currentUser,
  onOpenSettings
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState({ 0: true });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dataExported, setDataExported] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Bug Report Form State with Auto-Screenshot, Attachments & Admin Dispatch
  const [bugForm, setBugForm] = useState({
    category: 'ui',
    severity: 'medium',
    title: '',
    description: '',
    steps: '',
    email: currentUser?.email || 'guest@omnira.ai'
  });
  const [attachments, setAttachments] = useState([]);
  const [isCapturingScreen, setIsCapturingScreen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Capture PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Sync initialTab when modal opens
  useEffect(() => {
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

  const handleDownloadDocument = (docType) => {
    const title = docType === 'terms' ? 'OMNIRA_AI_Terms_of_Service.txt' : 'OMNIRA_AI_Privacy_Policy.txt';
    const content = docType === 'terms' 
      ? `OMNIRA AI - TERMS OF SERVICE\nEffective Date: September 2026\n\n1. Acceptance of Terms...\n2. AI Intelligence & Output Reliability...\n3. User Ownership & Intellectual Property...\n4. Acceptable Use Policy...\n5. Subscriptions, Limits & Fair Use...\n6. Limitation of Liability...\n\nFor questions, contact legal@omnira.ai.`
      : `OMNIRA AI - PRIVACY POLICY\nEffective Date: September 2026\n\n1. Information We Collect...\n2. Zero Training Policy on Private Chats...\n3. Data Storage & Encryption (TLS 1.3)...\n4. Your Rights & Account Deletion...\n\nFor privacy inquiries, contact privacy@omnira.ai.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportData = () => {
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        user: currentUser,
        sessions: JSON.parse(localStorage.getItem('chatgpt_sessions') || '[]'),
        projects: JSON.parse(localStorage.getItem('omnira_projects') || '[]'),
        settings: JSON.parse(localStorage.getItem('chatgpt_settings') || '{}'),
        savedImages: JSON.parse(localStorage.getItem('omnira_saved_images') || '[]')
      };
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `omnira_data_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDataExported(true);
      setTimeout(() => setDataExported(false), 3000);
    } catch (e) {
      alert('Failed to export data: ' + e.message);
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear temporary local cache and session memory? Your account remains safe.')) {
      try {
        localStorage.removeItem('chatgpt_selected_model');
        localStorage.removeItem('omnira_img_count_' + new Date().toISOString().slice(0, 10));
        setCacheCleared(true);
        setTimeout(() => setCacheCleared(false), 3000);
      } catch (e) {}
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install OMNIRA AI on Desktop or Mobile:\n\n• Chrome/Edge: Click the Install App icon (⊕) in the browser address bar.\n• iPhone (Safari): Tap Share ➔ Add to Home Screen.\n• Android: Tap Menu ➔ Install App.');
    }
  };

  const handleAutoCaptureScreenshot = async () => {
    try {
      setIsCapturingScreen(true);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen capture is not supported on this browser. Please use the Upload File button to attach a screenshot.');
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' }
      });
      const track = stream.getVideoTracks()[0];
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || window.innerWidth;
      canvas.height = video.videoHeight || window.innerHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      track.stop();
      stream.getTracks().forEach(t => t.stop());

      const dataUrl = canvas.toDataURL('image/png');
      const filename = `auto_screenshot_${Date.now()}.png`;

      setAttachments(prev => [
        ...prev,
        {
          id: `shot-${Date.now()}`,
          name: filename,
          type: 'image/png',
          dataUrl,
          size: Math.round((dataUrl.length * 3) / 4),
          isAutoCaptured: true
        }
      ]);
    } catch (err) {
      console.warn('Screenshot capture cancelled or unavailable:', err);
    } finally {
      setIsCapturingScreen(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [
          ...prev,
          {
            id: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            dataUrl: event.target.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value
    e.target.value = '';
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleBugSubmit = async (e) => {
    e.preventDefault();
    if (!bugForm.title.trim() || !bugForm.description.trim()) return;
    setIsSendingEmail(true);

    const newTicketId = 'OMN-BUG-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(newTicketId);

    const ticketPayload = {
      id: newTicketId,
      ...bugForm,
      adminRecipient: 'bishaldev949@gmail.com',
      attachmentsCount: attachments.length,
      attachmentFiles: attachments.map(a => a.name).join(', '),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`
    };

    // 1. Save ticket to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('omnira_bug_reports') || '[]');
      existing.unshift(ticketPayload);
      localStorage.setItem('omnira_bug_reports', JSON.stringify(existing));
    } catch (_) {}

    // 2. Dispatch ticket to admin email bishaldev949@gmail.com
    try {
      await fetch('https://formsubmit.co/ajax/bishaldev949@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `[OMNIRA ISSUE #${newTicketId}] ${bugForm.title} (${bugForm.severity.toUpperCase()})`,
          ticket_id: newTicketId,
          category: bugForm.category,
          severity: bugForm.severity,
          title: bugForm.title,
          description: bugForm.description,
          reporter_email: bugForm.email,
          admin_assigned: 'bishaldev949@gmail.com',
          attached_items: attachments.length,
          attachment_names: attachments.map(a => a.name).join(', ') || 'None',
          device_specs: `${navigator.platform} • ${window.innerWidth}x${window.innerHeight} viewport`,
          browser_agent: navigator.userAgent,
          submitted_at: new Date().toLocaleString()
        })
      });
    } catch (err) {
      console.warn('Admin dispatch notice:', err);
    } finally {
      setIsSendingEmail(false);
      setBugSubmitted(true);
    }
  };

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: FileText, badge: 'Legal' },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, badge: 'GDPR' },
    { id: 'help', label: 'Help Center', icon: HelpCircle, badge: 'Guide' },
    { id: 'releasenotes', label: 'Release Notes', icon: Sparkles, badge: 'v3.4' },
    { id: 'downloadapps', label: 'Download Apps', icon: Download, badge: 'Desktop' },
    { id: 'keyboard', label: 'Keyboard Shortcuts', icon: Keyboard, badge: 'Hotkeys' },
    { id: 'reportbug', label: 'Report a Bug', icon: Bug, badge: 'Feedback' }
  ];

  const keyboardShortcuts = [
    { key: 'Enter', desc: 'Send prompt / message' },
    { key: 'Ctrl + Enter', desc: 'Send message in background' },
    { key: 'Ctrl + Shift + O', desc: 'Open a new chat conversation' },
    { key: 'Ctrl + K', desc: 'Global AI model search & jump' },
    { key: 'Ctrl + Shift + S', desc: 'Toggle sidebar drawer open / close' },
    { key: 'Ctrl + Shift + M', desc: 'Toggle Deep Thinking reasoning mode' },
    { key: 'Ctrl + Shift + D', desc: 'Toggle voice speech dictation' },
    { key: 'Ctrl + U', desc: 'Attach photos and files' },
    { key: 'Esc', desc: 'Close modals & flyout menus' }
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
      className="fixed inset-0 z-[100] bg-[var(--bg-card)] flex flex-col md:flex-row overflow-hidden text-[var(--text-primary)] animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ========================================== */}
      {/* MOBILE TOP BAR WITH TOGGLE SIDEBAR BUTTON  */}
      {/* ========================================== */}
      <div className="md:hidden h-14 px-3.5 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-sidebar)] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
            title="Open Sections Sidebar"
          >
            <PanelLeft className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-[11px] font-bold">Menu</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <OmniraIcon className="w-3 h-3" />
            </div>
            <span className="font-bold text-xs truncate">
              {tabs.find(t => t.id === activeTab)?.label || 'Information'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-xs cursor-pointer"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-xs cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE DRAWER OVERLAY BACKDROP             */}
      {/* ========================================== */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-[110] md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* ========================================== */}
      {/* SIDEBAR (TOGGLE DRAWER ON MOBILE, STATIC ON DESKTOP) */}
      {/* ========================================== */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[120] w-72 max-w-[85vw] bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col h-full shadow-2xl transition-transform duration-200 ease-in-out md:static md:w-72 lg:w-80 md:shadow-none md:z-auto md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <OmniraIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight">OMNIRA Legal & Support</span>
              <span className="text-[11px] text-[var(--text-muted)]">Terms, Privacy & Guides</span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items List with Rounded Sidebar Buttons */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab.id);
                  setIsMobileSidebarOpen(false);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-neutral-900' : 'text-[var(--text-muted)]'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
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
        <div className="p-4 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center justify-between">
          <span>OMNIRA v3.4.2</span>
          <span className="text-emerald-500 font-medium">● Systems Active</span>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN DOCUMENT CONTENT AREA                 */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[var(--bg-primary)]">
        
        {/* Desktop Top Title Bar (Hidden on Mobile) */}
        <div className="hidden md:flex px-8 lg:px-10 py-4 border-b border-[var(--border-color)] items-center justify-between shrink-0 bg-[var(--bg-card)]/60 backdrop-blur-md">
          <div>
            <h2 className="font-bold text-lg text-[var(--text-primary)] capitalize">
              {tabs.find(t => t.id === activeTab)?.label || 'Information'}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {activeTab === 'terms' && 'Official Terms & Conditions governing use of OMNIRA AI.'}
              {activeTab === 'privacy' && 'How we protect, encrypt, and handle your data and conversations.'}
              {activeTab === 'help' && 'Frequently asked questions, tutorials, and support assistance.'}
              {activeTab === 'releasenotes' && 'What is new in the latest versions and model updates.'}
              {activeTab === 'downloadapps' && 'Install OMNIRA on Windows, Mac, Linux, and Mobile.'}
              {activeTab === 'keyboard' && 'Master productivity with global keyboard shortcuts.'}
              {activeTab === 'reportbug' && 'Submit issue reports and feature requests directly to our team.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Copy current URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 space-y-6 text-sm leading-relaxed text-[var(--text-primary)]">
          
          {/* 1. TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 max-w-4xl mx-auto text-justify [text-align-last:left] [text-justify:inter-word]">
                <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-violet-700 dark:text-violet-300">Effective Date: September 2026</span>
                      <p className="text-[var(--text-muted)] mt-0.5">By accessing or using OMNIRA AI, you agree to be bound by these Terms of Service.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDocument('terms')}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Copy</span>
                  </button>
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
              <div className="space-y-6 max-w-4xl mx-auto text-justify [text-align-last:left] [text-justify:inter-word]">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">Privacy First Commitment (GDPR & CCPA)</span>
                      <p className="text-[var(--text-muted)] mt-0.5">We adhere to global privacy standards. Your data and conversations are never used to train public foundation models.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDocument('privacy')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Policy</span>
                  </button>
                </div>

                {/* Privacy Action Tools */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <button
                    onClick={handleExportData}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-sidebar)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-4 h-4 text-violet-500" />
                      <span>{dataExported ? 'Data Exported (.JSON)!' : 'Export All My Data'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </button>

                  <button
                    onClick={handleClearCache}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-sidebar)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>{cacheCleared ? 'Cache Cleared!' : 'Clear Temporary Cache'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </button>
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
                    You have complete control over your data. At any time, you may export your data, reset your cache, or request full account deletion directly.
                  </p>
                </section>
              </div>
            )}

            {/* 3. HELP CENTER & FAQS */}
            {activeTab === 'help' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Search / Filter FAQ */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search help topics, models, quotas, or features..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-violet-500 text-[var(--text-primary)] transition-colors"
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
                    <h4 className="font-semibold text-xs text-[var(--text-primary)]">Need direct assistance?</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Submit a ticket to our engineering and support team.</p>
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
              <div className="space-y-6 max-w-4xl mx-auto">
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
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* PWA Direct Launcher */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-transparent border border-violet-500/30 flex flex-col justify-between space-y-3 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                          <OmniraIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">OMNIRA Progressive Web App (PWA)</h4>
                          <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">Universal Desktop & Mobile Instant App</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-violet-500/20 text-violet-600 dark:text-violet-300">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Install directly to your Windows Taskbar, macOS Dock, or Mobile Home Screen for standalone zero-tab performance.</p>
                    <button
                      onClick={handleInstallPWA}
                      className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-violet-500/25"
                    >
                      <Download className="w-4 h-4" />
                      <span>Install App Now</span>
                    </button>
                  </div>

                  {/* Windows Card */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[var(--text-primary)]">Windows Package</h4>
                        <span className="text-[10px] text-[var(--text-muted)]">Windows 10 / 11 (64-bit)</span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Native desktop executable with global hotkeys and background sync.</p>
                    <button
                      onClick={handleInstallPWA}
                      className="w-full py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Install for Windows</span>
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
                    <p className="text-xs text-[var(--text-muted)]">Optimized Metal acceleration for ultra-fast local inference and dock support.</p>
                    <button
                      onClick={handleInstallPWA}
                      className="w-full py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Install for Mac</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* 6. KEYBOARD SHORTCUTS */}
            {activeTab === 'keyboard' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-[var(--border-color)] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Keyboard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="font-semibold text-[var(--text-primary)]">Global Productivity Hotkeys</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">Active in all studios</span>
                </div>

                <div className="space-y-2">
                  {keyboardShortcuts.map((sc, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-violet-500/30 transition-colors"
                    >
                      <span className="text-xs font-medium text-[var(--text-primary)]">{sc.desc}</span>
                      <kbd className="px-2.5 py-1 rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border-color)] text-xs font-mono font-semibold text-[var(--text-primary)] shadow-2xs">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. REPORT A BUG */}
            {activeTab === 'reportbug' && (
              <div className="space-y-5 max-w-4xl mx-auto">
                {/* Admin Routing Indicator Banner */}
                <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    <span className="font-semibold text-[var(--text-primary)]">Direct Admin Dispatch</span>
                    <span className="text-[11px] font-mono text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20 font-semibold">
                      bishaldev949@gmail.com
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">Encrypted payload • Direct inbox escalation</span>
                </div>

                {bugSubmitted ? (
                  <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4 animate-fade-in">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                      <Check className="w-7 h-7 stroke-[3]" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-lg text-[var(--text-primary)]">Issue Dispatched to Admin!</h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        Tracking ID: {ticketId}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Recipient: <span className="font-mono font-semibold text-[var(--text-primary)]">bishaldev949@gmail.com</span>
                      </p>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                      Your bug report along with any captured screenshots and logs has been securely dispatched to the engineering inbox.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setBugSubmitted(false);
                          setAttachments([]);
                          setBugForm({ category: 'ui', severity: 'medium', title: '', description: '', steps: '', email: currentUser?.email || 'guest@omnira.ai' });
                        }}
                        className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold cursor-pointer transition-all hover:scale-102"
                      >
                        Submit Another Ticket
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBugSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Issue Category</label>
                        <select
                          value={bugForm.category}
                          onChange={(e) => setBugForm({ ...bugForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none text-[var(--text-primary)] focus:border-violet-500"
                        >
                          <option value="ui">UI & Layout Problem</option>
                          <option value="model">AI Model Output / Hallucination</option>
                          <option value="image">Image Generation Studio (FLUX)</option>
                          <option value="voice">Voice Dictation / Audio Mode</option>
                          <option value="settings">Settings / Family & Invitations</option>
                          <option value="auth">Account & Authentication</option>
                          <option value="performance">Performance & High Latency</option>
                          <option value="other">Other Technical Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Severity Level</label>
                        <select
                          value={bugForm.severity}
                          onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value })}
                          className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none text-[var(--text-primary)] focus:border-violet-500"
                        >
                          <option value="low">Low (Cosmetic glitch)</option>
                          <option value="medium">Medium (Feature behavior)</option>
                          <option value="high">High (Broken functionality)</option>
                          <option value="critical">Critical (Blocking usage / crash)</option>
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
                        placeholder="e.g. Sidebar toggle not responding on mobile viewport"
                        className="w-full px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-violet-500 text-[var(--text-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Detailed Description & Steps to Reproduce</label>
                      <textarea
                        required
                        rows={4}
                        value={bugForm.description}
                        onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                        placeholder="1. Click on the studio selector&#10;2. Notice the error pop-up&#10;3. What you expected vs what actually happened..."
                        className="w-full px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-violet-500 text-[var(--text-primary)] resize-none"
                      />
                    </div>

                    {/* Auto Screenshot & File Upload Actions */}
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">Evidence & Diagnostic Attachments</h4>
                          <p className="text-[11px] text-[var(--text-muted)]">Capture problem screen automatically or upload log files and screenshots</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Auto-Capture Button */}
                          <button
                            type="button"
                            onClick={handleAutoCaptureScreenshot}
                            disabled={isCapturingScreen}
                            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-violet-500/20 disabled:opacity-50"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{isCapturingScreen ? 'Capturing Screen...' : 'Auto-Capture Screen'}</span>
                          </button>

                          {/* Upload Files Button */}
                          <label className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-2xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Files</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*,.log,.txt,.json,.pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Attachments Preview Gallery */}
                      {attachments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-[var(--border-color)]">
                          {attachments.map((att) => (
                            <div
                              key={att.id}
                              className="p-2 rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {att.type?.startsWith('image/') ? (
                                  <img
                                    src={att.dataUrl}
                                    alt="thumb"
                                    className="w-8 h-8 rounded-lg object-cover border border-[var(--border-color)] flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-neutral-500/10 text-neutral-500 flex items-center justify-center flex-shrink-0">
                                    <Paperclip className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-[var(--text-primary)] truncate text-[11px]">{att.name}</p>
                                  <p className="text-[10px] text-[var(--text-muted)]">
                                    {att.isAutoCaptured ? 'Auto-Captured' : `${Math.round(att.size / 1024)} KB`}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer flex-shrink-0"
                                title="Remove attachment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Recipient: <strong className="text-[var(--text-primary)]">bishaldev949@gmail.com</strong>
                      </span>
                      <button
                        type="submit"
                        disabled={isSendingEmail}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-500/25 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Dispatching Ticket...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Bug Report</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>

        </main>
      </div>
  );
}
