'use client';

import { useState, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { MobileActionSheet } from './MobileActionSheet';

export function MobileToolbar() {
  const projectName = useProjectStore((s) => s.projectName);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <div className="h-11 shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 flex items-center gap-2">
        <span className="text-lg shrink-0">🏗️</span>
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="flex-1 h-7 text-sm min-w-0"
          placeholder="Project name"
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={() => setShowActions(true)}
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
      <MobileActionSheet open={showActions} onOpenChange={setShowActions} />
    </>
  );
}
