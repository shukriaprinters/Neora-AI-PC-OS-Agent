import EventEmitter from 'events';

export interface CommandIntent {
  action: 'open' | 'close' | 'click' | 'type' | 'navigate' | 'screenshot' | 'wait' | 'custom';
  target: string;
  parameters: Record<string, any>;
  confidence: number;
  rawInput: string;
  timestamp: Date;
}

export interface ParsedCommand {
  intent: CommandIntent;
  confirmationNeeded: boolean;
  estimatedDuration: number; // milliseconds
}

class VoiceCommandParser extends EventEmitter {
  private commandPatterns: Map<RegExp, (match: RegExpMatchArray) => CommandIntent>;
  private applicationAliases: Map<string, string>;
  private confirmationRequired: boolean = true;

  constructor() {
    super();
    this.commandPatterns = new Map();
    this.applicationAliases = new Map();
    this.initializePatterns();
    this.initializeAliases();
  }

  private initializePatterns(): void {
    // Open application: "open chrome", "launch notepad", "start spotify"
    this.commandPatterns.set(
      /^(?:open|launch|start|run)\s+(.+?)(?:\s+(?:and|then|now))?$/i,
      (match) => ({
        action: 'open',
        target: match[1].trim(),
        parameters: {},
        confidence: 0.95,
        rawInput: match[0],
        timestamp: new Date(),
      })
    );

    // Close application: "close chrome", "shut down notepad", "exit spotify"
    this.commandPatterns.set(
      /^(?:close|quit|exit|shutdown|stop)\s+(.+?)(?:\s+(?:please))?$/i,
      (match) => ({
        action: 'close',
        target: match[1].trim(),
        parameters: {},
        confidence: 0.95,
        rawInput: match[0],
        timestamp: new Date(),
      })
    );

    // Click action: "click on button", "click submit", "click the link"
    this.commandPatterns.set(
      /^(?:click|press)\s+(?:on\s+)?(?:the\s+)?(.+?)(?:\s+(?:button|link|icon))?$/i,
      (match) => ({
        action: 'click',
        target: match[1].trim(),
        parameters: { uiElement: match[1].trim() },
        confidence: 0.85,
        rawInput: match[0],
        timestamp: new Date(),
      })
    );

    // Type text: "type hello", "write my email", "type this message"
    this.commandPatterns.set(
      /^(?:type|write|enter|input)\s+(.+?)$/i,
      (match) => ({
        action: 'type',
        target: 'text-input',
        parameters: { text: match[1].trim() },
        confidence: 0.90,
        rawInput: match[0],
        timestamp: new Date(),
      })
    );

    // Navigate: "go to google.com", "navigate to youtube", "open website stackoverflow.com"
    this.commandPatterns.set(
      /^(?:go\s+to|navigate\s+to|visit|open\s+(?:website|site|page))\s+(.+?)$/i,
      (match) => ({
        action: 'navigate',
        target: match[1].trim(),
        parameters: { url: this.normalizeUrl(match[1].trim()) },
        confidence: 0.90,
        rawInput: match[0],
        timestamp: new Date(),
      })
    );

    // Screenshot: "take a screenshot", "capture screen", "screenshot"
    this.commandPatterns.set(
      /^(?:take\s+)?(?:a\s+)?(?:screenshot|screencap|screen\s+capture)(?:\s+(?:please))?$/i,
      (match) => ({
        action: 'screenshot',
        target: 'screen',
        parameters: { filename: `screenshot-${Date.now()}.png` },
        confidence: 0.95,
        rawInput: match[0],
        timestamp: new Date(),
      })
    );

    // Wait: "wait 5 seconds", "pause for 2 minutes", "sleep 3 seconds"
    this.commandPatterns.set(
      /^(?:wait|pause|sleep|wait\s+for)\s+(\d+)\s+(?:seconds?|minutes?|ms)$/i,
      (match) => {
        let ms = parseInt(match[1], 10);
        if (match[0].toLowerCase().includes('minute')) {
          ms *= 60000;
        } else if (match[0].toLowerCase().includes('second')) {
          ms *= 1000;
        }
        return {
          action: 'wait',
          target: 'timer',
          parameters: { duration: ms },
          confidence: 0.95,
          rawInput: match[0],
          timestamp: new Date(),
        };
      }
    );
  }

