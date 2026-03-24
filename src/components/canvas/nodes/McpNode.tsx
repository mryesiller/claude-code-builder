'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type McpData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function McpNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as McpData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <Badge variant="outline" className="text-xs mt-1">{config.type}</Badge>
    </BaseNode>
  );
}

export const McpNode = memo(McpNodeComponent);
