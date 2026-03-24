'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type LogData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function LogNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as LogData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <Badge variant="outline" className="text-xs mt-1">{config.format}</Badge>
    </BaseNode>
  );
}

export const LogNode = memo(LogNodeComponent);
