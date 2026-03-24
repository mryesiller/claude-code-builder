'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type MemoryData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function MemoryNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as MemoryData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <div className="flex gap-1 mt-1">
        <Badge variant="secondary" className="text-xs">{config.scope}</Badge>
        <Badge variant="outline" className="text-xs">{config.isShared ? 'shared' : 'private'}</Badge>
      </div>
    </BaseNode>
  );
}

export const MemoryNode = memo(MemoryNodeComponent);
