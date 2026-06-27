import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Zap, CheckCircle2, Clock, Volume2, Laptop, Play } from 'lucide-react';
import { classifyNeoraInput } from '../lib/neoraCommand';
import { neoraPost } from '../lib/neoraApi';

interface VoiceCommandPanelProps {
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
  onAddNote: (title: string, content: string) => void;
  onAddReminder: (title: string, remindAt: string, repeat: 'none' | 'daily' | 'weekly' | 'monthly') => void;
  onNavigate: (tab: string) => void;
  onClose: () => void;
  lang: 'en' | 'bn';
  onSelfEvolution?: (action: string) => void;
}

interface RecentCmd {
  id: string;
  transcript: string;
  action: string;
  time: string;
  success: boolean;
}

type SRResult = {
  results: { [i: number]: { [j: number]: { transcript: string } } };
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const NAV_ALIASES: Record<string, string> = {
  chat: 'chat', 'neural chat': 'chat', home: 'chat',
  automation: 'autonomy', planner: 'autonomy', plan: 'autonomy',
  memory: 'productivity', organizer: 'productivity', notes: 'productivity',
  invoice: 'invoice', billing: 'invoice', earning: 'invoice',
  settings: 'dev', 'dev studio': 'dev', developer: 'dev',
  'os agent': 'osAgent', agent: 'osAgent', os: 'osAgent',
  roadmap: 'roadmap',
  workspace: 'vscode', 'vs code': 'vscode', vscode: 'vscode',
  blueprints: 'blueprint', blueprint: 'blueprint', specs: 'blueprint',
};

function parseCommand(text: string): { type: string; payload: any } | null {
  const t = text.toLowerCase().trim();

  // Robust flexible navigation check for both English and Bangla commands
  const lowerT = t.toLowerCase();
  let foundTab: string | null = null;
  let foundDest = "";

  if (
    lowerT.includes('os agent') ||
    lowerT.includes('os-agent') ||
    lowerT.includes('ওএস এজেন্ট') ||
    lowerT.includes('ওএস-এজেন্ট') ||
    (lowerT.includes('os') && lowerT.includes('agent')) ||
    (lowerT.includes('ওএস') && lowerT.includes('এজেন্ট'))
  ) {
    foundTab = "osAgent";
    foundDest = "os agent";
  } else if (
    lowerT.includes('dev studio') ||
    lowerT.includes('developer') ||
    lowerT.includes('settings') ||
    lowerT.includes('setting') ||
    lowerT.includes('seeting') ||
    lowerT.includes('seetings') ||
    lowerT.includes('ডেভ স্টুডিও') ||
    lowerT.includes('ডেভেলপার') ||
    lowerT.includes('সেটিংস') ||
    lowerT.includes('সেটিং') ||
    lowerT.includes('থিক করো') ||
    lowerT.includes('ঠিক করো') ||
    lowerT.includes('fix settings') ||
    lowerT.includes('fix setting')
  ) {
    foundTab = "dev";
    foundDest = "dev studio";
  } else if (
    lowerT.includes('vscode') ||
    lowerT.includes('workspace') ||
    lowerT.includes('code editor') ||
    lowerT.includes('ভিএস কোড') ||
    lowerT.includes('ভিএসকোড') ||
    lowerT.includes('ওয়ার্কস্পেস')
  ) {
    foundTab = "vscode";
    foundDest = "workspace";
  } else if (
    lowerT.includes('blueprint') ||
    lowerT.includes('specs') ||
    lowerT.includes('ব্লুপ্রিন্ট') ||
    lowerT.includes('স্পেক্স')
  ) {
    foundTab = "blueprint";
    foundDest = "blueprints";
  } else if (
    lowerT.includes('roadmap') ||
    lowerT.includes('রোডম্যাপ')
  ) {
    foundTab = "roadmap";
    foundDest = "roadmap";
  } else if (
    lowerT.includes('planner') ||
    lowerT.includes('autonomy') ||
    lowerT.includes('প্ল্যানার') ||
    lowerT.includes('অটোনমি')
  ) {
    foundTab = "autonomy";
    foundDest = "autonomy";
  } else if (
    lowerT.includes('productivity') ||
    lowerT.includes('organizer') ||
    lowerT.includes('notes') ||
    lowerT.includes('অর্গানাইজার') ||
    lowerT.includes('নোটস')
  ) {
    foundTab = "productivity";
    foundDest = "productivity";
  } else if (
    lowerT.includes('invoice') ||
    lowerT.includes('billing') ||
    lowerT.includes('earning') ||
    lowerT.includes('ইনভয়েস') ||
    lowerT.includes('বিলিং') ||
    lowerT.includes('আর্নিং')
  ) {
    foundTab = "invoice";
    foundDest = "invoice";
  }

  if (foundTab) {
    const isAction = lowerT.includes('open') || lowerT.includes('go to') || lowerT.includes('navigate') || lowerT.includes('show') || lowerT.includes('খোলো') || lowerT.includes('খুলুন') || lowerT.includes('যাও') || lowerT.includes('দেখাও') || lowerT.includes('ওপেন') || lowerT.includes('ঠিক করো') || lowerT.includes('thik koro') || lowerT.includes('fix');
    if (isAction || lowerT.split(' ').length <= 5) {
      return { type: 'navigate', payload: { tab: foundTab, dest: foundDest } };
    }
  }

  if (
    t.includes('optimize') ||
    t.includes('self-evolution') ||
    t.includes('self evolution') ||
    t.includes('অপ্টিমাইজ') ||
    t.includes('সিস্টেম আপডেট') ||
    t.includes('উন্নয়ন') ||
    t.includes('evolution') ||
    t.includes('autopilot') ||
    t.includes('অটোপাইলট') ||
    t.includes('ইভোলিউশন')
  ) {
    return { type: 'self-evolution', payload: { action: 'optimize-dashboard' } };
  }

  if (t.startsWith('task:') || t.startsWith('add task') || t.startsWith('create task') || t.startsWith('new task') || t.includes('add a task') || t.includes('task to create') || t.includes('টাস্ক') || t.includes('কাজ')) {
    const cleanPrefixRegex = /^(task:|add task|create task|new task|add a task|create a task|নতুন কাজ|টাস্ক যোগ কর|টাস্ক|কাজ)/i;
    const title = text.replace(cleanPrefixRegex, '').trim();
    if (!title) return null;
    
    // Auto-detect priority with multi-language keywords
    const priority = (t.includes('urgent') || t.includes('critical') || t.includes('জরুরী') || t.includes('জরুরি') || t.includes('অতি গুরুত্বপূর্ণ') || t.includes('অত্যন্ত জরুরী')) ? 'critical'
      : (t.includes('high') || t.includes('important') || t.includes('গুরুত্বপূর্ণ') || t.includes('গুরুত্বপুর্ন')) ? 'high'
      : (t.includes('low') || t.includes('trivial') || t.includes('সাধারণ') || t.includes('কম গুরুত্বপূর্ণ')) ? 'low'
      : 'medium';
    
    return { type: 'task', payload: { title, priority } };
  }

  if (t.startsWith('note:') || t.startsWith('add note') || t.startsWith('save note') || t.startsWith('write note')) {
    const content = text.replace(/^(note:|add note|save note|write note)/i, '').trim();
    if (!content) return null;
    const words = content.split(' ');
    const title = words.slice(0, 5).join(' ');
    return { type: 'note', payload: { title, content } };
  }

  if (t.startsWith('remind') || t.startsWith('reminder:') || t.startsWith('set reminder')) {
    const content = text.replace(/^(remind me to|remind me|reminder:|set reminder)/i, '').trim();
    if (!content) return null;
    const remindAt = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
    return { type: 'reminder', payload: { title: content, remindAt, repeat: 'none' } };
  }

  if (t.startsWith('open ') || t.startsWith('go to ') || t.startsWith('navigate to ') || t.startsWith('show ')) {
    const dest = t.replace(/^(open |go to |navigate to |show )/, '').trim();
    const tab = NAV_ALIASES[dest];
    if (tab) return { type: 'navigate', payload: { tab, dest } };
  }

  for (const [alias, tab] of Object.entries(NAV_ALIASES)) {
    if (t === alias || t === `show ${alias}` || t === `open ${alias}`) {
      return { type: 'navigate', payload: { tab, dest: alias } };
    }
  }

  return null;
}

export function VoiceCommandPanel({ onAddTask, onAddNote, onAddReminder, onNavigate, onClose, lang, onSelfEvolution }: VoiceCommandPanelProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [recent, setRecent] = useState<RecentCmd[]>([]);
  const [bars, setBars] = useState<number[]>(new Array(32).fill(0.12));
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const speakFeedback = useCallback((text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 1500));
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.98;
    utterance.pitch = 1.08; // gorgeous, soft female voice pitch
    
    const voices = synth.getVoices();
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
      v.lang.startsWith(lang === 'bn' ? 'bn' : 'en') &&
      (v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith(lang === 'bn' ? 'bn' : 'en'));
    
    if (preferred) utterance.voice = preferred;
    synth.speak(utterance);
  }, [lang]);

  const startVisualizer = useCallback(async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        if (stream) {
          streamRef.current = stream;
          const ctx = new AudioContextClass();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64; // Creates 32 bin frequencies
          analyserRef.current = analyser;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);
        }
      }
    } catch (err) {
      console.warn("Real-time Mic Audio Stream Context disabled:", err);
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    let startTime = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const nextBars = Array.from({ length: 32 }, (_, i) => {
          const val = dataArray[i] !== undefined ? dataArray[i] / 255 : 0;
          const bell = Math.sin((i / 31) * Math.PI); // center bell curve modulator
          return Math.max(0.12, val * 1.6 * (bell * 0.75 + 0.25) + Math.sin(elapsed * 12 + i * 0.4) * 0.04);
        });
        setBars(nextBars);
      } else {
        // Multi-harmonic procedurally Synthesized Audio Waveform
        const nextBars = Array.from({ length: 32 }, (_, i) => {
          const wave1 = Math.sin(elapsed * 10 + i * 0.25) * 0.32;
          const wave2 = Math.cos(elapsed * 15 - i * 0.4) * 0.18;
          const wave3 = Math.sin(elapsed * 5 + i * 0.7) * 0.12;
          const bell = Math.sin((i / 31) * Math.PI);
          return Math.max(0.12, (0.45 + wave1 + wave2 + wave3) * bell);
        });
        setBars(nextBars);
      }
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
  }, []);

  const stopVisualizer = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    let startTime = Date.now();
    const settle = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 0.8) {
        setBars(new Array(32).fill(0.12));
        return;
      }
      setBars(prev => prev.map(h => {
        const targetRest = 0.12 + Math.sin(elapsed * 4 + Math.random()) * 0.02;
        return h * 0.78 + targetRest * 0.22;
      }));
      animationRef.current = requestAnimationFrame(settle);
    };
    animationRef.current = requestAnimationFrame(settle);
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';

    recognition.onresult = (e: SRResult) => {
      let interim = '';
      for (let i = 0; i < Object.keys(e.results).length; i++) {
        interim += e.results[i][0].transcript;
      }
      setTranscript(interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      stopVisualizer();
    };

    recognition.onerror = () => {
      setIsListening(false);
      stopVisualizer();
    };

    recognitionRef.current = recognition;

    const timer = setTimeout(() => {
      try {
        setTranscript('');
        setFeedback(null);
        setIsListening(true);
        startVisualizer();
        recognition.start();
      } catch (err) {
        console.warn("Auto-start mic recognition failed or blocked:", err);
      }
    }, 400);

    return () => { 
      clearTimeout(timer);
      recognition.abort(); 
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [lang, startVisualizer, stopVisualizer]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setTranscript('');
    setFeedback(null);
    setIsListening(true);
    startVisualizer();
    recognitionRef.current.start();
  }, [isListening, startVisualizer]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    stopVisualizer();
  }, [stopVisualizer]);

  useEffect(() => {
    if (!isListening && transcript.trim()) {
      const cmd = parseCommand(transcript);
      if (cmd) {
        let actionLabel = '';
        let ok = true;
        try {
          if (cmd.type === 'task') {
            onAddTask(cmd.payload.title, cmd.payload.priority);
            actionLabel = `Task created: "${cmd.payload.title}"`;
          } else if (cmd.type === 'note') {
            onAddNote(cmd.payload.title, cmd.payload.content);
            actionLabel = `Note saved: "${cmd.payload.title}"`;
          } else if (cmd.type === 'reminder') {
            onAddReminder(cmd.payload.title, cmd.payload.remindAt, cmd.payload.repeat);
            actionLabel = `Reminder set: "${cmd.payload.title}"`;
          } else if (cmd.type === 'navigate') {
            onNavigate(cmd.payload.tab);
            actionLabel = `Navigated to ${cmd.payload.dest}`;
          } else if (cmd.type === 'self-evolution') {
            onNavigate('evolution');
            if (onSelfEvolution) {
              onSelfEvolution(cmd.payload.action);
            }
            actionLabel = lang === 'bn' 
              ? 'সেলফ-ইভোলিউশন শুরু করেছি, সোনামণি! অপ্টিমাইজ করছি! 🤖🧬✨' 
              : 'Autonomous layout optimization and self-evolution executed, sweetheart! 🤖🧬✨';
          }
        } catch {
          ok = false;
          actionLabel = 'Command failed';
        }
        setFeedback({ msg: actionLabel, ok });
        if (ok) speakFeedback(actionLabel);
        else speakFeedback(lang === 'bn' ? 'কমান্ড ব্যর্থ হয়েছে' : 'Command failed');
        setRecent(prev => [{
          id: Date.now().toString(),
          transcript,
          action: actionLabel,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          success: ok,
        }, ...prev.slice(0, 4)]);
        setTranscript('');
        setTimeout(() => setFeedback(null), 3500);
      } else {
        // Fallback: Smart Cognitive OS Agent Voice Command Router
        const osRoute = classifyNeoraInput(transcript);
        if (osRoute.classification === 'os-command') {
          let actionLabel = '';
          const dispatchingMsg = lang === 'bn' 
            ? `অনুমোদিত! পিসিতে ওএস কমান্ড পাঠানো হচ্ছেঃ "${transcript}"` 
            : `Authorizing: Dispatching OS Command: => "${transcript}"`;
          setFeedback({ msg: dispatchingMsg, ok: true });
          
          const speakWaitingMsg = lang === 'bn'
            ? `অনুমোদিত, বস্! আপনার পিসিতে অপারেশন রান করা হচ্ছে।`
            : `Access granted, boss! Launching command sequence on your computer.`;
          speakFeedback(speakWaitingMsg);
          
          const token = localStorage.getItem('neora_token') || 'NEORA-X7-AGENT';
          const geminiKey = localStorage.getItem('neora_gemini_key') || '';
          
          neoraPost('/api/os/command', { prompt: osRoute.normalized, token, geminiKey })
            .then((resData: any) => {
              if (resData && resData.status === 'success') {
                actionLabel = lang === 'bn'
                  ? `নিওরা পিসি অপারেটরঃ "${transcript}" সফলভাবে পাঠানো হয়েছে!`
                  : `Neora PC Operator: Actioned "${transcript}" successfully!`;
                
                const finalSuccessMsg = lang === 'bn'
                  ? `অপারেশন সচল করা হয়েছে, বস্!`
                  : `Command executed successfully, boss!`;
                speakFeedback(finalSuccessMsg);
                
                setFeedback({ msg: actionLabel, ok: true });
                setRecent(prev => [{
                  id: Date.now().toString(),
                  transcript,
                  action: actionLabel,
                  time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                  success: true,
                }, ...prev.slice(0, 4)]);
              } else {
                throw new Error("Rejected");
              }
            })
            .catch(() => {
              const errMsg = lang === 'bn'
                ? `পিসির সাথে সংযোগ করা যায়নি। স্ক্রিপ্টটি চালু আছে কিনা নিশ্চিত করুন।`
                : `PC connection failed. Ensure the Neora Python script is running.`;
              setFeedback({ msg: errMsg, ok: false });
              speakFeedback(lang === 'bn' ? 'কনেকশন ব্যর্থ হয়েছে' : 'Connection failed');
              setRecent(prev => [{
                id: Date.now().toString(),
                transcript,
                action: 'OS Command Failed',
                time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                success: false,
              }, ...prev.slice(0, 4)]);
            });
            
          setTranscript('');
          setTimeout(() => setFeedback(null), 6000);
        } else {
          const unknownMsg = lang === 'bn' ? `কমান্ড বোঝা যায়নি: "${transcript}"` : `Unknown command: "${transcript}"`;
          setFeedback({ msg: unknownMsg, ok: false });
          speakFeedback(lang === 'bn' ? 'কমান্ড বোঝা যায়নি' : 'Command not recognized. Try saying task, note, or remind me to.');
          setTimeout(() => setFeedback(null), 3000);
        }
      }
    }
  }, [isListening, transcript, onAddTask, onAddNote, onAddReminder, onNavigate, onSelfEvolution]);

  const BAR_COLOR = isListening ? '#00d4ff' : 'rgba(0,212,255,0.25)';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-end p-4 sm:items-center sm:justify-center"
      style={{ background: 'rgba(0,4,14,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl overflow-hidden w-full max-w-md"
        style={{
          background: 'linear-gradient(135deg, rgba(0,10,30,0.98) 0%, rgba(0,5,18,0.95) 100%)',
          border: '1px solid rgba(0,212,255,0.25)',
          boxShadow: '0 0 0 1px rgba(0,212,255,0.06), 0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,212,255,0.08)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.8), transparent)' }} />
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-px" style={{ background: '#00d4ff' }} />
        <div className="absolute top-0 left-0 w-px h-8" style={{ background: '#00d4ff' }} />
        <div className="absolute bottom-0 right-0 w-8 h-px" style={{ background: 'rgba(0,212,255,0.4)' }} />
        <div className="absolute bottom-0 right-0 w-px h-8" style={{ background: 'rgba(0,212,255,0.4)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" style={{ color: '#00d4ff' }} />
            <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#00d4ff' }}>
              VOICE COMMAND
            </span>
            {isListening && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', animation: 'glow-pulse 1s infinite' }}>
                LISTENING
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded transition-colors hover:bg-white/5" style={{ color: 'rgba(148,163,184,0.6)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main area */}
        <div className="p-5 space-y-5">
          {/* Mic + waveform */}
          <div className="flex flex-col items-center gap-4">
            {/* Mic button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!supported}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isListening
                  ? 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, rgba(0,212,255,0.08) 60%, transparent 100%)'
                  : 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
                border: `2px solid ${isListening ? '#00d4ff' : 'rgba(0,212,255,0.25)'}`,
                boxShadow: isListening ? '0 0 30px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)' : 'none',
              }}
            >
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(0,212,255,0.08)' }} />
                  <div className="absolute inset-[-8px] rounded-full" style={{ border: '1px solid rgba(0,212,255,0.15)', animation: 'arc-reactor-ring 3s linear infinite' }} />
                </>
              )}
              {isListening
                ? <MicOff className="w-8 h-8 relative z-10" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.8))' }} />
                : <Mic className="w-8 h-8 relative z-10" style={{ color: supported ? '#00d4ff' : '#64748b' }} />
              }
            </button>

            {/* Real-time fluid 3D equalized audio waveform bars */}
            <div className="flex items-center justify-center gap-[3px] h-14 w-full px-4 rounded-xl" style={{ background: 'rgba(0,10,32,0.4)', border: '1px solid rgba(0,212,255,0.06)' }}>
              {bars.map((h, i) => {
                const centerOffset = Math.abs(i - 15.5) / 16;
                const r = Math.floor(0 + centerOffset * 40);
                const g = Math.floor(212 + (1 - centerOffset) * 43);
                const b = Math.floor(255 - centerOffset * 30);
                const color = isListening ? `rgb(${r},${g},${b})` : 'rgba(0,212,255,0.18)';
                return (
                  <div
                    key={i}
                    className="w-[4px] rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(3, h * 46)}px`,
                      background: color,
                      boxShadow: isListening ? `0 0 10px rgba(${r},${g},${b},0.6)` : 'none',
                      opacity: isListening ? 0.95 : 0.4,
                      transform: `scaleY(${isListening ? 1 : 0.8})`,
                    }}
                  />
                );
              })}
            </div>

            {/* Status text */}
            <div className="text-center">
              {!supported ? (
                <p className="text-xs font-mono" style={{ color: '#ff4466' }}>
                  Speech recognition not supported in this browser
                </p>
              ) : isListening ? (
                <p className="text-xs font-mono" style={{ color: '#00d4ff' }}>
                  {transcript || 'Listening… speak your command'}
                </p>
              ) : (
                <p className="text-xs font-mono" style={{ color: 'rgba(148,163,184,0.5)' }}>
                  Tap the mic to start voice command
                </p>
              )}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{
              background: feedback.ok ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,102,0.08)',
              border: `1px solid ${feedback.ok ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,102,0.25)'}`,
            }}>
              {feedback.ok
                ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#00ff88' }} />
                : <Zap className="w-4 h-4 shrink-0" style={{ color: '#ff4466' }} />
              }
              <span className="text-xs font-mono" style={{ color: feedback.ok ? '#00ff88' : '#ff6680' }}>
                {feedback.msg}
              </span>
            </div>
          )}

          {/* Command guide */}
          <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.08)' }}>
            <div className="jarvis-label mb-2 flex items-center justify-between">
              <span>COMMAND SYNTAX</span>
              <span className="text-[9px] font-mono font-bold text-[#00ff88] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                OS COGNITIVE VOICE ENABLED
              </span>
            </div>
            {(lang === 'bn' ? [
              { cmd: '"পেইন্ট খোলো এবং ডিজাইন করো"', desc: 'আঁকার কাজ সচল' },
              { cmd: '"ফটোশপ শুরু করো"', desc: 'ব্যানার ডিজাইন' },
              { cmd: '"ওয়ার্ডে চিঠি লিখুন"', desc: 'অফিসিয়াল রিপোর্ট' },
              { cmd: '"স্ক্রিনশট নাও"', desc: 'পিসি স্ক্রিন ক্যাপচার' },
              { cmd: '"শো ওএস এজেন্ট"', desc: 'কন্ট্রোলার পেজ' },
            ] : [
              { cmd: '"open paint and draw"', desc: 'Draw creative circle' },
              { cmd: '"open photoshop and design"', desc: 'Design billing banner' },
              { cmd: '"winword write business report"', desc: 'Create DOCX file' },
              { cmd: '"take desktop screenshot"', desc: 'Capture active PC screen' },
              { cmd: '"show os agent"', desc: 'Open controller tab' },
            ]).map(({ cmd, desc }) => (
              <div key={cmd} className="flex items-center justify-between gap-2">
                <code className="text-[10px] font-mono" style={{ color: 'rgba(0,212,255,0.7)' }}>{cmd}</code>
                <span className="text-[10px] font-mono shrink-0" style={{ color: 'rgba(148,163,184,0.4)' }}>{desc}</span>
              </div>
            ))}
          </div>

          {/* Recent commands */}
          {recent.length > 0 && (
            <div>
              <div className="jarvis-label mb-2">RECENT</div>
              <div className="space-y-1">
                {recent.map(r => (
                  <div key={r.id} className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.06)' }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.success ? '#00ff88' : '#ff4466' }} />
                    <span className="flex-1 text-[10px] font-mono truncate" style={{ color: 'rgba(186,217,240,0.7)' }}>{r.transcript}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-2.5 h-2.5" style={{ color: 'rgba(100,116,139,0.5)' }} />
                      <span className="text-[9px] font-mono" style={{ color: 'rgba(100,116,139,0.5)' }}>{r.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
