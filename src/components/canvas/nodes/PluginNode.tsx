'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type PluginData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function PluginNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as PluginData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <Badge variant="outline" className="text-xs mt-1">v{config.version}</Badge>
    </BaseNode>
  );
}

export const PluginNode = memo(PluginNodeComponent);
