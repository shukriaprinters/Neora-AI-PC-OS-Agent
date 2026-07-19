import { User, Project, Page, Layer, Asset, Export, PluginRegistry, ProjectMemory } from "./entities.ts";

export interface IAuthService {
  register(email: string, password: string, name: string): Promise<{ user: User; token: string }>;
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  verifyToken(token: string): Promise<User | null>;
  logout(token: string): Promise<void>;
}

export interface IProjectService {
  createProject(userId: string, name: string, description?: string, width?: number, height?: number): Promise<{ project: Project; page: Page; layers: Layer[] }>;
  getProject(userId: string, projectId: string): Promise<{ project: Project; pages: Page[]; layers: Layer[] }>;
  listUserProjects(userId: string): Promise<Project[]>;
  saveProjectState(userId: string, projectId: string, name: string, description: string, width: number, height: number, layers: Layer[], backgroundType: "color" | "gradient" | "image", backgroundValue: string): Promise<Project>;
}

export interface ILayerService {
  createLayer(projectId: string, type: Layer["type"], content?: string, name?: string): Promise<Layer>;
  updateLayer(layerId: string, updates: Partial<Layer>): Promise<Layer>;
  deleteLayer(layerId: string): Promise<void>;
}

export interface IExportService {
  triggerExport(projectId: string, format: Export["format"]): Promise<Export>;
}

export interface IAIGatewayService {
  generateLayout(prompt: string, context: string): Promise<{ title: string; explanation: string; suggestedLayers: Array<Partial<Layer>> }>;
  analyzeVisuals(imageUrl: string, prompt: string): Promise<string>;
  chat(prompt: string, history: Array<{ role: "user" | "model"; text: string }>, projectId?: string): Promise<string>;
}
