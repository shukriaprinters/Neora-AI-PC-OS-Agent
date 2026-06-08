import EventEmitter from 'events';
import { CommandIntent } from './voiceCommandParser';

export interface ConfirmationRequest {
  id: string;
  command: CommandIntent;
  userMessage: string;
  estimatedDuration: number;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'confirmed' | 'rejected' | 'expired';
  confirmedBy?: string;
  confirmedAt?: Date;
}

export interface SafetyRule {
  id: string;
  name: string;
  action: string;
  condition: (intent: CommandIntent) => boolean;
  requiresConfirmation: boolean;
  requiresExplicitApproval?: boolean;
  description: string;
}

class ConfirmationSystem extends EventEmitter {
  private confirmationQueue: Map<string, ConfirmationRequest> = new Map();
  private safetyRules: Map<string, SafetyRule> = new Map();
  private confirmationEnabled: boolean = true;
  private confirmationTimeout: number = 30000; // 30 seconds
  private confirmationCountdown: number = 5; // 5 seconds for voice feedback
  private riskLevel: 'low' | 'medium' | 'high' = 'medium';

  constructor() {
    super();
    this.initializeSafetyRules();
  }

  private initializeSafetyRules(): void {
    // High-risk rules - always require confirmation
    this.safetyRules.set('file-deletion', {
      id: 'file-deletion',
      name: 'File Deletion',
      action: 'delete',
      condition: (intent: CommandIntent) =>
        intent.action === 'custom' &&
        ['delete', 'remove', 'trash', 'uninstall'].some((word) =>
          intent.rawInput.toLowerCase().includes(word)
        ),
      requiresConfirmation: true,
      requiresExplicitApproval: true,
      description: 'Deleting or removing files requires explicit confirmation',
    });

    // System command rules
    this.safetyRules.set('system-shutdown', {
      id: 'system-shutdown',
      name: 'System Shutdown',
      action: 'shutdown',
      condition: (intent: CommandIntent) =>
        ['shutdown', 'restart', 'reboot', 'power off'].some((word) =>
          intent.rawInput.toLowerCase().includes(word)
        ),
      requiresConfirmation: true,
      requiresExplicitApproval: true,
      description: 'System shutdown/restart requires explicit confirmation',
    });

    // Sensitive application access
    this.safetyRules.set('sensitive-app', {
      id: 'sensitive-app',
      name: 'Sensitive Application Access',
      action: 'open',
      condition: (intent: CommandIntent) => {
        const sensitiveApps = ['cmd', 'powershell', 'terminal', 'registry', 'system32'];
        return (
          intent.action === 'open' &&
          sensitiveApps.some((app) => intent.target.toLowerCase().includes(app))
        );
      },
      requiresConfirmation: true,
      requiresExplicitApproval: false,
      description: 'Opening sensitive system applications requires confirmation',
    });

    // Risky network operations
    this.safetyRules.set('network-operation', {
      id: 'network-operation',
      name: 'Network Operation',
      action: 'network',
      condition: (intent: CommandIntent) =>
        ['download', 'upload', 'install'].some((word) =>
          intent.rawInput.toLowerCase().includes(word)
        ),
      requiresConfirmation: this.riskLevel !== 'low',
      requiresExplicitApproval: false,
      description: 'Network operations may require confirmation based on risk level',
    });

    // Typing passwords or sensitive data
    this.safetyRules.set('sensitive-input', {
      id: 'sensitive-input',
      name: 'Sensitive Input Detection',
      action: 'type',
      condition: (intent: CommandIntent) => {
        const sensitiveKeywords = ['password', 'pin', 'token', 'key', 'secret'];
        return (
          intent.action === 'type' &&
          sensitiveKeywords.some((word) =>
            intent.rawInput.toLowerCase().includes(word)
          )
        );
      },
      requiresConfirmation: true,
      requiresExplicitApproval: false,
      description: 'Typing sensitive data requires confirmation',
    });
  }

