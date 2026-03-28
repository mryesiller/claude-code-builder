'use client';

import { useState } from 'react';
import { NODE_CATEGORIES, NODE_TYPES } from '@/lib/constants';
import { type ClaudeNodeType } from '@/lib/types';
import { useProjectStore } from '@/store/useProjectStore';
import { Plus } from 'lucide-react';

export function MobileAddNodeSheet() {
  const [open, setOpen] = useState(false);
  const addNode = useProjectStore((s) => s.addNode);
  const nodes = useProjectStore((s) => s.nodes);

  const handleAdd = (type: ClaudeNodeType) => {
    let position = { x: 200, y: 200 };
    if (nodes.length > 0) {
      const maxY = Math.max(...nodes.map((n) => n.position.y));
      const avgX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;
      position = { x: avgX, y: maxY + 150 };
    }
    addNode(type, position);
    setOpen(false);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-40 right-4 shadow-lg rounded-full w-14 h-14 flex items-center justify-center
          bg-blue-600 dark:bg-blue-500 text-white active:bg-blue-700 dark:active:bg-blue-600
          transition-transform active:scale-95"
        style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px) + 1rem)' }}
        aria-label="Add node"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white dark:bg-gray-900 rounded-t-2xl max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            <div className="px-4 pb-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Add Node</p>

              {NODE_CATEGORIES.map((category) => (
                <div key={category.key}>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                    {category.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {category.types.map((type) => {
                      const config = NODE_TYPES[type];
                      return (
                        <button
                          key={type}
                          onClick={() => handleAdd(type)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-750
                            transition-colors text-left"
                          style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                        >
                          <span className="text-base">{config.icon}</span>
                          <span className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
