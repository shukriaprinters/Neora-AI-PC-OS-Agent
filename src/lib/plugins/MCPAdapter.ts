/**
 * NEORA AI DESIGNER OS - MODEL CONTEXT PROTOCOL (MCP) ADAPTER
 * Standardized bridge connecting Neora's tool registry to LLM Agent systems.
 */

import { IMCPTool, IMCPRequest, IMCPResponse } from "./types";
import { ToolRegistry } from "./ToolRegistry";
import { PluginManager } from "./PluginManager";

export class MCPAdapter {
  private static instance: MCPAdapter;
  private toolRegistry = ToolRegistry.getInstance();
  private pluginManager = PluginManager.getInstance();

  private constructor() {}

  public static getInstance(): MCPAdapter {
    if (!MCPAdapter.instance) {
      MCPAdapter.instance = new MCPAdapter();
    }
    return MCPAdapter.instance;
  }

  /**
   * Translates installed ToolRegistry tools into standard MCP schema shapes
   */
  public listMCPTools(): IMCPTool[] {
    const tools = this.toolRegistry.listTools();
    return tools.map(t => ({
      name: t.id.replace(/\./g, "_"), // convert namespaces to safe characters e.g. "pluginId_toolId"
      description: t.description,
      inputSchema: t.inputSchema || {
        type: "object" as const,
        properties: {},
        required: []
      }
    }));
  }

  /**
   * Handles incoming MCP Tool Invocation JSON-RPC requests
   */
  public async handleMCPRequest(request: IMCPRequest): Promise<IMCPResponse> {
    const { method, params } = request;

    if (method === "tools/list") {
      return {
        result: {
          tools: this.listMCPTools()
        }
      };
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params || {};
      if (!name) {
        return {
          error: { code: -32602, message: "Missing tool name parameter." }
        };
      }

      // Convert back from MCP safe char names e.g. "plugin_palette_gen" -> "plugin.palette.gen"
      // Our tool names are namespaces, look for exact or translated match
      const tools = this.toolRegistry.listTools();
      const tool = tools.find(t => t.id.replace(/\./g, "_") === name || t.id === name);

      if (!tool) {
        return {
          error: { code: -32601, message: `Tool '${name}' was not found in the Neora Registry.` }
        };
      }

      try {
        const context = this.pluginManager.getPluginContext(tool.pluginId);
        if (!context) {
          return {
            error: { code: -32603, message: `Context could not be loaded for plugin '${tool.pluginId}'.` }
          };
        }

        console.log(`[MCPAdapter] Invoking tool '${tool.id}' on behalf of MCP Client with arguments:`, args);
        const result = await tool.execute(args, context);
        return {
          result: {
            content: [
              {
                type: "text",
                text: typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)
              }
            ]
          }
        };
      } catch (err: any) {
        return {
          error: {
            code: -32603,
            message: err?.message || "Execution exception occurred within tool call."
          }
        };
      }
    }

    return {
      error: { code: -32601, message: `Unsupported method '${method}'.` }
    };
  }
}
