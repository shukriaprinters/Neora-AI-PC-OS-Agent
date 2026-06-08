import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor, { OnChange, OnMount } from '@monaco-editor/react';
import { VSCodeFile, VSCodeDB } from '../../lib/vscode-db';
import { X, FileCode, Plus, Save, Copy, ArrowLeftRight } from 'lucide-react';
import { copyToClipboardFailsafe } from '../../utils/clipboard';

interface EditorPaneProps {
  files: VSCodeFile[];
  activeFileId: string | null;
  onFileSelect: (id: string | null) => void;
  onFileCreate: (file: VSCodeFile) => void;
  onFileUpdate: (file: VSCodeFile) => void;
}

const LANGUAGES = [
  'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
  'python', 'java', 'cpp', 'c', 'go', 'rust', 'html', 'css', 
  'scss', 'json', 'yaml', 'xml', 'markdown', 'sql', 'php', 
  'ruby', 'shell', 'powershell', 'kotlin', 'swift', 'r', 'plaintext'
];

export function EditorPane({ files, activeFileId, onFileSelect, onFileCreate, onFileUpdate }: EditorPaneProps) {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('typescript');
  const [isDirty, setDirty] = useState(false);
  const unsavedChanges = useRef(false);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleEditorChange: OnChange = (value) => {
    if (activeFile && value !== undefined) {
      setDirty(true);
      unsavedChanges.current = true;
      onFileUpdate({ ...activeFile, content: value });
    }
  };

  const handleSave = async () => {
    if (activeFile) {
      setDirty(false);
      unsavedChanges.current = false;
      await VSCodeDB.saveFile(activeFile);
    }
  };

  const handleCloseTab = (id: string) => {
    if (unsavedChanges.current) {
      if (confirm('Unsaved changes. Close anyway?')) {
        onFileSelect(null);
        unsavedChanges.current = false;
      }
    } else {
      onFileSelect(null);
    }
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const ext = newFileName.split('.').pop() || '';
      let language = newFileLanguage;
      const langMap: Record<string, string> = {
        ts: 'typescript', tsx: 'typescriptreact',
        js: 'javascript', jsx: 'javascriptreact',
        py: 'python', java: 'java', cpp: 'cpp', c: 'c',
        go: 'go', rs: 'rust', html: 'html', css: 'css',
        scss: 'scss', json: 'json', yaml: 'yaml', yml: 'yaml',
        xml: 'xml', md: 'markdown', sql: 'sql', php: 'php',
        rb: 'ruby', sh: 'shell', ps1: 'powershell',
        kt: 'kotlin', swift: 'swift', r: 'r'
      };
      language = langMap[ext] || 'plaintext';
      
      const newFile: VSCodeFile = {
        id: crypto.randomUUID(),
        path: `/workspace/${newFileName}`,
        content: '',
        language,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onFileCreate(newFile);
      onFileSelect(newFile.id);
      setShowNewDialog(false);
      setNewFileName('');
    }
  };

  const handleCopyContent = async () => {
    if (activeFile) {
      await copyToClipboardFailsafe(activeFile.content);
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-slate-950 items-center justify-center text-slate-500">
        <FileCode className="w-16 h-16 mb-4 text-slate-700" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No files open</h3>
        <button
          onClick={() => setShowNewDialog(true)}
          className="mt-4 px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded hover:bg-cyan-400 transition-colors cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New File
        </button>
        
        {showNewDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-80" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-white mb-4">New File</h3>
              <input
                type="text"
                placeholder="filename.ts"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 mb-3"
                autoFocus
              />
              <select
                value={newFileLanguage}
                onChange={e => setNewFileLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none mb-4"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNewDialog(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">Cancel</button>
                <button onClick={handleCreateFile} className="px-3 py-1.5 text-xs bg-cyan-500 text-slate-950 font-bold rounded cursor-pointer hover:bg-cyan-400">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-0">
      {/* Tab Bar */}
      <div className="flex items-center h-10 bg-slate-900/80 border-b border-slate-800/80 overflow-x-auto">
        <div className="flex items-center min-h-0">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={`flex items-center gap-2 px-3 h-full border-r border-slate-800/80 cursor-pointer transition-colors min-w-max
                ${activeFileId === file.id 
                  ? 'bg-slate-950 text-cyan-400 border-t-2 border-t-cyan-500' 
                  : 'text-slate-400 hover:bg-slate-800/50'
                }`}
            >
              <FileCode className="w-4 h-4" />
              <span className="text-xs font-mono">{file.path.split('/').pop()}</span>
              {isDirty && activeFileId === file.id && <span className="text-cyan-400">●</span>}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(file.id);
                }}
                className="p-0.5 hover:bg-slate-700 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowNewDialog(true)}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded ml-1 cursor-pointer"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1" />
        {activeFile && (
          <>
            <button
              onClick={handleCopyContent}
              className="p-2 text-slate-500 hover:text-slate-300 cursor-pointer"
              title="Copy content"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 text-slate-500 hover:text-cyan-400 cursor-pointer"
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {activeFile ? (
          <>
            <MonacoEditor
              height="100%"
              language={activeFile.language}
              value={activeFile.content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontFamily: 'JetBrains Mono',
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                minimap: { enabled: true },
                automaticLayout: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            Select a file to edit
          </div>
        )}
      </div>

      {/* New File Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowNewDialog(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-white mb-4">New File</h3>
            <input
              type="text"
              placeholder="filename.ts"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 mb-3"
              autoFocus
            />
            <select
              value={newFileLanguage}
              onChange={e => setNewFileLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none mb-4"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewDialog(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer">Cancel</button>
              <button onClick={handleCreateFile} className="px-3 py-1.5 text-xs bg-cyan-500 text-slate-950 font-bold rounded cursor-pointer hover:bg-cyan-400">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}