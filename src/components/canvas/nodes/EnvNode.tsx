'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type EnvData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function EnvNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as EnvData;
  const count = Object.keys(config.variables).length;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <Badge variant="secondary" className="text-xs mt-1">{count} vars</Badge>
    </BaseNode>
  );
}

export const EnvNode = memo(EnvNodeComponent);
