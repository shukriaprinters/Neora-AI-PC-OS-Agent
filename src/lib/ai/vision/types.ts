export enum DocumentType {
  POSTER = "poster",
  BANNER = "banner",
  FLYER = "flyer",
  CALLIGRAPHY_ART = "calligraphy_art",
  INFOGRAPHIC = "infographic",
  DOCUMENT_PAGE = "document_page",
  LOGO_OR_ICON = "logo_or_icon",
  UNKNOWN = "unknown"
}

export enum ImageFormat {
  PNG = "png",
  JPEG = "jpeg",
  WEBP = "webp",
  TIFF = "tiff",
  BMP = "bmp",
  SVG = "svg",
  PDF = "pdf",
  PSD = "psd",
  AI = "ai",
  EPS = "eps",
  UNKNOWN = "unknown"
}

export interface ImageMetadata {
  format: ImageFormat;
  width: number;
  height: number;
  aspectRatio: string;
  sizeBytes: number;
  hasAlphaChannel: boolean;
  colorSpace: string;
  mimeType: string;
}

export interface QualityReport {
  overallScore: number; // 0.0 to 1.0
  resolutionStatus: "low-res" | "standard" | "high-res" | "ultra-high-res";
  blurriness: number; // 0.0 to 1.0
  noiseLevel: number; // 0.0 to 1.0
  contrastRating: "poor" | "acceptable" | "optimal" | "harsh";
  compressionArtifacts: number; // 0.0 to 1.0
}

export interface ColorSwatch {
  hex: string;
  rgb: [number, number, number];
  ratio: number; // 0.0 to 1.0 representation
  name?: string;
  isDominant: boolean;
}

export interface TypographyElement {
  text: string;
  fontFamily: string;
  confidence: number;
  fontSizeApprox: number;
  colorHex: string;
  boundingBox: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
  languageCode: "en" | "bn" | "ar" | "ur" | "hi" | "unknown";
  writingDirection: "ltr" | "rtl";
}

export interface VisualElement {
  id: string;
  label: string;
  confidence: number;
  category: "logo" | "illustration" | "background" | "ornament" | "calligraphy" | "shape" | "text" | "other";
  boundingBox: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
}

export interface LayoutAnalysisReport {
  compositionType: "rule-of-thirds" | "centered-radial" | "golden-ratio" | "split-diagonal" | "grid-balanced" | "asymmetric";
  visualHierarchy: Array<{
    level: number; // 1 = primary focus, 2 = secondary etc.
    elementId: string;
    description: string;
  }>;
  margins: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  balanceScore: number; // 0.0 to 1.0
}

export interface StyleAnalysisReport {
  detectedTheme: string; // e.g. "Cosmic Slate", "Traditional Boishakhi", "Imperial Islamic Gold"
  atmosphere: string[]; // e.g. ["warmth", "traditional", "luxury"]
  geometricSymmetryScore: number; // 0.0 to 1.0
  complexityLevel: "minimalist" | "balanced" | "highly-ornated";
  primaryMotif: string; // e.g. "mandala geometric", "alpona floral border lines"
}

export interface SemanticConcept {
  conceptName: string;
  contextMapping: string;
  confidence: number;
  relevanceScore: number;
}

export interface AnalysisPackage {
  analysisId: string;
  targetFileName: string;
  timestamp: string;
  documentType: DocumentType;
  metadata: ImageMetadata;
  quality: QualityReport;
  colors: ColorSwatch[];
  typography: TypographyElement[];
  visualElements: VisualElement[];
  layout: LayoutAnalysisReport;
  style: StyleAnalysisReport;
  semantics: SemanticConcept[];
  languagesDetected: string[];
  primaryDirection: "ltr" | "rtl";
  recommendedDownstreamTasks: string[];
  confidenceScore: number;
  uncertaintyIndicator: boolean;
  notes: string;
}

export interface AnalysisJob {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number; // 0 to 100
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  result?: AnalysisPackage;
  priority: "high" | "normal" | "low";
  retryCount: number;
  targetFilePath: string;
  originalFileName: string;
}

export interface VisionSystemMetrics {
  totalAnalyzed: number;
  successRate: number;
  averageLatencyMs: number;
  activeQueueLength: number;
  failedCount: number;
  cancelledCount: number;
  byDocumentType: Record<string, number>;
  byLanguage: Record<string, number>;
  modelHealthStatus: "healthy" | "degraded" | "unreachable";
}
