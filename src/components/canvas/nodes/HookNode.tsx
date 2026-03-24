'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type HookData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function HookNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as HookData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <div className="flex flex-wrap gap-1 mt-1">
        <Badge variant="secondary" className="text-xs">{config.hookType}</Badge>
        {config.matcher && <Badge variant="outline" className="text-xs">{config.matcher}</Badge>}
      </div>
    </BaseNode>
  );
}

export const HookNode = memo(HookNodeComponent);
