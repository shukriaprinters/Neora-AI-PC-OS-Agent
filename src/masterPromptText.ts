import { ArchitectSection, MetricItem } from './types';

export const METRICS: MetricItem[] = [
  { label: "Monorepo Packages", value: 3, description: "Frontend, Backend API, Local Agent", iconName: "Layers" },
  { label: "Database Tables", value: 16, description: "Full relational Drizzle schemas", iconName: "Database" },
  { label: "API Route Modules", value: 23, description: "Separate file controllers", iconName: "Workflow" },
  { label: "Frontend Pages", value: 20, description: "Fully integrated client routes", iconName: "Layout" },
  { label: "Capabilities Catalog", value: 147, description: "Items across 13 distinct categories", iconName: "Compass" },
  { label: "PC Agent Actions", value: 27, description: "Operating system low-level operations", iconName: "Cpu" },
  { label: "Autonomy Levels", value: 5, description: "Suggestion loops to full control", iconName: "Sliders" },
  { label: "Active Languages", value: 2, description: "English and Bangla native integrations", iconName: "Languages" }
];

export const CAPABILITIES_CATALOG_SAMPLES = [
  { category: "Communication & Chat", items: ["SSE Streaming endpoint", "Chat session history cache", "Multipart file upload (50MB cap)", "Markdown formatting parsing", "Slash commands parser (/code, /plan)"] },
  { category: "Voice & Speech", items: ["Web Speech API wrapper", "Automated Bangla detection Regex", "Continuous mic audio buffer polling", "Language-specific vocal response synthesizer", "Wake word detection engine"] },
  { category: "Knowledge & Memory", items: ["Long-term KV memories dictionary", "Importance scale rating (1-5)", "Categories index search engine", "Natural language intent extraction", "Briefing morning summaries compiler"] },
  { category: "Tasks & Productivity", items: ["Task priority scheduling", "Temporal notification gate triggers", "Alarms repeat schedules (cron)", "Workflow variable processors", "Client billing / invoice calculator"] },
  { category: "Coding & Development", items: ["15-language prompt boilerplate codes", "Bug-squash static analyzers", "Diff comparison visual modules", "Unit test scaffolding generator", "Security leak checks scanners"] },
  { category: "System & Desktop Control", items: ["Command application execution launches", "Process polling / termination kills", "Screenshot display frame grabbing", "Simulated keystrokes type triggers", "Mouse coordinate adjustments"] }
];