  async evaluateCommand(intent: CommandIntent): Promise<{
    requiresConfirmation: boolean;
    reason?: string;
    suggestedMessage?: string;
  }> {
    // Check against all safety rules
    for (const rule of this.safetyRules.values()) {
      if (rule.condition(intent)) {
        if (rule.requiresConfirmation) {
          return {
            requiresConfirmation: true,
            reason: rule.name,
            suggestedMessage: rule.description,
          };
        }
      }
    }

    return {
      requiresConfirmation: false,
    };
  }

  async createConfirmationRequest(
    intent: CommandIntent,
    estimatedDuration: number
  ): Promise<ConfirmationRequest> {
    const id = `confirm-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date();

    const request: ConfirmationRequest = {
      id,
      command: intent,
      userMessage: this.generateConfirmationMessage(intent),
      estimatedDuration,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.confirmationTimeout),
      status: 'pending',
    };

    this.confirmationQueue.set(id, request);

    // Auto-expire after timeout
    setTimeout(() => {
      if (this.confirmationQueue.has(id)) {
        const req = this.confirmationQueue.get(id)!;
        if (req.status === 'pending') {
          req.status = 'expired';
          this.emit('confirmation:expired', req);
        }
      }
    }, this.confirmationTimeout);

    this.emit('confirmation:requested', request);
    return request;
  }

  private generateConfirmationMessage(intent: CommandIntent): string {
    const actionDescriptions: Record<string, string> = {
      open: `Do you want me to open ${intent.target}?`,
      close: `Do you want me to close ${intent.target}?`,
      click: `Should I click on ${intent.parameters.uiElement || 'this element'}?`,
      type: `Should I type: "${intent.parameters.text || ''}"?`,
      navigate: `Should I navigate to ${intent.target}?`,
      screenshot: 'Should I take a screenshot?',
      wait: `Should I wait ${intent.parameters.duration || 0}ms?`,
      custom: `Should I execute: "${intent.rawInput}"?`,
    };

    return (
      actionDescriptions[intent.action] ||
      `Should I execute this command: "${intent.rawInput}"?`
    );
  }

  async confirmRequest(
    requestId: string,
    confirmed: boolean,
    userId: string = 'user'
  ): Promise<boolean> {
    const request = this.confirmationQueue.get(requestId);

    if (!request) {
      return false;
    }

    if (request.status !== 'pending') {
      return false;
    }

    request.status = confirmed ? 'confirmed' : 'rejected';
    request.confirmedBy = userId;
    request.confirmedAt = new Date();

    this.emit(
      confirmed ? 'confirmation:confirmed' : 'confirmation:rejected',
      request
    );

    return true;
  }

  getConfirmationRequest(id: string): ConfirmationRequest | undefined {
    return this.confirmationQueue.get(id);
  }

  getPendingConfirmations(): ConfirmationRequest[] {
    return Array.from(this.confirmationQueue.values()).filter(
      (r) => r.status === 'pending'
    );
  }

  setConfirmationTimeout(ms: number): void {
    this.confirmationTimeout = ms;
  }

  setConfirmationCountdown(seconds: number): void {
    this.confirmationCountdown = seconds;
  }

  setRiskLevel(level: 'low' | 'medium' | 'high'): void {
    this.riskLevel = level;
    // Update confirmation requirements based on risk level
    const networkRule = this.safetyRules.get('network-operation');
    if (networkRule) {
      networkRule.requiresConfirmation = level !== 'low';
    }
  }

  enableConfirmation(enabled: boolean): void {
    this.confirmationEnabled = enabled;
  }

  addSafetyRule(rule: SafetyRule): void {
    this.safetyRules.set(rule.id, rule);
  }

  removeSafetyRule(ruleId: string): void {
    this.safetyRules.delete(ruleId);
  }

  getSafetyRules(): SafetyRule[] {
    return Array.from(this.safetyRules.values());
  }

  isConfirmationEnabled(): boolean {
    return this.confirmationEnabled;
  }

  clearExpired(): void {
    const now = new Date();
    for (const [id, request] of this.confirmationQueue.entries()) {
      if (request.expiresAt < now && request.status === 'pending') {
        request.status = 'expired';
        this.emit('confirmation:expired', request);
      }
    }
  }
}

export default new ConfirmationSystem();
