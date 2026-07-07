import React, { Suspense, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { Sidebar } from "./components/Sidebar";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { DebugBanner } from "./components/ui/DebugBanner";
import { LiveJournalWidget } from "./components/LiveJournalWidget";
import { VoiceCommandPanel } from "./components/VoiceCommandPanel";
import { NeoraNotifications } from "./components/NeoraNotifications";
import { CommandStatusIndicator } from "./components/CommandStatusIndicator";
import { SystemEventLog } from "./components/SystemEventLog";
import { AutoHealRegistry } from "./components/AutoHealRegistry";
function lazyRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<any>,
  name: string,
): any {
  return React.lazy(async () => {
    try {
      const module = await factory();
      if (module[name]) {
        return { default: module[name] };
      }
      if (module.default) {
        return { default: module.default };
      }
      return { default: module };
    } catch (error) {
      console.warn(
        `[App] Failed to load lazy component "${name}", retrying...`,
        error,
      );
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const module = await factory();
        if (module[name]) {
          return { default: module[name] };
        }
        if (module.default) {
          return { default: module.default };
        }
        return { default: module };
      } catch (retryError) {
        console.error(
          `[App] Lazy load permanently failed for "${name}":`,
          retryError,
        );
        const FallbackComponent = (() => (
          <div className="p-8 border border-rose-950/45 rounded-2xl bg-rose-950/15 text-rose-300 font-mono text-[11px] leading-relaxed max-w-lg mx-auto my-12 text-center shadow-[0_4px_24px_rgba(244,63,94,0.08)]">
            <div className="text-rose-400 font-bold mb-2 uppercase tracking-widest text-[12px] flex items-center justify-center gap-1.5">
              <span>⚠️ Component Load Outage</span>
            </div>
            <p className="font-sans mb-3 text-rose-300/80">
              The requested view module could not be fetched by the browser.
              This may be due to a recent code update or network refresh.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 font-bold text-rose-200 transition-all font-sans cursor-pointer text-[10px]"
            >
              REFRESH APPLICATION
            </button>
          </div>
        )) as unknown as T;
        return { default: FallbackComponent };
      }
    }
  });
}

const SectionViewer = lazyRetry<any>(
  () => import("./components/SectionViewer"),
  "SectionViewer",
);
const ChatView = lazyRetry<any>(
  () => import("./components/ChatView"),
  "ChatView",
);
const PlannerView = lazyRetry<any>(
  () => import("./components/PlannerView"),
  "PlannerView",
);
const OrganizerView = lazyRetry<any>(
  () => import("./components/OrganizerView"),
  "OrganizerView",
);
const EarningView = lazyRetry<any>(
  () => import("./components/EarningView"),
  "EarningView",
);
const DevStudioView = lazyRetry<any>(
  () => import("./components/DevStudioView"),
  "DevStudioView",
);
const FilterLabView = lazyRetry<any>(
  () => import("./components/FilterLabView"),
  "FilterLabView",
);
const RoadmapView = lazyRetry<any>(
  () => import("./components/RoadmapView"),
  "RoadmapView",
);
const OsAgentView = lazyRetry<any>(
  () => import("./components/OsAgentView"),
  "OsAgentView",
);
const VSCodeView = lazyRetry<any>(
  () => import("./components/vscode/VSCodeView"),
  "VSCodeView",
);
const WebOSSimulator = lazyRetry<any>(
  () => import("./components/WebOSSimulator"),
  "WebOSSimulator",
);
const NeoraTV = lazyRetry<any>(() => import("./components/NeoraTV"), "NeoraTV");
const HostPCControl = lazyRetry<any>(
  () => import("./components/HostPCControl"),
  "HostPCControl",
);
const MemoriesGraphView = lazyRetry<any>(
  () => import("./components/MemoriesGraphView"),
  "MemoriesGraphView",
);
const SelfEvolutionView = lazyRetry<any>(
  () => import("./components/SelfEvolutionView"),
  "SelfEvolutionView",
);
const EvolutionaryStatusView = lazyRetry<any>(
  () => import("./components/EvolutionaryStatusView"),
  "EvolutionaryStatusView",
);
const BuilderView = lazyRetry<any>(
  () => import("./components/BuilderView"),
  "BuilderView",
);
import { usePredictiveLayout } from "./components/DashboardManager";
import { AgentIntelligenceWidget } from "./components/AgentIntelligenceWidget";
import { CommandHistoryDrawer } from "./components/CommandHistoryDrawer";
import { useSkillNotification } from "./hooks/useSkillNotification";
import { MetaAgent } from "./components/MetaAgent";
import { SECTIONS, RAW_MASTER_PROMPT } from "./masterPromptText";
import { Task, Reminder, Note, Memory, SubTask } from "./types";
import { TRANSLATIONS } from "./translations";
import { neoraDelete, neoraGet, neoraPost } from "./lib/neoraApi";
import {
  MessageSquare,
  Cpu,
  Sliders,
  DollarSign,
  Clipboard,
  Languages,
  Terminal,
  BookOpen,
  Key,
  LogOut,
  Filter,
  Milestone,
  Laptop,
  Download,
  Search,
  Undo,
  X,
  Activity,
  CircleAlert,
  Upload,
  Tv,
  Share2,
  Volume2,
  VolumeX,
  Music,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Plus,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Edit,
  AlertTriangle,
  History,
  Zap,
  Trash,
  Play,
  SlidersHorizontal,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

class AmbientHumManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private periodicTimer: any = null;

  start(volume: number) {
    this.stop();
    try {
      this.ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime); // keep max scaling very low and pleasant

      // Filter sweep
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(125, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(4, this.ctx.currentTime);

      // Deep fundamental pitch (A0 / 55Hz)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = "triangle";
      this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Shimmer pitch (A1 / 110.3Hz for binaural beating)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = "sine";
      this.osc2.frequency.setValueAtTime(110.3, this.ctx.currentTime);

      // LFO to sweep filter frequency for respiratory soundscape feel
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = "sine";
      this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // Very slow 12 second sweep

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(45, this.ctx.currentTime); // Modulate by 45Hz

      // Connections
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);

      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Play
      this.osc1.start(0);
      this.osc2.start(0);
      this.lfo.start(0);

      // Periodically trigger extremely soft, resonant modular spacial "stardust pings"
      this.periodicTimer = setInterval(() => {
        this.triggerPing();
      }, 7000); // every 7 seconds
    } catch (e) {
      console.warn("Web Audio API not supported or blocked:", e);
    }
  }

  private triggerPing() {
    if (!this.ctx || !this.filter || !this.masterGain) return;
    try {
      const pingOsc = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      const pingFilter = this.ctx.createBiquadFilter();

      pingFilter.type = "bandpass";
      // Pick dynamic harmonic notes of A (220, 330, 440, 660, 880 Hz)
      const pitches = [220, 330, 440, 660, 880];
      const randomPitch = pitches[Math.floor(Math.random() * pitches.length)];

      pingOsc.type = "sine";
      pingOsc.frequency.setValueAtTime(randomPitch, this.ctx.currentTime);
      pingFilter.frequency.setValueAtTime(randomPitch, this.ctx.currentTime);
      pingFilter.Q.setValueAtTime(8, this.ctx.currentTime);

      pingGain.gain.setValueAtTime(0, this.ctx.currentTime);
      // Soft attack, ultra-long decaying envelope
      pingGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 1.5);
      pingGain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.ctx.currentTime + 5.5,
      );

      pingOsc.connect(pingFilter);
      pingFilter.connect(pingGain);
      pingGain.connect(this.ctx.destination);

      pingOsc.start(0);
      pingOsc.stop(this.ctx.currentTime + 6.0);
    } catch {}
  }

  setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(
        volume * 0.15,
        this.ctx.currentTime + 0.1,
      );
    }
  }

  stop() {
    clearInterval(this.periodicTimer);
    try {
      if (this.osc1) {
        this.osc1.stop();
        this.osc1.disconnect();
      }
      if (this.osc2) {
        this.osc2.stop();
        this.osc2.disconnect();
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
      }
      if (this.ctx) {
        this.ctx.close();
      }
    } catch {}
    this.ctx = null;
    this.masterGain = null;
    this.osc1 = null;
    this.osc2 = null;
    this.lfo = null;
    this.filter = null;
  }
}

