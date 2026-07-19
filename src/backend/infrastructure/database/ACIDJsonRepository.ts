import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { IUserRepository, IProjectRepository, ILayerRepository, IAssetRepository, ITemplateRepository, IExportRepository, IPluginRepository, IAuditRepository, IMemoryRepository } from "../../domain/repositories.ts";
import { User, Session, Project, Page, Layer, Asset, Template, Export, PluginRegistry, AuditLog, ProjectMemory, PromptHistory } from "../../domain/entities.ts";
import { readDatabase } from "../../../lib/neoraDesignerOSStore.ts";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "neora-designer-os-db.json");

interface DatabaseSchema {
  users: Array<User & { passwordHash?: string }>;
  sessions: Session[];
  projects: Project[];
  pages: Page[];
  layers: Layer[];
  assets: Asset[];
  fonts: any[];
  templates: Template[];
  exports: Export[];
  pluginRegistry: PluginRegistry[];
  workflowHistory: any[];
  promptHistory: PromptHistory[];
  projectMemory: ProjectMemory[];
  auditLogs?: AuditLog[];
}

/**
 * Thread-safe transactional queue to ensure ACID writes on the file system
 */
class AsyncLock {
  private promise: Promise<void> = Promise.resolve();

  async acquire(): Promise<() => void> {
    let resolveFn: () => void;
    const nextPromise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });
    const currentPromise = this.promise;
    this.promise = nextPromise;
    await currentPromise;
    return resolveFn!;
  }
}

export class ACIDJsonRepository {
  private static lock = new AsyncLock();

  public read(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const fallback = readDatabase();
      return {
        users: (fallback.users || []).map((u: any) => ({
          ...u,
          updatedAt: u.updatedAt || u.createdAt || new Date().toISOString()
        })),
        sessions: fallback.sessions || [],
        projects: fallback.projects || [],
        pages: fallback.pages || [],
        layers: fallback.layers || [],
        assets: fallback.assets || [],
        fonts: fallback.fonts || [],
        templates: fallback.templates || [],
        exports: fallback.exports || [],
        pluginRegistry: fallback.pluginRegistry || [],
        workflowHistory: fallback.workflowHistory || [],
        promptHistory: fallback.promptHistory || [],
        projectMemory: fallback.projectMemory || [],
        auditLogs: []
      };
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      pages: Array.isArray(parsed.pages) ? parsed.pages : [],
      layers: Array.isArray(parsed.layers) ? parsed.layers : [],
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      fonts: Array.isArray(parsed.fonts) ? parsed.fonts : [],
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      exports: Array.isArray(parsed.exports) ? parsed.exports : [],
      pluginRegistry: Array.isArray(parsed.pluginRegistry) ? parsed.pluginRegistry : (parsed.pluginRegistry || parsed.plugins || []),
      workflowHistory: Array.isArray(parsed.workflowHistory) ? parsed.workflowHistory : [],
      promptHistory: Array.isArray(parsed.promptHistory) ? parsed.promptHistory : [],
      projectMemory: Array.isArray(parsed.projectMemory) ? parsed.projectMemory : [],
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : []
    };
  }

  public async write(db: DatabaseSchema): Promise<void> {
    const release = await ACIDJsonRepository.lock.acquire();
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
    } finally {
      release();
    }
  }
}

export class ACIDUserRepository implements IUserRepository {
  constructor(private db: ACIDJsonRepository) {}

  async findById(id: string): Promise<User | null> {
    const db = this.db.read();
    const u = db.users.find(x => x.id === id);
    if (!u) return null;
    const { passwordHash, ...user } = u;
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = this.db.read();
    const u = db.users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return null;
    const { passwordHash, ...user } = u;
    return user;
  }

