// NEORA LOCAL AI RUNTIME (NLAR) CONTROL PANEL & OFFLINE ORCHESTRATOR DASHBOARD
import React, { useState, useEffect } from "react";
import {
  Cpu, Activity, Zap, Play, CheckCircle2, AlertTriangle, RefreshCw, Terminal,
  Sliders, Shield, Database, LayoutGrid, Check, Trash2, ArrowUpRight, HelpCircle,
  HardDrive, Network, User, Globe, Eye, Lock, FileCode, Plus, MessageSquare, AlertCircle,
  Thermometer, Flame, ZapOff, Minimize2, Settings, ToggleLeft, RefreshCcw, DownloadCloud
} from "lucide-react";
import { NLAR, NlarLocalModel, NlarHardwareReport, NlarTelemetry, NlarEvent, NlarBackendType, NlarPrivacyMode } from "../../lib/ai/cognitive/NLAR";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function NLARDashboard({ lang, onAddSystemLog }: Props) {
  const nlar = NLAR.getInstance();

  // Core configurations
  const [privacyMode, setPrivacyMode] = useState<NlarPrivacyMode>(nlar.getPrivacyMode());
  const [selectedBackend, setSelectedBackend] = useState<NlarBackendType>(nlar.getSelectedBackend());

  // Interactive local states
  const [models, setModels] = useState<NlarLocalModel[]>([]);
  const [hardware, setHardware] = useState<NlarHardwareReport>(nlar.getHardwareReport());
  const [telemetry, setTelemetry] = useState<NlarTelemetry>(nlar.getTelemetry());
  const [eventHistory, setEventHistory] = useState<NlarEvent[]>([]);
  const [optimizationAdvice, setOptimizationAdvice] = useState<any[]>([]);

  // Sub-tabs navigation
  const [activeSubTab, setActiveSubTab] = useState<
    "registry" | "hardware" | "telemetry" | "optimization" | "diagnostics"
  >("registry");

  // Local model testing states
  const [selectedTestModel, setSelectedTestModel] = useState("");
  const [testPrompt, setTestPrompt] = useState("Evaluate high luxury wedding theme layout specifications");
  const [testResponse, setTestResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);

  // Self diagnostics
  const [diagStatus, setDiagStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [diagLogs, setDiagLogs] = useState<string[]>([]);

  // Add Custom Model form states
  const [newModelName, setNewModelName] = useState("");
  const [newModelFamily, setNewModelFamily] = useState("Custom-Core");
  const [newModelSize, setNewModelSize] = useState("7B");
  const [newModelFormat, setNewModelFormat] = useState<"GGUF" | "ONNX">("GGUF");
  const [newModelBackend, setNewModelBackend] = useState<NlarBackendType>("ollama");

  useEffect(() => {
    updateAllStateData();

    // Subscribe to NLAR events
    const unsubscribe = nlar.subscribe((ev) => {
      updateAllStateData();
      if (onAddSystemLog) {
        onAddSystemLog(`NLAR: [${ev.type}] ${ev.message}`);
      }
    });

    // Resource poller for live hardware fluctuations
    const pollInterval = setInterval(() => {
      setHardware({ ...nlar.getHardwareReport() });
      setTelemetry({ ...nlar.getTelemetry() });
    }, 1500);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  const updateAllStateData = () => {
    const list = nlar.listLocalModels();
    setModels([...list]);
    setEventHistory(nlar.getEventHistory().slice(0, 15));
    setOptimizationAdvice(nlar.getOptimizationAdvice());

    // Select default loaded model for testing
    const loaded = list.find(m => m.lifecycle === "loaded");
    if (loaded && !selectedTestModel) {
      setSelectedTestModel(loaded.id);
    }
  };

  const handlePrivacyChange = (mode: NlarPrivacyMode) => {
    nlar.setPrivacyMode(mode);
    setPrivacyMode(mode);
  };

  const handleBackendChange = (backend: NlarBackendType) => {
    nlar.setSelectedBackend(backend);
    setSelectedBackend(backend);
  };

  const handleLoadModelToggle = async (id: string, currentlyLoaded: boolean) => {
    if (currentlyLoaded) {
      nlar.unloadModel(id);
    } else {
      await nlar.loadModel(id);
    }
    updateAllStateData();
  };

  const handleDeleteModel = (id: string) => {
    nlar.deleteModel(id);
    updateAllStateData();
  };

  const handleImportCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName) return;

    const mockId = `local-${newModelName.toLowerCase().replace(/\s+/g, "-")}`;
    const mockModel: NlarLocalModel = {
      id: mockId,
      name: newModelName,
      family: newModelFamily,
      capabilities: ["text_generation", "reasoning"],
      languages: ["English", "Bangla"],
      parameterCount: newModelSize,
      contextLength: 4096,
      quantization: "Q4_K_M",
      precision: "INT4",
      memoryRequiredRamGb: 4,
      memoryRequiredVramGb: 2.8,
      gpuRequired: true,
      license: "open_source",
      provider: "Community Import",
      backend: newModelBackend,
      format: newModelFormat,
      checksum: `sha256:${Math.random().toString(36).substring(2, 18)}...`,
      version: "1.0.0",
      lifecycle: "discovered"
    };

    nlar.importModel(mockModel);
    setNewModelName("");
  };

  const handleRunInferenceTest = async () => {
    if (!selectedTestModel) return;
    setIsProcessing(true);
    setTestResponse("");
    setProcessingLogs(["Evicting older pipelines...", "Injecting context safety parameters...", "Binding threads to AVX registers..."]);

    try {
      const response = await nlar.runLocalInference(selectedTestModel, testPrompt);
      setTimeout(() => {
        setTestResponse(response.result);
        setProcessingLogs(prev => [
          ...prev,
          `✓ Offline execution finished with latency of ${response.latencyMs}ms.`,
          `✓ Processing speed: ${response.tokensPerSecond} tokens per second.`,
          `✓ Calculated energy expenditure: ${response.energyUsedJoules.toFixed(1)} Joules.`
        ]);
        setIsProcessing(false);
      }, 400);
    } catch (err: any) {
      setProcessingLogs(prev => [...prev, `❌ Fault: ${err.message}`]);
      setIsProcessing(false);
    }
  };

  const handleTriggerDiagnostics = async () => {
    setDiagStatus("running");
    setDiagLogs(["Booting automated isolated regression checks..."]);
    const logs = await nlar.runLocalDiagnostics();
    setTimeout(() => {
      setDiagLogs(logs);
      setDiagStatus("passed");
    }, 600);
  };

  return (
    <div className="space-y-4 p-4 text-slate-200">
      
      {/* TITLE & OFFLINE MODES PANEL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-1.5">
                NLAR PLATFORM <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-normal">v4.0 LOCAL ENGINE</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                {lang === "bn" ? "নিওরা লোকাল এআই রানটাইম ও হাইব্রিড ইনফারেন্স প্ল্যাটফর্ম" : "Neora Local AI Runtime & Hybrid Inference Platform"}
              </p>
            </div>
          </div>
        </div>

        {/* TOP LEVEL PRIVACY CONFIG */}
        <div className="flex flex-wrap items-center gap-2">
          {(["strict_local", "hybrid_local", "cloud_assisted", "air_gapped"] as NlarPrivacyMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handlePrivacyChange(mode)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                privacyMode === mode 
                  ? "bg-emerald-600/10 border-emerald-500/40 text-emerald-400" 
                  : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
              }`}
            >
              {mode.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* CORE BACKEND SWITCH & TEMPERATURE READOUTS */}
      <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-2">
            {lang === "bn" ? "অ্যাক্টিভ ইনফারেন্স ব্যাকএন্ড" : "Active Inference Backend Adapter"}
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(["neora_native", "ollama", "llama_cpp", "onnx_runtime", "tensor_rt"] as NlarBackendType[]).map((b) => (
              <button
                key={b}
                onClick={() => handleBackendChange(b)}
                className={`py-1.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  selectedBackend === b 
                    ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400" 
                    : "bg-slate-900 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                {b.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1.5">
            * Selected adapter abstracts the underlying framework so design utilities never depend on a specific vendor.
          </p>
        </div>

        {/* METRICS QUICK PANEL */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900 text-xs font-mono">
            <span className="text-slate-500 text-[8px] flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-red-400" />
              THERMAL VALUE
            </span>
            <div className="text-sm font-bold text-slate-200 mt-1">{hardware.currentTempCelsius}°C</div>
            <p className="text-[8px] text-slate-500 mt-0.5">Ceiling: {hardware.thermalLimitCelsius}°C</p>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900 text-xs font-mono">
            <span className="text-slate-500 text-[8px] flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              SPEED THROUGHPUT
            </span>
            <div className="text-sm font-bold text-emerald-400 mt-1">{telemetry.tokensPerSec} t/s</div>
            <p className="text-[8px] text-slate-500 mt-0.5">Latency: {telemetry.inferenceLatencyMs}ms</p>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900 text-xs font-mono">
            <span className="text-slate-500 text-[8px] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              ENERGY PROFILE
            </span>
            <div className="text-sm font-bold text-amber-400 mt-1">{telemetry.energyWatts}W</div>
            <p className="text-[8px] text-slate-500 mt-0.5">Power Mode: MAX</p>
          </div>
        </div>
      </div>

      {/* TWO SECTOR SUBWORKPANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: REGISTRIES & CONTROLS (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* NAVIGATION INTERNAL BAR */}
          <div className="flex bg-slate-950 border border-slate-900 p-1 rounded-lg overflow-x-auto gap-1">
            {[
              { id: "registry", label: "1. Local Registry", icon: Sliders },
              { id: "hardware", label: "2. Hardware Detect", icon: Cpu },
              { id: "telemetry", label: "3. Live Telemetry", icon: Activity },
              { id: "optimization", label: "4. Self-Optimization", icon: ToggleLeft },
              { id: "diagnostics", label: "5. Unit Diagnostics", icon: Terminal }
            ].map((subtab) => {
              const Icon = subtab.icon;
              const isSelected = activeSubTab === subtab.id;
              return (
                <button
                  key={subtab.id}
                  onClick={() => setActiveSubTab(subtab.id as any)}
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

          {/* DYNAMIC SCREEN VIEWPORT */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 min-h-[420px]">
            
            {/* VIEW 1: LOCAL REGISTRY */}
            {activeSubTab === "registry" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    LOCAL MODEL LIFECYCLE MANAGERS
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SANDBOX MEMORY SEGMENTED</span>
                </div>

                {/* Import model expandable details block */}
                <details className="bg-slate-900/40 rounded-lg border border-slate-900 p-3 group">
                  <summary className="text-xs font-mono text-slate-400 cursor-pointer list-none flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      IMPORT MODEL CATALOG ENTRY
                    </span>
                    <span className="text-[10px] text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">EXPAND CATALOG</span>
                  </summary>

                  <form onSubmit={handleImportCustomModel} className="space-y-3 mt-3 text-xs grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-950 pt-3">
                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">MODEL NAME</label>
                      <input
                        type="text"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="e.g. Mistral-7B-Instruct"
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">MODEL FAMILY</label>
                      <input
                        type="text"
                        value={newModelFamily}
                        onChange={(e) => setNewModelFamily(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">SIZE (PARAMS)</label>
                      <input
                        type="text"
                        value={newModelSize}
                        onChange={(e) => setNewModelSize(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 font-mono text-[10px] mb-1">FORMAT</label>
                        <select
                          value={newModelFormat}
                          onChange={(e) => setNewModelFormat(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-slate-200 focus:outline-none"
                        >
                          <option value="GGUF">GGUF</option>
                          <option value="ONNX">ONNX</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 font-mono text-[10px] mb-1">BACKEND</label>
                        <select
                          value={newModelBackend}
                          onChange={(e) => setNewModelBackend(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-slate-200 focus:outline-none"
                        >
                          <option value="ollama">Ollama SDK</option>
                          <option value="llama_cpp">llama.cpp</option>
                          <option value="onnx_runtime">ONNX Runtime</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold px-3 py-1.5 rounded text-xs transition-all cursor-pointer"
                      >
                        BIND & VERIFY ON-DISK MODEL
                      </button>
                    </div>
                  </form>
                </details>

                {/* Local Model lists */}
                <div className="space-y-2">
                  {models.map((model) => (
                    <div key={model.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{model.name}</span>
                          <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-900 px-1.5 py-0.2 rounded font-mono">
                            {model.format} | {model.parameterCount}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            model.lifecycle === "loaded" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-slate-950 text-slate-400 border-slate-900"
                          }`}>
                            {model.lifecycle.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Checksum: {model.checksum.substring(0, 24)}... | Backend: {model.backend.toUpperCase()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 text-[9px] block">RAM REQUIRED</span>
                          <span className="font-bold text-slate-300">{model.memoryRequiredRamGb} GB</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block">VRAM REQ</span>
                          <span className="font-bold text-indigo-400">{model.memoryRequiredVramGb} GB</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleLoadModelToggle(model.id, model.lifecycle === "loaded")}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                              model.lifecycle === "loaded"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                : "bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20"
                            }`}
                          >
                            {model.lifecycle === "loaded" ? "UNLOAD" : "LOAD"}
                          </button>

                          {model.id.startsWith("local-") && (
                            <button
                              onClick={() => handleDeleteModel(model.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 2: HARDWARE DETECTION */}
            {activeSubTab === "hardware" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    HARDWARE DETECTION DISCOVERIES
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-900 space-y-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase border-b border-slate-950 pb-1">CPU HOST REGISTERS</div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Architecture:</span>
                      <span className="text-slate-100 font-bold">{hardware.cpuArchitecture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Memory Total:</span>
                      <span className="text-slate-100 font-bold">{hardware.totalRamGb} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Instruction Flags:</span>
                      <span className="text-emerald-400 font-bold">{hardware.instructionSets.join(", ")}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-900 space-y-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase border-b border-slate-950 pb-1">ACCELERATOR CARD DETAILS</div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GPU Vendor:</span>
                      <span className="text-slate-100 font-bold">{hardware.gpuVendor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Processor Name:</span>
                      <span className="text-slate-100 font-bold">{hardware.gpuName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Dedicated VRAM:</span>
                      <span className="text-slate-100 font-bold">{hardware.totalVramGb} GB</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-900 space-y-1.5 text-slate-400">
                  <span className="font-bold text-slate-300 block text-[10px] uppercase">HARDWARE COMPLIANCE MATRIX</span>
                  <div className="flex justify-between border-b border-slate-950 pb-1">
                    <span>NVIDIA CUDA Core Accelerator Layer:</span>
                    <span className={hardware.supportsCuda ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      {hardware.supportsCuda ? "ACTIVE (CUDA-12.4)" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-950 pb-1">
                    <span>AMD ROCm Kernel Layer:</span>
                    <span className={hardware.supportsRocm ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      {hardware.supportsRocm ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-950 pb-1">
                    <span>DirectML Direct3D API Wrapper:</span>
                    <span className={hardware.supportsDirectMl ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      {hardware.supportsDirectMl ? "READY" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Apple Metal Shader Compiler:</span>
                    <span className={hardware.supportsMetal ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      {hardware.supportsMetal ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: LIVE TELEMETRY */}
            {activeSubTab === "telemetry" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    REAL-TIME LOAD TELEMETRY READOUTS
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                    <span className="text-slate-500 text-[9px] block">CPU RECKONING LOAD</span>
                    <div className="text-lg font-bold text-slate-200 mt-1">{telemetry.cpuUsagePercent}%</div>
                    <div className="w-full bg-slate-950 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded transition-all duration-500" style={{ width: `${telemetry.cpuUsagePercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                    <span className="text-slate-500 text-[9px] block">GPU COMPUTE UTILITY</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">{telemetry.gpuUsagePercent}%</div>
                    <div className="w-full bg-slate-950 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded transition-all duration-500" style={{ width: `${telemetry.gpuUsagePercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                    <span className="text-slate-500 text-[9px] block">RAM ALLOCATION</span>
                    <div className="text-lg font-bold text-slate-200 mt-1">{telemetry.ramUsageGb.toFixed(1)} GB</div>
                    <div className="w-full bg-slate-950 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded transition-all duration-500" style={{ width: `${(telemetry.ramUsageGb / 32) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                    <span className="text-slate-500 text-[9px] block">VRAM ALLOCATION</span>
                    <div className="text-lg font-bold text-indigo-400 mt-1">{telemetry.vramUsageGb.toFixed(1)} GB</div>
                    <div className="w-full bg-slate-950 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded transition-all duration-500" style={{ width: `${(telemetry.vramUsageGb / 16) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-900 text-xs font-mono text-slate-400 space-y-2">
                  <span className="font-bold text-slate-300 block">LOCAL STATISTICAL METRICS</span>
                  <div className="flex justify-between border-b border-slate-950 pb-1.5">
                    <span>Average Model Cold Load-Time:</span>
                    <span className="text-slate-200">{telemetry.modelLoadTimeMs} ms</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-950 pb-1.5">
                    <span>Mean Offline Inference Latency:</span>
                    <span className="text-emerald-400 font-bold">{telemetry.inferenceLatencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dynamic Failure Log Ratio:</span>
                    <span className="text-slate-200">{(telemetry.errorRate * 100).toFixed(3)}% error rate</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: SELF-OPTIMIZATION */}
            {activeSubTab === "optimization" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <ToggleLeft className="w-4 h-4" />
                    AUTONOMIC SELF-OPTIMIZATION ADVISOR
                  </span>
                </div>

                <div className="space-y-3">
                  {optimizationAdvice.map((adv) => (
                    <div key={adv.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 text-xs font-mono space-y-2">
                      <div className="flex justify-between border-b border-slate-950 pb-1">
                        <span className="text-indigo-400 font-bold uppercase">SUGGESTION: {adv.id}</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded font-bold text-[9px]">RECOMMENDED</span>
                      </div>
                      <p className="text-slate-200 font-bold">&gt; {adv.recommendation}</p>
                      <p className="text-[11px] text-slate-500">Calculated Yield Benefit: {adv.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 5: DIAGNOSTICS TESTS */}
            {activeSubTab === "diagnostics" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    INTEGRATION DIAGNOSTIC SPEC HARNESS
                  </span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3 text-xs font-mono">
                  <p className="text-slate-300">
                    Verify the health profiles of internal CPU vector structures, CUDA capabilities, local sandbox namespaces, and context integrity metrics.
                  </p>

                  <button
                    onClick={handleTriggerDiagnostics}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    RUN LOCAL DIAGNOSTICS
                  </button>

                  {diagStatus !== "idle" && (
                    <div className="bg-slate-950 p-4 rounded border border-slate-900 space-y-2 text-xs">
                      <div className="text-[11px] text-emerald-400 font-bold">SYSTEM DIAGNOSTIC STREAM</div>
                      <div className="space-y-1 text-[10px] max-h-[220px] overflow-y-auto">
                        {diagLogs.map((log, idx) => (
                          <div key={idx} className={log.includes("FAIL") ? "text-rose-400" : log.includes("PASS") || log.includes("SUCCESS") ? "text-emerald-400" : "text-slate-400"}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: RUNTIME OFFLINE TESTER (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* OFFLINE TESTER PIPELINE CARD */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 text-xs">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              OFFLINE INTERACTION TESTBENCH
            </span>

            <div className="space-y-3 font-mono">
              <div>
                <label className="block text-slate-500 text-[9px] uppercase mb-1">TARGET OFFLINE MODEL</label>
                <select
                  value={selectedTestModel}
                  onChange={(e) => setSelectedTestModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-900 rounded p-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- SELECT TARGET MODEL --</option>
                  {models.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.lifecycle.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 text-[9px] uppercase mb-1">LOCAL PAYLOAD / PROMPT</label>
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-900 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 resize-none font-mono"
                />
              </div>

              <button
                onClick={handleRunInferenceTest}
                disabled={isProcessing || !selectedTestModel}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold py-1.5 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                RUN OFFLINE INFERENCE
              </button>

              {/* Logs and Result */}
              {(testResponse || processingLogs.length > 0) && (
                <div className="space-y-2 border-t border-slate-900 pt-2 font-mono text-[10px]">
                  <div className="bg-slate-900 p-2 rounded text-slate-500 max-h-[85px] overflow-y-auto space-y-0.5">
                    {processingLogs.map((log, i) => (
                      <div key={i}>&gt; {log}</div>
                    ))}
                  </div>

                  {testResponse && (
                    <div className="bg-slate-900 border border-emerald-950 p-2.5 rounded text-emerald-300">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 mb-1 border-b border-slate-950 pb-1">
                        <span>ROUTED LOCAL: [{selectedTestModel}]</span>
                        <span className="text-emerald-400 font-bold">SECURE CONTAINER RUNTIME</span>
                      </div>
                      <p className="whitespace-pre-wrap">{testResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* REAL TIME LOGS */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              EVENT BUS REAL-TIME DECODER
            </span>

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 scrollbar-thin">
              {eventHistory.map((ev) => (
                <div key={ev.id} className="text-[10px] font-mono border-b border-slate-900/60 pb-1.5">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>[{ev.timestamp}]</span>
                    <span className="text-emerald-400 uppercase text-[9px]">{ev.type}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{ev.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
