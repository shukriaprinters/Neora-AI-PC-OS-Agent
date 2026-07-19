// WORKSPACE RUNTIME ARCHITECTURE DASHBOARD (Phase 2.3.6A.1.1)
import React, { useState, useEffect } from "react";
import {
  Cpu, Activity, Layers, Play, CheckCircle2, AlertTriangle, RefreshCw, Terminal,
  Settings, Sliders, Shield, Database, LayoutGrid, Check, Globe, HelpCircle, Sparkles
} from "lucide-react";
import { WorkspaceRuntime, WorkspaceConfig, WorkspaceState, WorkspaceSession, WorkspaceEvent, WorkspaceTelemetry, WorkspaceMode } from "../../lib/ai/cognitive/WorkspaceRuntime";
import { EnterpriseKernel } from "../../lib/ai/cognitive/EnterpriseKernel";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function WorkspaceRuntimeDashboard({ lang, onAddSystemLog }: Props) {
  const wrt = WorkspaceRuntime.getInstance();
  const kernel = EnterpriseKernel.getInstance();

  const [workspace, setWorkspace] = useState<WorkspaceConfig>(wrt.getActiveWorkspace());
  const [state, setState] = useState<WorkspaceState>(wrt.getWorkspaceState());
  const [bootSteps, setBootSteps] = useState<string[]>(wrt.getBootSteps());
  const [sessions, setSessions] = useState<WorkspaceSession[]>(wrt.getSessions());
  const [telemetry, setTelemetry] = useState<WorkspaceTelemetry>(wrt.getTelemetry());
  const [events, setEvents] = useState<WorkspaceEvent[]>(wrt.getEventHistory());
  const [serviceStatus, setServiceStatus] = useState<string>("running");

  // Interactive UI helpers
  const [isBooting, setIsBooting] = useState(false);

  useEffect(() => {
    setWorkspace({ ...wrt.getActiveWorkspace() });
    setSessions([...wrt.getSessions()]);
    setEvents([...wrt.getEventHistory()]);

    const handleKernelUpdate = () => {
      const status = kernel.getServices().find(s => s.id === "workspace_runtime")?.status || "running";
      setServiceStatus(status);
    };

    handleKernelUpdate();

    const unsubscribe = wrt.subscribe((ev) => {
      setWorkspace({ ...wrt.getActiveWorkspace() });
      setState(wrt.getWorkspaceState());
      setSessions([...wrt.getSessions()]);
      setEvents(wrt.getEventHistory().slice(0, 15));
      if (onAddSystemLog) {
        onAddSystemLog(`[WRT] ${ev.message}`);
      }
    });

    const unsubscribeKernel = kernel.subscribe((ev) => {
      if (ev.topic === "ServiceStatusChanged") {
        handleKernelUpdate();
      }
    });

    const poll = setInterval(() => {
      setTelemetry({ ...wrt.getTelemetry() });
    }, 1500);

    return () => {
      unsubscribe();
      unsubscribeKernel();
      clearInterval(poll);
    };
  }, []);

  const handleModeChange = (mode: WorkspaceMode) => {
    wrt.setWorkspaceMode(mode);
  };

  const handleToolChange = (tool: string) => {
    wrt.setActiveTool(tool);
  };

  const handleCrashRecovery = () => {
    wrt.triggerCrashRecoverySimulation();
  };

  const handleReboot = async () => {
    setIsBooting(true);
    await wrt.bootAndInitialize();
    setIsBooting(false);
  };

  if (serviceStatus === "stopped") {
    return (
      <div className="p-8 bg-slate-950 text-slate-100 rounded-xl border border-red-900/30 space-y-6 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 animate-pulse">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === "bn" ? "ওয়ার্কস্পেস রানটাইম সার্ভিস অফলাইন" : "Workspace Runtime Service Offline"}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "bn" 
              ? "এই ডোমেন সার্ভিসটি সেন্ট্রাল অপারেটিং কার্নেলে বন্ধ করা হয়েছে। ক্যানভাসে কাজ করা এবং সেশন ট্র্যাকিং সাময়িকভাবে স্থগিত আছে।" 
              : "This service has been stopped in the central Enterprise Kernel. Design board interactions and session tracking are temporarily suspended."}
          </p>
        </div>
        <button
          onClick={() => kernel.startService("workspace_runtime")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded transition flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          {lang === "bn" ? "সার্ভিস পুনরায় চালু করুন" : "Start Runtime Service"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-mono rounded border border-indigo-500/30">Phase 2.3.6A.1.1</span>
            <h1 className="text-xl font-bold tracking-tight text-white">Workspace Runtime Architecture</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "bn" ? "নিওরা ডিজাইন ওএস-এর মূল কার্যকারী রানটাইম এবং সেশন ম্যানেজার।" : "Core operational execution layer and session manager for Neora Design OS."}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleReboot}
            disabled={isBooting || state === "recovering"}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs rounded border border-slate-700 font-medium transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBooting ? "animate-spin" : ""}`} />
            {lang === "bn" ? "রিবুট রানটাইম" : "Reboot Runtime"}
          </button>
          
          <button
            onClick={handleCrashRecovery}
            disabled={state === "recovering"}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-xs text-white rounded font-medium transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {lang === "bn" ? "ক্র্যাশ সিমুলেশন" : "Simulate Crash"}
          </button>
        </div>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: System telemetry */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              {lang === "bn" ? "রিয়েল-টাইম টেলিমეტ্রি" : "Real-time Telemetry"}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">{lang === "bn" ? "সিপিইউ লোড" : "CPU LOAD"}</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{telemetry.cpuUsagePercent}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">{lang === "bn" ? "জিপিইউ লোড" : "GPU LOAD"}</span>
                <span className="text-xl font-bold font-mono text-indigo-400">{telemetry.gpuUsagePercent}%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">{lang === "bn" ? "মেমরি ব্যবহার" : "RAM MEMORY"}</span>
                <span className="text-xl font-bold font-mono text-amber-400">{telemetry.memoryUsageMb} MB</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">{lang === "bn" ? "বুট স্পিড" : "BOOT SPEED"}</span>
                <span className="text-xl font-bold font-mono text-blue-400">{telemetry.startupTimeMs} ms</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{lang === "bn" ? "সক্রিয় লেয়ার কাউন্ট:" : "Active Layers Count:"}</span>
                <span className="font-mono text-white font-semibold">{telemetry.layerCount}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{lang === "bn" ? "সম্পদ ফাইল কাউন্ট:" : "Resources Index Count:"}</span>
                <span className="font-mono text-white font-semibold">{telemetry.assetCount}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{lang === "bn" ? "প্লাগইন বুট সময়:" : "Plugin Loader Clock:"}</span>
                <span className="font-mono text-white font-semibold">{telemetry.pluginLoadTimeMs} ms</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{lang === "bn" ? "উদ্ধার সাফল্যের হার:" : "Recovery Success Rate:"}</span>
                <span className="font-mono text-emerald-400 font-semibold">{telemetry.recoverySuccessRate}%</span>
              </div>
            </div>
          </div>

          {/* Workspace State status */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-400" />
              {lang === "bn" ? "রানটাইম স্ট্যাটাস" : "Runtime Status"}
            </h2>
            
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded border border-slate-800">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                state === "ready" ? "bg-emerald-500" :
                state === "recovering" ? "bg-red-500" : "bg-yellow-500"
              }`} />
              <div>
                <span className="text-xs font-mono font-bold uppercase block text-white">{state}</span>
                <span className="text-[10px] text-slate-400 block">{lang === "bn" ? "নিওরা অপারেটিং কার্নেল স্ট্যাটাস" : "Neora Operating Kernel Status"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Design Controls */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Workspace Settings */}
          <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              {lang === "bn" ? "সক্রিয় ওয়ার্কস্পেস কনফিগারেশন" : "Active Workspace Parameters"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mode selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">{lang === "bn" ? "ওয়ার্কস্পেস টাইপ" : "Workspace Design Mode"}</label>
                <select
                  value={workspace.mode}
                  onChange={(e) => handleModeChange(e.target.value as WorkspaceMode)}
                  className="w-full bg-slate-950 text-xs text-white border border-slate-800 rounded p-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="graphic_design">Graphic Design Board</option>
                  <option value="photo_editing">Advanced Photo Retouching</option>
                  <option value="vector_design">Vector Sketch Canvas</option>
                  <option value="brand_identity">Brand Corporate Identity</option>
                  <option value="packaging">Packaging & Diecut CAD</option>
                  <option value="poster_design">Poster Advertisement</option>
                  <option value="social_media">Social Ad Canvas</option>
                  <option value="book_layout">Book Editorial Layout</option>
                  <option value="print_production">Print Pre-press Production</option>
                  <option value="calligraphy">Traditional Arabic Calligraphy</option>
                </select>
              </div>

              {/* Tool selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">{lang === "bn" ? "সক্রিয় টুল" : "Active Tool Pointer"}</label>
                <div className="grid grid-cols-4 gap-2">
                  {["select", "pen", "brush", "type"].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleToolChange(t)}
                      className={`py-2 text-xs font-semibold rounded border capitalize transition cursor-pointer ${
                        workspace.activeTool === t
                          ? "bg-indigo-600 text-white border-indigo-400"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Viewport tracking parameters */}
            <div className="p-3 bg-slate-950 rounded border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Zoom Level</span>
                <span className="font-mono text-white font-semibold">{(workspace.zoomLevel * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Viewport X</span>
                <span className="font-mono text-white font-semibold">{workspace.viewportX}px</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Viewport Y</span>
                <span className="font-mono text-white font-semibold">{workspace.viewportY}px</span>
              </div>
            </div>

            {/* Recent Swatches & Fonts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-2">{lang === "bn" ? "সাম্প্রতিক রঙ" : "Recent Swatch Palette"}</label>
                <div className="flex gap-2">
                  {workspace.recentColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => wrt.addRecentColor(color)}
                      className="w-6 h-6 rounded-full border border-slate-700 relative hover:scale-110 transition cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-2">{lang === "bn" ? "সাম্প্রতিক ফন্ট" : "Recent Fonts Cache"}</label>
                <div className="flex flex-wrap gap-1.5">
                  {workspace.recentFonts.map((font) => (
                    <span
                      key={font}
                      className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[10px] font-mono rounded border border-slate-800"
                    >
                      {font}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions List */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              {lang === "bn" ? "সক্রিয় সেশন ডাটাবেস" : "Workspace Sessions Cache"}
            </h2>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {sessions.map((sess) => (
                <div key={sess.sessionId} className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-300 block">{sess.sessionId}</span>
                    <span className="text-[10px] text-slate-500 block">Started: {new Date(sess.startedAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[9px] rounded font-semibold border ${
                      sess.type === "current" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                      sess.type === "recovery" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      {sess.type.toUpperCase()}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${sess.isCloudSynced ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"}`} title={sess.isCloudSynced ? "Cloud Synced" : "Local Sync Only"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Boot Steps log section */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
        <h2 className="text-xs font-mono text-slate-300 flex items-center gap-1.5 uppercase">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          {lang === "bn" ? "কার্নেল বুট লগস" : "Kernel Boot Initializer Sequence"}
        </h2>
        
        <div className="bg-slate-950 p-3 rounded border border-slate-800 max-h-[150px] overflow-y-auto font-mono text-xs text-slate-400 space-y-1">
          {bootSteps.map((step, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-slate-600">[{idx + 1}]</span>
              <span className="text-emerald-500 font-semibold">&gt;&gt;</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default WorkspaceRuntimeDashboard;
