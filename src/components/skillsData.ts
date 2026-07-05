export interface AISkill {
  id: string;
  name: string;
  category: string;
  description: string;
  systemPrompt: string;
  enabled: boolean;
  installed: boolean;
  complexity: "Beginner" | "Intermediate" | "Expert";
  latencyMs: number;
}

export const aiSkillsList: AISkill[] = [
  // --- Category: Frontend Core (1-15) ---
  {
    id: "sk_ui_mockup",
    name: "Fluid UI Mockup",
    category: "Frontend Core",
    description: "Generates responsive, fluid layout wireframes utilizing Tailwind grids and flexcontainers with custom spacing rules.",
    systemPrompt: "Design user interfaces using mobile-first fluid mechanics, utilizing flexible grids, rich negative space, and modern proportions.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 14
  },
  {
    id: "sk_resp_grid",
    name: "Responsive CSS Grid",
    category: "Frontend Core",
    description: "Auto-maps adaptive layouts across screen sizes using Tailwind's responsive screen prefixes.",
    systemPrompt: "Ensure all containers have responsive classes (sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4) and fluid sizing constraints.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 10
  },
  {
    id: "sk_anim_seq",
    name: "Animation Sequencing",
    category: "Frontend Core",
    description: "Generates smooth entry transitions, micro-interactions, and hover state scaling utilizing Framer Motion.",
    systemPrompt: "Use motion/react for container exits and enters with subtle fade, stagger children, and clean spring transition presets.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 25
  },
  {
    id: "sk_flex_tuning",
    name: "Flexbox Auto-Tuner",
    category: "Frontend Core",
    description: "Analyzes flex containers for wrapping, baseline alignments, and spacing anomalies.",
    systemPrompt: "Enforce items-center, justify-between, and content-center wrappers on headers, badges, and controls.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 8
  },
  {
    id: "sk_svg_illus",
    name: "SVG Vector Generator",
    category: "Frontend Core",
    description: "Creates clean custom inline SVG elements with customizable color variables and scales.",
    systemPrompt: "Use precise SVG coordinate geometries and pathing formulas to represent inline vector details.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 18
  },
  {
    id: "sk_typo_pair",
    name: "Aesthetic Typography Pairing",
    category: "Frontend Core",
    description: "Configures Google Fonts pairings matching sans, sans-serif, serif, and monospace variables.",
    systemPrompt: "Pair Space Grotesk display headings with Inter body text and JetBrains Mono for system widgets.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 12
  },
  {
    id: "sk_glassmorphism",
    name: "Glassmorphism Themes",
    category: "Frontend Core",
    description: "Applies glass-like frosted backdrops with precise semi-transparent borders and deep background blurs.",
    systemPrompt: "Style cards with bg-slate-900/40 backdrop-blur-md border border-slate-800/50 shadow-lg.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 15
  },
  {
    id: "sk_color_palettes",
    name: "Adaptive Color Palettes",
    category: "Frontend Core",
    description: "Configures aesthetic primary and neutral palettes supporting dark-canvas and light-canvas themes.",
    systemPrompt: "Construct beautiful UI interfaces utilizing off-whites, neutral grays, slate, and vibrant electric indigo accent notes.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 11
  },
  {
    id: "sk_bento_grid",
    name: "Bento-Box Layout Engine",
    category: "Frontend Core",
    description: "Arranges dynamic dashboard modules into modern asymmetric bento tiles.",
    systemPrompt: "Organize panels with grid-rows-[auto] and unequal col span multipliers to achieve balanced layout weights.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 22
  },
  {
    id: "sk_skeleton_load",
    name: "Skeleton Loader Scaffolder",
    category: "Frontend Core",
    description: "Injects beautiful pulsing skeleton state placeholders while files or charts are fetching.",
    systemPrompt: "Render animate-pulse gradient blocks representing card headers, avatars, and text segments.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 9
  },
  {
    id: "sk_recharts_cfg",
    name: "Recharts Customizer",
    category: "Frontend Core",
    description: "Configures responsive chart parameters, tooltips, grid overlays, and legend layouts.",
    systemPrompt: "Utilize Recharts ResponsiveContainer with custom-styled Tooltips and smooth bezier curves.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 28
  },
  {
    id: "sk_form_validation",
    name: "Form Real-time Validator",
    category: "Frontend Core",
    description: "Inlines conditional validation and status messaging across multi-step inputs.",
    systemPrompt: "Implement regex matches and visual warning cues on email, username, and password entry bounds.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 13
  },
  {
    id: "sk_drag_drop",
    name: "Drag & Drop File Interactor",
    category: "Frontend Core",
    description: "Generates high-performance drop zones with dragover visual highlights and file limit gates.",
    systemPrompt: "Capture onDragOver, onDragLeave, and onDrop events with clean CSS highlight feedbacks.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 16
  },
  {
    id: "sk_canvas_ctrls",
    name: "HTML Canvas Painter",
    category: "Frontend Core",
    description: "Draws customizable shapes, matrices, or particle nodes directly inside high-frame rate viewports.",
    systemPrompt: "Initialize requestAnimationFrame loop on canvas contexts for rendering complex graphics.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 32
  },
  {
    id: "sk_toast_notifications",
    name: "Micro Toast Notifications",
    category: "Frontend Core",
    description: "Deploys non-blocking micro status alerts that stack, slide, and fade out beautifully.",
    systemPrompt: "Maintain stateful toast lists that auto-dismiss after set delays with slide-in entry frames.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 14
  },

  // --- Category: Backend & API Systems (16-30) ---
  {
    id: "sk_rest_endpoints",
    name: "REST API Endpoint Generator",
    category: "Backend Systems",
    description: "Generates clean Express HTTP routes mapping GET, POST, PUT, and DELETE methods.",
    systemPrompt: "Structure endpoints logically, returning status codes, parsing JSON bodies, and handling params.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 12
  },
  {
    id: "sk_json_sanitizer",
    name: "JSON Payload Sanitizer",
    category: "Backend Systems",
    description: "Validates, cleans, and strips malicious key structures from incoming network streams.",
    systemPrompt: "Filter incoming JSON body keys recursively, validating structure matching expected schema rules.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 15
  },
  {
    id: "sk_cors_troubleshooter",
    name: "CORS Configurations Optimizer",
    category: "Backend Systems",
    description: "Defines granular header permissions, cross-origin protocols, and authorized origin credentials.",
    systemPrompt: "Apply optimal Express CORS options, enabling secure resource sharing and preventing leaks.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 10
  },
  {
    id: "sk_express_middleware",
    name: "Express Middleware Architect",
    category: "Backend Systems",
    description: "Injects loggers, performance recorders, and request decorators sequentially into API chains.",
    systemPrompt: "Assemble custom middleware blocks capturing execution duration and appending system headers.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 14
  },
  {
    id: "sk_api_proxying",
    name: "API Secret Key Proxy",
    category: "Backend Systems",
    description: "Proxies browser requests to third-party endpoints to keep system keys completely secure.",
    systemPrompt: "Never output secrets to the client. Keep all third-party API keys server-side in node context.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 20
  },
  {
    id: "sk_jwt_auth",
    name: "JWT Token Handshaker",
    category: "Backend Systems",
    description: "Generates, signs, verifies, and decodes JSON Web Tokens with robust payload encryption.",
    systemPrompt: "Apply jwt.sign and jwt.verify on authorization headers with proper expiration timelines.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 25
  },
  {
    id: "sk_file_streams",
    name: "File Stream Buffer Controller",
    category: "Backend Systems",
    description: "Pipes server directories, large logs, or files as compressed byte streams.",
    systemPrompt: "Utilize fs.createReadStream and pipe outputs efficiently to avoid memory saturation.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 30
  },
  {
    id: "sk_rate_limiter",
    name: "Request Rate Limiter",
    category: "Backend Systems",
    description: "Limits repeated client requests from specific IPs using a leaky-bucket sliding token filter.",
    systemPrompt: "Build custom in-memory rate limiting queues to shield sensitive login or AI endpoints.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 18
  },
  {
    id: "sk_sse_events",
    name: "SSE Real-Time Streamer",
    category: "Backend Systems",
    description: "Pipes server notifications and model generations as high-performance Server-Sent Events.",
    systemPrompt: "Set Connection: keep-alive and text/event-stream headers to pipe live strings incrementally.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 24
  },
  {
    id: "sk_bg_scheduler",
    name: "Task Scheduler Daemon",
    category: "Backend Systems",
    description: "Triggers background checks, cleanups, and stats aggregations at exact cron schedules.",
    systemPrompt: "Implement reliable non-blocking setTimeout loops or node-cron triggers for maintenance tasks.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 15
  },
  {
    id: "sk_system_telemetry",
    name: "OS Hardware Telemetry API",
    category: "Backend Systems",
    description: "Extracts CPU, load averages, memory allocations, and disk indicators in JSON format.",
    systemPrompt: "Query process.cpuUsage, process.memoryUsage, and os utilities to package health telemetry.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 28
  },
  {
    id: "sk_websocket_bind",
    name: "WebSocket Client Orchestrator",
    category: "Backend Systems",
    description: "Flashes messages, ping-pong checks, and real-time canvas overrides across sockets.",
    systemPrompt: "Initialize ws or socket.io rooms with authoritative heartbeat sync routines.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 35
  },
  {
    id: "sk_multipart_parser",
    name: "Multipart File Parser",
    category: "Backend Systems",
    description: "Splits incoming multipart binary payloads into temp storage and memory buffers cleanly.",
    systemPrompt: "Leverage multer or formidable parsing rules to process custom visual uploads safely.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 19
  },
  {
    id: "sk_http_status_mapper",
    name: "HTTP Exception Decoupler",
    category: "Backend Systems",
    description: "Unifies REST server warnings and maps stack traces into clean user-friendly status responses.",
    systemPrompt: "Intercept backend catches and format response payloads matching structured API standards.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 8
  },
  {
    id: "sk_circuit_breaker",
    name: "API Circuit Breaker",
    category: "Backend Systems",
    description: "Fails fast, cools down, and redirects requests when dependent APIs timeout or go down.",
    systemPrompt: "Monitor endpoint failure rates, trip connections to 'OPEN' state, and retry after set timeouts.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 22
  },

  // --- Category: Database & Persistence (31-42) ---
  {
    id: "sk_firestore_blueprints",
    name: "Firestore Blueprint Modeler",
    category: "Database & Persistence",
    description: "Designs schema definitions, document paths, and subcollection structures for Firestore.",
    systemPrompt: "Plan denormalized collections, flat arrays, and subcollection trees for high scale query-speed.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 15
  },
  {
    id: "sk_cloud_sql_schemas",
    name: "Cloud SQL Schema Builder",
    category: "Database & Persistence",
    description: "Builds SQL tables, indices, foreign keys, and cascading rules for PostgreSQL.",
    systemPrompt: "Draft optimal relational queries, indexing columns, primary keys, and auto-updated counters.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 24
  },
  {
    id: "sk_postgres_migrations",
    name: "PostgreSQL Migrator",
    category: "Database & Persistence",
    description: "Constructs and verifies migration steps, rollback logs, and structural alter commands.",
    systemPrompt: "Generate safe up/down SQL commands ensuring existing user structures remain unaltered.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 26
  },
  {
    id: "sk_drizzle_queries",
    name: "Drizzle Query Generator",
    category: "Database & Persistence",
    description: "Translates relational statements into Drizzle ORM TypeScript models and selections.",
    systemPrompt: "Leverage drizzle-orm schemas, select, insert, update, join, and filter modifiers safely.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 16
  },
  {
    id: "sk_localstorage_wrap",
    name: "LocalStorage State Wrapper",
    category: "Database & Persistence",
    description: "Caches layout options, UI presets, and drafts offline with try-catch parse fallbacks.",
    systemPrompt: "Build helper methods that stringify objects, catch storage errors, and set defaults.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 6
  },
  {
    id: "sk_kv_cache",
    name: "Memory Cache Controller",
    category: "Database & Persistence",
    description: "Caches slow query parameters inside volatile key-value records with active TTL gates.",
    systemPrompt: "Maintain map-based caches, purging stale assets when access duration passes set threshold.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 12
  },
  {
    id: "sk_relational_joins",
    name: "Relational Join Constructor",
    category: "Database & Persistence",
    description: "Assembles fast inner joins, outer joins, and lateral subqueries across multiple tables.",
    systemPrompt: "Join tables using primary key indexes, select fields explicitly, and format tabular rows.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 20
  },
  {
    id: "sk_tx_safety",
    name: "Atomic Transactions Manager",
    category: "Database & Persistence",
    description: "Encapsulates multiple inserts/updates in single database transactions to secure ACID compliance.",
    systemPrompt: "Deploy BEGIN, COMMIT, and ROLLBACK mechanics to protect critical finance and log entries.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 28
  },
  {
    id: "sk_index_opt",
    name: "Index Performance Optimizer",
    category: "Database & Persistence",
    description: "Profiles slow database queries, recommending B-Tree, GIN, or composite indices.",
    systemPrompt: "Identify columns in search and where clauses and generate index queries to speed up reads.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 25
  },
  {
    id: "sk_agg_pipelines",
    name: "Aggregation Pipeline Compiler",
    category: "Database & Persistence",
    description: "Calculates total counts, averages, and dynamic monthly metrics across millions of logs.",
    systemPrompt: "Compile analytical sums, groups, filters, and dynamic calculations into high-speed queries.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 23
  },
  {
    id: "sk_realtime_sync",
    name: "Realtime Sync Controller",
    category: "Database & Persistence",
    description: "Hooks onto database triggers to push immediate layout refreshes to active clients.",
    systemPrompt: "Leverage real-time listeners (e.g. onSnapshot) to propagate modifications instantly.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 18
  },
  {
    id: "sk_json_blob_query",
    name: "JSONB Query Engine",
    category: "Database & Persistence",
    description: "Queries unstructured dynamic JSON attributes directly inside structured PostgreSQL tables.",
    systemPrompt: "Use nested path selectors (->> and #>) to search dynamic document keys efficiently.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 22
  },

  // --- Category: AI & Prompt Engineering (43-57) ---
  {
    id: "sk_chain_of_thought",
    name: "Chain-of-Thought prompting",
    category: "AI & Prompt Engineering",
    description: "Guides the AI backend to think step-by-step, listing sub-rationales before outputting responses.",
    systemPrompt: "Enforce deep structural reasoning, parsing logical steps before providing the final answers.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 30
  },
  {
    id: "sk_prompt_translation",
    name: "Multi-Language Translators",
    category: "AI & Prompt Engineering",
    description: "Auto-translates chat contexts into Bengali, English, Spanish, and multi-lingual scripts.",
    systemPrompt: "Auto-detect source language, maintaining technical tokens while outputting accurate target scripts.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 18
  },
  {
    id: "sk_llm_guardrails",
    name: "Guardrail Framer",
    category: "AI & Prompt Engineering",
    description: "Injects defensive rule prompts to filter out prompt injection attacks and protect outputs.",
    systemPrompt: "Intercept jailbreaks, restricting responses strictly to workspace data and professional scripts.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 12
  },
  {
    id: "sk_context_limiters",
    name: "Context Window Limiter",
    category: "AI & Prompt Engineering",
    description: "Compresses past chat histories using recursive semantic summary tokens to avoid out-of-token limits.",
    systemPrompt: "Prune historical lists to key memory checkpoints, maintaining intent while saving tokens.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 25
  },
  {
    id: "sk_vision_presets",
    name: "Vision Analysis Assistant",
    category: "AI & Prompt Engineering",
    description: "Formats screenshot image attributes and dimensions for high-accuracy multimodal visual ingestion.",
    systemPrompt: "Pre-process mockups and images, pointing out dominant elements, colors, and styling rules.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 35
  },
  {
    id: "sk_model_fallbacks",
    name: "SDK Model Fallbacks Manager",
    category: "AI & Prompt Engineering",
    description: "Safely rotates API keys and alternates active models (e.g. Gemini 2.5, 1.5) on failure.",
    systemPrompt: "Monitor API exceptions, switching to adjacent stable models dynamically during high demand.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 20
  },
  {
    id: "sk_embeddings_maps",
    name: "Embeddings Calculator",
    category: "AI & Prompt Engineering",
    description: "Transforms text streams into 1536-dimensional vectors to calculate cosine similarity coefficients.",
    systemPrompt: "Leverage embedding calls to vectorize queries and calculate similarity match vectors.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 28
  },
  {
    id: "sk_semantic_search",
    name: "Semantic Search Indexer",
    category: "AI & Prompt Engineering",
    description: "Searches document records based on contextual intent rather than plain keyword matching.",
    systemPrompt: "Generate semantic vector search queries, ordering files by conceptual relevancy score.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 30
  },
  {
    id: "sk_few_shot_gen",
    name: "Few-Shot Example Constructor",
    category: "AI & Prompt Engineering",
    description: "Injects strict input-output formatting pairs to calibrate and stabilize AI outputs.",
    systemPrompt: "Provide explicit examples of valid inputs and corresponding structured JSON targets.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 15
  },
  {
    id: "sk_json_sanitizers_ai",
    name: "AI Output JSON Sanitizer",
    category: "AI & Prompt Engineering",
    description: "Strips markdown syntax blocks and trailing commas from raw LLM responses for clean JSON parses.",
    systemPrompt: "Extract code block contents, formatting strings into compliant parseable JSON payloads.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 10
  },
  {
    id: "sk_agent_memories",
    name: "Long-Term Memory Registry",
    category: "AI & Prompt Engineering",
    description: "Saves high-level preferences, guidelines, and context markers into persistent JSON repositories.",
    systemPrompt: "Consult past preferences and project specifications to output customized code files.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 14
  },
  {
    id: "sk_task_decomposition",
    name: "Dynamic Task Decomposer",
    category: "AI & Prompt Engineering",
    description: "Splits large, complex user prompts into step-by-step modular sub-tasks.",
    systemPrompt: "Analyze ambiguous goals, outputting a precise checklist of actions and files to modify.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 22
  },
  {
    id: "sk_intent_classifier",
    name: "NLU Intent Classifier",
    category: "AI & Prompt Engineering",
    description: "Identifies whether the active chat input represents an inquiry, edit command, or test trigger.",
    systemPrompt: "Evaluate prompt verbs and patterns, routing requests strictly to their correct handlers.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 8
  },
  {
    id: "sk_stt_transcriber",
    name: "Voice Speech Transcriber",
    category: "AI & Prompt Engineering",
    description: "Converts audio recordings into high-fidelity text streams with punctuation and casing.",
    systemPrompt: "Extract phonemes and audio parameters, returning natural transcribing text in real-time.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 40
  },
  {
    id: "sk_sentiment_analyser",
    name: "Real-time Sentiment Analyser",
    category: "AI & Prompt Engineering",
    description: "Analyzes user text streams for frustration, confusion, or satisfaction to adapt UI hints.",
    systemPrompt: "Evaluate input adjectives and exclamation patterns to score user emotional feedback.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 7
  },

  // --- Category: Testing & DevOps (58-70) ---
  {
    id: "sk_unit_tests",
    name: "Unit Test Mocking",
    category: "Testing & DevOps",
    description: "Writes Vitest or Jest assertions checking input extremes, exceptions, and coverage maps.",
    systemPrompt: "Generate thorough unit test files checking mock parameters and border constraints.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 20
  },
  {
    id: "sk_cypress_flows",
    name: "Cypress Workflow Designer",
    category: "Testing & DevOps",
    description: "Constructs end-to-end browser simulation click routes checking interactive buttons.",
    systemPrompt: "Compose detailed Cypress or Playwright browser actions validating page transitions.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 26
  },
  {
    id: "sk_eslint_rules",
    name: "ESLint Auto-Fixer",
    category: "Testing & DevOps",
    description: "Inspects workspace structures, fixing missing imports and trailing syntax mismatches.",
    systemPrompt: "Verify syntax strictness, cleaning unused bindings, formatting, and broken scopes.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 12
  },
  {
    id: "sk_strict_types",
    name: "TypeScript Strict Typer",
    category: "Testing & DevOps",
    description: "Analyzes codes to replace 'any' with robust, documented type declarations.",
    systemPrompt: "Enforce compile-time type safety, drafting interfaces for any dynamic objects or events.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 14
  },
  {
    id: "sk_docker_scaffolder",
    name: "Dockerfile Scaffolder",
    category: "Testing & DevOps",
    description: "Creates multi-stage Docker builds optimized for Node, React, and Python runtimes.",
    systemPrompt: "Generate safe, cached Docker instructions setting production dependencies and port variables.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 18
  },
  {
    id: "sk_latency_profiler",
    name: "Performance Latency Profiler",
    category: "Testing & DevOps",
    description: "Profiles code, identifying blocking CPU event loops and slow asset assets load lines.",
    systemPrompt: "Analyze time performance parameters, locating lag bottlenecks and suggesting non-blocking loops.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 25
  },
  {
    id: "sk_mem_leak_check",
    name: "Memory Leak Analyzer",
    category: "Testing & DevOps",
    description: "Scans active closures, intervals, and database subscriptions for missing unsubscriptions.",
    systemPrompt: "Inspect React useEffect blocks to ensure every listener returns proper cleanup actions.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 22
  },
  {
    id: "sk_port_binder",
    name: "Network Port Configurator",
    category: "Testing & DevOps",
    description: "Troubleshoots port collisions, ensuring web processes attach cleanly to port 3000.",
    systemPrompt: "Enforce standard network mappings, binding Express and Vite servers correctly inside host.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 11
  },
  {
    id: "sk_deploy_pipelines",
    name: "CI/CD Pipeline Mapper",
    category: "Testing & DevOps",
    description: "Builds action workflows targeting automated testing, building, and Cloud Run deployments.",
    systemPrompt: "Draft compliant YAML workflows for automated testing, Docker build, and container pushes.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 24
  },
  {
    id: "sk_git_rollbacks",
    name: "Git Rollback Safe-Guard",
    category: "Testing & DevOps",
    description: "Tracks active file changes to allow prompt restoring or rollback of broken code trees.",
    systemPrompt: "Manage staging and rollback histories, keeping active backup copies of modified models.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 15
  },
  {
    id: "sk_security_auditor",
    name: "Dependency Vulnerability Auditor",
    category: "Testing & DevOps",
    description: "Audits packages list, identifying and patching CVE threats and broken structures.",
    systemPrompt: "Verify external packages against known security databases, drafting safe upgrades.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 19
  },
  {
    id: "sk_auto_heal_diag",
    name: "Self-Healing Diagnostic",
    category: "Testing & DevOps",
    description: "Detects compilation failures, automatically running linter steps and patching code.",
    systemPrompt: "Evaluate error logs, isolate missing import statements, and repair TypeScript syntax lines.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 30
  },
  {
    id: "sk_prod_bundler",
    name: "Production Bundle Tuner",
    category: "Testing & DevOps",
    description: "Configures esbuild parameters, optimizing code bundles for cold-start speed.",
    systemPrompt: "Tweak compiling parameters, bundling modules as single files while marking large dependencies as external.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 28
  },

  // --- Category: Voice, Media & Games (71-80) ---
  {
    id: "sk_audio_synths",
    name: "Web Audio Synthesizer",
    category: "Voice, Media & Games",
    description: "Builds functional oscillators, dynamic gain filters, and spatial sound networks.",
    systemPrompt: "Leverage AudioContext APIs to construct real-time oscillators, custom waves, and resonant filter nodes.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 32
  },
  {
    id: "sk_speech_synth",
    name: "Text-to-Speech Presets",
    category: "Voice, Media & Games",
    description: "Speaks notifications, alerts, and instructions out loud in highly customizable voice pitches.",
    systemPrompt: "Initialize SpeechSynthesisUtterance, adjusting rate, volume, and language parameters smoothly.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 18
  },
  {
    id: "sk_game_physics",
    name: "2D Game Physics Controller",
    category: "Voice, Media & Games",
    description: "Calculates gravity bounds, momentum shifts, and elastic collision points on canvas objects.",
    systemPrompt: "Write high-precision update frames tracking velocity vectors, bounding boxes, and collision impacts.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 26
  },
  {
    id: "sk_canvas_loops",
    name: "Game Canvas Frame Renderer",
    category: "Voice, Media & Games",
    description: "Synchronizes game state loops with browser display frequencies.",
    systemPrompt: "Establish requestAnimationFrame tickers executing clearRect and coordinate redrawing sequentially.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 14
  },
  {
    id: "sk_key_mappers",
    name: "Keyboard Control Mapper",
    category: "Voice, Media & Games",
    description: "Maps WASD, spacebar, and arrow buttons into responsive game state triggers.",
    systemPrompt: "Listen to KeyDown and KeyUp, maintaining smooth true/false arrays for directional vectors.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 6
  },
  {
    id: "sk_score_keeper",
    name: "Game Session Score Keeper",
    category: "Voice, Media & Games",
    description: "Tracks active session metrics, streaks, and persists high-scores in offline repositories.",
    systemPrompt: "Compare session statistics, updating local records when a new high-score benchmark is achieved.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 7
  },
  {
    id: "sk_procedural_gen",
    name: "Procedural Landscape Generator",
    category: "Voice, Media & Games",
    description: "Creates randomized, infinite obstacles or tiles using mathematical noise formulas.",
    systemPrompt: "Generate custom deterministic layouts and obstacle coordinates utilizing modular sine algorithms.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 28
  },
  {
    id: "sk_sfx_player",
    name: "Retro SFX Synthesizer",
    category: "Voice, Media & Games",
    description: "Plays vintage laser, explosion, jump, and coin-collect sound effects on the fly.",
    systemPrompt: "Synthesize immediate retro sound waves using rapid custom pitch drops and envelope decay gates.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 16
  },
  {
    id: "sk_overlay_video",
    name: "Video Stream Overlay",
    category: "Voice, Media & Games",
    description: "Overlays visual coordinates and HUD parameters over live camera outputs.",
    systemPrompt: "Superimpose customized Tailwind and canvas elements over live video inputs cleanly.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 24
  },
  {
    id: "sk_music_synthesizer",
    name: "Interactive Piano Synthesizer",
    category: "Voice, Media & Games",
    description: "Generates beautiful polyphonic music chord sounds mapping standard keys.",
    systemPrompt: "Create multiple oscillator nodes simultaneously to play elegant polyphonic musical notes.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 30
  },

  // --- Category: Security, Internationalization & Utilities (81-101) ---
  {
    id: "sk_sql_injection",
    name: "SQL Injection Shield",
    category: "Security & Utilities",
    description: "Defends databases by parameterizing queries, preventing harmful payload executions.",
    systemPrompt: "Always use parameterized queries and placeholder values in database insert/select blocks.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 14
  },
  {
    id: "sk_xss_protection",
    name: "Cross-Site Scripting Shield",
    category: "Security & Utilities",
    description: "Sanitizes HTML content, escaping tag characters to disable unauthorized script execution.",
    systemPrompt: "Escape visual outputs and sanitize dynamic HTML lines to block untrusted script inclusions.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 11
  },
  {
    id: "sk_secrets_decrypt",
    name: "Environmental Key Decrypter",
    category: "Security & Utilities",
    description: "Parses, safeguards, and masks client-side API credentials.",
    systemPrompt: "Interlock sensitive API tokens inside process env structures, shielding keys from client code.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 16
  },
  {
    id: "sk_csrf_shield",
    name: "CSRF Request Shield",
    category: "Security & Utilities",
    description: "Generates secure stateful anti-forgery headers on post forms, defending session integrity.",
    systemPrompt: "Inject, parse, and validate anti-CSRF challenge keys inside client form transmissions.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 18
  },
  {
    id: "sk_bangla_translate",
    name: "Bengali Translation Engine",
    category: "Security & Utilities",
    description: "Converts complex technical texts into natural, easy-to-understand Bengali script.",
    systemPrompt: "Deliver precise translations, adopting professional Bengali vocabulary for labels and warnings.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 15
  },
  {
    id: "sk_banglish_parser",
    name: "Phonetic Banglish Interpreter",
    category: "Security & Utilities",
    description: "Interprets phonetically written Bengali words (written in English script) into standard Bengali.",
    systemPrompt: "Auto-translate phonetic expressions (e.g. kemon acho, note open koro) into correct Bengali script.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 25
  },
  {
    id: "sk_pdf_builder",
    name: "PDF Report Builder",
    category: "Security & Utilities",
    description: "Constructs clean PDF layouts of invoices, charts, and metrics directly in client memory.",
    systemPrompt: "Convert tabular lists and figures into formatted, download-ready PDF document pages.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 22
  },
  {
    id: "sk_md_parser",
    name: "Markdown-to-HTML Parser",
    category: "Security & Utilities",
    description: "Parses raw markdown text strings, outputting beautiful styled semantic HTML elements.",
    systemPrompt: "Convert headers, bold text, bullet points, and codeblocks into structured Tailwind elements.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 12
  },
  {
    id: "sk_csv_parser",
    name: "CSV Bulk Data Parser",
    category: "Security & Utilities",
    description: "Extracts CSV data tables, auto-parsing arrays, headers, and separator markers.",
    systemPrompt: "Transform bulk CSV text rows cleanly into structured JSON arrays with try-catch checks.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 9
  },
  {
    id: "sk_excel_exporter",
    name: "Excel Sheet Exporter",
    category: "Security & Utilities",
    description: "Generates download-ready XLSX files from dynamic workspace matrices and databases.",
    systemPrompt: "Structure analytical tables into sheets, saving them as compliant spreadsheet files.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 17
  },
  {
    id: "sk_yaml_converter",
    name: "JSON-to-YAML Converter",
    category: "Security & Utilities",
    description: "Translates nested JSON hierarchies into clean indented YAML configurations.",
    systemPrompt: "Map JSON structures recursively into readable indent-compliant YAML properties.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 8
  },
  {
    id: "sk_uuid_gen",
    name: "Cryptographic UUID Generator",
    category: "Security & Utilities",
    description: "Generates high-entropy RFC-4122 compliant version-4 unique IDs.",
    systemPrompt: "Utilize cryptographic random bytes to generate collision-free unique identifier strings.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 5
  },
  {
    id: "sk_datetime_format",
    name: "DateTime Zone Formatter",
    category: "Security & Utilities",
    description: "Calibrates dates across UTC, local zones, and converts standard timestamps into relative time labels.",
    systemPrompt: "Output dates cleanly matching regional preferences (e.g., '3 hours ago', 'Oct 14, 2026').",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 7
  },
  {
    id: "sk_url_sanitizer",
    name: "URL Parameter Sanitizer",
    category: "Security & Utilities",
    description: "Strips query trackers, script parameters, and decodes percent-encoded character strings.",
    systemPrompt: "Sanitize path inputs, parsing safe, sanitized query parameters from browser locations.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 6
  },
  {
    id: "sk_health_probes",
    name: "System Health Probe",
    category: "Security & Utilities",
    description: "Pings backend service layers periodically to ensure high database and port connectivity.",
    systemPrompt: "Expose micro-health routes responding with system ping durations and database connection state.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 10
  },
  {
    id: "sk_priority_queues",
    name: "Priority Event Queue",
    category: "Security & Utilities",
    description: "Orders incoming events or prompts by priority and urgency weight coefficients.",
    systemPrompt: "Manage sorting queues, dispatching critical safety, error, or real-time tasks first.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 12
  },
  {
    id: "sk_log_decorators",
    name: "Polished Logs Decorator",
    category: "Security & Utilities",
    description: "Appends timestamps, thread metrics, and level markers to system log entries.",
    systemPrompt: "Format logs with precise, color-coded level prefix tags (e.g. '[SYSTEM]', '[WARNING]').",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 6
  },
  {
    id: "sk_jwt_decoder",
    name: "Token Payload Decoder",
    category: "Security & Utilities",
    description: "Decodes JWT base64 payloads to query client credentials without accessing signatures.",
    systemPrompt: "Parse and decode JWT token payloads safely, retrieving basic client state.",
    enabled: true,
    installed: true,
    complexity: "Beginner",
    latencyMs: 7
  },
  {
    id: "sk_cookie_sanitizer",
    name: "Cookie Attribute Sanitizer",
    category: "Security & Utilities",
    description: "Validates cookie keys, enforcing secure, HttpOnly, and SameSite headers.",
    systemPrompt: "Format cookie options securely, protecting session states from cross-origin scripts.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 11
  },
  {
    id: "sk_math_parser",
    name: "Formula Math Parser",
    category: "Security & Utilities",
    description: "Parses mathematical algebraic strings, safely evaluating formulas without utilizing eval.",
    systemPrompt: "Build tokenized arithmetic execution trees to calculate equation values safely.",
    enabled: true,
    installed: true,
    complexity: "Expert",
    latencyMs: 25
  },
  {
    id: "sk_xml_parser",
    name: "XML DOM Document Parser",
    category: "Security & Utilities",
    description: "Extracts attributes and trees from XML data streams with structured tag matching.",
    systemPrompt: "Parse XML documents using strict matching algorithms, converting nodes to JSON trees.",
    enabled: true,
    installed: true,
    complexity: "Intermediate",
    latencyMs: 15
  }
];

