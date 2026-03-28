'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NODE_TYPES } from '@/lib/constants';
import { AgentEditor } from './AgentEditor';
import { ChefEditor } from './ChefEditor';
import { SkillEditor } from './SkillEditor';
import { HookEditor } from './HookEditor';
import { McpEditor } from './McpEditor';
import { GenericEditor } from './GenericEditor';

export function NodeEditorDialog() {
  const selectedNodeId = useProjectStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useProjectStore((s) => s.setSelectedNodeId);
  const nodes = useProjectStore((s) => s.nodes);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  if (!selectedNode) return null;

  const nodeConfig = NODE_TYPES[selectedNode.data.nodeType];

  const renderEditor = () => {
    switch (selectedNode.data.nodeType) {
      case 'chef':
        return <ChefEditor nodeId={selectedNode.id} />;
      case 'agent':
        return <AgentEditor nodeId={selectedNode.id} />;
      case 'skill':
        return <SkillEditor nodeId={selectedNode.id} />;
      case 'hook':
        return <HookEditor nodeId={selectedNode.id} />;
      case 'mcp':
        return <McpEditor nodeId={selectedNode.id} />;
      default:
        return <GenericEditor nodeId={selectedNode.id} />;
    }
  };

  return (
    <Dialog open={!!selectedNodeId} onOpenChange={(open) => !open && setSelectedNodeId(null)}>
      <DialogContent className="max-w-4xl w-[calc(100%-1rem)] md:w-[90vw] max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{nodeConfig.icon}</span>
            <span>{nodeConfig.label}: {selectedNode.data.label}</span>
          </DialogTitle>
        </DialogHeader>
        {renderEditor()}
      </DialogContent>
    </Dialog>
  );
}
