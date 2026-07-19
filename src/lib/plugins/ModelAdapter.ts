/**
 * NEORA AI DESIGNER OS - MODEL ADAPTER SYSTEM
 * Standardized AI provider abstraction layers ensuring decoupling and robust fallbacks.
 */

export interface ModelProviderConfig {
  id: string;
  name: string;
  type: "text" | "image" | "vision" | "workflow";
  baseUrl?: string;
  apiKey?: string;
  defaultModel: string;
  capabilities: string[];
}

export interface GenerationRequest {
  prompt: string;
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  width?: number; // for image models
  height?: number; // for image models
  aspectRatio?: string; // for image models
}

export interface VisionRequest extends GenerationRequest {
  imageUrl: string;
}

export interface ModelAdapter {
  providerId: string;
  generateText(request: GenerationRequest): Promise<string>;
  generateImage(request: GenerationRequest): Promise<string>;
  analyzeImage(request: VisionRequest): Promise<string>;
}

export class ModelAdapterRegistry {
  private static instance: ModelAdapterRegistry;
  private adapters: Map<string, ModelAdapter> = new Map();
  private configs: Map<string, ModelProviderConfig> = new Map();
  private activeProviders: Record<string, string> = {
    text: "gemini",
    image: "flux",
    vision: "gemini"
  };

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): ModelAdapterRegistry {
    if (!ModelAdapterRegistry.instance) {
      ModelAdapterRegistry.instance = new ModelAdapterRegistry();
    }
    return ModelAdapterRegistry.instance;
  }

  private registerDefaults() {
    // 1. Gemini Default Adapter
    this.registerProvider({
      id: "gemini",
      name: "Google Gemini",
      type: "text",
      defaultModel: "gemini-2.5-flash",
      capabilities: ["text", "vision", "chat", "structured_json"]
    }, new MockGeminiAdapter());

    // 2. Groq Default Adapter
    this.registerProvider({
      id: "groq",
      name: "Groq Cloud API",
      type: "text",
      defaultModel: "llama-3.3-70b-versatile",
      capabilities: ["text", "chat"]
    }, new MockGroqAdapter());

    // 3. Ollama Local Adapter
    this.registerProvider({
      id: "ollama",
      name: "Ollama Local Engine",
      type: "text",
      baseUrl: "http://localhost:11434",
      defaultModel: "mistral",
      capabilities: ["text", "chat", "offline"]
    }, new MockOllamaAdapter());

    // 4. Flux Image Adapter
    this.registerProvider({
      id: "flux",
      name: "Flux Dev AI",
      type: "image",
      defaultModel: "flux-schnell",
      capabilities: ["image", "high_fidelity"]
    }, new MockFluxAdapter());

    // 5. Stable Diffusion Adapter
    this.registerProvider({
      id: "stable_diffusion",
      name: "Stable Diffusion 3",
      type: "image",
      defaultModel: "sd3-medium",
      capabilities: ["image", "illustration"]
    }, new MockStableDiffusionAdapter());

    // 6. Ideogram Typography Adapter
    this.registerProvider({
      id: "ideogram",
      name: "Ideogram 2.0 Typography Specialist",
      type: "image",
      defaultModel: "ideogram-v2",
      capabilities: ["image", "typography", "bengali_rendering"]
    }, new MockIdeogramAdapter());
  }

  public registerProvider(config: ModelProviderConfig, adapter: ModelAdapter): void {
    this.configs.set(config.id, config);
    this.adapters.set(config.id, adapter);
    console.log(`[ModelAdapterRegistry] Registered provider: ${config.name} (${config.id})`);
  }

  public getAdapter(providerId: string): ModelAdapter | undefined {
    return this.adapters.get(providerId);
  }

  public getConfig(providerId: string): ModelProviderConfig | undefined {
    return this.configs.get(providerId);
  }

  public setActiveProvider(type: "text" | "image" | "vision", providerId: string): void {
    if (!this.adapters.has(providerId)) {
      throw new Error(`Cannot set active provider: ${providerId} is not registered.`);
    }
    this.activeProviders[type] = providerId;
    console.log(`[ModelAdapterRegistry] Set active provider for ${type}: ${providerId}`);
  }

  public getActiveProviderId(type: "text" | "image" | "vision"): string {
    return this.activeProviders[type];
  }

  public listProviders(): ModelProviderConfig[] {
    return Array.from(this.configs.values());
  }
}

