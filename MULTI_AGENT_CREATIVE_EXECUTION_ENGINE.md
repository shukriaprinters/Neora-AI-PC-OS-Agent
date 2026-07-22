# NEORA DESIGN OS V2 - PHASE 2.3.6B.2: MULTI-AGENT CREATIVE EXECUTION ENGINE
## Enterprise Master Specification (Version 27.0)

This master specification defines the runtime environment, communication bus protocols, coordination patterns, self-review loops, and SDK plugins for the **Enterprise Multi-Agent Creative Execution Engine (EMCEE)** within Neora Design OS.

---

## 1. Core Architectural Paradigm & Multi-Agent OS

The Multi-Agent Creative Execution Engine manages a team of specialized design agents. Rather than relying on a single general model, EMCEE operates like a **Creative Agency**, where specialized agents handle typography, vector drafting, color science, printing layout safety, and QA review in a collaborative workflow.

```
+---------------------------------------------------------------------------------+
|                                MASTER COORDINATOR                               |
|          - Dynamically splits user prompts into specialized sub-tasks          |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+------------------+-------------------+-------------------+----------------------+
|                  |                   |                   |                      |
v                  v                   v                   v                      v
+------------+  +------------+  +------------+  +------------+  +-----------------+
| TYPOGRAPHY |  | COLOR LAB  |  | VECTOR ART |  | LAYOUT GRID|  | SOCIAL SIZE     |
| AGENT      |  | AGENT      |  | AGENT      |  | AGENT      |  | AGENT           |
+------------+  +------------+  +------------+  +------------+  +-----------------+
        \              \               /               /                /
         \--------------\-------------\---------------/----------------/
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                            SELF-REVIEW CRITIQUE LOOP                            |
|          - Critic, Optimizer, and QA agents audit contrast, bleed, and overlaps|
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                              PRODUCTION CANVAS                                  |
|          - Updates the live vector artboard with verified layer models          |
+---------------------------------------------------------------------------------+
```

---

## 2. Specialized Agent Directories

| Agent Role | Direct Responsibility | Core Outputs |
| :--- | :--- | :--- |
| **Typography Agent** | Script-aware formatting (Bangla, English, Arabic) | Structured `text` layers, custom weight maps, baseline positions |
| **Color Science Agent** | Palette synthesis, contrast calculations | Harmonics presets, WCAG contrast score reports |
| **Vector Art Agent** | Path synthesis, icons, emblems, illustrations | Clean, layered SVG elements |
| **Layout Grid Agent** | Snapping guides, bleed metrics, coordinates | Layout grid structures, safe coordinates |
| **Print Production Agent**| Margin safety verification, color conversions | Crop marks, bleed margin bounds, output reports |
| **QA Review Agent** | Bounding overlaps and file link verification | Visual audits, repair plans |
| **Critic Agent** | Art direction evaluation and quality review | Alignment checklists, stylistic correction logs |

---

## 3. Communication Bus Protocol & Events

Agents communicate using normalized JSON packets dispatched over a centralized event-driven state and service bus:

*   **Transactional Invariance:** Every modification is logged with trace IDs to ensure actions can be cleanly reversed.
*   **Conflict Resolution Heuristics:** If the Typography Agent requests a large text boundary that overlaps with an element requested by the Vector Art Agent, the Layout Grid Agent arbitrates, resizing elements by 5% increments to clear collisions.

---

## 4. REST API Endpoint Specifications

### 1. Compile Coordinated Execution Plan
*   **Endpoint:** `POST /api/emcee/workflow/create`
*   **Payload:**
    ```json
    {
      "prompt": "Design a festive A4 Bengali corporate catalog",
      "format": "A4",
      "dimensions": { "width": 842, "height": 595, "unit": "px" }
    }
    ```
*   **Response:**
    ```json
    {
      "workflowId": "wf-catalogue-01",
      "dag": [
        { "id": "node-grid", "agent": "LayoutGridAgent", "deps": [] },
        { "id": "node-typo", "agent": "TypographyAgent", "deps": ["node-grid"] },
        { "id": "node-qa", "agent": "QaAgent", "deps": ["node-typo"] }
      ],
      "status": "planned"
    }
    ```

### 2. Retrieve Specialist Performance Metrics
*   **Endpoint:** `GET /api/emcee/agents/metrics`
*   **Response:** Returns diagnostic reports detailing active task queues, average execution latency, and success ratings.

---

## 5. WebSocket Live Telemetry Stream

The status, reasoning steps, and communication logs of all specialized agents are broadcasted in real-time to the user interface:

*   **Address:** `ws://0.0.0.0:3000/api/emcee/telemetry/stream`
*   **Events Dispatched:**
    *   `WorkflowStarted`: Fired when the master coordinator boots.
    *   `AgentAssigned`: Triggered when an agent takes a sub-task.
    *   `SelfReviewLoopStarted`: Triggered when the Critic and QA agents inspect drafts.
    *   `TaskCompleted`: Emitted when all validation checks pass.

---

## 6. Plugin Agent SDK API Interfaces

Developers can register customized specialist agents inside Neora's runtime workspace environment:

```typescript
import { registerSpecialistAgent } from "./sdk/emcee";

registerSpecialistAgent({
  role: "ContrastAuditSpecialist",
  capabilities: ["calculating contrast matrices", "correcting text color"],
  onExecute: async (context) => {
    const violations = [];
    context.layers.forEach(layer => {
      if (layer.type === "text" && layer.backgroundColor) {
        const contrast = calculateContrast(layer.color, layer.backgroundColor);
        if (contrast < 4.5) {
          violations.push({
            layerId: layer.id,
            suggestedColor: "#020617"
          });
        }
      }
    });
    return { status: violations.length === 0 ? "success" : "revisions_needed", revisions: violations };
  }
});
```
