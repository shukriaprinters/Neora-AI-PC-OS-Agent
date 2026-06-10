import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, XCircle, Terminal, Radio } from 'lucide-react';

interface Command {
  id: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  classification?: string;
  result?: string;
}

interface CommandStatusIndicatorProps {
  queue: Command[];
  lang: 'en' | 'bn';
}

export const CommandStatusIndicator: React.FC<CommandStatusIndicatorProps> = ({ queue, lang }) => {
  const [lastFinished, setLastFinished] = React.useState<Command | null>(null);

  // Monitor queue to capture transitions
  const activeCmd = queue.find(q => q.status === 'pending' || q.status === 'running');

  React.useEffect(() => {
    if (queue.length === 0) return;
    
    // If there is currently an active running command, clear the previous "finished" banner
    if (activeCmd) {
      setLastFinished(null);
      return;
    }

    // Find the latest processed command in queue
    const sorted = [...queue].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const latest = sorted[0];

    if (latest && (latest.status === 'completed' || latest.status === 'failed')) {
      setLastFinished(latest);
      const timer = setTimeout(() => {
        setLastFinished(null);
      }, 5000); // Hold success/failure for 5s
      return () => clearTimeout(timer);
    }
  }, [queue, activeCmd]);

  const hasStatusToShow = activeCmd || lastFinished;

  if (!hasStatusToShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        id="docked-command-status"
        className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-[0_0_20px_rgba(15,23,42,0.9)] rounded-xl overflow-hidden pointer-events-auto"
      >
        <div className="p-4 flex items-start gap-3">
          {/* Visual Feedback Circle */}
          <div className="flex-shrink-0 mt-0.5">
            {activeCmd ? (
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-sm rounded-full animate-pulse" />
                <Loader2 className="h-6 w-6 text-cyan-400 animate-spin relative z-10" />
              </div>
            ) : lastFinished?.status === 'completed' ? (
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/25 blur-sm rounded-full" />
                <CheckCircle2 className="h-6 w-6 text-emerald-400 relative z-10 animate-bounce" />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500/25 blur-sm rounded-full" />
                <XCircle className="h-6 w-6 text-rose-400 relative z-10" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Terminal className="h-3 w-3 text-cyan-400" />
                {activeCmd 
                  ? (lang === 'bn' ? 'কমান্ড চালিত হচ্ছে' : 'EXECUTING COMMAND')
                  : lastFinished?.status === 'completed'
                    ? (lang === 'bn' ? 'সফলভাবে সম্পন্ন' : 'COMMAND SUCCESS')
                    : (lang === 'bn' ? 'ব্যর্থ হয়েছে' : 'COMMAND FAILED')}
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {activeCmd ? activeCmd.timestamp : lastFinished?.timestamp}
              </span>
            </div>

            <p className="text-xs font-sans text-slate-200 font-medium truncate">
              "{activeCmd ? activeCmd.prompt : lastFinished?.prompt}"
            </p>

            {activeCmd && (
              <div className="space-y-1.5 pt-1.5">
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                    initial={{ width: '15%' }}
                    animate={{ width: ['15%', '60%', '85%', '95%'] }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                  {lang === 'bn' ? 'ব্যাকগ্রাউন্ডে প্রসেস চলছে...' : 'Background thread pending...'}
                </p>
              </div>
            )}

            {!activeCmd && lastFinished && (
              <p className="text-[10px] text-slate-400 font-mono italic truncate">
                {lastFinished.status === 'completed'
                  ? (lang === 'bn' ? '✓ অপারেশন সফল হয়েছে।' : '✓ Operation executed successfully.')
                  : (lang === 'bn' ? '✗ এক্সেস ডিনাইড অথবা রান কোড ব্যর্থ।' : '✗ Action aborted or failed to execute.')}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
