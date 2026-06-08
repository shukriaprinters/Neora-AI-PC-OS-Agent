import { app, BrowserWindow, Menu, ipcMain, globalShortcut, Tray } from 'electron';
import AutoLaunch from 'auto-launch';
import path from 'path';
import isDev from 'electron-is-dev';
import voiceCommandParser from '../server/services/voiceCommandParser';
import osControlEngine from '../server/services/osControlEngine';
import confirmationSystem from '../server/services/confirmationSystem';
import voiceFeedback from '../server/services/voiceFeedback';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let agentActive = false;

const autoLauncher = new AutoLaunch({
  name: 'Neora OS Agent',
  path: app.getPath('exe'),
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Hide instead of closing on close button (runs in background)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow!.hide();
    }
  });

  setupMenu();
  setupTray();
}

function setupTray() {
  tray = new Tray(path.join(__dirname, '../assets/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: agentActive ? 'Stop Agent' : 'Start Agent',
      click: () => {
        toggleAgent();
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', '/settings');
        }
      },
    },
    {
      label: 'Exit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Neora OS Agent');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function setupMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.isQuitting = true;
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}

function registerHotkeys() {
  // Global hotkey to toggle voice listening (Alt+N for Neora)
  globalShortcut.register('Alt+N', () => {
    if (mainWindow) {
      mainWindow.webContents.send('hotkey:toggle-listening');
    }
  });

  // Global hotkey to show window (Ctrl+Shift+N)
  globalShortcut.register('Ctrl+Shift+N', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Global hotkey to stop current command (Escape)
  globalShortcut.register('Escape', () => {
    if (mainWindow) {
      mainWindow.webContents.send('hotkey:stop-command');
    }
  });
}

function unregisterHotkeys() {
  globalShortcut.unregisterAll();
}

async function toggleAgent() {
  agentActive = !agentActive;
  if (mainWindow) {
    mainWindow.webContents.send('agent:toggle', agentActive);
  }

  if (agentActive) {
    await voiceFeedback.speak('Voice agent activated');
  } else {
    await voiceFeedback.speak('Voice agent deactivated');
  }
}

async function setAutoLaunch(enabled: boolean) {
  try {
    if (enabled) {
      await autoLauncher.enable();
    } else {
      await autoLauncher.disable();
    }
  } catch (error) {
    console.error('[Electron] Auto-launch configuration failed:', error);
  }
}

// IPC Handlers for Voice Command Processing
ipcMain.handle('voice:process-command', async (event, input: string) => {
  try {
    const parsed = voiceCommandParser.parse(input);

    if (!parsed) {
      return {
        success: false,
        error: 'Could not parse command',
      };
    }

    // Evaluate safety
    const safety = await confirmationSystem.evaluateCommand(parsed.intent);

    if (safety.requiresConfirmation) {
      const confirmation = await confirmationSystem.createConfirmationRequest(
        parsed.intent,
        parsed.estimatedDuration
      );
      await voiceFeedback.speak(confirmation.userMessage, 'confirmation');

      return {
        success: true,
        requiresConfirmation: true,
        confirmationId: confirmation.id,
        message: confirmation.userMessage,
      };
    }

    // Execute command
    return await executeCommand(parsed.intent);
  } catch (error: any) {
    await voiceFeedback.speakError(`Error processing command: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
});

ipcMain.handle('voice:confirm', async (event, confirmationId: string, confirmed: boolean) => {
  try {
    const success = await confirmationSystem.confirmRequest(confirmationId, confirmed);

    if (!success) {
      return { success: false, error: 'Confirmation not found' };
    }

    if (confirmed) {
      const request = confirmationSystem.getConfirmationRequest(confirmationId);
      if (request) {
        await voiceFeedback.speak('Executing command');
        return await executeCommand(request.command);
      }
    } else {
      await voiceFeedback.speak('Command cancelled');
      return { success: true, cancelled: true };
    }
  } catch (error: any) {
    await voiceFeedback.speakError(`Error confirming command: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
});

async function executeCommand(intent: any) {
  try {
    await voiceFeedback.speakCommandExecuting(intent.rawInput, 2000);

    // Here you would execute the actual OS control based on intent
    // For now, we'll emit the intent to the main window for UI feedback

    if (mainWindow) {
      mainWindow.webContents.send('command:executing', {
        intent,
        timestamp: new Date(),
      });
    }

    await voiceFeedback.speakSuccess('Command executed successfully');

    return {
      success: true,
      intent,
      executedAt: new Date(),
    };
  } catch (error: any) {
    await voiceFeedback.speakError(`Failed to execute command: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

ipcMain.handle('settings:get-auto-launch', async () => {
  try {
    const isEnabled = await autoLauncher.isEnabled();
    return { enabled: isEnabled };
  } catch (error) {
    return { enabled: false, error: (error as any).message };
  }
});

ipcMain.handle('settings:set-auto-launch', async (event, enabled: boolean) => {
  try {
    await setAutoLaunch(enabled);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as any).message };
  }
});

ipcMain.handle('settings:voice-enabled', async (event, enabled: boolean) => {
  voiceFeedback.setVoiceEnabled(enabled);
  return { success: true };
});

ipcMain.handle('settings:confirmation-enabled', async (event, enabled: boolean) => {
  confirmationSystem.enableConfirmation(enabled);
  return { success: true };
});

ipcMain.handle('agent:get-status', async () => {
  return {
    active: agentActive,
    voiceEnabled: voiceFeedback.isVoiceEnabled(),
    confirmationEnabled: confirmationSystem.isConfirmationEnabled(),
  };
});

app.on('ready', () => {
  createWindow();
  registerHotkeys();
});

app.on('window-all-closed', () => {
  // Don't quit on all windows closed (agent runs in background)
  if (process.platform !== 'darwin') {
    // Except on macOS
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  unregisterHotkeys();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}
