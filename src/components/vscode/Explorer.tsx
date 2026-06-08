import React, { useState } from 'react';
import { VSCodeFile } from '../../lib/vscode-db';
import { 
  File, Folder, FileCode, 
  FolderOpen, RefreshCw, MoreHorizontal,
  FilePlus, FolderPlus
} from 'lucide-react';

interface ExplorerProps {
  files: VSCodeFile[];
  onFileSelect: (fileId: string | null) => void;
  onFileCreate: (file: VSCodeFile) => void;
}

export function Explorer({ files, onFileSelect, onFileCreate }: ExplorerProps) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/workspace']));

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const getFileIcon = (language: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      typescript: <FileCode className="w-4 h-4 text-cyan-400" />,
      javascript: <FileCode className="w-4 h-4 text-yellow-400" />,
      python: <FileCode className="w-4 h-4 text-blue-400" />,
      java: <FileCode className="w-4 h-4 text-orange-400" />,
      go: <FileCode className="w-4 h-4 text-sky-400" />,
      rust: <FileCode className="w-4 h-4 text-rose-400" />,
      html: <FileCode className="w-4 h-4 text-orange-500" />,
      css: <FileCode className="w-4 h-4 text-blue-500" />,
      json: <FileCode className="w-4 h-4 text-amber-400" />,
      markdown: <FileCode className="w-4 h-4 text-green-400" />,
    };
    return iconMap[language] || <File className="w-4 h-4 text-slate-400" />;
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const ext = newFileName.split('.').pop() || '';
    const langMap: Record<string, string> = {
      ts: 'typescript', tsx: 'typescript',
      js: 'javascript', jsx: 'javascript',
      py: 'python', java: 'java', cpp: 'cpp',
      html: 'html', css: 'css', json: 'json',
      md: 'markdown', go: 'go', rs: 'rust'
    };
    
    const newFile: VSCodeFile = {
      id: crypto.randomUUID(),
      path: `/workspace/${newFileName}`,
      content: '',
      language: langMap[ext] || 'plaintext',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    onFileCreate(newFile);
    setNewFileName('');
    setShowNewMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950/80">
      {/* Explorer Header */}
      <div className="flex items-center h-10 px-3 justify-between border-b border-slate-800/80">
        <span className="text-xs font-bold text-slate-300 uppercase">Explorer</span>
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showNewMenu && (
            <div className="absolute right-0 top-8 bg-slate-900 border border-slate-700 rounded shadow-lg z-50 w-48">
              <button
                onClick={() => {
                  const name = prompt('File name:') || '';
                  if (name) {
                    const ext = name.split('.').pop() || '';
                    const langMap: Record<string, string> = {
                      ts: 'typescript', tsx: 'typescript', js: 'javascript'
                    };
                    const f: VSCodeFile = {
                      id: crypto.randomUUID(),
                      path: `/workspace/${name}`,
                      content: '',
                      language: langMap[ext] || 'plaintext',
                      createdAt: Date.now(),
                      updatedAt: Date.now()
                    };
                    onFileCreate(f);
                    setShowNewMenu(false);
                  }
                }}
                className="w-full px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5" />
                New File
              </button>
              <button
                onClick={() => {
                  const name = prompt('Folder name:') || '';
                  if (name) {
                    setShowNewMenu(false);
                  }
                }}
                className="w-full px-3 py-2 text-xs text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                New Folder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Workspace Root */}
        <div className="mb-1">
          <div
            onClick={() => toggleDir('/workspace')}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800/50 rounded cursor-pointer select-none"
          >
            {expandedDirs.has('/workspace') ? 
              <FolderOpen className="w-4 h-4 text-cyan-400" /> : 
              <Folder className="w-4 h-4 text-cyan-400" />
            }
            <span>workspace</span>
          </div>

          {/* Files */}
          {expandedDirs.has('/workspace') && (
            <div className="ml-4 mt-1 space-y-0.5">
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => onFileSelect(file.id)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800/50 rounded cursor-pointer select-none"
                >
                  {getFileIcon(file.language)}
                  <span className="truncate">{file.path.split('/').pop()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-8 px-3 flex items-center justify-between border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
        <span>{files.length} files</span>
      </div>
    </div>
  );
}