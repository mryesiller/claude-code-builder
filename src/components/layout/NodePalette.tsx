'use client';

import { type DragEvent } from 'react';
import { NODE_CATEGORIES, NODE_TYPES } from '@/lib/constants';
import { type ClaudeNodeType } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

function PaletteItem({ type }: { type: ClaudeNodeType }) {
  const config = NODE_TYPES[type];

  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData('application/claude-node-type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 px-3 py-2 rounded-md cursor-grab active:cursor-grabbing
        border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm transition-all
        bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
      style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
    >
      <span className="text-lg">{config.icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{config.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{config.description}</p>
      </div>
    </div>
  );
}

export function NodePalette({ width = 200 }: { width?: number }) {
  return (
    <div className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col flex-shrink-0" style={{ width }}>
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Node Palette</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {NODE_CATEGORIES.map((category) => (
            <div key={category.key}>
              <p className="px-1 mb-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {category.label}
              </p>
              <div className="space-y-1.5">
                {category.types.map((type) => (
                  <PaletteItem key={type} type={type} />
                ))}
              </div>
              <Separator className="mt-3" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
