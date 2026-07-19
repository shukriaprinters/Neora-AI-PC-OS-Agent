# Neora AI Designer OS: Cognitive Foundation Architecture

This document details the enterprise-grade Memory, Context, and Knowledge Platform (Cognitive Foundation) of the Neora AI Designer OS. It serves as the long-term brain and context-sensitive orchestrator that allows Neora to reason, learn, adapt, and think consistently across multiple projects, reference uploads, brand guidelines, and multilingual cultures.

---

## 1. Architectural System Blueprint

The Cognitive Foundation acts as a unified state controller positioned between the lower-level persistence database (ACID JSON / Firestore) and future Vision, Design Brain, and Multi-Agent generative engines.

```
                      +------------------------------------------+
                      |        Generative System Controllers     |
                      |  (Vision AI, Design Brain, Multi-Agent)  |
                      +-------------------+----------------------+
                                          |
                                          | uses Cognitive SDK
                                          v
+-----------------------------------------------------------------------------------------+
|                                  COGNITIVE SDK UNIT                                     |
|                                                                                         |
|   +-------------------+  +-----------------------+  +-------------------------------+   |
|   |   Memory Engine   |  |   Preference Engine   |  |        Knowledge Graph        |   |
|   |  - Short-term     |  |  - Multilingual rules |  |  - Relational mapping        |   |
|   |  - Long-term      |  |  - RTL/LTR direction  |  |  - Confidence scores          |   |
|   |  - Semantic cache |  |  - Adaptive learning  |  |  - Neighborhood tracing       |   |
|   +---------+---------+  +-----------+-----------+  +---------------+---------------+   |
|             |                        |                              |                   |
|             +------------------------+                              |                   |
|                                      | query / build                |                   |
|                                      v                              |                   |
|                          +-----------------------+                  |                   |
|                          |    Context Engine     |                  |                   |
|                          | - Situational Package |<-----------------+                   |
|                          | - Metadata scores     |                                      |
|                          +-----------+-----------+                                      |
|                                      |                                                  |
|                                      v                                                  |
|                          +-----------------------+                                      |
|                          | Vector DB Abstraction |                                      |
|                          | - Hybrid Search       |                                      |
|                          +-----------------------+                                      |
+-----------------------------------------------------------------------------------------+
                                       |
                                       | persists states
                                       v
                     +-----------------------------------+
                     |      Enterprise Database Layer     |
                     |  (neora-cognitive-memories.json)  |
                     +-----------------------------------+
```

---

## 2. Memory Engine

### Memory Categories
Neora defines a strict taxonomy of 18 separate semantic memory slots to prevent raw message flooding:

1.  **Conversation Memory**: Chat queries, user corrections, and formatting summaries.
2.  **Project Memory**: Scope declarations, canvas parameters, and historic layout edits.
3.  **Design Memory**: Selected alignment grids, composition styles, and negative space configurations.
4.  **Visual Memory**: Color/font extractions and layout composition details from uploaded reference images.
5.  **Typography Memory**: Pairing structures, kerning overrides, and preferred letter-spacing multipliers.
6.  **Color Memory**: Color psychology bindings, semantic brand primary colors, and custom palette combos.
7.  **Brand Memory**: Guidelines, rules, logo margins, spacing metrics, and brand assets.
8.  **Client Memory**: Business context, client branding constraints, and guidelines.
9.  **Template Memory**: Selected flyer, brochure, postcard structures, and dimensions.
10. **Asset Memory**: Vector coordinates, uploaded icons, logo locations, and sizing metadata.
11. **Reference Memory**: Aesthetic annotations, design inspirations, and layout analysis notes.
12. **Plugin Memory**: Custom script bundles, export hooks, and tool capability descriptions.
13. **AI Decision Memory**: Rationales behind model selections, fallbacks, and cost/quality trade-offs.
14. **Workflow Memory**: Staggered historical operations (e.g., Alpona vector generation).
15. **Export Memory**: Print safe coordinates, CMYK checks, and requested formats (e.g., PDF/SVG).
16. **Research Memory**: Cultural trends, seasonal event assets, and guidelines.
17. **Learning Memory**: Dynamic sliding-window logs tracking alignment habits and text positioning.
18. **Creative Memory**: Geometric patterns, floral curves, and Guilloché line mathematics definitions.

### Lifecycle Pipeline
The Memory Engine guarantees high-integrity lifecycles:
*   **Create**: Automatically parses structures, assigns UUIDs, computes confidence, and saves to the long-term DB.
*   **Merge**: Resolves conflicting knowledge overlapping on similar keys using a confidence-score gate.
*   **Archive**: Supports soft-deletion to ensure search queries ignore old nodes, but maintains historical audits.
*   **Expiry**: Automatically schedules temporary nodes to expire using an automated cron-like scheduler.
*   **GDPR Purge**: Erases user data permanently across both cached memory and physical files upon request.
*   **Audit Trail**: Every creation, modification, and deletion is recorded inside `neora-cognitive-audit-log.json` for security.

---

## 3. Preference Engine & Learning System

The Preference Engine manages user configurations (writing directions, layout settings, print presets) and implements adaptive learning loops.

### Multilingual Formatting Presets
When a specific language is queried, the engine loads customized OpenType and layout properties:

| Language | Default Font Families | Direction | Calligraphy Motif | Baseline Shift |
| :--- | :--- | :--- | :--- | :--- |
| **Bengali (bn)** | Hind Siliguri, Galada | LTR | Bangla Alpona | +5.0 px |
| **Arabic (ar)** | Amiri, Cairo | RTL | Islamic Thuluth | 0.0 px |
| **Urdu (ur)** | Noto Nastaliq Urdu | RTL | Islamic Nastaliq | +3.0 px |
| **English (en)**| Inter, Space Grotesk | LTR | Modern Brush | 0.0 px |

