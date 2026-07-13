import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Sparkles, Database, CheckCircle2, Globe, Cpu, 
  Trash2, Play, Square, Download, Search, RefreshCw, Layers 
} from 'lucide-react';

export interface SystemEvent {
  id: string;
  timestamp: string;
  category: 'api_call' | 'memory_update' | 'task_completion' | 'system_heal';
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  message: string;
  details: string;
  latency?: string;
}

interface SystemEventLogProps {
  lang: 'en' | 'bn';
  onAddSystemLog?: (message: string) => void;
}

export function SystemEventLog({ lang, onAddSystemLog }: SystemEventLogProps) {
  const [filter, setFilter] = useState<'all' | 'api_call' | 'memory_update' | 'task_completion'>('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Historical event entries stack
  const [events, setEvents] = useState<SystemEvent[]>([
    {
      id: "evt-201",
      timestamp: new Date(Date.now() - 45000).toTimeString().split(' ')[0],
      category: "api_call",
      level: "SUCCESS",
      message: lang === "bn" ? "জেমিনি এপিআই: ভয়েস ইনটেন্ট ক্লাসিফিকেশন রিকোয়েস্ট সম্পন্ন" : "Gemini API: Intent recognition call resolved BROWSER_TASK",
      details: JSON.stringify({
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        resolved_intent: "BROWSER_TASK",
        confidence: "99.4%",
        latency_ms: 324,
        tokens_input: 1245,
        tokens_output: 142
      }, null, 2),
      latency: "324ms"
    },
    {
      id: "evt-202",
      timestamp: new Date(Date.now() - 32000).toTimeString().split(' ')[0],
      category: "memory_update",
      level: "INFO",
      message: lang === "bn" ? "লোকাল ডেটাবেস কোর: ক্লায়েন্ট রেফারেন্স মেমরি লেজার সেভ সম্পন্ন" : "Memory Ledger: Committed preference key [shukria_standard_discount]",
      details: JSON.stringify({
        operation: "DB_WRITE_COMMIT",
        target_store: "neora_memories",
        key: "shukria_standard_discount",
        value: "10% corporate lamination discount rate",
        checksum: "SHA255-89AB01",
        status: "PERSISTENT_OK"
      }, null, 2),
      latency: "1.4ms"
    },
    {
      id: "evt-203",
      timestamp: new Date(Date.now() - 15000).toTimeString().split(' ')[0],
      category: "task_completion",
      level: "SUCCESS",
      message: lang === "bn" ? "টাস্ক কমপ্লিট: ব্যানার ডিজাইন ভ্যালিডেশন স্ক্রিপ্ট সম্পন্ন" : "Task Completed: Banner Design Specs Verification Audit resolved",
      details: JSON.stringify({
        task_id: "tsk-091a",
        title: "Verify Shukria Banner PVC dimensions",
        priority: "high",
        execution_actor: "Autonomous Pipeline Router Module 5",
        impact: "Validated 15% BD VAT margins correctly in layout coordinates"
      }, null, 2),
      latency: "45ms"
    },
    {
      id: "evt-204",
      timestamp: new Date(Date.now() - 5000).toTimeString().split(' ')[0],
      category: "api_call",
      level: "SUCCESS",
      message: lang === "bn" ? "জেমিনি ফেইলওভার টানেল: এআই টেমপ্লেট কম্পাইলার রিকোয়েস্ট resolved" : "Gemini Core Gateway: Auto-compiled self-optimization plan blueprint",
      details: JSON.stringify({
        gateway_protocol: "Server-Side Gemini API Proxy",
        temperature: 0.25,
        prompt_sector: "Self-Evolution Gap Analysis Core",
        status_code: 200,
        latency_ms: 180
      }, null, 2),
      latency: "180ms"
    }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isPlaying && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, isPlaying]);

  // Handle external system updates and trigger log streams
  useEffect(() => {
    const handleAddSystemEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SystemEvent>;
      if (customEvent.detail) {
        // Defer state update to next tick to avoid "Cannot update a component while rendering a different component"
        setTimeout(() => {
          setEvents(prev => {
            if (prev.some(item => item.id === customEvent.detail.id)) return prev;
            return [...prev.slice(-39), customEvent.detail];
          });
          if (onAddSystemLog) {
            onAddSystemLog(`[NEORA_EVENT] [${customEvent.detail.category.toUpperCase()}] ${customEvent.detail.message}`);
          }
        }, 0);
      }
    };
    window.addEventListener('neora-system-event', handleAddSystemEvent);
    return () => {
      window.removeEventListener('neora-system-event', handleAddSystemEvent);
    };
  }, [onAddSystemLog]);

  // Periodic simulated live action logs to mimic an advanced operating system
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Pause simulation when tab is hidden or low-resource mode is active
      const tabHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const isLowMode = typeof window !== 'undefined' && localStorage.getItem("neora_low_resource_mode") === 'true';
      const isUserIdle = typeof window !== 'undefined' && localStorage.getItem("neora_user_idle") === 'true';

      if (tabHidden) return; // Completely pause processing when tab is not in focus to save PC CPU/RAM
      if (isLowMode && isUserIdle) {
        if (Math.random() > 0.1) return; // Scale down frequency by 90%
      } else if (isLowMode || isUserIdle) {
        if (Math.random() > 0.3) return; // Scale down frequency by 70%
      }

      const categories: SystemEvent['category'][] = ['api_call', 'memory_update', 'task_completion'];
      const levels: SystemEvent['level'][] = ['INFO', 'SUCCESS', 'WARNING'];
      
      const chosenCat = categories[Math.floor(Math.random() * categories.length)];
      const chosenLvl = levels[Math.floor(Math.random() * levels.length)];
      
      let msg = '';
      let detailsText = '';
      let latencyStr = '0.5ms';

      const timestampStr = new Date().toTimeString().split(' ')[0];

      if (chosenCat === 'api_call') {
        const apis = [
          {
            m: lang === 'bn' ? 'জেমিনি এলএলএম গেটওয়ে: নিউরাল চ্যাট টোকেন প্রসেস সম্পন্ন' : 'Gemini Gateway: Processed neural chat completion token',
            d: { endpoint: 'Gemini-2.5-Flash', input_tokens: 845, output_tokens: 110, latency_ms: 220, safe_rating: '100% compliant' },
            l: '220ms'
          },
          {
            m: lang === 'bn' ? 'হোস্ট পিসি এজেন্ট: ওএস এপিআই পোলিং স্ট্যাটাস চেক' : 'Host PC Agent: Polled OS agent status indicators',
            d: { protocol: 'CJS secure socket', endpoint: '/api/os/status', client_ping_ms: 4, auth_token: 'valid' },
            l: '4ms'
          }
        ];
        const chosen = apis[Math.floor(Math.random() * apis.length)];
        msg = chosen.m;
        detailsText = JSON.stringify(chosen.d, null, 2);
        latencyStr = chosen.l;
      } else if (chosenCat === 'memory_update') {
        const mems = [
          {
            m: lang === 'bn' ? 'কোর মেমরি স্টোর: ইউজার প্রেফারেন্স ইনডেক্স সিঙ্ক' : 'Memory Store: Synced user preference index key',
            d: { key: 'neora_speak_volume_on', value: 'true', store: 'localStorage', sync_checksum: 'SHA1-80FA9' },
            l: '0.8ms'
          },
          {
            m: lang === 'bn' ? 'ক্যালেন্ডার ডেটাবেস: শুকরিয়া প্রিন্টিং ডিউ ডেট রিকভারি' : 'Calendar DB: Recovered Shukria Printing due date markers',
            d: { store: 'neora_calendar', action: 'RECONCILE', modified_records: 1, status: 'CONSISTENT' },
            l: '1.5ms'
          }
        ];
        const chosen = mems[Math.floor(Math.random() * mems.length)];
        msg = chosen.m;
        detailsText = JSON.stringify(chosen.d, null, 2);
        latencyStr = chosen.l;
      } else {
        const tsks = [
          {
            m: lang === 'bn' ? 'অটোনমাস ফাইন্ডার: পেন্ডিং পিডিএফ প্রিন্ট জব সিঙ্ক' : 'Task Completer: Synced pending PDF print jobs queue',
            d: { task_id: 'tsk-095', title: 'Compile Shukria Banner PVC dimensions', priority: 'medium', completed: true },
            l: '12ms'
          },
          {
            m: lang === 'bn' ? 'সিস্টেম ব্যাকআপ রুটিন: অটোনমাস ২৫৬-বিট রিকভারি ফাইল সেভ' : 'System Backup: Saved autonomous 256-bit recovery package bundle',
            d: { backup_id: 'rec-2026', key_count: 42, size_bytes: 8520, status: 'SUCCESSFULLY_STORED_LOCAL_FS' },
            l: '15ms'
          }
        ];
        const chosen = tsks[Math.floor(Math.random() * tsks.length)];
        msg = chosen.m;
        detailsText = JSON.stringify(chosen.d, null, 2);
        latencyStr = chosen.l;
      }

      const newEvent: SystemEvent = {
        id: "evt-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
        timestamp: timestampStr,
        category: chosenCat,
        level: chosenLvl,
        message: msg,
        details: detailsText,
        latency: latencyStr
      };

      setEvents(prev => [...prev.slice(-39), newEvent]);
      if (onAddSystemLog) {
        onAddSystemLog(`[LIVE_EVENT] ${msg}`);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, onAddSystemLog, lang]);

  const handleClear = () => {
    setEvents([]);
    setSelectedEventId(null);
  };

  const handleExport = () => {
    const textStr = events.map(e => `[${e.timestamp}] [${e.level}] [${e.category.toUpperCase()}] ${e.message} (Latency: ${e.latency || 'N/A'})\nDetails:\n${e.details}\n===================================`).join('\n\n');
    const blob = new Blob([textStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neora_system_event_log_${new Date().toISOString().substring(0,10)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredEvents = events.filter(e => {
    const matchesCategory = filter === 'all' || e.category === filter;
    const matchesSearch = e.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.level.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="system-event-log-container" className="rounded-xl overflow-hidden flex flex-col bg-slate-950/90 border border-cyan-500/15 backdrop-blur-xl transition-all duration-500" style={{
      boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 0 30px rgba(0,212,255,0.02)"
    }}>
      {/* Header */}
      <div className="p-3 border-b border-slate-900/60 bg-slate-900/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <div className="text-left">
            <span className="font-mono text-[10px] font-bold text-cyan-400 tracking-[0.2em] flex items-center gap-1.5 uppercase">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>SYSTEM EVENT LOG (AUTONOMOUS ACTIONS)</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-[9px] font-mono">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2 py-1 rounded border flex items-center gap-1 font-bold cursor-pointer transition-colors ${
              isPlaying ? 'bg-cyan-950/20 text-cyan-400 border-cyan-900/30 hover:bg-cyan-950/40' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-2.5 h-2.5 fill-cyan-400 stroke-none" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 fill-slate-400 stroke-none" />
                <span>RESUME</span>
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-rose-400 rounded border border-slate-800 cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>CLEAR</span>
          </button>
          <button
            onClick={handleExport}
            className="px-2 py-1 bg-gradient-to-r from-blue-950/30 to-cyan-950/30 border border-cyan-900/30 text-cyan-400 hover:text-white hover:border-cyan-500 rounded cursor-pointer flex items-center gap-1"
          >
            <Download className="w-2.5 h-2.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Filter Categories Row */}
      <div className="px-3 py-2 border-b border-slate-900/60 bg-slate-900/5 flex flex-col sm:flex-row items-stretch gap-2 shrink-0">
        <div className="flex flex-wrap gap-1 text-[8px] flex-1">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${filter === 'all' ? 'bg-indigo-950 text-indigo-400 border border-indigo-850/40' : 'bg-slate-900/40 text-slate-500 border border-transparent hover:text-slate-450'}`}
          >
            ALL EVENTS
          </button>
          <button 
            onClick={() => setFilter('api_call')} 
            className={`px-2 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1 ${filter === 'api_call' ? 'bg-cyan-950 text-cyan-400 border border-cyan-900/40' : 'bg-slate-900/40 text-slate-500 border border-transparent hover:text-slate-400'}`}
          >
            <Globe className="w-2 h-2 text-cyan-400" />
            API CALLS
          </button>
          <button 
            onClick={() => setFilter('memory_update')} 
            className={`px-2 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1 ${filter === 'memory_update' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 'bg-slate-900/40 text-slate-500 border border-transparent hover:text-slate-400'}`}
          >
            <Database className="w-2 h-2 text-emerald-400" />
            MEMORY UPDATES
          </button>
          <button 
            onClick={() => setFilter('task_completion')} 
            className={`px-2 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1 ${filter === 'task_completion' ? 'bg-amber-955/20 text-amber-500 border border-amber-900/30' : 'bg-slate-900/40 text-slate-500 border border-transparent hover:text-slate-400'}`}
          >
            <CheckCircle2 className="w-2 h-2 text-amber-500" />
            TASK COMPLETIONS
          </button>
        </div>
        
        <div className="relative min-w-[130px] sm:max-w-[200px]">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'ইভেন্ট অনুসন্ধান...' : 'Search events...'}
            className="w-full bg-slate-950 border border-slate-900 rounded p-1 pl-5 text-[8.5px] text-white focus:outline-none focus:border-cyan-500/30 placeholder-slate-700"
          />
          <Search className="w-2.5 h-2.5 absolute left-1.5 top-2 text-slate-700 pointer-events-none" />
        </div>
      </div>

      {/* Ticker Stream Area */}
      <div className="overflow-y-auto p-3 space-y-1.5 font-mono text-[9.5px] text-left max-h-60" style={{ height: 210 }}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((e) => {
            const isSelected = e.id === selectedEventId;
            const isInfo = e.level === 'INFO';
            const isSucc = e.level === 'SUCCESS';
            const isWarn = e.level === 'WARNING';
            
            let catLabel = 'API';
            let catColor = 'text-cyan-400 border-cyan-950 bg-cyan-950/15';
            if (e.category === 'memory_update') {
              catLabel = 'MEMORY';
              catColor = 'text-emerald-400 border-emerald-950 bg-emerald-950/15';
            } else if (e.category === 'task_completion') {
              catLabel = 'TASK';
              catColor = 'text-amber-500 border-amber-950 bg-amber-955/5';
            }

            return (
              <div 
                key={e.id}
                onClick={() => setSelectedEventId(isSelected ? null : e.id)}
                className={`p-2 rounded-lg border hover:bg-slate-900/50 transition-all cursor-pointer select-none ${
                  isSelected ? 'border-cyan-500 bg-slate-900/30' : 'border-slate-900 bg-slate-955/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[8.5px] text-slate-600">{e.timestamp}</span>
                    <span className={`text-[7.5px] border font-bold px-1 py-0.2 rounded ${catColor}`}>
                      {catLabel}
                    </span>
                    <span className={`text-[7.5px] font-bold px-1 rounded uppercase ${
                      isSucc ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' :
                      isWarn ? 'bg-amber-955/20 text-amber-500 border border-amber-900/20' :
                      'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {e.level}
                    </span>
                  </div>

                  {e.latency && (
                    <span className="text-[7.5px] bg-slate-900 text-cyan-400 border border-slate-800 px-1 py-0.2 rounded">
                      LAT: <strong>{e.latency}</strong>
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-start justify-between gap-1">
                  <p className="text-left font-sans text-slate-200 text-[9.5px] leading-relaxed flex-1">
                    {e.message}
                  </p>
                </div>

                {/* Expanded Details Panel */}
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-slate-900 select-text cursor-default" onClick={(ev) => ev.stopPropagation()}>
                    <pre className="p-2 bg-slate-975 border border-slate-925 rounded text-[8px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto block text-left">
                      {e.details}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600 italic select-none">
            <Terminal className="w-6 h-6 text-slate-800 mb-1" />
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">AWAITING SYSTEM MOTIONS</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
