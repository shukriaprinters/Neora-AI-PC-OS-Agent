import { useState, useEffect } from "react";

// ==========================================
// TYPES & INTERFACES DEFINITIONS
// ==========================================

export interface Project {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  backgroundValue: string;
}

export interface Layer {
  id: string;
  name: string;
  type: "text" | "image" | "shape" | "group" | "smart_object";
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  blendMode: "normal" | "multiply" | "screen" | "overlay" | "color-burn" | "hard-light";
  visibility: boolean;
  locked: boolean;
  content: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  align?: "left" | "center" | "right";
  borderRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  letterSpacing?: number;
  lineHeight?: number;
  aspectRatioLocked?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: "image" | "vector" | "font" | "texture" | "illustration" | "pattern" | "brand";
  url: string;
  sizeBytes: number;
  mimeType: string;
  category: "uploads" | "icons" | "illustrations" | "photos" | "textures" | "backgrounds" | "shapes" | "brand-kit";
}

export interface PluginItem {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  status: "active" | "inactive";
  capabilities: string[];
}

export interface HistoryItem {
  id: string;
  action: string;
  timestamp: string;
  layersSnapshot: Layer[];
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: "color_palette" | "typography" | "brand_guidelines" | "design_rule";
  timestamp: string;
}

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  confidence: number;
  applied: boolean;
  actionType: "layout" | "palette" | "contrast" | "structure";
}

// ==========================================
// INITIAL STATIC SEED DATA
// ==========================================

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Neora Brand Concept v1",
    description: "Phase 1 Foundation layout grid for Neora generative creative console.",
    width: 1080,
    height: 1080,
    createdAt: "2026-07-10T12:00:00Z",
    updatedAt: "2026-07-15T09:30:00Z",
    isFavorite: true,
    isPinned: true,
    backgroundValue: "#0f172a"
  },
  {
    id: "proj-2",
    name: "Glassmorphism UI Template",
    description: "Highly polished modern glass card deck mockup layout and rules.",
    width: 1200,
    height: 800,
    createdAt: "2026-07-12T14:20:00Z",
    updatedAt: "2026-07-14T18:15:00Z",
    backgroundValue: "#1e1b4b"
  }
];

export const INITIAL_LAYERS: Record<string, Layer[]> = {
  "proj-1": [
    {
      id: "layer-title",
      name: "Display Heading text",
      type: "text",
      x: 10,
      y: 20,
      width: 80,
      height: 15,
      opacity: 1,
      blendMode: "normal",
      visibility: true,
      locked: false,
      content: "NEORA GRAPHIC SHELL",
      fontSize: 48,
      fontFamily: "Space Grotesk",
      color: "#f43f5e",
      fontWeight: "800",
      align: "center"
    },
    {
      id: "layer-bg-card",
      name: "Ambient glow container",
      type: "shape",
      x: 15,
      y: 40,
      width: 70,
      height: 40,
      opacity: 0.85,
      blendMode: "overlay",
      visibility: true,
      locked: false,
      content: "rect",
      color: "#312e81",
      borderRadius: 16,
      strokeColor: "#f43f5e",
      strokeWidth: 2
    },
    {
      id: "layer-vector-artwork",
      name: "Hero illustration graphic",
      type: "image",
      x: 25,
      y: 45,
      width: 50,
      height: 30,
      opacity: 0.9,
      blendMode: "normal",
      visibility: true,
      locked: false,
      content: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
    }
  ],
  "proj-2": [
    {
      id: "layer2-glass",
      name: "Glass Backdrop",
      type: "shape",
      x: 10,
      y: 10,
      width: 80,
      height: 80,
      opacity: 0.95,
      blendMode: "normal",
      visibility: true,
      locked: false,
      content: "rect",
      color: "#0f172a",
      borderRadius: 24,
      strokeColor: "#ffffff",
      strokeWidth: 1
    }
  ]
};

export const INITIAL_ASSETS: Asset[] = [
  {
    id: "asset-1",
    name: "Golden Dawn Glow",
    type: "image",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    sizeBytes: 154200,
    mimeType: "image/png",
    category: "photos"
  },
  {
    id: "asset-2",
    name: "Neora Emblem SVG",
    type: "vector",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400",
    sizeBytes: 24500,
    mimeType: "image/svg+xml",
    category: "shapes"
  },
  {
    id: "asset-3",
    name: "Cyber Grid Overlay",
    type: "texture",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400",
    sizeBytes: 312000,
    mimeType: "image/jpeg",
    category: "textures"
  }
];

export const INITIAL_PLUGINS: PluginItem[] = [
  {
    id: "plug-svg-exporter",
    name: "High-Fidelity SVG Node Exporter",
    version: "1.4.0",
    description: "Compiles all raster and vector layers directly into clean, scalable SVG paths.",
    author: "Neora Core Lab",
    status: "active",
    capabilities: ["Vector Path Generation", "Inline Styles", "Gradient Mapping"]
  },
  {
    id: "plug-image-optimizer",
    name: "Fal.ai Inpaint Magic Infill",
    version: "2.1.2",
    description: "Binds generative fill brush strokes using cloud diffusion engines instantly.",
    author: "Community Devs",
    status: "inactive",
    capabilities: ["Canvas Brush Mask", "AI Content Removal", "Upscaling"]
  }
];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    key: "Neora Primary Palette",
    value: "Rose (#f43f5e), Cyan (#06b6d4), Twilight slate (#0f172a)",
    category: "color_palette",
    timestamp: "2026-07-14T10:00:00Z"
  },
  {
    id: "mem-2",
    key: "Typography Assertions",
    value: "Display title must use Space Grotesk Bold, monospace accents with JetBrains Mono",
    category: "typography",
    timestamp: "2026-07-14T10:15:00Z"
  }
];
