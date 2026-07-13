import React, { useState, useEffect, useRef } from "react";
import {
  Hammer, Code2, Play, Download, Sparkles, RefreshCw, AlertTriangle, CheckCircle,
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown, ChevronUp, Copy, Search, PlayCircle,
  Cpu, Trash2, Edit2, Plus, Terminal, Zap, Laptop, ArrowRight, ArrowLeft, Languages, Menu, Upload, Layers, Gamepad2, CloudLightning,
  FileCode, TerminalSquare, HardDrive, FolderPlus, FilePlus, AlertCircle, Monitor, MessageSquare, Send, Trash, PlusCircle, Globe,
  ExternalLink, GitPullRequest, Github, Cloud, Lock, BookOpen, Sliders, Eye, EyeOff, Wand2, Mic, MicOff,
  Check, X, Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { neoraGet, neoraPost } from "../lib/neoraApi";
import { aiSkillsList, AISkill } from "./skillsData";

interface FileItem {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileItem[];
}

interface ProjectPreset {
  id: string;
  name: string;
  description: string;
  type: "web" | "app" | "game" | "software";
  prompt: string;
  icon: any;
  files: FileItem[];
}

export function BuilderView({
  lang,
  ollamaDiagnosticStatus = "checking",
  onChangeLang
}: {
  lang: "en" | "bn";
  ollamaDiagnosticStatus?: string;
  onChangeLang?: (l: "en" | "bn") => void;
}) {
  const ollamaStatus = ollamaDiagnosticStatus;

  // Default Presets
  const presets: ProjectPreset[] = [
    {
      id: "weather",
      name: lang === "bn" ? "রিয়েল-টাইম ওয়েদার ড্যাশবোর্ড" : "Real-time Weather Dashboard",
      description: lang === "bn" ? "অ্যানিমেটেড ওয়েদার কার্ড এবং ডায়নামিক পারফরম্যান্স ড্যাশবোর্ড।" : "Animated weather cards and dynamic forecasting performance dashboard.",
      type: "web",
      icon: Laptop,
      prompt: "Create a highly animated real-time weather application showing current temperature in Dhaka, standard forecasting metrics, wind speed dials, humidity curves, and custom thematic gradients.",
      files: [
        {
          name: "src",
          type: "folder",
          children: [
            {
              name: "App.tsx",
              type: "file",
              content: `import React, { useState } from 'react';\nimport { Sun, CloudRain, Wind, Droplets, MapPin, Search } from 'lucide-react';\n\nexport default function WeatherApp() {\n  const [city, setCity] = useState("Dhaka");\n  const [temp, setTemp] = useState(32);\n  \n  return (\n    <div className="p-6 bg-slate-900 text-cyan-200 rounded-2xl border border-cyan-500/20 shadow-2xl">\n      <div className="flex items-center gap-3 mb-6">\n        <MapPin className="text-cyan-400 animate-bounce" />\n        <span className="font-mono text-xs uppercase tracking-widest text-cyan-500">Live Weather Station</span>\n      </div>\n      <div className="text-center mb-8">\n        <h2 className="text-2xl font-bold font-sans text-white">{city}</h2>\n        <p className="text-6xl font-black font-mono text-cyan-400 my-4">{temp}°C</p>\n        <p className="text-sm font-sans text-cyan-300/70">Partly Cloudy • High Humidity</p>\n      </div>\n      <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-950/50 p-4 rounded-xl border border-cyan-500/5">\n        <div className="flex items-center gap-2">\n          <Wind className="w-4 h-4 text-cyan-400" />\n          <span>WIND: 14 km/h</span>\n        </div>\n        <div className="flex items-center gap-2">\n          <Droplets className="w-4 h-4 text-cyan-400" />\n          <span>HUMIDITY: 82%</span>\n        </div>\n      </div>\n    </div>\n  );\n}`
            },
            {
              name: "index.css",
              type: "file",
              content: `@import "tailwindcss";\nbody {\n  background-color: #020617;\n  color: #e2e8f0;\n}`
            }
          ]
        },
        {
          name: "package.json",
          type: "file",
          content: `{\n  "name": "neora-weather-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "lucide-react": "^0.294.0"\n  }\n}`
        },
        {
          name: "README.md",
          type: "file",
          content: `# Weather Station App\nGenerated autonomously by Neora AI Builder.\nFully compiled and ready for instant container hosting.`
        }
      ]
    },
    {
      id: "game",
      name: lang === "bn" ? "অটোনমাস রেট্রো ফ্ল্যাপি গেম" : "Retro Flappy Arcade Game",
      description: lang === "bn" ? "রিয়েল-টাইম স্কোর ট্র্যাকার সহ একটি সম্পূর্ণ প্লে-এবল ওয়েব গেম।" : "A fully playable retro canvas arcade game with scores and physics loop.",
      type: "game",
      icon: Gamepad2,
      prompt: "Generate a fully interactive side-scrolling flappy arcade game on a Canvas. Include retro neon sound cues, scoring counters, automatic physics controls, and progressive difficulty multipliers.",
      files: [
        {
          name: "src",
          type: "folder",
          children: [
            {
              name: "App.tsx",
              type: "file",
              content: `import React, { useState, useEffect } from 'react';\n\nexport default function FlappyArcade() {\n  const [score, setScore] = useState(0);\n  const [highScore, setHighScore] = useState(0);\n  const [playing, setPlaying] = useState(false);\n  \n  return (\n    <div className="p-6 bg-slate-950 rounded-2xl border border-pink-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)] text-center">\n      <h3 className="text-lg font-mono text-pink-400 tracking-wider mb-4">NEON ARCADE: FLAPPY NEORA</h3>\n      <div className="relative h-48 bg-slate-900 rounded-xl overflow-hidden border border-pink-500/10 flex flex-col items-center justify-center">\n        {playing ? (\n          <div className="text-xs font-mono text-pink-300 animate-pulse">GAME IS RUNNING... CLICK 'TAP TO FLAP'</div>\n        ) : (\n          <button onClick={() => setPlaying(true)} className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-500 text-white font-mono font-bold text-xs">START NEW SESSION</button>\n        )}\n      </div>\n      <div className="flex justify-between font-mono text-xs mt-4 text-pink-200/80">\n        <span>SCORE: {score}</span>\n        <span>HIGH SCORE: {highScore}</span>\n      </div>\n    </div>\n  );\n}`
            }
          ]
        },
        {
          name: "package.json",
          type: "file",
          content: `{\n  "name": "neora-retro-game",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}`
        }
      ]
    },
    {
      id: "productivity",
      name: lang === "bn" ? "প্রোডাক্টিভিটি প্ল্যানার ও পমোডোরো" : "Productivity Planner & Pomodoro",
      description: lang === "bn" ? "অর্গানাইজড চেকলিস্ট, ক্যাটাগরি এবং একটি লাইভ কাউন্টডাউন টাইমার।" : "Organized task checklists, tags, custom categories, and a working Pomodoro clock.",
      type: "app",
      icon: Folder,
      prompt: "Build an elegant, dark slate workflow planner. Integrate custom checklist nodes, progress bars, local persistence caches, priority levels, and a beautiful working Pomodoro focus count-down timer.",
      files: [
        {
          name: "src",
          type: "folder",
          children: [
            {
              name: "App.tsx",
              type: "file",
              content: `import React, { useState } from 'react';\nimport { Check, Trash, Plus, Clock } from 'lucide-react';\n\nexport default function TodoPlanner() {\n  const [todos, setTodos] = useState([\n    { id: 1, text: "Design software interface", done: true },\n    { id: 2, text: "Enable AI compiler logs", done: false }\n  ]);\n  \n  return (\n    <div className="p-5 bg-slate-900 text-slate-100 rounded-xl border border-violet-500/20">\n      <h2 className="text-sm font-mono text-violet-400 tracking-widest mb-4 uppercase">FOCUS PLANNER</h2>\n      <div className="space-y-2 mb-4">\n        {todos.map(t => (\n          <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-950/45 rounded border border-violet-500/5">\n            <span className={t.done ? "line-through text-slate-500" : ""}>{t.text}</span>\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}`
            }
          ]
        },
        {
          name: "package.json",
          type: "file",
          content: `{\n  "name": "neora-productivity-planner",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "lucide-react": "^0.294.0"\n  }\n}`
        }
      ]
    },
    {
      id: "custom",
      name: lang === "bn" ? "ব্ল্যাঙ্ক ক্যানভাস প্রোজেক্ট" : "Blank Canvas Project",
      description: lang === "bn" ? "আপনার নিজস্ব প্রম্পট এবং সংযুক্ত UI স্ক্রিনশট দিয়ে শূন্য থেকে শুরু করুন।" : "Start from scratch with your custom prompts and uploaded mockup images.",
      type: "software",
      icon: Code2,
      prompt: "",
      files: [
        {
          name: "src",
          type: "folder",
          children: [
            {
              name: "App.tsx",
              type: "file",
              content: `export default function CustomApp() {\n  return (\n    <div className="p-8 text-center text-slate-400 font-mono text-xs">\n      [Empty Canvas] Enter a prompt to generate software...\n    </div>\n  );\n}`
            }
          ]
        }
      ]
    }
  ];

  const [activePresetId, setActivePresetId] = useState<string>("weather");
  const [builderTab, setBuilderTab] = useState<"aistudio" | "workspace">("aistudio");
  const [sidebarSubTab, setSidebarSubTab] = useState<string>("playground");
  const [studioPromptInput, setStudioPromptInput] = useState<string>("");
  const [historyPrompts, setHistoryPrompts] = useState<string[]>([
    "Personal budget visualizer with animated doughnut charts and CSV exporter",
    "Realtime markdown notes board with folder grouping and color tags",
    "Beautiful Pomodoro focus clock with offline sound synthesis",
    "Side-scrolling arcade flappy space bird canvas game"
  ]);
  const [prompt, setPrompt] = useState<string>("");
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compileProgress, setCompileProgress] = useState<number>(0);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [projectFiles, setProjectFiles] = useState<FileItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("src/App.tsx");
  const [selectedFileContent, setSelectedFileContent] = useState<string>("");
  const [editorValue, setEditorValue] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [appHealth, setAppHealth] = useState<number>(100);
  const [simulatedErrors, setSimulatedErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<string>("");

  // New States for Local File Upload & Advanced Operations
  const workspaceFileInputRef = useRef<HTMLInputElement>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<"sandbox" | "hostpc">("sandbox");
  const [pcFilePath, setPcFilePath] = useState<string>("C:\\test_neora.txt");
  const [pcCommandInput, setPcCommandInput] = useState<string>("");
  const [isPcLoadingFile, setIsPcLoadingFile] = useState<boolean>(false);
  const [isPcWritingFile, setIsPcWritingFile] = useState<boolean>(false);
  const [pcConsoleLogs, setPcConsoleLogs] = useState<string[]>([]);
  const [pcAgentStatus, setPcAgentStatus] = useState<"online" | "offline">("offline");

  // Resource Fetcher States
  const [fetchUrl, setFetchUrl] = useState<string>("");
  const [fetchedContent, setFetchedContent] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isFetcherOpen, setIsFetcherOpen] = useState<boolean>(false);
  const [isResearching, setIsResearching] = useState<boolean>(false);

  // Layout sizing, translation, and sidebar toggling States
  const [activeLang, setActiveLang] = useState<"en" | "bn">(lang);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [chatPanelWidth, setChatPanelWidth] = useState<number>(440);
  const [explorerWidth, setExplorerWidth] = useState<number>(320);
  const [editorHeight, setEditorHeight] = useState<number>(240);
  const [textScale, setTextScale] = useState<number>(100);

  // LLM model, provider, and explorer toggling
  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "ollama">("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [isExplorerVisible, setIsExplorerVisible] = useState<boolean>(true);
  const [attachedPcFiles, setAttachedPcFiles] = useState<Array<{ name: string; content: string }>>([]);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // 101+ AI Skills Hub States
  const [skills, setSkills] = useState<AISkill[]>(() => {
    const saved = localStorage.getItem("neora_ai_skills");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1000) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return aiSkillsList;
  });
  const [skillsSearch, setSkillsSearch] = useState<string>("");
  const [skillsCategoryFilter, setSkillsCategoryFilter] = useState<string>("ALL");

  useEffect(() => {
    localStorage.setItem("neora_ai_skills", JSON.stringify(skills));
  }, [skills]);

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

  useEffect(() => {
    setActiveLang(lang);
  }, [lang]);

  const [dynamicBuilderSuggestions, setDynamicBuilderSuggestions] = useState<Array<{label: string, prompt: string}>>([]);

  useEffect(() => {
    const generateBuilderSuggestions = () => {
      const text = (studioPromptInput || "").toLowerCase().trim();
      let list: Array<{label: string, prompt: string}> = [];

      if (text.length > 1) {
        if (text.includes("app") || text.includes("web") || text.includes("বানাও") || text.includes("তৈরি")) {
          list = [
            { label: lang === "bn" ? "✦ ড্যাশবোর্ড UI" : "✦ Dashboard UI", prompt: `${studioPromptInput} with a gorgeous dark sidebar navigation and metric cards` },
            { label: lang === "bn" ? "✦ চার্ট ও গ্রাফ" : "✦ Charts & Graphs", prompt: `${studioPromptInput} incorporating beautiful animated recharts and data export features` },
            { label: lang === "bn" ? "✦ অফলাইন স্টোরেজ" : "✦ Local Storage", prompt: `${studioPromptInput} with robust offline persistence using localStorage and cache synchronization` },
            { label: lang === "bn" ? "✦ এআই অ্যাসিস্ট্যান্ট" : "✦ AI Assistant", prompt: `${studioPromptInput} embedded with a sweet Bengali-speaking conversational AI agent` }
          ];
        } else if (text.includes("game") || text.includes("খেলা") || text.includes("ক্যানভাস") || text.includes("canvas")) {
          list = [
            { label: lang === "bn" ? "✦ ফিজিক্স ক্যানভাস" : "✦ Physics Game", prompt: `${studioPromptInput} using custom 2D canvas physics, particle systems, and sound effects` },
            { label: lang === "bn" ? "✦ লিডারবোর্ড ও স্কোর" : "✦ Scoreboard", prompt: `${studioPromptInput} with local storage high-scores, customizable settings, and sound controllers` },
            { label: lang === "bn" ? "✦ ফুল স্ক্রিন মোড" : "✦ Fullscreen UI", prompt: `${studioPromptInput} optimized for high-refresh rates with responsive canvas controls` }
          ];
        } else if (text.includes("skill") || text.includes("স্কিল") || text.includes("agent") || text.includes("এজেন্ট")) {
          list = [
            { label: lang === "bn" ? "✦ গিটহাব ক্লোনার" : "✦ GitHub Clone", prompt: `${studioPromptInput} that automatically clones repos from GitHub and compiles them in the background` },
            { label: lang === "bn" ? "✦ ওএস স্ক্রিপ্ট" : "✦ OS Automation", prompt: `${studioPromptInput} configured as a high-availability background cron daemon script to monitor the host PC` },
            { label: lang === "bn" ? "✦ এরর হিলিং" : "✦ Code Healing", prompt: `${studioPromptInput} designed with heuristic self-repair and real-time code execution hooks` }
          ];
        } else {
          list = [
            { label: lang === "bn" ? "✦ এআই ডিজাইন" : "✦ AI Design Style", prompt: `${studioPromptInput} using premium space dark themes, high-contrast borders, and motion animations` },
            { label: lang === "bn" ? "✦ ফুল-স্ট্যাক এক্সপ্রেস" : "✦ Express Backend", prompt: `${studioPromptInput} with a custom Express.js server, secure proxy routers, and API endpoints` },
            { label: lang === "bn" ? "✦ ইন্টারেক্টিভ ভিউ" : "✦ Responsive Layout", prompt: `${studioPromptInput} styled with beautiful responsive bento grids, custom tabs, and smooth state transitions` }
          ];
        }
      } else {
        list = [
          { label: lang === "bn" ? "✦ Dynamic Skill Clone" : "✦ Dynamic Skill Clone", prompt: lang === "bn" ? "গিটহাব থেকে নতুন ভয়েস ক্লোনিং ও এআই এজেন্ট স্কিল অ্যাড করো" : "Cloning a custom Voice Cloning and AI Agent skill dynamically from GitHub" },
          { label: lang === "bn" ? "✦ Android Compiler" : "✦ Android Compiler", prompt: lang === "bn" ? "অ্যান্ড্রয়েড বিল্ড সিস্টেম এবং ওএস কোড কম্পাইলার কনফিগার করে চালু করো" : "Configure and spin up Android OS compiler build engines" },
          { label: lang === "bn" ? "✦ Code Self-Healing" : "✦ Code Self-Healing", prompt: lang === "bn" ? "নিওরা সোর্স কোডে যেকোনো জটিল এরর বা বাগ খুঁজে বের করে রিয়েল-টাইমে ফিক্স করো" : "Locate source code compilation bugs and apply dynamic self-healing patches" },
          { label: lang === "bn" ? "✦ Daemon Automator" : "✦ Daemon Automator", prompt: lang === "bn" ? "পিসির বিভিন্ন ফাইল ব্যাকআপ ও সিঙ্ক করার জন্য ব্যাকগ্রাউন্ড ডেমন সার্ভিস টাস্ক তৈরি করো" : "Write a high-availability background cron-job daemon skill to backup local assets" },
          { label: lang === "bn" ? "✦ UI Sandbox Optimizer" : "✦ UI Sandbox Optimizer", prompt: lang === "bn" ? "সবগুলো ভিউ এবং ট্যাব স্লাইডার অত্যন্ত ফাস্ট ও রেসপন্সিভ করতে কোড অপ্টিমাইজ করো" : "Perform extensive layout optimizations to make sandbox tabs instantly responsive" }
        ];
      }

      setDynamicBuilderSuggestions(list);
    };

    generateBuilderSuggestions();
  }, [studioPromptInput, lang]);

  // Advanced Integrations & File Hub States (Google Drive, GitHub, PC Location)
  const [isHubOpen, setIsHubOpen] = useState<boolean>(false);
  const [hubActiveTab, setHubActiveTab] = useState<"pc" | "github" | "gdrive">("pc");
  const [gitBranch, setGitBranch] = useState<string>("main");
  const [gitCommitMsg, setGitCommitMsg] = useState<string>("");
  const [gitStatusData, setGitStatusData] = useState<any>(null);
  const [gitLoading, setGitLoading] = useState<boolean>(false);
  const [prSourceBranch, setPrSourceBranch] = useState<string>("dev");
  const [prTargetBranch, setPrTargetBranch] = useState<string>("main");
  const [prTitle, setPrTitle] = useState<string>("");
  const [prDesc, setPrDesc] = useState<string>("");
  const [prResultUrl, setPrResultUrl] = useState<string>("");
  const [gdriveFiles, setGdriveFiles] = useState<any[]>([]);
  const [gdriveLoading, setGdriveLoading] = useState<boolean>(false);
  const [gdriveSelectedFileId, setGdriveSelectedFileId] = useState<string>("");

  // Chat States for the left panel
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: "user" | "neora";
    text: string;
    timestamp: string;
  }>>(() => {
    return [
      {
        id: "welcome",
        sender: "neora",
        text: lang === "bn"
          ? "স্বাগতম বস! আমি আপনার নিওরা এআই বিল্ডার স্টুডিও কো-পাইলট। বাম পাশের এই চ্যাট বক্স থেকে আমাকে যেকোনো অ্যাপ তৈরি করতে বলতে পারেন, অথবা কোড পরিবর্তন ও ফাইল এডিটের অনুরোধ জানাতে পারেন।\n\nআপনি চাইলে নিচের প্রোজেক্ট টেমপ্লেট ও ইমেজ রেফারেন্স প্রিসেটগুলো ব্যবহার করে দ্রুত শুরু করতে পারেন!"
          : "Welcome boss! I am your Neora AI Builder Studio co-pilot. Use this chat window to describe the software you want to build, request code updates, or load local files from your PC.\n\nYou can also use the project templates and mockup reference triggers below to get started instantly!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [chatInput, setChatInput] = useState("");
  const [isPresetsDrawerOpen, setIsPresetsDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectPreset = (id: string) => {
    setActivePresetId(id);
    const selected = presets.find(p => p.id === id);
    if (!selected) return;

    // Add chat interaction
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text: lang === "bn" 
        ? `আমি "${selected.name}" টেমপ্লেটটি নিয়ে কাজ করতে চাই।` 
        : `I want to load the "${selected.name}" template preset.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const neoraMsg = {
      id: `neora-${Date.now()}`,
      sender: "neora" as const,
      text: lang === "bn"
        ? `নিশ্চয়ই বস! "${selected.name}" টেমপ্লেটটি সফলভাবে হ্যান্ডশেক ও লোড করা হয়েছে। এর সাথে ভার্চুয়াল ফাইল এক্সপ্লোরারে ডাইনামিক সোর্স কোড রেন্ডার হয়েছে। ডান পাশের লোকাল স্যান্ডবক্স প্লে-গ্রাউন্ডে আপনি এটি রিয়েল-টিতে টেস্ট করতে পারেন।\n\nএটি কাস্টমাইজ বা নতুন কোনো কোড যুক্ত করার জন্য আমাকে নিচে নির্দেশ দিন!`
        : `Understood boss! Loaded the "${selected.name}" environment into your Workspace. Dynamic filesystem structures are now visible in the File Explorer on the right.\n\nType any custom requirements or directives in the chat below to modify this codebase further!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, neoraMsg]);
  };

  const triggerRealCompile = async (userPrompt: string) => {
    setIsCompiling(true);
    setCompileProgress(0);
    setCompileLogs([]);
    setAppHealth(100);
    setSimulatedErrors([]);

    addLog("📡 Initializing Neora Real-World AI Compiler handshake... CONNECTED");
    setCompileProgress(10);

    const geminiKey = localStorage.getItem("neora_gemini_key") || "";

    try {
      addLog("🔍 Scanning input parameters and reference workspace files...");
      setCompileProgress(25);

      let compiledPrompt = userPrompt;
      if (attachedPcFiles.length > 0) {
        compiledPrompt += "\n\n[USER ATTACHED PC FILES FOR REFERENCE]:\n" + 
          attachedPcFiles.map(file => `--- START FILE: ${file.name} ---\n${file.content}\n--- END FILE: ${file.name} ---`).join("\n\n");
      }

      const response = await fetch("/api/builder/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: compiledPrompt,
          files: projectFiles,
          mockupImage: mockupImage || undefined,
          presetId: activePresetId,
          geminiKey: geminiKey || undefined,
          model: selectedModel,
          provider: selectedProvider,
          ollamaBaseUrl: localStorage.getItem("neora_ollama_base_url") || "http://127.0.0.1:11434"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const resData = await response.json();
      setCompileProgress(65);

      if (resData.status === "api_key_missing") {
        addLog("❌ COMPILATION HALTED: Gemini API Key is missing. Please save your API key in the Neora Workspace Settings.");
        setAppHealth(50);
        setSimulatedErrors([
          "Missing API Credentials: No valid Gemini API Key detected.",
          "Please configure 'neora_gemini_key' in your workspace settings configuration panel."
        ]);
        setIsCompiling(false);
        
        setMessages(prev => [
          ...prev,
          {
            id: `neora-${Date.now()}`,
            sender: "neora" as const,
            text: lang === "bn"
              ? `⚠️ **কম্পাইল করতে ব্যর্থ হয়েছে: এপিআই কী (API Key) পাওয়া যায়নি!**\n\nদয়া করে Neora Workspace-এর সেটিংস প্যানেলে আপনার Gemini API Key সংরক্ষণ করুন।`
              : `⚠️ **COMPILATION FAILED: API KEY MISSING!**\n\nPlease save your Gemini API Key in the Workspace Settings panel to enable real AI generation.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      if (resData.status === "error") {
        throw new Error(resData.error || "Compiler experienced an internal error");
      }

      addLog("📦 Virtual filesystem code blocks extracted successfully...");
      setCompileProgress(85);

      const generatedData = resData.data;
      if (generatedData && Array.isArray(generatedData.files)) {
        setProjectFiles(generatedData.files);
        
        let appFile = null;
        const findAppFile = (list: FileItem[], prefix = ""): any => {
          for (const item of list) {
            const currentPath = prefix ? `${prefix}/${item.name}` : item.name;
            if (item.type === "file" && currentPath.endsWith("App.tsx")) {
              return { path: currentPath, item };
            }
            if (item.type === "folder" && item.children) {
              const found = findAppFile(item.children, currentPath);
              if (found) return found;
            }
          }
          return null;
        };

        const foundApp = findAppFile(generatedData.files);
        if (foundApp) {
          setSelectedFilePath(foundApp.path);
          setSelectedFileContent(foundApp.item.content || "");
          setEditorValue(foundApp.item.content || "");
        } else {
          const firstFile = generatedData.files.find(f => f.type === "file");
          if (firstFile) {
            setSelectedFilePath(firstFile.name);
            setSelectedFileContent(firstFile.content || "");
            setEditorValue(firstFile.content || "");
          }
        }

        addLog("⚡ Vite Hot-Module compilation and styles injection succeeded! Launching sandbox...");
        setCompileProgress(100);
        setIsCompiling(false);

        setMessages(prev => [
          ...prev,
          {
            id: `neora-${Date.now()}`,
            sender: "neora" as const,
            text: generatedData.message || (lang === "bn"
              ? `✅ **সফটওয়্যার সফলভাবে কম্পাইল ও বিল্ড হয়েছে!**\n\nআমি আপনার প্রম্পট অনুযায়ী কোডবেস সফলভাবে আপডেট করেছি।\n\n- **ফাইলসমূহ আপডেট করা হয়েছে:** ডান পাশের এক্সপ্লোরারে দেখুন।\n- **রিয়েল-টাইম প্রিভিউ:** ডান পাশের প্লে-গ্রাউন্ড ক্যানভাসে কোড এক্সেকিউশন লাইভ রান করছে!`
              : `✅ **SOFTWARE SUCCESSFULLY COMPILED & BUILT!**\n\nI have successfully updated the code structures inside the virtual repository.\n\n- **Files Updated:** Explore the source code in the interactive Explorer on the right.\n- **Interactive Sandbox:** Play with the live rendered component on the far-right screen!`),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error("Invalid output file format from generator");
      }

    } catch (error: any) {
      console.error("Compilation error:", error);
      addLog(`❌ COMPILATION EXCEPTION: ${error.message || String(error)}`);
      setAppHealth(30);
      setSimulatedErrors([
        error.message || "Failed to compile the target components.",
        "Verify your prompt parameters or try a simpler instruction."
      ]);
      setIsCompiling(false);

      setMessages(prev => [
        ...prev,
        {
          id: `neora-${Date.now()}`,
          sender: "neora" as const,
          text: lang === "bn"
            ? `❌ **কম্পাইলেশন ত্রুটি!**\n\nকোড জেনারেট করার সময় সমস্যা হয়েছে: ${error.message || String(error)}`
            : `❌ **COMPILATION ERROR!**\n\nAn error occurred while generating code: ${error.message || String(error)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() && !mockupImage) return;

    const userMessageText = chatInput.trim() || (lang === "bn" ? "সংযুক্ত রেফারেন্স ইমেজ অনুযায়ী কোড জেনারেট করো।" : "Generate code based on attached reference image.");
    const userMsgId = `user-${Date.now()}`;
    const newMsg = {
      id: userMsgId,
      sender: "user" as const,
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setPrompt(userMessageText);
    setChatInput("");

    triggerRealCompile(userMessageText);
  };

  const handleEnhancePrompt = async () => {
    if (!chatInput.trim()) {
      addLog("⚠️ Please type a short concept first so Neora can optimize it!");
      return;
    }
    setIsEnhancing(true);
    addLog("🔮 Handshaking with Neural Prompt Enhancer context...");
    try {
      const gKey = localStorage.getItem("neora_gemini_key") || "";
      const response = await fetch("/api/prompt/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: chatInput,
          lang: activeLang,
          useOllama: selectedProvider === "ollama",
          selectedOllamaModel: selectedModel,
          geminiKey: gKey
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (data.text) {
          setChatInput(data.text);
          addLog("✨ Prompt optimized successfully! Ready to compile.");
        }
      } else {
        throw new Error(`HTTP error ${response.status}`);
      }
    } catch (err: any) {
      console.error("Enhance failed:", err);
      addLog(`❌ Prompt Optimizer failed: ${err.message || String(err)}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Load live agent logs & status on interval
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res: any = await neoraGet('/api/os/status');
        if (res) {
          setPcAgentStatus(res.status);
          if (Array.isArray(res.logs)) {
            // Take the logs
            setPcConsoleLogs(res.logs);
          }
        }
      } catch (err) {
        setPcAgentStatus("offline");
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Workspace File Upload Handler
  const handleWorkspaceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || "";
      const newFileItem: FileItem = {
        name: file.name,
        type: "file",
        content
      };
      
      setProjectFiles(prev => {
        const filtered = prev.filter(f => f.name !== file.name);
        return [...filtered, newFileItem];
      });
      addLog(`📥 File uploaded to workspace: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      setSelectedFilePath(file.name);
      setSelectedFileContent(content);
      setEditorValue(content);
    };
    reader.readAsText(file);
  };

  // Create empty file in virtual workspace
  const handleCreateFile = () => {
    const name = window.prompt(lang === "bn" ? "নতুন ফাইলের নাম লিখুন (যেমন: main.py):" : "Enter new file name (e.g. main.py):");
    if (!name) return;
    const newFile: FileItem = {
      name,
      type: "file",
      content: `// Created: ${name}\n// Type your script or code here\n`
    };
    setProjectFiles(prev => [...prev, newFile]);
    addLog(`📄 Created empty file: ${name}`);
    setSelectedFilePath(name);
    setSelectedFileContent(newFile.content || "");
    setEditorValue(newFile.content || "");
  };

  // Create folder in virtual workspace
  const handleCreateFolder = () => {
    const name = window.prompt(lang === "bn" ? "নতুন ফোল্ডারের নাম লিখুন (যেমন: components):" : "Enter new folder name (e.g. components):");
    if (!name) return;
    const newFolder: FileItem = {
      name,
      type: "folder",
      children: []
    };
    setProjectFiles(prev => [...prev, newFolder]);
    addLog(`📁 Created folder: ${name}`);
  };

  // Delete current selected file
  const handleDeleteSelectedFile = () => {
    if (!selectedFilePath) return;
    const confirmDelete = window.confirm(lang === "bn" ? `আপনি কি নিশ্চিত যে '${selectedFilePath}' মুছে ফেলতে চান?` : `Are you sure you want to delete '${selectedFilePath}'?`);
    if (!confirmDelete) return;
    
    setProjectFiles(prev => {
      const deleteRecursive = (list: FileItem[]): FileItem[] => {
        return list.filter(item => {
          if (item.type === "file" && item.name === selectedFilePath) return false;
          if (item.type === "folder" && item.children) {
            item.children = deleteRecursive(item.children);
          }
          return true;
        });
      };
      return deleteRecursive(prev);
    });
    addLog(`🗑️ Deleted file: ${selectedFilePath}`);
    setSelectedFilePath("");
    setSelectedFileContent("");
    setEditorValue("");
  };

  // Command result polling engine
  const executePcCommandAndGetResult = async (promptText: string): Promise<string> => {
    const res: any = await neoraPost('/api/os/command', { prompt: promptText });
    if (!res || !res.command || !res.command.id) {
      throw new Error(lang === "bn" ? "টার্মিনাল কমান্ড কিউ করতে ব্যর্থ হয়েছে" : "Failed to register command on central broker");
    }
    const commandId = res.command.id;
    addLog(`[CMD] Queued Command ID ${commandId}: "${promptText}"`);
    
    // Poll up to 15 seconds (30 * 500ms)
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const statusRes: any = await neoraGet('/api/os/status');
      if (statusRes && Array.isArray(statusRes.history)) {
        const cmdHist = statusRes.history.find((h: any) => h.id === commandId);
        if (cmdHist) {
          if (cmdHist.status === "completed") {
            return cmdHist.result || "";
          } else {
            throw new Error(cmdHist.result || "Execution failed on client PC");
          }
        }
      }
    }
    throw new Error(lang === "bn" ? "কমান্ড টাইমআউট (১৫ সেকেন্ড অতিবাহিত)" : "PC command timed out after 15 seconds.");
  };

  const handleFetchResource = async () => {
    if (!fetchUrl.trim()) return;
    setIsFetching(true);
    setFetchedContent("");
    addLog(`🌐 Attempting to fetch resource: ${fetchUrl}`);
    try {
      const res = await fetch(`/api/builder/fetch?url=${encodeURIComponent(fetchUrl)}`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.status === "success") {
        setFetchedContent(data.content || "");
        addLog(`✅ Resource fetched successfully! Loaded ${data.content?.length || 0} characters of text reference.`);
      } else {
        throw new Error(data.error || "Failed to fetch resource");
      }
    } catch (err: any) {
      console.error("Fetcher error:", err);
      addLog(`❌ FETCHER EXCEPTION: ${err.message || String(err)}`);
      setFetchedContent(`Error fetching resource: ${err.message || String(err)}`);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInjectContentToPrompt = () => {
    if (!fetchedContent.trim()) return;
    const truncated = fetchedContent.substring(0, 3000);
    const referenceBlock = `\n\n[Reference Resource/Documentation]:\n"""\n${truncated}${fetchedContent.length > 3000 ? "\n...(truncated)..." : ""}\n"""`;
    setChatInput(prev => prev + referenceBlock);
    addLog("📥 Reference content successfully appended to your Chat Input box!");
  };

  const handleDeepResearchPrompt = async () => {
    if (!fetchedContent.trim()) return;
    setIsResearching(true);
    addLog(activeLang === "bn" 
      ? "🧠 জেমিনি ডিপ রিসার্স মডিউল চালু হচ্ছে... ডকুমেন্টেশন বিশ্লেষণ করা হচ্ছে..." 
      : "🧠 Initializing Gemini Deep Research Module... Analyzing documentation references..."
    );

    const geminiKey = localStorage.getItem("neora_gemini_key") || "";

    try {
      const res = await fetch("/api/builder/research-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: fetchedContent,
          lang: activeLang,
          geminiKey: geminiKey || undefined
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.status === "success") {
        setStudioPromptInput(data.prompt || "");
        setSidebarSubTab("playground"); // Switch to playground where the input is
        addLog(activeLang === "bn"
          ? "✅ ডিপ রিসার্স সফল! একটি রিয়েল-ওয়ার্ল্ড হাই-ফিডেলিটি প্রম্পট তৈরি করে প্লে-গ্রাউন্ড বক্সে যুক্ত করা হয়েছে।"
          : "✅ Deep Research Succeeded! A high-fidelity, real-world builder prompt has been generated & set inside the Playground box."
        );
      } else if (data.status === "api_key_missing") {
        throw new Error(activeLang === "bn" ? "Gemini API Key অনুপস্থিত।" : "Gemini API Key is missing. Configure it in Settings.");
      } else {
        throw new Error(data.error || "Failed to generate research prompt");
      }
    } catch (err: any) {
      console.error("Deep Research error:", err);
      addLog(`❌ DEEP RESEARCH EXCEPTION: ${err.message || String(err)}`);
    } finally {
      setIsResearching(false);
    }
  };

  const handleInjectContentToWorkspace = () => {
    if (!fetchedContent.trim()) return;
    const defaultName = "src/fetched_reference.txt";
    const name = window.prompt(lang === "bn" ? "ভার্চুয়াল ওয়ার্কস্পেসে নতুন ফাইলের নাম লিখুন:" : "Enter name for the new file in workspace:", defaultName);
    if (!name) return;

    const newFile: FileItem = {
      name,
      type: "file",
      content: fetchedContent
    };

    setProjectFiles(prev => {
      // Clean if already exists, else append
      const filtered = prev.filter(f => f.name !== name);
      return [...filtered, newFile];
    });

    addLog(`📄 Loaded fetched resource directly into workspace as file: ${name}`);
    setSelectedFilePath(name);
    setSelectedFileContent(fetchedContent);
    setEditorValue(fetchedContent);
  };

  // Google Drive & GitHub Actions Handlers
  const fetchGitStatus = async () => {
    try {
      setGitLoading(true);
      const res = await fetch("/api/git/status");
      const data = await res.json();
      if (data.status === "success") {
        setGitStatusData(data.data);
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("Failed to fetch") || errMsg.includes("NetworkError") || errMsg.includes("fetch")) {
        console.warn("Failed to load git status (transient):", errMsg);
      } else {
        console.error("Failed to load git status:", err);
      }
    } finally {
      setGitLoading(false);
    }
  };

  const handleGitAction = async (actionType: string) => {
    try {
      setGitLoading(true);
      addLog(`🐙 Running GitHub action: ${actionType} ...`);
      const res = await fetch("/api/git/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType, branch: gitBranch })
      });
      const data = await res.json();
      if (data.status === "success") {
        addLog(`✅ GitHub Action succeeded: ${data.message || actionType}`);
        fetchGitStatus();
      } else {
        throw new Error(data.error || "Git command failed");
      }
    } catch (err: any) {
      addLog(`❌ GitHub Action failed: ${err.message || String(err)}`);
    } finally {
      setGitLoading(false);
    }
  };

  const handleGitCommitPush = async () => {
    if (!gitCommitMsg.trim()) {
      alert(lang === "bn" ? "দয়া করে কমিট মেসেজ লিখুন" : "Please enter a commit message");
      return;
    }
    try {
      setGitLoading(true);
      addLog(`🐙 Committing changes and pushing to origin/${gitBranch}...`);
      const res = await fetch("/api/git/commit-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: gitCommitMsg, branch: gitBranch })
      });
      const data = await res.json();
      if (data.status === "success") {
        addLog(`✅ Committed and pushed: ${data.message}`);
        setGitCommitMsg("");
        fetchGitStatus();
      } else {
        throw new Error(data.error || "Commit & Push failed");
      }
    } catch (err: any) {
      addLog(`❌ GitHub Push failed: ${err.message || String(err)}`);
    } finally {
      setGitLoading(false);
    }
  };

  const handleGitCreatePR = async () => {
    try {
      setGitLoading(true);
      addLog(`🐙 Creating PR reference compare stream...`);
      const res = await fetch("/api/git/create-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceBranch: prSourceBranch,
          targetBranch: prTargetBranch,
          title: prTitle,
          description: prDesc
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPrResultUrl(data.compareUrl);
        addLog(`✅ GitHub PR compare link structured successfully! Click the button below to launch the merge comparison.`);
      } else {
        throw new Error(data.error || "PR comparison building failed");
      }
    } catch (err: any) {
      addLog(`❌ GitHub PR failed: ${err.message || String(err)}`);
    } finally {
      setGitLoading(false);
    }
  };

  const fetchGDriveFiles = async () => {
    try {
      setGdriveLoading(true);
      const res = await fetch("/api/gdrive/list");
      const data = await res.json();
      if (data.status === "success") {
        setGdriveFiles(data.files || []);
      }
    } catch (err: any) {
      console.error("GDrive fetch error:", err);
    } finally {
      setGdriveLoading(false);
    }
  };

  const handleGDriveUpload = async () => {
    const filename = window.prompt(
      lang === "bn" ? "গুগল ড্রাইভে আপলোড করার ফাইলের নাম লিখুন:" : "Enter name for the file in Google Drive:",
      selectedFilePath ? selectedFilePath.split("/").pop() : "workspace_backup.tsx"
    );
    if (!filename) return;

    try {
      setGdriveLoading(true);
      addLog(`☁️ Uploading "${filename}" to Google Drive folder bucket...`);
      const contentToUpload = editorValue || "";
      const res = await fetch("/api/gdrive/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: filename, content: contentToUpload, mimeType: "text/plain" })
      });
      const data = await res.json();
      if (data.status === "success") {
        addLog(`✅ Google Drive Upload succeeded: ${data.message}`);
        fetchGDriveFiles();
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      addLog(`❌ GDrive upload failed: ${err.message || String(err)}`);
    } finally {
      setGdriveLoading(false);
    }
  };

  const handleGDriveAttach = async (fileId: string) => {
    try {
      setGdriveLoading(true);
      addLog(`☁️ Retrieving file from Google Drive...`);
      const res = await fetch(`/api/gdrive/download?fileId=${fileId}`);
      const data = await res.json();
      if (data.status === "success") {
        const fileContent = data.file?.content || "";
        const referenceBlock = `\n\n[Google Drive Reference - ${data.file?.name}]:\n"""\n${fileContent.substring(0, 3000)}\n"""`;
        setChatInput(prev => prev + referenceBlock);
        addLog(`📥 Attached GDrive file "${data.file?.name}" directly to your chat input prompt!`);
      } else {
        throw new Error(data.error || "Failed to download GDrive file");
      }
    } catch (err: any) {
      addLog(`❌ GDrive attachment failed: ${err.message || String(err)}`);
    } finally {
      setGdriveLoading(false);
    }
  };

  const handleGDriveDownloadToWorkspace = async (fileId: string) => {
    try {
      setGdriveLoading(true);
      addLog(`☁️ Downloading Google Drive file to virtual workspace...`);
      const res = await fetch(`/api/gdrive/download?fileId=${fileId}`);
      const data = await res.json();
      if (data.status === "success") {
        const name = data.file?.name || "downloaded_file.txt";
        const content = data.file?.content || "";
        
        const newFile: FileItem = {
          name: `src/${name}`,
          type: "file",
          content
        };

        setProjectFiles(prev => {
          const filtered = prev.filter(f => f.name !== `src/${name}`);
          return [...filtered, newFile];
        });

        addLog(`📄 Successfully saved GDrive file to virtual repository as: src/${name}`);
        setSelectedFilePath(`src/${name}`);
        setSelectedFileContent(content);
        setEditorValue(content);
      } else {
        throw new Error(data.error || "Failed to download GDrive file");
      }
    } catch (err: any) {
      addLog(`❌ GDrive Download to workspace failed: ${err.message || String(err)}`);
    } finally {
      setGdriveLoading(false);
    }
  };

  // Read file from PC
  const handleLoadFileFromPc = async () => {
    if (!pcFilePath.trim()) return;
    setIsPcLoadingFile(true);
    addLog(`🔄 Initiating file fetch from PC: ${pcFilePath}`);
    try {
      let command = `powershell -Command "[System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes('${pcFilePath.replace(/'/g, "''")}'))"`;
      if (pcFilePath.includes("/") && !pcFilePath.includes("\\")) {
        command = `base64 "${pcFilePath}"`;
      }
      
      const result = await executePcCommandAndGetResult(command);
      const base64Clean = result.replace(/[\r\n\s]+/g, "").trim();
      
      try {
        const decoded = atob(base64Clean);
        setEditorValue(decoded);
        setSelectedFilePath(pcFilePath);
        setSelectedFileContent(decoded);
        addLog(`✅ Successfully loaded remote file: ${pcFilePath}`);
      } catch {
        // plain text fallback
        setEditorValue(result);
        setSelectedFilePath(pcFilePath);
        setSelectedFileContent(result);
        addLog(`⚠️ Loaded raw/un-encoded remote content: ${pcFilePath}`);
      }
    } catch (err: any) {
      addLog(`❌ PC File Read Fail: ${err.message}`);
    } finally {
      setIsPcLoadingFile(false);
    }
  };

  // Save/Write file to PC
  const handleWriteFileToPc = async () => {
    if (!pcFilePath.trim()) return;
    setIsPcWritingFile(true);
    addLog(`🔄 Saving local editor code to remote PC path: ${pcFilePath}`);
    try {
      const base64Content = btoa(editorValue);
      let command = "";
      if (pcFilePath.includes("/") && !pcFilePath.includes("\\")) {
        command = `echo "${base64Content}" | base64 -d > "${pcFilePath}"`;
      } else {
        command = `powershell -Command "$b = '${base64Content}'; [System.IO.File]::WriteAllBytes('${pcFilePath.replace(/'/g, "''")}', [System.Convert]::FromBase64String($b))"`;
      }
      
      await executePcCommandAndGetResult(command);
      addLog(`✅ Saved successfully! Synchronized on local computer.`);
    } catch (err: any) {
      addLog(`❌ PC File Write Fail: ${err.message}`);
    } finally {
      setIsPcWritingFile(false);
    }
  };

  // Direct custom PC Terminal input execution
  const handleExecutePcCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pcCommandInput.trim()) return;
    const cmd = pcCommandInput.trim();
    setPcCommandInput("");
    addLog(`💻 Terminal command sent to PC: ${cmd}`);
    try {
      const result = await executePcCommandAndGetResult(cmd);
      setPcConsoleLogs(prev => [
        ...prev,
        `> ${cmd}`,
        result,
        `---------------------------`
      ]);
    } catch (err: any) {
      setPcConsoleLogs(prev => [
        ...prev,
        `> ${cmd}`,
        `Error: ${err.message}`,
        `---------------------------`
      ]);
    }
  };

  // UI mockup reference image
  const [mockupImage, setMockupImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pcFileInputRef = useRef<HTMLInputElement>(null);

  const handlePcFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setAttachedPcFiles(prev => {
          if (prev.some(f => f.name === file.name)) {
            return prev;
          }
          return [...prev, { name: file.name, content: text }];
        });
        addLog(`📎 Attached PC file: ${file.name} successfully to your workspace context.`);
      }
    };
    reader.readAsText(file);
  };

  // Real-time custom form controls for generated apps (storing states of compiled previews)
  const [previewStates, setPreviewStates] = useState<any>({
    weatherCity: "Dhaka",
    weatherTemp: 32,
    weatherUnit: "C",
    gameScore: 0,
    gameHighScore: 0,
    gamePlaying: false,
    gameObstacles: [] as any[],
    gameBirdY: 150,
    todoText: "",
    todoList: [
      { id: 1, text: "Design software interface", done: true },
      { id: 2, text: "Enable AI compiler logs", done: false },
      { id: 3, text: "Test responsive mockup canvas", done: false }
    ],
    paintColor: "#00ffcc",
    paintPixels: Array(64).fill("#1e293b"),
    cryptoBalance: 12450.75,
    cryptoAsset: "BTC"
  });

  // Default Presets have been moved to the top of the component.

  // Initialize files based on the default selected preset
  useEffect(() => {
    const currentPreset = presets.find(p => p.id === activePresetId);
    if (currentPreset) {
      setProjectFiles(currentPreset.files);
      setPrompt(currentPreset.prompt);
      
      // Auto-select App.tsx if it exists
      const appFile = currentPreset.files.find(f => f.name === "src")?.children?.find(c => c.name === "App.tsx")
        || currentPreset.files[0];
      if (appFile) {
        setSelectedFilePath(appFile.type === "file" ? appFile.name : `src/${appFile.name}`);
        setSelectedFileContent(appFile.content || "");
        setEditorValue(appFile.content || "");
      }
    }
  }, [activePresetId]);

  // Load Git Status & Google Drive files when integration hub is toggled open
  useEffect(() => {
    if (isHubOpen) {
      fetchGitStatus();
      fetchGDriveFiles();
    }
  }, [isHubOpen]);

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMockupImage(event.target.result as string);
          // Show simulated feedback
          addLog(`[UI_ANALYZER] Mockup image successfully mapped: ${file.name}`);
          addLog(`[UI_ANALYZER] Analyzing spatial container, color palettes, and interactive bounds...`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setCompileLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  // Compile Trigger
  const handleCompile = () => {
    if (isCompiling) return;
    const targetPrompt = prompt || window.prompt(lang === "bn" ? "কম্পাইল করার জন্য এআই প্রম্পট বা প্রজেক্ট ডেসক্রিপশন লিখুন:" : "Enter AI prompt or project description to compile:") || "";
    if (!targetPrompt.trim()) return;
    setPrompt(targetPrompt);
    triggerRealCompile(targetPrompt);
  };

  // Simulated Auto-Heal
  const handleAutoHeal = () => {
    if (appHealth === 100) {
      // Create a fake error to fix!
      setAppHealth(78);
      setSimulatedErrors([
        "JSX Boundary mismatch: closing tag </Sun> expected but </div> found in src/App.tsx:32",
        "ReferenceError: 'city' variable used inside event handler but not declared in scope"
      ]);
      addLog("⚠️ CRITICAL BUILD EXCEPTION: Render loop halted due to syntax errors in workspace!");
    } else {
      setIsCompiling(true);
      setCompileProgress(30);
      addLog("🔧 INITIATING NEORA AUTO-HEALING ENGINE...");
      
      setTimeout(() => {
        setCompileProgress(70);
        addLog("🔍 Fixing syntax mismatch in App.tsx...");
        addLog("🛡️ Injecting state handler boundaries, successfully bound 'city' reference!");
      }, 800);

      setTimeout(() => {
        setCompileProgress(100);
        setIsCompiling(false);
        setAppHealth(100);
        setSimulatedErrors([]);
        addLog("🎉 Auto-Heal completed successfully! Sandbox restored to 100% HEALTH.");
      }, 1600);
    }
  };

  // Deploy simulation
  const triggerDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployStep("Bundling production bundle...");
    
    setTimeout(() => setDeployStep("Spinning up container inside Google Cloud Run..."), 1000);
    setTimeout(() => setDeployStep("Configuring DNS mapping and domain routing..."), 2000);
    setTimeout(() => {
      setIsDeploying(false);
      setDeployStep("");
      addLog("🌐 PRODUCTION DEPLOYMENT COMPLETE! App live at: https://neora-built-app.run.app");
    }, 3200);
  };

  // Download project as structured simulated text files
  const triggerDownload = () => {
    const textData = JSON.stringify(projectFiles, null, 2);
    const blob = new Blob([textData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePresetId}-project-source.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog("📥 Source code repository files packed into download stream successfully.");
  };

  // Helper renderer for recursive File tree
  const renderFileTree = (items: FileItem[], prefix = "") => {
    return items.map((item, idx) => {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      const isSelected = selectedFilePath === fullPath;

      if (item.type === "folder") {
        return (
          <div key={idx} className="space-y-0.5 select-none">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-400 text-xs font-mono">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{item.name}</span>
            </div>
            <div className="pl-4 border-l border-slate-800/60 ml-3 space-y-0.5">
              {item.children && renderFileTree(item.children, fullPath)}
            </div>
          </div>
        );
      }

      return (
        <button
          key={idx}
          onClick={() => {
            setSelectedFilePath(fullPath);
            setSelectedFileContent(item.content || "");
            setEditorValue(item.content || "");
          }}
          className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs font-mono transition-all ${
            isSelected
              ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-200"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/45"
          }`}
        >
          <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
          <span className="truncate">{item.name}</span>
        </button>
      );
    });
  };

  const handleStudioSubmit = (customText?: string) => {
    const textToSend = customText || studioPromptInput.trim();
    if (!textToSend && !mockupImage) return;

    // Transition to the code editor workspace
    setBuilderTab("workspace");
    setSidebarSubTab("activeworkspace");
    setChatInput(textToSend); // Fill the chat input so it matches the current build

    // Trigger compiler
    triggerRealCompile(textToSend || (lang === "bn" ? "সংযুক্ত রেফারেন্স ইমেজ অনুযায়ী কোড জেনারেট করো।" : "Generate code based on attached reference image."));

    // Save to history
    if (textToSend && !historyPrompts.includes(textToSend)) {
      setHistoryPrompts(prev => [textToSend, ...prev]);
    }
    setStudioPromptInput("");
  };

  const handleLuckyPrompt = () => {
    const luckyPrompts = [
      "Real-time Weather Dashboard showing current temperatures, forecasting metrics, wind speed dials, humidity curves, and custom atmospheric gradients.",
      "Neon Arcade Side-scroller Flappy bird game with rich retro audio synthesizers, gravity controls, and score multipliers.",
      "High-fidelity Task Workflow Planner & Pomodoro focus timer with interactive boards, customizable categories, and session analytics graphs.",
      "Interactive Audio Synthesizer and drum pad with real-time waveform visualizers, customizable BPM controls, and offline frequency modulation.",
      "Stunning 3D Solar System explorer canvas displaying orbit paths, rotatable planetary bodies, speed dials, and space telemetry readouts."
    ];
    const randomPrompt = luckyPrompts[Math.floor(Math.random() * luckyPrompts.length)];
    setStudioPromptInput(randomPrompt);
  };

  return (
    <div 
      style={{ fontSize: `${textScale}%` }} 
      className="flex-1 flex h-full w-full min-h-0 bg-[#0c0d10] text-slate-100 overflow-hidden" 
      id="neora-builder-tab"
    >
      
      {/* --- GOOGLE AI STUDIO BRANDED LEFT SIDEBAR --- */}
      <div 
        style={{ width: isSidebarVisible ? `${sidebarWidth}px` : "0px", display: isSidebarVisible ? "flex" : "none" }}
        className="border-r border-slate-800/60 bg-[#0c0d0f] flex flex-col shrink-0 h-full min-h-0 overflow-hidden transition-all duration-150"
      >
        
        {/* Header Branding Dropdown Mock */}
        <div className="p-4 border-b border-slate-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="font-sans font-bold text-sm tracking-wide text-white flex items-center gap-1">
              <span>Google AI Studio</span>
              <span className="text-[9px] bg-slate-800 text-indigo-300 px-1 py-0.2 rounded font-mono">BUILD</span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6" style={{ scrollbarWidth: "thin" }}>
          
          {/* Explore Group */}
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-500 px-2.5 mb-2 uppercase tracking-wider">Explore</div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("playground");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all text-left cursor-pointer ${
                  builderTab === "aistudio" && sidebarSubTab === "playground"
                    ? "bg-slate-800/60 text-white font-semibold border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Cpu className="w-4 h-4 text-slate-400" />
                <span>Playground</span>
              </button>
              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("history");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all text-left cursor-pointer ${
                  builderTab === "aistudio" && sidebarSubTab === "history"
                    ? "bg-slate-800/60 text-white font-semibold border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>History</span>
              </button>
              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("skills");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all text-left cursor-pointer ${
                  builderTab === "aistudio" && sidebarSubTab === "skills"
                    ? "bg-slate-800/60 text-white font-semibold border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Award className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{lang === "bn" ? "এআই স্কিলস হাব" : "AI Skills Hub"}</span>
                <span className="ml-auto text-[9px] font-mono px-1.5 py-0.2 bg-amber-550/10 text-amber-300 rounded-full border border-amber-500/20 font-bold">{skills.length}</span>
              </button>
            </div>
          </div>

          {/* Build Group */}
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-500 px-2.5 mb-2 uppercase tracking-wider">Build</div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("playground");
                  setStudioPromptInput("");
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 transition-all text-left cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">+ New app</span>
              </button>

              {/* Toggle to active code workspace */}
              {projectFiles.length > 0 && (
                <button
                  onClick={() => {
                    setBuilderTab("workspace");
                    setSidebarSubTab("activeworkspace");
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all text-left cursor-pointer ${
                    builderTab === "workspace"
                      ? "bg-indigo-950/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.05)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                  }`}
                >
                  <Code2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>Active Workspace</span>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                </button>
              )}

              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("myapps");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all text-left cursor-pointer ${
                  builderTab === "aistudio" && sidebarSubTab === "myapps"
                    ? "bg-slate-800/60 text-white font-semibold border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Folder className="w-4 h-4 text-slate-400" />
                <span>My apps</span>
              </button>
              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("gallery");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all text-left cursor-pointer ${
                  builderTab === "aistudio" && sidebarSubTab === "gallery"
                    ? "bg-slate-800/60 text-white font-semibold border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Gallery</span>
              </button>
            </div>
          </div>

          {/* Manage Group */}
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-500 px-2.5 mb-2 uppercase tracking-wider">Manage</div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("dashboard");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all text-left cursor-pointer ${
                  builderTab === "aistudio" && sidebarSubTab === "dashboard"
                    ? "bg-slate-800/60 text-white font-semibold border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <Laptop className="w-4 h-4 text-slate-400" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("documentation");
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all text-left cursor-pointer ${
                  builderTab === "aistudio" && sidebarSubTab === "documentation"
                    ? "bg-slate-800/60 text-white font-semibold border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Documentation</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Bottom Upgrade Box & User Box */}
        <div className="p-3 border-t border-slate-800/50 space-y-3 shrink-0">
          
          {/* Upgrade Mini Box */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/30 via-slate-900/40 to-[#121316] border border-indigo-500/15">
            <div className="text-[10px] font-bold text-indigo-400 mb-1">Upgrade to unlock more</div>
            <div className="text-[9px] text-slate-400 leading-relaxed">
              Access higher limits, Pro models, offline pipelines, and priority support.
            </div>
          </div>

          {/* User Email & Settings */}
          <div className="flex items-center justify-between px-1 bg-slate-950/20 py-1.5 rounded-lg border border-slate-900">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-[10px] text-white font-bold">
                SP
              </div>
              <div className="truncate text-[10px] text-slate-300 font-mono w-32">
                shukriaprinters@gmail.com
              </div>
            </div>
            <Sliders className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-200" />
          </div>

        </div>
      </div>

      {/* --- RIGHT DETAILED VIEWS CONTAINER --- */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#08090b] overflow-hidden">
        
        {/* UNIVERSAL CORE CONTROL HEADER BAR */}
        <div className="border-b border-slate-800/80 bg-[#0a0c10]/95 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          
          {/* Left Navigation and Sidebar Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center cursor-pointer shadow-inner"
              title={activeLang === "bn" ? "সাইডবার দেখান বা লুকান" : "Show/Hide Google AI Studio Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {(!isSidebarVisible) && (
              <span className="text-xs font-sans font-bold text-slate-400 tracking-wide border-r border-slate-800 pr-2 mr-1">
                Google AI Studio
              </span>
            )}

            {/* Back Button */}
            {(builderTab === "workspace" || sidebarSubTab !== "playground") && (
              <button
                onClick={() => {
                  setBuilderTab("aistudio");
                  setSidebarSubTab("playground");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-900/40 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer animate-fade-in"
                title={activeLang === "bn" ? "প্লেগ্রাউন্ডে ফিরে যান" : "Return to Playground / Prompt box"}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{activeLang === "bn" ? "পিছনে যান" : "Back"}</span>
              </button>
            )}
          </div>

          {/* Interactive Layout Dimensions & Zoom Sizer controls */}
          <div className="flex items-center gap-3 bg-slate-950/40 px-3 py-1 rounded-xl border border-slate-800/50 text-[10px] font-mono text-slate-400">
            <span className="text-slate-500 uppercase font-bold tracking-wider mr-1 text-[9px] hidden sm:inline">
              {activeLang === "bn" ? "আকার ও জুম কন্ট্রোল:" : "Layout & Zoom:"}
            </span>

            {/* Sidebar width */}
            {isSidebarVisible && (
              <div className="flex items-center gap-1 border-r border-slate-800/80 pr-2 mr-1">
                <span>{activeLang === "bn" ? "সাইডবার" : "Sidebar"}:</span>
                <button 
                  onClick={() => setSidebarWidth(w => Math.max(160, w - 20))}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                >-</button>
                <span className="text-slate-300 w-8 text-center">{sidebarWidth}px</span>
                <button 
                  onClick={() => setSidebarWidth(w => Math.min(380, w + 20))}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                >+</button>
              </div>
            )}

            {/* Workspace Chat Width (Only in workspace tab) */}
            {builderTab === "workspace" && (
              <div className="flex items-center gap-1 border-r border-slate-800/80 pr-2 mr-1">
                <span>{activeLang === "bn" ? "চ্যাট" : "Chat"}:</span>
                <button 
                  onClick={() => setChatPanelWidth(w => Math.max(320, w - 20))}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                >-</button>
                <span className="text-slate-300 w-8 text-center">{chatPanelWidth}px</span>
                <button 
                  onClick={() => setChatPanelWidth(w => Math.min(600, w + 20))}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                >+</button>
              </div>
            )}

            {/* File Explorer width (Only in workspace tab) */}
            {builderTab === "workspace" && (
              <div className="flex items-center gap-1 border-r border-slate-800/80 pr-2 mr-1">
                <span>{activeLang === "bn" ? "এক্সপ্লোরার" : "Explorer"}:</span>
                <button 
                  onClick={() => setExplorerWidth(w => Math.max(200, w - 20))}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                >-</button>
                <span className="text-slate-300 w-8 text-center">{explorerWidth}px</span>
                <button 
                  onClick={() => setExplorerWidth(w => Math.min(450, w + 20))}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                >+</button>
              </div>
            )}

            {/* Code editor height (Only in workspace tab) */}
            {builderTab === "workspace" && (
              <div className="flex items-center gap-1 border-r border-slate-800/80 pr-2 mr-1">
                <span>{activeLang === "bn" ? "এডিটর" : "Editor"}:</span>
                <button 
                  onClick={() => setEditorHeight(h => Math.max(150, h - 20))}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                >-</button>
                <span className="text-slate-300 w-8 text-center">{editorHeight}px</span>
                <button 
                  onClick={() => setEditorHeight(h => Math.min(600, h + 20))}
                  className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
                >+</button>
              </div>
            )}

            {/* Global scale/zoom */}
            <div className="flex items-center gap-1">
              <span>{activeLang === "bn" ? "জুম" : "Zoom"}:</span>
              <button 
                onClick={() => setTextScale(s => Math.max(85, s - 5))}
                className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
              >-</button>
              <span className="text-slate-300 w-10 text-center">{textScale}%</span>
              <button 
                onClick={() => setTextScale(s => Math.min(125, s + 5))}
                className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
              >+</button>
            </div>

          </div>

          {/* Translation/Language Switcher Controls */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 rounded-xl bg-[#030712] border border-slate-800/80 p-0.5 shadow-inner">
              <div className="px-2 text-slate-500 flex items-center justify-center" title="UI Language / ইন্টারফেস ভাষা">
                <Languages className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                onClick={() => {
                  setActiveLang("bn");
                  if (onChangeLang) onChangeLang("bn");
                }}
                className={`px-2 py-1 text-xs font-semibold rounded-lg tracking-wide transition-all duration-150 cursor-pointer ${
                  activeLang === "bn"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => {
                  setActiveLang("en");
                  if (onChangeLang) onChangeLang("en");
                }}
                className={`px-2 py-1 text-xs font-semibold rounded-lg tracking-wide transition-all duration-150 cursor-pointer ${
                  activeLang === "en"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                English
              </button>
            </div>
          </div>

        </div>

        {/* Render Google AI Studio Landing Views */}
        {builderTab === "aistudio" ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#08090b]" style={{ scrollbarWidth: "thin" }}>
            
            {/* 1. PLAYGROUND TAB */}
            {sidebarSubTab === "playground" && (
              <div className="flex-1 flex flex-col justify-center items-center px-4 max-w-3xl mx-auto w-full py-12 space-y-8">
                
                {/* Visual Header with Sparkles */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-white leading-tight">
                      {lang === "bn" ? "জেমিনি দিয়ে আপনার আইডিয়া তৈরি করুন" : "Build your ideas with Gemini"}
                    </h1>
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed font-sans">
                    {lang === "bn"
                      ? "প্রম্পটে বলুন আপনি কী অ্যাপ বানাতে চান, এবং জেমিনি এআই কোড সহকারী আপনার জন্য একটি ফুল-স্ট্যাক কোডবেস রিয়েল-টাইমে প্রস্তুত করবে।"
                      : "Describe an application, web tool, game, or customized service below. Our Gemini assistant builds pristine responsive code instantly."}
                  </p>
                </div>

                {/* Dynamic Idea & Prompt suggestions for Neora AI Builder */}
                <div className="w-full space-y-2 text-left">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      {lang === "bn" ? "নিওরা বিল্ডার আইডিয়া ও স্কিল জেনারেটর" : "NEORA BUILDER IDEA & PROMPT GENERATOR"}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {lang === "bn" ? "ক্লিক করে আইডিয়া কপি করুন" : "Click to load prompt template"}
                    </span>
                  </div>
                  <div 
                    className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {dynamicBuilderSuggestions.map((pill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setStudioPromptInput(pill.prompt);
                        }}
                        className="shrink-0 px-3 py-1.5 text-[10px] font-mono border border-slate-800 bg-slate-900/30 hover:bg-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="font-bold text-slate-400">{pill.label}:</span>
                        <span className="truncate max-w-[200px]">{pill.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Sparkle-Bordered Prompt Box */}
                <div className="w-full relative">
                  <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#ea580c] opacity-80 blur-[2px]" />
                  
                  <div className="relative rounded-2xl bg-[#0c0d0f] border border-slate-800 p-4 space-y-3 shadow-2xl flex flex-col">
                    
                    <textarea
                      value={studioPromptInput}
                      onChange={(e) => setStudioPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleStudioSubmit();
                        }
                      }}
                      placeholder={lang === "bn" ? "আপনার এআই অ্যাপটি এখানে বর্ণনা করুন..." : "Describe an app and let Gemini do the rest"}
                      className="w-full h-32 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
                    />

                    {/* Attachment and Send row inside box */}
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                      
                      {/* Attached mockup display */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => document.getElementById("studio-mockup-input")?.click()}
                          className={`p-2 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-mono border cursor-pointer ${
                            mockupImage
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                          }`}
                          title={lang === "bn" ? "ডিজাইন ইমেজ যোগ করুন" : "Upload Layout Sketch"}
                        >
                          <Plus className="w-4 h-4" />
                          <span>{mockupImage ? "✓ IMAGE" : "ATTACH IMAGE"}</span>
                        </button>

                        <input
                          type="file"
                          id="studio-mockup-input"
                          className="hidden"
                          onChange={handleImageUpload}
                          accept="image/*"
                        />

                        {mockupImage && (
                          <button
                            onClick={() => setMockupImage(null)}
                            className="text-[10px] text-rose-400 hover:underline font-mono"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Action buttons on right */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleLuckyPrompt}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 font-sans text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>I'm feeling lucky</span>
                        </button>

                        <button
                          onClick={() => handleStudioSubmit()}
                          disabled={!studioPromptInput.trim() && !mockupImage}
                          className="px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-45 cursor-pointer"
                        >
                          <span>Build app</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Quick Pills Row with scroll indicators */}
                <div className="w-full space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1 font-bold">Quick integration accelerators:</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
                    <button
                      onClick={() => setStudioPromptInput("Build an Android application dashboard with dark material styling, interactive touch cards, and fitness charts.")}
                      className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-sans flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <span>🤖 Build an Android app</span>
                    </button>
                    <button
                      onClick={() => setStudioPromptInput("Integrate Google Drive API explorer layout with visual folder grids, offline search bars, and document previews.")}
                      className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-sans flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <span>📂 Google Drive</span>
                    </button>
                    <button
                      onClick={() => setStudioPromptInput("Connect live Google Sheets database with editable cells, formula evaluations, and automatic data analytics charts.")}
                      className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-sans flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <span>📊 Google Sheets</span>
                    </button>
                    <button
                      onClick={() => setStudioPromptInput("Create a Gmail intelligent mailroom client with visual category thread filters and one-click smart responders.")}
                      className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-sans flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <span>✉️ Gmail</span>
                    </button>
                    <button
                      onClick={() => setStudioPromptInput("Design a Google Calendar planner dashboard featuring meeting drag logs, automated notifications, and schedule blockers.")}
                      className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-sans flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                    >
                      <span>📅 Google Calendar</span>
                    </button>
                  </div>
                </div>

                {/* Browse Gallery Footer Accent */}
                <div className="pt-6 border-t border-slate-800/40 w-full flex items-center justify-between text-xs">
                  <span className="text-slate-500">Discover and remix app ideas</span>
                  <button
                    onClick={() => setSidebarSubTab("gallery")}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Browse the app gallery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

            {/* 2. HISTORY TAB */}
            {sidebarSubTab === "history" && (
              <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-sans text-white">Prompt Request History</h2>
                  <p className="text-xs text-slate-400 mt-1">Select any previous query to instantly populate the playground or trigger compilation.</p>
                </div>
                
                <div className="space-y-2.5">
                  {historyPrompts.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setStudioPromptInput(h);
                        setSidebarSubTab("playground");
                      }}
                      className="p-3.5 rounded-xl bg-[#0c0d0f] border border-slate-800/80 hover:border-indigo-500/20 hover:bg-[#111215] transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 w-[90%]">
                        <span className="text-slate-500 font-mono text-[10px]">0{i + 1}</span>
                        <p className="text-xs text-slate-300 truncate font-sans group-hover:text-white">{h}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MY APPS FILES/RESOURCES TAB */}
            {sidebarSubTab === "myapps" && (
              <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-sans text-white">My Local Workspace Applications</h2>
                  <p className="text-xs text-slate-400 mt-1">Explore files generated in your active local sandbox and launch them in the active editor workspace.</p>
                </div>

                {projectFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#0c0d0f] border border-indigo-500/15 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">ACTIVE PROJECT STATE</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPILED</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div><strong className="text-slate-400 font-mono text-[11px]">Primary Entry:</strong> src/App.tsx</div>
                        <div><strong className="text-slate-400 font-mono text-[11px]">Active Preset:</strong> {activePresetId}</div>
                        <div><strong className="text-slate-400 font-mono text-[11px]">Total File Nodes:</strong> {projectFiles.length} nodes loaded</div>
                      </div>
                      <button
                        onClick={() => {
                          setBuilderTab("workspace");
                          setSidebarSubTab("activeworkspace");
                        }}
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold font-sans text-xs text-white text-center transition-all cursor-pointer"
                      >
                        Open Active Editor Workspace
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0c0d0f] border border-slate-800 space-y-3">
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest block">Local File Nodes:</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                        {projectFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/40 text-xs border border-slate-800">
                            <span className="font-mono text-slate-300">{file.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">{file.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-4 max-w-md mx-auto">
                    <Folder className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-xs text-slate-300 font-sans">No applications have been generated in the workspace yet.</div>
                    <button
                      onClick={() => setSidebarSubTab("playground")}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold"
                    >
                      Start building an app
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. GALLERY TAB */}
            {sidebarSubTab === "gallery" && (
              <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-sans text-white">Remix & Launch App Templates</h2>
                  <p className="text-xs text-slate-400 mt-1">Choose any beautifully crafted preset environment to remix, analyze, or run instantly in your terminal sandbox.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {presets.map((p) => {
                    const PresetIcon = p.icon;
                    return (
                      <div
                        key={p.id}
                        className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between space-y-4 ${
                          activePresetId === p.id
                            ? "bg-[#0c0d0f] border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.06)]"
                            : "bg-[#0c0d0f] border-slate-800 hover:border-slate-700 hover:bg-[#111215]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded bg-slate-900 text-slate-400 border border-slate-800`}>
                              <PresetIcon className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h3 className="font-sans font-bold text-sm text-white">{p.name}</h3>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">{p.description}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleSelectPreset(p.id);
                              setBuilderTab("workspace");
                              setSidebarSubTab("activeworkspace");
                            }}
                            className="flex-1 py-1.5 rounded bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-300 font-sans text-xs font-bold text-center cursor-pointer"
                          >
                            Inspect Code
                          </button>
                          <button
                            onClick={() => {
                              handleSelectPreset(p.id);
                              setBuilderTab("workspace");
                              setSidebarSubTab("activeworkspace");
                              triggerRealCompile(p.prompt || p.name);
                            }}
                            className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold cursor-pointer"
                          >
                            Launch App
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. DIAGNOSTIC DASHBOARD TAB */}
            {sidebarSubTab === "dashboard" && (
              <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-sans text-white">Local Host Diagnostic Dashboard</h2>
                  <p className="text-xs text-slate-400 mt-1">Check communication pipelines, engine health, active models, and configure connection parameters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ollama Engine Status Panel */}
                  <div className="p-5 rounded-2xl bg-[#0c0d0f] border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono font-bold text-slate-400">OLLAMA OFFLINE BRAIN</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        ollamaStatus === "available"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {ollamaStatus === "available" ? "CONNECTED" : "OFFLINE / STOPPED"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 font-sans">
                      <div>
                        <strong>Connection Base URL:</strong>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            defaultValue={localStorage.getItem("neora_ollama_base_url") || "http://127.0.0.1:11434"}
                            onBlur={(e) => {
                              localStorage.setItem("neora_ollama_base_url", e.target.value);
                              addLog(`🔧 Updated custom Ollama endpoint to: ${e.target.value}`);
                            }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500/30"
                            placeholder="e.g. http://127.0.0.1:11434"
                          />
                        </div>
                      </div>
                      <div className="pt-2">
                        <strong>Expected Models:</strong>
                        <span className="text-slate-400 font-mono block mt-1">llama3, deepseek-r1:8b, phi3, mistral</span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-normal bg-slate-950/40 p-2.5 rounded border border-slate-900 mt-2">
                        To run Ollama completely offline, make sure to launch the Ollama terminal tool with CORS origins configured correctly (read the guide in the Documentation tab).
                      </div>
                    </div>
                  </div>

                  {/* System Environment States */}
                  <div className="p-5 rounded-2xl bg-[#0c0d0f] border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono font-bold text-slate-400">PC AGENT STATUS</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        pcAgentStatus === "online"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {pcAgentStatus === "online" ? "CONNECTED" : "AGENT OFFLINE"}
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-300 font-sans">
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-900">
                          <div className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">LATENCY</div>
                          <div className="font-bold font-mono text-white mt-1">14 ms</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-900">
                          <div className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">SANDBOX HP</div>
                          <div className="font-bold font-mono text-emerald-400 mt-1">{appHealth}%</div>
                        </div>
                      </div>
                      <div>
                        <strong>Connection File Path:</strong>
                        <div className="font-mono text-slate-400 text-[10px] mt-1 bg-slate-950/45 p-1.5 rounded border border-slate-900 truncate">
                          {pcFilePath}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. DOCUMENTATION TAB */}
            {sidebarSubTab === "documentation" && (
              <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold font-sans text-white">Local Ollama Setup & Offline Guide</h2>
                  <p className="text-xs text-slate-400 mt-1">Everything you need to configure local model acceleration and configure safe offline workflows on your machine.</p>
                </div>

                <div className="space-y-5 text-sm text-slate-300 font-sans leading-relaxed text-left">
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">1. Download & Install Ollama</h3>
                    <p className="text-xs text-slate-400">
                      Ollama is a lightweight, easy-to-use open engine designed to host Large Language Models locally on your PC.
                    </p>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs font-mono text-indigo-300">
                      Download page: <a href="https://ollama.com" target="_blank" rel="noreferrer" className="underline hover:text-indigo-200">https://ollama.com</a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">2. Download a Supported Model</h3>
                    <p className="text-xs text-slate-400">
                      Open your command prompt or terminal application, and download a model using the command below:
                    </p>
                    <pre className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs font-mono text-slate-200">
                      ollama run llama3{"\n"}
                      ollama run deepseek-r1:8b{"\n"}
                      ollama run phi3
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">3. CRITICAL: Configure CORS Origins</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Because Neora runs in a secure sandbox, your browser blocks client requests to 127.0.0.1 due to browser security restrictions. To resolve this, configure the CORS permissions setting when running Ollama:
                    </p>
                    
                    <div className="space-y-1 text-left">
                      <span className="text-xs font-bold text-slate-200">On Windows (Command Prompt):</span>
                      <pre className="bg-slate-950 p-2.5 rounded border border-slate-900 text-xs font-mono text-slate-200">
                        set OLLAMA_ORIGINS="*"{"\n"}
                        ollama serve
                      </pre>
                    </div>

                    <div className="space-y-1 pt-1 text-left">
                      <span className="text-xs font-bold text-slate-200">On macOS / Linux (Terminal):</span>
                      <pre className="bg-slate-950 p-2.5 rounded border border-slate-900 text-xs font-mono text-slate-200">
                        OLLAMA_ORIGINS="*" ollama serve
                      </pre>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-xs text-slate-400 leading-normal text-left">
                    <strong>Why this works:</strong> Once running, Neora client-side browser queries bypass any external firewalls or internet requirements. Your data never leaves your machine!
                  </div>

                </div>
              </div>
            )}

            {/* 7. AI SKILLS HUB TAB */}
            {sidebarSubTab === "skills" && (
              <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6 animate-fadeIn">
                
                {/* Header Banner */}
                <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono rounded font-bold uppercase tracking-wider animate-pulse">
                        ⭐ {lang === "bn" ? `${skills.length}+ এআই স্কিলস রেজিস্ট্রি` : `${skills.length}+ AI Skills Registry`}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase">SYSTEM ACTIVE</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
                      <Sliders className="w-6 h-6 text-indigo-400 animate-spin" />
                      <span>{lang === "bn" ? "নিওরা এআই অ্যাসিস্ট্যান্ট স্কিলস হাব" : "Neora AI Assistant Skills Hub"}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {lang === "bn" 
                        ? `নিওরা-র ${skills.length}টি বিশেষায়িত এআই স্কিল পরিচালনা ও কাস্টমাইজ করুন। এই সিস্টেম প্রম্পট ইঞ্জেকশন, ডেটাবেস আর্কিটেকচার, সিকিউরিটি শিল্ড এবং কম্পাইলার অপ্টিমাইজেশনকে ত্বরান্বিত করে।`
                        : `Browse, toggle, and install Neora's ${skills.length} specialized AI capability modules. These inject expert context into compilation pipelines, database management, security shields, and runtime engines.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSkills(prev => prev.map(s => ({ ...s, enabled: true, installed: true })));
                        addLog(`⚡ Installed & Enabled all ${skills.length}+ AI Skills in active backplane.`);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                    >
                      {lang === "bn" ? "সব অ্যাক্টিভেট করুন" : `Enable All ${skills.length}`}
                    </button>
                    <button
                      onClick={() => {
                        setSkills(aiSkillsList);
                        setSkillsSearch("");
                        setSkillsCategoryFilter("ALL");
                        addLog("🔄 Reset AI Skills registry to factory default active states.");
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800 hover:bg-slate-900 text-slate-400 transition-all"
                      title="Reset Registry"
                    >
                      RESET
                    </button>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Stat 1 */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between text-left">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{lang === "bn" ? "সর্বমোট স্কিল লোডেড" : "Total Skills Registry"}</span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white font-mono">{skills.length}</span>
                      <span className="text-xs text-indigo-400">/ {skills.length} Modules</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: "100%" }} />
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between text-left">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{lang === "bn" ? "ইনস্টলড মডিউল" : "Installed Modules"}</span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-emerald-400 font-mono">
                        {skills.filter(s => s.installed).length}
                      </span>
                      <span className="text-xs text-slate-500">{lang === "bn" ? "সক্রিয় প্যাকেজ" : "active packages"}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(skills.filter(s => s.installed).length / skills.length) * 100}%` }} />
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between text-left">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{lang === "bn" ? "চলমান এআই ক্যাপাবিলিটি" : "Enabled Capabilities"}</span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-amber-400 font-mono">
                        {skills.filter(s => s.installed && s.enabled).length}
                      </span>
                      <span className="text-xs text-slate-500">/{skills.filter(s => s.installed).length} {lang === "bn" ? "অনলাইন" : "online"}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${(skills.filter(s => s.installed && s.enabled).length / skills.length) * 100}%` }} />
                    </div>
                  </div>

                  {/* Stat 4 */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between text-left">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{lang === "bn" ? "অতিরিক্ত প্রম্পট বাফার" : "Active Context Overhead"}</span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-cyan-400 font-mono">
                        {skills.filter(s => s.installed && s.enabled).reduce((acc, curr) => acc + curr.latencyMs, 0)}
                      </span>
                      <span className="text-xs text-slate-500">ms latency cost</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-2.5 truncate font-mono">
                      ~{((skills.filter(s => s.installed && s.enabled).length * 150) / 1024).toFixed(1)} KB Prompt payload size
                    </div>
                  </div>

                </div>

                {/* Filter / Search section */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder={lang === "bn" ? `স্কিল বা ক্যাটাগরি খুঁজুন...` : `Search ${skills.length} AI Skills by name or system prompts...`}
                      value={skillsSearch}
                      onChange={(e) => setSkillsSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                    {skillsSearch && (
                      <button
                        onClick={() => setSkillsSearch("")}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Category filters */}
                  <div className="flex flex-wrap gap-1">
                    {["ALL", "Frontend Core", "Backend Systems", "Database & Persistence", "AI & Prompt Engineering", "Testing & DevOps", "Voice, Media & Games", "Security & Utilities"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSkillsCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          skillsCategoryFilter === cat
                            ? "bg-indigo-500/10 border border-indigo-500 text-indigo-300 shadow"
                            : "bg-slate-900 text-slate-400 border border-slate-800/60 hover:text-white"
                        }`}
                      >
                        {cat === "ALL" 
                          ? (lang === "bn" ? "সব স্কিল" : "ALL") 
                          : cat.replace(" & ", " / ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  {skills
                    .filter(s => {
                      if (skillsCategoryFilter !== "ALL" && s.category !== skillsCategoryFilter) return false;
                      if (!skillsSearch) return true;
                      const q = skillsSearch.toLowerCase();
                      return s.name.toLowerCase().includes(q) || 
                             s.description.toLowerCase().includes(q) || 
                             s.category.toLowerCase().includes(q) || 
                             s.systemPrompt.toLowerCase().includes(q);
                    })
                    .map((skill) => (
                      <div
                        key={skill.id}
                        className={`p-4 rounded-xl transition-all border flex flex-col justify-between relative overflow-hidden group ${
                          !skill.installed
                            ? "bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-90"
                            : !skill.enabled
                            ? "bg-[#090b11] border-slate-800/80 hover:border-slate-700/80"
                            : "bg-gradient-to-b from-[#0c0f1a] to-[#060810] border-indigo-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                        }`}
                      >
                        {/* Soft Glow decoration */}
                        {skill.installed && skill.enabled && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-indigo-500/10" />
                        )}

                        <div>
                          {/* Top row: complexity badge & category */}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] font-mono text-slate-500 font-black uppercase tracking-widest">
                              {skill.category}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] font-bold ${
                              skill.complexity === "Expert" 
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : skill.complexity === "Intermediate"
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {skill.complexity}
                            </span>
                          </div>

                          {/* Skill title */}
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                            {skill.installed && skill.enabled ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                            )}
                            <span className="truncate">{skill.name}</span>
                          </h4>

                          {/* Description */}
                          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed min-h-[44px]">
                            {skill.description}
                          </p>

                          {/* Expandable active system prompt payload injection */}
                          <div className="mt-3">
                            <div className="text-[8px] font-mono text-slate-500 mb-1 font-bold uppercase tracking-widest">
                              SYSTEM INJECTION PROMPT
                            </div>
                            <div className="p-2 rounded bg-slate-950 border border-slate-900 text-[8px] font-mono text-slate-300 leading-normal max-h-16 overflow-y-auto select-all">
                              {skill.systemPrompt}
                            </div>
                          </div>
                        </div>

                        {/* Action controllers */}
                        <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-mono text-slate-500">Latency:</span>
                            <span className="text-[9px] font-mono text-slate-300 font-bold">{skill.latencyMs}ms</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Toggle active / inactive switch */}
                            {skill.installed ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, enabled: !s.enabled } : s));
                                    addLog(`⚡ Toggled Skill "${skill.name}" to ${!skill.enabled ? "ACTIVE" : "INACTIVE"}`);
                                  }}
                                  className={`px-2 py-1 rounded text-[9px] font-bold tracking-wide transition-all ${
                                    skill.enabled
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                                      : "bg-slate-900 text-slate-500 border border-slate-800/80 hover:text-slate-300"
                                  }`}
                                >
                                  {skill.enabled ? (lang === "bn" ? "সক্রিয়" : "ACTIVE") : (lang === "bn" ? "নিষ্ক্রিয়" : "INACTIVE")}
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, installed: false, enabled: false } : s));
                                    addLog(`🗑️ Uninstalled Skill Package: ${skill.name}`);
                                  }}
                                  className="p-1 text-slate-600 hover:text-rose-400 rounded hover:bg-slate-900 transition-all"
                                  title="Uninstall Module"
                                >
                                  <Trash className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, installed: true, enabled: true } : s));
                                  addLog(`📥 Installed Skill Package: ${skill.name}`);
                                }}
                                className="px-2.5 py-1 rounded text-[9px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                              >
                                {lang === "bn" ? "ইনস্টল" : "INSTALL"}
                              </button>
                            )}

                            {/* Simulation run trigger */}
                            {skill.installed && skill.enabled && (
                              <button
                                onClick={() => {
                                  addLog(`🧪 SIMULATION: Running diagnostics using "${skill.name}" module...`);
                                  setTimeout(() => {
                                    addLog(`✅ SUCCESS: "${skill.name}" verified cleanly. Injected prompt instructions into LLM system state.`);
                                  }, 1200);
                                }}
                                className="p-1 text-slate-500 hover:text-emerald-400 rounded hover:bg-slate-900 transition-all"
                                title="Run Skill Simulation"
                              >
                                <PlayCircle className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                </div>

                {/* Empty state check */}
                {skills.filter(s => {
                  if (skillsCategoryFilter !== "ALL" && s.category !== skillsCategoryFilter) return false;
                  if (!skillsSearch) return true;
                  const q = skillsSearch.toLowerCase();
                  return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="p-12 text-center bg-slate-900/10 border border-slate-800 rounded-xl max-w-sm mx-auto">
                    <Sliders className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                    <h5 className="text-sm font-bold text-slate-300">No matching skills found</h5>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          /* OTHERWISE RENDER ORIGINAL INTERACTIVE SPLIT WORKSPACE */
          <div className="flex-1 flex flex-col xl:flex-row h-full min-h-0 overflow-hidden bg-[#000d1d]">
            
            {/* LEFT COLUMN: Neora AI Builder Chat Workspace */}
            <div 
              style={{ width: `${chatPanelWidth}px` }}
              className="w-full xl:w-auto border-b xl:border-b-0 xl:border-r border-slate-800/65 flex flex-col shrink-0 bg-[#000814]/95 backdrop-blur-md min-h-0 h-full overflow-hidden transition-all duration-150"
            >
              
              {/* Chat Header Banner */}
              <div className="p-4 border-b border-indigo-500/15 bg-gradient-to-r from-indigo-950/20 to-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                    <MessageSquare className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-sans tracking-wide text-white">NEORA BUILDER CO-PILOT</h2>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                      {lang === "bn" ? "এআই কোড সহকারী" : "AI CODE ASSISTANT"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  LIVE
                </div>
              </div>

              {/* AI Model Selector Bar */}
              <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-900 flex items-center justify-between gap-3 text-xs shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                    {lang === "bn" ? "সক্রিয় মডেল:" : "ACTIVE ENGINE:"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Provider Selector */}
                  <select
                    value={selectedProvider}
                    onChange={(e) => {
                      const prov = e.target.value as "gemini" | "ollama";
                      setSelectedProvider(prov);
                      setSelectedModel(prov === "gemini" ? "gemini-3.5-flash" : "llama3");
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[9.5px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                  >
                    <option value="gemini">Gemini API</option>
                    <option value="ollama">Ollama (Offline)</option>
                  </select>

                  {/* Model Selector */}
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[9.5px] font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50 max-w-[150px] cursor-pointer"
                  >
                    {selectedProvider === "gemini" ? (
                      <>
                        <option value="gemini-3.5-flash">gemini-3.5-flash (Fast & Stable)</option>
                        <option value="gemini-3.5-flash-8b">gemini-3.5-flash-8b (Ultra-Fast)</option>
                        <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Lite)</option>
                        <option value="gemini-3.1-pro">gemini-3.1-pro (Complex Apps)</option>
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Default)</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro (High Intelligence)</option>
                      </>
                    ) : (
                      <>
                        <option value="llama3">llama3 (Meta 8B)</option>
                        <option value="llama3.1:8b">llama3.1:8b (Meta Upgrade)</option>
                        <option value="deepseek-r1:1.5b">deepseek-r1:1.5b (Reasoning)</option>
                        <option value="deepseek-r1:8b">deepseek-r1:8b (Reasoning Pro)</option>
                        <option value="codellama">codellama (Coding Specialist)</option>
                        <option value="qwen2.5-coder:7b">qwen2.5-coder:7b (Alibaba Code)</option>
                        <option value="mistral">mistral (Mistral 7B)</option>
                        <option value="gemma2">gemma2 (Google 9B)</option>
                        <option value="phi3">phi3 (Microsoft Phi-3)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Collapsible Presets & Reference Panel */}
              <div className="border-b border-slate-800/50 bg-slate-950/40 shrink-0">
                <button
                  onClick={() => setIsPresetsDrawerOpen(!isPresetsDrawerOpen)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-900/35 transition-all text-xs font-mono text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {lang === "bn" ? "প্রোজেক্ট টেমপ্লেট ও ড্রয়িং রেফারেন্স" : "PROJECT TEMPLATES & DESIGN REFERENCE"}
                    </span>
                    <span className="text-[10px] text-indigo-400 px-1.5 py-0.2 rounded-full bg-indigo-500/10 border border-indigo-500/20 font-sans font-bold capitalize">
                      {activePresetId}
                    </span>
                    {mockupImage && (
                      <span className="text-[9px] text-emerald-400 px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono">
                        +MOCKUP
                      </span>
                    )}
                  </div>
                  {isPresetsDrawerOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isPresetsDrawerOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-slate-950/80 border-t border-slate-800/40 p-4 space-y-4"
                    >
                      {/* Presets Selection */}
                      <div>
                        <label className="block text-[9px] font-mono text-indigo-400 mb-2 tracking-widest uppercase">
                          {lang === "bn" ? "টার্গেট টেমপ্লেট পরিবর্তন করুন" : "CHANGE TARGET TEMPLATE"}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {presets.map(p => {
                            const Icon = p.icon;
                            return (
                              <button
                                key={p.id}
                                onClick={() => handleSelectPreset(p.id)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  activePresetId === p.id
                                    ? "bg-indigo-500/10 border-indigo-500/40 text-white shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                                    : "bg-slate-900/30 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700/60"
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 mb-1 ${activePresetId === p.id ? "text-indigo-400" : "text-slate-500"}`} />
                                <div className="text-xs font-bold font-sans truncate">{p.name}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mockup Upload */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[9px] font-mono text-indigo-400 tracking-widest uppercase flex items-center gap-1">
                            <Upload className="w-3 h-3 text-indigo-400" />
                            <span>{lang === "bn" ? "ইউআই স্ক্রিনশট বা স্কেচ যুক্ত করুন" : "UPLOAD UI SCREENSHOT / DESIGN MOCKUP"}</span>
                          </label>
                          {mockupImage && (
                            <button
                              onClick={() => setMockupImage(null)}
                              className="text-[9px] font-mono text-rose-400 hover:underline"
                            >
                              {lang === "bn" ? "রিমুভ করুন" : "Clear"}
                            </button>
                          )}
                        </div>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                            mockupImage
                              ? "border-indigo-500/40 bg-indigo-950/5"
                              : "border-slate-800 hover:border-indigo-500/30 bg-slate-950/20"
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          {mockupImage ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center bg-black/40">
                              <img src={mockupImage} alt="Mockup" className="max-h-24 object-contain" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-[9px] font-mono text-white">
                                CHANGE IMAGE
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-1">
                              <Upload className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                              <span className="text-[10px] font-sans text-slate-400 font-medium block">
                                {lang === "bn" ? "এখানে ডিজাইন ড্রপ বা ক্লিক করুন" : "Drop wireframe or click to attach layout"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Collapsible Resource Fetcher Panel */}
              <div className="border-b border-slate-800/50 bg-slate-950/20 shrink-0">
                <button
                  onClick={() => setIsFetcherOpen(!isFetcherOpen)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-900/35 transition-all text-xs font-mono text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>
                      {lang === "bn" ? "রিসোর্স ও ডকুমেন্টেশন ফেচার" : "RESOURCE & DOCUMENTATION FETCHER"}
                    </span>
                    {fetchedContent && (
                      <span className="text-[9px] text-emerald-400 px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono">
                        LOADED
                      </span>
                    )}
                  </div>
                  {isFetcherOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isFetcherOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-slate-950/85 border-t border-slate-800/40 p-4 space-y-3.5"
                    >
                      <div>
                        <label className="block text-[9px] font-mono text-emerald-400 mb-1.5 tracking-widest uppercase">
                          {lang === "bn" ? "ডকুমেন্টেশন বা এপিআই ইউআরএল লিখুন:" : "ENTER DOCS / API URL TO FETCH:"}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={fetchUrl}
                            onChange={(e) => setFetchUrl(e.target.value)}
                            placeholder="e.g. https://api.github.com/repos/... or website url"
                            className="flex-1 bg-[#000612] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-300 placeholder-slate-700 focus:outline-none focus:border-emerald-500/40"
                          />
                          <button
                            onClick={handleFetchResource}
                            disabled={isFetching || !fetchUrl.trim()}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 font-mono text-xs font-bold transition-all disabled:opacity-40"
                          >
                            {isFetching ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>{lang === "bn" ? "ফেচ" : "Fetch"}</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {fetchedContent && (
                        <div className="space-y-2">
                          <label className="block text-[9px] font-mono text-slate-400 tracking-widest uppercase">
                            {lang === "bn" ? "ফেচ করা রিসোর্স প্রিভিউ:" : "FETCHED RESOURCE PREVIEW:"}
                          </label>
                          <textarea
                            readOnly
                            value={fetchedContent}
                            className="w-full h-32 bg-slate-950 border border-slate-900 rounded-lg p-2.5 text-[10px] font-mono text-slate-300 focus:outline-none scrollbar-thin"
                          />
                          <button
                            onClick={handleDeepResearchPrompt}
                            disabled={isResearching}
                            className="w-full mb-2 py-2 px-3 rounded bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                          >
                            {isResearching ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                <span>{lang === "bn" ? "ডিপ রিসার্স করা হচ্ছে..." : "PERFORMING DEEP RESEARCH..."}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-200" />
                                <span className="uppercase">{lang === "bn" ? "ডিপ রিসার্স ও প্রম্পট তৈরি" : "DEEP RESEARCH & GENERATE PROMPT"}</span>
                              </>
                            )}
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={handleInjectContentToPrompt}
                              className="py-1.5 px-2 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold text-center transition-all cursor-pointer"
                            >
                              {lang === "bn" ? "প্রম্পটে যুক্ত করুন" : "APPEND TO CHAT PROMPT"}
                            </button>
                            <button
                              onClick={handleInjectContentToWorkspace}
                              className="py-1.5 px-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold text-center transition-all cursor-pointer"
                            >
                              {lang === "bn" ? "ফাইল হিসেবে সেভ করুন" : "SAVE TO WORKSPACE FILE"}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
                {messages.map((msg) => {
                  const isNeora = msg.sender === "neora";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isNeora ? "justify-start" : "justify-end"}`}
                    >
                      {isNeora && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.15)] text-indigo-400 font-mono text-[10px] font-bold">
                          NR
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] flex flex-col gap-1`}>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-xs font-sans leading-relaxed shadow-sm ${
                            isNeora
                              ? "bg-slate-950/75 border border-slate-800/70 text-slate-200"
                              : "bg-indigo-600 text-white rounded-tr-none"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                          
                          {/* Render attachment badge inside chat message if applicable */}
                          {!isNeora && mockupImage && msg.id === messages[messages.length - 1].id && (
                            <div className="mt-2 p-1.5 rounded bg-slate-950/40 border border-indigo-500/20 text-[9px] font-mono flex items-center gap-1">
                              <Layers className="w-3 h-3 text-indigo-300" />
                              <span>Attached: UI mockup layout blueprint</span>
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] font-mono text-slate-500 px-1 ${!isNeora ? "text-right" : ""}`}>
                          {msg.timestamp}
                        </span>
                      </div>

                      {!isNeora && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-white font-mono text-[10px] font-bold shadow-md">
                          ME
                        </div>
                      )}
                    </div>
                  );
                })}

                {isCompiling && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 font-mono text-[10px] font-bold animate-pulse">
                      NR
                    </div>
                    <div className="bg-slate-950/45 border border-slate-850 rounded-2xl px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2 font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>{lang === "bn" ? "নিওরা চিন্তা করছে..." : "Neora is synthesizing..."} ({compileProgress}%)</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

        {/* Chat Input Dock */}
        <div className="p-3 border-t border-slate-800/65 bg-slate-950/70 shrink-0 relative">
          
          {/* Real-time collapsable Advanced Integrations Hub */}
          <AnimatePresence>
            {isHubOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="mb-3 bg-slate-950 border border-indigo-500/25 rounded-2xl p-4 space-y-4 shadow-[0_4px_30px_rgba(99,102,241,0.15)] z-40 max-h-[380px] overflow-y-auto"
                style={{ scrollbarWidth: "thin" }}
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">
                      {lang === "bn" ? "অ্যাডভান্সড ইন্টিগ্রেশন ও ফাইল হাব" : "INTEGRATIONS & CLOUD FILE HUB"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHubOpen(false)}
                    className="text-[10px] font-mono text-slate-500 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                  >
                    CLOSE
                  </button>
                </div>

                {/* Tab Selector */}
                <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setHubActiveTab("pc")}
                    className={`py-1.5 text-[10px] font-mono font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      hubActiveTab === "pc" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>PC LOCATION</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHubActiveTab("github")}
                    className={`py-1.5 text-[10px] font-mono font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      hubActiveTab === "github" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GITHUB ACTION</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHubActiveTab("gdrive")}
                    className={`py-1.5 text-[10px] font-mono font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      hubActiveTab === "gdrive" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>GOOGLE DRIVE</span>
                  </button>
                </div>

                {/* Tab 1: PC DIRECT LOCATION */}
                {hubActiveTab === "pc" && (
                  <div className="space-y-3.5 text-xs">
                    <div className="bg-indigo-950/15 border border-indigo-500/10 p-2.5 rounded-lg text-[11px] leading-relaxed text-indigo-300">
                      {lang === "bn"
                        ? "আপনার পিসির নির্দিষ্ট লোকেশনে কোড সরাসরি সেভ করতে বা কোনো নির্দিষ্ট ডিরেক্টরি থেকে ফাইল ওয়ার্কস্পেসে ইমপোর্ট করতে নিচের কন্ট্রোলগুলো ব্যবহার করুন।"
                        : "Directly save current workspace state to custom PC file locations or pull files into your virtual directory from any directory on your system."}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Sub-section 1: Path & Load */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {lang === "bn" ? "পিসির স্পেসিফিক ফাইল পাথ (অ্যাবসোলুট):" : "TARGET PC ABSOLUTE PATH:"}
                        </label>
                        <input
                          type="text"
                          value={pcFilePath}
                          onChange={(e) => setPcFilePath(e.target.value)}
                          placeholder="e.g. C:\Users\shukria\Desktop\project\App.tsx"
                          className="w-full bg-[#000612] border border-slate-800 rounded px-2.5 py-1.5 text-[11px] font-mono text-indigo-300 placeholder-slate-700 focus:outline-none focus:border-indigo-500/40"
                        />
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={handleLoadFileFromPc}
                            disabled={isPcLoadingFile || pcAgentStatus !== "online"}
                            className="flex-1 py-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold text-center transition-all disabled:opacity-40"
                          >
                            {isPcLoadingFile ? "LOADING..." : "PULL TO WORKSPACE"}
                          </button>
                          <button
                            type="button"
                            onClick={handleWriteFileToPc}
                            disabled={isPcWritingFile || pcAgentStatus !== "online"}
                            className="flex-1 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold text-center transition-all disabled:opacity-40"
                          >
                            {isPcWritingFile ? "SAVING..." : "SAVE DIRECT TO PC"}
                          </button>
                        </div>
                      </div>

                      {/* Sub-section 2: Directory Browser via terminal */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {lang === "bn" ? "ডিরেক্টরি ফাইল ব্রাউজার (ফোল্ডার পাথ):" : "BROWSE SYSTEM FOLDER DIRECTORY:"}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            id="hub-folder-path-input"
                            defaultValue={pcFilePath.substring(0, pcFilePath.lastIndexOf("\\")) || "C:\\Users\\shukria\\Desktop"}
                            placeholder="e.g. C:\Users\shukria\Desktop"
                            className="flex-1 bg-[#000612] border border-slate-800 rounded px-2.5 py-1 text-[11px] font-mono text-cyan-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500/40"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const inputEl = document.getElementById("hub-folder-path-input") as HTMLInputElement;
                              const path = inputEl?.value || ".";
                              addLog(`📂 Scanning PC directory content for path: ${path}`);
                              try {
                                const cmd = pcFilePath.includes("/") ? `ls -la "${path}"` : `dir "${path}"`;
                                const result = await executePcCommandAndGetResult(cmd);
                                setPcConsoleLogs(prev => [
                                  ...prev,
                                  `> BROWSE DIR: ${path}`,
                                  result,
                                  `---------------------------`
                                ]);
                                addLog(`✅ Loaded directory listing. See 'HOST PC DECK' tab logs for full listing.`);
                                alert(lang === "bn" 
                                  ? `ফোল্ডারের ফাইল তালিকা সফলভাবে পিসির কনসোলে লোড করা হয়েছে!\n\nডানদিকের 'HOST PC DECK' প্যানেলের কনসোলে তালিকাটি দেখতে পাবেন।`
                                  : `Directory file contents parsed successfully!\n\nOpen the 'HOST PC DECK' panel on the far right to see the full list of files.`);
                              } catch (err: any) {
                                addLog(`❌ Directory list failed: ${err.message}`);
                              }
                            }}
                            className="px-3 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 font-mono text-[10px] font-bold"
                          >
                            SCAN
                          </button>
                        </div>
                        <p className="text-[9px] font-mono text-slate-500 leading-normal">
                          {lang === "bn"
                            ? "💡 ডিরেক্টরি স্ক্যান করলে ফোল্ডারের ফাইল তালিকা ডানপাশের 'HOST PC DECK' কনসোলে দেখা যাবে।"
                            : "💡 Running scan listing places directory structures directly inside the 'HOST PC DECK' terminal output."}
                        </p>
                      </div>
                    </div>

                    {/* Browser-based Local PC File Attachment */}
                    <div className="space-y-3 text-xs bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80 mt-1 select-none">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                          {lang === "bn" ? "ব্রাউজার দিয়ে লোকাল পিসি ফাইল যুক্ত করুন:" : "ATTACH LOCAL PC FILE FROM BROWSER:"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={pcFileInputRef}
                          onChange={handlePcFileAttach}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => pcFileInputRef.current?.click()}
                          className="flex-1 py-2 px-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{lang === "bn" ? "লোকাল পিসি ফাইল যুক্ত করুন" : "CHOOSE LOCAL PC FILE"}</span>
                        </button>
                      </div>
                      <p className="text-[9px] font-mono text-slate-500 leading-normal">
                        {lang === "bn"
                          ? "💡 ফাইল সিলেক্ট করলে এর পুরো সোর্স কোডটি আপনার চ্যাট প্রম্পটে রেফারেন্স হিসেবে যুক্ত হয়ে যাবে।"
                          : "💡 Selecting a file will parse its content and automatically append it to your prompt container as a code block reference."}
                      </p>
                    </div>

                  </div>
                )}

                {/* Tab 2: GITHUB ACTIONS (Commit, Push, Pull, PR) */}
                {hubActiveTab === "github" && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-indigo-950/15 border border-indigo-500/10 p-2 rounded text-[10px] leading-relaxed text-indigo-300">
                      {lang === "bn"
                        ? "গিটহাব রিপোজিটরির সাথে কোড সিঙ্ক করুন। পুল, পুশ এবং পিআর (PR) তৈরি করার ফিচার সরাসরি ইন্টিগ্রেটেড।"
                        : "Synchronize local codes with Github origin repository. Instantly trigger Git pulls, commits, pushes, and build custom Pull Requests."}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Pull, Commit and Push */}
                      <div className="space-y-2 border-r border-slate-900 pr-0 md:pr-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">GIT COMMIT & PUSH</span>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={gitBranch}
                              onChange={(e) => setGitBranch(e.target.value)}
                              placeholder="main"
                              className="w-16 bg-[#000612] border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-300 text-center focus:outline-none"
                              title="Target Branch"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            value={gitCommitMsg}
                            onChange={(e) => setGitCommitMsg(e.target.value)}
                            placeholder="e.g. Added responsive meeting notes summarizer features"
                            className="w-full bg-[#000612] border border-slate-800 rounded px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                          />
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => handleGitAction("pull")}
                              disabled={gitLoading}
                              className="py-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-mono text-[9px] font-bold text-center transition-all disabled:opacity-40"
                            >
                              GIT PULL
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGitAction("fetch")}
                              disabled={gitLoading}
                              className="py-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-mono text-[9px] font-bold text-center transition-all disabled:opacity-40"
                            >
                              GIT FETCH
                            </button>
                            <button
                              type="button"
                              onClick={handleGitCommitPush}
                              disabled={gitLoading || !gitCommitMsg.trim()}
                              className="py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-bold text-center transition-all disabled:opacity-40"
                            >
                              PUSH CODE
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Build PR (Pull Request) */}
                      <div className="space-y-2">
                        <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">CREATE PULL REQUEST (PR)</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[9px] text-slate-500 font-mono block mb-0.5">SOURCE BRANCH:</label>
                            <input
                              type="text"
                              value={prSourceBranch}
                              onChange={(e) => setPrSourceBranch(e.target.value)}
                              placeholder="dev"
                              className="w-full bg-[#000612] border border-slate-800 rounded px-2 py-1 text-[10px] font-mono text-slate-300"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-mono block mb-0.5">TARGET BRANCH:</label>
                            <input
                              type="text"
                              value={prTargetBranch}
                              onChange={(e) => setPrTargetBranch(e.target.value)}
                              placeholder="main"
                              className="w-full bg-[#000612] border border-slate-800 rounded px-2 py-1 text-[10px] font-mono text-slate-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={prTitle}
                            onChange={(e) => setPrTitle(e.target.value)}
                            placeholder="PR Title (e.g. Added Google Drive support)"
                            className="w-full bg-[#000612] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleGitCreatePR}
                            disabled={gitLoading || !prTitle.trim()}
                            className="w-full py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 font-mono text-[10px] font-bold text-center transition-all cursor-pointer"
                          >
                            {gitLoading ? "PREPARING..." : "GENERATE PULL REQUEST"}
                          </button>
                        </div>

                        {prResultUrl && (
                          <div className="mt-1.5 p-1.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-center">
                            <a
                              href={prResultUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:underline font-bold"
                            >
                              <span>LAUNCH COMPARISON & MERGE PR</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: GOOGLE DRIVE HUB */}
                {hubActiveTab === "gdrive" && (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="bg-indigo-950/15 border border-indigo-500/10 p-2 rounded text-[10px] leading-relaxed text-indigo-300 flex-1 mr-3">
                        {lang === "bn"
                          ? "গুগল ড্রাইভ রিপোজিটরি থেকে প্রয়োজনীয় ডকুমেন্টেশন চ্যাটবক্সে যুক্ত করুন অথবা আপনার যেকোনো কোড ব্যাকআপ হিসেবে আপলোড করে রাখুন।"
                          : "Synchronize development data with your Google Drive. Pull reference docs as prompt injection, or backup codebase scripts securely."}
                      </div>
                      <button
                        type="button"
                        onClick={handleGDriveUpload}
                        disabled={gdriveLoading}
                        className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>BACKUP FILE</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">YOUR GOOGLE DRIVE FILES</span>
                        <button
                          type="button"
                          onClick={fetchGDriveFiles}
                          className="text-[9px] font-mono text-indigo-400 hover:underline"
                        >
                          REFRESH LIST
                        </button>
                      </div>

                      {gdriveLoading ? (
                        <div className="text-center py-4 font-mono text-xs text-slate-500 animate-pulse">
                          Fetching secure Google Drive catalog...
                        </div>
                      ) : gdriveFiles.length === 0 ? (
                        <div className="text-center py-4 font-mono text-xs text-slate-600 border border-dashed border-slate-900 rounded-lg">
                          No backed up files found in your Google Drive. Upload a backup file above to populate this list.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto style-scrollbar">
                          {gdriveFiles.map((file) => (
                            <div
                              key={file.id}
                              className="p-2 rounded bg-slate-900/60 border border-slate-900 hover:border-slate-800 transition-all flex items-center justify-between gap-4 text-xs font-mono"
                            >
                              <div className="truncate flex-1">
                                <span className="text-indigo-300 font-bold block truncate">{file.name}</span>
                                <span className="text-[9px] text-slate-500 block">Size: {file.size} • Modified: {new Date(file.modifiedTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleGDriveAttach(file.id)}
                                  className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 text-indigo-300 text-[9px] font-bold"
                                  title="Append content to Chat prompt for AI referencing"
                                >
                                  ATTACH
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleGDriveDownloadToWorkspace(file.id)}
                                  className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/15 text-emerald-300 text-[9px] font-bold"
                                  title="Download and create new file in active workspace editor"
                                >
                                  SAVE TO REPO
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Display attached PC files list */}
          {attachedPcFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2 px-2 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800/50">
              {attachedPcFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[9px] animate-fadeIn"
                >
                  <Laptop className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedPcFiles(prev => prev.filter((_, i) => i !== idx));
                      addLog(`Detached local file: ${file.name}`);
                    }}
                    className="text-slate-500 hover:text-indigo-300 transition-colors ml-1 font-bold font-sans text-[10px]"
                    title="Detach File"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAttachedPcFiles([]);
                  addLog("Cleared all attached local files.");
                }}
                className="text-[9px] font-mono text-slate-500 hover:text-slate-300 px-1.5 py-0.5"
              >
                CLEAR ALL
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800/90 rounded-full py-1.5 pl-4 pr-1.5 focus-within:border-indigo-500/50 shadow-[0_4px_24px_rgba(0,0,0,0.5)] focus-within:shadow-[0_0_24px_rgba(99,102,241,0.1)] transition-all flex-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              placeholder={
                lang === "bn"
                  ? "নতুন কোনো পরিবর্তনের নির্দেশ লিখুন..."
                  : "Type code updates, game rules, or PC file paths..."
              }
              className="flex-1 bg-transparent border-0 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
              autoComplete="off"
            />

            {/* Embedded Action Panel inside input bar to match Neora neural chat */}
            <div className="flex items-center gap-1.5">
              {/* Paperclip / Plus button */}
              <button
                type="button"
                onClick={() => setIsHubOpen(!isHubOpen)}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center border ${
                  isHubOpen
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                }`}
                title={lang === "bn" ? "অ্যাডভান্সড ক্লাউড ও লোকাল ফাইল হাব" : "Advanced Cloud & Local File Hub"}
              >
                <Plus className={`w-3.5 h-3.5 transition-transform duration-300 ${isHubOpen ? "rotate-45" : ""}`} />
              </button>

              {/* Native PC file input trigger button */}
              <button
                type="button"
                onClick={() => pcFileInputRef.current?.click()}
                className="p-1.5 rounded-full transition-all cursor-pointer bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 flex items-center justify-center"
                title={lang === "bn" ? "লোকাল পিসি ফাইল সংযুক্ত করুন" : "Attach Local PC File"}
              >
                <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              {/* Wand2 Prompt Optimizer */}
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !chatInput.trim()}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center border ${
                  isEnhancing
                    ? "bg-amber-600 border-amber-400 text-white animate-spin"
                    : chatInput.trim()
                    ? "bg-slate-950 text-amber-400 hover:text-amber-200 hover:bg-slate-800 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)] animate-pulse"
                    : "bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed opacity-50"
                }`}
                title={lang === "bn" ? "প্রম্পট অপ্টিমাইজ করুন (এআই)" : "Optimize Prompt with AI"}
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>

              {/* Speech Dictation Simulation */}
              <button
                type="button"
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (!isRecording) {
                    addLog("🎙️ Listening to vocal prompts... Speak now boss!");
                    setTimeout(() => {
                      setChatInput(prev => {
                        const spacer = prev.trim() ? " " : "";
                        return prev + spacer + (lang === "bn" ? "একটি সুন্দর রিয়েল-টাইম ড্যাশবোর্ড তৈরি করো।" : "Create a beautiful real-time dashboard.");
                      });
                      setIsRecording(false);
                      addLog("📝 Voice prompt transcribed successfully.");
                    }, 2500);
                  } else {
                    addLog("🎙️ Voice listening stopped.");
                  }
                }}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center border ${
                  isRecording
                    ? "bg-rose-600 border-rose-400 text-white animate-pulse"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                }`}
                title={lang === "bn" ? "ভয়েস ইনপুট" : "Voice input dictation"}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSendChatMessage}
                disabled={isCompiling || (!chatInput.trim() && !mockupImage)}
                className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  chatInput.trim() || mockupImage
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                    : "bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50"
                }`}
                title={lang === "bn" ? "নির্দেশনা পাঠান" : "Send instruction"}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Developer Action Pills */}
          <div className="flex items-center justify-between gap-2 mt-2.5">
            <div className="flex gap-2">
              <button
                onClick={handleAutoHeal}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/25 text-slate-300 font-mono text-[9px] tracking-wide flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Cpu className={`w-3 h-3 ${appHealth < 100 ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
                <span>{appHealth < 100 ? "AUTO-HEAL" : "CHECK HEALTH"}</span>
              </button>
              <button
                onClick={triggerDownload}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/25 text-slate-300 font-mono text-[9px] tracking-wide flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3 h-3 text-slate-500" />
                <span>DOWNLOAD ZIP</span>
              </button>
            </div>
            
            {mockupImage && (
              <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                <CheckCircle className="w-2.5 h-2.5" />
                <span>Mockup Map: Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Sandbox Preview & Code Explorer */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#020813]">
        
        {/* Top Header tab controls */}
        <div className="flex items-center justify-between p-3 border-b border-slate-800/65 bg-[#000814]/70 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActivePreviewTab("sandbox")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider flex items-center gap-1.5 transition-all ${
                activePreviewTab === "sandbox"
                  ? "bg-indigo-500/10 border border-indigo-500/35 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>💻 {lang === "bn" ? "লোকাল স্যান্ডবক্স" : "LOCAL SANDBOX"}</span>
            </button>
            <button
              onClick={() => setActivePreviewTab("hostpc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider flex items-center gap-1.5 transition-all ${
                activePreviewTab === "hostpc"
                  ? "bg-cyan-500/10 border border-cyan-500/35 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span>🖥️ {lang === "bn" ? "কানেক্টেড হোস্ট পিসি ও টার্মিনাল" : "CONNECTED HOST PC"}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExplorerVisible(!isExplorerVisible)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all flex items-center gap-1 border cursor-pointer ${
                isExplorerVisible 
                  ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" 
                  : "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
              }`}
              title={lang === "bn" ? "এক্সপ্লোরার দেখান/লুকান" : "Toggle Explorer Panel"}
            >
              {isExplorerVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{isExplorerVisible ? (lang === "bn" ? "এক্সপ্লোরার লুকান" : "HIDE EXPLORER") : (lang === "bn" ? "এক্সপ্লোরার দেখান" : "SHOW EXPLORER")}</span>
            </button>
            <span className="w-px h-3 bg-slate-800 mx-1" />

            {activePreviewTab === "sandbox" ? (
              <>
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                    previewMode === "desktop" ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300" : "text-slate-500"
                  }`}
                >
                  DESKTOP
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                    previewMode === "mobile" ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300" : "text-slate-500"
                  }`}
                >
                  MOBILE
                </button>
                <span className="w-px h-3 bg-slate-800 mx-1" />
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span>HEALTH:</span>
                  <span className={appHealth === 100 ? "text-emerald-400" : "text-rose-400"}>{appHealth}%</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[9px] font-mono text-cyan-400">
                <span className={`w-1.5 h-1.5 rounded-full ${pcAgentStatus === "online" ? "bg-emerald-500 animate-ping" : "bg-rose-500"} shrink-0`} />
                <span>{pcAgentStatus === "online" ? "PC ONLINE" : "PC OFFLINE"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Code workspace + Simulator split view */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          
          {/* File Explorer & Code Editor */}
          {isExplorerVisible && (
            <div 
              style={{ width: `${explorerWidth}px` }}
              className="w-full lg:w-auto border-b lg:border-b-0 lg:border-r border-slate-800/65 flex flex-col min-h-0 bg-[#010a15]/95 transition-all duration-150 shrink-0"
            >
            <div className="p-3 border-b border-slate-800/60 bg-slate-950/40 text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center justify-between">
              <span>EXPLORER</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">VITE REPO</span>
            </div>

            {/* Interactive File Explorer Toolbar */}
            <div className="p-1.5 border-b border-slate-800/50 bg-slate-950/20 flex items-center justify-between gap-1 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCreateFile}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1 text-[9px] font-mono"
                  title={lang === "bn" ? "নতুন ফাইল তৈরি করুন" : "Create New File"}
                >
                  <FilePlus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+File</span>
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1 text-[9px] font-mono"
                  title={lang === "bn" ? "নতুন ফোল্ডার তৈরি করুন" : "Create New Folder"}
                >
                  <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+Folder</span>
                </button>
                <button
                  onClick={() => workspaceFileInputRef.current?.click()}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1 text-[9px] font-mono"
                  title={lang === "bn" ? "পিসি থেকে ফাইল আপলোড করুন" : "Upload File from PC"}
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload</span>
                </button>
              </div>
              
              {selectedFilePath && (
                <button
                  onClick={handleDeleteSelectedFile}
                  className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all flex items-center gap-0.5 text-[9px] font-mono"
                  title={lang === "bn" ? "নির্বাচিত ফাইলটি মুছুন" : "Delete Selected File"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              {/* Hidden File input for file uploads inside the Workspace */}
              <input
                type="file"
                ref={workspaceFileInputRef}
                className="hidden"
                onChange={handleWorkspaceFileUpload}
              />
            </div>
            
            {/* File List */}
            <div className="p-3 flex-1 overflow-y-auto space-y-1.5" style={{ scrollbarWidth: "thin" }}>
              {renderFileTree(projectFiles)}
            </div>

            {/* Selected File Code view */}
            <div 
              style={{ height: `${editorHeight}px` }}
              className="border-t border-slate-800/65 flex flex-col bg-[#010811] min-h-0 transition-all duration-150"
            >
              <div className="px-3 py-1.5 border-b border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/40 shrink-0">
                <span className="truncate">{selectedFilePath}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(editorValue);
                    addLog("📋 Source code copied to clipboard!");
                  }}
                  className="hover:text-white"
                  title="Copy Code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={editorValue}
                onChange={(e) => setEditorValue(e.target.value)}
                className="flex-1 p-3 font-mono text-[11px] leading-relaxed text-indigo-200 placeholder-indigo-300/10 bg-slate-950/45 focus:outline-none resize-none overflow-y-auto"
                style={{ scrollbarWidth: "thin" }}
              />
              <div className="p-1.5 border-t border-slate-800/60 bg-slate-950/20 text-right shrink-0 flex items-center justify-between">
                <span className="text-[8px] font-mono text-indigo-400/70 pl-1">
                  {lang === "bn" ? "প্রোজেক্ট ফাইলে রাইট ব্যাক সচল" : "Project File Writeback Active"}
                </span>
                <button
                  onClick={() => {
                    addLog("🔄 Hot Reloading and updating workspace parameters...");
                    setTimeout(() => {
                      setSelectedFileContent(editorValue);
                      
                      // Also write back to projectFiles list recursively
                      setProjectFiles(prev => {
                        const updateRecursive = (list: FileItem[]): FileItem[] => {
                          return list.map(item => {
                            if (item.type === "file" && item.name === selectedFilePath) {
                              return { ...item, content: editorValue };
                            }
                            if (item.type === "folder" && item.children) {
                              return { ...item, children: updateRecursive(item.children) };
                            }
                            return item;
                          });
                        };
                        return updateRecursive(prev);
                      });

                      addLog("✅ Sandbox successfully sync'd with workspace overrides!");
                    }, 400);
                  }}
                  className="px-2 py-0.5 text-[9px] font-mono rounded bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300"
                >
                  Apply Code Changes
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Interactive Live Sandbox Preview container */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#00050d] relative overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            
            {activePreviewTab === "sandbox" ? (
              <div className="flex-1 flex flex-col justify-center items-center p-4 relative min-h-[500px]">
                {isCompiling && (
                  <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-400 animate-spin" />
                      <Hammer className="w-7 h-7 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="font-mono text-xs text-indigo-300 animate-pulse max-w-sm">
                      {lang === "bn" ? "নিওরা কম্পাইলার প্রজেক্ট ডিস্ট্রিবিউশন তৈরি করছে..." : "NEORA ARCHITECT IS COMPILING WORKSPACE FILES..."}
                    </div>
                    <div className="w-64 bg-slate-950 border border-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                      <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${compileProgress}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1">{compileProgress}% COMPLETE</span>
                  </div>
                )}

                {/* Simulated Live View based on activePresetId */}
                <div
                  className={`transition-all duration-300 shadow-2xl relative bg-slate-950 flex flex-col ${
                    previewMode === "mobile"
                      ? "w-[340px] h-[550px] rounded-[32px] border-[10px] border-slate-900"
                      : "w-full max-w-[620px] aspect-[4/3] rounded-2xl border border-slate-800/80"
                  }`}
                >
                  {/* Header/Screen status */}
                  <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between bg-slate-950 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        {activePresetId === "custom" ? "Custom App Sandbox" : `${activePresetId} preview`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={triggerDeploy}
                        disabled={isDeploying}
                        className="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 disabled:opacity-50 flex items-center gap-1"
                      >
                        <CloudLightning className="w-3 h-3 text-indigo-400" />
                        <span>{isDeploying ? "Deploying..." : "DEPLOY"}</span>
                      </button>
                      <button
                        onClick={handleCompile}
                        className="p-1 text-slate-500 hover:text-slate-300"
                        title="Reload Sandbox"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rendered sub-app simulator view */}
                  <div className="flex-1 p-4 overflow-auto bg-[#070b14] flex flex-col justify-center items-center text-white">
                    {activePresetId === "weather" && (
                  <div className="w-full max-w-sm p-5 bg-gradient-to-br from-indigo-950/50 to-slate-900/90 rounded-2xl border border-cyan-500/15 shadow-xl text-center">
                    <div className="flex justify-between items-center mb-6 text-xs text-cyan-400 font-mono">
                      <span>STATION: DHAKA_A1</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                    
                    <h4 className="text-xl font-bold tracking-wide text-white flex items-center justify-center gap-2">
                      <span>{previewStates.weatherCity}</span>
                      <span className="text-xs px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded font-mono text-cyan-300 text-[9px]">LIVE DATA</span>
                    </h4>

                    <div className="my-6">
                      <p className="text-5xl font-black font-mono text-cyan-400 tracking-tighter">
                        {previewStates.weatherTemp}°{previewStates.weatherUnit}
                      </p>
                      <p className="text-xs font-medium text-cyan-200/80 mt-2">Partly Cloudy • Gentle Breeze</p>
                    </div>

                    {/* Interactive parameters adjustment to demonstrate 100% playable sandbox */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>ADJUST SIMULATED TEMPERATURE</span>
                        <span className="text-cyan-400 font-bold">{previewStates.weatherTemp}°C</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="48"
                        value={previewStates.weatherTemp}
                        onChange={(e) => setPreviewStates(prev => ({ ...prev, weatherTemp: parseInt(e.target.value) }))}
                        className="w-full accent-cyan-400 cursor-pointer h-1 rounded bg-slate-800"
                      />
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                        <button
                          onClick={() => setPreviewStates(prev => ({ ...prev, weatherUnit: "C" }))}
                          className={`py-1 rounded border transition-all ${previewStates.weatherUnit === "C" ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-300" : "border-slate-800"}`}
                        >
                          Celsius
                        </button>
                        <button
                          onClick={() => setPreviewStates(prev => ({ ...prev, weatherUnit: "F", weatherTemp: Math.round((previewStates.weatherTemp * 9/5) + 32) }))}
                          className={`py-1 rounded border transition-all ${previewStates.weatherUnit === "F" ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-300" : "border-slate-800"}`}
                        >
                          Fahrenheit
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activePresetId === "game" && (
                  <div className="w-full max-w-sm bg-black rounded-xl border border-pink-500/20 p-4 text-center overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between font-mono text-[10px] text-pink-400 tracking-wider mb-2">
                      <span>FLAPPY NEORA ARCADE</span>
                      <span className="text-yellow-400">HI-SCORE: {previewStates.gameHighScore}</span>
                    </div>

                    {/* Mini interactive playable canvas area */}
                    <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden border border-pink-500/10 flex flex-col items-center justify-center">
                      
                      {previewStates.gamePlaying ? (
                        <div className="absolute inset-0 flex flex-col justify-between p-3">
                          <div className="text-right text-xs font-mono text-yellow-400">SCORE: {previewStates.gameScore}</div>
                          
                          {/* Animated bird */}
                          <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center font-bold text-[8px] text-white absolute left-8 top-1/2 -translate-y-1/2 shadow-[0_0_10px_#f43f5e]"
                          >
                            🐦
                          </motion.div>
                          
                          {/* Simulated moving obstacle */}
                          <motion.div
                            animate={{ x: [280, -30] }}
                            transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }}
                            className="w-4 h-24 bg-pink-500/35 border-l border-pink-500 absolute top-0"
                            style={{ left: "200px" }}
                          />

                          <button
                            onClick={() => {
                              setPreviewStates(prev => {
                                const newScore = prev.gameScore + 1;
                                return {
                                  ...prev,
                                  gameScore: newScore,
                                  gameHighScore: Math.max(prev.gameHighScore, newScore)
                                };
                              });
                            }}
                            className="mx-auto mt-auto py-1 px-4 rounded bg-pink-600 active:bg-pink-500 hover:bg-pink-500 text-white font-mono text-[10px] tracking-wider font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)] select-none cursor-pointer"
                          >
                            TAP TO FLAP
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 text-center">
                          <Gamepad2 className="w-8 h-8 text-pink-500 mx-auto animate-bounce" />
                          <p className="text-xs font-mono text-slate-400">100% REAL TIME PLAYABLE GAME</p>
                          <button
                            onClick={() => setPreviewStates(prev => ({ ...prev, gamePlaying: true, gameScore: 0 }))}
                            className="px-4 py-1.5 rounded bg-pink-600 hover:bg-pink-500 text-white font-mono font-bold text-[10px] tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(244,63,94,0.25)]"
                          >
                            START NEW RUN
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activePresetId === "productivity" && (
                  <div className="w-full max-w-sm p-4 bg-slate-900 border border-violet-500/15 rounded-xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-center text-[10px] font-mono text-violet-400 shrink-0">
                      <span>TASKS / FOCUS COUNTER</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                        <span>POMODORO ACTIVE</span>
                      </div>
                    </div>

                    {/* Todo List task list */}
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {previewStates.todoList.map((todo: any) => (
                        <button
                          key={todo.id}
                          onClick={() => {
                            setPreviewStates(prev => ({
                              ...prev,
                              todoList: prev.todoList.map((t: any) => t.id === todo.id ? { ...t, done: !t.done } : t)
                            }));
                          }}
                          className={`flex items-center justify-between w-full p-2.5 rounded-lg border text-left text-xs transition-all ${
                            todo.done
                              ? "bg-slate-950/20 border-slate-800 text-slate-500"
                              : "bg-slate-950/65 border-violet-500/10 hover:border-violet-500/25 text-slate-200"
                          }`}
                        >
                          <span className={todo.done ? "line-through" : ""}>{todo.text}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${todo.done ? "bg-violet-600 border-violet-500" : "border-slate-700"}`}>
                            {todo.done && "✓"}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Add todo control input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={previewStates.todoText}
                        onChange={(e) => setPreviewStates(prev => ({ ...prev, todoText: e.target.value }))}
                        placeholder="Type customized task details..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-violet-500/30"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && previewStates.todoText.trim()) {
                            setPreviewStates(prev => ({
                              ...prev,
                              todoList: [...prev.todoList, { id: Date.now(), text: prev.todoText.trim(), done: false }],
                              todoText: ""
                            }));
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (previewStates.todoText.trim()) {
                            setPreviewStates(prev => ({
                              ...prev,
                              todoList: [...prev.todoList, { id: Date.now(), text: prev.todoText.trim(), done: false }],
                              todoText: ""
                            }));
                          }
                        }}
                        className="px-3 rounded bg-violet-600 text-white font-mono text-xs font-bold"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                )}

                {activePresetId === "custom" && (
                  <div className="w-full max-w-sm p-6 bg-slate-900 rounded-xl text-center border border-indigo-500/20 text-indigo-200 relative overflow-hidden">
                    <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-pulse" />
                    <h3 className="text-lg font-bold font-sans text-white">Custom App Sandboxed Playground</h3>
                    <p className="text-xs text-indigo-300/80 my-3 leading-relaxed">
                      {prompt ? prompt : "Please enter an application design prompt or load a wireframe mockup screen to configure files dynamically."}
                    </p>
                    <div className="mt-4 p-3 bg-slate-950 border border-indigo-500/5 rounded-lg text-left">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 mb-1">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        <span>SANDBOX CAPABILITIES</span>
                      </div>
                      <ul className="text-[10px] font-mono text-slate-500 space-y-1 pl-4 list-disc">
                        <li>Standard State Containers: Active</li>
                        <li>Tailwind Layout Engine: Enabled</li>
                        <li>Vite compilation pipeline mapping: Healthy</li>
                      </ul>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-b from-[#000a18] to-[#00040a] font-sans min-h-[600px] select-none" id="neora-host-pc-view">
            
            {/* Section 1: Premium Header & Live Hardware Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* Agent Status Block */}
              <div className="lg:col-span-1 p-4 rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-[#001026] to-[#000713]/85 shadow-[0_4px_24px_rgba(6,182,212,0.06)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${pcAgentStatus === "online" ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" : "bg-rose-500 shadow-[0_0_10px_#ef4444]"} shrink-0`} />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">SYSTEM BACKPLANE</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span>Neora OS Copilot v3.8</span>
                  </h4>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">DAEMON AGENT</span>
                  <span className={`text-xs font-mono font-black ${pcAgentStatus === "online" ? "text-emerald-400" : "text-rose-400"}`}>
                    {pcAgentStatus === "online" ? "● CONNECTED" : "○ OFFLINE"}
                  </span>
                </div>
              </div>

              {/* CPU Live Telemetry */}
              <div className="p-4 rounded-2xl border border-indigo-500/10 bg-slate-950/45 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider">CPU ALLOCATION</span>
                  <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="mt-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-slate-200">
                      {pcAgentStatus === "online" ? "21.4" : "0.0"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">% LOAD</span>
                  </div>
                  {/* Micro simulated graph bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
                    <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: pcAgentStatus === "online" ? "21.4%" : "0%" }} />
                  </div>
                </div>
              </div>

              {/* Memory Live Telemetry */}
              <div className="p-4 rounded-2xl border border-cyan-500/10 bg-slate-950/45 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">PHYSICAL MEMORY (RAM)</span>
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="mt-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-slate-200">
                      {pcAgentStatus === "online" ? "6.8 / 16" : "0.0 / 0.0"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">GB (42%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
                    <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: pcAgentStatus === "online" ? "42.5%" : "0%" }} />
                  </div>
                </div>
              </div>

              {/* Active Process List */}
              <div className="p-4 rounded-2xl border border-emerald-500/10 bg-slate-950/45 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">ACTIVE DAEMONS</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between border-b border-slate-900 pb-0.5 text-slate-500">
                    <span>PROCESS</span>
                    <span>STATUS</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-indigo-300">neora_agent.py</span>
                    <span className="text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-slate-500">explorer.exe</span>
                    <span className="text-emerald-400">RUNNING</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Section 2: File Loader with Fast Directory Presets & Bento Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              
              {/* Left Column: File Load/Sync with Absolute Path Inputs & Presets (8/12 space) */}
              <div className="xl:col-span-7 p-5 rounded-2xl border border-slate-800/80 bg-slate-950/65 flex flex-col gap-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    <span>{lang === "bn" ? "অ্যাবসোলুট হোস্ট ফাইল সিনক্রোনাইজার" : "Absolute Host File Synchronizer"}</span>
                  </div>
                  <span className="text-[9px] font-mono text-indigo-500/60 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/15">
                    READ / WRITE ENGINE
                  </span>
                </div>

                {/* Path Quick presets row */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <span>⚡ Quick PC Directory Access:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "C:\\ Root", path: "C:\\test_neora.txt" },
                      { label: "Desktop", path: "C:\\Users\\shukria\\Desktop\\pcr_script.py" },
                      { label: "Downloads", path: "C:\\Users\\shukria\\Downloads\\data.json" },
                      { label: "Documents", path: "C:\\Users\\shukria\\Documents\\config.ini" },
                      { label: "/home (Linux)", path: "/home/ubuntu/project/main.py" }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setPcFilePath(preset.path);
                          addLog(`📂 Switched PC path input to: ${preset.path}`);
                        }}
                        className="px-2 py-1 text-[9px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/40 transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Path input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    {lang === "bn" ? "কম্পিউটারের অ্যাবসোলুট ফাইল পাথ লিখুন:" : "Enter Absolute PC File Path:"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pcFilePath}
                      onChange={(e) => setPcFilePath(e.target.value)}
                      placeholder="e.g. C:\Users\shukria\Desktop\myscript.py"
                      className="w-full bg-[#000612] border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-indigo-300 placeholder-slate-700 focus:outline-none focus:border-indigo-500/40 shadow-inner"
                    />
                    <div className="absolute right-3 top-2 text-indigo-400/50">
                      <FileCode className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Double trigger action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleLoadFileFromPc}
                    disabled={isPcLoadingFile || pcAgentStatus !== "online"}
                    className="py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold border border-indigo-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(99,102,241,0.05)] active:scale-[0.98]"
                  >
                    {isPcLoadingFile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>READING SYSTEM FILE...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>LOAD FROM PC (পিসি থেকে আনুন)</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleWriteFileToPc}
                    disabled={isPcWritingFile || pcAgentStatus !== "online"}
                    className="py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(16,185,129,0.05)] active:scale-[0.98]"
                  >
                    {isPcWritingFile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>WRITING TO HARDDRIVE...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>SAVE TO PC (পিসিতে রাইট করুন)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/10 text-[10px] font-mono leading-relaxed text-indigo-200/80">
                  {lang === "bn" ? (
                    <span>💡 <strong>ব্যবহার বিধি:</strong> 'LOAD FROM PC' ক্লিক করলে আপনার কম্পিউটারের ফাইলটি বামপাশের লাইভ কোড এডিটরে চলে আসবে। সেখানে আপনি এডিট করে 'SAVE TO PC' দিলেই ফাইলটি আপনার কম্পিউটারে ইনস্ট্যান্ট ওভাররাইট হয়ে আপডেট হয়ে যাবে!</span>
                  ) : (
                    <span>💡 <strong>Workflow:</strong> Load any absolute PC script into the Left editor, make edits natively inside AI Studio code editor, and hit 'SAVE TO PC' to sync modifications back to your local machine instantly!</span>
                  )}
                </div>

              </div>

              {/* Right Column: Interactive Command Bento Box Presets (5/12 space) */}
              <div className="xl:col-span-5 p-5 rounded-2xl border border-slate-800/80 bg-slate-950/65 flex flex-col justify-between gap-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    <TerminalSquare className="w-4 h-4 text-cyan-400" />
                    <span>{lang === "bn" ? "ওয়ান-ক্লিক টার্মিনাল প্রিসেট" : "One-Click Terminal Presets"}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">FAST ACTIONS</span>
                </div>

                <div className="text-[10px] font-sans text-slate-400 leading-normal">
                  {lang === "bn" 
                    ? "আপনার পিসির ইন্টারনাল কমান্ডগুলো দ্রুত টেস্ট করার জন্য নিচের প্রিসেট বাটনে ক্লিক করুন:"
                    : "Instantly deploy complex environment diagnostic scripts or inspect paths on your system using quick-triggers below:"}
                </div>

                {/* Bento Grid layout for presets */}
                <div className="grid grid-cols-2 gap-2">
                  
                  <button
                    onClick={() => {
                      const parentDir = pcFilePath.substring(0, pcFilePath.lastIndexOf("\\")) || ".";
                      setPcCommandInput(`dir "${parentDir}"`);
                      addLog(`🖥️ Auto-filled command: List current directory files`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/35 hover:bg-[#000e21] text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 font-mono">DIR / LS</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-normal group-hover:text-slate-300">
                      {lang === "bn" ? "চলতি ফোল্ডারের ফাইলসমূহ দেখুন" : "List active files in path"}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPcCommandInput("git status");
                      addLog(`🖥️ Auto-filled command: git status`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/35 hover:bg-[#000e21] text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 font-mono">GIT STATUS</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-normal group-hover:text-slate-300">
                      {lang === "bn" ? "প্রোজেক্টের গিট ট্র্যাক যাচাই" : "Check repo modification status"}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPcCommandInput("whoami");
                      addLog(`🖥️ Auto-filled command: whoami`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/35 hover:bg-[#000e21] text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 font-mono">WHOAMI</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-normal group-hover:text-slate-300">
                      {lang === "bn" ? "সিস্টেম ইউজার নেম জানুন" : "Show logged in user context"}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPcCommandInput("ipconfig");
                      addLog(`🖥️ Auto-filled command: ipconfig`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/35 hover:bg-[#000e21] text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 font-mono">IPCONFIG</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-normal group-hover:text-slate-300">
                      {lang === "bn" ? "আইপি ও নেটওয়ার্ক এড্রেস" : "Display interface IP details"}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPcCommandInput("python --version");
                      addLog(`🖥️ Auto-filled command: python --version`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/35 hover:bg-[#000e21] text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 font-mono">PYTHON VERSION</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-normal group-hover:text-slate-300">
                      {lang === "bn" ? "পাইথন এনভায়রনমেন্ট চেক" : "Verify local interpreter version"}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPcCommandInput("systeminfo");
                      addLog(`🖥️ Auto-filled command: systeminfo`);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/35 hover:bg-[#000e21] text-left transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-bold text-cyan-400 font-mono">SYSTEM INFO</div>
                    <div className="text-[9px] text-slate-500 mt-1 leading-normal group-hover:text-slate-300">
                      {lang === "bn" ? "পিসির অপারেটিং সিস্টেম ডিটেইলস" : "Read host specs & OS build"}
                    </div>
                  </button>

                </div>

                <div className="p-3.5 rounded-lg bg-cyan-950/25 border border-cyan-500/10 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-500">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>INTELLIGENT AGENT MODE (VS CODE INTEGRATION)</span>
                  </div>
                  <p className="text-[9px] font-mono leading-normal text-slate-400">
                    {lang === "bn" 
                      ? "পিসিতে কোনো গ্লোবাল কমান্ড বা এডিটিংয়ের জন্য Neora-কে বাম পাশের চ্যাট বক্সে সরাসরি বলুন! এটি অটোমেটিকালি স্ক্রিপ্ট তৈরি করে রান করে দিবে।"
                      : "For automated complex changes, simply type a message in the chat box on the right. Neora will synthesize the proper commands & files for your PC."}
                  </p>
                </div>

              </div>

            </div>

            {/* Section 3: VS Code Styled Premium CLI Terminal console */}
            <div className="flex-1 flex flex-col rounded-2xl border border-slate-800/80 bg-[#020712] min-h-[320px] shadow-2xl relative overflow-hidden">
              
              {/* Terminal Window Header Bar */}
              <div className="px-4 py-3 border-b border-slate-900/90 flex justify-between items-center bg-[#00040a] shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <span>INTEGRATED SYSTEM SHELL TERMINAL</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">ACTIVE</span>
                  </span>
                </div>
                <button
                  onClick={() => setPcConsoleLogs([])}
                  className="text-[9px] font-mono text-slate-500 hover:text-slate-300 px-2.5 py-1 rounded bg-slate-950 border border-slate-900 transition-all cursor-pointer"
                >
                  Clear Screen
                </button>
              </div>

              {/* Terminal Console Logs stream screen */}
              <div className="flex-1 p-4.5 overflow-y-auto font-mono text-xs text-emerald-400 space-y-1.5 bg-[#01050d] border-b border-slate-900" style={{ scrollbarWidth: "thin" }}>
                {pcConsoleLogs.length === 0 ? (
                  <div className="text-slate-600 italic text-[11px] p-2 leading-relaxed">
                    {lang === "bn" 
                      ? "পিসি টার্মিনাল সচল রয়েছে। নিচে কমান্ড লিখে 'EXECUTE' এ ক্লিক করুন অথবা চ্যাটে নিওরা-কে বলুন..." 
                      : "Client PC terminal session initialized. Submit any CMD / Bash command in the prompt below or run one of the presets above..."}
                  </div>
                ) : (
                  pcConsoleLogs.map((logLine, idx) => (
                    <div key={idx} className="leading-relaxed whitespace-pre-wrap text-[11px] font-mono">
                      {logLine.startsWith("> ") ? (
                        <span className="text-cyan-400 font-bold font-mono">{logLine}</span>
                      ) : logLine.toLowerCase().includes("error") || logLine.toLowerCase().includes("failed") ? (
                        <span className="text-rose-400">{logLine}</span>
                      ) : logLine.includes("✓") || logLine.toLowerCase().includes("success") ? (
                        <span className="text-emerald-300 font-semibold">{logLine}</span>
                      ) : (
                        <span className="text-slate-300">{logLine}</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Terminal Command Input Form */}
              <form onSubmit={handleExecutePcCommand} className="p-3 bg-[#00040a] flex gap-2 shrink-0">
                <span className="text-cyan-400 font-mono text-sm pl-1 self-center select-none font-black">$</span>
                <input
                  type="text"
                  value={pcCommandInput}
                  onChange={(e) => setPcCommandInput(e.target.value)}
                  placeholder={lang === "bn" ? "টার্মিনাল কমান্ড লিখুন (যেমন: npm install, git diff, python app.py)..." : "Execute host command (e.g., git diff, systeminfo, pip install flask)..."}
                  className="flex-1 bg-black border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500/40 placeholder-slate-700"
                />
                <button
                  type="submit"
                  disabled={pcAgentStatus !== "online" || !pcCommandInput.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-lg shadow-[0_2px_15px_rgba(6,182,212,0.25)] hover:shadow-[0_2px_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-40 cursor-pointer active:scale-95"
                >
                  RUN COMMAND
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>

        {/* Deploy & Compiler Logs drawer footer */}
        <div className="h-[140px] border-t border-slate-800/65 flex bg-[#00040a] min-h-0 relative shrink-0 overflow-hidden">
          
          {/* Output logs */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-3 py-1 border-b border-slate-900 flex justify-between items-center bg-[#010811] shrink-0">
              <span className="text-[9px] font-mono tracking-widest text-slate-500">REAL-TIME BUILD COMPILER DIAGNOSTIC LOGGER</span>
              <button
                onClick={() => setCompileLogs([])}
                className="text-[9px] font-mono text-indigo-400 hover:underline"
              >
                Clear Logs
              </button>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] text-indigo-200 space-y-1.5">
              {compileLogs.length === 0 ? (
                <div className="text-slate-600 italic">No compile logs recorded. Prompt above and click 'Generate' to initiate code building cycle.</div>
              ) : (
                compileLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-l-2 border-indigo-500/20 pl-2">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right quick status panel */}
          <div className="w-[200px] border-l border-slate-900 bg-slate-950/45 p-3 flex flex-col justify-between font-mono shrink-0">
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5">BUILD STATUS</div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {isCompiling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span className="text-indigo-400">BUILDING...</span>
                  </>
                ) : simulatedErrors.length > 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400">ERRORS</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">COMPILED OK</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-[10px] text-slate-500">
              {isDeploying ? (
                <div className="animate-pulse text-indigo-400 font-bold">{deployStep}</div>
              ) : (
                <span>Production Container: Ready to run</span>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  )}

  </div>

</div>
  );
}
