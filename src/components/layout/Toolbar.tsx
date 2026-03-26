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
        <Button onClick={handleExport} disabled={isExporting || nodes.length === 0} size="sm" className="whitespace-nowrap">
          {isExporting ? '...' : 'Export ZIP'}
        </Button>
      </div>
    </div>
  );
}
