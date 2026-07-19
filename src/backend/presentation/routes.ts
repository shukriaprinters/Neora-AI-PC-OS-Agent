import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "./controllers/AuthController.ts";
import { ProjectController } from "./controllers/ProjectController.ts";
import { AiController } from "./controllers/AiController.ts";
import { DI } from "../di.ts";
import { PluginManager } from "../../lib/plugins/PluginManager.ts";
import { ToolRegistry } from "../../lib/plugins/ToolRegistry.ts";
import { MCPAdapter } from "../../lib/plugins/MCPAdapter.ts";
import { PluginTestSuite } from "../../lib/plugins/PluginTestSuite.ts";
import { ColorPaletteGeneratorPlugin, DesignCriticPlugin, PosterGeneratorPlugin } from "../../lib/plugins/SamplePlugins.ts";
import { ProviderRegistry } from "../../lib/ai/ProviderRegistry.ts";
import { ModelRouter } from "../../lib/ai/ModelRouter.ts";
import { CreativeDirector } from "../../lib/ai/CreativeDirector.ts";
import { AiGateway } from "../../lib/ai/AiGateway.ts";
import { AiTestSuite } from "../../lib/ai/AiTestSuite.ts";
import { cognitiveSdk } from "../../lib/ai/cognitive/CognitiveSdk.ts";
import { cognitiveTestSuite } from "../../lib/ai/cognitive/CognitiveTestSuite.ts";
import { MultimodalOrchestrator } from "../../lib/ai/vision/MultimodalOrchestrator.ts";
import { VisionQueue } from "../../lib/ai/vision/VisionQueue.ts";
import { visionTestSuite } from "../../lib/ai/vision/VisionTestSuite.ts";
import { PerceptionPipeline } from "../../lib/ai/vision/PerceptionPipeline.ts";
import { ocrEngine } from "../../lib/ai/vision/OcrEngine.ts";
import { ingestionQueue } from "../../lib/ai/ingestion/IngestionQueue.ts";
import { IngestionTestSuite } from "../../lib/ai/ingestion/IngestionTestSuite.ts";
import { LayoutIntelligenceEngine, LayoutIntelligenceTelemetry } from "../../lib/ai/vision/LayoutIntelligenceEngine.ts";
import { LayoutEngineTestSuite } from "../../lib/ai/vision/LayoutIntelligenceEngine.test.ts";
import { ColorIntelligenceEngine, ColorIntelligenceTelemetry, ColorEngineTestSuite } from "../../lib/ai/vision/ColorIntelligenceEngine.ts";
import { ReferenceIntelligenceEngine, ReferenceIntelligenceTelemetry, ReferenceEngineTestSuite } from "../../lib/ai/vision/ReferenceIntelligenceEngine.ts";
import { WorkspaceIntelligenceEngine, WorkspaceIntelligenceTelemetry, WorkspaceEngineTestSuite } from "../../lib/ai/vision/WorkspaceIntelligenceEngine.ts";
import { DesignBrain, DesignBrainTelemetry, DesignBrainTestSuite } from "../../lib/ai/cognitive/DesignBrain.ts";
import { CreativeDirectorEngine, CreativeDirectorTelemetry, CreativeDirectorTestSuite } from "../../lib/ai/cognitive/CreativeDirectorEngine.ts";
import { IntelligenceOrchestrator, OrchestratorTelemetry, IntelligenceOrchestratorTestSuite } from "../../lib/ai/cognitive/IntelligenceOrchestrator.ts";
import { MultiModelGenerationOrchestrator, MultiModelGenerationTestSuite } from "../../lib/ai/MultiModelGenerationOrchestrator.ts";
import { UniversalPromptCompiler, CreativeVariantEngine, BlueprintCompiler, DesignSpecificationDSLCompiler, DesignCompilerTestSuite } from "../../lib/ai/PromptCompiler.ts";
import { NeoraDesignGenerationEngine, NDGETestSuite } from "../../lib/ai/NeoraDesignGenerationEngine.ts";
import { NeoraUniversalEditableWorkspaceEngine, NUWETestSuite } from "../../lib/ai/NeoraUniversalEditableWorkspaceEngine.ts";

const router = Router();

const authCtrl = new AuthController();
const projCtrl = new ProjectController();
const aiCtrl = new AiController();

// Initialize Neora AI Designer OS Plugin Ecosystem and Pre-load sample plugins
const manager = PluginManager.getInstance();
const suite = new PluginTestSuite();

async function initPlugins() {
  try {
    if (manager.listPlugins().length === 0) {
      console.log("[PluginSystem] Pre-loading enterprise sample plugins...");
      await manager.registerPlugin(new ColorPaletteGeneratorPlugin());
      await manager.registerPlugin(new DesignCriticPlugin());
      await manager.registerPlugin(new PosterGeneratorPlugin());
      console.log("[PluginSystem] Sample plugins pre-loaded successfully.");
    }
  } catch (err) {
    console.error("[PluginSystem] Failed to pre-load sample plugins:", err);
  }
}

initPlugins();

/**
 * Enterprise JWT verification middleware
 */
