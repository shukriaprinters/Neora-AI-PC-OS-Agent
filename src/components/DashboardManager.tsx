import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sliders, Check, RefreshCw, Sparkles, TrendingUp, Cpu, Eye, EyeOff } from "lucide-react";

export interface WidgetInfo {
  id: string;
  name: string;
  nameBn: string;
  clicks: number;
  visible: boolean;
  colSpanClass: string;
}

const DEFAULT_WIDGETS: WidgetInfo[] = [
  { id: "command_center", name: "Workspace Command Center", nameBn: "কমান্ড সেন্টার", clicks: 50, visible: true, colSpanClass: "col-span-1 md:col-span-2 xl:col-span-2" },
  { id: "agent_intelligence", name: "Agent Intelligence Suite", nameBn: "এজেন্ট ইন্টেলিজেন্স সুইট", clicks: 42, visible: true, colSpanClass: "col-span-1 md:col-span-2" },
  { id: "tasks", name: "Tasks Ledger", nameBn: "টাস্ক লেজার", clicks: 35, visible: true, colSpanClass: "col-span-1" },
  { id: "task_chart", name: "Task Performance Chart", nameBn: "টাস্ক পারফরম্যান্স চার্ট", clicks: 32, visible: true, colSpanClass: "col-span-1" },
  { id: "task_efficiency", name: "Task Efficiency (Donut Chart)", nameBn: "টাস্ক ইফিসিয়েন্সি (ডোনাট চার্ট)", clicks: 30, visible: true, colSpanClass: "col-span-1" },
  { id: "memory", name: "Memory Engine", nameBn: "মেমরি ইঞ্জিন", clicks: 20, visible: true, colSpanClass: "col-span-1" },
  { id: "agent", name: "Agent Controller", nameBn: "এজেন্ট কন্ট্রোলার", clicks: 45, visible: true, colSpanClass: "col-span-1" },
  { id: "scratchpad", name: "System Scratchpad", nameBn: "সিস্টেম স্ক্র্যাচপ্যাড", clicks: 15, visible: true, colSpanClass: "col-span-1" },
  { id: "os_quick", name: "OS Quick Command", nameBn: "ওএস কুইক কমান্ড", clicks: 40, visible: true, colSpanClass: "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5" },
  { id: "live_journal", name: "Real-time System Journal", nameBn: "রিয়েল-টাইম জার্নাল", clicks: 25, visible: true, colSpanClass: "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5" },
  { id: "system_log", name: "System Event Log", nameBn: "সিস্টেম ইভেন্ট লগ", clicks: 30, visible: true, colSpanClass: "col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5" }
];

// 1. PredictiveLayout Hook
export function usePredictiveLayout() {
  const [adaptiveMode, setAdaptiveMode] = useState<boolean>(() => {
    return localStorage.getItem("neora_adaptive_dashboard") !== "false";
  });

  const [widgets, setWidgets] = useState<WidgetInfo[]>(() => {
    try {
      const stored = localStorage.getItem("neora_dashboard_widgets");
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_WIDGETS;
  });

  // Save changes
  useEffect(() => {
    localStorage.setItem("neora_dashboard_widgets", JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem("neora_adaptive_dashboard", String(adaptiveMode));
  }, [adaptiveMode]);

  // Track user click to update usage telemetry
  const trackWidgetInteraction = (widgetId: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) =>
        w.id === widgetId ? { ...w, clicks: w.clicks + 1 } : w
      );
      
      if (adaptiveMode) {
        // Re-order by clicks (or let them float) but keep visible widgets prioritized
        return [...updated].sort((a, b) => b.clicks - a.clicks);
      }
      return updated;
    });
  };

  // Trigger manual layout optimization matching interaction frequencies
  const optimizeLayoutAllInterfaces = () => {
    setWidgets((prev) => {
      const sorted = [...prev].sort((a, b) => b.clicks - a.clicks);
      
      // Raise dynamic evolution log
      const ts = new Date().toTimeString().split(' ')[0];
      const event = new CustomEvent("neora-system-event", {
        detail: {
          id: "evt-opt-all-" + Date.now() + "-" + Math.floor(Math.random() * 1000000),
          timestamp: ts,
          category: "self_evolution",
          level: "SUCCESS",
          message: "PredictiveLayout: Optimizing all dashboard interface widgets based on interaction frequency ledger.",
          details: JSON.stringify({
            optimized_order: sorted.map(s => `${s.id} (${s.clicks} interactions)`),
            action: "reorder_layout_matrix",
            animations: "layoutId transitions enabled"
          }, null, 2),
          latency: "8ms"
        }
      });
      window.dispatchEvent(event);

      return sorted;
    });
  };

  return {
    widgets,
    setWidgets,
    adaptiveMode,
    setAdaptiveMode,
    trackWidgetInteraction,
    optimizeLayoutAllInterfaces
  };
}

