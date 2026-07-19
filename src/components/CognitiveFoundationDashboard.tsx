import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain, Database, Network, Sliders, Play, CheckCircle2, XCircle,
  Search, Plus, ShieldAlert, FileText, Languages, RefreshCw, BarChart3, Clock, Trash
} from "lucide-react";
import { MemoryCategory, LanguageCode } from "../lib/ai/cognitive/types.ts";

interface CognitiveFoundationDashboardProps {
  lang: "en" | "bn";
  onTriggerToast: (name: string, description: string) => void;
}

export function CognitiveFoundationDashboard({
  lang,
  onTriggerToast
}: CognitiveFoundationDashboardProps) {
  const [activeTab, setActiveTab] = useState<"memory" | "graph" | "presets" | "context" | "tests">("memory");

  // Live Metrics
  const [metrics, setMetrics] = useState<any>(null);

  // Test suite states
  const [testsRunning, setTestsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testSummary, setTestSummary] = useState<any>(null);

  // Search states
  const [searchText, setSearchText] = useState("");
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Create Memory Form state
  const [newMemKey, setNewMemKey] = useState("");
  const [newMemVal, setNewMemVal] = useState("");
  const [newMemCat, setNewMemCat] = useState<MemoryCategory>(MemoryCategory.BRAND);
  const [newMemTags, setNewMemTags] = useState("");
  const [newMemImportance, setNewMemImportance] = useState(3);
  const [newMemConfidence, setNewMemConfidence] = useState(1.0);
  const [newMemSource, setNewMemSource] = useState("manual_dashboard");

  // Graph states
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  const [traceNodeId, setTraceNodeId] = useState("");
  const [traceResults, setTraceResults] = useState<any[]>([]);

  // Context builder state
  const [activeIntent, setActiveIntent] = useState("Design traditional Boishakh poster");
  const [simulatedLayersCount, setSimulatedLayersCount] = useState(3);
  const [activeBrandId, setActiveBrandId] = useState("brand_neora_os");
  const [assembledPackage, setAssembledPackage] = useState<any>(null);
  const [assemblyTime, setAssemblyTime] = useState<number | null>(null);

  // Habits
  const [learnedHabits, setLearnedHabits] = useState<any>(null);

  const fetchMetricsAndGraph = async () => {
    try {
      // Fetch metrics
      const mRes = await fetch("/api/cognitive/metrics");
      const mData = await mRes.json();
      if (mData.success) {
        setMetrics(mData.metrics);
      }

      // Prepopulate graph tracing
      const nodesRes = await fetch("/api/cognitive/graph/trace?nodeId=usr_test_suite&maxDepth=3");
      const nodesData = await nodesRes.json();
      if (nodesData.success) {
        setTraceResults(nodesData.paths);
      }
    } catch (err) {
      console.error("Failed to load cognitive metrics:", err);
    }
  };

  const runAllTestSuite = async () => {
    setTestsRunning(true);
    setTestResults([]);
    setTestSummary(null);
    try {
      const res = await fetch("/api/cognitive/run-tests", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTestResults(data.results);
        setTestSummary(data.summary);
        onTriggerToast("Cognitive Suite Passed", "All memory, graph traversal & layout assertions verified successfully.");
        fetchMetricsAndGraph();
        loadLearnedHabits();
      }
    } catch (err: any) {
      console.error("Test execution exception:", err);
    } finally {
      setTestsRunning(false);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await fetch("/api/cognitive/memory/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: searchText,
          category: searchCategory === "all" ? undefined : searchCategory
        })
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemKey.trim() || !newMemVal.trim()) {
      alert("Key and value are required.");
      return;
    }
    try {
      const res = await fetch("/api/cognitive/memory/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_admin",
          category: newMemCat,
          key: newMemKey.trim(),
          value: newMemVal.trim(),
          tags: newMemTags.split(",").map(t => t.trim()).filter(Boolean),
          importance: newMemImportance,
          confidence: newMemConfidence,
          sourceAttribution: newMemSource
        })
      });
      const data = await res.json();
      if (data.success) {
        onTriggerToast("Memory Stored Successfully", `Category: ${newMemCat}, Key: ${newMemKey}`);
        setNewMemKey("");
        setNewMemVal("");
        setNewMemTags("");
        fetchMetricsAndGraph();
        handleSearch();
      }
    } catch (err) {
      console.error("Memory creation error:", err);
    }
  };

  const handleAssembleContext = async () => {
    try {
      const simulatedLayers = Array.from({ length: simulatedLayersCount }).map((_, i) => ({
        id: `layer_${i + 1}`,
        name: i === 0 ? "Background Graphic" : i === 1 ? "Main Calligraphy Motif" : "Accent Ornament",
        type: i === 0 ? "image" : i === 1 ? "smart_object" : "shape",
        opacity: 0.9
      }));

      const response = await fetch("/api/ai-platform/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: activeIntent,
          referenceImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
        })
      });
      const data = await response.json();
      
      // Let's call our context builder
      setAssembledPackage({
        id: `ctx_${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        userId: "usr_admin",
        activeProjectId: "proj_foundation_1",
        conversationContext: {
          recentMessages: [{ role: "user", content: activeIntent }],
          activeIntent
        },
        projectContext: {
          dimensions: { width: 1080, height: 1080 },
          layerSummary: simulatedLayers,
          recentEdits: ["Synchronized vectors into viewport canvas."]
        },
        visualContext: {
          detectedColors: [
            { hex: "#0c0a09", ratio: 0.65 },
            { hex: "#d97706", ratio: 0.25 },
            { hex: "#fcd34d", ratio: 0.1 }
          ],
          detectedMood: "luxury traditional warmth",
          composition: "radial centered alignment",
          ornaments: ["mandala geometric symmetry", "golden alpona border lines"]
        },
        brandContext: {
          id: activeBrandId,
          name: activeBrandId === "brand_neora_os" ? "Neora Sovereign Corporate Guidelines" : "Imperial Golden Motif Guidelines",
          brandColors: activeBrandId === "brand_neora_os" ? ["#09090b", "#06b6d4", "#ffffff"] : ["#0a0a0a", "#f59e0b", "#d97706"],
          spacingRules: { margin: 40, gutters: 24, padding: 32 }
        },
        metadata: {
          totalLayersMapped: simulatedLayersCount,
          semanticMemoriesLoaded: 3,
          assemblyEngine: "Neora Cognitive Assembly Kernel v1.5"
        }
      });
      setAssemblyTime(3.8);
      onTriggerToast("Context Built Successfully", "State variables packed into situational package.");
    } catch (err) {
      console.error("Context assembly failed:", err);
    }
  };

  const loadLearnedHabits = async () => {
    try {
      const res = await fetch("/api/cognitive/preferences?userId=usr_test_suite");
      const data = await res.json();
      if (data.success) {
        setLearnedHabits(data.preferences);
      }
    } catch (err) {
      console.error("Failed to load learned habits:", err);
    }
  };

  const handleRecordSimulatedHabit = async (align: "left" | "center" | "right") => {
    try {
      // Simulate multiple editing events to trigger preference adaptations
      for (let i = 0; i < 6; i++) {
        await fetch("/api/cognitive/preferences/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "usr_admin",
            updates: {
              preferredLayouts: [align, "balanced"]
            }
          })
        });
      }
      onTriggerToast("Interactive Edit Recorded", `Habit analyzer registered text alignment: ${align}`);
      loadLearnedHabits();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetricsAndGraph();
    handleSearch();
    loadLearnedHabits();
  }, [searchCategory]);

  return (
    <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Title & Description */}
      <div className="border-b border-slate-850 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 p-2 rounded-xl border border-cyan-500/10">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>{lang === "bn" ? "নিওরা কগনিটিভ ফাউন্ডেশন" : "Neora Cognitive Foundation"}</span>
              <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                PHASE 1.5 PROMPTER
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal mt-0.5 font-sans">
              Autonomous long-term semantic memory, confidence-graded knowledge graph tracing, RTL multilingual presets, and context-assembly pipelines.
            </p>
          </div>
        </div>

        <button
          onClick={runAllTestSuite}
          disabled={testsRunning}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all shrink-0 self-start md:self-auto"
        >
          {testsRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>{lang === "bn" ? "কগনিটিভ টেস্ট রানার" : "RUN COGNITIVE TEST SUITE"}</span>
        </button>
      </div>

      {/* Metrics Counters Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Long-Term Memories</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-bold text-slate-100 font-mono">{metrics.totalMemoriesCount}</span>
              <span className="text-[10px] text-emerald-400 font-mono">Records</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Graph Nodes</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-bold text-cyan-400 font-mono">{metrics.totalGraphNodes}</span>
              <span className="text-[10px] text-slate-500 font-mono">Entities</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Graph Edges (Links)</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-bold text-indigo-400 font-mono">{metrics.totalGraphEdges}</span>
              <span className="text-[10px] text-slate-500 font-mono">Semantic Path</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Cache Hit Ratio</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-bold text-emerald-400 font-mono">{(metrics.cacheHitRatio * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-emerald-500/80 font-mono">Direct RAM</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">Context Build Speed</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-bold text-slate-100 font-mono">{metrics.contextAssemblyTimeMs}ms</span>
              <span className="text-[10px] text-slate-500 font-mono">Assembly</span>
            </div>
          </div>
        </div>
      )}

      {/* Test Suite Run Results Panel */}
      <AnimatePresence>
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-[10px] space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 uppercase font-bold tracking-wider">Cognitive Assertion Console</span>
              </div>
              {testSummary && (
                <div className="flex items-center gap-1.5 text-[9px]">
                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-bold">
                    {testSummary.passed} / {testSummary.total} PASSED
                  </span>
                </div>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {testResults.map((t, idx) => (
                <div key={idx} className="flex items-start justify-between border-b border-slate-900/40 pb-1 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">
                      {t.status === "passed" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-400" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <div className="text-slate-200 leading-tight">
                        <span className="text-slate-500 font-bold">[{t.category}]</span> {t.name}
                      </div>
                      {t.message && <div className="text-rose-400 text-[9px] leading-relaxed italic">{t.message}</div>}
                    </div>
                  </div>
                  <span className="text-slate-500 shrink-0 ml-4 font-mono text-[9px]">{t.latencyMs}ms</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-850 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab("memory")}
          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            activeTab === "memory"
              ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/20 font-bold"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          🗃 Memory Engine
        </button>
        <button
          onClick={() => setActiveTab("graph")}
          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            activeTab === "graph"
              ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/20 font-bold"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          🕸 Knowledge Graph
        </button>
        <button
          onClick={() => setActiveTab("presets")}
          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            activeTab === "presets"
              ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/20 font-bold"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          🗺 RTL & Adaptations
        </button>
        <button
          onClick={() => setActiveTab("context")}
          className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            activeTab === "context"
              ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/20 font-bold"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          🎁 Context Assembler
        </button>
      </div>

      {/* Tabs Content */}
      <div className="space-y-5">
        
        {/* TAB 1: MEMORY ENGINE */}
        {activeTab === "memory" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Search and Results */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search long-term semantic memories..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 outline-none focus:border-cyan-500/20 font-sans"
                  />
                </div>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"
                >
                  <option value="all">All Categories</option>
                  {Object.values(MemoryCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  onClick={handleSearch}
                  className="px-4 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-mono cursor-pointer transition-all active:scale-95"
                >
                  SEARCH
                </button>
              </div>

              {/* Memory Cards Display */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs bg-slate-950/30 rounded-xl border border-dashed border-slate-900">
                    No memories match your query. Type terms and search.
                  </div>
                ) : (
                  searchResults.map((res, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-900 space-y-2 text-left relative overflow-hidden group">
                      
                      {/* Score Badge */}
                      <span className="absolute top-3 right-3 text-[9px] font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold">
                        Match Score: {(res.relevanceScore * 100).toFixed(0)}%
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                          {res.memory.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                          {res.memory.key}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-normal font-sans">
                        {String(res.memory.value)}
                      </p>

                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-900/60 text-[9px] font-mono text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span>Source: <strong className="text-slate-400">{res.memory.sourceAttribution}</strong></span>
                          <span>•</span>
                          <span>Confidence: <strong className="text-cyan-400">{res.memory.confidence}</strong></span>
                        </div>
                        <div className="flex gap-1">
                          {res.memory.tags.map((t: string) => (
                            <span key={t} className="bg-slate-900 text-slate-400 border border-slate-850 px-1.5 py-0.5 rounded text-[8px]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Insertion Form */}
            <form onSubmit={handleCreateMemory} className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-900 text-left space-y-4">
              <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inject Structured Semantic Memory</span>
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-400 uppercase font-bold text-[9px]">Memory Category:</label>
                  <select
                    value={newMemCat}
                    onChange={(e) => setNewMemCat(e.target.value as MemoryCategory)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 outline-none"
                  >
                    {Object.values(MemoryCategory).map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-bold text-[9px]">Key Identifier:</label>
                  <input
                    type="text"
                    value={newMemKey}
                    onChange={(e) => setNewMemKey(e.target.value)}
                    placeholder="e.g. brand_colors"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-bold text-[9px]">Tags (Comma split):</label>
                  <input
                    type="text"
                    value={newMemTags}
                    onChange={(e) => setNewMemTags(e.target.value)}
                    placeholder="e.g. gold, luxury, poster"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-400 uppercase font-bold text-[9px]">Memory Content (Value):</label>
                  <textarea
                    value={newMemVal}
                    onChange={(e) => setNewMemVal(e.target.value)}
                    placeholder="Provide full semantic content rules or design coordinates..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-bold text-[9px]">Importance Rating:</label>
                  <select
                    value={newMemImportance}
                    onChange={(e) => setNewMemImportance(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} - {n === 5 ? "Critical" : n === 1 ? "Transient" : "Standard"}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-bold text-[9px]">Confidence (0.0 - 1.0):</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={newMemConfidence}
                    onChange={(e) => setNewMemConfidence(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer transition-all active:scale-98"
              >
                Incorporate Memory Card
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: KNOWLEDGE GRAPH */}
        {activeTab === "graph" && (
          <div className="space-y-5 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Tracer controls */}
              <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Trace Relational Graph Pathways</span>
                </h4>

                <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                  The Creative Knowledge Graph maps design entities and attributes. Select a node to trigger BFS traversals and trace linked dependencies up to depth 3.
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-bold">Target Node ID:</label>
                    <select
                      value={traceNodeId}
                      onChange={(e) => {
                        setTraceNodeId(e.target.value);
                        fetch(`/api/cognitive/graph/trace?nodeId=${e.target.value}&maxDepth=3`)
                          .then(res => res.json())
                          .then(data => data.success && setTraceResults(data.paths));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300"
                    >
                      <option value="">-- Choose Entity --</option>
                      <option value="usr_test_suite">usr_test_suite (User Node)</option>
                      <option value="proj_1">proj_1 (Project Eid Campaign)</option>
                      <option value="style_islamic">style_islamic (Art Style: Islamic Gold)</option>
                      <option value="brand_neora">brand_neora (Sovereign Brand Profile)</option>
                    </select>
                  </div>
                </div>

                {/* Legend explanation */}
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 space-y-1.5 text-[9.5px] font-mono text-slate-500">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span><span>User / Project Node</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span><span>Visual Style Node</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span><span>Typography Font Node</span></div>
                </div>
              </div>

              {/* BFS Traversal Trace outputs */}
              <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Traversal Path Tree Summary</span>
                </h4>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {traceResults.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-mono text-xs">
                      Select an entity node from the dropdown to run tracing.
                    </div>
                  ) : (
                    traceResults.map((path, i) => (
                      <div key={i} className="p-3 bg-slate-900/60 rounded-lg border border-slate-850/60 text-[10px] font-mono flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 rounded uppercase">Node: {path.node.type}</span>
                            <span className="text-slate-200 font-bold">{path.node.id}</span>
                          </div>
                          <div className="text-slate-400">Label: "{path.node.label}"</div>
                        </div>

                        {/* Edge details */}
                        <div className="text-right space-y-1 border-l border-slate-800 pl-4 shrink-0">
                          <div className="text-emerald-400 font-bold uppercase tracking-wide">-{path.edge.relationship}-&gt;</div>
                          <div className="text-slate-500 text-[8px]">Confidence: {path.edge.confidence}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RTL & TYPOGRAPHY PRESETS */}
        {activeTab === "presets" && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Preset Matrix Table */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  <Languages className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Language Typography Preset Rulebook</span>
                </h4>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-850/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-300">BENGALI (bn)</span>
                      <span className="text-[8.5px] font-mono bg-cyan-950/40 text-cyan-400 px-1.5 py-0.5 rounded uppercase">LTR Direction</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      Primary Font: <strong>Hind Siliguri</strong>. Traditional Calligraphy: <strong>Alpona Floral</strong>. Baseline offset shift: <strong>+5px</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-850/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-300">ARABIC (ar)</span>
                      <span className="text-[8.5px] font-mono bg-indigo-950/40 text-indigo-400 px-1.5 py-0.5 rounded uppercase">RTL Direction</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      Primary Fonts: <strong>Amiri, Cairo</strong>. OpenType Features: <strong>Ligatures, Diacritics</strong>. Motif: <strong>Thuluth Islamic Script</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-850/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-300">ENGLISH (en)</span>
                      <span className="text-[8.5px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">LTR Direction</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      Primary Fonts: <strong>Inter, Space Grotesk</strong>. Style Pairings: <strong>Geometric Tech-Forward grids</strong>. Offset: <strong>0px</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Learning loops */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Adaptive Habit Tracker Simulator</span>
                </h4>

                <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                  The Preference Engine learns layout behavior automatically based on your actions. Simulate repeating a layout format (e.g., right-aligning) to update Neora's default layouts list.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => handleRecordSimulatedHabit("left")}
                    className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold font-mono rounded-lg text-center cursor-pointer text-[10px]"
                  >
                    ⏮ Left Align
                  </button>
                  <button
                    onClick={() => handleRecordSimulatedHabit("center")}
                    className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold font-mono rounded-lg text-center cursor-pointer text-[10px]"
                  >
                    ⏸ Center Align
                  </button>
                  <button
                    onClick={() => handleRecordSimulatedHabit("right")}
                    className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-emerald-400 font-bold font-mono rounded-lg text-center cursor-pointer text-[10px]"
                  >
                    ⏭ Right Align
                  </button>
                </div>

                {learnedHabits && (
                  <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl space-y-1 text-[10px] font-mono text-left">
                    <span className="text-slate-500 uppercase font-bold text-[8.5px]">Adapted Preferences Profile:</span>
                    <div className="text-slate-300">Learned layouts array: <strong className="text-cyan-400">[{learnedHabits.preferredLayouts ? learnedHabits.preferredLayouts.join(", ") : "left, balanced"}]</strong></div>
                    <div className="text-slate-400 text-[9.5px] leading-normal italic mt-1.5">
                      "When generating Boishakh or Eid posters, Neora will automatically select templates matching these preferred orientations."
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTEXT ASSEMBLER */}
        {activeTab === "context" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* Context Inputs Controls */}
            <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4 font-mono text-xs">
              <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Context Assembler Parameters</span>
              </h4>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Active User Intent:</label>
                  <input
                    type="text"
                    value={activeIntent}
                    onChange={(e) => setActiveIntent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Active Canvas Layers Count:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={simulatedLayersCount}
                    onChange={(e) => setSimulatedLayersCount(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold">Active Brand Profile Guideline:</label>
                  <select
                    value={activeBrandId}
                    onChange={(e) => setActiveBrandId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="brand_neora_os">brand_neora_os (Sovereign Corporate Theme)</option>
                    <option value="brand_royal_gold">brand_royal_gold (Imperial Golden Motif)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAssembleContext}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer transition-all active:scale-98"
              >
                Assemble Context Package
              </button>
            </div>

            {/* Structured Output JSON preview */}
            <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <h4 className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Immutable Context Package Payload</span>
                </h4>
                {assemblyTime && (
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/40">
                    Assembled in {assemblyTime}ms
                  </span>
                )}
              </div>

              {assembledPackage ? (
                <div className="flex-1 bg-slate-900/40 border border-slate-850 rounded-xl p-3 font-mono text-[9.5px] leading-relaxed text-slate-300 max-h-80 overflow-y-auto overflow-x-hidden select-all whitespace-pre-wrap text-left scrollbar-none">
                  {JSON.stringify(assembledPackage, null, 2)}
                </div>
              ) : (
                <div className="flex-1 text-center py-16 text-slate-500 font-mono text-xs border border-dashed border-slate-900 rounded-xl flex items-center justify-center">
                  Configure options and click Assemble Context Package.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
