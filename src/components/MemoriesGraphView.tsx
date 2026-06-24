import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Memory, Task } from '../types';
import { Brain, Sparkles, AlertCircle, Info, Database, Eye, Share2, ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';

interface MemoriesGraphViewProps {
  lang: 'en' | 'bn';
  memories: Memory[];
  tasks?: Task[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  category: string;
  importance: number;
  isHub?: boolean;
  detail?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string;
  target: string;
}

export function MemoriesGraphView({ lang, memories, tasks = [] }: MemoriesGraphViewProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

  // Update canvas sizing on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(300, width),
          height: Math.max(300, height - 20)
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Filter memories if necessary
  const filteredMemories = filterCategory === 'all' || filterCategory === 'tasks' 
    ? memories 
    : memories.filter(m => m.category === filterCategory);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous runs
    d3.select(svgRef.current).selectAll("*").remove();

    const { width, height } = dimensions;

    // 1. Build Nodes
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // System Core Node
    nodes.push({
      id: "core",
      label: "NEORA BRAIN CORE",
      category: "core",
      importance: 5,
      isHub: true,
      detail: lang === 'bn' 
        ? "নিওরা সিস্টেম ডেটাবেস কোর লিঙ্ক হাব" 
        : "Central cognitive engine aggregating active memory vectors."
    });

    // Add Category Hub Nodes
    const activeCategories = ['personal', 'work', 'preference', 'skill'];
    activeCategories.forEach(cat => {
      nodes.push({
        id: `hub-${cat}`,
        label: cat.toUpperCase() + " HUB",
        category: cat,
        importance: 4,
        isHub: true,
        detail: lang === 'bn'
          ? `ক্যাটাগরিঃ ${cat}`
          : `Aggregation focal point for "${cat}" parameters.`
      });

      // Link category hub to the system core
      links.push({
        source: `hub-${cat}`,
        target: "core"
      });
    });

    // Add Memory Nodes
    filteredMemories.forEach(mem => {
      nodes.push({
        id: mem.id,
        label: mem.key,
        category: mem.category,
        importance: mem.importance || 2,
        isHub: false,
        detail: mem.value
      });

      // Link memory node to its category hub
      links.push({
        source: mem.id,
        target: `hub-${mem.category}`
      });
    });

    // Add Tasks & Dependencies Nodes
    const showTasks = filterCategory === 'all' || filterCategory === 'tasks';
    if (showTasks && tasks && tasks.length > 0) {
      nodes.push({
        id: "hub-tasks",
        label: "TASKS HUB",
        category: "tasks",
        importance: 4,
        isHub: true,
        detail: lang === 'bn' 
          ? "সিস্টেমের সকল চলমান ও সম্পন্ন কাজের হাব" 
          : "Central hub tracking active, pending and completed tasks."
      });

      links.push({
        source: "hub-tasks",
        target: "core"
      });

      tasks.forEach(task => {
        const taskIdStr = `task-${task.id}`;
        nodes.push({
          id: taskIdStr,
          label: task.title,
          category: "tasks",
          importance: task.priority === 'critical' ? 4 : task.priority === 'high' ? 3 : 2,
          isHub: false,
          detail: `[Priority: ${task.priority.toUpperCase()}] ${task.title}. Status: ${task.completed ? 'COMPLETED' : 'PENDING'}`
        });

        links.push({
          source: taskIdStr,
          target: "hub-tasks"
        });

        // Dynamic cognitive dependency linking memories & tasks via fuzzy keyword match
        filteredMemories.forEach(mem => {
          const mKey = mem.key.toLowerCase();
          const tTitle = task.title.toLowerCase();
          if (tTitle.includes(mKey) || mKey.includes(tTitle) || (mKey.length > 3 && tTitle.includes(mKey.substring(0, 4)))) {
            links.push({
              source: taskIdStr,
              target: mem.id
            });
          }
        });
      });
    }

    // 2. Setup D3 Objects
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create marker pointers for links
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 18)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "rgba(0, 212, 255, 0.4)");

    const mainGroup = svg.append("g").attr("class", "graph-content");

    // Add Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    // Initial positioning simulation forces
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, any>(links)
        .id(d => d.id)
        .distance(d => {
          if (d.source.id === "core" || d.target.id === "core") return 110;
          return 75;
        })
      )
      .force("charge", d3.forceManyBody<GraphNode>().strength((d) => d.isHub ? -350 : -140))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<GraphNode>().radius(d => d.isHub ? 45 : 30))
      .force("x", d3.forceX(width / 2).strength(0.08))
      .force("y", d3.forceY(height / 2).strength(0.08));

    // Dynamic Connection lines
    const linkElements = mainGroup.append("g")
      .attr("class", "links")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", (d) => {
        if (d.source === "core" || d.target === "core") return "rgba(0, 212, 255, 0.35)";
        return "rgba(100, 116, 139, 0.25)";
      })
      .attr("stroke-width", (d) => {
        if (d.source === "core" || d.target === "core") return 1.8;
        return 1.1;
      })
      .attr("stroke-dasharray", (d) => {
        if (d.source === "core" || d.target === "core") return "none";
        return "2,2";
      })
      .attr("marker-end", "url(#arrow)");

    // Define colors
    const colors: Record<string, string> = {
      core: "#00d4ff",
      personal: "#10b981",    // Green
      work: "#eab308",        // Yellow
      preference: "#06b6d4",  // Cyan
      skill: "#ec4899",       // Pink
      tasks: "#f97316",       // Orange for Tasks
    };

    const glowFilters: Record<string, string> = {
      core: "drop-shadow(0 0 10px rgba(0,212,255,0.7))",
      personal: "drop-shadow(0 0 8px rgba(16,185,129,0.5))",
      work: "drop-shadow(0 0 8px rgba(234,179,8,0.5))",
      preference: "drop-shadow(0 0 8px rgba(6,182,212,0.5))",
      skill: "drop-shadow(0 0 8px rgba(236,72,153,0.5))",
      tasks: "drop-shadow(0 0 8px rgba(249,115,22,0.6))",
    };

    // HTML dragging logic
    const drag = (sim: d3.Simulation<GraphNode, undefined>) => {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      return d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    };

    // Render node groups
    const nodeElements = mainGroup.append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node-item")
      .style("cursor", "grab")
      .call(drag(simulation) as any);

    // Node circles representation
    nodeElements.append("circle")
      .attr("r", (d) => {
        if (d.id === "core") return 24;
        if (d.isHub) return 16;
        return 9 + (d.importance || 1) * 1.5;
      })
      .attr("fill", (d) => colors[d.category] || "#64748b")
      .attr("stroke", (d) => d.isHub ? "#ffffff" : "rgba(255,255,255,0.15)")
      .attr("stroke-width", (d) => d.isHub ? 1.5 : 1)
      .style("filter", (d) => glowFilters[d.category] || "none");

    // Dynamic ripples on hubs
    nodeElements.filter(d => !!d.isHub).append("circle")
      .attr("r", (d) => d.id === "core" ? 32 : 22)
      .attr("fill", "transparent")
      .attr("stroke", d => colors[d.category] || "#64748b")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.4)
      .style("animation", "ping 4s cubic-bezier(0, 0, 0.2, 1) infinite");

    // Inside-Text for Hub Symbols
    nodeElements.filter(d => !!d.isHub).append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", d => d.id === 'core' ? "10px" : "8px")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .attr("fill", "#000a18")
      .text(d => d.id === "core" ? "🧠" : "⚙️");

    // Label descriptions
    nodeElements.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.isHub ? (d.id === "core" ? 42 : 30) : 20)
      .attr("fill", "#e2e8f0")
      .attr("font-size", (d) => d.isHub ? "9.5px" : "8.5px")
      .attr("font-family", "monospace")
      .attr("font-weight", (d) => d.isHub ? "bold" : "normal")
      .style("text-shadow", "0 1px 3px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)")
      .text(d => d.label);

    // Event binders for hovering and selections
    nodeElements.on("click", (event, d) => {
      setSelectedNode(d);
      nodeElements.selectAll("circle").attr("stroke", (n: any) => n.id === d.id ? "#00ff88" : "rgba(255,255,255,0.15)");
    });

    // Update coordinates ticks
    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeElements
        .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);
    });

    // Reset zoom shortcut function
    window.addEventListener("resize", () => {
      simulation.alpha(0.3).restart();
    });

    return () => {
      simulation.stop();
    };
  }, [dimensions, filteredMemories, lang]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#00050d] relative font-sans">
      
      {/* LEFT SIDEBAR: Controls & Stats */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950/80 backdrop-blur-xl p-5 flex flex-col gap-4 select-none animate-fade-in shrink-0">
        
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-900">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
            <Share2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-jarvis text-xs font-bold text-white tracking-widest uppercase">Neural Vector Graph</h3>
            <p className="text-[10px] text-slate-500 font-mono">Cognitive Memory Grid</p>
          </div>
        </div>

        {/* Categories filters */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <Filter className="w-3 h-3" /> Select Memory Context:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { id: 'all', label: lang === 'bn' ? 'সব মেমরি' : 'ALL', color: '#38bdf8' },
              { id: 'tasks', label: lang === 'bn' ? 'টাস্ক ডিপেন্ডেন্সি' : 'TASKS & DEP', color: '#f97316' },
              { id: 'personal', label: lang === 'bn' ? 'ব্যক্তিগত' : 'PERSONAL', color: '#10b981' },
              { id: 'work', label: lang === 'bn' ? 'কর্মক্ষেত্র' : 'WORK', color: '#eab308' },
              { id: 'preference', label: lang === 'bn' ? 'পছন্দ' : 'PREFERENCE', color: '#06b6d4' },
              { id: 'skill', label: lang === 'bn' ? 'দক্ষতা' : 'SKILL', color: '#ec4899' },
            ]).map((cat) => {
              const active = filterCategory === cat.id;
              const count = cat.id === 'all' 
                ? memories.length 
                : cat.id === 'tasks'
                  ? tasks.length
                  : memories.filter(m => m.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono flex justify-between items-center transition cursor-pointer ${
                    active 
                      ? 'bg-slate-900 border-slate-700 text-white font-bold' 
                      : 'bg-transparent border-slate-950 text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                  style={active ? { boxShadow: `0 0 10px ${cat.color}15`, borderColor: `${cat.color}40`, color: cat.color } : {}}
                >
                  <span className="truncate">{cat.label}</span>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                    active ? 'bg-slate-800 text-white' : 'bg-slate-950/80 text-slate-500'
                  }`} style={active ? { color: cat.color } : {}}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Technical Data Status HUD */}
        <div className="rounded-xl border border-slate-900 bg-[#000a18] p-3 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-900/60 pb-1.5">
            <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-cyan-400" /> Vector Database:</span>
            <span className="text-emerald-400 font-bold font-mono">Sync Block</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500">
            <div>
              <span className="block text-slate-600">Total Nodes:</span>
              <span className="font-bold text-slate-300">
                {filteredMemories.length + 5 + ((filterCategory === 'all' || filterCategory === 'tasks') ? (tasks.length + 1) : 0)}
              </span>
            </div>
            <div>
              <span className="block text-slate-600">Cluster Links:</span>
              <span className="font-bold text-slate-300">
                {filteredMemories.length + 4 + ((filterCategory === 'all' || filterCategory === 'tasks') ? (tasks.length + 1) : 0)}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1.5">
            {lang === 'bn'
              ? "এই গ্রাফিক্যাল ওভারভিউটি আপনার লোকাল ক্যাশে মেমরি নোড সমূহের পারস্পরিক সম্পর্ক এবং শ্রেণীবিন্যাস প্রদর্শন করছে।"
              : "Physics-directed vector arrangement displays how Neora clusters and references your real-time memories dynamically."}
          </div>
        </div>

        {/* Selected Hub / Memory detail description card */}
        {selectedNode ? (
          <div className="rounded-xl border border-dashed border-cyan-500/20 bg-cyan-950/10 p-4 space-y-2 relative overflow-hidden animate-fade-in-quick mt-auto">
            <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl bg-cyan-900/50 text-cyan-400 font-mono text-[8.5px] uppercase tracking-wider">
              {selectedNode.category}
            </div>
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-mono text-xs max-w-[80%] truncate">
              <Eye className="w-3.5 h-3.5" /> {selectedNode.label}
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed break-words max-h-36 overflow-y-auto pr-1">
              {selectedNode.detail || '"No details updated"'}
            </p>
            {selectedNode.importance !== undefined && (
              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Importance Matrix:</span>
                <span className="text-amber-500 flex font-bold">{Array.from({ length: selectedNode.importance }).map(() => '★')}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-900 bg-slate-950/40 p-4 flex flex-col items-center justify-center text-center mt-auto py-10 select-none">
            <Info className="w-5 h-5 text-slate-600 mb-2" />
            <p className="text-[10px] text-slate-500 leading-normal font-sans">
              {lang === 'bn'
                ? "যেকোনো মেমরি নোডে ডাবল ট্যাপ বা ক্লিক করে সম্পূর্ণ টেক্সট এবং কানেকশন ম্যাট্রিক্স রিড করুন।"
                : "Interact, drag or click any node inside the physics simulator canvas to analyze database metadata."}
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Interactive D3 Graph viewport */}
      <div 
        ref={containerRef}
        className="flex-1 h-full min-h-0 bg-[#00050d] relative flex items-center justify-center select-none"
      >
        <svg 
          ref={svgRef} 
          className="w-full h-full"
          style={{ backgroundImage: 'radial-gradient(rgba(0,212,255,0.02) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
        />

        {/* Small floating HUD helper in the top layout corner */}
        <div className="absolute top-4 right-4 rounded-lg bg-slate-950/80 px-2.5 py-1.5 border border-slate-900 flex items-center gap-2 text-[9px] font-mono text-cyan-400">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>REAL-TIME SIMULATION ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
