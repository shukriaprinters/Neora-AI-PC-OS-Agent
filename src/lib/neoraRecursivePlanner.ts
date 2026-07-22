import crypto from "node:crypto";
import { GoogleGenAI } from "@google/genai";

export interface RequirementAnalysis {
  functional: string[];
  nonFunctional: string[];
  business: string[];
  ux: string[];
  security: string[];
  performance: string[];
  accessibility: string[];
  deployment: string[];
  maintenance: string[];
  futureExpansion: string[];
}

export type PriorityLevel =
  | "Critical Foundation"
  | "Architecture"
  | "Core Services"
  | "Shared Infrastructure"
  | "Business Logic"
  | "User Interface"
  | "Automation"
  | "Optimization"
  | "Advanced Features"
  | "Experimental Features";

export type DecompositionLevel =
  | "Platform"
  | "Subsystem"
  | "Module"
  | "Feature"
  | "Component"
  | "Service"
  | "Interface"
  | "Validation"
  | "Documentation"
  | "Release";

export interface RecursiveNode {
  id: string;
  level: DecompositionLevel;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: "Pending" | "In_Progress" | "Validated" | "Failed";
  dependencies: string[];
  assignedAgents: string[];
  acceptanceCriteria: string[];
  children?: RecursiveNode[];
}

export interface RiskItem {
  id: string;
  category: "Architectural" | "Technical" | "Security" | "Performance" | "Scalability" | "Compatibility" | "Maintainability" | "Operational";
  risk: string;
  impact: "High" | "Medium" | "Low";
  probability: "High" | "Medium" | "Low";
  mitigation: string;
}

export interface ArchitectureDecision {
  id: string;
  title: string;
  whyChosen: string;
  alternatives: string[];
  whyAlternativesRejected: string;
  futureImpact: string;
  isReversible: boolean;
}

export interface DependencyNode {
  name: string;
  type: "Module" | "Technology" | "Data" | "API" | "UI" | "Plugin" | "AI Model" | "Infrastructure";
  dependsOn: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  hasConflicts: boolean;
  conflicts: string[];
}

export interface RecursivePlan {
  id: string;
  goal: string;
  timestamp: string;
  requirements: RequirementAnalysis;
  tree: RecursiveNode[];
  prioritizedTasks: {
    id: string;
    title: string;
    level: DecompositionLevel;
    priority: PriorityLevel;
    status: "Pending" | "In_Progress" | "Validated" | "Failed";
    dependencies: string[];
    acceptanceCriteria: string[];
  }[];
  riskMatrix: RiskItem[];
  architectureDecisions: ArchitectureDecision[];
  dependencyGraph: DependencyGraph;
  completionScore: number;
}

// Global in-memory store for generated recursive plans
const recursivePlansStore: Map<string, RecursivePlan> = new Map();

function getGeminiClient(apiKey?: string): GoogleGenAI {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is required for recursive plan generation");
  return new GoogleGenAI({ apiKey: key });
}

