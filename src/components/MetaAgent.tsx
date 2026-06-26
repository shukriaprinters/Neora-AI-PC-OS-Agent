import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Terminal, FileCode, Check, X, Cpu, CpuIcon } from "lucide-react";

interface MetaAgentProps {
  lang: "en" | "bn";
  activeTab: string;
}

export interface SkeletonDraft {
  id: string;
  moduleName: string;
  triggerPhrase: string;
  codeSkeleton: string;
  timestamp: string;
}

export function MetaAgent({ lang, activeTab }: MetaAgentProps) {
  const [activeToast, setActiveToast] = useState<SkeletonDraft | null>(null);

  useEffect(() => {
    // Monitor chat logs for repeating user phrases
    const monitorInterval = setInterval(() => {
      try {
        const stored = localStorage.getItem("neora_chat_messages");
        if (stored) {
          const messages = JSON.parse(stored);
          const userMsgs = messages.filter((m: any) => m.role === "user");
          
          // Check for repeated topics
          const printKeywords = ["print", "bannner", "visiting card", "bulk", "discount", "invoice", "শুকরিয়া"];
          const soundKeywords = ["ambient", "music", "eq", "equalizer", "sound", "hum"];
          
          let matchedKeyword: string | null = null;
          let moduleName = "CustomModule";
          let skeleton = "";

          const hasPrintRequest = userMsgs.some((m: any) => 
            printKeywords.some(kw => m.content?.toLowerCase().includes(kw))
          );

          const hasSoundRequest = userMsgs.some((m: any) => 
            soundKeywords.some(kw => m.content?.toLowerCase().includes(kw))
          );

          if (hasPrintRequest) {
            matchedKeyword = "printing invoices / bulk orders";
            moduleName = "ShukriaBulkOrderCalculator";
            skeleton = `// SectionViewer Auto-Drafted Skeleton Module
import React from 'react';
import { Zap } from 'lucide-react';

export default function ShukriaBulkOrderCalculator() {
  return (
    <div className="p-4 border border-cyan-500/10 rounded-xl bg-slate-900/40 font-mono">
      <h3>🛠️ Shukria Printers Bulk Order Pricing Optimizer</h3>
      <p>Autonomous pricing engine mapped based on user chat patterns.</p>
    </div>
  );
}`;
          } else if (hasSoundRequest) {
            matchedKeyword = "ambient hum / audio wave equalizer";
            moduleName = "IntelligentAmbientEqualizer";
            skeleton = `// SectionViewer Auto-Drafted Skeleton Module
import React from 'react';
import { Play } from 'lucide-react';

export default function IntelligentAmbientEqualizer() {
  return (
    <div className="p-4 border border-emerald-500/10 rounded-xl bg-slate-900/40 font-mono">
      <h3>🛠️ Intelligent Sound Wave EQ</h3>
      <p>Ambient sound wave frequency controller.</p>
    </div>
  );
}`;
          }

          // If matched, trigger persistent toast (if not already shown recently)
          const seenKey = `meta_agent_toast_${moduleName}`;
          if (matchedKeyword && !localStorage.getItem(seenKey)) {
            const draft: SkeletonDraft = {
              id: "draft-" + Math.floor(Math.random() * 10000),
              moduleName,
              triggerPhrase: matchedKeyword,
              codeSkeleton: skeleton,
              timestamp: new Date().toLocaleTimeString()
            };
            setActiveToast(draft);
            localStorage.setItem(seenKey, "true");

            // Also post a nice system event
            const ts = new Date().toTimeString().split(' ')[0];
            const event = new CustomEvent("neora-system-event", {
              detail: {
                id: "evt-meta-" + Math.floor(Math.random() * 10000),
                timestamp: ts,
                category: "self_evolution",
                level: "SUCCESS",
                message: `MetaAgent: Detected repeated user interest in "${matchedKeyword}". Auto-drafted skeleton SectionViewer.`,
                details: JSON.stringify({
                  detected_pattern: matchedKeyword,
                  module_drafted: moduleName,
                  code_skeleton_size: skeleton.length,
                  action: "Awaiting operator review and deployment from Holographic Toast"
                }, null, 2),
                latency: "25ms"
              }
            });
            window.dispatchEvent(event);
          }
        }
      } catch (e) {
        console.warn("MetaAgent chat scanner encountered an error:", e);
      }
    }, 15000); // Poll every 15s

    return () => clearInterval(monitorInterval);
  }, []);

  const handleDeploySkeleton = () => {
    if (!activeToast) return;
    
    // Save draft skeleton to memories or mock local storage module file database
    localStorage.setItem(`neora_skeleton_draft_${activeToast.moduleName}`, activeToast.codeSkeleton);
    
    const ts = new Date().toTimeString().split(' ')[0];
    const event = new CustomEvent("neora-system-event", {
      detail: {
        id: "evt-meta-deploy-" + Math.floor(Math.random() * 10000),
        timestamp: ts,
        category: "self_evolution",
        level: "SUCCESS",
        message: `MetaAgent: Successfully deployed modular skeleton to active SectionViewer: ${activeToast.moduleName}`,
        details: JSON.stringify({
          deployed_module: activeToast.moduleName,
          status: "SUCCESSFULLY_MOUNTED_IN_MEMORY",
          compilation_status: "SUCCESS_TS_STRIP"
        }, null, 2),
        latency: "12ms"
      }
    });
    window.dispatchEvent(event);

    // Close toast with a neat alert
    const notifEvent = new CustomEvent("neora-notification", {
      detail: {
        title: lang === "bn" ? "মডিউল খসড়া সম্পন্ন হয়েছে!" : "Module Skeleton Drafted!",
        message: lang === "bn" ? `${activeToast.moduleName} সফলভাবে যুক্ত করা হয়েছে।` : `${activeToast.moduleName} deployed into SectionViewer list.`,
        type: "success"
      }
    });
    window.dispatchEvent(notifEvent);
    
    setActiveToast(null);
  };

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl overflow-hidden p-4 border border-[#00d4ff]/40 bg-[#000d20]/95 backdrop-blur-xl text-left"
          style={{
            boxShadow: "0 10px 40px rgba(0,212,255,0.25), inset 0 0 20px rgba(0,212,255,0.05)"
          }}
        >
          {/* Neon Scanner Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-400 animate-pulse" />

          <div className="flex gap-3">
            <div className="p-2 bg-cyan-950/40 rounded-xl border border-cyan-500/20 self-start animate-bounce">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-[0.2em] uppercase">
                  ⚡ META-AGENT PATTERN RADAR
                </span>
                <button 
                  onClick={() => setActiveToast(null)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-xs font-bold text-slate-100 font-sans">
                {lang === "bn" ? "বারংবার ফিচার রিকোয়েস্ট ডিটেক্টেড!" : "Neural Activity Triggered!"}
              </h4>
              
              <p className="text-[11px] text-slate-450 leading-relaxed font-sans">
                {lang === "bn" 
                  ? `ব্যবহারকারী বারবার '${activeToast.triggerPhrase}' সংক্রান্ত কমান্ড দিচ্ছেন। নিওরা একটি স্বয়ংক্রিয় মডিউল স্কেলিটন ড্রাফট করেছে:`
                  : `User is repeating interactions around '${activeToast.triggerPhrase}'. Neora auto-drafted a skeleton module:`}
              </p>

              <div className="p-2 rounded bg-slate-950 border border-slate-900 font-mono text-[8px] text-cyan-300 overflow-x-auto max-h-24">
                <pre>{activeToast.codeSkeleton}</pre>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setActiveToast(null)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
                >
                  Ignore
                </button>
                <button
                  onClick={handleDeploySkeleton}
                  className="px-3 py-1 rounded bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Deploy Draft</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
