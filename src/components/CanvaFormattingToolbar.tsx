import React, { useState } from 'react';
import { 
  AlignLeft, AlignCenter, AlignRight, Bold, Sliders, 
  Copy, Trash2, Maximize2, Palette, Sparkles, Grid, Eye 
} from 'lucide-react';

interface CanvaFormattingToolbarProps {
  lang: 'en' | 'bn';
  activeElement: any;
  updateElementProp: (id: string, prop: any, value: any) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (el: any) => void;
  FONT_FAMILIES: any[];
  showGridLines: boolean;
  setShowGridLines: (show: boolean) => void;
  showSafeZone: boolean;
  setShowSafeZone: (show: boolean) => void;
  canvasBg: any;
  setCanvasBg: (bg: any) => void;
  GRADIENTS: any[];
}

export default function CanvaFormattingToolbar({
  lang,
  activeElement,
  updateElementProp,
  deleteElement,
  duplicateElement,
  FONT_FAMILIES,
  showGridLines,
  setShowGridLines,
  showSafeZone,
  setShowSafeZone,
  canvasBg,
  setCanvasBg,
  GRADIENTS
}: CanvaFormattingToolbarProps) {
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [showSpacingPopup, setShowSpacingPopup] = useState(false);

  const isText = activeElement?.type === 'text';

  // Toggle uppercase
  const toggleCase = () => {
    if (!activeElement || !isText) return;
    const isUpper = activeElement.content === activeElement.content.toUpperCase();
    const newContent = isUpper ? activeElement.content.toLowerCase() : activeElement.content.toUpperCase();
    updateElementProp(activeElement.id, 'content', newContent);
  };

  // Toggle italic (using standard style trick in react)
  const toggleItalic = () => {
    if (!activeElement) return;
    // We can save style properties
    const currentWeight = activeElement.fontWeight || 'normal';
    // Let's toggle style or weight
    updateElementProp(activeElement.id, 'fontWeight', currentWeight.includes('italic') ? 'bold' : 'bold italic');
  };

  return (
    <div className="h-12 bg-slate-950 border-b border-slate-800/80 px-6 flex items-center justify-between gap-4 select-none overflow-x-auto shrink-0 z-30 shadow">
      {activeElement ? (
        <div className="flex items-center gap-4 w-full justify-between">
          
          {/* Active Layer Info Title */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
              {lang === 'bn' ? 'স্তর সম্পাদনা:' : 'EDITING:'} {activeElement.type}
            </span>
          </div>

          {/* Core Formatting buttons */}
          <div className="flex items-center gap-2">
            
            {/* Text Specific Editing Controls */}
            {isText && (
              <>
                {/* Font Selector */}
                <select
                  value={activeElement.fontFamily || 'Inter'}
                  onChange={(e) => updateElementProp(activeElement.id, 'fontFamily', e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs py-1 px-2.5 text-slate-200 outline-none focus:border-cyan-500/50 cursor-pointer h-8"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>

                {/* Font Size Decrement/Increment controls */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg h-8 overflow-hidden shrink-0">
                  <button
                    onClick={() => updateElementProp(activeElement.id, 'fontSize', Math.max(8, (activeElement.fontSize || 14) - 2))}
                    className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={activeElement.fontSize || 14}
                    onChange={(e) => updateElementProp(activeElement.id, 'fontSize', Math.max(6, parseInt(e.target.value) || 14))}
                    className="w-10 h-full bg-transparent text-center text-xs text-white outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => updateElementProp(activeElement.id, 'fontSize', Math.min(120, (activeElement.fontSize || 14) + 2))}
                    className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Text Color button */}
                <div className="relative">
                  <button
                    onClick={() => { setShowColorPopup(!showColorPopup); setShowSpacingPopup(false); }}
                    className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all text-xs font-bold text-slate-300 cursor-pointer"
                    title={lang === 'bn' ? 'টেক্সট কালার পরিবর্তন' : 'Change font color'}
                  >
                    <span 
                      className="inline-block w-4 h-4 rounded border border-slate-700" 
                      style={{ backgroundColor: activeElement.color || '#ffffff' }} 
                    />
                    <span className="font-mono text-[10px]">COLOR</span>
                  </button>

                  {showColorPopup && (
                    <div className="absolute top-10 left-0 bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl z-50 w-52 space-y-2 animate-fade-in">
                      <span className="block text-[8px] font-bold text-slate-500 font-mono uppercase tracking-widest border-b border-slate-900 pb-1 mb-1.5">
                        {lang === 'bn' ? 'রঙ নির্বাচন করুন' : 'PICK BRAND COLOR'}
                      </span>
                      
                      {/* Swatches */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {['#ffffff', '#fcd34d', '#f97316', '#ef4444', '#ec4899', '#3b82f6', '#06b6d4', '#10b981', '#1e293b', '#000000'].map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              updateElementProp(activeElement.id, 'color', color);
                              setShowColorPopup(false);
                            }}
                            className="w-7 h-7 rounded-full border border-slate-800 hover:scale-115 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-400">HEX:</span>
                        <input
                          type="color"
                          value={activeElement.color || '#ffffff'}
                          onChange={(e) => updateElementProp(activeElement.id, 'color', e.target.value)}
                          className="w-7 h-5 rounded bg-transparent border-0 cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={activeElement.color || '#ffffff'}
                          onChange={(e) => updateElementProp(activeElement.id, 'color', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-[10px] text-white font-mono rounded px-1.5 py-0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bold Toggle */}
                <button
                  onClick={() => updateElementProp(activeElement.id, 'fontWeight', activeElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    activeElement.fontWeight === 'bold'
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                  title="Toggle Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>

                {/* Align Cycle Button */}
                <button
                  onClick={() => {
                    const current = activeElement.align || 'center';
                    const next = current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
                    updateElementProp(activeElement.id, 'align', next);
                  }}
                  className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Toggle alignment"
                >
                  {activeElement.align === 'left' ? (
                    <AlignLeft className="w-3.5 h-3.5" />
                  ) : activeElement.align === 'right' ? (
                    <AlignRight className="w-3.5 h-3.5" />
                  ) : (
                    <AlignCenter className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[9px] font-mono uppercase">{activeElement.align || 'center'}</span>
                </button>

                {/* Letter/Line Spacing options */}
                <div className="relative">
                  <button
                    onClick={() => { setShowSpacingPopup(!showSpacingPopup); setShowColorPopup(false); }}
                    className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono">SPACING</span>
                  </button>

                  {showSpacingPopup && (
                    <div className="absolute top-10 right-0 bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-2xl z-50 w-56 space-y-3.5 animate-fade-in">
                      <span className="block text-[8px] font-bold text-slate-500 font-mono uppercase tracking-widest border-b border-slate-900 pb-1">
                        {lang === 'bn' ? 'ফন্ট স্পেসিং' : 'FONT LAYOUT SPACING'}
                      </span>

                      {/* Letter spacing */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                          <span>LETTER SPACING:</span>
                          <span>{activeElement.letterSpacing || '0'}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          step="1"
                          value={parseInt(activeElement.letterSpacing || '0')}
                          onChange={(e) => updateElementProp(activeElement.id, 'letterSpacing', e.target.value)}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      {/* Line height */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                          <span>LINE HEIGHT:</span>
                          <span>{Math.round((activeElement.lineHeight || 1.25) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="80"
                          max="220"
                          step="5"
                          value={Math.round((activeElement.lineHeight || 1.25) * 100)}
                          onChange={(e) => updateElementProp(activeElement.id, 'lineHeight', parseInt(e.target.value) / 100)}
                          className="w-full accent-cyan-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Shadow/Effects Toggle */}
                <button
                  onClick={() => updateElementProp(activeElement.id, 'shadow', !activeElement.shadow)}
                  className={`h-8 px-2.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                    activeElement.shadow
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)] font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                  title="Toggle drop shadow effect"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono">EFFECTS</span>
                </button>
              </>
            )}

            {/* Shape Specific border radius control */}
            {activeElement.type === 'shape' && (
              <div className="flex items-center gap-2 bg-slate-900 px-2.5 h-8 rounded-lg border border-slate-800">
                <span className="text-[9px] font-mono text-slate-400">CORNER RADIUS:</span>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={activeElement.borderRadius || 4}
                  onChange={(e) => updateElementProp(activeElement.id, 'borderRadius', parseInt(e.target.value))}
                  className="w-20 accent-cyan-400"
                />
                <span className="text-[9px] font-mono text-slate-300 w-5 text-right">{activeElement.borderRadius || 4}px</span>
              </div>
            )}

            {/* General Opacity Slider */}
            <div className="flex items-center gap-2 bg-slate-900 px-2.5 h-8 rounded-lg border border-slate-800 shrink-0">
              <span className="text-[9px] font-mono text-slate-400">OPACITY:</span>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={Math.round((activeElement.opacity ?? 1) * 100)}
                onChange={(e) => updateElementProp(activeElement.id, 'opacity', parseInt(e.target.value) / 100)}
                className="w-16 accent-cyan-400"
              />
              <span className="text-[9px] font-mono text-slate-300 w-6 text-right">{Math.round((activeElement.opacity ?? 1) * 100)}%</span>
            </div>

            <div className="h-5 w-px bg-slate-800 shrink-0" />

            {/* Duplicate Layer */}
            <button
              onClick={() => duplicateElement(activeElement)}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Duplicate selected layer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete Layer */}
            <button
              onClick={() => deleteElement(activeElement.id)}
              className="w-8 h-8 rounded-lg bg-red-950/20 border border-red-900/30 hover:border-red-500 hover:bg-red-950/40 text-red-400 flex items-center justify-center transition-all cursor-pointer"
              title="Delete layer element"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      ) : (
        /* No element selected fallback */
        <div className="flex items-center justify-between w-full">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-500" />
            <span>{lang === 'bn' ? 'ক্যানভাস টুলস: যেকোনো লেখা বা উপাদান নির্বাচন করুন' : 'Canva Toolbar: Select any layer to customize'}</span>
          </p>

          {/* Quick Canvas level toggles */}
          <div className="flex items-center gap-2">
            {/* Show Grid lines */}
            <button
              onClick={() => setShowGridLines(!showGridLines)}
              className={`h-7 px-2.5 rounded-lg border text-[9px] font-mono font-black flex items-center gap-1 transition-all cursor-pointer ${
                showGridLines
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Grid className="w-3 h-3 text-cyan-400" />
              <span>{lang === 'bn' ? 'গ্রিড অন' : 'GRID LINES'}</span>
            </button>

            {/* Show bleed safe zone lines */}
            <button
              onClick={() => setShowSafeZone(!showSafeZone)}
              className={`h-7 px-2.5 rounded-lg border text-[9px] font-mono font-black flex items-center gap-1 transition-all cursor-pointer ${
                showSafeZone
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>{lang === 'bn' ? 'সেফ জোন অন' : 'SAFE ZONE'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
