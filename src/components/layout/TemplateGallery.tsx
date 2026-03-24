'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PROJECT_TEMPLATES, type ProjectTemplate } from '@/lib/projectTemplates';
import { useProjectStore, type AppNode } from '@/store/useProjectStore';
import { getDefaultLabel, getNextId } from '@/lib/templates';
import { type ClaudeNodeType, type NodeDataMap } from '@/lib/types';

export function TemplateGallery() {
  const [open, setOpen] = useState(false);

  const applyTemplate = (template: ProjectTemplate) => {
    const store = useProjectStore.getState();

    // Create nodes
    const nodeIds: string[] = [];
    const newNodes: AppNode[] = [];

    template.nodes.forEach((nodeDef) => {
      const id = getNextId();
      nodeIds.push(id);
      const config = nodeDef.config as NodeDataMap[ClaudeNodeType];
      newNodes.push({
        id,
        type: nodeDef.type,
        position: { x: nodeDef.x, y: nodeDef.y },
        data: {
          label: getDefaultLabel(nodeDef.type, config),
          nodeType: nodeDef.type,
          config,
        },
      });
    });

    // Create edges
    const newEdges = template.edges.map((edgeDef) => ({
      id: `edge_${nodeIds[edgeDef.sourceIdx]}_${nodeIds[edgeDef.targetIdx]}`,
      source: nodeIds[edgeDef.sourceIdx],
      target: nodeIds[edgeDef.targetIdx],
    }));

    // Set project name from chef
    const chefNode = template.nodes.find((n) => n.type === 'chef');
    if (chefNode?.config && 'projectName' in chefNode.config) {
      store.setProjectName(chefNode.config.projectName as string);
    }

    // Apply
    useProjectStore.setState({
      nodes: [...store.nodes, ...newNodes],
      edges: [...store.edges, ...newEdges],
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" />}
      >
        Templates
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Project Templates</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {PROJECT_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={() => applyTemplate(template)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({
  template,
  onApply,
}: {
  template: ProjectTemplate;
  onApply: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
      onClick={onApply}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{template.icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">
            {template.name}
          </h3>
          <p className="text-xs text-gray-500">
            {template.nodes.length} nodes
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600">{template.description}</p>
    </div>
  );
}
