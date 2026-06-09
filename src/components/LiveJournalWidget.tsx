import React, { useState, useEffect, useRef } from 'react';
import { Activity, Radio, Trash2 } from 'lucide-react';
import { neoraGet } from '../lib/neoraApi';

interface LogLine {
  id: string;
  raw: string;
  time: string;
  tag: string;
  tagColor: string;
  msg: string;
  glow: string;
}

function parseLog(raw: string, index: number): LogLine {
  const timeMatch = raw.match(/^\[([^\]]+)\]/);
  const time = timeMatch ? timeMatch[1] : '';

  let tag = 'INFO';
  let tagColor = '#00d4ff';
  let glow = 'rgba(0,212,255,0.15)';

  const lower = raw.toLowerCase();
  if (lower.includes('error') || lower.includes('fail')) {
    tag = 'ERROR'; tagColor = '#ff4466'; glow = 'rgba(255,68,102,0.12)';
  } else if (lower.includes('warn') || lower.includes('stale')) {
    tag = 'WARN'; tagColor = '#f5a623'; glow = 'rgba(245,166,35,0.12)';
  } else if (lower.includes('[client pc]') || lower.includes('fetched command')) {
    tag = 'CLIENT'; tagColor = '#1a9fff'; glow = 'rgba(26,159,255,0.12)';
  } else if (lower.includes('watchdog') || lower.includes('requeued')) {
    tag = 'WATCHDOG'; tagColor = '#f5a623'; glow = 'rgba(245,166,35,0.12)';
  } else if (lower.includes('recovery') || lower.includes('auto-saved')) {
    tag = 'BACKUP'; tagColor = '#00ff88'; glow = 'rgba(0,255,136,0.12)';
  } else if (lower.includes('gemini') || lower.includes('compiled')) {
    tag = 'AGENT'; tagColor = '#a78bfa'; glow = 'rgba(167,139,250,0.12)';
  } else if (lower.includes('completed') || lower.includes('success')) {
    tag = 'OK'; tagColor = '#00ff88'; glow = 'rgba(0,255,136,0.12)';
  }

  const msg = raw.replace(/^\[[^\]]+\]\s*/, '').replace(/^\[Client PC\]\s*/i, '');

  return { id: `${index}-${raw.slice(0, 20)}`, raw, time, tag, tagColor, glow, msg };
}

interface Props {
  className?: string;
}

export function LiveJournalWidget({ className = '' }: Props) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [live, setLive] = useState(true);
  const [blink, setBlink] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        const data: any = await neoraGet('/api/os/status');
        if (cancelled) return;
        const rawLogs: string[] = data?.logs ?? [];
        const parsed = rawLogs.map((r, i) => parseLog(r, i));
        setLogs(parsed);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    };

    fetch();
    const timer = setInterval(fetch, 3000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [live]);

  useEffect(() => {
    if (logs.length !== prevCountRef.current) {
      prevCountRef.current = logs.length;
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [logs]);

  const displayed = logs.slice(-20);

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{
      background: 'linear-gradient(135deg, rgba(0,8,20,0.95) 0%, rgba(0,4,14,0.9) 100%)',
      border: '1px solid rgba(0,212,255,0.14)',
      boxShadow: 'inset 0 0 30px rgba(0,212,255,0.02), 0 4px 20px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Top glow bar */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }} />
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-6 h-px" style={{ background: '#00d4ff' }} />
      <div className="absolute top-0 left-0 w-px h-6" style={{ background: '#00d4ff' }} />
      <div className="absolute bottom-0 right-0 w-6 h-px" style={{ background: 'rgba(0,212,255,0.3)' }} />
      <div className="absolute bottom-0 right-0 w-px h-6" style={{ background: 'rgba(0,212,255,0.3)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(0,212,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3" style={{ color: '#00d4ff' }} />
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(0,212,255,0.7)' }}>
            SYSTEM JOURNAL
          </span>
          {/* LIVE badge */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{
            background: live ? 'rgba(0,255,136,0.08)' : 'rgba(100,116,139,0.08)',
            border: `1px solid ${live ? 'rgba(0,255,136,0.25)' : 'rgba(100,116,139,0.15)'}`,
          }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: live ? '#00ff88' : '#64748b',
              boxShadow: live && blink ? '0 0 4px #00ff88' : 'none',
              transition: 'box-shadow 0.4s',
            }} />
            <span className="text-[9px] font-mono font-bold" style={{ color: live ? '#00ff88' : '#64748b' }}>
              {live ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          {error && (
            <span className="text-[9px] font-mono" style={{ color: '#ff4466' }}>NO SIGNAL</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLive(v => !v)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all"
            style={{
              background: live ? 'rgba(0,212,255,0.08)' : 'rgba(245,166,35,0.08)',
              border: `1px solid ${live ? 'rgba(0,212,255,0.2)' : 'rgba(245,166,35,0.2)'}`,
              color: live ? '#00d4ff' : '#f5a623',
            }}
          >
            <Radio className="w-2.5 h-2.5" />
            {live ? 'PAUSE' : 'RESUME'}
          </button>
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono transition-all"
            style={{ background: 'rgba(255,68,102,0.06)', border: '1px solid rgba(255,68,102,0.15)', color: 'rgba(255,68,102,0.6)' }}
            title="Clear journal"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Log stream */}
      <div
        ref={scrollRef}
        className="overflow-y-auto font-mono text-[10px] space-y-px"
        style={{ height: 160, scrollBehavior: 'smooth' }}
      >
        {displayed.length === 0 ? (
          <div className="flex items-center justify-center h-full" style={{ color: 'rgba(0,212,255,0.25)' }}>
            <span className="tracking-widest text-[9px]">— AWAITING SIGNAL —</span>
          </div>
        ) : (
          displayed.map((line, i) => (
            <div
              key={line.id}
              className="flex items-start gap-2 px-3 py-1 transition-all"
              style={{
                background: i === displayed.length - 1 ? line.glow : 'transparent',
                borderLeft: i === displayed.length - 1 ? `2px solid ${line.tagColor}` : '2px solid transparent',
              }}
            >
              {/* Timestamp */}
              <span className="shrink-0 text-[9px] tabular-nums" style={{ color: 'rgba(100,116,139,0.6)', minWidth: 72 }}>
                {line.time}
              </span>
              {/* Tag */}
              <span
                className="shrink-0 px-1 py-px rounded text-[8px] font-bold tracking-wider"
                style={{
                  background: `${line.tagColor}18`,
                  border: `1px solid ${line.tagColor}35`,
                  color: line.tagColor,
                  minWidth: 44,
                  textAlign: 'center',
                }}
              >
                {line.tag}
              </span>
              {/* Message */}
              <span className="text-[10px] leading-snug break-words min-w-0" style={{ color: 'rgba(186,217,240,0.75)' }}>
                {line.msg}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
        <span className="text-[9px] font-mono" style={{ color: 'rgba(0,212,255,0.3)' }}>
          {logs.length} entries · polling /api/os/status
        </span>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full" style={{ background: error ? '#ff4466' : '#00ff88', animation: 'glow-pulse 2s infinite' }} />
          <span className="text-[9px] font-mono" style={{ color: error ? '#ff4466' : 'rgba(0,255,136,0.5)' }}>
            {error ? 'OFFLINE' : 'CONNECTED'}
          </span>
        </div>
      </div>
    </div>
  );
}
