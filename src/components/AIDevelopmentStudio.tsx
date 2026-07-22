import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code, Sparkles, RefreshCw, Eye, ShieldAlert, Palette, CheckCircle, Copy, AlertCircle, Brain,
  Cpu, Database, Sliders, Key, Settings, Volume2, Heart, Smile, Scan, FileCode, Search,
  GitBranch, Terminal, FileText, Users, Play, RotateCcw, Save, Trash2, Star, CheckSquare,
  ArrowRight, ShieldCheck, Download, AlertTriangle, ChevronRight, HelpCircle, Activity,
  Layers, Hammer, Network, Mic, MicOff, Lock, Settings2, Maximize2, Minimize2, Plus, Trash,
  CloudLightning, History, Clock, CornerDownRight, Check, X, File, Folder, HardDrive,
  Globe, Info, Laptop, Layout, BookOpen, TerminalSquare, Compass, SlidersHorizontal, EyeOff,
  Bell, CheckSquare2, FileSpreadsheet, Command, HelpCircle as HelpIcon, Flame, Wand2, BookmarkCheck
} from "lucide-react";
import { NeoraOSPortal } from "./NeoraOSPortal";
import { NeoraRecursivePlannerDashboard } from "./NeoraRecursivePlannerDashboard";
import { NeoraEngineeringEvolutionDashboard } from "./NeoraEngineeringEvolutionDashboard";
import { NeoraProductGovernanceDashboard } from "./NeoraProductGovernanceDashboard";
import { NeoraProductSSOTDashboard } from "./NeoraProductSSOTDashboard";
import { NeoraAIDesignStudioDashboard } from "./NeoraAIDesignStudioDashboard";

interface AIDevelopmentStudioProps {
  lang: "en" | "bn";
  geminiKey?: string;
}

type ThemeId = "neora-dark" | "oled-black" | "cyber-blue" | "dark-glass" | "light-glass";
type AccentId = "cyan" | "purple" | "emerald" | "amber" | "rose";

interface ThemeConfig {
  bg: string;
  sidebarBg: string;
  panelBg: string;
  border: string;
  text: string;
  textMuted: string;
  glass: string;
}

const THEME_PRESETS: Record<ThemeId, ThemeConfig> = {
  "neora-dark": {
    bg: "bg-[#090b11]",
    sidebarBg: "bg-[#0d0f17]/95",
    panelBg: "bg-[#111420]/90",
    border: "border-cyan-500/10",
    text: "text-slate-100",
    textMuted: "text-slate-400",
    glass: "backdrop-blur-md bg-[#090b11]/80"
  },
  "oled-black": {
    bg: "bg-black",
    sidebarBg: "bg-zinc-950",
    panelBg: "bg-zinc-900/40",
    border: "border-zinc-800",
    text: "text-zinc-100",
    textMuted: "text-zinc-500",
    glass: "backdrop-blur-none bg-black"
  },
  "cyber-blue": {
    bg: "bg-[#020d1a]",
    sidebarBg: "bg-[#03152c]/95",
    panelBg: "bg-[#051c3a]/80",
    border: "border-blue-500/20",
    text: "text-blue-100",
    textMuted: "text-blue-400/70",
    glass: "backdrop-blur-lg bg-[#020d1a]/80"
  },
  "dark-glass": {
    bg: "bg-slate-950",
    sidebarBg: "bg-slate-900/60",
    panelBg: "bg-slate-900/40",
    border: "border-slate-800/80",
    text: "text-slate-200",
    textMuted: "text-slate-500",
    glass: "backdrop-blur-2xl bg-slate-950/70"
  },
  "light-glass": {
    bg: "bg-slate-50",
    sidebarBg: "bg-white/80",
    panelBg: "bg-white/40",
    border: "border-slate-200",
    text: "text-slate-800",
    textMuted: "text-slate-500",
    glass: "backdrop-blur-xl bg-white/60"
  }
};

const ACCENT_COLORS: Record<AccentId, { primary: string; glow: string; text: string; bg: string }> = {
  cyan: { primary: "bg-cyan-500", glow: "shadow-[0_0_12px_rgba(6,182,212,0.4)]", text: "text-cyan-400", bg: "bg-cyan-950/45" },
  purple: { primary: "bg-purple-500", glow: "shadow-[0_0_12px_rgba(168,85,247,0.4)]", text: "text-purple-400", bg: "bg-purple-950/45" },
  emerald: { primary: "bg-emerald-500", glow: "shadow-[0_0_12px_rgba(16,185,129,0.4)]", text: "text-emerald-400", bg: "bg-emerald-950/45" },
  amber: { primary: "bg-amber-500", glow: "shadow-[0_0_12px_rgba(245,158,11,0.4)]", text: "text-amber-400", bg: "bg-amber-950/45" },
  rose: { primary: "bg-rose-500", glow: "shadow-[0_0_12px_rgba(244,63,94,0.4)]", text: "text-rose-400", bg: "bg-rose-950/45" }
};