export async function generateRecursivePlan(
  goal: string,
  geminiApiKey?: string,
  existingFiles: string[] = []
): Promise<RecursivePlan> {
  const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = getGeminiClient(apiKey);
      const promptText = `You are Neora Genesis Autonomous Planning Intelligence.
You are processing a goal according to "NEORA GENESIS DOCUMENT A PART 2: AUTONOMOUS REQUIREMENT ANALYSIS & RECURSIVE PLANNING ENGINE".

User Goal: "${goal}"
Context Files in Workspace: ${JSON.stringify(existingFiles.slice(0, 30))}

Produce a comprehensive JSON object representing the Recursive Plan.
Strict JSON schema required:
{
  "requirements": {
    "functional": ["string"],
    "nonFunctional": ["string"],
    "business": ["string"],
    "ux": ["string"],
    "security": ["string"],
    "performance": ["string"],
    "accessibility": ["string"],
    "deployment": ["string"],
    "maintenance": ["string"],
    "futureExpansion": ["string"]
  },
  "tree": [
    {
      "id": "node_1",
      "level": "Platform" | "Subsystem" | "Module" | "Feature" | "Component" | "Service" | "Interface" | "Validation" | "Documentation" | "Release",
      "title": "string",
      "description": "string",
      "priority": "Critical Foundation" | "Architecture" | "Core Services" | "Shared Infrastructure" | "Business Logic" | "User Interface" | "Automation" | "Optimization" | "Advanced Features" | "Experimental Features",
      "status": "Pending",
      "dependencies": ["string"],
      "assignedAgents": ["string"],
      "acceptanceCriteria": ["string"],
      "children": [...]
    }
  ],
  "riskMatrix": [
    {
      "id": "risk_1",
      "category": "Architectural" | "Technical" | "Security" | "Performance" | "Scalability" | "Compatibility" | "Maintainability" | "Operational",
      "risk": "string",
      "impact": "High" | "Medium" | "Low",
      "probability": "High" | "Medium" | "Low",
      "mitigation": "string"
    }
  ],
  "architectureDecisions": [
    {
      "id": "adr_1",
      "title": "string",
      "whyChosen": "string",
      "alternatives": ["string"],
      "whyAlternativesRejected": "string",
      "futureImpact": "string",
      "isReversible": boolean
    }
  ],
  "dependencyGraph": {
    "nodes": [
      {
        "name": "string",
        "type": "Module" | "Technology" | "Data" | "API" | "UI" | "Plugin" | "AI Model" | "Infrastructure",
        "dependsOn": ["string"]
      }
    ],
    "hasConflicts": boolean,
    "conflicts": ["string"]
  }
}

Important Rules:
1. Ensure 'priority' fields follow the strict priority order: Critical Foundation -> Architecture -> Core Services -> Shared Infrastructure -> Business Logic -> User Interface -> Automation -> Optimization -> Advanced Features -> Experimental Features.
2. Ensure decomposition levels hierarchically break down from Platform/Subsystem down to Component/Service/Interface/Validation.
3. Keep response valid JSON only.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const planId = `rec_plan_${crypto.randomBytes(4).toString("hex")}`;
        
        // Flatten tasks and sort by priority engine order
        const flattenedTasks = flattenAndPrioritizeNodes(parsed.tree || []);

        const fullPlan: RecursivePlan = {
          id: planId,
          goal,
          timestamp: new Date().toISOString(),
          requirements: parsed.requirements || getFallbackRequirements(goal),
          tree: parsed.tree || getFallbackTree(goal),
          prioritizedTasks: flattenedTasks,
          riskMatrix: parsed.riskMatrix || getFallbackRisks(goal),
          architectureDecisions: parsed.architectureDecisions || getFallbackADRs(goal),
          dependencyGraph: parsed.dependencyGraph || getFallbackDependencies(),
          completionScore: 0
        };

        recursivePlansStore.set(planId, fullPlan);
        return fullPlan;
      }
    } catch (e) {
      console.warn("Gemini recursive plan generation failed, using heuristic engine:", e);
    }
  }

  // Heuristic Fallback
  const planId = `rec_plan_${crypto.randomBytes(4).toString("hex")}`;
  const fallbackTree = getFallbackTree(goal);
  const flattenedTasks = flattenAndPrioritizeNodes(fallbackTree);

  const fallbackPlan: RecursivePlan = {
    id: planId,
    goal,
    timestamp: new Date().toISOString(),
    requirements: getFallbackRequirements(goal),
    tree: fallbackTree,
    prioritizedTasks: flattenedTasks,
    riskMatrix: getFallbackRisks(goal),
    architectureDecisions: getFallbackADRs(goal),
    dependencyGraph: getFallbackDependencies(),
    completionScore: 0
  };

  recursivePlansStore.set(planId, fallbackPlan);
  return fallbackPlan;
}

export function getRecursivePlanById(planId: string): RecursivePlan | null {
  return recursivePlansStore.get(planId) || null;
}

export function validateTaskNode(planId: string, nodeId: string): RecursivePlan | null {
  const plan = recursivePlansStore.get(planId);
  if (!plan) return null;

  // Update in flattened list
  const taskIndex = plan.prioritizedTasks.findIndex(t => t.id === nodeId);
  if (taskIndex !== -1) {
    plan.prioritizedTasks[taskIndex].status = "Validated";
  }

  // Recursively update tree
  const updateTree = (nodes: RecursiveNode[]) => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        node.status = "Validated";
      }
      if (node.children) {
        updateTree(node.children);
      }
    }
  };
  updateTree(plan.tree);

  // Calculate new score
  const total = plan.prioritizedTasks.length;
  const completed = plan.prioritizedTasks.filter(t => t.status === "Validated").length;
  plan.completionScore = total > 0 ? Math.round((completed / total) * 100) : 0;

  recursivePlansStore.set(planId, plan);
  return plan;
}

// Internal Priority Order map
const PRIORITY_RANK: Record<PriorityLevel, number> = {
  "Critical Foundation": 1,
  "Architecture": 2,
  "Core Services": 3,
  "Shared Infrastructure": 4,
  "Business Logic": 5,
  "User Interface": 6,
  "Automation": 7,
  "Optimization": 8,
  "Advanced Features": 9,
  "Experimental Features": 10
};

function flattenAndPrioritizeNodes(nodes: RecursiveNode[]): RecursivePlan["prioritizedTasks"] {
  const result: RecursivePlan["prioritizedTasks"] = [];

  const traverse = (items: RecursiveNode[]) => {
    for (const item of items) {
      result.push({
        id: item.id || `node_${Math.random().toString(36).slice(2, 7)}`,
        title: item.title,
        level: item.level || "Feature",
        priority: item.priority || "Business Logic",
        status: item.status || "Pending",
        dependencies: item.dependencies || [],
        acceptanceCriteria: item.acceptanceCriteria || ["Functional correctness verified", "Zero compile errors"]
      });

      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  };

  traverse(nodes);

  // Sort according to Document A Part 2 priority engine rules
  result.sort((a, b) => {
    const rankA = PRIORITY_RANK[a.priority] || 99;
    const rankB = PRIORITY_RANK[b.priority] || 99;
    return rankA - rankB;
  });

  return result;
}

function getFallbackRequirements(goal: string): RequirementAnalysis {
  return {
    functional: [
      `Execute core objective: ${goal}`,
      "Ensure API integration and state management reflect requested goals",
      "Expose interactive UI controls for real-time user feedback"
    ],
    nonFunctional: [
      "Sub-second response latency for standard operations",
      "Clean modular code structure adhering to zero-duplication policies",
      "Responsive UI layout supporting desktop and mobile viewports"
    ],
    business: [
      "Streamline user workflows and minimize manual step overhead",
      "Provide audit transparency across executed actions"
    ],
    ux: [
      "High-contrast dark typography and sleek modern controls",
      "Clear status badges and progress indicator bars"
    ],
    security: [
      "Workspace boundary isolation and process environment checks",
      "Zero plain-text API key leaks in browser clients"
    ],
    performance: [
      "Memory usage capped under sandbox browser boundaries",
      "Lazy-loading heavy submodules on demand"
    ],
    accessibility: [
      "WCAG AA contrast ratios on all text elements",
      "Keyboard navigable tabs and control buttons"
    ],
    deployment: [
      "Self-contained build artifact passing linter and tsc verification",
      "Support standard Cloud Run container runtime"
    ],
    maintenance: [
      "Documented architecture decisions and component props",
      "Modular file separation across lib and components"
    ],
    futureExpansion: [
      "Extensible adapter layers for future LLM or tool integrations",
      "Plug-and-play event bus listeners"
    ]
  };
}

function getFallbackTree(goal: string): RecursiveNode[] {
  return [
    {
      id: "node_plat_1",
      level: "Platform",
      title: "Neora Genesis Core Platform Architecture",
      description: `Foundation setup for target objective: ${goal}`,
      priority: "Critical Foundation",
      status: "Pending",
      dependencies: [],
      assignedAgents: ["Architect Agent", "Planner Agent"],
      acceptanceCriteria: ["Directory structure verified", "Types and stores declared"],
      children: [
        {
          id: "node_sub_1",
          level: "Subsystem",
          title: "Autonomous Planning & Requirement Engine",
          description: "Performs recursive gap analysis and priority task scheduling",
          priority: "Architecture",
          status: "In_Progress",
          dependencies: ["node_plat_1"],
          assignedAgents: ["Planner Agent"],
          acceptanceCriteria: ["Recursive analysis generated", "Requirements mapped"],
          children: [
            {
              id: "node_mod_1",
              level: "Module",
              title: "Priority Pipeline & Risk Matrix",
              description: "Enforces strict priority rank and risk mitigations",
              priority: "Core Services",
              status: "Pending",
              dependencies: ["node_sub_1"],
              assignedAgents: ["Security Agent", "Risk Evaluator"],
              acceptanceCriteria: ["Risk matrix compiled", "Priorities sorted"]
            },
            {
              id: "node_mod_2",
              level: "Module",
              title: "Interactive Planning Dashboard UI",
              description: "Exposes real-time requirement matrix and ADR logs to user",
              priority: "User Interface",
              status: "Pending",
              dependencies: ["node_mod_1"],
              assignedAgents: ["Frontend Architect"],
              acceptanceCriteria: ["Dashboard components rendered", "Self-validation controls linked"]
            }
          ]
        }
      ]
    }
  ];
}

function getFallbackRisks(goal: string): RiskItem[] {
  return [
    {
      id: "risk_1",
      category: "Architectural",
      risk: "Risk of tight coupling between execution agents and presentation layer",
      impact: "Medium",
      probability: "Low",
      mitigation: "Strictly decouple via event bus and central store adapters"
    },
    {
      id: "risk_2",
      category: "Performance",
      risk: "Potential context overflow when rendering large recursive trees",
      impact: "Low",
      probability: "Medium",
      mitigation: "Implement collapsible tree node views and virtualized task lists"
    },
    {
      id: "risk_3",
      category: "Security",
      risk: "Unauthorized task execution without permission gate approval",
      impact: "High",
      probability: "Low",
      mitigation: "Enforce Permission Kernel gate checks before executing shell tools"
    }
  ];
}

function getFallbackADRs(goal: string): ArchitectureDecision[] {
  return [
    {
      id: "adr_1",
      title: "Adopt Recursive Tree Hierarchy for Goal Decomposition",
      whyChosen: "Matches Neora Genesis Document A Part 2 specification for multi-level decomposition (Platform -> Subsystem -> Feature -> Component).",
      alternatives: ["Flat TODO list", "Linear checklist without hierarchy"],
      whyAlternativesRejected: "Flat lists fail to represent subsystem dependencies and complex architectural relationships.",
      futureImpact: "Enables sub-agents to claim subtrees independently without task collisions.",
      isReversible: true
    },
    {
      id: "adr_2",
      title: "Enforce Strict Engineering Priority Ranking Engine",
      whyChosen: "Prevents building UI or advanced polish before Critical Foundation and Core Services are verified.",
      alternatives: ["Ad-hoc developer choice", "Simple creation order"],
      whyAlternativesRejected: "Ad-hoc priorities lead to architectural debt and broken dependencies.",
      futureImpact: "Guarantees production stability at every milestone stage.",
      isReversible: false
    }
  ];
}

function getFallbackDependencies(): DependencyGraph {
  return {
    nodes: [
      { name: "Neora Core Kernel", type: "Infrastructure", dependsOn: [] },
      { name: "Recursive Planner Engine", type: "Module", dependsOn: ["Neora Core Kernel"] },
      { name: "AIDevStudio API Router", type: "API", dependsOn: ["Recursive Planner Engine"] },
      { name: "Planning Dashboard UI", type: "UI", dependsOn: ["AIDevStudio API Router"] }
    ],
    hasConflicts: false,
    conflicts: []
  };
}