// --- Procedural Generation for 1000+ AI Skills covering Neora Agent Subsystems ---
const osAdjectives = ["Autonomous", "Kernel", "System-level", "Direct", "Virtualized", "Low-latency", "Distributed", "Secure", "Sandboxed", "High-performance", "Dynamic", "Proactive", "Heuristic", "Root-level", "Multi-threaded"];
const osNouns = ["OS Registry", "File Watcher", "Process Pipe", "CPU Governor", "Disk Sector", "Memory Daemon", "System Call", "Interrupt Handler", "Hardware Hub", "Thread Scheduler", "Device Driver", "Buffer Queue", "Core Allocator", "Port Monitor", "Resource Lock"];
const osSuffixes = ["Orchestrator", "Shield", "Interceptor", "Optimizer", "Daemon", "Controller", "Bridge", "Profiler", "Sentry", "Validator", "Adapter", "Compressor", "Synchronizer", "Diagnostics", "Tuner"];

const hwAdjectives = ["Direct-input", "Low-level", "Hardware-mapped", "Mechanical", "Synchronous", "Peripheral", "High-precision", "Simulated", "Interrupt-driven", "Responsive", "Isolated", "Calibrated", "Fail-safe", "Event-driven", "Macro-based"];
const hwNouns = ["Keyboard Driver", "Mouse Pointer", "Screen Raster", "USB Bus", "GPU Memory", "Audio Interface", "Video Controller", "Network Card", "I/O Bridge", "Keymap Matrix", "Cursor Coordinator", "Frame Buffer", "Device Hub", "BIOS Intermediary", "Hardware Gate"];
const hwSuffixes = ["Controller", "Tracker", "Emulator", "Synthesizer", "Decoder", "Tuner", "Sentry", "Gateway", "Synchronizer", "Wrapper", "Automator", "Profiler", "Calibrator", "Auditor", "Validator"];

