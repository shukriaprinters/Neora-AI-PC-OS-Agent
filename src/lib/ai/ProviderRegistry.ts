/**
 * NEORA AI DESIGNER OS - MODEL CAPABILITY REGISTRY (PHASE 1.5)
 * Comprehensive, production-grade central registry declaring model capabilities,
 * latency profiles, costs, language strengths, and operational limits.
 */

import { ModelCapability, ModelCategory } from "./types.ts";

export class ProviderRegistry {
  private static instance: ProviderRegistry | null = null;
  private capabilities: Map<string, ModelCapability> = new Map();

  private constructor() {
    this.initializeDefaultRegistry();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Register a new custom model capability dynamically
   */
  public registerCapability(capability: ModelCapability): void {
    this.capabilities.set(capability.id, capability);
  }

  /**
   * Retrieve specific capability by Model ID
   */
  public getCapability(id: string): ModelCapability | null {
    return this.capabilities.get(id) || null;
  }

  /**
   * List all registered models in the ecosystem
   */
  public listAllCapabilities(): ModelCapability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Filter model list based on category and optional traits
   */
  public queryModels(filter: {
    category?: ModelCategory;
    supportsVision?: boolean;
    supportsToolCalling?: boolean;
    supportsStreaming?: boolean;
    language?: string;
  }): ModelCapability[] {
    let result = this.listAllCapabilities();

    if (filter.category) {
      result = result.filter(m => m.category === filter.category);
    }
    if (filter.supportsVision !== undefined) {
      result = result.filter(m => m.vision === filter.supportsVision);
    }
    if (filter.supportsToolCalling !== undefined) {
      result = result.filter(m => m.toolCalling === filter.supportsToolCalling);
    }
    if (filter.supportsStreaming !== undefined) {
      result = result.filter(m => m.streaming === filter.supportsStreaming);
    }
    if (filter.language) {
      const langLower = filter.language.toLowerCase();
      result = result.filter(m =>
        m.supportedLanguages.some(l => l.toLowerCase() === langLower)
      );
    }

    return result;
  }

  /**
   * Bootstrap default model definitions with precise parameters
   */
  private initializeDefaultRegistry(): void {
    const defaultModels: ModelCapability[] = [
      // Reasoning Models
      {
        id: "gemini-2.5-pro",
        provider: "gemini",
        category: ModelCategory.REASONING,
        name: "Google Gemini 2.5 Pro (Workspace Master)",
        strengths: ["complex logic", "multilingual layouts", "deep reference analysis", "SVG structure coding"],
        weaknesses: ["latency on simple tasks"],
        inputTypes: ["text", "image"],
        outputTypes: ["text", "json"],
        contextWindow: 1048576,
        streaming: true,
        toolCalling: true,
        vision: true,
        jsonMode: true,
        latencyMs: 1200,
        costPer1kTokensInput: 0.00125,
        costPer1kTokensOutput: 0.00375,
        qualityScore: 9.8,
        reliability: 0.999,
        supportedLanguages: ["Bangla", "English", "Arabic", "Urdu", "Hindi", "Persian", "Turkish", "French", "Spanish"]
      },
      {
        id: "gemini-2.5-flash",
        provider: "gemini",
        category: ModelCategory.REASONING,
        name: "Google Gemini 2.5 Flash",
        strengths: ["extremely fast", "economical", "flexible layout structuring", "multilingual parsing"],
        weaknesses: ["extremely deep multi-step deduction"],
        inputTypes: ["text", "image"],
        outputTypes: ["text", "json"],
        contextWindow: 524288,
        streaming: true,
        toolCalling: true,
        vision: true,
        jsonMode: true,
        latencyMs: 350,
        costPer1kTokensInput: 0.000075,
        costPer1kTokensOutput: 0.0003,
        qualityScore: 8.5,
        reliability: 0.9995,
        supportedLanguages: ["Bangla", "English", "Arabic", "Urdu", "Hindi", "French", "Spanish", "German", "Japanese"]
      },
      {
        id: "claude-3-5-sonnet",
        provider: "claude",
        category: ModelCategory.REASONING,
        name: "Anthropic Claude 3.5 Sonnet",
        strengths: ["pristine vector styling", "creative typography rules", "exquisite CSS reasoning"],
        weaknesses: ["slightly high cost", "restricted rate limit limits"],
        inputTypes: ["text", "image"],
        outputTypes: ["text", "json"],
        contextWindow: 200000,
        streaming: true,
        toolCalling: true,
        vision: true,
        jsonMode: true,
        latencyMs: 850,
        costPer1kTokensInput: 0.003,
        costPer1kTokensOutput: 0.015,
        qualityScore: 9.9,
        reliability: 0.995,
        supportedLanguages: ["English", "French", "Spanish", "German", "Japanese", "Chinese"]
      },
      {
        id: "deepseek-v3",
        provider: "deepseek",
        category: ModelCategory.PLANNING,
        name: "DeepSeek V3 (Reasoning Planner)",
        strengths: ["cost-efficient coding", "algorithmic design rules", "micro-position scaling"],
        weaknesses: ["unstable queue times"],
        inputTypes: ["text"],
        outputTypes: ["text", "json"],
        contextWindow: 64000,
        streaming: true,
        toolCalling: true,
        vision: false,
        jsonMode: true,
        latencyMs: 950,
        costPer1kTokensInput: 0.00014,
        costPer1kTokensOutput: 0.00028,
        qualityScore: 9.3,
        reliability: 0.965,
        supportedLanguages: ["Chinese", "English", "Korean", "Japanese", "French", "German"]
      },

      // Vision Models
      {
        id: "gpt-4o-vision",
        provider: "openai",
        category: ModelCategory.VISION,
        name: "OpenAI GPT-4o Vision Engine",
        strengths: ["perfect OCR detection", "contrast validation", "layer bounds scanning"],
        weaknesses: ["costly per image analysis"],
        inputTypes: ["text", "image"],
        outputTypes: ["text", "json"],
        contextWindow: 128000,
        streaming: true,
        toolCalling: true,
        vision: true,
        jsonMode: true,
        latencyMs: 900,
        costPer1kTokensInput: 0.005,
        costPer1kTokensOutput: 0.015,
        qualityScore: 9.7,
        reliability: 0.998,
        supportedLanguages: ["English", "Bangla", "Arabic", "Hindi", "Urdu", "Turkish", "French", "Spanish"]
      },

      // Image & Vector Generation Models
      {
        id: "flux-schnell",
        provider: "flux",
        category: ModelCategory.IMAGE_GENERATION,
        name: "Flux Dev Schnell (Hyper Realist)",
        strengths: ["text-rendering", "luxurious design styling", "highly precise background blends"],
        weaknesses: ["not fully editable SVG vector paths natively"],
        inputTypes: ["text"],
        outputTypes: ["image"],
        contextWindow: 4096,
        streaming: false,
        toolCalling: false,
        vision: false,
        jsonMode: false,
        latencyMs: 1500,
        costPer1kTokensInput: 0.001,
        costPer1kTokensOutput: 0.0,
        qualityScore: 9.5,
        reliability: 0.99,
        supportedLanguages: ["English", "French", "Spanish"]
      },
      {
        id: "ideogram-2",
        provider: "ideogram",
        category: ModelCategory.IMAGE_GENERATION,
        name: "Ideogram 2.0 (Expert Typography & Logo Render)",
        strengths: ["flawless typographical spelling", "gorgeous logo layout", "poster vector blend"],
        weaknesses: ["limited style flexibility on abstract watercolor"],
        inputTypes: ["text"],
        outputTypes: ["image"],
        contextWindow: 2048,
        streaming: false,
        toolCalling: false,
        vision: false,
        jsonMode: false,
        latencyMs: 2500,
        costPer1kTokensInput: 0.005,
        costPer1kTokensOutput: 0.0,
        qualityScore: 9.7,
        reliability: 0.985,
        supportedLanguages: ["English", "French", "Spanish", "German"]
      },

      // Local / Offline Preferred Models
      {
        id: "ollama-mistral-offline",
        provider: "ollama",
        category: ModelCategory.REASONING,
        name: "Local Mistral (Ollama SDK)",
        strengths: ["fully offline", "zero cost", "unrestricted local access", "extremely low latency"],
        weaknesses: ["lower reasoning limits for massive documents"],
        inputTypes: ["text"],
        outputTypes: ["text"],
        contextWindow: 16384,
        streaming: true,
        toolCalling: false,
        vision: false,
        jsonMode: false,
        latencyMs: 120,
        costPer1kTokensInput: 0.0,
        costPer1kTokensOutput: 0.0,
        qualityScore: 7.2,
        reliability: 1.0, // Locally active
        supportedLanguages: ["English", "French", "Spanish", "German"]
      }
    ];

    defaultModels.forEach(m => this.registerCapability(m));
  }
}
