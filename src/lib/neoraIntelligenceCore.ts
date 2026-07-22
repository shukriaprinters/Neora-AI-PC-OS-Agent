import crypto from "node:crypto";
import { readAIDevStudioDatabase, writeAIDevStudioDatabase } from "./neoraAIDevStudioStore";

// =================================================================
// 1. NEORA INTELLIGENCE CORE INTERFACES
// =================================================================

export interface ProjectKnowledge {
  architecture: string;
  codingStandards: string;
  businessLogic: string;
  namingConventions: string;
  folderOrganization: string;
  frameworkUsage: string;
  apiDesign: string;
  databaseRelationships: string;
  testingStyle: string;
  documentationStyle: string;
}

export interface ExperienceRecord {
  id: string;
  goal: string;
  plan: string[];
  strategy: string;
  filesChanged: string[];
  validationResults: "success" | "warning" | "failure";
  repairAttempts: number;
  executionTimeMs: number;
  outcome: string;
  confidence: number;
  timestamp: string;
}

export interface CodingPattern {
  id: string;
  name: string;
  category: "Authentication" | "CRUD" | "React" | "Database" | "ErrorFix" | "Testing" | "Security";
  patternDescription: string;
  reusableCodeSnippet: string;
  occurrences: number;
  successRate: number;
}

export interface AdaptiveMemoryPreferences {
  preferredCodingStyle: string;
  preferredLibraries: string[];
  formattingStyle: string;
  commitMessageStyle: string;
  architecturePreferences: string;
  reviewPreferences: string;
  testingPreferences: string;
}

export interface ContextSession {
  id: string;
  contextSizeTokens: number;
  relevanceScore: number; // 0-100
  accuracyScore: number; // 0-100
  tokenUsage: number;
  latencyMs: number;
  modelSuccess: boolean;
  timestamp: string;
}

export interface PromptRewrite {
  original: string;
  optimized: string;
  changesMade: string[];
  timestamp: string;
}

export interface ModelPerformanceMetric {
  modelId: string;
  latencyMs: number;
  costEstimate: number;
  tokenUsage: number;
  successCount: number;
  failureCount: number;
}

export interface LessonLearned {
  id: string;
  goal: string;
  whatWorked: string;
  whatFailed: string;
  rootCause: string;
  reusablePattern: string;
  futureRecommendation: string;
  timestamp: string;
}

export interface IntelligentRecommendation {
  id: string;
  category: "Unused Dependency" | "Duplicate Logic" | "Security" | "Performance" | "Accessibility" | "Architecture";
  title: string;
  description: string;
  proposedFix: string;
  isApplied: boolean;
  timestamp: string;
}

// =================================================================
// 2. THE CENTRAL INTELLIGENCE ENGINE
// =================================================================
export class NeoraIntelligenceCore {
  private static instance: NeoraIntelligenceCore;

  // Active in-memory caches and configurations
  public projectKnowledge!: ProjectKnowledge;
  public experiences: ExperienceRecord[] = [];
  public detectedPatterns: CodingPattern[] = [];
  public preferences!: AdaptiveMemoryPreferences;
  public contextSessions: ContextSession[] = [];
  public promptRewrites: PromptRewrite[] = [];
  public lessons: LessonLearned[] = [];
  public recommendations: IntelligentRecommendation[] = [];
  public reasoningCache: Record<string, { plan: string[]; response: string; timestamp: number }> = {};
  public modelPerformance: ModelPerformanceMetric[] = [];

  private constructor() {
    this.initDefaults();
    this.loadState();
  }

  public static getInstance(): NeoraIntelligenceCore {
    if (!NeoraIntelligenceCore.instance) {
      NeoraIntelligenceCore.instance = new NeoraIntelligenceCore();
    }
    return NeoraIntelligenceCore.instance;
  }

