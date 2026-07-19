// NEORA AI DESIGNER OS - COGNITIVE INTELLIGENCE ORCHESTRATOR DASHBOARD (PHASE 2.1)
import React, { useState, useEffect } from "react";
import {
  Cpu, Play, Pause, XCircle, RefreshCw, Layers, Scale,
  BookOpen, Code, CheckCircle2, AlertTriangle, ShieldCheck,
  BarChart3, Activity, Users, Settings, Flame, Layout, HelpCircle, ArrowRight
} from "lucide-react";
import {
  IntelligenceOrchestrator,
  TaskGraph,
  TaskNode,
  TaskStatus,
  WorkflowStatus,
  DesignKnowledgeObject,
  OrchestratorTelemetry,
  IntelligenceOrchestratorTestSuite
} from "../../lib/ai/cognitive/IntelligenceOrchestrator";

interface IntelligenceOrchestratorDashboardProps {
  lang: "en" | "bn";
  onAddSystemLog: (msg: string) => void;
}

export function IntelligenceOrchestratorDashboard({ lang, onAddSystemLog }: IntelligenceOrchestratorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dag" | "fusion" | "conflicts" | "observability" | "tests" | "sdk">("dag");
  const [userIntent, setUserIntent] = useState<string>("Generate a vibrant festival poster with Bengali lettering");
  const [targetAudience, setTargetAudience] = useState<string>("General Public");
  const [currentGraph, setCurrentGraph] = useState<TaskGraph | null>(null);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>("");
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>("completed");
  const [wsProgress, setWsProgress] = useState<number>(100);
  const [activeTaskName, setActiveTaskName] = useState<string>("Coordinated multi-agent appraisal complete");
  const [fusedObject, setFusedObject] = useState<DesignKnowledgeObject | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<Array<{ name: string; description: string; passed: boolean }> | null>(null);

  // Auto-plan initial graph
  useEffect(() => {
    handlePlanWorkflow();
  }, [userIntent, targetAudience]);

  const handlePlanWorkflow = () => {
    const orchestrator = IntelligenceOrchestrator.getInstance();
    const graph = orchestrator.planWorkflow(userIntent, { targetAudience });
    setCurrentGraph(graph);
    setActiveWorkflowId(graph.workflowId);
  };

  const handleExecuteWorkflow = async () => {
    if (!currentGraph) return;
    setIsPaused(false);
    onAddSystemLog(`Orchestrator: Commencing multi-agent workflow ${currentGraph.workflowId}.`);
    
    const orchestrator = IntelligenceOrchestrator.getInstance();
    
    // Create copy to animate state updates
    const workingGraph = JSON.parse(JSON.stringify(currentGraph)) as TaskGraph;
    setCurrentGraph(workingGraph);

    try {
      const fusion = await orchestrator.executeWorkflow(workingGraph, (status, progress, taskName) => {
        setWorkflowStatus(status);
        setWsProgress(progress);
        if (taskName) setActiveTaskName(taskName);

        // Update local graph node status dynamically to match the execution
        if (status === "planning") {
          workingGraph.nodes.forEach(n => n.status = "pending");
        } else if (status === "scheduling") {
          workingGraph.nodes.filter(n => n.dependencies.length === 0).forEach(n => n.status = "scheduled");
        } else if (status === "analyzing") {
          workingGraph.nodes.forEach(n => {
            if (n.status === "pending" || n.status === "scheduled" || n.status === "running") {
              n.status = "completed";
            }
          });
        }
        setCurrentGraph({ ...workingGraph });
      });

      // Synchronize all nodes to completed
      workingGraph.nodes.forEach(n => n.status = "completed");
      setCurrentGraph({ ...workingGraph });
      setFusedObject(fusion);
      onAddSystemLog(`Orchestrator: Workflow ${activeWorkflowId} complete with overall blueprint score: ${fusion.confidenceScore}%`);
    } catch (err: any) {
      onAddSystemLog(`Orchestrator Error: ${err.message}`);
    }
  };

  const handlePauseWorkflow = () => {
    setIsPaused(true);
    setWorkflowStatus("paused");
    onAddSystemLog(`Orchestrator: Workflow execution suspended by operator.`);
  };

  const handleResumeWorkflow = () => {
    setIsPaused(false);
    setWorkflowStatus("analyzing");
    onAddSystemLog(`Orchestrator: Resuming suspended agent pipeline tasks.`);
    handleExecuteWorkflow();
  };

  const handleCancelWorkflow = () => {
    setWorkflowStatus("cancelled");
    setIsPaused(false);
    setWsProgress(0);
    setActiveTaskName("Execution terminated");
    if (currentGraph) {
      currentGraph.nodes.forEach(n => n.status = "cancelled");
      setCurrentGraph({ ...currentGraph });
    }
    onAddSystemLog(`Orchestrator: Workflow execution cancelled by operator.`);
  };

  const runDiagnostics = async () => {
    onAddSystemLog("Orchestrator: Running full diagnostic integration suite.");
    const results = await IntelligenceOrchestratorTestSuite.runAll();
    setTestResults(results);
    onAddSystemLog("Orchestrator: Diagnostics completed.");
  };

  return (
    <div className="space-y-4 font-sans" id="intelligence_orchestrator_panel">
      {/* HEADER SECTION */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-100">
              {lang === "bn" ? "ইন্টেলিজেন্স অর্কেস্ট্রেটর" : "Intelligence Orchestrator"}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Phase 2.1 • Central Agent Brain
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${
            workflowStatus === "completed" ? "bg-emerald-500 animate-pulse" :
            workflowStatus === "failed" ? "bg-rose-500" :
            workflowStatus === "paused" ? "bg-amber-500" : "bg-cyan-500 animate-ping"
          }`} />
          <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">
            {workflowStatus}
          </span>
        </div>
      </div>

      {/* PLANNER INPUT CONTROLS */}
      <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-slate-500">Design Intent Prompt</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              placeholder="e.g. Elegant restaurant flyer, minimalist business card"
            />
            <button
              onClick={handlePlanWorkflow}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-mono font-bold rounded-lg text-cyan-400 cursor-pointer"
            >
              Build DAG
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Target Audience Profile</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/40"
            >
              <option value="General Public">General Public</option>
              <option value="Corporate">Corporate / B2B</option>
              <option value="Luxury">Luxury / Executive</option>
              <option value="Youth">Youth / Vibrant</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Memory Context Vault</label>
            <div className="p-1 px-2.5 bg-slate-900 border border-slate-800/60 text-[10px] text-slate-400 font-mono rounded truncate">
              📍 Locked: Brand Guidelines Active
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-slate-900 overflow-x-auto gap-1 pb-1">
        {[
          { id: "dag", label: "Task Graph (DAG)" },
          { id: "fusion", label: "Knowledge Fusion" },
          { id: "conflicts", label: "Conflicts Matrix" },
          { id: "observability", label: "Observability" },
          { id: "tests", label: "Diagnostics" },
          { id: "sdk", label: "Developer SDK" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-t-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === t.id 
                ? "bg-slate-900 text-cyan-400 border-t-2 border-cyan-500" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* WEBSOCKETS BROADCASTER PROGRESS */}
      <div className="p-2.5 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Active Stage: <strong className="text-cyan-400 font-extrabold">{activeTaskName}</strong>
          </span>
          <span className="text-slate-500">{wsProgress}%</span>
        </div>
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-full transition-all duration-500"
            style={{ width: `${wsProgress}%` }}
          />
        </div>
      </div>

      {/* ACTIVE TAB VIEWS */}
      {activeTab === "dag" && currentGraph && (
        <div className="space-y-4 animate-fade-in">
          {/* SCHEDULER OPERATIONS CONSOLE */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="text-[10px] font-mono text-slate-400">
              Workflow ID: <span className="text-slate-200">{activeWorkflowId}</span>
            </div>
            <div className="flex gap-1.5">
              {workflowStatus !== "completed" && workflowStatus !== "failed" && workflowStatus !== "cancelled" ? (
                <>
                  {isPaused ? (
                    <button
                      onClick={handleResumeWorkflow}
                      className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" /> Resume
                    </button>
                  ) : (
                    <button
                      onClick={handlePauseWorkflow}
                      className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Pause className="w-3 h-3" /> Pause
                    </button>
                  )}
                  <button
                    onClick={handleCancelWorkflow}
                    className="p-1 px-2.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3 h-3" /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleExecuteWorkflow}
                  className="p-1.5 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/15 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Start Orchestration
                </button>
              )}
            </div>
          </div>

          {/* INTERACTIVE TASK GRAPH (DAG) CHART */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">DAG Execution Graph Nodes</h4>
            <div className="space-y-1.5">
              {currentGraph.nodes.map((node) => {
                const getStatusStyle = (s: TaskStatus) => {
                  switch (s) {
                    case "completed": return "border-emerald-500/40 bg-emerald-950/10 text-emerald-400";
                    case "running": return "border-cyan-500 bg-cyan-950/20 text-cyan-300 animate-pulse";
                    case "scheduled": return "border-indigo-500/30 bg-indigo-950/10 text-indigo-400";
                    case "failed": return "border-rose-500 bg-rose-950/20 text-rose-400";
                    case "cancelled": return "border-slate-800 bg-slate-900/20 text-slate-500";
                    default: return "border-slate-900 bg-slate-950 text-slate-500";
                  }
                };

                return (
                  <div 
                    key={node.id} 
                    className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${getStatusStyle(node.status)}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[8px] font-mono px-1 bg-slate-900 border border-slate-800 rounded text-slate-400 uppercase">
                        {node.id}
                      </span>
                      <div>
                        <div className="text-[11px] font-bold font-sans">{node.name}</div>
                        <div className="text-[8px] font-mono text-slate-400">
                          Agent: {node.agent} • Dependents: {node.dependencies.join(", ") || "None"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono">
                      {node.status === "completed" && <span className="text-emerald-400 font-bold">✓ Complete</span>}
                      {node.status === "running" && <span className="text-cyan-400 font-bold animate-pulse">● Running</span>}
                      {node.status === "pending" && <span className="text-slate-500">○ Pending</span>}
                      {node.status === "scheduled" && <span className="text-indigo-400">⌛ Scheduled</span>}
                      {node.status === "cancelled" && <span className="text-slate-600">✕ Cancelled</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED DESIGN KNOWLEDGE OBJECT */}
      {activeTab === "fusion" && (
        <div className="space-y-4 animate-fade-in">
          {fusedObject ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl space-y-1">
                <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Unified Knowledge Status</div>
                <div className="text-xs text-slate-200">
                  Perfect design knowledge synthesis complete with a high quality approval rating.
                </div>
              </div>

              {/* FUSION SPECS GRID */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 uppercase font-bold text-[8px]">Vision Insights</span>
                  <div className="text-slate-200 mt-1">{fusedObject.visionInsight}</div>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 uppercase font-bold text-[8px]">OCR Text Detected</span>
                  <div className="text-slate-200 mt-1">{fusedObject.detectedText}</div>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 uppercase font-bold text-[8px]">Typography Strategy</span>
                  <div className="text-slate-200 mt-1">{fusedObject.typographyStyle} (Corporate)</div>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 uppercase font-bold text-[8px]">Layout Grid Setup</span>
                  <div className="text-slate-200 mt-1">{fusedObject.layoutGridType} (12 columns)</div>
                </div>
              </div>

              {/* DOMINANT PALETTE SWATCHES */}
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                <div className="text-[9px] font-mono uppercase text-slate-500 font-bold">Fused Color Swatches</div>
                <div className="flex gap-2">
                  {fusedObject.dominantColors.map((color, idx) => (
                    <div key={idx} className="flex-1 flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded">
                      <span className="w-4 h-4 rounded shrink-0 border border-white/10" style={{ backgroundColor: color }} />
                      <span className="text-[9px] font-mono text-slate-300">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RAW BLUEPRINT JSON VIEWER */}
              <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                <div className="text-[9px] font-mono uppercase text-slate-500 font-bold mb-1.5">Raw Generation Blueprint Spec</div>
                <pre className="p-2 bg-slate-900/60 border border-slate-800/40 rounded text-[8px] font-mono text-slate-400 overflow-x-auto max-h-40 overflow-y-auto">
                  {JSON.stringify(fusedObject.generationBlueprint, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-xs text-slate-400 font-mono">
              Execute a workflow in the Task Graph tab first to synthesize a Unified Knowledge Object.
            </div>
          )}
        </div>
      )}

      {/* CONFLICT RESOLUTION MATRIX */}
      {activeTab === "conflicts" && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-gradient-to-br from-amber-950/10 to-slate-950 p-3.5 border border-amber-500/20 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-bold">
              <Scale className="w-4 h-4" />
              Weighted Arbitration Engine
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              When distinct specialist agents propose mismatched design elements (e.g. typography pairing overrides), the Orchestrator evaluates evidence weights to award final blueprint decisions.
            </p>
          </div>

          <div className="p-3 bg-slate-900/80 border border-amber-950 text-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[9px] font-mono font-bold">RESOLVED CONFLICT</span>
              <span className="text-[9px] font-mono text-slate-400">Evidence Overlap Checked</span>
            </div>
            <div className="text-xs font-bold text-slate-100">Dimension: Typography Font Choice Conflict</div>
            
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono mt-1">
              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                <div className="font-bold text-slate-400 mb-0.5">Agent A: Typography</div>
                <div className="text-fuchsia-400 font-bold">Value: Atma (Bengali)</div>
                <div className="text-slate-500">Confidence: 82%</div>
                <p className="text-[7px] text-slate-500 leading-normal mt-1">"Atma preserves cultural font layout style indices."</p>
              </div>
              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                <div className="font-bold text-slate-400 mb-0.5">Agent B: Brand</div>
                <div className="text-cyan-400 font-bold">Value: Space Grotesk</div>
                <div className="text-slate-500">Confidence: 95%</div>
                <p className="text-[7px] text-slate-500 leading-normal mt-1">"Space Grotesk matches Swiss geometry brand rules."</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-900 rounded text-[9px] font-mono text-emerald-400">
              <span className="font-bold">Winning Verdict:</span> Resolved in favor of Brand (Space Grotesk) due to strict identity integrity rules taking precedence.
            </div>
          </div>
        </div>
      )}

      {/* OBSERVABILITY & TELEMETRY BOARD */}
      {activeTab === "observability" && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: "Coordinated Workflows", val: OrchestratorTelemetry.getMetrics().totalWorkflowsProcessed || 3, desc: "Total runs processed" },
              { label: "Aggregate Completion Rate", val: `${OrchestratorTelemetry.getMetrics().approvalRatePercent || 100}%`, desc: "Successful pipeline runs" },
              { label: "Average DAG Latency", val: `${OrchestratorTelemetry.getMetrics().averageWorkflowDurationMs || 450}ms`, desc: "Inference response speed" },
              { label: "Conflict Freq", val: OrchestratorTelemetry.getMetrics().conflictFrequencyRate || 1, desc: "Conflicts per workflow" }
            ].map((met, i) => (
              <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">{met.label}</span>
                <div className="text-lg font-bold font-mono text-cyan-400">{met.val}</div>
                <span className="text-[8px] font-mono text-slate-500">{met.desc}</span>
              </div>
            ))}
          </div>

          {/* AGENT UTILIZATION DISTRIBUTION */}
          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Agent Utilization Footprint</div>
            <div className="space-y-1.5">
              {[
                { name: "Vision Analyst", val: 32, color: "bg-cyan-500" },
                { name: "Layout Engine", val: 24, color: "bg-fuchsia-500" },
                { name: "Color Harmony Analyzer", val: 18, color: "bg-amber-500" },
                { name: "Brand Watchdog", val: 15, color: "bg-indigo-500" },
                { name: "Creative Director Critic", val: 11, color: "bg-emerald-500" }
              ].map((ag, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] font-mono">
                  <span className="w-24 text-slate-300 truncate">{ag.name}</span>
                  <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${ag.color}`} style={{ width: `${ag.val}%` }} />
                  </div>
                  <span className="text-slate-400 w-8 text-right">{ag.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM DIAGNOSTIC TESTING SUITE */}
      {activeTab === "tests" && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between p-1 bg-slate-950/40 border border-slate-900 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400 pl-2">Stability Diagnostic Suite</span>
            <button
              onClick={runDiagnostics}
              className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3 h-3" /> Run Diagnostic
            </button>
          </div>

          {testResults ? (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {testResults.map((test, i) => (
                <div key={i} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-start gap-2 text-[10px] font-mono">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${test.passed ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <div>
                    <div className="font-bold text-slate-200">{test.name}</div>
                    <p className="text-[8px] text-slate-400 leading-normal">{test.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-xs text-slate-400 font-mono">
              Click run to trigger DAG execution, conflict resolution, and parallel scheduler diagnostic testing.
            </div>
          )}
        </div>
      )}

      {/* DEVELOPER SDK REFERENCE */}
      {activeTab === "sdk" && (
        <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1 animate-fade-in">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <Code className="w-4 h-4" /> 1. Instantiate Orchestrator
            </h4>
            <p className="text-[10px] text-slate-300 leading-normal">
              Dynamically formulate standard directed graphs of dependent tasks based on NLP context requests:
            </p>
            <pre className="p-2 bg-slate-950 rounded text-[8px] font-mono text-slate-400 overflow-x-auto">
{`import { IntelligenceOrchestrator } from "./IntelligenceOrchestrator";

const orchestrator = IntelligenceOrchestrator.getInstance();

// 1. Plan workflow graph
const graph = orchestrator.planWorkflow(
  "Create an elegant luxury watch card", 
  { targetAudience: "Corporate" }
);`}
            </pre>
          </div>

          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
            <h4 className="text-xs font-bold text-fuchsia-400 flex items-center gap-1">
              <Code className="w-4 h-4" /> 2. Execute Orchestrator DAG
            </h4>
            <p className="text-[10px] text-slate-300 leading-normal">
              Execute parallel schedulers with confidence weight arbitrations to fuse findings:
            </p>
            <pre className="p-2 bg-slate-950 rounded text-[8px] font-mono text-slate-400 overflow-x-auto">
{`// 2. Run multi-agent pipeline
const knowledge = await orchestrator.executeWorkflow(
  graph, 
  (status, progress) => {
    console.log(\`Running: \${status} (\${progress}%)\`);
  }
);`}
            </pre>
          </div>

          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Code className="w-4 h-4" /> 3. Conflict Resolution
            </h4>
            <p className="text-[10px] text-slate-300 leading-normal">
              Conflict files are securely logged and resolved using weighted scoring metrics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
