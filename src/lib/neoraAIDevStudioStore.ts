import fs from "node:fs";
import path from "node:path";

// --- DATABASE SCHEMAS FOR AI DEVELOPMENT STUDIO ---

export interface AIDevProject {
  id: string;
  name: string;
  framework: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: "Development" | "Debugging" | "Feature" | "Refactor" | "UI" | "Backend" | "Database" | "Deployment" | "Security" | "AI" | "Automation";
  prompt: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface PromptHistory {
  id: string;
  prompt: string;
  category: string;
  tokens: number;
  timestamp: string;
  isFavorite?: boolean;
}

export interface ExecutionHistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  status: "success" | "failed" | "running";
  modelUsed: string;
  plan: any;
  steps: string[];
  durationMs: number;
}

export interface DevReport {
  id: string;
  title: string;
  summary: string;
  filesModified: string[];
  errorsFixed: string[];
  risks: string[];
  suggestions: string[];
  markdownContent: string;
  createdAt: string;
}

export interface RoutingRule {
  id: string;
  taskCategory: string;
  preferredProvider: "Online" | "Offline";
  preferredModel: string;
  reason: string;
}

export interface DevMemory {
  codingStyle: string;
  preferredLibraries: string[];
  frequentlyEditedFiles: string[];
  successfulFixes: Array<{
    errorPattern: string;
    fixPattern: string;
    confidence: number;
  }>;
}

export interface AIDevStudioDatabase {
  projects: AIDevProject[];
  promptHistory: PromptHistory[];
  templates: PromptTemplate[];
  executionHistory: ExecutionHistoryItem[];
  reports: DevReport[];
  routingRules: RoutingRule[];
  memory: DevMemory;
  developerSettings: {
    ollamaEndpoint: string;
    defaultOnlineModel: string;
    defaultOfflineModel: string;
    autoHealEnabled: boolean;
    maxRetries: number;
    sandboxExecution: boolean;
  };
  semanticIndex?: any;
  embeddingStore?: any;
}

const DB_FILE_PATH = path.resolve(process.cwd(), "neora_ai_dev_studio_db.json");

const defaultDatabase: AIDevStudioDatabase = {
  projects: [
    {
      id: "neora_os",
      name: "Neora Design Operating System",
      framework: "React + Vite + Express + Node",
      path: ".",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  promptHistory: [
    {
      id: "hist_1",
      prompt: "Create a glassmorphic sidebar for Neora OS containing high-contrast vector icons and slide-in motion transitions.",
      category: "UI",
      tokens: 412,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      isFavorite: true
    },
    {
      id: "hist_2",
      prompt: "Fix standard TypeScript type errors regarding optional props in custom Recharts analytics bar layouts.",
      category: "Debugging",
      tokens: 285,
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ],
  templates: [
    {
      id: "tmpl_1",
      title: "Generate Clean React Component",
      description: "Generates a fully typed React component utilizing glassmorphic styles and custom Tailwind classes.",
      category: "UI",
      prompt: "Write a complete, production-ready React functional component for [component name]. Follow these parameters:\n1. Strict TypeScript typing.\n2. Beautiful glassmorphic design utilizing a rich dark background (`bg-slate-950/40 backdrop-blur-md`), neat cyan/violet borders, and high-contrast styling.\n3. Import all vector icons from 'lucide-react'.\n4. Add micro-interactions and motion animations.",
      isFavorite: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "tmpl_2",
      title: "Analyze and Fix TypeScript Errors",
      description: "Automated analysis of stack trace outputs to provide clean, error-free surgical code patches.",
      category: "Debugging",
      prompt: "Review the following TypeScript error output and provide a targeted surgical repair strategy:\nError Log:\n[insert log here]\nAffected File:\n[insert file code here]",
      isFavorite: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "tmpl_3",
      title: "Create Express API Endpoints",
      description: "Generates robust backend controller routes with request parameter validation and JSON schemas.",
      category: "Backend",
      prompt: "Create a fully functional Express backend endpoint for `/api/v1/[resource]`. Ensure it has:\n1. Detailed request parameter validation.\n2. Try/Catch blocks with structured error handling.\n3. Clean async/await syntax.\n4. Complete integration with the local state manager.",
      isFavorite: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "tmpl_4",
      title: "Database Schema Blueprinting",
      description: "Generates standardized schema designs and security rule declarations.",
      category: "Database",
      prompt: "Define a robust schema strategy for a collection named '[collection_name]'. Include:\n1. Detailed properties and data types.\n2. Visual indexing suggestions.\n3. Production-ready Firestore Security Rules covering read, write, create, and list permissions.",
      isFavorite: false,
      createdAt: new Date().toISOString()
    }
  ],
  executionHistory: [],
  reports: [],
  routingRules: [
    { id: "rule_1", taskCategory: "UI", preferredProvider: "Online", preferredModel: "gemini-3.5-flash", reason: "Superior responsive visualization layout planning" },
    { id: "rule_2", taskCategory: "Backend", preferredProvider: "Online", preferredModel: "gemini-3.1-pro-preview", reason: "Deep contextual reasoning for modular endpoint design" },
    { id: "rule_3", taskCategory: "Debugging", preferredProvider: "Online", preferredModel: "gemini-3.1-pro-preview", reason: "Complex stack trace reasoning and surgical error analysis" },
    { id: "rule_4", taskCategory: "Simple Tasks", preferredProvider: "Offline", preferredModel: "Qwen-2.5-Coder", reason: "Instant low-latency processing without cloud requests" }
  ],
  memory: {
    codingStyle: "Functional components, hooks, strict TypeScript, responsive utility classes first, glassmorphism UI.",
    preferredLibraries: ["@google/genai", "lucide-react", "motion", "recharts", "d3"],
    frequentlyEditedFiles: ["src/App.tsx", "server.ts", "src/components/layout/AppShell.tsx"],
    successfulFixes: [
      { errorPattern: "Module not found", fixPattern: "Run 'npm install' or check import path case-sensitivity", confidence: 95 },
      { errorPattern: "not assignable to parameter of type", fixPattern: "Add strict interfaces or utilize explicit type assertions", confidence: 90 }
    ]
  },
  developerSettings: {
    ollamaEndpoint: "http://localhost:11434",
    defaultOnlineModel: "gemini-3.5-flash",
    defaultOfflineModel: "Qwen-2.5-Coder",
    autoHealEnabled: true,
    maxRetries: 3,
    sandboxExecution: true
  },
  semanticIndex: null,
  embeddingStore: null
};

export function readAIDevStudioDatabase(): AIDevStudioDatabase {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultDatabase, null, 2), "utf-8");
      return defaultDatabase;
    }
    const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to read AI Dev Studio Database:", err);
    return defaultDatabase;
  }
}

export function writeAIDevStudioDatabase(db: AIDevStudioDatabase): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write AI Dev Studio Database:", err);
  }
}
