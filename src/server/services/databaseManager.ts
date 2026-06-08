/**
 * Database Manager Service
 * Handles persistence, data schema management, and query execution
 */

import Database from 'better-sqlite3';
import path from 'path';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

interface WorkflowRecord {
  id: string;
  name: string;
  description: string | null;
  steps: string; // JSON string
  enabled: boolean;
  trigger_type: string | null;
  trigger_config: string | null;
  created_at: string;
  updated_at: string;
}

interface ExecutionRecord {
  id: string;
  workflow_id: string;
  execution_id: string;
  status: 'running' | 'completed' | 'failed';
  results: string; // JSON string
  started_at: string;
  completed_at: string | null;
}

interface CommandRecord {
  id: string;
  command: string;
  status: 'success' | 'failed';
  output: string;
  error: string | null;
  duration_ms: number;
  executed_at: string;
}

interface PreferenceRecord {
  id: string;
  key: string;
  value: string; // JSON string
  category: string | null;
  updated_at: string;
}

export class DatabaseManager extends EventEmitter {
  private static instance: DatabaseManager;
  private db: Database.Database | null = null;
  private dbPath: string;

  private constructor(dbPath?: string) {
    super();
    this.dbPath = dbPath || path.join(process.cwd(), 'neora-agent.db');
  }

  static getInstance(dbPath?: string): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(dbPath);
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database and create tables
   */
  initialize(): void {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
      this.createTables();
      this.emit('initialized');
      console.log(`[Database] Initialized at ${this.dbPath}`);
    } catch (error: any) {
      console.error('[Database] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private createTables(): void {
    if (!this.db) return;

    // Workflows table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        steps TEXT NOT NULL,
        enabled BOOLEAN DEFAULT 1,
        trigger_type TEXT,
        trigger_config TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        INDEX idx_name (name),
        INDEX idx_enabled (enabled)
      );
    `);

    // Executions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        execution_id TEXT NOT NULL,
        status TEXT NOT NULL,
        results TEXT,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (workflow_id) REFERENCES workflows(id),
        INDEX idx_workflow_id (workflow_id),
        INDEX idx_execution_id (execution_id),
        INDEX idx_status (status)
      );
    `);

