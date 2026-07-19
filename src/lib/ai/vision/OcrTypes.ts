export enum ScriptType {
  LATIN = "Latin",
  BENGALI = "Bengali",
  ARABIC = "Arabic",
  URDU = "Urdu",
  DEVANAGARI = "Devanagari",
  CHINESE = "Chinese",
  JAPANESE = "Japanese",
  KOREAN = "Korean",
  MIXED = "Mixed Script",
  UNKNOWN = "Unknown"
}

export enum TextRegionCategory {
  HEADLINE = "Headline",
  SUBHEADING = "Subheading",
  BODY_TEXT = "Body Text",
  CAPTION = "Caption",
  FOOTNOTE = "Footnote",
  WATERMARK = "Watermark Text",
  DECORATIVE = "Decorative Text",
  LOGO_TEXT = "Logo Text",
  STAMP = "Stamp/Seal",
  ENTITY_INFO = "Entity Info" // Names, dates, addresses, phone, etc.
}

export enum FontFamilyClass {
  SERIF = "Serif",
  SANS_SERIF = "Sans Serif",
  MONOSPACE = "Monospace",
  DISPLAY = "Display/Decorative",
  SCRIPT = "Script/Handwritten",
  CALLIGRAPHY = "Calligraphy"
}

export interface TextRegion {
  id: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text: string;
  confidence: number;
  category: TextRegionCategory;
  script: ScriptType;
  fontFamilyEstimate?: string;
  fontClassEstimate?: FontFamilyClass;
  fontSizeEstimatePx?: number;
}

export interface TypographyAttributes {
  fontClass: FontFamilyClass;
  estimatedFontFamily: string;
  weight: "thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "black";
  width: "condensed" | "normal" | "expanded";
  alignment: "left" | "center" | "right" | "justify";
  leadingRatio: number; // calculated ratio line-height/font-size
  trackingRatio: number; // letter spacing ratio
  readabilityScore: number; // 0 to 100
  alternativeFonts: string[];
}

export interface CalligraphyAttributes {
  styleName: string;
  strokeFlow: "fluid" | "geometric" | "stiff" | "erratic";
  strokeThicknessRating: number; // 1 to 10
  curvatureRating: number; // 1 to 10
  decorativeFlourishes: boolean;
  hasComplexLigatures: boolean;
  baselineAlignmentStyle: "straight" | "arched" | "slanted" | "free-flowing";
  mediumType: "brush-pen" | "ink-traditional" | "watercolor" | "vector-digital" | "flat-raster";
}

export interface SemanticEntity {
  type: "Event" | "Person" | "Organization" | "Date" | "Address" | "ContactInfo" | "Price" | "CallToAction" | "GeneralMetadata";
  value: string;
  extractedFromText: string;
  confidence: number;
}

export interface OcrQualityAssessment {
  sharpness: number; // 0 to 100
  blurValue: number; // 0 to 100
  contrastRating: "excellent" | "acceptable" | "poor";
  lightingUniformityScore: number; // 0 to 100
  compressionArtifactsDetected: boolean;
}

export interface UnifiedOcrReport {
  id: string;
  timestamp: string;
  fileName: string;
  detectedLanguages: string[];
  detectedScripts: ScriptType[];
  primaryDirection: "ltr" | "rtl" | "mixed";
  fullRecognizedText: string;
  
  // Logical regions
  regions: TextRegion[];
  readingOrder: string[]; // Ordered list of TextRegion.id

  // Dedicated Analyzers Output
  typographySummary: {
    dominantClass: FontFamilyClass;
    familiesDetected: string[];
    attributes: TypographyAttributes;
    hierarchyCoherenceScore: number; // 0 to 100
  };

  calligraphySummary?: CalligraphyAttributes;

  semanticEntities: SemanticEntity[];

  qualityAssessment: OcrQualityAssessment;

  confidenceMetrics: {
    overallOcrConfidence: number;
    scriptDetectionConfidence: number;
    typographyClassificationConfidence: number;
  };

  warnings: string[];
  recommendedDownstreamTasks: string[];
}

export interface OcrAdapter {
  id: string;
  name: string;
  providerType: "google_vision" | "tesseract" | "gemini_multimodal" | "openai_gpt4" | "local_algorithmic";
  supportedScripts: ScriptType[];
  healthStatus: "healthy" | "degraded" | "offline";
  avgLatencyMs: number;
}

export interface OcrTelemetryEvent {
  eventId: string;
  timestamp: string;
  eventType: "OCRStarted" | "ScriptDetected" | "TextRecognized" | "TypographyCompleted" | "CalligraphyCompleted" | "OCRCompleted" | "OCRFailed";
  message: string;
  metadata?: {
    latencyMs?: number;
    detectedLanguages?: string[];
    regionsCount?: number;
    error?: string;
  };
}
