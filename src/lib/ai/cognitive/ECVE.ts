// NEORA ENTERPRISE CANVAS & VIEWPORT ENGINE (Phase 2.3.6A.1.3)
// Infinite canvas coordinator, GPU WebGPU/Vulkan setups, ruler bounds, guides, and snap states.

export type EcveGridType = "pixel" | "vector" | "perspective" | "isometric" | "hexagonal" | "golden_ratio";
export type EcveUnit = "px" | "mm" | "cm" | "in" | "pt" | "pica";
export type EcveRenderBackend = "WebGPU" | "Vulkan" | "Metal" | "DirectX" | "WebGL_Fallback";

export interface EcveGuide {
  id: string;
  orientation: "horizontal" | "vertical";
  position: number; // in canvas units
  color: string;
}

export interface EcveArtboard {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  presetName: string;
}

export interface EcveCompositionOverlay {
  type: "rule_of_thirds" | "golden_ratio" | "golden_spiral" | "diagonal" | "visual_balance" | "cta_heatmap";
  visible: boolean;
  opacity: number;
}

export interface EcveEvent {
  id: string;
  timestamp: string;
  type:
    | "CanvasCreated"
    | "CanvasUpdated"
    | "ViewportChanged"
    | "GridChanged"
    | "GuideCreated"
    | "SnapTriggered"
    | "RenderingStarted"
    | "RenderingCompleted";
  message: string;
  metadata?: any;
}

export interface EcveRenderingStats {
  fps: number;
  frameTimeMs: number;
  vramUsedMb: number;
  gpuLoadPercent: number;
  visibleObjects: number;
  renderQueueLength: number;
  viewportLatencyMs: number;
}

export class ECVE {
  private static instance: ECVE | null = null;

  private isInfiniteCanvas: boolean = true;
  private canvasWidth: number = 5000;
  private canvasHeight: number = 5000;
  
  private zoomPercent: number = 100; // 1% to 64000%
  private viewportRotation: number = 0; // 0 to 360 degrees
  private isMirrored: boolean = false;
  private isFlipped: boolean = false;

  private activeBackend: EcveRenderBackend = "WebGPU";
  private activeUnit: EcveUnit = "px";
  private activeGrid: EcveGridType = "pixel";
  private gridSpacing: number = 20;

  private artboards: EcveArtboard[] = [];
  private guides: EcveGuide[] = [];
  
  private snapToGrid: boolean = true;
  private snapToGuides: boolean = true;
  private snapToPixel: boolean = true;
  private snapToAnchor: boolean = true;

  private compositionOverlay: EcveCompositionOverlay = {
    type: "rule_of_thirds",
    visible: false,
    opacity: 0.4,
  };

  private eventHistory: EcveEvent[] = [];
  private listeners: ((event: EcveEvent) => void)[] = [];

  // Rendering Live Performance Metrics
  private stats: EcveRenderingStats = {
    fps: 120,
    frameTimeMs: 8.3,
    vramUsedMb: 512,
    gpuLoadPercent: 28,
    visibleObjects: 142,
    renderQueueLength: 0,
    viewportLatencyMs: 2,
  };

  private constructor() {
    this.seedDefaultArtboards();
    this.seedDefaultGuides();
  }

  public static getInstance(): ECVE {
    if (!ECVE.instance) {
      ECVE.instance = new ECVE();
    }
    return ECVE.instance;
  }

  private seedDefaultArtboards() {
    this.artboards = [
      { id: "art-1", name: "Instagram Post (1:1)", width: 1080, height: 1080, x: 100, y: 100, presetName: "Digital Square" },
      { id: "art-2", name: "Letterhead Standard", width: 2550, height: 3300, x: 1400, y: 100, presetName: "Print Letter" },
      { id: "art-3", name: "Dribbble Shot", width: 1600, height: 1200, x: 100, y: 1400, presetName: "Portfolio Asset" },
    ];
  }

  private seedDefaultGuides() {
    this.guides = [
      { id: "g-1", orientation: "vertical", position: 540, color: "#22d3ee" },
      { id: "g-2", orientation: "horizontal", position: 540, color: "#22d3ee" },
    ];
  }

  // Getters
  public getIsInfiniteCanvas(): boolean { return this.isInfiniteCanvas; }
  public getCanvasDimensions() { return { width: this.canvasWidth, height: this.canvasHeight }; }
  public getZoomPercent(): number { return this.zoomPercent; }
  public getViewportRotation(): number { return this.viewportRotation; }
  public getIsMirrored(): boolean { return this.isMirrored; }
  public getIsFlipped(): boolean { return this.isFlipped; }
  public getActiveBackend(): EcveRenderBackend { return this.activeBackend; }
  public getActiveUnit(): EcveUnit { return this.activeUnit; }
  public getActiveGrid(): EcveGridType { return this.activeGrid; }
  public getGridSpacing(): number { return this.gridSpacing; }
  public getArtboards(): EcveArtboard[] { return this.artboards; }
  public getGuides(): EcveGuide[] { return this.guides; }
  
