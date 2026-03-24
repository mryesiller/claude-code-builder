'use client';

import { useState, useCallback } from 'react';
import { type TreeEntry } from '@/lib/types';
import { useFileTree } from '@/store/selectors';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

function TreeNode({ entry, depth = 0, onFileClick }: { entry: TreeEntry; depth?: number; onFileClick?: (entry: TreeEntry) => void }) {
  const [expanded, setExpanded] = useState(depth < 3);
  const isDir = entry.type === 'directory';
  const hasChildren = isDir && entry.children && entry.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm
          ${depth === 0 ? 'font-semibold' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => {
          if (isDir) setExpanded(!expanded);
          else if (onFileClick && entry.content !== undefined) onFileClick(entry);
        }}
      >
        {isDir && (
          <span className="text-xs text-gray-400 dark:text-gray-500 w-3 text-center">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!isDir && <span className="w-3" />}
        <span className="text-sm">{getIcon(entry)}</span>
        <span className="truncate text-gray-700 dark:text-gray-300">{entry.name}</span>
      </div>
      {isDir && expanded && hasChildren && (
        <div>
          {entry.children!.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} entry={child} depth={depth + 1} onFileClick={onFileClick} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ width = 260 }: { width?: number }) {
  const tree = useFileTree();
  const [previewFile, setPreviewFile] = useState<TreeEntry | null>(null);

  const onFileClick = useCallback((entry: TreeEntry) => {
    setPreviewFile(entry);
  }, []);

  return (
    <div className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col flex-shrink-0" style={{ width }}>
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">File Structure</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <TreeNode entry={tree} onFileClick={onFileClick} />
        </div>
      </ScrollArea>

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-3xl w-[80vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono text-sm">
              <span>{previewFile ? getIcon(previewFile) : ''}</span>
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-auto max-h-[60vh] whitespace-pre-wrap">
            {previewFile?.content || '(empty)'}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
