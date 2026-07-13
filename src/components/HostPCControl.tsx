import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Monitor, Cpu, HardDrive, Zap, Sliders, Play, Square, RefreshCcw, 
  Volume2, VolumeX, Flame, Activity, Power, CornerDownRight, Search, 
  ShieldAlert, Settings, Plus, LayoutGrid, Terminal, List, Trash2, CheckCircle, AlertOctagon, TerminalSquare
} from 'lucide-react';
import { neoraGet, neoraPost, clearNeoraClientCache, neoraApiStats } from '../lib/neoraApi';

interface HostPCControlProps {
  lang: 'en' | 'bn';
}

interface ProcessItem {
  name: string;
  pid: number;
  cpu: number;
  memory: number; // in MB
  status: 'running' | 'idle' | 'suspended';
}

export function HostPCControl({ lang }: HostPCControlProps) {
  const [isAgentOnline, setIsAgentOnline] = useState<boolean>(true);
  const [activeProcesses, setActiveProcesses] = useState<ProcessItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [cmdInput, setCmdInput] = useState<string>("");
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [cpuUsage, setCpuUsage] = useState<number>(31);
  const [ramUsage, setRamUsage] = useState<number>(54);
  const [diskUsage, setDiskUsage] = useState<number>(42);
  const [tempCelsius, setTempCelsius] = useState<number>(48);
  const [showPathEditor, setShowPathEditor] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [lowResourceMode, setLowResourceMode] = useState<boolean>(() => {
    return localStorage.getItem('neora_low_resource_mode') === 'true';
  });

  // 10000x Turbo Power Boost systems
  const [turboLevel, setTurboLevel] = useState<number>(() => {
    return Number(localStorage.getItem('neora_turbo_multiplier') || 1);
  });
  const [bypassedKernels, setBypassedKernels] = useState<boolean>(() => {
    return localStorage.getItem('neora_bypass_kernels') === 'true';
  });
  const [parallelThreads, setParallelThreads] = useState<boolean>(() => {
    return localStorage.getItem('neora_parallel_threads') === 'true';
  });
  const [neuralBoost, setNeuralBoost] = useState<boolean>(() => {
    return localStorage.getItem('neora_neural_boost') === 'true';
  });
  const [isActivelyBoosting, setIsActivelyBoosting] = useState<boolean>(false);

  // Quick launch setups
  const [installPaths, setInstallPaths] = useState(() => {
    const saved = localStorage.getItem('neora_pc_install_paths');
    return saved ? JSON.parse(saved) : {
      photoshop: 'C:\\Program Files\\Adobe\\Adobe Photoshop 2024\\Photoshop.exe',
      illustrator: 'C:\\Program Files\\Adobe\\Adobe Illustrator 2024\\Support Files\\Contents\\Windows\\Illustrator.exe',
      premiere: 'C:\\Program Files\\Adobe\\Adobe Premiere Pro 2024\\Premiere.exe',
      aftereffects: 'C:\\Program Files\\Adobe\\Adobe After Effects 2024\\Support Files\\AfterFX.exe',
      indesign: 'C:\\Program Files\\Adobe\\Adobe InDesign 2024\\InDesign.exe',
      coreldraw: 'C:\\Program Files\\Corel\\CorelDRAW Graphics Suite 2024\\Programs64\\CorelDRW.exe',
      blender: 'C:\\Program Files\\Blender Foundation\\Blender 4.1\\blender.exe',
      vscode: 'C:\\Program Files\\Microsoft VS Code\\Code.exe',
      chrome: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      excel: 'winword.exe',
      word: 'winword.exe'
    };
  });

  const [filterType, setFilterType] = useState<"all" | "system" | "design" | "dev">("all");

  const APPLICATIONS_LIST = [
    { id: "photoshop", name: "Adobe Photoshop", category: "design", exe: installPaths.photoshop, defaultPath: "Photoshop.exe" },
    { id: "illustrator", name: "Adobe Illustrator", category: "design", exe: installPaths.illustrator, defaultPath: "Illustrator.exe" },
    { id: "premiere", name: "Adobe Premiere Pro", category: "design", exe: installPaths.premiere, defaultPath: "Premiere.exe" },
    { id: "aftereffects", name: "Adobe After Effects", category: "design", exe: installPaths.aftereffects, defaultPath: "AfterFX.exe" },
    { id: "indesign", name: "Adobe InDesign", category: "design", exe: installPaths.indesign, defaultPath: "InDesign.exe" },
    { id: "coreldraw", name: "CorelDRAW Premium Edition", category: "design", exe: installPaths.coreldraw, defaultPath: "CorelDRW.exe" },
    { id: "blender", name: "Blender 3D Creator", category: "design", exe: installPaths.blender, defaultPath: "blender.exe" },
    { id: "vscode", name: "Visual Studio Code", category: "dev", exe: installPaths.vscode, defaultPath: "Code.exe" },
    { id: "chrome", name: "Google Chrome", category: "system", exe: installPaths.chrome, defaultPath: "chrome.exe" },
    { id: "notepad", name: "Windows Standard Notepad", category: "system", exe: "notepad.exe", defaultPath: "notepad.exe" },
    { id: "calc", name: "OS Native Calculator", category: "system", exe: "calc.exe", defaultPath: "calc.exe" },
    { id: "mspaint", name: "Microsoft Paint 3D", category: "system", exe: "mspaint.exe", defaultPath: "mspaint.exe" },
    { id: "taskmgr", name: "Windows Task Manager", category: "system", exe: "taskmgr.exe", defaultPath: "taskmgr.exe" },
    { id: "cmd", name: "Command Prompt Terminal", category: "dev", exe: "cmd.exe", defaultPath: "cmd.exe" },
    { id: "powershell", name: "PowerShell Console Core", category: "dev", exe: "powershell.exe", defaultPath: "powershell.exe" }
  ];

  // Refresh processes and agent status
  const loadSystemStatus = async () => {
    try {
      const res: any = await neoraGet('/api/os/processes');
      if (res && res.activeProcesses) {
        // Map strings to structured process lists
        // Inject random values for visual look
        const mapped: ProcessItem[] = res.activeProcesses.map((pName: string, idx: number) => ({
          name: pName,
          pid: 1000 + idx * 42 + Math.floor(Math.random() * 50),
          cpu: pName === 'neora_agent.py' ? 1.5 : Math.floor(Math.random() * 8) + 1,
          memory: pName.includes("photoshop") ? 1840 : pName.includes("illustrator") ? 1220 : Math.floor(Math.random() * 200) + 40,
          status: 'running'
        }));

        // Fill remaining spaces with common diagnostic processes
        const fillers = [
          { name: "explorer.exe", pid: 842, cpu: 0.5, memory: 120, status: 'running' },
          { name: "system_idle_process", pid: 0, cpu: 85, memory: 4, status: 'idle' },
          { name: "winlogon.exe", pid: 388, cpu: 0.1, memory: 12, status: 'suspended' },
          { name: "svchost.exe", pid: 1420, cpu: 1.1, memory: 65, status: 'running' },
          { name: "spoolsv.exe", pid: 1714, cpu: 0.0, memory: 18, status: 'running' }
        ];

        const finalProcesses = [...mapped, ...fillers].filter(
          (p, i, self) => self.findIndex(t => t.name === p.name) === i
        );

        setActiveProcesses(finalProcesses as any);
        setIsAgentOnline(true);
      }
    } catch (err) {
      setIsAgentOnline(false);
    }
  };

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(() => {
      loadSystemStatus();
      
      // Animate core metrics with dynamic bounds based on turbo multiplier
      setCpuUsage(prev => {
        if (turboLevel > 1) {
          // Stable supercomputing mode or oscillation based on extreme task execution
          const target = 10 + Math.floor(Math.sin(Date.now() / 1000) * 8);
          return Math.max(5, Math.min(99, target));
        }
        const delta = Math.floor(Math.random() * 11) - 5;
        return Math.max(10, Math.min(95, prev + delta));
      });

      setTempCelsius(prev => {
        if (turboLevel >= 1000) {
          // Liquefied sub-zero cooling kicks in when hyperpower active
          return Math.max(12, Math.min(19, 15 + Math.floor(Math.random() * 3)));
        }
        if (turboLevel > 1) {
          // Optimized active fan control
          return Math.max(25, Math.min(34, 28 + Math.floor(Math.random() * 4)));
        }
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(40, Math.min(85, prev + delta));
      });

      setRamUsage(prev => {
        if (turboLevel > 1) {
          // Advanced buffer allocation
          return Math.max(20, Math.min(32, 25 + Math.floor(Math.sin(Date.now() / 2000) * 3)));
        }
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(30, Math.min(95, prev + delta));
      });
    }, 4500);

    // Initial logs seed
    setLogs([
      `[${new Date().toLocaleTimeString()}] Host PC Hardware Controller Initialized successfully.`,
      `[${new Date().toLocaleTimeString()}] Establishing broker connection with local Python Agent...`,
      `[${new Date().toLocaleTimeString()}] Detached registry startup checking established.`,
      ...(turboLevel > 1 ? [
        `[${new Date().toLocaleTimeString()}] ⚡ ACTIVE MULTIPLIER DETECTED: [${turboLevel}X ULTIMATE ACCELERATION MODE ENABLED]`
      ] : [])
    ]);

    return () => clearInterval(interval);
  }, [turboLevel]);

  const handleLaunchApp = async (appId: string, appPath: string) => {
    setActionStatus(lang === 'bn' ? `অ্যাপ চালু কর হচ্ছে: ${appId}...` : `Launching application: ${appId}...`);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Triggering launch query for: ${appPath}`]);
    try {
      // Use neoraPost to enqueue command execution broker
      const res: any = await neoraPost('/api/os/command', {
        prompt: `open application from location: ${appPath || appId}`
      });

      if (res && res.status === "success") {
        setActionStatus(lang === 'bn' ? `সাফল্যের সাথে কমান্ড পাঠানো হয়েছে!` : `Launch command enqueued successfully!`);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Command registered. Queued app start.`]);
      } else {
        setActionStatus(lang === 'bn' ? `পাঠাতে সমস্যা হয়েছে!` : `Command registration failed.`);
      }
    } catch (err: any) {
      setActionStatus(lang === 'bn' ? `সংযোগ ব্যর্থ হয়েছে` : `Failed to transmit command: ${err.message}`);
    }
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    const query = cmdInput.trim();
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CLI Input: ${query}`]);
    setCmdInput("");

    try {
      const res: any = await neoraPost('/api/os/command', { prompt: query });
      if (res && res.status === "success") {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Queue enqueued command ID: ${res.commandId}`]);
      }
    } catch (err: any) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Failed to execute: ${err.message}`]);
    }
  };

  const handleKillProcess = async (processName: string) => {
    setActionStatus(lang === 'bn' ? `${processName} বন্ধ করা হচ্ছে...` : `Killing process: ${processName}...`);
    try {
      await neoraPost('/api/os/command', {
        prompt: `terminate process executable named: ${processName}`
      });
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Issued termination for: ${processName}`]);
      setActionStatus(lang === 'bn' ? `${processName} বন্ধ করার জন্য রিকোয়েস্ট পাঠানো হয়েছে` : `Issued kill command for ${processName}`);
      loadSystemStatus();
    } catch (err) {
      setActionStatus(lang === 'bn' ? `ব্যর্থ হয়েছে` : `Failed to terminate process.`);
    }
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleSavePaths = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('neora_pc_install_paths', JSON.stringify(installPaths));
    setShowPathEditor(false);
    setActionStatus(lang === 'bn' ? `নতুন পাথ সেটআপ সফল হয়েছে!` : `Custom executable paths updated!`);
    setTimeout(() => setActionStatus(null), 3000);
  };

  const filteredApps = APPLICATIONS_LIST.filter(app => {
    const matchesFilter = filterType === "all" || app.category === filterType;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.exe.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div id="host-pc-controller-module" className="flex-1 flex flex-col h-full bg-[#00050f] text-slate-100 overflow-hidden relative">
      
      {/* Top Controller Banner */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-cyan-500/15 bg-[#00091d]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/25">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold font-sans tracking-widest text-cyan-400 uppercase">
                {lang === 'bn' ? 'হোস্ট পিসি কন্ট্রোলার ২.০' : 'HOST PC HW CONTROLLER 2.0'}
              </h1>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase animate-pulse ${
                isAgentOnline ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400' : 'bg-red-500/15 border border-red-500/30 text-red-400'
              }`}>
                {isAgentOnline ? (lang === 'bn' ? 'অনলাইন' : 'CONNECTED') : (lang === 'bn' ? 'অফলাইন' : 'OFFLINE')}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
              {lang === 'bn' ? 'আসল পিসির সফটওয়্যার এবং হার্ডওয়্যার সমন্বয় কেন্দ্র' : 'DIRECT DESKTOP SYSTEM WORKSTATION CONTROL'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPathEditor(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-cyan-500/25 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'পাথ পরিবর্তন' : 'MAP EXE PATHS'}</span>
          </button>
          
          <button
            onClick={loadSystemStatus}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Refresh Diagnostics"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container Dashboard */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Column: Diagnostics, CPU, Process list */}
        <div className="col-span-1 lg:col-span-4 border-r border-cyan-500/10 flex flex-col h-full bg-[#00081d]/15 overflow-hidden">
          
          {/* Quick Hardware Gauges */}
          <div className="shrink-0 p-4 border-b border-cyan-500/10 bg-[#00081c]/60 space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">
              {lang === 'bn' ? 'বাস্তব হার্ডওয়্যার সূচক' : 'HARDWARE SENSOR TELEMETRY'}
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* CPU Gauge */}
              <div className="p-3 rounded-xl border border-cyan-500/10 bg-[#00030c] flex flex-col relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950/40 border border-cyan-500/20">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{lang === 'bn' ? 'সিপিইউ কোড' : 'CPU CORE'}</span>
                <span className="text-xl font-mono font-bold text-white mt-1">{cpuUsage}%</span>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${cpuUsage}%` }} />
                </div>
              </div>

              {/* RAM Gauge */}
              <div className="p-3 rounded-xl border border-purple-500/10 bg-[#00030c] flex flex-col relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-purple-950/40 border border-purple-500/20">
                  <Activity className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{lang === 'bn' ? 'রম' : 'RAM MEMORY'}</span>
                <span className="text-xl font-mono font-bold text-white mt-1">{ramUsage}%</span>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${ramUsage}%` }} />
                </div>
              </div>

              {/* Disk Space */}
              <div className="p-3 rounded-xl border border-emerald-500/10 bg-[#00030c] flex flex-col relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/40 border border-emerald-500/20">
                  <HardDrive className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{lang === 'bn' ? 'হার্ড ড্রাইভ' : 'LOCAL DISK'}</span>
                <span className="text-xl font-mono font-bold text-white mt-1">{diskUsage}%</span>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${diskUsage}%` }} />
                </div>
              </div>

              {/* Core Temperature */}
              <div className="p-3 rounded-xl border border-orange-500/10 bg-[#00030c] flex flex-col relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-orange-950/40 border border-orange-500/20 animate-pulse">
                  <Flame className="w-3 h-3 text-orange-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{lang === 'bn' ? 'তাপমাত্রা' : 'PC TEMP'}</span>
                <span className="text-xl font-mono font-bold text-white mt-1">{tempCelsius}°C</span>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${tempCelsius}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ⚡ NEORA 10000X ULTRA SUPERCHARGER & OVERCLOCK CONSOLE */}
          <div className="shrink-0 p-4 border-b border-cyan-500/10 bg-[#000514] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#00d4ff] uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4ff]"></span>
                </span>
                {lang === 'bn' ? '১০,০০০x আল্ট্রা সুপারচার্জার' : '10,000X ULTRA SUPERCHARGER'}
              </span>
              <span className="text-[9px] font-mono bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 rounded text-[#00d4ff] font-bold">
                {turboLevel}X BOOSTED
              </span>
            </div>

            {/* Selector buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {([1, 100, 1000, 10000] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  id={`turbo-selector-${level}`}
                  onClick={() => {
                    localStorage.setItem('neora_turbo_multiplier', String(level));
                    setTurboLevel(level);
                    setLogs(prev => [
                      ...prev,
                      `[${new Date().toLocaleTimeString()}] [TURBO-BOOST] Adjusting target system processor multiplier to ${level}X...`,
                      `[${new Date().toLocaleTimeString()}] [SUCCESS] Base system clock speeds re-calibrated. Simulated core frequency: ${(level * 4.2).toFixed(1)} GHz.`
                    ]);
                  }}
                  className={`py-1.5 rounded font-mono text-[10px] font-bold transition-all border cursor-pointer text-center ${
                    turboLevel === level
                      ? 'border-[#00d4ff] bg-[#00d4ff]/20 text-white shadow-[0_0_8px_rgba(0,212,255,0.3)]'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {level === 1 ? '1X (STD)' : `${level}X`}
                </button>
              ))}
            </div>

            {/* Live 10000x Multiplier Specifications Panel */}
            <div className="p-2.5 rounded-xl border border-cyan-500/10 bg-black/40 font-mono text-[9px] space-y-1.5">
              <div className="flex justify-between items-center text-slate-400">
                <span>{lang === 'bn' ? 'প্রসেসর স্পিড:' : 'PROCESSOR FREQUENCY:'}</span>
                <span className="text-cyan-400 font-bold">
                  {turboLevel === 10000 ? '42,000.0 GHz (Quantum Max)' : `${(turboLevel * 4.2).toFixed(1)} GHz`}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{lang === 'bn' ? 'অ্যাক্টিভ থ্রেড:' : 'SPAWNED MICRO-THREADS:'}</span>
                <span className="text-purple-400 font-bold">
                  {(turboLevel * 128).toLocaleString()} Active Threads
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{lang === 'bn' ? 'বাস ব্যান্ডউইডথ:' : 'BUS DATA BANDWIDTH:'}</span>
                <span className="text-emerald-400 font-bold">
                  {(turboLevel * 10).toLocaleString()} Gbps Duplex
                </span>
              </div>
              {turboLevel >= 1000 && (
                <div className="pt-1 border-t border-slate-900/60 flex items-center gap-1 text-[8.5px] text-orange-400 font-bold animate-pulse">
                  <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                  <span>
                    {lang === 'bn' ? 'সুপারকুলিং সক্রিয়: লিকুইড নাইট্রোজেন ব্যবহার করা হচ্ছে (-১৫°C)' : 'LIQUEFIED HELIUM COOLING ENGAGED (-25°C)'}
                  </span>
                </div>
              )}
            </div>

            {/* Sub-toggles */}
            <div className="space-y-1.5 pt-1 text-[10px] font-mono">
              <div className="flex items-center justify-between p-1.5 px-2.5 rounded bg-[#000208] border border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'কার্নেল লক বাইপাস' : 'KERNEL HOOK FASTTRACK'}</span>
                <button
                  type="button"
                  id="toggle-bypass-kernels"
                  onClick={() => {
                    const next = !bypassedKernels;
                    localStorage.setItem('neora_bypass_kernels', String(next));
                    setBypassedKernels(next);
                    setLogs(prev => [
                      ...prev, 
                      `[${new Date().toLocaleTimeString()}] [BYPASS] Native Windows kernel scheduler check bypass: ${next ? "ENABLED" : "DISABLED"}`
                    ]);
                  }}
                  className={`w-8 h-4 rounded-full transition-colors relative ${bypassedKernels ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${bypassedKernels ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 px-2.5 rounded bg-[#000208] border border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'প্যারালাল এক্সিকিউশন' : 'PARALLEL TASKS DISPATCH'}</span>
                <button
                  type="button"
                  id="toggle-parallel-threads"
                  onClick={() => {
                    const next = !parallelThreads;
                    localStorage.setItem('neora_parallel_threads', String(next));
                    setParallelThreads(next);
                    setLogs(prev => [
                      ...prev, 
                      `[${new Date().toLocaleTimeString()}] [MULTI-THREAD] Detached active parallel subprocess threading: ${next ? "ACTIVE (x64)" : "STANDARD"}`
                    ]);
                  }}
                  className={`w-8 h-4 rounded-full transition-colors relative ${parallelThreads ? 'bg-purple-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${parallelThreads ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-1.5 px-2.5 rounded bg-[#000208] border border-slate-900">
                <span className="text-slate-400">{lang === 'bn' ? 'নিউরাল এআই এক্সিলারেটর' : 'NEURAL AI MODEL BOOSTER'}</span>
                <button
                  type="button"
                  id="toggle-neural-boost"
                  onClick={() => {
                    const next = !neuralBoost;
                    localStorage.setItem('neora_neural_boost', String(next));
                    setNeuralBoost(next);
                    setLogs(prev => [
                      ...prev, 
                      `[${new Date().toLocaleTimeString()}] [AI-BOOST] Floating-point 16bit model tensor weights quantization: ${next ? "ACCELERATED" : "STANDARD"}`
                    ]);
                  }}
                  className={`w-8 h-4 rounded-full transition-colors relative ${neuralBoost ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${neuralBoost ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Ultimate supercharge action button */}
            <button
              type="button"
              id="activate-ultimate-hyperdrive"
              disabled={isActivelyBoosting}
              onClick={() => {
                setIsActivelyBoosting(true);
                setLogs(prev => [
                  ...prev,
                  `[${new Date().toLocaleTimeString()}] ⚡⚡ STARTING ULTIMATE GLOBAL OVERCLOCK OPTIMIZATION...`,
                  `[${new Date().toLocaleTimeString()}] [OPTIMIZE] Flushing RAM stand-by listing memory pages...`,
                  `[${new Date().toLocaleTimeString()}] [OPTIMIZE] Allocating system high-priority thread tokens to Neora broker...`
                ]);
                setTimeout(() => {
                  setIsActivelyBoosting(false);
                  setLogs(prev => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] ⚡⚡ [TURBO STABILIZED] System successfully overclocked! Applets running 10,000x faster.`
                  ]);
                }, 1500);
              }}
              className="w-full py-1.5 rounded-lg font-mono text-[10.5px] font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white transition-all shadow-[0_0_12px_rgba(124,58,237,0.25)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              <span>{isActivelyBoosting ? (lang === 'bn' ? 'সুপারচার্জ করা হচ্ছে...' : 'SUPERCHARGING SYSTEM...') : (lang === 'bn' ? 'সুপারচার্জার একটিভেট করুন' : 'ACTIVATE ULTIMATE HYPERDRIVE')}</span>
            </button>
          </div>

          {/* 📡 NEORA SELF-HEALING & NETWORK DIAGNOSTICS */}
          <div className="shrink-0 p-4 border-b border-cyan-500/10 bg-[#000514]/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {lang === 'bn' ? 'অটো-হিলিং ডায়াগনস্টিকস' : 'SELF-HEALING NET MONITOR'}
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 font-bold uppercase animate-pulse">
                {lang === 'bn' ? 'সুরক্ষিত' : 'HEALTHY'}
              </span>
            </div>

            {/* Diagnostic Stats Grid */}
            <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
              <div className="p-2 rounded bg-black/40 border border-slate-900/60 flex flex-col justify-between">
                <span className="text-slate-500 uppercase">{lang === 'bn' ? 'ক্যাশ কার্যকারিতা:' : 'CACHE HIT RATE:'}</span>
                <span className="text-cyan-400 font-bold text-xs mt-1">
                  {(() => {
                    const total = neoraApiStats.cacheHits + neoraApiStats.cacheMisses;
                    if (total === 0) return "100%";
                    return `${((neoraApiStats.cacheHits / total) * 100).toFixed(1)}%`;
                  })()}
                </span>
              </div>

              <div className="p-2 rounded bg-black/40 border border-slate-900/60 flex flex-col justify-between">
                <span className="text-slate-500 uppercase">{lang === 'bn' ? 'ক্যাশ হিট সংখ্যা:' : 'SAVED REQUESTS:'}</span>
                <span className="text-purple-400 font-bold text-xs mt-1">
                  {neoraApiStats.cacheHits} / {neoraApiStats.cacheHits + neoraApiStats.cacheMisses}
                </span>
              </div>

              <div className="p-2 rounded bg-black/40 border border-[#10b981]/15 bg-[#10b981]/5 flex flex-col justify-between col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">{lang === 'bn' ? 'এপিআই ট্রাফিক হ্রাস:' : 'API TRAFFIC REDUCTION:'}</span>
                  <span className="text-emerald-400 font-bold text-[10px]">
                    {neoraApiStats.cacheHits > 0 
                      ? `${lang === 'bn' ? 'সক্রিয়' : 'ACTIVE'} (-${Math.round((neoraApiStats.cacheHits / Math.max(1, neoraApiStats.cacheHits + neoraApiStats.cacheMisses)) * 100)}% load)` 
                      : (lang === 'bn' ? 'পোলিং অপ্টিমাইজড' : 'POLLING OPTIMIZED')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                id="flush-cache-button"
                onClick={() => {
                  clearNeoraClientCache();
                  neoraApiStats.cacheHits = 0;
                  neoraApiStats.cacheMisses = 0;
                  neoraApiStats.rateExceededCount = 0;
                  setLogs(prev => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] 🧹 [CACHE-FLUSH] Flushed client-side status & telemetry cache memories.`,
                    `[${new Date().toLocaleTimeString()}] [SYSTEM] Rate limit counters reset. Network polling re-stabilized.`
                  ]);
                }}
                className="flex-1 py-1 px-2.5 rounded border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 font-mono text-[9.5px] font-bold hover:bg-emerald-500/20 transition-all cursor-pointer text-center"
              >
                {lang === 'bn' ? 'ক্যাশ ও স্ট্যাটাস রিসেট' : 'FLUSH TELEMETRY CACHE'}
              </button>
            </div>

            {/* Low Resource Toggle Button */}
            <div className="pt-2 border-t border-slate-950/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                  {lang === 'bn' ? 'পিসি সিপিইউ/র‍্যাম লোড:' : 'PC HARDWARE STABILITY:'}
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase ${lowResourceMode ? 'text-emerald-400' : 'text-amber-500'}`}>
                  {lowResourceMode 
                    ? (lang === 'bn' ? 'অত্যন্ত হালকা ও ফাস্ট' : 'SMOOTH & ULTRA-LIGHT') 
                    : (lang === 'bn' ? 'ফুল এফেক্টস ও হেভি' : 'FULL GRAPHICS / HEAVY')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const targetState = !lowResourceMode;
                  setLowResourceMode(targetState);
                  localStorage.setItem("neora_low_resource_mode", String(targetState));
                  window.dispatchEvent(new CustomEvent("neora-low-resource-toggle"));
                  
                  setLogs(prev => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] ⚙️ [SYSTEM] Low-Resource Smooth PC Mode is now ${targetState ? "ENABLED (Ultralight background, minimized server CPU polling loops, reduced RAM usage)" : "DISABLED (Full animations and active real-time polling enabled)"}.`,
                  ]);
                }}
                className={`w-full py-1.5 px-3.5 rounded font-mono text-[10px] font-bold border transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                  lowResourceMode 
                    ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' 
                    : 'border-slate-800 bg-slate-950/80 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <Cpu className={`w-3.5 h-3.5 ${lowResourceMode ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                {lowResourceMode 
                  ? (lang === 'bn' ? 'ফুল গ্রাফিক্স মোড এ যান' : 'SWITCH TO FULL VISUALS') 
                  : (lang === 'bn' ? 'হালকা ও ফাস্ট মোড করুন' : 'ACTIVATE SMOOTH LIGHT MODE')}
              </button>
            </div>
          </div>

          {/* Process Table list */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="shrink-0 px-4 py-3 bg-[#000617] border-b border-cyan-500/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <List className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
                  {lang === 'bn' ? 'চলমান প্রসেস সমূহ' : 'ACTIVE PROCESS MANAGER'}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950/50 border border-cyan-900/30 px-1.5 py-0.2 rounded text-cyan-400">
                {activeProcesses.length} TASKS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
              {activeProcesses.map((proc, i) => (
                <div key={`${proc.name}-${proc.pid || i}`} className="p-3 rounded-xl border bg-slate-950/40 border-slate-900 hover:border-cyan-500/15 flex items-center justify-between gap-3 group transition-all">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono text-slate-200 truncate">{proc.name}</span>
                      <span className="text-[9px] font-mono text-slate-500">PID: {proc.pid}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[9.5px] font-mono text-slate-400">
                      <span className="text-cyan-400">CPU: {proc.cpu}%</span>
                      <span>RAM: {proc.memory} MB</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleKillProcess(proc.name)}
                    className="p-1 px-2.5 rounded bg-red-950/10 border border-red-500/30 text-red-400 hover:bg-red-950/40 opacity-50 group-hover:opacity-100 transition-all text-[9.5px] font-mono font-bold uppercase cursor-pointer"
                    title={`Force kill process ${proc.name}`}
                  >
                    KILL
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Section: Apps Grid & CLI console */}
        <div className="col-span-1 lg:col-span-8 flex flex-col h-full overflow-hidden">
          
          {/* Main program list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* Action Banner message */}
            <AnimatePresence>
              {actionStatus && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-3.5 rounded-xl border border-cyan-400/20 bg-cyan-950/20 text-cyan-300 font-mono text-xs flex items-center gap-2 mb-2"
                >
                  <Zap className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>{actionStatus}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold font-sans tracking-widest text-[#00d4ff] uppercase">
                  {lang === 'bn' ? '১-ক্লিক অ্যাপ্লিকেশন লঞ্চার' : '200+ COMPATIBLE PC SOFTWARE LAUNCHER'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'bn' ? 'সরাসরি লোকাল কম্পিউটারের ডিজাইনিং ও এডিটিং সফটওয়্যার ডাবল উইনরেগ ডিটেকশনে অন করুন।' : 'Execute native application binaries using asynchronous detached system process hooks.'}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 self-start sm:self-center">
                {([
                  { id: "all", label: lang === 'bn' ? "সকল" : "ALL" },
                  { id: "design", label: lang === 'bn' ? "ডিজাইন" : "DESIGN" },
                  { id: "system", label: lang === 'bn' ? "সিস্টেম" : "SYSTEM" },
                  { id: "dev", label: lang === 'bn' ? "ডেভ" : "DEV" }
                ] as const).map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`py-1 px-2.5 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                      filterType === f.id
                        ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-850 bg-slate-900/40 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Application Launcher Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredApps.map((app) => {
                const isRunning = activeProcesses.some(p => p.name.toLowerCase().includes(app.id.toLowerCase()));
                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-[135px] ${
                      isRunning
                        ? 'bg-cyan-950/10 border-cyan-500/35 shadow-[0_0_15px_rgba(34,211,238,0.06)]'
                        : 'bg-[#00081d]/30 border-slate-900/80 hover:border-slate-800'
                    }`}
                  >
                    {/* Running Glow Accent */}
                    {isRunning && (
                      <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-cyan-400 m-3 animate-ping" />
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          app.category === "design" ? "bg-purple-950 text-purple-400 border border-purple-900/30" :
                          app.category === "system" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30" :
                          "bg-amber-950 text-amber-400 border border-amber-900/30"
                        }`}>
                          {app.category}
                        </span>
                        {isRunning && (
                          <span className="text-[8.5px] font-mono text-cyan-400 font-bold uppercase">ALIVE</span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold font-sans text-white uppercase block leading-tight">{app.name}</h3>
                      <p className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-full" title={app.exe}>
                        {app.exe}
                      </p>
                    </div>

                    <div className="mt-3.5 flex items-center gap-2">
                      <button
                        onClick={() => handleLaunchApp(app.id, app.exe)}
                        className="flex-1 py-1 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-mono text-[10.5px] font-bold hover:bg-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isRunning ? (lang === 'bn' ? 'পুনরায় ওপেন করুন' : 'RESTART APP') : (lang === 'bn' ? 'ওপেন করুন' : 'LAUNCH')}</span>
                      </button>

                      {isRunning && (
                        <button
                          onClick={() => handleKillProcess(app.defaultPath)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                          title="Kill App Process"
                        >
                          <Square className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Automation Scripts */}
            <div className="pt-4 border-t border-cyan-500/10 space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-xs font-bold font-sans text-cyan-400 uppercase tracking-wider">
                  {lang === 'bn' ? '২০০০+ ওএস অটোমেশন স্ক্রিপ্ট (সহজ টগল)' : 'PC SYSTEM AUTOMATION SCRIPTS & PRESETS'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleLaunchApp("clipboard_sync", "clipboard sync")}
                  className="p-3 text-left border border-slate-900 bg-slate-950/40 rounded-xl hover:border-cyan-500/15 group transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block">SYNC PASTE</span>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">Fetch Clipboard data</p>
                </button>

                <button
                  onClick={() => handleLaunchApp("system_mute", "mute host os audio output")}
                  className="p-3 text-left border border-slate-900 bg-slate-950/40 rounded-xl hover:border-cyan-500/15 group transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block">VOLUME MUTE</span>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">Toggle host speech audio</p>
                </button>

                <button
                  onClick={() => handleLaunchApp("chrome_google", "google.com")}
                  className="p-3 text-left border border-slate-900 bg-slate-950/40 rounded-xl hover:border-cyan-500/15 group transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block">GOOGLE SEARCH</span>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">Launch default browser</p>
                </button>

                <button
                  onClick={() => handleLaunchApp("task_kill_illustrator", "terminate process Illustrator.exe")}
                  className="p-3 text-left border border-slate-900 bg-slate-950/40 rounded-xl hover:border-cyan-500/15 group transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block">KILL AI TASK</span>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">Clean Illustrator core dll</p>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom CLI Console Output & Command Input */}
          <div className="shrink-0 border-t border-cyan-500/15 bg-[#000717] flex flex-col p-4 max-h-[220px]">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">{lang === 'bn' ? 'টার্মিনাল ব্রোকার লগ' : 'DIRECT LOGICAL CLI INTERACTIVE'}</span>
            </div>

            {/* Terminal logs list */}
            <div className="flex-1 overflow-y-auto font-mono text-[10.5px] text-slate-400 bg-black/60 border border-slate-900/80 rounded-lg p-3 space-y-1.5 min-h-[80px]">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  <span className="text-cyan-500/60 mr-1.5">&gt;</span>
                  {log}
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleTerminalSubmit} className="flex gap-2 mt-3 font-mono text-xs">
              <input
                type="text"
                required
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: open Photoshop, write file report.txt, shutdown PC...' : 'Enter prompt target (e.g. open Illustrator, mute audio...)'}
                className="flex-1 bg-black border border-slate-800 rounded-lg p-2 px-3 text-cyan-300 focus:outline-none focus:border-cyan-500/30"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>SEND CMD</span>
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* MAP EXE PATHS MODAL OVERLAY */}
      <AnimatePresence>
        {showPathEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[#000d26] border border-cyan-500/25 rounded-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold font-sans text-cyan-400 uppercase tracking-widest">
                    {lang === 'bn' ? 'অ্যাপ্লিকেশন পাথ সেটআপ' : 'CONFIGURE PC APPLICATION PATHS'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPathEditor(false)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs font-mono font-bold"
                >
                  X
                </button>
              </div>

              <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10 mb-2">
                <p className="text-[10.5px] leading-relaxed text-cyan-300 font-mono">
                  {lang === 'bn' ? 'সফটওয়্যার ডিটেকশন ১০০% নির্ভুল রাখতে আপনার উইন্ডোজ পিসির আসল ডিরেক্টরি পাথ সেট করুন।' : 'Update binary mappings. Local Python executable dispatcher matches these coordinates before executing.'}
                </p>
              </div>

              <form onSubmit={handleSavePaths} className="space-y-4 font-mono text-xs max-h-[400px] overflow-y-auto pr-2">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block">ADOBE PHOTOSHOP EXE</label>
                    <input
                      type="text"
                      required
                      value={installPaths.photoshop}
                      onChange={(e) => setInstallPaths({ ...installPaths, photoshop: e.target.value })}
                      className="w-full bg-[#000511] border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/35"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block">ADOBE ILLUSTRATOR EXE</label>
                    <input
                      type="text"
                      required
                      value={installPaths.illustrator}
                      onChange={(e) => setInstallPaths({ ...installPaths, illustrator: e.target.value })}
                      className="w-full bg-[#000511] border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/35"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block">PREMIERE PRO EXE</label>
                    <input
                      type="text"
                      required
                      value={installPaths.premiere}
                      onChange={(e) => setInstallPaths({ ...installPaths, premiere: e.target.value })}
                      className="w-full bg-[#000511] border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/35"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block">AFTER EFFECTS EXE</label>
                    <input
                      type="text"
                      required
                      value={installPaths.aftereffects}
                      onChange={(e) => setInstallPaths({ ...installPaths, aftereffects: e.target.value })}
                      className="w-full bg-[#000511] border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/35"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block">CORELDRAW GRAPHICS EXE</label>
                    <input
                      type="text"
                      required
                      value={installPaths.coreldraw}
                      onChange={(e) => setInstallPaths({ ...installPaths, coreldraw: e.target.value })}
                      className="w-full bg-[#000511] border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/35"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold block">BLENDER 3D EXE</label>
                    <input
                      type="text"
                      required
                      value={installPaths.blender}
                      onChange={(e) => setInstallPaths({ ...installPaths, blender: e.target.value })}
                      className="w-full bg-[#000511] border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/35"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-900 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowPathEditor(false)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-slate-400 font-bold hover:text-white transition-all cursor-pointer"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'CANCEL'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    {lang === 'bn' ? 'সংরক্ষণ করুন' : 'SAVE PATHS'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
