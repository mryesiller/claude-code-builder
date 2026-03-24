'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type TeamData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function TeamNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as TeamData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <div className="flex gap-1 mt-1">
        <Badge variant="secondary" className="text-xs">{config.agentNames.length} agents</Badge>
        <Badge variant="outline" className="text-xs">{config.displayMode}</Badge>
      </div>
    </BaseNode>
  );
}

export const TeamNode = memo(TeamNodeComponent);
