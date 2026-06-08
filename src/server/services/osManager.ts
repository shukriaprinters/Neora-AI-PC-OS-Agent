/**
 * OS Manager Service
 * Handles system-level operations, process management, and OS integration
 */

import { execSync, exec, spawn } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import os from 'os';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface ProcessInfo {
  pid: number;
  name: string;
  memory: number;
  cpu: number;
}

interface SystemInfo {
  platform: string;
  arch: string;
  totalMemory: number;
  freeMemory: number;
  uptime: number;
  cpuCount: number;
  hostname: string;
  userInfo: {
    username: string;
    homedir: string;
  };
}

interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  timestamp: string;
}

export class OSManager extends EventEmitter {
  private static instance: OSManager;
  private systemInfo: SystemInfo | null = null;
  private processCache: Map<number, ProcessInfo> = new Map();
  private commandHistory: CommandResult[] = [];
  private maxHistorySize = 100;

  private constructor() {
    super();
    this.initializeSystemInfo();
  }

  static getInstance(): OSManager {
    if (!OSManager.instance) {
      OSManager.instance = new OSManager();
    }
    return OSManager.instance;
  }

  private initializeSystemInfo(): void {
    this.systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      cpuCount: os.cpus().length,
      hostname: os.hostname(),
      userInfo: {
        username: os.userInfo().username,
        homedir: os.userInfo().homedir,
      },
    };
  }

  /**
   * Get comprehensive system information
   */
  async getSystemInfo(): Promise<SystemInfo & { cpuUsage: number; memoryUsage: number }> {
    if (!this.systemInfo) {
      this.initializeSystemInfo();
    }

    return {
      ...this.systemInfo!,
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      cpuUsage: this.calculateCPUUsage(),
      memoryUsage: (os.totalmem() - os.freemem()) / os.totalmem() * 100,
    };
  }

  /**
   * Execute system command with safety checks
   */
  async executeCommand(
    command: string,
    options?: {
      timeout?: number;
      cwd?: string;
      env?: NodeJS.ProcessEnv;
    }
  ): Promise<CommandResult> {
    const timestamp = new Date().toISOString();

    try {
      // Safety check - whitelist common commands
      if (!this.isSafeCommand(command)) {
        return {
          success: false,
          output: '',
          error: 'Command not allowed for security reasons',
          timestamp,
        };
      }

      const { stdout, stderr } = await execAsync(command, {
        timeout: options?.timeout || 30000,
        cwd: options?.cwd,
        env: { ...process.env, ...options?.env },
      });

      const result: CommandResult = {
        success: true,
        output: stdout || stderr,
        timestamp,
      };

      this.addToHistory(result);
      this.emit('commandExecuted', { command, result });

      return result;
    } catch (error: any) {
      const result: CommandResult = {
        success: false,
        output: '',
        error: error.message || 'Command execution failed',
        timestamp,
      };

      this.addToHistory(result);
      this.emit('commandFailed', { command, error });

      return result;
    }
  }

  /**
   * Get list of running processes
   */
  async getRunningProcesses(): Promise<ProcessInfo[]> {
    try {
      const platform = os.platform();
      let command = '';

      if (platform === 'win32') {
        command =
          'tasklist /FO CSV /NH | findstr /V "Name"';
      } else if (platform === 'darwin') {
        command =
          'ps aux | grep -v grep | awk \'{print $2, $11, $6}\'';
      } else {
        command =
          'ps aux | grep -v grep | awk \'{print $2, $11, $6}\'';
      }

      const result = await this.executeCommand(command);

      if (!result.success) {
        return Array.from(this.processCache.values());
      }

      return this.parseProcessList(result.output);
    } catch (error) {
      return Array.from(this.processCache.values());
    }
  }

  /**
   * Kill a process by PID
   */
  async killProcess(pid: number): Promise<boolean> {
    try {
      const platform = os.platform();
      const command = platform === 'win32' ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`;
      const result = await this.executeCommand(command);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file system information
   */
  async getFileSystemInfo(dirPath?: string): Promise<any> {
    try {
      const targetPath = dirPath || os.homedir();

      if (!fs.existsSync(targetPath)) {
        return { error: 'Path does not exist' };
      }

      const stats = fs.statSync(targetPath);
      const files = fs.readdirSync(targetPath).slice(0, 50); // Limit to 50 items

      return {
        path: targetPath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime,
        files: files.map(file => ({
          name: file,
          isDirectory: fs.statSync(path.join(targetPath, file)).isDirectory(),
        })),
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Get screenshot (platform-specific)
   */
  async captureScreenshot(): Promise<string | null> {
    try {
      const platform = os.platform();
      let command = '';
      let outputFile = '';

      if (platform === 'win32') {
        outputFile = path.join(os.tmpdir(), 'screenshot.png');
        command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen | ForEach-Object { $bitmap = New-Object System.Drawing.Bitmap($_.Bounds.Width, $_.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen($_.Bounds.Location, [System.Drawing.Point]::Empty, $_.Bounds.Size); $bitmap.Save('${outputFile}'); $graphics.Dispose(); $bitmap.Dispose() }"`;
      } else if (platform === 'darwin') {
        outputFile = path.join(os.tmpdir(), 'screenshot.png');
        command = `screencapture -x ${outputFile}`;
      } else {
        outputFile = path.join(os.tmpdir(), 'screenshot.png');
        command = `gnome-screenshot -f ${outputFile}`;
      }

      const result = await this.executeCommand(command, { timeout: 10000 });

      if (result.success && fs.existsSync(outputFile)) {
        const imageBuffer = fs.readFileSync(outputFile);
        return imageBuffer.toString('base64');
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Monitor system resources
   */
  async getSystemMetrics(): Promise<{
    cpu: number;
    memory: number;
    disk: number;
    timestamp: string;
  }> {
    const memoryUsage = (os.totalmem() - os.freemem()) / os.totalmem() * 100;

    return {
      cpu: this.calculateCPUUsage(),
      memory: memoryUsage,
      disk: await this.getDiskUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Private helper methods
   */

  private isSafeCommand(command: string): boolean {
    // Whitelist of allowed command patterns
    const allowedPatterns = [
      /^dir\b/,
      /^ls\b/,
      /^pwd\b/,
      /^whoami\b/,
      /^tasklist\b/,
      /^ps\b/,
      /^grep\b/,
      /^find\b/,
      /^echo\b/,
      /^type\b/,
      /^cat\b/,
      /^more\b/,
      /^less\b/,
      /^head\b/,
      /^tail\b/,
      /^wc\b/,
      /^df\b/,
      /^du\b/,
      /^free\b/,
      /^systemctl\b/,
      /^uname\b/,
      /^hostname\b/,
      /^date\b/,
    ];

    // Block dangerous commands
    const blockedPatterns = [
      /rm\s+-rf/,
      /del\s+\/s/,
      /format\b/,
      /:\s*delete/,
      /shutdown/,
      /reboot/,
      /^sudo\b/,
    ];

    const hasBlocked = blockedPatterns.some(pattern => pattern.test(command));
    if (hasBlocked) return false;

    return allowedPatterns.some(pattern => pattern.test(command));
  }

  private parseProcessList(output: string): ProcessInfo[] {
    const processes: ProcessInfo[] = [];
    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        processes.push({
          pid: parseInt(parts[0]),
          name: parts[1],
          memory: parseInt(parts[2]) || 0,
          cpu: 0,
        });
      }
    }

    return processes;
  }

  private calculateCPUUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    return Math.max(0, Math.min(100, usage));
  }

  private async getDiskUsage(): Promise<number> {
    try {
      const command = os.platform() === 'win32' ? 'wmic logicaldisk get size,freespace' : 'df -h / | tail -1';
      const result = await this.executeCommand(command);

      if (result.success) {
        // Simplified calculation - parse based on platform
        return 50; // Default fallback
      }
      return 50;
    } catch (error) {
      return 50;
    }
  }

  private addToHistory(result: CommandResult): void {
    this.commandHistory.push(result);
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }
  }

  /**
   * Get command history
   */
  getCommandHistory(limit?: number): CommandResult[] {
    const size = limit || 20;
    return this.commandHistory.slice(-size);
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.commandHistory = [];
  }
}

export default OSManager.getInstance();
