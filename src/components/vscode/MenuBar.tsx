import React, { useState } from 'react';
import { VSCodeFile } from '../../lib/vscode-db';

interface MenuBarProps {
  onCommand: (command: string) => void;
  files: VSCodeFile[];
  onFileSelect: (fileId: string | null) => void;
}

export function MenuBar({ onCommand, files, onFileSelect }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New File', command: 'file.new', shortcut: 'Ctrl+N' },
        { label: 'New Window', command: 'file.newWindow', shortcut: 'Ctrl+Shift+N' },
        { label: 'Open File...', command: 'file.open', shortcut: 'Ctrl+O' },
        { label: 'Save', command: 'file.save', shortcut: 'Ctrl+S' },
        { label: 'Save As...', command: 'file.saveAs', shortcut: 'Ctrl+Shift+S' },
        { type: 'separator' },
        { label: 'Close Editor', command: 'file.close', shortcut: 'Ctrl+W' },
        { label: 'Exit', command: 'file.exit' },
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', command: 'edit.undo', shortcut: 'Ctrl+Z' },
        { label: 'Redo', command: 'edit.redo', shortcut: 'Ctrl+Y' },
        { type: 'separator' },
        { label: 'Cut', command: 'edit.cut', shortcut: 'Ctrl+X' },
        { label: 'Copy', command: 'edit.copy', shortcut: 'Ctrl+C' },
        { label: 'Paste', command: 'edit.paste', shortcut: 'Ctrl+V' },
        { type: 'separator' },
        { label: 'Find', command: 'edit.find', shortcut: 'Ctrl+F' },
        { label: 'Replace', command: 'edit.replace', shortcut: 'Ctrl+H' },
      ]
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Command Palette', command: 'view.commandPalette', shortcut: 'Ctrl+Shift+P' },
        { label: 'Explorer', command: 'view.explorer', shortcut: 'Ctrl+Shift+E' },
        { label: 'Search', command: 'view.search', shortcut: 'Ctrl+Shift+F' },
        { label: 'Source Control', command: 'view.scm', shortcut: 'Ctrl+Shift+G' },
        { label: 'Debug', command: 'view.debug', shortcut: 'Ctrl+Shift+D' },
        { label: 'Extensions', command: 'view.extensions', shortcut: 'Ctrl+Shift+X' },
        { type: 'separator' },
        { label: 'Terminal', command: 'view.terminal', shortcut: 'Ctrl+`' },
      ]
    },
    {
      id: 'go',
      label: 'Go',
      items: [
        { label: 'Go to File', command: 'go.file', shortcut: 'Ctrl+P' },
        { label: 'Go to Symbol', command: 'go.symbol', shortcut: 'Ctrl+Shift+O' },
        { label: 'Go to Line', command: 'go.line', shortcut: 'Ctrl+G' },
        { type: 'separator' },
        { label: 'Back', command: 'go.back', shortcut: 'Alt+Left' },
        { label: 'Forward', command: 'go.forward', shortcut: 'Alt+Right' },
      ]
    },
    {
      id: 'run',
      label: 'Run',
      items: [
        { label: 'Start Debugging', command: 'run.startDebug', shortcut: 'F5' },
        { label: 'Stop Debugging', command: 'run.stopDebug', shortcut: 'Shift+F5' },
        { label: 'Run Task', command: 'run.task', shortcut: 'Ctrl+Shift+B' },
      ]
    },
    {
      id: 'terminal',
      label: 'Terminal',
      items: [
        { label: 'New Terminal', command: 'terminal.new', shortcut: 'Ctrl+`' },
        { label: 'Split Terminal', command: 'terminal.split', shortcut: 'Ctrl+Shift+5' },
        { label: 'Kill Terminal', command: 'terminal.kill', shortcut: 'Ctrl+Shift+K' },
        { type: 'separator' },
        { label: 'Clear', command: 'terminal.clear', shortcut: 'Ctrl+K' },
      ]
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Documentation', command: 'help.docs' },
        { label: 'Keyboard Shortcuts', command: 'help.shortcuts', shortcut: 'Ctrl+K Ctrl+S' },
        { label: 'Tips and Tricks', command: 'help.tips' },
      ]
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { label: 'Minimize', command: 'window.minimize' },
        { label: 'Maximize', command: 'window.maximize' },
        { label: 'Close', command: 'window.close' },
      ]
    }
  ];

  return (
    <div className="h-10 bg-slate-900/80 border-b border-slate-800/80 flex items-center px-2 select-none">
      {menus.map(menu => (
        <div key={menu.id} className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
            className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors cursor-pointer
              ${activeMenu === menu.id 
                ? 'text-cyan-400 bg-slate-800/70' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
          >
            {menu.label}
          </button>

          {/* Dropdown Menu */}
          {activeMenu === menu.id && (
            <div 
              className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-md shadow-xl z-50 py-1 min-w-48"
              onMouseLeave={() => setActiveMenu(null)}
            >
              {menu.items.map((item, idx) => 
                'type' in item ? (
                  <div key={`sep-${idx}`} className="h-px bg-slate-700 my-1" />
                ) : (
                  <button
                    key={idx}
                    onClick={() => {
                      onCommand(item.command);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-slate-300 hover:bg-slate-800/70 flex justify-between items-center cursor-pointer"
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="text-slate-500 font-mono text-[10px]">{item.shortcut}</span>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}