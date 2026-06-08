import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard, MessageSquare, Workflow, Brain, Terminal,
  Settings, LogOut, Plus, History, Star, ChevronRight, Cpu
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  category?: string;
}

interface PremiumSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  sidebarOpen: boolean;
}

export const PremiumSidebar: React.FC<PremiumSidebarProps> = ({
  activeSection,
  onNavigate,
  sidebarOpen,
}) => {
  const mainItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      category: 'main',
    },
    {
      id: 'voice',
      label: 'Voice Command',
      icon: <MessageSquare size={18} />,
      category: 'main',
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: <Workflow size={18} />,
      badge: '5',
      category: 'main',
    },
    {
      id: 'agent',
      label: 'AI Agent',
      icon: <Brain size={18} />,
      category: 'main',
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <Terminal size={18} />,
      category: 'main',
    },
    {
      id: 'processes',
      label: 'Process Explorer',
      icon: <Cpu size={18} />,
      category: 'main',
    },
  ];

  const utilityItems: NavigationItem[] = [
    {
      id: 'history',
      label: 'History',
      icon: <History size={18} />,
      category: 'utility',
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Star size={18} />,
      category: 'utility',
    },
  ];

  const renderNavItem = (item: NavigationItem) => (
    <motion.button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative overflow-hidden ${
        activeSection === item.id
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative z-10 flex items-center gap-3 flex-1">
        {item.icon}
        <span className="text-sm font-medium">{item.label}</span>
      </div>
      {item.badge && (
        <span className="bg-red-500/80 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
      {activeSection === item.id && (
        <ChevronRight size={16} className="ml-auto" />
      )}

      {/* Glow effect */}
      {activeSection === item.id && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );

  return (
    <motion.nav
      className="h-screen fixed left-0 top-16 w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/5 overflow-y-auto z-30"
      initial={{ x: -256 }}
      animate={{ x: sidebarOpen ? 0 : -256 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 space-y-8">
        {/* Main Navigation */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Main
          </p>
          <div className="space-y-2">
            {mainItems.map(renderNavItem)}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quick Actions
            </p>
            <button className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-slate-200 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {utilityItems.map(renderNavItem)}
          </div>
        </div>

        {/* Recent Workflows */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Recent
          </p>
          <div className="space-y-2">
            {['Email Tasks', 'Backup Process', 'System Scan'].map((item) => (
              <button
                key={item}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <Workflow size={14} className="text-slate-500" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent border-t border-white/5">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors text-sm">
            <Settings size={16} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm">
            <LogOut size={16} />
            Shutdown
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default PremiumSidebar;
