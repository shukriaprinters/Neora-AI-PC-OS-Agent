// NEORA ENTERPRISE CORE RUNTIME KERNEL (Phase 2.3.6A.1.5)
// The operating kernel of Neora Design OS. Coordinates all services, events, permissions, and AI routing.

export type KernelServiceId =
  | "workspace_runtime"
  | "epdms"
  | "ecve"
  | "esarwpe"
  | "nuar"
  | "nlar"
  | "nge"
  | "nvip"
  | "plugin_engine"
  | "export_service";

export type KernelServiceStatus = "unloaded" | "initialized" | "running" | "paused" | "degraded" | "stopped";

export interface KernelService {
  id: KernelServiceId;
  name: string;
  version: string;
  status: KernelServiceStatus;
  dependencies: KernelServiceId[];
  isLocalOnly: boolean;
  cpuRequiredPercent: number;
}

export interface KernelEvent {
  id: string;
  timestamp: string;
  topic:
    | "SystemStarted"
    | "ServiceStatusChanged"
    | "CommandExecuted"
    | "PermissionUpdated"
    | "WorkflowTriggered"
    | "SecurityIntervention"
    | "TelemetryLogged";
  source: string;
  message: string;
  metadata?: any;
}

export interface KernelPermission {
  key: "project_access" | "workspace_access" | "plugin_sandbox" | "filesystem_write" | "internet_api" | "ai_orchestration";
  label: string;
  allowed: boolean;
  scope: "global" | "project_only" | "denied";
}

export interface KernelWorkflowStep {
  id: string;
  targetService: KernelServiceId;
  operation: string;
  status: "pending" | "running" | "completed" | "failed";
}

export interface KernelWorkflow {
  id: string;
  name: string;
  steps: KernelWorkflowStep[];
  status: "idle" | "running" | "success" | "failed";
  triggeredAt: string;
}

export interface KernelJob {
  id: string;
  name: string;
  intervalMs: number;
  lastRunAt: string | null;
  status: "sleeping" | "executing" | "failed";
  priority: "low" | "medium" | "high";
}

export class EnterpriseKernel {
  private static instance: EnterpriseKernel | null = null;

  private services: KernelService[] = [];
  private eventHistory: KernelEvent[] = [];
  private permissions: KernelPermission[] = [];
  private activeWorkflows: KernelWorkflow[] = [];
  private backgroundJobs: KernelJob[] = [];
  private listeners: ((event: KernelEvent) => void)[] = [];

  // Active AI Routing Preferences
  private activeAiRouterTarget: "neora_native" | "ollama" | "openai" | "gemini" | "hybrid_load_balancer" = "hybrid_load_balancer";

  private constructor() {
    this.seedServices();
    this.seedPermissions();
    this.seedWorkflows();
    this.seedBackgroundJobs();
    
    this.logEvent("SystemStarted", "Neora Kernel Runtime starting up...", "kernel");
    this.services.forEach(s => {
      s.status = "running";
      this.logEvent("ServiceStatusChanged", `Service loaded: ${s.name} (v${s.version}) status changed to RUNNING`, "kernel");
    });
  }

  public static getInstance(): EnterpriseKernel {
    if (!EnterpriseKernel.instance) {
      EnterpriseKernel.instance = new EnterpriseKernel();
    }
    return EnterpriseKernel.instance;
  }

