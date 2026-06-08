import React, { useState, useEffect } from 'react';
import { Puzzle, Search, Download, Trash2, Star, Settings, RefreshCw } from 'lucide-react';
import { VSCodeDB, VSCodeExtension } from '../../lib/vscode-db';

interface ExtensionsProps {}

const POPULAR_EXTENSIONS: Omit<VSCodeExtension, 'installedAt' | 'enabled'>[] = [
  { id: 'es6-string-helper', name: 'ES6 String Helper', description: 'Snippet and string manipulation utilities' },
  { id: 'prettier', name: 'Prettier', description: 'Code formatter' },
  { id: 'gitlens', name: 'GitLens', description: 'Git supercharged' },
  { id: 'eslint', name: 'ESLint', description: 'JavaScript linting' },
  { id: 'python', name: 'Python', description: 'Python language support' },
  { id: 'vscode-icons', name: 'VS Code Icons', description: 'File icons theme' },
];

export function Extensions({}: ExtensionsProps) {
  const [installed, setInstalled] = useState<VSCodeExtension[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState(OFFERED_EXTENSIONS);

  useEffect(() => {
    VSCodeDB.getAllExtensions().then(setInstalled);
  }, []);

  const handleInstall = async (ext: Omit<VSCodeExtension, 'installedAt' | 'enabled'>) => {
    const newExt: VSCodeExtension = {
      ...ext,
      installedAt: Date.now(),
      enabled: true
    };
    await VSCodeDB.saveExtension(newExt);
    setInstalled(prev => [...prev, newExt]);
    setRecommendations(prev => prev.filter(e => e.id !== ext.id));
  };

  const handleToggle = async (ext: VSCodeExtension) => {
    const updated = { ...ext, enabled: !ext.enabled };
    await VSCodeDB.saveExtension(updated);
    setInstalled(prev => prev.map(e => e.id === ext.id ? updated : e));
  };

  const handleUninstall = async (extId: string) => {
    // In real implementation, we'd need a delete method
    setInstalled(prev => prev.filter(e => e.id !== extId));
  };

  const handleRefresh = () => {
    VSCodeDB.getAllExtensions().then(setInstalled);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950/80">
      {/* Extensions Header */}
      <div className="flex items-center h-10 px-3 justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 uppercase">Extensions</span>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Installed Extensions */}
      <div className="flex-1 overflow-y-auto">
        {installed.length > 0 && (
          <>
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">Installed</div>
            <div className="space-y-1 px-2">
              {installed.map(ext => (
                <div key={ext.id} className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-300">{ext.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{ext.description}</div>
                  </div>
                  <button
                    onClick={() => handleToggle(ext)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      ext.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {ext.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => handleUninstall(ext.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recommended Extensions */}
        {recommendations.length > 0 && (
          <>
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase mt-2">Recommended</div>
            <div className="space-y-1 px-2">
              {recommendations
                .filter(ext => ext.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(ext => (
                <div key={ext.id} className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-300">{ext.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{ext.description}</div>
                  </div>
                  <button
                    onClick={() => handleInstall(ext)}
                    className="px-2 py-0.5 bg-cyan-500 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 cursor-pointer hover:bg-cyan-400 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Install
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const OFFERED_EXTENSIONS: Omit<VSCodeExtension, 'installedAt' | 'enabled'>[] = [
  { id: 'es6-string-helper', name: 'ES6 String Helper', description: 'Snippet and string manipulation utilities' },
  { id: 'prettier', name: 'Prettier', description: 'Code formatter' },
  { id: 'gitlens', name: 'GitLens', description: 'Git supercharged' },
  { id: 'eslint', name: 'ESLint', description: 'JavaScript linting' },
  { id: 'python', name: 'Python', description: 'Python language support' },
  { id: 'vscode-icons', name: 'VS Code Icons', description: 'File icons theme' },
];