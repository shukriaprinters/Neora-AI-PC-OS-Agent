import React, { useState } from 'react';
import { Task, Reminder, Note, Memory } from '../types';
import { TRANSLATIONS } from '../translations';
import {
  CheckSquare, Plus, Trash2, Bell, Clipboard, MessageSquare, BookOpen, Volume2,
  Calendar, Star, AlertCircle, FileText, CheckCircle, Lightbulb
} from 'lucide-react';

interface OrganizerViewProps {
  lang: 'en' | 'bn';
  tasks: Task[];
  reminders: Reminder[];
  notes: Note[];
  memories: Memory[];
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
  onAddReminder: (title: string, remindAt: string, repeat: 'none' | 'daily' | 'weekly' | 'monthly') => void;
  onAddNote: (title: string, content: string) => void;
  onAddMemory: (key: string, value: string, category: 'personal' | 'work' | 'preference' | 'skill', importance: number) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDeleteMemory: (id: string) => void;
}

export function OrganizerView({
  lang,
  tasks,
  reminders,
  notes,
  memories,
  onAddTask,
  onAddReminder,
  onAddNote,
  onAddMemory,
  onToggleTask,
  onDeleteTask,
  onToggleReminder,
  onDeleteReminder,
  onDeleteNote,
  onDeleteMemory
}: OrganizerViewProps) {
  const t = TRANSLATIONS[lang];
  const [activeSubTab, setActiveSubTab] = useState<'briefing' | 'tasks' | 'reminders' | 'notes' | 'memories'>('briefing');

  // Input states
  const [taskVal, setTaskVal] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  const [reminderVal, setReminderVal] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [reminderRepeat, setReminderRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [memoryKey, setMemoryKey] = useState('');
  const [memoryVal, setMemoryVal] = useState('');
  const [memoryCat, setMemoryCat] = useState<'personal' | 'work' | 'preference' | 'skill'>('preference');
  const [memoryImp, setMemoryImp] = useState<number>(3);

  // Bengali Date helper
  const getBengaliDate = () => {
    const d = new Date();
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const convertNumbers = (numStr: string) => {
      const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return numStr.split('').map(char => {
        const parsed = parseInt(char);
        return isNaN(parsed) ? char : bnNums[parsed];
      }).join('');
    };

    const dayName = days[d.getDay()];
    const dateNum = convertNumbers(d.getDate().toString());
    const monthName = months[d.getMonth()];
    const yearNum = convertNumbers(d.getFullYear().toString());

    return `${dayName}, ${dateNum} ${monthName} ${yearNum}`;
  };

  const getBriefingText = () => {
    const formattedDate = lang === 'bn' ? getBengaliDate() : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const pendingTasks = tasks.filter(x => !x.completed);
    const scheduledReminders = reminders.filter(x => !x.completed);

    let contentStr = '';
    if (lang === 'bn') {
      contentStr = `শুভ সকাল বস! আজ ${formattedDate}। আপনার ওয়ার্কস্পেস ড্যাশবোর্ডে বর্তমানে ${pendingTasks.length}টি পেন্ডিং টাস্ক এবং ${scheduledReminders.length}টি রিমাইন্ডার ওয়েট করছে। চলুন আজকের দিনটি উৎপাদনশীল করি!`;
    } else {
      contentStr = `Good morning, boss. Today is ${formattedDate}. You have ${pendingTasks.length} active database tasks pending and ${scheduledReminders.length} alarms scheduled in your core repository registry. Let's make today highly productive.`;
    }
    return contentStr;
  };

  const speakBriefing = () => {
    const text = getBriefingText();
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = 1.0;
      synth.speak(utterance);
    }
  };

  return (
    <div id="organizer-section" className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sub tabs configuration controller */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 shrink-0 flex items-center justify-between overflow-x-auto gap-3">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveSubTab('briefing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'briefing' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{t.briefingTitle.toUpperCase()}</span>
          </button>
          <button
            id="subtab-btn-tasks"
            onClick={() => setActiveSubTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'tasks' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>TASKS</span>
          </button>
          <button
            id="subtab-btn-reminders"
            onClick={() => setActiveSubTab('reminders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'reminders' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>REMINDERS</span>
          </button>
          <button
            id="subtab-btn-notes"
            onClick={() => setActiveSubTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'notes' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>NOTES</span>
          </button>
          <button
            id="subtab-btn-memories"
            onClick={() => setActiveSubTab('memories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'memories' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>MEMORIES</span>
          </button>
        </div>
      </div>

      {/* Main interactive sub-tab view area */}
      <div id="subtab-pane" className="flex-1 overflow-y-auto p-5">
        
        {/* TAB 1: MORNING BRIEFING COMPONENT */}
        {activeSubTab === 'briefing' && (
          <div className="max-w-2xl mx-auto py-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg text-center space-y-5 shadow-lg">
              <div className="w-12 h-12 bg-cyan-500/15 text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Calendar className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t.briefingTitle}</h3>
                <p className="text-xs text-cyan-400 font-mono mt-1 font-bold">
                  {lang === 'bn' ? getBengaliDate() : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <blockquote className="text-xs leading-relaxed text-slate-300 bg-slate-950 p-4 border-l-2 border-cyan-400/85 text-left italic">
                "{getBriefingText()}"
              </blockquote>

              <button
                onClick={speakBriefing}
                className="mx-auto flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded font-bold font-mono text-xs cursor-pointer transition-all uppercase"
              >
                <Volume2 className="w-4 h-4" />
                <span>{t.speakBriefingButton}</span>
              </button>
            </div>

            {/* Quick status summary panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-lg space-y-2">
                <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">🛠 TOP PENDING TASKS</h4>
                {tasks.filter(x => !x.completed).length > 0 ? (
                  tasks.filter(x => !x.completed).slice(0, 3).map(tk => (
                    <div key={tk.id} className="text-xs flex items-center gap-1.5 font-mono text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${tk.priority === 'critical' ? 'bg-red-500' : 'bg-cyan-400'}`}></span>
                      <span className="truncate">{tk.title}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500">{t.noTasks}</p>
                )}
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-lg space-y-2">
                <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">⏰ ALARMS SCHEDULED</h4>
                {reminders.filter(x => !x.completed).length > 0 ? (
                  reminders.filter(x => !x.completed).slice(0, 3).map(rm => (
                    <div key={rm.id} className="text-xs flex items-center gap-1.5 font-mono text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="truncate">{rm.title} ({new Date(rm.remindAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500">{t.noReminders}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TASKS MANAGER PANEL */}
        {activeSubTab === 'tasks' && (
          <div className="max-w-xl mx-auto space-y-5">
            {/* Task Add Form */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{t.addTask}</h4>
              <div className="flex gap-2">
                <input
                  id="task-input-box"
                  type="text"
                  placeholder={lang === 'bn' ? 'কী কাজ করতে চান লিখুন...' : 'Enter objective task content...'}
                  value={taskVal}
                  onChange={(e) => setTaskVal(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && taskVal.trim() && (onAddTask(taskVal.trim(), taskPriority), setTaskVal(''))}
                />
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 text-xs text-slate-300 focus:outline-none font-mono"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <button
                  onClick={() => {
                    if (taskVal.trim()) {
                      onAddTask(taskVal.trim(), taskPriority);
                      setTaskVal('');
                    }
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded shrink-0 cursor-pointer font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Task Lists stream */}
            <div className="space-y-2">
              {tasks.length > 0 ? (
                tasks.map(tk => (
                  <div
                    key={tk.id}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between gap-3 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={tk.completed}
                        onChange={() => onToggleTask(tk.id)}
                        className="accent-cyan-500 rounded cursor-pointer scale-105"
                      />
                      <span className={`text-xs ${tk.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {tk.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        tk.priority === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        tk.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-950 text-slate-400'
                      }`}>
                        {tk.priority}
                      </span>
                      <button
                        onClick={() => onDeleteTask(tk.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 font-mono text-xs">{t.noTasks}</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REMINDERS / TEMPORAL ALARMS */}
        {activeSubTab === 'reminders' && (
          <div className="max-w-xl mx-auto space-y-5">
            {/* Form alarm creation */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{t.addReminder}</h4>
              <div className="space-y-2">
                <input
                  id="reminder-input-box"
                  type="text"
                  placeholder={lang === 'bn' ? 'বিজ্ঞপ্তির নাম লিখুন...' : 'Enter alarm context notification...'}
                  value={reminderVal}
                  onChange={(e) => setReminderVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded py-2 px-3 text-xs text-slate-100 placeholder-slate-500"
                />
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={reminderAt}
                    onChange={(e) => setReminderAt(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-300 font-mono focus:outline-none"
                    required
                  />
                  <select
                    value={reminderRepeat}
                    onChange={(e) => setReminderRepeat(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 text-xs text-slate-300 font-mono focus:outline-none"
                  >
                    <option value="none">Once</option>
                    <option value="daily">Daily Cron</option>
                    <option value="weekly">Weekly Cron</option>
                    <option value="monthly">Monthly Cron</option>
                  </select>
                  <button
                    onClick={() => {
                      if (reminderVal.trim() && reminderAt) {
                        onAddReminder(reminderVal.trim(), reminderAt, reminderRepeat);
                        setReminderVal('');
                        setReminderAt('');
                      } else {
                        alert(lang === 'bn' ? 'তারিখ এবং টাইটেল দিন।' : 'Provide title and datetime.');
                      }
                    }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 rounded cursor-pointer font-bold text-xs"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>

            {/* Reminder Lists layout */}
            <div className="space-y-2">
              {reminders.length > 0 ? (
                reminders.map(rm => (
                  <div
                    key={rm.id}
                    className="p-3 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between gap-3 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={rm.completed}
                        onChange={() => onToggleReminder(rm.id)}
                        className="accent-cyan-500 rounded cursor-pointer scale-105"
                      />
                      <div>
                        <span className={`text-xs block ${rm.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {rm.title}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 block">
                          ⏰ {new Date(rm.remindAt).toLocaleString('en-US', { hour12: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono shrink-0">
                      {rm.repeat !== 'none' && (
                        <span className="text-[8px] bg-cyan-950/40 text-cyan-400 border border-cyan-500/10 px-1 py-0.2 rounded uppercase">
                          🔁 {rm.repeat}
                        </span>
                      )}
                      <button
                        onClick={() => onDeleteReminder(rm.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 font-mono text-xs">{t.noReminders}</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NOTES STUDIOS */}
        {activeSubTab === 'notes' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{t.addNote}</h4>
              <input
                id="note-title-box"
                type="text"
                placeholder={lang === 'bn' ? 'নোটের শিরোনাম...' : 'Enter note document title...'}
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded py-2 px-3 text-xs text-white"
              />
              <textarea
                id="note-content-box"
                rows={3}
                placeholder={lang === 'bn' ? 'নোটের বিবরণ...' : 'Enter note contents detail...'}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-white"
              />
              <button
                onClick={() => {
                  if (noteTitle.trim() && noteContent.trim()) {
                    onAddNote(noteTitle.trim(), noteContent.trim());
                    setNoteTitle('');
                    setNoteContent('');
                  } else {
                    alert(lang === 'bn' ? 'নোট এবং টাইটেল দিন।' : 'Title and contents required.');
                  }
                }}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded cursor-pointer text-xs"
              >
                SAVE NOTE
              </button>
            </div>

            {/* Notes Cards output */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.map(nt => (
                <div key={nt.id} className="p-4 bg-slate-900 border border-slate-850 rounded-lg space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1.5 border-b border-slate-850 pb-1.5 mb-2">
                      <strong className="text-xs text-white truncate max-w-[80%]">{nt.title}</strong>
                      <button
                        onClick={() => onDeleteNote(nt.id)}
                        className="text-slate-500 hover:text-rose-450 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap">{nt.content}</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block pt-2 border-t border-slate-950 leading-none">
                    Saved: {nt.createdAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: WORKSPACE MEMORIES */}
        {activeSubTab === 'memories' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">{t.addMemory}</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="mem-key"
                  type="text"
                  placeholder="Key (e.g. Printer Brand)"
                  value={memoryKey}
                  onChange={(e) => setMemoryKey(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded py-1.5 px-3.5 text-xs text-white"
                />
                <input
                  id="mem-val"
                  type="text"
                  placeholder="Value detail"
                  value={memoryVal}
                  onChange={(e) => setMemoryVal(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded py-1.5 px-3.5 text-xs text-white"
                />
              </div>
              <div className="flex gap-2 items-center">
                <select
                  value={memoryCat}
                  onChange={(e) => setMemoryCat(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-300 font-mono"
                >
                  <option value="preference">Preference</option>
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="skill">Skill</option>
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">Importance:</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={memoryImp}
                    onChange={(e) => setMemoryImp(parseInt(e.target.value) || 3)}
                    className="w-12 bg-slate-950 border border-slate-800 rounded text-center text-xs text-white font-mono"
                  />
                </div>
                <button
                  onClick={() => {
                    if (memoryKey.trim() && memoryVal.trim()) {
                      onAddMemory(memoryKey.trim(), memoryVal.trim(), memoryCat, memoryImp);
                      setMemoryKey('');
                      setMemoryVal('');
                    } else {
                      alert(lang === 'bn' ? 'মেমোরি কি এবং ভ্যালু দিন।' : 'Key and Value required.');
                    }
                  }}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-1 px-3 rounded cursor-pointer text-xs uppercase font-mono tracking-wider"
                >
                  STORE
                </button>
              </div>
            </div>

            {/* List memories */}
            <div className="space-y-2">
              {memories.map(m => (
                <div key={m.id} className="p-3 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] bg-slate-950 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                      {m.category}
                    </span>
                    <div>
                      <strong className="text-white select-all">{m.key}</strong>
                      <span className="text-slate-400 select-all font-sans block text-[11px] mt-0.5">→ {m.value}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: m.importance }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
                      ))}
                    </div>
                    <button
                      onClick={() => onDeleteMemory(m.id)}
                      className="text-slate-500 hover:text-rose-450 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
