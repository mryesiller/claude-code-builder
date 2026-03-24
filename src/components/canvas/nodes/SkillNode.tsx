'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData, type SkillData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

function SkillNodeComponent({ id, data, selected }: NodeProps) {
  const config = data.config as SkillData;
  return (
    <BaseNode id={id} data={data as CanvasNodeData} selected={selected}>
      <div className="flex flex-wrap gap-1 mt-1">
        {config.userInvocable && <Badge variant="secondary" className="text-xs">/{config.name}</Badge>}
        {config.context === 'fork' && <Badge variant="outline" className="text-xs">fork</Badge>}
      </div>
    </BaseNode>
  );
}

export const SkillNode = memo(SkillNodeComponent);
