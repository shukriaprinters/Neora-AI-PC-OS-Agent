import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Sparkles, 
  Trash2, 
  Play, 
  Square, 
  Download, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  FileCode, 
  RotateCcw, 
  Cpu, 
  Sliders, 
  ChevronDown, 
  ChevronRight, 
  Info,
  Layers,
  Database
} from 'lucide-react';

export interface JournalEntry {
  id: string;
  timestamp: string;
  category: 'autonomous_decision' | 'self_update' | 'task_execution';
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  message: string;
  details: string;
  actor: string;
  impactMetrics?: {
    label: string;
    value: string;
  };
}

interface SystemJournalProps {
  lang: 'en' | 'bn';
  onAddSystemLog?: (message: string) => void;
  onModifyVirtualFile?: (name: string, content: string) => void;
}

export function SystemJournal({ lang, onAddSystemLog, onModifyVirtualFile }: SystemJournalProps) {
  const [filter, setFilter] = useState<'all' | 'autonomous_decision' | 'self_update' | 'task_execution'>('all');
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  
  // Real-time task sequence state
  const [isUpdatingSelf, setIsUpdatingSelf] = useState(false);
  const [updateStepName, setUpdateStepName] = useState('');
  
  // Logs stack state
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "jnl-112",
      timestamp: "22:35:45",
      category: "autonomous_decision",
      level: "SUCCESS",
      message: lang === "bn" ? "ভয়েস ওয়েক-ওয়ার্ড সনাক্তকরণ এবং ইনটেন্ট ক্লাসিফিকেশন ( Hey Neora open Chrome )" : "Wake Word Activated: \"Hey Neora, open Chrome\" matched Intent BROWSER_TASK",
      actor: "Module 1-3 Intent Router Engine",
      details: JSON.stringify({
        input_type: "VOICE_STREAM",
        wake_word: "Hey Neora",
        confidence: "99.2%",
        resolved_intent: "BROWSER_TASK",
        target_process: "Google Chrome browser adapter",
        action: "SPAWN_PROCESS",
        timestamp: "2026-06-06 22:35:45"
      }, null, 2),
      impactMetrics: { label: "Wake Precision", value: "99.2%" }
    },
    {
      id: "jnl-111",
      timestamp: "22:33:12",
      category: "autonomous_decision",
      level: "SUCCESS",
      message: lang === "bn" ? "এলএলএম ফেইলওভার মডেল রেজিস্ট্রি হ্যান্ডলার" : "LLM Abstraction Handover: Selected Gemini Core-1 (Fallback: Groq Llama-3-70B)",
      actor: "Module 2 Provider Register",
      details: `[PROVIDER ROUTER] Preferred endpoint 'Gemini-Pro' latency matches baseline standards (182ms).\nBinding local environment parameters process.env.GEMINI_API_KEY.\nFallback registry array mounted: [Ollama Local, Groq Client, OpenRouter Proxy].`,
      impactMetrics: { label: "Model Latency", value: "182ms" }
    },
    {
      id: "jnl-110",
      timestamp: "22:30:08",
      category: "task_execution",
      level: "INFO",
      message: lang === "bn" ? "ভার্চুয়াল কার্সার মাউস ক্লিক ইভেন্ট" : "PC Controller Module 7: Moved cursor to [240, 510] & executed Click",
      actor: "Full PC Controller Node-1",
      details: `[X11 CURSOR EVENT] Mouse actions dispatched:\n- Action: Move\n- Coordinates: X=240, Y=510\n- Target Workspace element: "vat_input"\n- Event: SINGLE_CLICK\n- Click sound buffer synthesized on active output channels.`,
      impactMetrics: { label: "Cursor Coordinate", value: "X=240, Y=510" }
    },
    {
      id: "jnl-109",
      timestamp: "22:28:15",
      category: "autonomous_decision",
      level: "SUCCESS",
      message: lang === "bn" ? "ভ্যাট লেজার ফাইল ভেলিডেশন সম্পন্ন" : "Module 12 Safety Layer: Consolidated Tax Invoice Integrity Audit Ledger",
      actor: "Fintech VAT Auditor core-4",
      details: JSON.stringify({
        action: "COMPILE_TAX_BOUNDS",
        target_path: "billing/vats_ledger_audit.json",
        company_standard: "Shukria Printers standard 15.00% VAT",
        result: "Verified compliant. Hash index SHA-256 matches standards."
      }, null, 2),
      impactMetrics: { label: "Tax Standard", value: "15% corporate" }
    },
    {
      id: "jnl-108",
      timestamp: "22:25:31",
      category: "self_update",
      level: "INFO",
      message: lang === "bn" ? "প্যাকেজ মেমোরি ডেমন অটো অডিট" : "Module 11 SQLite Cache: Committed Transient Thread Session State",
      actor: "SQLite Memory Node-3",
      details: `[PERSISTENT STORAGE] Structured snapshot stored.\nActive graph checkpoint ID: "chk-908a"\nDatabase state: INTEGRITY_OK\nPort 3000 mapping parameters persistently mapped inside diagnostics config space.`,
      impactMetrics: { label: "DB Commit", value: "Persistent OK" }
    },
    {
      id: "jnl-107",
      timestamp: "22:22:11",
      category: "task_execution",
      level: "SUCCESS",
      message: lang === "bn" ? "অফসেট প্রিন্টিং স্পেসিফিকেশন কম্পাইল্ড" : "Module 5 OCR Scan: Analyzed Viewport and cataloged text elements",
      actor: "Desktop Vision Engine OCR",
      details: `[VISION SCAN] Swept viewport coords bounds [0,0] to [1280, 800].\nOCR Detected: "VAT Total: 15.00%" inside text sector.\nButton shapes identified: 4 active clickable regions recorded.`,
      impactMetrics: { label: "Vision Latency", value: "45ms" }
    },
    {
      id: "jnl-106",
      timestamp: "22:19:04",
      category: "autonomous_decision",
      level: "CRITICAL",
      message: lang === "bn" ? "ইপিইআরএম রাইট লক সংঘর্ষ স্বয়ংক্রিয়ভাবে সমাধান" : "Policy Sandbox Safeguard: Resolved Concurrent Write lock deadlock",
      actor: "Kernel Security Manager Core-1",
      details: `[ALARM / CORRECTION] Detected overlapping write stream handle locking public/ and assets/ directories.\nAutomatic kernel hotfix dispatched: Forcefully unchained lingering thread references.\nSimulated lock unhooked. Filesystem access granted to layout engines safely.`,
      impactMetrics: { label: "Lock Cleared", value: "assets/ IO Lock" }
    },
    {
      id: "jnl-105",
      timestamp: "22:15:45",
      category: "self_update",
      level: "SUCCESS",
      message: lang === "bn" ? "সিস্টেম সাব-মডিউল ভল্ট ব্যাকআপ সম্পন্ন" : "Module 8 Workflow Engine: Executed PowerPoint summary generation",
      actor: "Office Slide Adapter",
      details: JSON.stringify({
        event: "GENERATE_PPT",
        source_data: "billing/vats_ledger_audit.json",
        destination_slides: "diagnostics/vat_summary_report.ppt",
        pages_built: 4,
        rules_applied: "15% calculated margins"
      }, null, 2),
      impactMetrics: { label: "Slides Generated", value: "4 slide-pages" }
    },
    {
      id: "jnl-104",
      timestamp: "22:12:30",
      category: "task_execution",
      level: "INFO",
      message: lang === "bn" ? "আইপি পোর্ট ৩০০০ পোর্ট কনফিগারেশন স্ক্যান" : "Module 18 Registry-Driven Check: Confirmed Port 3000 Ingress Safety",
      actor: "ToolRegistry Node Gateway",
      details: `[PORT INSPECT] Standard binding active.\nHosting Address: http://0.0.0.0:3000\nNo conflicting process binds detected. Safe container proxy standards confirmed.`,
      impactMetrics: { label: "Proxy Address", value: "Port 3000 OK" }
    },
    {
      id: "jnl-103",
      timestamp: "22:08:15",
      category: "task_execution",
      level: "SUCCESS",
      message: lang === "bn" ? "প্রক্সিকন্ট্রোল নোড বাইন্ডিং যাচাই স্ক্যান" : "Ingress Proxy Node Binding Verification Scan",
      actor: "Vite Ingress Gateway",
      details: `[SSL INGRESS] Binding status verified.\nHosting Address: http://0.0.0.0:3000\nNo conflicting process binds detected. Safe sandboxing confirmed.`,
      impactMetrics: { label: "Ingress Port", value: "3000 Bind Active" }
    }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto Scroll to bottom when entries are made if isPlaying
  useEffect(() => {
    if (isPlaying && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries, isPlaying]);

  // Simulated Real-Time Autonomous Log Stream loop
  useEffect(() => {
    if (!isPlaying || isUpdatingSelf) return;

    const interval = setInterval(() => {
      // Periodic log generation simulating AI OS activity
      const categories: JournalEntry['category'][] = ['autonomous_decision', 'self_update', 'task_execution'];
      const levels: JournalEntry['level'][] = ['INFO', 'SUCCESS', 'WARNING'];
      
      const chosenCat = categories[Math.floor(Math.random() * categories.length)];
      const chosenLvl = levels[Math.floor(Math.random() * levels.length)];
      
      let msg = '';
      let detailsText = '';
      let actorName = '';
      let labelText = '';
      let valText = '';

      const timestamps = new Date().toTimeString().split(' ')[0];

      if (chosenCat === 'autonomous_decision') {
        const dActions = [
          {
            m: lang === 'bn' ? 'অপ্রয়োজনীয় মেমরি ব্লক রিসাইকেল্ড' : 'Defragmented Heap Node Clusters',
            d: 'GC detected a 14.5MB threshold peak load. Synchronously flushed layout render buffers.',
            a: 'Cognitive LPU GC Node',
            l: 'RAM savings',
            v: '12.4 MB'
          },
          {
            m: lang === 'bn' ? 'গিট গ্লোবাল অডিট স্টেজ সিঙ্ক' : 'Audited Dynamic Git Directory Tree',
            d: 'Scanned package descriptors. 100% clean signatures. No staging bottlenecks identified.',
            a: 'Git Tracker Daemon',
            l: 'Audit state',
            v: '0 Conflicts'
          },
          {
            m: lang === 'bn' ? '১৫% কর্পোরেট ভ্যাট রিগ্রেশন রান সম্পন্ন' : 'Recalibrated VAT Billing Database Calculations',
            d: 'Enforced 15.00% corporate tax coefficients across current layout invoices variables.',
            a: 'Fintech VAT Auditor core-4',
            l: 'Tax compliance',
            v: '15.00% Match'
          }
        ];
        const item = dActions[Math.floor(Math.random() * dActions.length)];
        msg = item.m;
        detailsText = `[AUTONOMOUS_POLICY_EVALUATION] Resolved successfully.\nDetails:\n  Actor: ${item.a}\n  Timestamp: ${timestamps}\n  Description: ${item.d}\n  Impact: ${item.v}`;
        actorName = item.a;
        labelText = item.l;
        valText = item.v;
      } else if (chosenCat === 'self_update') {
        const uActions = [
          {
            m: lang === 'bn' ? 'উইস্পার স্পিচ কনফিডেন্স ফ্যাক্টর রি-ভ্যালিডেটেড' : 'Re-tuned Whisper Speech Confidence Coefficient',
            d: 'Applied corrective feedback loops with filter factors. Auto-realigned speech standard thresholds to 98.6%.',
            a: 'Whisper Confidence Tuner',
            l: 'STT Precision',
            v: '98.6%'
          },
          {
            m: lang === 'bn' ? 'ভার্চুয়াল ফাইল ডেসক্রিপ্টর সিঙ্ক সফল' : 'Synchronized Local File System Sector Cache Index',
            d: 'Wrote dynamic database ledger files block snapshot. Confirmed 0 write collision rate in CJS boundaries.',
            a: 'IO Ring Manager',
            l: 'Write Latency',
            v: '1.2ms'
          }
        ];
        const item = uActions[Math.floor(Math.random() * uActions.length)];
        msg = item.m;
        detailsText = `[SELF_UPDATE_TRIGGER] Operation successful.\nDetails:\n  Actor: ${item.a}\n  Changes: ${item.d}\n  Performance target: ${item.v}`;
        actorName = item.a;
        labelText = item.l;
        valText = item.v;
      } else {
        const tActions = [
          {
            m: lang === 'bn' ? 'অ্যাক্টিভ ওয়ার্কফ্লো স্টেট সিগন্যাল রিডিম্পশন' : 'Generated Background Diagnostic Hearthbeat Signal',
            d: 'Heartbeat ping: All agent tasks verified alive. Active threads operating inside norm: Port 3000.',
            a: 'Core Diagnostics Daemon',
            l: 'Telemetry Status',
            v: 'ALIVE_0_ERR'
          },
          {
            m: lang === 'bn' ? 'শুকরিয়া অফসেট ইনভয়েস জেনারেটর মেটাডেটা সিঙ্ক' : 'Compiled Shukria Invoice Dynamic XML Schema Metadata',
            d: 'Formulated dynamic schema representation on virtual memory partitions of the AI OS-style frame.',
            a: 'Schema Meta compiler',
            l: 'Schema files count',
            v: '3 compiled'
          }
        ];
        const item = tActions[Math.floor(Math.random() * tActions.length)];
        msg = item.m;
        detailsText = `[TASK_EXEC_STREAM] Ingress tracking details.\nDetails:\n  Task Node: ${item.a}\n  Context: ${item.d}\n  Key metric: ${item.v}`;
        actorName = item.a;
        labelText = item.l;
        valText = item.v;
      }

      const entry: JournalEntry = {
        id: "jnl-" + Math.floor(Math.random() * 10000),
        timestamp: timestamps,
        category: chosenCat,
        level: chosenLvl,
        message: msg,
        details: detailsText,
        actor: actorName,
        impactMetrics: { label: labelText, value: valText }
      };

      setEntries(prev => [...prev.slice(-39), entry]);
      
      if (onAddSystemLog) {
        onAddSystemLog(`[JOURNAL_DAEMON] Autonomously triggered "${msg}" -> ${valText}`);
      }

    }, 8500);

    return () => clearInterval(interval);
  }, [isPlaying, isUpdatingSelf, onAddSystemLog, lang]);

  // Complete self-update workflow simulation
  const handleOnDemandSelfUpdate = () => {
    if (isUpdatingSelf) return;
    setIsUpdatingSelf(true);
    setSelectedEntryId(null);

    const stages = [
      { name: lang === 'bn' ? 'সিস্টেম অডিটিং এবং ফাইল ইনডেক্সিং স্ক্যান...' : 'Scanning local package dependencies & virtual directories...', key: 'scan' },
      { name: lang === 'bn' ? 'কর্পোরেট ১৫% ভ্যাট কনফিগারেশন রেগুলেশন অডিট...' : 'Verifying 15.00% Corporate VAT formula against standard shukria rules...', key: 'vat_verify' },
      { name: lang === 'bn' ? 'সিজিএস স্যান্ডবক্স মেমরি ডেক্লারেটিভ বুস্টার রানিং...' : 'Recalibrating CJS sandbox core heap boundaries...', key: 'memory_reallocate' },
      { name: lang === 'bn' ? 'নতুন ভার্চুয়াল ফাইল "diagnostics/self_update_certificate.json" জেনারেটিং...' : 'Generating virtual file "diagnostics/self_update_certificate.json"...', key: 'create_doc' },
      { name: lang === 'bn' ? 'সম্পূর্ণ ওএস অপ্টিমাইজেশন সম্পন্ন!' : 'Autonomous Self-Update Completed Successfully!', key: 'finish' }
    ];

    let current = 0;
    setUpdateStepName(stages[0].name);

    const logStage = (idx: number) => {
      const timestamps = new Date().toTimeString().split(' ')[0];
      let lvl: JournalEntry['level'] = 'INFO';
      let message = '';
      let details = '';
      let lStr = 'Step Status';
      let vStr = '';

      switch (stages[idx].key) {
        case 'scan':
          message = lang === 'bn' ? 'স্বয়ংক্রিয় স্ব-ভারসাম্য স্ক্যান সম্পন্ন' : 'Autonomous Balance Scan Completed';
          details = 'Files indexed: 14 virtual sector registers. Confirmed node integrity in Port 3000 sandbox environment.';
          vStr = '14 Files OK';
          break;
        case 'vat_verify':
          message = lang === 'bn' ? 'ভ্যাট সম্মতি অডিট ভেরিফিকেশন সফল' : 'Corporate 15% VAT Invoiced Ledger Verified Compliant';
          details = 'Enforced absolute matching bounds on "billing/vats_ledger_audit.json". Verified Shukria Corporate standards.';
          vStr = '15% COMPLIANT';
          lvl = 'SUCCESS';
          break;
        case 'memory_reallocate':
          message = lang === 'bn' ? 'মেমরি গার্বেজ কালেক্টর স্যান্ডবক্স ফ্লাশ সম্পন্ন' : 'Sandbox Garbage Collector Heap Repartitioned';
          details = 'Compacted active cognitive threads allocation table. Saved additional 24.5MB cache storage.';
          vStr = '24.5 MB Saved';
          break;
        case 'create_doc':
          message = lang === 'bn' ? 'সেলফ-আপডেট সার্টিফিকেট ফাইল স্যান্ডবক্স রাইট সিঙ্ক' : 'Wrote Self-Update Certificate to Virtual Partition';
          details = 'Created diagnostics/self_update_certificate.json containing digital signatures verifying self-management parameters.';
          vStr = 'File Created';
          lvl = 'SUCCESS';
          
          if (onModifyVirtualFile) {
            onModifyVirtualFile(
              'self_update_certificate.json', 
              JSON.stringify({
                certificate_id: "CERT-" + Math.floor(Math.random() * 89999 + 10000),
                system_checksum: "SHA256-" + Math.random().toString(36).substring(3, 11).toUpperCase(),
                applied_rules: [
                  "15_percent_vat_enforcement",
                  "egress_port_3000_safety",
                  "whisper_api_tuning_98_6"
                ],
                timestamp_utc: new Date().toISOString()
              }, null, 2)
            );
          }
          break;
        case 'finish':
          message = lang === 'bn' ? 'স্বয়ংক্রিয় সেলফ-আপডেট উইজার্ড সম্পন্ন' : 'Engine Autonomous Multi-Agent Core Repaired';
          details = 'Successfully processed 4 high level micro-repair vectors. System status has been updated to fully streamlined optimization standard.';
          vStr = 'HEALED';
          lvl = 'SUCCESS';
          break;
      }

      const stepEntry: JournalEntry = {
        id: "jnl-" + Math.floor(Math.random() * 10000),
        timestamp: timestamps,
        category: 'self_update',
        level: lvl,
        message,
        details: `[SELF_UPDATE_WORKFLOW_SEQUENCE]\n${details}\nTimestamp: ${timestamps}\nEngine Integrity: OPTIMIZED`,
        actor: 'Self-Heal Compiler Module',
        impactMetrics: { label: lStr, value: vStr }
      };

      setEntries(prev => [...prev.slice(-39), stepEntry]);
      if (onAddSystemLog) {
        onAddSystemLog(`[SELF_UPDATE] ${message} (${vStr})`);
      }
    };

    const runNext = () => {
      logStage(current);
      current++;
      if (current < stages.length) {
        setUpdateStepName(stages[current].name);
        setTimeout(runNext, 2000);
      } else {
        setIsUpdatingSelf(false);
        setUpdateStepName('');
      }
    };

    setTimeout(runNext, 1800);
  };

  const handleClearJournal = () => {
    setEntries([]);
    setSelectedEntryId(null);
    if (onAddSystemLog) {
      onAddSystemLog("[SYSTEM] Journal logs stack purged autonomously on user instruction command.");
    }
  };

  const simulateCriticalConflict = () => {
    const timestamps = new Date().toTimeString().split(' ')[0];
    const alertEntry: JournalEntry = {
      id: "jnl-" + Math.floor(Math.random() * 10000),
      timestamp: timestamps,
      category: 'autonomous_decision',
      level: 'CRITICAL',
      message: lang === 'bn' ? 'রাইট থ্রেড এলার্ম: ইপিইআরএম ডিরেক্টরি লকড' : 'Write EPERM Failure: Overlapped Write Stream Handle Lock',
      actor: 'FS Controller LPU-1',
      details: `[ALARM_TRIGGER] Critical file system blockage simulated.\nPath standard: assets/*.\nSimulated multiple concurrent nodes attempting read-write targeting same block sector.\nDispatching auto-healing diagnostic engine process to release handles now...`,
      impactMetrics: { label: "Alarm Code", value: "EPERM_LOCK_BLOCKED" }
    };

    setEntries(prev => [...prev, alertEntry]);
    if (onAddSystemLog) {
      onAddSystemLog("[CRITICAL ALARM] EPERM file write deadlock simulated. Check Autonomy Journal for healing sequence.");
    }

    // Trigger auto healing log 3 seconds later
    setTimeout(() => {
      const healTimes = new Date().toTimeString().split(' ')[0];
      const healedEntry: JournalEntry = {
        id: "jnl-" + Math.floor(Math.random() * 10000),
        timestamp: healTimes,
        category: 'autonomous_decision',
        level: 'SUCCESS',
        message: lang === 'bn' ? 'স্বয়ংক্রিয় রিকভারি: রাইট লক মুক্ত ও সমাধান সম্পন্ন' : 'Auto Recovered: Released Overlapped Block Descriptors',
        actor: 'Kernel Auto-Healer Module',
        details: `[RECONCILIATION SUCCESSFUL] Handled blocked pipeline sector.\nPurged lingering write lock pointers.\nSimulated files block state returned to verified operational health.`,
        impactMetrics: { label: "Heal Latency", value: "3.2ms" }
      };
      setEntries(prev => [...prev, healedEntry]);
      if (onAddSystemLog) {
        onAddSystemLog("[HEALED] Autonomously cleared concurrent EPERM write descriptor locks.");
      }
    }, 3000);
  };

  const handleExportJournal = () => {
    const textStr = entries.map(e => `[${e.timestamp}] [${e.level}] [${e.category.toUpperCase()}] ${e.message} (Actor: ${e.actor} | Metric: ${e.impactMetrics?.label}: ${e.impactMetrics?.value})\n--\n${e.details}\n===================================`).join('\n\n');
    const blob = new Blob([textStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shukria_cyber_journal_${new Date().toISOString().substring(0,10)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onAddSystemLog) {
      onAddSystemLog("[EXPORT] Downloaded plain-text system journal snapshot .log");
    }
  };

  // Filter and search entries
  const filteredEntries = entries.filter(e => {
    const matchesCategory = filter === 'all' || e.category === filter;
    const matchesSearch = e.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.level.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  return (
    <div id="system-journal-container" className="flex-1 bg-slate-955 border border-slate-900 rounded-lg flex flex-col lg:flex-row overflow-hidden text-xs h-full min-h-[480px]">
      
      {/* LEFT: Live Ticker Journal List Terminal Interface */}
      <div className="w-full lg:w-[60%] border-r border-slate-900 flex flex-col h-full bg-slate-950 font-mono">
        
        {/* Terminal Header & Status */}
        <div className="p-3 border-b border-slate-900 bg-slate-900/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shrink-0"></div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-300 tracking-widest flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>NEORA_AUTONOMOUS_JOURNAL.LOG</span>
              </span>
              <span className="text-[7.5px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                {isPlaying ? "Real-time AI compiler active" : "Log collection suspended"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[8.5px]">
            <button
              id="btn-play-pause-journal"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2 py-1 rounded border flex items-center gap-1 font-bold cursor-pointer transition-colors ${
                isPlaying ? 'bg-cyan-950/20 text-cyan-400 border-cyan-900/30 hover:bg-cyan-950/40' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title={isPlaying ? "Click to Pause live compilation feed" : "Click to Resume live compiler stream"}
            >
              {isPlaying ? (
                <>
                  <Square className="w-2.5 h-2.5 fill-cyan-400 stroke-none" />
                  <span>SUSPEND FEED</span>
                </>
              ) : (
                <>
                  <Play className="w-2.5 h-2.5 fill-slate-400 stroke-none" />
                  <span>PLAY STREAM</span>
                </>
              )}
            </button>
            <button
              id="btn-clear-journal"
              onClick={handleClearJournal}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-rose-400 rounded border border-slate-800 cursor-pointer flex items-center gap-1"
              title="Purge current collector stack registers"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>PURGE</span>
            </button>
          </div>
        </div>

        {/* Categories Bar & Search Input Row */}
        <div className="p-2 border-b border-slate-900 bg-slate-900/5 flex flex-col sm:flex-row items-stretch gap-2 shrink-0">
          <div className="flex flex-wrap gap-1 text-[8px] flex-1">
            <button 
              id="btn-filter-all"
              onClick={() => setFilter('all')} 
              className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${filter === 'all' ? 'bg-indigo-950 text-indigo-400 border border-indigo-850' : 'bg-slate-900/40 text-slate-500 border border-transparent hover:text-slate-400'}`}
            >
              ALL COMPILATION
            </button>
            <button 
              id="btn-filter-decisions"
              onClick={() => setFilter('autonomous_decision')} 
              className={`px-2 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1 ${filter === 'autonomous_decision' ? 'bg-cyan-950 text-cyan-455 border border-cyan-900/40' : 'bg-slate-900/40 text-slate-500 border border-transparent hover:text-slate-450'}`}
            >
              <Sparkles className="w-2 h-2 text-cyan-400" />
              AUTONOMOUS DECISIONS
            </button>
            <button 
              id="btn-filter-updates"
              onClick={() => setFilter('self_update')} 
              className={`px-2 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1 ${filter === 'self_update' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 'bg-slate-900/40 text-slate-500 border border-transparent hover:text-slate-400'}`}
            >
              <Activity className="w-2 h-2 text-emerald-400" />
              SELF-UPDATES
            </button>
            <button 
              id="btn-filter-sequences"
              onClick={() => setFilter('task_execution')} 
              className={`px-2 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1 ${filter === 'task_execution' ? 'bg-amber-955/20 text-amber-500 border border-amber-900/30' : 'bg-slate-900/40 text-slate-500 border border-transparent hover:text-slate-400'}`}
            >
              <Sliders className="w-2 h-2 text-amber-500" />
              TASK EXECUTIONS
            </button>
          </div>
          
          <div className="relative min-w-[130px] sm:max-w-[200px]">
            <input 
              id="journal-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stream logs..."
              className="w-full bg-slate-950 border border-slate-900 rounded p-1.5 pl-6 text-[8.5px] text-white focus:outline-none focus:border-cyan-500/30 placeholder-slate-700"
            />
            <Search className="w-3 h-3 absolute left-2 top-2.5 text-slate-700 pointer-events-none" />
          </div>
        </div>

        {/* Real-time Streaming Logs Ticker Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 h-full text-left font-mono">
          {isUpdatingSelf && (
            <div className="bg-cyan-950/15 border border-cyan-950/80 p-3 rounded-lg mb-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
                <div className="text-left font-sans">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">SYSTEM INSTRESS SELF-UPDATE SEQUENCE ACTIVE</p>
                  <p className="text-[8.5px] text-cyan-400 font-mono mt-0.5">{updateStepName}</p>
                </div>
              </div>
              <span className="text-[8px] bg-cyan-950 border border-cyan-850 text-cyan-400 py-0.5 px-1.5 rounded font-bold tracking-widest">IN PROGRESS</span>
            </div>
          )}

          {filteredEntries.length > 0 ? (
            filteredEntries.map((e) => {
              const isSelected = e.id === selectedEntryId;
              const isCrit = e.level === 'CRITICAL';
              const isSucc = e.level === 'SUCCESS';
              const isWarn = e.level === 'WARNING';
              
              let catLabel = 'DECISION';
              let catColor = 'text-cyan-400 border-cyan-950/80 bg-cyan-950/15';
              if (e.category === 'self_update') {
                catLabel = 'SELF_UPDATE';
                catColor = 'text-emerald-450 border-emerald-950/80 bg-emerald-950/15';
              } else if (e.category === 'task_execution') {
                catLabel = 'TASK_EXEC';
                catColor = 'text-amber-500 border-amber-955/20 bg-amber-955/5';
              }

              return (
                <div 
                  key={e.id}
                  onClick={() => setSelectedEntryId(isSelected ? null : e.id)}
                  className={`p-2.5 rounded-lg border hover:bg-slate-900/60 transition-all cursor-pointer select-none text-[9.5px]/relaxed ${
                    isSelected ? 'border-cyan-500 bg-slate-900/35 shadow-[0_0_12px_rgba(6,182,212,0.05)]' : 'border-slate-900 bg-slate-955/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 flex-wrap font-mono select-none">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8.5px] text-slate-550 font-bold">{e.timestamp}</span>
                      <span className={`text-[7.5px] border font-bold px-1 py-0.2 rounded ${catColor}`}>
                        {catLabel}
                      </span>
                      <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                        isCrit ? 'bg-rose-950 text-rose-455 border border-rose-900/30' :
                        isSucc ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' :
                        isWarn ? 'bg-amber-955/20 text-amber-500 border border-amber-900/20' :
                        'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {e.level}
                      </span>
                      <span className="text-slate-500 text-[8px] italic truncate max-w-[125px]">
                        via {e.actor}
                      </span>
                    </div>

                    {e.impactMetrics && (
                      <span className="text-[8px] bg-slate-900 text-cyan-400 border border-slate-800 px-1 py-0.2 rounded font-semibold tracking-wide">
                        {e.impactMetrics.label.toUpperCase()}: <strong>{e.impactMetrics.value}</strong>
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex items-start justify-between gap-2">
                    <p className={`text-left leading-normal font-sans text-slate-200 text-[10px] font-medium flex-1 ${isCrit ? 'text-rose-400 font-bold' : ''}`}>
                      {e.message}
                    </p>
                    <div className="shrink-0 text-slate-600 mt-0.5">
                      {isSelected ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Collapsed inspection details pane */}
                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-slate-900/70 space-y-2 select-text cursor-default" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between bg-slate-900/10 p-1.5 border border-slate-900 font-mono text-[8px] text-slate-400 rounded">
                        <span>DETAILED STRUCTURE DIAGNOSIS OBJECT:</span>
                        <span>ACTOR: {e.actor}</span>
                      </div>
                      <pre className="p-2.5 bg-slate-975 border border-slate-925 rounded text-[8.5px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto block text-left">
                        {e.details}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-600 italic select-none">
              <Terminal className="w-8 h-8 text-slate-800 mb-1.5" />
              <p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">NO EVENT SIGNALS DETECTED</p>
              <p className="text-[8.5px] max-w-xs mt-0.5">Try altering the filter query parameters or trigger custom macros inside the side panel controllers.</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* RIGHT: Action controllers for simulated operating parameters */}
      <div className="flex-1 p-4 bg-slate-950 lg:max-w-[40%] flex flex-col justify-between space-y-4">
        
        <div className="space-y-3.5 h-full">
          <div>
            <span className="font-mono text-[9px] tracking-widest font-black text-cyan-400 uppercase block">K-CORE HEURISTIC PANEL</span>
            <h3 className="text-xs font-bold text-white font-sans mt-0.5 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'অটোনমাস এজেন্ট অ্যাক্টিভিটি' : 'PROACTIVE SYSTEM CONTROL'}</span>
            </h3>
            <p className="text-[10px] text-slate-480 leading-normal mt-1 text-left font-sans font-medium">
              {lang === 'bn' ? 'লেজার হিসাব যাচাই করা, বাফার ক্লিয়ার করা এবং কলোকেশন এড়িয়ে অটো ডিরেক্টরি ব্যাকআপ সিঙ্ক করার জন্য ওএস এজেন্ট টাস্কগুলো কন্ট্রোল করুন।' 
                             : 'Directly initiate system audits, flush transient storage write buffers, and trigger clean recovery scripts on this simulated sandboxed partition.'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-900/25 border border-slate-905 rounded-lg space-y-2.5 text-left">
            <span className="text-[8.5px] font-mono tracking-wider font-bold text-slate-500 uppercase block">Manual Diagnostics & Self-Updates:</span>
            
            <button
              id="btn-self-update-journal"
              onClick={handleOnDemandSelfUpdate}
              disabled={isUpdatingSelf}
              className={`w-full py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-cyan-400 hover:text-white hover:border-cyan-500/20 font-bold transition-all rounded text-[9.5px] font-mono cursor-pointer tracking-wider flex items-center justify-center gap-1.5 shadow-sm uppercase ${isUpdatingSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Activity className={`w-3.5 h-3.5 ${isUpdatingSelf ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isUpdatingSelf ? 'RECONCILING MODULES...' : 'TRIGGER SELF-RECONCILE'}</span>
            </button>

            <button
              id="btn-simulate-conflict"
              onClick={simulateCriticalConflict}
              disabled={isUpdatingSelf}
              className="w-full py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-amber-500 hover:text-rose-400 hover:border-amber-500/20 font-bold transition-all rounded text-[9.5px] font-mono cursor-pointer tracking-wider flex items-center justify-center gap-1.5 shadow-sm uppercase"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>SIMULATE EPERM LOCK</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-900/25 border border-slate-905 rounded-lg space-y-2.5 text-left">
            <span className="text-[8.5px] font-mono tracking-wider font-bold text-slate-500 uppercase block select-none">COGNITIVE METRIC INTEGRITY:</span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-slate-400">Autonomy Control Index:</span>
                <span className="text-cyan-400 font-bold">100% Core Operating</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded border border-slate-900 overflow-hidden relative">
                <div className="bg-cyan-500 h-full absolute left-0 top-0 transition-all" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1.5 select-none text-left">
              <div className="bg-slate-950 border border-slate-900 p-1.5 rounded flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <div className="text-[7.5px] font-mono text-slate-450">
                  <p className="font-bold text-slate-300">FS SECTORS</p>
                  <p>14 MOUNTED</p>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-1.5 rounded flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <div className="text-[7.5px] font-mono text-slate-450">
                  <p className="font-bold text-slate-300">POLICIES</p>
                  <p>SELF-HEAL: ON</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/10 border border-slate-900 border-dashed rounded-lg text-left select-none">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[8.5px] leading-normal text-slate-500">
                The AI OS-Style kernel is configured behind standard CJS micro-sandboxing rules, targeting continuous port 3000 ingress validations. Audits persist virtual records cleanly in simulated memory partitions.
              </p>
            </div>
          </div>

        </div>

        <button
          id="btn-export-journal"
          onClick={handleExportJournal}
          className="w-full py-2 bg-gradient-to-r from-blue-950/40 to-cyan-950/40 border border-cyan-900/30 font-bold text-cyan-400 hover:text-white hover:border-cyan-500 hover:from-blue-900/30 hover:to-cyan-900/30 transition-all rounded text-[9.5px] font-mono cursor-pointer tracking-wider flex items-center justify-center gap-1.5 shrink-0 uppercase shadow-lg"
          title="Download the current log sequence as a text file for developer review."
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT RECOVERY JOURNAL</span>
        </button>

      </div>

    </div>
  );
}