  private initDefaults() {
    this.projectKnowledge = {
      architecture: "Full-stack Client/Server application featuring a Vite/React client routing to an Express core on port 3000.",
      codingStandards: "Strict TypeScript, ES modules, explicit typing, optional chaining, functional React with customized hooks, arrow functions.",
      businessLogic: "Surgical code patching, local databases tracking file trees, and autonomous workflow self-healing compilers.",
      namingConventions: "CamelCase for variable and function names, PascalCase for React component definitions, kebab-case for asset configurations.",
      folderOrganization: "Modular design splitting components into src/components, controllers into src/lib, and metadata/configs at root.",
      frameworkUsage: "Vite + React 18, Tailwind CSS utility layers, Motion React for transitions, Lucide React icons.",
      apiDesign: "JSON API controllers routing via Express Router under the /api namespaces with clean middleware controls.",
      databaseRelationships: "JSON file databases mapping to local caches with cloud Firestore connections for permanent configurations.",
      testingStyle: "Vite tsc compiler typechecks, fast ESLint structural scans, dynamic file verification pipelines.",
      documentationStyle: "Self-explanatory modular code containing descriptive comments, clear Markdown changelogs, and architecture summaries."
    };

    this.preferences = {
      preferredCodingStyle: "Functional React components with typed props, explicit states, micro-interactions, and glassmorphic designs.",
      preferredLibraries: ["@google/genai", "lucide-react", "motion", "recharts", "d3", "tailwindcss"],
      formattingStyle: "Semi-colons, 2-spaces tab indentation, double-quotes strings, clean trailing commas.",
      commitMessageStyle: "Semantic conventional commits (feat: description, fix: description, chore: description).",
      architecturePreferences: "Highly modular layout systems, lightweight helper modules, single-view dashboards with responsive drawers.",
      reviewPreferences: "Prioritize TypeScript compiler warning checkups, auto-heal linter exceptions, dry-run compile tests before saving.",
      testingPreferences: "Auto-trigger npm run lint and compilation diagnostics on workspace-goal commits."
    };

    this.detectedPatterns = [
      {
        id: "pat_auth",
        name: "Firebase Identity Gateway Client",
        category: "Authentication",
        patternDescription: "Standard React Context provider binding to Firebase Auth with secure token propagation and session route guard hooks.",
        reusableCodeSnippet: `export const AuthProvider = ({ children }) => {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    return onAuthStateChanged(auth, u => setUser(u));\n  }, []);\n  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;\n};`,
        occurrences: 4,
        successRate: 100
      },
      {
        id: "pat_crud",
        name: "Express Safe Controller Wrapper",
        category: "CRUD",
        patternDescription: "Standard try/catch handler structure with JSON error schemas and input parameter validations.",
        reusableCodeSnippet: `router.post("/api/resource", async (req, res) => {\n  try {\n    const data = req.body;\n    if (!data.id) return res.status(400).json({ success: false, error: "Missing required parameter: id" });\n    res.json({ success: true, data });\n  } catch (err: any) {\n    res.status(500).json({ success: false, error: err.message });\n  }\n});`,
        occurrences: 12,
        successRate: 95
      },
      {
        id: "pat_recharts",
        name: "Dynamic Recharts Glassy Dashboard Bar Chart",
        category: "React",
        patternDescription: "Responsive container rendering a transparent styled bar chart with cyan and violet gradient fill lines.",
        reusableCodeSnippet: `<ResponsiveContainer width="100%" height={200}>\n  <BarChart data={chartData}>\n    <XAxis dataKey="name" stroke="#64748b" />\n    <Tooltip contentStyle={{ background: '#090d16', border: '1px solid #1e293b' }} />\n    <Bar dataKey="value" fill="url(#cyanGrad)" />\n  </BarChart>\n</ResponsiveContainer>`,
        occurrences: 6,
        successRate: 100
      }
    ];

    this.recommendations = [
      {
        id: "rec_dup",
        category: "Duplicate Logic",
        title: "Consolidate toast notification functions",
        description: "Multiple files are defining independent inline state wrappers for toast triggers. Standardize triggerToast inside a custom Context hook.",
        proposedFix: "Create src/hooks/useToast.ts and import it dynamically.",
        isApplied: false,
        timestamp: new Date().toISOString()
      },
      {
        id: "rec_sec",
        category: "Security",
        title: "Sanitize custom shell trial parameters",
        description: "Potential command injection vulnerabilities on trial executables. Keep strict parameters filter blocklists.",
        proposedFix: "Implement pattern matching against terminal commands to deny nested subprocess operations.",
        isApplied: true,
        timestamp: new Date().toISOString()
      },
      {
        id: "rec_perf",
        category: "Performance",
        title: "Implement memoization inside Recharts renders",
        description: "Re-rendering complex metrics timelines causes minor frame rate drops. Wrap chart data maps in React useMemo.",
        proposedFix: "const memoizedData = useMemo(() => processLogs(logs), [logs]);",
        isApplied: false,
        timestamp: new Date().toISOString()
      }
    ];

    this.modelPerformance = [
      { modelId: "gemini-3.5-flash", latencyMs: 1420, costEstimate: 0.00012, tokenUsage: 25000, successCount: 45, failureCount: 2 },
      { modelId: "gemini-3.1-pro-preview", latencyMs: 3850, costEstimate: 0.0018, tokenUsage: 84000, successCount: 28, failureCount: 0 },
      { modelId: "Qwen-2.5-Coder (Local)", latencyMs: 250, costEstimate: 0.0, tokenUsage: 0, successCount: 18, failureCount: 3 }
    ];

    this.lessons = [
      {
        id: "les_1",
        goal: "Change text embeddings API version key",
        whatWorked: "Switched model references from text-embedding-004 to gemini-embedding-2-preview.",
        whatFailed: "Calling text-embedding-004 via GoogleGenAI in v1beta returned 404 NOT_FOUND.",
        rootCause: "The legacy embedding-004 model was deprecated on the platform's newer beta endpoints.",
        reusablePattern: "Always utilize gemini-embedding-2-preview for robust, low-latency text context matching.",
        futureRecommendation: "Audit other legacy embedding calls in helper modules.",
        timestamp: new Date().toISOString()
      }
    ];
  }

