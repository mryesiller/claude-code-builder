'use client';

import { memo, type ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NODE_TYPES } from '@/lib/constants';
import { type CanvasNodeData, type ClaudeNodeType } from '@/lib/types';
import { useProjectStore } from '@/store/useProjectStore';

// Handle configuration per node type:
// Chef: bottom-target only (agents connect up to it)
// Agent/Team: top-source (connects to chef) + bottom-target (receives children)
// Leaf nodes: top-source only (connects up to agent/chef)
type HandleConfig = { topSource?: boolean; topTarget?: boolean; bottomSource?: boolean; bottomTarget?: boolean };
const HANDLE_CONFIG: Record<ClaudeNodeType, HandleConfig> = {
  chef:    { bottomTarget: true },
  agent:   { topSource: true, bottomTarget: true },
  team:    { topSource: true, bottomTarget: true },
  skill:   { topSource: true },
  command: { topSource: true },
  tool:    { topSource: true },
  mcp:     { topSource: true },
  hook:    { topSource: true },
  memory:  { topSource: true },
  log:     { topSource: true },
  rule:    { topSource: true },
  env:     { topSource: true },
  plugin:  { topSource: true },
};

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
  const nodes = useProjectStore((s) => s.nodes);

  const incomingEdges = edges.filter((e) => e.target === id);
  const outgoingEdges = edges.filter((e) => e.source === id);
  const handles = HANDLE_CONFIG[data.nodeType] || {};

  // Get connected node labels for badges
  const incomingLabels = incomingEdges.map((e) => {
    const n = nodes.find((node) => node.id === e.source);
    return n ? { type: n.data.nodeType, label: n.data.label } : null;
  }).filter(Boolean) as { type: ClaudeNodeType; label: string }[];

  const outgoingLabels = outgoingEdges.map((e) => {
    const n = nodes.find((node) => node.id === e.target);
    return n ? { type: n.data.nodeType, label: n.data.label } : null;
  }).filter(Boolean) as { type: ClaudeNodeType; label: string }[];

  return (
    <div
      className={`
        group/node relative min-w-[200px] max-w-[280px] rounded-xl border-2 shadow-md
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
      </div>

      {/* Body */}
      <div className="px-3 py-2.5" style={{ backgroundColor: config.bgColor, borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{data.label}</p>
        {children && <div className="mt-1.5">{children}</div>}

        {/* Connection badges */}
        {incomingLabels.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {incomingLabels.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                {NODE_TYPES[item.type]?.icon} {item.label}
              </span>
            ))}
          </div>
        )}
        {outgoingLabels.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {outgoingLabels.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                {NODE_TYPES[item.type]?.icon} {item.label}
              </span>
            ))}
          </div>
        )}

        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 select-none">
          Double-click to edit
        </p>
      </div>

      {/* Handles — direction-aware per node type */}
      {handles.topSource && (
        <Handle
          type="source"
          position={Position.Top}
          id="top-source"
          className="!w-3.5 !h-3.5 !border-2 !border-white !-top-[7px]"
          style={{ backgroundColor: config.color }}
        />
      )}
      {handles.topTarget && (
        <Handle
          type="target"
          position={Position.Top}
          id="top-target"
          className="!w-3.5 !h-3.5 !border-2 !border-white !-top-[7px]"
          style={{ backgroundColor: config.color }}
        />
      )}
      {handles.bottomSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
          className="!w-3.5 !h-3.5 !border-2 !border-white !-bottom-[7px]"
          style={{ backgroundColor: config.color }}
        />
      )}
      {handles.bottomTarget && (
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom-target"
          className="!w-3.5 !h-3.5 !border-2 !border-white !-bottom-[7px]"
          style={{ backgroundColor: config.color }}
        />
      )}
    </div>
  );
}

export const BaseNode = memo(BaseNodeComponent);
