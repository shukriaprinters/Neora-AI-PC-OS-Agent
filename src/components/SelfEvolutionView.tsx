import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Zap, Play, CheckCircle, RefreshCw, Layers, Terminal,
  HelpCircle, Eye, ChevronRight, FileCode, Sliders, AlertTriangle,
  Sparkles, Globe, Clipboard, Printer, DollarSign, Download, Plus, Trash
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
  const [activeSubTab, setActiveSubTab] = useState<'identity' | 'analysis' | 'protocol' | 'evolved'>('identity');
  
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

              </div>
            )}

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
          <span className="text-emerald-400 font-bold">{unlockedFeatures.length} / 3</span>
        </div>
        <div className="text-right">
          <span>COMPILER MATCH: </span>
          <span className="text-cyan-400 font-bold">100% OK</span>
        </div>
      </div>

    </div>
  );
}