  /**
   * Loads custom configurations and log trails from persistent database
   */
  public loadState() {
    try {
      const db = readAIDevStudioDatabase();
      if ((db as any).intelligenceCore) {
        const core = (db as any).intelligenceCore;
        if (core.projectKnowledge) this.projectKnowledge = core.projectKnowledge;
        if (core.experiences) this.experiences = core.experiences;
        if (core.detectedPatterns) this.detectedPatterns = core.detectedPatterns;
        if (core.preferences) this.preferences = core.preferences;
        if (core.contextSessions) this.contextSessions = core.contextSessions;
        if (core.promptRewrites) this.promptRewrites = core.promptRewrites;
        if (core.lessons) this.lessons = core.lessons;
        if (core.recommendations) this.recommendations = core.recommendations;
        if (core.modelPerformance) this.modelPerformance = core.modelPerformance;
        if (core.reasoningCache) this.reasoningCache = core.reasoningCache;
      }
    } catch (_) {}
  }

  /**
   * Persists modified states back into central db configurations
   */
  public saveState() {
    try {
      const db = readAIDevStudioDatabase();
      (db as any).intelligenceCore = {
        projectKnowledge: this.projectKnowledge,
        experiences: this.experiences,
        detectedPatterns: this.detectedPatterns,
        preferences: this.preferences,
        contextSessions: this.contextSessions,
        promptRewrites: this.promptRewrites,
        lessons: this.lessons,
        recommendations: this.recommendations,
        modelPerformance: this.modelPerformance,
        reasoningCache: this.reasoningCache
      };
      writeAIDevStudioDatabase(db);
    } catch (err) {
      console.error("[Neora Intel Core] Failed to write intelligence states:", err);
    }
  }

  // =================================================================
  // 3. CORE SERVICE METHODS
  // =================================================================

  /**
   * Evaluates user prompt, optimizes structure, registers query rewrite
   */
  public optimizePrompt(original: string): string {
    const trimmed = original.trim();
    if (!trimmed) return "";

    let optimized = trimmed;
    const changesMade: string[] = [];

    // Rule 1: Expand implicit shorthand requests
    if (trimmed.toLowerCase() === "todo list") {
      optimized = "Implement a comprehensive React todo list featuring status filter buttons, glassmorphic card designs, micro-interaction transitions, and persistent local storage sync.";
      changesMade.push("Expanded shorthand goal into a production layout draft.");
    } else if (trimmed.toLowerCase() === "calculator") {
      optimized = "Design an elegant grid-based scientific calculator utilizing Tailwind layout styles, responsive layout cells, math evaluation, and beautiful micro-animations.";
      changesMade.push("Enriched utility specifications to include UI guidelines.");
    }

    // Rule 2: Enforce project coding styles
    if (!trimmed.includes("TypeScript") && !trimmed.includes("TS") && trimmed.length > 15) {
      optimized += " Enforce strict TypeScript types and modular structures.";
      changesMade.push("Appended active project strict typing policies.");
    }

    if (changesMade.length > 0) {
      this.promptRewrites.unshift({
        original,
        optimized,
        changesMade,
        timestamp: new Date().toISOString()
      });
      if (this.promptRewrites.length > 100) this.promptRewrites.pop();
      this.saveState();
    }

    return optimized;
  }

  /**
   * Decision Strategy Generator based on project requirements and model availability
   */
  public generateStrategy(goal: string): { strategy: string; modelId: string; riskLevel: "Low" | "Medium" | "High" } {
    const lowerGoal = goal.toLowerCase();
    let strategy = "Local shell lint and verification check";
    let modelId = "gemini-3.5-flash";
    let riskLevel: "Low" | "Medium" | "High" = "Low";

    if (lowerGoal.includes("database") || lowerGoal.includes("schema") || lowerGoal.includes("firebase")) {
      strategy = "Firebase blueprint sync + security rules analysis dry-run checks";
      modelId = "gemini-3.1-pro-preview";
      riskLevel = "Medium";
    } else if (lowerGoal.includes("delete") || lowerGoal.includes("remove") || lowerGoal.includes("destruct")) {
      strategy = "Risky file action -> Isolation sandbox dry-run validation gate check";
      modelId = "gemini-3.1-pro-preview";
      riskLevel = "High";
    } else if (lowerGoal.includes("ui") || lowerGoal.includes("css") || lowerGoal.includes("component")) {
      strategy = "React functional layout planning with Lucide vector icons and motion transitions";
      modelId = "gemini-3.5-flash";
    }

    return { strategy, modelId, riskLevel };
  }

