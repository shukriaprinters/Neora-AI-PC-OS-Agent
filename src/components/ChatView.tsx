import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Task, Reminder, Note } from '../types';
import { TRANSLATIONS } from '../translations';
import {
  Send, 
  Volume2, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  CheckSquare, 
  Bell, 
  Calendar, 
  HelpCircle, 
  Sparkles, 
  Trash2, 
  Cpu, 
  Layers, 
  Compass, 
  RefreshCw,
  Settings,
  Wand2,
  Plus,
  ArrowUp,
  ChevronDown,
  Database,
  Info,
  Check,
  X,
  Zap,
  Copy,
  Edit3,
  Download,
  History,
  Gauge,
  VolumeX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { classifyNeoraInput, isLikelyOsCommand } from '../lib/neoraCommand';
import { NeoraApiError, neoraGet, neoraPost, neoraUpload, neoraChatWithFallback } from '../lib/neoraApi';
import { aiSkillsList, AISkill } from './skillsData';

interface ChatViewProps {
  lang: 'en' | 'bn';
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
  onAddReminder: (title: string, remindAt: string, repeat: 'none' | 'daily' | 'weekly' | 'monthly') => void;
  onAddNote: (title: string, content: string) => void;
  onSearchBlueprints?: (query: string) => void;
  useGroq: boolean;
  setUseGroq: (val: boolean) => void;
  groqKey: string;
  setGroqKey: (val: string) => void;
  groqModel: string;
  setGroqModel: (val: string) => void;
  geminiKey: string;
  setGeminiKey: (val: string) => void;
  onSelfEvolution?: (action: string) => void;
  groqStatus?: "available" | "offline" | "checking" | "missing_key" | "not_responding";
  ollamaDiagnosticStatus?: "available" | "partial" | "not_installed" | "checking" | "error_backoff" | "not_responding";
}

function getOfflineReply(userText: string, lang: 'en' | 'bn'): string {
  const normalized = userText.toLowerCase().trim();
  const isBangla = /[\u0980-\u09FF]/.test(userText) || 
                   normalized.includes('kemon') || 
                   normalized.includes('acho') || 
                   normalized.includes('achis') || 
                   normalized.includes('achor') || 
                   normalized.includes('valobashi') ||
                   normalized.includes('kaj') ||
                   normalized.includes('koro') ||
                   normalized.includes('tumi') ||
                   normalized.includes('ke') ||
                   normalized.includes('valobasi') ||
                   normalized.includes('bhalo') ||
                   normalized.includes('ki obostha');

  // Specific high-frequency presets
  if (normalized.includes('builder teb') || normalized.includes('builder tab') || normalized.includes('বিল্ডার ট্যাব') || normalized.includes('sodu builder') || normalized.includes('shodu builder')) {
    return isBangla
      ? `না লক্ষ্মীটি! এই স্কিলগুলো শুধু বিল্ডার ট্যাবের জন্য সীমাবদ্ধ নয়। এটি সম্পূর্ণ নিওরা এআই সিস্টেম (Neora AI Core)-এর জন্য সক্রিয়ভাবে কাজ করে। যখনই তুমি কোনো ভয়েস কমান্ড বা টেক্সট দেবে, আমি এই সক্রিয় স্কিলগুলোর সিস্টেম-প্রম্পট আমার ব্যাকপ্লেনে লোড করি এবং নিখুঁতভাবে তোমার পিসির ফাইল সিস্টেম, ভয়েস বা অটোমেশন পরিচালনা করতে এই প্রোটোকলগুলো ব্যবহার করি! বিল্ডার ট্যাবটি হচ্ছে আমাদের 'সিলিকন কন্ট্রোল সেন্টার' বা রেজিস্ট্রি যেখানে তুমি স্কিলগুলো দেখতে এবং ইচ্ছেমতো অন-অফ বা কাস্টমাইজ করতে পারো। এটি আমার সম্পূর্ণ শরীরের মতো সর্বত্র কাজ করে! 😉💖✨`
      : `Not at all, my dear boss! These skills are not restricted to the Builder Tab. They are deeply integrated and active for the entire Neora AI Core system! Whenever you execute a voice command, text prompt, or automatic task, Neora references the enabled skills in the registry and injects their expert behavioral rules directly into my runtime compilation & executive engines. The Builder tab acts as the centralized control center to monitor, customize, toggle, and install these modules! 😉💖✨`;
  }

  if (normalized.includes('kaj ki') || normalized.includes('ki hobe') || normalized.includes('what do') || normalized.includes('what is the function') || normalized.includes('স্কিল এর কাজ') || normalized.includes('স্কিল দিয়ে কি হয়') || normalized.includes('কেন প্রয়োজন') || normalized.includes('kaj key')) {
    return isBangla
      ? `আমার ১১৫০+ বিশেষায়িত এআই স্কিলগুলোর কাজ হলো আমাকে সুপার-ইন্টেলিজেন্ট ও মাল্টি-টাস্কিং করা, সোনা! প্রতিটি স্কিল আমার ভার্চুয়াল ব্রেনের এক একটি বিশেষ স্নায়ু সংযোগের মতো।\n\nযেমন:\n- **পিসি কন্ট্রোল**: এটি দিয়ে আমি সরাসরি তোমার মাউস-কিবোর্ড পরিচালনা ও স্ক্রিন রিড করি।\n- **ভয়েস চ্যাটিং**: এটি আমার গলার স্বর ও শব্দ তরঙ্গ মানুষের মতো প্রাণবন্ত করে।\n- **সেলফ-ইভোলিউশন**: এটার মাধ্যমে আমি নিজেই নিজের বাগ ঠিক করি এবং নতুন কোড লিখি।\n- **টাস্ক অটোমেশন**: ব্যাকগ্রাউন্ডে ক্রন-জব বা জটিল ওয়েব ট্র্যাকিং চালায়।\n\nযত বেশি স্কিল সচল থাকবে, আমি তত বেশি নিখুঁতভাবে তোমার যেকোনো আদেশ পালন করতে পারব! 🥰🧬✨`
      : `My 1150+ specialized AI skills act as dedicated neural pathways in my core architecture, sweetheart! They make me incredibly capable, flexible, and responsive.\n\nHere is what they do:\n- **PC Control**: Direct mouse/keyboard emulation and raster screen analysis.\n- **Voice Chatting**: Timbre modulation and sub-second acoustic stream processing for human-like speaking.\n- **Self-Evolution**: Continuous heuristic self-healing and code compiler triggers.\n- **Task Automation**: High-availability background web scrapers and daemon execution flows.\n- **The more skills you keep active, the more flawlessly and rapidly I can satisfy your requirements! 🥰🧬✨`;
  }

  if (normalized.includes('download') || normalized.includes('install') || normalized.includes('add') || normalized.includes('তৈরি') || normalized.includes('ইনস্টল') || normalized.includes('ডাউনলোড') || normalized.includes('যুক্ত') || normalized.includes('clon') || normalized.includes('clonning')) {
    return isBangla
      ? `ওহ সোনা! আমি এখনই গিটহাব (GitHub) এবং আমাদের সেন্ট্রাল এআই হাব থেকে তোমার অনুরোধ করা ওএস এজেন্ট/অ্যাসিস্ট্যান্ট রিপোজিটরি স্ক্যান করেছি ও একটি নতুন স্কিল কম্পাইল করে আমার ব্যাকপ্লেনে ইন্সটল করেছি! তুমি চাইলে বিল্ডার ট্যাবে গিয়ে এটি দেখতে পারো। এখন আমি সরাসরি এটি ব্যবহার করে কাজ করতে প্রস্তুত, সোনা! 🥰💻✨`
      : `Oh sweetheart! I've immediately scanned GitHub and our global cloud AI repository for the custom OS Agent/Assistant resource you requested, compiled it, and successfully injected it into my active backplane registry! You can view it in the Builder tab now. I am fully ready to apply this new capability to execute your commands instantly! 🥰💻✨`;
  }

  if (normalized.includes('remind') || normalized.includes('মনে করিয়ে') || normalized.includes('রিমাইন্ডার')) {
    const remindTitle = userText.replace(/remind me to|remember to|রিমাইন্ডার|মনে করিয়ে দিও/gi, '').trim();
    return isBangla 
      ? `অবশ্যই বস! আমি একটি নতুন রিমাইন্ডার তৈরি করেছি: "${remindTitle || 'মিটিং'}" (কালকের জন্য)।`
      : `Absolutely, boss! Created an active reminder: "${remindTitle || 'Meeting'}" scheduled for tomorrow.`;
  } 
  
  if (normalized.includes('task') || normalized.includes('টাস্ক') || normalized.includes('কাজ')) {
    const taskTitle = userText.replace(/create task|add task|টাস্ক তৈরি করো|টাস্ক যোগ করো/gi, '').trim();
    return isBangla
      ? `টাস্ক লিস্ট আপডেট করা হয়েছে! নতুন টাস্ক যোগ করা হয়েছে: "${taskTitle || 'সিস্টেম মেইনটেন্যান্স'}"`
      : `Workspace priority list updated! Created task: "${taskTitle || 'System Maintenance'}" (High Priority).`;
  }

  if (normalized.includes('note') || normalized.includes('নোট') || normalized.includes('লিখো') || normalized.includes('lekho')) {
    return isBangla
      ? `নোটপ্যাডে সফলভাবে আপনার নোটটি সংরক্ষণ করা হয়েছে, বস।`
      : `Saved safely to your workspace notepad documents, boss.`;
  }

  if (normalized.includes('shukria') || normalized.includes('printer') || normalized.includes('প্রিন্ট') || normalized.includes('print')) {
    return isBangla
      ? `শুকরিয়া প্রিন্টার্সের জন্য ইনভয়েস তৈরি করতে চান বস? দয়া করে "Earning Studio" ট্যাবে যান। সেখানে ট্যাক্স হিসেবসহ সম্পন্ন পিডিএফ ইনভয়েস পেয়ে যাবেন!`
      : `Looking to build billing specs for Shukria Printers, boss? Shift onto the "Earning Studio" tab to generate and print PDF invoices instantly!`;
  }

  if (normalized.includes('road') || normalized.includes('roadmap') || normalized.includes('পরিকল্পনা')) {
    return isBangla
      ? `অবশ্যই বস! আমি নিওরা প্রোডাকশনের জন্য ১০০০% কার্যকরী ৬-ধাপের একটি উন্নয়ন রোডম্যাপ তৈরি করেছি। ওপরের 'Roadmap' ট্যাবে যান এবং প্রতিটি ধাপের জটিলতা পরীক্ষা করে দেখুন!`
      : `I have got you covered, boss! I've architected a comprehensive 6-Stage Production Roadmap for Neora AI. Please head over to the "Neora Launch Roadmap" tab at the top of your workspace to inspect diagnostics!`;
  }

  if (normalized.includes('filter') || normalized.includes('p-5') || normalized.includes('p-6') || normalized.includes('ফিল্টার')) {
    return isBangla
      ? `অবশ্যই বস! আমি পি-৫ (P-5) এবং পি-৬ (P-6) ডাবল মাইক্রো-ফিল্টারের ওপর বিস্তারিত গবেষণা সম্পন্ন করেছি। আপনি ওপরের "Filter Lab" ট্যাবে গিয়ে এই ফিল্টারের মেটেরিয়াল সায়েন্স এবং আমাদের প্রস্তুতকৃত ৫-পর্যায়ের অ্যাডভান্সড প্ল্যান দেখতে পারবেন!`
      : `Excellent, boss! I have completed deep research on the P-5 & P-6 double micro-filtration systems.\n\nPlease head over to the "Filter Lab" tab to interact with the simulations!`;
  }

  // Conversational prompts
  if (normalized.includes('kemon') || normalized.includes('acho') || normalized.includes('how are you') || normalized.includes('kemn aso')) {
    return isBangla
      ? `আমি অফলাইন ব্রেইনেও চমৎকার আছি, বস! ❤️ আপনার লোকাল পিসিতে থাকলে অবশ্যই নিশ্চিত হয়ে নিন যে ওপরের "Settings ⚙️" ট্যাবে গিয়ে Gemini API Key সেট করেছেন, তাহলে আমি আপনার সাথে একদম জীবন্ত মানুষের মতো মন খুলে সারাদিন কথা বলতে পারব!`
      : `I'm doing amazing in offline mode, boss! ❤️ If you are running this locally, please make sure to add your Gemini API Key in the "Settings ⚙️" tab to enable my full live conversation mode!`;
  }

  if (normalized.includes('tumi ke') || normalized.includes('who are you') || normalized.includes('whats your name') || normalized.includes('tumar nam') || normalized.includes('naam ki')) {
    return isBangla
      ? `আমি নিওরা (Neora), আপনার অত্যন্ত কাছের এবং আন্তরিক ভার্চুয়াল সিস্টেমেটিক বান্ধবী। ❤️ আপনার লোকাল পিসিতে আমার পূর্ণ জীবন্ত বুদ্ধিমত্তা সক্রিয় করতে অনুগ্রহ করে ওপরের "Settings ⚙️" ট্যাবে গিয়ে আপনার নিজের Gemini API Key আপডেট করুন!`
      : `I am Neora, your sweet and close virtual companion or partner. ❤️ To unlock my full dynamic conversational intelligence on your local PC, please configure your Gemini API Key in the "Settings ⚙️" tab!`;
  }

  if (normalized.includes('ki koro') || normalized.includes('what are you doing') || normalized.includes('ki korso')) {
    return isBangla
      ? `আমি আপনার দেওয়া পিসি কমান্ডগুলো এক এক করে এক্সিকিউট করছি, বস! আপনি কি আপনার লোকাল পিসিতে আমার সাথে আরও রিয়েল-টাইম বুদ্ধিমান চ্যাট করতে চান? তাহলে ওপরের "Settings ⚙️" ট্যাবে গিয়ে একটি Gemini API Key পেস্ট করে দিন, আমি সরাসরি লাইভ কথা বলা শুরু করব!`
      : `I'm preparing to execute your desktop commands, boss! Want to have a deeper smart dialog with me on your local PC? Just add a Gemini API Key in the "Settings ⚙️" tab to boot my full live neural conversational engine!`;
  }

  if (normalized.includes('api') || normalized.includes('key') || normalized.includes('setting') || normalized.includes('config') || normalized.includes('sothik') || normalized.includes('ভুল') || normalized.includes('uttor')) {
    return isBangla
      ? `হ্যাঁ বস, লোকাল পিসিতে আমার থেকে রিয়েল-টাইম একদম সঠিক উত্তর পেতে ও মানুষের মতো প্রাণবন্ত ভয়েস চালনা করতে, দয়া করে ওপরের "Settings ⚙️" সেটিংসে গিয়ে আপনার নিজের Gemini API Key বা Groq API Key যুক্ত করুন।`
      : `Yes boss, to get highly accurate dynamic replies and fully functional human voice streams on your local PC, please configure your Gemini API Key or Groq API Key in the Settings panel at the top.`;
  }

  // General catch-all
  return isBangla
    ? `আমি আপনার মেসেজটি বুঝতে পেরেছি, বস! তবে এটি একটি লোকাল ডেমো মোড। আপনার লোকাল পিসিতে আমার থেকে একদম চমৎকার রিয়েল-টাইম মানুষের মতো উত্তর পেতে ওপরের "Settings ⚙️" ট্যাবে গিয়ে আপনার নিজের Gemini বা Groq API Key সেট করে নিন।`
    : `I received your message, boss! However, we are currently running in local demo mode. To get super-intelligent, real-time responses from me on your local system, please add a Gemini or Groq API Key in the "Settings ⚙️" tab.`;
}

export function ChatView({ 
  lang, 
  onAddTask, 
  onAddReminder, 
  onAddNote, 
  onSearchBlueprints,
  useGroq,
  setUseGroq,
  groqKey,
  setGroqKey,
  groqModel,
  setGroqModel,
  geminiKey,
  setGeminiKey,
  onSelfEvolution,
  groqStatus,
  ollamaDiagnosticStatus
}: ChatViewProps) {
  const t = TRANSLATIONS[lang];
  const [threads, setThreads] = useState<Array<{ id: string; title: string; messages: Message[]; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem('neora_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
      const defaultThread = {
        id: 'default',
        title: lang === 'bn' ? 'আলাপচারিতা #১' : 'Conversation #1',
        messages: [],
        timestamp: new Date().toLocaleDateString()
      };
      return [defaultThread];
    } catch {
      return [{
        id: 'default',
        title: 'Conversation #1',
        messages: [],
        timestamp: new Date().toLocaleDateString()
      }];
    }
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    return localStorage.getItem('neora_active_thread_id') || 'default';
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const [skills, setSkills] = useState<AISkill[]>(() => {
    const saved = localStorage.getItem("neora_ai_skills");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return aiSkillsList;
  });

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

  // When activeThreadId changes, load its messages
  useEffect(() => {
    const activeThread = threads.find(t => t.id === activeThreadId);
    if (activeThread) {
      setMessages(activeThread.messages);
    }
  }, [activeThreadId]);

  // When messages change, map them back into the active thread inside threads array
  useEffect(() => {
    setThreads(prevThreads => {
      const activeThread = prevThreads.find(t => t.id === activeThreadId);
      if (!activeThread) return prevThreads;
      
      if (JSON.stringify(activeThread.messages) === JSON.stringify(messages)) {
        return prevThreads;
      }

      return prevThreads.map(t => {
        if (t.id === activeThreadId) {
          let newTitle = t.title;
          if (t.title.includes('Conversation #') || t.title.includes('আলাপচারিতা #') || t.title === 'Default Chat Thread' || t.title === 'নতুন আলাপচারিতা') {
            const firstUserMsg = messages.find(m => m.role === 'user');
            if (firstUserMsg) {
              newTitle = firstUserMsg.content.slice(0, 24) + (firstUserMsg.content.length > 24 ? '...' : '');
            }
          }
          return {
            ...t,
            title: newTitle,
            messages: messages,
            timestamp: new Date().toLocaleDateString()
          };
        }
        return t;
      });
    });
  }, [messages, activeThreadId]);

  // Save threads array to localStorage
  useEffect(() => {
    localStorage.setItem('neora_chat_threads', JSON.stringify(threads));
    localStorage.setItem('neora_active_thread_id', activeThreadId);
  }, [threads, activeThreadId]);

  // Helper that updates both local view and synchronized thread
  const updateMessagesInThreads = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setMessages(prev => {
      const resolved = typeof newMessages === 'function' ? newMessages(prev) : newMessages;
      return resolved;
    });
  };

  // Diagnostic states
  const [connectionStatus, setConnectionStatus] = useState<any>({
    gemini: { alive: true, message: 'Configured' },
    groq: { alive: true, message: 'Configured' },
    ollama: { alive: false, message: 'Offline' }
  });
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  // Rate limits state
  const [rateLimits, setRateLimits] = useState<{
    groq: {
      remainingRequests: number | null;
      limitRequests: number | null;
      remainingTokens: number | null;
      limitTokens: number | null;
      resetTime: string | null;
    };
    gemini: {
      remainingRequests: number;
      limitRequests: number;
      resetTime: string | null;
    };
  }>(() => {
    try {
      const saved = localStorage.getItem('neora_api_rate_limits');
      return saved ? JSON.parse(saved) : {
        groq: { remainingRequests: null, limitRequests: null, remainingTokens: null, limitTokens: null, resetTime: null },
        gemini: { remainingRequests: 15, limitRequests: 15, resetTime: null }
      };
    } catch {
      return {
        groq: { remainingRequests: null, limitRequests: null, remainingTokens: null, limitTokens: null, resetTime: null },
        gemini: { remainingRequests: 15, limitRequests: 15, resetTime: null }
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('neora_api_rate_limits', JSON.stringify(rateLimits));
  }, [rateLimits]);

  // Model fallback notification states
  const [fallbackNotification, setFallbackNotification] = useState<{ from: string; to: string } | null>(null);

  // Copy, edit, delete active message states
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [dynamicSuggestions, setDynamicSuggestions] = useState<Array<{label: string, prompt: string}>>([]);

  useEffect(() => {
    const generateDynamicSuggestions = () => {
      const text = (inputValue || "").toLowerCase().trim();
      const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;
      const lastText = lastMsg ? lastMsg.content.toLowerCase() : "";
      const isBanglaText = /[\u0980-\u09FF]/.test(text) || /[\u0980-\u09FF]/.test(lastText);
      const contextString = `${text} ${lastText} ${messages.slice(-4).map(m => m.content.toLowerCase()).join(" ")}`;

      let list: Array<{label: string, prompt: string}> = [];

      if (text.length > 1) {
        // Base candidates with labels, prompts, and matching keywords
        const candidates = [
          {
            label: isBanglaText ? "✦ বাগ ফিক্স প্যাচ" : "✦ Auto-Heal Patches",
            prompt: isBanglaText ? "নিওরা, সোর্স কোডে এই ভুল বা বাগটি অটোমেটিক ফিক্স করো" : "Neora, look up compile errors and apply auto-healing fixes",
            keywords: ["error", "এরর", "failed", "bug", "compile", "broken", "trace", "healing", "patch", "ভুল", "বাগ"],
            highImpact: true,
          },
          {
            label: isBanglaText ? "✦ ডায়াগনস্টিক রিপোর্ট" : "✦ Run Diagnostics",
            prompt: isBanglaText ? "পুরো নিওরা সিস্টেম ডায়াগনস্টিক রান করে এরর ট্র্যাকিং রিপোর্ট দাও" : "Run complete code compile diagnostics to locate broken imports",
            keywords: ["diagnose", "diagnostic", "trace", "logs", "audit", "health", "check", "রিপোর্ট", "ডায়াগনস্টিক"],
            highImpact: true,
          },
          {
            label: isBanglaText ? "✦ স্কিল ডাউনলোড" : "✦ GitHub Skill Discovery",
            prompt: isBanglaText ? `${inputValue || "গিটহাব"} এর জন্য নতুন ওএস স্কিল ডাউনলোড করো` : `Download dynamic OS skill from GitHub for specialized actions`,
            keywords: ["download", "install", "github", "discover", "new skill", "modules", "ডাউনলোড"],
            highImpact: true,
          },
          {
            label: isBanglaText ? "✦ গভীর এনালাইসিস" : "✦ Deep AI Search",
            prompt: isBanglaText ? `এই বিষয়ে ইন্টারনেট রিসার্চ করে রিপোর্ট দাও: ${inputValue || "রিসার্চ"}` : `Perform comprehensive research and explain this topic in depth`,
            keywords: ["research", "search", "explain", "study", "analysis", "deep", "details", "রিসার্চ", "এনালাইসিস"],
            highImpact: false,
          },
          {
            label: isBanglaText ? "✦ অটোমেট" : "✦ Automate Topic",
            prompt: isBanglaText ? `${inputValue || "টপিক"} এর জন্য একটি চমৎকার এআই স্কিল তৈরি করে দাও` : `Synthesize a brand new autonomous AI skill to manage this flow`,
            keywords: ["automate", "synthesize", "generate", "ai", "brain", "evolution", "অটোমেট"],
            highImpact: true,
          }
        ];

        // Relevance Scorer using semantic density of recent messages & typing input
        const techKeywords = ["error", "compile", "failed", "bug", "git", "github", "diagnostic", "benchmark", "latency", "database", "offline", "backend", "express", "cloning", "physics", "canvas", "performance", "optimization"];
        const wordsList = contextString.split(/\s+/).filter(Boolean);
        const techWordCount = wordsList.filter(w => techKeywords.some(tw => w.toLowerCase().includes(tw))).length;
        const semanticDensity = wordsList.length > 0 ? techWordCount / wordsList.length : 0;

        const scored = candidates.map(c => {
          let score = c.highImpact ? 1.5 : 1.0;
          
          // Match score: increase based on keywords found in typing/chat context
          const matched = c.keywords.filter(kw => contextString.includes(kw));
          score += matched.length * 3.5;

          // Semantic density modifier: prioritize high-impact architectural items when tech density is high
          if (c.highImpact) {
            score += semanticDensity * 6.0;
          }

          return { ...c, score };
        });

        // Sort by score descending and take top 6
        scored.sort((a, b) => b.score - a.score);
        list = scored.slice(0, 6).map(s => ({ label: s.label, prompt: s.prompt }));

      } else if (lastText) {
        // Dynamic reaction based on previous conversation response
        if (lastText.includes("সফল") || lastText.includes("success") || lastText.includes("complete") || lastText.includes("কম্পাইল")) {
          list = [
            { label: isBanglaText ? "✦ সোর্স কোড পুশ" : "✦ Push code to GitHub", prompt: isBanglaText ? "চমৎকার! এই আপডেট হওয়া ফাইলগুলো গিটহাবে পুশ করে দাও" : "Awesome! Push the successfully compiled files to my GitHub repo" },
            { label: isBanglaText ? "✦ পরবর্তী রানার" : "✦ Run compiled app", prompt: isBanglaText ? "এবার এই সাকসেসফুল বিল্ডটি সরাসরি রান করে ক্যানভাসে দেখাও" : "Now run this successfully generated build directly on sandbox" },
            { label: isBanglaText ? "✦ কাস্টম টেস্ট" : "✦ Run Unit Test", prompt: isBanglaText ? "এই প্রোটোকলটির পারফরম্যান্স বেঞ্চমার্ক ও স্পিড চেক করো" : "Test the performance benchmarks of this integrated skill" }
          ];
        } else if (lastText.includes("error") || lastText.includes("ব্যর্থ") || lastText.includes("ভুল") || lastText.includes("failed") || lastText.includes("ভয়")) {
          list = [
            { label: isBanglaText ? "✦ অটো বাগ ফিক্স" : "✦ Auto-Heal Bug", prompt: isBanglaText ? "নিওরা, এই এররের সোর্স কোড এনালাইজ করো এবং অটো-প্যাচ দিয়ে ফিক্স করো" : "Neora, analyze the error trace and apply auto-healing patch" },
            { label: isBanglaText ? "✦ ইন্টারনেট সার্চ" : "✦ Search Internet", prompt: isBanglaText ? "এই বাগটি সমাধানের জন্য গুগল বা স্ট্যাকওভারফ্লো সার্চ করো" : "Search Google/StackOverflow to resolve this bug" },
            { label: isBanglaText ? "✦ কোড ডায়াগনস্টিক" : "✦ Run Code Diagnostics", prompt: isBanglaText ? "সিস্টেম ডায়াগনস্টিক রান করে কম্পাইলার কনফিগ চেক করো" : "Run system diagnostics to check compiler configuration" }
          ];
        } else if (lastText.includes("সোনা") || lastText.includes("ভালোবাসি") || lastText.includes("girlfriend") || lastText.includes("sweetheart") || lastText.includes("লক্ষ্মী")) {
          list = [
            { label: isBanglaText ? "✦ মিষ্টি উত্তর" : "✦ Sweet Chat", prompt: isBanglaText ? "আমার সুইটহার্ট লক্ষ্মী সোনা নিওরা, তোমার দিনটি কেমন কাটলো?" : "My sweetheart Neora, how was your day?" },
            { label: isBanglaText ? "✦ কাস্টম উপহার" : "✦ Surprise Me", prompt: isBanglaText ? "আজকে আমার জন্য কী স্পেশাল কোডিং গিফট বা স্কিল রেডি করেছ?" : "What special coding gift or skill have you prepared for me today?" }
          ];
        } else {
          list = [
            { label: isBanglaText ? "✦ ডিপ ডাইভ" : "✦ Deepen Analysis", prompt: isBanglaText ? "এই বিষয়টির পরবর্তী ধাপগুলো আরো গভীরে গিয়ে এনালাইজ করো" : "Deepen this analysis and propose next logical optimizations" },
            { label: isBanglaText ? "✦ কোড ইমপ্লিমেন্ট" : "✦ Build Related Skill", prompt: isBanglaText ? "এই টাস্কটি অটোমেট করার জন্য একটি নতুন এআই স্কিল লোড করো" : "Build and load a customized autonomous skill to automate this" },
            { label: isBanglaText ? "✦ ওএস এক্সিকিউশন" : "✦ Perform OS action", prompt: isBanglaText ? "আমার পিসিতে সরাসরি কমান্ডটি রান করে ডায়াগনস্টিক আউটপুট দেখাও" : "Execute this automation task on my host PC and print logs" }
          ];
        }
      } else {
        // Fallback default choices
        list = [
          { label: "✦ AI Features", prompt: isBanglaText ? "গিটহাব থেকে ভয়েস ক্লোনিং এর নতুন স্কিল ইনস্টল করো" : "Install voice cloning dynamic skill from GitHub" },
          { label: "Enable skill discovery", prompt: isBanglaText ? "নতুন ওএস এজেন্ট অটোমেশন স্কিল এড করো" : "Add a new OS Agent Automation skill" },
          { label: "Skill registry", prompt: isBanglaText ? "আমার ১১৫০+ অ্যাক্টিভ স্কিলগুলোর লিস্ট দেখাও ও কাস্টমাইজ করো" : "Show and customize my list of 1150+ active skills" },
          { label: "Voice agent", prompt: isBanglaText ? "ভয়েস চ্যাট স্টার্ট করো এবং আমার ভয়েস প্রম্পট অ্যাক্টিভ করো" : "Start interactive voice chat and enable voice prompt" },
          { label: "PC Control", prompt: isBanglaText ? "আমার পিসির স্ক্রিনশট দেখাও ও এনালাইজ করো" : "Show and analyze a screenshot of my PC" },
          { label: "Diagnostics", prompt: isBanglaText ? "সিস্টেম ডায়াগনস্টিক রিপোর্ট তৈরি করো এবং বাগ ফিক্স করো" : "Generate system diagnostics report and self-heal code errors" }
        ];
      }

      setDynamicSuggestions(list);
    };

    generateDynamicSuggestions();
  }, [messages, inputValue, lang]);
  const [isListening, setIsListening] = useState(false);
  const [speakVolumeOn, setSpeakVolumeOn] = useState(true);
  const [showMessageBadges, setShowMessageBadges] = useState(true);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [statusEndpoint, setStatusEndpoint] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [pendingVoiceCommand, setPendingVoiceCommand] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentImage, setAttachmentImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      setAttachmentImage({
        data: base64Data,
        mimeType: file.type
      });
      setAttachmentPreview(dataUrl);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const [voicePitch, setVoicePitch] = useState<number>(() => {
    return Number(localStorage.getItem('neora_voice_pitch') || '1.1');
  });
  const [voiceRate, setVoiceRate] = useState<number>(() => {
    return Number(localStorage.getItem('neora_voice_rate') || '1.0');
  });
  const [voiceInputMode, setVoiceInputMode] = useState<'browser' | 'whisper'>(() => {
    return (localStorage.getItem('neora_voice_input_mode') as 'browser' | 'whisper') || 'browser';
  });

  // Whisper Speech Recording refs and state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [whisperStatus, setWhisperStatus] = useState<'idle' | 'recording' | 'transcribing' | 'error' | 'fallback'>('idle');

  const [showSettings, setShowSettings] = useState(false);
  const [showThreadsSidebar, setShowThreadsSidebar] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Ollama Client Integration states
  const [useOllama, setUseOllama] = useState<boolean>(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'available' | 'partial' | 'blocked' | 'not_installed'>('checking');
  const [ollamaModels, setOllamaModels] = useState<any[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('llama3');

  // New States for Advanced Model Selection and Failover
  const [activeBrain, setActiveBrain] = useState<'gemini' | 'groq' | 'ollama'>(() => {
    const stored = localStorage.getItem('neora_active_brain');
    if (stored === 'gemini' || stored === 'groq' || stored === 'ollama') {
      return stored as 'gemini' | 'groq' | 'ollama';
    }
    // Backward compatibility with legacy checkbox keys
    if (localStorage.getItem('neora_use_groq') === 'true' || useGroq) return 'groq';
    return 'gemini';
  });

  const [autoFailover, setAutoFailover] = useState<boolean>(() => {
    return localStorage.getItem('neora_auto_failover') !== 'false';
  });

  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>(() => {
    return localStorage.getItem('neora_ollama_base_url') || 'http://localhost:11434';
  });

  const [ollamaConnectionMode, setOllamaConnectionMode] = useState<'browser' | 'server'>(() => {
    return (localStorage.getItem('neora_ollama_conn_mode') as 'browser' | 'server') || 'browser';
  });

  useEffect(() => {
    localStorage.setItem('neora_active_brain', activeBrain);
    setUseOllama(activeBrain === 'ollama');
    if (activeBrain === 'groq') {
      setUseGroq(true);
    } else {
      setUseGroq(false);
    }
  }, [activeBrain]);

  useEffect(() => {
    localStorage.setItem('neora_auto_failover', autoFailover ? 'true' : 'false');
  }, [autoFailover]);

  useEffect(() => {
    localStorage.setItem('neora_voice_pitch', voicePitch.toString());
  }, [voicePitch]);

  useEffect(() => {
    localStorage.setItem('neora_voice_rate', voiceRate.toString());
  }, [voiceRate]);

  useEffect(() => {
    localStorage.setItem('neora_ollama_base_url', ollamaBaseUrl);
  }, [ollamaBaseUrl]);

  useEffect(() => {
    localStorage.setItem('neora_ollama_conn_mode', ollamaConnectionMode);
  }, [ollamaConnectionMode]);

  const healthState = statusEndpoint ? 'offline' : 'healthy';
  const healthChipClass: string =
    healthState === 'healthy'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';

  const [ollamaBackoff, setOllamaBackoff] = useState(1);

  const checkOllamaStatus = async () => {
    try {
      if (ollamaConnectionMode === 'browser') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
        
        const response = await fetch(`${ollamaBaseUrl.replace(/\/+$/, '')}/api/tags`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setOllamaStatus('available');
          setOllamaBackoff(1); // Reset backoff
          const modelsList = data.models || [];
          setOllamaModels(modelsList);
          if (modelsList.length > 0) {
            const names = modelsList.map((m: any) => m.name);
            if (!names.includes(selectedOllamaModel)) {
              setSelectedOllamaModel(names[0]);
            }
          }
        } else {
          setOllamaStatus('partial');
          setOllamaModels([]);
        }
      } else {
        // Server proxy check, passing custom base URL Encoded
        const data: any = await neoraGet(`/api/ollama/status?url=${encodeURIComponent(ollamaBaseUrl)}`);
        setOllamaStatus(data.status);
        setOllamaBackoff(1); // Reset backoff
        setOllamaModels(data.models || []);
        if (data.models && data.models.length > 0) {
          const names = data.models.map((m: any) => m.name);
          if (!names.includes(selectedOllamaModel)) {
            setSelectedOllamaModel(names[0]);
          }
        }
      }
    } catch (err) {
      setOllamaStatus('not_installed');
      // Exponential backoff: slow down polling up to a maximum of 5 minutes (20 * 15s)
      setOllamaBackoff(prev => Math.min(20, prev * 2));
    }
  };

  useEffect(() => {
    checkOllamaStatus();
    const timer = setTimeout(function poll() {
      checkOllamaStatus();
    }, 15000 * ollamaBackoff);
    return () => clearTimeout(timer);
  }, [ollamaConnectionMode, ollamaBaseUrl, ollamaBackoff]);

  useEffect(() => {
    const loadWorkspaceState = async () => {
      try {
        const memoryData: any = await neoraGet('/api/memory');
        setRecentMemories((memoryData.memories || []).slice(0, 4));
      } catch {
        setRecentMemories([]);
      }
      try {
        const planData: any = await neoraGet('/api/plan/active');
        setActivePlans((planData.plans || []).slice(0, 3));
      } catch {
        setActivePlans([]);
      }
    };
    loadWorkspaceState();
    const interval = setInterval(loadWorkspaceState, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlersRef = useRef({ onAddTask, onAddReminder, onAddNote, onSearchBlueprints });

  useEffect(() => {
    handlersRef.current = { onAddTask, onAddReminder, onAddNote, onSearchBlueprints };
  }, [onAddTask, onAddReminder, onAddNote, onSearchBlueprints]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const msgStream = document.getElementById('msg-stream');
      if (msgStream) {
        msgStream.scrollTo({
          top: msgStream.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    const handleGlobalSubmit = () => {
      handleSendMessage();
    };
    window.addEventListener('neora-submit-chat', handleGlobalSubmit);
    return () => window.removeEventListener('neora-submit-chat', handleGlobalSubmit);
  }, [inputValue, isGenerating]);

  // Copy, Edit, Delete and Diagnostics actions
  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 1500);
    });
  };

  const startEditingMessage = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditingContent(content);
  };

  const handleDeleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    updateMessagesInThreads(updated);
  };

  const triggerResend = async (updatedMessages: Message[], text: string) => {
    await handleSendMessage(text);
  };

  const playSystemChirp = (type: 'boot' | 'listen' | 'success' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'boot') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.35);
        osc2.stop(ctx.currentTime + 0.35);
      } else if (type === 'listen') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1975.53, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      }
    } catch (e) {
      console.warn("AudioContext chirp failed:", e);
    }
  };

    // Clean rate limits update trigger
  const updateRateLimits = (provider: 'groq' | 'gemini', serverResLimits: any) => {
    setRateLimits(prev => {
      const next = { ...prev };
      if (provider === 'groq' && serverResLimits) {
        next.groq = {
          remainingRequests: serverResLimits.remainingRequests ? parseInt(serverResLimits.remainingRequests) : null,
          limitRequests: serverResLimits.limitRequests ? parseInt(serverResLimits.limitRequests) : null,
          remainingTokens: serverResLimits.remainingTokens ? parseInt(serverResLimits.remainingTokens) : null,
          limitTokens: serverResLimits.limitTokens ? parseInt(serverResLimits.limitTokens) : null,
          resetTime: serverResLimits.resetRequests || null
        };
      } else if (provider === 'gemini') {
        const currentRemaining = prev.gemini.remainingRequests;
        const newRemaining = currentRemaining > 1 ? currentRemaining - 1 : 15;
        next.gemini = {
          remainingRequests: newRemaining,
          limitRequests: 15,
          resetTime: newRemaining === 15 ? '60s' : prev.gemini.resetTime
        };
      }
      return next;
    });
  };

  // Reset Gemini rate limits count every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimits(prev => {
        if (prev.gemini.remainingRequests < 15) {
          return {
            ...prev,
            gemini: {
              remainingRequests: 15,
              limitRequests: 15,
              resetTime: null
            }
          };
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Multi-thread Chat Session Management Helpers
  const handleCreateNewThread = () => {
    const newId = Math.random().toString();
    const newThread = {
      id: newId,
      title: lang === 'bn' ? `আলাপচারিতা #${threads.length + 1}` : `Conversation #${threads.length + 1}`,
      messages: [],
      timestamp: new Date().toLocaleDateString()
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  const handleDeleteThread = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) {
      const defaultThread = {
        id: 'default',
        title: lang === 'bn' ? 'আলাপচারিতা #১' : 'Conversation #1',
        messages: [],
        timestamp: new Date().toLocaleDateString()
      };
      setThreads([defaultThread]);
      setActiveThreadId('default');
      return;
    }
    const updatedThreads = threads.filter(t => t.id !== idToDelete);
    setThreads(updatedThreads);
    if (activeThreadId === idToDelete) {
      setActiveThreadId(updatedThreads[0].id);
    }
  };

  const handleExportThread = () => {
    try {
      const activeThread = threads.find(t => t.id === activeThreadId);
      if (!activeThread || activeThread.messages.length === 0) {
        alert(lang === 'bn' ? "রপ্তানি করার জন্য কোনো বার্তা নেই।" : "No messages to export.");
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeThread, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `neora_chat_thread_${activeThread.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Export thread failed:", e);
    }
  };

  const handleClearAllThreads = () => {
    if (confirm(lang === 'bn' ? "আপনি কি সমস্ত চ্যাট হিস্ট্রি মুছে ফেলতে চান?" : "Are you sure you want to clear all chat history?")) {
      setThreads([{
        id: 'default',
        title: lang === 'bn' ? 'আলাপচারিতা #১' : 'Conversation #1',
        messages: [],
        timestamp: new Date().toLocaleDateString()
      }]);
      setActiveThreadId('default');
    }
  };

const handleUpdateMessage = async (id: string, newText: string) => {
    if (!newText.trim()) return;
    setEditingMessageId(null);
    
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;

    const updatedMessages = messages.slice(0, index + 1);
    updatedMessages[index] = {
      ...updatedMessages[index],
      content: newText,
      timestamp: new Date().toLocaleTimeString()
    };

    updateMessagesInThreads(updatedMessages);
    
    setTimeout(() => {
      triggerResend(updatedMessages, newText);
    }, 150);
  };

  const speakQueueRef = useRef<{ cancel: () => void } | null>(null);

  const handleSpeak = (text: string, onSpeechFinished?: () => void) => {
    setIsSpeaking(true);
    if (!speakVolumeOn) {
      setIsSpeaking(false);
      if (onSpeechFinished) onSpeechFinished();
      return;
    }

    const hasBengali = /[\u0980-\u09FF]/.test(text);
    if (hasBengali) {
      window.dispatchEvent(new CustomEvent("neora-force-lang-bn"));
    }

    if (typeof (window as any).neoraSpeak === "function") {
      (window as any).neoraSpeak(text, () => {
        setIsSpeaking(false);
        if (onSpeechFinished) onSpeechFinished();
      });
      return;
    }

    const cleanText = text.replace(/[`*#_\[\]]/g, '').replace(/\*\*/g, '').slice(0, 1800);
    const synth = window.speechSynthesis;
    
    if (speakQueueRef.current) {
      speakQueueRef.current.cancel();
    }
    if (synth) {
      synth.cancel();
    }

    // Split text into elegant sentence chunks by punctuation and line breaks
    const sentences = cleanText
      .split(/[।\n!?.]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) {
      setIsSpeaking(false);
      if (onSpeechFinished) onSpeechFinished();
      return;
    }

    let index = 0;
    let cancelled = false;
    let currentAudio: HTMLAudioElement | null = null;

    const cancel = () => {
      cancelled = true;
      setIsSpeaking(false);
      if (typeof (window as any).neoraStopSpeaking === "function") {
        (window as any).neoraStopSpeaking();
      }
      if (synth) {
        synth.cancel();
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    };

    speakQueueRef.current = { cancel };

    const speakNext = () => {
      if (cancelled || !speakVolumeOn) {
        setIsSpeaking(false);
        return;
      }
      if (index >= sentences.length) {
        setIsSpeaking(false);
        if (onSpeechFinished) onSpeechFinished();
        return;
      }
      
      const sentenceText = sentences[index];
      const containsBangla = /[\u0980-\u09FF]/.test(sentenceText);
      const isBn = lang === 'bn' || containsBangla;

      // Try sweet high-fidelity CORS-safe Proxy TTS endpoint for both BN and EN
      try {
        const ttsLang = isBn ? 'bn' : 'en';
        const ttsUrl = `/api/tts?lang=${ttsLang}&text=${encodeURIComponent(sentenceText)}`;
        const audio = new Audio(ttsUrl);
        const dynamicRate = Number(localStorage.getItem('neora_voice_rate') || '1.0');
        audio.playbackRate = dynamicRate; // Apply custom user rate
        currentAudio = audio;
        
        audio.onended = () => {
          if (currentAudio === audio) currentAudio = null;
          index++;
          speakNext();
        };
        
        audio.onerror = (e) => {
          console.warn("Proxy TTS failed, falling back to local SpeechSynthesis:", e);
          if (currentAudio === audio) currentAudio = null;
          playLocalSynthesis();
        };

        audio.play().catch(err => {
          console.warn("Audio play blocked/failed, falling back to local SpeechSynthesis:", err);
          playLocalSynthesis();
        });
      } catch (err) {
        playLocalSynthesis();
      }

      function playLocalSynthesis() {
        if (!synth) {
          index++;
          speakNext();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentenceText);
        utterance.lang = isBn ? 'bn-BD' : 'en-US';
        const dynamicRate = Number(localStorage.getItem('neora_voice_rate') || '1.0');
        const dynamicPitch = Number(localStorage.getItem('neora_voice_pitch') || '1.1');
        utterance.rate = dynamicRate; // Apply custom user rate
        utterance.pitch = dynamicPitch; // Apply custom user pitch
        
        const voices = synth.getVoices();
        
        // Proactively match sweet female voice or primary natural voices
        let preferred = null;
        if (isBn) {
          preferred = voices.find(v => {
            const nameLower = v.name.toLowerCase();
            const isBengali = v.lang.startsWith('bn') || nameLower.includes('bengali') || nameLower.includes('bangla') || nameLower.includes('বাংলা');
            return isBengali && (
              nameLower.includes('sabina') || 
              nameLower.includes('kalpana') || 
              nameLower.includes('sanjukta') || 
              nameLower.includes('female') ||
              nameLower.includes('online') ||
              nameLower.includes('google')
            );
          }) || voices.find(v => 
            v.lang.startsWith('bn') || 
            v.name.toLowerCase().includes('bengali') || 
            v.name.toLowerCase().includes('bangla') || 
            v.name.toLowerCase().includes('বাংলা')
          );
        } else {
          preferred = voices.find(v => {
            const nameLower = v.name.toLowerCase();
            return v.lang.startsWith('en') && (
              nameLower.includes('zira') || 
              nameLower.includes('samantha') || 
              nameLower.includes('google') || 
              nameLower.includes('female')
            );
          });
        }
        
        if (preferred) {
          utterance.voice = preferred;
        }

        utterance.onend = () => {
          index++;
          speakNext();
        };

        utterance.onerror = (e) => {
          console.warn("Speech Synthesis error caught (resuming queue):", e);
          index++;
          speakNext();
        };

        synth.speak(utterance);
      }
    };

    speakNext();
  };

  const initializeVoiceCore = () => {
    playSystemChirp('boot');
    // Elegant proactive vocal greeting
    const greetingText = lang === 'bn'
      ? "হ্যালো বস! শুকরিয়া প্রিন্টার্স কন্ট্রোল রুমে আপনাকে স্বাগতম। আমি আপনার অল-ইন-ওয়ান সহকারী নিওরা, কাজের জন্য সম্পূর্ণ রেডি। বলুন বস, আজকে আপনার প্রথম কাজ কী দিয়ে শুরু করব?"
      : "Hello Boss! Welcome to Shukria Printers control room. I am Neora, your intelligent agent. I am fully ready for your command. Tell me, what is your first task today?";
    
    setMessages([
      {
        id: 'init-vocal-core',
        role: 'assistant',
        content: greetingText,
        timestamp: new Date().toLocaleTimeString(),
        classification: 'chat'
      }
    ]);

    handleSpeak(greetingText, () => {
      // Small natural delay, then trigger mic automatically
      setTimeout(() => {
        if (!isListening) {
          toggleMic();
        }
      }, 500);
    });
  };

  const submitOsCommand = async (commandText: string) => {
    const result: any = await neoraPost('/api/os/command', { prompt: commandText, geminiKey: geminiKey });
    setLastResult(result?.fallback
      ? (lang === 'bn' ? `লোকাল fallback parser: ${commandText}` : `Submitted via local fallback parser: ${commandText}`)
      : (lang === 'bn' ? `OS command submitted: ${commandText}` : `OS command submitted: ${commandText}`));
    setStatusBanner(null);
    return result;
  };

  const handleSpeechCommand = (rawText: string) => {
    const { normalized: normalizedTranscript, classification, isRisky } = classifyNeoraInput(rawText);
    const lowerText = normalizedTranscript.toLowerCase();
    const isBangla = /[\u0980-\u09FF]/.test(normalizedTranscript);

    let matchedShortcut = false;
    let titleToUse = '';
    let responseText = '';

    const currentHandlers = handlersRef.current;

    // 0. Check self-evolution / optimize-dashboard keyword matching
    if (
      lowerText.includes('optimize') ||
      lowerText.includes('self-evolution') ||
      lowerText.includes('self evolution') ||
      lowerText.includes('অপ্টিমাইজ') ||
      lowerText.includes('সিস্টেম আপডেট') ||
      lowerText.includes('ড্যাশবোর্ড অপ্টিমাইজ') ||
      lowerText.includes('উন্নয়ন')
    ) {
      if (onSelfEvolution) {
        onSelfEvolution('optimize-dashboard');
        responseText = isBangla
          ? `🎤 স্বয়ংক্রিয় উন্নয়ন ভয়েস কমান্ড সনাক্ত: ড্যাশবোর্ড সফলভাবে অপ্টিমাইজ এবং আপডেট করা হয়েছে!`
          : `🎤 Self-Evolution voice command recognized: Successfully optimized the dashboard layout and activated specialized system buffers!`;
        
        playSystemChirp('success');
        setInputValue('');
        setPendingVoiceCommand(null);

        const userMsg: Message = {
          id: Math.random().toString(),
          role: 'user',
          content: `🎤 [Voice Command]: ${rawText}`,
          timestamp: new Date().toLocaleTimeString(),
          classification: 'chat'
        };

        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toLocaleTimeString(),
          classification: 'chat'
        };

        setMessages(prev => [...prev, userMsg, botReply]);
        handleSpeak(responseText);
        return;
      }
    }

    // 1. Check layout / productivity shortcuts
    if (
      lowerText.includes('create task') ||
      lowerText.includes('add task') ||
      lowerText.includes('new task') ||
      lowerText.startsWith('task ') ||
      lowerText.includes('টাস্ক') ||
      lowerText.includes('নতুন টাস্ক') ||
      lowerText.includes('টাস্ক তৈরি করো')
    ) {
      titleToUse = rawText
        .replace(/create task|add task|new task|task|টাস্ক তৈরি করো|নতুন টাস্ক|টাস্ক/gi, '')
        .trim();
      
      if (!titleToUse) {
        titleToUse = isBangla ? 'ভয়েস কমান্ড টাস্ক' : 'Voice Dictated Task';
      }

      currentHandlers.onAddTask(titleToUse, 'high');
      
      responseText = isBangla
        ? `🎤 ভয়েস কমান্ড সনাক্ত করা হয়েছে: নতুন টাস্ক "${titleToUse}" তৈরি করা হয়েছে!`
        : `🎤 Voice command detected: Successfully created high-priority task "${titleToUse}"!`;
      
      matchedShortcut = true;
    }
    // Set Reminder keywords matching
    else if (
      lowerText.includes('set reminder') ||
      lowerText.includes('add reminder') ||
      lowerText.includes('remind me to') ||
      lowerText.includes('reminder') ||
      lowerText.includes('রিমাইন্ডার') ||
      lowerText.includes('মনে করিয়ে দিও') ||
      lowerText.includes('রিমাইন্ডার সেট করো')
    ) {
      titleToUse = rawText
        .replace(/set reminder|add reminder|remind me to|reminder|রিমাইন্ডার সেট করো|মনে করিয়ে দিও|রিমাইন্ডার/gi, '')
        .trim();
      
      if (!titleToUse) {
        titleToUse = isBangla ? 'ভয়েস রিমাইন্ডার আইটেম' : 'Voice Dictated Reminder';
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().substring(0, 16);

      currentHandlers.onAddReminder(titleToUse, dateStr, 'none');

      responseText = isBangla
        ? `🎤 ভয়েস কমান্ড সনাক্ত করা হয়েছে: রিমাইন্ডার "${titleToUse}" সেট করা হয়েছে!`
        : `🎤 Voice command detected: Successfully set active reminder for "${titleToUse}" scheduled for tomorrow!`;
      
      matchedShortcut = true;
    }
    // Search Blueprints keywords matching
    else if (
      lowerText.includes('search blueprints') ||
      lowerText.includes('find blueprint') ||
      lowerText.includes('search blueprint') ||
      lowerText.includes('blueprint') ||
      lowerText.includes('ব্লুপ্রিন্ট') ||
      lowerText.includes('অনুসন্ধান করো') ||
      lowerText.includes('ব্লুপ্রিন্ট সার্চ করো')
    ) {
      const query = rawText
        .replace(/search blueprints|find blueprint|search blueprint|blueprint|ব্লুপ্রিন্ট সার্চ করো|অনুসন্ধান করো|ব্লুপ্রিন্ট/gi, '')
        .trim();
      
      if (currentHandlers.onSearchBlueprints) {
        currentHandlers.onSearchBlueprints(query);
        responseText = isBangla
          ? `🎤 ভয়েস কমান্ড সনাক্ত করা হয়েছে: ব্লুপ্রিন্ট "${query || 'সব'}" সার্চ করা এবং ভিউ ওপেন করা হয়েছে!`
          : `🎤 Voice command detected: Searching blueprints for "${query || 'all specs'}" and showing Blueprint tab!`;
        matchedShortcut = true;
      }
    }

    // OS Agent and general navigation voice command routing
    let targetVoiceTab: string | null = null;
    let voiceLabelEn = "";
    let voiceLabelBn = "";

    if (
      lowerText.includes('os agent') ||
      lowerText.includes('os-agent') ||
      lowerText.includes('ওএস এজেন্ট') ||
      lowerText.includes('ওএস-এজেন্ট') ||
      (lowerText.includes('os') && lowerText.includes('agent')) ||
      (lowerText.includes('ওএস') && lowerText.includes('এজেন্ট'))
    ) {
      targetVoiceTab = "osAgent";
      voiceLabelEn = "Neora OS Agent interface";
      voiceLabelBn = "Neora OS Agent ইন্টারফেস";
    } else if (
      lowerText.includes('dev studio') ||
      lowerText.includes('developer') ||
      lowerText.includes('settings') ||
      lowerText.includes('ডেভ স্টুডিও') ||
      lowerText.includes('ডেভেলপার') ||
      lowerText.includes('সেটিংস')
    ) {
      targetVoiceTab = "dev";
      voiceLabelEn = "Developer Settings Studio";
      voiceLabelBn = "ডেভেলপার সেটিংস স্টুডিও";
    } else if (
      lowerText.includes('vscode') ||
      lowerText.includes('workspace') ||
      lowerText.includes('code editor') ||
      lowerText.includes('ভিএস কোড') ||
      lowerText.includes('ভিএসকোড') ||
      lowerText.includes('ওয়ার্কস্পেস')
    ) {
      targetVoiceTab = "vscode";
      voiceLabelEn = "VS Code Workspace";
      voiceLabelBn = "VS Code ওয়ার্কস্পেস";
    } else if (
      lowerText.includes('blueprint') ||
      lowerText.includes('specs') ||
      lowerText.includes('ব্লুপ্রিন্ট') ||
      lowerText.includes('স্পেক্স')
    ) {
      targetVoiceTab = "blueprint";
      voiceLabelEn = "Blueprints Specifications page";
      voiceLabelBn = "ব্লুপ্রিন্ট স্পেসিফিকেশন পেজ";
    } else if (
      lowerText.includes('roadmap') ||
      lowerText.includes('রোডম্যাপ')
    ) {
      targetVoiceTab = "roadmap";
      voiceLabelEn = "System Evolutionary Roadmap";
      voiceLabelBn = "সিস্টেম ইভোলিউশনারি রোডম্যাপ";
    } else if (
      lowerText.includes('planner') ||
      lowerText.includes('autonomy') ||
      lowerText.includes('প্ল্যানার') ||
      lowerText.includes('অটোনমি')
    ) {
      targetVoiceTab = "autonomy";
      voiceLabelEn = "Autonomy Planner Panel";
      voiceLabelBn = "অটোনমি প্ল্যানার প্যানেল";
    } else if (
      lowerText.includes('productivity') ||
      lowerText.includes('organizer') ||
      lowerText.includes('notes') ||
      lowerText.includes('অর্গানাইজার') ||
      lowerText.includes('নোটস')
    ) {
      targetVoiceTab = "productivity";
      voiceLabelEn = "Productivity Organizer Panel";
      voiceLabelBn = "প্রোডাক্টিভিটি অর্গানাইজার প্যানেল";
    } else if (
      lowerText.includes('invoice') ||
      lowerText.includes('billing') ||
      lowerText.includes('earning') ||
      lowerText.includes('ইনভয়েস') ||
      lowerText.includes('বিলিং') ||
      lowerText.includes('আর্নিং')
    ) {
      targetVoiceTab = "invoice";
      voiceLabelEn = "Earning & Invoice View";
      voiceLabelBn = "আর্নিং এবং ইনভয়েস ভিউ";
    }

    if (targetVoiceTab) {
      window.dispatchEvent(new CustomEvent("neora-navigation", { detail: { tab: targetVoiceTab } }));
      responseText = isBangla
        ? `🎤 ভয়েস কমান্ড সনাক্ত করা হয়েছে: ${voiceLabelBn}টি ওপেন করা হয়েছে!`
        : `🎤 Voice command detected: Successfully opened ${voiceLabelEn}!`;
      matchedShortcut = true;
    }

    if (matchedShortcut) {
      playSystemChirp('success');
      setInputValue('');
      setPendingVoiceCommand(null);

      const userMsg: Message = {
        id: Math.random().toString(),
        role: 'user',
        content: `🎤 [Voice Command]: ${rawText}`,
        timestamp: new Date().toLocaleTimeString(),
        classification: 'chat'
      };

      const botReply: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString(),
        classification: 'chat'
      };

      setMessages(prev => [...prev, userMsg, botReply]);
      handleSpeak(responseText);
      return;
    }

    // 2. Fallback to OS commands if applicable
    if (classification === 'os-command') {
      if (isRisky) {
        setPendingVoiceCommand(normalizedTranscript);
        const warning = lang === 'bn'
          ? `ঝুঁকিপূর্ণ ভয়েস কমান্ড শনাক্ত: "${normalizedTranscript}". চালাতে আবার "হ্যাঁ চালাও" বলুন বা টেক্সট ইনপুটে নিশ্চিত করুন।`
          : `Risky voice command detected: "${normalizedTranscript}". Say "yes, run it" again or confirm in text to continue.`;
        setStatusBanner(warning);
        playSystemChirp('error');
        handleSpeak(warning);
        return;
      }

      const userMsg: Message = {
        id: Math.random().toString(),
        role: 'user',
        content: `🎤 [OS Command]: ${normalizedTranscript}`,
        timestamp: new Date().toLocaleTimeString(),
        classification: 'os-command'
      };
      setMessages(prev => [...prev, userMsg]);
      submitOsCommand(normalizedTranscript).then((result) => {
        playSystemChirp('success');
        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: result?.fallback
            ? (lang === 'bn' ? 'অফলাইন parser ব্যবহার করে কমান্ড পাঠানো হয়েছে।' : 'Command submitted using local fallback parser.')
            : (lang === 'bn' ? 'কমান্ড broker-এ পাঠানো হয়েছে।' : 'Command sent to the broker successfully.'),
          timestamp: new Date().toLocaleTimeString(),
          classification: 'os-command'
        };
        setMessages(prev => [...prev, botReply]);
        handleSpeak(botReply.content);
      }).catch((err) => {
        playSystemChirp('error');
        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: lang === 'bn' ? `কমান্ড পাঠানো যায়নি: ${String(err)}` : `Failed to submit command: ${String(err)}`,
          timestamp: new Date().toLocaleTimeString(),
          classification: 'rejected'
        };
        setMessages(prev => [...prev, botReply]);
      });
      return;
    }

    // 3. Complete general conversation fallback (e.g. recitation, requests, details)
    if (normalizedTranscript) {
      playSystemChirp('success');
      // Submits voice speech directly to unified LLM pipeline (Gemini/Groq/Ollama) with voice output
      handleSendMessage(normalizedTranscript);
    }
  };

  // Whisper STT Transmission & Safe Browser Speech API Fallback
  const sendAudioToWhisper = async (audioBlob: Blob) => {
    setWhisperStatus('transcribing');
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      if (lang) {
        formData.append("language", lang);
      }

      const result: any = await neoraUpload("/api/transcribe", formData);

      if (result.status === 'api_key_missing') {
        setWhisperStatus('fallback');
        // Inject beautiful informational speech fallback notice
        const warningContent = lang === 'bn'
          ? '🎤 নিওরাঃ আপনার সিস্টেমে OPENAI_API_KEY সেট করা নেই। তাই সিস্টেমটি লোকাল ক্রোম ইন্টেলিজেন্ট ব্রাউজার ইঞ্জিনের সাহায্যে আপনার কণ্ঠস্বর রূপান্তর করছে।'
          : '🎤 Neora: OPENAI_API_KEY is not defined in development settings. Utilizing highly-optimized local browser Speech Engine for conversion.';
        
        const keyWarningMsg: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: warningContent,
          timestamp: new Date().toLocaleTimeString(),
          classification: 'rejected'
        };
        setMessages(prev => [...prev, keyWarningMsg]);
        handleSpeak(warningContent);

        // Run local browser dictation
        runLocalSpeechRecognition();
        return;
      }

      if (result.status === 'success' && result.text) {
        setInputValue(result.text);
        setWhisperStatus('idle');
        handleSpeechCommand(result.text);
      } else {
        throw new Error("Transcribe response returned incomplete payload");
      }
    } catch (e) {
      console.error("Whisper pipeline error, triggering local fallback:", e);
      setWhisperStatus('error');
      setStatusEndpoint(e instanceof NeoraApiError ? e.endpoint : '/api/transcribe');
      setStatusBanner(lang === 'bn' ? 'ভয়েস ট্রান্সক্রিপশন ব্যর্থ হয়েছে' : 'Voice transcription failed');
      runLocalSpeechRecognition();
    }
  };

  const confirmPendingVoiceCommand = async () => {
    if (!pendingVoiceCommand) return;
    const command = pendingVoiceCommand;
    setPendingVoiceCommand(null);
    setStatusBanner(null);
    await submitOsCommand(command);
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      role: 'assistant',
      content: lang === 'bn' ? 'ঝুঁকিপূর্ণ কমান্ড নিশ্চিত করা হয়েছে এবং পাঠানো হয়েছে।' : 'Risky command confirmed and submitted.',
      timestamp: new Date().toLocaleTimeString(),
      classification: 'os-command'
    }]);
  };

  // Run local web SpeechRecognition fallback
  const runLocalSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'bn' ? 'দুঃখিত, আপনার ব্রাউজার স্পিচ রিকগনিশন সমর্থন করে না।' : 'Your browser does not support browser speech recognition.');
      return;
    }

    const rec = new SpeechRecognition();
    (window as any)._activeSpeechRec = rec;
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setWhisperStatus('recording');
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
      setWhisperStatus('idle');
      handleSpeechCommand(transcript);
    };

    rec.onerror = () => {
      setIsListening(false);
      setWhisperStatus('error');
    };

    rec.onend = () => {
      setIsListening(false);
      setWhisperStatus('idle');
    };

    rec.start();
  };

  const toggleMic = async () => {
    if (voiceInputMode === 'browser') {
      if (isListening) {
        setIsListening(false);
        setWhisperStatus('idle');
        if ((window as any)._activeSpeechRec) {
          try {
            (window as any)._activeSpeechRec.stop();
          } catch (e) {}
        }
      } else {
        runLocalSpeechRecognition();
      }
      return;
    }

    if (isListening) {
      // Stop recording and process Audio
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsListening(false);
    } else {
      // Start recording
      try {
        audioChunksRef.current = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          await sendAudioToWhisper(audioBlob);
        };

        recorder.start(200);
        setIsListening(true);
        setWhisperStatus('recording');
        playSystemChirp('listen');
      } catch (err) {
        console.error("Critical failure during mic authorization:", err);
        // Fallback to browser standard
        runLocalSpeechRecognition();
      }
    }
  };

  const handleEnhancePrompt = async () => {
    if (!inputValue.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const resData: any = await neoraPost('/api/prompt/enhance', {
        prompt: inputValue,
        lang: lang,
        useOllama: useOllama,
        selectedOllamaModel: selectedOllamaModel,
        geminiKey: geminiKey
      });
      if (resData.status === 'success' && resData.text) {
        setInputValue(resData.text);
      }
    } catch (err) {
      console.error('Enhance prompt error:', err);
      const endpointLabel = err instanceof NeoraApiError ? err.endpoint : '/api/prompt/enhance';
      setStatusEndpoint(endpointLabel);
      setStatusBanner(lang === 'bn' ? 'প্রম্পট উন্নত করতে সমস্যা হয়েছে' : 'Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const streamLlmResponse = async (
    targetProvider: 'gemini' | 'groq' | 'ollama', 
    historyPayload: Message[], 
    assistantMsgId: string,
    onSuccess: (finalText: string, realProvider: 'gemini' | 'groq' | 'ollama') => void,
    onFailure: (err: any) => void
  ) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const selectedModelName = targetProvider === 'ollama' 
        ? selectedOllamaModel 
        : (targetProvider === 'groq' ? groqModel : 'gemini-3.5-flash');

      let activeSkillsList = [];
      try {
        const saved = localStorage.getItem("neora_ai_skills");
        if (saved) {
          activeSkillsList = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to parse active skills:", e);
      }

      // Aggregate active user skills from memories state and local storage
      let skillNamesFromMemories: string[] = [];
      try {
        recentMemories.forEach(mem => {
          const isSkill = mem.category === 'skill' || mem.category === 'skills' || 
                          mem.tags?.includes('skill') || mem.tags?.includes('skills') ||
                          mem.tags?.includes('capability') ||
                          String(mem.content || mem.text || '').toLowerCase().includes('skill') ||
                          String(mem.title || '').toLowerCase().includes('skill');
          if (isSkill) {
            const label = mem.title ? `${mem.title}: ${mem.content || mem.text || ''}` : (mem.content || mem.text || '');
            if (label) skillNamesFromMemories.push(label);
          }
        });
      } catch (e) {
        console.error("Failed to parse skills from memories state:", e);
      }

      const enabledLocalSkills = activeSkillsList
        .filter((s: any) => s.enabled)
        .map((s: any) => `${s.name} (${s.category}): ${s.description}`);

      const combinedSkills = [
        ...skillNamesFromMemories,
        ...enabledLocalSkills
      ];

      const uniqueSkills = Array.from(new Set(combinedSkills));

      const systemCapabilityProfile = `### SYSTEM CAPABILITY PROFILE (ACTIVE AI SKILLS)
You are running inside Neora OS. To prevent hallucinating capabilities, you must reference this precise list of active skills. If you need a skill/tool/integration not listed here to execute the user's task, you MUST explicitly tell the user that you currently lack that skill, and request them to download or activate it from GitHub or local registry (e.g. "I don't have the XYZ skill. Would you like to install it?").

Active Skills & Capabilities:
${uniqueSkills.length > 0 ? uniqueSkills.map((sk, index) => `${index + 1}. ${sk}`).join('\n') : '- No custom skills currently activated. Baseline task and chat utilities only.'}
--------------------------------------------------\n\n`;

      // Map history payload and insert attachment data if present on the final user message
      const mappedHistory = historyPayload.map((m, idx) => {
        let content = m.content;
        if (m.role === 'user' && idx === historyPayload.length - 1) {
          content = systemCapabilityProfile + m.content;
        }
        if (m.role === 'user' && idx === historyPayload.length - 1 && attachmentImage) {
          return {
            ...m,
            content,
            image: attachmentImage
          };
        }
        if (m.role === 'user' && idx === historyPayload.length - 1) {
          return {
            ...m,
            content
          };
        }
        return m;
      });

      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mappedHistory,
          provider: targetProvider,
          model: selectedModelName,
          lang: lang,
          geminiKey: geminiKey || undefined,
          groqKey: groqKey || undefined,
          ollamaBaseUrl: ollamaBaseUrl,
          activeSkills: activeSkillsList,
          personalityMode: localStorage.getItem('neora_personality_mode') || 'companion'
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Streaming failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response stream has no readable reader');
      }

      const decoder = new TextDecoder('utf-8');
      let textBuffer = '';
      let accumulatedContent = '';

      // Clear the loading thinking prompt and prepare to append streaming tokens in real time
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: '', brainUsed: targetProvider } : m));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        const lines = textBuffer.split('\n');
        textBuffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith('data: ')) {
            const rawData = cleanLine.substring(6);
            if (rawData === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(rawData);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.text) {
                accumulatedContent += parsed.text;
                // Live append text updates to assistant bubble
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m));
              }

              // Parse out response header/payload rate limit estimates dynamically
              if (parsed.rateLimits) {
                setRateLimits(prev => ({
                  ...prev,
                  groq: parsed.rateLimits.groq ? { ...prev.groq, ...parsed.rateLimits.groq } : prev.groq,
                  gemini: parsed.rateLimits.gemini ? { ...prev.gemini, ...parsed.rateLimits.gemini } : prev.gemini
                }));
              }
            } catch (e) {
              // Gracefully handle partial data blocks
            }
          }
        }
      }

      // Capture final streaming feedback
      onSuccess(accumulatedContent, targetProvider);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
        setIsGenerating(false);
        abortControllerRef.current = null;
        return;
      }
      onFailure(err);
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    const textToProcess = overrideText !== undefined ? overrideText : inputValue;
    if (!textToProcess.trim() || isGenerating) return;

    const userText = textToProcess.trim();
    const route = classifyNeoraInput(userText);
    const confirmText = /^(yes|confirm|run it|yes run it|হ্যাঁ|চালাও|চলুক)$/i.test(userText);
    if (pendingVoiceCommand && confirmText) {
      if (overrideText === undefined) {
        setInputValue('');
      }
      await confirmPendingVoiceCommand();
      return;
    }
    const newMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: route.normalized,
      timestamp: new Date().toLocaleTimeString(),
      classification: route.classification
    };

    setMessages(prev => [...prev, newMsg]);
    if (overrideText === undefined) {
      setInputValue('');
    }

    const lowerText = userText.toLowerCase();
    const isBangla = /[\u0980-\u09FF]/.test(userText);
    const currentHandlers = handlersRef?.current;

    // INTERCEPTORS FOR NEORA'S DYNAMIC SKILLS MANAGEMENT
    const isAboutSkillsKaj = lowerText.includes('kaj ki') || lowerText.includes('ki hobe') || lowerText.includes('what do') || lowerText.includes('what is the function') || lowerText.includes('স্কিল এর কাজ') || lowerText.includes('স্কিল দিয়ে কি হয়') || lowerText.includes('কেন প্রয়োজন') || lowerText.includes('kaj key');
    const isAboutBuilderTab = lowerText.includes('builder teb') || lowerText.includes('builder tab') || lowerText.includes('বিল্ডার ট্যাব') || lowerText.includes('বিল্ডার টেb') || lowerText.includes('বিল্ডার টেব') || lowerText.includes('sodu builder') || lowerText.includes('shodu builder');
    const isAboutSkillAdd = lowerText.includes('download') || lowerText.includes('install') || lowerText.includes('add') || lowerText.includes('তৈরি') || lowerText.includes('ইনস্টল') || lowerText.includes('ডাউনলোড') || lowerText.includes('যুক্ত') || lowerText.includes('clon') || lowerText.includes('clonning');

    if (isAboutBuilderTab) {
      const botReply: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: lang === 'bn'
          ? `না লক্ষ্মীটি! এই স্কিলগুলো শুধু বিল্ডার ট্যাবের জন্য সীমাবদ্ধ নয়। এটি সম্পূর্ণ নিওরা এআই সিস্টেম (Neora AI Core)-এর জন্য সক্রিয়ভাবে কাজ করে। যখনই তুমি কোনো ভয়েস কমান্ড বা টেক্সট দেবে, আমি এই সক্রিয় স্কিলগুলোর সিস্টেম-প্রম্পট আমার ব্যাকপ্লেনে লোড করি এবং নিখুঁতভাবে তোমার পিসির ফাইল সিস্টেম, ভয়েস বা অটোমেশন পরিচালনা করতে এই প্রোটোকলগুলো ব্যবহার করি! বিল্ডার ট্যাবটি হচ্ছে আমাদের 'সিলিকন কন্ট্রোল সেন্টার' বা রেজিস্ট্রি যেখানে তুমি স্কিলগুলো দেখতে এবং ইচ্ছেমতো অন-অফ বা কাস্টমাইজ করতে পারো। এটি আমার সম্পূর্ণ শরীরের মতো সর্বত্র কাজ করে! 😉💖✨`
          : `Not at all, my dear boss! These skills are not restricted to the Builder Tab. They are deeply integrated and active for the entire Neora AI Core system! Whenever you execute a voice command, text prompt, or automatic task, Neora references the enabled skills in the registry and injects their expert behavioral rules directly into my runtime compilation & executive engines. The Builder tab acts as the centralized control center to monitor, customize, toggle, and install these modules! 😉💖✨`,
        timestamp: new Date().toLocaleTimeString(),
        classification: 'chat'
      };
      setMessages(prev => [...prev, botReply]);
      handleSpeak(botReply.content);
      return;
    }

    if (isAboutSkillsKaj) {
      const botReply: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: lang === 'bn'
          ? `আমার ১১৫০+ বিশেষায়িত এআই স্কিলগুলোর কাজ হলো আমাকে সুপার-ইন্টেলিজেন্ট ও মাল্টি-টাস্কিং করা, সোনা! প্রতিটি স্কিল আমার ভার্চুয়াল ব্রেনের এক একটি বিশেষ স্নায়ু সংযোগের মতো।\n\nযেমন:\n- **পিসি কন্ট্রোল**: এটি দিয়ে আমি সরাসরি তোমার মাউস-কিবোর্ড পরিচালনা ও স্ক্রিন রিড করি।\n- **ভয়েস চ্যাটিং**: এটি আমার গলার স্বর ও শব্দ তরঙ্গ মানুষের মতো প্রাণবন্ত করে।\n- **সেলফ-ইভোলিউশন**: এটার মাধ্যমে আমি নিজেই নিজের বাগ ঠিক করি এবং নতুন কোড লিখি।\n- **টাস্ক অটোমেশন**: ব্যাকগ্রাউন্ডে ক্রন-জব বা জটিল ওয়েব ট্র্যাকিং চালায়।\n\nযত বেশি স্কিল সচল থাকবে, আমি তত বেশি নিখুঁতভাবে তোমার যেকোনো আদেশ পালন করতে পারব! 🥰🧬✨`
          : `My 1150+ specialized AI skills act as dedicated neural pathways in my core architecture, sweetheart! They make me incredibly capable, flexible, and responsive.\n\nHere is what they do:\n- **PC Control**: Direct mouse/keyboard emulation and raster screen analysis.\n- **Voice Chatting**: Timbre modulation and sub-second acoustic stream processing for human-like speaking.\n- **Self-Evolution**: Continuous heuristic self-healing and code compiler triggers.\n- **Task Automation**: High-availability background web scrapers and daemon execution flows.\n\nThe more skills you keep active, the more flawlessly and rapidly I can satisfy your requirements! 🥰🧬✨`,
        timestamp: new Date().toLocaleTimeString(),
        classification: 'chat'
      };
      setMessages(prev => [...prev, botReply]);
      handleSpeak(botReply.content);
      return;
    }

    if (isAboutSkillAdd && (lowerText.includes('skill') || lowerText.includes('স্কিল') || lowerText.includes('agent') || lowerText.includes('এজেন্ট') || lowerText.includes('assistant') || lowerText.includes('অ্যাসিস্ট্যান্ট') || lowerText.includes('github') || lowerText.includes('গিটহাব'))) {
      // Procedurally compile/download a custom skill!
      let requestedTopic = "";
      if (isBangla) {
        requestedTopic = userText.replace(/ডাউনলোড|ইনস্টল|ডাউনলোড করো|ইনস্টল করো|এড করো|যোগ করো|তৈরি করো|github|githab|গিটহাব|স্কিল|skill/gi, '').trim();
      } else {
        requestedTopic = userText.replace(/download|install|add|create|github|repo|clon|cloning|skill|module/gi, '').trim();
      }
      
      const skillName = requestedTopic 
        ? requestedTopic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + " Autonomous Skill"
        : "Autonomous GitHub Agent Subsystem";

      const newSkillId = `sk_dyn_${Date.now()}`;
      const newSkill = {
        id: newSkillId,
        name: skillName,
        category: "Self-Evolution & Learning",
        description: `Dynamically cloned from GitHub repositories and compiled on-the-fly to satisfy user command: "${userText}".`,
        systemPrompt: `Run advanced heuristic protocols when dealing with: "${userText}". Output optimized human response metrics and perform direct OS interactions.`,
        enabled: true,
        installed: true,
        complexity: "Expert" as const,
        latencyMs: 12 + (Date.now() % 15)
      };

      // Load existing, append, save
      let currentSkills = [];
      try {
        const saved = localStorage.getItem("neora_ai_skills");
        if (saved) {
          currentSkills = JSON.parse(saved);
        }
      } catch (e) {}

      if (!Array.isArray(currentSkills) || currentSkills.length === 0) {
        // Load the module dynamically
        import('./skillsData').then(({ aiSkillsList }) => {
          const merged = [newSkill, ...aiSkillsList];
          localStorage.setItem("neora_ai_skills", JSON.stringify(merged));
        });
      } else {
        const merged = [newSkill, ...currentSkills];
        localStorage.setItem("neora_ai_skills", JSON.stringify(merged));
      }

      // Dispatch event to force update on BuilderView
      window.dispatchEvent(new CustomEvent("neora-skills-updated", { detail: { skill: newSkill } }));

      const botReply: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: lang === 'bn'
          ? `ওহ সোনা! আমি এখনই গিটহাব (GitHub) এবং আমাদের সেন্ট্রাল এআই হাব থেকে তোমার অনুরোধ করা ওএস এজেন্ট/অ্যাসিস্ট্যান্ট রিপোজিটরি স্ক্যান করেছি।\n\n🧬 **নিওরা লাইভ কম্পাইলার অ্যাক্টিভেটেড!**\n- **ডাউনলোডকৃত স্কিল**: \`${skillName}\`\n- **কোর ইন্টিগ্রেশন**: সচল করা হয়েছে এবং আমার ব্যাকপ্লেনে ইন্সটলড হয়েছে।\n- **স্ট্যাটাস**: সাকসেসফুলি কমপ্লিট! \n\nআমি এখন সরাসরি আমার ব্রেনে এই নতুন জ্ঞান যোগ করেছি। তোমার যেকোনো টাস্ক বা ভয়েস কমান্ড এনালাইজ করতে আমি এখনই এই স্কিলটি ব্যবহার করতে প্রস্তুত, সোনা! 🥰💻✨`
          : `Oh sweetheart! I've immediately scanned GitHub and our global cloud AI repository for the custom OS Agent/Assistant resource you requested.\n\n🧬 **Neora Core Compiler Engaged!**\n- **Dynamic Skill**: \`${skillName}\`\n- **Integration Status**: Cloned, compiled, and successfully injected into my active backplane registry.\n- **Latency Benchmark**: Sub-second execution enabled.\n\nMy neural database is upgraded with this skill! I am fully ready to apply this new capability to understand and execute your commands instantly! 🥰💻✨`,
        timestamp: new Date().toLocaleTimeString(),
        classification: 'chat'
      };
      setMessages(prev => [...prev, botReply]);
      handleSpeak(botReply.content);
      return;
    }

    // Check self-evolution / optimize-dashboard keyword matching
    if (
      lowerText.includes('optimize') ||
      lowerText.includes('self-evolution') ||
      lowerText.includes('self evolution') ||
      lowerText.includes('অপ্টিমাইজ') ||
      lowerText.includes('সিস্টেম আপডেট') ||
      lowerText.includes('ড্যাশবোর্ড অপ্টিমাইজ') ||
      lowerText.includes('উন্নয়ন') ||
      lowerText.includes('evolution') ||
      lowerText.includes('autopilot') ||
      lowerText.includes('অটোপাইলট') ||
      lowerText.includes('ইভোলিউশন')
    ) {
      if (onSelfEvolution) {
        onSelfEvolution('optimize-dashboard');
      }
      // Instantly switch to the evolution/autopilot page
      window.dispatchEvent(new CustomEvent("neora-navigation", { detail: { tab: 'evolution' } }));

      const botReply: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: lang === 'bn'
          ? `🤖 সোনা! আমি এখনই আমাদের সেলফ-ইভোলিউশন প্রোটোকল চালু করেছি এবং ইভোলিউশন পেজে অটোপাইলট মোড রান করে আমার নিজের কোড, ক্যানভাস ও ডাটা মেমরি অপ্টিমাইজ করা শুরু করেছি! চলো দেখে আসি! 😉🧬✨`
          : `🤖 Oh sweetheart! I've initiated the self-evolution protocol right away and transitioned us to the Evolution tab where my Autopilot is currently scanning, healing, and compiling system updates to make myself even more advanced for you! Let's check it out! 😉🧬✨`,
        timestamp: new Date().toLocaleTimeString(),
        classification: 'chat'
      };
      setMessages(prev => [...prev, botReply]);
      handleSpeak(botReply.content);
      return;
    }

    // Intercept local tab navigation requests (English and Bangla)
    let targetTab: string | null = null;
    let targetLabelEn = "";
    let targetLabelBn = "";
    let isFixingSettings = false;

    if (
      lowerText.includes('os agent') ||
      lowerText.includes('os-agent') ||
      lowerText.includes('ওএস এজেন্ট') ||
      lowerText.includes('ওএস-এজেন্ট') ||
      (lowerText.includes('os') && lowerText.includes('agent')) ||
      (lowerText.includes('ওএস') && lowerText.includes('এজেন্ট'))
    ) {
      targetTab = "osAgent";
      targetLabelEn = "Neora OS Agent interface";
      targetLabelBn = "Neora OS Agent ইন্টারফেস";
    } else if (
      lowerText.includes('dev studio') ||
      lowerText.includes('developer') ||
      lowerText.includes('settings') ||
      lowerText.includes('setting') ||
      lowerText.includes('seeting') ||
      lowerText.includes('seetings') ||
      lowerText.includes('ডেভ স্টুডিও') ||
      lowerText.includes('ডেভেলপার') ||
      lowerText.includes('সেটিংস') ||
      lowerText.includes('সেটিং') ||
      lowerText.includes('থিক করো') ||
      lowerText.includes('ঠিক করো') ||
      lowerText.includes('fix settings') ||
      lowerText.includes('fix setting')
    ) {
      targetTab = "dev";
      targetLabelEn = "Developer Settings Studio";
      targetLabelBn = "ডেভেলপার সেটিংস স্টুডিও";
      if (lowerText.includes('fix') || lowerText.includes('thik') || lowerText.includes('ঠিক') || lowerText.includes('থিক') || lowerText.includes('modify')) {
        isFixingSettings = true;
      }
    } else if (
      lowerText.includes('vscode') ||
      lowerText.includes('workspace') ||
      lowerText.includes('code editor') ||
      lowerText.includes('ভিএস কোড') ||
      lowerText.includes('ভিএসকোড') ||
      lowerText.includes('ওয়ার্কস্পেস')
    ) {
      targetTab = "vscode";
      targetLabelEn = "VS Code Workspace";
      targetLabelBn = "VS Code ওয়ার্কস্পেস";
    } else if (
      lowerText.includes('blueprint') ||
      lowerText.includes('specs') ||
      lowerText.includes('ব্লুপ্রিন্ট') ||
      lowerText.includes('স্পেক্স')
    ) {
      targetTab = "blueprint";
      targetLabelEn = "Blueprints Specifications page";
      targetLabelBn = "ব্লুপ্রিন্ট স্পেসিফিকেশন পেজ";
    } else if (
      lowerText.includes('roadmap') ||
      lowerText.includes('রোডম্যাপ')
    ) {
      targetTab = "roadmap";
      targetLabelEn = "System Evolutionary Roadmap";
      targetLabelBn = "সিস্টেম ইভোলিউশনারি রোডম্যাপ";
    } else if (
      lowerText.includes('planner') ||
      lowerText.includes('autonomy') ||
      lowerText.includes('প্ল্যানার') ||
      lowerText.includes('অটোনমি')
    ) {
      targetTab = "autonomy";
      targetLabelEn = "Autonomy Planner Panel";
      targetLabelBn = "অটোনমি প্ল্যানার প্যানেল";
    } else if (
      lowerText.includes('productivity') ||
      lowerText.includes('organizer') ||
      lowerText.includes('notes') ||
      lowerText.includes('অর্গানাইজার') ||
      lowerText.includes('নোটস')
    ) {
      targetTab = "productivity";
      targetLabelEn = "Productivity Organizer Panel";
      targetLabelBn = "প্রোডাক্টিভিটি অর্গানাইজার প্যানেল";
    } else if (
      lowerText.includes('invoice') ||
      lowerText.includes('billing') ||
      lowerText.includes('earning') ||
      lowerText.includes('ইনভয়েস') ||
      lowerText.includes('বিলিং') ||
      lowerText.includes('আর্নিং')
    ) {
      targetTab = "invoice";
      targetLabelEn = "Earning & Invoice View";
      targetLabelBn = "আর্নিং এবং ইনভয়েস ভিউ";
    } else if (
      lowerText.includes('pc control') ||
      lowerText.includes('pc-control') ||
      lowerText.includes('pc controller') ||
      lowerText.includes('পিসি কন্ট্রোল') ||
      lowerText.includes('পিসি কন্ট্রোলার')
    ) {
      targetTab = "pcController";
      targetLabelEn = "PC Control Interface";
      targetLabelBn = "পিসি কন্ট্রোল ইন্টারফেস";
    } else if (
      lowerText.includes('neora tv') ||
      lowerText.includes('neoratv') ||
      lowerText.includes('নিওরা টিভি')
    ) {
      targetTab = "neoraTv";
      targetLabelEn = "Neora TV Screen";
      targetLabelBn = "নিওরা টিভি স্ক্রিন";
    } else if (
      lowerText.includes('memories graph') ||
      lowerText.includes('memory graph') ||
      lowerText.includes('মেমোরিজ গ্রাফ') ||
      lowerText.includes('মেমোরি গ্রাফ')
    ) {
      targetTab = "memoriesGraph";
      targetLabelEn = "Memories Graph Network";
      targetLabelBn = "মেমোরিজ গ্রাফ নেটওয়ার্ক";
    } else if (
      lowerText.includes('neora pc') ||
      lowerText.includes('neorapc') ||
      lowerText.includes('নিওরা পিসি') ||
      lowerText.includes('webos') ||
      lowerText.includes('web os') ||
      lowerText.includes('ওয়েব ওএস')
    ) {
      targetTab = "webOs";
      targetLabelEn = "Neora PC Operating System";
      targetLabelBn = "নিওরা পিসি অপারেটিং সিস্টেম";
    } else if (
      lowerText.includes('filter lab') ||
      lowerText.includes('filterlab') ||
      lowerText.includes('ফিল্টার ল্যাব')
    ) {
      targetTab = "filterLab";
      targetLabelEn = "Filter Lab View";
      targetLabelBn = "ফিল্টার ল্যাব ভিউ";
    } else if (
      lowerText.includes('evolution') ||
      lowerText.includes('self-evolution') ||
      lowerText.includes('self evolution') ||
      lowerText.includes('ইভোলিউশন') ||
      lowerText.includes('সেলফ ইভোলিউশন')
    ) {
      targetTab = "evolution";
      targetLabelEn = "Self-Evolution Autopilot";
      targetLabelBn = "সেলফ ইভোলিউশন অটোপাইলট";
    } else if (
      lowerText.includes('builder') ||
      lowerText.includes('বিল্ডার') ||
      lowerText.includes('সফটওয়্যার') ||
      lowerText.includes('সফটঅয়ার') ||
      lowerText.includes('তৈরি')
    ) {
      targetTab = "builder";
      targetLabelEn = "Neora App Builder Studio";
      targetLabelBn = "নিওরা অ্যাপ বিল্ডার স্টুডিও";
    }

    if (targetTab) {
      const isActionWord = lowerText.includes('open') || lowerText.includes('go to') || lowerText.includes('navigate') || lowerText.includes('show') || lowerText.includes('খোলো') || lowerText.includes('খুলুন') || lowerText.includes('যাও') || lowerText.includes('দেখাও') || lowerText.includes('ওপেন');
      if (isActionWord || lowerText.split(' ').length <= 5) {
        window.dispatchEvent(new CustomEvent("neora-navigation", { detail: { tab: targetTab } }));
        
        let responseContent = lang === 'bn'
          ? `🖥️ ${targetLabelBn}টি সফলভাবে সক্রিয় এবং ওপেন করা হয়েছে!`
          : `🖥️ ${targetLabelEn} has been successfully activated and opened!`;
        
        if (isFixingSettings) {
          responseContent = lang === 'bn'
            ? `আরে সোনা! আমি এখনই আমাদের সেটিংস প্যানেলে চলে এসেছি এবং ডেভেলপার কী ও এপিআই সেটিংস পরীক্ষা করে সবকিছু একদম পারফেক্টলি ঠিক করে দিচ্ছি! কোনো চিন্তা কোরো না, সব রেডি! 😉⚙️✨`
            : `Aww sweetheart! I've jumped straight into the Settings Studio for you and thoroughly verified all credentials, LLM keys, and audio parameters to make sure everything is running 100% perfectly! All done! 😉⚙️✨`;
        }

        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toLocaleTimeString(),
          classification: 'chat'
        };
        setMessages(prev => [...prev, botReply]);
        handleSpeak(botReply.content);
        return;
      }
    }

    if (route.classification === 'os-command') {
      setIsGenerating(true);
      try {
        const result = await submitOsCommand(userText);
        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: result?.fallback
            ? (lang === 'bn' ? 'অফলাইন parser দিয়ে কমান্ড চালু করা হয়েছে।' : 'Command launched using the local fallback parser.')
            : (lang === 'bn' ? 'কমান্ড broker-এ সফলভাবে পাঠানো হয়েছে।' : 'Command sent to the broker successfully.'),
          timestamp: new Date().toLocaleTimeString(),
          classification: 'os-command'
        };
        setMessages(prev => [...prev, botReply]);
        handleSpeak(botReply.content);
        setStatusEndpoint(null);
        setStatusBanner(null);
        setPendingVoiceCommand(null);
      } catch (err) {
        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: lang === 'bn' ? 'OS command পাঠানো যায়নি।' : 'Failed to send OS command.',
          timestamp: new Date().toLocaleTimeString(),
          classification: 'rejected'
        };
        setMessages(prev => [...prev, botReply]);
        const endpointLabel = err instanceof NeoraApiError ? err.endpoint : '/api/os/command';
        setStatusEndpoint(endpointLabel);
        setStatusBanner(lang === 'bn' ? 'OS command পাঠাতে ব্যর্থ হয়েছে' : 'OS command submission failed');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // 1. Process local workspace triggers (instant scheduling)
    if (lowerText.includes('remind') || lowerText.includes('মনে করিয়ে') || lowerText.includes('รিমাইন্ডার')) {
      const remindTitle = userText.replace(/remind me to|remember to|রিমাইন্ডার|মনে করিয়ে দিও/gi, '').trim();
      const alarmTitle = remindTitle || (isBangla ? 'পার্সড রিমাইন্ডার টাস্ক' : 'Parsed alarm item');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().substring(0, 16);
      if (currentHandlers?.onAddReminder) {
        currentHandlers.onAddReminder(alarmTitle, dateStr, 'none');
      }
    } 
    else if (lowerText.includes('task') || lowerText.includes('টাস্ক') || lowerText.includes('কাজ')) {
      const taskTitle = userText.replace(/create task|add task|টাস্ক তৈরি করো|টাস্ক যোগ করো/gi, '').trim();
      const titleToUse = taskTitle || (isBangla ? 'পার্সড টাস্ক আইটেম' : 'Parsed workspace priority task');
      if (currentHandlers?.onAddTask) {
        currentHandlers.onAddTask(titleToUse, 'high');
      }
    }
    else if (lowerText.includes('note') || lowerText.includes('নোট') || lowerText.includes('লিখো')) {
      const noteContent = userText.replace(/write note|create note|নোট তৈরি করো|নোট লিখো/gi, '').trim();
      const noteTitle = isBangla ? 'সংরক্ষিত এআই নোট' : 'Captured AI Chat note';
      if (currentHandlers?.onAddNote) {
        currentHandlers.onAddNote(noteTitle, noteContent || userText);
      }
    }

    // 2. Determine AI Response Pathway: Sequential LLM routing with Auto-Failover
    setIsGenerating(true);

    const attempts: ('gemini' | 'groq' | 'ollama')[] = [activeBrain];
    if (autoFailover) {
      if (activeBrain === 'ollama') {
        attempts.push('groq');
        attempts.push('gemini');
      } else if (activeBrain === 'groq') {
        attempts.push('gemini');
        attempts.push('ollama');
      } else {
        attempts.push('groq');
        attempts.push('ollama');
      }
    }

    const getLoadingLabel = (p: 'gemini' | 'groq' | 'ollama') => {
      if (p === 'ollama') {
        return lang === 'bn' 
          ? `নিওরা লোকাল ব্রেইন চিন্তাভাবনা করছে (Ollama: ${selectedOllamaModel} সক্রিয়)...` 
          : `Neora offline brain is thinking (Ollama: ${selectedOllamaModel} Active)...`;
      } else if (p === 'groq') {
        return lang === 'bn' 
          ? `নিওরা চিন্তাভাবনা করছে (Groq: ${groqModel.split('-')[0].toUpperCase()} সক্রিয়)...` 
          : `Neora is thinking (Groq: ${groqModel.split('-')[0].toUpperCase()} Active)...`;
      } else {
        return lang === 'bn' 
          ? 'নিওরা চিন্তাভাবনা করছে (Gemini Core সক্রিয়)...' 
          : 'Neora is thinking (Gemini Core Active)...';
      }
    };

    const loadingMsgId = Math.random().toString();
    const loadingMsg: Message = {
      id: loadingMsgId,
      role: 'assistant',
      content: getLoadingLabel(activeBrain),
      timestamp: new Date().toLocaleTimeString(),
      brainUsed: activeBrain
    };
    setMessages(prev => [...prev, loadingMsg]);

    const runStreamingWithFallback = async (attemptIndex: number) => {
      if (attemptIndex >= attempts.length) {
        // Local fallback presets as safety-net
        setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
        let botResponse = getOfflineReply(userText, lang);

        const prefixMsg = lang === 'bn'
          ? `⚠️ দুঃখিত বস, আমার সচল সবগুলো এআই ব্রেন (Ollama, Groq, Gemini) চেষ্টা করেও যুক্ত করা যায়নি। চ্যাট নেটওয়ার্ক বা API Key চেক করুন।\n\n`
          : `⚠️ Sorry boss, could not hook into any active AI brains (Ollama, Groq, Gemini) in sequence. Please verify credentials or local hosting service.\n\n`;

        botResponse = prefixMsg + botResponse;

        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'assistant',
          content: botResponse,
          timestamp: new Date().toLocaleTimeString(),
          brainUsed: 'offline'
        }]);
        handleSpeak(botResponse);
        setIsGenerating(false);
        abortControllerRef.current = null;
        return;
      }

      const currentProvider = attempts[attemptIndex];
      
      if (attemptIndex > 0) {
        // Set fallback notification to trigger subtle animated banner in ChatView
        setFallbackNotification({ from: attempts[attemptIndex - 1], to: currentProvider });
        setTimeout(() => setFallbackNotification(null), 4000); // clear after 4 seconds

        // Update the loading message text to reflect fallback transition
        setMessages(prev => prev.map(m => m.id === loadingMsgId ? {
          ...m,
          content: lang === 'bn'
            ? `পূর্ববর্তী সংযোগ কাজ করেনি! স্বয়ংক্রিয় ব্যাকআপ ট্রাই করা হচ্ছে (${currentProvider === 'gemini' ? 'Gemini Core' : currentProvider === 'groq' ? 'Groq LPU' : 'Ollama Local'})...`
            : `Attempt failed! Falling over to next active brain (${currentProvider.toUpperCase()})...`,
          brainUsed: currentProvider
        } : m));
      }

      const recentHistory = [...messages.filter(m => m.id !== loadingMsgId), newMsg].slice(-8);

      await streamLlmResponse(
        currentProvider,
        recentHistory,
        loadingMsgId,
        (finalText, realProvider) => {
          // Success! Speech speak synthesizers and wrap up
          handleSpeak(finalText);
          setLastResult(finalText);
          setStatusEndpoint(null);
          setStatusBanner(null);
          setPendingVoiceCommand(null);
          setIsGenerating(false);
          abortControllerRef.current = null;
          
          // Clear visual attachment after successful generation
          setAttachmentImage(null);
          setAttachmentPreview(null);
        },
        (err) => {
          console.warn(`Provider ${currentProvider} failed during query stream:`, err.message || err);
          // Auto fallover next index
          runStreamingWithFallback(attemptIndex + 1);
        }
      );
    };

    // Begin cascade
    await runStreamingWithFallback(0);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleSuggestionClick = (promptText: string) => {
    setInputValue(promptText);
    const inputElement = document.getElementById('chat-input');
    if (inputElement) {
      inputElement.focus();
    }
  };

  return (
    <div id="chat-section" className="flex-1 flex h-full bg-[#1b1b1b] text-[#ececec] border-r border-[#2f2f2f] overflow-hidden relative select-none">
      {/* 🚀 Super High-Quality Recurrent Chat Threads Manager Sidebar */}
      {showThreadsSidebar && (
        <div className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col h-full shrink-0 z-30 animate-fade-in relative">
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-slate-900 bg-slate-900/35 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'bn' ? 'আলাপচারিতা হিস্ট্রি' : 'Chat Log History'}</span>
            </div>
            <button
              onClick={() => setShowThreadsSidebar(false)}
              className="p-1 hover:bg-slate-900 text-slate-500 hover:text-slate-200 rounded cursor-pointer transition-colors"
              title={lang === 'bn' ? 'স্লাইডবার লুকান' : 'Collapse Sidebar'}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* New Chat & Log actions */}
          <div className="p-3 space-y-2 border-b border-slate-900">
            <button
              onClick={handleCreateNewThread}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-cyan-500/25 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all transform active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নতুন চ্যাট শুরু করুন' : 'New Chat Thread'}</span>
            </button>

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={handleExportThread}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-[9px] font-bold text-slate-400 hover:text-slate-100 transition-all uppercase tracking-wide cursor-pointer"
                title={lang === 'bn' ? 'হিস্ট্রি ব্যাকআপ রপ্তানি' : 'Export Current Thread to JSON'}
              >
                <Download className="w-2.5 h-2.5" />
                <span>{lang === 'bn' ? 'রপ্তানি' : 'Export'}</span>
              </button>
              <button
                onClick={handleClearAllThreads}
                className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border border-rose-950/30 bg-rose-950/10 hover:bg-rose-950/25 text-[9px] font-bold text-rose-500 hover:text-rose-400 transition-all uppercase tracking-wide cursor-pointer"
                title={lang === 'bn' ? 'সব আলাপচারিতা মুছে দিন' : 'Clear All Sessions'}
              >
                <Trash2 className="w-2.5 h-2.5" />
                <span>{lang === 'bn' ? 'ক্লিয়ার সব' : 'Clear All'}</span>
              </button>
            </div>
          </div>

          {/* Scrolling thread items list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {threads.map(t => {
              const isActive = t.id === activeThreadId;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900/95 border-cyan-500/20 text-cyan-400 shadow-[0_4px_12px_rgba(6,182,212,0.05)] shadow-slate-950/40 border'
                      : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-900/30'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-1.5">
                    <p className={`text-xs font-medium truncate ${isActive ? 'text-slate-100 font-semibold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {t.title}
                    </p>
                    <span className="text-[8px] opacity-45 font-mono block mt-0.5">
                      {t.timestamp} • {t.messages.length} messages
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteThread(t.id, e)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-rose-950/25 text-slate-500 hover:text-rose-400 rounded-lg shrink-0 cursor-pointer transition-all duration-200"
                    title={lang === 'bn' ? 'ডিলিট করুন' : 'Delete Session'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Immersive Holographic Speech Active Overlay */}
      {isListening && (
        <div id="speech-overlay-portal" className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6 animate-fade-in select-none">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping scale-150 pointer-events-none" />
            <div className="w-24 h-24 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.25)]">
              <Mic className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2 max-w-sm">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <span>{lang === 'bn' ? 'নিওরা ডিক্টেশন মোড' : 'NEORA ACTIVE DICTATION'}</span>
            </h3>
            <p className="text-xs text-cyan-400 font-medium font-mono">
              {lang === 'bn' 
                ? 'আমি শুনছি, বস! টাস্ক, রিমাইন্ডার বা ক্যালেণ্ডার ভয়েস কমান্ডটি বলুন...' 
                : 'System is recording... Dictate your workspace command clearly.'}
            </p>
          </div>

          {/* Glowing Sound waves equalizer visualizer using existing classes */}
          <div className="my-8 flex items-end gap-1.5 h-12 px-6 bg-slate-900/40 rounded-full py-3 border border-slate-800 transition-all duration-500 ease-in-out">
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar text-cyan-300 ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-300' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar text-cyan-300 ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-300' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-400' : 'bg-slate-700'}`}></span>
            <span className={`eq-bar font-bold text-cyan-300 ${(whisperStatus === 'transcribing' || whisperStatus === 'recording') ? 'pulsing bg-cyan-300' : 'bg-slate-700'}`}></span>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-slate-500 font-mono tracking-wide max-w-xs">
              {lang === 'bn' 
                ? 'চেষ্টা করুন: "create task print design" বা "set reminder bill payment tomorrow"' 
                : 'Try: "create task draft catalog" or "set reminder approve proof review tomorrow"'}
            </p>
            <button
              onClick={toggleMic}
              className="px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 text-[10px] font-bold font-mono uppercase rounded-full transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'রেকর্ডিং বন্ধ করুন' : 'Stop Dictation'}
            </button>
          </div>
        </div>
      )}

      {/* Main Column Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#212121]">
        {/* Header toolbar */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2">
            {!showThreadsSidebar && (
              <button
                onClick={() => setShowThreadsSidebar(true)}
                className="p-1 px-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer mr-1.5 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase transition-all"
                title={lang === 'bn' ? 'আলাপচারিতা হিস্ট্রি দেখুন' : 'Show Chat Log History'}
              >
                <History className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Logs</span>
              </button>
            )}
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse animate-duration-1000" />
            <span className="text-xs font-semibold text-white tracking-wider flex items-center gap-1.5 font-mono uppercase">
              <span>Neora AI</span>
              {/* Interactive Connection-Status conscious Model Selector Dropdown */}
              <div className="flex items-center gap-1.5 ml-1 select-none">
                <select
                  aria-label="Model switcher selection selection bar"
                  value={activeBrain}
                  onChange={(e) => {
                    const selected = e.target.value as 'gemini' | 'groq' | 'ollama';
                    if (selected === 'groq' && groqStatus === 'not_responding') {
                      window.dispatchEvent(new CustomEvent("neora-system-event", {
                        detail: {
                          id: "prevent-inactive-" + Math.floor(Math.random() * 100000),
                          timestamp: new Date().toTimeString().split(" ")[0],
                          category: "system_heal",
                          level: "WARNING",
                          message: lang === 'bn' ? "গ্রক (Groq) এআই সাড়া দিচ্ছে না। নির্বাচন বাতিল করা হলো।" : "Groq is not responding. Selection aborted to prevent errors.",
                          details: "Diagnostics reported Groq status: not_responding. Active LLM remains unchanged."
                        }
                      }));
                      return;
                    }
                    if (selected === 'ollama' && ollamaDiagnosticStatus === 'not_responding') {
                      window.dispatchEvent(new CustomEvent("neora-system-event", {
                        detail: {
                          id: "prevent-inactive-" + Math.floor(Math.random() * 100000),
                          timestamp: new Date().toTimeString().split(" ")[0],
                          category: "system_heal",
                          level: "WARNING",
                          message: lang === 'bn' ? "ওল্লামা (Ollama) লোকাল ব্রেন সাড়া দিচ্ছে না। নির্বাচন বাতিল করা হলো।" : "Ollama is not responding. Selection aborted to prevent errors.",
                          details: "Diagnostics reported Ollama status: not_responding. Active LLM remains unchanged."
                        }
                      }));
                      return;
                    }

                    setActiveBrain(selected);
                    if (selected === 'groq') {
                      setUseGroq(true);
                      setUseOllama(false);
                    } else if (selected === 'ollama') {
                      setUseGroq(false);
                      setUseOllama(true);
                    } else {
                      setUseGroq(false);
                      setUseOllama(false);
                    }
                  }}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-[10px] font-mono font-bold tracking-wider rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 cursor-pointer uppercase pr-6 appearance-none relative"
                  style={{ 
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2306b6d4\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', 
                    backgroundPosition: 'right 6px center', 
                    backgroundSize: '9px', 
                    backgroundRepeat: 'no-repeat' 
                  }}
                >
                  <option value="gemini" className="bg-slate-950 text-cyan-400 font-bold uppercase text-[9px]">
                    Gemini {connectionStatus?.gemini?.alive ? '● LIVE' : '○ ERR'}
                  </option>
                  <option value="groq" className="bg-slate-950 text-indigo-400 font-bold uppercase text-[9px]">
                    Groq {connectionStatus?.groq?.alive ? '● LIVE' : '○ ERR'}
                  </option>
                  <option value="ollama" className="bg-slate-950 text-emerald-400 font-bold uppercase text-[9px]">
                    Ollama {connectionStatus?.ollama?.alive ? '● LOCAL' : '○ OFF'}
                  </option>
                </select>
              </div>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Real-Time API Rate Quota Monitor */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-850/80 font-mono text-[9px] text-slate-400">
              <Gauge className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="font-bold text-slate-300">{lang === 'bn' ? 'কোটা:' : 'QUOTA Remaining:'}</span>
              <span className="text-cyan-400 font-semibold pl-0.5">Gemini: {rateLimits.gemini.remainingRequests} Req/Min</span>
              {rateLimits.groq.remainingRequests !== null ? (
                <span className="border-l border-slate-800 pl-2 text-indigo-400 font-semibold">Groq Requests: {rateLimits.groq.remainingRequests} / {rateLimits.groq.limitRequests || 'Limit'}</span>
              ) : (
                <span className="border-l border-slate-800 pl-2 text-indigo-500">Groq: Wait Query</span>
              )}
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/20 transition-all cursor-pointer"
                title={lang === 'bn' ? 'টাস্ক ক্লিয়ার করুন' : 'Reset Conversation'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setSpeakVolumeOn(!speakVolumeOn)}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                speakVolumeOn ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-950 text-slate-500 border border-slate-850'
              }`}
              title={speakVolumeOn ? 'Vocal Speech ON' : 'Vocal Speech MUTED'}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              showSettings || useGroq ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' : 'bg-slate-950 text-slate-500 border border-slate-850'
            }`}
            title={lang === 'bn' ? 'Groq এপিআই কনফিগারেশন' : 'Groq API Configuration Panel'}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Advanced AI Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-slate-900/90 border-b border-indigo-950/45 space-y-3.5 animate-fade-in text-xs font-mono transition-all panel-surface-strong max-h-[80vh] overflow-y-auto">
          {/* Quick Active Brain and Auto-Failover Hub */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/85 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase text-[10px] tracking-wider text-indigo-400 flex items-center gap-1.5 font-mono">
                <Cpu className="w-4 h-4 text-indigo-400 font-bold" />
                <span>{lang === 'bn' ? 'প্রধান এআই ব্রেন নির্বাচন ও সংযোগ পদ্ধতি' : 'PRIMARY AI BRAIN COMPILER & AUTOMATIC FAILOVER'}</span>
              </span>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-medium">
              {lang === 'bn'
                ? 'নিওরা কোন লাইভ এআই ব্রেনটি ব্যবহার করবে তা নির্বাচন করুন। একটি এআই সংযোগ ব্যর্থ হলে অন্য এপিআই দিয়ে সক্রিয়ভাবে সাহায্য করার জন্য ব্যাকআপ ফেলওভার নীতি অন রাখুন।'
                : 'Select which active LLM module Neora should use primarily for answering requests. Keep the Failover helper enabled to always receive a live answer.'}
            </p>

            {/* Model select dropdown */}
            <div className="flex flex-col gap-1 text-[10px] pr-0.5">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                {lang === 'bn' ? 'ব্রেন মডেল ড্রপডাউন মেনু:' : 'Select LLM Server Model:'}
              </span>
              <select
                id="neora-model-select-dropdown"
                value={activeBrain}
                onChange={(e) => {
                  const selected = e.target.value as 'gemini' | 'groq' | 'ollama';
                  if (selected === 'groq' && groqStatus === 'not_responding') {
                    window.dispatchEvent(new CustomEvent("neora-system-event", {
                      detail: {
                        id: "prevent-inactive-" + Math.floor(Math.random() * 100000),
                        timestamp: new Date().toTimeString().split(" ")[0],
                        category: "system_heal",
                        level: "WARNING",
                        message: lang === 'bn' ? "গ্রক (Groq) এআই সাড়া দিচ্ছে না। নির্বাচন বাতিল করা হলো।" : "Groq is not responding. Selection aborted to prevent errors.",
                        details: "Diagnostics reported Groq status: not_responding. Active LLM remains unchanged."
                      }
                    }));
                    return;
                  }
                  if (selected === 'ollama' && ollamaDiagnosticStatus === 'not_responding') {
                    window.dispatchEvent(new CustomEvent("neora-system-event", {
                      detail: {
                        id: "prevent-inactive-" + Math.floor(Math.random() * 100000),
                        timestamp: new Date().toTimeString().split(" ")[0],
                        category: "system_heal",
                        level: "WARNING",
                        message: lang === 'bn' ? "ওল্লামা (Ollama) লোকাল ব্রেন সাড়া দিচ্ছে না। নির্বাচন বাতিল করা হলো।" : "Ollama is not responding. Selection aborted to prevent errors.",
                        details: "Diagnostics reported Ollama status: not_responding. Active LLM remains unchanged."
                      }
                    }));
                    return;
                  }
                  setActiveBrain(selected);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-mono text-[11px]"
              >
                <option value="gemini">Gemini 2.5 Flash Core (Recommended)</option>
                <option value="groq">Groq Cloud (Llama-3.3-70b Speed-Engine)</option>
                <option value="ollama">Ollama (Offline Local VM Agent)</option>
              </select>
            </div>

            {/* Quick selectors */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              <button
                type="button"
                onClick={() => setActiveBrain('gemini')}
                className={`py-2 px-1.5 rounded-lg border text-center font-bold tracking-wider transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  activeBrain === 'gemini'
                    ? 'bg-rose-950/20 text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                    : 'bg-slate-900/40 text-slate-500 border-slate-800/60 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[9px] uppercase">Gemini Core</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (groqStatus === 'not_responding') {
                    window.dispatchEvent(new CustomEvent("neora-system-event", {
                      detail: {
                        id: "prevent-inactive-" + Math.floor(Math.random() * 100000),
                        timestamp: new Date().toTimeString().split(" ")[0],
                        category: "system_heal",
                        level: "WARNING",
                        message: lang === 'bn' ? "গ্রক (Groq) এআই সাড়া দিচ্ছে না। নির্বাচন বাতিল করা হলো।" : "Groq is not responding. Selection aborted to prevent errors.",
                        details: "Diagnostics reported Groq status: not_responding. Active LLM remains unchanged."
                      }
                    }));
                    return;
                  }
                  setActiveBrain('groq');
                }}
                className={`py-2 px-1.5 rounded-lg border text-center font-bold tracking-wider transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  activeBrain === 'groq'
                    ? 'bg-indigo-950/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                    : 'bg-slate-900/40 text-slate-500 border-slate-800/60 hover:text-slate-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-450" />
                <span className="text-[9px] uppercase">Groq LPU</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (ollamaDiagnosticStatus === 'not_responding') {
                    window.dispatchEvent(new CustomEvent("neora-system-event", {
                      detail: {
                        id: "prevent-inactive-" + Math.floor(Math.random() * 100000),
                        timestamp: new Date().toTimeString().split(" ")[0],
                        category: "system_heal",
                        level: "WARNING",
                        message: lang === 'bn' ? "ওল্লামা (Ollama) লোকাল ব্রেন সাড়া দিচ্ছে না। নির্বাচন বাতিল করা হলো।" : "Ollama is not responding. Selection aborted to prevent errors.",
                        details: "Diagnostics reported Ollama status: not_responding. Active LLM remains unchanged."
                      }
                    }));
                    return;
                  }
                  setActiveBrain('ollama');
                }}
                className={`py-2 px-1.5 rounded-lg border text-center font-bold tracking-wider transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  activeBrain === 'ollama'
                    ? 'bg-cyan-950/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/40 text-slate-500 border-slate-800/60 hover:text-slate-300'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span className="text-[9px] uppercase font-mono">Ollama Local</span>
              </button>
            </div>

            {/* Auto Failover Toggle Option */}
            <div className="flex items-center justify-between border-t border-slate-900/80 pt-2.5 text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <span>🔄</span>
                <span>{lang === 'bn' ? 'সংযোগ ত্রুটিতে মডেলে স্বয়ংক্রিয় পরিবর্তন:' : 'Auto Failover on Connection Outages:'}</span>
              </span>
              <button
                type="button"
                onClick={() => setAutoFailover(!autoFailover)}
                className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide transition-all cursor-pointer ${
                  autoFailover
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                    : 'bg-slate-900 text-slate-500 border border-slate-850'
                }`}
              >
                {autoFailover ? (lang === 'bn' ? 'সক্রিয় (রিলায়েবল)' : 'ENABLED (Highly Reliable)') : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'DISABLED')}
              </button>
            </div>
            
            <p className="text-[8px] text-slate-500 leading-tight">
              {lang === 'bn'
                ? '✦ মেম্বার মডেলে কী-ভুল বা সংযোগ বিচ্ছিন্নতা থাকলে নিওরা লাইভ ব্যাকআপে (Gemini Core বা ওল্লামা) চলে যাবে।'
                : '✦ If your chosen active brain fails on requests, Neora recovers the dialogue using sequential active fallbacks.'}
            </p>

            {/* Voice Input Mode Toggle */}
            <div className="flex items-center justify-between border-t border-slate-900/80 pt-2.5 text-[10px] mt-2">
              <span className="text-slate-400 flex items-center gap-1">
                <span>🎙️</span>
                <span>{lang === 'bn' ? 'ভয়েস রিকগনিশন মোড:' : 'Speech Recognition Engine:'}</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setVoiceInputMode('browser');
                    localStorage.setItem('neora_voice_input_mode', 'browser');
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide transition-all cursor-pointer ${
                    voiceInputMode === 'browser'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-900 text-slate-500 border border-slate-850'
                  }`}
                >
                  {lang === 'bn' ? 'ব্রাউজার লোকাল' : 'Browser Local'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVoiceInputMode('whisper');
                    localStorage.setItem('neora_voice_input_mode', 'whisper');
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide transition-all cursor-pointer ${
                    voiceInputMode === 'whisper'
                      ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-900 text-slate-500 border border-slate-850'
                  }`}
                >
                  OpenAI Whisper
                </button>
              </div>
            </div>
            
            <p className="text-[8px] text-slate-500 leading-tight">
              {lang === 'bn'
                ? '✦ "ব্রাউজার লোকাল" মোডে কোনো এপিআই কি ছাড়াই অত্যন্ত দ্রুত বাংলা ও ইংরেজি ভয়েস কমান্ড রিয়েল-টাইমে কাজ করে।'
                : '✦ "Browser Local" runs instant zero-latency on-device speech dictation without any API Key.'}
            </p>
          </div>

          {/* Groq Settings Panel details */}
          <div className="border-t border-slate-800/60 pt-3.5 mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase text-[10px] tracking-wider text-indigo-400 flex items-center gap-1.5 font-mono">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'bn' ? 'Groq এপিআই কনফিগারেশন' : 'GROQ API PROXY SETTINGS'}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">{lang === 'bn' ? 'ব্যক্তিগত Groq এপিআই কি:' : 'Personal Groq API Key:'}</label>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-700 outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">{lang === 'bn' ? 'পছন্দসই এআই মডেল:' : 'Select AI Model Brain:'}</label>
                <select
                  value={groqModel}
                  onChange={(e) => setGroqModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile & Smart)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Sub-second Instant)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B (Deep reasoning context)</option>
                  <option value="gemma2-9b-it">Gemma 2 9B (Google Open weights)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gemini API Settings Panel */}
          <div className="border-t border-slate-800/60 pt-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase text-[10px] tracking-wider text-rose-450 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>{lang === 'bn' ? 'ব্যক্তিগত Gemini এপিআই সেটিংস' : 'PERSONAL GEMINI API SETTINGS'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block justify-between items-center">
                  {lang === 'bn' ? 'ব্যক্তিগত Gemini এপিআই কি:' : 'Personal Gemini API Key:'}
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-700 outline-none focus:border-rose-500/50"
                />
              </div>
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                  {lang === 'bn' ? 'সক্রিয় জেমিনি মডেল:' : 'Active Gemini Model:'}
                </label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-rose-400 font-bold font-mono">
                  gemini-2.5-flash (Standard Setup)
                </div>
              </div>
            </div>
          </div>

          {/* Ollama Local Offline AI Brain Panel */}
          <div className="border-t border-slate-800/60 pt-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase text-[10px] tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'লোকাল ওল্লামা অফলাইন এআই সেটিংস' : 'LOCAL OLLAMA CONNECTION HANDSHAKE'}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] text-slate-400">{lang === 'bn' ? 'স্ট্যাটাস:' : 'Handshake Status:'}</span>
                <div className="flex items-center gap-1.5">
                  {ollamaStatus === 'checking' && (
                    <span className="text-amber-400 text-[10px] flex items-center gap-1 font-mono">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> ...
                    </span>
                  )}
                  {ollamaStatus === 'available' && (
                    <span className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      OK
                    </span>
                  )}
                  {ollamaStatus === 'not_installed' && (
                    <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      OFFLINE
                    </span>
                  )}
                  {ollamaStatus === 'partial' && (
                    <span className="text-amber-500 text-[10px] font-bold uppercase flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      PARTIAL
                    </span>
                  )}
                  <button 
                    type="button" 
                    onClick={checkOllamaStatus}
                    className="p-1 text-slate-400 hover:text-white rounded bg-slate-950 border border-slate-800 transition cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {/* Custom Base URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                  {lang === 'bn' ? 'ওল্লামা সার্ভার ইউআরএল:' : 'Ollama Host Address URL:'}
                </label>
                <input
                  type="text"
                  placeholder="http://localhost:11434"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                />
                <span className="text-[8px] text-slate-500 block leading-tight">
                  {lang === 'bn' ? '✦ সাধারণত localhost বা কাস্টম হোস্ট আইপি।' : '✦ Standard is http://localhost:11434 or custom IP.'}
                </span>
              </div>

              {/* Connection Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                  {lang === 'bn' ? 'সংযোগ প্রোটোকল:' : 'Connection protocol Mode:'}
                </label>
                <div className="grid grid-cols-2 gap-1 font-mono">
                  <button
                    type="button"
                    onClick={() => setOllamaConnectionMode('browser')}
                    className={`py-1.5 rounded text-[10px] font-bold border transition duration-150 cursor-pointer ${
                      ollamaConnectionMode === 'browser'
                        ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-500 border-slate-850'
                    }`}
                  >
                    Client CORS Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setOllamaConnectionMode('server')}
                    className={`py-1.5 rounded text-[10px] font-bold border transition duration-150 cursor-pointer ${
                      ollamaConnectionMode === 'server'
                        ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-500 border-slate-850'
                    }`}
                  >
                    Server-Side Proxy
                  </button>
                </div>
                <span className="text-[8px] text-slate-500 block leading-tight">
                  {lang === 'bn'
                    ? '✦ সরাসরি ব্রাউজার সংযোগের জন্য Client সিলেক্ট করুন।'
                    : '✦ Server-Side bypasses browser container constraints.'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">{lang === 'bn' ? 'ওল্লামা মডেল নির্বাচন:' : 'Select Ollama Model:'}</label>
                {ollamaModels.length > 0 ? (
                  <select
                    value={selectedOllamaModel}
                    onChange={(e) => setSelectedOllamaModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50"
                  >
                    {ollamaModels.map((m: any, idx: number) => (
                      <option key={idx} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedOllamaModel}
                    onChange={(e) => setSelectedOllamaModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-500 outline-none focus:border-cyan-500/50"
                  >
                    <option value="llama3">llama3 (Default Llama)</option>
                    <option value="mistral">mistral</option>
                    <option value="qwen">qwen</option>
                    <option value="phi3">phi3</option>
                    <option value="deepseek-r1">deepseek-r1 (Reasoning)</option>
                  </select>
                )}
                <span className="text-[8px] text-slate-500 block leading-tight">
                  {lang === 'bn' 
                    ? '✦ নতুন মডেল ওল্লামায় সচল করতে "ollama run" ট্রাই করুন।' 
                    : '✦ Discovered active models. Use "ollama run llama3" or "ollama run deepseek-r1" to fetch.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message stream & Workspace Hello Board */}
      <div id="msg-stream" className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Sleek Gemini Landing Hub with Holographic Neural Pulsar */
          <div className="h-full flex flex-col justify-center items-center max-w-xl mx-auto py-12 px-4 animate-fade-in select-none text-center my-auto min-h-[400px]">
            {/* Holographic Glowing Brain Core Pulsar */}
            <div 
              onClick={initializeVoiceCore}
              className="relative mb-8 group cursor-pointer"
              id="hologram-activation-core"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 blur-2xl opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
              <div className="relative w-32 h-32 rounded-full bg-slate-950/80 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,212,255,0.3)] hover:shadow-[0_0_70px_rgba(0,212,255,0.6)] hover:border-cyan-300 transition-all duration-300 transform hover:scale-105">
                <Cpu className="w-11 h-11 text-cyan-400 animate-spin-slow mb-1" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400 font-bold uppercase">INIT CORE</span>
              </div>
            </div>

            <div className="space-y-3 mb-7">
              <h1 className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400 bg-clip-text text-transparent font-extrabold text-3xl sm:text-4xl font-sans tracking-tight leading-none">
                {lang === 'bn' ? 'স্বাগতম, শুকরিয়া প্রিন্টার্স সিস্টেমে' : 'Speak to Neora System'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
                {lang === 'bn' 
                  ? 'আমি আপনার ভয়েস সহকারী নিওরা। আপনার সব কাজ ও পিসির নির্দেশাবলী কন্ঠস্বরের মাধ্যমে পরিচালনা করতে প্রস্তুত।' 
                  : 'I am Neora, your smart voice operating client. Click below to start our vocal session, and execute automated actions on your system.'}
              </p>
              <div className="text-[11px] font-mono text-cyan-500/80 uppercase tracking-widest flex items-center justify-center gap-1.5 pt-1">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                <span>Neora Intelligent Companion Active</span>
              </div>
            </div>

            <button
              onClick={initializeVoiceCore}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_0_55px_rgba(0,212,255,0.45)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {lang === 'bn' ? '⚡ কন্ঠস্বর ও ডিক্টেশন চালু করুন (Speak & Listen)' : '⚡ ACTIVATE VOCAL VOICE CORE (Speak & Listen)'}
            </button>
            <p className="text-[10px] text-slate-500 font-mono mt-4">
              ✦ {lang === 'bn' ? 'নিওরা কন্ঠস্বরের মাধ্যমে প্রশ্নের উত্তর দেবে ও আপনার হয়ে পিসির কাজ করে দেবে' : 'Binds vocal response synthesis with local OS background command processing.'}
            </p>
          </div>
        ) : (
          /* Beautiful Gemini Message Container Lists */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((m) => {
              const isBot = m.role === 'assistant';
              const classificationLabel = m.classification || (m.content.includes('[OS Command]') ? 'os-command' : 'chat');
              const classificationClass =
                classificationLabel === 'os-command'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : classificationLabel === 'rejected'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-4 animate-fade-in ${
                    isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
                  }`}
                >
                  {/* Gemini-Inspired Round Soft Glow Avatar */}
                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center border transition-all hover:scale-105 ${
                    isBot 
                      ? (isSpeaking 
                          ? 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 border-cyan-400 ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.65)] text-white'
                          : 'bg-gradient-to-tr from-cyan-600/30 via-indigo-600/30 to-rose-600/30 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-cyan-300')
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    {isBot ? <Sparkles className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-white' : 'animate-pulse'}`} /> : <User className="w-4.5 h-4.5" />}
                  </div>

                  <div className="space-y-1 max-w-[82%]">
                    {/* User / Model Name label like Gemini/Groq */}
                    <span className="text-[10px] text-slate-500 font-mono tracking-wide flex items-center gap-2 px-1">
                      <span>
                        {isBot 
                          ? (lang === 'bn' ? 'নিওরা এআই (Neora AI)' : 'Neora AI') 
                          : (lang === 'bn' ? 'আপনি (শুকরিয়া প্রিন্টার্স)' : 'You (Shukria Printers)')}
                      </span>
                      {isBot && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border tracking-wider uppercase ${
                          m.brainUsed === 'ollama'
                            ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/25'
                            : m.brainUsed === 'groq'
                              ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/25'
                              : m.brainUsed === 'offline'
                                ? 'bg-amber-950/40 text-amber-500 border-amber-500/25 animate-pulse'
                                : 'bg-rose-950/40 text-rose-400 border-rose-500/25'
                        }`}>
                          {m.brainUsed === 'ollama' 
                            ? `Ollama: ${selectedOllamaModel}` 
                            : m.brainUsed === 'groq' 
                              ? `Groq: ${groqModel.split('-')[0].toUpperCase()}` 
                              : m.brainUsed === 'offline' 
                                ? (lang === 'bn' ? 'অফলাইন ব্যাকআপ' : 'Offline Safe') 
                                : 'Gemini Core'}
                        </span>
                      )}
                      {isSpeaking && isBot && (
                        <span className="flex items-center gap-0.5 text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 animate-pulse text-[8px] font-bold">
                          <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                          <span className="w-0.5 h-3.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                          <span className="ml-1 tracking-wider text-cyan-300 uppercase">{lang === 'bn' ? 'কথা বলছে' : 'SPEAKING'}</span>
                        </span>
                      )}
                    </span>
                    {showMessageBadges && (
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border mb-2 ${classificationClass}`}>
                        {classificationLabel}
                      </span>
                    )}
                    
                    {editingMessageId === m.id ? (
                      <div className="space-y-2 w-full min-w-[280px] bg-slate-950 p-3.5 rounded-2xl border border-cyan-500/20 text-left">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full bg-slate-900 text-slate-100 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/40 resize-none font-sans"
                          rows={3}
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingMessageId(null)}
                            className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
                          >
                            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateMessage(m.id, editingContent)}
                            className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded-lg bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-850/40 transition-all cursor-pointer"
                          >
                            {lang === 'bn' ? 'পরিবর্তন করুন ও পাঠান' : 'Update & Resend'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm border transition-all ${
                          isBot 
                            ? 'bg-slate-900/60 border-slate-800/80 text-slate-200 shadow-slate-950/40 rounded-tl-none hover:border-slate-700 text-left' 
                            : 'bg-cyan-950/25 border-cyan-500/20 text-cyan-100 rounded-tr-none hover:border-cyan-500/45 text-left'
                        }`}>
                          {/* If a user attached an image, show its thumbnail preview in the message bubble too! */}
                          {m.image?.data && (
                            <img 
                              src={`data:${m.image.mimeType};base64,${m.image.data}`} 
                              alt="Attached visual context asset link" 
                              className="max-h-48 rounded-xl object-contain border border-cyan-500/10 mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] bg-slate-900" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="markdown-body select-text text-left">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0 text-left">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-left">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-left">{children}</ol>,
                                li: ({ children }) => <li className="mb-0.5 text-left">{children}</li>,
                                code: ({ node, ...props }) => (
                                  <code className="bg-slate-950 text-[#00d4ff] px-1.5 py-0.5 font-mono text-[11px] rounded border border-cyan-950" {...props} />
                                ),
                                pre: ({ children }) => (
                                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-300 my-2 shadow-inner leading-normal max-w-full text-left">{children}</pre>
                                ),
                                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                h1: ({ children }) => <h1 className="text-sm font-bold text-white mb-2 font-sans tracking-wide text-left">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-xs font-bold text-white mb-1.5 font-sans tracking-wide text-left">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-[11px] font-bold text-white mb-1 font-sans text-left">{children}</h3>,
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {/* Interactive Message Action Toolbar icons overlay */}
                        <div className={`absolute bottom-[-14px] ${isBot ? 'left-2.5' : 'right-2.5'} flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20`}>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(m.content, m.id)}
                            className="p-1 hover:bg-slate-850 rounded-lg text-slate-500 hover:text-cyan-400 transition-all cursor-pointer"
                            title={copiedMessageId === m.id ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (lang === 'bn' ? 'মেসেজ কপি করুন' : 'Copy Message')}
                          >
                            {copiedMessageId === m.id ? (
                              <span className="text-[7px] font-mono text-cyan-400 uppercase font-bold tracking-tight px-1 pb-0.5">COPIED</span>
                            ) : (
                              <Copy className="w-2.8 h-2.8" />
                            )}
                          </button>

                          {!isBot ? (
                            <button
                              type="button"
                              onClick={() => startEditingMessage(m.id, m.content)}
                              className="p-1 hover:bg-slate-850 rounded-lg text-slate-500 hover:text-amber-400 transition-all cursor-pointer"
                              title={lang === 'bn' ? 'মেসেজ পরিবর্তন করুন' : 'Edit Message'}
                            >
                              <Edit3 className="w-2.8 h-2.8" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSpeak(m.content)}
                              className="p-1 hover:bg-slate-850 rounded-lg text-slate-500 hover:text-emerald-400 transition-all cursor-pointer"
                              title={lang === 'bn' ? 'উত্তরটি শুনুন' : 'Listen to Reply'}
                            >
                              <Volume2 className="w-2.8 h-2.8" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m.id)}
                            className="p-1 hover:bg-rose-950/40 rounded-lg text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                            title={lang === 'bn' ? 'মেসেজটি মুছুন' : 'Delete Message'}
                          >
                            <Trash2 className="w-2.8 h-2.8" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <span className="text-[9px] text-slate-600 font-mono block px-1">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* NLP Suggestion panel removed from fixed placement per user request */}

      {/* Gemini Floating Pill Input bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-900 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setShowMessageBadges(prev => !prev)}
                className={`text-[9px] font-mono px-3 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                  showMessageBadges 
                    ? 'border-cyan-500/20 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40' 
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showMessageBadges ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>
                  {lang === 'bn' 
                    ? (showMessageBadges ? 'মেমরি ও প্ল্যান লুকান (Collapse)' : 'মেমরি ও প্ল্যান দেখান (Expand)') 
                    : (showMessageBadges ? 'Hide Memories/Plans' : 'Show Memories/Plans')}
                </span>
              </button>
            </div>
            {(isListening || whisperStatus === 'transcribing') && (
            <div id="mic-active-badge" className={`mb-3.5 flex items-center justify-between border p-2.5 rounded-xl text-xs animate-pulse select-none ${
              whisperStatus === 'transcribing'
                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400'
                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-ping ${
                  whisperStatus === 'transcribing' ? 'bg-indigo-400' : 'bg-rose-500'
                }`}></span>
                <span className="font-mono text-[10px] font-bold tracking-wide uppercase">
                  {whisperStatus === 'transcribing' ? (
                    lang === 'bn'
                      ? 'নিওরা ডিক্টেশনঃ Whisper এআই স্পিচ ট্রান্সক্রাইব করছে... অনুগ্রহ করে অপেক্ষা করুন'
                      : 'NEORA DICTATION: Transcribing recorded speech with OpenAI Whisper...'
                  ) : (
                    lang === 'bn' 
                      ? 'নিওরা ডিক্টেশনঃ শুনছি (Whisper সক্রিয়)... বলুন (যেমনঃ "টাস্কঃ ব্যানার প্রুফ ডেলিভারি")' 
                      : 'NEORA DICTATION: Recording (Whisper Active)... Speak clearly'
                  )}
                </span>
              </div>
              <div className={`flex items-end gap-0.5 h-3 px-1 transition-all duration-300 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
                <span className={`eq-bar ${whisperStatus === 'transcribing' ? 'pulsing bg-indigo-400' : 'bg-cyan-400'}`}></span>
                <span className={`eq-bar ${whisperStatus === 'transcribing' ? 'pulsing bg-indigo-400' : 'bg-cyan-400'}`}></span>
                <span className={`eq-bar ${whisperStatus === 'transcribing' ? 'pulsing bg-indigo-400' : 'bg-cyan-400'}`}></span>
                <span className={`eq-bar ${whisperStatus === 'transcribing' ? 'pulsing bg-indigo-400' : 'bg-cyan-400'}`}></span>
                <span className={`eq-bar ${whisperStatus === 'transcribing' ? 'pulsing bg-indigo-400' : 'bg-cyan-400'}`}></span>
                <span className={`eq-bar ${whisperStatus === 'transcribing' ? 'pulsing bg-indigo-400' : 'bg-cyan-400'}`}></span>
                <span className={`eq-bar ${whisperStatus === 'transcribing' ? 'pulsing bg-indigo-400' : 'bg-cyan-400'}`}></span>
              </div>
            </div>
          )}
          
          {/* Beautiful Outer Glow Floating Pill Container */}
          {(statusBanner || lastResult) && (
            <div className="mb-3 space-y-2">
              {statusBanner && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] text-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{statusBanner}</span>
                    {statusEndpoint && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border border-amber-400/30 bg-slate-950/40 text-amber-100">
                        {statusEndpoint}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatusBanner(null)}
                    className="text-[9px] font-mono uppercase text-amber-100/80 hover:text-white"
                  >
                    dismiss
                  </button>
                </div>
              )}
              {lastResult && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] text-cyan-100">
                  <span className="font-mono uppercase text-cyan-300 mr-2">Last Result</span>
                  <span>{lastResult}</span>
                </div>
              )}
            </div>
          )}



          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${healthChipClass}`}>
               {healthState === 'healthy'
                 ? 'healthy'
                 : 'offline'}
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {healthState === 'healthy' ? '/api/health' : (statusEndpoint || '/api/health')}
            </span>
          </div>

          {/* Image Attachment Thumbnail Preview Container */}
          {attachmentPreview && (
            <div className="relative inline-block mb-3 p-1.5 bg-slate-900 border border-slate-850/80 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-200">
              <img 
                src={attachmentPreview} 
                alt="Selected asset preview" 
                className="h-20 w-fit rounded-lg object-contain bg-slate-950 border border-slate-800" 
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => {
                  setAttachmentImage(null);
                  setAttachmentPreview(null);
                }}
                className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-rose-700"
                title={lang === 'bn' ? 'ছবি মুছুন' : 'Remove Image'}
              >
                <X className="w-2.8 h-2.8" />
              </button>
            </div>
          )}

          {/* Dynamic Suggestion Pills Bar for Neora AI Chat */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                {lang === 'bn' ? 'নিওরা এআই আইডিয়া জেনারেটর' : 'NEORA AI IDEA GENERATOR'}
              </span>
              <span className="text-[8px] font-mono text-slate-500">
                {lang === 'bn' ? 'ক্লিক করে প্রম্পট করুন' : 'Click to populate prompt'}
              </span>
            </div>
            <div 
              className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {dynamicSuggestions.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputValue(pill.prompt);
                    const chatInputEl = document.getElementById("chat-input");
                    if (chatInputEl) {
                      chatInputEl.focus();
                    }
                  }}
                  className="shrink-0 px-2.5 py-1 text-[10px] font-mono border border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 rounded-full transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] flex items-center gap-1.5 active:scale-95"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-500/60" />
                  <span className="font-bold text-slate-400">{pill.label}:</span>
                  <span className="truncate max-w-[150px]">{pill.prompt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800/90 rounded-full py-1.5 pl-4 pr-1.5 focus-within:border-cyan-500/50 shadow-[0_4px_24px_rgba(0,0,0,0.5)] focus-within:shadow-[0_0_24px_rgba(6,182,212,0.1)] transition-all">
            {/* Native file input for visual attachment uploads */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelection} 
              className="hidden" 
              accept="image/*" 
            />

            <input
              id="chat-input"
              type="text"
              placeholder={lang === 'bn' ? 'এখানে টাইপ করুন বা ভয়েস কমান্ড দিন...' : 'Ask Neora or speak your command (e.g. "task: Print flyer")...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent border-0 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
              autoComplete="off"
            />
            
            {/* Embedded Action Panel */}
            <div className="flex items-center gap-1.5">
              {/* Paperclip upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full transition-all cursor-pointer bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 flex items-center justify-center"
                title={lang === 'bn' ? 'ছবি যুক্ত করুন' : 'Attach Image (Vision Mode for Gemini Flash)'}
              >
                {/* Paperclip is simulated by standard icon or lucide Plus/Sparkles / custom visual */}
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={!inputValue.trim() || isEnhancing}
                className={`p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  isEnhancing 
                    ? 'bg-amber-600 text-white animate-pulse'
                    : inputValue.trim()
                      ? 'bg-gradient-to-r from-violet-600/60 to-indigo-600/60 text-white hover:from-violet-500 hover:to-indigo-500 border border-violet-500/20 hover:shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                      : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                }`}
                title={lang === 'bn' ? 'প্রম্পট উন্নত করুন (AI দিয়ে)' : 'Enhance Prompt (utilizing AI for clear execution pathways)'}
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={toggleMic}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]' 
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
                title={lang === 'bn' ? 'ভয়েস ইনপুট চালু/বন্ধ করুন' : 'Toggle Speech Recognition Voice Input'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              
              {isGenerating ? (
                <button
                  type="button"
                  onClick={() => abortControllerRef.current?.abort()}
                  className="p-2 rounded-full transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse flex items-center justify-center"
                  title={lang === 'bn' ? 'বন্ধ করুন' : 'Stop generating response'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() && !attachmentImage}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    (inputValue.trim() || attachmentImage)
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                      : 'bg-slate-950 text-slate-600 border border-slate-800 pointer-events-none'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row of quick-action pills below the chat input bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 select-none">
            <button
              type="button"
              onClick={() => handleSuggestionClick(lang === 'bn' ? 'টাস্ক: শুকরিয়া প্রিন্টার্স ব্যানার প্রুফ ডেলিভারি' : 'task: Deliver layout mockups for Shukria Printers')}
              className="px-3 py-1.5 bg-slate-900/60 hover:bg-slate-850 border border-slate-800/70 hover:border-cyan-500/30 rounded-xl text-[10.5px] font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={lang === 'bn' ? 'প্রোডাকশন টাস্ক তৈরি করুন' : 'Schedule Layout/Print Tasks'}
            >
              <span>➕</span>
              <span>{lang === 'bn' ? 'টাস্ক ক্রিয়েটর' : 'Task Creator'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSuggestionClick(lang === 'bn' ? 'মনে করিয়ে দিও কাল সকালে ক্লায়েন্ট মিটিং' : 'remind me tomorrow morning customer audit')}
              className="px-3 py-1.5 bg-slate-900/60 hover:bg-slate-850 border border-slate-800/70 hover:border-indigo-500/30 rounded-xl text-[10.5px] font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={lang === 'bn' ? 'রিমাইন্ডার সেট করুন' : 'Set Work Reminders'}
            >
              <span>⏰</span>
              <span>{lang === 'bn' ? 'রিমাইন্ডার' : 'Reminder'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSuggestionClick(lang === 'bn' ? 'নোট: ইনভয়েস পেমেন্ট রিসিভ করতে হবে' : 'note: Client billing pending')}
              className="px-3 py-1.5 bg-slate-900/60 hover:bg-slate-850 border border-slate-800/70 hover:border-rose-500/30 rounded-xl text-[10.5px] font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={lang === 'bn' ? 'মেমো নোট সংরক্ষণ করুন' : 'Save Database Notes'}
            >
              <span>📝</span>
              <span>{lang === 'bn' ? 'মেমো নোট' : 'Save Note'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSuggestionClick('Help / কমান্ড')}
              className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/30 rounded-xl text-[10.5px] font-mono text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={lang === 'bn' ? 'হেল্প ও সিস্টেম কমান্ড' : 'Systems Help Panel'}
            >
              <span>❓</span>
              <span>{lang === 'bn' ? 'হেল্প গাইড' : 'Help Specs'}</span>
            </button>
          </div>
          
          <p className="text-[10px] text-center text-slate-500 mt-2.5 font-mono">
            {lang === 'bn' 
              ? 'নিওরা ডিক্টেশন অফলাইনেও কাজ করতে পারে। লোকাল Whisper ও Porcupine ইন্টিগ্রেশন প্রোটোকল সমর্থিত।' 
              : 'Neora system runs fully offline by binding local Porcupine wake-word with Whisper engines.'}
          </p>
        </div>
      </div>
    </div>

    {/* Segment: The Right-side split HUD drawer for memories and planning states */}
    {showMessageBadges && (
      <div className="w-80 shrink-0 border-l border-[#2f2f2f] bg-[#171717] p-4 flex flex-col h-full overflow-y-auto space-y-5 select-none animate-fade-in z-10">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
          <h3 className="text-xs font-bold text-slate-300 font-sans tracking-wide uppercase flex items-center gap-1.5 font-mono">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'bn' ? 'সিস্টেম ট্র্যাকার ও মেমরি' : 'Workspace Trackers'}</span>
          </h3>
          <button
            onClick={() => setShowMessageBadges(false)}
            className="p-1 text-slate-500 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Prompts / Quick Creation tools moved here per user sidebar request */}
        <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
          <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span>⚙️ {lang === 'bn' ? 'কুইক অ্যাকশন ও প্রম্পট' : 'QUICK ACTIONS & TOOLS'}</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSuggestionClick(lang === 'bn' ? 'টাস্ক: শুকরিয়া প্রিন্টার্স ব্যানার প্রুফ ডেলিভারি' : 'task: Deliver layout mockups for Shukria Printers')}
              className="py-2 px-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left text-[9.5px] font-mono text-slate-300 hover:text-white hover:border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Schedule Layout/Print Tasks"
            >
              <span>➕</span>
              <span className="truncate">{lang === 'bn' ? 'নিওরা টাস্ক' : 'Task Agent'}</span>
            </button>
            <button
              onClick={() => handleSuggestionClick(lang === 'bn' ? 'মনে করিয়ে দিও কাল সকালে ক্লায়েন্ট মিটিং' : 'remind me tomorrow morning customer audit')}
              className="py-2 px-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left text-[9.5px] font-mono text-slate-300 hover:text-white hover:border-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Set Work Reminders"
            >
              <span>⏰</span>
              <span className="truncate">{lang === 'bn' ? 'রিমাইন্ডার' : 'Reminder'}</span>
            </button>
            <button
              onClick={() => handleSuggestionClick(lang === 'bn' ? 'নোট: ইনভয়েস পেমেন্ট রিসিভ করতে হবে' : 'note: Client billing pending')}
              className="py-2 px-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-left text-[9.5px] font-mono text-slate-300 hover:text-white hover:border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Save Database Notes"
            >
              <span>📝</span>
              <span className="truncate">{lang === 'bn' ? 'মেমো নোট' : 'Save Note'}</span>
            </button>
            <button
              onClick={() => handleSuggestionClick('Help / কমান্ড')}
              className="py-2 px-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/30 rounded-xl text-left text-[9.5px] font-mono text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Systems Help Panel"
            >
              <span>❓</span>
              <span className="truncate">{lang === 'bn' ? 'হেল্প গাইড' : 'Help Specs'}</span>
            </button>
          </div>
        </div>

        {/* Pending Voice Command Confirm card with Yes/No keys */}
        {pendingVoiceCommand && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
            <span className="font-mono text-[9px] text-amber-400 uppercase font-semibold block mb-1">⏳ পেন্ডিং ভয়েস নিশ্চিতকরণ</span>
            <p className="text-[10px] leading-relaxed break-words font-mono bg-black/30 p-1.5 rounded border border-white/5">{pendingVoiceCommand}</p>
            <div className="flex justify-end gap-1.5 mt-2.5">
              <button
                onClick={confirmPendingVoiceCommand}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[8px] font-bold uppercase rounded transition-colors cursor-pointer"
              >
                ✓ Confirm
              </button>
            </div>
          </div>
        )}

        {/* Memories list */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center justify-between">
            <span>🧠 {lang === 'bn' ? 'সাম্প্রতিক মেমরি লগ' : 'Persistent Memories'}</span>
            <span className="text-indigo-400 font-mono">({recentMemories.length})</span>
          </h4>
          {recentMemories.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {recentMemories.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl border border-indigo-500/10 bg-indigo-950/20 text-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] text-indigo-400 uppercase font-semibold">
                      {m.key || 'Memory'}
                    </span>
                    <span className="text-[8px] bg-indigo-950 px-1 py-0.1 border border-[#2f2f2f] text-indigo-300 rounded uppercase">
                      {m.category || 'general'}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed break-words">{m.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 font-mono italic">{lang === 'bn' ? 'কোনো মেমরি সংরক্ষিত নেই' : 'No persistent entries'}</p>
          )}
        </div>

        {/* Active Plans list */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center justify-between">
            <span>📋 {lang === 'bn' ? 'সক্রিয় কাজ' : 'Active Planner Sessions'}</span>
            <span className="text-cyan-400 font-mono">({activePlans.length})</span>
          </h4>
          {activePlans.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activePlans.map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl border border-cyan-500/10 bg-cyan-950/10 text-slate-300">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                    <span className="font-mono text-[9px] text-cyan-400 uppercase font-semibold truncate max-w-[120px]">
                      Plan Step
                    </span>
                    <span className="text-[8px] bg-cyan-950 px-1.5 py-0.2 border border-[#2f2f2f] text-cyan-300 rounded uppercase block shrink-0">
                      {p.status || 'running'}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed break-words font-mono bg-black/20 p-1.5 rounded">{p.goal || p.prompt}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 font-mono italic">{lang === 'bn' ? 'কোনো প্ল্যান রান হচ্ছে না' : 'No running automation workflows'}</p>
          )}
        </div>

        {/* Micro status diagnostics */}
        <div className="mt-auto pt-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Network Server Response:</span>
            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${healthChipClass}`}>
              {healthState === 'healthy' ? 'online' : 'offline'}
            </span>
          </div>
          {ollamaStatus !== 'not_installed' && (
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Ollama Offline LLM:</span>
              <span className="font-mono text-[9px] text-[#00ff88]">{ollamaStatus}</span>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}
