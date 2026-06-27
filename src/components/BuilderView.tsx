import React, { useState, useEffect, useRef } from "react";
import {
  Hammer, Code2, Play, Download, Sparkles, RefreshCw, AlertTriangle, CheckCircle,
  FileText, Folder, FolderOpen, ChevronRight, ChevronDown, ChevronUp, Copy, Search, PlayCircle,
  Cpu, Trash2, Edit2, Plus, Terminal, Zap, Laptop, ArrowRight, Upload, Layers, Gamepad2, CloudLightning,
  FileCode, TerminalSquare, HardDrive, FolderPlus, FilePlus, AlertCircle, Monitor, MessageSquare, Send, Trash, PlusCircle, Globe,
  ExternalLink, GitPullRequest, Github, Cloud, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { neoraGet, neoraPost } from "../lib/neoraApi";

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

export function BuilderView({ lang }: { lang: "en" | "bn" }) {
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

      const response = await fetch("/api/builder/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: userPrompt,
          files: projectFiles,
          mockupImage: mockupImage || undefined,
          presetId: activePresetId,
          geminiKey: geminiKey || undefined
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
      console.error("Failed to load git status:", err);
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

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full w-full min-h-0 bg-[#000d1d] overflow-hidden" id="neora-builder-tab">
      
      {/* LEFT COLUMN: Neora AI Builder Chat Workspace */}
      <div className="w-full xl:w-[460px] border-b xl:border-b-0 xl:border-r border-slate-800/65 flex flex-col shrink-0 bg-[#000814]/95 backdrop-blur-md min-h-0 h-full overflow-hidden">
        
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

          <div className="flex gap-2 items-center">
            {/* Advanced Integrations Toggler button */}
            <button
              type="button"
              onClick={() => setIsHubOpen(!isHubOpen)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer shadow-md shrink-0 ${
                isHubOpen
                  ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  : "bg-slate-900 border-slate-800 text-indigo-400 hover:border-indigo-500/50 hover:text-indigo-300"
              }`}
              title={lang === "bn" ? "অ্যাডভান্সড ক্লাউড ও লোকাল ফাইল ইন্টিগ্রেশন হাব" : "Advanced Cloud & Local File Hub"}
            >
              <Plus className={`w-5 h-5 transition-transform duration-300 ${isHubOpen ? "rotate-45 text-white" : ""}`} />
            </button>

            <form onSubmit={handleSendChatMessage} className="flex-1 flex gap-2 relative">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                placeholder={
                  lang === "bn"
                    ? "নতুন কোনো পরিবর্তনের নির্দেশ লিখুন..."
                    : "Type code updates, game rules, or PC file paths..."
                }
                className="w-full rounded-xl py-2.5 pl-3.5 pr-12 bg-slate-950 border border-slate-800 text-slate-200 text-xs font-sans focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none max-h-24 h-11 style-scrollbar"
                style={{ scrollbarWidth: "none" }}
              />
              
              <button
                type="submit"
                disabled={isCompiling || (!chatInput.trim() && !mockupImage)}
                className="absolute right-2 top-1.5 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
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
          <div className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-slate-800/65 flex flex-col min-h-0 bg-[#010a15]/95">
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
            <div className="h-[200px] border-t border-slate-800/65 flex flex-col bg-[#010811] min-h-0">
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
  );
}
