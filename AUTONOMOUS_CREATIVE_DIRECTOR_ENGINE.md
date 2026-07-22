# NEORA DESIGN OS V2 - PHASE 2.3.6B.1.2: AUTONOMOUS CREATIVE DIRECTOR ENGINE
## Enterprise Master Specification (Version 25.0)

This master specification defines the architectural design, trend-matching schemas, research pipelines, quality gates, and API contracts for the **Autonomous Creative Director Engine (ACDE)** within Neora Design OS.

---

## 1. Core Architectural Paradigm

The Autonomous Creative Director Engine acts as the strategic and operational coordinator of all design workflows. Rather than generating flat pixels, it designs the creative strategy, analyzes current design trends, audits brand consistency, manages revision cycles, and coordinates execution tasks across downstream micro-engines.

```
+---------------------------------------------------------------------------------+
|                                USER GOAL / INTAKE                               |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                     AUTONOMOUS CREATIVE DIRECTOR ENGINE                         |
+---------------------------------------------------------------------------------+
|  1. REQUIREMENT ANALYZER - Extracts business context, audience, and media formats|
|  2. TRENDS & RESEARCH    - Studies seasonal palettes and layout structures      |
|  3. BRAND AUDITOR        - Compiles color constraints and safe margins          |
|  4. REVISION MANAGER     - Structures revision schedules and compares versions   |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                               EXECUTION ORCHESTRATOR                            |
|          - Dispatches structured design blueprints to the active workspace       |
+---------------------------------------------------------------------------------+
```

---

## 2. Ingestion & Strategic Planning

ACDE translates basic client descriptions into rigorous creative parameters:
*   **Target Segment Classification:** Detects targeted industries (e.g., Traditional Printing, Corporate SaaS, Festive Editorial) to retrieve matching visual guidelines.
*   **Production Safety Scopes:** Evaluates output formats (such as 15px bleed margins for cards, safe center guides for video frames) and sets safety coordinates.

---

## 3. Brand Intelligence & Guidelines Auditing

The system maintains a rigid brand verification gateway (Brand Gate) to ensure consistency:
*   **Logo Safe Margins:** Calculates safe zones (e.g., 20px padding boundaries) surrounding primary logo assets to prevent overlapping elements.
*   **Color-Gamut Mapping:** Automatically maps hex values between RGB and CMYK systems depending on output requirements (Print vs. Digital).

---

## 4. Multi-Concept Proposals & Variations

ACDE generates three distinct creative concepts for any given goal:

1.  **Concept A (The Traditional Approach):** Solid typography pairings, traditional grids, conservative margins, and high-contrast styling.
2.  **Concept B (The Modern Minimalist Approach):** Flat background tones, light weights, generous margins, and simple layouts.
3.  **Concept C (The Bold Interactive Approach):** Strong color pairs, dense borders, custom patterns, and experimental grid schemes.

---

## 5. REST API Endpoint Specifications

### 1. Compile Creative Brief
*   **Endpoint:** `POST /api/acde/brief/generate`
*   **Payload:**
    ```json
    {
      "projectId": "proj-abc",
      "userInput": "Design a Pohela Boishakh invitation card",
      "brandId": "retail-boishakh-brand"
    }
    ```
*   **Response:**
    ```json
    {
      "briefId": "brief-boishakh-101",
      "strategy": "Traditional Cultural Celebration",
      "safetyGuidelines": { "bleed": 15, "safeArea": 30 },
      "primaryPalette": ["#b91c1c", "#fbbf24", "#feffec"]
    }
    ```

### 2. Formulate Strategic Revision Plan
*   **Endpoint:** `POST /api/acde/revision/plan`
*   **Payload:**
    ```json
    {
      "briefId": "brief-boishakh-101",
      "feedback": "make the banner more festive and highlight our contact number",
      "activeLayers": [
        { "id": "layer-header", "type": "text", "content": "Pohela Boishakh" }
      ]
    }
    ```
*   **Response:** Yields precise canvas property adjustments (such as color modifications or coordinate updates) to execute the revision.

---

## 6. WebSocket Live Feedback System

Real-time strategic audits and design reports stream over WebSocket channels:

*   **Address:** `ws://0.0.0.0:3000/api/acde/feedback/stream`
*   **Events Dispatched:**
    *   `BriefCreated`: Emitted upon ingestion and profiling completion.
    *   `TrendMatched`: Triggered when design layouts align with style references.
    *   `QualityGatePassed`: Emitted when contrast, bleed, and margins are validated successfully.

---

## 7. Plugin SDK API Interfaces

Developers customize brand auditing rule-sets and design trend benchmarks using clean SDK hooks:

```typescript
import { registerAcdeQualityGate } from "./sdk/acde";

registerAcdeQualityGate({
  id: "bleed-boundary-guard",
  evaluate: (layers, metadata) => {
    const bleed = metadata.bleedMargin || 15;
    const violations = [];
    
    layers.forEach(layer => {
      if (layer.type === "text") {
        if (layer.x < bleed || layer.y < bleed) {
          violations.push({
            layerId: layer.id,
            error: `Text layer lies inside the critical ${bleed}px printing bleed zone.`
          });
        }
      }
    });
    
    return {
      passed: violations.length === 0,
      violations
    };
  }
});
```
