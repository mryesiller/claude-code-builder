'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type RuleData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function RuleNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as RuleData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      {config.isPathSpecific && (
        <Badge variant="secondary" className="text-xs mt-1">path-specific</Badge>
      )}
    </BaseNode>
  );
}

export const RuleNode = memo(RuleNodeComponent);
