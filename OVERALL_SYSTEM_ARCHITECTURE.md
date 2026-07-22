# NEORA DESIGN OS V2 - VOLUME 1, CHAPTER 1, PART 4.1: OVERALL SYSTEM ARCHITECTURE
## Enterprise Master Specification (Version 4.0)

This master specification defines the comprehensive system architecture, layered layout, component-to-component messaging models, state managers, and extensibility strategy for **Neora Design OS**. 

---

## 1. Overall Product Architecture & Unification

Neora Design OS is not a collection of fragmented single-purpose tools. It is a single, coherent, unified creative operating system. Every subsystem communicates over a centralized event-driven state and service bus.

```
+---------------------------------------------------------------------------------+
|                                 NEORA CHAT                                      |
|                       (Natural Language/Voice Interface)                        |
+---------------------------------------------------------------------------------+
                                      | (Intent, Creative Commands)
                                      v
+---------------------------------------------------------------------------------+
|                              AI DESIGN STUDIO                                   |
|                (Strategic Planning, Brand & Style Reasoning)                     |
+---------------------------------------------------------------------------------+
                                      | (Layer Blueprint)
                                      v
+---------------------------------------------------------------------------------+
|                            WORKSPACE PRECISION EDITOR                           |
|                  (Multi-Artboard Layer Canvas, History, Vector)                  |
+---------------------------------------------------------------------------------+
  | (Events)                 | (Rules & Safety)              | (Models)
  v                          v                               v
+-------------------+      +-------------------------+      +---------------------+
|   CREATIVE MEMORY |      |    KNOWLEDGE ENGINE     |      |    MODEL ROUTER     |
| (Styles, Brand)   |      | (Print/Contrast Audits) |      | (Local / Cloud AI)  |
+-------------------+      +-------------------------+      +---------------------+
```

---

## 2. High-Level Layered Architecture

The system operates under a strict multi-layer architectural layout to guarantee high-performance rendering, decoupled logic, and provider independence.

| Layer | Responsibility | Components Included |
| :--- | :--- | :--- |
| **1. Presentation Layer** | User Interaction & Visual Terminals | Conversational Sidebar, Multi-Artboard Canvas, Tree Layer panel, Cognitive System Logs, Design Gallery |
| **2. Application Layer** | Orchestration & Command Dispatch | Navigation routing, Voice recording processors, Local caching controllers, Workspace managers |
| **3. AI Orchestration Layer** | Multi-Agent Coordination | Intent Dispatcher, Vision Analyst, Creative Layout Planner, Color Harmony Selector |
| **4. Creative Reasoning Layer**| Stylistic & Brand Synthesis | Grid generation, margin-bleed calculations, safe-zone guidelines, visual saliency estimators |
| **5. Workspace Layer** | Immutable Layer Vector Data State | Canvas `layers` stores, Undo/Redo historical queues, Artboard transforms, Active selection models |
| **6. Rendering Layer** | High-performance visuals | Canvas vector renderer, responsive layouts, text bounding-box measurement, CSS filters |
| **7. Service Layer** | Core operations and side effects | File uploaders, transcription services, local DB synchronization, server proxy handlers |
| **8. Knowledge Layer** | Aesthetic and Technical rulesets | Print layout parameters, WCAG contrast dictionaries, typography pairing dictionaries |
| **9. Memory Layer** | Workspace state replication | LocalStorage mirrors, brand asset library, user-registered template galleries |
| **10. Plugin Layer** | External Capabilities | Custom exporter plugins, custom AI tool integrations, external asset providers |
| **11. Infrastructure Layer** | Platform-level services | Model Routing APIs, database client, secure proxy routes, local developer server |

---

## 3. Core Modules & System Responsibilities

### 1. Neora Chat (Conversational Terminal)
*   **Role:** Primary interface.
*   **Responsibilities:** Receives natural language prompts and voice inputs. Parses semantic intent. Directs the workspace using targeted mutations without complete layout regenerations.

### 2. AI Design Studio (Cognitive Center)
*   **Role:** Intelligence director.
*   **Responsibilities:** Inspects uploaded image references, compiles styling specifications, constructs composition blueprints, and generates layout variations.

### 3. Workspace Editor (Interactive Artboard)
*   **Role:** High-precision editor.
*   **Responsibilities:** Handles pixel-perfect coordinate modification, layer rearrangement, vector point adjustments, text-weight configurations, lock-states, and custom effects (drop-shadows, borders).

### 4. Project Manager (Assets & File System)
*   **Role:** Asset broker.
*   **Responsibilities:** Tracks active files, manages revision branches, synchronizes with durable databases, and indexes reference assets.

### 5. Creative Memory (Style Presets & History)
*   **Role:** Reusable asset library.
*   **Responsibilities:** Stores color swatches, active typographic pairs, user-defined styles, and brand kits. Keeps historical undo/redo states.

### 6. Knowledge Engine (Design Guidelines)
*   **Role:** System rules check.
*   **Responsibilities:** Audits layout compositions against strict design parameters (contrast ratios, bounding overlaps, margin boundaries, and printable bleed limits).

### 7. Automation Engine (Batch Processors)
*   **Role:** Friction reduction.
*   **Responsibilities:** Automatically coordinates routine, repetitive tasks such as multi-format resizing, localization, batch watermark application, and printing prep.

### 8. Plugin Platform (Third-Party SDK)
*   **Role:** Modularity & Extensibility.
*   **Responsibilities:** Exposes clear hook interfaces for third-party exporters, layout algorithms, custom UI sidebars, and custom vector brushes.

### 9. Model Router (AI Abstraction Bus)
*   **Role:** Unified LLM connection.
*   **Responsibilities:** Provides a vendor-agnostic interface to route requests between Cloud API endpoints, local Ollama endpoints, and internal small models with instant failover support.

### 10. Security Layer (Privacy & Verification)
*   **Role:** Security guard.
*   **Responsibilities:** Safely stores developer credentials behind server proxies, authenticates user interactions, encrypts active storage, and restricts client-side access to sensitive keys.

---

## 4. Communication & Message Flow

To prevent tight coupling between components, all core modules operate over an asynchronous, event-driven communication model:

1.  **State Transactions:** Direct canvas mutations are issued as atomic actions dispatched to centralized stores.
2.  **Broadcast Channels:** Status logs and cognitive process state modifications are pushed to a unified logging stream, allowing UI elements (like the thinking indicators) to update reactively.
3.  **Strict Boundary Separation:** Frontend modules are strictly forbidden from directly communicating with external third-party AI APIs; all operations must resolve through the backend server routes (`/api/*`).

---

## 5. Offline & Cloud Sync Strategy

*   **Offline-First Core:** The interactive precision editor, layer tree panel, historical queues, and basic canvas manipulations are 100% operational client-side without any internet requirement.
*   **Durable Cloud Extension:** Cloud resources are treated as non-blocking enhancements. When online, active design states are dynamically persisted to Firestore databases to secure user data from cache clearing.

---

## 6. Architecture Decision Records (ADR)

### ADR-01: Single-Page View Consolidation
*   **Context:** Applets run in sandboxed frame containers. Complex secondary page architectures often break route state.
*   **Decision:** The entire Operating System resides on a highly-responsive single-screen split-pane workspace. Panels and toolbars slide open in contextual drawers or tabs, maintaining active memory in-place.

### ADR-02: Non-Destructive Vector Stores
*   **Context:** Traditional image-generation software creates flat bitmaps, which prevents detailed manual modifications.
*   **Decision:** All creative outputs must be returned as high-fidelity structured vectors. Pixels are contained inside vector shapes, preserving full layered editability.
