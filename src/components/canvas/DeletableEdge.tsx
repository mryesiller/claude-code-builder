'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { useProjectStore } from '@/store/useProjectStore';

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const removeEdge = useProjectStore((s) => s.removeEdge);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#3b82f6' : (style?.stroke ?? '#94a3b8'),
        }}
      />
      <EdgeLabelRenderer>
        <button
          className={`
            absolute w-5 h-5 rounded-full flex items-center justify-center
            text-[10px] leading-none cursor-pointer border shadow-sm
            transition-opacity duration-150 pointer-events-auto
            ${selected
              ? 'opacity-100 bg-red-500 text-white border-red-600 hover:bg-red-600'
              : 'opacity-0 hover:opacity-100 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-red-500 hover:text-white hover:border-red-600'
            }
          `}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            removeEdge(id);
          }}
          title="Delete connection"
        >
          ✕
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
