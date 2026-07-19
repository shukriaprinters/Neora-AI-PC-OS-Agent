import React from 'react';
import { 
  LayoutGrid, Sliders, Type, Palette, Upload, Image as ImageIcon, Sparkles, FolderOpen, 
  Search, CheckCircle, Clock, Plus, Folder, Sparkle, RefreshCw
} from 'lucide-react';

interface CanvaSidebarPanelProps {
  lang: 'en' | 'bn';
  sidebarTab: 'templates' | 'elements' | 'text' | 'brand' | 'uploads' | 'midjourney' | 'copilot' | 'roadmap';
  setSidebarTab: (tab: any) => void;
  PRESETS: any[];
  selectedTemplate: any;
  selectTemplate: (template: any) => void;
  elements: any[];
  setElements: any;
  canvasBg: any;
  setCanvasBg: (bg: any) => void;
  updateElementProp: (id: string, prop: any, value: any) => void;
  GRADIENTS: any[];
  newTextVal: string;
  setNewTextVal: (v: string) => void;
  addNewText: () => void;
  addNewShape: (type: string) => void;
  aiPrompt: string;
  setAiPrompt: (p: string) => void;
  aiImageType: 'background' | 'sticker';
  setAiImageType: (t: 'background' | 'sticker') => void;
  generateAiAsset: () => void;
  isGeneratingAi: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  copilotPrompt: string;
  setCopilotPrompt: (p: string) => void;
  copilotStatus: string;
  copilotLogs: string[];
  activeCopilotAgent: string | null;
  runCopilotWorkflow: () => void;
  mjModel: string;
  setMjModel: (m: any) => void;
  mjAspectRatio: string;
  setMjAspectRatio: (r: any) => void;
  mjStylePreset: string;
  setMjStylePreset: (s: any) => void;
  mjChaos: number;
  setMjChaos: (c: number) => void;
  mjStylize: number;
  setMjStylize: (s: number) => void;
  mjGeneratedGrid: string[];
  isGeneratingMjGrid: boolean;
  generateMidjourneyGrid: () => void;
  setShowRoadmapModal: (s: boolean) => void;
  ROADMAP_ITEMS: any[];
  roadmapSearch: string;
  setRoadmapSearch: (s: string) => void;
  roadmapCategory: string;
  setRoadmapCategory: (c: string) => void;
  filteredRoadmapItems: any[];
  refImage?: string | null;
  setRefImage?: (img: string | null) => void;
  aiGeneratedOptions?: any[];
  setAiGeneratedOptions?: (opts: any[]) => void;
  generateAiDesigns?: (prompt: string) => void;
  isGeneratingDesigns?: boolean;
  refineDesignWithAi?: (instruction: string) => void;
  refinePrompt?: string;
  setRefinePrompt?: (v: string) => void;
  isRefiningDesign?: boolean;
  applyAiStyling?: () => void;
  isApplyingStyling?: boolean;

  styleWeights?: any;
  setStyleWeights?: any;
  styleProfile?: any;
  setStyleProfile?: any;
  semanticMap?: any;
  setSemanticMap?: any;
  isAnalyzingRefImage?: boolean;
  reconstructLayoutFromMap?: () => void;
  isReconstructing?: boolean;
  splitView?: boolean;
  setSplitView?: (v: boolean) => void;
  userRatings?: any[];
  setUserRatings?: any;
  regionMask?: any;
  setRegionMask?: any;
  isVectorizing?: boolean;
  segmentAndVectorize?: () => void;
  vectorizedLayers?: any[];
  setVectorizedLayers?: any;
}

