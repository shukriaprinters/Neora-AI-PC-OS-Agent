import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Mic,
  MicOff,
  Play,
  Pause,
  CheckCircle,
  RefreshCw,
  Layers,
  Database,
  Sparkles,
  Sliders,
  Activity,
  HardDrive,
  Network,
  Lock,
  Shield,
  Check,
  AlertTriangle,
  History,
  Zap,
  Globe,
  Plus,
  Trash2
} from "lucide-react";

interface NeoraOSPortalProps {
  lang: string;
  geminiKey?: string;
}

export function NeoraOSPortal({ lang, geminiKey }: NeoraOSPortalProps) {
  // Real-time API metrics state
  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isAudited, setIsAudited] = useState(false);

  // Voice Assistant simulation states
  const [isListening, setIsListening] = useState(false);
  const [voiceLogs, setVoiceLogs] = useState<Array<{ text: string; sender: "user" | "neora"; timestamp: string }>>([
    { text: "Neora Active, listening to system commands.", sender: "neora", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [voiceQuery, setVoiceQuery] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Self-Evolution Gated System states
  const [proposals, setProposals] = useState([
    {
      id: "prop-1",
      title: "Consolidate Semantic Fallbacks",
      details: "Auto-detect and reroute embedding rate-limiting directly to local TF-IDF cosine similarity calculations.",
      risk: "Low",
      impacted: ["src/lib/neoraSemanticIndexer.ts"],
      status: "pending"
    },
    {
      id: "prop-2",
      title: "Cluster Synced Shared Filesystems",
      details: "Set up asynchronous peer-to-peer file synchronization between sandbox overlays and container boundaries.",
      risk: "Medium",
      impacted: ["server.ts", "src/lib/neoraEnvironmentLayer.ts"],
      status: "pending"
    },
    {
      id: "prop-3",
      title: "Inject Live Soundwave Audio Drivers",
      details: "Compile WebAudio API browser listeners to automatically feed visualizers with dynamic system latency frequencies.",
      risk: "Low",
      impacted: ["src/components/NeoraOSPortal.tsx"],
      status: "pending"
    }
  ]);

  // Hybrid Routing controls
  const [localLlmRatio, setLocalLlmRatio] = useState(70); // 70% Local, 30% Cloud

  // Automation Packs states
  const [automations, setAutomations] = useState([
    { id: "auto-1", title: "Daily Durable State Cloud Backup", cron: "0 0 * * *", category: "Database", isEnabled: true },
    { id: "auto-2", title: "Continuous Codebase Health Sweep", cron: "*/10 * * * *", category: "Optimizer", isEnabled: true },
    { id: "auto-3", title: "Sandbox Security Rules Audit", cron: "0 */12 * * *", category: "Kernel", isEnabled: false }
  ]);
  const [newAutoTitle, setNewAutoTitle] = useState("");
  const [newAutoCron, setNewAutoCron] = useState("*/5 * * * *");
  const [newAutoCat, setNewAutoCat] = useState("Kernel");

  // Fetch capability report
  const fetchCapabilityReport = async () => {
    setLoadingReport(true);
    try {
      const response = await fetch("/api/neora/project-capability-report");
      const data = await response.json();
      if (data.success) {
        setReport(data);
        setIsAudited(true);
      }
    } catch (e) {
      console.error("Failed to load project capability report:", e);
    } finally {
      setLoadingReport(false);
    }
  };

  // Soundwave Animation simulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 400;
    let height = canvas.height = 70;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        width = canvas.width;
      }
    };
    window.addEventListener("resize", handleResize);

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1.5;

      const lines = isListening ? 5 : 2;
      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        const amplitude = isListening ? (15 - i * 2) * (Math.sin(phase * 2) * 0.4 + 0.6) : 3;
        const speed = 0.05 + i * 0.01;
        
        // Colors from cyan to deep blue
        const hue = 180 + i * 15;
        ctx.strokeStyle = `hsla(${hue}, 90%, 55%, ${isListening ? 0.8 - i * 0.15 : 0.25})`;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.015 + phase + i) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += isListening ? 0.15 : 0.02;
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isListening]);

  // Voice Query submission
  const handleVoiceCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuery.trim()) return;

    const userMsg = voiceQuery.trim();
    setVoiceLogs(prev => [
      ...prev,
      { text: userMsg, sender: "user", timestamp: new Date().toLocaleTimeString() }
    ]);
    setVoiceQuery("");

    // Simulate Neora responses based on keywords
    setTimeout(() => {
      let neoraResp = "System command categorized. Initializing pipeline...";
      if (userMsg.toLowerCase().includes("audit") || userMsg.toLowerCase().includes("scan")) {
        neoraResp = "Initiating Phase 0 Project Inspection. Analyzing local codebase files, directory tree structure, and available services...";
        fetchCapabilityReport();
      } else if (userMsg.toLowerCase().includes("evolution") || userMsg.toLowerCase().includes("approve")) {
        neoraResp = "Verifying safety gates... Self-evolution proposal authorized and compiled into sandbox production.";
        setProposals(prev => prev.map(p => ({ ...p, status: "approved" })));
      } else if (userMsg.toLowerCase().includes("backup") || userMsg.toLowerCase().includes("cloud")) {
        neoraResp = "Durable State Cloud sync active. Firebase Firestore database boundaries validated.";
      }

      setVoiceLogs(prev => [
        ...prev,
        { text: neoraResp, sender: "neora", timestamp: new Date().toLocaleTimeString() }
      ]);
    }, 1000);
  };

  // Add automation task
  const handleAddAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAutoTitle.trim()) return;

    setAutomations(prev => [
      ...prev,
      {
        id: `auto-${Date.now()}`,
        title: newAutoTitle,
        cron: newAutoCron,
        category: newAutoCat,
        isEnabled: true
      }
    ]);
    setNewAutoTitle("");
  };

  // Toggle automation active state
  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
  };

  // Delete automation task
  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-5 pr-1 font-mono text-xs">
      {/* 1. Header Banner */}
      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
              Neora AI OS Enterprise Kernel Portal
              <span className="text-[8.5px] font-extrabold text-cyan-400 bg-cyan-950/50 border border-cyan-500/25 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                v2.0
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Unified control center managing Core Kernel layers, Self-Evolution pipelines, and Dynamic Capabilities audits.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchCapabilityReport}
            className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/25 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: loadingReport ? "2s" : "0s" }} />
            {loadingReport ? "Running Scan..." : "Inspect & Verify Project"}
          </button>
        </div>
      </div>

      {/* 2. Three Permanent Layers Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Layer 1: Core Kernel */}
        <div className="bg-[#0b0e14]/50 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[10.5px] font-bold uppercase text-rose-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-400" /> Layer 1: Core Kernel
            </span>
            <span className="text-[8px] bg-rose-950/40 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
              Secure
            </span>
          </div>
          
          <p className="text-[9.5px] text-slate-500 italic">
            Never modified automatically. Controls low-level execution sandboxes, workflow logic, and model routers.
          </p>

          <div className="flex flex-col gap-2 mt-1">
            {[
              { name: "Execution Coordinator Engine", status: "Active", icon: Activity, desc: "Schedules low-level task compilation" },
              { name: "Durable Memory & State Sync", status: "Synchronized", icon: Database, desc: "Handles local-file and Firestore state store" },
              { name: "Permission and Security Filter", status: "Enforced", icon: Lock, desc: "Monitors filesystem and execution limits" },
              { name: "Model Inference Routing System", status: "Standby", icon: Network, desc: "Swaps cloud model queries to local engines" }
            ].map(mod => (
              <div key={mod.name} className="p-2 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between text-[10px]">
                <div className="flex gap-2 items-center">
                  <mod.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block">{mod.name}</span>
                    <span className="text-[8.5px] text-slate-500">{mod.desc}</span>
                  </div>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded uppercase shrink-0">
                  {mod.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 2: Extension Layer */}
        <div className="bg-[#0b0e14]/50 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[10.5px] font-bold uppercase text-purple-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Layer 2: Extension Layer
            </span>
            <span className="text-[8px] bg-purple-950/40 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
              Modular
            </span>
          </div>

          <p className="text-[9.5px] text-slate-500 italic">
            User-approved evolution packs, tool plugins, external adapters, and custom voice system packs.
          </p>

          <div className="flex flex-col gap-2 mt-1">
            {[
              { name: "Custom Tool Plugins & Commands", isEnabled: true, desc: "Integrates standard shell tool execution" },
              { name: "Multi-Agent Team Orchestration", isEnabled: true, desc: "Coordinates complex planning behaviors" },
              { name: "Voice-First Transcription Drivers", isEnabled: false, desc: "Offline speech recognition drivers" },
              { name: "External Database Connectors", isEnabled: true, desc: "Proxies queries to persistent databases" }
            ].map(ext => (
              <div key={ext.name} className="p-2 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between text-[10px]">
                <div className="flex gap-2 items-center">
                  <div className={`w-1.5 h-1.5 rounded-full ${ext.isEnabled ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
                  <div>
                    <span className="font-bold text-slate-200 block">{ext.name}</span>
                    <span className="text-[8.5px] text-slate-500">{ext.desc}</span>
                  </div>
                </div>
                <button
                  onClick={() => {}}
                  className={`px-2 py-0.5 text-[8.5px] font-bold rounded cursor-pointer border ${
                    ext.isEnabled ? "bg-cyan-950/40 border-cyan-500/20 text-cyan-300" : "bg-slate-900 border-slate-800 text-slate-500"
                  }`}
                >
                  {ext.isEnabled ? "Active" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Layer 3: Intelligence Layer */}
        <div className="bg-[#0b0e14]/50 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[10.5px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Layer 3: Intelligence Layer
            </span>
            <span className="text-[8px] bg-amber-950/40 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
              Adaptive
            </span>
          </div>

          <p className="text-[9.5px] text-slate-500 italic">
            Continuous learning engine holding developer profile, pattern dictionaries, and semantic vector indexes.
          </p>

          <div className="flex flex-col gap-2 mt-1">
            {[
              { name: "Dynamic Prompt Optimizer Engine", info: "89% efficiency", desc: "Refactors shorthand user prompts" },
              { name: "Adaptive Knowledge Graph", info: "7 index fields", desc: "Maps code semantic representation vectors" },
              { name: "Success/Failure Experience Log", info: "Continuous", desc: "Builds logs of verified developer outcomes" },
              { name: "Predictive Risk Estimator Engine", info: "Gated", desc: "Analyzes file safety risk ratings before edits" }
            ].map(intel => (
              <div key={intel.name} className="p-2 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between text-[10px]">
                <div>
                  <span className="font-bold text-slate-200 block">{intel.name}</span>
                  <span className="text-[8.5px] text-slate-500 block">{intel.desc}</span>
                </div>
                <span className="text-[8px] font-bold text-amber-300 bg-amber-950/30 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">
                  {intel.info}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Voice-First OS Simulation & Automation Packs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Voice OS Simulation Panel */}
        <div className="bg-[#0b0e14]/50 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-[10.5px] font-bold text-slate-200 flex items-center gap-1.5 uppercase">
              <Mic className="w-4 h-4 text-cyan-400 animate-pulse" /> AI Voice-First OS Interface
            </span>
            <span className="text-[8.5px] text-cyan-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
              {isListening ? "Dynamic Listening" : "Standby PTT"}
            </span>
          </div>

          <p className="text-[9.5px] text-slate-500">
            Voice is the primary interface for rapid command dispatches. Trigger actions by speaking or typing command queries.
          </p>

          {/* Soundwave wave visualizer canvas */}
          <div className="bg-black/80 border border-slate-900 p-2 rounded-xl flex flex-col items-center justify-center relative">
            <canvas ref={canvasRef} className="w-full h-[60px]" />
            <span className="absolute bottom-1 right-2 text-[8px] text-slate-600 uppercase font-mono">
              Visual Latency Frequency Wave
            </span>
          </div>

          <div className="flex gap-2 justify-center my-1">
            <button
              onClick={() => setIsListening(!isListening)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                isListening
                  ? "bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25"
                  : "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20"
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isListening ? "Mute Microphone" : "Activate Microphone"}
            </button>
            <button
              onClick={() => {
                setVoiceLogs([
                  { text: "System logs flushed. Listening again...", sender: "neora", timestamp: new Date().toLocaleTimeString() }
                ]);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-xl text-[10px] text-slate-400 cursor-pointer transition-all"
            >
              Clear Feed
            </button>
          </div>

          {/* Feed Logs */}
          <div className="bg-black/60 border border-slate-900 rounded-xl p-3 flex flex-col gap-2 h-[150px] overflow-y-auto font-mono text-[9.5px]">
            {voiceLogs.map((log, idx) => (
              <div key={idx} className={`flex flex-col ${log.sender === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 mb-0.5">
                  <span>{log.sender === "user" ? "DEVELOPER" : "NEORA OS"}</span>
                  <span>•</span>
                  <span>{log.timestamp}</span>
                </div>
                <div
                  className={`p-2 rounded-xl max-w-[85%] leading-relaxed ${
                    log.sender === "user"
                      ? "bg-cyan-950/40 border border-cyan-500/15 text-cyan-200"
                      : "bg-slate-900/60 border border-slate-850 text-slate-300"
                  }`}
                >
                  {log.text}
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Dispatch Form */}
          <form onSubmit={handleVoiceCommand} className="flex gap-2 mt-1">
            <input
              type="text"
              value={voiceQuery}
              onChange={(e) => setVoiceQuery(e.target.value)}
              placeholder="Speak or type: 'Run full security audit'..."
              className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-cyan-500/40"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:text-white rounded-xl text-[10px] font-bold cursor-pointer transition-all"
            >
              Send
            </button>
          </form>
        </div>

        {/* Automation Packs & Hybrid Processing Sliders */}
        <div className="bg-[#0b0e14]/50 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[10.5px] font-bold text-slate-200 flex items-center gap-1.5 uppercase">
              <Database className="w-4 h-4 text-purple-400" /> Automation & Model Orchestration
            </span>
            <span className="text-[8.5px] text-slate-500">Scheduler Daemon</span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Local vs Cloud LLM ratio */}
            <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-300 uppercase">Hybrid Processing Allocation</span>
                <span className="text-cyan-400 font-extrabold">{localLlmRatio}% Local • {100 - localLlmRatio}% Cloud</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={localLlmRatio}
                onChange={(e) => setLocalLlmRatio(Number(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[8.5px] text-slate-500 italic">
                Saves cost by compiling simple logic queries locally and routing massive context jobs to Cloud API.
              </p>
            </div>

            {/* Automation Packs List */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-bold uppercase text-slate-400">Scheduled Automation Packs</span>
              </div>

              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {automations.map(auto => (
                  <div key={auto.id} className="p-2 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between text-[10px]">
                    <div className="flex gap-2 items-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${auto.isEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200">{auto.title}</span>
                          <span className="text-[8px] bg-slate-900 text-slate-500 border border-slate-800 px-1 rounded">{auto.cron}</span>
                        </div>
                        <span className="text-[8.5px] text-slate-500 font-mono italic">Task Category: {auto.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleAutomation(auto.id)}
                        className={`px-1.5 py-0.5 rounded text-[8.5px] cursor-pointer border ${
                          auto.isEnabled ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500"
                        }`}
                      >
                        {auto.isEnabled ? "On" : "Off"}
                      </button>
                      <button
                        onClick={() => deleteAutomation(auto.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add automation scheduler form */}
              <form onSubmit={handleAddAutomation} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                <input
                  type="text"
                  value={newAutoTitle}
                  onChange={(e) => setNewAutoTitle(e.target.value)}
                  placeholder="Backup logs task name..."
                  className="sm:col-span-2 bg-slate-950 border border-slate-900 rounded-xl px-2.5 py-1 text-[9.5px] text-slate-200 outline-none"
                />
                <button
                  type="submit"
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/25 rounded-xl px-2.5 py-1 text-[9.5px] font-bold cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Scheduled Pack
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Project Inspection Report & Self-Evolution Control Gated System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Capability Report Scanner Output */}
        <div className="bg-[#0b0e14]/50 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[10.5px] font-bold text-slate-200 flex items-center gap-1.5 uppercase">
              <HardDrive className="w-4 h-4 text-cyan-400" /> Project Capability Audit Report
            </span>
            <span className="text-[8.5px] text-slate-500">Live Workspace Status</span>
          </div>

          <p className="text-[9.5px] text-slate-500">
            Click 'Inspect & Verify Project' to scan the live directory structure, detect APIs, count code lines, and verify Firebase states.
          </p>

          <AnimatePresence mode="wait">
            {!isAudited ? (
              <motion.div
                key="audit-fallback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-500 italic gap-2"
              >
                <AlertTriangle className="w-6 h-6 text-slate-600" />
                <span>No active audit loaded. Click inspect to trigger a live file scanner sweep.</span>
              </motion.div>
            ) : (
              <motion.div
                key="audit-report"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 font-mono text-[9.5px]"
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Total Code Files</span>
                    <span className="text-cyan-300 font-extrabold text-xs">{report?.metrics?.totalFiles} files</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Total Code Lines</span>
                    <span className="text-cyan-300 font-extrabold text-xs">{report?.metrics?.totalCodeLines} lines</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Components Count</span>
                    <span className="text-cyan-300 font-extrabold text-xs">{report?.metrics?.componentsCount} modules</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Active APIs Routings</span>
                    <span className="text-cyan-300 font-extrabold text-xs">{report?.metrics?.apiRoutesCount} endpoints</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Engine Memory Used</span>
                    <span className="text-cyan-300 font-extrabold text-xs">{report?.systemInfo?.memoryUsageMb} MB</span>
                  </div>
                  <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                    <span className="text-slate-500 block uppercase font-bold text-[8.5px]">Sandbox Database</span>
                    <span className="text-cyan-300 font-extrabold text-xs">
                      {report?.infrastructure?.hasFirebase ? "Firebase Live" : "Local Flat DB"}
                    </span>
                  </div>
                </div>

                {/* Sub-lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-400 uppercase text-[8.5px]">Discovered OS UI Components:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {report?.componentsList?.slice(0, 10).map((comp: string) => (
                        <span key={comp} className="px-1.5 py-0.5 bg-slate-950 border border-slate-900 rounded text-slate-300 text-[8.5px]">
                          {comp}
                        </span>
                      ))}
                      {report?.componentsList?.length > 10 && (
                        <span className="text-slate-500 italic px-1.5 py-0.5">+ {report.componentsList.length - 10} more</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-400 uppercase text-[8.5px]">Reused Core Modules:</span>
                    <div className="flex flex-col gap-0.5 mt-1 text-slate-500 leading-normal">
                      {report?.reusedCoreModules?.map((mod: string, idx: number) => (
                        <span key={idx} className="flex items-center gap-1 text-[8.5px]">
                          <CheckCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="text-slate-400">{mod}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-[8px] text-slate-500">
                  <span>SWEEP TIMESTAMP: {new Date(report?.timestamp).toLocaleString()}</span>
                  <span>SYSTEM TARGET: {report?.systemInfo?.platform} Node v{report?.systemInfo?.nodeVersion}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Self-Evolution Gated System (Safety Gate Control Panel) */}
        <div className="bg-[#0b0e14]/50 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <span className="text-[10.5px] font-bold text-slate-200 flex items-center gap-1.5 uppercase">
              <Shield className="w-4 h-4 text-emerald-400" /> Self-Evolution Safety Authorization Gate
            </span>
            <span className="text-[8.5px] text-emerald-400 flex items-center gap-1 font-extrabold uppercase">
              🛡️ Enforced Gate
            </span>
          </div>

          <p className="text-[9.5px] text-slate-500">
            Neora learns patterns automatically. Uncontrolled self-modification is strictly forbidden. Developers must manually authorize structural updates.
          </p>

          {/* Proposals feed */}
          <div className="flex flex-col gap-2 flex-1 max-h-[180px] overflow-y-auto pr-1">
            {proposals.map(prop => (
              <div key={prop.id} className="p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[10px]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-200 leading-normal block">{prop.title}</span>
                    <span className="text-[8.5px] text-slate-500 block mt-0.5">{prop.details}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className={`text-[8px] font-black uppercase px-1 rounded ${
                      prop.risk === "High" ? "bg-rose-950 text-rose-400" :
                      prop.risk === "Medium" ? "bg-amber-950 text-amber-400" : "bg-emerald-950 text-emerald-400"
                    }`}>
                      {prop.risk} Risk
                    </span>
                    <span className={`text-[8.5px] ${prop.status === "approved" ? "text-emerald-400 font-bold" : "text-slate-500 italic"}`}>
                      {prop.status === "approved" ? "Authorized" : "Awaiting Guard"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900 pt-1.5 mt-1 text-[8.5px] text-slate-400">
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-slate-600 uppercase font-bold">Scope:</span>
                    {prop.impacted.map(file => (
                      <span key={file} className="bg-slate-900 px-1 border border-slate-850 rounded">{file}</span>
                    ))}
                  </div>
                  {prop.status !== "approved" && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setProposals(prev => prev.map(p => p.id === prop.id ? { ...p, status: "approved" } : p));
                        }}
                        className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white border border-emerald-500/25 rounded cursor-pointer transition-all font-bold"
                      >
                        Authorize
                      </button>
                      <button
                        onClick={() => {
                          setProposals(prev => prev.filter(p => p.id !== prop.id));
                        }}
                        className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/25 rounded cursor-pointer transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
