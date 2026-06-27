import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  Printer, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  Sparkles, 
  Code, 
  Cpu, 
  Layers, 
  Globe, 
  TrendingUp, 
  Coins, 
  Download, 
  Play, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  ShoppingBag, 
  ArrowUpRight,
  Sparkle
} from 'lucide-react';

interface EarningViewProps {
  lang: 'en' | 'bn';
}

interface DigitalProduct {
  id: string;
  name: string;
  category: 'Graphic Asset' | 'AI Assistant' | 'Web App' | '3D Game' | 'Automation Bot';
  price: number;
  sales: number;
  platform: 'CodeCanyon' | 'ThemeForest' | 'Envato Elements' | 'Steam' | 'Google Play';
  format: 'PSD / EPS' | 'React Code' | 'Python / Executable' | 'WebGL / C#';
  status: 'active' | 'generating';
}

export function EarningView({ lang }: EarningViewProps) {
  const t = TRANSLATIONS[lang];

  // Active Main Tab State
  const [subTab, setSubTab] = useState<'invoice' | 'monetization'>('monetization');

  // --- INVOICE BUILDER STATES ---
  const [invoice, setInvoice] = useState<Invoice>({
    id: 'inv-1',
    invoiceNumber: 'INV-2026-003',
    senderName: lang === 'bn' ? 'শুকরিয়া প্রিন্টার্স অ্যান্ড পাবলিশার্স' : 'Shukria Printers & Publishers',
    senderEmail: 'shukriaprinters@gmail.com',
    senderPhone: '+880-1712-XXXXXX',
    receiverName: 'Neora AI Developers Ltd',
    receiverEmail: 'accounts@neora.ai',
    receiverAddress: 'Level 14, Silicon Tower, Gulshan-2, Dhaka',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
    items: [
      { description: 'Banner Printing (Shukria printers high-gloss finish)', quantity: 15, rate: 120, amount: 1800 },
      { description: 'Neora AI System Layout Design & Branding', quantity: 1, rate: 850, amount: 850 }
    ],
    taxRate: 7.5,
    notes: lang === 'bn' ? 'শুকরিয়া প্রিন্টার্সে অর্ডার করার জন্য আপনাকে ধন্যবাদ।' : 'Thank you for your business. Invoices are payable within 15 days via bank transfer or mobile banking portal.'
  });

  const handleAddItem = () => {
    const defaultItem: InvoiceItem = { description: 'New Print / Dev Service Item', quantity: 1, rate: 100, amount: 100 };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, defaultItem]
    }));
  };

  const handleUpdateItem = (index: number, fields: Partial<InvoiceItem>) => {
    const updatedItems = [...invoice.items];
    const targetItem = { ...updatedItems[index], ...fields };
    targetItem.amount = (targetItem.quantity || 0) * (targetItem.rate || 0);
    updatedItems[index] = targetItem;
    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const handleUpdateMeta = (fields: Partial<Invoice>) => {
    setInvoice(prev => ({ ...prev, ...fields }));
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * (invoice.taxRate || 0)) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleTriggerPrint = () => {
    window.print();
  };


  // --- J.A.R.V.I.S. MONETIZATION STATE ENGINE ---
  const [products, setProducts] = useState<DigitalProduct[]>([
    { id: 'p-1', name: 'Shukria Premium Calendar Layout v3.0', category: 'Graphic Asset', price: 15, sales: 412, platform: 'Envato Elements', format: 'PSD / EPS', status: 'active' },
    { id: 'p-2', name: 'Neora AI Automated Order BOT', category: 'Automation Bot', price: 49, sales: 218, platform: 'CodeCanyon', format: 'Python / Executable', status: 'active' },
    { id: 'p-3', name: 'Corporate Printing ERP Web portal', category: 'Web App', price: 29, sales: 156, platform: 'ThemeForest', format: 'React Code', status: 'active' },
    { id: 'p-4', name: 'Space Cosmic Runner 3D Unity Game', category: '3D Game', price: 9, sales: 840, platform: 'Steam', format: 'WebGL / C#', status: 'active' }
  ]);

  const [liveSales, setLiveSales] = useState<Array<{ id: string; name: string; country: string; amount: number; time: string }>>([
    { id: 's-1', name: 'Neora Bot', country: 'Dhaka, BD', amount: 49, time: 'Just now' },
    { id: 's-2', name: 'Calendar EPS', country: 'London, UK', amount: 15, time: '3m ago' },
    { id: 's-3', name: 'ERP Portal', country: 'New York, US', amount: 29, time: '11m ago' },
    { id: 's-4', name: 'Cosmic Runner 3D', country: 'Berlin, DE', amount: 9, time: '24m ago' }
  ]);

  // Dynamic earnings accumulator
  const [totalEarnings, setTotalEarnings] = useState(12450.50);
  const [earningsRate, setEarningsRate] = useState(0.05); // $/sec passive increase

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalEarnings(prev => prev + earningsRate);
    }, 1500);
    return () => clearInterval(timer);
  }, [earningsRate]);

  // Trigger automated purchases periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const luckyProduct = products[Math.floor(Math.random() * products.length)];
      if (luckyProduct.status !== 'active') return;

      const locations = ['Chittagong, BD', 'Sydney, AU', 'Tokyo, JP', 'Toronto, CA', 'Paris, FR', 'Dubai, AE', 'Dhaka, BD'];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      
      const newSale = {
        id: 's-' + Date.now(),
        name: luckyProduct.name,
        country: loc,
        amount: luckyProduct.price,
        time: 'Just now'
      };

      setLiveSales(prev => [newSale, ...prev.slice(0, 3)]);
      setProducts(prev => prev.map(p => p.id === luckyProduct.id ? { ...p, sales: p.sales + 1 } : p));
      setTotalEarnings(prev => prev + luckyProduct.price);
    }, 12000);
    return () => clearInterval(timer);
  }, [products]);

  // App Creation Form States
  const [newAppName, setNewAppName] = useState('');
  const [newAppType, setNewAppType] = useState<'Graphic Asset' | 'AI Assistant' | 'Web App' | '3D Game' | 'Automation Bot'>('Web App');
  const [newAppPrice, setNewAppPrice] = useState(25);
  const [newAppPlatform, setNewAppPlatform] = useState<'CodeCanyon' | 'ThemeForest' | 'Envato Elements' | 'Steam' | 'Google Play'>('ThemeForest');

  const [isProductionRunning, setIsProductionRunning] = useState(false);
  const [productionProgress, setProductionProgress] = useState(0);
  const [productionLogs, setProductionLogs] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const handleSuggestName = () => {
    const designPrefixes = ['Shukria Elite', 'NeoPrint', 'PrintersFlow', 'CreativeGrid', 'CyanPrint'];
    const designSuffixes = ['Layout Pro', 'EPS Vector Kit', 'PSD Master Mockup', 'Corporate Template', 'Brochure Set'];
    
    const codePrefixes = ['JarvisFlow', 'OllamaBot', 'AnythingRAG', 'InterpreterCore', 'NeoraConnect'];
    const codeSuffixes = ['Automation Suite', 'AI Clerk Node', 'Engine Webpack', 'Desktop Autopilot', 'SaaS Platform'];

    const gamePrefixes = ['Cosmic', 'Pixel', 'Hyper', 'Unity', 'Retro'];
    const gameSuffixes = ['Adventure 3D', 'Runner Odyssey', 'Buster WebGL', 'Synth Arcade', 'Arena Pro'];

    if (newAppType === 'Graphic Asset') {
      const p = designPrefixes[Math.floor(Math.random() * designPrefixes.length)];
      const s = designSuffixes[Math.floor(Math.random() * designSuffixes.length)];
      setNewAppName(`${p} ${s} v1.0`);
    } else if (newAppType === '3D Game') {
      const p = gamePrefixes[Math.floor(Math.random() * gamePrefixes.length)];
      const s = gameSuffixes[Math.floor(Math.random() * gameSuffixes.length)];
      setNewAppName(`${p} ${s}`);
    } else {
      const p = codePrefixes[Math.floor(Math.random() * codePrefixes.length)];
      const s = codeSuffixes[Math.floor(Math.random() * codeSuffixes.length)];
      setNewAppName(`${p} ${s}`);
    }
  };

  const runJarvisProductionPipeline = () => {
    if (!newAppName.trim() || isProductionRunning) return;

    setIsProductionRunning(true);
    setProductionProgress(0);
    setProductionLogs([]);
    setActiveStepIndex(0);

    const steps = [
      {
        msg: "🧠 [Ollama / DeepSeek-R1] Scanning AnythingLLM Vector Store to analyze competitive market niche...",
        log: "-> Vector index query: 'Printing business automation SaaS & design assets BD'\n-> Found 14 matching products. Recommended pricing sweetspot identified."
      },
      {
        msg: "⚙️ [Claude Code Engine] Autonomous architectural draft: compiling layout directories, folder tree, and React schemas...",
        log: "-> Initializing package.json and vite.config.ts configuration files\n-> Writing high-fidelity modular code logic in /src/components..."
      },
      {
        msg: "💻 [Open Interpreter sandboxed script] Executing 'npm run build' to dry-run compile srv and check syntactical bugs...",
        log: "-> Running esbuild on custom entry point...\n-> Linter output: 100% green. Syntactical self-healing applied successfully."
      },
      {
        msg: "🎨 [Adobe Illustrator & Photoshop CMYK API] Compiling print-ready layers and vector coordinate paths...",
        log: "-> Setting resolution to 300 DPI, color-space to CMYK FOGRA39\n-> Exporting fully layered document as PSD & EPS format bundle..."
      },
      {
        msg: "📦 [n8n Automation loop] Compiling deployment wrappers and publishing installers into secure ZIP storage...",
        log: "-> Generating Windows binary setup file and local electron layout\n-> Verifying archive signature hash checksums... Done."
      },
      {
        msg: "🚀 [J.A.R.V.I.S. Market Node] Submitting product ZIP, vector templates, and code repos to marketplace APIs...",
        log: "-> Webhook payload transmitted to Envato/Steam vendor endpoints\n-> Status: Live! Catalog page generated on active domain."
      }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        setProductionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[currentIdx].msg}`, `[SYS] ${steps[currentIdx].log}`]);
        setActiveStepIndex(currentIdx + 1);
        setProductionProgress(Math.floor(((currentIdx + 1) / steps.length) * 100));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsProductionRunning(false);
        setActiveStepIndex(-1);

        // Add the newly created item to the active digital products
        const formats: Record<string, 'PSD / EPS' | 'React Code' | 'Python / Executable' | 'WebGL / C#'> = {
          'Graphic Asset': 'PSD / EPS',
          'AI Assistant': 'React Code',
          'Web App': 'React Code',
          '3D Game': 'WebGL / C#',
          'Automation Bot': 'Python / Executable'
        };

        const newProd: DigitalProduct = {
          id: 'p-' + Date.now(),
          name: newAppName,
          category: newAppType,
          price: newAppPrice,
          sales: 0,
          platform: newAppPlatform,
          format: formats[newAppType] || 'React Code',
          status: 'active'
        };

        setProducts(prev => [newProd, ...prev]);
        setNewAppName('');
        setEarningsRate(prev => prev + (newAppPrice * 0.005));

        // Insert sale notification instantly
        const successSale = {
          id: 's-init-' + Date.now(),
          name: newProd.name,
          country: 'Dhaka, BD',
          amount: newProd.price,
          time: 'Just now'
        };
        setLiveSales(prev => [successSale, ...prev.slice(0, 3)]);
        setTotalEarnings(prev => prev + newProd.price);
      }
    }, 2000);
  };


  return (
    <div id="earning-studio-container" className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* GLOBAL SUB-TABS SELECTOR */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-900 bg-slate-950 shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-mono font-bold tracking-wider text-slate-200">
              {lang === 'bn' ? 'নিওরা জারভিস: অর্থ উপার্জন ও আর্নিং হাব' : 'NEORA J.A.R.V.I.S. PASSIVE MONETIZATION ENGINE'}
            </h1>
            <span className="text-[10px] text-slate-500 font-mono">
              Total Live Passive Income Pool: <span className="text-emerald-400 font-bold">${totalEarnings.toFixed(2)}</span>
            </span>
          </div>
        </div>

        <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-xl gap-1">
          <button
            onClick={() => setSubTab('monetization')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${subTab === 'monetization' ? 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সফটওয়্যার ও গেম অটো-সেলিং' : 'J.A.R.V.I.S. Production Hub'}</span>
          </button>
          
          <button
            onClick={() => setSubTab('invoice')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${subTab === 'invoice' ? 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'শুকরিয়া প্রিন্টিং বিলিং' : 'Shukria Invoicing Sheet'}</span>
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC TAB CONTENT */}
      {subTab === 'monetization' ? (
        // ==========================================
        // Tab A: J.A.R.V.I.S. DIGITAL MONETIZATION HUB
        // ==========================================
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
          
          {/* LEFT SUB-PANEL: APP PLANNING AND PACKAGING FORM */}
          <div className="w-full xl:w-5/12 p-5 border-r border-slate-900 overflow-y-auto space-y-5 shrink-0">
            
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkle className="w-4 h-4 text-emerald-400 animate-spin" />
                {lang === 'bn' ? 'নতুন সফটওয়্যার ও গেম জেনারেটর' : 'AUTOPILOT APP & VECTOR DRAFTER'}
              </h2>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {lang === 'bn' 
                  ? 'নিওরা এআই কোডিং ইন্টারপ্রিটার, ফটোশপ মেটাডাটা ও n8n কানেক্টর ব্যবহার করে নিজে কোড লিখবে, ডিজাইন করবে এবং লাইভ সেল করার জন্য পাবলিশ করবে।'
                  : 'Designate software, games, and templates. Neora drafts coordinates, runs unit tests, resolves bugs, exports layers, and starts earning.'}
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl space-y-4">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-500 block border-b border-slate-800 pb-1.5">
                🎯 {lang === 'bn' ? 'ডিজিটাল এসেটের ধরন এবং প্যারামিটার' : 'PRODUCTION PARAMETERS'}
              </span>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 block uppercase">{lang === 'bn' ? 'প্রোডাক্ট ক্যাটাগরি' : 'Asset Category'}</label>
                  <select
                    value={newAppType}
                    onChange={(e: any) => setNewAppType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500/40"
                  >
                    <option value="Web App">{lang === 'bn' ? 'ওয়েব সাইট ও এ্যাপ (Web App)' : 'Web App / SaaS'}</option>
                    <option value="3D Game">{lang === 'bn' ? '৩ডি ভিডিও গেম (3D WebGL Game)' : '3D Unity Game'}</option>
                    <option value="Graphic Asset">{lang === 'bn' ? 'ফটোশপ/ইলাস্ট্রেটর ডিজাইন' : 'PSD / EPS Graphic Asset'}</option>
                    <option value="Automation Bot">{lang === 'bn' ? 'টেলিগ্রাম/হোয়াটসঅ্যাপ বট' : 'API Automation Bot'}</option>
                    <option value="AI Assistant">{lang === 'bn' ? 'লোকাল এআই এসিস্টেন্ট' : 'Ollama AI Assistant'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 block uppercase">{lang === 'bn' ? 'মার্কেটপ্লেস টার্গেট' : 'Target Market'}</label>
                  <select
                    value={newAppPlatform}
                    onChange={(e: any) => setNewAppPlatform(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500/40"
                  >
                    <option value="ThemeForest">ThemeForest (HTML/React)</option>
                    <option value="CodeCanyon">CodeCanyon (PHP/Python bots)</option>
                    <option value="Envato Elements">Envato Elements (Graphic Vector)</option>
                    <option value="Steam">Steam Market (Unity Games)</option>
                    <option value="Google Play">Google Play Store (Android)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-slate-400 block uppercase">{lang === 'bn' ? 'সফটওয়্যার / এসেটের নাম' : 'Digital Asset Name'}</label>
                  <button
                    onClick={handleSuggestName}
                    className="text-[9px] font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    {lang === 'bn' ? 'নাম সাজেস্ট করো' : 'J.A.R.V.I.S. Suggest'}
                  </button>
                </div>
                <input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমনঃ PrintersFlow SaaS ERP, Shukria Premium Calender...' : 'e.g. NeoPrint Automation Portal...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500/40"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span className="uppercase">{lang === 'bn' ? 'লাঞ্চ বিক্রয় মূল্য ($)' : 'LAUNCH LISTING PRICE ($)'}</span>
                  <span className="text-emerald-400 font-bold">${newAppPrice} USD</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={newAppPrice}
                  onChange={(e) => setNewAppPrice(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 cursor-pointer h-1.5 rounded"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500">
                  <span>$5 (Starter Asset)</span>
                  <span>$150 (Enterprise SaaS)</span>
                </div>
              </div>

              <button
                onClick={runJarvisProductionPipeline}
                disabled={isProductionRunning || !newAppName.trim()}
                className="w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 disabled:border-slate-800 disabled:text-slate-500 text-emerald-400 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className={`w-3.5 h-3.5 ${isProductionRunning ? 'animate-spin' : ''}`} />
                <span>
                  {isProductionRunning 
                    ? (lang === 'bn' ? 'জারভিস কোডিং ও কম্পাইল করছে...' : 'J.A.R.V.I.S. IS CODING & COMPILING...') 
                    : (lang === 'bn' ? 'স্বয়ংক্রিয় প্রডাকশন ও সেল লুপ চালান' : 'Trigger Autonomous Production & Sales')}
                </span>
              </button>
            </div>

            {/* LIVE SYSTEM STATUS STEPS */}
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl space-y-3.5">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-500 block border-b border-slate-800 pb-1.5">
                ⚙️ {lang === 'bn' ? 'জারভিস ৬-ধাপ কম্পাইলার প্রগ্রেস' : 'AUTOPILOT MULTI-AGENT STATUS CHECKS'}
              </span>

              <div className="space-y-2.5">
                {[
                  { title: lang === 'bn' ? '১. মার্কেট ও ভেক্টর অ্যানালাইসিস' : '1. Ollama Market & Niche Search', engine: 'Ollama Node' },
                  { title: lang === 'bn' ? '২. সোর্স কোড ও স্কিমা ড্রাফটিং' : '2. Claude Code Architecture', engine: 'Claude Code' },
                  { title: lang === 'bn' ? '৩. স্যান্ডবক্স কম্পাইল ও ডিবাগিং' : '3. Open Interpreter Auto-Tests', engine: 'Interpreter' },
                  { title: lang === 'bn' ? '৪. ফটোশপ ও ইলাস্ট্রেটর ভেক্টর' : '4. Photoshop layered PSD/EPS Design', engine: 'Adobe CMYK' },
                  { title: lang === 'bn' ? '৫. n8n প্যাকেজিং ও ইন্সটলার' : '5. n8n workflow zip packaging', engine: 'n8n core' },
                  { title: lang === 'bn' ? '৬. গ্লোবাল এপিআই মার্কেট লিস্টিং' : '6. Live API Publisher upload', engine: 'Marketplace' }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] border ${
                        activeStepIndex > idx 
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' 
                          : activeStepIndex === idx
                            ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 animate-pulse'
                            : 'border-slate-800 bg-slate-900/40 text-slate-500'
                      }`}>
                        {activeStepIndex > idx ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                      </div>
                      <span className={activeStepIndex === idx ? 'text-cyan-400 font-bold' : activeStepIndex > idx ? 'text-slate-300' : 'text-slate-500'}>
                        {step.title}
                      </span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                      activeStepIndex === idx 
                        ? 'border-cyan-500/20 bg-cyan-950/10 text-cyan-400' 
                        : activeStepIndex > idx
                          ? 'border-emerald-500/25 bg-emerald-950/10 text-emerald-400'
                          : 'border-slate-850 bg-slate-950 text-slate-500'
                    }`}>
                      {step.engine}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SUB-PANEL: MARKET MONITOR & LIVE SALES FEED */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            
            {/* Passive statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-2 right-2 p-1.5 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">{lang === 'bn' ? 'প্যাসিভ আয় (Cumulative)' : 'PASSIVE NET REVENUE'}</span>
                <span className="text-xl font-bold font-mono tracking-tight text-emerald-400 select-all block mt-1">
                  ${totalEarnings.toFixed(2)}
                </span>
                <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span>+{ (earningsRate * 40).toFixed(2) } USD / minute</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute top-2 right-2 p-1.5 bg-cyan-500/10 rounded-lg">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">{lang === 'bn' ? 'সক্রিয় মার্কেট লিস্টিং' : 'ACTIVE DIGITAL ASSETS'}</span>
                <span className="text-xl font-bold font-mono text-slate-200 block mt-1">{products.length} Products</span>
                <p className="text-[9px] text-slate-400 mt-2">Live on ThemeForest, Steam, Envato</p>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute top-2 right-2 p-1.5 bg-purple-500/10 rounded-lg">
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">{lang === 'bn' ? 'নিওরা গ্লোবাল র‍্যাঙ্কিং' : 'GLOBAL MARKET SHARE'}</span>
                <span className="text-xl font-bold font-mono text-purple-400 block mt-1">Top 1.5%</span>
                <p className="text-[9px] text-slate-400 mt-2">Envato Elite Author Badge Active</p>
              </div>
            </div>

            {/* LIVE MARKETPLACE ACTIVE LISTINGS */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block border-b border-slate-900 pb-1.5">
                🚀 {lang === 'bn' ? 'সরাসরি মার্কেটপ্লেসে থাকা আপনার ডিজিটাল প্রোডাক্টসমূহ' : 'ACTIVE EXPORTS & THEMEFOREST / CODECANYON STORES'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-850 hover:border-emerald-500/20 p-4 rounded-2xl transition-all space-y-3 flex flex-col justify-between group">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded uppercase">
                          {p.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {p.platform}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 font-mono group-hover:text-emerald-400 transition-colors leading-snug">
                        {p.name}
                      </h4>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-850 pt-2.5 font-mono text-[10px]">
                      <div className="space-y-0.5">
                        <span className="text-slate-500 text-[9px] uppercase">TOTAL SALES</span>
                        <div className="text-slate-200 font-bold flex items-center gap-1">
                          <span>{p.sales} purchases</span>
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="text-slate-500 text-[9px] uppercase">UNIT PRICE</span>
                        <span className="text-emerald-400 font-bold block">${p.price} USD</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* REAL-TIME GLOBAL SALES FEED TICKER */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block border-b border-slate-900/80 pb-1.5">
                🔔 {lang === 'bn' ? 'সরাসরি আর্নিং ট্র্যাকার এবং সেলস নোটিফিকেশন' : 'LIVE INTERNATIONAL SALES DISPATCH STREAM'}
              </span>

              <div className="space-y-2">
                {liveSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-900 rounded-xl font-mono text-xs hover:border-emerald-500/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <div>
                        <span className="text-slate-200 font-bold block">{sale.name}</span>
                        <span className="text-[9px] text-slate-500">Purchased in {sale.country}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-bold font-mono text-xs">+${sale.amount}</span>
                      <span className="text-[9px] text-slate-500 block">{sale.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE CONSOLE LOGS VIEW */}
            {isProductionRunning && (
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl font-mono text-[11px] space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-cyan-400 font-bold animate-pulse">⚡ J.A.R.V.I.S. INTERPRETER PRODUCTION PIPELINE IN PROGRESS...</span>
                  <span className="text-slate-500">{productionProgress}% COMPLETE</span>
                </div>
                
                <div className="space-y-1 max-h-40 overflow-y-auto leading-relaxed text-slate-400">
                  {productionLogs.map((log, index) => (
                    <div key={index} className={log.startsWith('[SYS]') ? 'text-slate-500 pl-4' : 'text-slate-300'}>
                      {log}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-cyan-400 animate-pulse text-[11px]">
                    <span>🤖 Open Interpreter compiling and writing layers...</span>
                    <div className="w-1.5 h-3 bg-cyan-400 animate-ping inline-block" />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        // ==========================================
        // Tab B: CORPORATE INVOICE BUILDER (Original)
        // ==========================================
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT PANEL: INVOICE META EDITORS */}
          <div id="invoice-editor-sidebar" className="w-full lg:w-5/12 p-5 border-r border-slate-900 overflow-y-auto space-y-5 shrink-0 print:hidden">
            <div>
              <h2 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1 bg-slate-900/40 p-2 border border-slate-850 rounded">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                {t.invoiceBuilder}
              </h2>
              <p className="text-[10px] text-slate-400">Generate fully customized, print-ready PDF invoices. Add custom items, VAT details, and export instantly.</p>
            </div>

            {/* Sender Credentials */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block border-b border-slate-800 pb-1">
                🏢 {t.senderDetails}
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                <input
                  id="inv-sender-name"
                  type="text"
                  placeholder="Publisher Name"
                  value={invoice.senderName}
                  onChange={(e) => handleUpdateMeta({ senderName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-emerald-500/40 font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="inv-sender-email"
                    type="email"
                    placeholder="Sender Email Address"
                    value={invoice.senderEmail}
                    onChange={(e) => handleUpdateMeta({ senderEmail: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-emerald-500/40 font-mono"
                  />
                  <input
                    id="inv-sender-phone"
                    type="text"
                    placeholder="Sender Phone Number"
                    value={invoice.senderPhone}
                    onChange={(e) => handleUpdateMeta({ senderPhone: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-emerald-500/40 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Client details */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block border-b border-slate-800 pb-1">
                👥 {t.receiverDetails}
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                <input
                  id="inv-receiver-name"
                  type="text"
                  placeholder="Client / Corporate Organization"
                  value={invoice.receiverName}
                  onChange={(e) => handleUpdateMeta({ receiverName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-emerald-500/40 font-mono"
                />
                <input
                  id="inv-receiver-email"
                  type="email"
                  placeholder="Client Contact Email"
                  value={invoice.receiverEmail}
                  onChange={(e) => handleUpdateMeta({ receiverEmail: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-emerald-500/40 font-mono"
                />
                <input
                  id="inv-receiver-addr"
                  type="text"
                  placeholder="Client Billing Address"
                  value={invoice.receiverAddress}
                  onChange={(e) => handleUpdateMeta({ receiverAddress: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-emerald-500/40 font-mono"
                />
              </div>
            </div>

            {/* Invoicing configuration */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
              <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 block border-b border-slate-800 pb-1">
                ⚙ INVOICING METADATA
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400">Invoice Number</label>
                  <input
                    id="inv-num"
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => handleUpdateMeta({ invoiceNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white uppercase outline-none focus:border-emerald-500/40 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400">Tax / VAT Rate (%)</label>
                  <input
                    id="inv-tax-rate"
                    type="number"
                    step="0.1"
                    value={invoice.taxRate}
                    onChange={(e) => handleUpdateMeta({ taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white font-mono outline-none focus:border-emerald-500/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400">Issue Date</label>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => handleUpdateMeta({ date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-300 font-mono outline-none focus:border-emerald-500/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400">DUE Date</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => handleUpdateMeta({ dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-300 font-mono outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: LIVE ENTERPRISE RENDERED PDF INVOICE SHEET */}
          <div id="invoice-preview-area" className="flex-1 p-6 overflow-y-auto bg-slate-900 border-l border-slate-900 flex flex-col items-center print:border-none print:bg-white print:p-0 print:overflow-hidden">
            
            {/* Export toolbar controller */}
            <div className="w-full max-w-2xl flex items-center justify-between mb-4 bg-slate-950 p-2.5 rounded border border-slate-850 print:hidden shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{t.previewInvoice}</span>
              </div>
              <button
                onClick={handleTriggerPrint}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded text-xs cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printInvoice}</span>
              </button>
            </div>

            {/* Corporate print sheet design layout */}
            <div id="print-sheet-paper" className="w-full max-w-2xl bg-white text-zinc-900 rounded-lg p-8 shadow-2xl flex flex-col justify-between font-sans text-xs min-h-[820px] print:shadow-none print:rounded-none print:p-4">
              
              <div className="space-y-6">
                {/* Header section banner */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-5">
                  <div>
                    <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900 uppercase">
                      {invoice.senderName}
                    </h1>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 font-bold">
                      📧 {invoice.senderEmail} | 📞 {invoice.senderPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block">TAX INVOICE</span>
                    <span className="text-sm font-mono font-bold text-slate-800 select-all block mt-1">{invoice.invoiceNumber}</span>
                  </div>
                </div>

                {/* Billing addresses split */}
                <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 pb-5 font-mono text-[10px] leading-relaxed">
                  <div className="space-y-1">
                    <span className="text-slate-400 uppercase tracking-wider font-bold">DATE OF ISSUE:</span>
                    <p className="text-slate-800 font-bold">{invoice.date}</p>
                    <span className="text-slate-400 uppercase tracking-wider font-bold block mt-3">PAYMENT DUE DATE:</span>
                    <p className="text-rose-600 font-bold">{invoice.dueDate}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 uppercase tracking-wider font-bold">CLIENT INFORMATION:</span>
                    <p className="text-slate-950 font-bold">{invoice.receiverName}</p>
                    <p className="text-slate-500">{invoice.receiverEmail}</p>
                    <p className="text-slate-500 truncate">{invoice.receiverAddress}</p>
                  </div>
                </div>

                {/* Editable worksheet line components */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold border-b border-slate-100 pb-1 block">
                    💼 {t.invoiceItems}
                  </span>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-[10px] font-mono text-slate-500 uppercase">
                        <th className="py-2 font-bold">Description</th>
                        <th className="py-2 text-center font-bold w-16">Qty</th>
                        <th className="py-2 text-right font-bold w-24">Unit Rate</th>
                        <th className="py-2 text-right font-bold w-28">Amount</th>
                        <th className="py-2 w-10 print:hidden text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {invoice.items.map((it, idx) => (
                        <tr key={idx} className="group hover:bg-neutral-50 print:hover:bg-transparent">
                          <td className="py-2.5">
                            <input
                              type="text"
                              value={it.description}
                              onChange={(e) => handleUpdateItem(idx, { description: e.target.value })}
                              className="w-full bg-transparent border-none py-1 focus:outline-none text-zinc-800 placeholder-zinc-400 text-xs font-sans print:p-0 font-medium"
                              placeholder="Line item description detail"
                            />
                          </td>
                          <td className="py-2.5 text-center">
                            <input
                              type="number"
                              value={it.quantity}
                              onChange={(e) => handleUpdateItem(idx, { quantity: parseInt(e.target.value) || 0 })}
                              className="w-12 bg-transparent border-none py-1 text-center font-mono focus:outline-none text-zinc-800 print:text-center text-xs"
                            />
                          </td>
                          <td className="py-2.5 text-right font-mono text-zinc-700">
                            <span className="text-zinc-400">$</span>
                            <input
                              type="number"
                              value={it.rate}
                              onChange={(e) => handleUpdateItem(idx, { rate: parseFloat(e.target.value) || 0 })}
                              className="w-20 bg-transparent border-none py-1 text-right font-mono focus:outline-none text-zinc-800 text-xs inline-block"
                            />
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-zinc-900">
                            ${(it.amount || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 print:hidden text-center">
                            <button
                              onClick={() => handleDeleteItem(idx)}
                              className="p-1 text-neutral-450 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add item row trigger button */}
                  <button
                    onClick={handleAddItem}
                    className="print:hidden w-full py-1.5 border border-dashed border-zinc-200 hover:border-zinc-400 rounded transition-colors text-[10px] font-mono text-zinc-500 hover:text-zinc-800 flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ADD WORK BILLING LINE ITEM</span>
                  </button>
                </div>
              </div>

              {/* Sum total parameters block panel */}
              <div className="mt-8 border-t border-zinc-200 pt-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="max-w-xs space-y-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">TERM AND CLIENT NOTES:</span>
                    <textarea
                      rows={2}
                      value={invoice.notes}
                      onChange={(e) => handleUpdateMeta({ notes: e.target.value })}
                      className="w-full bg-transparent border-none text-[10px] font-sans focus:outline-none text-zinc-500 leading-relaxed resize-none font-medium text-left print:p-0"
                    />
                  </div>
                  
                  {/* Financial columns */}
                  <div className="w-64 font-mono space-y-2 text-[10px] text-right">
                    <div className="flex justify-between">
                      <span className="text-zinc-550">Subtotal:</span>
                      <span className="text-zinc-800 font-bold">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>VAT / Tax ({invoice.taxRate}%):</span>
                      <span>+${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-250 pt-2 text-xs font-bold text-zinc-900 uppercase">
                      <span>Total Gross Due:</span>
                      <span className="text-sm text-emerald-600 font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Standard signatures and footer seals */}
                <div className="flex justify-between items-center text-[8px] text-zinc-400 font-mono pt-5 border-t border-zinc-100 bg-neutral-50/50 p-2 rounded leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>SYSTEM VERIFIED & TAX COMPLIANT</span>
                  </div>
                  <span>ISSUED VIA NEORA CLIENT BILLING PROV v2.0</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
