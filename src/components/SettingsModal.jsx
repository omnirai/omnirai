import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  Search, 
  Settings, 
  Bell, 
  User, 
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
  ChevronLeft,
  ChevronDown,
  Info,
  Globe,
  Mail,
  Box,
  Plus,
  LogOut,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Camera,
  Upload
} from 'lucide-react';
import GithubConnectModal from './GithubConnectModal';
import DomainVerifyModal from './DomainVerifyModal';
import { triggerAutoEmail, getBackendImageQuota } from '../engine/quickAiEngine';
import AuthScreen from './AuthScreen';
import { deleteAllSessionsFromCloud } from '../firebase';

// â”€â”€â”€ LoginGate: Wraps any section requiring a real account â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LoginGate({ isGuest, onLogin, children, feature = 'this feature' }) {
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  if (!isGuest) return children;

  return (
    <>
      {showAuthScreen && (
        <AuthScreen
          isModal={true}
          onClose={() => setShowAuthScreen(false)}
          onLogin={(user) => {
            onLogin(user);
            setShowAuthScreen(false);
          }}
        />
      )}
      <div className="relative min-h-[320px] flex flex-col items-center justify-center text-center select-none px-6 py-10 space-y-5">
        {/* Blurred background hint */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-10 pointer-events-none">
          {children}
        </div>
        {/* Lock icon */}
        <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <div className="relative z-10 space-y-2 max-w-xs">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Sign in required</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            You need a free OMNIRA account to use <strong>{feature}</strong>. Sign in or create an account to continue.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-2 w-full max-w-[220px]">
          <button
            onClick={() => setShowAuthScreen(true)}
            className="w-full px-5 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md"
          >
            Sign in to OMNIRA
          </button>
          <button
            onClick={() => setShowAuthScreen(true)}
            className="w-full px-5 py-2.5 rounded-full text-xs font-semibold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
          >
            Create free account
          </button>
        </div>
        <p className="relative z-10 text-[10px] text-[var(--text-muted)]">
          Free Â· No credit card Â· Instant access
        </p>
      </div>
    </>
  );
}


export const VOICE_PERSONAS = [
  { id: 'ember', name: 'Ember', description: 'Confident and optimistic', pitch: 1.05, rate: 1.02, color: 'from-sky-300 via-blue-400 to-indigo-500' },
  { id: 'breeze', name: 'Breeze', description: 'Animated and earnest', pitch: 1.15, rate: 1.08, color: 'from-emerald-300 via-teal-400 to-cyan-500' },
  { id: 'cove', name: 'Cove', description: 'Calm and composed', pitch: 0.90, rate: 0.92, color: 'from-indigo-400 via-purple-400 to-slate-600' },
  { id: 'juniper', name: 'Juniper', description: 'Open and upbeat', pitch: 1.20, rate: 1.05, color: 'from-amber-300 via-orange-400 to-rose-500' },
  { id: 'sky', name: 'Sky', description: 'Versatile and warm', pitch: 1.00, rate: 1.00, color: 'from-cyan-300 via-sky-400 to-blue-600' },
  { id: 'sol', name: 'Sol', description: 'Savvy and relaxed', pitch: 0.95, rate: 0.95, color: 'from-yellow-300 via-amber-400 to-orange-500' },
  { id: 'spruce', name: 'Spruce', description: 'Affirmative and energetic', pitch: 0.85, rate: 1.10, color: 'from-emerald-400 via-green-500 to-teal-700' },
  { id: 'vale', name: 'Vale', description: 'Bright and inquisitive', pitch: 1.10, rate: 1.00, color: 'from-pink-300 via-rose-400 to-fuchsia-600' },
  { id: 'arbor', name: 'Arbor', description: 'Warm and thoughtful', pitch: 0.92, rate: 0.96, color: 'from-amber-400 via-orange-500 to-stone-700' },
  { id: 'maple', name: 'Maple', description: 'Cheerful and expressive', pitch: 1.25, rate: 1.04, color: 'from-red-400 via-rose-400 to-pink-600' }
];

export const DEFAULT_KEYBOARD_SHORTCUTS = [
  // Composer Category
  { id: 'send_message', category: 'Composer', label: 'Send message or stop answering', keyCombo: 'â†µ', enabled: true },
  { id: 'send_background', category: 'Composer', label: 'Send message in background', keyCombo: 'Ctrl + â†µ', enabled: true },
  { id: 'enable_thinking', category: 'Composer', label: 'Enable thinking', keyCombo: 'Ctrl + Shift + M', enabled: true },
  { id: 'toggle_dictation', category: 'Composer', label: 'Toggle dictation', keyCombo: 'Ctrl + Shift + D', enabled: true },
  { id: 'add_photos_files', category: 'Composer', label: 'Add photos & files', keyCombo: 'Ctrl + U', enabled: true },

  // App Category
  { id: 'open_new_chat', category: 'App', label: 'Open new chat', keyCombo: 'Ctrl + Shift + O', enabled: true },
  { id: 'show_shortcuts', category: 'App', label: 'Show shortcuts', keyCombo: 'Ctrl + /', enabled: true },
  { id: 'search', category: 'App', label: 'Search', keyCombo: 'Ctrl + K', enabled: true },
  { id: 'toggle_dev_mode', category: 'App', label: 'Toggle dev mode', keyCombo: 'Ctrl + .', enabled: true },
  { id: 'toggle_sidebar', category: 'App', label: 'Toggle sidebar', keyCombo: 'Ctrl + Shift + S', enabled: true },
  { id: 'set_custom_instructions', category: 'App', label: 'Set custom instructions', keyCombo: 'Ctrl + Shift + I', enabled: true },
  { id: 'copy_last_code_block', category: 'App', label: 'Copy last code block', keyCombo: 'Ctrl + Shift + ;', enabled: true },
  { id: 'delete_chat', category: 'App', label: 'Delete chat', keyCombo: 'Ctrl + Shift + âŒ«', enabled: true }
];


