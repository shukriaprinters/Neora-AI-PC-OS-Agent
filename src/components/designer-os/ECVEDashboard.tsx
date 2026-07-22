// ENTERPRISE CANVAS & VIEWPORT ENGINE (ECVE) DASHBOARD (Phase 2.3.6A.1.3)
import React, { useState, useEffect } from "react";
import {
  Maximize, Eye, Compass, Sliders, Check, Plus, Trash2, Zap, LayoutGrid, Ruler,
  Sparkles, RefreshCw, Layers, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Monitor, Play
} from "lucide-react";
import { ECVE, EcveGridType, EcveUnit, EcveRenderBackend, EcveGuide, EcveArtboard, EcveCompositionOverlay, EcveRenderingStats } from "../../lib/ai/cognitive/ECVE";
import { EnterpriseKernel } from "../../lib/ai/cognitive/EnterpriseKernel";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function ECVEDashboard({ lang, onAddSystemLog }: Props) {
  const ecve = ECVE.getInstance();
  const kernel = EnterpriseKernel.getInstance();

  const [zoom, setZoom] = useState(ecve.getZoomPercent());
  const [rotation, setRotation] = useState(ecve.getViewportRotation());
  const [mirrored, setMirrored] = useState(ecve.getIsMirrored());
  const [flipped, setFlipped] = useState(ecve.getIsFlipped());
  const [backend, setBackend] = useState<EcveRenderBackend>(ecve.getActiveBackend());
  const [unit, setUnit] = useState<EcveUnit>(ecve.getActiveUnit());
  const [grid, setGrid] = useState<EcveGridType>(ecve.getActiveGrid());
  const [gridSpacing, setGridSpacing] = useState(ecve.getGridSpacing());
  const [artboards, setArtboards] = useState<EcveArtboard[]>(ecve.getArtboards());
  const [guides, setGuides] = useState<EcveGuide[]>(ecve.getGuides());
  const [snap, setSnap] = useState(ecve.getSnapSettings());
  const [composition, setComposition] = useState<EcveCompositionOverlay>(ecve.getCompositionOverlay());
  const [stats, setStats] = useState<EcveRenderingStats>(ecve.getRenderingStats());
  const [serviceStatus, setServiceStatus] = useState<string>("running");

  // Interactive UI states
  const [newGuideOrientation, setNewGuideOrientation] = useState<"horizontal" | "vertical">("vertical");
  const [newGuidePosition, setNewGuidePosition] = useState(100);

  useEffect(() => {
    updateLocalStates();

    const handleKernelUpdate = () => {
      const status = kernel.getServices().find(s => s.id === "ecve")?.status || "running";
      setServiceStatus(status);
    };

    handleKernelUpdate();

    const unsubscribe = ecve.subscribe((ev) => {
      updateLocalStates();
      if (onAddSystemLog) {
        onAddSystemLog(`[ECVE] ${ev.message}`);
      }
    });

    const unsubscribeKernel = kernel.subscribe((ev) => {
      if (ev.topic === "ServiceStatusChanged") {
        handleKernelUpdate();
      }
    });

    const poll = setInterval(() => {
      setStats({ ...ecve.getRenderingStats() });
    }, 1500);

    return () => {
      unsubscribe();
      unsubscribeKernel();
      clearInterval(poll);
    };
  }, []);

  const updateLocalStates = () => {
    setZoom(ecve.getZoomPercent());
    setRotation(ecve.getViewportRotation());
    setMirrored(ecve.getIsMirrored());
    setFlipped(ecve.getIsFlipped());
    setBackend(ecve.getActiveBackend());
    setUnit(ecve.getActiveUnit());
    setGrid(ecve.getActiveGrid());
    setGridSpacing(ecve.getGridSpacing());
    setArtboards([...ecve.getArtboards()]);
    setGuides([...ecve.getGuides()]);
    setSnap(ecve.getSnapSettings());
    setComposition({ ...ecve.getCompositionOverlay() });
  };

  const handleZoomChange = (val: number) => {
    ecve.setZoom(val);
  };

  const handleRotationChange = (deg: number) => {
    ecve.adjustRotation(deg);
  };

  const handleAddGuide = (e: React.FormEvent) => {
    e.preventDefault();
    ecve.addGuide(newGuideOrientation, newGuidePosition);
  };

  const handleRemoveGuide = (id: string) => {
    ecve.removeGuide(id);
  };

  const handleGridChange = (type: EcveGridType, spacing: number) => {
    ecve.setGridSettings(type, spacing);
  };

  const handleSnapToggle = (type: "grid" | "guides" | "pixel" | "anchor") => {
    ecve.toggleSnap(type);
  };

  const handleCompositionChange = (type: EcveCompositionOverlay["type"], visible: boolean) => {
    ecve.setCompositionOverlay(type, visible, 0.45);
  };

  const handleBackendChange = (driver: EcveRenderBackend) => {
    ecve.changeBackend(driver);
  };

  if (serviceStatus === "stopped") {
    return (
      <div className="p-8 bg-slate-950 text-slate-100 rounded-xl border border-red-900/30 space-y-6 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 animate-pulse">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {lang === "bn" ? "ক্যানভাস রেন্ডারিং এবং ভিউপোর্ট সার্ভিস অফলাইন" : "Canvas Rendering & Viewport Service Offline"}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "bn" 
              ? "নিওরা ECVE গ্রাফিক্স সার্ভিসটি সেন্ট্রাল অপারেটিং কার্নেলে বন্ধ করা হয়েছে। অসীম ক্যানভাস কোঅর্ডিনেশন, আর্টবোর্ড রেন্ডারিং এবং ভিউপোর্ট জুম ট্রান্সফর্ম সাময়িকভাবে নিষ্ক্রিয় রয়েছে।" 
              : "The Neora ECVE graphics service has been stopped in the central Enterprise Kernel. Infinite canvas coordination, responsive artboard rendering, and viewport zoom-panning are temporarily disabled."}
          </p>
        </div>
        <button
          onClick={() => kernel.startService("ecve")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded transition flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          {lang === "bn" ? "সার্ভিস পুনরায় চালু করুন" : "Start Canvas Service"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-mono rounded border border-cyan-500/30">Phase 2.3.6A.1.3</span>
            <h1 className="text-xl font-bold tracking-tight text-white">Canvas & Viewport Engine (ECVE)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "bn" ? "অসীম ক্যানভাস ও ভিউপোর্ট রেন্ডারিং ইঞ্জিন, মেটাল/ওয়েবজিপিইউ ড্রাইভ এবং স্মার্ট অ্যালাইনমেন্ট গ্রিড।" : "Infinite vector canvas coordinator, responsive artboards scheduler, and color-managed GPU viewports."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">RENDER ENGINE:</label>
          <select
            value={backend}
            onChange={(e) => handleBackendChange(e.target.value as EcveRenderBackend)}
            className="bg-slate-900 border border-slate-800 rounded text-xs text-white p-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="WebGPU">WebGPU API Core</option>
            <option value="Vulkan">Vulkan Engine</option>
            <option value="Metal">Apple Metal Core</option>
            <option value="DirectX">DirectX 12 Pipeline</option>
            <option value="WebGL_Fallback">WebGL Core Fallback</option>
          </select>
        </div>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Viewport, zoom, rotation */}
        <div className="space-y-6 lg:col-span-1">
          {/* Zoom and Transform card */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              {lang === "bn" ? "ভিউ পোর্ট ট্রান্সফর্ম" : "Viewport Transformation & Precision"}
            </h2>

            {/* Slider / Zoom presets */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{lang === "bn" ? "জুম লেভেল" : "Sub-pixel Zoom"}</span>
                <span className="font-mono text-cyan-400 font-bold">{zoom}%</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="1"
                  max="5000"
                  value={zoom <= 5000 ? zoom : 5000}
                  onChange={(e) => handleZoomChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {[100, 400, 1600, 6400, 32000, 64000].map(val => (
                  <button
                    key={val}
                    onClick={() => handleZoomChange(val)}
                    className={`px-1.5 py-0.5 text-[9px] font-mono rounded border ${
                      zoom === val ? "bg-cyan-600/20 text-cyan-400 border-cyan-500/30" : "bg-slate-950 text-slate-400 border-slate-800"
                    } hover:border-cyan-500 transition cursor-pointer`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              {zoom >= 1000 && (
                <div className="flex items-center gap-1.5 p-1 px-2 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] text-indigo-400">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>Sub-pixel precision grid active</span>
                </div>
              )}
            </div>

            {/* Rotation Control */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{lang === "bn" ? "ক্যানভাস ঘূর্ণন" : "Canvas Rotation"}</span>
                <span className="font-mono text-white font-bold">{rotation}°</span>
              </div>
              <div className="flex gap-1.5">
                {[0, 90, 180, 270].map(val => (
                  <button
                    key={val}
                    onClick={() => handleRotationChange(val)}
                    className={`py-1 flex-1 text-xs font-mono rounded border capitalize transition cursor-pointer ${
                      rotation === val ? "bg-cyan-600/20 text-cyan-400 border-cyan-500/30" : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                  >
                    {val}°
                  </button>
                ))}
              </div>
            </div>

            {/* Mirror / Flip */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
              <button
                onClick={() => ecve.toggleMirrored()}
                className={`py-1.5 text-xs font-semibold rounded border transition cursor-pointer ${
                  mirrored ? "bg-cyan-600/20 text-cyan-400 border-cyan-500/30" : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                Mirror Viewport
              </button>
              <button
                onClick={() => ecve.toggleFlipped()}
                className={`py-1.5 text-xs font-semibold rounded border transition cursor-pointer ${
                  flipped ? "bg-cyan-600/20 text-cyan-400 border-cyan-500/30" : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                Flip Viewport
              </button>
            </div>
          </div>

          {/* GPU Live Render Stats */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              {lang === "bn" ? "জিপিইউ রেন্ডারিং স্ট্যাটাস" : "GPU Rendering Pipeline Stats"}
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800 font-mono">
                <span className="text-slate-500 block">VIEWPORT FPS</span>
                <span className="text-emerald-400 font-bold">{stats.fps} Frames/sec</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800 font-mono">
                <span className="text-slate-500 block">FRAME TIME</span>
                <span className="text-cyan-400 font-bold">{stats.frameTimeMs} ms</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800 font-mono">
                <span className="text-slate-500 block">GPU VRAM LOAD</span>
                <span className="text-indigo-400 font-bold">{stats.vramUsedMb} MB</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800 font-mono">
                <span className="text-slate-500 block">PIPELINE LATENCY</span>
                <span className="text-amber-400 font-bold">{stats.viewportLatencyMs} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right columns: Artboards, Grids, Snap matrix, and Composition layers */}
        <div className="space-y-6 lg:col-span-2">
          {/* Smart Guides & Alignment Snaps */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-indigo-400" />
              {lang === "bn" ? "স্মার্ট গাইড ও স্ন্যাপ ম্যাট্রিক্স" : "Smart Guides, Rulers & Snap Matrix"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Snap Criteria */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">SNAP GUIDELINE RULES</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "grid", label: "Snap to Grid" },
                    { id: "guides", label: "Snap to Guides" },
                    { id: "pixel", label: "Pixel Perfect Grid" },
                    { id: "anchor", label: "Bezier Anchor Nodes" }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSnapToggle(item.id as any)}
                      className={`py-1.5 text-xs font-semibold rounded border transition cursor-pointer text-left px-2 flex justify-between items-center ${
                        snap[item.id as keyof typeof snap]
                          ? "bg-indigo-600/15 border-indigo-500/30 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}
                    >
                      <span>{item.label}</span>
                      {snap[item.id as keyof typeof snap] && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add alignment guide form */}
              <form onSubmit={handleAddGuide} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">REGISTER SMART GUIDE</span>
                <div className="flex gap-2">
                  <select
                    value={newGuideOrientation}
                    onChange={(e) => setNewGuideOrientation(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded text-xs text-white p-1.5 focus:outline-none"
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                  <input
                    type="number"
                    value={newGuidePosition}
                    onChange={(e) => setNewGuidePosition(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded text-xs text-white p-1.5 focus:outline-none font-mono flex-1"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded transition flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </form>
            </div>

            {/* Guides active list */}
            {guides.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {guides.map(g => (
                  <span
                    key={g.id}
                    className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[10px] font-mono rounded border border-slate-800 flex items-center gap-1.5"
                  >
                    <span className="text-[8px] uppercase font-bold text-cyan-400">{g.orientation.slice(0,1)}:</span>
                    <span>{g.position}{unit}</span>
                    <button
                      onClick={() => handleRemoveGuide(g.id)}
                      className="text-slate-500 hover:text-red-400 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Grid Presets & AI Composition Overlays */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {lang === "bn" ? "গ্রিড মোড এবং এআই কম্পোজিশন" : "Grid Presets & Intelligent Composition Layers"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grid selectors */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">GRID LAYOUT ALGORITHM</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "pixel", label: "Square Pixel Grid" },
                    { id: "vector", label: "Vector Baseline Grid" },
                    { id: "perspective", label: "Perspective Guide Grid" },
                    { id: "isometric", label: "Isometric Blueprint Grid" },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleGridChange(item.id as EcveGridType, gridSpacing)}
                      className={`p-2 text-[11px] font-semibold rounded border transition text-left cursor-pointer ${
                        grid === item.id
                          ? "bg-cyan-600/15 border-cyan-500/30 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Composition overlays */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">NEURAL COMPOSITION ACCENTS</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "rule_of_thirds", label: "Rule of Thirds" },
                    { id: "golden_ratio", label: "Golden Ratio" },
                    { id: "golden_spiral", label: "Golden Spiral Spiral" },
                    { id: "cta_heatmap", label: "CTA Attention Heatmap" }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleCompositionChange(item.id as any, composition.type !== item.id || !composition.visible)}
                      className={`p-2 text-[11px] font-semibold rounded border transition text-left cursor-pointer ${
                        composition.visible && composition.type === item.id
                          ? "bg-indigo-600/15 border-indigo-500/30 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Artboards and canvas preset limits */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              {lang === "bn" ? "অ্যাক্টিভ আর্টবোর্ডসমূহ" : "Active Documents & Artboards"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {artboards.map(art => (
                <div key={art.id} className="p-3 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300 block leading-tight">{art.name}</span>
                    <span className="text-[9px] px-1 bg-slate-900 text-slate-500 rounded border border-slate-800">{art.id}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Preset: {art.presetName}</p>
                  <div className="pt-1.5 font-mono text-[10px] text-cyan-400 flex justify-between">
                    <span>DIMENSIONS:</span>
                    <span>{art.width} × {art.height} px</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ECVEDashboard;
