'use client';

import { useRef, useState, useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useFileTree } from '@/store/selectors';
import { exportAsZip } from '@/lib/export/zipExporter';
import { importFromZip } from '@/lib/import/zipImporter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { TemplateGallery } from './TemplateGallery';
import { ValidationPanel } from './ValidationPanel';
import { useThemeStore } from '@/hooks/useTheme';

export function Toolbar() {
  const projectName = useProjectStore((s) => s.projectName);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const isExporting = useProjectStore((s) => s.isExporting);
  const setIsExporting = useProjectStore((s) => s.setIsExporting);
  const nodes = useProjectStore((s) => s.nodes);
  const edges = useProjectStore((s) => s.edges);
  const tree = useFileTree();
  const [autoSaved, setAutoSaved] = useState(false);

  // Auto-load on mount
  useEffect(() => {
    const saved = localStorage.getItem('claude-builder-project');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.nodes?.length > 0) {
          useProjectStore.getState().setProjectName(data.projectName || 'my-project');
          useProjectStore.setState({ nodes: data.nodes || [], edges: data.edges || [] });
        }
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nodes.length > 0) {
        localStorage.setItem('claude-builder-project', JSON.stringify({ projectName, nodes, edges }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, projectName]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportAsZip(tree);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    const state = useProjectStore.getState();
    const saveData = {
      projectName: state.projectName,
      nodes: state.nodes,
      edges: state.edges,
    };
    localStorage.setItem('claude-builder-project', JSON.stringify(saveData));
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('claude-builder-project');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      useProjectStore.getState().setProjectName(data.projectName || 'my-project');
      useProjectStore.setState({ nodes: data.nodes || [], edges: data.edges || [] });
    } catch (error) {
      console.error('Load failed:', error);
    }
  };

  const handleClear = () => {
    useProjectStore.setState({ nodes: [], edges: [] });
    useProjectStore.getState().setProjectName('my-project');
  };

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  // UTF-8 safe base64 encode/decode helpers
  const utf8ToBase64 = (str: string): string => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const base64ToUtf8 = (b64: string): string => {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  };

  // Load project from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#project=')) return;
    try {
      const encoded = hash.slice('#project='.length);
      const json = base64ToUtf8(decodeURIComponent(encoded));
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        useProjectStore.setState({ nodes: data.nodes, edges: data.edges });
        useProjectStore.getState().setProjectName(data.projectName || 'my-project');
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      console.error('Failed to load project from URL');
    }
  }, []);

  const handleShare = () => {
    const state = useProjectStore.getState();
    const shareData = {
      projectName: state.projectName,
      nodes: state.nodes,
      edges: state.edges,
    };
    const json = JSON.stringify(shareData);
    const encoded = utf8ToBase64(json);
    const url = `${window.location.origin}${window.location.pathname}#project=${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
      setShareStatus('Link copied!');
      setTimeout(() => setShareStatus(null), 2000);
    }).catch(() => {
      // Fallback: update URL hash directly
      window.location.hash = `project=${encoded}`;
      setShareStatus('URL updated!');
      setTimeout(() => setShareStatus(null), 2000);
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importFromZip(file);
      useProjectStore.setState({ nodes: result.nodes, edges: result.edges });
      useProjectStore.getState().setProjectName(result.projectName);
    } catch (error) {
      console.error('Import failed:', error);
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 sm:px-4 flex items-center gap-1 sm:gap-2 overflow-x-auto overflow-y-hidden min-w-0">
      {/* Logo */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-lg">🏗️</span>
        <span className="font-bold text-gray-800 dark:text-gray-100 hidden lg:inline text-sm whitespace-nowrap">Claude Code Builder</span>
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0 hidden sm:block" />

      {/* Project name */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 hidden xl:inline">Project:</span>
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-28 sm:w-36 h-7 text-sm"
        />
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      {/* Templates & Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <TemplateGallery />
        <Button variant="ghost" size="sm" className="text-xs hidden md:inline-flex" onClick={() => fileInputRef.current?.click()}>
          Import ZIP
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleImport}
          className="hidden"
        />
        <Button variant="ghost" size="sm" className="text-xs hidden md:inline-flex" onClick={handleClear}>
          Clear
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0 hidden sm:block" />

      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs px-1.5"
          onClick={() => useProjectStore.temporal.getState().undo()}
          title="Undo (Ctrl+Z)"
        >
          ↩ <span className="hidden sm:inline">Undo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs px-1.5"
          onClick={() => useProjectStore.temporal.getState().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          ↪ <span className="hidden sm:inline">Redo</span>
        </Button>
      </div>

      <div className="flex-1 min-w-0" />

      {/* Right side */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap hidden lg:inline">
          {nodes.length} nodes &middot; {edges.length} edges
        </span>

        <Separator orientation="vertical" className="h-6 hidden lg:block" />

        <ValidationPanel />

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" className="text-xs px-1.5" onClick={handleSave}>
          Save
        </Button>
        {autoSaved && (
          <span className="text-[10px] text-green-600 dark:text-green-400 animate-pulse whitespace-nowrap">auto-saved</span>
        )}
        <Button variant="ghost" size="sm" className="text-xs px-1.5 hidden sm:inline-flex" onClick={handleLoad}>
          Load
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs px-1.5 hidden sm:inline-flex"
          onClick={handleShare}
          disabled={nodes.length === 0}
        >
          {shareStatus || 'Share'}
        </Button>
        <Button variant="ghost" size="sm" className="text-xs px-1.5" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>
        <a
          href="https://github.com/mryesiller/claude-code-builder"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-yellow-500" aria-hidden="true">
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
          </svg>
          <span className="hidden sm:inline">Star</span>
        </a>
        <Button onClick={handleExport} disabled={isExporting || nodes.length === 0} size="sm" className="whitespace-nowrap">
          {isExporting ? '...' : 'Export ZIP'}
        </Button>
      </div>
    </div>
  );
}
