import React from 'react';
import { METRICS, CAPABILITIES_CATALOG_SAMPLES, RAW_MASTER_PROMPT } from '../masterPromptText';
import {
  Layers, Database, Workflow, Layout, Compass, Cpu, Sliders, Languages,
  FileCode, ShieldCheck, Terminal, Heart, ArrowRight, Download, Copy, Check
} from 'lucide-react';
import { copyToClipboardFailsafe } from '../utils/clipboard';

export function getStatIcon(name: string, className?: string) {
  const props = { className: className || "w-5 h-5 text-cyan-400" };
  switch (name) {
    case 'Layers': return <Layers {...props} />;
    case 'Database': return <Database {...props} />;
    case 'Workflow': return <Workflow {...props} />;
    case 'Layout': return <Layout {...props} />;
    case 'Compass': return <Compass {...props} />;
    case 'Cpu': return <Cpu {...props} />;
    case 'Sliders': return <Sliders {...props} />;
    case 'Languages': return <Languages {...props} />;
    default: return <Terminal {...props} />;
  }
}

export function AnalyticsPanel() {
  const [copied, setCopied] = React.useState(false);

  const handleCopyFullPrompt = () => {
    copyToClipboardFailsafe(RAW_MASTER_PROMPT).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const handleDownloadFullPrompt = () => {
    const blob = new Blob([RAW_MASTER_PROMPT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'neora_master_architect_prompt.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="analytics-panel-wrapper" className="flex-1 bg-slate-950 text-slate-100 overflow-y-auto p-6 space-y-8">
      {/* Upper Dashboard banner header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-lg border border-slate-800/60">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">System Metrics & Blueprint Directory</h2>
          <p className="text-xs text-slate-400 mt-1">High-level quantitative breakdown of Neora AI\'s system architecture specs.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            id="analytics-copy-btn"
            onClick={handleCopyFullPrompt}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 text-xs text-slate-200 border border-slate-750 p-2 rounded transition-all cursor-pointer font-mono"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "COPIED" : "COPY FULL PROMPT"}</span>
          </button>
          <button
            id="analytics-download-btn"
            onClick={handleDownloadFullPrompt}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-xs text-slate-950 font-bold p-2 rounded transition-all cursor-pointer font-mono"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD</span>
          </button>
        </div>
      </div>

      {/* Grid count cells - Bento grid layout */}
      <div>
        <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full inline-block"></span>
          Quantitative Parameters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map(metric => (
            <div
              key={metric.label}
              className="bg-slate-900 border border-slate-850 p-4 rounded-lg hover:border-cyan-500/20 transition-all duration-155 group hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">{metric.label.toUpperCase()}</span>
                <span className="p-1 w-7 h-7 rounded bg-slate-950/80 flex items-center justify-center shrink-0 border border-slate-900">
                  {getStatIcon(metric.iconName)}
                </span>
              </div>
              <div className="text-2xl font-bold font-sans text-white tracking-tight mb-1 group-hover:text-cyan-400 transition-colors">
                {metric.value}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed truncate">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Directory architecture models pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Capabilities Registry Preview */}
        <div className="bg-slate-900/30 border border-slate-850 p-5 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono tracking-wider text-white uppercase text-slate-300">Authoritative Catalog (Sample Extract)</h4>
          </div>
          <div className="space-y-4">
            {CAPABILITIES_CATALOG_SAMPLES.map(cat => (
              <div key={cat.category} className="space-y-1.5">
                <h5 className="text-[10px] font-mono text-cyan-500 font-bold">{cat.category.toUpperCase()}</h5>
                <ul className="grid grid-cols-1 gap-1 pl-3 text-[11px] list-disc text-slate-400">
                  {cat.items.map(item => (
                    <li key={item} className="leading-snug">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* System safety checklists and deployment architecture */}
        <div className="bg-slate-900/30 border border-slate-850 p-5 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono tracking-wider text-white uppercase text-slate-300 font-bold">Safety Bounds Checklist</h4>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 font-mono rounded mt-0.5 font-bold">OK</span>
                <p className="leading-tight">Every target writes payload executes pre-modification background backups.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 font-mono rounded mt-0.5 font-bold">OK</span>
                <p className="leading-tight">Path resolution checks dynamically throw traversal keywords matching <code className="text-cyan-400 text-[10px]">../</code>.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 font-mono rounded mt-0.5 font-bold">OK</span>
                <p className="leading-tight">All external keys strictly loaded via system variables, masking telemetry output endpoints.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 font-mono rounded mt-0.5 font-bold">OK</span>
                <p className="leading-tight">Express controllers filter routes payloads matching explicit Zod validating schemas.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-6 text-[10px] text-slate-500 font-mono space-y-1">
            <p>LAUNCHER MODES: <span className="text-white">run.bat | start.sh (daily checks)</span></p>
            <p>PORT CONFIGS: <span className="text-white">API: 3000 / Web Service Proxy routing</span></p>
            <p>PLATFORM REPLIT COMPLIANCE: <span className="text-cyan-500 font-bold">ACTIVE verified fallback modes</span></p>
          </div>
        </div>
      </div>

      {/* Decorative footer credits */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-5">
        <span>CRAFTED FOR ADVANCED PC AUTONOMY INTEGRATORS</span>
        <span className="flex items-center gap-1">NEORA ARCHITECT SPECS <Heart className="w-3 h-3 text-cyan-500 inline fill-cyan-500" /> V2.0</span>
      </div>
    </div>
  );
}
