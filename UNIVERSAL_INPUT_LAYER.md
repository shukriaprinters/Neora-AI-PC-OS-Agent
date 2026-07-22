# NEORA DESIGN OS V2 - VOLUME 1, CHAPTER 1, PART 4.2.3.1: UNIVERSAL INPUT LAYER
## Enterprise Architecture Specification (Version 6.0)

This master specification defines the architectural design, ingestion pipeline stages, semantic schemas, and connection pathways of the **Universal Input Layer** within Neora Design OS. 

The Universal Input Layer serves as the **Sensory Cortex** of the entire operating system, transforming raw, multimodal user files and streams into a single structured, intelligent design context.

---

## 1. High-Level Ingestion Architecture

Everything that enters Neora must pass through this cognitive gateway. The layer does not just parse file data; it parses meaning.

```
+---------------------------------------------------------------------------------+
|                                 USER INPUTS                                     |
|          (Text, Spoken Voice, Raster Images, Vector SVGs, PDFs, DOCX)           |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                         STAGE 1: DETECTION & PROFILING                          |
|          - Validates mime-types, extracts dimensions, detects languages         |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                         STAGE 2: INTENT & SANITIZATION                          |
|          - Screens payload for security risks, corruption, or missing assets    |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                         STAGE 3: CLASSIFICATION & SCHEMA                        |
|          - Classifies format (Poster, Invoice, Logo) and builds Design Context  |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                             UNIFIED DESIGN CONTEXT                              |
|          - Downstream pipelines consume this clean JSON representation          |
+---------------------------------------------------------------------------------+
```

---

## 2. Ingestion Pipeline Stages

To guarantee enterprise-grade data safety and visual extraction, the pipeline resolves in five sequential phases:

### Phase I: Detection & Profiling
*   **Asset Ingestion:** Captures input buffers (whether raw voice streams, raster PNGs, clean SVGs, or text strings).
*   **Metadata Extraction:** Reads internal metadata—including dimensions, aspect ratios, color spaces (RGB, CMYK), and embedded font files.

### Phase II: Safety Validation & Sanitization
*   **Security Sweeper:** Filters incoming payloads to neutralize malicious scripts, embedded commands, or corrupted visual matrices.
*   **Sanitary Alerts:** Flags broken links, extremely low-resolution references, and missing system fonts with helpful suggestions.

### Phase III: Semantic Classification
*   **Visual Type Classification:** Uses semantic analysis to identify what the uploaded item represents (e.g., a hand-drawn poster sketch, a business catalog, an Islamic calligraphy border, or a vector corporate logo).
*   **Structure Profiling:** Analyzes layout boundaries, relative component coordinates, and whitespace distribution.

### Phase IV: Creative Context Extraction
*   **Purpose & Industry Extraction:** Deduces the targeted industry segment (e.g., Traditional Retail Printing, Digital Social Media, Personal Wedding Celebration).
*   **Language & Typography Analysis:** Evaluates script distribution (such as detecting Bengali characters or Arabic glyph structures) to prepare typography engines.

### Phase V: Relationship Mapping & Fusion
*   **Cross-Asset Mapping:** Links multiple disparate inputs together. For example, if a user uploads a corporate logo image and a PDF content brief, the relationship engine maps the logo to the layout's primary emblem container.
*   **Contextual Fusion:** Resolves all concurrent inputs (Voice, Text, and Graphic References) into one single state representation.

---

## 3. The Unified Design Context Schema

All downstream AI modules and vector generators are strictly forbidden from parsing raw user files. Instead, they consume the unified, sanitized context model produced by this layer.

```json
{
  "$schema": "https://neora.design/schemas/unified-design-context-v6.json",
  "projectMetadata": {
    "targetFormat": "business_card",
    "dimensions": { "width": 1050, "height": 600, "unit": "px" },
    "colorSpace": "CMYK",
    "language": "bn"
  },
  "aestheticGuidelines": {
    "mood": "luxurious_festive",
    "colorHarmony": "complementary",
    "suggestedPalette": ["#991b1b", "#fbbf24", "#ffffff", "#1e293b"],
    "primaryFont": "Hind Siliguri",
    "secondaryFont": "Inter"
  },
  "extractedRelationships": {
    "primaryEmblem": "asset-cache-logo-123.svg",
    "supportingVisuals": ["asset-cache-border-art.png"],
    "copyTexts": {
      "heading": "শুভ নববর্ষ ১৪৩৩",
      "tagline": "নিওরা ডিজাইন স্টুডিও",
      "contactInfo": "মোবাইল: ০১৭০০-০০০০০০"
    }
  },
  "technicalConstraints": {
    "bleedMargin": 15,
    "safeMargin": 30,
    "contrastThreshold": 4.5
  },
  "confidenceScore": 0.94
}
```

---

## 4. Automatic System Backfills & Fault-Tolerance

If the incoming user inputs are highly sparse or incomplete, the Universal Input Layer applies resilient default presets (Smart Defaults):

*   **Aspect Ratio Standardization:** Defaults cards to 4:3, flyers to 1:1.414 (A4 ratio), and banners to 16:9 or custom square profiles depending on semantic category.
*   **Linguistic Safe margins:** Bengalese and Arabic scripts default to 1.3x typical line-height margins to guarantee no overlapping characters or clipped vowels.
*   **Resiliency Core:** When confidence metrics fall below 60%, the system falls back to a clean corporate design schema, logs the backup adjustment in the system logs, and remains fully functional.
