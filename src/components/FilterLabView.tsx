import React, { useState } from 'react';
import { TRANSLATIONS } from '../translations';
import {
  Filter, Sparkles, Layers, Shield, Flame, Activity, Gauge, RotateCcw,
  AlertCircle, CheckCircle2, Heart, TrendingUp, Leaf, Compass, ArrowRight, Info, Settings
} from 'lucide-react';

interface FilterLabViewProps {
  lang: 'en' | 'bn';
}

export function FilterLabView({ lang }: FilterLabViewProps) {
  const t = TRANSLATIONS[lang];
  const isEn = lang === 'en';

  // State for the interactive physical simulator
  const [grindSize, setGrindSize] = useState<number>(350); // in microns (100 to 800)
  const [plungePressure, setPlungePressure] = useState<number>(2.5); // bar (1.0 to 5.5)
  const [meshCount, setMeshCount] = useState<number>(350); // mesh count (100 to 600)
  const [paperActive, setPaperActive] = useState<boolean>(false);
  const [selectedVessel, setSelectedVessel] = useState<'P5' | 'P6'>('P5');

  // State for the Improvement sandbox
  const [upgrades, setUpgrades] = useState({
    graphene: false,
    magnetic: false,
    activeValve: false,
    aerogel: false,
    chitinInterlayer: false,
  });

  const toggleUpgrade = (key: keyof typeof upgrades) => {
    setUpgrades(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSimulator = () => {
    setGrindSize(350);
    setPlungePressure(2.5);
    setMeshCount(350);
    setPaperActive(false);
    setSelectedVessel('P5');
  };

  // PHYSICS SIMULATOR CALC_MODELS (Based on research metrics)
  // 1. Particulate Bypass Coefficient (percent of fines passing through)
  const calculateBypass = () => {
    let base = 5.0; // standard French press is around 5.0%

    // Mesh count reduces bypass
    const meshFactor = (600 - meshCount) / 500; // 0 to 1
    base *= (0.1 + 0.9 * meshFactor);

    // Fine grinds increase bypass, coarse grinds reduce it
    if (grindSize < 250) {
      base *= (3.5 - (grindSize - 100) / 75);
    } else {
      base *= Math.max(0.02, 1.2 - (grindSize - 250) / 450);
    }

    // High plunge pressure forces particles through
    if (plungePressure > 3.0) {
      base *= (1.0 + (plungePressure - 3.0) * 0.4);
    }

    // Paper filter drastically cuts bypass
    if (paperActive) {
      base *= 0.05; // 95% reduction
    }

    // Apply active upgrades
    if (upgrades.graphene) base *= 0.7; // smoother flow, better retention
    if (upgrades.activeValve) base *= 0.1; // complete seal at bottom
    
    return Math.min(6.5, Math.max(0.002, base));
  };

  // 2. Diterpene (Cafestol & Kahweol) Lipid Retention (%)
  const listRetentionLipids = () => {
    let base = 2.0; // traditional mesh captures almost no coffee oils/lipids (~2%)
    if (paperActive) {
      base = 98.4; // standard double-filter paper captures 98.4%
    } else {
      // Mesh density captures some micro-globules of oils dragging particles
      base += (meshCount / 100) * 1.5;
    }

    if (upgrades.chitinInterlayer) {
      base = 99.8; // Chitin binds lipids electrostatically
    }
    return Math.min(100, Math.max(0, base));
  };

  // 3. Extraction Halt Velocity (seconds to achieve absolute thermal/chemical isolation)
  const calculateHaltSpeed = () => {
    let base = 120; // traditional mesh doesn't halt (infinity/slow diffusion: 120s+)
    
    // Higher mesh density halts quicker
    base -= (meshCount / 600) * 40;

    // Plunge pressure forces seal snugness
    base -= (plungePressure / 5.5) * 30;

    if (upgrades.activeValve) {
      base = 1.2; // instant check-valve cutoff
    } else if (upgrades.magnetic) {
      base *= 0.6; // snugger seated lock
    }

    return Math.max(1.0, base);
  };

  // 4. Thermal Insulation Efficiency Rate (deg-C temperature drop per minute)
  const calculateThermalLeak = () => {
    let baseRate = selectedVessel === 'P5' ? 0.95 : 0.08; // P5 glass collar vs P6 vacuum insulation (0.08 C/min)
    
    if (upgrades.aerogel && selectedVessel === 'P6') {
      baseRate = 0.015; // Silica Aerogel increases insulation vastly
    } else if (upgrades.aerogel && selectedVessel === 'P5') {
      baseRate = 0.65; // aerogel collar helps glass standard
    }
    return baseRate;
  };

  // 5. Overall Flavor Clarity Index (0 to 100)
  const calculateFlavorClarity = () => {
    const bypass = calculateBypass();
    const lipids = listRetentionLipids();
    
    let score = 50;
    // Lower bypass = higher clarity
    score += (6.5 - bypass) * 6.5;

    // Balance lipids - pour over enthusiasts love paper-clear, immersion lovers love rich body
    if (paperActive) {
      score += 10; // Clean profile
    } else {
      score += 4; // Bold profile
    }

    if (upgrades.graphene) score += 5;
    if (upgrades.activeValve) score += 5;

    return Math.min(100, Math.max(10, score));
  };

  // Simulation values
  const bypass = calculateBypass();
  const lipidRetention = listRetentionLipids();
  const haltSpeed = calculateHaltSpeed();
  const thermalLeak = calculateThermalLeak();
  const clarity = calculateFlavorClarity();

  // UPGRADE METRIC IMPACTS (BASELINE VS UPGRADED) Let's show visual comparison
  const getSimulatedIndex = (metric: 'particulate' | 'cutoff' | 'flow' | 'thermal' | 'selfcleaning' | 'bio') => {
    let base = 50;
    switch (metric) {
      case 'particulate':
        base += (meshCount / 600) * 20 + (paperActive ? 20 : 0);
        if (upgrades.graphene) base += 5;
        if (upgrades.activeValve) base += 20;
        if (upgrades.chitinInterlayer) base += 5;
        break;
      case 'cutoff':
        base += (600 - haltSpeed) / 10;
        if (upgrades.activeValve) base += 45;
        if (upgrades.magnetic) base += 10;
        break;
      case 'flow':
        base += 30 - (meshCount / 30) - (paperActive ? 15 : 0);
        if (upgrades.graphene) base += 25; // Graphene reduces friction/clogging
        if (upgrades.activeValve) base += 5;
        break;
      case 'thermal':
        base = selectedVessel === 'P6' ? 90 : 40;
        if (upgrades.aerogel) base += selectedVessel === 'P6' ? 9 : 25;
        break;
      case 'selfcleaning':
        base = 25;
        if (upgrades.graphene) base += 65; // superhydrophobic mesh
        if (upgrades.magnetic) base += 10; // fewer crevices
        break;
      case 'bio':
        base = paperActive ? 60 : 95; // paper is waste but compostable
        if (upgrades.chitinInterlayer) base += 15; // ultra biodegradable chitin
        break;
    }
    return Math.min(100, Math.max(5, base));
  };

  return (
    <div id="filter-lab-container" className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Title banner */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-5 shrink-0 flex items-center justify-between select-none">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-lg font-bold text-white font-sans uppercase tracking-wide">
              {isEn ? "P-5 & P-6 Engineering Research Center" : "পি-৫ ও পি-৬ ফিল্টার রিচার্স সেন্টার"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isEn 
              ? "Deep technical specification auditing, material science analysis & advanced improvement sandbox" 
              : "উন্নত প্রযুক্তিগত স্পেসিফিকেশন অডিটিং, মেটালার্জিকাল অ্যানালিসিস এবং আধুনিক ইমপ্রুভমেন্ট ল্যাব"}
          </p>
        </div>
        <div id="vessel-selector" className="flex gap-2 bg-slate-950/80 p-1 border border-slate-800 rounded-md">
          <button
            onClick={() => setSelectedVessel('P5')}
            className={`px-3 py-1 text-xs font-bold font-mono rounded transition-all cursor-pointer ${
              selectedVessel === 'P5' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400'
            }`}
          >
            ESPRO P5 (GLASS)
          </button>
          <button
            onClick={() => setSelectedVessel('P6')}
            className={`px-3 py-1 text-xs font-bold font-mono rounded transition-all cursor-pointer ${
              selectedVessel === 'P6' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400'
            }`}
          >
            ESPRO P6 (VACUUM SS)
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-5 space-y-8 w-full">
        
        {/* SECTION 1: CRITICAL RECOVERED RESEARCH */}
        <section id="research-specs" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {isEn ? "Recovered Research & Core Technical Specifications" : "উদ্ধারকৃত গবেষণা এবং জটিল টেকনিক্যাল স্পেসিফিকেশন"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Basket 1 Card */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-lg p-4 space-y-3 shadow-md hover:border-slate-800 transition-all">
              <div className="flex justify-between items-start">
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                  STAGE 1 FILTER
                </span>
                <span className="text-[10px] text-slate-500 font-mono">9x Finer</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Outer Strainer Basket</h3>
              <ul className="text-xs text-slate-400 space-y-2 font-mono">
                <li>• <strong className="text-slate-300">Aperture Rating:</strong> 200 Mesh (~74μm)</li>
                <li>• <strong className="text-slate-300">Material Science:</strong> SUS 304 Surgical Stainless Steel</li>
                <li>• <strong className="text-slate-300">Structural Web:</strong> Glass-reinforced Copolymer PP</li>
                <li>• <strong className="text-slate-300">Primary Function:</strong> Intercepts 92% of coarse and medium grinds, shielding the inner stage from premature blinding.</li>
              </ul>
            </div>

            {/* Basket 2 Card */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-lg p-4 space-y-3 shadow-md hover:border-slate-800 transition-all">
              <div className="flex justify-between items-start">
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                  STAGE 2 FILTER
                </span>
                <span className="text-[10px] text-slate-500 font-mono">12x Finer</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Inner Silt Refiner Basket</h3>
              <ul className="text-xs text-slate-400 space-y-2 font-mono">
                <li>• <strong className="text-slate-300">Aperture Rating:</strong> ~500 Mesh (~30μm)</li>
                <li>• <strong className="text-slate-300">Safety Lock:</strong> Bayonet-style interlocking twist latch</li>
                <li>• <strong className="text-slate-300">Material Science:</strong> SUS 316 Acid-Resistant Steel</li>
                <li>• <strong className="text-slate-300">Primary Function:</strong> Polishes micro-fines and insoluble fibers. Sandwiches paper disc option between stages.</li>
              </ul>
            </div>

            {/* Material Science & Patented Seals Card */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-lg p-4 space-y-3 shadow-md hover:border-slate-800 transition-all">
              <div className="flex justify-between items-start">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                  FLUIDIC BOUNDARY
                </span>
                <span className="text-[10px] text-emerald-500 font-mono">Double Lip</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Patented Double-Lip Wall Gasket</h3>
              <ul className="text-xs text-slate-400 space-y-2 font-mono">
                <li>• <strong className="text-slate-300">Elastomer:</strong> Platinum-cured high-temp silicone</li>
                <li>• <strong className="text-slate-300">Dynamic Shape:</strong> Twin flexible squeegee flaps</li>
                <li>• <strong className="text-slate-300">Bypass Sluice:</strong> Absolute 0% grind bypass</li>
                <li>• <strong className="text-slate-300">Over-Extraction Stop:</strong> Compacts grounds into a physical dead-space at bottom, shutting down diffusion.</li>
              </ul>
            </div>

          </div>
        </section>

        {/* SECTION 2: INTERACTIVE PHYSICAL SIMULATOR */}
        <section id="simulator-sandbox" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/20 border border-slate-900 p-6 rounded-xl shadow-lg">
          
          {/* Left panel: Sliders / Inputs (5-cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  {isEn ? "Kinetic Simulator Inputs" : "কাইনেটিক সিমুলেটর ইনপুটস"}
                </h2>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {isEn ? "Adjust brew parameters to model fluid dynamics on the micro-meshes" : "লিকুইড ডাইনামিক্স পরিমাপের জন্য ব্রুয়িং প্যারামিটার পরিবর্তন করুন"}
              </p>
            </div>

            {/* Grind Size Slider */}
            <div className="space-y-2 bg-slate-950/50 p-3 rounded border border-slate-900">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">{isEn ? "Coffee Grind Size:" : "কফি গ্রাইন্ড সাইজ:"}</span>
                <span className="text-cyan-400 font-bold">{grindSize} μm (Microns)</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="25"
                value={grindSize}
                onChange={(e) => setGrindSize(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>100μm (Super Fine)</span>
                <span>400μm (Medium)</span>
                <span>800μm (Coarse)</span>
              </div>
            </div>

            {/* Plunge Pressure */}
            <div className="space-y-2 bg-slate-950/50 p-3 rounded border border-slate-900">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">{isEn ? "Plunge Downward Force:" : "প্লাঞ্জ প্রবেশ চাপ:"}</span>
                <span className="text-cyan-400 font-bold">{plungePressure.toFixed(1)} Bar</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.5"
                step="0.1"
                value={plungePressure}
                onChange={(e) => setPlungePressure(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>1.0 Bar (Smooth/Slow)</span>
                <span>3.0 Bar (Standard)</span>
                <span>5.5 Bar (Extrusion Risk)</span>
              </div>
            </div>

            {/* Mesh density count */}
            <div className="space-y-2 bg-slate-950/50 p-3 rounded border border-slate-900">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">{isEn ? "Stage-2 Mesh Density:" : "স্টেজ-২ জাল ঘনত্ব:"}</span>
                <span className="text-cyan-400 font-bold">{meshCount} Mesh</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="50"
                value={meshCount}
                onChange={(e) => setMeshCount(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>100 Mesh (Wide)</span>
                <span>350 Mesh (ESPRO Standard)</span>
                <span>600 Mesh (Ultra Density)</span>
              </div>
            </div>

            {/* Interlayer Paper Active */}
            <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded border border-slate-900">
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono font-bold text-slate-300">
                  {isEn ? "Sandwich Cellulose Paper Filter" : "সেলুলোজ পেপার ফিল্টার ইন্টারলেয়ার"}
                </div>
                <p className="text-[10px] text-slate-500">
                  {isEn ? "Inserts standard paper disk between baskets for lipid adsorption" : "ভোজ্য লিপিড শোষণের জন্য ঝুড়ির মাঝে কাগজের ডিস্ক সংযুক্ত করুন"}
                </p>
              </div>
              <button
                onClick={() => setPaperActive(!paperActive)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  paperActive ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  paperActive ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <button
              onClick={resetSimulator}
              className="w-full flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 py-2 rounded text-xs font-mono font-bold transition-all text-slate-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? "RESET SIMULATOR" : "সিমুলেটর রিসেট করুন"}</span>
            </button>
          </div>

          {/* Right panel: Real-time gauges and Chart (7-cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Real-time calculated gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Gauge 1: Bypass */}
              <div className="bg-slate-950/60 p-4 rounded border border-slate-900 flex items-center gap-4">
                <div className="p-3 bg-red-500/5 text-red-500 border border-red-500/10 rounded-lg shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                    {isEn ? "PARTICULATE BYPASS" : "পার্টিক্যুলেট বাইপাস"}
                  </div>
                  <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
                    <span>{bypass.toFixed(3)}%</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (bypass / 6.5) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Gauge 2: Lipid (Cafestol) retention */}
              <div className="bg-slate-950/60 p-4 rounded border border-slate-900 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 rounded-lg shrink-0">
                  <Heart className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                    {isEn ? "DITERPENE LIPID RETENTION" : "ডাইটারপিন লিপিড ফিল্টারিং"}
                  </div>
                  <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
                    <span>{lipidRetention.toFixed(1)}%</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${lipidRetention}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Gauge 3: Halt delay */}
              <div className="bg-slate-950/60 p-4 rounded border border-slate-900 flex items-center gap-4">
                <div className="p-3 bg-blue-500/5 text-blue-500 border border-blue-500/10 rounded-lg shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                    {isEn ? "EXTRACTION HALT DELAY" : "এক্সট্রাকশন বন্ধের সময়কাল"}
                  </div>
                  <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
                    <span>{haltSpeed.toFixed(1)}s</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (haltSpeed / 120) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Gauge 4: Dynamic Flavor score */}
              <div className="bg-slate-950/60 p-4 rounded border border-slate-900 flex items-center gap-4">
                <div className="p-3 bg-cyan-500/5 text-cyan-500 border border-cyan-500/10 rounded-lg shrink-0">
                  <Gauge className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                    {isEn ? "FLAVOR CLARITY INDEX" : "স্বাদের বিশুদ্ধতা ইনডেক্স"}
                  </div>
                  <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
                    <span>{clarity.toFixed(0)}/100</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-300"
                      style={{ width: `${clarity}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* HIGH FIDELITY GLOWING SCIENTIFIC SVG PLOTS */}
            <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-900 space-y-4">
              <div className="flex justify-between items-center select-none">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-cyan-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{isEn ? "Bypass Retention Spectrum Chart" : "পার্টিক্যুলেট রিটেনশন কার্ভ চার্ট"}</span>
                </div>
                <div className="flex gap-3 text-[8px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-slate-600 block"></span>Traditional Press</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-cyan-400 block"></span>ESPRO Double Micro-mesh</span>
                </div>
              </div>

              {/* Pure SVG Graph representing particulate distribution bypass */}
              <div className="relative w-full h-32 bg-slate-950 rounded border border-slate-900/60 p-1">
                <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="125" y1="0" x2="125" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="250" y1="0" x2="250" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="375" y1="0" x2="375" y2="120" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Curve 1: Traditional Standard Mesh (Very poor filtration under 150 microns) */}
                  <path
                    d="M 0,20 C 50,22 100,25 150,45 C 200,60 250,85 500,105"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />

                  {/* Curve 2: ESPRO active curve (based on slider values) */}
                  <path
                    d={`M 0,${Math.min(115, Math.max(10, 115 - (6.5 / bypass) * 15))} 
                       C 100,${Math.min(115, 110 - (meshCount/200) * 10)} 
                       200,${paperActive ? 118 : 110} 
                       350,118 
                       500,119`}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    className="transition-all duration-500"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0px 0px 4px rgba(6, 182, 212, 0.4))" }}
                  />

                  {/* Labels on axis */}
                  <text x="5" y="115" fill="#64748b" className="text-[7px] font-mono">0μm</text>
                  <text x="125" y="115" fill="#64748b" className="text-[7px] font-mono">50μm</text>
                  <text x="250" y="115" fill="#64748b" className="text-[7px] font-mono">100μm</text>
                  <text x="375" y="115" fill="#64748b" className="text-[7px] font-mono">150μm</text>
                  <text x="475" y="115" fill="#64748b" className="text-[7px] font-mono">200μm+</text>

                  <text x="5" y="15" fill="#ef4444" className="text-[7px] font-mono">Bypass 100%</text>
                  <text x="5" y="55" fill="#e2e8f0" className="text-[7px] font-mono">5%</text>
                  <text x="5" y="95" fill="#06d6a0" className="text-[7px] font-mono">0% Bypass</text>
                </svg>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono italic">
                <span>{isEn ? "* Note dynamic shift when Paper Interlayer and Mesh Density are altered." : "* পেপার ইন্টারলেয়ার এবং জালের ঘনত্ব পরিবর্তন করার সাথে পরিবর্তন লক্ষ্য করুন।"}</span>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: COMPREHENSIVE 5-STAGE ENGINEERING IMPROVEMENT PLAN */}
        <section id="improvement-plan" className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-2 select-none">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {isEn ? "Advanced 5-Stage Engineering Improvement Plan" : "উন্নত ৫-পর্যায়ের মেকানিক্যাল ইমপ্রুভমেন্ট প্ল্যান"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Stage 1 Option */}
            <button
              onClick={() => toggleUpgrade('graphene')}
              className={`p-4 rounded-lg border text-left flex flex-col justify-between h-56 transition-all shadow cursor-pointer focus:outline-none ${
                upgrades.graphene 
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-slate-500 font-bold">STAGE 01</span>
                  {upgrades.graphene ? (
                    <span className="bg-cyan-500/20 text-cyan-300 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">OFF</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200">Graphene Oxide mesh armor</h4>
                <p className="text-[10px] text-slate-400 tracking-tight leading-relaxed">
                  {isEn 
                    ? "Sub-nanometer graphene plating over steel fibers, yielding superhydrophobicity and zero particle adherence." 
                    : "স্টিল ফাইবারের ওপর সাব-ন্যানোমিটার গ্রাফিন অক্সাইড প্রলেপ, যা অ্যান্টি-ক্লগিং দেয়।"}
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-400 mt-2 font-bold select-none">
                {isEn ? "+85% Self-Cleaning" : "+৮৫% দীর্ঘস্থায়িত্ব"}
              </div>
            </button>

            {/* Stage 2 Option */}
            <button
              onClick={() => toggleUpgrade('magnetic')}
              className={`p-4 rounded-lg border text-left flex flex-col justify-between h-56 transition-all shadow cursor-pointer focus:outline-none ${
                upgrades.magnetic 
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-slate-500 font-bold">STAGE 02</span>
                  {upgrades.magnetic ? (
                    <span className="bg-cyan-500/20 text-cyan-300 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">OFF</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200">Rare-Earth magnetic lock</h4>
                <p className="text-[10px] text-slate-400 tracking-tight leading-relaxed">
                  {isEn 
                    ? "Replaces polymer-on-polymer twist latches with high-temp Neodymium magnets. Zero latch wear." 
                    : "পলিমার টুইস্ট লচের পরিবর্তে হাই-টেম্প নিয়োডিমিয়াম মাইক্রো-ম্যাগনেটিক রিং সিস্টেম।" }
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-400 mt-2 font-bold select-none">
                {isEn ? "+30s Fast Latch Swaps" : "+৩মিনিট রক্ষণাবেক্ষণ"}
              </div>
            </button>

            {/* Stage 3 Option */}
            <button
              onClick={() => toggleUpgrade('activeValve')}
              className={`p-4 rounded-lg border text-left flex flex-col justify-between h-56 transition-all shadow cursor-pointer focus:outline-none ${
                upgrades.activeValve 
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-slate-500 font-bold">STAGE 03</span>
                  {upgrades.activeValve ? (
                    <span className="bg-cyan-500/20 text-cyan-300 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">OFF</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200">AVEC Pressure Seal Valve</h4>
                <p className="text-[10px] text-slate-400 tracking-tight leading-relaxed">
                  {isEn 
                    ? "Pressure-activated mechanical micro-diaphragm completely isolates grounds bed at plunge threshold." 
                    : "প্রেশার-অ্যাক্টিভেটেড থ্রেশহোল্ড ভালভ যা এক্সট্রাকশন সম্পূর্ণভাবে বন্ধ করে দেয়।"}
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-400 mt-2 font-bold select-none">
                {isEn ? "Isolates Bitter Tannins" : "তিক্ততা প্রতিরোধ সূচক"}
              </div>
            </button>

            {/* Stage 4 Option */}
            <button
              onClick={() => toggleUpgrade('aerogel')}
              className={`p-4 rounded-lg border text-left flex flex-col justify-between h-56 transition-all shadow cursor-pointer focus:outline-none ${
                upgrades.aerogel 
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-slate-500 font-bold">STAGE 04</span>
                  {upgrades.aerogel ? (
                    <span className="bg-cyan-500/20 text-cyan-300 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">OFF</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200">Silica Aerogel Thermal Core</h4>
                <p className="text-[10px] text-slate-400 tracking-tight leading-relaxed">
                  {isEn 
                    ? "Infuses space-age silica aerogel particles in the structural gaps of vessel collar and wall structures." 
                    : "প্লাঞ্জার ও পাত্রের দেয়ালে মহাকাশ প্রযুক্তির সিলিকা অ্যারোজেল থার্মাল বেরিয়ার ইন্সটলেশন।"}
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-400 mt-2 font-bold select-none">
                {isEn ? "0.01 W/mK Conductivity" : "-৭২% থার্মাল লিকেজ"}
              </div>
            </button>

            {/* Stage 5 Option */}
            <button
              onClick={() => toggleUpgrade('chitinInterlayer')}
              className={`p-4 rounded-lg border text-left flex flex-col justify-between h-56 transition-all shadow cursor-pointer focus:outline-none ${
                upgrades.chitinInterlayer 
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-900/10 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-slate-500 font-bold">STAGE 05</span>
                  {upgrades.chitinInterlayer ? (
                    <span className="bg-cyan-500/20 text-cyan-300 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">ACTIVE</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-500 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded">OFF</span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200">Chitin Bio-nanofiber Paper</h4>
                <p className="text-[10px] text-slate-400 tracking-tight leading-relaxed">
                  {isEn 
                    ? "Electrospun chitosan-functionalized nanofibers targeting diterpenes with 99.8% affinity." 
                    : "ডিটারপিন শোষণের জন্য ইলেকট্রোস্পান কাইটোসান-বেসড কম্পোস্টেবল চমৎকার বায়ো-ফিল্টার।"}
                </p>
              </div>
              <div className="text-[9px] font-mono text-cyan-400 mt-2 font-bold select-none">
                {isEn ? "99.8% Lipid Adsorption" : "১০০% বায়োডিগ্রেডেবল"}
              </div>
            </button>

          </div>
        </section>

        {/* SECTION 4: REAL-TIME SIMULATED UPGRADE COMPARATOR */}
        <section id="comparison-dashboard" className="bg-slate-900/40 border border-slate-900 p-5 rounded-lg space-y-4 shadow-inner">
          <div className="flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isEn ? "Productivity & Performance Optimization Dashboard" : "পারফরম্যান্স অপ্টিমাইজেশন কম্প্যারেটর ড্যাশবোর্ড"}
              </h3>
            </div>
            <span className="text-[9px] text-cyan-400 bg-cyan-500/5 px-2.5 py-1 rounded font-mono border border-cyan-500/10 animate-pulse">
              {isEn ? "SANDBOX SIMULATION ACTIVE" : "স্যান্ডবক্স সিমুলেশন সক্রিয়"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* Index 1 */}
            <div className="bg-slate-950 p-3 rounded border border-slate-900/80 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-500">
                <span>{isEn ? "Particulate Trap" : "কণা ধারণ ক্ষমতা"}</span>
                <span className="text-cyan-400 font-bold">{getSimulatedIndex('particulate')}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300" 
                  style={{ width: `${getSimulatedIndex('particulate')}%` }}
                />
              </div>
            </div>

            {/* Index 2 */}
            <div className="bg-slate-950 p-3 rounded border border-slate-900/80 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-500">
                <span>{isEn ? "Cutoff Speed" : "বন্ধ হওয়ার গতি"}</span>
                <span className="text-cyan-400 font-bold">{getSimulatedIndex('cutoff')}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300" 
                  style={{ width: `${getSimulatedIndex('cutoff')}%` }}
                />
              </div>
            </div>

            {/* Index 3 */}
            <div className="bg-slate-950 p-3 rounded border border-slate-900/80 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-500">
                <span>{isEn ? "Flow Coefficient" : "প্রবাহ সহগ"}</span>
                <span className="text-cyan-400 font-bold">{getSimulatedIndex('flow')}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300" 
                  style={{ width: `${getSimulatedIndex('flow')}%` }}
                />
              </div>
            </div>

            {/* Index 4 */}
            <div className="bg-slate-950 p-3 rounded border border-slate-900/80 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-500">
                <span>{isEn ? "Thermal Mastery" : "তাপ অপচয় নিরোধ"}</span>
                <span className="text-emerald-400 font-bold">{getSimulatedIndex('thermal')}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${getSimulatedIndex('thermal')}%` }}
                />
              </div>
            </div>

            {/* Index 5 */}
            <div className="bg-slate-950 p-3 rounded border border-slate-900/80 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-500">
                <span>{isEn ? "Anti-Residue" : "স্বয়ংক্রিয় পরিষ্কার"}</span>
                <span className="text-cyan-400 font-bold">{getSimulatedIndex('selfcleaning')}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300" 
                  style={{ width: `${getSimulatedIndex('selfcleaning')}%` }}
                />
              </div>
            </div>

            {/* Index 6 */}
            <div className="bg-slate-950 p-3 rounded border border-slate-900/80 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-500">
                <span>{isEn ? "Bio-Compost Index" : "পরিবেশ বান্ধব সূচক"}</span>
                <span className="text-emerald-400 font-bold">{getSimulatedIndex('bio')}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${getSimulatedIndex('bio')}%` }}
                />
              </div>
            </div>

          </div>

          <div className="bg-slate-950/60 p-3.5 rounded border border-slate-900 text-xs text-slate-400 space-y-2 font-sans select-none">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>{isEn ? "Active Engineering Upbreaks Summary:" : "সক্রিয় প্রকৌশলগত পরিবর্তনের বিবরণ:"}</span>
            </div>
            <p className="leading-relaxed">
              {Object.values(upgrades).filter(Boolean).length === 0 
                ? (isEn ? "No advanced enhancements active. Currently simulating original baselines." : "কোনো উন্নত অপ্টিমাইজেশন সক্রিয় নেই। বর্তমানে বেসলাইনে সিমুলেশন চলছে।")
                : (isEn 
                    ? `Simulating ${Object.values(upgrades).filter(Boolean).length} modification(s). Mesh aperture friction scales are optimized, thermal drop scales to a minimum of ${thermalLeak.toFixed(3)}°C/min, cafestol lipid capture stands at ${lipidRetention.toFixed(1)}%, and bypass coefficient is dialed down to ${bypass.toFixed(3)}%.` 
                    : `বর্তমানে ${Object.values(upgrades).filter(Boolean).length} টি পরিবর্তন সক্রিয় রয়েছে। জালের অনুকরণীয় ঘর্ষণ হ্রাস পাচ্ছে, সর্বনিম্ন তাপমাত্রা অপচয় হ্রাস পেয়ে দাঁড়িয়েছে পতি মিনিটে ${thermalLeak.toFixed(3)}°C, এবং কাফেস্টল লিপিড শোষণ সর্বোচ্চ ${lipidRetention.toFixed(1)}% অর্জন করেছে।`)}
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
