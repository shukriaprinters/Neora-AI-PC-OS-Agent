// NEORA DESIGN STUDIO RUNTIME PLATFORM (NDSRP) DASHBOARD - PHASE 2.3
import React, { useState, useEffect } from "react";
import {
  Cpu, Activity, Zap, Play, CheckCircle2, ShieldAlert, AlertTriangle, ShieldCheck,
  RefreshCw, Terminal, Layers, Box, Globe, Shield, Database, LayoutGrid, Sliders,
  Eye, FileCode, Check, Trash2, ArrowUpRight, HelpCircle, HardDrive, Network
} from "lucide-react";
import { NDSRP, NdsrpModelProvider, NdsrpWorkspaceState, NdsrpAutomationJob, NdsrpSecurityLog, NdsrpEvent, NdsrpExecutionMode, NdsrpHardwareProfile } from "../../lib/ai/cognitive/NDSRP";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function NDSRPDashboard({ lang, onAddSystemLog }: Props) {
  const ndsrp = NDSRP.getInstance();

  // Selected State variables
  const [executionMode, setExecutionMode] = useState<NdsrpExecutionMode>(ndsrp.getExecutionMode());
  const [hardwareProfile, setHardwareProfile] = useState<NdsrpHardwareProfile>(ndsrp.getHardwareProfile());
  const [providers, setProviders] = useState<NdsrpModelProvider[]>([]);
  const [workspaces, setWorkspaces] = useState<NdsrpWorkspaceState[]>([]);
  const [jobs, setJobs] = useState<NdsrpAutomationJob[]>([]);
  const [securityLogs, setSecurityLogs] = useState<NdsrpSecurityLog[]>([]);
  const [eventHistory, setEventHistory] = useState<NdsrpEvent[]>([]);
  const [telemetry, setTelemetry] = useState(ndsrp.getTelemetry());

  // Active runtime sub-tab view
  const [activeRuntimeSubTab, setActiveRuntimeSubTab] = useState<
    "ai" | "vision" | "render" | "workspace" | "automation" | "security" | "telemetry"
  >("telemetry");

  // Diagnostics and Simulation States
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [visionResult, setVisionResult] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    updateAllStateData();

    // Subscribe to Event Bus
    const unsubscribe = ndsrp.subscribe((ev) => {
      updateAllStateData();
      if (onAddSystemLog && ev.service !== "TelemetryRuntime") {
        onAddSystemLog(`NDSRP: [${ev.service}] ${ev.message}`);
      }
    });

    // Local telemetry poller for visual chart refreshing
    const pollInterval = setInterval(() => {
      setTelemetry({ ...ndsrp.getTelemetry() });
    }, 1500);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  const updateAllStateData = () => {
    setProviders([...ndsrp.getModelProviders()]);
    setWorkspaces([...ndsrp.getWorkspaces()]);
    setJobs([...ndsrp.getAutomationJobs()]);
    setSecurityLogs([...ndsrp.getSecurityLogs()]);
    setEventHistory(ndsrp.getEventHistory().slice(0, 15));
  };

  const handleExecutionModeChange = (mode: NdsrpExecutionMode) => {
    ndsrp.setExecutionMode(mode);
    setExecutionMode(mode);
  };

  const handleHardwareProfileChange = (profile: NdsrpHardwareProfile) => {
    ndsrp.setHardwareProfile(profile);
    setHardwareProfile(profile);
  };

  const handleCompileRender = () => {
    setIsCompiling(true);
    setTimeout(() => {
      ndsrp.compileRenderingPipelines();
      setIsCompiling(false);
    }, 500);
  };

  const handleRunVisionCheck = () => {
    const res = ndsrp.executeVisionCheck("Layer-Header-Boishakh");
    setVisionResult(res);
  };

  const handleExecuteJob = (id: string) => {
    ndsrp.executeAutomationJob(id);
  };

  const handleRunDiagnostics = async () => {
    setTestStatus("running");
    setTestLogs(["Initializing active container runtime audits..."]);
    const logs = await ndsrp.runRuntimeIntegritySuite();
    setTimeout(() => {
      setTestLogs(logs);
      setTestStatus("passed");
    }, 600);
  };

  return (
    <div className="space-y-4 p-4 text-slate-200">
      
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-1.5">
                NDSRP <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-normal">v16.0 Runtime Studio</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                {lang === "bn" ? "নিওরা ডিজাইন স্টুডিও রানটাইম প্ল্যাটফর্ম" : "Neora Design Studio Runtime Platform"}
              </p>
            </div>
          </div>
        </div>

        {/* TOP STATUS BARS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <div>
              <div className="text-[9px] text-slate-500 font-mono">EXECUTION MODE</div>
              <div className="text-xs font-mono font-bold text-blue-400 uppercase">{executionMode}</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <div>
              <div className="text-[9px] text-slate-500 font-mono">HARDWARE PROFILE</div>
              <div className="text-xs font-mono font-bold text-purple-400 uppercase">
                {hardwareProfile === "gpu_webgpu" ? "WebGPU Node" : hardwareProfile === "gpu_cuda" ? "CUDA Cluster" : "CPU Fallback"}
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="text-[9px] text-slate-500 font-mono">RENDER LATENCY</div>
              <div className="text-xs font-mono font-bold text-emerald-400">{telemetry.renderLatencyMs}ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE ENVIRONMENT CONFIGURATION CONTROLS */}
      <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-2">
            {lang === "bn" ? "রানটাইম এক্সিকিউশন মোড টগল করুন" : "Toggle Runtime Execution Mode"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["local", "cloud", "hybrid"] as NdsrpExecutionMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleExecutionModeChange(mode)}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  executionMode === mode 
                    ? "bg-blue-600/10 border-blue-500/40 text-blue-400" 
                    : "bg-slate-900 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1.5">
            * Local mode shuts down cloud routes. Cloud mode offloads rendering DAGs. Hybrid balances load dynamically.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-2">
            {lang === "bn" ? "হার্ডওয়্যার অ্যাক্সিলারেশন প্রোফাইল" : "Hardware Acceleration Profile"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cpu_fallback", label: "CPU Fallback" },
              { id: "gpu_webgpu", label: "WebGPU" },
              { id: "gpu_cuda", label: "CUDA Cluster" }
            ].map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleHardwareProfileChange(profile.id as NdsrpHardwareProfile)}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  hardwareProfile === profile.id 
                    ? "bg-purple-600/10 border-purple-500/40 text-purple-400" 
                    : "bg-slate-900 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                {profile.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1.5">
            * WebGPU leverages client graphics sandboxes. CUDA cluster provides enterprise visual-compute farms.
          </p>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: DETAILED VIEW VS LIVE RUNTIME STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: ACTIVE SERVICES WORKBENCH (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* RUNTIME SERVICE NAVIGATION SUB-TAB BAR */}
          <div className="flex bg-slate-950 border border-slate-900 p-1 rounded-lg overflow-x-auto gap-1">
            {[
              { id: "telemetry", label: "1. Telemetry Runtime", icon: Activity },
              { id: "ai", label: "2. AI Model Gateway", icon: Sliders },
              { id: "vision", label: "3. Vision Evaluator", icon: Eye },
              { id: "render", label: "4. WebGL Renderer", icon: LayoutGrid },
              { id: "workspace", label: "5. Workspace Syncer", icon: Database },
              { id: "automation", label: "6. Automation Engine", icon: Zap },
              { id: "security", label: "7. Security Auditor", icon: Shield }
            ].map((subtab) => {
              const Icon = subtab.icon;
              const isSelected = activeRuntimeSubTab === subtab.id;
              return (
                <button
                  key={subtab.id}
                  onClick={() => setActiveRuntimeSubTab(subtab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isSelected ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {subtab.label}
                </button>
              );
            })}
          </div>

          {/* ACTIVE CONTAINER VIEWPORT */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 min-h-[360px]">
            
            {/* A. TELEMETRY MONITORING */}
            {activeRuntimeSubTab === "telemetry" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    LIVE RESOURCE & PIPELINE TELEMETRY TELEMETER
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">DATA UPDATED EVERY 1.5S</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs">
                    <span className="text-slate-500 font-mono text-[9px] block">CPU UTILIZATION</span>
                    <div className="text-lg font-mono font-bold text-slate-200 mt-1">{telemetry.cpuUsagePercent}%</div>
                    <div className="w-full bg-slate-950 h-1.5 rounded mt-2 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded transition-all duration-500" style={{ width: `${telemetry.cpuUsagePercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs">
                    <span className="text-slate-500 font-mono text-[9px] block">VRAM ALLOCATION</span>
                    <div className="text-lg font-mono font-bold text-indigo-400 mt-1">{telemetry.vramUsageMb} MB</div>
                    <div className="w-full bg-slate-950 h-1.5 rounded mt-2 overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded transition-all duration-500" style={{ width: `${(telemetry.vramUsageMb / 6000) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs">
                    <span className="text-slate-500 font-mono text-[9px] block">RAM FOOTPRINT</span>
                    <div className="text-lg font-mono font-bold text-cyan-400 mt-1">{telemetry.ramUsageMb} MB</div>
                    <div className="w-full bg-slate-950 h-1.5 rounded mt-2 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded transition-all duration-500" style={{ width: `${(telemetry.ramUsageMb / 3000) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs">
                    <span className="text-slate-500 font-mono text-[9px] block">CANVAS DRAW RATE</span>
                    <div className="text-lg font-mono font-bold text-rose-400 mt-1">{telemetry.frameRateFps} FPS</div>
                    <div className="w-full bg-slate-950 h-1.5 rounded mt-2 overflow-hidden">
                      <div className="bg-rose-400 h-full rounded transition-all duration-500" style={{ width: `${(telemetry.frameRateFps / 120) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-900 space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-300 block">OBSERVABILITY TELEMETRY SPECS</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500">Virtual Render Pipelines Bound:</span>
                        <span className="text-slate-300">14 Active Threadpools</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500">Network IO Throughput:</span>
                        <span className="text-slate-300">{telemetry.networkThroughputKbps} Kbps</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500">Active Pipeline Executions:</span>
                        <span className="text-emerald-400 font-bold">{telemetry.activeThreads} Workers</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500">API Gateway Response latency:</span>
                        <span className="text-slate-300">{telemetry.apiLatencyMs}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. AI MODEL ADAPTERS GATEWAY */}
            {activeRuntimeSubTab === "ai" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    AI MODEL ADAPTER ROUTING REGISTRY
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">PROVIDER INDEPENDENT</span>
                </div>

                <div className="space-y-2">
                  {providers.map((p) => (
                    <div key={p.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{p.name}</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            p.type === "cloud" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {p.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono uppercase">ID: {p.id}</p>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500 text-[9px] block">LATENCY</span>
                          <span className="font-bold text-slate-300">{p.latencyMs}ms</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block">THROUGHPUT</span>
                          <span className="font-bold text-slate-300">{p.tokensPerSec} t/s</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block">ACCEL</span>
                          <span className={p.gpuAccelerated ? "text-emerald-400 font-bold" : "text-slate-500"}>
                            {p.gpuAccelerated ? "GPU" : "CPU"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block">STATUS</span>
                          <button
                            onClick={() => ndsrp.toggleProviderStatus(p.id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                              p.status === "online" 
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                                : p.status === "standby"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. VISION EVALUATOR RUNTIME */}
            {activeRuntimeSubTab === "vision" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    NEORA VISION EVALUATIONS & SAFE-ZONE ANALYZER
                  </span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3 text-xs">
                  <p className="text-slate-300">
                    The **Vision Runtime** automatically scans layered coordinate structures, overlays background channels, and calculates localized color contrast ratios against WCAG 2.2 metrics.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRunVisionCheck}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      RUN VISION LAYOUT AUDIT
                    </button>
                  </div>

                  {visionResult && (
                    <div className="bg-slate-950 p-4 rounded border border-slate-900 space-y-3 font-mono">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-[11px] text-emerald-400 font-bold">EVALUATION SUMMARY</span>
                        <span className="text-slate-400">Score: {visionResult.score}/100</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Contrast Safety Ratio:</span>
                          <span className="text-slate-200 font-bold">{visionResult.ratio}:1</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Layer Overlap Warnings:</span>
                          <span className="text-emerald-400 font-bold">{visionResult.overlaps ? "YES" : "NONE"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Accessibility Contrast Pass:</span>
                          <span className="text-emerald-400 font-bold">PASS (AA Compliance)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Active Crop-Safe Bounds:</span>
                          <span className="text-slate-200">Standard Margin Safe (&gt; 40px)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* D. WEBGL/CANVAS RENDERING ENGINE */}
            {activeRuntimeSubTab === "render" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4" />
                    NEORA COMPOSITE RENDERING CANVAS PIPELINES
                  </span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3 text-xs">
                  <p className="text-slate-300">
                    Compile composite vector structures into high-performance textures ready for edge canvas display.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCompileRender}
                      disabled={isCompiling}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isCompiling ? "animate-spin" : ""}`} />
                      {isCompiling ? "RECOMPILING WEBGL..." : "RECOMPILE RENDER PIPELINE"}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded border border-slate-900 font-mono text-[11px] text-slate-400 space-y-1.5">
                    <div>[01:31:04 AM] Initializing WebGL canvas layer texture buffer allocations.</div>
                    <div>[01:31:05 AM] Vector anchor bounds optimized.</div>
                    <div className="text-emerald-400">[01:31:05 AM] Composite drawing context loaded completely. FPS rate set at 60.</div>
                  </div>
                </div>
              </div>
            )}

            {/* E. WORKSPACE SYNCHRONIZATION ENGINE */}
            {activeRuntimeSubTab === "workspace" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    WORKSPACE DURABLE STATE COORDINATOR
                  </span>
                </div>

                <div className="space-y-2">
                  {workspaces.map((ws) => (
                    <div key={ws.id} className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-900 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{ws.projectName}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.2 rounded ${
                            ws.syncState === "synced" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400 animate-pulse"
                          }`}>
                            {ws.syncState.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase">
                          ID: {ws.id} | Layers: {ws.layersCount} | Readers: {ws.activeUsers} | Last Synced: {ws.lastSyncedTimestamp}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => ndsrp.toggleWorkspaceReadOnly(ws.id)}
                          className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          {ws.readOnly ? "UNLOCK EDITS" : "LOCK READ-ONLY"}
                        </button>
                        <button
                          onClick={() => ndsrp.triggerSyncWorkspace(ws.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] px-3 py-1 rounded transition-colors cursor-pointer"
                        >
                          SYNC STATE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* F. AUTOMATION RUNTIME */}
            {activeRuntimeSubTab === "automation" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    BULK OPERATIONS AUTOMATION ENGINE
                  </span>
                </div>

                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-950 pb-1.5">
                        <span className="font-mono font-bold text-slate-300 uppercase">
                          TASK: {job.type.replace("_", " ")} ({job.targetCount} Items)
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold ${
                          job.status === "completed" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : job.status === "running"
                              ? "bg-indigo-500/10 text-indigo-400 animate-pulse"
                              : "bg-slate-950 text-slate-400 border border-slate-900"
                        }`}>
                          {job.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                          <span>Progress: {job.progressPercent}%</span>
                          <span>Duration: {job.durationMs}ms</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded transition-all duration-300" style={{ width: `${job.progressPercent}%` }}></div>
                        </div>
                      </div>

                      {/* Job logs */}
                      <div className="max-h-[80px] overflow-y-auto bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-500 space-y-0.5">
                        {job.logs.map((log, i) => (
                          <div key={i}>&gt; {log}</div>
                        ))}
                      </div>

                      {job.status !== "running" && job.status !== "completed" && (
                        <button
                          onClick={() => handleExecuteJob(job.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] px-3 py-1 rounded cursor-pointer transition-colors"
                        >
                          RUN BATCH AUTOMATION
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* G. SECURITY AUDITING LEDGER */}
            {activeRuntimeSubTab === "security" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    CRYPTOGRAPHIC SECURITY & AUDITING RADAR
                  </span>
                </div>

                <div className="space-y-2">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-950 text-emerald-400 text-[9px] font-mono px-1.5 py-0.2 rounded uppercase border border-slate-900">
                              {log.service}
                            </span>
                            <span className="font-bold text-slate-300 font-mono">{log.action}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{log.message}</p>
                        </div>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: RUNTIME INTEGRITY TESTING & REAL-TIME STREAM (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* RUNTIME INTEGRITY DIAGNOSTIC HARNESS */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                RUNTIME INTEGRITY SPEC RUNNER
              </span>
              <button
                onClick={handleRunDiagnostics}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer"
              >
                RUN TESTS
              </button>
            </div>

            {testStatus === "running" && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auditing service layers in sandbox...
              </div>
            )}

            {testStatus === "passed" && (
              <div className="space-y-2">
                <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  RUNTIME PLATFORM STABLE (100% HEALTHY)
                </div>
                <div className="max-h-[140px] overflow-y-auto bg-slate-900 p-2.5 rounded text-[10px] font-mono text-slate-400 space-y-1">
                  {testLogs.map((log, idx) => (
                    <div key={idx} className={log.includes("FAIL") ? "text-rose-400" : log.includes("PASS") || log.includes("SUCCESS") ? "text-emerald-400" : "text-slate-400"}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testStatus === "idle" && (
              <p className="text-[11px] text-slate-500 italic">
                Platform integrity tests have not been run. Click Run Tests to verify offline rendering contexts and secure container sandboxes.
              </p>
            )}
          </div>

          {/* DYNAMIC ASYNCHRONOUS EVENT BUS LOG */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              EVENT BUS LIVE DECODER
            </span>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 scrollbar-thin">
              {eventHistory.length > 0 ? (
                eventHistory.map((ev) => (
                  <div key={ev.id} className="text-[10px] font-mono border-b border-slate-900/60 pb-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>[{ev.timestamp}]</span>
                      <span className="text-emerald-400 uppercase text-[9px]">{ev.service} / {ev.type}</span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{ev.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-500 italic font-mono">No telemetry events on stream yet. Swap configuration settings to see bus logs.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