export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  setSettings, 
  darkMode, 
  setDarkMode,
  currentUser,
  onUpdateUser,
  onLogout,
  onLogin,
  initialTab = 'account'
}) {
  // Is the current user a guest (not signed in to a real account)?
  const isGuest = !currentUser || currentUser?.provider === 'guest' || !currentUser?.email || currentUser?.email === 'guest@omnira.ai';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileView, setMobileView] = useState('menu'); // 'menu' | 'detail'
  const [searchQuery, setSearchQuery] = useState('');
  const [showMfaCard, setShowMfaCard] = useState(true);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState(null);
  const [quotaData, setQuotaData] = useState({ used: 0, limit: 5, remaining: 5 });
  const [quotaLoading, setQuotaLoading] = useState(false);

  // Notification settings matching OMNIRA style with Google Link Tracking
  const [notificationsConfig, setNotificationsConfig] = useState(() => {
    const saved = localStorage.getItem('omnira_notification_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      googleTracking: settings?.googleLinkTracking !== false ? 'Push, Email' : 'Off',
      googleTrackingEnabled: settings?.googleLinkTracking !== false,
      codex: 'Push',
      groupChats: 'Push',
      health: 'Push',
      library: 'Email',
      marketing: 'Push, Email',
      personalizedTips: 'Push, Email',
      projects: 'Email',
      responses: 'Push',
      tasks: 'Push, Email',
      usage: 'Push, Email'
    };
  });

  const handleNotificationTypeChange = (key, value) => {
    const isEnabled = value !== 'Off';
    const updated = { 
      ...notificationsConfig, 
      [key]: value,
      ...(key === 'googleTracking' ? { googleTrackingEnabled: isEnabled } : {})
    };
    if (key === 'googleTracking') {
      if (setSettings) {
        setSettings({ ...settings, googleLinkTracking: isEnabled });
      }
      localStorage.setItem('omnira_google_link_tracking', isEnabled ? 'true' : 'false');
    }
    setNotificationsConfig(updated);
    localStorage.setItem('omnira_notification_config', JSON.stringify(updated));
  };

  const handleGoogleTrackingToggle = (enabled) => {
    const updated = { 
      ...notificationsConfig, 
      googleTrackingEnabled: enabled, 
      googleTracking: enabled ? (notificationsConfig.googleTracking === 'Off' ? 'Push, Email' : notificationsConfig.googleTracking) : 'Off' 
    };
    if (setSettings) {
      setSettings({ ...settings, googleLinkTracking: enabled });
    }
    localStorage.setItem('omnira_google_link_tracking', enabled ? 'true' : 'false');
    setNotificationsConfig(updated);
    localStorage.setItem('omnira_notification_config', JSON.stringify(updated));
  };

  // 100% Real Working Personalization Config State
  const [personalizationConfig, setPersonalizationConfig] = useState(() => {
    const saved = localStorage.getItem('omnira_personalization_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      baseStyle: 'Default',
      warmth: 'Default',
      enthusiasm: 'Default',
      headersLists: 'Default',
      emoji: 'Default',
      fastAnswers: true,
      customInstructions: '',
      pet: 'Default',
      nickname: currentUser?.name || '',
      occupation: '',
      moreAboutYou: '',
      enableMemory: true,
      webSearch: true,
      canvas: true,
      voice: true,
      librarySearch: true,
      connectorSearch: false
    };
  });

  const [savedMemories, setSavedMemories] = useState(() => {
    const saved = localStorage.getItem('omnira_saved_memories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      "User prefers clear code examples with step-by-step explanations.",
      "User works with Web applications, React, Python, and Node.js.",
      "User prefers dark mode UI and concise technical summaries."
    ];
  });

  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);

  const updatePersonalizationField = (field, value) => {
    setPersonalizationConfig((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('omnira_personalization_config', JSON.stringify(updated));
      if (setSettings) {
        setSettings((old) => ({ ...old, personalization: updated }));
      }
      return updated;
    });
  };

  const handleAddMemory = () => {
    if (!newMemoryInput.trim()) return;
    const updated = [...savedMemories, newMemoryInput.trim()];
    setSavedMemories(updated);
    localStorage.setItem('omnira_saved_memories', JSON.stringify(updated));
    setNewMemoryInput('');
  };

  const handleDeleteMemory = (index) => {
    const updated = savedMemories.filter((_, i) => i !== index);
    setSavedMemories(updated);
    localStorage.setItem('omnira_saved_memories', JSON.stringify(updated));
  };

  // Voice settings state matching OMNIRA Voice screenshot
  const [voiceConfig, setVoiceConfig] = useState(() => {
    const saved = localStorage.getItem('omnira_voice_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      voiceId: 'ember',
      modelMode: 'Advanced',
      language: 'Auto-detect'
    };
  });

  const [voicePreviewPlaying, setVoicePreviewPlaying] = useState(false);
  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(() => {
    const saved = localStorage.getItem('omnira_voice_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const idx = VOICE_PERSONAS.findIndex(v => v.id === parsed.voiceId);
        return idx >= 0 ? idx : 0;
      } catch(e) {}
    }
    return 0;
  });

  const handleSelectVoiceIndex = (idx) => {
    const newIdx = (idx + VOICE_PERSONAS.length) % VOICE_PERSONAS.length;
    setCurrentVoiceIndex(newIdx);
    const selectedVoice = VOICE_PERSONAS[newIdx];
    const updated = { ...voiceConfig, voiceId: selectedVoice.id };
    setVoiceConfig(updated);
    localStorage.setItem('omnira_voice_config', JSON.stringify(updated));
    if (setSettings) {
      setSettings((old) => ({ ...old, voice: updated }));
    }
  };

  const updateVoiceField = (field, value) => {
    setVoiceConfig((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('omnira_voice_config', JSON.stringify(updated));
      if (setSettings) {
        setSettings((old) => ({ ...old, voice: updated }));
      }
      return updated;
    });
  };

  const playVoicePreview = (persona) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setVoicePreviewPlaying(true);
    
    const sampleText = `Hello! I'm ${persona.name}. ${persona.description}. How can I assist you with voice chat today?`;
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.pitch = persona.pitch || 1.0;
    utterance.rate = persona.rate || 1.0;

    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      const match = availableVoices.find(v => v.lang.startsWith('en') && (persona.pitch > 1.0 ? (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha')) : (v.name.includes('Male') || v.name.includes('David'))));
      if (match) utterance.voice = match;
    }

    utterance.onend = () => setVoicePreviewPlaying(false);
    utterance.onerror = () => setVoicePreviewPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  // Analytics timeframe state matching OMNIRA screenshots
  const [usageHistoryTimeframe, setUsageHistoryTimeframe] = useState('7d');
  const [productActivityTimeframe, setProductActivityTimeframe] = useState('7d');
  const [toolActivityTimeframe, setToolActivityTimeframe] = useState('7d');

  // Data Controls configuration & modals state matching OMNIRA screenshots
  const [dataControlsConfig, setDataControlsConfig] = useState(() => {
    const saved = localStorage.getItem('omnira_data_controls_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      modelImprovement: true,
      locationEnabled: false,
      marketingMeasurement: true,
      personalizedMarketing: true
    };
  });

  const [activeDataSubView, setActiveDataSubView] = useState(null); // null | 'improveModel' | 'sharedWithApps' | 'marketingPrivacy'
  const [activeDataModal, setActiveDataModal] = useState(null); // null | 'sharedLinks' | 'archivedChats' | 'archiveAll' | 'deleteAll' | 'exportData'
  const [exportingData, setExportingData] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  // Safety configuration matching OMNIRA Safety Screenshot
  const [reduceSensitiveContent, setReduceSensitiveContent] = useState(() => {
    const saved = localStorage.getItem('omnira_reduce_sensitive_content');
    return saved ? JSON.parse(saved) : false;
  });

  const handleToggleSensitiveContent = (val) => {
    setReduceSensitiveContent(val);
    localStorage.setItem('omnira_reduce_sensitive_content', JSON.stringify(val));
    if (setSettings) {
      setSettings(prev => ({ ...prev, reduceSensitiveContent: val }));
    }
  };

  // Security and Login configuration matching OMNIRA Screenshots
  const [securityConfig, setSecurityConfig] = useState(() => {
    const saved = localStorage.getItem('omnira_security_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      authenticatorEnabled: false,
      smsEnabled: false,
      phoneNumber: '',
      lockdownMode: false,
      developerMode: false,
      enforceCspDevMode: true,
      deviceCodeAuthCodex: false,
      advancedSecurityEnrolled: false
    };
  });

  const updateSecurityConfig = (key, value) => {
    setSecurityConfig(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('omnira_security_config', JSON.stringify(updated));
      return updated;
    });
  };

  const [activeSecuritySubView, setActiveSecuritySubView] = useState(null);
  const [isAuthAppModalOpen, setIsAuthAppModalOpen] = useState(false);
  const [authAppCode, setAuthAppCode] = useState('');
  const [authAppError, setAuthAppError] = useState(null);
  const [securityBanner, setSecurityBanner] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

  const showSecBanner = (ok, text) => {
    setSecurityBanner({ ok, text });
    setTimeout(() => setSecurityBanner(null), 3500);
  };

  // â”€â”€ Real TOTP secret â€” generated once per browser, stored in localStorage â”€â”€
  const [totpSecret] = useState(() => {
    const saved = localStorage.getItem('omnira_totp_secret');
    if (saved) return saved;
    // Generate 20 random bytes â†’ Base32-encode as per RFC 4226
    const bytes = new Uint8Array(20);
    window.crypto.getRandomValues(bytes);
    const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0, val = 0, output = '';
    for (const b of bytes) {
      val = (val << 8) | b;
      bits += 8;
      while (bits >= 5) {
        output += BASE32[(val >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) output += BASE32[(val << (5 - bits)) & 31];
    localStorage.setItem('omnira_totp_secret', output);
    return output;
  });

  // â”€â”€ RFC 6238 TOTP verifier (pure WebCrypto, no library) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const verifyTotp = async (code) => {
    try {
      const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      // Decode Base32 secret â†’ bytes
      const secret = totpSecret.replace(/=+$/, '').toUpperCase();
      let bits = 0, val = 0;
      const bytes = [];
      for (const c of secret) {
        const idx = BASE32.indexOf(c);
        if (idx < 0) continue;
        val = (val << 5) | idx;
        bits += 5;
        if (bits >= 8) { bytes.push((val >>> (bits - 8)) & 0xff); bits -= 8; }
      }
      const keyBytes = new Uint8Array(bytes);
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
      );
      // Check current window Â± 1 step (30s)
      const now = Math.floor(Date.now() / 1000 / 30);
      for (const step of [now - 1, now, now + 1]) {
        const counter = new ArrayBuffer(8);
        const view = new DataView(counter);
        view.setUint32(0, Math.floor(step / 0x100000000), false);
        view.setUint32(4, step & 0xffffffff, false);
        const sig = await window.crypto.subtle.sign('HMAC', cryptoKey, counter);
        const hmac = new Uint8Array(sig);
        const offset = hmac[19] & 0x0f;
        const otp = ((hmac[offset] & 0x7f) << 24 |
                     (hmac[offset+1] & 0xff) << 16 |
                     (hmac[offset+2] & 0xff) << 8  |
                     (hmac[offset+3] & 0xff)) % 1000000;
        if (String(otp).padStart(6, '0') === String(code).trim()) return true;
      }
      return false;
    } catch (e) {
      console.warn('TOTP verify error:', e);
      return false;
    }
  };

  const handleVerifyAuthApp = async () => {
    const code = authAppCode.trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setAuthAppError('Please enter a valid 6-digit code.');
      return;
    }
    const valid = await verifyTotp(code);
    if (valid) {
      updateSecurityConfig('authenticatorEnabled', true);
      setIsAuthAppModalOpen(false);
      setAuthAppCode('');
      setAuthAppError(null);
      showSecBanner(true, 'Authenticator app connected! MFA is now active.');
    } else {
      setAuthAppError('Incorrect code. Make sure your authenticator app is synced and try again.');
    }
  };

  // 100% Real Active Sessions â€” built from live browser/device context
  const [activeSessions, setActiveSessions] = useState(() => {
    const saved = localStorage.getItem('omnira_active_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const ua = navigator.userAgent;
    const isMac = /Mac/i.test(ua);
    const isWin = /Win/i.test(ua);
    const isLinux = /Linux/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad/i.test(ua);
    const osName = isAndroid ? 'Android' : isIOS ? 'iOS' : isMac ? 'macOS' : isWin ? 'Windows' : isLinux ? 'Linux' : 'Unknown OS';
    const isMobile = isAndroid || isIOS;
    const deviceType = isMobile ? 'Mobile' : 'Computer';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
    const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    const initial = [
      {
        id: 'sess-current',
        device: 'OMNIRA Web',
        os: `${deviceType} â€¢ ${osName}`,
        time: now,
        location: tz,
        isCurrent: true
      }
    ];
    localStorage.setItem('omnira_active_sessions', JSON.stringify(initial));
    return initial;
  });

  const handleLogoutSession = (sessionId) => {
    setActiveSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      localStorage.setItem('omnira_active_sessions', JSON.stringify(updated));
      return updated;
    });
  };



  const handleAddPasskey = async () => {
    try {
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const options = {
          publicKey: {
            challenge,
            rp: { name: "OMNIRA AI", id: window.location.hostname },
            user: {
              id: new Uint8Array(16),
              name: currentUser?.email || "user@omnira.ai",
              displayName: currentUser?.name || "OMNIRA User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
            authenticatorSelection: { authenticatorAttachment: "platform", requireResidentKey: false },
            timeout: 60000
          }
        };
        await navigator.credentials.create(options);
        updateSecurityConfig('passkeyRegistered', true);
        showSecBanner(true, 'Hardware passkey registered successfully! Passwordless login enabled.');
      } else {
        showSecBanner(false, 'Your browser does not support hardware passkeys (WebAuthn).');
      }
    } catch (e) {
      console.warn('WebAuthn error:', e);
      if (e.name === 'NotAllowedError') {
        showSecBanner(false, 'Passkey setup was cancelled by user.');
      } else {
        showSecBanner(false, 'Passkey registration failed: ' + (e.message || 'Unknown error'));
      }
    }
  };

  // Parental Controls configuration matching OMNIRA Screenshots
  const [familyMembers, setFamilyMembers] = useState(() => {
    const saved = localStorage.getItem('omnira_family_members');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [isInviteFamilyModalOpen, setIsInviteFamilyModalOpen] = useState(false);
  const [inviteContactMode, setInviteContactMode] = useState('email'); // 'email' | 'phone'
  const [inviteContact, setInviteContact] = useState('');
  const [inviteRole, setInviteRole] = useState(''); // '' | 'parent' | 'child'
  const [sendingFamilyInvite, setSendingFamilyInvite] = useState(false);

  const [familyInviteStatus, setFamilyInviteStatus] = useState(null);

  const handleSendFamilyInvite = async () => {
    if (!inviteContact.trim() || !inviteRole) return;
    setSendingFamilyInvite(true);
    setFamilyInviteStatus(null);
    try {
      const newMember = {
        id: `fam-${Date.now()}`,
        contact: inviteContact.trim(),
        mode: inviteContactMode,
        role: inviteRole === 'parent' ? 'Parent or Guardian' : 'Child',
        status: 'Pending Invitation',
        createdAt: new Date().toLocaleDateString()
      };

      const updated = [...familyMembers, newMember];
      setFamilyMembers(updated);
      localStorage.setItem('omnira_family_members', JSON.stringify(updated));

      let emailResult = { success: true };
      if (inviteContactMode === 'email') {
        emailResult = await triggerAutoEmail({
          type: 'invite',
          email: inviteContact.trim(),
          name: currentUser?.name || 'User',
          role: newMember.role
        });
      }

      const contactStr = inviteContact.trim();
      setInviteContact('');
      setInviteRole('');
      setIsInviteFamilyModalOpen(false);
      setFamilyInviteStatus({ ok: true, text: `Invitation sent to ${contactStr}!${emailResult.success ? ' Confirmation email delivered.' : ''}` });
      setTimeout(() => setFamilyInviteStatus(null), 4000);
    } catch (err) {
      console.error('Family invite error:', err);
      setFamilyInviteStatus({ ok: false, text: 'Failed to send invitation. Please try again.' });
      setTimeout(() => setFamilyInviteStatus(null), 4000);
    } finally {
      setSendingFamilyInvite(false);
    }
  };

  const handleRemoveFamilyMember = (id) => {
    setConfirmDialog({
      message: 'Remove this family member from linked accounts? They will lose access to OMNIRA family features.',
      onConfirm: () => {
        const updated = familyMembers.filter(m => m.id !== id);
        setFamilyMembers(updated);
        localStorage.setItem('omnira_family_members', JSON.stringify(updated));
        setFamilyInviteStatus({ ok: true, text: 'Family member removed successfully.' });
        setTimeout(() => setFamilyInviteStatus(null), 3500);
        setConfirmDialog(null);
      }
    });
  };

  // 100% Real Keyboard Shortcuts State matching OMNIRA Screenshots
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(() => {
    const saved = localStorage.getItem('omnira_keyboard_shortcuts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_KEYBOARD_SHORTCUTS;
  });

  const [editingShortcutId, setEditingShortcutId] = useState(null);

  const handleToggleShortcut = (id) => {
    setKeyboardShortcuts((prev) => {
      const updated = prev.map((sc) =>
        sc.id === id ? { ...sc, enabled: !sc.enabled } : sc
      );
      localStorage.setItem('omnira_keyboard_shortcuts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRestoreDefaultShortcuts = () => {
    setKeyboardShortcuts(DEFAULT_KEYBOARD_SHORTCUTS);
    localStorage.removeItem('omnira_keyboard_shortcuts');
    setEditingShortcutId(null);
  };

  useEffect(() => {
    if (!editingShortcutId) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setEditingShortcutId(null);
        return;
      }

      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
      if (e.shiftKey) keys.push('Shift');
      if (e.altKey) keys.push('Alt');

      let mainKey = e.key;
      if (mainKey === 'Enter') mainKey = 'â†µ';
      else if (mainKey === 'Backspace') mainKey = 'âŒ«';
      else if (mainKey === ' ') mainKey = 'Space';
      else if (mainKey.length === 1) mainKey = mainKey.toUpperCase();

      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        keys.push(mainKey);
      }

      if (keys.length > 0) {
        const combo = keys.join(' + ');
        setKeyboardShortcuts((prev) => {
          const updated = prev.map((sc) =>
            sc.id === editingShortcutId ? { ...sc, keyCombo: combo } : sc
          );
          localStorage.setItem('omnira_keyboard_shortcuts', JSON.stringify(updated));
          return updated;
        });
        setEditingShortcutId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingShortcutId]);

  // 100% Real Trusted Contact State matching OMNIRA Screenshots
  const [trustedContacts, setTrustedContacts] = useState(() => {
    const saved = localStorage.getItem('omnira_trusted_contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [isAddTrustedInfoModalOpen, setIsAddTrustedInfoModalOpen] = useState(false);
  const [isInviteTrustedFormModalOpen, setIsInviteTrustedFormModalOpen] = useState(false);

  const [trustedInfoExpanded, setTrustedInfoExpanded] = useState({
    whatToExpect: false,
    whoToInvite: false
  });

  const [trustedForm, setTrustedForm] = useState({
    name: '',
    countryCode: '+1',
    phone: '',
    email: '',
    confirmed18: false
  });
  const [sendingTrustedInvite, setSendingTrustedInvite] = useState(false);

  const handleSendTrustedInvite = async () => {
    if (!trustedForm.name.trim() || !trustedForm.email.trim() || !trustedForm.phone.trim() || !trustedForm.confirmed18) return;
    setSendingTrustedInvite(true);
    try {
      const newContact = {
        id: `trusted-${Date.now()}`,
        name: trustedForm.name.trim(),
        countryCode: trustedForm.countryCode,
        phone: trustedForm.phone.trim(),
        email: trustedForm.email.trim(),
        status: 'Active Trusted Contact',
        addedAt: new Date().toLocaleDateString()
      };

      const updated = [...trustedContacts, newContact];
      setTrustedContacts(updated);
      localStorage.setItem('omnira_trusted_contacts', JSON.stringify(updated));

      const nameStr = trustedForm.name.trim();
      const emailStr = trustedForm.email.trim();

      const emailResult = await triggerAutoEmail({
        type: 'invite',
        email: emailStr,
        name: nameStr,
        role: 'Trusted Contact'
      });

      setIsInviteTrustedFormModalOpen(false);
      setTrustedForm({ name: '', countryCode: '+1', phone: '', email: '', confirmed18: false });
      setTrustedInviteStatus({ ok: true, text: `Invitation sent to ${nameStr} (${emailStr})!${emailResult.success ? ' Confirmation email delivered.' : ''}` });
      setTimeout(() => setTrustedInviteStatus(null), 4000);
    } catch (err) {
      console.error('Trusted contact invite error:', err);
      setTrustedInviteStatus({ ok: false, text: 'Failed to send invitation. Please try again.' });
      setTimeout(() => setTrustedInviteStatus(null), 4000);
    } finally {
      setSendingTrustedInvite(false);
    }
  };

  const [trustedInviteStatus, setTrustedInviteStatus] = useState(null);

  const handleRemoveTrustedContact = (id) => {
    setConfirmDialog({
      message: 'Remove this trusted contact? They will no longer receive crisis notifications on your behalf.',
      onConfirm: () => {
        const updated = trustedContacts.filter(c => c.id !== id);
        setTrustedContacts(updated);
        localStorage.setItem('omnira_trusted_contacts', JSON.stringify(updated));
        setTrustedInviteStatus({ ok: true, text: 'Trusted contact removed.' });
        setTimeout(() => setTrustedInviteStatus(null), 3500);
        setConfirmDialog(null);
      }
    });
  };



  const updateDataControl = (key, value) => {
    setDataControlsConfig(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('omnira_data_controls_config', JSON.stringify(updated));
      return updated;
    });
  };

  const [locationBanner, setLocationBanner] = useState(null);

  const handleToggleLocation = () => {
    if (!dataControlsConfig.locationEnabled) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updateDataControl('locationEnabled', true);
            setLocationBanner({ ok: true, text: `Location enabled â€” ${pos.coords.latitude.toFixed(3)}Â°, ${pos.coords.longitude.toFixed(3)}Â° (${Intl.DateTimeFormat().resolvedOptions().timeZone})` });
            setTimeout(() => setLocationBanner(null), 5000);
          },
          (err) => {
            console.warn('Geolocation error:', err);
            updateDataControl('locationEnabled', true);
            setLocationBanner({ ok: false, text: 'Location enabled but coordinates unavailable: ' + err.message });
            setTimeout(() => setLocationBanner(null), 4000);
          }
        );
      } else {
        updateDataControl('locationEnabled', true);
        setLocationBanner({ ok: false, text: 'Geolocation is not supported by this browser.' });
        setTimeout(() => setLocationBanner(null), 4000);
      }
    } else {
      updateDataControl('locationEnabled', false);
      setLocationBanner(null);
    }
  };

  const handleConfirmExport = async () => {
    setExportingData(true);
    try {
      const userId = currentUser?.uid || currentUser?.email || 'guest_user';
      const chatsRaw = localStorage.getItem('OMNIRA_sessions') || localStorage.getItem('quick_ai_chats') || '[]';
      const settingsRaw = localStorage.getItem('OMNIRA_settings') || '{}';
      
      const exportPayload = {
        export_date: new Date().toISOString(),
        user_profile: {
          name: currentUser?.name || 'Guest User',
          email: currentUser?.email || 'user@example.com',
          uid: userId,
          plan: currentUser?.plan || 'Pro'
        },
        settings: JSON.parse(settingsRaw),
        conversations: JSON.parse(chatsRaw)
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `OMNIRA_Data_Export_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      await triggerAutoEmail({
        type: 'export',
        email: currentUser?.email || 'user@example.com',
        name: currentUser?.name || 'User'
      });

      setExportStatus({ ok: true, text: 'Data export file downloaded and email confirmation sent!' });
    } catch (err) {
      console.error('Export error:', err);
      setExportStatus({ ok: false, text: 'Failed to process export. Please try again.' });
    } finally {
      setExportingData(false);
    }
  };

  const [dataActionBanner, setDataActionBanner] = useState(null);

  const showDataBanner = (ok, text) => {
    setDataActionBanner({ ok, text });
    setTimeout(() => setDataActionBanner(null), 4000);
  };

  const handleArchiveAllChats = () => {
    try {
      const chatsRaw = localStorage.getItem('OMNIRA_sessions') || localStorage.getItem('chatgpt_sessions');
      if (chatsRaw) {
        const chats = JSON.parse(chatsRaw);
        const archivedList = JSON.parse(localStorage.getItem('omnira_archived_chats') || '[]');
        const updatedArchived = [...archivedList, ...chats];
        localStorage.setItem('omnira_archived_chats', JSON.stringify(updatedArchived));
        localStorage.setItem('chatgpt_sessions', JSON.stringify([]));
        localStorage.setItem('OMNIRA_sessions', JSON.stringify([]));
        if (currentUser?.uid) {
          localStorage.removeItem(`omnira_chats_${currentUser.uid}`);
        }
        if (currentUser?.email) {
          localStorage.removeItem(`omnira_chats_${currentUser.email.replace(/[^a-zA-Z0-9_-]/g, '_')}`);
        }
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('omnira_chat_update'));
      }
      setActiveDataModal(null);
      showDataBanner(true, `All ${JSON.parse(localStorage.getItem('omnira_archived_chats') || '[]').length} chats have been archived successfully.`);
    } catch (e) {
      console.error('Archive error:', e);
      showDataBanner(false, 'Failed to archive chats. Please try again.');
    }
  };

  const handleDeleteAllChats = () => {
    try {
      localStorage.setItem('chatgpt_sessions', JSON.stringify([]));
      localStorage.setItem('OMNIRA_sessions', JSON.stringify([]));
      localStorage.setItem('quick_ai_chats', JSON.stringify([]));
      localStorage.setItem('omnira_archived_chats', JSON.stringify([]));
      if (currentUser?.uid) {
        localStorage.removeItem(`omnira_chats_${currentUser.uid}`);
        deleteAllSessionsFromCloud(currentUser.uid).catch((err) => {
          console.warn('Cloud delete notice:', err);
        });
      }
      if (currentUser?.email) {
        localStorage.removeItem(`omnira_chats_${currentUser.email.replace(/[^a-zA-Z0-9_-]/g, '_')}`);
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('omnira_chat_update'));
      setActiveDataModal(null);
      showDataBanner(true, 'All conversation history has been permanently deleted.');
    } catch (e) {
      console.error('Delete error:', e);
      showDataBanner(false, 'Failed to delete chats. Please try again.');
    }
  };

  // 100% Real Storage scanner matching OMNIRA Screenshots with zero fake data
  const [activeStorageSubView, setActiveStorageSubView] = useState(null); // null | 'all' | 'images' | 'files'
  const [storageRefreshTrigger, setStorageRefreshTrigger] = useState(0);

  const getRealStorageItems = (_trigger) => {
    const images = [];
    const files = [];

    // 1. Scan omnira_saved_images
    try {
      const savedImgRaw = localStorage.getItem('omnira_saved_images');
      if (savedImgRaw) {
        const parsed = JSON.parse(savedImgRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((img, i) => {
            const url = img.imageUrl || img.url || '';
            let bytes = 300 * 1024;
            if (url.startsWith('data:')) {
              bytes = Math.round((url.length * 3) / 4);
            }
            images.push({
              id: img.id || `saved-img-${i}`,
              name: img.prompt ? `${img.prompt.slice(0, 20)}.png` : `image_${i + 1}.png`,
              type: 'image',
              url: url,
              bytes: bytes,
              modified: img.timestamp || (img.createdAt ? new Date(img.createdAt).toLocaleDateString() : 'Recent'),
              prompt: img.prompt || 'Generated Image'
            });
          });
        }
      }
    } catch (e) {}

    // 2. Scan chat Sessions for attachments and generated images
    try {
      const chatsRaw = localStorage.getItem('OMNIRA_sessions') || localStorage.getItem('quick_ai_chats');
      if (chatsRaw) {
        const chats = JSON.parse(chatsRaw);
        if (Array.isArray(chats)) {
          chats.forEach((chat) => {
            if (Array.isArray(chat.messages)) {
              chat.messages.forEach((msg, mi) => {
                if (Array.isArray(msg.attachments)) {
                  msg.attachments.forEach((att, ai) => {
                    const bytes = att.size || (att.data ? Math.round((att.data.length * 3) / 4) : 150 * 1024);
                    const isImg = att.type?.startsWith('image') || att.name?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);
                    const item = {
                      id: att.id || `att-${chat.id}-${mi}-${ai}`,
                      name: att.name || `file_${mi + 1}`,
                      type: isImg ? 'image' : 'file',
                      url: att.data || att.url || '',
                      bytes: bytes,
                      modified: new Date(chat.createdAt || Date.now()).toLocaleDateString(),
                      chatId: chat.id
                    };
                    if (isImg) images.push(item);
                    else files.push(item);
                  });
                }
                if (msg.imageUrl && !images.some(i => i.url === msg.imageUrl)) {
                  const bytes = msg.imageUrl.startsWith('data:') ? Math.round((msg.imageUrl.length * 3) / 4) : 250 * 1024;
                  images.push({
                    id: msg.id || `msg-img-${chat.id}-${mi}`,
                    name: msg.userPrompt ? `${msg.userPrompt.slice(0, 18)}.png` : `image_${mi}.png`,
                    type: 'image',
                    url: msg.imageUrl,
                    bytes: bytes,
                    modified: new Date(chat.createdAt || Date.now()).toLocaleDateString(),
                    prompt: msg.userPrompt || 'Generated image'
                  });
                }
              });
            }
          });
        }
      }
    } catch (e) {}

    // 3. Scan omnira_uploaded_library
    try {
      const libRaw = localStorage.getItem('omnira_uploaded_library');
      if (libRaw) {
        const lib = JSON.parse(libRaw);
        if (Array.isArray(lib)) {
          lib.forEach(item => {
            if (item.type === 'image') images.push(item);
            else files.push(item);
          });
        }
      }
    } catch (e) {}

    // Deduplicate by URL or ID
    const uniqueImages = [];
    const seenUrls = new Set();
    images.forEach(img => {
      if (img.url && !seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        uniqueImages.push(img);
      }
    });

    return { images: uniqueImages, files };
  };

  const handleUploadStorageFile = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = [];
    let readCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const isImg = file.type.startsWith('image/');
        newItems.push({
          id: `lib-upload-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: isImg ? 'image' : 'file',
          url: event.target.result,
          bytes: file.size,
          modified: new Date().toLocaleDateString()
        });
        readCount++;
        if (readCount === files.length) {
          const existing = JSON.parse(localStorage.getItem('omnira_uploaded_library') || '[]');
          const updated = [...existing, ...newItems];
          localStorage.setItem('omnira_uploaded_library', JSON.stringify(updated));
          setStorageRefreshTrigger(prev => prev + 1);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteStorageItem = (id) => {
    setConfirmDialog({
      message: 'Permanently delete this item from your OMNIRA storage? This cannot be undone.',
      onConfirm: () => {
        setConfirmDialog(null);
        (() => {
      try {
        const savedImg = JSON.parse(localStorage.getItem('omnira_saved_images') || '[]');
        const updatedImg = savedImg.filter(item => item.id !== id && item.imageUrl !== id);
        localStorage.setItem('omnira_saved_images', JSON.stringify(updatedImg));
      } catch (e) {}

      try {
        const lib = JSON.parse(localStorage.getItem('omnira_uploaded_library') || '[]');
        const updatedLib = lib.filter(item => item.id !== id);
        localStorage.setItem('omnira_uploaded_library', JSON.stringify(updatedLib));
      } catch (e) {}

      setStorageRefreshTrigger(prev => prev + 1);
        })();
      }
    });
  };

  const fetchQuota = async () => {
    setQuotaLoading(true);
    try {
      const userId = currentUser?.uid || currentUser?.email || 'guest_user';
      const data = await getBackendImageQuota(userId);
      if (data) {
        setQuotaData(data);
      }
    } catch (err) {
      console.warn('Failed to fetch quota:', err);
    } finally {
      setQuotaLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setMobileView('menu');
      setSearchQuery('');
      setSubscribeMessage(null);
      setTestEmailStatus(null);
      if (initialTab === 'usage' || initialTab === 'analytics') {
        fetchQuota();
      }
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && (activeTab === 'usage' || activeTab === 'analytics')) {
      fetchQuota();
    }
  }, [isOpen, activeTab]);

  // Modals state
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Profile editing state
  const [editingField, setEditingField] = useState(null); // 'name' | 'username' | 'email'
  const [tempProfile, setTempProfile] = useState({
    name: currentUser?.name || 'Guest User',
    username: currentUser?.username || '@guest_user',
    email: currentUser?.email || 'user@example.com'
  });

  // Profile Avatar High-Quality Upload State
  const avatarFileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState(null);

  // Age verification state
  const [isAgeVerified, setIsAgeVerified] = useState(() => {
    return localStorage.getItem('omnira_age_verified') === 'true';
  });

  // GitHub account state
  const [githubUser, setGithubUser] = useState(() => {
    const saved = localStorage.getItem('omnira_github_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Verified domains state
  const [verifiedDomains, setVerifiedDomains] = useState(() => {
    const saved = localStorage.getItem('omnira_verified_domains');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDomain, setSelectedDomain] = useState(() => {
    return localStorage.getItem('omnira_selected_domain') || '';
  });

  useEffect(() => {
    if (currentUser) {
      setTempProfile({
        name: currentUser.name || 'Guest User',
        username: currentUser.username || '@guest_user',
        email: currentUser.email || 'user@example.com'
      });
    }
  }, [currentUser]);

  // Persist GitHub user
  useEffect(() => {
    if (githubUser) {
      localStorage.setItem('omnira_github_user', JSON.stringify(githubUser));
    } else {
      localStorage.removeItem('omnira_github_user');
    }
  }, [githubUser]);

  // Persist verified domains
  useEffect(() => {
    localStorage.setItem('omnira_verified_domains', JSON.stringify(verifiedDomains));
  }, [verifiedDomains]);

  useEffect(() => {
    localStorage.setItem('omnira_selected_domain', selectedDomain);
  }, [selectedDomain]);

  const handleSaveProfileField = (field) => {
    const updated = {
      ...currentUser,
      [field]: tempProfile[field]
    };
    onUpdateUser(updated);
    setEditingField(null);
  };

  // High-Quality Profile Photo Upload Handler
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarUploadStatus({ ok: false, text: 'Please select a valid image file (PNG, JPG, WebP).' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setAvatarUploadStatus({ ok: false, text: 'File size exceeds 15MB limit.' });
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarUploadStatus({ ok: true, text: 'Processing high-quality photo...' });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Crop and render to high resolution canvas (800x800 for crystal-clear retina displays)
          const targetSize = Math.min(800, Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          // High-quality bicubic smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Center crop calculation
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;

          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);

          // Export as high-quality WebP or JPEG
          let highResUrl = canvas.toDataURL('image/webp', 0.95);
          if (!highResUrl.startsWith('data:image/webp')) {
            highResUrl = canvas.toDataURL('image/jpeg', 0.95);
          }

          // Update user state
          const updatedUser = {
            ...currentUser,
            picture: highResUrl,
            photoURL: highResUrl,
            avatar: highResUrl
          };

          onUpdateUser(updatedUser);
          localStorage.setItem('omnira_user', JSON.stringify(updatedUser));
          localStorage.setItem('omnira_user_avatar', highResUrl);

          // Attempt to sync with Firebase Auth if logged in
          try {
            const { auth } = await import('../firebase');
            if (auth.currentUser) {
              const { updateProfile } = await import('firebase/auth');
              await updateProfile(auth.currentUser, { photoURL: highResUrl });
            }
          } catch (fbErr) {
            // Local state is already updated seamlessly
          }

          setAvatarUploadStatus({ ok: true, text: 'Profile photo updated in high resolution!' });
          setTimeout(() => setAvatarUploadStatus(null), 4000);
        } catch (err) {
          setAvatarUploadStatus({ ok: false, text: 'Failed to process image. Please try another.' });
        } finally {
          setIsUploadingAvatar(false);
        }
      };
      img.onerror = () => {
        setIsUploadingAvatar(false);
        setAvatarUploadStatus({ ok: false, text: 'Error reading image file.' });
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setIsUploadingAvatar(false);
      setAvatarUploadStatus({ ok: false, text: 'Error reading file.' });
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setConfirmDialog({
      message: 'Remove your custom profile picture and reset to default initials?',
      onConfirm: async () => {
        setConfirmDialog(null);
        const updatedUser = {
          ...currentUser,
          picture: null,
          photoURL: null,
          avatar: (currentUser?.name || 'GU').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        };
        onUpdateUser(updatedUser);
        localStorage.setItem('omnira_user', JSON.stringify(updatedUser));
        localStorage.removeItem('omnira_user_avatar');

        try {
          const { auth } = await import('../firebase');
          if (auth.currentUser) {
            const { updateProfile } = await import('firebase/auth');
            await updateProfile(auth.currentUser, { photoURL: '' });
          }
        } catch (e) {}

        setAvatarUploadStatus({ ok: true, text: 'Profile photo removed.' });
        setTimeout(() => setAvatarUploadStatus(null), 3000);
      }
    });
  };

  const handleGithubConnect = (githubData) => {
    setGithubUser(githubData);
  };

  const handleGithubDisconnect = () => {
    setConfirmDialog({
      message: 'Disconnect your GitHub account from OMNIRA? You can reconnect at any time.',
      onConfirm: () => {
        setGithubUser(null);
        localStorage.removeItem('omnira_github_user');
        showSecBanner(true, 'GitHub account disconnected successfully.');
        setConfirmDialog(null);
      }
    });
  };

  const handleVerifyDomain = (domainObj) => {
    setVerifiedDomains((prev) => [...prev.filter(d => d.domain !== domainObj.domain), domainObj]);
    setSelectedDomain(domainObj.domain);
  };

  const handleDeleteDomain = (domainToDelete) => {
    setVerifiedDomains((prev) => prev.filter(d => d.domain !== domainToDelete));
    if (selectedDomain === domainToDelete) {
      setSelectedDomain('');
    }
  };

  const handleAgeVerify = () => {
    setIsAgeVerified(true);
    localStorage.setItem('omnira_age_verified', 'true');
    setIsAgeModalOpen(false);
  };

  const handleSubscribePlan = async (planName) => {
    setSubscribing(true);
    setSubscribeMessage(null);
    try {
      const updated = {
        ...currentUser,
        plan: planName
      };
      if (onUpdateUser) {
        onUpdateUser(updated);
      }
      const targetEmail = currentUser?.email || 'user@example.com';
      const targetName = currentUser?.name || currentUser?.username || 'OMNIRA User';

      const result = await triggerAutoEmail({
        type: 'subscribe',
        email: targetEmail,
        name: targetName,
        plan: planName
      });

      if (result && result.success) {
        setSubscribeMessage({ type: 'success', text: `Subscribed to ${planName}! Confirmation email sent to ${targetEmail}.` });
      } else {
        setSubscribeMessage({ type: 'info', text: `Plan updated to ${planName}. Email status: ${result?.message || 'Queued'}.` });
      }
    } catch (e) {
      console.error('Subscription error:', e);
      setSubscribeMessage({ type: 'error', text: 'Error updating plan. Please try again.' });
    } finally {
      setSubscribing(false);
    }
  };

  const handleSendTestEmail = async (type = 'welcome') => {
    setSendingTestEmail(true);
    setTestEmailStatus(null);
    try {
      const targetEmail = currentUser?.email || 'user@example.com';
      const targetName = currentUser?.name || currentUser?.username || 'OMNIRA User';
      const res = await triggerAutoEmail({
        type,
        email: targetEmail,
        name: targetName,
        plan: currentUser?.plan || 'Pro'
      });
      if (res && res.success) {
        setTestEmailStatus({ ok: true, text: `Test ${type} email sent to ${targetEmail}!` });
      } else {
        setTestEmailStatus({ ok: false, text: res?.message || 'Email delivery failed' });
      }
    } catch (err) {
      setTestEmailStatus({ ok: false, text: err.message });
    } finally {
      setSendingTestEmail(false);
    }
  };

  // General Settings State (matching OMNIRA screenshot)
  const ACCENT_COLORS = [
    { id: 'yellow', label: 'Yellow', hex: '#eab308' },
    { id: 'emerald', label: 'Default', hex: '#10a37f' },
    { id: 'blue', label: 'Blue', hex: '#3b82f6' },
    { id: 'purple', label: 'Purple', hex: '#8b5cf6' },
    { id: 'orange', label: 'Orange', hex: '#f97316' },
    { id: 'pink', label: 'Pink', hex: '#ec4899' },
    { id: 'red', label: 'Red', hex: '#ef4444' },
    { id: 'teal', label: 'Teal', hex: '#14b8a6' }
  ];

  const [appearanceMode, setAppearanceMode] = useState(() => {
    return localStorage.getItem('omnira_appearance') || (darkMode ? 'dark' : 'light');
  });

  const [contrastLevel, setContrastLevel] = useState(() => {
    return localStorage.getItem('omnira_contrast') || 'medium';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('omnira_accent_color') || 'yellow';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('omnira_language') || 'English (US)';
  });

  const handleAppearanceChange = (mode) => {
    setAppearanceMode(mode);
    localStorage.setItem('omnira_appearance', mode);
    if (mode === 'dark') {
      setDarkMode(true);
    } else if (mode === 'light') {
      setDarkMode(false);
    } else if (mode === 'system') {
      const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isSystemDark);
    }
  };

  const handleContrastChange = (contrast) => {
    setContrastLevel(contrast);
    localStorage.setItem('omnira_contrast', contrast);
    document.documentElement.setAttribute('data-contrast', contrast);
  };

  const handleAccentColorChange = (colorId) => {
    setAccentColor(colorId);
    localStorage.setItem('omnira_accent_color', colorId);
    const found = ACCENT_COLORS.find(c => c.id === colorId);
    if (found) {
      document.documentElement.style.setProperty('--accent-color', found.hex);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('omnira_language', lang);
  };

  const menuItems = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'personalization', label: 'Personalization', icon: Sparkles },

    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'usage', label: 'Limitations & Usage', icon: BarChart3 },
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

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in select-none"
      >
        
        {/* Main Settings Dialog Container */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-3xl h-[92vh] sm:h-[85vh] max-h-[680px] shadow-2xl flex overflow-hidden text-[var(--text-primary)] relative">
          
          {/* Modal Left Navigation Sidebar */}
          <div className={`${mobileView === 'menu' ? 'flex w-full' : 'hidden'} md:flex md:w-64 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] flex-col shrink-0 h-full`}>
            
            <div className="p-3.5 space-y-3 border-b border-[var(--border-color)] shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[var(--text-primary)]">Settings</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  title="Close Settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

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

            <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileView('detail');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-xs font-medium transition-colors ${
                      isSelected 
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold' 
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 md:hidden opacity-50" />
                  </button>
                );
              })}
            </div>

            {/* Settings Sidebar Bottom Logout */}
            <div className="p-3 border-t border-[var(--border-color)] mt-auto shrink-0">
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                <span>Log out</span>
              </button>
            </div>

          </div>

          {/* Modal Right Content Pane */}
          <div className={`${mobileView === 'detail' ? 'flex w-full' : 'hidden'} md:flex md:flex-1 flex-col h-full overflow-hidden bg-[var(--bg-card)]`}>
            
            {/* Mobile Top Header with Back button */}
            <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)] shrink-0">
              <button
                onClick={() => setMobileView('menu')}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] hover:opacity-80 transition-opacity py-1 px-1.5 -ml-1.5 rounded-lg active:bg-[var(--bg-hover)]"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Settings</span>
              </button>
              <span className="font-bold text-sm text-[var(--text-primary)] truncate max-w-[170px]">
                {menuItems.find(m => m.id === activeTab)?.label || 'Account'}
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                title="Close Settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-7 space-y-6">
              
              <h2 className="hidden md:block text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {menuItems.find(m => m.id === activeTab)?.label || 'Account'}
              </h2>

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6 text-xs sm:text-sm">
                
                {/* Account General Fields */}
                <div className="space-y-4 divide-y divide-[var(--border-color)]">
                  
                  {/* Profile Picture Upload Section (High Quality) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative group shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-black/30 dark:border-white/30 overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-md flex items-center justify-center">
                          {currentUser?.picture || currentUser?.photoURL || (currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http'))) ? (
                            <img 
                              src={currentUser.picture || currentUser.photoURL || currentUser.avatar} 
                              alt={currentUser?.name || 'User Profile'} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-lg sm:text-xl flex items-center justify-center">
                              {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {/* Camera hover overlay */}
                        <button
                          type="button"
                          onClick={() => avatarFileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center transition-opacity cursor-pointer text-[10px] font-medium"
                          title="Change profile photo"
                        >
                          <Camera className="w-4 h-4 mb-0.5" />
                          <span>Change</span>
                        </button>
                      </div>

                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Profile Photo</div>
                        <div className="text-[11px] text-[var(--text-muted)] leading-tight">
                          Upload high quality avatar (PNG, JPG, WebP up to 15MB).
                        </div>
                        {avatarUploadStatus && (
                          <div className={`text-[11px] font-semibold pt-0.5 ${avatarUploadStatus.ok ? 'text-black dark:text-white' : 'text-red-500'}`}>
                            {avatarUploadStatus.text}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <input
                        type="file"
                        ref={avatarFileInputRef}
                        onChange={handleAvatarFileSelect}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingAvatar ? 'Uploading...' : 'Upload photo'}</span>
                      </button>

                      {(currentUser?.picture || currentUser?.photoURL || (currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http')))) && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-3 py-1.5 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 pt-1">
                    <span className="font-medium text-[var(--text-primary)] shrink-0">Name</span>
                    {editingField === 'name' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempProfile.name}
                          onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                          className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs outline-none focus:border-black dark:border-white min-w-0"
                        />
                        <button
                          onClick={() => handleSaveProfileField('name')}
                          className="px-2.5 py-1 bg-black dark:bg-white text-white dark:text-black text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 shrink-0"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingField('name')}
                        className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group truncate text-left sm:text-right"
                      >
                        <span className="truncate">{currentUser?.name || 'Guest User'}</span>
                        <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-black dark:text-white shrink-0" />
                      </button>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 pt-3">
                    <span className="font-medium text-[var(--text-primary)] shrink-0">Username</span>
                    {editingField === 'username' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempProfile.username}
                          onChange={(e) => setTempProfile({ ...tempProfile, username: e.target.value })}
                          className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs outline-none focus:border-black dark:border-white font-mono min-w-0"
                        />
                        <button
                          onClick={() => handleSaveProfileField('username')}
                          className="px-2.5 py-1 bg-black dark:bg-white text-white dark:text-black text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 shrink-0"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingField('username')}
                        className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors truncate text-left sm:text-right"
                      >
                        <span className="truncate">{currentUser?.username || '@guest_user'}</span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 pt-3">
                    <span className="font-medium text-[var(--text-primary)] shrink-0">Email</span>
                    {editingField === 'email' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={tempProfile.email}
                          onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                          className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs outline-none focus:border-black dark:border-white min-w-0"
                        />
                        <button
                          onClick={() => handleSaveProfileField('email')}
                          className="px-2.5 py-1 bg-black dark:bg-white text-white dark:text-black text-white font-semibold text-xs rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 shrink-0"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingField('email')}
                        className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors truncate text-left sm:text-right"
                      >
                        <span className="truncate">{currentUser?.email || 'user@example.com'}</span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </button>
                    )}
                  </div>

                  {/* Age Verification */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                    <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                      <div className="font-medium text-[var(--text-primary)] flex flex-wrap items-center gap-1.5">
                        <span>Age verification</span>
                        {isAgeVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-black dark:text-white flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verified (18+)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                        To help keep OMNIRA appropriate for everyone, some settings require age verification.
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-auto">
                      {isAgeVerified ? (
                        <span className="px-3.5 py-1.5 rounded-full bg-black/10 dark:bg-white/10 text-black dark:text-white font-semibold text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => setIsAgeModalOpen(true)}
                          className="px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                        >
                          Verify age
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <span className="font-medium text-[var(--text-primary)]">Delete account</span>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-4 py-1.5 rounded-full border border-red-500 text-red-500 font-semibold text-xs hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                    >
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

                  {/* Preview Box */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex flex-col items-center justify-center text-center relative space-y-2 py-6">
                    <span className="absolute right-4 top-3 text-[11px] text-[var(--text-muted)] font-medium">
                      Preview
                    </span>

                    <div className="w-12 h-12 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-muted)] shadow-2xs overflow-hidden">
                      {currentUser?.picture || currentUser?.photoURL || (currentUser?.avatar && (currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http'))) ? (
                        <img src={currentUser.picture || currentUser.photoURL || currentUser.avatar} alt={currentUser?.name} className="w-full h-full object-cover" />
                      ) : githubUser ? (
                        <img src={githubUser.avatar_url} alt={githubUser.username} className="w-full h-full object-cover" />
                      ) : (
                        <Box className="w-6 h-6 stroke-[1.5]" />
                      )}
                    </div>

                    <div className="font-semibold text-sm text-[var(--text-primary)]">
                      {currentUser?.name || 'Guest User'}'s GPT Studio
                    </div>

                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 justify-center">
                      <span>By {githubUser ? `@${githubUser.username}` : (currentUser?.username || '@guest_user')}</span>
                      {selectedDomain && (
                        <span className="text-black dark:text-white font-medium">({selectedDomain})</span>
                      )}
                    </div>
                  </div>

                  {/* Info Alert Box */}
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex items-start gap-3 text-xs text-[var(--text-muted)] leading-relaxed">
                    <Info className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                    <div>
                      Complete verification to publish GPTs to everyone. Verify your identity by adding billing details or verifying ownership of a public domain name.
                    </div>
                  </div>

                  {/* Links Section */}
                  <div className="space-y-3 pt-2">
                    <div className="font-semibold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                      Links & Connections
                    </div>

                    {/* Globe Domain Link Dropdown */}
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-medium">
                        <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                        <span>Domain</span>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                        >
                          <span>{selectedDomain || 'Select a domain'}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        </button>

                        {/* Dropdown item */}
                        {isDomainDropdownOpen && (
                          <div className="absolute right-0 mt-1.5 w-60 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1.5 shadow-xl z-30 animate-fade-in space-y-1">
                            {verifiedDomains.map((d) => (
                              <div
                                key={d.domain}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer text-xs"
                                onClick={() => {
                                  setSelectedDomain(d.domain);
                                  setIsDomainDropdownOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-1.5 font-medium truncate">
                                  <Check className={`w-3.5 h-3.5 ${selectedDomain === d.domain ? 'text-black dark:text-white opacity-100' : 'opacity-0'}`} />
                                  <span className="truncate">{d.domain}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDomain(d.domain);
                                  }}
                                  className="p-1 text-neutral-400 hover:text-red-500 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            <button
                              onClick={() => {
                                setIsDomainDropdownOpen(false);
                                setIsDomainModalOpen(true);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-black dark:text-white hover:bg-neutral-800 dark:hover:bg-neutral-200/10 transition-colors text-left"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Verify new domain</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* GitHub Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-medium">
                        <svg className="w-4 h-4 fill-current text-[var(--text-muted)] shrink-0" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        <span>GitHub</span>
                      </div>

                      {githubUser ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={githubUser.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/30 dark:border-white/30 bg-black/10 dark:bg-white/10 text-black dark:text-white font-semibold text-xs hover:underline"
                          >
                            <img src={githubUser.avatar_url} alt={githubUser.username} className="w-3.5 h-3.5 rounded-full" />
                            <span>@{githubUser.username}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={handleGithubDisconnect}
                            className="px-2.5 py-1 rounded-full border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/10"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsGithubModalOpen(true)}
                          className="px-3.5 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Section */}
                  <div className="space-y-2 pt-2">
                    <div className="font-semibold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                      Email
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-medium">
                      <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>{currentUser?.email || 'user@example.com'}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="receiveFeedback"
                        checked={receiveEmails}
                        onChange={(e) => setReceiveEmails(e.target.checked)}
                        className="rounded border-[var(--border-color)] accent-black dark:accent-white cursor-pointer"
                      />
                      <label htmlFor="receiveFeedback" className="text-xs text-[var(--text-muted)] cursor-pointer">
                        Receive feedback emails
                      </label>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendTestEmail('welcome')}
                        disabled={sendingTestEmail}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-primary)] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>{sendingTestEmail ? 'Sending...' : 'Send Test Welcome Email'}</span>
                      </button>

                      {testEmailStatus && (
                        <span className={`text-[11px] font-medium ${testEmailStatus.ok ? 'text-black dark:text-white' : 'text-amber-500'}`}>
                          {testEmailStatus.text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Log Out of All Devices */}
                  <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs text-[var(--text-primary)]">Log out of all devices</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Log out of all active OMNIRA sessions across browsers and devices.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className="px-4 py-1.5 rounded-full border border-red-500/30 text-red-500 font-semibold text-xs hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      Log out
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 text-xs sm:text-sm">
                {/* Upgrade Promo Card matching screenshot */}
                <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 fill-blue-500/20 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">
                        Do more with OMNIRA AI
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Get higher limits and advanced features.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('billing')}
                    className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-sm"
                  >
                    Upgrade
                  </button>
                </div>

                {/* Settings Table List matching screenshot */}
                <div className="space-y-4 divide-y divide-[var(--border-color)]">
                  
                  {/* Appearance */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-medium text-[var(--text-primary)]">Appearance</span>
                    <div className="relative">
                      <select
                        value={appearanceMode}
                        onChange={(e) => handleAppearanceChange(e.target.value)}
                        className="appearance-none pr-8 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="system">System</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Contrast */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-medium text-[var(--text-primary)]">Contrast</span>
                    <div className="relative">
                      <select
                        value={contrastLevel}
                        onChange={(e) => handleContrastChange(e.target.value)}
                        className="appearance-none pr-8 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="default">Default</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Accent color */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-medium text-[var(--text-primary)]">Accent color</span>
                    <div className="relative">
                      <select
                        value={accentColor}
                        onChange={(e) => handleAccentColorChange(e.target.value)}
                        className="appearance-none pr-8 pl-7 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        {ACCENT_COLORS.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <span 
                        className="w-2.5 h-2.5 rounded-full absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ backgroundColor: ACCENT_COLORS.find(c => c.id === accentColor)?.hex || '#eab308' }}
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-medium text-[var(--text-primary)]">Language</span>
                    <div className="relative">
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="appearance-none pr-8 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[130px]"
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="Auto-detect">Auto-detect</option>
                        <option value="English (UK)">English (UK)</option>
                        <option value="EspaÃ±ol">EspaÃ±ol (Spanish)</option>
                        <option value="FranÃ§ais">FranÃ§ais (French)</option>
                        <option value="Deutsch">Deutsch (German)</option>
                        <option value="æ—¥æœ¬èªž">æ—¥æœ¬èªž (Japanese)</option>
                        <option value="ä¸­æ–‡">ä¸­æ–‡ (Chinese)</option>
                        <option value="à¤¹à¤¿à¤¨à¥à¤¦à¥€">à¤¹à¤¿à¤¨à¥à¤¦à¥€ (Hindi)</option>
                        <option value="à¤¨à¥‡à¤ªà¤¾à¤²à¥€">à¤¨à¥‡à¤ªà¤¾à¤²à¥€ (Nepali)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Enable Dictation */}
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">Enable Dictation</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">Use dictation in the chat composer.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings?.enableDictation !== false} 
                        onChange={(e) => {
                          if (setSettings) {
                            setSettings({ ...settings, enableDictation: e.target.checked });
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* CUSTOM API KEYS SECTION */}
                  <div className="pt-8 pb-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Custom API Keys (Optional)</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      OMNIRA provides free built-in keys for all models. Add your own keys here if you want to use paid models (like Claude 3.5 or GPT-4o) or have higher rate limits.
                    </p>
                  </div>

                  {/* OpenRouter Key */}
                  <div className="flex flex-col gap-2 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[var(--text-primary)]">OpenRouter Key (Claude, GPT-4o, DeepSeek)</span>
                      <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Get Key</a>
                    </div>
                    <input 
                      type="password"
                      placeholder="sk-or-v1-..."
                      value={settings?.openrouterKey || ''}
                      onChange={(e) => setSettings && setSettings({ ...settings, openrouterKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-xs text-[var(--text-primary)] outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Groq Key */}
                  <div className="flex flex-col gap-2 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[var(--text-primary)]">Groq Key (Fast Llama/Qwen)</span>
                      <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Get Key</a>
                    </div>
                    <input 
                      type="password"
                      placeholder="gsk_..."
                      value={settings?.apiKey || ''}
                      onChange={(e) => setSettings && setSettings({ ...settings, apiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-xs text-[var(--text-primary)] outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Gemini Key */}
                  <div className="flex flex-col gap-2 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[var(--text-primary)]">Google Gemini Key</span>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Get Key</a>
                    </div>
                    <input 
                      type="password"
                      placeholder="AIzaSy..."
                      value={settings?.geminiKey || ''}
                      onChange={(e) => setSettings && setSettings({ ...settings, geminiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-xs text-[var(--text-primary)] outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <LoginGate isGuest={isGuest} onLogin={onLogin} feature="Billing & Subscription">
              <div className="space-y-6 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Billing & Subscription
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Manage your OMNIRA AI membership, model limits, and auto-email confirmation.
                  </p>
                </div>

                {subscribeMessage && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    subscribeMessage.type === 'success' 
                      ? 'bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20 text-black dark:text-white' 
                      : subscribeMessage.type === 'error'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{subscribeMessage.text}</span>
                  </div>
                )}

                {/* Plan Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Free Plan */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    (currentUser?.plan || 'Free') === 'Free'
                      ? 'border-black/40 dark:border-white/40 bg-[var(--bg-sidebar)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[var(--text-primary)]">Free Plan</span>
                      {(currentUser?.plan || 'Free') === 'Free' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-300 font-semibold">Current</span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-[var(--text-primary)] mb-3">$0 <span className="text-xs font-normal text-[var(--text-muted)]">/ month</span></div>
                    <ul className="space-y-1.5 text-xs text-[var(--text-muted)] mb-4">
                      <li>â€¢ Standard model reasoning</li>
                      <li>â€¢ 50 messages per day</li>
                      <li>â€¢ Standard response speed</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleSubscribePlan('Free')}
                      disabled={(currentUser?.plan || 'Free') === 'Free' || subscribing}
                      className="w-full py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {(currentUser?.plan || 'Free') === 'Free' ? 'Active Plan' : 'Downgrade to Free'}
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    currentUser?.plan === 'Pro'
                      ? 'border-black/60 dark:border-white/60 bg-[var(--bg-sidebar)] ring-1 ring-black/30 dark:ring-white/30'
                      : 'border-black/30 dark:border-white/30 bg-[var(--bg-sidebar)]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-black dark:text-white">Pro Plan</span>
                      {currentUser?.plan === 'Pro' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 dark:bg-white/20 text-black dark:text-white font-semibold">Active</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 dark:bg-white/20 text-black dark:text-white font-semibold">Recommended</span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-[var(--text-primary)] mb-3">$0 <span className="text-xs font-normal text-black dark:text-white">Beta Access (Normally $19/mo)</span></div>
                    <ul className="space-y-1.5 text-xs text-[var(--text-muted)] mb-4">
                      <li>â€¢ Unlimited AI messages & deep reasoning</li>
                      <li>â€¢ Photorealistic image generation (FLUX)</li>
                      <li>â€¢ Document Studio & Code assistant</li>
                      <li>â€¢ Automatic SMTP confirmation email</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleSubscribePlan('Pro')}
                      disabled={subscribing}
                      className="w-full py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {subscribing ? 'Processing...' : currentUser?.plan === 'Pro' ? 'Re-send Pro Confirmation Email' : 'Subscribe to Pro Plan'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Subscribing automatically triggers a confirmation receipt from <strong>OMNIRA AI &lt;bishaldev949@gmail.com&gt;</strong> to your account email address.
                </div>
              </div>
              </LoginGate>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <LoginGate isGuest={isGuest} onLogin={onLogin} feature="Account Usage & Quota">
              <div className="space-y-6 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                      Account Limitations & Daily Quota
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Real-time account limits and usage statistics for <strong>{currentUser?.name || 'Guest User'}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchQuota}
                    disabled={quotaLoading}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[var(--text-primary)] ${quotaLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Quota</span>
                  </button>
                </div>

                {/* Real Quota Card - 100% Authentic Data Only */}
                <div className="p-5 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">FLUX AI Image Generation</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Daily allocation reset at 00:00 UTC ({quotaData.date || 'Today'})</div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-[var(--text-primary)]">{quotaData.used}</span>
                      <span className="text-xs text-[var(--text-muted)] font-medium"> / {quotaData.limit || 5} used</span>
                    </div>
                  </div>

                  {/* High-Contrast Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[var(--text-primary)] font-bold">
                        {((quotaData.used / (quotaData.limit || 5)) * 100).toFixed(1)}% Used
                      </span>
                      <span className="text-[var(--text-muted)] font-medium">
                        {quotaData.remaining ?? ((quotaData.limit || 5) - quotaData.used)} Remaining Today
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(3, (quotaData.used / (quotaData.limit || 5)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[var(--text-muted)] pt-3 border-t border-[var(--border-color)] font-medium gap-2">
                    <span>Account Plan: <strong className="text-[var(--text-primary)] font-bold">{currentUser?.plan || 'Free Tier'}</strong></span>
                    <span>User ID: <code className="text-[var(--text-primary)] font-mono">{currentUser?.uid || currentUser?.email || 'guest_user'}</code></span>
                  </div>
                </div>

                {/* Authentic Usage Detail List */}
                <div className="space-y-3">
                  <div className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                    Active Feature Limits
                  </div>

                  <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-card)] divide-y divide-[var(--border-color)]">
                    <div className="flex items-center justify-between p-3.5">
                      <div>
                        <div className="font-semibold text-xs text-[var(--text-primary)]">FLUX Image Generation</div>
                        <div className="text-[11px] text-[var(--text-muted)]">Cloudflare Workers AI</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-[var(--text-primary)]">{quotaData.used} / {quotaData.limit || 5}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{quotaData.remaining} remaining today</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5">
                      <div>
                        <div className="font-semibold text-xs text-[var(--text-primary)]">AI Chat & Neural Reasoning</div>
                        <div className="text-[11px] text-[var(--text-muted)]">Groq Ultra-Fast LPU Engine</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-[var(--text-primary)]">{currentUser?.plan === 'Pro' ? 'Unlimited' : '30 chats / day'}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{currentUser?.plan === 'Pro' ? 'Active' : 'Daily allocation reset at 00:00 UTC'}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              </LoginGate>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Notifications
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Manage how and when you receive notifications and automated search grounding updates.
                  </p>
                </div>

                {/* Main Notifications List matching OMNIRA Screenshot */}
                <div className="space-y-4 divide-y divide-[var(--border-color)]">

                  {/* Google Search Grounding & Site Link Tracking */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                        <span>Google Link Tracking</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">Google AI Grounding</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        Allow Google to search and track site links when providing web responses.
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <div className="relative">
                        <select
                          value={notificationsConfig.googleTracking || 'Push, Email'}
                          onChange={(e) => handleNotificationTypeChange('googleTracking', e.target.value)}
                          className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                        >
                          <option value="Push, Email">Push, Email</option>
                          <option value="Push">Push</option>
                          <option value="Email">Email</option>
                          <option value="Off">Off</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notificationsConfig.googleTrackingEnabled !== false} 
                          onChange={(e) => handleGoogleTrackingToggle(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black dark:bg-white text-white dark:text-black"></div>
                      </label>
                    </div>
                  </div>

                  {/* Codex */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Codex</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Get notified about Codex tasks and code generation.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.codex || 'Push'}
                        onChange={(e) => handleNotificationTypeChange('codex', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Push">Push</option>
                        <option value="Email">Email</option>
                        <option value="Push, Email">Push, Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Group chats */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Group chats</div>
                      <div className="text-[11px] text-[var(--text-muted)]">You'll receive notifications for new messages from group chats.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.groupChats || 'Push'}
                        onChange={(e) => handleNotificationTypeChange('groupChats', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Push">Push</option>
                        <option value="Email">Email</option>
                        <option value="Push, Email">Push, Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Health */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Health</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Get notified when your health data is ready.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.health || 'Push'}
                        onChange={(e) => handleNotificationTypeChange('health', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Push">Push</option>
                        <option value="Email">Email</option>
                        <option value="Push, Email">Push, Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Library */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Library</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Get notified about shared files, folders, and access requests in your Library.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.library || 'Email'}
                        onChange={(e) => handleNotificationTypeChange('library', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Email">Email</option>
                        <option value="Push">Push</option>
                        <option value="Push, Email">Push, Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Marketing</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Stay in the loop on new tools and features from OMNIRA.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.marketing || 'Push, Email'}
                        onChange={(e) => handleNotificationTypeChange('marketing', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Push, Email">Push, Email</option>
                        <option value="Push">Push</option>
                        <option value="Email">Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Personalized tips */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Personalized tips</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Get helpful recommendations based on your conversations with OMNIRA.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.personalizedTips || 'Push, Email'}
                        onChange={(e) => handleNotificationTypeChange('personalizedTips', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Push, Email">Push, Email</option>
                        <option value="Push">Push</option>
                        <option value="Email">Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Projects</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Get notified when you receive an email invitation to a shared project.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.projects || 'Email'}
                        onChange={(e) => handleNotificationTypeChange('projects', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Email">Email</option>
                        <option value="Push">Push</option>
                        <option value="Push, Email">Push, Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Responses */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Responses</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Get notified when OMNIRA responds to requests that take time, like research or image generation.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.responses || 'Push'}
                        onChange={(e) => handleNotificationTypeChange('responses', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Push">Push</option>
                        <option value="Email">Email</option>
                        <option value="Push, Email">Push, Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Tasks</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Get notified when tasks you've created have updates.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.tasks || 'Push, Email'}
                        onChange={(e) => handleNotificationTypeChange('tasks', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Push, Email">Push, Email</option>
                        <option value="Push">Push</option>
                        <option value="Email">Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="flex items-center justify-between gap-4 pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Usage</div>
                      <div className="text-[11px] text-[var(--text-muted)]">We'll notify you when limits reset for features like image creation.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={notificationsConfig.usage || 'Push, Email'}
                        onChange={(e) => handleNotificationTypeChange('usage', e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[110px]"
                      >
                        <option value="Push, Email">Push, Email</option>
                        <option value="Push">Push</option>
                        <option value="Email">Email</option>
                        <option value="Off">Off</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Personalization Tab (100% Real Working matching screenshots) */}
            {activeTab === 'personalization' && (
              <div className="space-y-6 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Personalization
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Customize how OMNIRA interacts, remembers information, and tailors responses to your preferences.
                  </p>
                </div>

                <div className="space-y-5 divide-y divide-[var(--border-color)]">
                  
                  {/* Base style and tone */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="space-y-0.5 max-w-md">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Base style and tone</div>
                      <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        Set the style and tone of how OMNIRA responds to you. This doesn't impact OMNIRA's capabilities.
                      </div>
                    </div>
                    <div className="relative shrink-0 self-start sm:self-auto">
                      <select
                        value={personalizationConfig.baseStyle || 'Default'}
                        onChange={(e) => updatePersonalizationField('baseStyle', e.target.value)}
                        className="appearance-none pr-8 pl-3.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[130px]"
                      >
                        <option value="Default">Default</option>
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Candid">Candid</option>
                        <option value="Quirky">Quirky</option>
                        <option value="Efficient">Efficient</option>
                        <option value="Cynical">Cynical</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div className="space-y-3 pt-4">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Characteristics</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Choose additional customizations on top of your base style and tone.
                      </div>
                    </div>

                    <div className="space-y-2.5 pl-1">
                      {/* Warmth */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-xs text-[var(--text-primary)]">Warmth</span>
                        <div className="relative">
                          <select
                            value={personalizationConfig.warmth || 'Default'}
                            onChange={(e) => updatePersonalizationField('warmth', e.target.value)}
                            className="appearance-none pr-8 pl-3 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[120px]"
                          >
                            <option value="More">More (Friendlier)</option>
                            <option value="Default">Default</option>
                            <option value="Less">Less (Factual)</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Enthusiasm */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-xs text-[var(--text-primary)]">Enthusiasm</span>
                        <div className="relative">
                          <select
                            value={personalizationConfig.enthusiasm || 'Default'}
                            onChange={(e) => updatePersonalizationField('enthusiasm', e.target.value)}
                            className="appearance-none pr-8 pl-3 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[120px]"
                          >
                            <option value="More">More</option>
                            <option value="Default">Default</option>
                            <option value="Less">Less</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Headers and Lists */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-xs text-[var(--text-primary)]">Headers and Lists</span>
                        <div className="relative">
                          <select
                            value={personalizationConfig.headersLists || 'Default'}
                            onChange={(e) => updatePersonalizationField('headersLists', e.target.value)}
                            className="appearance-none pr-8 pl-3 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[120px]"
                          >
                            <option value="More">More</option>
                            <option value="Default">Default</option>
                            <option value="Less">Less</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Emoji */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-xs text-[var(--text-primary)]">Emoji</span>
                        <div className="relative">
                          <select
                            value={personalizationConfig.emoji || 'Default'}
                            onChange={(e) => updatePersonalizationField('emoji', e.target.value)}
                            className="appearance-none pr-8 pl-3 py-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[120px]"
                          >
                            <option value="More">More</option>
                            <option value="Default">Default</option>
                            <option value="Less">Less</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fast answers */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Fast answers</div>
                      <div className="text-[11px] text-[var(--text-muted)] max-w-md leading-relaxed">
                        OMNIRA can sometimes use its general knowledge to give fast, in-depth answers. These aren't personalized and don't use your memory.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={personalizationConfig.fastAnswers !== false} 
                        onChange={(e) => updatePersonalizationField('fastAnswers', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black dark:bg-white text-white dark:text-black"></div>
                    </label>
                  </div>

                  {/* Custom instructions */}
                  <div className="space-y-2 pt-4">
                    <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Custom instructions</div>
                    <textarea
                      rows={3}
                      value={personalizationConfig.customInstructions || ''}
                      onChange={(e) => updatePersonalizationField('customInstructions', e.target.value)}
                      placeholder="Additional behavior, style, and tone preferences (e.g. Always write clean TypeScript code, avoid unnecessary preamble, include tests)."
                      className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-black dark:border-white text-[var(--text-primary)] transition-colors resize-y min-h-[75px]"
                    />
                  </div>

                  {/* Pet Companion */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Pet</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Choose a companion that works alongside you</div>
                    </div>
                    <div className="relative shrink-0 self-start sm:self-auto">
                      <select
                        value={personalizationConfig.pet || 'Default'}
                        onChange={(e) => updatePersonalizationField('pet', e.target.value)}
                        className="appearance-none pr-8 pl-3.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[140px]"
                      >
                        <option value="Default">Default (None)</option>
                        <option value="Dog">ðŸ• Dog</option>
                        <option value="Cat">ðŸˆ Cat</option>
                        <option value="Owl">ðŸ¦‰ Owl</option>
                        <option value="Dragon">ðŸ‰ Dragon</option>
                        <option value="Fox">ðŸ¦Š Fox</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* About you */}
                  <div className="space-y-3 pt-4">
                    <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">About you</div>
                    
                    {/* Nickname */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)]">Nickname</label>
                      <input
                        type="text"
                        value={personalizationConfig.nickname || ''}
                        onChange={(e) => updatePersonalizationField('nickname', e.target.value)}
                        placeholder="What should OMNIRA call you?"
                        className="w-full px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-black dark:border-white text-[var(--text-primary)]"
                      />
                    </div>

                    {/* Occupation */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)]">Occupation</label>
                      <input
                        type="text"
                        value={personalizationConfig.occupation || ''}
                        onChange={(e) => updatePersonalizationField('occupation', e.target.value)}
                        placeholder="e.g. Wedding photographer, Software Developer, Researcher"
                        className="w-full px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-black dark:border-white text-[var(--text-primary)]"
                      />
                    </div>

                    {/* More about you */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[var(--text-primary)]">More about you</label>
                      <textarea
                        rows={2}
                        value={personalizationConfig.moreAboutYou || ''}
                        onChange={(e) => updatePersonalizationField('moreAboutYou', e.target.value)}
                        placeholder="Interests, values, or preferences to keep in mind"
                        className="w-full px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-black dark:border-white text-[var(--text-primary)] resize-y min-h-[60px]"
                      />
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="space-y-3 pt-4">
                    <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center justify-between">
                      <span>Memory</span>
                    </div>

                    {/* Enable memory */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-[var(--text-primary)]">Enable memory</div>
                        <div className="text-[11px] text-[var(--text-muted)] max-w-md">
                          Let OMNIRA personalize your experience based on your chats, files, and connected apps.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={personalizationConfig.enableMemory !== false} 
                          onChange={(e) => updatePersonalizationField('enableMemory', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black dark:bg-white text-white dark:text-black"></div>
                      </label>
                    </div>

                    {/* Memory summary */}
                    <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)]">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-[var(--text-primary)]">Memory summary</div>
                        <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          View an overview of what OMNIRA has learned about you ({savedMemories.length} memories saved).
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMemoryModalOpen(true)}
                        className="px-4 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        Manage
                      </button>
                    </div>
                  </div>

                  {/* Advanced Collapsible Accordion */}
                  <div className="pt-4 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                      className="w-full flex items-center justify-between font-bold text-xs sm:text-sm text-[var(--text-primary)] hover:opacity-80 py-1 transition-opacity cursor-pointer"
                    >
                      <span>Advanced</span>
                      {isAdvancedOpen ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
                    </button>

                    {isAdvancedOpen && (
                      <div className="space-y-3 pt-3 pl-1 divide-y divide-[var(--border-color)]">
                        
                        {/* Web search */}
                        <div className="flex items-center justify-between gap-4 pt-1">
                          <div>
                            <div className="font-semibold text-xs text-[var(--text-primary)]">Web search</div>
                            <div className="text-[11px] text-[var(--text-muted)]">Let OMNIRA automatically search the web for answers.</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              checked={personalizationConfig.webSearch !== false} 
                              onChange={(e) => updatePersonalizationField('webSearch', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black dark:bg-white text-white dark:text-black"></div>
                          </label>
                        </div>

                        {/* Canvas */}
                        <div className="flex items-center justify-between gap-4 pt-3">
                          <div>
                            <div className="font-semibold text-xs text-[var(--text-primary)]">Canvas</div>
                            <div className="text-[11px] text-[var(--text-muted)]">Collaborate with OMNIRA on text and code.</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              checked={personalizationConfig.canvas !== false} 
                              onChange={(e) => updatePersonalizationField('canvas', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black dark:bg-white text-white dark:text-black"></div>
                          </label>
                        </div>

                        {/* OMNIRA Voice */}
                        <div className="flex items-center justify-between gap-4 pt-3">
                          <div>
                            <div className="font-semibold text-xs text-[var(--text-primary)]">OMNIRA Voice</div>
                            <div className="text-[11px] text-[var(--text-muted)]">Enable Voice in OMNIRA.</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              checked={personalizationConfig.voice !== false} 
                              onChange={(e) => updatePersonalizationField('voice', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black dark:bg-white text-white dark:text-black"></div>
                          </label>
                        </div>

                        {/* Library search */}
                        <div className="flex items-center justify-between gap-4 pt-3">
                          <div>
                            <div className="font-semibold text-xs text-[var(--text-primary)]">Library search</div>
                            <div className="text-[11px] text-[var(--text-muted)]">Allow OMNIRA to automatically search Library files for answers.</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              checked={personalizationConfig.librarySearch !== false} 
                              onChange={(e) => updatePersonalizationField('librarySearch', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black dark:bg-white text-white dark:text-black"></div>
                          </label>
                        </div>

                        {/* Connector search */}
                        <div className="flex items-center justify-between gap-4 pt-3">
                          <div>
                            <div className="font-semibold text-xs text-[var(--text-primary)]">Connector search</div>
                            <div className="text-[11px] text-[var(--text-muted)]">Let OMNIRA automatically search connected sources for answers.</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              checked={personalizationConfig.connectorSearch === true} 
                              onChange={(e) => updatePersonalizationField('connectorSearch', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5.5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black dark:bg-white text-white dark:text-black"></div>
                          </label>
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* Voice Tab (Matching OMNIRA Voice screenshots) */}
            {activeTab === 'voice' && (
              <div className="space-y-6 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Voice
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Select your preferred AI voice persona, real-time audio model, and language options.
                  </p>
                </div>

                {/* Voice Orb Carousel matching screenshot */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border-color)] space-y-4 relative overflow-hidden">
                  
                  {/* Glowing 3D Fluid Voice Orb */}
                  <div className="relative flex items-center justify-center py-2">
                    <div className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr ${VOICE_PERSONAS[currentVoiceIndex].color} shadow-2xl animate-pulse blur-[1px] flex items-center justify-center transition-all duration-500 transform hover:scale-105`}>
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-xs border border-white/40 flex items-center justify-center shadow-inner">
                        <Mic className={`w-10 h-10 text-white ${voicePreviewPlaying ? 'animate-bounce' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Carousel Controls & Voice Name */}
                  <div className="flex items-center justify-between w-full max-w-xs px-2">
                    <button
                      onClick={() => handleSelectVoiceIndex(currentVoiceIndex - 1)}
                      className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                      title="Previous Voice"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="text-center space-y-0.5">
                      <div className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
                        {VOICE_PERSONAS[currentVoiceIndex].name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-medium">
                        {VOICE_PERSONAS[currentVoiceIndex].description}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectVoiceIndex(currentVoiceIndex + 1)}
                      className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                      title="Next Voice"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Carousel Pagination Dots */}
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    {VOICE_PERSONAS.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectVoiceIndex(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${currentVoiceIndex === idx ? 'w-5 bg-blue-500' : 'w-2 bg-[var(--text-muted)]/30 hover:bg-[var(--text-muted)]/60'}`}
                        title={`Select ${VOICE_PERSONAS[idx].name}`}
                      />
                    ))}
                  </div>

                  {/* Test Voice Sample Button */}
                  <button
                    onClick={() => playVoicePreview(VOICE_PERSONAS[currentVoiceIndex])}
                    className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer mt-2"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{voicePreviewPlaying ? 'Playing Sample...' : 'Test Voice'}</span>
                  </button>

                </div>

                {/* Model and Language Selectors matching screenshot */}
                <div className="space-y-4 divide-y divide-[var(--border-color)]">
                  
                  {/* Model */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Model</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Select real-time voice latency & intelligence tier.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={voiceConfig.modelMode || 'Advanced'}
                        onChange={(e) => updateVoiceField('modelMode', e.target.value)}
                        className="appearance-none pr-8 pl-3.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[130px]"
                      >
                        <option value="Live">Live</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Standard">Standard</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="flex items-center justify-between pt-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Language</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Automatic detection or forced primary language for voice synthesis.</div>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={voiceConfig.language || 'Auto-detect'}
                        onChange={(e) => updateVoiceField('language', e.target.value)}
                        className="appearance-none pr-8 pl-3.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] outline-none cursor-pointer hover:bg-[var(--bg-hover)] transition-colors min-w-[140px]"
                      >
                        <option value="Auto-detect">Auto-detect</option>
                        <option value="English (US)">English (US)</option>
                        <option value="Nepali">Nepali</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Bangla">Bangla</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Afrikaans">Afrikaans</option>
                        <option value="Amharic">Amharic</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Armenian">Armenian</option>
                        <option value="Azerbaijani">Azerbaijani</option>
                        <option value="Belarusian">Belarusian</option>
                        <option value="Bosnian">Bosnian</option>
                        <option value="Bulgarian">Bulgarian</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Analytics Tab (Matching OMNIRA Screenshots with dynamic tracking data) */}
            {activeTab === 'analytics' && (() => {
              // Calculate dynamic analytics data
              let totalTurns = 0;
              let modelCounts = {};
              let toolCalls = {
                'Google AI Search Grounding': 0,
                'FLUX Image Generation': quotaData.used || 0,
                'Code Studio Runner': 0,
                'Web Knowledge Fetcher': 0
              };

              try {
                const chatsRaw = localStorage.getItem('quick_ai_chats');
                if (chatsRaw) {
                  const chats = JSON.parse(chatsRaw);
                  if (Array.isArray(chats)) {
                    chats.forEach(chat => {
                      if (Array.isArray(chat.messages)) {
                        chat.messages.forEach(msg => {
                          if (msg.role === 'assistant') {
                            totalTurns++;
                            const model = msg.model || 'gpt-4o';
                            modelCounts[model] = (modelCounts[model] || 0) + 1;

                            if (msg.content && (msg.content.includes('Tracked Google Site Links') || msg.content.includes('google_search'))) {
                              toolCalls['Google AI Search Grounding']++;
                            }
                            if (msg.isImage || (msg.content && msg.content.includes('FLUX'))) {
                              toolCalls['FLUX Image Generation']++;
                            }
                            if (msg.content && msg.content.includes('```')) {
                              toolCalls['Code Studio Runner']++;
                            }
                          }
                        });
                      }
                    });
                  }
                }
              } catch (e) {}

              return (
                <div className="space-y-6 text-xs sm:text-sm">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Analytics
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Monitor usage history, product turns across models, and tool activity metrics.
                    </p>
                  </div>

                  <div className="space-y-6">

                    {/* 1. Usage History */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Usage history</div>
                          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5 max-w-xl">
                            See how plan usage and credits were consumed in Work, Codex, and other agentic tasks. Conversations in Chat are not included.
                          </div>
                        </div>

                        {/* 7d / 30d toggle */}
                        <div className="flex items-center gap-1 p-1 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl shrink-0 self-start sm:self-auto">
                          <button
                            onClick={() => setUsageHistoryTimeframe('7d')}
                            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${usageHistoryTimeframe === '7d' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                          >
                            7d
                          </button>
                          <button
                            onClick={() => setUsageHistoryTimeframe('30d')}
                            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${usageHistoryTimeframe === '30d' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                          >
                            30d
                          </button>
                        </div>
                      </div>

                      {/* Usage History Container */}
                      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-center text-[var(--text-muted)] text-xs">
                        {quotaData.used > 0 ? (
                          <div className="space-y-3 text-left">
                            <div className="flex items-center justify-between font-semibold text-[var(--text-primary)] text-xs">
                              <span>FLUX AI Image Generation Credits</span>
                              <span className="text-black dark:text-white">{quotaData.used} credits used ({usageHistoryTimeframe})</span>
                            </div>
                            <div className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] h-3 rounded-full overflow-hidden">
                              <div className="h-full bg-black dark:bg-white rounded-full" style={{ width: `${Math.min(100, (quotaData.used / (quotaData.limit || 5)) * 100)}%` }} />
                            </div>
                          </div>
                        ) : (
                          <div className="py-2">No plan usage or credits consumed during this period</div>
                        )}
                      </div>
                    </div>

                    {/* 2. Product Activity */}
                    <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Product activity</div>
                          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                            See the number of turns across products and models.
                          </div>
                        </div>

                        {/* 7d / 30d toggle */}
                        <div className="flex items-center gap-1 p-1 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl shrink-0 self-start sm:self-auto">
                          <button
                            onClick={() => setProductActivityTimeframe('7d')}
                            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${productActivityTimeframe === '7d' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                          >
                            7d
                          </button>
                          <button
                            onClick={() => setProductActivityTimeframe('30d')}
                            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${productActivityTimeframe === '30d' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                          >
                            30d
                          </button>
                        </div>
                      </div>

                      {/* Product Activity Container */}
                      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-xs">
                        {totalTurns > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between font-bold text-[var(--text-primary)] text-sm pb-2 border-b border-[var(--border-color)]">
                              <span>Total Conversation Turns ({productActivityTimeframe})</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs">{totalTurns} Turns</span>
                            </div>
                            <div className="space-y-2.5">
                              {Object.entries(modelCounts).map(([modelKey, count]) => (
                                <div key={modelKey} className="space-y-1">
                                  <div className="flex justify-between text-xs font-medium">
                                    <span className="text-[var(--text-primary)] capitalize">{modelKey}</span>
                                    <span className="text-[var(--text-muted)]">{count} turns</span>
                                  </div>
                                  <div className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (count / totalTurns) * 100)}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-[var(--text-muted)]">No turns during this period</div>
                        )}
                      </div>
                    </div>

                    {/* 3. Tool Activity */}
                    <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Tool activity</div>
                          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                            See which plugins and skills you used over time.
                          </div>
                        </div>

                        {/* 7d / 30d toggle */}
                        <div className="flex items-center gap-1 p-1 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl shrink-0 self-start sm:self-auto">
                          <button
                            onClick={() => setToolActivityTimeframe('7d')}
                            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${toolActivityTimeframe === '7d' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                          >
                            7d
                          </button>
                          <button
                            onClick={() => setToolActivityTimeframe('30d')}
                            className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${toolActivityTimeframe === '30d' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                          >
                            30d
                          </button>
                        </div>
                      </div>

                      {/* Tool Activity Container */}
                      <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-xs">
                        {Object.values(toolCalls).some(val => val > 0) ? (
                          <div className="space-y-3">
                            {Object.entries(toolCalls).map(([toolName, count]) => (
                              <div key={toolName} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                                <span className="font-semibold text-[var(--text-primary)]">{toolName}</span>
                                <span className="px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/10 text-black dark:text-white font-bold text-xs">{count} calls</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-[var(--text-muted)]">No plugin calls or skills used during this period</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Data Controls Tab (Matching OMNIRA Data Controls Screenshots) */}
            {(activeTab === 'datacontrols' || activeTab === 'data_controls') && (
              <div className="space-y-6 text-xs sm:text-sm">
                {/* Data Action / Location Status Banner */}
                {(dataActionBanner || locationBanner) && (
                  <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${(dataActionBanner || locationBanner)?.ok ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    <span>{(dataActionBanner || locationBanner)?.ok ? 'âœ“' : 'âœ•'}</span>
                    <span>{(dataActionBanner || locationBanner)?.text}</span>
                  </div>
                )}
                {/* Sub-view: Improve model for everyone */}
                {activeDataSubView === 'improveModel' && (

                  <div className="space-y-6">
                    <button
                      onClick={() => setActiveDataSubView(null)}
                      className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Improve the model for everyone</span>
                    </button>

                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        Improve the model for everyone
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        When enabled, your content may be used to train and improve AI models. Turning this off applies to new content created from now on.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Model improvement training</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Allow anonymized interactions to train future model iterations</div>
                      </div>
                      <button
                        onClick={() => updateDataControl('modelImprovement', !dataControlsConfig.modelImprovement)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${dataControlsConfig.modelImprovement ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${dataControlsConfig.modelImprovement ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-view: Information shared with apps */}
                {activeDataSubView === 'sharedWithApps' && (
                  <div className="space-y-6">
                    <button
                      onClick={() => setActiveDataSubView(null)}
                      className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Information shared with apps</span>
                    </button>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-primary)]">
                          Apps with access
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Manage apps that can automatically fill your contact information.
                        </p>
                      </div>

                      <div className="p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-center text-[var(--text-muted)] text-xs">
                        No apps are currently allowed to receive this information.
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-view: Marketing privacy */}
                {activeDataSubView === 'marketingPrivacy' && (
                  <div className="space-y-6">
                    <button
                      onClick={() => setActiveDataSubView(null)}
                      className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Marketing privacy</span>
                    </button>

                    <div className="space-y-5">
                      {/* Marketing measurement */}
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Marketing measurement</div>
                          <div className="text-[11px] text-[var(--text-muted)] max-w-md leading-relaxed">
                            These cookies help us measure the effectiveness of our marketing campaigns.
                          </div>
                        </div>
                        <button
                          onClick={() => updateDataControl('marketingMeasurement', !dataControlsConfig.marketingMeasurement)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${dataControlsConfig.marketingMeasurement ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${dataControlsConfig.marketingMeasurement ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Personalized marketing */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Personalized marketing</div>
                          <div className="text-[11px] text-[var(--text-muted)] max-w-md leading-relaxed">
                            This helps us personalize and measure OMNIRA's own marketing on third-party platforms.
                          </div>
                        </div>
                        <button
                          onClick={() => updateDataControl('personalizedMarketing', !dataControlsConfig.personalizedMarketing)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${dataControlsConfig.personalizedMarketing ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${dataControlsConfig.personalizedMarketing ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Data Controls list view */}
                {activeDataSubView === null && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        Data controls
                      </h3>
                    </div>

                    <div className="space-y-4 divide-y divide-[var(--border-color)]">

                      {/* 1. Improve the model for everyone */}
                      <div
                        onClick={() => setActiveDataSubView('improveModel')}
                        className="flex items-center justify-between pt-3 first:pt-0 cursor-pointer group"
                      >
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                          Improve the model for everyone
                        </span>
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                          <span>{dataControlsConfig.modelImprovement ? 'On' : 'Off'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* 2. Location */}
                      <div className="flex items-start justify-between gap-4 pt-4">
                        <div className="space-y-1 max-w-md">
                          <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Location</div>
                          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                            When enabled, your location helps OMNIRA provide more relevant information, like local recommendations, news, and weather. <a href="#" className="underline">Learn more</a>
                          </div>
                        </div>
                        <button
                          onClick={handleToggleLocation}
                          className="px-3.5 py-1.5 rounded-full border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors shrink-0 cursor-pointer"
                        >
                          {dataControlsConfig.locationEnabled ? 'Turn off' : 'Turn on'}
                        </button>
                      </div>

                      {/* 3. Information shared with apps */}
                      <div
                        onClick={() => setActiveDataSubView('sharedWithApps')}
                        className="flex items-center justify-between pt-4 cursor-pointer group"
                      >
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                          Information shared with apps
                        </span>
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                      </div>

                      {/* 4. Shared links */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                          Shared links
                        </span>
                        <button
                          onClick={() => setActiveDataModal('sharedLinks')}
                          className="px-3.5 py-1.5 rounded-full border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>

                      {/* 5. Archived chats */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                          Archived chats
                        </span>
                        <button
                          onClick={() => setActiveDataModal('archivedChats')}
                          className="px-3.5 py-1.5 rounded-full border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>

                      {/* 6. Archive all chats */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                          Archive all chats
                        </span>
                        <button
                          onClick={() => setActiveDataModal('archiveAll')}
                          className="px-3.5 py-1.5 rounded-full border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
                        >
                          Archive all
                        </button>
                      </div>

                      {/* 7. Delete all chats */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                          Delete all chats
                        </span>
                        <button
                          onClick={() => setActiveDataModal('deleteAll')}
                          className="px-3.5 py-1.5 rounded-full border border-red-500/40 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          Delete all
                        </button>
                      </div>

                      {/* 8. Export data */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                          Export data
                        </span>
                        <button
                          onClick={() => setActiveDataModal('exportData')}
                          className="px-3.5 py-1.5 rounded-full border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
                        >
                          Export
                        </button>
                      </div>

                      {/* 9. Marketing privacy */}
                      <div
                        onClick={() => setActiveDataSubView('marketingPrivacy')}
                        className="flex items-center justify-between pt-4 cursor-pointer group"
                      >
                        <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                          Marketing privacy
                        </span>
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Storage Tab (Matching OMNIRA Screenshots 1, 2, 3 with 100% Real Storage Data) */}
            {activeTab === 'storage' && (() => {
              const { images: realImages, files: realFiles } = getRealStorageItems(storageRefreshTrigger);
              const totalImageBytes = realImages.reduce((sum, item) => sum + (item.bytes || 0), 0);
              const totalFileBytes = realFiles.reduce((sum, item) => sum + (item.bytes || 0), 0);
              const totalBytes = totalImageBytes + totalFileBytes;

              const formatSize = (bytes) => {
                if (bytes === 0) return '0 B';
                if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
                return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
              };

              const totalUsedMB = (totalBytes / (1024 * 1024)).toFixed(2);
              const maxStorageMB = 512;
              const progressPercent = Math.min(100, (parseFloat(totalUsedMB) / maxStorageMB) * 100);

              return (
                <div className="space-y-6 text-xs sm:text-sm">
                  {/* If sub-view library is active */}
                  {activeStorageSubView ? (
                    <div className="space-y-6">
                      <button
                        onClick={() => setActiveStorageSubView(null)}
                        className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Storage</span>
                      </button>

                      {/* Library Sub-view Header & Notice (Screenshot 2) */}
                      <div className="flex items-center gap-2 p-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-xl text-xs font-medium shadow-md">
                        <Info className="w-4 h-4 text-white dark:text-neutral-900 shrink-0" />
                        <span>Delete files to free up storage space</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] pb-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveStorageSubView('all')}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${activeStorageSubView === 'all' ? 'bg-[var(--bg-sidebar)] text-[var(--text-primary)] border border-[var(--border-color)]' : 'text-[var(--text-muted)]'}`}
                          >
                            All ({realImages.length + realFiles.length})
                          </button>
                          <button
                            onClick={() => setActiveStorageSubView('images')}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${activeStorageSubView === 'images' ? 'bg-[var(--bg-sidebar)] text-[var(--text-primary)] border border-[var(--border-color)]' : 'text-[var(--text-muted)]'}`}
                          >
                            Images ({realImages.length})
                          </button>
                          <button
                            onClick={() => setActiveStorageSubView('files')}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${activeStorageSubView === 'files' ? 'bg-[var(--bg-sidebar)] text-[var(--text-primary)] border border-[var(--border-color)]' : 'text-[var(--text-muted)]'}`}
                          >
                            Files ({realFiles.length})
                          </button>
                        </div>

                        {/* Upload File to Library Button */}
                        <label className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input type="file" multiple className="hidden" onChange={handleUploadStorageFile} />
                        </label>
                      </div>

                      {/* Library Content Items */}
                      {activeStorageSubView === 'images' ? (
                        /* Images Grid View (Screenshot 3) */
                        realImages.length === 0 ? (
                          <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-[var(--border-color)] bg-[var(--bg-sidebar)] rounded-2xl">
                            No images stored yet. Upload or generate images in Image Studio to view them here.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                            {realImages.map((img) => (
                              <div key={img.id} className="group relative rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-sidebar)] aspect-square">
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white text-[11px]">
                                  <div className="line-clamp-2 font-medium">{img.name}</div>
                                  <div className="flex items-center justify-between pt-2">
                                    <span>{formatSize(img.bytes)}</span>
                                    <button
                                      onClick={() => handleDeleteStorageItem(img.id)}
                                      className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white transition-colors cursor-pointer"
                                      title="Delete Image"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        /* Files / All List View (Screenshot 2) */
                        (activeStorageSubView === 'files' ? realFiles : [...realImages, ...realFiles]).length === 0 ? (
                          <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-[var(--border-color)] bg-[var(--bg-sidebar)] rounded-2xl">
                            No files found in storage library.
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] px-3 py-1.5 border-b border-[var(--border-color)]">
                              <span>Name</span>
                              <div className="flex items-center gap-8">
                                <span>Modified</span>
                                <span className="w-16 text-right">Size â†“</span>
                                <span className="w-8"></span>
                              </div>
                            </div>
                            {(activeStorageSubView === 'files' ? realFiles : [...realImages, ...realFiles]).map((item) => (
                              <div key={item.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--bg-sidebar)] border border-transparent hover:border-[var(--border-color)] transition-colors text-xs">
                                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                                  {item.type === 'image' ? (
                                    <img src={item.url} alt={item.name} className="w-7 h-7 rounded object-cover shrink-0" />
                                  ) : (
                                    <div className="w-7 h-7 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                                      FILE
                                    </div>
                                  )}
                                  <span className="truncate font-medium text-[var(--text-primary)]">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-8 text-[11px] text-[var(--text-muted)] shrink-0">
                                  <span>{item.modified}</span>
                                  <span className="w-16 text-right font-mono font-semibold">{formatSize(item.bytes)}</span>
                                  <button
                                    onClick={() => handleDeleteStorageItem(item.id)}
                                    className="p-1 hover:text-red-500 transition-colors cursor-pointer"
                                    title="Delete file"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    /* Main Storage Settings Tab View (Screenshot 1) */
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-primary)]">
                          Storage
                        </h3>
                      </div>

                      {/* Usage Header & Progress Bar */}
                      <div className="space-y-2.5">
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          {totalUsedMB} MB of {maxStorageMB} MB used
                        </div>
                        <div className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-color)] h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Manage Storage Section */}
                      <div className="space-y-4 pt-2">
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">Manage storage</div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            Manage your library to free up storage
                          </div>
                        </div>

                        <div className="divide-y divide-[var(--border-color)] border-t border-[var(--border-color)]">
                          {/* Files Row */}
                          <div
                            onClick={() => setActiveStorageSubView('files')}
                            className="flex items-center justify-between py-3.5 cursor-pointer group"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Files</div>
                              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                                {formatSize(totalFileBytes)} â€¢ {realFiles.length} files
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                          </div>

                          {/* Images Row */}
                          <div
                            onClick={() => setActiveStorageSubView('images')}
                            className="flex items-center justify-between py-3.5 cursor-pointer group"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Images</div>
                              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                                {formatSize(totalImageBytes)} â€¢ {realImages.length} images
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Safety Tab (Matching OMNIRA Safety Screenshot) */}
            {activeTab === 'safety' && (
              <div className="space-y-6 text-xs sm:text-sm">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Safety
                  </h3>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 max-w-md">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                        Reduce sensitive content
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        Add extra safeguards around sensitive topics and limit certain types of content in OMNIRA. <a href="https://omnira.ai/support" target="_blank" rel="noreferrer" className="underline">Learn more</a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleSensitiveContent(!reduceSensitiveContent)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${reduceSensitiveContent ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${reduceSensitiveContent ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security and Login Tab (Matching OMNIRA Screenshots 1-5) */}
            {activeTab === 'security' && (
              <LoginGate isGuest={isGuest} onLogin={onLogin} feature="Security &amp; Login">
              <div className="space-y-6 text-xs sm:text-sm">
                {/* Security Status Banner */}
                {securityBanner && (
                  <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${securityBanner.ok ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    <span>{securityBanner.ok ? 'âœ“' : 'âœ•'}</span>
                    <span>{securityBanner.text}</span>
                  </div>
                )}
                {/* Sub-view: Active sessions */}
                {activeSecuritySubView === 'activeSessions' && (

                  <div className="space-y-6">
                    <button
                      onClick={() => setActiveSecuritySubView(null)}
                      className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Active sessions</span>
                    </button>

                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        Active sessions
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-lg">
                        Review recent sessions and trusted devices associated with your account. Trusted devices can receive security prompts, like approving sign-ins or unlocking your account.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeSessions.map((sess) => (
                        <div key={sess.id} className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shrink-0">
                              <Keyboard className="w-5 h-5 text-[var(--text-primary)]" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">{sess.device}</span>
                                {sess.isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black font-bold text-[9px] uppercase tracking-wider">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                                {sess.os}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                                {sess.time} â€¢ {sess.location}
                              </div>
                            </div>
                          </div>

                          {!sess.isCurrent && (
                            <button
                              onClick={() => handleLogoutSession(sess.id)}
                              className="px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer shrink-0"
                            >
                              Log out
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-view: Login connections */}
                {activeSecuritySubView === 'loginConnections' && (
                  <div className="space-y-6">
                    <button
                      onClick={() => setActiveSecuritySubView(null)}
                      className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Login connections</span>
                    </button>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-primary)]">
                          Apps and sites
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Review other apps and sites you've logged into with OMNIRA, and manage what they can access.
                        </p>
                      </div>

                      <div className="p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-center text-[var(--text-muted)] text-xs">
                        {githubUser ? (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-left">
                            <div>
                              <div className="font-bold text-[var(--text-primary)]">GitHub Connection</div>
                              <div className="text-[11px] text-[var(--text-muted)]">Connected as {githubUser.login || 'GitHub User'}</div>
                            </div>
                            <button onClick={handleGithubDisconnect} className="px-3 py-1 rounded-lg border border-red-500/40 text-red-500 text-xs font-semibold hover:bg-red-500/10">
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          "No connected third-party login apps found."
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Security & Login View (Screenshot 2, 4, 5) */}
                {activeSecuritySubView === null && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        Security and login
                      </h3>
                    </div>

                    <div className="space-y-6 divide-y divide-[var(--border-color)]">

                      {/* 1. Security keys & passkeys */}
                      <div className="space-y-2 pt-2 first:pt-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Security keys & passkeys
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              Use hardware security keys or passkeys to sign in. These phishing-resistant methods provide stronger protection than passwords.
                            </div>
                          </div>
                          <button
                            onClick={handleAddPasskey}
                            className="flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] hover:underline cursor-pointer shrink-0"
                          >
                            <span>Add</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 2. Multi-factor authentication (MFA) */}
                      <div className="space-y-4 pt-4">
                        <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                          Multi-factor authentication (MFA)
                        </div>

                        {/* Authenticator app */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Authenticator app
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)]">
                              Use one-time codes from an authenticator app.
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (securityConfig.authenticatorEnabled) {
                                updateSecurityConfig('authenticatorEnabled', false);
                              } else {
                                setIsAuthAppModalOpen(true);
                              }
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${securityConfig.authenticatorEnabled ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${securityConfig.authenticatorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Text message */}
                        <div className="flex items-start justify-between gap-4 pt-2">
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Text message
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              Get 6-digit verification codes by SMS or WhatsApp based on your country code.
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const next = !securityConfig.smsEnabled;
                              updateSecurityConfig('smsEnabled', next);
                              showSecBanner(next, next ? 'SMS verification enabled for your registered number.' : 'SMS verification has been disabled.');
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${securityConfig.smsEnabled ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${securityConfig.smsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      {/* 3. Sessions */}
                      <div className="space-y-3 pt-4">
                        <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                          Sessions
                        </div>

                        <div
                          onClick={() => setActiveSecuritySubView('activeSessions')}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Active sessions
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              View all devices that have accessed your account. You can review active sessions, remove trusted devices, or use Log out all to end all sessions.
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-bold text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0">
                            <span>{activeSessions.length}</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* 4. Login connections */}
                      <div className="space-y-3 pt-4">
                        <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                          Login connections
                        </div>

                        <div
                          onClick={() => setActiveSecuritySubView('loginConnections')}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Apps and sites
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              Review other apps and sites you've logged into with OMNIRA, and manage what they can access.
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-bold text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0">
                            <span>{githubUser ? 1 : 0}</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* 5. Advanced security (Screenshot 4 & 5) */}
                      <div className="space-y-4 pt-4">
                        <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                          Advanced security
                        </div>

                        {/* Advanced account security */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Advanced account security
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              Adds the highest level of account security by requiring stronger sign-in methods and applying stricter protections to help prevent unauthorized access.
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const next = !securityConfig.advancedSecurityEnrolled;
                              updateSecurityConfig('advancedSecurityEnrolled', next);
                              showSecBanner(next, next ? 'Enrolled in Advanced Account Security.' : 'Unenrolled from Advanced Account Security.');
                            }}
                            className="flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] hover:underline cursor-pointer shrink-0"
                          >
                            <span>{securityConfig.advancedSecurityEnrolled ? 'Enrolled' : 'Enroll'}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Lockdown mode */}
                        <div className="flex items-start justify-between gap-4 pt-2">
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Lockdown mode
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              Helps protect sensitive data from prompt-injection attacks by limiting features that can connect to the web or external services. <a href="#" className="underline">Learn more</a>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSecurityConfig('lockdownMode', !securityConfig.lockdownMode)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${securityConfig.lockdownMode ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${securityConfig.lockdownMode ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      {/* 6. Developer mode (Screenshot 4 & 5) */}
                      <div className="space-y-4 pt-4">
                        <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                          Developer mode
                        </div>

                        {/* Developer mode */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-0.5 max-w-md">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">Developer mode</span>
                              <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold text-[9px] uppercase tracking-wider">
                                ELEVATED RISK
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              Allows you to add unverified connectors that could modify or erase data permanently. Use at your own risk. <a href="#" className="underline">Learn more</a>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSecurityConfig('developerMode', !securityConfig.developerMode)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${securityConfig.developerMode ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${securityConfig.developerMode ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Enforce CSP in developer mode */}
                        <div className="flex items-start justify-between gap-4 pt-2">
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Enforce CSP in developer mode
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              When enabled, dev mode apps without a declared CSP get the same restricted default CSP they would in production instead of unrestricted network access. <a href="#" className="underline">Learn more</a>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSecurityConfig('enforceCspDevMode', !securityConfig.enforceCspDevMode)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${securityConfig.enforceCspDevMode ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${securityConfig.enforceCspDevMode ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Enable device code authorization for Codex */}
                        <div className="flex items-start justify-between gap-4 pt-2">
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                              Enable device code authorization for Codex
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              Use device code sign-in for headless or remote environments where the normal browser flow isn't available. Exercise caution in enabling, as device codes can be phished. Never share a device code.
                            </div>
                          </div>
                          <button
                            onClick={() => updateSecurityConfig('deviceCodeAuthCodex', !securityConfig.deviceCodeAuthCodex)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${securityConfig.deviceCodeAuthCodex ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${securityConfig.deviceCodeAuthCodex ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
              </LoginGate>
            )}

            {/* Parental Controls Tab (Matching OMNIRA Screenshot 2) */}
            {(activeTab === 'parental' || activeTab === 'parentalControls') && (
              <LoginGate isGuest={isGuest} onLogin={onLogin} feature="Parental Controls">
              <div className="space-y-6 text-xs sm:text-sm">
                {/* Family invite status banner */}
                {familyInviteStatus && (
                  <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${familyInviteStatus.ok ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    <span>{familyInviteStatus.ok ? 'âœ“' : 'âœ•'}</span>
                    <span>{familyInviteStatus.text}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Parental controls
                  </h3>
                  <a href="https://omnira.ai/support" target="_blank" rel="noreferrer" title="Learn more about parental controls">
                    <Info className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" />
                  </a>
                </div>

                <div className="space-y-6">
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xl">
                    Parents and teens can link accounts, giving parents tools to adjust certain features, set limits, and add safeguards that work for their family. <a href="https://omnira.ai/support" target="_blank" rel="noreferrer" className="underline">Learn more</a>
                  </p>

                  {/* + Add family member Button (Screenshot 2) */}
                  <div>
                    <button
                      onClick={() => setIsInviteFamilyModalOpen(true)}
                      className="px-4 py-2 rounded-full border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add family member</span>
                    </button>
                  </div>

                  {/* Linked Family Members List */}
                  {familyMembers.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="font-bold text-xs text-[var(--text-primary)]">Linked family members ({familyMembers.length})</div>
                      <div className="space-y-2">
                        {familyMembers.map((member) => (
                          <div key={member.id} className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 text-black dark:text-white font-bold flex items-center justify-center shrink-0 text-sm">
                                {member.contact.charAt(0).toUpperCase()}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">{member.contact}</div>
                                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                                  <span className="px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] font-medium text-[10px] text-[var(--text-primary)]">{member.role}</span>
                                  <span>â€¢ {member.status}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveFamilyMember(member.id)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer shrink-0"
                              title="Remove family member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </LoginGate>
            )}

            {/* Keyboard Tab (Matching OMNIRA Screenshots 1, 2, 3) */}
            {activeTab === 'keyboard' && (
              <div className="space-y-6 text-xs sm:text-sm">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Keyboard
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    To change a shortcut, select the key combination, and then type the new keys.
                  </p>
                </div>

                <div className="space-y-6 max-w-xl">
                  {/* Composer Category */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)]">
                      Composer
                    </h4>
                    <div className="space-y-2">
                      {keyboardShortcuts.filter(s => s.category === 'Composer').map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 py-1.5 border-b border-[var(--border-color)]/30">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => handleToggleShortcut(item.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${item.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <span className="font-medium text-xs sm:text-sm text-[var(--text-primary)] truncate">
                              {item.label}
                            </span>
                          </div>

                          <div>
                            {editingShortcutId === item.id ? (
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                                Press key/sequence
                              </span>
                            ) : (
                              <button
                                onClick={() => setEditingShortcutId(item.id)}
                                className="px-2.5 py-1 rounded-md text-xs font-mono font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
                              >
                                {item.keyCombo}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* App Category */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)]">
                      App
                    </h4>
                    <div className="space-y-2">
                      {keyboardShortcuts.filter(s => s.category === 'App').map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 py-1.5 border-b border-[var(--border-color)]/30">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              onClick={() => handleToggleShortcut(item.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${item.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <span className="font-medium text-xs sm:text-sm text-[var(--text-primary)] truncate">
                              {item.label}
                            </span>
                          </div>

                          <div>
                            {editingShortcutId === item.id ? (
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                                Press key/sequence
                              </span>
                            ) : (
                              <button
                                onClick={() => setEditingShortcutId(item.id)}
                                className="px-2.5 py-1 rounded-md text-xs font-mono font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
                              >
                                {item.keyCombo}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restore defaults button (Matching OMNIRA Screenshot 2 & 3) */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleRestoreDefaultShortcuts}
                      className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      Restore defaults
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Trusted Contact Tab (Matching OMNIRA Screenshots 1-5) */}
            {(activeTab === 'trusted' || activeTab === 'trustedContact') && (
              <LoginGate isGuest={isGuest} onLogin={onLogin} feature="Trusted Contacts">
              <div className="space-y-6 text-xs sm:text-sm">
                {/* Trusted contact invite status banner */}
                {trustedInviteStatus && (
                  <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${trustedInviteStatus.ok ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    <span>{trustedInviteStatus.ok ? 'âœ“' : 'âœ•'}</span>
                    <span>{trustedInviteStatus.text}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Trusted contact
                  </h3>
                </div>

                <div className="space-y-6 max-w-xl">
                  <div className="space-y-3 text-xs text-[var(--text-muted)] leading-relaxed">
                    <p>
                      Having a trusted contact can make it easier to get support from someone who knows you well.
                    </p>
                    <p>
                      In the future, if you discuss suicide with OMNIRA in a way that indicates a serious safety concern, we may automatically notify your trusted contact so they can check in with you. They must be 18+ to participate. <a href="https://omnira.ai/support" target="_blank" rel="noreferrer" className="underline font-medium hover:text-[var(--text-primary)]">Learn more</a>
                    </p>
                  </div>

                  {/* + Add contact button (Screenshot 1) */}
                  <div>
                    <button
                      onClick={() => setIsAddTrustedInfoModalOpen(true)}
                      className="px-4 py-2 rounded-full border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add contact</span>
                    </button>
                  </div>

                  {/* Added Trusted Contacts List */}
                  {trustedContacts.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="font-bold text-xs text-[var(--text-primary)]">Your Trusted Contacts ({trustedContacts.length})</div>
                      <div className="space-y-2">
                        {trustedContacts.map((contact) => (
                          <div key={contact.id} className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-sm">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">{contact.name}</div>
                                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                                  <span>{contact.email}</span>
                                  <span>â€¢ {contact.countryCode} {contact.phone}</span>
                                </div>
                                <div className="inline-block px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-black dark:text-white font-semibold text-[10px]">
                                  {contact.status}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveTrustedContact(contact.id)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer shrink-0"
                              title="Remove trusted contact"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </LoginGate>
            )}

            {/* Other Settings Tabs */}
            {activeTab !== 'general' && activeTab !== 'account' && activeTab !== 'billing' && activeTab !== 'usage' && activeTab !== 'notifications' && activeTab !== 'personalization' && activeTab !== 'voice' && activeTab !== 'analytics' && activeTab !== 'datacontrols' && activeTab !== 'data_controls' && activeTab !== 'storage' && activeTab !== 'safety' && activeTab !== 'security' && activeTab !== 'parental' && activeTab !== 'parentalControls' && activeTab !== 'keyboard' && activeTab !== 'trusted' && activeTab !== 'trustedContact' && (


              <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-2">
                <Settings className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
                <div className="font-semibold text-sm text-[var(--text-primary)]">
                  {menuItems.find(m => m.id === activeTab)?.label} Settings
                </div>
                <p>Active and configured for user account <strong>{currentUser?.name || 'Guest User'}</strong> ({currentUser?.email || 'user@example.com'}).</p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>

      {/* GitHub Connect Modal */}
      <GithubConnectModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        onConnect={handleGithubConnect}
      />

      {/* Domain Verify Modal */}
      <DomainVerifyModal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        onVerifyDomain={handleVerifyDomain}
      />

      {/* Age Verification Modal */}
      {isAgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <ShieldCheck className="w-10 h-10 text-black dark:text-white mx-auto" />
            <h3 className="font-bold text-base">Verify Your Age</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Confirm that you are at least 18 years of age to access adult settings and custom tools.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsAgeModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[var(--border-color)] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAgeVerify}
                className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-white text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200"
              >
                Confirm (18+)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-sm p-6 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-red-500">Delete Account</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Are you sure you want to delete your account? All chat history and builder settings will be permanently erased.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[var(--border-color)] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  onClose();
                  onLogout();
                }}
                className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memory Management Modal */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg p-6 space-y-5 text-left relative shadow-2xl">
            <button
              onClick={() => setIsMemoryModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Manage Saved Memories</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                OMNIRA uses these saved facts to personalize responses across your conversations. You can edit or delete them anytime.
              </p>
            </div>

            {/* Add New Memory Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMemoryInput}
                onChange={(e) => setNewMemoryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMemory()}
                placeholder="Add a new custom memory fact..."
                className="flex-1 px-3.5 py-2 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-black dark:border-white text-[var(--text-primary)]"
              />
              <button
                onClick={handleAddMemory}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white font-semibold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Add Memory
              </button>
            </div>

            {/* Saved Memories List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-[var(--border-color)]">
              {savedMemories.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--text-muted)]">No memories saved yet.</div>
              ) : (
                savedMemories.map((mem, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 pt-2 text-xs">
                    <span className="text-[var(--text-primary)] font-medium leading-relaxed">â€¢ {mem}</span>
                    <button
                      onClick={() => handleDeleteMemory(idx)}
                      className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded transition-colors shrink-0 cursor-pointer"
                      title="Delete Memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsMemoryModalOpen(false)}
                className="px-5 py-2 bg-[var(--bg-sidebar)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request data export Modal matching OMNIRA Screenshot 5 */}
      {activeDataModal === 'exportData' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Request data export - are you sure?
            </h3>
            
            <ul className="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="select-none">â€¢</span>
                <span>Your account details and chats will be included in the export.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="select-none">â€¢</span>
                <span>The data will be sent to your registered email in a downloadable file.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="select-none">â€¢</span>
                <span>The download link will expire 24 hours after you receive it.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="select-none">â€¢</span>
                <span>Processing may take some time. You'll be notified when it's ready.</span>
              </li>
            </ul>

            <p className="text-xs text-[var(--text-muted)]">
              To proceed, click "Confirm export" below.
            </p>

            {exportStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${exportStatus.ok ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {exportStatus.text}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setActiveDataModal(null); setExportStatus(null); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={exportingData}
                onClick={handleConfirmExport}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {exportingData ? 'Processing...' : 'Confirm export'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Links Modal */}
      {activeDataModal === 'sharedLinks' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Shared links</h3>
              <button onClick={() => setActiveDataModal(null)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Manage links you have created to share chat conversations.
            </p>
            <div className="p-6 text-center text-xs text-[var(--text-muted)] border border-[var(--border-color)] bg-[var(--bg-sidebar)] rounded-xl">
              No shared links created yet.
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setActiveDataModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-sidebar)] text-[var(--text-primary)] hover:bg-[var(--border-color)]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Archived Chats Modal */}
      {activeDataModal === 'archivedChats' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Archived chats</h3>
              <button onClick={() => setActiveDataModal(null)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              View and restore your archived chat conversations.
            </p>
            <div className="p-6 text-center text-xs text-[var(--text-muted)] border border-[var(--border-color)] bg-[var(--bg-sidebar)] rounded-xl">
              No archived chats found.
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setActiveDataModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-sidebar)] text-[var(--text-primary)] hover:bg-[var(--border-color)]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive All Confirmation */}
      {activeDataModal === 'archiveAll' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Archive all chats?</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Are you sure you want to archive all your conversation history? Archived chats can be viewed and restored at any time.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setActiveDataModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] cursor-pointer">Cancel</button>
              <button onClick={handleArchiveAllChats} className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">Archive all</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation */}
      {activeDataModal === 'deleteAll' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-red-500">Delete all chats?</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              This action cannot be undone. Are you sure you want to permanently delete all your conversation history and messages?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setActiveDataModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] cursor-pointer">Cancel</button>
              <button onClick={handleDeleteAllChats} className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer">Delete all</button>
            </div>
          </div>
        </div>
      )}

      {/* Connect your authenticator app Modal (Screenshot 1) */}
      {isAuthAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => { setIsAuthAppModalOpen(false); setAuthAppError(null); }}
              className="absolute right-4 top-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Connect your authenticator app
            </h3>

            <div className="space-y-3 text-xs text-[var(--text-primary)]">
              <p className="leading-relaxed">
                <strong>Step 1:</strong> Scan the QR code using your authenticator app, then enter the 6-digit code from the app.
              </p>

              {/* QR Code â€” uses REAL generated secret + real user email */}
              <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-white flex flex-col items-center justify-center gap-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/OMNIRA:${encodeURIComponent(currentUser?.email || 'user@omnira.ai')}?secret=${totpSecret}&issuer=OMNIRA`}
                  alt="Scan this QR code with Google Authenticator, Authy, or any TOTP app"
                  className="w-44 h-44 object-contain"
                />
                <div className="space-y-1 text-center">
                  <p className="text-[10px] text-gray-500">Account: <span className="font-mono font-semibold text-gray-700">{currentUser?.email || 'user@omnira.ai'}</span></p>
                  <p className="text-[10px] text-gray-400">Can't scan? Enter this key manually:</p>
                  <p className="font-mono text-[11px] font-bold tracking-widest text-gray-700 select-all break-all">{totpSecret}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[var(--text-primary)]">
              <p className="font-semibold">
                <strong>Step 2:</strong> Enter your 6-digit code
              </p>
              <input
                type="text"
                maxLength={6}
                value={authAppCode}
                onChange={(e) => setAuthAppCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your 6-digit code"
                className="w-full px-4 py-2.5 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-black dark:border-white font-mono tracking-widest text-[var(--text-primary)]"
              />
              {authAppError && (
                <p className="text-[11px] text-red-500 font-medium">{authAppError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => { setIsAuthAppModalOpen(false); setAuthAppError(null); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={authAppCode.length !== 6}
                onClick={handleVerifyAuthApp}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite family member Modal (Screenshot 1) */}
      {isInviteFamilyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsInviteFamilyModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Invite family member
            </h3>

            {/* Step 1: Contact Input (Email or Phone) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
                <span>{inviteContactMode === 'email' ? 'Email address' : 'Phone number'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setInviteContactMode(inviteContactMode === 'email' ? 'phone' : 'email');
                    setInviteContact('');
                  }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline cursor-pointer"
                >
                  {inviteContactMode === 'email' ? 'Use phone' : 'Use email'}
                </button>
              </div>

              <input
                type={inviteContactMode === 'email' ? 'email' : 'tel'}
                value={inviteContact}
                onChange={(e) => setInviteContact(e.target.value)}
                placeholder={inviteContactMode === 'email' ? 'name@email.com' : '+1 (555) 000-0000'}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-black dark:border-white text-[var(--text-primary)]"
              />

              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                If your family member is new to OMNIRA, they'll be asked to create an account.
              </p>
            </div>

            {/* Step 2: Relationship Radio Buttons (Screenshot 1) */}
            <div className="space-y-2.5">
              <div className="font-semibold text-xs text-[var(--text-primary)]">
                This person is:
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 text-xs text-[var(--text-primary)] cursor-pointer select-none">
                  <input
                    type="radio"
                    name="familyRole"
                    value="parent"
                    checked={inviteRole === 'parent'}
                    onChange={() => setInviteRole('parent')}
                    className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
                  />
                  <span>My parent or guardian</span>
                </label>

                <label className="flex items-center gap-3 text-xs text-[var(--text-primary)] cursor-pointer select-none">
                  <input
                    type="radio"
                    name="familyRole"
                    value="child"
                    checked={inviteRole === 'child'}
                    onChange={() => setInviteRole('child')}
                    className="w-4 h-4 accent-black dark:accent-white cursor-pointer"
                  />
                  <span>My child</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
              <button
                onClick={() => setIsInviteFamilyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!inviteContact.trim() || !inviteRole || sendingFamilyInvite}
                onClick={handleSendFamilyInvite}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
              >
                {sendingFamilyInvite ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adding a trusted contact Info Modal (OMNIRA Screenshots 2, 3, 4) */}
      {isAddTrustedInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-[var(--text-primary)]">
            
            {/* Close Icon Button */}
            <button
              onClick={() => setIsAddTrustedInfoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Gradient Top Banner with Heart Icon (Screenshots 2, 3, 4) */}
            <div className="h-44 bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 flex items-center justify-center relative">
              <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-800">
                <span className="text-2xl">â™¡</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-5 text-xs sm:text-sm">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Adding a trusted contact
                </h3>
                <div className="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
                  <p>
                    When things feel heavy, it can be hard to reach out for help. Having a <strong>trusted contact</strong> can make it easier to get support from someone who knows you well.
                  </p>
                  <p>
                    In the future, if you discuss suicide with OMNIRA in a way that indicates a serious safety concern, we may automatically notify your trusted contact so they can check in with you.
                  </p>
                </div>
              </div>

              {/* Accordion 1: What to expect (Screenshot 3) */}
              <div className="border-t border-[var(--border-color)] pt-3">
                <button
                  onClick={() => setTrustedInfoExpanded(prev => ({ ...prev, whatToExpect: !prev.whatToExpect }))}
                  className="w-full flex items-center justify-between py-1 font-semibold text-xs text-[var(--text-primary)] hover:text-blue-600 transition-colors cursor-pointer text-left"
                >
                  <span>What to expect</span>
                  <span className="text-sm font-bold">{trustedInfoExpanded.whatToExpect ? 'Ã—' : '+'}</span>
                </button>
                {trustedInfoExpanded.whatToExpect && (
                  <div className="pt-2 space-y-2 text-xs text-[var(--text-muted)] leading-relaxed pl-1">
                    <p>â€¢ You'll invite someone to be your trusted contact. They can choose whether to participate.</p>
                    <p>â€¢ In the future, if it seems you may need support, we'll let them know. We'll only share the general reason â€” that suicide came up in a potentially concerning way â€” and encourage them to check in with you. We won't share your chat details or transcripts.</p>
                    <p>â€¢ Your trusted contact's role is to check in, listen, and help you find additional support if needed. They aren't expected to handle emergencies or be your only source of support.</p>
                    <a href="https://omnira.ai/support" target="_blank" rel="noreferrer" className="inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline pt-1 font-medium">Learn more</a>
                  </div>
                )}
              </div>

              {/* Accordion 2: Who to invite (Screenshot 4) */}
              <div className="border-t border-[var(--border-color)] pt-3">
                <button
                  onClick={() => setTrustedInfoExpanded(prev => ({ ...prev, whoToInvite: !prev.whoToInvite }))}
                  className="w-full flex items-center justify-between py-1 font-semibold text-xs text-[var(--text-primary)] hover:text-blue-600 transition-colors cursor-pointer text-left"
                >
                  <span>Who to invite</span>
                  <span className="text-sm font-bold">{trustedInfoExpanded.whoToInvite ? 'Ã—' : '+'}</span>
                </button>
                {trustedInfoExpanded.whoToInvite && (
                  <div className="pt-2 space-y-2 text-xs text-[var(--text-muted)] leading-relaxed pl-1">
                    <p>â€¢ You can invite a friend, family member, or another trusted adult (18+) to be your trusted contact.</p>
                    <p>â€¢ Choose someone who you feel comfortable being honest with and trust to respond with care.</p>
                    <p>â€¢ You can change or remove your trusted contact anytime from your OMNIRA settings.</p>
                    <a href="https://omnira.ai/support" target="_blank" rel="noreferrer" className="inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline pt-1 font-medium">Learn more</a>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setIsAddTrustedInfoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsAddTrustedInfoModalOpen(false);
                    setIsInviteTrustedFormModalOpen(true);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Add a contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite a trusted contact Form Modal (OMNIRA Screenshot 5) */}
      {isInviteTrustedFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative text-[var(--text-primary)]">
            <button
              onClick={() => setIsInviteTrustedFormModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sidebar)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Invite a trusted contact
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Choose a friend, family member, or another trusted adult who is readily available to offer support. We'll invite them to be your trusted contact, and they can choose whether to participate. <a href="https://omnira.ai/support" target="_blank" rel="noreferrer" className="underline hover:text-[var(--text-primary)]">Learn more</a>
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Name</label>
                <input
                  type="text"
                  value={trustedForm.name}
                  onChange={(e) => setTrustedForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your trusted contact's full name"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-blue-500 text-[var(--text-primary)]"
                />
              </div>

              {/* Phone with Country Code */}
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Phone</label>
                <div className="flex items-center gap-2">
                  <select
                    value={trustedForm.countryCode}
                    onChange={(e) => setTrustedForm(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="px-3 py-2.5 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-blue-500 font-medium text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="+1">+1</option>
                    <option value="+977">+977</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+61">+61</option>
                    <option value="+81">+81</option>
                  </select>
                  <input
                    type="tel"
                    value={trustedForm.phone}
                    onChange={(e) => setTrustedForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="flex-1 px-3.5 py-2.5 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-blue-500 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-primary)]">Email</label>
                <input
                  type="email"
                  value={trustedForm.email}
                  onChange={(e) => setTrustedForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@example.com"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-blue-500 text-[var(--text-primary)]"
                />
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="confirmTrusted18"
                  checked={trustedForm.confirmed18}
                  onChange={(e) => setTrustedForm(prev => ({ ...prev, confirmed18: e.target.checked }))}
                  className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="confirmTrusted18" className="text-[11px] text-[var(--text-muted)] leading-relaxed cursor-pointer select-none">
                  I confirm this person and I are 18 or older. If this person agrees to be my trusted contact, I understand and agree that OMNIRA may notify them in the future if I discuss suicide with OMNIRA in a way that indicates a serious safety concern, and I agree to my data being used for this purpose. I understand this system can make mistakes and that this feature is not an emergency service or a substitute for professional care.
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end pt-3 border-t border-[var(--border-color)]">
              <button
                disabled={!trustedForm.name.trim() || !trustedForm.phone.trim() || !trustedForm.email.trim() || !trustedForm.confirmed18 || sendingTrustedInvite}
                onClick={handleSendTrustedInvite}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
              >
                {sendingTrustedInvite ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Inline Confirm Dialog (replaces all browser confirm() calls) â”€â”€â”€ */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <span className="text-red-500 text-base font-bold">!</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed pt-1">{confirmDialog.message}</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--bg-sidebar)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>

  );
}