    // Commands table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS commands (
        id TEXT PRIMARY KEY,
        command TEXT NOT NULL,
        status TEXT NOT NULL,
        output TEXT,
        error TEXT,
        duration_ms INTEGER,
        executed_at TEXT NOT NULL,
        INDEX idx_status (status),
        INDEX idx_executed_at (executed_at)
      );
    `);

    // Preferences table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS preferences (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        category TEXT,
        updated_at TEXT NOT NULL,
        INDEX idx_key (key),
        INDEX idx_category (category)
      );
    `);

    // Agent history table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_history (
        id TEXT PRIMARY KEY,
        intent TEXT NOT NULL,
        input TEXT NOT NULL,
        plan TEXT,
        result TEXT,
        confidence REAL,
        duration_ms INTEGER,
        created_at TEXT NOT NULL,
        INDEX idx_intent (intent),
        INDEX idx_created_at (created_at)
      );
    `);

    // System metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id TEXT PRIMARY KEY,
        cpu_usage REAL,
        memory_usage REAL,
        disk_usage REAL,
        active_processes INTEGER,
        timestamp TEXT NOT NULL,
        INDEX idx_timestamp (timestamp)
      );
    `);

    console.log('[Database] Tables created/verified');
  }

  /**
   * Save workflow to database
   */
  saveWorkflow(workflow: any): string {
    if (!this.db) throw new Error('Database not initialized');

    const id = workflow.id || uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO workflows 
      (id, name, description, steps, enabled, trigger_type, trigger_config, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      workflow.name,
      workflow.description || null,
      JSON.stringify(workflow.steps),
      workflow.enabled ? 1 : 0,
      workflow.trigger?.type || null,
      workflow.trigger?.config ? JSON.stringify(workflow.trigger.config) : null,
      workflow.createdAt?.toISOString() || now,
      now
    );

    this.emit('workflowSaved', { id, name: workflow.name });
    return id;
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): any | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM workflows WHERE id = ?');
    const row = stmt.get(id) as WorkflowRecord | undefined;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      steps: JSON.parse(row.steps),
      enabled: Boolean(row.enabled),
      trigger: row.trigger_type ? {
        type: row.trigger_type,
        config: row.trigger_config ? JSON.parse(row.trigger_config) : undefined,
      } : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): any[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM workflows ORDER BY updated_at DESC');
    const rows = stmt.all() as WorkflowRecord[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      steps: JSON.parse(row.steps),
      enabled: Boolean(row.enabled),
      trigger: row.trigger_type ? {
        type: row.trigger_type,
        config: row.trigger_config ? JSON.parse(row.trigger_config) : undefined,
      } : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  /**
   * Delete workflow
   */
  deleteWorkflow(id: string): boolean {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM workflows WHERE id = ?');
    const result = stmt.run(id);

    this.emit('workflowDeleted', { id });
    return (result.changes || 0) > 0;
  }

  /**
   * Save execution record
   */
  saveExecution(workflowId: string, executionId: string, context: any): void {
    if (!this.db) throw new Error('Database not initialized');

    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO executions 
      (id, workflow_id, execution_id, status, results, started_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      workflowId,
      executionId,
      context.status,
      JSON.stringify({
        stepResults: Array.from(context.stepResults.entries()),
        variables: Array.from(context.variables.entries()),
      }),
      context.startTime.toISOString(),
      context.endTime?.toISOString() || null
    );

    this.emit('executionSaved', { workflowId, executionId });
  }

  /**
   * Get execution history
   */
  getExecutionHistory(workflowId: string, limit: number = 50): any[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM executions 
      WHERE workflow_id = ? 
      ORDER BY started_at DESC 
      LIMIT ?
    `);

    const rows = stmt.all(workflowId, limit) as ExecutionRecord[];

    return rows.map(row => ({
      id: row.id,
      workflowId: row.workflow_id,
      executionId: row.execution_id,
      status: row.status,
      results: row.results ? JSON.parse(row.results) : null,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
    }));
  }

  /**
   * Save command execution
   */
  saveCommand(command: string, status: string, output: string, error: string | null, duration: number): void {
    if (!this.db) throw new Error('Database not initialized');

    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO commands 
      (id, command, status, output, error, duration_ms, executed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      command,
      status,
      output,
      error,
      duration,
      new Date().toISOString()
    );

    this.emit('commandSaved', { id, command, status });
  }

  /**
   * Get command history
   */
  getCommandHistory(limit: number = 50): any[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM commands 
      ORDER BY executed_at DESC 
      LIMIT ?
    `);

    const rows = stmt.all(limit) as CommandRecord[];

    return rows.map(row => ({
      id: row.id,
      command: row.command,
      status: row.status,
      output: row.output,
      error: row.error,
      durationMs: row.duration_ms,
      executedAt: new Date(row.executed_at),
    }));
  }

  /**
   * Save user preference
   */
  setPreference(key: string, value: any, category?: string): void {
    if (!this.db) throw new Error('Database not initialized');

    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO preferences 
      (id, key, value, category, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      key,
      JSON.stringify(value),
      category || null,
      new Date().toISOString()
    );

    this.emit('preferenceSaved', { key, value });
  }

  /**
   * Get preference
   */
  getPreference(key: string): any | null {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT value FROM preferences WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;

    return row ? JSON.parse(row.value) : null;
  }

  /**
   * Get all preferences
   */
  getAllPreferences(): Record<string, any> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT key, value FROM preferences');
    const rows = stmt.all() as Array<{ key: string; value: string }>;

    const preferences: Record<string, any> = {};
    for (const row of rows) {
      preferences[row.key] = JSON.parse(row.value);
    }

    return preferences;
  }

  /**
   * Save system metrics
   */
  saveMetrics(cpu: number, memory: number, disk: number, processes: number): void {
    if (!this.db) throw new Error('Database not initialized');

    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO system_metrics 
      (id, cpu_usage, memory_usage, disk_usage, active_processes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      cpu,
      memory,
      disk,
      processes,
      new Date().toISOString()
    );
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(limit: number = 100): any[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM system_metrics 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    const rows = stmt.all(limit) as Array<any>;

    return rows.map(row => ({
      cpu: row.cpu_usage,
      memory: row.memory_usage,
      disk: row.disk_usage,
      processes: row.active_processes,
      timestamp: new Date(row.timestamp),
    })).reverse();
  }

  /**
   * Save agent action to history
   */
  saveAgentAction(intent: string, input: string, plan: any, result: any, confidence: number, duration: number): void {
    if (!this.db) throw new Error('Database not initialized');

    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO agent_history 
      (id, intent, input, plan, result, confidence, duration_ms, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      intent,
      input,
      JSON.stringify(plan),
      JSON.stringify(result),
      confidence,
      duration,
      new Date().toISOString()
    );

    this.emit('agentActionSaved', { id, intent });
  }

  /**
   * Get agent history
   */
  getAgentHistory(limit: number = 50): any[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM agent_history 
      ORDER BY created_at DESC 
      LIMIT ?
    `);

    const rows = stmt.all(limit) as Array<any>;

    return rows.map(row => ({
      id: row.id,
      intent: row.intent,
      input: row.input,
      plan: JSON.parse(row.plan),
      result: JSON.parse(row.result),
      confidence: row.confidence,
      durationMs: row.duration_ms,
      createdAt: new Date(row.created_at),
    }));
  }

  /**
   * Get database statistics
   */
  getStatistics(): Record<string, number> {
    if (!this.db) throw new Error('Database not initialized');

    const counts: Record<string, number> = {};
    const tables = [
      'workflows',
      'executions',
      'commands',
      'preferences',
      'agent_history',
      'system_metrics',
    ];

    for (const table of tables) {
      const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`);
      const result = stmt.get() as { count: number };
      counts[table] = result.count;
    }

    return counts;
  }

  /**
   * Cleanup old records (maintenance)
   */
  cleanup(daysToKeep: number = 30): void {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

    // Clean up old system metrics
    this.db.prepare('DELETE FROM system_metrics WHERE timestamp < ?').run(cutoffDate);

    // Clean up old command history
    this.db.prepare('DELETE FROM commands WHERE executed_at < ?').run(cutoffDate);

    // Clean up old agent history
    this.db.prepare('DELETE FROM agent_history WHERE created_at < ?').run(cutoffDate);

    this.emit('cleaned', { cutoffDate, daysToKeep });
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.emit('closed');
      console.log('[Database] Connection closed');
    }
  }

  /**
   * Execute raw SQL query (for advanced operations)
   */
  query<T = any>(sql: string, params?: any[]): T[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(sql);
    return stmt.all(...(params || [])) as T[];
  }

  /**
   * Execute raw SQL statement (for inserts/updates)
   */
  execute(sql: string, params?: any[]): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(sql);
    return stmt.run(...(params || []));
  }
}

export default DatabaseManager.getInstance();
