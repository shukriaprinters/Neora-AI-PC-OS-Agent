export interface ArchDiagram {
  name: string;
  ascii: string;
  description: string;
}

export const ARCH_DIAGRAMS: ArchDiagram[] = [
  {
    name: "NDSRP Neora Design Studio Runtime Platform",
    ascii: `
+-------------------------------------------------------------------------+
|                  NDSRP CORE STUDIO RUNTIME ARCHITECTURE                 |
+-------------------------------------------------------------------------+
|                                                                         |
|                         [Client / Operator Inputs]                      |
|                                     |                                   |
|                                     v                                   |
|                         +-----------------------+                       |
|                         |  Execution Mode Router|                       |
|                         +-----------------------+                       |
|                           /         |         \\                         |
|                          /          |          \\                        |
|                         v           v           v                       |
|                   {Local Edge}  {Hybrid}  {Cloud Engine}                |
|                                     |                                   |
|                                     v                                   |
|         +-------------------------------------------------------+       |
|         |           12 COOPERATIVE DECOUPLED RUNTIMES           |       |
|         +-------------------------------------------------------+       |
|         | 1. AI Gateway    | 2. Vision Audit   | 3. Render Canvas|      |
|         | 4. Workspace DOM | 5. Asset Cache    | 6. Memory Vault |      |
|         | 7. Sandbox Rule  | 8. Automation DAG | 9. Export Bundler|     |
|         | 10. Security Ledg| 11. Telemetry Mon | 12. Plugin Hooks|      |
|         +-------------------------------------------------------+       |
|                                     |                                   |
|                                     v                                   |
|                         +-----------------------+                       |
|                         | Hardware Accelerators |                       |
|                         +-----------------------+                       |
|                         |  WebGPU | CUDA | CPU  |                       |
|                         +-----------------------+                       |
|                                                                         |
+-------------------------------------------------------------------------+
`,
    description: "The enterprise-ready operational runtime architecture topology of Neora, showing interchangeable execution tiers, WebGL render pipelines, and decoupled service layers."
  },
  {
    name: "NACDI Autonomous Creative Director Cognitive Architecture",
    ascii: `
+------------------------------------------------------------------------+
|              NACDI AUTONOMOUS STRATEGIC REASONING COGNITION            |
+------------------------------------------------------------------------+
|                                                                        |
|                       [User Creative Intent / Goal]                    |
|                                     |                                  |
|                                     v                                  |
|                    [Audience Intelligence Engine]                      |
|                     (Builds Persona / Devices Model)                   |
|                                     |                                  |
|                                     v                                  |
|                      [Brand Strategy Engine]                           |
|                    (Voice, Color, Typography Rules)                    |
|                                     |                                  |
|                                     v                                  |
|                       [Creative Brief Generator]                       |
|                   (Binds Constraints & Objectives DAG)                 |
|                                     |                                  |
|                                     v                                  |
|                     [Decision Intelligence Engine]                     |
|                    (Logs Decision, Rationale, Confide)                 |
|                                     |                                  |
|                  +------------------+------------------+               |
|                  | (Generates Concept Alternatives)    |               |
|                  v                                     v               |
|         {High Luxury Path}                    {Traditional Craft}      |
|                  |                                     |               |
|                  +------------------+------------------+               |
|                                     v                                  |
|                        [Risk Management System]                        |
|                    (Evaluates Brand & Print Threat Radar)              |
|                                     |                                  |
|                                     v                                  |
|                      [Multi-Agent Objectives Dispatch]                 |
|               - Distributes structured targets (No raw prompts)        |
|                                                                        |
+------------------------------------------------------------------------+
`,
    description: "The cognitive strategic planning topology of Neora's Autonomous Creative Director, mapping audience personas, brand matrices, and risk assessments into structured objectives."
  },
  {
    name: "NCOAMPP Multi-Agent Coordination Topology",
    ascii: `
+------------------------------------------------------------------------+
|                      NCOAMPP ORCHESTRATION PIPELINE                     |
+------------------------------------------------------------------------+
|                                                                        |
|    [User Design Intent] ---> [Cortex-P DesignPlanner]                  |
|                                     |                                  |
|                                     v                                  |
|                         [Dynamic Task DAG Planner]                     |
|                                     |                                  |
|               +---------------------+---------------------+            |
|               | (Parallel Specialist Agents Execution)     |            |
|               v                                           v            |
|       [Sleuth Research]                             [Scribe Callig]    |
|               |                                           |            |
|               +---------------------+---------------------+            |
|                                     v                                  |
|                          [GridMaster Layout]                           |
|                                     v                                  |
|                          [Kerner Typography]                           |
|                                     v                                  |
|                          [Sentinel QAReviewer]                         |
|                                     |                                  |
|                                     v                                  |
|                           {Human Approval Gate}                        |
|                                     |                                  |
|                                     v                                  |
|                            [BundleX Export]                            |
|                                     |                                  |
|                                     v                                  |
|                    (Production Print SVG/PDF Packages)                 |
|                                                                        |
|  [Event-Driven Central Bus]                                            |
|   - TaskCreated -> TaskStarted -> TaskCompleted -> ExportCompleted     |
|                                                                        |
+------------------------------------------------------------------------+
`,
    description: "Multi-agent runtime event system planning dynamic directed acyclic graphs (DAGs) of creative execution with parallel agent specialists and manual approval gates."
  },
  {
    name: "Neora State & Storage Architecture",
    ascii: `
+------------------------------------------------------------------------+
|                      NEORA DESIGNER OS STATE ENGINE                     |
+------------------------------------------------------------------------+
|                                                                        |
|  [React Component Layers] <----> [Keyboard Shortcut Manager Engine]    |
|            |                                  |                        |
|            v                                  v                        |
|  +-------------------+              +--------------------+             |
|  |   ProjectStore    |              |    CanvasStore     |             |
|  | - Active Project  |              | - Zoom Factor (50%)|             |
|  | - Project History |              | - Pan Coordinates  |             |
|  +-------------------+              +--------------------+             |
|            |                                  |                        |
|            v                                  v                        |
|  +-------------------+              +--------------------+             |
|  |    LayerStore     |              |   SelectionStore   |             |
|  | - Layer Tree Nodes| <----------> | - Selected Layer Id|             |
|  | - Locked & Visible|              | - Active Bounding  |             |
|  +-------------------+              +--------------------+             |
|            |                                                           |
|            +-----------------------+                                   |
|                                    v                                   |
|                          +--------------------+                        |
|                          |    HistoryStore    |                        |
|                          | - Undo Operations  |                        |
|                          | - Redo Operations  |                        |
|                          +--------------------+                        |
|                                                                        |
|  [REST API Endpoint Synchronization Gateway]                           |
|       |                     |                      |                   |
|       v                     v                      v                   |
|  /api/project/save   /api/layer/update      /api/export/output         |
|       |                     |                      |                   |
|  +------------------------------------------------------------------+  |
|  |                     POSTGRESQL CLOUD SQL DATABASE                |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
`,
    description: "Multi-store decoupled state flow mapping layer actions, dynamic undo caches, and asynchronous server-side REST api calls to PostgreSQL tables."
  },
  {
    name: "Plugin Registry Hook Topology",
    ascii: `
+------------------------------------------------------------------------+
|                     NEORA DESIGNER OS PLUGIN REGISTRY                  |
+------------------------------------------------------------------------+
|                                                                        |
|   +----------------------------------------------------------------+   |
|   |                      Plugin Registry Manager                   |   |
|   +----------------------------------------------------------------+   |
|          |                         |                        |          |
|          v                         v                        v          |
|   +--------------+          +--------------+         +--------------+  |
|   | Sidebar Hook |          | Toolbar Hook |         | Exporter Hook|  |
|   | - Custom     |          | - Injection  |         | - Format     |  |
|   |   Navigation |          |   Control    |         |   Adapters   |  |
|   |   Panels     |          |   Buttons    |         |   (PSD/SVG)  |  |
|   +--------------+          +--------------+         +--------------+  |
|                                                                        |
|   [Registered API Hook Middleware]                                     |
|    - RegisterSidebar(panelId, icon, element)                           |
|    - RegisterToolbarAction(actionId, label, callback)                  |
|    - RegisterExporterAdapter(mimeType, renderCallback)                 |
|                                                                        |
+------------------------------------------------------------------------+
`,
    description: "Detailed pipeline layout demonstrating how independent modules hook into the core editor shell to inject assets, custom sidebars, and custom export capabilities."
  }
];

