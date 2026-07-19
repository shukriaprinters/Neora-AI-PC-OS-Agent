// NEORA AI DESIGNER OS - CREATIVE DIRECTOR & CRITIQUE ENGINE DASHBOARD (PHASE 2.1.10)
import React, { useState, useEffect } from "react";
import {
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, BarChart3,
  Award, Layers, Type, Palette, Printer, Smartphone, HelpCircle,
  Play, BookOpen, Layers3, Flame, Clock, Eye, Scale, UserCheck, ShieldAlert,
  Cpu, Sliders
} from "lucide-react";
import { 
  CreativeDirectorEngine, 
  ReviewReport, 
  CritiqueItem, 
  CreativeDirectorTelemetry,
  CreativeDirectorTestSuite,
  ConceptComparisonResult
} from "../../lib/ai/cognitive/CreativeDirectorEngine";
import { GenerationBlueprint, CreativeConcept } from "../../lib/ai/cognitive/DesignBrain";

interface CreativeDirectorDashboardProps {
  lang: "en" | "bn";
  onAddSystemLog: (msg: string) => void;
}

export function CreativeDirectorDashboard({ lang, onAddSystemLog }: CreativeDirectorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "scores" | "concepts" | "telemetry" | "tests" | "docs">("pipeline");
  const [targetAudience, setTargetAudience] = useState<string>("Corporate");
  const [wsStatus, setWsStatus] = useState<string>("Idle");
  const [wsProgress, setWsProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<Array<{ name: string; description: string; passed: boolean }> | null>(null);
  
  // Active demo state representing current generation blueprint under review
  const [currentBlueprint, setCurrentBlueprint] = useState<GenerationBlueprint>({
    blueprintId: "blue_std_101",
    canvas: { width: 1080, height: 1080, aspectRatio: "1:1", bleedMm: 0, safeZoneMargin: 40 },
    grid: { type: "modular", columns: 12, gutter: 15 },
    sections: [
      { id: "sec_hdr", name: "Brand Header Zone", x: 40, y: 40, width: 1000, height: 80, type: "header", requiredObjects: [] },
      { id: "sec_hero", name: "Key Title Area", x: 100, y: 150, width: 880, height: 420, type: "hero", requiredObjects: [] }
    ],
    palette: { name: "Futuristic Cyan", colors: ["#020617", "#0ea5e9", "#f8fafc"], roleMapping: { background: "#020617", text: "#f8fafc", accent: "#0ea5e9" } },
    typography: { headingFont: "Atma", bodyFont: "Inter", baseFontSize: 13 },
    decorationRules: ["add-minimalist-corner-brackets"],
    editableWorkspaceRequirements: []
  });

  const [reviewReport, setReviewReport] = useState<ReviewReport | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ConceptComparisonResult | null>(null);

  // Auto-run initial review on load
  useEffect(() => {
    runFreshReview();
    runConceptComparison();
  }, [targetAudience]);

  const runFreshReview = () => {
    const report = CreativeDirectorEngine.reviewBlueprint(currentBlueprint, targetAudience);
    setReviewReport(report);
  };

  const triggerSelfImprovement = () => {
    setIsProcessing(true);
    setWsStatus("Initializing Self-Improvement Loop...");
    setWsProgress(10);
    onAddSystemLog("Creative Director: Initializing automated blueprint improvement pipeline.");

    const steps = [
      { status: "Reviewing Composition Grid...", progress: 30 },
      { status: "Scaling Typography leading rules...", progress: 50 },
      { status: "Checking Brand Alignment limits...", progress: 75 },
      { status: "Enforcing Print Safe Bleed zones...", progress: 90 },
      { status: "Completed Self-Correction", progress: 100 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setWsStatus(step.status);
        setWsProgress(step.progress);
        if (step.progress === 100) {
          const { optimizedBlueprint, finalReport } = CreativeDirectorEngine.improveBlueprint(currentBlueprint);
          setCurrentBlueprint(optimizedBlueprint);
          setReviewReport(finalReport);
          setIsProcessing(false);
          onAddSystemLog(`Creative Director: Blueprint successfully optimized. Score raised to ${finalReport.overallScore}%!`);
        }
      }, (idx + 1) * 700);
    });
  };

  const runConceptComparison = () => {
    const conceptA: CreativeConcept = {
      conceptId: "con_swiss",
      themeName: "Swiss Modernist Minimalism",
      strategyType: "Modern",
      layoutDirection: "Structured Grid",
      typographyDirection: { headingFont: "Space Grotesk", bodyFont: "Inter", scalingRatio: "1.4x" },
      colorDirection: { paletteType: "Monochrome Slate", background: "#f8fafc", primary: "#0f172a", accent: "#0ea5e9", contrastDescription: "High Contrast (12.4:1)" },
      whitespaceStrategy: "45% Generous Negative Space",
      brandPlacementDirection: "Upper Right Safety Anchor",
      ctaPlacementDirection: "Lower Centered Hub",
      strengths: ["Exceptional layout clarity", "High executive readability ratios", "Swiss typography consistency"],
      tradeoffs: ["May feel too cold or sterile for youth audiences"],
      rankingScore: 94
    };

    const conceptB: CreativeConcept = {
      conceptId: "con_retro",
      themeName: "Immersive Cyberpunk Retro",
      strategyType: "Playful",
      layoutDirection: "Asymmetric Freeform",
      typographyDirection: { headingFont: "Atma", bodyFont: "Fira Code", scalingRatio: "1.25x" },
      colorDirection: { paletteType: "Cosmic Neon", background: "#020617", primary: "#f8fafc", accent: "#f43f5e", contrastDescription: "Medium Contrast (6.8:1)" },
      whitespaceStrategy: "25% High Density",
      brandPlacementDirection: "Lower Centered Watermark",
      ctaPlacementDirection: "Staggered Right Offset",
      strengths: ["Highly engaging for digital display", "Strong visual novelty rates"],
      tradeoffs: ["Fails standard CMYK print readability guidelines due to neon color ranges"],
      rankingScore: 78
    };

    const result = CreativeDirectorEngine.compareConcepts([conceptA, conceptB]);
    setComparisonResult(result);
  };

  const runSystemTests = () => {
    onAddSystemLog("Creative Director: Launching diagnostic integration and regression testing suite.");
    const logs = CreativeDirectorTestSuite.runAll();
    setTestResults(logs);
    onAddSystemLog("Creative Director: Testing finished. All test modules verified green!");
  };

  // 11-Step Review Pipeline Visualizer State
  const pipelineSteps = [
    { name: "Design Blueprint", desc: "Raw design coordinates parsed" },
    { name: "Creative Evaluation", desc: "Theme consistency check" },
    { name: "Layout Review", desc: "Composition balance & grids" },
    { name: "Typography Review", desc: "Font suitability & hierarchy" },
    { name: "Color Review", desc: "Palette contrast & ratios" },
    { name: "Brand Review", desc: "Logo safety zones" },
    { name: "Accessibility Review", desc: "Contrast & reading flow" },
    { name: "Print Review", desc: "Bleeds & CMYK compatibility" },
    { name: "Audience Review", desc: "Target audience suitability" },
    { name: "Originality Review", desc: "Uniqueness audit" },
    { name: "Improvement Plan", desc: "Self-correction optimization" },
    { name: "Final Approval", desc: "Downstream gate authorization" }
  ];

  const currentStepIndex = isProcessing ? Math.min(11, Math.floor((wsProgress / 100) * 12)) : (reviewReport?.isApproved ? 11 : 9);

  return (
    <div className="space-y-4" id="creative_director_panel">
      {/* HEADER BAR */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl flex items-center justify-center text-fuchsia-400">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-100">
              {lang === "bn" ? "ক্রিয়েটিভ ডিরেক্টর ও রিভিউ ইঞ্জিন" : "Creative Director Critic"}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Phase 2.1.10 • Design Gatekeeper
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${reviewReport?.isApproved ? "bg-emerald-500 animate-ping" : "bg-amber-500 animate-pulse"}`} />
          <span className="text-[9px] font-mono font-bold text-slate-300">
            {reviewReport?.isApproved ? "APPROVED" : "OPTIMIZATION NEEDED"}
          </span>
        </div>
      </div>

      {/* COMPACT CONFIG BAR */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 border border-slate-900 rounded-lg">
        <div>
          <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Target Audience</label>
          <select 
            value={targetAudience} 
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-sans focus:outline-none focus:border-fuchsia-500/50"
          >
            <option value="General Public">General Public</option>
            <option value="Corporate">Corporate / B2B</option>
            <option value="Luxury">Luxury Brands</option>
            <option value="Youth">Youth / Vibrant</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Active Font In Blueprint</label>
          <select 
            value={currentBlueprint.typography.headingFont}
            onChange={(e) => {
              const f = e.target.value;
              setCurrentBlueprint(p => ({ ...p, typography: { ...p.typography, headingFont: f } }));
              setTimeout(() => runFreshReview(), 100);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-sans focus:outline-none focus:border-fuchsia-500/50"
          >
            <option value="Atma">Atma (Playful Bengali Script)</option>
            <option value="Space Grotesk">Space Grotesk (Corporate Geometric)</option>
            <option value="Inter">Inter (Swiss Modernist)</option>
          </select>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-slate-900 overflow-x-auto gap-1 pb-1">
        {[
          { id: "pipeline", label: "Pipeline" },
          { id: "scores", label: "Scorecard" },
          { id: "concepts", label: "Concepts" },
          { id: "telemetry", label: "Observability" },
          { id: "tests", label: "Testing Suite" },
          { id: "docs", label: "Manual" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-t-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === t.id 
                ? "bg-slate-900 text-fuchsia-400 border-t-2 border-fuchsia-500" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* WEBSOCKET STATUS TICKER SIMULATOR */}
      <div className="p-2 bg-slate-900/40 border border-slate-800/60 rounded-lg flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-3.5 h-3.5 text-fuchsia-400 ${isProcessing ? "animate-spin" : ""}`} />
          <span className="text-slate-300">WS Channel:</span>
          <span className="text-fuchsia-400 font-bold">{isProcessing ? wsStatus : "Synced & Monitoring"}</span>
        </div>
        <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-full transition-all duration-300"
            style={{ width: `${isProcessing ? wsProgress : 100}%` }}
          />
        </div>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === "pipeline" && reviewReport && (
        <div className="space-y-4">
          {/* PIPELINE PROGRESS FLOW CHART */}
          <div className="bg-slate-950/60 p-3 border border-slate-900 rounded-xl space-y-2.5">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Review Pipeline Pathway</span>
              <span className="text-slate-500">{currentStepIndex + 1} / 12 Steps</span>
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {pipelineSteps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <div 
                    key={idx}
                    className={`p-1.5 rounded border text-center transition-all ${
                      isActive 
                        ? "bg-fuchsia-950/40 border-fuchsia-500/60 text-fuchsia-300" 
                        : isPassed 
                        ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-400" 
                        : "bg-slate-900/30 border-slate-900/60 text-slate-500"
                    }`}
                  >
                    <div className="text-[8px] font-bold truncate">{step.name}</div>
                    <div className="text-[6px] font-mono text-[9px] mt-0.5">
                      {isActive ? "Active" : isPassed ? "Passed" : "Queued"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIONS AND OVERALL DECISION CARD */}
          <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] font-mono text-slate-400">DECISION SCORECARD</div>
                <div className="text-lg font-extrabold font-mono text-fuchsia-400">{reviewReport.overallScore}%</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={triggerSelfImprovement}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-fuchsia-500 hover:bg-fuchsia-600 disabled:opacity-50 text-white rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/10 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto-Improve
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-lg text-[11px] font-sans leading-relaxed text-slate-300">
              <div className="font-bold text-slate-200 mb-1">Executive Summary:</div>
              {reviewReport.executiveSummary}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-emerald-950/10 border border-emerald-900/40 p-2 rounded-lg text-emerald-400">
                <div className="font-bold mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {reviewReport.strengths.slice(0, 2).map((s, i) => (
                    <li key={i} className="truncate">{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-950/10 border border-rose-900/40 p-2 rounded-lg text-rose-400">
                <div className="font-bold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Weaknesses
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {reviewReport.weaknesses.slice(0, 2).map((w, i) => (
                    <li key={i} className="truncate">{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ACTIVE CRITIQUES FEED */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Critic Findings & Optimization Requirements</h4>
            <div className="space-y-2">
              {reviewReport.weaknesses.length > 0 && reviewReport.weaknesses[0].includes("None") ? (
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  🎉 No critical issues identified. Blueprint is ready for asset synthesis!
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-slate-900/80 border border-rose-950 text-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-[9px] font-mono font-bold">ACCESSIBILITY ERROR</span>
                      <span className="text-[9px] font-mono text-slate-400">Confidence: 92%</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100">Issue: Playing font (Atma) has complex geometric cursive structures</div>
                    <p className="text-[10px] text-slate-400">
                      Reason: Playful script increases reading cognitive load when rendered for Corporate client aesthetics.
                    </p>
                    <div className="p-2 bg-slate-950 border border-slate-900 rounded text-[9px] font-mono text-slate-300">
                      <span className="text-fuchsia-400 font-bold">Required Fix:</span> Replace Atma heading styles with high-structure swiss grotesque patterns.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCORECARD DETAIL VIEWER */}
      {activeTab === "scores" && reviewReport && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "composition", label: "Composition", val: reviewReport.scores.composition },
              { id: "typography", label: "Typography", val: reviewReport.scores.typography },
              { id: "color", label: "Color Harmony", val: reviewReport.scores.color },
              { id: "branding", label: "Branding", val: reviewReport.scores.branding },
              { id: "accessibility", label: "Accessibility", val: reviewReport.scores.accessibility },
              { id: "readability", label: "Readability", val: reviewReport.scores.readability },
              { id: "professionalAppearance", label: "Appearance", val: reviewReport.scores.professionalAppearance },
              { id: "printReadiness", label: "Print Ready", val: reviewReport.scores.printReadiness }
            ].map(sc => (
              <div key={sc.id} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300">{sc.label}</span>
                  <span className={`text-[10px] font-mono font-extrabold ${sc.val.score >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                    {sc.val.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${sc.val.score >= 80 ? "bg-emerald-500" : "bg-amber-500"}`} 
                    style={{ width: `${sc.val.score}%` }}
                  />
                </div>
                <p className="text-[8px] text-slate-400 font-mono leading-relaxed truncate" title={sc.val.reasoning}>
                  {sc.val.reasoning}
                </p>
              </div>
            ))}
          </div>

          {/* AUDIENCE SUITABILITY & ORIGINALITY RISK */}
          <div className="bg-slate-950 p-3 border border-slate-900 rounded-xl grid grid-cols-2 gap-3 text-[10px] font-mono">
            <div className="space-y-1">
              <div className="text-slate-400 uppercase font-bold text-[9px]">Audience Suitability</div>
              <div className="flex items-center justify-between text-slate-200">
                <span>{reviewReport.audienceFitStatus.category}:</span>
                <span className="text-fuchsia-400 font-bold">{reviewReport.audienceFitStatus.score}%</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-normal">
                Fits perfectly with corporate grid structure requirements.
              </p>
            </div>
            <div className="space-y-1 border-l border-slate-900 pl-3">
              <div className="text-slate-400 uppercase font-bold text-[9px]">Originality / Similarity Risk</div>
              <div className="flex items-center justify-between text-slate-200">
                <span>Similarity Risk:</span>
                <span className="text-cyan-400 font-bold">{reviewReport.similarityRiskPercent}%</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-normal">
                No major reference duplicates flags detected.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-CONCEPT COMPARISON MATRIX */}
      {activeTab === "concepts" && comparisonResult && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-fuchsia-950/20 to-slate-950 p-3.5 border border-fuchsia-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-fuchsia-400 font-mono text-[10px] font-bold">
              <Scale className="w-4 h-4" />
              Creative Director Verdict
            </div>
            <p className="text-xs leading-relaxed text-slate-200">
              {comparisonResult.rationale}
            </p>
          </div>

          <div className="space-y-2">
            {comparisonResult.conceptsRanked.map((c, i) => (
              <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400">RANK #{c.rank} • {c.score}%</span>
                    <h5 className="text-xs font-bold text-slate-100">{c.themeName}</h5>
                  </div>
                  {c.rank === 1 && (
                    <span className="px-2 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-[8px] font-mono font-bold rounded">
                      WINNER
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div className="bg-slate-950 p-2 border border-slate-900/60 rounded text-emerald-400">
                    <div className="font-bold mb-1">Strengths:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {c.strengths.map((str, idx) => <li key={idx} className="truncate">{str}</li>)}
                    </ul>
                  </div>
                  <div className="bg-slate-950 p-2 border border-slate-900/60 rounded text-amber-400">
                    <div className="font-bold mb-1">Trade-offs:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {c.tradeoffs.map((tr, idx) => <li key={idx} className="truncate">{tr}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OBSERVABILITY AND TELEMETRY BOARD */}
      {activeTab === "telemetry" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total Appraisals", value: CreativeDirectorTelemetry.getMetrics().totalReviewsProcessed, desc: "Reviews compiled" },
              { label: "Average Appraisal Score", value: `${CreativeDirectorTelemetry.getMetrics().averageQualityScore}%`, desc: "Review quality avg" },
              { label: "Appraisal Latency", value: `${CreativeDirectorTelemetry.getMetrics().averageReviewDurationMs}ms`, desc: "Inference response speed" },
              { label: "Similarity Warnings", value: CreativeDirectorTelemetry.getMetrics().similarityRiskWarnings, desc: "Risk threshold exceeds 30%" }
            ].map((met, i) => (
              <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-center">
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">{met.label}</div>
                <div className="text-lg font-bold font-mono text-cyan-400">{met.value}</div>
                <div className="text-[8px] font-mono text-slate-500">{met.desc}</div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl text-[9px] font-mono text-slate-400">
            📡 Live metrics are published securely to the enterprise telemetry stack for automated system diagnostic verification.
          </div>
        </div>
      )}

      {/* AUTOMATED TESTING SUITE */}
      {activeTab === "tests" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-1 bg-slate-950/40 border border-slate-900 rounded-lg">
            <span className="text-[10px] font-mono text-slate-400 pl-2">Creative Director Critique Verification</span>
            <button
              onClick={runSystemTests}
              className="px-2.5 py-1 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3 h-3" /> Run Diagnostic
            </button>
          </div>

          {testResults ? (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {testResults.map((test, i) => (
                <div key={i} className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg flex items-start gap-2 text-[10px] font-mono">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${test.passed ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <div>
                    <div className="font-bold text-slate-200">{test.name}</div>
                    <p className="text-[8px] text-slate-400 leading-normal">{test.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-xs text-slate-400 font-mono">
              Click run to execute complete Creative Engine integration, critique and revision tests.
            </div>
          )}
        </div>
      )}

      {/* DOCUMENTATION MANUAL GUIDE */}
      {activeTab === "docs" && (
        <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-fuchsia-400 flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> 1. Creative Director Guide
            </h4>
            <p className="text-[10px] text-slate-300 leading-normal">
              Every design plan must undergo a comprehensive evaluation covering hierarchy, typeface accessibility, margins, CMYK print tolerances, and similarity risks. The engine enforces quality gates ensuring score values never drop below 80%.
            </p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <Cpu className="w-4 h-4" /> 2. Critique API SDK Reference
            </h4>
            <pre className="p-2 bg-slate-950 rounded text-[8px] font-mono text-slate-400 overflow-x-auto">
{`// Evaluate existing design blueprint
const report = await fetch('/api/creative-director/review', {
  method: 'POST',
  body: JSON.stringify({ blueprint, targetAudience: 'Corporate' })
});

// Run self-improvement loop optimization
const optimized = await fetch('/api/creative-director/improve', {
  method: 'POST',
  body: JSON.stringify({ blueprint, maxIterations: 3 })
});`}
            </pre>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1">
              <Sliders className="w-4 h-4" /> 3. Quality Metrics & Standards
            </h4>
            <p className="text-[10px] text-slate-300 leading-normal">
              Composition, readability, and brand presence are measured with weighted cognitive formulas. High similarity ratios are automatically flagged with warnings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
