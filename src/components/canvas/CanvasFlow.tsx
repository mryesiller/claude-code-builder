'use client';

import { useCallback, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type Connection,
  type Edge,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import { DeletableEdge } from './DeletableEdge';
import { NodeContextMenu, useContextMenu } from './NodeContextMenu';

const edgeTypes = { deletable: DeletableEdge };
import { useProjectStore, type AppNode, type AppEdge } from '@/store/useProjectStore';
import { isValidConnection as checkValid } from '@/lib/connectionRules';
import { getConnectionEffect } from '@/lib/connectionRules';
import { type ClaudeNodeType } from '@/lib/types';
import { NODE_TYPES } from '@/lib/constants';
import { getLayoutedElements } from '@/hooks/useAutoLayout';
import { getNextId } from '@/lib/templates';
import { Button } from '@/components/ui/button';

function CanvasFlowInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const nodes = useProjectStore((s) => s.nodes);
  const edges = useProjectStore((s) => s.edges);
  const onNodesChange = useProjectStore((s) => s.onNodesChange);
  const onEdgesChange = useProjectStore((s) => s.onEdgesChange);
  const onConnect = useProjectStore((s) => s.onConnect);
  const addNode = useProjectStore((s) => s.addNode);
  const removeNode = useProjectStore((s) => s.removeNode);
  const { contextMenu, onNodeContextMenu, closeContextMenu } = useContextMenu();

  const isValidConnectionFn = useCallback(
    (connection: Connection | Edge) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;
      if (connection.source === connection.target) return false;

      // Enforce handle direction: source must use a source handle, target must use a target handle
      const sourceHandle = (connection as Connection).sourceHandle;
      const targetHandle = (connection as Connection).targetHandle;
      if (sourceHandle && !sourceHandle.includes('source')) return false;
      if (targetHandle && !targetHandle.includes('target')) return false;

      return checkValid(
        sourceNode.data.nodeType as ClaudeNodeType,
        targetNode.data.nodeType as ClaudeNodeType
      );
    },
    [nodes]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/claude-node-type') as ClaudeNodeType;
      if (!type || !NODE_TYPES[type]) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'TB'
    );
    useProjectStore.setState({ nodes: layoutedNodes, edges: layoutedEdges });
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [nodes, edges, fitView]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMod = event.metaKey || event.ctrlKey;

      // Undo: Ctrl+Z
      if (isMod && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        useProjectStore.temporal.getState().undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((isMod && event.key === 'z' && event.shiftKey) || (isMod && event.key === 'y')) {
        event.preventDefault();
        useProjectStore.temporal.getState().redo();
        return;
      }

      // Duplicate: Ctrl+D
      if (isMod && event.key === 'd') {
        event.preventDefault();
        const selectedNodes = nodes.filter((n) => n.selected);
        for (const node of selectedNodes) {
          const id = getNextId();
          const newNode: AppNode = {
            ...node,
            id,
            position: { x: node.position.x + 30, y: node.position.y + 30 },
            selected: false,
          };
          useProjectStore.setState((state) => ({
            nodes: [...state.nodes, newNode],
          }));
        }
        return;
      }

      // Delete
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((n) => n.selected);
        selectedNodes.forEach((n) => removeNode(n.id));
      }
    },
    [nodes, removeNode]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow<AppNode, AppEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnectionFn}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode={['Delete', 'Backspace']}
        className="bg-gray-50 dark:bg-gray-950"
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#94a3b8' },
          type: 'deletable',
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!text-gray-300 dark:!text-gray-700" />
        <Controls className="!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-600 !rounded-lg !shadow-sm [&>button]:!bg-white dark:[&>button]:!bg-gray-800 [&>button]:!border-gray-200 dark:[&>button]:!border-gray-600 [&>button]:!text-gray-700 dark:[&>button]:!text-gray-200 [&>button]:hover:!bg-gray-100 dark:[&>button]:hover:!bg-gray-700 [&_svg]:!fill-gray-700 dark:[&_svg]:!fill-gray-200" />
        <MiniMap
          nodeStrokeWidth={3}
          className="!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-600 !rounded-lg !shadow-sm"
          maskColor="rgba(0,0,0,0.08)"
        />

        {/* Canvas toolbar */}
        <Panel position="top-right" className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAutoLayout}
            disabled={nodes.length === 0}
            className="bg-white dark:bg-gray-800 shadow-sm"
          >
            Auto Layout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fitView({ padding: 0.2, duration: 300 })}
            className="bg-white dark:bg-gray-800 shadow-sm"
          >
            Fit View
          </Button>
        </Panel>

        {/* Empty state */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="mt-32">
            <div className="text-center p-8 bg-white/80 dark:bg-gray-900/80 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 shadow-sm max-w-sm">
              <p className="text-3xl mb-3">🏗️</p>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Canvas Empty</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag nodes from the left panel and drop them here.
                Start with a Chef node to build your Claude Code structure.
              </p>
            </div>
          </Panel>
        )}
      </ReactFlow>
      <NodeContextMenu
        nodeId={contextMenu.nodeId}
        position={contextMenu.position}
        onClose={closeContextMenu}
      />
    </div>
  );
}

export function CanvasFlow() {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner />
    </ReactFlowProvider>
  );
}
