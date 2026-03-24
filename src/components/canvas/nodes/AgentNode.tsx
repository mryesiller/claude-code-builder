'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type AgentData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function AgentNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as AgentData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <div className="flex flex-wrap gap-1 mt-1">
        <Badge variant="secondary" className="text-xs">{config.model}</Badge>
        {config.skillNames.length > 0 && (
          <Badge variant="outline" className="text-xs">{config.skillNames.length} skills</Badge>
        )}
        {config.mcpServerNames.length > 0 && (
          <Badge variant="outline" className="text-xs">{config.mcpServerNames.length} MCP</Badge>
        )}
        {config.background && <Badge className="text-xs bg-amber-500">BG</Badge>}
      </div>
    </BaseNode>
  );
}

export const AgentNode = memo(AgentNodeComponent);
