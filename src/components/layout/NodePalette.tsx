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
        border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all
        bg-white hover:bg-gray-50"
      style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
    >
      <span className="text-lg">{config.icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{config.label}</p>
        <p className="text-xs text-gray-500 truncate">{config.description}</p>
      </div>
    </div>
  );
}

export function NodePalette() {
  return (
    <div className="w-[200px] border-r border-gray-200 bg-white flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">Node Palette</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {NODE_CATEGORIES.map((category) => (
            <div key={category.key}>
              <p className="px-1 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
