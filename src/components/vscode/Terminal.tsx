import React, { useState, useRef, useEffect } from 'react';
import { TerminalEngine, TerminalOutput } from '../../lib/terminal-engine';
import { VSCodeDB } from '../../lib/vscode-db';
import { Terminal as TerminalIcon, X, Minus, Square, Copy } from 'lucide-react';
import { copyToClipboardFailsafe } from '../../utils/clipboard';

interface TerminalProps {
  onClose: () => void;
}

export function Terminal({ onClose }: TerminalProps) {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [input, setInput] = useState('');
  const [isMinimized, setMinimized] = useState(false);
  const [isClaudeStreaming, setClaudeStreaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const engine = useRef(new TerminalEngine()).current;
  const outputRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim().toLowerCase();

    await VSCodeDB.addCommand(input);
    setOutputs(prev => [...prev, { type: 'input', content: `$ ${input}` }]);

    if (engine.isClaudeMode() && !command.startsWith('/')) {
      // Claude REPL mode - streaming response
      setClaudeStreaming(true);
      const claudeResponses = await engine.handleClaudePrompt(input);
      for (const response of claudeResponses) {
        setOutputs(prev => [...prev, response]);
        await new Promise(r => setTimeout(r, 300));
      }
      setClaudeStreaming(false);
    } else {
      const results = engine.execute(input);
      if (input.toLowerCase() === 'clear') {
        setOutputs([]);
      } else if (command === '/clear') {
        setOutputs([]);
      } else {
        setOutputs(prev => [...prev, ...results]);
      }
    }

    setInput('');
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getOutputColor = (output: TerminalOutput) => {
    switch (output.type) {
      case 'input': return 'text-cyan-400';
      case 'output': return 'text-slate-200';
      case 'error': return 'text-rose-400';
      case 'system': return 'text-amber-400';
      default: return 'text-slate-200';
    }
  };

  return (
    <div className={`h-full flex flex-col bg-slate-950 border-t border-slate-800/80 ${isMinimized ? 'h-10' : 'flex-1 min-h-0'}`}>
      {/* Terminal Header */}
      <div className="flex items-center h-10 bg-slate-900/80 border-b border-slate-800/80 px-3 justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-slate-400">TERMINAL</span>
          {engine.isClaudeMode() && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono">[Claude REPL]</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const history = VSCodeDB.getCommandHistory().then(h => {
                setOutputs(prev => [...prev, ...h.map(c => ({ type: 'output', content: c.command }))]);
              });
            }}
            className="p-1.5 text-slate-500 hover:text-slate-300 cursor-pointer"
            title="Command history"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMinimized(!isMinimized)}
            className="p-1.5 text-slate-500 hover:text-slate-300 cursor-pointer"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Square className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Output Area */}
          <div ref={outputRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs">
            {outputs.map((output, idx) => (
              <pre key={idx} className={`whitespace-pre-wrap ${getOutputColor(output)}`}>
                {output.content}
              </pre>
            ))}
            {isClaudeStreaming && (
              <span className="text-cyan-400 animate-pulse">▋</span>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800/80 flex">
            <span className="text-cyan-400 font-mono mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-transparent outline-none font-mono text-sm text-slate-200"
              placeholder={engine.isClaudeMode() ? 'Ask Claude... (/help, /clear, /status)' : 'Type commands... (ls, cd, claude, help)'}
              autoFocus
              disabled={isClaudeStreaming}
            />
          </form>
        </>
      )}
    </div>
  );
}