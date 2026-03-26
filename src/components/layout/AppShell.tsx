'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileTree } from '@/components/tree/FileTree';
import { NodePalette } from '@/components/layout/NodePalette';
import { CanvasFlow } from '@/components/canvas/CanvasFlow';
// ChatPanel hidden from dashboard for now — kept in repo for future use
// import { ChatPanel } from '@/components/chat/ChatPanel';
import { NodeEditorDialog } from '@/components/editors/NodeEditorDialog';
import { Toolbar } from '@/components/layout/Toolbar';
import { ResizeHandle } from '@/components/layout/ResizeHandle';
import { useThemeStore } from '@/hooks/useTheme';

const MIN_PANEL = 120;
const MAX_PANEL = 500;
const clamp = (v: number) => Math.max(MIN_PANEL, Math.min(MAX_PANEL, v));

export function AppShell() {
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => { initTheme(); }, [initTheme]);

  const [leftW, setLeftW] = useState(260);
  const [paletteW, setPaletteW] = useState(240);
  const resizeLeft = useCallback((d: number) => setLeftW((w) => clamp(w + d)), []);
  const resizePalette = useCallback((d: number) => setPaletteW((w) => clamp(w + d)), []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <FileTree width={leftW} />
        <ResizeHandle side="left" onResize={resizeLeft} />
        <NodePalette width={paletteW} />
        <ResizeHandle side="left" onResize={resizePalette} />
        <div className="flex-1 relative min-w-[200px]">
          <CanvasFlow />
        </div>
        {/* ChatPanel hidden — uncomment to re-enable */}
        {/* <ResizeHandle side="right" onResize={resizeRight} />
        <ChatPanel width={rightW} /> */}
      </div>
      <NodeEditorDialog />
    </div>
  );
}
