'use client';

import { LayoutGrid, PlusCircle, FolderTree } from 'lucide-react';

export type MobileTab = 'canvas' | 'palette' | 'tree';

const tabs: { key: MobileTab; label: string; Icon: typeof LayoutGrid }[] = [
  { key: 'canvas', label: 'Canvas', Icon: LayoutGrid },
  { key: 'palette', label: 'Add Node', Icon: PlusCircle },
  { key: 'tree', label: 'Files', Icon: FolderTree },
];

export function MobileTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}) {
  return (
    <nav className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors
              ${active
                ? 'text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400 -mt-px'
                : 'text-gray-500 dark:text-gray-400'
              }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
