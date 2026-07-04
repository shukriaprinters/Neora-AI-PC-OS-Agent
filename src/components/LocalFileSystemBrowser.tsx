import React, { useState, useEffect } from 'react';
import { 
  Folder, File, FileCode, ArrowLeft, RefreshCw, Eye, Check, Download, 
  ChevronRight, HardDrive, Files, Lock, FileText, LayoutTemplate, Terminal,
  Plus, Save, FilePlus, FolderPlus, Edit2, X
} from 'lucide-react';
import { neoraGet, neoraPost } from '../lib/neoraApi';

interface FileBrowserItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  mtime: string;
}

interface LocalFileSystemBrowserProps {
  lang: 'en' | 'bn';
  selectedFilePath: string | null;
  onFileSelected: (filePath: string) => void;
}

export function LocalFileSystemBrowser({ lang, selectedFilePath, onFileSelected }: LocalFileSystemBrowserProps) {
  const [currentPath, setCurrentPath] = useState<string>('.');
  const [items, setItems] = useState<FileBrowserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // File Content Preview State
  const [previewFile, setPreviewFile] = useState<FileBrowserItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  // Read/Write / Creation States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showCreator, setShowCreator] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const fetchDirectory = async (targetPath: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res: any = await neoraGet(`/api/os/browser?path=${encodeURIComponent(targetPath)}`);
      if (res && res.currentPath !== undefined && Array.isArray(res.items)) {
        setCurrentPath(res.currentPath);
        // Sort: folders first, then files
        const sorted = [...res.items].sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
        setItems(sorted);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(lang === 'bn' ? 'ফাইল সিস্টেম লোড করতে ব্যর্থ হয়েছে।' : 'Failed to query workspace filesystem.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilePreview = async (file: FileBrowserItem) => {
    setPreviewFile(file);
    setIsPreviewLoading(true);
    setPreviewContent(null);
    setIsEditing(false);
    try {
      const res: any = await neoraGet(`/api/os/browser/content?filePath=${encodeURIComponent(file.path)}`);
      if (res && res.content !== undefined) {
        setPreviewContent(res.content);
        setEditContent(res.content);
      } else {
        throw new Error("Preview failed");
      }
    } catch (_) {
      const fallbackMsg = lang === 'bn' ? 'ফাইল প্রিভিউ লোড করা যায়নি।' : 'Unable to preview active content.';
      setPreviewContent(fallbackMsg);
      setEditContent(fallbackMsg);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleCreateItem = async (isFolder: boolean) => {
    if (!newItemName.trim()) return;
    setIsCreating(true);
    try {
      const res: any = await neoraPost('/api/os/browser/create', {
        parentPath: currentPath,
        name: newItemName.trim(),
        isFolder
      });
      if (res && res.status === 'success') {
        setNewItemName('');
        setShowCreator(null);
        fetchDirectory(currentPath);
      } else {
        throw new Error("Creation failed");
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'bn' ? 'তৈরি করতে ব্যর্থ হয়েছে।' : 'Failed to create item.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveFile = async () => {
    if (!previewFile) return;
    setIsSaving(true);
    try {
      const res: any = await neoraPost('/api/os/browser/save', {
        filePath: previewFile.path,
        content: editContent
      });
      if (res && res.status === 'success') {
        setPreviewContent(editContent);
        setIsEditing(false);
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'bn' ? 'সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to save file changes.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchDirectory('.');
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleNavigateUp = () => {
    if (currentPath === '.' || currentPath === '') return;
    const segments = currentPath.split('/');
    segments.pop();
    const parent = segments.join('/') || '.';
    fetchDirectory(parent);
  };

  const handleFolderClick = (dirPath: string) => {
    fetchDirectory(dirPath);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['json', 'ts', 'tsx', 'js', 'html', 'css', 'py', 'sh', 'bat', 'ps1'].includes(ext || '')) {
      return <FileCode className="w-4 h-4 text-emerald-400" />;
    }
    if (['png', 'jpg', 'jpeg', 'psd', 'ai', 'pdf'].includes(ext || '')) {
      return <LayoutTemplate className="w-4 h-4 text-purple-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* File Browser list half */}
      <div className="border border-cyan-500/10 rounded-xl p-4 bg-slate-900/60 backdrop-blur-md flex flex-col h-[380px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-cyan-500 animate-pulse" />
            {lang === 'bn' ? 'ড্রাইভ রিয়েল-ফাইলস' : 'WORKSPACE DISK MANAGER'}
          </h3>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowCreator(showCreator === 'file' ? null : 'file')}
              className={`p-1 rounded text-xs transition-colors flex items-center gap-1 ${showCreator === 'file' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-850'}`}
              title="New File"
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setShowCreator(showCreator === 'folder' ? null : 'folder')}
              className={`p-1 rounded text-xs transition-colors flex items-center gap-1 ${showCreator === 'folder' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-850'}`}
              title="New Folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => fetchDirectory(currentPath)}
              disabled={isLoading}
              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Path navigation breadcrumbs */}
        <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 object-cover rounded border border-slate-800 text-[10px] font-mono text-slate-300 mb-3 overflow-x-auto select-none select-all">
          <Files className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-[9px] text-[#00ff88] font-bold">WORKSPACE</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-cyan-400 whitespace-nowrap">{currentPath}</span>
        </div>

        {/* Create Item Inputs */}
        {showCreator && (
          <div className="bg-slate-950/80 p-2 border border-cyan-500/20 rounded-lg mb-3 flex items-center gap-2 select-none">
            <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold shrink-0">
              {showCreator === 'file' ? (lang === 'bn' ? 'নতুন ফাইল:' : 'New File:') : (lang === 'bn' ? 'নতুন ফোল্ডার:' : 'New Folder:')}
            </span>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={showCreator === 'file' ? 'index.html' : 'my_folder'}
              className="flex-1 bg-slate-900 text-xs font-mono px-2 py-1 rounded text-slate-200 border border-slate-800 outline-none focus:border-cyan-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateItem(showCreator === 'folder');
                if (e.key === 'Escape') { setShowCreator(null); setNewItemName(''); }
              }}
              autoFocus
            />
            <button
              onClick={() => handleCreateItem(showCreator === 'folder')}
              disabled={isCreating}
              className="px-2 py-1 text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded transition cursor-pointer"
            >
              {isCreating ? '...' : (lang === 'bn' ? 'তৈরি' : 'Create')}
            </button>
            <button
              onClick={() => { setShowCreator(null); setNewItemName(''); }}
              className="p-1 hover:bg-slate-800 text-slate-400 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Browser List stage */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {errorMsg ? (
            <div className="text-center py-6 text-red-400 text-xs font-mono">{errorMsg}</div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" />
              <span className="text-[10px] font-mono">Exploring folder...</span>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Back Folder Navigation */}
              {currentPath !== '.' && currentPath !== '' && (
                <div 
                  onClick={handleNavigateUp}
                  className="flex items-center gap-2 p-1.5 hover:bg-slate-800/60 rounded cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-mono font-semibold">.. / {lang === 'bn' ? 'ওপরে যান' : 'Parent Directory'}</span>
                </div>
              )}

              {/* Items listing */}
              {items.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  {lang === 'bn' ? 'ফোল্ডারটি ফাকা' : 'Directory is completely empty'}
                </div>
              ) : (
                items.map((item) => {
                  const isSelected = selectedFilePath === item.path;
                  return (
                    <div 
                      key={item.path}
                      className={`flex items-center justify-between p-1.5 rounded-lg group transition-all text-xs font-mono ${
                        isSelected 
                          ? 'bg-cyan-500/10 border border-cyan-500/30' 
                          : 'hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <div 
                        onClick={() => item.isDirectory ? handleFolderClick(item.path) : onFileSelected(item.path)}
                        className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                      >
                        {item.isDirectory ? (
                          <Folder className="w-4 h-4 text-amber-400 shrink-0 fill-amber-500/10" />
                        ) : (
                          getFileIcon(item.name)
                        )}
                        <span className={`truncate ${item.isDirectory ? 'text-amber-300 hover:underline' : 'text-slate-200'}`}>
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* File size of files */}
                        {item.isFile && (
                          <span className="text-[10px] text-slate-500 hidden group-hover:block transition-all">
                            {formatBytes(item.size)}
                          </span>
                        )}

                        {/* File Action previews */}
                        {item.isFile && (
                          <button 
                            onClick={() => loadFilePreview(item)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded transition"
                            title="Preview Content"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Direct Select Check */}
                        {!item.isDirectory && (
                          <button 
                            onClick={() => onFileSelected(item.path)}
                            className={`p-1 rounded transition-colors ${
                              isSelected 
                                ? 'bg-cyan-500 text-slate-950 font-bold' 
                                : 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'
                            }`}
                            title="Target File for Neora"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* File Preview half */}
      <div className="border border-cyan-500/10 rounded-xl p-4 bg-slate-900/60 backdrop-blur-md flex flex-col h-[380px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-bold font-mono text-cyan-400">
              {lang === 'bn' ? 'সরাসরি ফাইল প্রিভিউয়ার' : 'FILE CONTENT VIEWPORT'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {previewFile && !isPreviewLoading && (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-750 text-cyan-300 px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSaveFile}
                      disabled={isSaving}
                      className="flex items-center gap-1 text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-0.5 rounded transition cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>{isSaving ? 'Saving...' : (lang === 'bn' ? 'সংরক্ষণ' : 'Save')}</span>
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setEditContent(previewContent || ''); }}
                      className="flex items-center gap-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'বাতিল' : 'Cancel'}</span>
                    </button>
                  </div>
                )}
              </>
            )}
            {previewFile && (
              <span className="text-[10px] text-slate-400 font-mono italic">
                {previewFile.name} ({formatBytes(previewFile.size)})
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        <div className="flex-1 bg-slate-950/90 rounded-lg p-2 border border-slate-800 font-mono text-xs overflow-auto select-text scrollbar-thin flex flex-col">
          {!previewFile ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-500 text-[11px] py-12 select-none">
              <Eye className="w-7 h-7 text-slate-700 mb-2 animate-bounce" />
              <span>{lang === 'bn' ? 'যেকোনো ফাইলের চোখে ক্লিক করে প্রিভিউ দেখুন' : 'Click the eye icon of any text/code file to preview'}</span>
            </div>
          ) : isPreviewLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 text-[10px]">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
              <span>Loading preview buffer...</span>
            </div>
          ) : isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 w-full bg-transparent text-slate-200 outline-none font-mono text-[11px] leading-relaxed resize-none h-full"
            />
          ) : (
            <pre className="text-slate-300 text-[11px] whitespace-pre-wrap select-all font-mono">
              {previewContent || 'Empty File'}
            </pre>
          )}
        </div>

        {/* Highlight target select file status */}
        {selectedFilePath && (
          <div className="mt-3 p-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-[10px] font-mono flex items-center justify-between select-none">
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <strong>{lang === 'bn' ? 'টার্গেটেড ফাইলঃ' : 'ACTIVE TARGET:'}</strong> {selectedFilePath}
            </span>
            <button 
              onClick={() => onFileSelected('')}
              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              x
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
