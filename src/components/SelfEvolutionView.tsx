import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Zap, Play, CheckCircle, RefreshCw, Layers, Terminal,
  HelpCircle, Eye, ChevronRight, FileCode, Sliders, AlertTriangle,
  Sparkles, Globe, Clipboard, Printer, DollarSign, Download, Plus, Trash,
  Volume2, Activity, Search
} from 'lucide-react';
import { aiSkillsList, AISkill } from './skillsData';

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
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'analysis' | 'protocol' | 'evolved' | 'autonomous' | 'explorer'>('autonomous');
  
  // --- NEORA 100X SELF-USE AUTOPILOT STATES ---
  const [isSelfUsingRun, setIsSelfUsingRun] = useState(false);
  const [selfUseCompletedCount, setSelfUseCompletedCount] = useState(0);
  const [currentSelfUseTask, setCurrentSelfUseTask] = useState<string>('');
  const [currentSelfUseTaskBn, setCurrentSelfUseTaskBn] = useState<string>('');
  const [selfUseTargetTab, setSelfUseTargetTab] = useState<string>('evolution');
  const [selfUseCursor, setSelfUseCursor] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [selfUseLogs, setSelfUseLogs] = useState<string[]>([
    "🤖 Neora 100x Self-Use System Core standing by.",
    "💡 Ready to autonomously test and run all tabs, pages, buttons, and API fetch services."
  ]);
  const [selfUseActivePanel, setSelfUseActivePanel] = useState<string>('Core Engine');
  const [autopilotSpeedMs, setAutopilotSpeedMs] = useState<number>(3000); // interval duration
  const [autopilotMode, setAutopilotMode] = useState<'standard' | 'hyper' | 'bangla_core' | 'debugger'>('standard');
  const [simulatedHeals, setSimulatedHeals] = useState<number>(3);
  const [telemetryCpu, setTelemetryCpu] = useState<number>(24);
  const [telemetryRam, setTelemetryRam] = useState<number>(382);
  const [currentDiff, setCurrentDiff] = useState<{
    file: string;
    line: number;
    oldCode: string;
    newCode: string;
    status: 'idle' | 'scanning' | 'found' | 'fixing' | 'healed';
  }>({
    file: 'src/components/SelfEvolutionView.tsx',
    line: 1422,
    oldCode: 'const isAudioOn = localStorage.getItem(\'neora_ambient_playing\') === \'true\';',
    newCode: 'const isAudioOn = typeof window !== \'undefined\' ? localStorage.getItem(\'neora_ambient_playing\') === \'true\' : false;',
    status: 'idle'
  });
  
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

  // --- NEW INTEGRATED JARVIS CAPABILITIES STATES ---
  const [interpreterCmd, setInterpreterCmd] = useState('');
  const [interpreterLogs, setInterpreterLogs] = useState<Array<{ text: string; type: 'input' | 'output' | 'success' | 'error' | 'status' }>>([
    { text: "⚡ Neora J.A.R.V.I.S. Autonomous Compiler Engine v2.5 online.", type: 'status' },
    { text: "🤖 Mode: Claude Code + Open Interpreter hybrid loop active.", type: 'status' },
    { text: "💡 Type any command (e.g. 'build app', 'fix bugs', 'run tests', 'install packages') to execute.", type: 'output' }
  ]);
  const [isInterpreterRunning, setIsInterpreterRunning] = useState(false);

  const [designType, setDesignType] = useState<'visiting_card' | 'pvc_banner' | 'logo' | 'thumbnail' | 'leaflet' | 'calendar'>('visiting_card');
  const [designPrompt, setDesignPrompt] = useState('');
  const [designFormat, setDesignFormat] = useState<'PSD' | 'EPS' | 'AI' | 'PNG'>('PSD');
  const [isDesigning, setIsDesigning] = useState(false);
  const [designProgress, setDesignProgress] = useState(0);
  const [designLogs, setDesignLogs] = useState<string[]>([]);
  const [designResult, setDesignResult] = useState<any | null>(null);

  const [n8nWorkflowTrigger, setN8nWorkflowTrigger] = useState<'webhook' | 'cron' | 'telegram' | 'invoice_created'>('invoice_created');
  const [isN8nRunning, setIsN8nRunning] = useState(false);
  const [n8nLogs, setN8nLogs] = useState<string[]>([]);
  const [isWorkflowActive, setIsWorkflowActive] = useState(true);

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

  // --- SKILL EXPLORER AND DISCOVERY STATES ---
  const [skills, setSkills] = useState<AISkill[]>(() => {
    const saved = localStorage.getItem("neora_ai_skills");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return aiSkillsList;
  });
  const [skillsSearch, setSkillsSearch] = useState<string>("");
  const [skillsCategoryFilter, setSkillsCategoryFilter] = useState<string>("ALL");
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveryRequirement, setDiscoveryRequirement] = useState<string>("");
  const [discoveryLogs, setDiscoveryLogs] = useState<string[]>([]);
  const [discoveryProgress, setDiscoveryProgress] = useState<number>(0);

  // --- CUSTOM SKILL CREATION STATES ---
  const [customSkillName, setCustomSkillName] = useState("");
  const [customSkillCategory, setCustomSkillCategory] = useState("Frontend Core");
  const [customSkillComplexity, setCustomSkillComplexity] = useState<"Beginner" | "Intermediate" | "Expert">("Intermediate");
  const [customSkillDesc, setCustomSkillDesc] = useState("");
  const [customSkillPrompt, setCustomSkillPrompt] = useState("");
  const [customSkillIsCompiling, setCustomSkillIsCompiling] = useState(false);

  // --- NEORA AUTONOMOUS UPGRADE STATES ---
  const [neoraAutoUpgradeActive, setNeoraAutoUpgradeActive] = useState(() => {
    return localStorage.getItem("neora_auto_upgrade_enabled") !== "false";
  });
  const [isAutoUpgrading, setIsAutoUpgrading] = useState(false);
  const [autoUpgradeLogs, setAutoUpgradeLogs] = useState<string[]>([]);
  const [autoUpgradeProgress, setAutoUpgradeProgress] = useState(0);

  // --- SKILL UPDATE HISTORY STATE ---
  interface SkillHistoryItem {
    id: string;
    skillName: string;
    type: 'user_created' | 'github_discovered' | 'neora_auto_upgraded';
    action: 'compiled' | 'installed' | 'upgraded';
    timestamp: string;
  }
  const [skillHistory, setSkillHistory] = useState<SkillHistoryItem[]>(() => {
    const saved = localStorage.getItem("neora_skill_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: "h1", skillName: "Bengali Translation Engine", type: 'neora_auto_upgraded', action: 'installed', timestamp: "12:15 PM" },
      { id: "h2", skillName: "Smart Bulk Order Calculator (Shukria Custom)", type: 'user_created', action: 'compiled', timestamp: "11:42 AM" },
      { id: "h3", skillName: "Self-Healing Diagnostic Agent", type: 'neora_auto_upgraded', action: 'upgraded', timestamp: "09:30 AM" }
    ];
  });

  // Keep auto-upgrade setting in localStorage
  useEffect(() => {
    localStorage.setItem("neora_auto_upgrade_enabled", String(neoraAutoUpgradeActive));
  }, [neoraAutoUpgradeActive]);

  // Keep skill history in localStorage
  useEffect(() => {
    localStorage.setItem("neora_skill_history", JSON.stringify(skillHistory));
  }, [skillHistory]);

  useEffect(() => {
    const handleSkillsUpdated = () => {
      const saved = localStorage.getItem("neora_ai_skills");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setSkills(parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener("neora-skills-updated", handleSkillsUpdated);
    return () => window.removeEventListener("neora-skills-updated", handleSkillsUpdated);
  }, []);

  const triggerDiscoverAndInstall = () => {
    if (!discoveryRequirement.trim()) return;
    setIsDiscovering(true);
    setDiscoveryProgress(0);
    setDiscoveryLogs([
      `📡 Connecting to GitHub skills registry API...`,
      `🔍 Querying repositories matching requirement: "${discoveryRequirement}"`
    ]);

    const logs = [
      `📡 Connecting to GitHub skills registry API...`,
      `🔍 Querying repositories matching requirement: "${discoveryRequirement}"`,
      `⚡ Found matching dynamic module: "neora-github-skill-${Math.floor(Math.random() * 9000 + 1000)}"`,
      `📦 Fetching source bundle from GitHub repository...`,
      `⚡ Allocating local sandbox memory buffer...`,
      `🛠️ Initiating core compiler & lint-checker (Neora Engine v2.4)...`,
      `🧬 Injecting dynamic methods into active system backplane...`,
      `✅ Success! Compiled skill verified and saved to Neora's neural database.`
    ];

    let currentStep = 1;
    const interval = setInterval(() => {
      if (currentStep < logs.length) {
        setDiscoveryLogs(prev => [...prev, logs[currentStep]]);
        setDiscoveryProgress(Math.floor((currentStep / (logs.length - 1)) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Add the new skill to the registry!
        const skillId = `sk_git_${Date.now()}`;
        const newSkill: AISkill = {
          id: skillId,
          name: discoveryRequirement.trim().charAt(0).toUpperCase() + discoveryRequirement.trim().slice(1),
          category: "GitHub Discovered",
          description: `Custom autonomous skill compiled from GitHub to satisfy: "${discoveryRequirement.trim()}".`,
          systemPrompt: `You are equipped with a specialized skill designed to: "${discoveryRequirement.trim()}". Use appropriate tools to satisfy this role.`,
          enabled: true,
          installed: true,
          complexity: "Expert",
          latencyMs: Math.floor(Math.random() * 15 + 10)
        };

        const updated = [newSkill, ...skills];
        localStorage.setItem("neora_ai_skills", JSON.stringify(updated));
        setSkills(updated);
        setDiscoveryRequirement("");
        setIsDiscovering(false);

        // Dispatch updated event
        window.dispatchEvent(new CustomEvent("neora-skills-updated", { detail: { skill: newSkill } }));
      }
    }, 1000);
  };

  const handleCreateCustomSkill = () => {
    if (!customSkillName.trim() || !customSkillDesc.trim()) return;
    setCustomSkillIsCompiling(true);

    setTimeout(() => {
      const skillId = `sk_custom_${Date.now()}`;
      const newSkill: AISkill = {
        id: skillId,
        name: customSkillName.trim(),
        category: customSkillCategory,
        description: customSkillDesc.trim(),
        systemPrompt: customSkillPrompt.trim() || `Act as a specialized ${customSkillName.trim()} model. Optimize core logic parameters.`,
        enabled: true,
        installed: true,
        complexity: customSkillComplexity,
        latencyMs: Math.floor(Math.random() * 12 + 8)
      };

      const updatedSkills = [newSkill, ...skills];
      localStorage.setItem("neora_ai_skills", JSON.stringify(updatedSkills));
      setSkills(updatedSkills);

      // Add to history
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newHistoryItem: SkillHistoryItem = {
        id: `h_custom_${Date.now()}`,
        skillName: newSkill.name,
        type: 'user_created',
        action: 'compiled',
        timestamp: timeStr
      };
      setSkillHistory(prev => [newHistoryItem, ...prev]);

      // Reset fields
      setCustomSkillName("");
      setCustomSkillDesc("");
      setCustomSkillPrompt("");
      setCustomSkillIsCompiling(false);

      // Trigger standard event for Notifications
      window.dispatchEvent(new CustomEvent("neora-skills-updated", { detail: { skill: newSkill, isAuto: false } }));
    }, 1500);
  };

  const runNeoraAutoUpgrade = () => {
    if (isAutoUpgrading) return;
    setIsAutoUpgrading(true);
    setAutoUpgradeProgress(0);
    setAutoUpgradeLogs([
      lang === 'bn' 
        ? "🤖 [নিওরা অটোনমাস ব্রেইন] ওয়ার্কস্পেস কোড ডেনসিটি স্ক্যান করা হচ্ছে..." 
        : "🤖 [Neora Autonomous Brain] Scanning workspace code density...",
      lang === 'bn'
        ? "🔍 [ডায়াগনস্টিকস] সম্ভাব্য গ্যাপ খোঁজার জন্য package.json ও ইম্পোর্ট পাথ চেক করা হচ্ছে..."
        : "🔍 [Diagnostics] Checking package.json and import paths for potential gaps...",
    ]);

    const upgradeSteps = lang === 'bn' ? [
      "🤖 [নিওরা অটোনমাস ব্রেইন] ওয়ার্কস্পেস কোড ডেনসিটি স্ক্যান করা হচ্ছে...",
      "🔍 [ডায়াগনস্টিকস] সম্ভাব্য গ্যাপ খোঁজার জন্য package.json ও ইম্পোর্ট পাথ চেক করা হচ্ছে...",
      "⚡ [গ্যাপ সনাক্ত] শুকরিয়া প্রিন্টার্স এর ভলিউম ডিসকাউন্ট ও ভ্যাট ক্যালকুলেশনে আরও নিখুঁত ব্যাকগ্রাউন্ড প্রোটোকল প্রয়োজন।",
      "🌐 [সার্চিং] গিটহাব এপিআই-তে 'shukria-vat-calculator' ও অনুরূপ লাইব্রেরি অনুসন্ধান করা হচ্ছে...",
      "🛠️ [কম্পাইলিং] স্যান্ডবক্স মেমোরিতে নতুন অটোমেটেড ম্যাথমেটিক্যাল ক্যালকুলেশন স্ক্রিপ্ট লেখা হচ্ছে...",
      "🧬 [সেলফ-ইভোলিউশন] নিওরা কোর ব্যাকপ্লেনে 'Autonomous VAT Shield' স্কিল যুক্ত করা হচ্ছে...",
      "✅ [অটো-আপগ্রেড সফল] নতুন ১টি স্বয়ংক্রিয় মডিউল কোর মেমোরিতে সাফল্যের সাথে কম্পাইল ও সক্রিয় হয়েছে!"
    ] : [
      "🤖 [Neora Autonomous Brain] Scanning workspace code density...",
      "🔍 [Diagnostics] Checking package.json and import paths for potential gaps...",
      "⚡ [Gap Detected] Shukria Printers requires optimized volume discount and VAT calculation safeguards.",
      "🌐 [Crawling] Querying GitHub API for 'shukria-vat-calculator' and similar packages...",
      "🛠️ [Compiling] Writing localized mathematical calculation methods in safe sandboxed memory...",
      "🧬 [Self-Evolving] Injecting 'Autonomous VAT Shield' into Neora's core backplane memory...",
      "✅ [Auto-Upgrade Success] Successfully compiled 1 new autonomous micro-skill."
    ];

    let step = 1;
    const interval = setInterval(() => {
      if (step < upgradeSteps.length) {
        setAutoUpgradeLogs(prev => [...prev, upgradeSteps[step]]);
        setAutoUpgradeProgress(Math.floor((step / (upgradeSteps.length - 1)) * 100));
        step++;
      } else {
        clearInterval(interval);

        // Install a real auto-upgraded skill!
        const skillId = `sk_auto_${Date.now()}`;
        const autoSkills = [
          {
            name: lang === 'bn' ? "স্বয়ংক্রিয় ভ্যাট ও ক্যালকুলেশন শিল্ড" : "Autonomous VAT & Calculation Shield",
            desc: lang === 'bn' 
              ? "শুকরিয়া প্রিন্টার্সের সকল হিসাব ও ১৫% বাংলাদেশ ভ্যাট স্ট্যান্ডার্ড স্বয়ংক্রিয়ভাবে নির্ভুল রাখে ও অডিট করে।"
              : "Monitors calculation states and validates VAT calculations (15% Bangladesh standard) dynamically.",
            prompt: "Enforce strict Bangladesh VAT parsing rules on invoice metadata. Flag any calculation mismatch."
          },
          {
            name: lang === 'bn' ? "প্রো-অ্যাক্টিভ মেমোরি ওয়াচার সেন্ট্রি" : "Proactive Memory Watcher Sentry",
            desc: lang === 'bn'
              ? "কোর মেমোরি এবং ভ্যারিয়েবল ট্রানজিশন ট্র্যাক করে ডেটা হারানো প্রতিরোধ করে।"
              : "Tracks state modifications inside Neora's memory tree and runs auto-backup diagnostics.",
            prompt: "Listen to workspace variable states, running incremental validations and backing up local state."
          },
          {
            name: lang === 'bn' ? "নিউরাল ডায়ালগ টোন স্ট্যাবিলাইজার" : "Neural Dialogue Tone Stabilizer",
            desc: lang === 'bn'
              ? "ব্যবহারকারীর বার্তার ভাব বিশ্লেষণ করে নিওরার কথার টোন স্বয়ংক্রিয়ভাবে মানিয়ে নেয়।"
              : "Adapts conversational response tone to match user's sentiment markers (frustrated vs pleased).",
            prompt: "Modulate conversational output tone, injecting highly supportive and empathetic micro-sentences when strain is detected."
          }
        ];

        // Pick one randomly
        const chosen = autoSkills[Math.floor(Math.random() * autoSkills.length)];
        
        const newSkill: AISkill = {
          id: skillId,
          name: chosen.name,
          category: "Self-Evolution",
          description: chosen.desc,
          systemPrompt: chosen.prompt,
          enabled: true,
          installed: true,
          complexity: "Expert",
          latencyMs: Math.floor(Math.random() * 10 + 12)
        };

        const updatedSkills = [newSkill, ...skills];
        localStorage.setItem("neora_ai_skills", JSON.stringify(updatedSkills));
        setSkills(updatedSkills);

        // Add to history
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newHistoryItem: SkillHistoryItem = {
          id: `h_auto_${Date.now()}`,
          skillName: newSkill.name,
          type: 'neora_auto_upgraded',
          action: 'installed',
          timestamp: timeStr
        };
        setSkillHistory(prev => [newHistoryItem, ...prev]);

        setIsAutoUpgrading(false);

        // Trigger event
        window.dispatchEvent(new CustomEvent("neora-skills-updated", { detail: { skill: newSkill, isAuto: true } }));
      }
    }, 800);
  };

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
    },
    {
      id: "claude_interpreter_bridge",
      name: "J.A.R.V.I.S. Developer Core: Claude Code & Open Interpreter Console",
      bnName: "জারভিস ডেভ কোর: ক্লড কোড ও ওপেন ইন্টারপ্রিটার কনসোল",
      status: 'planned',
      category: "Developer Core",
      bnCategory: "ডেভলপার কোর",
      description: "Embeds a sandboxed terminal interface with real-time compilation listeners, file writing helpers, and auto-fix triggers.",
      bnDescription: "কম্পাইল লিসেনার ও অটো-ফিক্স মেকানিজম সমৃদ্ধ একটি স্যান্ডবক্সড টার্মিনাল কোড এডিটর সংযুক্ত করে।",
      codePreview: "async function executeAutopilotCommand(cmd) {\n  const res = await runCommand(cmd);\n  if (res.code !== 0) await healWorkspace(res.stderr);\n}"
    },
    {
      id: "adobe_design_pipeline",
      name: "J.A.R.V.I.S. Creative: Adobe Illustrator & Photoshop Vector Canvas",
      bnName: "জারভিস ক্রিয়েটিভ: ফটোশপ ও ইলাস্ট্রেটর ভেক্টর ক্যানভাস",
      status: 'planned',
      category: "Creative Automation",
      bnCategory: "ক্রিয়েটিভ অটোমেশন",
      description: "Autonomous graphic layout pipeline mapping layers, bleed marks, crop guidelines, and CMYK color codes directly into editable PSD & EPS files.",
      bnDescription: "ক্রপ মার্কস, ব্লিড গাইড এবং সিএমওয়াইকে কোড সরাসরি রিড-রাইট করে এডিটেবল পিএসডি ও ইপিএস ফাইল তৈরি করতে পারে এমন একটি লেআউট পাইপলাইন।",
      codePreview: "export function compileVectorCanvas(type, size) {\n  return { canvasId: 'PSD-' + Date.now(), bleed: 0.125, colors: 'CMYK' };\n}"
    },
    {
      id: "ollama_n8n_agents",
      name: "J.A.R.V.I.S. Flow: Local Ollama & n8n Automation Node Network",
      bnName: "জারভিস ফ্লো: লোকাল অলামা ও n8n অটোমেশন নোড নেটওয়ার্ক",
      status: 'planned',
      category: "Multi-Agent Automation",
      bnCategory: "মাল্টি-এজেন্ট অটোমেশন",
      description: "Powers smart cron tasks, local DeepSeek-R1 background thinking nodes, WhatsApp webhook triggers, and automated SMTP relays.",
      bnDescription: "লোকাল ডিপসিক-আর১ ব্রেইন, হোয়াটসঅ্যাপ এপিআই ওয়েবহুক ট্রিগার এবং অটোমেটেড এসএমটিপি রেলের সমন্বয়ে এন-টু-এন ইন্টেলিজেন্ট ওয়ার্কফ্লো।",
      codePreview: "async function executeWorkflowNode(trigger) {\n  const context = await fetchRAGStorage(trigger);\n  return await dispatchOllamaReasoning(context);\n}"
    }
  ]);

  // Background Autonomous Loop Simulation
  const autoUpgradeActiveRef = useRef(neoraAutoUpgradeActive);
  const isAutoUpgradingRef = useRef(isAutoUpgrading);

  useEffect(() => {
    autoUpgradeActiveRef.current = neoraAutoUpgradeActive;
  }, [neoraAutoUpgradeActive]);

  useEffect(() => {
    isAutoUpgradingRef.current = isAutoUpgrading;
  }, [isAutoUpgrading]);

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

        // Trigger autonomous skill auto-upgrades based on Neora's assessment
        if (autoUpgradeActiveRef.current && !isAutoUpgradingRef.current && Math.random() < 0.08) {
          setTimeout(() => {
            runNeoraAutoUpgrade();
          }, 500);
        }

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

  // --- NEORA 100X SELF-USE AUTOPILOT CORE METHODS ---
  const playSelfUseChirp = (frequency = 800, type: 'sine' | 'square' | 'triangle' = 'sine', duration = 0.08) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Fail silently if audio context is blocked by user interactions
    }
  };

  const executeRandomSelfUseStep = () => {
    // 1. Dynamic telemetry metrics updates
    let cpuBase = 20, ramBase = 350;
    if (autopilotMode === 'hyper') {
      cpuBase = 65 + Math.floor(Math.random() * 25);
      ramBase = 850 + Math.floor(Math.random() * 450);
    } else if (autopilotMode === 'debugger') {
      cpuBase = 35 + Math.floor(Math.random() * 20);
      ramBase = 520 + Math.floor(Math.random() * 250);
    } else if (autopilotMode === 'bangla_core') {
      cpuBase = 15 + Math.floor(Math.random() * 15);
      ramBase = 310 + Math.floor(Math.random() * 80);
    } else {
      cpuBase = 18 + Math.floor(Math.random() * 12);
      ramBase = 360 + Math.floor(Math.random() * 60);
    }
    setTelemetryCpu(cpuBase);
    setTelemetryRam(ramBase);

    // 2. Debugger simulation mode side effect
    if (autopilotMode === 'debugger' && Math.random() < 0.4) {
      const debugFiles = [
        {
          file: 'server.ts',
          line: 236,
          oldCode: 'const target = req.query.path;\nconst data = fs.readFileSync(target);',
          newCode: 'const target = req.query.path;\nif (isPathOutsideSandbox(target)) throw new Error("Sandbox Breach");\nconst data = fs.readFileSync(target);',
          msgEn: 'Injecting secure sandbox path validations to file system APIs.',
          msgBn: 'ফাইল সিস্টেম এপিআই-তে সিকিউর স্যান্ডবক্স পাথ ভ্যালিডেশন কোড ইনজেক্ট করা হচ্ছে।'
        },
        {
          file: 'src/components/SelfEvolutionView.tsx',
          line: 1422,
          oldCode: 'const isAudioOn = localStorage.getItem(\'neora_playing\') === \'true\';',
          newCode: 'const isAudioOn = typeof window !== \'undefined\' ? localStorage.getItem(\'neora_playing\') === \'true\' : false;',
          msgEn: 'Healed potential window reference error on server-side render loops.',
          msgBn: 'সার্ভার সাইড রেন্ডার লুপে সম্ভাব্য উইন্ডো রেফারেন্স এরর দূর করা হয়েছে।'
        },
        {
          file: 'src/lib/neoraApi.ts',
          line: 324,
          oldCode: 'const errorCode = res?.status_code;',
          newCode: 'const errorCode = res?.error?.code || res?.status_code || res?.statusCode || 500;',
          msgEn: 'Robust error status-code fallbacks configured for local Ollama server disconnects.',
          msgBn: 'লোকাল ওল্লামা সার্ভার সংযোগ বিচ্ছিন্নতার জন্য রোবাস্ট এরর স্ট্যাটাস-কোড কনফিগার করা হয়েছে।'
        }
      ];
      
      const chosen = debugFiles[Math.floor(Math.random() * debugFiles.length)];
      setCurrentDiff({
        file: chosen.file,
        line: chosen.line,
        oldCode: chosen.oldCode,
        newCode: chosen.newCode,
        status: 'found'
      });
      playSelfUseChirp(900, 'square', 0.12);
      setSimulatedHeals(prev => prev + 1);

      // Transition to 'fixing' and then 'healed'
      setTimeout(() => {
        setCurrentDiff(prev => ({ ...prev, status: 'fixing' }));
        setTimeout(() => {
          setCurrentDiff(prev => ({ ...prev, status: 'healed' }));
          setSelfUseLogs(prev => [
            `[${new Date().toLocaleTimeString()}] 🛠️ [Debugger Core] Auto-healed bug in ${chosen.file}:${chosen.line} successfully!`,
            ...prev
          ]);
        }, 1200);
      }, 800);
    }

    // List of highly interactive and modular UI "self-use" tasks mapping every system element
    const actions = [
      {
        id: 'switch_invoice',
        panel: 'Printing Calculation Hub',
        taskEn: "Navigating to 'invoice' tab to verify high-gloss banner pricing margins",
        taskBn: "প্রিন্টিং ইনভয়েস মডিউলের প্রফিট মার্জিন পরীক্ষা করতে 'invoice' ট্যাবে স্যুইচ করা হচ্ছে",
        cursor: { x: 80, y: 15 },
        run: () => {
          window.dispatchEvent(new CustomEvent("neora-navigation", { detail: { tab: 'invoice' } }));
          setSelfUseTargetTab('invoice');
          // Update billing fields to show Neora is typing
          setInvoiceClient('Shukria Printers Automated Tester');
          setInvoicePhone('+880-1711-AUTOBOT');
          setInvoiceItem('High-Gloss PVC Banner Core Print');
          setInvoiceQty(Math.floor(500 + Math.random() * 2000));
          setInvoicePrice(1.85);
          setInvoiceDiscount(12);
        }
      },
      {
        id: 'switch_dev',
        panel: 'Developer Studio',
        taskEn: "Switching to 'dev' (Developer Studio) to monitor dynamic HTML code compiles",
        taskBn: "ডায়নামিক এইচটিএমএল কোড কম্পাইল পর্যবেক্ষণ করতে 'dev' ট্যাবে স্যুইচ করা হচ্ছে",
        cursor: { x: 75, y: 35 },
        run: () => {
          window.dispatchEvent(new CustomEvent("neora-navigation", { detail: { tab: 'dev' } }));
          setSelfUseTargetTab('dev');
        }
      },
      {
        id: 'switch_roadmap',
        panel: 'Roadmap Monitor',
        taskEn: "Accessing 'roadmap' to audit Neora self-healing active milestones",
        taskBn: "সেলফ-হিলিং মাইলস্টোন অডিট করতে 'roadmap' ট্যাবে প্রবেশ করা হচ্ছে",
        cursor: { x: 90, y: 45 },
        run: () => {
          window.dispatchEvent(new CustomEvent("neora-navigation", { detail: { tab: 'roadmap' } }));
          setSelfUseTargetTab('roadmap');
        }
      },
      {
        id: 'switch_chat',
        panel: 'Agent Dialog Deck',
        taskEn: "Scanning 'chat' dashboard input for raw user prompt patterns",
        taskBn: "ইউজার প্রম্পট প্যাটার্ন বিশ্লেষণ করতে 'chat' ট্যাবে স্যুইচ করা হচ্ছে",
        cursor: { x: 25, y: 55 },
        run: () => {
          window.dispatchEvent(new CustomEvent("neora-navigation", { detail: { tab: 'chat' } }));
          setSelfUseTargetTab('chat');
        }
      },
      {
        id: 'switch_evolution',
        panel: 'Self Evolution Core',
        taskEn: "Returning focus to 'evolution' to execute main optimization routines",
        taskBn: "মূল অপ্টিমাইজেশন পরিচালনা করতে 'evolution' ট্যাবে ফিরে আসা হচ্ছে",
        cursor: { x: 10, y: 15 },
        run: () => {
          window.dispatchEvent(new CustomEvent("neora-navigation", { detail: { tab: 'evolution' } }));
          setSelfUseTargetTab('evolution');
        }
      },
      {
        id: 'recalibrate_reactor',
        panel: 'System Diagnostics',
        taskEn: "Calibrating diagnostics: Re-aligning coolant temp to 38.5°C and boosting power to 99.4%",
        taskBn: "ডায়াগনস্টিকস রিক্যালিব্রেশন: রিঅ্যাক্টর তাপমাত্রা ৩৮.৫° সে. এ নামানো হচ্ছে এবং পাওয়ার ৯৯.৪% এ উন্নীত করা হচ্ছে",
        cursor: { x: 45, y: 40 },
        run: () => {
          setDiagnosticsCoolantTemp(38 + Math.floor(Math.random() * 3));
          setDiagnosticsShieldLevel(95 + Math.floor(Math.random() * 5));
          setDiagnosticsReactorOutput(98 + Math.floor(Math.random() * 2));
          setDiagnosticsCalibrationLog(prev => [
            `[SYS ${new Date().toLocaleTimeString()}] Dynamic calibration triggered by Autopilot.`,
            `[SYS ${new Date().toLocaleTimeString()}] Diagnostics levels successfully stabilized.`,
            ...prev.slice(0, 5)
          ]);
        }
      },
      {
        id: 'run_interpreter_dry',
        panel: 'Sandbox Terminal',
        taskEn: "Injecting simulated shell command to Open Interpreter console: 'verify folder-tree'",
        taskBn: "স্যান্ডবক্স টার্মিনালে টেস্ট কমান্ড পাঠানো হচ্ছে: 'verify folder-tree'",
        cursor: { x: 20, y: 80 },
        run: () => {
          const timestamp = new Date().toLocaleTimeString();
          setInterpreterLogs(prev => [
            ...prev,
            { text: `$ neora-autobots --verify-all-files`, type: 'input' },
            { text: `[${timestamp}] 🤖 Starting self-scan of /src/components directory...`, type: 'status' },
            { text: `-> Verified 32 UI files (SelfEvolutionView.tsx, EarningView.tsx, ChatView.tsx etc.)`, type: 'output' },
            { text: `✔ All local files matching constraints. Linter: 100% compliant.`, type: 'success' }
          ]);
        }
      },
      {
        id: 'design_graphics_banner',
        panel: 'PSD Canvas Pipeline',
        taskEn: "Configuring vector canvas layout (Type: PVC Banner, format: PSD, prompt: Cosmic Space runner)",
        taskBn: "ভেক্টর ক্যানভাস লেআউট কনফিগার করা হচ্ছে (টাইপ: পিভিসি ব্যানার, ফরম্যাট: PSD, প্রম্পট: কসমিক স্পেস রানার)",
        cursor: { x: 80, y: 55 },
        run: () => {
          setDesignType('pvc_banner');
          setDesignPrompt('Cosmic Runner Space Galactic Edition with high-contrast neon accents');
          setDesignFormat('PSD');
          setDesignProgress(100);
          setDesignResult({
            title: "NEORA COSMIC GALAXY BANNER (AUTOPILOT DESIGN)",
            subtitle: "300 DPI High-Gloss PVC Print Ready Format",
            format: "PSD",
            prompt: "Cosmic Runner Space Galactic Edition with high-contrast neon accents",
            details: [
              "Layer 1: Background Nebulous Space Dust Dust with Backdrop-Filter",
              "Layer 2: Neon Orange Vector Coordinates & Bleed Lines",
              "Layer 3: Shukria High-Gloss Finish Calibration Core CMYK",
              "Status: Compiled Successfully by J.A.R.V.I.S. Adobe Pipeline"
            ]
          });
        }
      },
      {
        id: 'n8n_test_webhook',
        panel: 'n8n Automation Node',
        taskEn: "Triggering local n8n automation node webhook with telemetry package payload",
        taskBn: "টেলিমিত্রি প্যাকেজ সহ লোকাল n8n অটোমেশন নোড ওয়েবহুক ট্রিগার করা হচ্ছে",
        cursor: { x: 50, y: 70 },
        run: () => {
          setN8nWorkflowTrigger('webhook');
          setIsN8nRunning(true);
          setN8nLogs(prev => [
            `[${new Date().toLocaleTimeString()}] 📡 Webhook trigger signal received.`,
            `[${new Date().toLocaleTimeString()}] 🚀 Initiating node: Ollama DeepSeek Reasoning.`,
            `[${new Date().toLocaleTimeString()}] Node output dispatched to shukriaprinters@gmail.com successfully!`,
            ...prev.slice(0, 5)
          ]);
          setTimeout(() => {
            setIsN8nRunning(false);
          }, 1500);
        }
      },
      {
        id: 'calculate_bulk_discount',
        panel: 'Printing Calculation Hub',
        taskEn: "Calculating volume discount curve for 10,000 units of Shukria calendar designs",
        taskBn: "শুকরিয়া ক্যালেন্ডার ডিজাইনের ১০০০০ কপির জন্য ভলিউম ডিসকাউন্ট কার্ভ গণনা করা হচ্ছে",
        cursor: { x: 60, y: 65 },
        run: () => {
          const qty = 10000;
          const price = 1.10;
          const discount = 15;
          const subtotal = qty * price;
          const discountAmt = (subtotal * discount) / 100;
          const taxable = subtotal - discountAmt;
          const vat = taxable * 0.15;
          const total = taxable + vat;
          const automatedInv = {
            id: "INV-" + Math.floor(100000 + Math.random() * 900000),
            client: lang === 'bn' ? "শুকরিয়া কাস্টমার অটোপাইলট" : "Shukria Autopilot Custom",
            phone: "+880-1711-AUTOPILOT",
            item: lang === 'bn' ? "কাস্টম ক্যালেন্ডার প্রিন্টিং" : "Custom Calendar Printing (Auto)",
            qty,
            price,
            discount,
            subtotal,
            discountAmt,
            vat,
            total,
            date: new Date().toLocaleDateString()
          };
          setGeneratedInvoice(automatedInv);
          setInvoiceHistory(prev => [automatedInv, ...prev]);
        }
      },
      {
        id: 'memories_graph_query',
        panel: 'Semantic Memory Bank',
        taskEn: "Executing semantic vector search on memory logs: 'Retrieve latest printable assets'",
        taskBn: "মেমোরি লগে সিম্যান্টিক ভেক্টর সার্চ চালানো হচ্ছে: 'সর্বশেষ প্রিন্টযোগ্য ফাইল সন্ধান করুন'",
        cursor: { x: 35, y: 30 },
        run: () => {
          setResearchedTopics(prev => {
            const list = ["Vector Bleed Margins", "High-Gloss CMYK Printing Calibration", "Local Ollama Fallback Pipelines"];
            const added = list[Math.floor(Math.random() * list.length)];
            return prev.includes(added) ? prev : [added, ...prev].slice(0, 8);
          });
        }
      },
      {
        id: 'webos_sim_launch',
        panel: 'Sandbox Terminal',
        taskEn: "Simulating sandboxed browser shell: checking standard network port ingress on 3000",
        taskBn: "স্যান্ডবক্সড ব্রাউজার শেল সিমুলেশন: পোর্ট ৩০০০ এ স্ট্যান্ডার্ড নেটওয়ার্ক ট্রাফিকের ইনগ্রেস পরীক্ষা করা হচ্ছে",
        cursor: { x: 15, y: 75 },
        run: () => {
          setInterpreterLogs(prev => [
            ...prev,
            { text: `$ curl -I http://localhost:3000/api/health`, type: 'input' },
            { text: `HTTP/1.1 200 OK\nContent-Type: application/json\nX-Powered-By: Neora 100x Express Core`, type: 'output' },
            { text: `✔ API response: SUCCESS (12ms latency)`, type: 'success' }
          ]);
        }
      },
      {
        id: 'ollama_deepseek_reason',
        panel: 'Agent Dialog Deck',
        taskEn: "Querying Ollama local DeepSeek model for printing bleed calibration guidelines",
        taskBn: "ডিজিটাল প্রেসের ব্লিড ক্যালিব্রেশনের জন্য লোকাল ওল্লামা ডিপসিক মডেলের সহায়তা চাওয়া হচ্ছে",
        cursor: { x: 30, y: 40 },
        run: () => {
          setCognitiveLogs(prev => [
            `🧠 [DeepSeek Core] Prompt received: "Optimize Shukria offset press margins for 300dpi booklets."`,
            `🧠 [DeepSeek Core] Thought: User requests offset print calibration. Calculating margins (Bleed=3mm, Margin=5mm)...`,
            ...prev.slice(0, 18)
          ]);
        }
      },
      {
        id: 'save_evolutionary_checkpoint',
        panel: 'Self Evolution Core',
        taskEn: "Creating system checkpoint and archiving local memory cache to indexedDB repository",
        taskBn: "সিস্টেম চেকপয়েন্ট তৈরি এবং লোকাল মেমরি ক্যাশ indexedDB রিপোজিটরিতে সংরক্ষণ করা হচ্ছে",
        cursor: { x: 12, y: 22 },
        run: () => {
          setLearnedSkills(prev => {
            const list = ["CMYK Vector Splitting", "Automated Multi-Agent Swarm", "Offline Fallback Redundancy"];
            const added = list[Math.floor(Math.random() * list.length)];
            return prev.includes(added) ? prev : [...prev, added].slice(0, 10);
          });
        }
      }
    ];

    // Filter or prioritize action based on active mode
    let availableActions = [...actions];
    if (autopilotMode === 'bangla_core') {
      availableActions = actions.filter(a => a.panel === 'Printing Calculation Hub' || a.id.includes('switch'));
    } else if (autopilotMode === 'debugger') {
      availableActions = actions.filter(a => a.panel === 'Sandbox Terminal' || a.panel === 'System Diagnostics' || a.id.includes('switch'));
    }

    if (availableActions.length === 0) {
      availableActions = [...actions];
    }

    // Pick a random action
    const action = availableActions[Math.floor(Math.random() * availableActions.length)];
    
    // Play audio beep sound
    playSelfUseChirp(600 + Math.random() * 400, 'sine', 0.08);

    // Update state parameters
    setCurrentSelfUseTask(action.taskEn);
    setCurrentSelfUseTaskBn(action.taskBn);
    setSelfUseActivePanel(action.panel);
    setSelfUseCursor(action.cursor);
    setSelfUseCompletedCount(prev => prev + 1);

    // Run custom side-effects
    action.run();

    // Log this step to our autopilot dashboard logs
    const ts = new Date().toLocaleTimeString();
    setSelfUseLogs(prev => [
      `[${ts}] 🤖 [${action.panel}] ${lang === 'bn' || autopilotMode === 'bangla_core' ? action.taskBn : action.taskEn}`,
      ...prev.slice(0, 30)
    ]);

    // Update cognitive logs as well
    setCognitiveLogs(prev => [
      `🧠 [Self-Simulator] Autonomously triggered ${action.panel} -> verified and tested OK.`,
      ...prev.slice(0, 20)
    ]);
  };

  useEffect(() => {
    if (!isSelfUsingRun) return;
    const interval = setInterval(() => {
      executeRandomSelfUseStep();
    }, autopilotSpeedMs);
    return () => clearInterval(interval);
  }, [isSelfUsingRun, autopilotSpeedMs, lang]);

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
    },
    {
      id: "claude_interpreter_bridge",
      title: "4. J.A.R.V.I.S. Developer Core: Claude Code & Open Interpreter Engine",
      bnTitle: "৪. জারভিস ডেভ কোর: ক্লড কোড ও ওপেন ইন্টারপ্রিটার ইঞ্জিন",
      description: "Integrate powerful local compiling terminal capable of drafting apps, running terminal scripts, auto-fixing compilation errors, and managing folders autonomously.",
      bnDescription: "যেকোনো সফটওয়্যার তৈরি, কোড ডিবাগ, টার্মিনাল কমান্ড এবং প্যাকেজ রান করার জন্য ক্লড কোড ও ইন্টারপ্রিটার ডেক যুক্ত করুন।",
      status: unlockedFeatures.includes('claude_interpreter_bridge') ? 'completed' : 'locked',
      plan: [
        "Create full-duplex sandboxed command-line interface in Neora.",
        "Bind automated file-system search routines and file-write hooks.",
        "Implement 'npm run build' compiler listeners to catch linter errors on live run.",
        "Support automated unit testing checks with direct success output pipelines."
      ],
      bnPlan: [
        "টার্মিনাল কমান্ড ইন্টারফেস এবং ইন্টারেক্টিভ কনসোল বাফার তৈরি করা।",
        "ফাইলের গঠন সনাক্তকরণ ও নতুন ফাইল তৈরির জন্য কোপ্রসেসর যুক্ত করা।",
        "কম্পাইল এরর ও বাগ স্বয়ংক্রিয়ভাবে ডিটেক্ট করার জন্য লিন্ট হ্যান্ডলার তৈরি করা।",
        "কোড ভ্যালিডেশন এবং ইউনিট টেস্ট স্যুটের ইন্টিগ্রেশন সম্পন্ন করা।"
      ],
      prompt: "Configure custom development console simulator capable of routing automated scripts, drafting React code bundles, running unit tests, and executing self-healing loops.",
      sourceCode: `export async function executeAutopilotCommand(cmd) {
  const norm = cmd.toLowerCase();
  if (norm.includes("build")) return { code: 0, stdout: "compiled dist/server.cjs successfully" };
  if (norm.includes("test")) return { code: 0, stdout: "All 14 unit tests passed." };
  return { code: 0, stdout: "done" };
}`
    },
    {
      id: "adobe_design_pipeline",
      title: "5. J.A.R.V.I.S. Creative: Adobe Photoshop & Illustrator Vector Pipeline",
      bnTitle: "৫. জারভিস ক্রিয়েটিভ: ফটোশপ ও ইলাস্ট্রেটর ভেক্টর অটোমেশন",
      description: "Autonomous high-precision vector design pipeline supporting layered PSD, EPS, AI, and SVG assets for branding, visiting cards, and flyers.",
      bnDescription: "ফটোশপ ও ইলাস্ট্রেটর ডাইরেক্ট অটোমেশন যা দিয়ে ভিজিটিং কার্ড, ব্যানার, পোস্টার, কেলেন্ডার, থাম্বনেল, বুক কভার ইত্যাদির লেয়ার্ড PSD ও EPS ফাইল তৈরি করবে।",
      status: unlockedFeatures.includes('adobe_design_pipeline') ? 'completed' : 'locked',
      plan: [
        "Establish CMYK printing workspace setups configured for standard Bangladesh layouts.",
        "Create high-precision layered canvas drawer simulation with dynamic shape coordinates.",
        "Configure automated file-format serialization supporting PSD, EPS, and high-fidelity PNG outputs.",
        "Support custom print bleeding boundaries (0.125 in) and active crop marks."
      ],
      bnPlan: [
        "বাংলাদেশী স্ট্যান্ডার্ড ও শুকরিয়া প্রিন্টার্স ফরম্যাটে CMYK প্রিন্টিং ক্যানভাস প্রস্তুত করা।",
        "ডাইনামিক শেপ কোঅর্ডিনেট সহ ফটোশপ লেয়ার ট্র্যাকিং মেকানিজম যুক্ত করা।",
        "PSD, EPS এবং ভেক্টর এআই ফাইলের জন্য ডাইনামিক প্রম্পট প্রসেসর তৈরি করা।",
        "প্রিন্টিং ব্লিড এরিয়া এবং ক্রপ মার্ক গাইডラインস অটো-ডিজাইন করা।"
      ],
      prompt: "Design an automated vector asset drafting assistant that compiles graphic dimensions, places text layers, applies printing hex codes, and saves as PSD or EPS format.",
      sourceCode: `export function compileVectorCanvas(type, size, format) {
  return { canvasId: "PSD-VECTOR-" + Date.now(), layersCount: 8, resolution: "300dpi", dimensions: size };
}`
    },
    {
      id: "ollama_n8n_agents",
      title: "6. J.A.R.V.I.S. Flow: Local Ollama & n8n Multi-Agent Workflow Node",
      bnTitle: "৬. জারভিস ফ্লো: লোকাল অলামা ও n8n মাল্টি-এজেন্ট ওয়ার্কফ্লো নোড",
      description: "Powers intelligent cron-jobs, webhook listeners, AnythingLLM vector storage, and automated WhatsApp, Telegram, and Email order routing via Ollama models.",
      bnDescription: "লোকাল অলামা ও ডিপসিক-আর১ মডেল ব্যবহার করে ইন্টেলিজেন্ট ক্রন-জব, n8n কানেক্টর এবং হোয়াটসঅ্যাপ, টেলিগ্রাম ও ইমেইল নোটিফিকেশন লুপ অ্যাক্টিভেট করুন।",
      status: unlockedFeatures.includes('ollama_n8n_agents') ? 'completed' : 'locked',
      plan: [
        "Connect n8n-style workspace flow graphs containing Webhooks and SMTP nodes.",
        "Deploy AnythingLLM semantic document storage and retrieval mappings.",
        "Bind Ollama (Llama 3 / DeepSeek-R1) background LLM dispatch routines.",
        "Integrate instant notifications on success to shukriaprinters@gmail.com."
      ],
      bnPlan: [
        "ওয়েবহুক, অলামা নোড এবং নোটিফিকেশন মডিউল সংযুক্ত করে n8n স্টাইল গ্রাফ ভিউ যুক্ত করা।",
        "ক্লাইন্ট ও প্রিন্টিং হিস্ট্রি ডাটা রিট্রিভ করার জন্য লোকাল ভেক্টর ডাটাবেস RAG স্থাপন করা।",
        "লোকাল Ollama লুপ ট্রিগার কানেক্টর যুক্ত করা যা অফলাইনে ডিপ-থিংকিং রেন্ডার করতে পারবে।",
        "shukriaprinters@gmail.com-এ প্রতিটি সফল কাজের কনফার্মেশন স্বয়ংক্রিয়ভাবে ডিসপ্যাচ করা।"
      ],
      prompt: "Implement local n8n automation loop linking AnythingLLM Vector store, WhatsApp webhook notifications, and Ollama reasoning engines inside the desktop shell.",
      sourceCode: `export async function executeWorkflowNode(trigger, nodeType) {
  console.log("n8n executing workflow from " + trigger + " to " + nodeType);
  return { status: "success", nodesProcessed: ["Ollama", "AnythingLLM", "SMTP"] };
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

  // --- CLAUDE CODE & OPEN INTERPRETER COMPILER HANDLERS ---
  const handleRunInterpreterCommand = (cmdText?: string) => {
    const activeCmd = cmdText || interpreterCmd;
    if (!activeCmd.trim() || isInterpreterRunning) return;

    setIsInterpreterRunning(true);
    setInterpreterLogs(prev => [...prev, { text: `$ ${activeCmd}`, type: 'input' }]);
    setInterpreterCmd('');

    const norm = activeCmd.toLowerCase();
    let steps: Array<{ text: string; type: 'input' | 'output' | 'success' | 'error' | 'status' }> = [];

    if (norm.includes('build') || norm.includes('compile')) {
      steps = [
        { text: "📦 Reading workspace metadata...", type: 'status' },
        { text: "⚙️ Invoking 'npm run build' inside sandboxed container...", type: 'status' },
        { text: "✓ vite v5.1.0 building for production...", type: 'output' },
        { text: "✓ transform /src/App.tsx (2.3s)", type: 'output' },
        { text: "✓ transform /src/components/SelfEvolutionView.tsx (1.5s)", type: 'output' },
        { text: "✓ 284 modules transformed.", type: 'output' },
        { text: "🚀 dist/index.html                     0.45 kB │ gzip: 0.30 kB", type: 'success' },
        { text: "🚀 dist/assets/index-B5w8oZ9m.js    142.12 kB │ gzip: 42.10 kB", type: 'success' },
        { text: "🚀 dist/assets/index-Cz9LmN3w.css    45.80 kB │ gzip: 11.20 kB", type: 'success' },
        { text: "🎉 SUCCESS: Production bundle compiled successfully on Port 3000.", type: 'success' }
      ];
    } else if (norm.includes('test') || norm.includes('run tests')) {
      steps = [
        { text: "🧪 Spawning autonomous testing suite...", type: 'status' },
        { text: "✓ PASS  tests/bengali_spec_parsing.test.ts (210ms)", type: 'success' },
        { text: "✓ PASS  tests/automated_billing_discounts.test.ts (110ms)", type: 'success' },
        { text: "✓ PASS  tests/jarvis_neural_voice.test.ts (80ms)", type: 'success' },
        { text: "✓ PASS  tests/n8n_ollama_integration.test.ts (150ms)", type: 'success' },
        { text: "✓ PASS  tests/photoshop_canvas_layers.test.ts (310ms)", type: 'success' },
        { text: "📊 Test Suites: 5 passed, 5 total", type: 'output' },
        { text: "📊 Tests:       14 passed, 14 total", type: 'output' },
        { text: "🎉 SUCCESS: All automated checks completed successfully.", type: 'success' }
      ];
    } else if (norm.includes('bug') || norm.includes('fix') || norm.includes('lint') || norm.includes('debug')) {
      steps = [
        { text: "🔍 Running 'npm run lint' to inspect project health...", type: 'status' },
        { text: "⚠️ Found 1 potential syntax bracket warning in 'src/components/SelfEvolutionView.tsx'.", type: 'error' },
        { text: "🛠️ Open Interpreter: Injecting surgical self-healing pattern...", type: 'status' },
        { text: "✓ File modified: src/components/SelfEvolutionView.tsx", type: 'success' },
        { text: "⚙️ Verifying fix: Running linter syntax checks...", type: 'status' },
        { text: "🎉 SUCCESS: Linter resolved 100% green. Workspace clean.", type: 'success' }
      ];
    } else if (norm.includes('install') || norm.includes('package')) {
      steps = [
        { text: "📥 Running 'install_applet_package' inside sandboxed shell...", type: 'status' },
        { text: "npm install @google/genai @radix-ui/react-icons lucide-react --save", type: 'output' },
        { text: "✓ Added 3 packages and audited 184 dependencies.", type: 'success' },
        { text: "🎉 SUCCESS: All workspace dependencies are active and mapped.", type: 'success' }
      ];
    } else {
      steps = [
        { text: "🧠 Dispatched prompt to Ollama DeepSeek-R1 LLM model...", type: 'status' },
        { text: "💬 Output received: 'Processing custom automation task for Shukria Printers. Directing Windows OS API layer commands.'", type: 'output' },
        { text: "✓ Done. Exit code 0.", type: 'success' }
      ];
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setInterpreterLogs(prev => [...prev, steps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsInterpreterRunning(false);
      }
    }, 800);
  };

  // --- ADOBE GRAPHIC DESIGN AUTOMATION HANDLERS ---
  const handleGenerateGraphicDesign = () => {
    if (isDesigning) return;
    setIsDesigning(true);
    setDesignProgress(0);
    setDesignResult(null);
    setDesignLogs([]);

    const steps = [
      "📐 establishing Photoshop/Illustrator document canvas...",
      "🎨 applying high-precision CMYK printing color values...",
      "🖌️ generating custom vector paths, layers, and grids...",
      "🖋️ adding typography layers and aligning crop marks...",
      "💾 writing layered file format headers...",
      "🎉 vector artwork compilation completed successfully!"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setDesignLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`]);
        setDesignProgress(Math.floor(((i + 1) / steps.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setIsDesigning(false);

        // Formulate design results
        let title = "Custom Visiting Card Draft";
        let sub = "Shukria Printers Professional";
        let details = [
          "Format: Illustrator Vector Document (EPS Mode + Embedded PSD)",
          "Resolution: 300 DPI High-Precision",
          "Color Space: CMYK Printing Profile Coated FOGRA39",
          "Bleed Area: 0.125 in outer safety crop marks active",
          "Active Layers: 8 (Logo, Text_Eng, Text_Bn, Shapes, Guides, Background, Watermark)"
        ];

        if (designType === 'pvc_banner') {
          title = "PVC Large Scale Advertising Banner";
          sub = "High-fidelity outdoor flex printing model";
          details[3] = "Bleed Area: 2.0 in wrap stitching safety loops";
        } else if (designType === 'logo') {
          title = "Vector Logomark Concept Asset";
          sub = "Abstract professional identity blueprint";
          details[0] = "Format: Encapsulated PostScript Vector Mode (EPS + SVG + AI)";
        } else if (designType === 'leaflet') {
          title = "Marketing Leaflet Promo Pamphlet";
          sub = "A4 standard tri-fold layout grid draft";
        }

        setDesignResult({
          title,
          subtitle: sub,
          type: designType,
          format: designFormat,
          prompt: designPrompt || "High fidelity printing asset for Shukria Printers",
          details,
          timestamp: new Date().toLocaleDateString()
        });
      }
    }, 900);
  };

  // --- OLLAMA & N8N AUTOMATION HANDLERS ---
  const handleTriggerN8nWorkflow = () => {
    if (isN8nRunning) return;
    setIsN8nRunning(true);
    setN8nLogs([]);

    const steps = [
      `🔗 [n8n Workflow] Activated on trigger event: "${n8nWorkflowTrigger.toUpperCase()}"`,
      "🧠 [Ollama LLM] Invoking deep reasoning: DeepSeek-R1 processing billing request...",
      "📚 [Vector DB] Retrieval Augmented Generation: pulling Shukria client templates...",
      "📑 [n8n-Compiler] Structuring PDF document generation rules with local tax (15% BD VAT)...",
      "📨 [n8n-SMTP] Connected to shukriaprinters@gmail.com security nodes...",
      "🚀 [n8n-Dispatcher] Sent automated transaction statement invoice safely.",
      "✅ [n8n-Success] Workflow execution completed successfully. Total time: 1.45s"
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setN8nLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setIsN8nRunning(false);
      }
    }, 850);
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
          <button
            onClick={() => setActiveSubTab('explorer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 relative ${activeSubTab === 'explorer' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? 'স্কিল এক্সপ্লোরার' : 'Skill Explorer'}</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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

                {/* 4. Learned: J.A.R.V.I.S. Developer Core: Claude Code & Open Interpreter */}
                {unlockedFeatures.includes('claude_interpreter_bridge') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-emerald-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'জারভিস ডেভ কোর: ক্লড কোড ও ওপেন ইন্টারপ্রিটার' : 'Module 4: J.A.R.V.I.S. Developer Core (Claude Code Console)'}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {lang === 'bn' 
                        ? 'এটি একটি অফলাইন স্যান্ডবক্সড ক্যানভাস যা লোকাল ডিরেক্টরি স্ক্যান, কোড এডিটিং, সোর্স-কোড কম্পাইলিং, এবং বাগ ফিক্সিং লুপ চালায়।' 
                        : 'Autonomous developer console executing direct terminal compiles, local file editing, syntactical debugging, and auto-linting loops.'}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Control Panel / Actions */}
                      <div className="space-y-3 lg:col-span-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                          {lang === 'bn' ? 'ডেভলপার কমান্ড শর্টকাটস' : 'DEVELOPER SHORTCUT ACTIONS'}
                        </span>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => handleRunInterpreterCommand("compile and build applet")}
                            disabled={isInterpreterRunning}
                            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-emerald-500/25 rounded-xl text-left text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <span>📦 compile and build applet</span>
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-all" />
                          </button>

                          <button
                            onClick={() => handleRunInterpreterCommand("run auto-tests")}
                            disabled={isInterpreterRunning}
                            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-emerald-500/25 rounded-xl text-left text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <span>🧪 run auto-tests</span>
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-all" />
                          </button>

                          <button
                            onClick={() => handleRunInterpreterCommand("find & fix workspace bugs")}
                            disabled={isInterpreterRunning}
                            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-emerald-500/25 rounded-xl text-left text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <span>🛠️ find & fix workspace bugs</span>
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-all" />
                          </button>

                          <button
                            onClick={() => handleRunInterpreterCommand("install required packages")}
                            disabled={isInterpreterRunning}
                            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-emerald-500/25 rounded-xl text-left text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <span>📥 install required packages</span>
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-all" />
                          </button>
                        </div>

                        {/* Status Blocks */}
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500">LINTER STATUS:</span>
                            <span className="text-emerald-400 font-bold">100% HEALTHY</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500">TEST COVERAGE:</span>
                            <span className="text-emerald-400 font-bold">98.4% COVERED</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500">PROCESSOR MODE:</span>
                            <span className="text-cyan-400">CLAUDE + INTERPRETER</span>
                          </div>
                        </div>
                      </div>

                      {/* Live terminal output */}
                      <div className="lg:col-span-2 flex flex-col h-64 bg-slate-950 border border-slate-900 rounded-xl overflow-hidden font-mono text-xs">
                        <div className="bg-slate-900 px-3 py-2 border-b border-slate-900 flex justify-between items-center shrink-0">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">J.A.R.V.I.S. INTERACTIVE TERMINAL</span>
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                          </div>
                        </div>

                        {/* Logs container */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-2 text-[11px] scrollbar-thin">
                          {interpreterLogs.map((log, index) => (
                            <div key={index} className="leading-relaxed whitespace-pre-wrap">
                              {log.type === 'input' && (
                                <span className="text-cyan-400 font-bold">$ {log.text.replace('$ ', '')}</span>
                              )}
                              {log.type === 'output' && (
                                <span className="text-slate-300">{log.text}</span>
                              )}
                              {log.type === 'status' && (
                                <span className="text-slate-500 italic">{log.text}</span>
                              )}
                              {log.type === 'success' && (
                                <span className="text-emerald-400 font-semibold">{log.text}</span>
                              )}
                              {log.type === 'error' && (
                                <span className="text-red-400 font-semibold">{log.text}</span>
                              )}
                            </div>
                          ))}
                          
                          {isInterpreterRunning && (
                            <div className="flex items-center gap-2 text-emerald-400 animate-pulse text-[11px]">
                              <span>🤖 Claude Code compiler drafting local updates...</span>
                              <div className="w-1.5 h-3 bg-emerald-400 animate-ping inline-block" />
                            </div>
                          )}
                        </div>

                        {/* Terminal input form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleRunInterpreterCommand();
                          }}
                          className="border-t border-slate-900 p-2 bg-slate-950 flex gap-2 shrink-0"
                        >
                          <span className="text-cyan-400 font-bold self-center pl-1">$</span>
                          <input
                            type="text"
                            value={interpreterCmd}
                            onChange={(e) => setInterpreterCmd(e.target.value)}
                            disabled={isInterpreterRunning}
                            placeholder={lang === 'bn' ? 'যেকোনো কমান্ড লিখুন (যেমনঃ "build", "test", "fix")...' : 'Type terminal commands or prompts (e.g. "build", "test")...'}
                            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 font-mono focus:ring-0 p-1"
                          />
                          <button
                            type="submit"
                            disabled={isInterpreterRunning || !interpreterCmd.trim()}
                            className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 rounded text-[11px] font-bold uppercase transition-all cursor-pointer"
                          >
                            RUN
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Learned: J.A.R.V.I.S. Creative: Adobe Photoshop & Illustrator Vector Pipeline */}
                {unlockedFeatures.includes('adobe_design_pipeline') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-purple-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'জারভিস ক্রিয়েটিভ: ফটোশপ ও ইলাস্ট্রেটর ভেক্টর অটোমেশন' : 'Module 5: J.A.R.V.I.S. Creative (Adobe Canvas Compiler)'}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {lang === 'bn' 
                        ? 'এটি ফটোশপ এবং ইলাস্ট্রেটর এর সিএমওয়াইকে প্রিন্টিং মেটাডেটা প্রসেসর। এটি ভেক্টর শেপ তৈরি করে নিখুঁত পিএসডি ও ইপিএস ফাইল রেডি করে।' 
                        : 'Generates high-precision layered vectors, crop bounds, and layout guides structured into production-ready PSD & EPS files.'}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Inputs & Compile Controls */}
                      <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pl-1 block">
                          {lang === 'bn' ? 'ডিজাইন এসেট ও মেটাডাটা প্রম্পট' : 'DESIGN SPECIFICATION PARAMETERS'}
                        </span>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'এসেটের ধরন' : 'Asset Type'}</label>
                            <select
                              value={designType}
                              onChange={(e: any) => setDesignType(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none"
                            >
                              <option value="visiting_card">{lang === 'bn' ? 'ভিজিটিং কার্ড (Visiting Card)' : 'Visiting Card (3.25"x2")'}</option>
                              <option value="pvc_banner">{lang === 'bn' ? 'পিভিসি ব্যানার (PVC Banner)' : 'PVC Banner (Large)'}</option>
                              <option value="logo">{lang === 'bn' ? 'কোম্পানি লোগো (Logomark)' : 'Vector Logo concept'}</option>
                              <option value="thumbnail">{lang === 'bn' ? 'থাম্বনেল / ব্যানার (Banner)' : 'Youtube/Page Thumbnail'}</option>
                              <option value="leaflet">{lang === 'bn' ? 'লিফলেট / ফ্লায়ার (Leaflet)' : 'Leaflet Flyer (A4)'}</option>
                              <option value="calendar">{lang === 'bn' ? 'ক্যালেন্ডার গ্রিড (Calendar)' : 'Desktop Calendar Grid'}</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'সেভ করার ফরম্যাট' : 'Export Format'}</label>
                            <select
                              value={designFormat}
                              onChange={(e: any) => setDesignFormat(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none"
                            >
                              <option value="PSD">PSD Mode (Photoshop Layers)</option>
                              <option value="EPS">EPS Mode (Illustrator Vectors)</option>
                              <option value="AI">AI Mode (Native Vector Project)</option>
                              <option value="PNG">High-Fi PNG Image concept</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'ডিজাইন কনসেপ্ট প্রম্পট' : 'AI Prompt / Layout description'}</label>
                          <textarea
                            rows={3}
                            value={designPrompt}
                            onChange={(e) => setDesignPrompt(e.target.value)}
                            placeholder={lang === 'bn' ? 'যেমনঃ গোল্ডেন এবং ব্ল্যাক কম্বিনেশনে শুকরিয়া প্রিন্টার্সের জন্য চমৎকার ক্যালিগ্রাফি স্টাইলের কার্ড।' : 'e.g. Shukria Printers visiting card in matte black & rich gold textures with elegant Bengali fonts.'}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none focus:border-purple-500/40"
                          />
                        </div>

                        <button
                          onClick={handleGenerateGraphicDesign}
                          disabled={isDesigning || !designPrompt.trim()}
                          className="w-full py-3 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className={`w-4 h-4 ${isDesigning ? 'animate-spin' : ''}`} />
                          <span>{isDesigning ? (lang === 'bn' ? 'ডিজাইন ভেক্টর কম্পাইল হচ্ছে...' : 'COMPILING PSD/EPS VECTOR...') : (lang === 'bn' ? 'সিএমওয়াইকে ভেক্টর ডিজাইন কম্পাইল করুন' : 'Compile CMYK Vector Design')}</span>
                        </button>

                        {/* Scrolling compile steps log */}
                        {designLogs.length > 0 && (
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-500 space-y-1 max-h-32 overflow-y-auto">
                            {designLogs.map((log, idx) => (
                              <div key={idx} className="flex gap-1">
                                <span className="text-slate-700">[{idx + 1}]</span>
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Interactive Canvas preview */}
                      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative">
                        {/* Blueprint grid effect background */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                        <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3 shrink-0">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">VECTOR ARTWORK CANVAS STAGE</span>
                          <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>CMYK 300DPI</span>
                          </div>
                        </div>

                        {isDesigning ? (
                          <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-3 font-mono">
                            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                            <div className="text-center">
                              <span className="text-xs text-purple-300 font-bold">{designProgress}% COMPLETE</span>
                              <p className="text-[9px] text-slate-500 mt-1">J.A.R.V.I.S. is mapping vectors on physical coordinates...</p>
                            </div>
                          </div>
                        ) : designResult ? (
                          <div className="flex-1 flex flex-col justify-between space-y-4">
                            {/* Graphic mockup block */}
                            <div className="border border-purple-500/20 bg-slate-900/60 rounded-xl p-4 relative overflow-hidden group">
                              {/* Crop marks simulation */}
                              <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-slate-600" />
                              <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-slate-600" />
                              <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-slate-600" />
                              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-slate-600" />

                              <div className="space-y-2 relative">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-sm font-extrabold tracking-wider text-purple-300 font-mono uppercase">{designResult.title}</h4>
                                    <span className="text-[10px] text-slate-400 font-sans">{designResult.subtitle}</span>
                                  </div>
                                  <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase">{designResult.format} FILE</span>
                                </div>

                                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-900 font-mono text-[10px] space-y-1 text-slate-400">
                                  <div className="text-[9px] text-slate-500 border-b border-slate-900 pb-1 italic mb-1">
                                    Prompt: "{designResult.prompt}"
                                  </div>
                                  {designResult.details.map((det: string, idx: number) => (
                                    <div key={idx} className="flex gap-1">
                                      <span className="text-slate-600">•</span>
                                      <span>{det}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Download Action */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  alert(`Successfully saved ${designResult.format} layered vector project to local repository (PC/Downloads)!`);
                                }}
                                className="flex-1 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:border-purple-500/40 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Save {designResult.format} Document</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center font-mono text-slate-600">
                            <Layers className="w-8 h-8 text-slate-800 mb-2 animate-pulse" />
                            <p className="text-[10px] italic">{lang === 'bn' ? 'ডিজাইনের বিবরণ লিখে সিএমওয়াইকে ভেক্টর কম্পাইল বাটনে ক্লিক করুন।' : 'Design asset preview workspace. Click Compile to render vector layout.'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Learned: J.A.R.V.I.S. Flow: Local Ollama & n8n Multi-Agent Workflow Core */}
                {unlockedFeatures.includes('ollama_n8n_agents') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-cyan-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <RefreshCw className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                        🛠️ {lang === 'bn' ? 'জারভিস ফ্লো: লোকাল অলামা ও n8n মাল্টি-এজেন্ট' : 'Module 6: J.A.R.V.I.S. Flow (n8n Workflow Hub)'}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {lang === 'bn' 
                        ? 'এটি আপনার জন্য হোয়াটসঅ্যাপ, টেলিগ্রাম, লোকাল ডিপসিক-আর১ অলামা এবং শুকরিয়া প্রিন্টার্স ইমেইল নোটিফিকেশন সমন্বয় করে কাজ করে।' 
                        : 'Connects AnythingLLM Vector Store, WhatsApp Webhooks, Ollama Reasoning Engines, and Email channels into responsive triggers.'}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Flow Visualization Diagram */}
                      <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between font-mono text-xs relative overflow-hidden min-h-60">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block border-b border-slate-900 pb-2 mb-3 shrink-0">
                          VISUAL WORKFLOW NODE DIAGRAM
                        </span>

                        {/* Interactive connecting path animation */}
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-4 py-4 relative">
                          {/* Node 1: Trigger */}
                          <div className={`p-2.5 rounded-lg border text-center transition-all ${isN8nRunning ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_10px_rgba(6,182,212,0.15)] animate-pulse' : 'border-slate-800 bg-slate-900/40'} w-28`}>
                            <div className="text-[9px] text-slate-500 uppercase font-bold">TRIGGER NODE</div>
                            <span className="text-[10px] text-slate-300 truncate block mt-1">{n8nWorkflowTrigger.toUpperCase()}</span>
                          </div>

                          <div className="w-1.5 h-6 md:w-8 md:h-1.5 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 animate-pulse rounded" />

                          {/* Node 2: LLM Brain */}
                          <div className={`p-2.5 rounded-lg border text-center transition-all ${isN8nRunning ? 'border-purple-400 bg-purple-950/20 shadow-[0_0_10px_rgba(168,85,247,0.15)] animate-pulse' : 'border-slate-800 bg-slate-900/40'} w-28`}>
                            <div className="text-[9px] text-slate-500 uppercase font-bold">OLLAMA BRAIN</div>
                            <span className="text-[10px] text-purple-300 font-bold block mt-1">DeepSeek-R1</span>
                          </div>

                          <div className="w-1.5 h-6 md:w-8 md:h-1.5 bg-gradient-to-r from-purple-500/30 to-emerald-500/30 animate-pulse rounded" />

                          {/* Node 3: SMTP / Destination */}
                          <div className={`p-2.5 rounded-lg border text-center transition-all ${isN8nRunning ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] animate-pulse' : 'border-slate-800 bg-slate-900/40'} w-28`}>
                            <div className="text-[9px] text-slate-500 uppercase font-bold">SMTP ACTION</div>
                            <span className="text-[10px] text-emerald-400 font-bold block mt-1">shukriaprinters</span>
                          </div>
                        </div>

                        {/* Node connectivity status */}
                        <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-900 pt-2 mt-2 shrink-0">
                          <span>SYSTEM CORE WORKFLOW:</span>
                          <span className={isWorkflowActive ? "text-emerald-400 font-bold" : "text-amber-500"}>
                            {isWorkflowActive ? "🟢 ACTIVE & DEPLOYED" : "🟡 STANDBY"}
                          </span>
                        </div>
                      </div>

                      {/* Controls and trigger inputs */}
                      <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pl-1 block">
                            WORKFLOW AUTOMATION CONFIGS
                          </span>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-500 uppercase">Select Workflow Trigger Event</label>
                            <select
                              value={n8nWorkflowTrigger}
                              onChange={(e: any) => setN8nWorkflowTrigger(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none"
                            >
                              <option value="invoice_created">Event: invoice_created (New Billing Order)</option>
                              <option value="webhook">Webhook: WhatsApp / Telegram API payload received</option>
                              <option value="cron">Cron Trigger: Execute Hourly Workspace diagnostics</option>
                            </select>
                          </div>

                          <div className="flex justify-between items-center bg-slate-950 p-2.5 border border-slate-900 rounded-lg">
                            <span className="text-xs font-mono text-slate-400">Autopilot Workflow Sync</span>
                            <button
                              onClick={() => setIsWorkflowActive(!isWorkflowActive)}
                              className={`px-3 py-1 text-[10px] font-mono font-bold rounded border transition-all ${isWorkflowActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                            >
                              {isWorkflowActive ? "ONLINE" : "OFFLINE"}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={handleTriggerN8nWorkflow}
                            disabled={isN8nRunning || !isWorkflowActive}
                            className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isN8nRunning ? 'animate-spin' : ''}`} />
                            <span>{isN8nRunning ? (lang === 'bn' ? 'ওয়ার্কফ্লো রান হচ্ছে...' : 'RUNNING N8N SYNC...') : (lang === 'bn' ? 'ফ্লো ম্যানুয়ালি রান করুন' : 'Execute Workflow Sync')}</span>
                          </button>

                          {/* Logging output */}
                          {n8nLogs.length > 0 && (
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 space-y-1 max-h-32 overflow-y-auto leading-relaxed">
                              {n8nLogs.map((log, index) => (
                                <div key={index} className="flex gap-1">
                                  <span>{log}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Learned: Bulk Order Calculator */}
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
                          onChange={(e) => setJarvisSpeechText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg p-2 text-xs text-slate-200 outline-none font-mono resize-none"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            { label: lang === 'bn' ? 'স্ট্যাটাস চেক' : 'Status Check', text: 'All systems green. Shukria offset press margins stabilized.' },
                            { label: lang === 'bn' ? 'অটোপাইলট রেডি' : 'Autopilot Ready', text: 'Autopilot sequence initiated. Core temperature nominal.' },
                            { label: lang === 'bn' ? 'স্যান্ডবক্স ওকে' : 'Sandbox OK', text: 'Sandboxed code compiles successfully. Zero memory leaks detected.' }
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              onClick={() => setJarvisSpeechText(preset.text)}
                              className="px-2 py-1 bg-cyan-950/20 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-500/45 rounded text-[9px] text-cyan-400 font-mono transition-all cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-slate-500 uppercase">
                              {lang === 'bn' ? 'ভয়েস পিচ (Pitch)' : 'Speech Pitch'}
                            </label>
                            <input
                              type="range"
                              min={0.5}
                              max={2}
                              step={0.05}
                              value={jarvisSpeechPitch}
                              onChange={(e) => setJarvisSpeechPitch(parseFloat(e.target.value))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] font-mono text-slate-600">
                              <span>0.5x</span>
                              <span className="text-cyan-400">{jarvisSpeechPitch}x</span>
                              <span>2.0x</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-slate-500 uppercase">
                              {lang === 'bn' ? 'ভয়েস স্পীড (Rate)' : 'Speech Rate'}
                            </label>
                            <input
                              type="range"
                              min={0.5}
                              max={2}
                              step={0.05}
                              value={jarvisSpeechRate}
                              onChange={(e) => setJarvisSpeechRate(parseFloat(e.target.value))}
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] font-mono text-slate-600">
                              <span>0.5x</span>
                              <span className="text-cyan-400">{jarvisSpeechRate}x</span>
                              <span>2.0x</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-900 justify-between h-12 overflow-hidden">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                              <div
                                key={bar}
                                className={`w-1 bg-cyan-400 rounded-full transition-all duration-300 ${isJarvisSpeaking ? 'animate-bounce' : 'h-2'}`}
                                style={{
                                  height: isJarvisSpeaking ? `${15 + Math.random() * 85}%` : '8px',
                                  animationDelay: `${bar * 0.08}s`
                                }}
                              />
                            ))}
                          </div>
                          
                          <button
                            onClick={handleJarvisSpeak}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isJarvisSpeaking 
                                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                                : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{isJarvisSpeaking ? (lang === 'bn' ? 'কথা বলছে...' : 'SPEAKING...') : (lang === 'bn' ? 'ভয়েস ট্রিগার' : 'TRIGGER SPEECH')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Learned: OS Agent Autopilot */}
                {unlockedFeatures.includes('os_agent_autopilot') && (
                  <div className="rounded-2xl p-5 bg-slate-900/30 border border-purple-500/10 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                        🤖 {lang === 'bn' ? 'অটোপাইলট কো-প্রসেসর' : 'Module 9: Autonomous OS Agent Autopilot'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'মিশন কনফিগারেশন' : 'MISSION CONFIGURATION'}</label>
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

                {/* NEORA 100X SELF-USE MULTI-AGENT AUTOPILOT CONTROLLER */}
                <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full filter blur-2xl pointer-events-none" />
                  
                  {/* Title Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-cyan-500/15 rounded-lg border border-cyan-500/30">
                        <Cpu className={`w-4 h-4 text-cyan-400 ${isSelfUsingRun ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold font-mono text-cyan-300 tracking-wider flex items-center gap-1.5 uppercase">
                          <span>{lang === 'bn' ? 'নিওরা ১০০x সেলফ-ইউজ অটোপাইলট' : 'Neora 100x Self-Use Autopilot'}</span>
                          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-mono rounded animate-pulse">PRO</span>
                        </h3>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                          {lang === 'bn' ? 'নিওরা নিজেই নিজের সকল কোড, ক্যানভাস ও মডিউল স্বয়ংক্রিয়ভাবে চালায়।' : 'Self-operating multi-agent simulation mapping all local actions & API fetches.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelfUsingRun ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        {isSelfUsingRun ? 'SIMULATING' : 'IDLE'}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Status Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-900">
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">{lang === 'bn' ? 'মোট সফল অ্যাকশন' : 'ACTIONS COMPLETED'}</span>
                      <span className="text-xs font-bold font-mono text-emerald-400 block select-all">
                        {selfUseCompletedCount} operations
                      </span>
                    </div>
                    <div className="space-y-1 border-l border-slate-900 pl-3">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">{lang === 'bn' ? 'সক্রিয় টার্গেট মডিউল' : 'ACTIVE TARGET MODULE'}</span>
                      <span className="text-xs font-bold font-mono text-cyan-400 block truncate">
                        {selfUseActivePanel}
                      </span>
                    </div>
                    <div className="space-y-1 border-l border-slate-900 pl-3">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">{lang === 'bn' ? 'ভার্চুয়াল কার্সার' : 'VIRTUAL CURSOR'}</span>
                      <span className="text-xs font-bold font-mono text-purple-400 block">
                        X: {selfUseCursor.x}% | Y: {selfUseCursor.y}%
                      </span>
                    </div>
                    <div className="space-y-1 border-l border-slate-900 pl-3">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">{lang === 'bn' ? 'সিস্টেম ইন্টিগ্রেশন' : 'SYSTEM HEALTH'}</span>
                      <span className="text-xs font-bold font-mono text-emerald-400 block">
                        100x Optimized
                      </span>
                    </div>
                  </div>

                  {/* Active Simulation Task Alert */}
                  {currentSelfUseTask && (
                    <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl flex items-center justify-between gap-3 animate-pulse">
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-cyan-400 font-bold">🤖 [RUNNING]:</span>
                        <span className="text-slate-300">
                          {lang === 'bn' ? currentSelfUseTaskBn : currentSelfUseTask}
                        </span>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded uppercase font-mono shrink-0">
                        {selfUseActivePanel}
                      </span>
                    </div>
                  )}

                  {/* Interactive Speed & Operations Deck */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{lang === 'bn' ? 'অটোপাইলট গতি:' : 'Autopilot Speed:'}</span>
                      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900 gap-1 shrink-0">
                        {[
                          { val: 1500, label: lang === 'bn' ? 'দ্রুত (১.৫s)' : 'Fast (1.5s)' },
                          { val: 3000, label: lang === 'bn' ? 'ব্যালেন্সড (৩s)' : 'Balanced (3s)' },
                          { val: 5000, label: lang === 'bn' ? 'রিয়েলটাইম (৫s)' : 'Realtime (5s)' }
                        ].map((speed) => (
                          <button
                            key={speed.val}
                            onClick={() => setAutopilotSpeedMs(speed.val)}
                            className={`px-2 py-1 rounded text-[8px] font-mono font-bold cursor-pointer transition-all ${
                              autopilotSpeedMs === speed.val 
                                ? 'bg-cyan-500/20 border border-cyan-500/35 text-cyan-400' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {speed.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setIsSelfUsingRun(!isSelfUsingRun);
                          playSelfUseChirp(800, 'triangle', 0.15);
                        }}
                        className={`flex-1 sm:flex-initial py-1.5 px-4 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          isSelfUsingRun 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        }`}
                      >
                        {isSelfUsingRun ? <Trash className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>
                          {isSelfUsingRun 
                            ? (lang === 'bn' ? 'অটোপাইলট বন্ধ করুন' : 'PAUSE SELF-USE') 
                            : (lang === 'bn' ? '১০০x অটোপাইলট চালান' : 'ACTIVATE 100x AUTOPILOT')}
                        </span>
                      </button>

                      <button
                        onClick={executeRandomSelfUseStep}
                        disabled={isSelfUsingRun}
                        className="py-1.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:border-slate-900 disabled:text-slate-600 text-slate-300 rounded-xl text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'ম্যানুয়াল অ্যাকশন' : 'Manual Step'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Virtual Layout Map Visualizing Neora's Clicking Cursor */}
                  <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl space-y-2 relative h-40 overflow-hidden">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block border-b border-slate-900 pb-1.5">
                      🗺 {lang === 'bn' ? 'নিওরা রিয়েল-টাইম ভার্চুয়াল ক্যানভাস ম্যাপ' : 'NEORA LIVE VIRTUAL MAP & CLICK STREAM INDICATOR'}
                    </span>
                    
                    {/* Visual indicators for panels */}
                    <div className="grid grid-cols-3 gap-2 h-[100px] relative mt-1.5">
                      {[
                        { label: 'Dialog Deck', panel: 'Agent Dialog Deck' },
                        { label: 'File Browser', panel: 'Sandbox Terminal' },
                        { label: 'Invoices', panel: 'Printing Calculation Hub' },
                        { label: 'Diagnostics', panel: 'System Diagnostics' },
                        { label: 'PSD Editor', panel: 'PSD Canvas Pipeline' },
                        { label: 'Node Network', panel: 'n8n Automation Node' }
                      ].map((p, idx) => (
                        <div
                          key={idx}
                          className={`border rounded-lg p-2 flex flex-col justify-between font-mono transition-all ${
                            selfUseActivePanel === p.panel
                              ? 'border-cyan-500/40 bg-cyan-950/15 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                              : 'border-slate-900 bg-slate-900/10 text-slate-600'
                          }`}
                        >
                          <span className="text-[8px] uppercase font-bold">{p.label}</span>
                          <span className="text-[7px] text-right font-mono truncate">
                            {selfUseActivePanel === p.panel ? '● ON FOCUS' : 'STANDBY'}
                          </span>
                        </div>
                      ))}

                      {/* Moving pulsing cursor indicator representing Neora's autonomous selection click */}
                      <div
                        className="absolute w-4 h-4 rounded-full bg-cyan-400 border border-white flex items-center justify-center transition-all duration-700 pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        style={{
                          left: `${selfUseCursor.x}%`,
                          top: `${selfUseCursor.y}%`,
                          transform: 'translate(-50%, -50%)',
                          animation: 'glow-pulse 1s infinite'
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      </div>
                    </div>
                  </div>

                  {/* Autopilot Console Output Logs */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">📋 {lang === 'bn' ? 'অটোপাইলট ইন্টারঅ্যাকশন ইতিহাস' : 'AUTOPILOT CLICK HISTORY'}</span>
                    <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl h-24 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 scrollbar-thin">
                      {selfUseLogs.map((log, i) => (
                        <div key={i} className="truncate select-text">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

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

        {activeSubTab === 'explorer' && (
          <div className="space-y-6">
            {/* Header / Intro Card */}
            <div className="rounded-2xl p-5 bg-slate-900/40 border border-emerald-500/10 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">GitHub Repository Link</span>
                    <span className="text-slate-500 text-[10px] font-mono font-bold">v2.4 ACTIVE</span>
                  </div>
                  <h3 className="text-base font-bold text-white font-jarvis flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400 animate-spin-slow" />
                    {lang === 'bn' ? 'গিটহাব স্কিল হাব এবং এক্সপ্লোরার' : 'NEORA GLOBAL SKILL HUB & EXPLORER'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    {lang === 'bn' 
                      ? 'গিটহাব এবং এক্সটার্নাল রিপোজিটরি থেকে সরাসরি নতুন ওএস এজেন্ট, এপিআই প্রোটোকল ও কোডিং স্কিল সার্চ, কম্পাইল এবং নিওরায় ইঞ্জেক্ট করুন।' 
                      : 'Search, discover, and automatically compile dynamic OS agent micro-skills from global GitHub repositories directly into Neora\'s active backplane memory.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-xl">
                  <div className="text-center px-3 border-r border-slate-800">
                    <div className="text-[10px] font-mono font-bold text-slate-500">TOTAL</div>
                    <div className="text-base font-bold text-emerald-400">{skills.length}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-[10px] font-mono font-bold text-slate-500">ACTIVE</div>
                    <div className="text-base font-bold text-cyan-400">{skills.filter(s => s.enabled).length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* GitHub Dynamic Skill Discovery Section */}
            <div className="rounded-2xl p-5 bg-slate-900/40 border border-cyan-500/10 backdrop-blur-xl relative">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  {lang === 'bn' ? 'অটোনমাস গিটহাব স্কিল ডিসকভারি সার্ভিস' : 'AUTONOMOUS GITHUB SKILL DISCOVERY SERVICE'}
                </h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {lang === 'bn' ? 'নতুন স্কিল রিকোয়ারমেন্ট বা প্রোজেক্ট উদ্দেশ্য টাইপ করুন:' : 'SPECIFY CUSTOM CAPABILITY OR PROJECT REQUIREMENTS:'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={isDiscovering}
                        placeholder={lang === 'bn' ? 'যেমন: Shukria printing press invoice generation, speech converter, bulk folder watcher...' : 'e.g., automated email routing, speech clone, bulk discount calculator...'}
                        value={discoveryRequirement}
                        onChange={(e) => setDiscoveryRequirement(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-850 focus:border-cyan-500/50 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 font-sans"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') triggerDiscoverAndInstall();
                        }}
                      />
                      <button
                        onClick={triggerDiscoverAndInstall}
                        disabled={isDiscovering || !discoveryRequirement.trim()}
                        className="px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold font-mono text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDiscovering ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{lang === 'bn' ? 'সার্চ হচ্ছে...' : 'SCANNING...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'ইনস্টল/আবিষ্কার' : 'Install / Discover'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className="block text-[9px] font-mono text-slate-500">
                      ⚡ {lang === 'bn' ? 'গিটহাব এপিআই-এর মাধ্যমে নিওরা রিয়েল-টাইমে সোর্স কোড ডাউনলোড ও কম্পাইল করে।' : 'Neora parses global repos, resolves syntax trees, and dynamically generates sandbox-safe JS methods.'}
                    </span>
                  </div>

                  {/* Suggestion pill buttons */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-mono text-slate-500 uppercase">{lang === 'bn' ? 'পরামর্শকৃত নতুন মডিউল:' : 'SUGGESTED NEW CAPABILITIES:'}</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: lang === 'bn' ? "✦ ইনভয়েস জেনারেটর" : "✦ Invoice Automator", prompt: "shukria automated invoices with 15% VAT Bangladesh spec" },
                        { label: lang === 'bn' ? "✦ পিডিএফ মেকার" : "✦ PDF Creator", prompt: "PDF design and compile invoice generator" },
                        { label: lang === 'bn' ? "✦ ভয়েস চেঞ্জার" : "✦ Voice Synthesis", prompt: "Bengali local custom text to speech synthesis" },
                        { label: lang === 'bn' ? "✦ মাউস এমুলেটর" : "✦ Hardware Simulator", prompt: "PC keyboard and mouse automation driver" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isDiscovering}
                          onClick={() => setDiscoveryRequirement(item.prompt)}
                          className="px-2.5 py-1 text-[10px] font-mono bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-full text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Console Log outputs */}
                <div className="lg:col-span-5 bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between min-h-[160px] max-h-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">GITHUB LIVE TERMINAL CONSOLE</span>
                    {isDiscovering && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 scrollbar-none">
                    {discoveryLogs.length === 0 ? (
                      <span className="text-slate-600 block text-center mt-6 italic">{lang === 'bn' ? 'টার্মিনাল স্ট্যান্ডবাই... ডিসকভারি স্টার্ট করুন' : 'Terminal standby... await discovery trigger'}</span>
                    ) : (
                      discoveryLogs.map((log, i) => (
                        <div key={i} className={`truncate ${log.includes('✅') || log.includes('Success') ? 'text-emerald-400 font-bold' : log.includes('⚡') ? 'text-amber-400' : 'text-slate-400'}`}>
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                  {isDiscovering && (
                    <div className="mt-2">
                      <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${discoveryProgress}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono mt-1">
                        <span>COMPILING PATHS</span>
                        <span>{discoveryProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Skill Creator & Auto-Upgrader Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Custom Skill Creator Form */}
              <div className="lg:col-span-7 rounded-2xl p-5 bg-slate-900/40 border border-cyan-500/10 backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                    <Plus className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                      {lang === 'bn' ? 'কাস্টম চাহিদা ভিত্তিক স্কিল মেকার' : 'CUSTOM REQUIREMENT SKILL CREATOR'}
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {lang === 'bn' ? 'স্কিলের নাম:' : 'SKILL NAME:'}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'যেমন: Shukria Printing VAT Estimator' : 'e.g., Shukria Printing VAT Estimator'}
                        value={customSkillName}
                        onChange={(e) => setCustomSkillName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category Dropdown */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {lang === 'bn' ? 'ক্যাটাগরি:' : 'CATEGORY:'}
                        </label>
                        <select
                          value={customSkillCategory}
                          onChange={(e) => setCustomSkillCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none font-mono"
                        >
                          <option value="Printing Systems">{lang === 'bn' ? 'Printing Systems' : 'Printing Systems'}</option>
                          <option value="Frontend Core">Frontend Core</option>
                          <option value="Multimodal Ingestion">Multimodal Ingestion</option>
                          <option value="OS Emulation Core">OS Emulation Core</option>
                          <option value="Self-Evolution">Self-Evolution Core</option>
                        </select>
                      </div>

                      {/* Complexity Dropdown */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {lang === 'bn' ? 'জटिलতা স্তর:' : 'COMPLEXITY LEVEL:'}
                        </label>
                        <select
                          value={customSkillComplexity}
                          onChange={(e) => setCustomSkillComplexity(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none font-mono"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {lang === 'bn' ? 'সংক্ষিপ্ত বিবরণ:' : 'SHORT DESCRIPTION:'}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'যেমন: শুকরিয়া প্রিন্টার্সের ১৫% বাংলাদেশ ভ্যাট স্ট্যান্ডার্ড অনুযায়ী হিসাব করে।' : 'e.g., Calculates print media margins under standard 15% BD VAT guidelines.'}
                        value={customSkillDesc}
                        onChange={(e) => setCustomSkillDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                      />
                    </div>

                    {/* System Prompt Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {lang === 'bn' ? 'সিস্টেম প্রম্পট বা আচরণ নির্দেশনা (ঐচ্ছিক):' : 'SYSTEM PROMPT / BEHAVIOR DIRECTIVE (OPTIONAL):'}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={lang === 'bn' ? 'নিওরা এই স্কিল সক্রিয় করার সময় যে প্রম্পট মেনে চলবে...' : 'Define specific rules, validation limits, or instructions that Neora must adhere to...'}
                        value={customSkillPrompt}
                        onChange={(e) => setCustomSkillPrompt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-sans resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={handleCreateCustomSkill}
                    disabled={customSkillIsCompiling || !customSkillName.trim() || !customSkillDesc.trim()}
                    className="w-full py-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold font-mono text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {customSkillIsCompiling ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'bn' ? 'কম্পাইল ও ভ্যালিডেট হচ্ছে...' : 'COMPILING & VALIDATING...'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? '✦ কাস্টম স্কিল কম্পাইল ও ইনস্টল করুন' : '✦ Compile & Install Custom Skill'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Neora Autonomous Auto-Upgrade Console & Skill Update History */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* Neora Autonomous Auto-Upgrade Console */}
                <div className="rounded-2xl p-5 bg-slate-900/40 border border-purple-500/10 backdrop-blur-xl relative flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                          {lang === 'bn' ? 'নিওরা সেলফ-আপগ্রেড প্রোটোকল' : 'NEORA AUTONOMOUS UPGRADE'}
                        </h4>
                      </div>
                      
                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => setNeoraAutoUpgradeActive(p => !p)}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          neoraAutoUpgradeActive 
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' 
                            : 'bg-slate-950 text-slate-500 border border-slate-850'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${neoraAutoUpgradeActive ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'}`} />
                        {neoraAutoUpgradeActive ? (lang === 'bn' ? 'সক্রিয়' : 'ON AUTOPILOT') : (lang === 'bn' ? 'বন্ধ' : 'MUTED')}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                      {lang === 'bn'
                        ? 'সক্রিয় থাকলে, নিওরা ব্যাকগ্রাউন্ডে ডায়াগনস্টিকস রান করে এবং কোড এক্সেপশন বা ব্যবহারকারীর চাহিদা অনুযায়ী স্বয়ংক্রিয়ভাবে নিজের স্কিল আপডেট করে।'
                        : 'When enabled, Neora dynamically watches transaction diagnostics and self-compiles/injects necessary micro-skills to prevent exceptions.'}
                    </p>

                    {/* Progress log */}
                    {isAutoUpgrading && (
                      <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-900/80 mb-4">
                        <div className="flex justify-between items-center text-[9px] font-mono text-purple-400">
                          <span>{lang === 'bn' ? 'অটোনমাস স্কিল জেনারেশন' : 'NEURAL GENERATIVE SYNTHESIS'}</span>
                          <span>{autoUpgradeProgress}%</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${autoUpgradeProgress}%` }} />
                        </div>
                        <div className="text-[8px] font-mono text-slate-500 max-h-[60px] overflow-y-auto scrollbar-none space-y-0.5">
                          {autoUpgradeLogs.slice(-2).map((log, i) => (
                            <div key={i} className="truncate">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={runNeoraAutoUpgrade}
                      disabled={isAutoUpgrading}
                      className="w-full py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold font-mono text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isAutoUpgrading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{lang === 'bn' ? 'স্বয়ংক্রিয় টিউনিং হচ্ছে...' : 'TUNING NEURAL CORE...'}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? '⚡ এখনই অটো-আপগ্রেড রান করুন' : '⚡ Run Auto-Upgrade Diagnostic Now'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Skill Update History Log */}
                <div className="rounded-2xl p-5 bg-slate-900/40 border border-emerald-500/10 backdrop-blur-xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                        {lang === 'bn' ? 'স্কিল আপডেট হিস্ট্রি ও অডিট ট্রেইল' : 'SKILL INTEGRATION LOGS'}
                      </h4>
                    </div>

                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-none">
                      {skillHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-900 text-[10px] font-mono">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.type === 'user_created' ? 'bg-cyan-400' :
                              item.type === 'github_discovered' ? 'bg-amber-400' : 'bg-purple-400 animate-pulse'
                            }`} />
                            <span className="text-slate-300 truncate font-bold">{item.skillName}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={`px-1 rounded text-[8px] uppercase ${
                              item.action === 'compiled' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10' :
                              item.action === 'upgraded' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                              'bg-purple-500/10 text-purple-400 border border-purple-500/10'
                            }`}>
                              {item.action}
                            </span>
                            <span className="text-slate-500 text-[9px]">{item.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-[9px] font-mono text-slate-500 mt-2 text-center">
                    🟢 {lang === 'bn' ? 'সবগুলো কোড বেস এবং মডিউল সঠিকভাবে সিঙ্কড রয়েছে।' : 'All generated systems synchronized with local indexed database.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Categorized Learned Skills List */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-850 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                    {lang === 'bn' ? 'ক্যাটাগরি ভিত্তিক নিওরা স্কিলসমূহ' : 'CATEGORIZED ACTIVE NEORA SKILLS'}
                  </h4>
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'সার্চ স্কিল...' : 'Search skills...'}
                      value={skillsSearch}
                      onChange={(e) => setSkillsSearch(e.target.value)}
                      className="bg-slate-950/80 border border-slate-850 focus:border-cyan-500/50 rounded-lg pl-8 pr-3 py-1 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none w-full sm:w-44 font-sans"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <select
                    value={skillsCategoryFilter}
                    onChange={(e) => setSkillsCategoryFilter(e.target.value)}
                    className="bg-slate-950/80 border border-slate-850 rounded-lg px-2 py-1 text-[11px] text-slate-400 focus:outline-none font-mono"
                  >
                    <option value="ALL">ALL CATEGORIES</option>
                    <option value="Frontend Core">Frontend Core</option>
                    <option value="Multimodal Ingestion">Multimodal Ingestion</option>
                    <option value="OS Emulation Core">OS Emulation Core</option>
                    <option value="Self-Evolution">Self-Evolution Core</option>
                    <option value="GitHub Discovered">GitHub Discovered</option>
                  </select>
                </div>
              </div>

              {/* Grid of skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills
                  .filter(s => {
                    const matchesSearch = s.name.toLowerCase().includes(skillsSearch.toLowerCase()) || s.description.toLowerCase().includes(skillsSearch.toLowerCase());
                    const matchesCategory = skillsCategoryFilter === "ALL" || s.category === skillsCategoryFilter;
                    return matchesSearch && matchesCategory;
                  })
                  .map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-xl p-4 bg-slate-900/25 border border-slate-850/80 hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between space-y-3 hover:bg-slate-900/35 relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-950/80 border border-slate-800 text-cyan-400 uppercase tracking-wider">
                            {skill.category}
                          </span>
                          <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                            skill.complexity === 'Expert' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : skill.complexity === 'Intermediate' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-slate-850 text-slate-400'
                          }`}>
                            {skill.complexity}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-sans font-bold text-sm text-slate-100 transition-colors">
                            {skill.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {skill.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-500">LATENCY: <strong className="text-slate-300">{skill.latencyMs}ms</strong></span>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-bold text-[9px] tracking-wide">ACTIVE ON CORE</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
