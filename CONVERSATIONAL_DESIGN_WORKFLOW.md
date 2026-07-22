# NEORA DESIGN OS V2 - VOLUME 1, CHAPTER 1, PART 4.2.2: CONVERSATIONAL DESIGN WORKFLOW
## Enterprise Master Specification (Version 5.5)

This master specification governs the complete conversational interaction design, intent parsing pipeline, decision-making rules, and human-in-the-loop workflow paradigms for **Neora Design OS**. It establishes natural conversation as the primary interface for creative work, with professional vector editing acting as the high-precision backup.

---

## 1. Conversational Design Workflow Architecture

Neora’s conversational architecture treats natural language not as a simple search query, but as a dynamic **Intent Bus** that drives direct state mutations on the active vector canvas.

```
+-----------------------------------------------------------------------------------+
|                              1. NLP DIALOG INTAKE                                 |
|          - Accepts casual mixed-language inputs (Bangla, English, Arabic)         |
+-----------------------------------------------------------------------------------+
                                         v
+-----------------------------------------------------------------------------------+
|                             2. INTENT RESOLUTION                                  |
|          - Extracts Semantic Objectives & identifies Context Profiles             |
+-----------------------------------------------------------------------------------+
                                         v
+-----------------------------------------------------------------------------------+
|                           3. DYNAMIC CRITICAL AUDITING                            |
|          - Compiles Layout Plans and maps asset-to-canvas coordinates             |
+-----------------------------------------------------------------------------------+
                                         v
+-----------------------------------------------------------------------------------+
|                            4. MUTATION COMMITTAL                                  |
|          - Direct layer parameters are modified on the live artboard              |
+-----------------------------------------------------------------------------------+
```

1.  **Dialog Intake:** The user enters a casual, goal-oriented instruction.
2.  **Intent Resolution:** The system parses the instruction, classifying it as either a *creative initiation* (e.g., creating a new design) or an *interactive mutation* (e.g., editing an existing layer).
3.  **Critical Auditing:** The AI cross-references the instruction with brand requirements, safe grids, and color-contrast guidelines.
4.  **Mutation Committal:** The corresponding layer properties are updated in the store, immediately reflecting on the visual canvas.

---

## 2. Goal-Driven Interaction Rules

To eliminate prompt-engineering overhead for the end user, Neora assumes complete responsibility for establishing default design specifications:

*   **Default Sizing Profiles:** If the user says *"make an Eid card"*, Neora automatically infers a standard card aspect ratio (e.g., 4:3), safe margins (5%), and print-ready high-contrast margins.
*   **Intelligent Backfills:** Absent specific instruction, Neora pulls typography pairings, color harmonies, and layout alignments from previous session histories or brand kits, allowing generation to proceed with zero initial setup friction.
*   **Minimizing Dialog Redundancy:** The AI only requests clarification when critical variables are missing (such as custom phone numbers or exact business titles for commercial invoices).

---

## 3. The Intent Understanding Pipeline

Every incoming chat payload passes through a highly structured understanding pipeline:

```
[Raw User Input] ---> [Entity Classification] ---> [Language Identification] ---> [Unified Intent State]
```

1.  **Entity Classification:** Separates text content into semantic categories: *Heuristics* (e.g., "more festive", "luxurious"), *Data Strings* (e.g., "Phone: 01700-000000"), and *Actions* (e.g., "move", "resize", "make larger").
2.  **Language & Script Identification:** Detects the language (e.g., Bengali, Arabic, English) and maps typographic families to support character-dense glyphs seamlessly.
3.  **Unified Intent State:** Compiles a finalized instructions payload containing target layers, required properties, and aesthetic parameters.

---

## 4. Multi-Modal Conversation Integration

Neora allows users to combine visual, spoken, and text-based references into a single unified workspace context:

*   **Mixed Reference Fusion:** A user can upload an image (e.g., a hand-drawn Alpona sketch), speak a command (e.g., *"এটিকে কার্ডের লোগো হিসেবে ব্যবহার করো"*), and type support copy. The conversational engine maps the spoken action to the uploaded asset and commits it as an emblem layer.
*   **Contextual Saliency Analysis:** Uploaded reference graphics are evaluated for style, compositional weight, and core colors. These components are stored as active design guidelines.

---

## 5. Automatic Decision-Making Principles

When confidence scores from the NLP interpreter exceed 80%, Neora makes immediate design choices to streamline the workflow:

*   **Typography Sizing:** Headings are sized between 32px and 48px to establish clear focal authority. Subheadings and body copy are automatically scaled down to preserve geometric hierarchy.
*   **Grid Alignments:** Elements are snapped to 4px or 8px vertical grids to prevent arbitrary, messy spacing.
*   **Auto-Contrast Correction:** If a user selects a light color for a text layer sitting on a white card background, the system automatically shifts the font hex color to a dark, legible tone, logging the action in the System Logs.

---

## 6. Design Exploration & Gallery Workflow

Instead of forcing a single, rigid visual outcome, Neora presents multiple aesthetic variations (Presets) simultaneously:

*   **Traditional Festive Bangla:** Deep reds, warm yellows, and artistic Bengali typography (e.g., *Atma*, *Hind Siliguri*).
*   **Royal Islamic Feast:** Emerald greens, deep velvets, golden script accents, and classic Arabic calligraphy.
*   **Sleek Modern Corporate:** High-contrast slates, minimal white space, sharp grids, and clean sans-serif typography.
*   **Neon Cyber Studio:** High-contrast obsidian, bright neon pink and cyan borders, and technical mono-spaced telemetry fonts.

The user can cycle through these variations interactively, blending or applying styles in real-time.

---

## 7. Online Research Policy (Trusted Knowledge Enrichment)

If permitted by the user, Neora can run real-time queries to enrich design projects with context-accurate parameters:

*   **No Copying Policy:** The system never scrapes copyrighted artwork or visual assets.
*   **Knowledge Extraction:** Extracts structured parameters such as seasonal color palettes, regional font families, printing bleed specs, and culturally-relevant visual motifs.

---

## 8. Memory-Aware Conversation Rules

The system maintains a lightweight, local memory profile to preserve personalization across workspace sessions:

*   **Asset Cataloging:** Frequently uploaded assets (logos, icons, contact frames) are automatically indexed and prioritized in future conversational suggestions.
*   **Style Prefs Memory:** If the operator consistently applies a specific corporate color scheme across multiple separate card designs, the conversational assistant defaults to proposing that style first.

---

## 9. Conversational Editing Standards

Workspace adjustments must use precise, non-destructive layer mutations instead of full-image regenerations:

*   **Direct Selector Targeting:** If the user prompts *"make the title larger"*, the assistant locates the layer with `id: "autolayer-title"` (or `type: "text"`) and increases its font-size property incrementally.
*   **Immutable User Locks:** Any property manually changed by the user (such as positioning coordinates, text contents, or border-radius values) is flagged as "user-modified" and is completely protected from automatic AI style alterations.

---

## 10. Human Control, Governance, and Error Handling

*   **The Operator Decides:** The user maintains ultimate control. Every AI mutation can be instantly reversed using standard Undo/Redo mechanisms.
*   **Self-Healing Errors:** If a conversational command fails due to overlapping bounds or bounding box issues, the system performs a localized adjustment, registers a descriptive entry in the system logs, and continues operations without crashing.
