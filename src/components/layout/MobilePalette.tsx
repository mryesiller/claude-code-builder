'use client';

import { NODE_CATEGORIES, NODE_TYPES } from '@/lib/constants';
import { type ClaudeNodeType } from '@/lib/types';
import { useProjectStore } from '@/store/useProjectStore';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';

function MobilePaletteItem({
  type,
  onAdd,
}: {
  type: ClaudeNodeType;
  onAdd: (type: ClaudeNodeType) => void;
}) {
  const config = NODE_TYPES[type];

  return (
    <button
      onClick={() => onAdd(type)}
      className="flex items-center gap-3 w-full px-3 py-3 rounded-lg
        border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500
        bg-white dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-750
        transition-colors text-left min-h-[48px]"
      style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
    >
      <span className="text-xl">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{config.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{config.description}</p>
      </div>
      <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
    </button>
  );
}

export function MobilePalette({ onNodeAdded }: { onNodeAdded?: () => void }) {
  const addNode = useProjectStore((s) => s.addNode);
  const nodes = useProjectStore((s) => s.nodes);

  const handleAdd = (type: ClaudeNodeType) => {
    // Compute position: below lowest node or center
    let position = { x: 200, y: 200 };
    if (nodes.length > 0) {
      const maxY = Math.max(...nodes.map((n) => n.position.y));
      const avgX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;
      position = { x: avgX, y: maxY + 150 };
    }
    addNode(type, position);
    onNodeAdded?.();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Add Node</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tap a node type to add it to the canvas</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-4 pb-6">
          {NODE_CATEGORIES.map((category) => (
            <div key={category.key}>
              <p className="px-1 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {category.label}
              </p>
              <div className="space-y-2">
                {category.types.map((type) => (
                  <MobilePaletteItem key={type} type={type} onAdd={handleAdd} />
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
