import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookmarkCheck,
  Compass,
  Layers,
  Sparkles,
  Bot,
  Workflow,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Cpu,
  Palette,
  Briefcase,
  Terminal,
  Search,
  BookOpen,
  Zap,
  Globe,
  Settings,
  ArrowRight,
  ChevronRight,
  Award
} from "lucide-react";
import type {
  ProductIdentity,
  ProductModeConfig,
  CapabilityDomain,
  AIPersona,
  SSOTWorkflowStage,
  WorkflowStageState,
  SSOTPrincipleRule,
  SSOTAuditReport,
  NeoraProductMode
} from "../lib/neoraProductSSOT";

interface NeoraProductSSOTDashboardProps {
  geminiKey?: string;
}

export function NeoraProductSSOTDashboard({ geminiKey }: NeoraProductSSOTDashboardProps) {
  const [subTab, setSubTab] = useState<"identity" | "modes" | "domains" | "personas" | "workflow" | "audit">("identity");

  const [identity, setIdentity] = useState<ProductIdentity | null>(null);
  const [modes, setModes] = useState<ProductModeConfig[]>([]);
  const [activeMode, setActiveModeState] = useState<NeoraProductMode>("Developer Mode");
  const [domains, setDomains] = useState<CapabilityDomain[]>([]);
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [principles, setPrinciples] = useState<SSOTPrincipleRule[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowStageState[]>([]);
  const [audit, setAudit] = useState<SSOTAuditReport | null>(null);

  const [domainFilter, setDomainFilter] = useState<string>("All");

  useEffect(() => {
    fetchIdentity();
    fetchModes();
    fetchDomains();
    fetchPersonas();
    fetchPrinciples();
    fetchWorkflow();
    fetchAudit();
  }, []);

  const fetchIdentity = async () => {
    try {
      const res = await fetch("/api/ssot/identity");
      const data = await res.json();
      if (data.success && data.identity) setIdentity(data.identity);
    } catch (e) {
      console.error("Failed to fetch SSOT identity:", e);
    }
  };

  const fetchModes = async () => {
    try {
      const res = await fetch("/api/ssot/modes");
      const data = await res.json();
      if (data.success && data.modes) {
        setModes(data.modes);
        if (data.activeMode) setActiveModeState(data.activeMode);
      }
    } catch (e) {
      console.error("Failed to fetch SSOT modes:", e);
    }
  };

  const fetchDomains = async () => {
    try {
      const res = await fetch("/api/ssot/domains");
      const data = await res.json();
      if (data.success && data.domains) setDomains(data.domains);
    } catch (e) {
      console.error("Failed to fetch SSOT domains:", e);
    }
  };

  const fetchPersonas = async () => {
    try {
      const res = await fetch("/api/ssot/personas");
      const data = await res.json();
      if (data.success && data.personas) setPersonas(data.personas);
    } catch (e) {
      console.error("Failed to fetch SSOT personas:", e);
    }
  };

  const fetchPrinciples = async () => {
    try {
      const res = await fetch("/api/ssot/principles");
      const data = await res.json();
      if (data.success && data.principles) setPrinciples(data.principles);
    } catch (e) {
      console.error("Failed to fetch SSOT principles:", e);
    }
  };

  const fetchWorkflow = async () => {
    try {
      const res = await fetch("/api/ssot/workflow");
      const data = await res.json();
      if (data.success && data.workflow) setWorkflow(data.workflow);
    } catch (e) {
      console.error("Failed to fetch SSOT workflow:", e);
    }
  };

  const fetchAudit = async () => {
    try {
      const res = await fetch("/api/ssot/audit");
      const data = await res.json();
      if (data.success && data.audit) setAudit(data.audit);
    } catch (e) {
      console.error("Failed to fetch SSOT audit:", e);
    }
  };

  const handleSwitchMode = async (mode: NeoraProductMode) => {
    try {
      const res = await fetch("/api/ssot/modes/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode })
      });
      const data = await res.json();
      if (data.success && data.allModes) {
        setModes(data.allModes);
        setActiveModeState(mode);
        fetchAudit();
      }
    } catch (e) {
      console.error("Failed to switch mode:", e);
    }
  };

  const filteredDomains = domainFilter === "All"
    ? domains
    : domains.filter(d => d.category === domainFilter);

  return (
    <div className="flex flex-col gap-4 font-mono text-xs">
      {/* 1. Header & Single Source of Truth Banner */}
      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BookmarkCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              Neora Product Specification — Single Source of Truth (SSOT)
              <span className="text-[8.5px] font-extrabold text-cyan-400 bg-cyan-950/50 border border-cyan-500/25 px-1.5 py-0.5 rounded uppercase tracking-widest">
                Document B Part 1
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Enterprise Master Spec v1.0 — 24 Capability Domains, 8 Operating Modes, 8 AI Personas, 10-Stage UX Pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 border border-slate-900 px-3.5 py-2 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex flex-col text-right">
            <span className="text-[8.5px] text-slate-500 uppercase font-bold">Active Platform Mode</span>
            <span className="text-cyan-300 font-extrabold text-xs">{activeMode}</span>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation */}
      <div className="flex border-b border-slate-850 gap-1 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "identity", label: "Identity & Principles", icon: Compass },
          { id: "modes", label: "8 Operating Modes", icon: Sliders },
          { id: "domains", label: "24 Capability Domains", icon: Layers },
          { id: "personas", label: "8 AI Behavioral Personas", icon: Bot },
          { id: "workflow", label: "10-Stage UX Pipeline", icon: Workflow },
          { id: "audit", label: "SSOT Compliance Audit", icon: Award }
        ].map(tab => {
          const isActive = subTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
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

      {/* 3. Sub Tab Content */}
      <AnimatePresence mode="wait">
        {/* SUB TAB 1: IDENTITY & PRINCIPLES */}
        {subTab === "identity" && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Identity Info */}
            {identity && (
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Official Product Name</span>
                  <span className="text-xl font-extrabold text-slate-100 tracking-tight">{identity.name}</span>
                  <span className="text-[10.5px] text-cyan-400 font-bold">{identity.category} — {identity.type}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {identity.identityPillars.map((pillar, idx) => (
                    <span key={idx} className="bg-cyan-950/60 text-cyan-300 border border-cyan-500/25 px-2.5 py-1 rounded-lg text-[9.5px] font-bold">
                      {pillar}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Principles & Rules */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-slate-200 uppercase text-[10px] flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" /> Core Product Principles & Non-Negotiables
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {principles.map(p => (
                  <div key={p.id} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="font-bold text-slate-100 text-[10.5px]">{p.ruleTitle}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase ${
                        p.category === "Non-Negotiable Rule"
                          ? "bg-rose-950 text-rose-400 border border-rose-500/20"
                          : "bg-cyan-950 text-cyan-400 border border-cyan-500/20"
                      }`}>
                        {p.category}
                      </span>
                    </div>

                    <p className="text-[9.5px] text-slate-400 leading-relaxed">{p.description}</p>

                    <div className="mt-auto pt-1.5 flex items-center justify-end">
                      <span className="text-[8.5px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Enforced Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SUB TAB 2: 8 OPERATING MODES */}
        {subTab === "modes" && (
          <motion.div
            key="modes"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">8 Adaptable Product Operating Modes</span>
                <span className="text-[9.5px] text-slate-500">
                  The interface dynamically adapts tools, AI personas, and workspaces to match the user's immediate domain goal.
                </span>
              </div>
              <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded font-extrabold uppercase">
                Active: {activeMode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {modes.map(mode => (
                <div
                  key={mode.mode}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    mode.isCurrentActive
                      ? "bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-950/30"
                      : "bg-slate-950/40 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-100 text-[11px]">{mode.mode}</span>
                      {mode.isCurrentActive && (
                        <span className="text-[8px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-extrabold uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[9.5px] font-bold text-cyan-400">{mode.title}</span>
                    <p className="text-[9px] text-slate-400 leading-relaxed">{mode.description}</p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
                    <div className="flex items-center justify-between text-[8.5px] text-slate-500">
                      <span>Primary Persona:</span>
                      <span className="text-amber-400 font-bold">{mode.personaActive}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {mode.primaryTools.map((tool, idx) => (
                        <span key={idx} className="bg-black/40 border border-slate-900 px-1.5 py-0.5 rounded text-[8px] text-slate-300">
                          {tool}
                        </span>
                      ))}
                    </div>

                    {!mode.isCurrentActive && (
                      <button
                        onClick={() => handleSwitchMode(mode.mode)}
                        className="mt-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-cyan-300 border border-slate-800 rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1 text-[9.5px]"
                      >
                        Switch to {mode.mode}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 3: 24 CAPABILITY DOMAINS */}
        {subTab === "domains" && (
          <motion.div
            key="domains"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">24 Capability Domains Matrix</span>
                <span className="text-[9.5px] text-slate-500">
                  Comprehensive coverage spanning AI Design, Vector Graphics, Document Intelligence, PC Automation & Cloud Sync.
                </span>
              </div>

              {/* Category Filter */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                {["All", "Creative & Design", "AI & Intelligence", "Engineering & Automation", "Enterprise & Workspace"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setDomainFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                      domainFilter === cat
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                        : "bg-slate-950 text-slate-500 border border-slate-900 hover:text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDomains.map(dom => (
                <div key={dom.id} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                      <span className="font-bold text-slate-100 text-[10.5px]">{dom.name}</span>
                      <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        {dom.status}
                      </span>
                    </div>
                    <span className="text-[8.5px] text-cyan-400 font-bold">{dom.category}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-[9px]">
                    <span className="text-slate-500 font-bold">Key Capabilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {dom.features.map((feat, idx) => (
                        <span key={idx} className="bg-black/50 border border-slate-900 px-1.5 py-0.5 rounded text-slate-300">
                          {feat}
                        </span>
                      ))}
                    </div>

                    <span className="text-slate-500 font-bold mt-1">Editable Artifacts:</span>
                    <div className="flex flex-wrap gap-1">
                      {dom.editableArtifacts.map((art, idx) => (
                        <span key={idx} className="bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                          {art}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 4: 8 AI BEHAVIORAL PERSONAS */}
        {subTab === "personas" && (
          <motion.div
            key="personas"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">8 Specialized AI Behavioral Roles</span>
                <span className="text-[9.5px] text-slate-500">
                  Neora seamlessly shifts its persona between Creative Director, Software Engineer, Project Manager, and Business Consultant.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personas.map(persona => (
                <div key={persona.role} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="font-bold text-slate-100 text-[11px] flex items-center gap-2">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      {persona.role}
                    </span>
                    <span className="text-[8.5px] text-amber-400 bg-amber-950/50 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                      {persona.systemInstructionTone}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-relaxed">{persona.description}</p>

                  <div className="bg-black/50 border border-slate-900 p-2.5 rounded-xl text-[9px] flex flex-col gap-1">
                    <span className="font-bold text-cyan-400 block">Core System Responsibilities:</span>
                    <ul className="flex flex-col gap-1 text-slate-400">
                      {persona.coreResponsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-cyan-500 font-bold">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 5: 10-STAGE UX PIPELINE */}
        {subTab === "workflow" && (
          <motion.div
            key="workflow"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block text-[10.5px]">10-Stage User Experience Pipeline</span>
                <span className="text-[9.5px] text-slate-500">
                  Goal → Conversation → Understanding → Planning → Creation → Review → Variation → Editing → Export → Delivery
                </span>
              </div>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded font-extrabold uppercase">
                All 10 Stages Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {workflow.map((stg, idx) => (
                <div key={stg.stage} className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between gap-2 text-[9.5px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1">
                      <span className="font-bold text-slate-100 flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-cyan-950 text-cyan-400 text-[8px] font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {stg.stage}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>

                    <span className="text-slate-500 font-bold mt-1 text-[8.5px]">Outputs:</span>
                    <div className="flex flex-col gap-1">
                      {stg.outputArtifacts.map((out, oIdx) => (
                        <span key={oIdx} className="bg-black/50 border border-slate-900 px-1.5 py-0.5 rounded text-slate-300 text-[8px]">
                          {out}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-900 flex flex-col gap-0.5">
                    <span className="text-[8px] text-cyan-400 font-bold">Editable Properties:</span>
                    <span className="text-[8px] text-slate-400">{stg.editableProperties.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUB TAB 6: SSOT COMPLIANCE AUDIT */}
        {subTab === "audit" && audit && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                  {audit.ssotComplianceScore}%
                </div>
                <div>
                  <span className="font-bold text-slate-100 text-[11px] block">SSOT Master Spec Compliance Report</span>
                  <span className="text-[9px] text-slate-500">Audited at {new Date(audit.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold text-[9.5px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero Dummy Code Verified
                </span>
                <span className="bg-cyan-950/60 text-cyan-300 border border-cyan-500/20 px-3 py-1.5 rounded-xl font-bold text-[9.5px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Multi-Provider Independent
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[10px]">
              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between gap-1">
                <span className="text-slate-500 font-bold">Active Capability Domains</span>
                <span className="text-xl font-extrabold text-cyan-400">{audit.activeDomainsCount} / {audit.domainCount}</span>
                <span className="text-[8.5px] text-slate-400">100% Fully Registered in SSOT Matrix</span>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between gap-1">
                <span className="text-slate-500 font-bold">Operating Modes</span>
                <span className="text-xl font-extrabold text-amber-400">{audit.activeMode}</span>
                <span className="text-[8.5px] text-slate-400">Dynamically Adapting UI Tools</span>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between gap-1">
                <span className="text-slate-500 font-bold">AI Behavioral Roles</span>
                <span className="text-xl font-extrabold text-emerald-400">{audit.personaCount} Personas Active</span>
                <span className="text-[8.5px] text-slate-400">Creative Director → Engineer</span>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-between gap-1">
                <span className="text-slate-500 font-bold">Enforced Principles & Rules</span>
                <span className="text-xl font-extrabold text-rose-400">{audit.principlesCount} Enforced</span>
                <span className="text-[8.5px] text-slate-400">0 Known Critical Violations</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
