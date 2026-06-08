import React, { useState } from 'react';
import { Search, File, FileCode } from 'lucide-react';
import { VSCodeFile } from '../../lib/vscode-db';

interface SearchProps {
  files: VSCodeFile[];
}

export function SearchPanel({ files }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{file: VSCodeFile; matches: Array<{line: number; text: string}>}>>([]);
  const [replaceQuery, setReplaceQuery] = useState('');
  const [replaceActive, setReplaceActive] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results: Array<{file: VSCodeFile; matches: Array<{line: number; text: string}>}> = [];
    const query = searchQuery.toLowerCase();

    files.forEach(file => {
      const lines = file.content.split('\n');
      const matches: Array<{line: number; text: string}> = [];
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(query)) {
          matches.push({ line: idx + 1, text: line.trim() });
        }
      });
      if (matches.length > 0) {
        results.push({ file, matches });
      }
    });

    setSearchResults(results);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950/80">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800/80 space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        
        {replaceActive && (
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={e => setReplaceQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded text-xs cursor-pointer hover:bg-cyan-400"
          >
            Search
          </button>
          <button
            onClick={() => setReplaceActive(!replaceActive)}
            className={`px-2 py-1 rounded text-xs cursor-pointer ${replaceActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Replace
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-2">
        {searchQuery && searchResults.length === 0 && (
          <div className="text-xs text-slate-500 px-2 py-4 text-center">
            No results found
          </div>
        )}
        
        {searchResults.map(({ file, matches }) => (
          <div key={file.id} className="mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="truncate">{file.path}</span>
            </div>
            <div className="ml-5 mt-1 space-y-1">
              {matches.map(m => (
                <div
                  key={`${file.id}-${m.line}`}
                  className="text-xs text-slate-500 hover:text-slate-200 cursor-pointer px-2 py-0.5 rounded hover:bg-slate-800/50"
                >
                  <span className="text-cyan-500 mr-2">{m.line}</span>
                  <span className="truncate">{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}