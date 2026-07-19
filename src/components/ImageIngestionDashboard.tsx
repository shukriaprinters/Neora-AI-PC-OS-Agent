import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  AlertTriangle,
  FileImage,
  Layers,
  Search,
  Activity,
  Play,
  RotateCw,
  Trash2,
  ShieldAlert,
  Sliders,
  Database,
  Grid,
  Sparkles,
  RefreshCw,
  Terminal,
  Clock,
  ExternalLink
} from "lucide-react";
import { ingestionQueue } from "../lib/ai/ingestion/IngestionQueue.ts";
import { IngestionJob, IngestionStatus, IngestionFormat } from "../lib/ai/ingestion/types.ts";
import { IngestionTestSuite, TestResult } from "../lib/ai/ingestion/IngestionTestSuite.ts";

export const ImageIngestionDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<IngestionJob | null>(null);
  const [metrics, setMetrics] = useState(ingestionQueue.getMetrics());
  
  // Custom mock configuration states
  const [testSuiteResults, setTestSuiteResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showTestsPanel, setShowTestsPanel] = useState(false);

  // Form custom upload mock states
  const [customFileName, setCustomFileName] = useState("banner_concept_draft_2026.png");
  const [customFormat, setCustomFormat] = useState<string>("png");
  const [customSizeMb, setCustomSizeMb] = useState<number>(3.5);
  const [simulationProfile, setSimulationProfile] = useState<string>("standard");

  // Load and subscribe to real-time events
  useEffect(() => {
    setJobs(ingestionQueue.getJobs());
    setMetrics(ingestionQueue.getMetrics());

    const unsubscribe = ingestionQueue.subscribe(() => {
      setJobs(ingestionQueue.getJobs());
      setMetrics(ingestionQueue.getMetrics());
    });

    return () => unsubscribe();
  }, []);

  // Sync selected job references when updated in queue
  useEffect(() => {
    if (selectedJob) {
      const live = jobs.find((j) => j.jobId === selectedJob.jobId);
      if (live) setSelectedJob(live);
    }
  }, [jobs, selectedJob]);

  // Execute test suite run
  const handleRunTests = async () => {
    setIsRunningTests(true);
    const suite = new IngestionTestSuite();
    const results = await suite.runAllTests();
    setTestSuiteResults(results);
    setIsRunningTests(false);
    setShowTestsPanel(true);
  };

  // Upload trigger handler
  const handleUploadSimulation = async () => {
    let rawContentStr = "Standard mockup canvas pixels byte stream content";
    let fileName = customFileName;

    // Apply simulation presets to the fake byte content
    if (simulationProfile === "virus") {
      fileName = "malicious_virus_indicator.png";
      rawContentStr = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
    } else if (simulationProfile === "xml_bomb") {
      fileName = "xml_bomb_attack.svg";
      rawContentStr = `<?xml version="1.0"?>
      <!DOCTYPE svg [
        <!ENTITY lol "lol">
        <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;">
      ]>
      <svg width="100" height="100"><text>&lol2;</text></svg>`;
    } else if (simulationProfile === "script_injection") {
      fileName = "xss_injection.svg";
      rawContentStr = `<svg width="100" height="100"><script>alert('malicious script executed')</script></svg>`;
    } else if (simulationProfile === "header_spoof") {
      fileName = "fake_extension.jpg";
      // Starts with PNG magic byte, but claims to be jpeg file
      rawContentStr = "\x89PNG\r\n\x1a\nFake JPEG extension simulation spoofing check";
    }

    const buffer = Buffer.from(rawContentStr);
    const jobId = await ingestionQueue.submitAsset(fileName, buffer, "high");
    const newJob = ingestionQueue.getJob(jobId);
    if (newJob) setSelectedJob(newJob);
  };

  const handleDeleteAsset = (id: string) => {
    ingestionQueue.deleteAsset(id);
    setJobs(ingestionQueue.getJobs());
    setMetrics(ingestionQueue.getMetrics());
    if (selectedJob?.jobId === id) {
      setSelectedJob(null);
    }
  };

  const getStatusColor = (status: IngestionStatus) => {
    switch (status) {
      case IngestionStatus.QUEUED: return "text-zinc-400 bg-zinc-800/50 border-zinc-700";
      case IngestionStatus.VIRUS_SCANNING: return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case IngestionStatus.VALIDATING: return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      case IngestionStatus.NORMALIZING: return "text-indigo-400 bg-indigo-500/10 border-indigo-500/30";
      case IngestionStatus.DUPLICATE_CHECKING: return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case IngestionStatus.GENERATING_PREVIEWS: return "text-purple-400 bg-purple-500/10 border-purple-500/30";
      case IngestionStatus.COMPLETED: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case IngestionStatus.FAILED: return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default: return "text-zinc-400 bg-zinc-800/50 border-zinc-700";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div id="image-ingestion-section" className="space-y-6 mt-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              Phase 2.1.2 — Core Engine
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50">
              Live WebSocket Simulated
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">Image Ingestion Pipeline & Asset Normalization</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enterprise-grade sandboxed parser. Cleans, checks integrity, hashes visual signatures, and builds mipmap previews safely.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-700 transition font-mono"
          >
            {isRunningTests ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            )}
            Run Pipeline Assertions
          </button>
        </div>
      </div>

      {/* METRIC SHIELD ACCENTS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-mono">Ingested Assets</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white mt-2">{metrics.totalIngested}</div>
          <div className="text-[10px] text-zinc-400 mt-1">Processed successfully</div>
        </div>

        <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-mono">Active Queues</span>
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white mt-2">{metrics.activeQueueLength}</div>
          <div className="text-[10px] text-cyan-400 mt-1">Workers status: <span className="font-mono">{metrics.workerStatus}</span></div>
        </div>

        <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-mono">Near Duplicates</span>
            <Search className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white mt-2">{metrics.totalDuplicatesDetected}</div>
          <div className="text-[10px] text-zinc-400 mt-1">Similarity hash flags</div>
        </div>

        <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-mono">Total Bytes Stack</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white mt-2">{formatBytes(metrics.storageUsageBytes)}</div>
          <div className="text-[10px] text-zinc-400 mt-1">Abstract storage capacity</div>
        </div>
      </div>

      {/* ASSERTION UNIT TESTS WIDGET */}
      <AnimatePresence>
        {showTestsPanel && testSuiteResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-zinc-900/60 border border-indigo-900/40"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Automated Security & Validation Test Suite Results</span>
              </div>
              <button
                onClick={() => setShowTestsPanel(false)}
                className="text-xs text-zinc-500 hover:text-white"
              >
                Dismiss
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
              {testSuiteResults.map((t, idx) => (
                <div key={idx} className="flex items-start justify-between p-2 rounded bg-zinc-950/50 border border-zinc-800">
                  <div className="pr-3">
                    <p className="text-xs font-medium text-zinc-200">{t.name}</p>
                    <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-zinc-900 text-zinc-500">
                      {t.category} • {t.durationMs}ms
                    </span>
                  </div>
                  <div>
                    {t.passed ? (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> PASSED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> FAILED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE INTERACTIVE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SIMULATION INTAKE CONTROLS (4 COLS) */}
        <div className="lg:col-span-4 bg-zinc-950/40 p-5 rounded-lg border border-zinc-800/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold tracking-tight text-white font-mono uppercase">Simulation Engine Control</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Preset Threat Profiles</label>
              <select
                value={simulationProfile}
                onChange={(e) => setSimulationProfile(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="standard">Standard Safe (High-Res Template)</option>
                <option value="header_spoof">MIME extension spoof (PNG header as JPG)</option>
                <option value="xml_bomb">Vector Zip/XML bomb indicator (Entity expansion)</option>
                <option value="script_injection">Cross-site SVG script execution threat</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Simulation File Name</label>
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Format</label>
                <select
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="svg">SVG</option>
                  <option value="psd">PSD</option>
                  <option value="gif">GIF</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">File Size</label>
                <input
                  type="number"
                  step="0.1"
                  value={customSizeMb}
                  onChange={(e) => setCustomSizeMb(parseFloat(e.target.value) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleUploadSimulation}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2 rounded transition font-mono shadow-sm"
            >
              <Play className="w-3.5 h-3.5" /> Submit Custom Asset to Queue
            </button>
          </div>

          <div className="bg-zinc-900/40 p-3 rounded border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
            <p className="font-mono text-zinc-300 font-bold uppercase text-[9px] text-indigo-400">Security Guardrails</p>
            <p>• Reject payloads &gt; 50MB</p>
            <p>• Enforce strict byte verification</p>
            <p>• Strip scripting elements automatically</p>
            <p>• Isolated Sandbox execution simulation</p>
          </div>
        </div>

        {/* MIDDLE COLUMN: LIVE PIPELINE QUEUE (4 COLS) */}
        <div className="lg:col-span-4 bg-zinc-950/40 p-5 rounded-lg border border-zinc-800/80 space-y-3 flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold tracking-tight text-white font-mono uppercase">Live Queue Tracker</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900">
              {jobs.length} total
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-xs font-mono">
                No active ingestion workflows detected
              </div>
            ) : (
              jobs.map((j) => {
                const isSelected = selectedJob?.jobId === j.jobId;
                return (
                  <div
                    key={j.jobId}
                    onClick={() => setSelectedJob(j)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? "bg-zinc-900 border-indigo-500/80 shadow-md"
                        : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="pr-2 max-w-[80%]">
                        <p className="text-xs font-bold text-white truncate">{j.fileName}</p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          ID: {j.jobId} • {formatBytes(j.originalSize)}
                        </p>
                      </div>
                      <span className={`text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded border ${getStatusColor(j.status)}`}>
                        {j.status.replace("_", " ")}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    {j.progress < 100 && (
                      <div className="w-full bg-zinc-900 rounded-full h-1 mt-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${j.progress}%` }}
                        ></div>
                      </div>
                    )}

                    {/* Display Failure Cause */}
                    {j.status === IngestionStatus.FAILED && j.errorMessage && (
                      <p className="text-[10px] text-rose-400 font-mono mt-2 bg-rose-950/20 p-1 border border-rose-900/30 rounded">
                        Error: {j.errorMessage}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR DETAILS PANEL (4 COLS) */}
        <div className="lg:col-span-4 bg-zinc-950/40 p-5 rounded-lg border border-zinc-800/80 flex flex-col h-[520px]">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Search className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight text-white font-mono uppercase">Asset Metadata Inspector</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-3">
            {selectedJob ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedJob.fileName}</h4>
                    <span className="text-[9px] font-mono text-zinc-500">
                      Hash ID: {selectedJob.fingerprint?.sha256?.substring(0, 16) || "Pending"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAsset(selectedJob.jobId)}
                    className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Previews / Render Mock Cards */}
                {selectedJob.status === IngestionStatus.COMPLETED && selectedJob.metadata ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-10"></div>
                      <FileImage className="w-12 h-12 text-indigo-400/30" />
                      
                      <div className="absolute bottom-2 left-2 z-20">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-950/80 text-white border border-zinc-800">
                          {selectedJob.metadata.width} x {selectedJob.metadata.height} ({selectedJob.metadata.aspectRatio})
                        </span>
                      </div>
                    </div>

                    {/* Metadata table list */}
                    <div className="space-y-2 bg-zinc-900/60 p-3 rounded border border-zinc-800/60 text-xs">
                      <div className="flex justify-between border-b border-zinc-800/50 pb-1">
                        <span className="text-zinc-500">Color Profile</span>
                        <span className="text-zinc-200 font-mono">{selectedJob.metadata.colorSpace}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800/50 pb-1">
                        <span className="text-zinc-500">Alpha Channel</span>
                        <span className="text-zinc-200 font-mono">
                          {selectedJob.metadata.hasAlphaChannel ? "True (Standard RGBA)" : "False (Pristine RGB)"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800/50 pb-1">
                        <span className="text-zinc-500">Format Signature</span>
                        <span className="text-emerald-400 font-bold uppercase">{selectedJob.metadata.format}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800/50 pb-1">
                        <span className="text-zinc-500">ICC Profile Name</span>
                        <span className="text-zinc-300 truncate max-w-[150px]">{selectedJob.metadata.iccProfileName || "None"}</span>
                      </div>
                      {selectedJob.metadata.layerCount !== undefined && (
                        <div className="flex justify-between border-b border-zinc-800/50 pb-1">
                          <span className="text-zinc-500">Parsed Layers</span>
                          <span className="text-zinc-200 font-mono">{selectedJob.metadata.layerCount} layers</span>
                        </div>
                      )}
                    </div>

                    {/* Visual Fingerprinting check */}
                    {selectedJob.fingerprint && (
                      <div className="space-y-1.5 p-3 rounded bg-indigo-950/10 border border-indigo-900/30">
                        <p className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Dynamic Hash Signatures</p>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-zinc-400">
                          <div>aHash: <span className="text-zinc-300">{selectedJob.fingerprint.aHash}</span></div>
                          <div>dHash: <span className="text-zinc-300">{selectedJob.fingerprint.dHash}</span></div>
                          <div className="col-span-2">pHash: <span className="text-zinc-300">{selectedJob.fingerprint.pHash}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Duplicate comparison results */}
                    {selectedJob.duplicates && selectedJob.duplicates.isNearDuplicate && (
                      <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 space-y-1">
                        <div className="flex items-center gap-1 font-bold">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Near Duplicate Detected
                        </div>
                        <p>Similarity Hash Match: {Math.round(selectedJob.duplicates.similarityScore * 100)}%</p>
                        <p className="text-[9px] text-zinc-400">Matching Asset: {selectedJob.duplicates.matchingAssetId}</p>
                      </div>
                    )}
                  </div>
                ) : selectedJob.status === IngestionStatus.FAILED ? (
                  <div className="text-center py-12">
                    <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto opacity-80" />
                    <h5 className="text-sm font-bold text-white mt-2">Ingestion Blocked</h5>
                    <p className="text-xs text-rose-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                      {selectedJob.errorMessage || "Security threat detected or file corrupted"}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500 space-y-3">
                    <RotateCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-xs font-mono">Running pipeline workers...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-600 text-xs font-mono">
                Select any ingested job from the queue to inspect metadata metrics
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ImageIngestionDashboard;
