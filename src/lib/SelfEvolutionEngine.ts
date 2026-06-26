import { CognitiveEvolutionEngine } from "./CognitiveEvolutionEngine";

export class SelfEvolutionEngine {
  static probeAndReport(stats: {
    latencyHistory: Array<{ time: string; latency: number; health: number }>;
    completedTasksCount: number;
    totalTasksCount: number;
    memoriesCount: number;
    activeTab: string;
  }) {
    const avgLatency = stats.latencyHistory.length > 0 
      ? Math.round(stats.latencyHistory.reduce((acc, curr) => acc + curr.latency, 0) / stats.latencyHistory.length)
      : 12;
    
    const taskRatio = stats.totalTasksCount > 0 
      ? (stats.completedTasksCount / stats.totalTasksCount) * 100 
      : 100;

    // Perform simulated telemetry probing
    const suggestions: string[] = [];
    const logs: string[] = [];

    logs.push(`🔍 [SelfEvolutionEngine] Auditing system health: Average Latency is ${avgLatency}ms, Task completion rate is ${taskRatio.toFixed(1)}%.`);

    if (avgLatency > 25) {
      suggestions.push("Adjust web audio context pool to reduce processing latency.");
      logs.push(`⚠️ [Auditor] Higher latency detected: ${avgLatency}ms. Recommending web audio context buffer optimize.`);
    }

    if (stats.memoriesCount > 8) {
      suggestions.push("Structure memories graph with node-affinity prioritization.");
      logs.push(`💡 [Auditor] Dense memory logs: ${stats.memoriesCount} keys active. Suggesting relational hierarchy optimization.`);
    }

    if (stats.activeTab === "home") {
      suggestions.push("Prioritize OS Command Center and OS Quick Launch to top positions.");
      logs.push(`📈 [Auditor] Home tab is highly active. Recommended: Adaptive Dashboard reordering.`);
    }

    // Trigger Neora System Event
    const ts = new Date().toTimeString().split(' ')[0];
    const event = new CustomEvent("neora-system-event", {
      detail: {
        id: "evt-see-" + Math.floor(Math.random() * 10000),
        timestamp: ts,
        category: "self_evolution",
        level: suggestions.length > 1 ? "WARNING" : "SUCCESS",
        message: `SelfEvolutionEngine: Completed system health audit and telemetry scan.`,
        details: JSON.stringify({
          average_ping_ms: avgLatency,
          task_completion_pct: taskRatio,
          total_memories: stats.memoriesCount,
          active_tab: stats.activeTab,
          probed_anomalies: suggestions,
          engine_logs: logs,
          optimizations_queued: [
            "Enable intelligent lowpass audio EQ",
            "Promote command_center to first in PredictiveLayout"
          ]
        }, null, 2),
        latency: "5.2ms"
      }
    });
    window.dispatchEvent(event);

    return {
      success: true,
      suggestions,
      logs
    };
  }
}