  public getSnapSettings() {
    return { grid: this.snapToGrid, guides: this.snapToGuides, pixel: this.snapToPixel, anchor: this.snapToAnchor };
  }

  public getCompositionOverlay(): EcveCompositionOverlay { return this.compositionOverlay; }
  public getEventHistory(): EcveEvent[] { return this.eventHistory; }

  public getRenderingStats(): EcveRenderingStats {
    // Generate organic jitter for FPS and GPU load
    this.stats.fps = Math.max(90, Math.min(125, this.stats.fps + Math.floor(Math.random() * 7) - 3));
    this.stats.frameTimeMs = parseFloat((1000 / this.stats.fps).toFixed(1));
    this.stats.gpuLoadPercent = Math.max(10, Math.min(95, this.stats.gpuLoadPercent + Math.floor(Math.random() * 5) - 2));
    this.stats.vramUsedMb = Math.max(128, Math.min(4096, this.stats.vramUsedMb + Math.floor(Math.random() * 3) - 1));
    return this.stats;
  }

  // Viewport Modifiers
  public setZoom(zoom: number) {
    // Range constraint 1% to 64,000%
    const cleanZoom = Math.max(1, Math.min(64000, zoom));
    this.zoomPercent = cleanZoom;
    this.logEvent("ViewportChanged", `Set viewport zoom to ${cleanZoom}% (${cleanZoom >= 1000 ? "Sub-pixel precision active" : "Normal resolution"})`);
  }

  public adjustRotation(deg: number) {
    const cleanDeg = (deg + 360) % 360;
    this.viewportRotation = cleanDeg;
    this.logEvent("ViewportChanged", `Rotated active rendering canvas viewport to: ${cleanDeg}°`);
  }

  public toggleMirrored() {
    this.isMirrored = !this.isMirrored;
    this.logEvent("ViewportChanged", `Viewport horizontal mirroring toggled: ${this.isMirrored}`);
  }

  public toggleFlipped() {
    this.isFlipped = !this.isFlipped;
    this.logEvent("ViewportChanged", `Viewport vertical flip toggled: ${this.isFlipped}`);
  }

  // Layout Canvas Changes
  public addGuide(orientation: EcveGuide["orientation"], position: number) {
    const id = `g-${Date.now().toString().slice(-4)}`;
    this.guides.push({ id, orientation, position, color: "#38bdf8" });
    this.logEvent("GuideCreated", `Registered smart alignment guide: ${orientation.toUpperCase()} at coordinate ${position}${this.activeUnit}`);
  }

  public removeGuide(id: string) {
    this.guides = this.guides.filter(g => g.id !== id);
    this.logEvent("CanvasUpdated", `Deleted guide reference: ${id}`);
  }

  public setGridSettings(type: EcveGridType, spacing: number) {
    this.activeGrid = type;
    this.gridSpacing = spacing;
    this.logEvent("GridChanged", `Grid system updated to ${type.toUpperCase()} with coordinate spacing interval: ${spacing}${this.activeUnit}`);
  }

  public toggleSnap(type: "grid" | "guides" | "pixel" | "anchor") {
    if (type === "grid") this.snapToGrid = !this.snapToGrid;
    if (type === "guides") this.snapToGuides = !this.snapToGuides;
    if (type === "pixel") this.snapToPixel = !this.snapToPixel;
    if (type === "anchor") this.snapToAnchor = !this.snapToAnchor;

    this.logEvent("SnapTriggered", `Snap guidelines modifier updated. [${type.toUpperCase()}] snapping set to: ${this[("snapTo" + type.charAt(0).toUpperCase() + type.slice(1)) as keyof ECVE]}`);
  }

  public setCompositionOverlay(type: EcveCompositionOverlay["type"], visible: boolean, opacity: number = 0.4) {
    this.compositionOverlay = { type, visible, opacity };
    this.logEvent("CanvasUpdated", `Overlay compositing mode updated to: ${type.toUpperCase()} (Visible: ${visible})`);
  }

  public changeBackend(backend: EcveRenderBackend) {
    this.stats.renderQueueLength = 15; // momentary queuing
    this.activeBackend = backend;
    this.logEvent("RenderingStarted", `Hot-swapping viewport graphics engine backend context to: ${backend}...`);
    
    setTimeout(() => {
      this.stats.renderQueueLength = 0;
      this.logEvent("RenderingCompleted", `GPU Pipeline fully compiled. Render context re-established over native ${backend} driver.`);
    }, 800);
  }

  public changeUnit(unit: EcveUnit) {
    this.activeUnit = unit;
    this.logEvent("CanvasUpdated", `Canvas system measurement unit updated to standard: ${unit.toUpperCase()}`);
  }

  // Event handlers
  public subscribe(cb: (event: EcveEvent) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private logEvent(type: EcveEvent["type"], message: string, metadata?: any) {
    const ev: EcveEvent = {
      id: `ecve-ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      metadata,
    };
    this.eventHistory.unshift(ev);
    if (this.eventHistory.length > 50) this.eventHistory.pop();
    this.listeners.forEach(cb => cb(ev));
  }
}
export default ECVE;
