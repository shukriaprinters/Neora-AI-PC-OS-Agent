import React from 'react';
import { Printer, Download, Sparkles, Folder, CheckCircle } from 'lucide-react';

interface CanvaHeaderProps {
  lang: 'en' | 'bn';
  designTitle: string;
  setDesignTitle: (title: string) => void;
  selectedTemplate: any;
  PRESETS: any[];
  selectTemplate: (template: any) => void;
  handlePrint: () => void;
  handleDownload: (format: 'png' | 'jpg' | 'pdf' | 'eps' | 'tif' | 'psd') => void;
}

export default function CanvaHeader({
  lang,
  designTitle,
  setDesignTitle,
  selectedTemplate,
  PRESETS,
  selectTemplate,
  handlePrint,
  handleDownload
}: CanvaHeaderProps) {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const exportFormats = [
    { id: 'png', name: 'PNG Image', nameBn: 'পিএনজি ছবি', desc: 'High-res raster for web/screens', descBn: 'ওয়েব ও স্ক্রিনের জন্য হাই-রেজ ছবি', ext: '.png', color: 'text-cyan-400' },
    { id: 'jpg', name: 'JPG Image', nameBn: 'জেপিজি ছবি', desc: 'Standard compressed graphic', descBn: 'স্ট্যান্ডার্ড কম্প্রেসড ফরম্যাট', ext: '.jpg', color: 'text-sky-400' },
    { id: 'pdf', name: 'PDF Print', nameBn: 'পিডিএফ প্রিন্ট', desc: 'Portable document for publishing', descBn: 'পাবলিশিং ও হাই-কোয়ালিটি প্রিন্ট', ext: '.pdf', color: 'text-emerald-400' },
    { id: 'eps', name: 'EPS Vector', nameBn: 'ইপিএস ভেক্টর', desc: 'PostScript vector file for printers', descBn: 'প্রিন্টার ও ভেক্টর সফটওয়্যারের জন্য', ext: '.eps', color: 'text-amber-400' },
    { id: 'tif', name: 'TIF Lossless', nameBn: 'টিফ ইমেজ', desc: 'Tagged Image File format', descBn: 'র কালার এবং লসলেস কোয়ালিটি', ext: '.tif', color: 'text-indigo-400' },
    { id: 'psd', name: 'PSD Layers', nameBn: 'পিএসডি লেয়ার্স', desc: 'Adobe Photoshop layered structure', descBn: 'অ্যাডোবি ফটোশপ লেয়ার ব্যাকআপ', ext: '.psd', color: 'text-blue-400' }
  ] as const;

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-40 shadow-md">
      {/* Left: Branding & Quick Controls */}
      <div className="flex items-center gap-3">
        {/* Logo Icon */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-white font-sans">
              NEORA CANVA
            </h1>
            <p className="text-[8px] font-mono text-cyan-400 tracking-widest font-bold uppercase">
              STUDIO PRO
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        {/* File Dropdown / Template select */}
        <div className="relative group">
          <button className="px-2.5 py-1 rounded bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1">
            <Folder className="w-3 h-3 text-cyan-400" />
            <span>{lang === 'bn' ? 'ফাইল' : 'FILE'}</span>
          </button>
          
          <div className="absolute left-0 mt-1 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1.5 hidden group-hover:block hover:block z-50 animate-fade-in">
            <span className="block px-2.5 py-1 text-[8px] font-bold text-slate-500 font-mono uppercase tracking-widest border-b border-slate-900 mb-1">
              {lang === 'bn' ? 'টেমপ্লেট লোড করুন' : 'LOAD DESIGN PRESETS'}
            </span>
            {PRESETS.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium block transition-all hover:bg-slate-900 cursor-pointer ${
                  selectedTemplate.id === t.id ? 'text-cyan-400 bg-slate-900 font-bold' : 'text-slate-300'
                }`}
              >
                {lang === 'bn' ? t.nameBn : t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-mono">
          <CheckCircle className="w-3 h-3" />
          <span>{lang === 'bn' ? 'ক্লাউড সিঙ্কড' : 'All changes saved to cloud'}</span>
        </div>
      </div>

      {/* Middle: Editable Project Title */}
      <div className="flex-1 max-w-md flex justify-center">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={designTitle}
            onChange={(e) => setDesignTitle(e.target.value)}
            className="w-full bg-slate-800/50 hover:bg-slate-800/80 focus:bg-slate-950 text-white font-bold text-xs py-1.5 px-3.5 rounded-lg text-center outline-none border border-transparent focus:border-cyan-500/50 hover:border-slate-700/60 transition-all cursor-pointer truncate"
            title={lang === 'bn' ? 'ডিজাইনের নাম পরিবর্তন করুন' : 'Click to rename your design'}
            placeholder={lang === 'bn' ? 'ডিজাইনের নাম...' : 'Untilted Design Flyer...'}
          />
        </div>
      </div>

      {/* Right: Premium, Print & Export buttons */}
      <div className="flex items-center gap-2">
        {/* Trial Badge */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase font-mono tracking-wider animate-pulse">
          👑 {lang === 'bn' ? '৳০ ট্রায়াল' : 'Canva Pro for ৳0'}
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-bold font-mono flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-750"
          title={lang === 'bn' ? 'ডিজাইন প্রিন্ট করুন' : 'Print layout sheet'}
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{lang === 'bn' ? 'প্রিন্ট' : 'PRINT'}</span>
        </button>

        {/* Download / Export Button with Popover Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-[11px] font-black font-sans flex items-center gap-1.5 shadow-[0_4px_14px_rgba(6,182,212,0.3)] hover:shadow-cyan-500/45 cursor-pointer transition-all border border-cyan-400/25"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'রপ্তানি করুন' : 'EXPORT'}</span>
          </button>

          {showExportMenu && (
            <>
              <div 
                className="fixed inset-0 z-45" 
                onClick={() => setShowExportMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                <div className="px-3 py-1.5 border-b border-slate-900 mb-1">
                  <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-widest block">
                    {lang === 'bn' ? 'পেশাদার প্রিন্ট রপ্তানি' : 'Professional Print Export'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {lang === 'bn' ? 'ডাউনলোড করার জন্য ফরম্যাট নির্বাচন করুন' : 'Choose a file format to initiate high-res pack'}
                  </span>
                </div>

                {exportFormats.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      handleDownload(fmt.id);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-xl transition-all hover:bg-slate-900 flex items-start gap-2.5 cursor-pointer group"
                  >
                    <span className={`text-[10px] font-black font-mono px-2 py-1 rounded bg-slate-900 border border-slate-850 shrink-0 ${fmt.color} group-hover:bg-slate-850 transition-all`}>
                      {fmt.id.toUpperCase()}
                    </span>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {lang === 'bn' ? fmt.nameBn : fmt.name}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {fmt.ext}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        {lang === 'bn' ? fmt.descBn : fmt.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
