import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Users,
  ShieldCheck,
  Activity,
  Network,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Zap,
  Sparkles,
  Layers,
  FileCode,
  Gauge,
  Workflow,
  Search,
  Lock,
  Wrench,
  Bot
} from "lucide-react";
import type {
  EngineeringTeamMember,
  EngineeringReviewReport,
  ChangeImpactAnalysis
} from "../lib/neoraContinuousEngineering";

interface NeoraEngineeringEvolutionDashboardProps {
  geminiKey?: string;
}

export function NeoraEngineeringEvolutionDashboard({ geminiKey }: NeoraEngineeringEvolutionDashboardProps) {
  const [activeTab, setActiveTab] = useState<"teams" | "audit" | "impact" | "graph">("teams");
  const [teams, setTeams] = useState<EngineeringTeamMember[]>([]);
  const [auditReport, setAuditReport] = useState<EngineeringReviewReport | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Change Impact state
  const [targetPath, setTargetPath] = useState("src/lib/neoraAIDevStudioRouter.ts");
  const [proposedChange, setProposedChange] = useState("Add new real-time WebSockets streaming endpoint for agent logs");
  const [impactResult, setImpactResult] = useState<ChangeImpactAnalysis | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  useEffect(() => {
    fetchTeams();
    runAudit();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/engineering/teams");
      const data = await res.json();
      if (data.success && data.teams) {
        setTeams(data.teams);
      }
    } catch (e) {
      console.error("Failed to fetch engineering teams:", e);
    }
  };

  const runAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch("/api/engineering/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiKey })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setAuditReport(data.report);
      }
    } catch (e) {
      console.error("Failed to run quality audit:", e);
    } finally {
      setLoadingAudit(false);
    }
  };

  const calculateImpact = async () => {
    if (!targetPath || !proposedChange) return;
    setLoadingImpact(true);
    try {
      const res = await fetch("/api/engineering/change-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPath, proposedChangeSummary: proposedChange })
      });
      const data = await res.json();
      if (data.success && data.impact) {
        setImpactResult(data.impact);
      }
    } catch (e) {
      console.error("Failed to calculate change impact:", e);
    } finally {
      setLoadingImpact(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header & Quality Score Banner */}
      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              Autonomous Engineering & Quality Evolution Engine
              <span className="text-[8.5px] font-extrabold text-cyan-400 bg-cyan-950/50 border border-cyan-500/25 px-1.5 py-0.5 rounded uppercase tracking-widest">
                Document A Parts 3 & 4
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              13 Specialized engineering teams, self-debug & repair loop, continuous quality evolution metrics, and memory graph topology.
            </p>
          </div>
        </div>

        {auditReport && (
          <div className="flex items-center gap-3 bg-black/40 border border-slate-900 px-3.5 py-2 rounded-xl">
            <div className="flex flex-col text-right">
              <span className="text-[8.5px] text-slate-500 uppercase font-bold">Overall Readiness Score</span>
              <span className="text-emerald-400 font-extrabold text-xs">
                {auditReport.qualityScores.overallReadinessScore}% ({auditReport.qualityScores.readinessGrade})
              </span>
            </div>
            <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${auditReport.qualityScores.overallReadinessScore}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Primary Tabs */}
      <div className="flex border-b border-slate-850 gap-1 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "teams", label: "13 Engineering Teams & Pipeline (Part 3)", icon: Users },
          { id: "audit", label: "Continuous Quality Audit Score (Part 4)", icon: Gauge },
          { id: "impact", label: "Change Impact Analysis Engine", icon: Workflow },
          { id: "graph", label: "Memory Graph Topology", icon: Network }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-xl text-[10.5px] font-bold cursor-pointer flex items-center gap-1.5 border-t border-x transition-all whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 border-slate-800 text-cyan-300"
                  : "bg-slate-950/40 border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <AnimatePresence mode="wait">
        {/* TAB 1: 13 ENGINEERING TEAMS */}
        {activeTab === "teams" && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Autonomous Logical Engineering Organization</span>
                <span className="text-[9.5px] text-slate-500">
                  13 specialized engineering domains coordinating execution, quality gates, and self-repair loops automatically.
                </span>
              </div>
              <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded font-extrabold uppercase">
                {teams.length} Active Domain Teams
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams.map((team, idx) => (
                <div key={idx} className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-200 text-[10.5px] flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      {team.role}
                    </span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                      {team.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-[9.5px]">
                    <div className="text-slate-400">
                      <span className="text-slate-500 font-bold">Team Lead:</span> {team.lead}
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500 font-bold">Focus Area:</span> {team.focus}
                    </div>
                  </div>

                  <div className="mt-1 flex justify-between items-center bg-black/40 border border-slate-900 p-2 rounded-xl text-[9px]">
                    <span className="text-slate-500">Assigned Tasks:</span>
                    <span className="text-cyan-400 font-extrabold">{team.tasksAssigned} Pipeline Tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 2: CONTINUOUS QUALITY AUDIT SCORE */}
        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">Continuous Quality Review & Self-Repair Log</span>
                <span className="text-[9.5px] text-slate-500">
                  Evaluates 9 architectural dimension metrics, detects defects automatically, and executes non-breaking self-repairs.
                </span>
              </div>
              <button
                onClick={runAudit}
                disabled={loadingAudit}
                className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 rounded-xl font-bold cursor-pointer transition-all text-[10px] flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: loadingAudit ? "1.5s" : "0s" }} />
                {loadingAudit ? "Auditing..." : "Re-run Quality Audit"}
              </button>
            </div>

            {auditReport && (
              <div className="flex flex-col gap-4">
                {/* Score Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {[
                    { name: "Architecture Quality", val: auditReport.qualityScores.architectureQuality },
                    { name: "Maintainability", val: auditReport.qualityScores.maintainability },
                    { name: "Performance Speed", val: auditReport.qualityScores.performance },
                    { name: "Security Enforcement", val: auditReport.qualityScores.security },
                    { name: "Accessibility (WCAG)", val: auditReport.qualityScores.accessibility },
                    { name: "Documentation", val: auditReport.qualityScores.documentation },
                    { name: "Testing Coverage", val: auditReport.qualityScores.testingCoverage },
                    { name: "Developer Experience", val: auditReport.qualityScores.developerExperience },
                    { name: "User Experience", val: auditReport.qualityScores.userExperience }
                  ].map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl flex flex-col gap-1">
                      <span className="text-[8.5px] text-slate-500 uppercase font-bold truncate">{m.name}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-400 font-extrabold text-xs">{m.val}%</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Self Debug & Self Repair Discoveries */}
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
                  <span className="font-bold text-slate-200 uppercase text-[10px] flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-cyan-400" /> Self-Debug & Self-Repair History Log
                  </span>

                  <div className="flex flex-col gap-2">
                    {auditReport.selfDebugDiscoveries.map(debug => (
                      <div key={debug.id} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1 text-[10px]">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{debug.file}</span>
                          <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                            Repaired
                          </span>
                        </div>
                        <span className="text-slate-400">Root Cause: {debug.rootCause}</span>
                        <span className="text-cyan-400 font-bold">Fix Applied: {debug.fixDetails}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: CHANGE IMPACT ANALYSIS */}
        {activeTab === "impact" && (
          <motion.div
            key="impact"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3">
              <span className="font-bold text-slate-200 uppercase text-[10px] flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" /> Autonomous Change Impact Analyzer
              </span>

              <div className="flex flex-col gap-2">
                <label className="text-[9.5px] text-slate-400 font-bold">Target File Path:</label>
                <input
                  type="text"
                  value={targetPath}
                  onChange={e => setTargetPath(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />

                <label className="text-[9.5px] text-slate-400 font-bold mt-1">Proposed Code Modification:</label>
                <input
                  type="text"
                  value={proposedChange}
                  onChange={e => setProposedChange(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />

                <button
                  onClick={calculateImpact}
                  disabled={loadingImpact}
                  className="mt-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {loadingImpact ? "Analyzing Impact..." : "Evaluate Change Impact"}
                </button>
              </div>

              {impactResult && (
                <div className="mt-2 p-4 bg-black/50 border border-slate-900 rounded-2xl flex flex-col gap-3 text-[10px]">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="font-bold text-slate-200">Impact Assessment Result</span>
                    <span
                      className={`text-[8.5px] font-bold px-2 py-0.5 rounded border uppercase ${
                        impactResult.recommendedApproval === "Approved"
                          ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-950/50 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {impactResult.recommendedApproval}
                    </span>
                  </div>

                  <p className="text-slate-300">{impactResult.explanation}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl">
                      <span className="font-bold text-slate-400 block mb-1">Affected Modules:</span>
                      <span className="text-slate-200">{impactResult.affectedModules.join(", ")}</span>
                    </div>

                    <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl">
                      <span className="font-bold text-slate-400 block mb-1">Affected APIs:</span>
                      <span className="text-cyan-400">{impactResult.affectedAPIs.join(", ") || "None"}</span>
                    </div>

                    <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl">
                      <span className="font-bold text-slate-400 block mb-1">Affected UI Components:</span>
                      <span className="text-purple-300">{impactResult.affectedUIComponents.join(", ") || "None"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: MEMORY GRAPH TOPOLOGY */}
        {activeTab === "graph" && (
          <motion.div
            key="graph"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-3"
          >
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="font-bold text-slate-200 uppercase text-[10px] flex items-center gap-1.5">
                <Network className="w-4 h-4 text-cyan-400" /> Continuous Memory Graph Topology
              </span>
              <span className="text-[8.5px] text-slate-500">
                Maintains awareness of relationships between Modules, APIs, Services, UI, and Database.
              </span>
            </div>

            {auditReport && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {auditReport.memoryGraph.nodes.map(node => (
                  <div key={node.id} className="p-3 bg-black/40 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 text-[10.5px]">{node.label}</span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded uppercase">
                        {node.type}
                      </span>
                    </div>
                    {node.path && <span className="text-[9px] text-slate-500 font-mono truncate">{node.path}</span>}
                    <div className="mt-1 flex justify-between items-center text-[8.5px]">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-emerald-400 font-bold">{node.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
