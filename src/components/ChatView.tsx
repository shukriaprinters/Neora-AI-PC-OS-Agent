import React, { useState, useRef, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { classifyNeoraInput, isLikelyOsCommand } from '../lib/neoraCommand';
import { NeoraApiError, neoraGet, neoraPost, neoraUpload } from '../lib/neoraApi';

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
  setGeminiKey
}: ChatViewProps) {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('neora_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('neora_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat messages:', e);
    }
  }, [messages]);
  const [inputValue, setInputValue] = useState('');
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

  // Whisper Speech Recording refs and state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [whisperStatus, setWhisperStatus] = useState<'idle' | 'recording' | 'transcribing' | 'error' | 'fallback'>('idle');

  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Ollama Client Integration states
  const [useOllama, setUseOllama] = useState<boolean>(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'available' | 'partial' | 'blocked' | 'not_installed'>('checking');
  const [ollamaModels, setOllamaModels] = useState<any[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('llama3');
  const healthState = statusEndpoint ? 'offline' : 'healthy';
  const healthChipClass: string =
    healthState === 'healthy'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';

  const checkOllamaStatus = async () => {
    try {
      const data: any = await neoraGet('/api/ollama/status');
      setOllamaStatus(data.status);
      setOllamaModels(data.models || []);
      if (data.models && data.models.length > 0) {
        const names = data.models.map((m: any) => m.name);
        if (!names.includes(selectedOllamaModel)) {
          setSelectedOllamaModel(names[0]);
        }
      }
    } catch {
      setOllamaStatus('not_installed');
      setStatusEndpoint('/api/ollama/status');
      setStatusBanner(lang === 'bn' ? 'Endpoint unavailable' : 'Endpoint unavailable');
    }
  };

  useEffect(() => {
    checkOllamaStatus();
    const interval = setInterval(checkOllamaStatus, 15000); // Poll status every 15s
    return () => clearInterval(interval);
  }, []);

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

  const speakQueueRef = useRef<{ cancel: () => void } | null>(null);

  const handleSpeak = (text: string, onSpeechFinished?: () => void) => {
    setIsSpeaking(true);
    if (!speakVolumeOn) {
      setIsSpeaking(false);
      if (onSpeechFinished) onSpeechFinished();
      return;
    }
    const cleanText = text.replace(/[`*#_\[\]]/g, '').replace(/\*\*/g, '').slice(0, 1800);
    const synth = window.speechSynthesis;
    if (!synth) {
      setIsSpeaking(false);
      if (onSpeechFinished) onSpeechFinished();
      return;
    }
    if (speakQueueRef.current) {
      speakQueueRef.current.cancel();
    }
    synth.cancel();

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

    const cancel = () => {
      cancelled = true;
      setIsSpeaking(false);
      synth.cancel();
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
      const utterance = new SpeechSynthesisUtterance(sentenceText);
      utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.98; // elegant and melodic rate
      utterance.pitch = 1.08; // gorgeous, soft female voice pitch
      
      const voices = synth.getVoices();
      
      // Proactively match sweet female Bengali voice or primary Google/Microsoft natural voices
      const preferred = voices.find(v => {
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
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
      handleSpeechCommand(transcript);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
  };

  const toggleMic = async () => {
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
    if (lowerText.includes('remind') || lowerText.includes('মনে করিয়ে') || lowerText.includes('রিমাইন্ডার')) {
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

    // 2. Determine AI Response Pathway: Ollama vs Groq vs Gemini LLM
    if (useOllama) {
      setIsGenerating(true);
      
      const loadingMsgId = Math.random().toString();
        const loadingMsg: Message = {
          id: loadingMsgId,
          role: 'assistant',
          content: lang === 'bn' ? `নিওরা অফলাইন ব্রেইন চিন্তাভাবনা করছে (Ollama: ${selectedOllamaModel} সক্রিয়)...` : `Neora offline brain is thinking (Ollama: ${selectedOllamaModel} Active)...`,
          timestamp: new Date().toLocaleTimeString(),
          classification: 'chat'
        };
      setMessages(prev => [...prev, loadingMsg]);

      // Define local fallback helper for Ollama errors
      const runLocalPresetFallback = () => {
        setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
        
        let botResponse = getOfflineReply(userText, lang);
        // If it was just a generic catch-all or default explanation, let's append Ollama-specific connection info
        if (botResponse.includes('লোকাল ডেমো মোড') || botResponse.includes('local demo mode')) {
          botResponse = lang === 'bn'
            ? `আমি আপনার কমান্ড বুঝতে পেরেছি বস, তবে আপনার লোকাল ওল্লামা (Ollama) ব্রেইনটি কানেক্ট করা সম্ভব হয়নি। দয়া করে নিশ্চিত করুন আপনার লোকাল পিসিতে ওল্লামা চালু আছে এবং "${selectedOllamaModel}" ইনস্টল করা আছে, অথবা ওপরের "Settings ⚙️" ট্যাবে গিয়ে Gemini API Key সেট করুন!`
            : `I understood your request, boss! However, I could not connect to your local Ollama instance on localhost. Please make sure Ollama is running and model "${selectedOllamaModel}" is installed, or enter a Gemini API Key in the "Settings ⚙️" tab.`;
        }

        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: botResponse,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botReply]);
        handleSpeak(botResponse);
      };

      try {
        const recentHistory = [...messages, newMsg].slice(-8);
        
        const resData: any = await neoraPost('/api/chat-ollama', {
          messages: recentHistory,
          model: selectedOllamaModel,
          lang: lang
        });
        
        if (resData.status === 'success' && resData.text) {
          const contentText = resData.text;
          setMessages(prev => prev.filter(m => m.id !== loadingMsgId).concat({
            id: Math.random().toString(),
            role: 'assistant',
            content: contentText,
            timestamp: new Date().toLocaleTimeString()
          }));
          handleSpeak(contentText);
        } else {
          throw new Error('Invalid raw response received from local Ollama');
        }
      } catch (err) {
        console.error('Ollama connection error, fallback triggered:', err);
        runLocalPresetFallback();
      } finally {
        setIsGenerating(false);
      }
    } else if (useGroq) {
      setIsGenerating(true);
      
      const loadingMsgId = Math.random().toString();
      const loadingMsg: Message = {
        id: loadingMsgId,
        role: 'assistant',
        content: lang === 'bn' ? 'নিওরা চিন্তাভাবনা করছে (Groq সক্রিয়)...' : 'Neora is thinking (Groq Active)...',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, loadingMsg]);

      // Define local fallback helper for Groq errors
      const runLocalPresetFallback = () => {
        setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
        
        let botResponse = getOfflineReply(userText, lang);
        // If it was just a generic catch-all or default explanation, append Groq-specific connection warning
        if (botResponse.includes('লোকাল ডেমো মোড') || botResponse.includes('local demo mode')) {
          botResponse = lang === 'bn'
            ? `আমি আপনার মেসেজ বুঝতে পেরেছি বস, তবে গ্রক (Groq) লাইভ API সংযোগ করা সম্ভব হয়নি। দয়া করে ওপরের "Settings ⚙️" ট্যাবে গিয়ে আপনার Groq API Key যুক্ত করুন বা Gemini API Key সেট করে লাইভ মানুষের মতো চ্যাট শুরু করুন!`
            : `I understood your message, boss! However, I could not connect to the live Groq API. Please add your Groq API Key in the "Settings ⚙️" tab or enter a Gemini API Key to enable my live conversation mode!`;
        }

        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: botResponse,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botReply]);
        handleSpeak(botResponse);
      };

      try {
        const recentHistory = [...messages, newMsg].slice(-8);
        
        const resData: any = await neoraPost('/api/chat-groq', {
          messages: recentHistory,
          model: groqModel,
          key: groqKey,
          lang: lang
        });
        
        if (resData.status === 'api_key_missing') {
          setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
          const warningContent = lang === 'bn'
            ? '❌ আপনার Groq API Key সেট করা পাওয়া যায়নি। অনুগ্রহ করে উপরের "Settings⚙️/DevStudio" ট্যাবে গিয়ে একটি সঠিক কী সাবমিট করুন।'
            : '❌ Your Groq API Key was not found. Please click on Settings/DevStudio tab above to save a key first.';
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            role: 'assistant',
            content: warningContent,
            timestamp: new Date().toLocaleTimeString()
          }]);
        } else if (resData.status === 'success' && resData.data?.choices?.[0]?.message?.content) {
          const contentText = resData.data.choices[0].message.content;
          setMessages(prev => prev.filter(m => m.id !== loadingMsgId).concat({
            id: Math.random().toString(),
            role: 'assistant',
            content: contentText,
            timestamp: new Date().toLocaleTimeString()
          }));
          handleSpeak(contentText);
          setLastResult(contentText);
          setStatusEndpoint(null);
          setStatusBanner(null);
        } else {
          throw new Error('Invalid response payload from Groq');
        }
      } catch (err) {
        console.error('Groq live engine error, fallback triggered:', err);
        const endpointLabel = err instanceof NeoraApiError ? err.endpoint : '/api/chat-groq';
        setStatusEndpoint(endpointLabel);
        setStatusBanner(lang === 'bn' ? 'Groq সংযোগ ব্যর্থ' : 'Groq connection failed');
        runLocalPresetFallback();
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Dynamic Gemini Active LLM Query Flow with Adaptive Local Fallback
      setIsGenerating(true);
      const loadingMsgId = Math.random().toString();
      const loadingMsg: Message = {
        id: loadingMsgId,
        role: 'assistant',
        content: lang === 'bn' ? 'নিওরা চিন্তাভাবনা করছে (Gemini सक्रिय)...' : 'Neora is thinking (Gemini Active)...',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, loadingMsg]);

      // Define local preset recovery function
      const runLocalPresetFallback = () => {
        // Remove typing indicator if present
        setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
        
        const botResponse = getOfflineReply(userText, lang);

        const botReply: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: botResponse,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botReply]);
        handleSpeak(botResponse);
      };

      try {
        const recentHistory = [...messages, newMsg].slice(-8);
        const resData: any = await neoraPost('/api/chat-gemini', {
          messages: recentHistory,
          lang: lang,
          geminiKey: geminiKey
        });
        
        if (resData.status === 'api_key_missing') {
          runLocalPresetFallback();
          setIsGenerating(false);
          return;
        }

        if (resData.status === 'success' && resData.text) {
          // Speak and render human-like dynamic response
          setMessages(prev => prev.filter(m => m.id !== loadingMsgId).concat({
            id: Math.random().toString(),
            role: 'assistant',
            content: resData.text,
            timestamp: new Date().toLocaleTimeString()
          }));
          handleSpeak(resData.text);
          setLastResult(resData.text);
          setStatusEndpoint(null);
          setStatusBanner(null);
        } else {
          throw new Error('Invalid response payload');
        }
      } catch (err) {
        console.error('Gemini live engine error, fallback triggered:', err);
        const endpointLabel = err instanceof NeoraApiError ? err.endpoint : '/api/chat-gemini';
        setStatusEndpoint(endpointLabel);
        setStatusBanner(lang === 'bn' ? 'Gemini সংযোগ ব্যর্থ' : 'Gemini connection failed');
        runLocalPresetFallback();
      } finally {
        setIsGenerating(false);
      }
    }
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
        <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wider flex items-center gap-1.5 font-mono uppercase">
            <span>Neora AI</span>
            {useGroq ? (
              <span className="text-[9px] bg-indigo-950/40 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/30">
                Groq Active ({groqModel.split('-')[0].toUpperCase()})
              </span>
            ) : (
              <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-800/30">
                Gemini Edition
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/20 transition-all cursor-pointer"
              title={lang === 'bn' ? 'চ্যাট হিস্ট্রি মুছুন' : 'Reset Conversation'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setSpeakVolumeOn(!speakVolumeOn)}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              speakVolumeOn ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-950 text-slate-500 border border-slate-850'
            }`}
            title={speakVolumeOn ? 'Vocal Synthesis Output ON' : 'Vocal Synthesis Output MUTED'}
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

      {/* Groq Settings panel */}
      {showSettings && (
      <div className="p-4 bg-slate-900/80 border-b border-indigo-950/45 space-y-3 animate-fade-in text-xs font-mono transition-all panel-surface-strong">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold uppercase text-[10px] tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'bn' ? 'বিনামূল্যে Groq এপিআই সেটিংস' : 'FREE GROQ API COMPILER SETTINGS'}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'Groq এআই সক্রিয়:' : 'Enable Groq AI:'}</span>
              <button
                onClick={() => setUseGroq(!useGroq)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  useGroq 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-950 text-slate-500 border border-slate-850'
                }`}
              >
                {useGroq ? (lang === 'bn' ? 'হ্যাঁ' : 'ACTIVE') : (lang === 'bn' ? 'না' : 'DISABLED')}
              </button>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            {lang === 'bn' 
              ? 'নিওরা পেইড এপিআই ছাড়াই সম্পূর্ণরূপে বিনামূল্যে ব্যবহারের জন্য Groq ক্লাউড সাপোর্ট করে। এটি অতি দ্রুত গতিসম্পন্ন Llama ও Gemma ওপেন-সোর্স এআই মডেলগুলোর সার্ভিস প্রদান করে।' 
              : 'Neora supports Groq Cloud completely free for developer setups, providing sub-second low latency Llama 3 & Gemma models without expensive recurring plans.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1.5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">{lang === 'bn' ? 'ব্যক্তিগত Groq এপিআই কি:' : 'Personal Groq API Key:'}</label>
              <input
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-205 placeholder-slate-705 outline-none focus:border-indigo-500/50"
              />
              <span className="text-[8px] text-slate-500 block leading-tight">
                {lang === 'bn' 
                  ? '✦ আপনার ব্রাউজারের লোকাল-স্টোরেজে সংরক্ষিত থাকবে, কোনো সার্ভারে লক হবে না।' 
                  : '✦ Stored locally in your client browser cache; never hardcoded on remote endpoints.'}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">{lang === 'bn' ? 'পছন্দসই এআই মডেল:' : 'Select AI Model Brain:'}</label>
              <select
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-205 outline-none focus:border-indigo-500/50"
              >
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile & Smart)</option>
                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Sub-second Instant)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B (Deep reasoning context)</option>
                <option value="gemma2-9b-it">Gemma 2 9B (Google Open weights)</option>
              </select>
              <span className="text-[8px] text-slate-500 block leading-tight">
                {lang === 'bn' 
                  ? '✦ মেমরি এবং লজিক্যাল অ্যাকশনের জন্য 70B মডেলটি রিকমেন্ডেড।' 
                  : '✦ Ultra-fast open weight models powered by Groq LPUs.'}
              </span>
            </div>
          </div>

          {/* Gemini API Settings Panel */}
          <div className="border-t border-slate-800/80 pt-3.5 mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase text-[10px] tracking-wider text-rose-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>{lang === 'bn' ? 'ব্যক্তিগত Gemini এপিআই সেটিংস' : 'PERSONAL GEMINI API SETTINGS'}</span>
              </span>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              {lang === 'bn' 
                ? 'গুগল জেমিনি এআই সচল করতে বা লোকাল পিসি-তে অফলাইনে ব্যবহারের জন্য আপনার এপিআই কি দিন। এটি উন্নত স্পীড ও সম্পূর্ণ বাংলা ও ইংরেজি অটোমেশন প্রম্পট প্রসেস করতে সাহায্য করে।' 
                : 'Configure Google Gemini API Client to enable state-of-the-art native intelligence. Runs with zero latencies on both local setups and AI studio cloud hosts.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1.5">
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                  {lang === 'bn' ? 'ব্যক্তিগত Gemini এপিআই কি:' : 'Personal Gemini API Key:'}
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-205 placeholder-slate-705 outline-none focus:border-rose-500/50"
                />
                <span className="text-[8px] text-slate-500 block leading-tight">
                  {lang === 'bn' 
                    ? '✦ আপনার ব্রাউজারের ক্যাশে নিরাপদে সংরক্ষিত থাকবে।' 
                    : '✦ Saved securely in your browser cache. Extends offline setup instantly.'}
                </span>
              </div>
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">
                  {lang === 'bn' ? 'সক্রিয় জেমিনি মডেল:' : 'Active Gemini Model:'}
                </label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-rose-400 font-bold font-mono">
                  gemini-3.5-flash (Standard)
                </div>
                <span className="text-[8px] text-slate-500 block leading-tight">
                  {lang === 'bn' 
                    ? '✦ Neora স্বয়ংক্রিয়ভাবে জেমিনি ৩.৫ ফ্ল্যাশ ব্যবহার করে।' 
                    : '✦ Fully optimized version for low-level automation compilers.'}
                </span>
              </div>
            </div>
          </div>

          {/* Ollama Local Offline AI Brain Panel */}
          <div className="border-t border-slate-800/80 pt-3.5 mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase text-[10px] tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'লোকাল ওল্লামা অফলাইন এআই ব্রেইন' : 'LOCAL OLLAMA OFFLINE AI BRAIN'}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'ওল্লামা অফলাইন মোড:' : 'Enable Local Ollama:'}</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextUseOllama = !useOllama;
                    setUseOllama(nextUseOllama);
                    if (nextUseOllama) {
                      setUseGroq(false); // Make them mutually exclusive
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    useOllama 
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-slate-950 text-slate-500 border border-slate-850'
                  }`}
                >
                  {useOllama ? (lang === 'bn' ? 'সক্রিয়' : 'ACTIVE') : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'DISABLED')}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              {lang === 'bn' 
                ? 'ওল্লামা আপনাকে সম্পূর্ণ ইন্টারনেটবিহীন অফলাইনে কাজ করার সুবিধা দেয়। আপনার কম্পিউটারে চলা Llama3 বা DeepSeek-R1 মডেলগুলোর সাথে এটি সরাসরি যুক্ত হয়।' 
                : 'Ollama integration enables completely private, internet-free offline processing. It maps prompts straight to llama3, mistral, or deepseek-r1 models running inside your offline local container setup.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1.5">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">{lang === 'bn' ? 'ওল্লামা অফলাইন স্ট্যাটাস:' : 'Ollama Offline Connection:'}</span>
                <div className="flex items-center gap-2">
                  {ollamaStatus === 'checking' && (
                    <span className="text-amber-400 text-xs flex items-center gap-1.5 font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking local...
                    </span>
                  )}
                  {ollamaStatus === 'available' && (
                    <span className="text-emerald-400 text-xs font-bold uppercase flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {lang === 'bn' ? 'সংযুক্ত' : 'CONNECTED'}
                    </span>
                  )}
                  {ollamaStatus === 'not_installed' && (
                    <span className="text-slate-500 text-xs font-bold uppercase flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {lang === 'bn' ? 'অফলাইন' : 'OFFLINE'}
                    </span>
                  )}
                  {ollamaStatus === 'partial' && (
                    <span className="text-amber-500 text-xs font-bold uppercase flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      {lang === 'bn' ? 'আংশিক' : 'PARTIAL'}
                    </span>
                  )}
                  <button 
                    type="button" 
                    onClick={checkOllamaStatus}
                    className="p-1 text-slate-400 hover:text-white rounded bg-slate-950 border border-slate-800 transition"
                    title="Perform Manual Handshake"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[8px] text-slate-500 block leading-tight">
                  {lang === 'bn' 
                    ? '✦ নিশ্চিত করুন ওল্লামা পোর্ট ১১৪৩৪-এ লোকালহোস্টে সচল রয়েছে।' 
                    : '✦ Automatically detects Ollama listening daemon running locally on Port 11434.'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wide block">{lang === 'bn' ? 'ওল্লামা মডেল নির্বাচন:' : 'Select Ollama Model:'}</label>
                {ollamaModels.length > 0 ? (
                  <select
                    value={selectedOllamaModel}
                    onChange={(e) => setSelectedOllamaModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-205 outline-none focus:border-cyan-500/50"
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
                    ? '✦ নতুন মডেল ডাউনলোড করতে ওল্লামায় "ollama run" ট্রাই করুন।' 
                    : '✦ Discovered active model weights. Run "ollama run llama3" or "ollama run deepseek-r1" to fetch.'}
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
                          ? (useGroq ? `Neora AI (${groqModel.split('-')[0].toUpperCase()} - Groq Client)` : 'Neora AI (Gemini Core)') 
                          : (lang === 'bn' ? 'আপনি (শুকরিয়া প্রিন্টার্স)' : 'You (Shukria Printers)')}
                      </span>
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
                    
                    <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                      isBot 
                        ? 'bg-slate-900/60 border-slate-800/80 text-slate-200 shadow-slate-950/40 rounded-tl-none' 
                        : 'bg-cyan-950/25 border-cyan-500/20 text-cyan-100 rounded-tr-none'
                    }`}>
                      {m.content}
                    </div>
                    
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

          <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800/90 rounded-full py-1.5 pl-4 pr-1.5 focus-within:border-cyan-500/50 shadow-[0_4px_24px_rgba(0,0,0,0.5)] focus-within:shadow-[0_0_24px_rgba(6,182,212,0.1)] transition-all">
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
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  inputValue.trim() 
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                    : 'bg-slate-950 text-slate-600 border border-slate-800 pointer-events-none'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
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
