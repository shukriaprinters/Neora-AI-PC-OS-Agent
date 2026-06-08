import React, { useState } from 'react';
import { ArchitectSection } from '../types';
import { RAW_MASTER_PROMPT } from '../masterPromptText';
import { getIcon } from './Sidebar';
import { Copy, Check, Download, FileText, ArrowRight, CheckSquare } from 'lucide-react';
import { copyToClipboardFailsafe } from '../utils/clipboard';

interface SectionViewerProps {
  section: ArchitectSection | undefined;
}

export function SectionViewer({ section }: SectionViewerProps) {
  const [copiedSection, setCopiedSection] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!section) {
    return (
      <div id="no-section" className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-400">
        <FileText className="w-12 h-12 text-slate-700 mb-2 animate-pulse" />
        <p className="text-sm font-sans">Select a blueprint module from the index directory to view its detailed specifications.</p>
      </div>
    );
  }

  const handleCopySection = () => {
    copyToClipboardFailsafe(section.content).then((success) => {
      if (success) {
        setCopiedSection(true);
        setTimeout(() => setCopiedSection(false), 2000);
      }
    });
  };

  const handleCopyFullPrompt = () => {
    copyToClipboardFailsafe(RAW_MASTER_PROMPT).then((success) => {
      if (success) {
        setCopiedFull(true);
        setTimeout(() => setCopiedFull(false), 2000);
      }
    });
  };

  const handleDownloadFullPrompt = () => {
    const blob = new Blob([RAW_MASTER_PROMPT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'neora_master_architect_prompt.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Preprocess content body and render headings, lists, check boxes, or code blocks
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    let insideList = false;
    let listItems: React.ReactNode[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      // Check for code block boundary
      if (line.startsWith('```')) {
        if (insideList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 my-3 text-sm text-slate-300">
              {listItems}
            </ul>
          );
          listItems = [];
          insideList = false;
        }
        return;
      }

      // Render headings
      if (line.startsWith('#### ')) {
        if (insideList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 my-3 text-sm text-slate-300">
              {listItems}
            </ul>
          );
          listItems = [];
          insideList = false;
        }
        elements.push(
          <h4 key={`h4-${index}`} className="text-sm font-bold font-mono tracking-tight text-cyan-400 mt-5 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-cyan-400/80 rounded-full inline-block"></span>
            {line.replace('#### ', '')}
          </h4>
        );
        return;
      }

      if (line.startsWith('### ')) {
        if (insideList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 my-3 text-sm text-slate-300">
              {listItems}
            </ul>
          );
          listItems = [];
          insideList = false;
        }
        elements.push(
          <h3 key={`h3-${index}`} className="text-base font-bold text-white mt-6 mb-3 border-b border-slate-800/80 pb-1">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }

      // Check lists (bullet points)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        insideList = true;
        const listText = line.trim().replace(/^[-*]\s+/, '');
        
        // Parse bold elements in bullet lists
        const formattedText = parseBoldText(listText);
        listItems.push(
          <li key={`li-${index}`} className="leading-relaxed hover:text-white transition-colors duration-155">
            {formattedText}
          </li>
        );
        return;
      }

      // Check numbers lists
      if (/^\d+\.\s+/.test(line.trim())) {
        insideList = true;
        const listText = line.trim().replace(/^\d+\.\s+/, '');
        const formattedText = parseBoldText(listText);
        listItems.push(
          <li key={`li-num-${index}`} className="leading-relaxed list-decimal ml-2 pl-1 hover:text-white transition-colors duration-155">
            {formattedText}
          </li>
        );
        return;
      }

      // Check checklist items
      if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]')) {
        if (insideList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1 my-3 text-sm text-slate-300">
              {listItems}
            </ul>
          );
          listItems = [];
          insideList = false;
        }
        const checked = line.trim().startsWith('- [x]');
        const checkText = line.trim().replace(/^-\s+\[[ x]\]\s+/, '');
        elements.push(
          <div key={`check-${index}`} className="flex items-start gap-2.5 my-2.5 p-2 rounded bg-slate-900/65 border border-slate-800/40">
            <input
              type="checkbox"
              checked={checked}
              disabled
              className="mt-1 accent-cyan-500 rounded bg-slate-950 border-slate-700"
            />
            <span className="text-xs text-slate-300 font-mono">{parseBoldText(checkText)}</span>
          </div>
        );
        return;
      }

      // Empty line closes bullet list
      if (line.trim() === '') {
        if (insideList) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 space-y-1.5 my-3 text-xs text-slate-300">
              {listItems}
            </ul>
          );
          listItems = [];
          insideList = false;
        }
        return;
      }

      // Normal lines or directory trees
      if (insideList) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc pl-5 space-y-1.5 my-3 text-xs text-slate-300">
            {listItems}
          </ul>
        );
        listItems = [];
        insideList = false;
      }

      // Detect folder structures inside code boundaries
      if (line.startsWith('├──') || line.startsWith('└──') || line.startsWith('│')) {
        elements.push(
          <div key={`tree-${index}`} className="font-mono text-xs text-teal-400 bg-slate-950 px-3 py-1 border-l-2 border-slate-800">
            {line}
          </div>
        );
        return;
      }

      // Default paragraph text
      elements.push(
        <p key={`p-${index}`} className="text-xs leading-relaxed text-slate-300 my-2.5">
          {parseBoldText(line)}
        </p>
      );
    });

    // Clean up trailing open list elements
    if (insideList && listItems.length > 0) {
      elements.push(
        <ul key="list-trailing" className="list-disc pl-5 space-y-1.5 my-3 text-xs text-slate-300">
          {listItems}
        </ul>
      );
    }

    return elements;
  };

  // Helper parser for bold markdown syntax (**bold** -> React elements)
  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-slate-100 font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="font-mono text-[10px] bg-slate-950 px-1 py-0.5 rounded text-cyan-400 border border-slate-800">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div id="section-viewer-wrapper" className="flex-1 flex flex-col bg-slate-950 text-slate-100 h-full overflow-hidden">
      {/* Upper Panel Info details */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-mono text-cyan-400 font-bold border border-cyan-500/10">
              MODULE {section.number.toString().padStart(2, '0')}
            </span>
            <div className="flex gap-1.5">
              {section.tags.map(t => (
                <span key={t} className="text-[9px] bg-slate-950 px-1.5 py-0.2 rounded text-slate-400 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2 font-sans">
            <span className="text-cyan-400 shrink-0">{getIcon(section.iconName, "w-5 h-5")}</span>
            {section.title}
          </h2>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="copy-module-btn"
            onClick={handleCopySection}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 text-xs text-slate-200 border border-slate-750 px-2.5 py-1.5 rounded transition-all cursor-pointer font-mono"
            title="Copy current specifications module text to clipboard"
          >
            {copiedSection ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY SPEC</span>
              </>
            )}
          </button>

          <button
            id="download-payload-btn"
            onClick={handleDownloadFullPrompt}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-xs text-slate-950 font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer font-mono"
            title="Download the fully assembled 17-section system master prompt text file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD BLUEPRINT</span>
          </button>
        </div>
      </div>

      {/* Segment Description Widget */}
      <div className="px-5 py-3.5 bg-slate-900/30 border-b border-slate-900 border-dashed text-xs text-slate-400 flex items-start gap-2 italic">
        <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-cyan-500 shrink-0" />
        <span>{section.description}</span>
      </div>

      {/* Body Content Reader scrollable workspace */}
      <div id="content-body-scroll" className="flex-1 overflow-y-auto px-6 py-4 space-y-2 selection:bg-cyan-500/20 max-w-4xl">
        <div className="border-l-2 border-slate-800 pl-4 py-1.5 mb-6 bg-slate-900/10">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">SYSTEM CONTROLLERS BINDING</p>
          <span className="text-[11px] font-mono text-slate-300">
            Targeting structural scope defined under file <code className="text-cyan-400 bg-slate-950 px-1 py-0.2 rounded border border-slate-900 font-bold">/prompt/master prompt</code>
          </span>
        </div>

        {renderContent(section.content)}
      </div>

      {/* Mini CTA footer dashboard */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/35 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shrink-0 text-slate-400">
        <span className="font-mono text-[10px]">
          ASSEMBLY MATRIX STATE: <strong className="text-emerald-400">COMPLETE blueprint assembled</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            id="copy-full-manifest-btn"
            onClick={handleCopyFullPrompt}
            className="text-cyan-400 hover:text-cyan-300 font-mono text-[10px] bg-slate-900 border border-slate-850 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copiedFull ? "✓ FULL PROMPT COPIED TO CLIPBOARD!" : "❐ COPY ENTIRE 17-SEC PROMPT"}
          </button>
        </div>
      </div>
    </div>
  );
}
