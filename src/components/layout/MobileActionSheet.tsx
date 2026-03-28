'use client';

import { useRef, useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useFileTree } from '@/store/selectors';
import { exportAsZip } from '@/lib/export/zipExporter';
import { importFromZip } from '@/lib/import/zipImporter';
import { useThemeStore } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TemplateGallery } from './TemplateGallery';
import { ValidationPanel } from './ValidationPanel';

export function MobileActionSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const nodes = useProjectStore((s) => s.nodes);
  const edges = useProjectStore((s) => s.edges);
  const isExporting = useProjectStore((s) => s.isExporting);
  const setIsExporting = useProjectStore((s) => s.setIsExporting);
  const tree = useFileTree();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on backdrop click
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const handleSave = () => {
    const state = useProjectStore.getState();
    localStorage.setItem('claude-builder-project', JSON.stringify({
      projectName: state.projectName, nodes: state.nodes, edges: state.edges,
    }));
    onOpenChange(false);
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('claude-builder-project');
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      useProjectStore.getState().setProjectName(data.projectName || 'my-project');
      useProjectStore.setState({ nodes: data.nodes || [], edges: data.edges || [] });
    } catch { /* ignore */ }
    onOpenChange(false);
  };

  const handleShare = () => {
    const state = useProjectStore.getState();
    const json = JSON.stringify({ projectName: state.projectName, nodes: state.nodes, edges: state.edges });
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const encoded = btoa(binary);
    const url = `${window.location.origin}${window.location.pathname}#project=${encoded}`;
    navigator.clipboard.writeText(url).catch(() => {
      window.location.hash = `project=${encoded}`;
    });
    onOpenChange(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try { await exportAsZip(tree); } catch { /* ignore */ }
    finally { setIsExporting(false); }
    onOpenChange(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importFromZip(file);
      useProjectStore.setState({ nodes: result.nodes, edges: result.edges });
      useProjectStore.getState().setProjectName(result.projectName);
    } catch { /* ignore */ }
    if (fileInputRef.current) fileInputRef.current.value = '';
    onOpenChange(false);
  };

  const handleClear = () => {
    useProjectStore.setState({ nodes: [], edges: [] });
    useProjectStore.getState().setProjectName('my-project');
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => onOpenChange(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="relative bg-white dark:bg-gray-900 rounded-t-2xl max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Stats */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            {nodes.length} nodes &middot; {edges.length} edges
          </div>

          <Separator />

          {/* Export - primary action */}
          <Button
            className="w-full"
            onClick={handleExport}
            disabled={isExporting || nodes.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export ZIP'}
          </Button>

          <Separator />

          {/* Project actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={handleSave}>Save</Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleLoad}>Load</Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleShare} disabled={nodes.length === 0}>Share</Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => fileInputRef.current?.click()}>
              Import ZIP
            </Button>
            <input ref={fileInputRef} type="file" accept=".zip" onChange={handleImport} className="hidden" />
            <Button variant="outline" size="sm" className="text-xs text-red-600 dark:text-red-400" onClick={handleClear}>
              Clear All
            </Button>
          </div>

          <Separator />

          {/* Edit */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { useProjectStore.temporal.getState().undo(); onOpenChange(false); }}>
              ↩ Undo
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { useProjectStore.temporal.getState().redo(); onOpenChange(false); }}>
              ↪ Redo
            </Button>
          </div>

          <Separator />

          {/* View */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <TemplateGallery />
            </div>
            <div className="flex-1">
              <ValidationPanel />
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => { toggleTheme(); onOpenChange(false); }}>
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>

          <Separator />

          {/* Links */}
          <a
            href="https://github.com/mryesiller/claude-code-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub &middot; Star
          </a>
        </div>
      </div>
    </div>
  );
}
