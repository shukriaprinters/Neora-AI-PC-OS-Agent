import React, { useState, useEffect } from "react";
import {
  Brain, LayoutDashboard, MessageSquare, Monitor,
  Settings, Workflow, Activity, Zap, Shield, ChevronRight, LayoutGrid
} from "lucide-react";
import { NebulaBackground } from "../NebulaBackground";
import { VoiceOrb } from "../VoiceOrb";

const navItems = [
  { id: "home",       label: "Dashboard",   icon: LayoutGrid,    color: "#00d4ff" },
  { id: "chat",       label: "Neural Chat", icon: MessageSquare, color: "#00d4ff" },
  { id: "autonomy",   label: "Automation",  icon: Workflow,      color: "#1a9fff" },
  { id: "productivity", label: "Memory",    icon: Brain,         color: "#7c3aed" },
  { id: "osAgent",    label: "OS Agent",    icon: Monitor,       color: "#00ff88" },
  { id: "dev",        label: "Settings",    icon: Settings,      color: "#f5a623" },
  { id: "vscode",     label: "Workspace",   icon: LayoutDashboard, color: "#00d4ff" },
] as const;

type ActiveTab = typeof navItems[number]["id"];

interface AppShellProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onVoiceOpen?: () => void;
  children: React.ReactNode;
}

export function AppShell({ activeTab, onChangeTab, onVoiceOpen, children }: AppShellProps) {
  const [time, setTime] = useState(new Date());
  const [sysLoad, setSysLoad] = useState(42);
  const [isListening, setIsListening] = useState(false);

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

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000814] text-white">
      <NebulaBackground />

      {/* Main layout */}
      <div className="relative z-10 flex h-screen w-full overflow-hidden">

        {/* ===== JARVIS SIDEBAR ===== */}
        <aside className="hidden md:flex w-64 flex-col shrink-0" style={{
          background: "rgba(0,8,20,0.88)",
          borderRight: "1px solid rgba(0,212,255,0.12)",
          backdropFilter: "blur(24px)",
          boxShadow: "4px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(0,212,255,0.05)",
        }}>

          {/* Logo / Identity */}
          <div className="p-5 flex flex-col items-center" style={{
            borderBottom: "1px solid rgba(0,212,255,0.08)",
            background: "linear-gradient(180deg, rgba(0,212,255,0.04) 0%, transparent 100%)",
          }}>
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
          </div>

          {/* System Clock */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
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
          </div>

          {/* System Load */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
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
                  <span className={`text-sm ${isActive ? "font-medium" : ""}`}>{item.label}</span>
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
                  <span className="text-[10px] font-mono" style={{ color: "#00ff88" }}>ONLINE</span>
                </div>
                <Shield className="h-3 w-3 text-slate-500" />
              </div>
              <div className="jarvis-separator" />
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <Zap className="h-3 w-3" style={{ color: "#f5a623" }} />
                <span>Neural Engine Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 pb-20 md:pb-0 min-w-0 flex flex-col h-screen overflow-hidden">

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
          <nav className="fixed inset-x-2 bottom-2 z-30 grid grid-cols-6 gap-1.5 rounded-xl p-2 backdrop-blur-2xl md:hidden" style={{
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
                  className="flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[9px] transition-all"
                  style={isActive ? {
                    background: `rgba(0,212,255,0.08)`,
                    border: `1px solid rgba(0,212,255,0.2)`,
                    color: item.color,
                  } : { color: "rgba(100,116,139,0.8)", border: "1px solid transparent" }}
                >
                  <item.icon className="h-4 w-4" style={isActive ? { filter: `drop-shadow(0 0 3px ${item.color})` } : {}} />
                  <span className="leading-none truncate">{item.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </nav>
        </main>
      </div>
    </div>
  );
}
