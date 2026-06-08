/**
 * System Metrics Dashboard Component
 * Real-time visualization of system performance and resource usage
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Zap, HardDrive, Cpu } from 'lucide-react';

interface MetricsData {
  cpu: number;
  memory: number;
  disk: number;
  timestamp: string;
}

interface MetricEntry {
  time: string;
  value: number;
}

interface SystemMetricsDashboardProps {
  refreshInterval?: number;
  apiUrl?: string;
}

export const SystemMetricsDashboard: React.FC<SystemMetricsDashboardProps> = ({
  refreshInterval = 2000,
  apiUrl = '/api/system',
}) => {
  const [currentMetrics, setCurrentMetrics] = useState<MetricsData>({
    cpu: 35,
    memory: 62,
    disk: 48,
    timestamp: new Date().toISOString(),
  });

  const [historicalData, setHistoricalData] = useState<MetricEntry[]>([
    { time: '00:00', value: 30 },
    { time: '05:00', value: 35 },
    { time: '10:00', value: 42 },
    { time: '15:00', value: 38 },
    { time: '20:00', value: 45 },
    { time: '25:00', value: 40 },
  ]);

  // Fetch system metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${apiUrl}/metrics`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCurrentMetrics(data.data);

            // Add to historical data
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            setHistoricalData(prev => [
              ...prev.slice(-5),
              { time: timeStr, value: Math.round((data.data.cpu + data.data.memory) / 2) },
            ]);
          }
        }
      } catch (error) {
        console.error('[Dashboard] Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, apiUrl]);

  const getMetricColor = (value: number): string => {
    if (value < 50) return '#00ff88';
    if (value < 75) return '#ffaa00';
    return '#ff0066';
  };

  const renderMetricCard = (
    icon: React.ReactNode,
    label: string,
    value: number,
    unit: string
  ) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex-1 p-4 backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-cyan-400">{icon}</div>
        <span className="text-xs font-mono text-slate-400 uppercase">
          {label}
        </span>
      </div>

      <div className="mb-3">
        <div className="text-3xl font-bold text-white font-mono">
          {value}
          <span className="text-lg ml-1 text-slate-400">{unit}</span>
        </div>
      </div>

      {/* Metric bar */}
      <motion.div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            backgroundColor: getMetricColor(value),
            boxShadow: `0 0 10px ${getMetricColor(value)}`,
          }}
        />
      </motion.div>

      {/* Status text */}
      <motion.div className="mt-2 text-xs font-mono">
        {value < 50 && <span className="text-green-400">✓ Optimal</span>}
        {value >= 50 && value < 75 && <span className="text-yellow-400">⚠ Moderate</span>}
        {value >= 75 && <span className="text-red-400">✗ Critical</span>}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white font-mono">System Metrics</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time performance monitoring</p>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-cyan-400"
        >
          <Activity size={24} />
        </motion.div>
      </motion.div>

      {/* Metric Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {renderMetricCard(
          <Cpu size={20} />,
          'CPU Usage',
          currentMetrics.cpu,
          '%'
        )}
        {renderMetricCard(
          <Zap size={20} />,
          'Memory Usage',
          currentMetrics.memory,
          '%'
        )}
        {renderMetricCard(
          <HardDrive size={20} />,
          'Disk Usage',
          currentMetrics.disk,
          '%'
        )}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Historical trend */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="p-4 backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg"
        >
          <h3 className="text-sm font-mono text-cyan-400 uppercase mb-4">CPU Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historicalData}>
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00d9ff"
                dot={{ fill: '#00ff88', r: 4 }}
                strokeWidth={2}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resource distribution */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="p-4 backdrop-blur-md bg-slate-900/40 border border-cyan-500/20 rounded-lg"
        >
          <h3 className="text-sm font-mono text-cyan-400 uppercase mb-4">Resource Usage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: 'CPU', value: currentMetrics.cpu },
                { name: 'Memory', value: currentMetrics.memory },
                { name: 'Disk', value: currentMetrics.disk },
              ]}
            >
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Bar dataKey="value" fill="#00d9ff" radius={[8, 8, 0, 0]}>
                {[currentMetrics.cpu, currentMetrics.memory, currentMetrics.disk].map((value, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={getMetricColor(value)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Footer info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs font-mono text-slate-500 flex items-center justify-between"
      >
        <span>Last updated: {new Date(currentMetrics.timestamp).toLocaleTimeString()}</span>
        <span>Update interval: {refreshInterval / 1000}s</span>
      </motion.div>
    </div>
  );
};

export default SystemMetricsDashboard;
