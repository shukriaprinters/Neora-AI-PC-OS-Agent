import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Info, Zap, Bell } from 'lucide-react';
import { neoraGet } from '../lib/neoraApi';
import { Reminder } from '../types';

export type NotiType = 'info' | 'success' | 'warn' | 'critical';

interface Notification {
  id: string;
  type: NotiType;
  title: string;
  body: string;
  ts: number;
}

interface Props {
  reminders: Reminder[];
  apiHealth: number;
  tasks?: { length: number };
  lang?: 'en' | 'bn';
}

const TYPE_STYLES: Record<NotiType, { border: string; bg: string; glow: string; color: string; barColor: string }> = {
  info:     { border: 'rgba(0,212,255,0.3)',   bg: 'rgba(0,212,255,0.07)',  glow: 'rgba(0,212,255,0.15)',   color: '#00d4ff', barColor: '#00d4ff' },
  success:  { border: 'rgba(0,255,136,0.3)',   bg: 'rgba(0,255,136,0.07)',  glow: 'rgba(0,255,136,0.15)',   color: '#00ff88', barColor: '#00ff88' },
  warn:     { border: 'rgba(245,166,35,0.35)', bg: 'rgba(245,166,35,0.08)', glow: 'rgba(245,166,35,0.15)',  color: '#f5a623', barColor: '#f5a623' },
  critical: { border: 'rgba(255,68,102,0.4)',  bg: 'rgba(255,68,102,0.09)', glow: 'rgba(255,68,102,0.18)',  color: '#ff4466', barColor: '#ff4466' },
};

const TYPE_ICONS: Record<NotiType, React.ReactNode> = {
  info:     <Info className="w-4 h-4" />,
  success:  <CheckCircle2 className="w-4 h-4" />,
  warn:     <AlertTriangle className="w-4 h-4" />,
  critical: <Zap className="w-4 h-4" />,
};

const AUTO_DISMISS_MS = 6000;

function ToastItem({ n, onDismiss }: { n: Notification; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const s = TYPE_STYLES[n.type];

  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
      setProgress(pct);
      if (pct > 0) requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);
    const timer = setTimeout(() => onDismiss(n.id), AUTO_DISMISS_MS);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, [n.id, onDismiss]);

  return (
    <motion.div
      key={n.id}
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="relative overflow-hidden rounded-xl w-80"
      style={{
        background: `linear-gradient(135deg, rgba(0,6,18,0.97) 0%, rgba(0,3,12,0.95) 100%)`,
        border: `1px solid ${s.border}`,
        boxShadow: `0 0 0 1px ${s.glow}, 0 8px 30px rgba(0,0,0,0.7), 0 0 20px ${s.glow}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-px" style={{ background: s.color }} />
      <div className="absolute top-0 left-0 w-px h-4" style={{ background: s.color }} />

      <div className="flex items-start gap-3 p-3.5 pr-8">
        <div className="shrink-0 mt-0.5" style={{ color: s.color, filter: `drop-shadow(0 0 4px ${s.color})` }}>
          {TYPE_ICONS[n.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono font-bold mb-0.5 uppercase tracking-wider" style={{ color: s.color }}>
            {n.title}
          </div>
          <div className="text-[11px] font-mono leading-snug" style={{ color: 'rgba(186,217,240,0.75)' }}>
            {n.body}
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(n.id)}
        className="absolute top-2.5 right-2.5 p-1 rounded transition-colors hover:bg-white/10"
        style={{ color: 'rgba(148,163,184,0.5)' }}
      >
        <X className="w-3 h-3" />
      </button>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full rounded-full transition-none"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${s.barColor}60, ${s.barColor})`,
            boxShadow: `0 0 4px ${s.barColor}`,
          }}
        />
      </div>
    </motion.div>
  );
}

