'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type ChefData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function ChefNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as ChefData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <div className="flex flex-wrap gap-1 mt-1">
        <Badge variant="secondary" className="text-xs">{config.model}</Badge>
        <Badge variant="outline" className="text-xs">{config.permissions.mode}</Badge>
      </div>
    </BaseNode>
  );
}

export const ChefNode = memo(ChefNodeComponent);
