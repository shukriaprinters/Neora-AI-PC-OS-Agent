import React, { useState } from 'react';
import { TRANSLATIONS } from '../translations';
import {
  Milestone, Calendar, CheckSquare, Clock, ShieldAlert, Zap, Cpu, Code,
  TrendingUp, Play, Sparkles, Database, Layers, Layout, RefreshCw, Languages,
  HelpCircle, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Pocket, Terminal
} from 'lucide-react';

interface RoadmapViewProps {
  lang: 'en' | 'bn';
}

interface Step {
  id: string;
  titleEn: string;
  titleBn: string;
  status: 'completed' | 'in_progress' | 'pending';
  descEn: string;
  descBn: string;
  complexity: 'low' | 'medium' | 'high' | 'ultra';
  techEn: string;
  techBn: string;
}

interface Phase {
  id: string;
  titleEn: string;
  titleBn: string;
  progress: number;
  timelineEn: string;
  timelineBn: string;
  icon: React.ReactNode;
  tags: string[];
  steps: Step[];
}

export function RoadmapView({ lang }: RoadmapViewProps) {
  const isEn = lang === 'en';
  
  // Roadmap Phases State
  const [activePhase, setActivePhase] = useState<string>('phase1');
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [repairedSteps, setRepairedSteps] = useState<Record<string, boolean>>({});

  // Simulation parameters for manual toggles
  const [dbStatus, setDbStatus] = useState<'fallback' | 'connected'>('fallback');
  const [agentAuthLevel, setAgentAuthLevel] = useState<number>(3);

  // 6 Phased System Architecture Roadmap
  const initialPhases: Phase[] = [
    {
      id: 'phase1',
      titleEn: "Phase 1: Core Scaffolding & Fallback Storage Engine",
      titleBn: "পর্যায় ১: মূল ফ্রেমওয়ার্ক এবং ফালব্যাক স্টোরেজ ইঞ্জিন",
      progress: 100,
      timelineEn: "Week 1 - Completed",
      timelineBn: "সপ্তাহ ১ - সম্পন্ন",
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      tags: ["Monorepo", "React 19", "Express 5", "Vite PWA"],
      steps: [
        {
          id: 'p1s1',
          titleEn: "Scaffold pnpm monorepo structure",
          titleBn: "pnpm মনোরেপো স্ট্রাকচার সেটআপ",
          status: 'completed',
          descEn: "Establish directory structure with shared workspaces for frontend, backend API server, and shared common libraries.",
          descBn: "ফ্রন্টএন্ড, ব্যাকএন্ড এপিআই সার্ভার এবং গ্লোবাল লাইব্রেরির জন্য ডিরেক্টরি এবং ওয়ার্কস্পেস কনফিগারেশন তৈরি করা।",
          complexity: 'medium',
          techEn: "pnpm workspaces, TypeScript chains",
          techBn: "pnpm ওয়ার্কস্পেস, টাইপস্ক্রিপ্ট কনফিগ"
        },
        {
          id: 'p1s2',
          titleEn: "Develop local JSON fallback storage helper",
          titleBn: "লোকাল JSON ফালব্যাক স্টোরেজ তৈরি",
          status: 'completed',
          descEn: "Implement fallback-db.json logic inside artifacts/api-server/data/ to allow the assistant to run smoothly without database connection.",
          descBn: "ডাটাবেজ সংযোগহীন অবস্থায়ও রান করতে artifacts/api-server/data/ এ fallback-db.json লজিক ডেভেলপ করা।",
          complexity: 'medium',
          techEn: "Node.js FileSystem, async file locking",
          techBn: "নোড জেএস এফএস, অ্যাসিনক্রোনাস লকিং"
        },
        {
          id: 'p1s3',
          titleEn: "Integrate initial Multilingual translations engine",
          titleBn: "দ্বিভাষিক অনুবাদ ইঞ্জিন সংযোজন",
          status: 'completed',
          descEn: "Create LangProvider React Context alongside useLang hooks supporting toggle states across English and Bengali UI elements.",
          descBn: "ইংরেজি এবং বাংলা টেক্সট পরিবর্তনের জন্য LangProvider রিঅ্যাক্ট কনটেক্সট এবং useLang পোর্টিং তৈরি করা।",
          complexity: 'low',
          techEn: "React Context, LocalStorage states",
          techBn: "রিঅ্যাক্ট কনটেক্সট, লোকালস্টোরেজ স্টেট"
        }
      ]
    },
    {
      id: 'phase2',
      titleEn: "Phase 2: Relational DB Schema & Drizzle ORM Setup",
      titleBn: "পর্যায় ২: রিলেশনাল ডাটাবেজ স্কিমা ও ড্রিল ওআরএম সেটআপ",
      progress: 80,
      timelineEn: "Week 2 - In Progress (Active)",
      timelineBn: "সপ্তাহ ২ - প্রক্রিয়াধীন (সক্রিয়)",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      tags: ["PostgreSQL", "Drizzle", "16 Tables", "Migrations"],
      steps: [
        {
          id: 'p2s1',
          titleEn: "Define 16 core relation tables inside lib/db/schema.ts",
          titleBn: "lib/db/schema.ts এ ১৬টি রিলেশন টেবিল তৈরি",
          status: 'completed',
          descEn: "Design strict PostgreSQL columns for conversations, messages, memories, Tasks, reminders, workflows, updates, actions, and earnings projects.",
          descBn: "চ্যাট সেশন, মেসেজ, মেমোরি, রিমাইন্ডার, ওয়ার্কফ্লো, প্রজেক্ট ইত্যাদির জন্য ডিটেইলড পোস্টগ্রে স্কিমা আর্কিটেক্ট করা।",
          complexity: 'high',
          techEn: "Drizzle ORM columns, foreign key constraints",
          techBn: "ড্রিল ওআরএম কলাম, ফরেন কি রিলেশন"
        },
        {
          id: 'p2s2',
          titleEn: "Write database setup check runtime scripts",
          titleBn: "ডাটাবেজ কানেকশন চেকার স্ক্রিপ্ট রাইটিং",
          status: 'completed',
          descEn: "Build automatic database connectivity detection that gracefully toggles the system to 'Limited Mode' upon SQL failure.",
          descBn: "ডাটাবেজ ফেইল হলে ফ্রন্টএন্ডকে সিগন্যাল দিতে এবং লিমিটেড মোড অ্যাক্টিভ করতে কানেকশন অডিটর তৈরি করা।",
          complexity: 'medium',
          techEn: "Drizzle client initialization block, checkHealth helpers",
          techBn: "ড্রিল ইনিশিয়ালাইজার, হেলথ চেক হেল্পার"
        },
         {
          id: 'p2s3',
          titleEn: "Validate transactional safety rollback",
          titleBn: "ট্রানজেকশনাল সেফটি রোলব্যাক ভ্যালিডেশন",
          status: 'in_progress',
          descEn: "Ensure active DB writes rollback cleanly if a database step fails during heavy background batch jobs.",
          descBn: "ব্যাকগ্রাউন্ডে একসাথে অনেকগুলো কাজ চলার সময় কোনো একটি ব্যর্থ হলে সম্পূর্ণ অপারেশন রোলব্যাক করা।",
          complexity: 'high',
          techEn: "PostgreSQL Transactions, ACID guarantees",
          techBn: "পোস্টগ্রে ট্রানজেকশন, এসিড গ্যারান্টি"
        }
      ]
    },
    {
      id: 'phase3',
      titleEn: "Phase 3: Backend API Service & Multi-Provider Model Registry",
      titleBn: "পর্যায় ৩: ব্যাকএন্ড এপিআই সার্ভিস এবং মাল্টি-মডেল রেজিস্ট্রি",
      progress: 35,
      timelineEn: "Week 3 - Planned",
      timelineBn: "সপ্তাহ ৩ - পরিকল্পিত",
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      tags: ["Express 5", "Groq AI", "Ollama", "SSE streaming"],
      steps: [
        {
          id: 'p3s1',
          titleEn: "Develop 23 robust REST endpoints inside artifacts/api-server/",
          titleBn: "২৩টি এপিআই রাউট ডেভেলপমেন্ট",
          status: 'in_progress',
          descEn: "Expose memories CRUD, task updates, prompt template workflows execution, morning-briefings, and billing tools.",
          descBn: "মেমোরি ক্রাড, টাস্ক, প্রম্পট ওয়ার্কফ্লো রানার, এবং বিলিং ইনভয়েস জেনারেটরের জন্য ২৩টি রাউট স্ক্রিপ্টিং।",
          complexity: 'high',
          techEn: "Express 5 router modules, unified error handlers",
          techBn: "এক্সপ্রেস ৫ রাউটার মডিউল, কাস্টম এরর হ্যান্ডলার"
        },
        {
          id: 'p3s2',
          titleEn: "Architect Multi-Provider Routing Registry Layer",
          titleBn: "মাল্টি-প্রোভাইডার রুট রেজিস্ট্রি আর্কিটেকচার",
          status: 'pending',
          descEn: "Build intelligent model list. Defaulting query execution context sequentially: Neora Personal -> Ollama -> Groq cloud fallbacks.",
          descBn: "প্রোভাইডার ডাউন থাকলে স্বয়ংক্রিয়ভাবে পরবর্তি বেস্ট মডেলে ট্রাফিক কনভার্ট করার জন্য সিকুয়েন্স চেইন তৈরি করা।",
          complexity: 'high',
          techEn: "lib/neora.ts registry, priority routing weights",
          techBn: "lib/neora.ts রেজিস্ট্রি, মডেল প্রাইওরিটি চেইন"
        },
        {
          id: 'p3s3',
          titleEn: "Expose SSE Stream Endpoint on /api/chat",
          titleBn: "চ্যাটের জন্য এসএসই পোর্টাল কনফিগারেশন",
          status: 'pending',
          descEn: "Establish real-time chunk streaming (text/event-stream) alongside multi-part file uploads logic.",
          descBn: "দ্রুত রেসপন্স পেতে টেক্সট ইভেন্ট স্টিম (SSE) এর সাথে চ্যাটে ফাইল আপলোড প্রক্সি সেটআপ করা।",
          complexity: 'medium',
          techEn: "Server-Sent Events (SSE), formidable uploads",
          techBn: "সার্ভার ইভেন্ট স্ট্রিমস, ফরমিডেবল ফাইল প্রসেসর"
        }
      ]
    },
    {
      id: 'phase4',
      titleEn: "Phase 4: Python PC Control Agent & OS Action Protocol",
      titleBn: "পর্যায় ৪: পাইথন ডেস্কটপ কন্ট্রোল এজেন্ট ও ওএস অ্যাকশন প্রোটোকল",
      progress: 0,
      timelineEn: "Week 4-5 - Planned",
      timelineBn: "সপ্তাহ ৪-৫ - পরিকল্পিত",
      icon: <Code className="w-5 h-5 text-yellow-500" />,
      tags: ["Python Agent", "Action Schema", "Keyboard/Mouse", "Screenshots"],
      steps: [
        {
          id: 'p4s1',
          titleEn: "Code neora_agent.py registration and polling systems",
          titleBn: "neora_agent.py কানেকশন ও পোলিং ইঞ্জিন তৈরি",
          status: 'pending',
          descEn: "Create background python agent daemon that connects to/polls Express REST endpoints, dispatching jobs safely.",
          descBn: "ব্যাকগ্রাউন্ড পাইথন রানার স্ক্রিপ্ট যা লোকাল এপিআই থেকে কাজ সংগ্রহ এবং ওএস কমপ্লায়েন্স নিশ্চিত করে।",
          complexity: 'high',
          techEn: "requests / asyncio loop, backoff retry limits",
          techBn: "রিকোয়েস্টস ও সিঙ্কআইও লুপ, ব্যাকঅফ রিট্রাই লিমিট"
        },
        {
          id: 'p4s2',
          titleEn: "Implement 27 low-level desktop control actions",
          titleBn: "২৭টি ওএস মূল ও নিরাপদ অ্যাকশন তৈরি",
          status: 'pending',
          descEn: "Write handlers for launching/closing apps, executing shell scripts, browsing urls, managing background system processes, and modifying clipboard states.",
          descBn: "অ্যাপ ওপেন/ক্লোজ, টার্মিনাল রান, ব্রাউজার ওপেন, ক্লিপবোর্ড ডেটা এক্সেস এবং ক্লিক কন্ডিশন তৈরি।",
          complexity: 'ultra',
          techEn: "pyautogui, subprocess, psutil python packages",
          techBn: "pyautogui, subprocess, psutil লাইব্রেরি"
        },
        {
          id: 'p4s3',
          titleEn: "Integrate safety policy whitelist check inside agent",
          titleBn: "এজেন্টের ভেতর নিরাপত্তা রুল বাউন্ডারি সংযোজন",
          status: 'pending',
          descEn: "Enforce restriction whitelists: block execution of non-safe commands, enforce authorized write target directories, and resolve directory traversals.",
          descBn: "অননুমোদিত কমান্ড ব্লক করা, সিস্টেমের রুট ফোল্ডার লক রাখা এবং ট্রাভার্সাল হ্যাক আটকে রাখা।",
          complexity: 'high',
          techEn: "artifacts/automation-policy.json parser, os.path.realpath checks",
          techBn: "সেফটি পলিসি ডিকশনারি, রিয়েলপ্যাথ চেকার"
        }
      ]
    },
    {
      id: 'phase5',
      titleEn: "Phase 5: Multi-Step Run Plan & Auto-Repair Executor Logo",
      titleBn: "পর্যায় ৫: মাল্টি-স্টেপ রান প্ল্যাটফর্ম ও অটো-রিপেয়ার ইন্টেলিজেন্স",
      progress: 0,
      timelineEn: "Week 6 - Planned",
      timelineBn: "সপ্তাহ ৬ - পরিকল্পিত",
      icon: <RefreshCw className="w-5 h-5 text-orange-500" />,
      tags: ["Run Plan Engine", "Self-Diagnostics", "SSE status emitter"],
      steps: [
        {
          id: 'p5s1',
          titleEn: "Construct Run Plan sequential step dispatcher",
          titleBn: "স্টেপ-বাই-স্টেপ ডিসপ্যাচার আর্কিটেকচার",
          status: 'pending',
          descEn: "Develop seq executors in lib/executor.ts delivering plan instructions to direct terminal shell interfaces.",
          descBn: "lib/executor.ts এ সিকুয়েনশিয়াল রানার তৈরি করা যা প্রতিটি কমপ্লায়েন্ট প্ল্যান একের পর এক এক্সিকিউট করে।",
          complexity: 'high',
          techEn: "RxJS / event emitters, sub-process trackers",
          techBn: "আরএক্সজেএস / ইভেন্ট এমিটারস, সাবপ্রসেস ট্র্যাকারস"
        },
        {
          id: 'p5s2',
          titleEn: "Integrate AI-powered diagnostics and auto-repair retry logic",
          titleBn: "এআই ডায়াগনস্টিকস ও অটো-রিপেয়ার রিট্রাই সুবিধা",
          status: 'pending',
          descEn: "When a shell step errors, forward raw stderr logs to Llama-Cortex model to re-build corrected command parameters, auto-retrying up to 2 times.",
          descBn: "টার্মিনাল ফেল করলে এরর আউটপুট কাইনেটিক এআই ফরোয়ার্ড করে কারেক্টেড প্রম্পট তৈরি করা (সর্বোচ্চ ২ বার)।",
          complexity: 'ultra',
          techEn: "Diagnostic log prompt template wrappers",
          techBn: "ডায়াগনস্টিক লগ মডেল রিস্ট্রাকচারার"
        },
        {
          id: 'p5s3',
          titleEn: "Develop step-pause and kill routines UI hooks",
          titleBn: "স্টেপ পজ এবং কিল প্রসেস হুকস ডেভেলপমেন্ট",
          status: 'pending',
          descEn: "Add backend listeners allowing users to freeze execution at any runplan progression bar.",
          descBn: "চলমান স্ক্রিপ্ট মাঝপথে থামানোর জন্য ইউজার ইন্টারফেসে ইন্টারেক্টিভ কিল ও ফ্রিজ সিগন্যাল তৈরি।",
          complexity: 'medium',
          techEn: "Process PID tracker trees, SIGTERM triggers",
          techBn: "প্রসেস পিআইডি ম্যাপার, সিগটার্ম হুকস"
        }
      ]
    },
    {
      id: 'phase6',
      titleEn: "Phase 6: Voice Systems & Stable Launch Deployments",
      titleBn: "পর্যায় ৬: ভয়েস রিকগনিশন ও প্রোডাকশন লঞ্চ ডিপ্লয়মেন্ট",
      progress: 0,
      timelineEn: "Week 7 - Verification",
      timelineBn: "সপ্তাহ ৭ - ভ্যালিডেশন",
      icon: <Languages className="w-5 h-5 text-pink-500" />,
      tags: ["Wake Word", "TTS/STT Speech", "Docker", "setup.bat scripts"],
      steps: [
        {
          id: 'p6s1',
          titleEn: "Code always-on wake word listener",
          titleBn: "স্মার্ট ভয়েস ওয়োক-ওয়ার্ড অ্যাক্টিভেশন লুপ",
          status: 'pending',
          descEn: "Integrate Web Audio API combined with Porcupine/Whisper client buffers trigger listening whenever 'Neora' is vocally voiced.",
          descBn: "মাইক্রোফোন ক্যাপচার করে 'নিওরা' বা 'Neora' শব্দ শুনলেই মূল ট্র্যান্সক্রিপশন পোর্টিং এ ব্যাকগ্রাউন্ড সাউন্ড সক্রিয় করা।",
          complexity: 'high',
          techEn: "Web Audio API processing, offline model trigger rings",
          techBn: "ওয়েব অডিও এপিআই, লোকাল সাউন্ড বাফারস"
        },
        {
          id: 'p6s2',
          titleEn: "Develop idempotent launch scripts setup.bat / run.bat",
          titleBn: "রানের জন্য শক্তিশালী setup.bat ও run.bat স্ক্রিপ্ট রাইটিং",
          status: 'pending',
          descEn: "Write launchers checking port conflicts, terminating stale processes, installing missing npm/python assets automatically with rollback protections.",
          descBn: "পোর্ট কনফ্লিক্ট আটকানো, প্রসেস অফ করা এবং ঝামেলাহীন অটো প্যাকেজ ইন্সটলেশন বুটলোড স্ক্রিপ্ট তৈরি।",
          complexity: 'medium',
          techEn: "Windows Batch script, shell scripts, PID ports cleaners",
          techBn: "উইন্ডোজ ব্যাচ স্ক্রিপ্টিং, পিআইডি পোর্টস ক্লিনার"
        },
        {
          id: 'p6s3',
          titleEn: "Deploy PWA Offline assets service worker cache",
          titleBn: "পিডব্লিউএ অফলাইন সার্ভিস ওয়ার্কার ক্যাশ ডেভ",
          status: 'pending',
          descEn: "Configure complete offline access for checklist, notes, and local memories stored in PWA sandboxes.",
          descBn: "পণ্য অফলাইনে সচল রাখতে ক্যাশ এপিআই দিয়ে ফাইল স্টোরেজ সার্ভিস ওয়ার্কার ম্যাপিং নিশ্চিতকরণ।",
          complexity: 'medium',
          techEn: "ServiceWorkers, Cache Storage API, manifest configs",
          techBn: "সার্ভিস ওয়ার্কার্স, ক্যাশ স্টোরেজ, মেনিফেস্ট রাইটার"
        }
      ]
    }
  ];

  const [phases, setPhases] = useState<Phase[]>(initialPhases);

  // Toggle step state manually inside this simulation sandbox!
  const toggleStepStatus = (phaseId: string, stepId: string) => {
    setPhases(prev => {
      return prev.map(p => {
        if (p.id !== phaseId) return p;
        const updatedSteps = p.steps.map(s => {
          if (s.id !== stepId) return s;
          const nextStatusMap: Record<string, 'completed' | 'in_progress' | 'pending'> = {
            'pending': 'in_progress',
            'in_progress': 'completed',
            'completed': 'pending'
          };
          const nextSt = nextStatusMap[s.status];
          return { ...s, status: nextSt };
        });
        
        // Calculate auto progress based on steps
        const total = updatedSteps.length;
        const comps = updatedSteps.filter(x => x.status === 'completed').length;
        const inProgs = updatedSteps.filter(x => x.status === 'in_progress').length;
        const calculatedProgress = total > 0 ? Math.round(((comps + (inProgs * 0.5)) / total) * 100) : 0;

        return { ...p, steps: updatedSteps, progress: calculatedProgress };
      });
    });

    const stepObj = phases.find(p => p.id === phaseId)?.steps.find(s => s.id === stepId);
    if (stepObj) {
      addLog(`Status of step "${stepObj.titleEn}" manual overridden.`);
    }
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 30)]);
  };

  // Run complex Auto-Repair Simulator (Visual/Conceptual game demo for users)
  const runAutoRepairMockup = (stepId: string, title: string) => {
    setSimulationActive(true);
    addLog(`TRIGGER: Automatic step failed inside runplan: "${title}"`);
    
    setTimeout(() => {
      addLog(`DIAGNOSTIC: Reviewing terminal stderr logs: [stderr: Error: Command not found or restricted prefix check failed]`);
    }, 1000);

    setTimeout(() => {
      addLog(`KINETIC PATCHER: Standard safety framework violated. Rewriting command to safe whitelist prefix...`);
    }, 2400);

    setTimeout(() => {
      addLog(`AUTO-REPAIR: Pushing dynamic hotfix container target to path whitelist directory.`);
      setRepairedSteps(prev => ({ ...prev, [stepId]: true }));
    }, 3800);

    setTimeout(() => {
      addLog(`VERIFICATION: running validation test ('tsc --noEmit') against workspace structure.`);
    }, 4900);

    setTimeout(() => {
      addLog(`SUCCESS: Ppatched sandbox code verified. Auto-repair loop concluded successfully on task "${stepId}".`);
      setSimulationActive(false);
      
      // Update step status to completed directly
      setPhases(prev => {
        return prev.map(p => {
          const hasStep = p.steps.some(x => x.id === stepId);
          if (!hasStep) return p;
          const uSteps = p.steps.map(s => s.id === stepId ? { ...s, status: 'completed' as const } : s);
          const total = uSteps.length;
          const comps = uSteps.filter(x => x.status === 'completed').length;
          return { ...p, steps: uSteps, progress: Math.round((comps / total) * 100) };
        });
      });
    }, 6000);
  };

  const selectedPhase = phases.find(p => p.id === activePhase) || phases[0];

  return (
    <div id="roadmap-container" className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      
      {/* Title banner */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-5 shrink-0 flex items-center justify-between select-none">
        <div>
          <div className="flex items-center gap-2">
            <Milestone className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white font-sans uppercase tracking-wide">
              {isEn ? "Neora AI Production Integration Roadmap" : "নিওরা এআই প্রোডাকশন ইন্টিগ্রেশন রোডম্যাপ"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isEn 
              ? "Comprehensive milestone blueprints, multi-step execution plans & interactive local pc sandbox simulation" 
              : "পূর্ণাঙ্গ সফল মাইলস্টোন ব্লুপ্রিন্ট, মাল্টি-স্টেপ ওএস এক্সিকিউশন প্ল্যান ও কোডিং আর্কিটেকচার ট্র্যাকার"}
          </p>
        </div>

        {/* Global stats indicators */}
        <div className="flex gap-4">
          <div className="bg-slate-950/85 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-mono font-bold">DATABASE STATUS</span>
              <button 
                onClick={() => {
                  const nextSt = dbStatus === 'connected' ? 'fallback' : 'connected';
                  setDbStatus(nextSt);
                  addLog(`System database status mock toggled to: ${nextSt.toUpperCase()}`);
                }}
                className={`text-[9px] font-bold font-mono text-left cursor-pointer focus:outline-none ${dbStatus === 'connected' ? 'text-emerald-400' : 'text-orange-400'}`}
              >
                {dbStatus === 'connected' ? "● ACTIVE PGSQL" : "⚠ FALLBACK ACTIVE (JSON)"}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/85 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-mono font-bold">AUTONOMY SECURITY</span>
              <button
                onClick={() => {
                  const nextLvl = agentAuthLevel >= 5 ? 1 : agentAuthLevel + 1;
                  setAgentAuthLevel(nextLvl);
                  addLog(`Simulation Autonomy Security Level configured to: LVL ${nextLvl}`);
                }}
                className="text-[9px] font-bold font-mono text-cyan-400 text-left cursor-pointer focus:outline-none"
              >
                LEVEL {agentAuthLevel}/5 ACTIVE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-5 space-y-8 w-full">
        
        {/* DESIGN PHILOSOPHY CALL-OUT (Holographic Cyberpunk Alert) */}
        <div className="relative overflow-hidden bg-slate-900/30 border border-cyan-500/10 rounded-xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-transparent pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{isEn ? "Lead Systems Architect Statement" : "প্রধান স্থপতির বিশেষ প্রজ্ঞাপন"}</span>
            </div>
            <h2 className="text-sm font-bold text-slate-200">
              {isEn ? "Deployable pnpm Monorepo System Roadmap Contracts" : "ডিপ্লয়যোগ্য pnpm মনোরেপো সিস্টেম রোডম্যাপ চুক্তি"}
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {isEn 
                ? "This dashboard bridges the raw specifications detailed in SEC 15: Monorepo Architecture with physical client execution tracks. Every segment represents true production steps required to integrate Neora's 147 capability operations safely on native environments."
                : "এই ড্যাশবোর্ডটি সেকশন ১৫ এর মণিহার মনোরেপো আর্কিটেকচারের সাথে বাস্তব জীবনের ক্লায়েন্ট ট্র্যাকের সংযোগ ঘটায়। প্রতিটি অংশ লোকাল পিসিতে নিওরার ১৪৭টি স্বায়ত্তশাসিত ক্ষমতা যুক্ত করার আসল প্রকৌশলগত ধাপ।"}
            </p>
          </div>
          <div className="shrink-0 relative z-10 flex gap-2">
            <span className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-300 px-3.5 py-2 rounded shadow">
              {isEn ? "TARGET INTEGRATION : 100%" : "টার্গেট ইন্টিগ্রেশন : ১০০%"}
            </span>
          </div>
        </div>

        {/* ROADMAP PHASES HORIZONTAL SELECTOR GANTT STYLE */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>{isEn ? "Primary Architecture Milestones (6 Stages)" : "প্রাথমিক আর্কিটেকচার মাইলস্টোনসমূহ (৬টি পর্যায়)"}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {phases.map((phase) => {
              const isSelected = phase.id === activePhase;
              return (
                <button
                  key={phase.id}
                  id={`phase-btn-${phase.id}`}
                  onClick={() => setActivePhase(phase.id)}
                  className={`relative p-3.5 rounded-lg border text-left transition-all duration-300 focus:outline-none cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900/60 border-cyan-500/50 shadow-[0_4px_12px_rgba(6,182,212,0.08)]' 
                      : 'bg-slate-950 border-slate-900 hover:border-slate-800/80'
                  }`}
                >
                  <div className="flex justify-between items-center select-none mb-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                      {phase.id.toUpperCase()}
                    </span>
                    <span className={`text-[9px] font-mono font-bold ${
                      phase.progress === 100 ? 'text-emerald-400' : phase.progress > 0 ? 'text-orange-400' : 'text-slate-500'
                    }`}>
                      {phase.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {phase.icon}
                    <h3 className="text-xs font-bold text-slate-200 line-clamp-1">
                      {isEn ? phase.titleEn.split(':')[1]?.trim() : phase.titleBn.split(':')[1]?.trim()}
                    </h3>
                  </div>

                  <div className="text-[8px] font-mono text-slate-500 truncate block">
                    {isEn ? phase.timelineEn : phase.timelineBn}
                  </div>

                  {/* Progressive Micro-Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950 rounded-b-lg overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        phase.progress === 100 ? 'bg-emerald-500/70' : phase.progress > 0 ? 'bg-orange-500/70' : 'bg-slate-800'
                      }`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE PHASE BREAKDOWN MODULE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/10 border border-slate-900 rounded-xl overflow-hidden shadow">
          
          {/* Timeline & Details (8-cols) */}
          <div className="lg:col-span-8 p-6 space-y-6">
            
            {/* Phase header banner detail */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-cyan-500/15 text-cyan-400 font-bold px-2 py-0.5 rounded font-mono border border-cyan-500/5">
                  {selectedPhase.id.toUpperCase()}
                </span>
                <h2 className="text-base font-bold text-white font-sans mt-1">
                  {isEn ? selectedPhase.titleEn : selectedPhase.titleBn}
                </h2>
                <div className="flex gap-2 text-xs text-slate-400 font-mono">
                  <span>{isEn ? "Estimated Cycle:" : "কাজ শুরু:"}</span>
                  <span className="text-cyan-400 font-bold">{isEn ? selectedPhase.timelineEn : selectedPhase.timelineBn}</span>
                </div>
              </div>

              {/* Progress big meter */}
              <div className="flex items-center gap-3 bg-slate-950/60 py-2 px-3 border border-slate-850 rounded-lg">
                <div className="text-right">
                  <div className="text-[9px] text-slate-500 font-mono">PHASE PROGRESS</div>
                  <div className="text-sm font-bold text-white font-mono">{selectedPhase.progress}%</div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-300 relative overflow-hidden">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={selectedPhase.progress === 100 ? "#10b981" : "#06b6d4"}
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 - (125.6 * selectedPhase.progress) / 100}
                    />
                  </svg>
                  <span className="absolute">{selectedPhase.progress}%</span>
                </div>
              </div>
            </div>

            {/* Steps interactive list */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-widest flex items-center gap-1">
                <CheckSquare className="w-4 h-4 text-cyan-500" />
                <span>{isEn ? "Action Engineering Checklists (Double-Click state to toggle)" : "ইঞ্জিনিয়ারিং চেকলিস্ট (ইনপুট টগল করতে ক্লিক করুন)"}</span>
              </h3>

              <div className="space-y-3">
                {selectedPhase.steps.map((step) => {
                  return (
                    <div
                      key={step.id}
                      className="bg-slate-950/50 hover:bg-slate-950 border border-slate-900 rounded-lg p-4 space-y-3 transition-all hover:border-slate-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {/* Toggle checklist dot */}
                          <button
                            onClick={() => toggleStepStatus(selectedPhase.id, step.id)}
                            className="mt-1 focus:outline-none cursor-pointer shrink-0"
                          >
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : step.status === 'in_progress' ? (
                              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-cyan-400 animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
                            )}
                          </button>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-100">{isEn ? step.titleEn : step.titleBn}</h4>
                              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                step.complexity === 'ultra' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                                step.complexity === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {step.complexity} complexity
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {isEn ? step.descEn : step.descBn}
                            </p>
                          </div>
                        </div>

                        {/* Interactive testing and sandbox triggers */}
                        <div className="sm:text-right shrink-0">
                          {step.status === 'pending' ? (
                            <button
                              onClick={() => toggleStepStatus(selectedPhase.id, step.id)}
                              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 underline bg-transparent border-0 cursor-pointer"
                            >
                              START STEP
                            </button>
                          ) : step.status === 'in_progress' ? (
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="text-orange-400 animate-pulse uppercase">IN WORKFLOW</span>
                              {selectedPhase.id === 'phase2' || selectedPhase.id === 'phase3' || selectedPhase.id === 'phase5' ? (
                                <button
                                  disabled={simulationActive}
                                  onClick={() => runAutoRepairMockup(step.id, isEn ? step.titleEn : step.titleBn)}
                                  className="ml-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 py-0.5 px-2 rounded font-bold text-[9px] cursor-pointer cursor-pointer transition-all disabled:opacity-50"
                                >
                                  {isEn ? "TEST FAILURE OUTCOME" : "ব্যর্থতা টেস্ট করুন"}
                                </button>
                              ) : null}
                            </div>
                          ) : (
                            <div className="flex flex-col items-start sm:items-end">
                              <span className="text-emerald-400 text-[10px] font-mono font-bold">READY IN SANDBOX</span>
                              {repairedSteps[step.id] && (
                                <span className="bg-cyan-500/10 text-cyan-400 text-[8px] font-mono font-bold uppercase px-1 rounded border border-cyan-500/10 mt-1">
                                  AUTO-REPAIRED ✓
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Code and architecture specifics */}
                      <div className="bg-slate-950 p-2 rounded-md border border-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-1">
                          <Code className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Technology Spec: <strong className="text-slate-400">{isEn ? step.techEn : step.techBn}</strong></span>
                        </div>
                        <span className="text-xs">ID: {step.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sandbox Diagnostics logs & Active telemetry (4-cols) */}
          <div className="lg:col-span-4 bg-slate-950 border-l border-slate-900 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {isEn ? "Auto-Repair Diagnostics Terminal" : "অটো-রিপেয়ার ডায়াগনস্টিক টার্মিনাল"}
                </h3>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isEn 
                  ? "Concept simulator of the Phase 5 (Auto-Repair) execution loop. Trigger a step layout failure above to witness diagnostics logging, command rewriting, and safe sandbox revalidation." 
                  : "পর্যায় ৫ এর (অটো-রিপেয়ার উইন্ডো) ক্যারেক্টার সিমুলেশন। চ্যাটের ভেতরের নিরাপত্তা ভঙ্গ বা এরর টেস্ট করতে বাটন ক্লিক করে স্বয়ংক্রিয় সমাধান করার পদ্ধতি দেখুন।"}
              </p>

              {/* Logs output console standard */}
              <div id="diagnostics-terminal-logs" className="bg-slate-950 border border-slate-900 rounded p-3 h-64 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-2 select-text">
                {logs.length === 0 ? (
                  <span className="text-slate-600 block italic">-- Idle telemetry. Waiting for step failure test triggers --</span>
                ) : (
                  logs.map((log, i) => {
                    let color = 'text-slate-400';
                    if (log.includes('TRIGGER') || log.includes('stderr')) color = 'text-red-400';
                    if (log.includes('SUCCESS') || log.includes('safely')) color = 'text-emerald-400';
                    if (log.includes('KINETIC') || log.includes('AUTO-REPAIR')) color = 'text-cyan-400';
                    return <div key={i} className={`leading-relaxed border-b border-slate-900/40 pb-1 ${color}`}>{log}</div>;
                  })
                )}
                {simulationActive && (
                  <div className="flex items-center gap-1.5 text-orange-400 mt-2 animate-pulse">
                    <span>⚡ AI Diagnostic Model Analyzing Stderr...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic visual representation of monorepo packages dependencies directory map */}
            <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-950 space-y-3 shrink-0">
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                {isEn ? "pnpm workspace dependency schema" : "pnpm ওয়ার্কস্পেস ডিপ্লয়মেন্ট ম্যাপ"}
              </div>
              
              <div id="dir-schema-tree" className="text-[10px] font-mono text-slate-500 space-y-1 select-none">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                  <Pocket className="w-3.5 h-3.5 text-cyan-400" />
                  <span>neora-monorepo/</span>
                </div>
                <div className="pl-4 border-l border-slate-800">
                  <div className="text-slate-400">├── artifacts/</div>
                  <div className="pl-4 text-slate-500 font-bold">├── neora/ <span className="text-[8px] bg-cyan-900/10 text-cyan-400 font-medium px-1 rounded">Vite React 19 PWA</span></div>
                  <div className="pl-4 text-slate-500 font-bold">├── api-server/ <span className="text-[8px] bg-cyan-900/10 text-cyan-400 font-medium px-1 rounded">Express 5 + SQL</span></div>
                  <div className="pl-4 text-slate-500 font-bold">└── automation-policy.json <span className="text-[8px] bg-red-900/10 text-red-400 font-medium px-1 rounded">Safety whitelists</span></div>
                </div>
                <div className="pl-4 border-l border-slate-800">
                  <div className="text-slate-400">├── lib/</div>
                  <div className="pl-4 text-slate-500 font-bold">├── db/ <span className="text-[8px] bg-emerald-900/10 text-emerald-400 font-medium px-1">Drizzle ORM Tables</span></div>
                  <div className="pl-4 text-slate-500 font-bold">├── local-agent-protocol/ <span className="text-[8px] bg-slate-800 text-slate-400 font-medium px-1">Zod actions schema</span></div>
                  <div className="pl-4 text-slate-500 font-bold">└── local-agent-python/ <span className="text-[8px] bg-yellow-900/10 text-yellow-500 font-medium px-1">PC Python agent</span></div>
                </div>
                <div className="pl-4">
                  <div className="text-slate-400">└── run.bat <span className="text-[8px] bg-slate-900 text-slate-300 px-1 rounded font-bold">Idempotent Launcher</span></div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECTION 7: STABLE DEPLOYMENT & DEV O&M PROCEDURES */}
        <section id="deployment-procedures" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="bg-slate-900/30 p-5 rounded-lg border border-slate-900 space-y-3">
            <h3 className="text-sm font-sans font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{isEn ? "DevOps Stable Deployment & Lifecycle Commands" : "ডেভঅপ্স স্থিতিশীল ডিপ্লয়মেন্ট এবং কমান্ডসমূহ"}
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isEn 
                ? "The monorepo contains strict launch execution roles defined to optimize speed and secure lock states across different ports:" 
                : "মনোরেপো বুটলোড ও পোর্ট রিলিজের জন্য তিনটি আলাদা লঞ্চার রুল ডিজাইন করা হয়েছে যা দ্বন্দ্বমুক্ত পোর্ট সচল রাখে:"}
            </p>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-900">
                <span className="text-cyan-400 font-bold">setup.bat</span> - {isEn ? "First-time setup. Performs local Node verification, installs workspace packages, creates .env.local templates, and pushes clean relational Drizzle DB schemas." : "প্রথমবারের মত সেটআপ। টাইপস্ক্রিপ্ট ফ্রেমওয়ার্ক তৈরি করা এবং ডাটা স্কিমা কানেক্ট করা।"}
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-900">
                <span className="text-cyan-400 font-bold">run.bat</span> - {isEn ? "Daily launcher. Clears locked port assets on 8080/8081, loads critical environment parameters, launches backend & frontend compilers synchronously, and boots the Python agent." : "দৈনিক ব্যবহার্য লঞ্চার। পিসি চালু হওয়ার পর এটি ৮০০০ পোর্টে চ্যাট ও অর্গানাইজার ওপেন করে।"}
              </div>
            </div>
          </div>

          <div className="bg-slate-905/35 p-5 rounded-lg border border-slate-900 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-sans font-bold text-white flex items-center gap-2 select-none">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>{isEn ? "Mitigation of Known Infrastructure Limitations" : "পারফমেন্স প্রতিবন্ধকতা ও কাস্টম সমাধান"}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isEn 
                  ? "To transition from prototype boundaries to standard production-grade performance networks, we have implemented custom code layouts to bypass default environments limits:" 
                  : "নিওরা এআই ব্লুপ্রিন্ট বাস্তব ইন্টিগ্রেশন করার সময় রিয়েল-লাইফ লোড কন্ট্রোল করতে নির্দিষ্ট কিছু অপ্টিমাইজেশন ব্যবহার করা হবে:"}
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1.5 font-sans">
                <li>• <strong className="text-slate-300">Rate Limiting (/api/chat):</strong> Token-bucket algorithm (capped 60 queries/min limit, burst grace of +10 tokens).</li>
                <li>• <strong className="text-slate-300">Fast Notifier Stream:</strong> Replaces baseline http polling with low-latency WebSockets connections.</li>
                <li>• <strong className="text-slate-300">Drizzle DBMS Query Indexes:</strong> Added B-Tree composite indices on target search targets (agent poll histories, messages timestamp indices).</li>
              </ul>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-900 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
              <span>ESTIMATED PRODUCTION COMPLETION CYCLE</span>
              <span className="font-bold">45 MAN-HOURS</span>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
