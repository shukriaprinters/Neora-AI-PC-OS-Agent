/**
 * NEORA AI DESIGNER OS - DOMAIN ENTITIES (NORMALIZED)
 * Clean Architecture Domain Layer
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
  updatedAt: string;
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
  parentId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  blendMode: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten";
  visibility: boolean;
  locked: boolean;
  content: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  align?: "left" | "center" | "right";
  letterSpacing?: string;
  lineHeight?: number;
  rotation?: number;
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
  elements: any[];
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
  entryPoint: string;
  status: "active" | "inactive";
  capabilities: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
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
  importance: number;
  createdAt: string;
}
