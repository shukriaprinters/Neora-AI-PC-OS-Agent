/**
 * AI Agent Service
 * Implements observe-think-plan-act agent loop with multi-model support
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import osManager from './osManager';
import workflowEngine from './workflowEngine';

interface AgentState {
  status: 'idle' | 'thinking' | 'planning' | 'executing' | 'waiting';
  currentTask: string | null;
  context: Map<string, any>;
  shortTermMemory: string[];
  lastAction: string | null;
}

interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  suggestedActions: string[];
}

interface ExecutionPlan {
  id: string;
  intent: string;
  steps: Array<{
    action: string;
    description: string;
    dependencies?: string[];
  }>;
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ObservationResult {
  timestamp: string;
  systemMetrics: any;
  activeProcesses: number;
  screenContent?: string;
  recentLogs: string[];
}

export class AIAgent extends EventEmitter {
  private static instance: AIAgent;
  private agentState: AgentState;
  private planHistory: ExecutionPlan[] = [];
  private observationHistory: ObservationResult[] = [];
  private userPreferences: Map<string, any> = new Map();
  private conversationMemory: string[] = [];
  private maxMemorySize = 50;

  private constructor() {
    super();
    this.agentState = {
      status: 'idle',
      currentTask: null,
      context: new Map(),
      shortTermMemory: [],
      lastAction: null,
    };
    this.initializeDefaultPreferences();
  }

  static getInstance(): AIAgent {
    if (!AIAgent.instance) {
      AIAgent.instance = new AIAgent();
    }
    return AIAgent.instance;
  }

  /**
   * Main agent loop: Observe -> Think -> Plan -> Act
   */
  async processUserIntent(userInput: string): Promise<ExecutionPlan> {
    const taskId = uuidv4();
    this.agentState.currentTask = taskId;

    try {
      // Step 1: OBSERVE - Gather current system state
      this.agentState.status = 'thinking';
      const observation = await this.observe();
      this.observationHistory.push(observation);

      // Step 2: THINK - Analyze user intent
      const intentAnalysis = await this.analyzeIntent(userInput, observation);
      this.conversationMemory.push(userInput);

      // Step 3: PLAN - Create execution plan
      this.agentState.status = 'planning';
      const executionPlan = await this.createExecutionPlan(intentAnalysis, observation);
      this.planHistory.push(executionPlan);

      // Step 4: ACT - Execute the plan
      this.agentState.status = 'executing';
      await this.executePlan(executionPlan);

      this.agentState.status = 'idle';
      this.agentState.currentTask = null;
      this.agentState.lastAction = intentAnalysis.intent;

      return executionPlan;
    } catch (error: any) {
      this.agentState.status = 'idle';
      this.emit('agentError', { taskId, error: error.message });
      throw error;
    }
  }

  /**
   * OBSERVE: Gather current system state and context
   */
  private async observe(): Promise<ObservationResult> {
    try {
      const [systemMetrics, processes, logs] = await Promise.all([
        osManager.getSystemMetrics(),
        osManager.getRunningProcesses(),
        Promise.resolve(osManager.getCommandHistory(10)),
      ]);

      return {
        timestamp: new Date().toISOString(),
        systemMetrics,
        activeProcesses: processes.length,
        recentLogs: logs.map(log => log.output),
      };
    } catch (error: any) {
      this.emit('observationError', { error: error.message });
      return {
        timestamp: new Date().toISOString(),
        systemMetrics: { cpu: 0, memory: 0, disk: 0 },
        activeProcesses: 0,
        recentLogs: [],
      };
    }
  }

  /**
   * THINK: Analyze user intent and extract key information
   */
  private async analyzeIntent(userInput: string, observation: ObservationResult): Promise<IntentAnalysis> {
    // In production, this would call the LLM (Groq/Gemini)
    // For now, we'll implement a rule-based system

    const lowerInput = userInput.toLowerCase();
    const entities: Record<string, any> = {
      timestamp: new Date().toISOString(),
      systemState: observation,
    };

    let intent = 'general_task';
    let confidence = 0.5;
    let suggestedActions: string[] = [];

    // Intent recognition patterns
    if (lowerInput.includes('list') || lowerInput.includes('show')) {
      intent = 'information_retrieval';
      confidence = 0.9;
      suggestedActions = ['GetRunningProcesses', 'ListDirectory', 'GetSystemInfo'];
    } else if (
      lowerInput.includes('optimize') ||
      lowerInput.includes('improve') ||
      lowerInput.includes('faster')
    ) {
      intent = 'system_optimization';
      confidence = 0.85;
      suggestedActions = ['AnalyzePerformance', 'KillUnnecessaryProcesses', 'ClearCache'];
    } else if (
      lowerInput.includes('help') ||
      lowerInput.includes('assist') ||
      lowerInput.includes('need')
    ) {
      intent = 'assistance_request';
      confidence = 0.8;
      suggestedActions = ['ContextualizeProblem', 'SuggestSolutions', 'ExecuteFix'];
    } else if (
      lowerInput.includes('schedule') ||
      lowerInput.includes('remind') ||
      lowerInput.includes('set')
    ) {
      intent = 'task_scheduling';
      confidence = 0.85;
      suggestedActions = ['ParseSchedule', 'CreateWorkflow', 'RegisterTrigger'];
    } else if (
      lowerInput.includes('monitor') ||
      lowerInput.includes('watch') ||
      lowerInput.includes('alert')
    ) {
      intent = 'monitoring_setup';
      confidence = 0.8;
      suggestedActions = ['SetupMonitoring', 'ConfigureAlerts', 'TrackMetrics'];
    }

    // Extract entities using simple patterns
    const processMatch = userInput.match(/process\s+(\w+)/i);
    if (processMatch) {
      entities.processName = processMatch[1];
    }

    const fileMatch = userInput.match(/file\s+(.+?)(?:\s+in|$)/i);
    if (fileMatch) {
      entities.fileName = fileMatch[1];
    }

    return {
      intent,
      confidence,
      entities,
      suggestedActions,
    };
  }

  /**
   * PLAN: Create an executable plan based on intent analysis
   */
  private async createExecutionPlan(
    analysis: IntentAnalysis,
    observation: ObservationResult
  ): Promise<ExecutionPlan> {
    const planId = uuidv4();
    const steps: ExecutionPlan['steps'] = [];

    // Generate steps based on intent
    switch (analysis.intent) {
      case 'information_retrieval':
        steps.push(
          {
            action: 'GatherSystemInfo',
            description: 'Collect current system information',
          },
          {
            action: 'ProcessAndFormat',
            description: 'Format information for display',
          }
        );
        break;

      case 'system_optimization':
        steps.push(
          {
            action: 'AnalyzeResourceUsage',
            description: 'Analyze current resource consumption',
          },
          {
            action: 'IdentifyBottlenecks',
            description: 'Identify performance bottlenecks',
          },
          {
            action: 'ExecuteOptimizations',
            description: 'Apply optimizations',
          },
          {
            action: 'VerifyImprovement',
            description: 'Verify performance improvement',
          }
        );
        break;

      case 'task_scheduling':
        steps.push(
          {
            action: 'ParseScheduleSpec',
            description: 'Parse user schedule specification',
          },
          {
            action: 'CreateWorkflow',
            description: 'Create workflow from schedule',
          },
          {
            action: 'RegisterTrigger',
            description: 'Register workflow trigger',
          }
        );
        break;

      case 'monitoring_setup':
        steps.push(
          {
            action: 'ConfigureMonitoring',
            description: 'Set up monitoring configuration',
          },
          {
            action: 'StartMonitoring',
            description: 'Start monitoring service',
          }
        );
        break;

      default:
        steps.push(
          {
            action: 'ProcessUserRequest',
            description: 'Process user request',
          },
          {
            action: 'ExecuteAction',
            description: 'Execute appropriate action',
          }
        );
    }

    // Estimate duration
    const estimatedDuration = steps.length * 2000; // 2 seconds per step

    // Assess risk level
    const riskLevel: ExecutionPlan['riskLevel'] =
      analysis.intent === 'system_optimization' ? 'medium' : 'low';

    return {
      id: planId,
      intent: analysis.intent,
      steps,
      estimatedDuration,
      riskLevel,
    };
  }

  /**
   * ACT: Execute the created plan
   */
  private async executePlan(plan: ExecutionPlan): Promise<void> {
    this.emit('planExecutionStarted', { planId: plan.id, intent: plan.intent });

    try {
      for (const step of plan.steps) {
        this.emit('stepStarted', { stepAction: step.action, description: step.description });

        // Execute step based on action type
        const startTime = Date.now();

        try {
          switch (step.action) {
            case 'GatherSystemInfo':
              const systemInfo = await osManager.getSystemInfo();
              this.agentState.context.set('systemInfo', systemInfo);
              break;

            case 'AnalyzeResourceUsage':
              const metrics = await osManager.getSystemMetrics();
              this.agentState.context.set('resourceMetrics', metrics);
              break;

            case 'IdentifyBottlenecks':
              const processes = await osManager.getRunningProcesses();
              const bottlenecks = processes
                .sort((a, b) => (b.memory || 0) - (a.memory || 0))
                .slice(0, 5);
              this.agentState.context.set('bottlenecks', bottlenecks);
              break;

            case 'ExecuteOptimizations':
              // Simulate optimization
              await new Promise(resolve => setTimeout(resolve, 1000));
              this.agentState.context.set('optimizationStatus', 'completed');
              break;

            case 'VerifyImprovement':
              const newMetrics = await osManager.getSystemMetrics();
              this.agentState.context.set('verificationMetrics', newMetrics);
              break;

            case 'ProcessUserRequest':
            case 'ExecuteAction':
              // Generic action processing
              this.agentState.context.set('lastAction', step.action);
              break;

            default:
              console.log(`Executing action: ${step.action}`);
          }

          const duration = Date.now() - startTime;
          this.emit('stepCompleted', { stepAction: step.action, duration });
        } catch (stepError: any) {
          this.emit('stepFailed', { stepAction: step.action, error: stepError.message });
          // Continue with next step even if one fails
        }
      }

      this.emit('planExecutionCompleted', { planId: plan.id });
    } catch (error: any) {
      this.emit('planExecutionFailed', { planId: plan.id, error: error.message });
      throw error;
    }
  }

  /**
   * Update user preference based on interaction
   */
  setUserPreference(key: string, value: any): void {
    this.userPreferences.set(key, value);
    this.emit('preferenceUpdated', { key, value });
  }

  /**
   * Get user preference
   */
  getUserPreference(key: string): any {
    return this.userPreferences.get(key);
  }

  /**
   * Get agent state
   */
  getAgentState(): AgentState {
    return { ...this.agentState };
  }

  /**
   * Get plan history
   */
  getPlanHistory(limit?: number): ExecutionPlan[] {
    const size = limit || 20;
    return this.planHistory.slice(-size);
  }

  /**
   * Get conversation memory
   */
  getConversationMemory(): string[] {
    return [...this.conversationMemory];
  }

  /**
   * Clear memory
   */
  clearConversationMemory(): void {
    this.conversationMemory = [];
    this.agentState.shortTermMemory = [];
  }

  /**
   * Initialize default preferences
   */
  private initializeDefaultPreferences(): void {
    this.userPreferences.set('aggressiveOptimization', false);
    this.userPreferences.set('autoExecute', false);
    this.userPreferences.set('language', 'en');
    this.userPreferences.set('responseLevel', 'detailed');
  }

  /**
   * Shutdown agent
   */
  shutdown(): void {
    this.agentState.status = 'idle';
    this.conversationMemory = [];
    this.planHistory = [];
    this.observationHistory = [];
    this.userPreferences.clear();
  }
}

export default AIAgent.getInstance();
