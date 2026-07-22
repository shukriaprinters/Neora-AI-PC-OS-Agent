import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  ListOrdered,
  FileCode,
  Layers,
  Sparkles,
  Zap,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Network,
  Cpu,
  ChevronRight,
  ChevronDown,
  Info
} from "lucide-react";
import type {
  RecursivePlan,
  RequirementAnalysis,
  RecursiveNode,
  PriorityLevel,
  RiskItem,
  ArchitectureDecision
} from "../lib/neoraRecursivePlanner";

interface NeoraRecursivePlannerDashboardProps {
  geminiKey?: string;
  onGoalExecute?: (goal: string) => void;
}

export function NeoraRecursivePlannerDashboard({ geminiKey, onGoalExecute }: NeoraRecursivePlannerDashboardProps) {
  const [goal, setGoal] = useState("Build Neora Genesis Enterprise AI Operating System");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<RecursivePlan | null>(null);
  const [subTab, setSubTab] = useState<
    "requirements" | "tree" | "priority" | "risks" | "adr" | "dependencies"
  >("requirements");

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ node_plat_1: true, node_sub_1: true });

  const handleAnalyze = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/planner/recursive-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim(), geminiKey })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (e) {
      console.error("Failed to execute recursive analysis:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateNode = async (nodeId: string) => {
    if (!plan) return;
    try {
      const res = await fetch("/api/planner/validate-node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, nodeId })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (e) {
      console.error("Failed to validate node:", e);
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header & Goal Dispatch Bar */}
      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <GitBranch className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              Autonomous Requirement Analysis & Recursive Planner
              <span className="text-[8.5px] font-extrabold text-purple-400 bg-purple-950/50 border border-purple-500/25 px-1.5 py-0.5 rounded uppercase tracking-widest">
                Document A Part 2
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Recursively breaks down high-level objectives into 10-level hierarchy trees, enforced engineering priorities, and risk matrices.
            </p>
          </div>
        </div>

        {plan && (
          <div className="flex items-center gap-3 bg-black/40 border border-slate-900 px-3.5 py-2 rounded-xl">
            <div className="flex flex-col text-right">
              <span className="text-[8.5px] text-slate-500 uppercase font-bold">Self-Validation Score</span>
              <span className="text-cyan-400 font-extrabold text-xs">{plan.completionScore}% Validated</span>
            </div>
            <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${plan.completionScore}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Goal Input Control */}
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="Enter goal e.g. 'Build real-time vector document intelligence platform'..."
          className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-500/50 transition-all"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/25 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: loading ? "1.5s" : "0s" }} />
          {loading ? "Analyzing Goal Recursively..." : "Run Recursive Analysis"}
        </button>
      </div>

      {!plan ? (
        <div className="bg-[#0b0e14]/50 border border-slate-850 p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-3 text-slate-500 italic">
          <Layers className="w-8 h-8 text-slate-600 animate-bounce" />
          <span>Click "Run Recursive Analysis" to perform autonomous requirement extraction, recursive decomposition, and priority task generation.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Sub-Navigation Tabs */}
          <div className="flex border-b border-slate-850 gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "requirements", label: "Requirements Matrix (10)", icon: Sliders },
              { id: "tree", label: "Recursive Hierarchy Tree", icon: GitBranch },
              { id: "priority", label: "Engineering Priority Pipeline", icon: ListOrdered },
              { id: "risks", label: "Risk & Mitigation Matrix", icon: ShieldAlert },
              { id: "adr", label: "Architecture Decisions (ADR)", icon: FileCode },
              { id: "dependencies", label: "Dependency Graph & Validation", icon: Network }
            ].map(tab => {
              const isActive = subTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-t-xl text-[10.5px] font-bold cursor-pointer flex items-center gap-1.5 border-t border-x transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 border-slate-800 text-purple-300"
                      : "bg-slate-950/40 border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sub Tab Contents */}
          <AnimatePresence mode="wait">
            {/* SUB TAB 1: REQUIREMENTS MATRIX */}
            {subTab === "requirements" && (
              <motion.div
                key="reqs"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {Object.entries(plan.requirements).map(([category, items]) => (
                  <div key={category} className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                      <span className="font-bold text-slate-200 capitalize text-[10px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        {category.replace(/([A-Z])/g, " $1")} Requirements
                      </span>
                      <span className="text-[8px] bg-slate-900 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded font-bold">
                        {(items as string[]).length} rules
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5 text-[9.5px] text-slate-400">
                      {(items as string[]).map((reqStr, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>{reqStr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            )}

            {/* SUB TAB 2: RECURSIVE HIERARCHY TREE */}
            {subTab === "tree" && (
              <motion.div
                key="tree"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="font-bold text-slate-200 uppercase text-[10px]">
                    Multi-Level Recursive Task Decomposition Tree
                  </span>
                  <span className="text-[9px] text-slate-500">
                    Levels: Platform → Subsystem → Module → Feature → Component → Service → Interface → Validation
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {plan.tree.map(node => renderTreeNode(node, expandedNodes, toggleNode, handleValidateNode))}
                </div>
              </motion.div>
            )}

            {/* SUB TAB 3: ENGINEERING PRIORITY PIPELINE */}
            {subTab === "priority" && (
              <motion.div
                key="priority"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
              >
                <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block text-[10.5px]">Enforced Engineering Priority Rank</span>
                    <span className="text-[9.5px] text-slate-500">
                      Critical Foundation → Architecture → Core Services → Shared Infrastructure → Business Logic → UI → Automation → Optimization → Advanced Features
                    </span>
                  </div>
                  <span className="text-[9px] bg-purple-950 text-purple-400 border border-purple-500/20 px-2 py-1 rounded font-extrabold uppercase">
                    {plan.prioritizedTasks.length} Sequenced Tasks
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {plan.prioritizedTasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-400 text-[10px] shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200 text-[11px]">{task.title}</span>
                            <span className="text-[8px] bg-purple-950/60 text-purple-300 border border-purple-500/25 px-1.5 py-0.5 rounded font-extrabold uppercase">
                              {task.priority}
                            </span>
                            <span className="text-[8px] bg-slate-900 text-slate-500 border border-slate-800 px-1 py-0.5 rounded uppercase">
                              {task.level}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-1 text-[9px] text-slate-500">
                            <span>Acceptance Criteria: {task.acceptanceCriteria.join(", ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[8.5px] font-bold px-2 py-0.5 rounded border uppercase ${
                            task.status === "Validated"
                              ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-950/50 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {task.status}
                        </span>
                        {task.status !== "Validated" && (
                          <button
                            onClick={() => handleValidateNode(task.id)}
                            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 rounded-lg font-bold cursor-pointer transition-all text-[9.5px] flex items-center gap-1"
                          >
                            <FileCheck className="w-3 h-3" /> Validate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SUB TAB 4: RISK & MITIGATION MATRIX */}
            {subTab === "risks" && (
              <motion.div
                key="risks"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {plan.riskMatrix.map(risk => (
                  <div key={risk.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-amber-300 text-[10.5px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {risk.category} Risk
                      </span>
                      <div className="flex gap-1">
                        <span className="text-[8px] bg-rose-950 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-extrabold uppercase">
                          Impact: {risk.impact}
                        </span>
                        <span className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded uppercase">
                          Prob: {risk.probability}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-relaxed">{risk.risk}</p>

                    <div className="bg-black/50 border border-slate-900 p-2 rounded-xl text-[9px]">
                      <span className="font-bold text-cyan-400 block mb-0.5">Automated Mitigation Strategy:</span>
                      <p className="text-slate-400">{risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* SUB TAB 5: ARCHITECTURE DECISION ENGINE (ADR LOG) */}
            {subTab === "adr" && (
              <motion.div
                key="adr"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                {plan.architectureDecisions.map(adr => (
                  <div key={adr.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="font-bold text-slate-100 text-[11px] flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-purple-400" /> {adr.title}
                      </span>
                      <span
                        className={`text-[8.5px] font-bold px-2 py-0.5 rounded border uppercase ${
                          adr.isReversible ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/20" : "bg-purple-950/40 text-purple-400 border-purple-500/20"
                        }`}
                      >
                        {adr.isReversible ? "Reversible Decision" : "Irreversible Architecture Rule"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
                      <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                        <span className="font-bold text-emerald-400 block mb-1">Why Chosen:</span>
                        <p className="text-slate-300 leading-relaxed">{adr.whyChosen}</p>
                      </div>

                      <div className="p-2.5 bg-black/40 border border-slate-900 rounded-xl">
                        <span className="font-bold text-rose-400 block mb-1">Alternatives Evaluated & Rejected:</span>
                        <p className="text-slate-400 leading-relaxed">
                          {adr.alternatives.join(" • ")} — <span className="italic">{adr.whyAlternativesRejected}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-500 italic bg-slate-950 p-2 rounded-xl border border-slate-900">
                      Long-term Impact: {adr.futureImpact}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* SUB TAB 6: DEPENDENCY GRAPH & VALIDATION */}
            {subTab === "dependencies" && (
              <motion.div
                key="deps"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="font-bold text-slate-200 uppercase text-[10px] flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-cyan-400" /> Module & Dependency Topology
                  </span>
                  <span className="text-[8.5px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Zero Dependency Conflicts Detected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {plan.dependencyGraph.nodes.map((node, idx) => (
                    <div key={idx} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                      <span className="font-bold text-slate-200 text-[10.5px]">{node.name}</span>
                      <span className="text-[8px] bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded uppercase self-start">
                        {node.type}
                      </span>
                      <div className="text-[9px] text-slate-500 mt-1">
                        Depends on: {node.dependsOn.length > 0 ? node.dependsOn.join(", ") : "Root (No Dependencies)"}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function renderTreeNode(
  node: RecursiveNode,
  expandedMap: Record<string, boolean>,
  onToggle: (id: string) => void,
  onValidate: (id: string) => void
) {
  const isExpanded = expandedMap[node.id] !== false;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div key={node.id} className="flex flex-col gap-1.5 ml-2 border-l border-slate-850 pl-3 my-1">
      <div className="p-2.5 bg-slate-900/40 border border-slate-850/90 rounded-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button
              onClick={() => onToggle(node.id)}
              className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-3.5 h-3.5" />
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] bg-purple-950 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded font-extrabold uppercase">
                {node.level}
              </span>
              <span className="font-bold text-slate-200 text-[10.5px]">{node.title}</span>
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">{node.description}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[8px] bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
            {node.priority}
          </span>
          <span
            className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border uppercase ${
              node.status === "Validated"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                : "bg-amber-950/40 text-amber-400 border-amber-500/20"
            }`}
          >
            {node.status}
          </span>
          {node.status !== "Validated" && (
            <button
              onClick={() => onValidate(node.id)}
              className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 rounded text-[8.5px] font-bold cursor-pointer transition-all"
            >
              Validate
            </button>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col gap-1">
          {node.children!.map(child => renderTreeNode(child, expandedMap, onToggle, onValidate))}
        </div>
      )}
    </div>
  );
}