const vocAdjectives = ["Acoustic", "Phonetic", "Neural-voice", "Dynamic-pitch", "Real-time", "Sub-second", "Bilingual", "Conversational", "Expressive", "Synthesized", "Resonant", "Multi-accent", "High-fidelity", "Low-jitter", "Adaptive-speed"];
const vocNouns = ["Audio Stream", "Speech Waveform", "Phoneme Array", "Vocal Timbre", "Acoustic Context", "TTS Engine", "STT Model", "Cadence Pipeline", "Intonation Map", "Noise Filter", "Gain Node", "Echo Canceller", "Voice Signature", "Frequency Band", "Syllable Tracker"];
const vocSuffixes = ["Synthesizer", "Interpreter", "Analyzer", "Modulator", "Tuner", "Decoder", "Filter", "Bridge", "Orchestrator", "Compressor", "Tracker", "Normalizer", "Balancer", "Evaluator", "Enhancer"];

const cogAdjectives = ["Semantic", "Context-aware", "Cognitive", "Dialogue-driven", "Logical", "Deep-thinking", "Recursive", "Creative", "Adaptive", "Analytical", "Multi-turn", "Hierarchical", "Structured", "Intent-aware", "Empathetic"];
const cogNouns = ["Dialogue Thread", "Prompt Context", "Knowledge Graph", "Sentiment Vector", "Concept Chain", "Argument Model", "Inference Node", "Response Schema", "Intent Class", "Language Flow", "Summary Index", "Semantic Link", "Logic Check", "Dialogue State"];
const cogSuffixes = ["Generator", "Orchestrator", "Decomposer", "Classifier", "Evaluator", "Summarizer", "Engine", "Bridge", "Reasoner", "Parser", "Tuner", "Validator", "Router", "Filter"];

