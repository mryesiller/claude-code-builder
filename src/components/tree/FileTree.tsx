'use client';

import { useState } from 'react';
import { type TreeEntry } from '@/lib/types';
import { useFileTree } from '@/store/selectors';
import { ScrollArea } from '@/components/ui/scroll-area';

function getIcon(entry: TreeEntry): string {
  if (entry.type === 'directory') return '📁';
  const ext = entry.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md': return '📝';
    case 'json': return '📋';
    case 'yml':
    case 'yaml': return '⚙️';
    case 'ts':
    case 'tsx': return '🔷';
    case 'js':
    case 'jsx': return '🟡';
    case 'sh': return '🖥️';
    default: return '📄';
  }
}

function TreeNode({ entry, depth = 0 }: { entry: TreeEntry; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 3);
  const isDir = entry.type === 'directory';
  const hasChildren = isDir && entry.children && entry.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 rounded hover:bg-gray-100 cursor-pointer text-sm
          ${depth === 0 ? 'font-semibold' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => isDir && setExpanded(!expanded)}
      >
        {isDir && (
          <span className="text-xs text-gray-400 w-3 text-center">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!isDir && <span className="w-3" />}
        <span className="text-sm">{getIcon(entry)}</span>
        <span className="truncate text-gray-700">{entry.name}</span>
      </div>
      {isDir && expanded && hasChildren && (
        <div>
          {entry.children!.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} entry={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree() {
  const tree = useFileTree();

  return (
    <div className="w-[280px] border-r border-gray-200 bg-white flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">File Structure</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <TreeNode entry={tree} />
        </div>
      </ScrollArea>
    </div>
  );
}
