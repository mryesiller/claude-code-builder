import { type AppNode } from '@/store/useProjectStore';
import { type Edge } from '@xyflow/react';
import {
  type AgentData, type SkillData, type McpData,
  type ChefData, type HookData, type ClaudeNodeType,
} from './types';

export interface ValidationWarning {
  nodeId: string;
  nodeLabel: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export function validateProject(nodes: AppNode[], edges: Edge[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Check for Chef node
  const chefNodes = nodes.filter((n) => n.data.nodeType === 'chef');
  if (chefNodes.length === 0 && nodes.length > 0) {
    warnings.push({
      nodeId: '',
      nodeLabel: 'Project',
      severity: 'warning',
      message: 'No Chef (Orchestrator) node. Add one to generate CLAUDE.md and settings.',
    });
  }
  if (chefNodes.length > 1) {
    warnings.push({
      nodeId: chefNodes[1].id,
      nodeLabel: chefNodes[1].data.label,
      severity: 'error',
      message: 'Multiple Chef nodes detected. Only one orchestrator is allowed.',
    });
  }

  // Check each node
  nodes.forEach((node) => {
    const { nodeType, config, label } = node.data;

    // Agent validations
    if (nodeType === 'agent') {
      const agent = config as AgentData;
      if (!agent.name || agent.name === '') {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'error', message: 'Agent name is required.' });
      }
      if (!agent.description) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'warning', message: 'Agent missing description — Claude won\'t know when to delegate.' });
      }
      if (agent.persona.length < 20) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'warning', message: 'Agent persona is very short. Add detailed instructions.' });
      }
      if (agent.tools.length === 0) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'info', message: 'Agent has no tools. It won\'t be able to read or write files.' });
      }
      // Check if agent is connected to chef
      const connectedToChef = edges.some(
        (e) => e.source === node.id && chefNodes.some((c) => c.id === e.target)
      );
      if (!connectedToChef && chefNodes.length > 0) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'info', message: 'Agent not connected to Chef. It will still be exported but won\'t be orchestrated.' });
      }
    }

    // Skill validations
    if (nodeType === 'skill') {
      const skill = config as SkillData;
      if (!skill.name) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'error', message: 'Skill name is required.' });
      }
      if (skill.content.length < 10) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'warning', message: 'Skill content is very short. Add instructions.' });
      }
      if (skill.context === 'fork' && !skill.agent) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'warning', message: 'Fork context without agent type. Specify which agent to fork as.' });
      }
    }

    // MCP validations
    if (nodeType === 'mcp') {
      const mcp = config as McpData;
      if (!mcp.serverName) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'error', message: 'MCP server name is required.' });
      }
      if (mcp.type === 'stdio' && !mcp.command) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'error', message: 'stdio MCP requires a command.' });
      }
      if ((mcp.type === 'http' || mcp.type === 'sse' || mcp.type === 'ws') && !mcp.url) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'error', message: `${mcp.type} MCP requires a URL.` });
      }
    }

    // Hook validations
    if (nodeType === 'hook') {
      const hook = config as HookData;
      if (hook.hookType === 'command' && !hook.command) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'error', message: 'Command hook requires a command path.' });
      }
      if (hook.hookType === 'http' && !hook.url) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'error', message: 'HTTP hook requires a URL.' });
      }
      if ((hook.hookType === 'prompt' || hook.hookType === 'agent') && !hook.prompt) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'warning', message: 'Prompt/agent hook has no prompt text.' });
      }
    }

    // Chef validations
    if (nodeType === 'chef') {
      const chef = config as ChefData;
      if (chef.persona.length < 20) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'warning', message: 'CLAUDE.md content is very short. Add project conventions and architecture.' });
      }
    }

    // Check for disconnected nodes (except chef)
    if (nodeType !== 'chef') {
      const hasConnection = edges.some(
        (e) => e.source === node.id || e.target === node.id
      );
      if (!hasConnection) {
        warnings.push({ nodeId: node.id, nodeLabel: label, severity: 'info', message: `${nodeType} node is not connected to anything.` });
      }
    }
  });

  // Check for duplicate names
  const agentNames = nodes
    .filter((n) => n.data.nodeType === 'agent')
    .map((n) => (n.data.config as AgentData).name);
  const duplicateAgents = agentNames.filter((name, idx) => agentNames.indexOf(name) !== idx);
  duplicateAgents.forEach((name) => {
    warnings.push({
      nodeId: '',
      nodeLabel: name,
      severity: 'error',
      message: `Duplicate agent name: "${name}". Agent names must be unique.`,
    });
  });

  const skillNames = nodes
    .filter((n) => n.data.nodeType === 'skill')
    .map((n) => (n.data.config as SkillData).name);
  const duplicateSkills = skillNames.filter((name, idx) => skillNames.indexOf(name) !== idx);
  duplicateSkills.forEach((name) => {
    warnings.push({
      nodeId: '',
      nodeLabel: name,
      severity: 'error',
      message: `Duplicate skill name: "${name}". Skill names must be unique.`,
    });
  });

  // Check for duplicate MCP server names
  const mcpNames = nodes
    .filter((n) => n.data.nodeType === 'mcp')
    .map((n) => (n.data.config as McpData).serverName);
  const duplicateMcps = mcpNames.filter((name, idx) => mcpNames.indexOf(name) !== idx);
  duplicateMcps.forEach((name) => {
    warnings.push({
      nodeId: '',
      nodeLabel: name,
      severity: 'error',
      message: `Duplicate MCP server name: "${name}". Server names must be unique.`,
    });
  });

  return warnings;
}
