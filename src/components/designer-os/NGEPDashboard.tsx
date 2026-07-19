// NEORA ADVANCED IMAGE EDITING & GENERATIVE PLATFORM (NGEP) DASHBOARD
import React, { useState, useEffect } from "react";
import {
  Layers, Activity, Sparkles, Sliders, Wand2, Eraser, ShieldCheck, History,
  Undo2, Redo2, Scissors, Crop, Lock, Unlock, Eye, EyeOff, Type, Image as ImageIcon,
  Search, Download, RefreshCw, SlidersHorizontal, Check, Plus, Trash2, HelpCircle,
  Maximize2, Play, Info, AlertCircle, AlertTriangle, Heart, Brush, Compass, Database
} from "lucide-react";
import { NGEP, NgepProjectState, NgepLayer, NgepEvent, NgepTelemetry, NgepQualityAudit, NgepAdjustment } from "../../lib/ai/cognitive/NGEP";
import { EnterpriseKernel } from "../../lib/ai/cognitive/EnterpriseKernel";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function NGEPDashboard({ lang, onAddSystemLog }: Props) {
  const ngep = NGEP.getInstance();
  const kernel = EnterpriseKernel.getInstance();
  const [serviceStatus, setServiceStatus] = useState<string>("running");

  // Primary Workspace State binding
  const [state, setState] = useState<NgepProjectState>(ngep.getProjectState());
  const [telemetry, setTelemetry] = useState<NgepTelemetry>(ngep.getTelemetry());
  const [historyEvents, setHistoryEvents] = useState<NgepEvent[]>(ngep.getEventHistory());

  // Workspace controls
  const [activeTab, setActiveTab] = useState<"canvas" | "specifications" | "audit">("canvas");
  const [qualityAudit, setQualityAudit] = useState<NgepQualityAudit | null>(null);

  // Sub-forms and helper state
  const [genPrompt, setGenPrompt] = useState("Vibrant Crimson sunset reflecting on ancient Bengali terracotta temple pillars");
  const [isExpanding, setIsExpanding] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState<string[]>([]);
  const [maskType, setMaskType] = useState<"person" | "foreground" | "background" | "color_range">("foreground");
  const [maskFeather, setMaskFeather] = useState(8);
  
  // Calligraphy Form
  const [calligraphyText, setCalligraphyText] = useState("শুভ নববর্ষ ১৪৩৩");
  const [calligraphyLang, setCalligraphyLang] = useState<"bn" | "en" | "ar" | "ur">("bn");
  const [calligraphyStyle, setCalligraphyStyle] = useState("modern_bengali");
  const [calligraphySize, setCalligraphySize] = useState(38);

  // Adjustments Form (binds to active layer)
  const [brightness, setBrightness] = useState(12);
  const [contrast, setContrast] = useState(15);
  const [exposure, setExposure] = useState(0.4);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(20);
  const [lightness, setLightness] = useState(0);

  // Filter Form
  const [newFilterType, setNewFilterType] = useState<"gaussian_blur" | "glow" | "sharpen" | "vintage_grain">("glow");
  const [newFilterIntensity, setNewFilterIntensity] = useState(45);

  // Custom named snapshot
  const [snapshotName, setSnapshotName] = useState("");

  // ==========================================
  // AEIGEP UI STATES
  // ==========================================
  const [semanticPrompt, setSemanticPrompt] = useState("Move traditional calligraphy accent upward and apply gold luxury palette");
  const [isProcessingSemantic, setIsProcessingSemantic] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisPanelActive, setAnalysisPanelActive] = useState(false);
  const [activeBrushType, setActiveBrushType] = useState<"healing" | "remove" | "replace" | "shadow" | "reflection">("healing");
  const [brushSize, setBrushSize] = useState(24);
  const [brushHardness, setBrushHardness] = useState(75);
  const [brushStrength, setBrushStrength] = useState(90);
  const [liquifyMode, setLiquifyMode] = useState<"face" | "object" | "mesh" | "perspective">("mesh");
  const [liquifyStrength, setLiquifyStrength] = useState(25);
  const [newRefName, setNewRefName] = useState("");
  const [newRefType, setNewRefType] = useState<"image" | "sketch" | "brand_guide" | "moodboard" | "logo" | "palette">("moodboard");

  useEffect(() => {
    // Subscribe to state mutators
    const unsubscribe = ngep.subscribe((freshState) => {
      setState(freshState);
      setHistoryEvents(ngep.getEventHistory());
    });

    const handleKernelUpdate = () => {
      const status = kernel.getServices().find(s => s.id === "nge")?.status || "running";
      setServiceStatus(status);
    };

    handleKernelUpdate();

    const unsubscribeKernel = kernel.subscribe((ev) => {
      if (ev.topic === "ServiceStatusChanged") {
        handleKernelUpdate();
      }
    });

    // Auto load current audit
    setQualityAudit(ngep.runQualityAudit());

    // Live telemetry tracker simulating computing metrics
    const timer = setInterval(() => {
      setTelemetry(ngep.getTelemetry());
    }, 2000);

    return () => {
      unsubscribe();
      unsubscribeKernel();
      clearInterval(timer);
    };
  }, []);

  // Synchronize adjustment panel when active layer changes
  useEffect(() => {
    if (!state.activeLayerId) return;
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (activeLayer && activeLayer.adjustment) {
      const adj = activeLayer.adjustment.params;
      setBrightness(adj.brightness ?? 0);
      setContrast(adj.contrast ?? 0);
      setExposure(adj.exposure ?? 0);
      setHue(adj.hue ?? 0);
      setSaturation(adj.saturation ?? 0);
      setLightness(adj.lightness ?? 0);
    } else {
      // reset defaults
      setBrightness(0);
      setContrast(0);
      setExposure(0);
      setHue(0);
      setSaturation(0);
      setLightness(0);
    }
  }, [state.activeLayerId]);

  // Viewport controllers
  const handleZoomIn = () => ngep.updateViewport(parseFloat((state.zoom + 0.15).toFixed(2)), state.panX, state.panY);
  const handleZoomOut = () => ngep.updateViewport(Math.max(0.2, parseFloat((state.zoom - 0.15).toFixed(2))), state.panX, state.panY);
  const handleResetView = () => ngep.updateViewport(1.0, 0, 0);

  // Layer toggles
  const handleToggleVisibility = (layerId: string, current: boolean) => {
    ngep.updateLayer(layerId, { visible: !current });
  };

  const handleToggleLock = (layerId: string, current: boolean) => {
    ngep.updateLayer(layerId, { locked: !current });
  };

  const handleDeleteLayer = (layerId: string) => {
    ngep.deleteLayer(layerId);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Discarded non-destructive layer context: ${layerId}`);
    }
  };

  // Adjustments updater
  const triggerAdjustmentApply = () => {
    if (!state.activeLayerId) return;
    const adj: NgepAdjustment = {
      type: "brightness_contrast",
      params: { brightness, contrast, exposure, hue, saturation, lightness }
    };
    ngep.applyAdjustment(state.activeLayerId, adj);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Real-time update to adjust layer properties on ${state.activeLayerId}`);
    }
  };

  // Smart Masking handler
  const triggerSmartMask = () => {
    if (!state.activeLayerId) return;
    ngep.generateSmartMask(state.activeLayerId, maskType as any, maskFeather);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Computed intelligent vector segment mask [${maskType}]`);
    }
    setQualityAudit(ngep.runQualityAudit());
  };

  // Generative Fill
  const triggerGenerativeFill = async () => {
    if (!state.activeLayerId) return;
    setIsProcessingAI(true);
    setAiProgress(["[1/4] Scanning layer masks & edge bounds...", "[2/4] Allocating GPU cluster nodes..."]);

    const steps = [
      "Translating prompt aesthetics into canvas layers...",
      "Synthesizing new vector shapes via generative latent spaces...",
      "Resolving lighting, shadows, and perspective grid parameters...",
      "Finalizing multi-layer non-destructive composition outputs."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      setAiProgress(prev => [...prev, `[${i + 2}/4] ${steps[i]}`]);
    }

    await ngep.performGenerativeFill(state.activeLayerId, genPrompt, isExpanding);
    setIsProcessingAI(false);
    setAiProgress([]);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Generative content successfully injected into active canvas workspace.`);
    }
    setQualityAudit(ngep.runQualityAudit());
  };

  // Restorations
  const triggerRestoration = async (type: "upscale" | "colorization" | "deblur" | "old_photo_repair") => {
    if (!state.activeLayerId) return;
    setIsProcessingAI(true);
    setAiProgress([`[1/2] Processing ${type.toUpperCase()} network pipelines...`]);
    await new Promise(r => setTimeout(r, 800));
    setAiProgress(prev => [...prev, `[2/2] Rebuilding pixels, texture grids & color maps...`]);
    await new Promise(r => setTimeout(r, 600));

    await ngep.performAiRestoration(state.activeLayerId, type);
    setIsProcessingAI(false);
    setAiProgress([]);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Layer pixels reconstructed cleanly using deep convolutional neural models.`);
    }
    setQualityAudit(ngep.runQualityAudit());
  };

  // Calligraphy adder
  const handleAddCalligraphyLayer = () => {
    const layerId = `calligraphy-${Date.now()}`;
    const newLayer: NgepLayer = {
      id: layerId,
      name: `Calligraphy Text (${calligraphyText.slice(0, 10)})`,
      type: "text_calligraphy",
      visible: true,
      locked: false,
      opacity: 1.0,
      blendMode: "normal",
      x: 180,
      y: 200,
      width: 440,
      height: 90,
      rotation: 0,
      textPayload: {
        text: calligraphyText,
        fontFamily: calligraphyLang === "bn" ? "Noto Serif Bengali" : calligraphyLang === "ar" ? "Amiri" : "Inter",
        fontSize: calligraphySize,
        color: "#ffffff",
        language: calligraphyLang,
        calligraphyStyle
      },
      confidenceScore: 0.99
    };
    ngep.addLayer(newLayer);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Calligraphy text object added to non-destructive layers stack.`);
    }
  };

  // Filters adder
  const handleAddFilterLayer = () => {
    if (!state.activeLayerId) return;
    ngep.addFilter(state.activeLayerId, newFilterType, newFilterIntensity);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Pushed filter stacked [${newFilterType}] directly onto selected layer.`);
    }
  };

  // Warp mesh applier
  const handleApplyWarpMesh = (gridSize: number) => {
    if (!state.activeLayerId) return;
    ngep.applyWarpMesh(state.activeLayerId, gridSize, gridSize);
  };

  // Save historical snapshot
  const triggerSaveSnapshot = () => {
    const label = snapshotName.trim() || `Milestone state ${state.layers.length} L`;
    ngep.saveNamedSnapshot(label);
    setSnapshotName("");
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Created historical timeline milestone: ${label}`);
    }
  };

  const handleRunAudit = () => {
    setQualityAudit(ngep.runQualityAudit());
  };

  // ==========================================
  // AEIGEP PLATFORM ACTION HANDLERS
  // ==========================================
  const triggerAnalyzeImage = async () => {
    if (!state.activeLayerId) return;
    setIsAnalyzingImage(true);
    setAnalysisPanelActive(true);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Scanning layer pixels for visual objects, brand DNA, and lighting harmony.`);
    }
    await ngep.analyzeImage(state.activeLayerId);
    setIsAnalyzingImage(false);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Successfully extracted comprehensive scene graphs and design DNA.`);
    }
    setQualityAudit(ngep.runQualityAudit());
  };

  const triggerSemanticEdit = async () => {
    if (!state.activeLayerId || !semanticPrompt.trim()) return;
    setIsProcessingSemantic(true);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Natural language semantic query dispatched to AI parser.`);
    }
    await ngep.understandPromptAndApply(state.activeLayerId, semanticPrompt);
    setIsProcessingSemantic(false);
    setSemanticPrompt("");
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Non-destructive layout & style layers recalculated.`);
    }
    setQualityAudit(ngep.runQualityAudit());
  };

  const triggerApplyBrush = () => {
    if (!state.activeLayerId) return;
    ngep.applyAiBrush(
      state.activeLayerId,
      activeBrushType,
      [{ x: 150, y: 150 }, { x: 180, y: 190 }, { x: 250, y: 220 }],
      brushSize,
      brushStrength
    );
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Applied brush stroke using [${activeBrushType}] brush at size ${brushSize}px.`);
    }
  };

  const triggerApplyLiquify = () => {
    if (!state.activeLayerId) return;
    ngep.applyAiLiquify(state.activeLayerId, liquifyMode, liquifyStrength);
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Executed non-destructive [${liquifyMode.toUpperCase()}] liquify deforming grids.`);
    }
  };

  const triggerAddReference = () => {
    if (!newRefName.trim()) return;
    ngep.addReference({
      name: newRefName,
      type: newRefType,
      active: true
    });
    setNewRefName("");
    if (onAddSystemLog) {
      onAddSystemLog(`NGEP: Dynamic multi-reference reference file attached: "${newRefName}"`);
    }
  };

  const triggerToggleReference = (id: string) => {
    ngep.toggleReference(id);
  };

  const triggerRemoveReference = (id: string) => {
    ngep.removeReference(id);
  };

  const activeLayerObj = state.layers.find(l => l.id === state.activeLayerId);

  if (serviceStatus === "stopped") {
    return (
      <div className="p-8 bg-slate-950 text-slate-100 rounded-xl border border-red-900/30 space-y-6 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 animate-pulse">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === "bn" ? "নিওরা ওএস জেনারেটিভ এডিটিং সার্ভিস অফলাইন" : "Generative Editing & Image Processing Service Offline"}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "bn" 
              ? "নিওরা NGE ডোমেন সার্ভিসটি সেন্ট্রাল অপারেটিং কার্নেলে বন্ধ করা হয়েছে। লেয়ার প্রসেসিং, অ্যাডজাস্টমেন্ট ফিল্টার এবং জেনারেটিভ এআই ইমেজ ইনপেইন্টিং সাময়িকভাবে বন্ধ আছে।" 
              : "The Neora NGE domain service has been stopped in the central Enterprise Kernel. Non-destructive layer processing, color adjustment filters, and generative AI image inpainting are temporarily offline."}
          </p>
        </div>
        <button
          onClick={() => kernel.startService("nge")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded transition flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          {lang === "bn" ? "সার্ভিস পুনরায় চালু করুন" : "Start Graphics Service"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl" id="ngep-root-container">
      
      {/* HEADER SECTION PANEL */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-850">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">NGEP Engine v4.8</span>
              <span className="px-1.5 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[9px] font-mono uppercase font-semibold">Non-Destructive</span>
            </div>
            <h1 className="text-xs text-slate-300 font-semibold">{lang === "bn" ? "নিওরা অ্যাডভান্সড ইমেজ ও জেনারেটিভ এডিটিং ওয়ার্কস্পেস" : "Neora Professional Image & Generative Editing Platform"}</h1>
          </div>
        </div>

        {/* QUICK ACTIONS ROW */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => ngep.undo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 transition-all border border-slate-700/50"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => ngep.redo()}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 transition-all border border-slate-700/50"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          
          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleRunAudit}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === "bn" ? "কোয়ালিটি অডিট" : "RUN AUDIT"}
          </button>

          <button
            onClick={() => {
              if (onAddSystemLog) onAddSystemLog("NGEP: Generated printable workspace archive (PSD/PNG formats packages)");
            }}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {lang === "bn" ? "এক্সপোর্ট" : "EXPORT PROJECT"}
          </button>
        </div>
      </div>

      {/* CORE SPLIT WORKSPACE INTERACTIVE GRID */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        
        {/* COLUMN 1: LEFT TOOL RAIL */}
        <div className="col-span-1 bg-slate-900/60 border-r border-slate-900 flex flex-col items-center py-4 gap-2.5 shrink-0">
          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider mb-2">Tools</span>
          {[
            { id: "select", icon: Scissors, label: lang === "bn" ? "সিলেক্ট" : "Select Layer", color: "hover:text-cyan-400 hover:bg-cyan-500/10" },
            { id: "smart_mask", icon: Crop, label: lang === "bn" ? "স্মার্ট মাস্ক" : "AI Masking", color: "hover:text-fuchsia-400 hover:bg-fuchsia-500/10" },
            { id: "generative_fill", icon: Wand2, label: lang === "bn" ? "জেনারেটিভ ফিল" : "Generative Fill", color: "hover:text-amber-400 hover:bg-amber-500/10" },
            { id: "adjustments", icon: SlidersHorizontal, label: lang === "bn" ? "অ্যাডজাস্টমেন্ট" : "Color Adjusts", color: "hover:text-rose-400 hover:bg-rose-500/10" },
            { id: "filters", icon: Sliders, label: lang === "bn" ? "ফিল্টার" : "Filters Stack", color: "hover:text-indigo-400 hover:bg-indigo-500/10" },
            { id: "calligraphy", icon: Type, label: lang === "bn" ? "ক্যালিগ্রাফি" : "Calligraphy", color: "hover:text-emerald-400 hover:bg-emerald-500/10" },
            { id: "retouch", icon: Eraser, label: lang === "bn" ? "রিটাচ" : "Retouch & Repair", color: "hover:text-pink-400 hover:bg-pink-500/10" },
            { id: "warp", icon: Maximize2, label: lang === "bn" ? "ওয়ার্প" : "Perspective Warp", color: "hover:text-yellow-400 hover:bg-yellow-500/10" }
          ].map((tool) => {
            const Icon = tool.icon;
            const isSelected = state.activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => ngep.setActiveTool(tool.id as any)}
                title={tool.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                  isSelected 
                    ? "bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950/25" 
                    : `text-slate-400 ${tool.color}`
                }`}
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[9px] font-sans whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* COLUMN 2: CENTER WORKSPACE AND PREVIEW CANVASES */}
        <div className="col-span-7 bg-slate-950 flex flex-col overflow-hidden relative">
          
          {/* TAB BAR PREVIEW CONTROL */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/40 border-b border-slate-900">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("canvas")}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeTab === "canvas" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang === "bn" ? "লাইভ ক্যানভাস" : "Interactive Viewport Canvas"}
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeTab === "specifications" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang === "bn" ? "ডিজাইন বিবরণী" : "NGEP Design Specifications"}
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  activeTab === "audit" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang === "bn" ? "অডিট লগ" : "Advanced Quality Audit"}
              </button>
            </div>

            {/* VIEWPORT ZOOM BAR */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <button onClick={handleZoomOut} className="p-1 rounded hover:bg-slate-800 text-slate-400"><Search className="w-3 h-3" /></button>
              <span className="min-w-10 text-center text-[10px] font-semibold text-slate-400">{Math.round(state.zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="p-1 rounded hover:bg-slate-800 text-slate-400"><Maximize2 className="w-3 h-3" /></button>
              <button onClick={handleResetView} className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-400 text-[9px] font-bold">1:1</button>
            </div>
          </div>

          {/* VIEWPORT STAGE */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            
            {/* FLOATING DESIGN DNA SCANNER REPORT OVERLAY */}
            {activeTab === "canvas" && analysisPanelActive && (
              <div className="absolute top-4 left-4 w-72 max-h-[85%] overflow-y-auto bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3.5 font-sans text-xs backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="font-mono font-bold text-slate-200 uppercase tracking-wide text-[10px]">Multimodal Design DNA Map</span>
                  </div>
                  <button onClick={() => setAnalysisPanelActive(false)} className="text-slate-500 hover:text-slate-300">
                    ✕
                  </button>
                </div>

                {activeLayerObj?.sceneGraph ? (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 space-y-1">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Aesthetic Intent & Genre</span>
                      <p className="text-slate-200 text-[11px] font-semibold leading-snug">{activeLayerObj.sceneGraph.designDNA.style}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Detected Design Entities ({activeLayerObj.sceneGraph.objects.length})</span>
                      <div className="space-y-1">
                        {activeLayerObj.sceneGraph.objects.map((obj, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-850/60 font-mono text-[9.5px]">
                            <span className="text-slate-300 font-semibold">{obj.label}</span>
                            <span className="text-cyan-400 font-bold">{Math.round(obj.confidence * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Semantic Color Blueprint</span>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                        {activeLayerObj.sceneGraph.colorPalette.map((palette, i) => (
                          <div key={i} className="col-span-2 grid grid-cols-2 gap-1.5">
                            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded border border-slate-850">
                              <span className="w-3.5 h-3.5 rounded border border-white/10 shrink-0" style={{ backgroundColor: palette.primary }} />
                              <div className="overflow-hidden">
                                <span className="text-slate-200 block truncate font-bold">{palette.primary}</span>
                                <span className="text-[7.5px] text-slate-500 block truncate">Primary</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded border border-slate-850">
                              <span className="w-3.5 h-3.5 rounded border border-white/10 shrink-0" style={{ backgroundColor: palette.secondary }} />
                              <div className="overflow-hidden">
                                <span className="text-slate-200 block truncate font-bold">{palette.secondary}</span>
                                <span className="text-[7.5px] text-slate-500 block truncate">Secondary</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded border border-slate-850 col-span-2">
                              <span className="w-3.5 h-3.5 rounded border border-white/10 shrink-0" style={{ backgroundColor: palette.accent }} />
                              <div className="overflow-hidden">
                                <span className="text-slate-200 block truncate font-bold">{palette.accent}</span>
                                <span className="text-[7.5px] text-slate-500 block truncate">Accent ({palette.harmony} / {palette.accessibility})</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 space-y-1 text-[10px]">
                      <div className="flex justify-between font-mono text-[8.5px]">
                        <span className="text-slate-500 uppercase">Lighting Vector</span>
                        <span className="text-cyan-400 font-bold">{activeLayerObj.sceneGraph.lighting.direction}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[8.5px]">
                        <span className="text-slate-500 uppercase">Alignment Grid</span>
                        <span className="text-cyan-400 font-bold">{activeLayerObj.sceneGraph.layout.alignment}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 font-mono text-[10px] space-y-2">
                    <p>No active DNA map found for this layer.</p>
                    <button
                      onClick={triggerAnalyzeImage}
                      disabled={isAnalyzingImage}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9px] uppercase tracking-wider"
                    >
                      Extract DNA Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "canvas" && (
              <div 
                className="relative bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300"
                style={{
                  width: `${state.canvasWidth}px`,
                  height: `${state.canvasHeight}px`,
                  transform: `scale(${state.zoom}) translate(${state.panX}px, ${state.panY}px)`
                }}
              >
                {/* RENDER ACTIVE NON-DESTRUCTIVE LAYERS STACK */}
                {state.layers.map((layer) => {
                  if (!layer.visible) return null;

                  const isSelected = layer.id === state.activeLayerId;
                  const filterStyle = layer.filters
                    ?.filter(f => f.visible)
                    ?.map(f => {
                      if (f.type === "gaussian_blur") return `blur(${f.intensity / 8}px)`;
                      if (f.type === "sharpen") return `contrast(${100 + f.intensity}%) saturate(${100 + f.intensity / 2}%)`;
                      if (f.type === "vintage_grain") return `sepia(${f.intensity}%) contrast(110%)`;
                      return "";
                    }).join(" ") || "";

                  const layerStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${layer.x}px`,
                    top: `${layer.y}px`,
                    width: `${layer.width}px`,
                    height: `${layer.height}px`,
                    transform: `rotate(${layer.rotation}deg)`,
                    opacity: layer.opacity,
                    mixBlendMode: layer.blendMode,
                    filter: filterStyle,
                    zIndex: 10
                  };

                  return (
                    <div 
                      key={layer.id}
                      style={layerStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        ngep.selectLayer(layer.id);
                      }}
                      className={`group select-none cursor-pointer ${
                        isSelected ? "outline-2 outline-dashed outline-cyan-500/80 outline-offset-1" : "hover:outline hover:outline-dashed hover:outline-slate-500/40"
                      }`}
                    >
                      {/* 1. RASTER SOURCE RENDERING */}
                      {layer.type === "raster_source" && (
                        <div className="w-full h-full relative">
                          <img 
                            src={layer.renderedAssetUrl} 
                            alt={layer.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-sm pointer-events-none"
                            style={{
                              filter: layer.adjustment ? `
                                brightness(${100 + (layer.adjustment.params.brightness ?? 0)}%)
                                contrast(${100 + (layer.adjustment.params.contrast ?? 0)}%)
                                saturate(${100 + (layer.adjustment.params.saturation ?? 0)}%)
                                hue-rotate(${layer.adjustment.params.hue ?? 0}deg)
                              ` : ""
                            }}
                          />
                          {layer.mask && layer.mask.visible && (
                            <div className="absolute inset-0 bg-fuchsia-500/10 pointer-events-none border border-fuchsia-500/30">
                              <span className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 text-[8px] font-mono">
                                AI MASK ACTIVE ({layer.mask.feather}px)
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. GENERATIVE INPAINT LAYER */}
                      {layer.type === "generative_fill" && (
                        <div className="w-full h-full relative">
                          <img 
                            src={layer.renderedAssetUrl} 
                            alt={layer.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover border border-amber-500/40 rounded-sm pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none flex items-center justify-center border border-cyan-500/30">
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-400 text-[7px] font-mono font-bold tracking-wider uppercase">
                              Neural Fill Layer
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 3. CALLIGRAPHY LAYER */}
                      {layer.type === "text_calligraphy" && layer.textPayload && (
                        <div className="w-full h-full flex flex-col justify-center items-center px-4 bg-slate-900/70 border border-slate-800 rounded-lg shadow-xl relative backdrop-blur-sm">
                          <p 
                            className="text-center font-bold tracking-wide"
                            style={{
                              color: layer.textPayload.color,
                              fontSize: `${layer.textPayload.fontSize}px`,
                              fontFamily: layer.textPayload.fontFamily
                            }}
                          >
                            {layer.textPayload.text}
                          </p>
                          <span className="absolute top-1 left-2 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[7px] font-mono uppercase tracking-wider font-bold">
                            Calligraphy: {layer.textPayload.calligraphyStyle?.replace("_", " ")}
                          </span>
                        </div>
                      )}

                      {/* WARP MESH CONTROL OVERLAY */}
                      {state.activeTool === "warp" && isSelected && layer.warp && (
                        <div className="absolute inset-0 pointer-events-none grid grid-cols-4 grid-rows-4 border border-yellow-500/50">
                          {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400 border border-black -translate-x-1/2 -translate-y-1/2 absolute" style={{
                              left: `${(i % 5) * 25}%`,
                              top: `${Math.floor(i / 5) * 25}%`
                            }} />
                          ))}
                        </div>
                      )}

                      {/* ACTIVE HIGHLIGHT CONTROLS */}
                      {isSelected && (
                        <div className="absolute inset-0 pointer-events-none border border-cyan-500">
                          <div className="absolute top-0 left-0 w-2 h-2 bg-white border border-cyan-500 -translate-x-1/2 -translate-y-1/2" />
                          <div className="absolute top-0 right-0 w-2 h-2 bg-white border border-cyan-500 translate-x-1/2 -translate-y-1/2" />
                          <div className="absolute bottom-0 left-0 w-2 h-2 bg-white border border-cyan-500 -translate-x-1/2 translate-y-1/2" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-white border border-cyan-500 translate-x-1/2 translate-y-1/2" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI PROGRESS HUD OVERLAY */}
            {isProcessingAI && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 z-50">
                <div className="w-72 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-200 tracking-widest uppercase">Processing Neural Pipeline</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Generating non-destructive composition layer...</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 text-[9px] font-mono text-left text-cyan-500 space-y-1 max-h-40 overflow-y-auto border border-slate-850">
                    {aiProgress.map((step, idx) => (
                      <div key={idx}>{step}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SPECIFICATIONS TAB PANEL */}
            {activeTab === "specifications" && (
              <div className="w-full max-w-xl p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 overflow-y-auto max-h-[460px] text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-cyan-400 font-bold uppercase">
                  <Database className="w-4 h-4" />
                  NGEP JSON Schema Specification
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-850 overflow-x-auto text-[10px] leading-relaxed text-emerald-400">
                  <pre>{JSON.stringify(state.layers, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* QUALITY AUDIT REVIEW TAB PANEL */}
            {activeTab === "audit" && qualityAudit && (
              <div className="w-full max-w-lg p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-slate-200 font-bold uppercase text-[11px] font-mono tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Multimodal Quality Validation Report
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                    Score: {qualityAudit.overallScore}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-[10px] font-mono">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-500 block">Edge Segmentation:</span>
                    <span className="text-emerald-400 font-bold uppercase">{qualityAudit.edgeQuality}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-500 block">Shadow Distribution:</span>
                    <span className="text-emerald-400 font-bold uppercase">{qualityAudit.shadowConsistency}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-500 block">Contrast Ratio:</span>
                    <span className="text-cyan-400 font-bold">{qualityAudit.contrastRatio}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-500 block">Gamut Print Safety:</span>
                    <span className="text-emerald-400 font-bold uppercase">{qualityAudit.printSafety}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold tracking-wider">AI Diagnostics Feedback</span>
                  {qualityAudit.feedbackMessages.map((msg, i) => (
                    <div key={i} className="flex gap-1.5 text-[9px] text-slate-300 font-sans leading-relaxed">
                      <span className="text-emerald-500">✓</span>
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: MIDDLE CONTROLS PANEL (RESPONSIVE TO ACTIVE TOOL) */}
        <div className="col-span-4 bg-slate-900 border-l border-slate-900 flex flex-col overflow-y-auto">
          
          {/* SEMANTIC BRAIN & NEURAL SCANNER ACTION BOARD */}
          <div className="p-4 border-b border-slate-850 bg-slate-950/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-1">
                <Compass className="w-3 h-3 text-fuchsia-400" />
                AEIGEP AI Editing Brain
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Enterprise V24</span>
            </div>

            {/* SEMANTIC NATURAL LANGUAGE INTERPRETER */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-300">Semantic AI Prompter</span>
                <span className="text-[8px] font-mono text-slate-500">Multi-Lang (Bangla, EN, Arabic, Urdu)</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={semanticPrompt}
                  onChange={(e) => setSemanticPrompt(e.target.value)}
                  placeholder="e.g. Move title upward, apply luxury palette..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-[11px] font-sans text-slate-200 outline-none focus:border-fuchsia-500/50"
                />
                <button
                  onClick={triggerSemanticEdit}
                  disabled={isProcessingSemantic || !state.activeLayerId}
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-fuchsia-400 hover:text-fuchsia-300 disabled:opacity-50 transition-all"
                  title="Run Semantic Parser"
                >
                  {isProcessingSemantic ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* NEURAL ANALYSIS DNA SCANNER TRIGGER */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={triggerAnalyzeImage}
                disabled={isAnalyzingImage || !state.activeLayerId}
                className="w-full py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-cyan-400 border border-slate-850 text-[10px] font-bold font-mono flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                {isAnalyzingImage ? "ANALYZING..." : "EXTRACT DESIGN DNA"}
              </button>
              <button
                onClick={() => setAnalysisPanelActive(!analysisPanelActive)}
                className={`w-full py-1.5 rounded-lg border text-[10px] font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
                  analysisPanelActive 
                    ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30" 
                    : "bg-slate-950/90 hover:bg-slate-900 text-slate-400 border-slate-850"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                {analysisPanelActive ? "HIDE DESIGN MAP" : "VIEW DESIGN MAP"}
              </button>
            </div>
          </div>

          {/* ACTIVE TOOL PARAMETERS COMPOSITION BOX */}
          <div className="p-4 border-b border-slate-850 bg-slate-900/60">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              Active Parameters
            </span>
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              {state.activeTool.toUpperCase().replace("_", " ")} Controls
            </h2>
          </div>

          <div className="p-4 flex-1 space-y-4">
            
            {/* 1. SELECT TOOL SETTINGS */}
            {state.activeTool === "select" && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-850 space-y-2">
                  <span className="text-slate-400 font-bold uppercase text-[9px] font-mono">Workspace Details</span>
                  {activeLayerObj ? (
                    <div className="space-y-2 font-mono text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-500">ID:</span> <span className="text-slate-300">{activeLayerObj.id}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Type:</span> <span className="text-cyan-400 font-semibold">{activeLayerObj.type}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Position:</span> <span className="text-slate-300">X:{activeLayerObj.x} Y:{activeLayerObj.y}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Dimensions:</span> <span className="text-slate-300">{activeLayerObj.width}x{activeLayerObj.height}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Blend Mode:</span> 
                        <select 
                          value={activeLayerObj.blendMode}
                          onChange={(e) => ngep.updateLayer(activeLayerObj.id, { blendMode: e.target.value as any })}
                          className="bg-slate-900 border border-slate-750 text-[10px] text-slate-300 rounded px-1"
                        >
                          <option value="normal">Normal</option>
                          <option value="multiply">Multiply</option>
                          <option value="screen">Screen</option>
                          <option value="overlay">Overlay</option>
                          <option value="color">Color</option>
                        </select>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between"><span className="text-slate-500">Opacity:</span> <span className="text-slate-400">{Math.round(activeLayerObj.opacity * 100)}%</span></div>
                        <input 
                          type="range" min="0" max="1" step="0.05"
                          value={activeLayerObj.opacity}
                          onChange={(e) => ngep.updateLayer(activeLayerObj.id, { opacity: parseFloat(e.target.value) })}
                          className="w-full accent-cyan-400 bg-slate-900 h-1 rounded"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center py-4 font-mono text-[10px]">Select a layer to view details.</div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-850 space-y-2">
                  <span className="text-slate-400 font-bold uppercase text-[9px] font-mono">Neural Quick Upscale & Restore</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => triggerRestoration("upscale")}
                      className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-cyan-400 text-left flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      4X Upscale
                    </button>
                    <button
                      onClick={() => triggerRestoration("deblur")}
                      className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-cyan-400 text-left flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      AI Deblur
                    </button>
                    <button
                      onClick={() => triggerRestoration("colorization")}
                      className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-cyan-400 text-left flex items-center gap-1"
                    >
                      <Brush className="w-3 h-3" />
                      Colorization
                    </button>
                    <button
                      onClick={() => triggerRestoration("old_photo_repair")}
                      className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-cyan-400 text-left flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Photo Repair
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SMART MASKING SETTINGS */}
            {state.activeTool === "smart_mask" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Neural Segment Type</label>
                  <select
                    value={maskType}
                    onChange={(e) => setMaskType(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 text-xs"
                  >
                    <option value="foreground">Foreground Object (Subject)</option>
                    <option value="background">Background Scene</option>
                    <option value="person">Person Segmentation</option>
                    <option value="color_range">Color range key</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Feather Radius</label>
                    <span className="text-slate-300">{maskFeather}px</span>
                  </div>
                  <input
                    type="range" min="0" max="50"
                    value={maskFeather}
                    onChange={(e) => setMaskFeather(Number(e.target.value))}
                    className="w-full accent-fuchsia-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <button
                  onClick={triggerSmartMask}
                  disabled={!state.activeLayerId}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 border border-fuchsia-500/20 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  GENERATE AI VECTOR MASK
                </button>
              </div>
            )}

            {/* 3. GENERATIVE FILL SETTINGS */}
            {state.activeTool === "generative_fill" && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Infill Prompt Instructions</label>
                  <textarea
                    rows={3}
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 text-xs font-sans focus:border-cyan-500/50 outline-none"
                    placeholder="Describe content to fill or expand..."
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-850">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold text-slate-300">Generative Canvas Outpaint</span>
                    <span className="text-[9px] text-slate-500">Extend boundaries beyond original frames</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isExpanding}
                    onChange={(e) => setIsExpanding(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                <button
                  onClick={triggerGenerativeFill}
                  disabled={!state.activeLayerId || !genPrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 border border-cyan-500/20 disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  RUN NEURAL INPAINTING
                </button>
              </div>
            )}

            {/* 4. ADJUSTMENTS SETTINGS */}
            {state.activeTool === "adjustments" && (
              <div className="space-y-3 text-xs font-mono">
                
                {/* BRIGHTNESS */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Brightness</span>
                    <span className={`${brightness >= 0 ? "text-cyan-400" : "text-rose-400"}`}>{brightness}%</span>
                  </div>
                  <input
                    type="range" min="-100" max="100"
                    value={brightness}
                    onChange={(e) => { setBrightness(Number(e.target.value)); triggerAdjustmentApply(); }}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                {/* CONTRAST */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Contrast</span>
                    <span className="text-cyan-400">{contrast}%</span>
                  </div>
                  <input
                    type="range" min="-100" max="100"
                    value={contrast}
                    onChange={(e) => { setContrast(Number(e.target.value)); triggerAdjustmentApply(); }}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                {/* EXPOSURE */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Exposure value</span>
                    <span className="text-cyan-400">+{exposure} EV</span>
                  </div>
                  <input
                    type="range" min="-5" max="5" step="0.1"
                    value={exposure}
                    onChange={(e) => { setExposure(Number(e.target.value)); triggerAdjustmentApply(); }}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                {/* SATURATION */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Saturations</span>
                    <span className="text-cyan-400">+{saturation}%</span>
                  </div>
                  <input
                    type="range" min="-100" max="100"
                    value={saturation}
                    onChange={(e) => { setSaturation(Number(e.target.value)); triggerAdjustmentApply(); }}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                {/* HUE */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Hue rotation</span>
                    <span className="text-cyan-400">{hue}°</span>
                  </div>
                  <input
                    type="range" min="-180" max="180"
                    value={hue}
                    onChange={(e) => { setHue(Number(e.target.value)); triggerAdjustmentApply(); }}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-850 font-mono text-[9px] text-slate-500">
                  Adjustment parameters are non-destructive and applied at render runtime.
                </div>
              </div>
            )}

            {/* 5. FILTERS SETTINGS */}
            {state.activeTool === "filters" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-850 space-y-3">
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Current Stacked Filters</span>
                  {activeLayerObj && activeLayerObj.filters && activeLayerObj.filters.length > 0 ? (
                    <div className="space-y-2">
                      {activeLayerObj.filters.map(filter => (
                        <div key={filter.id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-300 font-semibold text-[10px]">{filter.type.toUpperCase().replace("_", " ")} ({filter.intensity}%)</span>
                          <button
                            onClick={() => ngep.toggleFilter(activeLayerObj.id, filter.id, !filter.visible)}
                            className={`p-1 rounded ${filter.visible ? "text-cyan-400" : "text-slate-600"}`}
                          >
                            {filter.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center py-2 text-[10px]">No active stacked filters.</div>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Add New Filter</span>
                  <div className="space-y-2">
                    <select
                      value={newFilterType}
                      onChange={(e) => setNewFilterType(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 text-xs"
                    >
                      <option value="glow">Aesthetic Glow (Diffusion)</option>
                      <option value="gaussian_blur">Gaussian Blur</option>
                      <option value="sharpen">Edge Sharpening</option>
                      <option value="vintage_grain">Vintage Grain (Noise)</option>
                    </select>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>Intensity</span>
                        <span>{newFilterIntensity}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={newFilterIntensity}
                        onChange={(e) => setNewFilterIntensity(Number(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                      />
                    </div>

                    <button
                      onClick={handleAddFilterLayer}
                      disabled={!state.activeLayerId}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold"
                    >
                      Apply Filter Stack
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. CALLIGRAPHY SETTINGS */}
            {state.activeTool === "calligraphy" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Calligraphy Language</label>
                  <select
                    value={calligraphyLang}
                    onChange={(e) => setCalligraphyLang(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 text-xs"
                  >
                    <option value="bn">Bangla (Paisley Artistry)</option>
                    <option value="en">English (Custom Signature)</option>
                    <option value="ar">Arabic (Naskh Arabic Script)</option>
                    <option value="ur">Urdu (Nastaliq Fine Art)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Calligraphy Style preset</label>
                  <select
                    value={calligraphyStyle}
                    onChange={(e) => setCalligraphyStyle(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 text-xs"
                  >
                    <option value="modern_bengali">Traditional Alpona Paisley</option>
                    <option value="nasikh">Naskh Calligraphy Core</option>
                    <option value="thuluth">Thuluth Majestic Style</option>
                    <option value="signature">Aesthetic Watermark Signature</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Calligraphy Text</label>
                  <input
                    type="text"
                    value={calligraphyText}
                    onChange={(e) => setCalligraphyText(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 text-xs font-sans outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Font Size</label>
                    <span>{calligraphySize}px</span>
                  </div>
                  <input
                    type="range" min="16" max="72"
                    value={calligraphySize}
                    onChange={(e) => setCalligraphySize(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                <button
                  onClick={handleAddCalligraphyLayer}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-500/20"
                >
                  Generate Calligraphy Layer
                </button>
              </div>
            )}

            {/* 7. WARP MESH & AI LIQUIFY SETTINGS */}
            {state.activeTool === "warp" && (
              <div className="space-y-4 text-xs font-mono">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Interactive Mesh Resolution</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleApplyWarpMesh(3)}
                    className="py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-mono text-slate-300 font-bold"
                  >
                    3 x 3 grid
                  </button>
                  <button
                    onClick={() => handleApplyWarpMesh(4)}
                    className="py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-mono text-slate-300 font-bold"
                  >
                    4 x 4 grid
                  </button>
                  <button
                    onClick={() => handleApplyWarpMesh(5)}
                    className="py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-mono text-slate-300 font-bold"
                  >
                    5 x 5 grid
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-850 space-y-3">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">AI Liquify & Mesh Warp</span>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-bold">Liquify Mode</label>
                    <select
                      value={liquifyMode}
                      onChange={(e: any) => setLiquifyMode(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 text-[11px]"
                    >
                      <option value="mesh">Symmetrical Mesh Warp</option>
                      <option value="face">Intelligent Face Liquify</option>
                      <option value="object">Focal Object Alignment</option>
                      <option value="perspective">Horizon Perspective Distortion</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Warp Intensity</span>
                      <span className="text-cyan-400">{liquifyStrength}%</span>
                    </div>
                    <input
                      type="range" min="5" max="100"
                      value={liquifyStrength}
                      onChange={(e) => setLiquifyStrength(Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                    />
                  </div>

                  <button
                    onClick={triggerApplyLiquify}
                    disabled={!state.activeLayerId}
                    className="w-full py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-lg border border-yellow-500/20"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    RUN AI LIQUIFY DEFORMATION
                  </button>
                </div>
              </div>
            )}

            {/* 8. AI BRUSH ENGINE SETTINGS */}
            {state.activeTool === "retouch" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Intelligent Brush Mode</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "healing", label: "Healing Brush" },
                      { id: "remove", label: "Remove Brush" },
                      { id: "replace", label: "Replace Brush" },
                      { id: "shadow", label: "Shadow Brush" },
                      { id: "reflection", label: "Reflection Brush" }
                    ].map(brush => (
                      <button
                        key={brush.id}
                        onClick={() => setActiveBrushType(brush.id as any)}
                        className={`px-2 py-1 rounded border text-[10px] font-mono text-left font-semibold ${
                          activeBrushType === brush.id 
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/35" 
                            : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900"
                        }`}
                      >
                        {brush.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BRUSH SIZE */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Brush Size</span>
                    <span className="text-cyan-400">{brushSize}px</span>
                  </div>
                  <input
                    type="range" min="5" max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                {/* BRUSH HARDNESS */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Brush Hardness</span>
                    <span className="text-cyan-400">{brushHardness}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100"
                    value={brushHardness}
                    onChange={(e) => setBrushHardness(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                {/* BRUSH STRENGTH */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Stroke Flow / Strength</span>
                    <span className="text-cyan-400">{brushStrength}%</span>
                  </div>
                  <input
                    type="range" min="10" max="100"
                    value={brushStrength}
                    onChange={(e) => setBrushStrength(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-950 h-1 rounded"
                  />
                </div>

                <button
                  onClick={triggerApplyBrush}
                  disabled={!state.activeLayerId}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 border border-pink-500/20"
                >
                  <Brush className="w-3.5 h-3.5" />
                  STROKE CANVAS WITH AI BRUSH
                </button>
              </div>
            )}

            {/* 9. AI REASONING BOARD */}
            {activeLayerObj && activeLayerObj.aiReasoning && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    AI Reasoning Explainability
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-slate-500">Confidence:</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{Math.round(activeLayerObj.aiReasoning.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 font-sans text-[10px] text-slate-300 leading-relaxed">
                  <p className="p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-200">
                    <span className="text-emerald-500 font-semibold font-mono block text-[8px] uppercase tracking-wide">Primary Explanation</span>
                    {activeLayerObj.aiReasoning.explanation}
                  </p>

                  {activeLayerObj.aiReasoning.whyMoved && (
                    <div>
                      <span className="text-slate-500 font-mono text-[8px] uppercase block">Layout Alignment Vector Adjustment</span>
                      <p className="pl-2 border-l border-emerald-500/40 text-slate-300">{activeLayerObj.aiReasoning.whyMoved}</p>
                    </div>
                  )}

                  {activeLayerObj.aiReasoning.whyColorsChanged && (
                    <div>
                      <span className="text-slate-500 font-mono text-[8px] uppercase block">Color Palette Harmony Matching</span>
                      <p className="pl-2 border-l border-cyan-500/40 text-slate-300">{activeLayerObj.aiReasoning.whyColorsChanged}</p>
                    </div>
                  )}

                  {activeLayerObj.aiReasoning.whyLightingChanged && (
                    <div>
                      <span className="text-slate-500 font-mono text-[8px] uppercase block">Illumination Vector Balancing</span>
                      <p className="pl-2 border-l border-amber-500/40 text-slate-300">{activeLayerObj.aiReasoning.whyLightingChanged}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 10. MULTI-REFERENCE STYLE DOCK */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Multi-Reference Guide Dock
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[8px] font-mono">
                  {state.references.filter(r => r.active).length} Active
                </span>
              </div>

              {/* LIST OF REFERENCES */}
              <div className="space-y-1.5">
                {state.references.map(ref => (
                  <div key={ref.id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-[10px]">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <input
                        type="checkbox"
                        checked={ref.active}
                        onChange={() => triggerToggleReference(ref.id)}
                        className="accent-cyan-400 w-3 h-3 cursor-pointer"
                      />
                      <div className="overflow-hidden">
                        <span className="font-semibold text-slate-200 block truncate">{ref.name}</span>
                        <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-wider">{ref.type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerRemoveReference(ref.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-950/40"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* ADD REFERENCE FORM */}
              <div className="pt-2 border-t border-slate-850 space-y-2">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Ref name..."
                    value={newRefName}
                    onChange={(e) => setNewRefName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] outline-none text-slate-300"
                  />
                  <select
                    value={newRefType}
                    onChange={(e: any) => setNewRefType(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-1 text-[9px] text-slate-300"
                  >
                    <option value="image">Image</option>
                    <option value="sketch">Sketch</option>
                    <option value="brand_guide">Brand Guide</option>
                    <option value="moodboard">Moodboard</option>
                    <option value="palette">Palette</option>
                  </select>
                  <button
                    onClick={triggerAddReference}
                    className="p-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-slate-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* TELEMETRY ENGINE MONITOR */}
          <div className="p-4 bg-slate-950 border-t border-slate-850 space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest block">
              GPU TELEMETRY STATUS
            </span>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              <div className="p-2 bg-slate-900 border border-slate-850 rounded">
                <span className="text-slate-500 block">VRAM Utilization</span>
                <span className="text-cyan-400 font-bold">{telemetry.gpuMemoryMb} MB</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-850 rounded">
                <span className="text-slate-500 block">System RAM Usage</span>
                <span className="text-cyan-400 font-bold">{telemetry.ramUsageMb} MB</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-850 rounded">
                <span className="text-slate-500 block">Neural latency</span>
                <span className="text-cyan-400 font-bold">{telemetry.processTimeMs} ms</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-850 rounded">
                <span className="text-slate-500 block">Precision scoring</span>
                <span className="text-cyan-400 font-bold">{telemetry.maskPrecisionScore}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 4: RIGHT PANEL LAYER TREE AND HISTORY TIMELINE */}
        <div className="col-span-3 bg-slate-900 border-l border-slate-900 flex flex-col overflow-y-auto">
          
          {/* DRAGGABLE LAYERS TREE MANAGER */}
          <div className="p-4 border-b border-slate-850">
            <h3 className="text-xs font-mono font-bold text-slate-100 tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              {lang === "bn" ? "লেয়ার ম্যানেজার" : "Non-Destructive Layers"}
            </h3>
          </div>

          <div className="flex-1 p-3.5 space-y-2">
            {state.layers.map((layer) => {
              const isSelected = layer.id === state.activeLayerId;
              return (
                <div 
                  key={layer.id}
                  onClick={() => ngep.selectLayer(layer.id)}
                  className={`p-2.5 rounded-xl cursor-pointer border flex items-center justify-between transition-all group ${
                    isSelected 
                      ? "bg-slate-800 border-cyan-500/50 shadow-md shadow-indigo-950/20" 
                      : "bg-slate-950/60 border-slate-850 hover:bg-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {layer.type === "raster_source" ? (
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                      </div>
                    ) : layer.type === "text_calligraphy" ? (
                      <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0 flex items-center justify-center">
                        <Type className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-fuchsia-500/10 border border-fuchsia-500/20 shrink-0 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-fuchsia-400" />
                      </div>
                    )}
                    
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-sans font-semibold text-slate-200 block truncate leading-tight">
                        {layer.name}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">
                        {layer.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* VISIBILITY / LOCK / DELETE TRIGGERS */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer.id, layer.visible); }}
                      className={`p-1 rounded hover:bg-slate-900 ${layer.visible ? "text-cyan-400" : "text-slate-600"}`}
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleLock(layer.id, layer.locked); }}
                      className={`p-1 rounded hover:bg-slate-900 ${layer.locked ? "text-amber-400" : "text-slate-600"}`}
                    >
                      {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteLayer(layer.id); }}
                      className="p-1 rounded hover:bg-slate-900 text-slate-600 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NAMED SNAPSHOT MILESTONE COMPILER */}
          <div className="p-3.5 border-t border-slate-850 bg-slate-950/40 space-y-2">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Create Snapshot</span>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Snapshot label..."
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] outline-none text-slate-300 font-sans"
              />
              <button
                onClick={triggerSaveSnapshot}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-[10px] font-bold"
              >
                Save
              </button>
            </div>
          </div>

          {/* HISTORICAL TIMELINE */}
          <div className="p-4 border-t border-slate-850 max-h-56 overflow-y-auto">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <History className="w-3.5 h-3.5" />
              Timeline History
            </h4>
            <div className="space-y-3 pl-1">
              {historyEvents.slice(0, 8).map((event, i) => (
                <div key={event.id} className="relative pl-4 pb-1 border-l border-slate-800 last:border-0">
                  <div className="absolute left-[-4.5px] top-[4px] w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-750 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 block">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] font-sans font-medium text-slate-300 block leading-tight">
                    {event.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
export default NGEPDashboard;
