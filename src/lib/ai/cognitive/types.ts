/**
 * NEORA AI DESIGNER OS - COGNITIVE FOUNDATION TYPES
 * Domain models, schemas, and interfaces for the enterprise-grade Memory,
 * Context, and Knowledge platform (Cognitive Foundation).
 */

export enum MemoryCategory {
  CONVERSATION = "conversation",
  PROJECT = "project",
  DESIGN = "design",
  VISUAL = "visual",
  TYPOGRAPHY = "typography",
  COLOR = "color",
  BRAND = "brand",
  CLIENT = "client",
  TEMPLATE = "template",
  ASSET = "asset",
  REFERENCE = "reference",
  PLUGIN = "plugin",
  AI_DECISION = "ai_decision",
  WORKFLOW = "workflow",
  EXPORT = "export",
  RESEARCH = "research",
  LEARNING = "learning",
  CREATIVE = "creative"
}

export type LanguageCode =
  | "bn" | "en" | "ar" | "ur" | "hi" | "fa" | "tr" | "ms" | "fr" | "es" | "zh" | "ja" | "ko";

export interface LanguageTypographyPreference {
  language: LanguageCode;
  preferredFonts: string[];
  preferredDirection: "ltr" | "rtl" | "mixed";
  openTypeFeatures?: string[];
  calligraphyStyle?: string;
  baselineOffset?: number;
}

export interface BrandProfile {
  id: string;
  name: string;
  brandColors: string[]; // hex codes
  brandFonts: string[];
  logoRules: string[];
  spacingRules: { margin: number; gutters: number; padding: number };
  visualIdentity: string;
  tone: string;
  mood: string;
  brandAssets: string[]; // asset URLs
  allowedTemplates: string[]; // template IDs
  forbiddenStyles: string[];
  exportRequirements: { format: string; dpi: number }[];
  printRules?: string[];
  lastUpdated: string;
}

export interface UserPreferences {
  userId: string;
  preferredLanguage: LanguageCode;
  writingDirection: "ltr" | "rtl" | "mixed";
  preferredFonts: string[];
  preferredColorPalettes: string[][];
  preferredPosterStyles: string[];
  preferredLayouts: string[];
  preferredPrintSettings: { bleedMm: number; cmyk: boolean; format: string };
  preferredExportFormats: string[];
  preferredIllustrationStyles: string[];
  preferredCalligraphyStyles: string[];
  preferredWatermarkStyles: string[];
  preferredVectorStyles: string[];
  preferredDesignCategories: string[];
  preferredAiProviders: string[];
  preferredEditingWorkflow: string;
  learningEnabled: boolean; // providing user control over automated behavior updates
}

export interface MemoryEntry {
  id: string;
  userId: string;
  projectId: string | null;
  category: MemoryCategory;
  tags: string[];
  key: string;
  value: any; // arbitrary structured value or text content
  importance: number; // 1 to 5
  confidence: number; // 0.0 to 1.0 (confidence score)
  sourceAttribution: string; // e.g. "user_chat", "visual_detection_engine", "brand_rules_doc"
  version: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

// --- KNOWLEDGE GRAPH SHAPES ---

export type NodeType =
  | "user" | "project" | "brand" | "font" | "color" | "layout" | "asset" | "template" | "style" | "plugin" | "model" | "export" | "research";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string; // e.g. "OWNS", "USES_FONT", "COMPATIBLE_WITH", "RECOMMENDS"
  confidence: number; // 0.0 to 1.0
  sourceAttribution: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// --- CONTEXT BUILDER SHAPES ---

export interface ContextPackage {
  id: string;
  timestamp: string;
  userId: string;
  activeProjectId: string | null;
  activePageId: string | null;
  conversationContext: {
    recentMessages: any[];
    activeIntent: string;
  };
  projectContext: {
    dimensions: { width: number; height: number };
    layerSummary: { id: string; name: string; type: string; opacity: number }[];
    recentEdits: string[];
  };
  visualContext: {
    detectedColors: { hex: string; ratio: number }[];
    detectedMood: string;
    detectedComposition: string;
    detectedOrnaments: string[];
  };
  brandContext: BrandProfile | null;
  userPreferences: UserPreferences;
  relevantMemories: MemoryEntry[];
  metadata: Record<string, any>;
}

// --- SEMANTIC SEARCH SHAPES ---

export interface SemanticQuery {
  text?: string;
  category?: MemoryCategory;
  projectId?: string | null;
  tags?: string[];
  importanceMin?: number;
  confidenceMin?: number;
  timeFilter?: { start: string; end: string };
  limit?: number;
}

export interface SearchResult {
  memory: MemoryEntry;
  relevanceScore: number; // Simulated cosine similarity 0.0 to 1.0
}

export interface CognitiveMetrics {
  totalMemoriesCount: number;
  memoriesByCategory: Record<string, number>;
  totalGraphNodes: number;
  totalGraphEdges: number;
  cacheHitRatio: number;
  retrievalLatencyMs: number;
  contextAssemblyTimeMs: number;
}