// 2. DynamicWidgetManager UI Component
interface DynamicWidgetManagerProps {
  lang: "en" | "bn";
  widgets: WidgetInfo[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetInfo[]>>;
  adaptiveMode: boolean;
  setAdaptiveMode: (val: boolean) => void;
  onOptimize: () => void;
}

export const DynamicWidgetManager = React.memo(function DynamicWidgetManager({
  lang,
  widgets,
  setWidgets,
  adaptiveMode,
  setAdaptiveMode,
  onOptimize
}: DynamicWidgetManagerProps) {
  
  const toggleVisibility = (id: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    ));
  };

  return (
    <div className="rounded-xl border border-cyan-500/10 bg-slate-950/60 p-4 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00d4ff]" />
          <div>
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
              {lang === "bn" ? "ডায়নামিক উইজেট ম্যানেজার" : "Dynamic Widget Manager"}
            </h3>
            <p className="text-[10px] text-slate-550 italic mt-0.5">
              {lang === "bn" ? "ব্যবহারের উপর ভিত্তি করে ড্যাশবোর্ড উইজেট স্বয়ংক্রিয়ভাবে সাজানো হয়।" : "Predictive arrangement mapping interaction logs."}
            </p>
          </div>
        </div>

        {/* Adaptive Toggle Switch */}
        <div className="flex items-center gap-2.5 bg-slate-900/40 border border-slate-900 p-1.5 rounded-lg">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
            {lang === "bn" ? "অ্যাডাপ্টিভ মোড" : "Adaptive Mode"}
          </span>
          <button
            onClick={() => setAdaptiveMode(!adaptiveMode)}
            className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${
              adaptiveMode ? "bg-emerald-500" : "bg-slate-750"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                adaptiveMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono font-bold mb-1 px-1">
          <span>{lang === "bn" ? "উইজেটের নাম" : "WIDGET NAME"}</span>
          <span>{lang === "bn" ? "ইন্টারঅ্যাকশন স্কোর" : "INTERACTION SCORE"}</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {widgets.map((w, idx) => (
            <div
              key={w.id}
              className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-between transition-colors ${
                w.visible 
                  ? "bg-slate-900/30 border-slate-850 text-slate-250" 
                  : "bg-slate-950/20 border-slate-950 text-slate-600 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-600 font-bold w-4">#{idx + 1}</span>
                <span className="font-sans font-medium">{lang === "bn" ? w.nameBn : w.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-emerald-400 bg-emerald-950/20 px-1.5 py-0.2 rounded border border-emerald-900/10 font-mono">
                  {w.clicks} pts
                </span>
                
                <button
                  onClick={() => toggleVisibility(w.id)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={w.visible ? "Hide Widget" : "Show Widget"}
                >
                  {w.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-700" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={onOptimize}
            className="w-full py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 hover:text-white transition-all text-[10px] font-bold font-mono uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === "bn" ? "ড্যাশবোর্ড রিঅর্ডার করুন" : "Optimize Widget Layout Now"}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