export async function authenticateToken(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // We allow standard default sandbox access if header is missing, mapping to usr_admin
    req.userId = "usr_admin";
    req.userEmail = "shukriaprinters@gmail.com";
    req.userRole = "lead-designer";
    return next();
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const user = await DI.services.auth.verifyToken(token);
    if (!user) {
      return res.status(401).json({ success: false, error: "Access token is invalid or expired." });
    }
    req.userId = user.id;
    req.userEmail = user.email;
    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Unauthorized access" });
  }
}

// REST API logs monitoring endpoint
router.get("/logs", async (req, res) => {
  try {
    const logs = await DI.repositories.audit.getLogs({});
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth Routes
router.post("/auth/register", (req, res) => authCtrl.register(req, res));
router.post("/auth/login", (req, res) => authCtrl.login(req, res));
router.get("/auth/me", authenticateToken, (req, res) => authCtrl.getMe(req, res));
router.post("/auth/logout", authenticateToken, (req, res) => authCtrl.logout(req, res));

// Project / Canvas Routes
router.get("/projects", authenticateToken, (req, res) => projCtrl.listProjects(req, res));
router.post("/project/create", authenticateToken, (req, res) => projCtrl.createProject(req, res));
router.post("/project/open", authenticateToken, (req, res) => projCtrl.openProject(req, res));
router.post("/project/save", authenticateToken, (req, res) => projCtrl.saveProject(req, res));
router.post("/canvas/create", authenticateToken, (req, res) => projCtrl.createPage(req, res));

// Resource Catalogs
router.get("/assets", (req, res) => projCtrl.listAssets(req, res));
router.get("/templates", (req, res) => projCtrl.listTemplates(req, res));
router.get("/plugins", (req, res) => projCtrl.listPlugins(req, res));

// Legacy Compat Operations (Layer, Asset Upload, Export, Chat)
router.post("/layer/create", authenticateToken, async (req, res) => {
  try {
    const { projectId, type, content, name } = req.body;
    if (!projectId || !type) {
      return res.status(400).json({ success: false, error: "ProjectId and Type are required" });
    }
    const page = await DI.repositories.project.findPagesByProjectId(projectId);
    const pageId = page[0]?.id || "page_default";
    const newLayer = await DI.repositories.layer.createLayer({
      projectId,
      pageId,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      type,
      parentId: null,
      x: 50,
      y: 50,
      width: type === "text" ? 40 : 25,
      height: type === "text" ? 8 : 25,
      opacity: 1,
      blendMode: "normal",
      visibility: true,
      locked: false,
      content: content || "",
      fontSize: type === "text" ? 20 : undefined,
      fontFamily: type === "text" ? "Inter" : undefined,
      color: type === "text" ? "#000000" : undefined,
      align: type === "text" ? "center" : undefined
    });
    res.status(201).json({ success: true, layer: newLayer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/layer/update", authenticateToken, async (req, res) => {
  try {
    const { layerId, updates } = req.body;
    if (!layerId || !updates) {
      return res.status(400).json({ success: false, error: "Layer ID and updates are required" });
    }
    const updated = await DI.repositories.layer.updateLayer(layerId, updates);
    res.json({ success: true, layer: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/asset/upload", authenticateToken, async (req, res) => {
  try {
    const { name, type, url, sizeBytes, mimeType } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, error: "Asset name and URL are required" });
    }
    const userId = (req as any).user?.userId || "usr_admin";
    const newAsset = await DI.repositories.asset.saveAsset({
      name,
      type: type || "image",
      url,
      sizeBytes: Number(sizeBytes) || 1024,
      mimeType: mimeType || "image/png",
      userId
    });
    res.status(201).json({ success: true, asset: newAsset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/export", authenticateToken, async (req, res) => {
  try {
    const { projectId, format } = req.body;
    if (!projectId || !format) {
      return res.status(400).json({ success: false, error: "ProjectId and format are required" });
    }
    const exportId = `export_${Math.random().toString(36).substring(2, 9)}`;
    const newExport = {
      id: exportId,
      projectId,
      format,
      url: `/exports/${exportId}.${format}`,
      status: "completed",
      sizeBytes: 154200,
      createdAt: new Date().toISOString()
    };
    res.status(201).json({ success: true, export: newExport });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/chat", authenticateToken, (req, res) => aiCtrl.chat(req, res));

// AI Copilot Gateway Routes
router.post("/ai/layout", authenticateToken, (req, res) => aiCtrl.generateLayout(req, res));
router.post("/ai/analyze", authenticateToken, (req, res) => aiCtrl.analyzeVisuals(req, res));
router.post("/ai/chat", authenticateToken, (req, res) => aiCtrl.chat(req, res));

// Plugin & SDK Platform Routes
router.get("/plugins/list", async (req, res) => {
  try {
    const list = manager.listPlugins().map(p => ({
      manifest: p.manifest,
      status: p.status
    }));
    res.json({ success: true, plugins: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/plugins/toggle", authenticateToken, async (req, res) => {
  try {
    const { id, active } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "Plugin ID is required." });
    
    if (active) {
      await manager.activatePlugin(id);
    } else {
      await manager.deactivatePlugin(id);
    }
    res.json({ success: true, status: manager.getPlugin(id)?.status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/plugins/tools", async (req, res) => {
  try {
    const tools = ToolRegistry.getInstance().listTools().map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      pluginId: t.pluginId,
      inputSchema: t.inputSchema,
      outputSchema: t.outputSchema
    }));
    res.json({ success: true, tools });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/plugins/command", authenticateToken, async (req, res) => {
  try {
    const { pluginId, commandId, args } = req.body;
    if (!pluginId || !commandId) {
      return res.status(400).json({ success: false, error: "Plugin ID and Command ID are required." });
    }
    
    const plugin = manager.getPlugin(pluginId);
    if (!plugin) return res.status(404).json({ success: false, error: "Plugin not found." });
    
    const pAsAny = plugin as any;
    if (typeof pAsAny.onCommandCall !== "function") {
      return res.status(400).json({ success: false, error: "Plugin does not implement command receiver execution." });
    }
    
    const result = await pAsAny.onCommandCall(commandId, args);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/plugins/mcp", async (req, res) => {
  try {
    const response = await MCPAdapter.getInstance().handleMCPRequest(req.body);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: { code: -32603, message: err.message } });
  }
});

router.post("/plugins/run-tests", async (req, res) => {
  try {
    const testResults = await suite.runAllTests();
    const passed = testResults.filter(r => r.status === "passed").length;
    const failed = testResults.filter(r => r.status === "failed").length;
    res.json({
      success: true,
      summary: {
        total: testResults.length,
        passed,
        failed
      },
      results: testResults
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Enterprise AI Routing & Creative Director Routes
const aiSuite = new AiTestSuite();

router.get("/ai-platform/models", async (req, res) => {
  try {
    const list = ProviderRegistry.getInstance().listAllCapabilities();
    res.json({ success: true, models: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/ai-platform/route", authenticateToken, async (req, res) => {
  try {
    const { prompt, category, strategy, preferredLanguage } = req.body;
    if (!prompt || !category) {
      return res.status(400).json({ success: false, error: "Prompt and category are required." });
    }
    const data = await AiGateway.getInstance().executePipeline(
      prompt,
      category,
      strategy || "balanced",
      preferredLanguage
    );
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/ai-platform/direct", authenticateToken, async (req, res) => {
  try {
    const { instruction, referenceImageUrl } = req.body;
    if (!instruction) {
      return res.status(400).json({ success: false, error: "Instruction is required." });
    }
    const designPlan = await CreativeDirector.getInstance().orchestrateDesignSession(
      instruction,
      referenceImageUrl
    );
    res.json({ success: true, designPlan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/ai-platform/run-tests", async (req, res) => {
  try {
    const results = await aiSuite.runAllTests();
    const passed = results.filter(r => r.status === "passed").length;
    const failed = results.filter(r => r.status === "failed").length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/ai-platform/telemetry", async (req, res) => {
  try {
    const logs = AiGateway.getInstance().getTelemetryLogs();
    res.json({ success: true, telemetry: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- COGNITIVE FOUNDATION ENDPOINTS ---

router.get("/cognitive/metrics", async (req, res) => {
  try {
    const metrics = cognitiveSdk.getMetrics();
    res.json({ success: true, metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/cognitive/run-tests", async (req, res) => {
  try {
    const results = await cognitiveTestSuite.runAllTests();
    const passed = results.filter(r => r.status === "passed").length;
    const failed = results.filter(r => r.status === "failed").length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/cognitive/preferences", async (req, res) => {
  try {
    const userId = req.query.userId as string || "usr_admin";
    const projectId = req.query.projectId as string || null;
    const preferences = cognitiveSdk.preferences.get(userId, projectId);
    res.json({ success: true, preferences });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/cognitive/preferences/update", async (req, res) => {
  try {
    const { userId, updates } = req.body;
    if (!userId || !updates) {
      return res.status(400).json({ success: false, error: "userId and updates are required." });
    }
    const preferences = cognitiveSdk.preferences.update(userId, updates);
    res.json({ success: true, preferences });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/cognitive/memory/create", async (req, res) => {
  try {
    const { userId, projectId, category, tags, key, value, importance, confidence, sourceAttribution, expiresAt } = req.body;
    if (!userId || !category || !key || value === undefined) {
      return res.status(400).json({ success: false, error: "userId, category, key, and value are required." });
    }
    const memory = cognitiveSdk.memory.create({
      userId,
      projectId: projectId || null,
      category,
      tags: tags || [],
      key,
      value,
      importance: importance || 3,
      confidence: confidence || 1.0,
      sourceAttribution: sourceAttribution || "api_create",
      expiresAt: expiresAt || null
    });
    res.json({ success: true, memory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/cognitive/memory/search", async (req, res) => {
  try {
    const { text, category, projectId, tags, importanceMin, confidenceMin, limit } = req.body;
    const results = cognitiveSdk.memory.search({
      text,
      category,
      projectId,
      tags,
      importanceMin,
      confidenceMin,
      limit
    });
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/cognitive/graph/trace", async (req, res) => {
  try {
    const nodeId = req.query.nodeId as string;
    const maxDepth = req.query.maxDepth ? parseInt(req.query.maxDepth as string, 10) : 2;
    if (!nodeId) {
      return res.status(400).json({ success: false, error: "nodeId query parameter is required." });
    }
    const paths = cognitiveSdk.graph.traceNeighbors(nodeId, maxDepth);
    res.json({ success: true, paths });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- VISUAL INTELLIGENCE ARCHITECTURE ENDPOINTS ---

router.post("/vision/upload", async (req, res) => {
  try {
    const { base64Data, fileName, priority } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data parameter is required for visual vector streams" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "canvas_asset.png";
    const jobId = VisionQueue.getInstance().submitJob(buf, name, priority || "normal");
    res.json({ success: true, jobId, message: "Asset uploaded and dispatched to Visual Intelligence priority queue." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/analyze", async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data parameter is required for synchronous analysis" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "asset_draft.png";
    const analysis = await MultimodalOrchestrator.getInstance().analyzeVisualAsset(buf, name);
    res.json({ success: true, analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/queue/submit", async (req, res) => {
  try {
    const { base64Data, fileName, priority } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data parameter is required to queue a job" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "composition.png";
    const jobId = VisionQueue.getInstance().submitJob(buf, name, priority || "normal");
    res.json({ success: true, jobId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/queue/jobs", async (req, res) => {
  try {
    const jobs = VisionQueue.getInstance().listJobs();
    const queueLength = VisionQueue.getInstance().getQueueLength();
    res.json({ success: true, queueLength, jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/queue/job/:jobId", async (req, res) => {
  try {
    const job = VisionQueue.getInstance().getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: "Vision job not found." });
    }
    res.json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/queue/job/:jobId/cancel", async (req, res) => {
  try {
    const success = VisionQueue.getInstance().cancelJob(req.params.jobId);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/re-analyze", async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, error: "jobId is required for re-analysis" });
    }
    const previousJob = VisionQueue.getInstance().getJob(jobId);
    if (!previousJob || !previousJob.result) {
      return res.status(400).json({ success: false, error: "Completed previous visual package not found" });
    }
    
    // Create a new analysis job based on the metadata specifications of the old one
    const dummyBuffer = Buffer.from("<svg width='1080' height='1080'></svg>");
    const newJobId = VisionQueue.getInstance().submitJob(
      dummyBuffer,
      `re_analyzed_${previousJob.originalFileName}`,
      "high"
    );
    res.json({ success: true, newJobId, message: "Re-analysis triggered in high-priority loop." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/version-compare", async (req, res) => {
  try {
    const { jobA, jobB } = req.body;
    if (!jobA || !jobB) {
      return res.status(400).json({ success: false, error: "Both jobA and jobB parameters are required for comparative version audits" });
    }
    const resultA = VisionQueue.getInstance().getJob(jobA)?.result;
    const resultB = VisionQueue.getInstance().getJob(jobB)?.result;

    if (!resultA || !resultB) {
      return res.status(404).json({ success: false, error: "Could not locate completed visual packages for specified Job IDs" });
    }

    const colorAdded = resultB.colors.filter(cb => !resultA.colors.some(ca => ca.hex === cb.hex));
    const textChanges = resultB.typography.filter(tb => !resultA.typography.some(ta => ta.text === tb.text));

    const diff = {
      timestamp: new Date().toISOString(),
      fileA: resultA.targetFileName,
      fileB: resultB.targetFileName,
      docTypeChanged: resultA.documentType !== resultB.documentType,
      typeA: resultA.documentType,
      typeB: resultB.documentType,
      colorDiffCount: colorAdded.length,
      textDiffCount: textChanges.length,
      addedColors: colorAdded.map(c => c.hex),
      addedText: textChanges.map(t => t.text),
      confidenceShift: parseFloat((resultB.confidenceScore - resultA.confidenceScore).toFixed(2))
    };

    res.json({ success: true, diff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/metrics", async (req, res) => {
  try {
    const qLen = VisionQueue.getInstance().getQueueLength();
    const metrics = MultimodalOrchestrator.getInstance().getSystemMetrics(qLen);
    res.json({ success: true, metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/run-tests", async (req, res) => {
  try {
    const results = await visionTestSuite.runAllTests();
    const passed = results.filter(r => r.status === "passed").length;
    const failed = results.filter(r => r.status === "failed").length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MULTIMODAL PERCEPTION PIPELINE ENDPOINTS (PHASE 2.1.3) ---

router.post("/vision/perception/analyze", async (req, res) => {
  try {
    const { base64Data, fileName, isReference } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data is required for multimodal perception" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "perception_draft.png";
    const report = await PerceptionPipeline.getInstance().executePerceptionPipeline(buf, name, !!isReference);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/perception/adapters", async (req, res) => {
  try {
    const adapters = PerceptionPipeline.getInstance().getAdapters();
    const metrics = PerceptionPipeline.getInstance().getPipelineMetrics();
    res.json({ success: true, adapters, metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/perception/adapters/toggle", async (req, res) => {
  try {
    const { id, health } = req.body;
    if (!id || !health) {
      return res.status(400).json({ success: false, error: "id and health parameters are required" });
    }
    PerceptionPipeline.getInstance().updateAdapterHealth(id, health);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/perception/telemetry", async (req, res) => {
  try {
    const telemetry = PerceptionPipeline.getInstance().getTelemetry();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- PHASE 2.1.4 OCR, SCRIPT, TYPOGRAPHY & CALLIGRAPHY ENDPOINTS ---

router.post("/vision/ocr/start", async (req, res) => {
  try {
    const { base64Data, fileName, isReference } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data is required for OCR analysis" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "ocr_draft.png";
    const report = await ocrEngine.startOcr(buf, name, !!isReference);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/ocr/detect-script", async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data is required" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "script_draft.png";
    const result = await ocrEngine.detectScript(buf, name);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/ocr/typography", async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data is required" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "typography_draft.png";
    const typography = await ocrEngine.analyzeTypography(buf, name);
    res.json({ success: true, typography });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/ocr/calligraphy", async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data is required" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "calligraphy_draft.png";
    const calligraphy = await ocrEngine.analyzeCalligraphy(buf, name);
    res.json({ success: true, calligraphy });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/ocr/report/:id", async (req, res) => {
  try {
    const report = await ocrEngine.getOcrReport(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/ocr/correct", async (req, res) => {
  try {
    const { reportId, customCorrections } = req.body;
    if (!reportId || !customCorrections) {
      return res.status(400).json({ success: false, error: "reportId and customCorrections are required" });
    }
    const report = await ocrEngine.correctOcrText(reportId, customCorrections);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/ocr/compare", async (req, res) => {
  try {
    const { reportA, reportB } = req.body;
    if (!reportA || !reportB) {
      return res.status(400).json({ success: false, error: "Both reportA and reportB summaries are required" });
    }
    const comparison = await ocrEngine.compareTypographyReports(reportA, reportB);
    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/ocr/adapters", async (req, res) => {
  try {
    const adapters = ocrEngine.getAdapters();
    res.json({ success: true, adapters });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/ocr/adapters/toggle", async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, error: "id and status parameters are required" });
    }
    ocrEngine.updateAdapterHealth(id, status);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/ocr/telemetry", async (req, res) => {
  try {
    const telemetry = ocrEngine.getTelemetry();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- LAYOUT INTELLIGENCE & COMPOSITION ANALYSIS ENGINE ENDPOINTS ---

router.post("/vision/layout/analyze", async (req, res) => {
  try {
    const { category, canvasWidth, canvasHeight, layers } = req.body;
    if (!category || !canvasWidth || !canvasHeight || !Array.isArray(layers)) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: category, canvasWidth, canvasHeight, and layers (array) are required"
      });
    }

    const report = LayoutIntelligenceEngine.analyzeLayout(category, Number(canvasWidth), Number(canvasHeight), layers);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/layout/reconstruct", async (req, res) => {
  try {
    const { category, canvas } = req.body;
    if (!category || !canvas) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: category and canvas metadata are required"
      });
    }

    const reconstruction = LayoutIntelligenceEngine.reconstructLayout(category, canvas);
    res.json({ success: true, reconstruction });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/layout/compare", async (req, res) => {
  try {
    const { layers, targetPreset } = req.body;
    if (!Array.isArray(layers) || !targetPreset) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: layers (array) and targetPreset (string) are required"
      });
    }

    const comparison = LayoutIntelligenceEngine.compareLayouts(layers, targetPreset);
    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/layout/telemetry", async (req, res) => {
  try {
    const telemetry = LayoutIntelligenceTelemetry.get();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/layout/run-tests", async (req, res) => {
  try {
    const results = LayoutEngineTestSuite.runAll();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- COLOR INTELLIGENCE, PATTERN & TEXTURE ANALYSIS ENGINE ENDPOINTS (PHASE 2.1.6) ---

router.post("/vision/color/analyze", async (req, res) => {
  try {
    const { category, palette } = req.body;
    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: category is required"
      });
    }

    const report = ColorIntelligenceEngine.analyzeColors(category, palette);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/color/compare", async (req, res) => {
  try {
    const { reportA, reportB } = req.body;
    if (!reportA || !reportB) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: reportA and reportB are required"
      });
    }

    const comparison = ColorIntelligenceEngine.compareColorReports(reportA, reportB);
    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/color/telemetry", async (req, res) => {
  try {
    const telemetry = ColorIntelligenceTelemetry.getMetrics();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/color/run-tests", async (req, res) => {
  try {
    const results = ColorEngineTestSuite.runAll();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- REFERENCE DESIGN INTELLIGENCE & STYLE REASONING SYSTEM ENDPOINTS (PHASE 2.1.7) ---

router.post("/vision/reference/analyze", async (req, res) => {
  try {
    const { designType, style } = req.body;
    if (!designType) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: designType is required"
      });
    }

    const report = ReferenceIntelligenceEngine.analyzeReference(designType, style);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/reference/compare", async (req, res) => {
  try {
    const { reportA, reportB } = req.body;
    if (!reportA || !reportB) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: reportA and reportB are required"
      });
    }

    const comparison = ReferenceIntelligenceEngine.compareReferences(reportA, reportB);
    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/reference/telemetry", async (req, res) => {
  try {
    const telemetry = ReferenceIntelligenceTelemetry.getMetrics();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/reference/run-tests", async (req, res) => {
  try {
    const results = ReferenceEngineTestSuite.runAll();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- EDITABLE LAYER RECONSTRUCTION & WORKSPACE INTELLIGENCE ENDPOINTS (PHASE 2.1.8) ---

router.post("/vision/workspace/reconstruct", async (req, res) => {
  try {
    const { designType } = req.body;
    if (!designType) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: designType is required"
      });
    }

    const doc = WorkspaceIntelligenceEngine.reconstructWorkspace(designType);
    res.json({ success: true, doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/vision/workspace/telemetry", async (req, res) => {
  try {
    const telemetry = WorkspaceIntelligenceTelemetry.getMetrics();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/vision/workspace/run-tests", async (req, res) => {
  try {
    const results = WorkspaceEngineTestSuite.runAll();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- DESIGN BRAIN COGNITIVE SYSTEM ENDPOINTS (PHASE 2.1.9) ---

router.post("/brain/plan", async (req, res) => {
  try {
    const { rawRequest, preferredStyle } = req.body;
    if (!rawRequest) {
      return res.status(400).json({
        success: false,
        error: "Missing parameter: rawRequest is required"
      });
    }
    const report = DesignBrain.createDesignPlan(rawRequest, preferredStyle);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/brain/revise", async (req, res) => {
  try {
    const { currentReport, feedback } = req.body;
    if (!currentReport || !feedback) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters: currentReport and feedback are required"
      });
    }
    const report = DesignBrain.reviseDesignPlan(currentReport, feedback);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/brain/telemetry", async (req, res) => {
  try {
    const telemetry = DesignBrainTelemetry.getMetrics();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/brain/run-tests", async (req, res) => {
  try {
    const results = DesignBrainTestSuite.runAll();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AI CREATIVE DIRECTOR & DESIGN CRITIQUE ENGINE ENDPOINTS (PHASE 2.1.10) ---

router.post("/creative-director/review", async (req, res) => {
  try {
    const { blueprint, targetAudience } = req.body;
    if (!blueprint) {
      return res.status(400).json({ success: false, error: "Missing blueprint parameter" });
    }
    const report = CreativeDirectorEngine.reviewBlueprint(blueprint, targetAudience || "General Public");
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/creative-director/improve", async (req, res) => {
  try {
    const { blueprint, maxIterations } = req.body;
    if (!blueprint) {
      return res.status(400).json({ success: false, error: "Missing blueprint parameter" });
    }
    const result = CreativeDirectorEngine.improveBlueprint(blueprint, maxIterations || 3);
    res.json({ success: true, optimizedBlueprint: result.optimizedBlueprint, report: result.finalReport });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/creative-director/compare", async (req, res) => {
  try {
    const { concepts } = req.body;
    if (!concepts || !Array.isArray(concepts)) {
      return res.status(400).json({ success: false, error: "Missing concepts array parameter" });
    }
    const comparison = CreativeDirectorEngine.compareConcepts(concepts);
    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/creative-director/telemetry", async (req, res) => {
  try {
    const telemetry = CreativeDirectorTelemetry.getMetrics();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/creative-director/run-tests", async (req, res) => {
  try {
    const results = CreativeDirectorTestSuite.runAll();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- COGNITIVE INTELLIGENCE ORCHESTRATOR ENDPOINTS (PHASE 2.1) ---

router.post("/orchestrator/plan", async (req, res) => {
  try {
    const { userIntent, requestDetails } = req.body;
    if (!userIntent) {
      return res.status(400).json({ success: false, error: "Missing userIntent parameter" });
    }
    const orchestrator = IntelligenceOrchestrator.getInstance();
    const graph = orchestrator.planWorkflow(userIntent, requestDetails || {});
    res.json({ success: true, graph });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/orchestrator/execute", async (req, res) => {
  try {
    const { graph } = req.body;
    if (!graph) {
      return res.status(400).json({ success: false, error: "Missing graph parameter" });
    }
    const orchestrator = IntelligenceOrchestrator.getInstance();
    const fusion = await orchestrator.executeWorkflow(graph, () => {});
    res.json({ success: true, fusion });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/orchestrator/telemetry", async (req, res) => {
  try {
    const telemetry = OrchestratorTelemetry.getMetrics();
    res.json({ success: true, telemetry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/orchestrator/run-tests", async (req, res) => {
  try {
    const results = await IntelligenceOrchestratorTestSuite.runAll();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MULTI-MODEL GENERATION ORCHESTRATOR ENDPOINTS (PHASE 2.1) ---

router.post("/generation/plan", async (req, res) => {
  try {
    const { type, prompt, quality, options } = req.body;
    if (!type || !prompt || !quality) {
      return res.status(400).json({ success: false, error: "Missing required parameters (type, prompt, quality)" });
    }
    const orchestrator = MultiModelGenerationOrchestrator.getInstance();
    const job = orchestrator.planGeneration(type, prompt, quality, options || {});
    res.json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/generation/execute", async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, error: "Missing jobId parameter" });
    }
    const orchestrator = MultiModelGenerationOrchestrator.getInstance();
    const result = await orchestrator.executeGeneration(jobId, () => {});
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/generation/jobs", async (req, res) => {
  try {
    const orchestrator = MultiModelGenerationOrchestrator.getInstance();
    const jobs = orchestrator.getActiveJobs();
    res.json({ success: true, jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/generation/run-tests", async (req, res) => {
  try {
    const results = await MultiModelGenerationTestSuite.runAll();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- UNIVERSAL DESIGN PROMPT COMPILER & BLUEPRINT COMPILER ENDPOINTS (PHASE 2.2) ---

router.post("/compiler/compile-prompt", async (req, res) => {
  try {
    const { prompt, brandContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Missing prompt parameter" });
    }
    const compiler = UniversalPromptCompiler.getInstance();
    const intent = compiler.compilePromptToIntent(prompt, brandContext);
    res.json({ success: true, intent });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/compiler/generate-variants", async (req, res) => {
  try {
    const { intent } = req.body;
    if (!intent) {
      return res.status(400).json({ success: false, error: "Missing intent parameter" });
    }
    const variantEngine = CreativeVariantEngine.getInstance();
    const variants = variantEngine.generateVariants(intent);
    res.json({ success: true, variants });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/compiler/compile-blueprint", async (req, res) => {
  try {
    const { intent, variant } = req.body;
    if (!intent || !variant) {
      return res.status(400).json({ success: false, error: "Missing intent or variant parameter" });
    }
    const blueprintCompiler = BlueprintCompiler.getInstance();
    const blueprint = blueprintCompiler.compileIntentToBlueprint(intent, variant);
    res.json({ success: true, blueprint });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/compiler/compile-dsl", async (req, res) => {
  try {
    const { intent, blueprint, variant } = req.body;
    if (!intent || !blueprint || !variant) {
      return res.status(400).json({ success: false, error: "Missing intent, blueprint, or variant parameter" });
    }
    const dslCompiler = DesignSpecificationDSLCompiler.getInstance();
    const dsl = dslCompiler.compileToDSL(intent, blueprint, variant);
    const contract = dslCompiler.compileToContract(intent, dsl, variant);
    res.json({ success: true, dsl, contract });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/compiler/run-tests", async (req, res) => {
  try {
    const results = await DesignCompilerTestSuite.runAllTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- NEORA DESIGN GENERATION ENGINE (NDGE) ENDPOINTS (PHASE 2.3) ---

router.post("/ndge/generate-workspace", async (req, res) => {
  try {
    const { dsl, variant } = req.body;
    if (!dsl) {
      return res.status(400).json({ success: false, error: "Missing dsl parameter" });
    }
    const engine = NeoraDesignGenerationEngine.getInstance();
    const doc = await engine.generateWorkspace(dsl, variant);
    res.json({ success: true, workspace: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/ndge/export", async (req, res) => {
  try {
    const { workspace, format } = req.body;
    if (!workspace || !format) {
      return res.status(400).json({ success: false, error: "Missing workspace or format parameter" });
    }
    const engine = NeoraDesignGenerationEngine.getInstance();
    const result = await engine.exportEngine.exportToFormat(workspace, format);
    res.json({ success: true, exportResult: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/ndge/plugins", async (req, res) => {
  try {
    const engine = NeoraDesignGenerationEngine.getInstance();
    const plugins = engine.getPlugins();
    res.json({ success: true, plugins });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/ndge/run-tests", async (req, res) => {
  try {
    const results = await NDGETestSuite.runAllTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- IMAGE INGESTION PIPELINE ENDPOINTS (PHASE 2.1.2) ---

router.post("/ingestion/submit", async (req, res) => {
  try {
    const { base64Data, fileName, priority } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: "base64Data is required" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const name = fileName || "uploaded_asset.png";
    const jobId = await ingestionQueue.submitAsset(name, buf, priority || "normal");
    res.json({ success: true, jobId, message: "Asset received and queued in sandboxed processing pipeline" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/ingestion/reprocess", async (req, res) => {
  try {
    const { jobId, base64Data } = req.body;
    if (!jobId || !base64Data) {
      return res.status(400).json({ success: false, error: "jobId and base64Data are required" });
    }
    const buf = Buffer.from(base64Data, "base64");
    const ok = await ingestionQueue.reprocessAsset(jobId, buf);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/ingestion/jobs", async (req, res) => {
  try {
    const jobs = ingestionQueue.getJobs();
    res.json({ success: true, jobs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/ingestion/metrics", async (req, res) => {
  try {
    const metrics = ingestionQueue.getMetrics();
    res.json({ success: true, metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/ingestion/run-tests", async (req, res) => {
  try {
    const suite = new IngestionTestSuite();
    const results = await suite.runAllTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- NEORA UNIVERSAL EDITABLE WORKSPACE ENGINE (NUWE) ENDPOINTS (PHASE 2.4) ---

router.get("/nuwe/active", (req, res) => {
  try {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    const doc = engine.getActiveWorkspace();
    res.json({ success: true, workspace: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/nuwe/create", (req, res) => {
  try {
    const { name, prompt, width, height } = req.body;
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    const doc = engine.createNewWorkspace(name || "Untitled Creative Board", prompt || "Default Folk Alpona Composition", width || 1080, height || 1080);
    res.json({ success: true, workspace: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/nuwe/action", (req, res) => {
  try {
    const { actionType, payload } = req.body;
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    
    switch (actionType) {
      case "add-layer":
        engine.addLayer(payload.name);
        break;
      case "delete-layer":
        engine.deleteLayer(payload.layerId);
        break;
      case "move-layer":
        engine.moveLayer(payload.layerId, payload.direction);
        break;
      case "toggle-visibility":
        engine.toggleLayerVisibility(payload.layerId);
        break;
      case "toggle-lock":
        engine.toggleLayerLock(payload.layerId);
        break;
      case "update-object":
        engine.updateObjectProperty(payload.layerId, payload.objectId, payload.key, payload.value);
        break;
      case "undo":
        engine.undo();
        break;
      case "redo":
        engine.redo();
        break;
      default:
        return res.status(400).json({ success: false, error: "Unsupported actionType" });
    }

    res.json({ success: true, workspace: engine.getActiveWorkspace() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/nuwe/ai-command", async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ success: false, error: "Missing command parameter" });
    }
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    const result = await engine.executeConversationalAiCommand(command);
    res.json({ success: result.success, feedbackMsg: result.feedbackMsg, workspace: engine.getActiveWorkspace() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/nuwe/analyze", (req, res) => {
  try {
    const engine = NeoraUniversalEditableWorkspaceEngine.getInstance();
    const analysis = engine.analyzeWorkspacePerformance();
    res.json({ success: true, analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/nuwe/run-tests", async (req, res) => {
  try {
    const results = await NUWETestSuite.runAllTests();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    res.json({
      success: true,
      summary: {
        total: results.length,
        passed,
        failed
      },
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// NEORA IMAGE EDITING & GENERATIVE PLATFORM (NGEP) API CONTRACTS
// ===================================================================
import { NGEP } from "../../lib/ai/cognitive/NGEP";

// 1. AnalyzeImage
router.post("/ngep/analyze", async (req, res) => {
  try {
    const { layerId } = req.body;
    const engine = NGEP.getInstance();
    const audit = engine.runQualityAudit();
    res.json({
      success: true,
      layerId,
      message: "Analyzed image layers, perspective grid, and visual contrast successfully.",
      audit
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. CreateMask
router.post("/ngep/mask", async (req, res) => {
  try {
    const { layerId, type, feather } = req.body;
    if (!layerId) return res.status(400).json({ success: false, error: "layerId is required" });
    const engine = NGEP.getInstance();
    engine.generateSmartMask(layerId, type || "foreground", feather || 8);
    res.json({
      success: true,
      state: engine.getProjectState(),
      message: `Created smart ${type} selection mask with feather: ${feather}px.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. ApplyEdit
router.post("/ngep/edit", async (req, res) => {
  try {
    const { layerId, adjustment } = req.body;
    if (!layerId || !adjustment) {
      return res.status(400).json({ success: false, error: "layerId and adjustment object are required" });
    }
    const engine = NGEP.getInstance();
    engine.applyAdjustment(layerId, adjustment);
    res.json({
      success: true,
      state: engine.getProjectState(),
      message: "Applied non-destructive layer adjustment parameter safely."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. UndoEdit
router.post("/ngep/undo", async (req, res) => {
  try {
    const engine = NGEP.getInstance();
    engine.undo();
    res.json({
      success: true,
      state: engine.getProjectState(),
      message: "Undo command completed."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. RedoEdit
router.post("/ngep/redo", async (req, res) => {
  try {
    const engine = NGEP.getInstance();
    engine.redo();
    res.json({
      success: true,
      state: engine.getProjectState(),
      message: "Redo command completed."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GenerateFill & 7. ExpandCanvas
router.post("/ngep/fill", async (req, res) => {
  try {
    const { layerId, prompt, expandMode } = req.body;
    if (!layerId || !prompt) {
      return res.status(400).json({ success: false, error: "layerId and prompt are required" });
    }
    const engine = NGEP.getInstance();
    const result = await engine.performGenerativeFill(layerId, prompt, !!expandMode);
    res.json({
      success: true,
      layerId: result.layerId,
      state: engine.getProjectState(),
      message: expandMode ? "Canvas expanded outpaint completed." : "Generative inpaint completed successfully."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. ReplaceObject
router.post("/ngep/replace", async (req, res) => {
  try {
    const { layerId, targetObject, replacement } = req.body;
    if (!layerId || !targetObject || !replacement) {
      return res.status(400).json({ success: false, error: "Missing layerId, targetObject, or replacement prompt" });
    }
    const engine = NGEP.getInstance();
    const result = await engine.performGenerativeFill(layerId, `Replace ${targetObject} with ${replacement}`, false);
    res.json({
      success: true,
      layerId: result.layerId,
      state: engine.getProjectState(),
      message: `Successfully replaced ${targetObject} with ${replacement}.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. RestoreImage
router.post("/ngep/restore", async (req, res) => {
  try {
    const { layerId, restorationType } = req.body;
    if (!layerId || !restorationType) {
      return res.status(400).json({ success: false, error: "layerId and restorationType are required" });
    }
    const engine = NGEP.getInstance();
    const result = await engine.performAiRestoration(layerId, restorationType);
    res.json({
      success: true,
      qualityScore: result.qualityScore,
      state: engine.getProjectState(),
      message: `Image layer successfully processed with neural ${restorationType} restoration.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. ExportProject
router.post("/ngep/export", async (req, res) => {
  try {
    const engine = NGEP.getInstance();
    const state = engine.getProjectState();
    res.json({
      success: true,
      exportUrl: "https://ais-dev-qwrnlnkrfbvntjfvwzgvqw-605425403829.asia-east1.run.app/exports/project-ngep-archived.zip",
      layersCount: state.layers.length,
      message: "Packaged active non-destructive project parameters and layers as editable package ZIP."
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
