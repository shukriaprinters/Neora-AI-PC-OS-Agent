/**
 * NEORA AI DESIGNER OS - PLUGIN TEST SUITE
 * Complete validation suite verifying Manifests, Lifecycles, Permission Guards, Adapters, and MCP.
 */

import { PluginManager } from "./PluginManager";
import { ToolRegistry } from "./ToolRegistry";
import { MCPAdapter } from "./MCPAdapter";
import { ModelAdapterRegistry } from "./ModelAdapter";
import { ColorPaletteGeneratorPlugin, DesignCriticPlugin, PosterGeneratorPlugin } from "./SamplePlugins";
import { PluginStatus } from "./types";

export interface TestResult {
  suite: string;
  name: string;
  status: "passed" | "failed";
  error?: string;
}

export class PluginTestSuite {
  private results: TestResult[] = [];

  private record(suite: string, name: string, fn: () => void | Promise<void>) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        throw new Error("Asynchronous test must be run in async context.");
      }
      this.results.push({ suite, name, status: "passed" });
    } catch (err: any) {
      this.results.push({ suite, name, status: "failed", error: err?.message || String(err) });
    }
  }

  private async recordAsync(suite: string, name: string, fn: () => Promise<void>) {
    try {
      await fn();
      this.results.push({ suite, name, status: "passed" });
    } catch (err: any) {
      this.results.push({ suite, name, status: "failed", error: err?.message || String(err) });
    }
  }

  public async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    const manager = PluginManager.getInstance();
    const registry = ToolRegistry.getInstance();
    const mcp = MCPAdapter.getInstance();
    const models = ModelAdapterRegistry.getInstance();

    // Reset Managers
    manager.clearAll();
    registry.clear();

    // --------------------------------------------------
    // 1. LIFECYCLE & REGISTRATION TESTS
    // --------------------------------------------------
    await this.recordAsync("Plugin Lifecycle", "Can register and initialize a plugin", async () => {
      const plugin = new ColorPaletteGeneratorPlugin();
      await manager.registerPlugin(plugin);
      
      const loaded = manager.getPlugin("neora_palette_gen");
      if (!loaded) throw new Error("Plugin was not loaded in Manager.");
      if (loaded.status !== PluginStatus.ACTIVE) {
        throw new Error(`Expected active status, got '${loaded.status}'`);
      }
    });

    await this.recordAsync("Plugin Lifecycle", "Can suspend and resume a plugin", async () => {
      const id = "neora_palette_gen";
      await manager.suspendPlugin(id);
      let plugin = manager.getPlugin(id);
      if (plugin?.status !== PluginStatus.SUSPENDED) {
        throw new Error("Failed to suspend plugin.");
      }

      await manager.resumePlugin(id);
      plugin = manager.getPlugin(id);
      if (plugin?.status !== PluginStatus.ACTIVE) {
        throw new Error("Failed to resume plugin.");
      }
    });

    await this.recordAsync("Plugin Lifecycle", "Can deactivate and uninstall a plugin", async () => {
      const id = "neora_palette_gen";
      await manager.uninstallPlugin(id);
      const plugin = manager.getPlugin(id);
      if (plugin) throw new Error("Plugin still remains registered after uninstall.");
    });

    // --------------------------------------------------
    // 2. SANDBOX PERMISSION GUARD TESTS
    // --------------------------------------------------
    await this.recordAsync("Sandbox Security", "Fails when violating unrequested permissions", async () => {
      // Create a temporary plugin with zero permissions
      const mockPlugin = new ColorPaletteGeneratorPlugin();
      mockPlugin.manifest = {
        ...mockPlugin.manifest,
        id: "mock_secure_plugin",
        permissions: [] // no permissions
      };

      await manager.registerPlugin(mockPlugin);
      const sdk = manager.getPluginContext("mock_secure_plugin");
      if (!sdk) throw new Error("Plugin context not created.");

      // Check if permission guard works
      if (sdk.verifyPermission("canvas")) {
        throw new Error("Security breach: Unrequested permission was granted.");
      }

      try {
        await sdk.canvas.setDimensions(2000, 2000);
        throw new Error("Security breach: Allowed setting dimensions without canvas permission.");
      } catch (err: any) {
        if (!err.message.includes("Permission 'canvas' is required")) {
          throw new Error(`Expected permission error, got: ${err.message}`);
        }
      }

      await manager.uninstallPlugin("mock_secure_plugin");
    });

    await this.recordAsync("Sandbox Security", "Succeeds when invoking declared permissions", async () => {
      const plugin = new ColorPaletteGeneratorPlugin();
      await manager.registerPlugin(plugin);
      const sdk = manager.getPluginContext("neora_palette_gen");
      if (!sdk) throw new Error("Plugin context not created.");

      if (!sdk.verifyPermission("assets")) {
        throw new Error("Failed to grant declared permission 'assets'.");
      }
    });

    // --------------------------------------------------
    // 3. TOOL REGISTRY & INTER ACTION TESTS
    // --------------------------------------------------
    await this.recordAsync("Tool Registry", "Auto-registers commands to central ToolRegistry", async () => {
      const tool = registry.getTool("neora_palette_gen.generate");
      if (!tool) throw new Error("Tool registry is missing registered command.");
      if (tool.pluginId !== "neora_palette_gen") throw new Error("Incorrect plugin ID assignment.");
    });

    await this.recordAsync("Tool Registry", "Executes command successfully and retrieves AI output", async () => {
      const tool = registry.getTool("neora_palette_gen.generate");
      if (!tool) throw new Error("Generate command tool not found.");

      const result = await tool.execute({ theme: "Minimalist Pastel" }, manager.getPluginContext("neora_palette_gen")!);
      if (result.status !== "success") throw new Error("Tool execution status was not success.");
      if (!Array.isArray(result.colors) || result.colors.length === 0) {
        throw new Error("Tool execution failed to return parsed colors.");
      }
    });

    // --------------------------------------------------
    // 4. MODEL ADAPTER TESTS
    // --------------------------------------------------
    this.record("Model Adapter", "Can switch active model provider adapters", () => {
      const initial = models.getActiveProviderId("text");
      models.setActiveProvider("text", "groq");
      const updated = models.getActiveProviderId("text");
      
      if (updated !== "groq") throw new Error("Failed to switch active text provider.");
      
      // restore
      models.setActiveProvider("text", initial);
    });

    // --------------------------------------------------
    // 5. MCP COMPLIANCE TESTS
    // --------------------------------------------------
    this.record("Model Context Protocol (MCP)", "Correctly serializes tools to MCP schemas", () => {
      const mcpTools = mcp.listMCPTools();
      const swatchTool = mcpTools.find(t => t.name === "neora_palette_gen_generate");
      if (!swatchTool) throw new Error("MCP Tool serializer missed or incorrectly formatted registered commands.");
      if (swatchTool.inputSchema.type !== "object") {
        throw new Error("Invalid MCP schema object generation.");
      }
    });

    await this.recordAsync("Model Context Protocol (MCP)", "Can dispatch calls through MCP Request Handler", async () => {
      const res = await mcp.handleMCPRequest({
        method: "tools/call",
        params: {
          name: "neora_palette_gen_generate",
          arguments: { theme: "Golden Sand" }
        }
      });

      if (res.error) throw new Error(`MCP Call handler returned error: ${res.error.message}`);
      const textResponse = res.result.content[0].text;
      if (!textResponse.includes("Golden Sand")) {
        throw new Error("MCP Call result failed to propagate args to execute handler.");
      }
    });

    // Cleanup and register all sample plugins for full operational use in application
    manager.clearAll();
    registry.clear();

    await manager.registerPlugin(new ColorPaletteGeneratorPlugin());
    await manager.registerPlugin(new DesignCriticPlugin());
    await manager.registerPlugin(new PosterGeneratorPlugin());

    console.log(`[PluginTestSuite] Suite complete. Executed ${this.results.length} specs.`);
    return this.results;
  }
}
