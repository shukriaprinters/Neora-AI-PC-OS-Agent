/**
 * Workflow Engine Service
 * Manages autonomous task automation, workflow execution, and multi-step task orchestration
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import osManager from './osManager';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'command' | 'ai-call' | 'condition' | 'parallel' | 'loop' | 'delay';
  payload: any;
  retries?: number;
  timeout?: number;
  onSuccess?: string; // Next step ID
  onFailure?: string; // Fallback step ID
  dependencies?: string[]; // Step IDs that must complete first
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  trigger?: {
    type: 'manual' | 'scheduled' | 'event';
    config?: any;
  };
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ExecutionContext {
  workflowId: string;
  executionId: string;
  stepResults: Map<string, any>;
  variables: Map<string, any>;
  status: 'running' | 'paused' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
}

interface StepExecutionResult {
  stepId: string;
  status: 'success' | 'failed' | 'skipped';
  output: any;
  error?: string;
  duration: number;
  timestamp: string;
}

export class WorkflowEngine extends EventEmitter {
  private static instance: WorkflowEngine;
  private workflows: Map<string, Workflow> = new Map();
  private executionHistory: Map<string, ExecutionContext> = new Map();
  private activeExecutions: Set<string> = new Set();
  private scheduledTasks: Map<string, NodeJS.Timer> = new Map();

  private constructor() {
    super();
    this.loadDefaultWorkflows();
  }

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * Create a new workflow
   */
  createWorkflow(
    name: string,
    steps: Omit<WorkflowStep, 'id'>[],
    options?: {
      description?: string;
      trigger?: Workflow['trigger'];
    }
  ): Workflow {
    const workflow: Workflow = {
      id: uuidv4(),
      name,
      description: options?.description,
      steps: steps.map(step => ({
        ...step,
        id: uuidv4(),
      })),
      trigger: options?.trigger,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.workflows.set(workflow.id, workflow);
    this.emit('workflowCreated', workflow);

    return workflow;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    workflowId: string,
    variables?: Map<string, any>
  ): Promise<ExecutionContext> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = uuidv4();
    const context: ExecutionContext = {
      workflowId,
      executionId,
      stepResults: new Map(),
      variables: variables || new Map(),
      status: 'running',
      startTime: new Date(),
    };

    this.activeExecutions.add(executionId);
    this.executionHistory.set(executionId, context);
    this.emit('executionStarted', { workflowId, executionId });

    try {
      await this.executeSteps(workflow.steps, context);
      context.status = 'completed';
      context.endTime = new Date();
    } catch (error: any) {
      context.status = 'failed';
      context.endTime = new Date();
      this.emit('executionFailed', { workflowId, executionId, error: error.message });
    }

    this.activeExecutions.delete(executionId);
    this.emit('executionCompleted', { workflowId, executionId, context });

    return context;
  }

  /**
   * Execute workflow steps in order
   */
  private async executeSteps(steps: WorkflowStep[], context: ExecutionContext): Promise<void> {
    const executedSteps = new Set<string>();

    for (const step of steps) {
      if (context.status === 'paused') {
        break;
      }

      // Check dependencies
      if (step.dependencies) {
        const allDepsMet = step.dependencies.every(depId => executedSteps.has(depId));
        if (!allDepsMet) {
          continue; // Skip step if dependencies not met
        }
      }

      const result = await this.executeStep(step, context);
      context.stepResults.set(step.id, result);
      executedSteps.add(step.id);

      // Handle conditional branching
      if (result.status === 'success' && step.onSuccess) {
        // Find and execute next step
        const nextStep = steps.find(s => s.id === step.onSuccess);
        if (nextStep && !executedSteps.has(nextStep.id)) {
          await this.executeStep(nextStep, context);
          executedSteps.add(nextStep.id);
        }
      } else if (result.status === 'failed' && step.onFailure) {
        const fallbackStep = steps.find(s => s.id === step.onFailure);
        if (fallbackStep && !executedSteps.has(fallbackStep.id)) {
          await this.executeStep(fallbackStep, context);
          executedSteps.add(fallbackStep.id);
        }
      }
    }
  }

  /**
   * Execute individual step
   */
  private async executeStep(
    step: WorkflowStep,
    context: ExecutionContext
  ): Promise<StepExecutionResult> {
    const startTime = Date.now();
    const result: StepExecutionResult = {
      stepId: step.id,
      status: 'skipped',
      output: null,
      duration: 0,
      timestamp: new Date().toISOString(),
    };

    try {
      const timeoutMs = step.timeout || 30000;
      let output: any;

      switch (step.type) {
        case 'command':
          output = await this.executeCommandStep(step, context);
          break;

        case 'ai-call':
          output = await this.executeAIStep(step, context);
          break;

        case 'condition':
          output = await this.evaluateCondition(step, context);
          break;

        case 'delay':
          output = await this.executeDelay(step);
          break;

        case 'parallel':
          output = await this.executeParallel(step, context);
          break;

        case 'loop':
          output = await this.executeLoop(step, context);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      result.status = 'success';
      result.output = output;
    } catch (error: any) {
      if (step.retries && step.retries > 0) {
        // Retry logic
        for (let attempt = 1; attempt <= step.retries; attempt++) {
          try {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            result.output = await this.executeStep(step, context);
            result.status = 'success';
            break;
          } catch (retryError) {
            if (attempt === step.retries) {
              result.status = 'failed';
              result.error = (retryError as any).message || 'Retry failed';
            }
          }
        }
      } else {
        result.status = 'failed';
        result.error = error.message;
      }
    }

    result.duration = Date.now() - startTime;
    this.emit('stepExecuted', { stepId: step.id, result });

    return result;
  }

  /**
   * Execute command step
   */
  private async executeCommandStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    const { command, substituteVariables } = step.payload;

    if (!command) {
      throw new Error('Command step missing command payload');
    }

    let finalCommand = command;

    // Substitute variables if enabled
    if (substituteVariables) {
      for (const [key, value] of context.variables) {
        finalCommand = finalCommand.replace(`{{${key}}}`, String(value));
      }
    }

    const result = await osManager.executeCommand(finalCommand);

    if (!result.success) {
      throw new Error(result.error || 'Command execution failed');
    }

    return result.output;
  }

  /**
   * Execute AI call step
   */
  private async executeAIStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    const { prompt, model } = step.payload;

    if (!prompt) {
      throw new Error('AI step missing prompt');
    }

    // This would integrate with the AI service
    return {
      model: model || 'default',
      prompt,
      context: Array.from(context.variables.entries()),
      status: 'executed',
    };
  }

  /**
   * Evaluate condition
   */
  private async evaluateCondition(step: WorkflowStep, context: ExecutionContext): Promise<boolean> {
    const { expression } = step.payload;

    if (!expression) {
      throw new Error('Condition step missing expression');
    }

    // Simple expression evaluation with variable substitution
    let evaluable = expression;
    for (const [key, value] of context.variables) {
      evaluable = evaluable.replace(`{{${key}}}`, String(value));
    }

    try {
      return Function(`"use strict"; return (${evaluable})`)();
    } catch (error) {
      throw new Error(`Failed to evaluate condition: ${(error as any).message}`);
    }
  }

  /**
   * Execute delay step
   */
  private async executeDelay(step: WorkflowStep): Promise<void> {
    const { duration } = step.payload;

    if (typeof duration !== 'number') {
      throw new Error('Delay step missing duration');
    }

    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * Execute parallel steps
   */
  private async executeParallel(step: WorkflowStep, context: ExecutionContext): Promise<any[]> {
    const { steps: parallelSteps } = step.payload;

    if (!Array.isArray(parallelSteps)) {
      throw new Error('Parallel step missing steps array');
    }

    const results = await Promise.all(
      parallelSteps.map(substep => this.executeStep(substep, context))
    );

    return results;
  }

  /**
   * Execute loop step
   */
  private async executeLoop(step: WorkflowStep, context: ExecutionContext): Promise<any[]> {
    const { items, substeps } = step.payload;

    if (!Array.isArray(items) || !Array.isArray(substeps)) {
      throw new Error('Loop step missing items or substeps');
    }

    const results = [];

    for (const item of items) {
      context.variables.set('_loopItem', item);

      for (const substep of substeps) {
        const result = await this.executeStep(substep, context);
        results.push(result);
      }
    }

    context.variables.delete('_loopItem');
    return results;
  }

  /**
   * Pause execution
   */
  pauseExecution(executionId: string): void {
    const context = this.executionHistory.get(executionId);
    if (context) {
      context.status = 'paused';
      this.emit('executionPaused', { executionId });
    }
  }

  /**
   * Resume execution
   */
  async resumeExecution(executionId: string): Promise<void> {
    const context = this.executionHistory.get(executionId);
    if (context && context.status === 'paused') {
      context.status = 'running';
      this.emit('executionResumed', { executionId });
    }
  }

  /**
   * Cancel execution
   */
  cancelExecution(executionId: string): void {
    this.activeExecutions.delete(executionId);
    const context = this.executionHistory.get(executionId);
    if (context) {
      context.status = 'failed';
      context.endTime = new Date();
      this.emit('executionCancelled', { executionId });
    }
  }

  /**
   * Get workflow
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get execution context
   */
  getExecutionContext(executionId: string): ExecutionContext | undefined {
    return this.executionHistory.get(executionId);
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): string[] {
    return Array.from(this.activeExecutions);
  }

  /**
   * Delete workflow
   */
  deleteWorkflow(workflowId: string): boolean {
    return this.workflows.delete(workflowId);
  }

  /**
   * Load default workflows
   */
  private loadDefaultWorkflows(): void {
    // Create a sample system health check workflow
    this.createWorkflow(
      'System Health Check',
      [
        {
          name: 'Get System Info',
          type: 'command',
          payload: {
            command: 'systemctl status',
            substituteVariables: false,
          },
        },
        {
          name: 'Check Disk Space',
          type: 'command',
          payload: {
            command: 'df -h',
            substituteVariables: false,
          },
        },
        {
          name: 'Evaluate Health',
          type: 'condition',
          payload: {
            expression: '1 === 1',
          },
        },
      ],
      {
        description: 'Periodically check system health',
        trigger: { type: 'scheduled', config: { interval: '1h' } },
      }
    );
  }

  /**
   * Shutdown workflow engine
   */
  shutdown(): void {
    // Cancel all active executions
    for (const executionId of this.activeExecutions) {
      this.cancelExecution(executionId);
    }

    // Clear scheduled tasks
    for (const timer of this.scheduledTasks.values()) {
      clearInterval(timer);
    }

    this.workflows.clear();
    this.executionHistory.clear();
    this.activeExecutions.clear();
    this.scheduledTasks.clear();
  }
}

export default WorkflowEngine.getInstance();
