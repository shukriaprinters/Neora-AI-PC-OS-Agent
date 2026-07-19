/**
 * NEORA AI DESIGNER OS - TOOL REGISTRY
 * Implementation of the unified tool, action, and capability catalog.
 */

import { IToolRegistry, RegisteredTool } from "./types";

export class ToolRegistry implements IToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, RegisteredTool> = new Map();

  private constructor() {}

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  public registerTool(tool: RegisteredTool): void {
    if (this.tools.has(tool.id)) {
      console.warn(`[ToolRegistry] Overwriting registered tool: ${tool.id}`);
    }
    this.tools.set(tool.id, tool);
    console.log(`[ToolRegistry] Successfully registered tool: ${tool.name} (ID: ${tool.id}) by plugin: ${tool.pluginId}`);
  }

  public unregisterTool(id: string): void {
    if (this.tools.has(id)) {
      const tool = this.tools.get(id);
      this.tools.delete(id);
      console.log(`[ToolRegistry] Unregistered tool: ${tool?.name} (ID: ${id})`);
    }
  }

  public getTool(id: string): RegisteredTool | undefined {
    return this.tools.get(id);
  }

  public listTools(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  public listToolsByPlugin(pluginId: string): RegisteredTool[] {
    return this.listTools().filter(tool => tool.pluginId === pluginId);
  }

  public listToolsByCategory(category: string): RegisteredTool[] {
    return this.listTools().filter(tool => tool.category.toLowerCase() === category.toLowerCase());
  }

  public clear(): void {
    this.tools.clear();
    console.log("[ToolRegistry] Cleared all tools.");
  }
}
