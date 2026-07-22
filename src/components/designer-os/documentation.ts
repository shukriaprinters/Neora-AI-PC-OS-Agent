export interface ArchDiagram {
  name: string;
  ascii: string;
  description: string;
}

export const ARCH_DIAGRAMS: ArchDiagram[] = [
  {
    name: "NDSRP Neora Design Studio Runtime Platform",
    ascii: `
+-------------------------------------------------------------------------+
|                  NDSRP CORE STUDIO RUNTIME ARCHITECTURE                 |
+-------------------------------------------------------------------------+
|                                                                         |
|                         [Client / Operator Inputs]                      |
|                                     |                                   |
|                                     v                                   |
|                         +-----------------------+                       |
|                         |  Execution Mode Router|                       |
|                         +-----------------------+                       |
|                           /         |         \\                         |
|                          /          |          \\                        |
|                         v           v           v                       |
|                   {Local Edge}  {Hybrid}  {Cloud Engine}                |
|                                     |                                   |
|                                     v                                   |
|         +-------------------------------------------------------+       |
|         |           12 COOPERATIVE DECOUPLED RUNTIMES           |       |
|         +-------------------------------------------------------+       |
|         | 1. AI Gateway    | 2. Vision Audit   | 3. Render Canvas|      |
|         | 4. Workspace DOM | 5. Asset Cache    | 6. Memory Vault |      |
|         | 7. Sandbox Rule  | 8. Automation DAG | 9. Export Bundler|     |
|         | 10. Security Ledg| 11. Telemetry Mon | 12. Plugin Hooks|      |
|         +-------------------------------------------------------+       |
|                                     |                                   |
|                                     v                                   |
|                         +-----------------------+                       |
|                         | Hardware Accelerators |                       |
|                         +-----------------------+                       |
|                         |  WebGPU | CUDA | CPU  |                       |
|                         +-----------------------+                       |
|                                                                         |
+-------------------------------------------------------------------------+
`,
    description: "The enterprise-ready operational runtime architecture topology of Neora, showing interchangeable execution tiers, WebGL render pipelines, and decoupled service layers."
  },
  {
    name: "NACDI Autonomous Creative Director Cognitive Architecture",
    ascii: `
+------------------------------------------------------------------------+
|              NACDI AUTONOMOUS STRATEGIC REASONING COGNITION            |
+------------------------------------------------------------------------+
|                                                                        |
|                       [User Creative Intent / Goal]                    |
|                                     |                                  |
|                                     v                                  |
|                    [Audience Intelligence Engine]                      |
|                     (Builds Persona / Devices Model)                   |
|                                     |                                  |
|                                     v                                  |
|                      [Brand Strategy Engine]                           |
|                    (Voice, Color, Typography Rules)                    |
|                                     |                                  |
|                                     v                                  |
|                       [Creative Brief Generator]                       |
|                   (Binds Constraints & Objectives DAG)                 |
|                                     |                                  |
|                                     v                                  |
|                     [Decision Intelligence Engine]                     |
|                    (Logs Decision, Rationale, Confide)                 |
|                                     |                                  |
|                  +------------------+------------------+               |
|                  | (Generates Concept Alternatives)    |               |
|                  v                                     v               |
|         {High Luxury Path}                    {Traditional Craft}      |
|                  |                                     |               |
|                  +------------------+------------------+               |
|                                     v                                  |
|                        [Risk Management System]                        |
|                    (Evaluates Brand & Print Threat Radar)              |
|                                     |                                  |
|                                     v                                  |
|                      [Multi-Agent Objectives Dispatch]                 |
|               - Distributes structured targets (No raw prompts)        |
|                                                                        |
+------------------------------------------------------------------------+
`,
    description: "The cognitive strategic planning topology of Neora's Autonomous Creative Director, mapping audience personas, brand matrices, and risk assessments into structured objectives."
  },
  {
    name: "NCOAMPP Multi-Agent Coordination Topology",
    ascii: `
+------------------------------------------------------------------------+
|                      NCOAMPP ORCHESTRATION PIPELINE                     |
+------------------------------------------------------------------------+
|                                                                        |
|    [User Design Intent] ---> [Cortex-P DesignPlanner]                  |
|                                     |                                  |
|                                     v                                  |
|                         [Dynamic Task DAG Planner]                     |
|                                     |                                  |
|               +---------------------+---------------------+            |
|               | (Parallel Specialist Agents Execution)     |            |
|               v                                           v            |
|       [Sleuth Research]                             [Scribe Callig]    |
|               |                                           |            |
|               +---------------------+---------------------+            |
|                                     v                                  |
|                          [GridMaster Layout]                           |
|                                     v                                  |
|                          [Kerner Typography]                           |
|                                     v                                  |
|                          [Sentinel QAReviewer]                         |
|                                     |                                  |
|                                     v                                  |
|                           {Human Approval Gate}                        |
|                                     |                                  |
|                                     v                                  |
|                            [BundleX Export]                            |
|                                     |                                  |
|                                     v                                  |
|                    (Production Print SVG/PDF Packages)                 |
|                                                                        |
|  [Event-Driven Central Bus]                                            |
|   - TaskCreated -> TaskStarted -> TaskCompleted -> ExportCompleted     |
|                                                                        |
+------------------------------------------------------------------------+
`,
    description: "Multi-agent runtime event system planning dynamic directed acyclic graphs (DAGs) of creative execution with parallel agent specialists and manual approval gates."
  },
  {
    name: "Neora State & Storage Architecture",
    ascii: `
+------------------------------------------------------------------------+
|                      NEORA DESIGNER OS STATE ENGINE                     |
+------------------------------------------------------------------------+
|                                                                        |
|  [React Component Layers] <----> [Keyboard Shortcut Manager Engine]    |
|            |                                  |                        |
|            v                                  v                        |
|  +-------------------+              +--------------------+             |
|  |   ProjectStore    |              |    CanvasStore     |             |
|  | - Active Project  |              | - Zoom Factor (50%)|             |
|  | - Project History |              | - Pan Coordinates  |             |
|  +-------------------+              +--------------------+             |
|            |                                  |                        |
|            v                                  v                        |
|  +-------------------+              +--------------------+             |
|  |    LayerStore     |              |   SelectionStore   |             |
|  | - Layer Tree Nodes| <----------> | - Selected Layer Id|             |
|  | - Locked & Visible|              | - Active Bounding  |             |
|  +-------------------+              +--------------------+             |
|            |                                                           |
|            +-----------------------+                                   |
|                                    v                                   |
|                          +--------------------+                        |
|                          |    HistoryStore    |                        |
|                          | - Undo Operations  |                        |
|                          | - Redo Operations  |                        |
|                          +--------------------+                        |
|                                                                        |
|  [REST API Endpoint Synchronization Gateway]                           |
|       |                     |                      |                   |
|       v                     v                      v                   |
|  /api/project/save   /api/layer/update      /api/export/output         |
|       |                     |                      |                   |
|  +------------------------------------------------------------------+  |
|  |                     POSTGRESQL CLOUD SQL DATABASE                |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
`,
    description: "Multi-store decoupled state flow mapping layer actions, dynamic undo caches, and asynchronous server-side REST api calls to PostgreSQL tables."
  },
  {
    name: "Plugin Registry Hook Topology",
    ascii: `
+------------------------------------------------------------------------+
|                     NEORA DESIGNER OS PLUGIN REGISTRY                  |
+------------------------------------------------------------------------+
|                                                                        |
|   +----------------------------------------------------------------+   |
|   |                      Plugin Registry Manager                   |   |
|   +----------------------------------------------------------------+   |
|          |                         |                        |          |
|          v                         v                        v          |
|   +--------------+          +--------------+         +--------------+  |
|   | Sidebar Hook |          | Toolbar Hook |         | Exporter Hook|  |
|   | - Custom     |          | - Injection  |         | - Format     |  |
|   |   Navigation |          |   Control    |         |   Adapters   |  |
|   |   Panels     |          |   Buttons    |         |   (PSD/SVG)  |  |
|   +--------------+          +--------------+         +--------------+  |
|                                                                        |
|   [Registered API Hook Middleware]                                     |
|    - RegisterSidebar(panelId, icon, element)                           |
|    - RegisterToolbarAction(actionId, label, callback)                  |
|    - RegisterExporterAdapter(mimeType, renderCallback)                 |
|                                                                        |
+------------------------------------------------------------------------+
`,
    description: "Detailed pipeline layout demonstrating how independent modules hook into the core editor shell to inject assets, custom sidebars, and custom export capabilities."
  }
];

