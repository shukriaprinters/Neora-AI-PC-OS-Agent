import React, { useState, useEffect, useRef } from 'react';
import { Plan, PlanStep } from '../types';
import { TRANSLATIONS } from '../translations';
import { SystemJournal } from './SystemJournal';
import { 
  Play, 
  Sliders, 
  PlayCircle, 
  Loader2, 
  RefreshCw, 
  Terminal, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Clock, 
  HelpCircle, 
  ArrowRight,
  Database,
  Search,
  HardDrive,
  FolderOpen,
  Trash2,
  FileCode,
  Check,
  Plus,
  X,
  Server,
  Sparkles,
  ShieldCheck,
  Eye,
  Power,
  Lock
} from 'lucide-react';

interface PlannerViewProps {
  lang: 'en' | 'bn';
  autonomyLevel: number;
  setAutonomyLevel: (lvl: number) => void;
}

interface SubAgent {
  id: string;
  name: string;
  role: string;
  engine: string;
  status: 'idle' | 'active' | 'success' | 'warning';
  thought: string;
  load: number;
}

interface OSProcess {
  pid: number;
  name: string;
  port: string;
  memory: string;
  cpu: number;
  status: 'Running' | 'Sleeping' | 'Dead' | 'Healing';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface VirtualFile {
  name: string;
  path: string;
  content: string;
  size: string;
  updated: string;
  type: 'kernel' | 'asset' | 'audit' | 'logs' | 'memory';
}

export function PlannerView({ lang, autonomyLevel, setAutonomyLevel }: PlannerViewProps) {
  const t = TRANSLATIONS[lang];
  
  // Primary States
  const [goal, setGoal] = useState(() => {
    return lang === 'bn' 
      ? 'শুকরিয়া প্রিন্টার্সের ব্যানার টেমপ্লেট মেক করুন এবং গিট স্টেজ কমিট করুন' 
      : 'Create poster templates for Shukria Printers, write files, and commit changes';
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isFormulating, setIsFormulating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selfCorrectionState, setSelfCorrectionState] = useState<'none' | 'pending' | 'resolving' | 'adjusted'>('none');
  
  // AI OS State Enhancements
  const [isAutoCycleActive, setIsAutoCycleActive] = useState(true);
  const [osClock, setOsClock] = useState<string>('');
  const [whisperConfidence, setWhisperConfidence] = useState<number>(98.6);
  
  // Interactive Panel Settings
  const [activeSubTab, setActiveSubTab] = useState<'threads' | 'files' | 'processes' | 'diagnostics' | 'proactive' | 'framework'>('threads');
  const [searchFileQuery, setSearchFileQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [selectedArchPillar, setSelectedArchPillar] = useState<'perception' | 'execution' | 'resources' | 'safety'>('perception');
  
  // Interactive Filesystem Writable States
  const [editedFileContent, setEditedFileContent] = useState('');
  const [isEditingFile, setIsEditingFile] = useState(false);

  // Kernel Shell states
  const [inputMode, setInputMode] = useState<'goal' | 'shell'>('goal');
  const [shellCommand, setShellCommand] = useState('');

  // Heuristic Self-Management Policies
  const [policies, setPolicies] = useState({
    autoHeal: true,
    ledgerAudit: true,
    groqFailover: true,
    preventWriteLockout: true,
  });

  // Dynamic Cognitive registers state
  const [cognitiveWorkingRegisters, setCognitiveWorkingRegisters] = useState<{key: string, val: string}[]>([
    { key: 'USER_ID', val: 'shukriaprinters@gmail.com' },
    { key: 'ACTIVE_VAT', val: '15.00%' },
    { key: 'PORT_STREAM', val: '3000' },
    { key: 'STT_ENGINE', val: 'Whisper-1 (Server API Proxy)' },
    { key: 'COMPILER_MODE', val: 'CJS Bundle Output' },
    { key: 'KERNEL_SANDBOX', val: 'Isolated container node' },
  ]);
  const [newRegKey, setNewRegKey] = useState('');
  const [newRegVal, setNewRegVal] = useState('');
  const [showAddRegister, setShowAddRegister] = useState(false);

  // Sub-agents state panel
  const [subAgents, setSubAgents] = useState<SubAgent[]>([
    { id: 'sa-core', name: 'Neora Core Agent', role: 'Whisper STT Parser & NLP Orchestrator', engine: 'Gemini 2.5', status: 'idle', thought: 'Listening for live voice packets...', load: 2 },
    { id: 'sa-layout', name: 'Layout Spec Engineer', role: 'Bento Grid & Glossy Offset Blueprint Builder', engine: 'Gemini Flash', status: 'idle', thought: 'Awaiting template dispatch instructions', load: 0 },
    { id: 'sa-billing', name: 'Fintech VAT Auditor', role: 'Earning reports, Corporate 15% VAT ledger', engine: 'Local Math Module', status: 'idle', thought: 'Standby to audit invoices & tax sheets', load: 0 },
    { id: 'sa-guard', name: 'Security Process Lock', role: 'Directory lock bypasser & Git staging validator', engine: 'Safe Sandbox', status: 'idle', thought: 'Interception engines armed. Active on root folder.', load: 1 }
  ]);

  // System OS-processes state table
  const [processes, setProcesses] = useState<OSProcess[]>([
    { pid: 1042, name: 'neora-stt-daemon', port: '3000', memory: '42.8 MB', cpu: 1, status: 'Running', priority: 'HIGH' },
    { pid: 1045, name: 'cognitive-mapper-LPU', port: 'None', memory: '114.5 MB', cpu: 3, status: 'Running', priority: 'CRITICAL' },
    { pid: 1048, name: 'autonomous-reconciler', port: 'None', memory: '24.1 MB', cpu: 2, status: 'Running', priority: 'MEDIUM' },
    { pid: 1052, name: 'vat-fiscal-auditor', port: 'None', memory: '18.3 MB', cpu: 0, status: 'Sleeping', priority: 'MEDIUM' },
    { pid: 1060, name: 'self-healing-watchdog', port: 'None', memory: '56.9 MB', cpu: 1, status: 'Running', priority: 'CRITICAL' },
    { pid: 1072, name: 'git-staging-interceptor', port: 'None', memory: '12.0 MB', cpu: 0, status: 'Sleeping', priority: 'LOW' }
  ]);

  // Simulated virtual filesystem directory of Neora OS
  const [virtualFiles, setVirtualFiles] = useState<VirtualFile[]>([
    { name: 'kernel.sys', path: 'system/kernel.sys', content: '[kernel_core]\nboot_hook=node_init\nallow_unsafe_etc_writes=false\nstt_mimetype_bypass=restricted\ncompiler_target=server.cjs\nsandbox_port=3000', size: '256 B', updated: '2026-06-06 20:15', type: 'kernel' },
    { name: 'agent_registry.db', path: 'system/agent_registry.db', content: 'CORES=4\nactive_node_count=4\nsa-core=ACTIVE\nsa-layout=ACTIVE\nsa-billing=STANDBY\nsa-guard=STANDBY', size: '1.2 KB', updated: '2026-06-06 21:02', type: 'kernel' },
    { name: 'shukria_offset.html', path: 'assets/shukria_offset.html', content: '<!-- PRINT-READY TEMPLATE FOR SHUKRIA PRINTERS -->\n<div class="poster-bento">\n  <h2>High-Gloss Brochure Template</h2>\n  <p>Dual-basket design stage integration.</p>\n  <p>Vat rate: 15%</p>\n</div>', size: '512 B', updated: '2026-06-06 18:30', type: 'asset' },
    { name: 'vats_ledger_audit.json', path: 'billing/vats_ledger_audit.json', content: '{\n  "client": "shukriaprinters@gmail.com",\n  "corporate_tax_rate": "15.00%",\n  "audit_status": "APPROVED",\n  "verified_by": "Fintech VAT Auditor LPU"\n}', size: '380 B', updated: '2026-06-06T22:11', type: 'audit' },
    { name: 'self_repair_history.log', path: 'diagnostics/self_repair_history.log', content: '[2026-06-06 14:22] [WARNING] Folder locked. Attempting EPERM auto-patch...\n[2026-06-06 14:22] [SUCCESS] Released file descriptors. Rewrote asset safely.\n[2026-06-06 19:11] [INFO] Sandboxed core verification loops cleared with 0 exceptions.', size: '420 B', updated: '2026-06-06 19:11', type: 'logs' },
    { name: 'longterm_knowledge.bin', path: 'memories/longterm_knowledge.bin', content: 'KNOWLEDGE_GRID_VECTORS\n- SHUKRIA_PRINTERS_EMAIL=shukriaprinters@gmail.com\n- FILTER_MESH_SPECS=200_stages_500_mesh_30um\n- EN_BN_NLP_STRINGS_CACHED=true', size: '3.4 KB', updated: '2026-06-06 21:40', type: 'memory' }
  ]);

  // Diagnostics Incident Logs entries
  const [diagnosticsIncidents, setDiagnosticsIncidents] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [INFO] Neora OS Kernel initialized safely.`,
    `[${new Date().toLocaleTimeString()}] [SEC_LOCK] Sandbox memory structures bound on root environment.`,
    `[${new Date().toLocaleTimeString()}] [COMPILER] Standby mode active for 'tsx server.ts' process.`,
    `[${new Date().toLocaleTimeString()}] [AUDIT] Tax parameters auto-scanned. Whitelist matched: '15% Corporate standard'.`
  ]);

  // Proactive Autonomous Decisions Tracker State
  interface ProactiveDecision {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    category: 'Kernel Security' | 'Performance Optimization' | 'Fiscal Alignment' | 'Process Safety';
    status: 'AUTO-RESOLVED' | 'EXECUTED' | 'STANDBY';
    impact: string;
  }

  const [proactiveDecisions, setProactiveDecisions] = useState<ProactiveDecision[]>([
    {
      id: 'dec-1',
      timestamp: '22:15:02',
      title: lang === 'bn' ? 'স্বয়ংক্রিয়ভাবে ইপিআরএম ফাইল লক অবমুক্ত' : 'Autonomously Purged EPERM Write Locks',
      description: 'Forcefully closed overlapping file descriptor stream handles targeting assets/ partition before compile time.',
      category: 'Kernel Security',
      status: 'AUTO-RESOLVED',
      impact: 'Prevented critical thread timeout on compile-system.'
    },
    {
      id: 'dec-2',
      timestamp: '22:18:11',
      title: lang === 'bn' ? 'কগনিটিভ ম্যাপার লোকাল র‍্যাম অপ্টিমাইজড' : 'Compressed Static LPU Core Memory Heap',
      description: 'Detected a 114.5 MB peak load in cognitive-mapper-LPU. Applied synchronous Garbage Collection flush.',
      category: 'Performance Optimization',
      status: 'EXECUTED',
      impact: 'Reduced container heap retention by 28% safely.'
    },
    {
      id: 'dec-3',
      timestamp: '22:20:45',
      title: lang === 'bn' ? '১৫% কর্পোরেট ভ্যাট মানদণ্ড অডিট' : 'Enforced Shukria 15.00% VAT Fiscal Standard',
      description: 'Auto-updated billing database and vats_ledger_audit.json configuration based on standard company rules.',
      category: 'Fiscal Alignment',
      status: 'EXECUTED',
      impact: '100% Tax code validity confirmed for invoice releases.'
    }
  ]);

  // Sync edits when file changes
  useEffect(() => {
    if (selectedFile) {
      setEditedFileContent(selectedFile.content);
      setIsEditingFile(false);
    }
  }, [selectedFile]);

  // Soundless visual "Crash & Self-Healing" simulation state
  const [selfHealingState, setSelfHealingState] = useState<'idle' | 'crashing' | 'diagnosing' | 'auto_patching' | 'clean_reboot' | 'healed'>('idle');

  const logContainerRef = useRef<HTMLDivElement>(null);
  const cycleIntervalRef = useRef<any>(null);

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Auto-scroll log console
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // System OS clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setOsClock(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Autonomous Background Daemon Heartbeat Thread
  useEffect(() => {
    if (isAutoCycleActive) {
      addLog(`⚡ Neora Autonomous OS Daemon: Continuous background cycle [ONLINE]`);
      addLog(`✦ Setting watchdogs: Auditing workspace safety bounds...`);
      
      cycleIntervalRef.current = setInterval(() => {
        // Randomly simulate an agent task activity
        const randomAgentIdx = Math.floor(Math.random() * subAgents.length);
        const randomCpuLoad = Math.floor(Math.random() * 40) + 10;
        
        setSubAgents(prev => prev.map((agent, i) => {
          if (i === randomAgentIdx) {
            const randomThoughts = lang === 'bn' ? [
              "লোকাল ডিস্ক মেমোরি ইডেক্স রি-রিড করছে...",
              "শুকরিয়া প্রিন্টার্স পেন্ডিং ব্যানার প্রুফ চেক হচ্ছে...",
              "ট্যাক্স ইনভয়েস ১৫% ভ্যাট রুল ম্যাচ করছে...",
              "Whisper STT সাইলেন্স ডিটেেক্টর টিউন করছে...",
              "মেমোরি সেফগার্ড ক্লিনিং রুটিন চালাচ্ছে..."
            ] : [
              "Auditing pending jobs for Shukria Printers...",
              "Optimizing memory heap allocation...",
              "Validating offset layout compilation states...",
              "Polling Whisper translation cache...",
              "Analyzing virtual disk defragmentation metrics..."
            ];
            const tText = randomThoughts[Math.floor(Math.random() * randomThoughts.length)];
            return { ...agent, load: randomCpuLoad, status: 'active', thought: tText };
          }
          return { ...agent, load: Math.max(1, agent.load - 6), status: agent.status === 'active' ? 'idle' : agent.status };
        }));

        // Random Process simulation adjustments
        setProcesses(prev => prev.map(p => {
          if (p.name === 'neora-stt-daemon' || p.name === 'autonomous-reconciler') {
            return { ...p, cpu: Math.floor(Math.random() * 5) + 1 };
          }
          return p;
        }));

        const autonomousLogs = lang === 'bn' ? [
          "স্বয়ংক্রিয় প্রসেস: ফাইল-সিস্টেম ইন্টেগ্রিটি নিশ্চিত করা হয়েছে।",
          "মেমোরি লেজার: শুকরিয়া প্রিন্টার্স লেজার ডাটাবেজ ব্যাকআপ সম্পন্ন।",
          "ভয়েস ডিটেক্টর প্রোটোকল: Whisper এআই প্রক্সি লিসেনিং অন পোর্ট ৩০০০।",
          "security: ডিরেক্টরি লক এভয়েডেন্স চেক পাস করেছে।",
          "মেমোরি রিকভারি: ৫০০ কেবি সাময়িক গার্বেজ ডেটা রিলিজ করা হয়েছে।"
        ] : [
          "Autonomy monitor: Absolute workspace sanity confirmed.",
          "Disk Ledger: Backed up printers master database configuration.",
          "Voice daemon: Listening for Whisper STT triggers on local media endpoints.",
          "Security policies: Safe-mode hooks confirmed bypass-free.",
          "RAM Manager: Garbage collection cycle flushed 540 KB inactive buffers."
        ];
        
        const selectedLog = autonomousLogs[Math.floor(Math.random() * autonomousLogs.length)];
        addLog(`[AUTO-LOOP] ${selectedLog}`);
        
        // Randomly execute a proactive self-management decision
        if (Math.random() < 0.35) {
          const decisions = [
            {
              title: lang === 'bn' ? 'অটোনমাস র‍্যাম ফ্লাশ সম্পন্ন' : 'Autonomously Flushed Dev Cache',
              desc: lang === 'bn' ? 'অনুপযুক্ত ৩০০০ পোর্ট মেমরি বাফার অবমুক্ত করা হয়েছে।' : 'Released inactive layout thread buffers on ingress port 3000.',
              cat: 'Performance Optimization' as const,
              impact: lang === 'bn' ? '১৯% প্রসেস গতি বৃদ্ধি পেয়েছে।' : 'Reclaimed 14.5MB cache storage.'
            },
            {
              title: lang === 'bn' ? 'ভ্যাট ইনভয়েস স্ট্যান্ডার্ডাইজেশন' : 'Standardized 15.00% Company VAT',
              desc: lang === 'bn' ? 'শুকরিয়া প্রিন্টার্সের লেজার অডিটে ১৫% কর্পোরেট ভ্যাট হার সফলভাবে এনফোর্সড।' : 'Enforced absolute 15.00% corporate tax codes on virtual files partition.',
              cat: 'Fiscal Alignment' as const,
              impact: lang === 'bn' ? '১০০% ট্যাক্স সম্মতি নিশ্চিত করা হয়েছে।' : 'Invoiced layout math checks verified.'
            },
            {
              title: lang === 'bn' ? 'গিট ডিরেক্টরি লক রিমুভাল' : 'Released Directory Lock Handle',
              desc: lang === 'bn' ? 'assets/ ডিরেক্টরির ফাইল লকিং থ্রেড অবমুক্ত করা হয়েছে।' : 'Released blocking kernel descriptors on assets/ assets tree.',
              cat: 'Kernel Security' as const,
              impact: lang === 'bn' ? 'ইপিইআরএম ব্যর্থতা রোধ করা হয়েছে।' : 'Secured 0-collision storage writes.'
            }
          ];
          const chosen = decisions[Math.floor(Math.random() * decisions.length)];
          const newDec = {
            id: 'dec-' + Math.floor(Math.random() * 10000),
            timestamp: new Date().toTimeString().split(' ')[0],
            title: chosen.title,
            description: chosen.desc,
            category: chosen.cat,
            status: 'AUTO-RESOLVED' as const,
            impact: chosen.impact
          };
          setProactiveDecisions(prev => [newDec, ...prev.slice(0, 9)]);
          addLog(`[DECISION] Proactive action taken: "${chosen.title}" -> ${chosen.impact}`);
        }

        setDiagnosticsIncidents(prev => [
          `[${new Date().toLocaleTimeString()}] [AUTO_MONITOR] ${selectedLog}`,
          ...prev.slice(0, 39)
        ]);

        setWhisperConfidence(prev => Math.min(100, Math.max(93, prev + (Math.random() * 1.6 - 0.8))));
      }, 6000);
    } else {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        addLog(`🛑 Neora Autonomous OS Daemon: Continuous background cycle [SUSPENDED]`);
      }
    }

    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    };
  }, [isAutoCycleActive, lang]);

  const explainAutonomy = (lvl: number) => {
    switch (lvl) {
      case 1: return t.autonomyLvl1;
      case 2: return t.autonomyLvl2;
      case 3: return t.autonomyLvl3;
      case 4: return t.autonomyLvl4;
      case 5: return t.autonomyLvl5;
      default: return '';
    }
  };

  // Add register helper
  const handleAddCustomRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegKey.trim() || !newRegVal.trim()) return;
    const formattedKey = newRegKey.trim().toUpperCase().replace(/\s+/g, '_');
    setCognitiveWorkingRegisters(prev => [
      ...prev,
      { key: formattedKey, val: newRegVal.trim() }
    ]);
    addLog(`Cognitive Register set: ${formattedKey} -> "${newRegVal.trim()}"`);
    setNewRegKey('');
    setNewRegVal('');
    setShowAddRegister(false);
  };

  // Optimize a specific process
  const optimizeProcess = (pid: number) => {
    setProcesses(prev => prev.map(p => {
      if (p.pid === pid) {
        addLog(`Process manual recalibration triggered on PID [${pid}] (${p.name}).`);
        return { ...p, memory: (parseFloat(p.memory) * 0.82).toFixed(1) + ' MB', cpu: 0, status: 'Running' };
      }
      return p;
    }));
    addLog(`Success: Memory heap compressed for PID ${pid}.`);
  };

  // Halt/Power-toggle a process
  const toggleProcessState = (pid: number) => {
    setProcesses(prev => prev.map(p => {
      if (p.pid === pid) {
        const nextStatus = p.status === 'Running' ? 'Dead' : p.status === 'Dead' ? 'Running' : p.status;
        addLog(`Process state for PID ${pid} (${p.name}) updated to: ${nextStatus}.`);
        return { ...p, status: nextStatus, cpu: 0 };
      }
      return p;
    }));
  };

  // Modify or Write a virtual file from System Journal actions
  const handleModifyVirtualFile = (name: string, content: string) => {
    setVirtualFiles(prev => {
      const existing = prev.find(f => f.name === name);
      if (existing) {
        return prev.map(f => f.name === name ? {
          ...f,
          content,
          size: `${new Blob([content]).size} B`,
          updated: new Date().toISOString().replace('T', ' ').substring(0, 16)
        } : f);
      } else {
        return [...prev, {
          name,
          path: `diagnostics/${name}`,
          content,
          size: `${new Blob([content]).size} B`,
          updated: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'logs'
        }];
      }
    });
  };

  // Delete a virtual file
  const deleteVirtualFile = (pathName: string) => {
    setVirtualFiles(prev => prev.filter(f => f.path !== pathName));
    if (selectedFile?.path === pathName) {
      setSelectedFile(null);
    }
    addLog(`Virtual filesystem unlink complete: "${pathName}" deleted.`);
  };

  // Add custom simulation file
  const addVirtualFile = () => {
    const fileName = `manual_patch_${Math.floor(Math.random() * 1000)}.sys`;
    const newF: VirtualFile = {
      name: fileName,
      path: `diagnostics/${fileName}`,
      content: `# USER INITIALIZED DIAGNOSTICS LOG\nregistered_at=${new Date().toISOString()}\nautonomy_level=${autonomyLevel}\nstatus=SUCCESS`,
      size: '110 B',
      updated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'logs'
    };
    setVirtualFiles(prev => [...prev, newF]);
    addLog(`Virtual File assembled in partition: "diagnostics/${fileName}" created.`);
  };

  // Save changes back to virtual files state
  const saveVirtualFile = () => {
    if (!selectedFile) return;
    setVirtualFiles(prev => prev.map(f => {
      if (f.path === selectedFile.path) {
        return {
          ...f,
          content: editedFileContent,
          size: `${new Blob([editedFileContent]).size} B`,
          updated: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return f;
    }));
    setSelectedFile(prev => prev ? {
      ...prev,
      content: editedFileContent,
      size: `${new Blob([editedFileContent]).size} B`,
      updated: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } : null);
    setIsEditingFile(false);
    addLog(`System IO event: Overwrote script "${selectedFile.path}" successfully.`);
  };

  // Execute terminal shell command live
  const handleExecuteShellCommand = (cmdText?: string) => {
    const rawCmd = cmdText || shellCommand;
    const cleanCmd = rawCmd.trim();
    if (!cleanCmd) return;

    addLog(`shell_exec:~$ ${cleanCmd}`);
    const firstWord = cleanCmd.split(' ')[0]?.toLowerCase();

    switch (firstWord) {
      case 'help':
      case '?':
        addLog(`System core operations commands list:`);
        addLog(`  help                   - Display help list of diagnostics & shell operations`);
        addLog(`  systat                 - Read real-time engine telemetry and temperature status`);
        addLog(`  optimize / defrag      - Recalibrate and optimize memory threads allocation`);
        addLog(`  clear-lock             - Clear directory write deadlock locks (EPERM Simulation)`);
        addLog(`  file-list              - Scan virtual filesystem blocks list`);
        addLog(`  audvat 15              - Conduct digital fiscal audit on standard VAT codes`);
        addLog(`  make-template          - Auto-compile standard poster layout specification`);
        break;
      case 'systat':
        addLog(`Executing system metric telemetry read...`);
        addLog(`  SYSTEM_CLOCK: ${osClock || 'SYNCING'}`);
        addLog(`  CPU_CORES:    ● ● ● ● [4 LPU cores online]`);
        addLog(`  STT_CONF:     ${whisperConfidence.toFixed(2)}% (Whisper API feedback)`);
        addLog(`  KERNEL_MODE:  Protected CJS Sandbox Root`);
        addLog(`  PORT_METRIC:  0.0.0.0:3000 (Ingress Active)`);
        break;
      case 'optimize':
      case 'defrag':
        addLog(`Running garbage collector defragmentation thread...`);
        setProcesses(prev => prev.map(p => {
          const compressedMem = (parseFloat(p.memory) * 0.76).toFixed(1) + ' MB';
          return { ...p, memory: compressedMem, cpu: 1 };
        }));
        setSubAgents(prev => prev.map(a => ({ ...a, load: Math.max(1, Math.floor(a.load * 0.45)) })));
        addLog(`Defrag Success: Purged inactive memory blocks. Compressed active processes allocation heap by 24%.`);
        break;
      case 'clear-lock':
        handleTriggerSelfHealingSimulation();
        break;
      case 'file-list':
        addLog(`Virtual sector indexing scan result:`);
        virtualFiles.forEach(f => {
          addLog(`  -> path: "${f.path}"   size: ${f.size}   partition: ${f.type}`);
        });
        break;
      case 'audvat':
        addLog(`Enforcing automated financial audits...`);
        addLog(`Double-checking invoices for standard corporate VAT matching.`);
        setVirtualFiles(prev => prev.map(f => {
          if (f.name === 'vats_ledger_audit.json') {
            return {
              ...f,
              content: JSON.stringify({
                client: "shukriaprinters@gmail.com",
                corporate_tax_rate: "15.00%",
                audit_status: "VERIFIED_COMPLIANT_BY_SHELL",
                verified_by: "Fintech VAT Auditor LPU Node",
                timestamp: new Date().toISOString()
              }, null, 2),
              updated: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
          }
          return f;
        }));
        addLog(`Success: Dispatched verified compliance token to "billing/vats_ledger_audit.json"`);
        break;
      case 'make-template':
        addLog(`Dispatching spec compiler node...`);
        setVirtualFiles(prev => prev.map(f => {
          if (f.name === 'shukria_offset.html') {
            return {
              ...f,
              content: `<!-- DISPATCHED BY DIRECT SHELL COMMAND -->\n<div class="brochure-container p-5 border border-cyan-400 bg-slate-905">\n  <h1>Shukria Offset Printing Spec</h1>\n  <p>Standard VAT applied: 15%</p>\n</div>`,
              updated: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
          }
          return f;
        }));
        addLog(`Success: Overwrote "assets/shukria_offset.html" with direct spec representation.`);
        break;
      default:
        addLog(`Unknown kernel daemon command. Type "help" or "?" to view supported operations.`);
    }
    setShellCommand('');
  };

  // Trigger soundless self-healing animation and logic
  const handleTriggerSelfHealingSimulation = async () => {
    if (selfHealingState !== 'idle') return;
    
    setSelfHealingState('crashing');
    addLog(`⚠️ CRITICAL: Intentionally triggering EPERM lock out & file descriptor leakage simulation...`);
    
    // Set all processes to Dead/Deadlocked
    setProcesses(prev => prev.map(p => {
      if (p.name === 'self-healing-watchdog') return { ...p, status: 'Healing', cpu: 99 };
      return { ...p, status: 'Dead', cpu: 0 };
    }));

    // Alert subagents
    setSubAgents(prev => prev.map(a => ({ ...a, status: 'warning', thought: 'EPERM LOCK DETECTED! Thread blocked.', load: 99 })));
    
    setDiagnosticsIncidents(prev => [
      `[${new Date().toLocaleTimeString()}] [CRITICAL] FS lock detected. System processes halted!`,
      `[${new Date().toLocaleTimeString()}] [CRITICAL] 4 Agents deadlocked on file write collision.`,
      ...prev
    ]);

    await new Promise(r => setTimeout(r, 2000));
    setSelfHealingState('diagnosing');
    addLog(`[DIAGNOSTICS] Watchdog active. Initiating trace audit on locking file descriptors...`);
    
    setDiagnosticsIncidents(prev => [
      `[${new Date().toLocaleTimeString()}] [HEALING] Initiated live process handle traceback.`,
      ...prev
    ]);

    await new Promise(r => setTimeout(r, 2000));
    setSelfHealingState('auto_patching');
    addLog(`[HEALING] Writing bypass patch for locked assets/ directory. purguing old locked system handles.`);
    
    // Simulate updating repair history file
    setVirtualFiles(prev => prev.map(f => {
      if (f.name === 'self_repair_history.log') {
        return {
          ...f,
          content: `${f.content}\n[2526-06-06 22:20] [CRITICAL_RESOLVED] Autonomously bypassed EPERM lockout. Killed deadlock child handles. Reallocated file descriptors.`,
          size: '640 B'
        };
      }
      return f;
    }));

    setDiagnosticsIncidents(prev => [
      `[${new Date().toLocaleTimeString()}] [HEALING] Released thread handles for ports.`,
      `[${new Date().toLocaleTimeString()}] [HEALING] Injected dynamically generated EPERM bypass wrapper.`,
      ...prev
    ]);

    await new Promise(r => setTimeout(r, 2000));
    setSelfHealingState('clean_reboot');
    addLog(`[HEALING] Success! Hot-rebooting dead processes. Restoring core registers.`);
    
    // Recover processes
    setProcesses(prev => prev.map(p => {
      return { ...p, status: 'Running', cpu: p.name === 'cognitive-mapper-LPU' ? 4 : 1 };
    }));

    // Recover subagents
    setSubAgents(prev => prev.map(a => ({ ...a, status: 'success', thought: 'Automatic patching completed successfully. Sandboxed handles safe.', load: 5 })));

    setDiagnosticsIncidents(prev => [
      `[${new Date().toLocaleTimeString()}] [INFO] System health at 100%. Heartbeats restored.`,
      ...prev
    ]);

    await new Promise(r => setTimeout(r, 1500));
    setSelfHealingState('healed');
    addLog(`✨ [AUTONOMOUS ENGINE STATUS]: Operating system fully self-healed and back to optimum parameters!`);
    
    await new Promise(r => setTimeout(r, 2000));
    setSelfHealingState('idle');
  };

  // Formulate a multi-agent plan
  const handleFormulatePlan = () => {
    setIsFormulating(true);
    setConsoleLogs([]);
    addLog(`Initiating Neora Deep-Parser Formulation Pipeline...`);
    addLog(`Scanning registers for Shukria Printers data feeds...`);
    
    setSubAgents(prev => prev.map(a => ({ ...a, status: 'active', load: 85, thought: 'Parsing core blueprint instructions...' })));

    setTimeout(() => {
      const parsedSteps: PlanStep[] = [
        {
          id: 'step1',
          kind: 'tool_call',
          title: lang === 'bn' ? 'শুকরিয়া প্রিন্টার্স ব্রোশিওর টেমপ্লেট ডিজাইন' : 'Formulate Spec Layout for Glossy Graphic Poster',
          payload: 'tools.layout/spec-assembly-mesh',
          status: 'pending'
        },
        {
          id: 'step2',
          kind: 'file_write',
          title: lang === 'bn' ? 'লোকাল এসেট ফাইলে প্রিন্টিং কোড জেনারেট' : 'Write compiled html file into assets/shukria_offset.html',
          payload: 'file.write({ path: "assets/shukria_offset.html", content: "..." })',
          status: 'pending'
        },
        {
          id: 'step3',
          kind: 'verify',
          title: lang === 'bn' ? 'এইচটিএমএল এসেট এবং ১৫% ভ্যাট ক্যালকুলেশন ভ্যালিডেশন' : 'Audit spec metrics and apply standard 15% VAT ledger calculation',
          payload: 'math.eval("15% standard corporate tax auditor")',
          status: 'pending'
        },
        {
          id: 'step4',
          kind: 'shell',
          title: lang === 'bn' ? 'সুরক্ষিত গিট কমিট এবং ব্যাকআপ পুশ' : 'Commit sandbox indices using secure shell control hooks',
          payload: 'shell.run("git add assets/shukria_offset.html && git commit -m")',
          status: 'pending'
        }
      ];

      setPlan({
        id: Math.random().toString(),
        goal,
        steps: parsedSteps,
        status: 'pending'
      });
      setIsFormulating(false);
      
      setSubAgents([
        { id: 'sa-core', name: 'Neora Core Agent', role: 'Whisper STT Parser & NLP Orchestrator', engine: 'Gemini 2.5', status: 'success', thought: 'Plan formulated successfully! Standby to execute.', load: 6 },
        { id: 'sa-layout', name: 'Layout Spec Engineer', role: 'Bento Grid & Glossy Offset Blueprint Builder', engine: 'Gemini Flash', status: 'idle', thought: 'Step-1 ready for layout design synthesis.', load: 2 },
        { id: 'sa-billing', name: 'Fintech VAT Auditor', role: 'Earning reports, Corporate 15% VAT ledger', engine: 'Local Math Module', status: 'idle', thought: 'Step-3 ready to audit calculations.', load: 2 },
        { id: 'sa-guard', name: 'Security Process Lock', role: 'Directory lock bypasser & Git staging validator', engine: 'Safe Sandbox', status: 'idle', thought: 'Step-2 and Step-4 storage hooks guarded.', load: 2 }
      ]);

      addLog(`Success: Assembled a 4-step autonomous task vector.`);
    }, 1200);
  };

  // Run structured workflow with simulated EPERM bypass and real virtual filesystem updates!
  const handleRunWorkflow = async () => {
    if (!plan) return;
    setIsRunning(true);
    setSelfCorrectionState('none');
    addLog(`Running Neora Step Plan Executor on Autonomy Level ${autonomyLevel}...`);

    const updatedSteps = [...plan.steps];

    // Step 1: Spec Design
    setSubAgents(prev => prev.map(a => a.id === 'sa-layout' ? { ...a, status: 'active', load: 95, thought: 'Formulating Bento Grid vectors...' } : a));
    updatedSteps[0].status = 'running';
    setPlan(prev => prev ? { ...prev, steps: updatedSteps, status: 'running' } : null);
    addLog(`Executing Step 1: [Spec Architect Bot] ${updatedSteps[0].title}`);
    await new Promise(r => setTimeout(r, 1500));
    
    updatedSteps[0].status = 'completed';
    setSubAgents(prev => prev.map(a => a.id === 'sa-layout' ? { ...a, status: 'success', load: 5, thought: 'Spec model generated in memory!' } : a));
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`Step 1 Success: Produced fine-mesh bento grid poster components outline.`);

    // Step 2: File Write (Simulates lock lockout first)
    setSubAgents(prev => prev.map(a => a.id === 'sa-guard' ? { ...a, status: 'active', load: 98, thought: 'Writing file context safely...' } : a));
    updatedSteps[1].status = 'running';
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`Executing Step 2: [Storage Sandbox Agent] ${updatedSteps[1].title}`);
    await new Promise(r => setTimeout(r, 1600));

    // Lock simulation
    updatedSteps[1].status = 'failed';
    updatedSteps[1].feedback = lang === 'bn' 
      ? 'ব্যর্থতা: ফাইল রাইটের জন্য ডিরেক্টরি লক পাওয়া যায় নি (EPERM locking exception)' 
      : 'EPERM Error: Filesystem handle for assets/ directory locked by external background process wrapper.';
    setSubAgents(prev => prev.map(a => a.id === 'sa-guard' ? { ...a, status: 'warning', load: 10, thought: 'EPERM Lock Intercepted!' } : a));
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`⚠️ CRITICAL LOG ENTRY: Step 2 Failed! EPERM Security Lock spotted.`);
    
    // Log the EPERM error directly to the System Journal
    const failMsg = lang === 'bn'
      ? 'ক্রিটিক্যাল ত্রুটি: ডিরেক্টরি লক EPERM এক্সেপশন। ফাইল রাইট অপারেশন সম্পূর্ণ হতে পারেনি।'
      : 'CRITICAL ERROR: Directory assets/ locked by concurrent process stream. File write operation aborted.';
    setDiagnosticsIncidents(prev => [`[${new Date().toLocaleTimeString()}] [CRITICAL] ${failMsg}`, ...prev]);

    // Push proactive decision log
    setProactiveDecisions(prev => [
      {
        id: 'dec-' + Math.random().toString().substring(2, 6),
        timestamp: new Date().toLocaleTimeString(),
        title: lang === 'bn' ? 'ফাইল রাইট লক অবমুক্তকরণ মুলতবি' : 'EPERM Write Intercept Diagnostics',
        description: 'Encountered active background write lock on resource directory assets/. Suspended execution for user confirmation.',
        category: 'Process Safety',
        status: 'STANDBY',
        impact: 'Safe state maintained.'
      },
      ...prev
    ]);

    // Transition state and pause execution!
    setSelfCorrectionState('pending');
    setIsRunning(false);
  };

  const handleApproveSelfRepair = async () => {
    if (!plan) return;
    setSelfCorrectionState('resolving');
    setIsRunning(true);
    addLog(`User approved autonomous self-repair and retry loop!`);
    setDiagnosticsIncidents(prev => [`[${new Date().toLocaleTimeString()}] [USER APPROVED] Self-repair protocol authorized. Dispatching active bypass...`, ...prev]);

    const updatedSteps = [...plan.steps];
    updatedSteps[1].status = 'running';
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);

    setSubAgents(prev => prev.map(a => a.id === 'sa-guard' ? { ...a, status: 'active', load: 99, thought: 'Executing parent directory lock bypass...' } : a));
    await new Promise(r => setTimeout(r, 1500));

    // Repairs
    addLog(`Repair Engine: Resolving absolute pathing, creating parent assets/ directory, purging lock handle...`);
    await new Promise(r => setTimeout(r, 1500));

    updatedSteps[1].status = 'completed';
    updatedSteps[1].feedback = lang === 'bn' 
      ? 'সংশোধন সাকসেস: ডিরেক্টরি অবমুক্ত করা হয়েছে এবং প্রিন্ট-রেডি কোড ফাইলে সেভ করা হয়েছে।' 
      : 'Self-Repaired successfully: Lock handles purged. Directory created; assets/shukria_offset.html written.';
    
    setVirtualFiles(prev => {
      return prev.map(f => {
        if (f.name === 'shukria_offset.html') {
          return {
            ...f,
            content: `<!-- COMPILATION SUCCESSFUL BY SECURE BYPASS DAEMON -->\n<div class="shukria-brochure">\n  <h2>High-Gloss Poster Output</h2>\n  <p>Status: Self-Healed and Verified</p>\n  <p>Vat Code standard: 15.00% VAT standard</p>\n  <p>Timestamp: ${new Date().toISOString()}</p>\n</div>`,
            updated: new Date().toISOString().replace('T', ' ').substring(0, 16),
            size: '720 B'
          };
        }
        return f;
      });
    });

    setSubAgents(prev => prev.map(a => a.id === 'sa-guard' ? { ...a, status: 'success', load: 5, thought: 'Lock cleared via bypass.' } : a));
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`[REPAIR SYSTEM SUCCESS]: Directory unlocked successfully!`);

    // Proceed to remain steps
    await runRemainingSteps(updatedSteps);
  };

