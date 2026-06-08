import React, { useState } from 'react';
import { GitBranch, GitCommit, GitPullRequest, RefreshCw, Plus, Tag, Users, FileCode } from 'lucide-react';

interface SourceControlProps {}

interface Change {
  id: string;
  file: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked';
  diff: string;
}

export function SourceControl({}: SourceControlProps) {
  const [changes, setChanges] = useState<Change[]>([
    { id: '1', file: 'index.ts', status: 'modified', diff: '+ console.log("new line");' },
    { id: '2', file: 'readme.md', status: 'modified', diff: '- outdated docs\n+ updated documentation' },
  ]);
  const [commitMessage, setCommitMessage] = useState('');
  const [branch, setBranch] = useState('main');

  const getStatusColor = (status: Change['status']) => {
    switch (status) {
      case 'modified': return 'text-yellow-400';
      case 'added': return 'text-emerald-400';
      case 'deleted': return 'text-rose-400';
      case 'untracked': return 'text-cyan-400';
    }
  };

  const getStatusIcon = (status: Change['status']) => {
    switch (status) {
      case 'modified': return 'M';
      case 'added': return 'A';
      case 'deleted': return 'D';
      case 'untracked': return 'U';
    }
  };

  const handleStageAll = () => {
    // Stage all changes - would integrate with git in real implementation
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    setChanges([]);
    setCommitMessage('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950/80">
      {/* SCM Header */}
      <div className="flex items-center h-10 px-3 justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 uppercase">Source Control</span>
        </div>
        <button className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Changes */}
      <div className="flex-1 overflow-y-auto p-2">
        {changes.length > 0 && (
          <button
            onClick={handleStageAll}
            className="w-full px-2 py-1.5 text-xs text-left text-slate-300 hover:bg-slate-800 rounded flex items-center gap-2 mb-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Stage All Changes
          </button>
        )}

        <div className="space-y-1">
          {changes.map(change => (
            <div key={change.id} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-800/50 rounded cursor-pointer">
              <span className={`w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded ${getStatusColor(change.status)} bg-slate-900 border border-slate-700`}>
                {getStatusIcon(change.status)}
              </span>
              <span className="truncate text-slate-300 flex-1">{change.file}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Commit Section */}
      <div className="p-3 border-t border-slate-800/80">
        <input
          type="text"
          placeholder="Commit message..."
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          className="w-full px-2 py-1.5 mb-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleCommit}
          disabled={!commitMessage.trim()}
          className="w-full px-2 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded text-xs disabled:opacity-50 cursor-pointer hover:bg-emerald-400 transition-colors"
        >
          Commit
        </button>
      </div>

      {/* Branch Status */}
      <div className="h-8 px-3 flex items-center justify-between border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <GitBranch className="w-3 h-3" />
          {branch}
        </span>
      </div>
    </div>
  );
}
