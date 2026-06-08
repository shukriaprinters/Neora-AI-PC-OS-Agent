import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, MicOff, Volume2, History, Loader } from 'lucide-react';

interface Command {
  id: string;
  text: string;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'error';
  result?: string;
}

export const PremiumVoiceCommand: React.FC = () => {
  const [commandText, setCommandText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commands, setCommands] = useState<Command[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setCommandText(transcript);
        };
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const commandId = Date.now().toString();
    const newCommand: Command = {
      id: commandId,
      text: command,
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
    };

    setCommands((prev) => [newCommand, ...prev]);
    setCommandText('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setCommands((prev) =>
        prev.map((cmd) =>
          cmd.id === commandId
            ? {
                ...cmd,
                status: 'completed',
                result: `Command executed: "${command}"`,
              }
            : cmd
        )
      );
    } catch (error) {
      setCommands((prev) =>
        prev.map((cmd) =>
          cmd.id === commandId
            ? {
                ...cmd,
                status: 'error',
                result: 'Error executing command',
              }
            : cmd
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(commandText);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Voice Command</h2>
        <p className="text-slate-400">Natural language interface for system control</p>
      </div>

      {/* Command Input Area */}
      <motion.div
        className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 backdrop-blur-sm"
        whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
      >
        <div className="space-y-6">
          {/* Waveform Visualization */}
          <div className={`flex items-center justify-center gap-1 h-20 rounded-lg bg-white/5 border border-white/10 transition-all ${isListening ? 'border-blue-500/50 bg-blue-500/5' : ''}`}>
            {isListening ? (
              <motion.div className="flex items-center justify-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full"
                    initial={{ height: '8px' }}
                    animate={{ height: `${Math.random() * 40 + 8}px` }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            ) : (
              <Volume2 size={32} className="text-slate-400" />
            )}
          </div>

          {/* Command Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                placeholder="Enter command or press mic to speak..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 pr-20 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-lg"
              />
              {isLoading && (
                <motion.div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Loader size={20} className="animate-spin text-blue-400" />
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3 flex-wrap">
              <motion.button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isListening ? (
                  <>
                    <MicOff size={18} />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    Start Listening
                  </>
                )}
              </motion.button>

              <motion.button
                type="submit"
                disabled={!commandText.trim() || isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={18} />
                Execute
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <History size={18} />
                History ({commands.length})
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h3 className="text-white font-semibold mb-4">Command History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {commands.length === 0 ? (
                <p className="text-slate-400 text-sm">No commands executed yet</p>
              ) : (
                commands.map((cmd) => (
                  <motion.div
                    key={cmd.id}
                    className={`p-3 rounded-lg border transition-all ${
                      cmd.status === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : cmd.status === 'error'
                        ? 'bg-red-500/10 border-red-500/30'
                        : cmd.status === 'executing'
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-slate-500/10 border-slate-500/30'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{cmd.text}</p>
                        <p className="text-xs text-slate-400 mt-1">{cmd.timestamp}</p>
                        {cmd.result && (
                          <p className="text-xs text-slate-300 mt-2">{cmd.result}</p>
                        )}
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                        cmd.status === 'completed'
                          ? 'bg-emerald-500'
                          : cmd.status === 'error'
                          ? 'bg-red-500'
                          : cmd.status === 'executing'
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-slate-500'
                      }`}></div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Commands */}
      <motion.div
        className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm"
        whileHover={{ y: -4 }}
      >
        <h3 className="text-white font-semibold mb-4">Quick Commands</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'List running processes',
            'Check system status',
            'Start backup process',
            'Clear cache memory',
            'Run system diagnostic',
            'Schedule maintenance',
          ].map((cmd) => (
            <motion.button
              key={cmd}
              onClick={() => executeCommand(cmd)}
              className="text-left p-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-sm"
              whileHover={{ x: 4 }}
            >
              {cmd}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumVoiceCommand;
