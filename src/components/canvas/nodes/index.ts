import { type NodeTypes } from '@xyflow/react';
import { ChefNode } from './ChefNode';
import { AgentNode } from './AgentNode';
import { SkillNode } from './SkillNode';
import { CommandNode } from './CommandNode';
import { ToolNode } from './ToolNode';
import { McpNode } from './McpNode';
import { HookNode } from './HookNode';
import { MemoryNode } from './MemoryNode';
import { LogNode } from './LogNode';
import { RuleNode } from './RuleNode';
import { PluginNode } from './PluginNode';
import { EnvNode } from './EnvNode';
import { TeamNode } from './TeamNode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nodeTypes: NodeTypes = {
  chef: ChefNode as any,
  agent: AgentNode as any,
  skill: SkillNode as any,
  command: CommandNode as any,
  tool: ToolNode as any,
  mcp: McpNode as any,
  hook: HookNode as any,
  memory: MemoryNode as any,
  log: LogNode as any,
  rule: RuleNode as any,
  plugin: PluginNode as any,
  env: EnvNode as any,
  team: TeamNode as any,
};
