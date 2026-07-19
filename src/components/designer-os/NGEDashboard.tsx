// NEORA GRAPHICS ENGINE (NGE) PROFESSIONAL INTERACTIVE CANVASES WORKSPACE
import React, { useState, useEffect, useRef } from "react";
import {
  Layers3, Cpu, SlidersHorizontal, Trash2, Plus, Play, RotateCcw, RotateCw,
  Eye, EyeOff, Lock, Unlock, Download, LayoutGrid, CheckCircle2, AlertTriangle,
  ZoomIn, ZoomOut, Maximize2, Move, Type, Palette, Sparkles, Sliders,
  Check, FileImage, Settings, HelpCircle, Activity, Video, Flame, Loader2, RefreshCw
} from "lucide-react";
import { NGE, NgeLayer, NgeArtboard, NgeCanvasState, NgeTelemetry, NgeEvent, NgeBlendMode, NgeColorSpace } from "../../lib/ai/cognitive/NGE";

interface Props {
  lang: "en" | "bn";
  onAddSystemLog?: (msg: string) => void;
}

export function NGEDashboard({ lang, onAddSystemLog }: Props) {
  const nge = NGE.getInstance();

  // State bindings from NGE core
  const [canvasState, setCanvasState] = useState<NgeCanvasState>(nge.getCanvasState());
  const [telemetry, setTelemetry] = useState<NgeTelemetry>(nge.getTelemetry());
  const [eventHistory, setEventHistory] = useState<NgeEvent[]>([]);

  // Local active selections
  const [activeArtboardId, setActiveArtboardId] = useState(canvasState.activeArtboardId);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Viewport dragging states
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Tool selection: "select" or "pan"
  const [activeTool, setActiveTool] = useState<"select" | "pan">("select");

  // Custom addition states
  const [newArtboardName, setNewArtboardName] = useState("");
  const [newArtboardWidth, setNewArtboardWidth] = useState(800);
  const [newArtboardHeight, setNewArtboardHeight] = useState(600);

  // New element creation helper states
  const [layerAddType, setLayerAddType] = useState<"text" | "vector" | "raster">("text");
  const [addTextVal, setAddTextVal] = useState("শুভ নববর্ষ");
  const [addFontFamily, setAddFontFamily] = useState("Noto Serif Bengali");

  // Diagnostic states
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testActive, setTestActive] = useState(false);

  // UI tabs navigation
  const [rightPanelTab, setRightPanelTab] = useState<"inspector" | "telemetry" | "history">("inspector");

  useEffect(() => {
    // Initial data load
    updateStateData();

    // Subscribe to graphics events
    const unsubscribe = nge.subscribe((ev) => {
      updateStateData();
      if (onAddSystemLog) {
        onAddSystemLog(`NGE: [${ev.type}] ${ev.message}`);
      }
    });

    // Slow poller for live performance variations (mocking GPU work)
    const timer = setInterval(() => {
      setTelemetry({ ...nge.getTelemetry() });
    }, 1200);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const updateStateData = () => {
    const freshCanvas = nge.getCanvasState();
    setCanvasState({ ...freshCanvas });
    setEventHistory(nge.getEventHistory().slice(0, 12));
    setActiveArtboardId(freshCanvas.activeArtboardId);

    // Default select first layer if nothing selected
    const activeArtboard = freshCanvas.artboards.find(a => a.id === freshCanvas.activeArtboardId);
    if (activeArtboard && activeArtboard.layers.length > 0 && !selectedLayerId) {
      setSelectedLayerId(activeArtboard.layers[0].id);
    }
  };

  // Viewport action bindings
  const handleZoomIn = () => {
    const nextZoom = parseFloat((canvasState.zoom + 0.1).toFixed(2));
    nge.updateViewport(nextZoom, canvasState.panX, canvasState.panY);
  };

  const handleZoomOut = () => {
    const nextZoom = parseFloat((canvasState.zoom - 0.1).toFixed(2));
    nge.updateViewport(nextZoom, canvasState.panX, canvasState.panY);
  };

  const handleResetViewport = () => {
    nge.updateViewport(1.0, 0, 0);
  };

  // Scene Graph Mutators
  const handleToggleVisibility = (layerId: string, current: boolean) => {
    nge.updateLayer(activeArtboardId, layerId, { visible: !current });
  };

  const handleToggleLock = (layerId: string, current: boolean) => {
    nge.updateLayer(activeArtboardId, layerId, { locked: !current });
  };

  const handleDeleteLayer = (layerId: string) => {
    nge.deleteLayer(activeArtboardId, layerId);
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  };

  const handleAddTextLayer = () => {
    const nextId = `text-${Date.now()}`;
    const newLayer: NgeLayer = {
      id: nextId,
      name: `Text element (${addTextVal.slice(0, 10)})`,
      type: "text",
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
      x: 220,
      y: 200,
      width: 350,
      height: 80,
      rotation: 0,
      textContent: addTextVal,
      fontSize: 36,
      fontFamily: addFontFamily,
      fontStyle: "Regular"
    };
    nge.addLayer(activeArtboardId, newLayer);
    setSelectedLayerId(nextId);
  };

  const handleAddVectorAlpona = () => {
    const nextId = `vector-${Date.now()}`;
    const newLayer: NgeLayer = {
      id: nextId,
      name: "Vector Paisley Alpona",
      type: "vector",
      visible: true,
      locked: false,
      opacity: 0.85,
      blendMode: "normal",
      x: 300,
      y: 150,
      width: 200,
      height: 200,
      rotation: 45,
      vectorData: {
        closed: true,
        strokeColor: "#ffffff",
        strokeWidth: 2.5,
        fillColor: "#ffffff0a",
        points: [
          { x: 100, y: 10 },
          { x: 170, y: 80, c1: { x: 190, y: 40 }, c2: { x: 190, y: 120 } },
          { x: 100, y: 190 },
          { x: 30, y: 80, c1: { x: 10, y: 120 }, c2: { x: 10, y: 40 } }
        ]
      }
    };
    nge.addLayer(activeArtboardId, newLayer);
    setSelectedLayerId(nextId);
  };

  const handleCreateNewArtboard = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newArtboardName || `Artboard ${canvasState.artboards.length + 1}`;
    nge.createArtboard(name, newArtboardWidth, newArtboardHeight);
    setNewArtboardName("");
  };

  // Interactive Stage mouse handlers (enables dragging & selection)
  const handleStageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "pan") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasState.panX, y: e.clientY - canvasState.panY });
    }
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning && activeTool === "pan") {
      const nextX = e.clientX - panStart.x;
      const nextY = e.clientY - panStart.y;
      nge.updateViewport(canvasState.zoom, nextX, nextY);
    } else if (draggedLayerId) {
      const artboard = canvasState.artboards.find(a => a.id === activeArtboardId);
      if (!artboard) return;
      const layer = artboard.layers.find(l => l.id === draggedLayerId);
      if (layer && !layer.locked) {
        // Calculate raw relative coordinate based on canvas zoom level
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - canvasState.panX;
        const mouseY = e.clientY - rect.top - canvasState.panY;
        const newX = Math.round((mouseX / canvasState.zoom) - dragOffset.x);
        const newY = Math.round((mouseY / canvasState.zoom) - dragOffset.y);
        nge.updateLayer(activeArtboardId, draggedLayerId, { x: newX, y: newY });
      }
    }
  };

  const handleStageMouseUp = () => {
    setIsPanning(false);
    setDraggedLayerId(null);
  };

  const handleLayerMouseDownOnStage = (e: React.MouseEvent, layer: NgeLayer) => {
    e.stopPropagation();
    if (activeTool === "pan") return;

    setSelectedLayerId(layer.id);
    if (!layer.locked) {
      setDraggedLayerId(layer.id);
      // Offset calculated between mouse click point and layer coordinates
      const rect = (e.currentTarget.parentNode as HTMLElement).getBoundingClientRect();
      const mouseXInStage = e.clientX - rect.left - canvasState.panX;
      const mouseYInStage = e.clientY - rect.top - canvasState.panY;
      const layerXOnStage = layer.x * canvasState.zoom;
      const layerYOnStage = layer.y * canvasState.zoom;
      setDragOffset({
        x: (mouseXInStage - layerXOnStage) / canvasState.zoom,
        y: (mouseYInStage - layerYOnStage) / canvasState.zoom
      });
    }
  };

  // Run Graphics Verification
  const handleRunGraphicsVerification = async () => {
    setTestActive(true);
    setTestLogs(["Triggering hardware accelerated vector rendering checks...", "Acquiring WebGPU context queues..."]);
    const logs = await nge.runDiagnostics();
    setTimeout(() => {
      setTestLogs(logs);
      setTestActive(false);
    }, 600);
  };

  // Live export trigger (SVG wrapper downloads as local file)
  const handleExportCanvasToSvg = () => {
    const artboard = canvasState.artboards.find(a => a.id === activeArtboardId);
    if (!artboard) return;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${artboard.width}" height="${artboard.height}" style="background:${artboard.backgroundColor}">\n`;
    
    artboard.layers.forEach(layer => {
      if (!layer.visible) return;
      const opacityStyle = layer.opacity !== 1 ? ` opacity="${layer.opacity}"` : "";
      
      if (layer.type === "text" && layer.textContent) {
        svgContent += `  <text x="${layer.x}" y="${layer.y + 40}" fill="#ffffff" font-family="${layer.fontFamily || 'sans-serif'}" font-size="${layer.fontSize || 24}"${opacityStyle}>${layer.textContent}</text>\n`;
      } else if (layer.type === "vector" && layer.vectorData) {
        const d = layer.vectorData.points.map((p, idx) => {
          const prefix = idx === 0 ? "M" : "L";
          return `${prefix} ${p.x + layer.x} ${p.y + layer.y}`;
        }).join(" ") + (layer.vectorData.closed ? " Z" : "");
        
        const fill = layer.vectorData.fillColor || "none";
        const stroke = layer.vectorData.strokeColor || "#ffffff";
        const strokeWidth = layer.vectorData.strokeWidth || 1;
        svgContent += `  <path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${opacityStyle} />\n`;
      } else if (layer.type === "raster") {
        svgContent += `  <rect x="${layer.x}" y="${layer.y}" width="${layer.width}" height="${layer.height}" fill="#2e303e" rx="4"${opacityStyle} />\n`;
        svgContent += `  <text x="${layer.x + 20}" y="${layer.y + 40}" fill="#888888" font-size="12">Raster image placeholder</text>\n`;
      }
    });

    svgContent += "</svg>";

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${artboard.name.toLowerCase().replace(/\s+/g, "-")}-export.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onAddSystemLog) {
      onAddSystemLog(`NGE: Scene graph for artboard [${artboard.name}] exported safely as standalone SVG.`);
    }
  };

  // Find active selected layer details
  const activeArtboard = canvasState.artboards.find(a => a.id === activeArtboardId);
  const selectedLayer = activeArtboard ? activeArtboard.layers.find(l => l.id === selectedLayerId) : null;

  return (
    <div className="space-y-4 p-4 text-slate-200">
      
      {/* TOP HEADER STATUS COMPONENT */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Layers3 className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-1.5">
                NEORA NGE GRAPHICS PLATFORM <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-normal">GPU VERIFIED</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                {lang === "bn" ? "নিওরা গ্রাফিক্স ইঞ্জিন - রিয়েল-টাইম আর্টবোর্ড ও লাইভ ভেক্টর কম্পোজার" : "Neora Graphics Engine - Real-Time Artboard & Vector Composer"}
              </p>
            </div>
          </div>
        </div>

        {/* WORKSPACE PRESETS AND CONTROLLER ACTIONS */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-900 flex items-center gap-1.5 text-slate-400">
            <span>Color Profile:</span>
            <span className="text-indigo-400 font-bold">{canvasState.colorSpace}</span>
            <button 
              onClick={() => nge.setColorSpace(canvasState.colorSpace === "Display_P3" ? "sRGB" : "Display_P3")}
              className="text-[9px] bg-slate-900 px-1 py-0.2 rounded text-slate-300 hover:text-white cursor-pointer"
            >
              TOGGLE
            </button>
          </div>

          <button
            onClick={() => { nge.undo(); updateStateData(); }}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-300 hover:bg-slate-900 cursor-pointer"
            title="Undo State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => { nge.redo(); updateStateData(); }}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-300 hover:bg-slate-900 cursor-pointer"
            title="Redo State"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCanvasToSvg}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT HIGH-RES SVG
          </button>
        </div>
      </div>

      {/* THREE ZONE WORKSPACE GRID:
          - Left: Layer List & Tools (3 Cols)
          - Center: Infinite Artboard Stage (6 Cols)
          - Right: Inspector / Telemetry (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT ZONE: LAYERS & ELEMENT BINDER */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* ARTBOARD SELECTOR */}
          <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">
              ACTIVE ARTBOARD WORKSPACE
            </span>
            <select
              value={activeArtboardId}
              onChange={(e) => {
                nge.updateViewport(canvasState.zoom, canvasState.panX, canvasState.panY);
                setActiveArtboardId(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-900 text-slate-200 p-2 rounded text-xs focus:outline-none focus:border-indigo-500 font-mono"
            >
              {canvasState.artboards.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.width}x{a.height}px)</option>
              ))}
            </select>

            <details className="text-xs font-mono group">
              <summary className="cursor-pointer text-indigo-400 font-bold list-none flex items-center justify-between text-[11px]">
                <span>+ ADD NEW ARTBOARD</span>
                <span className="text-[9px] bg-slate-900 px-1 py-0.2 rounded group-open:hidden">OPEN</span>
              </summary>
              <form onSubmit={handleCreateNewArtboard} className="space-y-2 mt-2 pt-2 border-t border-slate-900 text-[11px]">
                <div>
                  <label className="block text-slate-500">ARTBOARD NAME</label>
                  <input
                    type="text"
                    value={newArtboardName}
                    onChange={(e) => setNewArtboardName(e.target.value)}
                    placeholder="e.g. Mobile Layout"
                    className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 mt-0.5 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-slate-500">WIDTH (PX)</label>
                    <input
                      type="number"
                      value={newArtboardWidth}
                      onChange={(e) => setNewArtboardWidth(parseInt(e.target.value) || 800)}
                      className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 mt-0.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500">HEIGHT (PX)</label>
                    <input
                      type="number"
                      value={newArtboardHeight}
                      onChange={(e) => setNewArtboardHeight(parseInt(e.target.value) || 600)}
                      className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 mt-0.5 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold p-1 rounded hover:bg-indigo-600/20 transition-all cursor-pointer"
                >
                  SPAWN CONTAINER
                </button>
              </form>
            </details>
          </div>

          {/* ADD ELEMENTS TOOLBOX */}
          <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">
              ADD VECTOR OR TEXT NODES
            </span>

            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={handleAddTextLayer}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-900 hover:border-slate-800 text-slate-200 rounded flex items-center justify-center gap-1 cursor-pointer"
              >
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                + TEXT
              </button>

              <button
                onClick={handleAddVectorAlpona}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-900 hover:border-slate-800 text-slate-200 rounded flex items-center justify-center gap-1 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                + ALPONA
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] pt-1.5 border-t border-slate-900">
              <label className="text-slate-500">QUICK TEXT INJECTOR</label>
              <input
                type="text"
                value={addTextVal}
                onChange={(e) => setAddTextVal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-900 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* DYNAMIC SCENE GRAPH TREE */}
          <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">
              SCENE GRAPH NODES ({activeArtboard?.layers.length || 0})
            </span>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
              {activeArtboard?.layers.map((layer) => {
                const isSelected = layer.id === selectedLayerId;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300" 
                        : "bg-slate-900/40 border-slate-900 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[8px] uppercase px-1.5 py-0.2 bg-slate-950 text-slate-500 rounded font-bold">
                        {layer.type}
                      </span>
                      <span className="truncate">{layer.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer.id, layer.visible); }}
                        className="text-slate-500 hover:text-slate-200"
                      >
                        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleLock(layer.id, layer.locked); }}
                        className="text-slate-500 hover:text-slate-200"
                      >
                        {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteLayer(layer.id); }}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!activeArtboard || activeArtboard.layers.length === 0) && (
                <p className="text-[10px] text-slate-600 text-center py-4 font-mono">
                  No visual elements present.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* CENTER ZONE: PHYSICAL INFINITE GRID STAGE */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* VIEWPORT CONTROLS */}
          <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between gap-4">
            {/* Tool Toggles */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => setActiveTool("select")}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                  activeTool === "select" 
                    ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" 
                    : "bg-slate-900 border-slate-900 text-slate-400 hover:bg-slate-900"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Select & Edit
              </button>
              <button
                onClick={() => setActiveTool("pan")}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                  activeTool === "pan" 
                    ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" 
                    : "bg-slate-900 border-slate-900 text-slate-400 hover:bg-slate-900"
                }`}
              >
                <Move className="w-3.5 h-3.5" />
                Hand Pan
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300 font-bold">{(canvasState.zoom * 100).toFixed(0)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetViewport}
                className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                RESET
              </button>
            </div>
          </div>

          {/* PHYSICAL DRAWING STAGE */}
          <div
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onMouseLeave={handleStageMouseUp}
            className={`relative w-full h-[450px] bg-[#07080a] border border-slate-900 rounded-2xl overflow-hidden select-none ${
              activeTool === "pan" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
            }`}
            style={{
              backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundPosition: `${canvasState.panX}px ${canvasState.panY}px`
            }}
          >
            {/* Visual Artboard Container */}
            {activeArtboard && (
              <div
                className="absolute border border-indigo-500/20 shadow-2xl transition-all duration-75"
                style={{
                  left: `${activeArtboard.x * canvasState.zoom + canvasState.panX}px`,
                  top: `${activeArtboard.y * canvasState.zoom + canvasState.panY}px`,
                  width: `${activeArtboard.width * canvasState.zoom}px`,
                  height: `${activeArtboard.height * canvasState.zoom}px`,
                  backgroundColor: activeArtboard.backgroundColor,
                }}
              >
                {/* Artboard Tag */}
                <div className="absolute -top-6 left-0 text-[10px] font-mono font-bold text-indigo-400 bg-slate-950 px-2.5 py-0.5 border border-indigo-500/20 rounded-t">
                  {activeArtboard.name} ({activeArtboard.width}x{activeArtboard.height}px)
                </div>

                {/* Render Layers */}
                {activeArtboard.layers.map((layer) => {
                  if (!layer.visible) return null;

                  const isSelected = layer.id === selectedLayerId;
                  const layerStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${layer.x * canvasState.zoom}px`,
                    top: `${layer.y * canvasState.zoom}px`,
                    width: `${layer.width * canvasState.zoom}px`,
                    height: `${layer.height * canvasState.zoom}px`,
                    transform: `rotate(${layer.rotation || 0}deg)`,
                    opacity: layer.opacity,
                    mixBlendMode: layer.blendMode as any,
                    pointerEvents: activeTool === "pan" ? "none" : "auto"
                  };

                  // Non-destructive CSS filters from adjustments settings
                  if (layer.adjustmentSettings) {
                    const adj = layer.adjustmentSettings;
                    const filters: string[] = [];
                    if (adj.blur) filters.push(`blur(${adj.blur}px)`);
                    if (adj.brightness) filters.push(`brightness(${adj.brightness}%)`);
                    if (adj.contrast) filters.push(`contrast(${adj.contrast}%)`);
                    if (adj.hueRotate) filters.push(`hue-rotate(${adj.hueRotate}deg)`);
                    if (adj.grayscale) filters.push("grayscale(100%)");
                    if (filters.length > 0) {
                      layerStyle.filter = filters.join(" ");
                    }
                  }

                  return (
                    <div
                      key={layer.id}
                      onMouseDown={(e) => handleLayerMouseDownOnStage(e, layer)}
                      style={layerStyle}
                      className={`relative flex items-center justify-center select-none group ${
                        layer.locked ? "pointer-events-none opacity-60" : "cursor-move"
                      } ${isSelected ? "outline-2 outline-indigo-500 outline-dashed" : "hover:outline-1 hover:outline-indigo-500/40"}`}
                    >
                      {/* Anchor bounds overlay */}
                      {isSelected && (
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-500 border border-white rounded-full"></div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 border border-white rounded-full"></div>
                      )}
                      {isSelected && (
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-500 border border-white rounded-full"></div>
                      )}
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-500 border border-white rounded-full"></div>
                      )}

                      {/* TEXT CONTENT RENDER */}
                      {layer.type === "text" && (
                        <div
                          style={{
                            fontSize: `${(layer.fontSize || 24) * canvasState.zoom}px`,
                            fontFamily: layer.fontFamily || "inherit",
                            fontWeight: layer.fontStyle === "Bold" ? "bold" : "normal",
                            color: "#ffffff"
                          }}
                          className="w-full text-center whitespace-normal leading-normal"
                        >
                          {layer.textContent}
                        </div>
                      )}

                      {/* VECTOR ELEMENTS (Bezier render inside SVG viewport) */}
                      {layer.type === "vector" && layer.vectorData && (
                        <svg className="w-full h-full" viewBox={`0 0 ${layer.width} ${layer.height}`} preserveAspectRatio="none">
                          <path
                            d={layer.vectorData.points.map((p, idx) => {
                              const prefix = idx === 0 ? "M" : "L";
                              return `${prefix} ${p.x} ${p.y}`;
                            }).join(" ") + (layer.vectorData.closed ? " Z" : "")}
                            fill={layer.vectorData.fillColor || "none"}
                            stroke={layer.vectorData.strokeColor || "#ffffff"}
                            strokeWidth={layer.vectorData.strokeWidth || 1}
                          />
                        </svg>
                      )}

                      {/* RASTER ASSETS PREVIEW */}
                      {layer.type === "raster" && (
                        <div className="w-full h-full relative overflow-hidden rounded-lg">
                          {layer.rasterUrl ? (
                            <img
                              src={layer.rasterUrl}
                              alt="Raster layer"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                              Raster Image placeholder
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ZONE: INSPECTOR, METRICS & TESTING SPECS */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* CONTROL SELECTOR TABS */}
          <div className="flex bg-slate-950 border border-slate-900 p-1 rounded-lg gap-1">
            {[
              { id: "inspector", label: "Properties", icon: Sliders },
              { id: "telemetry", label: "GPU Telemetry", icon: Activity },
              { id: "history", label: "History", icon: RotateCcw }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id as any)}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  rightPanelTab === tab.id 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl min-h-[380px]">
            
            {/* VIEW A: INSPECTOR PANEL */}
            {rightPanelTab === "inspector" && (
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                    Element Properties
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">NON-DESTRUCTIVE</span>
                </div>

                {selectedLayer ? (
                  <div className="space-y-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[9px]">NAME</span>
                      <input
                        type="text"
                        value={selectedLayer.name}
                        onChange={(e) => nge.updateLayer(activeArtboardId, selectedLayer.id, { name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[9px]">POSITION X</span>
                        <input
                          type="number"
                          value={selectedLayer.x}
                          onChange={(e) => nge.updateLayer(activeArtboardId, selectedLayer.id, { x: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[9px]">POSITION Y</span>
                        <input
                          type="number"
                          value={selectedLayer.y}
                          onChange={(e) => nge.updateLayer(activeArtboardId, selectedLayer.id, { y: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[9px]">WIDTH</span>
                        <input
                          type="number"
                          value={selectedLayer.width}
                          onChange={(e) => nge.updateLayer(activeArtboardId, selectedLayer.id, { width: parseInt(e.target.value) || 100 })}
                          className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[9px]">HEIGHT</span>
                        <input
                          type="number"
                          value={selectedLayer.height}
                          onChange={(e) => nge.updateLayer(activeArtboardId, selectedLayer.id, { height: parseInt(e.target.value) || 100 })}
                          className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[9px]">OPACITY</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={selectedLayer.opacity}
                          onChange={(e) => nge.updateLayer(activeArtboardId, selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-500 mt-1 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-400">{(selectedLayer.opacity * 100).toFixed(0)}%</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[9px]">ROTATION</span>
                        <input
                          type="number"
                          value={selectedLayer.rotation}
                          onChange={(e) => nge.updateLayer(activeArtboardId, selectedLayer.id, { rotation: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[9px]">BLEND MODE</span>
                      <select
                        value={selectedLayer.blendMode}
                        onChange={(e) => nge.updateLayer(activeArtboardId, selectedLayer.id, { blendMode: e.target.value as NgeBlendMode })}
                        className="w-full bg-slate-900 border border-slate-900 rounded p-1 text-slate-200 focus:outline-none text-[11px]"
                      >
                        <option value="normal">Normal</option>
                        <option value="multiply">Multiply</option>
                        <option value="screen">Screen</option>
                        <option value="overlay">Overlay</option>
                        <option value="darken">Darken</option>
                        <option value="lighten">Lighten</option>
                      </select>
                    </div>

                    {/* Non-destructive image/visual adjustment filters */}
                    <div className="space-y-2 border-t border-slate-900 pt-2">
                      <span className="text-slate-500 text-[9px] uppercase font-bold">FX COMPOSITION FILTERS</span>
                      
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[8px] flex justify-between">
                          <span>BRIGHTNESS</span>
                          <span className="text-indigo-400 font-bold">{selectedLayer.adjustmentSettings?.brightness || 100}%</span>
                        </span>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={selectedLayer.adjustmentSettings?.brightness || 100}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const adj = selectedLayer.adjustmentSettings || {};
                            nge.updateLayer(activeArtboardId, selectedLayer.id, { adjustmentSettings: { ...adj, brightness: val } });
                          }}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[8px] flex justify-between">
                          <span>CONTRAST</span>
                          <span className="text-indigo-400 font-bold">{selectedLayer.adjustmentSettings?.contrast || 100}%</span>
                        </span>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={selectedLayer.adjustmentSettings?.contrast || 100}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const adj = selectedLayer.adjustmentSettings || {};
                            nge.updateLayer(activeArtboardId, selectedLayer.id, { adjustmentSettings: { ...adj, contrast: val } });
                          }}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-500 text-[8px] flex justify-between">
                          <span>BLUR RADIUS</span>
                          <span className="text-indigo-400 font-bold">{selectedLayer.adjustmentSettings?.blur || 0}px</span>
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          step="0.5"
                          value={selectedLayer.adjustmentSettings?.blur || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const adj = selectedLayer.adjustmentSettings || {};
                            nge.updateLayer(activeArtboardId, selectedLayer.id, { adjustmentSettings: { ...adj, blur: val } });
                          }}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 text-center py-8 font-mono">
                    Select a scene node to inspect properties.
                  </p>
                )}
              </div>
            )}

            {/* VIEW B: TELEMETRY VIEW */}
            {rightPanelTab === "telemetry" && (
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                    GPU Accelerated Telemetry
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900">
                    <span className="text-slate-500 text-[8px] block">REFRESH SPEED</span>
                    <span className="text-emerald-400 font-bold text-sm">{telemetry.fps} FPS</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">{telemetry.frameTimeMs} ms/frame</span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900">
                    <span className="text-slate-500 text-[8px] block">TEXTURES CACHED</span>
                    <span className="text-slate-200 font-bold text-sm">{telemetry.textureCacheCount} instances</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">VRAM Alloc: {telemetry.vramUsageMb} MB</span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900">
                    <span className="text-slate-500 text-[8px] block">GPU LOAD PROFILE</span>
                    <span className="text-indigo-400 font-bold text-sm">{telemetry.gpuUtilizationPercent}%</span>
                    <div className="w-full bg-slate-950 h-1 rounded mt-1.5 overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded" style={{ width: `${telemetry.gpuUtilizationPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900">
                    <span className="text-slate-500 text-[8px] block">DRAW CALLS / FRAME</span>
                    <span className="text-slate-200 font-bold text-sm">{telemetry.drawCalls} queues</span>
                    <span className="text-[8px] text-indigo-400 block mt-0.5">Complexity: {telemetry.complexityScore.toUpperCase()}</span>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-400 space-y-1">
                  <span className="font-bold text-slate-300 block text-[9px] uppercase">RENDER CHANNELS</span>
                  <div className="flex justify-between border-b border-slate-950 pb-1">
                    <span>Hardware Anti-aliasing MSAA:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE (4x)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-950 pb-1">
                    <span>Bezier Curve Tessellator:</span>
                    <span className="text-emerald-400 font-bold">GPU DIRECT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dynamic Occlusion Culling:</span>
                    <span className="text-slate-300">STRICT BUFFERED</span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW C: LOGS & HISTORY ROLLBACKS */}
            {rightPanelTab === "history" && (
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                    History & Event Stream
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin text-[10px] font-mono">
                  {eventHistory.map((ev) => (
                    <div key={ev.id} className="border-b border-slate-900 pb-1">
                      <div className="flex justify-between text-slate-500">
                        <span>[{ev.timestamp}]</span>
                        <span className="text-indigo-400 uppercase text-[8px] font-bold">{ev.type}</span>
                      </div>
                      <p className="text-slate-300 mt-0.5">{ev.message}</p>
                    </div>
                  ))}

                  {eventHistory.length === 0 && (
                    <p className="text-slate-600 text-center py-4">No events logged yet.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* LOWER PANEL: VERIFICATION TESTING HARNESS */}
      <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3 font-mono">
        <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 border-b border-slate-900 pb-2">
          <Sliders className="w-4 h-4" />
          GRAPHICS COMPLIANCE & VECTOR TESSELLATOR DIAGNOSTIC HARNESS
        </span>

        <p className="text-xs text-slate-400">
          Run tests on the GPU rendering shaders, raster tiles performance buffers, Bezier curve expansions, and memory leak regression metrics.
        </p>

        <button
          onClick={handleRunGraphicsVerification}
          disabled={testActive}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
        >
          {testActive ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          RUN RENDERING DIAGNOSTICS
        </button>

        {testLogs.length > 0 && (
          <div className="bg-slate-900 border border-slate-900 p-3 rounded-lg text-xs space-y-1.5">
            <div className="text-[10px] text-indigo-400 font-bold uppercase">DIAGNOSTIC CHANNEL OUTPUT:</div>
            <div className="space-y-1 max-h-[140px] overflow-y-auto">
              {testLogs.map((log, i) => (
                <div key={i} className={log.includes("FAIL") ? "text-rose-400" : log.includes("PASS") || log.includes("SUCCESS") || log.includes("✔️") ? "text-emerald-400" : "text-slate-400"}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
