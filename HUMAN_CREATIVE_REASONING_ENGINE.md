# NEORA DESIGN OS V2 - PHASE 2.3.6B.1.1: HUMAN CREATIVE REASONING ENGINE
## Enterprise Master Specification (Version 25.0)

This master specification defines the architectural layouts, execution plans, decision-making logic, and API definitions for the **Human Creative Reasoning Engine (HCRE)** within Neora Design OS.

---

## 1. Core Mission & Architectural Role

The Human Creative Reasoning Engine is the strategic core of Neora. It acts not as a simple generator or chatbot, but as an experienced **Creative Director** that plans, validates, critiques, and structures visual compositions before rendering vector outputs.

```
+---------------------------------------------------------------------------------+
|                                 USER INTENTS                                    |
|          - Gathers voice commands, text prompts, reference images               |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                         HUMAN CREATIVE REASONING ENGINE                         |
+---------------------------------------------------------------------------------+
|  1. INTENT RESOLUTION     - Resolves primary design objectives and target media |
|  2. STRATEGY SELECTION    - Evaluates typography rules, grids, and brand kits   |
|  3. FLOW ENGINE           - Formulates atomic layout blueprints and execution   |
|  4. SELF-CRITIQUE AUDITING - Performs contrast validations and overlaps check   |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                               EDITABLE WORKSPACE                                |
|          - Commits clean vector layers and styles to the active artboard        |
+---------------------------------------------------------------------------------+
```

---

## 2. Intent Resolution & Language Parsing

The HCRE handles multi-language visual inputs without losing semantic meaning:
*   **Aesthetic Intent Decoding:** Classifies inputs like *"make it luxurious"* into specific parameters: high-contrast dark backdrops, golden geometric borders, spacious negative spaces, and elegant display typography.
*   **Cultural Context Sensitivity:** Detects regional requirements (such as Bangla or Arabic scripts) and assigns line spacing parameters (1.3x typical line-height offsets) to prevent vowel collisions.

---

## 3. The Design Strategy Engine

Rather than executing a single, rigid layout pattern, the engine compiles multiple visual strategies:

| Strategy | Typography Layout | Color System | Compositional Geometry |
| :--- | :--- | :--- | :--- |
| **Sleek Corporate** | Clean sans-serif (Inter) | Minimalist high-contrast grays | Rigid 8px vertical grid |
| **Luxury Elegant** | Space Grotesk headings paired with thin sub-labels | Charcoal background with warm gold borders | Center-aligned focal authority |
| **Festive Cultural** | Traditional Bangla headings paired with soft text | Festive deep red, amber yellow, and crisp whites | Decorative organic vector borders |
| **Tech Monospace** | JetBrains Mono for telemetry tags and logs | Deep black, electric blues, neon greens | Structured, dense bento-grids |

---

## 4. Automatic Creative Brief & Execution Planner

Before committing vector elements, the HCRE generates an internal workflow blueprint:
1.  **Grid Optimization:** Calculates responsive percentage-based grids, bleed boundaries, and safe margins.
2.  **Layer Hierarchy Blueprinting:** Declares a clean layer stack containing background elements, vector graphics, typographic text layers, and foreground borders.

---

## 5. Self-Critique & Quality Audit Engine

The engine validates its own design drafts using objective design guidelines:
*   **Legibility Auditing:** Runs mathematical contrast ratio calculations, shifting colors to preserve WCAG AA levels.
*   **Collision Prevention:** Evaluates bounding box parameters to check for overlapping layers or clipped text fields.

---

## 6. REST API Endpoint Specifications

### 1. Resolve Design Intent & Brief
*   **Endpoint:** `POST /api/hcre/intent/resolve`
*   **Payload:**
    ```json
    {
      "prompt": "Create an elegant banner for Neora TV",
      "language": "bn",
      "brandId": "neora-brand-01"
    }
    ```
*   **Response:**
    ```json
    {
      "strategy": "Luxury Elegant",
      "creativeBrief": {
        "audience": "Broad regional consumer base",
        "typography": { "primary": "Space Grotesk", "lineHeight": 1.4 },
        "palette": ["#020617", "#ff007c", "#f8fafc"]
      },
      "confidenceRating": 96
    }
    ```

### 2. Formulate Layout Blueprint
*   **Endpoint:** `POST /api/hcre/layout/blueprint`
*   **Payload:**
    ```json
    {
      "briefId": "brief-987",
      "canvasSize": { "width": 1920, "height": 1080 }
    }
    ```
*   **Response:** Outputs a structured, non-destructive layer tree ready to be committed to the workspace artboard.

---

## 7. WebSocket Live Event Streams

High-frequency telemetry updates resolve over WebSocket connections to keep the system logs and thinking indicators updated dynamically:

*   **Address:** `ws://0.0.0.0:3000/api/hcre/thinking/stream`
*   **Events Dispatched:**
    *   `BriefGenerated`: Fired when intent resolution completes.
    *   `ConceptPlanned`: Fired when a vector layout proposal is structured.
    *   `QualityCheckCompleted`: Returns contrast evaluation reports and overlap warnings.

---

## 8. Plugin SDK API Interfaces

Developers extend HCRE’s validation checklists using clean TypeScript interfaces:

```typescript
import { registerHcreAuditRule } from "./sdk/hcre";

registerHcreAuditRule({
  id: "no-overlapping-headings",
  validate: (layers) => {
    const headings = layers.filter(l => l.type === "text" && l.fontSize > 24);
    for (let i = 0; i < headings.length; i++) {
      for (let j = i + 1; j < headings.length; j++) {
        if (checkBoundingBoxOverlap(headings[i], headings[j])) {
          return {
            valid: false,
            fix: {
              layerId: headings[j].id,
              suggestedY: headings[i].y + headings[i].height + 16
            }
          };
        }
      }
    }
    return { valid: true };
  }
});
```
