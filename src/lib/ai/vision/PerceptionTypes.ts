import { DocumentType, ImageFormat } from "./types.ts";

export enum AssetCategory {
  POSTER = "Poster",
  BANNER = "Banner",
  LEAFLET = "Leaflet",
  BUSINESS_CARD = "Business Card",
  BROCHURE = "Brochure",
  CALENDAR = "Calendar",
  CERTIFICATE = "Certificate",
  BOOK_COVER = "Book Cover",
  MAGAZINE = "Magazine",
  SOCIAL_MEDIA = "Social Media",
  PACKAGING = "Packaging",
  LOGO = "Logo",
  INFOGRAPHIC = "Infographic",
  ILLUSTRATION = "Illustration",
  UNKNOWN = "Unknown"
}

export type AnalyzerType =
  | "ocr"
  | "layout"
  | "grid"
  | "typography"
  | "calligraphy"
  | "color"
  | "pattern"
  | "texture"
  | "object_detector"
  | "logo_detector"
  | "illustration"
  | "brand"
  | "composition"
  | "negative_space"
  | "visual_hierarchy"
  | "accessibility"
  | "print_readiness"
  | "style"
  | "image_quality"
  | "future_3d"
  | "future_video";

export interface ProviderAdapter {
  id: string;
  name: string;
  type: "gemini" | "openai" | "claude" | "ollama" | "comfyui" | "custom_vision" | "ocr_engine" | "layout_model" | "object_detection";
  health: "healthy" | "degraded" | "offline";
  latencyMs: number;
}

export interface TaskPlan {
  assetCategory: AssetCategory;
  activatedAnalyzers: AnalyzerType[];
  executionFlow: "parallel" | "sequential" | "hybrid";
  estimatedLatencyMs: number;
}

export interface ConfidenceEvidence {
  score: number; // 0.0 to 1.0
  evidence: string;
  supportingAnalyzer: AnalyzerType;
  alternativeCandidates?: string[];
  failureReason?: string;
}

export interface UnifiedVisualReport {
  id: string;
  timestamp: string;
  category: AssetCategory;
  primaryDirection: "ltr" | "rtl" | "mixed";
  detectedLanguages: string[];
  
  // Analyzer outputs (Normalized)
  typography: {
    fontFamilies: string[];
    mainHeading: string;
    textDensity: number; // 0 to 1
    calligraphyStyle?: string;
    hasComplexLigatures: boolean;
  };

  layout: {
    compositionType: string;
    gridStructure: string;
    visualHierarchy: Array<{ level: number; description: string }>;
    balanceScore: number;
    whitespaceRatio: number;
  };

  colorPalette: {
    dominantColors: Array<{ hex: string; ratio: number; name: string }>;
    harmonyRating: "excellent" | "good" | "fair" | "poor";
    contrastAccessible: boolean;
  };

  elements: {
    logos: string[];
    icons: string[];
    illustrations: string[];
    objects: string[];
    patterns: string[];
    textures: string[];
  };

  creativeInsights: {
    dominantStyle: "Minimalist" | "Corporate" | "Luxury" | "Islamic" | "Modern" | "Vintage" | "Cultural" | "Abstract";
    intendedAudience: string;
    purposeDescription: string;
    moodAtmosphere: string[];
    whitespaceUsage: "underutilized" | "optimal" | "crowded";
    harmonyScore: number; // 0 to 100
    brandConsistencyCheck?: string;
  };

  qualityAndPrint: {
    imageQualityRating: "poor" | "acceptable" | "optimal";
    printReadinessScore: number; // 0 to 100
    potentialPrintIssues: string[];
    dpiEstimate?: number;
  };

  accessibility: {
    score: number; // 0 to 100
    notes: string[];
    violations: string[];
  };

  inspirationMetadata?: {
    compositionInspiration: string;
    colorSystemNotes: string;
    visualRhythm: string;
    spacingGuidelines: string;
    decorativeSpatials: string;
  };

  confidenceEngine: {
    overallConfidence: number;
    evidenceMap: Record<string, ConfidenceEvidence>;
  };

  recommendedNextActions: string[];
}

export interface TelemetryEvent {
  eventId: string;
  timestamp: string;
  type: "VisionStarted" | "AnalyzerStarted" | "AnalyzerCompleted" | "AnalyzerFailed" | "AggregationCompleted" | "KnowledgeStored" | "ContextReady";
  analyzer?: AnalyzerType;
  durationMs?: number;
  message: string;
}
