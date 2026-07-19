/**
 * NEORA AI DESIGNER OS - PLUGIN & SDK TYPES
 * Clean, production-ready TypeScript definitions for the extensible plugin ecosystem.
 */

export type PluginId = string;

export enum PluginStatus {
  INSTALLED = "installed",
  INITIALIZED = "initialized",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  ERROR = "error",
  DISABLED = "disabled"
}

export type PermissionType =
  | "filesystem"
  | "internet"
  | "clipboard"
  | "canvas"
  | "layers"
  | "projects"
  | "assets"
  | "fonts"
  | "ai_models"
  | "vision_models"
  | "memory"
  | "export"
  | "import"
  | "notifications"
  | "background_jobs";

export interface PluginManifest {
  id: PluginId;
  name: string;
  version: string;
  author: string;
  description: string;
  license: string;
  homepage?: string;
  repository?: string;
  compatibility: string; // e.g., "^1.0.0"
  dependencies?: Record<string, string>;
  permissions: PermissionType[];
  commands?: PluginCommand[];
  panels?: PluginPanel[];
  menus?: PluginMenu[];
  capabilities: string[];
  settingsSchema?: Record<string, PluginSettingField>;
  requiredModels?: string[];
  requiredServices?: string[];
}

export interface PluginCommand {
  id: string;
  name: string;
  description: string;
  category: string;
  inputSchema?: any;
  outputSchema?: any;
}

export interface PluginPanel {
  id: string;
  title: string;
  icon: string; // Lucide icon identifier
  position: "left" | "right" | "bottom" | "floating";
}

export interface PluginMenu {
  id: string;
  label: string;
  parentMenu: "file" | "edit" | "view" | "layer" | "plugins" | "help";
}

export interface PluginSettingField {
  type: "string" | "number" | "boolean" | "select" | "array";
  label: string;
  description: string;
  defaultValue: any;
  options?: string[]; // For "select" fields
}

// Event system types
export type PluginEventMap = {
  ProjectOpened: { projectId: string; name: string };
  ProjectSaved: { projectId: string };
  LayerCreated: { projectId: string; pageId: string; layerId: string; layerType: string };
  LayerUpdated: { projectId: string; pageId: string; layerId: string; changes: any };
  AssetImported: { assetId: string; name: string; mimeType: string };
  ExportCompleted: { exportId: string; projectId: string; format: string; url: string };
  ModelChanged: { oldModel: string; newModel: string };
  UserPromptSubmitted: { prompt: string; context: any };
  AIResponseGenerated: { prompt: string; response: string; model: string };
};

export type PluginEventName = keyof PluginEventMap;
export type PluginEventListener<K extends PluginEventName> = (data: PluginEventMap[K]) => void | Promise<void>;

// Plugin context APIs
export interface IPluginContext {
  pluginId: PluginId;
  manifest: PluginManifest;
  
  // APIs
  canvas: ICanvasAPI;
  layers: ILayersAPI;
  projects: IProjectsAPI;
  assets: IAssetsAPI;
  fonts: IFontsAPI;
  memory: IMemoryAPI;
  ai: IAIAPI;
  events: IEventsAPI;
  logger: ILoggerAPI;
  storage: IStorageAPI;
  
  // Permission verification guard
  verifyPermission(permission: PermissionType): boolean;
}

export interface ICanvasAPI {
  getDimensions(): { width: number; height: number };
  setDimensions(width: number, height: number): Promise<void>;
  getBackgroundColor(): { type: string; value: string };
  setBackgroundColor(type: "color" | "gradient" | "image", value: string): Promise<void>;
}

export interface ILayersAPI {
  getAll(): Promise<any[]>;
  getById(id: string): Promise<any | null>;
  create(layer: Omit<any, "id" | "createdAt" | "updatedAt">): Promise<any>;
  update(id: string, updates: Partial<any>): Promise<any>;
  delete(id: string): Promise<boolean>;
  clearSelection(): Promise<void>;
  getSelected(): Promise<any[]>;
}

export interface IProjectsAPI {
  getActiveId(): string | null;
  getMetadata(): Promise<any>;
  save(): Promise<void>;
}

export interface IAssetsAPI {
  list(): Promise<any[]>;
  import(name: string, type: string, url: string, mimeType: string): Promise<any>;
}

export interface IFontsAPI {
  listActive(): Promise<any[]>;
  loadFont(family: string, url: string): Promise<void>;
}

export interface IMemoryAPI {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, importance?: number): Promise<void>;
  delete(key: string): Promise<void>;
  getAll(): Promise<Record<string, string>>;
}

export interface IAIAPI {
  generateText(prompt: string, options?: any): Promise<string>;
  generateImage(prompt: string, options?: any): Promise<string>;
  analyzeImage(imageUrl: string, prompt: string): Promise<string>;
  getAvailableModels(): string[];
}

export interface IEventsAPI {
  subscribe<K extends PluginEventName>(event: K, listener: PluginEventListener<K>): string;
  unsubscribe(subscriptionId: string): void;
  emit<K extends PluginEventName>(event: K, data: PluginEventMap[K]): void;
}

export interface ILoggerAPI {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: any): void;
}

export interface IStorageAPI {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Plugin structure
export interface INeoraPlugin {
  manifest: PluginManifest;
  status: PluginStatus;
  
  initialize(context: IPluginContext): Promise<void>;
  activate(): Promise<void>;
  suspend(): Promise<void>;
  resume(): Promise<void>;
  deactivate(): Promise<void>;
}

// Central Registries
export interface IToolRegistry {
  registerTool(tool: RegisteredTool): void;
  unregisterTool(id: string): void;
  getTool(id: string): RegisteredTool | undefined;
  listTools(): RegisteredTool[];
}

export interface RegisteredTool {
  id: string;
  name: string;
  description: string;
  category: string;
  pluginId: string;
  execute: (args: any, context: IPluginContext) => Promise<any>;
  inputSchema?: any;
  outputSchema?: any;
}

// MCP System Interfaces
export interface IMCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface IMCPRequest {
  method: "tools/list" | "tools/call";
  params?: any;
}

export interface IMCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}
