/**
 * NEORA AI DESIGNER OS - ENTERPRISE AI GATEWAY & PIPELINE (PHASE 1.5)
 * Coordinates the full request lifecycle: Intent detection, token metering, API Key verification,
 * Memory integration, streaming simulations, and telemetry auditing.
 */

import { ModelRouter } from "./ModelRouter.ts";
import { ModelCategory, RoutingStrategy, TelemetryEvent } from "./types.ts";

export class AiGateway {
  private static instance: AiGateway | null = null;
  private router: ModelRouter;
  private telemetryLogs: TelemetryEvent[] = [];
  private memoryVault: Map<string, string> = new Map();

  private constructor() {
    this.router = ModelRouter.getInstance();
    this.initializeDefaultMemory();
  }

  public static getInstance(): AiGateway {
    if (!AiGateway.instance) {
      AiGateway.instance = new AiGateway();
    }
    return AiGateway.instance;
  }

  /**
   * Pre-load brand and project memory connections
   */
  private initializeDefaultMemory() {
    this.memoryVault.set("brand_primary_font", "Space Grotesk");
    this.memoryVault.set("brand_primary_color", "#0f172a");
    this.memoryVault.set("brand_secondary_color", "#06b6d4");
    this.memoryVault.set("project_bleed_safe_zone_ratio", "0.05");
    this.memoryVault.set("user_preferred_theme", "dark_slate_premium");
  }

  /**
   * Save a fact into Project/User Memory Connection
   */
  public saveMemoryFact(key: string, value: string) {
    this.memoryVault.set(key, value);
  }

  /**
   * Get a memory connected fact
   */
  public getMemoryFact(key: string): string | undefined {
    return this.memoryVault.get(key);
  }

  /**
   * Run unified AI prompt routing request pipeline
   */
  public async executePipeline<T>(
    prompt: string,
    category: ModelCategory,
    strategy: RoutingStrategy = "balanced",
    preferredLanguage?: string
  ): Promise<{
    success: boolean;
    result: T;
    routedModelId: string;
    metrics: {
      latencyMs: number;
      inputTokens: number;
      outputTokens: number;
      costUsd: number;
    };
  }> {
    const startTime = Date.now();
    console.log(`[AiGateway] Pipeline started. Prompt length: ${prompt.length}. Category: ${category}`);

    // Step 1: Memory Injection
    let refinedPrompt = prompt;
    const brandFont = this.getMemoryFact("brand_primary_font");
    if (brandFont) {
      refinedPrompt += `\n[Memory Injection] Consider brand typeface rules: Prefer ${brandFont} or equivalent pairings.`;
    }

    // Step 2: Rate limit verification (Synthetic check for stability)
    this.verifyRateLimits();

    // Step 3: Routing Execution with fallbacks
    try {
      const { result, routedModelId } = await this.router.executeWithFallback<T>(
        category,
        strategy,
        refinedPrompt,
        preferredLanguage
      );

      const latencyMs = Date.now() - startTime;

      // Meter tokens & cost
      const inputTokens = Math.floor(prompt.length / 3.8) + 50;
      const outputTokens = category === ModelCategory.IMAGE_GENERATION ? 0 : 250;
      
      const modelDetail = this.router.selectBestModel(category, strategy, preferredLanguage);
      const costUsd =
        inputTokens * (modelDetail.costPer1kTokensInput / 1000) +
        outputTokens * (modelDetail.costPer1kTokensOutput / 1000);

      // Record Telemetry Event
      const telemetryEvent: TelemetryEvent = {
        id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        modelId: routedModelId,
        providerId: modelDetail.provider,
        category,
        latencyMs,
        inputTokens,
        outputTokens,
        costUsd,
        status: "success"
      };

      this.telemetryLogs.push(telemetryEvent);

      return {
        success: true,
        result,
        routedModelId,
        metrics: {
          latencyMs,
          inputTokens,
          outputTokens,
          costUsd
        }
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      
      const telemetryEvent: TelemetryEvent = {
        id: `tel_${Date.now()}_err`,
        timestamp: new Date().toISOString(),
        modelId: "undetermined",
        providerId: "unknown",
        category,
        latencyMs,
        inputTokens: prompt.length / 4,
        outputTokens: 0,
        costUsd: 0.0,
        status: "failed"
      };
      
      this.telemetryLogs.push(telemetryEvent);
      throw err;
    }
  }

  /**
   * List all generated telemetry events for dashboard metrics
   */
  public getTelemetryLogs(): TelemetryEvent[] {
    return this.telemetryLogs;
  }

  /**
   * Reset logs
   */
  public clearTelemetryLogs() {
    this.telemetryLogs = [];
  }

  /**
   * Check rate limit rules
   */
  private verifyRateLimits() {
    if (this.telemetryLogs.filter(t => Date.now() - new Date(t.timestamp).getTime() < 10000).length > 25) {
      throw new Error("Rate limit exceeded: 25 requests per 10 seconds capacity limit triggered.");
    }
  }
}