### Adaptive Learning Loop
Under user control (`learningEnabled: true`), recording interactive changes refines preferences:
1.  **Text Alignment**: If the user aligns text to the right multiple times, the layout engine shifts its default composition templates to use asymmetric right grids.
2.  **Typography Choice**: Incorporating unique typeface pairing overrides elevates those choices to top priority lists.
3.  **Color Selections**: Custom palettes are saved to the user's preferred visual combinations list.
4.  **Layout Spacing**: Density and spacing ratios are stored as averages to configure either `spacious_minimal` or `dense_grid` workflows.

---

## 4. Creative Knowledge Graph Guide

The Knowledge Graph connects isolated semantic elements to form a relational grid of creative design rules.

### Node and Edge Schemas
*   **Nodes**: `GraphNode` elements (User, Project, Brand, Font, Color, Layout, Asset, Template, Style, Plugin, Model, Export, Research) with unified properties.
*   **Edges**: `GraphEdge` elements (source, target, relationship) with confidence scores, source attributions, and timestamps.

### Graph Traversal Examples
*   **Neighborhood Tracing**: BFS traversal allows downstream agents to trace relationships (e.g., `User --[creates]--> Project --[embodies]--> Style --[recommends]--> Font`) to query matched typefaces up to 3 depth layers away.
*   **Asset Recommendations**: Querying `"Islamic Golden Luxury"` returns linked gold palettes, Amiri typefaces, and custom star vector assets automatically.
*   **Confidence-Based Merging**: Merging a brand color update only succeeds if the new source has a higher confidence score than the existing record.

---

## 5. Context Builder Engine

The Context Engine packages information into an immutable `ContextPackage` situational payload:

```json
{
  "id": "ctx_981a2f_16b2",
  "timestamp": "2026-07-16T08:00:00.000Z",
  "userId": "usr_admin",
  "activeProjectId": "proj_foundation_1",
  "conversationContext": {
    "recentMessages": [],
    "activeIntent": "design high-contrast secure flyer"
  },
  "projectContext": {
    "dimensions": { "width": 1080, "height": 1080 },
    "layerSummary": [
      { "id": "layer_1", "name": "Guilloché Security Line", "type": "shape", "opacity": 0.2 }
    ]
  },
  "visualContext": {
    "detectedColors": [{ "hex": "#0a0a0a", "ratio": 0.7 }],
    "detectedMood": "corporate minimal",
    "detectedComposition": "centered geometric grid",
    "ornaments": ["anti-copy secure guilloche meshes"]
  },
  "userPreferences": {
    "preferredLanguage": "en",
    "preferredFonts": ["Space Grotesk", "Inter"]
  },
  "relevantMemories": [
    {
      "id": "mem_creative_123",
      "category": "creative",
      "key": "guilloche_math",
      "value": "sine-wave mathematical line patterns"
    }
  ]
}
```

---

## 6. Developer SDK API Reference

### 1. Memory Management
```typescript
import { cognitiveSdk } from "./src/lib/ai/cognitive/CognitiveSdk.ts";
import { MemoryCategory } from "./src/lib/ai/cognitive/types.ts";

// Create a semantic memory
const memory = cognitiveSdk.memory.create({
  userId: "usr_admin",
  projectId: "proj_1",
  category: MemoryCategory.BRAND,
  tags: ["brand", "royal"],
  key: "brand_primary_color",
  value: "#f59e0b",
  importance: 5,
  confidence: 1.0,
  sourceAttribution: "brand_pdf_document",
  expiresAt: null
});

// Search memories hybrid style
const results = cognitiveSdk.memory.search({
  text: "royal golden colors",
  category: MemoryCategory.BRAND,
  confidenceMin: 0.8
});
```

### 2. Preference and Learning Management
```typescript
// Fetch user preferences
const prefs = cognitiveSdk.preferences.get("usr_admin", "proj_1");

// Record action to adapt habits
cognitiveSdk.preferences.recordInteractiveEdit("usr_admin", {
  align: "right",
  fontFamily: "Noto Nastaliq Urdu"
});
```

### 3. Knowledge Graph
```typescript
// Add entities
cognitiveSdk.graph.addNode("proj_1", "project", "Ramadan Post");
cognitiveSdk.graph.addNode("font_amiri", "font", "Amiri Regular");

// Establish relationship
cognitiveSdk.graph.addEdge("proj_1", "font_amiri", "USES_FONT", 0.95, "system_detection");

// Trace connections up to 3 levels deep
const paths = cognitiveSdk.graph.traceNeighbors("proj_1", 3);
```

### 4. Observability and Performance Metrics
```typescript
const metrics = cognitiveSdk.getMetrics();
console.log(`Total Memories: ${metrics.totalMemoriesCount}`);
console.log(`Cache Hit Ratio: ${metrics.cacheHitRatio * 100}%`);
console.log(`Context Build Speed: ${metrics.contextAssemblyTimeMs} ms`);
```

---

## 7. Migration & GDPR Privacy Guide

### GDPR Data Deletion
For full user privacy compliance, the `cognitiveSdk.memory.purgeUser(userId)` method:
1.  Removes all entries belonging to the user from the cache.
2.  Filters out the user's data from the physical memory storage file.
3.  Writes a certified GDPR-purge entry into the tamper-resistant security audit log.

### Migration Guidelines
If migrating from Phase 1.0 key-value stores to the Phase 1.5 Cognitive Foundation:
1.  Load the original entries from `projectMemory`.
2.  Map each key-value pair to a structured `MemoryEntry`, assigning them correct `MemoryCategory` fields.
3.  Hydrate the newly structured memories into `neora-cognitive-memories.json`.
