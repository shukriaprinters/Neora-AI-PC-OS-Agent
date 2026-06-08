/**
 * Neural OS Agent - Main Application Component
 * Integrated JARVIS-inspired holographic interface with all core systems
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HolographicShell } from './HolographicShell';
import { SystemMetricsDashboard } from './SystemMetricsDashboard';
import { VoiceCommandCenter } from './VoiceCommandCenter';
import {
  Menu, X, Settings, Power, MessageSquare, Activity, Zap, AlertCircle,
  ChevronDown, Terminal, Workflow, Brain
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface SystemNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export const NeuralOSApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'online' | 'standby' | 'thinking' | 'executing'>('standby');
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Navigation items
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'System Dashboard',
      icon: <Activity size={20} />,
      description: 'Real-time metrics & monitoring',
    },
    {
      id: 'voice',
      label: 'Voice Command',
      icon: <MessageSquare size={20} />,
      description: 'Natural language interface',
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: <Workflow size={20} />,
      description: 'Task automation & execution',
    },
    {
      id: 'agent',
      label: 'AI Agent',
      icon: <Brain size={20} />,
      description: 'Intent analysis & planning',
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <Terminal size={20} />,
      description: 'Direct system access',
    },
  ];

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          setWsConnected(true);
          setSystemStatus('online');
          addNotification('Connected to agent backend', 'success');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('[WebSocket] Message parse error:', error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          setWsConnected(false);
          setSystemStatus('standby');
        };

        wsRef.current.onclose = () => {
          setWsConnected(false);
          setSystemStatus('standby');
          // Attempt reconnection after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'agent:plan-started':
        setSystemStatus('thinking');
        break;

      case 'agent:plan-completed':
        setSystemStatus('online');
        addNotification('Plan executed successfully', 'success');
        break;

      case 'workflow:completed':
        addNotification('Workflow completed', 'success');
        break;

      case 'system:warning':
        addNotification(message.payload?.message || 'System warning', 'warning');
        break;

      default:
        console.log('[WebSocket] Received message:', message.type);
    }
  };

  // Add notification
  const addNotification = (message: string, type: SystemNotification['type']) => {
    const id = Math.random().toString(36).substring(7);
    const notification: SystemNotification = {
      id,
      type,
      message,
      timestamp: new Date().toISOString(),
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Handle voice command
  const handleVoiceCommand = async (input: string) => {
    setSystemStatus('executing');
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'agent:process-intent',
            payload: { input },
          })
        );
      }
    } catch (error) {
      console.error('[Agent] Command error:', error);
      addNotification('Command processing failed', 'error');
    }
  };

  // Render active section
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <SystemMetricsDashboard />
          </motion.div>
        );

      case 'voice':
        return (
          <motion.div
            key="voice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            <VoiceCommandCenter onCommand={handleVoiceCommand} />
          </motion.div>
        );

      case 'workflows':
        return (
          <motion.div
            key="workflows"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full p-6"
          >
            <div className="backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg p-8 text-center">
              <Workflow size={48} className="mx-auto mb-4 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white mb-2">Workflow Manager</h2>
              <p className="text-slate-400">Create and manage complex multi-step automation workflows</p>
            </div>
          </motion.div>
        );

      case 'agent':
        return (
          <motion.div
            key="agent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full p-6"
          >
            <div className="backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg p-8 text-center">
              <Brain size={48} className="mx-auto mb-4 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white mb-2">AI Agent Control</h2>
              <p className="text-slate-400">Monitor and interact with the autonomous agent loop</p>
            </div>
          </motion.div>
        );

      case 'terminal':
        return (
          <motion.div
            key="terminal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full p-6"
          >
            <div className="backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg p-8 font-mono text-green-400 overflow-auto max-h-full">
              <div className="text-sm">
                <div>{'[neuralOS] > _'}</div>
                <div className="text-slate-500 mt-4">Terminal access - Command execution interface</div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <HolographicShell active={wsConnected} systemStatus={systemStatus}>
      <div className="flex w-full h-full">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-64 backdrop-blur-md bg-slate-900/60 border-r border-cyan-500/20 flex flex-col overflow-hidden"
            >
              {/* Logo Section */}
              <motion.div
                className="p-6 border-b border-cyan-500/20 flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
                >
                  <Brain size={24} className="text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold text-white font-mono">NEORA OS</h1>
                  <p className="text-xs text-cyan-400">Neural Agent v1.0</p>
                </div>
              </motion.div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navigationItems.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === item.id
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      {item.icon}
                      <span className="font-mono text-sm">{item.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-8">{item.description}</p>
                  </motion.button>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-cyan-500/20 space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-all font-mono text-sm"
                >
                  <Settings size={16} />
                  Settings
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all font-mono text-sm"
                >
                  <Power size={16} />
                  Shutdown
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <motion.div
            className="h-16 backdrop-blur-md bg-slate-900/40 border-b border-cyan-500/20 flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-all text-cyan-400"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>

              <div>
                <h2 className="text-lg font-bold text-white font-mono">
                  {navigationItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-xs text-slate-500">Live system interface</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      '0 0 0 rgba(0, 217, 255, 0)',
                      '0 0 15px rgba(0, 217, 255, 0.6)',
                      '0 0 0 rgba(0, 217, 255, 0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${
                    wsConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <span className="text-xs font-mono text-slate-400">
                  {wsConnected ? 'Connected' : 'Offline'}
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            className="flex-1 overflow-auto relative"
          >
            <AnimatePresence mode="wait">
              {renderSection()}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        <div className="fixed bottom-6 right-6 space-y-3 z-50">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-4 rounded-lg backdrop-blur-md border font-mono text-sm flex items-center gap-3 ${
                notif.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : notif.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : notif.type === 'warning'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}
            >
              {notif.type === 'error' && <AlertCircle size={16} />}
              {notif.type === 'success' && <Zap size={16} />}
              {notif.type === 'warning' && <AlertCircle size={16} />}
              {notif.type === 'info' && <Zap size={16} />}
              <span>{notif.message}</span>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </HolographicShell>
  );
};

export default NeuralOSApp;
