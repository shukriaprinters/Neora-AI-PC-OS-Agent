import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, Settings, RefreshCw, AlertCircle } from 'lucide-react';

interface Process {
  id: string;
  name: string;
  pid: number;
  cpu: number;
  memory: number;
  status: 'running' | 'idle' | 'sleep' | 'zombie';
  threads: number;
  uptime: string;
}

export const ProcessExplorer: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([
    {
      id: '1',
      name: 'neural-agent',
      pid: 1842,
      cpu: 8.2,
      memory: 1256.4,
      status: 'running',
      threads: 12,
      uptime: '24d 14h',
    },
    {
      id: '2',
      name: 'workflow-engine',
      pid: 1943,
      cpu: 2.5,
      memory: 856.2,
      status: 'running',
      threads: 8,
      uptime: '24d 12h',
    },
    {
      id: '3',
      name: 'ai-service',
      pid: 2014,
      cpu: 5.1,
      memory: 645.8,
      status: 'running',
      threads: 6,
      uptime: '22d 8h',
    },
    {
      id: '4',
      name: 'websocket-manager',
      pid: 2145,
      cpu: 1.2,
      memory: 234.6,
      status: 'running',
      threads: 4,
      uptime: '18d 4h',
    },
    {
      id: '5',
      name: 'database-service',
      pid: 2256,
      cpu: 0.8,
      memory: 156.4,
      status: 'idle',
      threads: 2,
      uptime: '15d 10h',
    },
    {
      id: '6',
      name: 'voice-processor',
      pid: 2387,
      cpu: 3.4,
      memory: 89.2,
      status: 'running',
      threads: 3,
      uptime: '10d 6h',
    },
  ]);

  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name'>('cpu');
  const [filter, setFilter] = useState<'all' | 'running' | 'idle'>('all');

  const sortedProcesses = [...processes]
    .filter((p) => (filter === 'all' ? true : p.status === filter))
    .sort((a, b) => {
      if (sortBy === 'cpu') return b.cpu - a.cpu;
      if (sortBy === 'memory') return b.memory - a.memory;
      return a.name.localeCompare(b.name);
    });

  const refreshProcesses = () => {
    setProcesses((prev) =>
      prev.map((p) => ({
        ...p,
        cpu: Math.random() * 10,
        memory: p.memory + (Math.random() - 0.5) * 50,
      }))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'idle':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sleep':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'zombie':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getTotalStats = () => {
    return {
      count: processes.length,
      totalCpu: processes.reduce((sum, p) => sum + p.cpu, 0),
      totalMemory: processes.reduce((sum, p) => sum + p.memory, 0),
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Process Explorer</h2>
          <p className="text-slate-400">Monitor and manage system processes</p>
        </div>
        <motion.button
          onClick={refreshProcesses}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={18} />
          Refresh
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Processes', value: stats.count, unit: '' },
          { label: 'CPU Usage', value: stats.totalCpu.toFixed(1), unit: '%' },
          { label: 'Memory Usage', value: (stats.totalMemory / 1024).toFixed(1), unit: 'GB' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
            whileHover={{ y: -2 }}
          >
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">
              {stat.value}
              <span className="text-sm text-slate-400">{stat.unit}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters and Sort */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2">
          {(['all', 'running', 'idle'] as const).map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          {(['cpu', 'memory', 'name'] as const).map((sort) => (
            <motion.button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                sortBy === sort
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sort: {sort}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Process List */}
      <div className="space-y-3">
        {sortedProcesses.length === 0 ? (
          <div className="text-center p-8 text-slate-400">No processes found</div>
        ) : (
          sortedProcesses.map((process, idx) => (
            <motion.div
              key={process.id}
              className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Process Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-white truncate">{process.name}</h3>
                      <p className="text-xs text-slate-400">PID: {process.pid}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(process.status)}`}>
                      {process.status}
                    </span>
                  </div>

                  {/* Resource Bars */}
                  <div className="space-y-2">
                    {/* CPU */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">CPU</span>
                        <span className="text-blue-400 font-mono">{process.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(process.cpu * 10, 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Memory */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Memory</span>
                        <span className="text-purple-400 font-mono">{process.memory.toFixed(1)} MB</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((process.memory / 2000) * 100, 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex gap-6 mt-3 text-xs text-slate-400">
                    <div>Threads: <span className="text-slate-200">{process.threads}</span></div>
                    <div>Uptime: <span className="text-slate-200">{process.uptime}</span></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-slate-200" whileHover={{ scale: 1.1 }}>
                    <Settings size={16} />
                  </motion.button>
                  <motion.button className="p-2 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400" whileHover={{ scale: 1.1 }}>
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Warning */}
      <motion.div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 font-medium text-sm">Note</p>
          <p className="text-sm text-slate-400 mt-1">
            Terminating processes may affect system stability. Use with caution on critical processes.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProcessExplorer;
