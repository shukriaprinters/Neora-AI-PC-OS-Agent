import { ContextPackage, BrandProfile, UserPreferences } from "./types.ts";
import { MemoryEngine } from "./MemoryEngine.ts";
import { PreferenceEngine } from "./PreferenceEngine.ts";

/**
 * Context Assembly Engine.
 * Aggregates conversation, active design vectors, brand guidelines, visual properties,
 * and semantic memories into an immutable ContextPackage for Vision and Multi-Agent systems.
 */
export class ContextEngine {
  private static instance: ContextEngine | null = null;

  public static getInstance(): ContextEngine {
    if (!this.instance) {
      this.instance = new ContextEngine();
    }
    return this.instance;
  }

  /**
   * Orchestrates the compilation of a situational context package.
   */
  public async assembleContext(params: {
    userId: string;
    projectId: string | null;
    pageId: string | null;
    activeIntent: string;
    recentMessages: any[];
    projectLayers?: any[]; // pass from store
    detectedVisuals?: {
      colors: { hex: string; ratio: number }[];
      mood: string;
      composition: string;
      ornaments: string[];
    };
    brandId?: string; // brand guidelines profile reference if any
  }): Promise<{ contextPackage: ContextPackage; assemblyTimeMs: number }> {
    const startTime = Date.now();

    // 1. Gather User Preferences (with per-project overrides)
    const preferences: UserPreferences = PreferenceEngine.getInstance().getPreferences(params.userId, params.projectId);

    // 2. Fetch Brand Profiles
    let brandContext: BrandProfile | null = null;
    if (params.brandId) {
      brandContext = this.mockBrandGuidelines(params.brandId);
    } else if (params.projectId) {
      // derive brand profile context automatically based on project scope
      brandContext = this.mockBrandGuidelines(`derived_brand_${params.projectId}`);
    }

    // 3. Assemble Active Canvas Vector Summary
    const canvasDimensions = { width: 1080, height: 1080 }; // standard square default
    const layerSummary: any[] = [];
    const recentEdits: string[] = [];

    if (params.projectLayers && params.projectLayers.length > 0) {
      params.projectLayers.forEach(l => {
        layerSummary.push({
          id: l.id,
          name: l.name,
          type: l.type,
          opacity: l.opacity || 1.0,
          locked: !!l.locked
        });
      });
      recentEdits.push(`Synced ${params.projectLayers.length} active layers into context canvas.`);
    }

    // 4. Assemble Visual Properties Context
    const detected = params.detectedVisuals || {
      colors: [
        { hex: "#0f172a", ratio: 0.6 },
        { hex: "#10b981", ratio: 0.3 },
        { hex: "#ffffff", ratio: 0.1 }
      ],
      mood: "high-tech minimal",
      composition: "asymmetric dynamic grid",
      ornaments: ["guilloche line mathematics", "glowing neon vectors"]
    };

    const visualContext = {
      detectedColors: detected.colors,
      detectedMood: detected.mood,
      detectedComposition: detected.composition,
      detectedOrnaments: detected.ornaments
    };

    // 5. Query Semantic Memories matching current intent/keywords
    const memoryQueryText = `${params.activeIntent} ${params.recentMessages.map(m => m.content || "").join(" ")}`;
    const relevantMemoriesResults = MemoryEngine.getInstance().searchMemories({
      text: memoryQueryText,
      projectId: params.projectId,
      limit: 6,
      confidenceMin: 0.4
    });
    const relevantMemories = relevantMemoriesResults.map(r => r.memory);

    // 6. Build the unified context package
    const contextPackage: ContextPackage = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: params.userId,
      activeProjectId: params.projectId,
      activePageId: params.pageId,
      conversationContext: {
        recentMessages: params.recentMessages,
        activeIntent: params.activeIntent
      },
      projectContext: {
        dimensions: canvasDimensions,
        layerSummary,
        recentEdits
      },
      visualContext,
      brandContext,
      userPreferences: preferences,
      relevantMemories,
      metadata: {
        totalLayersMapped: layerSummary.length,
        semanticMemoriesLoaded: relevantMemories.length,
        brandProfileIdLoaded: brandContext ? brandContext.id : null
      }
    };

    const assemblyTimeMs = Date.now() - startTime;
    return {
      contextPackage,
      assemblyTimeMs
    };
  }

  /**
   * Mock brand profile generator. Generates complex rules to avoid hardcoded mock layers.
   */
  private mockBrandGuidelines(brandId: string): BrandProfile {
    const isGoldLuxury = brandId.toLowerCase().includes("gold") || brandId.toLowerCase().includes("luxury");
    const isIslamic = brandId.toLowerCase().includes("islamic") || brandId.toLowerCase().includes("ramadan");
    
    if (isGoldLuxury || isIslamic) {
      return {
        id: brandId,
        name: "Imperial Golden Motif Brand Guidelines",
        brandColors: ["#0a0a0a", "#f59e0b", "#d97706", "#ffffff"],
        brandFonts: ["Playfair Display", "Cinzel", "Galada"],
        logoRules: ["Align logo to center top margin", "Retain 24px print spacing margin"],
        spacingRules: { margin: 40, gutters: 24, padding: 32 },
        visualIdentity: "Luxury royal gold with traditional floral motifs and heavy ornaments",
        tone: "majestic, ancient, sacred",
        mood: "warm golden light",
        brandAssets: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"],
        allowedTemplates: ["tmpl_luxury_poster_1", "tmpl_invitation_gold"],
        forbiddenStyles: ["cyberpunk", "vaporwave", "flat_vector"],
        exportRequirements: [
          { format: "pdf", dpi: 300 },
          { format: "tiff", dpi: 600 }
        ],
        printRules: ["Requires gold hot-stamping plates", "Soft-touch matte background laminate"],
        lastUpdated: new Date().toISOString()
      };
    }

    return {
      id: brandId,
      name: "Neora Sovereign Corporate Identity",
      brandColors: ["#09090b", "#06b6d4", "#ffffff"],
      brandFonts: ["Space Grotesk", "Inter", "JetBrains Mono"],
      logoRules: ["Left-aligned header layout", "Forbidden from stretching or scale distortion"],
      spacingRules: { margin: 48, gutters: 16, padding: 24 },
      visualIdentity: "Futuristic dark mode with highly structured bento-grids and vector overlays",
      tone: "highly technical, professional, architectural",
      mood: "ambient neon glow spots",
      brandAssets: ["https://images.unsplash.com/photo-1604871000636-074fa5117945?w=100"],
      allowedTemplates: ["tmpl_poster_1", "tmpl_vcard_1"],
      forbiddenStyles: ["grunge", "comic_book", "retro_psychedelic"],
      exportRequirements: [
        { format: "png", dpi: 72 },
        { format: "svg", dpi: 300 }
      ],
      printRules: ["High gloss localized spot UV printing over neon elements"],
      lastUpdated: new Date().toISOString()
    };
  }
}
