import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  Cpu,
  UploadCloud,
  Layers,
  FileText,
  Activity,
  Terminal,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Settings,
  Grid,
  Type,
  Palette,
  Sparkles,
  Compass,
  ArrowRight,
  TrendingUp,
  GitCompare,
  Trash2,
  ListOrdered,
  ScanLine,
  Edit,
  Layout
} from "lucide-react";

export const VisualIntelligenceDashboard: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"orchestrator" | "perception" | "ocr" | "queue" | "metrics" | "comparator" | "tests">("perception");

  // Phase 2.1.4: OCR, Script Intelligence, Typography & Calligraphy States
  const [ocrAdapters, setOcrAdapters] = useState<any[]>([]);
  const [ocrTelemetry, setOcrTelemetry] = useState<any[]>([]);
  const [ocrSelectedPreset, setOcrSelectedPreset] = useState<string>("traditional_alpona");
  const [ocrIsReference, setOcrIsReference] = useState<boolean>(false);
  const [isOcrAnalyzing, setIsOcrAnalyzing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrReport, setOcrReport] = useState<any | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Correction Pipeline States
  const [activeCorrectionRegionId, setActiveCorrectionRegionId] = useState<string>("");
  const [activeCorrectionText, setActiveCorrectionText] = useState<string>("");
  const [dictionaryLogs, setDictionaryLogs] = useState<Array<{ original: string, corrected: string, timestamp: string }>>([]);

  // Typography Comparison States
  const [comparisonOutput, setComparisonOutput] = useState<any | null>(null);
  const [isComparingTypography, setIsComparingTypography] = useState<boolean>(false);

  // Perception Pipeline States (Phase 2.1.3)
  const [perceptionAdapters, setPerceptionAdapters] = useState<any[]>([]);
  const [perceptionMetrics, setPerceptionMetrics] = useState<any | null>(null);
  const [perceptionTelemetry, setPerceptionTelemetry] = useState<any[]>([]);
  const [perceptionSelectedPreset, setPerceptionSelectedPreset] = useState<string>("traditional_alpona");
  const [perceptionIsReference, setPerceptionIsReference] = useState<boolean>(false);
  const [isPerceptionAnalyzing, setIsPerceptionAnalyzing] = useState<boolean>(false);
  const [perceptionProgress, setPerceptionProgress] = useState<number>(0);
  const [perceptionReport, setPerceptionReport] = useState<any | null>(null);
  const [perceptionError, setPerceptionError] = useState<string | null>(null);

  // Orchestrator States
  const [selectedFilePreset, setSelectedFilePreset] = useState<string>("traditional_alpona");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Queue States
  const [jobs, setJobs] = useState<any[]>([]);
  const [queueLength, setQueueLength] = useState<number>(0);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Metrics States
  const [metrics, setMetrics] = useState<any | null>(null);

  // Comparator States
  const [compareJobA, setCompareJobA] = useState<string>("");
  const [compareJobB, setCompareJobB] = useState<string>("");
  const [compareDiff, setCompareDiff] = useState<any | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Test Runner States
  const [testsRunning, setTestsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testSummary, setTestSummary] = useState<any | null>(null);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset assets for easy interactive simulation
  const PRESET_DESIGNS = [
    {
      id: "traditional_alpona",
      name: "Traditional Bengali Alpona Border (Vector SVG)",
      desc: "Pohela Boishakh festive floral guidelines with crimson & gold accents.",
      ext: "svg",
      type: "calligraphy_art",
      mockData: "PD9zdmcgd2lkdGg9IjEwODAiIGhlaWdodD0iMTA4MCI+PGFscG9uYSBzdHlsZT0idHJhZGl0aW9uYWwiLz48L3N2Zz4=" // mini SVG base64
    },
    {
      id: "islamic_calligraphy",
      name: "Imperial Arabic Calligraphy (Vector SVG)",
      desc: "Royal gold background with complex cursive Arabic text mapping. (RTL direction)",
      ext: "svg",
      type: "calligraphy_art",
      mockData: "PD9zdmcgd2lkdGg9IjE5MjAiIGhlaWdodD0iMTA4MCI+PGNhbGxpZ3JhcGh5IGxhbmc9ImFyIi8+PC9zdmc+"
    },
    {
      id: "corporate_banner",
      name: "Neora Sovereign Corporate Banner (Raster WebP)",
      desc: "Clean landscape layout featuring structured tech specifications and monospace fonts.",
      ext: "webp",
      type: "banner",
      mockData: "UklGRkiOAgA_VlA4WAoAAAAQAAAAPwAAPwAAnQAAZWJwCgA="
    }
  ];

  // Load metrics & jobs initially
  useEffect(() => {
    fetchMetrics();
    fetchJobs();
    fetchPerceptionData();
    fetchOcrData();

    // Auto poll telemetry and adapter updates
    const timer = setInterval(() => {
      fetchPerceptionData();
      fetchOcrData();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const fetchOcrData = async () => {
    try {
      const res = await fetch("/api/vision/ocr/adapters");
      const data = await res.json();
      if (data.success) {
        setOcrAdapters(data.adapters || []);
      }
    } catch (err) {
      console.error("Failed to load OCR adapters", err);
    }

    try {
      const res = await fetch("/api/vision/ocr/telemetry");
      const data = await res.json();
      if (data.success) {
        setOcrTelemetry(data.telemetry || []);
      }
    } catch (err) {
      console.error("Failed to load OCR telemetry", err);
    }
  };

  const handleToggleOcrAdapter = async (id: string, currentHealth: "healthy" | "offline") => {
    try {
      const targetHealth = currentHealth === "healthy" ? "offline" : "healthy";
      const res = await fetch("/api/vision/ocr/adapters/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: targetHealth })
      });
      const data = await res.json();
      if (data.success) {
        fetchOcrData();
      }
    } catch (err) {
      console.error("Failed to toggle OCR adapter", err);
    }
  };

  const handleStartOcr = async () => {
    setIsOcrAnalyzing(true);
    setOcrProgress(10);
    setOcrReport(null);
    setOcrError(null);
    setComparisonOutput(null);

    const preset = PRESET_DESIGNS.find(d => d.id === ocrSelectedPreset);
    if (!preset) {
      setIsOcrAnalyzing(false);
      return;
    }

    try {
      const interval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev >= 95) return 95;
          return prev + 15;
        });
      }, 250);

      const res = await fetch("/api/vision/ocr/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data: preset.mockData,
          fileName: `${preset.id}.${preset.ext}`,
          isReference: ocrIsReference
        })
      });

      const data = await res.json();
      clearInterval(interval);
      setOcrProgress(100);

      if (data.success) {
        setOcrReport(data.report);
      } else {
        setOcrError(data.error || "OCR workflow failed");
      }
    } catch (err: any) {
      setOcrError(err.message || "OCR run failed");
    } finally {
      setIsOcrAnalyzing(false);
      fetchOcrData();
    }
  };

  const handleApplyOcrCorrection = async () => {
    if (!ocrReport || !activeCorrectionRegionId || !activeCorrectionText.trim()) return;

    try {
      const region = ocrReport.regions.find((r: any) => r.id === activeCorrectionRegionId);
      if (!region) return;

      const original = region.text;
      const res = await fetch("/api/vision/ocr/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: ocrReport.id,
          customCorrections: [{ originalText: original, correctedText: activeCorrectionText }]
        })
      });

      const data = await res.json();
      if (data.success) {
        setOcrReport(data.report);
        setDictionaryLogs(prev => [
          ...prev,
          { original, corrected: activeCorrectionText, timestamp: new Date().toLocaleTimeString() }
        ]);
        setActiveCorrectionRegionId("");
        setActiveCorrectionText("");
      }
    } catch (err) {
      console.error("Failed to apply OCR correction", err);
    }
  };

  const handleTriggerTypographyComparison = async () => {
    if (!ocrReport) return;
    setIsComparingTypography(true);

    try {
      // Compare the current OCR report with a hypothetical reference spread typography summary
      const dummyReferenceSummary = {
        dominantClass: "Serif",
        familiesDetected: ["Playfair Display"],
        attributes: {
          fontClass: "Serif",
          estimatedFontFamily: "Playfair Display",
          weight: "normal",
          width: "normal",
          alignment: "center",
          leadingRatio: 1.6,
          trackingRatio: 0.12,
          readabilityScore: 90,
          alternativeFonts: ["Georgia"]
        }
      };

      const res = await fetch("/api/vision/ocr/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportA: ocrReport.typographySummary,
          reportB: dummyReferenceSummary
        })
      });

      const data = await res.json();
      if (data.success) {
        setComparisonOutput(data.comparison);
      }
    } catch (err) {
      console.error("Failed to compare typography", err);
    } finally {
      setIsComparingTypography(false);
    }
  };

  const fetchPerceptionData = async () => {
    try {
      const res = await fetch("/api/vision/perception/adapters");
      const data = await res.json();
      if (data.success) {
        setPerceptionAdapters(data.adapters || []);
        setPerceptionMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Failed to load perception adapters", err);
    }

    try {
      const res = await fetch("/api/vision/perception/telemetry");
      const data = await res.json();
      if (data.success) {
        setPerceptionTelemetry(data.telemetry || []);
      }
    } catch (err) {
      console.error("Failed to load telemetry", err);
    }
  };

  const handleToggleAdapter = async (id: string, currentHealth: "healthy" | "offline") => {
    try {
      const targetHealth = currentHealth === "healthy" ? "offline" : "healthy";
      const res = await fetch("/api/vision/perception/adapters/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, health: targetHealth })
      });
      const data = await res.json();
      if (data.success) {
        fetchPerceptionData();
      }
    } catch (err) {
      console.error("Failed to toggle adapter", err);
    }
  };

  const handleStartPerception = async () => {
    setIsPerceptionAnalyzing(true);
    setPerceptionProgress(10);
    setPerceptionReport(null);
    setPerceptionError(null);

    const preset = PRESET_DESIGNS.find(d => d.id === perceptionSelectedPreset);
    if (!preset) {
      setIsPerceptionAnalyzing(false);
      return;
    }

    try {
      const interval = setInterval(() => {
        setPerceptionProgress(prev => {
          if (prev >= 95) return 95;
          return prev + 12;
        });
      }, 300);

      const res = await fetch("/api/vision/perception/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data: preset.mockData,
          fileName: `${preset.id}.${preset.ext}`,
          isReference: perceptionIsReference
        })
      });

      const data = await res.json();
      clearInterval(interval);
      setPerceptionProgress(100);

      if (data.success) {
        setPerceptionReport(data.report);
      } else {
        setPerceptionError(data.error || "Analysis failed");
      }
    } catch (err: any) {
      setPerceptionError(err.message || "Perception run failed");
    } finally {
      setIsPerceptionAnalyzing(false);
      fetchPerceptionData();
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/vision/metrics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to load vision metrics", err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/vision/queue/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        setQueueLength(data.queueLength);
      }
    } catch (err) {
      console.error("Failed to load queue jobs", err);
    }
  };

  // Run Synchronous Visual Intelligence Pipeline
  const handleAnalyzePreset = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisResult(null);

    const preset = PRESET_DESIGNS.find(d => d.id === selectedFilePreset);
    if (!preset) return;

    try {
      // Step-by-step progress simulation to show the stages
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 15;
        });
      }, 350);

      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data: preset.mockData,
          fileName: `${preset.id}.${preset.ext}`
        })
      });

      const data = await res.json();
      clearInterval(interval);
      setAnalysisProgress(100);

      if (data.success) {
        setAnalysisResult(data.analysis);
        // Refresh telemetry stats
        fetchMetrics();
        fetchJobs();
      } else {
        alert("Analysis failed: " + data.error);
      }
    } catch (err: any) {
      alert("Error calling visual orchestrator: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Asynchronous Processing Job to the Priority Queue
  const handleSubmitToQueue = async (priority: "high" | "normal" | "low" = "normal") => {
    const preset = PRESET_DESIGNS.find(d => d.id === selectedFilePreset);
    if (!preset) return;

    try {
      const res = await fetch("/api/vision/queue/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data: preset.mockData,
          fileName: `${preset.id}.${preset.ext}`,
          priority
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchJobs();
        fetchMetrics();
        setActiveTab("queue");
      }
    } catch (err: any) {
      alert("Queue submit failed: " + err.message);
    }
  };

  // Handle local user file upload parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const rawBase64 = (reader.result as string).split(",")[1];
      setIsAnalyzing(true);
      setAnalysisProgress(15);
      setAnalysisResult(null);

      try {
        const res = await fetch("/api/vision/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Data: rawBase64,
            fileName: file.name
          })
        });
        const data = await res.json();
        setAnalysisProgress(100);

        if (data.success) {
          setAnalysisResult(data.analysis);
          fetchMetrics();
          fetchJobs();
        } else {
          alert("Analysis failed: " + data.error);
        }
      } catch (err: any) {
        alert("Upload analysis failed: " + err.message);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Cancel Queue Job
  const handleCancelJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/vision/queue/job/${jobId}/cancel`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        fetchJobs();
        fetchMetrics();
        if (selectedJob?.jobId === jobId) {
          setSelectedJob(null);
        }
      }
    } catch (err) {
      console.error("Cancel job failed", err);
    }
  };

  // Compare two versions of design assets
  const handleCompare = async () => {
    if (!compareJobA || !compareJobB) return;
    setIsComparing(true);
    setCompareDiff(null);

    try {
      const res = await fetch("/api/vision/version-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobA: compareJobA, jobB: compareJobB })
      });
      const data = await res.json();
      if (data.success) {
        setCompareDiff(data.diff);
      } else {
        alert("Comparison failed: " + data.error);
      }
    } catch (err: any) {
      alert("Error on comparison: " + err.message);
    } finally {
      setIsComparing(false);
    }
  };

  // Run Visual Intelligence Platform Tests
  const handleRunTests = async () => {
    setTestsRunning(true);
    setTestResults([]);
    setTestSummary(null);

    try {
      const res = await fetch("/api/vision/run-tests", {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setTestResults(data.results);
        setTestSummary(data.summary);
      }
    } catch (err: any) {
      alert("Test execution error: " + err.message);
    } finally {
      setTestsRunning(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col h-[750px] font-sans">
      {/* Platform Header */}
      <div className="bg-slate-950 p-5 border-b border-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-indigo-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/10">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span>Visual Intelligence Architecture</span>
              <span className="text-[9px] bg-indigo-950/40 border border-indigo-900/60 text-indigo-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider animate-pulse">
                Active v2.1.3
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise Multimodal Vision Orchestrator, parallel analyzers, and self-healing perception pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("perception");
              fetchPerceptionData();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all uppercase flex items-center gap-1.5 ${
              activeTab === "perception" ? "bg-slate-800 text-indigo-400 border border-indigo-700/50" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Perception Engine</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("ocr");
              fetchOcrData();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all uppercase flex items-center gap-1.5 ${
              activeTab === "ocr" ? "bg-slate-800 text-indigo-400 border border-indigo-700/50" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Script & OCR</span>
          </button>
          <button
            onClick={() => setActiveTab("orchestrator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all uppercase ${
              activeTab === "orchestrator" ? "bg-slate-800 text-emerald-400 border border-slate-700/50" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Orchestrator
          </button>
          <button
            onClick={() => {
              setActiveTab("queue");
              fetchJobs();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all uppercase flex items-center gap-1.5 ${
              activeTab === "queue" ? "bg-slate-800 text-emerald-400 border border-slate-700/50" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Queue</span>
            {queueLength > 0 && (
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("metrics");
              fetchMetrics();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all uppercase ${
              activeTab === "metrics" ? "bg-slate-800 text-emerald-400 border border-slate-700/50" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => {
              setActiveTab("comparator");
              fetchJobs();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all uppercase flex items-center gap-1 ${
              activeTab === "comparator" ? "bg-slate-800 text-emerald-400 border border-slate-700/50" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCompare className="w-3 h-3" />
            <span>Compare</span>
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all uppercase flex items-center gap-1 ${
              activeTab === "tests" ? "bg-slate-800 text-emerald-400 border border-slate-700/50" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Tests</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
        <AnimatePresence mode="wait">
          {activeTab === "perception" && (
            <motion.div
              key="perception"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full text-slate-100"
            >
              {/* Left Column: Input + Adapters + Telemetry */}
              <div className="lg:col-span-5 flex flex-col gap-5 h-full overflow-y-auto pr-1">
                {/* 1. Controller */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4 text-left">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>Multimodal Perception Controller</span>
                  </h4>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-mono block">Target Canvas Preset</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_DESIGNS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setPerceptionSelectedPreset(preset.id);
                            setPerceptionReport(null);
                          }}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            perceptionSelectedPreset === preset.id
                              ? "bg-indigo-950/15 border-indigo-500/30 text-slate-100"
                              : "bg-slate-900/40 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold truncate w-full">{preset.name}</span>
                          <span className="text-[8px] opacity-75 truncate">{preset.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/40 border border-slate-850 p-3 rounded-lg text-left">
                    <div className="text-left">
                      <span className="text-[10px] font-mono font-bold text-slate-300 block">Reference Design Analysis</span>
                      <span className="text-[8px] text-slate-500">Inject structured inspiration metadata</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={perceptionIsReference}
                      onChange={(e) => setPerceptionIsReference(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleStartPerception}
                    disabled={isPerceptionAnalyzing}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    {isPerceptionAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>RUNNING PERCEPTION PIPELINE ({perceptionProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>INITIALIZE PERCEPTION SESSION</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Model Adapter Registry */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>Model Adapter Registry</span>
                    </h4>
                    <span className="text-[8px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      Failure-Tolerant
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                    {perceptionAdapters.map((adapter) => (
                      <div
                        key={adapter.id}
                        className="p-2 bg-slate-900/60 border border-slate-850 rounded-lg flex items-center justify-between text-left"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-200">{adapter.name}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${adapter.health === "healthy" ? "bg-emerald-400" : "bg-rose-400 animate-pulse"}`} />
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono block">Provider: {adapter.provider} • Score: {(adapter.accuracyScore * 100).toFixed(0)}%</span>
                        </div>

                        <button
                          onClick={() => handleToggleAdapter(adapter.id, adapter.health)}
                          className={`px-2 py-1 text-[8px] font-mono font-bold rounded border transition-all cursor-pointer ${
                            adapter.health === "healthy"
                              ? "bg-emerald-950/25 text-emerald-400 border-emerald-900/60 hover:bg-emerald-900/45"
                              : "bg-rose-950/25 text-rose-400 border-rose-900/60 hover:bg-rose-900/45"
                          }`}
                        >
                          {adapter.health === "healthy" ? "Inject Failure" : "Recover"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Live Telemetry Event Logs */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 flex flex-col min-h-[150px] text-left">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>Perception Telemetry Channel</span>
                  </h4>
                  <div className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-2.5 font-mono text-[9px] text-indigo-300 space-y-1 overflow-y-auto max-h-[150px] scrollbar-thin text-left">
                    {perceptionTelemetry.length === 0 ? (
                      <div className="text-slate-600 italic text-center py-4">No telemetry logs available. Run a session.</div>
                    ) : (
                      perceptionTelemetry.slice().reverse().map((event, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-left">
                          <span className="text-slate-600 shrink-0">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                          <span className="text-indigo-400 shrink-0 font-bold">{event.eventType}</span>
                          <span className="text-slate-300 truncate">{event.metadata?.analyzer || event.metadata?.fileName || ""}</span>
                          {event.metadata?.latencyMs && (
                            <span className="text-emerald-500 font-bold shrink-0">({event.metadata.latencyMs}ms)</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Perception Report Display */}
              <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 border border-slate-850 rounded-xl overflow-hidden min-h-[400px]">
                {/* Header info */}
                <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between text-left">
                  <div className="text-left">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Perception Session Result</span>
                    <h5 className="text-xs font-mono font-bold text-indigo-300">Unified Visual Report</h5>
                  </div>
                  {perceptionReport && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-indigo-950/40 border border-indigo-900/60 text-indigo-400 px-2 py-0.5 rounded-full font-mono font-bold">
                        DPI: {perceptionReport.printQualityAssessment.estimatedDpi}
                      </span>
                      <span className="text-[9px] bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                        Confidence: {(perceptionReport.confidenceEngine.overallConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Report Content Panel */}
                <div className="flex-1 overflow-y-auto p-5 text-left space-y-5 scrollbar-thin">
                  {!perceptionReport ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      {isPerceptionAnalyzing ? (
                        <div className="space-y-3">
                          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                          <p className="text-xs text-slate-400 font-mono">Orchestrating concurrent multimodal adapters...</p>
                        </div>
                      ) : perceptionError ? (
                        <div className="space-y-2 max-w-sm text-center mx-auto">
                          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                          <p className="text-xs text-rose-400 font-mono">{perceptionError}</p>
                          <button onClick={handleStartPerception} className="text-[10px] text-indigo-400 font-bold underline hover:text-indigo-300 cursor-pointer">Retry Session</button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-w-md mx-auto">
                          <Compass className="w-10 h-10 text-indigo-500/20 mx-auto" />
                          <p className="text-xs text-slate-400 font-mono">Perception session ready.</p>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Initialize a session to spin up our 20+ specialized deep visual classifiers.
                            Test failure-tolerance by putting specific model adapters offline first.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      {/* Top banner: Meta classification */}
                      <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">Asset Category</span>
                          <span className="text-xs font-mono font-bold text-slate-200">{perceptionReport.assetCategory}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">Multilingual Direction</span>
                          <span className="text-xs font-mono font-bold text-slate-200 uppercase">{perceptionReport.primaryDirection}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">Grid Balance Score</span>
                          <span className="text-xs font-mono font-bold text-slate-200">{(perceptionReport.layoutParameters.balanceScore * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">Harmony Score</span>
                          <span className="text-xs font-mono font-bold text-slate-200">{(perceptionReport.creativeInsights.overallHarmony * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Multilingual perception */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Type className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Script & Multilingual Perception</span>
                        </span>
                        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg space-y-2 text-left">
                          <div className="flex flex-wrap gap-1.5 text-left">
                            {perceptionReport.detectedLanguages.map((lang: string, i: number) => (
                              <span key={i} className="text-[9px] bg-indigo-950/20 text-indigo-300 border border-indigo-900/40 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                {lang}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-300 leading-normal text-left">
                            Our layout parser detected <strong className="text-indigo-400 font-mono">{perceptionReport.layoutParameters.compositionType}</strong> composition with text density of <strong className="text-indigo-400 font-mono">{(perceptionReport.layoutParameters.textDensity * 100).toFixed(0)}%</strong>.
                            Script is rendering flow <strong className="text-indigo-400 font-mono uppercase">{perceptionReport.primaryDirection}</strong>.
                          </p>
                        </div>
                      </div>

                      {/* Layout grid parameters */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Grid className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Structural Layout Grid Parameters</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                          <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg space-y-1 text-left">
                            <span className="text-[9px] text-slate-500 font-mono block">Grid Structure</span>
                            <span className="text-xs font-mono font-bold text-slate-300">{perceptionReport.layoutParameters.gridStructure}</span>
                            <span className="text-[8px] text-slate-500 block">Whitespace Ratio: {(perceptionReport.layoutParameters.whitespaceRatio * 100).toFixed(0)}%</span>
                          </div>
                          <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg space-y-1 text-left">
                            <span className="text-[9px] text-slate-500 font-mono block">Font Families Detected</span>
                            <div className="flex flex-wrap gap-1 text-left">
                              {perceptionReport.layoutParameters.fontFamilies.map((f: string, i: number) => (
                                <span key={i} className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 font-mono">{f}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Color Palette */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Color Harmony & Swatches</span>
                        </span>
                        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg space-y-3 text-left">
                          <div className="flex h-6 rounded-md overflow-hidden">
                            {perceptionReport.colorPalette.swatches.map((swatch: any, i: number) => (
                              <div
                                key={i}
                                style={{ backgroundColor: swatch.hex, width: `${swatch.ratio * 100}%` }}
                                title={`${swatch.colorName}: ${swatch.hex} (${(swatch.ratio * 100).toFixed(0)}%)`}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
                            {perceptionReport.colorPalette.swatches.map((swatch: any, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-left">
                                <span className="w-3 h-3 rounded shrink-0 animate-fade-in" style={{ backgroundColor: swatch.hex }} />
                                <div className="min-w-0 text-left">
                                  <span className="text-[9px] text-slate-300 block font-mono font-bold truncate">{swatch.colorName}</span>
                                  <span className="text-[8px] text-slate-500 font-mono">{swatch.hex} ({(swatch.ratio * 100).toFixed(0)}%)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Creative insights */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Creative Director Insights</span>
                        </span>
                        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg space-y-2 text-left">
                          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                            <span className="text-[10px] text-slate-300 font-mono">Dominant Visual Style: <strong className="text-indigo-400">{perceptionReport.creativeInsights.dominantStyle}</strong></span>
                            <span className="text-[9px] bg-slate-900 text-indigo-400 border border-indigo-950 px-2 py-0.5 rounded font-mono">Harmony: {perceptionReport.creativeInsights.overallHarmony * 10}/10</span>
                          </div>
                          <div className="text-[10px] text-slate-400 leading-relaxed font-mono space-y-1 text-left">
                            <span className="text-slate-300 block font-bold mb-1">Atmospheric Style Matrix:</span>
                            {Object.entries(perceptionReport.creativeInsights.atmosphericStyleParameters).map(([key, value]: any) => (
                              <div key={key} className="flex items-center justify-between text-[9px] border-b border-slate-900/60 py-0.5 text-left">
                                <span className="text-slate-500 uppercase">{key}</span>
                                <span className="text-slate-300">{(value * 10).toFixed(0)} / 10</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Contrast & Accessibility */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Contrast & WCAG Accessibility Assessment</span>
                        </span>
                        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-300 font-mono text-left">Accessibility Score: <strong className="text-indigo-400">{(perceptionReport.contrastAccessibilityScore.overallScore * 100).toFixed(0)}%</strong></span>
                            <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                              perceptionReport.contrastAccessibilityScore.overallScore > 0.85 ? "bg-emerald-950/25 text-emerald-400" : "bg-amber-950/25 text-amber-400"
                            }`}>
                              {perceptionReport.contrastAccessibilityScore.overallScore > 0.85 ? "WCAG AAA Compliant" : "Violations Detected"}
                            </span>
                          </div>
                          <ul className="text-[9px] text-slate-500 font-mono list-disc pl-4 space-y-0.5 text-left">
                            {perceptionReport.contrastAccessibilityScore.violations.map((v: string, i: number) => (
                              <li key={i} className="text-rose-400/90 leading-tight text-left">{v}</li>
                            ))}
                            {perceptionReport.contrastAccessibilityScore.remediationTips.map((tip: string, i: number) => (
                              <li key={i} className="text-slate-400 leading-tight text-left">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Print and Quality */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Print Readiness & Quality Assessment</span>
                        </span>
                        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-lg space-y-2 text-left">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-300">Ready Score: <strong className="text-indigo-400">{(perceptionReport.printQualityAssessment.printReadyScore * 100).toFixed(0)}%</strong></span>
                            <span className="text-slate-500">Bleed Error Risk: {(perceptionReport.printQualityAssessment.bleedErrorProbability * 100).toFixed(0)}%</span>
                          </div>
                          {perceptionReport.printQualityAssessment.warnings.length > 0 && (
                            <div className="text-[9px] text-amber-400 font-mono bg-amber-950/20 p-2 rounded border border-amber-900/40 text-left">
                              <span className="font-bold block mb-0.5">Print Warnings:</span>
                              {perceptionReport.printQualityAssessment.warnings.map((w: string, i: number) => (
                                <span key={i} className="block leading-snug">• {w}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reference Design details if enabled */}
                      {perceptionReport.referenceInspirationMetadata && (
                        <div className="space-y-2 border-t border-indigo-900/20 pt-4 text-left">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5" />
                            <span>Structured Inspiration Guidelines (Reference)</span>
                          </span>
                          <div className="bg-indigo-950/10 border border-indigo-900/30 p-3.5 rounded-lg space-y-2 text-[10px] text-slate-300 font-mono leading-relaxed text-left">
                            <p><strong>Rhythm Concept:</strong> {perceptionReport.referenceInspirationMetadata.suggestedRhythmConcept}</p>
                            <p><strong>Composition Rules:</strong> {perceptionReport.referenceInspirationMetadata.extractedCompositionRules.join(" | ")}</p>
                            <p><strong>Spacing Directives:</strong> {perceptionReport.referenceInspirationMetadata.spacingDirectives.join(" | ")}</p>
                            <p><strong>Harmony Principles:</strong> {perceptionReport.referenceInspirationMetadata.colorHarmonyDirectives.join(" | ")}</p>
                          </div>
                        </div>
                      )}

                      {/* Recommended next actions */}
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-indigo-300 block">Recommended Generative Actions:</span>
                        <div className="grid grid-cols-2 gap-2 text-left">
                          {perceptionReport.recommendedGenerativeActions.map((action: string, i: number) => (
                            <div key={i} className="p-2 bg-slate-950 border border-slate-850 rounded text-[9px] text-slate-400 font-mono leading-normal text-left">
                              {action}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "ocr" && (
            <motion.div
              key="ocr"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full text-slate-100"
            >
              {/* Left Column: Input Controllers + Failover Registry + Telemetry + Override Desk */}
              <div className="lg:col-span-5 flex flex-col gap-5 h-full overflow-y-auto pr-1">
                
                {/* 1. OCR Orchestrator Panel */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4 text-left shadow-xl">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <ScanLine className="w-4 h-4 text-indigo-400" />
                    <span>OCR & Script Intelligence Desk</span>
                  </h4>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-mono block">Visual Asset Preset</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_DESIGNS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setOcrSelectedPreset(preset.id);
                            setOcrReport(null);
                            setComparisonOutput(null);
                          }}
                          className={`p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            ocrSelectedPreset === preset.id
                              ? "bg-indigo-950/20 border-indigo-500/50 text-slate-100 shadow-md"
                              : "bg-slate-900/40 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold truncate w-full">{preset.name}</span>
                          <span className="text-[8px] opacity-75 truncate uppercase">{preset.type} • {preset.ext}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/40 border border-slate-850 p-3 rounded-lg text-left">
                    <div className="text-left">
                      <span className="text-[10px] font-mono font-bold text-slate-300 block">Reference Design Mode</span>
                      <span className="text-[8px] text-slate-500">Output descriptive metadata without copying</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={ocrIsReference}
                      onChange={(e) => setOcrIsReference(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleStartOcr}
                    disabled={isOcrAnalyzing}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    {isOcrAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>PROCESSING SCRIPT ANALYSIS ({ocrProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>RUN OCR & SCRIPT PIPELINE</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Failover OCR Model Registry */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>OCR Provider Registry</span>
                    </h4>
                    <span className="text-[8px] bg-indigo-950/30 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/50 font-mono font-bold">
                      Decoupled
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                    {ocrAdapters.map((adapter) => (
                      <div
                        key={adapter.id}
                        className="p-2 bg-slate-900/60 border border-slate-850 rounded-lg flex items-center justify-between text-left"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-200">{adapter.name}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${adapter.healthStatus === "healthy" ? "bg-emerald-400" : "bg-rose-400 animate-pulse"}`} />
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono block">Type: {adapter.providerType} • Latency: {adapter.avgLatencyMs}ms</span>
                        </div>

                        <button
                          onClick={() => handleToggleOcrAdapter(adapter.id, adapter.healthStatus)}
                          className={`px-2 py-1 text-[8px] font-mono font-bold rounded border transition-all cursor-pointer ${
                            adapter.healthStatus === "healthy"
                              ? "bg-rose-950/25 text-rose-400 border-rose-900/60 hover:bg-rose-900/45"
                              : "bg-emerald-950/25 text-emerald-400 border-emerald-900/60 hover:bg-emerald-900/45"
                          }`}
                        >
                          {adapter.healthStatus === "healthy" ? "Simulate Offline" : "Recover Node"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Human Dictionary Review Override Desk */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3 text-left">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Edit className="w-4 h-4 text-indigo-400" />
                    <span>OCR Dictionary Review Override</span>
                  </h4>
                  <p className="text-[8px] text-slate-500 leading-normal">
                    Select a visual text region from the processed report to inject dictionary corrections. Preserves original outputs.
                  </p>

                  <div className="space-y-2">
                    <select
                      value={activeCorrectionRegionId}
                      onChange={(e) => {
                        setActiveCorrectionRegionId(e.target.value);
                        if (ocrReport) {
                          const reg = ocrReport.regions.find((r: any) => r.id === e.target.value);
                          setActiveCorrectionText(reg ? reg.text : "");
                        }
                      }}
                      className="w-full bg-slate-900 text-slate-300 font-mono text-[10px] p-2 rounded border border-slate-850"
                    >
                      <option value="">-- Choose Text Region --</option>
                      {ocrReport?.regions.map((reg: any) => (
                        <option key={reg.id} value={reg.id}>
                          {reg.id} ({reg.category}): {reg.text.substring(0, 25)}...
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Enter dictionary override text..."
                      value={activeCorrectionText}
                      onChange={(e) => setActiveCorrectionText(e.target.value)}
                      disabled={!activeCorrectionRegionId}
                      className="w-full bg-slate-900 text-slate-200 font-mono text-[10px] p-2 rounded border border-slate-850 placeholder-slate-600 disabled:opacity-40"
                    />

                    <button
                      onClick={handleApplyOcrCorrection}
                      disabled={!activeCorrectionRegionId || !activeCorrectionText.trim()}
                      className="w-full py-1.5 bg-indigo-900/60 hover:bg-indigo-800 disabled:opacity-40 text-indigo-300 font-mono text-[9px] font-bold rounded border border-indigo-700/50 uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Apply Dictionary Override
                    </button>
                  </div>

                  {dictionaryLogs.length > 0 && (
                    <div className="space-y-1 mt-2.5">
                      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">Dictionary Correction Logs:</span>
                      <div className="bg-slate-900/60 border border-slate-850 p-2 rounded max-h-[80px] overflow-y-auto scrollbar-thin space-y-1 font-mono text-[8px]">
                        {dictionaryLogs.map((log, i) => (
                          <div key={i} className="flex justify-between text-slate-400">
                            <span className="truncate max-w-[120px] text-rose-400 line-through">{log.original}</span>
                            <span className="mx-1">→</span>
                            <span className="truncate max-w-[120px] text-emerald-400 font-bold">{log.corrected}</span>
                            <span className="text-[7px] text-slate-600">({log.timestamp})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Live OCR Telemetry Channel */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 flex flex-col min-h-[140px] text-left">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>OCR Telemetry Stream</span>
                  </h4>
                  <div className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-2.5 font-mono text-[9px] text-indigo-300 space-y-1 overflow-y-auto max-h-[140px] scrollbar-thin text-left">
                    {ocrTelemetry.length === 0 ? (
                      <div className="text-slate-600 italic text-center py-4">No active stream. Start OCR.</div>
                    ) : (
                      ocrTelemetry.slice().reverse().map((event, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-left">
                          <span className="text-slate-600 shrink-0">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                          <span className="text-indigo-400 shrink-0 font-bold">{event.eventType}</span>
                          <span className="text-slate-300 truncate">{event.message}</span>
                          {event.metadata?.latencyMs && (
                            <span className="text-emerald-500 font-bold shrink-0">({event.metadata.latencyMs}ms)</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic Script and OCR Metadata Display */}
              <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 border border-slate-850 rounded-xl overflow-hidden min-h-[500px] shadow-2xl">
                
                {/* Visual Header bar */}
                <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between text-left">
                  <div className="text-left">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Script Perception Result</span>
                    <h5 className="text-xs font-mono font-bold text-indigo-300">Unified Typographic & OCR Metadata</h5>
                  </div>
                  {ocrReport && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                        ID: {ocrReport.id}
                      </span>
                      <span className="text-[9px] bg-indigo-950/40 border border-indigo-900/60 text-indigo-400 px-2 py-0.5 rounded-full font-mono font-bold">
                        Direction: {ocrReport.primaryDirection.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Panel */}
                <div className="flex-1 overflow-y-auto p-5 text-left space-y-6 scrollbar-thin">
                  {!ocrReport ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16">
                      {isOcrAnalyzing ? (
                        <div className="space-y-4">
                          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                          <p className="text-xs text-slate-400 font-mono">Running parallel script analyzers and visual flow nodes...</p>
                        </div>
                      ) : ocrError ? (
                        <div className="space-y-2 max-w-sm text-center mx-auto">
                          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                          <p className="text-xs text-rose-400 font-mono">{ocrError}</p>
                          <button onClick={handleStartOcr} className="text-[10px] text-indigo-400 font-bold underline hover:text-indigo-300 cursor-pointer">Retry OCR Scan</button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-w-md mx-auto">
                          <ScanLine className="w-10 h-10 text-indigo-500/20 mx-auto" />
                          <p className="text-xs text-slate-400 font-mono">OCR and Calligraphy Engine Ready.</p>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Choose an asset preset on the left and trigger the pipeline.
                            The system will automatically detect multilingual scripts (Bangla, Urdu, Arabic, Devanagari, English), classify typography families, parse baseline strokes, and extract logical semantic entities.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      
                      {/* 1. Language & Script Badges */}
                      <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">Languages Detected</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ocrReport.detectedLanguages.map((lang: string, i: number) => (
                              <span key={i} className="text-[9px] bg-indigo-950/30 text-indigo-300 border border-indigo-900/50 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">Scripts Detected</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ocrReport.detectedScripts.map((script: string, i: number) => (
                              <span key={i} className="text-[9px] bg-emerald-950/30 text-emerald-300 border border-emerald-900/50 px-2 py-0.5 rounded font-mono font-bold">
                                {script}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-mono block">OCR Confidence</span>
                          <span className="text-xs font-mono font-bold text-emerald-400 block mt-1">
                            {(ocrReport.confidenceMetrics.overallOcrConfidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* 2. Text Region Layout Map */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Layout className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Detected Text Regions & Coordinates</span>
                        </span>
                        <div className="bg-slate-900/30 border border-slate-850 rounded-xl overflow-hidden p-3 space-y-2.5">
                          {ocrReport.regions.map((region: any) => (
                            <div
                              key={region.id}
                              onClick={() => {
                                setActiveCorrectionRegionId(region.id);
                                setActiveCorrectionText(region.text);
                              }}
                              className="p-3 bg-slate-950 border border-slate-850 hover:border-indigo-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all cursor-pointer"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 font-mono font-bold">
                                    {region.id}
                                  </span>
                                  <span className="text-[9px] bg-indigo-950/40 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                                    {region.category}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    Conf: {(region.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <p className="text-xs font-mono text-slate-200">{region.text}</p>
                              </div>

                              <div className="text-left sm:text-right shrink-0">
                                <span className="text-[8px] text-slate-500 font-mono block">
                                  X:{region.boundingBox.x} Y:{region.boundingBox.y}
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono block">
                                  W:{region.boundingBox.width} H:{region.boundingBox.height}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Typography Analyzer Results */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Typography Feature Analysis</span>
                        </span>
                        <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                              <span className="text-[9px] text-slate-500 font-mono block font-bold">Dominant Class</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{ocrReport.typographySummary.dominantClass}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 font-mono block font-bold">Estimated Family</span>
                              <span className="text-xs font-mono font-bold text-indigo-300">{ocrReport.typographySummary.attributes.estimatedFontFamily}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 font-mono block font-bold">Readability Score</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">{ocrReport.typographySummary.attributes.readabilityScore} / 100</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 font-mono block font-bold">Coherence Index</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{ocrReport.typographySummary.hierarchyCoherenceScore}%</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded border border-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div><strong>Font Weight:</strong> {ocrReport.typographySummary.attributes.weight.toUpperCase()}</div>
                            <div><strong>Font Width:</strong> {ocrReport.typographySummary.attributes.width.toUpperCase()}</div>
                            <div><strong>Leading Ratio:</strong> {ocrReport.typographySummary.attributes.leadingRatio}</div>
                            <div><strong>Tracking Ratio:</strong> {ocrReport.typographySummary.attributes.trackingRatio}</div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] text-slate-400 font-mono block uppercase">Alternative Fonts Recommendations:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {ocrReport.typographySummary.attributes.alternativeFonts.map((font: string, idx: number) => (
                                <span key={idx} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono">
                                  {font}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. Calligraphy Intelligence Layer (Conditional) */}
                      {ocrReport.calligraphySummary && (
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Calligraphy & Letterform Stroke Analyzer</span>
                          </span>
                          <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                              <span className="text-xs font-mono font-bold text-slate-200">
                                Style: {ocrReport.calligraphySummary.styleName}
                              </span>
                              <span className="text-[9px] bg-indigo-950/40 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                Medium: {ocrReport.calligraphySummary.mediumType}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-300">
                              <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-1">
                                <span className="text-[8px] text-slate-500 block">STROKE FLOW TYPE</span>
                                <span className="font-bold text-slate-200 uppercase">{ocrReport.calligraphySummary.strokeFlow}</span>
                              </div>
                              <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-1">
                                <span className="text-[8px] text-slate-500 block">BASELINE ALIGNMENT</span>
                                <span className="font-bold text-slate-200 uppercase">{ocrReport.calligraphySummary.baselineAlignmentStyle}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-[9px] font-mono text-slate-400">
                              <div className="flex justify-between">
                                <span>Stroke Thickness Index:</span>
                                <span className="text-slate-200">{ocrReport.calligraphySummary.strokeThicknessRating} / 10</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Letterform Curvature Index:</span>
                                <span className="text-slate-200">{ocrReport.calligraphySummary.curvatureRating} / 10</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Decorative Flourishes Detected:</span>
                                <span className={ocrReport.calligraphySummary.decorativeFlourishes ? "text-emerald-400" : "text-slate-500"}>
                                  {ocrReport.calligraphySummary.decorativeFlourishes ? "YES" : "NO"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Complex Ligatures Pre-rendered:</span>
                                <span className={ocrReport.calligraphySummary.hasComplexLigatures ? "text-emerald-400" : "text-slate-500"}>
                                  {ocrReport.calligraphySummary.hasComplexLigatures ? "YES" : "NO"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 5. Semantic Extractor Desk */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Semantic Information Entities Extracted</span>
                        </span>
                        <div className="bg-slate-900/30 border border-slate-850 p-3 rounded-xl space-y-1.5">
                          {ocrReport.semanticEntities.length === 0 ? (
                            <div className="text-[9px] font-mono text-slate-500 italic p-3">No semantic entities identified inside original text.</div>
                          ) : (
                            ocrReport.semanticEntities.map((entity: any, i: number) => (
                              <div key={i} className="bg-slate-950 p-2.5 rounded border border-slate-850 flex items-center justify-between text-left">
                                <div className="space-y-0.5">
                                  <span className="text-[8px] bg-indigo-950 text-indigo-300 border border-indigo-900/50 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                                    {entity.type}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-slate-200 block mt-1">{entity.value}</span>
                                </div>
                                <span className="text-[8px] text-slate-500 font-mono italic">
                                  Extracted from: "{entity.extractedFromText}"
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* 6. Typography Comparison Desk */}
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-300 block uppercase">Typographic Spacing Comparator Desk</span>
                          <button
                            onClick={handleTriggerTypographyComparison}
                            disabled={isComparingTypography}
                            className="px-3 py-1 bg-indigo-900/80 hover:bg-indigo-800 text-white font-mono text-[8px] font-bold rounded border border-indigo-700 uppercase tracking-wider cursor-pointer"
                          >
                            {isComparingTypography ? "COMPUTING..." : "COMPARE SPACING WITH GUIDELINES"}
                          </button>
                        </div>

                        {comparisonOutput && (
                          <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2 text-[10px] font-mono text-slate-300 leading-normal">
                            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                              <span>Font Families Identical:</span>
                              <span className={comparisonOutput.fontComparison.identical ? "text-emerald-400" : "text-amber-400"}>
                                {comparisonOutput.fontComparison.identical ? "YES" : "NO"} ({comparisonOutput.fontComparison.primaryA} vs {comparisonOutput.fontComparison.primaryB})
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                              <span>Overall Spacing Similarity Ratio:</span>
                              <span className="text-indigo-400 font-bold">{(comparisonOutput.overallSimilarity * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                              <span>Tracking deviation:</span>
                              <span>{comparisonOutput.spacingComparison.trackingDifference.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Remediation required:</span>
                              <span className={comparisonOutput.spacingComparison.isRemediationRequired ? "text-rose-400" : "text-emerald-400"}>
                                {comparisonOutput.spacingComparison.isRemediationRequired ? "YES (Adjust leading/tracking ratios)" : "NO (Within healthy design limits)"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 7. Image Quality metrics */}
                      <div className="space-y-2 text-left border-t border-slate-850 pt-4">
                        <span className="text-[10px] font-mono font-bold text-slate-400">OCR Image Quality metrics</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[9px] font-mono text-slate-400">
                          <div>Sharpness Index: <strong className="text-slate-200">{ocrReport.qualityAssessment.sharpness}%</strong></div>
                          <div>Blur Index: <strong className="text-slate-200">{ocrReport.qualityAssessment.blurValue}%</strong></div>
                          <div>Contrast rating: <strong className="text-emerald-400 uppercase">{ocrReport.qualityAssessment.contrastRating}</strong></div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === "orchestrator" && (
            <motion.div
              key="orchestrator"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
            >
              {/* Asset Selection & Upload Panel */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Select Target Canvas Asset</span>
                  </h4>

                  <div className="space-y-2">
                    {PRESET_DESIGNS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedFilePreset(preset.id);
                          setAnalysisResult(null);
                        }}
                        className={`w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          selectedFilePreset === preset.id
                            ? "bg-emerald-950/15 border-emerald-500/30 text-slate-100"
                            : "bg-slate-900/40 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-md ${selectedFilePreset === preset.id ? "bg-emerald-950 text-emerald-400" : "bg-slate-950 text-slate-500"}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-mono font-bold truncate">{preset.name}</div>
                          <div className="text-[10px] opacity-80 mt-1 line-clamp-1">{preset.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleAnalyzePreset}
                      disabled={isAnalyzing}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>ANALYZING ({analysisProgress}%)</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>ANALYZE SYNC</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSubmitToQueue("high")}
                      disabled={isAnalyzing}
                      className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      title="Dispatch to asynchronous queue at high priority"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>QUEUE</span>
                    </button>
                  </div>
                </div>

                {/* Custom File Upload Box */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col items-center justify-center py-6 text-center border-dashed hover:border-emerald-500/30 transition-all">
                  <UploadCloud className="w-8 h-8 text-slate-500 mb-2.5" />
                  <p className="text-xs text-slate-300 font-mono font-bold">Upload Custom Local Asset</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Select PNG, JPEG, SVG, WEBP design drafts up to 25MB to trigger full staged visual analysis.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="mt-3.5 px-4 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer"
                  >
                    SELECT FILE
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.svg"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Analysis Structured Output Package View */}
              <div className="lg:col-span-7 flex flex-col h-full min-h-[450px]">
                {analysisResult ? (
                  <div className="bg-slate-950 rounded-xl border border-slate-850 flex flex-col h-full overflow-hidden">
                    {/* Visual Package Header */}
                    <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                          STAGED ANALYSIS REPORT
                        </span>
                      </div>
                      <span className="text-[9px] font-mono bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30">
                        CONFIDENCE: {Math.round(analysisResult.confidenceScore * 100)}%
                      </span>
                    </div>

                    {/* Result Content Tabs */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      {/* Grid Metadata and Quality */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850/60">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Classification</span>
                          <p className="text-sm font-mono font-bold text-emerald-400 capitalize mt-1 flex items-center gap-1.5">
                            <Layers className="w-4 h-4" />
                            {analysisResult.documentType}
                          </p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850/60">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Languages Detected</span>
                          <p className="text-sm font-mono font-bold text-indigo-400 uppercase mt-1">
                            {analysisResult.languagesDetected.join(", ") || "English"}
                          </p>
                        </div>
                      </div>

                      {/* Color Palette */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Palette className="w-3 h-3 text-emerald-400" />
                          <span>Extracted Color Palette Swatches</span>
                        </span>
                        <div className="flex gap-2">
                          {analysisResult.colors.map((color: any, idx: number) => (
                            <div key={idx} className="flex-1 bg-slate-900 p-2 rounded-lg border border-slate-850 text-center space-y-1.5">
                              <div
                                className="w-full h-8 rounded-md border border-slate-900"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="text-[9px] font-mono text-slate-200 font-bold">{color.hex}</div>
                              <div className="text-[8px] font-mono text-slate-500">{(color.ratio * 100).toFixed(0)}% ratio</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detected Typography Patterns */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Type className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Typography & Font Weights</span>
                        </span>
                        <div className="space-y-1.5">
                          {analysisResult.typography.map((typo: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 flex items-center justify-between text-xs font-mono">
                              <div className="space-y-0.5 text-left">
                                <span className="text-slate-200 font-bold block">{typo.text}</span>
                                <span className="text-[9px] text-slate-500">Font Family: {typo.fontFamily}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-indigo-400 bg-indigo-950/20 border border-indigo-900/30 px-1.5 py-0.5 rounded font-bold uppercase">
                                  {typo.languageCode} ({typo.writingDirection})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Style Motif & Composition Themes */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-teal-400" />
                          <span>Visual Style & Atmosphere Analysis</span>
                        </span>
                        <div className="p-4 bg-slate-900/40 rounded-lg border border-slate-850 space-y-3">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-400">Atmosphere Theme:</span>
                            <span className="text-slate-200 font-bold capitalize">{analysisResult.style.detectedTheme}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-400">Composition Type:</span>
                            <span className="text-slate-200 font-bold capitalize">{analysisResult.layout.compositionType}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-400">Symmetry Balance:</span>
                            <span className="text-emerald-400 font-bold">{(analysisResult.style.geometricSymmetryScore * 100).toFixed(0)}%</span>
                          </div>
                          <div className="border-t border-slate-850 pt-2 text-xs font-mono text-slate-400 leading-relaxed text-left">
                            <strong>Style Motif:</strong> {analysisResult.style.primaryMotif}
                          </div>
                        </div>
                      </div>

                      {/* Recommended Downstream AI Tasks */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Downstream AI Design Recommendations</span>
                        </span>
                        <div className="space-y-1.5">
                          {analysisResult.recommendedDownstreamTasks.map((task: string, idx: number) => (
                            <div key={idx} className="p-2.5 bg-slate-900/30 border border-slate-850 rounded-lg text-[10px] font-mono text-slate-300 flex items-start gap-2 text-left">
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 rounded-xl border border-slate-850 flex-1 flex flex-col items-center justify-center p-12 text-center">
                    {isAnalyzing ? (
                      <div className="space-y-4">
                        <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                        <div className="space-y-1">
                          <p className="text-xs font-mono font-bold text-slate-200 uppercase">Processing Visual Assets...</p>
                          <p className="text-[10px] text-slate-500 font-mono">STAGED ANALYSIS: STEP {analysisProgress / 8} OF 12</p>
                        </div>
                        <div className="w-48 bg-slate-900 h-1.5 rounded-full overflow-hidden mx-auto">
                          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${analysisProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
                        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">No Active Analysis Loaded</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                          Select one of the preset canvas layout SVGs or upload your own file, then run a synchronous analysis block to display results.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "queue" && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
            >
              {/* Jobs History Queue Panel */}
              <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-850 p-5 flex flex-col h-full min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Active Queued Jobs</span>
                  </h4>
                  <button
                    onClick={fetchJobs}
                    className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-xs font-mono">
                      No jobs currently in processing.
                    </div>
                  ) : (
                    jobs.map(job => (
                      <button
                        key={job.jobId}
                        onClick={() => setSelectedJob(job)}
                        className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                          selectedJob?.jobId === job.jobId ? "bg-indigo-950/20 border-indigo-500/40 text-slate-100" : "bg-slate-900/40 border-slate-850 text-slate-400"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-200 truncate">{job.originalFileName}</span>
                            <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase ${
                              job.priority === "high" ? "bg-rose-950 text-rose-400 border border-rose-900/30" : "bg-slate-800 text-slate-400"
                            }`}>
                              {job.priority}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                            <span>ID: {job.jobId}</span>
                            <span>•</span>
                            <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {job.status === "completed" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                          {job.status === "failed" && <XCircle className="w-4 h-4 text-rose-400" />}
                          {job.status === "cancelled" && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                          {job.status === "processing" && (
                            <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>{job.progress}%</span>
                            </div>
                          )}
                          {job.status === "queued" && <Clock className="w-4 h-4 text-slate-500" />}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Specific Job Detail View */}
              <div className="lg:col-span-7 h-full min-h-[400px]">
                {selectedJob ? (
                  <div className="bg-slate-950 rounded-xl border border-slate-850 p-5 flex flex-col h-full text-left">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                      <div>
                        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase truncate">
                          {selectedJob.originalFileName}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-500 block mt-0.5">Job ID: {selectedJob.jobId}</span>
                      </div>

                      {/* Cancel operation if job is queued or running */}
                      {(selectedJob.status === "queued" || selectedJob.status === "processing") && (
                        <button
                          onClick={() => handleCancelJob(selectedJob.jobId)}
                          className="px-3 py-1 bg-rose-950/40 hover:bg-rose-950 border border-rose-900/30 hover:border-rose-800 text-rose-400 rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer"
                        >
                          Cancel Job
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4">
                      {/* Job Parameters */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850/60 text-xs font-mono">
                          <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Priority</span>
                          <span className="text-slate-200 font-bold block mt-0.5 capitalize">{selectedJob.priority}</span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850/60 text-xs font-mono">
                          <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Status</span>
                          <span className="text-slate-200 font-bold block mt-0.5 capitalize">{selectedJob.status}</span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850/60 text-xs font-mono">
                          <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Retries</span>
                          <span className="text-slate-200 font-bold block mt-0.5 uppercase">{selectedJob.retryCount}/2</span>
                        </div>
                      </div>

                      {selectedJob.status === "completed" && selectedJob.result ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-emerald-950/10 border border-emerald-950 rounded-lg text-xs font-mono text-slate-300">
                            <strong>Analysis Success:</strong> Fully unpacked metadata package with confidence {Math.round(selectedJob.result.confidenceScore * 100)}%. Ready for downstream vector transformations.
                          </div>

                          {/* Quick summary points */}
                          <div className="space-y-1 text-xs font-mono">
                            <div className="flex justify-between p-2 bg-slate-900 rounded">
                              <span className="text-slate-500">Document Classification:</span>
                              <span className="text-slate-200 font-bold capitalize">{selectedJob.result.documentType}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-900 rounded">
                              <span className="text-slate-500">Mime-Type Detected:</span>
                              <span className="text-slate-200 font-bold">{selectedJob.result.metadata.mimeType}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-900 rounded">
                              <span className="text-slate-500">Languages Detected:</span>
                              <span className="text-indigo-400 font-bold uppercase">{selectedJob.result.languagesDetected.join(", ")}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-900 rounded">
                              <span className="text-slate-500">Writing Direction:</span>
                              <span className="text-slate-200 font-bold uppercase">{selectedJob.result.primaryDirection}</span>
                            </div>
                          </div>
                        </div>
                      ) : selectedJob.status === "failed" ? (
                        <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-lg flex items-start gap-2.5">
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div className="space-y-1 text-left text-xs font-mono">
                            <span className="text-rose-400 font-bold">Execution Failed</span>
                            <p className="text-slate-400 leading-relaxed">{selectedJob.errorMessage}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                          <p className="text-xs font-mono text-slate-400">
                            Job is currently {selectedJob.status}. Please wait for staged pipeline worker thread.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 rounded-xl border border-slate-850 flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
                    <Clock className="w-10 h-10 text-slate-600 mb-3" />
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">No Job Selected</h4>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                      Select a visual job from the active processing history queue to monitor live progress details and retrieve JSON payload contracts.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "metrics" && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Traversed</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-slate-100 mt-2">{metrics?.totalAnalyzed || 0}</p>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">Accumulated sessions</span>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Success Rate</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-emerald-400 mt-2">
                    {metrics ? `${Math.round(metrics.successRate * 100)}%` : "100%"}
                  </p>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">Assertion integrity</span>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Average Latency</span>
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-slate-100 mt-2">
                    {metrics?.averageLatencyMs || 0}ms
                  </p>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">Local execution speed</span>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Model Health</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-emerald-400 mt-2 capitalize">
                    {metrics?.modelHealthStatus || "Healthy"}
                  </p>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 block">Orchestrator feedback</span>
                </div>
              </div>

              {/* Deep Distribution Matrices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 text-left space-y-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                    Document Type Allocations
                  </h4>
                  <div className="space-y-2">
                    {metrics && Object.keys(metrics.byDocumentType).length > 0 ? (
                      Object.entries(metrics.byDocumentType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-xs font-mono p-2 bg-slate-900 rounded">
                          <span className="text-slate-400 capitalize">{type}</span>
                          <span className="text-slate-200 font-bold">{count as number}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs font-mono text-slate-600 text-center py-6">No distribution files processed yet.</div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 text-left space-y-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                    Multi-lingual Frequency Audit
                  </h4>
                  <div className="space-y-2">
                    {metrics && Object.keys(metrics.byLanguage).length > 0 ? (
                      Object.entries(metrics.byLanguage).map(([lang, count]) => (
                        <div key={lang} className="flex justify-between items-center text-xs font-mono p-2 bg-slate-900 rounded">
                          <span className="text-slate-400 uppercase">{lang}</span>
                          <span className="text-slate-200 font-bold">{count as number}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs font-mono text-slate-600 text-center py-6">No language scripts indexed yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "comparator" && (
            <motion.div
              key="comparator"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Selector Bar */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1.5 text-left">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Select Version A Job</label>
                  <select
                    value={compareJobA}
                    onChange={(e) => setCompareJobA(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Completed Job --</option>
                    {jobs.filter(j => j.status === "completed").map(j => (
                      <option key={j.jobId} value={j.jobId}>
                        {j.originalFileName} ({new Date(j.createdAt).toLocaleTimeString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 space-y-1.5 text-left">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Select Version B Job</label>
                  <select
                    value={compareJobB}
                    onChange={(e) => setCompareJobB(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Completed Job --</option>
                    {jobs.filter(j => j.status === "completed").map(j => (
                      <option key={j.jobId} value={j.jobId}>
                        {j.originalFileName} ({new Date(j.createdAt).toLocaleTimeString()})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCompare}
                  disabled={isComparing || !compareJobA || !compareJobB}
                  className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  {isComparing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
                  <span>COMPARE VERSIONS</span>
                </button>
              </div>

              {/* Comparative Audit Result Box */}
              {compareDiff ? (
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4 text-left">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <GitCompare className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                      Comparative Audit Diff Logs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-850/60 space-y-3 font-mono text-xs">
                      <div className="flex justify-between border-b border-slate-850/40 pb-1.5">
                        <span className="text-slate-500">Document Type Mutation:</span>
                        <span className={compareDiff.docTypeChanged ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                          {compareDiff.docTypeChanged ? "MUTATED" : "IDENTICAL"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Version A Type:</span>
                        <span className="text-slate-300 font-bold capitalize">{compareDiff.typeA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Version B Type:</span>
                        <span className="text-slate-300 font-bold capitalize">{compareDiff.typeB}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-850/60 space-y-3 font-mono text-xs">
                      <div className="flex justify-between border-b border-slate-850/40 pb-1.5">
                        <span className="text-slate-500">Confidence Shift Metrics:</span>
                        <span className={compareDiff.confidenceShift >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {compareDiff.confidenceShift >= 0 ? `+${compareDiff.confidenceShift * 100}%` : `${compareDiff.confidenceShift * 100}%`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Extracted Colors Added:</span>
                        <span className="text-slate-300 font-bold">{compareDiff.colorDiffCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Extracted Text Modifications:</span>
                        <span className="text-indigo-400 font-bold">{compareDiff.textDiffCount}</span>
                      </div>
                    </div>
                  </div>

                  {compareDiff.addedText.length > 0 && (
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 space-y-1.5 text-xs font-mono">
                      <span className="text-slate-500 font-bold block uppercase tracking-wider text-[9px]">Text Segment Mutations Detected:</span>
                      <div className="space-y-1">
                        {compareDiff.addedText.map((txt: string, idx: number) => (
                          <div key={idx} className="p-1.5 bg-indigo-950/20 border border-indigo-900/30 rounded text-indigo-300 text-[10px]">
                            + {txt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-950 p-12 rounded-xl border border-slate-850 text-center">
                  <GitCompare className="w-8 h-8 text-slate-600 mb-2.5 mx-auto" />
                  <p className="text-xs font-mono text-slate-400">
                    Select two completed jobs from the history registers above to trigger an automated design audit.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "tests" && (
            <motion.div
              key="tests"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              {/* Test runner top controls */}
              <div className="flex items-center justify-between mb-1">
                <div className="space-y-0.5 text-left">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Visual Test Runner & Assertions Console</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Verify input validation filters, quality metrics, layout parameters, priority worker threads and contract JSON integrity.
                  </p>
                </div>

                <button
                  onClick={handleRunTests}
                  disabled={testsRunning}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-emerald-500/5"
                >
                  {testsRunning ? <RefreshCw className="w-3 animate-spin" /> : "RUN ASSERTIONS"}
                </button>
              </div>

              {/* Console window */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 font-mono text-[10px] space-y-4 flex flex-col h-[480px]">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 text-[9px] text-slate-500">
                  <span>Visual Platform Test Assertions v2.0.0</span>
                  {testSummary && (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/40 font-bold">
                        {testSummary.passed} PASSED
                      </span>
                      {testSummary.failed > 0 && (
                        <span className="text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/40 font-bold">
                          {testSummary.failed} FAILED
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 text-left">
                  {testResults.length === 0 ? (
                    <div className="text-slate-600 italic py-12 text-center text-xs">
                      {testsRunning ? "Running verification checks on all visual stages..." : "Click 'RUN ASSERTIONS' above to verify visual architecture integrity."}
                    </div>
                  ) : (
                    testResults.map((result, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-4 ${
                          result.status === "passed"
                            ? "bg-emerald-950/10 border-emerald-950/30 text-emerald-400/90"
                            : "bg-rose-950/15 border-rose-950/30 text-rose-400"
                        }`}
                      >
                        <div className="min-w-0 flex items-start gap-2.5">
                          {result.status === "passed" ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-0.5 text-left">
                            <span className="text-slate-200 font-bold text-[10px] block">{result.name}</span>
                            <span className="text-[9px] text-slate-500">Category: {result.category}</span>
                            {result.message && <p className="text-[9px] text-rose-400 mt-1 leading-normal">{result.message}</p>}
                          </div>
                        </div>

                        <div className="text-right shrink-0 text-slate-500 text-[9px] font-bold">
                          {result.latencyMs}ms
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default VisualIntelligenceDashboard;
