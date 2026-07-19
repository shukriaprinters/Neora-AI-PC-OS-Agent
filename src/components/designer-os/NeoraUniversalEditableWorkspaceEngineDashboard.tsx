// NEORA AI DESIGNER OS - UNIVERSAL EDITABLE WORKSPACE ENGINE (NUWE) DASHBOARD (PHASE 2.4)
import React, { useState, useEffect } from "react";
import {
  Flame, Sparkles, Layers, Sliders, Play, CheckCircle2, AlertTriangle, Code,
  Settings, RefreshCw, ZoomIn, ZoomOut, Download, Eye, EyeOff, Lock, Unlock,
  Trash2, Plus, Info, Palette, Type, ChevronRight, Terminal, Clock, ShieldCheck,
  Activity, Undo, Redo, Compass, Check, BookOpen, AlertCircle, Layout, HelpCircle
} from "lucide-react";

import {
  NeoraUniversalEditableWorkspaceEngine,
  NeoraDocument,
  NUWETestSuite,
  NUWE_DOCUMENTATION_MANUAL
} from "../../lib/ai/NeoraUniversalEditableWorkspaceEngine";
import { DSLObject } from "../../lib/ai/PromptCompiler";

interface NeoraUniversalEditableWorkspaceEngineDashboardProps {
  lang: "en" | "bn";
  onAddSystemLog: (msg: string) => void;
}

