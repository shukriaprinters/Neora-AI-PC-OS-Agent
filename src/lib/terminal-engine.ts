export interface TerminalFile {
  path: string;
  content: string;
  isDirectory: boolean;
}

export interface TerminalOutput {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

export class TerminalEngine {
  private files: Map<string, TerminalFile> = new Map();
  private cwd: string = '/workspace';
  private claudeMode: boolean = false;

  constructor() {
    this.initializeFileSystem();
  }

  private initializeFileSystem() {
    this.files.set('/workspace', { path: '/workspace', content: '', isDirectory: true });
    this.files.set('/workspace/readme.md', { 
      path: '/workspace/readme.md', 
      content: '# Welcome to VS Code Web\n\nThis is a web-based VS Code clone with Monaco Editor and a functional terminal.\n', 
      isDirectory: false 
    });
    this.files.set('/workspace/index.ts', { 
      path: '/workspace/index.ts', 
      content: 'console.log("Hello from VS Code Web!");\n', 
      isDirectory: false 
    });
    this.files.set('/workspace/style.css', { 
      path: '/workspace/style.css', 
      content: 'body { background: #020617; color: #e2e8f0; }\n', 
      isDirectory: false 
    });
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      ts: 'typescript', tsx: 'typescript',
      js: 'javascript', jsx: 'javascript',
      py: 'python',
      java: 'java',
      cpp: 'cpp', c: 'c',
      go: 'go',
      rs: 'rust',
      html: 'html',
      css: 'css', scss: 'scss',
      json: 'json',
      yaml: 'yaml', yml: 'yaml',
      xml: 'xml',
      md: 'markdown',
      sql: 'sql',
      php: 'php',
      rb: 'ruby',
      sh: 'shell',
      ps1: 'powershell',
      kt: 'kotlin',
      swift: 'swift',
      r: 'r'
    };
    return langMap[ext] || 'plaintext';
  }

  execute(command: string): TerminalOutput[] {
    const args = command.trim().split(/\s+/);
    const cmd = args[0]?.toLowerCase();
    
    switch (cmd) {
      case 'claude':
        this.claudeMode = !this.claudeMode;
        return [{ 
          type: 'system', 
          content: this.claudeMode 
            ? '> Claude Code REPL activated. Type your prompt or use /help for commands.' 
            : '> Claude Code REPL deactivated.' 
        }];
      
      case 'ls':
        return this.handleLs(args);
      
      case 'cd':
        return this.handleCd(args);
      
      case 'pwd':
        return [{ type: 'output', content: this.cwd }];
      
      case 'cat':
        return this.handleCat(args);
      
      case 'mkdir':
        return this.handleMkdir(args);
      
      case 'rm':
        return this.handleRm(args);
      
      case 'echo':
        return this.handleEcho(args);
      
      case 'touch':
        return this.handleTouch(args);
      
      case 'clear':
        return [{ type: 'system', content: 'CLEAR_TERMINAL' }];
      
      case 'whoami':
        return [{ type: 'output', content: 'vscode-user' }];
      
      case 'date':
        return [{ type: 'output', content: new Date().toString() }];
      
      case 'help':
        return [{ 
          type: 'output', 
          content: `VS Code Web Terminal Commands:
  ls [path]     - List directory contents
  cd [path]     - Change directory
  pwd           - Show current directory
  cat [file]    - Display file contents
  mkdir [dir]   - Create directory
  rm [file]     - Remove file
  echo [text]   - Display text
  touch [file]  - Create empty file
  clear         - Clear terminal
  whoami        - Show current user
  date          - Show current date
  claude        - Toggle Claude Code REPL mode
  help          - Show this help message` 
        }];
      
      case '/help':
      case '/clear':
      case '/status':
        return this.handleClaudeCommand(command);
      
      default:
        if (this.claudeMode && command.startsWith('/')) {
          return this.handleClaudeCommand(command);
        }
        return [{ type: 'error', content: `Command not found: ${cmd}. Type 'help' for available commands.` }];
    }
  }

