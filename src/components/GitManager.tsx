import React, { useState, useEffect } from 'react';
import { RefreshCw, GitBranch, Shield, ArrowUpCircle, ArrowDownCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { neoraGet, neoraPost } from '../lib/neoraApi';

interface GitStatusData {
  branch: string;
  ahead: number;
  behind: number;
  dirty: boolean;
  conflicts: string[];
  unstaged: string[];
  staged: string[];
  remoteUrl: string;
  lastFetched: string;
}

interface GitManagerProps {
  lang: 'en' | 'bn';
}

export const GitManager: React.FC<GitManagerProps> = ({ lang }) => {
  const [status, setStatus] = useState<GitStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res: any = await neoraGet('/api/git/status');
      if (res.status === 'success' && res.data) {
        setStatus(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const runAction = async (action: 'fetch' | 'pull' | 'push' | 'stash_sync' | 'force_sync') => {
    try {
      setSyncing(true);
      setFeedback(lang === 'bn' ? 'অপারেশন চলছে...' : 'Invoking remote operation...');
      const res: any = await neoraPost('/api/git/action', { action, branch: status?.branch || 'main' });
      if (res.status === 'success') {
        setFeedback(`✓ ${res.message || 'Operation succeeded'}`);
        await fetchStatus();
      } else {
        setFeedback(`✗ Failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setFeedback(`✗ Error: ${err.message || 'Connection lost'}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  return (
    <div id="git-manager" className="space-y-6">
      {/* Header card with health indicator */}
      <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg">
              <GitBranch className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-200">
                {lang === 'bn' ? 'ডেভ স্টুডিও গিট স্বাস্থ্য কেন্দ্র' : 'DevStudio Git Core Health'}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {status?.remoteUrl ? `origin: ${status.remoteUrl}` : 'No remote origin detected'}
              </p>
            </div>
          </div>
        </div>

        {/* Sync actions status */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500">{lang === 'bn' ? 'সর্বশেষ যাচাই করা হয়েছে:' : 'Last scanned:'}</span>
          <span className="text-slate-350 bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
            {status ? new Date(status.lastFetched).toLocaleTimeString() : 'scanning...'}
          </span>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-850 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 text-xs font-mono rounded-lg border text-center ${
          feedback.startsWith('✓') 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
        }`}>
          {feedback}
        </div>
      )}

      {/* Grid of details & quick buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sync Diagnostics Card */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-850 pb-2">
            {lang === 'bn' ? '১. রেপো রিলেশনশিপ' : '1. Repo Relationship'}
          </h3>
          
          <div className="space-y-3 font-mono">
            {/* Branch Card */}
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
              <span className="text-slate-500 text-xs">Active Branch</span>
              <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {status?.branch || 'main'}
              </span>
            </div>

            {/* Commits Ahead */}
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <ArrowUpCircle className="h-3.5 w-3.5 text-cyan-400" /> Commit Ahead
              </span>
              <span className={`text-xs ${status && status.ahead > 0 ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                {status ? status.ahead : 0} {status && status.ahead === 1 ? 'commit' : 'commits'}
              </span>
            </div>

            {/* Commits Behind */}
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <ArrowDownCircle className="h-3.5 w-3.5 text-indigo-400" /> Commit Behind
              </span>
              <span className={`text-xs ${status && status.behind > 0 ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                {status ? status.behind : 0} {status && status.behind === 1 ? 'commit' : 'commits'}
              </span>
            </div>
          </div>
        </div>

        {/* Tree State Status files */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-850 pb-2">
            {lang === 'bn' ? '২. ওয়ার্কিং স্ট্যাটাস' : '2. Working Status'}
          </h3>

          <div className="space-y-3 font-mono">
            {/* Status light */}
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
              <span className="text-slate-500 text-xs">Repository Health</span>
              {status?.conflicts && status.conflicts.length > 0 ? (
                <span className="text-[10px] px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-450 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping" />
                  Conflicts
                </span>
              ) : status?.dirty ? (
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full flex items-center gap-1">
                  Dirty changes
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 border border-emerald-505/30 text-emerald-400 rounded-full flex items-center gap-1">
                  ✓ Clean & safe
                </span>
              )}
            </div>

            {/* Conflict Alert detail block if any */}
            {status?.conflicts && status.conflicts.length > 0 ? (
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1.5">
                <p className="text-[10px] text-rose-350 font-bold flex items-center gap-1 leading-none">
                  <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                  CONFLICT FILES DETECTED
                </p>
                <div className="max-h-[100px] overflow-y-auto text-[9px] text-rose-300 space-y-1">
                  {status.conflicts.map((file, idx) => (
                    <div key={idx} className="bg-slate-950/40 p-1 border border-rose-950/60 rounded truncate">🚨 {file}</div>
                  ))}
                </div>
              </div>
            ) : status?.staged && (status.staged.length > 0 || status.unstaged.length > 0) ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/60 text-[10px] space-y-1 text-slate-400 max-h-[150px] overflow-y-auto">
                <span className="block text-[8px] uppercase font-bold text-slate-500 mb-1.5">Modified files track:</span>
                {status.staged.map((f, i) => (
                  <div key={i} className="text-emerald-400 truncate">✓ staged: {f}</div>
                ))}
                {status.unstaged.map((f, i) => (
                  <div key={i} className="text-amber-400 truncate">✎ unstaged: {f}</div>
                ))}
              </div>
            ) : (
              <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-850 rounded-xl text-center text-slate-500 text-xs">
                <CheckCircle className="h-6 w-6 text-slate-600 mb-1" />
                No modified file nodes pending checkout.
              </div>
            )}
          </div>
        </div>

        {/* Sync control block */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-850 pb-2">
            {lang === 'bn' ? '৩. অটোমেশন কমান্ড' : '3. Git Sync Actions'}
          </h3>

          <div className="space-y-2 select-none">
            <button
              onClick={() => runAction('fetch')}
              disabled={syncing}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs text-slate-200 transition font-mono cursor-pointer"
            >
              <span>📥 Fetch Updates</span>
              <span className="text-[9px] text-slate-500">git fetch</span>
            </button>

            <button
              onClick={() => runAction('stash_sync')}
              disabled={syncing}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-855 border border-slate-850 rounded-xl text-xs text-cyan-400 transition font-mono cursor-pointer"
            >
              <span className="text-left font-bold">💼 Pop Safe Sync</span>
              <span className="text-[9px] text-slate-505">stash & pull</span>
            </button>

            <button
              onClick={() => runAction('force_sync')}
              disabled={syncing}
              className="w-full flex items-center justify-between px-3 py-2 bg-red-950/30 hover:bg-red-955/50 border border-red-900/40 rounded-xl text-xs text-rose-455 transition font-mono cursor-pointer"
              title="Force sync destroys all local uncommitted and conflict codes!"
            >
              <span className="text-left font-bold">🔥 Force Overwrite</span>
              <span className="text-[9px] text-slate-500">reset --hard</span>
            </button>

            <p className="text-[8px] text-slate-500 font-mono text-center pt-2">
              Sync methods execute system child process bindings securely.
            </p>
          </div>
        </div>
      </div>

      {/* Bilingual Instruction manual specifically targeting conflicts */}
      <div className="bg-slate-900/40 border border-slate-905 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-850 pb-2">
          <Shield className="h-4 w-4 text-cyan-400 animate-pulse" />
          {lang === 'bn' ? 'মার্জ কনফ্লিক্ট সমাধানের নির্দেশাবলী' : 'Merge Conflict Resolving Playbook'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed select-text text-xs">
          {/* Bengali Panel */}
          <div className="p-4 bg-slate-955 border border-slate-850/60 rounded-xl space-y-2">
            <h4 className="font-bold text-amber-300 font-mono text-[10px] uppercase tracking-wider border-b border-slate-850/60 pb-1.5">ম্যানুয়াল সমাধান নির্দেশিকা (বাংলা)</h4>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300 font-sans">
              <li>টার্মিনালে <code className="text-cyan-400 font-mono text-[10px]">git diff --name-only --diff-filter=U</code> দিয়ে কনফ্লিক্ট ফাইল চিহ্নিত করুন।</li>
              <li>চিহ্নিত ফাইল খুললে সেখানে ৩টি অংশ পাবেন: বর্তমান শাখা হেড কোড (<code className="font-mono text-rose-400">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code>), রিমোট মার্জিং কোড (<code className="font-mono text-cyan-400">&gt;&gt;&gt;&gt;&gt;&gt;&gt; remote</code>), এবং সেপারেটর (<code className="font-mono text-slate-500">=======</code>)।</li>
              <li>আপনার কাঙ্ক্ষিত পরিবর্তনটুকু রেখে হেডার, ফুটার এবং সেপারেটর মার্কার লাইনগুলো ডিলিট করে ড্রাফ্ট ফাইল সেভ করুন।</li>
              <li>এবার সিঙ্ক রানিং করতে <code className="text-emerald-400 font-mono text-[10px]">git add filename</code> এবং <code className="text-emerald-400 font-mono text-[10px]">git commit -m "resolved"</code> কমান্ড রান করুন!</li>
            </ul>
          </div>

          {/* English Panel */}
          <div className="p-4 bg-slate-955 border border-slate-850/60 rounded-xl space-y-2">
            <h4 className="font-bold text-amber-300 font-mono text-[10px] uppercase tracking-wider border-b border-slate-855/60 pb-1.5 font-sans">Manual Conflict Playbook (English)</h4>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300 font-sans font-medium">
              <li>Evaluate all troubled files by tracking the <span className="text-amber-400 font-mono">Both Modified</span> status codes.</li>
              <li>Merge markers (<code className="font-mono text-rose-450">&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>) surround conflicted blocks. Check both code paths carefully.</li>
              <li>Stitch or keep the desired logic, erase the three markdown markers wholly and save the workspace.</li>
              <li>Stage changes utilizing <code className="text-emerald-405 font-mono text-[10px]">git add &lt;file&gt;</code>, then wrap up with <code className="text-emerald-405 font-mono text-[10px]">git commit -m "commit resolved tags"</code> to resume push.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
