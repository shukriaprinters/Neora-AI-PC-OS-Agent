import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import PremiumShell from './PremiumShell';
import PremiumSidebar from './PremiumSidebar';
import DashboardCards from './DashboardCards';
import PremiumVoiceCommand from './PremiumVoiceCommand';
import AdvancedWorkflowBuilder from './AdvancedWorkflowBuilder';
import TerminalInterface from './TerminalInterface';
import ProcessExplorer from './ProcessExplorer';

interface SystemNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export const PremiumNeuralOSApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'online' | 'standby' | 'thinking' | 'executing'>('standby');
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

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
          addNotification('Connected to Neural OS Agent', 'success');
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
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('[WebSocket] Connection error:', error);
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

  const addNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    const notification: SystemNotification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 10));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'system:status':
        setSystemStatus(message.payload.status);
        break;
      case 'workflow:completed':
        addNotification(`Workflow "${message.payload.name}" completed`, 'success');
        break;
      case 'system:error':
        addNotification(message.payload.error, 'error');
        break;
      case 'agent:thinking':
        setSystemStatus('thinking');
        break;
      case 'agent:executing':
        setSystemStatus('executing');
        break;
      default:
        console.log('[WebSocket] Message:', message);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardCards />;
      case 'voice':
        return <PremiumVoiceCommand />;
      case 'workflows':
        return <AdvancedWorkflowBuilder />;
      case 'agent':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Agent Control</h2>
              <p className="text-slate-400">Monitor and interact with the autonomous agent</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 backdrop-blur-sm">
              <div className="flex items-center justify-center h-64 flex-col gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center animate-pulse">
                  <span className="text-2xl">🧠</span>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">AI Agent</p>
                  <p className="text-slate-400 text-sm">Status: {systemStatus}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'terminal':
        return <TerminalInterface />;
      case 'processes':
        return <ProcessExplorer />;
      default:
        return <DashboardCards />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <PremiumSidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Shell */}
      <PremiumShell
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        systemStatus={systemStatus}
      >
        {renderContent()}
      </PremiumShell>

      {/* Notifications */}
      <div className="fixed bottom-6 right-6 space-y-3 z-40 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`pointer-events-auto p-4 rounded-lg backdrop-blur-sm border animate-in fade-in slide-in-from-right ${
                notification.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : notification.type === 'error'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : notification.type === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {notification.message}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PremiumNeuralOSApp;
