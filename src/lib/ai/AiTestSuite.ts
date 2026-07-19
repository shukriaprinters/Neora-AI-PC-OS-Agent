/**
 * NEORA AI DESIGNER OS - ENTERPRISE AI SUITE TEST RUNNER
 * Implements complete assertion sets covering routing rules, calligraphy stroke calculations,
 * and language typography pairing parameters.
 */

import { ProviderRegistry } from "./ProviderRegistry.ts";
import { ModelRouter } from "./ModelRouter.ts";
import { CreativeDirector } from "./CreativeDirector.ts";
import { ModelCategory } from "./types.ts";

export interface AiTestResult {
  id: string;
  name: string;
  category: string;
  status: "passed" | "failed";
  error?: string;
  latencyMs: number;
}

export class AiTestSuite {
  private registry: ProviderRegistry;
  private router: ModelRouter;
  private director: CreativeDirector;

  constructor() {
    this.registry = ProviderRegistry.getInstance();
    this.router = ModelRouter.getInstance();
    this.director = CreativeDirector.getInstance();
  }

  public async runAllTests(): Promise<AiTestResult[]> {
    const results: AiTestResult[] = [];

    // Test 1: Capability Registry Lookup
    results.push(await this.runTest("Registry Integrity Test", "core", async () => {
      const models = this.registry.listAllCapabilities();
      if (models.length < 5) {
        throw new Error(`Insufficient model definition coverage. Found only ${models.length} models.`);
      }
      const gemini = this.registry.getCapability("gemini-2.5-pro");
      if (!gemini || gemini.provider !== "gemini") {
        throw new Error("Critical model [gemini-2.5-pro] missing or corrupted.");
      }
    }));

    // Test 2: Routing Strategy - Lowest Cost
    results.push(await this.runTest("Router Lowest Cost Strategy Test", "routing", async () => {
      const selected = this.router.selectBestModel(ModelCategory.REASONING, "lowest_cost");
      if (selected.id !== "gemini-2.5-flash") {
        throw new Error(`Expected gemini-2.5-flash for lowest cost, but got [${selected.id}]`);
      }
    }));

    // Test 3: Routing Strategy - Highest Quality
    results.push(await this.runTest("Router Highest Quality Strategy Test", "routing", async () => {
      const selected = this.router.selectBestModel(ModelCategory.REASONING, "highest_quality");
      if (selected.id !== "claude-3-5-sonnet" && selected.id !== "gemini-2.5-pro") {
        throw new Error(`Expected Claude 3.5 or Gemini 2.5 Pro for supreme quality, but got [${selected.id}]`);
      }
    }));

    // Test 4: Router Cascading Fallback Recovery
    results.push(await this.runTest("Router Cascading Fallback Recovery Test", "routing", async () => {
      // Simulate prompt that causes simulation failure on primary models to trigger cascades
      const fallbackOutcome = await this.router.executeWithFallback<{ text: string }>(
        ModelCategory.REASONING,
        "lowest_cost",
        "simulate_critical_failure_for_test"
      );
      
      // Ollama mistral local model should recover the operation
      if (fallbackOutcome.routedModelId !== "ollama-mistral-offline") {
        throw new Error(`Fallback failed to cascade to Offline Local engine. Routed to [${fallbackOutcome.routedModelId}] instead.`);
      }
    }));

    // Test 5: Calligraphy SVG Flourish Math Assertions
    results.push(await this.runTest("Calligraphy Bezier Path Math Test", "calligraphy", async () => {
      const plan = await this.director.orchestrateDesignSession("Create beautiful Islamic calligraphy");
      if (!plan.calligraphy) {
        throw new Error("Calligraphy plan was not generated for Islamic campaign.");
      }
      if (plan.calligraphy.svgPaths.length === 0) {
        throw new Error("No Bezier SVG coordinates loaded in Islamic calligraphy.");
      }
      const firstPath = plan.calligraphy.svgPaths[0];
      if (!firstPath.svgPath.startsWith("M")) {
        throw new Error(`Malformed SVG path coordinates: [${firstPath.svgPath}]`);
      }
    }));

    // Test 6: Typography Language-Aware Pairing Rules
    results.push(await this.runTest("Multilingual Typography Font Pairing Test", "typography", async () => {
      const banglaPlan = await this.director.orchestrateDesignSession("Boishakh Bengali design with alpona artwork");
      if (banglaPlan.typography.headlineFont !== "Hind Siliguri") {
        throw new Error(`Expected Hind Siliguri for Bangla typography, but got [${banglaPlan.typography.headlineFont}]`);
      }
      if (banglaPlan.typography.direction !== "ltr") {
        throw new Error("Bangla writing direction should be LTR.");
      }

      const arabicPlan = await this.director.orchestrateDesignSession("Ramadan Kareem design");
      if (arabicPlan.typography.direction !== "rtl") {
        throw new Error("Arabic writing direction should be RTL.");
      }
    }));

    // Test 7: Security Guilloché Pattern Renderer Verification
    results.push(await this.runTest("Guilloche Anti-copy Mesh Rendering Test", "security_art", async () => {
      const plan = await this.director.orchestrateDesignSession("Print-safe luxury event ticket with secure layout");
      if (!plan.securityPattern) {
        throw new Error("Security pattern was not generated.");
      }
      if (plan.securityPattern.type !== "guilloche") {
        throw new Error(`Expected Guilloché pattern type, but got [${plan.securityPattern.type}]`);
      }
    }));

    return results;
  }

  private async runTest(name: string, category: string, assertion: () => Promise<void>): Promise<AiTestResult> {
    const start = Date.now();
    try {
      await assertion();
      return {
        id: `test_${category}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        category,
        status: "passed",
        latencyMs: Date.now() - start
      };
    } catch (err: any) {
      return {
        id: `test_${category}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        category,
        status: "failed",
        error: err.message || String(err),
        latencyMs: Date.now() - start
      };
    }
  }
}
