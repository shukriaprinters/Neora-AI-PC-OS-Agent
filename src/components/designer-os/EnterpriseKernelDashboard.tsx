// ENTERPRISE CORE RUNTIME KERNEL (ECK) DASHBOARD (Phase 2.3.6A.1.5)
import React, { useState, useEffect } from "react";
import {
  Cpu, Activity, Zap, Play, CheckCircle2, AlertTriangle, RefreshCw, Terminal,
  Sliders, Shield, Database, LayoutGrid, Check, Globe, HelpCircle, Lock, Server, Key
} from "lucide-react";
import { EnterpriseKernel, KernelService, KernelEvent, KernelPermission, KernelWorkflow, KernelJob, KernelServiceId } from "../../lib/ai/cognitive/EnterpriseKernel";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function EnterpriseKernelDashboard({ lang, onAddSystemLog }: Props) {
  const kernel = EnterpriseKernel.getInstance();

  const [services, setServices] = useState<KernelService[]>(kernel.getServices());
  const [events, setEvents] = useState<KernelEvent[]>(kernel.getEventHistory());
  const [permissions, setPermissions] = useState<KernelPermission[]>(kernel.getPermissions());
  const [workflows, setWorkflows] = useState<KernelWorkflow[]>(kernel.getActiveWorkflows());
  const [jobs, setJobs] = useState<KernelJob[]>(kernel.getBackgroundJobs());
  const [routerTarget, setRouterTarget] = useState(kernel.getActiveAiRouterTarget());

  // Interactive Form States
  const [workflowName, setWorkflowName] = useState("Enterprise Brand Rebranding Production packaging");
  const [eventTopicFilter, setEventTopicFilter] = useState<string>("all");

  useEffect(() => {
    updateLocalStates();

    const unsubscribe = kernel.subscribe((ev) => {
      updateLocalStates();
      if (onAddSystemLog) {
        onAddSystemLog(`[Kernel] [${ev.topic}] ${ev.message}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateLocalStates = () => {
    setServices([...kernel.getServices()]);
    setEvents([...kernel.getEventHistory()]);
    setPermissions([...kernel.getPermissions()]);
    setWorkflows([...kernel.getActiveWorkflows()]);
    setJobs([...kernel.getBackgroundJobs()]);
    setRouterTarget(kernel.getActiveAiRouterTarget());
  };

  const handleTogglePermission = (key: KernelPermission["key"]) => {
    kernel.togglePermission(key);
  };

  const handleServiceStart = (id: KernelServiceId) => {
    kernel.startService(id);
  };

  const handleServiceStop = (id: KernelServiceId) => {
    kernel.stopService(id);
  };

  const handleRouterTargetChange = (val: typeof routerTarget) => {
    kernel.setAiRouterTarget(val);
  };

  const handleTriggerWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowName.trim()) return;
    kernel.triggerWorkflowSimulation(workflowName);
    setWorkflowName("");
  };

  const handleJobTick = (id: string) => {
    kernel.triggerJobTick(id);
  };

  // Filter events based on topic
  const filteredEvents = events.filter(e =>
    eventTopicFilter === "all" || e.topic === eventTopicFilter
  );

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-mono rounded border border-indigo-500/30">Phase 2.3.6A.1.5</span>
            <h1 className="text-xl font-bold tracking-tight text-white">Enterprise Core Runtime Kernel API & Orchestrator</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "bn" ? "নিওরা ওএস কার্নেল: সেন্ট্রাল ইভেন্ট বাস, সার্ভিস রেজিস্ট্রি এবং ডায়নামিক এআই রাউটার।" : "Operating kernel of Neora Design OS. Coordinates all creative services, security models, and workflows."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">AI ROUTER RULES:</label>
          <select
            value={routerTarget}
            onChange={(e) => handleRouterTargetChange(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded text-xs text-white p-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="hybrid_load_balancer">Hybrid Load Balancer</option>
            <option value="neora_native">Neora Native AI LLM</option>
            <option value="ollama">Ollama (Local LLM)</option>
            <option value="openai">OpenAI (SaaS Cloud)</option>
            <option value="gemini">Gemini Enterprise (Cloud)</option>
          </select>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Central Service Registry & Permissions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Central Service Registry */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-400" />
              {lang === "bn" ? "সেন্ট্রাল সার্ভিস রেজিস্ট্রি" : "Central Service Registry"}
            </h2>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {services.map(s => (
                <div key={s.id} className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-300 block">{s.name}</span>
                    <span className="text-[9px] text-slate-500 block font-mono">ID: {s.id} | v{s.version}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                      s.status === "running" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-slate-850 text-slate-500 border border-slate-800"
                    }`}>
                      {s.status.toUpperCase()}
                    </span>
                    {s.status === "running" ? (
                      <button
                        onClick={() => handleServiceStop(s.id)}
                        className="text-[10px] text-red-400 font-bold hover:underline cursor-pointer"
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => handleServiceStart(s.id)}
                        className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Permissions Middleware */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              {lang === "bn" ? "নিরাপত্তা পারমিশন গেটওয়ে" : "Security Middleware & Permissions"}
            </h2>

            <div className="space-y-2">
              {permissions.map(p => (
                <div key={p.key} className="p-2 bg-slate-950 border border-slate-800 rounded flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-300 block leading-tight">{p.label}</span>
                    <span className="text-[9px] text-slate-500 block font-mono">Scope: {p.scope.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={() => handleTogglePermission(p.key)}
                    className={`px-2 py-1 text-[10px] rounded font-bold border transition cursor-pointer ${
                      p.allowed
                        ? "bg-emerald-600/15 text-emerald-400 border-emerald-600/30"
                        : "bg-red-600/15 text-red-400 border-red-600/30"
                    }`}
                  >
                    {p.allowed ? "ALLOWED" : "BLOCKED"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center / Right Column: Workflow Orchestrator & Event Bus */}
        <div className="space-y-6 lg:col-span-2">
          {/* Workflow Orchestrator */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              {lang === "bn" ? "ওয়ার্কফ্লো অর্কেস্ট্রেটর" : "Enterprise Workflow Orchestrator"}
            </h2>

            <form onSubmit={handleTriggerWorkflow} className="flex gap-2">
              <input
                type="text"
                required
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Name custom workflow process to orchestrate..."
                className="bg-slate-950 border border-slate-800 rounded text-xs text-white p-2 focus:outline-none focus:border-cyan-500 flex-1 font-mono"
              />
              <button
                type="submit"
                className="px-4 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white rounded transition flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                Orchestrate Workflow
              </button>
            </form>

            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
              {workflows.map(wf => (
                <div key={wf.id} className="p-3 bg-slate-950 border border-slate-800 rounded text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                    <div>
                      <span className="font-bold text-slate-200 block">{wf.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono block">ID: {wf.id} | Triggered: {new Date(wf.triggeredAt).toLocaleTimeString()}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold border ${
                      wf.status === "success" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                      wf.status === "running" ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 animate-pulse" : "bg-slate-850 text-slate-400 border-slate-800"
                    }`}>
                      {wf.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Progressive steps */}
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
                    {wf.steps.map(step => (
                      <div
                        key={step.id}
                        className={`p-1.5 rounded border ${
                          step.status === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          step.status === "running" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse" : "bg-slate-900 border-slate-800 text-slate-500"
                        }`}
                        title={step.operation}
                      >
                        <div className="font-bold uppercase text-[8px] truncate">{step.targetService}</div>
                        <div className="truncate mt-0.5">{step.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strongly-typed Event Bus stream & Scheduler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Background Scheduler */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                {lang === "bn" ? "ব্যাকগ্রাউন্ড শিডিউলার" : "Background Jobs Scheduler"}
              </h2>

              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {jobs.map(job => (
                  <div key={job.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-300 block">{job.name}</span>
                      <span className="text-[8px] px-1 bg-slate-900 text-slate-500 rounded border border-slate-800 font-mono">PRIORITY: {job.priority.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[10px] font-mono">
                      <span className="text-slate-500">Interval: {job.intervalMs}ms</span>
                      <button
                        onClick={() => handleJobTick(job.id)}
                        className="text-cyan-400 font-bold hover:underline cursor-pointer"
                      >
                        Tick Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Bus topic stream */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  {lang === "bn" ? "কার্নেল ইভেন্ট বাস" : "Core Event Bus Stream"}
                </h2>

                <select
                  value={eventTopicFilter}
                  onChange={(e) => setEventTopicFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-[10px] font-mono text-white p-1 rounded focus:outline-none"
                >
                  <option value="all">All topics</option>
                  <option value="SystemStarted">Startup</option>
                  <option value="ServiceStatusChanged">Service Status</option>
                  <option value="CommandExecuted">Commands</option>
                  <option value="PermissionUpdated">Permissions</option>
                  <option value="WorkflowTriggered">Workflows</option>
                  <option value="TelemetryLogged">Telemetry</option>
                </select>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 max-h-[140px] overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5 flex-1 mt-2">
                {filteredEvents.map(e => (
                  <div key={e.id} className="border-b border-slate-900/50 pb-1.5">
                    <div className="flex justify-between text-[8px]">
                      <span className="text-indigo-400 font-bold">[{e.topic}]</span>
                      <span className="text-slate-600">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span className="text-slate-300 block mt-0.5">{e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EnterpriseKernelDashboard;
