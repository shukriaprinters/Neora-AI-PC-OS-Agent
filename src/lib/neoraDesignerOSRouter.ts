import { Router } from "express";
import crypto from "node:crypto";
import { readDatabase, writeDatabase, Project, Page, Layer, Asset, Export, Template, PluginRegistry } from "./neoraDesignerOSStore";

const router = Router();

// REST API logging helper
const apiLogs: string[] = [];
function logRequest(api: string, body: any, status: number, details: string) {
  const logStr = `[${new Date().toISOString()}] ${api} - Status: ${status} | Body: ${JSON.stringify(body).slice(0, 80)}... | Info: ${details}`;
  apiLogs.unshift(logStr);
  if (apiLogs.length > 100) apiLogs.pop();
}

router.get("/logs", (req, res) => {
  res.json({ logs: apiLogs });
});

// GET /projects
router.get("/projects", (req, res) => {
  const db = readDatabase();
  logRequest("GET /projects", {}, 200, `Fetched ${db.projects.length} projects`);
  res.json({ success: true, projects: db.projects });
});

// GET /templates
router.get("/templates", (req, res) => {
  const db = readDatabase();
  logRequest("GET /templates", {}, 200, `Fetched ${db.templates.length} templates`);
  res.json({ success: true, templates: db.templates });
});

// GET /assets
router.get("/assets", (req, res) => {
  const db = readDatabase();
  logRequest("GET /assets", {}, 200, `Fetched ${db.assets.length} assets`);
  res.json({ success: true, assets: db.assets });
});

// GET /plugins
router.get("/plugins", (req, res) => {
  const db = readDatabase();
  logRequest("GET /plugins", {}, 200, `Fetched ${db.pluginRegistry.length} plugins`);
  res.json({ success: true, plugins: db.pluginRegistry });
});