  const handleAdjustPath = async () => {
    if (!plan) return;
    setSelfCorrectionState('adjusted');
    setIsRunning(true);
    addLog(`User selected ADJUST PATH option. Redirecting target to diagnostics/ backup partition.`);
    setDiagnosticsIncidents(prev => [`[${new Date().toLocaleTimeString()}] [USER PATH ADJUSTMENT] Redirected directory write target from assets/ to diagnostics/shukria_offset_backup.html.`, ...prev]);

    const updatedSteps = [...plan.steps];
    updatedSteps[1].status = 'running';
    updatedSteps[1].title = lang === 'bn' 
      ? 'সংশোধিত ফাইল রাইট (ব্যাকআপ পাথে)' 
      : 'Write Shukria poster template to alternative backup path';
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);

    setSubAgents(prev => prev.map(a => a.id === 'sa-guard' ? { ...a, status: 'active', load: 85, thought: 'Redirecting file stream to path Diagnostics...' } : a));
    await new Promise(r => setTimeout(r, 1500));

    updatedSteps[1].status = 'completed';
    updatedSteps[1].feedback = lang === 'bn' 
      ? 'পাথ সমন্বয় সফল: ব্যাকআপ ডিরেক্টরিতে HTML ফাইল রাইট সম্পন্ন হয়েছে।' 
      : 'Adjusted: Target redirected successfully. Written to diagnostics/shukria_offset_backup.html.';

