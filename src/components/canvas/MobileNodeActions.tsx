'use client';

import { useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useProjectStore } from '@/store/useProjectStore';
import { getNextId } from '@/lib/templates';
import type { AppNode } from '@/store/useProjectStore';
import { Pencil, Copy, Trash2 } from 'lucide-react';

export function MobileNodeActions() {
  const { flowToScreenPosition } = useReactFlow();
  const nodes = useProjectStore((s) => s.nodes);
  const removeNode = useProjectStore((s) => s.removeNode);
  const setSelectedNodeId = useProjectStore((s) => s.setSelectedNodeId);

  const selectedNode = nodes.find((n) => n.selected);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!selectedNode) {
      setPos(null);
      return;
    }
    const screenPos = flowToScreenPosition({
      x: selectedNode.position.x + 100,
      y: selectedNode.position.y - 10,
    });
    setPos({ x: screenPos.x, y: screenPos.y });
  }, [selectedNode, selectedNode?.position.x, selectedNode?.position.y, flowToScreenPosition]);

  if (!selectedNode || !pos) return null;

  const handleEdit = () => {
    setSelectedNodeId(selectedNode.id);
  };

  const handleDuplicate = () => {
    const id = getNextId();
    const newNode: AppNode = {
      ...selectedNode,
      id,
      position: { x: selectedNode.position.x + 30, y: selectedNode.position.y + 30 },
      selected: false,
    };
    useProjectStore.setState((state) => ({ nodes: [...state.nodes, newNode] }));
  };

  const handleDelete = () => {
    removeNode(selectedNode.id);
  };

  // Clamp position within viewport
  const clampedX = Math.max(8, Math.min(pos.x - 60, window.innerWidth - 128));
  const clampedY = Math.max(8, pos.y - 48);

  return (
    <div
      className="fixed z-40 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-1"
      style={{ left: clampedX, top: clampedY }}
    >
      <button
        onClick={handleEdit}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
          text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      <button
        onClick={handleDuplicate}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
          text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700"
      >
        <Copy className="w-3.5 h-3.5" />
        Copy
      </button>
      <button
        onClick={handleDelete}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
          text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/30"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