  private seedServices() {
    this.services = [
      { id: "workspace_runtime", name: "Workspace Runtime", version: "1.0.0", status: "unloaded", dependencies: [], isLocalOnly: true, cpuRequiredPercent: 5 },
      { id: "epdms", name: "EPDMS (Project Manager)", version: "2.1.0", status: "unloaded", dependencies: [], isLocalOnly: false, cpuRequiredPercent: 12 },
      { id: "ecve", name: "ECVE (Canvas Viewport)", version: "2.3.0", status: "unloaded", dependencies: [], isLocalOnly: true, cpuRequiredPercent: 15 },
      { id: "esarwpe", name: "ESARWPE (Autosave Engine)", version: "1.4.0", status: "unloaded", dependencies: ["epdms"], isLocalOnly: true, cpuRequiredPercent: 4 },
      { id: "nuar", name: "NUAR (AI Runtime)", version: "4.2.0", status: "unloaded", dependencies: [], isLocalOnly: false, cpuRequiredPercent: 20 },
      { id: "nlar", name: "NLAR (Local Engine)", version: "1.2.0", status: "unloaded", dependencies: [], isLocalOnly: true, cpuRequiredPercent: 8 },
      { id: "nge", name: "NGE (Graphics Engine)", version: "3.5.0", status: "unloaded", dependencies: ["ecve"], isLocalOnly: true, cpuRequiredPercent: 10 },
      { id: "nvip", name: "NVIP (Vision Platform)", version: "2.0.0", status: "unloaded", dependencies: ["nuar"], isLocalOnly: false, cpuRequiredPercent: 18 },
    ];
  }

  private seedPermissions() {
    this.permissions = [
      { key: "project_access", label: "Read/Write Project Files", allowed: true, scope: "global" },
      { key: "workspace_access", label: "Monitor Canvas Coordinates", allowed: true, scope: "global" },
      { key: "plugin_sandbox", label: "Enforce Plugin Virtualization", allowed: true, scope: "global" },
      { key: "filesystem_write", label: "Save Native .neora Packages", allowed: true, scope: "project_only" },
      { key: "internet_api", label: "Reach External Provider API Endpoints", allowed: true, scope: "global" },
      { key: "ai_orchestration", label: "Route Generative AI Prompts", allowed: true, scope: "global" },
    ];
  }

  private seedWorkflows() {
    this.activeWorkflows = [
      {
        id: "wf-publish-001",
        name: "Enterprise Production Rebranding Packaging",
        status: "idle",
        triggeredAt: "2026-07-19T03:00:00Z",
        steps: [
          { id: "step-1", targetService: "workspace_runtime", operation: "Lock Workspace State", status: "completed" },
          { id: "step-2", targetService: "ecve", operation: "Render Vector Artboard Assets", status: "completed" },
          { id: "step-3", targetService: "nuar", operation: "Validate Prompt Palette Contrast", status: "completed" },
          { id: "step-4", targetService: "epdms", operation: "Git-style Merge & Save Commit", status: "completed" },
          { id: "step-5", targetService: "export_service", operation: "Archive Compressed .neora package", status: "completed" },
        ],
      },
    ];
  }

  private seedBackgroundJobs() {
    this.backgroundJobs = [
      { id: "job-autosave", name: "Incremental Delta Autosave Watcher", intervalMs: 10000, lastRunAt: null, status: "sleeping", priority: "high" },
      { id: "job-vram-cleanup", name: "VRAM GPU Texture Garbage Collection", intervalMs: 30000, lastRunAt: null, status: "sleeping", priority: "medium" },
      { id: "job-sync", name: "Neora Cloud Synchronizer Thread", intervalMs: 60000, lastRunAt: null, status: "sleeping", priority: "low" },
    ];
  }

  // Getters
  public getServices(): KernelService[] { return this.services; }
  public getEventHistory(): KernelEvent[] { return this.eventHistory; }
  public getPermissions(): KernelPermission[] { return this.permissions; }
  public getActiveWorkflows(): KernelWorkflow[] { return this.activeWorkflows; }
  public getBackgroundJobs(): KernelJob[] { return this.backgroundJobs; }
  public getActiveAiRouterTarget() { return this.activeAiRouterTarget; }

  // Mutation commands
  public setAiRouterTarget(val: EnterpriseKernel["activeAiRouterTarget"]) {
    this.activeAiRouterTarget = val;
    this.logEvent("CommandExecuted", `Set AI Service Router rule priority target to: ${val.toUpperCase()}`, "router");
  }