    // Insert backup HTML file into the virtual Filesystem!
    setVirtualFiles(prev => {
      const idx = prev.findIndex(f => f.name === 'shukria_offset_backup.html');
      if (idx > -1) return prev;
      return [
        ...prev,
        {
          name: 'shukria_offset_backup.html',
          path: 'diagnostics/shukria_offset_backup.html',
          content: `<!-- ALTERNATIVE BACKUP OUTPUT -->\n<div class="brochure-backup">\n  <h2>High-Gloss Poster (Diagnostics Recovery)</h2>\n  <p>Status: Path-Adjusted write</p>\n  <p>Vat applied: 15%</p>\n  <p>Timestamp: ${new Date().toISOString()}</p>\n</div>`,
          size: '420 B',
          updated: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'asset'
        }
      ];
    });

    setSubAgents(prev => prev.map(a => a.id === 'sa-guard' ? { ...a, status: 'success', load: 3, thought: 'Alternative file write complete.' } : a));
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`Adjusted Target completed: written to diagnostics/shukria_offset_backup.html.`);

    // Proceed to remain steps
    await runRemainingSteps(updatedSteps);
  };

  const runRemainingSteps = async (updatedSteps: PlanStep[]) => {
    // Step 3: VAT Finance Audit
    setSubAgents(prev => prev.map(a => a.id === 'sa-billing' ? { ...a, status: 'active', load: 92, thought: 'Auditing prices and compiling 15% VAT ledger...' } : a));
    updatedSteps[2].status = 'running';
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`Executing Step 3: [Financial Ledger Auditor] ${updatedSteps[2].title}`);
    await new Promise(r => setTimeout(r, 1500));
    
    updatedSteps[2].status = 'completed';
    setSubAgents(prev => prev.map(a => a.id === 'sa-billing' ? { ...a, status: 'success', load: 5, thought: '15% VAT ledger balance audit clear!' } : a));
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`Step 3 Success: Financial tax parameters checked. 100% pricing accuracy compiled.`);

    // Step 4: Shell Git Stage commit
    setSubAgents(prev => prev.map(a => a.id === 'sa-guard' ? { ...a, status: 'active', load: 96, thought: 'Executing secure shell indexes...' } : a));
    updatedSteps[3].status = 'running';
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`Executing Step 4: [Process Validator Guard] ${updatedSteps[3].title}`);
    await new Promise(r => setTimeout(r, 1500));
    
    updatedSteps[3].status = 'completed';
    setSubAgents(prev => prev.map(a => a.id === 'sa-guard' ? { ...a, status: 'success', load: 1, thought: 'Secure git indexing push complete' } : a));
    setPlan(prev => prev ? { ...prev, steps: updatedSteps } : null);
    addLog(`Step 4 Success: Local git index stage cleared. Asset files successfully committed!`);

    // Finished
    setPlan(prev => prev ? { ...prev, status: 'completed' } : null);
    setSubAgents(prev => prev.map(a => ({ ...a, status: 'success', thought: 'Task fully compiled.', load: 0 })));
    setIsRunning(false);
    setSelfCorrectionState('none');
    addLog(`Planner Executor: Autonomous command pipeline completed with perfect metrics!`);
  };

  useEffect(() => {
    if (autonomyLevel < 4 && inputMode === 'shell') {
      setInputMode('goal');
    }
  }, [autonomyLevel, inputMode]);

  const isSubTabLocked = (tabName: string) => {
    if (autonomyLevel <= 2) {
      return tabName !== 'threads' && tabName !== 'framework';
    }
    if (autonomyLevel === 3) {
      return tabName === 'proactive' || tabName === 'diagnostics';
    }
    return false;
  };

  const renderLockedSubTabShield = (reqLevel: number, tabLabel: string) => {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-8 bg-slate-950/40 text-center space-y-4 my-auto h-[350px]">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-450 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h4 className="text-xs font-bold font-mono tracking-widest text-slate-100 uppercase">ACCESS SHIELD RESTRICTED</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Monitoring console <strong className="text-white">{tabLabel}</strong> is locked under your current Operating Policy. Upgrade your autonomy clearance to monitor lower-level system pipelines active.
          </p>
        </div>
        <div className="bg-slate-950 px-3.5 py-1.5 rounded border border-rose-950 text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wide">
          REQUIRED ELEVATION: LEVEL {reqLevel}+ AUTONOMY
        </div>
      </div>
    );
  };

  // Files filtering
  const filteredFiles = virtualFiles.filter(f => {
    return f.name.toLowerCase().includes(searchFileQuery.toLowerCase()) || 
           f.path.toLowerCase().includes(searchFileQuery.toLowerCase());
  });

  return (
    <div id="planner-section" className={`flex-1 flex flex-col xl:flex-row h-full bg-slate-950 text-slate-100 overflow-hidden select-none transition-all ${
      autonomyLevel === 5 ? 'border-2 border-cyan-500/30 shadow-[inset_0_0_50px_rgba(6,182,212,0.05)]' : ''
    }`}>
      
      {/* LEFT COLUMN: Main Telemetry Controls & Self-Management Toggles */}
      <div className={`w-full ${autonomyLevel > 1 ? 'xl:w-[42%] border-r border-slate-900' : 'max-w-4xl mx-auto'} p-5 overflow-y-auto space-y-4 flex flex-col shrink-0`}>
        
        {/* Core Header info */}
        <div className="flex items-center justify-between border-b border-indigo-950/40 pb-2">
          <div className="space-y-0.5">
            <h2 className="text-xs font-mono font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 uppercase">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{lang === 'bn' ? 'নিওরা এআই ওএস কন্ট্রোল প্যানেল' : 'Neora AI OS Control Panel'}</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              {lang === 'bn' ? 'স্বয়ংক্রিয় ওয়ার্কার ডেমো / এজেন্টের রিয়েল-টাইম টেলিমეტ্রি কনসোল।' : 'Autonomous Kernel Daemon / Interactive Multi-Agent Control. / Safe sandbox'}
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end font-mono">
            <span className="text-[8px] text-slate-500">SYSTEM_CLOCK</span>
            <span className="text-[10px] text-cyan-500 tracking-wider font-semibold">{osClock || 'CLOCK DIRECTING'}</span>
          </div>
        </div>

        {/* Dynamic Alarm Crash Self-Healing Banner simulator */}
        {selfHealingState !== 'idle' ? (
          <div className={`p-3 border rounded-lg animate-pulse font-mono text-xs text-center space-y-1.5 transition-all ${
            selfHealingState === 'crashing' 
              ? 'bg-rose-950/70 border-rose-500/80 text-rose-200' 
              : selfHealingState === 'diagnosing'
              ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
              : selfHealingState === 'auto_patching'
              ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-200'
              : 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 animate-spin" />
              <span className="font-bold uppercase tracking-wider">
                {selfHealingState === 'crashing' && (lang === 'bn' ? 'সিস্টেম ক্র্যাশ সিমুলেশন অ্যাক্টিভেটেড!' : 'SIMULATING SYSTEM CRASH!')}
                {selfHealingState === 'diagnosing' && (lang === 'bn' ? 'অটোনমাস ডায়াগনস্টিকস লুপ রান হচ্ছে...' : 'AUTONOMOUS RUNTIME DIAGNOSING...')}
                {selfHealingState === 'auto_patching' && (lang === 'bn' ? 'ইপিইআরএম ফাইল লক স্বয়ংক্রিয় অবমুক্ত করা হচ্ছে...' : 'AUTO-APPLYING EPERM BYPASS CORE PATCH...')}
                {selfHealingState === 'clean_reboot' && (lang === 'bn' ? 'ক্লিন রিবুট ও প্রসেস রিস্টার্ট সম্পন্ন হচ্ছে...' : 'SHIELD REBOOT & PROCESS RE-AWAKENING...')}
                {selfHealingState === 'healed' && (lang === 'bn' ? 'সিস্টেম রি-ভ্যালিডেটেড ও সম্পূর্ণ রিকভার্ড!' : 'SYSTEM SANITY 100% RECOVERED!')}
              </span>
            </div>
            <p className="text-[9px] leading-relaxed opacity-90 max-w-sm mx-auto">
              {selfHealingState === 'crashing' && 'Simulating external resource locks blocking assets writing.'}
              {selfHealingState === 'diagnosing' && 'Scanning PID thread allocations and files descriptors limits.'}
              {selfHealingState === 'auto_patching' && 'Injecting dynamic filesystem proxy handlers with safe folder override hooks.'}
              {selfHealingState === 'clean_reboot' && 'Synchronous mounting of safe micro-daemons.'}
              {selfHealingState === 'healed' && 'Full security logs updated standard memory restored.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-lg flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-wide text-indigo-400">
                {lang === 'bn' ? 'সেলফ-হিলিং ডেমো লুপ' : 'SELF-HEALING DEMO SIMULATOR'}
              </h4>
              <p className="text-[9px] text-slate-450 leading-snug">
                {lang === 'bn' ? 'একটি কৃত্রিম ইপিইআরএম ফাইল লকআপ ব্যর্থতা সৃষ্টি করে এআই ওএসের স্বয়ংক্রিয় রোগ নির্ণয় ও সমাধান প্রক্রিয়া দেখুন।' : 'Trigger a simulated filesystem deadlock to witness Neora OS immediately formulate and apply diagnostic hot-fixes.'}
              </p>
            </div>
            <button
              onClick={handleTriggerSelfHealingSimulation}
              disabled={isRunning || isFormulating}
              className="py-1.5 px-3 bg-indigo-950/20 hover:bg-indigo-900/30 border border-indigo-500/30 hover:border-indigo-500/50 rounded text-[10px] font-mono hover:text-white font-bold transition-all shrink-0 cursor-pointer text-indigo-400"
            >
              {lang === 'bn' ? 'টেস্ট ক্র্যাশ' : 'CRASH TEST'}
            </button>
          </div>
        )}

        {/* Telemetry Metrics cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg relative overflow-hidden group hover:border-cyan-500/20 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider font-bold">
                {lang === 'bn' ? 'ভয়েস ডিক্টেশন নির্ভুলতা' : 'STT Accuracy Core'}
              </span>
              <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-mono">{whisperConfidence.toFixed(2)}%</span>
            <p className="text-[9px] text-slate-500 leading-normal mt-0.5 font-mono">Whisper STT Server Engine API feed</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg relative overflow-hidden group hover:border-indigo-500/20 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider font-bold">
                {lang === 'bn' ? 'স্বয়ংক্রিয় ব্যাকগ্রাউন্ড ডেমো' : 'Autonomous Heartbeat'}
              </span>
              <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-sans uppercase">
                {isAutoCycleActive ? 'RUNNING' : 'STANDBY'}
              </span>
              <button 
                onClick={() => setIsAutoCycleActive(!isAutoCycleActive)}
                className={`py-0.5 px-2 rounded-full text-[9px] font-mono tracking-wider font-bold transition-all cursor-pointer ${
                  isAutoCycleActive 
                    ? 'bg-rose-950/40 border border-rose-500/40 text-rose-400 hover:bg-rose-900/30' 
                    : 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/30'
                }`}
              >
                {isAutoCycleActive ? (lang === 'bn' ? 'বন্ধ' : 'HALT') : (lang === 'bn' ? 'চালু' : 'RUN')}
              </button>
            </div>
            <p className="text-[9px] text-slate-500 leading-normal mt-0.5 font-mono">Autonomous background cycle dispatcher</p>
          </div>
        </div>

        {/* Heuristics Self-Management Policies */}
        <div className="p-3.5 bg-slate-900/25 border border-slate-900 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'bn' ? 'স্বয়ংক্রিয় হিউরিস্টিক পলিসি' : 'Heuristic Self-Management Policies'}</span>
            </span>
            <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 border border-emerald-900/30 rounded font-mono uppercase font-bold text-[8px]">ADAPTIVE GATE ENABLED</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-350">
            <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-900 rounded">
              <span className="truncate mr-1">{lang === 'bn' ? 'অটো-হিলিং হুকস' : 'AutoHeal EPERMs'}</span>
              <button 
                onClick={() => setPolicies(prev => ({ ...prev, autoHeal: !prev.autoHeal }))}
                className={`text-[9px] font-bold px-1 py-0.5 rounded ${policies.autoHeal ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/25' : 'text-slate-550 bg-slate-900'}`}
              >
                {policies.autoHeal ? 'YA' : 'NO'}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-900 rounded">
              <span className="truncate mr-1">{lang === 'bn' ? 'ইনভয়েস অডিট' : 'Fiscal Real-Audit'}</span>
              <button 
                onClick={() => setPolicies(prev => ({ ...prev, ledgerAudit: !prev.ledgerAudit }))}
                className={`text-[9px] font-bold px-1 py-0.5 rounded ${policies.ledgerAudit ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/25' : 'text-slate-550 bg-slate-900'}`}
              >
                {policies.ledgerAudit ? 'YA' : 'NO'}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-900 rounded">
              <span className="truncate mr-1">{lang === 'bn' ? 'Groq এপিআই ফেইলওভার' : 'Groq Failover'}</span>
              <button 
                onClick={() => setPolicies(prev => ({ ...prev, groqFailover: !prev.groqFailover }))}
                className={`text-[9px] font-bold px-1 py-0.5 rounded ${policies.groqFailover ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/25' : 'text-slate-550 bg-slate-900'}`}
              >
                {policies.groqFailover ? 'YA' : 'NO'}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-900 rounded">
              <span className="truncate mr-1">{lang === 'bn' ? 'রাইট প্রটেকশন লক' : 'Lock Protection'}</span>
              <button 
                onClick={() => setPolicies(prev => ({ ...prev, preventWriteLockout: !prev.preventWriteLockout }))}
                className={`text-[9px] font-bold px-1 py-0.5 rounded ${policies.preventWriteLockout ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/25' : 'text-slate-550 bg-slate-900'}`}
              >
                {policies.preventWriteLockout ? 'YA' : 'NO'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Working Registers */}
        <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-555" />
              <span>{lang === 'bn' ? 'কগনিটিভ লোকাল মেমরি রেজিস্টার' : 'Cognitive Local Working Registers'}</span>
            </span>
            <button
              onClick={() => setShowAddRegister(!showAddRegister)}
              className="text-[9px] bg-cyan-950 hover:bg-cyan-900 text-cyan-400 px-1.5 py-0.5 border border-cyan-850 rounded font-mono flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>{lang === 'bn' ? 'যোগ' : 'ADD'}</span>
            </button>
          </div>

          {showAddRegister && (
            <form onSubmit={handleAddCustomRegister} className="p-2 bg-slate-950 border border-slate-900/80 rounded space-y-2 text-[10px] font-mono">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="KEY (e.g. VAT_RATE)" 
                  value={newRegKey}
                  onChange={(e) => setNewRegKey(e.target.value)}
                  className="bg-slate-900 border border-slate-800 p-1 rounded placeholder-slate-600 outline-none text-white text-[9px]"
                  required
                />
                <input 
                  type="text" 
                  placeholder="VALUE (e.g. 15.0%)" 
                  value={newRegVal}
                  onChange={(e) => setNewRegVal(e.target.value)}
                  className="bg-slate-900 border border-slate-800 p-1 rounded placeholder-slate-600 outline-none text-white text-[9px]"
                  required
                />
              </div>
              <div className="flex justify-end gap-1.5 text-[9px]">
                <button type="button" onClick={() => setShowAddRegister(false)} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                <button type="submit" className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-850 rounded">{lang === 'bn' ? 'নিশ্চিত' : 'Submit'}</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
            {cognitiveWorkingRegisters.map((reg, idx) => (
              <div key={idx} className="flex flex-col p-1.5 bg-slate-950 border border-slate-900/80 rounded">
                <span className="text-slate-500 text-[8px] font-bold truncate">{reg.key}</span>
                <span className="text-slate-300 truncate" title={reg.val}>{reg.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Autonomy Level Slider */}
        <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg space-y-2">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.autonomyLevel}: <span className="text-cyan-400">Level {autonomyLevel} / 5</span></span>
            </label>
            <span className="text-[8px] font-mono text-slate-550">GATE THRESHOLD CONTROL</span>
          </div>
          <input
            id="autonomy-slider"
            type="range"
            min="1"
            max="5"
            value={autonomyLevel}
            onChange={(e) => setAutonomyLevel(parseInt(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-950 h-1 rounded cursor-pointer"
          />
          <div className="p-2.5 rounded bg-slate-950/70 border border-slate-900 text-[11px] font-mono leading-relaxed text-slate-300 border-l-2 border-l-cyan-500">
            {explainAutonomy(autonomyLevel)}
          </div>
        </div>

        {/* Command Input Mode Switcher */}
        <div className="p-1 bg-slate-950 border border-slate-900 rounded-lg flex items-center gap-1 font-mono text-[9px] select-none font-bold uppercase">
          <button 
            type="button"
            onClick={() => setInputMode('goal')}
            className={`flex-1 py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${inputMode === 'goal' ? 'bg-cyan-950 text-cyan-400 border border-cyan-850' : 'text-slate-500 border border-transparent hover:text-slate-400'}`}
          >
            <Sliders className="w-2.5 h-2.5" />
            <span>Goal Definer</span>
          </button>
          <button 
            type="button"
            onClick={() => {
              if (autonomyLevel < 4) {
                addLog(`⚠️ ACCESS DENIED: Direct Kernel direct operations console is locked. Requires Autonomy Level 4+.`);
                return;
              }
              setInputMode('shell');
            }}
            className={`flex-1 py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${inputMode === 'shell' ? 'bg-cyan-950 text-cyan-400 border border-cyan-850' : 'text-slate-500 border border-transparent hover:text-slate-400'}`}
          >
            {autonomyLevel < 4 ? <Lock className="w-2.5 h-2.5 text-rose-500" /> : <Terminal className="w-2.5 h-2.5" />}
            <span>Kernel Shell Console</span>
          </button>
        </div>

        {/* Command Option Workspaces */}
        {inputMode === 'goal' ? (
          <div className="space-y-2">
            <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400 block flex items-center gap-1">
              <span>🚀 Declare Objective Command Task:</span>
            </label>
            <div className="relative">
              <textarea
                id="planner-textarea"
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Design poster flyer formatting layout, calculate VAT invoice and stage commits"
                className="w-full bg-slate-950 border border-slate-900 rounded-md p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors pr-10"
              />
              <div className="absolute right-2.5 bottom-2.5 pointer-events-none text-slate-700">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <button
              onClick={handleFormulatePlan}
              disabled={isFormulating || isRunning}
              className="w-full py-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-cyan-450 hover:text-white hover:border-cyan-500/20 font-bold transition-all rounded text-xs cursor-pointer tracking-wider flex items-center justify-center gap-2 shadow-sm"
            >
              {isFormulating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>FORMULATING PLAN STEPS...</span>
                </>
              ) : (
                <>
                  <Sliders className="w-3.5 h-3.5" />
                  <span>FORMULATE EXECUTION PLAN</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400 block flex items-center gap-1">
              <span>⚡ Kernel Operations Shell:</span>
            </label>
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-md font-mono space-y-2">
              <div className="text-[9px] text-slate-500">
                Type <span className="text-cyan-400">help</span> or <span className="text-cyan-400">?</span> for available operations.
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleExecuteShellCommand(); }} className="flex items-center gap-1.5">
                <span className="text-cyan-500 text-[10px] select-none text-left">neora@os:~$</span>
                <input 
                  type="text"
                  value={shellCommand}
                  onChange={(e) => setShellCommand(e.target.value)}
                  placeholder="optimize"
                  className="flex-1 bg-transparent border-none outline-none text-xs text-emerald-400 font-mono caret-emerald-400"
                />
                <button type="submit" className="hidden" />
              </form>
            </div>
            {/* Quick-action macros */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono tracking-wider uppercase font-bold text-slate-600 block">{lang === 'bn' ? 'কুইক ম্যাক্রোস:' : 'QUICK ACTION KERNEL MACROS:'}</span>
              <div className="flex flex-wrap gap-1">
                <button 
                  onClick={() => handleExecuteShellCommand('systat')}
                  className="text-[8px] bg-slate-900 border border-slate-850 hover:bg-slate-850 text-cyan-500 hover:text-white px-2 py-1 rounded cursor-pointer font-mono"
                >
                  SYSTEM STATS
                </button>
                <button 
                  onClick={() => handleExecuteShellCommand('optimize')}
                  className="text-[8px] bg-slate-900 border border-slate-850 hover:bg-slate-850 text-cyan-500 hover:text-white px-2 py-1 rounded cursor-pointer font-mono"
                >
                  GC DEFRAG
                </button>
                <button 
                  onClick={() => handleExecuteShellCommand('clear-lock')}
                  className="text-[8px] bg-slate-900 border border-slate-850 hover:bg-slate-850 text-cyan-500 hover:text-white px-2 py-1 rounded cursor-pointer font-mono"
                >
                  CLEAR LOCKS
                </button>
                <button 
                  onClick={() => handleExecuteShellCommand('audvat')}
                  className="text-[8px] bg-slate-900 border border-slate-850 hover:bg-slate-850 text-cyan-500 hover:text-white px-2 py-1 rounded cursor-pointer font-mono"
                >
                  AUDIT VAT
                </button>
                <button 
                  onClick={() => handleExecuteShellCommand('make-template')}
                  className="text-[8px] bg-slate-900 border border-slate-850 hover:bg-slate-850 text-cyan-500 hover:text-white px-2 py-1 rounded cursor-pointer font-mono"
                >
                  MAKE SPEC
                </button>
              </div>
            </div>
          </div>
        )}

        {autonomyLevel === 1 && (
          <div className="bg-slate-900/25 border border-slate-900 p-4 rounded-lg text-left mt-2 border-l-2 border-l-cyan-500">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">🔒 Standard Telemetry Handoff Panel Hidden (Level 1)</span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
              Under Level 1 Autonomy, advanced lower-level daemon monitoring consoles, file systems, and real-time process indices are cleanly hidden. Glide the slider upward to Level 2-5 to unlock active sub-agent metrics.
            </p>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Interactive Multi-Agent Thread Matrix / Virtual Filesystem / Incident Diagnostics */}
      {autonomyLevel > 1 && (
        <div className="flex-1 p-5 flex flex-col h-full overflow-hidden space-y-3.5">
        
        {/* Secondary Navigation System Core Tabs */}
        <div className="flex items-center justify-between border-b border-indigo-950/45 pb-1 select-none">
          <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono font-bold uppercase font-sans">
            <button
              onClick={() => setActiveSubTab('threads')}
              className={`px-3 py-1.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1 border-b-2 ${
                activeSubTab === 'threads' ? 'text-cyan-400 border-cyan-500 bg-slate-900/40 font-bold' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{isSubTabLocked('threads') ? '🔒 ' : ''}{lang === 'bn' ? 'থিওরি এজেন্ট মেট্রিক্স' : 'THREADS MATRIX'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('processes')}
              className={`px-3 py-1.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1 border-b-2 ${
                activeSubTab === 'processes' ? 'text-cyan-400 border-cyan-500 bg-slate-900/40 font-bold' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{isSubTabLocked('processes') ? '🔒 ' : ''}{lang === 'bn' ? 'প্রসেস ম্যানেজার' : 'PROCESS DAEMONS'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('files')}
              className={`px-3 py-1.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1 border-b-2 ${
                activeSubTab === 'files' ? 'text-cyan-400 border-cyan-500 bg-slate-900/40 font-bold' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{isSubTabLocked('files') ? '🔒 ' : ''}{lang === 'bn' ? 'ভার্চুয়াল ফাইলসিস্টেম' : 'VIRTUAL FILESYSTEM'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('proactive')}
              className={`px-3 py-1.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1 border-b-2 ${
                activeSubTab === 'proactive' ? 'text-cyan-400 border-cyan-500 bg-slate-900/40 font-bold' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{isSubTabLocked('proactive') ? '🔒 ' : ''}{lang === 'bn' ? 'অটোনমাস সিদ্ধান্ত' : 'PROACTIVE DECISIONS'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('diagnostics')}
              className={`px-3 py-1.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1 border-b-2 ${
                activeSubTab === 'diagnostics' ? 'text-cyan-400 border-cyan-500 bg-slate-900/40 font-bold' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>{isSubTabLocked('diagnostics') ? '🔒 ' : ''}{lang === 'bn' ? 'সিস্টেম ইভেন্টস' : 'INCIDENT LOGS'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('framework')}
              className={`px-3 py-1.5 rounded-t-lg transition-all cursor-pointer flex items-center gap-1 border-b-2 ${
                activeSubTab === 'framework' ? 'text-cyan-400 border-cyan-500 bg-slate-900/40 font-bold' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-teal-400" />
              <span>{isSubTabLocked('framework') ? '🔒 ' : ''}{lang === 'bn' ? 'নিওরা ওএস আর্কিটেকচার' : 'NEORA ARCHITECTURE'}</span>
            </button>
          </div>
          <span className="text-[9px] border border-cyan-950 bg-cyan-950/20 px-2 py-0.5 rounded text-cyan-400 font-mono tracking-wider font-semibold uppercase hidden lg:inline">
            SYSTEM STATUS: ACTIVE
          </span>
        </div>

        {/* TAB WORKSPACE CONTENT */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {isSubTabLocked(activeSubTab) ? (
            renderLockedSubTabShield(
              activeSubTab === 'processes' || activeSubTab === 'files' ? 3 : 4,
              activeSubTab.toUpperCase()
            )
          ) : (
            <>
              {/* 1. Threads matrix workspace layout */}
              {activeSubTab === 'threads' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full overflow-y-auto pr-1">
              {subAgents.map((agent) => (
                <div 
                  key={agent.id} 
                  className={`p-3 bg-slate-950 border rounded-lg transition-all flex flex-col justify-between ${
                    agent.status === 'active' 
                      ? 'border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.06)]' 
                      : agent.status === 'success'
                      ? 'border-emerald-500/30'
                      : agent.status === 'warning'
                      ? 'border-rose-500/40 shadow-[0_0_12px_rgba(239,68,68,0.065)] animate-pulse'
                      : 'border-slate-905'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <h4 className="text-[11px] font-bold text-white leading-none flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            agent.status === 'active' ? 'bg-cyan-400 animate-ping' :
                            agent.status === 'success' ? 'bg-emerald-450' :
                            agent.status === 'warning' ? 'bg-rose-450' : 'bg-slate-600'
                          }`}></span>
                          <span>{agent.name}</span>
                        </h4>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">{agent.role}</span>
                      </div>
                      <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.2 rounded border border-slate-850/80 text-slate-400">
                        {agent.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-350 font-mono leading-tight italic bg-slate-900/40 p-2 rounded border border-slate-900">
                      &quot;{agent.thought}&quot;
                    </p>
                  </div>
                  
                  <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono text-slate-500 border-t border-slate-900/60 pt-2 shrink-0">
                    <span>ENGINE: {agent.engine}</span>
                    <div className="flex items-center gap-1.5">
                      <span>LOAD: {agent.load}%</span>
                      <div className="w-12 bg-slate-900 h-1 rounded overflow-hidden">
                        <div className="bg-cyan-500 h-full transition-all" style={{ width: `${agent.load}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Processes manager daemon monitor */}
          {activeSubTab === 'processes' && (
            <div className="flex-1 bg-slate-950 border border-slate-900 rounded-lg overflow-hidden flex flex-col font-mono text-[10px]">
              <div className="p-2 border-b border-slate-900 bg-slate-900/20 text-[9px] uppercase font-bold text-slate-400 flex items-center justify-between select-none">
                <span>Core Operating System Process Matrix</span>
                <span className="text-cyan-455">Total RAM: 268.6 MB bound</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900/80 text-slate-500 uppercase text-[8px] tracking-wider select-none">
                      <th className="p-2">PID</th>
                      <th className="p-2">PROCESS NAME</th>
                      <th className="p-2">PORT</th>
                      <th className="p-2">MEMORY</th>
                      <th className="p-2">CPU</th>
                      <th className="p-2">STATUS</th>
                      <th className="p-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((p) => {
                      const dead = p.status === 'Dead';
                      return (
                        <tr key={p.pid} className={`border-b border-slate-950 hover:bg-slate-900/40 transition-colors ${dead ? 'text-slate-600 italic line-through' : 'text-slate-300'}`}>
                          <td className="p-2 font-mono text-slate-500 font-bold">{p.pid}</td>
                          <td className="p-2 flex items-center gap-1.5">
                            <Server className={`w-3 h-3 ${dead ? 'text-slate-650' : 'text-cyan-500'}`} />
                            <span className="font-semibold">{p.name}</span>
                            {p.priority === 'CRITICAL' && !dead && (
                              <span className="bg-rose-950 text-rose-400 border border-rose-900/40 rounded px-1 text-[7px] font-bold">CORE</span>
                            )}
                          </td>
                          <td className="p-2 text-slate-400">{p.port}</td>
                          <td className="p-2 text-slate-400">{p.memory}</td>
                          <td className="p-2 text-slate-400">{p.cpu}%</td>
                          <td className="p-2">
                            <span className={`px-1 rounded text-[8px] font-bold uppercase border ${
                              p.status === 'Running' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/30' :
                              p.status === 'Healing' ? 'bg-cyan-950 text-cyan-400 border-cyan-900/30 animate-pulse' :
                              p.status === 'Sleeping' ? 'bg-slate-900 text-slate-500 border-slate-800' :
                              'bg-rose-950 text-rose-400 border-rose-900/30'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-2 text-right space-x-1 uppercase text-[8px]">
                            <button 
                              onClick={() => optimizeProcess(p.pid)}
                              disabled={dead} 
                              className={`px-1.5 py-0.5 rounded border font-bold cursor-pointer transition-colors ${dead ? 'text-slate-700 border-slate-800 bg-transparent' : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950'}`}
                            >
                              OPT
                            </button>
                            <button 
                              onClick={() => toggleProcessState(p.pid)} 
                              className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                            >
                              {p.status === 'Dead' ? 'Boot' : 'Kill'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Virtual client sandboxed filesystem simulator */}
          {activeSubTab === 'files' && (
            <div className="flex-1 bg-slate-955 border border-slate-900 rounded-lg flex flex-col lg:flex-row overflow-hidden text-xs">
              
              {/* Explorer left folders view */}
              <div className="w-full lg:w-[45%] border-r border-slate-900 flex flex-col h-full bg-slate-950">
                <div className="p-2 border-b border-slate-900 flex items-center justify-between bg-slate-900/10">
                  <span className="font-mono text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Workspace Virtual Disk Directories</span>
                  </span>
                  <button
                    onClick={addVirtualFile}
                    className="text-[8px] bg-slate-900 hover:bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-800 font-bold tracking-wider font-mono cursor-pointer"
                  >
                    + NEW FILE
                  </button>
                </div>
                
                {/* Search files box */}
                <div className="p-2 border-b border-slate-900 relative">
                  <input
                    type="text"
                    value={searchFileQuery}
                    onChange={(e) => setSearchFileQuery(e.target.value)}
                    placeholder="Search partition... (e.g., HTML, db)"
                    className="w-full bg-slate-950 border border-slate-900 p-1.5 text-[10px] text-white rounded pr-7 font-mono focus:outline-none focus:border-cyan-500/40 placeholder-slate-705"
                  />
                  <Search className="w-3.5 h-3.5 absolute right-4 top-4.5 text-slate-750" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 p-2 font-mono text-[10px]">
                  {filteredFiles.map((vf) => (
                    <div 
                      key={vf.path}
                      onClick={() => setSelectedFile(vf)}
                      className={`p-2 rounded flex items-center justify-between border cursor-pointer hover:bg-slate-900/50 transition-all ${
                        selectedFile?.path === vf.path ? 'border-cyan-500/30 bg-cyan-950/10' : 'border-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <FileCode className={`w-4 h-4 shrink-0 ${
                          vf.type === 'kernel' ? 'text-indigo-400' :
                          vf.type === 'asset' ? 'text-cyan-400' :
                          vf.type === 'audit' ? 'text-amber-400' :
                          'text-slate-500'
                        }`} />
                        <div className="flex flex-col text-left truncate">
                          <span className="font-bold text-slate-200 truncate">{vf.name}</span>
                          <span className="text-[8px] text-slate-500 truncate">({vf.path})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px] text-slate-500">{vf.size}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteVirtualFile(vf.path);
                          }}
                          className="hover:text-rose-400 transition-colors p-1"
                          title="Unlink descriptor"
                        >
                          <Trash2 className="w-3 h-3 text-slate-650 hover:text-rose-455" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explorer right editor view */}
              <div className="flex-1 flex flex-col bg-slate-955/80 h-full overflow-hidden border border-slate-900 rounded-lg">
                {selectedFile ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-slate-900 bg-slate-900/10 flex items-center justify-between font-mono text-[9px] text-slate-400">
                      <span>FILE OBJECT: <strong className="text-white">{selectedFile.path}</strong></span>
                      <span>SIZE: {selectedFile.size}</span>
                    </div>
                    
                    <div className="flex-1 p-3 overflow-auto bg-slate-950 font-mono text-[10px] text-emerald-400 text-left select-text relative leading-relaxed flex flex-col">
                      <div className="absolute right-2 top-2 text-[8px] text-slate-600 bg-slate-900 border border-slate-850 px-1 rounded uppercase tracking-widest font-black select-none z-10">
                        {selectedFile.type} WRITABLE_NODE
                      </div>
                      {isEditingFile ? (
                        <textarea
                          value={editedFileContent}
                          onChange={(e) => setEditedFileContent(e.target.value)}
                          className="w-full flex-1 bg-slate-950 text-[10px] text-emerald-400 font-mono p-2 border border-slate-900 rounded outline-none resize-none focus:border-cyan-500/50 font-semibold"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-900 bg-slate-900/20 flex items-center justify-between font-mono text-[8.5px] text-slate-500">
                      <span>Last compiled update: {selectedFile.updated}</span>
                      <div className="flex gap-1.5">
                        {isEditingFile ? (
                          <>
                            <button 
                              onClick={() => { setIsEditingFile(false); setEditedFileContent(selectedFile.content); }} 
                              className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-850 rounded hover:bg-slate-850 cursor-pointer"
                            >
                              CANCEL
                            </button>
                            <button 
                              onClick={saveVirtualFile} 
                              className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-850 rounded hover:bg-cyan-900 cursor-pointer font-bold"
                            >
                              SAVE SYSTEM WRITES
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setIsEditingFile(true)} 
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 text-cyan-500 border border-slate-800 rounded cursor-pointer uppercase font-bold"
                          >
                            Edit File Script
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-[10px]">
                    <HardDrive className="w-8 h-8 text-slate-800 mb-1.5" />
                    <p className="uppercase font-bold text-slate-400">Preview Module Empty</p>
                    <p className="text-slate-600 max-w-xs mt-0.5">Click on any file directory block inside the simulated local disk tree to inspect memory structures.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Autonomous Proactive System Journal */}
          {activeSubTab === 'proactive' && (
            <SystemJournal 
              lang={lang} 
              onAddSystemLog={(msg) => addLog(msg)}
              onModifyVirtualFile={handleModifyVirtualFile}
            />
          )}

          {/* 4. Incident Logger */}
          {activeSubTab === 'diagnostics' && (
            <div className="flex-1 bg-slate-950 border border-slate-900 rounded-lg overflow-hidden flex flex-col font-mono text-[10px] text-slate-300">
              <div className="p-2 border-b border-slate-900 bg-slate-900/20 text-[9px] uppercase font-bold text-orange-400 flex items-center justify-between select-none">
                <span>Core Diagnostics Monitoring Ledger</span>
                <span className="text-slate-500">Watching: EPERM, ENOTFOUND, EACCES failures</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-left h-full">
                {diagnosticsIncidents.length > 0 ? (
                  diagnosticsIncidents.map((inc, index) => {
                    const isError = inc.includes('[CRITICAL]') || inc.includes('[EPERM]') || inc.includes('[SEC_ALARM]');
                    const isHealth = inc.includes('[HEALING]') || inc.includes('[SUCCESS]');
                    return (
                      <div key={index} className={`pb-1 border-b border-slate-900/30 leading-normal ${
                        isError ? 'text-rose-400 font-bold' : isHealth ? 'text-emerald-400 font-semibold' : 'text-slate-350'
                      }`}>
                        {inc}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-600 italic">No warnings or incidents spawned inside daemon stack bounds.</p>
                )}
              </div>
            </div>
          )}

          {/* 5. Neora Architectural Framework Document Tab */}
          {activeSubTab === 'framework' && (
            <div id="neora-architecture-pane" className="flex-1 overflow-hidden flex flex-col bg-slate-950 border border-slate-900 rounded-lg">
              {/* Header block */}
              <div className="p-3 border-b border-slate-900 bg-slate-900/20 shrink-0 flex items-center justify-between select-none font-sans">
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] bg-teal-950/85 text-teal-400 border border-teal-900/40 px-1.5 py-0.2 rounded font-mono font-bold tracking-wider uppercase">
                      SPECIFICATION_v3.4
                    </span>
                    <span className="text-[8.5px] font-mono text-slate-500">CLASS-1 AUTONOMOUS PC CONTROL</span>
                  </div>
                  <h3 className="text-[11px] font-bold text-white uppercase mt-0.5 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-teal-400" />
                    <span>{lang === 'bn' ? 'নিওরা ওএস আর্কিটেকচারাল ফ্রেমওয়ার্ক' : 'NEORA COMPREHENSIVE ARCHITECTURAL BLUEPRINT'}</span>
                  </h3>
                </div>
                <span className="text-[9px] border border-teal-900/40 bg-teal-950/20 px-2 py-0.5 rounded text-teal-400 font-mono tracking-wider font-semibold uppercase">
                  HEURISTIC SAFE
                </span>
              </div>

              {/* Master layout split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left side: Navigation of pillars list */}
                <div className="w-1/3 border-r border-slate-900 bg-slate-955/20 flex flex-col p-2 space-y-1.5 overflow-y-auto font-sans">
                  <span className="text-[8px] font-mono text-slate-600 font-bold tracking-wider uppercase block select-none text-left pl-1">
                    {lang === 'bn' ? 'স্থাপত্য স্তম্ভসমূহ:' : 'ARCHITECTURAL PILLARS:'}
                  </span>
                  
                  <button
                    onClick={() => setSelectedArchPillar('perception')}
                    className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                      selectedArchPillar === 'perception'
                        ? 'border-cyan-500/45 bg-cyan-950/15 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.05)]'
                        : 'border-slate-900 bg-slate-950/40 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Cpu className={`w-3.5 h-3.5 ${selectedArchPillar === 'perception' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="text-[9.5px] font-bold uppercase tracking-wide">{lang === 'bn' ? '১. এনভায়রনমেন্ট পারসেপশন' : 'I. Perception Engine'}</span>
                    </div>
                    <p className="text-[8px] font-mono text-slate-500 line-clamp-2 leading-tight">
                      {lang === 'bn' ? 'স্ক্রিন কোঅর্ডিনেট, লেআউট ট্রি এবং ভয়েস লুপ' : 'Screen scanning, Accessibility tree mapping, audio buffer analysis.'}
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedArchPillar('execution')}
                    className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                      selectedArchPillar === 'execution'
                        ? 'border-teal-500/45 bg-teal-950/15 text-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.05)]'
                        : 'border-slate-900 bg-slate-950/40 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sliders className={`w-3.5 h-3.5 ${selectedArchPillar === 'execution' ? 'text-teal-400' : 'text-slate-500'}`} />
                      <span className="text-[9.5px] font-bold uppercase tracking-wide">{lang === 'bn' ? '২. ক্রিয়াকলাপ হ্যান্ডলার' : 'II. Execution Handler'}</span>
                    </div>
                    <p className="text-[8px] font-mono text-slate-500 line-clamp-2 leading-tight">
                      {lang === 'bn' ? 'মাল্টি-স্টেপ টাস্ক স্পনিং ও ওএস ইনপুট মকিং' : 'Atomic action staging, virtual cursor clicks, sandbox script executions.'}
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedArchPillar('resources')}
                    className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                      selectedArchPillar === 'resources'
                        ? 'border-amber-500/45 bg-amber-950/15 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.05)]'
                        : 'border-slate-900 bg-slate-950/40 hover:border-slate-800 text-slate-400 hover:text-slate-205'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Server className={`w-3.5 h-3.5 ${selectedArchPillar === 'resources' ? 'text-amber-500' : 'text-slate-500'}`} />
                      <span className="text-[9.5px] font-bold uppercase tracking-wide">{lang === 'bn' ? '৩. রিসোর্স বাজেট' : 'III. Resource Allocator'}</span>
                    </div>
                    <p className="text-[8px] font-mono text-slate-500 line-clamp-2 leading-tight">
                      {lang === 'bn' ? 'মেমরি হিপ ডিফ্র্যাগমেন্টেশন ও পোর্ট ৩০০০ বাফার' : 'GC compaction cycles, CPU throttle controls, EPERM lock preventions.'}
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedArchPillar('safety')}
                    className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                      selectedArchPillar === 'safety'
                        ? 'border-rose-500/45 bg-rose-950/15 text-rose-405 shadow-[0_0_8px_rgba(244,63,94,0.05)]'
                        : 'border-slate-900 bg-slate-950/40 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShieldCheck className={`w-3.5 h-3.5 ${selectedArchPillar === 'safety' ? 'text-rose-405' : 'text-slate-500'}`} />
                      <span className="text-[9.5px] font-bold uppercase tracking-wide">{lang === 'bn' ? '৪. পলিসি গার্ড' : 'IV. Policy Sandbox'}</span>
                    </div>
                    <p className="text-[8px] font-mono text-slate-500 line-clamp-2 leading-tight">
                      {lang === 'bn' ? 'সুরক্ষিত ফোল্ডার অবরুদ্ধকরণ ও ইন্টেগ্রিটি' : 'Safety heuristics, workspace confinement, tax compliance validations.'}
                    </p>
                  </button>

                  <div className="mt-auto bg-slate-900/30 border border-slate-900 p-2.5 rounded-md font-mono text-[8.2px] text-slate-500 select-none text-left leading-relaxed">
                    <strong>SYSTEM DEPLOYMENT:</strong><br />
                    Server maps automatically to Port 3000 inside reverse proxy containers. Do not modify port configurations.
                  </div>
                </div>

                {/* Right side: Detailed documentation details / simulators */}
                <div className="flex-1 bg-slate-950 p-4 overflow-y-auto text-left space-y-4 font-sans">
                  
                  {/* perception pillar info card */}
                  {selectedArchPillar === 'perception' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h4 className="text-[12px] font-bold text-white uppercase flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <span>{lang === 'bn' ? 'মডিউল ০১: স্ক্রিন ট্র্যাকিং সচেতনতা ও ভয়েস ক্যাপচার' : 'Module 01: Environmental Perception Core'}</span>
                        </h4>
                        <span className="text-[8px] bg-cyan-950 border border-cyan-900/60 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">
                          ACTIVE SCAN
                        </span>
                      </div>

                      <div className="space-y-2.5 text-[10.5px] text-slate-350 leading-relaxed">
                        <p>
                          {lang === 'bn' 
                            ? 'পরিবেশ সচেতনতা মডিউলটি ওএস সেশনের পরিবেশ বিশ্লেষণ করার মূল উৎস। এটি মূলত ২টি মূল সোর্সের সমন্বয়ে কাজ করে:'
                            : 'The Perception Framework is the sensory hub of Neora, allowing the agent to comprehend the virtual desk environment. It employs two coordinated ingest vectors:'}
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-slate-400">
                          <li>
                            <strong className="text-slate-200">OS Accessibility Trees crawler:</strong>{' '}
                            {lang === 'bn' ? 'এটি কম্পিউটারের গ্রাফিক্যাল ইউজার ইন্টারফেস (GUI) স্ক্রিন স্পেস থেকে সরাসরি টেক্সট এবং কন্ট্রোল আইডেন্টিটি নোড সমূহকে ট্র্যাক করে স্থানাঙ্ক ম্যাপ করে।'
                                           : 'Continuously queries the native window manager to extract focus elements, button shapes, text fields, and relative display coordinates for seamless cursor mappings.'}
                          </li>
                          <li>
                            <strong className="text-slate-200">Continuous Pitch Loop Audio Analyzer (Whisper Core):</strong>{' '}
                            {lang === 'bn' ? 'মাইক্রোফোন দিয়ে ব্যাকগ্রাউন্ড সাউন্ড বাফার পোলিং করে এবং "নিওরা" শব্দ শুনলেই ভয়েস ইন্টেন্ট পার্সার ট্র্যান্সক্রিপশন ট্রিগার সচল করে।'
                                           : 'Pools incoming audio buffers via Web Speech. Detects vocal wake word "Neora" and delegates prompt commands to the server-side Whisper API router.'}
                          </li>
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-900/35 border border-slate-900 rounded-lg space-y-2">
                        <span className="text-[8px] font-mono font-bold uppercase text-slate-500 block">SIMULATED ENVIRONMENTAL RESPONSE TRIGGERS:</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              addLog("⚡ [PERCEPTION] Triggered Accessibility element tree dump... 14 node targets cataloged.");
                              setVirtualFiles(prev => {
                                const exist = prev.find(f => f.name === 'perception_layer.json');
                                const content = JSON.stringify({
                                  status: "PERCEIVED",
                                  elements: [
                                    { id: "invoice_tab", type: "button", coords: [120, 480], active: true },
                                    { id: "vat_input", type: "textbox", value: "15% Corporate", coords: [240, 510] }
                                  ],
                                  timestamp: new Date().toISOString()
                                }, null, 2);
                                if (exist) {
                                  return prev.map(f => f.name === 'perception_layer.json' ? { ...f, content, size: `${content.length} B` } : f);
                                } else {
                                  return [...prev, {
                                    name: 'perception_layer.json',
                                    path: 'diagnostics/perception_layer.json',
                                    content,
                                    size: `${content.length} B`,
                                    updated: new Date().toLocaleTimeString(),
                                    type: 'kernel'
                                  }];
                                }
                              });
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-cyan-405 hover:text-white border border-slate-800 rounded font-mono text-[8px] cursor-pointer uppercase font-bold transition-colors"
                          >
                            Dump Accessibility coordinates tree
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* execution pillar info card */}
                  {selectedArchPillar === 'execution' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h4 className="text-[12px] font-bold text-white uppercase flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-teal-400" />
                          <span>{lang === 'bn' ? 'মডিউল ০২: মাল্টি-স্টেপ টাস্ক ড্রাইভ ও স্ক্রিপ্ট এক্সিকিউশন' : 'Module 02: Action Execution Control'}</span>
                        </h4>
                        <span className="text-[8px] bg-teal-950 border border-teal-900/60 text-teal-455 px-1.5 py-0.2 rounded font-mono font-bold">
                          SANDBOX RUNNING
                        </span>
                      </div>

                      <div className="space-y-2.5 text-[10.5px] text-slate-355 leading-relaxed">
                        <p>
                          {lang === 'bn' 
                            ? 'অ্যাকশন এক্সিকিউশন লেয়ারটি ব্যবহারকারীর উদ্দেশ্যকে ছোট ছোট ধাপে রূপান্তর করে সরাসরি টার্মিনাল ডিক্লারেটিভ নির্দেশাবলীর মাধ্যমে সম্পাদন করে:'
                            : 'The Action Execution Layer parses high-level intents formulated by the Cognitive Planner, outputting programmatic instructions to simulate direct human interventions:'}
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-slate-400">
                          <li>
                            <strong className="text-slate-200">Atomic Steps Formulator:</strong>{' '}
                            {lang === 'bn' ? 'জতিলে মাল্টি-ফেজ কর্মপরিকল্পনাকে বিচ্ছিন্ন স্বাধীন ধাপে ভাগ করে, যা থ্রেড হ্যাং হওয়া ব্যতিরেকে রান করতে পারে।'
                                           : 'Splits broad objectives into localized checkpoints (e.g. create asset HTML -> apply 15% VAT math -> stage commit in Git) supporting sequential retry capabilities.'}
                          </li>
                          <li>
                            <strong className="text-slate-200">OS Subprocess Isolation:</strong>{' '}
                            {lang === 'bn' ? 'সিস্টেম কমপাইল মেকানিজম বা প্যাকড স্ক্রিপ্ট চালানোর সময় tsx / esbuild সাবপ্রসেস কমান্ডগুলো সতর্কতার সাথে রান করে।'
                                           : 'Launches terminal operations within restricted system shells, blocking attempts to reach directories outside the immediate workspace.'}
                          </li>
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-900/35 border border-slate-900 rounded-lg space-y-2">
                        <span className="text-[8px] font-mono font-bold uppercase text-slate-500 block">EXPORTER SIMULATION TRIGGERS:</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              addLog("⚙️ [EXECUTION] Executing local compilation dry-run using tsx compiler... Bundle target built standalone safely.");
                              setVirtualFiles(prev => {
                                const exist = prev.find(f => f.name === 'dry_compilation_report.sys');
                                const content = `[EXECUTION RECONCILER REPORT]\nstatus=COMPILE_GREEN\nmodules_integrated=14\npdf_generator_link=active\nvat_validated=15%\ntimestamp=${new Date().toISOString()}`;
                                if (exist) {
                                  return prev.map(f => f.name === 'dry_compilation_report.sys' ? { ...f, content, size: `${content.length} B` } : f);
                                } else {
                                  return [...prev, {
                                    name: 'dry_compilation_report.sys',
                                    path: 'diagnostics/dry_compilation_report.sys',
                                    content,
                                    size: `${content.length} B`,
                                    updated: new Date().toLocaleTimeString(),
                                    type: 'kernel'
                                  }];
                                }
                              });
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-teal-400 hover:text-white border border-slate-800 rounded font-mono text-[8px] cursor-pointer uppercase font-bold transition-colors"
                          >
                            Trigger Dry-compile Test Subprocess
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* resources pillar info card */}
                  {selectedArchPillar === 'resources' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h4 className="text-[12px] font-bold text-white uppercase flex items-center gap-2">
                          <Server className="w-4 h-4 text-amber-500" />
                          <span>{lang === 'bn' ? 'মডিউল ০৩: রিসোর্স বাজেট বরাদ্দকরণ ও পোর্ট বাফারিং' : 'Module 03: Resource Allocation & Heap Management'}</span>
                        </h4>
                        <span className="text-[8px] bg-amber-950 border border-amber-900/60 text-amber-450 px-1.5 py-0.2 rounded font-mono font-bold">
                          ONLINE SPECS
                        </span>
                      </div>

                      <div className="space-y-2.5 text-[10.5px] text-slate-355 leading-relaxed">
                        <p>
                          {lang === 'bn' 
                            ? 'রিসোর্স বাজেট মডিউলটি ওএসের কর্মক্ষমতা ঠিক রেখে মেমরি লিকেজ ঠেকানো এবং পোর্ট বাইন্ডিং অক্ষুণ্ণ রাখার নিশ্চয়তা দেয়:'
                            : 'The Resource Allocation Hub ensures steady platform latency benchmarks and safeguards the network mapping boundaries defined by port configuration guidelines:'}
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-slate-400">
                          <li>
                            <strong className="text-slate-200">Memory Compaction:</strong>{' '}
                            {lang === 'bn' ? 'কগনিটিভ মেমরি হিপ নিয়মিত খালি করে অতিরিক্ত মেমরি ধারণ ক্ষমতা হ্রাস করে।'
                                           : 'Flushes redundant thread queues and compacts active database arrays, keeping the RAM footprint within optimal limits.'}
                          </li>
                          <li>
                            <strong className="text-slate-200">Port 3000 Ingress Safety:</strong>{' '}
                            {lang === 'bn' ? 'বিপরীত প্রক্সি (Reverse Proxy) সংযোগগুলো কঠোরভাবে এক্সক্লুসিভ পোর্ট ৩০০০ ম্যাপ করে যাতে বাইরের ট্র্যাফিক সুরক্ষিত থাকে।'
                                           : 'Locks the server binder precisely on port 3000, enforcing container standard ingress routes without duplicate port collisions.'}
                          </li>
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-900/35 border border-slate-900 rounded-lg space-y-2">
                        <span className="text-[8px] font-mono font-bold uppercase text-slate-500 block">RESOURCE MANAGEMENT CONTROLLERS:</span>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <span className="text-[8px] font-mono text-slate-400 block mb-1">Whisper STT Confidence Threshold:</span>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min="90" 
                                max="100" 
                                step="0.1" 
                                value={whisperConfidence} 
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setWhisperConfidence(val);
                                  addLog(`Modified local Whisper STT confidence threshold to ${val}%`);
                                }}
                                className="flex-1 accent-amber-500 h-1 rounded bg-slate-900 outline-none" 
                              />
                              <span className="text-[10px] text-amber-500 font-bold font-mono">{whisperConfidence}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* safety pillar info card */}
                  {selectedArchPillar === 'safety' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h4 className="text-[12px] font-bold text-white uppercase flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-rose-405" />
                          <span>{lang === 'bn' ? 'মডিউল ০৪: পলিসি স্যান্ডবক্স ও নিরাপত্তা ইন্টেগ্রিটি' : 'Module 04: Decision Policy & Safe Sandbox'}</span>
                        </h4>
                        <span className="text-[8px] bg-rose-950 border border-rose-900/60 text-rose-405 px-1.5 py-0.2 rounded font-mono font-bold">
                          STRICT POLICY
                        </span>
                      </div>

                      <div className="space-y-2.5 text-[10.5px] text-slate-355 leading-relaxed">
                        <p>
                          {lang === 'bn' 
                            ? 'পলিসি স্যান্ডবক্স গেটটি সিস্টেমের অনাকাঙ্ক্ষিত ক্ষয়ক্ষতি রোধে সব ধরনের রাইटिंग এবং মেমরি পরিবর্তনকে কনফিগার করা সীমানার মধ্যে ধরে রাখে:'
                            : 'The Policy Sandbox enforces the safety constraints required to block malicious filesystem corruption and maintain structural system bounds:'}
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-slate-400">
                          <li>
                            <strong className="text-slate-200">Anti-Write Lockout Safeguards:</strong>{' '}
                            {lang === 'bn' ? 'রুট ফোল্ডারে অননুমোদিত ফাইল তৈরি অবরুদ্ধ করে এবং শুধুমাত্র স্বৈরতান্ত্রিক অনুমতি সাপেক্ষে কোড মেইল মার্জ করতে সাহায্য করে।'
                                           : 'Validates file target routes before execution, ensuring that Neora cannot perform destructive writes to directories outside allowed workspace lanes.'}
                          </li>
                          <li>
                            <strong className="text-slate-200">Corporate Fiscal Alignment Rules:</strong>{' '}
                            {lang === 'bn' ? 'যেকোনো কর্পোরেট ট্যাক্স বিলিং ক্যালকুলেশনে সর্বদা সঠিক ১৫% ভ্যাট রুলস মেনে ডেটা সিঙ্ক সম্পন্ন করে।'
                                           : 'Guarantees any accounting or audit report output enforces strict corporate financial calculations, matching Shukria Printers standard rules.'}
                          </li>
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-900/35 border border-slate-900 rounded-lg space-y-2.5">
                        <span className="text-[8px] font-mono font-bold uppercase text-slate-500 block">ACTIVE HEURISTIC SAFETY SWITCHES:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setPolicies(prev => ({ ...prev, autoHeal: !prev.autoHeal }));
                              addLog(`User altered safety policy "autoHeal" to ${!policies.autoHeal}`);
                            }}
                            className={`p-1.5 rounded text-[8.5px] font-mono font-bold cursor-pointer border transition-colors ${
                              policies.autoHeal ? 'bg-rose-950/20 text-rose-400 border-rose-900/60' : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}
                          >
                            AUTO-HEALING WATCHDOG: {policies.autoHeal ? 'STRICT' : 'DISABLED'}
                          </button>
                          
                          <button
                            onClick={() => {
                              setPolicies(prev => ({ ...prev, preventWriteLockout: !prev.preventWriteLockout }));
                              addLog(`User altered safety policy "preventWriteLockout" to ${!policies.preventWriteLockout}`);
                            }}
                            className={`p-1.5 rounded text-[8.5px] font-mono font-bold cursor-pointer border transition-colors ${
                              policies.preventWriteLockout ? 'bg-rose-950/20 text-rose-450 border-rose-900/60' : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}
                          >
                            WRITE-GUARD: {policies.preventWriteLockout ? 'ENFORCED' : 'OFF'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
          </>
          )}

        </div>

        {/* ACTIVE PLANNER ACTION WORKSPACE FLOW */}
        {plan ? (
          <div className="bg-slate-900/10 border border-slate-900 rounded-lg p-3 space-y-2.5 shrink-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1 shrink-0 select-none">
              <h3 className="text-[10px] font-bold text-slate-305 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>📋 Active Action Planner Pipeline</span>
              </h3>
              <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                plan.status === 'completed' 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/25' 
                  : 'bg-cyan-950/40 text-cyan-400 border-cyan-500/25'
              }`}>
                STATUS: {plan.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[148px] overflow-y-auto pr-0.5">
              {plan.steps.map((st, idx) => (
                <div
                  key={st.id}
                  className={`p-2 bg-slate-950 border rounded-lg transition-all ${
                    st.status === 'completed' 
                      ? 'border-emerald-500/25 bg-emerald-950/5' 
                      : st.status === 'failed'
                      ? 'border-rose-500/40 bg-rose-950/10 animate-pulse'
                      : st.status === 'running'
                      ? 'border-cyan-400/50 bg-slate-900 shadow-[0_0_12px_rgba(6,182,212,0.03)]'
                      : 'border-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden mr-1">
                      <span className="w-4 h-4 shrink-0 font-mono text-[9px] bg-slate-900 rounded border border-slate-800 flex items-center justify-center text-slate-500">
                        {idx + 1}
                      </span>
                      <strong className="text-slate-105 text-[10px] font-sans font-semibold truncate leading-tight block">{st.title}</strong>
                    </div>
                    {st.status === 'completed' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : st.status === 'failed' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : st.status === 'running' ? (
                      <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0"></span>
                    )}
                  </div>
                  
                  <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-slate-550 border-t border-slate-900/40 pt-1">
                    <span>{st.kind.toUpperCase()}</span>
                    <span className="truncate max-w-[130px] font-medium" title={st.payload}>P: {st.payload}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRunWorkflow}
              disabled={isRunning || plan.status === 'completed'}
              className={`w-full py-2 font-bold transition-all rounded text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                plan.status === 'completed'
                  ? 'bg-emerald-500/5 text-emerald-500 border border-emerald-500/15 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_3px_10px_rgba(6,182,212,0.15)]'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>STEP WORKFLOW COMPILER EXECUTING...</span>
                </>
              ) : plan.status === 'completed' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>ENTIRE AUTONOMOUS PLAN SYNCED SUCCESSFULLY!</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>DISPATCH AGENT ACTION SEQUENCE (SELF-REPAIR MODE)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-550 border border-slate-900 border-dashed rounded-lg bg-slate-900/10 select-none pb-8">
            <Cpu className="w-8 h-8 text-slate-800 mb-1.5 animate-pulse" />
            <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">{lang === 'bn' ? 'অ্যাকশন প্ল্যান প্রত্যাশিত' : 'Awaiting Action Formulation'}</p>
            <p className="text-[9px] text-slate-600 max-w-xs mt-0.5">
              {lang === 'bn' ? 'কনসোলে আপনার উচ্চ-মানের উদ্দেশ্যগুলো ডিফাইন করুন এবং মাল্টি-এজেন্ট প্রসেস ম্যাপ করতে ফর্মুলেট বাটনে ক্লিক করুন।' : 'Define your high-level objectives in the controller input and click formulate to index safe multi-agent instructions vectors.'}
            </p>
          </div>
        )}

        {/* Real-time terminal ticker logs */}
        <div className="h-32 bg-slate-950 border border-slate-900 rounded-lg p-3 flex flex-col overflow-hidden shrink-0">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5 shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[9px] font-mono tracking-wider font-bold text-slate-400 uppercase">NEORA_K_AGENT_COGNITIVE_TRANSCRIPTS.LOG</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest hidden sm:inline">Active Thread: core-0</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            </div>
          </div>
          <div ref={logContainerRef} className="flex-1 overflow-y-auto font-mono text-[9.5px] text-slate-350 space-y-1 text-left select-text">
            {consoleLogs.length > 0 ? (
              consoleLogs.map((log, index) => (
                <div key={index} className="leading-snug text-slate-350">{log}</div>
              ))
            ) : (
              <span className="text-slate-650 italic">Core log console offline. Heartbeats, plan step actions, translation caching, disk file allocation processes will output live details here.</span>
            )}
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
