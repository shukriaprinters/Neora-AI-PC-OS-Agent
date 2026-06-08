/**
 * Security Manager Service
 * Handles access control, command validation, and audit logging
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface Permission {
  resource: string;
  action: string;
  allowed: boolean;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'access' | 'denial' | 'exploit_attempt' | 'error';
  userId: string;
  resource: string;
  action: string;
  status: 'allowed' | 'denied';
  details?: Record<string, any>;
}

interface CommandValidator {
  pattern: RegExp;
  allowed: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export class SecurityManager extends EventEmitter {
  private static instance: SecurityManager;
  private auditLog: SecurityEvent[] = [];
  private commandWhitelist: CommandValidator[] = [];
  private permissionsMap: Map<string, Set<string>> = new Map();
  private maxAuditSize = 1000;
  private rateLimitMap: Map<string, number[]> = new Map();
  private maxRequestsPerMinute = 100;

  private constructor() {
    super();
    this.initializeSecurityPolicies();
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize security policies and whitelists
   */
  private initializeSecurityPolicies(): void {
    // Command validators - whitelist safe commands
    this.commandWhitelist = [
      // File operations
      { pattern: /^ls($|\s)/i, allowed: true, riskLevel: 'low' },
      { pattern: /^pwd($|\s)/i, allowed: true, riskLevel: 'low' },
      { pattern: /^cat\s+[a-zA-Z0-9._\/-]+($|\s)/i, allowed: true, riskLevel: 'low' },
      { pattern: /^find\s+/i, allowed: true, riskLevel: 'low' },
      { pattern: /^grep\s+/i, allowed: true, riskLevel: 'low' },
      { pattern: /^head\s+/i, allowed: true, riskLevel: 'low' },
      { pattern: /^tail\s+/i, allowed: true, riskLevel: 'low' },

      // System info
      { pattern: /^uname\s*/i, allowed: true, riskLevel: 'low' },
      { pattern: /^whoami\s*/i, allowed: true, riskLevel: 'low' },
      { pattern: /^date\s*/i, allowed: true, riskLevel: 'low' },
      { pattern: /^hostname\s*/i, allowed: true, riskLevel: 'low' },
      { pattern: /^df\s*/i, allowed: true, riskLevel: 'low' },
      { pattern: /^du\s*/i, allowed: true, riskLevel: 'low' },
      { pattern: /^free\s*/i, allowed: true, riskLevel: 'low' },

      // Process operations
      { pattern: /^ps\s+/i, allowed: true, riskLevel: 'low' },
      { pattern: /^tasklist\s*/i, allowed: true, riskLevel: 'low' },

      // Blocked dangerous commands
      { pattern: /rm\s+-rf/i, allowed: false, riskLevel: 'high' },
      { pattern: /del\s+\/s/i, allowed: false, riskLevel: 'high' },
      { pattern: /format\b/i, allowed: false, riskLevel: 'high' },
      { pattern: /shutdown\b/i, allowed: false, riskLevel: 'high' },
      { pattern: /reboot\b/i, allowed: false, riskLevel: 'high' },
      { pattern: /^\s*sudo\b/i, allowed: false, riskLevel: 'high' },
      { pattern: /mkfs\b/i, allowed: false, riskLevel: 'high' },
      { pattern: /dd\s+if=/i, allowed: false, riskLevel: 'high' },
    ];

    // Initialize default permissions
    this.permissionsMap.set('system:read', new Set(['info', 'metrics', 'processes', 'files']));
    this.permissionsMap.set('system:write', new Set(['execute-command']));
    this.permissionsMap.set('workflow:read', new Set(['list', 'get', 'history']));
    this.permissionsMap.set('workflow:write', new Set(['create', 'execute', 'delete']));
    this.permissionsMap.set('agent:read', new Set(['state', 'history']));
    this.permissionsMap.set('agent:write', new Set(['process-intent', 'set-preference']));
  }

  /**
   * Validate command before execution
   */
  validateCommand(command: string, userId: string = 'system'): {
    allowed: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    reason?: string;
  } {
    // Check rate limiting
    if (!this.checkRateLimit(userId)) {
      this.logSecurityEvent({
        type: 'denial',
        userId,
        resource: 'command',
        action: 'execute',
        details: { reason: 'Rate limit exceeded' },
      });
      return {
        allowed: false,
        riskLevel: 'high',
        reason: 'Rate limit exceeded',
      };
    }

    // Check against whitelist
    for (const validator of this.commandWhitelist) {
      if (validator.pattern.test(command)) {
        if (!validator.allowed) {
          this.logSecurityEvent({
            type: 'denial',
            userId,
            resource: 'command',
            action: 'execute',
            details: { command: this.sanitizeCommand(command), reason: 'Blacklisted command' },
          });

          return {
            allowed: false,
            riskLevel: validator.riskLevel,
            reason: `Command "${command}" is not permitted for security reasons`,
          };
        }

        this.logSecurityEvent({
          type: 'access',
          userId,
          resource: 'command',
          action: 'execute',
          details: { command: this.sanitizeCommand(command), riskLevel: validator.riskLevel },
        });

        return {
          allowed: true,
          riskLevel: validator.riskLevel,
        };
      }
    }

    // Unknown command - deny by default
    this.logSecurityEvent({
      type: 'denial',
      userId,
      resource: 'command',
      action: 'execute',
      details: { command: this.sanitizeCommand(command), reason: 'Unknown command' },
    });

    return {
      allowed: false,
      riskLevel: 'medium',
      reason: 'Command not in whitelist',
    };
  }

  /**
   * Check if user has permission
   */
  checkPermission(userId: string, resource: string, action: string): boolean {
    const permKey = `${resource}:${action}`;
    const permissions = this.permissionsMap.get(permKey);

    const allowed = permissions?.has('*') || permissions?.has(action);

    this.logSecurityEvent({
      type: allowed ? 'access' : 'denial',
      userId,
      resource,
      action,
      details: { permissions: Array.from(permissions || []) },
    });

    return allowed;
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (!this.rateLimitMap.has(userId)) {
      this.rateLimitMap.set(userId, [now]);
      return true;
    }

    const timestamps = this.rateLimitMap.get(userId)!;
    const recentRequests = timestamps.filter(t => t > oneMinuteAgo);

    if (recentRequests.length >= this.maxRequestsPerMinute) {
      return false;
    }

    recentRequests.push(now);
    this.rateLimitMap.set(userId, recentRequests);

    return true;
  }

  /**
   * Sanitize command for logging (remove sensitive data)
   */
  private sanitizeCommand(command: string): string {
    // Remove potential passwords and sensitive data
    let sanitized = command
      .replace(/password\s*=\s*[^\s]*/gi, 'password=***')
      .replace(/token\s*=\s*[^\s]*/gi, 'token=***')
      .replace(/key\s*=\s*[^\s]*/gi, 'key=***');

    // Limit length
    return sanitized.length > 200 ? sanitized.substring(0, 200) + '...' : sanitized;
  }

  /**
   * Log security event
   */
  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'status'>): void {
    const securityEvent: SecurityEvent = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      status: event.type === 'denial' ? 'denied' : 'allowed',
      ...event,
    };

    this.auditLog.push(securityEvent);

    // Maintain size limit
    if (this.auditLog.length > this.maxAuditSize) {
      this.auditLog.shift();
    }

    // Emit event for external logging
    this.emit('securityEvent', securityEvent);

    // Log high-severity events
    if (event.type === 'exploit_attempt' || event.type === 'denial') {
      console.warn(`[Security] ${event.type.toUpperCase()}: ${event.resource}/${event.action} by ${event.userId}`);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(limit?: number, filter?: Partial<SecurityEvent>): SecurityEvent[] {
    let log = [...this.auditLog];

    if (filter) {
      log = log.filter(event => {
        if (filter.type && event.type !== filter.type) return false;
        if (filter.userId && event.userId !== filter.userId) return false;
        if (filter.resource && event.resource !== filter.resource) return false;
        if (filter.action && event.action !== filter.action) return false;
        if (filter.status && event.status !== filter.status) return false;
        return true;
      });
    }

    const size = limit || 100;
    return log.slice(-size);
  }

  /**
   * Export audit log
   */
  exportAuditLog(): string {
    const log = this.auditLog.map(event => ({
      ...event,
      details: event.details ? JSON.stringify(event.details) : '',
    }));

    const headers = ['id', 'timestamp', 'type', 'userId', 'resource', 'action', 'status', 'details'];
    const rows = log.map(event =>
      headers.map(h => JSON.stringify(event[h as keyof SecurityEvent] || ''))
    );

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Hash sensitive data
   */
  hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate API key
   */
  generateApiKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Validate API key format
   */
  validateApiKey(key: string): boolean {
    // Check if it's a valid hex string
    return /^[a-f0-9]{32,}$/i.test(key);
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): Record<string, any> {
    const denials = this.auditLog.filter(e => e.status === 'denied').length;
    const accesses = this.auditLog.filter(e => e.status === 'allowed').length;
    const exploitAttempts = this.auditLog.filter(e => e.type === 'exploit_attempt').length;

    return {
      totalEvents: this.auditLog.length,
      allowedAccess: accesses,
      deniedAccess: denials,
      exploitAttempts,
      denialRate: denials / (denials + accesses) || 0,
      lastEvent: this.auditLog[this.auditLog.length - 1]?.timestamp || null,
    };
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
    this.emit('auditLogCleared');
  }

  /**
   * Shutdown security manager
   */
  shutdown(): void {
    // Export final audit log before shutdown
    const exportPath = `./audit-log-${Date.now()}.csv`;
    console.log(`[Security] Exporting audit log to ${exportPath}`);

    this.auditLog = [];
    this.rateLimitMap.clear();
  }
}

export default SecurityManager.getInstance();