export function NeoraUniversalEditableWorkspaceEngineDashboard({ lang, onAddSystemLog }: NeoraUniversalEditableWorkspaceEngineDashboardProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "pipeline" | "conversational" | "audit" | "tests" | "sdk">("workspace");
  const [workspace, setWorkspace] = useState<NeoraDocument | null>(null);
  
  // Interactive UI configs
  const [zoom, setZoom] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showBleed, setShowBleed] = useState<boolean>(true);
  const [activeLayerId, setActiveLayerId] = useState<string>("");
  const [activeObjectId, setActiveObjectId] = useState<string>("");
  
  // New layer properties state
  const [newLayerName, setNewLayerName] = useState<string>("");
  
  // Conversational Command line input
  const [conversationalCommand, setConversationalCommand] = useState<string>("Convert to luxury style");
  const [conversationalFeedback, setConversationalFeedback] = useState<string>("");
  const [aiWorking, setAiWorking] = useState<boolean>(false);

  // Benchmarks audit state
  const [auditReport, setAuditReport] = useState<{ score: number; rules: any[] } | null>(null);

  // Test suite results
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [testsRunning, setTestsRunning] = useState<boolean>(false);

  // Initialize engine workspace instance on mount
  useEffect(() => {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    
    // Subscribe to engine state modifications
    const handleUpdate = (updatedDoc: NeoraDocument) => {
      setWorkspace({ ...updatedDoc });
      // Re-trigger layout audit on changes
      setAuditReport(engine.analyzeWorkspacePerformance());
    };
    
    engine.subscribe(handleUpdate);

    // Initial create
    if (!engine.getActiveWorkspace()) {
      engine.createNewWorkspace(
        "Alpona Festive Banner Project",
        "একটি সোনালী বাংলা আলপনা নকশা সহ ঐতিহ্যবাহী উৎসবের ব্যানার তৈরি করো"
      );
    } else {
      setWorkspace(engine.getActiveWorkspace());
      setAuditReport(engine.analyzeWorkspacePerformance());
    }

    return () => {
      engine.unsubscribe(handleUpdate);
    };
  }, []);

  // Update initial active IDs
  useEffect(() => {
    if (workspace && !activeLayerId && workspace.layers.length > 0) {
      setActiveLayerId(workspace.layers[workspace.layers.length - 1].id);
      if (workspace.layers[workspace.layers.length - 1].objects.length > 0) {
        setActiveObjectId(workspace.layers[workspace.layers.length - 1].objects[0].id);
      }
    }
  }, [workspace]);

  // Command Executors
  const handleCreateNewWorkspace = () => {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    const doc = engine.createNewWorkspace(
      "Traditional Durga Puja Banner",
      "ঐতিহ্যবাহী উৎসবের আলপনা এবং চমৎকার ক্যালিগ্রাফি সহ শুভ শারদীয়া ব্যানার"
    );
    onAddSystemLog(`NUWE: Initiated fresh interactive vector artboard: "${doc.name}"`);
  };

  const handleAddLayer = () => {
    if (!newLayerName.trim()) return;
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    const newL = engine.addLayer(newLayerName.trim());
    setNewLayerName("");
    setActiveLayerId(newL.id);
    onAddSystemLog(`NUWE LayerSystem: Injected editable layer: "${newL.name}"`);
  };

  const handleDeleteLayer = (layerId: string) => {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    engine.deleteLayer(layerId);
    if (activeLayerId === layerId) {
      setActiveLayerId("");
      setActiveObjectId("");
    }
    onAddSystemLog(`NUWE LayerSystem: Purged vector layer node.`);
  };

  const handleMoveLayer = (layerId: string, dir: "up" | "down") => {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    engine.moveLayer(layerId, dir);
  };

  const handleToggleVisibility = (layerId: string) => {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    engine.toggleLayerVisibility(layerId);
  };

  const handleToggleLock = (layerId: string) => {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    engine.toggleLayerLock(layerId);
  };

  const handleObjectPropertyUpdate = (key: string, val: any) => {
    if (!activeLayerId || !activeObjectId) return;
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    engine.updateObjectProperty(activeLayerId, activeObjectId, key, val);
  };

  const handleUndo = () => {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    if (engine.undo()) {
      onAddSystemLog("NUWE History: Undo command successfully triggered.");
    }
  };

  const handleRedo = () => {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    if (engine.redo()) {
      onAddSystemLog("NUWE History: Redo command successfully restored.");
    }
  };

  const handleAiCommandSubmit = async () => {
    if (!conversationalCommand.trim()) return;
    setAiWorking(true);
    setConversationalFeedback("Analyzing layout parameters and executing prompt...");
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    const result = await engine.executeConversationalAiCommand(conversationalCommand);
    
    setConversationalFeedback(result.feedbackMsg);
    setAiWorking(false);
    onAddSystemLog(`NUWE AI: Conversational design edit executed successfully -> "${conversationalCommand}"`);
  };

  const handleRunTests = async () => {
    setTestsRunning(true);
    onAddSystemLog("NUWE Test Suite: Launching regression metrics asserts.");
    const results = await NUWETestSuite.runAllTests();
    setTestResults(results);
    setTestsRunning(false);
    onAddSystemLog("NUWE Test Suite: Automated workspace schema regression tests complete.");
  };

  const activeObject = workspace?.layers
    .find(l => l.id === activeLayerId)
    ?.objects.find(o => o.id === activeObjectId);

  return (
    <div className="space-y-4 font-sans text-slate-100" id="nuwe_document_engine_dashboard">
      {/* BRAND HEADER BAR */}
      <div className="p-3.5 bg-gradient-to-r from-orange-950 to-slate-900 border border-orange-500/20 rounded-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center text-orange-400">
            <Layers className="w-5 h-5 text-orange-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              {lang === "bn" ? "নিওরা ইউনিভার্সাল এডিটেবল ওয়ার্কস্পেস (NUWE)" : "Neora Universal Editable Workspace (NUWE)"}
            </h3>
            <p className="text-[10px] text-orange-300 font-mono">
              Phase 2.4 • Provider-Agnostic NDF Format Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewWorkspace}
            className="px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> New Canvas
          </button>
        </div>
      </div>

      {/* METRICS & METADATA BAR */}
      {workspace && (
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-950 border border-slate-900 rounded-lg">
            <span className="text-[8px] font-mono text-slate-500 block">Active Project</span>
            <strong className="text-[10px] font-mono text-slate-200 truncate block">
              {workspace.name}
            </strong>
          </div>
          <div className="p-2 bg-slate-950 border border-slate-900 rounded-lg">
            <span className="text-[8px] font-mono text-slate-500 block">Resolution Bounds</span>
            <strong className="text-[10px] font-mono text-orange-400">
              {workspace.canvas.width}x{workspace.canvas.height} px
            </strong>
          </div>
          <div className="p-2 bg-slate-950 border border-slate-900 rounded-lg">
            <span className="text-[8px] font-mono text-slate-500 block">Total Layers</span>
            <strong className="text-[10px] font-mono text-indigo-400">
              {workspace.layers.length} Active
            </strong>
          </div>
          <div className="p-2 bg-slate-950 border border-slate-900 rounded-lg">
            <span className="text-[8px] font-mono text-slate-500 block">History Index</span>
            <strong className="text-[10px] font-mono text-emerald-400">
              V-{workspace.currentHistoryIndex + 1} / {workspace.history.length}
            </strong>
          </div>
        </div>
      )}

      {/* COMPILER ENGINE TABS */}
      <div className="flex border-b border-slate-900 overflow-x-auto gap-1 pb-1">
        {[
          { id: "workspace", label: "Interactive Vector Stage" },
          { id: "pipeline", label: "Document Format Tree" },
          { id: "conversational", label: "Conversational AI" },
          { id: "audit", label: "WCAG & Spacing Audit" },
          { id: "tests", label: "Engine Assertions" },
          { id: "sdk", label: "NDF Spec Manual" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-t-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === t.id 
                ? "bg-slate-900 text-orange-400 border-t-2 border-orange-500" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. INFINITE INTERACTIVE VECTOR CANVAS STAGE */}
      {activeTab === "workspace" && workspace && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
          {/* LEFT: LAYER CONTROLS AND STRUCTURE (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* ADD LAYER BOX */}
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
              <span className="text-[9px] font-mono uppercase text-slate-500 block">Incorporate New Design Layer</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Layer title (e.g. Calligraphy decor)..."
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-orange-500/40"
                />
                <button
                  onClick={handleAddLayer}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-mono font-bold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </div>

            {/* INTERACTIVE LAYER STACK LIST */}
            <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Layer Tree Hierarchy</span>
              
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {workspace.layers.map((layer, index) => {
                  const isActive = activeLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                        isActive 
                          ? "bg-orange-950/15 border-orange-500/40" 
                          : "bg-slate-900/40 border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setActiveLayerId(layer.id);
                          if (layer.objects.length > 0) {
                            setActiveObjectId(layer.objects[0].id);
                          } else {
                            setActiveObjectId("");
                          }
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Layout className="w-3.5 h-3.5 text-orange-400/80" />
                          <span className="text-xs font-bold text-slate-200 truncate max-w-[130px]">{layer.name}</span>
                        </div>
                        <span className="text-[8px] font-mono text-slate-500">
                          {layer.objects.length} vector nodes
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleVisibility(layer.id)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Toggle layer visibility"
                        >
                          {layer.isVisible ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                        </button>
                        <button
                          onClick={() => handleToggleLock(layer.id)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Toggle edit lock state"
                        >
                          {layer.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-slate-600" />}
                        </button>
                        <button
                          onClick={() => handleMoveLayer(layer.id, "up")}
                          disabled={index === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 text-[10px] font-bold font-mono"
                          title="Move layer up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveLayer(layer.id, "down")}
                          disabled={index === workspace.layers.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 text-[10px] font-bold font-mono"
                          title="Move layer down"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleDeleteLayer(layer.id)}
                          className="p-1 text-slate-500 hover:text-red-400"
                          title="Delete layer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NESTED VECTOR NODES LIST OF CURRENT ACTIVE LAYER */}
            {activeLayerId && (
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">
                  Vector Nodes inside active layer
                </span>
                
                <div className="space-y-1">
                  {workspace.layers.find(l => l.id === activeLayerId)?.objects.map(obj => {
                    const isSelected = activeObjectId === obj.id;
                    return (
                      <div
                        key={obj.id}
                        onClick={() => setActiveObjectId(obj.id)}
                        className={`p-1.5 rounded text-[11px] font-mono flex items-center justify-between cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-slate-900 text-orange-400 font-bold" 
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-orange-500" />
                          <span>{obj.name}</span>
                        </div>
                        <span className="text-[8px] bg-slate-900 text-slate-500 px-1 rounded uppercase">
                          {obj.type}
                        </span>
                      </div>
                    );
                  })}
                  {(!workspace.layers.find(l => l.id === activeLayerId)?.objects.length) && (
                    <div className="text-[10px] font-mono text-slate-500 py-2">
                      Empty Layer. Use Conversational AI or Vector pipeline to inject objects.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: VECTOR VIEWPORT STAGE & CANVAS CONTROLLER (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* VIEWPORT BAR */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-900 rounded-xl text-[10px] font-mono">
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:text-white rounded bg-slate-900 cursor-pointer">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold">{Math.round(zoom * 100)}% Canvas Zoom</span>
                <button onClick={() => setZoom(z => Math.min(2.0, z + 0.1))} className="p-1 hover:text-white rounded bg-slate-900 cursor-pointer">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} className="rounded text-orange-500 border-slate-800 bg-slate-900 focus:ring-0" />
                  <span>Grid</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={showBleed} onChange={() => setShowBleed(!showBleed)} className="rounded text-orange-500 border-slate-800 bg-slate-900 focus:ring-0" />
                  <span>Bleed MM</span>
                </label>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={handleUndo} className="p-1 hover:text-white rounded bg-slate-900 cursor-pointer" title="Undo visual state edit">
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleRedo} className="p-1 hover:text-white rounded bg-slate-900 cursor-pointer" title="Redo visual state edit">
                  <Redo className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ARTBOARD GRAPHICS SIMULATION STAGE */}
            <div 
              className="w-full aspect-square bg-slate-950 rounded-xl border border-slate-900 relative overflow-hidden flex flex-col justify-between p-4 shadow-2xl" 
              style={{ 
                backgroundColor: workspace.layers.find(l => l.id === "layer_background")?.objects[0]?.properties.fillColor || "#0f172a" 
              }}
            >
              {/* Bleed outline */}
              {showBleed && (
                <div className="absolute inset-2.5 border-2 border-dashed border-red-500/20 rounded pointer-events-none flex items-start justify-end p-1">
                  <span className="text-[7px] text-red-500 font-mono tracking-widest uppercase">PRINT BLEED SAFE AREA</span>
                </div>
              )}

              {/* Grid layout lines overlay */}
              {showGrid && (
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-[0.03] border border-slate-100">
                  <div className="border-r border-b border-slate-100" />
                  <div className="border-r border-b border-slate-100" />
                  <div className="border-r border-b border-slate-100" />
                  <div className="border-r border-b border-slate-100" />
                  <div className="border-r border-b border-slate-100" />
                  <div className="border-b border-slate-100" />
                </div>
              )}

              {/* RENDERED INTERACTIVE OBJECTS */}
              <div className="flex-1 relative flex flex-col items-center justify-center p-4">
                {workspace.layers.map(layer => {
                  if (!layer.isVisible) return null;
                  return (
                    <div key={layer.id} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      {layer.objects.map(obj => {
                        const isSelected = activeObjectId === obj.id;
                        const textVal = obj.properties.textReference || "Native Calligraphy";
                        const isCalligraphy = obj.type === "CalligraphyGroup";
                        
                        return (
                          <div
                            key={obj.id}
                            className={`pointer-events-auto cursor-pointer rounded transition-all text-center flex flex-col items-center justify-center absolute ${
                              isSelected ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950 p-2" : "p-1"
                            }`}
                            onClick={() => {
                              setActiveLayerId(layer.id);
                              setActiveObjectId(obj.id);
                            }}
                            style={{
                              opacity: obj.opacity || 1.0,
                              transform: `scale(${zoom})`,
                              top: `${(obj.y / workspace.canvas.height) * 100}%`,
                              left: `${(obj.x / workspace.canvas.width) * 100}%`,
                              width: `${(obj.width / workspace.canvas.width) * 100}%`,
                              height: `${(obj.height / workspace.canvas.height) * 100}%`,
                            }}
                          >
                            {isCalligraphy ? (
                              <div className="space-y-1">
                                <h1 
                                  className="text-lg md:text-2xl font-bold tracking-wide" 
                                  style={{ color: obj.properties.strokeColor || "#fff", fontFamily: obj.properties.fontFamily }}
                                >
                                  {textVal}
                                </h1>
                                <p className="text-[7px] font-mono uppercase opacity-50 text-slate-300">
                                  ✐ Editable Calligraphy Vector
                                </p>
                              </div>
                            ) : obj.type === "DecorativePattern" ? (
                              <div className="w-full h-full border border-orange-500/20 px-2 py-4 bg-slate-900/55 rounded flex flex-col items-center justify-center text-center">
                                <span className="text-xl">🏵</span>
                                <span className="text-[8px] font-mono text-orange-400 font-bold uppercase mt-1">
                                  {obj.properties.style || "Traditional"} Ornament
                                </span>
                              </div>
                            ) : obj.type === "Text" ? (
                              <div className="space-y-1">
                                <p 
                                  className="text-[10px] font-semibold uppercase tracking-wider"
                                  style={{ color: obj.properties.textColor || "#fff", fontFamily: obj.properties.fontFamily }}
                                >
                                  {textVal}
                                </p>
                              </div>
                            ) : (
                              <div className="w-full h-full bg-slate-900/60 border border-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400">
                                {obj.name}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Stage bottom info bar */}
              <div className="z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded p-1.5 flex items-center justify-between text-[8px] font-mono text-slate-400">
                <span>Viewport Resolution: {workspace.canvas.width}x{workspace.canvas.height} (1:1 NDF Frame)</span>
                <span className="text-orange-400 uppercase font-bold">Vector High-Fidelity Active</span>
              </div>
            </div>

            {/* QUICK EDIT VECTOR OBJECT VALUE PROPERTIES PANEL */}
            {activeObject && (
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase text-slate-500">Node Property Inspector</span>
                  <span className="text-[8px] font-mono text-orange-400">{activeObject.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[8px] font-mono text-slate-500 mb-0.5">Y Position Ratio</label>
                    <input
                      type="number"
                      value={activeObject.y}
                      onChange={(e) => handleObjectPropertyUpdate("y", parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  {(activeObject.type === "CalligraphyGroup" || activeObject.type === "Text") && (
                    <div>
                      <label className="block text-[8px] font-mono text-slate-500 mb-0.5">Editable Label</label>
                      <input
                        type="text"
                        value={activeObject.properties.textReference || ""}
                        onChange={(e) => handleObjectPropertyUpdate("textReference", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                  {activeObject.type === "Shape" && (
                    <div>
                      <label className="block text-[8px] font-mono text-slate-500 mb-0.5">Shape Color</label>
                      <input
                        type="text"
                        value={activeObject.properties.fillColor || ""}
                        onChange={(e) => handleObjectPropertyUpdate("fillColor", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. NDF COMPLIANT NATIVE FORMAT MODEL VISUALIZATION */}
      {activeTab === "pipeline" && workspace && (
        <div className="space-y-3 animate-fade-in">
          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-bold font-mono text-slate-200 uppercase">Native Document Format Metadata Schema</h4>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg text-xs font-mono space-y-2">
              <div>
                <span className="text-slate-500 block">Workspace ID:</span>
                <span className="text-slate-200">{workspace.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Design Tokens Configured:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {workspace.tokens.map(tok => (
                    <span key={tok.id} className="px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded text-[9px] flex items-center gap-1">
                      {tok.category === "color" && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tok.value }} />
                      )}
                      {tok.name}: <strong>{tok.value}</strong>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Comments on Canvas:</span>
                <div className="space-y-1.5 mt-1.5">
                  {workspace.comments.map(comm => (
                    <div key={comm.id} className="p-2 bg-slate-950 border border-slate-900 rounded-md text-[10px] text-slate-300">
                      <div className="flex justify-between font-bold text-orange-400 text-[9px]">
                        <span>{comm.author}</span>
                        <span>{new Date(comm.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="mt-0.5">{comm.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONVERSATIONAL AI DESIGN TERMINAL */}
      {activeTab === "conversational" && (
        <div className="space-y-3 animate-fade-in">
          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-400 animate-pulse" />
              <h4 className="text-xs font-bold font-mono text-slate-200 uppercase">Interactive Prompt Editor Command Terminal</h4>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Enter semantic design commands to instruct the AI editor to perform non-destructive transformations on the canvas vectors.
            </p>

            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={conversationalCommand}
                  onChange={(e) => setConversationalCommand(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Convert to luxury style..."
                />
                <button
                  onClick={handleAiCommandSubmit}
                  disabled={aiWorking}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-800 hover:opacity-95 text-white rounded text-xs font-mono font-bold cursor-pointer disabled:opacity-50"
                >
                  Execute
                </button>
              </div>

              {conversationalFeedback && (
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-[10px] font-mono text-orange-300">
                  {conversationalFeedback}
                </div>
              )}
            </div>

            {/* PRESETS BUTTONS */}
            <div className="space-y-1 pt-2">
              <span className="text-[8px] font-mono uppercase text-slate-500 block">Try Conversational Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Move title to top",
                  "Increase spacing",
                  "Convert to luxury style",
                  "Translate into Bangla"
                ].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => setConversationalCommand(cmd)}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded text-[10px] font-mono cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. WCAG & ACCESSIBILITY AUDIT */}
      {activeTab === "audit" && auditReport && (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4 p-4 bg-slate-950 border border-slate-900 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-mono uppercase text-slate-500 block mb-2">Workspace Design Integrity</span>
              <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 flex items-center justify-center text-xl font-bold font-mono text-orange-400">
                {auditReport.score}%
              </div>
              <span className="text-[9px] font-mono text-emerald-400 mt-2 uppercase font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Checked Safe
              </span>
            </div>

            <div className="md:col-span-8 p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Rule Evaluation Log</span>
              
              <div className="space-y-2">
                {auditReport.rules.map((rule, i) => (
                  <div key={i} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-start gap-2.5">
                    {rule.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="text-[10px] font-mono">
                      <div className="font-bold text-slate-200">{rule.name}</div>
                      <span className="text-slate-400 text-[9px] leading-relaxed block">{rule.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. REGRESSION UNIT TESTING */}
      {activeTab === "tests" && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-900 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 pl-2">Engine Unit & Integration Tests</span>
            <button
              onClick={handleRunTests}
              disabled={testsRunning}
              className="px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3" /> Run Tests
            </button>
          </div>

          {testResults && (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {testResults.map((test, i) => (
                <div key={i} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-start gap-2 text-[10px] font-mono">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-slate-200">{test.name}</div>
                    <span className="text-[8px] text-slate-400 block">
                      Status: {test.passed ? "PASS (perfect match)" : `FAILED: ${test.error}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TECHNICAL DOCUMENTATION SDK */}
      {activeTab === "sdk" && (
        <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1 animate-fade-in text-xs font-mono">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
            <h4 className="font-bold text-orange-400 flex items-center gap-1">
              <Code className="w-4 h-4" /> {NUWE_DOCUMENTATION_MANUAL.specificationTitle}
            </h4>
            <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
              {NUWE_DOCUMENTATION_MANUAL.intro}
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-orange-400 block">NDF Format Structure Example</span>
            <pre className="p-3 bg-slate-900 rounded text-[9px] text-indigo-300 overflow-x-auto">
              {NUWE_DOCUMENTATION_MANUAL.structureGuide.trim()}
            </pre>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-orange-400 block">Conversational AI Engine Commands Syntax</span>
            <pre className="p-3 bg-slate-900 rounded text-[9px] text-emerald-300 overflow-x-auto">
              {NUWE_DOCUMENTATION_MANUAL.conversationalGuide.trim()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
