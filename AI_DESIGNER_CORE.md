# NEORA DESIGN OS V2 - PHASE 2.4.1: ENTERPRISE AI DESIGNER CORE
## Enterprise Master Specification (Version 39.0)

This master specification defines the architectural design, workflow planning pipelines, multi-modal integration, and provider routers for the **Enterprise AI Designer Core (EAIDC)** within Neora Design OS.

---

## 1. Core Architectural Paradigm & Strategic Role

The AI Designer Core serves as the creative director and technical general manager of Neora. It handles requirement parsing, styles coordination, and design workflows, ensuring all visual outputs remain non-destructive and fully editable.

```
+---------------------------------------------------------------------------------+
|                                 USER REQUEST BUS                                |
|          - Receives prompts, reference vectors, style guides, and moodboards    |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                            AI DESIGNER CORE RUNTIME                             |
+---------------------------------------------------------------------------------+
|  1. DESIGN THINKING ENGINE  - Generates comprehensive briefs and style strategies|
|  2. WORKFLOW ROUTER         - Directs workloads between Ollama / Cloud / Local  |
|  3. COMPOSITION SYNCHRONIZER - Coordinates with Canvas, Layers, and Assets API   |
|  4. CRITIQUE AUDITOR        - Conducts pre-commit audits on layout and typography|
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                                EDITABLE LAYOUT                                  |
|          - Commits clean layer trees and property structures to the artboard     |
+---------------------------------------------------------------------------------+
```

---

## 2. Platform Core Architecture & Subsystems

### I. Design Thinking Engine
*   **Creative Brief Generator:** Synthesizes user specifications into rigid design objectives, safety boundaries, and deliverables.
*   **Style Coordinator:** Pairs display and body text fonts, sets grid spacing, and maps color palettes to match target audiences.

### II. Provider Router & Abstraction Layer
*   **Capability-Based Routing:** Intelligently routes tasks to the best provider (Ollama, Neora Native Model, Cloud Runtime) based on latency, quality, and resource restrictions.
*   **Provider Fallbacks:** Automatically falls back to local runtimes if cloud services are unavailable.

---

## 3. High-Quality Self-Review & Revision Loop

All layout modifications pass through an internal review cycle (Review Gate) before presenting updates to the user:
*   **Balance Evaluation:** Evaluates margin alignments, paragraph lines, and crop marks.
*   **Contrast Correction:** Shifts text color levels dynamically to meet WCAG AA contrast standards.

---

## 4. REST API Endpoint Specifications

### 1. Compile User Brief and Style Plan
*   **Endpoint:** `POST /api/eaidc/brief/generate`
*   **Payload:**
    ```json
    {
      "prompt": "Create a high-contrast corporate catalog page",
      "brandId": "neora-inc",
      "dimensions": { "width": 1920, "height": 1080 }
    }
    ```
*   **Response:**
    ```json
    {
      "briefId": "brief-eaidc-101",
      "strategy": "Sleek Minimal Tech",
      "gridSettings": { "columns": 12, "margin": 60, "gutter": 20 },
      "typography": { "heading": "Space Grotesk", "body": "Inter" },
      "palette": ["#000000", "#00d4ff", "#ffffff"]
    }
    ```

### 2. Evaluate Design Draft Against Guidelines
*   **Endpoint:** `POST /api/eaidc/design/evaluate`
*   **Payload:**
    ```json
    {
      "briefId": "brief-eaidc-101",
      "layers": [
        { "id": "heading-01", "type": "text", "fontSize": 64, "x": 60, "y": 80 }
      ]
    }
    ```
*   **Response:** Returns a layout score, contrast report, alignment flags, and structural correction plans.

---

## 5. WebSocket Live Update Bus Specifications

A reliable event bus streams real-time status updates, layout evaluations, and reasoning traces:

*   **Address:** `ws://0.0.0.0:3000/api/eaidc/thinking/live`
*   **Events Dispatched:**
    *   `DesignRequested`: Fired upon ingestion of creative prompts.
    *   `CreativePlanGenerated`: Triggered when the grid and style strategy is compiled.
    *   `DesignReviewed`: Pushes contrast and boundary compliance reports to the workspace.

---

## 6. Plugin SDK Interfaces

Developers write customized design audits and provider wrappers using simple SDK interfaces:

```typescript
import { registerEaidcAuditRule } from "./sdk/eaidc";

registerEaidcAuditRule({
  id: "enforce-safe-margins",
  validate: (layers, gridSettings) => {
    const margin = gridSettings.margin || 60;
    const errors = [];
    
    layers.forEach(layer => {
      if (layer.x < margin || layer.y < margin) {
        errors.push({
          layerId: layer.id,
          suggestedX: margin,
          suggestedY: margin
        });
      }
    });
    
    return { passed: errors.length === 0, corrections: errors };
  }
});
```
