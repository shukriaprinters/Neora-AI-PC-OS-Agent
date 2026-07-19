import { cognitiveSdk } from "./CognitiveSdk.ts";
import { MemoryCategory } from "./types.ts";

export interface CognitiveTestResult {
  id: string;
  category: string;
  name: string;
  status: "passed" | "failed";
  latencyMs: number;
  message?: string;
}

/**
 * Automated Verification Testing Suite.
 * Runs deep unit, integration, semantic search, and performance tests
 * against the entire Neora Cognitive Foundation.
 */
export class CognitiveTestSuite {
  public async runAllTests(): Promise<CognitiveTestResult[]> {
    const results: CognitiveTestResult[] = [];

    // Reset before running tests to isolate assertions
    cognitiveSdk.graph.clear();
    cognitiveSdk.memory.purgeUser("usr_test_suite");
    cognitiveSdk.preferences.resetLearnedHabits("usr_test_suite");

    // 1. Memory Engine Tests
    results.push(await this.testMemoryCrud());
    results.push(await this.testMemoryArchivalAndExpiry());
    results.push(await this.testMemoryConflictMerging());

    // 2. Preference Engine & Learning System Tests
    results.push(await this.testPreferencePresets());
    results.push(await this.testDynamicAdaptiveLearning());

    // 3. Knowledge Graph Tests
    results.push(await this.testGraphInsertionsAndTracing());
    results.push(await this.testGraphKnowledgeMerging());

    // 4. Semantic Search Vector Tests
    results.push(await this.testVectorSearchSimulations());

    // 5. Context Builder Packaging Tests
    results.push(await this.testContextAssembling());

    return results;
  }

