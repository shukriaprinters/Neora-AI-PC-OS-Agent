// NEORA UNIVERSAL AI RUNTIME (NUAR) CONTROL PANEL & HYBRID ORCHESTRATOR DASHBOARD
import React, { useState, useEffect } from "react";
import {
  Cpu, Activity, Zap, Play, CheckCircle2, AlertTriangle, RefreshCw, Terminal,
  Sliders, Shield, Database, LayoutGrid, Check, Trash2, ArrowUpRight, HelpCircle,
  HardDrive, Network, User, Globe, Eye, Lock, FileCode, Plus, MessageSquare, AlertCircle
} from "lucide-react";
import { NUAR, NuarModel, NuarEvent, NuarTelemetrySnapshot, NuarMemoryBlock, NuarSecurityAudit, NuarPipelineStep, NuarCapability, NuarProviderType, NuarExecutionTarget, NuarGpuAcceleration } from "../../lib/ai/cognitive/NUAR";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function NUARDashboard({ lang, onAddSystemLog }: Props) {
  const nuar = NUAR.getInstance();

  // Core state configurations
  const [executionTarget, setExecutionTarget] = useState<NuarExecutionTarget>(nuar.getExecutionTarget());
  const [gpuAcceleration, setGpuAcceleration] = useState<NuarGpuAcceleration>(nuar.getGpuAcceleration());
  const [offlineMode, setOfflineMode] = useState(nuar.isOfflineMode());
  const [privacyStrict, setPrivacyStrict] = useState(nuar.isPrivacyStrict());

  // Lists & Telemetry State
  const [models, setModels] = useState<NuarModel[]>([]);
  const [memoryFacts, setMemoryFacts] = useState<NuarMemoryBlock[]>([]);
  const [telemetry, setTelemetry] = useState<NuarTelemetrySnapshot>(nuar.getTelemetry());
  const [eventHistory, setEventHistory] = useState<NuarEvent[]>([]);
  const [securityAudits, setSecurityAudits] = useState<NuarSecurityAudit[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<
    "registry" | "pipelines" | "memory" | "telemetry" | "security" | "harness"
  >("registry");

  // Interaction Forms & Simulations
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [simulatedPrompt, setSimulatedPrompt] = useState("Draft invitation details for Pohela Boishakh celebration");
  const [simulatedCapability, setSimulatedCapability] = useState<NuarCapability>("text_generation");
  const [simulatedResponse, setSimulatedResponse] = useState("");
  const [simulatedRoutedModel, setSimulatedRoutedModel] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // Custom model form state
  const [newModelName, setNewModelName] = useState("");
  const [newModelProvider, setNewModelProvider] = useState<NuarProviderType>("neora_native");
  const [newModelCapability, setNewModelCapability] = useState<NuarCapability>("text_generation");
  const [newModelLatency, setNewModelLatency] = useState(120);

  // Custom Memory form state
  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [newMemoryValue, setNewMemoryValue] = useState("");
  const [newMemoryType, setNewMemoryType] = useState<NuarMemoryBlock["contextType"]>("project");

  // Custom Pipeline form state
  const [pipelineName, setPipelineName] = useState("Custom Vector Layout Flow");
  const [pipelinePrompt, setPipelinePrompt] = useState("Generate golden ornamental borders with vector precision");

  useEffect(() => {
    updateAllStateData();

    // Subscribe to NUAR event bus
    const unsubscribe = nuar.subscribe((ev) => {
      updateAllStateData();
      if (onAddSystemLog) {
        onAddSystemLog(`NUAR: [${ev.type}] ${ev.message}`);
      }
    });

    // Resource poller for live performance charts
    const pollInterval = setInterval(() => {
      setTelemetry({ ...nuar.getTelemetry() });
    }, 1500);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  const updateAllStateData = () => {
    setModels([...nuar.listModels()]);
    setMemoryFacts([...nuar.getMemoryFacts()]);
    setEventHistory(nuar.getEventHistory().slice(0, 15));
    setSecurityAudits([...nuar.getSecurityAudits()]);
    setPipelines([...nuar.getPipelines()]);
  };

  const handleExecutionTargetChange = (target: NuarExecutionTarget) => {
    nuar.setExecutionTarget(target);
    setExecutionTarget(target);
  };

  const handleGpuAccelerationChange = (acc: NuarGpuAcceleration) => {
    nuar.setGpuAcceleration(acc);
    setGpuAcceleration(acc);
  };

  const handleOfflineModeToggle = () => {
    const next = !offlineMode;
    nuar.setOfflineMode(next);
    setOfflineMode(next);
  };

  const handlePrivacyStrictToggle = () => {
    const next = !privacyStrict;
    nuar.setPrivacyStrict(next);
    setPrivacyStrict(next);
  };

  const handleExecuteInferenceSimulation = async () => {
    setIsSimulating(true);
    setSimulatedResponse("");
    setSimulatedRoutedModel("");
    setSimulationLogs(["Routing prompt to optimal available adapters..."]);

    try {
      const response = await nuar.executeInference(simulatedCapability, simulatedPrompt);
      setTimeout(() => {
        setSimulatedResponse(response.result);
        setSimulatedRoutedModel(response.routedModelId);
        setSimulationLogs(prev => [
          ...prev,
          `✓ Dispatched query to model [${response.routedModelId}] successfully.`,
          `✓ Completed with roundtrip latency of ${response.latencyMs}ms.`
        ]);
        setIsSimulating(false);
      }, 400);
    } catch (err: any) {
      setSimulationLogs(prev => [...prev, `❌ Routing failed: ${err.message}`]);
      setIsSimulating(false);
    }
  };

  const handleRegisterCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName) return;

    const mockId = `custom-${newModelName.toLowerCase().replace(/\s+/g, "-")}-${Math.floor(Math.random() * 1000)}`;
    const model: NuarModel = {
      id: mockId,
      name: newModelName,
      provider: newModelProvider,
      capabilities: [newModelCapability],
      latencyMs: newModelLatency,
      costPer1kTokensInput: 0.0001,
      costPer1kTokensOutput: 0.0003,
      availability: "online",
      supportedLanguages: ["English", "Bangla"],
      gpuRequired: false,
      memoryRequiredGb: 2,
      licensing: "open_source",
      offlineCapable: true,
      version: "1.0.0",
      qualityScore: 7.8,
      errorRate: 0.01,
      activeQueueLength: 0
    };

    nuar.registerModel(model);
    setNewModelName("");
  };

  const handleUnregisterModel = (id: string) => {
    nuar.removeModel(id);
  };

  const handleAddMemoryFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey || !newMemoryValue) return;

    nuar.saveMemoryFact(newMemoryKey, newMemoryValue, newMemoryType);
    setNewMemoryKey("");
    setNewMemoryValue("");
  };

  const handleDeleteMemoryFact = (key: string) => {
    nuar.deleteMemoryFact(key);
  };

  const handleLaunchPipeline = () => {
    const steps: NuarPipelineStep[] = [
      { stepId: "step-1", capability: "planning", promptTemplate: `Draft strategy details: ${pipelinePrompt}`, status: "pending" },
      { stepId: "step-2", capability: "text_generation", promptTemplate: `Formulate descriptive script details: ${pipelinePrompt}`, status: "pending" },
      { stepId: "step-3", capability: "code_generation", promptTemplate: `Generate vector coordinate boundaries for: ${pipelinePrompt}`, status: "pending" }
    ];

    nuar.createPipeline(pipelineName, steps);
  };

  const handleRunKernelTests = async () => {
    setTestStatus("running");
    setTestLogs(["Launching NUAR automated capability & routing audits..."]);
    const logs = await nuar.runKernelUnitTests();
    setTimeout(() => {
      setTestLogs(logs);
      setTestStatus("passed");
    }, 600);
  };

  return (
    <div className="space-y-4 p-4 text-slate-200">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-1.5">
                NUAR KERNEL <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-normal">v16.0 AI OS</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                {lang === "bn" ? "নিওরা ইউনিভার্সাল এআই রানটাইম ও হাইব্রিড অর্কেস্ট্রেটর" : "Neora Universal AI Runtime & Hybrid Model Orchestrator"}
              </p>
            </div>
          </div>
        </div>

        {/* TOP LEVEL SWITCHES */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOfflineModeToggle}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              offlineMode 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {offlineMode ? "AIR-GAPPED (OFFLINE)" : "ONLINE HYBRID"}
          </button>

          <button
            onClick={handlePrivacyStrictToggle}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              privacyStrict 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {privacyStrict ? "STRICT PRIVATE" : "STANDARD ENCRYPT"}
          </button>
        </div>
      </div>

      {/* SYSTEM ARCHITECTURE TOPOLOGY SETTINGS */}
      <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-2">
            {lang === "bn" ? "এক্সিকিউশন ডিস্ট্রিবিউশন টার্গেট" : "Inference Execution Target"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["local_edge", "cloud_cluster", "hybrid_distributed"] as NuarExecutionTarget[]).map((t) => (
              <button
                key={t}
                onClick={() => handleExecutionTargetChange(t)}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  executionTarget === t 
                    ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400" 
                    : "bg-slate-900 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                {t.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1.5">
            * Local Edge restricts all out-of-container requests. Cloud cluster utilizes high-power visual processing models.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-2">
            {lang === "bn" ? "হার্ডওয়্যার অ্যাক্সিলারেটর ইঞ্জিন" : "Inference Hardware Accelerator"}
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(["cuda", "rocm", "directml", "metal", "cpu_fallback"] as NuarGpuAcceleration[]).map((acc) => (
              <button
                key={acc}
                onClick={() => handleGpuAccelerationChange(acc)}
                className={`py-1.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  gpuAcceleration === acc 
                    ? "bg-emerald-600/10 border-emerald-500/40 text-emerald-400" 
                    : "bg-slate-900 border-slate-900 text-slate-400 hover:border-slate-800"
                }`}
              >
                {acc.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 italic mt-1.5">
            * Automatic pipeline fallbacks keep systems online if specific GPU architectures are missing.
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT SECTOR: ACTIVE OPERATION WORKBENCH (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* SERVICE NAVIGATION SELECTION */}
          <div className="flex bg-slate-950 border border-slate-900 p-1 rounded-lg overflow-x-auto gap-1">
            {[
              { id: "registry", label: "1. Model Registry", icon: Sliders },
              { id: "pipelines", label: "2. Chained Pipelines", icon: LayoutGrid },
              { id: "memory", label: "3. Context Memory", icon: Database },
              { id: "telemetry", label: "4. Kernel Telemetry", icon: Activity },
              { id: "security", label: "5. Security Auditing", icon: Shield },
              { id: "harness", label: "6. Diagnostics & Specs", icon: Terminal }
            ].map((subtab) => {
              const Icon = subtab.icon;
              const isSelected = activeSubTab === subtab.id;
              return (
                <button
                  key={subtab.id}
                  onClick={() => setActiveSubTab(subtab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isSelected ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-slate-200"
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
            
            {/* 1. MODEL REGISTRY SHEET */}
            {activeSubTab === "registry" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    REGISTERED AI CORE MODELS
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">DYNAMIC ROUTING AGENTS ENABLED</span>
                </div>

                {/* Model registration form inline expandable */}
                <details className="bg-slate-900/40 rounded-lg border border-slate-900 p-3 group">
                  <summary className="text-xs font-mono text-slate-400 cursor-pointer list-none flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      REGISTER CUSTOM MODEL ADAPTER
                    </span>
                    <span className="text-[10px] text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">EXPAND TO FORMULATE</span>
                  </summary>

                  <form onSubmit={handleRegisterCustomModel} className="space-y-3 mt-3 text-xs grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-950 pt-3">
                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">MODEL NAME</label>
                      <input
                        type="text"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="e.g. Llama-3-Refined-Fine-Tune"
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">PROVIDER ADAPTER TYPE</label>
                      <select
                        value={newModelProvider}
                        onChange={(e) => setNewModelProvider(e.target.value as NuarProviderType)}
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="neora_native">Neora Native AI</option>
                        <option value="ollama">Ollama SDK</option>
                        <option value="openai">OpenAI Compatible API</option>
                        <option value="gemini">Google Gemini SDK</option>
                        <option value="anthropic">Anthropic API</option>
                        <option value="openrouter">OpenRouter Endpoint</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">CORE TARGET CAPABILITY</label>
                      <select
                        value={newModelCapability}
                        onChange={(e) => setNewModelCapability(e.target.value as NuarCapability)}
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="text_generation">Text Generation</option>
                        <option value="reasoning">Deductive Reasoning</option>
                        <option value="image_generation">Image Synthesis</option>
                        <option value="code_generation">Code / SVG Generation</option>
                        <option value="planning">Creative Planning DAG</option>
                        <option value="speech_recognition">Speech Transcription</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">AVERAGE BASE LATENCY (MS)</label>
                      <input
                        type="number"
                        value={newModelLatency}
                        onChange={(e) => setNewModelLatency(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold px-3 py-1.5 rounded transition-all cursor-pointer text-xs"
                      >
                        DYNAMICALLY BIND TO REGISTRY
                      </button>
                    </div>
                  </form>
                </details>

                {/* Model List Grid */}
                <div className="space-y-2">
                  {models.map((model) => (
                    <div key={model.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{model.name}</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            model.availability === "online" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            {model.availability.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ID: {model.id} | Ver: {model.version} | Licensing: {model.licensing}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500 text-[9px] block">LATENCY</span>
                          <span className="font-bold text-slate-300">{model.latencyMs}ms</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block">QUALITY</span>
                          <span className="font-bold text-indigo-400">{model.qualityScore}/10</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block">ACCEL</span>
                          <span className={model.gpuRequired ? "text-purple-400 font-bold" : "text-slate-500"}>
                            {model.gpuRequired ? "GPU" : "CPU"}
                          </span>
                        </div>
                        {model.id.startsWith("custom-") && (
                          <button
                            onClick={() => handleUnregisterModel(model.id)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. CHAINED PIPELINES */}
            {activeSubTab === "pipelines" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4" />
                    MULTI-MODEL CHAINED PIPELINES
                  </span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-4 text-xs">
                  <p className="text-slate-300">
                    NUAR supports complex pipelines where different specialized models handle individual steps sequentially, passing structured outputs down the chain.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">PIPELINE NAME</label>
                      <input
                        type="text"
                        value={pipelineName}
                        onChange={(e) => setPipelineName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-mono text-[10px] mb-1">PROMPT SEED FOR CHAIN</label>
                      <input
                        type="text"
                        value={pipelinePrompt}
                        onChange={(e) => setPipelinePrompt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchPipeline}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    DISPATCH SEQUENTIAL PIPELINE
                  </button>
                </div>

                <div className="space-y-3">
                  {pipelines.map((pipe) => (
                    <div key={pipe.id} className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-950 pb-2">
                        <span className="font-mono font-bold text-indigo-400 text-xs uppercase">
                          PIPELINE ID: {pipe.id} | {pipe.name}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          pipe.status === "completed" 
                            ? "bg-emerald-500/15 text-emerald-400" 
                            : "bg-indigo-500/15 text-indigo-400 animate-pulse"
                        }`}>
                          {pipe.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="relative border-l border-indigo-900/40 ml-2 pl-4 space-y-4 text-xs font-mono">
                        {pipe.steps.map((step: any, idx: number) => (
                          <div key={step.stepId} className="relative">
                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center"></div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-300">Stage {idx + 1}: {step.capability.toUpperCase()}</span>
                                <span className="text-[10px] text-slate-500">[{step.status}]</span>
                              </div>
                              <p className="text-slate-500 text-[10px] mt-0.5">Template: {step.promptTemplate}</p>
                              {step.output && (
                                <div className="mt-1.5 bg-slate-950 p-2 rounded text-[11px] text-indigo-300 border border-indigo-950/40">
                                  {step.output}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. CONTEXT MEMORY ENGAGEMENT */}
            {activeSubTab === "memory" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    UNIFIED MEMORY VAULT & PROJECT FACTS
                  </span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-4 text-xs">
                  <p className="text-slate-300">
                    Memory blocks are automatically injected into raw prompts during pipeline execution to maintain consistent design guidelines, brand voices, and user preferences.
                  </p>

                  <form onSubmit={handleAddMemoryFact} className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                    <div className="md:col-span-1">
                      <input
                        type="text"
                        value={newMemoryKey}
                        onChange={(e) => setNewMemoryKey(e.target.value)}
                        placeholder="Key (e.g. contrast_ratio)"
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={newMemoryValue}
                        onChange={(e) => setNewMemoryValue(e.target.value)}
                        placeholder="Value (e.g. WCAG 2.2 compliant AA)"
                        className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-1 flex gap-2">
                      <select
                        value={newMemoryType}
                        onChange={(e) => setNewMemoryType(e.target.value as any)}
                        className="bg-slate-950 border border-slate-900 rounded px-1.5 py-1 text-slate-200 focus:outline-none text-[11px]"
                      >
                        <option value="project">Project</option>
                        <option value="workspace">Workspace</option>
                        <option value="persistent">Persistent</option>
                        <option value="conversation">Chat</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-1.5 rounded cursor-pointer transition-colors flex items-center justify-center w-8"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-2">
                  {memoryFacts.map((fact) => (
                    <div key={fact.key} className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-indigo-400">{fact.key}</span>
                          <span className="bg-slate-950 text-slate-500 text-[9px] px-1.5 py-0.2 rounded border border-slate-900">
                            {fact.contextType.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">&gt; {fact.value}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{fact.updatedAt}</span>
                        <button
                          onClick={() => handleDeleteMemoryFact(fact.key)}
                          className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. PERFORMANCE TELEMETRY */}
            {activeSubTab === "telemetry" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    LIVE MODEL TELEMETRY AUDITING
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                    <span className="text-slate-500 text-[9px] block">CPU ENGINE LOAD</span>
                    <div className="text-lg font-bold text-slate-200 mt-1">{telemetry.cpuUsagePercent}%</div>
                    <div className="w-full bg-slate-950 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded transition-all duration-500" style={{ width: `${telemetry.cpuUsagePercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                    <span className="text-slate-500 text-[9px] block">GPU ALLOCATION</span>
                    <div className="text-lg font-bold text-indigo-400 mt-1">{telemetry.gpuUsagePercent}%</div>
                    <div className="w-full bg-slate-950 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded transition-all duration-500" style={{ width: `${telemetry.gpuUsagePercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                    <span className="text-slate-500 text-[9px] block">VRAM FOOTPRINT</span>
                    <div className="text-lg font-bold text-purple-400 mt-1">{telemetry.vramUsageGb.toFixed(1)} GB</div>
                    <div className="w-full bg-slate-950 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-purple-400 h-full rounded transition-all duration-500" style={{ width: `${(telemetry.vramUsageGb / 16) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs font-mono">
                    <span className="text-slate-500 text-[9px] block">ROUNDTRIP LATENCY</span>
                    <div className="text-lg font-bold text-cyan-400 mt-1">{telemetry.systemLatencyMs}ms</div>
                    <div className="w-full bg-slate-950 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded transition-all duration-500" style={{ width: `${(telemetry.systemLatencyMs / 500) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-lg space-y-2 text-xs font-mono text-slate-400">
                  <span className="font-bold text-slate-300 block">OBSERVABILITY SPECS</span>
                  <div className="flex justify-between border-b border-slate-950 pb-1.5">
                    <span>Active Inference Streams:</span>
                    <span className="text-indigo-400 font-bold">{telemetry.activeRequests} Channels</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-950 pb-1.5">
                    <span>Total Token Metered Throughput:</span>
                    <span className="text-slate-200">{telemetry.totalTokenThroughput} Input/Output Tokens</span>
                  </div>
                  <div className="flex justify-between pb-1.5">
                    <span>Active Hardware Acceleration:</span>
                    <span className="text-emerald-400 font-bold uppercase">{telemetry.selectedAcceleration} Mode</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SECURITY AUDITING */}
            {activeSubTab === "security" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    CRYPTOGRAPHIC AUDIT SECURE RADAR
                  </span>
                </div>

                <div className="space-y-2">
                  {securityAudits.map((audit) => (
                    <div key={audit.id} className="bg-slate-900/60 border border-slate-900 p-3.5 rounded-lg text-xs font-mono flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">[{audit.timestamp}]</span>
                          <span className="bg-slate-950 text-indigo-400 border border-slate-900 px-2 py-0.2 rounded font-bold uppercase text-[9px]">
                            {audit.action}
                          </span>
                        </div>
                        <p className="text-slate-300">Inference request targeting model: <span className="text-slate-100 font-bold">[{audit.modelTarget}]</span></p>
                        <p className="text-[10px] text-slate-500 uppercase">CLIENT: {audit.clientIp} | Signature Verified: {audit.signatureVerified ? "TRUE" : "FALSE"}</p>
                      </div>

                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded text-[10px] font-bold">
                        AUTHORIZED
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. INTEGRITY HARNESS TESTS */}
            {activeSubTab === "harness" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    AUTOMATED SPECIFICATION INTEGRITY HARNESS
                  </span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3 text-xs">
                  <p className="text-slate-300">
                    Trigger the automated spec suite testing smart model routing, fault-tolerant cascading fallbacks, offline isolation, and memory retrievals.
                  </p>

                  <button
                    onClick={handleRunKernelTests}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    RUN HARNESS DIAGNOSTIC TESTS
                  </button>

                  {testStatus !== "idle" && (
                    <div className="bg-slate-950 p-4 rounded border border-slate-900 space-y-2 font-mono text-xs">
                      <div className="text-[11px] text-indigo-400 font-bold">TEST OUTPUT CONSOLE</div>
                      <div className="space-y-1 text-[10px] max-h-[220px] overflow-y-auto">
                        {testLogs.map((log, idx) => (
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

        {/* RIGHT SECTOR: ADAPTER TEST BENCH & LIVE DECODER (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* QUICK ADAPTER INFERENCE TESTER */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 text-xs">
            <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              AI ADAPTER TESTBENCH
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 font-mono text-[9px] uppercase mb-1">TARGET CAPABILITY</label>
                <select
                  value={simulatedCapability}
                  onChange={(e) => setSimulatedCapability(e.target.value as NuarCapability)}
                  className="w-full bg-slate-900 border border-slate-900 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="text_generation">Text Generation</option>
                  <option value="reasoning">Deductive Reasoning</option>
                  <option value="image_generation">Image Synthesis</option>
                  <option value="code_generation">Code / SVG Generation</option>
                  <option value="planning">Creative Planning DAG</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-mono text-[9px] uppercase mb-1">PROMPT / PAYLOAD</label>
                <textarea
                  value={simulatedPrompt}
                  onChange={(e) => setSimulatedPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-900 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none font-mono"
                />
              </div>

              {/* Trigger failure simulation toggle checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fail-checkbox"
                  checked={simulatedPrompt.includes("simulate_nuar_failure")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSimulatedPrompt(prev => prev + " simulate_nuar_failure");
                    } else {
                      setSimulatedPrompt(prev => prev.replace(" simulate_nuar_failure", ""));
                    }
                  }}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="fail-checkbox" className="text-[10px] text-amber-400 font-mono flex items-center gap-1 cursor-pointer">
                  <AlertCircle className="w-3.5 h-3.5" />
                  SIMULATE RECOVERY FAILURE
                </label>
              </div>

              <button
                onClick={handleExecuteInferenceSimulation}
                disabled={isSimulating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold py-1.5 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                RUN ADAPTER INFERENCE
              </button>

              {/* Simulation Result */}
              {(simulatedResponse || simulationLogs.length > 0) && (
                <div className="space-y-2 border-t border-slate-900 pt-2 font-mono text-[10px]">
                  <div className="bg-slate-900 p-2 rounded text-slate-500 max-h-[80px] overflow-y-auto space-y-0.5">
                    {simulationLogs.map((log, i) => (
                      <div key={i}>&gt; {log}</div>
                    ))}
                  </div>

                  {simulatedResponse && (
                    <div className="bg-slate-900 border border-indigo-950 p-2.5 rounded text-indigo-300">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 mb-1 border-b border-slate-950 pb-1">
                        <span>ROUTED: [{simulatedRoutedModel}]</span>
                        <span className="text-emerald-400">SUCCESS</span>
                      </div>
                      <p className="whitespace-pre-wrap">{simulatedResponse}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* EVENT BUS STREAM DECODER */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              EVENT STREAM LIVE DECODER
            </span>

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 scrollbar-thin">
              {eventHistory.map((ev) => (
                <div key={ev.id} className="text-[10px] font-mono border-b border-slate-900/60 pb-1.5">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>[{ev.timestamp}]</span>
                    <span className="text-indigo-400 uppercase text-[9px]">{ev.type}</span>
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