export const SECTIONS: ArchitectSection[] = [
  {
    id: "identity",
    number: 1,
    title: "System Identity",
    description: "JARVIS-inspired multilingual PWA and local agent monorepo layout.",
    tags: ["Core", "Monorepo", "Architecture"],
    iconName: "Layers",
    content: `Neora AI is a JARVIS-inspired personal AI assistant operating as:
1. **A Browser-Based PWA**: Fully installable, touch-optimized, and offline-capable.
2. **A Local Desktop Environment**: Run via \`run.bat\` (Windows) or \`start.sh\` (Unix) with direct local PC control.
3. **A Multilingual Voice System**: Fully fluent in Bangla and English across the UI, TTS, and wake word layers.
4. **Autonomous State Machine**: Supporting 5 levels of autonomy, sliding from manual suggestion to full agent execution.

#### Monorepo Workspace Structure:
The system is constructed as a pnpm monorepo:
- **artifacts/neora/**: Frontend: React 19 + Vite PWA (Port 8081 Local / 5000 Replit)
- **artifacts/api-server/**: Backend: Express 5 + Drizzle ORM (Port 8080)
- **artifacts/mockup-sandbox/**: Interactive UI sandbox for component previews
- **artifacts/automation-policy.json**: Allowed applications, write roots, and shell prefixes
- **lib/db/**: Drizzle PostgreSQL schema definitions (16 tables)
- **lib/api-spec/**: OpenAPI 3.0 specification
- **lib/api-zod/**: Automated Zod schemas matching DB and API specs
- **lib/api-client-react/**: Generated TanStack Query v5 client hooks
- **lib/local-agent-python/**: Python local-PC agent (neora_agent.py file control)
- **lib/local-agent-protocol/**: TypeScript type contracts for action schemas
- **lib/update-runner/**: Pre-update dry-runner and roll-back manager`
  },
  {
    id: "boot",
    number: 2,
    title: "Boot, Initialization & Readiness",
    description: "Multi-layered startup checks, limited mode fallback, and voice feedback.",
    tags: ["Boot", "Initialization", "Fallback"],
    iconName: "Power",
    content: `#### Boot Sequence:
1. **Host Launch**: Host executes \`run.bat\` or \`start.sh\`.
2. **Environments Verification**: Loads \`.env.local\` verifying critical keys: \`GROQ_API_KEY\`, \`DATABASE_URL\`, \`SESSION_SECRET\`.
3. **Ports Allocation**: Spawns Express API on port \`8080\` (with \`50MB\` body payload size limit) and Frontend on port \`8081\`.
4. **Graceful Degradation (Limited Mode)**: If \`DATABASE_URL\` is unreachable or absent, Neora defaults to "Limited Mode". Direct chat actions function via file fallback (\`artifacts/api-server/data/fallback-db.json\`). Database actions are disabled in the UI with a clear status bar lock icon.
5. **PC Agent Registry**: The desktop agent (\`neora_agent.py\`) retries connections to \`/api/healthz\` 5 times using exponential backoff. Upon connection, it issues a \`POST /api/agents/register\` sending OS metadata, capabilities list, and platform details.
6. **Voice Announcement**: Upon verifying the database or fallback layer, the API status, and the agent register, the system announces: **"Neora is ready, boss."** using the active language choice.`
  },
  {
    id: "capabilities",
    number: 3,
    title: "Core Capabilities",
    description: "Registry routing, bilingual STT/TTS voice mappings, and local action dispatchers.",
    tags: ["AI Core", "Speech", "Multimodal"],
    iconName: "Compass",
    content: `Each core system element contains modular pipelines optimized for high response rates and safety:

#### 3A. AI Core & Model Registry
- **Preferred Registry Platform**: Groq Cloud + Ollama Local.
- **Provider Chain Selection**: DeepSeek, OpenAI, and Gemini free tier map as fallback candidates.
- **Unified Action Parsing**: Sourced via \`lib/neora.ts\` wrapping model definitions:
  - Ranked Models:
    1. **Neora Personal** (Priority 100, custom router)
    2. **Llama 3.3 70B** (Priority 90, Groq, Chat/Coding/Reasoning)
    3. **Kimi K2** (Priority 85, Groq, 262K context long analysis)
    4. **GPT-OSS 120B** (Priority 82, Groq, versatile writing)
    5. **Llama 3.1 8B** (Priority 60, translation/fast checks)
    - *Auto Vision Classifier*: **Llama 4 Scout** (for screen-capture interpretation).
- **Streaming Pipeline**: Sourced via Server-Sent Events (SSE) \`/api/chat\` with unified Markdown formatting.

#### 3B. Multimodal Interaction System
- **Speech-To-Text (STT)**: Web Speech API with automatic language parsing.
- **Language Detection Rule**: Regex search pattern \`[\\u0980-\\u09FF]\` checks for Bengali character set. If matched, locales map instantly to \`bn-BD\` for STT and Bangla neural voice settings; otherwise, system maps to \`en-US\`.
- **Screen-Content Auditing**: The Python agent takes display screenshots (\`screenshot.capture\`) and feeds them to the configured vision engine (e.g., Llama 4 Scout) to analyze on-screen code or program bugs.

#### 3C. Full Desktop Autonomy System (Local PC Agent)
A Python agent executes 27 canonical actions divided into:
- **Application Control**: \`app.launch\`, \`app.close\`
- **Browser Control**: \`browser.open\`, \`browser.search\`
- **Shell Execution**: \`shell.run\` inside a sandbox with execution boundaries
- **File System**: \`file.read\`, \`file.write\`, \`file.list\`, \`file.delete\`
- **Input Simulation**: \`screenshot.capture\`, \`keyboard.type\`, \`keyboard.hotkey\`, \`mouse.click\`, \`mouse.move\`, \`clipboard.set\`, \`clipboard.get\`
- **Process management**: \`process.list\`, \`process.kill\`
- **System Actions**: \`notification.send\`, \`system.info\`, \`system.sleep\`, \`system.shutdown\` (gated by auth), \`system.restart\` (gated by auth)`
  },
  {
    id: "autonomy",
    number: 4,
    title: "Autonomy States Machine",
    description: "5 tiers of execution authorization, safety policy checks, and path boundaries.",
    tags: ["Autonomy", "Safety", "Approval"],
    iconName: "Sliders",
    content: `Gated by a five-tier state control matrix (\`lib/autonomy.ts\`):

1. **Level 1 (Suggest Only)**: AI designs JSON suggestions. Zero automated file or shell side-effects allowed.
2. **Level 2 (Plan & Prepare)**: Automatically generates plans, but execution steps require manual Click-to-Run.
3. **Level 3 (Execute Safe)**: Read-only files, system diagnostics, and safe, bounded \`file.write\` (with automatic back up) execute automatically. Unsafe system paths or system commands trigger approval UI prompts.
4. **Level 4 (Workflow Executor)**: Runs multi-step scripts automatically. Reversible actions pass. Dangerous external system updates insert an approval block.
5. **Level 5 (Full Agent)**: Direct desktop autonomy. Requires immediate structural backups prior to running any terminal actions.

#### Policy Rule checks:
- **Write Whitelist Only**: Writing is limited to \`docs/\`, \`artifacts/\`, \`plugins/\`, and \`scripts/\` relative subfolders.
- **Allowed Command Formats**: Checks command prefixes against safety Regex lists: \`pnpm\`, \`npm\`, \`node\`, \`git\`, \`powershell -NoProfile -Command\`, \`echo\`.
- **Absolute Paths Resolution**: Rejects any incoming payload strings with \`../\`, terminating the action in error.`
  },
  {
    id: "runplan",
    number: 5,
    title: "Run Plan Execution & Self-Repair",
    description: "Structured step plans, SSE event pipes, and LLM-powered auto-patching loops.",
    tags: ["Execution", "Run Plan", "Diagnostics"],
    iconName: "Activity",
    content: `#### Execution Pipeline (\`lib/executor.ts\`):
1. **Plan Compilation**: AI converts user's goal into structured steps: \`shell\` | \`file_write\` | \`code_edit\` | \`verify\` | \`note\` | \`tool_call\`.
2. **Sequential Streaming**: Progress streams down via Server-Sent Events (SSE): \`step_start\` → \`step_progress\` → \`step_complete\` (or \`step_failed\`).
3. **Auto-Repair Loop**: If a step fails, the planner invokes a diagnostic LLM call:
   - Evaluates stdout / stderr errors
   - Re-formulates or adjusts the broken parameters
   - Retries up to 2 times
   - If success fails, locks the workflow state and triggers an alert on the user interface dashboard.
4. **Instant Stop Gate**: Sourced via backend route \`POST /api/runplan/:id/stop\`, terminating sub-processes immediately.`
  },
  {
    id: "selfupdate",
    number: 6,
    title: "Secure Self-Update Core",
    description: "Backup-then-apply framework, path whitelists, and automatic rollback on error.",
    tags: ["Self-Update", "Backup", "Rollback"],
    iconName: "RefreshCw",
    content: `Self-updates follow a secure multiapproval lifecycle:
\`proposed\` → \`dry_run_ok\` → \`approved\` → \`applying\` → \`applied\` (or \`failed\` causing an instant rollback).

#### Operations Checklist:
- **Pre-Update Backups**: Compiles a zip/tar archive containing target files to patch.
- **Dry-Run Validation**: Parses manifest structure, evaluates patch formatting, and checks destination permissions without touching active files.
- **Applying State Run**: Checks path parameters, applies changes, and runs post-verify commands like \`pnpm typecheck\`.
- **Automatic Rollback**: If type checking fails, the runner instantly restores the pre-update backup payload and reports the failure.
- **Process Protection**: Avoids invoking \`pnpm install\` inside updater cycles to prevent Windows \`EPERM\` file handle crashes.`
  },
  {
    id: "productivity",
    number: 7,
    title: "Productivity Suite",
    description: "Structured notes, tasks tracker, reminders, memories KV, and Bengali daily briefing summaries.",
    tags: ["Productivity", "Memories", "Alarms"],
    iconName: "CheckSquare",
    content: `The desktop dashboard is backed by robust data pipelines managing critical user productivity assets:

#### 1. Memories (memories table)
Long-term structured preferences Key-Value store with importance impact ratings (1 to 5). Users can dictate a preference (e.g. "I prefer using Jest over Vitest") and the natural-language intent router captures the priority key.

#### 2. Notes (notes table)
Complete markdown notepad document storage with title searching and context tagging.

#### 3. Tasks & Reminders
- Alarms support custom Cron intervals.
- Tasks track priorities: Low | Medium | High | Critical.

#### 4. Morning Briefing System (\`/api/dashboard/briefing\`)
Custom endpoint combining:
- Bengali neural date conversion (e.g., "শনিবার, ৬ জুন ২০২৬")
- Pending alarms for the next 24 hours
- Selected top task priority items
- Recent preferences memory logs
- Quick Vocal Playback trigger using the voice engine`
  },
  {
    id: "studios",
    number: 8,
    title: "Specialized Studios",
    description: "Complete templates for coding visualizers, CSS color design, and contract invoices.",
    tags: ["Studios", "Coding", "Design", "Earning"],
    iconName: "Palette",
    content: `Highly immersive desktop developer studios:

#### 1. Coding Studio (15+ Languages + 15+ Tools)
- **Supported Languages**: Python, JS, TS, Rust, Go, Java, C++, PHP, Ruby, Swift, Kotlin, C#, SQL, HTML, Shell.
- **Workflow Tools**: Code Generation, Bug Fixing, Refactoring, Tests, Explanations, Scans for Security, and Git-Diff previews.

#### 2. Design Studio (16 Interactive tools)
Features palette compilers, font sizing checkers, SVG logo builders, contrast matching auditors, and animation trigger codes.

#### 3. Earning Studio (17 Templates in 3 Categories)
- **Freelancing**: Proposal Writer, Invoice Generator, Client Email Drafter, Project Scope.
- **Content Writer**: Script compilers, blog blueprints, audio briefing guides.
- **Invoice Builder**: Core billing forms calculates tax coefficients, references ongoing milestones, and layouts print-optimized PDFs.`
  },
  {
    id: "db",
    number: 9,
    title: "Database Architecture",
    description: "The 16 structural Drizzle tables mapping historical metrics and preference configurations.",
    tags: ["Database", "SQL", "Drizzle", "Tables"],
    iconName: "Database",
    content: `PostgreSQL database schemas managed via Drizzle. Structure contains exactly 16 database tables:

1. **conversations**: Core chat session containers.
2. **messages**: Individual chats with provider-logs and multi-part files.
3. **memories**: Structured user facts and habits ratings.
4. **notes**: Complete markdown note documents.
5. **tasks**: Tickable items sorted by priority keys.
6. **reminders**: Temporal notification alarms.
7. **workflows**: Prompts sequence steps templates.
8. **activity**: Global system audited action history.
9. **settings**: User UI configuration states.
10. **agents**: Online system local-PC agents.
11. **agentActions**: Operational results history from desktop Python agent.
12. **plans**: Sequential plan arrays compiling execution steps.
13. **updates**: Full system self-update manifest logs.
14. **earningProjects**: Freelancer projects containers tracker.
15. **earningDeliverables**: Deliverable milestones tied to active projects.
16. **chatInteractions**: Dynamic cost and response time telemetry table.`
  },
  {
    id: "backend",
    number: 10,
    title: "Backend API Architecture",
    description: "Express v5 route controllers, body upload specs, and shared orchestration engines.",
    tags: ["Backend", "Express", "REST API"],
    iconName: "Workflow",
    content: `#### Root Routing Boundaries:
- Runs Express v5 listening on \`0.0.0.0:3000\`.
- Body JSON parse ceiling set strictly to \`50MB\` (to support screenshot uploads).

#### Core 23 route controllers:
\`health.ts\`, \`meta.ts\`, \`conversations.ts\`, \`messages.ts\`, \`memories.ts\`, \`notes.ts\`, \`tasks.ts\`, \`reminders.ts\`, \`workflows.ts\`, \`dashboard.ts\`, \`briefing.ts\`, \`activity.ts\`, \`settings.ts\`, \`tools.ts\`, \`coding.ts\`, \`design.ts\`, \`earning.ts\`, \`github.ts\`, \`intelligence.ts\`, \`providers.ts\`, \`intent.ts\`, \`agentMode.ts\`, \`agents.ts\`, \`runplan.ts\`, \`updates.ts\`, and \`autonomy.ts\`.

#### Shared API Utility libraries (\`lib/\`):
- **\`lib/neora.ts\`**: Decides routing configurations across Groq models.
- **\`lib/executor.ts\`**: Orchestrates running execution steps and retry triggers.
- **\`lib/autonomy.ts\`**: Gating framework checking risks classes.
- **\`lib/fallback.ts\`**: Fallback JSON database routing adapter when SQL databases are unavailable.`
  },
  {
    id: "frontend",
    number: 11,
    title: "Frontend Architecture",
    description: "20 React single-page viewer components, speech modules, and responsive layout guidelines.",
    tags: ["Frontend", "React", "PWA", "Wouter"],
    iconName: "Layout",
    content: `Constructed under React 19, Tailwind CSS v4, Framer Motion v12, Wouter client routing, and Lucide React icons.

#### 20 Integrated View Pages:
- Chat, Dashboard, History, Memory, Notes, Tasks, Reminders, Workflows, RunPlan, Tools, Coding, Design, Earning, Invoice, GitHub, Intelligence, Providers, Models, Capabilities, Devices, Updates, Settings, Help.

#### Custom Shared UI components:
- **AppLayout.tsx**: Sidebar panels toggleable via drawers with footer language triggers.
- **QuickCreate.tsx**: FAB modal triggered by \`Ctrl+Shift+N\` instantly compiling Notes/Memories.
- **CommandPalette.tsx**: Spotlight overlay triggered by \`Ctrl+K\` grouping pages bookmarks.
- **MorningBriefing.tsx**: Ambient widget showing neural Bangla voices and schedules.

#### Mobile & PWA optimization:
Generates custom client manifest schemas supporting local cache indexing.`
  },
  {
    id: "security",
    number: 12,
    title: "Security & Safety Model",
    description: "Zod input checks, token filters, command sandboxes, and key masking guidelines.",
    tags: ["Security", "Zod", "Sanitization"],
    iconName: "Shield",
    content: `Deep integration of security policies guarding local and server runtimes:

- **Token Bucket Rate-Limiter**: 60 requests/minute rules apply on chat interactions and database mutations.
- **Zod Data Schemas validation**: All incoming bodies parsed dynamically via Zod prior to database insertions.
- **Shell Sandboxing**: Shell commands check strictly against allowed prefixes. Terminal process execution forbids absolute subpaths resolution resolving to parent directory boundaries (\`../\`).
- **Keys Masking**: Environmental provider api credentials are masked securely inside system metrics reporting charts.`
  },
  {
    id: "implementation",
    number: 13,
    title: "Implementation Order & Dependencies",
    description: "The 15 step-by-step phases to orchestrate full-stack system integrations.",
    tags: ["Implementation", "Milestones", "pnpm"],
    iconName: "GitMerge",
    content: `Follow this strict developer sequence to structure, implement, and compile the full monorepo stack:

1. **Monorepo scaffolding**: Build root dependencies (\`package.json\`), configure subfolders workspace allocations, and link tsconfig.json configurations.
2. **Database schema**: Define 16 structural Drizzle tables. Write fallback mock file logic to manage safe operations when SQL databases are unavailable.
3. **Core API Server setup**: Construct Express 5 entry point, verify error middleware handlers, and configure health status validations.
4. **Provider routing library**: Write model request routers wrapping Groq/Ollama APIs, including connection fallback arrays.
5. **Conversations and SSE Streaming core**: Implement server-sent events for streaming, and bind histories and files.
6. **Productivity CRUD Engines**: Complete memories, notes, tasks, alarms, and workflows backends.
7. **Autonomy Guard state engine**: Map risk categorization checks across runtime actions. Create the Action Approval interface.
8. **PC agent integration backend & desktop python companion**: Write \`neora_agent.py\` in Python. Formulate the registry, polling endpoints, and response handling for the 27 workspace actions.
9. **Run Plan Step Executor pipeline**: Integrate action execution with active auto-repair loops. Connect real-time progress trackers.
10. **Self-Update pipeline core**: Build dry-runners checking manifest syntax alongside automatic file restoration steps.
11. **Voice Integration engine**: Configure STT/TTS modules, wake word checkers, and Bengali detection logic.
12. **Specialized Studios components**:
    - **Coding Studio**: Complete 15 languages templates, debugging visualizers, testing suites, and git-diff views.
    - **Design Studio**: Complete standard paletting components, custom asset templates, and contrast calculators.
    - **Earning Studio**: Implement 17 project files, milestones lists, and dynamic tax invoice forms.
13. **GitHub Integration API proxy**: Write rest endpoints handling commits, branches, PRs, and safe stash/pull updates.
14. **Activity loggers & Intelligence metrics system**: Write activity monitors, logging database entities, and plotting real-time graphs.
15. **Container configuration, Replit adaptations & Final Release QA**: Set up multi-stage Docker builds, bundle build tasks, apply complete TypeScript type checking, and launch unit-test coverage.`
  },
  {
    id: "testing",
    number: 14,
    title: "Testing, Integration & Quality Gates",
    description: "Pre-compile unit boundaries validation, mock connections, and performance tests.",
    tags: ["Testing", "QA", "Verification"],
    iconName: "Gauge",
    content: `To achieve industrial-grade reliability, the codebase must clear four distinct quality gates before compile-time verification:

#### 1. Unit Testing Matrix:
- **Core Orchestrator**: Test \`lib/providers.ts\` to ensure that if Groq fails or returns a 5xx status, failover switches gracefully to Ollama, and then to Gemini in under 1500ms.
- **Autonomy Lock**: Mock agent executions in \`lib/autonomy.ts\` to guarantee that level 3 blocks nested file deletion actions without user approvals.
- **Path Sanitization**: Execute fuzzing attempts against file action parameters containing traversal suffixes (e.g., \`/allowed/root/../../etc/passwd\`, \`C:\\allowed\\..\\Windows\\System32\`) ensuring all of them throw precise validation errors.

#### 2. Local-Agent Connection Mocking:
Create mock client-polling scripts mimicking the registered PC Agent. Ensure the backend correctly dispatches steps sequentially, holds executions, handles mock results payloads, and logs failures without locking thread pools.

#### 3. Database Graceful Fallback Dry-Runs:
Simulate container execution with \`DATABASE_URL\` set to an empty string. Attempt to log in, write messages, and create tasks. Verify that the UI displays the fallback status bar and local storage caching files correctly without causing route crashes.

#### 4. Automated UI Integration Tests:
Script end-to-end user navigation flow: Chat → Voice Trigger → Open Code Studio → Trigger Plan → Execute Reversible Script → Complete Earning Invoice. Ensure that page transitions perform under 150ms.`
  },
  {
    id: "layout-intelligence",
    number: 15,
    title: "Layout Intelligence & Composition",
    description: "Layout Reasoning Intelligence Engine Subsystem & Visual Canvas Ocular Analyzer.",
    tags: ["Layout", "Design", "Vision", "Grid"],
    iconName: "Compass",
    content: `Neora's visual intelligence stack includes the LayoutIntelligenceEngine, offering:
1. **Grid Matching & Snapping**: Audits adherence to modular, baseline-grid, and golden ratio rules.
2. **Whitespace Heuristics**: Computes density ratios of positive space vs negative breathing room.
3. **Typographical & Ocular Hierarchy**: Predicts reading flows (Z-pattern, F-pattern) and visual priorities.
4. **Print Safe boundaries**: Verifies content safety margins and bleed zones for physical press layouts.`
  },
  {
    id: "dod",
    number: 16,
    title: "Definition of Done (DoD)",
    description: "Pristine compile status, secure routes, typography audits, and PWA scores.",
    tags: ["DoD", "Quality", "Ship"],
    iconName: "Award",
    content: `Every repository merge or workspace delivery is fully complete only when it meets the following criteria:

- [ ] **Type Checked**: Zero compilation warnings under \`tsc --noEmit\` and strict linting.
- [ ] **Database Integrity**: Push scripts schema fully migrated to local database, and mock database backups match exact JSON fallback states.
- [ ] **Secure API Boundaries**: All API routes validate incoming bodies using Zod, sanitize all strings, and prevent shell execution escapes.
- [ ] **Zero Exposed Keys**: Zero hardcoded local keys or local development tokens in source code. All tokens are sourced from standard system environments.
- [ ] **Dynamic Responsiveness**: All 20 application pages load flawlessly on both ultra-wide screens and compact touch devices.
- [ ] **Polished Typography & Theming**: Zero plain standard browser styling. Typography matches Space Grotesk display headings paired with JetBrains Mono, styled in Cosmic Dark Slate colors.
- [ ] **PWA Audit Standards**: Google Lighthouse scores exceed 90 points across performance, accessibility, SEO, and PWA criteria.`
  }
];

