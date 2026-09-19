import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pin, 
  Share2, 
  Settings, 
  Trash2, 
  X, 
  Lightbulb, 
  Check, 
  ChevronDown, 
  MessageSquare, 
  ArrowLeft,
  Sparkles,
  Copy,
  Zap,
  Brain,
  Info
} from 'lucide-react';

export default function ProjectsStudio({ 
  projects = [], 
  setProjects, 
  chatSessions = [], 
  onSelectChat, 
  onNewChatInProject,
  activeProjectId,
  setActiveProjectId,
  isCreateModalOpen,
  setIsCreateModalOpen
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'you' | 'shared'
  
  // Selected project ID for viewing inside (derived cleanly without cascading effects)
  const [viewingProjectId, setViewingProjectId] = useState(activeProjectId || null);
  const viewingProject = (Array.isArray(projects) && viewingProjectId)
    ? projects.find(p => p && p.id === viewingProjectId) || null
    : null;

  // Dropdown context menu state: projectId
  const [activeMenuProjectId, setActiveMenuProjectId] = useState(null);
  
  // Benefits banner state
  const [showBenefitsBanner, setShowBenefitsBanner] = useState(() => {
    return localStorage.getItem('omnira_show_projects_banner') !== 'false';
  });

  const toggleBenefitsBanner = () => {
    const nextState = !showBenefitsBanner;
    setShowBenefitsBanner(nextState);
    localStorage.setItem('omnira_show_projects_banner', String(nextState));
  };

  // Modals state
  const [settingsModalProject, setSettingsModalProject] = useState(null);
  const [shareModalProject, setShareModalProject] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Create Project Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    icon: '📁',
    memory: 'default'
  });
  const [showCreateMemoryDropdown, setShowCreateMemoryDropdown] = useState(false);

  // Settings Form State
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    icon: '📁',
    instructions: '',
    memory: 'default',
    libraryAccess: 'enabled'
  });
  const [showSettingsMemoryDropdown, setShowSettingsMemoryDropdown] = useState(false);
  const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.project-menu-container')) {
        setActiveMenuProjectId(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleOpenCreateModal = () => {
    setCreateForm({
      name: '',
      icon: '📁',
      memory: 'default'
    });
    setShowCreateMemoryDropdown(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e?.preventDefault();
    if (!createForm.name.trim()) return;

    const newId = `proj-${Date.now()}`;
    const newProject = {
      id: newId,
      name: createForm.name.trim(),
      icon: createForm.icon || '📁',
      instructions: '',
      memory: createForm.memory || 'default',
      libraryAccess: 'enabled',
      isPinned: false,
      createdBy: 'you',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      modifiedDisplay: 'Just now',
      files: []
    };

    setProjects([newProject, ...(Array.isArray(projects) ? projects : [])]);
    setIsCreateModalOpen(false);
    setViewingProjectId(newId);
    if (setActiveProjectId) setActiveProjectId(newId);
  };

  const handleOpenSettingsModal = (proj, e) => {
    e?.stopPropagation();
    setActiveMenuProjectId(null);
    setEditForm({
      id: proj.id,
      name: proj.name,
      icon: proj.icon || '📁',
      instructions: proj.instructions || '',
      memory: proj.memory || 'default',
      libraryAccess: proj.libraryAccess || 'enabled'
    });
    setSettingsModalProject(proj);
  };

  const handleSaveSettings = () => {
    if (!settingsModalProject || !editForm.name.trim()) return;

    setProjects((Array.isArray(projects) ? projects : []).map(p => {
      if (p.id === settingsModalProject.id) {
        return {
          ...p,
          name: editForm.name.trim(),
          icon: editForm.icon || '📁',
          instructions: editForm.instructions,
          memory: editForm.memory,
          libraryAccess: editForm.libraryAccess,
          modifiedAt: Date.now(),
          modifiedDisplay: 'Just now'
        };
      }
      return p;
    }));

    setSettingsModalProject(null);
  };

  const handleDeleteProject = (projId, e) => {
    e?.stopPropagation();
    setActiveMenuProjectId(null);
    if (window.confirm('Are you sure you want to delete this project? Its chats will remain in your chat history.')) {
      setProjects((Array.isArray(projects) ? projects : []).filter(p => p.id !== projId));
      if (viewingProjectId === projId) {
        setViewingProjectId(null);
        if (setActiveProjectId) setActiveProjectId(null);
      }
      setSettingsModalProject(null);
    }
  };

  const handleTogglePin = (projId, e) => {
    e?.stopPropagation();
    setActiveMenuProjectId(null);
    setProjects((Array.isArray(projects) ? projects : []).map(p => {
      if (p.id === projId) {
        return { ...p, isPinned: !p.isPinned };
      }
      return p;
    }));
  };

  const handleOpenShareModal = (proj, e) => {
    e?.stopPropagation();
    setActiveMenuProjectId(null);
    setShareModalProject(proj);
    setCopiedLink(false);
  };

  const handleCopyShareLink = () => {
    if (!shareModalProject) return;
    const shareUrl = `${window.location.origin}/project/${shareModalProject.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Filter projects by search query and tabs
  const projectList = Array.isArray(projects) ? projects : [];
  const filteredProjects = projectList.filter(p => {
    if (!p) return false;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.instructions && p.instructions.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeFilter === 'you') return p.createdBy === 'you';
    if (activeFilter === 'shared') return p.createdBy === 'shared';
    return true;
  });

  // Sort pinned to the top, then by modifiedAt desc
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.modifiedAt || 0) - (a.modifiedAt || 0);
  });

  // Chats belonging to the viewing project
  const projectChats = (viewingProject && Array.isArray(chatSessions)) 
    ? chatSessions.filter(c => c && c.projectId === viewingProject.id)
    : [];

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)] select-none">
      
      {/* -------------------- VIEW 1: PROJECTS LISTING -------------------- */}
      {!viewingProject ? (
        <div className="w-full px-6 sm:px-10 lg:px-14 py-8">
          
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Projects
            </h1>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Why Projects Guide Toggle */}
              <button
                onClick={toggleBenefitsBanner}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium text-black dark:text-white transition-colors cursor-pointer shadow-2xs shrink-0"
                title="View benefits & guide"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Why Projects?</span>
              </button>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects"
                  className="w-full pl-9 pr-4 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder-neutral-400 outline-none focus:border-neutral-400 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* New Project Button (Black pill button matching ChatGPT screenshot) */}
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0"
              >
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Benefits of Projects Showcase Banner */}
          {showBenefitsBanner && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-xs relative transition-all animate-fadeIn">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 rounded-lg bg-violet-600/10 text-black dark:text-white items-center justify-center font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    Why use Projects in OMNIRA AI?
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-black dark:text-white border border-violet-500/20">
                    Pro Workspace
                  </span>
                </div>
                <button 
                  onClick={toggleBenefitsBanner}
                  className="text-neutral-400 hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-xs flex items-center gap-1"
                  title="Dismiss guide"
                >
                  <span className="text-[11px] hidden sm:inline">Hide</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]/60 shadow-2xs hover:border-black/40 dark:hover:border-white/40 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Never Repeat Prompts</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Set custom instructions once. Every new conversation inside this folder automatically inherits your rules and tone.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]/60 shadow-2xs hover:border-black/40 dark:hover:border-white/40 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white mb-1">
                    <Brain className="w-4 h-4" />
                    <span>Dedicated Context & Memory</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Project-only memory mode isolates conversations so AI answers stay laser-focused on this specific task without confusion.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]/60 shadow-2xs hover:border-black/40 dark:hover:border-white/40 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white dark:text-black dark:text-white mb-1">
                    <Folder className="w-4 h-4" />
                    <span>Zero Clutter Organization</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Keep your coding, business, and study chats neatly grouped into distinct folders instead of 100+ random sidebar chats.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs: All | Created by you | Shared with you */}
          <div className="flex items-center gap-1 mb-6 border-b border-[var(--border-color)] pb-3">
            {[
              { id: 'all', label: 'All' },
              { id: 'you', label: 'Created by you' },
              { id: 'shared', label: 'Shared with you' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 text-[var(--text-primary)] font-semibold'
                    : 'text-neutral-500 hover:text-[var(--text-primary)] hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table Header: Name | Modified */}
          <div className="grid grid-cols-12 px-3 py-2 text-xs font-semibold text-neutral-400 border-b border-[var(--border-color)]/60">
            <div className="col-span-8 sm:col-span-9">Name</div>
            <div className="col-span-4 sm:col-span-3 text-right pr-8">Modified</div>
          </div>

          {/* Projects Table List */}
          <div className="divide-y divide-[var(--border-color)]/30">
            {sortedProjects.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
                  <Folder className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  {searchQuery ? 'No matching projects' : 'No projects yet'}
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
                  Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create project
                </button>
              </div>
            ) : (
              sortedProjects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => {
                    setViewingProjectId(proj.id);
                    if (setActiveProjectId) setActiveProjectId(proj.id);
                  }}
                  className="grid grid-cols-12 items-center px-3 py-3 rounded-xl hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group relative"
                >
                  {/* Name Column with Folder Icon */}
                  <div className="col-span-8 sm:col-span-9 flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-[var(--border-color)] flex items-center justify-center text-sm shrink-0">
                      {proj.icon || '📁'}
                    </div>
                    <div className="truncate flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {proj.name}
                      </span>
                      {proj.isPinned && (
                        <Pin className="w-3 h-3 text-neutral-400 fill-neutral-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Modified Column & Actions Menu */}
                  <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2 text-xs text-neutral-400">
                    <span className="truncate">{proj.modifiedDisplay || 'Recently'}</span>

                    {/* Three-dots menu container */}
                    <div className="relative project-menu-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuProjectId(activeMenuProjectId === proj.id ? null : proj.id);
                        }}
                        className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-[var(--text-primary)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu (Screenshot 4) */}
                      {activeMenuProjectId === proj.id && (
                        <div 
                          className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-[#1e2025] border border-neutral-200 dark:border-neutral-700 shadow-xl py-1 z-50 text-xs text-[var(--text-primary)] select-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleTogglePin(proj.id, e)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                          >
                            <Pin className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{proj.isPinned ? 'Unpin project' : 'Pin project'}</span>
                          </button>

                          <button
                            onClick={(e) => handleOpenShareModal(proj, e)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Share</span>
                          </button>

                          <button
                            onClick={(e) => handleOpenSettingsModal(proj, e)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Project settings</span>
                          </button>

                          <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />

                          <button
                            onClick={(e) => handleDeleteProject(proj.id, e)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-left transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete project</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      ) : (
        /* -------------------- VIEW 2: PROJECT DETAIL VIEW -------------------- */
        <div className="w-full px-6 sm:px-10 lg:px-14 py-8">
          
          {/* Back Button */}
          <button
            onClick={() => {
              setViewingProjectId(null);
              if (setActiveProjectId) setActiveProjectId(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-[var(--text-primary)] mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All projects</span>
          </button>

          {/* Project Title Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{viewingProject.icon || '📁'}</span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    {viewingProject.name}
                  </h1>
                  {viewingProject.isPinned && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white dark:text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Memory: <span className="capitalize">{viewingProject.memory || 'Default'}</span> • Library Access: <span className="capitalize">{viewingProject.libraryAccess || 'Enabled'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleOpenShareModal(viewingProject, e)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                onClick={(e) => handleOpenSettingsModal(viewingProject, e)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => onNewChatInProject(viewingProject.id)}
                className="px-4 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New chat</span>
              </button>
            </div>
          </div>

          {/* Project Custom Instructions Card */}
          <div className="mb-8 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                <span>Project Custom Instructions</span>
              </div>
              <button
                onClick={(e) => handleOpenSettingsModal(viewingProject, e)}
                className="text-[11px] text-black dark:text-white hover:underline font-medium cursor-pointer"
              >
                Edit
              </button>
            </div>
            {viewingProject.instructions ? (
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap font-mono bg-neutral-50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-[var(--border-color)]/50">
                {viewingProject.instructions}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                No custom instructions set yet. Add instructions so OMNIRA AI automatically customizes responses for all chats in this project.
              </p>
            )}
          </div>

          {/* Project Chats Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">
                Chats in this project ({projectChats.length})
              </h2>
            </div>

            {projectChats.length === 0 ? (
              <div className="py-12 border border-dashed border-[var(--border-color)] rounded-2xl text-center">
                <MessageSquare className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-[var(--text-primary)] mb-1">No chats in this project yet</p>
                <p className="text-xs text-neutral-400 mb-4">Start a conversation using this project's context and instructions.</p>
                <button
                  onClick={() => onNewChatInProject(viewingProject.id)}
                  className="px-4 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Start new chat
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {projectChats.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onSelectChat(c.id)}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <MessageSquare className="w-4 h-4 text-neutral-400 group-hover:text-violet-500 shrink-0 transition-colors" />
                      <div className="truncate">
                        <span className="text-xs font-medium text-[var(--text-primary)] block truncate">
                          {c.title || 'Conversation'}
                        </span>
                        <span className="text-[10px] text-neutral-400 block truncate">
                          {c.messages?.length || 0} messages • Active project
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0">Open chat →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* -------------------- MODAL 1: CREATE PROJECT (Screenshot 2) -------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#181a1f] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-[var(--text-primary)] select-none animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold tracking-tight">Create project</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Project Name Field */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Project name
                </label>
                <div className="flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900 focus-within:border-neutral-500 transition-colors">
                  <input
                    type="text"
                    value={createForm.icon}
                    onChange={(e) => setCreateForm({ ...createForm, icon: e.target.value })}
                    className="w-6 text-center bg-transparent border-none outline-none text-base cursor-pointer"
                    title="Change icon"
                  />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Copenhagen Trip"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-neutral-400"
                  />
                </div>
              </div>

              {/* Lightbulb Info Box (Screenshot 2) */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/40 text-xs text-neutral-600 dark:text-neutral-300">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Projects keep chats, files, and custom instructions in one place. Use them for ongoing work, or just to keep things tidy.
                </span>
              </div>

              {/* Memory Dropdown Selector (Screenshot 2) */}
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                  Memory
                </label>
                <button
                  type="button"
                  onClick={() => setShowCreateMemoryDropdown(!showCreateMemoryDropdown)}
                  className="w-full flex items-center justify-between border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900 text-sm text-left transition-colors cursor-pointer"
                >
                  <span className="capitalize">{createForm.memory === 'default' ? 'Default memory' : 'Project-only memory'}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {showCreateMemoryDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1e2025] shadow-xl py-1.5 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCreateForm({ ...createForm, memory: 'default' });
                        setShowCreateMemoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-start justify-between gap-2 cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">Default memory</div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">
                          This project can access memory from outside chats, and vice versa.
                        </div>
                      </div>
                      {createForm.memory === 'default' && <Check className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 mt-1" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCreateForm({ ...createForm, memory: 'project-only' });
                        setShowCreateMemoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-start justify-between gap-2 cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">Project-only memory</div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">
                          This project can only access its own memory. Its memory is hidden from outside chats.
                        </div>
                      </div>
                      {createForm.memory === 'project-only' && <Check className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 mt-1" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!createForm.name.trim()}
                  className="px-5 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  Create project
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL 2: PROJECT SETTINGS (Screenshot 3) -------------------- */}
      {settingsModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#181a1f] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-[var(--text-primary)] select-none animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight">Project settings</h2>
              <button
                onClick={() => setSettingsModalProject(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Project Name */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                  Project name
                </label>
                <div className="flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900 focus-within:border-neutral-500 transition-colors">
                  <input
                    type="text"
                    value={editForm.icon}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    className="w-6 text-center bg-transparent border-none outline-none text-base cursor-pointer"
                    title="Change icon"
                  />
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Instructions Textarea (Screenshot 3) */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-0.5">
                  Instructions
                </label>
                <p className="text-[11px] text-neutral-500 mb-1.5">
                  Set context and customize how OMNIRA responds in this project.
                </p>
                <textarea
                  rows={4}
                  value={editForm.instructions}
                  onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                  placeholder='e.g. "Respond in Spanish. Reference the latest JavaScript documentation. Keep answers short and focused."'
                  className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50/50 dark:bg-neutral-900 text-xs text-[var(--text-primary)] placeholder-neutral-400 outline-none focus:border-neutral-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Memory Dropdown (Screenshot 3) */}
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                  Memory
                </label>
                <button
                  type="button"
                  onClick={() => setShowSettingsMemoryDropdown(!showSettingsMemoryDropdown)}
                  className="w-full flex items-center justify-between border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900 text-sm text-left transition-colors cursor-pointer"
                >
                  <span>{editForm.memory === 'default' ? 'Default memory' : 'Project-only memory'}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>
                <p className="text-[11px] text-neutral-500 mt-1">
                  {editForm.memory === 'default' 
                    ? 'This project can access memory from outside chats, and vice versa.'
                    : 'This project can only access its own memory. Its memory is hidden from outside chats.'}
                </p>

                {showSettingsMemoryDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1e2025] shadow-xl py-1 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({ ...editForm, memory: 'default' });
                        setShowSettingsMemoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Default memory</span>
                      {editForm.memory === 'default' && <Check className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({ ...editForm, memory: 'project-only' });
                        setShowSettingsMemoryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Project-only memory</span>
                      {editForm.memory === 'project-only' && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Library Access Dropdown (Screenshot 3) */}
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                  Library access
                </label>
                <button
                  type="button"
                  onClick={() => setShowLibraryDropdown(!showLibraryDropdown)}
                  className="w-full flex items-center justify-between border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900 text-sm text-left transition-colors cursor-pointer"
                >
                  <span className="capitalize">{editForm.libraryAccess}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>
                <p className="text-[11px] text-neutral-500 mt-1">
                  This project can access your file library while it remains private. Sharing this project disables library access.
                </p>

                {showLibraryDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1e2025] shadow-xl py-1 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({ ...editForm, libraryAccess: 'enabled' });
                        setShowLibraryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Enabled</span>
                      {editForm.libraryAccess === 'enabled' && <Check className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({ ...editForm, libraryAccess: 'disabled' });
                        setShowLibraryDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Disabled</span>
                      {editForm.libraryAccess === 'disabled' && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Danger: Delete Project (Screenshot 3) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => handleDeleteProject(settingsModalProject.id, e)}
                  className="px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Delete project
                </button>
              </div>

              {/* Modal Bottom Actions: Cancel & Save (Screenshot 3) */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSettingsModalProject(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={!editForm.name.trim()}
                  className="px-5 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  Save
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* -------------------- MODAL 3: SHARE PROJECT -------------------- */}
      {shareModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#181a1f] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl relative text-[var(--text-primary)] select-none animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-violet-500" />
                <h2 className="text-base font-bold tracking-tight">Share project</h2>
              </div>
              <button
                onClick={() => setShareModalProject(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 mb-4">
              Share <strong className="text-[var(--text-primary)]">"{shareModalProject.name}"</strong> with your team or collaborators. They will be able to view chats and custom instructions.
            </p>

            <div className="flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 rounded-xl p-2 bg-neutral-50 dark:bg-neutral-900 text-xs mb-4">
              <span className="font-mono text-neutral-500 truncate flex-1">
                {`${window.location.origin}/project/${shareModalProject.id}`}
              </span>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3 py-1 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShareModalProject(null)}
                className="px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-[var(--text-primary)] hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
