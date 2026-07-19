/**
 * NEORA AI DESIGNER OS - PLUGIN MANAGER
 * Complete orchestration lifecycle engine for installing, updating, running, and managing plugins.
 */

import { PluginId, PluginStatus, INeoraPlugin, PluginManifest } from "./types";
import { PluginSDK } from "./PluginSDK";
import { ToolRegistry } from "./ToolRegistry";
import { readDatabase, writeDatabase } from "../neoraDesignerOSStore";

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<PluginId, INeoraPlugin> = new Map();
  private contexts: Map<PluginId, PluginSDK> = new Map();

  private constructor() {}

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  public async registerPlugin(plugin: INeoraPlugin): Promise<void> {
    const manifest = plugin.manifest;
    if (this.plugins.has(manifest.id)) {
      console.warn(`[PluginManager] Overwriting registered plugin ID: ${manifest.id}`);
      await this.uninstallPlugin(manifest.id);
    }

    this.plugins.set(manifest.id, plugin);
    plugin.status = PluginStatus.INSTALLED;
    
    // Initialize Plugin SDK context
    const context = new PluginSDK(manifest);
    this.contexts.set(manifest.id, context);

    try {
      console.log(`[PluginManager] Initializing plugin: ${manifest.name} (${manifest.id})`);
      await plugin.initialize(context);
      plugin.status = PluginStatus.INITIALIZED;

      // Register associated commands/tools into central ToolRegistry
      if (manifest.commands) {
        const toolRegistry = ToolRegistry.getInstance();
        manifest.commands.forEach(cmd => {
          toolRegistry.registerTool({
            id: `${manifest.id}.${cmd.id}`,
            name: cmd.name,
            description: cmd.description,
            category: cmd.category,
            pluginId: manifest.id,
            inputSchema: cmd.inputSchema,
            outputSchema: cmd.outputSchema,
            execute: async (args) => {
              if (plugin.status !== PluginStatus.ACTIVE) {
                throw new Error(`Cannot execute command: Plugin ${manifest.name} is not active.`);
              }
              // Command execution delegation is handled individually by plugin instance
              // For demonstration and test cases, plugins will override this mapping
              const pAsAny = plugin as any;
              if (pAsAny.onCommandCall) {
                return pAsAny.onCommandCall(cmd.id, args);
              }
              throw new Error(`Command ${cmd.id} execution is not bound in plugin.`);
            }
          });
        });
      }

      // Automatically activate by default
      await this.activatePlugin(manifest.id);
      
      // Update local db registry listing
      const db = readDatabase();
      const existingIdx = db.pluginRegistry.findIndex(p => p.id === manifest.id);
      const row = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        entryPoint: `/plugins/${manifest.id}.js`,
        status: "active" as const,
        capabilities: manifest.capabilities,
        createdAt: new Date().toISOString()
      };
      if (existingIdx !== -1) {
        db.pluginRegistry[existingIdx] = row;
      } else {
        db.pluginRegistry.push(row);
      }
      writeDatabase(db);

    } catch (err) {
      plugin.status = PluginStatus.ERROR;
      console.error(`[PluginManager] Initialization failed for plugin ${manifest.id}:`, err);
    }
  }

  public async activatePlugin(id: PluginId): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`Plugin ${id} not found.`);
    
    if (plugin.status === PluginStatus.ACTIVE) return;
    
    console.log(`[PluginManager] Activating plugin: ${plugin.manifest.name}`);
    await plugin.activate();
    plugin.status = PluginStatus.ACTIVE;
  }

  public async suspendPlugin(id: PluginId): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`Plugin ${id} not found.`);
    
    if (plugin.status !== PluginStatus.ACTIVE) return;

    console.log(`[PluginManager] Suspending plugin: ${plugin.manifest.name}`);
    await plugin.suspend();
    plugin.status = PluginStatus.SUSPENDED;
  }

  public async resumePlugin(id: PluginId): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`Plugin ${id} not found.`);
    
    if (plugin.status !== PluginStatus.SUSPENDED) return;

    console.log(`[PluginManager] Resuming plugin: ${plugin.manifest.name}`);
    await plugin.resume();
    plugin.status = PluginStatus.ACTIVE;
  }

  public async deactivatePlugin(id: PluginId): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`Plugin ${id} not found.`);
    
    if (plugin.status === PluginStatus.DISABLED) return;

    console.log(`[PluginManager] Deactivating plugin: ${plugin.manifest.name}`);
    await plugin.deactivate();
    plugin.status = PluginStatus.DISABLED;

    const db = readDatabase();
    const idx = db.pluginRegistry.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.pluginRegistry[idx].status = "inactive";
      writeDatabase(db);
    }
  }

  public async uninstallPlugin(id: PluginId): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    console.log(`[PluginManager] Uninstalling plugin: ${plugin.manifest.name}`);
    await this.deactivatePlugin(id);

    // Unregister tools from ToolRegistry
    const toolRegistry = ToolRegistry.getInstance();
    const tools = toolRegistry.listToolsByPlugin(id);
    tools.forEach(t => toolRegistry.unregisterTool(t.id));

    this.plugins.delete(id);
    this.contexts.delete(id);

    const db = readDatabase();
    db.pluginRegistry = db.pluginRegistry.filter(p => p.id !== id);
    writeDatabase(db);
  }

  public getPlugin(id: PluginId): INeoraPlugin | undefined {
    return this.plugins.get(id);
  }

  public getPluginContext(id: PluginId): PluginSDK | undefined {
    return this.contexts.get(id);
  }

  public listPlugins(): INeoraPlugin[] {
    return Array.from(this.plugins.values());
  }

  public clearAll(): void {
    const ids = Array.from(this.plugins.keys());
    ids.forEach(id => this.uninstallPlugin(id));
    this.plugins.clear();
    this.contexts.clear();
    console.log("[PluginManager] Cleared all plugin registrations.");
  }
}