  private handleLs(args: string[]): TerminalOutput[] {
    const targetPath = args[1] ? this.resolvePath(args[1]) : this.cwd;
    const entries: string[] = [];
    
    for (const [path, file] of this.files.entries()) {
      if (path.startsWith(targetPath + '/') && !file.isDirectory) {
        const relativePath = path.substring(targetPath.length + 1);
        if (!relativePath.includes('/')) {
          entries.push(relativePath);
        }
      }
      if (path === targetPath && file.isDirectory) {
        const basePath = targetPath === '/workspace' ? targetPath : targetPath + '/';
        for (const [fp] of this.files.entries()) {
          if (fp.startsWith(basePath) && !fp.startsWith(basePath + '/')) {
            const relativePath = fp.substring(targetPath.length);
            if (relativePath.startsWith('/')) {
              entries.push(relativePath.substring(1));
            } else if (fp === targetPath) {
              // Skip the directory itself
            }
          }
        }
      }
    }
    
    // Show files in current directory
    const currentFiles: string[] = [];
    for (const [path, file] of this.files.entries()) {
      if (path.startsWith(this.cwd + '/')) {
        const relativePath = path.substring(this.cwd.length + 1);
        if (!relativePath.includes('/')) {
          entries.push(relativePath);
        }
      }
    }
    
    // Add directory itself (workspace)
    if (targetPath === '/workspace') {
      for (const [path, file] of this.files.entries()) {
        if (path.startsWith('/workspace/') && !path.substring('/workspace/'.length).includes('/')) {
          entries.push(path.substring('/workspace/'.length));
        }
      }
    }
    
    return entries.length > 0 
      ? [{ type: 'output', content: entries.join('\n') }]
      : [{ type: 'output', content: '' }];
  }

  private handleCd(args: string[]): TerminalOutput[] {
    const targetPath = args[1];
    if (!targetPath) {
      this.cwd = '/workspace';
      return [{ type: 'output', content: '' }];
    }

    const resolved = this.resolvePath(targetPath);
    const file = this.files.get(resolved);
    
    if (file?.isDirectory || resolved === '/workspace') {
      this.cwd = resolved;
      return [{ type: 'output', content: '' }];
    }
    
    return [{ type: 'error', content: `cd: ${targetPath}: No such file or directory` }];
  }

  private handleCat(args: string[]): TerminalOutput[] {
    const targetPath = this.resolvePath(args[1] || '');
    const file = this.files.get(targetPath);
    
    if (file && !file.isDirectory) {
      return [{ type: 'output', content: file.content }];
    }
    
    return [{ type: 'error', content: `cat: ${args[1]}: No such file` }];
  }

  private handleMkdir(args: string[]): TerminalOutput[] {
    const dirName = args[1];
    if (!dirName) {
      return [{ type: 'error', content: 'mkdir: missing operand' }];
    }
    
    const fullPath = this.cwd === '/workspace' ? `/workspace/${dirName}` : `${this.cwd}/${dirName}`;
    this.files.set(fullPath, { path: fullPath, content: '', isDirectory: true });
    return [{ type: 'output', content: '' }];
  }

  private handleRm(args: string[]): TerminalOutput[] {
    const targetPath = this.resolvePath(args[1] || '');
    const file = this.files.get(targetPath);
    
    if (file) {
      this.files.delete(targetPath);
      return [{ type: 'output', content: '' }];
    }
    
    return [{ type: 'error', content: `rm: ${args[1]}: No such file` }];
  }

  private handleEcho(args: string[]): TerminalOutput[] {
    const text = args.slice(1).join(' ');
    return [{ type: 'output', content: text }];
  }

  private handleTouch(args: string[]): TerminalOutput[] {
    const fileName = args[1];
    if (!fileName) {
      return [{ type: 'error', content: 'touch: missing file operand' }];
    }
    
    const fullPath = this.cwd === '/workspace' ? `/workspace/${fileName}` : `${this.cwd}/${fileName}`;
    if (!this.files.has(fullPath)) {
      this.files.set(fullPath, { path: fullPath, content: '', isDirectory: false });
    }
    return [{ type: 'output', content: '' }];
  }

  private handleClaudeCommand(cmd: string): TerminalOutput[] {
    if (cmd === '/clear') {
      return [{ type: 'system', content: 'CLEAR_CLAUDE' }];
    }
    if (cmd === '/help') {
      return [{ type: 'output', content: 'Claude REPL commands:\n  /help    - Show this help\n  /clear   - Clear Claude context\n  /status  - Show Claude status' }];
    }
    if (cmd === '/status') {
      return [{ type: 'output', content: 'Claude Code REPL: Active\nMode: Streaming\nReady for prompts.' }];
    }
    return [{ type: 'output', content: `[Claude REPL] ${cmd}` }];
  }

  private resolvePath(path: string): string {
    if (path.startsWith('/')) return path;
    if (this.cwd === '/workspace') return `/workspace/${path}`;
    return `${this.cwd}/${path}`;
  }

  isClaudeMode(): boolean {
    return this.claudeMode;
  }

  async handleClaudePrompt(prompt: string): Promise<TerminalOutput[]> {
    // Simulate streaming response
    const responses = [
      '> Thinking...',
      `> Processing: ${prompt.substring(0, 50)}...`,
      '> Analyzing request...',
      'Response: I am Claude Code, your AI pair programming assistant. How can I help you today?\n\nAvailable actions:\n- /help    - Show commands\n- /clear   - Reset context\n- /status  - Show status'
    ];
    
    return responses.map(r => ({ type: 'output' as const, content: r }));
  }
}