import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SectionViewer } from './components/SectionViewer';
import { ChatView } from './components/ChatView';
import { PlannerView } from './components/PlannerView';
import { OrganizerView } from './components/OrganizerView';
import { EarningView } from './components/EarningView';
import { DevStudioView } from './components/DevStudioView';
import { FilterLabView } from './components/FilterLabView';
import { RoadmapView } from './components/RoadmapView';
import { SECTIONS, RAW_MASTER_PROMPT } from './masterPromptText';
import { Task, Reminder, Note, Memory } from './types';
import { TRANSLATIONS } from './translations';
import {
  MessageSquare, Cpu, Sliders, DollarSign, Clipboard,
  Languages, Bell, Terminal, BookOpen, Key, LogOut, Filter, Milestone
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [activeTab, setActiveTab] = useState<'chat' | 'autonomy' | 'productivity' | 'invoice' | 'dev' | 'blueprint' | 'filterLab' | 'roadmap'>('chat');
  
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

  React.useEffect(() => {
    localStorage.setItem('neora_use_groq', useGroq.toString());
  }, [useGroq]);

  React.useEffect(() => {
    localStorage.setItem('neora_groq_key', groqKey);
  }, [groqKey]);

  React.useEffect(() => {
    localStorage.setItem('neora_groq_model', groqModel);
  }, [groqModel]);

  // Specifications state binders
  const [selectedSectionId, setSelectedSectionId] = useState<string>(SECTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
    setMemories(prev => [newMem, ...prev]);
  };

  // Toggle checklist status
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
  };
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(x => x.id !== id));
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
  };
  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(x => x.id !== id));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(x => x.id !== id));
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div id="app-wrapper" className="flex flex-col h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden print:bg-white print:text-black relative">
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
            </div>
            <p className="text-[10px] text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Global Toolbar and Language controllers */}
        <div className="flex items-center gap-3">
          
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
      </nav>

      {/* Main Content Workspace Layout Rendering Section */}
      <main id="main-content" className="flex-1 flex overflow-hidden">
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
      </main>
    </div>
  );
}
