'use client';

import { useState, useEffect } from 'react';
import { MobileToolbar } from './MobileToolbar';
import { MobileTabBar, type MobileTab } from './MobileTabBar';
import { MobilePalette } from './MobilePalette';
import { CanvasFlow } from '@/components/canvas/CanvasFlow';
import { FileTree } from '@/components/tree/FileTree';
import { NodeEditorDialog } from '@/components/editors/NodeEditorDialog';
import { MobileAddNodeSheet } from './MobileAddNodeSheet';
import { useProjectStore } from '@/store/useProjectStore';
import { useThemeStore } from '@/hooks/useTheme';

export function MobileShell() {
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => { initTheme(); }, [initTheme]);

  const [activeTab, setActiveTab] = useState<MobileTab>('canvas');

  // Auto-load on mount (same logic as Toolbar)
  useEffect(() => {
    const saved = localStorage.getItem('claude-builder-project');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.nodes?.length > 0) {
          useProjectStore.getState().setProjectName(data.projectName || 'my-project');
          useProjectStore.setState({ nodes: data.nodes || [], edges: data.edges || [] });
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Auto-save with debounce
  const nodes = useProjectStore((s) => s.nodes);
  const edges = useProjectStore((s) => s.edges);
  const projectName = useProjectStore((s) => s.projectName);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nodes.length > 0) {
        localStorage.setItem('claude-builder-project', JSON.stringify({ projectName, nodes, edges }));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, projectName]);

  // Load from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#project=')) return;
    try {
      const encoded = hash.slice('#project='.length);
      const binary = atob(decodeURIComponent(encoded));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const json = new TextDecoder().decode(bytes);
      const data = JSON.parse(json);
      if (data.nodes && data.edges) {
        useProjectStore.setState({ nodes: data.nodes, edges: data.edges });
        useProjectStore.getState().setProjectName(data.projectName || 'my-project');
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch { /* ignore */ }
  }, []);

  const handleNodeAdded = () => {
    setActiveTab('canvas');
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50 dark:bg-gray-950">
      <MobileToolbar />

      <div className="flex-1 overflow-hidden relative">
        {/* Canvas - always mounted for ReactFlow state, hidden when not active */}
        <div className={`absolute inset-0 ${activeTab === 'canvas' ? '' : 'invisible'}`}>
          <CanvasFlow />
          <MobileAddNodeSheet />
        </div>

        {activeTab === 'palette' && (
          <div className="absolute inset-0">
            <MobilePalette onNodeAdded={handleNodeAdded} />
          </div>
        )}

        {activeTab === 'tree' && (
          <div className="absolute inset-0">
            <FileTree fullScreen />
          </div>
        )}
      </div>

      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <NodeEditorDialog />
    </div>
  );
}
