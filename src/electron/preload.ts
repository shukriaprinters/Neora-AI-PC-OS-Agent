import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Voice command processing
  voiceProcess: (input: string) => ipcRenderer.invoke('voice:process-command', input),
  voiceConfirm: (confirmationId: string, confirmed: boolean) =>
    ipcRenderer.invoke('voice:confirm', confirmationId, confirmed),

  // Agent control
  agentToggle: () => ipcRenderer.invoke('agent:toggle'),
  agentGetStatus: () => ipcRenderer.invoke('agent:get-status'),

  // Settings
  settingsGetAutoLaunch: () => ipcRenderer.invoke('settings:get-auto-launch'),
  settingsSetAutoLaunch: (enabled: boolean) =>
    ipcRenderer.invoke('settings:set-auto-launch', enabled),
  settingsVoiceEnabled: (enabled: boolean) =>
    ipcRenderer.invoke('settings:voice-enabled', enabled),
  settingsConfirmationEnabled: (enabled: boolean) =>
    ipcRenderer.invoke('settings:confirmation-enabled', enabled),

  // Event listeners
  onHotkeyToggleListening: (callback: () => void) =>
    ipcRenderer.on('hotkey:toggle-listening', callback),
  onHotkeyStopCommand: (callback: () => void) =>
    ipcRenderer.on('hotkey:stop-command', callback),
  onAgentToggle: (callback: (active: boolean) => void) =>
    ipcRenderer.on('agent:toggle', (event, active) => callback(active)),
  onCommandExecuting: (callback: (data: any) => void) =>
    ipcRenderer.on('command:executing', (event, data) => callback(data)),
  onNavigate: (callback: (path: string) => void) =>
    ipcRenderer.on('navigate', (event, path) => callback(path)),
  onFeedback: (callback: (message: any) => void) =>
    ipcRenderer.on('feedback', (event, message) => callback(message)),

  // Remove listeners
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
});
