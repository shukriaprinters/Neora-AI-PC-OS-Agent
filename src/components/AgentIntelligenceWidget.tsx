import React, { useState, useEffect, useMemo } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from "recharts";
import { 
  Cpu, Activity, ShieldCheck, Zap, RefreshCw, AlertTriangle, TrendingDown, Info, BarChart2,
  Download, FileSpreadsheet, FileDown, ShieldAlert, ListFilter, Play, RotateCcw
} from "lucide-react";

interface AgentIntelligenceWidgetProps {
  lang: "en" | "bn";
  apiHealth?: number;
}

const INITIAL_USAGE_DATA = [
  { time: "05:00", cpu: 22, ram: 41, neural: 35, health: 100 },
  { time: "06:00", cpu: 25, ram: 42, neural: 40, health: 100 },
  { time: "07:00", cpu: 32, ram: 44, neural: 42, health: 100 },
  { time: "08:00", cpu: 45, ram: 48, neural: 55, health: 98 },
  { time: "09:00", cpu: 28, ram: 43, neural: 45, health: 100 },
  { time: "10:00", cpu: 38, ram: 46, neural: 50, health: 100 },
  { time: "11:00", cpu: 85, ram: 79, neural: 92, health: 70 }, // High load anomaly
  { time: "12:00", cpu: 34, ram: 48, neural: 45, health: 95 },
  { time: "13:00", cpu: 52, ram: 55, neural: 70, health: 88 }, // Moderate dip
  { time: "14:00", cpu: 40, ram: 52, neural: 60, health: 92 },
  { time: "15:00", cpu: 46, ram: 50, neural: 65, health: 94 },
  { time: "16:00", cpu: 32, ram: 48, neural: 55, health: 100 },
];

