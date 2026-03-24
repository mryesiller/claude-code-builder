'use client';

import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import {
  ClaudeNodeType,
  CanvasNodeData,
  ChatMessage,
  NodeDataMap,
  AgentData,
  SkillData,
  McpData,
  HookData,
  MemoryData,
  ToolData,
  TeamData,
} from '@/lib/types';
import { createDefaultNodeData, getDefaultLabel, getNextId } from '@/lib/templates';
import { isValidConnection } from '@/lib/connectionRules';
import { NODE_TYPES } from '@/lib/constants';

export type AppNode = Node<CanvasNodeData>;
export type AppEdge = Edge;

interface ProjectStore {
  // Project
  projectName: string;
  setProjectName: (name: string) => void;

  // Nodes
  nodes: AppNode[];
  onNodesChange: OnNodesChange<AppNode>;
  addNode: (type: ClaudeNodeType, position: { x: number; y: number }) => string;
  updateNodeConfig: (id: string, config: Partial<NodeDataMap[ClaudeNodeType]>) => void;
  removeNode: (id: string) => void;

  // Edges
  edges: AppEdge[];
  onEdgesChange: OnEdgesChange<AppEdge>;
  onConnect: (connection: Connection) => void;
  removeEdge: (id: string) => void;

  // Selected node for editor
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;

  // Export
  isExporting: boolean;
  setIsExporting: (v: boolean) => void;
}

export const useProjectStore = create<ProjectStore>()(temporal((set, get) => ({
  // --- Project ---
  projectName: 'my-project',
  setProjectName: (name) => set({ projectName: name }),

  // --- Nodes ---
  nodes: [],
  onNodesChange: (changes) => {
    const removeIds = changes
      .filter((c) => c.type === 'remove')
      .map((c) => c.id);
    const newNodes = applyNodeChanges(changes, get().nodes);
    if (removeIds.length > 0) {
      set({
        nodes: newNodes,
        edges: get().edges.filter((e) => !removeIds.includes(e.source) && !removeIds.includes(e.target)),
      });
    } else {
      set({ nodes: newNodes });
    }
  },
  addNode: (type, position) => {
    const id = getNextId();
    const config = createDefaultNodeData(type);
    const label = getDefaultLabel(type, config);
    const nodeConfig = NODE_TYPES[type];

    const newNode: AppNode = {
      id,
      type,
      position,
      data: {
        label,
        nodeType: type,
        config,
      },
    };

    set({ nodes: [...get().nodes, newNode] });
    return id;
  },
  updateNodeConfig: (id, configUpdate) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id !== id) return node;
        const newConfig = { ...node.data.config, ...configUpdate } as NodeDataMap[ClaudeNodeType];
        const newLabel = getDefaultLabel(node.data.nodeType, newConfig);
        return {
          ...node,
          data: {
            ...node.data,
            config: newConfig,
            label: newLabel,
          },
        } as AppNode;
      }),
    });
  },
  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  // --- Edges ---
  edges: [],
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    const { nodes, edges } = get();
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    if (!sourceNode || !targetNode) return;

    const sourceType = sourceNode.data.nodeType;
    const targetType = targetNode.data.nodeType;

    if (!isValidConnection(sourceType, targetType)) return;

    // Check for duplicate edges
    const duplicate = edges.some(
      (e) => e.source === connection.source && e.target === connection.target
    );
    if (duplicate) return;

    const newEdge: AppEdge = {
      id: `edge_${connection.source}_${connection.target}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
    };

    set({ edges: [...edges, newEdge] });

    // Apply side effects
    applyConnectionSideEffect(sourceNode, targetNode, get, set);
  },
  removeEdge: (id) => {
    set({ edges: get().edges.filter((e) => e.id !== id) });
  },

  // --- Selected Node ---
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // --- Chat ---
  chatMessages: [],
  addChatMessage: (msg) => set({ chatMessages: [...get().chatMessages, msg] }),
  clearChat: () => set({ chatMessages: [] }),
  apiKey: '',
  setApiKey: (key) => set({ apiKey: key }),

  // --- Export ---
  isExporting: false,
  setIsExporting: (v) => set({ isExporting: v }),
}), {
  partialize: (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    projectName: state.projectName,
  }),
  limit: 50,
}));

// --- Connection Side Effects ---
function applyConnectionSideEffect(
  sourceNode: AppNode,
  targetNode: AppNode,
  get: () => ProjectStore,
  set: (partial: Partial<ProjectStore> | ((state: ProjectStore) => Partial<ProjectStore>)) => void
) {
  const sourceType = sourceNode.data.nodeType;
  const targetType = targetNode.data.nodeType;
  const sourceConfig = sourceNode.data.config;
  const targetConfig = targetNode.data.config;

  // Skill → Agent: add skill to agent's skillNames
  if (sourceType === 'skill' && targetType === 'agent') {
    const skill = sourceConfig as SkillData;
    const agent = targetConfig as AgentData;
    if (!agent.skillNames.includes(skill.name)) {
      get().updateNodeConfig(targetNode.id, {
        skillNames: [...agent.skillNames, skill.name],
      } as Partial<AgentData>);
    }
  }

  // MCP → Agent: add to mcpServerNames
  if (sourceType === 'mcp' && targetType === 'agent') {
    const mcp = sourceConfig as McpData;
    const agent = targetConfig as AgentData;
    if (!agent.mcpServerNames.includes(mcp.serverName)) {
      get().updateNodeConfig(targetNode.id, {
        mcpServerNames: [...agent.mcpServerNames, mcp.serverName],
      } as Partial<AgentData>);
    }
  }

  // Hook → Agent: merge into agent hooks
  if (sourceType === 'hook' && targetType === 'agent') {
    const hook = sourceConfig as HookData;
    const agent = targetConfig as AgentData;
    const existingHooks = { ...agent.hooks };
    const eventHooks = existingHooks[hook.event] || [];
    existingHooks[hook.event] = [
      ...eventHooks,
      {
        matcher: hook.matcher,
        hooks: [{
          type: hook.hookType,
          command: hook.command,
          url: hook.url,
          prompt: hook.prompt,
          timeout: hook.timeout,
        }],
      },
    ];
    get().updateNodeConfig(targetNode.id, {
      hooks: existingHooks,
    } as Partial<AgentData>);
  }

  // Memory → Agent: set memory scope
  if (sourceType === 'memory' && targetType === 'agent') {
    const mem = sourceConfig as MemoryData;
    get().updateNodeConfig(targetNode.id, {
      memory: mem.scope,
    } as Partial<AgentData>);
  }

  // Tool → Agent: add to tools or disallowedTools
  if (sourceType === 'tool' && targetType === 'agent') {
    const tool = sourceConfig as ToolData;
    const agent = targetConfig as AgentData;
    if (tool.scope === 'allow' && !agent.tools.includes(tool.pattern)) {
      get().updateNodeConfig(targetNode.id, {
        tools: [...agent.tools, tool.pattern],
      } as Partial<AgentData>);
    } else if (tool.scope === 'deny' && !agent.disallowedTools.includes(tool.pattern)) {
      get().updateNodeConfig(targetNode.id, {
        disallowedTools: [...agent.disallowedTools, tool.pattern],
      } as Partial<AgentData>);
    }
  }

  // Agent → Team: add to team's agentNames
  if (sourceType === 'agent' && targetType === 'team') {
    const agent = sourceConfig as AgentData;
    const team = targetConfig as TeamData;
    if (!team.agentNames.includes(agent.name)) {
      get().updateNodeConfig(targetNode.id, {
        agentNames: [...team.agentNames, agent.name],
      } as Partial<TeamData>);
    }
  }
}
