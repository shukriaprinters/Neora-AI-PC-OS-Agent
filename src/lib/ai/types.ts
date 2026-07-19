/**
 * NEORA AI DESIGNER OS - ENTERPRISE AI PLATFORM TYPES (PHASE 1.5)
 * Comprehensive, modular, and production-ready type definitions for the Model Router,
 * Calligraphy Engine, Vector Intelligence, and Creative AI Director.
 */

export type ModelId = string;
export type ProviderId = string;

export enum ModelCategory {
  REASONING = "reasoning",
  VISION = "vision",
  OCR = "ocr",
  IMAGE_GENERATION = "image_generation",
  IMAGE_EDITING = "image_editing",
  UPSCALING = "upscaling",
  BACKGROUND_REMOVAL = "background_removal",
  VECTOR_GENERATION = "vector_generation",
  SPEECH_TO_TEXT = "speech_to_text",
  TEXT_TO_SPEECH = "text_to_speech",
  EMBEDDINGS = "embeddings",
  TRANSLATION = "translation",
  PROGRAMMING = "programming",
  PLANNING = "planning",
  MEMORY = "memory"
}

export type RoutingStrategy =
  | "fastest"
  | "lowest_cost"
  | "highest_quality"
  | "balanced"
  | "offline_preferred"
  | "cloud_preferred";

export interface ModelCapability {
  id: ModelId;
  provider: ProviderId;
  category: ModelCategory;
  name: string;
  strengths: string[];
  weaknesses: string[];
  inputTypes: ("text" | "image" | "audio" | "vector")[];
  outputTypes: ("text" | "image" | "audio" | "vector" | "json")[];
  contextWindow: number;
  streaming: boolean;
  toolCalling: boolean;
  vision: boolean;
  jsonMode: boolean;
  latencyMs: number;
  costPer1kTokensInput: number;
  costPer1kTokensOutput: number;
  qualityScore: number; // 1 to 10
  reliability: number; // 0.0 to 1.0 (uptime ratio)
  supportedLanguages: string[];
}

// Multilingual & Typography Intelligence shapes
export interface TypographyPlan {
  headlineFont: string;
  bodyFont: string;
  accentFont?: string;
  direction: "ltr" | "rtl" | "mixed";
  kerning: "auto" | "optical" | "metric";
  tracking: number; // custom em scaling
  leading: number; // line-height multiplier
  alignment: "left" | "right" | "center" | "justify";
  hierarchyScore: number;
  pairingRationale: string;
}

// Calligraphy Framework shapes
export interface CalligraphyPath {
  id: string;
  char: string;
  svgPath: string; // Bezier curves
  strokeWidth: number;
  anchorPoints: { x: number; y: number; type: "corner" | "bezier" }[];
  decorativeFlourishes: string[]; // SVG decorations IDs
}

export interface CalligraphyRenderPlan {
  style: "bangla" | "arabic" | "english" | "islamic" | "luxury" | "modern_brush";
  baselineOffset: number;
  characterBalancingRatio: number;
  ligaturesEnabled: boolean;
  strokeDensity: number;
  borderDesignType?: "none" | "geometric" | "islamic" | "floral";
  svgPaths: CalligraphyPath[];
}

// Vector intelligence shapes
export interface VectorPath {
  id: string;
  type: "path" | "rect" | "circle" | "polygon";
  d?: string; // Bezier definition
  points?: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  booleanOperation?: "none" | "union" | "difference" | "intersection";
}

export interface VectorDesignPlan {
  width: number;
  height: number;
  gridAlign: boolean;
  seamlessPattern?: "none" | "geometric" | "mandala" | "islamic" | "alpona";
  paths: VectorPath[];
}

// Security & Watermark patterns
export interface SecurityPatternPlan {
  type: "none" | "guilloche" | "micro_text" | "watermark" | "banknote_style";
  text?: string; // for micro_text or watermark
  opacity: number;
  layerIndex: number;
  svgPatternDefinition: string; // Background security line math patterns
}

// AI Creative Design Plan
export interface DesignPlan {
  id: string;
  projectName: string;
  audience: string;
  purpose: string;
  industry: string;
  culture: string;
  colorPalette: { hex: string; label: string; psychology: string }[];
  typography: TypographyPlan;
  gridPlan: { columns: number; margin: number; gutters: number };
  calligraphy?: CalligraphyRenderPlan;
  vectorPlan?: VectorDesignPlan;
  securityPattern?: SecurityPatternPlan;
  negativeSpaceScore: number; // 1 to 10
  accessibilityChecked: boolean;
  printSafeChecked: boolean;
}

// Creative AI Director Coordination Tasks
export interface DirectorState {
  currentStage:
    | "idle"
    | "requirement_understanding"
    | "reference_analysis"
    | "typography_planning"
    | "calligraphy_planning"
    | "ornament_planning"
    | "color_psychology"
    | "layout_planning"
    | "print_planning"
    | "vector_planning"
    | "image_generation"
    | "layer_generation"
    | "quality_review"
    | "completed";
  progress: number; // 0 to 100
  logs: string[];
  activeDesignPlan?: DesignPlan;
}

// Telemetry & Optimization metrics
export interface TelemetryEvent {
  id: string;
  timestamp: string;
  modelId: string;
  providerId: string;
  category: ModelCategory;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  status: "success" | "fallback" | "failed";
}