export const DEVELOPER_DOCS = {
  title: "Neora Designer OS Core Extension Manual",
  chapters: [
    {
      title: "★ Neora Vision & Mission Specification (Vol 1, Ch 1, Pt 1)",
      content: `Welcome to the constitutional foundation of **Neora Design OS (Version 3.0)**. This document guides all modular expansion, cognitive workflows, and design engines.

### 1. Enterprise Product Vision
Neora is an **AI Creative Operating System**. It bridges the gap between raw human intent and premium print/web production assets. It features a conversational co-pilot integrated with a professional vector/raster canvas.

### 2. Enterprise Mission Statement
*"To liberate human creativity from the mechanics of execution."* We automate repetitive design production processes while preserving non-destructive user ownership, premium print capabilities, and absolute creative control.

### 3. Key Product Identity Parameters
- **Name**: Neora Design OS
- **Classification**: Conversational AI Creative Operating System
- **Dual-Interface Synergy**: Seamless split-screen combining natural language chat with a live, interactive layers panel and coordinate-driven vector canvas.

### 4. Interactive Style & Layout Synthesis
When a user uploads a reference image and asks Neora to design, the **Neora Vision Intelligence Platform (NVIP)** extracts layout DNA and constructs an **85% ready design composition** on the artboard. Users can then:
1. Cycle through multiple variations (Traditional Bengali, Royal Islamic Gold, Swiss Business, Cyber Neon) with a single click.
2. Interactively resize, drag, lock, or manually edit layers.
3. Access WCAG accessibility contrast and boundary checks.

### 5. Architectural Alignment Laws
- **Decoupled State**: Component views must dispatch canvas actions using centralized stores (stores.ts).
- **No Exposed Secrets**: All third-party or LLM API keys must run behind server-side proxies (/api/*).
- **N-D Layouts**: The canvas must always support non-destructive layer editing rather than flat bitmaps.`
    },
    {
      title: "★ Neora Product Identity & Philosophy (Vol 1, Ch 1, Pt 2)",
      content: `This master specification defines the permanent identity, creative philosophy, behavioral rules, and foundational values of **Neora Design OS**.

### 1. Product Identity
Neora functions as an **AI Creative Partner** that understands, plans, structures, and designs alongside the human operator. It is NOT a raw image generator producing flat, uneditable pixels, nor is it a static template library or simple chatbot.

### 2. The Design DNA
All design operations in Neora must trace through a strict cognitive pipeline:
1. **Understanding**: Deep semantic parsing of user inputs.
2. **Reasoning**: Cross-referencing audience intent and output constraints.
3. **Planning**: Constructing layout grids and scheduling resources.
4. **Creation**: Instantiating vector paths and typography.
5. **Review**: Auditing canvas bounds for overlaps and accessibility contrast.
6. **Improvement**: Fine-tuning based on conversational inputs.

### 3. Human Control Principles
AI assists, humans decide. The AI must never overwrite lock states, change manually modified text, or overwrite user layouts without permission.

### 4. Non-Destructive Editing & Originality
- Every text box, shape border, and reference image exists as an independent layer in the state store.
- Neora never duplicates copyrighted art. It extracts stylistic cues (color palettes, typographic weights, grid hierarchies) to compose entirely original, editable art.`
    },
    {
      title: "★ Neora User Experience (UX) Vision (Vol 1, Ch 1, Pt 3)",
      content: `This specification outlines the end-to-end User Experience standards and interaction models for **Neora Design OS**.

### 1. End-to-End User Journey
1. **Input**: User uploads a reference image or enters descriptive prompt text (Bangla, English, Arabic, Hindi, Urdu).
2. **Cognitive Planning**: Neora parses the design goal and logs step-by-step briefs.
3. **Multi-Concept Synthesis**: Neora generates up to 4 beautifully stylized, original layout variations.
4. **Active Workspace**: The chosen concept opens directly onto the interactive canvas.
5. **Interactive Tweaks**: Human and AI collaborate in real-time.
6. **Print-Ready Export**: Clean vector SVG, PNG, or print-safe profiles are downloaded.

### 2. The Dual-Mode Paradigm
- **Mode A (AI Designer)**: Fast, automated, high-quality layout creation where the AI performs 80% to 90% of the repetitive visual setup.
- **Mode B (Professional Editor)**: Absolute manual precision and pixel-level control over vector paths, individual layers, exact color values, lock/visibility, and typographic spacing.
- **Multilingual Script Preservation**: Traditional Bengali, Arabic, and Sanskrit script formatting are natively supported. Script-aware spacing dynamically expands viewport parameters to prevent text clipping.`
    },
    {
      title: "★ Overall System Architecture (Vol 1, Ch 1, Pt 4.1)",
      content: `This specification defines the comprehensive layered system layout and state/service communication model of **Neora Design OS (Version 4.0)**.

### 1. Unified Operating System
Neora Design OS is a fully unified environment. AI Chat, AI Design Studio, Workspace Editor, Memory, Knowledge, and the Model Router all connect over a centralized event-driven state and service bus.

### 2. Layered Architecture
- **Presentation Layer**: Conversational Sidebar, Canvas, Layer Tree, and Gallery.
- **AI Orchestration Layer**: Dynamic Agent dispatchers (Intent, Vision, Layout, Quality).
- **Workspace State Layer**: Interactive layer stores with immutable action queues.
- **Service & Resource Layer**: Local storage cache mirrors, server-side secure proxies, and file systems.

### 3. Asynchronous Event-Driven Messaging
To support non-blocking background rendering, components dispatch atomic actions to centralized state managers. Status logs are pushed to a unified logging channel to update AI thinking indicators in real-time.`
    },
    {
      title: "★ AI Design Studio Vision (Vol 1, Ch 1, Pt 4.2.1)",
      content: `This specification outlines the permanent identity, scope, and rules of the **AI Design Studio** within Neora Design OS.

### 1. The Creative Intelligence Center
The AI Design Studio is NOT a raw pixel generator or static prompt helper. It acts as an experienced Design Director that reasons about audience intent, target formats, typography, colors, and print safety before starting vector composition.

### 2. Core Intelligent Pillars
1. **Context Reasoning**: Analyzes why the design is being created and who it is for.
2. **Composition Planning**: Computes optimal responsive layout grids, margins, and safe margins.
3. **Aesthetic Synthesis**: Pairs typography weights and builds mathematical color harmonies.
4. **Quality Review**: Programmatically audits text contrast (WCAG thresholds) and layers for overlapping collisions.

### 3. Safe Reference Translation
When users upload styling references, the studio extracts abstract features (dominant palette ratios, layout alignments, typographic classifications) to build original visual designs rather than duplicating copyrighted artwork.`
    },
    {
      title: "★ Conversational Design Workflow (Vol 1, Ch 1, Pt 4.2.2)",
      content: `This specification governs the conversational interaction design and decision-making pipeline for **Neora Design OS**.

### 1. Goal-Driven Interaction
Users describe goals naturally; Neora performs layout configuration under the hood. Technical terminology and prompt-engineering overhead are eliminated.

### 2. Multi-Modal Conversational Fusion
Plain text, spoken voice, reference raster PNGs, and corporate PDFs are merged into a single state representation (Unified Design Context).

### 3. Non-Destructive Conversational Editing
Conversational changes target existing workspace layers (such as increasing heading weights or shifting accent borders) using direct mutations, completely respecting human-edited properties as immutable lock-states.`
    },
    {
      title: "★ Universal Input Layer (Vol 1, Ch 1, Pt 4.2.3.1)",
      content: `This specification defines the five-stage ingestion pipeline of the **Universal Input Layer**, acting as the sensory gateway for Neora.

### 1. The Five Ingestion Phases
1. **Detection & Profiling**: Reads file MIME-types, metadata dimensions, and languages.
2. **Safety Validation**: Screens input buffers to neutralize security exploits or broken references.
3. **Semantic Classification**: Identifies content types (e.g., Poster, Business Card, Calligraphy).
4. **Creative Context Extraction**: Extracts stylistic DNA, language distribution, and visual tone.
5. **Relationship Mapping**: Pairs disparate assets together under unified structural links.

### 2. Unified Design Context Schema
Downstream layout generators consume a standardized JSON object that represents safe parameters, aesthetic guidelines, contrast thresholds, and confidence scores.`
    },
    {
      title: "★ Creative Knowledge Graph & Memory Engine (Vol 1, Ch 1, Pt 4.3.6B)",
      content: `This specification defines the operational blueprints, multi-vector schemas, and relational guidelines for the **Enterprise Creative Knowledge Graph & Design Memory Engine (CKGDME) (Version 26.0)**.

### 1. Long-Term Cognitive Memory
CKGDME indexes design sessions, user-feedback scores, typography ratios, color swatches, and asset relations to enable human-like recall and project-aware suggestions.

### 2. Core Operational Modules
1. **Semantic Search Engine**: Queries past designs using multi-dimensional vector embeddings based on mood or visual intent.
2. **Design DNA Generator**: Compiles custom stylistic fingerprints capturing user composition habits and typography scales.
3. **Reasoning Memory System**: Records the rationale behind coordinates and color updates with explicit explainability traces.`
    },
    {
      title: "★ Human Creative Reasoning Engine (Vol 1, Ch 1, Pt 4.3.6B.1.1)",
      content: `This specification outlines the strategic coordination, planning guidelines, and testing systems of the **Human Creative Reasoning Engine (HCRE) (Version 25.0)**.

### 1. The Strategic Creative Core
The HCRE acts as an experienced art director, constructing visual briefs, selecting compositional grid parameters, and generating execution steps before drawing vectors.

### 2. Analytical Capabilities
1. **Aesthetic Intent Decoding**: Resolves descriptions like "premium festive" into concrete color profiles and safe alignments.
2. **Linguistic Layout Calibration**: Programmatically sizes lines and safe boundaries to support complex Bangla/Arabic script geometry without collisions.
3. **Self-Critique Auditing**: Executes pre-render validations, shifting colors dynamically to maintain strict WCAG contrast scores.`
    },
    {
      title: "★ Autonomous Creative Director Engine (Vol 1, Ch 1, Pt 4.3.6B.1.2)",
      content: `This specification details the orchestration, brand auditing, and revision pipelines for the **Autonomous Creative Director Engine (ACDE) (Version 25.0)**.

### 1. Operational Coordinator
ACDE manages creative workflows, studies visual styling trends, audits design brand kits, and coordinates execution schedules across down-stream systems.

### 2. High-Performance Gates
1. **Brand Intelligence Audits**: Computes safe exclusion zones surrounding logo emblems to block text-layer overlaps.
2. **Multi-Concept Proposals**: Builds three distinct, custom design proposals (Traditional, Modern Minimal, Bold) for any given target objective.
3. **Revision Flow Managers**: Records client annotations and traces coordinate modifications during collaborative iteration.`
    },
    {
      title: "★ Multi-Agent Creative Execution Engine (Vol 1, Ch 1, Pt 4.3.6B.2)",
      content: `This specification details the agent topologies, communication protocols, and self-review systems of the **Multi-Agent Creative Execution Engine (EMCEE) (Version 27.0)**.

### 1. Unified Creative Agency Workspace
EMCEE operates as a collaborative multi-agent workforce, directing specialized agents (Typography, Vector Art, Layout, Color Lab, QA, Critic) to complete designs.

### 2. Robust Runtime Features
1. **Asynchronous Communication Bus**: Passes serialized events and JSON messages containing state transactions and design trace IDs.
2. **Conflict Resolution Heuristics**: Resolves overlapping bounds between layers through automated layout negotiations.
3. **Self-Review Loop**: Employs QA and Critic agents to audit crop markers, image compressions, and bleeds prior to final commit.`
    },
    {
      title: "★ Autonomous AI Research & Continuous Improvement Platform (Vol 1, Ch 1, Pt 4.3.6B.2.3)",
      content: `This specification establishes the evaluation, experimental testing frameworks, and update pipelines for the **Autonomous AI Research, Self-Evolution & Continuous Improvement Platform (EARSECI) (Version 30.0)**.

### 1. Governed System Evolution
EARSECI analyzes performance bottlenecks and optimization plans, running isolated A/B simulations inside sandboxed test containers.

### 2. Platform Core Actions
1. **Aesthetic Latency Auditing**: Evaluates frame-render latencies to optimize rendering pipelines.
2. **Safe Code Intelligence**: Tests proposed refactoring updates against backward-compatibility checklists.
3. **Change Governance Gates**: Generates transparent change plans detailing risk ratings, benefits, and emergency rollback hooks.`
    },
    {
      title: "★ Autonomous Business & Creative Operations Engine (Vol 1, Ch 1, Pt 4.3.6B.2.1)",
      content: `This specification defines the customer indexing, invoice compiling, and delivery pipelines of the **Autonomous Business & Creative Operations Engine (EABCOE) (Version 28.0)**.

### 1. Enterprise Operations Coordinator
EABCOE manages client profiles, structures creative timelines, monitors project milestones, and builds automated business papers.

### 2. Business Workflows
1. **Requirements Auditing**: Evaluates incoming briefs and content documents to report missing contact entries or specifications.
2. **Approval Gateway**: Manages versioning workflows and compiles interactive client feedback comments directly on the layer tree.
3. **Financial Dashboard**: Records cost metrics, outstanding invoices, and asset licenses to track revenue.`
    },
    {
      title: "★ Autonomous Software, Web & Game Production Studio (Vol 1, Ch 1, Pt 4.3.6B.2.2)",
      content: `This specification defines the database schemas, automated testing, and self-repair loops of the **Autonomous Software, Application, Website & Game Production Studio (EASWGPS) (Version 29.0)**.

### 1. The Software Factory Core
EASWGPS handles development lifecycles—translating layout mockups into responsive components, constructing databases, and compiling deployable containers.

### 2. High-Performance Modules
1. **AI Coding Engine**: Builds typed files and generates integration tests based on system API specifications.
2. **Self-Repair Loop**: Monitors linter logs and linter results, applying targeted patches to fix compile warnings.
3. **Mobile & Game Studio**: Coordinates scene graphs, Rapier/Matter physics parameters, and collision coordinates.`
    },
    {
      title: "★ Creative Intelligence & Design Reasoning Platform (Vol 1, Ch 2, Pt 2.4)",
      content: `This specification defines the visual perception, aesthetic calculation, layout reasoning, multi-language calligraphic support, and cognitive decision models of the **Enterprise Creative Intelligence & Design Reasoning Platform (Version 38.0)**.

### 1. Platform Core Architecture & Logical Subsystems
1. **Design Reasoning Engine**: Evaluates layout balance, alignment, and spacing density across active artboards.
2. **Visual Understanding Layer**: Profiles structure blocks, predicting intended design outputs (e.g., Flyers, Posters, Banners, Packaging).

### 2. Culture-Aware Multilingual Typographic Reasoning
- **Bangla Calligraphy System**: Adjusts line-height offsets by 1.3x to support complex Bangla conjunct consonants and prevent kar/phola clipping.
- **Arabic Calligraphy Rules**: Implements Right-to-Left (RTL) baseline guides for spiritual and decorative scripts (Naskh, Thuluth, Diwani, Kufic).`
    },
    {
      title: "★ Enterprise AI Designer Core (Vol 1, Ch 2, Pt 2.4.1)",
      content: `This specification defines the architectural design, workflow planning pipelines, multi-modal integration, and provider routers for the **Enterprise AI Designer Core (EAIDC) (Version 39.0)**.

### 1. Core Architectural Paradigm & Strategic Role
The AI Designer Core serves as the creative director, handling requirement parsing, style strategy plans, and grid layouts while keeping everything editable.

### 2. Platform Core Subsystems
1. **Design Thinking Engine**: Synthesizes specifications into structured visual briefs, grid specifications, and deliverables.
2. **Provider Router & Abstraction Layer**: Employs capability-based routing to dispatch workloads between local models (Ollama, Neora Native) and cloud environments.`
    },
    {
      title: "★ Enterprise Multi-Agent Creative Intelligence Engine (Vol 1, Ch 2, Pt 2.4.1A)",
      content: `This specification details the runtime agent topologies, communication protocols, and self-review systems of the **Enterprise Multi-Agent Creative Intelligence Engine (Version 40.0)**.

### 1. Unified Creative Agency Workspace
Operates as a collaborative multi-agent workforce (Planner, Typography, Layout, Color, Illustration, Brand, Quality Reviewer) cooperating on canvas tasks.

### 2. Prompt-To-Design Compiler System
Translates plain natural language into complete vector compositions through intent decoding, creative layout blueprinting, and execution graph scheduling.`
    },
    {
      title: "★ Enterprise Vision & Design Understanding Engine (Vol 1, Ch 2, Pt 2.4.2)",
      content: `This specification defines the architectural layouts, normalization pipelines, object segmentations, multi-language OCR, and visual evaluation logic for the **Enterprise Vision & Design Understanding Engine (Version 41.0)**.

### 1. Multi-Language OCR System
Reads printed and handwritten complex scripts (Bangla, Arabic, Urdu, Hindi, English) with advanced vowel-anchor boundary detections.

### 2. Foreground Segmentation & Smart Masking
Infers grid margins and alignment columns while generating automated high-accuracy clipping paths to isolate objects from background tones.`
    },
    {
      title: "★ Enterprise Vision Intelligence Enhancement Platform (Vol 1, Ch 2, Pt 2.4.2A)",
      content: `This specification defines the visual knowledge graph structures, editable reconstructions, semantic search indexes, and confidence scoring models for the **Enterprise Vision Intelligence Enhancement Platform (Version 42.0)**.

### 1. Visual Knowledge Graph System
Maps graphic components to style tokens, enabling semantic searches across moods, styles, and regional artistic guidelines.

### 2. Editable Design Reconstruction & Confidence Scores
Compiles flat screenshots into layered vector files (matching typography weights and layout grids) and generates confidence reports across OCR and branding metrics.`
    },
    {
      title: "★ Enterprise Vision Intelligence Platform (Vol 1, Ch 2, Pt 2.4.2B)",
      content: `This specification defines the cross-document audits, design evolution tracking, visual benchmarking databases, and gateway services for the **Enterprise Vision Intelligence Platform (Version 43.0)**.

### 1. Cross-Document Visual Intelligence
Scans campaigns and multi-file collections to verify consistency across logos, borders, typography, and seasonal swatches.

### 2. Design Evolution & Benchmarking
Maintains historical layout diffs, and computes overall design scores (Branding, Print Safety, Accessibility) against corporate and global printing standards.`
    },
    {
      title: "★ Enterprise Publishing & AI Typography Intelligence Platform (Vol 1, Ch 2, Pt 2.4.3A)",
      content: `This specification defines the architectural layouts, font-pairing algorithms, handwriting-to-vector glyph conversions, and OpenType features for the **Enterprise Publishing & AI Typography Intelligence Platform (Version 45.0)**.

### 1. AI Font Generation Engine & Handwriting Pipeline
Transforms handwritten notes, signature sketches, and historical calligraphic sheets into clean, optimized variable font families.

### 2. Multilingual OpenType & Pairing Models
Resolves contextual ligatures, stylistic sets, and swashes, while recommending expert pairings for editorial, tech, or packaging layouts.`
    },
    {
      title: "★ Enterprise Publishing Workflow & Document Intelligence Platform (Vol 1, Ch 2, Pt 2.4.3B)",
      content: `This specification defines the document structure analyzers, preflight validation gates, PDF compliance standards, and collaborative review systems for the **Enterprise Publishing Workflow & Document Intelligence Platform (Version 46.0)**.

### 1. Document Structure Engine & Auto-Layout
Detects page hierarchies, headers, chapters, footnotes, and TOC systems while automatically adjusting column flow to eliminate widows and orphans.

### 2. Preflight Validation Gates & PDF Compliance
Audits image resolutions (DPI), CMYK gamut boundaries, and bleed limits (15px trim boundaries), producing verified press-ready PDF/X files.`
    },
    {
      title: "★ Enterprise Brand Identity & Creative Strategy Platform (Vol 1, Ch 2, Pt 2.4.4)",
      content: `This specification defines the architectural design, brand DNA engines, brand style token systems, target audience mapping, and API schemas for the **Enterprise Brand Identity & Creative Strategy Platform (Version 47.0)**.

### 1. Brand DNA Engine & Style Systems
Formulates corporate missions, values, and archetypes into precise styling guidelines, safeguarding logos with rigid padding constraints.

### 2. Design Token Store & Auditing
Maps color swatches and corner radius variables as JSON tokens to distribute and validate compliance across all active canvases.`
    },
    {
      title: "★ Enterprise Brand Governance & AI Brand Operations Platform (Vol 1, Ch 2, Pt 2.4.4A)",
      content: `This specification defines the autonomous brand monitoring, brand health score tracking, auto-correction pipelines, and API gateways for the **Enterprise Brand Governance & AI Brand Operations Platform (Version 48.0)**.

### 1. AI Brand Guardian & Auto-Correction
Scans artwork to capture style drifts, programmatically repairing incorrect font pairings, spacing offsets, or low-contrast colors.

### 2. Design System Synchronization & Health metrics
Coordinates design token changes across projects, reporting live Brand Health scores and organizing multi-channel marketing campaigns.`
    },
    {
      title: "1. Extension Architecture Overview",
      content: `Neora Designer OS is designed with strict modular separation of concerns. Every component operates under single-purpose logic to prevent large-file render penalties:
- **stores.ts**: Manages transactional data states, active workspaces, assets caches, and database schemas.
- **components.tsx**: Contains reusable, visually polished UI primitives (Backdrops, dialog modals, rulers, custom swatches, and tree listings).
- **shortcuts.ts**: Centralizes all keyboard trigger handlers to intercept workspace-focused modifiers.
- **documentation.ts**: Contains this interactive visual systems manual, ensuring developers can analyze layout bindings in real-time.`
    },
    {
      title: "2. Registering a Custom Exporter Plugin",
      content: `To build an output adapter (e.g. exporting to a proprietary mock format or SVG renderers), you hook into Neora's Plugin API:

\`\`\`typescript
import { registerExporterAdapter } from "./plugins";

registerExporterAdapter({
  format: "figma-schema",
  mimeType: "application/x-figma",
  transform: (layers) => {
    return layers.map(l => ({
      name: l.name,
      geometry: { x: l.x, y: l.y, w: l.width, h: l.height },
      fills: [{ type: "SOLID", color: l.color }]
    }));
  }
});
\`\`\`

All active exporters will automatically populate in the 'EXPORT OUTLET' dropdown list in the top toolbar.`
    },
    {
      title: "3. Adding Custom Keyboard Bindings",
      content: `Keyboard bindings are registered in a centralized hook to avoid multiple parallel window listeners:

\`\`\`typescript
import { useKeyboardShortcuts } from "./shortcuts";

useKeyboardShortcuts({
  onSave: () => saveProjectToDB(),
  onUndo: () => triggerUndoAction(),
  onRedo: () => triggerRedoAction(),
  onDelete: () => removeActiveLayer()
});
\`\`\`

The hook is smart-gated: if a user is actively editing labels or text areas, it suspends actions like 'Delete' or 'Undo' automatically.`
    },
    {
      title: "4. Database Integration & Cloud Sync",
      content: `Neora implements a hybrid database model:
1. **Local State Cache**: Immediate visual feedback for layers and coordinates.
2. **Cloud SQL Persistence Relay**: When 'SYNC LAYERS TO DB' is clicked, the editor posts a complete transaction state to \`/api/designer-os/project/save\` which mirrors data to table partitions for durable sessions.`
    },
    {
      title: "5. NCOAMPP Multi-Agent Topology & SDK",
      content: `The Neora Creative Orchestration, Automation & Multi-Agent Production Platform (NCOAMPP) manages 23 specialized domain agents.
To register a specialist agent in the multi-agent runtime SDK, instantiate them using the NcoamppAgent layout:

\`\`\`typescript
import { NCOAMPP } from "./lib/ai/cognitive/NCOAMPP";

const orchestrator = NCOAMPP.getInstance();
orchestrator.registerSpecialist({
  role: "CustomCalligraphy",
  name: "Al-Khattat",
  description: "Renders highly localized traditional calligraphic styles.",
  capabilities: ["Naskh calligraphy", "Thuluth geometric grids"],
  confidenceRating: 98
});
\`\`\`

Agents communicate on an asynchronous, event-driven architecture using normalized JSON payloads.`
    },
    {
      title: "6. NCOAMPP REST APIs & Event Bus Specs",
      content: `Manage workflows and retrieve metrics using the following high-performance endpoint specifications:

### 1. Create Workflow DAG
- **Endpoint**: \`POST /api/ncoampp/workflow/create\`
- **Payload**:
  \`\`\`json
  {
    "prompt": "Premium Eid packaging box",
    "type": "approval"
  }
  \`\`\`
- **Response**: Returns the planned DAG nodes, task dependencies, and scheduled roles.

### 2. Event-Stream Live Updates
- **Endpoint**: \`GET /api/ncoampp/workflow/events/stream\` (Server-Sent Events)
- **Dispatched Events**:
  - \`WorkflowStarted\`: Emitted when the runner takes control.
  - \`AgentAssigned\`: Triggered when an agent state switches to busy.
  - \`TaskCompleted\`: Emitted upon validation check passes.
  - \`ApprovalRequested\`: Suspends pipeline execution for Operator review.`
    },
    {
      title: "7. Automation Engine & Failure Recovery Heuristics",
      content: `The automation engine supports bulk operations across workspace elements (e.g., resizing, localizing, and watermarking).
If an agent fails validation checks (e.g., layout overlap, low contrast, bleed violations):
1. **First Attempt**: Self-recovery heuristic is executed, altering bounds or margins by 5% increments.
2. **Fallback Strategy**: Work shifts to a generic design specialist (e.g., General Layout Agent).
3. **Graceful Degradation**: The operator is flagged on the NCOAMPP dashboard via a 'Review Gate' request.`
    },
    {
      title: "8. NACDI Strategic Brain Core & APIs",
      content: `The Neora Autonomous Creative Director Intelligence (NACDI) coordinates target audience analysis, brand voices, strategic briefs, and design decisions.

### 1. Formulate Strategic Goal
- **Endpoint**: \`POST /api/nacdi/strategy/formulate\`
- **Payload**:
  \`\`\`json
  {
    "prompt": "Premium traditional Pohela Boishakh invitation",
    "theme": "Traditional"
  }
  \`\`\`
- **Response**: Yields comprehensive visual direction specifications, targeted audience personas, risk assessment metrics, and directed multi-agent objectives.`
    },
    {
      title: "9. NDSRP Design Studio Runtime Platform & APIs",
      content: `The Neora Design Studio Runtime Platform (NDSRP) manages local/cloud/hybrid routing, active WebGL rendering pipelines, WCAG 2.2 contrast evaluation audits, and secure workspace synchronization.

### 1. Adjust Operational Topology & Accelerators
- **Endpoint**: \`POST /api/ndsrp/runtime/configure\`
- **Payload**:
  \`\`\`json
  {
    "executionMode": "hybrid",
    "hardwareProfile": "gpu_webgpu"
  }
  \`\`\`
- **Response**: Reallocates vector threadpools and returns optimized draw frames (FPS latency parameters).

### 2. Dispatch Bulk Automation Task
- **Endpoint**: \`POST /api/ndsrp/automation/dispatch\`
- **Payload**:
  \`\`\`json
  {
    "jobType": "bulk_resize",
    "targetLayers": ["layer-banner-x1", "layer-banner-x2"],
    "dimensions": { "width": 1080, "height": 1080 }
  }
  \`\`\`
- **Response**: Registers execution job on queue list and spawns real-time progress callbacks.`
    },
    {
      title: "10. Neora Universal AI Runtime (NUAR) & APIs",
      content: `The Neora Universal AI Runtime & Hybrid Model Orchestrator (NUAR) abstracts inference capabilities and maps model-agnostic request channels across local edge devices and cloud clusters.

### 1. Execute Multi-Model Inference with Cascade Recovery
- **Endpoint**: \`POST /api/nuar/inference/execute\`
- **Payload**:
  \`\`\`json
  {
    "capability": "reasoning",
    "prompt": "Evaluate safety padding margins",
    "offlineFallback": true
  }
  \`\`\`
- **Response**: Returns inference outcome text, actual routed model id, roundtrip metered latency, and cryptographic compliance token.

### 2. Dynamically Register Model Adaptor
- **Endpoint**: \`POST /api/nuar/registry/register\`
- **Payload**:
  \`\`\`json
  {
    "id": "ollama-mistral-v3",
    "provider": "ollama",
    "capabilities": ["text_generation", "translation"],
    "latencyMs": 140,
    "offlineCapable": true
  }
  \`\`\`
- **Response**: Binds adapter metadata dynamically into active smart routing matrix rules.`
    },
    {
      title: "11. Neora Local AI Runtime (NLAR) & Hardware-Adaptive APIs",
      content: `The Neora Local AI Runtime (NLAR) provides a provider-independent, local-first execution layer. It abstracts LLMs, Vision, Image generation, and Speech models running on-device while providing dynamic hardware acceleration interfaces.

### 1. Load Local Model into Active Memory Sandbox
- **Endpoint**: \`POST /api/nlar/models/load\`
- **Payload**:
  \`\`\`json
  {
    "modelId": "neora-native-llm-local",
    "allocatedVramGb": 4.5
  }
  \`\`\`
- **Response**: Warms up model weights, reserves memory buffers, and returns loaded state verification.

### 2. Run Local Secure Inference Pipeline
- **Endpoint**: \`POST /api/nlar/inference/run\`
- **Payload**:
  \`\`\`json
  {
    "modelId": "neora-native-llm-local",
    "prompt": "Evaluate design contrast levels",
    "sandboxIsolation": "isolated"
  }
  \`\`\`
- **Response**: Returns offline generated tokens, latency stats, and calculated energy expenditure.`
    },
    {
      title: "12. Neora Graphics Engine (NGE) & High Performance APIs",
      content: `The Neora Graphics Engine (NGE) is a high-performance vector rendering and non-destructive image compositing engine. It supports multi-artboard infinite canvases, real-time pixel previews, and advanced GPU accelerated layers.

### 1. Render Scene Graph Layer Stack
- **Endpoint**: \`POST /api/nge/render/scene\`
- **Payload**:
  \`\`\`json
  {
    "artboardId": "artboard-1",
    "zoom": 1.5,
    "colorSpace": "Display_P3",
    "layers": [
      { "id": "layer-1", "type": "vector", "opacity": 0.9, "blendMode": "overlay" }
    ]
  }
  \`\`\`
- **Response**: Compiles shaders, performs culling, and returns rasterized buffer payload.

### 2. Update Element Layer Transformation
- **Endpoint**: \`POST /api/nge/layers/transform\`
- **Payload**:
  \`\`\`json
  {
    "layerId": "alpona-vector-1",
    "position": { "x": 180, "y": 120 },
    "rotation": 15,
    "nonDestructiveFX": { "blur": 1.5, "contrast": 110 }
  }
  \`\`\`
- **Response**: Re-evaluates target matrices and publishes the updated frame coordinates to WebSocket listeners.`
    },
    {
      title: "13. Neora Vision Intelligence Platform (NVIP) Multimodal APIs",
      content: `The Neora Vision Intelligence Platform (NVIP) acts as the central multimodal computer vision and composition reasoning system. It executes deep layout analysis, multilingual OCR, style DNA mapping, accessibility audits, and non-destructive reference transformations.

### 1. Ingest Design Asset & Run Audit
- **Endpoint**: \`POST /api/nvip/percept/audit\`
- **Payload**:
  \`\`\`json
  {
    "fileName": "boishakhi_alpona.png",
    "bufferSize": 250880,
    "isReference": true
  }
  \`\`\`
- **Response**: Triggers targeted micro-analyzers concurrently, matches Style DNA, evaluates contrast scores, and outputs a complete Unified Visual Report.

### 2. Non-Destructive Style Transform
- **Endpoint**: \`POST /api/nvip/style/transform\`
- **Payload**:
  \`\`\`json
  {
    "reportId": "rep_9a2b8c",
    "instruction": "Compile original corporate layout inspired by extracted amber theme",
    "preserveRatio": true
  }
  \`\`\`
- **Response**: Performs multi-vector geometric re-mapping, suggesting non-infringing layout variations based on style and layout guidelines.`
    }
  ]
};
export const STORYBOOK_SPECS = [
  {
    component: "CollapsiblePanel",
    usage: "<CollapsiblePanel title='TYPOGRAPHY' isOpen={open} onToggle={toggle} badge='Inter'>...</CollapsiblePanel>",
    status: "Production Ready"
  },
  {
    component: "LayerTree",
    usage: "<LayerTree layers={layers} selectedId={id} onSelect={select} />",
    status: "Production Ready"
  },
  {
    component: "HorizontalRuler",
    usage: "<HorizontalRuler zoom={100} />",
    status: "Mock Scale Ready"
  },
  {
    component: "ColorPalettePicker",
    usage: "<ColorPalettePicker value={color} onChange={setColor} />",
    status: "Production Ready"
  }
];
