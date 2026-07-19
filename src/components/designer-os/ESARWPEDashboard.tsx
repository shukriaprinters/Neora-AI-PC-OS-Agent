// SESSION, AUTOSAVE, RECOVERY & PERSISTENCE (ESARWPE) DASHBOARD (Phase 2.3.6A.1.4)
import React, { useState, useEffect } from "react";
import {
  Shield, AlertTriangle, CheckCircle2, Sliders, RefreshCw, Trash2, Clock, Zap, Database,
  HardDrive, Cloud, CloudOff, FileCode, Plus, AlertCircle, Sparkles, Play
} from "lucide-react";
import { ESARWPE, EsarwpeSession, EsarwpeSnapshot, EsarwpeHealthReport, EsarwpeCacheReport, EsarwpeSaveInterval } from "../../lib/ai/cognitive/ESARWPE";
import { EnterpriseKernel } from "../../lib/ai/cognitive/EnterpriseKernel";
import { EPDMS } from "../../lib/ai/cognitive/EPDMS";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function ESARWPEDashboard({ lang, onAddSystemLog }: Props) {
  const esarwpe = ESARWPE.getInstance();
  const kernel = EnterpriseKernel.getInstance();

  const [session, setSession] = useState<EsarwpeSession>(esarwpe.getActiveSession());
  const [saveInterval, setSaveInterval] = useState<EsarwpeSaveInterval>(esarwpe.getSaveInterval());
  const [autoSaving, setAutoSaving] = useState(esarwpe.getIsAutoSaving());
  const [offlineMode, setOfflineMode] = useState(esarwpe.getIsOfflineMode());
  const [snapshots, setSnapshots] = useState<EsarwpeSnapshot[]>(esarwpe.getSnapshots());
  const [cache, setCache] = useState<EsarwpeCacheReport>(esarwpe.getCacheReport());
  const [health, setHealth] = useState<EsarwpeHealthReport>(esarwpe.getHealthReport());
  const [events, setEvents] = useState<any[]>(esarwpe.getEventHistory());
  const [serviceStatus, setServiceStatus] = useState<string>("running");

  // Custom styled inline toasts
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: "success" | "error" | "info" }[]>([]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Simulation flags
  const [isAuditing, setIsAuditing] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    updateLocalStates();

    const handleKernelUpdate = () => {
      const status = kernel.getServices().find(s => s.id === "esarwpe")?.status || "running";
      setServiceStatus(status);
    };

    handleKernelUpdate();

    const unsubscribe = esarwpe.subscribe((ev) => {
      updateLocalStates();
      if (onAddSystemLog) {
        onAddSystemLog(`[ESARWPE] ${ev.message}`);
      }
    });

    const unsubscribeKernel = kernel.subscribe((ev) => {
      if (ev.topic === "ServiceStatusChanged") {
        handleKernelUpdate();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeKernel();
    };
  }, []);

  const updateLocalStates = () => {
    setSession({ ...esarwpe.getActiveSession() });
    setSaveInterval(esarwpe.getSaveInterval());
    setAutoSaving(esarwpe.getIsAutoSaving());
    setOfflineMode(esarwpe.getIsOfflineMode());
    setSnapshots([...esarwpe.getSnapshots()]);
    setCache({ ...esarwpe.getCacheReport() });
    setHealth({ ...esarwpe.getHealthReport() });
    setEvents(esarwpe.getEventHistory().slice(0, 15));
  };

  const handleIntervalChange = (val: EsarwpeSaveInterval) => {
    esarwpe.setSaveInterval(val);
  };

  const handleToggleAutoSaving = () => {
    esarwpe.toggleAutoSave();
  };

  const handleToggleOfflineMode = () => {
    esarwpe.setOfflineMode(!offlineMode);
  };

  const handleCreateSnapshot = () => {
    esarwpe.createSnapshot("manual_checkpoint");
  };

  const handleRestoreSnapshot = (id: string) => {
    try {
      esarwpe.restoreSnapshot(id);
      showToast(
        lang === "bn"
          ? `স্ন্যাপশট '${id}' সফলভাবে পুনরুদ্ধার করা হয়েছে!`
          : `Snapshot '${id}' successfully restored!`,
        "success"
      );
      // Log restoration inside EPDMS
      EPDMS.getInstance().createCommit("Snapshot Restoration", `Restored design canvas layers state to snapshot pointer: ${id}`);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleClearCache = (type: "layer" | "gpu" | "thumbnail" | "ai" | "undo" | "all") => {
    try {
      esarwpe.clearCache(type);
      showToast(
        lang === "bn"
          ? `${type.toUpperCase()} র্যাম/ভি-র্যাম ক্যাশ সফলভাবে পরিষ্কার করা হয়েছে!`
          : `${type.toUpperCase()} RAM/VRAM cache successfully cleared!`,
        "success"
      );
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      esarwpe.triggerCorruptionSimulation();
      setIsAuditing(false);
      showToast(
        lang === "bn"
          ? "সিস্টেম ইন্টেগ্রিটি অডিট সম্পন্ন! ক্যানভাসে ৩টি ত্রুটি সনাক্ত করা হয়েছে।"
          : "System integrity audit completed! 3 minor defects detected in canvas.",
        "info"
      );
    }, 1000);
  };

  const handleRepair = () => {
    setIsRepairing(true);
    setTimeout(() => {
      esarwpe.triggerAutoRepair();
      setIsRepairing(false);
      showToast(
        lang === "bn"
          ? "এআই অটো-হিলিং সম্পূর্ণ হয়েছে! সব ত্রুটিপূর্ণ লেয়ার এবং লিঙ্ক ঠিক করা হয়েছে।"
          : "AI Auto-healing completed! All corrupted layers and broken asset links restored.",
        "success"
      );
      // Auto-commit recovery in EPDMS
      EPDMS.getInstance().createCommit("AI Neural Auto-Repair", "Automatically resolved corrupted vector curves and re-bound web font assets.");
    }, 1200);
  };

  if (serviceStatus === "stopped") {
    return (
      <div className="p-8 bg-slate-950 text-slate-100 rounded-xl border border-red-900/30 space-y-6 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 animate-pulse">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === "bn" ? "সেশন রিকভারি এবং অটো-সেভ সার্ভিস অফলাইন" : "Session Recovery & Autosave Service Offline"}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "bn" 
              ? "নিওরা ESARWPE সেশন রিকভারি সার্ভিসটি সেন্ট্রাল অপারেটিং কার্নেলে বন্ধ করা হয়েছে। ক্রমাগত স্ন্যাপশট ব্যাকআপ, ডাটাবেস হিলিং এবং অটো-রিকভারি গার্ড সাময়িকভাবে বন্ধ আছে।" 
              : "The Neora ESARWPE recovery service has been stopped in the central Enterprise Kernel. Continuous snapshotting, auto-healing audits, and recovery guards are temporarily inactive."}
          </p>
        </div>
        <button
          onClick={() => kernel.startService("esarwpe")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded transition flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          {lang === "bn" ? "সার্ভিস পুনরায় চালু করুন" : "Start Recovery Service"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-6 relative">
      {/* Floating dynamic inline toasts */}
      {toasts.length > 0 && (
        <div className="absolute top-4 right-4 z-50 space-y-2 max-w-xs pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`p-3 rounded-lg border shadow-lg text-xs font-medium pointer-events-auto transition-all duration-300 flex items-center gap-2 ${
                t.type === "success" ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400" :
                t.type === "error" ? "bg-red-950/90 border-red-500/30 text-red-400" :
                "bg-slate-900/90 border-slate-800 text-slate-200"
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{t.msg}</span>
            </div>
          ))}
        </div>
      )}
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-mono rounded border border-indigo-500/30">Phase 2.3.6A.1.4</span>
            <h1 className="text-xl font-bold tracking-tight text-white">Session, Autosave & Persistence Engine (ESARWPE)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "bn" ? "অটোহিলিং ব্যাকআপ, মেমোরি আবর্জনা পরিষ্কার এবং ডেটা ক্র্যাশ রিকভারি কোর।" : "Continuous backup snapshots, RAM/VRAM cache managers, and AI workspace healing."}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleToggleOfflineMode}
            className={`px-3 py-1.5 text-xs rounded font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
              offlineMode
                ? "bg-amber-600/20 text-amber-400 border-amber-600/30"
                : "bg-emerald-600/20 text-emerald-400 border-emerald-600/30"
            }`}
          >
            {offlineMode ? <CloudOff className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
            {offlineMode ? (lang === "bn" ? "অফলাইন মোড" : "Offline-First Mode") : (lang === "bn" ? "ক্লাউড সিঙ্কড মোড" : "Cloud Synced Mode")}
          </button>
          
          <button
            onClick={handleCreateSnapshot}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-1.5 px-3 rounded text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {lang === "bn" ? "ম্যানুয়াল স্ন্যাপশট" : "Take Snapshot Checkpoint"}
          </button>
        </div>
      </div>

      {/* Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: active session & timing limits */}
        <div className="space-y-6 lg:col-span-1">
          {/* Active session parameters */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-400" />
              {lang === "bn" ? "চলতি সেশন ডেটা" : "Active Session Metadata"}
            </h2>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">SESSION ID:</span>
                <span className="font-bold text-white">{session.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SESSION TYPE:</span>
                <span className="font-bold text-indigo-400 uppercase">{session.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ACTIVE PROJECT:</span>
                <span className="font-bold text-white text-right truncate w-32">{session.activeProjectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SURVIVED CRASH:</span>
                <span className={`font-bold ${session.survivedCrash ? "text-red-400" : "text-emerald-400"}`}>
                  {session.survivedCrash ? "YES (Auto-healed)" : "NO"}
                </span>
              </div>
            </div>
          </div>

          {/* Autosave timing configuration */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              {lang === "bn" ? "অটো-সেভ রুলস" : "Autosave Frequency Rules"}
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Save Interval Trigger</span>
                <span className="font-bold text-cyan-400 font-mono uppercase">{saveInterval}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(["stroke", "edit", "5s", "10s", "30s", "1m"] as EsarwpeSaveInterval[]).map(val => (
                  <button
                    key={val}
                    onClick={() => handleIntervalChange(val)}
                    className={`py-1 text-[10px] font-mono rounded border transition cursor-pointer capitalize ${
                      saveInterval === val ? "bg-cyan-600/20 text-cyan-400 border-cyan-500/30 font-bold" : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
              <span className="text-xs text-slate-400">Autosave Active Status</span>
              <button
                onClick={handleToggleAutoSaving}
                className={`py-1 px-3 text-xs font-semibold rounded border transition cursor-pointer ${
                  autoSaving ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" : "bg-slate-950 text-slate-500 border-slate-800"
                }`}
              >
                {autoSaving ? "ACTIVE" : "PAUSED"}
              </button>
            </div>
          </div>
        </div>

        {/* Center / Right Column: Health Diagnostics & Cache */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI Workspace Health Monitor */}
          <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                {lang === "bn" ? "নিউরাল ওয়ার্কস্পেস হেলথ অডিট" : "Neural Workspace Integrity & Auto-Repair"}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={handleAudit}
                  disabled={isAuditing || isRepairing}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold rounded border border-slate-700 transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isAuditing ? "animate-spin" : ""}`} />
                  Scan workspace
                </button>
                <button
                  onClick={handleRepair}
                  disabled={isRepairing || health.overallHealthScore === 100}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Auto-Repair
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overall Score */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 flex flex-col justify-between items-center text-center">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">INTEGRITY SCORE</span>
                <span className={`text-4xl font-black font-mono my-2 ${
                  health.overallHealthScore === 100 ? "text-emerald-400" : "text-amber-400 animate-pulse"
                }`}>
                  {health.overallHealthScore}/100
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Status: {health.status}</span>
              </div>

              {/* Discovered defects */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 md:col-span-2">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">INTEGRITY DIAGNOSTIC REPORT</span>
                {health.overallHealthScore === 100 ? (
                  <div className="flex items-center gap-2 text-emerald-400 py-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-semibold">No layer corruption or missing resources detected. Workspace healthy.</span>
                  </div>
                ) : (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Corrupted Layers:</span>
                      <span className="font-mono text-red-400 font-bold">{health.diagnostics.corruptedLayers}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Broken Asset URLs:</span>
                      <span className="font-mono text-amber-400 font-bold">{health.diagnostics.brokenAssetLinks}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Missing Google Fonts:</span>
                      <span className="font-mono text-amber-400 font-bold">{health.diagnostics.missingFontsCount}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Repair proposals list */}
            {health.repairProposals.length > 0 && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded space-y-1 text-xs">
                <span className="font-bold text-red-400 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  AI Repair Proposals ({health.repairProposals.length})
                </span>
                {health.repairProposals.map((prop, idx) => (
                  <div key={idx} className="text-slate-300 flex gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{prop}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VRAM / RAM Cache manager & Checkpoint snap logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cache buffer manager */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                {lang === "bn" ? "ক্যাশ মেমোরি ম্যানেজার" : "Multi-tier Cache Allocation"}
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Total Allocated Cache:</span>
                  <span className="font-mono text-white font-bold">{cache.totalAllocatedMb} MB / {cache.maxLimitMb} MB</span>
                </div>
                {/* Simulated bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex">
                  <div className="bg-cyan-500" style={{ width: `${(cache.layerCacheMb / cache.maxLimitMb) * 100}%` }} title="Layer Cache" />
                  <div className="bg-indigo-500" style={{ width: `${(cache.gpuCacheMb / cache.maxLimitMb) * 100}%` }} title="GPU Texture Cache" />
                  <div className="bg-amber-500" style={{ width: `${(cache.aiCacheMb / cache.maxLimitMb) * 100}%` }} title="AI Prompt Cache" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleClearCache("gpu")}
                    className="p-1 bg-slate-950 hover:bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-800 transition cursor-pointer"
                  >
                    Clear GPU Cache
                  </button>
                  <button
                    onClick={() => handleClearCache("all")}
                    className="p-1 bg-slate-950 hover:bg-slate-800 text-[10px] text-red-400 rounded border border-slate-800 transition cursor-pointer"
                  >
                    Flush All Cache
                  </button>
                </div>
              </div>
            </div>

            {/* Checkpoint Snap logs list */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                {lang === "bn" ? "সেভ করা ব্যাকআপ স্ন্যাপশট" : "Saved Snapshots Logs"}
              </h2>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {snapshots.map(s => (
                  <div key={s.id} className="p-2 bg-slate-950 border border-slate-800 rounded flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="font-bold text-slate-300 block">{s.id}</span>
                      <span className="text-[9px] text-slate-500 block">{new Date(s.timestamp).toLocaleTimeString()} | Size: {s.sizeKb}KB</span>
                    </div>
                    <button
                      onClick={() => handleRestoreSnapshot(s.id)}
                      className="px-2 py-0.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-[10px] text-indigo-300 rounded font-semibold cursor-pointer"
                    >
                      Restore
                    </button>
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
export default ESARWPEDashboard;