  private initializeAliases(): void {
    // Browser aliases
    this.applicationAliases.set('chrome', 'Google Chrome');
    this.applicationAliases.set('firefox', 'Mozilla Firefox');
    this.applicationAliases.set('edge', 'Microsoft Edge');
    this.applicationAliases.set('safari', 'Safari');

    // Text editor aliases
    this.applicationAliases.set('notepad', 'Notepad');
    this.applicationAliases.set('vscode', 'Visual Studio Code');
    this.applicationAliases.set('sublime', 'Sublime Text');
    this.applicationAliases.set('atom', 'Atom');

    // Communication aliases
    this.applicationAliases.set('slack', 'Slack');
    this.applicationAliases.set('discord', 'Discord');
    this.applicationAliases.set('teams', 'Microsoft Teams');
    this.applicationAliases.set('zoom', 'Zoom');

    // Media aliases
    this.applicationAliases.set('spotify', 'Spotify');
    this.applicationAliases.set('vlc', 'VLC Media Player');
    this.applicationAliases.set('youtube', 'YouTube');
    this.applicationAliases.set('netflix', 'Netflix');

    // System aliases
    this.applicationAliases.set('calculator', 'Calculator');
    this.applicationAliases.set('settings', 'Settings');
    this.applicationAliases.set('terminal', 'Terminal');
    this.applicationAliases.set('cmd', 'Command Prompt');
  }

  parse(input: string): ParsedCommand | null {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return null;
    }

    // Try to match against patterns
    for (const [pattern, handler] of this.commandPatterns) {
      const match = trimmedInput.match(pattern);
      if (match) {
        const intent = handler(match);
        
        // Resolve application aliases
        if (intent.action === 'open' || intent.action === 'close') {
          const alias = this.applicationAliases.get(intent.target.toLowerCase());
          if (alias) {
            intent.target = alias;
          }
        }

        return {
          intent,
          confirmationNeeded: this.confirmationRequired,
          estimatedDuration: this.estimateDuration(intent),
        };
      }
    }

    // Fallback: treat as custom command
    return {
      intent: {
        action: 'custom',
        target: trimmedInput,
        parameters: { command: trimmedInput },
        confidence: 0.60,
        rawInput: trimmedInput,
        timestamp: new Date(),
      },
      confirmationNeeded: this.confirmationRequired,
      estimatedDuration: 2000,
    };
  }

  private normalizeUrl(input: string): string {
    // Add protocol if missing
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      if (input.includes('.')) {
        return `https://${input}`;
      }
      // Assume search query
      return `https://google.com/search?q=${encodeURIComponent(input)}`;
    }
    return input;
  }

  private estimateDuration(intent: CommandIntent): number {
    const baseDuration: Record<string, number> = {
      open: 3000,
      close: 1000,
      click: 500,
      type: 1000 + (intent.parameters.text?.length || 0) * 50,
      navigate: 4000,
      screenshot: 1000,
      wait: intent.parameters.duration || 1000,
      custom: 2000,
    };

    return baseDuration[intent.action] || 2000;
  }

  setConfirmationRequired(required: boolean): void {
    this.confirmationRequired = required;
  }

  addCustomPattern(pattern: RegExp, handler: (match: RegExpMatchArray) => CommandIntent): void {
    this.commandPatterns.set(pattern, handler);
  }

  addApplicationAlias(alias: string, applicationName: string): void {
    this.applicationAliases.set(alias.toLowerCase(), applicationName);
  }
}

export default new VoiceCommandParser();