// POST /project/create
router.post("/project/create", (req, res) => {
  const { name, description, width, height } = req.body;
  if (!name) {
    logRequest("POST /project/create", req.body, 400, "Validation failed: missing name");
    return res.status(400).json({ success: false, error: "Project name is required" });
  }

  const db = readDatabase();
  const projectId = `proj_${crypto.randomBytes(4).toString("hex")}`;
  const pageId = `page_${crypto.randomBytes(4).toString("hex")}`;
  
  const newProject: Project = {
    id: projectId,
    name,
    description: description || "",
    userId: "usr_admin",
    width: Number(width) || 800,
    height: Number(height) || 800,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const newPage: Page = {
    id: pageId,
    projectId: projectId,
    pageNumber: 1,
    title: "Page 1",
    backgroundType: "color",
    backgroundValue: "#ffffff",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add a sample base layer so it's not empty
  const defaultTextLayer: Layer = {
    id: `layer_${crypto.randomBytes(4).toString("hex")}`,
    pageId,
    projectId,
    name: "Header Layer",
    type: "text",
    parentId: null,
    x: 50,
    y: 50,
    width: 60,
    height: 10,
    opacity: 1,
    blendMode: "normal",
    visibility: true,
    locked: false,
    content: "Tap to write design briefing...",
    fontSize: 24,
    fontFamily: "Space Grotesk",
    color: "#0f172a",
    fontWeight: "bold",
    align: "center",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.push(newProject);
  db.pages.push(newPage);
  db.layers.push(defaultTextLayer);
  writeDatabase(db);

  logRequest("POST /project/create", req.body, 201, `Project ${projectId} created`);
  res.status(201).json({ success: true, project: newProject, page: newPage, layers: [defaultTextLayer] });
});

// POST /project/open
router.post("/project/open", (req, res) => {
  const { projectId } = req.body;
  if (!projectId) {
    logRequest("POST /project/open", req.body, 400, "Validation failed: missing projectId");
    return res.status(400).json({ success: false, error: "Project ID is required" });
  }

  const db = readDatabase();
  const project = db.projects.find(p => p.id === projectId);
  if (!project) {
    logRequest("POST /project/open", req.body, 404, `Project ${projectId} not found`);
    return res.status(404).json({ success: false, error: "Project not found" });
  }

  const pages = db.pages.filter(p => p.projectId === projectId);
  const layers = db.layers.filter(l => l.projectId === projectId);

  logRequest("POST /project/open", req.body, 200, `Opened project ${projectId}`);
  res.json({ success: true, project, pages, layers });
});

// POST /project/save
router.post("/project/save", (req, res) => {
  const { projectId, name, description, width, height, layers, backgroundType, backgroundValue } = req.body;
  if (!projectId) {
    logRequest("POST /project/save", req.body, 400, "Validation failed: missing projectId");
    return res.status(400).json({ success: false, error: "Project ID is required" });
  }

  const db = readDatabase();
  const projIndex = db.projects.findIndex(p => p.id === projectId);
  if (projIndex === -1) {
    logRequest("POST /project/save", req.body, 404, `Project ${projectId} not found`);
    return res.status(404).json({ success: false, error: "Project not found" });
  }

  // Update project metadata
  db.projects[projIndex] = {
    ...db.projects[projIndex],
    name: name || db.projects[projIndex].name,
    description: description || db.projects[projIndex].description,
    width: width ? Number(width) : db.projects[projIndex].width,
    height: height ? Number(height) : db.projects[projIndex].height,
    updatedAt: new Date().toISOString()
  };

  // Update page backgrounds
  const pageIndex = db.pages.findIndex(p => p.projectId === projectId);
  if (pageIndex !== -1) {
    db.pages[pageIndex] = {
      ...db.pages[pageIndex],
      backgroundType: backgroundType || db.pages[pageIndex].backgroundType,
      backgroundValue: backgroundValue || db.pages[pageIndex].backgroundValue,
      updatedAt: new Date().toISOString()
    };
  }

  // Rewrite layers for this project
  db.layers = db.layers.filter(l => l.projectId !== projectId);
  if (Array.isArray(layers)) {
    layers.forEach((l: any) => {
      const pageId = db.pages.find(p => p.projectId === projectId)?.id || "page_default";
      db.layers.push({
        id: l.id || `layer_${crypto.randomBytes(4).toString("hex")}`,
        pageId,
        projectId,
        name: l.name || "Unnamed Layer",
        type: l.type || "text",
        parentId: l.parentId || null,
        x: Number(l.x) || 50,
        y: Number(l.y) || 50,
        width: Number(l.width) || 30,
        height: Number(l.height) || 10,
        opacity: l.opacity !== undefined ? Number(l.opacity) : 1,
        blendMode: l.blendMode || "normal",
        visibility: l.visibility !== undefined ? !!l.visibility : true,
        locked: l.locked !== undefined ? !!l.locked : false,
        content: l.content || "",
        fontSize: l.fontSize,
        fontFamily: l.fontFamily,
        color: l.color,
        fontWeight: l.fontWeight,
        align: l.align,
        letterSpacing: l.letterSpacing,
        lineHeight: l.lineHeight,
        rotation: l.rotation,
        shadow: l.shadow,
        borderRadius: l.borderRadius,
        createdAt: l.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  writeDatabase(db);
  logRequest("POST /project/save", req.body, 200, `Saved project ${projectId}`);
  res.json({ success: true, project: db.projects[projIndex] });
});

// POST /canvas/create
router.post("/canvas/create", (req, res) => {
  const { projectId, title, width, height } = req.body;
  if (!projectId) {
    logRequest("POST /canvas/create", req.body, 400, "Validation failed: missing projectId");
    return res.status(400).json({ success: false, error: "Project ID is required" });
  }

  const db = readDatabase();
  const pageId = `page_${crypto.randomBytes(4).toString("hex")}`;
  const newPage: Page = {
    id: pageId,
    projectId,
    pageNumber: db.pages.filter(p => p.projectId === projectId).length + 1,
    title: title || `Page ${db.pages.filter(p => p.projectId === projectId).length + 1}`,
    backgroundType: "color",
    backgroundValue: "#ffffff",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.pages.push(newPage);
  writeDatabase(db);

  logRequest("POST /canvas/create", req.body, 201, `Created page/canvas ${pageId} under ${projectId}`);
  res.status(201).json({ success: true, page: newPage });
});

// POST /layer/create
router.post("/layer/create", (req, res) => {
  const { projectId, type, content, name } = req.body;
  if (!projectId || !type) {
    logRequest("POST /layer/create", req.body, 400, "Validation failed: missing fields");
    return res.status(400).json({ success: false, error: "ProjectId and Type are required" });
  }

  const db = readDatabase();
  const page = db.pages.find(p => p.projectId === projectId);
  if (!page) {
    logRequest("POST /layer/create", req.body, 404, "Page/canvas matching projectId not found");
    return res.status(404).json({ success: false, error: "Canvas not found" });
  }

  const layerId = `layer_${crypto.randomBytes(4).toString("hex")}`;
  const newLayer: Layer = {
    id: layerId,
    pageId: page.id,
    projectId,
    name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
    type,
    parentId: null,
    x: 40 + Math.random() * 20,
    y: 40 + Math.random() * 20,
    width: type === "text" ? 40 : 25,
    height: type === "text" ? 8 : 25,
    opacity: 1,
    blendMode: "normal",
    visibility: true,
    locked: false,
    content: content || (type === "text" ? "New Text Layer" : ""),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add default properties based on type
  if (type === "text") {
    newLayer.fontSize = 20;
    newLayer.fontFamily = "Inter";
    newLayer.color = "#000000";
    newLayer.align = "center";
  }

  db.layers.push(newLayer);
  writeDatabase(db);

  logRequest("POST /layer/create", req.body, 201, `Layer ${layerId} added`);
  res.status(201).json({ success: true, layer: newLayer });
});

// POST /layer/update
router.post("/layer/update", (req, res) => {
  const { layerId, updates } = req.body;
  if (!layerId || !updates) {
    logRequest("POST /layer/update", req.body, 400, "Validation failed: missing fields");
    return res.status(400).json({ success: false, error: "Layer ID and updates object are required" });
  }

  const db = readDatabase();
  const index = db.layers.findIndex(l => l.id === layerId);
  if (index === -1) {
    logRequest("POST /layer/update", req.body, 404, `Layer ${layerId} not found`);
    return res.status(404).json({ success: false, error: "Layer not found" });
  }

  db.layers[index] = {
    ...db.layers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeDatabase(db);
  logRequest("POST /layer/update", req.body, 200, `Updated layer ${layerId}`);
  res.json({ success: true, layer: db.layers[index] });
});

// POST /asset/upload
router.post("/asset/upload", (req, res) => {
  const { name, type, url, sizeBytes, mimeType } = req.body;
  if (!name || !url) {
    logRequest("POST /asset/upload", req.body, 400, "Validation failed: missing fields");
    return res.status(400).json({ success: false, error: "Asset name and URL are required" });
  }

  const db = readDatabase();
  const newAsset: Asset = {
    id: `asset_${crypto.randomBytes(4).toString("hex")}`,
    name,
    type: type || "image",
    url,
    sizeBytes: Number(sizeBytes) || 10240,
    mimeType: mimeType || "image/png",
    userId: "usr_admin",
    createdAt: new Date().toISOString()
  };

  db.assets.unshift(newAsset);
  writeDatabase(db);

  logRequest("POST /asset/upload", req.body, 201, `Asset uploaded as ${newAsset.id}`);
  res.status(201).json({ success: true, asset: newAsset });
});

// POST /export
router.post("/export", (req, res) => {
  const { projectId, format } = req.body;
  if (!projectId || !format) {
    logRequest("POST /export", req.body, 400, "Validation failed: missing fields");
    return res.status(400).json({ success: false, error: "ProjectId and export format are required" });
  }

  const db = readDatabase();
  const project = db.projects.find(p => p.id === projectId);
  if (!project) {
    logRequest("POST /export", req.body, 404, `Project ${projectId} not found`);
    return res.status(404).json({ success: false, error: "Project not found" });
  }

  // Create an Export job row
  const exportId = `export_${crypto.randomBytes(4).toString("hex")}`;
  const newExport: Export = {
    id: exportId,
    projectId,
    format,
    url: `/exports/${exportId}.${format}`,
    status: "completed", // Complete immediately for Phase 1 architectural test
    sizeBytes: 154200,
    createdAt: new Date().toISOString()
  };

  db.exports.unshift(newExport);
  writeDatabase(db);

  logRequest("POST /export", req.body, 201, `Export processed as ${exportId}`);
  res.status(201).json({ success: true, export: newExport });
});

// POST /chat
router.post("/chat", (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  logRequest("POST /chat", req.body, 200, `Inbound message: "${message.slice(0, 50)}"`);
  
  // Clean mock design intelligence response grounding for Phase 1 architecture:
  // Neora AI Designer OS responds with layout/color suggestion planning:
  const replies = [
    `I can see we have loaded Neora AI Designer OS in the workspace. How about we build a professional typographic layout? Let's use clean sans-serif typography like Inter, with Cyan (#06b6d4) accent hues!`,
    `Awesome briefing! For a vintage theme, we should pair classical Serif typography like 'Playfair Display' with warm golden/beige gradients. Let's write layers directly.`,
    `Project memories and style profiles are synced. Let's refine your layout with precise alignment guides.`
  ];
  const replyText = replies[Math.floor(Math.random() * replies.length)];

  res.json({
    success: true,
    response: replyText,
    model: "Neora Grounding Router Phase 1 Core",
    timestamp: new Date().toISOString()
  });
});

export default router;
