'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { type CanvasNodeData } from '@/lib/types';

function CommandNodeComponent({ id, data, selected }: NodeProps) {
  return <BaseNode id={id} data={data as CanvasNodeData} selected={selected} />;
}

export const CommandNode = memo(CommandNodeComponent);