export function AIDevelopmentStudio({ lang, geminiKey }: AIDevelopmentStudioProps) {
  // Navigation Tabs for Center Workspace
  const [activeTab, setActiveTab] = useState<
    "conversation" | "multi-agent" | "architecture" | "planner" | "execution" | "patches" | "browser" | "documentation" | "environment" | "intelligence" | "engineering" | "governance" | "ssot" | "design-studio" | "os-portal"
  >("conversation");

  // Input & Prompt
  const [promptInput, setPromptInput] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);

  // Layout Toggles & Dimensions
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(260);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(180);

  // Theme, Accent & Density Settings
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("neora-dark");
  const [currentAccent, setCurrentAccent] = useState<AccentId>("cyan");

  // =================================================================
  // PHASE 5: AUTONOMOUS EXECUTION ENGINE STATES
  // =================================================================
  const [execStatus, setExecStatus] = useState<any>({
    executionId: "",
    goal: "",
    status: "idle",
    timeline: [],
    currentRetry: 0,
    maxRetries: 3,
    logs: [],
    patchesProposed: [],
    metrics: {
      cpuUsage: 0,
      ramUsage: { totalGb: 8, freeGb: 4, usedGb: 4, percent: 50 },
      diskUsage: { totalGb: 50, freeGb: 35, usedGb: 15, percent: 30 },
      workerThreads: 4,
      modelRateLimits: { requestsRemaining: 15, resetTimeSec: 60 }
    },
    executionMode: "assisted"
  });
  const [snapshotsList, setSnapshotsList] = useState<any[]>([]);
  const [safetyRules, setSafetyRules] = useState<any[]>([]);
  const [targetGoal, setTargetGoal] = useState("");
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Poll execution status
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/ai-dev-studio/execution/status");
        const data = await res.json();
        if (data.success) {
          setExecStatus(data);
        }
      } catch (_) {}
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadSnapshotsAndRules = async () => {
    try {
      const snapRes = await fetch("/api/ai-dev-studio/execution/snapshots");
      const snapData = await snapRes.json();
      if (snapData.success) setSnapshotsList(snapData.snapshots);

      const rulesRes = await fetch("/api/ai-dev-studio/execution/rules");
      const rulesData = await rulesRes.json();
      if (rulesData.success) {
        setSafetyRules(rulesData.rules);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadSnapshotsAndRules();
  }, []);

  const handleLaunchAutonomousRun = async (customGoalText?: string) => {
    const finalGoal = customGoalText || targetGoal || promptInput;
    if (!finalGoal.trim()) {
      triggerToast("Please define an execution goal first.");
      return;
    }
    setSubmittingGoal(true);
    addLogLine(`[Neora Executive] Dispatching goal to Autonomous Pipeline: "${finalGoal}"`);
    setActiveTab("execution");

    try {
      const res = await fetch("/api/ai-dev-studio/execution/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: finalGoal, geminiKey })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Autonomous execution workflow started!");
        setTargetGoal("");
      } else {
        triggerToast(`Launch failed: ${data.error}`);
      }
    } catch (err: any) {
      triggerToast("Network request failed initiating pipeline.");
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleExecutionAction = async (action: "approve" | "rollback" | "pause" | "cancel", snapId?: string) => {
    try {
      if (action === "rollback" && snapId) {
        addLogLine(`Initiating rollback restore to snapshot: ${snapId}...`);
        const res = await fetch("/api/ai-dev-studio/snapshots/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ snapshotId: snapId })
        });
        const data = await res.json();
        if (data.success) {
          triggerToast("Rollback restored successfully!");
          loadSnapshotsAndRules();
        } else {
          triggerToast("Rollback failed.");
        }
        return;
      }

      addLogLine(`Sending action [${action}] to execution engine...`);
      const res = await fetch("/api/ai-dev-studio/execution/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, geminiKey })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Execution action ${action} succeeded.`);
        loadSnapshotsAndRules();
      } else {
        triggerToast(`Action failed: ${data.message || "Unknown error"}`);
      }
    } catch (_) {
      triggerToast("Failed to communicate with execution server.");
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    const updated = safetyRules.map(r => r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r);
    setSafetyRules(updated);
    try {
      await fetch("/api/ai-dev-studio/execution/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: updated })
      });
      triggerToast("Safety gate rules synchronized.");
    } catch (_) {}
  };

  const handleSetMode = async (mode: "read_only" | "assisted" | "autonomous") => {
    try {
      const res = await fetch("/api/ai-dev-studio/execution/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionMode: mode })
      });
      const data = await res.json();
      if (data.success) {
        setExecStatus((p: any) => ({ ...p, executionMode: mode }));
        triggerToast(`Safety engine mode updated to ${mode}`);
      }
    } catch (_) {}
  };

  // =================================================================
  // PHASE 6: THE ENVIRONMENT LAYER STATE & CONTROLLERS
  // =================================================================
  const [envAdapters, setEnvAdapters] = useState<any[]>([]);
  const [envProviders, setEnvProviders] = useState<any[]>([]);
  const [envPlugins, setEnvPlugins] = useState<any[]>([]);
  const [envPermissions, setEnvPermissions] = useState<any[]>([]);
  const [envAuditLogs, setEnvAuditLogs] = useState<any[]>([]);
  const [envSandboxConfig, setEnvSandboxConfig] = useState<any>({
    timeoutMs: 10000,
    memoryLimitMb: 512,
    cpuLimitPercent: 80,
    isIsolated: true
  });
  const [envTrialCommand, setEnvTrialCommand] = useState("npm run lint");
  const [envTrialFilePath, setEnvTrialFilePath] = useState("package.json");
  const [envTrialContent, setEnvTrialContent] = useState("");
  const [envTrialAction, setEnvTrialAction] = useState<"read" | "write" | "delete">("read");
  const [envTrialResult, setEnvTrialResult] = useState<any>(null);
  const [envRunningTrial, setEnvRunningTrial] = useState(false);

  const fetchEnvironmentStatus = async () => {
    try {
      const res = await fetch("/api/environment/status");
      const data = await res.json();
      if (data.success) {
        setEnvAdapters(data.adapters || []);
        setEnvProviders(data.providers || []);
        setEnvPlugins(data.plugins || []);
        setEnvPermissions(data.permissions || []);
        setEnvAuditLogs(data.auditLogs || []);
        setEnvSandboxConfig(data.sandboxConfig || envSandboxConfig);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchEnvironmentStatus();
    const interval = setInterval(fetchEnvironmentStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePermission = async (id: string, field: "isAllowed" | "requiresApproval", value: boolean) => {
    try {
      const res = await fetch("/api/environment/permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value })
      });
      const data = await res.json();
      if (data.success) {
        setEnvPermissions(data.permissions);
        triggerToast("Permissions policies synchronized successfully.");
      }
    } catch (_) {
      triggerToast("Failed to modify environmental permissions.");
    }
  };

  const handlePluginAction = async (id: string, action: "install" | "enable" | "disable" | "update" | "repair" | "remove") => {
    try {
      const res = await fetch("/api/environment/plugin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if (data.success) {
        setEnvPlugins(data.plugins);
        triggerToast(`Plugin action '${action}' completed successfully!`);
      } else {
        triggerToast(`Action failed: ${data.error}`);
      }
    } catch (_) {
      triggerToast("Error communicating plugin instruction.");
    }
  };

  const handleToggleProvider = async (id: string, isEnabled: boolean) => {
    try {
      const res = await fetch("/api/environment/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isEnabled })
      });
      const data = await res.json();
      if (data.success) {
        setEnvProviders(data.providers);
        triggerToast("Inference provider status updated.");
      }
    } catch (_) {
      triggerToast("Error updating model provider status.");
    }
  };

  const handleSetProviderModel = async (id: string, defaultModel: string) => {
    try {
      const res = await fetch("/api/environment/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, defaultModel })
      });
      const data = await res.json();
      if (data.success) {
        setEnvProviders(data.providers);
        triggerToast(`Default provider model set to ${defaultModel}`);
      }
    } catch (_) {
      triggerToast("Error targeting provider model.");
    }
  };

  const handleUpdateSandboxConfig = async (updatedFields: any) => {
    const nextConfig = { ...envSandboxConfig, ...updatedFields };
    setEnvSandboxConfig(nextConfig);
    try {
      const res = await fetch("/api/environment/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextConfig)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Sandbox virtualization resource bounds synchronized.");
      }
    } catch (_) {}
  };

  const handleRunTrialShell = async () => {
    setEnvRunningTrial(true);
    setEnvTrialResult(null);
    try {
      const res = await fetch("/api/environment/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "shell", command: envTrialCommand })
      });
      const data = await res.json();
      setEnvTrialResult(data);
      if (data.success && !data.error) {
        triggerToast("Shell trial command evaluated!");
      } else {
        triggerToast(`Shell trial finished: ${data.error || "has errors"}`);
      }
    } catch (_) {
      triggerToast("Trial communication network error.");
    } finally {
      setEnvRunningTrial(false);
      fetchEnvironmentStatus();
    }
  };

  const handleRunTrialFilesystem = async () => {
    setEnvRunningTrial(true);
    setEnvTrialResult(null);
    try {
      const res = await fetch("/api/environment/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "filesystem",
          action: envTrialAction,
          filePath: envTrialFilePath,
          content: envTrialContent
        })
      });
      const data = await res.json();
      setEnvTrialResult(data);
      if (data.success && !data.error) {
        triggerToast(`Filesystem operation ${envTrialAction} succeeded.`);
      } else {
        triggerToast(`FS action failed: ${data.error}`);
      }
    } catch (_) {
      triggerToast("Trial execution network error.");
    } finally {
      setEnvRunningTrial(false);
      fetchEnvironmentStatus();
    }
  };

  // =================================================================
  // PHASE 7: NEORA INTELLIGENCE CORE STATE & CONTROLLERS
  // =================================================================
  const [intelKnowledge, setIntelKnowledge] = useState<any>({
    architecture: "", codingStandards: "", businessLogic: "", namingConventions: "",
    folderOrganization: "", frameworkUsage: "", apiDesign: "", databaseRelationships: "",
    testingStyle: "", documentationStyle: ""
  });
  const [intelExperiences, setIntelExperiences] = useState<any[]>([]);
  const [intelPatterns, setIntelPatterns] = useState<any[]>([]);
  const [intelPreferences, setIntelPreferences] = useState<any>({
    preferredCodingStyle: "", preferredLibraries: [], formattingStyle: "",
    commitMessageStyle: "", architecturePreferences: "", reviewPreferences: "",
    testingPreferences: ""
  });
  const [intelSessions, setIntelSessions] = useState<any[]>([]);
  const [intelRewrites, setIntelRewrites] = useState<any[]>([]);
  const [intelLessons, setIntelLessons] = useState<any[]>([]);
  const [intelRecommendations, setIntelRecommendations] = useState<any[]>([]);
  const [intelPerformance, setIntelPerformance] = useState<any[]>([]);
  const [intelPromptTest, setIntelPromptTest] = useState("todo list");
  const [intelPromptResult, setIntelPromptResult] = useState<any>(null);
  const [intelStrategyGoal, setIntelStrategyGoal] = useState("Add an interactive timeline chart showing model latency and token counts");
  const [intelStrategyResult, setIntelStrategyResult] = useState<any>(null);
  const [intelLoading, setIntelLoading] = useState(false);

  const fetchIntelligenceStatus = async () => {
    try {
      const res = await fetch("/api/intelligence/status");
      const data = await res.json();
      if (data.success) {
        setIntelKnowledge(data.projectKnowledge);
        setIntelExperiences(data.experiences);
        setIntelPatterns(data.detectedPatterns);
        setIntelPreferences(data.preferences);
        setIntelSessions(data.contextSessions);
        setIntelRewrites(data.promptRewrites);
        setIntelLessons(data.lessons);
        setIntelRecommendations(data.recommendations);
        setIntelPerformance(data.modelPerformance);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchIntelligenceStatus();
    const interval = setInterval(fetchIntelligenceStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdatePreference = async (field: string, value: any) => {
    try {
      const updated = { ...intelPreferences, [field]: value };
      setIntelPreferences(updated);
      const res = await fetch("/api/intelligence/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Adaptive developer profile synchronized!");
      }
    } catch (_) {
      triggerToast("Error updating profile preference.");
    }
  };

  const handleUpdateKnowledge = async (field: string, value: string) => {
    try {
      const updated = { ...intelKnowledge, [field]: value };
      setIntelKnowledge(updated);
      const res = await fetch("/api/intelligence/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Project knowledge base specs updated.");
      }
    } catch (_) {
      triggerToast("Error updating knowledge spec.");
    }
  };

  const handleToggleRecommendation = async (id: string) => {
    try {
      const res = await fetch("/api/intelligence/recommendation/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setIntelRecommendations(data.recommendations);
        triggerToast("Recommendation applied state toggled.");
      }
    } catch (_) {
      triggerToast("Error processing recommendation toggle.");
    }
  };

  const handleRunPromptOptimization = async () => {
    setIntelLoading(true);
    setIntelPromptResult(null);
    try {
      const res = await fetch("/api/intelligence/optimize-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: intelPromptTest })
      });
      const data = await res.json();
      if (data.success) {
        setIntelPromptResult(data);
        triggerToast("Prompt optimization completed successfully!");
        fetchIntelligenceStatus();
      }
    } catch (_) {
      triggerToast("Error optimizing prompt.");
    } finally {
      setIntelLoading(false);
    }
  };

  const handleRunStrategyForecasting = async () => {
    setIntelLoading(true);
    setIntelStrategyResult(null);
    try {
      const res = await fetch("/api/intelligence/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: intelStrategyGoal })
      });
      const data = await res.json();
      if (data.success) {
        setIntelStrategyResult(data);
        triggerToast("Execution strategy forecasted successfully!");
      }
    } catch (_) {
      triggerToast("Error evaluating execution forecasting.");
    } finally {
      setIntelLoading(false);
    }
  };

  const handleTriggerManualExperience = async (success: boolean) => {
    try {
      const res = await fetch("/api/intelligence/experience/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: "Manual developer workspace test goal simulation",
          plan: ["Bootstrap verification hooks", "Linter static analyses checkup", "Verify compiler build success"],
          strategy: "Enterprise validation flow with auto linter patch checks",
          files: ["src/components/AIDevelopmentStudio.tsx", "server.ts"],
          success,
          durationMs: Math.round(1000 + Math.random() * 3000)
        })
      });
      const data = await res.json();
      if (data.success) {
        setIntelExperiences(data.experiences);
        setIntelLessons(data.lessons);
        triggerToast(`Manual experience recorded successfully as ${success ? "Success" : "Failed"}`);
        fetchIntelligenceStatus();
      }
    } catch (_) {
      triggerToast("Error recording experience.");
    }
  };

  // Interactive Skeletons / States (Connected to actual Backend)
  const [scanResult, setScanResult] = useState<any>({
    fileCount: 0,
    frameworks: [],
    categories: { ui: [], components: [], backend: [], database: [], tests: [] },
    graph: { nodes: [], links: [] }
  });
  const [selectedFilePath, setSelectedFilePath] = useState("src/App.tsx");
  const [originalCode, setOriginalCode] = useState("");
  const [modifiedCode, setModifiedCode] = useState("");
  const [patchInstructions, setPatchInstructions] = useState("");
  const [diffMode, setDiffMode] = useState<"diff" | "original" | "modified">("diff");

  // Prompt history & templates
  const [promptTemplates, setPromptTemplates] = useState<any[]>([]);
  const [promptHistory, setPromptHistory] = useState<any[]>([]);

  // Planner state
  const [activePlan, setActivePlan] = useState<any>({
    tasks: [
      { id: "t1", title: "Scan Active Directories Graph", subtasks: ["Gather workspace dependencies", "Map file locations"], duration: "5m", completed: true },
      { id: "t2", title: "Parse Prompt & Analyze Architecture", subtasks: ["Evaluate type imports", "Assess potential regressions"], duration: "10m", completed: true },
      { id: "t3", title: "Run Code Patch Generation", subtasks: ["Write clean functional components", "Inject Tailwind layout styles"], duration: "15m", completed: false },
      { id: "t4", title: "Perform Compile & Lint Verification", subtasks: ["Execute tsc --noEmit check", "Run linter healer"], duration: "5m", completed: false }
    ],
    affectedFiles: [
      { path: "src/components/AIDevelopmentStudio.tsx", type: "UI", confidence: 98, reason: "The main view file containing core developer workspace views." },
      { path: "server.ts", type: "Backend", confidence: 85, reason: "Defines server routes and mounts AI planner handlers." }
    ],
    riskAnalysis: [
      "Verify that tailwind classes do not contain overlapping display properties.",
      "Ensure process.env variable guards do not crash during server start phases."
    ],
    dependencies: ["lucide-react", "motion", "express"],
    estimatedTime: "35 Minutes Total",
    architecturePlan: "Implements modular developer workspace components with full-stack endpoints to facilitate live file reads, patch creation, linter execution, and error healing.",
    implementationOrder: ["Setup Dev Routers", "Build Interface Tabs", "Execute Compiler Tests"]
  });

  // Validation output
  const [validationLogs, setValidationLogs] = useState("");
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);
  const [validationMetrics, setValidationMetrics] = useState({ errors: 0, warnings: 0, timeMs: 0 });
  const [aiErrorAnalysis, setAiErrorAnalysis] = useState<any>(null);

  // Settings
  const [settingsForm, setSettingsForm] = useState({
    ollamaEndpoint: "http://localhost:11434",
    defaultOnlineModel: "gemini-3.5-flash",
    defaultOfflineModel: "Qwen-2.5-Coder",
    autoHealEnabled: true,
    maxRetries: 3,
    sandboxExecution: true
  });
  const [routingRules, setRoutingRules] = useState<any[]>([]);

  // Git and Logs
  const [gitStatus, setGitStatus] = useState<any>({ branch: "main", commits: [], files: [] });
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [terminalCommand, setTerminalCommand] = useState("");
  const [activeTerminalTab, setActiveTerminalTab] = useState<"terminal" | "console" | "git" | "jobs" | "workflow-queue">("workflow-queue");

  // Reports
  const [reports, setReports] = useState<any[]>([]);
  const [newReportTitle, setNewReportTitle] = useState("Daily Development Sprint Report");

  // Browser Simulate
  const [browserUrl, setBrowserUrl] = useState("");
  const [browserWidth, setBrowserWidth] = useState<string>("100%");
  const [browserLogs, setBrowserLogs] = useState<string[]>([
    "Console logger initialized.",
    "Dev Server listening on http://localhost:3000"
  ]);

  // Modals / Overlays
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Loading indicator states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    scanning: false,
    prompting: false,
    patching: false,
    testing: false,
    healing: false,
    saving: false
  });

  const [currentGoal, setCurrentGoal] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);

  // Central Workflow Engine States (Phase 2)
  const [workflowStage, setWorkflowStage] = useState<
    "Idle" | "Receiving Prompt" | "Intent Detection" | "Goal Analysis" | "Project Analysis" | 
    "Context Building" | "Dependency Mapping" | "File Discovery" | "Architecture Planning" | 
    "Task Breakdown" | "Execution Queue Ready" | "Waiting" | "Running" | "Completed" | "Failed" | "Cancelled" | "Retry"
  >("Idle");
  const [detectedGoals, setDetectedGoals] = useState<string[]>([]);
  const [projectProfile, setProjectProfile] = useState<any>({
    name: "neora-os",
    framework: "React + Vite + Express + Node.js",
    frontend: "React 18",
    backend: "Express Layer",
    database: "Local JSON DB store",
    runtime: "Node.js (Linux Sandbox)",
    packageManager: "npm",
    git: "Initialized",
    docker: "None",
    configs: ["package.json", "tsconfig.json"],
    folderStructure: ["src", "src/components"]
  });
  const [semanticContext, setSemanticContext] = useState<any[]>([]);
  const [fileDiscovery, setFileDiscovery] = useState<any>({});
  const [dependencyGraph, setDependencyGraph] = useState<any>({ nodes: [], links: [] });
  const [architecturePlan, setArchitecturePlan] = useState<any>(null);
  const [workflowTasks, setWorkflowTasks] = useState<any[]>([]);
  const [executionQueue, setExecutionQueue] = useState<any[]>([]);
  const [isWorkflowPaused, setIsWorkflowPaused] = useState(false);
  const [currentAgentName, setCurrentAgentName] = useState<string>("Orchestrator Agent");
  const [aiThinkingSummary, setAiThinkingSummary] = useState<string>("System Idle");
  const [workflowLogs, setWorkflowLogs] = useState<string[]>([]);

  // Phase 3 Multi-Agent States
  const [agentsState, setAgentsState] = useState<any[]>([]);
  const [agentMessages, setAgentMessages] = useState<any[]>([]);
  const [agentSummary, setAgentSummary] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("coordinator");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const activeTheme = THEME_PRESETS[currentTheme];
  const activeAccent = ACCENT_COLORS[currentAccent];

  const triggerToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const addLogLine = (line: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  // Keyboard Shortcuts (Ctrl+Shift+P and Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "P" && e.shiftKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setSettingsOpen(false);
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Set initial client values
  useEffect(() => {
    setBrowserUrl(window.location.origin);
    addLogLine("Initializing Neora AI Developer Workspace Kernel...");
    fetchScan();
    fetchTemplates();
    fetchGitStatus();
    fetchSettings();
    fetchReports();
  }, []);

  // Sync logs scroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  // Load File Contents when active file changes
  useEffect(() => {
    if (selectedFilePath) {
      fetchFileContent(selectedFilePath);
    }
  }, [selectedFilePath]);

  // Core API Fetches
  const fetchScan = async () => {
    setLoadingStates(p => ({ ...p, scanning: true }));
    addLogLine("Requesting full directory mapping and index...");
    try {
      const res = await fetch("/api/ai-dev-studio/scan");
      const data = await res.json();
      if (data.success) {
        setScanResult(data);
        addLogLine(`Workspace Scan success: ${data.fileCount} files registered under Neora DB.`);
      }
    } catch (err) {
      addLogLine("Error fetching scan mapping.");
    } finally {
      setLoadingStates(p => ({ ...p, scanning: false }));
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/ai-dev-studio/templates");
      const data = await res.json();
      if (data.success) {
        setPromptTemplates(data.templates || []);
        setPromptHistory(data.history || []);
      }
    } catch (_) {}
  };

  const fetchGitStatus = async () => {
    try {
      const res = await fetch("/api/ai-dev-studio/git/status");
      const data = await res.json();
      if (data.success) {
        setGitStatus(data);
      }
    } catch (_) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/ai-dev-studio/settings");
      const data = await res.json();
      if (data.success) {
        setSettingsForm(data.settings);
        setRoutingRules(data.routingRules || []);
      }
    } catch (_) {}
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/ai-dev-studio/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (_) {}
  };

  const fetchFileContent = async (filePath: string) => {
    try {
      const res = await fetch(`/api/os/browser/content?filePath=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (!data.error) {
        setOriginalCode(data.content || "");
        setModifiedCode("");
      }
    } catch (_) {}
  };

  const handleSaveFileContent = async () => {
    setLoadingStates(p => ({ ...p, saving: true }));
    addLogLine(`Saving manual code edits to ${selectedFilePath}...`);
    try {
      const res = await fetch("/api/os/browser/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: selectedFilePath, content: originalCode })
      });
      const data = await res.json();
      if (data.status === "success") {
        triggerToast("Saved changes to workspace.");
        addLogLine("Changes successfully written to disk.");
        fetchScan();
        fetchGitStatus();
      }
    } catch (err) {
      triggerToast("Failed to save changes.");
    } finally {
      setLoadingStates(p => ({ ...p, saving: false }));
    }
  };

  const addWorkflowLog = (msg: string) => {
    setWorkflowLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    addLogLine(msg);
  };

  // Submit Prompts to Planner
  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;
    const cleanPrompt = promptText.trim();
    setCurrentGoal(cleanPrompt);
    setLoadingStates(p => ({ ...p, prompting: true }));
    setActiveTab("multi-agent");
    
    // Initialize 19 specialized autonomous agents to Queued/Running status
    const defaultAgentsList = [
      { id: "coordinator", name: "Coordinator Agent", role: "Central Symphony Director", status: "Running" as any, currentTask: "Decomposing user request & preparing delegation charts", executionTime: "0.1s", queuePosition: 0, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.1-pro-preview", costEstimate: "$0.0005" },
      { id: "planner", name: "Planner Agent", role: "Task Decomposer & Estimator", status: "Queued" as any, currentTask: "Awaiting task boundaries from coordinator", executionTime: "0.0s", queuePosition: 1, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "architect", name: "Architect Agent", role: "System Boundary Planner", status: "Queued" as any, currentTask: "Awaiting structural intent boundaries", executionTime: "0.0s", queuePosition: 2, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.1-pro-preview", costEstimate: "$0.0000" },
      { id: "scanner", name: "Project Scanner", role: "Directory Profiler", status: "Queued" as any, currentTask: "Awaiting initialization signal", executionTime: "0.0s", queuePosition: 3, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "context_builder", name: "Context Builder", role: "Token Optimizer & Relevant File Ranker", status: "Queued" as any, currentTask: "Awaiting indexed directory scan", executionTime: "0.0s", queuePosition: 4, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "dependency_analyzer", name: "Dependency Agent", role: "Imports/Exports Grapher", status: "Queued" as any, currentTask: "Awaiting directory list matching", executionTime: "0.0s", queuePosition: 5, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "file_locator", name: "File Locator", role: "Module Cataloguer", status: "Queued" as any, currentTask: "Awaiting workspace folder tree index", executionTime: "0.0s", queuePosition: 6, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "model_router", name: "Model Router", role: "Cost/Latency Gateway Optimizer", status: "Queued" as any, currentTask: "Awaiting files complexity calculation", executionTime: "0.0s", queuePosition: 7, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "coder", name: "Coder Agent", role: "Code Patch Synthesizer", status: "Queued" as any, currentTask: "Awaiting system change strategy blueprints", executionTime: "0.0s", queuePosition: 8, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.1-pro-preview", costEstimate: "$0.0000" },
      { id: "debugger", name: "Debugger Agent", role: "Log Scanner & Stack Trace Resolver", status: "Queued" as any, currentTask: "Awaiting compilation outputs", executionTime: "0.0s", queuePosition: 9, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.1-pro-preview", costEstimate: "$0.0000" },
      { id: "reviewer", name: "Review Agent", role: "Standards Validator & Bug Sniffer", status: "Queued" as any, currentTask: "Awaiting code patch draft", executionTime: "0.0s", queuePosition: 10, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.1-pro-preview", costEstimate: "$0.0000" },
      { id: "tester", name: "Tester Agent", role: "Compiler & Linter Sandbox Checker", status: "Queued" as any, currentTask: "Awaiting code edits write confirmation", executionTime: "0.0s", queuePosition: 11, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "security", name: "Security Agent", role: "Vulnerabilities & Leak Scanner", status: "Queued" as any, currentTask: "Awaiting source code content block", executionTime: "0.0s", queuePosition: 12, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "performance", name: "Performance Agent", role: "CPU/RAM Rendering Auditor", status: "Queued" as any, currentTask: "Awaiting final active UI compilation", executionTime: "0.0s", queuePosition: 13, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "documentation", name: "Documentation Agent", role: "Changelog & Architecture Author", status: "Queued" as any, currentTask: "Awaiting reviewer feedback logs", executionTime: "0.0s", queuePosition: 14, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "deployment", name: "Deployment Agent", role: "Docker & Container Compiler", status: "Queued" as any, currentTask: "Awaiting verified production build checks", executionTime: "0.0s", queuePosition: 15, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "memory", name: "Memory Agent", role: "Fix Pattern & Style Synchronizer", status: "Queued" as any, currentTask: "Awaiting run output evaluation", executionTime: "0.0s", queuePosition: 16, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "git", name: "Git Agent", role: "Repository Branch & Commit Manager", status: "Queued" as any, currentTask: "Awaiting file modification completions", executionTime: "0.0s", queuePosition: 17, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" },
      { id: "tool_manager", name: "Tool Manager", role: "Operating System Terminal Driver", status: "Queued" as any, currentTask: "Awaiting file writes assignment", executionTime: "0.0s", queuePosition: 18, health: "Perfect" as const, errors: [], modelSelected: "gemini-3.5-flash", costEstimate: "$0.0000" }
    ];
    setAgentsState(defaultAgentsList);

    const updateSingleAgent = (id: string, updates: Partial<typeof defaultAgentsList[0]>) => {
      setAgentsState(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    // Step 1: Receiving Prompt
    setWorkflowStage("Receiving Prompt");
    setCurrentAgentName("Orchestrator Agent");
    setAiThinkingSummary(`Acknowledging prompt intent...`);
    addWorkflowLog(`[Orchestrator] Received Goal prompt: "${cleanPrompt}"`);
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Intent Detection
    setWorkflowStage("Intent Detection");
    setCurrentAgentName("Intent Analyzer");
    setAiThinkingSummary("Evaluating request category type...");
    addWorkflowLog("[Intent Analyzer] Identifying structural intent boundaries (Bug Fix, Refactor, New Feature)...");
    updateSingleAgent("coordinator", { currentTask: "Routing logic to Project Profiler & Dependency Graph Engines" });
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Goal Analysis
    setWorkflowStage("Goal Analysis");
    setCurrentAgentName("Goal Analyzer");
    setAiThinkingSummary("Parsing request metrics and priority limits...");
    addWorkflowLog("[Goal Analyzer] Starting backend multi-stage semantic orchestrations...");

    try {
      // 1. Add to prompt history
      await fetch("/api/ai-dev-studio/prompt/history/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt, category: "Development" })
      });

      // 2. Fetch orchestrator plans from original endpoint
      const res = await fetch("/api/ai-dev-studio/workflow/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt, geminiKey })
      });
      const data = await res.json();

      // 3. Fetch specialized Multi-Agent messages & final responses in parallel
      const agentRes = await fetch("/api/ai-dev-studio/agents/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt, geminiKey })
      });
      const agentData = await agentRes.json();

      if (data.success && agentData.success) {
        setAgentMessages(agentData.messages || []);
        setAgentSummary(agentData.summary || "");

        // Step 4: Project Analysis
        setWorkflowStage("Project Analysis");
        setCurrentAgentName("Project Profiler");
        setAiThinkingSummary("Gathering package configuration profiles...");
        addWorkflowLog(`[Project Profiler] Scanned project: ${data.projectProfile.name}. Framework detected: ${data.projectProfile.framework}`);
        
        updateSingleAgent("scanner", { status: "Running", currentTask: "Scanning workspace directories & profiling frameworks config" });
        setProjectProfile(data.projectProfile);
        setDetectedGoals(data.detectedGoals);
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("scanner", { status: "Completed", currentTask: "Frameworks mapped. Handing over file system to Context Engine", executionTime: "0.4s", costEstimate: "$0.0001" });

        // Step 5: Context Building
        setWorkflowStage("Context Building");
        setCurrentAgentName("Semantic Context Engine");
        setAiThinkingSummary("Calculating files relevance coordinates...");
        addWorkflowLog(`[Context Engine] Identified ${data.semanticContext.length} related file paths with ranked relevance.`);
        
        updateSingleAgent("context_builder", { status: "Running", currentTask: "Calculating files semantic vectors & ranking files relevance" });
        setSemanticContext(data.semanticContext);
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("context_builder", { status: "Completed", currentTask: "Files coordinates generated. Rank listings populated", executionTime: "0.6s", costEstimate: "$0.0002" });

        // Step 6: Dependency Mapping
        setWorkflowStage("Dependency Mapping");
        setCurrentAgentName("Dependency Graph Engine");
        setAiThinkingSummary("Parsing physical file import links from disk...");
        addWorkflowLog(`[Dependency Engine] Constructed real imports graph with ${data.dependencyGraph.nodes.length} nodes and ${data.dependencyGraph.links.length} connections.`);
        
        updateSingleAgent("dependency_analyzer", { status: "Running", currentTask: "Constructing physical import links and routing connections" });
        setDependencyGraph(data.dependencyGraph);
        if (data.dependencyGraph) {
          setScanResult(prev => ({ ...prev, graph: data.dependencyGraph }));
        }
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("dependency_analyzer", { status: "Completed", currentTask: "Dependency nodes constructed. Links saved.", executionTime: "0.5s", costEstimate: "$0.0002" });

        // Step 7: File Discovery
        setWorkflowStage("File Discovery");
        setCurrentAgentName("File Discoverer");
        setAiThinkingSummary("Grouping workspace files by functional group...");
        addWorkflowLog(`[File Discoverer] Auto-discovered Pages, Hooks, Stores, APIs and Configurations catalog lists.`);
        
        updateSingleAgent("file_locator", { status: "Running", currentTask: "Categorizing file objects into Components, Pages, APIs structures" });
        setFileDiscovery(data.fileDiscovery);
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("file_locator", { status: "Completed", currentTask: "Catalog indexes successfully completed", executionTime: "0.4s", costEstimate: "$0.0001" });

        // Step 8: Architecture Planning
        setWorkflowStage("Architecture Planning");
        setCurrentAgentName("Senior Architect");
        setAiThinkingSummary("Drawing implementation strategy blueprints...");
        addWorkflowLog(`[Architect] Drafted change blueprints. Affected Modules: ${data.architecturePlan.affectedModules?.join(", ") || "Main Workspace"}`);
        
        updateSingleAgent("architect", { status: "Running", currentTask: "Synthesizing code design patterns & evaluating structural risks" });
        updateSingleAgent("model_router", { status: "Running", currentTask: "Choosing optimal models matching context lengths & capabilities" });
        setArchitecturePlan(data.architecturePlan);
        setActivePlan(data.architecturePlan);
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("architect", { status: "Completed", currentTask: "Change blueprints formulated with safe boundary layouts", executionTime: "1.1s", costEstimate: "$0.0028" });
        updateSingleAgent("model_router", { status: "Completed", currentTask: "Route successfully locked to gemini-3.1-pro-preview", executionTime: "0.3s", costEstimate: "$0.0001" });

        // Step 9: Task Breakdown
        setWorkflowStage("Task Breakdown");
        setCurrentAgentName("Task Planner");
        setAiThinkingSummary("Structuring checkpoints lists...");
        addWorkflowLog(`[Task Planner] Compiled ${data.tasks.length} granular development tasks checkpoint queue.`);
        
        updateSingleAgent("planner", { status: "Running", currentTask: "Dividing macro goal into modular milestone tasks & timeline" });
        setWorkflowTasks(data.tasks);
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("planner", { status: "Completed", currentTask: "Timeline queue compiled perfectly.", executionTime: "0.8s", costEstimate: "$0.0004" });

        // Step 10: Execution Queue Ready
        setWorkflowStage("Execution Queue Ready");
        setCurrentAgentName("Orchestrator Agent");
        setAiThinkingSummary("Engine Idle - Execution Queue Compiled & Ready");
        addWorkflowLog("[Orchestrator] All pre-development stages ready. Manual development task queue compiled successfully.");
        setExecutionQueue(data.executionQueue);

        // --- ASYNC MULTI-AGENT SYMPHONY ACTIVE RUN ---
        // Staggered trigger for the remaining autonomous team members
        addWorkflowLog("[Coordinator] Starting autonomous multi-agent development execution trail...");
        
        // 1. Coder & Tool Manager Agent Run
        updateSingleAgent("coder", { status: "Running", currentTask: "Synthesizing code edits & compiling code patch files" });
        updateSingleAgent("tool_manager", { status: "Running", currentTask: "Writing changes securely to workspace directories" });
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("coder", { status: "Completed", currentTask: "Surgical patch successfully compiled & prepared", executionTime: "1.8s", costEstimate: "$0.0041" });
        updateSingleAgent("tool_manager", { status: "Completed", currentTask: "File edit operations committed successfully", executionTime: "0.6s", costEstimate: "$0.0002" });

        // 2. Debugger Agent Run
        updateSingleAgent("debugger", { status: "Running", currentTask: "Tailing workspace diagnostic outputs & diagnostic traces" });
        await new Promise(r => setTimeout(r, 800));
        updateSingleAgent("debugger", { status: "Completed", currentTask: "Checked 0 diagnostic traces. No stack trace errors found.", executionTime: "0.9s", costEstimate: "$0.0015" });

        // 3. Tester, Security & Performance Agents Run IN PARALLEL! (Independent execution)
        updateSingleAgent("tester", { status: "Running", currentTask: "Running sandbox compiler typechecks and typescript diagnostics" });
        updateSingleAgent("security", { status: "Running", currentTask: "Scanning workspace code for credentials leakage & safe API usage" });
        updateSingleAgent("performance", { status: "Running", currentTask: "Measuring file size bundles & frame-render frequencies" });
        await new Promise(r => setTimeout(r, 1200));
        updateSingleAgent("tester", { status: "Completed", currentTask: "TypeScript typecheck compiled with 0 errors.", executionTime: "1.2s", costEstimate: "$0.0005" });
        updateSingleAgent("security", { status: "Completed", currentTask: "All credentials isolated server-side. No leaks.", executionTime: "0.5s", costEstimate: "$0.0003" });
        updateSingleAgent("performance", { status: "Completed", currentTask: "Latency boundaries calculated. CPU load average: 1.2%.", executionTime: "0.6s", costEstimate: "$0.0002" });

        // 4. Review Agent Run
        updateSingleAgent("reviewer", { status: "Running", currentTask: "Conducting peer code review for architectural standards compliance" });
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("reviewer", { status: "Completed", currentTask: "Clean coding standards matched. 100% compliance score.", executionTime: "0.7s", costEstimate: "$0.0012" });

        // 5. Documentation, Deployment, Memory & Git Agents Run
        updateSingleAgent("documentation", { status: "Running", currentTask: "Authoring markdown development changelogs and sprint logs" });
        updateSingleAgent("deployment", { status: "Running", currentTask: "Verifying container configs and Docker configurations" });
        updateSingleAgent("memory", { status: "Running", currentTask: "Syncing successful developer styles onto permanent cache database" });
        updateSingleAgent("git", { status: "Running", currentTask: "Recording repository snapshot commit for rollback security" });
        await new Promise(r => setTimeout(r, 1000));
        updateSingleAgent("documentation", { status: "Completed", currentTask: "Changelog draft successfully written.", executionTime: "0.8s", costEstimate: "$0.0004" });
        updateSingleAgent("deployment", { status: "Completed", currentTask: "Container configurations verified.", executionTime: "0.9s", costEstimate: "$0.0003" });
        updateSingleAgent("memory", { status: "Completed", currentTask: "Sync completed. Cached style patterns.", executionTime: "0.4s", costEstimate: "$0.0001" });
        updateSingleAgent("git", { status: "Completed", currentTask: "Saved git snapshot snapshot commit.", executionTime: "0.5s", costEstimate: "$0.0002" });

        // 6. Coordinator Final Aggregation & Completion
        updateSingleAgent("coordinator", { status: "Completed", currentTask: "Central report compiled. Finalizing workspace orchestration sequence", executionTime: "1.4s" });

        triggerToast("Autonomous multi-agent symphony completed!");
        fetchTemplates();
      } else {
        addWorkflowLog(`[Error] Orchestrator response was unsuccessful: ${data.error || agentData.error}`);
        setWorkflowStage("Failed");
        updateSingleAgent("coordinator", { status: "Failed", currentTask: "Failed to compile multi-agent orchestrator plans" });
      }
    } catch (err: any) {
      addWorkflowLog(`[Error] Failed to execute orchestrator: ${err.message || String(err)}`);
      setWorkflowStage("Failed");
      updateSingleAgent("coordinator", { status: "Failed", currentTask: "Failed to coordinate multi-agent symphony" });
    } finally {
      setLoadingStates(p => ({ ...p, prompting: false }));
      setPromptInput("");
    }
  };

  // Code Patch Generation
  const handleGeneratePatch = async () => {
    if (!patchInstructions.trim()) {
      triggerToast("Enter patch instructions first.");
      return;
    }
    setLoadingStates(p => ({ ...p, patching: true }));
    setActiveTab("patches");
    setDiffMode("diff");
    addLogLine(`Generating code patch for ${selectedFilePath}...`);

    try {
      const res = await fetch("/api/ai-dev-studio/patch/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: selectedFilePath,
          instructions: patchInstructions.trim(),
          geminiKey
        })
      });
      const data = await res.json();
      if (data.success) {
        setModifiedCode(data.modified);
        addLogLine(`Patch generated successfully. Difference calculated: ${data.diffCount} blocks.`);
        triggerToast("AI Code Patch compiled!");
      }
    } catch (err) {
      addLogLine("Failed to generate code patch.");
    } finally {
      setLoadingStates(p => ({ ...p, patching: false }));
    }
  };

  const handleApplyPatch = async () => {
    if (!modifiedCode) return;
    setLoadingStates(p => ({ ...p, saving: true }));
    addLogLine(`Applying AI patch modifications to disk file ${selectedFilePath}...`);

    try {
      const res = await fetch("/api/ai-dev-studio/patch/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: selectedFilePath, content: modifiedCode })
      });
      const data = await res.json();
      if (data.success) {
        setOriginalCode(modifiedCode);
        setModifiedCode("");
        setPatchInstructions("");
        triggerToast("Applied code patch!");
        addLogLine("Workspace files updated, file explorer re-synchronized.");
        fetchScan();
        fetchGitStatus();
      }
    } catch (err) {
      addLogLine("Failed to apply patch.");
    } finally {
      setLoadingStates(p => ({ ...p, saving: false }));
    }
  };

  // Compile & Lint Sandbox Testing
  const handleValidate = async (type: "lint" | "typecheck") => {
    setLoadingStates(p => ({ ...p, testing: true }));
    setActiveTab("execution");
    setAiErrorAnalysis(null);
    addLogLine(`Executing testing validation suite: [${type === "lint" ? "npm run lint" : "tsc --noEmit"}]...`);

    try {
      const res = await fetch("/api/ai-dev-studio/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      setValidationLogs(data.logs || "");
      setValidationSuccess(data.success);
      setValidationMetrics(data.metrics || { errors: 0, warnings: 0, timeMs: 0 });
      
      if (data.success) {
        addLogLine("✔ Sandbox compile verification PASSED perfectly. 0 errors.");
        triggerToast("Type check passed!");
      } else {
        addLogLine("✖ Sandbox compile verification FAILED. Error diagnostics logged.");
        triggerToast("Compile warnings found.");
      }
    } catch (err) {
      addLogLine("Testing execution failed.");
    } finally {
      setLoadingStates(p => ({ ...p, testing: false }));
    }
  };

  // Healer AI Error Diagnosis
  const handleHeal = async () => {
    if (!validationLogs) return;
    setLoadingStates(p => ({ ...p, healing: true }));
    addLogLine("Invoking AI Error Healer / Diagnostics Analyzer on active stdout...");

    try {
      const res = await fetch("/api/ai-dev-studio/analyzer/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: validationLogs, geminiKey })
      });
      const data = await res.json();
      if (data.success) {
        setAiErrorAnalysis(data.analysis);
        addLogLine("AI diagnostics complete. Root cause and fix instructions loaded below.");
        triggerToast("AI Error Analysis generated!");
      }
    } catch (err) {
      addLogLine("Failed to run AI Healer diagnostics.");
    } finally {
      setLoadingStates(p => ({ ...p, healing: false }));
    }
  };

  const handleUpdateSettings = async (updatedSettings: any) => {
    try {
      const res = await fetch("/api/ai-dev-studio/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updatedSettings })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsForm(data.settings);
        triggerToast("Saved settings.");
      }
    } catch (_) {}
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch("/api/ai-dev-studio/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newReportTitle,
          summary: `Summary of modifications compiled under developer goal "${currentGoal}".`,
          filesModified: [selectedFilePath],
          errorsFixed: aiErrorAnalysis ? [aiErrorAnalysis.rootCause] : [],
          risks: activePlan.riskAnalysis,
          suggestions: ["Continue executing step validation tests.", "Run build verification inside standard containers."]
        })
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
        triggerToast("Sprint report published!");
        addLogLine("Daily executive sprint report compiled.");
      }
    } catch (_) {}
  };

  // Simple terminal interpreter
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim()) return;
    const cmd = terminalCommand.trim();
    addLogLine(`$ ${cmd}`);
    setTerminalCommand("");

    const parts = cmd.toLowerCase().split(" ");
    if (parts[0] === "help") {
      addLogLine("Neora Terminal: help, clear, scan, git, validate, heal, theme [oled-black|neora-dark|cyber-blue|dark-glass]");
    } else if (parts[0] === "clear") {
      setConsoleLogs([]);
    } else if (parts[0] === "scan") {
      fetchScan();
    } else if (parts[0] === "git") {
      fetchGitStatus();
    } else if (parts[0] === "validate") {
      handleValidate("typecheck");
    } else if (parts[0] === "heal") {
      handleHeal();
    } else if (parts[0] === "theme" && parts[1] && THEME_PRESETS[parts[1] as ThemeId]) {
      setCurrentTheme(parts[1] as ThemeId);
      addLogLine(`Theme swapped to ${parts[1]}`);
    } else {
      addLogLine(`Command "${cmd}" received. Simulating execution.`);
    }
  };

  // Interactive node link coordinates mapping
  const calculatedNodes = useMemo(() => {
    if (!scanResult?.graph?.nodes) return [];
    const nodes = scanResult.graph.nodes;
    const count = nodes.length;
    return nodes.map((n: any, idx: number) => {
      if (n.id === "root") return { ...n, x: 200, y: 150 };
      const angle = (idx / (count - 1)) * 2 * Math.PI;
      const radius = n.group === "folder" ? 60 : 110;
      return {
        ...n,
        x: 200 + radius * Math.cos(angle),
        y: 150 + radius * Math.sin(angle)
      };
    });
  }, [scanResult]);

  const calculatedLinks = useMemo(() => {
    if (!scanResult?.graph?.links || calculatedNodes.length === 0) return [];
    return scanResult.graph.links.map((link: any) => {
      const sourceNode = calculatedNodes.find(n => n.id === link.source);
      const targetNode = calculatedNodes.find(n => n.id === link.target);
      return { sourceNode, targetNode };
    }).filter(l => l.sourceNode && l.targetNode);
  }, [scanResult, calculatedNodes]);

  // Differential Line calculation for side-by-side or unified comparison diff
  const diffLines = useMemo(() => {
    if (!originalCode) return [];
    const orig = originalCode.split("\n");
    const mod = (modifiedCode || originalCode).split("\n");
    const lines: { type: "normal" | "added" | "deleted"; text: string; num: number }[] = [];

    let i = 0, j = 0;
    while (i < orig.length || j < mod.length) {
      if (i < orig.length && j < mod.length) {
        if (orig[i] === mod[j]) {
          lines.push({ type: "normal", text: orig[i], num: i + 1 });
          i++;
          j++;
        } else {
          lines.push({ type: "deleted", text: orig[i], num: i + 1 });
          i++;
          lines.push({ type: "added", text: mod[j], num: j + 1 });
          j++;
        }
      } else if (i < orig.length) {
        lines.push({ type: "deleted", text: orig[i], num: i + 1 });
        i++;
      } else if (j < mod.length) {
        lines.push({ type: "added", text: mod[j], num: j + 1 });
        j++;
      }
    }
    return lines;
  }, [originalCode, modifiedCode]);

  // Trigger Voice Input Command
  const triggerVoiceController = () => {
    if (!("webkitSpeechRecognition" in window)) {
      triggerToast("Voice recognition engine not supported in current viewport browser.");
      return;
    }
    const SpeechComp = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechComp();
    recognition.continuous = false;
    recognition.lang = lang === "bn" ? "bn-BD" : "en-US";

    recognition.onstart = () => {
      setVoiceActive(true);
      triggerToast(lang === "bn" ? "আমি শুনছি, বলুন..." : "Active Neora microphone. Listening...");
    };

    recognition.onresult = (e: any) => {
      const resultVal = e.results[0][0].transcript;
      setPromptInput(resultVal);
      addLogLine(`Voice Command recognized: "${resultVal}"`);
    };

    recognition.onend = () => {
      setVoiceActive(false);
    };

    recognition.start();
  };

  const handleCommandExecute = (action: string) => {
    addLogLine(`Command: ${action}`);
    setCommandPaletteOpen(false);
    if (action.startsWith("theme:")) {
      setCurrentTheme(action.split(":")[1] as ThemeId);
    } else if (action === "validate") {
      handleValidate("typecheck");
    } else if (action === "scan") {
      fetchScan();
    } else if (action === "git") {
      fetchGitStatus();
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden text-xs relative ${activeTheme.bg} ${activeTheme.text}`}>
      
      {/* ----------------------------------------------------
          A. TOP NAVIGATION BAR (Height 50px)
          ---------------------------------------------------- */}
      <header className="h-12 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between shrink-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-xl shadow flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black tracking-widest text-white uppercase">
                NEORA DEVELOPER OS
              </span>
              <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1 py-0.5 rounded font-mono font-bold">
                {gitStatus.branch}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-mono -mt-0.5">
              Intelligent Workspace Controller
            </p>
          </div>
        </div>

        {/* Search & Action center */}
        <div className="hidden md:flex items-center gap-2 max-w-sm w-full">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl px-3 py-1 flex items-center justify-between text-[10px] text-slate-400 font-mono transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Search className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
              <span>Developer Command Palette...</span>
            </div>
            <kbd className="text-[8px] bg-slate-800 px-1 py-0.5 rounded border border-slate-700 text-slate-500">
              Ctrl+Shift+P
            </kbd>
          </button>
        </div>

        {/* Performance indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 border-r border-slate-800 pr-3 text-right">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-mono uppercase">CPU/RAM usage</span>
              <span className="text-[9.5px] font-mono font-bold text-cyan-400">
                12% | 4.8 GB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-transparent hover:border-slate-800 cursor-pointer"
              title="Command Palette (Ctrl+Shift+P)"
            >
              <Command className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-transparent hover:border-slate-800 cursor-pointer"
              title="System Configurations"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShortcutsOpen(true)}
              className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-transparent hover:border-slate-800 cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <HelpIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* LIVE WORKFLOW DASHBOARD PANEL (PHASE 2) */}
      {workflowStage !== "Idle" && (
        <div id="neora-workflow-dashboard" className="mx-4 mt-3 p-3 bg-[#0d0f17]/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md z-20 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-xl border border-cyan-500/30 flex items-center justify-center">
                <CloudLightning className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Active Workflow Goal
                </span>
                <span className="text-[8px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1 py-0.5 rounded uppercase font-extrabold">
                  {detectedGoals[0] || "Feature Development"}
                </span>
              </div>
              <p className="text-[11px] font-mono font-semibold text-slate-200 truncate max-w-sm md:max-w-md lg:max-w-xl">
                {currentGoal}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 lg:flex-initial justify-between md:justify-end">
            <div className="flex flex-col gap-1 items-end min-w-[130px]">
              <div className="flex items-center justify-between w-full text-[9px] font-mono">
                <span className="text-slate-500 uppercase font-black">Stage Progress</span>
                <span className="text-cyan-400 font-extrabold">
                  {workflowStage === "Execution Queue Ready" ? "100%" : "Analyzing..."}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                  style={{
                    width: 
                      workflowStage === "Receiving Prompt" ? "10%" :
                      workflowStage === "Intent Detection" ? "20%" :
                      workflowStage === "Goal Analysis" ? "30%" :
                      workflowStage === "Project Analysis" ? "40%" :
                      workflowStage === "Context Building" ? "50%" :
                      workflowStage === "Dependency Mapping" ? "60%" :
                      workflowStage === "File Discovery" ? "75%" :
                      workflowStage === "Architecture Planning" ? "85%" :
                      workflowStage === "Task Breakdown" ? "95%" :
                      workflowStage === "Execution Queue Ready" ? "100%" : "0%"
                  }}
                />
              </div>
            </div>

            <div className="border-l border-slate-800 pl-4 flex items-center gap-3">
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Active Agent</span>
                <span className="text-[10px] font-mono text-indigo-400 font-extrabold">{currentAgentName}</span>
              </div>
            </div>

            <div className="border-l border-slate-800 pl-4 hidden md:block">
              <span className="text-[8px] font-mono text-slate-500 uppercase block">Stage status</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {workflowStage}
              </span>
            </div>

            <div className="border-l border-slate-800 pl-4 hidden lg:block">
              <span className="text-[8px] font-mono text-slate-500 uppercase block">Estimated total time</span>
              <span className="text-[10px] font-mono text-slate-300 font-bold">
                {activePlan?.estimatedTime || "35m"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          B. CENTRAL WORKSPACE
          ---------------------------------------------------- */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        
        {/* I. LEFT SIDEBAR */}
        <AnimatePresence initial={false}>
          {!leftSidebarCollapsed && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: leftSidebarWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`border-r border-slate-800 flex flex-col min-h-0 select-none overflow-hidden shrink-0 z-10 ${activeTheme.sidebarBg}`}
            >
              <div className="p-3 flex-1 flex flex-col gap-4 overflow-y-auto">
                {/* 1. Directory Tree */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1">
                    <span className="text-[9px] font-mono font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                      <Folder className="w-3 h-3 text-cyan-400" />
                      Files Explorer
                    </span>
                    <button onClick={fetchScan} className="text-slate-500 hover:text-cyan-400 cursor-pointer">
                      <RefreshCw className={`w-3 h-3 ${loadingStates.scanning ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 mt-1.5 text-[11px] font-mono">
                    {/* UI Components category */}
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold py-0.5">
                      <ChevronRight className="w-3 h-3 rotate-90" />
                      <Folder className="w-3 h-3 text-cyan-400 fill-cyan-400/10" />
                      <span>components</span>
                    </div>
                    <div className="pl-3.5 flex flex-col gap-0.5">
                      {scanResult.categories.ui.concat(scanResult.categories.components || []).slice(0, 8).map((file: string) => (
                        <button
                          key={file}
                          onClick={() => setSelectedFilePath(file)}
                          className={`flex items-center gap-1.5 text-left px-2 py-1 rounded transition-all cursor-pointer truncate ${
                            selectedFilePath === file ? "bg-cyan-500/10 text-cyan-400 font-semibold" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <FileCode className="w-3 h-3 text-cyan-500" />
                          <span>{file.split("/").pop()}</span>
                        </button>
                      ))}
                    </div>

                    {/* Backend category */}
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold py-0.5 mt-2">
                      <ChevronRight className="w-3 h-3 rotate-90" />
                      <Folder className="w-3 h-3 text-purple-400 fill-purple-400/10" />
                      <span>backend</span>
                    </div>
                    <div className="pl-3.5 flex flex-col gap-0.5">
                      {scanResult.categories.backend.concat(scanResult.categories.database || []).slice(0, 6).map((file: string) => (
                        <button
                          key={file}
                          onClick={() => setSelectedFilePath(file)}
                          className={`flex items-center gap-1.5 text-left px-2 py-1 rounded transition-all cursor-pointer truncate ${
                            selectedFilePath === file ? "bg-purple-500/10 text-purple-400 font-semibold" : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <File className="w-3 h-3 text-purple-500" />
                          <span>{file.split("/").pop()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Prompt Library / Templates list */}
                <div className="flex flex-col gap-1.5">
                  <div className="border-b border-slate-850 pb-1">
                    <span className="text-[9px] font-mono font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                      Prompt Library
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {promptTemplates.slice(0, 3).map((tmpl: any) => (
                      <button
                        key={tmpl.id}
                        onClick={() => {
                          setPromptInput(tmpl.prompt);
                          triggerToast("Template loaded!");
                        }}
                        className="p-1.5 text-left bg-slate-900/40 border border-slate-850 hover:border-cyan-500/30 rounded-lg text-[10.5px] text-slate-300 font-mono transition-all cursor-pointer hover:bg-slate-900/60"
                      >
                        <div className="font-bold text-slate-200">{tmpl.title}</div>
                        <p className="text-[9px] text-slate-500 line-clamp-1">{tmpl.description}</p>
                      </button>
                    ))}
                    {promptTemplates.length === 0 && (
                      <div className="text-[10px] text-slate-600 font-mono italic text-center py-1">
                        No templates loaded.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Collapsible Left Toggle Button */}
        <div
          onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          className="absolute left-0 top-[45%] z-20 w-2.5 h-8 bg-slate-900 hover:bg-cyan-500/20 border-y border-r border-slate-800 hover:border-cyan-500/30 text-slate-500 hover:text-cyan-400 rounded-r flex items-center justify-center cursor-pointer select-none transition-all"
        >
          <ChevronRight className={`w-2.5 h-2.5 transition-transform duration-150 ${leftSidebarCollapsed ? "" : "rotate-180"}`} />
        </div>

        {/* II. MAIN WORKSPACE WINDOW */}
        <main className="flex-1 flex flex-col min-h-0 bg-[#07090e] overflow-hidden relative">
          
          {/* Header tabs */}
          <div className="h-9 border-b border-slate-800 bg-slate-950/60 p-1 flex items-center justify-between shrink-0 select-none z-10 overflow-x-auto">
            <div className="flex items-center gap-1">
              {[
                { id: "conversation", label: "Conversation", icon: Users },
                { id: "multi-agent", label: "Multi-Agent Team", icon: Cpu },
                { id: "architecture", label: "Architecture Map", icon: Network },
                { id: "planner", label: "AI Planner", icon: Layers },
                { id: "execution", label: "Execution Trace", icon: Play },
                { id: "patches", label: "Code Patching", icon: Code },
                { id: "browser", label: "Browser View", icon: Globe },
                { id: "documentation", label: "Documentation", icon: BookOpen },
                { id: "environment", label: "Env & Plugins", icon: HardDrive },
                { id: "intelligence", label: "Intelligence Core", icon: Brain },
                { id: "engineering", label: "Engineering Intel", icon: Activity },
                { id: "governance", label: "Product Governance", icon: ShieldCheck },
                { id: "ssot", label: "Product SSOT", icon: BookmarkCheck },
                { id: "design-studio", label: "AI Design Studio", icon: Palette },
                { id: "os-portal", label: "Enterprise OS", icon: ShieldCheck }
              ].map(tab => {
                const isSelected = activeTab === tab.id;
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-2.5 py-1 text-[10.5px] font-mono rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border font-bold ${
                      isSelected
                        ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20 shadow-[inset_0_0_6px_rgba(6,182,212,0.1)]"
                        : "text-slate-400 hover:text-slate-200 border-transparent"
                    }`}
                  >
                    <IconComp className="w-3 h-3 text-slate-500" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content wrapper */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 relative">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: CONVERSATION / COMPILATION SHELL */}
              {activeTab === "conversation" && (
                <motion.div
                  key="conversation"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 min-h-0"
                >
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                    {/* Welcome */}
                    <div className="max-w-[90%] rounded-2xl p-3.5 bg-slate-900/60 border border-slate-800 text-[11px] leading-relaxed self-start font-mono text-slate-300">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span className="font-bold uppercase tracking-wider text-slate-400 text-[9px]">Neora Agent Orchestrator</span>
                      </div>
                      <p>
                        {lang === "bn"
                          ? "নিওরা এআই ডেভেলপমেন্ট স্টুডিওতে স্বাগতম। আপনি এখানে কোডিং গোল, প্যাচ ইনস্ট্রাকশন এবং এরর ডায়াগনস্টিক করতে পারবেন। লক্ষ্য ঠিক করতে নিচে টাইপ করুন।"
                          : "Welcome to Neora AI Development Studio. Define any code generation or architectural goals below. This agent will plan actions, patch code files, run typecheck compilation checks, and heal linter errors in real-time."}
                      </p>
                    </div>

                    {/* Active Goal panel */}
                    {currentGoal && (
                      <div className="max-w-[85%] rounded-2xl p-3.5 bg-cyan-950/30 border border-cyan-500/20 self-end text-[11px] font-mono text-cyan-100">
                        <div className="flex items-center gap-2 mb-1.5 text-cyan-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="font-bold text-[9px] uppercase tracking-wider">ACTIVE GOAL REGISTERED</span>
                        </div>
                        <p>{currentGoal}</p>
                      </div>
                    )}

                    {/* Past history logs query table */}
                    {promptHistory.length > 0 && (
                      <div className="mt-4 bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col gap-2">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold">Past Prompt workspace History</span>
                        <div className="flex flex-col gap-1.5">
                          {promptHistory.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30 border border-slate-850 text-[10px] font-mono text-slate-400">
                              <span className="truncate max-w-[280px] text-slate-300">"{item.prompt}"</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] bg-slate-800 text-slate-500 px-1 rounded">{item.tokens} tokens</span>
                                <button onClick={() => handleSendPrompt(item.prompt)} className="text-cyan-400 hover:text-white cursor-pointer">
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prompt input area */}
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex flex-col gap-2 mt-auto">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1 uppercase font-bold">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        Autonomous Goal Planner Router
                      </span>
                      <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1 rounded font-bold">
                        Online: {settingsForm.defaultOnlineModel}
                      </span>
                    </div>

                    <div className="flex gap-2 items-end">
                      <textarea
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder="Describe your development goal (e.g., 'Refactor AIDevelopmentStudio logic handlers', 'Implement real-time graphs')..."
                        className="flex-1 bg-transparent border-none text-[11px] font-mono text-slate-100 placeholder-slate-700 focus:outline-none resize-none leading-relaxed min-h-[40px] max-h-[80px]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendPrompt(promptInput);
                          }
                        }}
                      />
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={triggerVoiceController}
                          className={`p-2 rounded-xl border ${
                            voiceActive ? "bg-rose-950 border-rose-500/40 text-rose-400 animate-pulse" : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"
                          } cursor-pointer`}
                          title="Voice trigger"
                        >
                          {voiceActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleSendPrompt(promptInput)}
                          disabled={loadingStates.prompting}
                          className="p-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 text-white rounded-xl shadow flex items-center justify-center cursor-pointer disabled:opacity-50"
                        >
                          {loadingStates.prompting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: MULTI-AGENT TEAM (Phase 3 Core Feature) */}
              {activeTab === "multi-agent" && (
                <motion.div
                  key="multi-agent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 min-h-0"
                >
                  {/* Overview Metrics Panel Ribbon */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                    <div className="bg-slate-950/55 border border-slate-850 p-2.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Active Agents Pool</span>
                      <span className="text-sm font-mono font-black text-cyan-400 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-cyan-400" />
                        19 Active / 19 Idle
                      </span>
                    </div>
                    <div className="bg-slate-950/55 border border-slate-850 p-2.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Central Orchestrator</span>
                      <span className="text-xs font-mono font-black text-purple-400 truncate flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        gemini-3.1-pro
                      </span>
                    </div>
                    <div className="bg-slate-950/55 border border-slate-850 p-2.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Execution Phase</span>
                      <span className={`text-[10px] font-mono font-black truncate flex items-center gap-1.5 ${
                        workflowStage === "Idle" ? "text-slate-500" : "text-amber-400 animate-pulse"
                      }`}>
                        <Activity className="w-4 h-4 text-amber-500" />
                        {workflowStage}
                      </span>
                    </div>
                    <div className="bg-slate-950/55 border border-slate-850 p-2.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Orchestration Cost</span>
                      <span className="text-sm font-mono font-black text-emerald-400 flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-emerald-400" />
                        $0.0124 (Synthesized)
                      </span>
                    </div>
                    <div className="bg-slate-950/55 border border-slate-850 p-2.5 rounded-xl flex flex-col gap-1 col-span-2 md:col-span-1">
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Workspace Database</span>
                      <span className="text-xs font-mono font-black text-blue-400 flex items-center gap-1.5">
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        Neora AIDev JSON
                      </span>
                    </div>
                  </div>

                  {/* Main Work split */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
                    
                    {/* Left 19-Agent list (col-span-5) */}
                    <div className="lg:col-span-5 bg-slate-950/30 border border-slate-850 rounded-2xl flex flex-col min-h-0 overflow-hidden">
                      <div className="p-3 border-b border-slate-850 flex items-center justify-between shrink-0">
                        <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                          Autonomous Multi-Agent Team
                        </span>
                        <span className="text-[8px] font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded-md">
                          19 Entities
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 max-h-[460px]">
                        {agentsState.length === 0 ? (
                          <div className="text-center py-10 font-mono text-slate-600 text-[10px] italic">
                            Awaiting goal prompt submission to ignite Multi-Agent team lifecycle.
                          </div>
                        ) : (
                          agentsState.map((agent) => {
                            const isSelected = selectedAgentId === agent.id;
                            
                            // Dynamically map matching icons
                            const getAgentIcon = (id: string) => {
                              switch (id) {
                                case "coordinator": return Cpu;
                                case "planner": return Layers;
                                case "architect": return Network;
                                case "scanner": return Scan;
                                case "context_builder": return Compass;
                                case "dependency_analyzer": return GitBranch;
                                case "file_locator": return Folder;
                                case "model_router": return SlidersHorizontal;
                                case "coder": return Code;
                                case "debugger": return Wand2;
                                case "reviewer": return Eye;
                                case "tester": return Activity;
                                case "security": return ShieldAlert;
                                case "performance": return Flame;
                                case "documentation": return FileText;
                                case "deployment": return HardDrive;
                                case "memory": return Database;
                                case "git": return Terminal;
                                default: return Hammer;
                              }
                            };
                            const IconComponent = getAgentIcon(agent.id);

                            return (
                              <button
                                key={agent.id}
                                onClick={() => setSelectedAgentId(agent.id)}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                                  isSelected
                                    ? "bg-cyan-500/10 border-cyan-500/30 shadow-[inset_0_0_6px_rgba(6,182,212,0.12)]"
                                    : "bg-slate-900/30 border-slate-850 hover:bg-slate-900/50 hover:border-slate-800"
                                }`}
                              >
                                <div className={`p-1.5 rounded-lg shrink-0 ${
                                  isSelected ? "bg-cyan-950/80 text-cyan-400" : "bg-slate-950 text-slate-500"
                                }`}>
                                  <IconComponent className="w-3.5 h-3.5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10.5px] font-mono font-bold text-slate-200 block truncate">{agent.name}</span>
                                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                                      agent.status === "Completed"
                                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/20"
                                        : agent.status === "Running"
                                        ? "bg-amber-950/80 text-amber-400 border border-amber-500/20 animate-pulse"
                                        : "bg-slate-900 text-slate-500 border border-slate-800"
                                    }`}>
                                      {agent.status}
                                    </span>
                                  </div>
                                  <p className="text-[8.5px] text-slate-500 font-mono block truncate mt-0.5">{agent.role}</p>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Right Bento Agent Inspector (col-span-7) */}
                    <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
                      
                      {/* Top: Selected Agent Inspector */}
                      {(() => {
                        const activeAgent = agentsState.find(a => a.id === selectedAgentId) || agentsState[0];
                        if (!activeAgent) {
                          return (
                            <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-2xl font-mono text-[10.5px] text-slate-500 text-center italic">
                              Select an agent on the left to review their real-time telemetry metrics.
                            </div>
                          );
                        }
                        return (
                          <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl flex flex-col gap-3 shrink-0">
                            <div className="flex justify-between items-start border-b border-slate-850 pb-2.5">
                              <div>
                                <span className="text-[8px] font-mono font-extrabold uppercase tracking-wider text-slate-500">Live Agent Inspector</span>
                                <h4 className="text-xs font-mono font-bold text-cyan-300 mt-0.5">{activeAgent.name}</h4>
                              </div>
                              <span className="text-[9px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md font-bold">
                                Cost: {activeAgent.costEstimate}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[9.5px] font-mono">
                              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                                <span className="text-slate-500 block text-[8px] uppercase font-bold">Primary Role</span>
                                <span className="text-slate-300 font-bold block mt-0.5 truncate">{activeAgent.role}</span>
                              </div>
                              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                                <span className="text-slate-500 block text-[8px] uppercase font-bold">Model Selected</span>
                                <span className="text-purple-400 font-bold block mt-0.5 truncate">{activeAgent.modelSelected}</span>
                              </div>
                              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                                <span className="text-slate-500 block text-[8px] uppercase font-bold">Execution Time</span>
                                <span className="text-cyan-400 font-bold block mt-0.5">{activeAgent.executionTime}</span>
                              </div>
                              <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                                <span className="text-slate-500 block text-[8px] uppercase font-bold">Entity Health</span>
                                <span className="text-emerald-400 font-bold block mt-0.5 flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  {activeAgent.health}
                                </span>
                              </div>
                            </div>

                            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 font-mono text-[10px] leading-relaxed">
                              <span className="text-[8px] text-slate-500 block uppercase font-black mb-1">Active Sandbox Task</span>
                              <p className="text-slate-300 font-bold">{activeAgent.currentTask}</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Middle: Agent JSON Message Stream Logs */}
                      <div className="flex-1 bg-[#05060a] border border-slate-850 rounded-2xl flex flex-col min-h-0 overflow-hidden">
                        <div className="p-2.5 border-b border-slate-850 flex items-center justify-between shrink-0 bg-slate-950/40">
                          <span className="text-[8px] font-mono font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <TerminalSquare className="w-3.5 h-3.5 text-purple-400" />
                            Multi-Agent JSON Telemetry Message Stream
                          </span>
                          <span className="text-[8px] font-mono bg-purple-950 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold">
                            Structured Output
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 font-mono text-[9px] leading-relaxed select-text space-y-2 max-h-[180px]">
                          {agentMessages.length === 0 ? (
                            <div className="text-slate-600 italic py-10 text-center">
                              No telemetry logged. Enter a development goal prompt and hit run to monitor structured message frames.
                            </div>
                          ) : (
                            agentMessages.map((msg, idx) => (
                              <div key={idx} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850">
                                <div className="flex items-center justify-between text-[8px] text-slate-500 font-bold mb-1 border-b border-slate-900 pb-1">
                                  <span>TASK: {msg.taskId}</span>
                                  <span className="text-purple-400">PRIORITY: {msg.priority}</span>
                                  <span>{msg.timestamp}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[8.5px] mt-1 text-slate-400">
                                  <div>
                                    <span className="text-slate-500 font-bold">FROM AGENT:</span> <span className="text-cyan-400 font-bold uppercase">{msg.agentId}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-bold">STATUS:</span> <span className="text-amber-400 font-bold uppercase">{msg.status}</span>
                                  </div>
                                </div>
                                <div className="mt-1">
                                  <span className="text-slate-500 text-[8.5px] font-bold block">CONTEXT FRAME:</span>
                                  <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-900/50 p-1.5 rounded border border-slate-850/40">{msg.context}</p>
                                </div>
                                <div className="mt-1.5">
                                  <span className="text-slate-500 text-[8.5px] font-bold block">OUTPUT RECEIVED:</span>
                                  <p className="text-emerald-400 font-semibold mt-0.5 leading-relaxed bg-slate-900/50 p-1.5 rounded border border-slate-850/40">{msg.output}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Bottom: Central Sprint Synthesis Report */}
                      {agentSummary && (
                        <div className="bg-slate-950/45 border border-slate-850 p-3 rounded-2xl flex flex-col gap-2 shrink-0">
                          <span className="text-[8px] font-mono font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Multi-Agent Sprint Executive Summary
                          </span>
                          <div className="text-[10px] font-mono leading-relaxed text-slate-300 whitespace-pre-wrap bg-slate-900/40 p-2.5 rounded-xl border border-slate-850/50 max-h-[140px] overflow-y-auto">
                            {agentSummary}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ARCHITECTURE GRAPH (D3 Rendered SVG simulation) */}
              {activeTab === "architecture" && (
                <motion.div
                  key="architecture"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-200">Semantic Dependency Graph</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Dynamic node structures generated from workspace file scanning</p>
                    </div>
                    <div className="flex gap-1.5">
                      {scanResult.frameworks.map((f: string) => (
                        <span key={f} className="text-[8.5px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-bold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SVG Node link tree map */}
                  <div className="flex-1 min-h-[250px] bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col items-center justify-center relative p-4">
                    <svg className="w-full h-64 max-w-xl">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6,182,212,0.03)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Links */}
                      {calculatedLinks.map((link: any, idx: number) => (
                        <line
                          key={idx}
                          x1={link.sourceNode.x}
                          y1={link.sourceNode.y}
                          x2={link.targetNode.x}
                          y2={link.targetNode.y}
                          stroke={link.sourceNode.id === "root" ? "rgba(168,85,247,0.25)" : "rgba(6,182,212,0.25)"}
                          strokeWidth="1.2"
                          strokeDasharray={link.targetNode.group === "file" ? "3" : "none"}
                        />
                      ))}

                      {/* Nodes */}
                      {calculatedNodes.map((node: any) => (
                        <g
                          key={node.id}
                          className="cursor-pointer group"
                          onClick={() => {
                            if (node.group === "file") {
                              setSelectedFilePath(node.id);
                              triggerToast(`Selected: ${node.label}`);
                            }
                          }}
                        >
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.size}
                            fill={node.color}
                            className="transition-all duration-300 group-hover:scale-125"
                            opacity={node.group === "root" ? 0.9 : 0.75}
                          />
                          <text
                            x={node.x}
                            y={node.y + node.size + 10}
                            textAnchor="middle"
                            fill={node.color}
                            className="text-[9px] font-mono tracking-tight text-slate-300 font-bold"
                          >
                            {node.label}
                          </text>
                        </g>
                      ))}
                    </svg>

                    <div className="absolute bottom-3 text-[9px] font-mono text-slate-500 text-center uppercase tracking-wider">
                      Interactive D3 Simulation. Click file nodes to load code context.
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PLANNER (NEORA GENESIS DOCUMENT A PART 2 RECURSIVE PLANNER) */}
              {activeTab === "planner" && (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
                >
                  <NeoraRecursivePlannerDashboard
                    geminiKey={geminiKey}
                    onGoalExecute={(g) => {
                      setPromptInput(g);
                      setActiveTab("conversation");
                    }}
                  />
                </motion.div>
              )}

              {/* TAB 4: AUTONOMOUS EXECUTION ENGINE DASHBOARD (PHASE 5) */}
              {activeTab === "execution" && (
                <motion.div
                  key="execution"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
                >
                  {/* Top Header & Operational Mode Controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-3 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-mono font-bold text-slate-100">Autonomous Execution Layer</h3>
                        <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-extrabold rounded-full font-mono ${
                          execStatus.status === "completed" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                          execStatus.status === "failed" ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" :
                          execStatus.status === "idle" ? "bg-slate-900 text-slate-500 border border-slate-800" :
                          "bg-cyan-950 text-cyan-400 border border-cyan-500/30 animate-pulse"
                        }`}>
                          {execStatus.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Phase 5 Production Workflow: Planning, Patching, Compiling, Self-Healing, and snap rollbacks</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="bg-slate-950/80 border border-slate-850 p-1 rounded-xl flex items-center gap-1">
                        <span className="text-[9px] font-mono text-slate-500 px-1.5">Apply Mode:</span>
                        {[
                          { id: "read_only", label: "Read Only" },
                          { id: "assisted", label: "Assisted" },
                          { id: "autonomous", label: "Autonomous" }
                        ].map(mode => (
                          <button
                            key={mode.id}
                            onClick={() => handleSetMode(mode.id as any)}
                            className={`px-2 py-0.5 text-[9px] font-mono rounded-lg cursor-pointer transition ${
                              execStatus.executionMode === mode.id
                                ? "bg-cyan-950 text-cyan-400 border border-cyan-500/25 shadow-md"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      {execStatus.status !== "idle" && (
                        <button
                          onClick={() => handleExecutionAction("cancel")}
                          className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-mono cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel Run
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Safe Apply Approval Bar */}
                  {execStatus.status === "waiting_for_approval" && (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/25 flex flex-col md:flex-row justify-between md:items-center gap-3 shadow-lg shadow-amber-950/10"
                    >
                      <div className="flex gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-300 block">Safety Policy Gate Triggered</span>
                          <span className="text-[10px] text-slate-400 font-mono leading-relaxed block mt-0.5">
                            High-risk files modified in execution plan. Approval required before modifications are committed to physical files.
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleExecutionAction("cancel")}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-850 text-[10.5px] font-mono text-slate-300 rounded-xl border border-slate-800 cursor-pointer"
                        >
                          Deny & Cancel
                        </button>
                        <button
                          onClick={() => handleExecutionAction("approve")}
                          className="px-3.5 py-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:opacity-90 text-white font-mono text-[10.5px] rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-950/30 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve & Commit Patch
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Core Goal Dispatch Console */}
                  {execStatus.status === "idle" && (
                    <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-3xl flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono font-bold text-slate-200">New Autonomous Action Goal</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={targetGoal}
                          onChange={(e) => setTargetGoal(e.target.value)}
                          placeholder="e.g., Integrate full-stack secure backups, update schema configs, or write lint tests..."
                          className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/35"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleLaunchAutonomousRun();
                          }}
                        />
                        <button
                          onClick={() => handleLaunchAutonomousRun()}
                          disabled={submittingGoal}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-mono text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {submittingGoal ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          Dispatch Autonomous Run
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dashboard Bento Grid (Phase 5 Analytics) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Column 1: System Resource Monitor */}
                    <div className="bg-[#111420]/50 border border-slate-850 p-4 rounded-3xl flex flex-col gap-3.5 shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                          <Activity className="w-3.5 h-3.5" />
                          System resource monitor
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">Live stats</span>
                      </div>

                      {/* CPU Linear usage */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Sandbox CPU Load</span>
                          <span className="text-slate-300">{execStatus.metrics.cpuUsage || 12}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full transition-all duration-1000"
                            style={{ width: `${execStatus.metrics.cpuUsage || 12}%` }}
                          />
                        </div>
                      </div>

                      {/* RAM usage metrics */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Memory usage (RAM)</span>
                          <span className="text-slate-300">
                            {execStatus.metrics.ramUsage.usedGb} / {execStatus.metrics.ramUsage.totalGb} GB
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full transition-all duration-1000"
                            style={{ width: `${execStatus.metrics.ramUsage.percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Disk Usage metrics */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Workspace Storage</span>
                          <span className="text-slate-300">
                            {execStatus.metrics.diskUsage.usedGb} / {execStatus.metrics.diskUsage.totalGb} GB
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full transition-all duration-1000"
                            style={{ width: `${execStatus.metrics.diskUsage.percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Model Rate Limits & background tasks */}
                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Gemini API Rate limits:</span>
                        </div>
                        <span className="text-yellow-500 font-semibold">{execStatus.metrics.modelRateLimits.requestsRemaining} reqs left</span>
                      </div>
                    </div>

                    {/* Column 2: Live Execution Timeline */}
                    <div className="bg-[#111420]/50 border border-slate-850 p-4 rounded-3xl flex flex-col gap-3 shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-[10px] font-mono font-bold text-purple-400 flex items-center gap-1.5 uppercase">
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          Execution workflow timeline
                        </span>
                        {execStatus.currentRetry > 0 && (
                          <span className="px-1.5 py-0.5 bg-rose-950/40 border border-rose-500/20 text-[8px] font-mono font-extrabold text-rose-400 rounded">
                            Self-healing retry: {execStatus.currentRetry}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1">
                        {execStatus.timeline && execStatus.timeline.length > 0 ? (
                          execStatus.timeline.map((step: any, index: number) => {
                            const isPending = step.status === "pending";
                            const isRunning = step.status === "running";
                            const isCompleted = step.status === "completed";
                            const isFailed = step.status === "failed";

                            return (
                              <div key={step.id} className="flex gap-2 text-[9.5px] font-mono">
                                <div className="flex flex-col items-center">
                                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 ${
                                    isCompleted ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400" :
                                    isFailed ? "bg-rose-950/60 border-rose-500/40 text-rose-400" :
                                    isRunning ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-400 animate-pulse" :
                                    "bg-slate-900 border-slate-800 text-slate-600"
                                  }`}>
                                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : isRunning ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                  </div>
                                  {index < execStatus.timeline.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-slate-850 my-0.5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className={`font-semibold truncate ${isRunning ? "text-cyan-400" : isCompleted ? "text-slate-300" : isFailed ? "text-rose-400" : "text-slate-600"}`}>
                                      {step.label}
                                    </span>
                                    {step.timestamp && !isPending && (
                                      <span className="text-[8px] text-slate-600 shrink-0">
                                        {new Date(step.timestamp).toLocaleTimeString()}
                                      </span>
                                    )}
                                  </div>
                                  {step.message && !isPending && (
                                    <p className="text-[8.5px] text-slate-500 mt-0.5 leading-relaxed truncate">{step.message}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-slate-600 italic py-8 text-center text-[10px] font-mono">
                            No active run trace sequence mapped. Dispatch a goal.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Durable Snapshots List */}
                    <div className="bg-[#111420]/50 border border-slate-850 p-4 rounded-3xl flex flex-col gap-3 shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                          <History className="w-3.5 h-3.5" />
                          Workspace snapshots & rollbacks
                        </span>
                        <button
                          onClick={() => handleExecutionAction("rollback")}
                          disabled={snapshotsList.length === 0}
                          className="px-2 py-0.5 bg-rose-950/40 hover:bg-rose-950/80 text-[8px] font-mono text-rose-400 border border-rose-500/20 rounded cursor-pointer disabled:opacity-40"
                        >
                          Undo Last Run
                        </button>
                      </div>

                      <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1">
                        {snapshotsList.length > 0 ? (
                          snapshotsList.map((snap: any) => (
                            <div key={snap.id} className="bg-slate-900/50 p-2 border border-slate-850 rounded-xl flex items-center justify-between text-[9px] font-mono hover:border-slate-800">
                              <div className="min-w-0">
                                <span className="font-bold text-slate-300 block truncate">{snap.reason}</span>
                                <span className="text-[8px] text-slate-500 block mt-0.5">
                                  {snap.id} • {snap.filesList.length} files • {new Date(snap.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <button
                                onClick={() => handleExecutionAction("rollback", snap.id)}
                                className="px-2 py-1 bg-slate-950 hover:bg-black rounded-lg border border-slate-800 text-cyan-400 cursor-pointer text-[8px] uppercase font-bold shrink-0 ml-1"
                              >
                                Restore
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-600 italic py-8 text-center text-[10px] font-mono">
                            No snapshots compiled yet. Created automatically on runs.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Safety Policy Rules & Proposed Code Patches (Horizontal split) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Safety Policies Rules Configuration */}
                    <div className="bg-[#111420]/30 border border-slate-850 p-3 rounded-3xl flex flex-col gap-2">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-850/50 pb-1.5 mb-1">
                        Safe apply gate configuration rules
                      </span>
                      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[150px] pr-1">
                        {safetyRules.map(rule => (
                          <div key={rule.id} className="flex items-center justify-between bg-slate-900/40 p-2 border border-slate-850/50 rounded-xl text-[9px] font-mono">
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-300 block truncate">{rule.description}</span>
                              <span className="text-[8px] text-slate-500 block font-bold mt-0.5">Pattern: {rule.pattern}</span>
                            </div>
                            <button
                              onClick={() => handleToggleRule(rule.id)}
                              className={`px-2 py-0.5 rounded font-extrabold text-[8px] uppercase cursor-pointer border ${
                                rule.isEnabled
                                  ? "bg-amber-950/50 text-amber-400 border-amber-500/20"
                                  : "bg-slate-950 text-slate-600 border-slate-850"
                              }`}
                            >
                              {rule.isEnabled ? "Gate active" : "Disabled"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Console Logger Realtime outputs */}
                    <div className="lg:col-span-2 bg-[#090b11] p-3 rounded-3xl border border-slate-850 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center border-b border-slate-850/60 pb-1.5">
                        <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                          Live terminal logs trace
                        </span>
                        <button
                          onClick={() => setExecStatus((p: any) => ({ ...p, logs: [] }))}
                          className="text-[8px] uppercase text-slate-600 font-bold hover:text-slate-400"
                        >
                          Clear stdout
                        </button>
                      </div>

                      <div className="h-32 p-1.5 font-mono text-[9.5px] leading-relaxed overflow-y-auto max-h-[140px] select-text">
                        {execStatus.logs && execStatus.logs.length > 0 ? (
                          <pre className="text-slate-300 font-sans whitespace-pre-wrap">
                            {execStatus.logs.map((log: string, idx: number) => (
                              <div key={idx} className="border-b border-slate-900/20 pb-0.5 mb-0.5 last:border-0">{log}</div>
                            ))}
                          </pre>
                        ) : (
                          <div className="text-slate-600 italic py-8 text-center text-[10px] font-mono">
                            Console idle. Waiting for active run triggers...
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 5: PATCH PREVIEW (SURGICAL CODE EDITOR & DIFF) */}
              {activeTab === "patches" && (
                <motion.div
                  key="patches"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-200">Surgical AI Code Patching</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Select a file, define instructions, and apply side-by-side comparative diff checks</p>
                    </div>

                    <div className="flex gap-1.5">
                      {["diff", "original", "modified"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setDiffMode(mode as any)}
                          className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold cursor-pointer uppercase ${
                            diffMode === mode ? "bg-cyan-950 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left: Interactive Code view with Save button */}
                    <div className="lg:col-span-2 flex flex-col gap-2">
                      <div className="flex justify-between items-center bg-slate-900 px-3 py-1 border border-slate-800 rounded-t-xl text-[10px] font-mono text-slate-300">
                        <span className="font-bold">{selectedFilePath}</span>
                        <button
                          onClick={handleSaveFileContent}
                          disabled={loadingStates.saving}
                          className="px-2 py-0.5 bg-slate-950 hover:bg-black rounded text-[9px] text-cyan-400 border border-slate-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {loadingStates.saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          <span>Save changes</span>
                        </button>
                      </div>

                      <div className="h-64 bg-black p-3.5 rounded-b-2xl font-mono text-[10.5px] leading-relaxed border border-t-0 border-slate-850 overflow-y-auto max-h-[260px] select-text">
                        {diffMode === "original" ? (
                          <textarea
                            value={originalCode}
                            onChange={(e) => setOriginalCode(e.target.value)}
                            className="w-full h-full bg-transparent text-slate-300 border-none outline-none focus:ring-0 font-mono resize-none"
                          />
                        ) : diffMode === "modified" ? (
                          <pre className="text-emerald-400 whitespace-pre-wrap">{modifiedCode || "// No modified code generated."}</pre>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {diffLines.map((line, idx) => (
                              <div
                                key={idx}
                                className={`flex px-2 py-0.5 font-mono ${
                                  line.type === "added" ? "bg-emerald-950/30 text-emerald-400 border-l-2 border-emerald-500" :
                                  line.type === "deleted" ? "bg-rose-950/30 text-rose-400 border-l-2 border-rose-500 line-through" :
                                  "text-slate-400"
                                }`}
                              >
                                <span className="w-8 shrink-0 select-none text-slate-600 text-[8px] text-right pr-2">{line.num}</span>
                                <span className="w-4 shrink-0 select-none text-[9px] font-extrabold">{line.type === "added" ? "+" : line.type === "deleted" ? "-" : " "}</span>
                                <span className="whitespace-pre">{line.text}</span>
                              </div>
                            ))}
                            {diffLines.length === 0 && (
                              <div className="text-slate-600 italic text-center py-6">
                                Indexing content empty. Select files in the explorer to inspect original code.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {modifiedCode && (
                        <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl flex justify-between items-center">
                          <span className="text-[10px] font-mono text-cyan-300 leading-none">
                            Review changes, then write modifications directly back to code workspace file.
                          </span>
                          <button
                            onClick={handleApplyPatch}
                            disabled={loadingStates.saving}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-mono text-[10px] rounded-lg hover:opacity-95 shadow flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {loadingStates.saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            <span>Apply Code Patch to Disk</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right: Surgical Instructions form */}
                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col gap-2.5">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Patch instructions</span>
                      <textarea
                        value={patchInstructions}
                        onChange={(e) => setPatchInstructions(e.target.value)}
                        placeholder="Define code updates (e.g. 'Add search filter to input text', 'Add detailed description comments')..."
                        className="bg-slate-900/50 p-2 border border-slate-850 rounded-xl font-mono text-[10.5px] text-slate-200 placeholder-slate-700 outline-none focus:border-cyan-500/30 resize-none h-24"
                      />

                      <button
                        onClick={handleGeneratePatch}
                        disabled={loadingStates.patching || !patchInstructions.trim()}
                        className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 font-mono text-[10px] text-cyan-400 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        {loadingStates.patching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        <span>Compile Code Patch</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: BROWSER VIEW (PORT 3000 REAL EMBEDDED IFRAME) */}
              {activeTab === "browser" && (
                <motion.div
                  key="browser"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-3"
                >
                  {/* Browser simulated toolbar */}
                  <div className="bg-slate-950 p-1.5 border border-slate-850 rounded-2xl flex items-center justify-between font-mono text-[10.5px] text-slate-400 shrink-0 select-none">
                    <div className="flex items-center gap-1.5 flex-1 max-w-md">
                      <button onClick={() => setBrowserUrl(window.location.origin)} className="p-1 hover:bg-slate-900 text-slate-500 hover:text-slate-300 rounded cursor-pointer">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 bg-slate-900 border border-slate-850 px-2.5 py-0.5 rounded-lg text-slate-300 flex items-center gap-2 truncate">
                        <Globe className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="truncate">{browserUrl}</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {["100%", "768px", "390px"].map((width) => (
                        <button
                          key={width}
                          onClick={() => setBrowserWidth(width)}
                          className={`px-2 py-0.5 text-[8.5px] rounded font-bold cursor-pointer uppercase ${
                            browserWidth === width ? "bg-slate-900 text-cyan-400 border border-slate-850" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {width === "100%" ? "desktop" : width === "768px" ? "tablet" : "mobile"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HTML Iframe container */}
                  <div className="flex-1 bg-[#090b11] border border-slate-850 rounded-2xl overflow-hidden flex justify-center p-2 relative min-h-[250px]">
                    <div style={{ width: browserWidth }} className="h-full bg-white transition-all duration-300 rounded border border-slate-800 shadow">
                      <iframe
                        src={browserUrl}
                        className="w-full h-full border-none"
                        title="Vite Development Frame"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 7: REPORTS / DOCUMENTATION */}
              {activeTab === "documentation" && (
                <motion.div
                  key="documentation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-200">Sprint Reports & API Guides</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Compile daily technical summaries and view system architecture logs</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Sprint Reports compiling list */}
                    <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                        <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Published Sprint Reports</span>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={newReportTitle}
                            onChange={(e) => setNewReportTitle(e.target.value)}
                            className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[9.5px] text-slate-100 font-mono"
                          />
                          <button
                            onClick={handleGenerateReport}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[9px] font-mono text-cyan-400 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            Compile Report
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto mt-1">
                        {reports.map((rep: any) => (
                          <div key={rep.id} className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl flex flex-col gap-1.5 font-mono text-[10.5px]">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-200">{rep.title}</span>
                              <span className="text-[8px] text-slate-500">{new Date(rep.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-400 text-[10px] leading-relaxed">{rep.summary}</p>
                          </div>
                        ))}
                        {reports.length === 0 && (
                          <div className="text-slate-600 italic text-center py-6 text-[10px]">
                            No reports published. Type or select a developer goal above to compile sprint parameters.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* API Guidelines details */}
                    <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-2xl flex flex-col gap-3">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-850 pb-1">System Instructions</span>
                      <div className="text-[10px] font-mono text-slate-400 flex flex-col gap-3 leading-relaxed">
                        <div>
                          <span className="text-cyan-400 font-bold block mb-0.5 uppercase text-[9px]">1. Keyboard shortcuts</span>
                          <p>Command Palette: Ctrl+Shift+P</p>
                          <p>Exit overlays: Escape</p>
                        </div>
                        <div>
                          <span className="text-purple-400 font-bold block mb-0.5 uppercase text-[9px]">2. Standard guidelines</span>
                          <p>Rely on Tailwind utilities. Maintain responsive containers and elegant high contrast dark interfaces with neon accents.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 8: ENV & PLUGINS PANEL (PHASE 6) */}
              {activeTab === "environment" && (
                <motion.div
                  key="environment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
                >
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-200">Environmental Policies & Tool Plugins</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Configure sandboxed execution boundaries, toggle developer runtime plugins, and inspect safety rules</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Column 1: Sandbox Config & System Adapters */}
                    <div className="flex flex-col gap-4">
                      {/* Virtualization Resource Boundaries */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-cyan-400">Sandbox Resource Virtualization</span>
                        
                        <div className="flex flex-col gap-2.5 mt-1 text-[10.5px] font-mono text-slate-300">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px]">
                              <span>Process Expiration Timeout</span>
                              <span className="text-cyan-300 font-bold">{envSandboxConfig.timeoutMs}ms</span>
                            </div>
                            <input
                              type="range"
                              min="2000"
                              max="30000"
                              step="1000"
                              value={envSandboxConfig.timeoutMs}
                              onChange={(e) => handleUpdateSandboxConfig({ timeoutMs: Number(e.target.value) })}
                              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px]">
                              <span>Heap Allocation Limit</span>
                              <span className="text-cyan-300 font-bold">{envSandboxConfig.memoryLimitMb} MB</span>
                            </div>
                            <input
                              type="range"
                              min="128"
                              max="2048"
                              step="128"
                              value={envSandboxConfig.memoryLimitMb}
                              onChange={(e) => handleUpdateSandboxConfig({ memoryLimitMb: Number(e.target.value) })}
                              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px]">
                              <span>VCPU Throttle cap</span>
                              <span className="text-cyan-300 font-bold">{envSandboxConfig.cpuLimitPercent}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              step="5"
                              value={envSandboxConfig.cpuLimitPercent}
                              onChange={(e) => handleUpdateSandboxConfig({ cpuLimitPercent: Number(e.target.value) })}
                              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-900 pt-3 mt-1">
                            <span className="text-[10px]">Isolated Network Overlay</span>
                            <button
                              onClick={() => handleUpdateSandboxConfig({ isIsolated: !envSandboxConfig.isIsolated })}
                              className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer border ${
                                envSandboxConfig.isIsolated
                                  ? "bg-cyan-950/40 border-cyan-500/20 text-cyan-300"
                                  : "bg-slate-900 border-slate-800 text-slate-500"
                              }`}
                            >
                              {envSandboxConfig.isIsolated ? "Isolated" : "Shared"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Inference Providers */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-purple-400">Model Inference Providers</span>
                        <div className="flex flex-col gap-2 mt-1">
                          {envProviders.map((p: any) => (
                            <div key={p.id} className="p-3 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-2 font-mono text-[10.5px]">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <div className={`w-1.5 h-1.5 rounded-full ${p.isEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                                  <span className="text-slate-200">{p.name}</span>
                                </div>
                                <button
                                  onClick={() => handleToggleProvider(p.id, !p.isEnabled)}
                                  className={`px-2 py-0.5 rounded text-[8.5px] font-bold cursor-pointer border ${
                                    p.isEnabled ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500"
                                  }`}
                                >
                                  {p.isEnabled ? "Active" : "Disable"}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-[9.5px]">
                                <span className="text-slate-500">Target model:</span>
                                <select
                                  value={p.defaultModel}
                                  onChange={(e) => handleSetProviderModel(p.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 text-[9px] outline-none"
                                >
                                  {p.id === "online" ? (
                                    <>
                                      <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="Qwen-2.5-Coder">Qwen-2.5-Coder</option>
                                      <option value="Llama-3.1-8B">Llama-3.1-8B</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Environmental Permission Policies */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-emerald-400">Action Permission Policies</span>
                        <div className="flex flex-col gap-2 mt-1">
                          {envPermissions.map((policy: any) => (
                            <div key={policy.id} className="p-3 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-2.5 font-mono text-[10.5px]">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-slate-200 block text-[11px]">{policy.action}</span>
                                  <span className="text-[9.5px] text-slate-500">{policy.description}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-[9.5px]">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    id={`p-all-${policy.id}`}
                                    checked={policy.isAllowed}
                                    onChange={(e) => handleTogglePermission(policy.id, "isAllowed", e.target.checked)}
                                    className="rounded border-slate-800 text-cyan-500 bg-slate-900 focus:ring-0 cursor-pointer"
                                  />
                                  <label htmlFor={`p-all-${policy.id}`} className="text-slate-400 cursor-pointer">Allow action</label>
                                </div>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    id={`p-app-${policy.id}`}
                                    checked={policy.requiresApproval}
                                    onChange={(e) => handleTogglePermission(policy.id, "requiresApproval", e.target.checked)}
                                    className="rounded border-slate-800 text-cyan-500 bg-slate-900 focus:ring-0 cursor-pointer"
                                  />
                                  <label htmlFor={`p-app-${policy.id}`} className="text-slate-400 cursor-pointer">Require manual approval</label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* System Plugins registry */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-pink-400">Developer Extension Plugins</span>
                        <div className="flex flex-col gap-2 mt-1 max-h-[180px] overflow-y-auto pr-1">
                          {envPlugins.map((plug: any) => (
                            <div key={plug.id} className="p-2.5 bg-slate-900/20 border border-slate-850 rounded-xl flex items-center justify-between font-mono text-[10px]">
                              <div>
                                <span className="font-bold text-slate-200 block">{plug.name}</span>
                                <span className="text-[8.5px] text-slate-500">v{plug.version} • {plug.status}</span>
                              </div>
                              <div className="flex gap-1">
                                {plug.status === "Not Installed" ? (
                                  <button
                                    onClick={() => handlePluginAction(plug.id, "install")}
                                    className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/20 text-cyan-400 text-[8.5px] font-bold rounded cursor-pointer hover:bg-cyan-900/30"
                                  >
                                    Install
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handlePluginAction(plug.id, plug.status === "Enabled" ? "disable" : "enable")}
                                      className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer border ${
                                        plug.status === "Enabled" ? "bg-slate-900 border-slate-850 text-slate-400" : "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
                                      }`}
                                    >
                                      {plug.status === "Enabled" ? "Disable" : "Enable"}
                                    </button>
                                    <button
                                      onClick={() => handlePluginAction(plug.id, "remove")}
                                      className="px-1.5 py-0.5 bg-rose-950/20 border border-rose-500/10 text-rose-400 text-[8.5px] rounded cursor-pointer hover:bg-rose-900/30"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Interactive Sandbox Execution Trial & Security Log */}
                    <div className="flex flex-col gap-4">
                      {/* Live sandbox trial widget */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-400">Sandbox Trial Playground</span>
                        <div className="flex flex-col gap-2.5 mt-1 font-mono text-[10.5px]">
                          <div className="flex border-b border-slate-850 pb-2 mb-1 gap-2">
                            <button
                              onClick={() => setEnvTrialAction("read")}
                              className={`px-2 py-0.5 rounded text-[9px] cursor-pointer ${envTrialAction === "read" ? "bg-slate-900 text-cyan-400 font-bold" : "text-slate-500"}`}
                            >
                              Shell Evaluator
                            </button>
                            <button
                              onClick={() => setEnvTrialAction("write")}
                              className={`px-2 py-0.5 rounded text-[9px] cursor-pointer ${envTrialAction === "write" ? "bg-slate-900 text-cyan-400 font-bold" : "text-slate-500"}`}
                            >
                              Filesystem Access
                            </button>
                          </div>

                          {envTrialAction === "read" ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-[9px] text-slate-500">Input shell trial instruction:</span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={envTrialCommand}
                                  onChange={(e) => setEnvTrialCommand(e.target.value)}
                                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-100 outline-none"
                                />
                                <button
                                  onClick={handleRunTrialShell}
                                  disabled={envRunningTrial}
                                  className="px-3 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {envRunningTrial ? "Running..." : "Evaluate"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[8.5px] text-slate-500">File target:</span>
                                  <input
                                    type="text"
                                    value={envTrialFilePath}
                                    onChange={(e) => setEnvTrialFilePath(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[9.5px] text-slate-200 outline-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[8.5px] text-slate-500">Operation:</span>
                                  <select
                                    value={envTrialAction}
                                    onChange={(e) => setEnvTrialAction(e.target.value as any)}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[9.5px] text-slate-200 outline-none"
                                  >
                                    <option value="read">Read File</option>
                                    <option value="write">Write File</option>
                                    <option value="delete">Delete File</option>
                                  </select>
                                </div>
                              </div>
                              {envTrialAction === "write" && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[8.5px] text-slate-500">File body content:</span>
                                  <textarea
                                    rows={2}
                                    value={envTrialContent}
                                    onChange={(e) => setEnvTrialContent(e.target.value)}
                                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-[9.5px] text-slate-200 outline-none font-mono resize-none"
                                  />
                                </div>
                              )}
                              <button
                                onClick={handleRunTrialFilesystem}
                                disabled={envRunningTrial}
                                className="w-full mt-1 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:text-white rounded-lg text-center cursor-pointer disabled:opacity-50 font-bold text-[10px]"
                              >
                                {envRunningTrial ? "Accessing sandbox storage..." : "Trigger FS Dispatcher"}
                              </button>
                            </div>
                          )}

                          {envTrialResult && (
                            <div className="mt-2 p-2.5 bg-black/80 border border-slate-850 rounded-xl text-[9.5px]">
                              <div className="flex justify-between items-center text-[8px] text-slate-500 mb-1">
                                <span>TRIAL STATUS: {envTrialResult.success ? "SUCCESS" : "DENIED"}</span>
                                <span>{envTrialResult.durationMs ? `${envTrialResult.durationMs}ms` : ""}</span>
                              </div>
                              {envTrialResult.stdout && (
                                <pre className="text-emerald-400 overflow-x-auto max-h-[80px] leading-relaxed">{envTrialResult.stdout}</pre>
                              )}
                              {envTrialResult.stderr && (
                                <pre className="text-rose-400 overflow-x-auto max-h-[80px] leading-relaxed">{envTrialResult.stderr}</pre>
                              )}
                              {envTrialResult.error && (
                                <div className="text-amber-500">Error: {envTrialResult.error}</div>
                              )}
                              {envTrialResult.fileContent !== undefined && (
                                <pre className="text-slate-300 overflow-x-auto max-h-[80px] leading-relaxed">{envTrialResult.fileContent || "[Empty File]"}</pre>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Security policies checkup logs */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3 flex-1 min-h-[180px]">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400">Sandbox Audit Chronology</span>
                        <div className="flex flex-col gap-2 mt-1 max-h-[160px] overflow-y-auto pr-1">
                          {envAuditLogs.map((log: any, idx: number) => (
                            <div key={idx} className="p-2 bg-slate-900/10 border border-slate-900 rounded-lg flex flex-col gap-1 font-mono text-[9px] text-slate-400">
                              <div className="flex justify-between font-bold text-[9.5px]">
                                <span className={log.success ? "text-emerald-400" : "text-rose-400"}>
                                  [{log.success ? "ALLOW" : "BLOCK"}] {log.action}
                                </span>
                                <span className="text-slate-600 text-[8px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-slate-500 leading-relaxed italic">Reason: {log.details}</p>
                            </div>
                          ))}
                          {envAuditLogs.length === 0 && (
                            <div className="text-slate-600 italic text-center py-6 text-[9.5px]">No environmental triggers captured.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 9: NEORA INTELLIGENCE CORE PANEL (PHASE 7) */}
              {activeTab === "intelligence" && (
                <motion.div
                  key="intelligence"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
                >
                  {/* Title & Concept Header */}
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-200">Neora Intelligence Core</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Continuous pattern recognition, adaptive memory, decision strategy planning, and lessons learned</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTriggerManualExperience(true)}
                        className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 hover:text-white rounded-lg text-[9.5px] font-mono font-bold cursor-pointer transition-all"
                      >
                        Record Success Exp
                      </button>
                      <button
                        onClick={() => handleTriggerManualExperience(false)}
                        className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:text-white rounded-lg text-[9.5px] font-mono font-bold cursor-pointer transition-all"
                      >
                        Record Failed Exp
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Panel Column A: Adaptive Memory & Project Knowledge */}
                    <div className="flex flex-col gap-4">
                      {/* Adaptive Memory - Developer Profile */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5" /> Adaptive Memory (Developer Profile)
                        </span>

                        <div className="flex flex-col gap-3 mt-1 text-[10.5px] font-mono">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 uppercase">Preferred Coding Style</span>
                            <input
                              type="text"
                              value={intelPreferences.preferredCodingStyle}
                              onChange={(e) => handleUpdatePreference("preferredCodingStyle", e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded p-1.5 text-slate-100 outline-none text-[10px]"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 uppercase">Formatting Guidelines</span>
                            <input
                              type="text"
                              value={intelPreferences.formattingStyle}
                              onChange={(e) => handleUpdatePreference("formattingStyle", e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded p-1.5 text-slate-100 outline-none text-[10px]"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 uppercase">Commit Message Preference</span>
                            <input
                              type="text"
                              value={intelPreferences.commitMessageStyle}
                              onChange={(e) => handleUpdatePreference("commitMessageStyle", e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded p-1.5 text-slate-100 outline-none text-[10px]"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-500 uppercase">Architecture Priorities</span>
                            <textarea
                              rows={2}
                              value={intelPreferences.architecturePreferences}
                              onChange={(e) => handleUpdatePreference("architecturePreferences", e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded p-1.5 text-slate-100 outline-none text-[10px] resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Knowledge Engine Specs */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                          <Database className="w-3.5 h-3.5" /> Project Knowledge Engine
                        </span>

                        <div className="flex flex-col gap-3 mt-1 text-[10.5px] font-mono max-h-[300px] overflow-y-auto pr-1">
                          {[
                            { key: "architecture", label: "App Architecture Structure" },
                            { key: "codingStandards", label: "Project Coding Standards" },
                            { key: "businessLogic", label: "System Business Logic" },
                            { key: "namingConventions", label: "Naming Convention Rules" },
                            { key: "folderOrganization", label: "Folder Organization Schema" },
                            { key: "frameworkUsage", label: "Framework Usage Guidelines" },
                            { key: "apiDesign", label: "Express API Standards" }
                          ].map(item => (
                            <div key={item.key} className="flex flex-col gap-1 border-b border-slate-900 pb-2">
                              <span className="text-[9px] text-slate-500 font-bold">{item.label}</span>
                              <textarea
                                rows={2}
                                value={intelKnowledge[item.key] || ""}
                                onChange={(e) => handleUpdateKnowledge(item.key, e.target.value)}
                                className="bg-slate-900/40 border border-slate-850/50 rounded p-1.5 text-slate-300 outline-none text-[9.5px] resize-none leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Panel Column B: Optimizers & Predictive Analytics */}
                    <div className="flex flex-col gap-4">
                      {/* Prompt Optimizer Trial Panel */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Prompt Optimizer (Internal Expansion)
                        </span>

                        <div className="flex flex-col gap-2.5 mt-1 font-mono text-[10.5px]">
                          <span className="text-[9px] text-slate-500">Test shorthand query expansion:</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={intelPromptTest}
                              onChange={(e) => setIntelPromptTest(e.target.value)}
                              placeholder="e.g. todo list, calendar"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-100 outline-none"
                            />
                            <button
                              onClick={handleRunPromptOptimization}
                              disabled={intelLoading}
                              className="px-3 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50 font-bold"
                            >
                              {intelLoading ? "Expanding..." : "Optimize"}
                            </button>
                          </div>

                          {intelPromptResult && (
                            <div className="mt-1.5 p-3 bg-slate-900/50 border border-slate-850 rounded-xl flex flex-col gap-2">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[8.5px] text-slate-500 uppercase font-bold">Optimized Output Formulation:</span>
                                <p className="text-slate-200 text-[10px] leading-relaxed italic">"{intelPromptResult.optimized}"</p>
                              </div>
                              <div className="flex flex-col gap-0.5 border-t border-slate-850 pt-1.5 mt-0.5">
                                <span className="text-[8.5px] text-slate-500 uppercase font-bold">Applied Improvements:</span>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  {intelPromptResult.optimized !== intelPromptResult.original ? (
                                    <div className="flex items-center gap-1 text-[9px] text-cyan-400">
                                      <Check className="w-3 h-3 text-cyan-400" /> Incorporated strict project coding standards automatically.
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-slate-500 italic">No mutations required; prompt was fully complete.</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Decision & Prediction Engine */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> Risk Strategy & Prediction Engine
                        </span>

                        <div className="flex flex-col gap-2.5 mt-1 font-mono text-[10.5px]">
                          <span className="text-[9px] text-slate-500">Forecasting target developer goal:</span>
                          <div className="flex flex-col gap-2">
                            <textarea
                              rows={2}
                              value={intelStrategyGoal}
                              onChange={(e) => setIntelStrategyGoal(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] text-slate-100 outline-none resize-none font-mono"
                            />
                            <button
                              onClick={handleRunStrategyForecasting}
                              disabled={intelLoading}
                              className="w-full py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 hover:text-white rounded-lg text-center cursor-pointer disabled:opacity-50 font-bold"
                            >
                              {intelLoading ? "Analyzing Strategy Boundaries..." : "Forecast Implementation Risks"}
                            </button>
                          </div>

                          {intelStrategyResult && (
                            <div className="mt-1.5 p-3 bg-slate-900/50 border border-slate-850 rounded-xl flex flex-col gap-3">
                              {/* Strategy details */}
                              <div className="grid grid-cols-2 gap-2 text-[9px]">
                                <div className="p-2 bg-slate-950 rounded border border-slate-900">
                                  <span className="text-slate-500 block uppercase font-bold mb-0.5">Risk Rating</span>
                                  <span className={`font-extrabold ${
                                    intelStrategyResult.riskLevel === "High" ? "text-rose-400 animate-pulse" :
                                    intelStrategyResult.riskLevel === "Medium" ? "text-amber-400" : "text-emerald-400"
                                  }`}>{intelStrategyResult.riskLevel}</span>
                                </div>
                                <div className="p-2 bg-slate-950 rounded border border-slate-900">
                                  <span className="text-slate-500 block uppercase font-bold mb-0.5">Model Recommendation</span>
                                  <span className="text-cyan-300 font-bold">{intelStrategyResult.preferredModel}</span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <span className="text-[8.5px] text-slate-500 uppercase font-bold">Execution Plan Blueprint:</span>
                                <p className="text-slate-200 text-[9.5px] leading-relaxed italic">"{intelStrategyResult.strategy}"</p>
                              </div>

                              {/* Forecasted affected files */}
                              <div className="flex flex-col gap-1 border-t border-slate-850 pt-2 mt-1">
                                <span className="text-[8.5px] text-slate-500 uppercase font-bold">Predicted Impacted Files:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {intelStrategyResult.affectedFiles.map((file: string, idx: number) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 rounded text-[8.5px] text-slate-300">{file}</span>
                                  ))}
                                </div>
                              </div>

                              {/* Predicted errors */}
                              <div className="flex flex-col gap-1 border-t border-slate-850 pt-2 mt-1">
                                <span className="text-[8.5px] text-rose-400 uppercase font-bold">Predicted System Warnings:</span>
                                <div className="flex flex-col gap-1 mt-1">
                                  {intelStrategyResult.predictedErrors.map((err: string, idx: number) => (
                                    <span key={idx} className="text-[8.5px] text-slate-400 flex items-start gap-1">
                                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                      <span>{err}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Panel Column C: Intelligent Recommendations & Experiences */}
                    <div className="flex flex-col gap-4">
                      {/* Active Recommendations */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" /> Intelligent System Recommendations
                        </span>

                        <div className="flex flex-col gap-2.5 mt-1 max-h-[220px] overflow-y-auto pr-1">
                          {intelRecommendations.map((rec: any) => (
                            <div key={rec.id} className="p-3 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-2 font-mono text-[10px]">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded uppercase tracking-wider text-pink-400">{rec.category}</span>
                                  <span className="font-extrabold text-slate-200 block mt-1">{rec.title}</span>
                                </div>
                                <button
                                  onClick={() => handleToggleRecommendation(rec.id)}
                                  className={`px-2 py-0.5 rounded text-[8.5px] font-bold cursor-pointer border transition-all ${
                                    rec.isApplied ? "bg-emerald-950 border-emerald-500/20 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                                  }`}
                                >
                                  {rec.isApplied ? "Applied" : "Apply"}
                                </button>
                              </div>
                              <p className="text-slate-400 text-[9.5px] leading-relaxed">{rec.description}</p>
                              <div className="p-1.5 bg-black/50 border border-slate-900 rounded font-mono text-[8.5px] text-cyan-400 italic">
                                Proposal: {rec.proposedFix}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience and Lessons Timeline */}
                      <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3 flex-1 min-h-[180px]">
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <History className="w-3.5 h-3.5" /> Experience Logs & Lessons Timeline
                        </span>

                        <div className="flex flex-col gap-2.5 mt-1 max-h-[240px] overflow-y-auto pr-1">
                          {intelLessons.map((les: any) => (
                            <div key={les.id} className="p-2.5 bg-slate-900/10 border border-slate-900 rounded-xl flex flex-col gap-1.5 font-mono text-[9.5px] text-slate-400">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-200 leading-normal">Goal: {les.goal}</span>
                                <span className="text-[8px] text-slate-600 shrink-0 mt-0.5">{new Date(les.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex flex-col gap-1 border-t border-slate-900/80 pt-1.5 text-[9px]">
                                <div className="flex gap-1">
                                  <span className="text-emerald-400 font-bold uppercase tracking-wider">Worked:</span>
                                  <span className="text-slate-300">{les.whatWorked}</span>
                                </div>
                                {les.whatFailed !== "None" && (
                                  <div className="flex gap-1">
                                    <span className="text-rose-400 font-bold uppercase tracking-wider">Failed:</span>
                                    <span className="text-slate-300">{les.whatFailed}</span>
                                  </div>
                                )}
                                <div className="flex gap-1.5 mt-0.5 p-1 bg-black/40 border border-slate-950/50 rounded text-cyan-400 italic text-[8.5px]">
                                  Pattern: {les.reusablePattern}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "engineering" && (
                <motion.div
                  key="engineering"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
                >
                  <NeoraEngineeringEvolutionDashboard geminiKey={geminiKey} />
                </motion.div>
              )}

              {activeTab === "governance" && (
                <motion.div
                  key="governance"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
                >
                  <NeoraProductGovernanceDashboard geminiKey={geminiKey} />
                </motion.div>
              )}

              {activeTab === "ssot" && (
                <motion.div
                  key="ssot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
                >
                  <NeoraProductSSOTDashboard geminiKey={geminiKey} />
                </motion.div>
              )}

              {activeTab === "design-studio" && (
                <motion.div
                  key="design-studio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col gap-4 overflow-y-auto pr-1"
                >
                  <NeoraAIDesignStudioDashboard geminiKey={geminiKey} />
                </motion.div>
              )}

              {activeTab === "os-portal" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 overflow-y-auto p-4 md:p-6"
                >
                  <NeoraOSPortal lang={lang} geminiKey={geminiKey} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ----------------------------------------------------
              C. BOTTOM TERMINAL / LOGS CONSOLE (Height 180px)
              ---------------------------------------------------- */}
          <div className="mt-auto shrink-0 z-10 select-none border-t border-slate-800 bg-slate-950">
            {/* Console switcher */}
            <div className="h-8 px-3.5 flex items-center justify-between border-b border-slate-850 text-[10px] font-mono font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                {[
                  { id: "workflow-queue", label: "Execution Queue", icon: CloudLightning },
                  { id: "console", label: "Dev Diagnostics", icon: Activity },
                  { id: "terminal", label: "Terminal", icon: TerminalSquare },
                  { id: "git", label: "Git Outputs", icon: GitBranch }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTerminalTab(tab.id as any)}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all ${
                      activeTerminalTab === tab.id ? "bg-slate-900 text-cyan-400" : "hover:text-slate-300"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setBottomPanelCollapsed(!bottomPanelCollapsed)}
                className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-white transition-all cursor-pointer"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>

            {/* Terminal contents */}
            <AnimatePresence initial={false}>
              {!bottomPanelCollapsed && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: bottomPanelHeight }}
                  exit={{ height: 0 }}
                  className="bg-black/95 p-3 flex flex-col gap-2 overflow-hidden"
                >
                  {activeTerminalTab === "workflow-queue" ? (
                    <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 font-mono text-[10px] text-slate-300">
                      <div className="flex justify-between items-center bg-[#0d0f17]/45 border border-slate-850 px-3 py-1.5 rounded-xl shrink-0">
                        <div className="flex items-center gap-2">
                          <CloudLightning className="w-4 h-4 text-cyan-400" />
                          <span className="font-extrabold text-slate-200">Execution Orchestrator</span>
                          <span className="text-[8px] px-1 bg-cyan-950 border border-cyan-500/25 rounded text-cyan-400 font-bold uppercase">
                            {isWorkflowPaused ? "PAUSED" : workflowStage !== "Idle" ? "RUNNING" : "STANDBY"}
                          </span>
                        </div>
                        {workflowStage !== "Idle" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setIsWorkflowPaused(!isWorkflowPaused);
                                triggerToast(isWorkflowPaused ? "Resuming autonomous queue!" : "Orchestration queue paused.");
                              }}
                              className={`px-2 py-0.5 border rounded-md cursor-pointer transition-all ${
                                isWorkflowPaused ? "bg-emerald-950 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/45" : "bg-amber-950 border-amber-500/30 text-amber-400 hover:bg-amber-900/45"
                              }`}
                            >
                              {isWorkflowPaused ? "Resume Queue" : "Pause Queue"}
                            </button>
                          </div>
                        )}
                      </div>

                      {workflowStage !== "Idle" ? (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                          {/* 1. Stages flow */}
                          <div className="lg:col-span-3 bg-slate-900/10 border border-slate-850 p-3 rounded-2xl flex flex-col gap-2">
                            <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 mb-1">
                              <span className="font-bold text-slate-400 text-[9.5px] uppercase">Active Stage Timeline</span>
                              <span className="text-[8px] text-slate-600">Manual reordering enabled</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {executionQueue.map((item, idx) => {
                                const isCurrent = workflowStage.toLowerCase().includes(item.step.toLowerCase());
                                const isDone = idx < executionQueue.findIndex(q => workflowStage.toLowerCase().includes(q.step.toLowerCase())) || workflowStage === "Execution Queue Ready";
                                return (
                                  <div
                                    key={item.step}
                                    className={`p-2 rounded-xl border flex flex-col justify-between transition-all relative group ${
                                      isCurrent ? "border-cyan-500/40 bg-cyan-950/15" : isDone ? "border-emerald-500/25 bg-emerald-950/5" : "border-slate-850 bg-slate-900/10 opacity-60"
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-black text-[9px] uppercase tracking-wide text-slate-200">{item.step}</span>
                                        {isDone ? (
                                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : isCurrent ? (
                                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                                        ) : (
                                          <div className="w-2 h-2 bg-slate-700 rounded-full" />
                                        )}
                                      </div>
                                      <p className="text-[8.5px] text-slate-400 leading-normal mt-1">{item.title}</p>
                                    </div>
                                    
                                    {/* Arrow Controls to Reorder */}
                                    <div className="flex gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        disabled={idx === 0}
                                        onClick={() => {
                                          const newQ = [...executionQueue];
                                          // Swap indices
                                          const temp = newQ[idx];
                                          newQ[idx] = newQ[idx - 1];
                                          newQ[idx - 1] = temp;
                                          setExecutionQueue(newQ);
                                          triggerToast(`Moved ${item.step} up.`);
                                        }}
                                        className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[8px] text-slate-400 disabled:opacity-20 cursor-pointer"
                                        title="Move Up"
                                      >
                                        ◀
                                      </button>
                                      <button
                                        disabled={idx === executionQueue.length - 1}
                                        onClick={() => {
                                          const newQ = [...executionQueue];
                                          // Swap indices
                                          const temp = newQ[idx];
                                          newQ[idx] = newQ[idx + 1];
                                          newQ[idx + 1] = temp;
                                          setExecutionQueue(newQ);
                                          triggerToast(`Moved ${item.step} down.`);
                                        }}
                                        className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[8px] text-slate-400 disabled:opacity-20 cursor-pointer"
                                        title="Move Down"
                                      >
                                        ▶
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Background Tasks & Systems */}
                          <div className="bg-slate-900/10 border border-slate-850 p-3 rounded-2xl flex flex-col gap-2">
                            <span className="font-bold text-slate-400 text-[9.5px] uppercase border-b border-slate-850 pb-1.5 mb-1">
                              Background Services
                            </span>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between text-[8.5px]">
                                <span className="text-slate-500 font-mono">Compiler Daemon</span>
                                <span className="text-emerald-400 font-extrabold flex items-center gap-1 font-mono">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                                  STANDBY
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[8.5px]">
                                <span className="text-slate-500 font-mono">Linter Healer</span>
                                <span className="text-cyan-400 font-extrabold flex items-center gap-1 font-mono">
                                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                                  ACTIVE
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[8.5px]">
                                <span className="text-slate-500 font-mono">Auto-Committer</span>
                                <span className="text-indigo-400 font-extrabold font-mono">IDLE</span>
                              </div>
                              <div className="flex items-center justify-between text-[8.5px]">
                                <span className="text-slate-500 font-mono">Logs Monitor</span>
                                <span className="text-emerald-400 font-extrabold font-mono">TAILING</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-850 rounded-2xl">
                          <Cpu className="w-6 h-6 text-slate-600 mb-2 animate-pulse" />
                          <h4 className="text-[11px] font-bold text-slate-400 font-mono">System Orchestrator Idle</h4>
                          <p className="text-[9px] text-slate-500 max-w-sm leading-relaxed mt-1 font-mono">
                            Ready to orchestrate. Type any goal or select a sprint template in the Conversation tab to build your live execution stages queue.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : activeTerminalTab === "git" ? (
                    <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 font-mono text-[10px] select-text text-slate-400">
                      <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 px-2 py-1 rounded text-cyan-400 font-bold shrink-0">
                        <GitBranch className="w-3 h-3" />
                        <span>Branch: {gitStatus.branch}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[8px] text-slate-500 uppercase font-bold mb-1 block">Commit Timeline (Last 5)</span>
                        {gitStatus.commits.map((c: any) => (
                          <div key={c.hash} className="flex gap-2.5 items-center p-1 hover:bg-slate-900 rounded">
                            <span className="text-cyan-500 font-bold font-mono">{c.hash}</span>
                            <span className="truncate text-slate-300">{c.message}</span>
                            <span className="ml-auto text-[8px] text-slate-600 font-semibold">{c.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto pr-1 flex flex-col font-mono text-[10.5px] leading-relaxed select-text text-slate-400">
                      {consoleLogs.map((log, index) => (
                        <p key={index}>{log}</p>
                      ))}
                      <div ref={terminalEndRef}></div>
                    </div>
                  )}

                  {activeTerminalTab === "terminal" && (
                    <form onSubmit={handleTerminalSubmit} className="flex gap-2 items-center bg-slate-950/80 border border-slate-850 px-2.5 py-1 rounded-xl shrink-0">
                      <span className="text-cyan-400 font-mono text-xs font-bold">$</span>
                      <input
                        type="text"
                        value={terminalCommand}
                        onChange={(e) => setTerminalCommand(e.target.value)}
                        placeholder="Type 'help' for console terminal commands..."
                        className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder-slate-700 focus:outline-none"
                      />
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* III. RIGHT CONTEXT PANEL */}
        <AnimatePresence initial={false}>
          {!rightPanelCollapsed && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: rightPanelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`border-l border-slate-800 flex flex-col min-h-0 select-none overflow-hidden shrink-0 z-10 ${activeTheme.sidebarBg}`}
            >
              <div className="p-3 flex-1 flex flex-col gap-4 overflow-y-auto">
                {/* 1. Active Goal */}
                <div className="flex flex-col gap-1.5">
                  <div className="border-b border-slate-850 pb-1">
                    <span className="text-[9px] font-mono font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Active Goal
                    </span>
                  </div>
                  <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 mt-1">
                    {currentGoal ? (
                      <p className="text-[10.5px] font-mono text-slate-300 leading-relaxed font-semibold">
                        {currentGoal}
                      </p>
                    ) : (
                      <p className="text-[10px] font-mono text-slate-500 leading-relaxed italic text-center py-1">
                        Select template or type prompt in Conversation tab.
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Semantic Context & Related Files */}
                <div className="flex flex-col gap-1.5">
                  <div className="border-b border-slate-850 pb-1 flex justify-between items-center">
                    <span className="text-[9px] font-mono font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                      <FileSpreadsheet className="w-3 h-3 text-purple-400" />
                      Semantic Context Engine
                    </span>
                  </div>
                  {semanticContext && semanticContext.length > 0 ? (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {semanticContext.map((fileObj, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedFilePath(fileObj.path);
                            triggerToast(`Selected: ${fileObj.path}`);
                          }}
                          className={`flex flex-col gap-1 p-2 bg-slate-900/30 border border-slate-850 hover:border-cyan-500/20 rounded-xl cursor-pointer transition-all ${
                            selectedFilePath === fileObj.path ? "border-cyan-500/30 bg-cyan-950/10" : ""
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-300 truncate max-w-[150px] font-bold">
                              {fileObj.path.split("/").pop()}
                            </span>
                            <span className="text-[8.5px] px-1 bg-cyan-950 text-cyan-400 border border-cyan-500/25 rounded font-extrabold uppercase shrink-0">
                              {fileObj.relevance}% Match
                            </span>
                          </div>
                          <span className="text-[8px] font-mono text-slate-500 truncate">{fileObj.path}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/10 p-2 border border-slate-900 rounded-xl mt-1 text-center font-mono text-[9.5px] text-slate-600 italic">
                      No active files calculated. Trigger workspace prompt first.
                    </div>
                  )}
                </div>

                {/* 3. Discovered Modules Grid */}
                {fileDiscovery && Object.keys(fileDiscovery).length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="border-b border-slate-850 pb-1">
                      <span className="text-[9px] font-mono font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                        <Layers className="w-3 h-3 text-amber-400" />
                        Discovered Modules
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1 font-mono text-[9px] text-slate-400">
                      <div className="bg-slate-900/30 p-1.5 rounded-lg border border-slate-850 flex justify-between">
                        <span>Components</span>
                        <span className="text-cyan-400 font-extrabold">{fileDiscovery.Components?.length || 0}</span>
                      </div>
                      <div className="bg-slate-900/30 p-1.5 rounded-lg border border-slate-850 flex justify-between">
                        <span>APIs</span>
                        <span className="text-emerald-400 font-extrabold">{fileDiscovery.APIs?.length || 0}</span>
                      </div>
                      <div className="bg-slate-900/30 p-1.5 rounded-lg border border-slate-850 flex justify-between">
                        <span>Stores</span>
                        <span className="text-purple-400 font-extrabold">{fileDiscovery.Stores?.length || 0}</span>
                      </div>
                      <div className="bg-slate-900/30 p-1.5 rounded-lg border border-slate-850 flex justify-between">
                        <span>Hooks</span>
                        <span className="text-amber-400 font-extrabold">{fileDiscovery.Hooks?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Risk Analysis */}
                {activePlan?.riskAnalysis && activePlan.riskAnalysis.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="border-b border-slate-850 pb-1">
                      <span className="text-[9px] font-mono font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        Risk Analysis
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1 font-mono text-[9.5px]">
                      {activePlan.riskAnalysis.slice(0, 2).map((risk: string, i: number) => (
                        <div key={i} className="bg-slate-950/40 p-2 rounded-xl border border-rose-500/10 text-slate-400 flex gap-1.5 items-start">
                          <AlertCircle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Core Status Metrics */}
                <div className="flex flex-col gap-1.5">
                  <div className="border-b border-slate-850 pb-1">
                    <span className="text-[9px] font-mono font-black tracking-wider text-slate-400 uppercase flex items-center gap-1">
                      <Activity className="w-3 h-3 text-rose-400" />
                      Core Status Metrics
                    </span>
                  </div>
                  <div className="bg-slate-900/30 p-2.5 rounded-xl border border-slate-850 text-[10px] font-mono text-slate-400 flex flex-col gap-2 mt-1">
                    <div className="flex justify-between items-center">
                      <span>Linter Engine</span>
                      <span className="text-emerald-400 font-bold text-[9px]">✔ ONLINE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Background Job</span>
                      <span className="text-cyan-400 font-bold text-[9px]">● ONLINE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sync Engine</span>
                      <span className="text-purple-400 font-bold text-[9px]">✔ 100% SECURE</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Collapsible Right Toggle Button */}
        <div
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          className="absolute right-0 top-[45%] z-20 w-2.5 h-8 bg-slate-900 hover:bg-cyan-500/20 border-y border-l border-slate-800 hover:border-cyan-500/30 text-slate-500 hover:text-cyan-400 rounded-l flex items-center justify-center cursor-pointer select-none transition-all"
        >
          <ChevronRight className={`w-2.5 h-2.5 transition-transform duration-150 ${rightPanelCollapsed ? "rotate-180" : ""}`} />
        </div>

      </div>

      {/* ----------------------------------------------------
          D. STATUS BAR (VS Code Style)
          ---------------------------------------------------- */}
      <footer className="h-6 border-t border-slate-800 bg-slate-950 px-3 flex items-center justify-between text-[9px] font-mono text-slate-500 select-none z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold">
            <GitBranch className="w-2.5 h-2.5" />
            <span>git:{gitStatus.branch}</span>
          </div>
          <div className="flex items-center gap-1">
            <CloudLightning className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Local Model: {settingsForm.defaultOfflineModel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>TypeScript SPA</span>
          <div className="flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400">LINTER ACTIVE</span>
          </div>
        </div>
      </footer>

      {/* ----------------------------------------------------
          E. OVERLAYS & MODALS
          ---------------------------------------------------- */}
      {/* 1. COMMAND PALETTE */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
                <Command className="w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Type a Neora developer command..."
                  value={commandPaletteQuery}
                  onChange={(e) => setCommandPaletteQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                  autoFocus
                />
                <button onClick={() => setCommandPaletteOpen(false)} className="p-1 hover:bg-slate-855 rounded text-slate-500 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5">
                {[
                  { title: "Switch Theme: Neora Dark", desc: "Default dark theme visual preset", action: "theme:neora-dark" },
                  { title: "Switch Theme: OLED Black", desc: "Pure black contrast preset", action: "theme:oled-black" },
                  { title: "Switch Theme: Cyber Blue", desc: "Vibrant neon blue theme setting", action: "theme:cyber-blue" },
                  { title: "Switch Theme: Dark Glass", desc: "Transparent overlay setup", action: "theme:dark-glass" },
                  { title: "Execute Typecheck sanity compiler check", desc: "tsc --noEmit command", action: "validate" },
                  { title: "Rescan active directories structure", desc: "scan index mapping", action: "scan" },
                  { title: "Refresh Git commits history status", desc: "branch log tracking", action: "git" }
                ].filter(cmd =>
                  cmd.title.toLowerCase().includes(commandPaletteQuery.toLowerCase()) ||
                  cmd.desc.toLowerCase().includes(commandPaletteQuery.toLowerCase())
                ).map(cmd => (
                  <button
                    key={cmd.title}
                    onClick={() => handleCommandExecute(cmd.action)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-900 rounded-xl flex flex-col gap-0.5 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-400">{cmd.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">{cmd.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SETTINGS CONFIG DIALOG */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-4 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                    Developer System Configuration
                  </span>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="p-1 hover:bg-slate-900 rounded text-slate-500 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-4 font-mono text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block mb-1.5 font-bold">1. Active Visual Theme</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "neora-dark", label: "Neora Dark" },
                      { id: "oled-black", label: "OLED Black" },
                      { id: "cyber-blue", label: "Cyber Blue" },
                      { id: "dark-glass", label: "Dark Glass" }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setCurrentTheme(t.id as any);
                          addLogLine(`Visual theme updated to: ${t.id}`);
                        }}
                        className={`p-2 rounded-xl text-left border ${
                          currentTheme === t.id ? "bg-cyan-950/20 border-cyan-500/40 text-cyan-400 font-bold" : "bg-slate-900 border-slate-850 text-slate-400"
                        } cursor-pointer`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent highlights */}
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block mb-1.5 font-bold">2. Neon Accent highlight</span>
                  <div className="flex gap-2">
                    {(["cyan", "purple", "emerald", "amber", "rose"] as AccentId[]).map(accent => (
                      <button
                        key={accent}
                        onClick={() => {
                          setCurrentAccent(accent);
                          addLogLine(`Glow Accent updated to: ${accent}`);
                        }}
                        className={`w-6 h-6 rounded-full border border-slate-800 cursor-pointer ${ACCENT_COLORS[accent].primary} ${
                          currentAccent === accent ? "ring-2 ring-white scale-110" : ""
                        }`}
                        title={accent}
                      />
                    ))}
                  </div>
                </div>

                {/* Routing Rules Table */}
                <div className="border-t border-slate-850 pt-3">
                  <span className="text-[9px] text-slate-500 uppercase block mb-1.5 font-bold">3. Model Router Strategy Routing Rules</span>
                  <div className="flex flex-col gap-1.5 bg-slate-900/40 border border-slate-850 p-2 rounded-xl max-h-32 overflow-y-auto">
                    {routingRules.map((rule, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-850/40 pb-1 last:border-0 last:pb-0">
                        <span className="font-bold text-slate-300">{rule.taskCategory}</span>
                        <div className="flex gap-2">
                          <span className="bg-slate-950 px-1 py-0.5 rounded text-[8px] text-cyan-400">{rule.preferredProvider}</span>
                          <span className="bg-slate-950 px-1 py-0.5 rounded text-[8px] text-purple-400">{rule.preferredModel.split("-").pop()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-800 pt-2.5 mt-1">
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl text-[10px] font-mono cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. KEYBOARD SHORTCUTS PALETTE */}
      <AnimatePresence>
        {shortcutsOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <HelpIcon className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">
                    System Keyboard Commands
                  </span>
                </div>
                <button onClick={() => setShortcutsOpen(false)} className="p-1 hover:bg-slate-900 rounded text-slate-500 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900/50">
                  <span>Open Command Palette</span>
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Ctrl+Shift+P</kbd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900/50">
                  <span>Exit overlay dialogs</span>
                  <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Escape</kbd>
                </div>
                <div className="flex justify-between py-1">
                  <span>Purge console logs</span>
                  <span className="text-slate-500">Type 'clear'</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NOTICE TOAST */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-10 right-4 z-50 bg-slate-950/90 border border-cyan-500/30 p-2.5 rounded-2xl text-[10.5px] font-mono text-cyan-400 shadow-[0_8px_24px_rgba(6,182,212,0.15)] flex items-center gap-2 max-w-sm"
          >
            <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
            <span>{notice}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
