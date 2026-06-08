import React, { useState } from 'react';
import { Bug, Play, Pause, SkipForward, SkipBack, RotateCw, Square, ChevronRight, AlertCircle } from 'lucide-react';

interface DebugProps {}

interface Breakpoint {
  id: string;
  file: string;
  line: number;
}

interface DebugSession {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
}

export function Debug({}: DebugProps) {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    { id: '1', file: 'index.ts', line: 5 },
    { id: '2', file: 'app.ts', line: 12 },
  ]);
  const [sessions, setSessions] = useState<DebugSession[]>([
    { id: '1', name: 'Node.js Debug', status: 'stopped' }
  ]);
  const [isDebugging, setIsDebugging] = useState(false);

  const handleStartDebug = () => {
    setIsDebugging(true);
    setSessions([{ id: '1', name: 'Node.js Debug', status: 'running' }]);
  };

  const handleStopDebug = () => {
    setIsDebugging(false);
    setSessions(sessions.map(s => ({ ...s, status: 'stopped' as const })));
  };

  const getStatusColor = (status: DebugSession['status']) => {
    switch (status) {
      case 'running': return 'text-emerald-400';
      case 'paused': return 'text-amber-400';
      case 'stopped': return 'text-slate-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950/80">
      {/* Debug Header */}
      <div className="flex items-center h-10 px-3 justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 uppercase">Debug</span>
        </div>
      </div>

      {/* Debug Controls */}
      <div className="p-3 border-b border-slate-800/80 flex gap-2">
        {!isDebugging ? (
          <button
            onClick={handleStartDebug}
            className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 cursor-pointer hover:bg-emerald-400 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Start
          </button>
        ) : (
          <button
            onClick={handleStopDebug}
            className="px-3 py-1.5 bg-rose-500 text-white font-bold rounded text-xs flex items-center gap-1.5 cursor-pointer hover:bg-rose-400 transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        )}
      </div>

      {/* Breakpoints */}
      <div className="px-3 py-2 border-b border-slate-800/80">
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Breakpoints</div>
        <div className="space-y-1">
          {breakpoints.map(bp => (
            <div key={bp.id} className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800/50 rounded cursor-pointer">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="flex-1 truncate">{bp.file}:{bp.line}</span>
            </div>
          ))}
          {breakpoints.length === 0 && (
            <div className="text-xs text-slate-600 px-2 py-1">No breakpoints set</div>
          )}
        </div>
      </div>

      {/* Debug Sessions */}
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sessions</div>
        <div className="space-y-1">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center gap-2 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800/50 rounded cursor-pointer">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(session)}`} />
              <span className="flex-1 truncate">{session.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}