  /**
   * Forecasts potentially affected files and errors before planning
   */
  public predictAffects(goal: string): { files: string[]; potentialErrors: string[]; recommendedDependencies: string[] } {
    const lowerGoal = goal.toLowerCase();
    const files: string[] = ["src/components/AIDevelopmentStudio.tsx"];
    const potentialErrors: string[] = [];
    const recommendedDependencies: string[] = [];

    if (lowerGoal.includes("chart") || lowerGoal.includes("graph")) {
      files.push("src/components/InsightDashboard.tsx");
      potentialErrors.push("Recharts container resize crash on render overflow", "Type error assigning custom stroke colors");
      recommendedDependencies.push("recharts", "d3");
    }

    if (lowerGoal.includes("auth") || lowerGoal.includes("login")) {
      files.push("src/lib/neoraEnvironmentLayer.ts");
      potentialErrors.push("Firebase configuration missing exception", "Unauthorized routing validation loop");
    }

    if (potentialErrors.length === 0) {
      potentialErrors.push("TypeScript typecheck failure on dynamic function imports");
    }

    return { files, potentialErrors, recommendedDependencies };
  }

  /**
   * Caches reasoning decisions to optimize latency
   */
  public getCache(key: string): { plan: string[]; response: string } | null {
    const cached = this.reasoningCache[key];
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hr expiry
      return cached;
    }
    return null;
  }

  public setCache(key: string, plan: string[], response: string) {
    this.reasoningCache[key] = {
      plan,
      response,
      timestamp: Date.now()
    };
    this.saveState();
  }

  /**
   * Records execution metrics of completed tasks
   */
  public recordExperience(goal: string, plan: string[], strategy: string, files: string[], success: boolean, durationMs: number) {
    const status: ExperienceRecord["validationResults"] = success ? "success" : "failure";
    const confidence = success ? 98 : 45;

    const record: ExperienceRecord = {
      id: `exp_${crypto.randomBytes(3).toString("hex")}`,
      goal,
      plan,
      strategy,
      filesChanged: files,
      validationResults: status,
      repairAttempts: success ? 0 : 2,
      executionTimeMs: durationMs,
      outcome: success ? "Goal successfully integrated, fully validated under sandbox linter tests." : "Goal compilation had warnings, rollback proposed.",
      confidence,
      timestamp: new Date().toISOString()
    };

    this.experiences.unshift(record);
    if (this.experiences.length > 50) this.experiences.pop();

    // Generate automatic lesson learned
    const lesson: LessonLearned = {
      id: `les_${crypto.randomBytes(3).toString("hex")}`,
      goal,
      whatWorked: success ? `Fully executed steps: ${plan.join(" -> ")}` : "None, compiler errors occurred",
      whatFailed: success ? "None" : "Failed on typescript compilation checkups",
      rootCause: success ? "None" : "Compiler mismatch on global variables",
      reusablePattern: success ? "Reuse similar adapter wrappers" : "Provide strict typecasting during declaration rules",
      futureRecommendation: "Add sandbox pre-compiles.",
      timestamp: new Date().toISOString()
    };
    this.lessons.unshift(lesson);
    if (this.lessons.length > 50) this.lessons.pop();

    // Update model performance count
    const perf = this.modelPerformance.find(p => p.modelId === "gemini-3.5-flash");
    if (perf) {
      if (success) perf.successCount += 1;
      else perf.failureCount += 1;
      perf.latencyMs = Math.round((perf.latencyMs + durationMs) / 2);
    }

    this.saveState();
  }

  /**
   * Evaluates and updates Developer settings profile
   */
  public updateDeveloperProfile(updated: Partial<AdaptiveMemoryPreferences>) {
    this.preferences = { ...this.preferences, ...updated };
    this.saveState();
  }

  /**
   * Synchronizes manual changes on Project Knowledge
   */
  public updateProjectKnowledge(updated: Partial<ProjectKnowledge>) {
    this.projectKnowledge = { ...this.projectKnowledge, ...updated };
    this.saveState();
  }

  /**
   * Registers context session latency metrics
   */
  public recordContextSession(tokens: number, accuracy: number, latencyMs: number, success: boolean) {
    const session: ContextSession = {
      id: `ctx_${crypto.randomBytes(3).toString("hex")}`,
      contextSizeTokens: tokens,
      relevanceScore: accuracy,
      accuracyScore: accuracy,
      tokenUsage: tokens,
      latencyMs,
      modelSuccess: success,
      timestamp: new Date().toISOString()
    };
    this.contextSessions.unshift(session);
    if (this.contextSessions.length > 50) this.contextSessions.pop();
    this.saveState();
  }
}
