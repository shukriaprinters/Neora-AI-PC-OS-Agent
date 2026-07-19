// ENTERPRISE PROJECT & DOCUMENT MANAGEMENT SYSTEM (EPDMS) DASHBOARD (Phase 2.3.6A.1.2)
import React, { useState, useEffect } from "react";
import {
  GitBranch, GitCommit, GitMerge, FileText, Database, Shield, Sliders, Check, Plus,
  Sparkles, RefreshCw, AlertCircle, Share2, Search, Link2, Zap, Play, AlertTriangle
} from "lucide-react";
import { EPDMS, EpdmsProject, EpdmsBranch, EpdmsCommit, EpdmsAssetLink, EpdmsEvent } from "../../lib/ai/cognitive/EPDMS";
import { EnterpriseKernel } from "../../lib/ai/cognitive/EnterpriseKernel";
import { ESARWPE } from "../../lib/ai/cognitive/ESARWPE";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function EPDMSDashboard({ lang, onAddSystemLog }: Props) {
  const epdms = EPDMS.getInstance();
  const kernel = EnterpriseKernel.getInstance();

  const [project, setProject] = useState<EpdmsProject>(epdms.getCurrentProject());
  const [branches, setBranches] = useState<EpdmsBranch[]>(epdms.getBranches());
  const [commits, setCommits] = useState<EpdmsCommit[]>(epdms.getCommitHistory());
  const [assets, setAssets] = useState<EpdmsAssetLink[]>(epdms.getAssetGraph());
  const [backups, setBackups] = useState<string[]>(epdms.getBackupLogs());
  const [autoSave, setAutoSave] = useState(epdms.isAutoSaveActive());
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

  // Interactive Form States
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchPurpose, setNewBranchPurpose] = useState<"experimental" | "client_review" | "draft">("experimental");
  
  const [commitMsg, setCommitMsg] = useState("");
  const [commitDelta, setCommitDelta] = useState("");

  const [mergeSource, setMergeSource] = useState("");

  const [searchWord, setSearchWord] = useState("");

  useEffect(() => {
    updateLocalStates();

    const handleKernelUpdate = () => {
      const status = kernel.getServices().find(s => s.id === "epdms")?.status || "running";
      setServiceStatus(status);
    };

    handleKernelUpdate();

    const unsubscribe = epdms.subscribe((ev) => {
      updateLocalStates();
      if (onAddSystemLog) {
        onAddSystemLog(`[EPDMS] ${ev.message}`);
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
    setProject({ ...epdms.getCurrentProject() });
    setBranches([...epdms.getBranches()]);
    setCommits([...epdms.getCommitHistory()]);
    setAssets([...epdms.getAssetGraph()]);
    setBackups([...epdms.getBackupLogs()]);
    setAutoSave(epdms.isAutoSaveActive());
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    try {
      const bName = epdms.createBranch(newBranchName, newBranchPurpose);
      setNewBranchName("");
      showToast(
        lang === "bn"
          ? `নতুন শাখা '${bName}' সফলভাবে তৈরি হয়েছে!`
          : `New branch '${bName}' created successfully!`,
        "success"
      );
      // Sync with ESARWPE
      ESARWPE.getInstance().createSnapshot("autosave");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSwitchBranch = (bName: string) => {
    try {
      epdms.switchBranch(bName);
      showToast(
        lang === "bn"
          ? `'${bName}' শাখা সক্রিয় করা হয়েছে!`
          : `Switched project context to branch: '${bName}'`,
        "success"
      );
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleMerge = () => {
    if (!mergeSource) return;
    try {
      epdms.mergeBranch(mergeSource);
      showToast(
        lang === "bn"
          ? `শাখা '${mergeSource}' সফলভাবে 'production' এ মার্জ করা হয়েছে!`
          : `Branch '${mergeSource}' merged into 'production' successfully!`,
        "success"
      );
      setMergeSource("");
      // Sync with ESARWPE
      ESARWPE.getInstance().createSnapshot("autosave");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMsg.trim()) return;
    try {
      epdms.createCommit(commitMsg, commitDelta || "Modified vector layers and alignment guidelines.");
      setCommitMsg("");
      setCommitDelta("");
      showToast(
        lang === "bn"
          ? "সংস্করণ চেকপয়েন্ট সফলভাবে রেকর্ড করা হয়েছে!"
          : "Version checkpoint commit recorded successfully!",
        "success"
      );
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleBackup = () => {
    try {
      epdms.triggerManualBackup();
      showToast(
        lang === "bn"
          ? "এনক্রিপ্ট করা ক্লাউড ব্যাকআপ সফলভাবে সম্পূর্ণ হয়েছে!"
          : "Encrypted cloud backup successfully completed!",
        "success"
      );
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleToggleAutoSave = () => {
    epdms.toggleAutoSave();
  };

  const handleAssetCascade = (targetId: string) => {
    epdms.triggerGlobalAssetUpdate(targetId, "Forced re-evaluation of vector contrast constraints");
  };

  // Filter commit list based on search
  const filteredCommits = commits.filter(c =>
    c.message.toLowerCase().includes(searchWord.toLowerCase()) ||
    c.id.toLowerCase().includes(searchWord.toLowerCase()) ||
    c.branchName.toLowerCase().includes(searchWord.toLowerCase())
  );

  if (serviceStatus === "stopped") {
    return (
      <div className="p-8 bg-slate-950 text-slate-100 rounded-xl border border-red-900/30 space-y-6 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 animate-pulse">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === "bn" ? "প্রকল্প সংরক্ষণ এবং শাখা নিয়ন্ত্রণ সার্ভিস অফলাইন" : "Project Management & Version Control Service Offline"}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "bn" 
              ? "নিওরা EPDMS ডোমেন সার্ভিসটি সেন্ট্রাল অপারেটিং কার্নেলে বন্ধ করা হয়েছে। গিট-স্টাইল শাখা নিয়ন্ত্রণ, সংস্করণ কমিট এবং ক্লাউড ব্যাকআপ সাময়িকভাবে স্থগিত আছে।" 
              : "The Neora EPDMS domain service has been stopped in the central Enterprise Kernel. Git-style branching, version commits, and cloud backups are temporarily suspended."}
          </p>
        </div>
        <button
          onClick={() => kernel.startService("epdms")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded transition flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          {lang === "bn" ? "সার্ভিস পুনরায় চালু করুন" : "Start Project Service"}
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
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded border border-emerald-500/30">Phase 2.3.6A.1.2</span>
            <h1 className="text-xl font-bold tracking-tight text-white">Project & Document Management System (EPDMS)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "bn" ? "নিওরা ডিজাইন ফাইলের মেটাডাটা রিলেশনস, সংস্করণ শাখা নিয়ন্ত্রণ এবং সিকিউর ব্যাকআপ।" : "Git-style revision control, hierarchical asset graphing, and secure packaging."}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleToggleAutoSave}
            className={`px-3 py-1.5 text-xs rounded font-semibold border transition cursor-pointer ${
              autoSave ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30" : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {autoSave ? (lang === "bn" ? "অটো-সেভ: সক্রিয়" : "Auto-Save: Active") : (lang === "bn" ? "অটো-সেভ: নিষ্ক্রিয়" : "Auto-Save: Off")}
          </button>
          
          <button
            onClick={handleBackup}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-1.5 px-3 rounded text-white transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            {lang === "bn" ? "ব্যাকআপ তৈরি" : "Force Encrypted Backup"}
          </button>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: active project info & branch list */}
        <div className="space-y-6 lg:col-span-1">
          {/* Active project card */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              {lang === "bn" ? "সক্রিয় প্রকল্প" : "Active Project Summary"}
            </h2>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">{lang === "bn" ? "প্রকল্পের নাম" : "PROJECT NAME"}</span>
                <span className="font-bold text-white text-sm">{project.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">{lang === "bn" ? "বিবরণ" : "DESCRIPTION"}</span>
                <p className="text-slate-400 mt-0.5">{project.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">FILE FORMAT</span>
                  <span className="font-bold text-indigo-400 font-mono">.neora package</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">COMPRESSED SIZE</span>
                  <span className="font-bold text-white font-mono">{(project.sizeKb / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Branch creator & selector */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              {lang === "bn" ? "শাখা নিয়ন্ত্রণ" : "Revision Branching Manager"}
            </h2>

            {/* active list */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === "bn" ? "বিদ্যমান শাখাসমূহ" : "Available Git Branches"}</span>
              <div className="space-y-1 max-h-[140px] overflow-y-auto">
                {branches.map(b => (
                  <button
                    key={b.name}
                    onClick={() => handleSwitchBranch(b.name)}
                    className={`w-full p-2 text-left rounded flex justify-between items-center text-xs transition border cursor-pointer ${
                      project.activeBranch === b.name
                        ? "bg-indigo-600/15 border-indigo-500/30 text-white font-semibold"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="font-mono flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" />
                      {b.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-300 font-mono rounded uppercase">
                      {b.purpose}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Branch creator form */}
            <form onSubmit={handleCreateBranch} className="space-y-2 pt-2 border-t border-slate-800/50">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === "bn" ? "নতুন শাখা তৈরি" : "Create New Branch"}</span>
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="e.g. review-marketing"
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex gap-2">
                <select
                  value={newBranchPurpose}
                  onChange={(e) => setNewBranchPurpose(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded text-xs text-white p-1.5 focus:outline-none focus:border-indigo-500 flex-1"
                >
                  <option value="experimental">Experimental</option>
                  <option value="client_review">Client Review</option>
                  <option value="draft">Draft Setup</option>
                </select>
                <button
                  type="submit"
                  className="px-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded text-xs text-white transition flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Center column: Document relationships graph and Commit history */}
        <div className="space-y-6 lg:col-span-2">
          {/* Smart Asset Relation Graph */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-emerald-400" />
              {lang === "bn" ? "রিলেশনাল অ্যাসেট গ্রাফ" : "Hierational Asset Relationship Graph"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">{lang === "bn" ? "অ্যাসেট লিংক ম্যাপ" : "ACTIVE COMPONENT LOGS"}</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {assets.map(a => (
                    <div key={a.id} className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-mono font-semibold text-slate-300 block">{a.targetId}</span>
                        <span className="text-[9px] text-slate-500 block">Link ID: {a.id} | Mode: {a.type.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAssetCascade(a.targetId)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition cursor-pointer"
                          title="Cascade Update"
                        >
                          <Zap className="w-3 h-3" />
                        </button>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Branch Merge panel */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">{lang === "bn" ? "শাখা মার্জ করুন" : "MARGE BRANCH CRITERIA"}</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === "bn" ? "পরীক্ষামূলক শাখার পরিবর্তনের ভেক্টর ডেল্টাগুলি মূল প্রোডাকশনে মার্জ করুন।" : "Integrate non-destructive delta design layers from an experimental branch into production safely."}
                  </p>
                </div>

                <div className="space-y-2">
                  <select
                    value={mergeSource}
                    onChange={(e) => setMergeSource(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Branch to Merge --</option>
                    {branches.filter(b => b.name !== "production" && !b.isMerged).map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleMerge}
                    disabled={!mergeSource}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white rounded flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    Merge Delta into Production
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Commit Checklist & History */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                {lang === "bn" ? "সংস্করণ ইতিহাস (Git-style logs)" : "Version Timeline Logs (Git-style)"}
              </h2>
              
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  placeholder="Search commits..."
                  className="bg-slate-950 border border-slate-800 text-xs text-white pl-7 pr-3 py-1.5 rounded focus:outline-none focus:border-indigo-500 font-mono w-48"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Commit history list */}
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {filteredCommits.map(c => (
                  <div key={c.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs space-y-1 font-mono">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-indigo-400 font-bold">{c.id}</span>
                      <span className="text-slate-500">{new Date(c.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <span className="text-white font-semibold block leading-tight">{c.message}</span>
                    <p className="text-[10px] text-slate-400 italic">Author: {c.author}</p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800/50 block w-fit">
                      Snap: {c.snapshotId}
                    </span>
                  </div>
                ))}
              </div>

              {/* Create commit form */}
              <form onSubmit={handleCommit} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{lang === "bn" ? "নতুন সেভ চেকপয়েন্ট" : "Create Checkpoint Commit"}</span>
                <input
                  type="text"
                  required
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  placeholder="e.g. Modified vectors to improve contrast ratio"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <input
                  type="text"
                  value={commitDelta}
                  onChange={(e) => setCommitDelta(e.target.value)}
                  placeholder="Change delta (e.g. Added smart guide, tweaked opacity)"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  Commit Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Logs */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
        <h2 className="text-xs font-mono text-slate-300 flex items-center gap-1.5 uppercase">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          {lang === "bn" ? "অটোমেটেড ব্যাকআপ হিস্ট্রি" : "Encrypted Backup Registry History (asia-east1)"}
        </h2>

        <div className="bg-slate-950 p-3 rounded border border-slate-800 max-h-[100px] overflow-y-auto font-mono text-xs text-slate-400 space-y-1">
          {backups.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-slate-600">[{idx + 1}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default EPDMSDashboard;
