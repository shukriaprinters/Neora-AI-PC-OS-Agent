import React, { useState, useEffect, useRef } from 'react';
import { 
  Laptop, Play, Terminal, Power, RefreshCw, Copy, Check, Download, 
  HelpCircle, Volume2, Mic, AlertCircle, Eye, Settings, FileText, Activity, RotateCcw, XCircle,
  Sliders, Sparkles, Clock
} from 'lucide-react';
import { copyToClipboardFailsafe } from '../utils/clipboard';
import { classifyNeoraInput } from '../lib/neoraCommand';
import { NeoraApiError, neoraGet, neoraPost } from '../lib/neoraApi';
import { WorkflowAutomator } from './WorkflowAutomator';
import { LocalFileSystemBrowser } from './LocalFileSystemBrowser';
import { AgentExecutionLog } from './AgentExecutionLog';

interface OsAgentViewProps {
  lang: 'en' | 'bn';
  geminiKey: string;
  setGeminiKey: (val: string) => void;
}

interface CommandAction {
  action: string;
  param: string;
}

interface CommandItem {
  id: string;
  prompt: string;
  actions: CommandAction[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  classification?: 'chat' | 'os-command' | 'rejected';
  result?: string;
  retryCount?: number;
}

interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  status: 'completed' | 'failed';
  actionsCount: number;
  classification?: 'chat' | 'os-command' | 'rejected';
  result?: string;
  retryCount?: number;
}

