import React, { useState, useEffect, useRef } from 'react';
import { ActivityBar } from './ActivityBar';
import { MenuBar } from './MenuBar';
import { EditorPane } from './EditorPane';
import { Explorer } from './Explorer';
import { SearchPanel } from './SearchPanel';
import { SourceControl } from './SourceControl';
import { Debug } from './Debug';
import { Extensions } from './Extensions';
import { Terminal } from './Terminal';
import { VSCodeFile, VSCodeDB } from '../../lib/vscode-db';
import { X, Terminal as TerminalIcon } from 'lucide-react';

export function VSCodeView() {
  const [activeView, setActiveView] = useState<'explorer' | 'search' | 'sourceControl' | 'debug' | 'extensions'>('explorer');
  const [files, setFiles] = useState<VSCodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      VSCodeDB.init().then(() => {
        VSCodeDB.getAllFiles().then(existingFiles => {
          if (existingFiles.length === 0) {
            const defaultFiles: VSCodeFile[] = [
              {
                id: crypto.randomUUID(),
                path: '/workspace/index.ts',
                content: `console.log("Welcome to VS Code Web!");

function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

interface User {
  id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: "Developer"
};

console.log(greet(user.name));
`,
                language: 'typescript',
                createdAt: Date.now(),
                updatedAt: Date.now()
              },
              {
                id: crypto.randomUUID(),
                path: '/workspace/app.tsx',
                content: `import React from 'react';

export default function App() {
  return (
    <div className="app">
      <h1>Hello VS Code Web</h1>
    </div>
  );
}
`,
                language: 'typescript',
                createdAt: Date.now(),
                updatedAt: Date.now()
              },
              {
                id: crypto.randomUUID(),
                path: '/workspace/style.css',
                content: `body {
  background: #020617;
  color: #e2e8f0;
  margin: 0;
  padding: 20px;
}

.editor-container {
  border: 1px solid #334155;
}
`,
                language: 'css',
                createdAt: Date.now(),
                updatedAt: Date.now()
              }
            ];
            Promise.all(defaultFiles.map(f => VSCodeDB.saveFile(f)))
              .then(() => setFiles(defaultFiles));
          } else {
            setFiles(existingFiles);
          }
        });
      });
    }
  }, []);

  const handleFileCreate = (file: VSCodeFile) => {
    setFiles(prev => [...prev, file]);
    VSCodeDB.saveFile(file);
  };

  const handleFileUpdate = (file: VSCodeFile) => {
    setFiles(prev => prev.map(f => f.id === file.id ? file : f));
  };

  const handleMenuCommand = (command: string) => {
    switch (command) {
      case 'file.new':
        const name = prompt('File name:') || 'untitled.ts';
        const ext = name.split('.').pop() || '';
        const langMap: Record<string, string> = {
          ts: 'typescript', tsx: 'typescriptreact',
          js: 'javascript', jsx: 'javascriptreact',
          py: 'python', html: 'html', css: 'css',
          json: 'json', md: 'markdown'
        };
        const newFile: VSCodeFile = {
          id: crypto.randomUUID(),
          path: `/workspace/${name}`,
          content: '',
          language: langMap[ext] || 'plaintext',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        handleFileCreate(newFile);
        setActiveFileId(newFile.id);
        break;
      
      case 'terminal.new':
        setTerminalOpen(true);
        break;
      
      case 'terminal.clear':
        setTerminalOpen(true);
        break;
      
      case 'view.explorer':
        setActiveView('explorer');
        break;
      
      case 'view.search':
        setActiveView('search');
        break;
      
      case 'view.scm':
        setActiveView('sourceControl');
        break;
      
      case 'view.debug':
        setActiveView('debug');
        break;
      
      case 'view.extensions':
        setActiveView('extensions');
        break;
    }
  };

  const renderSidePanel = () => {
    switch (activeView) {
      case 'explorer':
        return <Explorer files={files} onFileSelect={setActiveFileId} onFileCreate={handleFileCreate} />;
      case 'search':
        return <SearchPanel files={files} />;
      case 'sourceControl':
        return <SourceControl />;
      case 'debug':
        return <Debug />;
      case 'extensions':
        return <Extensions />;
      default:
        return <Explorer files={files} onFileSelect={setActiveFileId} onFileCreate={handleFileCreate} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
      {/* Top Menu */}
      <MenuBar onCommand={handleMenuCommand} files={files} onFileSelect={setActiveFileId} />

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Activity Bar */}
        <ActivityBar activeView={activeView} setActiveView={setActiveView as any} />

        {/* Side Panel */}
        <div className="w-64 border-r border-slate-800/80 bg-slate-950/80">{renderSidePanel()}</div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <EditorPane
            files={files}
            activeFileId={activeFileId}
            onFileSelect={setActiveFileId}
            onFileCreate={handleFileCreate}
            onFileUpdate={handleFileUpdate}
          />

          {/* Terminal */}
          {terminalOpen && (
            <div className="h-64 border-t border-slate-800/80">
              <Terminal onClose={() => setTerminalOpen(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-slate-900/80 border-t border-slate-800/80 px-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-4">
          <span>VS Code Web</span>
          <span>{files.length} files</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={`flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer
              ${terminalOpen ? 'text-cyan-400' : ''}`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
          <span>Babel.js</span>
          <span>LF</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}