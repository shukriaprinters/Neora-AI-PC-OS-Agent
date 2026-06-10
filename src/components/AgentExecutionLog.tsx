import React from 'react';
import { 
  CheckCircle2, Play, Circle, Clock, AlertTriangle, Cpu, Terminal, Sparkles, 
  Settings, Loader2, RefreshCw, Layers
} from 'lucide-react';

interface CommandAction {
  action: string;
  param: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

interface CommandItem {
  id: string;
  prompt: string;
  actions: CommandAction[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  classification?: 'chat' | 'os-command' | 'rejected';
  result?: string;
  retryCount?: number;
}

interface AgentExecutionLogProps {
  lang: 'en' | 'bn';
  activeCommand: CommandItem | null;
  logs: string[];
}

export function AgentExecutionLog({ lang, activeCommand, logs }: AgentExecutionLogProps) {
  // If no active command is running, we can infer some details or show standby status
  const isCommandRunning = activeCommand && activeCommand.status === 'running';

  // Extract recent logs that relate specifically to execution
  const executionLogs = logs
    .filter(log => log.includes('[Client PC]') || log.includes('execute') || log.includes('Actions') || log.includes('completed') || log.includes('failed') || log.includes('👁️'))
    .slice(-8);

  // Parse action status based on the current active logs list
  const getActionListWithEstimates = (): CommandAction[] => {
    if (!activeCommand) return [];
    
    // Fallback: estimate step progress from current log contents
    const actionList = [...activeCommand.actions];
    let activeIdx = 0;

    // Check recent logs for keywords to estimate current execution pointer
    const lastLogsConcat = logs.slice(-4).join('\n').toLowerCase();
    
    actionList.forEach((act, idx) => {
      // Basic heuristics to match running status
      const actionName = act.action.toLowerCase();
      const actionParam = act.param.toLowerCase();
      
      let status: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
      
      if (!isCommandRunning) {
        if (activeCommand.status === 'completed') {
          status = 'completed';
        } else if (activeCommand.status === 'failed') {
          status = idx === actionList.length - 1 ? 'failed' : 'completed';
        }
      } else {
        // Log states to determine pointer
        if (lastLogsConcat.includes(`completed step ${idx}`) || lastLogsConcat.includes(`step ${idx + 1}`)) {
          activeIdx = idx + 1;
        } else if (lastLogsConcat.includes(actionName) || lastLogsConcat.includes(actionParam)) {
          activeIdx = idx;
        }

        if (idx < activeIdx) {
          status = 'completed';
        } else if (idx === activeIdx) {
          status = 'running';
        } else {
          status = 'pending';
        }
      }

      act.status = status;
    });

    return actionList;
  };

  const actions = getActionListWithEstimates();

  // Progress metrics calculation
  const completedCount = actions.filter(a => a.status === 'completed').length;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="border border-cyan-500/10 rounded-xl p-4 bg-slate-900/60 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-cyan-500 animate-spin" />
          {lang === 'bn' ? 'অপারেটর লাইভ ট্র্যাকার' : 'COGNITIVE OPERATIONS TRACKER'}
        </h3>
        <span className="flex items-center gap-1.5 text-[9px] px-2 py-0.5 font-mono font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <span className={`w-1.5 h-1.5 rounded-full ${isCommandRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {isCommandRunning 
            ? (lang === 'bn' ? 'কাজ প্রক্রিয়াধীন' : 'ACTIVE PIPELINE') 
            : (lang === 'bn' ? 'স্ট্যান্ডবাই' : 'STANDBY IDLE')}
        </span>
      </div>

      {!activeCommand ? (
        <div className="flex flex-col items-center justify-center py-10 text-center select-none">
          <Terminal className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
          <p className="text-xs font-mono text-slate-500">
            {lang === 'bn' 
              ? 'নিওরা পিসি রানারের জন্য অপেক্ষা করা হচ্ছে।' 
              : 'Standby mode: Send a voice or workflow command to watch process sequence.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 font-mono">
          {/* Main prompt being run */}
          <div className="p-2.5 rounded-lg bg-slate-950/75 border border-slate-800/80">
            <span className="text-[9px] font-bold text-cyan-500 block mb-1 uppercase tracking-wider">COMMAND IN CONTEXT</span>
            <span className="text-xs text-slate-300 break-words font-mono font-bold">"{activeCommand.prompt}"</span>
          </div>

          {/* Progress bar and statistics */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>PROGRESS TRANSACTIONS</span>
              <span className="text-[#00ff88] font-bold">{progressPercent}% ({completedCount}/{totalCount})</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Step-by-Step visual timeline */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
            {actions.map((act, index) => {
              const actsLabel = act.action.replace('_', ' ').toUpperCase();
              return (
                <div 
                  key={index}
                  className={`flex items-start gap-2.5 p-2 rounded transition-colors ${
                    act.status === 'running' 
                      ? 'bg-cyan-500/5 border border-cyan-500/20 shadow-md' 
                      : 'bg-slate-950/20 border border-slate-900'
                  }`}
                >
                  {/* Icon indicators */}
                  <div className="mt-0.5 shrink-0 select-none">
                    {act.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {act.status === 'running' && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
                    {act.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                    {act.status === 'pending' && <Circle className="w-4 h-4 text-slate-600 shrink-0" />}
                  </div>

                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold font-mono tracking-wide ${
                        act.status === 'completed' 
                          ? 'text-emerald-400' 
                          : act.status === 'running' 
                            ? 'text-cyan-400' 
                            : 'text-slate-400'
                      }`}>
                        STEP {index + 1}: {actsLabel}
                      </span>
                      <span className="text-[8px] text-slate-600 font-mono">
                        {act.status === 'completed' ? 'PASS' : act.status === 'running' ? 'LOAD' : 'QUEUE'}
                      </span>
                    </div>
                    {/* Step values/arguments */}
                    <span className="text-xs font-mono text-slate-300 truncate block mt-0.5">
                      {act.param ? `=> "${act.param}"` : '(No Parameter)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Micro Terminal logs timeline */}
          <div>
            <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
              <span>REAL-TIME PC FEEDBACK Logs</span>
              <span className="text-[9px] font-mono text-slate-500">Auto-Refreshed</span>
            </div>
            <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1 select-text scrollbar-thin">
              {executionLogs.length === 0 ? (
                <div className="text-center py-2 text-slate-600 italic">No feedback signals received yet.</div>
              ) : (
                executionLogs.map((log, index) => (
                  <div key={index} className="flex gap-1 items-start leading-relaxed truncate">
                    <span className="text-cyan-500 shrink-0 select-none">&gt;&gt;</span>
                    <span className="truncate">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
