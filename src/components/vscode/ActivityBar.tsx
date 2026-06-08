import React from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Bug, 
  Puzzle,
  FileCode,
  Settings,
  Terminal as TerminalIcon
} from 'lucide-react';

interface ActivityBarProps {
  activeView: 'explorer' | 'search' | 'sourceControl' | 'debug' | 'extensions' | 'settings';
  setActiveView: (view: 'explorer' | 'search' | 'sourceControl' | 'debug' | 'extensions' | 'settings') => void;
}

export function ActivityBar({ activeView, setActiveView }: ActivityBarProps) {
  const views: Array<{ id: ActivityBarProps['activeView']; icon: React.ComponentType<{ className?: string }>; title: string }> = [
    { id: 'explorer', icon: Files, title: 'Explorer (Ctrl+Shift+E)' },
    { id: 'search', icon: Search, title: 'Search (Ctrl+F)' },
    { id: 'sourceControl', icon: GitBranch, title: 'Source Control (Ctrl+Shift+G)' },
    { id: 'debug', icon: Bug, title: 'Debug (Ctrl+Shift+D)' },
    { id: 'extensions', icon: Puzzle, title: 'Extensions (Ctrl+Shift+X)' },
  ];

  return (
    <div className="w-14 bg-slate-950 border-r border-slate-800/80 flex flex-col items-center py-3 gap-2 select-none">
      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 mb-3">
        <FileCode className="w-5 h-5 text-cyan-400" />
      </div>
      
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = activeView === view.id;
        return (
          <button
            key={view.id}
        onClick={() => setActiveView(view.id)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all cursor-pointer group relative
              ${isActive 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            title={view.title}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'text-cyan-400' : ''}`} />
            
            {/* Tooltip */}
            <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {view.title}
            </div>
          </button>
        );
      })}
      
      <div className="flex-1" />
      
      <button
        onClick={() => setActiveView('settings')}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all cursor-pointer"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
