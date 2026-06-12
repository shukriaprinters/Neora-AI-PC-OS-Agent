import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv, Play, Pause, Volume2, VolumeX, Search, MessageSquare,
  Radio, Eye, Maximize2, Minimize2, Laptop, Film, Gamepad2, Settings2, Plus, Sparkles, AlertCircle, Share2
} from 'lucide-react';
import { neoraPost } from '../lib/neoraApi';

interface NeoraTVProps {
  lang: 'en' | 'bn';
}

interface Channel {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  url: string;
  views: number;
  tags: string[];
  description: string;
  descriptionBn: string;
}

const DEFAULT_CHANNELS: Channel[] = [
  {
    id: "shukria-live",
    name: "Shukria Prints Dev Stream",
    nameBn: "শুকরিয়া প্রিন্টস ডেভ স্ট্রিম",
    category: "Workshop",
    categoryBn: "কর্মশালা",
    url: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=0",
    views: 4210,
    tags: ["Gloss", "PSD", "CMYK", "Guillotine"],
    description: "Real-time production, heavy printing, package-binding blueprints, and graphic design templates.",
    descriptionBn: "রিয়েল-টাইম উৎপাদন, ভারী প্রিন্টিং, প্যাকেজ-বাইন্ডিং ব্লুপ্রিন্ট এবং গ্রাফিক ডিজাইন টেমপ্লেট।"
  },
  {
    id: "nasa-stream",
    name: "NASA Space Telemetry",
    nameBn: "নাসা মহাকাশ টেলিমেট্রি",
    category: "Science",
    categoryBn: "বিজ্ঞান",
    url: "https://www.youtube.com/embed/21X5lGlDOfg?autoplay=1&mute=1&controls=0",
    views: 18240,
    tags: ["ISS", "NASA", "Space", "Universe"],
    description: "Live camera orbits, telemetry gauges, lunar landscape monitors, and cosmic data streaming feeds.",
    descriptionBn: "লাইভ ক্যামেরা অরবিট, টেলিমেট্রি গেজ, চন্দ্র পৃষ্ঠের মনিটর এবং মহাজাগতিক ডেটা স্ট্রিমিং ফিড।"
  },
  {
    id: "lofi-beats",
    name: "Neora Neural Lo-Fi Beats",
    nameBn: "নিওরা নিউরাল লো-ফাই বিটস",
    category: "Ambient Study",
    categoryBn: "পারিপার্শ্বিক শিক্ষা",
    url: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1",
    views: 9410,
    tags: ["Chill", "Concentration", "Deep Work", "Coding"],
    description: "Calm frequencies engineered to synchronize cognitive pathways for deep software testing sessions.",
    descriptionBn: "গভীর সফটওয়্যার টেস্টিং সেশনের জন্য মস্তিষ্কের তরঙ্গ সংশ্লেষিত করার উপযোগী শান্ত তরঙ্গের সুর।"
  },
  {
    id: "dhaka-news",
    name: "Dhaka Tech & Media Live",
    nameBn: "ঢাকা টেক ও মিডিয়া লাইভ",
    category: "News Tracker",
    categoryBn: "বার্তা ট্র্যাকার",
    url: "https://www.youtube.com/embed/U70hR17qYIQ?autoplay=1&mute=1",
    views: 1240,
    tags: ["Gulshan", "Silicon", "Tax Policy", "Monorepo"],
    description: "Tech developments across Bangladesh, pricing indices, and regional startup ecosystem developments.",
    descriptionBn: "বাংলাদেশজুড়ে প্রযুক্তির অগ্রগতি, কর নীতিমালা এবং আঞ্চলিক স্টার্টআপের সার্বিক খবর।"
  }
];

