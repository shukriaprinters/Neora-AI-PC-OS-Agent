import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Play, Pause, Clock, AlertCircle, CheckCircle,
  Workflow as WorkflowIcon, ChevronDown, Edit2, Copy, Settings
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'command' | 'condition' | 'wait' | 'notification' | 'script';
  config: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
}

export const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Daily Backup Process',
      description: 'Automated daily system backup with compression',
      steps: [
        { id: 's1', name: 'Check disk space', type: 'command', config: {}, status: 'completed' },
        { id: 's2', name: 'Create backup', type: 'command', config: {}, status: 'completed' },
        { id: 's3', name: 'Compress files', type: 'command', config: {}, status: 'completed' },
        { id: 's4', name: 'Upload to cloud', type: 'command', config: {}, status: 'completed' },
      ],
      isActive: true,
      lastRun: 'Today at 02:00 AM',
      nextRun: 'Tomorrow at 02:00 AM',
    },
    {
      id: '2',
      name: 'System Maintenance',
      description: 'Regular system cleanup and optimization',
      steps: [
        { id: 's5', name: 'Clean cache', type: 'command', config: {}, status: 'pending' },
        { id: 's6', name: 'Update packages', type: 'command', config: {}, status: 'pending' },
      ],
      isActive: true,
      lastRun: 'Yesterday at 11:30 PM',
      nextRun: 'Tomorrow at 11:30 PM',
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'command':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'condition':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'wait':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'notification':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-emerald-400" />;
      case 'running':
        return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}><Clock size={16} className="text-blue-400" /></motion.div>;
      case 'failed':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <div className="w-4 h-4 rounded-full border border-slate-400"></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Workflow Manager</h2>
          <p className="text-slate-400">Create and manage automated task workflows</p>
        </div>
        <motion.button
          onClick={() => setShowNewWorkflow(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={18} />
          New Workflow
        </motion.button>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <motion.div
            key={workflow.id}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm hover:border-white/20 transition-all overflow-hidden"
            whileHover={{ y: -4 }}
          >
            {/* Workflow Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <WorkflowIcon size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    workflow.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{workflow.description}</p>
              </div>
              <div className="flex gap-2">
                <motion.button className="p-2 rounded-lg hover:bg-white/10 transition-colors" whileHover={{ scale: 1.1 }}>
                  <Play size={18} className="text-blue-400" />
                </motion.button>
                <motion.button className="p-2 rounded-lg hover:bg-white/10 transition-colors" whileHover={{ scale: 1.1 }}>
                  <Edit2 size={18} className="text-slate-400" />
                </motion.button>
                <motion.button className="p-2 rounded-lg hover:bg-white/10 transition-colors" whileHover={{ scale: 1.1 }}>
                  <Copy size={18} className="text-slate-400" />
                </motion.button>
              </div>
            </div>

            {/* Timing Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-xs text-slate-400 mb-1">Last Run</p>
                <p className="text-sm text-white font-medium">{workflow.lastRun || 'Never'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Next Run</p>
                <p className="text-sm text-white font-medium">{workflow.nextRun || 'Not scheduled'}</p>
              </div>
            </div>

            {/* Steps Visualization */}
            <div
              className="space-y-0 cursor-pointer"
              onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-300">Steps ({workflow.steps.length})</p>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    selectedWorkflow === workflow.id ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Steps */}
              <AnimatePresence>
                {selectedWorkflow === workflow.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 mt-3 border-t border-white/10 pt-4"
                  >
                    {workflow.steps.map((step, idx) => (
                      <div key={step.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${getStepTypeColor(step.type)} mb-2`}>
                            {getStatusIcon(step.status)}
                          </div>
                          {idx < workflow.steps.length - 1 && (
                            <div className="w-0.5 h-8 bg-gradient-to-b from-slate-500 to-transparent"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className={`p-3 rounded-lg border ${getStepTypeColor(step.type)}`}>
                            <p className="font-medium text-sm">{step.name}</p>
                            <p className="text-xs mt-1 capitalize opacity-75">{step.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State or Create New */}
      <AnimatePresence>
        {showNewWorkflow && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewWorkflow(false)}
          >
            <motion.div
              className="bg-slate-900 border border-white/10 rounded-xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Create New Workflow</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Workflow name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
                />
                <textarea
                  placeholder="Description"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 resize-none h-24"
                ></textarea>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowNewWorkflow(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Create
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowBuilder;
