import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Menu, X, Bell, Search, Settings } from 'lucide-react';

interface PremiumShellProps {
  children: ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSection: string;
  systemStatus: 'online' | 'standby' | 'thinking' | 'executing';
}

export const PremiumShell: React.FC<PremiumShellProps> = ({
  children,
  sidebarOpen,
  setSidebarOpen,
  activeSection,
  systemStatus,
}) => {
  const getStatusColor = () => {
    switch (systemStatus) {
      case 'online':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'thinking':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'executing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Neora OS</h1>
                <p className="text-xs text-slate-400">Neural Agent v2.0</p>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search commands, workflows..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* System Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor()}`}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
              <span className="text-xs font-medium capitalize">{systemStatus}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex pt-16">
        {/* Sidebar - will be controlled by parent */}
        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          {/* Sidebar content injected by parent */}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PremiumShell;
