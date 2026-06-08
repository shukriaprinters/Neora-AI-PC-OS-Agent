import React, { Suspense, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/Sidebar';
const SectionViewer = React.lazy(() => import('./components/SectionViewer').then((m) => ({ default: m.SectionViewer })));
const ChatView = React.lazy(() => import('./components/ChatView').then((m) => ({ default: m.ChatView })));
const PlannerView = React.lazy(() => import('./components/PlannerView').then((m) => ({ default: m.PlannerView })));
const OrganizerView = React.lazy(() => import('./components/OrganizerView').then((m) => ({ default: m.OrganizerView })));
const EarningView = React.lazy(() => import('./components/EarningView').then((m) => ({ default: m.EarningView })));
const DevStudioView = React.lazy(() => import('./components/DevStudioView').then((m) => ({ default: m.DevStudioView })));
const FilterLabView = React.lazy(() => import('./components/FilterLabView').then((m) => ({ default: m.FilterLabView })));
const RoadmapView = React.lazy(() => import('./components/RoadmapView').then((m) => ({ default: m.RoadmapView })));
const OsAgentView = React.lazy(() => import('./components/OsAgentView').then((m) => ({ default: m.OsAgentView })));
const VSCodeView = React.lazy(() => import('./components/vscode/VSCodeView').then((m) => ({ default: m.VSCodeView })));
import { SECTIONS, RAW_MASTER_PROMPT } from './masterPromptText';
import { Task, Reminder, Note, Memory } from './types';
import { TRANSLATIONS } from './translations';
import { neoraDelete, neoraGet, neoraPost } from './lib/neoraApi';
import {
  MessageSquare, Cpu, Sliders, DollarSign, Clipboard,
  Languages, Terminal, BookOpen, Key, LogOut, Filter, Milestone, Laptop,
  Download, Search, Undo, X, Activity, CircleAlert, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  // Persist activeTab to localStorage
  const [activeTab, setActiveTab] = useState<'chat' | 'autonomy' | 'productivity' | 'invoice' | 'dev' | 'blueprint' | 'filterLab' | 'roadmap' | 'osAgent' | 'vscode'>(() => {
    return (localStorage.getItem('neora_active_tab') || 'chat') as any;
  });
  
  // Dynamic collections
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Deliver brochure proof to Shukria Printers', notes: '', priority: 'high', dueAt: '2026-06-07', completed: false },
    { id: '2', title: 'Submit quarterly tax calculations sheet', notes: '', priority: 'critical', dueAt: '2026-06-08', completed: true },
    { id: '3', title: 'Stage local updates & run typechecking validation', notes: '', priority: 'medium', dueAt: '2026-06-09', completed: false }
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: 'Call client to verify poster colors', remindAt: '2026-06-07T11:00', repeat: 'none', completed: false },
    { id: '2', title: 'Auto-backup repository checkpoints', remindAt: '2026-06-08T23:59', repeat: 'daily', completed: false }
  ]);

  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Office address memo', content: 'Contact point: Silicon Tower, Floor 14, Gulshan-2, Dhaka.', createdAt: new Date().toLocaleDateString() },
    { id: '2', title: 'Printers pricing framework', content: 'Standard glossy banner setup: $120/piece. Volume discount at 10% for orders > 5 pieces.', createdAt: new Date().toLocaleDateString() }
  ]);

  const [memories, setMemories] = useState<Memory[]>([
    { id: '1', key: 'Default Printer Contact', value: 'shukriaprinters@gmail.com', category: 'work', importance: 5 },
    { id: '2', key: 'Autonomous safety rule', category: 'preference', value: 'Never write onto /etc/ or system roots system-wide without password prompt', importance: 4 }
  ]);

  const [autonomyLevel, setAutonomyLevel] = useState<number>(3);

  // Groq API client config states
  const [useGroq, setUseGroq] = useState<boolean>(() => {
    return localStorage.getItem('neora_use_groq') === 'true';
  });
  const [groqKey, setGroqKey] = useState<string>(() => {
    return localStorage.getItem('neora_groq_key') || '';
  });
  const [groqModel, setGroqModel] = useState<string>(() => {
    return localStorage.getItem('neora_groq_model') || 'llama-3.3-70b-versatile';
  });

  // Save activeTab state to LocalStorage
  React.useEffect(() => {
    localStorage.setItem('neora_active_tab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    localStorage.setItem('neora_use_groq', useGroq.toString());
  }, [useGroq]);

  React.useEffect(() => {
    localStorage.setItem('neora_groq_key', groqKey);
  }, [groqKey]);

  React.useEffect(() => {
    localStorage.setItem('neora_groq_model', groqModel);
  }, [groqModel]);

  // Specifications state binders (persisted selectedSectionId)
  const [selectedSectionId, setSelectedSectionId] = useState<string>(() => {
    return localStorage.getItem('neora_selected_section_id') || SECTIONS[0].id;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Save selectedSectionId to LocalStorage
  React.useEffect(() => {
    localStorage.setItem('neora_selected_section_id', selectedSectionId);
  }, [selectedSectionId]);

  React.useEffect(() => {
    const syncMemoryState = async () => {
      try {
        const data: any = await neoraGet('/api/memory');
        if (Array.isArray(data.memories)) {
          setMemories(data.memories.map((memory: any) => ({
            id: memory.id,
            key: memory.key,
            value: memory.value,
            category: memory.category,
            importance: memory.importance
          })));
        }
      } catch (err) {
        console.warn('Memory sync failed:', err);
      }
    };
    syncMemoryState();
  }, []);

  // --- UNDO TOAST NOTIFICATION SYSTEM ---
  interface DeletedItem {
    type: 'task' | 'reminder' | 'note' | 'memory';
    item: any;
  }
  const [lastDeleted, setLastDeleted] = useState<DeletedItem | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerUndoOption = (type: 'task' | 'reminder' | 'note' | 'memory', item: any) => {
    setLastDeleted({ type, item });
    setShowUndo(true);
    if (undoTimer) clearTimeout(undoTimer);
    const timer = setTimeout(() => {
      setShowUndo(false);
    }, 5000);
    setUndoTimer(timer);
  };

  const handleUndo = () => {
    if (!lastDeleted) return;
    const { type, item } = lastDeleted;
    if (type === 'task') {
      setTasks(prev => [item, ...prev]);
    } else if (type === 'reminder') {
      setReminders(prev => [item, ...prev]);
    } else if (type === 'note') {
      setNotes(prev => [item, ...prev]);
    } else if (type === 'memory') {
      setMemories(prev => [item, ...prev]);
    }
    setShowUndo(false);
    setLastDeleted(null);
    if (undoTimer) clearTimeout(undoTimer);
  };

  // --- GLOBAL SEARCH OVERLAY STATE ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchVal, setGlobalSearchVal] = useState('');

  // --- CONNECTION LATENCY / PERFORMANCE METRICS ---
  const [latency, setLatency] = useState(14);
  const [apiHealth, setApiHealth] = useState(100);
  const recoveryImportRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next < 8 ? 8 : next > 25 ? 25 : next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // --- DOWNLOAD REQUISITION REPORT GENERATOR ---
  const handleDownloadReport = () => {
    const backupCargo = {
      timestamp: new Date().toISOString(),
      client: "shukriaprinters@gmail.com",
      status_info: {
        latency: `${latency}ms`,
        api_health: `${apiHealth}%`
      },
      registry_metrics: {
        total_tasks: tasks.length,
        total_reminders: reminders.length,
        total_notes: notes.length,
        total_memories: memories.length
      },
      tasks,
      reminders,
      notes,
      memories
    };
    
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupCargo, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', 'neora-workspace-backup.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Backup requisition generation failed:", err);
    }
  };

  const handleExportRecoveryBundle = async () => {
    try {
      const bundle: any = await neoraGet('/api/recovery/bundle');
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(bundle, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', 'neora-recovery-bundle.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Recovery bundle export failed:', err);
    }
  };

  const handleImportRecoveryBundle = async (file: File) => {
    const text = await file.text();
    const payload = JSON.parse(text);
    const passphrase = window.prompt('Enter recovery bundle passphrase') || '';
    await neoraPost('/api/recovery/bundle', {
      ...payload,
      passphrase
    });
  };

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K: toggle global search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      // ESC: close global search
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
      // CMD/CTRL + Enter: Submit chat message if inside chat input
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const customEvent = new CustomEvent('neora-submit-chat');
        window.dispatchEvent(customEvent);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedSection = SECTIONS.find(s => s.id === selectedSectionId);
  const t = TRANSLATIONS[lang];

  // Handler functions for cross-component triggers (chat NLP adds items directly!)
  const handleAddTask = (title: string, priority: 'low' | 'medium' | 'high' | 'critical') => {
    const newTask: Task = {
      id: Math.random().toString(),
      title,
      notes: '',
      priority,
      dueAt: new Date().toISOString().substring(0, 10),
      completed: false
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleAddReminder = (title: string, remindAt: string, repeat: 'none' | 'daily' | 'weekly' | 'monthly') => {
    const newRem: Reminder = {
      id: Math.random().toString(),
      title,
      remindAt,
      repeat,
      completed: false
    };
    setReminders(prev => [newRem, ...prev]);
  };

  const handleAddNote = (title: string, content: string) => {
    const newNote: Note = {
      id: Math.random().toString(),
      title,
      content,
      createdAt: new Date().toLocaleDateString()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleAddMemory = (key: string, value: string, category: 'personal' | 'work' | 'preference' | 'skill', importance: number) => {
    const newMem: Memory = {
      id: Math.random().toString(),
      key,
      value,
      category,
      importance
    };
    neoraPost('/api/memory', { id: newMem.id, key, value, category, importance }).catch((err) => {
      console.warn('Failed to persist memory:', err);
    });
    setMemories(prev => [newMem, ...prev]);
  };

  // Toggle checklist status
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
  };
  const handleDeleteTask = (id: string) => {
    const item = tasks.find(x => x.id === id);
    if (item) {
      triggerUndoOption('task', item);
    }
    setTasks(prev => prev.filter(x => x.id !== id));
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
  };
  const handleDeleteReminder = (id: string) => {
    const item = reminders.find(x => x.id === id);
    if (item) {
      triggerUndoOption('reminder', item);
    }
    setReminders(prev => prev.filter(x => x.id !== id));
  };

  const handleDeleteNote = (id: string) => {
    const item = notes.find(x => x.id === id);
    if (item) {
      triggerUndoOption('note', item);
    }
    setNotes(prev => prev.filter(x => x.id !== id));
  };

  const handleDeleteMemory = (id: string) => {
    const item = memories.find(x => x.id === id);
    if (item) {
      triggerUndoOption('memory', item);
    }
    neoraDelete(`/api/memory/${id}`).catch((err) => {
      console.warn('Failed to delete memory on server:', err);
    });
    setMemories(prev => prev.filter(x => x.id !== id));
  };

  return (
    <AppShell activeTab={activeTab as any} onChangeTab={setActiveTab as any}>
    <div id="app-wrapper" className="flex flex-col h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden print:bg-white print:text-black relative">
      <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-cyan-200">Loading workspace…</div>}>
      {/* Global Animated Holographic Scanline Overlay Screen Layer */}
      <div className="holo-scanline-container print:hidden">
        <div className="holo-scanline-bar"></div>
      </div>

      {/* Upper Status Panel Header (Unified workspace styling with glassmorphism) */}
      <header id="main-header" className="glass-architect border-b border-slate-800/80 px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden select-none">
        
        {/* Logo and online markers */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
                {t.title}
              </h1>
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.2 text-[8px] font-bold font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0"></span>
                <span>{t.statusOnline}</span>
              </div>
              
              {/* Connection Status Indicators */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 rounded px-2 py-0.5 text-[8px] font-mono text-slate-400">
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></span>
                <span>LATENCY: <strong className="text-cyan-300 font-mono">{latency}ms</strong></span>
                <span className="text-slate-700">|</span>
                <span>API HEALTH: <strong className="text-emerald-400 font-mono">{apiHealth}%</strong></span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Global Toolbar and Language controllers */}
        <div className="flex items-center gap-2">
          
          {/* Global Search CMD+K Trigger button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded text-[10px] cursor-pointer font-mono transition-all"
            title="Search Workspace (CMD+K / CTRL+K)"
          >
            <Search className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">CMD + K</span>
          </button>

          {/* Download JSON Report Backups button */}
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer font-mono transition-all"
            title={lang === 'bn' ? 'ডাটা রিপোর্ট ব্যাকআপ ডাউনলোড করুন' : 'Export and save neora report JSON'}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{lang === 'bn' ? 'ব্যাকআপ' : 'EXPORT REPORT'}</span>
          </button>

          <button
            onClick={handleExportRecoveryBundle}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer font-mono transition-all"
            title="Export full recovery bundle"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">RECOVERY</span>
          </button>

          <button
            onClick={() => recoveryImportRef.current?.click()}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer font-mono transition-all"
            title="Import full recovery bundle"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">IMPORT</span>
          </button>
          <input
            ref={recoveryImportRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await handleImportRecoveryBundle(file);
              }
              e.target.value = '';
            }}
          />

          {/* Autonomy Badge representation state */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded py-1 px-2 text-[10px] font-mono text-slate-400">
            <span>🛡 {t.autonomyLevel}:</span>
            <span className="text-cyan-400 font-bold">LVL {autonomyLevel}</span>
          </div>

          <button
            id="lang-toggle-btn"
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1 bg-slate-800 border border-slate-700/80 hover:bg-slate-700 px-2.5 py-1.5 rounded text-[10px] font-bold cursor-pointer font-sans transition-all text-slate-100"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.langToggle}</span>
          </button>
        </div>
      </header>

      {/* Primary Tab Navigation links */}
      <nav id="primary-tabs" className="glass-architect border-b border-slate-850 px-5 py-2 shrink-0 flex items-center overflow-x-auto gap-1 text-[11px] font-bold uppercase select-none print:hidden !bg-slate-950/40">
        <button
          id="navtab-chat"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'chat' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t.navChat}</span>
        </button>
        <button
          id="navtab-autonomy"
          onClick={() => setActiveTab('autonomy')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'autonomy' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t.navAutonomy}</span>
        </button>
        <button
          id="navtab-productivity"
          onClick={() => setActiveTab('productivity')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'productivity' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>{t.navProductivity}</span>
        </button>
        <button
          id="navtab-invoice"
          onClick={() => setActiveTab('invoice')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'invoice' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>{t.navInvoice}</span>
        </button>
        <button
          id="navtab-dev"
          onClick={() => setActiveTab('dev')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'dev' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{t.navDev}</span>
        </button>
        <button
          id="navtab-osAgent"
          onClick={() => setActiveTab('osAgent')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'osAgent' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>{t.navOsAgent}</span>
        </button>
        <button
          id="navtab-filterLab"
          onClick={() => setActiveTab('filterLab')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'filterLab' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{t.navFilterLab}</span>
        </button>
        <button
          id="navtab-roadmap"
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
            activeTab === 'roadmap' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Milestone className="w-3.5 h-3.5" />
          <span>{t.navRoadmap}</span>
        </button>
<button
           id="navtab-blueprint"
           onClick={() => setActiveTab('blueprint')}
           className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
             activeTab === 'blueprint' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
           }`}
         >
           <BookOpen className="w-3.5 h-3.5" />
           <span>{t.navSpecs}</span>
         </button>
         <button
           id="navtab-vscode"
           onClick={() => setActiveTab('vscode')}
           className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all cursor-pointer ${
             activeTab === 'vscode' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'
           }`}
         >
           <Terminal className="w-3.5 h-3.5" />
           <span>VS Code</span>
         </button>
       </nav>

      {/* Command Center Summary */}
      <section className="px-5 py-3 print:hidden">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
          <div className="xl:col-span-2 rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-mono">Workspace Command Center</div>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {lang === 'bn' ? 'এক নজরে Neora workspace' : 'Neora workspace at a glance'}
                </h2>
                <p className="mt-1 text-sm text-slate-400 max-w-2xl">
                  {lang === 'bn'
                    ? 'চ্যাট, অটোমেশন, মেমরি, রিপোর্ট, এবং OS agent সব এক স্ক্রিনে; professional users-এর জন্য অপারেশনাল visibility, দ্রুত execution, এবং recovery control।'
                    : 'Chat, automation, memory, reports, and the OS agent in one view with operational visibility, fast execution, and recovery controls.'}
                </p>
              </div>
              <div className="hidden md:flex flex-wrap gap-2 justify-end">
                <button onClick={() => setActiveTab('chat')} className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase">Chat</button>
                <button onClick={() => setActiveTab('osAgent')} className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase">OS Agent</button>
                <button onClick={() => setActiveTab('autonomy')} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold uppercase">Planner</button>
                <button onClick={() => setActiveTab('roadmap')} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold uppercase">Roadmap</button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 py-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-mono">Tasks</div>
            <div className="mt-2 text-2xl font-semibold text-white">{tasks.length}</div>
            <div className="text-sm text-slate-400">{tasks.filter(t => !t.completed).length} active</div>
          </div>
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 py-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-mono">Memory</div>
            <div className="mt-2 text-2xl font-semibold text-white">{memories.length}</div>
            <div className="text-sm text-slate-400">Persistent entries</div>
          </div>
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 py-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-mono">Agent</div>
            <div className="mt-2 text-2xl font-semibold text-white">{latency}ms</div>
            <div className="text-sm text-slate-400">{apiHealth}% health</div>
          </div>
        </div>
      </section>

      {/* Main Content Workspace Layout Rendering Section */}
      <main id="main-content" className="flex-1 flex min-h-0 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatView
            lang={lang}
            onAddTask={handleAddTask}
            onAddReminder={handleAddReminder}
            onAddNote={handleAddNote}
            onSearchBlueprints={(query) => {
              setSearchQuery(query);
              setActiveTab('blueprint');
            }}
            useGroq={useGroq}
            setUseGroq={setUseGroq}
            groqKey={groqKey}
            setGroqKey={setGroqKey}
            groqModel={groqModel}
            setGroqModel={setGroqModel}
          />
        )}

        {activeTab === 'autonomy' && (
          <PlannerView
            lang={lang}
            autonomyLevel={autonomyLevel}
            setAutonomyLevel={setAutonomyLevel}
          />
        )}

        {activeTab === 'productivity' && (
          <OrganizerView
            lang={lang}
            tasks={tasks}
            reminders={reminders}
            notes={notes}
            memories={memories}
            onAddTask={handleAddTask}
            onAddReminder={handleAddReminder}
            onAddNote={handleAddNote}
            onAddMemory={handleAddMemory}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onDeleteNote={handleDeleteNote}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {activeTab === 'invoice' && (
          <EarningView
            lang={lang}
          />
        )}

        {activeTab === 'dev' && (
          <DevStudioView
            lang={lang}
            useGroq={useGroq}
            setUseGroq={setUseGroq}
            groqKey={groqKey}
            setGroqKey={setGroqKey}
            groqModel={groqModel}
            setGroqModel={setGroqModel}
          />
        )}

        {activeTab === 'osAgent' && (
          <OsAgentView
            lang={lang}
          />
        )}

        {activeTab === 'filterLab' && (
          <FilterLabView
            lang={lang}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            lang={lang}
          />
        )}

{activeTab === 'blueprint' && (
           <div className="flex-1 flex h-full overflow-hidden shrink-0">
             <Sidebar
               searchQuery={searchQuery}
               setSearchQuery={setSearchQuery}
               selectedSectionId={selectedSectionId}
               setSelectedSectionId={setSelectedSectionId}
               selectedTag={selectedTag}
               setSelectedTag={setSelectedTag}
             />
             <SectionViewer section={selectedSection} />
           </div>
         )}

         {activeTab === 'vscode' && (
           <VSCodeView />
         )}
       </main>

      {/* --- UNDO TOAST NOTIFICATION SYSTEM (5-SECOND DISMISS) --- */}
      <AnimatePresence>
        {showUndo && lastDeleted && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 border border-cyan-500/30 text-white rounded-lg px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
              <span className="text-xs font-medium font-mono text-slate-300">
                {lang === 'bn' ? 'আইটেম মুছে ফেলা হয়েছে।' : 'Item deleted.'}
              </span>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-[10px] font-bold font-mono px-2.5 py-1.2 rounded uppercase transition-colors"
            >
              <Undo className="w-3 h-3" />
              <span>{lang === 'bn' ? 'পূর্বাবস্থায় ফেরান' : 'UNDO'}</span>
            </button>
            <button
              onClick={() => setShowUndo(false)}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- GLOBAL SEARCH CMD+K OVERLAY MODAL --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center p-4 sm:p-10 pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -30, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -30, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Search input header */}
              <div className="p-4 border-b border-slate-850 flex items-center gap-3 bg-slate-900/50">
                <Search className="w-5 h-5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder={lang === 'bn' ? 'টাইপ করুনঃ টাস্ক, নোট বা সিস্টেম ব্লুপ্রিন্ট খুঁজুন...' : 'Type to search tasks, notes, or blueprints (CMD+K)...'}
                  value={globalSearchVal}
                  onChange={e => setGlobalSearchVal(e.target.value)}
                  className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm border-none outline-none focus:ring-0 focus:border-none focus:outline-none"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="bg-slate-800 text-[9px] font-bold font-mono text-slate-400 border border-slate-700 px-2 py-1 rounded"
                >
                  ESC
                </button>
              </div>

              {/* Suggestions / Results */}
              <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 space-y-4">
                {globalSearchVal.trim() === '' ? (
                  <div className="text-center py-8 text-slate-500 font-mono text-xs">
                    <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                    <span>{lang === 'bn' ? 'পেন্ডিং টাস্ক, ডকুমেন্টস বা ব্লুপ্রিন্ট খুঁজতে শুরু করুন...' : 'Search across all workspaces, specifications, and checklists.'}</span>
                  </div>
                ) : (
                  <>
                    {/* Tasks Matches */}
                    {tasks.filter(t => t.title.toLowerCase().includes(globalSearchVal.toLowerCase())).length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-widest pl-1">
                          {lang === 'bn' ? 'টাস্ক ম্যাচসমূহ' : 'TASKS & CHECKLISTS'}
                        </h4>
                        <div className="space-y-1">
                          {tasks.filter(t => t.title.toLowerCase().includes(globalSearchVal.toLowerCase())).map(t => (
                            <div
                              key={t.id}
                              onClick={() => {
                                setActiveTab('productivity');
                                setGlobalSearchVal('');
                                setIsSearchOpen(false);
                              }}
                              className="p-2 bg-slate-950/40 border border-slate-850/60 hover:border-cyan-500/20 rounded cursor-pointer transition-colors flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-slate-600' : 'bg-cyan-500'}`} />
                                <span className={`truncate ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                  {t.title}
                                </span>
                              </div>
                              <span className="text-[8px] font-mono bg-slate-850 text-slate-400 px-1.5 py-0.2 rounded uppercase shrink-0">
                                {t.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes Matches */}
                    {notes.filter(n => n.title.toLowerCase().includes(globalSearchVal.toLowerCase()) || n.content.toLowerCase().includes(globalSearchVal.toLowerCase())).length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <h4 className="text-[9px] font-bold font-mono text-indigo-400 uppercase tracking-widest pl-1">
                          {lang === 'bn' ? 'নোট ম্যাচসমূহ' : 'NOTEPAD DOCUMENTS'}
                        </h4>
                        <div className="space-y-1">
                          {notes.filter(n => n.title.toLowerCase().includes(globalSearchVal.toLowerCase()) || n.content.toLowerCase().includes(globalSearchVal.toLowerCase())).map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                setActiveTab('productivity');
                                setGlobalSearchVal('');
                                setIsSearchOpen(false);
                              }}
                              className="p-2 bg-slate-950/40 border border-slate-850/60 hover:border-indigo-500/20 rounded cursor-pointer transition-colors text-xs space-y-0.5"
                            >
                              <strong className="text-slate-200 block truncate">{n.title}</strong>
                              <p className="text-[10px] text-slate-400 truncate leading-none">{n.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specs / Blueprints Matches */}
                    {SECTIONS.filter(s => s.title.toLowerCase().includes(globalSearchVal.toLowerCase()) || s.description.toLowerCase().includes(globalSearchVal.toLowerCase()) || s.content.toLowerCase().includes(globalSearchVal.toLowerCase())).length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <h4 className="text-[9px] font-bold font-mono text-violet-400 uppercase tracking-widest pl-1">
                          {lang === 'bn' ? 'সিস্টেম ব্লুপ্রিন্ট' : 'SYSTEM BLUEPRINTS'}
                        </h4>
                        <div className="space-y-1">
                          {SECTIONS.filter(s => s.title.toLowerCase().includes(globalSearchVal.toLowerCase()) || s.description.toLowerCase().includes(globalSearchVal.toLowerCase()) || s.content.toLowerCase().includes(globalSearchVal.toLowerCase())).map(s => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setSelectedSectionId(s.id);
                                setActiveTab('blueprint');
                                setGlobalSearchVal('');
                                setIsSearchOpen(false);
                              }}
                              className="p-2 bg-slate-950/40 border border-slate-850/60 hover:border-violet-500/20 rounded cursor-pointer transition-colors text-xs space-y-0.5"
                            >
                              <strong className="text-slate-200 block truncate">{s.title}</strong>
                              <p className="text-[10px] text-slate-400 truncate leading-none">{s.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Results Fallback */}
                    {tasks.filter(t => t.title.toLowerCase().includes(globalSearchVal.toLowerCase())).length === 0 &&
                     notes.filter(n => n.title.toLowerCase().includes(globalSearchVal.toLowerCase()) || n.content.toLowerCase().includes(globalSearchVal.toLowerCase())).length === 0 &&
                     SECTIONS.filter(s => s.title.toLowerCase().includes(globalSearchVal.toLowerCase()) || s.description.toLowerCase().includes(globalSearchVal.toLowerCase()) || s.content.toLowerCase().includes(globalSearchVal.toLowerCase())).length === 0 && (
                      <div className="text-center py-6 text-slate-500 font-mono text-xs">
                        {lang === 'bn' ? 'কোনো ক্যাশ রেজাল্ট পাওয়া যায়নি।' : 'No matching entries found.'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Suspense>
    </div>
    </AppShell>
  );
}
