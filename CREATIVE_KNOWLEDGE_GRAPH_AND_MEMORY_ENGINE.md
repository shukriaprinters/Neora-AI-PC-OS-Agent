# NEORA DESIGN OS V2 - PHASE 2.3.6B.1.3: ENTERPRISE CREATIVE KNOWLEDGE GRAPH & DESIGN MEMORY ENGINE
## Enterprise Master Specification (Version 26.0)

This master specification defines the architectural blueprint, data schemas, relational topology, search models, and plugin SDK endpoints for the **Enterprise Creative Knowledge Graph & Design Memory Engine (CKGDME)** within Neora Design OS.

---

## 1. Core Architectural Paradigm

The Creative Knowledge Graph & Design Memory Engine functions as the long-term cognitive memory of Neora. It goes beyond simple asset storage by constructing an interconnected, semantic map representing relationships between projects, layouts, assets, typography, color harmony, user feedback, and AI design reasoning.

```
+---------------------------------------------------------------------------------+
|                                 EVENT INTAKE                                    |
|          - Listens to active editor states, user ratings, and exports          |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                              KNOWLEDGE GRAPH BUS                                |
|          - Dynamically indexes nodes (Layers, Colors, Typography, Brands)       |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------+--------------+--------------+---------------------------+
|                       |                             |                           |
v                       v                             v                           v
+-------------------+ +---------------------------+ +-------------------+ +---------------+
| SEMANTIC SEARCH   | | DESIGN DNA SYNTHESIS       | | COGNITIVE MEMORY  | | LOCAL STORAGE |
| (Vector Embeds)   | | (Brand Rules, Style Cues) | | (Why-Reason Logs) | | (P2P Mirrors) |
+-------------------+ +---------------------------+ +-------------------+ +---------------+
```

---

## 2. Relational Knowledge Graph Schema

The engine maintains a high-density relational property graph containing deep nodes representing creative assets and design guidelines.

```
[Project Node] --(contains)--> [Artboard Node] --(houses)--> [Layer Node]
      |                              |                             |
 (configured)                  (configured)                   (configured)
      |                              |                             |
      v                              v                             v
[Brand Kit Node]               [Grid System Node]            [Aesthetic Node]
 (Palette, Logos)               (Bleed, Padding)              (Fonts, Shaders)
```

### Node Typology & Relational Mappings
1.  **Project Node:** Root entity holding unique ID, client links, creation metrics, and revision indices.
2.  **Design DNA Node:** Synthesizes user style preferences, recurring typography weight ratios, spacing guidelines, and preferred visual themes.
3.  **Aesthetic Node:** Binds physical coordinates to design tokens (color swatches, font pairings, border curvatures).

---

## 3. The Semantic Search Engine & Multi-Vector Indexes

Traditional keyword matching is augmented with high-performance semantic search models to query designs by mood, style, or brand intention (e.g., *"traditional luxury Islamic invitation"* or *"festive Bengali flyer"*).

*   **Multi-Vector Indexing:** Color ratios, font weight metrics, aspect ratios, and semantic descriptions are normalized into multi-dimensional vectors.
*   **Contextual Saliency Retrieval:** When generating or modifying designs, the search engine crawls past sessions to retrieve high-performing layout templates automatically.

---

## 4. Brand & Multi-Language Typography Knowledge Base

The system incorporates rigid, culture-aware guidelines regarding linguistic formatting:

### I. Bangla Typography & Calligraphy Knowledge
*   **Glyph Boundaries:** Establishes automatic margin extensions (1.2x typical line height) to prevent clipping of vowel signs (Kars).
*   **Traditional Presets:** Recommends traditional styling rules (such as red-yellow pairing paired with serif fonts) for cultural events like Pohela Boishakh.

### II. Islamic & Arabic Calligraphy Knowledge
*   **Calligraphic Script Rules:** Recognizes traditional layout weights for Naskh, Thuluth, Diwani, Kufic, and Nastaliq scripts.
*   **Safe-Bleed Overlays:** Automatically anchors decorative borders and vector calligraphy emblems within safe boundaries.

---

## 5. Reasoning Memory & Explainability

Neora logs the structural "Why" behind every visual coordinate change:
*   **Causal Logging:** When the AI moves a heading layer, the CKGDME registers the action (e.g., *"[Reasoning] Centered text layer to clear overlapping brand emblem boundary"*).
*   **Audit Logging:** Logs a confidence rating (0-100) detailing compliance levels with established design principles.

---

## 6. REST API Endpoint Specifications

### 1. Store Creative Knowledge Node
*   **Endpoint:** `POST /api/ckgdme/knowledge/store`
*   **Payload:**
    ```json
    {
      "nodeId": "project-dna-001",
      "type": "design_dna",
      "properties": {
        "preferredPalette": ["#000612", "#00d4ff", "#00ff88"],
        "typographyScale": { "heading": "Space Grotesk", "body": "Inter" },
        "gridSpacing": 8
      },
      "relations": [
        { "targetId": "brand-kit-corp", "predicate": "ALIGNS_WITH" }
      ]
    }
    ```
*   **Response:** Binds properties to active graph and returns confirmation.

### 2. Execute Semantic Creative Search
*   **Endpoint:** `POST /api/ckgdme/search/semantic`
*   **Payload:**
    ```json
    {
      "query": "minimalist high-contrast tech catalog layout",
      "limit": 5,
      "minConfidence": 0.85
    }
    ```
*   **Response:** Yields structured matching projects, layout parameters, and score maps.

---

## 7. WebSocket Live Sync Specifications

To feed real-time canvas tweaks into the active knowledge graph without blocking UI rendering, Neora coordinates a high-speed event pipe:

*   **Address:** `ws://0.0.0.0:3000/api/ckgdme/live/sync`
*   **Events Dispatched:**
    *   `KnowledgeUpdated`: Fired upon layer transaction committals.
    *   `DesignDNAUpdated`: Emitted when user style preferences cross synthesis thresholds.
    *   `RecommendationGenerated`: Pushes live layout/spacing suggestions to the UI panel.

---

## 8. Plugin SDK API Interfaces

Developers register customized recommenders and knowledge adapters using Neora’s standardized SDK hooks:

```typescript
import { registerKnowledgeRecommender } from "./sdk/ckgdme";

registerKnowledgeRecommender({
  id: "cmyk-print-recommender",
  evaluate: (layers, context) => {
    const warnings = [];
    if (context.colorSpace === "CMYK") {
      layers.forEach(layer => {
        if (layer.color && isRGBOnlyHex(layer.color)) {
          warnings.push({
            layerId: layer.id,
            reason: "Color lies outside printable CMYK gamut bounds."
          });
        }
      });
    }
    return { score: warnings.length === 0 ? 100 : 70, recommendations: warnings };
  }
});
```