export function NeoraNotifications({ reminders, apiHealth, lang = 'en' }: Props) {
  const [notes, setNotes] = useState<Notification[]>([]);
  const prevHistoryLen = useRef<number>(-1);
  const prevHealth = useRef<number>(apiHealth);
  const firedReminderIds = useRef<Set<string>>(new Set());
  const notifiedHealthDrop = useRef(false);

  const push = useCallback((n: Omit<Notification, 'id' | 'ts'>) => {
    setNotes(prev => {
      const entry: Notification = { ...n, id: `${Date.now()}-${Math.random()}`, ts: Date.now() };
      return [...prev.slice(-4), entry];
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  // Listen for Neora Skill update events (both manual and auto-updates)
  useEffect(() => {
    const handleSkillUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ skill: any; isAuto?: boolean }>;
      if (!customEvent.detail || !customEvent.detail.skill) return;
      const { skill, isAuto } = customEvent.detail;
      
      const isBn = lang === 'bn';
      const title = isAuto 
        ? (isBn ? 'স্বয়ংক্রিয় স্কিল আপডেট' : 'AUTO SKILL INTEGRATION')
        : (isBn ? 'ম্যানুয়াল স্কিল আপডেট' : 'CUSTOM SKILL COMPILED');
      
      const body = isBn 
        ? `নিওরা কোর ইঞ্জিনে নতুন স্কিল "${skill.name}" সফলভাবে যুক্ত ও সক্রিয় করা হয়েছে!`
        : `Dynamic skill "${skill.name}" has been successfully compiled and activated on Neora's core.`;

      push({
        type: 'success',
        title,
        body,
      });
    };

    window.addEventListener("neora-skills-updated", handleSkillUpdated);
    return () => window.removeEventListener("neora-skills-updated", handleSkillUpdated);
  }, [lang, push]);

  // Listen for generic Neora custom notifications
  useEffect(() => {
    const handleGenericNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; message?: string; body?: string; type?: NotiType }>;
      if (!customEvent.detail) return;
      const { title, message, body, type } = customEvent.detail;
      push({
        type: type || 'info',
        title: title || 'NOTIFICATION',
        body: message || body || '',
      });
    };

    window.addEventListener("neora-notification", handleGenericNotification);
    return () => window.removeEventListener("neora-notification", handleGenericNotification);
  }, [push]);

  // Poll OS status for completed tasks
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const data: any = await neoraGet('/api/os/status');
        if (cancelled) return;
        const histLen: number = data?.history?.length ?? 0;
        if (prevHistoryLen.current >= 0 && histLen > prevHistoryLen.current) {
          const newest = data.history[data.history.length - 1];
          const label = newest?.prompt ? `"${newest.prompt.slice(0, 40)}"` : 'Task';
          const st = newest?.status === 'failed' ? 'critical' : 'success';
          push({
            type: st,
            title: st === 'success' ? 'TASK COMPLETED' : 'TASK FAILED',
            body: `${label} — ${st === 'success' ? 'executed successfully' : 'execution failed, check OS Agent'}`,
          });
        }
        prevHistoryLen.current = histLen;
      } catch { /* server might be warming up */ }
    };
    poll();
    const t = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, [push]);

  // Watch API health drops
  useEffect(() => {
    if (prevHealth.current > 0 && apiHealth === 0 && !notifiedHealthDrop.current) {
      notifiedHealthDrop.current = true;
      push({ type: 'critical', title: 'SYSTEM OFFLINE', body: 'Neora server is not responding. Check connection.' });
    }
    if (apiHealth > 0) notifiedHealthDrop.current = false;
    prevHealth.current = apiHealth;
  }, [apiHealth, push]);

  // Check reminder due times
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      reminders.forEach(r => {
        if (r.completed || firedReminderIds.current.has(r.id)) return;
        const due = new Date(r.remindAt).getTime();
        if (due > 0 && Math.abs(now - due) < 60000) {
          firedReminderIds.current.add(r.id);
          push({ type: 'warn', title: 'REMINDER DUE', body: r.title });
        }
      });
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, [reminders, push]);

  // Startup ping
  useEffect(() => {
    const t = setTimeout(() => {
      push({ type: 'info', title: 'NEORA ONLINE', body: 'Neural interface initialized. All systems operational.' });
    }, 1500);
    return () => clearTimeout(t);
  }, [push]);

  if (notes.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 z-[90] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="sync">
        {notes.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <ToastItem n={n} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
