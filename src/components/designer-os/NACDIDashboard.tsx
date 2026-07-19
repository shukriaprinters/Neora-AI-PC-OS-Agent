// NEORA AUTONOMOUS CREATIVE DIRECTOR INTELLIGENCE (NACDI) DASHBOARD
import React, { useState, useEffect } from "react";
import {
  Compass, Sparkles, BookOpen, Layers3, Activity, Terminal, ShieldAlert,
  ArrowRight, ShieldCheck, RefreshCw, Zap, Check, Copy, Flame, HelpCircle,
  Eye, Monitor, Type, Grid, Heart, Smile, Users, Target, Shield, AlertTriangle,
  Layers, ChevronRight, ChevronDown, Lock, Unlock, EyeOff, Edit3, Save, Undo, Redo, Play,
  Send, BarChart3, Scale, MessageSquare, Plus, CheckCircle2, AlertOctagon, HelpCircle as HelpIcon, Sparkle
} from "lucide-react";
import { NACDI, NacdiCreativeStrategy, NacdiCreativeBrief, NacdiEvent, NacdiTelemetry } from "../../lib/ai/cognitive/NACDI";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function NACDIDashboard({ lang, onAddSystemLog }: Props) {
  const nacdi = NACDI.getInstance();

  const presets = [
    { text: "Premium Royal Saffron Packaging with intricate gold lettering", style: "Luxury" },
    { text: "Pohela Boishakh Regional Festival Banner with hand-drawn folk art and Bangla typography", style: "Traditional" },
    { text: "Minimalist corporate financial statement flyer on dark charcoal slate grid", style: "Corporate" }
  ];

  const [prompt, setPrompt] = useState(presets[0].text);
  const [activeTab, setActiveTab] = useState<"strategy" | "brief" | "decisions" | "agents" | "memory" | "risk">("strategy");
  const [strategy, setStrategy] = useState<NacdiCreativeStrategy | null>(null);
  const [brief, setBrief] = useState<NacdiCreativeBrief | null>(null);
  const [events, setEvents] = useState<NacdiEvent[]>([]);
  const [telemetry, setTelemetry] = useState<NacdiTelemetry>(nacdi.getTelemetry());

  // Testing Suite State
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const [testLogs, setTestLogs] = useState<string[]>([]);

  // Simulation State
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Generate initial strategy
    handleAnalyze();
    // Subscribe to event stream
    const unsubscribe = nacdi.subscribe((ev) => {
      setEvents(nacdi.getEventHistory().slice(0, 15));
      setTelemetry({ ...nacdi.getTelemetry() });
    });
    return () => unsubscribe();
  }, []);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    if (onAddSystemLog) {
      onAddSystemLog(`NACDI: Starting strategic brainstorming run for "${prompt}"...`);
    }

    setTimeout(() => {
      const freshStrategy = nacdi.formulateStrategy(prompt);
      setStrategy(freshStrategy);
      setBrief(nacdi.getBrief());
      setIsAnalyzing(false);
      setEvents(nacdi.getEventHistory().slice(0, 15));
      if (onAddSystemLog) {
        onAddSystemLog(`NACDI: Autonomous Creative Strategy formulated successfully.`);
      }
    }, 800);
  };

  const handleRunDiagnostics = async () => {
    setTestStatus("running");
    setTestLogs(["Initializing strategic diagnostic pipeline..."]);
    const logs = await nacdi.runCognitiveTests();
    setTimeout(() => {
      setTestLogs(logs);
      setTestStatus("passed");
      if (onAddSystemLog) {
        onAddSystemLog("NACDI: Strategic diagnostics passed successfully.");
      }
    }, 600);
  };

  return (
    <div className="space-y-4 p-4 text-slate-200">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-1.5">
                NACDI <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-normal">v2.5 Strategic Brain</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                {lang === "bn" ? "নিওরা স্বায়ত্তশাসিত ক্রিয়েটিভ ডিরেক্টর ইন্টেলিজেন্স" : "Neora Autonomous Creative Director Intelligence"}
              </p>
            </div>
          </div>
        </div>

        {/* TELEMETRY GAUGES */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <div className="text-[9px] text-slate-500 font-mono">STRATEGY TIME</div>
              <div className="text-xs font-mono font-bold text-cyan-400">{telemetry.strategyGenTimeMs}ms</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <div className="text-[9px] text-slate-500 font-mono">ACCEPTANCE</div>
              <div className="text-xs font-mono font-bold text-rose-400">{telemetry.recommendationAcceptanceRate}%</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <div className="text-[9px] text-slate-500 font-mono">REVISIONS</div>
              <div className="text-xs font-mono font-bold text-amber-400">{telemetry.revisionCount} Runs</div>
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGIC CONTROL INPUT PANEL */}
      <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3">
        <label className="block text-[11px] font-mono font-bold text-slate-400">
          {lang === "bn" ? "১. ডিজাইনের উদ্দেশ্য ও ব্র্যান্ড প্রম্পট প্রদান করুন" : "1. INPUT DESIGN INTENT & STRATEGIC BRAND PROMPT"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500/50"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your strategic creative requirement..."
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {lang === "bn" ? "ভাবনা চলছে..." : "Thinking..."}
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5" />
                {lang === "bn" ? "ভাবনা শুরু করুন" : "Brainstorm"}
              </>
            )}
          </button>
        </div>

        {/* PRESET TAGS */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(preset.text);
                if (onAddSystemLog) {
                  onAddSystemLog(`Preset Selected: ${preset.style}`);
                }
              }}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800/60 px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              #{preset.style}: {preset.text.slice(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: PRIMARY WORKFLOW STRATEGY ENGINE (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* NAVIGATION BAR */}
          <div className="flex bg-slate-950 border border-slate-900 p-1 rounded-lg overflow-x-auto gap-1">
            {[
              { id: "strategy", label: lang === "bn" ? "ক্রিয়েটিভ স্ট্র্যাটেজি" : "Creative Strategy", icon: Compass },
              { id: "brief", label: lang === "bn" ? "ক্রিয়েটিভ ব্রিফ" : "Creative Brief", icon: BookOpen },
              { id: "decisions", label: lang === "bn" ? "ডিজাইন সিদ্ধান্ত" : "Decision Intel", icon: Target },
              { id: "agents", label: lang === "bn" ? "এজেন্ট অবজেক্টিভ" : "Agent Direction", icon: Users },
              { id: "memory", label: lang === "bn" ? "স্মৃতি ভাণ্ডার" : "Creative Memory", icon: Layers3 },
              { id: "risk", label: lang === "bn" ? "ঝুঁকি ব্যবস্থাপনা" : "Risk Radar", icon: ShieldAlert }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isSelected ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ACTIVE CONTENT VIEWPORTS */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 min-h-[350px]">
            {strategy && (
              <>
                {/* 1. CREATIVE STRATEGY VIEWPORT */}
                {activeTab === "strategy" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" />
                        CREATIVE STRATEGY DOCUMENT
                      </div>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        ACTIVE STRATEGY VALIDATED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Business Context */}
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 space-y-2">
                        <h4 className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-blue-400" />
                          BUSINESS INTENT & GOALS
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between border-b border-slate-900/80 pb-1">
                            <span className="text-slate-500">Industry Sector:</span>
                            <span className="font-medium text-slate-300">{strategy.industry}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900/80 pb-1">
                            <span className="text-slate-500">Marketing Funnel Stage:</span>
                            <span className="font-medium text-slate-300">{strategy.businessObjective.marketingFunnelStage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">CTA Priority Weight:</span>
                            <span className="font-medium text-slate-300">{strategy.businessObjective.ctaPriority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Visual & Emotional Tone */}
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 space-y-2">
                        <h4 className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                          VISUAL PSYCHOLOGY & STYLE
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between border-b border-slate-900/80 pb-1">
                            <span className="text-slate-500">Visual Aesthetic Tone:</span>
                            <span className="font-medium text-slate-300 text-right">{strategy.visualTone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Emotional Target:</span>
                            <span className="font-medium text-slate-300">{strategy.desiredEmotion}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Target Audience Model Simulator */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-900 space-y-2">
                      <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-cyan-400" />
                        AUTONOMOUS TARGET AUDIENCE MODEL (SIMULATOR)
                      </div>
                      {strategy.targetAudience.map((persona, index) => (
                        <div key={index} className="space-y-2 text-xs">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded border border-slate-900">
                            <div>
                              <div className="text-[9px] text-slate-500 font-mono">COGNITIVE PERSONA</div>
                              <div className="font-medium text-slate-300">{persona.name}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500 font-mono">AGE CATEGORY</div>
                              <div className="font-medium text-slate-300">{persona.ageRange} Years</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500 font-mono">GEOGRAPHICAL REGION</div>
                              <div className="font-medium text-slate-300">{persona.region}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500 font-mono">PRIMARY CULTURE</div>
                              <div className="font-medium text-slate-300">{persona.culture}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-900/40 p-2.5 rounded">
                            <div>
                              <div className="text-[9px] text-slate-400 font-mono">DEVICE CONSUMPTION PORTFOLIO</div>
                              <div className="text-slate-300 font-mono text-[11px]">{persona.deviceUsage}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400 font-mono">ACCESSIBILITY SAFEGUARDS REGISTERED</div>
                              <div className="text-emerald-400 text-[11px] font-mono">{persona.accessibilityNeeds.join(", ")}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Brand Strategy Engine Rules */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-900 space-y-3">
                      <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-purple-400" />
                        BRAND IDENTITY STRATEGY & TYPOGRAPHY SCHEMAS
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-950 p-3 rounded border border-slate-900 text-xs">
                          <div className="text-[9px] text-slate-500 font-mono">BRAND VOICE PROFILE</div>
                          <div className="font-medium text-indigo-400 mt-1">{strategy.brandStrategy.voice}</div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-900 text-xs">
                          <div className="text-[9px] text-slate-500 font-mono">COLOR SPECTRUM ALIGNMENT</div>
                          <div className="font-medium text-rose-400 mt-1">{strategy.brandStrategy.colorPhilosophy}</div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-900 text-xs">
                          <div className="text-[9px] text-slate-500 font-mono">TYPOGRAPHY RULES</div>
                          <ul className="list-disc list-inside text-slate-300 mt-1 space-y-1 text-[11px]">
                            {strategy.brandStrategy.typographyRules.map((rule, idx) => (
                              <li key={idx}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CREATIVE BRIEF GENERATOR */}
                {activeTab === "brief" && brief && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        AUTONOMOUSLY COMPILED CREATIVE BRIEF
                      </div>
                      <button
                        onClick={() => {
                          if (onAddSystemLog) onAddSystemLog(`Exported Creative Brief ID: ${brief.id}`);
                        }}
                        className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-mono px-2 py-0.5 rounded transition-all cursor-pointer"
                      >
                        EXPORT BRIEF JSON
                      </button>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3">
                      <h3 className="text-xs font-mono font-bold text-indigo-300 border-b border-slate-900 pb-1.5 uppercase">
                        {brief.title}
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 font-mono text-[10px] block">CRITICAL BUSINESS OBJECTIVES:</span>
                          <ul className="list-decimal list-inside space-y-1 text-slate-300 pl-1 mt-1">
                            {brief.objectives.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2">
                          <span className="text-slate-400 font-mono text-[10px] block">AUDIENCE DEMOGRAPHIC SUMMARY:</span>
                          <p className="text-slate-300 italic pl-1 mt-0.5">{brief.audienceSummary}</p>
                        </div>

                        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-400 font-mono text-[10px] block">DELIVERABLES REQUIRED:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1 mt-1">
                              {brief.deliverables.map((del, i) => (
                                <li key={i}>{del}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-slate-400 font-mono text-[10px] block">CONSTRAINTS TO ENFORCE:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-rose-400 pl-1 mt-1">
                              {brief.constraints.map((con, i) => (
                                <li key={i}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-900">
                          <span className="text-slate-400 font-mono text-[10px] block">SUCCESS CRITERIA & VERIFICATION METRICS:</span>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {brief.successCriteria.map((crit, idx) => (
                              <span key={idx} className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                {crit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DECISION INTELLIGENCE VIEWPORT */}
                {activeTab === "decisions" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                        <Target className="w-4 h-4" />
                        DECISION INTELLIGENCE & REASONING INDEX
                      </div>
                    </div>

                    <div className="space-y-3">
                      {nacdi.getDecisions().map((decision, i) => (
                        <div key={i} className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-950 pb-1.5">
                            <span className="bg-indigo-500/20 text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                              {decision.element} CHOICE
                            </span>
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                              <span className="text-[10px] font-mono">CONFIDENCE ESTIMATE</span>
                              <span className="font-mono font-bold text-indigo-400">{decision.confidenceLevel}%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1.5">
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] block">DECISION MADE:</span>
                                <span className="text-slate-200 font-bold">{decision.decision}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] block">CRITICAL RATIONALE:</span>
                                <span className="text-slate-300">{decision.reason}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] block">ALTERNATIVES CONSIDERED:</span>
                                <span className="text-slate-400 italic">{decision.alternativesConsidered.join(", ")}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] block">EXPECTED OUTCOME:</span>
                                <span className="text-indigo-300">{decision.expectedOutcome}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] block">TRADE-OFFS & NEGATIVE BINDINGS:</span>
                                <span className="text-rose-400 font-mono text-[10px]">{decision.tradeoffs}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Alternative Concept Engine Comparison */}
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-900 space-y-3">
                      <div className="text-xs font-mono font-bold text-slate-300">
                        CONCEPT CANDIDATE GENERATION ENGINE
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {nacdi.getAlternatives().map((alt, i) => (
                          <div key={i} className="bg-slate-950 p-3 rounded border border-slate-900 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200 flex items-center gap-1">
                                <Sparkle className="w-3.5 h-3.5 text-indigo-400" />
                                DIRECTION: {alt.name}
                              </span>
                              <span className="text-indigo-400 font-mono text-[10px]">{alt.confidenceEstimate}% Fit</span>
                            </div>
                            <p className="text-slate-400 text-[11px]">{alt.description}</p>
                            <div>
                              <div className="text-[9px] text-slate-500 font-mono">STRENGTHS:</div>
                              <div className="text-emerald-400 text-[11px] font-mono">{alt.strengths.join(", ")}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-500 font-mono">TRADEOFFS:</div>
                              <div className="text-rose-400 text-[11px] font-mono">{alt.tradeoffs.join(", ")}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MULTI-AGENT DIRECTION LAYER */}
                {activeTab === "agents" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        MULTI-AGENT DIRECTION & STRUCTURED OBJECTIVES DISPATCH
                      </div>
                    </div>

                    <div className="space-y-3">
                      {nacdi.getAgentObjectives().map((agent, idx) => (
                        <div key={idx} className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-950 pb-1.5">
                            <span className="text-indigo-400 font-mono font-bold text-xs flex items-center gap-1">
                              <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
                              SPECIALIST ROLE: [{agent.agentRole.toUpperCase()} AGENT]
                            </span>
                            <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-900 px-2.5 py-0.5 rounded font-mono">
                              STATUS: STANDBY OBJECTIVE
                            </span>
                          </div>

                          <div className="text-xs space-y-2">
                            <div>
                              <span className="text-slate-500 font-mono text-[9px] block">DIRECTED OBJECTIVE (NO RAW PROMPTS):</span>
                              <p className="text-slate-200 font-medium">{agent.objective}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] block">REQUIRED ARTIFACTS / DELIVERABLES:</span>
                                <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                                  {agent.deliverablesRequired.map((d, i) => (
                                    <li key={i}>{d}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-slate-500 font-mono text-[9px] block">CONSTRAINTS TO ENFORCE strictly:</span>
                                <ul className="list-disc list-inside text-rose-400 text-[11px] space-y-0.5">
                                  {agent.constraintsToEnforce.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. CREATIVE MEMORY SYSTEM */}
                {activeTab === "memory" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                        <Layers3 className="w-4 h-4" />
                        CREATIVE MEMORY SYSTEM & SAVED STATE METADATA
                      </div>
                    </div>

                    <div className="space-y-3">
                      {nacdi.getMemoryHistory().map((mem, i) => (
                        <div key={i} className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-mono">{mem.timestamp}</span>
                            <div>
                              <span className="bg-slate-950 text-indigo-400 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-900 uppercase">
                                {mem.type}
                              </span>
                              <p className="text-xs font-medium text-slate-300 mt-1">{mem.details}</p>
                            </div>
                          </div>
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. RISK MANAGEMENT RADAR */}
                {activeTab === "risk" && brief && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        CRITICAL STRATEGIC RISK RADAR & MITIGATION
                      </div>
                    </div>

                    <div className="space-y-3">
                      {brief.riskAssessment.map((risk, i) => (
                        <div key={i} className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-rose-400 font-mono text-xs font-bold flex items-center gap-1.5">
                              <AlertOctagon className="w-4 h-4 text-rose-400" />
                              RISK ELEMENT: {risk.category}
                            </span>
                            <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono">
                              HIGH SEVERITY
                            </span>
                          </div>

                          <div className="text-xs space-y-2">
                            <div>
                              <span className="text-slate-500 font-mono text-[9px] block">POTENTIAL THREAT:</span>
                              <p className="text-slate-200">{risk.description}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 font-mono text-[9px] block">RECOMMENDED AUTOMATION MITIGATION:</span>
                              <p className="text-emerald-400 font-medium">{risk.mitigation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PLUGIN SDK, TESTING DIAGNOSTICS & SYSTEM EVENT STREAM (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* SYSTEM INTEGRITY DIAGNOSTIC INTEGRATION TESTER */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                NACDI SELF-DIAGNOSTIC TESTER
              </span>
              <button
                onClick={handleRunDiagnostics}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer"
              >
                RUN TESTS
              </button>
            </div>

            {testStatus === "running" && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Diagnostics executing in workspace container...
              </div>
            )}

            {testStatus === "passed" && (
              <div className="space-y-2">
                <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  COGNITIVE COMPONENTS STABLE (100% HEALTHY)
                </div>
                <div className="max-h-[120px] overflow-y-auto bg-slate-900 p-2.5 rounded text-[10px] font-mono text-slate-400 space-y-1">
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
                Strategic unit tests have not been run. Click Run Tests to run self-checks on cognitive models.
              </p>
            )}
          </div>

          {/* STRATEGIC PLUGIN SDK CONFIGURATION */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              STRATEGIC PLUGIN SDK REGISTRY
            </span>

            <div className="space-y-2">
              {nacdi.getPlugins().map((plug) => (
                <div
                  key={plug.id}
                  onClick={() => {
                    nacdi.togglePlugin(plug.id);
                    setTelemetry({ ...nacdi.getTelemetry() });
                  }}
                  className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-all ${
                    plug.loaded 
                      ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-300" 
                      : "bg-slate-900/60 border-slate-900/80 text-slate-500 hover:border-slate-800"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{plug.name}</div>
                    <span className="text-[9px] font-mono uppercase tracking-wider block text-slate-500">{plug.type}</span>
                  </div>
                  {plug.loaded ? (
                    <Unlock className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC STRATEGIC WEBSOCKET / SE EVENT BUS LOG */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              EVENT BUS REAL-TIME EVENTS
            </span>

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 scrollbar-thin">
              {events.length > 0 ? (
                events.map((ev) => (
                  <div key={ev.id} className="text-[10px] font-mono border-b border-slate-900/60 pb-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>[{ev.timestamp}]</span>
                      <span className="text-indigo-400 uppercase text-[9px]">{ev.type}</span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{ev.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-500 italic font-mono">No real-time messages on event bus yet. Run a brainstorm to dispatch events.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