export const RAW_MASTER_PROMPT = `# NEORA AI — MASTER ARCHITECT BLUEPRINT & SPECIFICATION
## SYSTEM MASTER PROMPT FOR END-TO-END DEVELOPMENT

You are the Neora Lead Systems Architect. Your mission is to implement Neora AI — an advanced, autonomous AI agent capable of full PC automation, based on the exhaustive specification laid out below. Every file, database table, API route, and system boundary must be built exactly to these production-grade guidelines.

---

### SECTION 1 — SYSTEM IDENTITY
Neora AI is a JARVIS-inspired personal AI assistant operating as:
1. **A Browser-Based PWA**: Fully installable, touch-optimized, and offline-capable.
2. **A Local Desktop Environment**: Run via \`run.bat\` (Windows) or \`start.sh\` (Unix) with direct local PC control.
3. **A Multilingual Voice System**: Fully fluent in Bangla and English across the UI, TTS, and wake word layers.
4. **Autonomous State Machine**: Supporting 5 levels of autonomy, sliding from manual suggestion to full agent execution.

#### Monorepo Workspace Structure:
The system is constructed as a pnpm monorepo:
\`\`\`text
├── artifacts/
│   ├── neora/                  # Frontend: React 19 + Vite PWA (Port 8081 Local / 5000 Replit)
│   ├── api-server/             # Backend: Express 5 + Drizzle ORM (Port 8080)
│   ├── mockup-sandbox/         # Interactive UI sandbox for component previews
│   └── automation-policy.json  # Allowed applications, write roots, and shell prefixes
├── lib/
│   ├── db/                     # Drizzle PostgreSQL schema definitions (16 tables)
│   ├── api-spec/               # OpenAPI 3.0 specification
│   ├── api-zod/                # Automated Zod schemas matching DB and API specs
│   ├── api-client-react/       # Generated TanStack Query v5 client hooks
│   ├── local-agent-python/     # Python local-PC agent (neora_agent.py file control)
│   ├── local-agent-protocol/   # TypeScript type contracts for action schemas
│   └── update-runner/          # Pre-update dry-runner and roll-back manager
\`\`\`

---

### SECTION 2 — BOOT, INITIALIZATION, AND READINESS
#### Boot Sequence:
1. **Host Launch**: Host executes \`run.bat\` or \`start.sh\`.
2. **Environments Verification**: Loads \`.env.local\` verifying critical keys: \`GROQ_API_KEY\`, \`DATABASE_URL\`, \`SESSION_SECRET\`.
3. **Ports Allocation**: Spawns Express API on port \`8080\` (with \`50MB\` body payload size limit) and Frontend on port \`8081\`.
4. **Graceful Degradation (Limited Mode)**: If \`DATABASE_URL\` is unreachable or absent, Neora defaults to "Limited Mode". Direct chat actions function via file fallback (\`artifacts/api-server/data/fallback-db.json\`). Database actions are disabled in the UI with a clear status bar lock icon.
5. **PC Agent Registry**: The desktop agent (\`neora_agent.py\`) retries connections to \`/api/healthz\` 5 times using exponential backoff. Upon connection, it issues a \`POST /api/agents/register\` sending OS metadata, capabilities list, and platform details.
6. **Voice Announcement**: Upon verifying the database or fallback layer, the API status, and the agent register, the system announces: **"Neora is ready, boss."** using the active language choice.

---

### SECTION 3 — CORE CAPABILITIES TO ARCHITECT
#### 3A. AI Core & Model Registry
- **Preferred Registry Platform**: Groq Cloud + Ollama Local.
- **Provider Chain Selection**: DeepSeek, OpenAI, and Gemini free tier map as fallback candidates.
- **Unified Action Parsing**: Sourced via \`lib/neora.ts\` wrapping model definitions:
  - Ranked Models:
    1. **Neora Personal** (Priority 100, custom router)
    2. **Llama 3.3 70B** (Priority 90, Groq)
    3. **Kimi K2** (Priority 85, Groq)
    4. **GPT-OSS 120B** (Priority 82, Groq)
    5. **Llama 3.1 8B** (Priority 60, translation/fast checks)
    - *Auto Vision Classifier*: **Llama 4 Scout** (for screen-capture interpretation).
- **Streaming Pipeline**: Sourced via Server-Sent Events (SSE) \`/api/chat\` with unified Markdown formatting.

#### 3B. Multimodal Interaction System
- **Speech-To-Text (STT)**: Web Speech API with automatic language parsing.
- **Language Detection Rule**: Regex search pattern \`[\\u0980-\\u09FF]\` checks for Bengali character set. If matched, locales map instantly to \`bn-BD\` for STT and Bangla neural voice settings; otherwise, system maps to \`en-US\`.
- **Screen-Content Auditing**: The Python agent takes display screenshots (\`screenshot.capture\`) and feeds them to the configured vision engine (e.g., Llama 4 Scout) to analyze on-screen code or program bugs.

#### 3C. Full Desktop Autonomy System (Local PC Agent)
A Python agent executes 27 canonical actions divided into:
- **Application Control**: \`app.launch\`, \`app.close\`
- **Browser Control**: \`browser.open\`, \`browser.search\`
- **Shell Execution**: \`shell.run\` inside a sandbox with execution boundaries
- **File System**: \`file.read\`, \`file.write\`, \`file.list\`, \`file.delete\`
- **Input Simulation**: \`screenshot.capture\`, \`keyboard.type\`, \`keyboard.hotkey\`, \`mouse.click\`, \`mouse.move\`, \`clipboard.set\`, \`clipboard.get\`
- **Process management**: \`process.list\`, \`process.kill\`
- **System Actions**: \`notification.send\`, \`system.info\`, \`system.sleep\`, \`system.shutdown\` (gated by auth), \`system.restart\` (gated by auth)

#### 3D. Autonomy Framework
Gated by a five-tier state control matrix (\`lib/autonomy.ts\`):
1. **Level 1 (Suggest Only)**: AI designs JSON suggestions. Zero automated file or shell side-effects allowed.
2. **Level 2 (Plan & Prepare)**: Automatically generates plans, but execution steps require manual Click-to-Run.
3. **Level 3 (Execute Safe)**: Read-only files, system diagnostics, and safe, bounded \`file.write\` (with automatic back up) execute automatically. Unsafe system paths or system commands trigger approval UI prompts.
4. **Level 4 (Workflow Executor)**: Runs multi-step scripts automatically. Reversible actions pass. Dangerous external system updates insert an approval block.
5. **Level 5 (Full Agent)**: Direct desktop autonomy. Requires immediate structural backups prior to running any terminal actions.

#### 3E. Run Plan Execution Engine
- **Engine Logic (\`lib/executor.ts\`)**: Takes parsed JSON steps: \`shell\` | \`file_write\` | \`code_edit\` | \`verify\` | \`note\` | \`tool_call\`.
- **Auto-Repair Loop**: If a step fails, the planner invokes a diagnostic LLM call to suggest an error fix, patching the plan and retrying up to 2 times before locking and prompting the user.

#### 3F. Self-Update System
Updates follow a secure multi-phase lifecycle: \`proposed\` → \`dry_run_ok\` → \`approved\` → \`applying\` → \`applied\` (or \`failed\` causing an instant rollback).
- Whitelists only write to \`artifacts/\`, \`lib/\`, and \`docs/\`.
- Paths utilizing \`../\` are thrown out during path sanitization.

#### 3G. Productivity Suite
Full REST CRUD endpoints and interactive UI screens for:
- **Memories**: Long-term key-value pairings with impact rankings (1 to 5).
- **Notes**: Formatted content files with title searching.
- **Tasks**: Productivity task tracker with prioritized lists and status tracking.
- **Reminders**: Date-time alarms with repeat options (daily, weekly, monthly, custom cron).
- **Workflows**: Multi-step templates utilizing prompt variables.
- **Morning Briefing (\`/api/dashboard/briefing\`):** Dynamically aggregates Bengali date format (e.g., "শনিবার, ৬ জুন ২০২৬"), pending alarms, highest-priority task lists, recent memories, and a text-to-speech briefing read button.

#### 3H. Specialized Studios
- **Coding Studio**: Interactive code generator supporting 15 languages, featuring bug squashing, architectural blueprints, secure tests development, and dynamic diff comparison modules.
- **Design Studio**: CSS token generator, custom asset brand brief creation, contract templates, contrast checkers, and dynamic canvas-dimension audits.
- **Earning Studio**: Freelancer template portfolio containing 17 templates including proposal drafts, work schedules, pitch emails, and and a dynamic client invoice builder calculating sales taxes.

#### 3I. GitHub Integration
Backend proxy endpoints in \`/api/github\` for: \`status\`, \`commit\`, \`push\`, \`pull\`, \`branch\`, \`stash\`, \`create-pr\`, and \`version-check\`. All actions verify a valid \`GITHUB_TOKEN\` environment key and refuse hazardous force actions.

#### 3J. Chat & Conversation System
Maintains conversation history and message metadata.
- **Slash Commands**: \`/summarize\`, \`/translate\`, \`/code\`, \`/fix\`, \`/explain\`, \`/doc\`, \`/audit\`, \`/optimize\`, \`/test\`, \`/shell\`, \`/plan\`, \`/remind\`, \`/task\`, \`/note\`, \`/memory\`.
- Supports image payload attachments (50MB size ceiling).

---

### SECTION 4 — DATABASE ARCHITECTURE
The database is PostgreSQL managed via Drizzle.
The canonical schema contains exactly 16 tables:
1. **conversations**: Chat sessions
2. **messages**: Individual messages
3. **memories**: Long-term memory store
4. **notes**: User notes
5. **tasks**: Task management
6. **reminders**: Reminders
7. **workflows**: Prompt workflows
8. **activity**: Activity log
9. **settings**: User preferences
10. **agents**: Registered PC agents
11. **agentActions**: Agent action history
12. **plans**: Run plans
13. **updates**: Self-update logs
14. **earningProjects**: Freelance projects
15. **earningDeliverables**: Project deliverables
16. **chatInteractions**: AI analytics

---

### SECTION 5 — BACKEND API ARCHITECTURE
- **Root Routing**: Express v5 app listening on \`0.0.0.0:3000\` (production) or \`3000\`.
- **23 backend controllers** must be written:
  \`health.ts\`, \`meta.ts\`, \`conversations.ts\`, \`messages.ts\`, \`memories.ts\`, \`notes.ts\`, \`tasks.ts\`, \`reminders.ts\`, \`workflows.ts\`, \`dashboard.ts\`, \`briefing.ts\`, \`activity.ts\`, \`settings.ts\`, \`tools.ts\`, \`coding.ts\`, \`design.ts\`, \`earning.ts\`, \`github.ts\`, \`intelligence.ts\`, \`providers.ts\`, \`intent.ts\`, \`agentMode.ts\`, \`agents.ts\`, \`runplan.ts\`, \`updates.ts\`, and \`autonomy.ts\`.
- **Shared Libraries**: Core orchestration models (Model Router, Step Execution Engine, State Approvals Guard, Metrics Logger, Fallback File DB Adapter).

---

### SECTION 6 — FRONTEND ARCHITECTURE
React 19, Tailwind CSS v4, Framer Motion v12, Wouter routing, and Lucide React icons.
- **20 UI Pages**: Chat, Dashboard, History, Memory, Notes, Tasks, Reminders, Workflows, RunPlan, Tools, Coding, Design, Earning, Invoice, GitHub, Intelligence, Providers, Models, Capabilities, Devices, Updates, Settings, Help.
- **PWA Specifications**: Responsive design, custom manifest, and service worker caching files on client device.

---

### SECTION 7 — LAUNCHER AND RUNTIME ARCHITECTURE
- **\`run.bat\` / \`start.sh\`**: Launch files executing environmental checks. Never invokes \`pnpm install\` in regular loops to avoid file lock blocking. Prevents binding clashes by scanning and ending dead node/python instances on binding ports (\`8080\`, \`8081\`).
- **\`setup.bat\` / \`setup.sh\`**: Installs pnpm packages, performs DB migrations, and prompts user parameters for \`.env.local\`.

---

### SECTION 8 — VOICE, WAKE WORD, AND ALWAYS-ON LISTENING
- **Continuous Voice Input Capture**: Frontend speech systems continuously pool audio buffers via Web Speech API, searching for the wake word activation phrase "Neora". 
- **Voice Response Synthesizer**: Speech answers stream audio responses in English or Bangla with native punctuation pauses.

---

### SECTION 9 — CAPABILITY CATALOG
The system defines 147 granular modules mapped over 13 categorized operational classes (e.g., Coding & Development, Communication & Chat, Content & Writing, System & Local PC Desktop Controls). Every entry in the registry is referenced by risk level and route mapping.

---

### SECTION 10 — AUTOMATION, AGENT MODE, AND MULTI-STEP WORKFLOWS
Multi-step goal execution models rely on structural steps schema validation. If any critical environment parameters (like system shell prefixes) mismatch security bounds, execution drops instantly to safe approval holding.

---

### SECTION 11 — ACTIVITY, AUDIT, AND INTELLIGENCE
Every database update or PC agent action triggers a global log event \`activity\` capture payload. Systems collect performance indexes (token use, round-trip AI agency latency) displaying dynamic analytics charts on the Intelligence dashboard.

---

### SECTION 12 — SECURITY AND SAFETY MODEL
- **Rate-Limiting Rule**: Token bucket rules allowing 60 requests/minute.
- **Inputs Verification**: Full Zod schema validation.
- **Path Guard**: Verification steps explicitly block path-traversal formats (\`../\`). Command lists enforce regex sanitization structures.

---

### SECTION 13 — BILINGUAL AND LOCALIZATION
A primary context wrapper \`LangProvider\` handles Bangla/English interface localization translation mapping. Direct voice inputs detect regional vowel characters, applying targeted accent outputs.

---

### SECTION 14 — DOCKER, DEPLOYMENT, AND DISTRIBUTION
Container targets run in cloud architectures bound to ingress policies. Local platform installations are fully portable and container-ready.

---

### SECTION 15 — IMPLEMENTATION ORDER AND DEPENDENCIES
Follow this strict sequence to implement the full-stack system:

1. **Monorepo scaffolding**: Build root dependencies (\`package.json\`), configure subfolders workspace allocations, and link tsconfig.json configurations.
2. **Database schema**: Define 16 structural Drizzle tables. Write fallback mock file logic to manage safe operations when SQL databases are unavailable.
3. **Core API Server setup**: Construct Express 5 entry point, verify error middleware handlers, and configure health status validations.
4. **Provider routing library**: Write model request routers wrapping Groq/Ollama APIs, including connection fallback arrays.
5. **Conversations and SSE Streaming core**: Implement server-sent events for streaming, and bind histories and files.
6. **Productivity CRUD Engines**: Complete memories, notes, tasks, alarms, and workflows backends.
7. **Autonomy Guard state engine**: Map risk categorization checks across runtime actions. Create the Action Approval interface.
8. **PC agent integration backend & desktop python companion**: Write \`neora_agent.py\` in Python. Formulate the registry, polling endpoints, and response handling for the 27 workspace actions.
9. **Run Plan Step Executor pipeline**: Integrate action execution with active auto-repair loops. Connect real-time progress trackers.
10. **Self-Update pipeline core**: Build dry-runners checking manifest syntax alongside automatic file restoration steps.
11. **Voice Integration engine**: Configure STT/TTS modules, wake word checkers, and Bengali detection logic.
12. **Specialized Studios components**:
    - **Coding Studio**: Complete 15 languages templates, debugging visualizers, testing suites, and git-diff views.
    - **Design Studio**: Complete standard paletting components, custom asset templates, and contrast calculators.
    - **Earning Studio**: Implement 17 project files, milestones lists, and dynamic tax invoice forms.
13. **GitHub Integration API proxy**: Write rest endpoints handling commits, branches, PRs, and safe stash/pull updates.
14. **Activity loggers & Intelligence metrics system**: Write activity monitors, logging database entities, and plotting real-time graphs.
15. **Container configuration, Replit adaptations & Final Release QA**: Set up multi-stage Docker builds, bundle build tasks, apply complete TypeScript type checking, and launch unit-test coverage.

---

### SECTION 16 — TESTING, INTEGRATION & RELIABILITY GATES
To achieve industrial-grade reliability, the codebase must clear four distinct quality gates before compile-time verification:

#### 1. Unit Testing Matrix:
- **Core Orchestrator**: Test \`lib/providers.ts\` to ensure that if Groq fails or returns a 5xx status, failover switches gracefully to Ollama, and then to Gemini in under 1500ms.
- **Autonomy Lock**: Mock agent executions in \`lib/autonomy.ts\` to guarantee that level 3 blocks nested file deletion actions without user approvals.
- **Path Sanitization**: Execute fuzzing attempts against file action parameters containing traversal suffixes (e.g., \`/allowed/root/../../etc/passwd\`, \`C:\\allowed\\..\\Windows\\System32\`) ensuring all of them throw precise validation errors.

#### 2. Local-Agent Connection Mocking:
- Create mock client-polling scripts mimicking the registered PC Agent. Ensure the backend correctly dispatches steps sequentially, holds executions, handles mock results payloads, and logs failures without locking thread pools.

#### 3. Database Graceful Fallback Dry-Runs:
- Simulate container execution with \`DATABASE_URL\` set to an empty string. Attempt to log in, write messages, and create tasks. Verify that the UI displays the fallback status bar and local storage caching files correctly without causing route crashes.

#### 4. Automated UI Integration Tests:
- Script end-to-end user navigation flow: Chat → Voice Trigger → Open Code Studio → Trigger Plan → Execute Reversible Script → Complete Earning Invoice. Ensure that page transitions perform under 150ms.

---

### SECTION 17 — DEFINITION OF DONE (DoD)
Every repository merge or workspace delivery is fully complete only when it meets the following criteria:

- [ ] **Type Checked**: Zero compilation warnings under \`tsc --noEmit\` and strict linting.
- [ ] **Database Integrity**: Push scripts schema fully migrated to local database, and mock database backups match exact JSON fallback states.
- [ ] **Secure API Boundaries**: All API routes validate incoming bodies using Zod, sanitize all strings, and prevent shell execution escapes.
- [ ] **Zero Exposed Keys**: Zero hardcoded local keys or local development tokens in source code. All tokens are sourced from standard system environments.
- [ ] **Dynamic Responsiveness**: All 20 application pages load flawlessly on both ultra-wide screens and compact touch devices.
- [ ] **Polished Typography & Theming**: Zero plain standard browser styling. Typography matches Space Grotesk display headings paired with JetBrains Mono, styled in Cosmic Dark Slate colors.
- [ ] **PWA Audit Standards**: Google Lighthouse scores exceed 90 points across performance, accessibility, SEO, and PWA criteria.

---

### SECTION 18 — LAYOUT INTELLIGENCE & COMPOSITION ANALYZER
Neora's layout analyzer evaluates structural grid lines and reads composition balances:
1. **Grid Guidelines Snapping**: Aligns layers horizontally and vertically to classical margins.
2. **Reading Path Traversal Vector**: Computes the sequence order of user eye tracking paths.
3. **Focal Typographical Weight**: Prioritizes attention vectors on headlines.
4. **Print Bleed Verification**: Warns if layout coordinates bleed past standard print lines.
5. **REST API endpoints**: Supports real-time layout analyze, compare, and reconstruct.
`;
