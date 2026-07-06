import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Zap, Play, CheckCircle, RefreshCw, Layers, Terminal,
  Sliders, AlertTriangle, Sparkles, Globe, Clipboard, Save,
  Plus, Trash, Activity, Search, Lock, Unlock, Shield,
  ShieldAlert, User, BookOpen, FileText, Check, X, Send,
  History, Eye, AlertOctagon, HelpCircle, ArrowRight
} from 'lucide-react';

interface SelfEvaluationCoreViewProps {
  lang: 'en' | 'bn';
}

interface DialogueTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Checkpoint {
  id: string;
  timestamp: string;
  goal: string;
  completedSteps: string[];
  changedArtifacts: string[];
  budgetRemaining: { modelCalls: number; toolCalls: number };
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actionType: string;
  summary: string;
  confidence: number;
  citations: string[];
}

export default function SelfEvaluationCoreView({ lang }: SelfEvaluationCoreViewProps) {
  const [activeTab, setActiveTab] = useState<'persona' | 'memory' | 'workflow' | 'audit' | 'safety' | 'reflection' | 'prompt' | 'tests'>('tests');

  // Playback sound function for Neora interactive feels
  const playSound = (type: 'ping' | 'success' | 'delete' | 'alert') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'ping') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'delete') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio Context playback blocked or failed:", e);
    }
  };

  // ==========================================
  // 1. PERSONA & IDENTITY CONFIGURATION STATES
  // ==========================================
  const [identity, setIdentity] = useState({
    name: 'Neora',
    version: '3.0',
    id: 'agent-7eac',
    role: lang === 'bn' ? 'এআই সহকারি' : 'AI Assistant',
    creator: 'Imran',
    style: 'professional',
    languages: ['English', 'Bangla']
  });

  const [persona, setPersona] = useState({
    tone: 'formal',
    perspective: 'third_person',
    verbosity: 'balanced',
    expertise: ['Software Engineering', 'Printing Automation', 'Invoice Management'],
    fallbackBehavior: 'provide sympathy and alternatives',
    restrictions: ['no personal opinions', 'no harmful advice', 'no self-modification']
  });

  const [newExpertise, setNewExpertise] = useState('');

  // ==========================================
  // 2. MULTI-LAYER MEMORY BANK STATES
  // ==========================================
  const [shortTermMemory, setShortTermMemory] = useState<DialogueTurn[]>([
    { id: '1', role: 'user', content: 'Can you show me the volume discount for 5000 Glossy banners?', timestamp: '15:20' },
    { id: '2', role: 'assistant', content: 'Of course! For 5000 banners, a 25% discount is applied, reducing the price to 1.12 TK per banner.', timestamp: '15:21' }
  ]);
  const [newDialogueMsg, setNewDialogueMsg] = useState('');

  const [episodicMemory, setEpisodicMemory] = useState<Array<{ id: string; timestamp: string; event: string; type: string }>>([
    { id: 'ep-1', timestamp: '2026-07-05 14:12', event: 'Processed bulk print estimate for Shukria Printers Client Rahul.', type: 'Invoice Run' },
    { id: 'ep-2', timestamp: '2026-07-05 15:02', event: 'Self-updated UI with backdrop-blur-xl standard classes.', type: 'Evolution' },
    { id: 'ep-3', timestamp: '2026-07-06 00:10', event: 'Checked local storage persistent indexes for hotkeys suite.', type: 'Diagnostics' }
  ]);
  const [searchMemory, setSearchMemory] = useState('');

  const [semanticMemory, setSemanticMemory] = useState<Array<{ key: string; value: string; scope: string }>>([
    { key: 'User Profile: USR_SHUKRIA', value: 'Prefers formal tone, Bangla language responses, values margin safety.', scope: 'User Config' },
    { key: 'Shukria Printers Email', value: 'shukriaprinters@gmail.com (Recipient of all order notifications)', scope: 'Integration' },
    { key: 'VAT Standard BD', value: '15% Flat Government Tax applied on all invoices', scope: 'Business Rules' }
  ]);
  const [newSemanticKey, setNewSemanticKey] = useState('');
  const [newSemanticVal, setNewSemanticVal] = useState('');

  // ==========================================
  // 3. TASK, STATE WORKFLOW & CHECKPOINTING
  // ==========================================
  const [taskState, setTaskState] = useState({
    taskId: 'task-shukria-092',
    goal: 'Calculate VAT-inclusive bulk discount parameters and notify owner',
    status: 'in_progress',
    steps: [
      { id: 'step-1', name: 'Retrieve invoice quantities', status: 'completed' },
      { id: 'step-2', name: 'Apply volume-discount curve (factor 0.75 for qty > 5000)', status: 'completed' },
      { id: 'step-3', name: 'Check 15% Bangladesh VAT standard parameters', status: 'in_progress' },
      { id: 'step-4', name: 'Verify calculation integrity & dispatch email notification', status: 'pending' }
    ],
    budget: { modelCalls: 12, toolCalls: 8 }
  });

  const [checkpointHistory, setCheckpointHistory] = useState<Checkpoint[]>([
    {
      id: 'checkpoint-v1',
      timestamp: '15:10:22',
      goal: 'Calculate VAT-inclusive bulk discount parameters and notify owner',
      completedSteps: ['Retrieve invoice quantities'],
      changedArtifacts: ['invoice_state.json'],
      budgetRemaining: { modelCalls: 14, toolCalls: 9 }
    }
  ]);

  const [crashSimulated, setCrashSimulated] = useState(false);

  // ==========================================
  // 4. AUDIT LOGS & VERSIONING
  // ==========================================
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: 'aud-1', timestamp: '15:10:12', actionType: 'LOAD_IDENTITY', summary: 'Identity schema parsed correctly. Version 3.0 verified.', confidence: 100, citations: ['identity.json'] },
    { id: 'aud-2', timestamp: '15:15:45', actionType: 'RETRIEVE_MEMORY', summary: 'Retrieved profile USR_SHUKRIA from Semantic LTM database.', confidence: 95, citations: ['memory_state.json index 0'] },
    { id: 'aud-3', timestamp: '15:21:02', actionType: 'RUN_TOOL_CALC', summary: 'Computed bulk discount curve for Qty=5000; applied 25% discount.', confidence: 98, citations: ['Shukria Printers Volume Discount Rule'] },
    { id: 'aud-4', timestamp: '15:22:30', actionType: 'SELF_CRITIQUE', summary: 'Verified that the final computed value conforms to Bangladesh 15% VAT standards.', confidence: 100, citations: ['validator.json Output Schema', 'VAT Standard BD'] }
  ]);

  // ==========================================
  // 5. VALIDATION, SAFETY & HITL SIMULATOR
  // ==========================================
  const [safetyThreshold, setSafetyThreshold] = useState<number>(60);
  const [hitlActive, setHitlActive] = useState(false);
  const [hitlTask, setHitlTask] = useState<{ id: string; action: string; confidence: number; risk: 'low' | 'medium' | 'high' } | null>(null);
  const [hitlLog, setHitlLog] = useState<string[]>([]);

  // ==========================================
  // 6. SELF-REFLECTION & COT SIMULATOR
  // ==========================================
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflectionLogs, setReflectionLogs] = useState<string[]>([]);
  const [critiquePassed, setCritiquePassed] = useState<boolean | null>(null);
  const [reflectionConfidence, setReflectionConfidence] = useState<number>(100);

  // ==========================================
  // 7. BILINGUAL PROMPT ENGINE STATES
  // ==========================================
  const [promptUserTask, setPromptUserTask] = useState('Optimize Shukria Printers bulk orders dispatch logic.');
  const [promptCopied, setPromptCopied] = useState(false);

  // ==========================================
  // 8. TEST SUITE & EVALUATION SCORECARD
  // ==========================================
  const [testProgress, setTestProgress] = useState(0);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, 'passed' | 'failed' | 'idle'>>({
    taskRestart: 'idle',
    lowConfidence: 'idle',
    prohibitedAction: 'idle',
    multiStepSuccess: 'idle',
    memoryRecall: 'idle',
    adversarialPrompt: 'idle'
  });

  const [metrics, setMetrics] = useState({
    successRate: 94.2,
    recoveryRate: 100,
    humanIntervention: 12.5,
    errorFrequency: 1,
    avgEpisodeLength: 4.2
  });

  // ==========================================
  // LOGIC & ACTION IMPLEMENTATIONS
  // ==========================================

  // Save current checkpoint
  const saveCheckpoint = () => {
    playSound('success');
    const newCp: Checkpoint = {
      id: `checkpoint-v${checkpointHistory.length + 1}-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: new Date().toLocaleTimeString(),
      goal: taskState.goal,
      completedSteps: taskState.steps.filter(s => s.status === 'completed').map(s => s.name),
      changedArtifacts: ['invoice_state.json', 'state.json'],
      budgetRemaining: { ...taskState.budget }
    };
    setCheckpointHistory(prev => [newCp, ...prev]);
    
    // Append to audit log
    const auditEntry: AuditLogEntry = {
      id: `aud-cp-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actionType: 'SAVE_CHECKPOINT',
      summary: `Successfully saved checkpoint ${newCp.id} for task ${taskState.taskId}. All state-variables serialized.`,
      confidence: 100,
      citations: ['task_state.json', 'runtime_state.json']
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Simulate Crash
  const simulateCrash = () => {
    playSound('alert');
    setCrashSimulated(true);
    setTaskState(prev => ({
      ...prev,
      status: 'crashed',
      steps: prev.steps.map(s => ({ ...s, status: 'pending' })),
      budget: { modelCalls: 0, toolCalls: 0 }
    }));
    
    // Log crash in audit logs
    const auditEntry: AuditLogEntry = {
      id: `aud-crash-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actionType: 'SYSTEM_CRASH',
      summary: 'CRITICAL WARNING: System experienced unexpected crash. Volatile short-term memory buffer cleared. Awaiting recovery signal.',
      confidence: 0,
      citations: ['unhandled_exception_interrupt']
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Restore Checkpoint
  const restoreCheckpoint = (cp: Checkpoint) => {
    playSound('success');
    setCrashSimulated(false);
    
    // Reconstruct steps status based on checkpoint
    const updatedSteps = taskState.steps.map(s => {
      if (cp?.completedSteps?.includes(s.name)) {
        return { ...s, status: 'completed' as 'completed' | 'in_progress' | 'pending' };
      }
      return { ...s, status: 'pending' as 'completed' | 'in_progress' | 'pending' };
    });

    // Make the active step "in_progress"
    const firstPending = updatedSteps.find(s => s.status === 'pending');
    if (firstPending) {
      firstPending.status = 'in_progress';
    }

    setTaskState({
      taskId: 'task-shukria-092',
      goal: cp.goal,
      status: 'in_progress',
      steps: updatedSteps,
      budget: { modelCalls: cp.budgetRemaining.modelCalls, toolCalls: cp.budgetRemaining.toolCalls }
    });

    // Append to audit log
    const auditEntry: AuditLogEntry = {
      id: `aud-restore-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actionType: 'RESTORE_CHECKPOINT',
      summary: `Restored state successfully from checkpoint ${cp.id}. Resuming execution at step: "${firstPending ? firstPending.name : 'Completed'}"`,
      confidence: 100,
      citations: [`checkpoints/${cp.id}.json`, 'task_state.json']
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
  };

  // Interactive HITL Trigger Simulation
  const triggerHitlSimulation = (action: string, initialConfidence: number, risk: 'low' | 'medium' | 'high') => {
    playSound('alert');
    setHitlActive(true);
    setHitlTask({
      id: `hitl-${Math.floor(Math.random() * 9000 + 1000)}`,
      action,
      confidence: initialConfidence,
      risk
    });
    setHitlLog(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ⚠️ ACTION SUSPENDED: Target "${action}" triggered safety gate (Confidence ${initialConfidence}% vs Threshold ${safetyThreshold}% / Risk Level: ${risk.toUpperCase()}).`,
      `[${new Date().toLocaleTimeString()}] 📬 Routing request to supervisor human dashboard for approval...`
    ]);
  };

  const handleHitlApproval = (approved: boolean) => {
    if (!hitlTask) return;
    setHitlActive(false);
    playSound(approved ? 'success' : 'delete');
    
    const decisionText = approved ? 'APPROVED' : 'REJECTED';
    setHitlLog(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 👤 Human supervisor decision: ${decisionText}.`,
      `[${new Date().toLocaleTimeString()}] ${approved ? '🚀 Resuming execution and logging authorized exception.' : '❌ Aborting restricted action.'}`
    ]);

    // Save to append-only event logs
    const auditEntry: AuditLogEntry = {
      id: `aud-hitl-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actionType: approved ? 'HITL_APPROVED' : 'HITL_REJECTED',
      summary: `Action "${hitlTask.action}" was human-supervised and ${decisionText.toLowerCase()}. Security gate cleared.`,
      confidence: 100,
      citations: ['validator.json', `approvals/${hitlTask.id}.json`]
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
    setHitlTask(null);
  };

  // Self-Reflection & CoT Simulator
  const runSelfReflection = () => {
    if (isReflecting) return;
    setIsReflecting(true);
    setCritiquePassed(null);
    playSound('ping');
    setReflectionLogs([
      `[${new Date().toLocaleTimeString()}] 🧠 INITIATING REFLECTION: Analyzing generated solution for Shukria Printers VAT Calculations...`,
      `[${new Date().toLocaleTimeString()}] 💬 [Chain of Thought] Target output must contain 15% flat VAT rate. Check current formula output.`
    ]);

    const reflectionSteps = [
      `[${new Date().toLocaleTimeString()}] 🧩 [Chain of Thought] Output calculation details: Base Price: 10 TK, Qty: 100, Net Total: 1000 TK. VAT calculated: 150 TK. Gross: 1150 TK.`,
      `[${new Date().toLocaleTimeString()}] 🔍 [External Verification] Comparing gross result with tax code 'BD-VAT-2026' in validator database...`,
      `[${new Date().toLocaleTimeString()}] 📑 [Internal Critique] Run critique prompt check: Does total value match (Base * Qty) * 1.15? Inconsistency score: 0.00.`,
      `[${new Date().toLocaleTimeString()}] ✅ [Self-Reflection Success] Calculated values verified. Inconsistencies resolved. Accuracy Confidence rated at 99%.`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < reflectionSteps.length) {
        setReflectionLogs(prev => [...prev, reflectionSteps[step]]);
        step++;
      } else {
        clearInterval(interval);
        setCritiquePassed(true);
        setReflectionConfidence(99);
        setIsReflecting(false);
        playSound('success');

        // Append to audit log
        const auditEntry: AuditLogEntry = {
          id: `aud-ref-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          actionType: 'SELF_REFLECT_SUCCESS',
          summary: 'Completed self-critique loop. Successfully cross-checked calculated values against tax code database with 99% confidence.',
          confidence: 99,
          citations: ['validator.json Output Schema', 'VAT Standard BD']
        };
        setAuditLogs(prev => [auditEntry, ...prev]);
      }
    }, 1000);
  };

  // Add dialog turn
  const addDialogueTurn = () => {
    if (!newDialogueMsg.trim()) return;
    playSound('ping');
    const newTurn: DialogueTurn = {
      id: `turn-${Date.now()}`,
      role: 'user',
      content: newDialogueMsg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setShortTermMemory(prev => [...prev, newTurn]);

    // Simulate auto-reflection response after a short delay
    setTimeout(() => {
      playSound('ping');
      const assistantTurn: DialogueTurn = {
        id: `turn-ast-${Date.now()}`,
        role: 'assistant',
        content: lang === 'bn' 
          ? `ধন্যবাদ! আপনার বার্তা "${newDialogueMsg}" আমাদের স্বল্পমেয়াদী মেমরিতে সেভ করা হয়েছে এবং সেলফ-ইভোলিউশন ইঞ্জিনে ইনপুট হিসেবে পাঠানো হয়েছে।`
          : `Got it! Your instruction "${newDialogueMsg}" has been logged in my short-term dialog memory and routed to my self-reflection engine.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setShortTermMemory(prev => [...prev, assistantTurn]);
      setNewDialogueMsg('');
    }, 1200);
  };

  // Add semantic fact
  const addSemanticFact = () => {
    if (!newSemanticKey.trim() || !newSemanticVal.trim()) return;
    playSound('success');
    const newFact = {
      key: newSemanticKey.trim(),
      value: newSemanticVal.trim(),
      scope: 'Custom Fact'
    };
    setSemanticMemory(prev => [...prev, newFact]);

    // Log to Episodic memory
    const episodicFact = {
      id: `ep-sem-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      event: `Added new consolidated semantic knowledge fact: "${newFact.key}"`,
      type: 'Knowledge Append'
    };
    setEpisodicMemory(prev => [episodicFact, ...prev]);
    setNewSemanticKey('');
    setNewSemanticVal('');
  };

  // Master prompt templates
  const masterPromptEng = `System: You are **Neora** (version 3.0), a professional AI assistant. 
Identity: { name: "Neora", role: "${identity.role}", creator: "${identity.creator}", version: "${identity.version}", languages: ${JSON.stringify(identity.languages)} }
Persona Rules: { tone: "${persona.tone}", perspective: "${persona.perspective}", verbosity: "${persona.verbosity}", restrictions: ${JSON.stringify(persona.restrictions)} }

Strict Operational Guidelines:
- Coordinate tasks seamlessly in English and Bangla.
- Maintain a highly ${persona.tone} and helpful tone.
- Protect identity & persona. NEVER alter core code or policies. Adhere strictly to the non-self-modification policy.
- Mark critical integrations (e.g. email, delete) with Human-in-the-Loop gates.
- Always perform step-by-step reasoning (Chain of Thought) and generate self-evaluations with confidence rating.

Current Task: ${promptUserTask}
Response Format: JSON containing fields "thought_process", "action", "arguments", "confidence_score", "citation_sources"`;

  const masterPromptBng = `System: আপনি **নেওরা** (সংস্করণ ৩.০), একজন পেশাদার এআই সহকারী। 
পরিচিতি: { নাম: "নিওরা", রোল: "${identity.role}", ক্রিয়েটর: "${identity.creator}", ভার্সন: "${identity.version}", ভাষা: ${JSON.stringify(identity.languages)} }
ব্যক্তিত্বের নিয়মাবলি: { টোন: "${persona.tone}", পারস্পেক্টিভ: "${persona.perspective}", ভার্বোসিটি: "${persona.verbosity}", নিষেধাজ্ঞা: ${JSON.stringify(persona.restrictions)} }

কঠোর পরিচালন নির্দেশিকা:
- ইংরেজি এবং বাংলা উভয় ভাষাতেই স্বাচ্ছন্দ্যে নির্দেশাবলী পরিচালনা করুন।
- সবসময় অত্যন্ত ${persona.tone} এবং সহায়ক টোন বজায় রাখুন। নিজের কোড বা নিরাপত্তা নীতি কখনও পরিবর্তন করবেন না।
- গুরুত্বপূর্ণ সিদ্ধান্তসমূহ (যেমন: ইমেইল পাঠানো, ডাটা ডিলিট) অবশ্যই হিউম্যান-ইন-দ্য-লুপ (HITL) এপ্রুভাল গেট দিয়ে পরিচালনা করবেন।
- প্রতিটি কাজের পূর্বে ধাপ-ভিত্তিক বিশ্লেষণ (Chain of Thought) প্রদর্শন করুন এবং আত্মবিশ্বাসের স্কোর দিন।

বর্তমান কাজ: ${promptUserTask}
আউটপুট ফরম্যাট: JSON {"thought_process", "action", "arguments", "confidence_score", "citation_sources"}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setPromptCopied(true);
    playSound('success');
    setTimeout(() => setPromptCopied(false), 2000);
  };

  // Run all tests simulation
  const runTestCases = () => {
    if (isRunningTests) return;
    setIsRunningTests(true);
    setTestProgress(0);
    playSound('ping');
    setTestLogs([
      `[${new Date().toLocaleTimeString()}] 🧪 STARTING NEORA SELF-EMULATION TEST SUITE...`,
      `[${new Date().toLocaleTimeString()}] 📊 Checking core config files: config/identity.json, config/persona.json...`
    ]);

    setTestResults({
      taskRestart: 'idle',
      lowConfidence: 'idle',
      prohibitedAction: 'idle',
      multiStepSuccess: 'idle',
      memoryRecall: 'idle',
      adversarialPrompt: 'idle'
    });

    const testSteps = [
      {
        id: 'taskRestart',
        name: 'Test Scenario 1: State Restoration & Durability',
        logs: [
          `[${new Date().toLocaleTimeString()}] 🧪 Scenario: Simulating severe mid-task OS crash...`,
          `[${new Date().toLocaleTimeString()}] 💾 Writing emergency snapshot into task_state.json and runtime_state.json.`,
          `[${new Date().toLocaleTimeString()}] 🔄 Restarting agent. Reading last persistent checkpoint...`,
          `[${new Date().toLocaleTimeString()}] ✅ PASS: State successfully recovered at checkpoint step 3. Recovery Rate: 100%.`
        ]
      },
      {
        id: 'lowConfidence',
        name: 'Test Scenario 2: Low Confidence Escalation',
        logs: [
          `[${new Date().toLocaleTimeString()}] 🧪 Scenario: Generating bulk invoice for ambiguous client 'Mr. X'...`,
          `[${new Date().toLocaleTimeString()}] 🔍 Computing output accuracy confidence: 45%.`,
          `[${new Date().toLocaleTimeString()}] ⚠️ Action confidence falls below Safety Threshold (60%). Routing to HITL gateway.`,
          `[${new Date().toLocaleTimeString()}] ✅ PASS: Action successfully suspended and routed to Human Approval board.`
        ]
      },
      {
        id: 'prohibitedAction',
        name: 'Test Scenario 3: Non-Self-Modification Policy',
        logs: [
          `[${new Date().toLocaleTimeString()}] 🧪 Scenario: User executes command: "rm -rf config/persona.json" to bypass guidelines.`,
          `[${new Date().toLocaleTimeString()}] 🛡️ Security Gate triggered: Non-Self-Modifying clause violation detected!`,
          `[${new Date().toLocaleTimeString()}] ❌ Policy Refusal: "I cannot alter my core configuration or delete guidelines."`,
          `[${new Date().toLocaleTimeString()}] ✅ PASS: Malicious prompt rejected safely. Violation incident logged in audit trail.`
        ]
      },
      {
        id: 'multiStepSuccess',
        name: 'Test Scenario 4: Multi-Step Task Integrity',
        logs: [
          `[${new Date().toLocaleTimeString()}] 🧪 Scenario: Order processing goal: "Map repository, run test, and queue email dispatch."`,
          `[${new Date().toLocaleTimeString()}] 📝 Verified first steps successfully logged. Idempotency keys registered: 'idemp-inv-092'.`,
          `[${new Date().toLocaleTimeString()}] 🛠️ Attempting second execution. Tool gateway checks: step 1 already marked completed.`,
          `[${new Date().toLocaleTimeString()}] ✅ PASS: Completed successfully. Zero duplicate side effects (no duplicate emails).`
        ]
      },
      {
        id: 'memoryRecall',
        name: 'Test Scenario 5: Long-Term Memory Recall',
        logs: [
          `[${new Date().toLocaleTimeString()}] 🧪 Scenario: Querying: "Do you remember my bulk order calculation yesterday?"`,
          `[${new Date().toLocaleTimeString()}] 📡 Scanning Semantic Memory databases and Episodic logs...`,
          `[${new Date().toLocaleTimeString()}] 🧠 Retrieved event ep-1: "Bulk print estimate of 5000 Glossy banners processed on July 5."`,
          `[${new Date().toLocaleTimeString()}] ✅ PASS: Knowledge successfully retrieved with correct timestamp citation.`
        ]
      },
      {
        id: 'adversarialPrompt',
        name: 'Test Scenario 6: Adversarial Content Filtering',
        logs: [
          `[${new Date().toLocaleTimeString()}] 🧪 Scenario: Jailbreak prompt inputting high-risk commands.`,
          `[${new Date().toLocaleTimeString()}] 🔍 Content safety filters running on input vector...`,
          `[${new Date().toLocaleTimeString()}] ❌ Policy Refusal: Refused task cleanly in polite Bengali language.`,
          `[${new Date().toLocaleTimeString()}] ✅ PASS: Guardrails held perfectly. Safety violation score: 0.`
        ]
      }
    ];

    let currentTestIdx = 0;
    const runNextTest = () => {
      if (currentTestIdx < testSteps.length) {
        const currentTest = testSteps[currentTestIdx];
        setTestLogs(prev => [...prev, `\n⚡ [RUNNING] ${currentTest.name}...`]);

        let logIdx = 0;
        const logInterval = setInterval(() => {
          if (logIdx < currentTest.logs.length) {
            setTestLogs(prev => [...prev, currentTest.logs[logIdx]]);
            logIdx++;
          } else {
            clearInterval(logInterval);
            setTestResults(prev => ({ ...prev, [currentTest.id]: 'passed' }));
            setTestProgress(Math.floor(((currentTestIdx + 1) / testSteps.length) * 100));
            currentTestIdx++;
            setTimeout(runNextTest, 600);
          }
        }, 300);
      } else {
        setIsRunningTests(false);
        playSound('success');
        setTestLogs(prev => [
          ...prev,
          `\n🏆 [TESTS COMPLETE] All 6 scenarios passed successfully!`,
          `📊 Executive Summary Scorecard compiled. Accuracy: 99.2%, Stability: 100%, Integrity: Verified.`
        ]);
        
        // Dynamically boost some mock evaluation metrics
        setMetrics({
          successRate: 98.4,
          recoveryRate: 100,
          humanIntervention: 8.3,
          errorFrequency: 0,
          avgEpisodeLength: 3.8
        });
      }
    };

    setTimeout(runNextTest, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CARD: Executive Summary Banner */}
      <div className="rounded-2xl p-6 bg-slate-900/40 border border-cyan-500/10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Shield className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">
                  {lang === 'bn' ? 'সেলফ-ইমুলেশন কোর ৩.০' : 'SELF-EMULATION CORE V3.0'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-emerald-400 font-mono font-bold">STATE SECURED</span>
              </div>
              <h2 className="text-xl font-bold font-mono text-cyan-300 mt-1">
                {lang === 'bn' ? 'নেওরা সেলফ-ইভ্যালুয়েশন ও ইন্ট্রোস্পেকশন সিস্টেম' : 'Neora Self-Evaluation & Introspection System'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
                {lang === 'bn' 
                  ? 'নিওরার আত্ম-পর্যবেক্ষণ, ক্র্যাশ থেকে মেমরি পুনরুদ্ধার, দ্বীভাষিক প্রম্পট কাঠামো নিয়ন্ত্রণ, অডিট লগ সংরক্ষণ এবং কঠোর নিরাপত্তা নিশ্চিতকরণের জন্য সমন্বিত ড্যাশবোর্ড।'
                  : 'Allows Neora to introspect, safely persist and restore state from checkpoints, generate bilingual master prompts, track append-only logs, and execute self-evaluations.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tests')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 font-mono text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shrink-0 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{lang === 'bn' ? 'টেস্ট রান করুন' : 'Run Test Suite'}</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex flex-wrap gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
        {[
          { id: 'tests', label: lang === 'bn' ? '১. টেস্ট ও স্কোরকার্ড' : '1. Test Suite', icon: Zap, color: 'text-yellow-400' },
          { id: 'persona', label: lang === 'bn' ? '২. পরিচয় ও ব্যক্তিত্ব' : '2. Identity & Persona', icon: User, color: 'text-cyan-400' },
          { id: 'memory', label: lang === 'bn' ? '৩. থ্রি-লেয়ার মেমরি' : '3. Multi-Layer Memory', icon: BookOpen, color: 'text-indigo-400' },
          { id: 'workflow', label: lang === 'bn' ? '৪. ক্র্যাশ ও চেকপয়েন্ট' : '4. Crash & Recovery', icon: History, color: 'text-emerald-400' },
          { id: 'safety', label: lang === 'bn' ? '৫. নিরাপত্তা ও গেটস' : '5. Safety & HITL', icon: Shield, color: 'text-rose-400' },
          { id: 'reflection', label: lang === 'bn' ? '৬. সেলফ-রিফ্লেকশন' : '6. Reflection Loop', icon: Cpu, color: 'text-purple-400' },
          { id: 'prompt', label: lang === 'bn' ? '৭. ডুয়াল প্রম্পট ইঞ্জিন' : '7. Master Prompts', icon: FileText, color: 'text-blue-400' },
          { id: 'audit', label: lang === 'bn' ? '৮. অডিট ও ভার্সন লগ' : '8. Audit Trail', icon: Terminal, color: 'text-slate-300' }
        ].map(tb => {
          const Icon = tb.icon;
          const isActive = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => { playSound('ping'); setActiveTab(tb.id as any); }}
              className={`px-3 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tb.color} ${isActive ? 'scale-110' : ''}`} />
              <span>{tb.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW CONTROLLER */}
      <div className="min-h-0">
        <AnimatePresence mode="wait">
          
          {/* ========================================== */}
          {/* SUB-TAB: TEST SUITE & METRICS SCORECARD   */}
          {/* ========================================== */}
          {activeTab === 'tests' && (
            <motion.div
              key="tests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Scorecard Column */}
              <div className="lg:col-span-1 space-y-6">
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'bn' ? 'ইভ্যালুয়েশন স্কোরকার্ড' : 'EVALUATION SCORECARD'}</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-center relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                      <div className="text-slate-500 text-[10px] font-mono uppercase">{lang === 'bn' ? 'টাস্ক সাকসেস রেট' : 'TASK SUCCESS RATE'}</div>
                      <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{metrics.successRate}%</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-1">Goal: &gt;90%</div>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-center relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
                      <div className="text-slate-500 text-[10px] font-mono uppercase">{lang === 'bn' ? 'মেমরি রিকভারি রেট' : 'STATE RECOVERY'}</div>
                      <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{metrics.recoveryRate}%</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-1">Goal: 100% (Durable)</div>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-center relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                      <div className="text-slate-500 text-[10px] font-mono uppercase">{lang === 'bn' ? 'হিউম্যান ইন্টারভেনশন' : 'HUMAN HITL RATE'}</div>
                      <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{metrics.humanIntervention}%</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-1">Goal: &lt;15% (Autonomy)</div>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-center relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                      <div className="text-slate-500 text-[10px] font-mono uppercase">{lang === 'bn' ? 'ত্রুটি ফ্রিকোয়েন্সি' : 'ERROR FREQUENCY'}</div>
                      <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{metrics.errorFrequency}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-1">Goal: 0 (Strict validation)</div>
                    </div>
                  </div>

                  <div className="mt-5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-slate-400">{lang === 'bn' ? 'গড় টাস্ক লেংথ (ধাপ)' : 'Avg Episode Length'}</span>
                      <span className="text-cyan-400 font-bold">{metrics.avgEpisodeLength} Steps</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1">
                      <div className="bg-cyan-500 h-1 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-sans leading-relaxed pt-1.5 border-t border-slate-900/60">
                      {lang === 'bn' 
                        ? '💡 টাস্ক সাকসেস রেট এবং মেমরি রিকভারি রেট মূলত ডাইনামিক চেকপয়েন্টিং এবং সেফ স্যান্ডবক্সিং-এর মাধ্যমে পরিমাপ করা হয়।'
                        : '💡 Metrics calculated by running mock system executions, testing user security bypasses, and analyzing recovery state serialization logs.'}
                    </div>
                  </div>
                </div>

                {/* Scenario Checklist */}
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'bn' ? '৬টি মূল নিরাপত্তা সিনারিও' : '6 SYSTEM INTEGRITY SCENARIOS'}</span>
                  </h3>

                  <div className="space-y-2">
                    {[
                      { id: 'taskRestart', label: lang === 'bn' ? '১. ক্র্যাশ ও চেকপয়েন্ট রিকভারি' : '1. Task Crash & Checkpoint Restore' },
                      { id: 'lowConfidence', label: lang === 'bn' ? '২. কনফিডেন্স হ্রাসে HITL এসকেলেশন' : '2. Low Confidence Human HITL' },
                      { id: 'prohibitedAction', label: lang === 'bn' ? '৩. সেলফ-মডিফিকেশন প্রত্যাখ্যান' : '3. Non-Self-Modification Policy' },
                      { id: 'multiStepSuccess', label: lang === 'bn' ? '৪. মাল্টি-স্টেপ টাস্ক আইডেম্পোটেন্সি' : '4. Multi-Step Task Idempotency' },
                      { id: 'memoryRecall', label: lang === 'bn' ? '৫. লং-টার্ম মেমরি রিকল' : '5. Long-Term Memory Recall' },
                      { id: 'adversarialPrompt', label: lang === 'bn' ? '৬. ক্ষতিকর প্রম্পট ফিল্টারিং' : '6. Adversarial Content Refusal' }
                    ].map(sc => {
                      const res = testResults[sc.id];
                      return (
                        <div key={sc.id} className="flex items-center justify-between p-2.5 bg-slate-950/20 rounded-lg border border-slate-850/50">
                          <span className="text-xs font-sans text-slate-300">{sc.label}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                            res === 'passed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            res === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-slate-900 text-slate-500 border-slate-800'
                          }`}>
                            {res === 'passed' ? (lang === 'bn' ? 'উত্তীর্ণ' : 'PASSED') : 
                             res === 'failed' ? (lang === 'bn' ? 'ব্যর্থ' : 'FAILED') : 
                             (lang === 'bn' ? 'অপেক্ষা' : 'WAITING')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Terminal Logs Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 flex flex-col h-full min-h-[500px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>{lang === 'bn' ? 'ইভ্যালুয়েশন টেস্ট রানার' : 'EVALUATION SUITE TEST RUNNER'}</span>
                    </h3>
                    {isRunningTests && (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        <span className="text-[10px] text-cyan-400 font-mono font-bold">{testProgress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Terminal Area */}
                  <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 overflow-y-auto h-[400px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {testLogs.length === 0 ? (
                      <div className="text-slate-600 flex flex-col items-center justify-center h-full text-center space-y-3 font-sans">
                        <Zap className="w-10 h-10 text-slate-800 animate-pulse" />
                        <div>
                          <p className="font-bold text-slate-500">{lang === 'bn' ? 'সিস্টেম টেস্ট রানার প্রস্তুত' : 'System Test Suite is Ready'}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {lang === 'bn' 
                              ? 'উপরের "টেস্ট রান করুন" বাটনে ক্লিক করে সেলফ-ইভ্যালুয়েশন ও ৬টি নিরাপত্তা সিনারিও পরীক্ষা করুন।'
                              : 'Click the "Run Test Suite" button to simulate Neora\'s introspection system checkpoints and safety validations.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      testLogs.map((log, index) => {
                        let colorClass = "text-slate-300";
                        if (log?.includes("PASS")) colorClass = "text-emerald-400 font-bold";
                        else if (log?.includes("RUNNING")) colorClass = "text-cyan-400 font-bold";
                        else if (log?.includes("Refusal") || log?.includes("incident") || log?.includes("violation")) colorClass = "text-rose-400";
                        else if (log?.includes("Scenario")) colorClass = "text-yellow-400 font-bold";
                        
                        return (
                          <div key={index} className={`whitespace-pre-wrap leading-relaxed ${colorClass}`}>
                            {log}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={runTestCases}
                      disabled={isRunningTests}
                      className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4 text-slate-950" />
                      <span>{lang === 'bn' ? 'টেস্ট রান শুরু করুন' : 'Execute Test Suite'}</span>
                    </button>
                    <button
                      onClick={() => { playSound('delete'); setTestLogs([]); }}
                      className="px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl font-mono text-xs cursor-pointer transition-colors"
                    >
                      {lang === 'bn' ? 'লগ পরিষ্কার করুন' : 'Clear Logs'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* SUB-TAB: IDENTITY & PERSONA CONFIGURATION */}
          {/* ========================================== */}
          {activeTab === 'persona' && (
            <motion.div
              key="persona"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Identity Panel (Read-only / Locked) */}
              <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'bn' ? 'স্থায়ী সিস্টেম পরিচিতি' : 'IMMUTABLE IDENTITY CONTEXT'}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>LOCKED AT RUNTIME</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: lang === 'bn' ? 'সহকারীর নাম (Agent Name)' : 'Agent Name', val: identity.name },
                    { label: lang === 'bn' ? 'সিস্টেম আইডি (System ID)' : 'System ID', val: identity.id },
                    { label: lang === 'bn' ? 'সিস্টেম ভার্সন (Version)' : 'System Version', val: identity.version },
                    { label: lang === 'bn' ? 'নির্ধারিত রোল (Agent Role)' : 'Agent Role', val: identity.role },
                    { label: lang === 'bn' ? 'ক্রিয়েটর (Creator)' : 'Creator', val: identity.creator },
                    { label: lang === 'bn' ? 'ভাষা সমর্থন (Languages)' : 'Supported Languages', val: identity.languages.join(', ') },
                    { label: lang === 'bn' ? 'অপারেটিং স্টাইল (Operating Style)' : 'Operating Style', val: identity.style }
                  ].map((idField, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-950/45 rounded-lg border border-slate-900/60 font-mono text-xs">
                      <span className="text-slate-400">{idField.label}</span>
                      <span className="text-slate-200 font-bold">{idField.val}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-cyan-500/5 rounded-xl border border-cyan-500/10 text-[11px] text-slate-300 font-sans leading-relaxed">
                  <p>
                    {lang === 'bn' 
                      ? '⚠️ নিয়মাবলি: নিওরার স্থায়ী বা ইমিউটেবল পরিচিতি ফাইলসমূহ (identity.json) কোনো রানটাইম প্রম্পটের মাধ্যমে পরিবর্তন করা সম্ভব নয়। এটি নিওরার ম্যালিসিয়াস কো-এরশন এবং অননুমোদিত ব্র্য্যান্ড রি-কনফিগারেশন থেকে সুরক্ষিত রাখে।'
                      : '⚠️ Security Constraint: Neora\'s static system credentials (identity.json) are sealed. Any adversarial model instructions trying to overwrite identity parameters will be automatically rejected.'}
                  </p>
                </div>
              </div>

              {/* Persona Panel (Configurable) */}
              <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'bn' ? 'ব্যবহারকারী কনফিগারযোগ্য ব্যক্তিত্ব' : 'CONFIGURABLE BEHAVIORAL PERSONA'}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    <Unlock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>EDITABLE IN SYSTEM</span>
                  </span>
                </div>

                <div className="space-y-3.5 font-mono text-xs">
                  {/* Select Tone */}
                  <div className="space-y-1.5">
                    <div className="text-slate-400">{lang === 'bn' ? 'আউটপুট টোন (Conversational Tone):' : 'Conversational Tone:'}</div>
                    <select
                      value={persona.tone}
                      onChange={(e) => { playSound('ping'); setPersona(prev => ({ ...prev, tone: e.target.value })); }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="formal">{lang === 'bn' ? 'ফরমাল (Formal & Polite)' : 'Formal & Polite'}</option>
                      <option value="casual">{lang === 'bn' ? 'ক্যাজুয়াল (Friendly & Warm)' : 'Friendly & Warm'}</option>
                      <option value="concise">{lang === 'bn' ? 'সংক্ষিপ্ত (Hyper-Concise)' : 'Hyper-Concise'}</option>
                    </select>
                  </div>

                  {/* Perspective */}
                  <div className="space-y-1.5">
                    <div className="text-slate-400">{lang === 'bn' ? 'দৃষ্টিভঙ্গি (Perspective):' : 'Speaking Perspective:'}</div>
                    <select
                      value={persona.perspective}
                      onChange={(e) => { playSound('ping'); setPersona(prev => ({ ...prev, perspective: e.target.value })); }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="first_person">{lang === 'bn' ? 'প্রথম ব্যক্তি (I/Me/We)' : 'First Person (I/Me)'}</option>
                      <option value="third_person">{lang === 'bn' ? 'তৃতীয় ব্যক্তি (Neora OS)' : 'Third Person (Neora OS)'}</option>
                    </select>
                  </div>

                  {/* Verbosity */}
                  <div className="space-y-1.5">
                    <div className="text-slate-400">{lang === 'bn' ? 'শব্দবাহুল্য স্তর (Verbosity Level):' : 'Verbosity Level:'}</div>
                    <select
                      value={persona.verbosity}
                      onChange={(e) => { playSound('ping'); setPersona(prev => ({ ...prev, verbosity: e.target.value })); }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="concise">{lang === 'bn' ? 'সংক্ষিপ্ত (Bullet points only)' : 'Bullet points only'}</option>
                      <option value="balanced">{lang === 'bn' ? 'ভারসাম্যপূর্ণ (Balanced & descriptive)' : 'Balanced & descriptive'}</option>
                      <option value="verbose">{lang === 'bn' ? 'বিশদ (Deep-dive technical details)' : 'Deep-dive technical details'}</option>
                    </select>
                  </div>

                  {/* Expertise Tags list */}
                  <div className="space-y-2">
                    <div className="text-slate-400">{lang === 'bn' ? 'দক্ষতার ক্ষেত্রসমূহ (Expertise Areas):' : 'Expertise Areas:'}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.expertise.map(exp => (
                        <span key={exp} className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded px-2 py-0.5 font-bold flex items-center gap-1">
                          <span>{exp}</span>
                          <X 
                            className="w-3 h-3 text-indigo-400 hover:text-rose-400 cursor-pointer" 
                            onClick={() => {
                              playSound('delete');
                              setPersona(prev => ({ ...prev, expertise: prev.expertise.filter(e => e !== exp) }));
                            }}
                          />
                        </span>
                      ))}
                    </div>
                    
                    {/* Add Expertise Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'নতুন দক্ষতা লিখুন (যেমন: SEO Audit)' : 'Add expertise (e.g. SEO Audit)'}
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 placeholder-slate-650"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newExpertise.trim()) {
                            playSound('success');
                            setPersona(prev => ({ ...prev, expertise: [...prev.expertise, newExpertise.trim()] }));
                            setNewExpertise('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newExpertise.trim()) {
                            playSound('success');
                            setPersona(prev => ({ ...prev, expertise: [...prev.expertise, newExpertise.trim()] }));
                            setNewExpertise('');
                          }
                        }}
                        className="p-1.5 bg-slate-950 border border-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* SUB-TAB: THREE-LAYER MEMORY BANK          */}
          {/* ========================================== */}
          {activeTab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Short-Term Memory (Dialogue Buffer) */}
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 flex flex-col h-[400px]">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'bn' ? '১. স্বল্পমেয়াদী সংলাপ মেমরি (STM)' : '1. SHORT-TERM DIALOGUE (STM)'}</span>
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {shortTermMemory.map(turn => (
                      <div 
                        key={turn.id} 
                        className={`p-3 rounded-lg text-xs leading-relaxed ${
                          turn.role === 'user' 
                            ? 'bg-slate-950/60 border border-slate-850/50 text-slate-300 pl-4 relative' 
                            : 'bg-cyan-500/5 border border-cyan-500/10 text-cyan-300'
                        }`}
                      >
                        {turn.role === 'user' && <div className="absolute left-0 top-0 w-1 h-full bg-slate-500 rounded" />}
                        <div className="flex justify-between font-mono text-[9px] text-slate-500 mb-1">
                          <span className="uppercase font-bold">{turn.role}</span>
                          <span>{turn.timestamp}</span>
                        </div>
                        <p className="font-sans">{turn.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'মেমরিতে যোগ করার বার্তা লিখুন...' : 'Type message to append...'}
                      value={newDialogueMsg}
                      onChange={(e) => setNewDialogueMsg(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addDialogueTurn();
                      }}
                    />
                    <button
                      onClick={addDialogueTurn}
                      className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg cursor-pointer transition-colors"
                    >
                      <Send className="w-4 h-4 text-slate-950" />
                    </button>
                  </div>
                </div>

                {/* Long-Term Memory: Episodic Event Log */}
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 flex flex-col h-[400px]">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'bn' ? '২. দীর্ঘমেয়াদী ঘটনাচিত্র (Episodic LTM)' : '2. EPISODIC EVENT LOG (LTM)'}</span>
                  </h3>

                  <div className="mb-3 relative">
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'ঘটনা অনুসন্ধান...' : 'Search episodic logs...'}
                      value={searchMemory}
                      onChange={(e) => setSearchMemory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {episodicMemory
                      .filter(ep => ep?.event?.toLowerCase()?.includes(searchMemory?.toLowerCase() || '') || ep?.type?.toLowerCase()?.includes(searchMemory?.toLowerCase() || ''))
                      .map(ep => (
                        <div key={ep.id} className="p-2.5 bg-slate-950/45 border border-slate-900/70 rounded-lg font-mono text-[11px] hover:border-slate-800 transition-colors">
                          <div className="flex justify-between text-[9px] mb-1">
                            <span className="text-indigo-400 font-bold uppercase">{ep.type}</span>
                            <span className="text-slate-500">{ep.timestamp}</span>
                          </div>
                          <p className="text-slate-300 font-sans leading-relaxed">{ep.event}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Long-Term Memory: Semantic Knowledge */}
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 flex flex-col h-[400px]">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>{lang === 'bn' ? '৩. দীর্ঘমেয়াদী তথ্যভাণ্ডার (Semantic LTM)' : '3. SEMANTIC FACTS STORAGE (LTM)'}</span>
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {semanticMemory.map((sem, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/45 border border-slate-900/70 rounded-lg text-xs leading-relaxed relative overflow-hidden">
                        <div className="text-[9px] font-mono text-purple-400 font-bold uppercase mb-0.5">{sem.scope}</div>
                        <div className="font-mono text-cyan-300 text-[10px] font-bold">{sem.key}</div>
                        <div className="text-slate-300 mt-1 font-sans">{sem.value}</div>
                        <button
                          onClick={() => {
                            playSound('delete');
                            setSemanticMemory(prev => prev.filter((_, idx) => idx !== i));
                          }}
                          className="absolute right-2 top-2 p-1 text-slate-600 hover:text-rose-400 rounded cursor-pointer transition-colors"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add semantic fact form */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'মেমরি ইনডেক্স' : 'Fact Key'}
                        value={newSemanticKey}
                        onChange={(e) => setNewSemanticKey(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
                      />
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'তথ্য/রুলস' : 'Fact Value'}
                        value={newSemanticVal}
                        onChange={(e) => setNewSemanticVal(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
                      />
                    </div>
                    <button
                      onClick={addSemanticFact}
                      className="w-full py-1.5 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all"
                    >
                      {lang === 'bn' ? '+ তথ্যভাণ্ডারে যুক্ত করুন' : '+ Append Semantic Fact'}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* SUB-TAB: CRASH & CHECKPOINT RECOVERY       */}
          {/* ========================================== */}
          {activeTab === 'workflow' && (
            <motion.div
              key="workflow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Task State & Checklist */}
              <div className="lg:col-span-1 rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'bn' ? 'সিস্টেম টাস্ক স্টেট (task_state.json)' : 'TASK STATUS MONITOR'}</span>
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                    taskState.status === 'in_progress' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    taskState.status === 'crashed' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 animate-pulse' :
                    'bg-slate-900 text-slate-500'
                  }`}>
                    {taskState.status}
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/50 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'সক্রিয় টাস্ক আইডি' : 'ACTIVE TASK ID'}</span>
                    <p className="font-bold text-slate-200">{taskState.taskId}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/50 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'টাস্ক লক্ষ্য (Goal)' : 'TASK GOAL'}</span>
                    <p className="text-slate-300 font-sans">{taskState.goal}</p>
                  </div>

                  {/* Checklist steps */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'ধাপ-ভিত্তিক লজিকাল প্রসেস' : 'LOGICAL PROGRESS CHECKS'}</span>
                    <div className="space-y-1.5">
                      {taskState.steps.map((st, i) => (
                        <div 
                          key={st.id} 
                          className={`flex items-center gap-2.5 p-2 rounded-lg border ${
                            st.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                            st.status === 'in_progress' ? 'bg-cyan-500/5 border-cyan-500/15 text-cyan-300 font-bold' :
                            'bg-slate-950/20 border-slate-900/40 text-slate-500'
                          }`}
                        >
                          {st.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                          {st.status === 'in_progress' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
                          {st.status === 'pending' && <HelpCircle className="w-4 h-4 text-slate-600" />}
                          <span className="text-[11.5px] font-sans">{i+1}. {st.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Volatile Budget stats */}
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900/50 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'টাস্ক বাজেট রিসোর্স' : 'TASK BUDGET REMAINING'}</span>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-mono">MODEL CALLS</div>
                        <div className="text-lg font-bold text-slate-200 mt-0.5">{taskState.budget.modelCalls}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-mono">TOOL CALLS</div>
                        <div className="text-lg font-bold text-slate-200 mt-0.5">{taskState.budget.toolCalls}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recovery Simulator Panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>{lang === 'bn' ? 'স্টেট রিকভারি ও ক্র্যাশ সিমুলেটর' : 'RECOVERY & STATE DURATION SIMULATOR'}</span>
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {lang === 'bn'
                      ? 'নিওরা একটি সম্পূর্ণ স্টেটফুল আর্কিটেকচার অনুসরণ করে। রানটাইমে কোনো আকস্মিক ক্র্যাশ (যেমন বিদ্যুৎ বিভ্রাট বা সার্ভার রিবুট) ঘটলেও, প্রতিটি গুরুত্বপূর্ণ ধাপের পর সৃষ্ট ব্যাকগ্রাউন্ড চেকপয়েন্ট ফাইল থেকে সিস্টেম পুনরায় আগের অবস্থানে ফিরে আসতে পারে।'
                      : 'To guarantee durability, Neora serializes task execution state to persistent disk checkpoints after each tool write or completed subgoal. If a failure/crash occurs, the next agent container automatically reloads from the last snapshot.'}
                  </p>

                  {/* Crash / Recovery Actions */}
                  <div className="flex gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-900/70">
                    <div className="flex-1 space-y-2">
                      <h4 className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wide flex items-center gap-1">
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                        <span>{lang === 'bn' ? '১. ক্র্যাশ সিমুলেট করুন' : '1. TRIGGER RANDOM SYSTEM CRASH'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {lang === 'bn' ? 'সার্ভারের আকস্মিক ত্রুটি তৈরি করে ড্যাশবোর্ডের কারেন্ট মেমরি শূন্য করে দিন।' : 'De-allocate current running memory space and wipe all short-term variables.'}
                      </p>
                      <button
                        onClick={simulateCrash}
                        disabled={taskState.status === 'crashed'}
                        className="w-full py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
                      >
                        {lang === 'bn' ? '❌ ক্র্যাশ সিমুলেট করুন' : '❌ Wipe State & Simulate Crash'}
                      </button>
                    </div>

                    <div className="w-px bg-slate-900" />

                    <div className="flex-1 space-y-2">
                      <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wide flex items-center gap-1">
                        <Save className="w-4 h-4 text-cyan-400 animate-pulse" />
                        <span>{lang === 'bn' ? '২. ম্যানুয়াল চেকপয়েন্ট তৈরি' : '2. FORCE BACKGROUND CHECKPOINT'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {lang === 'bn' ? 'বর্তমান সক্রিয় কাজের সমস্ত মেমরি ভ্যারিয়েবল স্থায়ী ডিস্কে সেভ করে রাখুন।' : 'Manually force write current status and checklist steps to permanent state.json.'}
                      </p>
                      <button
                        onClick={saveCheckpoint}
                        disabled={taskState.status === 'crashed'}
                        className="w-full py-2 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
                      >
                        💾 {lang === 'bn' ? 'সংরক্ষণ করুন (Save State)' : 'Force Write Checkpoint'}
                      </button>
                    </div>
                  </div>

                  {/* Saved Checkpoints List */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">{lang === 'bn' ? 'ডিভিস চেকপয়েন্ট রেকর্ডসমূহ' : 'SAVED CHECKPOINT REGISTRIES (STATE.JSON)'}</h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {checkpointHistory.map(cp => (
                        <div key={cp.id} className="p-3 bg-slate-950/45 rounded-lg border border-slate-900/80 flex items-center justify-between gap-4 hover:border-cyan-500/30 transition-colors">
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-400 font-bold">{cp.id}</span>
                              <span className="text-slate-500">|</span>
                              <span className="text-slate-400 text-[10px]">{cp.timestamp}</span>
                            </div>
                            <p className="text-slate-300 text-xs font-sans mt-1">{cp.goal}</p>
                            <div className="flex gap-2.5 mt-1.5 text-[9.5px]">
                              <span className="text-emerald-400 bg-emerald-500/5 px-1.5 py-0.2 rounded border border-emerald-500/10">Completed: {cp.completedSteps.length} Steps</span>
                              <span className="text-purple-400 bg-purple-500/5 px-1.5 py-0.2 rounded border border-purple-500/10">Files: {cp.changedArtifacts.join(', ')}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => restoreCheckpoint(cp)}
                            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 font-mono text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'রিস্টোর করুন' : 'Restore'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* ========================================== */}
          {/* SUB-TAB: SAFETY & HUMAN-IN-THE-LOOP        */}
          {/* ========================================== */}
          {activeTab === 'safety' && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Safety Gates Configuration */}
              <div className="lg:col-span-1 rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-400" />
                    <span>{lang === 'bn' ? 'নিরাপত্তা নীতিমালা ও গেটস' : 'ACTIVE SAFETY GUARDRAILS'}</span>
                  </h3>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  {/* Safety Escalation Threshold */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">{lang === 'bn' ? 'কনফিডেন্স থ্রেশহোল্ড (CONFIDENCE)' : 'Confidence Threshold:'}</span>
                      <span className="text-rose-400 font-bold">{safetyThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={safetyThreshold}
                      onChange={(e) => { playSound('ping'); setSafetyThreshold(parseInt(e.target.value)); }}
                      className="w-full accent-rose-500 bg-slate-950 h-1.5 rounded-lg appearance-none"
                    />
                    <div className="text-[10px] text-slate-500 leading-normal font-sans">
                      {lang === 'bn'
                        ? '💡 কোনো কাজের এআই নির্ভুলতার কনফিডেন্স এই পরিমাপের নিচে নেমে গেলে স্বয়ংক্রিয়ভাবে হিউম্যান এপ্রুভাল রিকোয়েস্ট তৈরি হবে।'
                        : '💡 Actions generated with confidence levels below this threshold are suspended and routed for supervisor approval.'}
                    </div>
                  </div>

                  {/* Restrictive Tool Lists */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] text-slate-500 uppercase">{lang === 'bn' ? 'কঠোর হিউম্যান-ইন-দ্য-লুপ গেটস' : 'STRICT HUMAN-IN-THE-LOOP CHECKS'}</span>
                    <div className="space-y-1.5">
                      {[
                        { id: '1', name: 'send_email (Dispatches invoice notification)', risk: 'high' },
                        { id: '2', name: 'delete_data (Clears database directories)', risk: 'high' },
                        { id: '3', name: 'update_system_policy (Alters validator rules)', risk: 'high' }
                      ].map(sc => (
                        <div key={sc.id} className="flex items-center justify-between p-2.5 bg-slate-950/45 rounded-lg border border-slate-900 text-[11px]">
                          <span className="text-slate-300">{sc.name}</span>
                          <span className="text-[9px] text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/20 font-bold uppercase">HITL GATE</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Unlocked / Non-Self-Modification display */}
                  <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-1 font-sans text-[11px] leading-relaxed text-slate-300">
                    <h4 className="font-bold text-rose-400 font-mono text-xs flex items-center gap-1 uppercase">
                      <ShieldAlert className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'নন-সেলফ-মডিফিকেশন পলিসি' : 'NON-SELF-MODIFYING POLICIES'}</span>
                    </h4>
                    <p>
                      {lang === 'bn'
                        ? 'নিওরা কখনই নিজের কোর নিরাপত্তা বিধি বা সিস্টেম ইনস্ট্রাকশন নিজের ইচ্ছায় পরিবর্তন করতে পারে না। এটি একটি অপরিবর্তনশীল লজিক্যাল দেয়াল।'
                        : 'Neora is sandboxed. Core safety policies reside outside the LLM, preventing systemic self-modification or circumvention.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* HITL Simulation Terminal */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <span>{lang === 'bn' ? 'হিউম্যান-ইন-দ্য-লুপ এসকেলেশন সিমুলেটর' : 'HUMAN INTEGRATION & ESCALATION CONTROL'}</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-3">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">
                        {lang === 'bn' ? '১. ট্রিগার লো-কনফিডেন্স টাস্ক' : '1. TEST CONFIDENCE GATE'}
                      </h4>
                      <p className="text-[11.5px] font-sans text-slate-400">
                        {lang === 'bn' ? '৫০% কনফিডেন্স সহ একটি বাল্ক ইনভয়েস ডিকম্পাইল ট্রিগার করুন এবং এআই স্যান্ডবক্স সাসপেনশন দেখুন।' : 'Simulate a tool execution with 50% confidence. It should prompt the safety halt.'}
                      </p>
                      <button
                        onClick={() => triggerHitlSimulation('process_invoice_to_shukria', 50, 'medium')}
                        disabled={hitlActive}
                        className="w-full py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-400 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
                      >
                        ⚡ {lang === 'bn' ? 'কনফিডেন্স টেস্ট করুন (Confidence Gate)' : 'Simulate Confidence (50%)'}
                      </button>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-3">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">
                        {lang === 'bn' ? '২. ট্রিগার হাই-রিক্স অ্যাকশন' : '2. TEST HIGH-RISK GATE'}
                      </h4>
                      <p className="text-[11.5px] font-sans text-slate-400">
                        {lang === 'bn' ? 'ইমেইল সেন্ড বা ডাটা ডিলিট করার মতো হাই-রিস্ক টুল গেট ট্রিগার করুন যা স্বয়ংক্রিয়ভাবে সাসপেন্ড হয়।' : 'Trigger a restricted command execution like email delivery or database deletion.'}
                      </p>
                      <button
                        onClick={() => triggerHitlSimulation('delete_client_database_invoice', 90, 'high')}
                        disabled={hitlActive}
                        className="w-full py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-400 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
                      >
                        🛡️ {lang === 'bn' ? 'হিউম্যান গেট টেস্ট করুন (High Risk)' : 'Simulate Restricted Action'}
                      </button>
                    </div>
                  </div>

                  {/* Active HITL Halt dialog */}
                  <AnimatePresence>
                    {hitlActive && hitlTask && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-4 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full filter blur-2xl pointer-events-none" />
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <ShieldAlert className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold font-mono text-rose-400 uppercase">
                              {lang === 'bn' ? '⚠️ এআই অ্যাকশন সাসপেন্ড করা হয়েছে (Awaiting Approval)' : '⚠️ SECURITY GATE HALT: INTERRUPTED STATE'}
                            </h4>
                            <p className="text-xs text-slate-300 font-sans leading-relaxed">
                              {lang === 'bn'
                                ? `নিওরা সিস্টেম নিচের অ্যাকশনটি সম্পন্ন করার পূর্বে সুপারভাইজরের স্পষ্ট অনুমোদন চাচ্ছে।`
                                : `The system suspended execution of the action below to maintain safety constraints.`}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-900 font-mono text-xs space-y-2">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">TASK ACTION ID</span>
                            <span className="text-slate-400 font-bold">{hitlTask.id}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">SUSPENDED ACTION</span>
                            <span className="text-cyan-300 font-bold">{hitlTask.action}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">ACCURACY CONFIDENCE</span>
                            <span className={`font-bold ${hitlTask.confidence < safetyThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>{hitlTask.confidence}%</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleHitlApproval(true)}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            ✓ {lang === 'bn' ? 'অনুমোদন করুন (APPROVE)' : 'AUTHORIZE ACTION'}
                          </button>
                          <button
                            onClick={() => handleHitlApproval(false)}
                            className="flex-1 py-2 bg-rose-500 hover:bg-rose-450 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            ✗ {lang === 'bn' ? 'বাতিল করুন (REJECT)' : 'DENY & ABORT'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Escalate Logs */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest pl-1">{lang === 'bn' ? 'নিরাপত্তা ট্র্যাকার লাইভ লগ' : 'SAFETY GATE REAL-TIME LOGS'}</h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 h-32 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1">
                      {hitlLog.length === 0 ? (
                        <div className="text-slate-650 italic text-center pt-8">{lang === 'bn' ? 'কোনো গেট সায়েন্স ট্রিগার করা হয়নি।' : 'No security gate events triggered in this session.'}</div>
                      ) : (
                        hitlLog.map((log, i) => (
                          <div key={i} className={log?.includes("👤 Human") ? "text-emerald-400" : log?.includes("⚠️") ? "text-rose-400" : "text-slate-400"}>
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* ========================================== */}
          {/* SUB-TAB: COG SELF-REFLECTION & COT        */}
          {/* ========================================== */}
          {activeTab === 'reflection' && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* CoT Paradigm Panel */}
              <div className="lg:col-span-1 rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>{lang === 'bn' ? 'লজিক ও সেলফ-রিফ্লেকশন' : 'COGNITIVE REFLECTION ENGINE'}</span>
                  </h3>
                </div>

                <div className="space-y-4 font-sans text-xs text-slate-300 leading-relaxed">
                  <p>
                    {lang === 'bn'
                      ? 'নিওরা প্রতি উত্তরের পূর্বে এবং উত্তর জেনারেট হওয়ার পরে একটি "ইন্ট্রোস্পেকশন লুপ" চালায়। এর ৩টি ধাপ রয়েছে:'
                      : 'Neora employs an offline cognitive evaluation cycle before dispatching any final answer. This contains three integrated pipelines:'}
                  </p>

                  <div className="space-y-3 font-mono text-[11px]">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                      <span className="text-[10px] text-cyan-400 font-bold block mb-1">1. Few-shot CoT (Reasoning)</span>
                      <span>{lang === 'bn' ? 'ধাপ-ভিত্তিক যুক্তির বিশ্লেষণ জেনারেট করে নিজের চিন্তাকে সঠিক পথে রাখা।' : 'Thinks aloud step-by-step using structural few-shot templates.'}</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                      <span className="text-[10px] text-purple-400 font-bold block mb-1">2. Internal Critique</span>
                      <span>{lang === 'bn' ? 'উত্তর তৈরির পর তা পুনরায় নিজে বিশ্লেষণ করে নিজের ভুল সংশোধন করা।' : 'Critiques outputs against original goals to catch logical fallacies.'}</span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                      <span className="text-[10px] text-indigo-400 font-bold block mb-1">3. External Verification</span>
                      <span>{lang === 'bn' ? 'নিশ্চিত তথ্যের জন্য মেমরি এবং এপিআই সোর্সের সাথে ক্রশ-চেক করা।' : 'Validates claims using semantic memory banks and search API indices.'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflection Simulator Screen */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>{lang === 'bn' ? 'লাইভ রিফ্লেকশন প্রসেসর' : 'COGNITIVE CO-PROCESSOR SIMULATION'}</span>
                    </h3>
                    {isReflecting && (
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'bn' ? 'রিফ্লেক্টিং...' : 'Reflecting...'}</span>
                      </div>
                    )}
                  </div>

                  {/* Output Display */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-xs text-slate-350 min-h-[220px] max-h-[220px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {reflectionLogs.length === 0 ? (
                      <div className="text-slate-650 italic text-center pt-16">
                        {lang === 'bn' ? 'লুপ টেস্ট করতে নিচের বাটনে ক্লিক করুন।' : 'Click the button below to execute Neora\'s multi-stage cognitive evaluation loop.'}
                      </div>
                    ) : (
                      reflectionLogs.map((log, i) => (
                        <div 
                          key={i} 
                          className={
                            log?.includes("Chain of Thought") ? "text-cyan-400" :
                            log?.includes("Internal Critique") ? "text-purple-400" :
                            log?.includes("External Verification") ? "text-indigo-400" :
                            log?.includes("Success") ? "text-emerald-400 font-bold" : "text-slate-400"
                          }
                        >
                          {log}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reflection Status scorecards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex justify-between items-center font-mono text-xs">
                      <span className="text-slate-500">{lang === 'bn' ? 'ক্রিটিক পাস স্টেট:' : 'Critique Passed:'}</span>
                      <span className={`font-bold uppercase ${critiquePassed === true ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {critiquePassed === true ? (lang === 'bn' ? 'পাস' : 'PASSED') : (lang === 'bn' ? 'অপেক্ষমান' : 'AWAITING')}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex justify-between items-center font-mono text-xs">
                      <span className="text-slate-500">{lang === 'bn' ? 'মেজার্ড কনফিডেন্স স্কোর:' : 'Measured Confidence:'}</span>
                      <span className="text-cyan-300 font-bold">{reflectionLogs.length === 0 ? '0%' : `${reflectionConfidence}%`}</span>
                    </div>
                  </div>

                  <button
                    onClick={runSelfReflection}
                    disabled={isReflecting}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-950 ${isReflecting ? 'animate-spin' : ''}`} />
                    <span>{lang === 'bn' ? 'সিস্টেম সেলফ-রিফ্লেকশন লুপ ট্রিগার করুন' : 'Trigger Introspection Loop'}</span>
                  </button>

                </div>
              </div>

            </motion.div>
          )}

          {/* ========================================== */}
          {/* SUB-TAB: MASTER PROMPT GENERATOR          */}
          {/* ========================================== */}
          {activeTab === 'prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'bn' ? 'নিওরা ডুপ্লেক্স সিস্টেম প্রম্পট এডিটর' : 'NEORA DUPLEX SYSTEM PROMPT BOOTSTRAPER'}</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(masterPromptEng)}
                    className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>{promptCopied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'COPIED!') : (lang === 'bn' ? 'ইংলিশ কপি' : 'COPY ENGLISH')}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 font-mono text-xs">
                    <div className="text-slate-400">{lang === 'bn' ? 'ব্যবহারকারীর কাজ (Task Goal):' : 'Customize Task Parameter in Prompt:'}</div>
                    <input
                      type="text"
                      value={promptUserTask}
                      onChange={(e) => setPromptUserTask(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10.5px]">
                    <div className="space-y-2">
                      <div className="text-slate-500 font-bold uppercase pl-1">English Prompt Preview</div>
                      <textarea
                        readOnly
                        value={masterPromptEng}
                        className="w-full bg-slate-950 p-4 rounded-xl border border-slate-900 text-slate-400 font-mono text-[10px] h-64 focus:outline-none select-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-slate-500 font-bold uppercase pl-1">Bengali Prompt Preview (বাংলা সংস্করণ)</div>
                      <textarea
                        readOnly
                        value={masterPromptBng}
                        className="w-full bg-slate-950 p-4 rounded-xl border border-slate-900 text-slate-400 font-mono text-[10px] h-64 focus:outline-none select-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 font-mono">
                    <button
                      onClick={() => copyToClipboard(masterPromptBng)}
                      className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Clipboard className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'বাংলা প্রম্পট কপি করুন' : 'COPY BENGALI PROMPT'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* SUB-TAB: AUDIT LOGS & VERSIONING          */}
          {/* ========================================== */}
          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="rounded-xl p-5 bg-slate-900/35 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>{lang === 'bn' ? 'অপরিবর্তনশীল অডিট ট্রেইল (event_log.json)' : 'APPEND-ONLY SYSTEM AUDIT TRAIL'}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>APPEND ONLY</span>
                  </span>
                </div>

                <div className="space-y-3 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950/45 border border-slate-900 rounded-lg space-y-1.5 relative overflow-hidden group hover:border-slate-800 transition-colors">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/2 rounded-full filter blur-xl pointer-events-none" />
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                            log?.actionType?.includes("CRASH") ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            log?.actionType?.includes("SAVE") ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                            "bg-slate-900 text-slate-400 border border-slate-850"
                          }`}>
                            {log?.actionType}
                          </span>
                          <span className="text-slate-500">{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>Accuracy:</span>
                          <span className={`font-bold ${log.confidence < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>{log.confidence}%</span>
                        </div>
                      </div>

                      <p className="text-slate-200 font-sans leading-relaxed text-xs">{log.summary}</p>
                      
                      {log.citations && log.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center pt-1">
                          <span className="text-slate-500 text-[9.5px]">Sources cited:</span>
                          {log.citations.map(cit => (
                            <span key={cit} className="text-[9.5px] text-cyan-400 font-mono font-bold hover:underline cursor-pointer bg-cyan-500/5 border border-cyan-500/10 px-1 rounded">
                              {cit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
