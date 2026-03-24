'use client';

import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { validateProject, type ValidationWarning } from '@/lib/validation';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

function SeverityIcon({ severity }: { severity: ValidationWarning['severity'] }) {
  switch (severity) {
    case 'error': return <span className="text-red-500">&#x2716;</span>;
    case 'warning': return <span className="text-amber-500">&#x26A0;</span>;
    case 'info': return <span className="text-blue-500">&#x2139;</span>;
  }
}

export function ValidationPanel() {
  const nodes = useProjectStore((s) => s.nodes);
  const edges = useProjectStore((s) => s.edges);
  const setSelectedNodeId = useProjectStore((s) => s.setSelectedNodeId);

  const warnings = useMemo(() => validateProject(nodes, edges), [nodes, edges]);

  const errorCount = warnings.filter((w) => w.severity === 'error').length;
  const warningCount = warnings.filter((w) => w.severity === 'warning').length;

  if (nodes.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={`${errorCount > 0 ? 'border-red-300 text-red-600' : warningCount > 0 ? 'border-amber-300 text-amber-600' : 'border-green-300 text-green-600'}`}
          />
        }
      >
        {errorCount > 0 && <Badge variant="destructive" className="mr-1 text-xs px-1.5">{errorCount}</Badge>}
        {warningCount > 0 && <Badge className="mr-1 text-xs px-1.5 bg-amber-500">{warningCount}</Badge>}
        {warnings.length === 0 ? 'Valid' : `${warnings.length} issues`}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Validation ({warnings.length} issues)</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {warnings.length === 0 && (
            <p className="text-sm text-green-600 py-4 text-center">
              All good! No validation issues found.
            </p>
          )}
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-sm cursor-pointer hover:shadow-sm transition-shadow ${
                  w.severity === 'error' ? 'border-red-200 bg-red-50' :
                  w.severity === 'warning' ? 'border-amber-200 bg-amber-50' :
                  'border-blue-200 bg-blue-50'
                }`}
                onClick={() => {
                  if (w.nodeId) setSelectedNodeId(w.nodeId);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <SeverityIcon severity={w.severity} />
                  <span className="font-medium text-gray-800">{w.nodeLabel}</span>
                </div>
                <p className="text-gray-600 ml-5">{w.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
