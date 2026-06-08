import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Settings, Play, Square, MessageSquare, Volume2, VolumeX } from 'lucide-react';

interface CommandFeedback {
  id: string;
  type: 'input' | 'feedback' | 'confirmation' | 'executing' | 'success' | 'error';
  text: string;
  timestamp: Date;
  voiceEnabled?: boolean;
}

interface ConfirmationRequest {
  id: string;
  message: string;
  expiresAt: Date;
}

export default function OSAgentController() {
  const [isListening, setIsListening] = useState(false);
  const [agentActive, setAgentActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [feedback, setFeedback] = useState<CommandFeedback[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationRequest | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const feedbackEndRef = useRef<HTMLDivElement>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  // Declare electron API types
  declare global {
    interface Window {
      electron: {
        voiceProcess: (input: string) => Promise<any>;
        voiceConfirm: (confirmationId: string, confirmed: boolean) => Promise<any>;
        agentToggle: () => Promise<any>;
        agentGetStatus: () => Promise<any>;
        settingsGetAutoLaunch: () => Promise<any>;
        settingsSetAutoLaunch: (enabled: boolean) => Promise<any>;
        settingsVoiceEnabled: (enabled: boolean) => Promise<any>;
        settingsConfirmationEnabled: (enabled: boolean) => Promise<any>;
        onHotkeyToggleListening: (callback: () => void) => void;
        onHotkeyStopCommand: (callback: () => void) => void;
        onAgentToggle: (callback: (active: boolean) => void) => void;
        onCommandExecuting: (callback: (data: any) => void) => void;
        onNavigate: (callback: (path: string) => void) => void;
        onFeedback: (callback: (message: any) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    }
  }

  // Setup voice recognition (Web Speech API)
  const setupVoiceRecognition = () => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition API not supported');
      addFeedback('error', 'Speech Recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      addFeedback('input', 'Listening...');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (event.isFinal) {
        handleCommand(transcript);
      } else {
        addFeedback('input', `Partial: ${transcript}`);
      }
    };

    recognition.onerror = (event) => {
      addFeedback('error', `Voice recognition error: ${event.error}`);
    };

    return recognition;
  };

  const voiceRecognitionRef = useRef<any>(setupVoiceRecognition());

  const addFeedback = (type: CommandFeedback['type'], text: string) => {
    const newFeedback: CommandFeedback = {
      id: `fb-${Date.now()}-${Math.random()}`,
      type,
      text,
      timestamp: new Date(),
    };
    setFeedback((prev) => [...prev, newFeedback]);
    feedbackEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCommand = async (input: string) => {
    if (!input.trim()) return;

    try {
      addFeedback('input', `Command: ${input}`);
      const result = await window.electron.voiceProcess(input);

      if (result.requiresConfirmation) {
        setPendingConfirmation({
          id: result.confirmationId,
          message: result.message,
          expiresAt: new Date(Date.now() + 30000),
        });
        setCountdownSeconds(5);
        startConfirmationCountdown();
        addFeedback('confirmation', result.message);
      } else if (result.success) {
        addFeedback('success', 'Command executed successfully');
        setTextInput('');
      } else {
        addFeedback('error', result.error || 'Command failed');
      }
    } catch (error: any) {
      addFeedback('error', `Error: ${error.message}`);
    }
  };

  const startConfirmationCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    let remaining = 5;
    countdownRef.current = setInterval(() => {
      remaining--;
      setCountdownSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        handleConfirmation(false);
      }
    }, 1000);
  };

  const handleConfirmation = async (confirmed: boolean) => {
    if (!pendingConfirmation) return;

    try {
      if (countdownRef.current) clearInterval(countdownRef.current);
      const result = await window.electron.voiceConfirm(
        pendingConfirmation.id,
        confirmed
      );

      if (confirmed) {
        addFeedback('executing', 'Executing command...');
      } else {
        addFeedback('error', 'Command cancelled');
      }

      setPendingConfirmation(null);
    } catch (error: any) {
      addFeedback('error', `Confirmation error: ${error.message}`);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      voiceRecognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!voiceRecognitionRef.current) {
        voiceRecognitionRef.current = setupVoiceRecognition();
      }
      voiceRecognitionRef.current?.start();
    }
  };

  const handleSubmitText = async () => {
    const input = textInput.trim();
    if (!input) return;
    setTextInput('');
    await handleCommand(input);
  };

  // Setup Electron event listeners
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const status = await window.electron.agentGetStatus();
        setAgentActive(status.active);
        setVoiceEnabled(status.voiceEnabled);
        setConfirmationEnabled(status.confirmationEnabled);
      } catch (error) {
        console.error('Failed to get agent status:', error);
      }
    };

    updateStatus();

    // Listen for hotkey events
    window.electron.onHotkeyToggleListening(() => toggleListening());
    window.electron.onHotkeyStopCommand(() => {
      voiceRecognitionRef.current?.stop();
      setIsListening(false);
    });
    window.electron.onAgentToggle((active) => setAgentActive(active));

    return () => {
      window.electron.removeAllListeners('hotkey:toggle-listening');
      window.electron.removeAllListeners('hotkey:stop-command');
      window.electron.removeAllListeners('agent:toggle');
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    };
  }, []);

  const toggleVoice = async () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    try {
      await window.electron.settingsVoiceEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle voice:', error);
    }
  };

  const toggleConfirmation = async () => {
    const newState = !confirmationEnabled;
    setConfirmationEnabled(newState);
    try {
      await window.electron.settingsConfirmationEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle confirmation:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Neora OS Agent
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                agentActive
                  ? 'bg-green-500/20 text-green-300 border border-green-400/50'
                  : 'bg-slate-500/20 text-slate-300 border border-slate-400/50'
              }`}
            >
              {agentActive ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleVoice}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {voiceEnabled ? (
                <Volume2 size={20} />
              ) : (
                <VolumeX size={20} className="text-red-400" />
              )}
            </button>
            <button
              onClick={toggleConfirmation}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              title={confirmationEnabled ? 'Disable confirmation' : 'Enable confirmation'}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Display */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {feedback.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border backdrop-blur-sm ${
              item.type === 'error'
                ? 'bg-red-900/20 border-red-500/30 text-red-200'
                : item.type === 'success'
                ? 'bg-green-900/20 border-green-500/30 text-green-200'
                : item.type === 'confirmation'
                ? 'bg-blue-900/20 border-blue-500/30 text-blue-200'
                : item.type === 'executing'
                ? 'bg-purple-900/20 border-purple-500/30 text-purple-200'
                : 'bg-slate-700/20 border-slate-500/30 text-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 text-xl">
                {item.type === 'input' && '🎤'}
                {item.type === 'feedback' && '👂'}
                {item.type === 'confirmation' && '❓'}
                {item.type === 'executing' && '⚙️'}
                {item.type === 'success' && '✅'}
                {item.type === 'error' && '❌'}
              </div>
              <div>
                <p className="text-sm">{item.text}</p>
                <p className="text-xs opacity-60 mt-1">
                  {item.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={feedbackEndRef} />
      </div>

      {/* Confirmation Dialog */}
      {pendingConfirmation && (
        <div className="border-t border-slate-700 p-6 bg-blue-900/20 border-blue-500/30">
          <div className="mb-4">
            <p className="text-lg font-semibold mb-2">{pendingConfirmation.message}</p>
            <p className="text-sm text-blue-300">
              Responding in {countdownSeconds} seconds...
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleConfirmation(true)}
              className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Yes, Proceed
            </button>
            <button
              onClick={() => handleConfirmation(false)}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-700 p-6 bg-slate-800/50">
        <div className="flex gap-3 mb-4">
          <button
            onClick={toggleListening}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={20} />
                Stop Listening
              </>
            ) : (
              <>
                <Mic size={20} />
                Start Listening
              </>
            )}
          </button>
          <button
            onClick={toggleListening}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-slate-700 text-slate-300'
                : 'bg-slate-600 hover:bg-slate-700'
            }`}
            disabled={isListening}
          >
            {isListening && <div className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />}
            Mic
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitText()}
            placeholder="Or type a command..."
            className="flex-1 py-3 px-4 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSubmitText}
            disabled={!textInput.trim()}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Hotkeys: Alt+N to toggle listening | Ctrl+Shift+N to show window | Escape to stop
        </p>
      </div>
    </div>
  );
}
