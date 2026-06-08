import React from "react";
import { Brain, LayoutDashboard, MessageSquare, Monitor, Settings, Workflow, Search, Activity } from "lucide-react";
import { NebulaBackground } from "../NebulaBackground";
import { GlassCard } from "../ui/glass";

const navItems = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "autonomy", label: "Automation", icon: Workflow },
  { id: "productivity", label: "Memory", icon: Brain },
  { id: "osAgent", label: "OS Agent", icon: Monitor },
  { id: "dev", label: "Settings", icon: Settings },
  { id: "vscode", label: "Workspace", icon: LayoutDashboard },
] as const;

type ActiveTab = typeof navItems[number]["id"];

interface AppShellProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export function AppShell({ activeTab, onChangeTab, children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030305] text-white">
      <NebulaBackground />
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden md:flex w-72 flex-col border-r border-cyan-500/10 bg-slate-950/65 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.25)]">
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Neora</div>
                <div className="text-lg font-semibold text-white">Command Shell</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  activeTab === item.id
                    ? "bg-cyan-500/10 text-cyan-200 border border-cyan-500/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4">
            <GlassCard className="p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Search</div>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2">
                <Search className="h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-300">CMD + K</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2">
                  <div className="text-slate-500">Mode</div>
                  <div className="text-white">Unified</div>
                </div>
                <div className="rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2">
                  <div className="text-slate-500">Status</div>
                  <div className="text-cyan-300">Ready</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </aside>

        <main className="flex-1 pb-24 md:pb-5">
          <div className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 px-4 py-3 backdrop-blur-2xl md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Neora</div>
                <div className="text-sm font-semibold">Command Shell</div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-cyan-500/15 bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-200">
                <Activity className="h-3.5 w-3.5" />
                Active
              </div>
            </div>
          </div>
          {children}
          <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-6 gap-2 rounded-2xl border border-white/8 bg-slate-950/90 p-2 backdrop-blur-2xl md:hidden shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] transition ${
                  activeTab === item.id
                    ? "bg-cyan-500/10 text-cyan-200"
                    : "text-slate-400"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="leading-none">{item.label}</span>
              </button>
            ))}
          </nav>
        </main>
      </div>
    </div>
  );
}
