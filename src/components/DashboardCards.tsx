import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Zap, HardDrive, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  trend?: number;
  status: 'good' | 'warning' | 'critical';
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  status,
  color,
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'good':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-600/20 to-blue-600/5';
      case 'green':
        return 'from-emerald-600/20 to-emerald-600/5';
      case 'yellow':
        return 'from-amber-600/20 to-amber-600/5';
      case 'red':
        return 'from-red-600/20 to-red-600/5';
      case 'purple':
        return 'from-purple-600/20 to-purple-600/5';
      default:
        return 'from-slate-600/20 to-slate-600/5';
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${getColorClass()} p-6 backdrop-blur-sm hover:border-white/20 transition-all`}
      whileHover={{ y: -4 }}
    >
      {/* Background gradient accent */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-white/5 border border-white/10 ${getStatusColors()} border-opacity-50`}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-slate-300 text-sm font-medium mb-1">{title}</h3>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-white">{value}</span>
          <span className="text-sm text-slate-400">{unit}</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className={`w-2 h-2 rounded-full ${status === 'good' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
          {status === 'good' ? 'Optimal' : status === 'warning' ? 'Monitor' : 'Action Required'}
        </div>
      </div>
    </motion.div>
  );
};

interface DashboardCardsProps {
  metrics?: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ metrics }) => {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 35,
    memory: 62,
    disk: 48,
    network: 24,
  });

  const [cpuHistory, setCpuHistory] = useState([
    { time: '1m', value: 28 },
    { time: '2m', value: 32 },
    { time: '3m', value: 38 },
    { time: '4m', value: 35 },
    { time: '5m', value: 40 },
  ]);

  const [resourceData, setResourceData] = useState([
    { name: 'CPU', value: 35, fill: '#3b82f6' },
    { name: 'Memory', value: 62, fill: '#8b5cf6' },
    { name: 'Disk', value: 48, fill: '#06b6d4' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics((prev) => ({
        cpu: Math.max(20, Math.min(80, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(40, Math.min(85, prev.memory + (Math.random() - 0.5) * 5)),
        disk: prev.disk,
        network: Math.max(5, Math.min(50, prev.network + (Math.random() - 0.5) * 8)),
      }));

      setCpuHistory((prev) => [
        ...prev.slice(1),
        { time: `${Date.now()}`, value: Math.random() * 60 + 20 },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">System Dashboard</h2>
        <p className="text-slate-400">Real-time monitoring and performance metrics</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={Math.round(systemMetrics.cpu)}
          unit="%"
          icon={<Zap size={20} />}
          trend={2}
          status={systemMetrics.cpu > 70 ? 'critical' : systemMetrics.cpu > 50 ? 'warning' : 'good'}
          color="blue"
        />
        <MetricCard
          title="Memory Usage"
          value={Math.round(systemMetrics.memory)}
          unit="%"
          icon={<Activity size={20} />}
          trend={-1}
          status={systemMetrics.memory > 80 ? 'critical' : systemMetrics.memory > 70 ? 'warning' : 'good'}
          color="purple"
        />
        <MetricCard
          title="Disk Usage"
          value={Math.round(systemMetrics.disk)}
          unit="%"
          icon={<HardDrive size={20} />}
          trend={0}
          status="good"
          color="green"
        />
        <MetricCard
          title="Network"
          value={Math.round(systemMetrics.network)}
          unit="Mbps"
          icon={<AlertTriangle size={20} />}
          trend={3}
          status="good"
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Trend Chart */}
        <motion.div
          className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm hover:border-white/20 transition-all"
          whileHover={{ y: -4 }}
        >
          <h3 className="text-white font-semibold mb-4">CPU Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cpuHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis stroke="rgba(255,255,255,0.2)" />
              <YAxis stroke="rgba(255,255,255,0.2)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resource Distribution */}
        <motion.div
          className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm hover:border-white/20 transition-all"
          whileHover={{ y: -4 }}
        >
          <h3 className="text-white font-semibold mb-4">Resource Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis stroke="rgba(255,255,255,0.2)" />
              <YAxis stroke="rgba(255,255,255,0.2)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* System Information */}
      <motion.div
        className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm"
        whileHover={{ y: -4 }}
      >
        <h3 className="text-white font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Uptime', value: '24d 14h 32m' },
            { label: 'Processes', value: '847' },
            { label: 'Threads', value: '3,284' },
            { label: 'Temperature', value: '52°C' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">{item.label}</p>
              <p className="text-lg font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardCards;
