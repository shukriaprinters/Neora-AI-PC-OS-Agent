import { UserPreferences, LanguageCode, LanguageTypographyPreference } from "./types.ts";

/**
 * Enterprise Preference Engine.
 * Manages user preference configurations, per-project overrides, multilingual
 * guidelines, and records interactive edits to learn formatting habits.
 */
export class PreferenceEngine {
  private static instance: PreferenceEngine | null = null;

  // Root storage for preferences
  private preferences: Map<string, UserPreferences> = new Map();
  // Map of project-specific override objects
  private projectOverrides: Map<string, Partial<UserPreferences>> = new Map();
  
  // Learned characteristics tracking metrics
  private userHabits: Map<string, {
    alignments: Record<string, number>;
    fontWeights: Record<string, number>;
    densities: number[];
  }> = new Map();

  public static getInstance(): PreferenceEngine {
    if (!this.instance) {
      this.instance = new PreferenceEngine();
    }
    return this.instance;
  }

  /**
   * Bootstraps standard default settings.
   */
  public generateDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      preferredLanguage: "en",
      writingDirection: "ltr",
      preferredFonts: ["Inter", "Space Grotesk"],
      preferredColorPalettes: [
        ["#09090b", "#1c0f30", "#06b6d4", "#ffffff"],
        ["#ffffff", "#fcfaf2", "#d97706", "#1c1917"]
      ],
      preferredPosterStyles: ["minimal", "luxury"],
      preferredLayouts: ["balanced", "single_column"],
      preferredPrintSettings: {
        bleedMm: 3.0,
        cmyk: true,
        format: "A4"
      },
      preferredExportFormats: ["png", "pdf", "svg"],
      preferredIllustrationStyles: ["geometric", "minimalist"],
      preferredCalligraphyStyles: ["modern_brush", "bangla"],
      preferredWatermarkStyles: ["guilloche"],
      preferredVectorStyles: ["geometric"],
      preferredDesignCategories: ["poster", "banner"],
      preferredAiProviders: ["google"],
      preferredEditingWorkflow: "manual",
      learningEnabled: true
    };
  }

  public getPreferences(userId: string, projectId?: string | null): UserPreferences {
    let prefs = this.preferences.get(userId);
    if (!prefs) {
      prefs = this.generateDefaultPreferences(userId);
      this.preferences.set(userId, prefs);
    }

    if (projectId) {
      const override = this.projectOverrides.get(projectId);
      if (override) {
        return { ...prefs, ...override };
      }
    }

    return prefs;
  }

  public updatePreferences(userId: string, updates: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences(userId);
    const updated = { ...current, ...updates };
    this.preferences.set(userId, updated);
    return updated;
  }

  public setProjectOverride(projectId: string, overrides: Partial<UserPreferences>): void {
    const existing = this.projectOverrides.get(projectId) || {};
    this.projectOverrides.set(projectId, { ...existing, ...overrides });
  }

  public clearProjectOverride(projectId: string): void {
    this.projectOverrides.delete(projectId);
  }

  // --- LANGUAGE-AWARE TYPOGRAPHY AND RTL PRESETS ---

  public getLanguagePresets(lang: LanguageCode): LanguageTypographyPreference {
    switch (lang) {
      case "bn":
        return {
          language: "bn",
          preferredFonts: ["Hind Siliguri", "Galada"],
          preferredDirection: "ltr",
          calligraphyStyle: "bangla",
          baselineOffset: 5.0
        };
      case "ar":
        return {
          language: "ar",
          preferredFonts: ["Amiri", "Cairo"],
          preferredDirection: "rtl",
          openTypeFeatures: ["liga", "dlig", "mset"],
          calligraphyStyle: "islamic",
          baselineOffset: 0.0
        };
      case "ur":
        return {
          language: "ur",
          preferredFonts: ["Noto Nastaliq Urdu"],
          preferredDirection: "rtl",
          openTypeFeatures: ["liga"],
          calligraphyStyle: "islamic",
          baselineOffset: 3.0
        };
      case "ja":
        return {
          language: "ja",
          preferredFonts: ["Noto Sans JP", "Sawarabi Mincho"],
          preferredDirection: "ltr",
          baselineOffset: 0.0
        };
      case "en":
      default:
        return {
          language: "en",
          preferredFonts: ["Inter", "Space Grotesk", "Playfair Display"],
          preferredDirection: "ltr",
          baselineOffset: 0.0
        };
    }
  }

  // --- DYNAMIC LEARNING SYSTEM LOOP ---

  /**
   * Tracks user layout operations to learn custom preferences safely.
   */
  public recordInteractiveEdit(userId: string, action: {
    fontFamily?: string;
    fontWeight?: string;
    align?: "left" | "center" | "right";
    densityScore?: number; // spacing ratio (amount of layers / dimensions)
    paletteHexes?: string[];
  }): void {
    const prefs = this.getPreferences(userId);
    if (!prefs.learningEnabled) return; // Full respect to user control toggle

    let habits = this.userHabits.get(userId);
    if (!habits) {
      habits = { alignments: {}, fontWeights: {}, densities: [] };
      this.userHabits.set(userId, habits);
    }

    // 1. Learn Text Alignments
    if (action.align) {
      const current = habits.alignments[action.align] || 0;
      habits.alignments[action.align] = current + 1;

      // If clear pattern emerges (> 5 times and double any other), adapt user preferredLayouts
      const alignments = Object.entries(habits.alignments).sort((a, b) => b[1] - a[1]);
      if (alignments.length > 0 && alignments[0][1] > 5) {
        const topAlign = alignments[0][0];
        if (!prefs.preferredLayouts.includes(topAlign)) {
          this.updatePreferences(userId, {
            preferredLayouts: [topAlign, ...prefs.preferredLayouts.filter(l => l !== topAlign)].slice(0, 3)
          });
        }
      }
    }

    // 2. Learn Preferred Font Families
    if (action.fontFamily) {
      if (!prefs.preferredFonts.includes(action.fontFamily)) {
        this.updatePreferences(userId, {
          preferredFonts: [action.fontFamily, ...prefs.preferredFonts].slice(0, 5)
        });
      }
    }

    // 3. Learn Density score averages
    if (action.densityScore !== undefined) {
      habits.densities.push(action.densityScore);
      if (habits.densities.length > 10) {
        habits.densities.shift(); // keep sliding window
      }

      const avgDensity = habits.densities.reduce((a, b) => a + b, 0) / habits.densities.length;
      // Record a preferred editing density factor
      this.setProjectOverride("learned_global", {
        preferredEditingWorkflow: avgDensity > 0.6 ? "dense_grid" : "spacious_minimal"
      });
    }

    // 4. Learn Color combinations
    if (action.paletteHexes && action.paletteHexes.length > 1) {
      const stringifiedPalettes = prefs.preferredColorPalettes.map(p => p.join(","));
      const actionPaletteString = action.paletteHexes.join(",");
      
      if (!stringifiedPalettes.includes(actionPaletteString)) {
        this.updatePreferences(userId, {
          preferredColorPalettes: [action.paletteHexes, ...prefs.preferredColorPalettes].slice(0, 5)
        });
      }
    }
  }

  public getLearnedHabits(userId: string) {
    return this.userHabits.get(userId) || { alignments: {}, fontWeights: {}, densities: [] };
  }

  public resetLearnedHabits(userId: string): void {
    this.userHabits.delete(userId);
  }
}
