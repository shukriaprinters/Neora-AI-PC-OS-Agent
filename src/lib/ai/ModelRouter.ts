/**
 * NEORA AI DESIGNER OS - INTELLIGENT ROUTER & FALLBACK ENGINE (PHASE 1.5)
 * Dynamically ranks and routes requests to optimal models based on cost, latency, language preference,
 * and handles resilient cascading fallbacks to ensure zero-downtime operation.
 */

import { ProviderRegistry } from "./ProviderRegistry.ts";
import { ModelCapability, ModelCategory, RoutingStrategy } from "./types.ts";

export class ModelRouter {
  private static instance: ModelRouter | null = null;
  private registry: ProviderRegistry;

  private constructor() {
    this.registry = ProviderRegistry.getInstance();
  }

  public static getInstance(): ModelRouter {
    if (!ModelRouter.instance) {
      ModelRouter.instance = new ModelRouter();
    }
    return ModelRouter.instance;
  }

  /**
   * Automatically select the absolute best model based on Category, Strategy, and language requirements.
   */
  public selectBestModel(
    category: ModelCategory,
    strategy: RoutingStrategy,
    preferredLanguage?: string
  ): ModelCapability {
    const candidates = this.registry.queryModels({ category, language: preferredLanguage });

    if (candidates.length === 0) {
      // Fallback to searching without language preference if none exists
      const generalCandidates = this.registry.queryModels({ category });
      if (generalCandidates.length === 0) {
        throw new Error(`Ecosystem routing failure: No registered models support category [${category}].`);
      }
      return this.rankModels(generalCandidates, strategy)[0];
    }

    return this.rankModels(candidates, strategy)[0];
  }

  /**
   * Implementation of the smart ranking algorithms for the chosen routing strategy
   */
  private rankModels(candidates: ModelCapability[], strategy: RoutingStrategy): ModelCapability[] {
    const sorted = [...candidates];

    switch (strategy) {
      case "fastest":
        return sorted.sort((a, b) => a.latencyMs - b.latencyMs);

      case "lowest_cost":
        return sorted.sort((a, b) => {
          const costA = a.costPer1kTokensInput + a.costPer1kTokensOutput;
          const costB = b.costPer1kTokensInput + b.costPer1kTokensOutput;
          return costA - costB;
        });

      case "highest_quality":
        return sorted.sort((a, b) => b.qualityScore - a.qualityScore);

      case "balanced":
        return sorted.sort((a, b) => {
          // Combined fitness function: higher score is better
          // Score = QualityScore * 10 - (Cost * 500) - (LatencyMs * 0.01)
          const fitness = (m: ModelCapability) => {
            const cost = m.costPer1kTokensInput + m.costPer1kTokensOutput;
            return m.qualityScore * 10 - cost * 500 - m.latencyMs * 0.01;
          };
          return fitness(b) - fitness(a);
        });

      case "offline_preferred":
        return sorted.sort((a, b) => {
          if (a.provider === "ollama" && b.provider !== "ollama") return -1;
          if (b.provider === "ollama" && a.provider !== "ollama") return 1;
          return b.qualityScore - a.qualityScore;
        });

      case "cloud_preferred":
        return sorted.sort((a, b) => {
          if (a.provider === "ollama" && b.provider !== "ollama") return 1;
          if (b.provider === "ollama" && a.provider !== "ollama") return -1;
          return b.qualityScore - a.qualityScore;
        });

      default:
        return sorted;
    }
  }

  /**
   * Execute router query with fallback capability.
   * If the chosen primary model crashes, it cascades down the ranks to secondary and local options.
   */
  public async executeWithFallback<T>(
    category: ModelCategory,
    strategy: RoutingStrategy,
    payload: any,
    preferredLanguage?: string,
    onLog?: (msg: string) => void
  ): Promise<{ result: T; routedModelId: string }> {
    const log = (msg: string) => {
      if (onLog) onLog(msg);
      console.log(`[ModelRouter] ${msg}`);
    };

    const candidates = this.rankModels(
      this.registry.queryModels({ category, language: preferredLanguage }),
      strategy
    );

    if (candidates.length === 0) {
      // Fallback: search without language constraints
      const broad = this.rankModels(this.registry.queryModels({ category }), strategy);
      if (broad.length > 0) {
        candidates.push(...broad);
      }
    }

    if (candidates.length === 0) {
      throw new Error(`Fallback failure: No available candidate models found for category ${category}.`);
    }

    let errorAccumulator: string[] = [];

    for (let i = 0; i < candidates.length; i++) {
      const model = candidates[i];
      log(`Attempting routing task with model [${model.id}] via [${model.provider}] adapter...`);

      try {
        // Mock a successful simulation of various models.
        // We will make real processing or smart simulations based on prompt parameters.
        const result = await this.simulateModelInvocation<T>(model, payload);
        log(`✓ Model [${model.id}] completed successfully. Latency: ${model.latencyMs}ms.`);
        return { result, routedModelId: model.id };
      } catch (err: any) {
        log(`✗ Model [${model.id}] failed. Error: ${err.message || err}`);
        errorAccumulator.push(`${model.id}: ${err.message || err}`);
        
        // Let's retry or proceed to the next rated candidate model
        if (i < candidates.length - 1) {
          log(`Cascading fallback to secondary model [${candidates[i + 1].id}]...`);
        }
      }
    }

    // Try a final guaranteed offline model fallback if possible
    try {
      log("All cloud adapters exhausted. Attempting default Offline Local Model router bypass...");
      const localModel = this.registry.getCapability("ollama-mistral-offline");
      if (localModel && category === ModelCategory.REASONING) {
        const result = await this.simulateModelInvocation<T>(localModel, payload);
        log("✓ Local Offline Engine restored operations. Primary systems stabilized.");
        return { result, routedModelId: localModel.id };
      }
    } catch (localErr: any) {
      errorAccumulator.push(`local-mistral: ${localErr.message}`);
    }

    throw new Error(
      `Enterprise AI Layer Critical Failure: All provider fallbacks exhausted.\nLogs:\n${errorAccumulator.join(
        "\n"
      )}`
    );
  }

  /**
   * Helper simulator that formats actual expected output mock structures for UI/SDK calls
   */
  private async simulateModelInvocation<T>(model: ModelCapability, payload: any): Promise<T> {
    // Inject a little delay representing latency
    await new Promise((resolve) => setTimeout(resolve, Math.min(model.latencyMs / 4, 300)));

    const promptStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    const lowercasePrompt = promptStr.toLowerCase();

    // Trigger synthetic failures if requested specifically for test suite coverage
    if (lowercasePrompt.includes("simulate_critical_failure_for_test")) {
      throw new Error(`SimulationError: Provider [${model.provider}] timed out or returned HTTP 503 Service Unavailable.`);
    }

    if (model.category === ModelCategory.IMAGE_GENERATION) {
      // Simulate generated poster or banner artwork SVG base64 or URL
      return {
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
        format: "png",
        dimensions: "1024x1024",
        styleApplied: lowercasePrompt.includes("watercolor") ? "watercolor" : "neo-luxurious-geometric",
        inspiration: "Original blend from reference structural balance criteria."
      } as unknown as T;
    }

    // Default to mock reasoning text or json response
    return {
      text: `[Routed through ${model.id}] Completed design task successfully.`,
      confidence: 0.98,
      tokensUsed: 412,
      analysis: {
        readabilityScore: 92,
        alignmentBalanced: true,
        pairedFontRationale: "Inter display matched with elegant micro spacing criteria."
      }
    } as unknown as T;
  }
}