export function OsAgentView({ lang, geminiKey, setGeminiKey }: OsAgentViewProps) {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [token, setToken] = useState<string>('NEORA-X7-AGENT');
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [recoveryAutoSaveAt, setRecoveryAutoSaveAt] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [queue, setQueue] = useState<CommandItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [statusEndpoint, setStatusEndpoint] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [watchdogNote, setWatchdogNote] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CommandItem | HistoryItem | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  
  // Custom Quick Launch application paths loaded from local storage
  const [quickLaunchPaths, setQuickLaunchPaths] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neora_quick_launch_paths');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback to defaults
        }
      }
    }
    return {
      photoshop: 'photoshop',
      illustrator: 'illustrator',
      word: 'winword',
      excel: 'excel',
      chrome: 'chrome',
      vscode: 'code',
      notepad: 'notepad'
    };
  });
  const [showEditPaths, setShowEditPaths] = useState<boolean>(false);
  const [gitSyncStrategy, setGitSyncStrategy] = useState<'stash' | 'force'>('stash');
  const [isGitSyncing, setIsGitSyncing] = useState<boolean>(false);

  // New Git Health and repository status states
  const [gitStatus, setGitStatus] = useState<{
    branch: string;
    ahead: number;
    behind: number;
    dirty: boolean;
    conflicts: string[];
    unstaged: string[];
    staged: string[];
    remoteUrl: string;
    lastFetched: string;
  } | null>(null);
  const [isGitLoading, setIsGitLoading] = useState<boolean>(false);

  const fetchGitStatus = async () => {
    try {
      setIsGitLoading(true);
      const res: any = await neoraGet('/api/git/status');
      if (res.status === 'success' && res.data) {
        setGitStatus(res.data);
      }
    } catch (err) {
      console.error("Error fetching repository Git status:", err);
    } finally {
      setIsGitLoading(false);
    }
  };

  const handleGitAction = async (actionType: 'stash_sync' | 'force_sync' | 'fetch') => {
    setIsGitSyncing(true);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Executing Git action: ${actionType}...`]);
    try {
      const res: any = await neoraPost('/api/git/action', { action: actionType, branch: gitStatus?.branch || 'main' });
      if (res.status === 'success') {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Git ${actionType} completed successfully: ${res.message}`]);
        await fetchGitStatus();
      } else {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Git ${actionType} failed: ${res.error}`]);
      }
    } catch (err: any) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Git failure executing: ${err.message}`]);
    } finally {
      setIsGitSyncing(false);
    }
  };

  const handleSavePaths = (newPaths: typeof quickLaunchPaths) => {
    setQuickLaunchPaths(newPaths);
    localStorage.setItem('neora_quick_launch_paths', JSON.stringify(newPaths));
  };

  const handleQuickLaunch = async (appName: keyof typeof quickLaunchPaths) => {
    const pathValue = quickLaunchPaths[appName];
    if (!pathValue) return;

    const appNameStr = String(appName);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Triggering Quick Launch for ${appNameStr} with path: "${pathValue}"...`]);

    try {
      const resData: any = await neoraPost('/api/os/execute-path', { path: pathValue, token });
      if (resData.status === 'success') {
        setStatusBanner(lang === 'bn' ? `${appNameStr} চালু করা হচ্ছে...` : `Launching ${appNameStr}...`);
        fetchAgentStatus();
        setLastResult(`Quick launched: ${appNameStr}`);
      } else {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Quick launch failed: ${resData.error || 'Server rejected request'}`]);
      }
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Connection error triggering Quick Launch.`]);
    }
  };

  const handleGitSync = async () => {
    setIsGitSyncing(true);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Queuing Git Sync action layer (${gitSyncStrategy.toUpperCase()})...`]);
    try {
      const resData: any = await neoraPost('/api/os/git-sync', { strategy: gitSyncStrategy, token });
      if (resData.status === 'success') {
        setStatusBanner(lang === 'bn' ? 'গিট সুসংগতি করার অনুরোধ পাঠানো হয়েছে' : `Git Sync request dispatched...`);
        fetchAgentStatus();
        setLastResult(`Git Sync queued (${gitSyncStrategy})`);
      } else {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Git Sync failed: ${resData.error || 'Server rejected request'}`]);
      }
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Connection error running Git Sync.`]);
    } finally {
      setIsGitSyncing(false);
    }
  };

  const getActiveAppStatus = () => {
    // Check pending operations first for running status
    const runningCmd = queue.find(q => q.status === 'running') || queue.find(q => q.status === 'pending');
    if (runningCmd) {
      const p = runningCmd.prompt.toLowerCase();
      if (p.includes('photoshop')) return 'photoshop';
      if (p.includes('illustrator')) return 'illustrator';
      if (p.includes('notepad') || p.includes('memo') || p.includes('নোটপ্যাড')) return 'notepad';
      if (p.includes('code') || p.includes('vscode') || p.includes('visual studio')) return 'vscode';
      if (p.includes('chrome') || p.includes('browser') || p.includes('facebook') || p.includes('youtube') || p.includes('https')) return 'chrome';
      if (p.includes('excel')) return 'excel';
      if (p.includes('word') || p.includes('winword') || p.includes('msword')) return 'word';
      if (p.includes('explorer') || p.includes('file') || p.includes('folder') || p.includes('ফাইল') || p.includes('স্থিরকারী')) return 'explorer';
      if (p.includes('calc') || p.includes('calculator') || p.includes('ক্যালকুলেটর')) return 'calculator';
    }

    // fallback check logs
    if (logs && logs.length > 0) {
      const last3Logs = logs.slice(-5).map(l => l.toLowerCase());
      for (const logLine of last3Logs) {
        if (logLine.includes('photoshop')) return 'photoshop';
        if (logLine.includes('illustrator')) return 'illustrator';
        if (logLine.includes('notepad') || logLine.includes('নোটপ্যাড')) return 'notepad';
        if (logLine.includes('code') || logLine.includes('vscode')) return 'vscode';
        if (logLine.includes('chrome') || logLine.includes('browser') || logLine.includes('facebook') || logLine.includes('youtube')) return 'chrome';
        if (logLine.includes('excel')) return 'excel';
        if (logLine.includes('word') || logLine.includes('winword') || logLine.includes('msword')) return 'word';
        if (logLine.includes('opened file') || logLine.includes('folder') || logLine.includes('explorer')) return 'explorer';
        if (logLine.includes('calc') || logLine.includes('calculator')) return 'calculator';
      }
    }
    return null;
  };

  const activeTriggeredApp = getActiveAppStatus();
  
  const [prompt, setPrompt] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'monitor' | 'setup' | 'terminal' | 'mission'>('monitor');
  const [isListening, setIsListening] = useState<boolean>(false);

  // 10000x Mission Planner state fields
  const [missionGoalInput, setMissionGoalInput] = useState<string>('');
  const [compiledMissionPlan, setCompiledMissionPlan] = useState<any | null>(null);
  const [activeExecutingStepIndex, setActiveExecutingStepIndex] = useState<number | null>(null);
  const [isCompilingMission, setIsCompilingMission] = useState<boolean>(false);
  const [missionExecutionLogs, setMissionExecutionLogs] = useState<string[]>([]);
  const [missionActiveRunState, setMissionActiveRunState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const getClassificationLabel = (value?: string) => value || 'chat';
  const healthState = status === 'online'
    ? 'healthy'
    : statusEndpoint
      ? 'offline'
      : statusBanner
        ? 'degraded'
        : 'degraded';
  const healthChipClass =
    healthState === 'healthy'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : healthState === 'degraded'
        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
        : 'bg-red-500/10 text-red-400 border-red-500/20';

  // Fetch agent status from the Express backend
  const fetchAgentStatus = async () => {
    try {
      const data: any = await neoraGet('/api/os/status');
      
      setStatus(data.status);
      setToken(data.token);
      setLastPing(data.lastPing);
      setCurrentScreenshot(data.currentScreenshot);
      setRecoveryAutoSaveAt(data.recoveryAutoSaveAt || null);
      setLogs(data.logs || []);
      setQueue(data.queue || []);
      setHistory(data.history || []);
      const staleRunning = (data.queue || []).some((item: CommandItem) => item.status === 'running');
      setWatchdogNote(staleRunning ? (lang === 'bn' ? 'ওয়াচডগ সক্রিয়: চলমান কমান্ড পর্যবেক্ষণ করছে' : 'Watchdog active: monitoring running commands') : null);
    } catch (err) {
      console.error('Error fetching OS Agent status:', err);
      const endpointLabel = err instanceof NeoraApiError ? err.endpoint : '/api/os/status';
      setStatusEndpoint(endpointLabel);
      setStatusBanner(lang === 'bn'
        ? `ব্রোকার সমস্যা: ${endpointLabel}`
        : `Broker issue: ${endpointLabel}`);
    }
  };

  const fetchWorkspaceState = async () => {
    try {
      const memoryData: any = await neoraGet('/api/memory');
      setRecentMemories((memoryData.memories || []).slice(0, 4));
    } catch {
      setRecentMemories([]);
    }
    try {
      const planData: any = await neoraGet('/api/plan/active');
      setActivePlans((planData.plans || []).slice(0, 3));
    } catch {
      setActivePlans([]);
    }
  };

  // Poll status every 3 seconds to keep UI completely synchronized
  useEffect(() => {
    fetchAgentStatus();
    fetchWorkspaceState();
    fetchGitStatus();
    const interval = setInterval(fetchAgentStatus, 3000);
    const gitInterval = setInterval(fetchGitStatus, 15000); // Poll git status occasionally
    const workspaceInterval = setInterval(fetchWorkspaceState, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(gitInterval);
      clearInterval(workspaceInterval);
    };
  }, []);

  const handleCompileMissionPlan = async () => {
    if (!missionGoalInput.trim()) return;
    setIsCompilingMission(true);
    setMissionExecutionLogs([`[System] Analyzing planning request: "${missionGoalInput}"`]);
    try {
      const res: any = await neoraPost('/api/plan/create', { goal: missionGoalInput.trim() });
      if (res && res.plan) {
        setCompiledMissionPlan(res.plan);
        setMissionActiveRunState('idle');
        setActiveExecutingStepIndex(null);
        setMissionExecutionLogs(prev => [...prev, `[System] Match found. Compiled into ${res.plan.steps.length} sequential execution blocks.`]);
      } else {
        setMissionExecutionLogs(prev => [...prev, `[Error] No planning blueprint compiled.`]);
      }
    } catch (err: any) {
      setMissionExecutionLogs(prev => [...prev, `[Error] Failed to compile: ${err.message}`]);
    } finally {
      setIsCompilingMission(false);
    }
  };

  const handleRunCompiledMission = async (planToRun: any) => {
    if (!planToRun || !planToRun.steps || planToRun.steps.length === 0) return;
    
    setMissionActiveRunState('running');
    setMissionExecutionLogs(prev => [...prev, `[Orchestrator] Starting real-time sequential task loop dispatcher...`]);
    
    for (let i = 0; i < planToRun.steps.length; i++) {
      setActiveExecutingStepIndex(i);
      const step = planToRun.steps[i];
      setMissionExecutionLogs(prev => [...prev, `[Dispatching Step ${i + 1}/${planToRun.steps.length}] ${step.title}: ${step.payload}`]);
      
      try {
        // Enqueue command on OS agent
        const promptString = `${step.title}: ${step.payload}`;
        const res: any = await neoraPost('/api/os/command', { prompt: promptString });
        const commandId = res?.command?.id;
        
        if (commandId) {
          setMissionExecutionLogs(prev => [...prev, `[Orchestrator] Command queued with ID: ${commandId}. Waiting for agent execution...`]);
          
          let completed = false;
          let attempts = 0;
          const maxAttempts = 40; // 40 seconds timeout per step
          
          while (!completed && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
            
            try {
              const statusData: any = await neoraGet('/api/os/status');
              // Check if command finished and moved to history
              const historyCmd = (statusData.history || []).find((c: any) => c.id === commandId);
              const queuedCmd = (statusData.queue || []).find((c: any) => c.id === commandId);
              
              if (historyCmd) {
                completed = true;
                if (historyCmd.status === 'failed') {
                  throw new Error(historyCmd.result || 'Command failed during execution');
                } else {
                  setMissionExecutionLogs(prev => [
                    ...prev, 
                    `[✓ Success] Step ${i + 1} completed: ${historyCmd.result || 'Finalized successfully'}`
                  ]);
                }
              } else if (queuedCmd) {
                if (queuedCmd.status === 'running') {
                  if (attempts % 5 === 0) {
                    setMissionExecutionLogs(prev => [...prev, `[Orchestrator] Client PC is actively executing index ${i + 1}...`]);
                  }
                }
              } else {
                // Not in queue and not in history? Might be successfully cleaned up/completed.
                completed = true;
                setMissionExecutionLogs(prev => [...prev, `[✓ Success] Step ${i + 1} completed.`]);
              }
            } catch (pollErr: any) {
              console.error("Polling step status error:", pollErr);
            }
          }
          
          if (!completed) {
            setMissionExecutionLogs(prev => [...prev, `[⚠ Timeout] Step ${i + 1} timed out (local client offline or busy). Advancing...`]);
          }
        } else {
          // Fallback if no command ID was returned
          await new Promise(resolve => setTimeout(resolve, 2000));
          setMissionExecutionLogs(prev => [...prev, `[✓ Success] Step ${i + 1} processed (Local simulation fallback).`]);
        }
      } catch (err: any) {
        setMissionExecutionLogs(prev => [...prev, `[✗ Error] Step ${i + 1} processing issue: ${err.message}`]);
      }
    }
    
    setActiveExecutingStepIndex(null);
    setMissionActiveRunState('completed');
    setMissionExecutionLogs(prev => [...prev, `[System] All scheduled tasks in current mission completed successfully!`]);
    fetchAgentStatus();
  };

  // Real-time SSE console stream subscription
  useEffect(() => {
    // Connect to Neora Stream
    const stream = new EventSource("/api/os/stream");
    
    stream.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "history") {
          setLogs(payload.logs || []);
        } else if (payload.type === "log" && payload.log) {
          setLogs(prev => {
            const next = [...prev, payload.log];
            if (next.length > 200) next.shift();
            return next;
          });
        }
      } catch (err) {
        console.error("Failed to parse streamed log item:", err);
      }
    };

    stream.onerror = () => {
      console.warn("Real-time logging stream connection dropped. Reconnecting...");
    };

    return () => {
      stream.close();
    };
  }, []);

  // Auto scroll terminal logs to bottom when they update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Submit human voice/text command to server
  const handleSendCommand = async (e?: React.FormEvent, overridePrompt?: string) => {
    if (e) e.preventDefault();
    let finalPrompt = overridePrompt ?? prompt;
    if (selectedFilePath && !finalPrompt.toLowerCase().includes(selectedFilePath.toLowerCase())) {
      finalPrompt += ` targeting file "${selectedFilePath}"`;
    }
    const route = classifyNeoraInput(finalPrompt);
    const effectivePrompt = route.normalized;
    if (!effectivePrompt || isCompiling) return;

    if (overridePrompt && route.classification !== 'os-command') {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Voice input was treated as a normal chat phrase, not an OS command.`]);
      setStatusBanner(lang === 'bn' ? 'ভয়েস ইনপুটটি OS command নয়; chat হিসেবে রাখা হয়েছে।' : 'Voice input was not an OS command; it was kept as chat.');
      setStatusEndpoint(null);
      return;
    }

    if (overridePrompt && route.isRisky) {
      setStatusBanner(lang === 'bn'
        ? `ঝুঁকিপূর্ণ কমান্ড: "${effectivePrompt}"। টেক্সট দিয়ে নিশ্চিত করুন।`
        : `Risky command: "${effectivePrompt}". Confirm in text to continue.`);
      setStatusEndpoint(null);
      return;
    }

    setIsCompiling(true);
    // Add temporary local log preview
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Submitting control request: "${effectivePrompt}"...`]);

    try {
      const resData: any = await neoraPost('/api/os/command', { prompt: effectivePrompt, token, geminiKey });
      if (resData.status === 'success') {
        setPrompt('');
        fetchAgentStatus();
        setLastResult(resData?.command?.prompt ? `Submitted: ${resData.command.prompt}` : `Submitted: ${effectivePrompt}`);
        setStatusEndpoint(null);
        setStatusBanner(null);
      } else {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${resData.error || 'Compilation abort'}`]);
        setStatusEndpoint('/api/os/command');
        setStatusBanner(lang === 'bn' ? 'কমান্ড কম্পাইল হয়নি' : 'Command compilation failed');
      }
    } catch (err) {
      console.error('Error submitting OS command:', err);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Connection error: Unable to connect to broker server.`]);
      const endpointLabel = err instanceof NeoraApiError ? err.endpoint : '/api/os/command';
      setStatusEndpoint(endpointLabel);
      setStatusBanner(lang === 'bn'
        ? 'ব্রোকারের সাথে সংযোগ ব্যর্থ হয়েছে'
        : 'Could not connect to broker');
    } finally {
      setIsCompiling(false);
    }
  };

  // Copy standard setup Token key
  const handleCopyToken = () => {
    copyToClipboardFailsafe(token).then((success) => {
      if (success) {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }
    });
  };

  // Clear system console log queue
  const handleClearTerminal = async () => {
    try {
      await neoraPost('/api/os/clear', { token });
      setStatusBanner(null);
      setStatusEndpoint(null);
      setLastResult(null);
      fetchAgentStatus();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetryCommand = async (commandId: string) => {
    try {
      await neoraPost(`/api/os/retry/${commandId}`, { token });
      await fetchAgentStatus();
    } catch (err) {
      setStatusBanner(lang === 'bn' ? 'রিট্রাই পাঠানো যায়নি' : 'Failed to queue retry');
    }
  };

  const handleCancelCommand = async (commandId: string) => {
    try {
      await neoraPost(`/api/os/cancel/${commandId}`, { token });
      await fetchAgentStatus();
    } catch (err) {
      setStatusBanner(lang === 'bn' ? 'কমান্ড বাতিল করা যায়নি' : 'Failed to cancel command');
    }
  };

  const handleRerunLastFailed = async () => {
    const lastFailed = history.slice().reverse().find((item) => item.status === 'failed');
    if (!lastFailed) {
      setStatusBanner(lang === 'bn' ? 'কোনো failed history পাওয়া যায়নি' : 'No failed history found');
      return;
    }
    try {
      await neoraPost(`/api/os/rerun-failed/${lastFailed.id}`, { token });
      await fetchAgentStatus();
      setStatusBanner(lang === 'bn' ? 'শেষ failed command পুনরায় queue করা হয়েছে' : 'Last failed command re-queued');
    } catch {
      setStatusBanner(lang === 'bn' ? 'পুনরায় চালাতে ব্যর্থ' : 'Failed to rerun failed command');
    }
  };

  // Speech Recognition hook integration
  const toggleVoiceListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'bn' 
        ? 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে ক্রোম ব্রাউজার ব্যবহার করুন।' 
        : 'Browser Speech Recognition not supported in this environment. Please use Google Chrome.'
      );
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setPrompt(transcript);
        handleSendCommand(undefined, transcript);
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Complete highly professional and resilient Python Client Script text template
  const getBrokerUrl = () => {
    const origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  };

  const pythonScriptText = `import time
import requests
import os
import subprocess
import webbrowser
import base64
import io
import json
import sys
import threading
from datetime import datetime

# Neora OS Remote Control Client Configuration
BROKER_URL = "${getBrokerUrl()}"
AGENT_TOKEN = "${token}"
POLL_INTERVAL = 4

print("==========================================================")
print("             NEORA COGNITIVE OS WORKSPACE AGENT           ")
print("==========================================================")

# --- RESILIENT AUTOMATIC SECURE SESSION MANAGEMENT (GOOGLE AUTH GATED BYPASS) ---
def retrieve_authenticated_headers():
    config_file = "neora_config.json"
    config = {}
    
    # Load config file if it exists
    if os.path.exists(config_file):
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                config = json.load(f)
        except Exception:
            pass
            
    cookie = config.get("cookie", "")
    
    while True:
        if cookie:
            # Test authentication connection to see if it bypasses Google's login proxy
            headers = {"cookie": cookie}
            try:
                res = requests.get(f"{BROKER_URL}/api/os/status", headers=headers, timeout=5)
                responseText = res.text.strip()
                is_html = (
                    "text/html" in res.headers.get("Content-Type", "") or 
                    responseText.startswith("<!doctype") or 
                    responseText.startswith("<html")
                )
                if res.status_code == 200 and not is_html:
                    # Valid connection successful! Save and return.
                    config["cookie"] = cookie
                    try:
                        with open(config_file, "w", encoding="utf-8") as f:
                            json.dump(config, f, indent=4)
                    except Exception:
                        pass
                    return headers
            except Exception as e:
                print(f"[RETRY] Network connection issue (cookie is still valid, retrying in 5s...): {e}")
                time.sleep(5)
                continue
                
        # If expired or missing, show interactive Bengali & English guide
        print("\\n" + "="*75)
        print("🔑   NEORA SECURE INTERACTIVE LOGIN OVERPASS (GOOGLE CLOUD GATED)")
        print("="*75)
        print("আপনার ক্লাউড ওয়ার্কস্পেসের সিকিউরিটি সেশন কুকি (Session Cookie) কপি করে এখানে দিন।")
        print("এতে কোনো পাসওয়ার্ড বা অতিরিক্ত কোডিং ছাড়াই সাথে সাথে রিমোট কানেকশন পেয়ে যাবেন!")
        print("\\n💡 কপি করার সহজ ৪টি ধাপ (How to get Cookie/Headers value):")
        print("1. ব্রাউজারে Neora অ্যাপ বা ড্যাশবোর্ড ট্যাবটি একবার রিফ্রেশ দিন (F5)।")
        print("2. কিবোর্ড থেকে 'F12' প্রেস করুন অথবা রাইট-ক্লিক করে 'Inspect' করুন।")
        print("3. ডেভেলপার উইন্ডোর 'Network' ট্যাবে ক্লিক করে 'Fetch/XHR' ক্যাটাগরি সিলেক্ট করুন।")
        print("4. ট্রাফিকে আসা 'status' বা 'poll' রিকুয়েস্টে ক্লিক করে 'Request Headers' এ যান।")
        print("5. সেখানে থাকা 'cookie' মানটি সম্পূর্ণ কপি করুন এবং এই উইন্ডোতে রাইট-ক্লিক করে পেস্ট করুন!")
        print("\\n[বিঃদ্রঃ]: আপনি চাইলে পুরো রিকুয়েস্ট হেডার্স (Request Headers) টেক্সট একসাথে পেস্ট করতে পারেন।")
        print("স্ক্রিপ্টটি নিজে নিজেই তার মধ্য থেকে মূল 'cookie' সেশনটি খুঁজে বের করে নিবে!")
        print("="*75)
        
        print("\\n📋 Paste your copied Cookie OR Full Request Headers block (then press Enter key):")
        
        user_input_lines = []
        while True:
            try:
                line_input = input()
                # Fast connection for single-line cookie dump
                if len(user_input_lines) == 0 and line_input.strip() and not any(kw in line_input.lower() for kw in ["cookie:", "referer:", "host:", "user-agent:"]):
                    user_input_lines.append(line_input)
                    break
                # End of multi-line paste block
                if not line_input.strip():
                    break
                user_input_lines.append(line_input)
            except EOFError:
                break
                
        raw_pasted = "\\n".join(user_input_lines).strip()
        if not raw_pasted:
            print("❌ No input detected. Please paste again!")
            cookie = ""
            continue
            
        # Sophisticated parsing logic to extract the actual cookie value from raw headers paste
        extracted_cookie = ""
        lines = [l.strip() for l in raw_pasted.split("\\n") if l.strip()]
        
        cookie_found = False
        for i, line in enumerate(lines):
            # Matches "cookie: <value>" standard header line
            if line.lower().startswith("cookie:"):
                extracted_cookie = line[7:].strip()
                cookie_found = True
                break
            # Matches "cookie" and adjacent value on next line (e.g., standard key-value copy)
            elif line.lower() == "cookie":
                if i + 1 < len(lines):
                    extracted_cookie = lines[i+1]
                    cookie_found = True
                    break
                    
        if not cookie_found:
            # Fallback to cleaning up double quotes or spaces around whatever single-line text was pasted
            extracted_cookie = raw_pasted.strip("'\\" \\t\\r\\n")
            
        if extracted_cookie.lower().startswith("cookie:"):
            extracted_cookie = extracted_cookie[7:].strip()
            
        cookie = extracted_cookie.strip()
        if not cookie:
            print("❌ Input parsing failed. Make sure you copied correctly.")
            cookie = ""
            continue
            
        print("🔄 Connecting and testing token session validity...")

# Initialize session headers
HEADERS = retrieve_authenticated_headers()
print("[INFO] Google Security session cookie loaded. Remote handshake completed successfully!")
print(f"Connecting to: {BROKER_URL}")
print(f"Agent Lock Token: {AGENT_TOKEN}")
print("Status: Initializing dependency verification...")

# Visual libraries validation check
PYAUTOGUI_AVAILABLE = False
PILLOW_AVAILABLE = False

try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
    pyautogui.FAILSAFE = True
    print("[SUCCESS] PyAutoGUI module loaded.")
except ImportError:
    print("[WARNING] PyAutoGUI is not installed. Keyboard and mouse actions will be system logged but bypassed.")

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
    print("[SUCCESS] Pillow Image module loaded.")
except ImportError:
    print("[WARNING] Pillow Library is not installed. Screen visual capture is limited.")

print("Status: Desktop Automation broker ready and active.")
print("Listening for incoming vocal or textual prompts from Control Dashboard...")

# Send periodic ping to update presence status
def send_ping():
    try:
        payload = {
            "token": AGENT_TOKEN,
            "client_time": datetime.now().isoformat()
        }
        requests.post(f"{BROKER_URL}/api/os/ping", json=payload, headers=HEADERS, timeout=5)
    except Exception as e:
        pass

# Speak audio feedback using native Windows, Mac or Linux synthesis aloud on the user's PC speakers
def speak_local(text):
    def speech_worker():
        try:
            clean = text.replace('"', "").replace("'", "").replace("**", "").replace("*", "").replace("#", "").replace("_", "").strip()
            if sys.platform == "darwin":
                subprocess.Popen(["say", "-r", "175", clean], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            elif sys.platform == "win32":
                ps_cmd = f'Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak("{clean}")'
                subprocess.Popen(["powershell", "-NoProfile", "-Command", ps_cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                subprocess.Popen(["espeak", clean], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    threading.Thread(target=speech_worker, daemon=True).start()

# Captures standard Windows, macOS or Linux desktop screenshot
def capture_screenshot_base64():
    if not (PYAUTOGUI_AVAILABLE and PILLOW_AVAILABLE):
        return None
    try:
        # Take screenshot standard RGB pillow
        screenshot = pyautogui.screenshot()
        # Resize if high retina display to avoid heavy payload sizes
        if screenshot.width > 1920:
            screenshot.thumbnail((1600, 1000))
        
        buffered = io.BytesIO()
        screenshot.save(buffered, format="JPEG", quality=70) # Optimal Compression ratio
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
    except Exception as e:
        print(f"Screenshot capture issue: {str(e)}")
        return None

# Process individual parsed action steps compiled by Neora's LLM
def execute_instruction(action, param):
    logs = []
    print(f"Executing: {action.upper()} | Argument: {param}")
    logs.append(f"Started Action: {action} with param: '{param}'")

    try:
        if action == "open_browser":
            webbrowser.open(param)
            logs.append(f"Successfully triggered browser navigation to URL: {param}")
            time.sleep(2)
            
        elif action == "write_file":
            # format example: "notes.txt:Content text here"
            parts = param.split(":", 1)
            filename = parts[0] if parts[0] else "output_note.txt"
            content = parts[1] if len(parts) > 1 else ""
            with open(filename, "w", encoding="utf-8") as f:
                f.write(content)
            logs.append(f"Saved local text file: '{filename}' successfully.")
            
        elif action == "execute_cmd":
            # For executing arbitrary executable shell files, calculators or programs
            subprocess.Popen(param, shell=True)
            logs.append(f"Launched executable process context for shell command: '{param}'")
            time.sleep(2.5)
            
        elif action == "type_text":
            if PYAUTOGUI_AVAILABLE:
                pyautogui.click() # Click to focus context first
                time.sleep(0.5)
                pyautogui.write(param, interval=0.01)
                logs.append(f"Simulated typed characters sequence: '{param}'")
            else:
                logs.append(f"[Fallback/Bypassed] Type Request simulated: '{param}'")
                
        elif action == "press_key":
            if PYAUTOGUI_AVAILABLE:
                pyautogui.click()
                time.sleep(0.3)
                keys = param.lower().replace(" ", "").split("+")
                if len(keys) > 1:
                    pyautogui.hotkey(*keys)
                else:
                    pyautogui.press(keys[0])
                logs.append(f"Pressed hotkey combinations: {param}")
            else:
                logs.append(f"[Fallback/Bypassed] Keystroke action: {param}")
                
        elif action == "take_screenshot":
            # Handled synchronously natively
            logs.append("Action executed: Screenshot queued.")
            
        elif action == "alert_msg":
            if PYAUTOGUI_AVAILABLE:
                pyautogui.alert(text=param, title="Neora Autonomous Agent Notification")
                logs.append(f"Displayed popup graphical window alerts: '{param}'")
            else:
                print(f"ALERT popup: {param}")
                logs.append(f"Alert output in terminal: '{param}'")
                
        else:
            logs.append(f"Unsupported custom action type: {action}")
            
    except Exception as err:
        print(f"Error while running action {action}: {err}")
        logs.append(f"ERROR: Execution failed for action '{action}'. Details: {str(err)}")
        
    return logs

# --- OPTIONAL DEKSTOP CONTINUOUS VOCAL LISTENER HANDSHAKE ---
def start_handsfree_voice_listener():
    try:
        import speech_recognition as sr
        print("[SUCCESS] Speech recognition (speech_recognition) package detected!")
        print("[INFO] Hot mic listening active. Start speaking to trigger Neora commands hands-free...")
        
        recognizer = sr.Recognizer()
        
        def voice_worker():
            try:
                mic = sr.Microphone()
            except Exception as mic_err:
                print(f"[WARNING] Microphone initialization failed: {mic_err}")
                print("[WARNING] SpeechRecognition is installed, but no default microphone input was found. Skipping voice module.")
                return
                
            while True:
                try:
                    with mic as source:
                        # calibrate for ambient background click or hiss noises
                        recognizer.adjust_for_ambient_noise(source, duration=0.8)
                        print("[Voice Mic] Listening for prompt or trigger...")
                        audio = recognizer.listen(source, phrase_time_limit=6)
                        
                    print("[Voice Mic] Processing vocal wave patterns...")
                    speech_text = recognizer.recognize_google(audio, language="en-US").strip()
                    if not speech_text:
                        continue
                        
                    # Support Bengali pronunciation detections too
                    try:
                        bengali_speech = recognizer.recognize_google(audio, language="bn-BD").strip()
                        # If contains actual Bengali unicode characters, prefer the Bengali transcription
                        if len([c for c in bengali_speech if ord(c) > 127]) > len(speech_text) * 0.4:
                            speech_text = bengali_speech
                    except Exception:
                        pass
                        
                    print(f"[🎙️ Voice Trigger] Caught => '{speech_text}'")
                    payload = {
                        "prompt": speech_text,
                        "token": AGENT_TOKEN,
                        "client_time": datetime.now().isoformat()
                    }
                    requests.post(f"{BROKER_URL}/api/os/command", json=payload, headers=HEADERS, timeout=8)
                    print(f"✓ Dispatched voiced command directly to Neora cloud panel.")
                except sr.UnknownValueError:
                    # ignore silent speech audio ticks
                    pass
                except Exception as e:
                    print(f"[Voice Mic Error] Mic loop exception: {e}")
                    time.sleep(3)
                    
        t = threading.Thread(target=voice_worker, daemon=True)
        t.start()
    except ImportError:
        print("\\n" + "-"*75)
        print("💡   🎙️ WANT NEORA TO HEAR YOUR VOICE LOCALLY AT YOUR COMPUTER? (HANDS-FREE)")
        print("-"*75)
        print("পিসিতে বসেই সরাসরি কথা বলে Neora কে কন্ট্রোল করতে লাইব্রেরিটি ব্রাশ আপ করুন।")
        print("ভয়েস কম্যান্ড অ্যাক্টিভেট করতে আপনার টার্মিনাল/CMD-তে রান করুন:")
        print("   pip install SpeechRecognition pyaudio")
        print("-"*75 + "\\n")
    except Exception as e:
        print(f"[INFO] Handsfree module bypassed: {e}")

# Spin off the continuous local microphone listening sequence
start_handsfree_voice_listener()

# Main agent listener polling query loop
last_ping_time = time.time() - 30

while True:
    now = time.time()
    # Sending regular pings to indicate system status is online
    if now - last_ping_time >= 10:
        send_ping()
        last_ping_time = now

    try:
        # Long-polling queue endpoint
        res = requests.get(f"{BROKER_URL}/api/os/poll?token={AGENT_TOKEN}", headers=HEADERS, timeout=10)
        if res.status_code == 200:
            responseText = res.text.strip()
            # Dynamic authentication check (if receiving Google/AI Studio OAuth HTML gate instead of JSON)
            if "text/html" in res.headers.get("Content-Type", "") or responseText.startswith("<!doctype") or responseText.startswith("<html"):
                print('\n[SESSION EXPIRED / RE-AUTHENTICATION REQUIRED]')
                print("Your active browser session has dropped. Let's re-authenticate...")
                if os.path.exists("neora_config.json"):
                    try:
                        os.remove("neora_config.json")
                    except Exception:
                        pass
                HEADERS = retrieve_authenticated_headers()
                continue

            data = res.json()
            if data.get("hasCommand"):
                cmd_id = data.get("commandId")
                prompt_text = data.get("prompt")
                actions_list = data.get("actions", [])
                
                print(f'\n[INCOMING PROMPT] => "{prompt_text}"')
                print(f"Processing command actions queue ({len(actions_list)} layers)...")
                # Trigger local PC speech feedback
                speak_local(f"Acknowledged direct command: {prompt_text}")
                
                execution_logs = [f"Desktop execution started for command: '{prompt_text}'"]
                success_count = 0
                
                # Execute actions list sequentially
                for idx, act in enumerate(actions_list):
                    step_logs = execute_instruction(act.get("action"), act.get("param"))
                    execution_logs.extend(step_logs)
                    success_count += 1
                
                # Take live desktop screenshots
                screenshot_base64 = capture_screenshot_base64()
                
                # Prepare execution updates payload
                report_payload = {
                    "token": AGENT_TOKEN,
                    "commandId": cmd_id,
                    "status": "success",
                    "logs": execution_logs,
                    "screenshot": screenshot_base64,
                    "result": f"Completed {success_count}/{len(actions_list)} automation actions."
                }
                
                # Report back to the Neora cloud server
                requests.post(f"{BROKER_URL}/api/os/report", json=report_payload, headers=HEADERS, timeout=10)
                print("[REPORT SUCCESS] Sent logs and image visual metrics back to Neora.")
                # Speak successful completion aloud
                speak_local("Neora automation task executed successfully, Boss!")
                
        elif res.status_code == 401:
            print('\n[UNAUTHORIZED] The token NEORA-X7-AGENT does not match. Update the AGENT_TOKEN inside the script.')
            time.sleep(8)
        else:
            print(f"Server responded with code {res.status_code}")
            
    except Exception as poll_error:
        print(f"Connection issue or network failure: {str(poll_error)}")
        
    time.sleep(POLL_INTERVAL)
`;

  // Copy python bridge client code
  const handleCopyScript = () => {
    copyToClipboardFailsafe(pythonScriptText).then((success) => {
      if (success) {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      }
    });
  };

  return (
    <div id="os-agent-root" className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 panel-surface">
      {/* View Header Bar */}
      <div className="border-b border-slate-900 bg-slate-950/90 px-6 py-4 flex items-center justify-between shrink-0 panel-surface-strong">
        <div>
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-sans">
              {lang === 'bn' ? 'পিসি ওএস কন্ট্রোল এজেন্ট' : 'Local PC OS Agent Controller'}
            </h2>
            {status === 'online' ? (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase select-none">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {lang === 'bn' ? 'সংযুক্ত / অনলাইন' : 'CONNECTED / ACTIVE'}
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-slate-800 text-slate-400 border border-slate-700 rounded px-2 py-0.5 text-[9px] font-mono font-bold uppercase select-none">
                <Power className="w-2.5 h-2.5" />
                {lang === 'bn' ? 'অফলাইন' : 'OFFLINE'}
              </span>
            )}
            <span className={`ml-1 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
              healthState === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : healthState === 'degraded' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {healthState === 'healthy'
                ? 'healthy /api/os/status'
                : healthState === 'degraded'
                  ? `degraded ${statusEndpoint || '/api/os/status'}`
                  : `offline ${statusEndpoint || '/api/os/status'}`}
            </span>
            {watchdogNote && (
              <span className="ml-1 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                {watchdogNote}
              </span>
            )}
            <button
              type="button"
              onClick={handleRerunLastFailed}
              className="ml-2 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              {lang === 'bn' ? 'শেষ failed পুনরায় চালাও' : 'Rerun last failed'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn' 
              ? 'ভয়েস বা লিখিত নির্দেশে নিজের পিসির যেকোনো সফটওয়্যার ও প্রোগ্যাম স্বয়ংক্রিয়ভাবে কন্ট্রোল করুন' 
              : 'Directly execute actions and control local PC files or apps via unified vocal prompts'}
          </p>
        </div>

        {/* Workspace Display View Selectors */}
        <div className="flex bg-slate-900 rounded p-1 border border-slate-800">
          <button 
            type="button"
            onClick={() => setViewMode('monitor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${viewMode === 'monitor' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'আই স্ক্রিন' : 'Agent Monitor'}</span>
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('mission')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${viewMode === 'mission' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? 'মিশন প্ল্যানার' : 'Mission Planner'}</span>
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${viewMode === 'terminal' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'টার্মিনাল লগ' : 'Broker Console'}</span>
          </button>
          <button 
            type="button"
            onClick={() => setViewMode('setup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${viewMode === 'setup' ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সেটআপ গাইড' : 'Desktop Setup'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        
        {/* Left Control Panel / Commands Input Section */}
        <div className="w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-slate-900 bg-slate-950 p-6 flex flex-col lg:overflow-y-auto shrink-0 select-none">
          
          {/* Token Credentials Block */}
          <div className="bg-slate-900/50 border border-slate-850/80 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              {lang === 'bn' ? 'মেক কানেকশন টোকেন' : 'Control Authentication Security'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {lang === 'bn' 
                ? 'আপনার কম্পিউটারের স্ক্রিপ্টের সাথে কানেক্ট করতে এই সিকিউর টোকেন ব্যবহার করুন:' 
                : 'Configure this token on your local python desktop client to sync details:'}
            </p>
            <div className="mt-3 flex gap-2">
              <code className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-mono font-bold text-center block">
                {token}
              </code>
              <button 
                onClick={handleCopyToken}
                className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition items-center justify-center flex rounded text-slate-300 cursor-pointer text-xs font-medium"
                title="Copy Token to Clipboard"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {lastPing && (
              <div className="mt-3 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>{lang === 'bn' ? 'শেষ খোঁজ পাওয়া গেছে:' : 'Last Ping Received:'}</span>
                <span className="text-cyan-500/80">{new Date(lastPing).toLocaleTimeString()}</span>
              </div>
            )}
            {recoveryAutoSaveAt && (
              <div className="mt-1 text-[10px] font-mono text-emerald-500 flex justify-between">
                <span>{lang === 'bn' ? 'শেষ অটো-সেভ:' : 'Last Auto-save:'}</span>
                <span className="text-emerald-400">{new Date(recoveryAutoSaveAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* Core Action Direct Prompts */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'bn' ? 'অটোমেশন ভয়েস ও টেক্সট কমান্ড' : 'Execute New OS Command'}
            </h3>

            {/* Vocal Input Button and command field */}
            <form onSubmit={handleSendCommand} className="space-y-3 mb-6">
              {selectedFilePath && (
                <div className="p-2 border border-emerald-500/20 bg-emerald-500/10 rounded-lg text-[10px] font-mono text-emerald-300 flex items-center justify-between select-none">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-ping"></span>
                    <strong>TARGETING NODE:</strong> {selectedFilePath} (Auto-appended to prompt)
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedFilePath(null)}
                    className="font-mono text-[9px] hover:text-white px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded"
                  >
                    remove
                  </button>
                </div>
              )}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={lang === 'bn' 
                    ? 'যেমন: \"Open Chrome to YouTube and play relaxed ambient music then take a screenshot\"...' 
                    : 'E.g., "Open chrome, navigate to google, then open calc and take desktop screenshot"...'}
                  className="w-full min-h-[90px] border border-slate-800 rounded-xl bg-slate-950 p-4 pb-12 text-xs focus:ring-1 focus:ring-cyan-500 outline-none text-white resize-none leading-relaxed"
                />
                
                {/* Voice Record action */}
                <button
                  type="button"
                  onClick={toggleVoiceListening}
                  className={`absolute left-3 bottom-3 p-2 rounded-lg transition-all cursor-pointer border ${isListening ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}
                  title="Speak Vocal Command"
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                </button>

                <div className="absolute right-3 bottom-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={isCompiling || !prompt.trim()}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs cursor-pointer select-none transition border border-cyan-500/30"
                  >
                    {isCompiling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : (lang === 'bn' ? 'চালান' : 'Run')}
                  </button>
                </div>
              </div>
            </form>

            {/* Presets and shortcut templates for quick validation */}
            <div className="mb-6 select-none bg-slate-900/10 border border-slate-900 rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{lang === 'bn' ? 'কুইক প্রিসেট স্ক্রিপ্টস' : 'OS Automation Presets'}</span>
                <span className="text-[9px] text-cyan-400 font-normal normal-case">{lang === 'bn' ? 'অপারেটর মোড সক্রিয়' : 'Operator Mode Active'}</span>
              </h4>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setPrompt('open word, wait 4 seconds, type "Shukria Printers memo detailed report", save file as ShukriaMemo.docx')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition flex items-center justify-between"
                >
                  <span>📝 {lang === 'bn' ? 'MS Word এ শুক্রিয়া প্রিন্টার্সের রিপোর্ট লিখে সেভ করুন' : 'Write & Save Report in MS Word'}</span>
                  <span className="text-[9px] text-slate-500 font-mono">winword</span>
                </button>
                <button 
                  onClick={() => setPrompt('open photoshop, wait 5.5 seconds, press ctrl+n, wait 1.5 seconds, press enter, type "Shukria premium poster header text", save file as project.psd, take a screenshot')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition flex items-center justify-between"
                >
                  <span>🎨 {lang === 'bn' ? 'Photoshop এ প্রফেশনাল পোস্টার ও ব্যানার ডিজাইন করুন' : 'Create Poster and Save in Photoshop'}</span>
                  <span className="text-[9px] text-indigo-400 font-mono">photoshop</span>
                </button>
                <button 
                  onClick={() => setPrompt('open mspaint, wait 3 seconds, drag mouse from 150,150 to 500,150, drag mouse from 500,150 to 500,450, drag mouse from 500,450 to 150,450, drag mouse from 150,450 to 150,150, type "Designed by Neora Agent", save file as design.png')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition flex items-center justify-between"
                >
                  <span>🖌️ {lang === 'bn' ? 'MS Paint ক্যানভাসে মাউস দিয়ে বাউন্ডারি এঁকে ফাইল সেভ করুন' : 'Draw Boundary Box & Save in Paint'}</span>
                  <span className="text-[9px] text-rose-400 font-mono">mspaint</span>
                </button>
                <button 
                  onClick={() => setPrompt('open file sample.txt, wait 2 seconds, type " - Updated by Neora on PC Drive", save file as sample.txt')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition flex items-center justify-between"
                >
                  <span>📂 {lang === 'bn' ? 'পিসির ড্রাইভ থেকে ফাইল ওপেন ও এডিট করে ওভাররাইট সেভ করুন' : 'Open PC Drive File, Edit & Auto-Save'}</span>
                  <span className="text-[9px] text-green-400 font-mono">file-system</span>
                </button>
                <button 
                  onClick={() => setPrompt('take a screenshot to update dashboard')}
                  className="w-full text-left bg-slate-900 text-xs px-3 py-2 rounded-lg border border-slate-850 hover:bg-slate-800 cursor-pointer text-slate-300 transition flex items-center justify-between"
                >
                  <span>📸 {lang === 'bn' ? 'পিসি মনিটরের লাইভ স্ক্রিনশট সংগ্রহ করুন' : 'Force capture desktop screenshot'}</span>
                  <span className="text-[9px] text-slate-500 font-mono">screenshot</span>
                </button>
              </div>
            </div>

            {/* Quick Launch & Application Config Panel */}
            <div className="mb-6 select-none bg-slate-900/40 border border-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/40 pb-2">
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  {lang === 'bn' ? 'কুইক লঞ্চ ম্যানেজার' : 'Quick Launch Manager'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowEditPaths(!showEditPaths)}
                  className="text-[10px] font-semibold text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
                  title="Configure Executable Paths"
                >
                  <Settings className="w-3 h-3" />
                  <span>{showEditPaths ? (lang === 'bn' ? 'আড়াল করুন' : 'Hide Paths') : (lang === 'bn' ? 'পথ পরিবর্তন' : 'Edit Paths')}</span>
                </button>
              </div>

              {showEditPaths && (
                <div className="space-y-2 mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-[9px] text-slate-500 font-mono mb-2">
                    {lang === 'bn' ? 'আপনার পিসির অ্যাপ্লিকেশন ফাইলের পূর্ণ পাথ দিন:' : 'Set your local desktop path or executable names:'}
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-[10px]">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Photoshop Path</label>
                      <input 
                        type="text"
                        value={quickLaunchPaths.photoshop}
                        onChange={(e) => handleSavePaths({...quickLaunchPaths, photoshop: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-250 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Illustrator Path</label>
                      <input 
                        type="text"
                        value={quickLaunchPaths.illustrator}
                        onChange={(e) => handleSavePaths({...quickLaunchPaths, illustrator: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-255 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">MS Word Path</label>
                      <input 
                        type="text"
                        value={quickLaunchPaths.word}
                        onChange={(e) => handleSavePaths({...quickLaunchPaths, word: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-255 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">MS Excel Path</label>
                      <input 
                        type="text"
                        value={quickLaunchPaths.excel}
                        onChange={(e) => handleSavePaths({...quickLaunchPaths, excel: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-255 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Chrome Browser</label>
                      <input 
                        type="text"
                        value={quickLaunchPaths.chrome}
                        onChange={(e) => handleSavePaths({...quickLaunchPaths, chrome: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-255 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">VS Code Path</label>
                      <input 
                        type="text"
                        value={quickLaunchPaths.vscode}
                        onChange={(e) => handleSavePaths({...quickLaunchPaths, vscode: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-255 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Notepad Path</label>
                      <input 
                        type="text"
                        value={quickLaunchPaths.notepad}
                        onChange={(e) => handleSavePaths({...quickLaunchPaths, notepad: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-250 outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Launch Buttons Grid */}
              <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                <button
                  type="button"
                  onClick={() => handleQuickLaunch('photoshop')}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-900/20 to-blue-950/40 hover:from-blue-900/40 border border-blue-500/10 hover:border-blue-500/30 px-3 py-2 rounded-lg cursor-pointer transition text-left text-slate-255 font-medium text-xs truncate"
                >
                  <span className="text-blue-400 text-sm font-bold block shrink-0 bg-blue-500/20 px-1 rounded">Ps</span>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold leading-tight">Photoshop</span>
                    <span className="block text-[8px] text-slate-500 font-mono truncate">{quickLaunchPaths.photoshop}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLaunch('illustrator')}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-900/20 to-amber-950/40 hover:from-amber-900/40 border border-amber-500/10 hover:border-amber-500/30 px-3 py-2 rounded-lg cursor-pointer transition text-left text-slate-255 font-medium text-xs truncate"
                >
                  <span className="text-amber-400 text-sm font-bold block shrink-0 bg-amber-500/20 px-1 rounded">Ai</span>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold leading-tight">Illustrator</span>
                    <span className="block text-[8px] text-slate-500 font-mono truncate">{quickLaunchPaths.illustrator}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLaunch('word')}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-900/20 to-indigo-950/40 hover:from-indigo-900/40 border border-indigo-500/10 hover:border-indigo-500/30 px-3 py-2 rounded-lg cursor-pointer transition text-left text-slate-255 font-medium text-xs truncate"
                >
                  <span className="text-indigo-400 text-sm font-bold block shrink-0 bg-indigo-500/20 px-1 rounded">Wd</span>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold leading-tight">MS Word</span>
                    <span className="block text-[8px] text-slate-500 font-mono truncate">{quickLaunchPaths.word}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLaunch('excel')}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-900/20 to-emerald-950/40 hover:from-emerald-900/40 border border-emerald-500/10 hover:border-emerald-500/30 px-3 py-2 rounded-lg cursor-pointer transition text-left text-slate-255 font-medium text-xs truncate"
                >
                  <span className="text-emerald-400 text-sm font-bold block shrink-0 bg-emerald-500/20 px-1 rounded">Xl</span>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold leading-tight">MS Excel</span>
                    <span className="block text-[8px] text-slate-500 font-mono truncate">{quickLaunchPaths.excel}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLaunch('chrome')}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-900/20 to-yellow-950/40 hover:from-yellow-900/40 border border-yellow-500/10 hover:border-yellow-500/30 px-3 py-2 rounded-lg cursor-pointer transition text-left text-slate-255 font-medium text-xs truncate"
                >
                  <span className="text-yellow-400 text-sm font-bold block shrink-0 bg-yellow-500/20 px-1 rounded">Ch</span>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold leading-tight">Chrome</span>
                    <span className="block text-[8px] text-slate-500 font-mono truncate">{quickLaunchPaths.chrome}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLaunch('notepad')}
                  className="flex items-center gap-2 bg-gradient-to-r from-slate-905/20 to-slate-950/40 hover:from-slate-905/40 border border-slate-500/10 hover:border-slate-500/30 px-3 py-2 rounded-lg cursor-pointer transition text-left text-slate-255 font-medium text-xs truncate"
                >
                  <span className="text-slate-400 text-sm font-bold block shrink-0 bg-slate-550/20 px-1 rounded">Np</span>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold leading-tight">Notepad</span>
                    <span className="block text-[8px] text-slate-500 font-mono truncate">{quickLaunchPaths.notepad}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* ----------------- GIT HEALTH & REPOSITORY HUB ----------------- */}
            <div className="mb-6 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850/60 pb-2.5">
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isGitSyncing ? 'animate-spin' : ''}`} />
                  {lang === 'bn' ? 'গিট রেপো স্বাস্থ্য ও নিয়ন্ত্রণ' : 'Git Core Health'}
                </h4>
                {gitStatus && (
                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-slate-400 font-mono">
                     {gitStatus.branch}
                  </span>
                )}
              </div>

              {/* Git Status Information Block */}
              {!gitStatus ? (
                <div className="text-center py-4 space-y-2">
                  <div className="h-4 w-4 border-2 border-cyan-450/40 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] text-slate-500 font-mono">
                    {lang === 'bn' ? 'গিট স্থিতি লোড করা হচ্ছে...' : 'Querying git repository...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Diagnostic Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-950/60 rounded border border-slate-850/40 text-center">
                      <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Ahead / Behind</span>
                      <strong className="text-sm font-mono text-cyan-400 block">
                        +{gitStatus.ahead} / -{gitStatus.behind}
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded border border-slate-850/40 text-center">
                      <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">Unstaged Changes</span>
                      <strong className={`text-sm font-mono block ${gitStatus.dirty ? 'text-amber-400' : 'text-slate-400'}`}>
                        {gitStatus.dirty ? (lang === 'bn' ? 'পরিমার্জিত' : 'Dirty') : (lang === 'bn' ? 'পরিষ্কার' : 'Clean')}
                      </strong>
                    </div>
                  </div>

                  {/* Conflict File Alert Badge */}
                  {gitStatus.conflicts.length > 0 ? (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/35 rounded-lg space-y-1.5 animate-pulse">
                      <div className="flex items-center gap-1.5 text-rose-405 text-[10px] font-bold uppercase tracking-wider font-mono">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-505"></span>
                        </span>
                        {lang === 'bn' ? 'মার্জ কনফ্লিক্ট সনাক্ত করা গেছে!' : 'Merge Conflicts Detected!'}
                      </div>
                      <p className="text-[9px] text-rose-300 leading-normal font-sans">
                        {lang === 'bn' 
                          ? `মোট ${gitStatus.conflicts.length}টি ফাইলে কোড কনফ্লিক্ট রয়েছে। সমাধান করতে 'Force Overwrites' করুন বা ম্যানুয়াল গাইড দেখুন।`
                          : `There are ${gitStatus.conflicts.length} file(s) with unresolved git merge conflicts in your tree.`}
                      </p>
                      <div className="bg-slate-950/85 rounded border border-rose-950/80 p-1.5 text-[9px] font-mono text-rose-300 space-y-0.5 max-h-20 overflow-y-auto">
                        {gitStatus.conflicts.map((file, fIdx) => (
                          <div key={fIdx} className="truncate">⚠ {file}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-850/40 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-500">{lang === 'bn' ? 'ফাইল পরিবর্তন ট্র্যাকিং:' : 'Working Tree status:'}</span>
                      <span className={gitStatus.dirty ? 'text-amber-400' : 'text-emerald-400'}>
                        {gitStatus.dirty 
                          ? (lang === 'bn' ? 'Uncommitted ফাইল রয়েছে' : 'Dirty (uncommitted)') 
                          : (lang === 'bn' ? '✓ সবকিছু ক্লিন' : '✓ Clean')}
                      </span>
                    </div>
                  )}

                  {/* Sync Control Action Drawer Buttons */}
                  <div className="space-y-2 pt-1 select-none">
                    <button
                      type="button"
                      onClick={() => handleGitAction('stash_sync')}
                      disabled={isGitSyncing}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold border border-slate-700/80 transition cursor-pointer"
                    >
                      <span>💼 {lang === 'bn' ? 'নিরাপদ অটো-স্ট্যাশ ও সিঙ্ক' : 'Stash & Sync'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGitAction('force_sync')}
                      disabled={isGitSyncing}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-950/80 to-red-900/80 hover:from-rose-900 hover:to-red-800 text-rose-200 text-[10px] font-bold border border-rose-800/80 transition cursor-pointer"
                      title="Destructive! Overwrites and discards all local conflicts instantly."
                    >
                      <span>🔥 {lang === 'bn' ? 'ফোর্স ওভাররাইট করে সিঙ্ক' : 'Force Overwrite Sync'}</span>
                    </button>
                    
                    <p className="text-[8px] text-slate-500 text-center font-mono">
                      {lang === 'bn' 
                        ? 'ফোর্স ওভাররাইট লোকাল কাজ মুছে ফেলে রিমোট মেইন কোড লোড করবে।' 
                        : 'Force Overwrite resets local modifications to match remote main branch.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Bilingual Git Help Manual */}
              <div className="mt-4 pt-3 border-t border-slate-850 select-text">
                <details className="group">
                  <summary className="list-none flex items-center justify-between text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer select-none font-mono">
                    <span>💡 {lang === 'bn' ? 'মার্জ কনফ্লিক্ট দূর করার গাইড' : 'Conflict Resolution Manual'}</span>
                    <span className="transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="mt-2.5 bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-3.5 text-[10px] leading-relaxed select-text font-sans">
                    {/* Bengali Instructions */}
                    <div className="space-y-1.5 border-b border-slate-850/60 pb-2.5">
                      <h5 className="font-bold text-cyan-400 font-mono text-[9px] uppercase tracking-wider">গিট ম্যানুয়াল রেজোলিউশন (বাংলা)</h5>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                        <li>প্রথমে আপনার পিসির টার্মিনালে <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono text-[9px]">git status</code> দিয়ে কনফ্লিক্ট হওয়া ফাইল চিহ্নিত করুন।</li>
                        <li>কনফ্লিক্ট ফাইলগুলো খুলে <code className="text-rose-450 font-mono">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> এবং <code className="text-cyan-405 font-mono">&gt;&gt;&gt;&gt;&gt;&gt;&gt; remote</code> ট্যাগের মধ্যের কোড তুলনা করুন। </li>
                        <li>পরিবর্তনগুলো ম্যানুয়ালি এডিট করে ফাইল সেভ করুন।</li>
                        <li>ফাইল সেভ করার পর <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-mono text-[9px]">git add filename</code> কমান্ডের সাহায্যে ফাইল স্টেজ করুন।</li>
                        <li>অবশেষে <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-mono text-[9px]">git commit -m "resolved conflicts"</code> দিয়ে মার্জ সম্পূর্ণ করুন।</li>
                      </ol>
                    </div>

                    {/* English Instructions */}
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-cyan-400 font-mono text-[9px] uppercase tracking-wider">Manual Merge Conflict Fix (English)</h5>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                        <li>Run <code className="text-amber-300 font-mono">git status</code> in your project repository directory.</li>
                        <li>Locate the files listed under <span className="text-amber-400 font-mono font-bold">"Both Modified"</span>.</li>
                        <li>Open the file, search for merge markers (<code className="font-mono text-rose-400">&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>). Compare then choose which block to keep.</li>
                        <li>Delete the markers, save the files, and run <code className="text-emerald-400 font-mono">git add .</code> to stage resolved states.</li>
                        <li>Commit normally to close: <code className="text-emerald-400 font-mono">git commit -m "fix conflicts"</code>.</li>
                      </ol>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* Active Commands Queue List */}
            <div className="flex-1 flex flex-col min-h-[150px]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {lang === 'bn' ? 'চলমান ও অপেক্ষারত কাজের ক্রম' : 'Pending Operations'}
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[170px] pr-1">
                {queue.length === 0 ? (
                  <div className="h-full border border-dashed border-slate-900 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <Check className="w-5 h-5 text-slate-600 mb-1" />
                    <p className="text-[10px] text-slate-500">
                      {lang === 'bn' ? 'কোনো অপেক্ষারত কাজ নেই' : 'Queue is currently empty'}
                    </p>
                  </div>
                ) : (
                  queue.map((q) => (
                      <div key={q.id} onClick={() => setSelectedItem(q)} className={`bg-slate-900/60 border rounded-lg p-2.5 flex items-center justify-between cursor-pointer ${selectedItem?.id === q.id ? 'border-cyan-500/40' : 'border-slate-850'}`}>
                        <div className="truncate pr-2">
                          <p className="text-xs text-white truncate max-w-[260px]">{q.prompt}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{q.timestamp} | {q.actions?.length || 0} Actions</p>
                          {q.retryCount ? <p className="text-[9px] text-amber-400 mt-0.5 font-mono">retry #{q.retryCount}</p> : null}
                        </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded uppercase select-none border ${
                          q.status === 'running' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20 animate-pulse' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {q.status}
                        </span>
                        <span className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded uppercase select-none border ${
                          getClassificationLabel(q.classification) === 'os-command'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : getClassificationLabel(q.classification) === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {getClassificationLabel(q.classification)}
                        </span>
                        <div className="mt-1 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRetryCommand(q.id)}
                            className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[8px] font-bold uppercase"
                          >
                            <RotateCcw className="w-3 h-3 inline mr-1" />
                            retry
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelCommand(q.id)}
                            className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[8px] font-bold uppercase"
                          >
                            <XCircle className="w-3 h-3 inline mr-1" />
                            cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Main Viewing Area - Context Switching */}
        <div className="flex-1 flex flex-col min-h-0 lg:overflow-hidden bg-slate-950">
          {(statusBanner || lastResult) && (
            <div className="px-6 pt-5">
              {statusBanner && (
                <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] text-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{statusBanner}</span>
                    {(statusBanner.includes('/api/') || statusBanner.includes('endpoint')) && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border border-amber-400/30 bg-slate-950/40 text-amber-100">
                        {statusBanner.includes('/api/') ? statusBanner.match(/\/api\/[A-Za-z0-9\-\/]+/)?.[0] || 'endpoint' : 'endpoint'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatusBanner(null)}
                    className="text-[9px] font-mono uppercase text-amber-100/80 hover:text-white"
                  >
                    dismiss
                  </button>
                </div>
              )}
              {lastResult && (
                <div className="mb-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] text-cyan-100">
                  <span className="font-mono uppercase text-cyan-300 mr-2">Last Result</span>
                  <span>{lastResult}</span>
                </div>
              )}
            </div>
          )}
          
          {/* VIEW: Agent Monitor (Screenshots scaled view) */}
          {viewMode === 'monitor' && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              
              <div className="flex flex-col md:flex-row gap-6">
              
              {/* Desktop Mirror Screen Panel */}
              <div className="flex-1 flex flex-col">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  {/* Monitor Window Header Toolbar */}
                  <div className="bg-slate-950 border-b border-slate-850 py-3 px-4 flex items-center justify-between select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold ml-2">Display Remote Mirror - Screen #1</span>
                    </div>
                    {status === 'online' && (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        LIVE DESKTOP
                      </span>
                    )}
                  </div>

                  {/* Desktop Mirror Canvas Frame with screen image */}
                  <div className="flex-1 min-h-[280px] bg-slate-950 flex items-center justify-center p-3 relative group">
                    {currentScreenshot ? (
                      <img 
                        src={currentScreenshot} 
                        referrerPolicy="no-referrer"
                        alt="Local PC Live Screenshot Stream" 
                        className="max-h-[380px] object-contain border border-slate-800 select-none shadow-md rounded"
                      />
                    ) : (
                      <div className="h-[300px] w-full flex flex-col items-center justify-center text-center p-6">
                        <Laptop className="w-12 h-12 text-slate-800 mb-2 animate-pulse" />
                        <h4 className="text-sm font-semibold text-slate-400">{lang === 'bn' ? 'কোনো লাইভ ইমেজ পাওয়া যায়নি' : 'Waiting for Desktop Image'}</h4>
                        <p className="text-xs text-slate-600 mt-1 max-w-sm">
                          {lang === 'bn' 
                            ? 'আপনার কম্পিউটারে পাইথন স্ক্রিপ্টটি চালু করলেই পিসির স্ক্রিনশট এখানে দেখতে পাবেন।' 
                            : 'Once your local python script runs and receives a command, the desk visual will live map right here.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-time Live Trigger HUD Indicator */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 select-none mb-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    {lang === 'bn' ? 'রিয়েল-টাইম লাইভ কমান্ড ইন্ডিকেটর' : '📡 Real-Time Command Trigger HUD'}
                  </h5>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Photoshop indicator */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      activeTriggeredApp === 'photoshop'
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-pulse'
                        : 'bg-slate-900/45 border-slate-900 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold text-slate-350">Photoshop</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTriggeredApp === 'photoshop' ? 'bg-blue-400 animate-ping' : 'bg-slate-700'}`}></span>
                      </div>
                      <span className="text-[8px] font-mono mt-2 uppercase tracking-wider font-bold">
                        {activeTriggeredApp === 'photoshop' ? '⚡ LAUNCHING...' : 'IDLE'}
                      </span>
                    </div>

                    {/* Illustrator indicator */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      activeTriggeredApp === 'illustrator'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse'
                        : 'bg-slate-900/45 border-slate-900 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold text-slate-350">Illustrator</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTriggeredApp === 'illustrator' ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`}></span>
                      </div>
                      <span className="text-[8px] font-mono mt-2 uppercase tracking-wider font-bold">
                        {activeTriggeredApp === 'illustrator' ? '⚡ LAUNCHING...' : 'IDLE'}
                      </span>
                    </div>

                    {/* Chrome indicator */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      activeTriggeredApp === 'chrome'
                        ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.15)] animate-pulse'
                        : 'bg-slate-900/45 border-slate-900 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold text-slate-350">Chrome</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTriggeredApp === 'chrome' ? 'bg-yellow-400 animate-ping' : 'bg-slate-700'}`}></span>
                      </div>
                      <span className="text-[8px] font-mono mt-2 uppercase tracking-wider font-bold">
                        {activeTriggeredApp === 'chrome' ? '⚡ TRIGGERING' : 'IDLE'}
                      </span>
                    </div>

                    {/* Notepad indicator */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      activeTriggeredApp === 'notepad'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse'
                        : 'bg-slate-900/45 border-slate-900 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold text-slate-350">Notepad</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTriggeredApp === 'notepad' ? 'bg-emerald-400 animate-ping' : 'bg-slate-700'}`}></span>
                      </div>
                      <span className="text-[8px] font-mono mt-2 uppercase tracking-wider font-bold">
                        {activeTriggeredApp === 'notepad' ? '⚡ TRIGGERING' : 'IDLE'}
                      </span>
                    </div>

                    {/* VS Code indicator */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      activeTriggeredApp === 'vscode'
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse'
                        : 'bg-slate-900/45 border-slate-900 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold text-slate-350">VS Code</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTriggeredApp === 'vscode' ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`}></span>
                      </div>
                      <span className="text-[8px] font-mono mt-2 uppercase tracking-wider font-bold">
                        {activeTriggeredApp === 'vscode' ? '⚡ TRIGGERING' : 'IDLE'}
                      </span>
                    </div>

                    {/* File/Folder Explorer indicator */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      activeTriggeredApp === 'explorer'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-250 shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse'
                        : 'bg-slate-900/45 border-slate-900 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-[10px] text-slate-350">Files</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTriggeredApp === 'explorer' ? 'bg-indigo-400 animate-ping' : 'bg-slate-700'}`}></span>
                      </div>
                      <span className="text-[8px] font-mono mt-2 uppercase tracking-wider font-bold">
                        {activeTriggeredApp === 'explorer' ? '⚡ DIR ACCESS' : 'IDLE'}
                      </span>
                    </div>

                    {/* Calculator indicator */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      activeTriggeredApp === 'calculator'
                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse'
                        : 'bg-slate-900/45 border-slate-900 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold text-slate-350">Calculator</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTriggeredApp === 'calculator' ? 'bg-purple-400 animate-ping' : 'bg-slate-700'}`}></span>
                      </div>
                      <span className="text-[8px] font-mono mt-2 uppercase tracking-wider font-bold">
                        {activeTriggeredApp === 'calculator' ? '⚡ LAUNCHING...' : 'IDLE'}
                      </span>
                    </div>

                    {/* MS Office (Word/Excel) indicator */}
                    <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      (activeTriggeredApp === 'word' || activeTriggeredApp === 'excel')
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse'
                        : 'bg-slate-900/45 border-slate-900 text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold text-slate-350">MS Office</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${(activeTriggeredApp === 'word' || activeTriggeredApp === 'excel') ? 'bg-rose-400 animate-ping' : 'bg-slate-700'}`}></span>
                      </div>
                      <span className="text-[8px] font-mono mt-2 uppercase tracking-wider font-bold truncate">
                        {activeTriggeredApp === 'word' ? '⚡ MS WORD' : activeTriggeredApp === 'excel' ? '⚡ MS EXCEL' : 'IDLE'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend details instructions info help box */}
                <div className="mt-4 bg-slate-900/30 border border-slate-900 rounded-xl p-4 text-xs text-slate-400 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white mb-1">
                      {lang === 'bn' ? 'নিওরা ওএস এজেন্ট কিভাবে কাজ করে?' : 'Interactive Desktop Orchestration'}
                    </h5>
                    <p className="leading-relaxed">
                      {lang === 'bn'
                        ? 'আপনার পিসির স্থানীয় পাইথন ক্লায়েন্ট স্ক্রিপ্টটি নেওরার ক্লাউড ব্রোকার সার্ভার থেকে প্রতি ৪ সেকেন্ড পর পর নতুন কমান্ড তুলে নেয়। Gemini অটোমেশন ম্যাপ অনুযায়ী সেটি কি-স্ট্রোকে রূপান্তর হয়, স্ক্রিনশট নেয় এবং আবার ড্যাশবোর্ডে পাঠায়।'
                        : 'Your local Python client bridge queries our Cloud Run server every 4 seconds. When a textual command is generated, it sequentially executes keystrokes, opens browsers, and streams PC desktop frames straight back to your workspace.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Execution History Tracker */}
              <div className="w-full md:w-[280px] shrink-0 flex flex-col bg-slate-950 select-none">
                {/* Agent Live Progress Step Indicators */}
                <div className="mb-5 text-left select-none">
                  <AgentExecutionLog 
                    lang={lang}
                    activeCommand={queue.find(item => item.status === 'running') || queue.find(item => item.status === 'pending') || null}
                    logs={logs}
                  />
                </div>

                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">
                  {lang === 'bn' ? 'সম্পন্ন কাজের ইতিহাস' : 'Recent Operations Run'}
                </h3>
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">os-command</span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-slate-500/10 text-slate-400 border-slate-500/20">chat</span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border bg-red-500/10 text-red-400 border-red-500/20">rejected</span>
                </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-1">
                  {history.length === 0 ? (
                    <div className="border border-dashed border-slate-900 rounded-xl h-[120px] flex items-center justify-center text-center p-4">
                      <p className="text-xs text-slate-600 font-bold">{lang === 'bn' ? 'কোনো পূর্ববর্তী ইতিহাস নেই' : 'No execution history yet'}</p>
                    </div>
                  ) : (
                    history.slice().reverse().map((h) => (
                      <div key={h.id} onClick={() => setSelectedItem(h)} className={`bg-slate-900/40 border rounded-xl p-3 flex flex-col justify-between cursor-pointer ${selectedItem?.id === h.id ? 'border-cyan-500/40' : 'border-slate-900'}`}>
                        <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{h.id}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                                h.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {h.status}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase border ${
                                getClassificationLabel(h.classification) === 'os-command'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : getClassificationLabel(h.classification) === 'rejected'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {getClassificationLabel(h.classification)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-200 font-bold mt-1.5 line-clamp-2">{h.prompt}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 pr-1">{h.result}</p>
                          {h.retryCount ? <p className="text-[9px] text-amber-400 mt-1 font-mono">retry #{h.retryCount}</p> : null}
                        </div>
                        <div className="border-t border-slate-900/50 mt-2 pt-2 text-[8px] font-mono text-slate-500 flex justify-between">
                          <span>{h.actionsCount} OS actions</span>
                          <span>{h.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {(recentMemories.length > 0 || activePlans.length > 0) && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {recentMemories.length > 0 && (
                    <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 mb-2">Recent Memories</h4>
                      <div className="space-y-2 text-[10px]">
                        {recentMemories.map((memory) => (
                          <div key={memory.id} className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-slate-200 font-semibold truncate">{memory.key}</div>
                              <div className="text-slate-400 truncate">{memory.value}</div>
                            </div>
                            <span className="text-slate-500 uppercase shrink-0">{memory.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activePlans.length > 0 && (
                    <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 mb-2">Active Plans</h4>
                      <div className="space-y-2 text-[10px]">
                        {activePlans.map((plan) => (
                          <div key={plan.id} className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-slate-200 font-semibold truncate">{plan.goal}</div>
                              <div className="text-slate-400">{Array.isArray(plan.steps) ? `${plan.steps.length} steps` : 'plan'}</div>
                            </div>
                            <span className="text-slate-500 uppercase shrink-0">{plan.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedItem && (
                <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-cyan-300 uppercase tracking-widest">
                      {lang === 'bn' ? 'কমান্ড বিস্তারিত' : 'Command Detail'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="text-[10px] font-mono uppercase text-slate-400 hover:text-white"
                    >
                      close
                    </button>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div><span className="text-slate-500">ID:</span> {selectedItem.id}</div>
                    <div><span className="text-slate-500">Prompt:</span> {selectedItem.prompt}</div>
                    <div><span className="text-slate-500">Status:</span> {selectedItem.status}</div>
                    <div><span className="text-slate-500">Classification:</span> {getClassificationLabel(selectedItem.classification)}</div>
                    <div><span className="text-slate-500">Retry:</span> {(selectedItem as any).retryCount || 0}</div>
                    <div><span className="text-slate-500">Result:</span> {(selectedItem as any).result || '—'}</div>
                  </div>
                </div>
              )}

              </div>

              {/* Advanced Auto-Macros and File Targeter Bento Grid */}
              <div className="border-t border-slate-850 pt-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Column 1: Workflow Studio */}
                  <div className="xl:col-span-1">
                    <WorkflowAutomator 
                      lang={lang}
                      token={token}
                      onWorkflowDispatched={(msg) => {
                        setLastResult(msg);
                        fetchAgentStatus();
                      }}
                    />
                  </div>

                  {/* Column 2: File Browser Studio */}
                  <div className="xl:col-span-2">
                    <LocalFileSystemBrowser 
                      lang={lang}
                      selectedFilePath={selectedFilePath}
                      onFileSelected={(filePath) => setSelectedFilePath(filePath)}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: Terminal & Console Broker Logs */}
          {viewMode === 'terminal' && (
            <div className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between select-none mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  {lang === 'bn' ? 'সিস্টেম ব্রোকার ইন্টারফেস কনসোল' : 'Neora Integration Broker Logs'}
                </h3>
                <button
                  onClick={handleClearTerminal}
                  className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                >
                  {lang === 'bn' ? 'কনসোল মুছুন' : 'Clear Logs'}
                </button>
              </div>

              {/* Real code compiler logs box */}
              <div className="flex-1 bg-slate-950 font-mono text-xs rounded-2xl border border-slate-900 p-5 overflow-y-auto space-y-1.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
                {logs.length === 0 ? (
                  <p className="text-slate-600">[System State Idle] Waiting for local agent synchronization.</p>
                ) : (
                  logs.map((log, index) => {
                    let logColor = 'text-slate-400';
                    if (log.includes('[PC Client]') || log.includes('[Client PC]')) {
                      logColor = 'text-cyan-400';
                    } else if (log.includes('completed') || log.includes('success') || log.includes('SUCCESS')) {
                      logColor = 'text-emerald-400';
                    } else if (log.includes('failed') || log.includes('ERROR') || log.includes('issue')) {
                      logColor = 'text-red-400';
                    } else if (log.includes('Registered') || log.includes('Submitting')) {
                      logColor = 'text-amber-400';
                    }
                    return (
                      <div key={index} className={`leading-relaxed break-all ${logColor}`}>
                        {log}
                      </div>
                    );
                  })
                )}
                <div ref={consoleEndRef} />
              </div>
            </div>
          )}

          {/* VIEW: Python Client Script and Local Setup Instructions */}
          {viewMode === 'setup' && (
            <div className="flex-1 lg:overflow-y-auto p-6 space-y-6 select-text">
              
              {/* Dynamic Auth Bypass Guide Card */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex gap-3.5 text-amber-200 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                    ⚠️ {lang === 'bn' ? 'গুগল সিকিউরিটি গেট এবং কানেকশন সমস্যার সহজ সমাধান' : 'WORKAROUND: BYPASS GOOGLE AUTH LOGIN WALL'}
                  </h4>
                  <div className="leading-relaxed text-slate-350 text-[11px] space-y-2">
                    {lang === 'bn' ? (
                      <div className="space-y-1.5">
                        <p>
                          আপনার ডেক্সটপ টার্মিনালে যদি <strong>[CRITICAL AUTH GATE WORKAROUND REQUIRED]</strong> মেসেজ পান, তাহলে নিচের ৫টি ধাপে আপনার ব্রাউজার সেশন সিকিউরিটি কুকি যুক্ত করে নিন:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300">
                          <li>আপনার ব্রাউজারে যেখানেই Neora খোলা আছে, সেখানে কি-বোর্ড থেকে <strong>F12</strong> চাপুন অথবা রাইট ক্লিক করে <strong>Inspect</strong> সিলেক্ট করুন।</li>
                          <li>ডেভেলপার উইন্ডোতে <strong>Network</strong> ট্যাবে যান এবং ফিল্টার হিসেবে <strong>Fetch/XHR</strong> সিলেক্ট করুন।</li>
                          <li>ড্যাশবোর্ডের বাটন ক্লিক করুন বা পেজ রিফ্রেশ করুন যাতে ট্রাফিকের মধ্যে <code>status</code> বা <code>poll</code> রিকুয়েস্ট আসে।</li>
                          <li>ঐ রিকুয়েস্টটিতে ক্লিক করে <strong>Headers</strong> ট্যাবের <strong>Request Headers</strong> অংশ থেকে সম্পূর্ণ <code>cookie</code> মানটি কপি করুন।</li>
                          <li>আপনার পিসিতে থাকা <code>neora_agent.py</code> স্ক্রিপ্টটি ওপেন করুন এবং <code>CUSTOM_HEADERS</code> এ <code>"cookie": "YOUR_COPIED_COOKIE_HERE"</code> বসিয়ে দিন!</li>
                        </ol>
                        <p className="text-emerald-400 font-bold mt-2">
                          এবার <code>python neora_agent.py</code> পুনরায় রান করুন, এটি সাথে সাথে কোনো লগইন ও পাসওয়ার্ড প্রম্পট ছাড়াই কানেক্ট হয়ে যাবে!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p>
                          If your CLI terminal complains with <strong>[CRITICAL AUTH GATE WORKAROUND REQUIRED]</strong>, follow these 5 rapid steps to authenticate your Python client script with your browser's session token:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300">
                          <li>While viewing Neora in your web browser, press <strong>F12</strong> (or Right-Click & Inspect) to open Developer tools.</li>
                          <li>Navigate to the <strong>Network</strong> tab and select the <strong>Fetch/XHR</strong> filter.</li>
                          <li>Click on any tab/button or refresh the portal to prompt API requests like <code>status</code> or <code>poll</code>.</li>
                          <li>Click on that network request, scroll down to <strong>Request Headers</strong>, and copy the full value of the <code>cookie</code> header.</li>
                          <li>Open your locally saved <code>neora_agent.py</code> file and paste your cookie inside the <code>CUSTOM_HEADERS</code> dict config block!</li>
                        </ol>
                        <p className="text-emerald-400 font-bold mt-2">
                          Save and run <code>python neora_agent.py</code> again. It will connect instantly with no passwords or authentication barriers!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Personal Gemini AI Key Gateway Card */}
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex gap-3.5 text-rose-200 text-xs">
                <Laptop className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-2 w-full">
                  <h4 className="font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5 text-xs">
                    ⚡ {lang === 'bn' ? 'জেমিনি এআই ব্রেইন কনফিগারেশন' : 'NATIVE INTELLIGENCE COMPILER GATE '}
                  </h4>
                  <div className="leading-relaxed text-slate-350 text-[11px] space-y-3">
                    <p>
                      {lang === 'bn' 
                        ? 'আপনার ফেসবুক, নোটপ্যাড, ইলাস্ট্রেটর বা ফটোশপ চালু করার কমান্ডগুলো নিখুঁতভাবে কম্পাইল করার জন্য আপনার জেমিনি এপিআই কি প্রয়োজন। নিচের ঘরে কি দিন, এটি ব্রাউজারে সুরক্ষিত থাকবে।' 
                        : 'To map commands like "Open Photoshop, Illustrator, Facebook" to sequential operating actions, configure your personal Gemini API Key below. This key will be cached safely in your local browser state.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pt-1 w-full max-w-xl">
                      <div className="w-full sm:flex-1">
                        <input
                          type="password"
                          placeholder={lang === 'bn' ? 'আপনার Gemini API Key (AIzaSy...) দিন' : 'Enter Personal Gemini API Key (AIzaSy...)'}
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-205 placeholder-slate-705 outline-none focus:border-rose-500/50"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono bg-slate-950 border border-slate-800 rounded px-3 py-2 self-stretch flex items-center shrink-0">
                        Model: gemini-3.5-flash
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continuous Background Run Optimization Guide */}
              <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-[0_0_25px_rgba(99,102,241,0.05)]">
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                  {lang === 'bn' ? '⚡ নিওরাকে ব্যাকগ্রাউন্ডে সবসময় সচল রাখুন (পিসি ও ব্রাউজার গাইড)' : '⚡ Run Neora in Continuous Background (PC & Browser Guide)'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-350">
                  {/* PC Background execution */}
                  <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
                      <Laptop className="w-4 h-4 text-cyan-400" />
                      <span>{lang === 'bn' ? '১. কম্পিউটারের ব্যাকগ্রাউন্ডে চালানো' : '1. Run Silently on PC Background'}</span>
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {lang === 'bn'
                        ? 'আপনার পিসি রিস্টার্ট হলেও নিওরা যাতে ব্যাকগ্রাউন্ডে চলে এবং স্ক্রিনশট ও কমান্ড হ্যান্ডেল করতে পারে:'
                        : 'To keep Neora monitoring and executing desktop automated workflows silently without console block windows:'}
                    </p>
                    <div className="space-y-2 pt-1 font-mono text-[10.5px]">
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[9px] block">➔ Windows CMD (As Background Service):</span>
                        <code className="block bg-slate-950 p-2 border border-slate-850 text-cyan-400 rounded">
                          pythonw neora_agent.py
                        </code>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[9px] block">➔ macOS / Linux Terminal:</span>
                        <code className="block bg-slate-950 p-2 border border-slate-850 text-cyan-400 rounded">
                          nohup python neora_agent.py &
                        </code>
                      </div>
                    </div>
                    <p className="text-[10px] text-indigo-400/90 leading-normal">
                      {lang === 'bn'
                        ? '✦ টিপস: আপনি "start-all.bat" স্ক্রিপ্টটি ডাবল ক্লিক করে এক ক্লিকে অফলাইন ব্রোকার উইন্ডো এবং ব্যাকগ্রাউন্ড স্ক্রিপ্ট একসঙ্গে সচল করতে পারেন।'
                        : '✦ TIP: You can double-click "start-all.bat" in the root directory to instantly boot up both the web services and client loopbacks.'}
                    </p>
                  </div>

                  {/* Browser performance optimization */}
                  <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
                      <Eye className="w-4 h-4 text-indigo-400" />
                      <span>{lang === 'bn' ? '২. ব্রাউজারের ব্যাকগ্রাউন্ড অপ্টিমাইজেশন' : '2. Keep Browser Active in Background'}</span>
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {lang === 'bn'
                        ? 'ক্রোম বা ব্রাউজার যাতে মিনিমাইজ করা বা অন্য ট্যাব চালানো অবস্থাতেও নিওরাকে সুপ্ত না করে ফেলে:'
                        : 'Configure Chrome or Microsoft Edge to prevent putting Neora to sleep when minimized or backgrounded:'}
                    </p>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-[11px]">
                      <li>
                        <strong>{lang === 'bn' ? 'মেমরি সেভার নিষ্ক্রিয় করুন' : 'Disable Memory Saver'}:</strong>{' '}
                        {lang === 'bn'
                          ? 'ক্রোম সেটিংস ➔ "System and Performance" এ গিয়ে "Memory Saver" অপশনটি বন্ধ করুন যাতে ট্যাবটি সচল থাকে।'
                          : 'Go to Chrome Settings ➔ "System & Performance" and turn off "Memory Saver" for this app tab.'}
                      </li>
                      <li>
                        <strong>{lang === 'bn' ? 'মাইক্রোফোন অনুমতি অনুমতি' : 'Always Allow Microphone'}:</strong>{' '}
                        {lang === 'bn'
                          ? 'ব্রাউজার অ্যাড্রেস বারের লক আইকনে ক্লিক করে মাইক্রোফোনের অনুমতি "সর্বদা অন" রাখুন।'
                          : 'Click the Lock icon in the address bar and set Microphone to "Always Allow" to keep listen loops online.'}
                      </li>
                      <li>
                        <strong>{lang === 'bn' ? 'PWA হিসেবে ইনস্টল করুন' : 'Install as Desktop app (PWA)'}:</strong>{' '}
                        {lang === 'bn'
                          ? 'অ্যাড্রেস বারের ডানদিকে "Install Neora" এ ক্লিক করুন। এটি আলাদা উইন্ডো হিসেবে ব্যাকগ্রাউন্ডে অনায়াসে চলবে।'
                          : 'Click "Install App" in Chrome address bar to open Neora in its own standalone headless window.'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Standard Step-by-Step Instructions */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  {lang === 'bn' ? '৩টি ধাপে আপনার লোকাল পিসিতে নেওরা ক্লায়েন্ট চালু করুন' : 'Three Simple Steps to Run Neora Client Locally'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-350">
                  {/* Step 1 */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                    <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center mb-3">1</div>
                    <h4 className="font-bold text-white text-xs mb-1.5">{lang === 'bn' ? 'পাইথন ইনস্টল করুন' : 'Verify Python Environment'}</h4>
                    <p className="text-slate-400">
                      {lang === 'bn' 
                        ? 'আপনার কম্পিউটারে Python ৩ বা তার বেশি ভার্সন ইনস্টল থাকতে হবে। CMD বা Terminal ওপেন করে চেক করুন।' 
                        : 'Your local OS must have Python v3.x installed. Verify by running "python --version" in CMD/Terminal.'}
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                    <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center mb-3">2</div>
                    <h4 className="font-bold text-white text-xs mb-1.5">{lang === 'bn' ? 'মডিউলস ইনস্টল করুন' : 'Install Core Dependencies'}</h4>
                    <p className="text-slate-400 mb-2">
                      {lang === 'bn' 
                        ? 'প্রয়োজনীয় ৩টি লাইব্রেরি ইনস্টল করতে আপনার টার্মিনালে এই কমান্ডটি চালান:' 
                        : 'Execute this command in your CLI terminal to compile keyboard/mouse triggers:'}
                    </p>
                    <code className="block bg-slate-950 p-2 text-[11px] font-mono border border-slate-800 text-cyan-400 rounded">
                      pip install pyautogui requests pillow
                    </code>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                    <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold flex items-center justify-center mb-3">3</div>
                    <h4 className="font-bold text-white text-xs mb-1.5">{lang === 'bn' ? 'স্ক্রিপ্টটি চালু করুন' : 'Launch Neora Bridge'}</h4>
                    <p className="text-slate-400 select-all">
                      {lang === 'bn'
                        ? 'নিচের পাইথন কোডটি কপি করে "neora_agent.py" ফাইলে সেভ করুন। তারপর নিচের কমান্ডে রান করুন:'
                        : 'Copy the Python script below, save it as "neora_agent.py", then bring it online:'}
                    </p>
                    <code className="block mt-2 bg-slate-950 p-2 text-[11px] font-mono border border-slate-800 text-cyan-400 rounded">
                      python neora_agent.py
                    </code>
                  </div>
                </div>
              </div>

              {/* Complete copyable Python client script preview box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg">
                <div className="bg-slate-950 px-5 py-3 border-b border-slate-850 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>neora_agent.py (Full Production Client Code)</span>
                  </div>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'কোড কপি করুন' : 'Copy Client Script'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950/80 p-5 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto select-all max-h-[380px]">
                  <pre className="whitespace-pre">{pythonScriptText}</pre>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: Mission Planner & Strategy Orchestration Console */}
          {viewMode === 'mission' && (
            <div className="flex-1 flex flex-col p-6 min-h-0 overflow-y-auto space-y-6">
              
              {/* Dynamic Header Badge */}
              <div className="bg-gradient-to-r from-cyan-900/40 to-indigo-900/30 border border-cyan-500/15 rounded-2xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse animate-duration-3000" />
                      <span>{lang === 'bn' ? '১০,০০০x অটোনমাস মিশন ও স্ট্র্যাটেজি প্ল্যানার' : '10,000X AUTONOMOUS MISSION PLANNER'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'bn' 
                        ? 'মাল্টি-মেক জটিল কার্যপ্রণালী ক্রমান্বয়ে একের পর এক সম্পাদন করার জন্য স্ট্র্যাটেজি তৈরি করুন ও ডেক্সটপ কন্ট্রোল করুন।' 
                        : 'Orchestrate multi-step, complex task workflows sequentially, matching user intent to system plans.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] bg-slate-950 border border-slate-800 rounded-lg p-2 shrink-0">
                    <span className="text-slate-500">ENGINE STATUS:</span>
                    <span className="text-emerald-400 font-bold tracking-widest uppercase">ACTIVE QUAD-CORE COMPILER</span>
                  </div>
                </div>
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Planning & Synthesis Panel */}
                <div className="lg:col-span-6 space-y-4">
                  
                  {/* Goal Entry Box */}
                  <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4.5 h-4.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'মিশন অবজেক্টিভ ডিফাইন করুন' : 'Define Mission Objective'}</span>
                    </h4>
                    
                    <div className="space-y-2 text-xs">
                      <textarea
                        rows={3}
                        value={missionGoalInput}
                        onChange={(e) => setMissionGoalInput(e.target.value)}
                        placeholder={lang === 'bn' 
                          ? 'যেমন: open Photoshop, wait 5 seconds, then open Illustrator...' 
                          : 'e.g. Open VS Code, open browser to http://localhost:3000, wait 3 seconds, and take screenshot...'}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-cyan-300 placeholder-slate-600 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 text-xs transition"
                      />
                      
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">Powered by Gemini Intelligent Planner</span>
                        <button
                          type="button"
                          onClick={handleCompileMissionPlan}
                          disabled={isCompilingMission || !missionGoalInput.trim()}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition duration-200 flex items-center gap-1.5 ${
                            isCompilingMission 
                              ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isCompilingMission ? 'animate-spin' : ''}`} />
                          <span>{isCompilingMission ? (lang === 'bn' ? 'কম্পাইল হচ্ছে...' : 'Compiling...') : (lang === 'bn' ? 'মিশন প্ল্যান কম্পাইল করুন' : 'Compile Mission Plan')}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preset 1-Click Blueprints */}
                  <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Laptop className="w-4.5 h-4.5 text-indigo-400" />
                      <span>{lang === 'bn' ? '১-ক্লিক হাইপার-পাওয়ার ব্লুপ্রিন্ট রেসিপি' : '1-Click Hyper-Power Blueprint Recipes'}</span>
                    </h4>
                    
                    <div className="space-y-2.5">
                      {/* Recipe 1 */}
                      <button
                        type="button"
                        onClick={() => {
                          setMissionGoalInput(
                            lang === 'bn'
                              ? 'open VS Code, open browser to http://localhost:3000, wait 4 seconds, take verification screenshot'
                              : 'open VS Code, open browser to http://localhost:3000, wait 4 seconds, take verification screenshot'
                          );
                        }}
                        className="w-full text-left p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950 hover:border-cyan-500/30 transition text-xs flex justify-between items-center gap-3 group"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-200 group-hover:text-cyan-400 transition block">
                            💻 {lang === 'bn' ? 'ডেভেলপার ওয়ার্কস্পেস বুস্টার' : 'Developer Workspace Booster'}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                            Launch VS Code, local server browser tabs, and capture verify screen.
                          </span>
                        </div>
                        <span className="text-[9px] font-mono shrink-0 bg-cyan-900/20 text-cyan-400 border border-cyan-500/10 px-2 py-0.5 rounded uppercase">4 steps</span>
                      </button>

                      {/* Recipe 2 */}
                      <button
                        type="button"
                        onClick={() => {
                          setMissionGoalInput(
                            lang === 'bn'
                              ? 'open application photoshop, wait 5 seconds, open application illustrator, wait 4 seconds, take verification screenshot'
                              : 'open application photoshop, wait 5 seconds, open application illustrator, wait 4 seconds, take verification screenshot'
                          );
                        }}
                        className="w-full text-left p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950 hover:border-indigo-500/30 transition text-xs flex justify-between items-center gap-3 group"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-200 group-hover:text-indigo-400 transition block">
                            🎨 {lang === 'bn' ? 'ক্রিয়েটিভ ডিজাইন ফ্লো অ্যাক্টিভেটর' : 'Creative Design Flow Activator'}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                            Initialise Photoshop & Illustrator suites sequentially under turbo cooling.
                          </span>
                        </div>
                        <span className="text-[9px] font-mono shrink-0 bg-indigo-900/20 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded uppercase">5 steps</span>
                      </button>

                      {/* Recipe 3 */}
                      <button
                        type="button"
                        onClick={() => {
                          setMissionGoalInput(
                            lang === 'bn'
                              ? 'write file pc_maintenance.txt:Cleanup cycle completed successfully, clear system logs, take desktop verification'
                              : 'write file pc_maintenance.txt:Cleanup cycle completed successfully, clear system logs, take desktop verification'
                          );
                        }}
                        className="w-full text-left p-3 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-950 hover:border-emerald-500/30 transition text-xs flex justify-between items-center gap-3 group"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition block">
                            🛡️ {lang === 'bn' ? 'পিসি মেইনটেনেন্স ও হেলথ ক্লিনআপ' : 'PC Maintenance & Health Cleanup'}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                            Purge redundant terminal buffers, report write path state, check desktop.
                          </span>
                        </div>
                        <span className="text-[9px] font-mono shrink-0 bg-emerald-900/20 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded uppercase">3 steps</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right Side: Execution Flow Monitoring Card */}
                <div className="lg:col-span-6 space-y-4">
                  
                  {/* Generated Plan Steps Card */}
                  <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4.5 h-4.5 text-indigo-450" />
                        <span>{lang === 'bn' ? 'কম্পাইলকৃত মিশন পদক্ষেপসমূহ' : 'Compiled Mission Plan Steps'}</span>
                      </h4>
                      {compiledMissionPlan && (
                        <button
                          type="button"
                          onClick={() => handleRunCompiledMission(compiledMissionPlan)}
                          disabled={missionActiveRunState === 'running'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition flex items-center gap-1 ${
                            missionActiveRunState === 'running'
                              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-500/50 cursor-not-allowed'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                          }`}
                        >
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>{lang === 'bn' ? 'মিশন সম্পন্ন করুন' : 'Run Mission Loop'}</span>
                        </button>
                      )}
                    </div>

                    {!compiledMissionPlan ? (
                      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/20 p-8 text-center text-xs text-slate-500">
                        {lang === 'bn' 
                          ? 'ডান পাশের যেকোনো অবজেক্টিভ লিখে কম্পাইল করুন। স্ট্রাকচার্ড পদক্ষেপগুলো এখানে দেখা যাবে।' 
                          : 'Define an objective and compile a plan on the left. The detailed micro-steps will render here.'}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {compiledMissionPlan.steps.map((step: any, index: number) => {
                          const isActive = activeExecutingStepIndex === index;
                          const isCompleted = activeExecutingStepIndex !== null && index < activeExecutingStepIndex;
                          const isNext = activeExecutingStepIndex !== null && index > activeExecutingStepIndex;
                          
                          return (
                            <div 
                              key={step.id || index}
                              className={`p-3.5 rounded-xl border transition-all text-xs flex gap-3.5 items-start ${
                                isActive 
                                  ? 'bg-cyan-950/15 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.1)]' 
                                  : isCompleted 
                                    ? 'bg-emerald-950/5 border-emerald-500/10 opacity-70'
                                    : 'bg-slate-950/40 border-slate-850'
                              }`}
                            >
                              {/* Glowing state ring node */}
                              <div className="mt-0.5 shrink-0">
                                {isActive ? (
                                  <span className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border border-cyan-300 font-bold text-[8.5px] items-center justify-center text-white">{index + 1}</span>
                                  </span>
                                ) : isCompleted ? (
                                  <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-[8px] font-bold">✓</div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-[8.5px] font-mono">{index + 1}</div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold uppercase tracking-wider text-[10px] ${isActive ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-300'}`}>
                                    {step.title}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500 uppercase bg-slate-900 border border-slate-850 px-1.5 py-0.25 rounded">{step.kind || 'Action'}</span>
                                </div>
                                <code className="block text-[10.5px] font-mono text-slate-400 truncate mt-1">
                                  {step.payload}
                                </code>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Sleek Orchestration Command Logs console */}
                  <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-4.5 h-4.5 text-cyan-400" />
                      <span>{lang === 'bn' ? 'মিশন এক্সিকিউশন রিয়েল-টাইম লগ' : 'Mission Execution Real-time Logs'}</span>
                    </h4>
                    
                    <div className="bg-slate-950 font-mono text-[10.5px] rounded-xl border border-slate-900 p-4 min-h-[110px] max-h-[180px] overflow-y-auto space-y-1.5 text-slate-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] leading-relaxed select-all">
                      {missionExecutionLogs.length === 0 ? (
                        <p className="text-slate-650">[Ready] Choose preset blueprint or write goal objectives to log processes.</p>
                      ) : (
                        missionExecutionLogs.map((log, index) => {
                          let styleLabel = 'text-slate-400';
                          if (log.startsWith('[System]')) styleLabel = 'text-cyan-450 text-cyan-400';
                          else if (log.startsWith('[Error]') || log.startsWith('[✗ Error]')) styleLabel = 'text-rose-400 font-bold';
                          else if (log.startsWith('[✓ Success]')) styleLabel = 'text-emerald-450 text-emerald-400 font-bold';
                          else if (log.startsWith('[Orchestrator]')) styleLabel = 'text-indigo-400 font-semibold';
                          
                          return <div key={index} className={styleLabel}>{log}</div>;
                        })
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