const evoAdjectives = ["Reinforced", "Autonomous", "Continuous", "Self-healing", "Evolutionary", "Heuristic", "Adaptive", "Dynamic", "Meta-cognitive", "Recursive", "Feedback-driven", "Optimized", "Self-correcting", "Predictive", "Incremental"];
const evoNouns = ["Prompt Template", "Error Log", "Success Metric", "System Policy", "Model Weights", "Assigned Task", "Execution Path", "Skill Registry", "Behavior Pattern", "Output Sample", "Memory Vault", "Weight Factor", "LLM Feedback", "Constraint Rule"];
const evoSuffixes = ["Optimizer", "Self-Healer", "Tuner", "Evolver", "Auditor", "Reinforcer", "Assessor", "Updater", "Compiler", "Governor", "Refiner", "Adapter", "Planner", "Tracker"];

const autAdjectives = ["Event-driven", "Asynchronous", "Scheduled", "Background-run", "Multi-stage", "Chain-linked", "Continuous", "Fault-tolerant", "Automated", "Serverless", "Decoupled", "Triggered", "Reactive", "Highly-available", "Parallelized"];
const autNouns = ["Cron Schedule", "Webhook Post", "API Pipeline", "Task Queue", "Script File", "Data Flow", "Message Broker", "Event Hub", "Batch Payload", "System State", "Trigger Guard", "Worker Thread", "Action Sequence", "Job Log"];
const autSuffixes = ["Daemon", "Automator", "Scheduler", "Processor", "Dispatcher", "Watcher", "Handler", "Worker", "Orchestrator", "Runner", "Broker", "Tracer", "Validator", "Synchronizer", "Manager"];

