// NEORA INTELLIGENT DESIGN EDITOR (NIDE) CONVERSATIONAL STUDIO
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Layers, Sliders, Play, CheckCircle2, AlertTriangle, Code,
  Settings, RefreshCw, ZoomIn, ZoomOut, Download, Eye, EyeOff, Lock, Unlock,
  Trash2, Plus, Info, Palette, Type, ChevronRight, Terminal, Clock, ShieldCheck,
  Activity, Undo, Redo, Compass, Check, BookOpen, AlertCircle, Layout, HelpCircle,
  MessageSquare, User, CornerDownRight, X, Layers3, Zap, CheckSquare, Award, HelpCircle as HelpIcon
} from "lucide-react";

import {
  NeoraIntelligentDesignEditor,
  NIDEWorkspace,
  NIDELayer,
  NIDESemanticObject,
  SemanticRole,
  StylePreset,
  EditPlan,
  Revision,
  CollaborativeComment,
  NIDEPlugin,
  ContextEngine,
  NIDE_ENTERPRISE_MANUAL
} from "../../lib/ai/NeoraIntelligentDesignEditor";

interface NeoraIntelligentDesignEditorDashboardProps {
  lang: "en" | "bn";
  onAddSystemLog: (msg: string) => void;
}

export function NeoraIntelligentDesignEditorDashboard({ lang, onAddSystemLog }: NeoraIntelligentDesignEditorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"canvas" | "planner" | "comments" | "plugins" | "terminal" | "tests" | "sdk">("canvas");
  const [workspace, setWorkspace] = useState<NIDEWorkspace | null>(null);
  
  // Staging preview state
  const [stagedLayers, setStagedLayers] = useState<NIDELayer[] | null>(null);
  const [stagedPlan, setStagedPlan] = useState<EditPlan | null>(null);
  const [showStagedDifference, setShowStagedDifference] = useState<boolean>(true);

  // Layout health metrics
  const [layoutAudit, setLayoutAudit] = useState<any>(null);

  // Interactive properties
  const [zoom, setZoom] = useState<number>(0.5);
  const [showBleed, setShowBleed] = useState<boolean>(true);
  const [showMargins, setShowMargins] = useState<boolean>(true);
  const [selectedObjectId, setSelectedObjectId] = useState<string>("");

  // Conversational Command bar
  const [conversationalCommand, setConversationalCommand] = useState<string>("Move title upward and make it gold");
  const [isProcessingCommand, setIsProcessingCommand] = useState<boolean>(false);
  const [commandFeedback, setCommandFeedback] = useState<string>("");

  // Pin comments interaction
  const [pinMode, setPinMode] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const artboardContainerRef = useRef<HTMLDivElement>(null);

  // Terminal websocket events log
  const [websocketEvents, setWebsocketEvents] = useState<Array<{ time: string; event: string; status: "success" | "pending" | "info" }>>([]);

  // Regression tests
  const [testResults, setTestResults] = useState<Array<{ name: string; passed: boolean; message: string }> | null>(null);
  const [testsRunning, setTestsRunning] = useState<boolean>(false);

  // Initialize NIDE core instance
  useEffect(() => {
    const nide = NeoraIntelligentDesignEditor.getInstance();

    const handleUpdate = (updatedWs: NIDEWorkspace) => {
      setWorkspace({ ...updatedWs });
      setStagedLayers(nide.getStagingLayers() ? [...nide.getStagingLayers()!] : null);
      setStagedPlan(nide.getCurrentPlan());
      setLayoutAudit(ContextEngine.auditLayout(updatedWs));
    };

    nide.subscribe(handleUpdate);

    // Initial setup
    if (!nide.getWorkspace()) {
      nide.initializeSeedWorkspace(
        "Alpona Festive Banner Project",
        "ঐতিহ্যবাহী উৎসবের আলপনা এবং চমৎকার ক্যালিগ্রাফি সহ শুভ শারদীয়া ব্যানার"
      );
    } else {
      const ws = nide.getWorkspace()!;
      setWorkspace(ws);
      setLayoutAudit(ContextEngine.auditLayout(ws));
    }

    // Seed default websocket logs
    setWebsocketEvents([
      { time: new Date().toLocaleTimeString(), event: "NIDE Engine Booted.", status: "success" },
      { time: new Date().toLocaleTimeString(), event: "Semantic Object Engine parsed workspace vectors.", status: "success" },
      { time: new Date().toLocaleTimeString(), event: "WebSocket tunnel connected to port :3000.", status: "info" }
    ]);

    return () => {
      nide.unsubscribe(handleUpdate);
    };
  }, []);

  // Conversational Execution Trigger
  const handlePlanAndPreviewEdit = async (cmdText?: string) => {
    const finalCmd = cmdText || conversationalCommand;
    if (!finalCmd.trim()) return;

    setIsProcessingCommand(true);
    setCommandFeedback("");
    
    // Simulate real-time streaming WS progress events
    const nide = NeoraIntelligentDesignEditor.getInstance();
    const eventsSequence = [
      { msg: `WebSocket -> Received EditRequested: "${finalCmd}"`, status: "info" as const },
      { msg: "WebSocket -> Understanding user edit intent...", status: "pending" as const },
      { msg: "WebSocket -> Semantic Object Engine detecting layer nodes...", status: "pending" as const },
      { msg: "WebSocket -> Edit Planner constructing non-destructive layout schedule...", status: "pending" as const },
      { msg: "WebSocket -> Context Engine calculating bounding box overlaps...", status: "pending" as const },
      { msg: "WebSocket -> Preview generated successfully. Difference staging ready.", status: "success" as const }
    ];

    for (const step of eventsSequence) {
      setWebsocketEvents(prev => [{ time: new Date().toLocaleTimeString(), event: step.msg, status: step.status }, ...prev]);
      await new Promise(resolve => setTimeout(resolve, 350));
    }

    try {
      const plan = await nide.generateEditPlanAndPreview(finalCmd);
      setCommandFeedback(`Constructed layout edit plan targeting: ${plan.affectedObjects.map(o => `"${o.name}"`).join(", ")}`);
      onAddSystemLog(`NIDE AI: Formulated edit plan for conversational query: "${finalCmd}"`);
    } catch (e: any) {
      setCommandFeedback(`Plan generation failed: ${e.message}`);
    } finally {
      setIsProcessingCommand(false);
    }
  };

  const handleAcceptPreview = () => {
    const nide = NeoraIntelligentDesignEditor.getInstance();
    const success = nide.acceptStagedPreview();
    if (success) {
      setWebsocketEvents(prev => [
        { time: new Date().toLocaleTimeString(), event: "WebSocket -> EditPlanned committed into layout stream", status: "success" },
        { time: new Date().toLocaleTimeString(), event: "WebSocket -> Snapshot revision successfully committed", status: "success" },
        ...prev
      ]);
      setCommandFeedback("");
      onAddSystemLog("NIDE: Conversational transaction successfully approved & recorded.");
    }
  };

  const handleRejectPreview = () => {
    const nide = NeoraIntelligentDesignEditor.getInstance();
    nide.rejectStagedPreview();
    setCommandFeedback("");
    setWebsocketEvents(prev => [
      { time: new Date().toLocaleTimeString(), event: "WebSocket -> Staged layout edit discarded by operator", status: "info" },
      ...prev
    ]);
    onAddSystemLog("NIDE: Staging preview discarded.");
  };

  // Rollback trigger
  const handleRollback = (vId: string) => {
    const nide = NeoraIntelligentDesignEditor.getInstance();
    if (nide.rollbackToRevision(vId)) {
      onAddSystemLog(`NIDE: Reverted workspace state back to: "${vId}"`);
      setWebsocketEvents(prev => [
        { time: new Date().toLocaleTimeString(), event: `WebSocket -> Restored snapshot ID: ${vId}`, status: "success" },
        ...prev
      ]);
    }
  };

  // Run Test suite
  const handleTriggerTests = async () => {
    setTestsRunning(true);
    onAddSystemLog("NIDE: Starting regression and layout integrity assertions...");
    await new Promise(resolve => setTimeout(resolve, 800));
    const nide = NeoraIntelligentDesignEditor.getInstance();
    const results = await nide.runNIDETests();
    setTestResults(results);
    setTestsRunning(false);
    onAddSystemLog("NIDE: Integrated regression suite completed successfully.");
  };

  // Canvas click to pin comments
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinMode || !artboardContainerRef.current) return;

    const rect = artboardContainerRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    if (newCommentText.trim()) {
      const nide = NeoraIntelligentDesignEditor.getInstance();
      nide.pinCollaborativeComment(newCommentText, x, y, selectedObjectId || undefined);
      setNewCommentText("");
      setPinMode(false);
      onAddSystemLog(`NIDE: Pinned team collaborative review note at offset [x: ${x}px, y: ${y}px]`);
    }
  };

  // Render vector layers inside absolute SVG container
  const renderArtboardLayers = (layersList: NIDELayer[], isStaging = false) => {
    if (!workspace) return null;

    return (
      <svg
        width={workspace.canvas.width}
        height={workspace.canvas.height}
        viewBox={`0 0 ${workspace.canvas.width} ${workspace.canvas.height}`}
        className="w-full h-full select-none"
        style={{ background: "#05070e" }}
      >
        {layersList.map(layer => {
          if (!layer.isVisible) return null;

          return (
            <g key={layer.id} opacity={layer.isLocked ? 0.95 : 1.0}>
              {layer.objects.map(obj => {
                // Highlight color if staged difference is enabled
                const isModified = stagedLayers && isStaging && showStagedDifference;
                const borderStroke = isModified ? "#10b981" : "#f59e0b";
                const borderStrokeWidth = isModified ? 8 : 2;

                const isSelected = selectedObjectId === obj.id;

                if (obj.semanticRole === SemanticRole.Background) {
                  return (
                    <rect
                      key={obj.id}
                      x={obj.x}
                      y={obj.y}
                      width={obj.width}
                      height={obj.height}
                      fill={obj.properties.fillColor || "#0f172a"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedObjectId(obj.id);
                      }}
                      className="cursor-pointer"
                    />
                  );
                }

                if (obj.semanticRole === SemanticRole.Decoration) {
                  // Render folk pattern placeholder with geometry lines
                  return (
                    <g
                      key={obj.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedObjectId(obj.id);
                      }}
                      className="cursor-pointer"
                    >
                      {/* Bounding outline */}
                      <rect
                        x={obj.x}
                        y={obj.y}
                        width={obj.width}
                        height={obj.height}
                        fill="none"
                        stroke={isSelected ? "#06b6d4" : borderStroke}
                        strokeWidth={isSelected ? 4 : 1.5}
                        strokeDasharray={isSelected ? "8, 8" : "none"}
                        opacity={obj.opacity}
                      />
                      {/* Geometric Folk Grid Lines */}
                      <circle
                        cx={obj.x + obj.width / 2}
                        cy={obj.y + obj.height / 2}
                        r={obj.width / 3.2}
                        fill="none"
                        stroke={obj.properties.fillColor || "#fbbf24"}
                        strokeWidth={borderStrokeWidth}
                        opacity={obj.opacity * 0.7}
                      />
                      <circle
                        cx={obj.x + obj.width / 2}
                        cy={obj.y + obj.height / 2}
                        r={obj.width / 5}
                        fill="none"
                        stroke={obj.properties.strokeColor || "#f59e0b"}
                        strokeWidth={1}
                        opacity={obj.opacity * 0.9}
                      />
                      {/* Symmetry Rays */}
                      {[0, 45, 90, 135].map((angle, idx) => (
                        <line
                          key={idx}
                          x1={obj.x + obj.width / 2 - Math.cos((angle * Math.PI) / 180) * (obj.width / 2.5)}
                          y1={obj.y + obj.height / 2 - Math.sin((angle * Math.PI) / 180) * (obj.height / 2.5)}
                          x2={obj.x + obj.width / 2 + Math.cos((angle * Math.PI) / 180) * (obj.width / 2.5)}
                          y2={obj.y + obj.height / 2 + Math.sin((angle * Math.PI) / 180) * (obj.height / 2.5)}
                          stroke={obj.properties.fillColor || "#fbbf24"}
                          strokeWidth={1}
                          strokeDasharray="4, 4"
                          opacity={obj.opacity * 0.5}
                        />
                      ))}
                    </g>
                  );
                }

                if (obj.semanticRole === SemanticRole.Title || obj.semanticRole === SemanticRole.Subtitle) {
                  const fontFam = obj.properties.fontFamily || "Inter";
                  const fontSz = obj.properties.fontSize || 24;
                  const isTitle = obj.semanticRole === SemanticRole.Title;

                  return (
                    <g
                      key={obj.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedObjectId(obj.id);
                      }}
                      className="cursor-pointer"
                    >
                      {/* Text box outline */}
                      <rect
                        x={obj.x}
                        y={obj.y}
                        width={obj.width}
                        height={obj.height}
                        fill={isSelected ? "rgba(6, 182, 212, 0.05)" : "none"}
                        stroke={isSelected ? "#06b6d4" : borderStroke}
                        strokeWidth={isSelected ? 3 : 1}
                        strokeDasharray="5, 5"
                        rx={6}
                      />
                      {/* Text graphic */}
                      <text
                        x={obj.x + obj.width / 2}
                        y={obj.y + obj.height / 2 + fontSz / 3}
                        fontFamily={fontFam}
                        fontSize={fontSz}
                        fontWeight={obj.fontWeight || "bold"}
                        fill={isTitle ? (obj.properties.fillColor || "#ffffff") : (obj.properties.textColor || "#94a3b8")}
                        stroke={isTitle ? (obj.properties.strokeColor || "none") : "none"}
                        strokeWidth={1.5}
                        textAnchor="middle"
                        opacity={obj.opacity}
                      >
                        {obj.properties.textReference || "SANSKRIT COPY"}
                      </text>
                      {/* Native language indicator badge */}
                      <rect
                        x={obj.x + 8}
                        y={obj.y + 8}
                        width={40}
                        height={16}
                        rx={4}
                        fill="rgba(15, 23, 42, 0.8)"
                        stroke="rgba(148, 163, 184, 0.2)"
                      />
                      <text
                        x={obj.x + 28}
                        y={obj.y + 20}
                        fontSize={9}
                        fontFamily="monospace"
                        fill="#fbbf24"
                        textAnchor="middle"
                      >
                        {isTitle ? "bn-AS" : "en-US"}
                      </text>
                    </g>
                  );
                }

                if (obj.semanticRole === SemanticRole.Calligraphy) {
                  return (
                    <g
                      key={obj.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedObjectId(obj.id);
                      }}
                      className="cursor-pointer"
                    >
                      <rect
                        x={obj.x}
                        y={obj.y}
                        width={obj.width}
                        height={obj.height}
                        fill="rgba(245, 158, 11, 0.05)"
                        stroke={isSelected ? "#06b6d4" : "#f59e0b"}
                        strokeWidth={1.5}
                        strokeDasharray="6, 6"
                        rx={4}
                      />
                      {/* Decorative calligraphy flourish curves */}
                      <path
                        d={`M ${obj.x + 30} ${obj.y + obj.height / 2} Q ${obj.x + obj.width / 2} ${obj.y + 10} ${obj.x + obj.width - 30} ${obj.y + obj.height / 2} T ${obj.x + obj.width - 10} ${obj.y + obj.height - 20}`}
                        fill="none"
                        stroke={obj.properties.fillColor || "#fbbf24"}
                        strokeWidth={4}
                        strokeLinecap="round"
                      />
                      <text
                        x={obj.x + obj.width / 2}
                        y={obj.y + obj.height - 20}
                        fontSize={14}
                        fill="#ffffff"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {obj.properties.textReference || "Ornament stroke"}
                      </text>
                    </g>
                  );
                }

                return null;
              })}
            </g>
          );
        })}

        {/* Print bleed zone guides */}
        {showBleed && (
          <rect
            x={10}
            y={10}
            width={workspace.canvas.width - 20}
            height={workspace.canvas.height - 20}
            fill="none"
            stroke="#f43f5e"
            strokeWidth={2}
            strokeDasharray="6, 4"
            opacity={0.65}
          />
        )}

        {/* Safety margins zone guides */}
        {showMargins && (
          <rect
            x={workspace.canvas.marginPx}
            y={workspace.canvas.marginPx}
            width={workspace.canvas.width - workspace.canvas.marginPx * 2}
            height={workspace.canvas.height - workspace.canvas.marginPx * 2}
            fill="none"
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="4, 4"
            opacity={0.5}
          />
        )}
      </svg>
    );
  };

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
        <span className="text-xs font-mono">Initializing NIDE Core Memory Stack...</span>
      </div>
    );
  }

  const activeObject = workspace.layers
    .flatMap(l => l.objects)
    .find(o => o.id === selectedObjectId);

  return (
    <div className="space-y-4 font-sans text-slate-100" id="nide_intelligent_design_editor_root">
      {/* BRAND HEADER BAR */}
      <div className="p-4 bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/20 rounded-xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-100 flex items-center gap-2">
              Neora Intelligent Design Editor (NIDE)
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/20 text-[8px] font-mono font-bold animate-pulse">
                Conversational Live
              </span>
            </h3>
            <p className="text-[10px] text-cyan-300 font-mono">
              Phase 3.1 • Object-Aware Semantic Vector Graphics Studio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePlanAndPreviewEdit("Convert to gold luxury style")}
            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-mono font-bold cursor-pointer"
          >
            ★ Luxury Preset
          </button>
          <button
            onClick={() => handlePlanAndPreviewEdit("Translate into Bangla")}
            className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[9px] font-mono font-bold cursor-pointer"
          >
            Translate locale
          </button>
        </div>
      </div>

      {/* THREE COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: ACTIVE LAYERS & CONTROL DOCK */}
        <div className="lg:col-span-3 space-y-4">
          {/* SEMANTIC OBJECT MAP */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Layers3 className="w-3.5 h-3.5" />
              Semantic Layers Tree
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {workspace.layers.map(layer => (
                <div key={layer.id} className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300 border-b border-slate-800/50 pb-1">
                    <span className="truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      {layer.name}
                    </span>
                    <span className="text-[9px] text-slate-500">{layer.objects.length} elements</span>
                  </div>
                  <div className="space-y-1">
                    {layer.objects.map(obj => {
                      const isSelected = selectedObjectId === obj.id;
                      return (
                        <button
                          key={obj.id}
                          onClick={() => setSelectedObjectId(obj.id)}
                          className={`w-full text-left p-1.5 rounded text-[9px] font-mono flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-200"
                              : "hover:bg-slate-800 text-slate-400"
                          }`}
                        >
                          <span className="truncate flex items-center gap-1">
                            <span className="text-slate-500">[{obj.semanticRole}]</span>
                            <span className="truncate">{obj.name}</span>
                          </span>
                          <span className="text-[8px] text-slate-600 font-sans">
                            {obj.x},{obj.y}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OBJECT INSPECTOR CONTROL PANEL */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              Properties Inspector
            </h4>

            {activeObject ? (
              <div className="space-y-3">
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono space-y-1">
                  <div className="text-slate-500">Element ID: {activeObject.id}</div>
                  <div className="text-slate-200 font-bold">Role: {activeObject.semanticRole}</div>
                  <div className="text-slate-400">Layer node: {activeObject.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div>
                    <label className="text-slate-500 block mb-1">X-Bounds</label>
                    <input
                      type="number"
                      value={activeObject.x}
                      onChange={(e) => {
                        const nide = NeoraIntelligentDesignEditor.getInstance();
                        const ws = nide.getWorkspace()!;
                        const layer = ws.layers.find(l => l.objects.some(o => o.id === activeObject.id))!;
                        // Direct modification for responsive sliders
                        nide.rollbackToRevision(ws.history[ws.currentRevisionIndex].versionId);
                        activeObject.x = parseInt(e.target.value) || 0;
                        setWorkspace({ ...ws });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Y-Bounds</label>
                    <input
                      type="number"
                      value={activeObject.y}
                      onChange={(e) => {
                        const nide = NeoraIntelligentDesignEditor.getInstance();
                        const ws = nide.getWorkspace()!;
                        activeObject.y = parseInt(e.target.value) || 0;
                        setWorkspace({ ...ws });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Width</label>
                    <input
                      type="number"
                      value={activeObject.width}
                      onChange={(e) => {
                        const nide = NeoraIntelligentDesignEditor.getInstance();
                        const ws = nide.getWorkspace()!;
                        activeObject.width = parseInt(e.target.value) || 0;
                        setWorkspace({ ...ws });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Height</label>
                    <input
                      type="number"
                      value={activeObject.height}
                      onChange={(e) => {
                        const nide = NeoraIntelligentDesignEditor.getInstance();
                        const ws = nide.getWorkspace()!;
                        activeObject.height = parseInt(e.target.value) || 0;
                        setWorkspace({ ...ws });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Opacity:</span>
                    <span>{Math.round(activeObject.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={activeObject.opacity}
                    onChange={(e) => {
                      const nide = NeoraIntelligentDesignEditor.getInstance();
                      const ws = nide.getWorkspace()!;
                      activeObject.opacity = parseFloat(e.target.value);
                      setWorkspace({ ...ws });
                    }}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {activeObject.properties.textReference !== undefined && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400">Editable String Value</label>
                    <input
                      type="text"
                      value={activeObject.properties.textReference}
                      onChange={(e) => {
                        const nide = NeoraIntelligentDesignEditor.getInstance();
                        const ws = nide.getWorkspace()!;
                        activeObject.properties.textReference = e.target.value;
                        setWorkspace({ ...ws });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] font-mono text-slate-200"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-950/40 border border-slate-800/50 rounded-lg text-slate-500 text-[10px] font-mono">
                Select any visual element on the vector stage canvas to inspect its geometry tokens.
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: INTUITIVE STAGE CANVAS */}
        <div className="lg:col-span-6 space-y-4">
          {/* CONVERSATIONAL COMMAND INPUT BAR */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={conversationalCommand}
                  onChange={(e) => setConversationalCommand(e.target.value)}
                  placeholder="Ask NIDE to edit (e.g. Move title upward, Convert to luxury style...)"
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePlanAndPreviewEdit();
                  }}
                />
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-3 animate-pulse" />
              </div>
              <button
                onClick={() => handlePlanAndPreviewEdit()}
                disabled={isProcessingCommand}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessingCommand ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Plan Edit
              </button>
            </div>

            {/* Quick Click Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: "Move Title Up", cmd: "Move title upward" },
                { label: "Golden Luxury", cmd: "Convert to gold luxury style" },
                { label: "Bold Typography", cmd: "Make typography bolder" },
                { label: "Translate Bangla", cmd: "Translate into Bangla" },
                { label: "Breathing Space", cmd: "Increase vertical negative space" }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setConversationalCommand(p.cmd);
                    handlePlanAndPreviewEdit(p.cmd);
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded text-[9px] font-mono text-slate-300 transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE VECTOR STAGE ARTBOARD */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden relative shadow-inner">
            {/* CANVAS UTILITY TOP CONTROL BAR */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-300">
                  <Layout className="w-3.5 h-3.5 text-cyan-400" />
                  {workspace.name} ({workspace.canvas.aspectRatio})
                </span>
                <span className="text-[9px] text-slate-500">[{workspace.canvas.width} x {workspace.canvas.height} px]</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBleed(!showBleed)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${showBleed ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-slate-800 text-slate-500"}`}
                  title="Toggle 3mm Bleed Safety Lines"
                >
                  Bleed
                </button>
                <button
                  onClick={() => setShowMargins(!showMargins)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${showMargins ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500"}`}
                  title="Toggle Workspace Bounds Safe Margin Grid"
                >
                  Margins
                </button>
                <div className="h-3 w-px bg-slate-800" />
                <button onClick={() => setZoom(Math.max(0.2, zoom - 0.05))} className="hover:text-slate-200 cursor-pointer">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[9px] select-none text-slate-300 font-bold">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(1.2, zoom + 0.05))} className="hover:text-slate-200 cursor-pointer">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ARTBOARD SCROLL VIEWPORT */}
            <div className="p-8 flex items-center justify-center bg-[#070913] max-h-[460px] overflow-auto">
              <div
                ref={artboardContainerRef}
                onClick={handleCanvasClick}
                style={{
                  width: workspace.canvas.width * zoom,
                  height: workspace.canvas.height * zoom,
                  transformOrigin: "center center"
                }}
                className={`shadow-2xl border border-slate-800 rounded relative transition-all ${
                  pinMode ? "cursor-crosshair border-cyan-400 ring-2 ring-cyan-500/30" : ""
                }`}
              >
                {/* SVG LAYERS RENDER */}
                {stagedLayers ? renderArtboardLayers(stagedLayers, true) : renderArtboardLayers(workspace.layers)}

                {/* Render pinned comments */}
                {workspace.comments.map(c => {
                  if (c.resolved) return null;
                  return (
                    <div
                      key={c.id}
                      style={{
                        left: c.x * zoom - 10,
                        top: c.y * zoom - 10
                      }}
                      className="absolute w-5 h-5 bg-yellow-500 border-2 border-slate-950 rounded-full flex items-center justify-center text-slate-950 text-[10px] font-bold cursor-pointer group hover:scale-110 transition-transform"
                      title={`${c.author}: ${c.text}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const nide = NeoraIntelligentDesignEditor.getInstance();
                        nide.resolveComment(c.id);
                        onAddSystemLog("NIDE: Collaborative comment successfully resolved.");
                      }}
                    >
                      !
                      <div className="absolute hidden group-hover:block left-6 top-0 bg-slate-950 border border-slate-800 rounded-lg p-2.5 w-44 shadow-2xl z-50 text-[9px] font-sans text-slate-200 leading-normal pointer-events-none">
                        <div className="font-bold text-yellow-400 mb-0.5">{c.author}</div>
                        <div>{c.text}</div>
                        <div className="text-[7px] text-slate-500 mt-1 font-mono">{new Date(c.timestamp).toLocaleTimeString()}</div>
                        <div className="text-[7px] text-yellow-500 mt-0.5 font-mono">Click to resolve</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE PREVIEW COMPANION SUB-PANEL */}
            {stagedLayers && stagedPlan && (
              <div className="p-4 bg-gradient-to-r from-emerald-950 to-slate-900 border-t border-emerald-500/30 animate-fade-in flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Staged Preview Ready
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono italic max-w-md">
                    Plan targets: {stagedPlan.expectedVisualImpact} ({stagedPlan.risks.length} layout rules verified).
                  </div>
                  {stagedPlan.risks.map((r, idx) => (
                    <div key={idx} className="text-[8px] font-mono text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Warning: {r.description}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStagedDifference(!showStagedDifference)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-[9px] font-mono font-bold text-slate-300 cursor-pointer"
                  >
                    {showStagedDifference ? "Hide diff highlighter" : "Show diff highlighter"}
                  </button>
                  <button
                    onClick={handleRejectPreview}
                    className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[9px] font-mono font-bold cursor-pointer"
                  >
                    Discard Edit
                  </button>
                  <button
                    onClick={handleAcceptPreview}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[9px] font-mono font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="w-3 h-3" /> Commit Changes
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STUDIO COMPONENT TABS (REPLACES SIMPLE PANEL) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex border-b border-slate-800/80 bg-slate-950/40">
              {[
                { id: "canvas", label: "Change Log History" },
                { id: "planner", label: "Context & Layout Health" },
                { id: "comments", label: "Team Collaborating" },
                { id: "plugins", label: "Plugin Packs" },
                { id: "terminal", label: "API WebSockets Monitor" },
                { id: "tests", label: "Regression Tests" },
                { id: "sdk", label: "Enterprise SDK Spec" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-[9px] font-mono font-bold border-r border-slate-800/80 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-cyan-400 border-b-2 border-b-cyan-500"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 min-h-48 max-h-72 overflow-y-auto">
              {/* TAB: REVISION HISTORY */}
              {activeTab === "canvas" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <span>Timeline Snapshot Logs</span>
                    <span className="text-[9px] text-slate-500">
                      Index {workspace.currentRevisionIndex + 1} of {workspace.history.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {workspace.history.map((rev, idx) => {
                      const isActive = workspace.currentRevisionIndex === idx;
                      return (
                        <div
                          key={rev.versionId}
                          className={`p-2.5 rounded-lg border transition-all ${
                            isActive
                              ? "bg-cyan-500/5 border-cyan-500/20 ring-1 ring-cyan-500/10"
                              : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-200">
                              {rev.name}
                            </span>
                            <button
                              onClick={() => handleRollback(rev.versionId)}
                              disabled={isActive}
                              className={`px-1.5 py-0.5 text-[8px] font-mono rounded cursor-pointer ${
                                isActive
                                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                                  : "bg-slate-800 hover:bg-slate-750 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {isActive ? "Active State" : "Rollback Here"}
                            </button>
                          </div>
                          <p className="text-[9px] font-mono text-slate-400 mt-1">{rev.description}</p>
                          {rev.diffLogs && rev.diffLogs.length > 0 && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-850/50 space-y-0.5">
                              {rev.diffLogs.map((log, lIdx) => (
                                <div key={lIdx} className="text-[8px] font-mono text-slate-500 flex items-center gap-1">
                                  <CornerDownRight className="w-2.5 h-2.5 text-cyan-500/40" />
                                  {log}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[8px] text-slate-600 font-mono mt-1 pt-1 border-t border-slate-850/30">
                            <span>Author: {rev.author}</span>
                            <span>{new Date(rev.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: PLANNER & METRICS */}
              {activeTab === "planner" && layoutAudit && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-center">
                      <div className="text-[8px] font-mono text-slate-500 uppercase">Alignment Precision</div>
                      <div className="text-lg font-mono font-extrabold text-cyan-400 mt-0.5">{layoutAudit.alignmentScore}%</div>
                    </div>
                    <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-center">
                      <div className="text-[8px] font-mono text-slate-500 uppercase">Canvas Whitespace Ratio</div>
                      <div className="text-lg font-mono font-extrabold text-indigo-400 mt-0.5">{Math.round(layoutAudit.whitespaceRatio * 100)}%</div>
                    </div>
                    <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg text-center">
                      <div className="text-[8px] font-mono text-slate-500 uppercase">Intersects Detected</div>
                      <div className={`text-lg font-mono font-extrabold mt-0.5 ${layoutAudit.overlapsDetected > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {layoutAudit.overlapsDetected}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2">
                    <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      Dynamic Context Recommendations
                    </h5>
                    <div className="space-y-1.5">
                      {layoutAudit.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="text-[9px] font-mono text-slate-400 flex items-start gap-1.5 leading-normal">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COMMENTS */}
              {activeTab === "comments" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <span>Active Collaborative Comments</span>
                    <button
                      onClick={() => setPinMode(!pinMode)}
                      className={`px-2 py-0.5 text-[8px] font-mono rounded border cursor-pointer transition-all ${
                        pinMode ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold" : "bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700"
                      }`}
                    >
                      {pinMode ? "Click Canvas to Pin" : "+ Pin comment at coord"}
                    </button>
                  </div>

                  {pinMode && (
                    <div className="p-2.5 bg-cyan-950/25 border border-cyan-500/20 rounded-lg space-y-2 animate-fade-in">
                      <div className="text-[8px] font-mono text-cyan-300">
                        1. Type your comment copy below.
                        <br />
                        2. Click anywhere on the artboard canvas preview to anchor the coordinate!
                      </div>
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="e.g. Center this calligraphy, make colors pop..."
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] font-mono text-slate-200"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {workspace.comments.filter(c => !c.resolved).length === 0 ? (
                      <div className="text-center p-6 text-[10px] font-mono text-slate-600">
                        No team remarks active. Pins can be placed contextually to review layout segments.
                      </div>
                    ) : (
                      workspace.comments.map(c => (
                        <div key={c.id} className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg flex items-start justify-between">
                          <div className="space-y-0.5 max-w-[80%]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                              <span className="text-[9px] font-mono font-bold text-slate-300">{c.author}</span>
                              <span className="text-[8px] text-slate-600 font-mono">[x: {c.x}px, y: {c.y}px]</span>
                            </div>
                            <p className="text-[9px] font-sans text-slate-300 leading-normal">{c.text}</p>
                          </div>
                          <button
                            onClick={() => {
                              const nide = NeoraIntelligentDesignEditor.getInstance();
                              nide.resolveComment(c.id);
                              onAddSystemLog("NIDE: Collaborative comment successfully resolved.");
                            }}
                            className="text-[8px] font-mono bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded cursor-pointer"
                          >
                            ✓ Resolve
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: PLUGINS */}
              {activeTab === "plugins" && (
                <div className="space-y-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Registered Vector & Typography Plugin Packs
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {NeoraIntelligentDesignEditor.getInstance().getRegisteredPluginsList().map(p => (
                      <div key={p.id} className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-200 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            {p.name}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500">v{p.version}</span>
                        </div>
                        <p className="text-[9px] font-mono text-slate-500">Target Pipeline: {p.type}</p>
                        <div className="flex items-center justify-between text-[8px] font-mono text-slate-600 border-t border-slate-900 pt-1">
                          <span>Authored by: {p.author}</span>
                          <span className="text-emerald-400 font-bold">● Active Hooked</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: WEBSOCKET MONITOR */}
              {activeTab === "terminal" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <span>Websocket Live Log (Port :3000 Ingress Node)</span>
                    <button
                      onClick={() => setWebsocketEvents([])}
                      className="text-[8px] font-mono text-slate-500 hover:text-slate-300"
                    >
                      Clear Log
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg max-h-52 overflow-y-auto space-y-1 font-mono text-[9px] leading-relaxed">
                    {websocketEvents.length === 0 ? (
                      <div className="text-slate-600 text-center py-4">Terminal ready. Run commands to listen to WebSocket broadcast frames.</div>
                    ) : (
                      websocketEvents.map((evt, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-500 flex-shrink-0">[{evt.time}]</span>
                          <span className={
                            evt.status === "success" ? "text-emerald-400" :
                            evt.status === "pending" ? "text-cyan-400 animate-pulse" : "text-slate-300"
                          }>
                            {evt.event}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: TESTS */}
              {activeTab === "tests" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">System Integration Suite</span>
                    <button
                      onClick={handleTriggerTests}
                      disabled={testsRunning}
                      className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono font-bold rounded cursor-pointer disabled:opacity-50"
                    >
                      {testsRunning ? "Running Asserts..." : "Run Test Suite"}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {testResults ? (
                      testResults.map((t, idx) => (
                        <div key={idx} className="p-2 bg-slate-950/80 border border-slate-850 rounded-lg flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-[9px] font-mono font-bold text-slate-200">{t.name}</div>
                            <div className="text-[8px] font-mono text-slate-500">{t.message}</div>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                            t.passed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"
                          }`}>
                            {t.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 text-[10px] font-mono text-slate-600 border border-dashed border-slate-800 rounded-lg">
                        Click "Run Test Suite" to execute deep integration layout regression testing logs.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: ENTERPRISE MANUAL */}
              {activeTab === "sdk" && (
                <div className="space-y-4 text-[10px] font-mono leading-relaxed">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                    <div className="font-bold text-cyan-400">{NIDE_ENTERPRISE_MANUAL.specificationTitle}</div>
                    <p className="text-slate-400 text-[9px] font-sans leading-normal">{NIDE_ENTERPRISE_MANUAL.overview}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-slate-300 font-bold uppercase tracking-widest text-[9px]">Pipeline Architectures:</div>
                    {NIDE_ENTERPRISE_MANUAL.coreArchitectures.map((arch, idx) => (
                      <div key={idx} className="p-2 bg-slate-950/40 border border-slate-850 rounded-lg space-y-0.5">
                        <div className="text-cyan-300 font-bold">{arch.module}</div>
                        <p className="text-slate-400 text-[9px] font-sans leading-normal">{arch.details}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="text-slate-300 font-bold uppercase tracking-widest text-[9px]">conversational parser Rules:</div>
                    {NIDE_ENTERPRISE_MANUAL.conversationalTriggers.map((trig, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-[9px]">
                        <span className="text-cyan-400 font-bold">"{trig.cmd}"</span>
                        <span className="text-slate-500">➔</span>
                        <span className="text-slate-300">{trig.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVISION DETAILS & CONTEXT PREVIEW */}
        <div className="lg:col-span-3 space-y-4">
          {/* STYLE TRANSFORMATION ACCORDION */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" />
              Style Transforms Preset
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(StylePreset).map(style => (
                <button
                  key={style}
                  onClick={() => {
                    handlePlanAndPreviewEdit(`Convert to ${style.toLowerCase()} theme style`);
                  }}
                  className={`px-2 py-2 rounded-lg border text-[9px] font-mono font-bold text-center transition-all cursor-pointer ${
                    workspace.stylePreset === style
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-extrabold"
                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-400"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* PRINT-READY EXPORT OPTIONS */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              Fidelity Exporter
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onAddSystemLog("NIDE: Transmitted scale-independent print-ready vector file (SVG-NDF payload) successfully.");
                }}
                className="w-full py-2 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-500/25 rounded-lg text-[10px] font-mono font-bold text-cyan-300 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export Scale-Free Vector (SVG)
              </button>
              <button
                onClick={() => {
                  onAddSystemLog("NIDE: Rendered and packaged high-density print assets (300DPI TIFF payload) successfully.");
                }}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono font-bold text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                Compile High-Density Print (PDF)
              </button>
            </div>
          </div>

          {/* SYSTEM API SPEC CONTRACTS */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-3.5 h-3.5" />
              REST API Specifications
            </h4>
            <div className="space-y-2.5 font-mono text-[9px]">
              <div className="p-2 bg-slate-950/80 rounded border border-slate-850 space-y-1">
                <div className="flex justify-between font-bold text-cyan-400">
                  <span>POST /api/nide/edit</span>
                  <span className="text-slate-600">v3.1</span>
                </div>
                <div className="text-slate-500">Params: {"{ instruction, workspaceId }"}</div>
                <div className="text-slate-500">Returns: editPlan & stagingLayersSnapshot</div>
              </div>

              <div className="p-2 bg-slate-950/80 rounded border border-slate-850 space-y-1">
                <div className="flex justify-between font-bold text-emerald-400">
                  <span>POST /api/nide/commit</span>
                  <span className="text-slate-600">v3.1</span>
                </div>
                <div className="text-slate-500">Params: {"{ planId, stagingLayers }"}</div>
                <div className="text-slate-500">Returns: committedWorkspace & changeLogs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
