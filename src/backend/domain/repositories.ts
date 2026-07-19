import { User, Session, Project, Page, Layer, Asset, Template, Export, PluginRegistry, AuditLog, ProjectMemory, PromptHistory } from "./entities.ts";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, "id" | "createdAt" | "updatedAt"> & { passwordHash?: string }): Promise<User>;
  getPasswordHash(userId: string): Promise<string | null>;
  saveSession(session: Omit<Session, "id" | "createdAt">): Promise<Session>;
  findSessionByToken(token: string): Promise<Session | null>;
  deleteSession(token: string): Promise<void>;
}

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  listByUserId(userId: string): Promise<Project[]>;
  createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Canvas / Page management
  findPagesByProjectId(projectId: string): Promise<Page[]>;
  createPage(page: Omit<Page, "id" | "createdAt" | "updatedAt">): Promise<Page>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page>;
}

export interface ILayerRepository {
  findById(id: string): Promise<Layer | null>;
  listByProjectId(projectId: string): Promise<Layer[]>;
  createLayer(layer: Omit<Layer, "id" | "createdAt" | "updatedAt">): Promise<Layer>;
  updateLayer(id: string, updates: Partial<Layer>): Promise<Layer>;
  deleteLayer(id: string): Promise<void>;
  saveLayersBatch(projectId: string, layers: Layer[]): Promise<Layer[]>;
}

export interface IAssetRepository {
  findById(id: string): Promise<Asset | null>;
  listAll(): Promise<Asset[]>;
  saveAsset(asset: Omit<Asset, "id" | "createdAt">): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;
}

export interface ITemplateRepository {
  findById(id: string): Promise<Template | null>;
  listAll(): Promise<Template[]>;
  saveTemplate(template: Template): Promise<Template>;
}

export interface IExportRepository {
  findById(id: string): Promise<Export | null>;
  listByProjectId(projectId: string): Promise<Export[]>;
  saveExport(exportJob: Omit<Export, "id" | "createdAt">): Promise<Export>;
  updateExportStatus(id: string, status: Export["status"], sizeBytes?: number, error?: string): Promise<Export>;
}

export interface IPluginRepository {
  findById(id: string): Promise<PluginRegistry | null>;
  listAll(): Promise<PluginRegistry[]>;
  savePlugin(plugin: PluginRegistry): Promise<PluginRegistry>;
}

export interface IAuditRepository {
  log(audit: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog>;
  getLogs(filters: { userId?: string; action?: string }): Promise<AuditLog[]>;
  savePromptHistory(history: Omit<PromptHistory, "id" | "createdAt">): Promise<PromptHistory>;
  getPromptHistory(projectId: string): Promise<PromptHistory[]>;
}

export interface IMemoryRepository {
  getMemory(projectId: string): Promise<ProjectMemory[]>;
  saveMemory(memory: Omit<ProjectMemory, "id" | "createdAt">): Promise<ProjectMemory>;
  deleteMemory(id: string): Promise<void>;
}
