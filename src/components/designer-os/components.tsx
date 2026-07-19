import React from "react";
import {
  Sparkles, Layers, Sliders, Play, Trash2, CheckCircle, AlertCircle, Cpu, Eye, EyeOff, Lock, Unlock, HelpCircle,
  Database, RefreshCw, Key, UserCheck, Activity, Search, X, ChevronRight, CornerDownRight, AlertTriangle
} from "lucide-react";

// =========================================================
// CUSTOM DIALOG / MODAL WINDOW
// =========================================================
export function CustomDialog({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in" id="custom-dialog-wrapper">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <h3 className="text-xs font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300 uppercase">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto text-slate-300 text-xs space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// COLLAPSIBLE PANEL WRAPPER
// =========================================================
export function CollapsiblePanel({
  title,
  isOpen,
  onToggle,
  children,
  badge
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string | number;
}) {
  return (
    <div className="border border-slate-800/80 rounded-xl bg-slate-900/40 overflow-hidden mb-2">
      <div
        onClick={onToggle}
        className="p-2.5 bg-slate-900/60 hover:bg-slate-900 flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          <span className="text-[10px] font-bold font-mono tracking-wider text-slate-200 uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {badge !== undefined && (
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[9px] px-1.5 py-0.5 rounded-md font-bold">
              {badge}
            </span>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="p-3 border-t border-slate-800/40 text-[11px] text-slate-300 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// =========================================================
// LAYER TREE HIERARCHY
// =========================================================
export function LayerTree({
  layers,
  selectedId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete
}: {
  layers: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      {layers.map((layer) => {
        const isSelected = selectedId === layer.id;
        return (
          <div
            key={layer.id}
            onClick={() => onSelect(layer.id)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border text-[11px] font-mono transition-all ${
              isSelected
                ? "bg-slate-950 border-pink-500/40 text-pink-400 shadow-lg shadow-pink-500/5"
                : "bg-slate-950/20 border-transparent hover:bg-slate-950/70 text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className={`text-[8px] px-1 py-0.2 rounded font-black tracking-wide uppercase ${
                layer.type === "text" ? "bg-cyan-500/10 text-cyan-400" :
                layer.type === "image" ? "bg-purple-500/10 text-purple-400" :
                "bg-amber-500/10 text-amber-400"
              }`}>
                {layer.type}
              </span>
              <span className="truncate">{layer.name}</span>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onToggleVisibility(layer.id)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                {layer.visibility ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onToggleLock(layer.id)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                {layer.locked ? <Lock className="w-3.5 h-3.5 text-pink-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-600" />}
              </button>
              <button
                onClick={() => onDelete(layer.id)}
                className="text-slate-500 hover:text-rose-400 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =========================================================
// COLOR PICKER DROPDOWN SYSTEM
// =========================================================
const SWATCHES = [
  "#f43f5e", "#ec4899", "#d946ef", "#8b5cf6", "#6366f1",
  "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", "#10b981",
  "#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444",
  "#0f172a", "#1e293b", "#334155", "#64748b", "#f8fafc"
];

export function ColorPalettePicker({
  value,
  onChange
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg border border-slate-700/60 shadow"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 text-[11px] font-mono rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-500/50"
        />
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {SWATCHES.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-full h-5 rounded-md cursor-pointer transition-transform hover:scale-110 ${
              value.toLowerCase() === color.toLowerCase() ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950" : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

// =========================================================
// REUSABLE TYPOGRAPHY SELECTOR
// =========================================================
const FONTS = ["Inter", "Space Grotesk", "Outfit", "JetBrains Mono", "Fira Code", "Playfair Display", "Georgia"];

export function FontPicker({
  selected,
  onChange
}: {
  selected: string;
  onChange: (font: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {FONTS.map((font) => (
        <button
          key={font}
          onClick={() => onChange(font)}
          className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-mono hover:bg-slate-950 cursor-pointer border truncate ${
            selected === font ? "bg-slate-950 border-cyan-500/40 text-cyan-400" : "bg-transparent border-transparent text-slate-400"
          }`}
          style={{ fontFamily: font }}
        >
          {font}
        </button>
      ))}
    </div>
  );
}

// =========================================================
// ARCHITECTURAL RULERS
// =========================================================
export function HorizontalRuler({ zoom }: { zoom: number }) {
  const tics = Array.from({ length: 40 });
  return (
    <div className="h-5 bg-slate-950 border-b border-slate-850 flex items-end relative overflow-hidden select-none w-full">
      <div className="absolute left-0 bottom-0 text-[8px] font-mono text-slate-600 bg-slate-900 border-r border-slate-800 px-1 z-10">px</div>
      <div className="flex justify-between w-full pl-8 pr-4">
        {tics.map((_, i) => (
          <div key={i} className="flex flex-col items-center h-full justify-end">
            <div className={`w-px bg-slate-800 ${i % 5 === 0 ? "h-3" : "h-1.5"}`} />
            {i % 5 === 0 && (
              <span className="text-[7px] font-mono text-slate-600 scale-75 mt-0.5">
                {Math.round(i * 40 * (100 / zoom))}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VerticalRuler({ zoom }: { zoom: number }) {
  const tics = Array.from({ length: 30 });
  return (
    <div className="w-5 bg-slate-950 border-r border-slate-850 flex flex-col items-center relative overflow-hidden select-none h-full">
      <div className="flex flex-col justify-between h-full pt-8 pb-4">
        {tics.map((_, i) => (
          <div key={i} className="flex items-center w-full justify-end pr-0.5">
            {i % 5 === 0 && (
              <span className="text-[7px] font-mono text-slate-600 scale-75 mr-1 transform rotate-270 select-none">
                {Math.round(i * 40 * (100 / zoom))}
              </span>
            )}
            <div className={`h-px bg-slate-800 ${i % 5 === 0 ? "w-3" : "w-1.5"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
