import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Copy, Trash2, Maximize2 } from 'lucide-react';

interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
  timestamp: string;
}

export const TerminalInterface: React.FC = () => {
  const [command, setCommand] = useState('');
  const [outputs, setOutputs] = useState<TerminalOutput[]>([
    {
      id: '0',
      type: 'info',
      content: 'Neora Neural OS Agent v2.0 - Terminal Interface',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: '1',
      type: 'info',
      content: 'Type "help" for available commands',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    // Add command to output
    const newId = Date.now().toString();
    setOutputs((prev) => [
      ...prev,
      {
        id: newId,
        type: 'input',
        content: `$ ${cmd}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    setCommand('');
    setIsLoading(true);

    try {
      // Built-in commands
      let result = '';
      const cmdLower = cmd.toLowerCase().trim();

      if (cmdLower === 'help') {
        result = `Available commands:
  system - Show system information
  processes - List running processes
  status - Check agent status
  workflows - List active workflows
  metrics - Display system metrics
  clear - Clear terminal
  version - Show version information`;
      } else if (cmdLower === 'system') {
        result = `System Information:
  OS: Neora Neural OS v2.0
  Architecture: x64
  CPU Cores: 8
  Total Memory: 16 GB
  Available Memory: 4.2 GB
  Uptime: 24 days, 14 hours, 32 minutes`;
      } else if (cmdLower === 'processes') {
        result = `Running Processes (Top 10):
  1. neural-agent (1.2 GB)
  2. workflow-engine (856 MB)
  3. ai-service (645 MB)
  4. websocket-manager (234 MB)
  5. database-service (156 MB)
  6. voice-processor (89 MB)
  7. system-monitor (45 MB)
  8. backup-service (23 MB)
  9. analytics-engine (12 MB)
  10. log-manager (8 MB)`;
      } else if (cmdLower === 'status') {
        result = `Agent Status:
  Status: Online
  Connected Clients: 3
  Active Workflows: 2
  Last Command: 5 seconds ago
  CPU Usage: 35%
  Memory Usage: 62%
  Response Time: 23ms`;
      } else if (cmdLower === 'workflows') {
        result = `Active Workflows:
  1. Daily Backup Process (Scheduled: 02:00 AM)
  2. System Maintenance (Scheduled: 11:30 PM)
  3. Email Tasks (Manual trigger)`;
      } else if (cmdLower === 'metrics') {
        result = `System Metrics:
  CPU Usage: 35% (Green)
  Memory Usage: 62% (Yellow)
  Disk Usage: 48% (Green)
  Network: 24 Mbps (Green)
  Temperature: 52°C (Green)
  Threads: 3,284 (Green)`;
      } else if (cmdLower === 'clear') {
        setOutputs([]);
        setIsLoading(false);
        return;
      } else if (cmdLower === 'version') {
        result = `Neora Neural OS Agent
  Version: 2.0.0
  Build: 2024.06.08
  Release: Production
  License: Enterprise`;
      } else {
        // Try to execute as system command via API
        try {
          const response = await fetch('/api/system/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: cmd, timeout: 5000 }),
          });

          const data = await response.json();
          result = data.success ? data.data.output : `Error: ${data.error || 'Command execution failed'}`;
        } catch (error) {
          result = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }

      // Add output
      setOutputs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: result.includes('Error') ? 'error' : 'output',
          content: result,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(command);
  };

  const clearTerminal = () => {
    setOutputs([]);
  };

  const copyOutput = () => {
    const text = outputs.map((o) => o.content).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Terminal</h2>
        <p className="text-slate-400">Direct system access and command execution</p>
      </div>

      {/* Terminal Area */}
      <motion.div
        className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-black p-6 backdrop-blur-sm overflow-hidden flex flex-col h-[600px]"
        whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-slate-400 font-mono">neora-terminal v2.0</span>
          <div className="flex gap-2">
            <motion.button
              onClick={copyOutput}
              className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-slate-200 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <Copy size={16} />
            </motion.button>
            <motion.button
              onClick={clearTerminal}
              className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-slate-200 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>

        {/* Output Area */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto font-mono text-sm space-y-1 mb-4 pr-2"
        >
          {outputs.map((output) => (
            <div
              key={output.id}
              className={`${
                output.type === 'input'
                  ? 'text-blue-400'
                  : output.type === 'error'
                  ? 'text-red-400'
                  : output.type === 'info'
                  ? 'text-slate-400'
                  : 'text-green-400'
              }`}
            >
              <span className="text-xs text-slate-600">[{output.timestamp}]</span> {output.content}
            </div>
          ))}
          {isLoading && (
            <div className="text-slate-400 animate-pulse">
              <span className="animate-bounce inline-block">▌</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <span className="text-green-400 font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none font-mono"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            disabled={!command.trim() || isLoading}
            className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-slate-200 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </form>
      </motion.div>

      {/* Quick Commands */}
      <motion.div
        className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm"
        whileHover={{ y: -4 }}
      >
        <h3 className="text-white font-semibold mb-4">Quick Commands</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { cmd: 'help', desc: 'Show help' },
            { cmd: 'system', desc: 'System info' },
            { cmd: 'processes', desc: 'Show processes' },
            { cmd: 'status', desc: 'Agent status' },
            { cmd: 'workflows', desc: 'Active workflows' },
            { cmd: 'metrics', desc: 'System metrics' },
          ].map((item) => (
            <motion.button
              key={item.cmd}
              onClick={() => executeCommand(item.cmd)}
              className="p-2 rounded bg-white/5 border border-white/10 text-left hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="font-mono text-blue-400">{item.cmd}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TerminalInterface;