export default function CanvaSidebarPanel({
  lang,
  sidebarTab,
  setSidebarTab,
  PRESETS,
  selectedTemplate,
  selectTemplate,
  elements,
  setElements,
  canvasBg,
  setCanvasBg,
  updateElementProp,
  GRADIENTS,
  newTextVal,
  setNewTextVal,
  addNewText,
  addNewShape,
  aiPrompt,
  setAiPrompt,
  aiImageType,
  setAiImageType,
  generateAiAsset,
  isGeneratingAi,
  fileInputRef,
  handleImageUpload,
  copilotPrompt,
  setCopilotPrompt,
  copilotStatus,
  copilotLogs,
  activeCopilotAgent,
  runCopilotWorkflow,
  mjModel,
  setMjModel,
  mjAspectRatio,
  setMjAspectRatio,
  mjStylePreset,
  setMjStylePreset,
  mjChaos,
  setMjChaos,
  mjStylize,
  setMjStylize,
  mjGeneratedGrid,
  isGeneratingMjGrid,
  generateMidjourneyGrid,
  setShowRoadmapModal,
  ROADMAP_ITEMS,
  roadmapSearch,
  setRoadmapSearch,
  roadmapCategory,
  setRoadmapCategory,
  filteredRoadmapItems,
  refImage = null,
  setRefImage,
  aiGeneratedOptions = [],
  setAiGeneratedOptions,
  generateAiDesigns,
  isGeneratingDesigns = false,
  refineDesignWithAi,
  refinePrompt = "",
  setRefinePrompt,
  isRefiningDesign = false,
  applyAiStyling,
  isApplyingStyling = false,

  styleWeights = { color: 80, composition: 60, typography: 50, texture: 50 },
  setStyleWeights,
  styleProfile = { brushStroke: 'medium', lightingContrast: 'soft', subjectHierarchy: 'layered' },
  setStyleProfile,
  semanticMap = { objects: [], style: '', layout: '', isAnalyzed: false },
  setSemanticMap,
  isAnalyzingRefImage = false,
  reconstructLayoutFromMap,
  isReconstructing = false,
  splitView = false,
  setSplitView,
  userRatings = [],
  setUserRatings,
  regionMask = { active: false, x: 0, y: 0, width: 0, height: 0, prompt: '', isDrawing: false },
  setRegionMask,
  isVectorizing = false,
  segmentAndVectorize,
  vectorizedLayers = [],
  setVectorizedLayers
}: CanvaSidebarPanelProps) {

  // Left rail navigation buttons
  const railItems = [
    { id: 'templates', label: lang === 'bn' ? 'টেমপ্লেট' : 'Templates', icon: LayoutGrid },
    { id: 'text', label: lang === 'bn' ? 'টেক্সট' : 'Text / Info', icon: Type },
    { id: 'elements', label: lang === 'bn' ? 'ইলিমেন্ট' : 'Elements', icon: Sliders },
    { id: 'brand', label: lang === 'bn' ? 'ব্র্যান্ড' : 'Brand Kit', icon: Palette },
    { id: 'uploads', label: lang === 'bn' ? 'আপলোড' : 'Uploads', icon: Upload },
    { id: 'midjourney', label: 'Midjourney', icon: ImageIcon },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles },
    { id: 'roadmap', label: lang === 'bn' ? 'রোডম্যাপ' : 'Roadmap', icon: FolderOpen }
  ] as const;

  return (
    <div className="flex select-none h-full shrink-0 z-20">
      
      {/* 1. Slim Left Icon Rail */}
      <div className="w-20 bg-slate-950 border-r border-slate-900 flex flex-col items-center py-4 gap-4 overflow-y-auto h-full scrollbar-none">
        {railItems.map((item) => {
          const Icon = item.icon;
          const isActive = sidebarTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSidebarTab(item.id)}
              className={`w-16 py-3 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-slate-900 border border-slate-800 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/45'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-400 rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'}`} />
              <span className="text-[9px] font-bold font-sans text-center leading-tight truncate w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Secondary Slideout Content Panel */}
      <div className="w-85 lg:w-96 bg-slate-900 border-r border-slate-800/80 flex flex-col h-full overflow-hidden">
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-950/20 shrink-0">
          <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest block">
            CANVA STUDIO WORKSPACE
          </span>
          <h2 className="text-sm font-bold text-white capitalize mt-0.5">
            {sidebarTab === 'templates' && (lang === 'bn' ? '১. ডিজাইন টেমপ্লেট লাইব্রেরি' : 'Preset Design Layouts')}
            {sidebarTab === 'text' && (lang === 'bn' ? '২. টেক্সট এবং তথ্য ফর্ম' : 'Form Fields & Type Tool')}
            {sidebarTab === 'elements' && (lang === 'bn' ? '৩. গ্রাফিক শেইপস ও ইলিমেন্ট' : 'Vector Elements')}
            {sidebarTab === 'brand' && (lang === 'bn' ? '৪. শুকরিয়া ব্র্যান্ড কালার কিট' : 'Shukria Brand Palette')}
            {sidebarTab === 'uploads' && (lang === 'bn' ? '৫. কাস্টম পিকচার আপলোডার' : 'Upload Images/Logos')}
            {sidebarTab === 'midjourney' && 'Advanced Midjourney Studio'}
            {sidebarTab === 'copilot' && 'AI Copilot Multi-Agent Design'}
            {sidebarTab === 'roadmap' && 'Neora 1000+ Scale Feature Roadmap'}
          </h2>
        </div>

        {/* Panel Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800 space-y-4">
          
          {/* TAB: TEMPLATES */}
          {sidebarTab === 'templates' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-[10.5px] leading-relaxed text-slate-400">
                {lang === 'bn' ? 'নিচের ক্যাটাগরি থেকে যেকোনো প্রিসেট টেমপ্লেট নির্বাচন করুন। ক্যানভাসে স্বয়ংক্রিয়ভাবে লেআউট সাজিয়ে যাবে।' : 'Choose any design template layout below to automatically align layer dimensions and base text presets.'}
              </p>
              
              <div className="grid grid-cols-1 gap-2.5">
                {PRESETS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative group overflow-hidden ${
                      selectedTemplate.id === t.id
                        ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950/45 border-slate-850 hover:border-slate-700 hover:bg-slate-950/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {lang === 'bn' ? t.nameBn : t.name}
                        </h3>
                        <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                          {t.type} • {t.width} × {t.height} PX
                        </p>
                      </div>
                      {selectedTemplate.id === t.id && (
                        <span className="bg-cyan-500 text-slate-950 text-[8px] font-black font-mono px-2 py-0.5 rounded-full uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TEXT */}
          {sidebarTab === 'text' && (
            <div className="space-y-4 animate-fade-in text-slate-200">
              
              {/* Insert Custom Box Section */}
              <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-850 space-y-2">
                <span className="block text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-wider">
                  {lang === 'bn' ? 'কাস্টম টেক্সট লেয়ার যোগ করুন' : 'INSERT TEXT LABEL'}
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTextVal}
                    onChange={(e) => setNewTextVal(e.target.value)}
                    placeholder={lang === 'bn' ? 'লেখা লিখুন...' : 'Type text layer content...'}
                    className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500/40"
                  />
                  <button
                    onClick={addNewText}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD</span>
                  </button>
                </div>
              </div>

              {/* Template fields direct editors */}
              <div className="space-y-2.5">
                <span className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                  {lang === 'bn' ? 'টেমপ্লেটের লেখাগুলো এডিট করুন' : 'TEMPLATE FIELD INPUTS'}
                </span>

                <div className="space-y-2.5">
                  {elements.filter(el => el.type === 'text').map((el, i) => {
                    let prettyLabel = lang === 'bn' ? `লাইন ${i + 1}` : `Text Line ${i + 1}`;
                    const idLower = el.id.toLowerCase();
                    if (idLower.includes('header') || idLower.includes('title')) {
                      prettyLabel = lang === 'bn' ? '👑 প্রধান শিরোনাম (Title)' : '👑 Title';
                    } else if (idLower.includes('bismillah')) {
                      prettyLabel = lang === 'bn' ? '✨ পবিত্র বাক্য (Bismi)' : '✨ Bismi Sentence';
                    } else if (idLower.includes('poetry')) {
                      prettyLabel = lang === 'bn' ? '📜 কবিতা / স্লোগান (Poetry)' : '📜 Poetry';
                    } else if (idLower.includes('invitation')) {
                      prettyLabel = lang === 'bn' ? '✉️ আমন্ত্রণ বাণী (Invitation)' : '✉️ Invitation text';
                    } else if (idLower.includes('venue')) {
                      prettyLabel = lang === 'bn' ? '📍 স্থান (Venue)' : '📍 Venue Address';
                    } else if (idLower.includes('date')) {
                      prettyLabel = lang === 'bn' ? '📅 তারিখ ও সময় (Date)' : '📅 Date & Time';
                    } else if (idLower.includes('footer')) {
                      prettyLabel = lang === 'bn' ? '📝 পাদটীকা (Footer)' : '📝 Footer';
                    } else if (idLower.includes('sender')) {
                      prettyLabel = lang === 'bn' ? '🤝 শুভেচ্ছান্তে (Sender)' : '🤝 Sender Name';
                    } else if (idLower.includes('contact') || idLower.includes('phone')) {
                      prettyLabel = lang === 'bn' ? '📞 মোবাইল / যোগাযোগ (Contact)' : '📞 Contact Info';
                    }

                    return (
                      <div key={el.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 hover:border-slate-800 transition-all space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-cyan-400">
                            {prettyLabel}
                          </span>
                          <button
                            onClick={() => updateElementProp(el.id, 'opacity', el.opacity === 0 ? 1 : 0)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 hover:text-white"
                          >
                            {el.opacity === 0 ? '👁️‍ٔ' : '👁️'}
                          </button>
                        </div>

                        {el.content.includes('\n') || el.content.length > 40 ? (
                          <textarea
                            value={el.content}
                            onChange={(e) => updateElementProp(el.id, 'content', e.target.value)}
                            className="w-full h-16 bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded focus:outline-none focus:border-cyan-500/40 resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={el.content}
                            onChange={(e) => updateElementProp(el.id, 'content', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-xs text-white px-2 py-1.5 rounded focus:outline-none focus:border-cyan-500/40"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB: ELEMENTS */}
          {sidebarTab === 'elements' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-[10.5px] leading-relaxed text-slate-400">
                {lang === 'bn' ? 'ক্যানভাসে বিভিন্ন জ্যামিতিক আকৃতি এবং এআই আর্টওয়ার্ক উপাদান ইনস্ট্যান্ট স্ন্যাপ করুন।' : 'Snap geometric vector framing layers directly onto your canvas to establish borders and design depth.'}
              </p>

              {/* Quick shape buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addNewShape('rect_horizontal')}
                  className="py-3 px-3 bg-slate-950/60 border border-slate-800 hover:border-cyan-500 hover:bg-slate-950 rounded-xl text-xs font-bold text-slate-200 flex flex-col items-center gap-2 cursor-pointer transition-all"
                >
                  <div className="w-12 h-2.5 bg-cyan-500 rounded" />
                  <span>HORIZONTAL BAR</span>
                </button>
                <button
                  onClick={() => addNewShape('border_ring')}
                  className="py-3 px-3 bg-slate-950/60 border border-slate-800 hover:border-cyan-500 hover:bg-slate-950 rounded-xl text-xs font-bold text-slate-200 flex flex-col items-center gap-2 cursor-pointer transition-all"
                >
                  <div className="w-8 h-8 border-2 border-dashed border-cyan-500 rounded" />
                  <span>BORDER BINDING RING</span>
                </button>
              </div>

              {/* Free AI Image/Sticker Asset Generator */}
              <div className="border border-cyan-500/15 bg-slate-950/20 p-3 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-wider">
                    {lang === 'bn' ? 'এআই গ্রাফিক এসেট ক্রিয়েটর' : 'FREE AI GRAPHIC GENERATOR'}
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-500 leading-normal">
                  {lang === 'bn' ? 'পলিনেশনস এসডি টেকনোলজি দিয়ে নিজের মনের মতো ব্যাকগ্রাউন্ড ছবি বা স্টিকার বানিয়ে ফেলুন ফ্রিতে!' : 'Generate completely custom transparent graphics, stickers, or illustration backdrops instantly.'}
                </p>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: সুন্দর সবুজ বন নদী সূর্যোদয়, অথবা লাল ব্যাকগ্রাউন্ড গোল্ডেন ফ্রেম...' : 'e.g., artistic traditional floral border, cream background...'}
                  className="w-full h-16 bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-lg p-2 resize-none focus:outline-none focus:border-cyan-500/40"
                />
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setAiImageType('background')}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold ${aiImageType === 'background' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'bg-slate-950 text-slate-500'}`}
                    >
                      BG IMAGE
                    </button>
                    <button
                      onClick={() => setAiImageType('sticker')}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-bold ${aiImageType === 'sticker' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'bg-slate-950 text-slate-500'}`}
                    >
                      STICKER
                    </button>
                  </div>
                  
                  <button
                    onClick={generateAiAsset}
                    disabled={isGeneratingAi || !aiPrompt.trim()}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-850 disabled:text-slate-600 text-slate-950 text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {isGeneratingAi ? 'GENERATING...' : 'GENERATE'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB: BRAND */}
          {sidebarTab === 'brand' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-[10.5px] leading-relaxed text-slate-400">
                {lang === 'bn' ? 'শুকরিয়া প্রিন্টার্স অ্যান্ড পাবলিশার্স-এর নিজস্ব কালার প্যালেট কিট। যেকোনো লেখার কালার সেট করতে প্রিসেটে ক্লিক করুন:' : 'Quick Brand Kit: Tap any primary brand color below to style your document.'}
              </p>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850 space-y-3">
                <span className="block text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-wider">
                  PRIMARY BRAND COLORS
                </span>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'রাজকীয় লাল', val: '#7c1a22' },
                    { name: 'উজ্জ্বল সোনা', val: '#f5ecd8' },
                    { name: 'উজ্জ্বল হলুদ', val: '#fcd34d' },
                    { name: 'শুকরিয়া সবুজ', val: '#052e16' },
                    { name: 'মেটালিক কালো', val: '#09090b' },
                    { name: 'রয়াল কোবাল্ট', val: '#1e3a8a' },
                    { name: 'সোনার আভা', val: '#d97706' },
                    { name: 'সাদা শুভ্র', val: '#ffffff' }
                  ].map((colorItem) => (
                    <button
                      key={colorItem.val}
                      onClick={() => setCanvasBg({ type: 'color', value: colorItem.val })}
                      className="group flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <div 
                        className="w-10 h-10 rounded-full border border-slate-800 hover:scale-110 transition-transform" 
                        style={{ backgroundColor: colorItem.val }}
                      />
                      <span className="text-[8px] font-medium text-slate-400 group-hover:text-white transition-colors">
                        {lang === 'bn' ? colorItem.name : colorItem.val}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Presets */}
              <div className="space-y-2">
                <span className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                  CANVA GRADIENT THEMES
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENTS.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setCanvasBg({ type: 'gradient', value: g.value })}
                      className="p-3 rounded-lg border border-slate-850 text-left cursor-pointer transition-all hover:border-cyan-500"
                      style={{ background: g.value }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow">
                        {g.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: UPLOADS */}
          {sidebarTab === 'uploads' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-[10.5px] leading-relaxed text-slate-400">
                {lang === 'bn' ? 'আপনার কম্পিউটার বা মোবাইল থেকে লোগো, সিগনেচার বা ছবি আপলোড করে সরাসরি ডিজাইনের উপর বসান।' : 'Upload custom png transparent logos, watermarks, stamps or photo files to place directly on active sheets.'}
              </p>

              {/* Big Drag/Click Upload Button */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 rounded-2xl p-6 text-center cursor-pointer transition-all group"
              >
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mx-auto mb-2 transition-colors animate-bounce" />
                <span className="block text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  {lang === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'SELECT PHOTO / LOGO'}
                </span>
                <span className="block text-[9px] text-slate-600 font-mono uppercase mt-1">
                  PNG, JPG, SVG UP TO 5MB
                </span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Quick Stickers list */}
              <div className="space-y-2 pt-2">
                <span className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                  PRE-LOADED BENGALI BRAND LOGOS
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'শুকরিয়া মনোগ্রাম', img: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?q=80&w=250' },
                    { name: 'সোনার পাখা', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=250' },
                    { name: 'আলপনা রাউন্ড', img: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=250' }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const newLayer = {
                          id: `sticker_${Date.now()}`,
                          type: 'image' as const,
                          content: s.img,
                          x: 50,
                          y: 50,
                          width: 20,
                          height: 20,
                          borderRadius: 8
                        };
                        setElements(prev => [...prev, newLayer]);
                      }}
                      className="border border-slate-850 hover:border-cyan-500 rounded-lg p-1.5 bg-slate-950/50 transition-all cursor-pointer"
                    >
                      <img src={s.img} alt={s.name} className="w-full h-10 object-cover rounded" />
                      <span className="block text-[8px] text-slate-500 text-center truncate mt-1">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MIDJOURNEY */}
          {sidebarTab === 'midjourney' && (
            <div className="space-y-4 animate-fade-in text-slate-200">
              
              <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3 text-[10.5px] leading-relaxed text-purple-300">
                🌌 <strong>Midjourney Imagine Core:</strong> Select dynamic styles, models, and chaos levels. Click generate to construct a high resolution 4-grid visual matrix.
              </div>

              {/* Params */}
              <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                {/* Model */}
                <div>
                  <label className="block text-[9px] font-bold font-mono text-purple-400 uppercase mb-1">ENGINE MODEL:</label>
                  <select
                    value={mjModel}
                    onChange={(e) => setMjModel(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="v6.1">MIDJOURNEY v6.1 (ULTRA HDR)</option>
                    <option value="niji6">NIJI v6 (ANIME ANIME)</option>
                    <option value="realistic">REALISTIC PHOTO ENGINE</option>
                    <option value="alpha">ALPHA SYNAPSE v7</option>
                  </select>
                </div>

                {/* Preset */}
                <div>
                  <label className="block text-[9px] font-bold font-mono text-purple-400 uppercase mb-1">VISUAL STYLE PRESET:</label>
                  <select
                    value={mjStylePreset}
                    onChange={(e) => setMjStylePreset(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="cinematic">Cinematic 8k Lighting</option>
                    <option value="watercolor">Soft Pastel Watercolor painting</option>
                    <option value="cyberpunk">Cyberpunk Neon Synthwave</option>
                    <option value="alpona">Traditional Bengali Alpona folk pattern</option>
                    <option value="oil">Classic Textured Oil Canvas</option>
                    <option value="anime">Rich Vibrant Studio Ghibli Anime</option>
                  </select>
                </div>

                {/* Aspect ratio */}
                <div>
                  <label className="block text-[9px] font-bold font-mono text-purple-400 uppercase mb-1">ASPECT RATIO (DIMENSIONS):</label>
                  <div className="grid grid-cols-5 gap-1 bg-slate-900 p-0.5 rounded">
                    {['1:1', '16:9', '9:16', '4:3', '3:2'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMjAspectRatio(r as any)}
                        className={`py-1 text-[9px] font-bold font-mono rounded ${mjAspectRatio === r ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chaos */}
                <div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-purple-400 mb-1">
                    <span>CHAOS VALUE:</span>
                    <span>{mjChaos}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mjChaos}
                    onChange={(e) => setMjChaos(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Stylize */}
                <div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-purple-400 mb-1">
                    <span>STYLIZE LEVEL:</span>
                    <span>--s {mjStylize}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={mjStylize}
                    onChange={(e) => setMjStylize(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              {/* Trigger Button */}
              <button
                onClick={generateMidjourneyGrid}
                disabled={isGeneratingMjGrid || !aiPrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-purple-600/10"
              >
                {isGeneratingMjGrid ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>IMAGINING GRID MATRIX...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>RUN MIDJOURNEY GRID</span>
                  </>
                )}
              </button>

              {/* Render generated grid quadrant */}
              {mjGeneratedGrid.length > 0 && (
                <div className="space-y-3 border-t border-slate-850 pt-3">
                  <span className="block text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                    MJ QUADRANT RESULTS:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-xl">
                    {mjGeneratedGrid.map((imgUrl, i) => (
                      <div key={i} className="relative group overflow-hidden rounded-lg aspect-square border border-slate-800 hover:border-purple-500/50 transition-all">
                        <img src={imgUrl} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setCanvasBg({ type: 'image', value: imgUrl, overlayOpacity: 0.3 })}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black text-white cursor-pointer transition-all uppercase"
                        >
                          USE AS BG
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* U1..V4 Upscale tools */}
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setCanvasBg({ type: 'image', value: mjGeneratedGrid[num - 1], overlayOpacity: 0.3 })}
                        className="py-1 bg-slate-950 hover:bg-slate-800 text-[10px] font-mono border border-slate-850 rounded text-slate-300"
                      >
                        U{num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: COPILOT */}
          {sidebarTab === 'copilot' && (
            <div className="space-y-4 animate-fade-in text-slate-200">
              <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-xl p-3 text-[11px] leading-relaxed text-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                <div className="flex items-center gap-1.5 mb-1 text-cyan-400 font-bold">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>{lang === 'bn' ? 'মাল্টিমোডাল এআই ডিজাইন স্টুডিও' : 'Multimodal AI Design Studio'}</span>
                </div>
                {lang === 'bn' 
                  ? 'আপনার পছন্দসই টেক্সট লিখুন এবং স্টাইল রেফারেন্স হিসেবে যেকোনো ছবি আপলোড করুন। এআই আপনার টেক্সট ও ছবি বিশ্লেষণ করে নতুন এবং নান্দনিক ডিজাইন লেআউট তৈরি করে দেবে।'
                  : 'Enter your preferred text prompt and upload a style reference image. The AI will analyze both to synthesize high-quality custom layouts.'}
              </div>

              {/* 1. REFERENCE STYLE IMAGE UPLOADER */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider">
                  {lang === 'bn' ? '১. স্টাইল রেফারেন্স ইমেজ (ঐচ্ছিক)' : '1. Style Reference Image (Optional)'}
                </label>
                <div className="border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 bg-slate-950 text-center transition-all relative">
                  {!refImage ? (
                    <div className="space-y-1.5 py-1">
                      <ImageIcon className="w-6 h-6 text-slate-600 mx-auto" />
                      <p className="text-[10px] text-slate-400">
                        {lang === 'bn' ? 'ড্র্যাগ অ্যান্ড ড্রপ বা ক্লিক করে ছবি সিলেক্ট করুন' : 'Drag & drop or click to upload reference'}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && setRefImage) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setRefImage(evt.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="relative group">
                      <img 
                        src={refImage} 
                        alt="Reference Style" 
                        className="w-full max-h-32 object-contain rounded-lg border border-slate-800" 
                      />
                      <button
                        onClick={() => setRefImage && setRefImage(null)}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 hover:bg-red-500 rounded-full text-white text-[8px] font-black cursor-pointer shadow-md animate-bounce"
                      >
                        ✕
                      </button>
                      <button
                        onClick={() => applyAiStyling && applyAiStyling()}
                        disabled={isApplyingStyling}
                        className="mt-2 w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-lg"
                      >
                        {isApplyingStyling ? (
                          <>
                            <span className="w-2.5 h-2.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                            {lang === 'bn' ? 'স্টাইলিং প্রয়োগ হচ্ছে...' : 'Applying Styling...'}
                          </>
                        ) : (
                          <>
                            <Palette className="w-3 h-3" />
                            {lang === 'bn' ? 'এআই স্টাইলিং প্রয়োগ করুন' : 'Apply AI Styling'}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* BRAND-NEW INTELLIGENT STYLE TRANSFER & INTENT CONTROLS */}
              {refImage && (
                <div className="space-y-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 animate-fade-in text-xs">
                  {/* Semantic Map */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
                      <span>{lang === 'bn' ? 'সিমেন্টিক বিশ্লেষণ' : 'Visual Semantic Map'}</span>
                      {isAnalyzingRefImage ? (
                        <span className="text-[9px] text-cyan-400 animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                          ANALYZING...
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[8px] border border-emerald-500/20 px-1 rounded bg-emerald-500/10">ANALYZED</span>
                      )}
                    </div>
                    
                    {semanticMap.isAnalyzed ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {semanticMap.objects && semanticMap.objects.map((obj: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[10px] rounded border border-slate-850">
                              {obj}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-400 font-mono">
                          <div><span className="text-slate-500">STYLE:</span> {semanticMap.style}</div>
                          <div><span className="text-slate-500">LAYOUT:</span> {semanticMap.layout}</div>
                        </div>

                        {/* Reconstruction Trigger */}
                        <button
                          onClick={reconstructLayoutFromMap}
                          disabled={isReconstructing}
                          className="w-full mt-1.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md"
                        >
                          {isReconstructing ? (
                            <>
                              <span className="w-2.5 h-2.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                              RECONSTRUCTING...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              {lang === 'bn' ? 'কন্টেন্ট-অ্যাওয়ার লেআউট পুনর্গঠন' : 'Content-Aware Reconstruction'}
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-[10px] italic">Uploading image triggers automatic visual extraction...</div>
                    )}
                  </div>

                  {/* Style Profile Configuration */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <div className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
                      {lang === 'bn' ? 'আর্টিস্টিক স্টাইল প্রোফাইল' : 'Artistic Style Profile'}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase">TEXTURE</span>
                        <select
                          value={styleProfile.brushStroke}
                          onChange={(e) => setStyleProfile && setStyleProfile({ ...styleProfile, brushStroke: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded p-1"
                        >
                          <option value="none">None</option>
                          <option value="fine">Fine</option>
                          <option value="medium">Medium</option>
                          <option value="textured">Textured</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase">CONTRAST</span>
                        <select
                          value={styleProfile.lightingContrast}
                          onChange={(e) => setStyleProfile && setStyleProfile({ ...styleProfile, lightingContrast: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded p-1"
                        >
                          <option value="soft">Soft</option>
                          <option value="high">High</option>
                          <option value="dramatic">Dramatic</option>
                          <option value="ambient">Ambient</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase">HIERARCHY</span>
                        <select
                          value={styleProfile.subjectHierarchy}
                          onChange={(e) => setStyleProfile && setStyleProfile({ ...styleProfile, subjectHierarchy: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded p-1"
                        >
                          <option value="flat">Flat</option>
                          <option value="layered">Layered</option>
                          <option value="symmetrical">Symmetrical</option>
                          <option value="depth">Depth</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Weighted Style-Mapping Module */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <div className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest flex justify-between items-center">
                      <span>{lang === 'bn' ? 'স্টাইল ইনফ্লুয়েন্স রেশিও' : 'Style Influence Weights'}</span>
                      <span className="text-[9px] text-amber-500 font-bold">WEIGHTED</span>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Color Palette</span>
                          <span>{styleWeights.color}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={styleWeights.color}
                          onChange={(e) => setStyleWeights && setStyleWeights({ ...styleWeights, color: parseInt(e.target.value) })}
                          className="w-full accent-cyan-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Composition Structure</span>
                          <span>{styleWeights.composition}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={styleWeights.composition}
                          onChange={(e) => setStyleWeights && setStyleWeights({ ...styleWeights, composition: parseInt(e.target.value) })}
                          className="w-full accent-cyan-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Typography & Styling</span>
                          <span>{styleWeights.typography}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={styleWeights.typography}
                          onChange={(e) => setStyleWeights && setStyleWeights({ ...styleWeights, typography: parseInt(e.target.value) })}
                          className="w-full accent-cyan-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Texture & Overlays</span>
                          <span>{styleWeights.texture}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={styleWeights.texture}
                          onChange={(e) => setStyleWeights && setStyleWeights({ ...styleWeights, texture: parseInt(e.target.value) })}
                          className="w-full accent-cyan-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Split-View toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                    <span className="text-[10px] font-mono text-slate-300 uppercase">{lang === 'bn' ? 'স্প্লিট-ভিউ প্রিভিউ' : 'Side-by-Side Split View'}</span>
                    <button
                      onClick={() => setSplitView && setSplitView(!splitView)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                        splitView ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {splitView ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}

              {/* REGION SELECTION LOCAL INPAINTING MODULE */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
                    <Sparkle className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{lang === 'bn' ? 'অঞ্চলভিত্তিক সম্পাদনা' : 'Local Region Edit'}</span>
                  </div>
                  <button
                    onClick={() => setRegionMask && setRegionMask({ ...regionMask, active: !regionMask.active })}
                    className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase transition-all ${
                      regionMask.active ? 'bg-yellow-400 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-500 border border-slate-850 hover:text-slate-300'
                    }`}
                  >
                    {regionMask.active ? 'ACTIVE' : 'ENABLE MASK'}
                  </button>
                </div>
                
                {regionMask.active ? (
                  <div className="space-y-2 animate-fade-in text-[11px]">
                    <div className="p-2 bg-yellow-500/5 rounded border border-yellow-500/20 text-slate-300 text-[10px] leading-relaxed">
                      {lang === 'bn' 
                        ? 'ক্যানভাসে ক্লিক করে ড্র্যাগ করুন একটি অঞ্চল নির্ধারণ করতে। তারপর নিচের ফিল্ডে এডিট ইনস্ট্রাকশন লিখুন।'
                        : 'Click and drag on the canvas to draw your bounding edit region. Then specify your instruction below:'}
                    </div>
                    {regionMask.width > 0 && (
                      <div className="text-[10px] font-mono text-yellow-400/80">
                        Selected: x={Math.round(regionMask.x)}%, y={Math.round(regionMask.y)}% ({Math.round(regionMask.width)}x{Math.round(regionMask.height)}%)
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'যেমন: এখানে একটি গোল্ডেন মেডেল বসিয়ে দাও...' : 'e.g., place a metallic gold medal badge here...'}
                      value={regionMask.prompt}
                      onChange={(e) => setRegionMask && setRegionMask({ ...regionMask, prompt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {lang === 'bn' ? 'নির্দিষ্ট অঞ্চলে ডিজাইন এডিট করার জন্য মাস্ক মোড অ্যাক্টিভেট করুন।' : 'Enable regional masking to restrict text prompts to a custom bounding box area.'}
                  </p>
                )}
              </div>

              {/* AUTO-VECTORIZATION & DEPTH LAYER SEGMENTATION */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'bn' ? 'ডেপথ ভেক্টরাইজেশন' : 'Depth Vectorization'}</span>
                  </div>
                  <button
                    onClick={segmentAndVectorize}
                    disabled={isVectorizing}
                    className="px-2.5 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[9px] font-black tracking-wider uppercase transition-all flex items-center gap-1"
                  >
                    {isVectorizing ? 'PROCESSING...' : 'SEGMENT NOW'}
                  </button>
                </div>

                {vectorizedLayers && vectorizedLayers.length > 0 ? (
                  <div className="space-y-2 animate-fade-in text-[11px]">
                    <div className="text-[9px] text-slate-400">Separated canvas into 3 depth-isolated vector plates:</div>
                    <div className="space-y-1.5">
                      {vectorizedLayers.map((layer: any) => (
                        <div key={layer.id} className="bg-slate-950 border border-slate-850 p-2 rounded flex flex-col gap-1 hover:border-cyan-500/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10px] text-white">{layer.name}</span>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">{layer.type}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono">Elements Count: {layer.elements?.length || 0}</div>
                          
                          {/* Individual Layer Export SVG */}
                          <button
                            onClick={() => {
                              const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
                                ${layer.elements.map((el: any) => {
                                  if (el.type === 'text') {
                                    return `<text x="${el.x}%" y="${el.y}%" fill="${el.color || '#ffffff'}" font-size="${el.fontSize || 14}" font-family="${el.fontFamily || 'Inter'}" text-anchor="middle">${el.content}</text>`;
                                  } else {
                                    return `<rect x="${el.x}%" y="${el.y}%" width="${el.width || 20}%" height="${el.height || 20}%" fill="${el.color || '#475569'}" rx="4" />`;
                                  }
                                }).join('\n')}
                              </svg>`;
                              
                              const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `vector_layer_${layer.type}.svg`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            className="text-left text-[9px] text-cyan-400/90 hover:text-cyan-300 font-semibold uppercase flex items-center gap-1 cursor-pointer mt-1"
                          >
                            📥 EXPORT LAYER SVG
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {lang === 'bn' ? 'ডিজাইনের বিভিন্ন অংশকে আলাদা আলাদা ডেপথ-আইসোলেটেড ভেক্টর প্লেটে ভাগ করুন।' : 'Isolate graphic plates into 3 separate depth vector groups to selectively export high-fidelity SVGs.'}
                  </p>
                )}
              </div>

              {/* 2. TEXT PROMPT FIELD */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase text-cyan-400 tracking-wider">
                  {lang === 'bn' ? '২. আপনার টেক্সট বা ডিজাইন আইডিয়া' : '2. Your Text / Design Requirements'}
                </label>
                <textarea
                  value={copilotPrompt}
                  onChange={(e) => setCopilotPrompt(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: শুভ নববর্ষের একটি পোস্টার বানিয়ে দাও লাল আর সাদা কালার প্যালেটে...' : 'e.g. Congratulations greeting card for graduating students with red accents...'}
                  className="w-full h-20 bg-slate-950 border border-slate-850 text-xs text-white placeholder-slate-600 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 3. GENERATION TRIGGER ACTIONS */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => generateAiDesigns && generateAiDesigns(copilotPrompt)}
                  disabled={isGeneratingDesigns || !copilotPrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-850 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-950/50"
                >
                  {isGeneratingDesigns ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'bn' ? 'ডিজাইন তৈরি হচ্ছে...' : 'GENERATING DESIGNS...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>{lang === 'bn' ? 'এআই ডিজাইন জেনারেট করুন' : 'GENERATE AI DESIGNS'}</span>
                    </>
                  )}
                </button>

                {/* Local Fallback Cooperative Workflow Option */}
                <button
                  onClick={runCopilotWorkflow}
                  disabled={copilotStatus !== 'idle' || !copilotPrompt.trim()}
                  className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:border-slate-700 disabled:bg-slate-950/30 text-slate-400 hover:text-cyan-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  {copilotStatus !== 'idle' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>LOCAL AGENT ACTIVE...</span>
                    </>
                  ) : (
                    <>
                      <Folder className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'লোকাল কো-অপ ইঞ্জিন চালান' : 'RUN LOCAL CO-OP'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Classic Copilot Logs (retained) */}
              {copilotLogs.length > 0 && (
                <div className="border border-slate-850 bg-slate-950 p-3 rounded-xl max-h-48 overflow-y-auto font-mono text-[9px] text-cyan-400/80 space-y-1">
                  {copilotLogs.map((log, i) => (
                    <div key={i} className="border-b border-slate-900 pb-1 last:border-0">{log}</div>
                  ))}
                </div>
              )}

              {/* 4. AI GENERATED LAYOUT OPTIONS GRID */}
              {aiGeneratedOptions && aiGeneratedOptions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-850">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase text-emerald-400 tracking-wider">
                      {lang === 'bn' ? '৩টি কাস্টম ডিজাইন বিকল্প' : '3 Generated Design Options'}
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded border border-emerald-500/20">
                      READY TO LOAD
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {aiGeneratedOptions.map((opt, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-950 border border-slate-850 rounded-xl p-3 hover:border-emerald-500/50 transition-all space-y-2 relative overflow-hidden group"
                      >
                        <div className="absolute right-2 top-2 px-1.5 py-0.5 bg-slate-900 rounded text-[9px] font-mono text-slate-400">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">
                            {lang === 'bn' ? opt.nameBn || opt.name : opt.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                            {opt.description}
                          </p>
                        </div>

                        {/* Summary details */}
                        <div className="flex flex-wrap gap-1 text-[9px] text-slate-500 font-mono">
                          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">
                            Bg: {opt.background?.type || 'color'}
                          </span>
                          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">
                            Layers: {opt.elements?.length || 0}
                          </span>
                        </div>

                        {/* Edit Design / Load into Canvas */}
                        <button
                          onClick={() => {
                            if (setElements && setCanvasBg) {
                              // Assign unique ids to prevent duplicate React key errors
                              const layers = (opt.elements || []).map((el: any, i: number) => ({
                                ...el,
                                id: `ai_layer_${Date.now()}_${i}`
                              }));
                              setElements(layers);
                              setCanvasBg({
                                type: opt.background?.type || 'color',
                                value: opt.background?.value || '#ffffff',
                                overlayOpacity: 0.3
                              });
                            }
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-950" />
                          <span>{lang === 'bn' ? 'ডিজাইন ক্যানভাসে লোড করুন' : 'LOAD INTO CANVAS'}</span>
                        </button>

                        {/* Rating / Interactive Feedback Loop */}
                        <div className="flex gap-1 pt-2 justify-between border-t border-slate-900/60 mt-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase self-center flex items-center gap-0.5">
                            FEEDBACK:
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                if (setUserRatings) {
                                  const alreadyRated = userRatings.some((r: any) => r.name === opt.name);
                                  if (alreadyRated) {
                                    setUserRatings(userRatings.map((r: any) => r.name === opt.name ? { ...r, rating: 'keep' } : r));
                                  } else {
                                    setUserRatings([...userRatings, { name: opt.name, rating: 'keep' }]);
                                  }
                                }
                              }}
                              className={`px-2 py-0.5 text-[9px] font-black rounded uppercase flex items-center gap-1 cursor-pointer transition-all ${
                                userRatings && userRatings.some((r: any) => r.name === opt.name && r.rating === 'keep')
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-slate-900 text-slate-400 border border-slate-850 hover:text-white'
                              }`}
                            >
                              👍 KEEP
                            </button>
                            <button
                              onClick={() => {
                                if (setUserRatings) {
                                  const alreadyRated = userRatings.some((r: any) => r.name === opt.name);
                                  if (alreadyRated) {
                                    setUserRatings(userRatings.map((r: any) => r.name === opt.name ? { ...r, rating: 'regenerate' } : r));
                                  } else {
                                    setUserRatings([...userRatings, { name: opt.name, rating: 'regenerate' }]);
                                  }
                                }
                              }}
                              className={`px-2 py-0.5 text-[9px] font-black rounded uppercase flex items-center gap-1 cursor-pointer transition-all ${
                                userRatings && userRatings.some((r: any) => r.name === opt.name && r.rating === 'regenerate')
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                  : 'bg-slate-900 text-slate-400 border border-slate-850 hover:text-white'
                              }`}
                            >
                              👎 REGEN
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. LIVE AI CANVAS EDITOR CHAT (REFINE ACTIVE ELEMENTS) */}
              <div className="space-y-2 pt-3 border-t border-slate-850">
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-850 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-black uppercase text-cyan-300 tracking-wider">
                      {lang === 'bn' ? 'এআই ক্যানভাস চ্যাট অ্যাসিস্ট্যান্ট' : 'Live Canvas Editor Chat'}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400 mt-0.5">
                    {lang === 'bn' 
                      ? 'ক্যানভাসের ডিজাইনটিকে নিজের মতো করে আপডেট করুন। যেমন বলুন: "সব লেখার রঙ সাদা করো" বা "শুভ নববর্ষ টেক্সট যোগ করো"।'
                      : 'Talk to refine the loaded design. E.g., "Change the background color to light gray" or "Move the footer text down".'}
                  </p>

                  <textarea
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt && setRefinePrompt(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: টাইটেলের লেখা লাল করো এবং সাইজ বাড়িয়ে দাও...' : 'e.g., make the title text green and add a yellow border...'}
                    className="w-full h-16 bg-slate-950 border border-slate-850 text-xs text-white placeholder-slate-700 rounded-xl p-2 focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    onClick={() => refineDesignWithAi && refineDesignWithAi(refinePrompt)}
                    disabled={isRefiningDesign || !refinePrompt.trim()}
                    className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    {isRefiningDesign ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'bn' ? 'এডিট আপডেট হচ্ছে...' : 'EDITING CANVAS...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>{lang === 'bn' ? 'এআই এডিট আপডেট করুন' : 'APPLY AI EDITS'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ROADMAP */}
          {sidebarTab === 'roadmap' && (
            <div className="space-y-3 animate-fade-in text-slate-200">
              
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl">
                {['all', 'core', 'creative', 'advanced'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setRoadmapCategory(c)}
                    className={`flex-1 py-1 rounded text-[9px] font-black uppercase ${roadmapCategory === c ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={roadmapSearch}
                  onChange={(e) => setRoadmapSearch(e.target.value)}
                  placeholder="Search roadmap features..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredRoadmapItems.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950/45 border border-slate-850 rounded-lg">
                    <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-widest">{item.category}</span>
                    <h4 className="text-[11px] font-bold text-white mt-0.5">{lang === 'bn' ? item.featureNameBn : item.featureName}</h4>
                    <p className="text-[9px] text-slate-400 mt-1">{lang === 'bn' ? item.descriptionBn : item.description}</p>
                  </div>
                ))}
                <button
                  onClick={() => setShowRoadmapModal(true)}
                  className="w-full py-1.5 bg-slate-800 text-[10px] font-mono text-slate-400 rounded-lg hover:text-white"
                >
                  VIEW FULL 1000+ ROADMAP
                </button>
              </div>

            </div>
          )}

        </div>
        
      </div>
    </div>
  );
}