const empAdjectives = ["Empathic", "Compassionate", "Active-listening", "Mirroring", "Warm", "Supportive", "Attentive", "Friendly", "Insightful", "Polite", "Calming", "Encouraging", "Patient", "Mindful", "Expressive"];
const empNouns = ["Emotional Cue", "User Mood", "Stress Level", "Chat Sentiment", "Vocal Tone", "Personal Detail", "Context Hint", "Feeling State", "Encouragement Loop", "Rapport Anchor", "Validation Step", "Conversational Cadence", "Response Vibe", "Worry Signal"];
const empSuffixes = ["Mirror", "Bridge", "Support", "Anchor", "Guide", "Counselor", "Companion", "Calmer", "Motivator", "Synthesizer", "Validator", "Attuner", "Stabilizer", "Nurturer", "Advisor"];

const genCategories = [
  { name: "Backend Systems", code: "os", adjs: osAdjectives, nouns: osNouns, sufs: osSuffixes },
  { name: "PC Control & Hardware", code: "hw", adjs: hwAdjectives, nouns: hwNouns, sufs: hwSuffixes },
  { name: "Voice Chatting & Speech", code: "voc", adjs: vocAdjectives, nouns: vocNouns, sufs: vocSuffixes },
  { name: "Text & Chatting Cognitive", code: "cog", adjs: cogAdjectives, nouns: cogNouns, sufs: cogSuffixes },
  { name: "Self-Evolution & Learning", code: "evo", adjs: evoAdjectives, nouns: evoNouns, sufs: evoSuffixes },
  { name: "Task Automation & Daemons", code: "aut", adjs: autAdjectives, nouns: autNouns, sufs: autSuffixes },
  { name: "Human Empathy & Personality", code: "emp", adjs: empAdjectives, nouns: empNouns, sufs: empSuffixes }
];

