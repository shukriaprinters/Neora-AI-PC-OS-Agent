import React, { useState, useEffect } from "react";
import { 
  Search, Database, Network, Library, Info, HelpCircle, Check, Copy, Sparkles, 
  RefreshCw, Layers, Sliders, Play, Plus, BookOpen, AlertCircle, FileText, 
  ShieldCheck, BadgeCheck, FileImage, Palette, Type, Compass, Award, Terminal, 
  ExternalLink, ChevronRight, Activity, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NeoraDesignKnowledgePlatform, CreativeAsset, FontAsset, CalligraphyStyle, DesignStyle, BrandKit, DesignTemplate, DesignToken, ReusableComponent, PrintSpecification, TrendReport, KnowledgeNode, KnowledgeEdge } from "../../lib/ai/NeoraDesignKnowledgePlatform";
import { NeoraIntelligentDesignEditor, NIDEWorkspace, StylePreset } from "../../lib/ai/NeoraIntelligentDesignEditor";

interface NDKASIPDashboardProps {
  lang: "en" | "bn";
  activeWorkspace: NIDEWorkspace | null;
  onAddAssetToCanvas?: (url: string) => void;
  onApplyStylePreset?: (preset: StylePreset) => void;
  onAddSystemLog?: (msg: string) => void;
}

