import React, { useState, useEffect } from "react";
import {
  Brain, LayoutDashboard, MessageSquare, Monitor,
  Settings, Workflow, Activity, Zap, Shield, ChevronRight, ChevronLeft, LayoutGrid,
  DollarSign, Filter, Milestone, BookOpen, Laptop, Tv, Sliders, Share2, Hammer,
  Menu, Languages, Palette, Sparkles, Clipboard, Terminal, Cpu
} from "lucide-react";
import { NebulaBackground } from "../NebulaBackground";
import { VoiceOrb } from "../VoiceOrb";
import { motion } from "motion/react";

const navItems = [
  { id: "home",          label: "Dashboard",        icon: Activity,        color: "#00d4ff" },
  { id: "chat",          label: "Neural Chat",      icon: MessageSquare,   color: "#00d4ff" },
  { id: "neoraTv",       label: "Neora TV",         icon: Tv,              color: "#ff007c" },
  { id: "autonomy",      label: "Agent Planner",    icon: Sliders,         color: "#1a9fff" },
  { id: "productivity",  label: "Organizer Studio", icon: Clipboard,       color: "#7c3aed" },
  { id: "memoriesGraph", label: "Memories Graph",   icon: Share2,          color: "#38bdf8" },
  { id: "invoice",       label: "Earning Studio",   icon: DollarSign,      color: "#f5a623" },
  { id: "dev",           label: "Dev & Design",     icon: Terminal,        color: "#f5a623" },
  { id: "osAgent",       label: "PC OS Agent",      icon: Laptop,          color: "#00ff88" },
  { id: "filterLab",     label: "Filter Lab",       icon: Filter,          color: "#00d4ff" },
  { id: "roadmap",       label: "Roadmap",          icon: Milestone,       color: "#1a9fff" },
  { id: "blueprint",     label: "Specs",            icon: BookOpen,        color: "#00d4ff" },
  { id: "vscode",        label: "VS Code",          icon: Terminal,        color: "#00d4ff" },
  { id: "graphicStudio", label: "Design Studio",    icon: Palette,         color: "#00ff88" },
  { id: "designerOS",    label: "Neora Designer OS",icon: Sparkles,        color: "#ec4899" },
  { id: "aiDevStudio",   label: "AI Dev Studio",    icon: Cpu,             color: "#a855f7" },
  { id: "evolution",     label: "Self-Evolution",   icon: Cpu,             color: "#a78bfa" },
  { id: "webOs",         label: "Neora PC",         icon: Laptop,          color: "#00ff88" },
  { id: "builder",       label: "Builder",          icon: Hammer,          color: "#c084fc" },
] as const;

type ActiveTab = typeof navItems[number]["id"];

interface AppShellProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onVoiceOpen?: () => void;
  children: React.ReactNode;
  lang: "en" | "bn";
  onChangeLang: (lang: "en" | "bn") => void;
}

