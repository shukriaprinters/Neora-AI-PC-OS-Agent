import React, { useState } from 'react';
import { Play, Plus, Trash2, ArrowDown, Settings, MoveUp, MoveDown, Layers, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { neoraPost } from '../lib/neoraApi';

interface MacroStep {
  id: string;
  type: 'open_app' | 'type_text' | 'key_combo' | 'wait' | 'save_as' | 'screenshot' | 'click_coord';
  label: string;
  param: string;
}

interface WorkflowAutomatorProps {
  lang: 'en' | 'bn';
  token: string;
  onWorkflowDispatched: (msg: string) => void;
}

export function WorkflowAutomator({ lang, token, onWorkflowDispatched }: WorkflowAutomatorProps) {
  const [macroSteps, setMacroSteps] = useState<MacroStep[]>([
    { id: '1', type: 'open_app', label: lang === 'bn' ? 'নোটপ্যাড চালু করো' : 'Open Notepad', param: 'notepad' },
    { id: '2', type: 'wait', label: lang === 'bn' ? 'অপেক্ষাঃ ২.০ সেকেন্ড' : 'Wait: 2.0s', param: '2.0' },
    { id: '3', type: 'type_text', label: lang === 'bn' ? 'টেক্সট টাইপ করো' : 'Type Text Content', param: 'Hello, boss! Executing automator macro chain.' },
    { id: '4', type: 'save_as', label: lang === 'bn' ? 'সেভ করো' : 'Save As File', param: 'auto_macro_note.txt' },
    { id: '5', type: 'screenshot', label: lang === 'bn' ? 'স্ক্রিনশট নাও' : 'Take Screenshot', param: '' }
  ]);

  const [activeStepType, setActiveStepType] = useState<MacroStep['type']>('open_app');
  const [stepParam, setStepParam] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  const availableStepPresets: { type: MacroStep['type']; label: string; placeholder: string; defaultVal: string }[] = [
    { type: 'open_app', label: lang === 'bn' ? 'সফটওয়্যার চালু (Open App)' : 'Launch Application', placeholder: 'e.g. photoshop, winword, calc, mspaint', defaultVal: 'winword' },
    { type: 'wait', label: lang === 'bn' ? 'অপেক্ষা করো (Wait Timer)' : 'Wait Intermission', placeholder: 'seconds (e.g. 1.5, 3.0, 5.0)', defaultVal: '3.0' },
    { type: 'type_text', label: lang === 'bn' ? 'টেক্সট লিখুন (Type text)' : 'Type Keyboard Input', placeholder: 'Text string to auto-type', defaultVal: 'Shukria Offset Printing Automated Report' },
    { type: 'key_combo', label: lang === 'bn' ? 'শর্টকাট কী (Key combo)' : 'Press Key / Combination', placeholder: 'e.g. ctrl+n, enter, ctrl+s', defaultVal: 'ctrl+n' },
    { type: 'save_as', label: lang === 'bn' ? 'ফাইল সংরক্ষণ (Save as)' : 'Instantly Save As', placeholder: 'file name (e.g. bill.docx, drawing.png)', defaultVal: 'shukria_design.psd' },
    { type: 'click_coord', label: lang === 'bn' ? 'মাউস ক্লিক (Mouse Click)' : 'Mouse Absolute Click', placeholder: 'x,y coordinate e.g. 500,450', defaultVal: '200,200' },
    { type: 'screenshot', label: lang === 'bn' ? 'স্ক্রিনশট নাও (Screenshot)' : 'Capture Screenshot', placeholder: 'None', defaultVal: '' }
  ];

  const handleAddStep = () => {
    const preset = availableStepPresets.find(p => p.type === activeStepType);
    if (!preset) return;

    const param = stepParam.trim() || preset.defaultVal;
    
    // Determine friendly label
    let friendlyLabel = preset.label;
    if (activeStepType === 'open_app') friendlyLabel += `: ${param}`;
    else if (activeStepType === 'wait') friendlyLabel += `: ${param}s`;
    else if (activeStepType === 'type_text') friendlyLabel += `: "${param.substring(0, 15)}..."`;
    else if (activeStepType === 'key_combo') friendlyLabel += `: [${param}]`;
    else if (activeStepType === 'save_as') friendlyLabel += `: ${param}`;
    else if (activeStepType === 'click_coord') friendlyLabel += `: at (${param})`;

    const newStep: MacroStep = {
      id: Date.now().toString(),
      type: activeStepType,
      label: friendlyLabel,
      param
    };

    setMacroSteps(prev => [...prev, newStep]);
    setStepParam('');
  };

  const handleDeleteStep = (id: string) => {
    setMacroSteps(prev => prev.filter(s => s.id !== id));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === macroSteps.length - 1) return;

    const newSteps = [...macroSteps];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIdx];
    newSteps[targetIdx] = temp;
    setMacroSteps(newSteps);
  };

  const handleRunMacroPipeline = async () => {
    if (macroSteps.length === 0) return;
    setIsExecuting(true);
    setExecutionStatus(lang === 'bn' ? 'ম্যাক্রো কম্পাইল করা হচ্ছে...' : 'Compiling Macro Steps...');

    // Convert high-level macro steps into Neora native lower-level JSON actions
    const compiledActions = macroSteps.map(step => {
      switch (step.type) {
        case 'open_app':
          return { action: 'execute_cmd', param: step.param };
        case 'type_text':
          return { action: 'type_text', param: step.param };
        case 'key_combo':
          return { action: 'press_key', param: step.param };
        case 'wait':
          return { action: 'wait', param: step.param };
        case 'save_as':
          return { action: 'save_file_as', param: step.param };
        case 'click_coord':
          return { action: 'mouse_click', param: step.param };
        case 'screenshot':
          return { action: 'take_screenshot', param: '' };
        default:
          return { action: 'wait', param: '1.0' };
      }
    });

    const promptText = `Macro Pipeline: ${macroSteps.map(s => `${s.type}(${s.param})`).join(' -> ')}`;

    try {
      // Direct post to backend command endpoint with pre-compiled custom actions!
      const res: any = await neoraPost('/api/os/command', {
        prompt: promptText,
        token,
        // Override actions mapping so it bypasses raw Gemini transcription and executes our precise macros
        actionsOverride: compiledActions 
      });

      if (res && res.status === 'success') {
        const successMsg = lang === 'bn' 
          ? 'ম্যাক্রো ফ্লো সফলভাবে ওএস এজেন্টের কিউতে পাঠানো হয়েছে!' 
          : 'Macro Flow successfully dispatched to Neora OS Queue!';
        setExecutionStatus(successMsg);
        onWorkflowDispatched(successMsg);
      } else {
        throw new Error('Rejected');
      }
    } catch (_) {
      setExecutionStatus(lang === 'bn' ? 'ম্যাক্রো রান করা ব্যর্থ হয়েছে।' : 'Error dispatching macro queue pipeline.');
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutionStatus(null), 5000);
    }
  };

  const activePreset = availableStepPresets.find(p => p.type === activeStepType);

  return (
    <div className="border border-cyan-500/10 rounded-xl p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-500" />
          {lang === 'bn' ? 'ওয়ার্কফ্লো অটোমেটর (Macro Studio)' : 'WORKFLOW AUTOMATOR (Macro Studio)'}
        </h3>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {macroSteps.length} {lang === 'bn' ? 'টি ধাপ' : 'steps enqueued'}
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-4 font-mono select-none">
        {lang === 'bn' 
          ? 'ওএস কমান্ডের একটি নির্দিষ্ট কাজের চেইন বা সিকোয়েন্স নিজের ইচ্ছামতো সাজিয়ে নিয়ে এক ক্লিকেই সম্পূর্ণ কাজের ম্যাক্রো অটোমেশন সচল করুন।' 
          : 'Select a sequence of direct OS commands to execute them sequentially as a single automated macro pipeline.'}
      </p>

      {/* Preset Custom Step Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
        <div>
          <label className="block text-[10px] font-mono font-semibold text-slate-400 mb-1">
            {lang === 'bn' ? 'ধাপের ধরন নির্বাচন করুন' : 'SELECT ELEMENT TYPE'}
          </label>
          <select 
            value={activeStepType}
            onChange={(e) => {
              setActiveStepType(e.target.value as any);
              setStepParam('');
            }}
            className="w-full text-xs font-mono bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 outline-none focus:border-cyan-500"
          >
            {availableStepPresets.map(preset => (
              <option key={preset.type} value={preset.type}>{preset.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-mono font-semibold text-slate-400 mb-1">
            {lang === 'bn' ? 'প্যারামিটার / কনটেন্ট টাইপ' : 'PARAMETER DETAILS / VALUE'}
          </label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={stepParam}
              onChange={(e) => setStepParam(e.target.value)}
              placeholder={activePreset?.placeholder}
              disabled={activeStepType === 'screenshot'}
              className="flex-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 outline-none focus:border-cyan-500 disabled:opacity-40"
            />
            <button 
              onClick={handleAddStep}
              className="bg-cyan-500 hover:bg-cyan-600 outline-none text-slate-950 font-bold px-3 py-1 text-xs font-mono rounded flex items-center gap-1 shrink-0 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'যুক্ত করুন' : 'Insert'}
            </button>
          </div>
        </div>
      </div>

      {/* Reorderable Pipeline Display */}
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto mb-4 pr-1 scrollbar-thin">
        {macroSteps.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-lg">
            {lang === 'bn' ? 'কোনো কাজের ধাপ ইনসার্ট করা হয়নি' : 'No steps in pipeline. Insert parameters above!'}
          </div>
        ) : (
          macroSteps.map((step, idx) => (
            <div key={step.id}>
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 rounded-lg transition-colors group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] bg-cyan-900/40 text-cyan-400 border border-cyan-800/30 px-1.5 py-0.5 rounded font-mono">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-slate-200 truncate">
                    {step.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => handleMoveStep(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-all disabled:opacity-20"
                    title="Move Step Up"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleMoveStep(idx, 'down')}
                    disabled={idx === macroSteps.length - 1}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition-all disabled:opacity-20"
                    title="Move Step Down"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDeleteStep(step.id)}
                    className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition-all"
                    title="Delete Step"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {idx < macroSteps.length - 1 && (
                <div className="flex justify-center my-0.5">
                  <ArrowDown className="w-3 h-3 text-slate-700 animate-pulse" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {executionStatus && (
        <div className={`p-2.5 rounded-lg text-xs font-mono mb-3 flex items-start gap-2 border ${
          executionStatus.includes('successfully') || executionStatus.includes('সফলভাবে')
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
        }`}>
          {executionStatus.includes('successfully') || executionStatus.includes('সফলভাবে') ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          )}
          <span>{executionStatus}</span>
        </div>
      )}

      {/* Execution controls */}
      <div className="flex gap-2">
        <button 
          onClick={handleRunMacroPipeline}
          disabled={isExecuting || macroSteps.length === 0}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 outline-none text-slate-950 font-bold py-2 px-4 text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-current" />
          {isExecuting 
            ? (lang === 'bn' ? 'অটোমেশন রান হচ্ছে...' : 'RUNNING AUTOMATION...') 
            : (lang === 'bn' ? 'ম্যাক্রো সিকোয়েন্স রান করুন' : 'EXECUTE MACRO SEQUENCE')}
        </button>

        <button 
          onClick={() => {
            if (confirm(lang === 'bn' ? 'আপনি কি সম্পূর্ণ পাইপলাইন সাফ করতে চান?' : 'Are you sure you want to clear the entire pipeline?')) {
              setMacroSteps([]);
            }
          }}
          disabled={macroSteps.length === 0}
          className="border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 px-3 py-2 rounded-lg text-xs font-mono transition-all outline-none"
        >
          {lang === 'bn' ? 'ক্লিয়ার' : 'Clear'}
        </button>
      </div>
    </div>
  );
}