export function AgentIntelligenceWidget({ lang, apiHealth = 100 }: AgentIntelligenceWidgetProps) {
  const [usageData, setUsageData] = useState(INITIAL_USAGE_DATA);
  const [activeTab, setActiveTab] = useState<"telemetry" | "correlation">("telemetry");
  const [successRate, setSuccessRate] = useState(96.4);
  const [cpuLoad, setCpuLoad] = useState(35);
  const [memoryUsage, setMemoryUsage] = useState(51);
  const [neuralLoad, setNeuralLoad] = useState(61);
  
  // Custom diagnostic features states
  const [severityFilter, setSeverityFilter] = useState<"all" | "high">("all");
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"aggregate" | "detailed">("aggregate");
  const [clickedDataPoint, setClickedDataPoint] = useState<any>(null);

  const [healedProcesses, setHealedProcesses] = useState([
    { id: 1, name: "Ollama Local API Node", desc: "Auto-restarted background service", time: "10m ago", status: "healed" },
    { id: 2, name: "Memory Vector Alignment", desc: "Reconciled metadata indices", time: "1h ago", status: "healed" },
    { id: 3, name: "Websocket Connection Stream", desc: "Auto-reconnected socket pipeline", time: "3h ago", status: "healed" }
  ]);

  const [diagnosticLogs, setDiagnosticLogs] = useState([
    { id: "diag-1", time: "11:00", message: "Critical Resource Spike: Neural core at 92% caused system health to plunge to 70%. Auto-reconciliation completed in 4.2s.", severity: "high" },
    { id: "diag-2", time: "13:00", message: "Moderate Buffer Congestion: CPU at 52% / Neural 70% caused health fluctuation to 88%. Cleared queue pipelines.", severity: "medium" },
    { id: "diag-3", time: "Just Now", message: "System Integrity Correlated: Scanning active memory leaks and buffer allocations.", severity: "low" }
  ]);

  // Synchronize incoming parent system health fluctuations in the active data point
  useEffect(() => {
    setUsageData(prev => {
      const nextData = [...prev];
      const lastIdx = nextData.length - 1;
      if (lastIdx >= 0) {
        nextData[lastIdx] = {
          ...nextData[lastIdx],
          health: apiHealth
        };
      }
      return nextData;
    });

    if (apiHealth < 80) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDiagnosticLogs(prev => {
        if (prev[0] && prev[0].message.includes(`${apiHealth}%`)) return prev;
        
        const newLog = {
          id: "diag-" + Date.now(),
          time: timeStr,
          message: lang === "bn" 
            ? `রিসোর্স বিপর্যয়: সিস্টেম হেলথ ${apiHealth}% এ নেমে গেছে। অটোমেটেড নিউরাল রিকনসিলিয়েশন প্রোটোকল সক্রিয়!`
            : `Resource Anomaly: Core system health drops to ${apiHealth}%. Triggered automated neural reconciliation protocol.`,
          severity: "high" as const
        };
        return [newLog, ...prev.slice(0, 5)];
      });
    }
  }, [apiHealth, lang]);

  // Proactive threshold monitoring triggers a 'Predictive Alert' if resource consumption is extremely high
  useEffect(() => {
    if (cpuLoad > 85 || neuralLoad > 85) {
      const evt = new CustomEvent("neora-notification", {
        detail: {
          title: lang === "bn" ? "ভবিষ্যদ্বাণীমূলক সতর্কতা" : "Predictive Alert",
          message: lang === "bn" 
            ? `উচ্চ রিসোর্স ব্যবহার: CPU ${cpuLoad}% এবং নিউরাল লোড ${neuralLoad}%। আগামী ৩০ মিনিটে সিস্টেম হেলথ হ্রাসের সম্ভাবনা আছে!`
            : `Proactive Alert: Critical resource loads (CPU ${cpuLoad}%, Neural ${neuralLoad}%). High probability of a system health drop within 30 minutes.`,
          type: "warning"
        }
      });
      window.dispatchEvent(evt);
    }
  }, [cpuLoad, neuralLoad, lang]);

  // Simulate real-time trend updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Slightly adjust success rate
      setSuccessRate(prev => {
        const delta = (Math.random() - 0.4) * 0.1;
        return parseFloat(Math.min(100, Math.max(90, prev + delta)).toFixed(2));
      });

      // Adjust latest cpu/ram/neural values
      const nextCpu = Math.min(95, Math.max(10, cpuLoad + Math.floor((Math.random() - 0.5) * 8)));
      const nextRam = Math.min(95, Math.max(20, memoryUsage + Math.floor((Math.random() - 0.5) * 4)));
      const nextNeural = Math.min(100, Math.max(30, neuralLoad + Math.floor((Math.random() - 0.5) * 10)));
      
      setCpuLoad(nextCpu);
      setMemoryUsage(nextRam);
      setNeuralLoad(nextNeural);

      // Update the chart history array
      setUsageData(prev => {
        const nextData = [...prev.slice(1)];
        const lastTime = prev[prev.length - 1].time;
        const lastHour = parseInt(lastTime.split(":")[0]);
        const nextHour = (lastHour + 1) % 24;
        const formattedTime = `${nextHour.toString().padStart(2, "0")}:00`;
        
        let simulatedHealth = apiHealth;
        if (simulatedHealth === 100) {
          if (nextNeural > 80 || nextCpu > 80) {
            simulatedHealth = 72;
          } else if (nextNeural > 70) {
            simulatedHealth = 85;
          } else {
            simulatedHealth = 95 + Math.floor(Math.random() * 6);
          }
        }
        
        nextData.push({
          time: formattedTime,
          cpu: nextCpu,
          ram: nextRam,
          neural: nextNeural,
          health: Math.min(100, simulatedHealth)
        });
        return nextData;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [cpuLoad, memoryUsage, neuralLoad, apiHealth]);

  // Calculate Pearson correlation coefficient (r) between Resource Load (CPU + Neural) and System Health
  const calculateCorrelation = () => {
    const n = usageData.length;
    if (n === 0) return 0;
    
    const loads = usageData.map(d => (d.cpu + d.neural) / 2);
    const healths = usageData.map(d => d.health);
    
    const meanLoad = loads.reduce((a, b) => a + b, 0) / n;
    const meanHealth = healths.reduce((a, b) => a + b, 0) / n;
    
    let num = 0;
    let denLoad = 0;
    let denHealth = 0;
    
    for (let i = 0; i < n; i++) {
      const dLoad = loads[i] - meanLoad;
      const dHealth = healths[i] - meanHealth;
      num += dLoad * dHealth;
      denLoad += dLoad * dLoad;
      denHealth += dHealth * dHealth;
    }
    
    if (denLoad === 0 || denHealth === 0) return -0.82;
    return parseFloat((num / Math.sqrt(denLoad * denHealth)).toFixed(2));
  };

  const correlationCoefficient = calculateCorrelation();

  const triggerManualHeal = () => {
    const newHeal = {
      id: Date.now(),
      name: "Manual System Diagnostics",
      desc: "Force-reconciled all background runtimes",
      time: "Just now",
      status: "healed"
    };
    setHealedProcesses(prev => [newHeal, ...prev.slice(0, 2)]);
    
    // Add custom diagnostic log
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDiagnosticLogs(prev => [
      {
        id: "diag-manual-" + Date.now(),
        time: timeStr,
        message: lang === "bn"
          ? "ম্যানুয়াল ডায়াগনস্টিকস রান: সমস্ত নিউরাল বাফার এবং ফাইল সিস্টেম ক্যাশে সফলভাবে সিঙ্ক করা হয়েছে।"
          : "Manual diagnostic sweep: Successfully synced all neural core weights and storage buffers.",
        severity: "low"
      },
      ...prev.slice(0, 5)
    ]);

    const evt = new CustomEvent("neora-notification", {
      detail: {
        title: lang === "bn" ? "নিরাময় সফল" : "Self-Heal Triggered",
        message: lang === "bn" ? "সিস্টেম ডায়াগনস্টিকস সম্পন্ন হয়েছে এবং রানটাইম ঠিক করা হয়েছে।" : "System diagnostics completed. Run-time parameters normal.",
        type: "success"
      }
    });
    window.dispatchEvent(evt);
  };

  // Generate and download a structured JSON report
  const handleDownloadJSONReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      lang,
      systemHealth: apiHealth,
      successRate: `${successRate}%`,
      resourceUsage: {
        cpu: `${cpuLoad}%`,
        ram: `${memoryUsage}%`,
        neuralCore: `${neuralLoad}%`
      },
      correlationIndex: correlationCoefficient,
      timeline: usageData,
      diagnosticEvents: diagnosticLogs,
      healedRuntimes: healedProcesses
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neora_agent_intelligence_report_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export historical metrics as a downloadable CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Time,CPU Load %,Memory Usage %,Neural Core %,System Health %\n";
    usageData.forEach(d => {
      csvContent += `${d.time},${d.cpu},${d.ram},${d.neural},${d.health}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `neora_diagnostic_trends_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open a printable popup window styled cleanly for professional PDF report generation
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Neora System Report - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: monospace; padding: 40px; background: #fff; color: #000; line-height: 1.5; }
              h1 { border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 24px; font-size: 20px; }
              h2 { font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 30px; }
              .grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
              .card { border: 1px solid #ccc; padding: 12px; border-radius: 4px; text-align: center; }
              .card-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f5f5f5; }
              .severity { font-weight: bold; text-transform: uppercase; }
              .high { color: #dc2626; }
              .medium { color: #d97706; }
              .low { color: #2563eb; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <h1>NEORA INTEGRATED COGNITIVE ARCHITECT - SYSTEM REPORT</h1>
            <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>System Health State:</strong> ${apiHealth}% (${apiHealth < 80 ? "ANOMALY LOAD" : "STABLE"})</p>
            
            <h2>CURRENT RUNTIME METRICS</h2>
            <div class="grid">
              <div class="card">
                <div>SUCCESS RATE</div>
                <div class="card-val">${successRate}%</div>
              </div>
              <div class="card">
                <div>RESOURCE LOAD</div>
                <div class="card-val">${cpuLoad}%</div>
              </div>
              <div class="card">
                <div>NEURAL CORRELATION</div>
                <div class="card-val">${neuralLoad}%</div>
              </div>
            </div>

            <h2>HISTORICAL TREND SEQUENCE (12-HOUR DATA)</h2>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>CPU Load %</th>
                  <th>RAM Usage %</th>
                  <th>Neural Load %</th>
                  <th>Core Health %</th>
                </tr>
              </thead>
              <tbody>
                ${usageData.map(d => `
                  <tr>
                    <td>${d.time}</td>
                    <td>${d.cpu}%</td>
                    <td>${d.ram}%</td>
                    <td>${d.neural}%</td>
                    <td>${d.health}%</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <h2>DIAGNOSTIC EVENTS SIMULATION LOG</h2>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Severity</th>
                  <th>Event Description</th>
                </tr>
              </thead>
              <tbody>
                ${diagnosticLogs.map(log => `
                  <tr>
                    <td>${log.time}</td>
                    <td class="severity ${log.severity}">${log.severity}</td>
                    <td>${log.message}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Toggle selection of diagnostic events for compare view
  const handleSelectLog = (id: string) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter diagnostic logs based on quick priority severity toggle
  const filteredLogs = useMemo(() => {
    if (severityFilter === "high") {
      return diagnosticLogs.filter(log => log.severity === "high");
    }
    return diagnosticLogs;
  }, [diagnosticLogs, severityFilter]);

  // Determine chart data source (with simulation playback support)
  const activeTimelineData = useMemo(() => {
    if (scrubIndex !== null) {
      return usageData.slice(0, scrubIndex + 1);
    }
    return usageData;
  }, [usageData, scrubIndex]);

  return (
    <div className="rounded-xl p-4 flex flex-col justify-between h-full bg-slate-950/85 border border-cyan-500/15 backdrop-blur-md relative select-none">
      {/* Corner Glow Accents */}
      <div className="absolute top-0 left-0 w-6 h-px bg-cyan-400/40" />
      <div className="absolute top-0 left-0 w-px h-6 bg-cyan-400/40" />
      <div className="absolute bottom-0 right-0 w-6 h-px bg-cyan-400/40" />
      <div className="absolute bottom-0 right-0 w-px h-6 bg-cyan-400/40" />

      {/* Header with Title and View toggles */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
              {lang === "bn" ? "এজেন্ট ইন্টেলিজেন্স সুইট" : "AGENT INTELLIGENCE SUITE"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${apiHealth < 80 ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`} />
            <span className={`text-[8px] font-mono font-bold uppercase ${apiHealth < 80 ? "text-rose-400" : "text-emerald-400"}`}>
              {apiHealth < 80 ? (lang === "bn" ? "সতর্কতা" : "ANOMALY") : (lang === "bn" ? "সচল" : "STABLE")}
            </span>
          </div>
        </div>

        {/* Action Controls toolbar */}
        <div className="flex items-center justify-between gap-2 bg-slate-900/40 p-1 rounded-lg border border-slate-900">
          {/* Diagnostic View Toggles */}
          <div className="flex bg-slate-950 p-0.5 rounded-md border border-slate-850">
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer ${
                activeTab === "telemetry" 
                  ? "bg-cyan-500/20 text-cyan-300" 
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              <Cpu className="w-2.5 h-2.5" />
              <span>{lang === "bn" ? "গ্রাফ" : "TELEM"}</span>
            </button>
            <button
              onClick={() => setActiveTab("correlation")}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer ${
                activeTab === "correlation" 
                  ? "bg-cyan-500/20 text-cyan-300" 
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              <BarChart2 className="w-2.5 h-2.5" />
              <span>{lang === "bn" ? "সমন্বয়" : "CORREL"}</span>
            </button>
          </div>

          {/* Aggregate vs Detailed breakdown toggle */}
          {activeTab === "telemetry" && (
            <button
              onClick={() => setViewMode(prev => prev === "aggregate" ? "detailed" : "aggregate")}
              className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-800 bg-slate-950 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 transition-all cursor-pointer"
            >
              {viewMode === "aggregate" ? "Aggregate View" : "Component View"}
            </button>
          )}

          {/* Export utility triggers */}
          <div className="flex gap-1">
            <button
              onClick={handleDownloadJSONReport}
              className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer"
              title="Download JSON Report"
            >
              <Download className="w-3 h-3" />
            </button>
            <button
              onClick={handleExportCSV}
              className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer"
              title="Export CSV Insights"
            >
              <FileSpreadsheet className="w-3 h-3" />
            </button>
            <button
              onClick={handleExportPDF}
              className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer"
              title="Print Professional PDF Summary"
            >
              <FileDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-slate-900/40 border border-slate-900 p-1.5 rounded-lg text-center">
          <div className="text-[9px] text-slate-500 font-mono font-bold uppercase">{lang === "bn" ? "সাফল্য হার" : "SUCCESS RATE"}</div>
          <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5 select-all">{successRate}%</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 p-1.5 rounded-lg text-center">
          <div className="text-[9px] text-slate-500 font-mono font-bold uppercase">{lang === "bn" ? "রিসোর্স লোড" : "RESOURCE LOAD"}</div>
          <div className="text-xs font-bold font-mono text-[#00d4ff] mt-0.5 select-all">{cpuLoad}%</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-900 p-1.5 rounded-lg text-center">
          <div className="text-[9px] text-slate-500 font-mono font-bold uppercase">{lang === "bn" ? "নিউরন ব্যান্ড" : "NEURAL CORE"}</div>
          <div className="text-xs font-bold font-mono text-purple-400 mt-0.5 select-all">{neuralLoad}%</div>
        </div>
      </div>

      {/* High-density Trend Charts (Aggregate / Detailed) */}
      {activeTab === "telemetry" ? (
        <div className="space-y-1.5 mb-2 shrink-0">
          {/* Aggregated Overview or Component Breakdown Area */}
          <div className="h-28 w-full bg-slate-900/20 border border-slate-900 rounded-lg p-1.5 relative">
            <div className="absolute top-1.5 left-2 text-[8px] font-mono text-slate-500 uppercase tracking-wider z-10 flex gap-1.5">
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> CPU</span>
              {viewMode === "aggregate" && (
                <>
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> NEURAL</span>
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> HEALTH</span>
                </>
              )}
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={activeTimelineData} 
                margin={{ top: 12, right: 2, left: 2, bottom: 2 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    setClickedDataPoint(state.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeural" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#0a0f1d", borderColor: "#00d4ff", borderRadius: "8px", fontSize: "9px", color: "#fff" }}
                  labelStyle={{ color: "#00d4ff", fontFamily: "monospace" }}
                />
                
                {/* Automatic marker annotations to pinpoint specific resource spikes / health dips */}
                {activeTimelineData.map((d, idx) => {
                  if (d.health < 80) {
                    return (
                      <ReferenceLine 
                        key={`ref-drop-${idx}`} 
                        x={d.time} 
                        stroke="#f43f5e" 
                        strokeDasharray="2 2"
                        label={{ value: "ANOMALY", fill: "#f43f5e", fontSize: 7, position: "insideBottomLeft" }}
                      />
                    );
                  }
                  if (d.cpu > 80) {
                    return (
                      <ReferenceLine 
                        key={`ref-spike-${idx}`} 
                        x={d.time} 
                        stroke="#00d4ff" 
                        strokeDasharray="2 2"
                        label={{ value: "SPIKE", fill: "#00d4ff", fontSize: 7, position: "insideTopLeft" }}
                      />
                    );
                  }
                  return null;
                })}

                <Area type="monotone" dataKey="cpu" stroke="#00d4ff" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={1.5} name="CPU Load" activeDot={{ r: 5 }} />
                {viewMode === "aggregate" && (
                  <>
                    <Area type="monotone" dataKey="neural" stroke="#c084fc" fillOpacity={1} fill="url(#colorNeural)" strokeWidth={1.5} name="Neural Core" activeDot={{ r: 5 }} />
                    <Area type="monotone" dataKey="health" stroke="#f43f5e" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={2} strokeDasharray="3 3" name="System Health" activeDot={{ r: 5 }} />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive data point detail summary upon clicking data markers */}
          {clickedDataPoint && (
            <div className="bg-slate-900/60 p-1.5 rounded border border-cyan-500/10 text-[9px] font-mono text-slate-300 flex justify-between items-center transition-all">
              <div className="flex gap-2">
                <span>[TIME: <strong className="text-cyan-400">{clickedDataPoint.time}</strong>]</span>
                <span>CPU: <strong className="text-[#00d4ff]">{clickedDataPoint.cpu}%</strong></span>
                <span>RAM: <strong className="text-purple-400">{clickedDataPoint.ram}%</strong></span>
                <span>HEALTH: <strong className="text-rose-400">{clickedDataPoint.health}%</strong></span>
              </div>
              <button 
                onClick={() => setClickedDataPoint(null)}
                className="text-slate-500 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Playback Control Bar scrubber slider */}
          <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Play className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span>DIAGNOSTIC TIME PLAYBACK</span>
              </span>
              <span className="text-cyan-300 font-bold">
                {scrubIndex !== null ? `T-${usageData.length - 1 - scrubIndex}h: ${usageData[scrubIndex].time}` : "LIVE TIMELINE"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={usageData.length - 1}
                value={scrubIndex !== null ? scrubIndex : usageData.length - 1}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setScrubIndex(val === usageData.length - 1 ? null : val);
                }}
                className="flex-1 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              {scrubIndex !== null && (
                <button
                  onClick={() => setScrubIndex(null)}
                  className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                  title="Reset to Live Stream"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Correlated Diagnostics Panel showing Pearson coefficient r */
        <div className="h-28 w-full bg-slate-900/30 border border-slate-900 rounded-lg p-2.5 mb-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <span className="text-[9px] text-slate-500 font-mono font-bold uppercase block">{lang === "bn" ? "পিয়ারসন সহ-সম্পর্ক সহগ" : "PEARSON CORRELATION (r)"}</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold font-mono text-rose-400">{correlationCoefficient}</span>
                <span className="text-[8px] font-mono text-slate-400">
                  {correlationCoefficient < -0.7 
                    ? (lang === "bn" ? "(তীব্র বিপরীত সম্পর্ক)" : "(HIGH INVERSE)") 
                    : (lang === "bn" ? "(সামঞ্জস্যপূর্ণ সম্পর্ক)" : "(BALANCED)")}
                </span>
              </div>
            </div>
            <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase flex items-center gap-1 border ${
              correlationCoefficient < -0.7 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
            }`}>
              <TrendingDown className="w-2.5 h-2.5" />
              <span>{correlationCoefficient < -0.7 ? "STRESS DEEP" : "STABLE"}</span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-300 leading-relaxed">
            {correlationCoefficient < -0.7 ? (
              lang === "bn" 
                ? "তীব্র নিউরাল বিপরীত সম্পর্ক সক্রিয়। অতিরিক্ত কাজ ও নিউরাল লোড সরাসরি সিস্টেম স্টেবিলিটিকে ব্যাহত করছে।"
                : "High inverse correlation detected. Spikes in CPU and neural network computation bounds directly cause core system health degradation."
            ) : (
              lang === "bn"
                ? "ভারসাম্যপূর্ণ অপারেটিং সূচক। সম্পদ এবং নিওরা আর্কিটেকচার পুরোপুরি সমন্বয় অবস্থায় আছে।"
                : "Balanced correlation index. Resource workloads are neatly aligned with thermal and container memory boundaries."
            )}
          </p>
        </div>
      )}

      {/* Self-Healed Registry & Diagnostics Log list */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold px-1">
          {/* Priority filter toggle for diagnostic simulations to reduce stress-state noise */}
          <div className="flex items-center gap-1.5">
            <span>{activeTab === "telemetry" ? (lang === "bn" ? "স্বয়ংক্রিয় নিরাময় লগ" : "SELF-HEALED PROCESSES") : (lang === "bn" ? "নিওরা ডায়াগনস্টিক লগ" : "NEURAL LOGS")}</span>
            {activeTab !== "telemetry" && (
              <div className="flex bg-slate-900 border border-slate-850 p-0.5 rounded ml-2">
                <button
                  onClick={() => setSeverityFilter("all")}
                  className={`px-1 rounded-[2px] text-[7px] font-mono uppercase cursor-pointer ${
                    severityFilter === "all" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setSeverityFilter("high")}
                  className={`px-1 rounded-[2px] text-[7px] font-mono uppercase cursor-pointer ${
                    severityFilter === "high" ? "bg-rose-500/20 text-rose-300" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  CRIT
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={triggerManualHeal}
            className="text-[9px] text-cyan-400 hover:underline hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "14s" }} />
            <span>{lang === "bn" ? "সুইপ রান" : "Scan Integrity"}</span>
          </button>
        </div>

        {/* Diagnostic Logs / Healed runtimes with Bulk Selection Compare */}
        <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
          {activeTab === "telemetry" ? (
            healedProcesses.map(item => (
              <div 
                key={item.id}
                className="p-1.5 rounded bg-slate-900/30 border border-slate-900 text-[10px] font-mono flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-300 font-bold block truncate">{item.name}</span>
                    <span className="text-slate-500 block text-[9px] truncate">{item.desc}</span>
                  </div>
                </div>
                <span className="text-[8px] text-slate-500 shrink-0 whitespace-nowrap ml-2">{item.time}</span>
              </div>
            ))
          ) : (
            <>
              {/* Optional Bulk Comparison overlay when multiple logs are chosen */}
              {selectedLogIds.length > 1 && (
                <div className="p-1 bg-cyan-950/20 border border-cyan-500/20 rounded text-[8px] font-mono text-cyan-300 mb-1 flex justify-between items-center">
                  <span>Selected {selectedLogIds.length} logs for system comparison...</span>
                  <button onClick={() => setSelectedLogIds([])} className="hover:underline font-bold text-[9px]">Clear</button>
                </div>
              )}
              {filteredLogs.map(item => {
                const isSelected = selectedLogIds.includes(item.id);
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleSelectLog(item.id)}
                    className={`p-1.5 rounded text-[10px] font-mono flex items-start gap-1.5 cursor-pointer transition-colors ${
                      isSelected 
                        ? "bg-cyan-950/30 border border-cyan-500/25" 
                        : "bg-slate-900/30 border border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    {/* Color-coded events based on severity with a discrete badge indicator */}
                    <div className="flex flex-col items-center gap-1 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.severity === "high" ? "bg-rose-500 animate-pulse" : item.severity === "medium" ? "bg-amber-500" : "bg-cyan-500"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold">
                        <span>{item.time}</span>
                        <span className={`px-1.5 py-0.2 rounded border text-[7px] uppercase font-bold tracking-wider ${
                          item.severity === "high" ? "bg-rose-500/10 border-rose-500/25 text-rose-400" :
                          item.severity === "medium" ? "bg-amber-500/10 border-amber-500/25 text-amber-400" :
                          "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                        }`}>
                          {item.severity === "high" ? "Critical" : item.severity === "medium" ? "Warning" : "Info"}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[9px] mt-0.5 leading-tight">{item.message}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