  public togglePermission(key: KernelPermission["key"]) {
    this.permissions = this.permissions.map(p => {
      if (p.key === key) {
        const nextVal = !p.allowed;
        this.logEvent("PermissionUpdated", `Toggled permission '${p.label}' constraint to: ${nextVal ? "ALLOWED" : "BLOCKED"}`, "security");
        return { ...p, allowed: nextVal, scope: nextVal ? "global" : "denied" as const };
      }
      return p;
    });
  }

  public startService(id: KernelServiceId) {
    this.services = this.services.map(s => {
      if (s.id === id) {
        this.logEvent("ServiceStatusChanged", `Bootstrap service startup triggered for: ${s.name}`, "kernel");
        return { ...s, status: "running" as const };
      }
      return s;
    });
  }

  public stopService(id: KernelServiceId) {
    this.services = this.services.map(s => {
      if (s.id === id) {
        this.logEvent("ServiceStatusChanged", `Graceful shutdown command sent to: ${s.name}`, "kernel");
        return { ...s, status: "stopped" as const };
      }
      return s;
    });
  }

  // Triggering the Workflow orchestration
  public triggerWorkflowSimulation(name: string) {
    const wfId = `wf-custom-${Date.now().toString().slice(-4)}`;
    const newWf: KernelWorkflow = {
      id: wfId,
      name,
      status: "running",
      triggeredAt: new Date().toISOString(),
      steps: [
        { id: "step-1", targetService: "workspace_runtime", operation: "Verify Active Workspaces", status: "running" },
        { id: "step-2", targetService: "epdms", operation: "Fetch Active Checkpoint Branches", status: "pending" },
        { id: "step-3", targetService: "ecve", operation: "Pre-render Smart Snap Vectors", status: "pending" },
        { id: "step-4", targetService: "nuar", operation: "Validate Visual Design Aesthetics", status: "pending" },
      ],
    };

    this.activeWorkflows.unshift(newWf);
    this.logEvent("WorkflowTriggered", `Orchestrating workflow process flow: "${name}"`, "kernel");

    // Simulate progressive execution
    setTimeout(() => {
      newWf.steps[0].status = "completed";
      newWf.steps[1].status = "running";
      this.logEvent("TelemetryLogged", `Workflow step 1 (Workspace Validation) completed. Running EPDMS checkout...`, "orchestrator");
    }, 1000);

    setTimeout(() => {
      newWf.steps[1].status = "completed";
      newWf.steps[2].status = "running";
      this.logEvent("TelemetryLogged", `EPDMS checkout completed. Rendering canvas viewports...`, "orchestrator");
    }, 2000);

    setTimeout(() => {
      newWf.steps[2].status = "completed";
      newWf.steps[3].status = "running";
      this.logEvent("TelemetryLogged", `ECVE rendering completed. Invoking neural aesthetics scorer...`, "orchestrator");
    }, 3000);

    setTimeout(() => {
      newWf.steps[3].status = "completed";
      newWf.status = "success";
      this.logEvent("CommandExecuted", `Enterprise workflow pipeline "${name}" completed with 100% success.`, "orchestrator");
    }, 4000);
  }

  // Running background job scheduler tick
  public triggerJobTick(id: string) {
    this.backgroundJobs = this.backgroundJobs.map(job => {
      if (job.id === id) {
        this.logEvent("TelemetryLogged", `Invoked scheduled scheduler execution loop on background process thread: ${job.name}`, "scheduler");
        return { ...job, lastRunAt: new Date().toISOString() };
      }
      return job;
    });
  }

  // Event subscription
  public subscribe(cb: (event: KernelEvent) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private logEvent(topic: KernelEvent["topic"], message: string, source: string, metadata?: any) {
    const ev: KernelEvent = {
      id: `kernel-ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      topic,
      source,
      message,
      metadata,
    };
    this.eventHistory.unshift(ev);
    if (this.eventHistory.length > 50) this.eventHistory.pop();
    this.listeners.forEach(cb => cb(ev));
  }
}
export default EnterpriseKernel;