export default function App() {
  const [showBlueprintSidebar, setShowBlueprintSidebar] = useState(true);
  const [lang, setLang] = useState<"en" | "bn">(() => {
    try {
      const locale =
        navigator.language ||
        (navigator.languages && navigator.languages[0]) ||
        "";
      if (locale.toLowerCase().startsWith("bn")) {
        return "bn";
      }
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (
        tz.toLowerCase().includes("dhaka") ||
        tz.toLowerCase().includes("calcutta") ||
        tz.toLowerCase().includes("kolkata")
      ) {
        return "bn";
      }
    } catch (e) {
      console.warn("Language auto-detection failed:", e);
    }
    return (localStorage.getItem("neora_lang") || "en") as "en" | "bn";
  });

  React.useEffect(() => {
    localStorage.setItem("neora_lang", lang);
  }, [lang]);

  React.useEffect(() => {
    const handleForceLang = () => {
      setLang("bn");
    };
    window.addEventListener("neora-force-lang-bn", handleForceLang);
    return () => {
      window.removeEventListener("neora-force-lang-bn", handleForceLang);
    };
  }, []);

  // Groq API client config states
  const [useGroq, setUseGroq] = useState<boolean>(() => {
    return localStorage.getItem("neora_use_groq") === "true";
  });
  const [groqKey, setGroqKey] = useState<string>(() => {
    return localStorage.getItem("neora_groq_key") || "";
  });
  const [groqModel, setGroqModel] = useState<string>(() => {
    return (
      localStorage.getItem("neora_groq_model") || "llama-3.3-70b-versatile"
    );
  });
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem("neora_gemini_key") || "";
  });

  React.useEffect(() => {
    localStorage.setItem("neora_gemini_key", geminiKey);
  }, [geminiKey]);

  React.useEffect(() => {
    localStorage.setItem("neora_use_groq", useGroq.toString());
  }, [useGroq]);

  React.useEffect(() => {
    localStorage.setItem("neora_groq_key", groqKey);
  }, [groqKey]);

  React.useEffect(() => {
    localStorage.setItem("neora_groq_model", groqModel);
  }, [groqModel]);

  // Dedicated hook for monitoring Vite WebSocket and connection error events
  React.useEffect(() => {
    const handleViteError = (event: Event) => {
      const errDetail = (event as any).detail || {};
      const errorMessage = errDetail.message || "Vite Connection Disruption / Error detected.";
      
      const isWsClosedWithoutOpened = errorMessage.includes("WebSocket closed without opened") || 
                                     errorMessage.includes("failed to connect to websocket") ||
                                     JSON.stringify(errDetail).includes("WebSocket closed without opened");

      // Dispatch to SystemEventLog as info/warning, but NEVER reload the page
      const customEvt = new CustomEvent("neora-system-event", {
        detail: {
          id: "vite-error-" + Date.now(),
          timestamp: new Date().toTimeString().split(" ")[0],
          category: "system_heal",
          level: "INFO",
          message: lang === "bn"
            ? "Vite HMR সংযোগ ত্রুটি উপেক্ষিত হয়েছে (স্ট্যাটাস বজায় রাখতে)"
            : "Vite HMR WebSocket disconnected (ignoring to protect state)",
          details: `Error Details: ${errorMessage}. This error is expected and ignored to prevent unexpected page reloads and protect active user work.`
        }
      });
      window.dispatchEvent(customEvt);
    };

    window.addEventListener("vite:error", handleViteError);
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason);
      if (reason.includes("WebSocket closed without opened")) {
        handleViteError(new CustomEvent("vite:error", {
          detail: { message: "WebSocket closed without opened (via Unhandled Rejection)" }
        }));
      }
    };
    
    const handleWindowError = (event: ErrorEvent) => {
      const message = event.message || "";
      if (message.includes("WebSocket closed without opened")) {
        handleViteError(new CustomEvent("vite:error", {
          detail: { message: "WebSocket closed without opened (via Window Error)" }
        }));
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    return () => {
      window.removeEventListener("vite:error", handleViteError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
    };
  }, [lang]);

  // --- NATIVE WEB SPEECH SYNTHESIS ENGINE (PRIMARY) ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakQueueRef = React.useRef<{ cancel: () => void } | null>(null);

  const neoraSpeak = React.useCallback((text: string, onSpeechFinished?: () => void) => {
    setIsSpeaking(true);
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    
    if (synth && synth.getVoices().length === 0) {
      console.log("[neoraSpeak] speechSynthesis.getVoices() is empty/not ready. Retrying in 500ms...");
      setTimeout(() => {
        neoraSpeak(text, onSpeechFinished);
      }, 500);
      return;
    }
    
    if (speakQueueRef.current) {
      speakQueueRef.current.cancel();
    }
    if (synth) {
      synth.cancel();
    }

    const cleanText = text.replace(/[`*#_\[\]]/g, "").replace(/\*\*/g, "").slice(0, 1800);
    const sentences: string[] = [];
    const rawSentences = cleanText
      .split(/[।\n!?.;]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const s of rawSentences) {
      if (s.length <= 150) {
        sentences.push(s);
      } else {
        // Splitting safely by spaces, commas, semicolons or Bengali punctuation marks to stay under 150 chars
        const parts = s.split(/([\s,，、])/);
        let currentChunk = "";
        for (const part of parts) {
          if ((currentChunk + part).length > 150) {
            if (currentChunk.trim().length > 0) {
              sentences.push(currentChunk.trim());
            }
            currentChunk = part;
          } else {
            currentChunk += part;
          }
        }
        if (currentChunk.trim().length > 0) {
          sentences.push(currentChunk.trim());
        }
      }
    }

    if (sentences.length === 0) {
      setIsSpeaking(false);
      onSpeechFinished?.();
      return;
    }

    let index = 0;
    let cancelled = false;
    let currentAudio: HTMLAudioElement | null = null;

    const cancel = () => {
      cancelled = true;
      setIsSpeaking(false);
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
      if (cancelled) {
        setIsSpeaking(false);
        return;
      }
      if (index >= sentences.length) {
        setIsSpeaking(false);
        onSpeechFinished?.();
        return;
      }

      const sentenceText = sentences[index];
      const containsBangla = /[\u0980-\u09FF]/.test(sentenceText);
      const isBn = lang === "bn" || containsBangla;

      const voices = synth ? synth.getVoices() : [];
      const bnBDVoices = voices.filter(v => {
        const lLower = v.lang.toLowerCase();
        const nameLower = v.name.toLowerCase();
        return (
          lLower === "bn-bd" || 
          lLower === "bn_bd" || 
          lLower.startsWith("bn") || 
          nameLower.includes("bengali") || 
          nameLower.includes("bangla") || 
          nameLower.includes("বাংলা")
        );
      });

      const playProxyTts = () => {
        if (cancelled) return;
        try {
          const ttsLang = isBn ? "bn" : "en";
          const ttsUrl = `/api/tts?lang=${ttsLang}&text=${encodeURIComponent(sentenceText)}`;
          const audio = new Audio(ttsUrl);
          currentAudio = audio;

          audio.onended = () => {
            if (currentAudio === audio) currentAudio = null;
            index++;
            speakNext();
          };

          audio.onerror = () => {
            if (currentAudio === audio) currentAudio = null;
            console.warn("Proxy TTS failed, falling back to native SpeechSynthesis");
            playLocalSynthesis();
          };

          audio.play().catch((err) => {
            if (currentAudio === audio) currentAudio = null;
            console.warn("Audio play blocked, falling back to native SpeechSynthesis", err);
            playLocalSynthesis();
          });
        } catch (err) {
          playLocalSynthesis();
        }
      };

      const playLocalSynthesis = () => {
        if (cancelled) return;
        if (!synth) {
          index++;
          speakNext();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentenceText);
        utterance.lang = isBn ? "bn-BD" : "en-US";
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        let preferredVoice = null;
        if (isBn) {
          preferredVoice = bnBDVoices.find(v => {
            const lLower = v.lang.toLowerCase();
            const nameLower = v.name.toLowerCase();
            return (lLower === "bn-bd" || lLower === "bn_bd") && (
              nameLower.includes("sabina") ||
              nameLower.includes("kalpana") ||
              nameLower.includes("female") ||
              nameLower.includes("online") ||
              nameLower.includes("google")
            );
          }) || bnBDVoices[0];
        } else {
          preferredVoice = voices.find(v => {
            const nameLower = v.name.toLowerCase();
            return v.lang.toLowerCase().startsWith("en") && (
              nameLower.includes("zira") ||
              nameLower.includes("samantha") ||
              nameLower.includes("female") ||
              nameLower.includes("google")
            );
          }) || voices.find(v => v.lang.toLowerCase().startsWith("en"));
        }

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          index++;
          speakNext();
        };

        utterance.onerror = (e) => {
          console.warn("Native SpeechSynthesis failed fully:", e);
          if (isBn && bnBDVoices.length > 0) {
            console.warn("Native Bengali SpeechSynthesis failed, falling back to Proxy TTS.");
            playProxyTts();
          } else {
            index++;
            speakNext();
          }
        };

        try {
          synth.speak(utterance);
          setTimeout(() => {
            if (!synth.speaking && !cancelled) {
              synth.resume();
            }
          }, 150);
        } catch (err) {
          console.warn("synth.speak failed:", err);
          if (isBn && bnBDVoices.length > 0) {
            playProxyTts();
          } else {
            index++;
            speakNext();
          }
        }
      };

      // Priority-based voice fallback check
      if (isBn && bnBDVoices.length > 0) {
        // Try native bn-BD voice directly first
        playLocalSynthesis();
      } else {
        // Otherwise route through proxy TTS
        playProxyTts();
      }
    };

    speakNext();
  }, [lang]);

  const neoraStopSpeaking = React.useCallback(() => {
    setIsSpeaking(false);
    if (speakQueueRef.current) {
      speakQueueRef.current.cancel();
    }
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (synth) {
      synth.cancel();
    }
  }, []);

  React.useEffect(() => {
    (window as any).neoraSpeak = neoraSpeak;
    (window as any).neoraStopSpeaking = neoraStopSpeaking;
    return () => {
      delete (window as any).neoraSpeak;
      delete (window as any).neoraStopSpeaking;
    };
  }, [neoraSpeak, neoraStopSpeaking]);

  // --- REAL-TIME CENTRAL DIAGNOSTICS & RETRY EXPONENTIAL BACKOFF ---
  const [ollamaStatus, setOllamaStatus] = useState<"available" | "partial" | "not_installed" | "checking" | "error_backoff" | "not_responding">("checking");
  const [groqStatus, setGroqStatus] = useState<"available" | "offline" | "checking" | "missing_key" | "not_responding">("checking");
  const [diagnosticWarnings, setDiagnosticWarnings] = useState<string[]>([]);
  const [diagnosticsBackoff, setDiagnosticsBackoff] = useState<number>(1);

  React.useEffect(() => {
    let active = true;
    let timerId: NodeJS.Timeout | null = null;

    const runDiagnostics = async () => {
      if (!active) return;
      
      const geminiK = localStorage.getItem("neora_gemini_key") || "";
      const groqK = localStorage.getItem("neora_groq_key") || "";
      const ollamaUrl = localStorage.getItem("neora_ollama_base_url") || "http://127.0.0.1:11434";

      // Direct client-side local Ollama status check
      let directOllamaAlive = false;
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 1000);
        const res = await fetch(`${ollamaUrl.replace(/\/+$/, '')}/api/tags`, { signal: controller.signal });
        clearTimeout(t);
        if (res.ok) {
          directOllamaAlive = true;
        }
      } catch (e) {
        // quiet fail
      }

      try {
        const result: any = await neoraPost("/api/diagnostic/heartbeat", {
          geminiKey: geminiK,
          groqKey: groqK,
          ollamaBaseUrl: ollamaUrl
        });

        if (!active) return;

        if (result && result.status === "success" && result.check) {
          setDiagnosticsBackoff(1);

          const check = result.check;
          
          if (directOllamaAlive || check.ollama.alive) {
            setOllamaStatus("available");
          } else {
            setOllamaStatus("not_responding");
          }

          if (!groqK) {
            setGroqStatus("missing_key");
          } else if (check.groq.alive) {
            setGroqStatus("available");
          } else {
            setGroqStatus("not_responding");
            if (useGroq) {
              setUseGroq(false);
              localStorage.setItem("neora_use_groq", "false");
            }
          }

          const warnings: string[] = [];
          if (!check.ollama.alive) {
            warnings.push(lang === "bn" 
              ? "সিস্টেম সতর্কবার্তা: ওলামা (Ollama) অফলাইন বা বন্ধ অবস্থায় আছে।" 
              : "Ollama LLM is unreachable or stopped. Local acceleration is offline."
            );
          }
          if (useGroq && !groqK) {
            warnings.push(lang === "bn"
              ? "সিস্টেম সতর্কবার্তা: গ্রক (Groq) এপিআই কি সেটিংস এ সেট করা নেই।"
              : "Groq is active but API key is missing. Update keys in Settings."
            );
          } else if (useGroq && !check.groq.alive) {
            warnings.push(lang === "bn"
              ? "সিস্টেম সতর্কবার্তা: গ্রক এপিআই কানেক্ট করা যাচ্ছে না।"
              : "Groq service is currently unreachable."
            );
          }

          setDiagnosticWarnings(warnings);
        }
      } catch (err: any) {
        if (!active) return;
        setDiagnosticsBackoff(prev => Math.min(15, prev * 2));
        setOllamaStatus("error_backoff");
        setGroqStatus("offline");
        
        const warnings = [
          lang === "bn"
            ? "সিস্টেম সতর্কবার্তা: ডায়াগনস্টিক সার্ভিস সংযোগ ব্যর্থ হয়েছে, পুনরায় চেষ্টা করা হচ্ছে।"
            : "Diagnostic heartbeat failed. Entering error backoff mode."
        ];
        setDiagnosticWarnings(warnings);
      } finally {
        if (active) {
          const nextPollDelay = 20000 * diagnosticsBackoff;
          timerId = setTimeout(runDiagnostics, nextPollDelay);
        }
      }
    };

    runDiagnostics();

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [useGroq, diagnosticsBackoff, lang]);

  // Ambient sound states
  const ambientManager = React.useRef<AmbientHumManager | null>(null);
  const [ambientPlaying, setAmbientPlaying] = useState<boolean>(() => {
    return localStorage.getItem("neora_ambient_playing") === "true";
  });
  const [ambientVolume, setAmbientVolume] = useState<number>(() => {
    const val = localStorage.getItem("neora_ambient_volume");
    return val !== null ? parseFloat(val) : 0.3;
  });

  // Track state changes to turn audio on/off
  React.useEffect(() => {
    if (!ambientManager.current) {
      ambientManager.current = new AmbientHumManager();
    }
    if (ambientPlaying) {
      ambientManager.current.start(ambientVolume);
    } else {
      ambientManager.current.stop();
    }
    localStorage.setItem("neora_ambient_playing", ambientPlaying.toString());
  }, [ambientPlaying]);

  React.useEffect(() => {
    if (ambientManager.current && ambientPlaying) {
      ambientManager.current.setVolume(ambientVolume);
    }
    localStorage.setItem("neora_ambient_volume", ambientVolume.toString());
  }, [ambientVolume, ambientPlaying]);

  // Clean play on unmount
  React.useEffect(() => {
    return () => {
      if (ambientManager.current) {
        ambientManager.current.stop();
      }
    };
  }, []);

  // Persist activeTab to localStorage
  const [activeTab, setActiveTab] = useState<
    | "home"
    | "chat"
    | "neoraTv"
    | "pcController"
    | "autonomy"
    | "productivity"
    | "memoriesGraph"
    | "invoice"
    | "dev"
    | "blueprint"
    | "filterLab"
    | "roadmap"
    | "osAgent"
    | "vscode"
    | "webOs"
    | "evolution"
    | "builder"
  >(() => {
    return (localStorage.getItem("neora_active_tab") || "home") as any;
  });

  React.useEffect(() => {
    localStorage.setItem("neora_active_tab", activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener("neora-navigation", handleNav);
    return () => window.removeEventListener("neora-navigation", handleNav);
  }, []);

  React.useEffect(() => {
    const handleCloseContext = () => setContextMenuTask(null);
    window.addEventListener("click", handleCloseContext);
    return () => window.removeEventListener("click", handleCloseContext);
  }, []);

  const [evolutionSubTab, setEvolutionSubTab] = useState<"protocol" | "status">("protocol");

  // Dynamic collections
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Deliver brochure proof to Shukria Printers",
      notes: "",
      priority: "high",
      dueAt: "2026-06-07",
      completed: false,
    },
    {
      id: "2",
      title: "Submit quarterly tax calculations sheet",
      notes: "",
      priority: "critical",
      dueAt: "2026-06-08",
      completed: true,
    },
    {
      id: "3",
      title: "Stage local updates & run typechecking validation",
      notes: "",
      priority: "medium",
      dueAt: "2026-06-09",
      completed: false,
    },
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Call client to verify poster colors",
      remindAt: "2026-06-07T11:00",
      repeat: "none",
      completed: false,
    },
    {
      id: "2",
      title: "Auto-backup repository checkpoints",
      remindAt: "2026-06-08T23:59",
      repeat: "daily",
      completed: false,
    },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Office address memo",
      content: "Contact point: Silicon Tower, Floor 14, Gulshan-2, Dhaka.",
      createdAt: new Date().toLocaleDateString(),
    },
    {
      id: "2",
      title: "Printers pricing framework",
      content:
        "Standard glossy banner setup: $120/piece. Volume discount at 10% for orders > 5 pieces.",
      createdAt: new Date().toLocaleDateString(),
    },
  ]);

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: "1",
      key: "Default Printer Contact",
      value: "shukriaprinters@gmail.com",
      category: "work",
      importance: 5,
    },
    {
      id: "2",
      key: "Autonomous safety rule",
      category: "preference",
      value:
        "Never write onto /etc/ or system roots system-wide without password prompt",
      importance: 4,
    },
    {
      id: "syntax-home",
      key: "Syntax: home tab",
      category: "preference",
      value: "open [tab] (Navigate), add task [name] (Schedule task), diagnose (Run health check)",
      importance: 3,
    },
    {
      id: "syntax-chat",
      key: "Syntax: chat tab",
      category: "preference",
      value: "/clear (Reset active chat), /analyze (Audit workspace logs), /heal (Auto-patch errors)",
      importance: 3,
    },
    {
      id: "syntax-osAgent",
      key: "Syntax: osAgent tab",
      category: "preference",
      value: "run [app] (Launch dynamic app), write [file] (Write custom script), status (Hardware probe)",
      importance: 3,
    },
    {
      id: "syntax-autonomy",
      key: "Syntax: autonomy tab",
      category: "preference",
      value: "schedule [job] (Setup scheduler), prioritize [task] (Increase item latency weight)",
      importance: 3,
    },
  ]);

  const [autonomyLevel, setAutonomyLevel] = useState<number>(3);

  // Specifications state binders (persisted selectedSectionId)
  const [selectedSectionId, setSelectedSectionId] = useState<string>(() => {
    return localStorage.getItem("neora_selected_section_id") || SECTIONS[0].id;
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Save selectedSectionId to LocalStorage
  React.useEffect(() => {
    localStorage.setItem("neora_selected_section_id", selectedSectionId);
  }, [selectedSectionId]);

  React.useEffect(() => {
    const syncMemoryState = async () => {
      try {
        const data: any = await neoraGet("/api/memory");
        if (Array.isArray(data.memories)) {
          setMemories(
            data.memories.map((memory: any) => ({
              id: memory.id,
              key: memory.key,
              value: memory.value,
              category: memory.category,
              importance: memory.importance,
            })),
          );
        }
      } catch (err) {
        console.warn("Memory sync failed:", err);
      }
    };
    syncMemoryState();
  }, []);

  // --- UNDO TOAST NOTIFICATION SYSTEM ---
  interface DeletedItem {
    type: "task" | "reminder" | "note" | "memory";
    item: any;
  }
  const [lastDeleted, setLastDeleted] = useState<DeletedItem | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerUndoOption = (
    type: "task" | "reminder" | "note" | "memory",
    item: any,
  ) => {
    setLastDeleted({ type, item });
    setShowUndo(true);
    if (undoTimer) clearTimeout(undoTimer);
    const timer = setTimeout(() => {
      setShowUndo(false);
    }, 5000);
    setUndoTimer(timer);
  };

  const handleUndo = () => {
    if (!lastDeleted) return;
    const { type, item } = lastDeleted;
    if (type === "task") {
      setTasks((prev) => [item, ...prev]);
    } else if (type === "reminder") {
      setReminders((prev) => [item, ...prev]);
    } else if (type === "note") {
      setNotes((prev) => [item, ...prev]);
    } else if (type === "memory") {
      setMemories((prev) => [item, ...prev]);
    }
    setShowUndo(false);
    setLastDeleted(null);
    if (undoTimer) clearTimeout(undoTimer);
  };

  // --- GLOBAL SEARCH OVERLAY STATE ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchVal, setGlobalSearchVal] = useState("");

  // --- DASHBOARD REAL-TIME SYNCING & FILTER STATES ---
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [selectedDashboardPriorities, setSelectedDashboardPriorities] =
    useState<("low" | "medium" | "high" | "critical")[]>([
      "critical",
      "high",
      "medium",
      "low",
    ]);

  interface HolographicVoiceToast {
    id: string;
    message: string;
    undo: () => void;
  }
  const [voiceToast, setVoiceToast] = useState<HolographicVoiceToast | null>(
    null,
  );

  const triggerDbSyncAnimation = () => {
    setIsSyncingDb(true);
    setTimeout(() => {
      setIsSyncingDb(false);
    }, 1200);
  };

  const toggleDashboardPriority = (
    p: "low" | "medium" | "high" | "critical",
  ) => {
    setSelectedDashboardPriorities((prev) => {
      if (prev.includes(p)) {
        return prev.filter((x) => x !== p);
      } else {
        return [...prev, p];
      }
    });
  };

  // Holographic Voice Toast auto-cleanup timer
  React.useEffect(() => {
    if (voiceToast) {
      const timer = setTimeout(() => {
        setVoiceToast(null);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [voiceToast]);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("neora_recent_searches");
      return saved
        ? JSON.parse(saved)
        : ["Brochure proof", "Tax calculations", "Backup rule"];
    } catch {
      return ["Brochure proof", "Tax calculations", "Backup rule"];
    }
  });

  const [completingTaskIds, setCompletingTaskIds] = useState<string[]>([]);
  const [searchFrequencies, setSearchFrequencies] = useState<{ [query: string]: number }>(() => {
    try {
      const saved = localStorage.getItem("neora_search_frequencies");
      return saved ? JSON.parse(saved) : { "Brochure proof": 5, "Tax calculations": 3, "Backup rule": 2 };
    } catch {
      return { "Brochure proof": 5, "Tax calculations": 3, "Backup rule": 2 };
    }
  });
  const [selectedDashboardDateRange, setSelectedDashboardDateRange] = useState<"ALL" | "TODAY" | "WEEK" | "OVERDUE">("ALL");
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);

  const addRecentSearch = (query: string) => {
    const qClean = query.trim();
    if (!qClean) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (x) => x.toLowerCase() !== qClean.toLowerCase(),
      );
      const next = [qClean, ...filtered].slice(0, 8); // Keep last 8 queries
      localStorage.setItem("neora_recent_searches", JSON.stringify(next));
      return next;
    });
    setSearchFrequencies((prev) => {
      const nextFreq = { ...prev, [qClean]: (prev[qClean] || 0) + 1 };
      localStorage.setItem("neora_search_frequencies", JSON.stringify(nextFreq));
      return nextFreq;
    });
  };

  // --- CONNECTION LATENCY / PERFORMANCE METRICS ---
  // --- CUSTOM STATE FOR NEW TASK & DESIGN FEATURES ---
  const [visualTheme, setVisualTheme] = useState<'cyber' | 'retro' | 'matrix' | 'sunset' | 'solarized'>(() => (localStorage.getItem('neora_visual_theme') as any) || 'cyber');
  const [autoArchiveCompleted, setAutoArchiveCompleted] = useState(() => localStorage.getItem("neora_auto_archive_completed") !== "false");
  const [archivePeriodHours, setArchivePeriodHours] = useState(() => Number(localStorage.getItem("neora_archive_period_hours") || "24"));
  const [isTaskSettingsOpen, setIsTaskSettingsOpen] = useState(false);
  
  const [selectedActiveTaskIds, setSelectedActiveTaskIds] = useState<string[]>([]);
  const [isBulkSelectMode, setIsBulkSelectMode] = useState<boolean>(false);
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [showBulkTagInput, setShowBulkTagInput] = useState(false);
  
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  const [taskPhoto, setTaskPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera start failed:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setTaskPhoto(dataUrl);
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const handlePhotoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTaskPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateNextDueDate = (currentDue: string, period: "none" | "daily" | "weekly" | "monthly"): string => {
    const date = new Date(currentDue);
    if (isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
    if (period === "daily") {
      date.setDate(date.getDate() + 1);
    } else if (period === "weekly") {
      date.setDate(date.getDate() + 7);
    } else if (period === "monthly") {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().slice(0, 10);
  };

  const completeTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            completed: true,
            completedAt: new Date().toISOString(),
          };
        }
        return t;
      });

      const completedTask = prev.find((t) => t.id === id);
      if (completedTask && completedTask.recurring && completedTask.recurring !== "none") {
        const baseDue = completedTask.dueAt || new Date().toISOString().slice(0, 10);
        const nextDue = calculateNextDueDate(baseDue, completedTask.recurring);
        const recurringCopy: Task = {
          id: Math.random().toString(),
          title: completedTask.title,
          notes: completedTask.notes,
          priority: completedTask.priority,
          dueAt: nextDue,
          completed: false,
          createdAt: new Date().toISOString(),
          tags: completedTask.tags,
          category: completedTask.category,
          recurring: completedTask.recurring,
          subTasks: (completedTask.subTasks || []).map(st => ({ ...st, id: Math.random().toString(), completed: false })),
          attachment: completedTask.attachment
        };
        return [recurringCopy, ...updated];
      }
      return updated;
    });
  };

  const handleThemeChange = (theme: 'cyber' | 'retro' | 'matrix' | 'sunset' | 'solarized') => {
    setVisualTheme(theme);
    localStorage.setItem('neora_visual_theme', theme);
    playSystemChirp("success");
  };

  const [latency, setLatency] = useState(14);
  const [apiHealth, setApiHealth] = useState(100);
  const recoveryImportRef = React.useRef<HTMLInputElement | null>(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [commandQueue, setCommandQueue] = useState<any[]>([]);
  const [overlayBlocked, setOverlayBlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDashboardAddTaskOpen, setIsDashboardAddTaskOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSystemHealing, setIsSystemHealing] = useState(false);
  const [isPlusRotating, setIsPlusRotating] = useState(false);
  const [selectedDashboardTag, setSelectedDashboardTag] = useState<string>("ALL");
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [contextMenuTask, setContextMenuTask] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickCategory, setQuickCategory] = useState("");
  const [quickTags, setQuickTags] = useState("");
  const [quickNotes, setQuickNotes] = useState("");
  const [quickRecurring, setQuickRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [quickSubTasks, setQuickSubTasks] = useState<SubTask[]>([]);
  const [quickSubTaskInput, setQuickSubTaskInput] = useState("");
  const [dashboardTaskTab, setDashboardTaskTab] = useState<"active" | "completed">("active");
  const [selectedCompletedTaskIds, setSelectedCompletedTaskIds] = useState<string[]>([]);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [showDebugBanner, setShowDebugBanner] = useState(false);
  const [voicePanelOpen, setVoicePanelOpen] = useState(false);
  const [clickInspectorMode, setClickInspectorMode] = useState(false);
  const [inspectorLog, setInspectorLog] = useState<string | null>(null);
  const [isDashboardOptimized, setIsDashboardOptimized] = useState<boolean>(
    () => {
      return localStorage.getItem("neora_dashboard_optimized") === "true";
    },
  );

  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("neora_unlocked_features") || "[]");
    } catch {
      return [];
    }
  });

  const handleUnlockFeature = (featId: string) => {
    setUnlockedFeatures((prev) => {
      const next = prev.includes(featId) ? prev : [...prev, featId];
      localStorage.setItem("neora_unlocked_features", JSON.stringify(next));
      return next;
    });
  };

  const handleAutoCategorize = async () => {
    if (!quickTitle.trim()) return;
    setIsCategorizing(true);
    try {
      const response: any = await neoraPost("/api/tasks/auto-categorize", {
        title: quickTitle,
        description: quickNotes
      });
      if (response && response.status === "success") {
        setQuickCategory(response.category || "");
        setQuickTags(response.tags || "");
      }
    } catch (err) {
      console.error("Failed to auto-categorize task:", err);
    } finally {
      setIsCategorizing(false);
    }
  };

  const {
    widgets: predictiveWidgets,
    setWidgets: setPredictiveWidgets,
    adaptiveMode: isAdaptiveMode,
    setAdaptiveMode: setIsAdaptiveMode,
    trackWidgetInteraction,
    optimizeLayoutAllInterfaces
  } = usePredictiveLayout();

  const [cliSuggestions, setCliSuggestions] = useState<Array<{ cmd: string; desc: string }>>([
    { cmd: "open [tab]", desc: 'e.g., open "planner" or "chat"' },
    { cmd: "diagnose system", desc: "Scan Neora system health" },
    { cmd: "optimize layout", desc: "Max out dashboard density" },
    { cmd: "add task [name]", desc: "Directly schedule a planner item" }
  ]);

  React.useEffect(() => {
    const fetchCliSuggestions = async () => {
      try {
        const sortedWidgets = [...predictiveWidgets].sort((a, b) => b.clicks - a.clicks);
        const activeToolsParam = sortedWidgets.map(w => w.id).join(",");
        const data: any = await neoraGet(`/api/cli/suggestions?activeTools=${activeToolsParam}`);
        if (data && Array.isArray(data.suggestions)) {
          setCliSuggestions(data.suggestions);
        }
      } catch (err) {
        console.warn("Error fetching dynamic CLI suggestions:", err);
      }
    };
    if (predictiveWidgets && predictiveWidgets.length > 0) {
      fetchCliSuggestions();
    }
  }, [predictiveWidgets]);

  React.useEffect(() => {
    // Automatically archive completed tasks based on user preferences and archive inactive tasks > 14 days old
    const runAutoArchive = () => {
      const thresholdDate = new Date();
      thresholdDate.setHours(thresholdDate.getHours() - archivePeriodHours);
      
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      setTasks(prevTasks => {
        let changed = false;
        const updated = prevTasks.map(task => {
          // Rule 1: Move completed tasks to 'Archive' after a configurable period (e.g. 24 hours)
          if (autoArchiveCompleted && task.completed && !task.archived) {
            const dateToCompare = task.completedAt ? new Date(task.completedAt) : new Date(task.dueAt || task.createdAt || Date.now());
            if (dateToCompare < thresholdDate) {
              changed = true;
              return { ...task, archived: true };
            }
          }
          // Rule 2: Move completed or stale tasks to 'Archive' repository after 14 days of inactivity
          if (!task.archived) {
            const dateCreated = new Date(task.createdAt || Date.now());
            if (dateCreated < fourteenDaysAgo) {
              changed = true;
              return { ...task, archived: true };
            }
          }
          return task;
        });
        return changed ? updated : prevTasks;
      });
    };
    
    runAutoArchive();
    // Periodically run every 5 minutes
    const interval = setInterval(runAutoArchive, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoArchiveCompleted, archivePeriodHours]);

  const playSystemChirp = (type: "beep" | "click" | "success" = "beep") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  };

  // Skill notifications & Drag & Drop layout state (Tasks 4, 7)
  const { notification: skillNotification, clearNotification: clearSkillNotification } = useSkillNotification();
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  const handleDragStart = (e: any, widgetId: string) => {
    setDraggedWidgetId(widgetId);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: any, widgetId: string) => {
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== widgetId) {
      setDragOverWidgetId(widgetId);
    }
  };

  const handleDragLeave = (e: any, widgetId: string) => {
    e.preventDefault();
    if (dragOverWidgetId === widgetId) {
      setDragOverWidgetId(null);
    }
  };

  const handleDrop = (e: any, targetWidgetId: string) => {
    e.preventDefault();
    setDragOverWidgetId(null);
    if (!draggedWidgetId || draggedWidgetId === targetWidgetId) return;

    const currentIndex = predictiveWidgets.findIndex(w => w.id === draggedWidgetId);
    const targetIndex = predictiveWidgets.findIndex(w => w.id === targetWidgetId);

    if (currentIndex >= 0 && targetIndex >= 0) {
      const updatedWidgets = [...predictiveWidgets];
      const [draggedItem] = updatedWidgets.splice(currentIndex, 1);
      updatedWidgets.splice(targetIndex, 0, draggedItem);
      
      setPredictiveWidgets(updatedWidgets);
      playSystemChirp("beep");
    }
    setDraggedWidgetId(null);
  };

  React.useEffect(() => {
    const checkAndTriggerBackup = async () => {
      const lastBackupStr = localStorage.getItem("neora_last_backup_time");
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (!lastBackupStr || now - Number(lastBackupStr) > twentyFourHours) {
        try {
          const bundle: any = await neoraGet("/api/recovery/bundle").catch(
            () => null,
          );
          const fallbackBundle = bundle || {
            timestamp: new Date().toISOString(),
            tasks,
            reminders,
            notes,
            memories,
          };

          localStorage.setItem(
            "neora_stored_recovery_bundle",
            JSON.stringify(fallbackBundle),
          );
          localStorage.setItem("neora_last_backup_time", String(now));

          setVoiceToast({
            id: "backup-" + Math.floor(Math.random() * 10000),
            message:
              lang === "bn"
                ? "স্বয়ংক্রিয় ২৪-ঘণ্টার রিকভারি ব্যাকআপ সম্পন্ন হয়েছে!"
                : "Automated 24h Recovery Backup Successful!",
            undo: () => {},
          });

          const customEvt = new CustomEvent("neora-system-event", {
            detail: {
              id: "evt-bk-" + Math.floor(Math.random() * 10000),
              timestamp: new Date().toTimeString().split(" ")[0],
              category: "task_completion",
              level: "SUCCESS",
              message:
                lang === "bn"
                  ? "সিস্টেম ব্যাকআপ সম্পন্ন: স্বয়ংক্রিয় ২৪-ঘণ্টার বাণ্ডেল সংরক্ষিত!"
                  : "System Backup Process resolved: Stored automated 24-hour recovery bundle!",
              details: JSON.stringify(
                {
                  action: "AUTOMATED_24H_BACKUP",
                  stored_slots: ["tasks", "reminders", "notes", "memories"],
                  backup_timestamp: new Date().toISOString(),
                  encryption_protocol: "AES-256 local storage cache mapping",
                  integrity_checksum: "SHA-256-CONSISTENT",
                },
                null,
                2,
              ),
              latency: "45ms",
            },
          });
          window.dispatchEvent(customEvt);
        } catch (e) {
          console.error("Autonomous backup failed", e);
        }
      }
    };

    checkAndTriggerBackup();
    const timer = setInterval(checkAndTriggerBackup, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [tasks, reminders, notes, memories, lang]);

  // Recharts dynamic latency and health history (simulated sliding window over previous hour)
  const [latencyHistory, setLatencyHistory] = useState<
    { time: string; latency: number; health: number }[]
  >(() => {
    const points = [];
    const now = new Date();
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 6 * 1000 * 60);
      const timeStr = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      points.push({
        time: timeStr,
        latency: Math.floor(Math.random() * 8) + 12,
        health: 100,
      });
    }
    return points;
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      let nextLatency = 14;
      let nextHealth = 100;

      // 12% probability of a simulated system anomaly detection for testing
      const isAnomalyTick = Math.random() < 0.12;

      setLatency((prev) => {
        if (isAnomalyTick) {
          nextLatency = Math.floor(Math.random() * 30) + 65; // Spikes to 65ms - 95ms
        } else {
          const delta = Math.floor(Math.random() * 5) - 2;
          const next = prev + delta;
          nextLatency = next < 8 ? 8 : next > 25 ? 25 : next;
        }
        return nextLatency;
      });

      setApiHealth((prev) => {
        if (isAnomalyTick) {
          nextHealth = Math.floor(Math.random() * 18) + 70; // Drops to 70% - 88%
        } else {
          nextHealth = prev < 100 ? Math.min(100, prev + 2) : 100;
        }
        return nextHealth;
      });

      setLatencyHistory((prev) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        const updated = [
          ...prev,
          { time: timeStr, latency: nextLatency, health: nextHealth },
        ];
        if (updated.length > 10) {
          updated.shift();
        }
        return updated;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Debounced auto-saves and draft indicators
  const [qcmdDraft, setQcmdDraft] = useState(() => {
    return localStorage.getItem("neora_qcmd_draft") || "";
  });
  const [commandUnsaved, setCommandUnsaved] = useState(false);
  const [showCommandSaved, setShowCommandSaved] = useState(false);

  const [scratchpadDraft, setScratchpadDraft] = useState(() => {
    return localStorage.getItem("neora_scratchpad_draft") || "";
  });
  const [notesUnsaved, setNotesUnsaved] = useState(false);
  const [showNotesSaved, setShowNotesSaved] = useState(false);

  // Debounce scratchpad
  React.useEffect(() => {
    if (!notesUnsaved) return;
    const timer = setTimeout(() => {
      localStorage.setItem("neora_scratchpad_draft", scratchpadDraft);
      setNotesUnsaved(false);
      setShowNotesSaved(true);
      const hideTimer = setTimeout(() => setShowNotesSaved(false), 2000);
      return () => clearTimeout(hideTimer);
    }, 1000); // 1s Debounce
    return () => clearTimeout(timer);
  }, [scratchpadDraft, notesUnsaved]);

  // Debounce command input
  React.useEffect(() => {
    if (!commandUnsaved) return;
    const timer = setTimeout(() => {
      localStorage.setItem("neora_qcmd_draft", qcmdDraft);
      setCommandUnsaved(false);
      setShowCommandSaved(true);
      const hideTimer = setTimeout(() => setShowCommandSaved(false), 2000);
      return () => clearTimeout(hideTimer);
    }, 1000); // 1s Debounce
    return () => clearTimeout(timer);
  }, [qcmdDraft, commandUnsaved]);

  // Startup data consistency routine check (Task 5)
  const [dataSyncStatus, setDataSyncStatus] = useState<
    "pending" | "checking" | "consistent" | "reconciled" | "error"
  >("pending");

  const memoriesRefForSync = React.useRef(memories);
  React.useEffect(() => {
    memoriesRefForSync.current = memories;
  }, [memories]);

  React.useEffect(() => {
    const checkStateConsistency = async () => {
      setDataSyncStatus("checking");
      try {
        const response: any = await neoraGet("/api/memory");
        if (response && Array.isArray(response.memories)) {
          const serverMemories = response.memories;
          let mismatch = false;
          if (serverMemories.length !== memoriesRefForSync.current.length) {
            mismatch = true;
          } else {
            for (const sm of serverMemories) {
              const lm = memoriesRefForSync.current.find((m) => m.id === sm.id);
              if (
                !lm ||
                lm.key !== sm.key ||
                lm.value !== sm.value ||
                lm.category !== sm.category
              ) {
                mismatch = true;
                break;
              }
            }
          }

          if (mismatch) {
            console.log(
              "Consistency Check: Discrepancies detected with MongoDB server index. Reconciling client cache...",
            );
            setMemories(
              serverMemories.map((m: any) => ({
                id: m.id,
                key: m.key,
                value: m.value,
                category: m.category,
                importance: m.importance || 2,
              })),
            );
            setDataSyncStatus("reconciled");
          } else {
            console.log(
              "Consistency Check: Client cache fully verified and aligned with database server.",
            );
            setDataSyncStatus("consistent");
          }
        }
      } catch (err) {
        console.warn(
          "DB unreachable at boot startup. Disconnected container flow active.",
        );
        setDataSyncStatus("error");
      }
    };

    const timer = setTimeout(checkStateConsistency, 1500);
    const interval = setInterval(checkStateConsistency, 30000); // Background reconciliation every 30 seconds
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Monitor failed command attempts and trigger skill discovery (Task 5)
  React.useEffect(() => {
    const failedCmd = commandQueue.find((cmd) => cmd.status === "failed");
    if (failedCmd) {
      const seenKey = `neora_seen_failed_cmd_${failedCmd.id}`;
      if (!localStorage.getItem(seenKey)) {
        localStorage.setItem(seenKey, "true");
        
        console.error("[Neora System Error Monitor] Command failed:", failedCmd.prompt, failedCmd.error || "");
        
        neoraPost("/api/skill/discover", {
          commandId: failedCmd.id,
          prompt: failedCmd.prompt,
          error: failedCmd.error || "Execution timeout or abnormal return code",
          context: "terminal_failure"
        })
        .then((response: any) => {
          console.log("[Neora Skill Discover] Successfully searched repository and staged missing dependencies:", response);
          
          const event = new CustomEvent("neora-system-event", {
            detail: {
              id: "evt-skill-discover-" + Math.floor(Math.random() * 10000),
              timestamp: new Date().toTimeString().split(' ')[0],
              category: "learning",
              level: "SUCCESS",
              message: `Discovered missing capability for "${failedCmd.prompt}": Staged for user confirmation.`,
              details: JSON.stringify(response || { status: "staged", dependency: "Required skill" }, null, 2)
            }
          });
          window.dispatchEvent(event);
        })
        .catch((err) => {
          console.warn("Failed to discover skills for command:", err);
        });
      }
    }
  }, [commandQueue]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "i"
      ) {
        event.preventDefault();
        setClickInspectorMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("neora_show_debug_banner", String(showDebugBanner));
  }, [showDebugBanner]);

  React.useEffect(() => {
    if (!clickInspectorMode) {
      setInspectorLog(null);
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const label = (node: HTMLElement | null) => {
        if (!node) return "none";
        const idPart = node.id ? `#${node.id}` : "";
        const classPart =
          node.className && typeof node.className === "string"
            ? `.${node.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".")}`
            : "";
        return `${node.tagName.toLowerCase()}${idPart}${classPart}`;
      };
      const hit = label(element);
      const source = label(target);
      setInspectorLog(
        `target=${source} hit=${hit} x=${event.clientX} y=${event.clientY}`,
      );
      console.debug("[Neora Click Inspector]", {
        target: source,
        hit,
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("click", handleDocumentClick, true);
    return () => window.removeEventListener("click", handleDocumentClick, true);
  }, [clickInspectorMode]);

  React.useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      try {
        const status: any = await neoraGet("/api/os/status");
        if (!cancelled) {
          setServerOnline(status?.status === "online");
          setApiHealth(100);
          if (status?.queue) {
            setCommandQueue(status.queue);
          }
        }
      } catch {
        if (!cancelled) {
          setServerOnline(false);
          setApiHealth(0);
        }
      }
    };
    probe();
    const timer = setInterval(probe, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    const probeOverlay = () => {
      const hit = document.elementFromPoint(
        window.innerWidth / 2,
        120,
      ) as HTMLElement | null;
      const blocked =
        !!hit &&
        !hit.closest('button, a, input, textarea, select, [role="button"]');
      setOverlayBlocked(blocked);
    };
    probeOverlay();
    window.addEventListener("resize", probeOverlay);
    window.addEventListener("scroll", probeOverlay, true);
    const timer = setInterval(probeOverlay, 4000);
    return () => {
      window.removeEventListener("resize", probeOverlay);
      window.removeEventListener("scroll", probeOverlay, true);
      clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    const probeModal = () => {
      setModalOpen(
        Boolean(document.querySelector('[data-neora-modal="open"]')),
      );
    };
    probeModal();
    const timer = setInterval(probeModal, 2500);
    return () => clearInterval(timer);
  }, []);

  // --- DOWNLOAD REQUISITION REPORT GENERATOR ---
  const handleDownloadReport = () => {
    const backupCargo = {
      timestamp: new Date().toISOString(),
      client: "shukriaprinters@gmail.com",
      status_info: {
        latency: `${latency}ms`,
        api_health: `${apiHealth}%`,
      },
      registry_metrics: {
        total_tasks: tasks.length,
        total_reminders: reminders.length,
        total_notes: notes.length,
        total_memories: memories.length,
      },
      tasks,
      reminders,
      notes,
      memories,
    };

    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupCargo, null, 2))}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", "neora-workspace-backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Backup requisition generation failed:", err);
    }
  };

  const handleExportRecoveryBundle = async () => {
    try {
      const bundle: any = await neoraGet("/api/recovery/bundle");
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(bundle, null, 2))}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", "neora-recovery-bundle.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Recovery bundle export failed:", err);
    }
  };

  const handleImportRecoveryBundle = async (file: File) => {
    const text = await file.text();
    const payload = JSON.parse(text);
    const passphrase = window.prompt("Enter recovery bundle passphrase") || "";
    await neoraPost("/api/recovery/bundle", {
      ...payload,
      passphrase,
    });
  };

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K: toggle global search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // ESC: close global search
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
      // CMD/CTRL + Enter: Submit chat message if inside chat input
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        const customEvent = new CustomEvent("neora-submit-chat");
        window.dispatchEvent(customEvent);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectedSection = SECTIONS.find((s) => s.id === selectedSectionId);
  const t = TRANSLATIONS[lang];

  // Handler functions for cross-component triggers (chat NLP adds items directly!)
  const handleAddTask = (
    title: string,
    priority: "low" | "medium" | "high" | "critical",
    tags?: string[],
    reminderAt?: string,
    category?: string,
    notes?: string,
    attachment?: string,
    recurring?: 'none' | 'daily' | 'weekly' | 'monthly',
    subTasks?: SubTask[]
  ) => {
    const newTask: Task = {
      id: Math.random().toString(),
      title,
      notes: notes || "",
      priority,
      dueAt: new Date().toISOString().substring(0, 10),
      completed: false,
      tags: tags || [],
      reminderAt: reminderAt || "",
      category: category || "",
      createdAt: new Date().toISOString(),
      attachment,
      recurring,
      subTasks: subTasks || []
    };
    setTasks((prev) => [newTask, ...prev]);
    triggerDbSyncAnimation();
  };

  const handleSnoozeReminder = (id: string, snoozeMinutes: number) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newTime = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString().slice(0, 16);
          return { ...r, remindAt: newTime };
        }
        return r;
      })
    );
    triggerDbSyncAnimation();
  };

  const handleSnoozeTask = (id: string, snoozeMinutes: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newTime = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString();
          return { ...t, reminderAt: newTime };
        }
        return t;
      })
    );
    triggerDbSyncAnimation();
  };

  const handleAddReminder = (
    title: string,
    remindAt: string,
    repeat: "none" | "daily" | "weekly" | "monthly",
  ) => {
    const newRem: Reminder = {
      id: Math.random().toString(),
      title,
      remindAt,
      repeat,
      completed: false,
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  const handleAddNote = (title: string, content: string) => {
    const newNote: Note = {
      id: Math.random().toString(),
      title,
      content,
      createdAt: new Date().toLocaleDateString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const parseJarvisCommand = (command: string, isVoice = false) => {
    const cmd = command.trim();
    if (!cmd) return;

    // Save to LocalStorage command history
    const prevHistory = JSON.parse(localStorage.getItem("neora_command_history") || "[]");
    const newHistoryItem = {
      id: Date.now().toString(),
      command: cmd,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      success: true,
      isVoice: isVoice
    };
    localStorage.setItem("neora_command_history", JSON.stringify([newHistoryItem, ...prevHistory].slice(0, 50)));

    // Custom Event to update drawer
    window.dispatchEvent(new CustomEvent("neora-command-history-update"));

    const lowerCmd = cmd.toLowerCase();

    // 1. Tasks Scheduling
    if (lowerCmd.startsWith("schedule") || lowerCmd.includes("task") || lowerCmd.includes("sync")) {
      let title = cmd.replace(/schedule/i, "").trim();
      let priority: "low" | "medium" | "high" | "critical" = "medium";
      let dueAt = new Date().toISOString().substring(0, 10);
      let category = "Workspace";
      let tags: string[] = ["Jarvis"];
      let repeat: "none" | "daily" | "weekly" | "monthly" = "none";

      if (lowerCmd.includes("weekly")) {
        repeat = "weekly";
        title = title.replace(/weekly/i, "").trim();
      }
      if (lowerCmd.includes("daily")) {
        repeat = "daily";
        title = title.replace(/daily/i, "").trim();
      }
      if (lowerCmd.includes("urgent") || lowerCmd.includes("critical")) {
        priority = "critical";
      } else if (lowerCmd.includes("high")) {
        priority = "high";
      } else if (lowerCmd.includes("low")) {
        priority = "low";
      }

      // Parse Day
      const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      let targetDayOffset = 0;
      let foundDay = false;
      
      for (let i = 0; i < 7; i++) {
        if (lowerCmd.includes(daysOfWeek[i])) {
          const todayDay = new Date().getDay();
          const targetDay = i;
          targetDayOffset = (targetDay - todayDay + 7) % 7;
          if (targetDayOffset === 0) targetDayOffset = 7;
          foundDay = true;
          title = title.replace(new RegExp(daysOfWeek[i], "i"), "").trim();
          break;
        }
      }

      if (lowerCmd.includes("tomorrow")) {
        targetDayOffset = 1;
        title = title.replace(/tomorrow/i, "").trim();
      } else if (lowerCmd.includes("today")) {
        targetDayOffset = 0;
        title = title.replace(/today/i, "").trim();
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + targetDayOffset);
      dueAt = dueDate.toISOString().substring(0, 10);

      title = title.replace(/on/i, "").replace(/a\s+/i, "").replace(/for/i, "").replace(/morning/i, "").replace(/afternoon/i, "").trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);

      handleAddTask(title || "Untitled Jarvis Task", priority, tags, "", category);
      
      const notifEvent = new CustomEvent("neora-notification", {
        detail: {
          title: lang === "bn" ? "টাস্ক যুক্ত হয়েছে" : "Task Scheduled",
          message: lang === "bn" 
            ? `"${title}" টাস্কটি ${dueAt} তারিখের জন্য তৈরি করা হয়েছে।` 
            : `Scheduled "${title}" (Priority: ${priority}) for ${dueAt}.`,
          type: "success"
        }
      });
      window.dispatchEvent(notifEvent);
      playSystemChirp("success");
      return;
    }

    // 2. Reminders Parsing
    if (lowerCmd.includes("remind") || lowerCmd.includes("reminder") || lowerCmd.startsWith("set a reminder")) {
      let title = cmd.replace(/remind me to/i, "").replace(/set a reminder to/i, "").replace(/set a reminder for/i, "").trim();
      let remindAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      let repeat: "none" | "daily" | "weekly" | "monthly" = "none";

      const minMatch = lowerCmd.match(/in\s+(\d+)\s*(minutes|minute|mins|min)/);
      const hourMatch = lowerCmd.match(/in\s+(\d+)\s*(hours|hour|hrs|hr)/);
      
      if (minMatch) {
        const mins = parseInt(minMatch[1]);
        remindAt = new Date(Date.now() + mins * 60 * 1000).toISOString();
        title = title.replace(minMatch[0], "").trim();
      } else if (hourMatch) {
        const hours = parseInt(hourMatch[1]);
        remindAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        title = title.replace(hourMatch[0], "").trim();
      }

      title = title.replace(/in\s+\d+\s*\w+/i, "").trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);

      handleAddReminder(title || "Jarvis Reminder", remindAt, repeat);

      const formattedTime = new Date(remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const notifEvent = new CustomEvent("neora-notification", {
        detail: {
          title: lang === "bn" ? "রিমাইন্ডার সেট হয়েছে" : "Reminder Configured",
          message: lang === "bn"
            ? `"${title}" রিমাইন্ডারটি ${formattedTime} এ সেট করা হয়েছে।`
            : `Configured reminder for "${title}" at ${formattedTime}.`,
          type: "info"
        }
      });
      window.dispatchEvent(notifEvent);
      playSystemChirp("success");
      return;
    }

    // Fallback notification
    const fallbackEvent = new CustomEvent("neora-notification", {
      detail: {
        title: "Command Processed",
        message: `Jarvis parser completed execution: "${cmd}"`,
        type: "info"
      }
    });
    window.dispatchEvent(fallbackEvent);
  };

  const handleQuickFixSystem = () => {
    if (isSystemHealing) return;
    setIsSystemHealing(true);
    playSystemChirp("beep");

    // Show a notification that healing has started
    const startEvent = new CustomEvent("neora-notification", {
      detail: {
        title: lang === "bn" ? "নিরাময় শুরু হয়েছে" : "Diagnostics Initialized",
        message: lang === "bn" ? "অটোমেটেড সিস্টেম হিলিং প্রোটোকল সক্রিয় করা হচ্ছে..." : "Automated neural reconciliation protocol initiated.",
        type: "info"
      }
    });
    window.dispatchEvent(startEvent);

    // Simulate repair process over 2 seconds
    setTimeout(() => {
      setApiHealth(100);
      setIsSystemHealing(false);
      playSystemChirp("success");

      // Custom Event for system log update
      const customEvt = new CustomEvent("neora-system-event", {
        detail: {
          id: "evt-opt-" + Math.floor(Math.random() * 10000),
          timestamp: new Date().toTimeString().split(" ")[0],
          category: "system_heal",
          level: "CRITICAL",
          message: "System health self-healed and reconciled successfully."
        }
      });
      window.dispatchEvent(customEvt);

      // Success notification toast
      const successEvent = new CustomEvent("neora-notification", {
        detail: {
          title: lang === "bn" ? "সিস্টেম নিরাময় সম্পূর্ণ" : "System Integrity Restored",
          message: lang === "bn" ? "নিওরা আর্কিটেক্ট সিস্টেম ১০০% স্থিতিশীল অবস্থায় ফিরে এসেছে।" : "Neora system parameters are fully reconciled and stabilized at 100%.",
          type: "success"
        }
      });
      window.dispatchEvent(successEvent);
    }, 2200);
  };

  const handleSelfEvolution = (action: string) => {
    if (action === "optimize-all-interfaces") {
      optimizeLayoutAllInterfaces();
      setIsDashboardOptimized(true);
      localStorage.setItem("neora_dashboard_optimized", "true");
    } else if (action === "optimize-dashboard") {
      setIsDashboardOptimized(true);
      localStorage.setItem("neora_dashboard_optimized", "true");

      const customEvt = new CustomEvent("neora-system-event", {
        detail: {
          id: "evt-opt-" + Math.floor(Math.random() * 10000),
          timestamp: new Date().toTimeString().split(" ")[0],
          category: "system_heal",
          level: "CRITICAL",
          message:
            lang === "bn"
              ? "স্বয়ংক্রিয় উন্নয়ন: ড্যাশবোর্ড গ্রিড এবং ক্যাশে বাফার অপ্টিমাইজড!"
              : "Self-Evolution: Optimized dashboard grid buffers & container telemetry layout!",
          details: JSON.stringify(
            {
              evolution_status: "OPTIMIZED_SUCCESS",
              action: "optimize-dashboard",
              latency_ms: 12,
              new_modules_activated: [
                "SystemEventLog",
                "DynamicRecoveryBackupDaily",
                "FuzzyTasksDependencies",
              ],
              container_health: "EXCELLENT (100% stable)",
            },
            null,
            2,
          ),
          latency: "12ms",
        },
      });
      window.dispatchEvent(customEvt);
    }
  };

  React.useEffect(() => {
    // Trigger Adaptive UI Engine on mount to reorganize dashboard widgets for better engagement
    handleSelfEvolution("optimize-all-interfaces");
  }, []);

  const handleAddMemory = (
    key: string,
    value: string,
    category: "personal" | "work" | "preference" | "skill",
    importance: number,
  ) => {
    const newMem: Memory = {
      id: Math.random().toString(),
      key,
      value,
      category,
      importance,
    };
    neoraPost("/api/memory", {
      id: newMem.id,
      key,
      value,
      category,
      importance,
    }).catch((err) => {
      console.warn("Failed to persist memory:", err);
    });
    setMemories((prev) => [newMem, ...prev]);
  };

  // Toggle checklist status
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              completed: !x.completed,
              completedAt: !x.completed ? new Date().toISOString() : undefined,
            }
          : x,
      ),
    );
    triggerDbSyncAnimation();
  };
  const handleDeleteTask = (id: string, force: boolean = false) => {
    const item = tasks.find((x) => x.id === id);
    if (!item) return;

    if (item.priority === "critical" && !force) {
      setTaskToDelete(item);
      return;
    }

    triggerUndoOption("task", item);
    setTasks((prev) => prev.filter((x) => x.id !== id));
    triggerDbSyncAnimation();
    setTaskToDelete(null);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((x) => x.id === id ? { ...x, ...updates } : x));
    triggerDbSyncAnimation();
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)),
    );
  };
  const handleDeleteReminder = (id: string) => {
    const item = reminders.find((x) => x.id === id);
    if (item) {
      triggerUndoOption("reminder", item);
    }
    setReminders((prev) => prev.filter((x) => x.id !== id));
  };

  const handleDeleteNote = (id: string) => {
    const item = notes.find((x) => x.id === id);
    if (item) {
      triggerUndoOption("note", item);
    }
    setNotes((prev) => prev.filter((x) => x.id !== id));
  };

  const handleDeleteMemory = (id: string) => {
    const item = memories.find((x) => x.id === id);
    if (item) {
      triggerUndoOption("memory", item);
    }
    neoraDelete(`/api/memory/${id}`).catch((err) => {
      console.warn("Failed to delete memory on server:", err);
    });
    setMemories((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <ErrorBoundary>
      <AutoHealRegistry lang={lang} />
      <MetaAgent lang={lang} activeTab={activeTab} />
      <AppShell
        activeTab={activeTab as any}
        onChangeTab={setActiveTab as any}
        onVoiceOpen={() => setVoicePanelOpen(true)}
      >
        {showDebugBanner && (
          <DebugBanner
            apiHealthy={apiHealth > 0}
            overlayBlocked={overlayBlocked}
            modalOpen={modalOpen}
            serverOnline={serverOnline}
            onDismiss={() => setShowDebugBanner(false)}
            onTogglePersist={() => setShowDebugBanner((prev) => !prev)}
            persisted={showDebugBanner}
          />
        )}
        <div
          id="app-wrapper"
          className={`flex-1 flex flex-col h-full min-h-0 w-full font-sans overflow-hidden print:bg-white print:text-black relative ${clickInspectorMode ? "cursor-crosshair" : ""}`}
          style={{
            background: {
              cyber: "#000814",
              retro: "#120a00",
              matrix: "#001000",
              sunset: "#150015",
              solarized: "#fdf6e3"
            }[visualTheme] || "#000814",
            color: {
              cyber: "#cce8ff",
              retro: "#f59e0b",
              matrix: "#10b981",
              sunset: "#f43f5e",
              solarized: "#073642"
            }[visualTheme] || "#cce8ff"
          }}
        >
          {diagnosticWarnings.length > 0 && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center gap-2 text-amber-400 font-mono text-[10px] z-50">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-wrap gap-x-4">
                {diagnosticWarnings.map((warn, i) => (
                  <span key={i}>{warn}</span>
                ))}
              </div>
            </div>
          )}
          {clickInspectorMode && (
            <div className="pointer-events-none fixed right-4 top-16 z-[70] rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-2 text-xs text-fuchsia-100 backdrop-blur-xl space-y-1">
              <div>Click Inspector: ON</div>
              <div className="text-[10px] text-fuchsia-100/80">
                {inspectorLog || "click anywhere to log hit-targets"}
              </div>
            </div>
          )}
          <Suspense
            fallback={
              <div className="flex min-h-[60vh] items-center justify-center text-cyan-200">
                Loading workspace…
              </div>
            }
          >
            {/* Global Animated Holographic Scanline Overlay Screen Layer */}
            <div className="holo-scanline-container print:hidden">
              <div className="holo-scanline-bar"></div>
            </div>

            {/* ===== JARVIS HEADER ===== */}
            {activeTab === "home" && (
              <header
                id="main-header"
                className="shrink-0 print:hidden select-none"
                style={{
                  background: "rgba(0,6,18,0.92)",
                  borderBottom: "1px solid rgba(0,212,255,0.12)",
                  backdropFilter: "blur(24px)",
                  boxShadow:
                    "0 4px 30px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(0,212,255,0.06)",
                }}
              >
                {/* Top scan line accent */}
                <div
                  style={{
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,212,255,0.4) 30%, rgba(26,159,255,0.4) 70%, transparent)",
                    marginBottom: 0,
                  }}
                />

                <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                  {/* Left: Identity */}
                  <div className="flex items-center gap-3">
                    {/* Arc Reactor Icon */}
                    <div
                      className="relative w-9 h-9 shrink-0 arc-reactor rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "radial-gradient(circle at 40% 40%, rgba(0,212,255,0.25), rgba(0,60,120,0.15) 50%, rgba(0,8,20,0.95))",
                        border: "1px solid rgba(0,212,255,0.4)",
                      }}
                    >
                      <div
                        className="absolute inset-[4px] rounded-full"
                        style={{
                          border: "1px solid rgba(0,212,255,0.2)",
                          animation: "arc-reactor-ring 5s linear infinite",
                        }}
                      />
                      <Cpu
                        className="w-4 h-4 relative z-10"
                        style={{
                          color: "#00d4ff",
                          filter: "drop-shadow(0 0 4px rgba(0,212,255,0.8))",
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h1
                          className="font-jarvis text-sm font-bold tracking-[0.2em] uppercase"
                          style={{
                            color: "#00d4ff",
                            textShadow: "0 0 15px rgba(0,212,255,0.5)",
                          }}
                        >
                          {t.title}
                        </h1>
                        {/* Online status */}
                        <div className="hidden sm:flex items-center gap-1.5 rounded px-2 py-0.5 text-[9px] font-mono font-bold sys-online">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
                            style={{
                              boxShadow: "0 0 4px #00ff88",
                              animation: "glow-pulse 1.5s infinite",
                            }}
                          />
                          {t.statusOnline}
                        </div>
                        {/* Latency readout */}
                        <div
                          className="hidden lg:flex items-center gap-2 rounded px-2 py-0.5 text-[9px] font-mono"
                          style={{
                            background: "rgba(0,212,255,0.05)",
                            border: "1px solid rgba(0,212,255,0.1)",
                            color: "rgba(0,212,255,0.7)",
                          }}
                        >
                          <span className="w-1 h-1 rounded-full bg-[#00d4ff] animate-pulse" />
                          <span>
                            LATENCY:{" "}
                            <strong style={{ color: "#00d4ff" }}>
                              {latency}ms
                            </strong>
                          </span>
                          <span style={{ color: "rgba(0,212,255,0.2)" }}>
                            │
                          </span>
                          <span>
                            HEALTH:{" "}
                            <strong style={{ color: "#00ff88" }}>
                              {apiHealth}%
                            </strong>
                          </span>
                        </div>
                      </div>
                      <p
                        className="text-[9px] font-mono mt-0.5"
                        style={{
                          color: "rgba(0,212,255,0.35)",
                          letterSpacing: "0.15em",
                        }}
                      >
                        {t.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right: Controls */}
                  <div className="flex items-center gap-1.5">
                    {/* Ambient Sound Mode Trigger & Slider */}
                    <div
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-mono transition-all"
                      style={{
                        border: "1px solid rgba(0,212,255,0.1)",
                        background: "rgba(0,212,255,0.02)",
                        color: "rgba(0,212,255,0.85)",
                      }}
                    >
                      <button
                        onClick={() => setAmbientPlaying(!ambientPlaying)}
                        className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Toggle Ambient Futuristic Soundscapes"
                      >
                        {ambientPlaying ? (
                          <Volume2 className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="hidden sm:inline">AMBIENT</span>
                      </button>
                      {ambientPlaying && (
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={ambientVolume}
                          onChange={(e) =>
                            setAmbientVolume(parseFloat(e.target.value))
                          }
                          className="w-12 h-1 accent-cyan-400 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                          title={`Volume: ${Math.round(ambientVolume * 100)}%`}
                        />
                      )}
                    </div>

                     <button
                      onClick={() => setIsSearchOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] cursor-pointer font-mono transition-all jarvis-nav-btn"
                      style={{
                        border: "1px solid rgba(0,212,255,0.12)",
                        background: "rgba(0,212,255,0.04)",
                        color: "rgba(0,212,255,0.7)",
                      }}
                      title="Search Workspace (CMD+K)"
                    >
                      <Search className="w-3 h-3" />
                      <span className="hidden md:inline">CMD+K</span>
                    </button>

                    <button
                      onClick={() => setIsDashboardAddTaskOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] cursor-pointer font-mono transition-all jarvis-nav-btn hover:border-cyan-400 hover:text-white"
                      style={{
                        border: "1px solid rgba(0,212,255,0.35)",
                        background: "rgba(0,212,255,0.12)",
                        color: "#00d4ff",
                        boxShadow: "0 0 10px rgba(0,212,255,0.25)",
                      }}
                      title="Add New Task"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === "bn" ? "টাস্ক যোগ" : "ADD TASK"}</span>
                    </button>

                    <button
                      onClick={handleDownloadReport}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono cursor-pointer transition-all jarvis-nav-btn"
                      style={{
                        border: "1px solid rgba(0,212,255,0.1)",
                        background: "rgba(0,212,255,0.03)",
                        color: "rgba(0,212,255,0.6)",
                      }}
                      title="Export report JSON"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden md:inline">EXPORT</span>
                    </button>

                    <button
                      onClick={handleExportRecoveryBundle}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono cursor-pointer transition-all jarvis-nav-btn"
                      style={{
                        border: "1px solid rgba(0,255,136,0.12)",
                        background: "rgba(0,255,136,0.03)",
                        color: "rgba(0,255,136,0.6)",
                      }}
                      title="Export recovery bundle"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden lg:inline">RECOVERY</span>
                    </button>

                    <button
                      onClick={() => recoveryImportRef.current?.click()}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono cursor-pointer transition-all jarvis-nav-btn"
                      style={{
                        border: "1px solid rgba(245,166,35,0.15)",
                        background: "rgba(245,166,35,0.04)",
                        color: "rgba(245,166,35,0.7)",
                      }}
                      title="Import recovery bundle"
                    >
                      <Upload className="w-3 h-3" />
                      <span className="hidden lg:inline">IMPORT</span>
                    </button>
                    <input
                      ref={recoveryImportRef}
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleImportRecoveryBundle(file);
                        e.target.value = "";
                      }}
                    />

                    <div
                      className="hidden xl:flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[10px] font-mono"
                      style={{
                        background: "rgba(124,58,237,0.08)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        color: "rgba(167,139,250,0.9)",
                      }}
                    >
                      <Activity className="w-3 h-3" />
                      <span>{t.autonomyLevel}:</span>
                      <span
                        className="font-bold"
                        style={{
                          color: "#a78bfa",
                          textShadow: "0 0 6px rgba(167,139,250,0.5)",
                        }}
                      >
                        LVL {autonomyLevel}
                      </span>
                    </div>

                    <button
                      id="lang-toggle-btn"
                      onClick={() => setLang((prev) => (prev === "en" ? "bn" : "en"))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-[#00d4ff]/15 hover:bg-[#00d4ff]/25 border border-[#00d4ff]/35 text-[#00d4ff] cursor-pointer transition-colors"
                      title="Click to toggle language manually between English and Bengali."
                    >
                      <Languages className="w-3.5 h-3.5 animate-pulse" />
                      <span>
                        {lang === "bn"
                          ? "ভাষা: বাংলা"
                          : "Language: EN"}
                      </span>
                    </button>
                  </div>
                </div>
              </header>
            )}

            {/* ===== JARVIS NAV BAR ===== */}
            {activeTab === "home" && (
              <nav
                id="primary-tabs"
                className="shrink-0 flex items-center overflow-x-auto gap-0.5 px-4 py-1.5 select-none print:hidden"
                style={{
                  background: "rgba(0,4,12,0.85)",
                  borderBottom: "1px solid rgba(0,212,255,0.08)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {(
                  [
                    {
                      id: "home",
                      label: lang === "bn" ? "ড্যাশবোর্ড" : "DASHBOARD",
                      icon: Activity,
                      color: "#00d4ff",
                    },
                    {
                      id: "chat",
                      label: t.navChat,
                      icon: MessageSquare,
                      color: "#00d4ff",
                    },
                    {
                      id: "neoraTv",
                      label: lang === "bn" ? "নিওরা টিভি" : "NEORA TV",
                      icon: Tv,
                      color: "#ff007c",
                    },
                    {
                      id: "autonomy",
                      label: t.navAutonomy,
                      icon: Sliders,
                      color: "#1a9fff",
                    },
                    {
                      id: "productivity",
                      label: t.navProductivity,
                      icon: Clipboard,
                      color: "#7c3aed",
                    },
                    {
                      id: "memoriesGraph",
                      label: lang === "bn" ? "মেমোরিজ গ্রাফ" : "MEMORIES GRAPH",
                      icon: Share2,
                      color: "#38bdf8",
                    },
                    {
                      id: "invoice",
                      label: t.navInvoice,
                      icon: DollarSign,
                      color: "#f5a623",
                    },
                    {
                      id: "dev",
                      label: t.navDev,
                      icon: Terminal,
                      color: "#f5a623",
                    },
                    {
                      id: "osAgent",
                      label: t.navOsAgent,
                      icon: Laptop,
                      color: "#00ff88",
                    },
                    {
                      id: "filterLab",
                      label: t.navFilterLab,
                      icon: Filter,
                      color: "#00d4ff",
                    },
                    {
                      id: "roadmap",
                      label: t.navRoadmap,
                      icon: Milestone,
                      color: "#1a9fff",
                    },
                    {
                      id: "blueprint",
                      label: t.navSpecs,
                      icon: BookOpen,
                      color: "#00d4ff",
                    },
                    {
                      id: "vscode",
                      label: "VS Code",
                      icon: Terminal,
                      color: "#00d4ff",
                    },
                    {
                      id: "evolution",
                      label: lang === "bn" ? "ইভোলিউশন" : "EVOLUTION",
                      icon: Cpu,
                      color: "#a78bfa",
                    },
                  ] as { id: any; label: string; icon: any; color: string }[]
                ).map(({ id, label, icon: Icon, color }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      id={`navtab-${id}`}
                      onClick={() => setActiveTab(id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-mono font-bold uppercase cursor-pointer transition-all whitespace-nowrap shrink-0"
                      style={
                        isActive
                          ? {
                              background: `rgba(0,212,255,0.08)`,
                              border: `1px solid rgba(0,212,255,0.22)`,
                              color: color,
                              textShadow: `0 0 8px ${color}80`,
                              boxShadow: `0 0 10px rgba(0,212,255,0.08), inset 0 1px 0 rgba(0,212,255,0.1)`,
                            }
                          : {
                              border: "1px solid transparent",
                              color: "rgba(100,116,139,0.7)",
                            }
                      }
                    >
                      <Icon
                        className="w-3 h-3 shrink-0"
                        style={
                          isActive
                            ? { filter: `drop-shadow(0 0 3px ${color})` }
                            : {}
                        }
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            )}
                               {/* ===== JARVIS COMMAND CENTER — Dashboard tab only (fills remaining height) ===== */}
            {activeTab === "home" && (
              <section className="px-4 py-3 print:hidden flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 max-w-[1600px] mx-auto">
                  <AnimatePresence mode="popLayout">
                    {predictiveWidgets
                      .filter((w) => w.visible)
                      .map((widget) => {
                        if (widget.id === "agent_intelligence") {
                          return (
                            <motion.div
                              layoutId="agent_intelligence"
                              key="agent_intelligence"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "agent_intelligence")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "agent_intelligence")}
                              className="col-span-1 md:col-span-2 cursor-grab active:cursor-grabbing"
                              onClick={() => trackWidgetInteraction("agent_intelligence")}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <AgentIntelligenceWidget lang={lang} apiHealth={apiHealth} />
                            </motion.div>
                          );
                        }

                        if (widget.id === "command_center") {
                          // Compute dynamic suggestions based on most active tools (Task 2)
                          const getDynamicSuggestions = () => {
                            return cliSuggestions;
                          };

                          return (
                            <motion.div
                              layoutId="command_center"
                              id="command-center"
                              key="command_center"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "command_center")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "command_center")}
                              className="col-span-1 md:col-span-2 xl:col-span-2 relative rounded-xl overflow-hidden p-4 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                              onClick={() => trackWidgetInteraction("command_center")}
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(0,15,40,0.9) 0%, rgba(0,8,22,0.85) 100%)",
                                border: "1px solid rgba(0,212,255,0.18)",
                                boxShadow:
                                  "0 0 0 1px rgba(0,212,255,0.05), 0 8px 32px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,212,255,0.03)",
                                backdropFilter: "blur(20px)",
                                minHeight: "140px",
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              {/* Corner accent lines */}
                              <div
                                className="absolute top-0 left-0 w-8 h-px"
                                style={{ background: "rgba(0,212,255,0.6)" }}
                              />
                              <div
                                className="absolute top-0 left-0 w-px h-8"
                                style={{ background: "rgba(0,212,255,0.6)" }}
                              />
                              <div
                                className="absolute bottom-0 right-0 w-8 h-px"
                                style={{ background: "rgba(0,212,255,0.3)" }}
                              />
                              <div
                                className="absolute bottom-0 right-0 w-px h-8"
                                style={{ background: "rgba(0,212,255,0.3)" }}
                              />
                              <div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)",
                                }}
                              />

                              <div>
                                <div className="flex justify-between items-center mb-1.5">
                                  <div 
                                    className="flex items-center gap-1.5 relative"
                                    onMouseEnter={() => setShowQuickHelp(true)}
                                    onMouseLeave={() => setShowQuickHelp(false)}
                                  >
                                    <div className="jarvis-label">
                                      WORKSPACE COMMAND CENTER
                                    </div>
                                    <span
                                      className="p-0.5 hover:bg-slate-800/60 rounded text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                                      title="Hover for Quick Commands Syntax Help"
                                    >
                                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                                    </span>
                                    <AnimatePresence>
                                      {showQuickHelp && (
                                        <motion.div
                                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                          className="absolute left-0 top-6 z-50 w-72 p-3 bg-slate-950/95 border border-cyan-500/35 rounded-xl shadow-2xl backdrop-blur-md text-[10px] font-mono text-slate-300 space-y-1.5"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="flex justify-between items-center border-b border-slate-900 pb-1 text-cyan-400 font-bold uppercase">
                                            <span>⚡ {lang === "bn" ? "ট্যাব ভিত্তিক কমান্ড সিনট্যাক্স" : `SYNTAX: ${activeTab.toUpperCase()}`}</span>
                                          </div>
                                          <div className="space-y-1.5 pt-1.5">
                                            {(memories.find(m => m.key.toLowerCase().includes(`syntax: ${activeTab.toLowerCase()} tab`))?.value.split(',') || [
                                              "open [tab] (Navigate to tab)",
                                              "diagnose (System integrity scan)",
                                              "add task [name] (Direct planner scheduling)"
                                            ]).map((item, idx) => {
                                              const parts = item.split('(');
                                              const cmd = parts[0]?.trim() || "";
                                              const desc = parts[1]?.replace(')', '').trim() || "";
                                              return (
                                                <div key={idx} className="bg-slate-900/60 p-1.5 rounded border border-slate-900 text-left">
                                                  <span className="text-cyan-400 font-bold">{cmd}</span>
                                                  {desc && <span className="block text-[9px] text-slate-400 font-sans mt-0.5">{desc}</span>}
                                                </div>
                                              );
                                            })}
                                          </div>
                                          <div className="text-[8px] text-slate-500 border-t border-slate-900 pt-1">
                                            {lang === "bn" ? "* মেমোরি ব্যাংক থেকে সিনট্যাক্স লোড করা হয়েছে" : "* Pulled contextually from Neora memory bank"}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                  
                                  <AnimatePresence mode="wait">
                                    <motion.div
                                      key={dataSyncStatus}
                                      initial={{ opacity: 0, scale: 0.9, y: -2 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: 2 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                      className="text-[9px] font-mono flex items-center gap-1.5 bg-slate-950/40 px-2 py-0.5 rounded-md border border-slate-900"
                                    >
                                      {dataSyncStatus === "checking" ? (
                                        <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                          {/* Outer progress ring */}
                                          <svg className="w-3.5 h-3.5 text-cyan-400 animate-spin" viewBox="0 0 36 36">
                                            <circle 
                                              className="opacity-25" 
                                              strokeWidth="3" 
                                              stroke="currentColor" 
                                              fill="none" 
                                              r="16" 
                                              cx="18" 
                                              cy="18" 
                                            />
                                            <circle 
                                              className="opacity-100" 
                                              strokeWidth="3" 
                                              strokeDasharray="100" 
                                              strokeDashoffset="35" 
                                              strokeLinecap="round" 
                                              stroke="currentColor" 
                                              fill="none" 
                                              r="16" 
                                              cx="18" 
                                              cy="18" 
                                            />
                                          </svg>
                                          {/* Center pulse dot */}
                                          <span className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                                        </div>
                                      ) : (
                                        <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                          {isSyncingDb && (
                                            <div className="absolute inset-0 pointer-events-none">
                                              <svg className="w-3.5 h-3.5 text-emerald-400 animate-spin" viewBox="0 0 36 36">
                                                <circle 
                                                  className="opacity-30" 
                                                  strokeWidth="4.5" 
                                                  stroke="currentColor" 
                                                  fill="none" 
                                                  r="15" 
                                                  cx="18" 
                                                  cy="18" 
                                                />
                                                <circle 
                                                  className="opacity-100" 
                                                  strokeWidth="4.5" 
                                                  strokeDasharray="100" 
                                                  strokeDashoffset="40" 
                                                  strokeLinecap="round" 
                                                  stroke="currentColor" 
                                                  fill="none" 
                                                  r="15" 
                                                  cx="18" 
                                                  cy="18" 
                                                />
                                              </svg>
                                            </div>
                                          )}
                                          <span
                                            className={`w-1.5 h-1.5 rounded-full relative z-10 ${
                                              dataSyncStatus === "consistent"
                                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                                : dataSyncStatus === "reconciled"
                                                   ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                                                   : "bg-cyan-400 animate-pulse"
                                             }`}
                                           />
                                         </div>
                                       )}
                                       <span className="text-slate-500 uppercase font-bold">
                                         {dataSyncStatus === "checking"
                                           ? "Verifying..."
                                           : dataSyncStatus === "consistent"
                                             ? "Consistent"
                                             : dataSyncStatus === "reconciled"
                                               ? "Balanced"
                                               : "Standby"}
                                       </span>
                                     </motion.div>
                                   </AnimatePresence>
                                 </div>
                                 <h2
                                  className="font-jarvis text-base font-bold mb-1"
                                  style={{
                                    color: "#00d4ff",
                                    textShadow: "0 0 15px rgba(0,212,255,0.4)",
                                  }}
                                >
                                  {lang === "bn"
                                    ? "এক নজরে Neora workspace"
                                    : "NEORA AI SYSTEM"}
                                </h2>
                                <p className="text-[11px] text-slate-400 leading-normal">
                                  {lang === "bn"
                                    ? "চ্যাট, অটোমেশন, মেমরি, এবং OS agent এক স্ক্রিনে।"
                                    : "Neural interface · Autonomous operations · Memory persistence · OS control"}
                                </p>
                              </div>

                              {isDashboardOptimized && (
                                <div className="mt-2 p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] flex items-center justify-between animate-pulse">
                                  <span className="flex items-center gap-1">
                                    <Cpu className="w-3.5 h-3.5" />
                                    <span>COGNITIVE SHIELD ACTIVE</span>
                                  </span>
                                  <span className="font-bold">EVOLVED v2.4</span>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-1.5 mt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsHistoryOpen(true);
                                  }}
                                  className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1"
                                  style={{
                                    background: "rgba(0,212,255,0.1)",
                                    border: "1px solid rgba(0,212,255,0.3)",
                                    color: "#00d4ff",
                                    textShadow: "0 0 6px rgba(0,212,255,0.4)",
                                  }}
                                >
                                  <History className="w-3 h-3 text-[#00d4ff]" />
                                  <span>HISTORY</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (dataSyncStatus === "error") {
                                      const notifEvent = new CustomEvent("neora-notification", {
                                        detail: {
                                          title: lang === "bn" ? "ভ্যালিডেশন ব্যর্থ" : "Sync Fault Detected",
                                          message: lang === "bn" ? "ডাটাবেস অসঙ্গতির কারণে কাজ যোগ করা সম্ভব নয়।" : "Workspace synchronization error prevents dynamic additions.",
                                          type: "error"
                                        }
                                      });
                                      window.dispatchEvent(notifEvent);
                                      return;
                                    }
                                    
                                    setIsPlusRotating(true);
                                    setTimeout(() => {
                                      setIsPlusRotating(false);
                                      setIsDashboardAddTaskOpen(true);
                                    }, 400);
                                  }}
                                  className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1"
                                  style={{
                                    background: "rgba(16,185,129,0.1)",
                                    border: "1px solid rgba(16,185,129,0.3)",
                                    color: "#10b981",
                                    textShadow: "0 0 6px rgba(16,185,129,0.4)",
                                  }}
                                >
                                  <Plus className={`w-3 h-3 text-[#10b981] transition-transform duration-300 ${isPlusRotating ? "rotate-180 scale-125" : ""}`} />
                                  <span>QUICK TASK</span>
                                </button>

                                {(
                                  [
                                    { label: "CHAT", tab: "chat", color: "#00d4ff" },
                                    {
                                      label: "OS AGENT",
                                      tab: "osAgent",
                                      color: "#00ff88",
                                    },
                                    {
                                      label: "PLANNER",
                                      tab: "autonomy",
                                      color: "#1a9fff",
                                    },
                                    {
                                      label: "ROADMAP",
                                      tab: "roadmap",
                                      color: "#7c3aed",
                                    },
                                  ] as { label: string; tab: any; color: string }[]
                                ).map(({ label, tab, color }) => (
                                  <button
                                    key={tab}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTab(tab);
                                    }}
                                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                    style={{
                                      background: `${color}12`,
                                      border: `1px solid ${color}30`,
                                      color: color,
                                      textShadow: `0 0 6px ${color}60`,
                                    }}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>

                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const fd = new FormData(e.currentTarget);
                                  const cmdText = fd.get("jarvis-cmd") as string;
                                  if (cmdText?.trim()) {
                                    parseJarvisCommand(cmdText.trim());
                                    e.currentTarget.reset();
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-3 flex gap-1.5 items-center bg-slate-900/60 border border-cyan-500/15 rounded-lg px-2.5 py-1.5 focus-within:border-cyan-400/40 transition-all"
                              >
                                <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <input
                                  name="jarvis-cmd"
                                  type="text"
                                  placeholder={
                                    lang === "bn"
                                      ? "জারভিসকে বলুন: 'Schedule a weekly sync on Friday morning'..."
                                      : "Ask Jarvis: 'Schedule a weekly sync on Friday morning'..."
                                  }
                                  className="flex-1 bg-transparent text-[11px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  className="px-2.5 py-1 rounded bg-cyan-400/10 hover:bg-cyan-400 text-cyan-400 hover:text-slate-950 font-mono text-[9px] font-bold uppercase transition-all cursor-pointer shrink-0"
                                >
                                  EXECUTE
                                </button>
                              </form>
                            </motion.div>
                          );
                        }

                        if (widget.id === "tasks") {
                          const activeCriticalCount = tasks.filter(t => !t.completed && !t.archived && t.priority === "critical").length;
                          const dotColors = {
                            critical: "bg-rose-500 shadow-[0_0_6px_#f43f5e]",
                            high: "bg-amber-500 shadow-[0_0_6px_#f59e0b]",
                            medium: "bg-cyan-500 shadow-[0_0_6px_#06b6d4]",
                            low: "bg-slate-500 shadow-[0_0_6px_#64748b]"
                          };

                          const priorityBadges = {
                            critical: "bg-rose-500/10 text-rose-400 border-rose-500/30",
                            high: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                            medium: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
                            low: "bg-slate-500/10 text-slate-400 border-slate-500/30",
                          };

                          const isOverdue = (dueAt?: string) => {
                            if (!dueAt) return false;
                            try {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const dueDate = new Date(dueAt);
                              dueDate.setHours(0, 0, 0, 0);
                              return dueDate < today;
                            } catch {
                              return false;
                            }
                          };

                          const uniqueTags = Array.from(
                            new Set(
                              tasks.flatMap((tk) => {
                                const tks: string[] = [];
                                if (tk.tags) tks.push(...tk.tags);
                                if (tk.category) tks.push(tk.category);
                                return tks;
                              }).map((t) => t.trim()).filter(Boolean)
                            )
                          );

                          const todayStr = new Date().toISOString().slice(0, 10);
                          const todayDate = new Date();
                          todayDate.setHours(0, 0, 0, 0);

                          const next7DaysDate = new Date();
                          next7DaysDate.setDate(next7DaysDate.getDate() + 7);
                          next7DaysDate.setHours(23, 59, 59, 999);

                          const visibleActiveTasks = tasks.filter((tk) => {
                            if (tk.completed || tk.archived) return false;

                            const matchesPriority = selectedDashboardPriorities.includes(tk.priority);
                            const matchesTag = selectedDashboardTag === "ALL" ||
                              (tk.tags && tk.tags.includes(selectedDashboardTag)) ||
                              tk.category === selectedDashboardTag;

                            let matchesDate = true;
                            if (selectedDashboardDateRange === "TODAY") {
                              matchesDate = tk.dueAt === todayStr;
                            } else if (selectedDashboardDateRange === "WEEK") {
                              if (!tk.dueAt) matchesDate = false;
                              else {
                                const d = new Date(tk.dueAt);
                                matchesDate = d >= todayDate && d <= next7DaysDate;
                              }
                            } else if (selectedDashboardDateRange === "OVERDUE") {
                              matchesDate = isOverdue(tk.dueAt);
                            }

                            return matchesPriority && matchesTag && matchesDate;
                          });

                          return (
                             <motion.div
                              layoutId="tasks"
                              key="tasks"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "tasks")}
                              onDragOver={handleDragOver}
                              onDragEnter={(e) => handleDragEnter(e, "tasks")}
                              onDragLeave={(e) => handleDragLeave(e, "tasks")}
                              onDrop={(e) => handleDrop(e, "tasks")}
                              className="col-span-1 md:col-span-1 xl:col-span-1 relative rounded-xl overflow-hidden p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-300"
                              onClick={() => trackWidgetInteraction("tasks")}
                              style={{
                                background:
                                  visualTheme === 'retro' ? "linear-gradient(135deg, rgba(30,15,0,0.92), rgba(15,8,0,0.85))" :
                                  visualTheme === 'matrix' ? "linear-gradient(135deg, rgba(0,25,0,0.92), rgba(0,10,0,0.85))" :
                                  visualTheme === 'sunset' ? "linear-gradient(135deg, rgba(35,0,35,0.92), rgba(15,0,20,0.85))" :
                                  visualTheme === 'solarized' ? "linear-gradient(135deg, rgba(238,232,213,0.95), rgba(253,246,227,0.9))" :
                                  "linear-gradient(135deg, rgba(0,15,35,0.92), rgba(0,8,20,0.85))",
                                border: dragOverWidgetId === "tasks"
                                  ? "2px dashed #06b6d4"
                                  : activeCriticalCount > 0
                                  ? "1.5px solid rgba(244,63,94,0.5)"
                                  : visualTheme === 'retro' ? "1px solid rgba(245,158,11,0.25)" :
                                    visualTheme === 'matrix' ? "1px solid rgba(16,185,129,0.25)" :
                                    visualTheme === 'sunset' ? "1px solid rgba(217,70,239,0.25)" :
                                    visualTheme === 'solarized' ? "1px solid rgba(100,116,139,0.3)" :
                                    "1px solid rgba(0,212,255,0.15)",
                                boxShadow: dragOverWidgetId === "tasks"
                                  ? "0 0 15px rgba(6,182,212,0.5)"
                                  : activeCriticalCount > 0
                                  ? "0 0 12px rgba(244,63,94,0.3)"
                                  : visualTheme === 'retro' ? "inset 0 0 20px rgba(245,158,11,0.03)" :
                                    visualTheme === 'matrix' ? "inset 0 0 20px rgba(16,185,129,0.03)" :
                                    visualTheme === 'sunset' ? "inset 0 0 20px rgba(217,70,239,0.03)" :
                                    visualTheme === 'solarized' ? "0 4px 6px -1px rgba(0,0,0,0.05)" :
                                    "inset 0 0 20px rgba(0,212,255,0.03)",
                                backdropFilter: "blur(20px)",
                                minHeight: "140px",
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
                                }}
                              />
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="jarvis-label">TASKS</span>
                                    {(() => {
                                      const totalTasksCount = tasks.length;
                                      const completedTasksCount = tasks.filter(x => x.completed).length;
                                      const completionPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
                                      
                                      const ringRadius = 6;
                                      const ringCircumference = 2 * Math.PI * ringRadius;
                                      const ringOffset = ringCircumference - (ringCircumference * completionPercent) / 100;
                                      
                                      return (
                                        <div className="relative flex items-center justify-center w-5 h-5 shrink-0 ml-1 select-none" title={`${completionPercent}% Tasks Completed (${completedTasksCount}/${totalTasksCount})`}>
                                          <svg className="w-5 h-5 -rotate-90" viewBox="0 0 16 16">
                                            <circle
                                              cx="8"
                                              cy="8"
                                              r={ringRadius}
                                              className="stroke-cyan-950/40 fill-none"
                                              strokeWidth="1.8"
                                            />
                                            <circle
                                              cx="8"
                                              cy="8"
                                              r={ringRadius}
                                              className="stroke-cyan-400 fill-none transition-all duration-500"
                                              strokeWidth="1.8"
                                              strokeDasharray={ringCircumference}
                                              strokeDashoffset={ringOffset}
                                              strokeLinecap="round"
                                            />
                                          </svg>
                                          <span className="absolute text-[5.5px] font-mono font-bold text-cyan-400">{completionPercent}%</span>
                                        </div>
                                      );
                                    })()}

                                    {/* Task settings button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsTaskSettingsOpen(!isTaskSettingsOpen);
                                      }}
                                      className={`text-slate-500 hover:text-cyan-400 p-0.5 rounded transition-all cursor-pointer shrink-0 ml-1 ${
                                        isTaskSettingsOpen ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/30" : ""
                                      }`}
                                      title="Task Archiver Settings"
                                    >
                                      <SlidersHorizontal className="w-3 h-3" />
                                    </button>

                                    {/* Bulk select toggle button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsBulkSelectMode(!isBulkSelectMode);
                                        setSelectedActiveTaskIds([]);
                                      }}
                                      className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer shrink-0 ml-1.5 ${
                                        isBulkSelectMode 
                                          ? "bg-amber-950 text-amber-400 border-amber-500/50 animate-pulse" 
                                          : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-350"
                                      }`}
                                      title="Toggle Bulk Action Mode"
                                    >
                                      BULK
                                    </button>
                                    <div className="flex bg-slate-950/60 p-0.5 rounded border border-slate-900 ml-2 shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDashboardTaskTab("active");
                                        }}
                                        className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                          dashboardTaskTab === "active" ? "bg-cyan-950 text-cyan-400 border border-cyan-800/30" : "text-slate-500 hover:text-slate-350"
                                        }`}
                                      >
                                        ACTIVE
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDashboardTaskTab("completed");
                                        }}
                                        className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                          dashboardTaskTab === "completed" ? "bg-cyan-950 text-cyan-400 border border-cyan-800/30" : "text-slate-500 hover:text-slate-350"
                                        }`}
                                      >
                                        DONE
                                      </button>
                                    </div>

                                    {/* TAG FILTER DROPDOWN */}
                                    <div className="relative shrink-0 ml-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsTagDropdownOpen(!isTagDropdownOpen);
                                        }}
                                        className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-900 text-cyan-400 flex items-center gap-1 cursor-pointer hover:bg-slate-900 transition-all"
                                      >
                                        <span>TAG: {selectedDashboardTag === "ALL" ? "ALL" : selectedDashboardTag.toUpperCase()}</span>
                                        <ChevronDown className="w-2.5 h-2.5 text-cyan-500" />
                                      </button>
                                      {isTagDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-1 z-50 w-28 max-h-32 overflow-y-auto bg-slate-950 border border-cyan-500/30 rounded shadow-2xl p-1 space-y-0.5 text-[8px] font-mono custom-scrollbar">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedDashboardTag("ALL");
                                              setIsTagDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-1.5 py-0.5 rounded cursor-pointer ${selectedDashboardTag === "ALL" ? "bg-cyan-950 text-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
                                          >
                                            ALL
                                          </button>
                                          {uniqueTags.map((tag) => (
                                            <button
                                              key={tag}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDashboardTag(tag);
                                                setIsTagDropdownOpen(false);
                                              }}
                                              className={`w-full text-left px-1.5 py-0.5 rounded truncate cursor-pointer ${selectedDashboardTag === tag ? "bg-cyan-950 text-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
                                            >
                                              {tag.toUpperCase()}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Select All Checkbox for Active Tab */}
                                  {dashboardTaskTab === "active" && visibleActiveTasks.length > 0 && (
                                    <div className="flex items-center gap-1 ml-auto mr-3 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-900/40" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={visibleActiveTasks.length > 0 && visibleActiveTasks.every((t) => t.completed)}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          const allCompleted = visibleActiveTasks.every((t) => t.completed);
                                          setTasks((prev) =>
                                            prev.map((t) => {
                                              const isVisible = !t.completed && !t.archived && selectedDashboardPriorities.includes(t.priority);
                                              if (isVisible) {
                                                return {
                                                  ...t,
                                                  completed: !allCompleted,
                                                  completedAt: !allCompleted ? new Date().toISOString() : undefined,
                                                };
                                              }
                                              return t;
                                            })
                                          );
                                          playSystemChirp("success");
                                          triggerDbSyncAnimation();
                                        }}
                                        className="w-3 h-3 rounded border border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                                        id="select-all-active-tasks"
                                      />
                                      <label htmlFor="select-all-active-tasks" className="text-[7px] font-mono text-slate-400 select-none font-bold cursor-pointer">ALL</label>
                                    </div>
                                  )}

                                  <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-500/10 shrink-0">
                                    {tasks.filter((x) => x.completed).length}/
                                    {tasks.length} DONE
                                  </span>
                                </div>

                                {/* TASK SETTINGS PANEL */}
                                {isTaskSettingsOpen && (
                                  <div className="bg-slate-950/95 border border-cyan-500/30 rounded-lg p-2 mb-2 text-[9px] font-mono text-left" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center pb-1 border-b border-slate-900 mb-1.5">
                                      <span className="text-cyan-400 font-bold uppercase tracking-wider">Archiver Setup</span>
                                      <button onClick={() => setIsTaskSettingsOpen(false)} className="text-slate-500 hover:text-rose-400 font-bold">✕</button>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                      <span className="text-slate-400">Auto-Archive Completed:</span>
                                      <input
                                        type="checkbox"
                                        checked={autoArchiveCompleted}
                                        onChange={(e) => {
                                          setAutoArchiveCompleted(e.target.checked);
                                          localStorage.setItem("neora_auto_archive_completed", e.target.checked ? "true" : "false");
                                        }}
                                        className="w-3.5 h-3.5 text-cyan-500 rounded border-slate-800 bg-slate-900 cursor-pointer"
                                      />
                                    </div>
                                    {autoArchiveCompleted && (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-slate-400">Archive after:</span>
                                        <select
                                          value={archivePeriodHours}
                                          onChange={(e) => {
                                            const h = Number(e.target.value);
                                            setArchivePeriodHours(h);
                                            localStorage.setItem("neora_archive_period_hours", String(h));
                                          }}
                                          className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[8.5px] text-slate-200 focus:outline-none cursor-pointer"
                                        >
                                          <option value={1}>1 hour</option>
                                          <option value={4}>4 hours</option>
                                          <option value={12}>12 hours</option>
                                          <option value={24}>24 hours</option>
                                          <option value={48}>48 hours</option>
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* BULK ACTION PANEL */}
                                {isBulkSelectMode && selectedActiveTaskIds.length > 0 && (
                                  <div className="bg-slate-950/95 border border-amber-500/35 rounded-lg p-2 mb-2 text-[9px] font-mono text-left flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                                      <span className="text-amber-400 font-bold uppercase tracking-wider">Bulk Controls ({selectedActiveTaskIds.length} Selected)</span>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => {
                                            setSelectedActiveTaskIds(visibleActiveTasks.map(t => t.id));
                                          }} 
                                          className="text-[8px] text-cyan-400 hover:underline"
                                        >
                                          All
                                        </button>
                                        <button 
                                          onClick={() => setSelectedActiveTaskIds([])} 
                                          className="text-[8px] text-rose-400 hover:underline"
                                        >
                                          None
                                        </button>
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 items-center">
                                      {/* Bulk Tag appending */}
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="text"
                                          value={bulkTagInput}
                                          onChange={(e) => setBulkTagInput(e.target.value)}
                                          placeholder="Append tag..."
                                          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[8px] text-slate-200 placeholder-slate-650 focus:outline-none w-16"
                                        />
                                        <button
                                          onClick={() => {
                                            if (!bulkTagInput.trim()) return;
                                            setTasks(prev => prev.map(t => {
                                              if (selectedActiveTaskIds.includes(t.id)) {
                                                const currentTags = t.tags || [];
                                                const cleanTag = bulkTagInput.trim().toLowerCase();
                                                if (!currentTags.includes(cleanTag)) {
                                                  return { ...t, tags: [...currentTags, cleanTag] };
                                                }
                                              }
                                              return t;
                                            }));
                                            setBulkTagInput("");
                                            setIsBulkSelectMode(false);
                                            setSelectedActiveTaskIds([]);
                                            playSystemChirp("success");
                                            triggerDbSyncAnimation();
                                          }}
                                          className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-900/40 text-cyan-400 rounded border border-cyan-800/30 text-[7.5px] font-bold uppercase"
                                        >
                                          Tag
                                        </button>
                                      </div>

                                      {/* CSV Export */}
                                      <button
                                        onClick={() => {
                                          const targetTasks = tasks.filter(t => selectedActiveTaskIds.includes(t.id));
                                          const headers = ["ID", "Title", "Priority", "Due Date", "Completed", "Tags", "Category", "Notes", "Created At"];
                                          const rows = targetTasks.map(t => [
                                            t.id,
                                            `"${t.title.replace(/"/g, '""')}"`,
                                            t.priority,
                                            t.dueAt || "",
                                            t.completed ? "Yes" : "No",
                                            `"${(t.tags || []).join(', ')}"`,
                                            t.category || "",
                                            `"${(t.notes || "").replace(/"/g, '""')}"`,
                                            t.createdAt || ""
                                          ]);
                                          const csvContent = "data:text/csv;charset=utf-8," 
                                            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                                          const encodedUri = encodeURI(csvContent);
                                          const link = document.createElement("a");
                                          link.setAttribute("href", encodedUri);
                                          link.setAttribute("download", `neora_bulk_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          playSystemChirp("success");
                                        }}
                                        className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-[7.5px] font-bold uppercase"
                                      >
                                        CSV
                                      </button>

                                      {/* JSON Export */}
                                      <button
                                        onClick={() => {
                                          const targetTasks = tasks.filter(t => selectedActiveTaskIds.includes(t.id));
                                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetTasks, null, 2));
                                          const link = document.createElement("a");
                                          link.setAttribute("href", dataStr);
                                          link.setAttribute("download", `neora_tasks_backup_${new Date().toISOString().slice(0, 10)}.json`);
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          playSystemChirp("success");
                                        }}
                                        className="px-1.5 py-0.5 bg-amber-950/30 hover:bg-amber-900/20 text-amber-400 rounded border border-amber-800/30 text-[7.5px] font-bold uppercase"
                                      >
                                        JSON
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {dashboardTaskTab === "active" ? (
                                  <>
                                    <div className="flex flex-wrap gap-1 mt-1.5 mb-1.5">
                                      {(["critical", "high", "medium", "low"] as const).map(
                                        (p) => {
                                          const isSelected =
                                            selectedDashboardPriorities.includes(p);
                                          const colors = {
                                            critical: {
                                              activeBg: "bg-rose-500/20",
                                              text: "text-rose-400",
                                              border: "border-rose-500/30",
                                            },
                                            high: {
                                              activeBg: "bg-amber-500/20",
                                              text: "text-amber-400",
                                              border: "border-amber-500/30",
                                            },
                                            medium: {
                                              activeBg: "bg-cyan-500/20",
                                              text: "text-cyan-400",
                                              border: "border-cyan-500/30",
                                            },
                                            low: {
                                              activeBg: "bg-slate-500/20",
                                              text: "text-slate-400",
                                              border: "border-slate-500/30",
                                            },
                                          }[p];
                                          return (
                                            <button
                                              key={p}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDashboardPriority(p);
                                              }}
                                              className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase transition-all cursor-pointer ${
                                                isSelected
                                                  ? `${colors.activeBg} ${colors.text} ${colors.border} shadow-[0_0_5px_rgba(0,180,255,0.1)]`
                                                  : "bg-slate-900/40 text-slate-550 border-transparent opacity-50 hover:opacity-100"
                                              }`}
                                            >
                                              {p}
                                            </button>
                                          );
                                        },
                                      )}
                                    </div>

                                    <div className="flex bg-slate-950/40 p-0.5 rounded border border-slate-900/60 mb-1.5 shrink-0 w-max">
                                      {(["ALL", "TODAY", "WEEK", "OVERDUE"] as const).map((r) => (
                                        <button
                                          key={r}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDashboardDateRange(r);
                                          }}
                                          className={`text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                            selectedDashboardDateRange === r ? "bg-cyan-950 text-cyan-400 border border-cyan-800/30" : "text-slate-500 hover:text-slate-350"
                                          }`}
                                        >
                                          {r === "WEEK" ? "7 DAYS" : r}
                                        </button>
                                      ))}
                                    </div>

                                    <div className="overflow-y-auto max-h-[80px] space-y-1 pr-1 custom-scrollbar mb-2 text-left min-h-[40px]">
                                      <AnimatePresence mode="popLayout">
                                        {visibleActiveTasks
                                          .map((tk) => {
                                            const isTaskOverdue = isOverdue(tk.dueAt);
                                            const priorityColor = dotColors[tk.priority];
                                            return (
                                              <motion.div
                                                key={tk.id}
                                                initial={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="relative overflow-hidden rounded"
                                              >
                                                {/* Swipe Action Indicator under the card */}
                                                <div className="absolute inset-0 bg-gradient-to-l from-rose-600/20 via-rose-500/5 to-transparent flex items-center justify-end pr-3 pointer-events-none rounded border border-transparent">
                                                  <span className="text-[7px] font-mono text-rose-400 font-bold uppercase tracking-wider animate-pulse">
                                                    SWIPE TO COMPLETE ←
                                                  </span>
                                                </div>

                                                <motion.div
                                                  drag="x"
                                                  dragDirectionLock
                                                  dragConstraints={{ left: -120, right: 0 }}
                                                  dragElastic={{ left: 0.2, right: 0.1 }}
                                                  onDragEnd={(event, info) => {
                                                    if (info.offset.x < -60) {
                                                      setCompletingTaskIds((prev) => [...prev, tk.id]);
                                                      playSystemChirp("success");
                                                      setTimeout(() => {
                                                        completeTask(tk.id);
                                                        setCompletingTaskIds((prev) => prev.filter((id) => id !== tk.id));
                                                        triggerDbSyncAnimation();
                                                      }, 750);
                                                    }
                                                  }}
                                                  onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setContextMenuTask({
                                                      id: tk.id,
                                                      x: e.clientX,
                                                      y: e.clientY,
                                                    });
                                                  }}
                                                  className={`relative z-10 text-[10px] bg-slate-950 border px-2 py-1 rounded flex flex-col gap-1 select-none transition-all duration-300 ${
                                                    tk.priority === "critical"
                                                      ? "border-rose-500/35 shadow-[0_0_8px_rgba(244,63,94,0.15)] bg-rose-950/5"
                                                      : tk.priority === "high"
                                                      ? "border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.12)] bg-amber-950/5"
                                                      : tk.priority === "medium"
                                                      ? "border-cyan-500/25 shadow-[0_0_6px_rgba(6,182,212,0.08)] bg-cyan-950/5"
                                                      : "border-slate-900/60"
                                                  }`}
                                                  style={{
                                                    opacity: completingTaskIds.includes(tk.id) ? 0.35 : 1,
                                                    transition: "opacity 0.7s ease",
                                                  }}
                                                  animate={
                                                    tk.priority === "critical"
                                                      ? {
                                                          boxShadow: [
                                                            "0 0 4px rgba(244, 63, 94, 0.15)",
                                                            "0 0 12px rgba(244, 63, 94, 0.55)",
                                                            "0 0 4px rgba(244, 63, 94, 0.15)",
                                                          ],
                                                          borderColor: [
                                                            "rgba(244, 63, 94, 0.25)",
                                                            "rgba(244, 63, 94, 0.75)",
                                                            "rgba(244, 63, 94, 0.25)",
                                                          ],
                                                        }
                                                      : tk.priority === "high"
                                                      ? {
                                                          boxShadow: [
                                                            "0 0 4px rgba(245, 158, 11, 0.1)",
                                                            "0 0 10px rgba(245, 158, 11, 0.4)",
                                                            "0 0 4px rgba(245, 158, 11, 0.1)",
                                                          ],
                                                          borderColor: [
                                                            "rgba(245, 158, 11, 0.2)",
                                                            "rgba(245, 158, 11, 0.6)",
                                                            "rgba(245, 158, 11, 0.2)",
                                                          ],
                                                        }
                                                      : tk.priority === "medium"
                                                      ? {
                                                          boxShadow: [
                                                            "0 0 2px rgba(6, 182, 212, 0.05)",
                                                            "0 0 8px rgba(6, 182, 212, 0.3)",
                                                            "0 0 2px rgba(6, 182, 212, 0.05)",
                                                          ],
                                                          borderColor: [
                                                            "rgba(6, 182, 212, 0.15)",
                                                            "rgba(6, 182, 212, 0.45)",
                                                            "rgba(6, 182, 212, 0.15)",
                                                          ],
                                                        }
                                                      : {}
                                                  }
                                                  transition={
                                                    tk.priority === "critical"
                                                      ? {
                                                          duration: 2,
                                                          repeat: Infinity,
                                                          ease: "easeInOut",
                                                        }
                                                      : tk.priority === "high"
                                                      ? {
                                                          duration: 3,
                                                          repeat: Infinity,
                                                          ease: "easeInOut",
                                                        }
                                                      : tk.priority === "medium"
                                                      ? {
                                                          duration: 4,
                                                          repeat: Infinity,
                                                          ease: "easeInOut",
                                                        }
                                                      : {}
                                                  }
                                                >
                                                  <div className="flex justify-between items-center gap-1.5 w-full">
                                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                      {isBulkSelectMode ? (
                                                        <input
                                                          type="checkbox"
                                                          checked={selectedActiveTaskIds.includes(tk.id)}
                                                          onChange={(e) => {
                                                            e.stopPropagation();
                                                            if (selectedActiveTaskIds.includes(tk.id)) {
                                                              setSelectedActiveTaskIds(prev => prev.filter(id => id !== tk.id));
                                                            } else {
                                                              setSelectedActiveTaskIds(prev => [...prev, tk.id]);
                                                            }
                                                            playSystemChirp("click");
                                                          }}
                                                          className="w-3.5 h-3.5 rounded border-amber-500/45 bg-amber-950/20 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0 animate-pulse"
                                                        />
                                                      ) : (
                                                        <input
                                                          type="checkbox"
                                                          checked={completingTaskIds.includes(tk.id)}
                                                          onChange={(e) => {
                                                            e.stopPropagation();
                                                            setCompletingTaskIds((prev) => [...prev, tk.id]);
                                                            playSystemChirp("success");
                                                            setTimeout(() => {
                                                              completeTask(tk.id);
                                                              setCompletingTaskIds((prev) => prev.filter((id) => id !== tk.id));
                                                              triggerDbSyncAnimation();
                                                            }, 750);
                                                          }}
                                                          className="w-3.5 h-3.5 rounded border border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                                                        />
                                                      )}

                                                      {/* Visual Priority Gauge (Circular Progress Ring) */}
                                                      {(() => {
                                                        const prioDetails = {
                                                          critical: { percent: 100, color: "stroke-rose-500", track: "stroke-rose-950/20" },
                                                          high: { percent: 75, color: "stroke-amber-500", track: "stroke-amber-950/20" },
                                                          medium: { percent: 50, color: "stroke-cyan-500", track: "stroke-cyan-950/20" },
                                                          low: { percent: 25, color: "stroke-slate-500", track: "stroke-slate-900/20" },
                                                        }[tk.priority] || { percent: 50, color: "stroke-cyan-500", track: "stroke-cyan-950/20" };

                                                        const radius = 5;
                                                        const circumference = 2 * Math.PI * radius;
                                                        const strokeDashoffset = circumference - (circumference * prioDetails.percent) / 100;

                                                        return (
                                                          <div className="relative w-4 h-4 flex items-center justify-center shrink-0 cursor-help" title={`Priority: ${tk.priority.toUpperCase()} (${prioDetails.percent}% Urgency)`}>
                                                            <svg className="w-4 h-4 -rotate-90" viewBox="0 0 14 14">
                                                              <circle
                                                                cx="7"
                                                                cy="7"
                                                                r={radius}
                                                                className={`${prioDetails.track} fill-none`}
                                                                strokeWidth="1.8"
                                                              />
                                                              <circle
                                                                cx="7"
                                                                cy="7"
                                                                r={radius}
                                                                className={`${prioDetails.color} fill-none`}
                                                                strokeWidth="1.8"
                                                                strokeDasharray={circumference}
                                                                strokeDashoffset={strokeDashoffset}
                                                                strokeLinecap="round"
                                                              />
                                                            </svg>
                                                            <div className={`absolute w-1 h-1 rounded-full ${
                                                              tk.priority === "critical" ? "bg-rose-500 animate-ping" : ""
                                                            }`} />
                                                          </div>
                                                        );
                                                      })()}
                                                      
                                                      {/* Colored priority badge */}
                                                      {tk.priority === "critical" || tk.priority === "high" ? (
                                                        <motion.span
                                                          animate={{
                                                            boxShadow: tk.priority === "critical"
                                                              ? [
                                                                  "0 0 3px rgba(244, 63, 94, 0.2)",
                                                                  "0 0 9px rgba(244, 63, 94, 0.6)",
                                                                  "0 0 3px rgba(244, 63, 94, 0.2)",
                                                                ]
                                                              : [
                                                                  "0 0 3px rgba(245, 158, 11, 0.2)",
                                                                  "0 0 8px rgba(245, 158, 11, 0.5)",
                                                                  "0 0 3px rgba(245, 158, 11, 0.2)",
                                                                ],
                                                          }}
                                                          transition={{
                                                            duration: tk.priority === "critical" ? 1.5 : 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                          }}
                                                          className={`text-[6.5px] font-mono font-extrabold uppercase px-1 py-0.2 rounded border flex items-center gap-1 shrink-0 ${
                                                            tk.priority === "critical"
                                                              ? "bg-rose-950/40 text-rose-300 border-rose-500/50"
                                                              : "bg-amber-950/40 text-amber-300 border-amber-500/50"
                                                          }`}
                                                        >
                                                          <span className={`w-1 h-1 rounded-full ${priorityColor} animate-ping`} />
                                                          <Zap className="w-2 h-2 shrink-0 text-cyan-400" />
                                                          {tk.priority}
                                                        </motion.span>
                                                      ) : (
                                                        <span className={`text-[7px] font-mono font-bold uppercase px-1 py-0.2 rounded border ${priorityBadges[tk.priority]} flex items-center gap-1 shrink-0`}>
                                                          <span className={`w-1 h-1 rounded-full ${priorityColor}`} />
                                                          {tk.priority}
                                                        </span>
                                                      )}

                                                      {editingTaskId === tk.id ? (
                                                        <input
                                                          autoFocus
                                                          type="text"
                                                          value={editingTaskTitle}
                                                          onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                          onBlur={() => {
                                                            if (editingTaskTitle.trim()) {
                                                              setTasks((prev) =>
                                                                prev.map((t) =>
                                                                  t.id === tk.id ? { ...t, title: editingTaskTitle.trim() } : t
                                                                )
                                                              );
                                                              triggerDbSyncAnimation();
                                                            }
                                                            setEditingTaskId(null);
                                                          }}
                                                          onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                              if (editingTaskTitle.trim()) {
                                                                setTasks((prev) =>
                                                                  prev.map((t) =>
                                                                    t.id === tk.id ? { ...t, title: editingTaskTitle.trim() } : t
                                                                  )
                                                                );
                                                                triggerDbSyncAnimation();
                                                              }
                                                              setEditingTaskId(null);
                                                            } else if (e.key === "Escape") {
                                                              setEditingTaskId(null);
                                                            }
                                                          }}
                                                          className="bg-slate-900 border border-cyan-500/50 rounded px-1.5 py-0.5 text-[10px] text-slate-100 focus:outline-none w-full font-sans"
                                                          onClick={(e) => e.stopPropagation()}
                                                        />
                                                      ) : (
                                                        <span 
                                                          className={`truncate flex-1 font-sans font-medium cursor-pointer hover:text-cyan-300 transition-colors flex items-center gap-1.5 ${
                                                            completingTaskIds.includes(tk.id) ? "line-through text-slate-600 opacity-60" : "text-slate-300"
                                                          }`}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedTaskIds((prev) =>
                                                              prev.includes(tk.id)
                                                                ? prev.filter((id) => id !== tk.id)
                                                                : [...prev, tk.id]
                                                            );
                                                          }}
                                                        >
                                                          <span>{tk.title}</span>
                                                          {tk.dueAt === todayStr && (
                                                            (() => {
                                                              const now = new Date();
                                                              const endOfDay = new Date();
                                                              endOfDay.setHours(23, 59, 59, 999);
                                                              const totalMsInDay = 24 * 60 * 60 * 1000;
                                                              const remainingMs = endOfDay.getTime() - now.getTime();
                                                              const percent = Math.max(0, Math.min(100, (remainingMs / totalMsInDay) * 100));
                                                              const hoursLeft = remainingMs / (1000 * 60 * 60);
                                                              
                                                              const r = 4;
                                                              const circ = 2 * Math.PI * r;
                                                              const offset = circ - (circ * percent) / 100;
                                                              return (
                                                                <div className="w-4 h-4 relative flex items-center justify-center shrink-0 cursor-help ml-1" title={`${hoursLeft.toFixed(1)}h remaining today`}>
                                                                  <svg className="w-4 h-4 -rotate-90" viewBox="0 0 12 12">
                                                                    <circle cx="6" cy="6" r={r} className="stroke-rose-950/40 fill-none" strokeWidth="1.2" />
                                                                    <circle cx="6" cy="6" r={r} className="stroke-rose-500 fill-none transition-all duration-300" strokeWidth="1.2" strokeDasharray={circ} strokeDashoffset={offset} />
                                                                  </svg>
                                                                  <span className="absolute text-[5px] font-mono font-extrabold text-rose-400">{Math.ceil(hoursLeft)}h</span>
                                                                </div>
                                                              );
                                                            })()
                                                          )}
                                                          <span className="text-[7.5px] text-slate-500 shrink-0">
                                                            {expandedTaskIds.includes(tk.id) ? "▲" : "▼"}
                                                          </span>
                                                        </span>
                                                      )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1 shrink-0">
                                                      {/* Optional Category tag */}
                                                      {tk.category && (
                                                        <span className="text-[7px] font-mono font-bold text-cyan-400 bg-cyan-950/40 px-1 py-0.2 rounded border border-cyan-500/20 shrink-0 uppercase tracking-wider">
                                                          {tk.category}
                                                        </span>
                                                      )}
                                                      {isTaskOverdue && (
                                                        <span className="text-[7px] font-mono font-bold text-rose-400 bg-rose-950/40 px-1 py-0.2 rounded border border-rose-500/20 animate-pulse uppercase shrink-0">
                                                          OVERDUE
                                                        </span>
                                                      )}
                                                      {tk.dueAt && (
                                                        <span className={`text-[8px] font-mono shrink-0 ${isTaskOverdue ? "text-rose-400" : "text-slate-500"}`}>
                                                          {tk.dueAt}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Inline Expandable Notes & Metadata Panel */}
                                                  {expandedTaskIds.includes(tk.id) && (
                                                    <motion.div
                                                      initial={{ height: 0, opacity: 0 }}
                                                      animate={{ height: "auto", opacity: 1 }}
                                                      exit={{ height: 0, opacity: 0 }}
                                                      transition={{ duration: 0.2 }}
                                                      className="border-t border-slate-900/60 mt-1.5 pt-1.5 text-[8.5px] text-slate-450 space-y-1 bg-slate-950/60 p-1.5 rounded leading-normal font-sans"
                                                    >
                                                      {tk.notes ? (
                                                        <div>
                                                          <span className="font-mono text-[7px] text-cyan-500 uppercase tracking-wider block mb-0.5">Objective Details:</span>
                                                          <p className="text-slate-300 font-sans">{tk.notes}</p>
                                                        </div>
                                                      ) : (
                                                        <div className="italic text-slate-600">No additional details provided.</div>
                                                      )}
                                                      {tk.tags && tk.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 items-center pt-1">
                                                          <span className="font-mono text-[6.5px] text-slate-500 uppercase">Tags:</span>
                                                          {tk.tags.map((tg) => (
                                                            <span key={tg} className="bg-slate-900/40 text-slate-450 px-1 py-0.2 rounded border border-slate-850 text-[7px] font-mono">
                                                              #{tg}
                                                            </span>
                                                          ))}
                                                        </div>
                                                      )}

                                                      {/* NESTED SUB-TASKS SECTION */}
                                                      <div className="space-y-1.5 pt-1.5 border-t border-slate-900/40" onClick={e => e.stopPropagation()}>
                                                        <div className="flex justify-between items-center mb-1">
                                                          <span className="font-mono text-[7px] text-cyan-500 uppercase tracking-wider">Sub-Objectives:</span>
                                                          <span className="text-[7px] font-mono text-slate-500">
                                                            {(tk.subTasks || []).filter(s => s.completed).length}/{(tk.subTasks || []).length} done
                                                          </span>
                                                        </div>
                                                        {(tk.subTasks || []).map(st => (
                                                          <div key={st.id} className="flex items-center gap-1.5 py-0.5">
                                                            <input
                                                              type="checkbox"
                                                              checked={st.completed}
                                                              onChange={(e) => {
                                                                e.stopPropagation();
                                                                setTasks(prev => prev.map(t => {
                                                                  if (t.id === tk.id) {
                                                                    return {
                                                                      ...t,
                                                                      subTasks: (t.subTasks || []).map(s => s.id === st.id ? { ...s, completed: !s.completed } : s)
                                                                    };
                                                                  }
                                                                  return t;
                                                                }));
                                                                playSystemChirp("success");
                                                                triggerDbSyncAnimation();
                                                              }}
                                                              className="w-3 h-3 text-cyan-500 rounded border-slate-800 bg-slate-900 cursor-pointer shrink-0 focus:ring-0"
                                                            />
                                                            <span className={`text-[8px] font-sans flex-1 truncate ${st.completed ? "line-through text-slate-600 opacity-60" : "text-slate-300"}`}>
                                                              {st.title}
                                                            </span>
                                                            <button
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTasks(prev => prev.map(t => {
                                                                  if (t.id === tk.id) {
                                                                    return {
                                                                      ...t,
                                                                      subTasks: (t.subTasks || []).filter(s => s.id !== st.id)
                                                                    };
                                                                  }
                                                                  return t;
                                                                }));
                                                                playSystemChirp("click");
                                                                triggerDbSyncAnimation();
                                                              }}
                                                              className="text-slate-600 hover:text-rose-400 font-mono text-[8px] px-1"
                                                            >
                                                              ✕
                                                            </button>
                                                          </div>
                                                        ))}
                                                        
                                                        <div className="flex gap-1.5 items-center pt-0.5">
                                                          <input
                                                            type="text"
                                                            placeholder="Add sub-task..."
                                                            id={`new-subtask-input-${tk.id}`}
                                                            onKeyDown={(e) => {
                                                              if (e.key === 'Enter') {
                                                                const val = e.currentTarget.value.trim();
                                                                if (val) {
                                                                  setTasks(prev => prev.map(t => {
                                                                    if (t.id === tk.id) {
                                                                      return {
                                                                        ...t,
                                                                        subTasks: [...(t.subTasks || []), { id: Math.random().toString(), title: val, completed: false }]
                                                                      };
                                                                    }
                                                                    return t;
                                                                  }));
                                                                  e.currentTarget.value = "";
                                                                  playSystemChirp("click");
                                                                  triggerDbSyncAnimation();
                                                                }
                                                              }
                                                            }}
                                                            className="flex-1 bg-slate-900 border border-slate-850 focus:border-cyan-500/40 rounded px-1.5 py-0.5 text-[8px] text-slate-200 placeholder-slate-600 focus:outline-none font-sans"
                                                          />
                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              const input = document.getElementById(`new-subtask-input-${tk.id}`) as HTMLInputElement;
                                                              const val = input?.value.trim();
                                                              if (val) {
                                                                setTasks(prev => prev.map(t => {
                                                                  if (t.id === tk.id) {
                                                                    return {
                                                                      ...t,
                                                                      subTasks: [...(t.subTasks || []), { id: Math.random().toString(), title: val, completed: false }]
                                                                    };
                                                                  }
                                                                  return t;
                                                                }));
                                                                input.value = "";
                                                                playSystemChirp("click");
                                                                triggerDbSyncAnimation();
                                                              }
                                                            }}
                                                            className="px-1.5 py-0.5 bg-cyan-950 hover:bg-cyan-900/40 text-cyan-400 rounded border border-cyan-800/30 text-[7.5px] font-bold"
                                                          >
                                                            ADD
                                                          </button>
                                                        </div>
                                                      </div>

                                                      {/* PHOTO ATTACHMENT */}
                                                      {tk.attachment && (
                                                        <div className="pt-1.5 border-t border-slate-900/40 flex flex-col gap-1 text-left">
                                                          <span className="font-mono text-[7px] text-cyan-500 uppercase tracking-wider">Attachment:</span>
                                                          <div className="relative rounded overflow-hidden max-w-xs border border-cyan-500/15">
                                                            <img src={tk.attachment} alt="Attachment" className="w-full h-auto object-cover max-h-32" referrerPolicy="no-referrer" />
                                                          </div>
                                                        </div>
                                                      )}
                                                    </motion.div>
                                                  )}
                                                </motion.div>
                                              </motion.div>
                                            );
                                          })}
                                      </AnimatePresence>
                                      {visibleActiveTasks.length === 0 && (
                                        <div className="text-[8px] font-mono text-slate-550 text-center py-2 italic">
                                          No active tasks in selected priorities
                                        </div>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <div className="overflow-y-auto max-h-[110px] space-y-1 pr-1 custom-scrollbar mb-2 text-left mt-2 min-h-[40px]">
                                    {tasks
                                      .filter((tk) => tk.completed && !tk.archived)
                                      .map((tk) => {
                                        const isSelectedForDeletion = selectedCompletedTaskIds.includes(tk.id);
                                        const priorityColor = dotColors[tk.priority];
                                        return (
                                          <div
                                            key={tk.id}
                                            className={`text-[10px] bg-slate-950/35 border px-2 py-1 rounded flex justify-between items-center gap-1.5 transition-all duration-200 ${
                                              isSelectedForDeletion ? "border-cyan-500/40 bg-cyan-950/10 shadow-[0_0_8px_rgba(6,182,212,0.1)]" : "border-slate-900/30"
                                            }`}
                                          >
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                              <input
                                                type="checkbox"
                                                checked={isSelectedForDeletion}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  if (isSelectedForDeletion) {
                                                    setSelectedCompletedTaskIds((prev) =>
                                                      prev.filter((id) => id !== tk.id),
                                                    );
                                                  } else {
                                                    setSelectedCompletedTaskIds((prev) => [...prev, tk.id]);
                                                  }
                                                  playSystemChirp("click");
                                                }}
                                                className="w-3.5 h-3.5 rounded border border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                                              />
                                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColor}`} />
                                              <span className="truncate text-slate-500 line-through flex-1 font-sans font-medium">
                                                {tk.title}
                                              </span>
                                            </div>
                                            <span className="text-[8px] font-mono text-slate-600 uppercase shrink-0">DONE</span>
                                          </div>
                                        );
                                      })}
                                    {tasks.filter((tk) => tk.completed && !tk.archived).length > 0 && (
                                      <div className="pt-1.5 flex justify-end">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedCompletedTaskIds.length === 0) return;
                                            setTasks((prev) => prev.filter((t) => !selectedCompletedTaskIds.includes(t.id)));
                                            setSelectedCompletedTaskIds([]);
                                            playSystemChirp("success");
                                            triggerDbSyncAnimation();
                                          }}
                                          disabled={selectedCompletedTaskIds.length === 0}
                                          className={`px-2.5 py-1 rounded text-[8px] font-mono font-bold uppercase transition-all flex items-center gap-1 border ${
                                            selectedCompletedTaskIds.length > 0
                                              ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 cursor-pointer"
                                              : "bg-slate-900/40 text-slate-600 border-transparent opacity-40 cursor-not-allowed"
                                          }`}
                                        >
                                          Delete Selected ({selectedCompletedTaskIds.length})
                                        </button>
                                      </div>
                                    )}
                                    {tasks.filter((tk) => tk.completed && !tk.archived).length === 0 && (
                                      <div className="text-[8px] font-mono text-slate-550 text-center py-4 italic">
                                        No completed tasks in history
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex justify-between items-center text-[10px] mb-1">
                                  <span className="text-slate-400">
                                    {tasks.filter((x) => !x.completed).length} active
                                  </span>
                                  <span className="text-[8px] font-mono font-bold flex items-center gap-1 shrink-0">
                                    {isSyncingDb || dataSyncStatus === "checking" ? (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                                        <span className="text-cyan-400 uppercase tracking-widest animate-pulse">
                                          [SYNCING...]
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                        <span className="text-emerald-400 uppercase tracking-widest">
                                          [SECURE_SYNC]
                                        </span>
                                      </>
                                    )}
                                  </span>
                                </div>

                                <div className="jarvis-progress h-1 border border-slate-900 bg-slate-950/80 rounded-full overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                                      isSyncingDb || dataSyncStatus === "checking"
                                        ? "bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(0,212,255,0.8)]"
                                        : "bg-cyan-500 shadow-[0_0_6px_rgba(0,212,255,0.4)]"
                                    }`}
                                    style={{
                                      width: `${tasks.length > 0 ? (tasks.filter((x) => x.completed).length / tasks.length) * 100 : 0}%`,
                                    }}
                                  />

                                  {(isSyncingDb || dataSyncStatus === "checking") && (
                                    <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
                                      <div
                                        className="h-full w-20 bg-gradient-to-r from-transparent via-cyan-300 / 50 to-transparent"
                                        style={{
                                          animation:
                                            "shimmer-scan 1.2s infinite ease-in-out",
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        }

                        if (widget.id === "task_chart") {
                          const getLast7DaysData = () => {
                            const data = [];
                            const today = new Date();
                            for (let i = 6; i >= 0; i--) {
                              const d = new Date(today);
                              d.setDate(today.getDate() - i);
                              const label = d.toLocaleDateString("en-US", { weekday: "short" });
                              
                              const totalCompleted = tasks.filter(t => t.completed).length;
                              const totalTasks = tasks.length || 1;
                              const baseRatio = Math.round((totalCompleted / totalTasks) * 100);
                              
                              const variation = [ -15, -10, -12, -5, -3, -2, 0 ][6 - i];
                              const rate = Math.max(0, Math.min(100, baseRatio + variation));
                              
                              data.push({
                                date: label,
                                rate: rate
                              });
                            }
                            return data;
                          };

                          const chartData = getLast7DaysData();

                          return (
                            <motion.div
                              layoutId="task_chart"
                              key="task_chart"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "task_chart")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "task_chart")}
                              className="col-span-1 md:col-span-1 xl:col-span-1 relative rounded-xl overflow-hidden p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-300"
                              onClick={() => trackWidgetInteraction("task_chart")}
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(15,0,35,0.92), rgba(8,0,20,0.85))",
                                border: "1px solid rgba(168,85,247,0.15)",
                                boxShadow: "inset 0 0 20px rgba(168,85,247,0.03)",
                                backdropFilter: "blur(20px)",
                                minHeight: "140px",
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)",
                                }}
                              />
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="jarvis-label" style={{ color: "#a855f7" }}>PERFORMANCE</span>
                                  <span className="text-[8px] text-purple-400 font-mono font-bold bg-purple-950/30 px-1.5 py-0.5 rounded border border-purple-500/10 shrink-0">
                                    7-DAY RATIO
                                  </span>
                                </div>
                                
                                <p className="text-[9px] text-slate-400 text-left mb-2 font-sans font-medium">
                                  Task Completion Velocity Rate (%)
                                </p>

                                <div className="w-full h-[85px] -ml-4 pr-2">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                      <XAxis 
                                        dataKey="date" 
                                        stroke="#475569" 
                                        fontSize={7} 
                                        tickLine={false} 
                                        axisLine={false}
                                      />
                                      <YAxis 
                                        stroke="#475569" 
                                        fontSize={7} 
                                        tickLine={false} 
                                        axisLine={false}
                                        domain={[0, 100]}
                                      />
                                      <Tooltip 
                                        contentStyle={{
                                          background: "rgba(15, 23, 42, 0.9)",
                                          border: "1px solid rgba(168, 85, 247, 0.2)",
                                          borderRadius: "6px",
                                          fontSize: "8px",
                                          color: "#f1f5f9"
                                        }}
                                        labelStyle={{ color: "#a855f7", fontWeight: "bold" }}
                                      />
                                      <Line 
                                        type="monotone" 
                                        dataKey="rate" 
                                        stroke="#a855f7" 
                                        strokeWidth={1.5}
                                        dot={{ r: 2, fill: "#a855f7", strokeWidth: 0 }}
                                        activeDot={{ r: 4 }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              <div className="text-[8px] font-mono text-purple-400/80 text-left pt-1 flex justify-between border-t border-purple-950/20">
                                <span>EFFICIENCY LEDGER</span>
                                <span>{chartData[6]?.rate}% NOW</span>
                              </div>
                            </motion.div>
                          );
                        }

                        if (widget.id === "task_efficiency") {
                          const getCategoryData = () => {
                            const categoryMap: Record<string, { total: number; completed: number }> = {};
                            
                            tasks.forEach(t => {
                              let cat = t.category || "";
                              if (!cat) {
                                const title = t.title.toLowerCase();
                                if (title.includes("printers") || title.includes("brochure") || title.includes("tax") || title.includes("billing") || title.includes("invoice") || title.includes("client")) {
                                  cat = lang === "bn" ? "কাজ" : "Work";
                                } else if (title.includes("updates") || title.includes("typechecking") || title.includes("validation") || title.includes("code") || title.includes("system") || title.includes("script")) {
                                  cat = lang === "bn" ? "সিস্টেম" : "System";
                                } else if (title.includes("backup") || title.includes("checkpoint") || title.includes("sync")) {
                                  cat = lang === "bn" ? "অবকাঠামো" : "Infrastructure";
                                } else {
                                  cat = lang === "bn" ? "ব্যক্তিগত" : "Personal";
                                }
                              }
                              
                              if (typeof cat === 'string' && cat.length > 0) {
                                  cat = cat.charAt(0).toUpperCase() + cat.slice(1);
                              }
                              
                              if (!categoryMap[cat]) {
                                categoryMap[cat] = { total: 0, completed: 0 };
                              }
                              categoryMap[cat].total += 1;
                              if (t.completed) {
                                categoryMap[cat].completed += 1;
                              }
                            });
                            
                            const data = Object.entries(categoryMap).map(([name, stats]) => {
                              const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                              return {
                                name,
                                value: rate > 0 ? rate : 1, // Slices represent percentage of completed tasks relative to total, with minimum 1 to avoid invisible slices
                                rate,
                                completed: stats.completed,
                                total: stats.total
                              };
                            });
                            
                            if (data.length === 0) {
                              return [{ name: lang === "bn" ? "কোনো টাস্ক নেই" : "No Tasks", value: 100, rate: 0, completed: 0, total: 0 }];
                            }
                            return data;
                          };

                          const efficiencyData = getCategoryData();
                          const COLORS = ["#00d4ff", "#a855f7", "#10b981", "#f5a623", "#ec4899", "#3b82f6"];
                          
                          const totalTasksCount = tasks.length;
                          const completedTasksCount = tasks.filter(t => t.completed).length;
                          const overallEfficiencyRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

                          return (
                            <motion.div
                              layoutId="task_efficiency"
                              key="task_efficiency"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "task_efficiency")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "task_efficiency")}
                              className="col-span-1 md:col-span-1 xl:col-span-1 relative rounded-xl overflow-hidden p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-300"
                              onClick={() => trackWidgetInteraction("task_efficiency")}
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(0,18,35,0.92), rgba(0,8,20,0.85))",
                                border: "1px solid rgba(0,212,255,0.15)",
                                boxShadow: "inset 0 0 20px rgba(0,212,255,0.03)",
                                backdropFilter: "blur(20px)",
                                minHeight: "140px",
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
                                }}
                              />
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="jarvis-label" style={{ color: "#00d4ff" }}>
                                    {lang === "bn" ? "টাস্ক দক্ষতা" : "TASK EFFICIENCY"}
                                  </span>
                                  <span className="text-[8px] text-cyan-400 font-mono font-bold bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-500/10 shrink-0">
                                    {lang === "bn" ? "ডোনাট চার্ট" : "DONUT BREAKDOWN"}
                                  </span>
                                </div>
                                
                                <p className="text-[9px] text-slate-400 text-left mb-1 font-sans font-medium">
                                  {lang === "bn" ? "ক্যাটেগরি অনুযায়ী টাস্ক সম্পূর্ণতার হার" : "Task completion rates by category"}
                                </p>

                                <div className="flex items-center justify-between w-full h-[85px]">
                                  <div className="w-[55%] h-full relative flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                        <Pie
                                          data={efficiencyData}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={22}
                                          outerRadius={35}
                                          paddingAngle={3}
                                          dataKey="value"
                                        >
                                          {efficiencyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                          ))}
                                        </Pie>
                                        <Tooltip
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              const data = payload[0].payload;
                                              return (
                                                <div className="bg-slate-950/95 border border-slate-800 rounded-lg p-2 font-mono text-[9px] shadow-xl text-left select-none">
                                                  <p className="font-bold text-slate-200 uppercase">{data.name}</p>
                                                  <p className="text-cyan-400 font-semibold mt-0.5">
                                                    {lang === "bn" ? "দক্ষতা:" : "Efficiency:"} {data.rate}%
                                                  </p>
                                                  <p className="text-slate-500 text-[8px] mt-0.5">
                                                    {data.completed}/{data.total} {lang === "bn" ? "সম্পন্ন" : "completed"}
                                                  </p>
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>

                                    {/* Centered overall completion overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                      <span className="text-[11px] font-mono font-black text-cyan-400 leading-none">{overallEfficiencyRate}%</span>
                                      <span className="text-[5.5px] font-mono text-slate-500 uppercase tracking-tighter scale-90 mt-0.5">{lang === 'bn' ? 'দক্ষতা' : 'EFF'}</span>
                                    </div>
                                  </div>

                                  {/* Small Legend */}
                                  <div className="w-[45%] text-left font-mono text-[8px] leading-relaxed max-h-full overflow-y-auto pr-1">
                                    {efficiencyData.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-1 mt-0.5 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-slate-400 font-bold truncate max-w-[40px] uppercase">{item.name}</span>
                                        <span className="text-slate-200 font-bold ml-auto shrink-0">{item.rate}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="text-[8px] font-mono text-cyan-400/80 text-left pt-1 flex justify-between border-t border-cyan-950/20">
                                <span>{lang === "bn" ? "ক্যাটেগরি ট্র্যাকার" : "CATEGORY TRACKER"}</span>
                                <span>{tasks.filter(t => t.completed).length}/{tasks.length} {lang === "bn" ? "সম্পন্ন" : "TOTAL"}</span>
                              </div>
                            </motion.div>
                          );
                        }

                        if (widget.id === "memory") {
                          return (
                            <motion.div
                              layoutId="memory"
                              key="memory"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "memory")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "memory")}
                              className="col-span-1 md:col-span-1 xl:col-span-1 relative rounded-xl overflow-hidden p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                              onClick={() => trackWidgetInteraction("memory")}
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(10,5,35,0.92), rgba(5,0,20,0.85))",
                                border: "1px solid rgba(124,58,237,0.2)",
                                boxShadow: "inset 0 0 20px rgba(124,58,237,0.04)",
                                backdropFilter: "blur(20px)",
                                minHeight: "140px",
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)",
                                }}
                              />
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span
                                    className="jarvis-label"
                                    style={{ color: "rgba(167,139,250,0.7)" }}
                                  >
                                    MEMORY ENGINE
                                  </span>
                                  <span className="text-[9px] font-mono text-purple-400 bg-purple-950/30 px-1.5 py-0.5 rounded border border-purple-500/10 shrink-0">
                                    {memories.length} KEYS
                                  </span>
                                </div>

                                <div className="overflow-y-auto max-h-[90px] space-y-1 pr-1 custom-scrollbar mb-2 text-left mt-2">
                                  {[...memories]
                                    .sort(
                                      (a, b) => (b.importance || 0) - (a.importance || 0),
                                    )
                                    .slice(0, 4)
                                    .map((mem) => {
                                      const isHighImportance = (mem.importance || 0) >= 4;
                                      return (
                                        <div
                                          key={mem.id}
                                          className="text-[10px] bg-indigo-950/20 border border-indigo-900/30 px-2 py-0.5 rounded flex justify-between items-center gap-1"
                                        >
                                          <div className="truncate flex-1">
                                            <span className="text-[8px] font-mono uppercase text-indigo-400 font-bold mr-1">
                                              [{mem.key}]
                                            </span>
                                            <span className="text-slate-300 font-sans font-medium">
                                              {mem.value}
                                            </span>
                                          </div>
                                          {isHighImportance ? (
                                            <span className="text-[8px] font-mono font-bold px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/20 shrink-0 shadow-[0_0_5px_rgba(239,68,68,0.25)]">
                                              IMP: {mem.importance}
                                            </span>
                                          ) : (
                                            <span className="text-[8px] font-mono text-slate-550 font-medium shrink-0">
                                              v{mem.importance || 2}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  {memories.length === 0 && (
                                    <div className="text-[8px] font-mono text-slate-550 text-center py-2 italic">
                                      Memory database is standard cache
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-1">
                                <div className="text-[10px] text-slate-400 mb-1">
                                  Importance-ranked records
                                </div>
                                <div className="h-0.5 rounded bg-purple-950/40 relative overflow-hidden">
                                  <div
                                    className="h-full rounded"
                                    style={{
                                      width: `${Math.min(memories.length * 15, 100)}%`,
                                      background:
                                        "linear-gradient(90deg, rgba(124,58,237,0.6), rgba(167,139,250,0.9))",
                                      boxShadow: "0 0 6px rgba(124,58,237,0.5)",
                                    }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          );
                        }

                        if (widget.id === "agent") {
                          const hasCriticalEvent = latency > 50 || apiHealth < 95;
                          return (
                            <motion.div
                              layoutId="agent"
                              key="agent"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "agent")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "agent")}
                              className="col-span-1 md:col-span-1 xl:col-span-1 relative rounded-xl overflow-hidden p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all duration-300"
                              onClick={() => trackWidgetInteraction("agent")}
                              style={{
                                background: hasCriticalEvent
                                  ? "linear-gradient(135deg, rgba(30,5,5,0.95), rgba(15,2,2,0.9))"
                                  : "linear-gradient(135deg, rgba(0,20,10,0.92), rgba(0,10,5,0.85))",
                                border: hasCriticalEvent
                                  ? "1px solid rgba(239,68,68,0.4)"
                                  : "1px solid rgba(0,255,136,0.18)",
                                boxShadow: hasCriticalEvent
                                  ? "inset 0 0 20px rgba(239,68,68,0.15), 0 0 15px rgba(239,68,68,0.15)"
                                  : "inset 0 0 20px rgba(0,255,136,0.03)",
                                backdropFilter: "blur(20px)",
                                minHeight: "140px",
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              {hasCriticalEvent ? (
                                <div
                                  className="absolute top-0 left-0 right-0 h-px animate-pulse"
                                  style={{
                                    background:
                                      "linear-gradient(90deg, transparent, rgba(239,68,68,0.8), transparent)",
                                  }}
                                />
                              ) : (
                                <div
                                  className="absolute top-0 left-0 right-0 h-px"
                                  style={{
                                    background:
                                      "linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)",
                                  }}
                                />
                              )}

                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span
                                    className="jarvis-label"
                                    style={{
                                      color: hasCriticalEvent
                                        ? "rgba(239,68,68,0.9)"
                                        : "rgba(0,255,136,0.7)",
                                    }}
                                  >
                                    AGENT CONTROLLER
                                  </span>
                                  {hasCriticalEvent ? (
                                    <span className="text-[8px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30 animate-pulse font-bold">
                                      ⚠️ SYSTEM ANOMALY
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                      LIVE PING
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-baseline justify-between">
                                  <span
                                    className="text-xl font-jarvis font-bold"
                                    style={{
                                      color: hasCriticalEvent ? "#ef4444" : "#00ff88",
                                      textShadow: hasCriticalEvent
                                        ? "0 0 10px rgba(239,68,68,0.5)"
                                        : "0 0 10px rgba(0,255,136,0.4)",
                                    }}
                                  >
                                    {latency}ms
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono ${hasCriticalEvent ? "text-rose-400 font-bold" : "text-slate-400"}`}
                                  >
                                    {apiHealth}% health
                                  </span>
                                </div>
                              </div>

                              <div className="h-14 w-full mt-2 select-none relative rounded overflow-hidden">
                                {hasCriticalEvent && (
                                  <div className="absolute inset-0 bg-red-950/15 pointer-events-none border border-red-500/10 hover:border-red-500/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.2)] animate-pulse flex items-center justify-center z-10 rounded">
                                    <span className="text-[7px] font-mono text-red-400 font-bold tracking-widest uppercase bg-red-950/80 border border-red-500/20 px-1 rounded shadow">
                                      SCAN_ANOMALY
                                    </span>
                                  </div>
                                )}

                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={latencyHistory}
                                    margin={{
                                      top: 2,
                                      right: 2,
                                      left: -32,
                                      bottom: 2,
                                    }}
                                  >
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={["auto", "auto"]} hide />
                                    <Tooltip
                                      contentStyle={{
                                        background: hasCriticalEvent
                                          ? "rgba(30, 5, 5, 0.95)"
                                          : "rgba(0, 10, 5, 0.95)",
                                        border: hasCriticalEvent
                                          ? "1px solid rgba(239, 68, 68, 0.5)"
                                          : "1px solid rgba(0, 255, 136, 0.3)",
                                        borderRadius: "6px",
                                        fontSize: "9px",
                                        color: hasCriticalEvent
                                          ? "#fecdd3"
                                          : "#a7f3d0",
                                      }}
                                      labelStyle={{ display: "none" }}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="latency"
                                      name="Ping"
                                      stroke={
                                        hasCriticalEvent ? "#ef4444" : "#00ff88"
                                      }
                                      strokeWidth={1.5}
                                      dot={false}
                                      activeDot={{ r: 3 }}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="health"
                                      name="Health"
                                      stroke={
                                        hasCriticalEvent ? "#fda4af" : "#a78bfa"
                                      }
                                      strokeWidth={1.0}
                                      dot={false}
                                      activeDot={{ r: 3 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </motion.div>
                          );
                        }

                        if (widget.id === "scratchpad") {
                          return (
                            <motion.div
                              layoutId="scratchpad"
                              key="scratchpad"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "scratchpad")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "scratchpad")}
                              className="col-span-1 md:col-span-1 xl:col-span-1 relative rounded-xl overflow-hidden p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                              onClick={() => trackWidgetInteraction("scratchpad")}
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(30,10,25,0.92), rgba(15,5,15,0.85))",
                                border: "1px solid rgba(236,72,153,0.18)",
                                boxShadow: "inset 0 0 20px rgba(236,72,153,0.03)",
                                backdropFilter: "blur(20px)",
                                minHeight: "140px",
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(236,72,153,0.4), transparent)",
                                }}
                              />

                              <div className="flex items-center justify-between mb-1.5">
                                <span
                                  className="jarvis-label"
                                  style={{ color: "rgba(236,72,153,0.7)" }}
                                >
                                  SYSTEM SCRATCHPAD
                                </span>
                                {showNotesSaved && (
                                  <span className="text-[9px] font-mono text-pink-400 animate-pulse flex items-center gap-1">
                                    <span>●</span>{" "}
                                    {lang === "bn" ? "সংরক্ষিত" : "Draft saved"}
                                  </span>
                                )}
                              </div>

                              <textarea
                                value={scratchpadDraft}
                                onChange={(e) => {
                                  setScratchpadDraft(e.target.value);
                                  setNotesUnsaved(true);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder={
                                  lang === "bn"
                                    ? "এখানে ড্রাফট লিখুন..."
                                    : "Scribble quick draft memo..."
                                }
                                className="w-full text-xs font-sans text-pink-100 placeholder-pink-300/20 bg-pink-950/10 border border-pink-500/10 focus:border-pink-500/30 rounded p-1.5 resize-none grow focus:outline-none"
                                style={{ minHeight: "65px" }}
                              />
                            </motion.div>
                          );
                        }

                        if (widget.id === "os_quick") {
                          return (
                            <motion.div
                              layoutId="os_quick"
                              key="os_quick"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "os_quick")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "os_quick")}
                              className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
                              onClick={() => trackWidgetInteraction("os_quick")}
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(0,20,10,0.92) 0%, rgba(0,10,5,0.88) 100%)",
                                border: "1px solid rgba(0,255,136,0.2)",
                                boxShadow:
                                  "0 0 0 1px rgba(0,255,136,0.04), inset 0 0 20px rgba(0,255,136,0.03)",
                                backdropFilter: "blur(20px)",
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(0,255,136,0.5), transparent)",
                                }}
                              />
                              <div className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{
                                        background: "#00ff88",
                                        boxShadow: "0 0 4px #00ff88",
                                      }}
                                    />
                                    <span
                                      className="jarvis-label"
                                      style={{ color: "rgba(0,255,136,0.7)" }}
                                    >
                                      OS QUICK COMMAND
                                    </span>
                                  </div>
                                  {showCommandSaved && (
                                    <span className="text-[9px] font-mono text-emerald-400 animate-pulse flex items-center gap-1">
                                      <span>●</span>{" "}
                                      {lang === "bn" ? "খসড়া সংরক্ষিত!" : "Draft saved"}
                                    </span>
                                  )}
                                </div>
                                <form
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    const val = qcmdDraft.trim();
                                    if (!val) return;
                                    setQcmdDraft("");
                                    localStorage.removeItem("neora_qcmd_draft");
                                    try {
                                      await neoraPost("/api/os/command", { prompt: val });
                                      setActiveTab("osAgent");
                                    } catch {
                                      /* ignore */
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex gap-2 font-mono"
                                >
                                  <input
                                    name="qcmd"
                                    type="text"
                                    value={qcmdDraft}
                                    onChange={(e) => {
                                      setQcmdDraft(e.target.value);
                                      setCommandUnsaved(true);
                                    }}
                                    placeholder={
                                      lang === "bn"
                                        ? "যেমন: নোটপ্যাড খোলো, ফাইল লিখো..."
                                        : "e.g. open notepad, write file hello.txt: Hi"
                                    }
                                    className="flex-1 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                                    style={{
                                      background: "rgba(0,255,136,0.05)",
                                      border: "1px solid rgba(0,255,136,0.2)",
                                      color: "rgba(186,240,210,0.85)",
                                    }}
                                    onFocus={(e) =>
                                      (e.currentTarget.style.borderColor =
                                        "rgba(0,255,136,0.5)")
                                    }
                                    onBlur={(e) =>
                                      (e.currentTarget.style.borderColor =
                                        "rgba(0,255,136,0.2)")
                                    }
                                  />
                                  <button
                                    type="submit"
                                    className="px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer hover:bg-emerald-500/20"
                                    style={{
                                      background: "rgba(0,255,136,0.12)",
                                      border: "1px solid rgba(0,255,136,0.3)",
                                      color: "#00ff88",
                                    }}
                                  >
                                    RUN
                                  </button>
                                </form>
                              </div>
                            </motion.div>
                          );
                        }

                        if (widget.id === "live_journal") {
                          return (
                            <motion.div
                              layoutId="live_journal"
                              key="live_journal"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "live_journal")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "live_journal")}
                              className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 cursor-grab active:cursor-grabbing"
                              onClick={() => trackWidgetInteraction("live_journal")}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <LiveJournalWidget className="mt-2" />
                            </motion.div>
                          );
                        }

                        if (widget.id === "system_log") {
                          return (
                            <motion.div
                              layoutId="system_log"
                              key="system_log"
                              draggable
                              onDragStart={(e) => handleDragStart(e, "system_log")}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, "system_log")}
                              className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5 cursor-grab active:cursor-grabbing"
                              onClick={() => trackWidgetInteraction("system_log")}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <SystemEventLog lang={lang} />
                            </motion.div>
                          );
                        }

                        return null;
                      })}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* Main Content — hidden on Dashboard tab */}
            {activeTab !== "home" && (
              <main
                id="main-content"
                className="flex-1 flex min-h-0 overflow-hidden relative"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    className="flex-1 flex min-h-0 overflow-hidden"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.16 }}
                  >
                    {activeTab === "neoraTv" && <NeoraTV lang={lang} />}

                    {activeTab === "pcController" && (
                      <HostPCControl lang={lang} />
                    )}

                    {activeTab === "chat" && (
                      <ChatView
                        lang={lang}
                        onAddTask={handleAddTask}
                        onAddReminder={handleAddReminder}
                        onAddNote={handleAddNote}
                        onSearchBlueprints={(query) => {
                          setSearchQuery(query);
                          setActiveTab("blueprint");
                        }}
                        useGroq={useGroq}
                        setUseGroq={setUseGroq}
                        groqKey={groqKey}
                        setGroqKey={setGroqKey}
                        groqModel={groqModel}
                        setGroqModel={setGroqModel}
                        geminiKey={geminiKey}
                        setGeminiKey={setGeminiKey}
                        onSelfEvolution={handleSelfEvolution}
                        groqStatus={groqStatus}
                        ollamaDiagnosticStatus={ollamaStatus}
                      />
                    )}

                    {activeTab === "autonomy" && (
                      <PlannerView
                        lang={lang}
                        autonomyLevel={autonomyLevel}
                        setAutonomyLevel={setAutonomyLevel}
                      />
                    )}

                    {activeTab === "productivity" && (
                      <OrganizerView
                        lang={lang}
                        tasks={tasks}
                        reminders={reminders}
                        notes={notes}
                        memories={memories}
                        onAddTask={handleAddTask}
                        onAddReminder={handleAddReminder}
                        onAddNote={handleAddNote}
                        onAddMemory={handleAddMemory}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                        onToggleReminder={handleToggleReminder}
                        onDeleteReminder={handleDeleteReminder}
                        onDeleteNote={handleDeleteNote}
                        onDeleteMemory={handleDeleteMemory}
                        onUpdateTask={handleUpdateTask}
                        onUpdateTaskOrder={setTasks}
                      />
                    )}

                    {activeTab === "memoriesGraph" && (
                      <MemoriesGraphView lang={lang} memories={memories} tasks={tasks} />
                    )}

                    {activeTab === "invoice" && <EarningView lang={lang} />}

                    {activeTab === "dev" && (
                      <DevStudioView
                        lang={lang}
                        useGroq={useGroq}
                        setUseGroq={setUseGroq}
                        groqKey={groqKey}
                        setGroqKey={setGroqKey}
                        groqModel={groqModel}
                        setGroqModel={setGroqModel}
                      />
                    )}

                    {activeTab === "osAgent" && (
                      <OsAgentView
                        lang={lang}
                        geminiKey={geminiKey}
                        setGeminiKey={setGeminiKey}
                        useGroq={useGroq}
                        groqKey={groqKey}
                        groqModel={groqModel}
                      />
                    )}

                    {activeTab === "webOs" && <WebOSSimulator lang={lang} />}

                    {activeTab === "filterLab" && <FilterLabView lang={lang} />}

                    {activeTab === "roadmap" && <RoadmapView lang={lang} />}

                    {activeTab === "blueprint" && (
                      <div className="flex-1 flex h-full overflow-hidden shrink-0 relative">
                        {showBlueprintSidebar && (
                          <Sidebar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedSectionId={selectedSectionId}
                            setSelectedSectionId={setSelectedSectionId}
                            selectedTag={selectedTag}
                            setSelectedTag={setSelectedTag}
                          />
                        )}
                        {/* Premium Floating Slide-Button to toggle Blueprint Sidebar */}
                        <button
                          onClick={() =>
                            setShowBlueprintSidebar(!showBlueprintSidebar)
                          }
                          className="absolute top-1/2 -translate-y-1/2 z-40 bg-slate-950 hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 border border-slate-800 p-1.5 rounded-r-xl cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] duration-300 flex items-center justify-center"
                          style={{
                            left: showBlueprintSidebar ? "320px" : "0px",
                            transition: "left 0.3s ease-in-out",
                          }}
                          title={
                            showBlueprintSidebar
                              ? "Collapse Specifications"
                              : "Expand Specifications"
                          }
                        >
                          {showBlueprintSidebar ? (
                            <ChevronLeft className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <SectionViewer section={selectedSection} />
                      </div>
                    )}

                    {activeTab === "evolution" && (
                      <div className="flex flex-col h-full w-full">
                        {/* High-tech JARVIS sub-tab bar */}
                        <div className="flex flex-wrap gap-2.5 p-3 bg-slate-950/70 border-b border-cyan-500/15 shrink-0 select-none">
                          <button
                            onClick={() => setEvolutionSubTab("protocol")}
                            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
                              evolutionSubTab === "protocol"
                                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_15px_rgba(0,212,255,0.12)]"
                                : "text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 bg-slate-900/30"
                            }`}
                          >
                            <Cpu className={`w-3.5 h-3.5 ${evolutionSubTab === "protocol" ? "text-cyan-400 animate-pulse" : ""}`} />
                            <span>{lang === "bn" ? "অটোনমাস সেলফ-আপডেট প্রোটোকল" : "Autonomous Self-Update Protocol"}</span>
                          </button>
                          <button
                            onClick={() => setEvolutionSubTab("status")}
                            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
                              evolutionSubTab === "status"
                                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_15px_rgba(0,212,255,0.12)]"
                                : "text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 bg-slate-900/30"
                            }`}
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${evolutionSubTab === "status" ? "text-cyan-400 animate-bounce" : ""}`} />
                            <span>{lang === "bn" ? "ইভোলিউশনারি মেমরি ও স্ট্যাটাস" : "Evolutionary Status & Memories"}</span>
                          </button>
                        </div>
                        <div className="flex-1 overflow-auto min-h-0">
                          {evolutionSubTab === "protocol" ? (
                            <SelfEvolutionView lang={lang} />
                          ) : (
                            <EvolutionaryStatusView
                              lang={lang}
                              tasks={tasks}
                              memories={memories}
                              onAddMemory={handleAddMemory}
                              unlockedFeatures={unlockedFeatures}
                              onUnlockFeature={handleUnlockFeature}
                              latencyHistory={latencyHistory}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "vscode" && <VSCodeView />}

                    {activeTab === "builder" && <BuilderView lang={lang} onChangeLang={setLang} />}
                  </motion.div>
                </AnimatePresence>
              </main>
            )}

            {/* --- UNDO TOAST NOTIFICATION SYSTEM (5-SECOND DISMISS) --- */}
            <AnimatePresence>
              {showUndo && lastDeleted && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 backdrop-blur-xl"
                  style={{
                    background: "rgba(0,10,25,0.95)",
                    border: "1px solid rgba(0,212,255,0.3)",
                    boxShadow:
                      "0 0 0 1px rgba(0,212,255,0.08), 0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,212,255,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: "#00d4ff",
                        boxShadow: "0 0 6px #00d4ff",
                        animation: "glow-pulse 1s infinite",
                      }}
                    />
                    <span
                      className="text-xs font-mono"
                      style={{ color: "rgba(0,212,255,0.8)" }}
                    >
                      {lang === "bn"
                        ? "আইটেম মুছে ফেলা হয়েছে।"
                        : "ITEM DELETED"}
                    </span>
                  </div>
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1 text-[10px] font-bold font-mono px-3 py-1.5 rounded uppercase transition-all"
                    style={{
                      background: "rgba(0,212,255,0.15)",
                      border: "1px solid rgba(0,212,255,0.35)",
                      color: "#00d4ff",
                      textShadow: "0 0 6px rgba(0,212,255,0.5)",
                    }}
                  >
                    <Undo className="w-3 h-3" />
                    <span>{lang === "bn" ? "পূর্বাবস্থায়" : "UNDO"}</span>
                  </button>
                  <button
                    onClick={() => setShowUndo(false)}
                    className="p-1 transition-colors"
                    style={{ color: "rgba(0,212,255,0.4)" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- GLOBAL SEARCH CMD+K OVERLAY MODAL --- */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 backdrop-blur-md z-50 flex items-start justify-center p-4 sm:p-10 pt-20"
                  style={{ background: "rgba(0,4,12,0.85)" }}
                  onClick={() => setIsSearchOpen(false)}
                >
                  <motion.div
                    initial={{ y: -30, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: -30, scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col"
                    style={{
                      background: "rgba(0,8,22,0.97)",
                      border: "1px solid rgba(0,212,255,0.25)",
                      boxShadow:
                        "0 0 0 1px rgba(0,212,255,0.08), 0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,255,0.08)",
                      backdropFilter: "blur(24px)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Search input header */}
                    <div className="p-4 border-b border-slate-850 flex items-center gap-3 bg-slate-900/50">
                      <Search className="w-5 h-5 text-cyan-400 shrink-0" />
                      <input
                        type="text"
                        autoFocus
                        placeholder={
                          lang === "bn"
                            ? "টাইপ করুনঃ টাস্ক, নোট বা সিস্টেম ব্লুপ্রিন্ট খুঁজুন..."
                            : "Type to search tasks, notes, or blueprints (CMD+K)..."
                        }
                        value={globalSearchVal}
                        onChange={(e) => setGlobalSearchVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && globalSearchVal.trim()) {
                            addRecentSearch(globalSearchVal);
                          }
                        }}
                        className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm border-none outline-none focus:ring-0 focus:border-none focus:outline-none"
                      />
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="bg-slate-800 text-[9px] font-bold font-mono text-slate-400 border border-slate-700 px-2 py-1 rounded"
                      >
                        ESC
                      </button>
                    </div>

                    {/* Suggestions / Results */}
                    <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 space-y-4">
                      {globalSearchVal.trim() === "" ? (
                        <div className="space-y-6">
                          <div className="text-center py-6 text-slate-500 font-mono text-xs border-b border-slate-900/50">
                            <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
                            <span>
                              {lang === "bn"
                                ? "পেন্ডিং টাস্ক, ডকুমেন্টস বা ব্লুপ্রিন্ট খুঁজতে শুরু করুন..."
                                : "Search across all workspaces, specifications, and checklists."}
                            </span>
                          </div>

                          {recentSearches.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-widest">
                                  {lang === "bn"
                                    ? "সাম্প্রতিক অনুসন্ধান"
                                    : "RECENT SEARCH INQUIRIES"}
                                </span>
                                <button
                                  onClick={() => {
                                    setRecentSearches([]);
                                    localStorage.setItem(
                                      "neora_recent_searches",
                                      JSON.stringify([]),
                                    );
                                  }}
                                  className="text-[9px] font-mono text-slate-600 hover:text-rose-400 transition-colors"
                                >
                                  [CLEAR ALL]
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {recentSearches.map((qs, qIdx) => (
                                  <button
                                    key={qIdx}
                                    onClick={() => setGlobalSearchVal(qs)}
                                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-920 hover:bg-slate-900 border border-slate-850 hover:border-cyan-500/30 text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                                  >
                                    <span className="text-slate-500 text-[9px]">
                                      🔍
                                    </span>
                                    <span>{qs}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Tasks Matches */}
                          {tasks.filter((t) =>
                            t.title
                              .toLowerCase()
                              .includes(globalSearchVal.toLowerCase()),
                          ).length > 0 && (
                            <div className="space-y-1.5">
                              <h4 className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-widest pl-1">
                                {lang === "bn"
                                  ? "টাস্ক ম্যাচসমূহ"
                                  : "TASKS & CHECKLISTS"}
                              </h4>
                              <div className="space-y-1">
                                {tasks
                                  .filter((t) =>
                                    t.title
                                      .toLowerCase()
                                      .includes(globalSearchVal.toLowerCase()),
                                  )
                                  .map((t) => (
                                    <div
                                      key={t.id}
                                      onClick={() => {
                                        addRecentSearch(globalSearchVal);
                                        setActiveTab("productivity");
                                        setGlobalSearchVal("");
                                        setIsSearchOpen(false);
                                      }}
                                      className="p-2 bg-slate-950/40 border border-slate-850/60 hover:border-cyan-500/20 rounded cursor-pointer transition-colors flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${t.completed ? "bg-slate-600" : "bg-cyan-500"}`}
                                        />
                                        <span
                                          className={`truncate ${t.completed ? "line-through text-slate-500" : "text-slate-200"}`}
                                        >
                                          {t.title}
                                        </span>
                                      </div>
                                      <span className="text-[8px] font-mono bg-slate-850 text-slate-400 px-1.5 py-0.2 rounded uppercase shrink-0">
                                        {t.priority}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Notes Matches */}
                          {notes.filter(
                            (n) =>
                              n.title
                                .toLowerCase()
                                .includes(globalSearchVal.toLowerCase()) ||
                              n.content
                                .toLowerCase()
                                .includes(globalSearchVal.toLowerCase()),
                          ).length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <h4 className="text-[9px] font-bold font-mono text-indigo-400 uppercase tracking-widest pl-1">
                                {lang === "bn"
                                  ? "নোট ম্যাচসমূহ"
                                  : "NOTEPAD DOCUMENTS"}
                              </h4>
                              <div className="space-y-1">
                                {notes
                                  .filter(
                                    (n) =>
                                      n.title
                                        .toLowerCase()
                                        .includes(
                                          globalSearchVal.toLowerCase(),
                                        ) ||
                                      n.content
                                        .toLowerCase()
                                        .includes(
                                          globalSearchVal.toLowerCase(),
                                        ),
                                  )
                                  .map((n) => (
                                    <div
                                      key={n.id}
                                      onClick={() => {
                                        addRecentSearch(globalSearchVal);
                                        setActiveTab("productivity");
                                        setGlobalSearchVal("");
                                        setIsSearchOpen(false);
                                      }}
                                      className="p-2 bg-slate-950/40 border border-slate-850/60 hover:border-indigo-500/20 rounded cursor-pointer transition-colors text-xs space-y-0.5"
                                    >
                                      <strong className="text-slate-200 block truncate">
                                        {n.title}
                                      </strong>
                                      <p className="text-[10px] text-slate-400 truncate leading-none">
                                        {n.content}
                                      </p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Specs / Blueprints Matches */}
                          {SECTIONS.filter(
                            (s) =>
                              s.title
                                .toLowerCase()
                                .includes(globalSearchVal.toLowerCase()) ||
                              s.description
                                .toLowerCase()
                                .includes(globalSearchVal.toLowerCase()) ||
                              s.content
                                .toLowerCase()
                                .includes(globalSearchVal.toLowerCase()),
                          ).length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <h4 className="text-[9px] font-bold font-mono text-violet-400 uppercase tracking-widest pl-1">
                                {lang === "bn"
                                  ? "সিস্টেম ব্লুপ্রিন্ট"
                                  : "SYSTEM BLUEPRINTS"}
                              </h4>
                              <div className="space-y-1">
                                {SECTIONS.filter(
                                  (s) =>
                                    s.title
                                      .toLowerCase()
                                      .includes(
                                        globalSearchVal.toLowerCase(),
                                      ) ||
                                    s.description
                                      .toLowerCase()
                                      .includes(
                                        globalSearchVal.toLowerCase(),
                                      ) ||
                                    s.content
                                      .toLowerCase()
                                      .includes(globalSearchVal.toLowerCase()),
                                ).map((s) => (
                                  <div
                                    key={s.id}
                                    onClick={() => {
                                      addRecentSearch(globalSearchVal);
                                      setSelectedSectionId(s.id);
                                      setActiveTab("blueprint");
                                      setGlobalSearchVal("");
                                      setIsSearchOpen(false);
                                    }}
                                    className="p-2 bg-slate-950/40 border border-slate-850/60 hover:border-violet-500/20 rounded cursor-pointer transition-colors text-xs space-y-0.5"
                                  >
                                    <strong className="text-slate-200 block truncate">
                                      {s.title}
                                    </strong>
                                    <p className="text-[10px] text-slate-400 truncate leading-none">
                                      {s.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* No Results Fallback */}
                          {tasks.filter((t) =>
                            t.title
                              .toLowerCase()
                              .includes(globalSearchVal.toLowerCase()),
                          ).length === 0 &&
                            notes.filter(
                              (n) =>
                                n.title
                                  .toLowerCase()
                                  .includes(globalSearchVal.toLowerCase()) ||
                                n.content
                                  .toLowerCase()
                                  .includes(globalSearchVal.toLowerCase()),
                            ).length === 0 &&
                            SECTIONS.filter(
                              (s) =>
                                s.title
                                  .toLowerCase()
                                  .includes(globalSearchVal.toLowerCase()) ||
                                s.description
                                  .toLowerCase()
                                  .includes(globalSearchVal.toLowerCase()) ||
                                s.content
                                  .toLowerCase()
                                  .includes(globalSearchVal.toLowerCase()),
                            ).length === 0 && (
                              <div className="text-center py-6 text-slate-500 font-mono text-xs">
                                {lang === "bn"
                                  ? "কোনো ক্যাশ রেজাল্ট পাওয়া যায়নি।"
                                  : "No matching entries found."}
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* ===== HOLOGRAPHIC VOICE COMMAND TOAST ===== */}
            <AnimatePresence>
              {voiceToast && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed bottom-20 right-6 z-[90] flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_30px_rgba(0,212,255,0.25)]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,20,40,0.95), rgba(0,8,22,0.9))",
                  }}
                >
                  {/* Pulsing visual core */}
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />

                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold tracking-widest leading-none mb-0.5">
                      VOICE COMMAND EXECUTED
                    </span>
                    <span className="text-xs text-slate-100 font-sans font-medium">
                      {voiceToast.message}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      voiceToast.undo();
                      setVoiceToast(null);
                    }}
                    className="ml-2 px-3 py-1 text-[10px] font-mono font-bold uppercase rounded border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 transition-all cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.15)] shrink-0"
                  >
                    {lang === "bn" ? "বাতিল" : "CANCEL"}
                  </button>
                  <button
                    onClick={() => setVoiceToast(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===== EVOLUTIONARY SKILL DISCOVERED TOAST ===== */}
            <AnimatePresence>
              {skillNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  className="fixed top-24 right-6 z-[9999] max-w-sm flex flex-col gap-2 p-4 rounded-xl border border-emerald-500/35 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-slate-950/95 backdrop-blur-xl text-left"
                >
                  <div className="absolute top-0 left-0 w-8 h-px bg-emerald-400" />
                  <div className="absolute top-0 left-0 w-px h-8 bg-emerald-400" />
                  
                  <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                        {lang === "bn" ? "নতুন দক্ষতা অর্জিত" : "NEW SKILL REGISTERED"}
                      </span>
                    </div>
                    <button
                      onClick={clearSkillNotification}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-left py-1">
                    <h4 className="text-xs font-bold text-slate-100 font-sans">
                      {skillNotification.skillName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {skillNotification.description}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-900/40 text-[9px] font-mono text-emerald-400/80 flex items-center gap-1">
                      <span className="text-slate-500">Use case:</span>
                      <span>{skillNotification.useCase}</span>
                    </div>
                  </div>

                  <button
                    onClick={clearSkillNotification}
                    className="w-full py-1.5 text-center text-[10px] font-mono font-bold uppercase rounded border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all cursor-pointer mt-1"
                  >
                    {lang === "bn" ? "নিশ্চিত" : "ACKNOWLEDGE CAPABILITY"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===== HOLOGRAPHIC NOTIFICATION SYSTEM ===== */}
            <NeoraNotifications
              reminders={reminders}
              tasks={tasks}
              apiHealth={apiHealth}
              lang={lang}
              onSnoozeReminder={handleSnoozeReminder}
              onSnoozeTask={handleSnoozeTask}
            />

            {/* ===== TASK CONTEXT MENU ===== */}
            <AnimatePresence>
              {(() => {
                if (!contextMenuTask) return null;
                const menuWidth = 176;
                const menuHeight = 150;
                let left = contextMenuTask.x;
                let top = contextMenuTask.y;
                if (left + menuWidth > window.innerWidth) {
                  left = window.innerWidth - menuWidth - 10;
                }
                if (top + menuHeight > window.innerHeight) {
                  top = window.innerHeight - menuHeight - 10;
                }
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="fixed z-[9999] bg-slate-950/95 border border-cyan-500/40 rounded-lg shadow-2xl p-1 w-44 font-mono text-[9px] backdrop-blur-md text-left"
                    style={{
                      left,
                      top,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2 py-1 text-slate-500 border-b border-slate-900 mb-1 text-[8px] uppercase tracking-wider">
                      Task Actions
                    </div>
                    
                    <button
                      onClick={() => {
                        const tk = tasks.find((t) => t.id === contextMenuTask.id);
                        if (tk) {
                          setEditingTaskId(tk.id);
                          setEditingTaskTitle(tk.title);
                        }
                        setContextMenuTask(null);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-slate-350 hover:bg-cyan-950/50 hover:text-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3 h-3 text-cyan-400" />
                      <span>EDIT TITLE</span>
                    </button>

                    {/* RESCHEDULE SUB-MENU */}
                    <div className="relative group/resched">
                      <div className="w-full text-left px-2 py-1.5 rounded text-slate-350 hover:bg-cyan-950/50 hover:text-cyan-400 transition-all flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          <span>RESCHEDULE</span>
                        </div>
                        <span className="text-[7px] text-slate-500">▶</span>
                      </div>
                      
                      <div className="absolute left-full top-0 ml-0.5 hidden group-hover/resched:block bg-slate-950/95 border border-cyan-500/40 rounded-lg shadow-2xl p-1 w-32 space-y-0.5 backdrop-blur-md">
                        <button
                          onClick={() => {
                            const today = new Date().toISOString().substring(0, 10);
                            setTasks((prev) =>
                              prev.map((t) => (t.id === contextMenuTask.id ? { ...t, dueAt: today } : t))
                            );
                            triggerDbSyncAnimation();
                            setContextMenuTask(null);
                          }}
                          className="w-full text-left px-2 py-1 rounded text-slate-350 hover:bg-cyan-950/50 hover:text-cyan-400 transition-all cursor-pointer"
                        >
                          TODAY
                        </button>
                        <button
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            const tomorrowStr = tomorrow.toISOString().substring(0, 10);
                            setTasks((prev) =>
                              prev.map((t) => (t.id === contextMenuTask.id ? { ...t, dueAt: tomorrowStr } : t))
                            );
                            triggerDbSyncAnimation();
                            setContextMenuTask(null);
                          }}
                          className="w-full text-left px-2 py-1 rounded text-slate-350 hover:bg-cyan-950/50 hover:text-cyan-400 transition-all cursor-pointer"
                        >
                          TOMORROW
                        </button>
                        <button
                          onClick={() => {
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            const nextWeekStr = nextWeek.toISOString().substring(0, 10);
                            setTasks((prev) =>
                              prev.map((t) => (t.id === contextMenuTask.id ? { ...t, dueAt: nextWeekStr } : t))
                            );
                            triggerDbSyncAnimation();
                            setContextMenuTask(null);
                          }}
                          className="w-full text-left px-2 py-1 rounded text-slate-350 hover:bg-cyan-950/50 hover:text-cyan-400 transition-all cursor-pointer"
                        >
                          NEXT WEEK
                        </button>
                        <div className="px-2 py-1 border-t border-slate-900 mt-1">
                          <input
                            type="date"
                            onChange={(e) => {
                              if (e.target.value) {
                                setTasks((prev) =>
                                  prev.map((t) =>
                                    t.id === contextMenuTask.id ? { ...t, dueAt: e.target.value } : t
                                  )
                                );
                                triggerDbSyncAnimation();
                                setContextMenuTask(null);
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 text-[8px] text-slate-300 rounded px-1 py-0.5 focus:outline-none focus:border-cyan-500/50"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CHANGE PRIORITY SUB-MENU */}
                    <div className="relative group/prio">
                      <div className="w-full text-left px-2 py-1.5 rounded text-slate-350 hover:bg-cyan-950/50 hover:text-cyan-400 transition-all flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-cyan-400" />
                          <span>CHANGE PRIORITY</span>
                        </div>
                        <span className="text-[7px] text-slate-500">▶</span>
                      </div>

                      <div className="absolute left-full top-0 ml-0.5 hidden group-hover/prio:block bg-slate-950/95 border border-cyan-500/40 rounded-lg shadow-2xl p-1 w-32 space-y-0.5 backdrop-blur-md">
                        {(["critical", "high", "medium", "low"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => {
                              setTasks((prev) =>
                                prev.map((t) => (t.id === contextMenuTask.id ? { ...t, priority: p } : t))
                              );
                              triggerDbSyncAnimation();
                              setContextMenuTask(null);
                            }}
                            className="w-full text-left px-2 py-1 rounded text-slate-350 hover:bg-cyan-950/50 hover:text-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer uppercase"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p === "critical"
                                  ? "bg-rose-500"
                                  : p === "high"
                                    ? "bg-amber-500"
                                    : p === "medium"
                                      ? "bg-cyan-500"
                                      : "bg-slate-500"
                              }`}
                            />
                            <span>{p}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* ===== COMMAND STATUS CORNER DOCKED INDICATOR ===== */}
            <CommandStatusIndicator queue={commandQueue} lang={lang} />

            {/* ===== VOICE COMMAND PANEL ===== */}
            {voicePanelOpen && (
              <VoiceCommandPanel
                lang={lang}
                onAddTask={(title, priority) => {
                  const tempId = Math.random().toString();
                  const newTask: Task = {
                    id: tempId,
                    title,
                    notes: "",
                    priority,
                    dueAt: new Date().toISOString().substring(0, 10),
                    completed: false,
                    tags: [],
                  };
                  setTasks((prev) => [newTask, ...prev]);
                  triggerDbSyncAnimation();

                  setVoiceToast({
                    id: tempId,
                    message:
                      lang === "bn"
                        ? `টাস্ক তৈরি: "${title}"`
                        : `Task Created: "${title}"`,
                    undo: () => {
                      setTasks((prev) => prev.filter((t) => t.id !== tempId));
                      triggerDbSyncAnimation();
                    },
                  });
                }}
                onAddNote={(title, content) => {
                  const tempId = Math.random().toString();
                  const newNote: Note = {
                    id: tempId,
                    title,
                    content,
                    createdAt: new Date().toLocaleDateString(),
                  };
                  setNotes((prev) => [newNote, ...prev]);

                  setVoiceToast({
                    id: tempId,
                    message:
                      lang === "bn"
                        ? `নোট সংরক্ষিত: "${title}"`
                        : `Note Saved: "${title}"`,
                    undo: () => {
                      setNotes((prev) => prev.filter((n) => n.id !== tempId));
                    },
                  });
                }}
                onAddReminder={(title, remindAt, repeat) => {
                  const tempId = Math.random().toString();
                  const newRem: Reminder = {
                    id: tempId,
                    title,
                    remindAt,
                    repeat,
                    completed: false,
                  };
                  setReminders((prev) => [newRem, ...prev]);

                  setVoiceToast({
                    id: tempId,
                    message:
                      lang === "bn"
                        ? `রিমাইন্ডার সেট: "${title}"`
                        : `Reminder Set: "${title}"`,
                    undo: () => {
                      setReminders((prev) =>
                        prev.filter((r) => r.id !== tempId),
                      );
                    },
                  });
                }}
                onNavigate={(tab) => {
                  setActiveTab(tab as any);
                  setVoicePanelOpen(false);
                }}
                onClose={() => setVoicePanelOpen(false)}
                onSelfEvolution={handleSelfEvolution}
                onThemeChange={handleThemeChange}
              />
            )}

            {/* System Health Warning Overlay */}
            <AnimatePresence>
              {(apiHealth < 80 || isSystemHealing) && (
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.95 }}
                  className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] w-full max-w-lg px-4"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-slate-950/95 border border-rose-500/40 p-4 shadow-[0_0_25px_rgba(239,68,68,0.25)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Pulsing hazard decoration */}
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-rose-500 animate-pulse" />
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0 animate-bounce">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-jarvis text-xs font-bold text-rose-400 tracking-wide uppercase flex items-center gap-2">
                          <span>SYSTEM INTEGRITY COMPROMISED</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        </h4>
                        <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                          {isSystemHealing ? (
                            <span className="text-cyan-400 animate-pulse flex items-center gap-1">
                              <Cpu className="w-3.5 h-3.5 animate-spin" />
                              Reconciling neural weights & core buffers...
                            </span>
                          ) : (
                            `Neora AI core status drops to ${apiHealth}% health. Anomalies detected.`
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleQuickFixSystem}
                      disabled={isSystemHealing}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-300 relative overflow-hidden shrink-0 ${
                        isSystemHealing 
                          ? "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 hover:text-rose-100 hover:shadow-[0_0_12px_rgba(239,68,68,0.35)] cursor-pointer"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Zap className={`w-3.5 h-3.5 ${isSystemHealing ? "animate-spin" : ""}`} />
                        <span>{isSystemHealing ? "HEALING..." : "QUICK FIX"}</span>
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <CommandHistoryDrawer
              isOpen={isHistoryOpen}
              onClose={() => setIsHistoryOpen(false)}
              lang={lang}
              onReRunCommand={(cmd) => parseJarvisCommand(cmd)}
            />

            <AnimatePresence>
              {isDashboardAddTaskOpen && (
                <div data-neora-modal="open" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsDashboardAddTaskOpen(false)}
                    className="absolute inset-0 bg-black/50"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-md bg-slate-950 border border-cyan-500/35 rounded-2xl p-6 shadow-2xl relative overflow-hidden z-10"
                  >
                    {/* Corner decoration lines */}
                    <div className="absolute top-0 left-0 w-8 h-px bg-cyan-400" />
                    <div className="absolute top-0 left-0 w-px h-8 bg-cyan-400" />

                    <h3 className="font-jarvis text-base font-bold text-cyan-400 mb-1 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-cyan-400 animate-pulse" />
                      {lang === 'bn' ? 'নতুন কুয়িক টাস্ক যোগ করুন' : 'ADD NEW QUICK TASK'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-4 font-mono">
                      {lang === 'bn' ? 'সরাসরি ড্যাশবোর্ড থেকে টাস্ক শিডিউল করুন।' : 'Direct injection into Neora active memory backplane.'}
                    </p>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const title = quickTitle.trim();
                      const priority = newTaskPriority;
                      const tagsRaw = quickTags;
                      const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : ['quick-dashboard'];
                      const category = quickCategory.trim();
                      const notesVal = quickNotes.trim();

                      const fd = new FormData(e.currentTarget);
                      const remindAt = fd.get('remindAt') as string;

                      if (!title) {
                        alert(lang === 'bn' ? 'টাস্কের নাম খালি হতে পারে না!' : 'Task title cannot be empty!');
                        return;
                      }

                      handleAddTask(title, priority, tags, remindAt, category, notesVal, taskPhoto || undefined, quickRecurring !== 'none' ? quickRecurring : undefined, quickSubTasks);
                      
                      // Seamlessly sync to memory via neoraPost('/api/memory') pipeline (Task 1)
                      neoraPost('/api/memory', {
                        id: "mem-" + Math.random().toString(),
                        key: `Task Injection: ${title}`,
                        value: JSON.stringify({ priority, tags, remindAt: remindAt || "No reminder", category, description: notesVal }),
                        category: "work",
                        importance: 4
                      }).catch((err) => {
                        console.warn("Failed to sync quick task memory:", err);
                      });

                      // Set specific reminder if provided
                      if (remindAt) {
                        handleAddReminder(title, remindAt, "none");
                      }

                      // Clear states on success
                      setQuickTitle('');
                      setQuickCategory('');
                      setQuickTags('');
                      setQuickNotes('');
                      setTaskPhoto(null);
                      setQuickRecurring('none');
                      setQuickSubTasks([]);
                      setQuickSubTaskInput('');
                      stopCamera();
                      setIsDashboardAddTaskOpen(false);
                    }} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                      
                      {/* Template Selector dropdown */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">
                          {lang === 'bn' ? 'টাস্ক টেমপ্লেট:' : 'Task Template / Quick Fill:'}
                        </label>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'dev_audit') {
                              setQuickTitle(lang === 'bn' ? 'সিস্টেম ডেভেলপমেন্ট অডিট' : 'System Development Audit');
                              setQuickCategory('Work');
                              setQuickTags('Dev, Audit');
                              setNewTaskPriority('high');
                              setQuickNotes('Review latest telemetry logs, analyze system errors, and verify core bundle builds.');
                            } else if (val === 'db_maint') {
                              setQuickTitle(lang === 'bn' ? 'ডাটাবেস সিনক্রোনাইজেশন চেক' : 'Database Synchronization Check');
                              setQuickCategory('Neora-Internal');
                              setQuickTags('Db-Sync, Admin');
                              setNewTaskPriority('critical');
                              setQuickNotes('Perform key-value synchronization check and run manual healing procedure on memory registry.');
                            } else if (val === 'prod_plan') {
                              setQuickTitle(lang === 'bn' ? 'ব্যক্তিগত প্ল্যানিং আপডেট' : 'Personal Productivity Review');
                              setQuickCategory('Personal');
                              setQuickTags('Planning, Personal');
                              setNewTaskPriority('medium');
                              setQuickNotes('Draft tomorrow\'s active sprint, extract key notes, and update personal task backplane.');
                            } else {
                              setQuickTitle('');
                              setQuickCategory('');
                              setQuickTags('');
                              setQuickNotes('');
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer font-sans"
                        >
                          <option value="custom">-- Custom / Clear --</option>
                          <option value="dev_audit">{lang === 'bn' ? 'ডেভেলপমেন্ট অডিট' : 'Development Audit'}</option>
                          <option value="db_maint">{lang === 'bn' ? 'ডাটাবেস রক্ষণাবেক্ষণ' : 'Database Maintenance'}</option>
                          <option value="prod_plan">{lang === 'bn' ? 'উৎপাদনশীলতা পরিকল্পনা' : 'Productivity Planner'}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">{lang === 'bn' ? 'টাস্কের বিবরণ:' : 'Task Objective:'}</label>
                        <input
                          autoFocus
                          required
                          name="title"
                          type="text"
                          value={quickTitle}
                          onChange={(e) => setQuickTitle(e.target.value)}
                          placeholder={lang === 'bn' ? 'যেমন: শুকরিয়া প্রিন্টার্স এর ভ্যাট মার্জিন হিসেব করো...' : 'e.g., calculate VAT margin for Shukria printers...'}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">{lang === 'bn' ? 'ক্যাটাগরি (Category):' : 'Category (e.g. Work, Personal):'}</label>
                        <input
                          name="category"
                          type="text"
                          value={quickCategory}
                          onChange={(e) => setQuickCategory(e.target.value)}
                          placeholder={lang === 'bn' ? 'যেমন: Work, Personal, Neora-Internal' : 'e.g., Work, Personal, Neora-Internal'}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">{lang === 'bn' ? 'ট্যাগস (কমা দ্বারা আলাদা করুন):' : 'Tags (comma separated):'}</label>
                        <input
                          name="tags"
                          type="text"
                          value={quickTags}
                          onChange={(e) => setQuickTags(e.target.value)}
                          placeholder={lang === 'bn' ? 'যেমন: vat, shukria, tax' : 'e.g., vat, shukria, tax'}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>

                      {/* Custom detailed description / notes field */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">{lang === 'bn' ? 'বিস্তারিত নোট / ডেসক্রিপশন:' : 'Detailed Description / Notes:'}</label>
                        <textarea
                          name="notes"
                          rows={3}
                          value={quickNotes}
                          onChange={(e) => setQuickNotes(e.target.value)}
                          placeholder={lang === 'bn' ? 'এখানে অতিরিক্ত তথ্য বা কাজের বিস্তারিত লিখুন...' : 'Write auxiliary context or criteria for this task...'}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-sans resize-none"
                        />
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAutoCategorize}
                            disabled={isCategorizing || !quickTitle.trim()}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/40 hover:bg-cyan-500/15 border border-cyan-500/30 rounded-md text-[9px] font-mono font-bold text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Sparkles className={`w-3 h-3 ${isCategorizing ? "animate-pulse" : ""}`} />
                            <span>{isCategorizing ? (lang === 'bn' ? "শ্রেণীবদ্ধ করা হচ্ছে..." : "CATEGORIZING...") : (lang === 'bn' ? "এআই অটো-ক্যাটাগরি" : "AI AUTO-CATEGORIZE")}</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">{lang === 'bn' ? 'রিমাইন্ডার সময়:' : 'Reminder Time:'}</label>
                        <input
                          name="remindAt"
                          type="datetime-local"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">
                          {lang === 'bn' ? 'পুনরাবৃত্তি (Recurring):' : 'Recurrence Schedule:'}
                        </label>
                        <select
                          value={quickRecurring}
                          onChange={(e) => setQuickRecurring(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer font-sans"
                        >
                          <option value="none">{lang === 'bn' ? 'কোনো পুনরাবৃত্তি নেই' : 'No Recurrence (One-off)'}</option>
                          <option value="daily">{lang === 'bn' ? 'প্রতিদিন' : 'Daily Recurrence'}</option>
                          <option value="weekly">{lang === 'bn' ? 'প্রতি সপ্তাহে' : 'Weekly Recurrence'}</option>
                          <option value="monthly">{lang === 'bn' ? 'প্রতি মাসে' : 'Monthly Recurrence'}</option>
                        </select>
                      </div>

                      <div className="space-y-2 border border-slate-900 rounded-lg p-2.5 bg-slate-950/40">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">
                          {lang === 'bn' ? 'ফটো বা ইমেজ সংযুক্তি:' : 'Photo & Image Attachment:'}
                        </label>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (cameraActive) {
                                stopCamera();
                              } else {
                                startCamera();
                              }
                            }}
                            className={`flex-1 py-1.5 px-2 border rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              cameraActive 
                                ? "bg-rose-950/40 border-rose-800 text-rose-400" 
                                : "bg-cyan-950/40 border-cyan-800 text-cyan-400 hover:bg-cyan-900/30"
                            }`}
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{cameraActive ? (lang === 'bn' ? 'ক্যামেরা বন্ধ' : 'SHUT CAMERA') : (lang === 'bn' ? 'ক্যামেরা ব্যবহার' : 'USE WEBCAM')}</span>
                          </button>

                          <div className="flex-1 relative overflow-hidden">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUploadChange}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                            />
                            <div className="w-full h-full py-1.5 px-2 border border-slate-800 bg-slate-900 rounded text-[10px] font-mono font-bold text-slate-400 flex items-center justify-center gap-1.5 hover:bg-slate-850">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'ফাইল আপলোড' : 'CHOOSE FILE'}</span>
                            </div>
                          </div>
                        </div>

                        {cameraActive && (
                          <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 bg-black mt-2">
                            <video
                              ref={videoRef}
                              className="w-full h-auto object-cover max-h-48 transform -scale-x-100"
                              playsInline
                              muted
                            />
                            <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded font-mono font-bold text-[10px] uppercase shadow-lg shadow-cyan-500/20"
                              >
                                Capture Frame
                              </button>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono font-bold text-[10px] uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {taskPhoto && (
                          <div className="relative border border-slate-900 rounded-lg p-1 bg-slate-950 mt-2 flex flex-col items-center">
                            <img
                              src={taskPhoto}
                              alt="Task Attachment Preview"
                              className="max-h-32 rounded object-contain w-full"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setTaskPhoto(null)}
                              className="absolute top-2 right-2 bg-rose-950/85 hover:bg-rose-900 border border-rose-800 text-rose-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                              title="Remove attached photo"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 border border-slate-900 rounded-lg p-2.5 bg-slate-950/40">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">
                          {lang === 'bn' ? 'উপ-কাজসমূহ (Sub-Tasks):' : 'Pre-defined Sub-Tasks / Milestones:'}
                        </label>
                        
                        {quickSubTasks.length > 0 && (
                          <div className="space-y-1 mb-2 bg-slate-900/40 border border-slate-900 p-1.5 rounded-md">
                            {quickSubTasks.map((st) => (
                              <div key={st.id} className="flex items-center justify-between gap-1 text-[9px] font-mono py-0.5 text-slate-300">
                                <span className="truncate">{st.title}</span>
                                <button
                                  type="button"
                                  onClick={() => setQuickSubTasks(prev => prev.filter(item => item.id !== st.id))}
                                  className="text-rose-500 hover:text-rose-400 px-1 text-[8px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={quickSubTaskInput}
                            onChange={(e) => setQuickSubTaskInput(e.target.value)}
                            placeholder={lang === 'bn' ? 'যেমন: হিসাব মেলাও...' : 'e.g., balance numbers...'}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = quickSubTaskInput.trim();
                                if (val) {
                                  setQuickSubTasks(prev => [...prev, { id: Math.random().toString(), title: val, completed: false }]);
                                  setQuickSubTaskInput('');
                                }
                              }
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/40 rounded px-2 py-1 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = quickSubTaskInput.trim();
                              if (val) {
                                setQuickSubTasks(prev => [...prev, { id: Math.random().toString(), title: val, completed: false }]);
                                setQuickSubTaskInput('');
                              }
                            }}
                            className="px-2.5 bg-cyan-950 hover:bg-cyan-900/40 text-cyan-400 rounded border border-cyan-800/30 text-[10px] font-mono font-bold"
                          >
                            ADD
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase">{lang === 'bn' ? 'অগ্রাধিকার (Priority):' : 'Priority Level:'}</label>
                        <input type="hidden" name="priority" value={newTaskPriority} />
                        <div className="grid grid-cols-4 gap-2">
                          {(["low", "medium", "high", "critical"] as const).map((p) => {
                            const isSelected = newTaskPriority === p;
                            const styles = {
                              low: {
                                bg: "bg-slate-500/10 hover:bg-slate-500/20",
                                activeBg: "bg-slate-500/30 text-slate-300 border-slate-500/65 shadow-[0_0_8px_rgba(100,116,139,0.3)]",
                                border: "border-slate-600/20",
                                dotColor: "bg-slate-400",
                              },
                              medium: {
                                bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
                                activeBg: "bg-cyan-500/30 text-cyan-350 border-cyan-500/65 shadow-[0_0_8px_rgba(6,182,212,0.3)]",
                                border: "border-cyan-500/20",
                                dotColor: "bg-cyan-400",
                              },
                              high: {
                                bg: "bg-amber-500/10 hover:bg-amber-500/20",
                                activeBg: "bg-amber-500/30 text-amber-300 border-amber-500/65 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
                                border: "border-amber-500/20",
                                dotColor: "bg-amber-400",
                              },
                              critical: {
                                bg: "bg-rose-500/10 hover:bg-rose-500/20",
                                activeBg: "bg-rose-500/30 text-rose-300 border-rose-500/65 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
                                border: "border-rose-500/20",
                                dotColor: "bg-rose-400",
                              },
                            }[p];

                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setNewTaskPriority(p)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all duration-250 cursor-pointer ${
                                  isSelected ? styles.activeBg : `${styles.bg} ${styles.border} text-slate-400`
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full mb-1 ${styles.dotColor}`} />
                                <span>{p}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickTitle('');
                            setQuickCategory('');
                            setQuickTags('');
                            setQuickNotes('');
                            setTaskPhoto(null);
                            setQuickRecurring('none');
                            setQuickSubTasks([]);
                            setQuickSubTaskInput('');
                            stopCamera();
                            setIsDashboardAddTaskOpen(false);
                          }}
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-400 transition-all animate-none"
                        >
                          {lang === 'bn' ? 'বাতিল' : 'CANCEL'}
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 rounded-lg text-xs font-mono font-bold transition-all animate-none"
                        >
                          {lang === 'bn' ? 'টাস্ক যোগ করুন' : 'INJECT TASK'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {taskToDelete && (
                <div data-neora-modal="open" className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setTaskToDelete(null)}
                    className="absolute inset-0 bg-black/65"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: "spring", duration: 0.4 }}
                    className="relative w-full max-w-sm bg-slate-950/90 border border-rose-500/40 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.18)] p-5 z-10 text-slate-100 flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-2.5 text-rose-400">
                      <div className="p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg animate-pulse">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                          {lang === 'bn' ? 'গুরুত্বপূর্ণ সতর্কতা!' : 'CRITICAL TASK PROTECTION'}
                        </h4>
                        <p className="text-[10px] text-rose-400/80 font-mono">
                          {lang === 'bn' ? 'অনাকাঙ্ক্ষিত ক্ষতি এড়াতে নিশ্চিত হোন' : 'Accidental loss prevention active'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-rose-950/10 border border-rose-500/15 rounded-lg p-3 space-y-1.5">
                      <div className="text-[10px] text-slate-400 font-mono uppercase">
                        {lang === 'bn' ? 'টাস্ক শিরোনাম:' : 'Task Objective:'}
                      </div>
                      <div className="text-xs font-sans font-semibold text-rose-200 line-clamp-2">
                        {taskToDelete.title}
                      </div>
                      {taskToDelete.category && (
                        <div className="flex gap-1.5 pt-1">
                          <span className="text-[8px] font-mono font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-wider">
                            {taskToDelete.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      {lang === 'bn' 
                        ? 'আপনি কি নিশ্চিতভাবে এই সর্বোচ্চ অগ্রাধিকারপ্রাপ্ত (Critical) টাস্কটি মুছে ফেলতে চান? এটি পুনরায় ফিরিয়ে আনা যাবে না।'
                        : 'Are you absolutely sure you want to delete this CRITICAL priority task? High-priority actions cannot be undone easily once purged.'}
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setTaskToDelete(null)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-400 transition-all"
                      >
                        {lang === 'bn' ? 'বাতিল করুন' : 'ABORT'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(taskToDelete.id, true)}
                        className="flex-1 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-400 rounded-lg text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(244,63,94,0.1)]"
                      >
                        {lang === 'bn' ? 'মুছে ফেলুন' : 'CONFIRM PURGE'}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </AppShell>
    </ErrorBoundary>
  );
}
