# NEORA DESIGN OS V2 - PHASE 2.4: ENTERPRISE CREATIVE INTELLIGENCE & DESIGN REASONING PLATFORM
## Enterprise Master Specification (Version 38.0)

This master specification defines the visual perception, aesthetic calculation, layout reasoning, multi-language calligraphic support, and cognitive decision models of the **Enterprise Creative Intelligence & Design Reasoning Platform** within Neora Design OS.

---

## 1. Core Architectural Paradigm & Cognitive Hierarchy

The Creative Intelligence & Design Reasoning Platform acts as the primary logical layer of Neora, evaluating design balance, contrast, alignment, typography scaling, color psychology, and target audience fit before committing any vector coordinates.

```
+---------------------------------------------------------------------------------+
|                                 USER INPUT BUS                                  |
|          - Gathers design prompts, voice clips, and image assets                |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                        CREATIVE INTELLIGENCE RUNTIME                            |
+---------------------------------------------------------------------------------+
|  1. COMPOSITION REASONER  - Audits visual flow, negative space, and balance     |
|  2. COLOR INTELLIGENCE    - Selects harmonic color palettes (CMYK/RGB)          |
|  3. TYPOGRAPHY COGNITION  - Pairs weights and structures multilingual scripts    |
|  4. DESIGN CRITIQUE LOOP  - Analyzes accessibility, contrast, and alignment     |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                             REASONING EXPLANATION                               |
|          - Outputs structured design logs with confidence and trade-off reports |
+---------------------------------------------------------------------------------+
```

---

## 2. Platform Core Architecture & Logical Subsystems

### I. Design Reasoning Engine
*   **Balance & Spacing Evaluator:** Runs geometric density checks across artboards, flagging uneven clusters or heavy quadrants.
*   **Aesthetic Constraint Validator:** Evaluates elements against classic layout rules (Gestalt principles, Rule of Thirds, Golden Ratio).

### II. Visual Understanding Layer
*   **Structure Categorization:** Understands compositional blocks (e.g., differentiating headings, main figures, contact sections, and decorative borders).
*   **Intent Prediction:** Categorizes requests into specific marketing formats (Posters, Packaging, Flyers, Resumes, Banners).

---

## 3. Culture-Aware Multilingual Typographic Reasoning

The platform incorporates distinct calligraphic models to preserve linguistic flow and prevent vowel signs from overlapping:

*   **Bangla Calligraphy System:** Automatically expands line-height metrics by 1.3x to support traditional scripts (e.g., *Hind Siliguri*, *SolaimanLipi*) and prevent glyph clipping of vowel indicators (Kar/Phola).
*   **Islamic Arabic Calligraphy:** Operates with native Right-to-Left (RTL) rules, aligning spiritual and decorative scripts (Naskh, Thuluth, Diwani, Kufic, Nastaliq) with precise visual flow rules.

---

## 4. REST API Endpoint Specifications

### 1. Evaluate Visual Layout & Balance
*   **Endpoint:** `POST /api/cidrp/layout/evaluate`
*   **Payload:**
    ```json
    {
      "canvasId": "artboard-card-11",
      "layers": [
        { "id": "layer-title", "type": "text", "content": "শুভ নববর্ষ", "fontSize": 48, "x": 10, "y": 12 }
      ],
      "colorSpace": "RGB"
    }
    ```
*   **Response:**
    ```json
    {
      "evaluationId": "eval-cidrp-991",
      "balanceScore": 82,
      "readabilityScore": 95,
      "accessibilityScore": 42,
      "warnings": [
        { "layerId": "layer-title", "reason": "Contrast ratio below WCAG AA 4.5:1 limit" }
      ]
    }
    ```

### 2. Generate Design Strategy Recommendations
*   **Endpoint:** `POST /api/cidrp/strategy/generate`
*   **Payload:**
    ```json
    {
      "industry": "Restaurant & Hospitality",
      "mood": "Luxury & Traditional",
      "primaryLanguage": "bn"
    }
    ```
*   **Response:**
    ```json
    {
      "recommendedPalette": ["#020617", "#eab308", "#ffffff"],
      "recommendedTypography": { "heading": "Hind Siliguri", "body": "Inter" },
      "gridSpacing": 8
    }
    ```

---

## 5. WebSocket Telemetry Stream Specifications

A high-speed WebSocket pipeline publishes ongoing layout diagnostics, reasoning steps, and cognitive critiques to the user terminal:

*   **Address:** `ws://0.0.0.0:3000/api/cidrp/telemetry/live`
*   **Events Dispatched:**
    *   `DesignAnalyzed`: Dispatched upon completion of layout evaluations.
    *   `SuggestionGenerated`: Pushes live spacing or color harmony alternatives to the workspace panel.
    *   `StyleDetected`: Emitted when the vision layer detects specific branding styles.

---

## 6. Plugin SDK Interfaces

Developers can register custom validation rules and styling constraints using Neora's modular SDK hooks:

```typescript
import { registerCidrpConstraint } from "./sdk/cidrp";

registerCidrpConstraint({
  id: "traditional-bangla-contrast",
  verify: (layers) => {
    const issues = [];
    layers.forEach(layer => {
      if (layer.content && isBanglaScript(layer.content)) {
        if (layer.color === "#ffffff" && layer.backgroundColor === "#eab308") {
          issues.push({
            layerId: layer.id,
            fix: "Increase typographic weight or shift yellow background to a dark red for legibility."
          });
        }
      }
    });
    return { passed: issues.length === 0, issues };
  }
});
```