const SIMULATED_CHAT_MESSAGES = [
  { user: "Rahman_Printers", text: "Standard gloss setup pricing is excellent!", textBn: "স্ট্যান্ডার্ড গ্লস সেটআপের দাম দারুণ!" },
  { user: "Gulshan_Sufi", text: "Is the Neora local agent online?", textBn: "নিওরা লোকাল এজেন্ট কি অনলাইন?" },
  { user: "Tanim_Dev", text: "Typechecking cleared with zero warnings! Awesome.", textBn: "টাইপ-চেকিং শূন্য ওয়ার্নিং নিয়ে সম্পন্ন হয়েছে!" },
  { user: "Sarker_Ink", text: "Need urgent CMYK layout adjustment.", textBn: "জরুরি সিএমওয়াইকে লেআউট সমন্বয় দরকার।" },
  { user: "Hologram_N", text: "Interface feels incredibly fast today.", textBn: "আজ ইন্টারফেসটি অবিশ্বাস্য রকমের দ্রুত লাগছে।" },
  { user: "Aisha_Khan", text: "Waiting for the next briefing voice stream.", textBn: "পরবর্তী ব্রিফিংয়ের ভয়েস স্ট্রিমের জন্য অপেক্ষা করছি।" },
  { user: "Z_Core", text: "Is there an automated backup running?", textBn: "কোনো অটোমেটেড ব্যাকআপ চলছে কি?" },
  { user: "Shukria_Boss", text: "Please process the quarterly bill template.", textBn: "দয়া করে ত্রৈমাসিক বিলের টেমপ্লেটটি প্রসেস করুন।" }
];