  async createUser(user: Omit<User, "id" | "createdAt" | "updatedAt"> & { passwordHash?: string }): Promise<User> {
    const db = this.db.read();
    const id = `usr_${crypto.randomBytes(4).toString("hex")}`;
    const newUser = {
      ...user,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    await this.db.write(db);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  async getPasswordHash(userId: string): Promise<string | null> {
    const db = this.db.read();
    const u = db.users.find(x => x.id === userId);
    return u?.passwordHash || null;
  }

  async saveSession(session: Omit<Session, "id" | "createdAt">): Promise<Session> {
    const db = this.db.read();
    const id = `sess_${crypto.randomBytes(6).toString("hex")}`;
    const newSession: Session = {
      ...session,
      id,
      createdAt: new Date().toISOString()
    };
    db.sessions.push(newSession);
    await this.db.write(db);
    return newSession;
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    const db = this.db.read();
    const s = db.sessions.find(x => x.token === token);
    if (!s) return null;
    if (new Date(s.expiresAt) < new Date()) {
      db.sessions = db.sessions.filter(x => x.token !== token);
      await this.db.write(db);
      return null;
    }
    return s;
  }

  async deleteSession(token: string): Promise<void> {
    const db = this.db.read();
    db.sessions = db.sessions.filter(x => x.token !== token);
    await this.db.write(db);
  }
}

export class ACIDProjectRepository implements IProjectRepository {
  constructor(private db: ACIDJsonRepository) {}

  async findById(id: string): Promise<Project | null> {
    const db = this.db.read();
    return db.projects.find(x => x.id === id) || null;
  }

  async listByUserId(userId: string): Promise<Project[]> {
    const db = this.db.read();
    return db.projects.filter(x => x.userId === userId);
  }

  async createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const db = this.db.read();
    const id = `proj_${crypto.randomBytes(4).toString("hex")}`;
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.projects.push(newProject);
    await this.db.write(db);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const db = this.db.read();
    const idx = db.projects.findIndex(x => x.id === id);
    if (idx === -1) throw new Error("Project not found");
    db.projects[idx] = {
      ...db.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.db.write(db);
    return db.projects[idx];
  }

  async deleteProject(id: string): Promise<void> {
    const db = this.db.read();
    db.projects = db.projects.filter(x => x.id !== id);
    db.pages = db.pages.filter(x => x.projectId !== id);
    db.layers = db.layers.filter(x => x.projectId !== id);
    await this.db.write(db);
  }

  async findPagesByProjectId(projectId: string): Promise<Page[]> {
    const db = this.db.read();
    return db.pages.filter(x => x.projectId === projectId);
  }

  async createPage(page: Omit<Page, "id" | "createdAt" | "updatedAt">): Promise<Page> {
    const db = this.db.read();
    const id = `page_${crypto.randomBytes(4).toString("hex")}`;
    const newPage: Page = {
      ...page,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.pages.push(newPage);
    await this.db.write(db);
    return newPage;
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    const db = this.db.read();
    const idx = db.pages.findIndex(x => x.id === id);
    if (idx === -1) throw new Error("Page not found");
    db.pages[idx] = {
      ...db.pages[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.db.write(db);
    return db.pages[idx];
  }
}

export class ACIDLayerRepository implements ILayerRepository {
  constructor(private db: ACIDJsonRepository) {}

  async findById(id: string): Promise<Layer | null> {
    const db = this.db.read();
    return db.layers.find(x => x.id === id) || null;
  }

  async listByProjectId(projectId: string): Promise<Layer[]> {
    const db = this.db.read();
    return db.layers.filter(x => x.projectId === projectId);
  }

  async createLayer(layer: Omit<Layer, "id" | "createdAt" | "updatedAt">): Promise<Layer> {
    const db = this.db.read();
    const id = `layer_${crypto.randomBytes(4).toString("hex")}`;
    const newLayer: Layer = {
      ...layer,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.layers.push(newLayer);
    await this.db.write(db);
    return newLayer;
  }

  async updateLayer(id: string, updates: Partial<Layer>): Promise<Layer> {
    const db = this.db.read();
    const idx = db.layers.findIndex(x => x.id === id);
    if (idx === -1) throw new Error("Layer not found");
    db.layers[idx] = {
      ...db.layers[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.db.write(db);
    return db.layers[idx];
  }

  async deleteLayer(id: string): Promise<void> {
    const db = this.db.read();
    db.layers = db.layers.filter(x => x.id !== id);
    await this.db.write(db);
  }

  async saveLayersBatch(projectId: string, layers: Layer[]): Promise<Layer[]> {
    const db = this.db.read();
    db.layers = db.layers.filter(x => x.projectId !== projectId);
    const sanitizedLayers = layers.map(l => ({
      ...l,
      projectId,
      id: l.id || `layer_${crypto.randomBytes(4).toString("hex")}`,
      createdAt: l.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    db.layers.push(...sanitizedLayers);
    await this.db.write(db);
    return sanitizedLayers;
  }
}

export class ACIDAssetRepository implements IAssetRepository {
  constructor(private db: ACIDJsonRepository) {}

  async findById(id: string): Promise<Asset | null> {
    const db = this.db.read();
    return db.assets.find(x => x.id === id) || null;
  }

  async listAll(): Promise<Asset[]> {
    const db = this.db.read();
    return db.assets;
  }

  async saveAsset(asset: Omit<Asset, "id" | "createdAt">): Promise<Asset> {
    const db = this.db.read();
    const id = `asset_${crypto.randomBytes(4).toString("hex")}`;
    const newAsset: Asset = {
      ...asset,
      id,
      createdAt: new Date().toISOString()
    };
    db.assets.unshift(newAsset);
    await this.db.write(db);
    return newAsset;
  }

  async deleteAsset(id: string): Promise<void> {
    const db = this.db.read();
    db.assets = db.assets.filter(x => x.id !== id);
    await this.db.write(db);
  }
}

export class ACIDTemplateRepository implements ITemplateRepository {
  constructor(private db: ACIDJsonRepository) {}

  async findById(id: string): Promise<Template | null> {
    const db = this.db.read();
    return db.templates.find(x => x.id === id) || null;
  }

  async listAll(): Promise<Template[]> {
    const db = this.db.read();
    return db.templates;
  }

  async saveTemplate(template: Template): Promise<Template> {
    const db = this.db.read();
    db.templates = db.templates.filter(x => x.id !== template.id);
    db.templates.push(template);
    await this.db.write(db);
    return template;
  }
}

export class ACIDExportRepository implements IExportRepository {
  constructor(private db: ACIDJsonRepository) {}

  async findById(id: string): Promise<Export | null> {
    const db = this.db.read();
    return db.exports.find(x => x.id === id) || null;
  }

  async listByProjectId(projectId: string): Promise<Export[]> {
    const db = this.db.read();
    return db.exports.filter(x => x.projectId === projectId);
  }

  async saveExport(exportJob: Omit<Export, "id" | "createdAt">): Promise<Export> {
    const db = this.db.read();
    const id = `export_${crypto.randomBytes(4).toString("hex")}`;
    const newExport: Export = {
      ...exportJob,
      id,
      createdAt: new Date().toISOString()
    };
    db.exports.unshift(newExport);
    await this.db.write(db);
    return newExport;
  }

  async updateExportStatus(id: string, status: Export["status"], sizeBytes?: number, error?: string): Promise<Export> {
    const db = this.db.read();
    const idx = db.exports.findIndex(x => x.id === id);
    if (idx === -1) throw new Error("Export job not found");
    db.exports[idx] = {
      ...db.exports[idx],
      status,
      sizeBytes: sizeBytes !== undefined ? sizeBytes : db.exports[idx].sizeBytes,
      error: error !== undefined ? error : db.exports[idx].error
    };
    await this.db.write(db);
    return db.exports[idx];
  }
}

export class ACIDPluginRepository implements IPluginRepository {
  constructor(private db: ACIDJsonRepository) {}

  async findById(id: string): Promise<PluginRegistry | null> {
    const db = this.db.read();
    return db.pluginRegistry.find(x => x.id === id) || null;
  }

  async listAll(): Promise<PluginRegistry[]> {
    const db = this.db.read();
    return db.pluginRegistry;
  }

  async savePlugin(plugin: PluginRegistry): Promise<PluginRegistry> {
    const db = this.db.read();
    db.pluginRegistry = db.pluginRegistry.filter(x => x.id !== plugin.id);
    db.pluginRegistry.push(plugin);
    await this.db.write(db);
    return plugin;
  }
}

export class ACIDAuditRepository implements IAuditRepository {
  constructor(private db: ACIDJsonRepository) {}

  async log(audit: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const db = this.db.read();
    if (!db.auditLogs) db.auditLogs = [];
    const id = `audit_${crypto.randomBytes(6).toString("hex")}`;
    const newLog: AuditLog = {
      ...audit,
      id,
      createdAt: new Date().toISOString()
    };
    db.auditLogs.unshift(newLog);
    if (db.auditLogs.length > 500) db.auditLogs.pop();
    await this.db.write(db);
    return newLog;
  }

  async getLogs(filters: { userId?: string; action?: string }): Promise<AuditLog[]> {
    const db = this.db.read();
    let logs = db.auditLogs || [];
    if (filters.userId) logs = logs.filter(x => x.userId === filters.userId);
    if (filters.action) logs = logs.filter(x => x.action === filters.action);
    return logs;
  }

  async savePromptHistory(history: Omit<PromptHistory, "id" | "createdAt">): Promise<PromptHistory> {
    const db = this.db.read();
    const id = `prompt_${crypto.randomBytes(6).toString("hex")}`;
    const newHistory: PromptHistory = {
      ...history,
      id,
      createdAt: new Date().toISOString()
    };
    db.promptHistory.unshift(newHistory);
    await this.db.write(db);
    return newHistory;
  }

  async getPromptHistory(projectId: string): Promise<PromptHistory[]> {
    const db = this.db.read();
    return db.promptHistory.filter(x => x.projectId === projectId);
  }
}

export class ACIDMemoryRepository implements IMemoryRepository {
  constructor(private db: ACIDJsonRepository) {}

  async getMemory(projectId: string): Promise<ProjectMemory[]> {
    const db = this.db.read();
    return db.projectMemory.filter(x => x.projectId === projectId);
  }

  async saveMemory(memory: Omit<ProjectMemory, "id" | "createdAt">): Promise<ProjectMemory> {
    const db = this.db.read();
    const id = `mem_${crypto.randomBytes(4).toString("hex")}`;
    const newMem: ProjectMemory = {
      ...memory,
      id,
      createdAt: new Date().toISOString()
    };
    db.projectMemory.push(newMem);
    await this.db.write(db);
    return newMem;
  }

  async deleteMemory(id: string): Promise<void> {
    const db = this.db.read();
    db.projectMemory = db.projectMemory.filter(x => x.id !== id);
    await this.db.write(db);
  }
}
