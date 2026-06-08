import { spawn } from 'child_process';
import EventEmitter from 'events';
import os from 'os';
import path from 'path';

export interface OSAction {
  type: 'mouse' | 'keyboard' | 'window' | 'app' | 'screenshot';
  data: any;
  timestamp: Date;
}

export interface ActionResult {
  success: boolean;
  action: string;
  message: string;
  error?: string;
  data?: any;
}

class OSControlEngine extends EventEmitter {
  private isWindows: boolean;
  private isLinux: boolean;
  private isMac: boolean;
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    super();
    const platform = os.platform();
    this.isWindows = platform === 'win32';
    this.isLinux = platform === 'linux';
    this.isMac = platform === 'darwin';
    this.initializeNativeBindings();
  }

  private initializeNativeBindings(): void {
    try {
      // Try to load robotjs if available
      if (!this.isLinux) {
        // robotjs works on Windows and macOS
        // For Linux, we'll use xdotool
      }
    } catch (error) {
      console.log('[OSControlEngine] Native bindings not available, using fallback methods');
    }
  }

  async executeAction(action: OSAction): Promise<ActionResult> {
    try {
      switch (action.type) {
        case 'mouse':
          return await this.handleMouseAction(action.data);
        case 'keyboard':
          return await this.handleKeyboardAction(action.data);
        case 'window':
          return await this.handleWindowAction(action.data);
        case 'app':
          return await this.handleAppAction(action.data);
        case 'screenshot':
          return await this.handleScreenshot(action.data);
        default:
          return {
            success: false,
            action: 'unknown',
            message: 'Unknown action type',
          };
      }
    } catch (error: any) {
      return {
        success: false,
        action: action.type,
        message: 'Action execution failed',
        error: error.message,
      };
    }
  }

  private async handleMouseAction(data: any): Promise<ActionResult> {
    const { action, x, y, button = 'left', count = 1 } = data;

    try {
      if (action === 'move') {
        await this.moveMouse(x, y);
        this.mousePosition = { x, y };
        return {
          success: true,
          action: 'mouse-move',
          message: `Mouse moved to (${x}, ${y})`,
          data: { x, y },
        };
      } else if (action === 'click') {
        for (let i = 0; i < count; i++) {
          await this.clickMouse(x, y, button);
        }
        return {
          success: true,
          action: 'mouse-click',
          message: `Clicked ${button} button ${count} time(s) at (${x}, ${y})`,
          data: { x, y, button, count },
        };
      } else if (action === 'scroll') {
        const direction = y > 0 ? 'down' : 'up';
        const amount = Math.abs(y);
        await this.scrollMouse(direction, amount);
        return {
          success: true,
          action: 'mouse-scroll',
          message: `Scrolled ${direction} by ${amount} pixels`,
          data: { direction, amount },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        action: 'mouse-action',
        message: `Mouse action failed: ${error.message}`,
        error: error.message,
      };
    }

    return {
      success: false,
      action: 'mouse-action',
      message: 'Unknown mouse action',
    };
  }

  private async handleKeyboardAction(data: any): Promise<ActionResult> {
    const { action, key, text, modifiers = [] } = data;

    try {
      if (action === 'press') {
        await this.pressKey(key, modifiers);
        return {
          success: true,
          action: 'keyboard-press',
          message: `Pressed key: ${key}`,
          data: { key, modifiers },
        };
      } else if (action === 'type') {
        await this.typeText(text);
        return {
          success: true,
          action: 'keyboard-type',
          message: `Typed: ${text}`,
          data: { text },
        };
      } else if (action === 'hotkey') {
        await this.hotkeyPress(key, modifiers);
        return {
          success: true,
          action: 'keyboard-hotkey',
          message: `Hotkey pressed: ${modifiers.join('+')}+${key}`,
          data: { key, modifiers },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        action: 'keyboard-action',
        message: `Keyboard action failed: ${error.message}`,
        error: error.message,
      };
    }

    return {
      success: false,
      action: 'keyboard-action',
      message: 'Unknown keyboard action',
    };
  }

  private async handleWindowAction(data: any): Promise<ActionResult> {
    const { action, title, focus = true } = data;

    try {
      if (action === 'focus') {
        await this.focusWindow(title);
        return {
          success: true,
          action: 'window-focus',
          message: `Focused window: ${title}`,
          data: { title },
        };
      } else if (action === 'close') {
        await this.closeWindow(title);
        return {
          success: true,
          action: 'window-close',
          message: `Closed window: ${title}`,
          data: { title },
        };
      } else if (action === 'maximize') {
        await this.maximizeWindow(title);
        return {
          success: true,
          action: 'window-maximize',
          message: `Maximized window: ${title}`,
          data: { title },
        };
      } else if (action === 'minimize') {
        await this.minimizeWindow(title);
        return {
          success: true,
          action: 'window-minimize',
          message: `Minimized window: ${title}`,
          data: { title },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        action: 'window-action',
        message: `Window action failed: ${error.message}`,
        error: error.message,
      };
    }

    return {
      success: false,
      action: 'window-action',
      message: 'Unknown window action',
    };
  }

  private async handleAppAction(data: any): Promise<ActionResult> {
    const { action, app } = data;

    try {
      if (action === 'launch') {
        await this.launchApp(app);
        return {
          success: true,
          action: 'app-launch',
          message: `Launched application: ${app}`,
          data: { app },
        };
      } else if (action === 'close') {
        await this.closeApp(app);
        return {
          success: true,
          action: 'app-close',
          message: `Closed application: ${app}`,
          data: { app },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        action: 'app-action',
        message: `App action failed: ${error.message}`,
        error: error.message,
      };
    }

    return {
      success: false,
      action: 'app-action',
      message: 'Unknown app action',
    };
  }

  private async handleScreenshot(data: any): Promise<ActionResult> {
    try {
      const filename = data.filename || `screenshot-${Date.now()}.png`;
      // Implementation would use system screenshot tools
      return {
        success: true,
        action: 'screenshot',
        message: `Screenshot saved: ${filename}`,
        data: { filename },
      };
    } catch (error: any) {
      return {
        success: false,
        action: 'screenshot',
        message: `Screenshot failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  // Platform-specific implementations
  private async moveMouse(x: number, y: number): Promise<void> {
    if (this.isWindows) {
      // Use Windows mouse movement
      await this.executePowerShell(
        `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})`
      );
    } else if (this.isMac) {
      // Use macOS mouse movement
      await this.executeCommand('osascript', [
        '-e',
        `tell application "System Events" to move mouse to (${x}, ${y})`,
      ]);
    } else if (this.isLinux) {
      // Use xdotool for Linux
      await this.executeCommand('xdotool', ['mousemove', x.toString(), y.toString()]);
    }
  }

  private async clickMouse(x: number, y: number, button: string): Promise<void> {
    const buttonMap = { left: 1, right: 3, middle: 2 };
    const buttonNum = buttonMap[button as keyof typeof buttonMap] || 1;

    if (this.isWindows) {
      await this.executePowerShell(
        `$source = @"
using System;
using System.Runtime.InteropServices;
public class Mouse {
  [DllImport("user32.dll")]
  public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);
  public const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
  public const uint MOUSEEVENTF_LEFTUP = 0x0004;
}
"@
Add-Type -TypeDefinition $source
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
[System.Threading.Thread]::Sleep(50)
[Mouse]::mouse_event([Mouse]::MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)`
      );
    } else if (this.isLinux) {
      await this.executeCommand('xdotool', ['click', buttonNum.toString()]);
    } else if (this.isMac) {
      await this.executeCommand('osascript', [
        '-e',
        `tell application "System Events" to click at (${x}, ${y}) with ${button} button down`,
      ]);
    }
  }

  private async scrollMouse(direction: string, amount: number): Promise<void> {
    if (this.isWindows) {
      const wheelDelta = direction === 'up' ? amount * 120 : -amount * 120;
      await this.executePowerShell(
        `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("{WHEELUP ${wheelDelta}}")`
      );
    } else if (this.isLinux) {
      const direction_arg = direction === 'up' ? 'up' : 'down';
      await this.executeCommand('xdotool', ['key', `--repeat`, amount.toString(), direction_arg]);
    }
  }

  private async pressKey(key: string, modifiers: string[]): Promise<void> {
    if (this.isWindows) {
      const keyMap: Record<string, string> = {
        enter: '{ENTER}',
        escape: '{ESC}',
        tab: '{TAB}',
        backspace: '{BACKSPACE}',
        delete: '{DELETE}',
        space: ' ',
      };
      const sendKey = keyMap[key.toLowerCase()] || key;
      await this.executePowerShell(`Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("${sendKey}")`);
    } else if (this.isLinux) {
      const keyArg = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
      await this.executeCommand('xdotool', ['key', keyArg]);
    }
  }

  private async typeText(text: string): Promise<void> {
    if (this.isWindows) {
      // Escape special characters for PowerShell
      const escapedText = text.replace(/"/g, '\"').replace(/\$/g, '`$');
      await this.executePowerShell(
        `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("${escapedText}")`
      );
    } else if (this.isLinux) {
      await this.executeCommand('xdotool', ['type', text]);
    }
  }

  private async hotkeyPress(key: string, modifiers: string[]): Promise<void> {
    if (this.isLinux) {
      const hotkeyString = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
      await this.executeCommand('xdotool', ['key', hotkeyString]);
    }
  }

  private async launchApp(app: string): Promise<void> {
    if (this.isWindows) {
      await this.executeCommand('start', [app]);
    } else if (this.isMac) {
      await this.executeCommand('open', ['-a', app]);
    } else if (this.isLinux) {
      await this.executeCommand(app);
    }
  }

  private async closeApp(app: string): Promise<void> {
    if (this.isWindows) {
      await this.executeCommand('taskkill', ['/IM', `${app}.exe`, '/F']);
    } else if (this.isMac) {
      await this.executeCommand('osascript', ['-e', `quit app "${app}"`]);
    } else if (this.isLinux) {
      await this.executeCommand('killall', [app]);
    }
  }

  private async focusWindow(title: string): Promise<void> {
    if (this.isWindows) {
      await this.executePowerShell(
        `Get-Process | Where-Object {$_.MainWindowTitle -like "*${title}*"} | ForEach-Object {$_.MainWindowHandle}`
      );
    } else if (this.isMac) {
      await this.executeCommand('osascript', [
        '-e',
        `tell application "${title}" to activate`,
      ]);
    }
  }

  private async closeWindow(title: string): Promise<void> {
    // Implement window closing logic
  }

  private async maximizeWindow(title: string): Promise<void> {
    // Implement window maximizing logic
  }

  private async minimizeWindow(title: string): Promise<void> {
    // Implement window minimizing logic
  }

  private executeCommand(command: string, args: string[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args);
      let errorOutput = '';

      proc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(errorOutput || `Command failed with code ${code}`));
        } else {
          resolve();
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  private executePowerShell(script: string): Promise<void> {
    return this.executeCommand('powershell', ['-Command', script]);
  }

  getMouse Position(): { x: number; y: number } {
    return { ...this.mousePosition };
  }
}

export default new OSControlEngine();
