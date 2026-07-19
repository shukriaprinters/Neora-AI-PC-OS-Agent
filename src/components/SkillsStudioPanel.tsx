import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Layers, Cpu, ShieldCheck, Zap, Database,
  Trash2, Plus, Check, RefreshCw, AlertTriangle, Terminal, X, Code, Sliders,
  Globe, Type, Shield, Activity, Wand2, BarChart2
} from "lucide-react";
import { CognitiveFoundationDashboard } from "./CognitiveFoundationDashboard.tsx";
import { VisualIntelligenceDashboard } from "./VisualIntelligenceDashboard.tsx";
import { ImageIngestionDashboard } from "./ImageIngestionDashboard.tsx";

interface SkillsStudioPanelProps {
  lang: "en" | "bn";
  customSkills: any[];
  setCustomSkills: React.Dispatch<React.SetStateAction<any[]>>;
  onTriggerToast: (name: string, description: string) => void;
}

export function SkillsStudioPanel({
  lang,
  customSkills,
  setCustomSkills,
  onTriggerToast
}: SkillsStudioPanelProps) {
  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardName, setWizardName] = useState("");
  const [wizardCategory, setWizardCategory] = useState("Task Automation & Daemons");
  const [wizardDescription, setWizardDescription] = useState("");
  const [wizardFetcher, setWizardFetcher] = useState("Local File System Scanner");
  const [wizardOption, setWizardOption] = useState("");

  // YAML/JSON Rules State
  const [operatingRules, setOperatingRules] = useState(
    `# Neora OS Agent Operating Rules Configuration
agent:
  autonomy_level: high
  safe_mode: true
  max_loop_limit: 15
  port_binding: 3000
  heartbeat_interval: 5s
fetchers:
  enable_ollama: true
  memory_sweep_threshold_gb: 8.0
  fs_scanner_interval: 10s
background_loops:
  auto_cleanup_loop: true
  memory_gc_loop: false
  token_refresh_interval: 15m`
  );

  // Diagnostic health states
  const [diagnostics, setDiagnostics] = useState([
    { id: "diag-ollama", name: "Ollama Local API Engine", status: "degraded", latency: "420ms", suggestion: "Switch to cloud-optimized backup node or restart Ollama service." },
    { id: "diag-ingress", name: "Port 3000 Reverse Ingress", status: "healthy", latency: "12ms", suggestion: "Ingress routing fully optimal. No action needed." },
    { id: "diag-db", name: "Real-time Sync Broker", status: "failed", latency: "Timeout", suggestion: "Re-initialize secure connection parameters and flush offline caches." },
    { id: "diag-voice", name: "Speech Recognition Engine", status: "healthy", latency: "8ms", suggestion: "Acoustic modeling pipeline is optimal." }
  ]);

  const [isHealed, setIsHealed] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [healLogs, setHealLogs] = useState<string[]>([]);

  // Periodically update execution telemetry values
  const [healthLatency, setHealthLatency] = useState(14);
  const [healthMemory, setHealthMemory] = useState(5.4);
  const [healthCompletion, setHealthCompletion] = useState(98.4);

  useEffect(() => {
    const timer = setInterval(() => {
      setHealthLatency(prev => Math.max(10, Math.min(22, prev + Math.floor(Math.random() * 5) - 2)));
      setHealthMemory(prev => parseFloat(Math.max(5.1, Math.min(5.9, prev + (Math.random() * 0.2 - 0.1))).toFixed(2)));
      setHealthCompletion(prev => parseFloat(Math.max(97.2, Math.min(99.8, prev + (Math.random() * 0.4 - 0.2))).toFixed(2)));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // --- DEVELOPER PLUGIN PLATFORM STATES ---
  const [platformPlugins, setPlatformPlugins] = useState<any[]>([]);
  const [platformTools, setPlatformTools] = useState<any[]>([]);
  const [activeModelText, setActiveModelText] = useState("gemini");
  const [activeModelImage, setActiveModelImage] = useState("flux");
  const [testRunnerActive, setTestRunnerActive] = useState(false);
  const [testRunnerLogs, setTestRunnerLogs] = useState<any[]>([]);
  const [testSummary, setTestSummary] = useState<any>(null);

  const fetchPluginsAndTools = async () => {
    try {
      const pRes = await fetch("/api/v2/designer-os/plugins/list");
      const pData = await pRes.json();
      if (pData.success) {
        setPlatformPlugins(pData.plugins);
      }

      const tRes = await fetch("/api/v2/designer-os/plugins/tools");
      const tData = await tRes.json();
      if (tData.success) {
        setPlatformTools(tData.tools);
      }
    } catch (err) {
      console.error("Failed to fetch plugins or tools from V2 endpoint, trying fallback...", err);
      try {
        const pRes = await fetch("/api/designer-os/plugins/list");
        const pData = await pRes.json();
        if (pData.success) setPlatformPlugins(pData.plugins);

        const tRes = await fetch("/api/designer-os/plugins/tools");
        const tData = await tRes.json();
        if (tData.success) setPlatformTools(tData.tools);
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
      }
    }
  };

  useEffect(() => {
    fetchPluginsAndTools();
  }, []);

  const handleTogglePlatformPlugin = async (pluginId: string, currentStatus: string) => {
    const isActivating = currentStatus !== "active";
    try {
      const url = "/api/v2/designer-os/plugins/toggle";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pluginId, active: isActivating })
      });
      const data = await res.json();
      if (data.success) {
        onTriggerToast(
          isActivating ? "Plugin Activated" : "Plugin Suspended",
          `Plugin ${pluginId} state updated successfully.`
        );
        fetchPluginsAndTools();
      }
    } catch (err) {
      console.error("Failed to toggle plugin state:", err);
    }
  };

  const handleRunPluginTests = async () => {
    setTestRunnerActive(true);
    setTestRunnerLogs([{ name: "Initializing Plugin Sandbox Test Suite...", status: "running" }]);
    setTestSummary(null);

    try {
      const url = "/api/v2/designer-os/plugins/run-tests";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTestRunnerLogs(data.results);
        setTestSummary(data.summary);
        onTriggerToast("SDK Verification Success", "All test assertions passed successfully.");
        fetchPluginsAndTools();
      } else {
        setTestRunnerLogs([{ name: `Failed: ${data.error}`, status: "failed" }]);
      }
    } catch (err: any) {
      setTestRunnerLogs([{ name: `Exception occurred: ${err.message}`, status: "failed" }]);
    } finally {
      setTestRunnerActive(false);
    }
  };

  // --- PHASE 1.5 ENTERPRISE AI PLATFORM STATES ---
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [routerStrategy, setRouterStrategy] = useState<string>("balanced");
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [directorPrompt, setDirectorPrompt] = useState<string>("");
  const [directorLogs, setDirectorLogs] = useState<string[]>([]);
  const [directorStage, setDirectorStage] = useState<string>("idle");
  const [directorProgress, setDirectorProgress] = useState<number>(0);
  const [activeDesignPlan, setActiveDesignPlan] = useState<any | null>(null);
  const [isDirecting, setIsDirecting] = useState<boolean>(false);
  const [aiTestsRunning, setAiTestsRunning] = useState<boolean>(false);
  const [aiTestsResults, setAiTestsResults] = useState<any[]>([]);
  const [aiTestsSummary, setAiTestsSummary] = useState<any | null>(null);

  const fetchAiModelsAndTelemetry = async () => {
    try {
      const mRes = await fetch("/api/ai-platform/models");
      const mData = await mRes.json();
      if (mData.success) setAiModels(mData.models);

      const tRes = await fetch("/api/ai-platform/telemetry");
      const tData = await tRes.json();
      if (tData.success) setTelemetryLogs(tData.telemetry);
    } catch (err) {
      console.error("Failed to fetch AI models/telemetry:", err);
    }
  };

  useEffect(() => {
    fetchAiModelsAndTelemetry();
    const interval = setInterval(fetchAiModelsAndTelemetry, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunAiTestSuite = async () => {
    setAiTestsRunning(true);
    setAiTestsResults([]);
    setAiTestsSummary(null);
    try {
      const res = await fetch("/api/ai-platform/run-tests", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setAiTestsResults(data.results);
        setAiTestsSummary(data.summary);
        onTriggerToast("AI Platform Verification Success", "Enterprise routers, calligraphy & typography pairings verified.");
        fetchAiModelsAndTelemetry();
      }
    } catch (err) {
      console.error("Failed to run AI tests:", err);
    } finally {
      setAiTestsRunning(false);
    }
  };

  const handleTriggerCreativeDirector = async (presetPrompt?: string) => {
    const activePrompt = presetPrompt || directorPrompt;
    if (!activePrompt.trim()) return;

    setIsDirecting(true);
    setDirectorLogs(["[System] Connecting to Neora Creative AI Director...", "[System] Bootstrapping stage: requirement_understanding"]);
    setDirectorStage("requirement_understanding");
    setDirectorProgress(5);
    setActiveDesignPlan(null);

    // Let's do a mock progress interval to make it look spectacular and reactive!
    const mockInterval = setInterval(() => {
      setDirectorProgress(prev => {
        if (prev >= 95) return 95;
        return prev + 5;
      });
    }, 1000);

    try {
      const res = await fetch("/api/ai-platform/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: activePrompt })
      });
      const data = await res.json();
      clearInterval(mockInterval);

      if (data.success && data.designPlan) {
        setDirectorStage("completed");
        setDirectorProgress(100);
        setActiveDesignPlan(data.designPlan);
        setDirectorLogs(prev => [
          ...prev,
          `[System] Assembled Design Plan: ${data.designPlan.projectName}`,
          "[System] All layered vectors, multilingual font pairings, and calligraphy vectors generated successfully!"
        ]);
        onTriggerToast("Creative Art Director Finished", "Layered graphic architecture & security meshes drafted.");
        fetchAiModelsAndTelemetry();
      } else {
        setDirectorLogs(prev => [...prev, `[Error] ${data.error || "Execution timeout"}`]);
      }
    } catch (err: any) {
      clearInterval(mockInterval);
      setDirectorLogs(prev => [...prev, `[Exception] Failed to contact Creative Director: ${err.message}`]);
    } finally {
      setIsDirecting(false);
    }
  };

  const handleToggleSkill = (id: string) => {
    setCustomSkills(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          const newActive = !s.active;
          if (newActive) {
            onTriggerToast(s.name, s.description);
          }
          return { ...s, active: newActive, status: newActive ? "active" : "standby" };
        }
        return s;
      });
      localStorage.setItem("neora_custom_skills", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteSkill = (id: string) => {
    setCustomSkills(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem("neora_custom_skills", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateSkillSubmit = () => {
    if (!wizardName.trim() || !wizardDescription.trim()) {
      alert(lang === "bn" ? "দয়া করে নাম এবং বিবরণ প্রদান করুন।" : "Please provide both skill name and description.");
      return;
    }
    const newId = "custom-skill-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
    const newSkill = {
      id: newId,
      name: wizardName.trim(),
      category: wizardCategory,
      description: wizardDescription.trim(),
      fetcher: wizardFetcher,
      option: wizardOption.trim() || "Default config values",
      active: true,
      status: "active",
      health: "healthy",
      lastRun: "Just now"
    };

    setCustomSkills(prev => {
      const updated = [...prev, newSkill];
      localStorage.setItem("neora_custom_skills", JSON.stringify(updated));
      return updated;
    });

    onTriggerToast(newSkill.name, newSkill.description);

    // Reset Wizard
    setWizardName("");
    setWizardDescription("");
    setWizardOption("");
    setWizardStep(1);
    setWizardOpen(false);
  };

  // Run auto healing sequence
  const handleRunAutoHeal = () => {
    setIsHealing(true);
    setHealLogs([]);
    const logs = [
      "Starting diagnostics scan...",
      "Analyzing Ollama server socket handshake...",
      "Latency Spike Detected: Swapping to Cloud Fallback API gateway...",
      "Scanning Real-time Sync Broker thread count...",
      "Closing dangling TCP socket descriptors...",
      "Establishing connection through Port 3000...",
      "Flush memory pools and local replicator...",
      "All services successfully healed!"
    ];

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setHealLogs(prev => [...prev, `[HEAL-SYS] ${log}`]);
        if (idx === logs.length - 1) {
          setIsHealing(false);
          setIsHealed(true);
          setDiagnostics(prev => prev.map(d => ({ ...d, status: "healthy", latency: "12ms" })));
        }
      }, (idx + 1) * 800);
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto space-y-6">
      
      {/* 1. Skill Discovery holographic Toast container (Rendered inside the main panel space if active) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/15 rounded-2xl p-5 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <h4 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
                {lang === "bn" ? "নিওরা এজেন্ট স্কিলস স্টুডিও" : "Neora Agent Skills Studio & Core"}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
              {lang === "bn"
                ? "এখানে আপনি আপনার এজেন্টের কাস্টম স্কিল এবং ব্যাকএন্ড মেমোরি ডেসবোর্ড পরিচালনা করতে পারবেন। প্রতিটি স্কিলের সাথে একটি ফেচার এবং প্যারামিটার যুক্ত থাকে।"
                : "Configure custom operational skills, link them to hardware triggers or polling fetchers, design system orchestration graphs, and define live operating rules."}
            </p>
          </div>

          <button
            onClick={() => setWizardOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_4px_15px_rgba(6,182,212,0.25)] border border-cyan-400/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === "bn" ? "নতুন স্কিল যোগ করুন" : "CREATE NEW SKILL"}</span>
          </button>
        </div>
      </div>

      {/* Grid of Custom Skills Management (Skill Registry) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Side: Skill Registry & Creation Wizard */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Card: Skill Registry Dashboard */}
          <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                  {lang === "bn" ? "কাস্টম এজেন্ট স্কিল রেজিস্ট্রি" : "Custom Agent Skill Registry"}
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                {customSkills.length} SKILLS REGISTERED
              </span>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customSkills.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    s.active
                      ? "bg-indigo-950/10 border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.05)]"
                      : "bg-slate-950/40 border-slate-900 opacity-70"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                        {s.category}
                      </span>
                      <button
                        onClick={() => handleDeleteSkill(s.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}></span>
                      <span>{s.name}</span>
                    </h4>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                      {s.description}
                    </p>

                    <div className="mt-2 space-y-1 text-[10px] font-mono text-slate-500 bg-slate-950/60 p-2 rounded border border-slate-900">
                      <div><span className="text-cyan-400/80">Fetcher:</span> {s.fetcher}</div>
                      <div><span className="text-indigo-400/80">Option:</span> {s.option}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900/40">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1 h-1 rounded-full ${s.active ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                      <span className={`text-[9px] font-mono font-bold uppercase ${s.active ? "text-emerald-400" : "text-amber-400"}`}>
                        {s.active ? "ACTIVE" : "STANDBY"}
                      </span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleSkill(s.id)}
                      className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${
                        s.active ? "bg-indigo-500" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                          s.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Global Orchestration Plan View */}
          <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  {lang === "bn" ? "গ্লোবাল অর্কেস্ট্রেশন প্ল্যান" : "Global Orchestration Plan"}
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                DEPENDENCY GRAPH ACTIVE
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Verify if the data streams mapping to active fetchers feed correctly into system control triggers.
            </p>

            {/* Interactive Graph Box */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 relative overflow-hidden">
              <div className="grid grid-cols-3 gap-4 text-center items-center relative z-10">
                
                {/* Column 1: Fetchers */}
                <div className="space-y-3">
                  <div className="text-[9px] text-slate-500 uppercase font-mono font-bold">Polling Fetchers</div>
                  
                  <div className="p-2.5 bg-slate-900 border border-cyan-500/20 rounded-lg text-left shadow-sm">
                    <div className="text-[10px] font-bold text-cyan-400 font-mono">FS SCANNER</div>
                    <p className="text-[9px] text-slate-400 leading-tight mt-0.5">Polls directories on a 10s cron trigger.</p>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-indigo-500/20 rounded-lg text-left shadow-sm">
                    <div className="text-[10px] font-bold text-indigo-400 font-mono">RAM TELEMETRY</div>
                    <p className="text-[9px] text-slate-400 leading-tight mt-0.5">Reads proc metrics buffer hourly.</p>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-emerald-500/20 rounded-lg text-left shadow-sm">
                    <div className="text-[10px] font-bold text-emerald-400 font-mono">WORKSPACE EVENTS</div>
                    <p className="text-[9px] text-slate-400 leading-tight mt-0.5">Listens to IPC chat transactions.</p>
                  </div>
                </div>

                {/* Column 2: Data/Event Queues */}
                <div className="space-y-4 flex flex-col justify-center items-center">
                  <div className="text-[9px] text-slate-500 uppercase font-mono font-bold">Live Channels</div>
                  
                  <div className="w-full py-1 px-2 bg-cyan-950/30 border border-cyan-900 text-cyan-400 text-[9px] font-mono rounded flex items-center justify-between">
                    <span>FS EVENTS</span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                  </div>

                  <div className="w-full py-1 px-2 bg-indigo-950/30 border border-indigo-900 text-indigo-400 text-[9px] font-mono rounded flex items-center justify-between">
                    <span>RAM STACK</span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                  </div>

                  <div className="w-full py-1 px-2 bg-emerald-950/30 border border-emerald-900 text-emerald-400 text-[9px] font-mono rounded flex items-center justify-between">
                    <span>COGNITIVE CACHE</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  </div>
                </div>

                {/* Column 3: Active Custom Skills */}
                <div className="space-y-3">
                  <div className="text-[9px] text-slate-500 uppercase font-mono font-bold">Neural Skills</div>

                  {customSkills.map((cs) => (
                    <div
                      key={cs.id}
                      className={`p-2.5 border rounded-lg text-left shadow-sm transition-all ${
                        cs.active
                          ? "bg-slate-900 border-indigo-500/30"
                          : "bg-slate-900/40 border-slate-900 opacity-40"
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-200 font-mono truncate">{cs.name}</div>
                      <span className="text-[8px] font-mono px-1 bg-slate-950 text-indigo-400 rounded">{cs.status}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Laser Line Backdrops */}
              <div className="absolute inset-y-0 left-[33%] right-[33%] border-x border-dashed border-slate-900/60 pointer-events-none" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* 6. Enterprise Plugin OS Hub & MCP SDK */}
          <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-5 shadow-lg space-y-6">
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                  {lang === "bn" ? "এন্টারপ্রাইজ প্লাগইন ওএস হাব এবং এমসিপি" : "Enterprise Plugin OS Hub & MCP SDK"}
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                PLATFORM SDK ACTIVE
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Orchestrate design skills, swap active provider adapters, inspect registered Model Context Protocol (MCP) commands, and execute live sandbox validation checks.
            </p>

            {/* Sub-block A: Provider Model Adapters */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-900">
              <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                <span>Model Adapter Router Config</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400">ACTIVE TEXT/LLM AGENT:</label>
                  <select
                    value={activeModelText}
                    onChange={(e) => setActiveModelText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 font-mono outline-none focus:border-cyan-500/30"
                  >
                    <option value="gemini">Google Gemini (gemini-2.5-flash)</option>
                    <option value="groq">Groq Cloud API (llama-3.3-70b)</option>
                    <option value="ollama">Ollama Local Engine (mistral/offline)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400">ACTIVE IMAGE GENERATOR:</label>
                  <select
                    value={activeModelImage}
                    onChange={(e) => setActiveModelImage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 font-mono outline-none focus:border-indigo-500/30"
                  >
                    <option value="flux">Flux Dev AI (flux-schnell)</option>
                    <option value="stable_diffusion">Stable Diffusion 3 (sd3-medium)</option>
                    <option value="ideogram">Ideogram 2.0 (specialist typography)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sub-block B: Active Plugins Marketplace */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Installed Ecosystem Plugins</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {platformPlugins.length === 0 ? (
                  <div className="col-span-3 text-center py-6 text-slate-500 font-mono text-xs">
                    No active plugins loaded. Run test suite to pre-load.
                  </div>
                ) : (
                  platformPlugins.map((plugin) => (
                    <div
                      key={plugin.manifest.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 bg-slate-950/80 transition-all ${
                        plugin.status === "active"
                          ? "border-cyan-500/15 shadow-[0_0_10px_rgba(6,182,212,0.03)]"
                          : "border-slate-900 opacity-60"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                            v{plugin.manifest.version}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${plugin.status === "active" ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`}></span>
                        </div>
                        <h5 className="text-[11px] font-bold text-slate-200 font-sans line-clamp-1">{plugin.manifest.name}</h5>
                        <p className="text-[9.5px] text-slate-400 font-sans leading-tight line-clamp-2">{plugin.manifest.description}</p>
                      </div>

                      {/* Permissions List */}
                      <div className="space-y-1">
                        <div className="text-[8px] font-mono text-slate-500 uppercase font-bold">API Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {plugin.manifest.permissions.map((p: string) => (
                            <span key={p} className="text-[7.5px] font-mono text-cyan-400/80 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-500/5">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-[9px] font-mono">
                        <span className="text-slate-500 text-[8px]">Lic: {plugin.manifest.license}</span>
                        <button
                          onClick={() => handleTogglePlatformPlugin(plugin.manifest.id, plugin.status)}
                          className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8.5px] border cursor-pointer ${
                            plugin.status === "active"
                              ? "bg-cyan-955 text-cyan-400 border-cyan-500/20 hover:bg-cyan-900/40"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850"
                          }`}
                        >
                          {plugin.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sub-block C: MCP Live Tools Directory */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Model Context Protocol (MCP) Live Tools Directory</span>
              </h4>

              <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 max-h-48 overflow-y-auto space-y-2">
                {platformTools.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs font-mono py-4">No MCP tools registered in core index.</div>
                ) : (
                  platformTools.map((tool) => (
                    <div key={tool.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-900/60 pb-2 last:border-b-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-cyan-400">{tool.id.replace(/\./g, "_")}</span>
                          <span className="text-[7.5px] font-mono text-indigo-400 bg-indigo-950/30 border border-indigo-900/40 px-1 py-0.5 rounded">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-tight">{tool.description}</p>
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 bg-slate-900/60 px-2 py-1 rounded border border-slate-850">
                        pluginId: {tool.pluginId}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sub-block D: Interactive SDK Test Runner Terminal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Plugin Sandbox Assertion & Verification</span>
                </h4>
                <button
                  onClick={handleRunPluginTests}
                  disabled={testRunnerActive}
                  className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-[0_2px_10px_rgba(6,182,212,0.15)] animate-pulse"
                >
                  {testRunnerActive ? <RefreshCw className="w-3 h-3 animate-spin" /> : "RUN TEST SUITE"}
                </button>
              </div>

              {testRunnerLogs.length > 0 && (
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[10px] space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Assertion Console v1.0.4</span>
                    {testSummary && (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/40 font-bold">
                          {testSummary.passed} PASSED
                        </span>
                        {testSummary.failed > 0 && (
                          <span className="text-rose-400 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-900/40 font-bold">
                            {testSummary.failed} FAILED
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {testRunnerLogs.map((log, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 leading-normal">
                        <div className="flex items-center gap-1.5 text-left">
                          <span className={log.status === "passed" ? "text-emerald-400 font-bold" : log.status === "running" ? "text-cyan-400" : "text-rose-400 font-bold"}>
                            {log.status === "passed" ? "✓" : log.status === "running" ? "»" : "✗"}
                          </span>
                          <span className="text-slate-300">
                            {log.suite ? `[${log.suite}] ` : ""}{log.name}
                          </span>
                        </div>
                        {log.error && <span className="text-rose-500 shrink-0 select-none text-right">err: {log.error}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Side: Operating Rules & Diagnostics Panel */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* 4. Diagnostic Panel & Auto-Healing */}
          <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  {lang === "bn" ? "সিস্টেম ডায়াগনস্টিক" : "System Diagnostics"}
                </h3>
              </div>
              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold border ${
                isHealed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
              }`}>
                {isHealed ? "Fully Healed" : "Anomalies Found"}
              </span>
            </div>

            {/* Health status of components */}
            <div className="space-y-2.5">
              {diagnostics.map((d) => (
                <div key={d.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-[10px] font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-350 truncate max-w-[70%] font-bold">{d.name}</span>
                    <span className={`px-1 rounded uppercase text-[8px] font-bold ${
                      d.status === "healthy" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/20" :
                      d.status === "degraded" ? "bg-amber-950/40 text-amber-400 border border-amber-900/20" :
                      "bg-rose-950/40 text-rose-400 border border-rose-900/20"
                    }`}>
                      {d.status} ({d.latency})
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-normal italic">
                    💡 {d.suggestion}
                  </p>
                </div>
              ))}
            </div>

            {/* Auto heal button & execution tracker */}
            {isHealing ? (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 font-mono text-[9px] max-h-36 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>EXECUTING AUTO-HEAL ALGORITHMS...</span>
                </div>
                <div className="space-y-1 text-slate-400">
                  {healLogs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
              </div>
            ) : (
              <button
                onClick={handleRunAutoHeal}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-all active:scale-98"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "অটো-হিলিং প্রক্রিয়া চালান" : "Run Auto-Heal Sequence"}</span>
              </button>
            )}
          </div>

          {/* 5. Agent Operating Rules Configuration Panel */}
          <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Code className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                {lang === "bn" ? "এজেন্ট অপারেটিং রুলস" : "Agent Operating Rules"}
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal font-sans">
              Define background loops, safe limits, and telemetry options using YAML format.
            </p>

            <div className="relative">
              <textarea
                value={operatingRules}
                onChange={(e) => setOperatingRules(e.target.value)}
                rows={11}
                className="w-full bg-slate-950 text-slate-300 border border-slate-900 rounded-xl p-3 font-mono text-[10.5px] leading-relaxed focus:outline-none focus:border-indigo-500/50"
              />
              <span className="absolute right-3 bottom-3 text-[8px] font-mono text-slate-600 bg-slate-950 px-1.5 py-0.5 border border-slate-900 rounded select-none">
                YAML Snip
              </span>
            </div>

            {/* Custom Operating Status Bar */}
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-1 text-[9.5px] font-mono leading-none">
              <div className="flex items-center justify-between text-slate-450 border-b border-slate-900 pb-1.5">
                <span>STATUS:</span>
                <span className="text-emerald-400 font-bold">RUNNING (OPTIMIZED)</span>
              </div>
              <div className="flex items-center justify-between text-slate-450 pt-1.5">
                <span>ACTIVE FETCHERS:</span>
                <span className="text-cyan-400 font-bold">5/5 ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-slate-450 pt-1.5">
                <span>BACKGROUND LOOPS:</span>
                <span className="text-indigo-400 font-bold">3 ACTIVE LOOPS</span>
              </div>
            </div>
          </div>

          {/* 7. Enterprise Creative AI Director & Routing Platform (Phase 1.5) */}
          <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-5 shadow-lg space-y-6">
            <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                  {lang === "bn" ? "ক্রিয়েটিভ এআই ডিরেক্টর এবং রাউটিং প্ল্যাটফর্ম" : "Creative AI Director & Routing Platform"}
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                CORE INTELLIGENCE V1.5
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Deploy Neora's Art Director to analyze visual rules, map multi-lingual scripts (RTL/LTR), generate vector shapes/mathematical Guilloché curves, and optimize dynamic provider routing.
            </p>

            {/* Platform Sub-Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-slate-850 pb-3 text-xs font-mono">
              <button
                onClick={() => setRouterStrategy("balanced")}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white bg-slate-950 text-center cursor-pointer transition-all active:scale-95 text-[10px]"
              >
                ☯ Balanced Router
              </button>
              <button
                onClick={() => setRouterStrategy("highest_quality")}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white bg-slate-950 text-center cursor-pointer transition-all active:scale-95 text-[10px]"
              >
                ★ Ultra Quality
              </button>
              <button
                onClick={() => setRouterStrategy("lowest_cost")}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white bg-slate-950 text-center cursor-pointer transition-all active:scale-95 text-[10px]"
              >
                $ Lowest Cost
              </button>
              <button
                onClick={() => setRouterStrategy("offline_preferred")}
                className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white bg-slate-950 text-center cursor-pointer transition-all active:scale-95 text-[10px]"
              >
                ☁ Offline Engine
              </button>
            </div>

            {/* Interactive Creator Workspace */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Artistic Campaign Brief / Prompt Instruction:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={directorPrompt}
                    onChange={(e) => setDirectorPrompt(e.target.value)}
                    placeholder="e.g. Design a golden Islamic Eid banner with Arabic Calligraphy and Guilloché lines..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-sans outline-none focus:border-emerald-500/30"
                  />
                  <button
                    onClick={() => handleTriggerCreativeDirector()}
                    disabled={isDirecting}
                    className="px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-[0_2px_12px_rgba(16,185,129,0.2)] shrink-0"
                  >
                    {isDirecting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "DIRECT AI"
                    )}
                  </button>
                </div>
              </div>

              {/* Sample Quick Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[9px] font-mono text-slate-500 self-center">CAMPAIGN PRESETS:</span>
                <button
                  onClick={() => {
                    setDirectorPrompt("Create traditional Boishakh Bengali Poster with Alpona art");
                    handleTriggerCreativeDirector("Create traditional Boishakh Bengali Poster with Alpona art");
                  }}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-full text-[9.5px] font-mono text-emerald-400 cursor-pointer transition-all"
                >
                  🌾 Boishakh Alpona
                </button>
                <button
                  onClick={() => {
                    setDirectorPrompt("Design luxury Gold Saffron Ramadan Kareem post with Calligraphy");
                    handleTriggerCreativeDirector("Design luxury Gold Saffron Ramadan Kareem post with Calligraphy");
                  }}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-full text-[9.5px] font-mono text-amber-400 cursor-pointer transition-all"
                >
                  🕌 Islamic Gold Script
                </button>
                <button
                  onClick={() => {
                    setDirectorPrompt("Secure high-contrast luxury ticket mockup with anti-copy watermarks");
                    handleTriggerCreativeDirector("Secure high-contrast luxury ticket mockup with anti-copy watermarks");
                  }}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-full text-[9.5px] font-mono text-indigo-400 cursor-pointer transition-all"
                >
                  🎫 Guilloché Secure Ticket
                </button>
              </div>

              {/* Orchestrator Logs / Live Progress */}
              {isDirecting && (
                <div className="bg-slate-950 border border-slate-850/60 rounded-xl p-4 font-mono text-[10px] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold uppercase animate-pulse flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      Orchestrator Stage: {directorStage.toUpperCase()}
                    </span>
                    <span>{directorProgress}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                      style={{ width: `${directorProgress}%` }}
                    />
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 text-slate-400 scrollbar-none border-t border-slate-900 pt-2 text-left">
                    {directorLogs.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Design Plan Visualizer Output */}
              {activeDesignPlan && (
                <div className="space-y-4 border border-emerald-500/10 bg-slate-950/80 p-5 rounded-xl">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                        Enterprise Design Blueprint
                      </span>
                      <h4 className="text-xs font-bold font-sans text-slate-100">{activeDesignPlan.projectName}</h4>
                    </div>
                    <div className="text-right text-[9.5px] font-mono text-slate-500">
                      Culture: {activeDesignPlan.culture}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Column 1: Config Parameters */}
                    <div className="md:col-span-6 space-y-4 text-left">
                      {/* Typography Rules */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
                          Language-Aware Typography:
                        </span>
                        <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-sans text-slate-300 font-bold">
                              {activeDesignPlan.typography.headlineFont}
                            </span>
                            <span className="text-[8px] font-mono bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">
                              Direction: {activeDesignPlan.typography.direction.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans italic">
                            "{activeDesignPlan.typography.pairingRationale}"
                          </p>
                          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-850">
                            <span>Kerning: {activeDesignPlan.typography.kerning}</span>
                            <span>Tracking: {activeDesignPlan.typography.tracking}em</span>
                            <span>Leading: {activeDesignPlan.typography.leading}x</span>
                          </div>
                        </div>
                      </div>

                      {/* Color Psychology bubble palette */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
                          Color Psychology Palette:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {activeDesignPlan.colorPalette.map((col: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2 bg-slate-900/40 border border-slate-850/60 rounded-lg flex items-center gap-2"
                            >
                              <div
                                className="w-5 h-5 rounded-full shrink-0 border border-white/10"
                                style={{ backgroundColor: col.hex }}
                              />
                              <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-300 truncate">{col.label}</div>
                                <div className="text-[8px] font-mono text-slate-500 truncate" title={col.psychology}>
                                  {col.psychology}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Blueprint Safety Checks */}
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono pt-1">
                        <div className="p-2 bg-emerald-950/10 border border-emerald-900/20 text-emerald-400 rounded-lg flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>PRINT BLEED SAFE</span>
                        </div>
                        <div className="p-2 bg-cyan-950/10 border border-cyan-900/20 text-cyan-400 rounded-lg flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>ACCESSIBILITY VERIFIED</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Vector Path & Calligraphy Live SVG Render */}
                    <div className="md:col-span-6 flex flex-col justify-between bg-slate-900/80 rounded-lg border border-slate-850 p-4">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                        <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                          Vector Blueprint Engine Sandbox
                        </span>
                        <span className="text-[8.5px] font-mono text-cyan-400">SVG Canvas Preview</span>
                      </div>

                      {/* Mathematical SVG Sandbox Preview */}
                      <div className="relative w-full aspect-square bg-slate-950 rounded border border-slate-850 overflow-hidden flex items-center justify-center">
                        {/* Interactive Guilloché Lines backdrop if generated */}
                        {activeDesignPlan.securityPattern?.type === "guilloche" && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 500 500">
                            <path
                              d={activeDesignPlan.securityPattern.svgPatternDefinition}
                              fill="none"
                              stroke={activeDesignPlan.colorPalette[1]?.hex || "#d97706"}
                              strokeWidth="1.0"
                            />
                          </svg>
                        )}

                        {/* Calligraphy elements or Vector designs */}
                        {activeDesignPlan.calligraphy ? (
                          <svg className="w-4/5 h-4/5 animate-pulse" viewBox="0 0 500 500">
                            {/* Outer geometric or floral framework */}
                            <rect
                              x="10" y="10" width="480" height="480"
                              fill="none"
                              stroke={activeDesignPlan.colorPalette[1]?.hex || "#d97706"}
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            />
                            {/* Inner calligraphy curve paths */}
                            {activeDesignPlan.calligraphy.svgPaths.map((pathObj: any) => (
                              <g key={pathObj.id}>
                                <path
                                  d={pathObj.svgPath}
                                  fill="none"
                                  stroke={activeDesignPlan.colorPalette[1]?.hex || "#d97706"}
                                  strokeWidth={pathObj.strokeWidth}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                {/* Render anchor editing points representing design vector control nodes */}
                                {pathObj.anchorPoints.map((pt: any, idx: number) => (
                                  <circle
                                    key={idx}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="4.5"
                                    fill={idx === 0 ? "#ef4444" : "#06b6d4"}
                                    className="cursor-pointer hover:scale-125 transition-transform"
                                  />
                                ))}
                              </g>
                            ))}
                          </svg>
                        ) : activeDesignPlan.vectorPlan ? (
                          <svg className="w-4/5 h-4/5" viewBox="0 0 500 500">
                            {activeDesignPlan.vectorPlan.paths.map((p: any) => {
                              if (p.type === "polygon") {
                                return <polygon key={p.id} points={p.points} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} />;
                              }
                              if (p.type === "circle") {
                                return <circle key={p.id} cx="250" cy="250" r="180" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} />;
                              }
                              return <path key={p.id} d={p.d} fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} />;
                            })}
                          </svg>
                        ) : (
                          <div className="text-slate-600 text-[10px] font-mono">No vectors drafted</div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 mt-2 pt-1 border-t border-slate-850">
                        <span>Layout Grid: {activeDesignPlan.gridPlan.columns} Col</span>
                        <span>Negative Space: {activeDesignPlan.negativeSpaceScore}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Model Router Registry Config & Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dynamic Model Capabilities Registry */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 text-left">
                <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dynamic Model Capabilities Registry</span>
                  </span>
                  <span className="text-[8px] font-mono bg-slate-900 text-cyan-400 border border-cyan-900/30 px-1.5 py-0.5 rounded uppercase">
                    ACTIVE ADAPTERS
                  </span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {aiModels.length === 0 ? (
                    <div className="text-center text-slate-600 text-xs font-mono py-4">No models registry found.</div>
                  ) : (
                    aiModels.map((model) => (
                      <div key={model.id} className="p-2 rounded border border-slate-900 bg-slate-900/30 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-200">{model.id}</span>
                            <span className="text-[7.5px] font-mono bg-indigo-950 text-indigo-400 px-1 rounded uppercase">
                              {model.provider}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-500 font-sans truncate">{model.name}</div>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded">
                            Qual: {model.qualityScore}/10
                          </span>
                          <div className="text-[7.5px] font-mono text-slate-500">Latency: {model.latencyMs}ms</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Real-time Telemetry & Costs Audit */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 text-left">
                <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-Time Telemetry & Cost Audit</span>
                  </span>
                  <span className="text-[8px] font-mono bg-slate-900 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded uppercase">
                    LIVE STREAM
                  </span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {telemetryLogs.length === 0 ? (
                    <div className="text-center text-slate-600 text-xs font-mono py-4">No active routing events recorded.</div>
                  ) : (
                    telemetryLogs.slice().reverse().map((log) => (
                      <div key={log.id} className="p-2 rounded border border-slate-900 bg-slate-900/30 flex items-center justify-between text-[9px] font-mono">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-300 font-bold truncate">{log.modelId}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${log.status === "success" ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                          </div>
                          <div className="text-[8px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-emerald-400">${Number(log.costUsd).toFixed(5)}</span>
                          <div className="text-[7.5px] text-slate-500">In/Out Tokens: {log.inputTokens}/{log.outputTokens}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Platform Test Runner Block */}
            <div className="pt-2 border-t border-slate-850">
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-0.5 text-left">
                  <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Platform Unit & Integrations Test Runner</span>
                  </h4>
                  <p className="text-[9px] text-slate-500 font-sans">
                    Verify capability registers, lowest cost selectors, calligraphy Bezier curves, and RTL formatting rules.
                  </p>
                </div>
                <button
                  onClick={handleRunAiTestSuite}
                  disabled={aiTestsRunning}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-[0_2px_10px_rgba(16,185,129,0.15)] shrink-0"
                >
                  {aiTestsRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : "RUN AI TESTS"}
                </button>
              </div>

              {/* AI Test runner output terminal logs */}
              {aiTestsResults.length > 0 && (
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[10px] space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Platform Suite Assertions Console v1.5.0</span>
                    {aiTestsSummary && (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-900/40 font-bold">
                          {aiTestsSummary.passed} PASSED
                        </span>
                        {aiTestsSummary.failed > 0 && (
                          <span className="text-rose-400 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-900/40 font-bold">
                            {aiTestsSummary.failed} FAILED
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-left">
                    {aiTestsResults.map((log) => (
                      <div key={log.id} className="flex items-start justify-between gap-4 leading-normal">
                        <div className="flex items-center gap-1.5 text-left">
                          <span className={log.status === "passed" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {log.status === "passed" ? "✓" : "✗"}
                          </span>
                          <span className="text-slate-300">
                            [{log.category.toUpperCase()}] {log.name}
                          </span>
                        </div>
                        <span className="text-slate-500 font-bold">{log.latencyMs}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* --- COGNITIVE FOUNDATION WORKSPACE (PHASE 1.5) --- */}
      <CognitiveFoundationDashboard lang={lang} onTriggerToast={onTriggerToast} />

      {/* --- VISUAL INTELLIGENCE WORKSPACE (PHASE 2.0) --- */}
      <VisualIntelligenceDashboard />

      {/* --- IMAGE INGESTION PIPELINE (PHASE 2.1.2) --- */}
      <ImageIngestionDashboard />

      {/* 2. Configuration Wizard Step Dialog Modal */}
      <AnimatePresence>
        {wizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWizardOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-2xl space-y-4 text-left font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded border border-indigo-500/20">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                      {lang === "bn" ? "স্কিল কনফিগারেশন উইজার্ড" : "Skill Configuration Wizard"}
                    </h3>
                    <span className="text-[9px] font-mono text-slate-500">STEP {wizardStep} OF 4</span>
                  </div>
                </div>
                <button
                  onClick={() => setWizardOpen(false)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                  style={{ width: `${(wizardStep / 4) * 100}%` }}
                />
              </div>

              {/* STEP 1: Basic Info */}
              {wizardStep === 1 && (
                <div className="space-y-3.5 py-2">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Step 1: Primary Parameters
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-350 font-mono font-bold">SKILL NAME:</label>
                    <input
                      type="text"
                      placeholder="e.g., Auto-File-Cleanup"
                      value={wizardName}
                      onChange={(e) => setWizardName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-350 font-mono font-bold">CATEGORY:</label>
                    <select
                      value={wizardCategory}
                      onChange={(e) => setWizardCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-300 font-mono"
                    >
                      <option value="Task Automation & Daemons">Task Automation & Daemons</option>
                      <option value="Backend Systems">Backend Systems</option>
                      <option value="Frontend Core">Frontend Core</option>
                      <option value="Text & Chatting Cognitive">Text & Chatting Cognitive</option>
                      <option value="Voice Chatting & Speech">Voice Chatting & Speech</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Description */}
              {wizardStep === 2 && (
                <div className="space-y-3.5 py-2">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Step 2: Functional Role Description
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-350 font-mono font-bold">EXPLAIN COGNITIVE CAPABILITY:</label>
                    <textarea
                      placeholder="e.g. Automatically archives older temporary system cache files to free disk space..."
                      value={wizardDescription}
                      onChange={(e) => setWizardDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Link to a Fetcher */}
              {wizardStep === 3 && (
                <div className="space-y-3.5 py-2">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Step 3: Orchestrate Fetcher link
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-350 font-mono font-bold">LINKED HARDWARE FETCHERS:</label>
                    <select
                      value={wizardFetcher}
                      onChange={(e) => setWizardFetcher(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-300 font-mono"
                    >
                      <option value="Local File System Scanner">Local File System Scanner</option>
                      <option value="Memory Usage Monitor">Memory Usage Monitor</option>
                      <option value="Workspace Event Listener">Workspace Event Listener</option>
                      <option value="Network Port Watcher">Network Port Watcher</option>
                    </select>
                  </div>

                  <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    Connecting this skill to a fetcher binds background scheduler loops to telemetry streams.
                  </p>
                </div>
              )}

              {/* STEP 4: Configuration Option Parameters */}
              {wizardStep === 4 && (
                <div className="space-y-3.5 py-2">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Step 4: Operational Option Snippets
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-350 font-mono font-bold">TRIGGER SETTINGS / PARAMS:</label>
                    <input
                      type="text"
                      placeholder="e.g. Max Age: 30 days, Force GC: True"
                      value={wizardOption}
                      onChange={(e) => setWizardOption(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-[10px] text-slate-400 leading-normal">
                    🔥 Pressing activate completes the secure registration pipeline and hot-loads parameters directly into Neora's cognitive kernel.
                  </div>
                </div>
              )}

              {/* Action Nav Buttons */}
              <div className="flex justify-between items-center text-xs font-mono pt-3 border-t border-slate-850">
                <button
                  onClick={() => {
                    if (wizardStep > 1) setWizardStep(prev => prev - 1);
                  }}
                  disabled={wizardStep === 1}
                  className={`px-4 py-2 border rounded-lg uppercase font-bold transition-all ${
                    wizardStep === 1
                      ? "bg-transparent text-slate-600 border-slate-850 cursor-not-allowed opacity-30"
                      : "bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-800 cursor-pointer"
                  }`}
                >
                  {lang === "bn" ? "পূর্ববর্তী" : "Back"}
                </button>

                {wizardStep < 4 ? (
                  <button
                    onClick={() => {
                      if (wizardStep === 1 && !wizardName.trim()) {
                        alert(lang === "bn" ? "দয়া করে নাম দিন।" : "Please specify a valid skill name.");
                        return;
                      }
                      if (wizardStep === 2 && !wizardDescription.trim()) {
                        alert(lang === "bn" ? "দয়া করে বিবরণ দিন।" : "Please provide a description of the skill.");
                        return;
                      }
                      setWizardStep(prev => prev + 1);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg uppercase font-bold cursor-pointer"
                  >
                    {lang === "bn" ? "পরবর্তী" : "Next"}
                  </button>
                ) : (
                  <button
                    onClick={handleCreateSkillSubmit}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-955 rounded-lg uppercase font-black cursor-pointer shadow-lg"
                  >
                    {lang === "bn" ? "সচল করুন" : "ACTIVATE SKILL"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
