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
  CommandData,
  LogData,
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
  setProjectName: (name) => {
    set({ projectName: name });
    // Sync with Chef node's projectName so file tree root updates
    const { nodes } = get();
    const chefNode = nodes.find((n) => n.data.nodeType === 'chef');
    if (chefNode) {
      const updated = nodes.map((n) =>
        n.id === chefNode.id
          ? { ...n, data: { ...n.data, config: { ...n.data.config, projectName: name } } }
          : n
      );
      set({ nodes: updated });
    }
  },

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

  // Auto-update agent persona when any node connects to it
  if (targetType === 'agent') {
    // Use setTimeout to let the config updates settle first
    setTimeout(() => {
      rebuildAgentPersona(targetNode.id, get);
    }, 0);
  }

  // Auto-update chef persona when agents/skills connect to it
  if (targetType === 'chef') {
    setTimeout(() => {
      rebuildChefPersona(targetNode.id, get);
    }, 0);
  }
}

// --- Rebuild agent persona based on all connections ---
function rebuildAgentPersona(
  agentId: string,
  get: () => ProjectStore,
) {
  const { nodes, edges } = get();
  const agentNode = nodes.find((n) => n.id === agentId);
  if (!agentNode) return;

  const agent = agentNode.data.config as AgentData;
  const incoming = edges
    .filter((e) => e.target === agentId)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter(Boolean) as AppNode[];

  const skills = incoming.filter((n) => n.data.nodeType === 'skill');
  const mcps = incoming.filter((n) => n.data.nodeType === 'mcp');
  const hooks = incoming.filter((n) => n.data.nodeType === 'hook');
  const tools = incoming.filter((n) => n.data.nodeType === 'tool');
  const memories = incoming.filter((n) => n.data.nodeType === 'memory');
  const commands = incoming.filter((n) => n.data.nodeType === 'command');
  const logs = incoming.filter((n) => n.data.nodeType === 'log');

  // Preserve user-written content (everything before the auto-generated section)
  const AUTO_MARKER = '\n\n---\n<!-- auto-generated: connections -->';
  const userContent = agent.persona.split(AUTO_MARKER)[0].trim();

  const sections: string[] = [];

  if (skills.length > 0) {
    sections.push(`## Skills\n${skills.map((s) => `- **${(s.data.config as SkillData).name}**: ${(s.data.config as SkillData).description}`).join('\n')}`);
  }
  if (tools.length > 0) {
    sections.push(`## Tools\n${tools.map((t) => `- \`${(t.data.config as ToolData).pattern}\` (${(t.data.config as ToolData).scope})`).join('\n')}`);
  }
  if (mcps.length > 0) {
    sections.push(`## MCP Servers\n${mcps.map((m) => `- **${(m.data.config as McpData).serverName}** (\`${(m.data.config as McpData).type}\`)`).join('\n')}`);
  }
  if (hooks.length > 0) {
    sections.push(`## Hooks\n${hooks.map((h) => `- \`${(h.data.config as HookData).event}\`${(h.data.config as HookData).matcher ? ` (matcher: ${(h.data.config as HookData).matcher})` : ''} → ${(h.data.config as HookData).hookType}`).join('\n')}`);
  }
  if (commands.length > 0) {
    sections.push(`## Commands\n${commands.map((c) => `- \`/${(c.data.config as CommandData).name}\`: ${(c.data.config as CommandData).description}`).join('\n')}`);
  }
  if (memories.length > 0) {
    sections.push(`## Memory\n- Scope: \`${(memories[0].data.config as MemoryData).scope}\``);
  }
  if (logs.length > 0) {
    sections.push(`## Logging\n${logs.map((l) => `- Log directory: \`${(l.data.config as LogData).directory}\``).join('\n')}`);
  }

  if (sections.length === 0) return;

  const autoContent = `${AUTO_MARKER}\n\n${sections.join('\n\n')}`;
  const newPersona = `${userContent}${autoContent}`;

  if (newPersona !== agent.persona) {
    get().updateNodeConfig(agentId, { persona: newPersona } as Partial<AgentData>);
  }
}

// --- Rebuild chef persona based on all connections ---
function rebuildChefPersona(
  chefId: string,
  get: () => ProjectStore,
) {
  const { nodes, edges } = get();
  const chefNode = nodes.find((n) => n.id === chefId);
  if (!chefNode) return;

  const chef = chefNode.data.config as import('@/lib/types').ChefData;
  const incoming = edges
    .filter((e) => e.target === chefId)
    .map((e) => nodes.find((n) => n.id === e.source))
    .filter(Boolean) as AppNode[];

  const agents = incoming.filter((n) => n.data.nodeType === 'agent');
  const teams = incoming.filter((n) => n.data.nodeType === 'team');
  const skills = incoming.filter((n) => n.data.nodeType === 'skill');
  const commands = incoming.filter((n) => n.data.nodeType === 'command');
  const mcps = incoming.filter((n) => n.data.nodeType === 'mcp');
  const hooks = incoming.filter((n) => n.data.nodeType === 'hook');
  const rules = incoming.filter((n) => n.data.nodeType === 'rule');

  const AUTO_MARKER = '\n\n---\n<!-- auto-generated: connections -->';
  const userContent = chef.persona.split(AUTO_MARKER)[0].trim();

  const sections: string[] = [];

  if (agents.length > 0) {
    sections.push(`## Agents\n${agents.map((a) => {
      const agentCfg = a.data.config as AgentData;
      return `- **${agentCfg.name}**: ${agentCfg.description || 'No description'}`;
    }).join('\n')}`);
  }
  if (teams.length > 0) {
    sections.push(`## Teams\n${teams.map((t) => `- **${(t.data.config as TeamData).name}**`).join('\n')}`);
  }
  if (skills.length > 0) {
    sections.push(`## Skills\n${skills.map((s) => `- **${(s.data.config as SkillData).name}**: ${(s.data.config as SkillData).description}`).join('\n')}`);
  }
  if (commands.length > 0) {
    sections.push(`## Commands\n${commands.map((c) => `- \`/${(c.data.config as CommandData).name}\`: ${(c.data.config as CommandData).description}`).join('\n')}`);
  }
  if (mcps.length > 0) {
    sections.push(`## MCP Servers\n${mcps.map((m) => `- **${(m.data.config as McpData).serverName}** (\`${(m.data.config as McpData).type}\`)`).join('\n')}`);
  }
  if (hooks.length > 0) {
    sections.push(`## Hooks\n${hooks.map((h) => `- \`${(h.data.config as HookData).event}\` → ${(h.data.config as HookData).hookType}`).join('\n')}`);
  }
  if (rules.length > 0) {
    sections.push(`## Rules\n${rules.map((r) => `- ${r.data.label}`).join('\n')}`);
  }

  if (sections.length === 0) return;

  const autoContent = `${AUTO_MARKER}\n\n${sections.join('\n\n')}`;
  const newPersona = `${userContent}${autoContent}`;

  if (newPersona !== chef.persona) {
    get().updateNodeConfig(chefId, { persona: newPersona } as Partial<import('@/lib/types').ChefData>);
  }
}

// --- Rebuild all connections and personas after template load ---
export function rebuildAllPersonas() {
  const get = () => useProjectStore.getState();
  const set = (partial: Partial<ProjectStore> | ((state: ProjectStore) => Partial<ProjectStore>)) => {
    useProjectStore.setState(partial as Partial<ProjectStore>);
  };

  // First, replay all connection side effects so agent configs
  // (skillNames, mcpServerNames, hooks, etc.) are populated
  const { nodes, edges } = get();
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (sourceNode && targetNode) {
      applyConnectionSideEffect(sourceNode, targetNode, get, set);
    }
  });

  // Then rebuild all personas (after side effects settle)
  setTimeout(() => {
    const latest = get();
    latest.nodes
      .filter((n) => n.data.nodeType === 'agent')
      .forEach((n) => rebuildAgentPersona(n.id, get));

    latest.nodes
      .filter((n) => n.data.nodeType === 'chef')
      .forEach((n) => rebuildChefPersona(n.id, get));
  }, 10);
}
