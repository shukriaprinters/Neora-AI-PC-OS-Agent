import React, { useState, useEffect, useRef } from "react";
import {
  Monitor, X, Square, Minus, HardDrive, Terminal,
  Compass, Clipboard, HelpCircle, Search, Settings,
  FolderOpen, CirclePlay, RefreshCw, Send, CheckCircle2,
  Mic, Play, Image as ImageIcon, PenTool, LayoutGrid, Chrome,
  Maximize2, ChevronRight, Volume2, Wifi, Battery, Clock, Grid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OSWindow {
  id: string;
  title: string;
  appId: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface FileItem {
  name: string;
  type: "folder" | "file";
  size?: string;
  assocApp?: string;
  content?: string;
}

export function WebOSSimulator({ lang }: { lang: "en" | "bn" }) {
  // System time
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // System states
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(10);
  const [bgWallpaper, setBgWallpaper] = useState<string>("cosmic-cyber");
  const [sysNotification, setSysNotification] = useState<string | null>(
    lang === "bn" ? "Neora ওএস সিমুলেটর অনলাইন! ভয়েস কমান্ড দিন।" : "Neora OS Simulator online! Try giving a voice command."
  );

  // Shell & CMD history
  const [cmdInput, setCmdInput] = useState("");
  const [cmdLines, setCmdLines] = useState<string[]>([
    "Microsoft Windows [Version 10.0.22621]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "C:\\Users\\NeoraUser> neora-agent --status",
    "✔ Connecting to Broker at: http://127.0.0.1:3000",
    "✔ Neora OS Control Module: ACTIVE",
    "Type 'help' to see available local shortcuts.",
    ""
  ]);

  // Notepad state
  const [notepadContent, setNotepadContent] = useState(
    lang === "bn"
      ? "নিয়োরা অস সার্ভার ফাইল সিস্টেম\nএই নোটপ্যাডে আপনার প্রোজেক্ট ড্রাফট লিখুন বা ভয়েস কমান্ড দিয়ে টাইপ করান।"
      : "Neora File Engine active.\nType your notes here, or dictate text through Neora Voice commands."
  );

  // Chrome & browser simulator
  const [browserUrl, setBrowserUrl] = useState("https://www.google.com");
  const [browserHistory, setBrowserHistory] = useState<string[]>(["https://www.google.com"]);
  const [browserSearchInput, setBrowserSearchInput] = useState("");
  const [simulatedWebpage, setSimulatedWebpage] = useState<"google" | "youtube" | "shukria" | "custom">("google");

  // Photoshop Simulator states
  const [psLayers, setPsLayers] = useState([
    { id: 1, name: "Background", visible: true, opacity: 100 },
    { id: 2, name: "Shukria Logo Accent", visible: true, opacity: 90 },
    { id: 3, name: "Aesthetic Gradient Background", visible: true, opacity: 100 }
  ]);
  const [psActiveTool, setPsActiveTool] = useState("brush");
  const [generatedArtPrompt, setGeneratedArtPrompt] = useState("");
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [photoshopCanvasArt, setPhotoshopCanvasArt] = useState<string | null>(null);

  // Illustrator Simulator states
  const [illShapes, setIllShapes] = useState<{ id: string; type: "circle" | "rect" | "text" | "line"; x: number; y: number; color: string; text?: string }[]>([
    { id: "1", type: "circle", x: 120, y: 150, color: "rgba(0, 212, 255, 0.4)" },
    { id: "2", type: "rect", x: 260, y: 100, color: "rgba(124, 58, 237, 0.5)" },
    { id: "3", type: "text", x: 150, y: 250, color: "#ffffff", text: "Neora Vector Design" }
  ]);
  const [illColor, setIllColor] = useState("#00d4ff");

  // Calculator states
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");

  // Explorer active directory
  const [currentDir, setCurrentDir] = useState<"C:" | "D:" | "C:/Documents" | "D:/Designs">("C:/Documents");
  const [virtualFS, setVirtualFS] = useState<Record<string, FileItem[]>>({
    "C:/Documents": [
      { name: "shukria_printers_receipt.txt", type: "file", size: "1.2 KB", assocApp: "notepad", content: "SHUKRIA PRINTERS - GULSHAN OFFICE\n1. Banner Proof 4x6: Standard Print ($120.00)\n2. Poster Accent Layer Color Proof ($45.00)\nTOTAL: $165.00\nSTATUS: APPROVED\n" },
      { name: "office_address_memo.txt", type: "file", size: "0.4 KB", assocApp: "notepad", content: "CONTACT MEMO\nSilicon Tower, Floor 14, Gulshan-2, Dhaka.\nSupport hotlink client code setup neora_agent_enhanced.py.\n" }
    ],
    "D:/Designs": [
      { name: "corporate_banner_draft.psd", type: "file", size: "45.8 MB", assocApp: "photoshop" },
      { name: "shukria_cyber_logo.ai", type: "file", size: "12.4 MB", assocApp: "illustrator" },
      { name: "minimalist_landscape.psd", type: "file", size: "22.1 MB", assocApp: "photoshop" }
    ]
  });

  // Assistant Interaction Box
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLogs, setAssistantLogs] = useState<string[]>([
    lang === "bn"
      ? "হ্যাল্লো বস! আমি প্রস্তুত। 'open photoshop', 'open cmd' বা 'type ...' বলুন।"
      : "Hello Boss! I am online inside this virtual computer. Type or say a command like 'open photoshop'."
  ]);
  const [isAssistantVoiceActive, setIsAssistantVoiceActive] = useState(false);

  // Notification Timer
  useEffect(() => {
    if (sysNotification) {
      const t = setTimeout(() => {
        setSysNotification(null);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [sysNotification]);

  // Window templates
  const [windows, setWindows] = useState<OSWindow[]>([
    { id: "photoshop", title: "Adobe Photoshop CS2026", appId: "photoshop", isOpen: false, isMinimized: false, isMaximized: false, x: 80, y: 50, width: 780, height: 490, zIndex: 10 },
    { id: "illustrator", title: "Adobe Illustrator CC 2026", appId: "illustrator", isOpen: false, isMinimized: false, isMaximized: false, x: 120, y: 70, width: 760, height: 480, zIndex: 11 },
    { id: "explorer", title: "Virtual File Explorer", appId: "explorer", isOpen: false, isMinimized: false, isMaximized: false, x: 50, y: 80, width: 620, height: 420, zIndex: 12 },
    { id: "chrome", title: "Chrome Browser Simulator", appId: "chrome", isOpen: false, isMinimized: false, isMaximized: false, x: 140, y: 40, width: 720, height: 460, zIndex: 13 },
    { id: "notepad", title: "Neora Standard Notepad", appId: "notepad", isOpen: true, isMinimized: false, isMaximized: false, x: 260, y: 120, width: 500, height: 350, zIndex: 20 },
    { id: "cmd", title: "Command Prompt", appId: "cmd", isOpen: false, isMinimized: false, isMaximized: false, x: 100, y: 150, width: 600, height: 380, zIndex: 14 },
    { id: "calc", title: "Virtual Calculator", appId: "calc", isOpen: false, isMinimized: false, isMaximized: false, x: 300, y: 180, width: 280, height: 380, zIndex: 15 }
  ]);

  const openApp = (appId: string) => {
    const nextZ = highestZIndex + 1;
    setHighestZIndex(nextZ);
    setWindows(prev =>
      prev.map(w =>
        w.appId === appId
          ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZ }
          : w
      )
    );
    setActiveWindow(appId);
    setStartMenuOpen(false);
    triggerNotification(`Opened ${appId.toUpperCase()} workspace`);
  };

  const closeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isOpen: false } : w))
    );
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  };

  const minimizeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  };

  const maximizeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const focusWindow = (id: string) => {
    const nextZ = highestZIndex + 1;
    setHighestZIndex(nextZ);
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: false, zIndex: nextZ } : w))
    );
    setActiveWindow(id);
  };

  const triggerNotification = (text: string) => {
    setSysNotification(text);
  };

  // Drag function
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    const wind = windows.find(w => w.id === id);
    if (!wind || wind.isMaximized) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = wind.x;
    const initialY = wind.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setWindows(prev =>
        prev.map(w =>
          w.id === id
            ? { ...w, x: initialX + dx, y: initialY + dy }
            : w
        )
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    focusWindow(id);
  };

  // CMD Core Execution
  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = cmdInput.trim();
    if (!input) return;

    const parts = input.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    let reply = `Command not recognized. Type 'help' for details.`;

    if (cmd === "help") {
      reply = `Available virtual commands:\n  help                    - Display help catalog\n  cls                     - Clear console window\n  dir                     - List directory files\n  echo [msg]              - Print message\n  open [app]              - Launch application (photoshop, chrome, calcul, explorer, paint)\n  neora-status            - Display server broker heartbeat logs\n  notepad-save [text]     - Append direct text to active notepad workspace`;
    } else if (cmd === "cls") {
      setCmdLines([]);
      setCmdInput("");
      return;
    } else if (cmd === "neora-status") {
      reply = `NEORA LOCAL BRIDGE HEARTBEAT\nActive Endpoint: ${window.location.origin}\nLocal Client Protocol: neora_agent_enhanced.py\nStatus: REGISTERED AND READY FOR VOICEOPS\nSystem Drivers: win32-com, speechlib 1.0`;
    } else if (cmd === "dir") {
      const files = virtualFS[currentDir] || [];
      reply = `Directory of ${currentDir}\n\n` + files.map(f => `${f.type === "folder" ? "<DIR>" : "     "}  ${f.name}   ${f.size || ""}`).join("\n");
    } else if (cmd === "echo") {
      reply = arg;
    } else if (cmd === "open") {
      const target = arg.toLowerCase();
      if (target.includes("photoshop") || target.includes("psd")) {
        openApp("photoshop");
        reply = `Spawning Photoshop Instance... ok`;
      } else if (target.includes("illustrator") || target.includes("ai")) {
        openApp("illustrator");
        reply = `Spawning Illustrator Vector Instance... ok`;
      } else if (target.includes("notepad") || target.includes("txt")) {
        openApp("notepad");
        reply = `Spawning Notepad editor... ok`;
      } else if (target.includes("explorer") || target.includes("dir")) {
        openApp("explorer");
        reply = `Spawning File Explorer window... ok`;
      } else if (target.includes("chrome") || target.includes("browser")) {
        openApp("chrome");
        reply = `Spawning browser framework... ok`;
      } else if (target.includes("calc") || target.includes("calc")) {
        openApp("calc");
        reply = `Spawning math co-processor... ok`;
      } else {
        reply = `Unknown virtualization module target: ${arg}. Try 'open photoshop'.`;
      }
    } else if (cmd === "notepad-save") {
      setNotepadContent(prev => prev + "\n" + arg);
      reply = `Updated Notepad content with values: ${arg}`;
      openApp("notepad");
    }

    setCmdLines(prev => [...prev, `C:\\Users\\NeoraUser> ${input}`, reply, ""]);
    setCmdInput("");
  };

  // Calculator Submit
  const handleCalcBtn = (val: string) => {
    if (val === "C") {
      setCalcInput("");
      setCalcResult("");
    } else if (val === "=") {
      try {
        // Safe evaluation
        const clean = calcInput.replace(/[^0-9+\-*/().]/g, "");
        const res = new Function(`return ${clean}`)();
        setCalcResult(String(res));
      } catch (err) {
        setCalcResult("Error");
      }
    } else {
      setCalcInput(prev => prev + val);
    }
  };

  // Search Engine Chrome browser
  const handleChromeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = browserSearchInput.trim();
    if (!query) return;

    if (query.startsWith("http://") || query.startsWith("https://")) {
      setBrowserUrl(query);
      setSimulatedWebpage("custom");
    } else if (query.toLowerCase().includes("shukria") || query.toLowerCase().includes("print")) {
      setBrowserUrl("https://www.shukriaprinters.com/design-proof");
      setSimulatedWebpage("shukria");
    } else if (query.toLowerCase().includes("youtube") || query.toLowerCase().includes("video")) {
      setBrowserUrl("https://youtube.com/workspace-creative");
      setSimulatedWebpage("youtube");
    } else {
      setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      setSimulatedWebpage("google");
    }
  };

  // Assistant Parser (Core NLP simulated in OS)
  const parseAssistantCommand = (text: string) => {
    const raw = text.trim();
    const logText = `> You said: "${raw}"`;
    setAssistantLogs(prev => [...prev, logText]);

    const low = raw.toLowerCase();
    let reply = "";

    // Parse commands
    if (low.includes("photoshop") || low.includes("photo shop")) {
      openApp("photoshop");
      reply = lang === "bn" ? "ফটোশপ অ্যাপ্লিকেশন ওপেন করা হয়েছে বস!" : "Opened Photoshop interface!";
      if (low.includes("banner") || low.includes("poster") || low.includes("design") || low.includes("logo") || low.includes("ডিজাইন")) {
        triggerPhotoshopArtSim(raw);
      }
    } else if (low.includes("illustrator") || low.includes("vector")) {
      openApp("illustrator");
      reply = lang === "bn" ? "ইলাস্ট্রেটর ভেক্টর ওয়ার্কস্পেস চালু হয়েছে!" : "Opened Adobe Illustrator vector workspace!";
      // Add vector shape if keyword
      if (low.includes("circle") || low.includes("বৃত্ত") || low.includes("গোল")) {
        setIllShapes(prev => [...prev, { id: Date.now().toString(), type: "circle", x: 180, y: 180, color: "#e11d48" }]);
        reply += lang === "bn" ? " ক্যানভাসে একটি লাল বৃত্ত আঁকা হয়েছে।" : " Generated a red circle vector node.";
      } else if (low.includes("rect") || low.includes("বক্স") || low.includes("চারকোণ")) {
        setIllShapes(prev => [...prev, { id: Date.now().toString(), type: "rect", x: 200, y: 150, color: "#10b981" }]);
        reply += lang === "bn" ? " ক্যানভাসে একটি সবুজ বক্স আঁকা হয়েছে।" : " Ploced a green rectangle element.";
      }
    } else if (low.includes("notepad") || low.includes("নোটপ্যাড") || low.includes("নোট")) {
      openApp("notepad");
      reply = lang === "bn" ? "নোটপ্যাড ওপেন হয়েছে।" : "Notepad editor loaded!";
      // handle writing text
      const writeKeywords = ["type", "write", "লিখো", "টাইপ", "টাইপ করো"];
      for (const kw of writeKeywords) {
        if (low.includes(kw)) {
          const splitText = raw.slice(raw.indexOf(kw) + kw.length).trim();
          if (splitText) {
            setNotepadContent(prev => prev + "\n" + splitText);
            reply += lang === "bn" ? ` এবং লেখা হয়েছে: "${splitText}"` : ` and logged custom text string: "${splitText}"`;
          }
          break;
        }
      }
    } else if (low.includes("chrome") || low.includes("google") || low.includes("browser") || low.includes("ক্রোম")) {
      openApp("chrome");
      reply = lang === "bn" ? "ক্রোম ওয়েব ব্রাউজার চালু হয়েছে।" : "Opened Chrome Browser!";
      if (low.includes("facebook") || low.includes("ফেইসবুক")) {
        setBrowserUrl("https://facebook.com");
        setSimulatedWebpage("custom");
      } else if (low.includes("shukria") || low.includes("শুকরিয়া") || low.includes("printer")) {
        setBrowserUrl("https://www.shukriaprinters.com/design-proof");
        setSimulatedWebpage("shukria");
      }
    } else if (low.includes("cmd") || low.includes("terminal") || low.includes("কমান্ড")) {
      openApp("cmd");
      reply = lang === "bn" ? "কমান্ড প্রম্পট শুরু হয়েছে বস।" : "Command Prompt has been spun up!";
    } else if (low.includes("calc") || low.includes("calculator") || low.includes("হিসাব")) {
      openApp("calc");
      reply = lang === "bn" ? "ক্যালকুলেটর কো-প্রসেসর ওপেন করা হয়েছে।" : "Loaded high-performance math simulator!";
      // Math parsing
      const mathMatch = low.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
      if (mathMatch) {
         const n1 = parseInt(mathMatch[1]);
         const op = mathMatch[2];
         const n2 = parseInt(mathMatch[3]);
         let resValue = 0;
         if (op === "+") resValue = n1 + n2;
         if (op === "-") resValue = n1 - n2;
         if (op === "*") resValue = n1 * n2;
         if (op === "/") resValue = n1 / n2;
         setCalcInput(`${n1}${op}${n2}`);
         setCalcResult(String(resValue));
         reply += ` Solution generated automatically: ${n1} ${op} ${n2} = ${resValue}`;
      }
    } else if (low.includes("explorer") || low.includes("file") || low.includes("ফাইল")) {
      openApp("explorer");
      reply = lang === "bn" ? "ভার্চুয়াল ওএস ফাইল এক্সপ্লোরার ওপেন করা হয়েছে।" : "File Explorer container mounted!";
    } else if (low.includes("close all") || low.includes("বন্ধ করো") || low.includes("সব বন্ধ")) {
      setWindows(prev => prev.map(w => ({ ...w, isOpen: false })));
      reply = lang === "bn" ? "সব রানিং উইন্ডো সফলভাবে বন্ধ করা হয়েছে।" : "All virtual interfaces terminated.";
    } else if (low.includes("wallpaper") || low.includes("ব্যাকগ্রাউন্ড")) {
      const themes = ["cyber", "glowing-nebula", "emerald-glass", "cosmic-cyber"];
      const nextTheme = themes[Math.floor(Math.random() * themes.length)];
      setBgWallpaper(nextTheme);
      reply = `Switched virtual system theme to: ${nextTheme.toUpperCase()}`;
    } else {
      reply = lang === "bn"
        ? "ভয়েস মেমো প্রসেস হচ্ছে... যদি সঠিক উইন্ডো ওপেন না হয়, তবে 'open photoshop' বা 'open chrome' টাইপ করুন।"
        : "Analysing request context... If not triggering, make sure to explicitly say 'open photoshop', 'open chrome', 'open cmd' or 'open notepad'.";
    }

    setAssistantLogs(prev => [...prev, `Neora Jarvis: ${reply}`]);
    triggerNotification(reply);
    speakSynthesisLocal(reply);
    setAssistantInput("");
  };

  // Text to Speech
  const speakSynthesisLocal = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1.05;
      u.lang = lang === "bn" ? "bn-BD" : "en-US";
      window.speechSynthesis.speak(u);
    }
  };

  // Photoshop Art generator inside simulator
  const triggerPhotoshopArtSim = (promptText: string) => {
    setIsGeneratingArt(true);
    setGeneratedArtPrompt(promptText);
    setTimeout(() => {
      setIsGeneratingArt(false);
      // Generate a canvas visual
      setPhotoshopCanvasArt("gradient-poster");
      setPsLayers(prev => [
        { id: prev.length + 1, name: "Voice Prompt Element Mask", visible: true, opacity: 100 },
        ...prev
      ]);
      triggerNotification("Synthesized original graphic art into active layer.");
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030712] overflow-hidden select-none font-sans relative">
      
      {/* ===== 1. OS Screen Stage ===== */}
      <div className={`flex-1 relative overflow-hidden flex flex-col transition-all duration-300 ${
        bgWallpaper === "cosmic-cyber" ? "bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-[#020617]" :
        bgWallpaper === "cyber" ? "bg-[linear-gradient(220deg,_#111827_0%,_#311042_40%,_#090514_100%)]" :
        bgWallpaper === "emerald-glass" ? "bg-[radial-gradient(ellipse_at_top,_#042f2e_0%,_#020617_80%)]" :
        "bg-[slate-950]"
      }`}>
        
        {/* Subtle grid accent */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        {/* Wallpaper Branding */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center opacity-[0.03] select-none">
          <h1 className="text-8x text-cyan-400 font-extrabold tracking-[0.4em] font-mono select-none">NEORA</h1>
          <p className="text-lg text-white tracking-[0.6em] font-mono select-none">COGNITIVE EMULATOR OS</p>
        </div>

        {/* ===== Desktop Icons Grid ===== */}
        <div className="absolute top-6 left-6 grid grid-flow-row auto-rows-max gap-4 z-10 w-28">
          <div
            id="des-icon-photoshop"
            onDoubleClick={() => openApp("photoshop")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-transparent hover:bg-white/5 hover:border-cyan-500/20 group cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-400/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-mono font-extrabold text-lg">Ps</span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-300 text-center font-medium mt-1.5 truncate w-full text-shadow">Photoshop</span>
          </div>

          <div
            id="des-icon-illustrator"
            onDoubleClick={() => openApp("illustrator")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-transparent hover:bg-white/5 hover:border-amber-500/20 group cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/10 border border-amber-400/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-mono font-extrabold text-lg">Ai</span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-300 text-center font-medium mt-1.5 truncate w-full text-shadow">Illustrator</span>
          </div>

          <div
            id="des-icon-chrome"
            onDoubleClick={() => openApp("chrome")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-transparent hover:bg-white/5 hover:border-cyan-500/20 group cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-green-500 to-yellow-500 flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
              <Chrome className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-300 text-center font-medium mt-1.5 truncate w-full text-shadow">Chrome</span>
          </div>

          <div
            id="des-icon-explorer"
            onDoubleClick={() => openApp("explorer")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-transparent hover:bg-white/5 hover:border-blue-500/20 group cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-400/20 group-hover:scale-105 transition-transform">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-300 text-center font-medium mt-1.5 truncate w-full text-shadow">C: Drive</span>
          </div>

          <div
            id="des-icon-notepad"
            onDoubleClick={() => openApp("notepad")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-transparent hover:bg-white/5 hover:border-emerald-500/20 group cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-400 flex items-center justify-center shadow-lg border border-emerald-400/20 group-hover:scale-105 transition-transform">
              <Clipboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-300 text-center font-medium mt-1.5 truncate w-full text-shadow">Notepad</span>
          </div>

          <div
            id="des-icon-cmd"
            onDoubleClick={() => openApp("cmd")}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-transparent hover:bg-white/5 hover:border-slate-500/20 group cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Terminal className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-[10px] sm:text-xs text-slate-300 text-center font-medium mt-1.5 truncate w-full text-shadow">CMD.exe</span>
          </div>
        </div>

        {/* ===== WINDOWS VIEW PORT ===== */}
        <div className="absolute inset-0 p-4 overflow-hidden pointer-events-none z-20">
          <AnimatePresence>
            {windows.map(w => {
              if (!w.isOpen) return null;
              const isActive = activeWindow === w.appId;

              return (
                <motion.div
                  id={`window-${w.id}`}
                  key={w.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{
                    opacity: w.isMinimized ? 0 : 1,
                    scale: w.isMinimized ? 0.85 : 1,
                    x: w.isMaximized ? 0 : w.x,
                    y: w.isMaximized ? 0 : w.y,
                    width: w.isMaximized ? "100%" : w.width,
                    height: w.isMaximized ? "100%" : w.height,
                    zIndex: w.zIndex,
                    pointerEvents: w.isMinimized ? "none" : "auto"
                  }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  onClick={() => focusWindow(w.appId)}
                  className={`absolute pointer-events-auto flex flex-col rounded-xl overflow-hidden border bg-slate-950/95 shadow-2xl backdrop-blur-xl ${
                    isActive ? "border-cyan-500/30 ring-1 ring-cyan-500/10 shadow-cyan-950/20" : "border-slate-800 shadow-black/50"
                  }`}
                  style={{
                    maxWidth: w.isMaximized ? "100%" : "calc(100vw - 32px)",
                    maxHeight: w.isMaximized ? "100%" : "calc(100vh - 100px)"
                  }}
                >
                  {/* Window Bar header */}
                  <div
                    onDoubleClick={(e) => maximizeWindow(w.id, e)}
                    onMouseDown={(e) => handleDragStart(e, w.id)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-move select-none shrink-0 ${
                      isActive ? "bg-slate-900/90 text-cyan-400" : "bg-slate-950 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-700/60 animate-pulse" />
                      <span className="text-xs font-mono font-semibold truncate max-w-sm">{w.title}</span>
                    </div>

                    {/* Controls window */}
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`win-btn-min-${w.id}`}
                        onClick={(e) => minimizeWindow(w.id, e)}
                        className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`win-btn-max-${w.id}`}
                        onClick={(e) => maximizeWindow(w.id, e)}
                        className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <Square className="w-3 h-3" />
                      </button>
                      <button
                        id={`win-btn-close-${w.id}`}
                        onClick={(e) => closeWindow(w.id, e)}
                        className="p-1 rounded-md hover:bg-rose-500/25 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Window Content stage */}
                  <div className="flex-1 overflow-hidden flex flex-col bg-slate-950 text-slate-200">
                    
                    {/* APP 1: PHOTOSHOP SIMULATOR */}
                    {w.appId === "photoshop" && (
                      <div className="flex-1 flex overflow-hidden">
                        {/* Left tools bar */}
                        <div className="w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 shrink-0">
                          {["pointer", "brush", "crop", "txt", "eyedropper"].map((tool) => (
                            <button
                              id={`ps-tool-${tool}`}
                              key={tool}
                              onClick={() => setPsActiveTool(tool)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                psActiveTool === tool ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "text-slate-500 hover:bg-white/5"
                              }`}
                            >
                              {tool === "pointer" && <LayoutGrid className="w-4 h-4" />}
                              {tool === "brush" && <PenTool className="w-4 h-4" />}
                              {tool === "crop" && <Square className="w-4 h-4" />}
                              {tool === "txt" && <span className="font-serif font-black text-xs">T</span>}
                              {tool === "eyedropper" && <HelpCircle className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>

                        {/* Middle canvas */}
                        <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center overflow-auto relative">
                          
                          {/* Design target card canvas */}
                          <div className={`w-full max-w-md aspect-[4/3] rounded-xl border relative shadow-xl overflow-hidden flex flex-col items-center justify-center transition-all ${
                            isGeneratingArt ? "border-cyan-500/50 bg-[#061021]/30" : "border-slate-800 bg-[#0a0f1d]"
                          }`}>
                            
                            {/* ART LAYERS DISPLAY */}
                            {isGeneratingArt ? (
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                                <span className="text-xs text-cyan-400 font-mono">Synthesizing Voice Prompt Model...</span>
                              </div>
                            ) : photoshopCanvasArt === "gradient-poster" ? (
                              <div id="ps-art-output" className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 flex flex-col justify-between p-6">
                                <div className="flex justify-between items-start">
                                  <span className="text-[9px] font-mono tracking-widest text-cyan-400/80 uppercase font-black">Neora Cloud Generative v2</span>
                                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center">
                                    <span className="text-cyan-400 font-bold font-mono text-[10px]">S</span>
                                  </div>
                                </div>
                                <div className="text-center my-auto px-4">
                                  <span className="text-[10px] font-mono tracking-widest text-[#7c3aed] uppercase font-semibold">PREMIUM DESIGN LAB</span>
                                  <p className="text-2xl font-black text-white tracking-wide leading-tight drop-shadow-md mt-1">{generatedArtPrompt || "VOICE GENERATION ACTIVE"}</p>
                                  <p className="text-[10px] text-slate-400 font-mono mt-2">Prepared precisely for user: shukriaprinters@gmail.com</p>
                                </div>
                                <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 border-t border-slate-800/60 pt-3">
                                  <span>GULSHAN CREATIVE BRANCH</span>
                                  <span>100% VECTOR PROOF</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-6 text-slate-500">
                                <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-xs font-semibold text-slate-400">Empty Photoshop Stage</p>
                                <p className="text-[10px] text-slate-600 mt-1 max-w-xs leading-relaxed">
                                  Give Neora OS Assistant a voice command like `open photoshop and design a poster for Shukria printers` to generate mockups here dynamically.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Trigger control prompt */}
                          <div className="w-full max-w-md mt-4 flex gap-2">
                            <input
                              id="ps-prompt-input"
                              type="text"
                              value={generatedArtPrompt}
                              onChange={(e) => setGeneratedArtPrompt(e.target.value)}
                              placeholder="Describe custom prompt here..."
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg text-xs px-3 focus:outline-none focus:border-cyan-500"
                            />
                            <button
                              id="ps-generate-btn"
                              onClick={() => triggerPhotoshopArtSim(generatedArtPrompt || "Neon Banner design for printers")}
                              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Render
                            </button>
                          </div>
                        </div>

                        {/* Right sidebar layers list */}
                        <div className="w-48 bg-slate-900 border-l border-slate-800 flex flex-col justify-between py-3 shrink-0">
                          <div className="px-3">
                            <span className="text-[10px] font-mono text-slate-400 block mb-3 uppercase tracking-wider">Layer Index</span>
                            <div className="space-y-1">
                              {psLayers.map(l => (
                                <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/40 text-[11px] font-mono">
                                  <span className="truncate max-w-[120px] text-slate-300">{l.name}</span>
                                  <span className="text-slate-500 text-[9px]">{l.opacity}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="px-3 pt-3 border-t border-slate-800/50 text-[10px] text-slate-500 font-mono text-center">
                            Canvas Size: 1920x1080 300DPI
                          </div>
                        </div>
                      </div>
                    )}

                    {/* APP 2: ILLUSTRATOR SIMULATOR */}
                    {w.appId === "illustrator" && (
                      <div className="flex-1 flex overflow-hidden">
                        {/* Selector toolbox */}
                        <div className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 shrink-0">
                          <button
                            id="ill-shape-add-circle"
                            onClick={() => setIllShapes(prev => [...prev, { id: Date.now().toString(), type: "circle", x: 150, y: 150, color: illColor }])}
                            className="w-10 h-10 rounded-lg bg-slate-950 hover:bg-slate-800 flex flex-col items-center justify-center text-amber-400 border border-slate-800 hover:border-amber-500/20 group"
                            title="Add Circle"
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-current" />
                            <span className="text-[8px] font-mono text-slate-500 group-hover:text-amber-400 mt-1">Circle</span>
                          </button>
                          
                          <button
                            id="ill-shape-add-rect"
                            onClick={() => setIllShapes(prev => [...prev, { id: Date.now().toString(), type: "rect", x: 180, y: 180, color: illColor }])}
                            className="w-10 h-10 rounded-lg bg-slate-950 hover:bg-slate-800 flex flex-col items-center justify-center text-amber-400 border border-slate-800 hover:border-amber-500/20 group"
                            title="Add Rectangle"
                          >
                            <Square className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-mono text-slate-500 group-hover:text-amber-400 mt-1">Rect</span>
                          </button>

                          <button
                            id="ill-shape-add-text"
                            onClick={() => {
                              const txt = prompt("Enter text vector content:") || "New Accent Text";
                              setIllShapes(prev => [...prev, { id: Date.now().toString(), type: "text", x: 100, y: 100, color: "#fff", text: txt }]);
                            }}
                            className="w-10 h-10 rounded-lg bg-slate-950 hover:bg-slate-800 flex flex-col items-center justify-center text-amber-400 border border-slate-800 hover:border-amber-500/20 group"
                            title="Add Text"
                          >
                            <span className="text-xs font-serif font-black">T</span>
                            <span className="text-[8px] font-mono text-slate-500 group-hover:text-amber-400 mt-1">Text</span>
                          </button>

                          <button
                            id="ill-clear-btn"
                            onClick={() => setIllShapes([])}
                            className="w-10 h-10 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 flex flex-col items-center justify-center text-rose-400 border border-rose-900/25"
                            title="Clear artboard"
                          >
                            <X className="w-4 h-4" />
                            <span className="text-[8px] mt-0.5">Clear</span>
                          </button>
                        </div>

                        {/* Interactive Artboard */}
                        <div className="flex-1 bg-[#1e1e24] p-4 flex flex-col items-center justify-center">
                          <div className="w-full max-w-xl aspect-[1.4] bg-[#2d2d34] border border-slate-700/50 rounded-lg relative overflow-hidden shadow-2xl">
                            {/* Grid overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:15px_15px]" />
                            
                            {illShapes.map((shape) => (
                              <div
                                key={shape.id}
                                className="absolute cursor-move select-none"
                                style={{ left: shape.x, top: shape.y }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const startX = e.clientX;
                                  const startY = e.clientY;
                                  const initX = shape.x;
                                  const initY = shape.y;
                                  const handleMove = (mv: MouseEvent) => {
                                    const dx = mv.clientX - startX;
                                    const dy = mv.clientY - startY;
                                    setIllShapes(prev => prev.map(s => s.id === shape.id ? { ...s, x: initX + dx, y: initY + dy } : s));
                                  };
                                  const handleUp = () => {
                                    document.removeEventListener("mousemove", handleMove);
                                    document.removeEventListener("mouseup", handleUp);
                                  };
                                  document.addEventListener("mousemove", handleMove);
                                  document.addEventListener("mouseup", handleUp);
                                }}
                              >
                                {shape.type === "circle" && (
                                  <div
                                    className="w-16 h-16 rounded-full border border-amber-400 shadow-lg"
                                    style={{ backgroundColor: shape.color }}
                                  />
                                )}
                                {shape.type === "rect" && (
                                  <div
                                    className="w-24 h-16 border border-amber-400 shadow-lg"
                                    style={{ backgroundColor: shape.color }}
                                  />
                                )}
                                {shape.type === "text" && (
                                  <span
                                    className="text-white font-extrabold text-sm font-sans drop-shadow border border-dashed border-amber-400/20 px-2 py-1 bg-black/40 rounded whitespace-nowrap"
                                    style={{ color: shape.color }}
                                  >
                                    {shape.text}
                                  </span>
                                )}
                              </div>
                            ))}

                            {illShapes.length === 0 && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                <PenTool className="w-8 h-8 text-slate-600 animate-bounce mb-2" />
                                <span className="text-xs">Artboard empty. Drag elements or dictate from toolbox.</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Color swatches */}
                          <div className="flex gap-2.5 mt-3 items-center">
                            <span className="text-[10px] font-mono text-slate-400">Palette:</span>
                            {["#00d4ff", "#e11d48", "#10b981", "#f5a623", "#7c3aed", "#ffffff"].map((col) => (
                              <button
                                key={col}
                                onClick={() => setIllColor(col)}
                                className={`w-5 h-5 rounded-full border transition-transform ${
                                  illColor === col ? "scale-125 border-white border-2" : "border-slate-800"
                                }`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* APP 3: CHROME BROWSER */}
                    {w.appId === "chrome" && (
                      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
                        {/* URL Bar */}
                        <div className="bg-slate-950 p-2.5 border-b border-slate-800 flex items-center gap-2 shrink-0">
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              id="chrome-back-btn"
                              onClick={() => {
                                if (browserHistory.length > 1) {
                                  const hist = [...browserHistory];
                                  hist.pop();
                                  setBrowserHistory(hist);
                                  const prevUrl = hist[hist.length - 1];
                                  setBrowserUrl(prevUrl);
                                  if (prevUrl.includes("shukria")) setSimulatedWebpage("shukria");
                                  else if (prevUrl.includes("youtube")) setSimulatedWebpage("youtube");
                                  else setSimulatedWebpage("google");
                                }
                              }}
                              className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                            >
                              ←
                            </button>
                            <span className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">→</span>
                            <button
                              id="chrome-refresh-btn"
                              onClick={() => triggerNotification("Refreshed browser sandbox connection")}
                              className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <form onSubmit={handleChromeSearch} className="flex-1 flex">
                            <input
                              id="chrome-url-input"
                              type="text"
                              value={browserSearchInput}
                              onChange={(e) => setBrowserSearchInput(e.target.value)}
                              placeholder="Search google or type key concepts..."
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                            />
                          </form>
                          <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-mono shrink-0">SSL: SECURE</div>
                        </div>

                        {/* Web page frames */}
                        <div className="flex-1 overflow-auto bg-[#0a0a0f] p-4 text-slate-300">
                          {simulatedWebpage === "google" && (
                            <div className="max-w-2xl mx-auto py-8">
                              <h2 className="text-4xl text-center font-bold font-sans text-white mb-6">
                                <span className="text-blue-500">G</span>
                                <span className="text-red-500">o</span>
                                <span className="text-yellow-500">o</span>
                                <span className="text-blue-500">g</span>
                                <span className="text-green-500">l</span>
                                <span className="text-red-500">e</span>
                              </h2>
                              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3 text-xs mb-8 text-slate-400">
                                <span>Search index matches query, generated automatically via virtual web portal. No CORS policies were blocked.</span>
                              </div>
                              <div className="space-y-6">
                                <div className="border border-slate-800/60 p-4 rounded-lg bg-slate-950/40 hover:bg-slate-950/80 transition-colors">
                                  <h3
                                    onClick={() => { setBrowserUrl("https://shukriaprinters.com/design-proof"); setSimulatedWebpage("shukria"); }}
                                    className="text-blue-400 hover:underline cursor-pointer text-sm font-semibold"
                                  >
                                    Shukria Printers - Digital Flex Printing & Corporate Banners Bangladesh
                                  </h3>
                                  <p className="text-[10px] text-slate-500 mt-0.5">https://shukriaprinters.com</p>
                                  <p className="text-xs text-slate-400 mt-2">Local designer suite for custom brochures, pvc banners, cards and logo setups. Gulshan local office. Neora partner node.</p>
                                </div>
                                <div className="border border-slate-800/60 p-4 rounded-lg bg-slate-950/40">
                                  <h3 className="text-blue-400 hover:underline cursor-pointer text-sm font-semibold">
                                    How to configure neora_agent_enhanced.py client?
                                  </h3>
                                  <p className="text-[10px] text-slate-500 mt-0.5">https://github.com/neora/docs/python-agent</p>
                                  <p className="text-xs text-slate-400 mt-2">Detailed tutorial regarding configuring PyAutoGUI and SpeechRecognition services on Microsoft Windows 11 system platforms.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {simulatedWebpage === "shukria" && (
                            <div className="max-w-2xl mx-auto py-4 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl">
                              <div className="flex border-b border-slate-800 pb-4 justify-between items-center">
                                <div>
                                  <h2 className="text-lg font-black text-white">SHUKRIA PRINTERS (ONLINE DECK)</h2>
                                  <p className="text-[10px] font-mono text-cyan-400">CONNECTED VIA VIRTUAL NEORA EMULATOR DRIVERS</p>
                                </div>
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded font-bold border border-emerald-500/20 uppercase tracking-widest animate-pulse">APPROVED CUSTOMER</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 my-6">
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Active Stage Mockups</span>
                                  <h4 className="text-sm font-bold text-slate-300 mt-2">corporate_banner_draft.psd</h4>
                                  <p className="text-[10px] text-slate-500 mt-1">Ready for printing on 4x6 Canvas pvc glossy sheet</p>
                                  <button
                                    onClick={() => openApp("photoshop")}
                                    className="bg-cyan-500 text-slate-950 text-[10px] font-extrabold uppercase mt-4 py-2 rounded-lg hover:scale-105 transition-transform"
                                  >
                                    Open PSD in Photoshop
                                  </button>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Active Vector Assets</span>
                                  <h4 className="text-sm font-bold text-slate-300 mt-2">shukria_cyber_logo.ai</h4>
                                  <p className="text-[10px] text-slate-500 mt-1">Logo nodes ready for customization proofing</p>
                                  <button
                                    onClick={() => openApp("illustrator")}
                                    className="bg-cyan-500 text-slate-950 text-[10px] font-extrabold uppercase mt-4 py-2 rounded-lg hover:scale-105 transition-transform"
                                  >
                                    Open AI in Illustrator
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {simulatedWebpage === "youtube" && (
                            <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg">
                              <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 hover:bg-slate-850/60 transition-colors group cursor-pointer">
                                <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <CirclePlay className="w-8 h-8 text-white fill-current" />
                                </div>
                              </div>
                              <h3 className="text-sm font-extrabold text-white mt-4 leading-tight">Advanced Adobe Photoshop Automation Workflow with neora_agent_enhanced.py</h3>
                              <p className="text-[11px] text-slate-500 font-mono mt-1">YouTube Workplace Player • 12,450 views • June 2026</p>
                            </div>
                          )}

                          {simulatedWebpage === "custom" && (
                            <div className="max-w-xl mx-auto py-16 text-center text-slate-400">
                              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                              <h3 className="text-sm font-bold text-slate-300 mb-1">Simulated Redirect Portal</h3>
                              <p className="text-xs leading-relaxed max-w-sm mx-auto">This browser redirects mock pages recursively. Type `shukria` or `how to run neora_agent_enhanced` inside search bar above to see localized mock page setups!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* APP 4: NOTEPAD SIMULATOR */}
                    {w.appId === "notepad" && (
                      <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d13]">
                        <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400 shrink-0">
                          <span>File: unsaved_draft_utf8.txt</span>
                          <button
                            id="notepad-save-btn"
                            onClick={() => {
                              triggerNotification("Saved note file recursively inside virtual drive!");
                              openApp("explorer");
                            }}
                            className="text-cyan-400 hover:text-white font-bold"
                          >
                            [Save File]
                          </button>
                        </div>
                        <textarea
                          id="notepad-editor-textarea"
                          value={notepadContent}
                          onChange={(e) => setNotepadContent(e.target.value)}
                          className="flex-1 bg-transparent text-slate-200 outline-none p-4 text-xs font-mono resize-none leading-relaxed"
                          placeholder="Dictate text or type design metadata here..."
                        />
                      </div>
                    )}

                    {/* APP 5: COMMAND PROMPT (CMD) */}
                    {w.appId === "cmd" && (
                      <div className="flex-1 flex flex-col p-4 bg-[#010103] text-emerald-400 font-mono text-xs overflow-auto">
                        <div className="flex-1 overflow-auto">
                          {cmdLines.map((line, idx) => (
                            <p key={idx} className="whitespace-pre-wrap leading-relaxed">{line}</p>
                          ))}
                        </div>
                        
                        <form onSubmit={handleCmdSubmit} className="flex gap-1 shrink-0 bg-transparent py-1 border-t border-slate-900 mt-2">
                          <span className="text-slate-400">C:\Users\NeoraUser&gt;</span>
                          <input
                            id="cmd-input-field"
                            type="text"
                            value={cmdInput}
                            onChange={(e) => setCmdInput(e.target.value)}
                            className="flex-1 bg-transparent text-emerald-400 outline-none border-none font-mono text-xs"
                            autoFocus
                            placeholder="type command..."
                          />
                        </form>
                      </div>
                    )}

                    {/* APP 6: FILE EXPLORER */}
                    {w.appId === "explorer" && (
                      <div className="flex-1 flex overflow-hidden">
                        {/* Left structural rails */}
                        <div className="w-40 bg-slate-900 border-r border-slate-800 flex flex-col p-3 gap-1 shrink-0 font-mono text-xs text-slate-400">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block py-2.5">System drives</span>
                          
                          <button
                            id="exp-dir-c"
                            onClick={() => setCurrentDir("C:/Documents")}
                            className={`flex items-center gap-2 p-2 rounded-lg text-[11px] transition-colors ${
                              currentDir.startsWith("C:") ? "bg-cyan-500/10 text-cyan-400" : "hover:bg-white/5"
                            }`}
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Local Disk (C:)</span>
                          </button>

                          <button
                            id="exp-dir-d"
                            onClick={() => setCurrentDir("D:/Designs")}
                            className={`flex items-center gap-2 p-2 rounded-lg text-[11px] transition-colors ${
                              currentDir.startsWith("D:") ? "bg-cyan-500/10 text-cyan-400" : "hover:bg-white/5"
                            }`}
                          >
                            <HardDrive className="w-3.5 h-3.5 animate-pulse" />
                            <span>Design Disk (D:)</span>
                          </button>
                        </div>

                        {/* Files display grid */}
                        <div className="flex-1 bg-slate-950 overflow-auto p-4 flex flex-col">
                          {/* Breadcrumbs bar */}
                          <div className="text-[10px] font-mono text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800/60 mb-4 shrink-0">
                            Path: <span className="text-cyan-400">{currentDir}</span>
                          </div>

                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-max overflow-auto">
                            {(virtualFS[currentDir] || []).map((file, idx) => (
                              <div
                                id={`file-item-${file.name}`}
                                key={idx}
                                onDoubleClick={() => {
                                  if (file.assocApp) {
                                    if (file.content) setNotepadContent(file.content);
                                    openApp(file.assocApp);
                                  } else {
                                    triggerNotification(`Opening file: ${file.name}`);
                                  }
                                }}
                                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-white/5 hover:border-cyan-500/20 group cursor-pointer transition-all"
                              >
                                <FolderOpen className="w-8 h-8 text-amber-500 group-hover:scale-105 transition-transform mb-2" />
                                <span className="text-[11px] text-slate-300 font-medium text-center truncate w-full">{file.name}</span>
                                {file.size && <span className="text-[9px] font-mono text-slate-500 mt-0.5">{file.size}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* APP 7: CALCULATOR */}
                    {w.appId === "calc" && (
                      <div className="flex-1 flex flex-col p-4 bg-slate-950 overflow-auto justify-between">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-right">
                          <div className="text-slate-500 font-mono text-xs h-4 overflow-hidden mb-1">{calcInput || "0"}</div>
                          <div className="text-white font-mono font-bold text-xl truncate">{calcResult || "0"}</div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mt-4 flex-1">
                          {["C", "(", ")", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "="].map((val) => (
                            <button
                              id={`calc-btn-${val}`}
                              key={val}
                              onClick={() => handleCalcBtn(val)}
                              className={`rounded-lg font-mono font-bold text-xs p-3 transition-colors ${
                                val === "=" ? "bg-cyan-500 text-slate-950 hover:bg-cyan-600 col-span-2" :
                                val === "C" ? "bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 border border-rose-900/25" :
                                ["/", "*", "-", "+"].includes(val) ? "bg-slate-900 text-cyan-400 hover:bg-slate-850" :
                                "bg-slate-900 text-slate-300 hover:bg-slate-850"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ===== 2. INTEGRATIVE VOICE ASSISTANT ORB WIDGET ===== */}
        <div className="absolute bottom-16 right-6 z-40 max-w-xs sm:max-w-sm">
          <div className="rounded-xl border border-cyan-500/20 bg-slate-950/90 backdrop-blur-md p-4 shadow-2xl flex flex-col gap-3">
            
            {/* Assistant Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full flex items-center justify-center bg-cyan-400/20 border border-cyan-400/50 ${
                  isAssistantVoiceActive ? "animate-ping" : ""
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <span className="text-[11px] font-bold font-mono tracking-wider text-cyan-400">NEORA OS COPILOT</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">SYSTEM: SIMULATOR ACTIVE</span>
            </div>

            {/* Terminal logs area */}
            <div className="h-28 overflow-y-auto bg-slate-900/80 rounded-lg p-2.5 font-mono text-[10px] leading-relaxed border border-slate-800/60 flex flex-col gap-1.5">
              {assistantLogs.map((log, idx) => (
                <div key={idx} className={`${log.startsWith(">") ? "text-cyan-400" : "text-slate-300"}`}>{log}</div>
              ))}
            </div>

            {/* Input elements action */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (assistantInput.trim()) parseAssistantCommand(assistantInput);
              }}
              className="flex gap-2"
            >
              <input
                id="assistant-textbox"
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder={lang === "bn" ? "ভয়েস বা টেক্সট কমান্ড লিখুন..." : "Dictate OS voice commands..."}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg text-xs px-3 focus:outline-none focus:border-cyan-500"
              />
              <button
                id="assistant-textbox-mic-btn"
                type="button"
                onClick={() => {
                  setIsAssistantVoiceActive(v => !v);
                  triggerNotification("Virtual Microphone Listening...");
                  if ("webkitSpeechRecognition" in window) {
                    const SpeechRecognition = (window as any).webkitSpeechRecognition;
                    const rec = new SpeechRecognition();
                    rec.lang = lang === "bn" ? "bn-BD" : "en-US";
                    rec.onresult = (evt: any) => {
                      const transcript = evt.results[0][0].transcript;
                      setAssistantInput(transcript);
                      parseAssistantCommand(transcript);
                      setIsAssistantVoiceActive(false);
                    };
                    rec.onerror = () => setIsAssistantVoiceActive(false);
                    rec.onend = () => setIsAssistantVoiceActive(false);
                    rec.start();
                  } else {
                    // Fallback simulated input after 1.5 seconds if webkit not supported
                    setTimeout(() => {
                      const mocks = [
                        "open photoshop and design business catalog",
                        "open calculator",
                        "open notepad and write Welcome to Shukria Printers",
                        "open chrome"
                      ];
                      const mockInput = mocks[Math.floor(Math.random() * mocks.length)];
                      setAssistantInput(mockInput);
                      parseAssistantCommand(mockInput);
                      setIsAssistantVoiceActive(false);
                    }, 1500);
                  }
                }}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  isAssistantVoiceActive ? "bg-rose-500Text text-slate-100 bg-rose-600 animate-pulse" : "bg-cyan-500 text-slate-950 hover:bg-cyan-600"
                }`}
                title="Google API speech capture"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                id="assistant-textbox-send-btn"
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* ===== START MENU MODAL GRID ===== */}
        <AnimatePresence>
          {startMenuOpen && (
            <motion.div
              id="start-menu-popup"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 180 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-80 sm:w-96 rounded-xl border border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl p-5 shadow-2xl z-50 flex flex-col gap-4 text-slate-100"
            >
              
              {/* Search index wrapper */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  id="start-menu-search"
                  type="text"
                  placeholder="Type to search apps..."
                  className="w-full bg-slate-900 border border-slate-800 text-xs px-9 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Programs lists */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2.5">Pinned Systems</span>
                <div className="grid grid-cols-4 gap-2.5 text-center">
                  {[
                    { id: "photoshop", name: "Photoshop", acronym: "Ps", col: "from-blue-600 to-cyan-500" },
                    { id: "illustrator", name: "Illustrator", acronym: "Ai", col: "from-amber-600 to-yellow-500" },
                    { id: "chrome", name: "Chrome", icon: Chrome, col: "from-rose-500 to-yellow-500" },
                    { id: "explorer", name: "Files", icon: FolderOpen, col: "from-blue-500 to-indigo-500" },
                    { id: "notepad", name: "Notepad", icon: Clipboard, col: "from-emerald-600 to-teal-500" },
                    { id: "cmd", name: "CMD terminal", icon: Terminal, col: "from-slate-800 to-slate-950" },
                    { id: "calc", name: "Calculator", icon: Monitor, col: "from-purple-600 to-indigo-500" }
                  ].map((app) => (
                    <button
                      id={`start-item-${app.id}`}
                      key={app.id}
                      onClick={() => openApp(app.id)}
                      className="flex flex-col items-center p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.col} flex items-center justify-center shadow-md mb-1`}>
                        {app.acronym ? (
                          <span className="text-white font-mono font-black text-sm">{app.acronym}</span>
                        ) : app.icon ? (
                          <app.icon className="w-5 h-5 text-white" />
                        ) : null}
                      </div>
                      <span className="text-[9px] font-medium block truncate w-full text-slate-400">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer details user info */}
              <div className="flex border-t border-slate-900 pt-3.5 items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-[10px] font-bold">SP</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-200 leading-tight">Shukria Printers</span>
                    <span className="text-[8px] text-slate-500">shukriaprinters@gmail.com</span>
                  </div>
                </div>

                <button
                  id="start-menu-power"
                  onClick={() => {
                    setStartMenuOpen(false);
                    triggerNotification("Simulator session logged off.");
                  }}
                  className="text-rose-400 hover:text-white font-mono text-[10px] uppercase font-bold"
                >
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== SYS NOTIFICATION POPUPS ===== */}
        <AnimatePresence>
          {sysNotification && (
            <motion.div
              id="sys-notification"
              initial={{ opacity: 0, x: 100, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-6 right-6 z-50 bg-[#091122]/95 border border-cyan-500/20 rounded-xl px-4 py-3 shadow-[0_0_24px_rgba(6,182,212,0.15)] flex items-center gap-3 backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce shrink-0" />
              <div className="text-xs font-mono">
                <span className="text-cyan-400 block font-bold uppercase text-[9px] tracking-wider mb-0.5">NEORA EVENT LOG</span>
                <span className="text-slate-300">{sysNotification}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ===== 3. TASKBAR FOOTER PANEL ===== */}
      <div className="h-14 bg-slate-950/95 border-t border-slate-800/80 z-30 shrink-0 flex items-center justify-between px-4 sm:px-6 shadow-[0_-8px_40px_rgba(0,0,0,0.8)] backdrop-blur-lg select-none">
        
        {/* Toggle Start menu */}
        <div className="flex items-center gap-1.5">
          <button
            id="taskbar-start-btn"
            onClick={() => setStartMenuOpen(v => !v)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              startMenuOpen ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
            title="Start"
          >
            <Grid className="w-5 h-5" />
          </button>
        </div>

        {/* Running apps taskbar indicators */}
        <div className="flex-1 flex justify-center gap-2 px-6">
          {[
            { id: "photoshop", name: "Photoshop", acronym: "Ps", color: "text-blue-400" },
            { id: "illustrator", name: "Illustrator", acronym: "Ai", color: "text-amber-500" },
            { id: "chrome", name: "Chrome", icon: Chrome, color: "text-emerald-400" },
            { id: "explorer", name: "Explorer", icon: FolderOpen, color: "text-indigo-400" },
            { id: "notepad", name: "Notepad", icon: Clipboard, color: "text-slate-200" },
            { id: "cmd", name: "CMD Terminal", icon: Terminal, color: "text-emerald-500" },
            { id: "calc", name: "Calculator", icon: Monitor, color: "text-teal-400" }
          ].map(app => {
            const wind = windows.find(w => w.id === app.id);
            if (!wind) return null;
            const isOpen = wind.isOpen;
            const isFocused = activeWindow === app.id && isOpen;

            return (
              <button
                id={`taskbar-icon-${app.id}`}
                key={app.id}
                onClick={() => {
                  if (isOpen) {
                    if (isFocused) {
                      setWindows(prev => prev.map(w => w.id === app.id ? { ...w, isMinimized: true } : w));
                      setActiveWindow(null);
                    } else {
                      focusWindow(app.id);
                    }
                  } else {
                    openApp(app.id);
                  }
                }}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                  isFocused ? "bg-white/10" : "hover:bg-white/5 text-slate-400"
                }`}
                title={app.name}
              >
                {app.acronym ? (
                  <span className={`font-mono font-bold text-sm ${app.color}`}>{app.acronym}</span>
                ) : app.icon ? (
                  <app.icon className={`w-5 h-5 ${app.color}`} />
                ) : null}

                {/* Bottom indicators */}
                {isOpen && (
                  <span className={`absolute bottom-1 h-1 rounded-full transition-all ${
                    isFocused ? "w-4 bg-cyan-400" : "w-1.5 bg-slate-500"
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* System Tray info parameters */}
        <div className="flex items-center gap-4 shrink-0 font-mono text-[11px] text-slate-500">
          <div className="hidden sm:flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <Volume2 className="w-3.5 h-3.5 text-slate-400 hover:text-white transition-colors" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          <div
            id="taskbar-time-tray"
            onClick={() => triggerNotification(`Current simulated system time: ${time.toLocaleTimeString()}`)}
            className="flex flex-col items-end cursor-pointer hover:text-slate-300 transition-colors"
          >
            <span className="font-bold text-slate-300">{time.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: undefined })}</span>
            <span className="text-[9px] text-slate-500">{time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
