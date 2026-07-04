import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { History, X, Play, Clock, CheckCircle, Trash2, Zap, Plus, Layers, ArrowRight } from "lucide-react";

interface CommandHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "bn";
  onReRunCommand: (command: string) => void;
}

interface HistoryItem {
  id: string;
  command: string;
  timestamp: string;
  date: string;
  success: boolean;
}

interface CommandMacro {
  id: string;
  name: string;
  commands: string[];
}

const PRESET_MACROS: CommandMacro[] = [
  { 
    id: "preset-diag", 
    name: "System Diagnostics & Optimize", 
    commands: ["diagnose system", "optimize layout"] 
  },
  { 
    id: "preset-routine", 
    name: "Daily Work Setup", 
    commands: ["open planner", "add task Morning Standup urgent"] 
  }
];

export function CommandHistoryDrawer({ isOpen, onClose, lang, onReRunCommand }: CommandHistoryDrawerProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "macros">("history");
  const [macros, setMacros] = useState<CommandMacro[]>([]);
  
  // Create Macro Form States
  const [newMacroName, setNewMacroName] = useState("");
  const [newMacroCommands, setNewMacroCommands] = useState("");
  const [formError, setFormError] = useState("");

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem("neora_command_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  };

  const loadMacros = () => {
    try {
      const stored = localStorage.getItem("neora_command_macros");
      if (stored) {
        setMacros(JSON.parse(stored));
      } else {
        localStorage.setItem("neora_command_macros", JSON.stringify(PRESET_MACROS));
        setMacros(PRESET_MACROS);
      }
    } catch {
      setMacros(PRESET_MACROS);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      loadMacros();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      loadHistory();
    };
    window.addEventListener("neora-command-history-update", handleUpdate);
    return () => {
      window.removeEventListener("neora-command-history-update", handleUpdate);
    };
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("neora_command_history");
    setHistory([]);
  };

  const handleAddMacro = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newMacroName.trim()) {
      setFormError(lang === "bn" ? "ম্যাক্রোর নাম লিখুন" : "Please specify a macro name");
      return;
    }

    if (!newMacroCommands.trim()) {
      setFormError(lang === "bn" ? "অন্তত একটি কমান্ড লিখুন" : "Please specify at least one command");
      return;
    }

    // Split commands by semicolon or comma and clean whitespace
    const parsedCommands = newMacroCommands
      .split(/;|\n/)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    if (parsedCommands.length === 0) {
      setFormError(lang === "bn" ? "কমান্ডগুলো সঠিক বিন্যাসে লিখুন" : "Invalid command format");
      return;
    }

    const newMacro: CommandMacro = {
      id: "macro-" + Date.now(),
      name: newMacroName.trim(),
      commands: parsedCommands
    };

    const updatedMacros = [...macros, newMacro];
    setMacros(updatedMacros);
    localStorage.setItem("neora_command_macros", JSON.stringify(updatedMacros));

    // Clear Form
    setNewMacroName("");
    setNewMacroCommands("");

    // Notification
    const evt = new CustomEvent("neora-notification", {
      detail: {
        title: lang === "bn" ? "ম্যাক্রো তৈরি হয়েছে" : "Macro Registered",
        message: lang === "bn" ? `"${newMacro.name}" সফলভাবে যুক্ত হয়েছে।` : `"${newMacro.name}" automation added successfully.`,
        type: "success"
      }
    });
    window.dispatchEvent(evt);
  };

  const handleDeleteMacro = (id: string, name: string) => {
    const updated = macros.filter(m => m.id !== id);
    setMacros(updated);
    localStorage.setItem("neora_command_macros", JSON.stringify(updated));

    const evt = new CustomEvent("neora-notification", {
      detail: {
        title: lang === "bn" ? "ম্যাক্রো ডিলিট হয়েছে" : "Macro Removed",
        message: lang === "bn" ? `"${name}" ডিলিট করা হয়েছে।` : `"${name}" has been deleted from registry.`,
        type: "info"
      }
    });
    window.dispatchEvent(evt);
  };

  const handleRunMacro = (macro: CommandMacro) => {
    macro.commands.forEach((cmd, idx) => {
      setTimeout(() => {
        onReRunCommand(cmd);

        // Dispatches sequential step updates to Neora notification bus
        const evt = new CustomEvent("neora-notification", {
          detail: {
            title: `Macro Flow: ${macro.name}`,
            message: lang === "bn"
              ? `ধাপ [${idx + 1}/${macro.commands.length}] সম্পাদন হচ্ছেঃ "${cmd}"`
              : `Executing step [${idx + 1}/${macro.commands.length}]: "${cmd}"`,
            type: "info"
          }
        });
        window.dispatchEvent(evt);
      }, idx * 1000);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 z-50 backdrop-blur-sm"
          />

          {/* Drawer body */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 sm:w-96 bg-slate-900/95 border-l border-cyan-500/15 p-5 z-50 shadow-2xl flex flex-col justify-between select-none"
            style={{
              boxShadow: "-10px 0 30px rgba(0, 212, 255, 0.05)"
            }}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                    {lang === "bn" ? "কমান্ড সেন্টার" : "COGNITIVE TERMINAL"}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer View Tab Toggles */}
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 mb-4">
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "history" 
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" 
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{lang === "bn" ? "কমান্ড হিস্ট্রি" : "History"}</span>
                </button>
                <button
                  onClick={() => setActiveTab("macros")}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "macros" 
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" 
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{lang === "bn" ? "ম্যাক্রো রেজিস্ট্রি" : "Macro Registry"}</span>
                </button>
              </div>

              {activeTab === "history" ? (
                /* HISTORY VIEW PANEL */
                <>
                  {/* Sub-header actions */}
                  <div className="flex justify-between items-center mb-3 text-[11px] font-mono">
                    <span className="text-slate-400 font-bold">
                      {history.length} {lang === "bn" ? "টি পূর্ববর্তী কমান্ড" : "operations logged"}
                    </span>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{lang === "bn" ? "মুছে ফেলুন" : "Clear History"}</span>
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                    {history.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 font-mono text-xs">
                        <History className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                        <p>{lang === "bn" ? "কোনো হিস্ট্রি পাওয়া যায়নি" : "No commands executed yet"}</p>
                        <p className="text-[10px] text-slate-600 mt-1">
                          {lang === "bn" ? "কমান্ড সেন্টার থেকে কমান্ড দিন" : "Submit natural commands on the main dashboard"}
                        </p>
                      </div>
                    ) : (
                      history.map((item) => (
                        <div
                          key={item.id}
                          className="group bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 hover:border-cyan-500/30 transition-all flex flex-col justify-between gap-2.5 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-cyan-500/50" />

                          <div className="flex items-start justify-between gap-1.5 min-w-0 pl-1.5">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-mono text-slate-200 break-words font-semibold">
                                {item.command}
                              </p>
                            </div>
                            <button
                              onClick={() => onReRunCommand(item.command)}
                              className="shrink-0 p-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                              title="Re-run Command"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pl-1.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{item.timestamp}</span>
                            </span>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle className="w-3 h-3" />
                              <span>EXECUTED</span>
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* MACRO REGISTRY AUTOMATION PANEL */
                <div className="flex flex-col gap-4 max-h-[68vh] overflow-y-auto pr-1 scrollbar-thin">
                  {/* Create Macro Form */}
                  <form onSubmit={handleAddMacro} className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 space-y-2.5">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase tracking-wider">
                      {lang === "bn" ? "নতুন ম্যাক্রো তৈরি" : "Register Custom Workflow"}
                    </span>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">
                        {lang === "bn" ? "ম্যাক্রো নাম" : "Macro Name"}
                      </label>
                      <input
                        type="text"
                        value={newMacroName}
                        onChange={(e) => setNewMacroName(e.target.value)}
                        placeholder={lang === "bn" ? "যেমন: সকালের রুটিন" : "e.g., Diagnostics & Clean"}
                        className="w-full text-xs font-mono bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-slate-400 uppercase">
                        {lang === "bn" ? "কমান্ড তালিকা (সেমিকোলন ; দিয়ে আলাদা করুন)" : "Commands List (semicolon ';' separated)"}
                      </label>
                      <textarea
                        value={newMacroCommands}
                        onChange={(e) => setNewMacroCommands(e.target.value)}
                        placeholder={lang === "bn" ? "diagnose system; optimize layout" : "diagnose system; optimize layout"}
                        rows={2}
                        className="w-full text-xs font-mono bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>

                    {formError && (
                      <p className="text-[9px] font-mono text-rose-400 font-bold">{formError}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded text-[10px] font-mono font-bold transition-all uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{lang === "bn" ? "ম্যাক্রো সেভ করুন" : "Add Macro Workflow"}</span>
                    </button>
                  </form>

                  {/* Registered Macro List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider px-1">
                      {lang === "bn" ? "সংরক্ষিত ম্যাক্রো তালিকা" : "Registered Automation Flows"}
                    </span>

                    {macros.length === 0 ? (
                      <p className="text-center py-4 text-slate-600 font-mono text-[10px]">
                        No macros defined. Use the form above to add one.
                      </p>
                    ) : (
                      macros.map((macro) => (
                        <div
                          key={macro.id}
                          className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 hover:border-cyan-500/20 transition-all flex flex-col justify-between gap-2 relative overflow-hidden"
                        >
                          {/* Accent dot */}
                          <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />

                          <div className="flex items-start justify-between gap-1.5 pl-3">
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold font-mono text-slate-200 block truncate">
                                {macro.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleRunMacro(macro)}
                                className="p-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded transition-all cursor-pointer"
                                title="Execute Macro Sequential Flow"
                              >
                                <Play className="w-3 h-3 fill-current" />
                              </button>
                              <button
                                onClick={() => handleDeleteMacro(macro.id, macro.name)}
                                className="p-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 rounded transition-all cursor-pointer"
                                title="Delete Macro"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Commands steps bullet flow chart list */}
                          <div className="bg-slate-900/40 p-2 rounded-lg space-y-1 pl-3">
                            {macro.commands.map((cmd, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                                <ArrowRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                                <span className="bg-slate-900/80 px-1 py-0.5 rounded text-[8px] text-cyan-300 font-bold shrink-0">
                                  Step {idx + 1}
                                </span>
                                <span className="truncate">{cmd}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800/80 pt-3 mt-4 text-[10px] font-mono text-slate-600 text-center flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{lang === "bn" ? "Neora কগনিティブ কমান্ড প্যানেল" : "NEORA COGNITIVE AUTOMATION REGISTRY"}</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
