import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Zap,
  Sparkles,
  AlertTriangle,
  Lock,
  Workflow,
  Scale,
  Award,
  Layers,
  FileCode,
  ListFilter,
  Activity,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Check
} from "lucide-react";
import type {
  GovernancePipelineStep,
  GovernanceStepStatus,
  GateReviewDecision,
  EnterpriseGovernancePolicy
} from "../lib/neoraProductGovernance";

interface NeoraProductGovernanceDashboardProps {
  geminiKey?: string;
}

export function NeoraProductGovernanceDashboard({ geminiKey }: NeoraProductGovernanceDashboardProps) {
  const [subTab, setSubTab] = useState<"pipeline" | "evaluator" | "policies" | "decisions">("pipeline");
  const [pipeline, setPipeline] = useState<GovernanceStepStatus[]>([]);
  const [policies, setPolicies] = useState<EnterpriseGovernancePolicy[]>([]);
  const [decisions, setDecisions] = useState<GateReviewDecision[]>([]);

  // Gate review evaluator form
  const [featureTitle, setFeatureTitle] = useState("Enterprise Real-Time Multi-Agent Collaboration Protocol");
  const [featurePurpose, setFeaturePurpose] = useState("Enable distributed AI sub-agents to claim workspace subtrees without task collisions");
  const [loadingEval, setLoadingEval] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<GateReviewDecision | null>(null);

  useEffect(() => {
    fetchPipeline();
    fetchPolicies();
    fetchDecisions();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await fetch("/api/governance/pipeline");
      const data = await res.json();
      if (data.success && data.pipeline) {
        setPipeline(data.pipeline);
      }
    } catch (e) {
      console.error("Failed to fetch governance pipeline:", e);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await fetch("/api/governance/policies");
      const data = await res.json();
      if (data.success && data.policies) {
        setPolicies(data.policies);
      }
    } catch (e) {
      console.error("Failed to fetch governance policies:", e);
    }
  };

  const fetchDecisions = async () => {
    try {
      const res = await fetch("/api/governance/decisions");
      const data = await res.json();
      if (data.success && data.decisions) {
        setDecisions(data.decisions);
      }
    } catch (e) {
      console.error("Failed to fetch gate decisions:", e);
    }
  };

  const handleEvaluateGate = async () => {
    if (!featureTitle.trim()) return;
    setLoadingEval(true);
    try {
      const res = await fetch("/api/governance/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureTitle, featurePurpose, geminiKey })
      });
      const data = await res.json();
      if (data.success && data.decision) {
        setCurrentDecision(data.decision);
        fetchDecisions();
      }
    } catch (e) {
      console.error("Failed to evaluate gate review:", e);
    } finally {
      setLoadingEval(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header & Authority Banner */}
      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Scale className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              Autonomous Product Governance & Execution Authority
              <span className="text-[8.5px] font-extrabold text-amber-400 bg-amber-950/50 border border-amber-500/25 px-1.5 py-0.5 rounded uppercase tracking-widest">
                Document A Part 5
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              12-Step Product Governance Pipeline, 9 Architectural Criteria & 7-Point Release Gate Authority.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 border border-slate-900 px-3.5 py-2 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex flex-col text-right">
            <span className="text-[8.5px] text-slate-500 uppercase font-bold">Executive Gate Status</span>
            <span className="text-emerald-400 font-extrabold text-xs">Zero Critical Defect Policy Enforced</span>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation */}
      <div className="flex border-b border-slate-850 gap-1 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "pipeline", label: "12-Step Governance Pipeline", icon: Workflow },
          { id: "evaluator", label: "Executive Gate Review Evaluator", icon: FileCheck },
          { id: "policies", label: "Enterprise Governance Policies", icon: ShieldAlert },
          { id: "decisions", label: "Gate Review History & Decisions", icon: Award }
        ].map(tab => {
          const isActive = subTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-xl text-[10.5px] font-bold cursor-pointer flex items-center gap-1.5 border-t border-x transition-all whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 border-slate-800 text-amber-300"
                  : "bg-slate-950/40 border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Sub Tab Content */}
      <AnimatePresence mode="wait">
        {/* SUB TAB 1: 12-STEP GOVERNANCE PIPELINE */}
        {subTab === "pipeline" && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">End-to-End Product Lifecycle Pipeline</span>
                <span className="text-[9.5px] text-slate-500">
                  Vision → Goal Analysis → Requirement Validation → Architecture → Implementation → Integration → Quality → Security → Performance → Release → Monitoring → Improvement
                </span>
              </div>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded font-extrabold uppercase">
                12 / 12 Verified Passed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pipeline.map((step, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-200 text-[10.5px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/20 flex items-center justify-center text-[9px] font-extrabold">
                        #{idx + 1}
                      </span>
                      {step.step}
                    </span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> {step.status}
                    </span>
                  </div>

                  <p className="text-[9.5px] text-slate-400 leading-relaxed">{step.notes}</p>

                  <div className="mt-auto pt-1.5 border-t border-slate-900 flex justify-between items-center text-[8.5px] text-slate-500">
                    <span>Evaluator:</span>
                    <span className="text-amber-400 font-bold">{step.evaluator}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 2: EXECUTIVE GATE REVIEW EVALUATOR */}
        {subTab === "evaluator" && (
          <motion.div
            key="evaluator"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
              <span className="font-bold text-slate-200 uppercase text-[10px] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" /> Executive Gate Review Authority Evaluator
              </span>

              <div className="flex flex-col gap-2">
                <label className="text-[9.5px] text-slate-400 font-bold">Feature Title / Objective:</label>
                <input
                  type="text"
                  value={featureTitle}
                  onChange={e => setFeatureTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
                />

                <label className="text-[9.5px] text-slate-400 font-bold mt-1">Feature Purpose & Value Statement:</label>
                <input
                  type="text"
                  value={featurePurpose}
                  onChange={e => setFeaturePurpose(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/50"
                />

                <button
                  onClick={handleEvaluateGate}
                  disabled={loadingEval}
                  className="mt-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: loadingEval ? "1.5s" : "0s" }} />
                  {loadingEval ? "Running Gate Review Evaluation..." : "Run Gate Review Evaluation"}
                </button>
              </div>

              {currentDecision && (
                <div className="mt-2 p-4 bg-black/60 border border-slate-850 rounded-2xl flex flex-col gap-4 text-[10px]">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <div>
                      <span className="font-bold text-slate-100 text-[11px] block">{currentDecision.featureTitle}</span>
                      <span className="text-[8.5px] text-slate-500">Feature ID: {currentDecision.featureId}</span>
                    </div>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-extrabold uppercase">
                      {currentDecision.decisionAuthority}
                    </span>
                  </div>

                  {/* 9 Architectural Criteria */}
                  <div>
                    <span className="font-bold text-amber-400 block mb-2 uppercase text-[9px]">
                      9 Core Architectural & Governance Decision Criteria
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(currentDecision.checklist).map(([key, val]) => (
                        <div key={key} className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                          <span className="text-[9px] text-slate-300 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${val ? "text-emerald-400" : "text-rose-400"}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7 Release Gate Checks */}
                  <div>
                    <span className="font-bold text-cyan-400 block mb-2 uppercase text-[9px]">
                      7 Mandatory Release Gate Checks
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(currentDecision.releaseGateChecks).map(([key, val]) => (
                        <div key={key} className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                          <span className="text-[9px] text-slate-300 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${val ? "text-emerald-400" : "text-rose-400"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 3: ENTERPRISE GOVERNANCE POLICIES */}
        {subTab === "policies" && (
          <motion.div
            key="policies"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Enforced Governance Policies & Rules</span>
                <span className="text-[9.5px] text-slate-500">
                  Mandatory governance standards prohibiting arbitrary technical debt, un-proxied API calls, and uncontrolled bloat.
                </span>
              </div>
              <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-500/20 px-2 py-1 rounded font-extrabold uppercase">
                {policies.length} Active Policies
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {policies.map(policy => (
                <div key={policy.policyId} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-100 text-[11px] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      {policy.title}
                    </span>
                    <span className="text-[8px] bg-rose-950 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-extrabold uppercase">
                      {policy.enforcement}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-relaxed">{policy.rule}</p>

                  <div className="bg-black/50 border border-slate-900 p-2.5 rounded-xl text-[9px] flex flex-col gap-1">
                    <span className="font-bold text-rose-400 block">Strictly Prohibited Actions:</span>
                    <ul className="flex flex-col gap-1 text-slate-400">
                      {policy.prohibitedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 4: GATE REVIEW HISTORY & DECISIONS */}
        {subTab === "decisions" && (
          <motion.div
            key="decisions"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Historical Product Governance Audit Trail</span>
                <span className="text-[9.5px] text-slate-500">
                  Record of all executive gate review decisions, risk evaluations, and release approvals.
                </span>
              </div>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded font-extrabold uppercase">
                {decisions.length} Evaluated Features
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {decisions.map(dec => (
                <div key={dec.featureId} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2 text-[10px]">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <div>
                      <span className="font-bold text-slate-100 text-[11px]">{dec.featureTitle}</span>
                      <span className="text-[8.5px] text-slate-500 block">Evaluated at {new Date(dec.evaluatedAt).toLocaleString()}</span>
                    </div>
                    <span className="text-[8.5px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold uppercase">
                      Score: {dec.governanceScore}/100 ({dec.decisionAuthority})
                    </span>
                  </div>

                  <p className="text-slate-300">{dec.featureMetadata.purpose}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    <div className="p-2 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="font-bold text-amber-400 block mb-1">User Value:</span>
                      <p className="text-slate-400">{dec.featureMetadata.userValue}</p>
                    </div>

                    <div className="p-2 bg-black/40 border border-slate-900 rounded-xl">
                      <span className="font-bold text-cyan-400 block mb-1">Business Value:</span>
                      <p className="text-slate-400">{dec.featureMetadata.businessValue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
