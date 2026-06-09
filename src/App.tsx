import React, { Suspense, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { DebugBanner } from './components/ui/DebugBanner';
import { LiveJournalWidget } from './components/LiveJournalWidget';
import { VoiceCommandPanel } from './components/VoiceCommandPanel';
import { NeoraNotifications } from './components/NeoraNotifications';
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
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'autonomy' | 'productivity' | 'invoice' | 'dev' | 'blueprint' | 'filterLab' | 'roadmap' | 'osAgent' | 'vscode'>(() => {
    return (localStorage.getItem('neora_active_tab') || 'home') as any;
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
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem('neora_gemini_key') || '';
  });

  React.useEffect(() => {
    localStorage.setItem('neora_gemini_key', geminiKey);
  }, [geminiKey]);

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
  const [serverOnline, setServerOnline] = useState(false);
  const [overlayBlocked, setOverlayBlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDebugBanner, setShowDebugBanner] = useState(false);
  const [voicePanelOpen, setVoicePanelOpen] = useState(false);
  const [clickInspectorMode, setClickInspectorMode] = useState(false);
  const [inspectorLog, setInspectorLog] = useState<string | null>(null);

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

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'i') {
        event.preventDefault();
        setClickInspectorMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('neora_show_debug_banner', String(showDebugBanner));
  }, [showDebugBanner]);

  React.useEffect(() => {
    if (!clickInspectorMode) {
      setInspectorLog(null);
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const label = (node: HTMLElement | null) => {
        if (!node) return 'none';
        const idPart = node.id ? `#${node.id}` : '';
        const classPart = node.className && typeof node.className === 'string' ? `.${node.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.')}` : '';
        return `${node.tagName.toLowerCase()}${idPart}${classPart}`;
      };
      const hit = label(element);
      const source = label(target);
      setInspectorLog(`target=${source} hit=${hit} x=${event.clientX} y=${event.clientY}`);
      console.debug('[Neora Click Inspector]', { target: source, hit, x: event.clientX, y: event.clientY });
    };

    window.addEventListener('click', handleDocumentClick, true);
    return () => window.removeEventListener('click', handleDocumentClick, true);
  }, [clickInspectorMode]);

  React.useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      try {
        const status: any = await neoraGet('/api/os/status');
        if (!cancelled) {
          setServerOnline(status?.status === 'online');
          setApiHealth(100);
        }
      } catch {
        if (!cancelled) {
          setServerOnline(false);
          setApiHealth(0);
        }
      }
    };
    probe();
    const timer = setInterval(probe, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    const probeOverlay = () => {
      const hit = document.elementFromPoint(window.innerWidth / 2, 120) as HTMLElement | null;
      const blocked = !!hit && !hit.closest('button, a, input, textarea, select, [role="button"]');
      setOverlayBlocked(blocked);
    };
    probeOverlay();
    window.addEventListener('resize', probeOverlay);
    window.addEventListener('scroll', probeOverlay, true);
    const timer = setInterval(probeOverlay, 4000);
    return () => {
      window.removeEventListener('resize', probeOverlay);
      window.removeEventListener('scroll', probeOverlay, true);
      clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    const probeModal = () => {
      setModalOpen(Boolean(document.querySelector('[data-neora-modal="open"]')));
    };
    probeModal();
    const timer = setInterval(probeModal, 2500);
    return () => clearInterval(timer);
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
    <ErrorBoundary>
    <AppShell activeTab={activeTab as any} onChangeTab={setActiveTab as any} onVoiceOpen={() => setVoicePanelOpen(true)}>
      {showDebugBanner && (
        <DebugBanner
          apiHealthy={apiHealth > 0}
          overlayBlocked={overlayBlocked}
          modalOpen={modalOpen}
          serverOnline={serverOnline}
          onDismiss={() => setShowDebugBanner(false)}
          onTogglePersist={() => setShowDebugBanner((prev) => !prev)}
          persisted={showDebugBanner}
        />
      )}
    <div id="app-wrapper" className={`flex flex-col h-screen font-sans overflow-hidden print:bg-white print:text-black relative ${clickInspectorMode ? 'cursor-crosshair' : ''}`} style={{ background: '#000814', color: '#cce8ff' }}>
      {clickInspectorMode && (
        <div className="pointer-events-none fixed right-4 top-16 z-[70] rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-2 text-xs text-fuchsia-100 backdrop-blur-xl space-y-1">
          <div>Click Inspector: ON</div>
          <div className="text-[10px] text-fuchsia-100/80">
            {inspectorLog || 'click anywhere to log hit-targets'}
          </div>
        </div>
      )}
      <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-cyan-200">Loading workspace…</div>}>
      {/* Global Animated Holographic Scanline Overlay Screen Layer */}
      <div className="holo-scanline-container print:hidden">
        <div className="holo-scanline-bar"></div>
      </div>

      {/* ===== JARVIS HEADER ===== */}
      <header id="main-header" className="shrink-0 print:hidden select-none" style={{
        background: "rgba(0,6,18,0.92)",
        borderBottom: "1px solid rgba(0,212,255,0.12)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(0,212,255,0.06)",
      }}>
        {/* Top scan line accent */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4) 30%, rgba(26,159,255,0.4) 70%, transparent)", marginBottom: 0 }} />

        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Identity */}
          <div className="flex items-center gap-3">
            {/* Arc Reactor Icon */}
            <div className="relative w-9 h-9 shrink-0 arc-reactor rounded-full flex items-center justify-center" style={{
              background: "radial-gradient(circle at 40% 40%, rgba(0,212,255,0.25), rgba(0,60,120,0.15) 50%, rgba(0,8,20,0.95))",
              border: "1px solid rgba(0,212,255,0.4)",
            }}>
              <div className="absolute inset-[4px] rounded-full" style={{ border: "1px solid rgba(0,212,255,0.2)", animation: "arc-reactor-ring 5s linear infinite" }} />
              <Cpu className="w-4 h-4 relative z-10" style={{ color: "#00d4ff", filter: "drop-shadow(0 0 4px rgba(0,212,255,0.8))" }} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-jarvis text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "#00d4ff", textShadow: "0 0 15px rgba(0,212,255,0.5)" }}>
                  {t.title}
                </h1>
                {/* Online status */}
                <div className="hidden sm:flex items-center gap-1.5 rounded px-2 py-0.5 text-[9px] font-mono font-bold sys-online">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" style={{ boxShadow: "0 0 4px #00ff88", animation: "glow-pulse 1.5s infinite" }} />
                  {t.statusOnline}
                </div>
                {/* Latency readout */}
                <div className="hidden lg:flex items-center gap-2 rounded px-2 py-0.5 text-[9px] font-mono" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)", color: "rgba(0,212,255,0.7)" }}>
                  <span className="w-1 h-1 rounded-full bg-[#00d4ff] animate-pulse" />
                  <span>LATENCY: <strong style={{ color: "#00d4ff" }}>{latency}ms</strong></span>
                  <span style={{ color: "rgba(0,212,255,0.2)" }}>│</span>
                  <span>HEALTH: <strong style={{ color: "#00ff88" }}>{apiHealth}%</strong></span>
                </div>
              </div>
              <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(0,212,255,0.35)", letterSpacing: "0.15em" }}>{t.subtitle}</p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] cursor-pointer font-mono transition-all jarvis-nav-btn"
              style={{ border: "1px solid rgba(0,212,255,0.12)", background: "rgba(0,212,255,0.04)", color: "rgba(0,212,255,0.7)" }}
              title="Search Workspace (CMD+K)"
            >
              <Search className="w-3 h-3" />
              <span className="hidden md:inline">CMD+K</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono cursor-pointer transition-all jarvis-nav-btn"
              style={{ border: "1px solid rgba(0,212,255,0.1)", background: "rgba(0,212,255,0.03)", color: "rgba(0,212,255,0.6)" }}
              title="Export report JSON"
            >
              <Download className="w-3 h-3" />
              <span className="hidden md:inline">EXPORT</span>
            </button>

            <button
              onClick={handleExportRecoveryBundle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono cursor-pointer transition-all jarvis-nav-btn"
              style={{ border: "1px solid rgba(0,255,136,0.12)", background: "rgba(0,255,136,0.03)", color: "rgba(0,255,136,0.6)" }}
              title="Export recovery bundle"
            >
              <Download className="w-3 h-3" />
              <span className="hidden lg:inline">RECOVERY</span>
            </button>

            <button
              onClick={() => recoveryImportRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono cursor-pointer transition-all jarvis-nav-btn"
              style={{ border: "1px solid rgba(245,166,35,0.15)", background: "rgba(245,166,35,0.04)", color: "rgba(245,166,35,0.7)" }}
              title="Import recovery bundle"
            >
              <Upload className="w-3 h-3" />
              <span className="hidden lg:inline">IMPORT</span>
            </button>
            <input
              ref={recoveryImportRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleImportRecoveryBundle(file);
                e.target.value = '';
              }}
            />

            <div className="hidden xl:flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[10px] font-mono" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.9)" }}>
              <Activity className="w-3 h-3" />
              <span>{t.autonomyLevel}:</span>
              <span className="font-bold" style={{ color: "#a78bfa", textShadow: "0 0 6px rgba(167,139,250,0.5)" }}>LVL {autonomyLevel}</span>
            </div>

            <button
              id="lang-toggle-btn"
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}
            >
              <Languages className="w-3 h-3" />
              <span>{t.langToggle}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== JARVIS NAV BAR ===== */}
      <nav id="primary-tabs" className="shrink-0 flex items-center overflow-x-auto gap-0.5 px-4 py-1.5 select-none print:hidden" style={{
        background: "rgba(0,4,12,0.85)",
        borderBottom: "1px solid rgba(0,212,255,0.08)",
        backdropFilter: "blur(16px)",
      }}>
        {([
          { id: 'home', label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'DASHBOARD', icon: Activity, color: '#00d4ff' },
          { id: 'chat', label: t.navChat, icon: MessageSquare, color: '#00d4ff' },
          { id: 'autonomy', label: t.navAutonomy, icon: Sliders, color: '#1a9fff' },
          { id: 'productivity', label: t.navProductivity, icon: Clipboard, color: '#7c3aed' },
          { id: 'invoice', label: t.navInvoice, icon: DollarSign, color: '#f5a623' },
          { id: 'dev', label: t.navDev, icon: Terminal, color: '#f5a623' },
          { id: 'osAgent', label: t.navOsAgent, icon: Laptop, color: '#00ff88' },
          { id: 'filterLab', label: t.navFilterLab, icon: Filter, color: '#00d4ff' },
          { id: 'roadmap', label: t.navRoadmap, icon: Milestone, color: '#1a9fff' },
          { id: 'blueprint', label: t.navSpecs, icon: BookOpen, color: '#00d4ff' },
          { id: 'vscode', label: 'VS Code', icon: Terminal, color: '#00d4ff' },
        ] as { id: any; label: string; icon: any; color: string }[]).map(({ id, label, icon: Icon, color }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`navtab-${id}`}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-mono font-bold uppercase cursor-pointer transition-all whitespace-nowrap shrink-0"
              style={isActive ? {
                background: `rgba(0,212,255,0.08)`,
                border: `1px solid rgba(0,212,255,0.22)`,
                color: color,
                textShadow: `0 0 8px ${color}80`,
                boxShadow: `0 0 10px rgba(0,212,255,0.08), inset 0 1px 0 rgba(0,212,255,0.1)`,
              } : {
                border: '1px solid transparent',
                color: 'rgba(100,116,139,0.7)',
              }}
            >
              <Icon className="w-3 h-3 shrink-0" style={isActive ? { filter: `drop-shadow(0 0 3px ${color})` } : {}} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ===== JARVIS COMMAND CENTER — Dashboard tab only (fills remaining height) ===== */}
      {activeTab === 'home' && <section className="px-4 py-3 print:hidden flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">

          {/* Main workspace card */}
          <div className="col-span-2 xl:col-span-2 relative rounded-xl overflow-hidden" style={{
            background: "linear-gradient(135deg, rgba(0,15,40,0.9) 0%, rgba(0,8,22,0.85) 100%)",
            border: "1px solid rgba(0,212,255,0.18)",
            boxShadow: "0 0 0 1px rgba(0,212,255,0.05), 0 8px 32px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,212,255,0.03)",
            backdropFilter: "blur(20px)",
          }}>
            {/* Corner accent lines */}
            <div className="absolute top-0 left-0 w-8 h-px" style={{ background: "rgba(0,212,255,0.6)" }} />
            <div className="absolute top-0 left-0 w-px h-8" style={{ background: "rgba(0,212,255,0.6)" }} />
            <div className="absolute bottom-0 right-0 w-8 h-px" style={{ background: "rgba(0,212,255,0.3)" }} />
            <div className="absolute bottom-0 right-0 w-px h-8" style={{ background: "rgba(0,212,255,0.3)" }} />
            {/* Top glow bar */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)" }} />

            <div className="p-4">
              <div className="jarvis-label mb-2">WORKSPACE COMMAND CENTER</div>
              <h2 className="font-jarvis text-base font-bold mb-1" style={{ color: "#00d4ff", textShadow: "0 0 15px rgba(0,212,255,0.4)" }}>
                {lang === 'bn' ? 'এক নজরে Neora workspace' : 'NEORA AI SYSTEM'}
              </h2>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                {lang === 'bn'
                  ? 'চ্যাট, অটোমেশন, মেমরি, এবং OS agent এক স্ক্রিনে।'
                  : 'Neural interface · Autonomous operations · Memory persistence · OS control'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { label: 'CHAT', tab: 'chat', color: '#00d4ff' },
                  { label: 'OS AGENT', tab: 'osAgent', color: '#00ff88' },
                  { label: 'PLANNER', tab: 'autonomy', color: '#1a9fff' },
                  { label: 'ROADMAP', tab: 'roadmap', color: '#7c3aed' },
                ] as { label: string; tab: any; color: string }[]).map(({ label, tab, color }) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all"
                    style={{
                      background: `${color}12`,
                      border: `1px solid ${color}30`,
                      color: color,
                      textShadow: `0 0 6px ${color}60`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks metric */}
          <div className="relative rounded-xl overflow-hidden p-3" style={{
            background: "linear-gradient(135deg, rgba(0,15,35,0.9), rgba(0,8,20,0.8))",
            border: "1px solid rgba(0,212,255,0.15)",
            boxShadow: "inset 0 0 20px rgba(0,212,255,0.03)",
            backdropFilter: "blur(20px)",
          }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)" }} />
            <div className="jarvis-label mb-2">TASKS</div>
            <div className="font-jarvis text-3xl font-bold" style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.5)" }}>{tasks.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">{tasks.filter(x => !x.completed).length} active</div>
            <div className="mt-2 jarvis-progress h-0.5">
              <div className="jarvis-progress-bar" style={{ width: `${tasks.length > 0 ? (tasks.filter(x => x.completed).length / tasks.length) * 100 : 0}%` }} />
            </div>
          </div>

          {/* Memory metric */}
          <div className="relative rounded-xl overflow-hidden p-3" style={{
            background: "linear-gradient(135deg, rgba(10,5,35,0.9), rgba(5,0,20,0.8))",
            border: "1px solid rgba(124,58,237,0.2)",
            boxShadow: "inset 0 0 20px rgba(124,58,237,0.04)",
            backdropFilter: "blur(20px)",
          }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)" }} />
            <div className="jarvis-label mb-2" style={{ color: "rgba(167,139,250,0.7)" }}>MEMORY</div>
            <div className="font-jarvis text-3xl font-bold" style={{ color: "#a78bfa", textShadow: "0 0 20px rgba(124,58,237,0.5)" }}>{memories.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Persistent entries</div>
            <div className="mt-2 h-0.5 rounded" style={{ background: "rgba(124,58,237,0.12)" }}>
              <div className="h-full rounded" style={{ width: `${Math.min(memories.length * 20, 100)}%`, background: "linear-gradient(90deg, rgba(124,58,237,0.6), rgba(167,139,250,0.9))", boxShadow: "0 0 6px rgba(124,58,237,0.5)" }} />
            </div>
          </div>

          {/* Agent metric */}
          <div className="relative rounded-xl overflow-hidden p-3" style={{
            background: "linear-gradient(135deg, rgba(0,20,10,0.9), rgba(0,10,5,0.8))",
            border: "1px solid rgba(0,255,136,0.15)",
            boxShadow: "inset 0 0 20px rgba(0,255,136,0.03)",
            backdropFilter: "blur(20px)",
          }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)" }} />
            <div className="jarvis-label mb-2" style={{ color: "rgba(0,255,136,0.6)" }}>AGENT</div>
            <div className="font-jarvis text-3xl font-bold" style={{ color: "#00ff88", textShadow: "0 0 20px rgba(0,255,136,0.5)" }}>{latency}ms</div>
            <div className="text-[11px] text-slate-400 mt-1">{apiHealth}% health</div>
            <div className="mt-2 h-0.5 rounded" style={{ background: "rgba(0,255,136,0.1)" }}>
              <div className="h-full rounded" style={{ width: `${apiHealth}%`, background: "linear-gradient(90deg, rgba(0,255,136,0.6), rgba(0,255,136,0.9))", boxShadow: "0 0 6px rgba(0,255,136,0.5)" }} />
            </div>
          </div>

        </div>

        {/* ===== OS QUICK LAUNCHER ===== */}
        <div className="mt-3 relative rounded-xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(0,20,10,0.92) 0%, rgba(0,10,5,0.88) 100%)',
          border: '1px solid rgba(0,255,136,0.2)',
          boxShadow: '0 0 0 1px rgba(0,255,136,0.04), inset 0 0 20px rgba(0,255,136,0.03)',
          backdropFilter: 'blur(20px)',
        }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.5), transparent)' }} />
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 4px #00ff88' }} />
              <span className="jarvis-label" style={{ color: 'rgba(0,255,136,0.7)' }}>OS QUICK COMMAND</span>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('qcmd') as HTMLInputElement);
              const val = input?.value?.trim();
              if (!val) return;
              input.value = '';
              try {
                await neoraPost('/api/os/command', { prompt: val });
                setActiveTab('osAgent');
              } catch { /* ignore */ }
            }} className="flex gap-2">
              <input
                name="qcmd"
                type="text"
                placeholder={lang === 'bn' ? 'যেমন: নোটপ্যাড খোলো, ফাইল লিখো...' : 'e.g. open notepad, write file hello.txt: Hi'}
                className="flex-1 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                style={{
                  background: 'rgba(0,255,136,0.05)',
                  border: '1px solid rgba(0,255,136,0.2)',
                  color: 'rgba(186,240,210,0.85)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'}
              />
              <button type="submit" className="px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all" style={{
                background: 'rgba(0,255,136,0.12)',
                border: '1px solid rgba(0,255,136,0.3)',
                color: '#00ff88',
              }}>RUN</button>
            </form>
          </div>
        </div>

        {/* ===== REAL-TIME SYSTEM JOURNAL ===== */}
        <LiveJournalWidget className="mt-2" />
      </section>}

      {/* Main Content — hidden on Dashboard tab */}
      {activeTab !== 'home' && <main id="main-content" className="flex-1 flex min-h-0 overflow-hidden">
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
            geminiKey={geminiKey}
            setGeminiKey={setGeminiKey}
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
       </main>}

      {/* --- UNDO TOAST NOTIFICATION SYSTEM (5-SECOND DISMISS) --- */}
      <AnimatePresence>
        {showUndo && lastDeleted && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 backdrop-blur-xl"
            style={{
              background: "rgba(0,10,25,0.95)",
              border: "1px solid rgba(0,212,255,0.3)",
              boxShadow: "0 0 0 1px rgba(0,212,255,0.08), 0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,212,255,0.08)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff", animation: "glow-pulse 1s infinite" }} />
              <span className="text-xs font-mono" style={{ color: "rgba(0,212,255,0.8)" }}>
                {lang === 'bn' ? 'আইটেম মুছে ফেলা হয়েছে।' : 'ITEM DELETED'}
              </span>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 text-[10px] font-bold font-mono px-3 py-1.5 rounded uppercase transition-all"
              style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.35)", color: "#00d4ff", textShadow: "0 0 6px rgba(0,212,255,0.5)" }}
            >
              <Undo className="w-3 h-3" />
              <span>{lang === 'bn' ? 'পূর্বাবস্থায়' : 'UNDO'}</span>
            </button>
            <button
              onClick={() => setShowUndo(false)}
              className="p-1 transition-colors"
              style={{ color: "rgba(0,212,255,0.4)" }}
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
            className="fixed inset-0 backdrop-blur-md z-50 flex items-start justify-center p-4 sm:p-10 pt-20"
            style={{ background: "rgba(0,4,12,0.85)" }}
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -30, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -30, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col"
              style={{
                background: "rgba(0,8,22,0.97)",
                border: "1px solid rgba(0,212,255,0.25)",
                boxShadow: "0 0 0 1px rgba(0,212,255,0.08), 0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,255,0.08)",
                backdropFilter: "blur(24px)",
              }}
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
      {/* ===== HOLOGRAPHIC NOTIFICATION SYSTEM ===== */}
      <NeoraNotifications reminders={reminders} apiHealth={apiHealth} />

      {/* ===== VOICE COMMAND PANEL ===== */}
      {voicePanelOpen && (
        <VoiceCommandPanel
          lang={lang}
          onAddTask={handleAddTask}
          onAddNote={handleAddNote}
          onAddReminder={handleAddReminder}
          onNavigate={(tab) => { setActiveTab(tab as any); setVoicePanelOpen(false); }}
          onClose={() => setVoicePanelOpen(false)}
        />
      )}
      </Suspense>
    </div>
    </AppShell>
    </ErrorBoundary>
  );
}
