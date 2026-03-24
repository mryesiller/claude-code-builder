'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { NODE_TYPES } from '@/lib/constants';
import { type ClaudeNodeType } from '@/lib/types';
import { createDefaultNodeData, getDefaultLabel, getNextId } from '@/lib/templates';
import { type AppNode } from '@/store/useProjectStore';

interface ContextMenuProps {
  nodeId: string | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export function NodeContextMenu({ nodeId, position, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const nodes = useProjectStore((s) => s.nodes);
  const removeNode = useProjectStore((s) => s.removeNode);
  const setSelectedNodeId = useProjectStore((s) => s.setSelectedNodeId);

  useEffect(() => {
    const handleClick = () => onClose();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!position || !nodeId) return null;

  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const config = NODE_TYPES[node.data.nodeType];

  const handleEdit = () => {
    setSelectedNodeId(nodeId);
    onClose();
  };

  const handleDuplicate = () => {
    const id = getNextId();
    const newNode: AppNode = {
      ...node,
      id,
      position: { x: node.position.x + 30, y: node.position.y + 30 },
      selected: false,
    };
    useProjectStore.setState((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    onClose();
  };

  const handleDelete = () => {
    removeNode(nodeId);
    onClose();
  };

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 border-b border-gray-100">
        {config.icon} {node.data.label}
      </div>
      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
        onClick={handleEdit}
      >
        <span className="text-gray-400">&#x270E;</span> Edit
        <span className="ml-auto text-xs text-gray-400">Dbl-click</span>
      </button>
      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
        onClick={handleDuplicate}
      >
        <span className="text-gray-400">&#x2398;</span> Duplicate
        <span className="ml-auto text-xs text-gray-400">Ctrl+D</span>
      </button>
      <div className="border-t border-gray-100 my-1" />
      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
        onClick={handleDelete}
      >
        <span>&#x2716;</span> Delete
        <span className="ml-auto text-xs text-red-400">Del</span>
      </button>
    </div>
  );
}

// Hook to manage context menu state
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string | null;
    position: { x: number; y: number } | null;
  }>({ nodeId: null, position: null });

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: AppNode) => {
      event.preventDefault();
      setContextMenu({
        nodeId: node.id,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({ nodeId: null, position: null });
  }, []);

  return { contextMenu, onNodeContextMenu, closeContextMenu };
}
