'use client';

import { useRef } from 'react';
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
    <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 flex items-center gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-lg">🏗️</span>
        <span className="font-bold text-gray-800 dark:text-gray-100 hidden sm:inline">Claude Code Builder</span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Project name */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">Project:</span>
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-36 h-7 text-sm"
        />
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Templates & Actions */}
      <TemplateGallery />
      <Button variant="ghost" size="sm" className="text-xs" onClick={() => fileInputRef.current?.click()}>
        Import ZIP
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleImport}
        className="hidden"
      />
      <Button variant="ghost" size="sm" className="text-xs" onClick={handleClear}>
        Clear
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        className="text-xs px-2"
        onClick={() => useProjectStore.temporal.getState().undo()}
        title="Undo (Ctrl+Z)"
      >
        ↩ Undo
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs px-2"
        onClick={() => useProjectStore.temporal.getState().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        ↪ Redo
      </Button>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {nodes.length} nodes &middot; {edges.length} edges
        </span>

        <Separator orientation="vertical" className="h-6" />

        <ValidationPanel />

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm" className="text-xs" onClick={handleSave}>
          Save
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" onClick={handleLoad}>
          Load
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>
        <Button onClick={handleExport} disabled={isExporting || nodes.length === 0} size="sm">
          {isExporting ? 'Exporting...' : 'Export ZIP'}
        </Button>
      </div>
    </div>
  );
}
