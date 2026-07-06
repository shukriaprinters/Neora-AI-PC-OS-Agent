import React, { useState } from 'react';
import { TRANSLATIONS } from '../translations';
import {
  Milestone, Calendar, CheckSquare, Clock, ShieldAlert, Zap, Cpu, Code,
  TrendingUp, Play, Sparkles, Database, Layers, Layout, RefreshCw, Languages,
  HelpCircle, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Pocket, Terminal,
  Monitor, MousePointer, Folder, Chrome, FileText, Camera, Cloud, Network
} from 'lucide-react';

interface RoadmapViewProps {
  lang: 'en' | 'bn';
}

interface Step {
  id: string;
  titleEn: string;
  titleBn: string;
  status: 'completed' | 'in_progress' | 'pending';
  descEn: string;
  descBn: string;
  complexity: 'low' | 'medium' | 'high' | 'ultra';
  techEn: string;
  techBn: string;
}

interface Phase {
  id: string;
  titleEn: string;
  titleBn: string;
  progress: number;
  timelineEn: string;
  timelineBn: string;
  icon: React.ReactNode;
  tags: string[];
  steps: Step[];
}

export function RoadmapView({ lang }: RoadmapViewProps) {
  const isEn = lang === 'en';
  
  // Roadmap Phases State
  const [activePhase, setActivePhase] = useState<string>('phase1');
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [repairedSteps, setRepairedSteps] = useState<Record<string, boolean>>({});

  // Simulation parameters for manual toggles
  const [dbStatus, setDbStatus] = useState<'fallback' | 'connected'>('fallback');
  const [agentAuthLevel, setAgentAuthLevel] = useState<number>(3);

  // Intent Compiler State
  const [compilerModel, setCompilerModel] = useState<'gemini' | 'groq' | 'ollama'>('gemini');
  const [inputCommand, setInputCommand] = useState<string>('একটি নতুন ফোল্ডার খোলো এবং ইনভয়েস ফাইল কপি করো');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilationProgress, setCompilationProgress] = useState<string>('');
  const [compiledResult, setCompiledResult] = useState<{
    intent: string;
    pythonCode: string;
    shellCode: string;
    safetyAudit: string;
  } | null>({
    intent: "FILE_SYSTEM_ORGANIZATION",
    pythonCode: `# Compiled under GEMINI NLP Model\nimport os\nimport shutil\nimport pyautogui\nimport time\n\n# Ensure safe path matching\ntarget_dir = os.path.expanduser("~/Desktop/Invoices_Backup")\nif not os.path.exists(target_dir):\n    os.makedirs(target_dir)\n    print("Created directory: Invoices_Backup")\n\nsource_file = "artifacts/api-server/data/invoice_template.html"\ndest_file = os.path.join(target_dir, "copied_invoice.html")\nshutil.copy(source_file, dest_file)\nprint("Successfully copied invoice!")`,
    shellCode: `mkdir -p ~/Desktop/Invoices_Backup\ncp artifacts/api-server/data/invoice_template.html ~/Desktop/Invoices_Backup/copied_invoice.html`,
    safetyAudit: "PASSED (COMPLIANT WITH SECURITY POLICIES)"
  });

  // Local Agent Runner Sandbox Simulator State
  const [isSimulatingRun, setIsSimulatingRun] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simScreen, setSimScreen] = useState<'desktop' | 'browser' | 'terminal' | 'file_copy' | 'screenshot_toast'>('desktop');
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 180, y: 140 });
  const [typedText, setTypedText] = useState<string>('');
  const [fileProgress, setFileProgress] = useState<number>(0);
  const [alertBoxText, setAlertBoxText] = useState<string | null>(null);
  const [showCameraFlash, setShowCameraFlash] = useState<boolean>(false);

  const presets = [
    {
      labelBn: "ফোল্ডার ও ফাইল কপি",
      labelEn: "Folder & File Copy",
      text: "একটি নতুন ফোল্ডার খোলো এবং ইনভয়েস ফাইল কপি করো"
    },
    {
      labelBn: "ক্রোম ও ইনবক্স",
      labelEn: "Chrome & Inbox",
      text: "Open chrome browser to shukriaprinters@gmail.com inbox"
    },
    {
      labelBn: "টার্মিনাল ও গিট পুশ",
      labelEn: "Terminal & Git Push",
      text: "টার্মিনাল চালু করো এবং গিট পুশ দাও"
    },
    {
      labelBn: "স্ক্রিনশট ও সেভ",
      labelEn: "Screenshot & Save",
      text: "Take a screenshot of current screen and save to invoice_history/"
    }
  ];

  const handleCompileCommand = () => {
    setIsCompiling(true);
    setCompiledResult(null);
    setCompilationProgress(isEn ? "Initializing NLP tokenizer..." : "এনএলপি টোকেনাইজার শুরু হচ্ছে...");
    addLog(`COMPILER: Starting command intent parse under ${compilerModel.toUpperCase()} engine`);

    setTimeout(() => {
      setCompilationProgress(isEn ? "Modeling semantic tokens & mapping Bengali/English intent paths..." : "সিম্যান্টিক টোকেন মডেলিং ও বাংলা/ইংরেজি ইন্টেন্ট পাথ ম্যাপ করা হচ্ছে...");
    }, 800);

    setTimeout(() => {
      setCompilationProgress(isEn ? "Verifying safety boundaries against artifacts/automation-policy.json..." : "সেফটি বাউন্ডারি ভ্যালিডেট করা হচ্ছে...");
    }, 1600);

    setTimeout(() => {
      setCompilationProgress(isEn ? "Compiling PyAutoGUI keyboard matrix & batch commands..." : "PyAutoGUI কীবোর্ড ও ব্যাচ কমান্ড কম্পাইল করা হচ্ছে...");
    }, 2400);

    setTimeout(() => {
      let intent = "OS_AUTOMATION_SEQUENCE";
      let pythonCode = "";
      let shellCode = "";

      const lower = inputCommand.toLowerCase();
      if (lower.includes('ফোল্ডার') || lower.includes('folder') || lower.includes('কপি') || lower.includes('copy')) {
        intent = "FILE_SYSTEM_ORGANIZATION";
        pythonCode = `# Compiled under ${compilerModel.toUpperCase()} NLP Model
import os
import shutil
import pyautogui
import time

# Ensure safe path matching
target_dir = os.path.expanduser("~/Desktop/Invoices_Backup")
if not os.path.exists(target_dir):
    os.makedirs(target_dir)
    print("Created directory: Invoices_Backup")

# Simulate file copy
source_file = "artifacts/api-server/data/invoice_template.html"
dest_file = os.path.join(target_dir, "copied_invoice.html")
shutil.copy(source_file, dest_file)
print(f"Successfully copied invoice to {dest_file}")

# Flash indicator on screen
pyautogui.alert(text="Invoice copied safely, Boss!", title="Neora OS Success")`;
        shellCode = `mkdir -p ~/Desktop/Invoices_Backup\ncp artifacts/api-server/data/invoice_template.html ~/Desktop/Invoices_Backup/copied_invoice.html`;
      } else if (lower.includes('chrome') || lower.includes('browser') || lower.includes('inbox')) {
        intent = "BROWSER_NAVIGATION";
        pythonCode = `# Compiled under ${compilerModel.toUpperCase()} NLP Model
import webbrowser
import pyautogui
import time

# Open targeted inbox URL
url = "https://mail.google.com/mail/u/0/#inbox"
print(f"Launching default web browser to: {url}")
webbrowser.open(url)

# Wait for page render
time.sleep(3)

# Double click top search box using PyAutoGUI
pyautogui.moveTo(x=450, y=120, duration=1.0)
pyautogui.click()
pyautogui.write("shukriaprinters@gmail.com", interval=0.1)
pyautogui.press("enter")`;
        shellCode = `google-chrome --new-window "https://mail.google.com/mail/u/0/#inbox"`;
      } else if (lower.includes('টার্মিনাল') || lower.includes('terminal') || lower.includes('git') || lower.includes('গিট')) {
        intent = "SHELL_DEVELOPMENT_FLOW";
        pythonCode = `# Compiled under ${compilerModel.toUpperCase()} NLP Model
import pyautogui
import time
import subprocess

# Open bash terminal safely
print("Spawning subprocess terminal console...")
subprocess.Popen(["x-terminal-emulator"]) # or start cmd on Windows
time.sleep(1.5)

# Execute git routines via keystrokes safely
pyautogui.write("git add .", interval=0.05)
pyautogui.press("enter")
time.sleep(0.5)
pyautogui.write('git commit -m "Auto-evolution update via Neora AI"', interval=0.05)
pyautogui.press("enter")
time.sleep(0.5)
pyautogui.write("git push origin main", interval=0.05)
pyautogui.press("enter")`;
        shellCode = `git add .\ngit commit -m "Auto-evolution update via Neora AI"\ngit push origin main`;
      } else {
        intent = "GENERAL_OS_SEQUENCE";
        pythonCode = `# Compiled under ${compilerModel.toUpperCase()} NLP Model
import pyautogui
import time

# General keypress sequence for "${inputCommand}"
print("Executing custom simulation command...")
pyautogui.hotkey("ctrl", "alt", "t") # Trigger console
time.sleep(1.0)
pyautogui.write("echo 'Neora AI automation active'", interval=0.08)
pyautogui.press("enter")`;
        shellCode = `echo "Neora: ${inputCommand}"`;
      }

      setCompiledResult({
        intent,
        pythonCode,
        shellCode,
        safetyAudit: "PASSED (COMPLIANT WITH SECURITY POLICIES)"
      });
      setIsCompiling(false);
      addLog(`SUCCESS: Multi-Provider Gateway (${compilerModel.toUpperCase()}) successfully compiled intent "${intent}".`);
    }, 3200);
  };

  const handleRunSimulation = () => {
    if (!compiledResult) return;
    setIsSimulatingRun(true);
    setSimStep(0);
    setSimScreen('desktop');
    setCursorPos({ x: 180, y: 140 });
    setTypedText('');
    setFileProgress(0);
    setAlertBoxText(null);
    setShowCameraFlash(false);

    const intent = compiledResult.intent;
    addLog(`DAEMON: Deploying compiled python script "generated_pyautogui_agent.py" to background service.`);
    addLog(`DAEMON: Initializing Local Agent daemon (PID: ${Math.floor(1000 + Math.random() * 9000)})`);
    addLog(`DAEMON: Safety audit validation check: COMPLIANT WITH SECURITY POLICIES`);
  };

  React.useEffect(() => {
    if (!isSimulatingRun || !compiledResult) return;

    let timer: any;
    const intent = compiledResult.intent;

    if (intent === "FILE_SYSTEM_ORGANIZATION") {
      if (simStep === 0) {
        timer = setTimeout(() => {
          setSimStep(1);
          setCursorPos({ x: 45, y: 80 });
          addLog(`PYAUTOGUI: Moving cursor smoothly to target (x=45, y=80)`);
          addLog(`PYAUTOGUI: Registering double-click event on directory`);
        }, 1200);
      } else if (simStep === 1) {
        timer = setTimeout(() => {
          setSimStep(2);
          setSimScreen('file_copy');
          addLog(`DAEMON: Target folder matching verified. Initiating file copy...`);
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 10;
            setFileProgress(progress);
            if (progress >= 100) {
              clearInterval(progressInterval);
            }
          }, 100);
        }, 1500);
      } else if (simStep === 2) {
        timer = setTimeout(() => {
          setSimStep(3);
          setAlertBoxText("Invoice copied safely, Boss!");
          addLog(`PYAUTOGUI: Triggering pyautogui.alert message box...`);
        }, 2000);
      } else if (simStep === 3) {
        timer = setTimeout(() => {
          setSimStep(4);
          setAlertBoxText(null);
          setSimScreen('desktop');
          setIsSimulatingRun(false);
          addLog(`SUCCESS: Local script executed safely. Created directory ~/Desktop/Invoices_Backup and copied 1 invoice!`);
          
          setPhases(prev => {
            return prev.map(p => {
              if (p.id === 'phase4') {
                const uSteps = p.steps.map(s => ({ ...s, status: 'completed' as const }));
                return { ...p, steps: uSteps, progress: 100, timelineEn: "Week 4-5 - Completed", timelineBn: "সপ্তাহ ৪-৫ - সম্পন্ন" };
              }
              return p;
            });
          });
        }, 2200);
      }
    } else if (intent === "BROWSER_NAVIGATION") {
      if (simStep === 0) {
        timer = setTimeout(() => {
          setSimStep(1);
          setCursorPos({ x: 45, y: 160 });
          addLog(`PYAUTOGUI: Hovering cursor over Google Chrome shortcut (x=45, y=160)`);
          addLog(`PYAUTOGUI: Executing mouse click`);
        }, 1200);
      } else if (simStep === 1) {
        timer = setTimeout(() => {
          setSimStep(2);
          setSimScreen('browser');
          addLog(`DAEMON: Web browser spawned. Navigating URL: https://mail.google.com/mail/u/0/#inbox`);
        }, 1500);
      } else if (simStep === 2) {
        timer = setTimeout(() => {
          setSimStep(3);
          setCursorPos({ x: 220, y: 65 });
          addLog(`PYAUTOGUI: Clicking inside search input box`);
        }, 1500);
      } else if (simStep === 3) {
        timer = setTimeout(() => {
          setSimStep(4);
          const fullText = "shukriaprinters@gmail.com";
          let index = 0;
          const typingInterval = setInterval(() => {
            index++;
            setTypedText(fullText.slice(0, index));
            if (index >= fullText.length) {
              clearInterval(typingInterval);
            }
          }, 80);
          addLog(`PYAUTOGUI: Simulating character typing: "shukriaprinters@gmail.com"`);
        }, 1200);
      } else if (simStep === 4) {
        timer = setTimeout(() => {
          setSimStep(5);
          addLog(`PYAUTOGUI: Keypress event: ENTER`);
          addLog(`DAEMON: Filtering messages matching "shukriaprinters@gmail.com"...`);
        }, 3200);
      } else if (simStep === 5) {
        timer = setTimeout(() => {
          setSimStep(6);
          setIsSimulatingRun(false);
          setSimScreen('desktop');
          addLog(`SUCCESS: Browser session successfully executed and verified!`);
          
          setPhases(prev => {
            return prev.map(p => {
              if (p.id === 'phase4') {
                const uSteps = p.steps.map(s => ({ ...s, status: 'completed' as const }));
                return { ...p, steps: uSteps, progress: 100, timelineEn: "Week 4-5 - Completed", timelineBn: "সপ্তাহ ৪-৫ - সম্পন্ন" };
              }
              return p;
            });
          });
        }, 2500);
      }
    } else if (intent === "SHELL_DEVELOPMENT_FLOW") {
      if (simStep === 0) {
        timer = setTimeout(() => {
          setSimStep(1);
          setCursorPos({ x: 45, y: 240 });
          addLog(`PYAUTOGUI: Moving cursor smoothly to terminal icon (x=45, y=240)`);
          addLog(`PYAUTOGUI: Double clicking terminal shortcut...`);
        }, 1200);
      } else if (simStep === 1) {
        timer = setTimeout(() => {
          setSimStep(2);
          setSimScreen('terminal');
          addLog(`DAEMON: Spawning child shell subprocess terminal...`);
        }, 1500);
      } else if (simStep === 2) {
        timer = setTimeout(() => {
          setSimStep(3);
          addLog(`PYAUTOGUI: Keystroke sequence: git add .`);
        }, 1500);
      } else if (simStep === 3) {
        timer = setTimeout(() => {
          setSimStep(4);
          addLog(`PYAUTOGUI: Keystroke sequence: git commit -m "Auto-evolution update via Neora AI"`);
        }, 2000);
      } else if (simStep === 4) {
        timer = setTimeout(() => {
          setSimStep(5);
          addLog(`PYAUTOGUI: Keystroke sequence: git push origin main`);
          addLog(`SHELL: Uploading pack objects: 100% (4/4), done.`);
          addLog(`SHELL: To github.com:shukriaprinters/neora-monorepo.git`);
        }, 2200);
      } else if (simStep === 5) {
        timer = setTimeout(() => {
          setSimStep(6);
          setIsSimulatingRun(false);
          setSimScreen('desktop');
          addLog(`SUCCESS: Git push operations compiled and executed securely via sub-shell!`);
          
          setPhases(prev => {
            return prev.map(p => {
              if (p.id === 'phase4') {
                const uSteps = p.steps.map(s => ({ ...s, status: 'completed' as const }));
                return { ...p, steps: uSteps, progress: 100, timelineEn: "Week 4-5 - Completed", timelineBn: "সপ্তাহ ৪-৫ - সম্পন্ন" };
              }
              return p;
            });
          });
        }, 2500);
      }
    } else {
      if (simStep === 0) {
        timer = setTimeout(() => {
          setSimStep(1);
          addLog(`PYAUTOGUI: Activating screen flash sequence`);
          setShowCameraFlash(true);
          setTimeout(() => setShowCameraFlash(false), 250);
        }, 1200);
      } else if (simStep === 1) {
        timer = setTimeout(() => {
          setSimStep(2);
          setSimScreen('screenshot_toast');
          addLog(`DAEMON: Screenshot saved into invoice_history/screenshot_${Date.now()}.png`);
        }, 1500);
      } else if (simStep === 2) {
        timer = setTimeout(() => {
          setSimStep(3);
          setIsSimulatingRun(false);
          setSimScreen('desktop');
          addLog(`SUCCESS: General desktop workflow sequence executed safely!`);
          
          setPhases(prev => {
            return prev.map(p => {
              if (p.id === 'phase4') {
                const uSteps = p.steps.map(s => ({ ...s, status: 'completed' as const }));
                return { ...p, steps: uSteps, progress: 100, timelineEn: "Week 4-5 - Completed", timelineBn: "সপ্তাহ ৪-৫ - সম্পন্ন" };
              }
              return p;
            });
          });
        }, 2500);
      }
    }

    return () => clearTimeout(timer);
  }, [isSimulatingRun, simStep, compiledResult]);

  // 6 Phased System Architecture Roadmap
  const initialPhases: Phase[] = [
    {
      id: 'phase1',
      titleEn: "Phase 1: Core Scaffolding & Fallback Storage Engine",
      titleBn: "পর্যায় ১: মূল ফ্রেমওয়ার্ক এবং ফালব্যাক স্টোরেজ ইঞ্জিন",
      progress: 100,
      timelineEn: "Week 1 - Completed",
      timelineBn: "সপ্তাহ ১ - সম্পন্ন",
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      tags: ["Monorepo", "React 19", "Express 5", "Vite PWA"],
      steps: [
        {
          id: 'p1s1',
          titleEn: "Scaffold pnpm monorepo structure",
          titleBn: "pnpm মনোরেপো স্ট্রাকচার সেটআপ",
          status: 'completed',
          descEn: "Establish directory structure with shared workspaces for frontend, backend API server, and shared common libraries.",
          descBn: "ফ্রন্টএন্ড, ব্যাকএন্ড এপিআই সার্ভার এবং গ্লোবাল লাইব্রেরির জন্য ডিরেক্টরি এবং ওয়ার্কস্পেস কনফিগারেশন তৈরি করা।",
          complexity: 'medium',
          techEn: "pnpm workspaces, TypeScript chains",
          techBn: "pnpm ওয়ার্কস্পেস, টাইপস্ক্রিপ্ট কনফিগ"
        },
        {
          id: 'p1s2',
          titleEn: "Create local fallback database driver engine",
          titleBn: "লোকাল ফালব্যাক ডাটাবেজ ড্রাইভার ইঞ্জিন তৈরি",
          status: 'completed',
          descEn: "Implement browser localStorage file structure mimicking database tables for local offline execution.",
          descBn: "ডাটাবেজ সংযোগহীন অবস্থায় অফলাইনে সিস্টেম চালানোর জন্য ব্রাউজার লোকালস্টোরেজে ডাটাবেজ টেবিল সিমুলেশন ইঞ্জিন তৈরি করা।",
          complexity: 'medium',
          techEn: "JSON storage wrappers, offline state syncing",
          techBn: "জেসন স্টোরেজ র্যাপারস, অফলাইন স্টেট সিঙ্কিং"
        },
        {
          id: 'p1s3',
          titleEn: "Configure PWA web manifest & icons",
          titleBn: "পিডব্লিউএ ওয়েব মেনিফেস্ট ও আইকন কনফিগারেশন",
          status: 'completed',
          descEn: "Set up icons, themes, and offline boot configurations inside index.html and manifest.json.",
          descBn: "ইন্ডেক্স ডট এইচটিএমএল এবং মেনিফেস্টে আইকন, থিম কালার এবং ব্যাকগ্রাউন্ড বুট কনফিগারেশন সংযোজন করা।",
          complexity: 'medium',
          techEn: "Vite PWA plugin, webapp manifests",
          techBn: "ভীট পিডব্লিউএ প্লাগইন, ওয়েবঅ্যাপ মেনিফেস্ট"
        }
      ]
    },
    {
      id: 'phase2',
      titleEn: "Phase 2: Relational DB Schema & Drizzle ORM Setup",
      titleBn: "পর্যায় ২: রিলেশনাল ডাটাবেজ স্কিমা ও ড্রিল ওআরএম সেটআপ",
      progress: 100,
      timelineEn: "Week 2 - Completed",
      timelineBn: "সপ্তাহ ২ - সম্পন্ন",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      tags: ["PostgreSQL", "Drizzle", "16 Tables", "Migrations"],
      steps: [
        {
          id: 'p2s1',
          titleEn: "Define 16 core relation tables inside lib/db/schema.ts",
          titleBn: "lib/db/schema.ts এ ১৬টি রিলেশন টেবিল তৈরি",
          status: 'completed',
          descEn: "Design strict PostgreSQL columns for conversations, messages, memories, Tasks, reminders, workflows, updates, actions, and earnings projects.",
          descBn: "চ্যাট সেশন, মেসেজ, মেমোরি, রিমাইন্ডার, ওয়ার্কফ্লো, প্রজেক্ট ইত্যাদির জন্য ডিটেইলড পোস্টগ্রে স্কিমা আর্কিটেক্ট করা।",
          complexity: 'high',
          techEn: "Drizzle ORM columns, foreign key constraints",
          techBn: "ড্রিল ওআরএম কলাম, ফরেন কি রিলেশন"
        },
        {
          id: 'p2s2',
          titleEn: "Write database setup check runtime scripts",
          titleBn: "ডাটাবেজ কানেকশন চেকার স্ক্রিপ্ট রাইটিং",
          status: 'completed',
          descEn: "Build automatic database connectivity detection that gracefully toggles the system to 'Limited Mode' upon SQL failure.",
          descBn: "ডাটাবেজ ফেইল হলে ফ্রন্টএন্ডকে সিগন্যাল দিতে এবং লিমিটেড মোড অ্যাক্টিভ করতে কানেকশন অডিটর তৈরি করা।",
          complexity: 'medium',
          techEn: "Drizzle client initialization block, checkHealth helpers",
          techBn: "ড্রিল ইনিশিয়ালাইজার, হেলথ চেক হেল্পার"
        },
        {
          id: 'p2s3',
          titleEn: "Validate transactional safety rollback",
          titleBn: "ট্রানজেকশনাল সেফটি রোলব্যাক ভ্যালিডেশন",
          status: 'completed',
          descEn: "Ensure active DB writes rollback cleanly if a database step fails during heavy background batch jobs.",
          descBn: "ব্যাকগ্রাউন্ডে একসাথে অনেকগুলো কাজ চলার সময় কোনো একটি ব্যর্থ হলে সম্পূর্ণ অপারেশন রোলব্যাক করা।",
          complexity: 'high',
          techEn: "PostgreSQL Transactions, ACID guarantees",
          techBn: "পোস্টগ্রে ট্রানজেকশন, এসিড গ্যারান্টি"
        }
      ]
    },
    {
      id: 'phase3',
      titleEn: "Phase 3: Backend API Service & Multi-Provider Model Registry (Gemini, Groq & Ollama)",
      titleBn: "পর্যায় ৩: ব্যাকএন্ড এপিআই সার্ভিস এবং মাল্টি-মডেল রেজিস্ট্রি (জেমিনি, গ্রক ও ওল্লামা)",
      progress: 100,
      timelineEn: "Week 3 - Completed",
      timelineBn: "সপ্তাহ ৩ - সম্পন্ন",
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      tags: ["Express 5", "Groq AI", "Ollama", "SSE streaming"],
      steps: [
        {
          id: 'p3s1',
          titleEn: "Develop 23 robust REST endpoints inside artifacts/api-server/",
          titleBn: "২৩টি এপিআই রাউট ডেভেলপমেন্ট",
          status: 'completed',
          descEn: "Expose memories CRUD, task updates, prompt template workflows execution, morning-briefings, and billing tools.",
          descBn: "মেমোরি ক্রাড, টাস্ক, প্রম্পট ওয়ার্কফ্লো রানার, এবং বিলিং ইনভয়েস জেনারেটরের জন্য ২৩টি রাউট স্ক্রিপ্টিং।",
          complexity: 'high',
          techEn: "Express 5 router modules, unified error handlers",
          techBn: "এক্সপ্রেস ৫ রাউটার মডিউল, কাস্টম এরর হ্যান্ডলার"
        },
        {
          id: 'p3s2',
          titleEn: "Architect Multi-Provider Routing Registry Layer (Gemini Pro, Groq & Ollama)",
          titleBn: "মাল্টি-প্রোভাইডার রুট রেজিস্ট্রি আর্কিটেকচার (জেমিনি প্রো, গ্রক ও ওল্লামা)",
          status: 'completed',
          descEn: "Gemini Pro, Groq & Ollama LLM & NLP Models: Deciphers and compiles the true semantic meaning and intent of your Bengali or English voice commands into precise Python scripts or OS commands.",
          descBn: "Gemini Pro, Groq ও Ollama LLM এবং NLP মডেল: আপনার বাংলা বা ইংরেজি ভয়েস কমান্ডটির আসল অর্থ ও উদ্দেশ্য (Intent) বুঝে সেটিকে সঠিক পাইথন স্ক্রিপ্ট বা ওএস কমান্ডে রূপান্তর করার জন্য।",
          complexity: 'high',
          techEn: "lib/neora.ts registry, priority routing weights",
          techBn: "lib/neora.ts রেজিস্ট্রি, মডেল প্রাইওরিটি চেইন"
        },
        {
          id: 'p3s3',
          titleEn: "Expose SSE Stream Endpoint on /api/chat",
          titleBn: "চ্যাটের জন্য এসএসই পোর্টাল কনফিগারেশন",
          status: 'completed',
          descEn: "Establish real-time chunk streaming (text/event-stream) alongside multi-part file uploads logic.",
          descBn: "দ্রুত রেসপন্স পেতে টেক্সট ইভেন্ট স্টিম (SSE) এর সাথে চ্যাটে ফাইল আপলোড প্রক্সি সেটআপ করা।",
          complexity: 'medium',
          techEn: "Server-Sent Events (SSE), formidable uploads",
          techBn: "সার্ভার ইভেন্ট স্ট্রিমস, ফরমিডেবল ফাইল প্রসেসর"
        }
      ]
    },
    {
      id: 'phase4',
      titleEn: "Phase 4: Python PC Control Agent & OS Action Protocol",
      titleBn: "পর্যায় ৪: পাইথন ডেস্কটপ কন্ট্রোল এজেন্ট ও ওএস অ্যাকশন প্রোটোকল",
      progress: 100,
      timelineEn: "Week 4-5 - Completed",
      timelineBn: "সপ্তাহ ৪-৫ - সম্পন্ন",
      icon: <Code className="w-5 h-5 text-yellow-500" />,
      tags: ["Python Agent", "Action Schema", "Keyboard/Mouse", "Screenshots"],
      steps: [
        {
          id: 'p4s1',
          titleEn: "Code neora_agent.py registration and polling systems",
          titleBn: "neora_agent.py কানেকশন ও পোলিং ইঞ্জিন তৈরি",
          status: 'completed',
          descEn: "Create background python agent daemon that connects to/polls Express REST endpoints, dispatching jobs safely.",
          descBn: "ব্যাকগ্রাউন্ড পাইথন রানার স্ক্রিপ্ট যা লোকাল এপিআই থেকে কাজ সংগ্রহ এবং ওএস কমপ্লায়েন্স নিশ্চিত করে।",
          complexity: 'high',
          techEn: "requests / asyncio loop, backoff retry limits",
          techBn: "রিকোয়েস্টস ও সিঙ্কআইও লুপ, ব্যাকঅফ রিট্রাই লিমিট"
        },
        {
          id: 'p4s2',
          titleEn: "Implement 27 low-level desktop control actions",
          titleBn: "২৭টি ওএস মূল ও নিরাপদ অ্যাকশন তৈরি",
          status: 'completed',
          descEn: "Write handlers for launching/closing apps, executing shell scripts, browsing urls, managing background system processes, and modifying clipboard states.",
          descBn: "অ্যাপ ওপেন/ক্লোজ, টার্মিনাল রান, ব্রাউজার ওপেন, ক্লিপবোর্ড ডেটা এক্সেস এবং ক্লিক কন্ডিশন তৈরি।",
          complexity: 'ultra',
          techEn: "pyautogui, subprocess, psutil python packages",
          techBn: "pyautogui, subprocess, psutil লাইব্রেরি"
        },
        {
          id: 'p4s3',
          titleEn: "Integrate safety policy whitelist check inside agent",
          titleBn: "এজেন্টের ভেতর নিরাপত্তা রুল বাউন্ডারি সংযোজন",
          status: 'completed',
          descEn: "Enforce restriction whitelists: block execution of non-safe commands, enforce authorized write target directories, and resolve directory traversals.",
          descBn: "অননুমোদিত কমান্ড ব্লক করা, সিস্টেমের রুট ফোল্ডার লক রাখা এবং ট্রাভার্সাল হ্যাক আটকে রাখা।",
          complexity: 'high',
          techEn: "artifacts/automation-policy.json parser, os.path.realpath checks",
          techBn: "সেফটি পলিসি ডিকশনারি, রিয়েলপ্যাথ চেকার"
        }
      ]
    },
    {
      id: 'phase5',
      titleEn: "Phase 5: Multi-Step Run Plan & Auto-Repair Executor Logo",
      titleBn: "পর্যায় ৫: মাল্টি-স্টেপ রান প্ল্যাটফর্ম ও অটো-রিপেয়ার ইন্টেলিজেন্স",
      progress: 100,
      timelineEn: "Week 6 - Completed",
      timelineBn: "সপ্তাহ ৬ - সম্পন্ন",
      icon: <RefreshCw className="w-5 h-5 text-orange-500" />,
      tags: ["Run Plan Engine", "Self-Diagnostics", "SSE status emitter"],
      steps: [
        {
          id: 'p5s1',
          titleEn: "Construct Run Plan sequential step dispatcher",
          titleBn: "স্টেপ-বাই-স্টেপ ডিসপ্যাচার আর্কিটেকচার",
          status: 'completed',
          descEn: "Develop seq executors in lib/executor.ts delivering plan instructions to direct terminal shell interfaces.",
          descBn: "lib/executor.ts এ সিকুয়েনশিয়াল রানার তৈরি করা যা প্রতিটি কমপ্লায়েন্ট প্ল্যান একের পর এক এক্সিকিউট করে।",
          complexity: 'high',
          techEn: "RxJS / event emitters, sub-process trackers",
          techBn: "আরএক্সজেএস / ইভেন্ট এমিটারস, সাবপ্রসেস ট্র্যাকারস"
        },
        {
          id: 'p5s2',
          titleEn: "Integrate AI-powered diagnostics and auto-repair retry logic",
          titleBn: "এআই ডায়াগনস্টিকস ও অটো-রিপেয়ার রিট্রাই সুবিধা",
          status: 'completed',
          descEn: "When a shell step errors, forward raw stderr logs to Llama-Cortex model to re-build corrected command parameters, auto-retrying up to 2 times.",
          descBn: "টার্মিনাল ফেল করলে এরর আউটপুট কাইনেটিক এআই ফরোয়ার্ড করে কারেক্টেড প্রম্পট তৈরি করা (সর্বোচ্চ ২ বার)।",
          complexity: 'ultra',
          techEn: "Diagnostic log prompt template wrappers",
          techBn: "ডায়াগনস্টিক লগ মডেল রিস্ট্রাকচারার"
        },
        {
          id: 'p5s3',
          titleEn: "Develop step-pause and kill routines UI hooks",
          titleBn: "স্টেপ পজ এবং কিল প্রসেস হুকস ডেভেলপমেন্ট",
          status: 'completed',
          descEn: "Add backend listeners allowing users to freeze execution at any runplan progression bar.",
          descBn: "চলমান স্ক্রিপ্ট মাঝপথে থামানোর জন্য ইউজার ইন্টারফেসে ইন্টারেক্টিভ কিল ও ফ্রিজ সিগন্যাল তৈরি।",
          complexity: 'medium',
          techEn: "Process PID tracker trees, SIGTERM triggers",
          techBn: "প্রসেস পিআইডি ম্যাপার, সিগটার্ম হুকস"
        }
      ]
    },
    {
      id: 'phase6',
      titleEn: "Phase 6: Voice Systems & Stable Launch Deployments",
      titleBn: "পর্যায় ৬: ভয়েস রিকগনিশন ও প্রোডাকশন লঞ্চ ডিপ্লয়মেন্ট",
      progress: 100,
      timelineEn: "Week 7 - Completed",
      timelineBn: "সপ্তাহ ৭ - সম্পন্ন",
      icon: <Languages className="w-5 h-5 text-pink-500" />,
      tags: ["Wake Word", "TTS/STT Speech", "Docker", "setup.bat scripts"],
      steps: [
        {
          id: 'p6s1',
          titleEn: "Code always-on wake word listener",
          titleBn: "স্মার্ট ভয়েস ওয়োক-ওয়ার্ড অ্যাক্টিভেশন লুপ",
          status: 'completed',
          descEn: "Integrate Web Audio API combined with Porcupine/Whisper client buffers trigger listening whenever 'Neora' is vocally voiced.",
          descBn: "মাইক্রোফোন ক্যাপচার করে 'নিওরা' বা 'Neora' শব্দ শুনলেই মূল ট্র্যান্সক্রিপশন পোর্টিং এ ব্যাকগ্রাউন্ড সাউন্ড সক্রিয় করা।",
          complexity: 'high',
          techEn: "Web Audio API processing, offline model trigger rings",
          techBn: "ওয়েব অডিও এপিআই, লোকাল সাউন্ড বাফারস"
        },
        {
          id: 'p6s2',
          titleEn: "Develop idempotent launch scripts setup.bat / run.bat",
          titleBn: "রানের জন্য শক্তিশালী setup.bat ও run.bat স্ক্রিপ্ট রাইটিং",
          status: 'completed',
          descEn: "Write launchers checking port conflicts, terminating stale processes, installing missing npm/python assets automatically with rollback protections.",
          descBn: "পোর্ট কনф্লিক্ট আটকানো, প্রসেস অফ করা এবং ঝামেলাহীন অটো প্যাকেজ ইন্সটলেশন বুটলোড স্ক্রিপ্ট তৈরি।",
          complexity: 'medium',
          techEn: "Windows Batch script, shell scripts, PID ports cleaners",
          techBn: "উইন্ডোজ ব্যাচ স্ক্রিপ্টিং, পিআইডি পোর্টস ক্লিনার"
        },
        {
          id: 'p6s3',
          titleEn: "Deploy PWA Offline assets service worker cache",
          titleBn: "পিডব্লিউএ অফলাইন সার্ভিস ওয়ার্কার ক্যাশ ডেভ",
          status: 'completed',
          descEn: "Configure complete offline access for checklist, notes, and local memories stored in PWA sandboxes.",
          descBn: "পণ্য অফলাইনে সচল রাখতে ক্যাশ এপিআই দিয়ে ফাইল স্টোরেজ সার্ভিস ওয়ার্কার ম্যাপিং নিশ্চিতকরণ।",
          complexity: 'medium',
          techEn: "ServiceWorkers, Cache Storage API, manifest configs",
          techBn: "সার্ভিস ওয়ার্কার্স, ক্যাশ স্টোরেজ, মেনিফেস্ট রাইটার"
        }
      ]
    },
    {
      id: 'phase7',
      titleEn: "Phase 7: Cloud Run Integration & Remote Control Dashboard",
      titleBn: "পর্যায় ৭: ক্লাউড রান ইন্টিগ্রেশন ও রিমোট কন্ট্রোল ড্যাশবোর্ড",
      progress: 33,
      timelineEn: "Week 8-9 - In Progress",
      timelineBn: "সপ্তাহ ৮-৯ - চলমান",
      icon: <Cloud className="w-5 h-5 text-sky-400" />,
      tags: ["Cloud Run", "WebSocket Bridge", "OAuth", "API Gateway"],
      steps: [
        {
          id: 'p7s1',
          titleEn: "Establish secure OAuth WebSocket orchestration bridge",
          titleBn: "সিকিউর ওঅথ ওয়েব সকেট ব্রিজ অরকেস্ট্রেশন",
          status: 'completed',
          descEn: "Implement remote socket tunnels bridging physical desktop pyagents with serverless Cloud Run endpoints.",
          descBn: "লোকাল পিসির পাইথন রানার এবং ক্লাউড রান কন্টেইনারের মধ্যে নিরাপদ বাই-ডাইরেকショナル কানেক্টিভিটি চ্যানেল তৈরি করা।",
          complexity: 'high',
          techEn: "Socket.io, Express WebSockets, Firebase Auth triggers",
          techBn: "সকেট আইও, এক্সপ্রেস ওয়েব সকেটস, ফায়ারবেজ ওঅথ ট্রিপস"
        },
        {
          id: 'p7s2',
          titleEn: "Build remote control mobile client handshake protocol",
          titleBn: "রিমোট কন্ট্রোল মোবাইল ক্লায়েন্ট হ্যান্ডশেক প্রোটোকল",
          status: 'in_progress',
          descEn: "Develop strict JWT/SHA-256 client pairing keys so external devices can trigger commands on physical PC agents safely.",
          descBn: "মোবাইল ড্যাশবোর্ড থেকে নিরাপদে লোকাল পিসিতে ওএস কমান্ড প্রেরণের জন্য নিরাপদ টোকেন হ্যান্ডশেক মেকানিজম আর্কিটেক্ট করা।",
          complexity: 'high',
          techEn: "JWT pairing handshake, cryptographic keys signing",
          techBn: "জেডব্লিউটি হ্যান্ডশেক, ক্রিপ্টোগ্রাফিক কি সিগনেচার্স"
        },
        {
          id: 'p7s3',
          titleEn: "Configure Cloud Run Dockerfile optimization matrices",
          titleBn: "ক্লাউড রান ডকারফাইল ও প্যাকেজ অপ্টিমাইজেশন",
          status: 'pending',
          descEn: "Write highly cached Docker multistage layers to compress deployment sizes under 250MB for serverless cold start ease.",
          descBn: "সার্ভারলেস কুল-স্টার্ট কমাতে ও ডকার ইমেজ সাইজ ২৫০ মেগাবাইটের নিচে রাখতে মাল্টি-স্টেজ ক্যাশড বিল্ড ইমেজ তৈরি।",
          complexity: 'medium',
          techEn: "Multistage Docker builds, alpine bases, gcloud CLI",
          techBn: "মাল্টিস্টেজ ডকার বিল্ড, আলপাইন বেস, জিক্লাউড সিএলআই"
        }
      ]
    },
    {
      id: 'phase8',
      titleEn: "Phase 8: Multi-Agent Choreography & Developer Tool SDK",
      titleBn: "পর্যায় ৮: মাল্টি-এজেন্ট কোরিওগ্রাফি ও ডেভেলপার টুল এসডিকে",
      progress: 0,
      timelineEn: "Week 10-11 - Backlog",
      timelineBn: "সপ্তাহ ১০-১১ - ব্যাকলগ",
      icon: <Network className="w-5 h-5 text-indigo-400" />,
      tags: ["Agent Swarm", "Plugin SDK", "JSON-RPC", "Realtime Graphs"],
      steps: [
        {
          id: 'p8s1',
          titleEn: "Engineer multi-agent swarm negotiation protocol",
          titleBn: "মাল্টি-এজেন্ট স্বার্ম নেগোশিয়েশন প্রোটোকল",
          status: 'pending',
          descEn: "Enable dynamic sub-agent spawning where a main router distributes complex tasks to minor specialized worker agents.",
          descBn: "প্রধান এআই এজেন্ট দ্বারা স্বয়ংক্রিয়ভাবে স্পেশালাইজড সাব-এজেন্ট তৈরি করে বড় কাজগুলোকে বিভক্ত ও বন্টন করা।",
          complexity: 'ultra',
          techEn: "LangGraph workflows, state machines hierarchies",
          techBn: "ল্যাংগ্রাফ ওয়ার্কফ্লোস, স্টেট মেশিন হায়ারার্কি"
        },
        {
          id: 'p8s2',
          titleEn: "Publish local developer plugin SDK",
          titleBn: "লোকাল ডেভেলপার প্লাগইন এসডিকে প্রকাশ",
          status: 'pending',
          descEn: "Expose secure JSON-RPC interface over standard I/O allowing third-party desktop tools to register custom functions.",
          descBn: "তৃতীয় পক্ষের ওএস টুলস যেন নিওরার এআই প্লাগইন ডিক্লেয়ার ও কাস্টম স্ক্রিপ্ট রান করতে পারে তার জন্য স্ট্যান্ডার্ড এসডিকে।",
          complexity: 'high',
          techEn: "JSON-RPC 2.0 specs, npm packages, stdio pipelines",
          techBn: "জেসন আরপিসি ২.০ স্পেস, এনপিএম প্যাকেজস, এসটিডিআইও পাইপলাইনস"
        },
        {
          id: 'p8s3',
          titleEn: "Integrate live telemetry performance visual charts",
          titleBn: "লাইভ টেলিমেট্রি পারফরম্যান্স চার্ট আর্কিটেকচার",
          status: 'pending',
          descEn: "Develop graphical monitor tracking computer CPU, RAM, and command runtimes via SVG charts and dashboards.",
          descBn: "কম্পিউটারের সিপিইউ, র্যাম এবং কমান্ড এক্সিকিউশন টাইম রিয়েল-টাইমে গ্রাফে ট্র্যাকিং করার চমৎকার ড্যাশবোর্ড।",
          complexity: 'medium',
          techEn: "Recharts area graphs, system logs analytics",
          techBn: "রিচার্টস এরিয়া গ্রাফ, সিস্টেম লগ এনালিটিক্স"
        }
      ]
    },
    {
      id: 'phase9',
      titleEn: "Phase 9: Pro-Active OS Optimizer & Software Indexing Hub",
      titleBn: "পর্যায় ৯: প্রো-অ্যাক্টিভ ওএস অপ্টিমাইজার ও লোকাল সফটওয়্যার ইনডেক্সিং হাব",
      progress: 100,
      timelineEn: "Week 12 - Active Production",
      timelineBn: "সপ্তাহ ১২ - চলমান প্রডাকশন",
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      tags: ["Optimizer Engine", "Bloatware Watchdog", "Shortcut Indexer", "RAM Purge"],
      steps: [
        {
          id: 'p9s1',
          titleEn: "Background RAM Purging & Temp File Scrubbing Engine",
          titleBn: "ব্যাকগ্রাউন্ড র‍্যাম অপ্টিমাইজেশন ও টেম্প ফাইল স্ক্রাবিং ইঞ্জিন",
          status: 'completed',
          descEn: "Initialize background threads to flush memory leak stacks and purge C:\\Windows\\Temp junk files to maximize system velocity upon agent boot.",
          descBn: "উইন্ডোজের অস্থায়ী ফাইল ও মেমোরি ফ্লাশ করার ব্যাকগ্রাউন্ড থ্রেড রান করা যেন ওএস এজেন্টের গতি সর্বদাই সর্বোচ্চ স্তরে থাকে।",
          complexity: 'medium',
          techEn: "RAM compression hooks, Temp-scrub subroutines, GC optimization",
          techBn: "র‍্যাম কম্প্রেশন হুক্স, টেম্প-স্ক্রাব সাবরুটিন, গার্বেজ কালেকশন টিউনিং"
        },
        {
          id: 'p9s2',
          titleEn: "Windows Bloatware & Telemetry Process Watchdog Shield",
          titleBn: "উইন্ডোজ ব্লটওয়্যার ও টেলিমেট্রি প্রসেস ওয়াচডগ শিল্ড",
          status: 'completed',
          descEn: "Detect unwanted background updater loops, diagnostic telemetry streams, and auto-starts like Cortana or Teams, automatically stopping them.",
          descBn: "অপ্রয়োজনীয় উইন্ডোজ আপডেট সার্ভিস, ব্যাকগ্রাউন্ড ট্র্যাকিং ও টেলিমেট্রি সনাক্ত করে স্বয়ংক্রিয়ভাবে ফোর্স স্টপ করে দেওয়ার সিকিউর ওয়াচডগ থ্রেড।",
          complexity: 'high',
          techEn: "Windows process tracking, system daemon shield, resource guards",
          techBn: "উইন্ডোজ প্রসেস ট্র্যাকিং, সিস্টেম ডেমন শিল্ড, রিসোর্স গার্ডস"
        },
        {
          id: 'p9s3',
          titleEn: "PC Application Registry & Shortcut Path Indexer (.exe / .lnk)",
          titleBn: "পিসি অ্যাপ্লিকেশন রেজিস্ট্রি ও শর্টকাট পাথ ইনডেক্সার (.exe / .lnk)",
          status: 'completed',
          descEn: "Implement auto-scanning of local software directories to map physical executable paths and desktop shortcut pointers for instant workflow launches.",
          descBn: "পিসির সকল ইনস্টলড সফটওয়্যার এবং ডেক্সটপ বা স্টার্ট মেনুর শর্টকাটগুলো স্ক্যান ও পাথ ম্যাপিং করে অটোমেশন স্ক্রিপ্টের সাথে যুক্ত করার ইন্টেলিজেন্ট ইঞ্জিন।",
          complexity: 'high',
          techEn: "PyAutoGUI macro hooks, registry index tracking, dynamic path pairing",
          techBn: "পাই-অটোগুই ম্যাক্রো হুক্স, রেজিস্ট্রি ইনডেক্স ট্র্যাকিং, ডাইনামিক পাথ পেয়ারিং"
        }
      ]
    }
  ];

  const [phases, setPhases] = useState<Phase[]>(initialPhases);

  // Toggle step state manually inside this simulation sandbox!
  const toggleStepStatus = (phaseId: string, stepId: string) => {
    setPhases(prev => {
      return prev.map(p => {
        if (p.id !== phaseId) return p;
        const updatedSteps = p.steps.map(s => {
          if (s.id !== stepId) return s;
          const nextStatusMap: Record<string, 'completed' | 'in_progress' | 'pending'> = {
            'pending': 'in_progress',
            'in_progress': 'completed',
            'completed': 'pending'
          };
          const nextSt = nextStatusMap[s.status];
          return { ...s, status: nextSt };
        });
        
        // Calculate auto progress based on steps
        const total = updatedSteps.length;
        const comps = updatedSteps.filter(x => x.status === 'completed').length;
        const inProgs = updatedSteps.filter(x => x.status === 'in_progress').length;
        const calculatedProgress = total > 0 ? Math.round(((comps + (inProgs * 0.5)) / total) * 100) : 0;

        return { ...p, steps: updatedSteps, progress: calculatedProgress };
      });
    });

    const stepObj = phases.find(p => p.id === phaseId)?.steps.find(s => s.id === stepId);
    if (stepObj) {
      addLog(`Status of step "${stepObj.titleEn}" manual overridden.`);
    }
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 30)]);
  };

  // Run complex Auto-Repair Simulator (Visual/Conceptual game demo for users)
  const runAutoRepairMockup = (stepId: string, title: string) => {
    setSimulationActive(true);
    addLog(`TRIGGER: Automatic step failed inside runplan: "${title}"`);
    
    setTimeout(() => {
      addLog(`DIAGNOSTIC: Reviewing terminal stderr logs: [stderr: Error: Command not found or restricted prefix check failed]`);
    }, 1000);

    setTimeout(() => {
      addLog(`KINETIC PATCHER: Standard safety framework violated. Rewriting command to safe whitelist prefix...`);
    }, 2400);

    setTimeout(() => {
      addLog(`AUTO-REPAIR: Pushing dynamic hotfix container target to path whitelist directory.`);
      setRepairedSteps(prev => ({ ...prev, [stepId]: true }));
    }, 3800);

    setTimeout(() => {
      addLog(`VERIFICATION: running validation test ('tsc --noEmit') against workspace structure.`);
    }, 4900);

    setTimeout(() => {
      addLog(`SUCCESS: Ppatched sandbox code verified. Auto-repair loop concluded successfully on task "${stepId}".`);
      setSimulationActive(false);
      
      // Update step status to completed directly
      setPhases(prev => {
        return prev.map(p => {
          const hasStep = p.steps.some(x => x.id === stepId);
          if (!hasStep) return p;
          const uSteps = p.steps.map(s => s.id === stepId ? { ...s, status: 'completed' as const } : s);
          const total = uSteps.length;
          const comps = uSteps.filter(x => x.status === 'completed').length;
          return { ...p, steps: uSteps, progress: Math.round((comps / total) * 100) };
        });
      });
    }, 6000);
  };

  const selectedPhase = phases.find(p => p.id === activePhase) || phases[0];

  return (
    <div id="roadmap-container" className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      
      {/* Title banner */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-5 shrink-0 flex items-center justify-between select-none">
        <div>
          <div className="flex items-center gap-2">
            <Milestone className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white font-sans uppercase tracking-wide">
              {isEn ? "Neora AI Production Integration Roadmap" : "নিওরা এআই প্রোডাকশন ইন্টিগ্রেশন রোডম্যাপ"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isEn 
              ? "Comprehensive milestone blueprints, multi-step execution plans & interactive local pc sandbox simulation" 
              : "পূর্ণাঙ্গ সফল মাইলস্টোন ব্লুপ্রিন্ট, মাল্টি-স্টেপ ওএস এক্সিকিউশন প্ল্যান ও কোডিং আর্কিটেকচার ট্র্যাকার"}
          </p>
        </div>

        {/* Global stats indicators */}
        <div className="flex gap-4">
          <div className="bg-slate-950/85 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-mono font-bold">DATABASE STATUS</span>
              <button 
                onClick={() => {
                  const nextSt = dbStatus === 'connected' ? 'fallback' : 'connected';
                  setDbStatus(nextSt);
                  addLog(`System database status mock toggled to: ${nextSt.toUpperCase()}`);
                }}
                className={`text-[9px] font-bold font-mono text-left cursor-pointer focus:outline-none ${dbStatus === 'connected' ? 'text-emerald-400' : 'text-orange-400'}`}
              >
                {dbStatus === 'connected' ? "● ACTIVE PGSQL" : "⚠ FALLBACK ACTIVE (JSON)"}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/85 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-mono font-bold">AUTONOMY SECURITY</span>
              <button
                onClick={() => {
                  const nextLvl = agentAuthLevel >= 5 ? 1 : agentAuthLevel + 1;
                  setAgentAuthLevel(nextLvl);
                  addLog(`Simulation Autonomy Security Level configured to: LVL ${nextLvl}`);
                }}
                className="text-[9px] font-bold font-mono text-cyan-400 text-left cursor-pointer focus:outline-none"
              >
                LEVEL {agentAuthLevel}/5 ACTIVE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-5 space-y-8 w-full">
        
        {/* DESIGN PHILOSOPHY CALL-OUT (Holographic Cyberpunk Alert) */}
        <div className="relative overflow-hidden bg-slate-900/30 border border-cyan-500/10 rounded-xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-violet-500/5 to-transparent pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{isEn ? "Lead Systems Architect Statement" : "প্রধান স্থপতির বিশেষ প্রজ্ঞাপন"}</span>
            </div>
            <h2 className="text-sm font-bold text-slate-200">
              {isEn ? "Deployable pnpm Monorepo System Roadmap Contracts" : "ডিপ্লয়যোগ্য pnpm মনোরেপো সিস্টেম রোডম্যাপ চুক্তি"}
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {isEn 
                ? "This dashboard bridges the raw specifications detailed in SEC 15: Monorepo Architecture with physical client execution tracks. Every segment represents true production steps required to integrate Neora's 147 capability operations safely on native environments."
                : "এই ড্যাশবোর্ডটি সেকশন ১৫ এর মণিহার মনোরেপো আর্কিটেকচারের সাথে বাস্তব জীবনের ক্লায়েন্ট ট্র্যাকের সংযোগ ঘটায়। প্রতিটি অংশ লোকাল পিসিতে নিওরার ১৪৭টি স্বায়ত্তশাসিত ক্ষমতা যুক্ত করার আসল প্রকৌশলগত ধাপ।"}
            </p>
          </div>
          <div className="shrink-0 relative z-10 flex gap-2">
            <span className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-300 px-3.5 py-2 rounded shadow">
              {isEn ? "TARGET INTEGRATION : 100%" : "টার্গেট ইন্টিগ্রেশন : ১০০%"}
            </span>
          </div>
        </div>

        {/* ROADMAP PHASES HORIZONTAL SELECTOR GANTT STYLE */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <span>{isEn ? "Primary Architecture Milestones (9 Stages)" : "প্রাথমিক আর্কিটেকচার মাইলস্টোনসমূহ (৯টি পর্যায়)"}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            {phases.map((phase) => {
              const isSelected = phase.id === activePhase;
              return (
                <button
                  key={phase.id}
                  id={`phase-btn-${phase.id}`}
                  onClick={() => setActivePhase(phase.id)}
                  className={`relative p-3.5 rounded-lg border text-left transition-all duration-300 focus:outline-none cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900/60 border-cyan-500/50 shadow-[0_4px_12px_rgba(6,182,212,0.08)]' 
                      : 'bg-slate-950 border-slate-900 hover:border-slate-800/80'
                  }`}
                >
                  <div className="flex justify-between items-center select-none mb-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                      {phase.id.toUpperCase()}
                    </span>
                    <span className={`text-[9px] font-mono font-bold ${
                      phase.progress === 100 ? 'text-emerald-400' : phase.progress > 0 ? 'text-orange-400' : 'text-slate-500'
                    }`}>
                      {phase.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {phase.icon}
                    <h3 className="text-xs font-bold text-slate-200 line-clamp-1">
                      {isEn ? phase.titleEn.split(':')[1]?.trim() : phase.titleBn.split(':')[1]?.trim()}
                    </h3>
                  </div>

                  <div className="text-[8px] font-mono text-slate-500 truncate block">
                    {isEn ? phase.timelineEn : phase.timelineBn}
                  </div>

                  {/* Progressive Micro-Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950 rounded-b-lg overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        phase.progress === 100 ? 'bg-emerald-500/70' : phase.progress > 0 ? 'bg-orange-500/70' : 'bg-slate-800'
                      }`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE PHASE BREAKDOWN MODULE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/10 border border-slate-900 rounded-xl overflow-hidden shadow">
          
          {/* Timeline & Details (8-cols) */}
          <div className="lg:col-span-8 p-6 space-y-6">
            
            {/* Phase header banner detail */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-cyan-500/15 text-cyan-400 font-bold px-2 py-0.5 rounded font-mono border border-cyan-500/5">
                  {selectedPhase.id.toUpperCase()}
                </span>
                <h2 className="text-base font-bold text-white font-sans mt-1">
                  {isEn ? selectedPhase.titleEn : selectedPhase.titleBn}
                </h2>
                <div className="flex gap-2 text-xs text-slate-400 font-mono">
                  <span>{isEn ? "Estimated Cycle:" : "কাজ শুরু:"}</span>
                  <span className="text-cyan-400 font-bold">{isEn ? selectedPhase.timelineEn : selectedPhase.timelineBn}</span>
                </div>
              </div>

              {/* Progress big meter */}
              <div className="flex items-center gap-3 bg-slate-950/60 py-2 px-3 border border-slate-850 rounded-lg">
                <div className="text-right">
                  <div className="text-[9px] text-slate-500 font-mono">PHASE PROGRESS</div>
                  <div className="text-sm font-bold text-white font-mono">{selectedPhase.progress}%</div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-300 relative overflow-hidden">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke={selectedPhase.progress === 100 ? "#10b981" : "#06b6d4"}
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 - (125.6 * selectedPhase.progress) / 100}
                    />
                  </svg>
                  <span className="absolute">{selectedPhase.progress}%</span>
                </div>
              </div>
            </div>

            {/* Steps interactive list */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-widest flex items-center gap-1">
                <CheckSquare className="w-4 h-4 text-cyan-500" />
                <span>{isEn ? "Action Engineering Checklists (Double-Click state to toggle)" : "ইঞ্জিনিয়ারিং চেকলিস্ট (ইনপুট টগল করতে ক্লিক করুন)"}</span>
              </h3>

              <div className="space-y-3">
                {selectedPhase.steps.map((step) => {
                  return (
                    <div
                      key={step.id}
                      className="bg-slate-950/50 hover:bg-slate-950 border border-slate-900 rounded-lg p-4 space-y-3 transition-all hover:border-slate-800"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {/* Toggle checklist dot */}
                          <button
                            onClick={() => toggleStepStatus(selectedPhase.id, step.id)}
                            className="mt-1 focus:outline-none cursor-pointer shrink-0"
                          >
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : step.status === 'in_progress' ? (
                              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-cyan-400 animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
                            )}
                          </button>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-100">{isEn ? step.titleEn : step.titleBn}</h4>
                              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                step.complexity === 'ultra' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                                step.complexity === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {step.complexity} complexity
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {isEn ? step.descEn : step.descBn}
                            </p>
                          </div>
                        </div>

                        {/* Interactive testing and sandbox triggers */}
                        <div className="sm:text-right shrink-0">
                          {step.status === 'pending' ? (
                            <button
                              onClick={() => toggleStepStatus(selectedPhase.id, step.id)}
                              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 underline bg-transparent border-0 cursor-pointer"
                            >
                              START STEP
                            </button>
                          ) : step.status === 'in_progress' ? (
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="text-orange-400 animate-pulse uppercase">IN WORKFLOW</span>
                              {selectedPhase.id === 'phase2' || selectedPhase.id === 'phase3' || selectedPhase.id === 'phase5' || selectedPhase.id === 'phase7' ? (
                                <button
                                  disabled={simulationActive}
                                  onClick={() => runAutoRepairMockup(step.id, isEn ? step.titleEn : step.titleBn)}
                                  className="ml-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 py-0.5 px-2 rounded font-bold text-[9px] cursor-pointer cursor-pointer transition-all disabled:opacity-50"
                                >
                                  {isEn ? "TEST FAILURE OUTCOME" : "ব্যর্থতা টেস্ট করুন"}
                                </button>
                              ) : null}
                            </div>
                          ) : (
                            <div className="flex flex-col items-start sm:items-end">
                              <span className="text-emerald-400 text-[10px] font-mono font-bold">READY IN SANDBOX</span>
                              {repairedSteps[step.id] && (
                                <span className="bg-cyan-500/10 text-cyan-400 text-[8px] font-mono font-bold uppercase px-1 rounded border border-cyan-500/10 mt-1">
                                  AUTO-REPAIRED ✓
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Code and architecture specifics */}
                      <div className="bg-slate-950 p-2 rounded-md border border-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-1">
                          <Code className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Technology Spec: <strong className="text-slate-400">{isEn ? step.techEn : step.techBn}</strong></span>
                        </div>
                        <span className="text-xs">ID: {step.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* VOICE & TEXT INTENT OS SCRIPT COMPILER PLAYGROUND */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-6 mt-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>{isEn ? "NLP MODEL INTEGRATION DESK" : "এনএলপি MODEL ইন্টিগ্রেশন ডেস্ক"}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans">
                    {isEn ? "Neora Cognitive NLP Intent & Local OS Compiler Sandbox" : "নিওরা কগনিটিভ এনএলপি ইন্টেন্ট ও লোকাল ওএস স্ক্রিপ্ট কম্পাইলার"}
                  </h3>
                </div>

                {/* Model Chaining Gate Selector */}
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setCompilerModel('gemini')}
                    className={`px-3 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      compilerModel === 'gemini' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    GEMINI PRO
                  </button>
                  <button
                    onClick={() => setCompilerModel('groq')}
                    className={`px-3 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      compilerModel === 'groq' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    GROQ CLOUD
                  </button>
                  <button
                    onClick={() => setCompilerModel('ollama')}
                    className={`px-3 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      compilerModel === 'ollama' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OLLAMA LOCAL
                  </button>
                </div>
              </div>

              {/* Input field and helper preset buttons */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  {isEn ? "Enter Voice or Text Automation Command in Bengali or English:" : "বাংলা বা ইংরেজি ভয়েস বা টেক্সট অটোমেশন কমান্ড লিখুন:"}
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    value={inputCommand}
                    onChange={(e) => setInputCommand(e.target.value)}
                    placeholder={isEn ? "e.g., Open browser and check my mail" : "যেমন: একটি নতুন ফোল্ডার তৈরি করো এবং ফাইল কপি করো"}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg py-3 px-4 text-xs text-white placeholder-slate-600 focus:outline-none transition-all pr-24"
                  />
                  <button
                    disabled={isCompiling}
                    onClick={handleCompileCommand}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 hover:opacity-90 font-bold font-mono text-[9px] px-4 rounded uppercase transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isCompiling ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-slate-950" />
                    ) : (
                      <Zap className="w-3 h-3 text-slate-950" />
                    )}
                    <span>{isCompiling ? (isEn ? "COMPILING..." : "কম্পাইল হচ্ছে...") : (isEn ? "COMPILE INTENT" : "কম্পাইল করুন")}</span>
                  </button>
                </div>

                {/* Presets Grid */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputCommand(p.text)}
                      className="bg-slate-900/60 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-[10px] text-slate-400 hover:text-cyan-400 py-1.5 px-3 rounded-md font-sans transition-all cursor-pointer"
                    >
                      💡 {isEn ? p.labelEn : p.labelBn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compilation state display */}
              {isCompiling && (
                <div className="bg-slate-900/50 border border-cyan-500/10 rounded-lg p-5 flex flex-col items-center justify-center space-y-3 animate-pulse">
                  <Cpu className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-xs text-cyan-400 font-mono text-center">
                    {compilationProgress}
                  </p>
                  <div className="w-full max-w-md h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full animate-infinite-loading" style={{ width: '45%' }} />
                  </div>
                </div>
              )}

              {/* Compiled Result Dashboard Panel */}
              {compiledResult && !isCompiling && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2 animate-fade-in">
                  
                  {/* Left Metadata Rail */}
                  <div className="md:col-span-4 bg-slate-900/40 border border-slate-900 p-4 rounded-lg space-y-4">
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono font-bold block uppercase">DETECTED SEMANTIC INTENT</span>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/30 px-2 py-1 rounded inline-block mt-1">
                        {compiledResult.intent}
                      </span>
                    </div>

                    <div>
                      <span className="text-[8px] text-slate-500 font-mono font-bold block uppercase">COGNITIVE COMPILER</span>
                      <span className="text-xs text-slate-300 font-medium block mt-1">
                        {compilerModel === 'gemini' ? "🤖 Gemini Pro NLP Engine" : compilerModel === 'groq' ? "⚡ Groq Cloud Llama-3" : "🏡 Ollama Local Gemma-2"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[8px] text-slate-500 font-mono font-bold block uppercase">SAFETY WHITELIST AUDIT</span>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono font-bold text-emerald-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{compiledResult.safetyAudit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Target Code Output Card */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {isEn ? "COMPILED EXECUTABLE SCRIPT OUTPUT" : "কম্পাইলকৃত এক্সিকিউটেবল স্ক্রিপ্ট আউটপুট"}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">Status: Ready to deploy</span>
                    </div>

                    {/* Custom Code Block Displays */}
                    <div className="space-y-3">
                      <div className="bg-slate-900 border border-slate-850 rounded-lg overflow-hidden">
                        <div className="bg-slate-950 border-b border-slate-900 px-3 py-1.5 flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                          <span>🐍 generated_pyautogui_agent.py</span>
                          <span className="text-cyan-400">PYTHON 3.11</span>
                        </div>
                        <pre className="p-3 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap select-text bg-slate-950/80 leading-relaxed text-left">
                          {compiledResult.pythonCode}
                        </pre>
                      </div>

                      <div className="bg-slate-900 border border-slate-850 rounded-lg overflow-hidden">
                        <div className="bg-slate-950 border-b border-slate-900 px-3 py-1.5 flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                          <span>🐚 execute_action.sh / .bat</span>
                          <span className="text-indigo-400">SHELL SCRIPT</span>
                        </div>
                        <pre className="p-3 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap select-text bg-slate-950/80 text-left">
                          {compiledResult.shellCode}
                        </pre>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Sandbox Diagnostics logs & Active telemetry (4-cols) */}
          <div className="lg:col-span-4 bg-slate-950 border-l border-slate-900 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {isEn ? "Auto-Repair Diagnostics Terminal" : "অটো-রিপেয়ার ডায়াগনস্টিক টার্মিনাল"}
                </h3>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isEn 
                  ? "Concept simulator of the Phase 5 (Auto-Repair) execution loop. Trigger a step layout failure above to witness diagnostics logging, command rewriting, and safe sandbox revalidation." 
                  : "পর্যায় ৫ এর (অটো-রিপেয়ার উইন্ডো) ক্যারেক্টার সিমুলেশন। চ্যাটের ভেতরের নিরাপত্তা ভঙ্গ বা এরর টেস্ট করতে বাটন ক্লিক করে স্বয়ংক্রিয় সমাধান করার পদ্ধতি দেখুন।"}
              </p>

              {/* Logs output console standard */}
              <div id="diagnostics-terminal-logs" className="bg-slate-950 border border-slate-900 rounded p-3 h-64 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-2 select-text">
                {logs.length === 0 ? (
                  <span className="text-slate-600 block italic">-- Idle telemetry. Waiting for step failure test triggers --</span>
                ) : (
                  logs.map((log, i) => {
                    let color = 'text-slate-400';
                    if (log.includes('TRIGGER') || log.includes('stderr')) color = 'text-red-400';
                    if (log.includes('SUCCESS') || log.includes('safely')) color = 'text-emerald-400';
                    if (log.includes('KINETIC') || log.includes('AUTO-REPAIR')) color = 'text-cyan-400';
                    return <div key={i} className={`leading-relaxed border-b border-slate-900/40 pb-1 ${color}`}>{log}</div>;
                  })
                )}
                {simulationActive && (
                  <div className="flex items-center gap-1.5 text-orange-400 mt-2 animate-pulse">
                    <span>⚡ AI Diagnostic Model Analyzing Stderr...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic visual representation of monorepo packages dependencies directory map */}
            <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-950 space-y-3 shrink-0">
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
                {isEn ? "pnpm workspace dependency schema" : "pnpm ওয়ার্কস্পেস ডিপ্লয়মেন্ট ম্যাপ"}
              </div>
              
              <div id="dir-schema-tree" className="text-[10px] font-mono text-slate-500 space-y-1 select-none">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                  <Pocket className="w-3.5 h-3.5 text-cyan-400" />
                  <span>neora-monorepo/</span>
                </div>
                <div className="pl-4 border-l border-slate-800">
                  <div className="text-slate-400">├── artifacts/</div>
                  <div className="pl-4 text-slate-500 font-bold">├── neora/ <span className="text-[8px] bg-cyan-900/10 text-cyan-400 font-medium px-1 rounded">Vite React 19 PWA</span></div>
                  <div className="pl-4 text-slate-500 font-bold">├── api-server/ <span className="text-[8px] bg-cyan-900/10 text-cyan-400 font-medium px-1 rounded">Express 5 + SQL</span></div>
                  <div className="pl-4 text-slate-500 font-bold">└── automation-policy.json <span className="text-[8px] bg-red-900/10 text-red-400 font-medium px-1 rounded">Safety whitelists</span></div>
                </div>
                <div className="pl-4 border-l border-slate-800">
                  <div className="text-slate-400">├── lib/</div>
                  <div className="pl-4 text-slate-500 font-bold">├── db/ <span className="text-[8px] bg-emerald-900/10 text-emerald-400 font-medium px-1">Drizzle ORM Tables</span></div>
                  <div className="pl-4 text-slate-500 font-bold">├── local-agent-protocol/ <span className="text-[8px] bg-slate-800 text-slate-400 font-medium px-1">Zod actions schema</span></div>
                  <div className="pl-4 text-slate-500 font-bold">└── local-agent-python/ <span className="text-[8px] bg-yellow-900/10 text-yellow-500 font-medium px-1">PC Python agent</span></div>
                </div>
                <div className="pl-4">
                  <div className="text-slate-400">└── run.bat <span className="text-[8px] bg-slate-900 text-slate-300 px-1 rounded font-bold">Idempotent Launcher</span></div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECTION 7: STABLE DEPLOYMENT & DEV O&M PROCEDURES */}
        <section id="deployment-procedures" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="bg-slate-900/30 p-5 rounded-lg border border-slate-900 space-y-3">
            <h3 className="text-sm font-sans font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{isEn ? "DevOps Stable Deployment & Lifecycle Commands" : "ডেভঅপ্স স্থিতিশীল ডিপ্লয়মেন্ট এবং কমান্ডসমূহ"}
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isEn 
                ? "The monorepo contains strict launch execution roles defined to optimize speed and secure lock states across different ports:" 
                : "মনোরেপো বুটলোড ও পোর্ট রিলিজের জন্য তিনটি আলাদা লঞ্চার রুল ডিজাইন করা হয়েছে যা দ্বন্দ্বমুক্ত পোর্ট সচল রাখে:"}
            </p>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-900">
                <span className="text-cyan-400 font-bold">setup.bat</span> - {isEn ? "First-time setup. Performs local Node verification, installs workspace packages, creates .env.local templates, and pushes clean relational Drizzle DB schemas." : "প্রথমবারের মত সেটআপ। টাইপস্ক্রিপ্ট ফ্রেমওয়ার্ক তৈরি করা এবং ডাটা স্কিমা কানেক্ট করা।"}
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-900">
                <span className="text-cyan-400 font-bold">run.bat</span> - {isEn ? "Daily launcher. Clears locked port assets on 8080/8081, loads critical environment parameters, launches backend & frontend compilers synchronously, and boots the Python agent." : "দৈনিক ব্যবহার্য লঞ্চার। পিসি চালু হওয়ার পর এটি ৮০০০ পোর্টে চ্যাট ও অর্গানাইজার ওপেন করে।"}
              </div>
            </div>
          </div>

          <div className="bg-slate-905/35 p-5 rounded-lg border border-slate-900 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-sans font-bold text-white flex items-center gap-2 select-none">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>{isEn ? "Mitigation of Known Infrastructure Limitations" : "পারফমেন্স প্রতিবন্ধকতা ও কাস্টম সমাধান"}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isEn 
                  ? "To transition from prototype boundaries to standard production-grade performance networks, we have implemented custom code layouts to bypass default environments limits:" 
                  : "নিওরা এআই ব্লুপ্রিন্ট বাস্তব ইন্টিগ্রেশন করার সময় রিয়েল-লাইফ লোড কন্ট্রোল করতে নির্দিষ্ট কিছু অপ্টিমাইজেশন ব্যবহার করা হবে:"}
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1.5 font-sans">
                <li>• <strong className="text-slate-300">Rate Limiting (/api/chat):</strong> Token-bucket algorithm (capped 60 queries/min limit, burst grace of +10 tokens).</li>
                <li>• <strong className="text-slate-300">Fast Notifier Stream:</strong> Replaces baseline http polling with low-latency WebSockets connections.</li>
                <li>• <strong className="text-slate-300">Drizzle DBMS Query Indexes:</strong> Added B-Tree composite indices on target search targets (agent poll histories, messages timestamp indices).</li>
              </ul>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-900 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
              <span>ESTIMATED PRODUCTION COMPLETION CYCLE</span>
              <span className="font-bold">45 MAN-HOURS</span>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
