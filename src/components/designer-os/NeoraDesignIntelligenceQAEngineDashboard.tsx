// NEORA DESIGN INTELLIGENCE & QUALITY ASSURANCE ENGINE (NDIQA) DASHBOARD
import React, { useState, useEffect } from "react";
import {
  ShieldCheck, Sparkles, Scale, AlertTriangle, CheckCircle2, Sliders, Play,
  RefreshCw, Info, FileText, Settings, HelpCircle, Layers, Layers3, Flame,
  Check, X, Award, ChevronRight, CornerDownRight, Terminal, Network, ListChecks,
  ChevronDown, BookOpen, AlertCircle, Cpu, FileCheck2, Library, Eye, Compass
} from "lucide-react";

import {
  NeoraDesignIntelligenceQAEngine,
  NDIQAReport,
  ApprovalStage,
  DesignKnowledgeGraph,
  VariantComparisonResult,
  NDIQARulePlugin,
  NDIQA_ENTERPRISE_DOCUMENTATION
} from "../../lib/ai/NeoraDesignIntelligenceQAEngine";

import { NeoraIntelligentDesignEditor, NIDEWorkspace } from "../../lib/ai/NeoraIntelligentDesignEditor";

interface NeoraDesignIntelligenceQAEngineDashboardProps {
  lang: "en" | "bn";
  onAddSystemLog: (msg: string) => void;
}