const generatedSkills: AISkill[] = [];

genCategories.forEach((cat) => {
  for (let i = 0; i < 1500; i++) {
    const adj = cat.adjs[i % cat.adjs.length];
    const noun = cat.nouns[(Math.floor(i / cat.adjs.length) + 1) % cat.nouns.length];
    const suf = cat.sufs[(Math.floor(i / (cat.adjs.length * cat.nouns.length)) + 2) % cat.sufs.length];
    
    const skillName = `${adj} ${noun} ${suf}`;
    const id = `sk_gen_${cat.code}_${i + 1}`;
    
    let description = "";
    let systemPrompt = "";
    
    if (cat.code === "os") {
      description = `Monitors and manages the ${noun} to act as a ${suf}, ensuring optimal ${adj.toLowerCase()} task execution and kernel safety.`;
      systemPrompt = `Directly control and validate ${noun} actions, enforcing ${adj.toLowerCase()} execution bounds and logging state transitions.`;
    } else if (cat.code === "hw") {
      description = `Controls and emulates ${adj.toLowerCase()} actions of the ${noun} to achieve ${suf.toLowerCase()} capabilities without manual physical inputs.`;
      systemPrompt = `Act as a hardware ${suf} for ${noun}, executing low-level ${adj.toLowerCase()} commands and mapping response metrics safely.`;
    } else if (cat.code === "voc") {
      description = `Analyzes and synthesizes ${adj.toLowerCase()} parameters on the ${noun} to run voice chats with ${suf.toLowerCase()} levels of acoustic fidelity.`;
      systemPrompt = `Synthesize ${adj.toLowerCase()} spoken expressions from the ${noun}, modulating pitch, timbre, and speed to match active human conversation.`;
    } else if (cat.code === "cog") {
      description = `Processes ${adj.toLowerCase()} reasoning across the ${noun} to act as an advanced text chat ${suf} with human-like semantic comprehension.`;
      systemPrompt = `Deconstruct conversational queries using a ${adj.toLowerCase()} approach, maintaining the ${noun} dialogue history to produce optimal text replies.`;
    } else if (cat.code === "evo") {
      description = `Enables ${adj.toLowerCase()} learning loops by analyzing ${noun} outcomes, automatically acting as a skill ${suf.toLowerCase()} to upgrade Neora's code.`;
      systemPrompt = `Execute autonomous ${adj.toLowerCase()} upgrades on ${noun} rules, calculating metrics to perform persistent self-tuning.`;
    } else if (cat.code === "aut") {
      description = `Runs ${adj.toLowerCase()} automation pipelines on ${noun} objects, coordinating executions as a reliable ${suf.toLowerCase()}.`;
      systemPrompt = `Daemonize ${adj.toLowerCase()} sequences, monitoring the ${noun} for changes to execute actions without blocking active UI threads.`;
    } else { // emp
      description = `Fosters ${adj.toLowerCase()} human relationships by detecting ${noun} signs, acting as a supportive emotional ${suf.toLowerCase()} for the user.`;
      systemPrompt = `Act as an empathetic ${adj.toLowerCase()} companion, responding to ${noun} variations with therapeutic support and human-like warmth.`;
    }
    
    const complexity: "Beginner" | "Intermediate" | "Expert" = 
      i % 3 === 0 ? "Beginner" : i % 3 === 1 ? "Intermediate" : "Expert";
      
    generatedSkills.push({
      id,
      name: skillName,
      category: cat.name,
      description,
      systemPrompt,
      enabled: i % 4 !== 0,
      installed: i % 5 !== 0,
      complexity,
      latencyMs: 5 + (i % 35)
    });
  }
});

// Combine original and generated skills
aiSkillsList.push(...generatedSkills);