export const DEVELOPER_DOCS = {
  title: "Neora Designer OS Core Extension Manual",
  chapters: [
    {
      title: "1. Extension Architecture Overview",
      content: `Neora Designer OS is designed with strict modular separation of concerns. Every component operates under single-purpose logic to prevent large-file render penalties:
- **stores.ts**: Manages transactional data states, active workspaces, assets caches, and database schemas.
- **components.tsx**: Contains reusable, visually polished UI primitives (Backdrops, dialog modals, rulers, custom swatches, and tree listings).
- **shortcuts.ts**: Centralizes all keyboard trigger handlers to intercept workspace-focused modifiers.
- **documentation.ts**: Contains this interactive visual systems manual, ensuring developers can analyze layout bindings in real-time.`
    },
    {
      title: "2. Registering a Custom Exporter Plugin",
      content: `To build an output adapter (e.g. exporting to a proprietary mock format or SVG renderers), you hook into Neora's Plugin API:

\`\`\`typescript
import { registerExporterAdapter } from "./plugins";

registerExporterAdapter({
  format: "figma-schema",
  mimeType: "application/x-figma",
  transform: (layers) => {
    return layers.map(l => ({
      name: l.name,
      geometry: { x: l.x, y: l.y, w: l.width, h: l.height },
      fills: [{ type: "SOLID", color: l.color }]
    }));
  }
});
\`\`\`

All active exporters will automatically populate in the 'EXPORT OUTLET' dropdown list in the top toolbar.`
    },
    {
      title: "3. Adding Custom Keyboard Bindings",
      content: `Keyboard bindings are registered in a centralized hook to avoid multiple parallel window listeners:

\`\`\`typescript
import { useKeyboardShortcuts } from "./shortcuts";

useKeyboardShortcuts({
  onSave: () => saveProjectToDB(),
  onUndo: () => triggerUndoAction(),
  onRedo: () => triggerRedoAction(),
  onDelete: () => removeActiveLayer()
});
\`\`\`

The hook is smart-gated: if a user is actively editing labels or text areas, it suspends actions like 'Delete' or 'Undo' automatically.`
    },
    {
      title: "4. Database Integration & Cloud Sync",
      content: `Neora implements a hybrid database model:
1. **Local State Cache**: Immediate visual feedback for layers and coordinates.
2. **Cloud SQL Persistence Relay**: When 'SYNC LAYERS TO DB' is clicked, the editor posts a complete transaction state to \`/api/designer-os/project/save\` which mirrors data to table partitions for durable sessions.`
    },
    {
      title: "5. NCOAMPP Multi-Agent Topology & SDK",
      content: `The Neora Creative Orchestration, Automation & Multi-Agent Production Platform (NCOAMPP) manages 23 specialized domain agents.
To register a specialist agent in the multi-agent runtime SDK, instantiate them using the NcoamppAgent layout:

\`\`\`typescript
import { NCOAMPP } from "./lib/ai/cognitive/NCOAMPP";

const orchestrator = NCOAMPP.getInstance();
orchestrator.registerSpecialist({
  role: "CustomCalligraphy",
  name: "Al-Khattat",
  description: "Renders highly localized traditional calligraphic styles.",
  capabilities: ["Naskh calligraphy", "Thuluth geometric grids"],
  confidenceRating: 98
});
\`\`\`

Agents communicate on an asynchronous, event-driven architecture using normalized JSON payloads.`
    },
    {
      title: "6. NCOAMPP REST APIs & Event Bus Specs",
      content: `Manage workflows and retrieve metrics using the following high-performance endpoint specifications:

### 1. Create Workflow DAG
- **Endpoint**: \`POST /api/ncoampp/workflow/create\`
- **Payload**:
  \`\`\`json
  {
    "prompt": "Premium Eid packaging box",
    "type": "approval"
  }
  \`\`\`
- **Response**: Returns the planned DAG nodes, task dependencies, and scheduled roles.

### 2. Event-Stream Live Updates
- **Endpoint**: \`GET /api/ncoampp/workflow/events/stream\` (Server-Sent Events)
- **Dispatched Events**:
  - \`WorkflowStarted\`: Emitted when the runner takes control.
  - \`AgentAssigned\`: Triggered when an agent state switches to busy.
  - \`TaskCompleted\`: Emitted upon validation check passes.
  - \`ApprovalRequested\`: Suspends pipeline execution for Operator review.`
    },
    {
      title: "7. Automation Engine & Failure Recovery Heuristics",
      content: `The automation engine supports bulk operations across workspace elements (e.g., resizing, localizing, and watermarking).
If an agent fails validation checks (e.g., layout overlap, low contrast, bleed violations):
1. **First Attempt**: Self-recovery heuristic is executed, altering bounds or margins by 5% increments.
2. **Fallback Strategy**: Work shifts to a generic design specialist (e.g., General Layout Agent).
3. **Graceful Degradation**: The operator is flagged on the NCOAMPP dashboard via a 'Review Gate' request.`
    },
    {
      title: "8. NACDI Strategic Brain Core & APIs",
      content: `The Neora Autonomous Creative Director Intelligence (NACDI) coordinates target audience analysis, brand voices, strategic briefs, and design decisions.

### 1. Formulate Strategic Goal
- **Endpoint**: \`POST /api/nacdi/strategy/formulate\`
- **Payload**:
  \`\`\`json
  {
    "prompt": "Premium traditional Pohela Boishakh invitation",
    "theme": "Traditional"
  }
  \`\`\`
- **Response**: Yields comprehensive visual direction specifications, targeted audience personas, risk assessment metrics, and directed multi-agent objectives.`
    },
    {
      title: "9. NDSRP Design Studio Runtime Platform & APIs",
      content: `The Neora Design Studio Runtime Platform (NDSRP) manages local/cloud/hybrid routing, active WebGL rendering pipelines, WCAG 2.2 contrast evaluation audits, and secure workspace synchronization.

### 1. Adjust Operational Topology & Accelerators
- **Endpoint**: \`POST /api/ndsrp/runtime/configure\`
- **Payload**:
  \`\`\`json
  {
    "executionMode": "hybrid",
    "hardwareProfile": "gpu_webgpu"
  }
  \`\`\`
- **Response**: Reallocates vector threadpools and returns optimized draw frames (FPS latency parameters).

### 2. Dispatch Bulk Automation Task
- **Endpoint**: \`POST /api/ndsrp/automation/dispatch\`
- **Payload**:
  \`\`\`json
  {
    "jobType": "bulk_resize",
    "targetLayers": ["layer-banner-x1", "layer-banner-x2"],
    "dimensions": { "width": 1080, "height": 1080 }
  }
  \`\`\`
- **Response**: Registers execution job on queue list and spawns real-time progress callbacks.`
    },
    {
      title: "10. Neora Universal AI Runtime (NUAR) & APIs",
      content: `The Neora Universal AI Runtime & Hybrid Model Orchestrator (NUAR) abstracts inference capabilities and maps model-agnostic request channels across local edge devices and cloud clusters.

### 1. Execute Multi-Model Inference with Cascade Recovery
- **Endpoint**: \`POST /api/nuar/inference/execute\`
- **Payload**:
  \`\`\`json
  {
    "capability": "reasoning",
    "prompt": "Evaluate safety padding margins",
    "offlineFallback": true
  }
  \`\`\`
- **Response**: Returns inference outcome text, actual routed model id, roundtrip metered latency, and cryptographic compliance token.

### 2. Dynamically Register Model Adaptor
- **Endpoint**: \`POST /api/nuar/registry/register\`
- **Payload**:
  \`\`\`json
  {
    "id": "ollama-mistral-v3",
    "provider": "ollama",
    "capabilities": ["text_generation", "translation"],
    "latencyMs": 140,
    "offlineCapable": true
  }
  \`\`\`
- **Response**: Binds adapter metadata dynamically into active smart routing matrix rules.`
    },
    {
      title: "11. Neora Local AI Runtime (NLAR) & Hardware-Adaptive APIs",
      content: `The Neora Local AI Runtime (NLAR) provides a provider-independent, local-first execution layer. It abstracts LLMs, Vision, Image generation, and Speech models running on-device while providing dynamic hardware acceleration interfaces.

### 1. Load Local Model into Active Memory Sandbox
- **Endpoint**: \`POST /api/nlar/models/load\`
- **Payload**:
  \`\`\`json
  {
    "modelId": "neora-native-llm-local",
    "allocatedVramGb": 4.5
  }
  \`\`\`
- **Response**: Warms up model weights, reserves memory buffers, and returns loaded state verification.

### 2. Run Local Secure Inference Pipeline
- **Endpoint**: \`POST /api/nlar/inference/run\`
- **Payload**:
  \`\`\`json
  {
    "modelId": "neora-native-llm-local",
    "prompt": "Evaluate design contrast levels",
    "sandboxIsolation": "isolated"
  }
  \`\`\`
- **Response**: Returns offline generated tokens, latency stats, and calculated energy expenditure.`
    },
    {
      title: "12. Neora Graphics Engine (NGE) & High Performance APIs",
      content: `The Neora Graphics Engine (NGE) is a high-performance vector rendering and non-destructive image compositing engine. It supports multi-artboard infinite canvases, real-time pixel previews, and advanced GPU accelerated layers.

### 1. Render Scene Graph Layer Stack
- **Endpoint**: \`POST /api/nge/render/scene\`
- **Payload**:
  \`\`\`json
  {
    "artboardId": "artboard-1",
    "zoom": 1.5,
    "colorSpace": "Display_P3",
    "layers": [
      { "id": "layer-1", "type": "vector", "opacity": 0.9, "blendMode": "overlay" }
    ]
  }
  \`\`\`
- **Response**: Compiles shaders, performs culling, and returns rasterized buffer payload.

### 2. Update Element Layer Transformation
- **Endpoint**: \`POST /api/nge/layers/transform\`
- **Payload**:
  \`\`\`json
  {
    "layerId": "alpona-vector-1",
    "position": { "x": 180, "y": 120 },
    "rotation": 15,
    "nonDestructiveFX": { "blur": 1.5, "contrast": 110 }
  }
  \`\`\`
- **Response**: Re-evaluates target matrices and publishes the updated frame coordinates to WebSocket listeners.`
    },
    {
      title: "13. Neora Vision Intelligence Platform (NVIP) Multimodal APIs",
      content: `The Neora Vision Intelligence Platform (NVIP) acts as the central multimodal computer vision and composition reasoning system. It executes deep layout analysis, multilingual OCR, style DNA mapping, accessibility audits, and non-destructive reference transformations.

### 1. Ingest Design Asset & Run Audit
- **Endpoint**: \`POST /api/nvip/percept/audit\`
- **Payload**:
  \`\`\`json
  {
    "fileName": "boishakhi_alpona.png",
    "bufferSize": 250880,
    "isReference": true
  }
  \`\`\`
- **Response**: Triggers targeted micro-analyzers concurrently, matches Style DNA, evaluates contrast scores, and outputs a complete Unified Visual Report.

### 2. Non-Destructive Style Transform
- **Endpoint**: \`POST /api/nvip/style/transform\`
- **Payload**:
  \`\`\`json
  {
    "reportId": "rep_9a2b8c",
    "instruction": "Compile original corporate layout inspired by extracted amber theme",
    "preserveRatio": true
  }
  \`\`\`
- **Response**: Performs multi-vector geometric re-mapping, suggesting non-infringing layout variations based on style and layout guidelines.`
    }
  ]
};
export const STORYBOOK_SPECS = [
  {
    component: "CollapsiblePanel",
    usage: "<CollapsiblePanel title='TYPOGRAPHY' isOpen={open} onToggle={toggle} badge='Inter'>...</CollapsiblePanel>",
    status: "Production Ready"
  },
  {
    component: "LayerTree",
    usage: "<LayerTree layers={layers} selectedId={id} onSelect={select} />",
    status: "Production Ready"
  },
  {
    component: "HorizontalRuler",
    usage: "<HorizontalRuler zoom={100} />",
    status: "Mock Scale Ready"
  },
  {
    component: "ColorPalettePicker",
    usage: "<ColorPalettePicker value={color} onChange={setColor} />",
    status: "Production Ready"
  }
];
