import React, { useState, useEffect } from 'react';
import { neoraPost } from '../lib/neoraApi';
import { Tv, Play, Pause, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface TvViewProps {
  lang: 'en' | 'bn';
}

const TV_CHANNELS = [
  { id: 'tv8bihar', name: 'TV8 Bihar', nameBn: 'টিভি৮ বিহার', url: 'https://www.tv8bihar.com', category: 'news' },
  { id: 'sonyliv', name: 'SonyLIV', nameBn: 'সোনিলিভ', url: 'https://www.sonyliv.com', category: 'sports' },
  { id: 'hotstar', name: 'Disney+ Hotstar', nameBn: 'হটস্টার', url: 'https://www.hotstar.com', category: 'sports' },
  { id: 'espn', name: 'ESPN', nameBn: 'এসপিএসএন', url: 'https://www.espn.in', category: 'sports' },
  { id: 'youtube', name: 'YouTube', nameBn: 'ইউটিউব', url: 'https://www.youtube.com', category: 'entertainment' },
  { id: 'bdnews', name: 'BD News 24', nameBn: 'বিডি নিউজ', url: 'https://www.bdnews24.com', category: 'news' },
];

export function TvView({ lang }: TvViewProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>('sonyliv');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
     setLastRefresh(new Date().toLocaleTimeString());
   }, []);

   const handleOpenChannel = async () => {
     setIsLoading(true);
     try {
       const channel = TV_CHANNELS.find(c => c.id === selectedChannel);
       if (channel) {
         await neoraPost('/api/os/command', { prompt: channel.url });
       }
     } catch (err) {
       console.error('Failed to open channel:', err);
     } finally {
       setIsLoading(false);
     }
   };

   const triggerVoiceCommand = async (channel: string) => {
     const cmd = channel === 'fifa' || channel === 'football'
       ? (lang === 'bn' ? 'ফুটবল ম্যাচ দেখাও' : 'open football match')
       : (lang === 'bn' ? 'টিভি চালু করো' : 'open tv');
     try {
       await neoraPost('/api/os/command', { prompt: cmd });
     } catch (err) {
       console.error('Voice command failed:', err);
     }
   };

   const refreshStatus = () => {
     setLastRefresh(new Date().toLocaleTimeString());
     setIsPlaying(prev => !prev);
   };

   return (
     <div className="flex flex-col h-full p-4 overflow-y-auto" style={{ background: '#000814', color: '#cce8ff', minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Tv className="w-6 h-6" style={{ color: '#00d4ff' }} />
        <h2 className="font-jarvis text-xl font-bold" style={{ color: '#00d4ff' }}>
          {lang === 'bn' ? 'লিভ টিভি স্ট্রিমিং' : 'LIVE TV STREAMING'}
        </h2>
<div className="text-[10px] font-mono" style={{ color: 'rgba(0,212,255,0.5)' }}>
           {lastRefresh && `Last refresh: ${lastRefresh}`}
         </div>
      </div>

      {/* Channel Selector */}
      <div className="mb-4">
        <label className="block text-[10px] font-mono mb-2" style={{ color: 'rgba(0,212,255,0.7)' }}>
          {lang === 'bn' ? 'চ্যানেল নির্বাচন' : 'SELECT CHANNEL'}
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {TV_CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className="p-3 rounded-lg text-xs font-mono transition-all"
              style={{
                background: selectedChannel === channel.id ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.05)',
                border: selectedChannel === channel.id ? '1px solid rgba(0,212,255,0.5)' : '1px solid rgba(0,212,255,0.1)',
                color: selectedChannel === channel.id ? '#00d4ff' : 'rgba(186,240,210,0.6)',
              }}
            >
              {lang === 'bn' ? channel.nameBn : channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleOpenChannel}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold"
          style={{
            background: isLoading ? 'rgba(100,116,139,0.3)' : 'rgba(0,255,136,0.15)',
            border: '1px solid rgba(0,255,136,0.3)',
            color: '#00ff88',
          }}
        >
          {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          {lang === 'bn' ? 'চ্যানেল খুলো' : 'OPEN CHANNEL'}
        </button>

        <button
          onClick={() => triggerVoiceCommand('tv')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono"
          style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: 'rgba(0,212,255,0.8)',
          }}
        >
          🎙️ {lang === 'bn' ? 'ভয়েস কমান্ড' : 'VOICE CMD'}
        </button>

        <button
          onClick={refreshStatus}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono"
          style={{
            background: 'rgba(245,166,35,0.1)',
            border: '1px solid rgba(245,166,35,0.3)',
            color: '#f5a623',
          }}
        >
          <RefreshCw className="w-3 h-3" />
          {lang === 'bn' ? 'রিফ্রেশ' : 'REFRESH'}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => triggerVoiceCommand('fifa')}
          className="p-3 rounded-lg text-xs font-mono"
          style={{
            background: 'rgba(0,100,255,0.1)',
            border: '1px solid rgba(0,100,255,0.3)',
            color: '#00d4ff',
          }}
        >
          ⚽ FIFA World Cup 2026
        </button>
        <button
          onClick={() => triggerVoiceCommand('football')}
          className="p-3 rounded-lg text-xs font-mono"
          style={{
            background: 'rgba(0,100,255,0.1)',
            border: '1px solid rgba(0,100,255,0.3)',
            color: '#00d4ff',
          }}
        >
          🏆 Live Football
        </button>
      </div>

      {/* Status */}
      <div className="mt-auto p-3 rounded-lg" style={{
        background: 'rgba(0,20,10,0.5)',
        border: '1px solid rgba(0,255,136,0.2)',
      }}>
        <div className="text-[10px] font-mono" style={{ color: 'rgba(0,255,136,0.7)' }}>
          {lang === 'bn' ? 'বর্তমান স্টেটাস' : 'CURRENT STATUS'}
        </div>
        <div className="text-sm mt-1" style={{ color: '#00ff88' }}>
          {isPlaying ? '▶ Playing' : '⏸ Paused'} • {isMuted ? '🔇 Muted' : '🔊 Audio'}
        </div>
      </div>
    </div>
  );
}