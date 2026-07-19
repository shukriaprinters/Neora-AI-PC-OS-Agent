import fs from "node:fs";
import path from "node:path";

// --- DATABASE SCHEMAS DEFINITION (NORMALIZED) ---

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  deviceInfo: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  userId: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  projectId: string;
  pageNumber: number;
  title: string;
  backgroundType: "color" | "gradient" | "image";
  backgroundValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface Layer {
  id: string;
  pageId: string;
  projectId: string;
  name: string;
  type: "text" | "image" | "shape" | "group" | "smart_object";
  parentId: string | null; // For grouping support
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage
  height: number; // percentage
  opacity: number; // 0 to 1
  blendMode: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
  visibility: boolean;
  locked: boolean;
  content: string; // Text content or Image asset URL
  // Text-specific properties
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  align?: "left" | "center" | "right";
  letterSpacing?: string;
  lineHeight?: number;
  rotation?: number; // degrees
  // Effects / styling properties
  shadow?: boolean;
  borderRadius?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: "image" | "vector" | "font" | "color_palette";
  url: string;
  sizeBytes: number;
  mimeType: string;
  userId: string;
  createdAt: string;
}

export interface Font {
  id: string;
  family: string;
  category: "sans-serif" | "serif" | "display" | "monospace" | "calligraphy" | "bengali";
  url?: string;
  provider: "google" | "custom" | "adobe";
  isPremium: boolean;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: "poster" | "vcard" | "brochure" | "banner" | "leaflet";
  width: number;
  height: number;
  thumbnailUrl: string;
  background: {
    type: "color" | "gradient" | "image";
    value: string;
  };
  elements: any[]; // Structure similar to layers
  isPremium: boolean;
  createdAt: string;
}

export interface Export {
  id: string;
  projectId: string;
  format: "png" | "jpg" | "pdf" | "svg" | "psd" | "ai" | "eps" | "tiff" | "webp";
  url: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  sizeBytes?: number;
  createdAt: string;
}

export interface PluginRegistry {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entryPoint: string; // JS bundle path
  status: "active" | "inactive";
  capabilities: string[]; // ['tool', 'exporter', 'generator']
  createdAt: string;
}

export interface WorkflowHistory {
  id: string;
  projectId: string;
  actionName: string; // e.g. "AutoLayout", "StyleTransfer"
  status: "success" | "failed";
  durationMs: number;
  logs: string[];
  createdAt: string;
}

export interface PromptHistory {
  id: string;
  userId: string;
  projectId: string | null;
  prompt: string;
  modelUsed: string;
  tokensUsed?: number;
  responsePreview?: string;
  createdAt: string;
}

export interface ProjectMemory {
  id: string;
  projectId: string;
  key: string;
  value: string;
  importance: number; // 1 to 5
  createdAt: string;
}

// --- DATABASE STATE CONTAINER ---

export interface NeoraDesignerOSDatabase {
  users: User[];
  sessions: Session[];
  projects: Project[];
  pages: Page[];
  layers: Layer[];
  assets: Asset[];
  fonts: Font[];
  templates: Template[];
  exports: Export[];
  pluginRegistry: PluginRegistry[];
  workflowHistory: WorkflowHistory[];
  promptHistory: PromptHistory[];
  projectMemory: ProjectMemory[];
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "neora-designer-os-db.json");

