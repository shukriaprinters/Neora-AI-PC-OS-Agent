import React from 'react';
import { SECTIONS } from '../masterPromptText';
import { ArchitectSection } from '../types';
import {
  Layers, Power, Compass, Sliders, Activity, RefreshCw,
  CheckSquare, Palette, Database, Workflow, Layout,
  Shield, GitMerge, Gauge, Award, Search, BookOpen
} from 'lucide-react';

interface SidebarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedSectionId: string;
  setSelectedSectionId: (id: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}

export function getIcon(name: string, className?: string) {
  const props = { className: className || "w-4 h-4" };
  switch (name) {
    case 'Layers': return <Layers {...props} />;
    case 'Power': return <Power {...props} />;
    case 'Compass': return <Compass {...props} />;
    case 'Sliders': return <Sliders {...props} />;
    case 'Activity': return <Activity {...props} />;
    case 'RefreshCw': return <RefreshCw {...props} />;
    case 'CheckSquare': return <CheckSquare {...props} />;
    case 'Palette': return <Palette {...props} />;
    case 'Database': return <Database {...props} />;
    case 'Workflow': return <Workflow {...props} />;
    case 'Layout': return <Layout {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'GitMerge': return <GitMerge {...props} />;
    case 'Gauge': return <Gauge {...props} />;
    case 'Award': return <Award {...props} />;
    default: return <BookOpen {...props} />;
  }
}

export function Sidebar({
  searchQuery,
  setSearchQuery,
  selectedSectionId,
  setSelectedSectionId,
  selectedTag,
  setSelectedTag
}: SidebarProps) {
  // Extract all unique tags
  const allTags = Array.from(
    new Set(SECTIONS.flatMap(s => s.tags))
  ).sort();

  // Filter sections by search query and active tag
  const filteredSections = SECTIONS.filter(section => {
    const matchesSearch = 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag ? section.tags.includes(selectedTag) : true;
    
    return matchesSearch && matchesTag;
  });

  return (
    <div id="sidebar-container" className="flex flex-col h-full bg-slate-950/90 border-r border-cyan-500/10 text-slate-100 w-full md:w-80 flex-shrink-0 backdrop-blur-xl">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-800/70 bg-slate-950/70">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_18px_rgba(6,182,212,0.12)]">
            <span className="text-cyan-400 font-mono text-sm font-bold">N</span>
          </div>
          <div>
            <h1 className="text-sm font-bold font-sans tracking-wide text-white">NEORA ARCHITECT</h1>
            <p className="text-[10px] font-mono text-slate-400">PROFESSIONAL COMMAND SUITE</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">ONLINE</span>
          <span className="px-2 py-0.5 rounded-full border border-slate-800 bg-slate-900/80 text-slate-400">LVL 3</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-cyan-400/70" />
          <input
            id="search-input"
            type="text"
            placeholder="Search specification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Tags Quick Filter */}
      <div className="px-3 pb-3">
        <div className="flex flex-wrap gap-1">
          <button
            id="tag-all-btn"
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors border ${
              selectedTag === null
                ? 'bg-cyan-500/15 text-cyan-300 font-bold border-cyan-500/30'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-850'
            }`}
          >
            ALL
          </button>
          {allTags.map(tag => (
            <button
              id={`tag-${tag.toLowerCase()}-btn`}
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors border ${
                selectedTag === tag
                  ? 'bg-cyan-500/15 text-cyan-300 font-bold border-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-850'
              }`}
            >
              {tag.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List Container */}
      <div id="section-list" className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => {
            const isSelected = section.id === selectedSectionId;
            return (
              <button
                id={`sec-btn-${section.id}`}
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex gap-3 group border ${
                isSelected
                    ? 'bg-slate-900/90 border-cyan-500/30 text-white shadow-[0_0_0_1px_rgba(6,182,212,0.08)]'
                    : 'bg-transparent border-transparent hover:bg-slate-900/50 hover:border-slate-800/80 text-slate-300'
              }`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-cyan-500/15 text-cyan-300' : 'bg-slate-950/60 text-slate-500 group-hover:text-slate-400'
                }`}>
                  {getIcon(section.iconName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold leading-tight truncate group-hover:text-white transition-colors">
                      {section.number}. {section.title}
                    </span>
                    <span className="text-[9px] font-mono shrink-0 bg-slate-950 px-1 py-0.2 rounded text-slate-500">
                      SEC {section.number.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400 truncate">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 px-2 text-slate-500">
            <p className="text-xs">No specifications match your filters.</p>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/70 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>REL VERSION 2.0</span>
        <span className="text-cyan-500/60 font-bold">READY BOSS</span>
      </div>
    </div>
  );
}
