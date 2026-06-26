import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Zap, Play, CheckCircle, RefreshCw, Layers, Terminal,
  HelpCircle, Eye, ChevronRight, FileCode, Sliders, AlertTriangle,
  Sparkles, Globe, Clipboard, Printer, DollarSign, Download, Plus, Trash,
  Volume2, Activity
} from 'lucide-react';

interface SelfEvolutionViewProps {
  lang: 'en' | 'bn';
}

interface UpdateItem {
  id: string;
  title: string;
  bnTitle: string;
  description: string;
  bnDescription: string;
  status: 'locked' | 'installing' | 'completed';
  plan: string[];
  bnPlan: string[];
  prompt: string;
  sourceCode: string;
}

export default function SelfEvolutionView({ lang }: SelfEvolutionViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'analysis' | 'protocol' | 'evolved' | 'autonomous'>('autonomous');
  
  // Audio state
  const isAudioOn = localStorage.getItem('neora_ambient_playing') === 'true';

  // 1. Tool details for Identity tab
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  // 2. Scan state for Gap Analysis tab
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [hasScanned, setHasScanned] = useState(() => {
    return localStorage.getItem('neora_has_scanned') === 'true';
  });

  // 3. Update installation state for Protocol tab
  const [installingUpdate, setInstallingUpdate] = useState<UpdateItem | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [installLogs, setInstallLogs] = useState<string[]>([]);

  // Track unlocked features
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('neora_unlocked_features') || '[]');
    } catch {
      return [];
    }
  });

  // Translator Tool states
  const [translatorInput, setTranslatorInput] = useState('');
  const [translatorResult, setTranslatorResult] = useState<any | null>(null);
  const [translatorLoading, setTranslatorLoading] = useState(false);

  // Invoice Tool states
  const [invoiceClient, setInvoiceClient] = useState('');
  const [invoicePhone, setInvoicePhone] = useState('');
  const [invoiceItem, setInvoiceItem] = useState('Glossy Banner');
  const [invoiceQty, setInvoiceQty] = useState<number>(100);
  const [invoicePrice, setInvoicePrice] = useState<number>(1.5);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(10);
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('neora_invoice_history') || '[]');
    } catch {
      return [];
    }
  });

  // Prompt Engineer state
  const [promptGoal, setPromptGoal] = useState('');
  const [engineeredPrompt, setEngineeredPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);

  // --- JARVIS EVOLVED SYSTEMS STATES ---
  const [jarvisSpeechText, setJarvisSpeechText] = useState('Welcome to the command deck, Chief. All auxiliary engines are locked and ready for your prompt.');
  const [jarvisSpeechPitch, setJarvisSpeechPitch] = useState(0.85);
  const [jarvisSpeechRate, setJarvisSpeechRate] = useState(0.95);
  const [isJarvisSpeaking, setIsJarvisSpeaking] = useState(false);

  const [diagnosticsShieldLevel, setDiagnosticsShieldLevel] = useState(88);
  const [diagnosticsCoolantTemp, setDiagnosticsCoolantTemp] = useState(42);
  const [diagnosticsReactorOutput, setDiagnosticsReactorOutput] = useState(94);
  const [diagnosticsCalibrating, setDiagnosticsCalibrating] = useState(false);
  const [diagnosticsCalibrationLog, setDiagnosticsCalibrationLog] = useState<string[]>([]);

  const [autopilotObjective, setAutopilotObjective] = useState('full_workspace_healing');
  const [isAutopilotRunning, setIsAutopilotRunning] = useState(false);
  const [autopilotProgress, setAutopilotProgress] = useState(0);
  const [autopilotLogs, setAutopilotLogs] = useState<string[]>([]);

  // --- AUTONOMOUS SYSTEM CORE STATES ---
  const [isLoopActive, setIsLoopActive] = useState(true);
  const [brainStep, setBrainStep] = useState(0);
  const [harvestInput, setHarvestInput] = useState('');
  const [harvestLoading, setHarvestLoading] = useState(false);
  const [injectingPlanId, setInjectingPlanId] = useState<string | null>(null);
  const [injectProgress, setInjectProgress] = useState(0);

  const [cognitiveLogs, setCognitiveLogs] = useState<string[]>([
    "🧠 Neora Autonomous Brain initialized successfully.",
    "📡 Listening to port 3000 proxy signals; connection active.",
    "🔍 Scanning all tabs (Dashboard, VSCode, PC Control) for optimal density...",
    "💡 Formulating proactive plan: Smart Bulk Order Pricing Optimizer for Shukria Printers.",
    "🌐 Crawling developer registries for secure 'backdrop-blur-xl' compatibility mappings..."
  ]);

  const [learnedSkills, setLearnedSkills] = useState<string[]>([
    "Banglish printing specifications parsing",
    "Smart invoice VAT calculator (15% BD spec)",
    "Ambient hum audio context resuming",
    "Self-compiling UI layout injectors"
  ]);

  const [researchedTopics, setResearchedTopics] = useState<string[]>([
    "Tailwind CSS v4 performance on webkit",
    "Chrome SpeechSynthesis native voice fallbacks",
    "Local KV memory indexed serialization keys",
    "Autonomous system prompt engineering benchmarks"
  ]);

  interface AutoPlan {
    id: string;
    name: string;
    bnName: string;
    status: 'planned' | 'drafting' | 'injecting' | 'completed';
    category: string;
    bnCategory: string;
    description: string;
    bnDescription: string;
    codePreview: string;
  }

  const [autoPlans, setAutoPlans] = useState<AutoPlan[]>([
    {
      id: "bulk_discount_calc",
      name: "Smart Bulk Order Calculator (Shukria Printers Custom)",
      bnName: "স্মার্ট বাল্ক অর্ডার ক্যালকুলেটর (শুকরিয়া কাস্টম)",
      status: 'planned',
      category: "Printing Logic",
      bnCategory: "প্রিন্টিং লজিক",
      description: "Automatically analyzes high-volume orders (over 1000 items) and applies a layered volume-discount curve to protect profit margins.",
      bnDescription: "উচ্চ-ভলিউম (১০০০ পিসের বেশি) অর্ডার স্বয়ংক্রিয়ভাবে সনাক্ত করে প্রফিট মার্জিন ঠিক রেখে লাভজনক ভলিউম-ডিসকাউন্ট কার্ভ প্রয়োগ করে।",
      codePreview: "function calculateBulkCurve(qty, basePrice) {\n  let factor = qty > 5000 ? 0.75 : qty > 1000 ? 0.85 : 1.0;\n  return qty * basePrice * factor;\n}"
    },
    {
      id: "tab_hotkeys",
      name: "Proactive Navigation Hotkey Suite",
      bnName: "প্রোঅ্যাক্টিভ নেভিগেশন হটকি স্যুইট",
      status: 'planned',
      category: "System Interface",
      bnCategory: "সিস্টেম ইন্টারফেস",
      description: "Registers active window-level key listeners to switch seamlessly between Dashboard, VSCode, and PC Control via Alt+1 through Alt+6.",
      bnDescription: "Alt+1 থেকে Alt+6 চেপে ড্যাশবোর্ড, ভিএসকোড, এবং পিসি কন্ট্রোলের মধ্যে দ্রুত এবং নির্বিঘ্নে সুইচ করার জন্য কীবোর্ড লিসেনার যুক্ত করে।",
      codePreview: "window.addEventListener('keydown', (e) => {\n  if (e.altKey && e.key >= '1' && e.key <= '6') {\n    triggerTabChange(parseInt(e.key) - 1);\n  }\n});"
    },
    {
      id: "ambient_eq",
      name: "Neural Sound Wave Equalizer",
      bnName: "নিউরাল সাউন্ড ওয়েভ ইকুয়ালাইজার",
      status: 'planned',
      category: "Audio Processing",
      bnCategory: "অডিও প্রসেসিং",
      description: "Modulates ambient hum frequencies dynamically based on CPU simulation load to create an elegant, immersive auditory atmosphere.",
      bnDescription: "অ্যাম্বিয়েন্ট হাম অডিও ফ্রিকোয়েন্সি সিপিইউ সিমুলেশন লোডের সাথে ডায়নামিকভাবে সিনক্রোনাইজ করে সুন্দর একটি অডিও পরিবেশ তৈরি করে।",
      codePreview: "const filter = audioCtx.createBiquadFilter();\nfilter.type = 'lowpass';\nfilter.frequency.setValueAtTime(cpuLoad * 10, audioCtx.currentTime);"
    },
    {
      id: "direct_shukria_email",
      name: "Automated Order Notification Dispatcher",
      bnName: "স্বয়ংক্রিয় অর্ডার নোটিফিকেশন ডিসপ্যাচার",
      status: 'planned',
      category: "Automation Pipeline",
      bnCategory: "অটোমেশন পাইপলাইন",
      description: "Autonomously drafts notification summaries for completed invoices and queues them for delivery to shukriaprinters@gmail.com.",
      bnDescription: "তৈরিকৃত ইনভয়েসগুলোর সারাংশ স্বয়ংক্রিয়ভাবে ড্রাফট করে shukriaprinters@gmail.com এ নোটিফিকেশন কিউতে পাঠায়।",
      codePreview: "async function queueOrderNotification(inv) {\n  const payload = `New Order: \${inv.id}, Client: \${inv.client}, Total: \${inv.total} TK`;\n  return await pushToQueue('shukriaprinters@gmail.com', payload);\n}"
    },
    {
      id: "jarvis_voice_synth",
      name: "J.A.R.V.I.S. Neural Voice Feedback Engine",
      bnName: "জারভিস নিউরাল ভয়েস ফিডব্যাক ইঞ্জিন",
      status: 'planned',
      category: "Speech Synthesis",
      bnCategory: "স্পিচ সিন্থেসিস",
      description: "Synthesizes elegant, customizable text-to-speech feedback with an acoustic bandpass filter simulating Jarvis's iconic voice tone.",
      bnDescription: "জারভিসের ক্লাসিক ভয়েসের ফিল্টার এবং ফ্রিকোয়েন্সি ব্যবহার করে টেক্সট-টু-স্পিচ রেসপন্স সিস্টেম সক্রিয় করে।",
      codePreview: "const synth = window.speechSynthesis;\nconst utterance = new SpeechSynthesisUtterance(text);\nutterance.pitch = 0.82;\nutterance.rate = 0.95;\nsynth.speak(utterance);"
    },
    {
      id: "holographic_diagnostics",
      name: "J.A.R.V.I.S. Core Holographic Diagnostics Suite",
      bnName: "জারভিস কোর হলোগ্রাফিক ডায়াগনস্টিক স্যুইট",
      status: 'planned',
      category: "System Core Analytics",
      bnCategory: "সিস্টেম কোর অ্যানালিটিক্স",
      description: "Generates real-time diagnostic matrices, responsive system calibrations, coolant temperature gauges, and interactive shield level controls.",
      bnDescription: "রিয়েল-টাইম ডায়াগনস্টিক পার্টিকেলস, কুল্যান্ট টেম্পারেচার গেজ এবং ডিফেন্স শিল্ড লেভেল কন্ট্রোল করার জন্য ইন্টারেক্টিভ ইন্টারফেস লোড করে।",
      codePreview: "function runCalibration() {\n  return Array.from({length: 40}, () => Math.random() * 100);\n}"
    },
    {
      id: "os_agent_autopilot",
      name: "J.A.R.V.I.S. OS Autopilot Coprocessor",
      bnName: "জারভিস ওএস অটোপাইলট কোপ্রসেসর",
      status: 'planned',
      category: "Autonomous Intelligence",
      bnCategory: "স্বায়ত্তশাসিত ইন্টেলিজেন্স",
      description: "Upgrades Neora's OS Agent into a self-healing autonomous autopilot loop capable of checking folder health and auto-drafting documentation blueprints.",
      bnDescription: "নিওরা ওএস এজেন্টকে একটি শক্তিশালী অটোনমাস লুপে উন্নীত করে যা ডিরেক্টরি স্ক্যান ও ডকুমেন্টেশন ফাইল ড্রাফট করতে পারে।",
      codePreview: "async function triggerAutopilotLoop() {\n  await verifyWorkspaceDirs();\n  await draftModuleDocs();\n}"
    }
  ]);

  // Background Autonomous Loop Simulation
  useEffect(() => {
    if (!isLoopActive) return;

    const interval = setInterval(() => {
      setBrainStep(prev => {
        const nextStep = (prev + 1) % 5;
        
        // Add random cool cognitive thoughts
        const thoughts = [
          [
            "🔄 [Always-On Planning] Scanning all interactive tabs...",
            "💡 [Cognitive Idea] Suggesting layout optimization for Memory & Storage.",
            "📡 [System Watch] Verified Port 3000 reverse-proxy; traffic routing stable.",
            "📚 [Research Cache] Checked GitHub repositories for 'lucide-react' standard icons."
          ],
          [
            "🧠 [Self-Learning] Parsing recent user messaging patterns...",
            "📝 [User Intent Detected] Focus on automated print management and billing workflows.",
            "🛠️ [Self-Update Draft] Formulating mathematical volume-discount calculations.",
            "🧬 [Self-Evolving Code] Checking safety protocols for local storage state serialization."
          ],
          [
            "🌐 [Online Research] Indexing W3C SpeechSynthesis standard guides...",
            "💡 [Auto-Optimization] Synthesized fallback audio handlers for iOS Safari compatibility.",
            "🧩 [Visual Design] Optimizing color density ratios using Tailwind CSS slate classes.",
            "⚙️ [Compiler Node] Checked 'npm run lint' configurations in the background."
          ],
          [
            "📊 [System Diagnostics] CPU simulation load: 14%. Memory buffer: 41.2 MB.",
            "💡 [Cognitive Idea] Proposing smart automated invoice queuing for shukriaprinters@gmail.com.",
            "🧠 [Skill Matrix] Reinforced skill: Bangla printing specification parsing.",
            "🔄 [Autonomous Core] Updating self-compiled capabilities dashboard..."
          ]
        ];

        const group = thoughts[Math.floor(Math.random() * thoughts.length)];
        const selectedThought = group[Math.floor(Math.random() * group.length)];
        
        setCognitiveLogs(l => {
          const updated = [...l, `[\${new Date().toLocaleTimeString()}] \${selectedThought}`];
          if (updated.length > 50) updated.shift(); // Keep logs clean
          return updated;
        });

        // Simulating incremental status drafting for planned items
        setAutoPlans(plans => {
          return plans.map(p => {
            if (p.status === 'completed') return p;
            // Randomly advance one planned item to 'drafting' or 'injecting' to show active cognitive brain at work!
            if (p.status === 'planned' && Math.random() < 0.15) {
              return { ...p, status: 'drafting' };
            }
            if (p.status === 'drafting' && Math.random() < 0.15) {
              return { ...p, status: 'injecting' };
            }
            return p;
          });
        });

        return nextStep;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoopActive]);

  const handleHarvestAndLearn = (textToLearn?: string) => {
    const input = textToLearn || harvestInput;
    if (!input.trim()) return;
    setHarvestLoading(true);

    // Dynamic extraction simulation
    setTimeout(() => {
      const normalized = input.toLowerCase();
      let extractedSkill = "Custom User Intent Optimization";
      let extractedTopic = "Tailored Assistant Configurations";
      let featureName = "User Inspired Custom Action Module";
      let code = "// Self-learned from user chat log\nconsole.log('Executing custom action...');";

      if (normalized.includes("shukria") || normalized.includes("printer") || normalized.includes("print")) {
        extractedSkill = "Shukria Printers Automation Protocols";
        extractedTopic = "Print shop billing & invoice auto-routing";
        featureName = "Automated Order Notification Dispatcher";
        code = "async function queueOrderNotification(inv) {\n  const payload = `New Order: \${inv.id}, Client: \${inv.client}, Total: \${inv.total} TK`;\n  return await pushToQueue('shukriaprinters@gmail.com', payload);\n}";
      } else if (normalized.includes("sound") || normalized.includes("audio") || normalized.includes("music") || normalized.includes("hum")) {
        extractedSkill = "Neural Ambient Acoustics Control";
        extractedTopic = "Immersive sound wave stabilizers";
        featureName = "Neural Sound Wave Equalizer";
        code = "const filter = audioCtx.createBiquadFilter();\nfilter.type = 'lowpass';\nfilter.frequency.setValueAtTime(cpuLoad * 10, audioCtx.currentTime);";
      } else if (normalized.includes("shortcut") || normalized.includes("keyboard") || normalized.includes("key")) {
        extractedSkill = "System Level Hotkey Binding";
        extractedTopic = "Rapid interface navigation layouts";
        featureName = "Proactive Navigation Hotkey Suite";
        code = "window.addEventListener('keydown', (e) => {\n  if (e.altKey && e.key >= '1' && e.key <= '6') {\n    triggerTabChange(parseInt(e.key) - 1);\n  }\n});";
      }

      setLearnedSkills(prev => {
        if (prev.includes(extractedSkill)) return prev;
        return [extractedSkill, ...prev];
      });

      setResearchedTopics(prev => {
        if (prev.includes(extractedTopic)) return prev;
        return [extractedTopic, ...prev];
      });

      // Update log
      setCognitiveLogs(l => [
        ...l,
        `[\${new Date().toLocaleTimeString()}] 🧠 Learned skill from message: "\${extractedSkill}"`,
        `[\${new Date().toLocaleTimeString()}] 🌐 Researched online: "\${extractedTopic}"`,
        `[\${new Date().toLocaleTimeString()}] 💡 Formulated plan: "\${featureName}"`
      ]);

      // Check if plan already exists or spawn a custom one
      setAutoPlans(plans => {
        const exists = plans.some(p => p.id === "harvested_module" || p.name.includes(featureName));
        if (exists) {
          // Turn that existing plan to drafting/injecting immediately
          return plans.map(p => {
            if (p.name.includes(featureName)) {
              return { ...p, status: 'injecting' };
            }
            return p;
          });
        }

        // Spawn a brand new self-designed plan
        const newPlan: AutoPlan = {
          id: "harvested_" + Date.now().toString().slice(-4),
          name: featureName,
          bnName: lang === 'bn' ? `স্বয়ংক্রিয় ইউজার কাস্টম \${featureName}` : `Auto-Learned \${featureName}`,
          status: 'drafting',
          category: "User-Learned Optimization",
          bnCategory: "লার্নড অপ্টিমাইজেশন",
          description: `Custom automation synthesized specifically from your messaging intent: "\${input.slice(0, 80)}..."`,
          bnDescription: `আপনার নির্দেশ থেকে স্বয়ংক্রিয়ভাবে সংকলিত কাস্টম মডিউল: "\${input.slice(0, 80)}..."`,
          codePreview: code
        };
        return [newPlan, ...plans];
      });

      setHarvestInput('');
      setHarvestLoading(false);
    }, 1500);
  };

  const handleInjectPlan = (plan: AutoPlan) => {
    if (injectingPlanId) return;
    setInjectingPlanId(plan.id);
    setInjectProgress(0);

    // Update log
    setCognitiveLogs(l => [
      ...l,
      `[\\ \${new Date().toLocaleTimeString()}] 🚀 Initiating dynamic injector for: "\${plan.name}"`,
      `[\\ \${new Date().toLocaleTimeString()}] 📝 Compiling optimized code blocks...`
    ]);

    const interval = setInterval(() => {
      setInjectProgress(prev => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Add to unlocked features so it can be seen or change systems!
            setUnlockedFeatures(prevUnlocked => {
              if (prevUnlocked.includes(plan.id)) return prevUnlocked;
              return [...prevUnlocked, plan.id];
            });

            setAutoPlans(plans => {
              return plans.map(p => {
                if (p.id === plan.id) {
                  return { ...p, status: 'completed' };
                }
                return p;
              });
            });

            setCognitiveLogs(l => [
              ...l,
              `[\${new Date().toLocaleTimeString()}] ✅ Compilation success! Dynamic injection of "\${plan.name}" complete.`,
              `[\${new Date().toLocaleTimeString()}] ✨ Neora system tabs, tools, and options updated with new capabilities.`
            ]);

            setInjectingPlanId(null);
          }, 500);
          return 100;
        }
        return next;
      });
    }, 100);
  };

  // Save unlocked features
  useEffect(() => {
    localStorage.setItem('neora_unlocked_features', JSON.stringify(unlockedFeatures));
  }, [unlockedFeatures]);

  // Save invoice history
  useEffect(() => {
    localStorage.setItem('neora_invoice_history', JSON.stringify(invoiceHistory));
  }, [invoiceHistory]);

  const existingTools = [
    {
      id: "home",
      name: "Dashboard",
      icon: Layers,
      color: "#00d4ff",
      desc: "Central tactical nexus showing real-time system loading, calendar schedules, workspace directory summary, and ambient sound wave states.",
      bnDesc: "রিয়েল-টাইম সিস্টেম লোডিং, ক্যালেন্ডার সময়সূচী, ওয়ার্কস্পেস ডিরেক্টরি সারাংশ এবং অ্যাম্বিয়েন্ট সাউন্ড ওয়েভ স্ট্যাটাস প্রদর্শনকারী কেন্দ্রীয় নেক্সাস।",
      usage: "Go here to get an elegant architectural view of CPU load, memory usage, current active nodes, and key task widgets at a glance.",
      bnUsage: "CPU লোড, মেমরি ব্যবহার, অ্যাক্টিভ নোড এবং গুরুত্বপূর্ণ টাস্ক উইজেট এক নজরে দেখতে এখানে যান।"
    },
    {
      id: "chat",
      name: "Neural Chat",
      icon: HelpCircle,
      color: "#00d4ff",
      desc: "Direct neural bridge powered by Gemini and fallback AI structures to ask questions, construct plan matrices, and trigger system operations.",
      bnDesc: "প্রশ্ন জিজ্ঞাসা করতে, পরিকল্পনা ম্যাট্রিক্স তৈরি করতে এবং সিস্টেম ক্রিয়াকলাপ ট্রিগার করতে জেমিনি দ্বারা চালিত নিউরাল চ্যাট।",
      usage: "Type prompts, write Bangladeshi/Benglish text, or input custom directives. Neora will answer, format tables, or process plans.",
      bnUsage: "যেকোনো প্রশ্ন বা নির্দেশাবলী লিখুন। নিওরা উত্তর দেবে, টেবিল তৈরি করবে বা পরিকল্পনা প্রসেস করবে।"
    },
    {
      id: "neoraTv",
      name: "Neora TV",
      icon: Play,
      color: "#ff007c",
      desc: "Simulated stream pipeline for scanning visuals, multimedia broadcasts, and visual feedback checkpoints.",
      bnDesc: "ভিজুয়াল স্ক্যানিং, মাল্টিমিডিয়া সম্প্রচার এবং ভিজ্যুয়াল ফিডব্যাক চেকপয়েন্টগুলির জন্য সিমুলেটেড স্ট্রিম পাইপলাইন।",
      usage: "Click on Neora TV to inspect running multimedia streams or play demo streams during diagnostic inspections.",
      bnUsage: "চলমান মাল্টিমিডিয়া স্ট্রিমগুলি পরিদর্শন করতে নিওরা টিভিতে ক্লিক করুন।"
    },
    {
      id: "pcController",
      name: "PC Control",
      icon: Sliders,
      color: "#38bdf8",
      desc: "Control room displaying operating state configurations, allowed application arrays, and connection signals for Python PC agents.",
      bnDesc: "Python PC এজেন্টের জন্য অপারেটিং স্টেট কনফিগারেশন, অনুমোদিত অ্যাপ্লিকেশন এবং সংযোগ সিগন্যাল প্রদর্শনকারী কন্ট্রোল রুম।",
      usage: "Tweak sliders and parameters to set security limits, check direct operating system connection status, and verify registration rules.",
      bnUsage: "সিকিউরিটি লিমিট সেট করতে এবং অপারেটিং সিস্টেম কানেকশন স্ট্যাটাস চেক করতে স্লাইডার এবং প্যারামিটার পরিবর্তন করুন।"
    },
    {
      id: "autonomy",
      name: "Automation",
      icon: RefreshCw,
      color: "#1a9fff",
      desc: "Planner and task scheduler that controls autonomy level, ranging from Level 1 (Strict suggestion mode) to Level 5 (Fully autonomous loop execution).",
      bnDesc: "পরিকল্পনাকারী এবং কাজের সময়সূচী যা স্বায়ত্তশাসনের লেভেল নির্ধারণ করে (লেভেল ১ থেকে লেভেল ৫ পর্যন্ত)।",
      usage: "Set active autonomy level to control how aggressively Neora registers tasks and performs direct multi-step procedures.",
      bnUsage: "নিওরা কতটুকু স্বাধীনভাবে কাজ করতে পারবে তা নির্ধারণ করতে স্বায়ত্তশাসনের লেভেল পরিবর্তন করুন।"
    },
    {
      id: "productivity",
      name: "Memory & Storage",
      icon: Cpu,
      color: "#7c3aed",
      desc: "Local KV memory ledger, note keeper, calendar tracker, and task manager storing high importance keys.",
      bnDesc: "লোকাল মেমরি লেজার, নোট কিপার, ক্যালেন্ডার ট্র্যাকার এবং উচ্চ গুরুত্বের কাজের ডাটাবেস।",
      usage: "Store client contact lists, custom preferences, and check existing tasks. You can edit priorities and undo deletions easily.",
      bnUsage: "গ্রাহকদের কন্টাক্ট লিস্ট এবং পছন্দসই কনফিগারেশন সংরক্ষণ করুন এবং বর্তমান টাস্কগুলি চেক করুন।"
    },
    {
      id: "vscode",
      name: "Workspace (VSCode)",
      icon: Terminal,
      color: "#00d4ff",
      desc: "Interactive VSCode workspace simulator holding directories, debugger session indicators, terminal outputs, and live editable files.",
      bnDesc: "ডিরেক্টরি, ডিবাগার সেশন নির্দেশক, টার্মিনাল আউটপুট এবং এডিটেবল ফাইল ধারণকারী ইন্টারেক্টিভ VSCode ওয়ার্কস্পেস সিমুলেটর।",
      usage: "Run mock console terminals, examine typescript schemas, debug execution logs, or edit codes visually within Neora.",
      bnUsage: "মক কনসোল টার্মিনাল চালান, টাইপস্ক্রিপ্ট স্কিমা পরীক্ষা করুন বা ভিজ্যুয়াল কোড এডিট করুন।"
    }
  ];

  const suggestedUpdates: UpdateItem[] = [
    {
      id: "bengali_translator",
      title: "1. Bengali Neural Translator & Printer Assistant",
      bnTitle: "১. বাংলা নিউরাল ট্রান্সলেটর ও প্রিন্টিং অ্যাসিস্ট্যান্ট",
      description: "Enhance Neora's system parsing to translate Benglish / Bangla printing directives into technical print orders.",
      bnDescription: "বাংলিশ অথবা বাংলা প্রিন্টিংয়ের নির্দেশাবলীকে নিখুঁতভাবে টেকনিক্যাল প্রিন্ট অর্ডারে রূপান্তর করার ক্ষমতা যোগ করুন।",
      status: unlockedFeatures.includes('bengali_translator') ? 'completed' : 'locked',
      plan: [
        "Create custom regex parser for Bengal unicode blocks.",
        "Implement Banglish vocabulary map (e.g., banner, visiting card, gloss, poster).",
        "Add natural language deconstructors to extract quantity and dimensions.",
        "Output structured JSON print specs to the dashboard."
      ],
      bnPlan: [
        "বাংলা ইউনিকোড ব্লকের জন্য কাস্টম রেজেক্স পার্সার তৈরি করা।",
        "বাংলিশ শব্দের ম্যাপিং এবং ভোকাবুলারি যোগ করা (যেমনঃ ব্যানার, কার্ড, গ্লসি)।",
        "পরিমাণ এবং সাইজ বের করার জন্য ন্যাচারাল ল্যাঙ্গুয়েজ ডিকনস্ট্রাক্টর তৈরি করা।",
        "ড্যাশবোর্ডে স্ট্রাকচার্ড প্রিন্ট স্পেসিফিকেশন প্রদর্শন করা।"
      ],
      prompt: "Create a translation component in src/components/TranslatorAssistant.tsx that captures Bangla/Banglish, extracts printing keywords, translates to standard English printing specifications, and returns a structured output.",
      sourceCode: `export function processNeuralPrintBrief(text: string) {
  const norm = text.toLowerCase();
  let type = "Standard Document";
  let qty = 100;
  let finish = "Standard Matte";

  if (norm.includes("banner") || norm.includes("bener")) type = "PVC Banner";
  else if (norm.includes("card") || norm.includes("visiting")) type = "Visiting Card";
  else if (norm.includes("poster") || norm.includes("puster")) type = "Glossy Poster";

  const qtyMatch = norm.match(/\\d+/);
  if (qtyMatch) qty = parseInt(qtyMatch[0]);

  if (norm.includes("glossy") || norm.includes("glos") || norm.includes("chikchika")) {
    finish = "Premium Glossy Lamination";
  }

  return { type, qty, finish, parsedText: text };
}`
    },
    {
      id: "invoice_generator",
      title: "2. Shukria Printers - Smart Receipt & Invoice Generator",
      bnTitle: "২. শুকরিয়া প্রিন্টার্স - স্মার্ট রসিদ ও ইনভয়েস জেনারেটর",
      description: "Autonomous invoicing module custom tailored for Shukria Printers. Renders high-fidelity printable invoices.",
      bnDescription: "শুকরিয়া প্রিন্টার্স এর জন্য একটি বিশেষ ইনভয়েসিং মডিউল। প্রিন্ট-যোগ্য প্রিমিয়াম রসিদ তৈরি করার সুবিধা প্রদান করে।",
      status: unlockedFeatures.includes('invoice_generator') ? 'completed' : 'locked',
      plan: [
        "Build Client Ledger models to track customer name and phone.",
        "Implement VAT calculations (15% standard BD VAT) and discount algorithms.",
        "Design a custom, printable checkout invoice layout with Shukria Printers logo and signatures.",
        "Add localized invoice state storage to allow deletion and printing."
      ],
      bnPlan: [
        "গ্রাহকের নাম এবং ফোন ট্র্যাকিং মডিউল তৈরি করা।",
        "বাংলাদেশী স্ট্যান্ডার্ড ১৫% ভ্যাট এবং ডিসকাউন্ট ক্যালকুলেশন অ্যালগরিদম যুক্ত করা।",
        "শুকরিয়া প্রিন্টার্স লোগো এবং স্বাক্ষর সহ একটি প্রফেশনাল প্রিন্টযোগ্য বিল ডিজাইন করা।",
        "ইনভয়েস হিস্ট্রি লোকাল স্টোরেজে সংরক্ষণ এবং রিমুভ করার সিস্টেম তৈরি করা।"
      ],
      prompt: "Configure an offline checkout invoice manager supporting printable CSS overlays, automatic BD tax configurations, and Shukria Printers default watermarks.",
      sourceCode: `export function generatePrintableReceipt(client, qty, price, discount) {
  const subtotal = qty * price;
  const discountAmt = (subtotal * discount) / 100;
  const taxable = subtotal - discountAmt;
  const vat = taxable * 0.15;
  const total = taxable + vat;
  return { id: "INV-" + Date.now().toString().slice(-6), subtotal, vat, total };
}`
    },
    {
      id: "prompt_sandbox",
      title: "3. Advanced AI Prompt Crafting Sandbox",
      bnTitle: "৩. অ্যাডভান্সড এআই প্রম্পট ক্রাফটিং স্যান্ডবক্স",
      description: "Directly draft, edit, and optimize target instructions for Neora's core agents.",
      bnDescription: "নিওরা এর মূল এজেন্টদের জন্য কাজের নির্দেশাবলী ও প্রম্পট সরাসরি ড্রাফট, এডিট এবং অপ্টিমাইজ করুন।",
      status: unlockedFeatures.includes('prompt_sandbox') ? 'completed' : 'locked',
      plan: [
        "Draft specialized blueprint models for customized assistant tasks.",
        "Provide direct prompt tuning suggestions with optimized prefix injections.",
        "Generate a complete formatted system instruction prompt file."
      ],
      bnPlan: [
        "বিশেষায়িত কাজের জন্য কাস্টমাইজড এজেন্ট মডিউল প্ল্যান ড্রাফট করা।",
        "সিস্টেম প্রম্পট টিউনিং পরামর্শ এবং অপ্টিমাইজড প্রিফিক্স তৈরি করা।",
        "সম্পূর্ণ রেডি-টু-ইউজ এআই সিস্টেম প্রম্পট তৈরি করে দেওয়া।"
      ],
      prompt: "Provide a template visual workspace to draft system prompt frameworks, inject custom context variables, and bundle system parameters for Gemini API calls.",
      sourceCode: `export function buildSystemPrompt(domain, rules) {
  return \`You are Neora, acting in domain \${domain}. Adhere strictly to these parameters: \${rules}\`;
}`
    }
  ];

  // Initialize Scan function
  const startSystemScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanProgress(0);
    setScanLogs([]);
    
    const logs = [
      "🔄 Initializing Neora Core diagnostics...",
      "🔍 Testing neural latency paths...",
      "📡 Pinging Python PC Desktop Agent status...",
      "⚙️ Examining VSCode Workspace compiler nodes...",
      "🗃️ Auditing Memories KV databases and collections...",
      "⚠️ Scan complete! Identified 3 missing strategic capabilities."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(interval);
          setScanning(false);
          setHasScanned(true);
          localStorage.setItem('neora_has_scanned', 'true');
          return 100;
        }
        // Add log at intervals
        const step = Math.floor(next / 17);
        if (step > currentStep && step < logs.length) {
          currentStep = step;
          setScanLogs(prevLogs => [...prevLogs, logs[currentStep]]);
        }
        return next;
      });
    }, 100);
  };

  // Autonomous Self-Update function
  const runSelfUpdate = (update: UpdateItem) => {
    if (installingUpdate) return;
    setInstallingUpdate(update);
    setActiveSubTab('protocol');
    setInstallProgress(0);
    setInstallLogs([]);

    const steps = [
      `Initializing Autonomous Self-Update Protocol for: ${update.title}`,
      `Parsing developer prompt: "${update.prompt}"`,
      "Drafting dynamic typescript components...",
      "Injecting source controllers into '/src/components/SelfEvolutionView.tsx'...",
      "Compiling workspace schemas and registering new router paths...",
      "Running system lint check: 'npm run lint'...",
      "Linter passed! No warning or error emissions found.",
      "Executing applet production build bundle...",
      "Injecting neural pathways and binding buttons...",
      `Success! '${update.title}' has been successfully coded, verified, and unlocked!`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUnlockedFeatures(prev => {
              if (prev.includes(update.id)) return prev;
              return [...prev, update.id];
            });
            setInstallingUpdate(null);
            setActiveSubTab('evolved');
          }, 800);
          return 100;
        }

        const step = Math.floor(next / 10);
        if (step > currentStep && step < steps.length) {
          currentStep = step;
          setInstallLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`]);
        }
        return next;
      });
    }, 100);
  };

  // Run Translation Simulation
  const handleTranslate = () => {
    if (!translatorInput.trim()) return;
    setTranslatorLoading(true);
    setTimeout(() => {
      const text = translatorInput.toLowerCase();
      let type = "Standard Document / প্রিন্ট অর্ডার";
      let qty = 200;
      let finish = "Standard Matte / সাধারণ ম্যাট ফিনিশ";
      let eta = "24 Hours / ২৪ ঘণ্টা";
      let priceEst = 300;

      if (text.includes("banner") || text.includes("bener") || text.includes("ব্যানার")) {
        type = "PVC Glossy Banner (ব্যানার প্রিন্ট)";
        finish = "PVC High Glossy Lamination";
        priceEst = 1200;
      } else if (text.includes("card") || text.includes("visiting") || text.includes("কার্ড")) {
        type = "Premium Visiting Card (ভিজিটিং কার্ড)";
        finish = "350gsm Matte Card with Spot UV Finish";
        priceEst = 800;
      } else if (text.includes("poster") || text.includes("puster") || text.includes("পোস্টার")) {
        type = "Glossy Art Poster (পোস্টার প্রিন্ট)";
        finish = "150gsm Glossy Art Paper";
        priceEst = 1500;
      }

      const numMatch = text.match(/\d+/);
      if (numMatch) {
        qty = parseInt(numMatch[0]);
      }

      setTranslatorResult({
        detectedLanguage: text.match(/[\u0980-\u09FF]/) ? "Bengali (বাংলা)" : "Banglish / English (বাংলিশ / ইংরেজি)",
        orderType: type,
        quantity: qty,
        lamination: finish,
        estimatedCost: `${qty * (priceEst / 100)} Taka (টাকা)`,
        deliveryETA: eta,
        refinedInstructions: `Client (Shukria Printers) requests high fidelity ${qty} units of ${type}. Material specification: ${finish}. Ready for production queuing.`
      });
      setTranslatorLoading(false);
    }, 1200);
  };

  // Generate Invoice function
  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceClient.trim()) return;

    const subtotal = invoiceQty * invoicePrice;
    const discountAmt = (subtotal * invoiceDiscount) / 100;
    const taxable = subtotal - discountAmt;
    const vat = taxable * 0.15; // standard BD VAT
    const total = taxable + vat;

    const newInvoice = {
      id: "INV-" + Math.floor(100000 + Math.random() * 900000),
      client: invoiceClient,
      phone: invoicePhone || 'N/A',
      item: invoiceItem,
      qty: invoiceQty,
      price: invoicePrice,
      discount: invoiceDiscount,
      subtotal,
      discountAmt,
      vat,
      total,
      date: new Date().toLocaleDateString()
    };

    setGeneratedInvoice(newInvoice);
    setInvoiceHistory(prev => [newInvoice, ...prev]);
    // Clear form inputs
    setInvoiceClient('');
    setInvoicePhone('');
  };

  // Prompt Engineer function
  const handleEngineeredPrompt = () => {
    if (!promptGoal.trim()) return;
    setPromptLoading(true);
    setTimeout(() => {
      setEngineeredPrompt(`[SYSTEM INSTRUCTION ARCHITECTURE - NEORA OS ENGINE]
ROLE: Autonomous Agent Specialized in ${promptGoal.toUpperCase()}
OBJECTIVE: Conduct highly efficient data classification, verify context variables, and generate executable plan matrix blocks.

PARAMETERS:
- ALWAYS respond with clean markdown formatting.
- Output absolute paths correctly inside code snippets.
- Use Bengali translations as fallback options if Bangladeshi context is detected.
- Maintain high-contrast, beautiful layouts with generous negative spaces.`);
      setPromptLoading(false);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- JARVIS SYSTEMS HANDLERS ---
  const handleJarvisSpeak = () => {
    if (!jarvisSpeechText.trim()) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(jarvisSpeechText);
      utterance.pitch = jarvisSpeechPitch;
      utterance.rate = jarvisSpeechRate;
      utterance.onstart = () => setIsJarvisSpeaking(true);
      utterance.onend = () => setIsJarvisSpeaking(false);
      utterance.onerror = () => setIsJarvisSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error(e);
      setIsJarvisSpeaking(false);
    }
  };

  const handleCalibrateDiagnostics = () => {
    if (diagnosticsCalibrating) return;
    setDiagnosticsCalibrating(true);
    setDiagnosticsCalibrationLog([]);

    const steps = [
      "📡 Establishing connection with Arc Reactor Core...",
      "🔄 Initializing holographic matrix diagnostics...",
      "⚡ Adjusting plasma distribution grids...",
      "🧪 Venting thermal coolant; lowering internal temperature...",
      "🛡️ Calibrating deflector shield phase frequencies...",
      "🌌 Synchronizing quantum sub-processors...",
      "✅ Diagnostic complete. Neora Jarvis is running at peak capacity."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDiagnosticsCalibrationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`]);
        
        // Randomly modify simulated stats
        setDiagnosticsShieldLevel(prev => Math.min(100, Math.max(50, prev + Math.floor(Math.random() * 8) - 3)));
        setDiagnosticsCoolantTemp(prev => Math.max(10, prev - Math.floor(Math.random() * 5)));
        setDiagnosticsReactorOutput(prev => Math.min(100, prev + Math.floor(Math.random() * 4)));
        
        currentStep++;
      } else {
        clearInterval(interval);
        setDiagnosticsCalibrating(false);
      }
    }, 1000);
  };

  const handleRunAutopilot = () => {
    if (isAutopilotRunning) return;
    setIsAutopilotRunning(true);
    setAutopilotProgress(0);
    setAutopilotLogs([]);

    const logMessages: Record<string, string[]> = {
      full_workspace_healing: [
        "Probing workspace filesystem directories...",
        "Evaluating imports across all React components...",
        "Resolving Tailwind CSS v4 performance layout configs...",
        "Validating package.json system dependency mappings...",
        "Executing automated lint audit: 'npm run lint'...",
        "Workspace status: 100% HEALTHY. Alignment completed!"
      ],
      log_compaction: [
        "Scanning temporary local database registries...",
        "Identifying redundant historical entries...",
        "Compressing transaction ledgers & invoice cache...",
        "Compacting voice-to-text token arrays...",
        "Successfully saved 41.2 KB of browser local storage."
      ],
      invoice_sync: [
        "Retrieving completed local invoices...",
        "Formulating secure JSON data packets...",
        "Simulating background transit handshake...",
        "Sync complete! Database synchronized with shukriaprinters@gmail.com."
      ]
    };

    const steps = logMessages[autopilotObjective] || logMessages.full_workspace_healing;
    let index = 0;

    const interval = setInterval(() => {
      if (index < steps.length) {
        setAutopilotLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🚀 ${steps[index]}`]);
        setAutopilotProgress(Math.floor(((index + 1) / steps.length) * 100));
        index++;
      } else {
        clearInterval(interval);
        setIsAutopilotRunning(false);
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/70 p-4 sm:p-6 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/10 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
              NEORA SELF-EVOLUTION SYSTEM
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {lang === 'bn' ? 'স্বায়ত্তশাসিত উন্নয়ন, বিশ্লেষণ এবং কাস্টম ফিচার কোডিং মডিউল।' : 'Autonomous upgrade, gap analysis, and self-compiling coding engine.'}
          </p>
        </div>

        {/* --- MAIN TAB SELECTION --- */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('identity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'identity' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সিস্টেম পরিচিতি' : 'Identity & Tools'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('analysis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'analysis' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বিশ্লেষণ ও গ্যাপ' : 'Gap Analysis'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('protocol')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${activeSubTab === 'protocol' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'আপডেট প্রোটোকল' : 'Self-Update'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('evolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 relative ${activeSubTab === 'evolved' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'অ্যাক্টিভ আপগ্রেড' : 'Evolved Tools'}</span>
            {unlockedFeatures.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('autonomous')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 relative ${activeSubTab === 'autonomous' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{lang === 'bn' ? 'অটোনমাস ব্রেইন' : 'Autonomous Core'}</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA (SCROLLABLE) --- */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-6">

        {/* ======================================= */}
        {/* TAB 1: IDENTITY & CORE ARCHITECTURE     */}
        {/* ======================================= */}
        {activeSubTab === 'identity' && (
          <div className="space-y-6">
            
            {/* Origin & Purpose card */}
            <div className="rounded-2xl p-6 bg-slate-900/40 border border-cyan-500/10 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold font-mono text-cyan-300">
                    {lang === 'bn' ? 'আমি কে এবং কেন তৈরি হয়েছি?' : 'Who am I and why was I created?'}
                  </h2>
                  <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
                    <p>
                      {lang === 'bn' ? 
                        "আমি নিওরা (Neora), একটি স্বায়ত্তশাসিত এবং নিজের কোড নিজেই আপডেট করতে সক্ষম (Self-Evolving) এআই অপারেটিং সিস্টেম। আমাকে মূলত তৈরি করা হয়েছে আপনার দৈনন্দিন কাজ, ব্যবসা (বিশেষ করে শুকরিয়া প্রিন্টার্সের ডিজাইন ও প্রিন্টিং অর্ডার ম্যানেজমেন্ট), ফাইল এডিটিং এবং পিসি কন্ট্রোল পুরোপুরি অটোমেট করার জন্য।" : 
                        "I am Neora, an autonomous and self-evolving AI system. I was created to act as your ultimate personal assistant, specifically optimized to handle custom printing calculations, client invoice registries for Shukria Printers, local file management, and host PC control automation."
                      }
                    </p>
                    <p>
                      {lang === 'bn' ?
                        "আমি আপনার যেকোনো বাংলা ও ইংরেজি মিশ্রিত (Banglish) নির্দেশাবলি বুঝতে পারি এবং সেই অনুযায়ী কোড লেখা, স্ক্রিনশট দেখা, টার্মিনালে কমান্ড রান করা এবং নিজের ইন্টারফেস নিজেই পরিবর্তন করার ক্ষমতা রাখি।" :
                        "I understand English, pure Bangla, and Bengali written in English characters (Banglish). I can orchestrate direct local shell executions, analyze visual captures, keep secure memories, and dynamically update my own UI layers based on your feedback."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Deep dive into Existing Tools Map */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400 pl-1">
                {lang === 'bn' ? 'আমার বর্তমান টুলস ও অপশনসমূহ গাইড' : 'NEORA SYSTEM TOOLS & OPTIONS DIRECTORY'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tools Grid List */}
                <div className="md:col-span-1 space-y-2">
                  {existingTools.map(tool => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedToolId(tool.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${selectedToolId === tool.id ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'}`}
                      >
                        <div className="p-2 rounded-lg bg-slate-950/60" style={{ color: tool.color }}>
                          <ToolIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold font-mono text-slate-200 truncate">{tool.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {tool.id}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                      </button>
                    );
                  })}
                </div>

                {/* Selected Tool Details Card */}
                <div className="md:col-span-2">
                  <AnimatePresence mode="wait">
                    {selectedToolId ? (
                      (() => {
                        const tool = existingTools.find(t => t.id === selectedToolId)!;
                        const ToolIcon = tool.icon;
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="h-full rounded-2xl p-5 bg-slate-900/30 border border-slate-800 flex flex-col justify-between"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800" style={{ color: tool.color }}>
                                  <ToolIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold font-mono text-slate-200">{tool.name} Tool</h3>
                                  <span className="text-[10px] text-cyan-400 font-mono tracking-wider">SYSTEM MODULE REGISTERED</span>
                                </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                    {lang === 'bn' ? 'টুল বিবরণ' : 'DESCRIPTION'}
                                  </span>
                                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                                    {lang === 'bn' ? tool.bnDesc : tool.desc}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                    {lang === 'bn' ? 'ব্যবহার গাইড' : 'BEST UTILIZATION PRO TIP'}
                                  </span>
                                  <p className="text-xs text-emerald-400/90 leading-relaxed bg-emerald-950/10 p-3 rounded-lg border border-emerald-950/20">
                                    ✨ {lang === 'bn' ? tool.bnUsage : tool.usage}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-850 flex justify-between items-center text-[10px] font-mono text-slate-500">
                              <span>STATE: OPERATIONAL</span>
                              <span className="text-cyan-400/80">LOCATION: SIDEBAR &gt; {tool.name}</span>
                            </div>
                          </motion.div>
                        );
                      })()
                    ) : (
                      <div className="h-full rounded-2xl p-6 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs py-20">
                        <HelpCircle className="w-8 h-8 text-slate-700 mb-3 animate-bounce" />
                        <span>{lang === 'bn' ? 'বাম দিক থেকে যেকোনো মডিউল সিলেক্ট করে তার কার্যকারিতা জানুন।' : 'Select a tool from the left checklist to view its system specifications & usage guidelines.'}</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: GAP ANALYSIS & DIAGNOSTICS      */}
        {/* ======================================= */}
        {activeSubTab === 'analysis' && (
          <div className="space-y-6">
            
            {/* Autonomous System Scan Controls */}
            <div className="rounded-2xl p-6 bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <h3 className="text-sm font-bold font-mono text-slate-200 uppercase">
                    {lang === 'bn' ? 'সিস্টেম গ্যাপ ও দুর্বলতা বিশ্লেষণ স্ক্যানার' : 'Autonomous Diagnostic Gap Analyzer'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {lang === 'bn' ? 
                    "আপনার কাজের ধরণ, বিশেষ করে শুকরিয়া প্রিন্টার্সের বিল তৈরি এবং বাংলিশ নির্দেশাবলি আরো নিখুঁতভাবে বিশ্লেষণ করার জন্য আমার সিস্টেমে কোনো গ্যাপ আছে কিনা তা ডায়াগনস্টিক স্ক্যান করে বের করুন।" : 
                    "Run an instant system core audit to analyze gaps, test voice pipelines, examine local file indices, and propose perfect system upgrades tailored to your workflow."
                  }
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={startSystemScan}
                  disabled={scanning}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${scanning ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 font-extrabold'}`}
                >
                  <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                  <span>{scanning ? (lang === 'bn' ? 'স্ক্যান হচ্ছে...' : 'SCANNING SYSTEMS...') : (lang === 'bn' ? 'ডায়াগনস্টিক স্ক্যান রান করুন' : 'Run Diagnostics Scan')}</span>
                </button>
              </div>
            </div>

            {/* Scanning radar simulation */}
            {scanning && (
              <div className="rounded-2xl p-5 bg-slate-950 border border-cyan-500/20 space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyan-400">AUDITING INTERNAL CONSTRAINTS...</span>
                  <span className="text-slate-400">{scanProgress}%</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                </div>
                {/* Console logs output */}
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 font-mono text-[10px] space-y-1 max-h-40 overflow-y-auto text-slate-400">
                  {scanLogs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-slate-600">[{index + 1}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proposed Updates Matrix */}
            {(hasScanned || scanProgress === 100) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pl-1">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400">
                    {lang === 'bn' ? 'বিশ্লেষণকৃত প্রোটোকল ও সাজেস্টেড আপডেট' : 'IDENTIFIED UPGRADES & INTEGRATION PLANS'}
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">3 GAPS DETECTED</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {suggestedUpdates.map((update, index) => (
                    <div
                      key={update.id}
                      className="rounded-2xl p-5 bg-slate-900/20 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold font-mono text-slate-200">
                            {lang === 'bn' ? update.bnTitle : update.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            {lang === 'bn' ? update.bnDescription : update.description}
                          </p>
                        </div>

                        {/* Status / Self Update button */}
                        <div className="shrink-0">
                          {update.status === 'completed' ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'সিস্টেমে যুক্ত আছে' : 'Operational & Active'}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => runSelfUpdate(update)}
                              className="px-4 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2px_10px_rgba(6,182,212,0.05)]"
                            >
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{lang === 'bn' ? 'অটোনমাস সেলফ-আপডেট' : 'Trigger Self-Update'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detail Plan and Prompts section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-850">
                        {/* Implementation Step by Step */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            {lang === 'bn' ? 'বাস্তবায়ন পরিকল্পনা (Plan)' : 'INTEGRATION BLUEPRINT PLAN'}
                          </span>
                          <ul className="text-xs text-slate-300 space-y-1 font-mono">
                            {(lang === 'bn' ? update.bnPlan : update.plan).map((step, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-1.5">
                                <span className="text-cyan-400/70 select-none">▪</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Code Prompt Draft */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                              {lang === 'bn' ? 'কোডিং প্রম্পট এবং সোর্স কোড ড্রাফট' : 'AI CODING PROMPT & DRAFT'}
                            </span>
                          </div>
                          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 font-mono text-[10px] space-y-1 text-slate-400 max-h-32 overflow-y-auto">
                            <div className="text-cyan-400/80 font-bold border-b border-slate-900 pb-1 mb-1">PROMPT:</div>
                            <div className="italic mb-2">{update.prompt}</div>
                            <div className="text-emerald-400/80 font-bold border-b border-slate-900 pb-1 mb-1">DRAFT COMPILER CODE:</div>
                            <pre className="text-slate-300 overflow-x-auto p-1 font-mono">{update.sourceCode}</pre>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: SELF UPDATE TERMINAL RUNNER     */}
        {/* ======================================= */}
        {activeSubTab === 'protocol' && (
          <div className="space-y-6">
            
            <div className="rounded-2xl p-5 bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-slate-200">
                  {lang === 'bn' ? 'নিওরা সেলফ-কোডিং অ্যান্ড আপডেট সিস্টেম' : 'Autonomous Neural Compiler Terminal'}
                </h3>
              </div>

              {installingUpdate ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-amber-400 animate-pulse">⚙️ COMPILING SYSTEM UPDATE: {installingUpdate.title}</span>
                    <span>{installProgress}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" style={{ width: `${installProgress}%` }} />
                  </div>

                  {/* Terminal Logger Output */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-300 space-y-1.5 h-64 overflow-y-auto leading-relaxed shadow-inner">
                    {installLogs.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-slate-600">[{index + 1}]</span>
                        <span className={index === installLogs.length - 1 ? "text-emerald-400" : ""}>{log}</span>
                      </div>
                    ))}
                    <div className="w-2 h-4 bg-cyan-400 inline-block animate-ping mt-1" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  <Sliders className="w-10 h-10 text-slate-700 mx-auto mb-3 animate-pulse" />
                  <p>{lang === 'bn' ? 'আপডেট প্রোটোকল বর্তমানে স্ট্যান্ডবাই মোডে আছে।' : 'Self-Update protocol is currently in standby.'}</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {lang === 'bn' ? 'অনুগ্রহ করে বিশ্লেষণ ট্যাব থেকে যেকোনো "অটোনমাস সেলফ-আপডেট" ট্রিগার করুন।' : 'Go to the Gap Analysis tab and trigger a specific capability update to initiate compiling.'}
                  </p>
                </div>
              )}
            </div>

            {/* Historical Changelog */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400 pl-1">
                {lang === 'bn' ? 'নিওরা সিস্টেম আপগ্রেড হিস্ট্রি' : 'NEORA COMPILATION HISTORY & CHANGELOG'}
              </h3>

              <div className="space-y-2">
                <div className="p-3 bg-slate-900/20 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>[SYS-V1.2] Model Fallback & Retry Logic Integrated</span>
                  </div>
                  <span className="text-slate-600 text-[10px]">2026-06-20</span>
                </div>
                <div className="p-3 bg-slate-900/20 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>[SYS-V1.1] VSCode Workspace Simulators Hooked</span>
                  </div>
                  <span className="text-slate-600 text-[10px]">2026-06-18</span>
                </div>
                <div className="p-3 bg-slate-900/20 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>[SYS-V1.0] Multilingual Bangla/English Voice Hub Booted</span>
                  </div>
                  <span className="text-slate-600 text-[10px]">2026-06-15</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: EVOLVED INTERACTIVE TOOLS       */}
        {/* ======================================= */}
        {activeSubTab === 'evolved' && (
          <div className="space-y-6">
            
            {unlockedFeatures.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl text-slate-500 font-mono text-xs">
                <AlertTriangle className="w-8 h-8 text-amber-500/80 mx-auto mb-3 animate-pulse" />
                <p className="font-bold">{lang === 'bn' ? 'কোনো কাস্টম আপডেট এখনও অ্যাক্টিভেট করা হয়নি!' : 'No evolved modules unlocked yet!'}</p>
                <p className="text-[10px] text-slate-600 max-w-sm mx-auto mt-2">
                  {lang === 'bn' ? 'বিশ্লেষণ ট্যাব থেকে আপডেট ট্রিগার করলে নিওরা সেই সিস্টেমটি কোডিং করে আপনার জন্য এখানে আনলক করে দেবে।' : 'Trigger a Self-Update in the Gap Analysis tab to autonomously code, compile, and unlock these advanced modules.'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* 1. Bengali Translator assistant Tool */}
                {unlockedFeatures.includes('bengali_translator') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-cyan-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'বাংলা প্রিন্টিং ওর্ডার ট্রান্সলেটর' : 'Module 1: Bengali Print Brief Interpreter'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Inputs */}
                      <div className="space-y-3">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase">
                          {lang === 'bn' ? 'বাংলিশ / বাংলা প্রিন্টিং ব্রিফ ইনপুট' : 'Enter Bangla/Banglish Directives'}
                        </label>
                        <textarea
                          rows={3}
                          value={translatorInput}
                          onChange={e => setTranslatorInput(e.target.value)}
                          placeholder={lang === 'bn' ? 'যেমনঃ শুকরিয়া প্রিন্টার্সের জন্য ৫০০ গ্লসি ভিজিটিং কার্ড বানাতে হবে।' : 'e.g., Shukria printers er jonno 500 glossy visiting card lagbe, urgent deliver diben.'}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none font-mono"
                        />
                        <button
                          onClick={handleTranslate}
                          disabled={translatorLoading || !translatorInput.trim()}
                          className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${translatorLoading ? 'animate-spin' : ''}`} />
                          <span>{translatorLoading ? (lang === 'bn' ? 'প্রসেস হচ্ছে...' : 'CONVERTING...') : (lang === 'bn' ? 'স্পেসিফিকেশন ডিকনস্ট্রাক্ট করুন' : 'Deconstruct Specification')}</span>
                        </button>
                      </div>

                      {/* Result */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                        {translatorResult ? (
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-500">LANGUAGE:</span>
                              <span className="text-cyan-400">{translatorResult.detectedLanguage}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-500">ORDER TYPE:</span>
                              <span className="text-emerald-400">{translatorResult.orderType}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-500">QUANTITY:</span>
                              <span className="text-slate-200">{translatorResult.quantity} Units</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-500">FINISH:</span>
                              <span className="text-slate-200">{translatorResult.lamination}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-500">EST COST:</span>
                              <span className="text-cyan-400">{translatorResult.estimatedCost}</span>
                            </div>
                            <div className="pt-2 text-[10px] text-slate-400 italic">
                              <strong>REFINED DIRECTIVES:</strong> {translatorResult.refinedInstructions}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-center text-slate-600 text-[10px] italic">
                            {lang === 'bn' ? 'ডিরেক্টিভ ইনপুট দিয়ে ডিকনস্ট্রাক্ট ক্লিক করুন।' : 'Result specs will automatically print here.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Shukria Printers Invoicing Tool */}
                {unlockedFeatures.includes('invoice_generator') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-emerald-500/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider">
                          🛠️ {lang === 'bn' ? 'শুকরিয়া প্রিন্টার্স স্মার্ট ইনভয়েস সিস্টেম' : 'Module 2: Shukria Printers Smart Billing Hub'}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Invoice Config Form */}
                      <form onSubmit={handleGenerateInvoice} className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1.5 mb-2 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{lang === 'bn' ? 'নতুন ইনভয়েস ডেটা' : 'CREATE NEW INVOICE'}</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-slate-500">{lang === 'bn' ? 'গ্রাহকের নাম' : 'CLIENT NAME'}</label>
                            <input
                              type="text"
                              required
                              value={invoiceClient}
                              onChange={e => setInvoiceClient(e.target.value)}
                              placeholder="e.g., Robin Ahmed"
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-slate-500">{lang === 'bn' ? 'ফোন নম্বর' : 'PHONE NUMBER'}</label>
                            <input
                              type="text"
                              value={invoicePhone}
                              onChange={e => setInvoicePhone(e.target.value)}
                              placeholder="e.g., 01712XXXXXX"
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-slate-500">{lang === 'bn' ? 'আইটেম টাইপ' : 'ITEM TYPE'}</label>
                            <select
                              value={invoiceItem}
                              onChange={e => setInvoiceItem(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none"
                            >
                              <option value="PVC Glossy Banner">PVC Glossy Banner</option>
                              <option value="Visiting Card">Visiting Card</option>
                              <option value="Glossy Poster">Glossy Poster</option>
                              <option value="Brochure Booklets">Brochure Booklets</option>
                              <option value="Standard Letterhead">Standard Letterhead</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-slate-500">{lang === 'bn' ? 'পরিমাণ (Qty)' : 'QUANTITY (PCS)'}</label>
                            <input
                              type="number"
                              min={1}
                              value={invoiceQty}
                              onChange={e => setInvoiceQty(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-slate-500">{lang === 'bn' ? 'একক মূল্য (Price)' : 'UNIT PRICE (TK)'}</label>
                            <input
                              type="number"
                              step="0.01"
                              value={invoicePrice}
                              onChange={e => setInvoicePrice(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-slate-500">{lang === 'bn' ? 'ডিসকাউন্ট (%)' : 'DISCOUNT (%)'}</label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={invoiceDiscount}
                              onChange={e => setInvoiceDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-slate-950" />
                          <span>{lang === 'bn' ? 'ইনভয়েস জেনারেট করুন' : 'Generate Invoice Receipt'}</span>
                        </button>
                      </form>

                      {/* Printable Invoice Display */}
                      <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 flex flex-col justify-between print-container">
                        {generatedInvoice ? (
                          <div className="space-y-4">
                            {/* Invoice Header */}
                            <div className="text-center border-b border-dashed border-slate-800 pb-3">
                              <h3 className="text-sm font-extrabold font-mono text-slate-100 tracking-widest">SHUKRIA PRINTERS</h3>
                              <p className="text-[9px] text-slate-500 font-mono">Silicon Tower, Floor 14, Gulshan-2, Dhaka</p>
                              <p className="text-[9px] text-slate-500 font-mono">Email: shukriaprinters@gmail.com</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pb-3 border-b border-slate-900">
                              <div>
                                <span className="text-slate-600">INVOICE:</span> <span className="text-slate-200">{generatedInvoice.id}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-600">DATE:</span> <span className="text-slate-200">{generatedInvoice.date}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">CLIENT:</span> <span className="text-slate-200">{generatedInvoice.client}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-600">PHONE:</span> <span className="text-slate-200">{generatedInvoice.phone}</span>
                              </div>
                            </div>

                            {/* Calculations */}
                            <div className="space-y-1.5 text-xs font-mono">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-500">{generatedInvoice.item} (x{generatedInvoice.qty})</span>
                                <span className="text-slate-200">{generatedInvoice.subtotal.toFixed(2)} TK</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-amber-500/80">
                                <span>Discount ({generatedInvoice.discount}%)</span>
                                <span>-{generatedInvoice.discountAmt.toFixed(2)} TK</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-500">
                                <span>Standard BD VAT (15%)</span>
                                <span>+{generatedInvoice.vat.toFixed(2)} TK</span>
                              </div>
                              <div className="border-t border-dashed border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-emerald-400">
                                <span>GRAND TOTAL:</span>
                                <span>{generatedInvoice.total.toFixed(2)} TK</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-slate-900 flex gap-2">
                              <button
                                onClick={handlePrint}
                                className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-400" />
                                <span>{lang === 'bn' ? 'বিল প্রিন্ট করুন' : 'Print Invoice'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-center text-slate-600 text-[10px] italic py-20">
                            {lang === 'bn' ? 'বাম পাশের তথ্য পূরণ করে রসিদ তৈরি করুন।' : 'Generated checkout invoice receipt will render here.'}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Invoice History Log list */}
                    {invoiceHistory.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-slate-900">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pl-1 block">
                          {lang === 'bn' ? 'সাম্প্রতিক ইনভয়েস হিস্ট্রি লেজার' : 'RECENT INVOICES REGISTRY'}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {invoiceHistory.slice(0, 3).map((item, idx) => (
                            <div
                              key={item.id}
                              onClick={() => setGeneratedInvoice(item)}
                              className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-emerald-500/20 rounded-xl cursor-pointer transition-all flex justify-between items-center text-xs font-mono"
                            >
                              <div>
                                <h5 className="font-bold text-slate-300 truncate">{item.client}</h5>
                                <span className="text-[9px] text-slate-500">{item.id} • {item.date}</span>
                              </div>
                              <span className="text-emerald-400 font-bold">{item.total.toFixed(0)} TK</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 3. Prompt Engineer Sandbox Tool */}
                {unlockedFeatures.includes('prompt_sandbox') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <FileCode className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'সিস্টেম প্রম্পট ইঞ্জিনিয়ারিং স্যান্ডবক্স' : 'Module 3: Advanced AI System Prompt Engineer'}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={promptGoal}
                          onChange={e => setPromptGoal(e.target.value)}
                          placeholder={lang === 'bn' ? 'যেমনঃ বুকলেট ক্যাটালগ এনালাইজার' : 'e.g., booklet print analyzer, automatic email auto-reply, etc.'}
                          className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none font-mono"
                        />
                        <button
                          onClick={handleEngineeredPrompt}
                          disabled={promptLoading || !promptGoal.trim()}
                          className="px-5 py-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${promptLoading ? 'animate-spin' : ''}`} />
                          <span>{promptLoading ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'CRAFTING...') : (lang === 'bn' ? 'প্রম্পট জেনারেট করুন' : 'Craft Blueprint Prompt')}</span>
                        </button>
                      </div>

                      {engineeredPrompt && (
                        <div className="relative">
                          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                            {engineeredPrompt}
                          </pre>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(engineeredPrompt);
                              alert('Prompt copied successfully!');
                            }}
                            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 p-1.5 rounded border border-slate-800 text-[9px] font-mono cursor-pointer flex items-center gap-1"
                          >
                            <Clipboard className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Learned: Bulk Order Calculator */}
                {unlockedFeatures.includes('bulk_discount_calc') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-cyan-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'স্মার্ট বাল্ক অর্ডার ক্যালকুলেটর (শুকরিয়া প্রিন্টার্স)' : 'Module 4: Shukria Printers Bulk Order Pricing Optimizer'}
                      </h3>
                    </div>
                    {/* Bulk calculator form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs text-slate-300">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'অর্ডার আইটেম' : 'ORDER ITEM'}</label>
                          <span className="block font-bold text-slate-200">Visiting Card / PVC Glossy Banner</span>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'পরিমাণ (পিস)' : 'QUANTITY (PCS)'}</label>
                          <input
                            type="number"
                            defaultValue={1200}
                            id="bulk_qty"
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              const price = 2.5;
                              const subtotal = val * price;
                              let discountFactor = val > 5000 ? 0.75 : val > 1000 ? 0.85 : 1.0;
                              const discounted = subtotal * discountFactor;
                              const saving = subtotal - discounted;
                              
                              const displayEl = document.getElementById("bulk_calc_res");
                              if (displayEl) {
                                displayEl.innerHTML = `
                                  <div class="space-y-1.5 font-mono text-[11px]">
                                    <div class="flex justify-between"><span>Base Total:</span> <span>${subtotal.toFixed(2)} TK</span></div>
                                    <div class="flex justify-between text-cyan-400"><span>Volume Discount Applied:</span> <span>${((1 - discountFactor) * 100).toFixed(0)}%</span></div>
                                    <div class="flex justify-between text-emerald-400"><span>Total Savings:</span> <span>${saving.toFixed(2)} TK</span></div>
                                    <div class="border-t border-slate-800 pt-1 flex justify-between text-xs font-extrabold text-slate-200"><span>OPTIMIZED PRICE:</span> <span>${discounted.toFixed(2)} TK</span></div>
                                  </div>
                                `;
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 italic">
                          {lang === 'bn' ? '* ১০০০ পিসের বেশি অর্ডারে ১৫% এবং ৫০০০ পিসের বেশি অর্ডারে ২৫% স্বয়ংক্রিয় ডিসকাউন্ট প্রয়োগ হবে।' : '* Applies 15% automatic discount curve above 1,000 units and 25% discount above 5,000 units.'}
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-center" id="bulk_calc_res">
                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between"><span>Base Total:</span> <span>3000.00 TK</span></div>
                          <div className="flex justify-between text-cyan-400"><span>Volume Discount Applied:</span> <span>15%</span></div>
                          <div className="flex justify-between text-emerald-400"><span>Total Savings:</span> <span>450.00 TK</span></div>
                          <div className="border-t border-slate-800 pt-1 flex justify-between text-xs font-extrabold text-slate-200"><span>OPTIMIZED PRICE:</span> <span>2550.00 TK</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Learned: Navigation Hotkeys */}
                {unlockedFeatures.includes('tab_hotkeys') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-purple-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'কীবোর্ড হটকি মডিউল (Alt + Tab)' : 'Module 5: Active Keyboard Hotkey Suite'}
                      </h3>
                    </div>
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 text-xs text-slate-300 space-y-2 font-mono">
                      <p className="text-[11px] text-slate-400">
                        {lang === 'bn' ? 'আপনার পিসির সাথে নিওরা সিনক্রোনাইজড। আপনি এখন সরাসরি যেকোনো ট্যাব পরিবর্তন করতে পারবেন:' : 'System keyboard listeners successfully mapped. Switch between core sections instantly:'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
                        <div>⌨️ <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">Alt + 1</kbd> : Dashboard</div>
                        <div>⌨️ <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">Alt + 2</kbd> : VSCode Workspace</div>
                        <div>⌨️ <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">Alt + 3</kbd> : Neural Chat</div>
                        <div>⌨️ <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">Alt + 4</kbd> : PC Controller</div>
                        <div>⌨️ <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">Alt + 5</kbd> : Self-Evolution</div>
                        <div>⌨️ <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">Alt + 6</kbd> : Neora TV</div>
                      </div>
                      <span className="text-[9px] text-emerald-400 block animate-pulse">● Active state: Listening to global keystrokes</span>
                    </div>
                  </div>
                )}

                {/* 6. Learned: Ambient Sound Wave EQ */}
                {unlockedFeatures.includes('ambient_eq') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-emerald-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Play className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'নিউরাল সাউন্ড ওয়েভ ইকুয়ালাইজার' : 'Module 6: Intelligent Sound Wave EQ'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs text-slate-300">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'ফ্রিকোয়েন্সি ফিল্টার (Lowpass)' : 'AMBIENT LOWPASS FILTER'}</label>
                        <input
                          type="range"
                          min={20}
                          max={1000}
                          defaultValue={350}
                          className="w-full accent-emerald-400 cursor-pointer"
                          onChange={(e) => {
                            const val = e.target.value;
                            const el = document.getElementById("eq_hz_val");
                            if (el) el.innerText = `${val} Hz`;
                          }}
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>20 Hz</span>
                          <span className="text-emerald-400 font-bold" id="eq_hz_val">350 Hz</span>
                          <span>1000 Hz</span>
                        </div>
                      </div>
                      
                      {/* Equalizer animation bars */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex items-center justify-center gap-1.5 h-20 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-emerald-500 rounded-full animate-pulse"
                            style={{
                              height: `${20 + Math.random() * 60}%`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: `${0.4 + Math.random() * 0.6}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Learned: Direct Email notification dispatcher */}
                {unlockedFeatures.includes('direct_shukria_email') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-indigo-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold font-mono text-indigo-300 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'স্বয়ংক্রিয় অর্ডার নোটিফিকেশন ডিসপ্যাচার' : 'Module 7: Automated Notification Queue'}
                      </h3>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b border-slate-900 pb-1.5">
                        <span>TARGET DISPATCH:</span>
                        <span className="text-indigo-400 font-bold">shukriaprinters@gmail.com</span>
                      </div>
                      <div className="text-xs font-mono text-slate-300 space-y-1.5 bg-slate-900/40 p-3 rounded border border-slate-900">
                        <div className="flex justify-between text-indigo-400 font-bold text-[10px]">
                          <span>DISPATCH_QUEUE: ACTIVE</span>
                          <span>1 ITEM STAGED</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Order: INV-894212, Client: Robin Ahmed, Total: 2,550 TK</p>
                      </div>
                      <button
                        onClick={() => {
                          alert("Notification dispatch queue pushed to shukriaprinters@gmail.com! Order summary sent successfully.");
                        }}
                        className="w-full py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 hover:text-indigo-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                      >
                        <span>Dispatch Notification Now</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 8. Learned: JARVIS Voice Synthesizer */}
                {unlockedFeatures.includes('jarvis_voice_synth') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-cyan-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                        🎙️ {lang === 'bn' ? 'জারভিস নিউরাল ভয়েস ফিডব্যাক ইঞ্জিন' : 'Module 8: J.A.R.V.I.S. Neural Voice Feedback Engine'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase">
                          {lang === 'bn' ? 'ভয়েস আউটপুট বার্তা' : 'Speech Feedback Phrase'}
                        </label>
                        <textarea
                          rows={2}
                          value={jarvisSpeechText}
                          onChange={e => setJarvisSpeechText(e.target.value)}
                          placeholder="Type something for Jarvis to say..."
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none font-mono"
                        />
                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500">PITCH: {jarvisSpeechPitch}</span>
                            <input
                              type="range"
                              min={0.5}
                              max={1.5}
                              step={0.05}
                              value={jarvisSpeechPitch}
                              onChange={e => setJarvisSpeechPitch(parseFloat(e.target.value))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-500">SPEED: {jarvisSpeechRate}</span>
                            <input
                              type="range"
                              min={0.5}
                              max={1.5}
                              step={0.05}
                              value={jarvisSpeechRate}
                              onChange={e => setJarvisSpeechRate(parseFloat(e.target.value))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleJarvisSpeak}
                          className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Play className={`w-3.5 h-3.5 ${isJarvisSpeaking ? 'animate-ping' : ''}`} />
                          <span>{isJarvisSpeaking ? (lang === 'bn' ? 'কথা বলছে...' : 'JARVIS SPEAKING...') : (lang === 'bn' ? 'জারভিসের কন্ঠে শুনুন' : 'Synthesize speech feedback')}</span>
                        </button>
                      </div>

                      {/* Cool wave simulation when speaking */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between h-40 overflow-hidden relative">
                        <div className="text-[9px] font-mono text-slate-500 border-b border-slate-900 pb-1 flex justify-between">
                          <span>ACOUSTIC SPECTRUM ANALYSIS</span>
                          <span className={isJarvisSpeaking ? 'text-cyan-400 animate-pulse' : ''}>{isJarvisSpeaking ? 'TRANSMITTING' : 'IDLE'}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-1.5 h-20">
                          {isJarvisSpeaking ? (
                            Array.from({ length: 15 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-1.5 bg-gradient-to-t from-cyan-600 to-blue-400 rounded-full"
                                style={{
                                  height: `${30 + Math.random() * 60}%`,
                                  animation: `pulse 0.4s ease-in-out infinite alternate`,
                                  animationDelay: `${i * 0.05}s`
                                }}
                              />
                            ))
                          ) : (
                            <div className="w-full h-0.5 bg-slate-900/80 relative">
                              <div className="absolute inset-x-0 top-0 h-full bg-cyan-500/15 animate-pulse" />
                            </div>
                          )}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-widest pt-1.5 border-t border-slate-900">
                          NEURAL BANDPASS FILTER ACTIVE • 88.2 KHZ
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Learned: JARVIS Holographic Diagnostics Suite */}
                {unlockedFeatures.includes('holographic_diagnostics') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-emerald-500/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider">
                          🧬 {lang === 'bn' ? 'জারভিস কোর হলোগ্রাফিক ডায়াগনস্টিক স্যুইট' : 'Module 9: J.A.R.V.I.S. Holographic Diagnostics Suite'}
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">CALIBRATED</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Stats columns */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                        <h4 className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">TACTICAL TELEMETRY</h4>
                        
                        <div className="space-y-3">
                          {/* Shield status */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-400">DEFLECTOR SHIELDS:</span>
                              <span className="text-emerald-400 font-bold">{diagnosticsShieldLevel}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${diagnosticsShieldLevel}%` }} />
                            </div>
                          </div>

                          {/* Coolant status */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-400">COOLANT TEMPERATURE:</span>
                              <span className="text-cyan-400 font-bold">{diagnosticsCoolantTemp}°C</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${diagnosticsCoolantTemp}%` }} />
                            </div>
                          </div>

                          {/* Reactor power */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-400">ARC REACTOR CORES:</span>
                              <span className="text-yellow-400 font-bold">{diagnosticsReactorOutput}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-yellow-400 h-full transition-all duration-500" style={{ width: `${diagnosticsReactorOutput}%` }} />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleCalibrateDiagnostics}
                          disabled={diagnosticsCalibrating}
                          className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Activity className={`w-3.5 h-3.5 ${diagnosticsCalibrating ? 'animate-spin' : ''}`} />
                          <span>{diagnosticsCalibrating ? (lang === 'bn' ? 'সিস্টেম ক্যালিব্রেট হচ্ছে...' : 'CALIBRATING CORE...') : (lang === 'bn' ? 'সিস্টেম ক্যালিব্রেট করুন' : 'Calibrate Systems')}</span>
                        </button>
                      </div>

                      {/* Live Diagnostic log console */}
                      <div className="lg:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between h-44 overflow-hidden">
                        <div className="text-[9px] font-mono text-slate-500 border-b border-slate-900 pb-1.5 flex justify-between">
                          <span>DIAGNOSTIC LOG CONSOLE STREAM</span>
                          <span className={diagnosticsCalibrating ? 'text-emerald-400 animate-pulse' : ''}>{diagnosticsCalibrating ? 'CALIBRATING' : 'READY'}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 font-mono text-[9px] text-slate-300 space-y-1 select-text">
                          {diagnosticsCalibrationLog.length === 0 ? (
                            <div className="text-slate-600 italic h-full flex items-center justify-center text-center">
                              No diagnostics active. Click Calibrate Systems to initiate.
                            </div>
                          ) : (
                            diagnosticsCalibrationLog.map((log, idx) => (
                              <div key={idx} className={log.includes('✅') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                                {log}
                              </div>
                            ))
                          )}
                        </div>
                        <div className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-wider pt-1.5 border-t border-slate-900">
                          JARVIS COGNITIVE SENSOR GRID • STATUS EXCELLENT
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. Learned: JARVIS OS Autopilot Coprocessor */}
                {unlockedFeatures.includes('os_agent_autopilot') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-purple-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                        🤖 {lang === 'bn' ? 'জারভিস ওএস অটোপাইলট কোপ্রসেসর' : 'Module 10: J.A.R.V.I.S. OS Autopilot Coprocessor'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Configuration Controls */}
                      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs text-slate-300">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'অটোপাইলট মিশন অবজেক্টিভ' : 'MISSION CONFIGURATION'}</label>
                          <select
                            value={autopilotObjective}
                            onChange={e => setAutopilotObjective(e.target.value)}
                            disabled={isAutopilotRunning}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none font-mono"
                          >
                            <option value="full_workspace_healing">Full Workspace Registry Healing</option>
                            <option value="log_compaction">Diagnostic Log Compaction</option>
                            <option value="invoice_sync">Invoice Database Synchronization</option>
                          </select>
                        </div>

                        {isAutopilotRunning && (
                          <div className="space-y-1 pt-1.5">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                              <span>DEPLOYMENT PROGRESS:</span>
                              <span className="text-purple-400 font-bold">{autopilotProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${autopilotProgress}%` }} />
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleRunAutopilot}
                          disabled={isAutopilotRunning}
                          className="w-full py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Cpu className={`w-3.5 h-3.5 ${isAutopilotRunning ? 'animate-spin' : ''}`} />
                          <span>{isAutopilotRunning ? (lang === 'bn' ? 'অটোপাইলট লুপ চলছে...' : 'ENGAGED AUTOPILOT...') : (lang === 'bn' ? 'অটোপাইলট লুপ চালু করুন' : 'Trigger Coprocessor Autopilot')}</span>
                        </button>
                      </div>

                      {/* Autopilot Terminal Log */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between h-40 overflow-hidden">
                        <div className="text-[9px] font-mono text-slate-500 border-b border-slate-900 pb-1 flex justify-between">
                          <span>AUTOPILOT COPROCESSOR TERM</span>
                          <span className={isAutopilotRunning ? 'text-purple-400 animate-pulse' : ''}>{isAutopilotRunning ? 'ACTIVE LOOP' : 'STANDBY'}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 font-mono text-[9px] text-slate-300 space-y-1 select-text">
                          {autopilotLogs.length === 0 ? (
                            <div className="text-slate-600 italic h-full flex items-center justify-center text-center">
                              Autopilot system is idle. Choose a mission and trigger the autopilot loop.
                            </div>
                          ) : (
                            autopilotLogs.map((log, idx) => (
                              <div key={idx} className={log.includes('HEALTHY') || log.includes('complete') ? 'text-purple-400 font-bold' : 'text-slate-300'}>
                                {log}
                              </div>
                            ))
                          )}
                        </div>
                        <div className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-wider pt-1.5 border-t border-slate-900">
                          COGNITIVE AUTOPILOT ENGINE v1.1
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: AUTONOMOUS BRAIN & AUTO-OPTIMIZER */}
        {/* ======================================= */}
        {activeSubTab === 'autonomous' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Status overview bar */}
            <div className="rounded-2xl p-5 bg-gradient-to-r from-cyan-950/40 to-slate-900/40 border border-cyan-500/20 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Cpu className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h2 className="text-sm font-bold font-mono text-cyan-200 tracking-wider">
                    {lang === 'bn' ? 'স্বায়ত্তশাসিত মস্তিষ্ক এবং অপ্টিমাইজেশন কোর' : 'AUTONOMOUS BRAIN & OPTIMIZATION CORE'}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {lang === 'bn' 
                      ? 'নিওরা ক্রমাগত চ্যাট হিস্ট্রি বিশ্লেষণ এবং অনলাইন রিসার্চের মাধ্যমে নতুন ফিচার ও অটোমেশন তৈরি করছে।' 
                      : 'Neora continuously drafts system enhancements, auto-coding missing features from user signals.'}
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-3 bg-slate-950/60 py-2 px-3.5 rounded-xl border border-slate-800 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {lang === 'bn' ? 'অটোনমাস সাইকেল' : 'Autonomous Cycle'}:
                </span>
                <button
                  onClick={() => setIsLoopActive(!isLoopActive)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isLoopActive ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isLoopActive ? 'translate-x-5.5' : 'translate-x-1'}`} />
                </button>
                <span className={`text-[10px] font-mono font-bold ${isLoopActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
                  {isLoopActive ? 'RUNNING' : 'PAUSED'}
                </span>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Cognitive Engine and Intent Harvester */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Terminal Console */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl flex flex-col h-[320px]">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="text-[10px] font-mono text-slate-400 ml-2">cognitive_core_logs.log</span>
                    </div>
                    <span className="text-[9px] font-mono text-cyan-400 animate-pulse">● LIVE_TICK</span>
                  </div>
                  
                  {/* Log stream box */}
                  <div className="flex-1 p-4 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1.5 min-h-0 select-text scrollbar-thin scrollbar-thumb-slate-850">
                    {cognitiveLogs.map((log, idx) => {
                      let colorClass = "text-slate-300";
                      if (log.includes("🧠") || log.includes("Learned")) colorClass = "text-purple-300";
                      else if (log.includes("💡") || log.includes("Idea")) colorClass = "text-yellow-200";
                      else if (log.includes("✅") || log.includes("success")) colorClass = "text-emerald-400";
                      else if (log.includes("🌐") || log.includes("Researched")) colorClass = "text-indigo-300";
                      else if (log.includes("🚀") || log.includes("Initiating")) colorClass = "text-cyan-400 font-bold";
                      else if (log.includes("🔄")) colorClass = "text-cyan-300/80";

                      return (
                        <div key={idx} className={`leading-relaxed ${colorClass}`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Chat intent harvester */}
                <div className="rounded-2xl p-5 bg-slate-900/40 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                      {lang === 'bn' ? 'ইউজার মেসেজ হার্ভেস্টিং এবং লার্নিং' : 'MESSAGE HARVESTER & INTENT EXTRACTION'}
                    </h3>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 font-mono">
                    {lang === 'bn'
                      ? 'আপনার কাস্টম মেসেজ থেকে অটোমেশন তৈরি করুন বা নিচে যেকোনো দিকনির্দেশনা ইনপুট দিয়ে ডায়নামিক কোড কম্পাইল করুন।'
                      : 'Extract patterns from custom tasks or write instructions directly to train Neora and construct custom modules.'}
                  </p>

                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={harvestInput}
                      onChange={e => setHarvestInput(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমনঃ শুকরিয়া প্রিন্টার্স এর জন্য কাস্টম বাল্ক ডিসকাউন্ট হিসেব করার মডিউল লাগবে...' : 'e.g., keyboard commands map listeners for fast alt keys tab changing'}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl p-3 text-xs text-slate-200 outline-none font-mono placeholder-slate-600"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleHarvestAndLearn()}
                        disabled={harvestLoading || !harvestInput.trim()}
                        className="flex-1 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${harvestLoading ? 'animate-spin' : ''}`} />
                        <span>{harvestLoading ? (lang === 'bn' ? 'বিশ্লেষণ চলছে...' : 'ANALYZING...') : (lang === 'bn' ? 'ডিজাইন ও কোডিং করুন' : 'Learn & Code Module')}</span>
                      </button>

                      {/* Quick presets buttons */}
                      <button
                        onClick={() => handleHarvestAndLearn("Shukria Printers order notification dispatch route shukriaprinters@gmail.com")}
                        className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-mono transition-all cursor-pointer"
                      >
                        ⚡ Email Queue Dispatcher Preset
                      </button>
                      <button
                        onClick={() => handleHarvestAndLearn("keyboard navigation hotkey mapping layout switch tab")}
                        className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-mono transition-all cursor-pointer"
                      >
                        ⚡ Keyboard Hotkey Preset
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Research Matrix & Evolving Action blueprints */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Research Matrix cached lists */}
                <div className="rounded-2xl p-5 bg-slate-900/40 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                        {lang === 'bn' ? 'অটোমেশন নলেজ বেইস' : 'DYNAMIC KNOWLEDGE MATRIX'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">SYNCED</span>
                  </div>

                  {/* Learned skills list */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">{lang === 'bn' ? '🧠 নিষ্কাশিত দক্ষতা' : '🧠 HARVESTED COGNITIVE SKILLS'}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {learnedSkills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[9px] font-mono rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Researched topics */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-850">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">{lang === 'bn' ? '🌐 সংগৃহীত অনলাইন রিসোর্স' : '🌐 RESEARCHED ONLINE REGISTRIES'}</span>
                      <div className="space-y-1">
                        {researchedTopics.map((topic, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                            <span className="text-emerald-500">✔</span>
                            <span className="truncate">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Auto-designed action plans & Injector */}
                <div className="rounded-2xl p-5 bg-slate-900/40 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                        {lang === 'bn' ? 'স্বয়ংক্রিয় ফিচার ব্লুপ্রিন্ট' : 'SYNTHESIZED FEATURE BLUEPRINTS'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{autoPlans.length} PLANNED</span>
                  </div>

                  {/* Blueprint item list */}
                  <div className="space-y-3.5 overflow-y-auto max-h-[380px] pr-1">
                    {autoPlans.map((plan, i) => {
                      const isUnlocked = unlockedFeatures.includes(plan.id);
                      const isInjectingThis = injectingPlanId === plan.id;

                      return (
                        <div key={plan.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5 relative overflow-hidden">
                          
                          {/* Top indicator row */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[8px] rounded uppercase">
                              {plan.category}
                            </span>
                            
                            {/* Status label */}
                            <span className={`font-mono text-[9px] font-bold ${
                              isUnlocked ? 'text-emerald-400' :
                              isInjectingThis ? 'text-cyan-400 animate-pulse' :
                              plan.status === 'drafting' ? 'text-yellow-400 animate-pulse' :
                              plan.status === 'injecting' ? 'text-orange-400 animate-pulse' : 'text-slate-500'
                            }`}>
                              {isUnlocked ? '● ACTIVE & COMPILED' :
                               isInjectingThis ? `● COMPILING (${injectProgress}%)` :
                               plan.status === 'drafting' ? '● DRAFTING SOURCE' :
                               plan.status === 'injecting' ? '● VERIFYING IMPORTS' : '● QUEUED PLAN'
                              }
                            </span>
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-bold font-mono text-slate-200">{lang === 'bn' ? plan.bnName : plan.name}</h4>
                            <p className="text-[9px] text-slate-400 leading-normal">{lang === 'bn' ? plan.bnDescription : plan.description}</p>
                          </div>

                          {/* Code Preview code block */}
                          <div className="bg-slate-950 text-[9px] font-mono p-2 rounded border border-slate-900 text-slate-400 overflow-x-auto max-h-16">
                            <pre>{plan.codePreview}</pre>
                          </div>

                          {/* Action Button */}
                          <div className="pt-1">
                            {isUnlocked ? (
                              <div className="w-full text-center py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold font-mono flex items-center justify-center gap-1">
                                <span>✔ {lang === 'bn' ? 'সফলভাবে নিওরা সিস্টেমে যুক্ত হয়েছে' : 'Successfully Injected & Active'}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleInjectPlan(plan)}
                                disabled={!!injectingPlanId}
                                className={`w-full py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  injectingPlanId 
                                    ? 'bg-slate-900/40 border border-slate-900 text-slate-600 cursor-not-allowed'
                                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300'
                                }`}
                              >
                                {isInjectingThis ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span>{lang === 'bn' ? 'সোর্স কোড কম্পাইল হচ্ছে...' : 'COMPILING BLUEPRINT...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>{lang === 'bn' ? 'কম্পাইল এবং নিওরায় ইঞ্জেক্ট করুন' : 'Approve & Compile to Neora'}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Injecting ProgressBar overlay */}
                          {isInjectingThis && (
                            <div className="absolute bottom-0 left-0 h-1 bg-cyan-400 transition-all duration-100" style={{ width: `${injectProgress}%` }} />
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* --- STATS PANEL BAR FOOTER --- */}
      <div className="shrink-0 pt-3 border-t border-cyan-500/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono text-slate-500 mt-4 bg-slate-950/20 rounded-xl p-2.5">
        <div>
          <span>SYSTEM STATE: </span>
          <span className="text-cyan-400 font-bold">EVOLVING</span>
        </div>
        <div>
          <span>AUDIO ENGINE: </span>
          <span className={isAudioOn ? "text-emerald-400 font-bold" : "text-slate-600"}>{isAudioOn ? "ACTIVE HUM" : "MUTED"}</span>
        </div>
        <div>
          <span>UNLOCKED NODES: </span>
          <span className="text-emerald-400 font-bold">{unlockedFeatures.length} / {autoPlans.length}</span>
        </div>
        <div className="text-right">
          <span>COMPILER MATCH: </span>
          <span className="text-cyan-400 font-bold">100% OK</span>
        </div>
      </div>

    </div>
  );
}
