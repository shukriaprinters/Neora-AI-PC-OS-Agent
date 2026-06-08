import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Play, Pause, Clock, AlertCircle, CheckCircle,
  Workflow as WorkflowIcon, ChevronDown, Edit2, Copy, Settings, Download, Upload
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
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  successRate?: number;
  totalRuns?: number;
}

export const AdvancedWorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Daily Backup Process',
      description: 'Automated daily system backup with compression and cloud upload',
      steps: [
        { id: 's1', name: 'Check disk space', type: 'command', config: { cmd: 'df -h' }, status: 'completed' },
        { id: 's2', name: 'Create backup', type: 'command', config: { cmd: 'tar -czf backup.tar.gz /' }, status: 'completed' },
        { id: 's3', name: 'Verify integrity', type: 'command', config: { cmd: 'md5sum backup.tar.gz' }, status: 'completed' },
        { id: 's4', name: 'Upload to cloud', type: 'command', config: { cmd: 'aws s3 cp backup.tar.gz s3://bucket/' }, status: 'completed' },
        { id: 's5', name: 'Send notification', type: 'notification', config: { message: 'Backup completed successfully' }, status: 'completed' },
      ],
      isActive: true,
      schedule: 'Daily at 02:00 AM',
      lastRun: 'Today at 02:00 AM',
      nextRun: 'Tomorrow at 02:00 AM',
      successRate: 100,
      totalRuns: 847,
    },
    {
      id: '2',
      name: 'System Maintenance',
      description: 'Regular system cleanup, updates, and optimization',
      steps: [
        { id: 's6', name: 'Update packages', type: 'command', config: { cmd: 'apt-get update && apt-get upgrade' }, status: 'completed' },
        { id: 's7', name: 'Clean cache', type: 'command', config: { cmd: 'rm -rf /var/cache/*' }, status: 'completed' },
        { id: 's8', name: 'Optimize database', type: 'script', config: { script: 'optimize-db.py' }, status: 'pending' },
      ],
      isActive: true,
      schedule: 'Weekly on Sundays at 11:30 PM',
      lastRun: 'Sunday at 11:30 PM',
      nextRun: 'Next Sunday at 11:30 PM',
      successRate: 95,
      totalRuns: 156,
    },
    {
      id: '3',
      name: 'Email Cleanup',
      description: 'Automated email archiving and spam filtering',
      steps: [
        { id: 's9', name: 'Scan emails', type: 'command', config: {} , status: 'pending' },
        { id: 's10', name: 'Filter spam', type: 'command', config: {} , status: 'pending' },
        { id: 's11', name: 'Archive old emails', type: 'command', config: {} , status: 'pending' },
      ],
      isActive: false,
      schedule: 'Monthly on 1st day at 3:00 AM',
      lastRun: 'June 1 at 3:00 AM',
      nextRun: 'July 1 at 3:00 AM',
      successRate: 98,
      totalRuns: 24,
    },
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'command':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300';
      case 'condition':
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300';
      case 'wait':
        return 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-300';
      case 'notification':
        return 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-300';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300';
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

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const createWorkflow = () => {
    if (!newWorkflowName.trim()) return;

    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: newWorkflowName,
      description: newWorkflowDesc,
      steps: [],
      isActive: false,
      schedule: 'Not scheduled',
      lastRun: 'Never',
      nextRun: 'Not scheduled',
      successRate: 0,
      totalRuns: 0,
    };

    setWorkflows((prev) => [newWorkflow, ...prev]);
    setNewWorkflowName('');
    setNewWorkflowDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Workflow Manager</h2>
          <p className="text-slate-400">Design, schedule, and automate complex tasks</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={18} />
          New Workflow
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workflows', value: workflows.length, color: 'from-blue-500/20 to-blue-600/20' },
          { label: 'Active', value: workflows.filter((w) => w.isActive).length, color: 'from-emerald-500/20 to-emerald-600/20' },
          { label: 'Avg Success Rate', value: workflows.length > 0 ? Math.round(workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / workflows.length) + '%' : '0%', color: 'from-purple-500/20 to-purple-600/20' },
          { label: 'Total Executions', value: workflows.reduce((sum, w) => sum + (w.totalRuns || 0), 0), color: 'from-amber-500/20 to-amber-600/20' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            className={`rounded-lg border border-white/10 bg-gradient-to-br ${stat.color} p-4`}
            whileHover={{ y: -2 }}
          >
            <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
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
                    <WorkflowIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                    <p className="text-sm text-slate-400">{workflow.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  workflow.isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                }`}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </span>

                <div className="flex gap-2">
                  <motion.button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    title={workflow.isActive ? 'Pause' : 'Resume'}
                  >
                    {workflow.isActive ? (
                      <Pause size={18} className="text-amber-400" />
                    ) : (
                      <Play size={18} className="text-emerald-400" />
                    )}
                  </motion.button>
                  <motion.button className="p-2 rounded-lg hover:bg-white/10 transition-colors" whileHover={{ scale: 1.1 }}>
                    <Edit2 size={18} className="text-slate-400" />
                  </motion.button>
                  <motion.button className="p-2 rounded-lg hover:bg-white/10 transition-colors" whileHover={{ scale: 1.1 }}>
                    <Download size={18} className="text-slate-400" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              {[
                { label: 'Schedule', value: workflow.schedule || 'Not scheduled' },
                { label: 'Last Run', value: workflow.lastRun || 'Never' },
                { label: 'Next Run', value: workflow.nextRun || 'Not scheduled' },
                { label: 'Success Rate', value: `${workflow.successRate || 0}%` },
              ].map((metric, idx) => (
                <div key={idx}>
                  <p className="text-xs text-slate-400 mb-0.5">{metric.label}</p>
                  <p className="text-sm font-medium text-white truncate">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div
              className="space-y-0 cursor-pointer"
              onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Workflow size={14} />
                  Steps ({workflow.steps.length})
                </p>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    selectedWorkflow === workflow.id ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Steps List */}
              <AnimatePresence>
                {selectedWorkflow === workflow.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 mt-4 border-t border-white/10 pt-4"
                  >
                    {workflow.steps.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">No steps added yet</p>
                    ) : (
                      workflow.steps.map((step, idx) => (
                        <div key={step.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border bg-gradient-to-br ${getStepTypeColor(step.type)} mb-2`}>
                              {getStatusIcon(step.status)}
                            </div>
                            {idx < workflow.steps.length - 1 && (
                              <div className="w-0.5 h-8 bg-gradient-to-b from-slate-500 to-transparent"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <motion.div className={`p-3 rounded-lg border bg-gradient-to-br ${getStepTypeColor(step.type)}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium text-sm">{step.name}</p>
                                  <p className="text-xs mt-1 opacity-75 capitalize">{step.type}</p>
                                  {step.config && Object.keys(step.config).length > 0 && (
                                    <p className="text-xs mt-1 font-mono opacity-50">
                                      {JSON.stringify(step.config).substring(0, 50)}...
                                    </p>
                                  )}
                                </div>
                                <motion.button
                                  className="p-1 hover:bg-white/10 rounded opacity-50 hover:opacity-100 transition-opacity"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Workflow Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
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
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
                <textarea
                  placeholder="Description"
                  value={newWorkflowDesc}
                  onChange={(e) => setNewWorkflowDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all resize-none h-24"
                />
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={createWorkflow}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={!newWorkflowName.trim()}
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

export default AdvancedWorkflowBuilder;