// Default bootstrap/seed database content
const defaultDB: NeoraDesignerOSDatabase = {
  users: [
    {
      id: "usr_admin",
      email: "shukriaprinters@gmail.com",
      name: "Shukria Admin",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: "lead-designer",
      createdAt: new Date().toISOString()
    }
  ],
  sessions: [],
  projects: [
    {
      id: "proj_foundation_1",
      name: "Neora Brand Concept",
      description: "Foundation brand asset design project for Neora OS",
      userId: "usr_admin",
      width: 1200,
      height: 800,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  pages: [
    {
      id: "page_f1",
      projectId: "proj_foundation_1",
      pageNumber: 1,
      title: "Hero Banner",
      backgroundType: "gradient",
      backgroundValue: "linear-gradient(135deg, #09090b 0%, #1c0f30 100%)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  layers: [
    {
      id: "layer_f1_bg_glow",
      pageId: "page_f1",
      projectId: "proj_foundation_1",
      name: "Ambient Glow Spot",
      type: "shape",
      parentId: null,
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      opacity: 0.25,
      blendMode: "screen",
      visibility: true,
      locked: false,
      content: "circle",
      color: "rgb(6, 182, 212)",
      borderRadius: 9999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "layer_f1_logo_img",
      pageId: "page_f1",
      projectId: "proj_foundation_1",
      name: "Neora Spark Launcher Icon",
      type: "image",
      parentId: null,
      x: 50,
      y: 35,
      width: 15,
      height: 22,
      opacity: 1.0,
      blendMode: "normal",
      visibility: true,
      locked: false,
      content: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      borderRadius: 16,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "layer_f1_title_text",
      pageId: "page_f1",
      projectId: "proj_foundation_1",
      name: "Main Display Header",
      type: "text",
      parentId: null,
      x: 50,
      y: 58,
      width: 80,
      height: 10,
      opacity: 1.0,
      blendMode: "normal",
      visibility: true,
      locked: false,
      content: "NEORA DESIGNER OS",
      fontSize: 48,
      fontFamily: "Space Grotesk",
      color: "#ffffff",
      fontWeight: "black",
      align: "center",
      letterSpacing: "0.15em",
      rotation: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "layer_f1_desc_text",
      pageId: "page_f1",
      projectId: "proj_foundation_1",
      name: "Subtitle Explanation",
      type: "text",
      parentId: null,
      x: 50,
      y: 68,
      width: 70,
      height: 6,
      opacity: 0.75,
      blendMode: "normal",
      visibility: true,
      locked: false,
      content: "PHASE 1 FOUNDATION • WORLD CLASS DESIGN ENGINEERING PLATFORM",
      fontSize: 12,
      fontFamily: "JetBrains Mono",
      color: "rgb(34, 211, 238)",
      fontWeight: "medium",
      align: "center",
      letterSpacing: "0.2em",
      rotation: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  assets: [
    {
      id: "asset_sample_1",
      name: "Abstract Mesh Background",
      type: "image",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
      sizeBytes: 254120,
      mimeType: "image/jpeg",
      userId: "usr_admin",
      createdAt: new Date().toISOString()
    },
    {
      id: "asset_sample_2",
      name: "Elegant Geometric Shape Pack",
      type: "vector",
      url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800",
      sizeBytes: 154800,
      mimeType: "image/jpeg",
      userId: "usr_admin",
      createdAt: new Date().toISOString()
    }
  ],
  fonts: [
    { id: "font_inter", family: "Inter", category: "sans-serif", provider: "google", isPremium: false, createdAt: new Date().toISOString() },
    { id: "font_space", family: "Space Grotesk", category: "display", provider: "google", isPremium: false, createdAt: new Date().toISOString() },
    { id: "font_playfair", family: "Playfair Display", category: "serif", provider: "google", isPremium: false, createdAt: new Date().toISOString() },
    { id: "font_mono", family: "JetBrains Mono", category: "monospace", provider: "google", isPremium: false, createdAt: new Date().toISOString() },
    { id: "font_siliguri", family: "Hind Siliguri", category: "bengali", provider: "google", isPremium: false, createdAt: new Date().toISOString() },
    { id: "font_galada", family: "Galada", category: "calligraphy", provider: "google", isPremium: false, createdAt: new Date().toISOString() }
  ],
  templates: [
    {
      id: "tmpl_poster_1",
      name: "Cyberpunk Event Flyer",
      category: "poster",
      width: 800,
      height: 1200,
      thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300",
      background: { type: "gradient", value: "linear-gradient(135deg, #09090b 0%, #1c0f30 100%)" },
      elements: [],
      isPremium: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "tmpl_vcard_1",
      name: "Minimalist Executive Card",
      category: "vcard",
      width: 1050,
      height: 600,
      thumbnailUrl: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=300",
      background: { type: "color", value: "#fcfaf2" },
      elements: [],
      isPremium: true,
      createdAt: new Date().toISOString()
    }
  ],
  exports: [],
  pluginRegistry: [
    {
      id: "plugin_figma_importer",
      name: "Figma File Bridge SDK",
      version: "1.0.0",
      description: "Direct vector conversion mapping of Figma components to Neora Layers",
      author: "Neora Architect Team",
      entryPoint: "/plugins/figma-bridge.js",
      status: "active",
      capabilities: ["importer", "layer-effects"],
      createdAt: new Date().toISOString()
    },
    {
      id: "plugin_magic_morph",
      name: "Liquid Texture Magic Morph",
      version: "1.2.5",
      description: "Advanced style morphing over shape and typography outlines",
      author: "Gemini Nano Pro Adapters",
      entryPoint: "/plugins/magic-morph.js",
      status: "active",
      capabilities: ["generator", "tool"],
      createdAt: new Date().toISOString()
    }
  ],
  workflowHistory: [],
  promptHistory: [],
  projectMemory: [
    {
      id: "mem_1",
      projectId: "proj_foundation_1",
      key: "brand_core_color",
      value: "Electric Cyan (rgb(6,182,212))",
      importance: 5,
      createdAt: new Date().toISOString()
    }
  ]
};

function ensureDBDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readDatabase(): NeoraDesignerOSDatabase {
  try {
    ensureDBDir();
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf8");
      return structuredClone(defaultDB);
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    
    // Safety fallback for all arrays to avoid schema holes
    return {
      users: Array.isArray(parsed.users) ? parsed.users : defaultDB.users,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : defaultDB.sessions,
      projects: Array.isArray(parsed.projects) ? parsed.projects : defaultDB.projects,
      pages: Array.isArray(parsed.pages) ? parsed.pages : defaultDB.pages,
      layers: Array.isArray(parsed.layers) ? parsed.layers : defaultDB.layers,
      assets: Array.isArray(parsed.assets) ? parsed.assets : defaultDB.assets,
      fonts: Array.isArray(parsed.fonts) ? parsed.fonts : defaultDB.fonts,
      templates: Array.isArray(parsed.templates) ? parsed.templates : defaultDB.templates,
      exports: Array.isArray(parsed.exports) ? parsed.exports : defaultDB.exports,
      pluginRegistry: Array.isArray(parsed.pluginRegistry) ? parsed.pluginRegistry : defaultDB.pluginRegistry,
      workflowHistory: Array.isArray(parsed.workflowHistory) ? parsed.workflowHistory : defaultDB.workflowHistory,
      promptHistory: Array.isArray(parsed.promptHistory) ? parsed.promptHistory : defaultDB.promptHistory,
      projectMemory: Array.isArray(parsed.projectMemory) ? parsed.projectMemory : defaultDB.projectMemory
    };
  } catch (err) {
    console.error("Database reading failed, using seeded memory.", err);
    return structuredClone(defaultDB);
  }
}

export function writeDatabase(db: NeoraDesignerOSDatabase) {
  try {
    ensureDBDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Database write error:", err);
  }
}
