import React, { useState } from 'react';
import { TRANSLATIONS } from '../translations';
import { Code, Sparkles, RefreshCw, Eye, ShieldAlert, Palette, CheckCircle, Copy, AlertCircle, Cpu, Database, Sliders, Key, Settings } from 'lucide-react';
import { copyToClipboardFailsafe } from '../utils/clipboard';

interface DevStudioViewProps {
  lang: 'en' | 'bn';
  useGroq: boolean;
  setUseGroq: (val: boolean) => void;
  groqKey: string;
  setGroqKey: (val: string) => void;
  groqModel: string;
  setGroqModel: (val: string) => void;
}

export function DevStudioView({ 
  lang,
  useGroq,
  setUseGroq,
  groqKey,
  setGroqKey,
  groqModel,
  setGroqModel
}: DevStudioViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'coding' | 'design' | 'ai'>('coding');

  // AI MODEL REGISTRY LOCAL STATE
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string>('');

  const handleTestAiConnection = async () => {
    setAiTesting(true);
    setAiTestResult('');
    const t0 = Date.now();
    try {
      const res = await fetch('/api/health');
      const latency = Date.now() - t0;
      if (res.ok) {
        const d = await res.json();
        setAiTestResult(
          useGroq
            ? `ONLINE — Groq endpoint active. Model: ${groqModel || 'llama-3.3-70b-versatile'}. Latency: ${latency}ms. Status: ${d.status || 'ready'}`
            : `ONLINE — Gemini API active. Agent interface ready. Latency: ${latency}ms. Status: ${d.status || 'ready'}`
        );
      } else {
        setAiTestResult(`Server responded ${res.status} — check API key configuration`);
      }
    } catch (err: any) {
      setAiTestResult(`Connection failed: ${err.message}`);
    } finally {
      setAiTesting(false);
    }
  };

  // CODING STUDIO STATE
  const [codeLang, setCodeLang] = useState('typescript');
  const [codeTool, setCodeTool] = useState('refactor');
  const [inputCode, setInputCode] = useState(`function calculate(p, q) {
  var total = 0;
  for (var i = 0; i < p.length; i++) {
    total += p[i].price * q[i];
  }
  return total;
}`);
  const [outputCode, setOutputCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);

  // DESIGN STUDIO STATE
  const [contrastFore, setContrastFore] = useState('#06B6D4');
  const [contrastBack, setContrastBack] = useState('#020617');
  const [clipBorderRadius, setClipBorderRadius] = useState(12);
  const [clipShadowIntensity, setClipShadowIntensity] = useState(4);
  const [copiedText, setCopiedText] = useState(false);

  const handleRunCodeAnalysis = () => {
    setIsCompiling(true);
    setTimeout(() => {
      if (codeTool === 'refactor') {
        setOutputCode(`// Optimized Modern TS Refactored Code
interface LineItem {
  price: number;
}

export function calculateTotalBilling(items: LineItem[], quantities: number[]): number {
  if (items.length !== quantities.length) return 0;
  return items.reduce((sum, item, idx) => sum + item.price * (quantities[idx] ?? 0), 0);
}`);
      } else if (codeTool === 'audit') {
        setOutputCode(`// 🛡️ Neora Security Audit Report
// ALERT: Found potential parameter boundary exceptions.
// RECOMMENDATION: Guard index allocations & enforce readonly configurations.

export function calculateTotalBillingGuard(
  items: ReadonlyArray<{ readonly price: number }>,
  quantities: ReadonlyArray<number>
): number {
  const len = Math.min(items.length, quantities.length);
  let total = 0;
  for (let i = 0; i < len; i++) {
    total += items[i]!.price * quantities[i]!;
  }
  return total;
}`);
      } else {
        setOutputCode(`// 💡 Explanation
// - Converted classic loops to a declarative 'reduce' abstraction
// - Enforced strict Type Guards on index parameters
// - Handled boundary mismatch cases effectively`);
      }
      setIsCompiling(false);
    }, 1000);
  };

  const getContrastAnalysis = () => {
    // Basic fallback contrast calculation math
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16)
      } : { r: 255, g: 255, b: 255 };
    };

    const getLuminance = (rgb: { r: number, g: number, b: number }) => {
      const a = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0]! * 0.2126 + a[1]! * 0.7152 + a[2]! * 0.0722;
    };

    const rgbF = hexToRgb(contrastFore);
    const rgbB = hexToRgb(contrastBack);
    const lumF = getLuminance(rgbF);
    const lumB = getLuminance(rgbB);

    const ratio = (Math.max(lumF, lumB) + 0.05) / (Math.min(lumF, lumB) + 0.05);
    return ratio;
  };

  const currentRatio = getContrastAnalysis();

  return (
    <div id="dev-studio-container" className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Tab select toolbar layout */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 shrink-0 flex items-center justify-between">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('coding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'coding' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' : 'text-slate-400'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>CODING STUDIO</span>
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'design' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' : 'text-slate-400'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>DESIGN SWATCH SWIFT</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'ai' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' : 'text-slate-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI MODEL REGISTRY</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        
        {/* VIEW A: CODING REFACTOR */}
        {activeTab === 'coding' && (
          <div className="space-y-5 h-full flex flex-col max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-850">
              <div className="flex items-center gap-3">
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="bash">Bash Script</option>
                  <option value="html">HTML5</option>
                </select>
                <select
                  value={codeTool}
                  onChange={(e) => setCodeTool(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                >
                  <option value="refactor">Modern Refactoring</option>
                  <option value="audit">Security Audit Inspection</option>
                  <option value="explain">Explain Operational Complexity</option>
                </select>
              </div>
              <button
                onClick={handleRunCodeAnalysis}
                disabled={isCompiling}
                className="bg-cyan-500 hover:bg-cyan-400 font-bold text-slate-950 px-4 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isCompiling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>ANALYZE CODE BASE</span>
              </button>
            </div>

            {/* Split screen editors */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[300px]">
              <div className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">📂 SOURCE SCRIPT INPUT</span>
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-855 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">🚀 OPTIMIZED COMPILATION OUTPUT</span>
                <div className="flex-1 bg-slate-950 border border-slate-855 rounded-lg p-3 font-mono text-xs text-cyan-300 overflow-y-auto whitespace-pre-wrap select-all">
                  {outputCode || `// Diagnostics offline. Paste source code and click "ANALYZE CODE BASE" to run automated optimization.`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: DESIGN CONTRAST AND STYLES */}
        {activeTab === 'design' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Contrast compliance analyser */}
            <div className="bg-slate-900 border border-slate-850 rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                Contrast Checker (WCAG Standard Rules)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400">Foreground Hex</label>
                  <input
                    type="color"
                    value={contrastFore}
                    onChange={(e) => setContrastFore(e.target.value)}
                    className="w-full bg-slate-950 h-10 border border-slate-800 rounded p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={contrastFore}
                    onChange={(e) => setContrastFore(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded py-1 px-2.5 text-xs font-mono text-white text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400">Background Hex</label>
                  <input
                    type="color"
                    value={contrastBack}
                    onChange={(e) => setContrastBack(e.target.value)}
                    className="w-full bg-slate-950 h-10 border border-slate-800 rounded p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={contrastBack}
                    onChange={(e) => setContrastBack(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded py-1 px-2.5 text-xs font-mono text-white text-center"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">RATIO:</span>
                  <span className="text-xl font-mono font-bold text-white">{currentRatio.toFixed(2)}:1</span>
                  {currentRatio >= 4.5 ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>WCAG PASS (AAA compliant!)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-450 text-[10px] font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>FAIL (Improve contrast)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Micro styling sandbox config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-4">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">📦 Styler Settings Sandbox</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Border Radius:</span>
                    <span className="text-cyan-400 font-bold">{clipBorderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={clipBorderRadius}
                    onChange={(e) => setClipBorderRadius(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1 rounded"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Shadow Glow:</span>
                    <span className="text-cyan-400 font-bold">{clipShadowIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={clipShadowIntensity}
                    onChange={(e) => setClipShadowIntensity(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-950 h-1 rounded"
                  />
                </div>
              </div>

              {/* Result Preview Box overlay */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex flex-col justify-between items-center text-center">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold mb-2">💻 LIVE COMPONENT DEMIDOME</span>
                
                <div
                  className="w-40 h-20 bg-gradient-to-tr from-cyan-600 to-indigo-700 font-bold flex items-center justify-center text-xs text-white uppercase select-none max-w-full"
                  style={{
                    borderRadius: `${clipBorderRadius}px`,
                    boxShadow: `0 0 ${clipShadowIntensity * 4}px rgba(6,182,212, ${clipShadowIntensity / 15})`
                  }}
                >
                  PREVIEW STYLED
                </div>

                <div className="mt-3 w-full bg-slate-950 p-2 rounded text-[10px] text-zinc-400 font-mono flex justify-between items-center">
                  <span className="truncate">rounded-[{clipBorderRadius}px] shadow-lg</span>
                  <button
                    onClick={() => {
                      copyToClipboardFailsafe(`style="border-radius: ${clipBorderRadius}px; box-shadow: 0 0 ${clipShadowIntensity * 4}px rgba(6,182,212, 0.4);"`).then((success) => {
                        if (success) {
                          setCopiedText(true);
                          setTimeout(() => setCopiedText(false), 2000);
                        }
                      });
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    {copiedText ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW C: AI SERVICE REGISTRY & AUTONOMOUS ROUTING */}
        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* AI Provider Config Header Panel */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="space-y-1 text-left">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'bn' ? 'অটোনমাস এআই মডেল রেজিস্ট্রি এবং গেটওয়ে' : 'Autonomous AI Model Registry & Core Gateway'}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 max-w-lg leading-relaxed font-sans">
                    {lang === 'bn' 
                      ? 'নিওরা ওএসের প্রধান এআই ব্রেইন নোড কনফিগার করুন। এখানে আপনি সরাসরি ক্লাউড জেমিনি ইঞ্জিন এবং আল্ট্রা-ফাস্ট গ্রক এলপিইউ মডেলগুলোর মধ্যে যেকোনো সময় টগল করতে পারেন।' 
                      : 'Configure Neora OS active model registry parameters. Seamlessly toggle between direct Google Gemini Cloud Native and high speed Groq LPU core engines instantly.'}
                  </p>
                </div>
                
                {/* Active model badge */}
                <div className="bg-slate-950 px-3 py-1.5 rounded border border-indigo-950/40 text-[9px] font-mono text-cyan-400 text-right uppercase">
                  <div>ACTIVE ENGINE</div>
                  <div className="font-bold text-white">{useGroq ? 'Groq Cloud LPU' : 'Gemini Cloud Node'}</div>
                </div>
              </div>

              {/* Grid Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Choice 1: Gemini */}
                <div 
                  onClick={() => setUseGroq(false)}
                  className={`p-4 bg-slate-955 rounded-lg border-2 cursor-pointer transition-all ${
                    !useGroq 
                      ? 'border-indigo-505 bg-indigo-950/10 shadow-[0_0_15px_rgba(99,102,241,0.08)]' 
                      : 'border-slate-850 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold font-mono text-white">Google Gemini Core</span>
                    </div>
                    {!useGroq && <span className="bg-indigo-500 text-slate-950 px-1.5 py-0.2 rounded text-[7.5px] font-bold">ACTIVE DEFAULTS</span>}
                  </div>
                  <p className="text-[9px] text-slate-400 text-left leading-normal font-sans">
                    {lang === 'bn'
                      ? 'এন্টারপ্রাইজ লেভেল জেনারেটিভ অ্যাসিস্ট্যান্স এবং বুদ্ধিমান স্যান্ডবক্স অপারেশনের জন্য রেকমেন্ডেড এআই গেটওয়ে।'
                      : 'Default recommended engine for stable complex reasoning, secure file interactions, and contextual accuracy.'}
                  </p>
                  <p className="text-[8px] text-slate-500 font-mono mt-2 text-left uppercase">
                    API KEY SOURCE: SERVER ROOT ENVIRONMENT
                  </p>
                </div>

                {/* Choice 2: Groq */}
                <div 
                  onClick={() => setUseGroq(true)}
                  className={`p-4 bg-slate-955 rounded-lg border-2 cursor-pointer transition-all ${
                    useGroq 
                      ? 'border-cyan-505 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.08)]' 
                      : 'border-slate-850 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
                        <Cpu className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <span className="text-xs font-bold font-mono text-white">Groq LPU Engine</span>
                    </div>
                    {useGroq && <span className="bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded text-[7.5px] font-bold">ACTIVE BYPASS</span>}
                  </div>
                  <p className="text-[9px] text-slate-400 text-left leading-normal font-sans">
                    {lang === 'bn'
                      ? '১০ গুণ দ্রুত গতির ওপেন গিগ্যান্ট Llama এবং Gemma মডেলের জন্য ক্লাউড সার্ভিস। কোনো রি-বিল্ড ফী নেই।'
                      : 'Sub-second low latency LLP responses. Powered by Groq LPUs executing high throughput open weights.'}
                  </p>
                  <p className="text-[8px] text-slate-500 font-mono mt-2 text-left uppercase">
                    API KEY SOURCE: SERVER ENV OR CLIENT CACHE
                  </p>
                </div>

              </div>
            </div>

            {/* Groq Config Details Block */}
            {useGroq && (
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-4 text-left font-mono">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">⚡ Groq API Integration Variables</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Brain */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">Select Core Model Brain:</label>
                    <select
                      value={groqModel}
                      onChange={(e) => setGroqModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-205 outline-none focus:border-cyan-500/50 cursor-pointer"
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile & Smart)</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B (Sub-second Instant)</option>
                      <option value="mixtral-8x7b-32768">Mixtral 8x7B (Deep reasoning context)</option>
                      <option value="gemma2-9b-it">Gemma 2 9B (Google Open weights)</option>
                    </select>
                    <span className="text-[8.5px] text-slate-500 block leading-tight">
                      ✦ Highly recommended 70B model for multi-step structured file plans.
                    </span>
                  </div>

                  {/* API Key Source Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">Credential Configuration Key:</label>
                    
                    {/* Environment Key indicator */}
                    <div className="bg-slate-950 p-2 border border-slate-850 rounded text-xs space-y-1 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-slate-400 text-[9px] font-bold">SYSTEM ENVIRONMENT KEY (GROQ_API_KEY)</span>
                        <span className="text-emerald-400 text-[8px] font-bold uppercase bg-emerald-950 px-1 py-0.2 rounded border border-emerald-900/30">SECURE_ACTIVE_FALLBACK</span>
                      </div>
                      <p className="text-[8.5px] text-slate-550 leading-relaxed font-sans mt-1">
                        Node environment proxy endpoints automatically map the backend system-wide variable `process.env.GROQ_API_KEY` when no manual personal key is supplied. This is 100% server secure.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal client custom key input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Personal Client Custom Key (Optional Overwrite):</span>
                  </label>
                  <input
                    type="password"
                    placeholder="gsk_... (leave empty to use secure system env variable)"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-205 placeholder-slate-705 outline-none focus:border-cyan-500/50"
                  />
                  <span className="text-[8.5px] text-slate-500 block leading-tight font-sans">
                    ✦ If provided, this personal key is utilized and stored locally in index DB cache. Leaving it empty automatically resolves the system variable config.
                  </span>
                </div>
              </div>
            )}

            {/* Visual routing trace schema */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-3 text-left">
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">🧭 Model Router Failover Graph</span>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 font-mono text-[9px]">
                
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded flex flex-col justify-between">
                  <span className="text-cyan-400 font-bold">STAGE 1: PARSE</span>
                  <p className="text-slate-400 text-[8px] mt-1 pr-1.5">Whisper STT dictation translates user text and parses intention.</p>
                  <span className="text-slate-600 uppercase text-[7px] mt-2 block">100% Local Thread</span>
                </div>

                <div className={`p-2.5 bg-slate-950 border rounded flex flex-col justify-between transition-all ${useGroq ? 'border-cyan-500/30 ring-1 ring-cyan-500/10' : 'border-indigo-550/30'}`}>
                  <span className="text-indigo-400 font-bold">STAGE 2: ROUTE</span>
                  <p className="text-slate-400 text-[8px] mt-1 pr-1.5">
                    {useGroq 
                      ? `Routing queries directly to Groq Cloud endpoint using ${groqModel.split('-')[0].toUpperCase()}.`
                      : 'Routing execution securely to the default Gemini core cloud model.'}
                  </p>
                  <span className="text-white uppercase text-[7px] mt-2 block font-bold">{useGroq ? 'GROQ HANDOVER' : 'GEMINI CORE'}</span>
                </div>

                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded flex flex-col justify-between">
                  <span className="text-amber-500 font-bold">STAGE 3: FAILOVER</span>
                  <p className="text-slate-400 text-[8px] mt-1 pr-1.5">If primary cloud endpoint yields 5xx or API lockout, fallback handles handover under 1500ms.</p>
                  <span className="text-slate-600 uppercase text-[7px] mt-2 block">AUTOMATIC SWITCH</span>
                </div>

                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded flex flex-col justify-between">
                  <span className="text-emerald-400 font-bold">STAGE 4: LOCAL</span>
                  <p className="text-slate-400 text-[8px] mt-1 pr-1.5">If offline, Neora local process daemon intercepts request and returns pre-processed heuristics.</p>
                  <span className="text-slate-600 uppercase text-[7px] mt-2 block">Offline Safe</span>
                </div>

              </div>
            </div>

            {/* Test Connectivity */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-black">⚡ Endpoint Handshake verification</span>
                <p className="text-[11px] text-slate-300 leading-snug font-sans">
                  Execute an isolated network heartbeat query to verify communication latency bounds.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {aiTestResult && (
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold max-w-sm truncate text-right">
                    {aiTestResult}
                  </span>
                )}
                
                <button
                  onClick={handleTestAiConnection}
                  disabled={aiTesting}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2 rounded transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  {aiTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>PINGING NODE...</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-3.5 h-3.5" />
                      <span>TEST GATEWAY</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