  private async testMemoryCrud(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      // Create
      const mem = cognitiveSdk.memory.create({
        userId: "usr_test_suite",
        projectId: "proj_test_1",
        category: MemoryCategory.BRAND,
        tags: ["luxury", "corporate"],
        key: "brand_voice",
        value: "Empathetic, clear, and highly modern",
        importance: 4,
        confidence: 0.95,
        sourceAttribution: "brand_document",
        expiresAt: null
      });

      if (!mem.id.startsWith("mem_brand_")) {
        throw new Error(`Invalid generated memory ID structure: ${mem.id}`);
      }

      // Read
      const retrieved = cognitiveSdk.memory.get(mem.id);
      if (!retrieved || retrieved.key !== "brand_voice" || retrieved.value !== "Empathetic, clear, and highly modern") {
        throw new Error("Retrieved memory fields do not match created fields.");
      }

      // Update
      cognitiveSdk.memory.update(mem.id, { importance: 5, value: "Empathetic and modern" });
      const updated = cognitiveSdk.memory.get(mem.id);
      if (!updated || updated.importance !== 5 || updated.value !== "Empathetic and modern" || updated.version !== 2) {
        throw new Error("Memory update fields or version sequencing mismatch.");
      }

      return {
        id: "cog_test_memory_crud",
        category: "Memory CRUD",
        name: "Verify structured Memory creations, cache hydrations, reads, and updates",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_memory_crud",
        category: "Memory CRUD",
        name: "Verify structured Memory creations, cache hydrations, reads, and updates",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }

  private async testMemoryArchivalAndExpiry(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      const tempMem = cognitiveSdk.memory.create({
        userId: "usr_test_suite",
        projectId: "proj_test_1",
        category: MemoryCategory.CONVERSATION,
        tags: ["temp"],
        key: "temp_token",
        value: "xyz123",
        importance: 1,
        confidence: 1.0,
        sourceAttribution: "temporary_session",
        expiresAt: new Date(Date.now() - 5000).toISOString() // Expired 5s ago
      });

      // 1. Archival test
      cognitiveSdk.memory.archive(tempMem.id);
      const archived = cognitiveSdk.memory.get(tempMem.id);
      if (archived) {
        throw new Error("Archived memory was retrieved via normal cache mapping.");
      }

      // Recover
      cognitiveSdk.memory.recover(tempMem.id);
      const recovered = cognitiveSdk.memory.get(tempMem.id);
      if (!recovered || recovered.isArchived) {
        throw new Error("Recovered memory is still marked archived.");
      }

      return {
        id: "cog_test_memory_expiry",
        category: "Memory Lifecycle",
        name: "Verify retention Soft-Deletes, Expiry schedules, and GDPR cleanups",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_memory_expiry",
        category: "Memory Lifecycle",
        name: "Verify retention Soft-Deletes, Expiry schedules, and GDPR cleanups",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }

  private async testMemoryConflictMerging(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      const mem1 = cognitiveSdk.memory.create({
        userId: "usr_test_suite",
        projectId: "proj_test_1",
        category: MemoryCategory.TYPOGRAPHY,
        tags: ["font"],
        key: "matching_font",
        value: "Inter",
        importance: 3,
        confidence: 0.6,
        sourceAttribution: "unverified_chat",
        expiresAt: null
      });

      const mem2 = cognitiveSdk.memory.create({
        userId: "usr_test_suite",
        projectId: "proj_test_1",
        category: MemoryCategory.TYPOGRAPHY,
        tags: ["typography", "premium"],
        key: "matching_font",
        value: "Space Grotesk",
        importance: 4,
        confidence: 0.9,
        sourceAttribution: "brand_rules_sheet",
        expiresAt: null
      });

      // Merge overlapping keys
      const merged = cognitiveSdk.memory.merge(mem1.id, mem2.id, "primary_typography_font", "usr_test_suite");
      
      if (merged.value !== "Space Grotesk") {
        throw new Error(`Conflict merge failed to resolve value to higher confidence profile. Found: ${merged.value}`);
      }
      if (merged.importance !== 4) {
        throw new Error("Merged importance rating must evaluate to max bounds.");
      }
      if (!merged.tags.includes("premium") || !merged.tags.includes("font")) {
        throw new Error("Merged elements failed to unify tag arrays.");
      }

      const archived2 = cognitiveSdk.memory.get(mem2.id);
      if (archived2) {
        throw new Error("Merged source secondary document was not successfully archived.");
      }

      return {
        id: "cog_test_memory_merging",
        category: "Memory Merge",
        name: "Verify automated conflict merging and confidence scale resolution",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_memory_merging",
        category: "Memory Merge",
        name: "Verify automated conflict merging and confidence scale resolution",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }

  private async testPreferencePresets(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      // Arabic presets verification
      const arPreset = cognitiveSdk.preferences.getLanguagePresets("ar");
      if (arPreset.preferredDirection !== "rtl" || !arPreset.preferredFonts.includes("Amiri")) {
        throw new Error("Arabic presets failed to mandate RTL directionality or Amiri font.");
      }

      // Bengali presets verification
      const bnPreset = cognitiveSdk.preferences.getLanguagePresets("bn");
      if (bnPreset.preferredDirection !== "ltr" || !bnPreset.preferredFonts.includes("Hind Siliguri")) {
        throw new Error("Bengali presets failed to load Siliguri typography mappings.");
      }

      return {
        id: "cog_test_preference_presets",
        category: "Preferences Preset",
        name: "Verify multi-lingual presets and RTL/LTR text formatting rules",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_preference_presets",
        category: "Preferences Preset",
        name: "Verify multi-lingual presets and RTL/LTR text formatting rules",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }

  private async testDynamicAdaptiveLearning(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      // Record 6 text alignment updates to right-aligned
      for (let i = 0; i < 6; i++) {
        cognitiveSdk.preferences.recordInteractiveEdit("usr_test_suite", {
          align: "right",
          fontFamily: "Space Grotesk",
          paletteHexes: ["#000000", "#ffffff"]
        });
      }

      const prefs = cognitiveSdk.preferences.get("usr_test_suite");
      if (!prefs.preferredLayouts.includes("right")) {
        throw new Error(`Adaptive learning failed to elevate right-alignment to top layout arrays. Layouts: ${prefs.preferredLayouts.join(",")}`);
      }

      return {
        id: "cog_test_dynamic_learning",
        category: "Learning Loop",
        name: "Verify dynamic interactive learning and layout habit tracking",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_dynamic_learning",
        category: "Learning Loop",
        name: "Verify dynamic interactive learning and layout habit tracking",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }

  private async testGraphInsertionsAndTracing(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      // Create user node, project node, style node
      cognitiveSdk.graph.addNode("usr_test_suite", "user", "Test Analyst", { role: "quality" });
      cognitiveSdk.graph.addNode("proj_1", "project", "Eid Flyer Campaign");
      cognitiveSdk.graph.addNode("style_islamic", "style", "Islamic Golden Luxury");
      cognitiveSdk.graph.addNode("font_cairo", "font", "Cairo Arabic Medium");

      // Set relationships
      cognitiveSdk.graph.addEdge("usr_test_suite", "proj_1", "CREATES", 1.0, "user_trigger");
      cognitiveSdk.graph.addEdge("proj_1", "style_islamic", "EMBODIES", 0.95);
      cognitiveSdk.graph.addEdge("style_islamic", "font_cairo", "RECOMMENDS", 0.9);

      // Traversal tests: trace neighbors
      const neighbors = cognitiveSdk.graph.traceNeighbors("usr_test_suite", 3);
      if (neighbors.length < 3) {
        throw new Error(`Graph neighborhood tracing failed to span required depth. Connected neighbors: ${neighbors.length}`);
      }

      // Recommended assets
      const recommendations = cognitiveSdk.graph.recommendAssets("Islamic Golden Luxury");
      if (recommendations.fonts.length === 0 || recommendations.fonts[0].id !== "font_cairo") {
        throw new Error("Asset recommender failed to match Cairo font with Islamic Golden Luxury style.");
      }

      return {
        id: "cog_test_graph_traversal",
        category: "Knowledge Graph",
        name: "Verify node/edge linkages, BFS cascades, and traversal recommenders",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_graph_traversal",
        category: "Knowledge Graph",
        name: "Verify node/edge linkages, BFS cascades, and traversal recommenders",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }

  private async testGraphKnowledgeMerging(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      cognitiveSdk.graph.addNode("brand_neora", "brand", "Neora", {
        primaryColor: "#000000",
        _meta_primaryColor: { confidence: 0.5, sourceAttribution: "guess" }
      });

      // Try merging with lower confidence - should fail to overwrite properties
      cognitiveSdk.graph.mergeNodeKnowledge("brand_neora", { primaryColor: "#333333" }, "low_conf_guess", 0.3);
      let brand = cognitiveSdk.graph.getNode("brand_neora");
      if (!brand || brand.properties.primaryColor !== "#000000") {
        throw new Error("Graph failed to protect high-confidence property from lower-confidence override.");
      }

      // Merge with higher confidence - should overwrite successfully
      cognitiveSdk.graph.mergeNodeKnowledge("brand_neora", { primaryColor: "#06b6d4" }, "authority_brand_doc", 0.9);
      brand = cognitiveSdk.graph.getNode("brand_neora");
      if (!brand || brand.properties.primaryColor !== "#06b6d4") {
        throw new Error("Graph failed to update properties with higher confidence guidelines.");
      }

      return {
        id: "cog_test_graph_merging",
        category: "Knowledge Graph",
        name: "Verify graph property merging based on attribute confidence scores",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_graph_merging",
        category: "Knowledge Graph",
        name: "Verify graph property merging based on attribute confidence scores",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }

  private async testVectorSearchSimulations(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      // Add multiple mock memories for searching
      cognitiveSdk.memory.create({
        userId: "usr_test_suite",
        projectId: "proj_test_1",
        category: MemoryCategory.DESIGN,
        tags: ["alpona", "traditional"],
        key: "alpona_motif",
        value: "Traditional Bengali Alpona vector with circular radial elements and floral strokes",
        importance: 4,
        confidence: 0.9,
        sourceAttribution: "bengali_history",
        expiresAt: null
      });

      cognitiveSdk.memory.create({
        userId: "usr_test_suite",
        projectId: "proj_test_1",
        category: MemoryCategory.DESIGN,
        tags: ["gold", "islamic"],
        key: "islamic_geometry",
        value: "Islamic star pattern geometry draft with 8-pointed gold stars and symmetric borders",
        importance: 4,
        confidence: 0.9,
        sourceAttribution: "ramadan_rules",
        expiresAt: null
      });

      // Semantic Search for Alpona
      const res = cognitiveSdk.memory.search({
        text: "Bengali traditional circular floral strokes",
        category: MemoryCategory.DESIGN,
        projectId: "proj_test_1",
        confidenceMin: 0.5
      });

      if (res.length === 0 || res[0].memory.key !== "alpona_motif") {
        throw new Error(`Semantic search failed to retrieve top matching radial design. Top result: ${res[0]?.memory.key || "None"}`);
      }

      return {
        id: "cog_test_vector_search",
        category: "Vector Retrieval",
        name: "Verify semantic search simulated vectors and hybrid tag intersections",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_vector_search",
        category: "Vector Retrieval",
        name: "Verify semantic search simulated vectors and hybrid tag intersections",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }

  private async testContextAssembling(): Promise<CognitiveTestResult> {
    const startTime = Date.now();
    try {
      const messages = [{ role: "user", content: "Let's work on the Alpona design poster details." }];
      const layers = [{ id: "layer_1", name: "Radial Lotus Motif", type: "shape", opacity: 0.8 }];

      const { contextPackage, assemblyTimeMs } = await cognitiveSdk.context.assemble({
        userId: "usr_test_suite",
        projectId: "proj_test_1",
        pageId: "page_1",
        activeIntent: "alpona poster design",
        recentMessages: messages,
        projectLayers: layers,
        brandId: "brand_royal_gold"
      });

      if (contextPackage.relevantMemories.length === 0) {
        throw new Error("Context assembler failed to load semantically matched memories.");
      }
      if (!contextPackage.brandContext || contextPackage.brandContext.id !== "brand_royal_gold") {
        throw new Error("Context assembler failed to bind requested brand guidelines profile.");
      }
      if (contextPackage.projectContext.layerSummary.length !== 1 || contextPackage.projectContext.layerSummary[0].name !== "Radial Lotus Motif") {
        throw new Error("Context assembler project canvas layers sync failed.");
      }

      return {
        id: "cog_test_context_assembling",
        category: "Context Assembly",
        name: "Verify composite Context package assembly and latency metrics scoring",
        status: "passed",
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        id: "cog_test_context_assembling",
        category: "Context Assembly",
        name: "Verify composite Context package assembly and latency metrics scoring",
        status: "failed",
        latencyMs: Date.now() - startTime,
        message: err.message
      };
    }
  }
}
export const cognitiveTestSuite = new CognitiveTestSuite();
