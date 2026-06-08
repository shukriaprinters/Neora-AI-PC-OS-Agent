/**
 * Neora AI OS Agent - Integrated Backend Server
 * Central hub for all system services and API endpoints
 */

import express, { Express, Request, Response } from 'express';
import { createServer as createHttpServer, Server as HTTPServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import osManager from './services/osManager';
import websocketManager from './services/websocketManager';
import workflowEngine from './services/workflowEngine';
import aiAgent from './services/aiAgent';
import databaseManager from './services/databaseManager';
import securityManager from './services/securityManager';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'production';
}

class NeorAIServer {
  private app: Express;
  private httpServer: HTTPServer;
  private config: ServerConfig;
  private geminiClient: GoogleGenAI | null = null;

  constructor(config?: Partial<ServerConfig>) {
    this.app = express();
    this.config = {
      port: config?.port || parseInt(process.env.PORT || '3000'),
      host: config?.host || '0.0.0.0',
      environment: (config?.environment as any) || 'development',
    };

    this.httpServer = createHttpServer(this.app);
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeServices();
  }

  /**
   * Initialize middleware
   */
  private initializeMiddleware(): void {
    // JSON parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // Logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // ==================== SYSTEM ENDPOINTS ====================

    // Get system information
    this.app.get('/api/system/info', async (req: Request, res: Response) => {
      try {
        const systemInfo = await osManager.getSystemInfo();
        res.json({ success: true, data: systemInfo });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get system metrics
    this.app.get('/api/system/metrics', async (req: Request, res: Response) => {
      try {
        const metrics = await osManager.getSystemMetrics();
        res.json({ success: true, data: metrics });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get running processes
    this.app.get('/api/system/processes', async (req: Request, res: Response) => {
      try {
        const processes = await osManager.getRunningProcesses();
        res.json({ success: true, data: processes });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Kill a process
    this.app.post('/api/system/process/kill', async (req: Request, res: Response) => {
      try {
        const { pid } = req.body;
        if (!pid) {
          return res.status(400).json({ success: false, error: 'PID required' });
        }

        const result = await osManager.killProcess(pid);
        res.json({ success: result, data: { pid, killed: result } });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get file system info
    this.app.get('/api/system/files', async (req: Request, res: Response) => {
      try {
        const { path: dirPath } = req.query;
        const fileInfo = await osManager.getFileSystemInfo(dirPath as string);
        res.json({ success: true, data: fileInfo });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Capture screenshot
    this.app.get('/api/system/screenshot', async (req: Request, res: Response) => {
      try {
        const screenshot = await osManager.captureScreenshot();
        if (screenshot) {
          res.json({ success: true, data: { image: screenshot, format: 'base64' } });
        } else {
          res.status(501).json({ success: false, error: 'Screenshot not supported on this platform' });
        }
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Execute command
    this.app.post('/api/system/command', async (req: Request, res: Response) => {
      try {
        const { command, timeout, cwd, userId } = req.body;
        if (!command) {
          return res.status(400).json({ success: false, error: 'Command required' });
        }

        // Security validation
        const validation = securityManager.validateCommand(command, userId || 'api-client');
        if (!validation.allowed) {
          return res.status(403).json({
            success: false,
            error: validation.reason || 'Command not permitted',
          });
        }

        const result = await osManager.executeCommand(command, { timeout, cwd });
        
        // Log to database
        if (result.success) {
          databaseManager.saveCommand(command, 'success', result.output, null, 0);
        } else {
          databaseManager.saveCommand(command, 'failed', '', result.error || '', 0);
        }

        res.json({ success: result.success, data: result });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== WORKFLOW ENDPOINTS ====================

    // Create workflow
    this.app.post('/api/workflows', async (req: Request, res: Response) => {
      try {
        const { name, steps, description, trigger } = req.body;
        const workflow = workflowEngine.createWorkflow(name, steps, { description, trigger });
        res.json({ success: true, data: workflow });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get all workflows
    this.app.get('/api/workflows', (req: Request, res: Response) => {
      try {
        const workflows = workflowEngine.getAllWorkflows();
        res.json({ success: true, data: workflows });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get specific workflow
    this.app.get('/api/workflows/:id', (req: Request, res: Response) => {
      try {
        const workflow = workflowEngine.getWorkflow(req.params.id);
        if (!workflow) {
          return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        res.json({ success: true, data: workflow });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Execute workflow
    this.app.post('/api/workflows/:id/execute', async (req: Request, res: Response) => {
      try {
        const { variables } = req.body;
        const variablesMap = new Map(Object.entries(variables || {}));
        const context = await workflowEngine.executeWorkflow(req.params.id, variablesMap);
        res.json({ success: true, data: context });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Delete workflow
    this.app.delete('/api/workflows/:id', (req: Request, res: Response) => {
      try {
        const deleted = workflowEngine.deleteWorkflow(req.params.id);
        res.json({ success: deleted });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== AI AGENT ENDPOINTS ====================

    // Process user intent
    this.app.post('/api/agent/intent', async (req: Request, res: Response) => {
      try {
        const { input } = req.body;
        if (!input) {
          return res.status(400).json({ success: false, error: 'Input required' });
        }

        const plan = await aiAgent.processUserIntent(input);
        res.json({ success: true, data: plan });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get agent state
    this.app.get('/api/agent/state', (req: Request, res: Response) => {
      try {
        const state = aiAgent.getAgentState();
        res.json({
          success: true,
          data: {
            ...state,
            context: Array.from(state.context.entries()),
          },
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get plan history
    this.app.get('/api/agent/history', (req: Request, res: Response) => {
      try {
        const { limit } = req.query;
        const history = aiAgent.getPlanHistory(limit ? parseInt(limit as string) : 20);
        res.json({ success: true, data: history });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Set user preference
    this.app.post('/api/agent/preferences', (req: Request, res: Response) => {
      try {
        const { key, value } = req.body;
        aiAgent.setUserPreference(key, value);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== AI CHAT ENDPOINTS ====================

    // Groq chat completion
    this.app.post('/api/chat-groq', async (req: Request, res: Response) => {
      try {
        const { messages, model, key } = req.body;
        if (!messages || !Array.isArray(messages)) {
          return res.status(400).json({ error: 'Missing messages array' });
        }

        const groqKey = key || process.env.GROQ_API_KEY;
        if (!groqKey) {
          return res.json({
            status: 'api_key_missing',
            message: 'Groq API Key not configured',
          });
        }

        const groqModel = model || 'llama-3.3-70b-versatile';
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: groqModel,
            messages: messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          return res.status(response.status).json({ error: 'Groq API error' });
        }

        const result = await response.json();
        res.json({ status: 'success', data: result });
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // Gemini chat completion
    this.app.post('/api/chat-gemini', async (req: Request, res: Response) => {
      try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
          return res.status(400).json({ error: 'Missing messages array' });
        }

        if (!process.env.GEMINI_API_KEY) {
          return res.json({
            status: 'api_key_missing',
            message: 'Gemini API Key not configured',
          });
        }

        const client = this.getGeminiClient();
        const formattedMessages = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const response = await client.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: formattedMessages,
          config: { temperature: 0.7 },
        });

        res.json({ status: 'success', text: response.text });
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // ==================== DATABASE ENDPOINTS ====================

    // Get database statistics
    this.app.get('/api/database/stats', (req: Request, res: Response) => {
      try {
        const stats = databaseManager.getStatistics();
        res.json({ success: true, data: stats });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get command history from database
    this.app.get('/api/database/command-history', (req: Request, res: Response) => {
      try {
        const { limit } = req.query;
        const history = databaseManager.getCommandHistory(limit ? parseInt(limit as string) : 50);
        res.json({ success: true, data: history });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get agent history from database
    this.app.get('/api/database/agent-history', (req: Request, res: Response) => {
      try {
        const { limit } = req.query;
        const history = databaseManager.getAgentHistory(limit ? parseInt(limit as string) : 50);
        res.json({ success: true, data: history });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get system metrics history
    this.app.get('/api/database/metrics-history', (req: Request, res: Response) => {
      try {
        const { limit } = req.query;
        const history = databaseManager.getMetricsHistory(limit ? parseInt(limit as string) : 100);
        res.json({ success: true, data: history });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get execution history for workflow
    this.app.get('/api/database/execution-history/:workflowId', (req: Request, res: Response) => {
      try {
        const { limit } = req.query;
        const history = databaseManager.getExecutionHistory(
          req.params.workflowId,
          limit ? parseInt(limit as string) : 50
        );
        res.json({ success: true, data: history });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get user preferences
    this.app.get('/api/database/preferences', (req: Request, res: Response) => {
      try {
        const prefs = databaseManager.getAllPreferences();
        res.json({ success: true, data: prefs });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== SECURITY ENDPOINTS ====================

    // Get security statistics
    this.app.get('/api/security/stats', (req: Request, res: Response) => {
      try {
        const stats = securityManager.getSecurityStats();
        res.json({ success: true, data: stats });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get audit log
    this.app.get('/api/security/audit-log', (req: Request, res: Response) => {
      try {
        const { limit, type, status } = req.query;
        const log = securityManager.getAuditLog(
          limit ? parseInt(limit as string) : 100,
          {
            type: (type as any) || undefined,
            status: (status as any) || undefined,
          }
        );
        res.json({ success: true, data: log });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Validate command
    this.app.post('/api/security/validate-command', (req: Request, res: Response) => {
      try {
        const { command, userId } = req.body;
        const validation = securityManager.validateCommand(command, userId || 'api-client');
        res.json({ success: true, data: validation });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Generate API key
    this.app.post('/api/security/generate-key', (req: Request, res: Response) => {
      try {
        const apiKey = securityManager.generateApiKey(32);
        res.json({ success: true, data: { apiKey } });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== WEBSOCKET ENDPOINTS ====================

    // WebSocket connection info
    this.app.get('/api/websocket/info', (req: Request, res: Response) => {
      try {
        const clientCount = websocketManager.getClientCount();
        const clients = websocketManager.getAllClients().map(c => ({
          id: c.id,
          connectedAt: c.connectedAt,
          authenticated: c.authenticated,
        }));

        res.json({ success: true, data: { clientCount, clients } });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Broadcast message to WebSocket clients
    this.app.post('/api/websocket/broadcast', (req: Request, res: Response) => {
      try {
        const { message, type } = req.body;
        websocketManager.broadcast({
          type: type || 'system-message',
          payload: { message },
        });
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  /**
   * Initialize services
   */
  private initializeServices(): void {
    // Initialize database
    databaseManager.initialize();

    // Initialize WebSocket manager
    websocketManager.initialize(this.httpServer);

    // Setup event listeners for agent
    aiAgent.on('agentError', (data: any) => {
      console.error('[AI Agent] Error:', data);
    });

    aiAgent.on('planExecutionStarted', (data: any) => {
      websocketManager.broadcast({
        type: 'agent:plan-started',
        payload: data,
      });
    });

    aiAgent.on('planExecutionCompleted', (data: any) => {
      websocketManager.broadcast({
        type: 'agent:plan-completed',
        payload: data,
      });
    });

    // Setup event listeners for workflow engine
    workflowEngine.on('workflowCreated', (workflow: any) => {
      console.log('[Workflow] Created:', workflow.name);
      // Save to database
      databaseManager.saveWorkflow(workflow);
    });

    workflowEngine.on('executionCompleted', (data: any) => {
      // Save execution record
      const context = workflowEngine.getExecutionContext(data.executionId);
      if (context) {
        databaseManager.saveExecution(data.workflowId, data.executionId, context);
      }

      websocketManager.broadcast({
        type: 'workflow:completed',
        payload: data,
      });
    });

    // Setup event listeners for WebSocket
    websocketManager.on('message', (message: any) => {
      if (message.type === 'agent:process-intent') {
        aiAgent.processUserIntent(message.payload.input).catch((error: any) => {
          console.error('[Agent] Process error:', error);
        });
      }
    });

    console.log('[Server] All services initialized');
  }

  /**
   * Get or create Gemini client
   */
  private getGeminiClient(): GoogleGenAI {
    if (!this.geminiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }
      this.geminiClient = new GoogleGenAI({ apiKey });
    }
    return this.geminiClient;
  }

  /**
   * Start server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.config.port, this.config.host, () => {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║         NEORA AI OS AGENT - BACKEND SERVER ONLINE           ║
╠════════════════════════════════════════════════════════════╣
║ Listening: http://${this.config.host}:${this.config.port}
║ Environment: ${this.config.environment}
║ WebSocket: ws://localhost:${this.config.port}/ws
╚════════════════════════════════════════════════════════════╝
        `);
        resolve();
      });
    });
  }

  /**
   * Stop server gracefully
   */
  async stop(): Promise<void> {
    console.log('[Server] Shutting down...');

    // Cleanup services
    aiAgent.shutdown();
    workflowEngine.shutdown();
    websocketManager.shutdown();
    securityManager.shutdown();

    // Run database maintenance and close connection
    databaseManager.cleanup(30);
    databaseManager.close();

    return new Promise((resolve) => {
      this.httpServer.close(() => {
        console.log('[Server] Shut down complete');
        resolve();
      });
    });
  }

  /**
   * Get HTTP server instance
   */
  getHttpServer(): HTTPServer {
    return this.httpServer;
  }

  /**
   * Get Express app
   */
  getApp(): Express {
    return this.app;
  }
}

// Export for use in other modules
export { NeorAIServer };

// Start server if run directly
if (require.main === module) {
  const server = new NeorAIServer();

  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });
}
