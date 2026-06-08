/**
 * Voice Command Center Component
 * Advanced voice input and natural language processing interface
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, Square, Loader } from 'lucide-react';

interface CommandResult {
  intent: string;
  confidence: number;
  suggestedActions: string[];
  timestamp: string;
}

interface VoiceCommandCenterProps {
  onCommand?: (input: string) => Promise<void>;
  apiUrl?: string;
}

export const VoiceCommandCenter: React.FC<VoiceCommandCenterProps> = ({
  onCommand,
  apiUrl = '/api/agent',
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState<CommandResult | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isMicAvailable, setIsMicAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        startWaveformAnimation();
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('[Voice] Recognition error:', event.error);
        setIsListening(false);
      };

      setIsMicAvailable(true);
    }
  }, []);

  // Start waveform animation
  const startWaveformAnimation = () => {
    const canvas = waveformRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let phase = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 10, 20, 0.5)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#00d9ff';
      ctx.lineWidth = 2;

      // Draw waveform
      ctx.beginPath();
      for (let x = 0; x < width; x += 5) {
        const y =
          height / 2 +
          Math.sin((x + phase) * 0.02) * 20 +
          Math.sin((x + phase) * 0.05) * 10;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw frequency bars
      const barCount = 20;
      const barWidth = width / barCount;
      ctx.fillStyle = '#00ff88';

      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * height * 0.6;
        const x = i * barWidth;
        ctx.fillRect(x + 2, height - barHeight, barWidth - 4, barHeight);
      }

      phase += 5;
      if (isListening) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Handle voice input toggle
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (isMicAvailable) {
      recognitionRef.current?.start();
    }
  };

  // Process command
  const processCommand = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`${apiUrl}/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLastCommand({
            intent: data.data.intent,
            confidence: Math.round(data.data.riskLevel ? 60 : 85),
            suggestedActions: data.data.steps?.map((s: any) => s.action) || [],
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Add to history
      setCommandHistory(prev => [input, ...prev.slice(0, 4)]);

      if (onCommand) {
        await onCommand(input);
      }

      setInput('');
    } catch (error) {
      console.error('[Voice] Command processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle keyboard submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processCommand();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6"
    >
      {/* Waveform Display */}
      <AnimatePresence>
        {isListening && (
          <motion.canvas
            ref={waveformRef}
            width={500}
            height={100}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="w-full mb-6 backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg"
          />
        )}
      </AnimatePresence>

      {/* Command Input */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative mb-6"
      >
        <div className="flex gap-3 backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg p-4 focus-within:border-cyan-500/50 transition-all">
          {/* Microphone Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVoiceInput}
            disabled={!isMicAvailable}
            className={`p-3 rounded-lg transition-all ${
              isListening
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-slate-800/50 border border-slate-700/50 text-cyan-400 hover:border-cyan-500/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? <Square size={20} /> : <Mic size={20} />}
          </motion.button>

          {/* Text Input */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command or speak... (Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent text-white font-mono text-sm placeholder-slate-500 border-none outline-none resize-none"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 217, 255, 0.3) transparent',
            }}
          />

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={processCommand}
            disabled={isProcessing || !input.trim()}
            className="p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Last Command Result */}
      <AnimatePresence>
        {lastCommand && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-mono text-cyan-400 uppercase">Last Intent</h3>
                <p className="text-lg font-bold text-white mt-1">{lastCommand.intent}</p>
              </div>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs font-mono text-green-400">
                  {lastCommand.confidence}% confidence
                </span>
              </motion.div>
            </div>

            {lastCommand.suggestedActions.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {lastCommand.suggestedActions.map((action, idx) => (
                  <motion.span
                    key={action}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="px-2 py-1 text-xs font-mono bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded"
                  >
                    {action}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg"
        >
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">Recent Commands</h3>
          <div className="space-y-2">
            {commandHistory.map((cmd, idx) => (
              <motion.button
                key={`${cmd}-${idx}`}
                onClick={() => setInput(cmd)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="w-full text-left p-2 rounded hover:bg-slate-800/50 transition-all text-sm text-slate-300 hover:text-cyan-400 font-mono border border-transparent hover:border-slate-700/50"
              >
                {cmd.length > 60 ? cmd.substring(0, 60) + '...' : cmd}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VoiceCommandCenter;