export function NeoraDesignIntelligenceQAEngineDashboard({ lang, onAddSystemLog }: NeoraDesignIntelligenceQAEngineDashboardProps) {
  const [workspace, setWorkspace] = useState<NIDEWorkspace | null>(null);
  const [report, setReport] = useState<NDIQAReport | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<DesignKnowledgeGraph | null>(null);
  const [activeTab, setActiveTab] = useState<"scores" | "critic" | "variants" | "knowledge" | "plugins" | "tests" | "sdk">("scores");
  const [activeDocTab, setActiveDocTab] = useState<"api" | "websocket" | "plugin" | "specification">("specification");

  // WebSocket evaluation live simulator state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationStep, setEvaluationStep] = useState<string>("");
  const [evaluationProgress, setEvaluationProgress] = useState<number>(100);
  const [wsEvents, setWsEvents] = useState<Array<{ time: string; event: string; status: "success" | "pending" | "info" }>>([]);

  // Approval flow status
  const [currentStage, setCurrentStage] = useState<ApprovalStage>(ApprovalStage.InternalReview);
  const [approvalNotes, setApprovalNotes] = useState<string>("");
  const [approvalHistory, setApprovalHistory] = useState<Array<{ stage: ApprovalStage; date: string; notes: string; author: string }>>([
    { stage: ApprovalStage.Draft, date: "2026-07-15 10:20 AM", notes: "Initial structural layout compiled by NDGE.", author: "System AI" },
    { stage: ApprovalStage.InternalReview, date: "2026-07-16 02:45 PM", notes: "Calibrated vertical typography negative spacing.", author: "Creative Director" }
  ]);

  // Interactive plugins state
  const [registeredPlugins, setRegisteredPlugins] = useState<NDIQARulePlugin[]>([]);
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>(["wcag_contrast_plugin", "industry_print_plugin"]);

  // Test Harness state
  const [testResults, setTestResults] = useState<Array<{ name: string; passed: boolean; message: string }> | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // Variant comparisons workspaces seed
  const [variantWorkspaces, setVariantWorkspaces] = useState<NIDEWorkspace[]>([]);
  const [comparisonResult, setComparisonResult] = useState<VariantComparisonResult | null>(null);

  useEffect(() => {
    const editor = NeoraIntelligentDesignEditor.getInstance();
    let ws = editor.getWorkspace();

    if (!ws) {
      editor.initializeSeedWorkspace(
        "Alpona Festive Banner Project",
        "ঐতিহ্যবাহী উৎসবের আলপনা এবং চমৎকার ক্যালিগ্রাফি সহ শুভ শারদীয়া ব্যানার"
      );
      ws = editor.getWorkspace()!;
    }

    setWorkspace(ws);
    
    // Seed alternative design variants for multi-variant review comparison
    const altVariant1: NIDEWorkspace = JSON.parse(JSON.stringify(ws));
    altVariant1.id = "var_alternate_1";
    altVariant1.name = "Alpona Banner v2 - Minimalist layout";
    // Nudge some text coordinates to create different scoring heuristics
    altVariant1.layers.forEach(l => {
      l.objects.forEach(o => {
        if (o.semanticRole === "Title") o.properties.fontSize = 28; // undersized text penalty
      });
    });

    const altVariant2: NIDEWorkspace = JSON.parse(JSON.stringify(ws));
    altVariant2.id = "var_alternate_2";
    altVariant2.name = "Alpona Banner v3 - Luxury Golden";
    // Nudge some properties to achieve flawless scores
    altVariant2.layers.forEach(l => {
      l.objects.forEach(o => {
        if (o.semanticRole === "Title") o.properties.fontSize = 52; // Great font size
      });
    });

    setVariantWorkspaces([ws, altVariant1, altVariant2]);

    // Initial analysis
    triggerFullQualityReview(ws);

    // Initial plugin loading
    const qaEngine = NeoraDesignIntelligenceQAEngine.getInstance();
    setRegisteredPlugins(qaEngine.getRegisteredRulePlugins());
  }, []);

  const triggerFullQualityReview = async (targetWs: NIDEWorkspace) => {
    if (!targetWs) return;
    setIsEvaluating(true);
    setEvaluationProgress(0);
    onAddSystemLog("NDIQA: Starting design review and scoring pipeline...");

    // WebSocket step simulation sequence
    const steps = [
      { msg: "WebSocket -> Initiating NDIQA Review pipeline...", progress: 15, status: "info" as const },
      { msg: "WebSocket -> [Pass 1] Classifying semantic layout coordinates...", progress: 30, status: "pending" as const },
      { msg: "WebSocket -> [Pass 2] Parsing typography rules & vertical grids...", progress: 50, status: "pending" as const },
      { msg: "WebSocket -> [Pass 3] Checking offset press print safe bleed zones...", progress: 70, status: "pending" as const },
      { msg: "WebSocket -> [Pass 4] Evaluating WCAG AAA luminance contrast maps...", progress: 85, status: "pending" as const },
      { msg: "WebSocket -> Finalizing quality scores & creative critiques...", progress: 100, status: "success" as const }
    ];

    for (const step of steps) {
      setEvaluationStep(step.msg);
      setEvaluationProgress(step.progress);
      setWsEvents(prev => [{ time: new Date().toLocaleTimeString(), event: step.msg, status: step.status }, ...prev]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const qaEngine = NeoraDesignIntelligenceQAEngine.getInstance();
    const generatedReport = qaEngine.reviewWorkspace(targetWs, currentStage);
    const graph = qaEngine.getKnowledgeGraph(targetWs);
    const compare = qaEngine.compareVariants([targetWs, ...variantWorkspaces.slice(1)]);

    setReport(generatedReport);
    setKnowledgeGraph(graph);
    setComparisonResult(compare);
    setIsEvaluating(false);

    onAddSystemLog(`NDIQA: Evaluation completed. Overall Design Score is: ${generatedReport.overallScore}/100.`);
  };

  const handleApplyNudgeFix = (recId: string) => {
    if (!workspace) return;
    
    // Nudge parameters visually based on recommendation to simulate live editing
    const editor = NeoraIntelligentDesignEditor.getInstance();
    
    if (recId === "rec_overlaps") {
      workspace.layers.forEach(l => {
        l.objects.forEach(o => {
          if (o.semanticRole === "Title") o.y -= 50; // shift up
          if (o.semanticRole === "Decoration") o.y += 20; // shift down
        });
      });
      onAddSystemLog("NDIQA Optimizer: Shifted title upward to clear overlapping bounding intersections.");
    } else if (recId === "rec_contrast") {
      workspace.layers.forEach(l => {
        l.objects.forEach(o => {
          if (o.semanticRole === "Title" || o.semanticRole === "Subtitle") {
            o.properties.textColor = "#ffffff";
            o.properties.fillColor = "#ffffff";
          }
        });
      });
      onAddSystemLog("NDIQA Optimizer: Switched header copy values to full luminance white for maximum readability.");
    } else if (recId === "rec_cta") {
      // Inject CTA button object
      workspace.layers[0].objects.push({
        id: "opt_in_cta_node",
        name: "Interactive Register CTA Button",
        type: "shape",
        x: 340,
        y: 440,
        width: 320,
        height: 65,
        opacity: 1,
        semanticRole: "CTA",
        isLocked: false,
        properties: { fillColor: "#fbbf24", textReference: "Register Now" }
      } as any);
      onAddSystemLog("NDIQA Optimizer: Injected call-to-action button layer on active canvas layout.");
    }

    // Refresh review
    triggerFullQualityReview(workspace);
  };

  const handleStageChange = (stage: ApprovalStage) => {
    setCurrentStage(stage);
    const newHistory = [
      { stage, date: new Date().toISOString().replace("T", " ").substring(0, 19), notes: approvalNotes || "Advanced stage verified.", author: "Enterprise QA Analyst" },
      ...approvalHistory
    ];
    setApprovalHistory(newHistory);
    setApprovalNotes("");
    onAddSystemLog(`NDIQA Workflow: Upgraded design status index to "${stage}"`);
  };

  const handleRunTests = async () => {
    if (!workspace) return;
    setIsRunningTests(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const qaEngine = NeoraDesignIntelligenceQAEngine.getInstance();
    const results = qaEngine.runNDIQATests(workspace);
    setTestResults(results);
    setIsRunningTests(false);
    onAddSystemLog("NDIQA: Automated regression rules validated against guidelines.");
  };

  if (!workspace || !report) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-rose-400 mb-2" />
        <span className="text-xs font-mono text-slate-500">Bootstrapping Quality Scoring Pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-slate-100" id="ndiqa_quality_assurance_engine_root">
      
      {/* BRAND HEADER MODULE */}
      <div className="p-4 bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-500/20 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400">
            <ShieldCheck className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-100 flex items-center gap-2">
              Neora Design Intelligence & QA Engine (NDIQA)
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/20 text-[8px] font-mono font-bold animate-pulse">
                Active Auditor
              </span>
            </h3>
            <p className="text-[10px] text-rose-300 font-mono">
              Deterministic Rules Engine • Multilingual Visual Evaluation Console
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerFullQualityReview(workspace)}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isEvaluating ? "animate-spin" : ""}`} />
            Scan Canvas
          </button>
        </div>
      </div>

      {/* WEBSOCKET EVALUATION PROGRESS */}
      {isEvaluating && (
        <div className="p-4 bg-rose-950/10 border border-rose-500/25 rounded-xl space-y-2 animate-pulse">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-rose-400 font-bold">{evaluationStep}</span>
            <span className="text-slate-400">{evaluationProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${evaluationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* THREE COLUMN MAIN PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: CRITICAL RECOMMENDATIONS & SUMMARY */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* BIG OVERALL SCORE RING CARDS */}
          <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl space-y-4 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Award className="w-32 h-32 text-rose-400" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Overall Quality Quotient
              </span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                report.overallScore >= 90 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                report.overallScore >= 75 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {report.overallRating}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-5xl font-mono font-black text-rose-400 tracking-tighter">
                {report.overallScore}
              </h1>
              <span className="text-slate-500 text-sm font-mono">/100</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal font-sans pt-2 border-t border-slate-800/60">
              {report.overallCritique}
            </p>
          </div>

          {/* APPROVAL WORKFLOW STEPS */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Approval Workflow Lifecycle
            </h4>

            {/* Stages Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(ApprovalStage).map((stage) => {
                const isActive = currentStage === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                    className={`p-2 rounded text-left border text-[9px] font-mono font-bold flex flex-col justify-between transition-all cursor-pointer ${
                      isActive
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-300 ring-1 ring-rose-500/10"
                        : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/60 text-slate-500"
                    }`}
                  >
                    <span>{stage}</span>
                    <span className="text-[7px] text-slate-600 mt-0.5">
                      {isActive ? "Active Status" : "Promote Here"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Approval Notes Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
              <label className="text-[9px] font-mono text-slate-400 block">Add Review Verification Note</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Describe layout alignment, client sign-off records, color blind clearance checks..."
                className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[9px] font-mono text-slate-300 focus:outline-none focus:border-rose-500/40 min-h-12"
              />
            </div>

            {/* Stage History */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {approvalHistory.map((h, index) => (
                <div key={index} className="p-2 bg-slate-950/40 border border-slate-850 rounded text-[8px] font-mono space-y-1">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-rose-400 font-bold">[{h.stage}]</span>
                    <span>{h.date}</span>
                  </div>
                  <p className="text-slate-300 italic">"{h.notes}"</p>
                  <div className="text-slate-500 text-right">By: {h.author}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: QUALITY CATEGORY REPORTS & CRITICS */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* TAB HEADERS FOR WORKSPACE MODULES */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="flex border-b border-slate-800 bg-slate-950/40">
              {[
                { id: "scores", label: "Category Scorecards" },
                { id: "critic", label: "Prioritized Improvement Engine" },
                { id: "variants", label: "Side-by-Side Variant review" },
                { id: "knowledge", label: "Design Knowledge Graph" },
                { id: "plugins", label: "Rule Plugin profiles" },
                { id: "tests", label: "Automated QA Harness" },
                { id: "sdk", label: "NDIQA Enterprise SDK" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2.5 text-[9px] font-mono font-bold border-r border-slate-800 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-rose-400 border-b-2 border-b-rose-500"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 min-h-[460px] max-h-[580px] overflow-y-auto">
              
              {/* TAB: CATEGORY SCORES */}
              {activeTab === "scores" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(report.categories).map(([key, category]) => {
                      const scoreColor = 
                        category.score >= 90 ? "text-emerald-400" :
                        category.score >= 75 ? "text-amber-400" :
                        "text-rose-400";

                      return (
                        <div key={key} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="capitalize text-slate-400 font-bold">{key}</span>
                            <span className={`font-black ${scoreColor}`}>{category.score}/100</span>
                          </div>
                          
                          {/* Tiny Progress Bar */}
                          <div className="w-full bg-slate-850 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                category.score >= 90 ? "bg-emerald-500" :
                                category.score >= 75 ? "bg-amber-500" :
                                "bg-rose-500"
                              }`}
                              style={{ width: `${category.score}%` }}
                            />
                          </div>

                          <div className="text-[8px] font-mono text-slate-500 leading-normal space-y-1">
                            {category.rationales.map((r, rIdx) => (
                              <div key={rIdx} className="flex gap-1 items-start text-slate-400 italic">
                                <span className="text-rose-400/40 mt-0.5">•</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-1.5 border-t border-slate-900/60 text-[8px] font-mono">
                            <div className="text-rose-400 font-bold">Suggested Fix:</div>
                            <div className="text-slate-300">{category.suggestedFix}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* WEBSOCKET LOG OUTPUT */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                    <h5 className="text-[9px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-rose-400" />
                      WebSocket Live Audit Stream Logs
                    </h5>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {wsEvents.map((ev, index) => (
                        <div key={index} className="text-[8px] font-mono text-slate-500 flex items-center justify-between">
                          <span className="truncate flex items-center gap-1 text-slate-400">
                            <span className="text-rose-500/40">{ev.time}</span>
                            <span>{ev.event}</span>
                          </span>
                          <span className={`font-bold ${ev.status === "success" ? "text-emerald-400" : ev.status === "pending" ? "text-amber-400" : "text-sky-400"}`}>
                            {ev.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CRITIC & IMPROVEMENT ENGINE */}
              {activeTab === "critic" && (
                <div className="space-y-4">
                  <div className="p-4 bg-rose-950/5 border border-rose-500/10 rounded-xl space-y-2">
                    <h5 className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      Dynamic Brand Integrity Assertions
                    </h5>
                    <p className="text-[10px] text-slate-300 leading-normal">
                      The improvement engine provides deterministic pixel-nudge corrections. Tapping any auto-fix button modifies layout matrices instantly.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {report.priorityRecommendations.map((rec) => {
                      const badgeColor =
                        rec.priority === "critical" ? "bg-red-500/15 text-red-400 border-red-500/30" :
                        rec.priority === "high" ? "bg-orange-500/15 text-orange-400 border-orange-500/30" :
                        rec.priority === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                        "bg-blue-500/15 text-blue-400 border-blue-500/30";

                      return (
                        <div key={rec.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-all hover:bg-slate-950/60">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${badgeColor}`}>
                                {rec.priority}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">[{rec.category}]</span>
                              <span className="text-[9px] font-mono font-bold text-slate-200">{rec.title}</span>
                            </div>
                            <p className="text-[9px] font-mono text-slate-400 leading-normal">
                              {rec.description}
                            </p>
                            <div className="text-[8px] font-mono text-emerald-400 flex items-center gap-1 pt-1">
                              <span className="font-extrabold">Action:</span> {rec.actionableFix}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-[8px] font-mono text-slate-500 uppercase">Estimated Gain</div>
                              <div className="text-xs font-mono font-bold text-emerald-400">+{rec.estimatedScoreGain} pts</div>
                            </div>
                            <button
                              onClick={() => handleApplyNudgeFix(rec.id)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-mono font-extrabold text-[9px] cursor-pointer transition-colors"
                            >
                              Auto-nudge
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: MULTI-VARIANT COMPARISON */}
              {activeTab === "variants" && comparisonResult && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
                    <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                      Variant Performance Index
                    </h5>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Automated parallel benchmarking comparing active design files with generated alternatives.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {comparisonResult.ranking.map((rankItem) => {
                      const isWinner = rankItem.workspaceId === comparisonResult.winnerId;
                      return (
                        <div
                          key={rankItem.workspaceId}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                            isWinner
                              ? "bg-rose-500/5 border-rose-500/30 ring-1 ring-rose-500/10"
                              : "bg-slate-950/40 border-slate-850"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                                isWinner ? "bg-rose-500 text-slate-950" : "bg-slate-800 text-slate-400"
                              }`}>
                                Rank #{rankItem.rank}
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-200">
                                {rankItem.score}/100
                              </span>
                            </div>

                            <h6 className="text-[10px] font-mono font-bold text-slate-200 truncate">
                              {rankItem.workspaceName}
                            </h6>

                            {/* Strengths / Weaknesses */}
                            <div className="space-y-2 pt-2 border-t border-slate-900/80 text-[8px] font-mono">
                              <div className="text-emerald-400 font-bold">Strengths:</div>
                              {rankItem.strengths.map((s, idx) => (
                                <div key={idx} className="text-slate-400 flex items-start gap-1">
                                  <span>✓</span> <span>{s}</span>
                                </div>
                              ))}

                              <div className="text-rose-400 font-bold pt-1">Weaknesses:</div>
                              {rankItem.weaknesses.map((w, idx) => (
                                <div key={idx} className="text-slate-500 flex items-start gap-1">
                                  <span>✗</span> <span>{w}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const target = variantWorkspaces.find(v => v.id === rankItem.workspaceId);
                              if (target) {
                                setWorkspace({ ...target });
                                triggerFullQualityReview(target);
                              }
                            }}
                            className={`w-full py-1 rounded text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                              isWinner
                                ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                                : "bg-slate-850 hover:bg-slate-800 text-slate-400"
                            }`}
                          >
                            Activate Variant
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: DESIGN KNOWLEDGE GRAPH */}
              {activeTab === "knowledge" && knowledgeGraph && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
                    <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                      <Network className="w-3.5 h-3.5 text-rose-400" />
                      Visual Semantic Relationships Graph
                    </h5>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Maps direct relational links between active artboard files, specific layer objects, custom brand rules, and print constraints.
                    </p>
                  </div>

                  {/* Semantic Mesh Rendering */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Node map lists */}
                    <div className="space-y-2">
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Active Layer Nodes
                      </div>
                      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                        {knowledgeGraph.nodes.map((node) => {
                          const typeColors =
                            node.type === "object" ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" :
                            node.type === "layer" ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" :
                            node.type === "rule" ? "bg-rose-500/10 text-rose-300 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-300 border-amber-500/20";

                          return (
                            <div key={node.id} className="p-2 bg-slate-900/60 border border-slate-850 rounded flex items-center justify-between text-[8px] font-mono">
                              <span className="truncate text-slate-200">{node.label}</span>
                              <span className={`px-1.5 py-0.5 rounded border ${typeColors}`}>
                                {node.type.toUpperCase()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Edge relationship lists */}
                    <div className="space-y-2">
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Constraint Links & Rules
                      </div>
                      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                        {knowledgeGraph.edges.map((edge) => (
                          <div key={edge.id} className="p-2 bg-slate-900/40 border border-slate-850 rounded text-[8px] font-mono space-y-1">
                            <div className="flex justify-between items-center text-slate-400">
                              <span className="truncate max-w-[100px] text-slate-200 font-bold">{edge.source}</span>
                              <span className="text-rose-400 uppercase tracking-wider font-extrabold">
                                ➔ {edge.relationship} ➔
                              </span>
                              <span className="truncate max-w-[100px] text-slate-200 font-bold">{edge.target}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB: PLUGINS */}
              {activeTab === "plugins" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5">
                    <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-rose-400" />
                      Bespoke Brand Rule Plugin Profiles
                    </h5>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Toggle specific premium verification policies. Enabling profiles triggers additional validation alerts inside visual scoring trees.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {registeredPlugins.map((plugin) => {
                      const isEnabled = enabledPlugins.includes(plugin.id);
                      return (
                        <div
                          key={plugin.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                            isEnabled
                              ? "bg-rose-500/5 border-rose-500/30"
                              : "bg-slate-950/40 border-slate-850 opacity-60"
                          }`}
                        >
                          <div className="space-y-1">
                            <h6 className="text-[10px] font-mono font-bold text-slate-200">
                              {plugin.name}
                            </h6>
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-rose-300 border border-slate-800 text-[8px] font-mono uppercase">
                              {plugin.profileType}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              if (isEnabled) {
                                setEnabledPlugins(enabledPlugins.filter(p => p !== plugin.id));
                              } else {
                                setEnabledPlugins([...enabledPlugins, plugin.id]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded font-mono font-extrabold text-[9px] cursor-pointer transition-colors ${
                              isEnabled
                                ? "bg-rose-500 hover:bg-rose-400 text-slate-950"
                                : "bg-slate-800 hover:bg-slate-750 text-slate-400"
                            }`}
                          >
                            {isEnabled ? "Enabled" : "Disabled"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: AUTOMATED REGRESSION TESTS */}
              {activeTab === "tests" && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2 flex items-center justify-between">
                    <div>
                      <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                        Automated Guideline Verification Suite
                      </h5>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        Execute parallel unit testing assertion scripts to check contrast constraints, offset margins, and alignment metrics.
                      </p>
                    </div>

                    <button
                      onClick={handleRunTests}
                      disabled={isRunningTests}
                      className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white rounded-lg font-mono font-extrabold text-[10px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isRunningTests ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      Run Assertions
                    </button>
                  </div>

                  {testResults ? (
                    <div className="space-y-2 animate-fade-in">
                      {testResults.map((t, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-950/50 border border-slate-850 rounded-lg flex items-center justify-between text-[9px] font-mono">
                          <span className="text-slate-300 font-bold">{t.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 truncate max-w-sm">{t.message}</span>
                            <span className={`px-2 py-0.5 rounded font-extrabold text-[8px] uppercase ${
                              t.passed
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {t.passed ? "PASS" : "FAIL"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-12 bg-slate-950/40 border border-slate-850 rounded-xl text-slate-500 text-[10px] font-mono">
                      No automated suite metrics generated yet. Tap 'Run Assertions' above.
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ENTERPRISE SDK SPECS */}
              {activeTab === "sdk" && (
                <div className="space-y-4">
                  {/* Documentation Sub-tabs */}
                  <div className="flex border-b border-slate-850 bg-slate-950/20">
                    {[
                      { id: "specification", label: "Quality Specs" },
                      { id: "api", label: "REST contracts API" },
                      { id: "websocket", label: "WS Event Schema" },
                      { id: "plugin", label: "Plugin SDK Spec" }
                    ].map(docSub => (
                      <button
                        key={docSub.id}
                        onClick={() => setActiveDocTab(docSub.id as any)}
                        className={`px-3 py-1.5 text-[8px] font-mono font-bold transition-all cursor-pointer ${
                          activeDocTab === docSub.id
                            ? "bg-slate-900 text-rose-300 border-b-2 border-b-rose-400"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {docSub.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-tab Content rendering */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                    
                    {activeDocTab === "specification" && (
                      <div className="space-y-3 text-[9px] font-mono leading-normal">
                        <div className="text-rose-400 font-bold uppercase text-xs">{NDIQA_ENTERPRISE_DOCUMENTATION.title}</div>
                        <p className="text-slate-400">{NDIQA_ENTERPRISE_DOCUMENTATION.overview}</p>
                        
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <div className="text-slate-300 font-bold">Heuristic Standards:</div>
                          {NDIQA_ENTERPRISE_DOCUMENTATION.guidelines.map((g, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <div className="text-rose-300 font-bold">{g.title}</div>
                              <div className="text-slate-500">{g.rule}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeDocTab === "api" && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono text-rose-400 font-bold">HTTP REST endpoint Contracts</div>
                        <pre className="p-3 bg-slate-900 border border-slate-850 rounded text-[8px] font-mono text-slate-300 overflow-x-auto">
{`POST /api/v1/ndiqa/review-workspace
Request: {
  workspaceId: string,
  stage: "InternalReview" | "ClientReview" | "ProductionReady"
}
Response: {
  reportId: string,
  overallScore: number,
  overallRating: "Flawless" | "Excellent" | "Good",
  critique: string,
  categories: { typography, layout, print, brand, accessibility }
}`}
                        </pre>
                      </div>
                    )}

                    {activeDocTab === "websocket" && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono text-rose-400 font-bold">WebSocket Event Payload definitions</div>
                        <pre className="p-3 bg-slate-900 border border-slate-850 rounded text-[8px] font-mono text-slate-300 overflow-x-auto">
{`// Client connection: ws://neora-design-os:3000/ws/ndiqa
Events Emitted:
1. "ReviewStarted" -> { timestamp: string }
2. "TypographyReviewed" -> { score: number, issues: string[] }
3. "LayoutReviewed" -> { whiteSpaceRatio: number, overlaps: number }
4. "ScoreGenerated" -> { overallScore: number, reportId: string }`}
                        </pre>
                      </div>
                    )}

                    {activeDocTab === "plugin" && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono text-rose-400 font-bold">Plugin SDK interface specification</div>
                        <pre className="p-3 bg-slate-900 border border-slate-850 rounded text-[8px] font-mono text-slate-300 overflow-x-auto">
{`interface NDIQARulePlugin {
  id: string;
  name: string;
  profileType: "accessibility" | "brand" | "print" | "marketing";
  validate: (workspace: NIDEWorkspace) => Array<{
    ruleId: string;
    severity: "error" | "warning" | "info";
    message: string;
    fix: string;
  }>;
}`}
                        </pre>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