export function AppShell({ activeTab, onChangeTab, onVoiceOpen, children, lang, onChangeLang }: AppShellProps) {
  const [time, setTime] = useState(new Date());
  const [sysLoad, setSysLoad] = useState(42);
  const [isListening, setIsListening] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setSysLoad(prev => {
        const delta = (Math.random() - 0.5) * 8;
        return Math.max(20, Math.min(85, prev + delta));
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", { hour12: false });
  const dateStr = time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const getLabel = (id: string, defaultLabel: string) => {
    if (lang === "en") return defaultLabel;
    const mapping: Record<string, string> = {
      home: "ড্যাশবোর্ড",
      chat: "নিওরা চ্যাট",
      graphicStudio: "ডিজাইন স্টুডিও",
      designerOS: "নিওরা ডিজাইনার ওএস",
      builder: "বিল্ডার",
      neoraTv: "নিওরা টিভি",
      autonomy: "এজেন্ট প্ল্যানার",
      productivity: "অর্গানাইজার স্টুডিও",
      memoriesGraph: "মেমোরিজ গ্রাফ",
      invoice: "আর্নিং স্টুডিও",
      osAgent: "পিসি ওএস এজেন্ট",
      webOs: "নিওরা পিসি",
      filterLab: "ফিল্টার রিসার্চ ল্যাব",
      roadmap: "উন্নয়ন রোডম্যাপ",
      blueprint: "সিস্টেম ব্লুপ্রিন্ট",
      evolution: "স্বয়ংক্রিয় ইভোলিউশন",
      dev: "ডেভ ও ডিজাইন",
      vscode: "ভিএস কোড",
    };
    return mapping[id] || defaultLabel;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000814] text-white">
      <NebulaBackground />

      {/* Main layout */}
      <div className="relative z-10 flex h-screen w-full overflow-hidden">

        {/* ===== JARVIS SIDEBAR ===== */}
        <aside className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out relative ${isSidebarCollapsed ? "w-0 overflow-hidden border-r-0 opacity-0" : "w-64"}`} style={{
          background: "rgba(0,8,20,0.88)",
          borderRight: isSidebarCollapsed ? "none" : "1px solid rgba(0,212,255,0.12)",
          backdropFilter: "blur(24px)",
          boxShadow: isSidebarCollapsed ? "none" : "4px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(0,212,255,0.05)",
        }}>

          {/* Logo / Identity */}
          <motion.div
            initial={false}
            animate={{
              height: activeTab === "home" ? "auto" : 0,
              opacity: activeTab === "home" ? 1 : 0,
              paddingTop: activeTab === "home" ? "20px" : "0px",
              paddingBottom: activeTab === "home" ? "20px" : "0px",
            }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
            className="overflow-hidden flex flex-col items-center w-full relative"
            style={{
              borderBottom: activeTab === "home" ? "1px solid rgba(0,212,255,0.08)" : "none",
              background: "linear-gradient(180deg, rgba(0,212,255,0.04) 0%, transparent 100%)",
            }}
          >
            {/* Collapse button inside sidebar header */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="absolute right-3 top-3 p-1 rounded-lg bg-slate-900/40 hover:bg-slate-800/80 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer z-20"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Voice Orb */}
            <VoiceOrb
              size="md"
              isListening={isListening}
              onClick={() => { setIsListening(v => !v); onVoiceOpen?.(); }}
              className="mb-3"
            />
            <div className="text-center">
              <div className="font-jarvis text-xs tracking-[0.3em] text-[rgba(0,212,255,0.5)] uppercase mb-0.5">
                System
              </div>
              <div
                className="font-jarvis text-lg font-bold tracking-[0.2em] uppercase"
                style={{ color: "#00d4ff", textShadow: "0 0 20px rgba(0,212,255,0.5)" }}
              >
                NEORA
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">AI Operating System</div>
            </div>
          </motion.div>

          {/* System Clock */}
          <motion.div
            initial={false}
            animate={{
              height: activeTab === "home" ? "auto" : 0,
              opacity: activeTab === "home" ? 1 : 0,
              paddingTop: activeTab === "home" ? "12px" : "0px",
              paddingBottom: activeTab === "home" ? "12px" : "0px",
            }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
            className="overflow-hidden px-4 w-full"
            style={{
              borderBottom: activeTab === "home" ? "1px solid rgba(0,212,255,0.06)" : "none",
            }}
          >
            <div className="rounded-lg px-3 py-2.5" style={{
              background: "rgba(0,212,255,0.04)",
              border: "1px solid rgba(0,212,255,0.1)",
            }}>
              <div
                className="font-jarvis text-xl font-bold text-center tracking-[0.15em]"
                style={{ color: "#00d4ff", textShadow: "0 0 15px rgba(0,212,255,0.5)" }}
              >
                {timeStr}
              </div>
              <div className="text-center text-[10px] text-slate-500 font-mono mt-0.5">{dateStr}</div>
            </div>
          </motion.div>

          {/* System Load */}
          <motion.div
            initial={false}
            animate={{
              height: activeTab === "home" ? "auto" : 0,
              opacity: activeTab === "home" ? 1 : 0,
              paddingTop: activeTab === "home" ? "12px" : "0px",
              paddingBottom: activeTab === "home" ? "12px" : "0px",
            }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
            className="overflow-hidden px-4 w-full"
            style={{
              borderBottom: activeTab === "home" ? "1px solid rgba(0,212,255,0.06)" : "none",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="jarvis-label">SYS LOAD</span>
              <span className="font-mono text-[10px]" style={{ color: "#00d4ff" }}>{sysLoad.toFixed(0)}%</span>
            </div>
            <div className="jarvis-progress h-1">
              <div
                className="jarvis-progress-bar"
                style={{ width: `${sysLoad}%` }}
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] font-mono text-slate-500">
              <div className="flex flex-col items-center rounded px-1 py-1" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}>
                <span style={{ color: "#00d4ff" }}>CPU</span>
                <span>{(sysLoad * 0.8).toFixed(0)}%</span>
              </div>
              <div className="flex flex-col items-center rounded px-1 py-1" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}>
                <span style={{ color: "#7c3aed" }}>MEM</span>
                <span>{(sysLoad * 1.1).toFixed(0)}%</span>
              </div>
              <div className="flex flex-col items-center rounded px-1 py-1" style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}>
                <span style={{ color: "#00ff88" }}>NET</span>
                <span>OK</span>
              </div>
            </div>
          </motion.div>

          {/* Language Selector inside Sidebar */}
          <div className="px-4 py-2.5 w-full select-none">
            <button
              type="button"
              onClick={() => onChangeLang(lang === "en" ? "bn" : "en")}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#00d4ff]/5 hover:bg-[#00d4ff]/10 border border-[#00d4ff]/15 hover:border-[#00d4ff]/35 text-[#00d4ff] text-xs font-mono font-bold cursor-pointer transition-all shadow-[0_0_8px_rgba(0,212,255,0.03)]"
              title={lang === "bn" ? "ইংরেজিতে পরিবর্তন করুন" : "Switch to Bengali"}
            >
              <div className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 animate-pulse" />
                <span>{lang === "bn" ? "ভাষা: বাংলা" : "Language: EN"}</span>
              </div>
              <span className="text-[9px] bg-[#00d4ff]/20 px-1.5 py-0.5 rounded text-white font-sans font-normal tracking-wide uppercase">
                {lang === "bn" ? "EN" : "বাংলা"}
              </span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  className={`jarvis-sidebar-item ${isActive ? "active" : ""} flex w-full items-center gap-3 px-3 py-2.5 text-sm`}
                  style={isActive ? {
                    color: item.color,
                  } : { color: "rgba(148,163,184,0.7)" }}
                >
                  <item.icon
                    className="h-4 w-4 shrink-0"
                    style={isActive ? { color: item.color, filter: `drop-shadow(0 0 4px ${item.color})` } : {}}
                  />
                  <span className={`text-sm ${isActive ? "font-medium" : ""}`}>{getLabel(item.id, item.label)}</span>
                  {isActive && (
                    <ChevronRight
                      className="h-3 w-3 ml-auto"
                      style={{ color: item.color, opacity: 0.7 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* System Status Footer */}
          <div className="p-4" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
            <div className="rounded-lg p-3 space-y-2" style={{
              background: "rgba(0,12,28,0.6)",
              border: "1px solid rgba(0,212,255,0.1)",
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="jarvis-ping" />
                  <span className="text-[10px] font-mono" style={{ color: "#00ff88" }}>{lang === "bn" ? "অনলাইন" : "ONLINE"}</span>
                </div>
                <Shield className="h-3 w-3 text-slate-500" />
              </div>
              <div className="jarvis-separator" />
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <Zap className="h-3 w-3" style={{ color: "#f5a623" }} />
                <span>{lang === "bn" ? "নিওরাল ইঞ্জিন সচল" : "Neural Engine Active"}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 pb-20 md:pb-0 min-w-0 flex flex-col h-screen overflow-hidden relative">

          {/* Floating Expand Sidebar Button (Only visible on desktop when sidebar is collapsed) */}
          {isSidebarCollapsed && (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="hidden md:flex absolute top-4 left-4 z-40 p-2 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/35 text-cyan-400 hover:text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.25)] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] cursor-pointer transition-all items-center gap-1.5 text-[10px] font-mono font-bold uppercase"
              title={lang === "bn" ? "সাইডবার দেখান" : "Show Sidebar"}
            >
              <Menu className="w-4 h-4 animate-pulse" />
              <span>{lang === "bn" ? "সাইডবার" : "Sidebar"}</span>
            </button>
          )}

          {/* Mobile top bar */}
          <div className="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-2xl md:hidden" style={{
            background: "rgba(0,8,20,0.92)",
            borderColor: "rgba(0,212,255,0.1)",
          }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-jarvis text-[9px] tracking-[0.3em] text-[rgba(0,212,255,0.5)] uppercase">Neora</div>
                <div className="font-jarvis text-sm font-bold" style={{ color: "#00d4ff" }}>AI SYSTEM</div>
              </div>
              <VoiceOrb size="sm" isListening={isListening} onClick={() => setIsListening(v => !v)} />
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-mono sys-online">
                <Activity className="h-3 w-3" />
                ACTIVE
              </div>
            </div>
          </div>

          {children}

          {/* Mobile bottom nav */}
          <nav className="fixed inset-x-2 bottom-2 z-30 flex items-center overflow-x-auto gap-1.5 rounded-xl p-2 backdrop-blur-2xl md:hidden no-scrollbar" style={{
            background: "rgba(0,8,20,0.95)",
            border: "1px solid rgba(0,212,255,0.12)",
            boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
          }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[9px] transition-all shrink-0 min-w-[55px]"
                  style={isActive ? {
                    background: `rgba(0,212,255,0.08)`,
                    border: `1px solid rgba(0,212,255,0.2)`,
                    color: item.color,
                  } : { color: "rgba(100,116,139,0.8)", border: "1px solid transparent" }}
                >
                  <item.icon className="h-4 w-4" style={isActive ? { filter: `drop-shadow(0 0 3px ${item.color})` } : {}} />
                  <span className="leading-none truncate">{getLabel(item.id, item.label).split(" ")[0]}</span>
                </button>
              );
            })}
          </nav>
        </main>
      </div>
    </div>
  );
}
