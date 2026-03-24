'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type ToolData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function ToolNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as ToolData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <Badge
        variant={config.scope === 'allow' ? 'secondary' : 'destructive'}
        className="text-xs mt-1"
      >
        {config.scope}
      </Badge>
    </BaseNode>
  );
}

export const ToolNode = memo(ToolNodeComponent);