export const NeoraDesignKnowledgeAssetStyleIntelligenceDashboard: React.FC<NDKASIPDashboardProps> = ({
  lang,
  activeWorkspace,
  onAddAssetToCanvas,
  onApplyStylePreset,
  onAddSystemLog
}) => {
  const platform = NeoraDesignKnowledgePlatform.getInstance();
  const editor = NeoraIntelligentDesignEditor.getInstance();

  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<"search" | "graph" | "match" | "calligraphy" | "research" | "metrics">("search");
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [presetFilter, setPresetFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [searchResults, setSearchResults] = useState(platform.searchKnowledge(""));

  // Interactive Graph States
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ndkasip_platform_root");
  const [graphData, setGraphData] = useState(platform.getGraphData());

  // Recommendation states
  const [workspaceRecs, setWorkspaceRecs] = useState<any>(null);

  // Industry Research states
  const [researchIndustry, setResearchIndustry] = useState("Luxury");
  const [researchReport, setResearchReport] = useState<TrendReport>(platform.getResearchReport("Luxury"));

  // Test Harness States
  const [testResults, setTestResults] = useState<Array<{ testName: string; passed: boolean; message: string }>>([]);
  const [isTesting, setIsTesting] = useState(false);

  // Import / WebSocket simulator logs
  const [wsLogs, setWsLogs] = useState<Array<{ step: string; progress: number; type: string }>>([]);
  const [isWSPipelineActive, setIsWSPipelineActive] = useState(false);
  const [activeImportPack, setActiveImportPack] = useState("Dubai Luxury Pack");

  // General Notification
  const [notif, setNotif] = useState<string | null>(null);

  // Load recommendations whenever active workspace change
  useEffect(() => {
    if (activeWorkspace) {
      const recs = platform.recommendDesignCombo(activeWorkspace);
      setWorkspaceRecs(recs);
    } else {
      // Create a fallback workspace context
      const tempWs = editor.getWorkspace();
      if (tempWs) {
        const recs = platform.recommendDesignCombo(tempWs);
        setWorkspaceRecs(recs);
      }
    }
  }, [activeWorkspace]);

  // Execute Search
  const handleSearch = (query: string, type = typeFilter, preset = presetFilter, language = langFilter) => {
    setSearchQuery(query);
    const filter: any = {};
    if (type !== "all") filter.type = type;
    if (preset !== "all") filter.preset = preset;
    if (language !== "all") filter.language = language;
    
    const res = platform.searchKnowledge(query, filter);
    setSearchResults(res);
  };

  // Copy helper
  const triggerCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setNotif(`Copied ${label}: ${val}`);
    setTimeout(() => setNotif(null), 2000);
    if (onAddSystemLog) onAddSystemLog(`Copied ${label} to system clipboard.`);
  };

  // Trigger WebSocket & Import simulation
  const handleImportPack = async () => {
    setIsWSPipelineActive(true);
    setWsLogs([]);
    
    const wsCallback = (data: { step: string; progress: number; type: string }) => {
      setWsLogs((prev) => [...prev, data]);
    };
    platform.subscribeWS(wsCallback);

    await platform.simulateWSEventsPipeline(activeImportPack, "import");

    // Real data injection matching selection
    let sampleAssets: CreativeAsset[] = [];
    if (activeImportPack === "Dubai Luxury Pack") {
      sampleAssets = [
        {
          id: "ast_dubai_mesh_01",
          name: "Burj Arabesque Golden Crest",
          type: "pattern",
          category: "Luxury Packs",
          tags: ["Luxury", "Geometric", "Gold", "Arabesque"],
          url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=500&q=80",
          isEditable: true,
          metadata: { strokeDensity: 0.90, license: "Enterprise-Proprietary", culturalContext: "Contemporary Arabic luxury framing systems." }
        },
        {
          id: "ast_dubai_gold_brush",
          name: "Heavy Arabic Ink Swash",
          type: "brush",
          category: "Luxury Packs",
          tags: ["Brush", "Arabic", "Gold", "Luxury"],
          url: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=500&q=80",
          isEditable: true,
          metadata: { strokeDensity: 0.85, license: "CC-BY-4.0", culturalContext: "Dynamic hand-crafted lettering stroke." }
        }
      ];
    } else if (activeImportPack === "Sindoor Festival Pack") {
      sampleAssets = [
        {
          id: "ast_sindoor_kolka",
          name: "Sindoor Red Bridal Kolka Motif",
          type: "pattern",
          category: "Festival Packs",
          tags: ["Bengali", "Traditional", "Sindoor", "Crimson", "Kolka"],
          url: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=500&q=80",
          isEditable: true,
          metadata: { strokeDensity: 0.78, license: "CC0", culturalContext: "Symmetrical traditional folk ornament painted on brides' foreheads." }
        }
      ];
    } else {
      sampleAssets = [
        {
          id: "ast_cyber_glow_qr",
          name: "Neon Glow Cyber QR Frame",
          type: "qr_template",
          category: "Modern Tech Packs",
          tags: ["Futuristic", "Minimalist", "Cyan", "QR"],
          url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80",
          isEditable: false,
          metadata: { license: "CC-BY-4.0", culturalContext: "Futuristic digital frame wrapping transactional codes." }
        }
      ];
    }

    const report = platform.importAssetPack(activeImportPack, sampleAssets);
    platform.unsubscribeWS(wsCallback);
    setIsWSPipelineActive(false);

    // Refresh views
    setGraphData(platform.getGraphData());
    handleSearch(searchQuery);
    
    if (onAddSystemLog) onAddSystemLog(report.message);
    setNotif(`Imported ${report.importedCount} assets successfully!`);
    setTimeout(() => setNotif(null), 3000);
  };

  // Run Regression Tests
  const handleRunTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const results = platform.runNDKASIPTests();
    setTestResults(results);
    setIsTesting(false);
    if (onAddSystemLog) onAddSystemLog("Executed NDKASIP Platform Regression Tests successfully.");
  };

  // Dynamic Graph node interactions
  const activeNode = graphData.nodes.find(n => n.id === selectedNodeId) || graphData.nodes[0];
  const connectedEdges = graphData.edges.filter(e => e.source === selectedNodeId || e.target === selectedNodeId);
  const connectedNodeIds = Array.from(new Set([
    ...connectedEdges.map(e => e.source === selectedNodeId ? e.target : e.source)
  ])).filter(id => id !== selectedNodeId);
  const connectedNodes = graphData.nodes.filter(n => connectedNodeIds.includes(n.id));

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 border-l border-slate-900 overflow-hidden font-sans">
      
      {/* HEADER BAR */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Library className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-purple-400">MEMORY &amp; AESTHETICS</span>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
              NDKASIP Platform
              <span className="text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded uppercase">Active v3.1</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-mono text-slate-500">KNOWLEDGE SEEDING</span>
            <span className="text-[10px] font-mono text-slate-300 font-bold">{graphData.nodes.length} nodes • {graphData.edges.length} connections</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB NAVIGATION */}
      <div className="px-2 bg-slate-950 border-b border-slate-900 flex overflow-x-auto scrollbar-none shrink-0 gap-1">
        {[
          { id: "search", label: lang === "bn" ? "অ্যাসেট লাইব্রেরি" : "Assets & Search", icon: Search },
          { id: "graph", label: lang === "bn" ? "নলেজ গ্রাফ" : "Knowledge Graph", icon: Network },
          { id: "match", label: lang === "bn" ? "স্টাইল ম্যাচ" : "Aesthetic Matcher", icon: Palette },
          { id: "calligraphy", label: lang === "bn" ? "ক্যালিগ্রাফি ও প্রিন্ট" : "Craft & Print", icon: BookOpen },
          { id: "research", label: lang === "bn" ? "ট্রেন্ড রিসার্চ" : "Trend Research", icon: FileText },
          { id: "metrics", label: lang === "bn" ? "অবজারভেবিলিটি ও টেস্ট" : "Metrics & Tests", icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "border-purple-500 text-purple-400 bg-purple-500/5 font-semibold" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-4">
        
        {/* TOAST NOTIFICATION CONTAINER */}
        <AnimatePresence>
          {notif && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-mono font-bold shadow-xl border border-emerald-400 flex items-center gap-2 z-50 absolute top-20 right-4"
            >
              <BadgeCheck className="w-4 h-4 shrink-0" />
              {notif}
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: UNIFIED SEARCH AND ASSET LIBRARY */}
        {activeSubTab === "search" && (
          <div className="space-y-4">
            
            {/* Search inputs */}
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Search Engine Configuration</span>
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Fuzzy Index Active</span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Query memory by style/mood/concept (e.g., 'traditional gold', 'geometric islamic')..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Asset Category</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); handleSearch(searchQuery, e.target.value, presetFilter, langFilter); }}
                    className="w-full bg-slate-950 border border-slate-800 text-[10px] rounded-lg px-2 py-1.5 focus:outline-none text-slate-300"
                  >
                    <option value="all">All Types</option>
                    <option value="pattern">Patterns</option>
                    <option value="border">Borders</option>
                    <option value="texture">Textures</option>
                    <option value="brush">Brushes</option>
                    <option value="mockup">Mockups</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Design Preset</label>
                  <select
                    value={presetFilter}
                    onChange={(e) => { setPresetFilter(e.target.value); handleSearch(searchQuery, typeFilter, e.target.value, langFilter); }}
                    className="w-full bg-slate-950 border border-slate-800 text-[10px] rounded-lg px-2 py-1.5 focus:outline-none text-slate-300"
                  >
                    <option value="all">All Presets</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Islamic">Islamic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-1">Language</label>
                  <select
                    value={langFilter}
                    onChange={(e) => { setLangFilter(e.target.value); handleSearch(searchQuery, typeFilter, presetFilter, e.target.value); }}
                    className="w-full bg-slate-950 border border-slate-800 text-[10px] rounded-lg px-2 py-1.5 focus:outline-none text-slate-300"
                  >
                    <option value="all">All Languages</option>
                    <option value="Bangla">Bangla</option>
                    <option value="English">English</option>
                    <option value="Arabic">Arabic</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick action: Sync & Import Pack */}
            <div className="bg-gradient-to-r from-purple-950/40 to-slate-950 border border-purple-900/30 p-3.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">Sync &amp; External Integrations</span>
                <p className="text-[11px] text-slate-400">Import specialized design vector collections from Neora Cloud Hub directly into your workspace context memory.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={activeImportPack}
                  onChange={(e) => setActiveImportPack(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-[10px] rounded-lg px-2 py-1.5 focus:outline-none text-slate-300"
                >
                  <option value="Dubai Luxury Pack">Dubai Luxury Pack</option>
                  <option value="Sindoor Festival Pack">Sindoor Festival Pack</option>
                  <option value="Tokyo Cyberpunk Pack">Tokyo Cyberpunk Pack</option>
                </select>
                <button
                  onClick={handleImportPack}
                  disabled={isWSPipelineActive}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isWSPipelineActive ? "animate-spin" : ""}`} />
                  {isWSPipelineActive ? "Syncing..." : "Sync Pack"}
                </button>
              </div>
            </div>

            {/* WebSockets Simulation Panel during active sync */}
            <AnimatePresence>
              {isWSPipelineActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-inner"
                >
                  <div className="p-3 bg-slate-900/80 border-b border-slate-850 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      Live WebSocket Sync Logs
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Encrypted SSL/WS Feed</span>
                  </div>
                  <div className="p-3 font-mono text-[9px] text-slate-400 space-y-1 bg-slate-950/80 max-h-40 overflow-y-auto">
                    {wsLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-purple-500">[{log.progress}%]</span>
                        <span className="text-slate-300">{log.step}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RESULTS VIEW */}
            <div className="space-y-4">
              
              {/* Relevance block */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Search Matches</span>
                <span className="text-[9px] font-mono text-slate-400">Relevance Confidence: <strong className="text-purple-400">{searchResults.relevanceScore}%</strong></span>
              </div>
              
              <div className="text-[11px] text-slate-400 px-1 italic">
                {searchResults.rationale}
              </div>

              {/* ASSET ITEMS GRID */}
              {searchResults.assets.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase block tracking-wider px-1">Smart Vector Assets ({searchResults.assets.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults.assets.map((as) => (
                      <div key={as.id} className="p-3 bg-slate-900 border border-slate-850 rounded-2xl flex gap-3 hover:border-purple-500/20 transition-all group">
                        <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800 relative">
                          <img src={as.url} alt={as.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[7px] font-mono px-1 rounded uppercase text-slate-400">{as.type}</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-200 truncate">{as.name}</h4>
                            </div>
                            <span className="block text-[8px] font-mono text-purple-400 mt-0.5">{as.category}</span>
                            {as.metadata.culturalContext && (
                              <p className="text-[9px] text-slate-500 leading-tight mt-1 truncate-3-lines">{as.metadata.culturalContext}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-850">
                            <span className="text-[8px] font-mono text-slate-500 truncate">License: {as.metadata.license}</span>
                            {onAddAssetToCanvas && (
                              <button
                                onClick={() => {
                                  onAddAssetToCanvas(as.url);
                                  if (onAddSystemLog) onAddSystemLog(`Placed asset "${as.name}" onto the active editor canvas.`);
                                  setNotif(`Placed "${as.name}"!`);
                                  setTimeout(() => setNotif(null), 2000);
                                }}
                                className="bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer transition-all"
                              >
                                Place on Canvas
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FONT ITEMS LIST */}
              {searchResults.fonts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase block tracking-wider px-1">Curated Typography Packs ({searchResults.fonts.length})</span>
                  <div className="space-y-2">
                    {searchResults.fonts.map((f) => (
                      <div key={f.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-purple-500/15 transition-all">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-200">{f.name}</span>
                            <span className="text-[8px] font-mono bg-slate-950 text-indigo-400 px-1.5 py-0.2 rounded">{f.language}</span>
                            <span className="text-[8px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.2 rounded">{f.category}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {f.vibe.map((v) => (
                              <span key={v} className="text-[8px] font-mono border border-slate-800 text-slate-400 px-1 rounded">{v}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-850 justify-between">
                          <div className="text-right">
                            <span className="block text-[8px] font-mono text-slate-500">RECOMMENDED LEADING / TRACKING</span>
                            <span className="text-[9px] font-mono text-slate-300">{f.rules.recommendedLeading}em / {f.rules.maxTracking}em</span>
                          </div>
                          <button
                            onClick={() => triggerCopy(f.family, "Font Family")}
                            className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-[9px] font-mono px-2 py-1 rounded border border-slate-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Family
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEMPLATE ITEMS */}
              {searchResults.templates.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase block tracking-wider px-1">Structural Templates ({searchResults.templates.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {searchResults.templates.map((tmp) => (
                      <div key={tmp.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-[11px] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block">{tmp.category}</span>
                            <h4 className="font-bold text-slate-200 mt-0.5 leading-snug">{tmp.name}</h4>
                          </div>
                          <span className="text-[8px] font-mono bg-slate-950 text-slate-500 px-1.5 rounded">{tmp.dimensions.aspect}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 bg-slate-950 p-2 rounded-lg">
                          <span>Canvas Area: {tmp.dimensions.width} x {tmp.dimensions.height}px</span>
                          <span className="text-indigo-400">Default: {tmp.defaultLayersCount} layers</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {tmp.tags.map((t) => (
                            <span key={t} className="text-[8px] font-mono text-slate-400 bg-slate-950 px-1 rounded">#{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: SEMANTIC KNOWLEDGE GRAPH */}
        {activeSubTab === "graph" && (
          <div className="space-y-4">
            
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-2">
              <h3 className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                <Network className="w-4 h-4" />
                Graph Navigation Workspace
              </h3>
              <p className="text-[11px] text-slate-400">
                Click on any node to traverse its semantic relationships. Discover pairing patterns, licensing clearance, and cultural alignment parameters recursively.
              </p>
            </div>

            {/* TWO COLUMN GRID: LEFT SELECTOR / RELATIONSHIPS, RIGHT PREVIEW DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* LEFT GRAPH TREE EXPANSION */}
              <div className="md:col-span-2 space-y-4 bg-slate-900 border border-slate-850 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Active Node Core</span>
                  <span className="text-[9px] font-mono text-slate-500">Showing Neighbor Connections</span>
                </div>

                {/* CURRENT NODE BIG BADGE */}
                <div className="p-4 bg-gradient-to-br from-purple-950/40 to-indigo-950/20 border border-purple-500/25 rounded-2xl flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-400/20 flex items-center justify-center text-purple-300">
                      <Database className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <span className="block text-[8px] font-mono text-purple-400 uppercase tracking-widest">{activeNode?.type || "Rule"} Node</span>
                      <h3 className="text-sm font-bold text-slate-100">{activeNode?.label || "Platform Base"}</h3>
                    </div>
                  </div>
                  {activeNode?.id !== "ndkasip_platform_root" && (
                    <button
                      onClick={() => setSelectedNodeId("ndkasip_platform_root")}
                      className="text-[9px] font-mono text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 px-2.5 py-1 rounded bg-slate-950 cursor-pointer"
                    >
                      Reset Root
                    </button>
                  )}
                </div>

                {/* DYNAMIC RELATIONSHIP EDGES */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Connected Graph Neighbours ({connectedNodes.length})</span>
                  
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {connectedNodes.map((neighbor) => {
                      // find edge relationship
                      const edge = connectedEdges.find(e => (e.source === neighbor.id && e.target === activeNode.id) || (e.source === activeNode.id && e.target === neighbor.id));
                      const rel = edge ? edge.relationship.replace(/_/g, " ") : "pairs well with";

                      return (
                        <div
                          key={neighbor.id}
                          onClick={() => setSelectedNodeId(neighbor.id)}
                          className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-purple-500/20 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ChevronRight className="w-4 h-4 text-purple-500 shrink-0 group-hover:translate-x-1 transition-all" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-200 truncate">{neighbor.label}</h4>
                              <span className="text-[8px] font-mono text-slate-500 uppercase block">{neighbor.type} Node</span>
                            </div>
                          </div>

                          <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider">
                            {rel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RIGHT GRAPH NODE DETAIL INSPECTOR */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      Node Parameters
                    </span>
                    <span className="text-[9px] font-mono bg-slate-950 text-slate-500 px-1.5 py-0.2 rounded uppercase">Live</span>
                  </div>

                  {/* Properties table */}
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-mono text-slate-500">NODE ID UNIQUE</span>
                      <code className="block text-[9px] font-mono bg-slate-950 p-2 rounded text-indigo-400 break-all">{activeNode?.id}</code>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8px] font-mono text-slate-500">SEMANTIC CLASSIFICATION</span>
                      <span className="block text-xs font-bold text-slate-200 font-mono uppercase">{activeNode?.type}</span>
                    </div>

                    <div className="space-y-2 border-t border-slate-850 pt-2">
                      <span className="block text-[8px] font-mono text-slate-500">METADATA FIELDS</span>
                      
                      <div className="space-y-1.5">
                        {activeNode?.properties && Object.entries(activeNode.properties).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center text-[10px] font-mono bg-slate-950/60 px-2 py-1.5 rounded border border-slate-900">
                            <span className="text-slate-500 uppercase">{key}:</span>
                            <span className="text-slate-300 font-bold">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-slate-400 leading-normal">
                        Every node represented here participates in downstream heuristic matches. When users prompt Neora Design OS, our LLM routing systems perform semantic graph queries over these exact edges.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: INTELLIGENT STYLE MATCHER */}
        {activeSubTab === "match" && (
          <div className="space-y-4">
            
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">Active Workspace Diagnostic</span>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-200">
                    Workspace Preset: <strong className="text-indigo-400">{activeWorkspace?.stylePreset || StylePreset.Traditional}</strong>
                  </h3>
                  <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded uppercase">Calibrated</span>
                </div>
              </div>
              
              {onApplyStylePreset && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500">Apply Preset Override:</span>
                  <select
                    onChange={(e) => {
                      onApplyStylePreset(e.target.value as StylePreset);
                      if (onAddSystemLog) onAddSystemLog(`Updated active workspace preset style model to: "${e.target.value}".`);
                      setNotif(`Applied ${e.target.value} style!`);
                      setTimeout(() => setNotif(null), 2500);
                    }}
                    value={activeWorkspace?.stylePreset || StylePreset.Traditional}
                    className="bg-slate-950 border border-slate-800 text-[10px] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value={StylePreset.Luxury}>Luxury</option>
                    <option value={StylePreset.Traditional}>Traditional</option>
                    <option value={StylePreset.Minimal}>Minimal</option>
                    <option value={StylePreset.Islamic}>Islamic</option>
                  </select>
                </div>
              )}
            </div>

            {/* RECOMMENDATIONS CONTENT CONTAINER */}
            {workspaceRecs ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* COLUMN 1: INTUITION & DESIGN EXPLANATION */}
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Creative Match Reasoning
                      </span>
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-serif">
                      &ldquo;{workspaceRecs.rationale}&rdquo;
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[8px] font-mono text-slate-500 uppercase block">WCAG &amp; Print Calibration Checks</span>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        WCAG v2 AAA Contrast Cleared (&gt; 4.5:1)
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        Print Safe Gutter Margins Complies (&gt; 3mm)
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        Raster Anchor Nodes Optimized for Plate Press
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-850 space-y-2">
                    <span className="block text-[8px] font-mono text-slate-500">APPLY SYSTEM TO NIDE</span>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Accepting this aesthetic calibration will automatically load design tokens and typography pairings into your active editor canvas workspace.
                    </p>
                    <button
                      onClick={() => {
                        if (onApplyStylePreset && activeWorkspace) {
                          onApplyStylePreset(activeWorkspace.stylePreset);
                        }
                        if (onAddSystemLog) onAddSystemLog("Applied matching style intelligence systems and design tokens to active workspace.");
                        setNotif("Design system tokens mapped!");
                        setTimeout(() => setNotif(null), 2500);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-mono font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply Matched System
                    </button>
                  </div>
                </div>

                {/* COLUMN 2: COMPATIBLE ASSETS & FONTS */}
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-4 md:col-span-2">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase block border-b border-slate-850 pb-2">Curated Companion Package</span>
                  
                  {/* Color Swatch Panel */}
                  <div className="space-y-2">
                    <span className="block text-[8px] font-mono text-slate-500 uppercase">Recommended Color Token Matrix</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {platform.getDesignStyles().find(s => s.preset === (activeWorkspace?.stylePreset || StylePreset.Traditional))?.colors.map((c, idx) => (
                        <div
                          key={idx}
                          onClick={() => triggerCopy(c.hex, c.label)}
                          className="bg-slate-950 border border-slate-850 p-2 rounded-xl text-center group cursor-pointer hover:border-purple-500/25 transition-all"
                        >
                          <div className="w-full h-8 rounded-lg mb-1.5 relative border border-white/5" style={{ backgroundColor: c.hex }}>
                            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-mono font-bold text-white">COPY HEX</span>
                          </div>
                          <span className="block text-[9px] font-bold text-slate-200 truncate">{c.label}</span>
                          <span className="block text-[8px] font-mono text-slate-500">{c.hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fonts Pairings */}
                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <span className="block text-[8px] font-mono text-slate-500 uppercase">Typography pairing models</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {workspaceRecs.fonts.slice(0, 2).map((f: FontAsset) => (
                        <div key={f.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-[11px]">
                          <div>
                            <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.2 rounded uppercase block w-fit mb-1">{f.language}</span>
                            <span className="font-bold text-slate-200">{f.name}</span>
                          </div>
                          <button
                            onClick={() => triggerCopy(f.family, "Font Family")}
                            className="text-[9px] font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reusable UI Components */}
                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <span className="block text-[8px] font-mono text-slate-500 uppercase">Reusable design components</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {platform.getComponents().filter(c => c.stylePreset === (activeWorkspace?.stylePreset || StylePreset.Traditional)).map((c) => (
                        <div key={c.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-200">{c.name}</span>
                            <span className="text-[8px] font-mono text-purple-400 uppercase">{c.role}</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded border border-slate-850 font-mono text-[8px] text-slate-400 overflow-x-auto whitespace-nowrap">
                            {c.htmlMarkupSimulated}
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => triggerCopy(c.htmlMarkupSimulated, "Component Code")}
                              className="text-[8px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              Copy HTML
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900 border border-slate-850 rounded-2xl text-slate-500 text-xs font-mono">
                No active style preset loaded. Switch or initialize a workspace first.
              </div>
            )}

          </div>
        )}

        {/* TAB 4: CALLIGRAPHY AND PRINT STANDARDS */}
        {activeSubTab === "calligraphy" && (
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* LEFT COLUMN: CALLIGRAPHY KNOWLEDGE BASE */}
              <div className="md:col-span-2 p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Traditional Calligraphy Standards
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Orthographic Calibration</span>
                </div>

                <div className="space-y-4">
                  {platform.getCalligraphies().map((cal) => (
                    <div key={cal.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block">{cal.language} CALLIGRAPHY STYLE</span>
                          <h4 className="font-bold text-xs text-slate-200 mt-0.5">{cal.styleName}</h4>
                        </div>
                        <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {cal.metadata.isRtl ? "RTL Flow" : "LTR Flow"}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed font-serif bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
                        <strong>History:</strong> {cal.historicalContext}
                        <br />
                        <strong>Modern Usage:</strong> {cal.modernUsage}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[10px] font-mono">
                        <div className="space-y-1.5">
                          <span className="block text-[8px] font-mono text-slate-500 uppercase">Rigid Stroke Rules</span>
                          {cal.strokeRules.map((rule, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-slate-400 leading-tight">
                              <span className="text-purple-500 font-bold">•</span>
                              <span>{rule}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          <span className="block text-[8px] font-mono text-slate-500 uppercase">Composition Rules</span>
                          {cal.compositionRules.map((rule, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-slate-400 leading-tight">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span>{rule}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stroke Preview Paths */}
                      <div className="space-y-1.5 border-t border-slate-850 pt-3">
                        <span className="block text-[8px] font-mono text-slate-500 uppercase">Simulated Vector Curve Metadata</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-900 p-2 rounded border border-slate-850 font-mono text-[8px] text-slate-500 truncate">
                            {cal.sampleVectorPaths[0]}
                          </div>
                          <button
                            onClick={() => triggerCopy(JSON.stringify(cal.metadata), "Stroke Metadata")}
                            className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-[9px] font-mono px-2 py-1 rounded border border-slate-800 flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Matrix
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: PRINT SPECS */}
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Offsite Print Standards
                  </span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>

                <div className="space-y-3">
                  {platform.getPrintSpecs().map((spec, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-200 truncate">{spec.paperType}</span>
                        <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.2 rounded-full uppercase">{spec.finishingMethod}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                        <div className="bg-slate-900 p-2 rounded border border-slate-850">
                          <span className="block text-[7px] text-slate-500 uppercase">Standard Bleed</span>
                          <span className="text-slate-300 font-bold">{spec.standardBleedMm} mm</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-850">
                          <span className="block text-[7px] text-slate-500 uppercase">Trim Safe Gutter</span>
                          <span className="text-slate-300 font-bold">{spec.safeMarginPx} px</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-1 bg-slate-900/40 p-2 rounded-lg">
                        <span>CMYK Color Space Profile:</span>
                        <strong className="text-slate-300">{spec.cmykProfile}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-amber-400/90 leading-relaxed font-mono">
                    Warning: Offset hot foil cylinders demand solid vector structures (&gt; 0.5pt stroke). Avoid hairline gradient structures in packaging areas.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 5: TRENDS RESEARCH ENGINE */}
        {activeSubTab === "research" && (
          <div className="space-y-4">
            
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-3 shadow-sm">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase block">Aesthetic Trend Analyzer</span>
              <p className="text-[11px] text-slate-400">
                Type any industry or branding domain below. Our Trend Engine crawls global design forums and compiles structured analytics, separating proven facts from speculative advice.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={researchIndustry}
                  onChange={(e) => setResearchIndustry(e.target.value)}
                  placeholder="Type industry (e.g., 'Luxury', 'Confectionery', 'Tech')..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  onClick={async () => {
                    setIsWSPipelineActive(true);
                    setWsLogs([]);
                    const wsCallback = (data: { step: string; progress: number; type: string }) => {
                      setWsLogs((prev) => [...prev, data]);
                    };
                    platform.subscribeWS(wsCallback);

                    await platform.simulateWSEventsPipeline(researchIndustry, "research");
                    
                    const res = platform.getResearchReport(researchIndustry);
                    setResearchReport(res);
                    platform.unsubscribeWS(wsCallback);
                    setIsWSPipelineActive(false);

                    if (onAddSystemLog) onAddSystemLog(`Fetched live branding trend report regarding: "${researchIndustry}".`);
                  }}
                  disabled={isWSPipelineActive}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-mono font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isWSPipelineActive ? "Researching..." : "Analyze Trends"}
                </button>
              </div>
            </div>

            {/* Simulated Live research logs */}
            <AnimatePresence>
              {isWSPipelineActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-inner"
                >
                  <div className="p-3 bg-slate-900/80 border-b border-slate-850 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Live Trend Seeding Pipeline
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">API/WS Feed</span>
                  </div>
                  <div className="p-3 font-mono text-[9px] text-slate-400 space-y-1 bg-slate-950/80 max-h-40 overflow-y-auto">
                    {wsLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-purple-500">[{log.progress}%]</span>
                        <span className="text-slate-300">{log.step}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* REPT DISPLAY */}
            {researchReport && (
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-3">
                  <div>
                    <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block">Active Report</span>
                    <h3 className="font-bold text-slate-200 text-xs mt-0.5 leading-snug">{researchReport.topic}</h3>
                    <span className="text-[8px] font-mono text-slate-500 block mt-1">Target Sector: {researchReport.industry}</span>
                  </div>
                  
                  <div className="text-right shrink-0 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-850">
                    <span className="block text-[7px] font-mono text-slate-500">POPULARITY</span>
                    <span className="text-xs font-mono font-black text-purple-400">{researchReport.popularityScore}%</span>
                  </div>
                </div>

                {/* TWO CARD LAYOUT: FACT vs SUGGESTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Verified Facts */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-[9px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        Verified Empirical Facts
                      </span>
                      <span className="text-[8px] font-mono text-emerald-400">Clear Clearance</span>
                    </div>

                    <div className="space-y-2">
                      {researchReport.verifiedFacts.map((fact, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[10px] text-slate-300 leading-normal font-serif">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span>{fact}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-[9px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Generative Recommendations
                      </span>
                      <span className="text-[8px] font-mono text-purple-400">Speculative AI</span>
                    </div>

                    <div className="space-y-2">
                      {researchReport.aiSuggestions.map((sug, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[10px] text-slate-300 leading-normal font-serif">
                          <span className="text-purple-500 font-bold shrink-0">★</span>
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase">Visual Style Aesthetics Summary</span>
                  <p className="text-[11px] text-slate-300 leading-normal">{researchReport.visualAestheticSummary}</p>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 6: OBSERVABILITY METRICS & TEST HARNESS */}
        {activeSubTab === "metrics" && (
          <div className="space-y-4">
            
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { label: "Search Index Latency", value: `${platform.getObservabilityMetrics().searchLatencyMs} ms`, color: "text-purple-400" },
                { label: "Recommendation Precision", value: `${platform.getObservabilityMetrics().recommendationAccuracy}%`, color: "text-emerald-400" },
                { label: "Total Synced Nodes", value: platform.getObservabilityMetrics().totalNodes, color: "text-indigo-400" },
                { label: "Asset Memory Growth", value: `+${platform.getObservabilityMetrics().libraryGrowthPercent}%`, color: "text-purple-400" }
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 bg-slate-900 border border-slate-850 rounded-2xl text-center space-y-1">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">{m.label}</span>
                  <span className={`block text-lg font-mono font-black ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>

            {/* Test Harness Execution */}
            <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    Automated Platform Seeding &amp; Testing SDK
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Verify and assert licensing clearance, node relational connectivity, and matching speed heuristics under tight enterprise metrics.
                  </p>
                </div>
                
                <button
                  onClick={handleRunTests}
                  disabled={isTesting}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-mono font-bold px-4 py-2 rounded-xl transition-all shadow-md shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? "Executing Assertions..." : "Run Platform Regression Tests"}
                </button>
              </div>

              {/* TEST RESULTS FEED */}
              {testResults.length > 0 ? (
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-850 max-h-64 overflow-y-auto">
                  {testResults.map((t, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 text-[10px] font-mono p-2 bg-slate-900/60 rounded border border-slate-900">
                      <div className="space-y-0.5">
                        <span className="block font-bold text-slate-200">{t.testName}</span>
                        <p className="text-slate-500 text-[9px] leading-tight">{t.message}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                        t.passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-red-500/10 text-red-400 border border-red-500/25"
                      }`}>
                        {t.passed ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-850/60 text-slate-500 text-[10px] font-mono italic">
                  Harness dormant. Awaiting active regression triggers.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
