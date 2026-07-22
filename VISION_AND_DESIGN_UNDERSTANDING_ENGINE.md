# NEORA DESIGN OS V2 - PHASE 2.4.2: ENTERPRISE VISION & DESIGN UNDERSTANDING ENGINE
## Enterprise Master Specification (Version 41.0)

This master specification defines the architectural layouts, normalization pipelines, object segmentations, multi-language OCR, and visual evaluation logic for the **Enterprise Vision & Design Understanding Engine** within Neora Design OS.

---

## 1. Core Architectural Paradigm & Vision Pipeline

The Vision & Design Understanding Engine serves as the visual perception layer of Neora, converting flat pixels, scans, and reference designs into structured, understandable layers.

```
+---------------------------------------------------------------------------------+
|                                 VISUAL INPUTS                                   |
|          - Gathers raster PNG/JPG designs, PDF documents, sketches, and scans   |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                        VISION UNDERSTANDING ENGINE                              |
+---------------------------------------------------------------------------------+
|  1. NORMALIZATION LAYER   - Corrects perspectives, skews, and improves contrast |
|  2. LAYOUT ANALYZER       - Infers grid margins, columns, and visual flow      |
|  3. OBJECT & TEXT OCR     - Runs high-accuracy multi-language transcription    |
|  4. SEGMENTATION MASKER   - Isolates foreground figures from background tones  |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
|                             DESIGN QUALITY ANALYSIS                             |
|          - Outputs balance scores, typography reports, and color harmonies     |
+---------------------------------------------------------------------------------+
```

---

## 2. Platform Core Subsystems & Vision Layer

### I. Multi-Language OCR System
*   **Complex Script Analysis:** Reads printed and handwritten scripts (Bangla, English, Arabic, Urdu, Hindi) without losing formatting bounds.
*   **Vowel Anchor Detection:** Recognizes Arabic accents (Diacritics/Harakat) and Bangla vowel modifiers (Kar/Phola).

### II. Layout Understanding Engine
*   **Compositional Analysis:** Infers bounding positions, alignment hierarchies, margin widths, and whitespace distributions.
*   **Structure Profiling:** Classifies files into specific design types (e.g., posters, logos, packaging, business cards).

---

## 3. Foreground Segmentation & Smart Masking

The engine isolates foreground objects from background planes automatically:
*   **One-Click Selection:** Generates highly accurate vector mask outlines around main figures, product packaging, or text blocks.
*   **Asset Isolation:** Allows designers to instantly extract visual assets from uploaded reference screenshots.

---

## 4. REST API Endpoint Specifications

### 1. Execute Visual Layout and OCR Analysis
*   **Endpoint:** `POST /api/evdue/image/analyze`
*   **Payload:**
    ```json
    {
      "imageUrl": "https://neora-assets/ref-catalog.png",
      "features": ["layout", "ocr", "colors"],
      "languages": ["bn", "en"]
    }
    ```
*   **Response:**
    ```json
    {
      "analysisId": "anal-evdue-101",
      "layout": {
        "dimensions": { "width": 1920, "height": 1080 },
        "grid": { "columns": 12, "margin": 60 }
      },
      "ocr": [
        { "text": "শুভ নববর্ষ", "confidence": 98, "boundingBox": { "x": 100, "y": 120, "w": 400, "h": 80 } }
      ],
      "dominantColors": ["#020617", "#ff007c", "#ffffff"]
    }
    ```

### 2. Segment Bounding Objects & Masks
*   **Endpoint:** `POST /api/evdue/image/segment`
*   **Payload:**
    ```json
    {
      "imageUrl": "https://neora-assets/ref-catalog.png",
      "targetCoordinates": { "x": 200, "y": 300 }
    }
    ```
*   **Response:** Outputs base64 object masks and isolated foreground clipping paths.

---

## 5. WebSocket Live Stream Specifications

Live image processing pipelines, background segmentation stages, and OCR transcription updates stream directly over WebSockets:

*   **Address:** `ws://0.0.0.0:3000/api/evdue/vision/stream`
*   **Events Dispatched:**
    *   `LayoutDetected`: Triggered when layout columns and alignments are inferred.
    *   `OCRCompleted`: Triggered when script transcribing completes.
    *   `ObjectsDetected`: Dispatched when face, logo, or container bounding boxes are identified.

---

## 6. Plugin SDK Interfaces

Developers write customized OCR formatters and object detectors using simple SDK interfaces:

```typescript
import { registerEvdueOcrFormatter } from "./sdk/evdue";

registerEvdueOcrFormatter({
  id: "clean-phone-number-ocr",
  format: (ocrResult) => {
    return ocrResult.map(item => {
      if (item.text.match(/\+?[0-9\s-]{10,15}/)) {
        return {
          ...item,
          classifiedType: "contact_number",
          text: item.text.replace(/[\s-]/g, "")
        };
      }
      return item;
    });
  }
});
```