export function NeoraTV({ lang }: NeoraTVProps) {
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('neora_tv_custom_channels');
    return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
  });
  const [activeChannel, setActiveChannel] = useState<Channel>(channels[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(30);
  const [bitrate, setBitrate] = useState<string>("1080p Neural");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<"standard" | "hologram" | "amber" | "cyberpunk" | "monochrome">("hologram");
  const [chatMessages, setChatMessages] = useState<{ user: string; text: string; time: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"channels" | "controls" | "logs">("channels");
  const [sysActionStatus, setSysActionStatus] = useState<string | null>(null);

  // Chat simulator
  useEffect(() => {
    // Seed message
    setChatMessages([
      { user: "Neora_Engine", text: lang === 'bn' ? "মিডিয়া স্ট্রিম সফলভাবে সংযুক্ত হয়েছে।" : "Media stream successfully connected.", time: "16:19" },
      { user: "System", text: lang === 'bn' ? "হোস্ট অডিও পোল সিঙ্ক সম্পন্ন।" : "Host audio poll sync completed.", time: "16:20" }
    ]);

    const interval = setInterval(() => {
      if (!isPlaying) return;
      const index = Math.floor(Math.random() * SIMULATED_CHAT_MESSAGES.length);
      const msg = SIMULATED_CHAT_MESSAGES[index];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setChatMessages(prev => [
        {
          user: msg.user,
          text: lang === 'bn' ? msg.textBn : msg.text,
          time: timeStr
        },
        ...prev.slice(0, 30) // cap at 30
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying, lang]);

  // Handle custom channel addition
  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customName.trim()) return;

    let embedUrl = customUrl.trim();
    // Helper to turn watch link into embed
    if (embedUrl.includes("youtube.com/watch?v=")) {
      embedUrl = embedUrl.replace("watch?v=", "embed/");
    } else if (embedUrl.includes("youtu.be/")) {
      const parts = embedUrl.split("youtu.be/");
      if (parts[1]) embedUrl = `https://www.youtube.com/embed/${parts[1].split(/[?#]/)[0]}`;
    }

    const newChan: Channel = {
      id: `custom-${Date.now()}`,
      name: customName,
      nameBn: customName,
      category: "Personal Stream",
      categoryBn: "নিজস্ব স্ট্রিম",
      url: embedUrl,
      views: 1,
      tags: ["User Stream", "WebTV"],
      description: "Direct user-configured streaming network link and remote monitor feed.",
      descriptionBn: "সরাসরি ব্যবহারকারী দ্বারা কনফিগার করা দূরবর্তী স্ট্রিমিং ও মনিটর লিংক।"
    };

    const nextChans = [...channels, newChan];
    setChannels(nextChans);
    localStorage.setItem('neora_tv_custom_channels', JSON.stringify(nextChans));
    setActiveChannel(newChan);
    setCustomUrl("");
    setCustomName("");
    setShowAddModal(false);
  };

  const handleResetChannels = () => {
    if (window.confirm(lang === 'bn' ? "সব চ্যানেল কি ডিফল্ট অবস্থায় ফিরিয়ে নেবেন?" : "Reset channels to defaults?")) {
      setChannels(DEFAULT_CHANNELS);
      localStorage.removeItem('neora_tv_custom_channels');
      setActiveChannel(DEFAULT_CHANNELS[0]);
    }
  };

  // Aspect ratio and recording states
  const [aspectRatio, setAspectRatio] = useState<"16-9" | "21-9" | "1-1">("16-9");
  const [eqPreset, setEqPreset] = useState<"flat" | "bass" | "vocal" | "ambient">("flat");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recSeconds, setRecSeconds] = useState<number>(0);
  const recIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      recIntervalRef.current = setInterval(() => {
        setRecSeconds(s => s + 1);
      }, 1000);
    } else {
      if (recIntervalRef.current) {
        clearInterval(recIntervalRef.current);
        recIntervalRef.current = null;
      }
      setRecSeconds(0);
    }
    return () => {
      if (recIntervalRef.current) clearInterval(recIntervalRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setSysActionStatus(lang === 'bn' ? "লাইভ স্ট্রিম রেকর্ড শুরু হচ্ছে..." : "Initializing stream frame recorder...");
    } else {
      setIsRecording(false);
      setSysActionStatus(lang === 'bn' ? `রেকর্ড সফল! clip_${Date.now()}.mp4 ফোল্ডারে সেভ করা হয়েছে` : `Snippet clip_${Date.now()}.mp4 successfully compiled and stored to dashboard assets!`);
    }
    setTimeout(() => setSysActionStatus(null), 4000);
  };

  const handleToggleMute = () => {
    setIsMuted(curr => !curr);
    setSysActionStatus(lang === 'bn' ? "মিউট স্ট্যাটাস পরিবর্তন হয়েছে" : "Visual player audio mute toggled.");
    setTimeout(() => setSysActionStatus(null), 2500);
  };

  return (
    <div id="neora-tv-workspace" className="flex-1 flex flex-col h-full bg-[#000612] text-slate-100 overflow-hidden relative">
      
      {/* Top Banner Accent */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-cyan-500/10 background-noise" style={{
        background: 'linear-gradient(180deg, rgba(0,10,32,0.8) 0%, rgba(0,6,18,0.95) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 animate-pulse" style={{ boxShadow: '0 0 15px rgba(0,212,255,0.15)' }}>
            <Tv className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold font-sans tracking-widest text-[#00d4ff] uppercase">
                {lang === 'bn' ? 'নিওরা টিভি ওয়ার্কস্পেস' : 'NEORA TV HUB'}
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-400 font-bold uppercase animate-pulse">
                {lang === 'bn' ? 'লাইভ ফিড' : 'LIVE CONSOLE'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5 tracking-wide">
              {lang === 'bn' ? 'স্ট্রিমিং কন্ট্রোল এবং মাল্টিমিডিয়া সেন্টার' : 'Neural Streaming Engine & Studio Controller'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-cyan-500/25 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'চ্যানেল যুক্ত করুন' : 'ADD FEED'}</span>
          </button>
          
          <button
            onClick={handleResetChannels}
            title="Reset channels to defaults"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-all cursor-pointer text-xs font-mono"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 overflow-hidden">
        
        {/* Left Column: List & Stream Settings */}
        <div className="col-span-1 border-r border-cyan-500/10 flex flex-col h-full bg-[#000a1f]/35 overflow-hidden">
          
          {/* Internal Tabs */}
          <div className="shrink-0 flex border-b border-cyan-500/10 bg-[#00081d]">
            {([
              { id: "channels", label: lang === 'bn' ? "চ্যানেলসমূহ" : "CHANNELS" },
              { id: "controls", label: lang === 'bn' ? "ভিডিও সেটিংস" : "STREAM SETTINGS" }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-center text-[10px] font-bold font-mono transition-all border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-950/15'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === "channels" ? (
              <div className="space-y-2">
                <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest pl-1 mb-1">
                  {lang === 'bn' ? 'সিস্টেম স্ট্রিমিং নেটওয়ার্ক' : 'NEURAL TRANSMISSIONS'}
                </div>
                {channels.map((ch) => {
                  const isActive = activeChannel.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChannel(ch);
                        setIsPlaying(true);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        isActive
                          ? 'bg-cyan-950/20 border-cyan-500/30 text-white shadow-[0_0_12px_rgba(0,212,255,0.06)]'
                          : 'bg-transparent border-slate-900 hover:bg-slate-950/50 hover:border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900/80 text-slate-500'
                        }`}>
                          {lang === 'bn' ? ch.categoryBn : ch.category}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Eye className="w-3 h-3 text-cyan-500/40" />
                          <span>{ch.views.toLocaleString()}</span>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold font-sans tracking-wide mb-1 leading-tight">
                        {lang === 'bn' ? ch.nameBn : ch.name}
                      </h3>
                      <p className="text-[10.5px] leading-relaxed text-slate-400 line-clamp-2">
                        {lang === 'bn' ? ch.descriptionBn : ch.description}
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {ch.tags.map(t => (
                          <span key={t} className="text-[9px] font-mono bg-slate-900/60 border border-slate-800 px-1.5 py-0.2 rounded text-slate-500">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Stream Recorder & Buffer Controller */}
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold font-sans text-cyan-400">{lang === 'bn' ? 'সরাসরি স্ট্রিম রেকর্ডার' : 'STREAM DIGITIZER & CLIPPER'}</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-slate-400">
                    {lang === 'bn' ? 'লাইভ স্ট্রিমের বিশেষ মুহূর্ত রেকর্ড করুন এবং সিস্টেম ড্যাশবোর্ডে ক্লিপ আকারে সংরক্ষণ করুন।' : 'Digitize incoming stream frames locally to capture reference clips or graphic resources.'}
                  </p>

                  <div className="flex items-center gap-2.5 bg-black/40 border border-slate-900 p-2 rounded-lg">
                    <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`} />
                    <span className="text-[10px] font-mono text-slate-300">
                      {isRecording 
                        ? (lang === 'bn' ? `রেকর্ডিং চলছে: ${recSeconds} সেকেন্ড` : `REC: ${recSeconds}s`) 
                        : (lang === 'bn' ? 'রেকর্ড ইনঅ্যাক্টিভ' : 'RECORDER IDLE')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-mono font-bold transition-all border text-center cursor-pointer ${
                        isRecording 
                          ? 'border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25' 
                          : 'border-cyan-500/25 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                      }`}
                    >
                      {isRecording ? (lang === 'bn' ? 'রেকর্ড বন্ধ করুন' : 'STOP CLIP') : (lang === 'bn' ? 'রেকর্ড করুন' : 'RECORD STREAM')}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className="px-2.5 py-1.5 rounded border border-slate-800 bg-slate-900/60 text-slate-300 font-mono text-[10px] font-bold hover:bg-slate-800 transition-colors cursor-pointer text-center"
                    >
                      {isMuted ? (lang === 'bn' ? 'আনমিউট করুন' : 'UNMUTE AUDIO') : (lang === 'bn' ? 'মিউট করুন' : 'MUTE AUDIO')}
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio Simulator */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block pl-1">
                    {lang === 'bn' ? 'অ্যাসপেক্ট রেশিও' : 'MONITOR VIEWPORT SCALE'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { id: "16-9", label: "16:9 WIDE" },
                      { id: "21-9", label: "21:9 CINE" },
                      { id: "1-1", label: "1:1 SQUARE" }
                    ] as const).map(ratio => (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => {
                          setAspectRatio(ratio.id);
                          setSysActionStatus(lang === 'bn' ? "রেশিও পরিবর্তন করা হয়েছে" : `Viewport aligned to ${ratio.id}`);
                          setTimeout(() => setSysActionStatus(null), 2500);
                        }}
                        className={`py-1 rounded-lg text-[9px] font-mono font-bold border transition-all text-center cursor-pointer ${
                          aspectRatio === ratio.id
                            ? 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300'
                            : 'border-slate-850 bg-slate-950/60 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter effects preset selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block pl-1">
                    {lang === 'bn' ? 'ফিল্টার মোড' : 'HOLOGRAPHIC FILTER LAYER'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([
                      { id: "standard", label: "STANDARD" },
                      { id: "hologram", label: "NEURAL BLUE" },
                      { id: "amber", label: "AMBER GAUG" },
                      { id: "cyberpunk", label: "GLITCH NEO" },
                      { id: "monochrome", label: "SILVER COAT" }
                    ] as const).map(filt => (
                      <button
                        key={filt.id}
                        onClick={() => setFilterMode(filt.id)}
                        className={`py-1.5 px-2 rounded-lg text-[9px] font-mono font-bold border transition-all text-center cursor-pointer ${
                          filterMode === filt.id
                            ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                            : 'border-slate-850 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {filt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom system action log notifier */}
                <AnimatePresence>
                  {sysActionStatus && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex items-start gap-2 text-[10px] text-cyan-300 font-mono leading-relaxed"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-cyan-400 animate-spin mt-0.5" />
                      <div>{sysActionStatus}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Video Player & Audience Feed */}
        <div className="col-span-1 xl:col-span-3 flex flex-col h-full overflow-hidden bg-[#00050e]">
          
          {/* Live Video Monitor Stage */}
          <div className="flex-1 p-4 flex flex-col min-h-0 overflow-y-auto">
            <div className={`relative rounded-2xl overflow-hidden w-full bg-slate-950 border border-cyan-500/15 transition-all duration-300 ${
              aspectRatio === "16-9" ? "aspect-video" :
              aspectRatio === "21-9" ? "aspect-[21/9]" : "aspect-square"
            }`} style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,212,255,0.05)'
            }}>
              
              {/* Filter Overlays */}
              {filterMode === "hologram" && (
                <div className="absolute inset-0 pointer-events-none z-10" style={{
                  background: 'radial-gradient(circle, transparent 40%, rgba(0,212,255,0.1) 100%)',
                  mixBlendMode: 'screen',
                  boxShadow: 'inset 0 0 80px rgba(0,212,255,0.15)'
                }} >
                  <div className="absolute inset-0 scanline-overlay opacity-25" />
                </div>
              )}

              {filterMode === "amber" && (
                <div className="absolute inset-0 pointer-events-none z-10" style={{
                  background: 'rgba(245,166,35,0.08)',
                  mixBlendMode: 'color-burn',
                  boxShadow: 'inset 0 0 100px rgba(245,166,35,0.2)'
                }} >
                  <div className="absolute inset-0 scanline-overlay opacity-30 text-amber-500" />
                </div>
              )}

              {filterMode === "cyberpunk" && (
                <div className="absolute inset-0 pointer-events-none z-10" style={{
                  background: 'radial-gradient(circle, transparent 30%, rgba(236,72,153,0.1) 100%)',
                  mixBlendMode: 'color-dodge',
                }} >
                  <div className="absolute inset-0 scanline-overlay opacity-40" />
                  <div className="absolute inset-0 animate-pulse bg-pink-500/5" />
                </div>
              )}

              {filterMode === "monochrome" && (
                <div className="absolute inset-0 pointer-events-none z-10 grayscale contrast-125 opacity-90 mix-blend-color" />
              )}

              {/* Video elements */}
              {isPlaying ? (
                <iframe
                  id="active-webtv-frame"
                  src={activeChannel.url}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div id="webtv-paused-stage" className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#01091a]">
                  <Tv className="w-16 h-16 text-slate-800 mb-3 animate-pulse" />
                  <p className="text-sm font-mono text-slate-500 font-bold uppercase tracking-widest">
                    {lang === 'bn' ? 'স্ট্রিমিং সংযোগ বন্ধ আছে' : 'TRANSMISSION TERMINATED'}
                  </p>
                  <p className="text-xs text-slate-600 font-mono mt-1">
                    {lang === 'bn' ? 'সরাসরি লাইভ ফিড চালু করতে প্লে বাটন চাপুন।' : 'Press Play to establish neural network link.'}
                  </p>
                </div>
              )}

              {/* Glitch Overlay Banner if cyberpunk mode */}
              {filterMode === "cyberpunk" && isPlaying && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-pink-600 text-white font-mono text-[9px] font-bold tracking-widest rounded uppercase">
                  DECODING NEURAL SIG: OK
                </div>
              )}
            </div>

            {/* Video Meta Info */}
            <div className="mt-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-1.5">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-500/15 px-2 py-0.5 rounded-full font-bold uppercase inline-block mb-1.5">
                  {lang === 'bn' ? activeChannel.categoryBn : activeChannel.category}
                </span>
                <h2 className="text-sm font-bold font-sans tracking-wide text-white leading-snug">
                  {lang === 'bn' ? activeChannel.nameBn : activeChannel.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl">
                  {lang === 'bn' ? activeChannel.descriptionBn : activeChannel.description}
                </p>
              </div>

              {/* Streaming metrics */}
              <div className="flex items-center gap-2.5 self-start lg:self-center">
                <div className="text-right hidden sm:block">
                  <div className="text-[9px] font-mono text-slate-500">{lang === 'bn' ? 'ভিডিও রেজোলিউশন' : 'FREQUENCY RESOLUTION'}</div>
                  <div className="text-xs font-mono font-bold text-cyan-400">{bitrate}</div>
                </div>
                <div className="h-8 w-px bg-slate-800 hidden sm:block" />
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                    isPlaying ? 'bg-red-950/20 border-red-500/30 text-red-400' : 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cyan-400 fill-current" />}
                </button>
                <button
                  onClick={handleToggleMute}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                    isMuted ? 'bg-orange-950/20 border-orange-500/30 text-orange-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                  title="Toggle Audio Mute"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Custom Audience Chat / Real-time Terminal Log Stream */}
            <div className="mt-4 flex-1 flex flex-col min-h-[160px] max-h-[300px] border border-cyan-500/10 bg-[#000a20]/30 rounded-2xl overflow-hidden">
              <div className="shrink-0 px-4 py-2 bg-[#000615] border-b border-cyan-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-500/70" />
                  <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    {lang === 'bn' ? 'লাইভ ফিডব্যাক এবং ডায়াগনস্টিকস' : 'AUDIENCE FEEDBACK & DIAGNOSTIC INTERACTION'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{lang === 'bn' ? 'সরাসরি সম্প্রচার শুরু' : 'STREAM SECURE'}</span>
                </div>
              </div>

              {/* Chat Messages Log Scroll */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-[11px] min-h-0">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="flex items-start gap-2.5 px-3 py-1.5 rounded bg-slate-950/20 border border-slate-900/30">
                    <span className="text-[10px] text-slate-500 shrink-0">{msg.time}</span>
                    <span className="text-cyan-400 font-bold shrink-0">{msg.user}:</span>
                    <span className="text-slate-300">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* NEW CHANNEL MODAL OVERLAY */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#000814]/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#000d26] border border-cyan-500/20 rounded-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold font-sans text-cyan-400 uppercase tracking-widest">
                    {lang === 'bn' ? 'চ্যানেল যোগ করুন' : 'ADD NEW CHANNEL FEED'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer text-xs font-mono font-bold"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleAddChannel} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold block">
                    {lang === 'bn' ? 'চ্যানেলের নাম' : 'FEED / STREAM TITLE'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: আমাদের স্পেশাল সেশন' : 'e.g. Shukria Gloss Output Monitor'}
                    className="w-full bg-[#000511] border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold block">
                    {lang === 'bn' ? 'ইউআরএল (লিংক)' : 'YOUTUBE OR EMBED VIDEO URL'}
                  </label>
                  <input
                    type="url"
                    required
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[#000511] border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-slate-400 font-bold hover:text-white transition-all cursor-pointer"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'CANCEL'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    {lang === 'bn' ? 'সংরক্ষণ করুন' : 'SAVE STREAM'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
