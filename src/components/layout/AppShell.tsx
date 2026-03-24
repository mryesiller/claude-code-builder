'use client';

import { FileTree } from '@/components/tree/FileTree';
import { NodePalette } from '@/components/layout/NodePalette';
import { CanvasFlow } from '@/components/canvas/CanvasFlow';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { NodeEditorDialog } from '@/components/editors/NodeEditorDialog';
import { Toolbar } from '@/components/layout/Toolbar';

export function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <FileTree />
        <NodePalette />
        <div className="flex-1 relative">
          <CanvasFlow />
        </div>
        <ChatPanel />
      </div>
      <NodeEditorDialog />
    </div>
  );
}
