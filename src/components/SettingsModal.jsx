import React, { useState, useEffect } from 'react';
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
  Trash2
} from 'lucide-react';
import GithubConnectModal from './GithubConnectModal';
import DomainVerifyModal from './DomainVerifyModal';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  setSettings, 
  darkMode, 
  setDarkMode,
  currentUser,
  onUpdateUser,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('account');
  const [mobileView, setMobileView] = useState('menu'); // 'menu' | 'detail'
  const [searchQuery, setSearchQuery] = useState('');
  const [showMfaCard, setShowMfaCard] = useState(true);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMobileView('menu');
      setSearchQuery('');
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleSaveProfileField = (field) => {
    const updated = {
      ...currentUser,
      [field]: tempProfile[field]
    };
    onUpdateUser(updated);
    setEditingField(null);
  };

  const handleGithubConnect = (githubData) => {
    setGithubUser(githubData);
  };

  const handleGithubDisconnect = () => {
    if (confirm('Disconnect GitHub account from OMNIRA?')) {
      setGithubUser(null);
    }
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
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in select-none">
        
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
                  
                  {/* Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 pt-1">
                    <span className="font-medium text-[var(--text-primary)] shrink-0">Name</span>
                    {editingField === 'name' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempProfile.name}
                          onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                          className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs outline-none focus:border-emerald-500 min-w-0"
                        />
                        <button
                          onClick={() => handleSaveProfileField('name')}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-500 shrink-0"
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
                        <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500 shrink-0" />
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
                          className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs outline-none focus:border-emerald-500 font-mono min-w-0"
                        />
                        <button
                          onClick={() => handleSaveProfileField('username')}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-500 shrink-0"
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
                          className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs outline-none focus:border-emerald-500 min-w-0"
                        />
                        <button
                          onClick={() => handleSaveProfileField('email')}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-500 shrink-0"
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
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
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold text-xs flex items-center gap-1">
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
                      {githubUser ? (
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
                        <span className="text-emerald-500 font-medium">({selectedDomain})</span>
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
                                  <Check className={`w-3.5 h-3.5 ${selectedDomain === d.domain ? 'text-emerald-500 opacity-100' : 'opacity-0'}`} />
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
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors text-left"
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
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold text-xs hover:underline"
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
                        className="rounded border-[var(--border-color)] accent-emerald-600 cursor-pointer"
                      />
                      <label htmlFor="receiveFeedback" className="text-xs text-[var(--text-muted)] cursor-pointer">
                        Receive feedback emails
                      </label>
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
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
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
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
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
                className="px-5 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
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
    </>
  );
}
