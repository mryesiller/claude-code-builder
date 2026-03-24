'use client';

import { memo, type ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NODE_TYPES } from '@/lib/constants';
import { type CanvasNodeData } from '@/lib/types';
import { useProjectStore } from '@/store/useProjectStore';

interface BaseNodeProps {
  id: string;
  data: CanvasNodeData;
  selected?: boolean;
  children?: ReactNode;
}

function BaseNodeComponent({ id, data, selected, children }: BaseNodeProps) {
  const config = NODE_TYPES[data.nodeType];
  const setSelectedNodeId = useProjectStore((s) => s.setSelectedNodeId);
  const removeNode = useProjectStore((s) => s.removeNode);
  const edges = useProjectStore((s) => s.edges);

  const incomingCount = edges.filter((e) => e.target === id).length;
  const outgoingCount = edges.filter((e) => e.source === id).length;

  return (
    <div
      className={`
        group/node relative min-w-[200px] max-w-[260px] rounded-xl border-2 shadow-md
        transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-blue-400 ring-offset-2 shadow-xl scale-[1.03]' : 'hover:shadow-lg hover:scale-[1.01]'}
      `}
      style={{
        borderColor: config.color,
        backgroundColor: '#ffffff',
      }}
      onDoubleClick={() => setSelectedNodeId(id)}
    >
      {/* Delete button */}
      <button
        className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover/node:opacity-100 transition-opacity hover:bg-red-600 z-10 shadow-sm"
        onClick={(e) => { e.stopPropagation(); removeNode(id); }}
        title="Delete node"
      >
        &#x2715;
      </button>

      {/* Header */}
      <div
        className="px-3 py-2 rounded-t-[10px] flex items-center gap-2 text-white text-sm font-semibold"
        style={{ backgroundColor: config.color }}
      >
        <span className="text-base">{config.icon}</span>
        <span className="truncate flex-1">{config.label}</span>
        {(incomingCount > 0 || outgoingCount > 0) && (
          <span className="text-xs opacity-75 bg-white/20 px-1.5 py-0.5 rounded-full">
            {incomingCount + outgoingCount}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5" style={{ backgroundColor: config.bgColor, borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
        <p className="text-sm font-semibold text-gray-800 truncate">{data.label}</p>
        {children && <div className="mt-1.5">{children}</div>}
        <p className="text-[10px] text-gray-400 mt-1.5 select-none">
          Double-click to edit
        </p>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !border-2 !border-white !-top-[7px]"
        style={{ backgroundColor: config.color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !border-2 !border-white !-bottom-[7px]"
        style={{ backgroundColor: config.color }}
      />
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