// ----------------------------------------------------
// DEFAULT ABSTRACTED ADAPTERS (WITH SAFE INTEGRATION AND FALLBACKS)
// ----------------------------------------------------

class MockGeminiAdapter implements ModelAdapter {
  public providerId = "gemini";

  async generateText(request: GenerationRequest): Promise<string> {
    console.log(`[GeminiAdapter] Generating text for prompt: "${request.prompt}" using model: ${request.model || "gemini-2.5-flash"}`);
    // Real adapter will call the Gemini API. Returning intelligent mock blueprint to ensure seamless simulation:
    return JSON.stringify({
      status: "success",
      text: `Gemini generated output for: ${request.prompt}\nModel: ${request.model || "gemini-2.5-flash"}\nCharacteristics: Structured layout parameters optimized for Bengali/English canvas ratios.`,
      refinedPrompt: request.prompt,
      engine: "Google Gemini 2.5"
    });
  }

  async generateImage(request: GenerationRequest): Promise<string> {
    console.log(`[GeminiAdapter] Imagen generation requested (Fallbacks to default image service)`);
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800";
  }

  async analyzeImage(request: VisionRequest): Promise<string> {
    console.log(`[GeminiAdapter] Analyzing image at: ${request.imageUrl}`);
    return `Gemini Vision Analysis: The visual contains high-contrast color palettes with a main display title. Alignment metrics look safe and optimal for printing.`;
  }
}

class MockGroqAdapter implements ModelAdapter {
  public providerId = "groq";

  async generateText(request: GenerationRequest): Promise<string> {
    return `Groq cloud execution completed using llama-3.3-70b-versatile. Prompt: ${request.prompt}`;
  }

  async generateImage(request: GenerationRequest): Promise<string> {
    throw new Error("Groq does not support native image generation.");
  }

  async analyzeImage(request: VisionRequest): Promise<string> {
    return `Groq Llama-3.2-Vision analysis complete. Dynamic text elements read accurately.`;
  }
}

class MockOllamaAdapter implements ModelAdapter {
  public providerId = "ollama";

  async generateText(request: GenerationRequest): Promise<string> {
    return `Ollama local offline daemon completed task: ${request.prompt}. Running fully sandbox enclosed inside terminal container.`;
  }

  async generateImage(request: GenerationRequest): Promise<string> {
    throw new Error("Ollama standard text adapter does not support image generation natively.");
  }

  async analyzeImage(request: VisionRequest): Promise<string> {
    return `Ollama local llava model completed analysis offline.`;
  }
}

class MockFluxAdapter implements ModelAdapter {
  public providerId = "flux";

  async generateText(request: GenerationRequest): Promise<string> {
    return `Flux Image generation prompt generated: ${request.prompt}`;
  }

  async generateImage(request: GenerationRequest): Promise<string> {
    console.log(`[FluxAdapter] Generating hyper-detailed canvas asset for: "${request.prompt}"`);
    // Return stunning generated design templates
    return "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1080";
  }

  async analyzeImage(request: VisionRequest): Promise<string> {
    throw new Error("Flux is a text-to-image generator and does not support vision analyze methods.");
  }
}

class MockStableDiffusionAdapter implements ModelAdapter {
  public providerId = "stable_diffusion";

  async generateText(request: GenerationRequest): Promise<string> {
    return `Stable Diffusion layout configuration payload.`;
  }

  async generateImage(request: GenerationRequest): Promise<string> {
    return "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080";
  }

  async analyzeImage(request: VisionRequest): Promise<string> {
    throw new Error("Stable Diffusion is specialized for image generation only.");
  }
}

class MockIdeogramAdapter implements ModelAdapter {
  public providerId = "ideogram";

  async generateText(request: GenerationRequest): Promise<string> {
    return `Ideogram typography rendering engine parameters.`;
  }

  async generateImage(request: GenerationRequest): Promise<string> {
    console.log(`[IdeogramAdapter] Rendering custom typographical canvas banner for: "${request.prompt}"`);
    return "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1080";
  }

  async analyzeImage(request: VisionRequest): Promise<string> {
    throw new Error("Ideogram is a specialized typographic generator.");
  }
}
